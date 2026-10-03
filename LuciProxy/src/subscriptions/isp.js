/**
 * LuciProxy - Per-ISP Smart Clean IP Resolver & Carrier Detector
 * Autonomous System Number (ASN) classification based on IANA / RIPE NCC registries.
 *
 * Independent implementation authored specifically for LuciProxy.
 */

// In-memory cache for remote clean IP lists (30 minutes TTL)
const ISP_CACHE = new Map();
const ISP_CACHE_TTL_MS = 30 * 60 * 1000;

/**
 * Detects the subscriber carrier/ISP based on Cloudflare edge request ASN and organization metadata.
 */
export function detectCarrier(requestOrCf) {
    const cf = requestOrCf?.cf || requestOrCf || {};
    const org = String(cf.asOrganization || "").toLowerCase();
    const asn = Number(cf.asn || 0);
    const country = String(cf.country || "").toUpperCase();

    if (country && country !== "IR") {
        return "all";
    }

    if (asn === 44244 || org.includes("irancell") || org.includes("mtn")) {
        return "mtn";
    }
    if (
        asn === 197207 ||
        org.includes("mobile communication company of iran") ||
        org.includes("mcci") ||
        org.includes("hamrah")
    ) {
        return "mci";
    }
    if (asn === 57218 || org.includes("rightel")) {
        return "rightel";
    }
    if (asn === 31549 || org.includes("shatel")) {
        return "shatel";
    }

    return "ir";
}

/**
 * Fetches and caches a clean IP list from a remote URL.
 */
export async function fetchCleanIpList(url) {
    if (!url) return [];
    const cached = ISP_CACHE.get(url);
    if (cached && Date.now() - cached.time < ISP_CACHE_TTL_MS) {
        return cached.list;
    }

    let list = [];
    try {
        const res = await fetch(url, {
            headers: { "User-Agent": "LuciProxy/1.0" },
            cf: { cacheTtl: 1800, cacheEverything: true },
        });
        if (res.ok) {
            const text = await res.text();
            list = text
                .split(/[\r\n]+/)
                .map((line) => line.trim())
                .filter((line) => line && !line.startsWith("#"));
        }
    } catch (e) {
        list = [];
    }

    ISP_CACHE.set(url, { time: Date.now(), list });
    return list;
}

/**
 * Resolves smart clean IPs matching the detected or designated carrier from a pool folder.
 */
export async function resolveIspCleanIps(request, poolFolderUrl, count = 16, userOperator = null) {
    const cleanFolder = String(poolFolderUrl || "").replace(/\/+$/, "");
    if (!cleanFolder) return [];

    const carrier = userOperator && userOperator !== "all" ? userOperator.toLowerCase() : detectCarrier(request);
    const carrierFallbacks = [...new Set([carrier, "ir", "all"])];

    for (const c of carrierFallbacks) {
        const fileUrl = `${cleanFolder}/${c}.txt`;
        const list = await fetchCleanIpList(fileUrl);
        if (list && list.length > 0) {
            // Shuffle deterministically or randomly
            const shuffled = list.slice().sort(() => 0.5 - Math.random());
            const selected = shuffled.slice(0, Math.max(1, count));
            return selected.map((entry) => {
                if (entry.includes("#")) return entry;
                return `${entry}#Luci-${c.toUpperCase()}`;
            });
        }
    }

    return [];
}
