/**
 * LuciProxy - Plaintext URI Subscription Builder (vless:// & trojan://)
 * Standardized link synthesizers for VLESS and Trojan client profiles.
 *
 * Independent implementation authored specifically for LuciProxy.
 */

import { getFakeConfigNames } from "./tags.js";
import { formatVlessFinalMaskParam } from "./finalmask.js";
import { getResolvedEndpointPopulation } from "./population.js";

/**
 * Formats TLS fragmentation parameters for URI links.
 */
export function getFragmentQueryParam(sysConfig, profile = null) {
    const mode = (profile?.fragmentMode || sysConfig?.fragmentMode || "").toLowerCase();
    if (!mode || mode === "off" || mode === "none") return "";

    if (mode === "shadowrocket") return `&fragment=${encodeURIComponent("1,40-60,30-50,tlshello")}`;
    if (mode === "happ") return `&fragment=${encodeURIComponent("3,1,tlshello")}`;
    if (mode === "gentle") return `&fragment=${encodeURIComponent("1,100-200,10-20,tlshello")}`;
    if (mode === "balanced") return `&fragment=${encodeURIComponent("1,40-80,20-40,tlshello")}`;
    if (mode === "aggressive") return `&fragment=${encodeURIComponent("2,20-40,10-30,tlshello")}`;
    if (mode === "custom" && sysConfig?.fragmentParams) {
        const packets = sysConfig.fragmentParams.packets || "1";
        const length = sysConfig.fragmentParams.length || "40-80";
        const interval = sysConfig.fragmentParams.interval || "20-40";
        return `&fragment=${encodeURIComponent(`${packets},${length},${interval},tlshello`)}`;
    }
    return "";
}

export async function buildUriProfile(hostName, targetSub = null, allowInsecure = false, sysConfig = {}, runtimeOverrides = {}) {
    const lines = [];

    // 1. Add fake config informational nodes
    const fakeNames = getFakeConfigNames(sysConfig, targetSub);
    fakeNames.forEach((name) => {
        lines.push(
            `trojan://00000000-0000-0000-0000-000000000000@127.0.0.1:1080?security=none#${encodeURIComponent(name)}`
        );
    });

    // 2. Resolve canonical endpoint population
    const population = getResolvedEndpointPopulation(hostName, targetSub, allowInsecure, sysConfig, runtimeOverrides);

    for (const item of population) {
        const fmParam = formatVlessFinalMaskParam(item.finalMask, true) || getFragmentQueryParam(sysConfig, item);
        const nodeTag = encodeURIComponent(item.tag);

        if (item.protocol === "alpha") {
            let extBase = `encryption=none&security=${item.sec}&sni=${item.sni}&fp=${item.fingerprint}&type=ws&host=${item.host}&path=${item.path}`;
            if (sysConfig.enableOpt2) extBase += `&pbk=enabled`;
            extBase += `&allowInsecure=${item.allowInsecure ? "1" : "0"}`;
            if (item.alpn && item.alpn.length > 0) {
                extBase += `&alpn=${encodeURIComponent(item.alpn.join(","))}`;
            }
            if (item.isTls && fmParam) extBase += fmParam;
            if (item.echVal) {
                extBase += `&ech=${encodeURIComponent(item.echVal)}`;
            }
            lines.push(`vless://${item.profileId}@${item.server}:${item.port}?${extBase}#${nodeTag}`);
        } else if (item.protocol === "beta") {
            let extTrojan = `security=${item.sec}&sni=${item.sni}&fp=${item.fingerprint}&type=ws&host=${item.host}&path=${item.path}`;
            extTrojan += `&allowInsecure=${item.allowInsecure ? "1" : "0"}`;
            if (item.alpn && item.alpn.length > 0) {
                extTrojan += `&alpn=${encodeURIComponent(item.alpn.join(","))}`;
            }
            if (item.isTls && fmParam) extTrojan += fmParam;
            lines.push(`trojan://${item.profileId}@${item.server}:${item.port}?${extTrojan}#${nodeTag}`);
        }
    }

    return lines.join("\n");
}
