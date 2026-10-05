/**
 * LuciProxy - Edge Proxy Dispatcher & Stream Forwarder
 * High-performance WebSocket-to-TCP socket multiplexer with 0-RTT early data negotiation,
 * RFC 3986 IPv6 literal formatting, and multi-relay connection failover.
 *
 * Independent implementation authored specifically for LuciProxy.
 */

import { parseVlessHeader } from "./vless.js";
import { parseTrojanHeader } from "./trojan.js";
import { getTrojanHash, decodeConfigUuid } from "../utils/crypto.js";
import {
    getAllProfiles,
    activeConns,
    uuidUsage,
    trackUsage,
    getEffectivePips
} from "../users/manager.js";
import {
    TCP_OPEN_TIMEOUT_MS,
    UPSTREAM_WRITE_TIMEOUT_MS,
    DOWNSTREAM_READ_TIMEOUT_MS,
    UPSTREAM_QUEUE_MAX_BYTES,
    UPSTREAM_QUEUE_MAX_ITEMS
} from "../config.js";
import {
    withDeadline,
    incrementOpenWs,
    decrementOpenWs,
    formatSocketHost,
    base64ToArrayBuffer,
    convertToNAT64IPv6
} from "../utils/helpers.js";
import {
    resolveDomainDoh,
    forwardUdpDnsPacket
} from "./dns_resolver.js";

// Pluggable socket connection factory (defaults to cloudflare:sockets)
let customSocketConnector = null;

/**
 * Injects a custom socket connector implementation for testing or local simulation.
 * @param {Function} connectorFn Function matching cloudflare:sockets connect() signature
 */
export function setSocketConnector(connectorFn) {
    customSocketConnector = connectorFn;
}

/**
 * Resolves the active socket connection provider.
 */
async function resolveConnectFunction() {
    if (customSocketConnector) return customSocketConnector;
    try {
        const socketsModule = await import("cloudflare:sockets");
        return socketsModule.connect;
    } catch {
        return null;
    }
}

/**
 * Establishes a bidirectional proxy stream over an upgraded WebSocket session.
 * @param {Request|object} reqOrEnv HTTP request or environment
 * @param {object} envOrCtx Environment bindings or execution context
 * @param {object|number} ctxOrIdx Execution context or relay index
 * @param {number|object} wsRelayIdxOrSys Relay index or system configuration
 * @param {object} [maybeSys] System configuration
 * @returns {Promise<Response>} HTTP 101 WebSocket Upgrade response
 */
export async function processTelemetryStream(reqOrEnv, envOrCtx, ctxOrIdx, wsRelayIdxOrSys, maybeSys) {
    let request = null;
    let env, ctx, relayIndex, sysConfig;

    if (reqOrEnv && typeof reqOrEnv.headers?.get === "function") {
        request = reqOrEnv;
        env = envOrCtx;
        ctx = ctxOrIdx;
        relayIndex = wsRelayIdxOrSys;
        sysConfig = maybeSys;
    } else {
        env = reqOrEnv;
        ctx = envOrCtx;
        relayIndex = ctxOrIdx;
        sysConfig = wsRelayIdxOrSys;
    }

    // Reject incoming streams when global service pause is active
    if (sysConfig?.isPaused) {
        return new Response("Service Paused", { status: 503 });
    }

    // Inspect 0-RTT early data headers or query parameters
    let earlyDataPayload = "";
    if (request) {
        earlyDataPayload = request.headers.get("sec-websocket-protocol") ||
                           request.headers.get("early-data") || "";
        if (!earlyDataPayload) {
            try {
                const reqUrl = new URL(request.url);
                const edParam = reqUrl.searchParams.get("ed");
                if (edParam && edParam.length > 20) {
                    earlyDataPayload = edParam;
                }
            } catch {}
        }
    }

    const [clientSocket, edgeSocket] = Object.values(new WebSocketPair());

    edgeSocket.accept();
    edgeSocket.binaryType = "arraybuffer";

    startDataPipe(edgeSocket, env, ctx, relayIndex, sysConfig, earlyDataPayload);

    const upgradeHeaders = new Headers();
    if (earlyDataPayload && request?.headers?.has("sec-websocket-protocol")) {
        upgradeHeaders.set("Sec-WebSocket-Protocol", earlyDataPayload);
    }

    return new Response(null, {
        status: 101,
        webSocket: clientSocket,
        headers: upgradeHeaders,
    });
}

/**
 * Initializes and drives the bidirectional stream between client WebSocket and remote TCP socket.
 */
export async function startDataPipe(webSocket, env, ctx, relayIndex, sysConfig, earlyDataPayload = "") {
    incrementOpenWs();

    let uploadedBytes = 0;
    let downloadedBytes = 0;
    let authenticatedUserKey = null;
    let remoteSocket = null;
    let socketWriter = null;
    let isInitialPacket = true;
    let processingChain = Promise.resolve();

    let pendingBytes = 0;
    let pendingItems = 0;

    const teardown = () => {
        decrementOpenWs();
        if (authenticatedUserKey) {
            const openStreams = activeConns.get(authenticatedUserKey) || 0;
            if (openStreams > 0) {
                activeConns.set(authenticatedUserKey, openStreams - 1);
            }
        }
        try {
            const totalVolumetricBytes = uploadedBytes + downloadedBytes;
            if (authenticatedUserKey && totalVolumetricBytes > 0) {
                trackUsage(authenticatedUserKey, totalVolumetricBytes, env, ctx);
            }
        } catch {}
    };

    webSocket.addEventListener("close", teardown);
    webSocket.addEventListener("error", () => {});

    let isUdpDns = false;
    let isVlessSession = false;

    async function dispatchChunk(chunkBuffer) {
        if (isInitialPacket) {
            isInitialPacket = false;
            const session = await parseAndConnect(chunkBuffer, relayIndex, sysConfig, env, ctx);
            if (!session || session.hasError) {
                try { webSocket.close(); } catch {}
                return;
            }

            authenticatedUserKey = session.activeClientHash;
            isVlessSession = Boolean(session.isVless);

            // Handle VLESS / Trojan UDP DNS (port 53) via in-worker DoH translation
            if (session.isUdpDns) {
                isUdpDns = true;
                if (session.isVless) {
                    // Send standard VLESS response header [0, 0]
                    webSocket.send(new Uint8Array([0, 0]));
                }
                if (session.firstChunk) {
                    const dnsAns = await forwardUdpDnsPacket(session.firstChunk, session.isVless, sysConfig);
                    if (dnsAns) {
                        webSocket.send(dnsAns);
                        uploadedBytes += session.firstChunk.byteLength || 0;
                        downloadedBytes += dnsAns.byteLength || 0;
                    }
                }
                return;
            }

            remoteSocket = session.remoteSocket;
            socketWriter = remoteSocket?.writable?.getWriter();

            if (session.isVless) {
                // VLESS standard response header: [0, 0]
                webSocket.send(new Uint8Array([0, 0]));
            }

            // Write initial payload data if present beyond handshake headers
            if (session.firstChunk && socketWriter) {
                await socketWriter.write(session.firstChunk);
                uploadedBytes += session.firstChunk.byteLength || 0;
            }

            // Begin reading downstream response packets from remote socket
            pumpDownstream(remoteSocket, webSocket, (chunkSize) => {
                downloadedBytes += chunkSize;
            });
        } else if (isUdpDns) {
            const dnsAns = await forwardUdpDnsPacket(chunkBuffer, isVlessSession, sysConfig);
            if (dnsAns) {
                webSocket.send(dnsAns);
                uploadedBytes += chunkBuffer.byteLength || 0;
                downloadedBytes += dnsAns.byteLength || 0;
            }
        } else if (socketWriter) {
            await withDeadline(
                socketWriter.write(chunkBuffer),
                UPSTREAM_WRITE_TIMEOUT_MS,
                () => {
                    try { remoteSocket?.close(); } catch {}
                },
                "upstream-write"
            );
            uploadedBytes += chunkBuffer.byteLength || 0;
        }
    }

    // Process 0-RTT early data if provided before first message event
    const earlyBytes = base64ToArrayBuffer(earlyDataPayload);
    if (earlyBytes && earlyBytes.byteLength > 0) {
        processingChain = processingChain
            .then(() => dispatchChunk(earlyBytes))
            .catch(() => {
                try { webSocket.close(); } catch {}
            });
    }

    webSocket.addEventListener("message", (event) => {
        const chunkSize = event.data?.byteLength || 0;
        pendingBytes += chunkSize;
        pendingItems++;

        if (pendingBytes > UPSTREAM_QUEUE_MAX_BYTES || pendingItems > UPSTREAM_QUEUE_MAX_ITEMS) {
            try { webSocket.close(); } catch {}
            return;
        }

        processingChain = processingChain.then(async () => {
            pendingBytes = Math.max(0, pendingBytes - chunkSize);
            pendingItems = Math.max(0, pendingItems - 1);
            await dispatchChunk(event.data);
        }).catch(() => {
            try { webSocket.close(); } catch {}
        });
    });
}

/**
 * Pumps downstream packets from remote TCP socket readable stream into client WebSocket.
 * Enforces an inactivity deadline that resets on each chunk received.
 */
export async function pumpDownstream(remoteSocket, clientWebSocket, onBytesTransferred, readTimeoutMs = DOWNSTREAM_READ_TIMEOUT_MS) {
    if (!remoteSocket?.readable) return;
    try {
        const socketReader = remoteSocket.readable.getReader();
        while (true) {
            let timer = null;
            const timeoutPromise = new Promise((_, reject) => {
                timer = setTimeout(() => {
                    const err = new Error(`Downstream socket read timed out after ${readTimeoutMs}ms of inactivity`);
                    err.name = "InactivityTimeoutError";
                    reject(err);
                }, readTimeoutMs);
            });

            try {
                const { value, done } = await Promise.race([
                    socketReader.read(),
                    timeoutPromise
                ]);
                if (timer) clearTimeout(timer);

                if (done) break;
                if (value) {
                    clientWebSocket.send(value);
                    if (typeof onBytesTransferred === "function") {
                        onBytesTransferred(value.byteLength || 0);
                    }
                }
            } catch (err) {
                if (timer) clearTimeout(timer);
                throw err;
            }
        }
    } catch {
        // Stream termination handled in finally
    } finally {
        try { clientWebSocket.close(); } catch {}
    }
}

/**
 * Parses VLESS or Trojan packet headers, authenticates subscriber, and initiates outbound connection.
 */
export async function parseAndConnect(rawBuffer, relayIndex, sysConfig, env, ctx) {
    const rawView = new Uint8Array(rawBuffer);
    let isVless = false;
    let destinationHost = "";
    let destinationPort = 0;
    let payloadOffset = 0;
    let subscriberToken = "";
    let isUDP = false;

    // 1. Identify protocol: VLESS version byte 0x00 vs Trojan password hash
    if (rawView[0] === 0x00) {
        isVless = true;
        const vlessHeader = parseVlessHeader(rawBuffer);
        if (vlessHeader.hasError) return { hasError: true };
        destinationHost = vlessHeader.targetAddr;
        destinationPort = vlessHeader.targetPort;
        payloadOffset = vlessHeader.offset;
        subscriberToken = vlessHeader.clientUuidHex;
        isUDP = Boolean(vlessHeader.isUDP);
    } else {
        const trojanHeader = parseTrojanHeader(rawBuffer);
        if (trojanHeader.hasError) return { hasError: true };
        destinationHost = trojanHeader.targetAddr;
        destinationPort = trojanHeader.targetPort;
        payloadOffset = trojanHeader.offset;
        subscriberToken = trojanHeader.clientHashHex;
        isUDP = Boolean(trojanHeader.isUDP);
    }

    // 2. Authenticate subscriber profile
    const activeProfiles = getAllProfiles(sysConfig);
    let matchingProfile = null;

    if (isVless) {
        matchingProfile = activeProfiles.find((profile) =>
            profile.id.replace(/[^a-zA-Z0-9]/g, "").toLowerCase() === subscriberToken.toLowerCase()
        );
        if (!matchingProfile) {
            const composite = decodeConfigUuid(subscriberToken);
            if (composite) {
                matchingProfile = activeProfiles.find((profile) =>
                    profile.id.replace(/[^a-zA-Z0-9]/g, "").toLowerCase().startsWith(composite.userFingerprint)
                );
            }
        }
    } else {
        matchingProfile = activeProfiles.find((profile) =>
            getTrojanHash(profile.id).toLowerCase() === subscriberToken.toLowerCase()
        );
    }

    if (!matchingProfile) {
        return { hasError: true, message: "Unauthorized subscriber credentials" };
    }

    const clientKey = matchingProfile.id.replace(/[^a-zA-Z0-9]/g, "").toLowerCase();

    // 3. Enforce concurrent stream quotas
    const currentStreams = activeConns.get(clientKey) || 0;
    if (matchingProfile.connLimit && currentStreams >= matchingProfile.connLimit) {
        return { hasError: true, message: "Connection concurrency limit exceeded" };
    }
    activeConns.set(clientKey, currentStreams + 1);

    // Track request connection attempt
    trackUsage(clientKey, 0, env, ctx);
    const trackingMetrics = uuidUsage.get(clientKey) || { connects: 0, last: 0 };
    trackingMetrics.connects++;
    trackingMetrics.last = Date.now();
    uuidUsage.set(clientKey, trackingMetrics);

    // 4. Handle UDP command explicitly (DNS on port 53 vs rejection)
    if (isUDP) {
        if (destinationPort === 53) {
            const firstChunk = payloadOffset < rawBuffer.byteLength ? rawBuffer.slice(payloadOffset) : null;
            return {
                hasError: false,
                isVless,
                isUdpDns: true,
                activeClientHash: clientKey,
                firstChunk,
            };
        } else {
            // Reject arbitrary UDP commands cleanly
            return {
                hasError: true,
                isUdpRejected: true,
                message: "UDP proxying only supported for DNS (port 53)"
            };
        }
    }

    // 5. Resolve outbound socket connection provider
    const connectProvider = await resolveConnectFunction();
    if (!connectProvider) {
        return { hasError: true, message: "Edge sockets capability unavailable" };
    }

    let remoteSocket = null;
    let resolvedDestination = destinationHost;

    // Apply DNS-over-HTTPS resolution if customDns is active
    if (sysConfig.customDns && /^([a-zA-Z0-9-]+\.)+[a-zA-Z]{2,}$/.test(destinationHost)) {
        try {
            const resolvedIp = await resolveDomainDoh(destinationHost, sysConfig.customDns, "A");
            if (resolvedIp) {
                resolvedDestination = resolvedIp;
            }
        } catch {}
    }

    // 6. Outbound Connection: Direct Connect Attempt
    try {
        remoteSocket = connectProvider({
            hostname: formatSocketHost(resolvedDestination),
            port: destinationPort
        });
        await withDeadline(
            remoteSocket.opened,
            TCP_OPEN_TIMEOUT_MS,
            () => {
                try { remoteSocket?.close(); } catch {}
            },
            "direct-connect"
        );
    } catch {
        // Direct connect failed -> Try NAT64 translation or proxy IP failover
        let fallbackEstablished = false;

        // Fallback A: RFC 6052 NAT64 IPv6 Translation
        const natPrefix = matchingProfile.nat64 || sysConfig.nat64Prefix ||
                          (sysConfig.proxyIpMode === "prefix" && sysConfig.prefixes?.[0]);
        if (natPrefix && /^(\d{1,3}\.){3}\d{1,3}$/.test(resolvedDestination)) {
            const nat64Literal = convertToNAT64IPv6(resolvedDestination, natPrefix);
            if (nat64Literal) {
                try {
                    remoteSocket = connectProvider({
                        hostname: formatSocketHost(nat64Literal),
                        port: destinationPort
                    });
                    await withDeadline(
                        remoteSocket.opened,
                        TCP_OPEN_TIMEOUT_MS,
                        () => {
                            try { remoteSocket?.close(); } catch {}
                        },
                        "nat64-connect"
                    );
                    fallbackEstablished = true;
                } catch {}
            }
        }

        // Fallback B: Multi-Relay Proxy IP Failover
        if (!fallbackEstablished) {
            const relayEndpoints = getEffectivePips(matchingProfile, sysConfig);
            if (relayEndpoints.length === 0) {
                return { hasError: true, message: "Direct connect and fallback relays unavailable" };
            }

            // Profile-based hash to preserve consistent relay assignment
            let userHash = 0;
            for (let i = 0; i < clientKey.length; i++) {
                userHash = clientKey.charCodeAt(i) + ((userHash << 5) - userHash);
            }
            const startIndex = Math.abs(userHash) % relayEndpoints.length;

            for (let attempt = 0; attempt < Math.min(relayEndpoints.length, 3); attempt++) {
                const targetRelay = relayEndpoints[(startIndex + attempt) % relayEndpoints.length];
                try {
                    const [relayHost, relayPortRaw] = targetRelay.split(":");
                    const relayPort = relayPortRaw ? parseInt(relayPortRaw.split("#")[0], 10) : destinationPort;
                    remoteSocket = connectProvider({
                        hostname: formatSocketHost(relayHost),
                        port: relayPort
                    });
                    await withDeadline(
                        remoteSocket.opened,
                        TCP_OPEN_TIMEOUT_MS,
                        () => {
                            try { remoteSocket?.close(); } catch {}
                        },
                        "relay-connect"
                    );
                    fallbackEstablished = true;
                    break;
                } catch {
                    continue;
                }
            }
        }

        if (!fallbackEstablished) {
            return { hasError: true, message: "Outbound socket connection failed across all attempts" };
        }
    }

    const firstChunk = payloadOffset < rawBuffer.byteLength ? rawBuffer.slice(payloadOffset) : null;

    return {
        hasError: false,
        isVless,
        activeClientHash: clientKey,
        remoteSocket,
        firstChunk,
    };
}

/**
 * Rewrites target pathname and search queries onto an upstream backend URL.
 * @param {string} backendUrl Upstream target URL string
 * @param {URL} requestUrl Incoming request URL
 * @returns {string|null} Resolved upstream target string
 */
export function mapBackendUrl(backendUrl, requestUrl) {
    let target;
    try {
        target = new URL(backendUrl);
    } catch {
        return null;
    }
    const incomingPath = requestUrl?.pathname || "";
    if (incomingPath && incomingPath !== "/") {
        target.pathname = incomingPath;
    }
    target.search = requestUrl?.search || "";
    return target.toString();
}

/**
 * Reverse-proxies an incoming WebSocket connection to an upstream backend server.
 */
export async function processBackendStream(request, clientWebSocket, backendUrl, env, ctx, sysConfig) {
    incrementOpenWs();
    let upstreamSocket = null;
    let upBytes = 0;
    let downBytes = 0;
    let isTerminated = false;

    const cleanup = () => {
        if (!isTerminated) {
            isTerminated = true;
            decrementOpenWs();
            try { clientWebSocket.close(); } catch {}
            try { upstreamSocket?.close(); } catch {}
            const total = upBytes + downBytes;
            if (total > 0 && sysConfig.deviceId) {
                try { trackUsage(sysConfig.deviceId, total, env, ctx); } catch {}
            }
        }
    };

    clientWebSocket.addEventListener("close", cleanup);
    clientWebSocket.addEventListener("error", cleanup);

    const upstreamTarget = mapBackendUrl(backendUrl, new URL(request.url));
    if (!upstreamTarget) {
        cleanup();
        return;
    }

    const proxyHeaders = new Headers(request.headers);
    proxyHeaders.delete("Host");
    proxyHeaders.delete("Sec-WebSocket-Extensions");
    proxyHeaders.set("Connection", "Upgrade");
    proxyHeaders.set("Upgrade", "websocket");

    let upstreamResponse;
    try {
        upstreamResponse = await fetch(upstreamTarget, {
            method: "GET",
            headers: proxyHeaders,
            redirect: "manual",
        });
    } catch {
        cleanup();
        return;
    }

    if (upstreamResponse.status !== 101 || !upstreamResponse.webSocket) {
        cleanup();
        return;
    }

    upstreamSocket = upstreamResponse.webSocket;
    try { upstreamSocket.accept(); } catch {}

    clientWebSocket.addEventListener("message", (event) => {
        try {
            if (upstreamSocket && !isTerminated) {
                upstreamSocket.send(event.data);
                upBytes += event.data?.byteLength || event.data?.length || 0;
            }
        } catch {
            cleanup();
        }
    });

    upstreamSocket.addEventListener("message", (event) => {
        try {
            if (clientWebSocket && !isTerminated) {
                clientWebSocket.send(event.data);
                downBytes += event.data?.byteLength || event.data?.length || 0;
            }
        } catch {
            cleanup();
        }
    });

    upstreamSocket.addEventListener("close", cleanup);
    upstreamSocket.addEventListener("error", cleanup);
}

/**
 * Validates upstream backend VPS reachability and WebSocket upgrade handshake capability.
 * @param {string} backendUrl VPS target URL
 * @returns {Promise<object>} Diagnostics report
 */
export async function checkBackendHealth(backendUrl) {
    const report = {
        ok: false,
        backendMode: Boolean(backendUrl),
        backendUrl: backendUrl || "(none)",
        steps: [],
    };

    if (!backendUrl || !/^https?:\/\//i.test(backendUrl.trim())) {
        report.steps.push("Backend mode is OFF or URL is invalid. Set backendUrl in settings.");
        return report;
    }

    let resolvedProbeUrl = "";
    try {
        const parsed = new URL(backendUrl.trim());
        if (parsed.pathname === "/" || !parsed.pathname) {
            parsed.pathname = "/proxy";
        }
        resolvedProbeUrl = parsed.toString();
    } catch (e) {
        report.steps.push(`URL parsing failed: ${e.message}`);
        return report;
    }

    report.targetTried = resolvedProbeUrl;
    const startTimestamp = Date.now();

    try {
        const probeHeaders = new Headers();
        probeHeaders.set("Upgrade", "websocket");
        probeHeaders.set("Connection", "Upgrade");
        probeHeaders.set("Sec-WebSocket-Version", "13");
        probeHeaders.set("Sec-WebSocket-Key", "dGhlIHNhbXBsZSBub25jZQ==");

        const probeResponse = await fetch(resolvedProbeUrl, {
            method: "GET",
            headers: probeHeaders,
            redirect: "manual",
        });

        report.elapsedMs = Date.now() - startTimestamp;
        report.upstreamStatus = probeResponse.status;
        report.gotWebSocket = Boolean(probeResponse.webSocket);

        if (probeResponse.status === 101 && probeResponse.webSocket) {
            try { probeResponse.webSocket.accept(); } catch {}
            try { probeResponse.webSocket.close(); } catch {}
            report.ok = true;
            report.steps.push(`Connected in ${report.elapsedMs}ms (HTTP 101 WebSocket Upgrade).`);
        } else {
            report.steps.push(`Upstream responded with HTTP ${probeResponse.status} (expected 101).`);
        }
    } catch (err) {
        report.elapsedMs = Date.now() - startTimestamp;
        report.steps.push(`Upstream probe failed: ${err.message}`);
    }

    return report;
}

/**
 * Executes a 5-attempt TCP diagnostic speed/connectivity probe against an edge proxy IP.
 * @param {string} targetAddress Destination IP or domain
 * @param {number} [attemptsCount=5] Number of test iterations
 * @returns {Promise<object>} Diagnostic probe result
 */
export async function testProxyIp(targetAddress, attemptsCount = 5) {
    const connectProvider = await resolveConnectFunction();
    if (!connectProvider) {
        return {
            ok: false,
            success: false,
            ip: targetAddress,
            port: 443,
            latency_ms: null,
            status: "unreachable",
            error: "Sockets capability not available in this environment",
            message: "Sockets capability not available in this environment",
            data: {
                target: targetAddress,
                successRate: `0/${attemptsCount}`,
                avgLatencyMs: null,
                attempts: [],
            },
        };
    }

    const PROBE_PATH = "/__down?bytes=5000";
    const PROBE_TIMEOUT_MS = 5000;
    const attempts = [];

    for (let i = 1; i <= attemptsCount; i++) {
        const startTime = Date.now();
        let success = false;
        let socketHandle = null;

        try {
            const timeoutPromise = new Promise((_, reject) =>
                setTimeout(() => reject(new Error("timeout")), PROBE_TIMEOUT_MS)
            );

            const connectionPromise = Promise.resolve(connectProvider({ hostname: targetAddress, port: 443 }));
            socketHandle = await Promise.race([connectionPromise, timeoutPromise]);

            const writer = socketHandle.writable.getWriter();
            const probeRequest = `GET ${PROBE_PATH} HTTP/1.1\r\nHost: speed.cloudflare.com\r\nConnection: close\r\n\r\n`;
            await writer.write(new TextEncoder().encode(probeRequest));
            writer.releaseLock();

            const reader = socketHandle.readable.getReader();
            const readPromise = reader.read();
            const { value, done } = await Promise.race([readPromise, timeoutPromise]);
            reader.releaseLock();
            await socketHandle.close().catch(() => {});

            if (!done && value) {
                const responseText = new TextDecoder().decode(value);
                const hasHttpStatus = /^HTTP\/1\.[01] 400/.test(responseText);
                const hasRayId = /cf-ray:/i.test(responseText);
                success = hasHttpStatus && hasRayId;
            }
        } catch {
            success = false;
            if (socketHandle) await socketHandle.close().catch(() => {});
        }

        const elapsedMs = Date.now() - startTime;
        attempts.push({ attempt: i, ok: success, elapsedMs });
    }

    const passedAttempts = attempts.filter((a) => a.ok);
    const avgLatencyMs = passedAttempts.length
        ? Math.round(passedAttempts.reduce((sum, a) => sum + a.elapsedMs, 0) / passedAttempts.length)
        : null;
    const isReachable = passedAttempts.length > 0;

    return {
        ok: isReachable,
        success: isReachable,
        ip: targetAddress,
        port: 443,
        latency_ms: avgLatencyMs,
        status: isReachable ? "reachable" : "unreachable",
        message: isReachable
            ? `Successfully connected to ${targetAddress}:443 (${passedAttempts.length}/${attemptsCount} attempts passed, avg latency ${avgLatencyMs}ms)`
            : `All ${attemptsCount} connection attempts failed to ${targetAddress}:443`,
        data: {
            target: targetAddress,
            successRate: `${passedAttempts.length}/${attemptsCount}`,
            avgLatencyMs,
            attempts,
        },
    };
}
