/**
 * LuciProxy - Canonical DNS Policy & Resolution Subsystem
 *
 * Models client-side DNS topologies, resolvers, anti-sanction steering,
 * static DoH bootstrap mappings, and FakeDNS pools.
 *
 * Independent implementation authored specifically for LuciProxy.
 */

// Well-known static bootstrap mappings for DoH providers to prevent chicken-and-egg resolution loops
export const KNOWN_DOH_BOOTSTRAP = {
    "dns.google": {
        ipv4: ["8.8.8.8", "8.8.4.4"],
        ipv6: ["2001:4860:4860::8888", "2001:4860:4860::8844"]
    },
    "cloudflare-dns.com": {
        ipv4: ["104.16.248.249", "104.16.249.249", "1.1.1.1", "1.0.0.1"],
        ipv6: ["2606:4700:4700::1111", "2606:4700:4700::1001"]
    },
    "dns.quad9.net": {
        ipv4: ["9.9.9.9", "149.112.112.112"],
        ipv6: ["2620:fe::fe", "2620:fe::9"]
    }
};

/**
 * Detects whether a hostname or IP address belongs to Cloudflare's Anycast edge network.
 * Outbound TCP connections to these addresses through Cloudflare Worker sockets fail
 * due to Cloudflare's edge self-connect / recursive loop protection.
 */
export function isCloudflareAnycast(hostOrIp = "") {
    if (!hostOrIp) return false;
    const clean = hostOrIp.toLowerCase().trim();
    if (clean === "cloudflare-dns.com" || clean === "one.one.one.one") return true;
    if (clean === "1.1.1.1" || clean === "1.0.0.1") return true;
    if (clean.startsWith("2606:4700:")) return true;
    if (/^104\.(1[6-9]|2[0-8])\./.test(clean)) return true;
    if (/^172\.(6[4-7])\./.test(clean)) return true;
    return false;
}

/**
 * Extracts hostname from a DNS URL or address string.
 */
export function extractDnsHost(dnsAddress = "") {
    if (!dnsAddress) return "";
    try {
        if (dnsAddress.includes("://")) {
            const parsed = new URL(dnsAddress);
            return parsed.hostname;
        }
        // Bracketed IPv6 with optional port: [2606:...]:53 or [2606:...]
        const bracketMatch = dnsAddress.match(/^\[([^\]]+)\](?::\d+)?$/);
        if (bracketMatch) {
            return bracketMatch[1];
        }
        // Naked IPv6 literal without port
        if ((dnsAddress.match(/:/g) || []).length > 1) {
            return dnsAddress;
        }
        // IPv4 or domain with optional port: 1.1.1.1:53
        const clean = dnsAddress.split(":")[0];
        return clean;
    } catch {
        return dnsAddress;
    }
}

/**
 * Checks whether an address string is an IP address (IPv4 or IPv6 literal).
 */
export function isIpAddress(address = "") {
    if (!address) return false;
    const clean = address.replace(/\[|\]/g, "").split("/")[0];
    const isV4 = /^(?:25[0-5]|2[0-4]\d|[01]?\d\d?)\.(?:25[0-5]|2[0-4]\d|[01]?\d\d?)\.(?:25[0-5]|2[0-4]\d|[01]?\d\d?)\.(?:25[0-5]|2[0-4]\d|[01]?\d\d?)$/.test(clean);
    const isV6 = clean.includes(":");
    return isV4 || isV6;
}

/**
 * Constructs a normalized Canonical DNS Policy from resolved system/user configuration.
 */
export function buildCanonicalDnsPolicy(sysConfig = {}) {
    const enableIPv6 = Boolean(sysConfig.enableIPv6);
    // localDns defaults to "8.8.8.8" to prevent poisoned OS DNS from failing proxy bootstrap;
    // can also be "system" or "local" if OS resolver is explicitly chosen.
    const localDns = sysConfig.localDns || "8.8.8.8";
    const remoteDns = sysConfig.remoteDns || sysConfig.customDns || "https://8.8.8.8/dns-query";
    const antiSanctionDns = sysConfig.antiSanctionDns || "178.22.122.100";
    const fakeDns = Boolean(sysConfig.fakeDns);

    const remoteHost = extractDnsHost(remoteDns);
    const isRemoteDomain = !isIpAddress(remoteHost);
    const isCloudflare = isCloudflareAnycast(remoteHost);

    // Bootstrap host records
    const bootstrapHosts = {};
    if (isRemoteDomain) {
        const known = KNOWN_DOH_BOOTSTRAP[remoteHost];
        if (known) {
            bootstrapHosts[remoteHost] = enableIPv6
                ? [...known.ipv4, ...known.ipv6]
                : [...known.ipv4];
        }
    }

    const antiSanctionHost = extractDnsHost(antiSanctionDns);
    const isAntiSanctionDomain = !isIpAddress(antiSanctionHost);

    const isLocalSystem = localDns === "local" || localDns === "localhost" || localDns === "system";

    return {
        localDns,
        isLocalSystem,
        remoteDns,
        remoteHost,
        isRemoteDomain,
        isCloudflare,
        antiSanctionDns,
        antiSanctionHost,
        isAntiSanctionDomain,
        fakeDns,
        enableIPv6,
        strategy: enableIPv6 ? "prefer_ipv4" : "ipv4_only",
        queryStrategyXray: enableIPv6 ? "UseIP" : "UseIPv4",
        fakeIpRangeV4: "198.18.0.0/15",
        fakeIpRangeV6: enableIPv6 ? "fc00::/18" : null,
        fakeIpFilter: ["+.lan", "+.local"],
        bootstrapHosts
    };
}
