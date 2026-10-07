/**
 * LuciProxy - Proxy IP Manager & Edge Relay Policy
 * Authoritative manager for upstream Proxy IP pools, validation, normalization,
 * deterministic edge selection, intra-pool failover, and subscription integration.
 *
 * Clean-room implementation authored specifically for LuciProxy.
 */

// Approved built-in default Proxy IP pool (RFC-compliant hostnames/ports)
export const DEFAULT_PROXY_IP_POOL = [
    "proxyip.fxxk.dedyn.io",
    "workers.cloudflare.cyou",
    "proxyip.jp.fxxk.dedyn.io",
    "proxyip.sg.fxxk.dedyn.io"
];

// RFC 1123 hostname validation pattern
const HOSTNAME_REGEX = /^(?:[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?\.)+[a-zA-Z]{2,}$/;
// Standard IPv4 dotted-decimal pattern
const IPV4_REGEX = /^(?:(?:25[0-5]|2[0-4][0-9]|1[0-9]{2}|[1-9]?[0-9])\.){3}(?:25[0-5]|2[0-4][0-9]|1[0-9]{2}|[1-9]?[0-9])$/;

/**
 * Validates whether a string is a well-formed IPv6 address.
 * Supports full, compressed (::), and standard hex group notation.
 * @param {string} ip
 * @returns {boolean}
 */
export function isValidIPv6(ip) {
    if (!ip || typeof ip !== "string") return false;
    const clean = ip.trim();
    if (!/^[a-fA-F0-9:]+$/.test(clean)) return false;
    if (clean.includes(":::")) return false;

    const doubleColonCount = (clean.match(/::/g) || []).length;
    if (doubleColonCount > 1) return false;

    const parts = clean.split(":");
    if (doubleColonCount === 0 && parts.length !== 8) return false;
    if (doubleColonCount === 1 && parts.length > 8) return false;

    for (const part of parts) {
        if (part.length > 4) return false;
    }
    return true;
}

/**
 * Parses and validates an individual Proxy IP entry.
 * Accepts:
 *   - Hostname: example.com, example.com:443
 *   - IPv4: 1.2.3.4, 1.2.3.4:443
 *   - IPv6: 2606:4700::1, [2606:4700::1]:443, [2606:4700::1]
 * @param {string} rawEntry
 * @param {number} defaultPort Default 443
 * @returns {object|null} Parsed descriptor or null if invalid
 */
export function parseProxyIpEntry(rawEntry, defaultPort = 443) {
    if (!rawEntry || typeof rawEntry !== "string") return null;

    // Strip optional comments (#...) and trim
    let entry = rawEntry.split("#")[0].trim();
    if (!entry) return null;

    // Prevent control characters, quotes, or URI injection tokens
    if (/[\s<>"'\\/;,?&]/.test(entry)) return null;

    let host = "";
    let port = defaultPort;
    let isIpv6 = false;

    // Check for bracketed IPv6: [2606:4700::1] or [2606:4700::1]:443
    if (entry.startsWith("[")) {
        const closeIdx = entry.indexOf("]");
        if (closeIdx === -1) return null;
        host = entry.slice(1, closeIdx);
        if (!isValidIPv6(host)) return null;
        isIpv6 = true;

        const remainder = entry.slice(closeIdx + 1);
        if (remainder) {
            if (!remainder.startsWith(":")) return null;
            const parsedPort = parseInt(remainder.slice(1), 10);
            if (isNaN(parsedPort) || parsedPort < 1 || parsedPort > 65535) return null;
            port = parsedPort;
        }
    } else {
        // Unbracketed entry: could be IPv6 without brackets, IPv4:port, host:port, IPv4, or host
        const colonCount = (entry.match(/:/g) || []).length;
        if (colonCount > 1) {
            // Unbracketed IPv6 (e.g. 2606:4700::1)
            if (!isValidIPv6(entry)) return null;
            host = entry;
            isIpv6 = true;
            port = defaultPort;
        } else if (colonCount === 1) {
            // host:port or ipv4:port
            const [h, p] = entry.split(":");
            const parsedPort = parseInt(p, 10);
            if (isNaN(parsedPort) || parsedPort < 1 || parsedPort > 65535) return null;
            host = h;
            port = parsedPort;
        } else {
            // host or ipv4 with default port
            host = entry;
            port = defaultPort;
        }
    }

    // Validate host format
    if (!isIpv6) {
        const isIpv4 = IPV4_REGEX.test(host);
        const isHostname = HOSTNAME_REGEX.test(host);
        if (!isIpv4 && !isHostname) {
            return null;
        }
    }

    const cleanHost = isIpv6 ? `[${host}]` : host;
    const formatted = port === 443 ? cleanHost : (isIpv6 ? `[${host}]:${port}` : `${host}:${port}`);

    return {
        host,
        port,
        isIpv6,
        formatted,
        cleanHost,
        raw: entry
    };
}

/**
 * Validates a candidate Proxy IP entry and provides descriptive feedback.
 * @param {string} entry
 * @returns {{ valid: boolean, error?: string, parsed?: object }}
 */
export function validateProxyIpEntry(entry) {
    if (!entry || typeof entry !== "string" || !entry.trim()) {
        return { valid: false, error: "Empty Proxy IP entry" };
    }
    const parsed = parseProxyIpEntry(entry);
    if (!parsed) {
        return { valid: false, error: `Invalid Proxy IP format: "${entry}". Supported formats: host, host:port, IPv4, IPv4:port, IPv6, [IPv6]:port.` };
    }
    return { valid: true, parsed };
}

/**
 * Normalizes a single Proxy IP string into standard host:port or [ipv6]:port notation.
 * @param {string} entry
 * @returns {string|null}
 */
export function normalizeProxyIp(entry) {
    const parsed = parseProxyIpEntry(entry);
    return parsed ? parsed.formatted : null;
}

/**
 * Parses and deduplicates a multiline, comma-separated, or semicolon-separated Proxy IP list.
 * @param {string|Array<string>} input
 * @returns {Array<object>} Array of parsed, deduplicated descriptors
 */
export function parseProxyIpList(input) {
    if (!input) return [];

    let rawList = [];
    if (Array.isArray(input)) {
        rawList = input;
    } else if (typeof input === "string") {
        rawList = input.split(/[\r\n,;]+/);
    } else {
        return [];
    }

    const seen = new Set();
    const result = [];

    for (const item of rawList) {
        const parsed = parseProxyIpEntry(item);
        if (parsed) {
            const key = parsed.formatted.toLowerCase();
            if (!seen.has(key)) {
                seen.add(key);
                result.push(parsed);
            }
        }
    }

    return result;
}

/**
 * Checks whether an explicit user Proxy IP override is active on a subscriber profile.
 * An empty string or whitespace-only entry is strictly treated as empty.
 * @param {object} profile Subscriber profile
 * @returns {boolean} True if user has configured non-empty custom Proxy IPs
 */
export function isUserProxyIpOverrideActive(profile) {
    if (!profile?.proxyIp || typeof profile.proxyIp !== "string") return false;
    const clean = profile.proxyIp.trim();
    if (!clean) return false;
    const parsed = parseProxyIpList(clean);
    return parsed.length > 0;
}

/**
 * Determines whether Proxy IP routing is enabled for a given profile and system configuration.
 *
 * Evaluation Order:
 * 1. Profile-level explicit disable (highest precedence for profile scope)
 * 2. System-level explicit disable (global kill-switch in settings)
 *
 * @param {object} [profile] Subscriber profile
 * @param {object} [sysConfig] System configuration
 * @returns {boolean} True if Proxy IP is enabled; false if explicitly disabled (State 1)
 */
export function isProxyIpEnabled(profile = null, sysConfig = {}) {
    // 1. Profile-level explicit disable
    if (profile) {
        if (profile.enableProxyIp === false) return false;
        if (profile.proxyIpMode === "off" || profile.proxyIpMode === false) return false;
    }

    // 2. System-level global kill-switch
    if (sysConfig) {
        if (sysConfig.enableProxyIp === false) return false;
        if (sysConfig.proxyIpMode === "off") return false;
    }

    return true;
}

/**
 * Authoritatively resolves the Proxy IP policy and effective state.
 * Strictly adheres to the 3 canonical runtime states:
 *   STATE 1: OFF
 *   STATE 2: ON + empty (Automatic: Operator Pool > Built-in Pool)
 *   STATE 3: ON + populated (User override)
 *
 * @param {object} [profile] Subscriber profile
 * @param {object} [sysConfig] System configuration
 * @param {object} [context] Selection context { colo, clientId, index, attempt }
 * @returns {object} Canonical policy object:
 *   {
 *     enabled: boolean,
 *     mode: "off" | "auto" | "user",
 *     source: "off" | "user" | "operator" | "builtin",
 *     pool: Array<string>,
 *     selected: string|null
 *   }
 */
export function resolveProxyIpPolicy(profile = null, sysConfig = {}, context = {}) {
    // STATE 1 — PROXY IP OFF
    if (!isProxyIpEnabled(profile, sysConfig)) {
        return {
            enabled: false,
            mode: "off",
            source: "off",
            pool: [],
            selected: null
        };
    }

    // STATE 3 — PROXY IP ON + USER FIELD NOT EMPTY
    if (isUserProxyIpOverrideActive(profile)) {
        const userEntries = parseProxyIpList(profile.proxyIp);
        const pool = userEntries.map((e) => e.formatted);
        const selected = pool.length > 0 ? selectDeterministicProxyIp(pool, context) : null;
        return {
            enabled: true,
            mode: "user",
            source: "user",
            pool,
            selected
        };
    }

    // STATE 2 — PROXY IP ON + USER FIELD EMPTY (AUTOMATIC MODE)
    // Precedence: Operator Custom Pool > Built-In Pool
    const opMode = sysConfig?.proxyIpMode || "builtin";
    if (opMode === "custom") {
        const customSource = sysConfig?.proxyIpPool || sysConfig?.customRelay || sysConfig?.backupRelay || "";
        const operatorEntries = parseProxyIpList(customSource);
        if (operatorEntries.length > 0) {
            const pool = operatorEntries.map((e) => e.formatted);
            const selected = pool.length > 0 ? selectDeterministicProxyIp(pool, context) : null;
            return {
                enabled: true,
                mode: "auto",
                source: "operator",
                pool,
                selected
            };
        }
    }

    // Fallback to built-in default pool (the 4 approved endpoints)
    const pool = [...DEFAULT_PROXY_IP_POOL];
    const selected = pool.length > 0 ? selectDeterministicProxyIp(pool, context) : null;
    return {
        enabled: true,
        mode: "auto",
        source: "builtin",
        pool,
        selected
    };
}

/**
 * Resolves the effective Proxy IP pool according to the core precedence hierarchy:
 *
 *   USER OVERRIDE > OPERATOR CUSTOM POOL > BUILT-IN POOL
 *
 * Precedence Invariants:
 * 1. If subscriber has custom proxyIp configured, use ONLY the subscriber's list.
 * 2. Never merge user custom entries with built-in or operator pool.
 * 3. Never fall back to built-in pool when a user override is present.
 * 4. Only an empty or cleared user override restores the global/built-in pool.
 * 5. If Proxy IP is disabled at profile or system level, returns empty array.
 *
 * @param {object} profile Subscriber profile
 * @param {object} sysConfig System configuration
 * @returns {Array<string>} Array of normalized Proxy IP formatted strings
 */
export function getEffectiveProxyIpPool(profile = null, sysConfig = {}) {
    const policy = resolveProxyIpPolicy(profile, sysConfig);
    return policy.pool;
}

/**
 * Deterministically selects a candidate Proxy IP from the active pool.
 *
 * Algorithm Design:
 * - Uses 32-bit FNV-1a hash over Cloudflare Edge Colo, subscriber ID, and index.
 * - Prevents flapping: connections from the same edge colo for the same user
 *   consistently map to the same Proxy IP.
 * - Resilient intra-pool failover: when attempt > 0, it advances deterministically
 *   through candidates in the active pool modulo pool length.
 *
 * @param {Array<string|object>} pool Active Proxy IP pool
 * @param {object} context Context descriptor { colo, clientId, index, attempt }
 * @returns {string|null} Selected Proxy IP or null if pool empty
 */
export function selectDeterministicProxyIp(pool, context = {}) {
    if (!Array.isArray(pool) || pool.length === 0) return null;

    const colo = String(context.colo || "DEFAULT").toUpperCase().trim();
    const clientId = String(context.clientId || "").trim();
    const index = Number(context.index) || 0;
    const attempt = Number(context.attempt) || 0;

    // FNV-1a 32-bit hash
    let hash = 2166136261;
    const key = `${colo}:${clientId}:${index}`;
    for (let i = 0; i < key.length; i++) {
        hash ^= key.charCodeAt(i);
        hash = Math.imul(hash, 16777619);
    }

    const baseIndex = Math.abs(hash >>> 0) % pool.length;
    const targetIndex = (baseIndex + attempt) % pool.length;

    const item = pool[targetIndex];
    return typeof item === "object" && item !== null ? item.formatted : String(item);
}
