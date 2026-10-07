/**
 * LuciProxy - Runtime Helpers, Bounded Fetch & Usage Calculations
 * Circuit breaker states, timeout enforcement, and RFC 3986/6052 network transformations.
 *
 * Independent implementation authored specifically for LuciProxy.
 */

export { REQ_BYTES_EST } from "../config.js";

// Circuit breaker state counters
let INFLIGHT_HTTP = 0;
let OPEN_WS = 0;

export function incrementInflightHttp() {
    INFLIGHT_HTTP++;
}

export function decrementInflightHttp() {
    INFLIGHT_HTTP = Math.max(0, INFLIGHT_HTTP - 1);
}

export function incrementOpenWs() {
    OPEN_WS++;
}

export function decrementOpenWs() {
    OPEN_WS = Math.max(0, OPEN_WS - 1);
}

export function breakerLevel() {
    if (OPEN_WS > 80 || INFLIGHT_HTTP > 40) return 2;
    if (OPEN_WS > 40 || INFLIGHT_HTTP > 20) return 1;
    return 0;
}

export function sleepMs(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
}

export async function withDeadline(promise, timeoutMs, onTimeout, label = "operation") {
    let timer = null;
    const timeoutPromise = new Promise((_, reject) => {
        timer = setTimeout(() => {
            try {
                if (typeof onTimeout === "function") onTimeout();
            } catch (e) {}
            reject(new Error(`${label} timed out after ${timeoutMs}ms`));
        }, timeoutMs);
    });
    try {
        return await Promise.race([promise, timeoutPromise]);
    } finally {
        if (timer) clearTimeout(timer);
    }
}

export async function fetchT(url, init = {}, timeoutMs = 10000) {
    const timeout = Math.max(1, Number(timeoutMs) || 10000);
    let controller = null;
    let timer = null;
    let callerSignal = null;
    let onCallerAbort = null;
    try {
        if (typeof AbortController !== "undefined") {
            controller = new AbortController();
            callerSignal = init && init.signal ? init.signal : null;
            if (callerSignal) {
                if (callerSignal.aborted) {
                    controller.abort(callerSignal.reason);
                } else {
                    onCallerAbort = () => {
                        try {
                            controller.abort(callerSignal.reason);
                        } catch (e) {}
                    };
                    try {
                        callerSignal.addEventListener("abort", onCallerAbort, { once: true });
                    } catch (e) {}
                }
            }
            timer = setTimeout(() => {
                try {
                    controller.abort();
                } catch (e) {}
            }, timeout);
            return await fetch(url, { ...init, signal: controller.signal });
        }
        return await fetch(url, { ...init });
    } finally {
        if (timer) {
            try {
                clearTimeout(timer);
            } catch (e) {}
        }
        if (callerSignal && onCallerAbort) {
            try {
                callerSignal.removeEventListener("abort", onCallerAbort);
            } catch (e) {}
        }
    }
}

export function usageTotalBytes(u) {
    try {
        if (!u) return 0;
        if (typeof u.bytes === "number" && u.bytes >= 0) return Math.floor(u.bytes);
        return Math.floor((u.reqs || 0) * REQ_BYTES_EST);
    } catch (e) {
        return 0;
    }
}

export function usageDailyBytes(u, today) {
    try {
        if (!u) return 0;
        const day = today || new Date().toISOString().split("T")[0];
        if ((u.lastDay || "") !== day) return 0;
        if (typeof u.dBytes === "number" && u.dBytes >= 0) return Math.floor(u.dBytes);
        return Math.floor((u.dReqs || 0) * REQ_BYTES_EST);
    } catch (e) {
        return 0;
    }
}

export function limitReqToBytes(limitReq) {
    try {
        return limitReq ? Math.floor(limitReq * REQ_BYTES_EST) : 0;
    } catch (e) {
        return 0;
    }
}

export function getTransportParams(port) {
    const portStr = String(port);
    return ["80", "8080", "8880", "2052", "2082", "2086", "2095"].includes(portStr)
        ? "none"
        : "tls";
}

/**
 * Ensures IPv6 literals are bracketed before passing to cloudflare:sockets connect().
 * Resolves Cloudflare Worker edge issue where bare IPv6 host:port fails to parse.
 */
/**
 * Ensures IPv6 literals are bracketed before passing to cloudflare:sockets connect().
 * Resolves Cloudflare Worker edge issue where bare IPv6 host:port fails to parse.
 */
export function formatSocketHost(host = "") {
    if (!host) return "";
    const clean = String(host).replace(/^\[|\]$/g, "").trim();
    return clean.includes(":") ? `[${clean}]` : clean;
}

/**
 * Decodes URL-safe or standard Base64 string to ArrayBuffer.
 * Handles Sing-Box / Clash / Xray 0-RTT early data in Sec-WebSocket-Protocol.
 */
export function base64ToArrayBuffer(base64Str) {
    if (!base64Str || typeof base64Str !== "string") return null;
    try {
        let str = base64Str.trim().replace(/-/g, "+").replace(/_/g, "/");
        while (str.length % 4 !== 0) {
            str += "=";
        }
        const binary = atob(str);
        const bytes = new Uint8Array(binary.length);
        for (let i = 0; i < binary.length; i++) {
            bytes[i] = binary.charCodeAt(i);
        }
        return bytes.buffer;
    } catch (e) {
        return null;
    }
}

/**
 * Converts an IPv4 address and dynamic prefix into a NAT64 IPv6 address according to IETF RFC 6052.
 * Example: 1.2.3.4 with prefix [2602:fc59:b0:64::] -> [2602:fc59:b0:64::0102:0304]
 */
export function convertToNAT64IPv6(ipv4Address, prefix) {
    if (!ipv4Address || !prefix) return null;
    const parts = ipv4Address.split(".");
    if (parts.length !== 4) return null;

    const hex = parts.map((part) => {
        const num = parseInt(part, 10);
        if (isNaN(num) || num < 0 || num > 255) return null;
        return num.toString(16).padStart(2, "0");
    });
    if (hex.includes(null)) return null;

    let cleanPrefix = prefix.trim();
    if (cleanPrefix.startsWith("[") && cleanPrefix.endsWith("]")) {
        cleanPrefix = cleanPrefix.slice(1, -1);
    }

    if (cleanPrefix.endsWith("::")) {
        return `[${cleanPrefix}${hex[0]}${hex[1]}:${hex[2]}${hex[3]}]`;
    } else if (cleanPrefix.endsWith(":")) {
        return `[${cleanPrefix}${hex[0]}${hex[1]}:${hex[2]}${hex[3]}]`;
    } else {
        return `[${cleanPrefix}:${hex[0]}${hex[1]}:${hex[2]}${hex[3]}]`;
    }
}

// Cloudflare Anycast CDN IPv4 CIDRs: [networkAddressInt, prefixLength]
const CF_IPV4_CIDRS = [
    [0x6715f400, 22], // 103.21.244.0/22
    [0x6716c800, 22], // 103.22.200.0/22
    [0x671f0400, 22], // 103.31.4.0/22
    [0x68100000, 13], // 104.16.0.0/13
    [0x68180000, 14], // 104.24.0.0/14
    [0x6ca2c000, 18], // 108.162.192.0/18
    [0x83004800, 22], // 131.0.72.0/22
    [0x8d654000, 18], // 141.101.64.0/18
    [0xa29e0000, 15], // 162.158.0.0/15
    [0xac400000, 13], // 172.64.0.0/13
    [0xadf53000, 20], // 173.245.48.0/20
    [0xbc726000, 20], // 188.114.96.0/20
    [0xbe5df000, 20], // 190.93.240.0/20
    [0xc5eaf000, 22], // 197.234.240.0/22
    [0xc6298000, 17], // 198.41.128.0/17
    [0x01010100, 24], // 1.1.1.0/24
    [0x01000000, 24]  // 1.0.0.0/24
];

/**
 * Determines whether a given IP address belongs to Cloudflare's own anycast CDN network.
 * Workers cannot establish outbound sockets directly to Cloudflare CDN IPs.
 * @param {string} ipStr Hostname or IP address
 * @returns {boolean} True if the address is within Cloudflare anycast ranges
 */
export function isCloudflareIp(ipStr) {
    if (!ipStr || typeof ipStr !== "string") return false;
    const clean = ipStr.replace(/^\[|\]$/g, "").trim().split(":")[0];
    const parts = clean.split(".");
    if (parts.length === 4) {
        let num = 0;
        for (let i = 0; i < 4; i++) {
            const p = parseInt(parts[i], 10);
            if (isNaN(p) || p < 0 || p > 255) return false;
            num = (num << 8) | p;
        }
        num = num >>> 0;
        for (const [net, maskLen] of CF_IPV4_CIDRS) {
            const mask = maskLen === 0 ? 0 : (0xffffffff << (32 - maskLen)) >>> 0;
            if ((num & mask) === (net & mask)) {
                return true;
            }
        }
        return false;
    }
    const cleanV6 = ipStr.replace(/^\[|\]$/g, "").trim().toLowerCase();
    if (cleanV6.includes(":")) {
        return cleanV6.startsWith("2606:4700") ||
               cleanV6.startsWith("2400:cb00") ||
               cleanV6.startsWith("2803:f800") ||
               cleanV6.startsWith("2405:b500") ||
               cleanV6.startsWith("2405:8100") ||
               cleanV6.startsWith("2a06:98c0") ||
               cleanV6.startsWith("2c0f:f248");
    }
    return false;
}

