/**
 * LuciProxy - FinalMask Resolution & Client Serialization
 * Canonical serialization and import parser for TLS fragmentation / FinalMask.
 * Supports generic VLESS URIs, Xray-core finalmask, and Mihomo/Clash Meta fragment.
 *
 * Independent implementation authored specifically for LuciProxy.
 */

/**
 * Parses an input value (object, JSON string, or comma-separated string)
 * into a canonical FinalMask specification object.
 *
 * @param {object|string} input
 * @returns {object|null} Canonical FinalMask object or null if invalid/disabled
 */
export function parseFinalMask(input) {
    if (!input) return null;

    // 1. Object representation
    if (typeof input === "object" && input !== null) {
        if (input.enabled === false) {
            return null;
        }

        // Support standard Xray / v2rayN / panel { tcp: [ { type: "fragment", settings: { ... } }, ... ] }
        if (Array.isArray(input.tcp) && input.tcp.length > 0) {
            const tcpEntries = input.tcp.map((item) => {
                const s = item.settings || item;
                const packets = String(s.packets || "tlshello").trim();

                let lengths = s.lengths || s.length;
                if (typeof lengths === "string") {
                    lengths = lengths.split(",").map((x) => x.trim()).filter(Boolean);
                } else if (Array.isArray(lengths)) {
                    lengths = lengths.map((x) => String(x).trim()).filter(Boolean);
                }
                if (!lengths || lengths.length === 0) lengths = ["100-200"];

                let delays = s.delays || s.delay || s.interval;
                if (typeof delays === "string") {
                    delays = delays.split(",").map((x) => x.trim()).filter(Boolean);
                } else if (Array.isArray(delays)) {
                    delays = delays.map((x) => String(x).trim()).filter(Boolean);
                }
                if (!delays || delays.length === 0) delays = ["10-20"];

                let maxSplit;
                if (s.maxSplit !== undefined && s.maxSplit !== null && String(s.maxSplit).trim() !== "") {
                    const num = Number(s.maxSplit);
                    if (!isNaN(num)) maxSplit = String(s.maxSplit);
                }

                return {
                    type: "fragment",
                    settings: {
                        packets,
                        lengths,
                        delays,
                        ...(maxSplit !== undefined ? { maxSplit } : {})
                    }
                };
            });

            const primary = tcpEntries[0].settings;
            return {
                enabled: true,
                packets: primary.packets,
                lengths: primary.lengths,
                delays: primary.delays,
                ...(primary.maxSplit !== undefined ? { maxSplit: Number(primary.maxSplit) } : {}),
                tcp: tcpEntries
            };
        }

        const packets = String(input.packets || "tlshello").trim();

        // lengths / length
        let lengths = input.lengths;
        if (!lengths && input.length) {
            lengths = Array.isArray(input.length) ? input.length : [String(input.length)];
        } else if (typeof lengths === "string") {
            lengths = lengths.split(",").map((s) => s.trim()).filter(Boolean);
        } else if (Array.isArray(lengths)) {
            lengths = lengths.map((s) => String(s).trim()).filter(Boolean);
        }
        if (!lengths || lengths.length === 0) {
            lengths = ["100-200"];
        }

        // delays / interval / delay
        let delays = input.delays;
        const fallbackDelay = input.interval || input.delay;
        if (!delays && fallbackDelay) {
            delays = Array.isArray(fallbackDelay) ? fallbackDelay : [String(fallbackDelay)];
        } else if (typeof delays === "string") {
            delays = delays.split(",").map((s) => s.trim()).filter(Boolean);
        } else if (Array.isArray(delays)) {
            delays = delays.map((s) => String(s).trim()).filter(Boolean);
        }
        if (!delays || delays.length === 0) {
            delays = ["10-20"];
        }

        // maxSplit
        let maxSplit;
        if (input.maxSplit !== undefined && input.maxSplit !== null && input.maxSplit !== "") {
            const num = Number(input.maxSplit);
            if (!isNaN(num)) {
                maxSplit = num;
            }
        }

        return {
            enabled: true,
            packets,
            lengths,
            delays,
            ...(maxSplit !== undefined ? { maxSplit } : {}),
            tcp: [
                {
                    type: "fragment",
                    settings: {
                        packets,
                        lengths,
                        delays,
                        ...(maxSplit !== undefined ? { maxSplit: String(maxSplit) } : {})
                    }
                }
            ]
        };
    }

    // 2. String representation
    if (typeof input === "string") {
        const trimmed = input.trim();
        if (!trimmed || trimmed === "off" || trimmed === "none") return null;

        // Try JSON parse if formatted as JSON
        if (trimmed.startsWith("{") && trimmed.endsWith("}")) {
            try {
                const parsed = JSON.parse(trimmed);
                return parseFinalMask(parsed);
            } catch {
                // Not JSON, continue to string parser
            }
        }

        // Comma-separated representation
        // Generic canonical: lengths,delays,packets[,maxSplit]
        // E.g. "101-123,7-9,tlshello" or "101-123,7-9,tlshello,17"
        // Also handles legacy Shadowrocket format: "1,40-80,20-40,tlshello"
        const parts = trimmed.split(",").map((s) => s.trim()).filter(Boolean);
        if (parts.length >= 3) {
            let lengths, delays, packets, maxSplit;

            if (parts.length === 4 && (parts[3].toLowerCase() === "tlshello" || isNaN(Number(parts[3])))) {
                // Format: maxSplit,lengths,delays,packets
                maxSplit = !isNaN(Number(parts[0])) ? Number(parts[0]) : undefined;
                lengths = [parts[1]];
                delays = [parts[2]];
                packets = parts[3];
            } else {
                // Canonical: lengths,delays,packets[,maxSplit]
                lengths = [parts[0]];
                delays = [parts[1]];
                packets = parts[2];
                if (parts.length >= 4 && !isNaN(Number(parts[3]))) {
                    maxSplit = Number(parts[3]);
                }
            }

            return {
                enabled: true,
                packets,
                lengths,
                delays,
                ...(maxSplit !== undefined ? { maxSplit } : {}),
                tcp: [
                    {
                        type: "fragment",
                        settings: {
                            packets,
                            lengths,
                            delays,
                            ...(maxSplit !== undefined ? { maxSplit: String(maxSplit) } : {})
                        }
                    }
                ]
            };
        }

        // Named preset mappings
        const lower = trimmed.toLowerCase();
        if (lower === "shadowrocket") {
            return {
                enabled: true,
                packets: "tlshello",
                lengths: ["40-60"],
                delays: ["30-50"],
                maxSplit: 1,
                tcp: [{ type: "fragment", settings: { packets: "tlshello", lengths: ["40-60"], delays: ["30-50"], maxSplit: "1" } }]
            };
        }
        if (lower === "happ") {
            return {
                enabled: true,
                packets: "tlshello",
                lengths: ["1"],
                delays: ["1"],
                maxSplit: 3,
                tcp: [{ type: "fragment", settings: { packets: "tlshello", lengths: ["1"], delays: ["1"], maxSplit: "3" } }]
            };
        }
        if (lower === "gentle") {
            return {
                enabled: true,
                packets: "tlshello",
                lengths: ["100-200"],
                delays: ["10-20"],
                maxSplit: 1,
                tcp: [{ type: "fragment", settings: { packets: "tlshello", lengths: ["100-200"], delays: ["10-20"], maxSplit: "1" } }]
            };
        }
        if (lower === "balanced") {
            return {
                enabled: true,
                packets: "tlshello",
                lengths: ["40-80"],
                delays: ["20-40"],
                maxSplit: 1,
                tcp: [{ type: "fragment", settings: { packets: "tlshello", lengths: ["40-80"], delays: ["20-40"], maxSplit: "1" } }]
            };
        }
        if (lower === "aggressive") {
            return {
                enabled: true,
                packets: "tlshello",
                lengths: ["20-40"],
                delays: ["10-30"],
                maxSplit: 2,
                tcp: [{ type: "fragment", settings: { packets: "tlshello", lengths: ["20-40"], delays: ["10-30"], maxSplit: "2" } }]
            };
        }
        if (lower === "tlshello" || lower === "finalmask" || lower === "true" || lower === "1" || lower === "on" || lower === "enabled") {
            return {
                enabled: true,
                packets: "tlshello",
                lengths: ["100-200"],
                delays: ["10-20"],
                tcp: [{ type: "fragment", settings: { packets: "tlshello", lengths: ["100-200"], delays: ["10-20"] } }]
            };
        }
    }

    return null;
}

/**
 * Resolves effective FinalMask object applying subscription > global precedence
 * and falling back to legacy fragmentMode if configured.
 *
 * @param {object|null} profile
 * @param {object} sysConfig
 * @returns {object|null}
 */
export function resolveFinalMask(profile, sysConfig) {
    // 1. Subscription-level override
    if (profile && profile.finalMask !== undefined && profile.finalMask !== null) {
        const parsed = parseFinalMask(profile.finalMask);
        if (parsed) return parsed;
    }

    // 2. System-level global finalMask
    if (sysConfig && sysConfig.finalMask !== undefined && sysConfig.finalMask !== null) {
        const parsed = parseFinalMask(sysConfig.finalMask);
        if (parsed) return parsed;
    }

    // 3. System-level or profile-level fragmentMode preset fallback
    const fragMode = (profile?.fragmentMode || sysConfig?.fragmentMode || "").toLowerCase();
    if (fragMode && fragMode !== "off" && fragMode !== "none") {
        if (fragMode === "custom" && sysConfig?.fragmentParams) {
            return parseFinalMask({
                packets: sysConfig.fragmentParams.packets || "tlshello",
                lengths: [sysConfig.fragmentParams.length || "40-80"],
                delays: [sysConfig.fragmentParams.interval || "20-40"],
            });
        }
        return parseFinalMask(fragMode);
    }

    return null;
}

/**
 * Formats canonical query parameter for generic VLESS URIs:
 * &fm=<URL-encoded FinalMask JSON>
 *
 * Strictly adheres to cleartext invariant: port 80 / TLS-off nodes return empty string.
 *
 * @param {object|null} finalMaskObj
 * @param {boolean} isTls
 * @returns {string} e.g. "&fm=%7B%22tcp%22%3A...%7D" or ""
 */
export function formatVlessFinalMaskParam(finalMaskObj, isTls = true) {
    if (!isTls || !finalMaskObj || finalMaskObj.enabled === false) {
        return "";
    }

    const canonicalTcp = (Array.isArray(finalMaskObj.tcp) && finalMaskObj.tcp.length > 0)
        ? { tcp: finalMaskObj.tcp }
        : {
            tcp: [
                {
                    type: "fragment",
                    settings: {
                        packets: String(finalMaskObj.packets || "tlshello"),
                        lengths: Array.isArray(finalMaskObj.lengths)
                            ? finalMaskObj.lengths.map(String)
                            : [String(finalMaskObj.lengths || "100-200")],
                        delays: Array.isArray(finalMaskObj.delays)
                            ? finalMaskObj.delays.map(String)
                            : [String(finalMaskObj.delays || "10-20")],
                        ...(finalMaskObj.maxSplit !== undefined && finalMaskObj.maxSplit !== null && String(finalMaskObj.maxSplit).trim() !== ""
                            ? { maxSplit: String(finalMaskObj.maxSplit) }
                            : {})
                    }
                }
            ]
        };

    return `&fm=${encodeURIComponent(JSON.stringify(canonicalTcp))}`;
}

/**
 * Formats canonical query parameter for generic VLESS URIs:
 * &fragment=lengths,delays,packets[,maxSplit]
 *
 * Strictly adheres to cleartext invariant: port 80 / TLS-off nodes return empty string.
 *
 * @param {object|null} finalMaskObj
 * @param {boolean} isTls
 * @returns {string} e.g. "&fragment=101-123%2C7-9%2Ctlshello%2C17" or ""
 */
export function formatVlessFragmentParam(finalMaskObj, isTls = true) {
    if (!isTls || !finalMaskObj || finalMaskObj.enabled === false) {
        return "";
    }

    const lengthsStr = Array.isArray(finalMaskObj.lengths)
        ? finalMaskObj.lengths.join(",")
        : String(finalMaskObj.lengths || "100-200");
    const delaysStr = Array.isArray(finalMaskObj.delays)
        ? finalMaskObj.delays.join(",")
        : String(finalMaskObj.delays || "10-20");
    const packetsStr = String(finalMaskObj.packets || "tlshello");

    let rawVal = `${lengthsStr},${delaysStr},${packetsStr}`;
    if (finalMaskObj.maxSplit !== undefined && !isNaN(finalMaskObj.maxSplit)) {
        rawVal += `,${finalMaskObj.maxSplit}`;
    }

    return `&fragment=${encodeURIComponent(rawVal)}`;
}

/**
 * Formats native Xray-core streamSettings.finalmask structure.
 *
 * @param {object|null} finalMaskObj
 * @param {boolean} isTls
 * @returns {object|undefined}
 */
export function formatXrayFinalMask(finalMaskObj, isTls = true) {
    if (!isTls || !finalMaskObj || finalMaskObj.enabled === false) {
        return undefined;
    }

    const lengths = Array.isArray(finalMaskObj.lengths)
        ? finalMaskObj.lengths.map(String)
        : [String(finalMaskObj.lengths || "100-200")];
    const delays = Array.isArray(finalMaskObj.delays)
        ? finalMaskObj.delays.map(String)
        : [String(finalMaskObj.delays || "10-20")];
    const packets = String(finalMaskObj.packets || "tlshello");

    const result = {
        enabled: true,
        packets,
        lengths,
        delays,
    };

    if (finalMaskObj.maxSplit !== undefined && !isNaN(finalMaskObj.maxSplit)) {
        result.maxSplit = Number(finalMaskObj.maxSplit);
    }

    return result;
}

/**
 * Formats native Mihomo / Clash Meta YAML fragment block.
 *
 * @param {object|null} finalMaskObj
 * @param {boolean} isTls
 * @param {string} indent
 * @returns {string}
 */
export function formatClashFragmentYaml(finalMaskObj, isTls = true, indent = "    ") {
    if (!isTls || !finalMaskObj || finalMaskObj.enabled === false) {
        return "";
    }

    const packets = String(finalMaskObj.packets || "tlshello");
    const length = Array.isArray(finalMaskObj.lengths)
        ? finalMaskObj.lengths.join(",")
        : String(finalMaskObj.lengths || "100-200");
    const interval = Array.isArray(finalMaskObj.delays)
        ? finalMaskObj.delays.join(",")
        : String(finalMaskObj.delays || "10-20");

    return `\n${indent}fragment:\n${indent}  packets: "${packets}"\n${indent}  length: "${length}"\n${indent}  interval: "${interval}"`;
}

/**
 * Universal client importer for VLESS URIs.
 * Accurately parses standard client semantics:
 * - URL hash is the display name (remark)
 * - query parameter 'fm' or 'fragment' is parsed into native FinalMask settings
 * - cleartext (TLS-off) nodes yield finalmask = null
 *
 * @param {string} uriString
 * @returns {object} Imported node model
 */
export function importVlessUri(uriString) {
    if (!uriString || !uriString.startsWith("vless://")) {
        throw new Error("Invalid VLESS URI: missing vless:// scheme");
    }

    const hashIdx = uriString.indexOf("#");
    const nodeName = hashIdx !== -1 ? decodeURIComponent(uriString.slice(hashIdx + 1)) : "";
    const withoutHash = hashIdx !== -1 ? uriString.slice(0, hashIdx) : uriString;

    const parsedUrl = new URL(withoutHash);
    const uuid = decodeURIComponent(parsedUrl.username);
    const address = parsedUrl.hostname;
    const port = parsedUrl.port ? parseInt(parsedUrl.port, 10) : 443;
    const params = parsedUrl.searchParams;

    const security = params.get("security") || "none";
    const sni = params.get("sni") || "";
    const host = params.get("host") || "";
    const path = params.get("path") || "/";
    const type = params.get("type") || "ws";
    const fp = params.get("fp") || "";
    const ech = params.get("ech") ? decodeURIComponent(params.get("ech")) : "";

    let finalmask = null;
    const fmRaw = params.get("fm") || params.get("finalmask");
    const fragRaw = params.get("fragment");
    if (security === "tls") {
        if (fmRaw) {
            finalmask = parseFinalMask(fmRaw);
        } else if (fragRaw) {
            const decoded = decodeURIComponent(fragRaw);
            finalmask = parseFinalMask(decoded);
        }
    }

    return {
        protocol: "vless",
        uuid,
        address,
        port,
        security,
        sni,
        host,
        path,
        type,
        fp,
        ech,
        name: nodeName,
        finalmask,
        streamSettings: {
            network: type,
            security,
            ...(finalmask ? { finalmask } : {})
        }
    };
}
