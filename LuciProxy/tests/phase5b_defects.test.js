import { test } from "node:test";
import assert from "node:assert/strict";

import {
    encodeDnsQuery,
    parseDnsResponse,
    resolveDomainDoh,
    forwardUdpDnsPacket,
    clearDnsCache
} from "../src/protocols/dns_resolver.js";

import {
    startDataPipe,
    parseAndConnect,
    pumpDownstream,
    setSocketConnector
} from "../src/protocols/proxy.js";

import { handleDoH } from "../src/protocols/doh.js";
import { buildClashRules } from "../src/subscriptions/routing.js";
import { buildYamlProfile } from "../src/subscriptions/clash.js";
import { SYSTEM_DEFAULTS, DOWNSTREAM_READ_TIMEOUT_MS } from "../src/config.js";
import { getTrojanHash } from "../src/utils/crypto.js";

// --- Helpers ---
function buildVlessBuffer({
    version = 0x00,
    uuidHex = "00112233445566778899aabbccddeeff",
    addons = new Uint8Array(0),
    command = 0x01, // 0x01: TCP, 0x02: UDP
    port = 443,
    addressType = 0x01, // 1: IPv4, 2: Domain, 3: IPv6
    address = "1.2.3.4",
    payload = new Uint8Array([0xde, 0xad, 0xbe, 0xef])
} = {}) {
    const parts = [];
    parts.push(new Uint8Array([version]));
    const uuidBytes = new Uint8Array(16);
    for (let i = 0; i < 16; i++) {
        uuidBytes[i] = parseInt(uuidHex.substr(i * 2, 2), 16);
    }
    parts.push(uuidBytes);
    parts.push(new Uint8Array([addons.length]));
    if (addons.length > 0) parts.push(addons);
    parts.push(new Uint8Array([command]));
    const portBuf = new Uint8Array(2);
    new DataView(portBuf.buffer).setUint16(0, port);
    parts.push(portBuf);
    parts.push(new Uint8Array([addressType]));
    if (addressType === 0x01) {
        parts.push(new Uint8Array(address.split(".").map(Number)));
    } else if (addressType === 0x02) {
        const enc = new TextEncoder().encode(address);
        parts.push(new Uint8Array([enc.length]));
        parts.push(enc);
    }
    if (payload.length > 0) parts.push(payload);
    const totalLen = parts.reduce((acc, p) => acc + p.byteLength, 0);
    const combined = new Uint8Array(totalLen);
    let offset = 0;
    for (const p of parts) {
        combined.set(p, offset);
        offset += p.byteLength;
    }
    return combined.buffer;
}

function buildTrojanBuffer({
    hashHex = "a".repeat(56),
    command = 0x01, // 0x01: TCP, 0x03: UDP
    addressType = 0x01,
    address = "8.8.8.8",
    port = 80,
    payload = new Uint8Array([0x01, 0x02, 0x03])
} = {}) {
    const parts = [];
    parts.push(new TextEncoder().encode(hashHex + "\r\n"));
    parts.push(new Uint8Array([command]));
    parts.push(new Uint8Array([addressType]));
    if (addressType === 0x01) {
        parts.push(new Uint8Array(address.split(".").map(Number)));
    } else if (addressType === 0x03) {
        const enc = new TextEncoder().encode(address);
        parts.push(new Uint8Array([enc.length]));
        parts.push(enc);
    }
    const portBuf = new Uint8Array(2);
    new DataView(portBuf.buffer).setUint16(0, port);
    parts.push(portBuf);
    parts.push(new Uint8Array([0x0d, 0x0a]));
    if (payload.length > 0) parts.push(payload);
    const totalLen = parts.reduce((acc, p) => acc + p.byteLength, 0);
    const combined = new Uint8Array(totalLen);
    let offset = 0;
    for (const p of parts) {
        combined.set(p, offset);
        offset += p.byteLength;
    }
    return combined.buffer;
}

class MockClientWebSocket {
    constructor() {
        this.listeners = {};
        this.sent = [];
        this.closed = false;
    }
    addEventListener(type, fn) {
        if (!this.listeners[type]) this.listeners[type] = [];
        this.listeners[type].push(fn);
    }
    send(data) {
        this.sent.push(data);
    }
    close() {
        this.closed = true;
        (this.listeners["close"] || []).forEach((fn) => fn());
    }
    emitMessage(buffer) {
        (this.listeners["message"] || []).forEach((fn) => fn({ data: buffer }));
    }
}

// ============================================================================
// DEFECT 1: Worker-Side DoH JSON / RFC 8484 Compatibility & Fallback
// ============================================================================

test("Defect 1 - encodeDnsQuery builds valid RFC 1035 wireformat DNS query for A and AAAA", () => {
    const queryA = encodeDnsQuery("example.com", 1);
    assert(queryA instanceof Uint8Array);
    assert(queryA.byteLength > 12);
    // Standard query flags
    assert.equal(queryA[2], 0x01); // RD = 1
    assert.equal(queryA[3], 0x00);
    // QDCOUNT = 1
    assert.equal(queryA[4], 0x00);
    assert.equal(queryA[5], 0x01);

    const queryAAAA = encodeDnsQuery("example.com", 28);
    assert(queryAAAA instanceof Uint8Array);
    const qtypeOffset = queryAAAA.byteLength - 4;
    const view = new DataView(queryAAAA.buffer, queryAAAA.byteOffset, queryAAAA.byteLength);
    assert.equal(view.getUint16(qtypeOffset), 28);
});

test("Defect 1 - parseDnsResponse correctly extracts IPv4 and IPv6 answers from wireformat bytes", () => {
    // Construct a minimal wireformat DNS response with 1 A record (93.184.216.34)
    const resp = new Uint8Array([
        0x12, 0x34, // ID
        0x81, 0x80, // Response, NoError
        0x00, 0x01, // QDCOUNT = 1
        0x00, 0x01, // ANCOUNT = 1
        0x00, 0x00, // NSCOUNT
        0x00, 0x00, // ARCOUNT
        // Question: \x07example\x03com\x00
        0x07, 0x65, 0x78, 0x61, 0x6d, 0x70, 0x6c, 0x65,
        0x03, 0x63, 0x6f, 0x6d, 0x00,
        0x00, 0x01, // TYPE A
        0x00, 0x01, // CLASS IN
        // Answer: pointer 0xc00c, TYPE A, CLASS IN, TTL 300, RDLENGTH 4, 93.184.216.34
        0xc0, 0x0c,
        0x00, 0x01,
        0x00, 0x01,
        0x00, 0x00, 0x01, 0x2c,
        0x00, 0x04,
        93, 184, 216, 34
    ]);

    const ips = parseDnsResponse(resp.buffer);
    assert.equal(ips.length, 1);
    assert.equal(ips[0], "93.184.216.34");
});

test("Defect 1 - resolveDomainDoh queries RFC 8484 binary wireformat for /dns-query endpoints", async () => {
    clearDnsCache();
    const originalFetch = globalThis.fetch;
    let fetchCalledWith = null;

    globalThis.fetch = async (url, options) => {
        fetchCalledWith = { url, options };
        // Return valid mock wireformat DNS response
        const resp = new Uint8Array([
            0x00, 0x00, 0x81, 0x80, 0x00, 0x01, 0x00, 0x01, 0x00, 0x00, 0x00, 0x00,
            0x04, 0x74, 0x65, 0x73, 0x74, 0x00, 0x00, 0x01, 0x00, 0x01,
            0xc0, 0x0c, 0x00, 0x01, 0x00, 0x01, 0x00, 0x00, 0x00, 0x3c, 0x00, 0x04,
            1, 2, 3, 4
        ]);
        return new Response(resp.buffer, {
            status: 200,
            headers: { "content-type": "application/dns-message" }
        });
    };

    try {
        const ip = await resolveDomainDoh("test", "https://8.8.8.8/dns-query", "A");
        assert.equal(fetchCalledWith.options.method, "GET");
        assert(fetchCalledWith.url.includes("dns="));
        const acc = fetchCalledWith.options.headers["Accept"] || fetchCalledWith.options.headers["accept"];
        assert.equal(acc, "application/dns-message");
    } finally {
        globalThis.fetch = originalFetch;
    }
});

test("Defect 1 - resolveDomainDoh queries JSON for endpoints ending in /resolve", async () => {
    clearDnsCache();
    const originalFetch = globalThis.fetch;
    let fetchCalledWith = null;

    globalThis.fetch = async (url, options) => {
        fetchCalledWith = { url, options };
        return new Response(JSON.stringify({
            Status: 0,
            Answer: [{ name: "api.example.com", type: 1, data: "10.20.30.40" }]
        }), {
            status: 200,
            headers: { "content-type": "application/json" }
        });
    };

    try {
        const ip = await resolveDomainDoh("api.example.com", "https://dns.google/resolve", "A");
        assert.equal(ip, "10.20.30.40");
        assert.equal(fetchCalledWith.options.method, "GET");
        const acc = fetchCalledWith.options.headers["Accept"] || fetchCalledWith.options.headers["accept"];
        assert.equal(acc, "application/dns-json");
        assert(fetchCalledWith.url.includes("name=api.example.com"));
        assert(fetchCalledWith.url.includes("type=A"));
    } finally {
        globalThis.fetch = originalFetch;
    }
});

test("Defect 1 - resolveDomainDoh handles HTTP 400 error and falls back gracefully", async () => {
    clearDnsCache();
    const originalFetch = globalThis.fetch;
    let attempts = 0;

    globalThis.fetch = async (url, options) => {
        attempts++;
        if (attempts === 1) {
            // First attempt fails with 400 Bad Request
            return new Response("Bad Request", { status: 400 });
        }
        // Fallback resolver succeeds
        const resp = new Uint8Array([
            0x00, 0x00, 0x81, 0x80, 0x00, 0x01, 0x00, 0x01, 0x00, 0x00, 0x00, 0x00,
            0x04, 0x74, 0x65, 0x73, 0x74, 0x00, 0x00, 0x01, 0x00, 0x01,
            0xc0, 0x0c, 0x00, 0x01, 0x00, 0x01, 0x00, 0x00, 0x00, 0x3c, 0x00, 0x04,
            8, 8, 4, 4
        ]);
        return new Response(resp.buffer, {
            status: 200,
            headers: { "content-type": "application/dns-message" }
        });
    };

    try {
        const ip = await resolveDomainDoh("test", "https://broken-primary.com/dns-query", "A", 3000, "https://fallback.com/dns-query");
        assert.equal(ip, "8.8.4.4");
        assert.equal(attempts, 2);
    } finally {
        globalThis.fetch = originalFetch;
    }
});

test("Defect 1 - resolveDomainDoh handles DNS timeout and falls back to secondary", async () => {
    clearDnsCache();
    const originalFetch = globalThis.fetch;
    let callCount = 0;

    globalThis.fetch = async (url, options) => {
        callCount++;
        if (callCount === 1) {
            // Simulate timeout
            await new Promise((r) => setTimeout(r, 100));
            throw new Error("AbortError: operation timed out");
        }
        return new Response(JSON.stringify({
            Status: 0,
            Answer: [{ name: "test", type: 1, data: "9.9.9.9" }]
        }), { status: 200, headers: { "content-type": "application/json" } });
    };

    try {
        const ip = await resolveDomainDoh("test", "https://slow.com/resolve", "A", 50, "https://fallback.com/resolve");
        assert.equal(ip, "9.9.9.9");
        assert.equal(callCount, 2);
    } finally {
        globalThis.fetch = originalFetch;
    }
});

// ============================================================================
// DEFECT 2: VLESS/Trojan UDP Commands Handled Strictly
// ============================================================================

test("Defect 2 - VLESS UDP packet to port 53 is forwarded via DoH and not dialed over TCP", async () => {
    const userUuid = "a0a0a0a0-b1b1-c2c2-d3d3-e4e4e4e4e4e4";
    const userUuidHex = userUuid.replace(/-/g, "");
    const sysConfig = {
        ...SYSTEM_DEFAULTS,
        deviceId: userUuid,
        users: [{ id: userUuid, name: "UdpUser" }]
    };

    const dnsQueryBytes = encodeDnsQuery("cloudflare.com", 1);
    const vlessBuf = buildVlessBuffer({
        uuidHex: userUuidHex,
        command: 0x02, // UDP
        port: 53,
        addressType: 0x01,
        address: "1.1.1.1",
        payload: dnsQueryBytes
    });

    const session = await parseAndConnect(vlessBuf, -1, sysConfig, {}, {});
    assert.equal(session.hasError, false);
    assert.equal(session.isUdpDns, true);
    assert.equal(session.isVless, true);
    assert.equal(session.remoteSocket, undefined); // NO TCP socket dialed!
});

test("Defect 2 - VLESS UDP packet to non-53 port is rejected immediately without dialing TCP", async () => {
    const userUuid = "a0a0a0a0-b1b1-c2c2-d3d3-e4e4e4e4e4e4";
    const userUuidHex = userUuid.replace(/-/g, "");
    const sysConfig = {
        ...SYSTEM_DEFAULTS,
        deviceId: userUuid,
        users: [{ id: userUuid, name: "UdpUser" }]
    };

    const vlessBuf = buildVlessBuffer({
        uuidHex: userUuidHex,
        command: 0x02, // UDP
        port: 443, // Non-53 UDP port
        addressType: 0x01,
        address: "1.1.1.1"
    });

    const session = await parseAndConnect(vlessBuf, -1, sysConfig, {}, {});
    assert.equal(session.hasError, true);
    assert.equal(session.isUdpRejected, true);
    assert.match(session.message, /port 53/);
});

test("Defect 2 - Trojan UDP packet to port 53 is forwarded via DoH and not dialed over TCP", async () => {
    const userUuid = "b0b0b0b0-c1c1-d2d2-e3e3-f4f4f4f4f4f4";
    const hash = getTrojanHash(userUuid);
    const sysConfig = {
        ...SYSTEM_DEFAULTS,
        deviceId: userUuid,
        users: [{ id: userUuid, name: "TrojanUdpUser" }]
    };

    const dnsQueryBytes = encodeDnsQuery("google.com", 1);
    const trojanBuf = buildTrojanBuffer({
        hashHex: hash,
        command: 0x03, // Trojan UDP
        port: 53,
        addressType: 0x01,
        address: "8.8.8.8",
        payload: dnsQueryBytes
    });

    const session = await parseAndConnect(trojanBuf, -1, sysConfig, {}, {});
    assert.equal(session.hasError, false);
    assert.equal(session.isUdpDns, true);
    assert.equal(session.isVless, false);
    assert.equal(session.remoteSocket, undefined); // NO TCP socket dialed!
});

test("Defect 2 - Trojan UDP packet to non-53 port is rejected immediately without dialing TCP", async () => {
    const userUuid = "b0b0b0b0-c1c1-d2d2-e3e3-f4f4f4f4f4f4";
    const hash = getTrojanHash(userUuid);
    const sysConfig = {
        ...SYSTEM_DEFAULTS,
        deviceId: userUuid,
        users: [{ id: userUuid, name: "TrojanUdpUser" }]
    };

    const trojanBuf = buildTrojanBuffer({
        hashHex: hash,
        command: 0x03, // Trojan UDP
        port: 123, // NTP port (non-53)
        addressType: 0x01,
        address: "8.8.8.8"
    });

    const session = await parseAndConnect(trojanBuf, -1, sysConfig, {}, {});
    assert.equal(session.hasError, true);
    assert.equal(session.isUdpRejected, true);
    assert.match(session.message, /port 53/);
});

test("Defect 2 - Unauthenticated UDP packet rejection", async () => {
    const sysConfig = {
        ...SYSTEM_DEFAULTS,
        deviceId: "registered-uuid-1",
        users: [{ id: "registered-uuid-1", name: "LegitUser" }]
    };

    const vlessBuf = buildVlessBuffer({
        uuidHex: "deadbeefdeadbeefdeadbeefdeadbeef", // Non-existent user
        command: 0x02,
        port: 53
    });

    const session = await parseAndConnect(vlessBuf, -1, sysConfig, {}, {});
    assert.equal(session.hasError, true);
    assert.match(session.message, /Unauthorized subscriber/);
});

// ============================================================================
// DEFECT 3: Clash / Mihomo Rule Precedence
// ============================================================================

test("Defect 3 - Clash rule ordering enforces strict first-match-wins precedence", () => {
    const config = {
        ...SYSTEM_DEFAULTS,
        blockUDP443: true,
        blockThreats: true,
        bypassIran: true,
        bypassAi: true,
        bypassDev: true
    };

    const rules = buildClashRules(config, "PROXIES");
    // Verify sequence: Transport -> Threat -> LAN -> Domestic -> Sanctions -> MATCH
    const quicIndex = rules.findIndex((r) => r.includes("DST-PORT,443"));
    const threatIndex = rules.findIndex((r) => r.includes("doubleclick.net"));
    const lanIndex = rules.findIndex((r) => r.includes("GEOIP,lan"));
    const iranIndex = rules.findIndex((r) => r.includes("GEOIP,IR"));
    const aiIndex = rules.findIndex((r) => r.includes("openai.com"));
    const matchIndex = rules.findIndex((r) => r.startsWith("MATCH,"));

    assert(quicIndex !== -1, "QUIC rule must exist");
    assert(threatIndex !== -1, "Threat rule must exist");
    assert(lanIndex !== -1, "LAN rule must exist");
    assert(iranIndex !== -1, "Iran rule must exist");
    assert(aiIndex !== -1, "AI rule must exist");
    assert(matchIndex !== -1, "MATCH rule must exist");

    assert(quicIndex < threatIndex, "Transport rule must precede Threat rules");
    assert(threatIndex < lanIndex, "Threat rules must precede LAN rules");
    assert(lanIndex < iranIndex, "LAN rules must precede Domestic rules");
    assert(iranIndex < aiIndex, "Domestic rules must precede Sanctions rules");
    assert(aiIndex < matchIndex, "Sanction rules must precede MATCH");
});

test("Defect 3 - Iranian destination with UDP 443 matches QUIC block first", () => {
    const config = {
        ...SYSTEM_DEFAULTS,
        blockUDP443: true,
        bypassIran: true
    };
    const rules = buildClashRules(config, "PROXIES");
    const quicIndex = rules.findIndex((r) => r.includes("DST-PORT,443"));
    const iranIndex = rules.findIndex((r) => r.includes("GEOIP,IR"));
    assert(quicIndex < iranIndex);
});

test("Defect 3 - Threat domain matching both threat and sanction list prioritizes rejection", () => {
    const config = {
        ...SYSTEM_DEFAULTS,
        blockThreats: true,
        bypassAi: true
    };
    const rules = buildClashRules(config, "PROXIES");
    const threatIndex = rules.findIndex((r) => r.includes("REJECT") && r.includes("DOMAIN-SUFFIX"));
    const directIndex = rules.findIndex((r) => r.includes("DIRECT") && r.includes("DOMAIN-SUFFIX"));
    assert(threatIndex < directIndex);
});

// ============================================================================
// DEFECT 4: Worker-Side DoH Fallback Endpoints
// ============================================================================

test("Defect 4 - handleDoH fallback resolver points to Google DoH and never Cloudflare Anycast", async () => {
    const originalFetch = globalThis.fetch;
    let fetchedUrl = null;

    globalThis.fetch = async (url) => {
        fetchedUrl = url;
        return new Response("ok", { status: 200 });
    };

    try {
        const req = new Request("https://worker.dev/dns-query?name=test&type=A");
        // No customDns provided in sysConfig -> fallback must kick in
        await handleDoH(req, {});
        assert(fetchedUrl !== null);
        assert(!fetchedUrl.includes("cloudflare-dns.com"), "DoH fallback must not use cloudflare-dns.com");
        assert(fetchedUrl.includes("dns.google") || fetchedUrl.includes("8.8.8.8"), "DoH fallback must use Google DoH");
    } finally {
        globalThis.fetch = originalFetch;
    }
});

test("Defect 4 - handleDoH respects customDns override when provided", async () => {
    const originalFetch = globalThis.fetch;
    let fetchedUrl = null;

    globalThis.fetch = async (url) => {
        fetchedUrl = url;
        return new Response("ok", { status: 200 });
    };

    try {
        const req = new Request("https://worker.dev/dns-query?name=test&type=A");
        await handleDoH(req, { customDns: "https://custom-dns.org/dns-query" });
        assert(fetchedUrl.includes("custom-dns.org"));
    } finally {
        globalThis.fetch = originalFetch;
    }
});

// ============================================================================
// DEFECT 5: Downstream Socket Inactivity Deadline
// ============================================================================

test("Defect 5 - pumpDownstream terminates when inactive longer than readTimeoutMs", async () => {
    const mockSocket = {
        readable: new ReadableStream({
            start(controller) {
                // Send one chunk and then stall indefinitely
                controller.enqueue(new Uint8Array([1, 2, 3]));
            }
        })
    };
    const mockWs = new MockClientWebSocket();

    const startTime = Date.now();
    // Test with a short 60ms timeout
    await pumpDownstream(mockSocket, mockWs, null, 60);
    const duration = Date.now() - startTime;

    assert(duration >= 50 && duration < 300, `Duration was ${duration}ms`);
    assert(mockWs.closed, "Client WebSocket must be closed after inactivity timeout");
    assert.equal(mockWs.sent.length, 1, "Initial chunk must have been forwarded");
});

test("Defect 5 - pumpDownstream resets inactivity deadline on each chunk received", async () => {
    let controllerRef = null;
    const mockSocket = {
        readable: new ReadableStream({
            start(controller) {
                controllerRef = controller;
            }
        })
    };
    const mockWs = new MockClientWebSocket();

    const pumpPromise = pumpDownstream(mockSocket, mockWs, null, 100);

    // Send 3 chunks at 50ms intervals (each < 100ms timeout)
    await new Promise((r) => setTimeout(r, 40));
    controllerRef.enqueue(new Uint8Array([1]));
    await new Promise((r) => setTimeout(r, 40));
    controllerRef.enqueue(new Uint8Array([2]));
    await new Promise((r) => setTimeout(r, 40));
    controllerRef.enqueue(new Uint8Array([3]));
    await new Promise((r) => setTimeout(r, 40));
    controllerRef.close(); // Clean FIN

    await pumpPromise;

    assert.equal(mockWs.sent.length, 3);
    assert(mockWs.closed);
});

test("Defect 5 - pumpDownstream exits immediately when remote socket closes (FIN)", async () => {
    const mockSocket = {
        readable: new ReadableStream({
            start(controller) {
                controller.enqueue(new Uint8Array([99]));
                controller.close(); // Immediate FIN
            }
        })
    };
    const mockWs = new MockClientWebSocket();

    const startTime = Date.now();
    await pumpDownstream(mockSocket, mockWs, null, 10000);
    const duration = Date.now() - startTime;

    assert(duration < 200, "Should terminate immediately on stream close without waiting for timeout");
    assert.equal(mockWs.sent.length, 1);
});

// ============================================================================
// DEFECT 6: Mihomo TUN Conditional Enabling
// ============================================================================

test("Defect 6 - TUN disabled by default in Clash YAML", async () => {
    const config = {
        ...SYSTEM_DEFAULTS,
        deviceId: "00000000-0000-4000-8000-000000000001",
        enableTun: false
    };

    const yaml = await buildYamlProfile("clash.example.com", null, false, config);
    assert(yaml.includes("tun:\n  enable: false"));
    assert(!yaml.includes("dns-hijack:"));
    assert(!yaml.includes("auto-route: true"));
});

test("Defect 6 - TUN enabled renders full TUN configuration block", async () => {
    const config = {
        ...SYSTEM_DEFAULTS,
        deviceId: "00000000-0000-4000-8000-000000000001",
        enableTun: true
    };

    const yaml = await buildYamlProfile("clash.example.com", null, false, config);
    assert(yaml.includes("tun:\n  enable: true"));
    assert(yaml.includes("stack: mixed"));
    assert(yaml.includes("auto-route: true"));
    assert(yaml.includes("dns-hijack:"));
});

test("Defect 6 - Default configuration without explicit TUN field defaults to enable: false", async () => {
    const config = {
        ...SYSTEM_DEFAULTS,
        deviceId: "00000000-0000-4000-8000-000000000001"
    };

    const yaml = await buildYamlProfile("clash.example.com", null, false, config);
    assert(yaml.includes("tun:\n  enable: false"));
});
