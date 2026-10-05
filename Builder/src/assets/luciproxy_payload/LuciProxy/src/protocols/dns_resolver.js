/**
 * LuciProxy - Worker-Side DNS-over-HTTPS (DoH) & UDP DNS Resolver Engine
 *
 * Implements RFC 8484 wireformat DNS message construction/parsing and
 * RFC 8427 JSON DoH querying for in-Worker domain resolution and VLESS/Trojan UDP/53 handling.
 *
 * Independent implementation authored specifically for LuciProxy.
 */

import { fetchT } from "../utils/helpers.js";

// In-memory DNS cache with 60-second TTL
const dnsCache = new Map();
const CACHE_TTL_MS = 60000;

/**
 * Encodes a DNS query into RFC 1035 wireformat binary packet.
 * @param {string} hostname Domain name to resolve
 * @param {number} [qtype=1] Query record type: 1 for A (IPv4), 28 for AAAA (IPv6)
 * @returns {Uint8Array} Binary DNS query packet
 */
export function encodeDnsQuery(hostname, qtype = 1) {
    const cleanHost = String(hostname || "").trim().toLowerCase();
    const labels = cleanHost.split(".").filter(Boolean);

    let qnameLen = 1; // Trailing zero byte
    for (const label of labels) {
        qnameLen += 1 + label.length;
    }

    const buffer = new Uint8Array(12 + qnameLen + 4);
    const view = new DataView(buffer.buffer);

    // Header (12 bytes)
    // ID = 0x1234
    view.setUint16(0, 0x1234);
    // Flags: Standard query, Recursion Desired (RD = 1) -> 0x0100
    view.setUint16(2, 0x0100);
    // QDCOUNT = 1
    view.setUint16(4, 1);
    // ANCOUNT = 0, NSCOUNT = 0, ARCOUNT = 0
    view.setUint16(6, 0);
    view.setUint16(8, 0);
    view.setUint16(10, 0);

    // Write Question Section
    let offset = 12;
    for (const label of labels) {
        buffer[offset++] = label.length;
        for (let i = 0; i < label.length; i++) {
            buffer[offset++] = label.charCodeAt(i);
        }
    }
    buffer[offset++] = 0x00; // Zero terminator for QNAME

    // QTYPE (1 = A, 28 = AAAA)
    view.setUint16(offset, qtype);
    offset += 2;
    // QCLASS (1 = IN / Internet)
    view.setUint16(offset, 1);

    return buffer;
}

/**
 * Parses an RFC 1035 wireformat DNS response packet and extracts IP addresses.
 * @param {ArrayBuffer|Uint8Array} responseBuffer Binary DNS response
 * @param {number} [expectedType=1] 1 for A, 28 for AAAA
 * @returns {Array<string>} Array of resolved IP addresses
 */
export function parseDnsResponse(responseBuffer, expectedType = 1) {
    if (!responseBuffer) return [];
    const buffer = responseBuffer instanceof Uint8Array ? responseBuffer : new Uint8Array(responseBuffer);
    if (buffer.byteLength < 12) return [];

    const view = new DataView(buffer.buffer, buffer.byteOffset, buffer.byteLength);

    const flags = view.getUint16(2);
    const rcode = flags & 0x000F;
    if (rcode !== 0) return []; // DNS error response (NXDOMAIN, SERVFAIL, etc.)

    const qdcount = view.getUint16(4);
    const ancount = view.getUint16(6);
    if (ancount === 0) return [];

    let offset = 12;

    function skipName(pos) {
        while (pos < buffer.byteLength) {
            const len = buffer[pos];
            if (len === 0) return pos + 1;
            if ((len & 0xC0) === 0xC0) {
                // Compression offset pointer (2 bytes)
                return pos + 2;
            }
            pos += 1 + len;
        }
        return pos;
    }

    // Skip question section
    for (let q = 0; q < qdcount; q++) {
        offset = skipName(offset);
        offset += 4; // QTYPE (2) + QCLASS (2)
        if (offset > buffer.byteLength) return [];
    }

    const ips = [];

    // Parse answers
    for (let a = 0; a < ancount && offset < buffer.byteLength; a++) {
        offset = skipName(offset);
        if (offset + 10 > buffer.byteLength) break;

        const type = view.getUint16(offset);
        const rdLength = view.getUint16(offset + 8);
        offset += 10;

        if (offset + rdLength > buffer.byteLength) break;

        if (type === 1 && expectedType === 1 && rdLength === 4) {
            // A Record (IPv4)
            const ip = `${buffer[offset]}.${buffer[offset + 1]}.${buffer[offset + 2]}.${buffer[offset + 3]}`;
            ips.push(ip);
        } else if (type === 28 && expectedType === 28 && rdLength === 16) {
            // AAAA Record (IPv6)
            const parts = [];
            for (let i = 0; i < 8; i++) {
                parts.push(view.getUint16(offset + i * 2).toString(16));
            }
            ips.push(parts.join(":"));
        }

        offset += rdLength;
    }

    return ips;
}

/**
 * Encodes a Uint8Array into a URL-safe Base64 string (RFC 4648 / RFC 8484).
 */
export function uint8ArrayToBase64Url(u8) {
    if (!u8) return "";
    const arr = u8 instanceof Uint8Array ? u8 : new Uint8Array(u8);
    let binary = "";
    for (let i = 0; i < arr.byteLength; i++) {
        binary += String.fromCharCode(arr[i]);
    }
    return btoa(binary)
        .replace(/\+/g, "-")
        .replace(/\//g, "_")
        .replace(/=+$/, "");
}

/**
 * Normalizes a DoH endpoint URL for Cloudflare Worker subrequest compatibility.
 * Replaces Cloudflare Anycast hostnames and raw IP literals (e.g. 8.8.8.8) with valid TLS hostnames (dns.google).
 *
 * @param {string} rawUrl Input DoH URL
 * @returns {string} Normalized DoH URL
 */
export function normalizeDohUrl(rawUrl) {
    if (!rawUrl || typeof rawUrl !== "string") {
        return "https://dns.google/dns-query";
    }

    let trimmed = rawUrl.trim();
    if (!trimmed) {
        return "https://dns.google/dns-query";
    }

    // Guard against Cloudflare Anycast socket stall in Worker subrequests
    if (trimmed.includes("cloudflare-dns.com") || trimmed.includes("://1.1.1.1/") || trimmed.includes("://1.0.0.1/")) {
        trimmed = "https://dns.google/dns-query";
    }

    try {
        const parsed = new URL(trimmed);
        if (parsed.hostname === "8.8.8.8" || parsed.hostname === "8.8.4.4") {
            parsed.hostname = "dns.google";
            return parsed.toString();
        }
        if (parsed.hostname === "1.1.1.1" || parsed.hostname === "1.0.0.1") {
            return "https://dns.google/dns-query";
        }
        return parsed.toString();
    } catch {
        return "https://dns.google/dns-query";
    }
}

/**
 * Resolves a domain name using either RFC 8484 wireformat or JSON DoH resolver.
 * @param {string} domain Domain name to resolve
 * @param {string} dohUrl DoH resolver URL
 * @param {string} [recordType="A"] "A" or "AAAA"
 * @param {number} [timeoutMs=5000] Timeout in milliseconds
 * @param {string} [fallbackDohUrl="https://dns.google/dns-query"] Fallback DoH URL on failure
 * @returns {Promise<string|null>} Resolved IP address or null
 */
export async function resolveDomainDoh(domain, dohUrl, recordType = "A", timeoutMs = 5000, fallbackDohUrl = "https://dns.google/dns-query") {
    if (!domain) return null;
    const cleanDomain = domain.trim().toLowerCase();
    const activeDohUrl = normalizeDohUrl(dohUrl || fallbackDohUrl);
    const activeFallback = fallbackDohUrl ? normalizeDohUrl(fallbackDohUrl) : null;
    const cacheKey = `${cleanDomain}:${recordType}:${activeDohUrl}`;

    const cached = dnsCache.get(cacheKey);
    if (cached && Date.now() - cached.timestamp < CACHE_TTL_MS) {
        return cached.ip;
    }

    const isV6 = recordType === "AAAA";
    const qtype = isV6 ? 28 : 1;

    let parsedUrl;
    try {
        parsedUrl = new URL(activeDohUrl);
    } catch {
        if (activeFallback && activeFallback !== activeDohUrl) {
            return resolveDomainDoh(cleanDomain, activeFallback, recordType, timeoutMs, null);
        }
        return null;
    }

    const tryFallback = async () => {
        if (activeFallback && activeFallback !== activeDohUrl) {
            return await resolveDomainDoh(cleanDomain, activeFallback, recordType, timeoutMs, null);
        }
        return null;
    };

    // Determine protocol: RFC 8427 JSON vs RFC 8484 wireformat
    const isJsonEndpoint = parsedUrl.pathname.endsWith("/resolve") || parsedUrl.searchParams.get("format") === "json";

    try {
        if (isJsonEndpoint) {
            // Mode B: JSON DoH API (e.g. Google https://dns.google/resolve)
            const targetUrl = new URL(activeDohUrl);
            targetUrl.searchParams.set("name", cleanDomain);
            targetUrl.searchParams.set("type", recordType);

            const res = await fetchT(targetUrl.toString(), {
                method: "GET",
                headers: { "Accept": "application/dns-json" }
            }, timeoutMs);

            if (!res.ok) return await tryFallback();
            const data = await res.json();
            if (data && data.Answer && data.Answer.length > 0) {
                const match = data.Answer.find((ans) => ans.type === qtype);
                const resolvedIp = match ? match.data : data.Answer[0].data;
                if (resolvedIp) {
                    dnsCache.set(cacheKey, { ip: resolvedIp, timestamp: Date.now() });
                    return resolvedIp;
                }
            }
            return await tryFallback();
        } else {
            // Mode A: RFC 8484 wireformat DoH endpoint via GET ?dns= (standard, avoiding 411 Length Required)
            const wireQuery = encodeDnsQuery(cleanDomain, qtype);
            const b64 = uint8ArrayToBase64Url(wireQuery);
            const queryUrl = new URL(activeDohUrl);
            queryUrl.searchParams.set("dns", b64);

            const res = await fetchT(queryUrl.toString(), {
                method: "GET",
                headers: {
                    "Accept": "application/dns-message"
                }
            }, timeoutMs);

            if (!res.ok) return await tryFallback();
            const bodyBuf = await res.arrayBuffer();
            const ips = parseDnsResponse(bodyBuf, qtype);

            if (ips.length > 0) {
                const resolvedIp = ips[0];
                dnsCache.set(cacheKey, { ip: resolvedIp, timestamp: Date.now() });
                return resolvedIp;
            }
            return await tryFallback();
        }
    } catch {
        return await tryFallback();
    }
}

/**
 * Handles incoming VLESS/Trojan UDP port 53 DNS packets by forwarding via DoH.
 * @param {Uint8Array|ArrayBuffer} rawPayload Incoming client payload chunk
 * @param {boolean} isVless True if VLESS protocol, false if Trojan
 * @param {object} sysConfig System configuration
 * @returns {Promise<Uint8Array|null>} Response bytes formatted for client WebSocket
 */
export async function forwardUdpDnsPacket(rawPayload, isVless, sysConfig = {}) {
    if (!rawPayload) return null;
    const view = rawPayload instanceof Uint8Array ? rawPayload : new Uint8Array(rawPayload);
    if (view.byteLength < 2) return null;

    let dnsQueryBytes = null;

    if (isVless) {
        // VLESS UDP format: [Length (2 bytes, big-endian), DNS Message ...]
        const pktLen = (view[0] << 8) | view[1];
        if (view.byteLength >= 2 + pktLen && pktLen > 0) {
            dnsQueryBytes = view.slice(2, 2 + pktLen);
        } else if (view.byteLength > 2) {
            dnsQueryBytes = view.slice(2);
        }
    } else {
        // Trojan UDP ASSOCIATE format: [ATYP, ADDR..., PORT (2), LENGTH (2), CRLF, DNS Message]
        if (view.byteLength >= 12) {
            dnsQueryBytes = view;
        }
    }

    if (!dnsQueryBytes || dnsQueryBytes.byteLength < 12) return null;

    const rawDoh = sysConfig.customDns || sysConfig.remoteDns || "https://dns.google/dns-query";
    const dohUrl = normalizeDohUrl(rawDoh);

    try {
        const b64 = uint8ArrayToBase64Url(dnsQueryBytes);
        const queryUrl = new URL(dohUrl);
        queryUrl.searchParams.set("dns", b64);

        const res = await fetchT(queryUrl.toString(), {
            method: "GET",
            headers: {
                "Accept": "application/dns-message"
            }
        }, 5000);

        if (!res.ok) return null;
        const answerBuffer = await res.arrayBuffer();
        const answerBytes = new Uint8Array(answerBuffer);

        if (isVless) {
            // Form VLESS UDP response: [Length (2 bytes)] + DNS Answer
            const resp = new Uint8Array(2 + answerBytes.byteLength);
            resp[0] = (answerBytes.byteLength >> 8) & 0xFF;
            resp[1] = answerBytes.byteLength & 0xFF;
            resp.set(answerBytes, 2);
            return resp;
        } else {
            return answerBytes;
        }
    } catch {
        return null;
    }
}


/**
 * Clears the in-memory DNS resolution cache.
 */
export function clearDnsCache() {
    dnsCache.clear();
}
