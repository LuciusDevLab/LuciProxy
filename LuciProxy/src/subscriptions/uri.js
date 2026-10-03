/**
 * LuciProxy - Plaintext URI Subscription Builder (vless:// & trojan://)
 * Standardized link synthesizers for VLESS and Trojan client profiles.
 *
 * Independent implementation authored specifically for LuciProxy.
 */

import {
    getAllProfiles,
    getProfileHostNames,
    getEffectivePips,
    getCleanIpsWithNames,
    calcEffectiveIps
} from "../users/manager.js";
import { getTransportParams } from "../utils/helpers.js";
import { getConfigName, getFakeConfigNames } from "./tags.js";

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

export async function buildUriProfile(hostName, targetSub = null, allowInsecure = false, sysConfig) {
    const ports = sysConfig.socketPorts
        ? sysConfig.socketPorts
              .split(",")
              .map((s) => s.trim())
              .filter(Boolean)
        : ["443"];
    const reqPath = encodeURI(`/${sysConfig.apiRoute}`);

    const lines = [];
    const profiles = getAllProfiles(sysConfig, targetSub);

    // 1. Add fake config informational nodes
    const fakeNames = getFakeConfigNames(sysConfig, targetSub);
    fakeNames.forEach((name) => {
        lines.push(
            `trojan://00000000-0000-0000-0000-000000000000@127.0.0.1:1080?security=none#${encodeURIComponent(name)}`
        );
    });

    // 2. Iterate through each profile
    profiles.forEach((p) => {
        const pips = getEffectivePips(p, sysConfig);
        const effectiveMode = p.userMode || sysConfig.mode;
        const effectivePorts = p.userPorts
            ? p.userPorts
                  .split(",")
                  .map((s) => s.trim())
                  .filter(Boolean)
            : ports;
        const maxCfg = p.maxConfigs || null;
        const profileHostNames = getProfileHostNames(hostName, p);
        const fragParam = getFragmentQueryParam(sysConfig, p);

        let configIndex = 0;

        profileHostNames.forEach((hName) => {
            const ipEntries = getCleanIpsWithNames(hName, p.cleanIp, sysConfig);
            const allIps = ipEntries.map((e) => e.ip);
            const ips = calcEffectiveIps(allIps, maxCfg, effectiveMode, effectivePorts, pips.length);

            const ipNameMap = {};
            ipEntries.forEach((e) => {
                ipNameMap[e.ip] = e.name;
            });

            effectivePorts.forEach((port) => {
                const sec = getTransportParams(port);
                let extBase = `encryption=none&security=${sec}&sni=${hName}&fp=${sysConfig.agent}&type=ws&host=${hName}&path=${reqPath}`;
                if (sysConfig.enableOpt2) extBase += `&pbk=enabled`;
                extBase += `&allowInsecure=${allowInsecure ? "1" : "0"}`;
                if (sec === "tls" && fragParam) extBase += fragParam;

                ips.forEach((ip) => {
                    const _pips = pips.length > 0 ? pips : [null];
                    _pips.forEach((selectedProxyIp) => {
                        const ipName = ipNameMap[ip] || "";

                        // VLESS node
                        if (effectiveMode === "alpha" || effectiveMode === "both") {
                            const vName = getConfigName(
                                "alpha",
                                p.name,
                                port,
                                hName,
                                ip,
                                selectedProxyIp,
                                configIndex,
                                ipName,
                                sysConfig
                            );
                            lines.push(`vless://${p.id}@${ip}:${port}?${extBase}#${encodeURIComponent(vName)}`);
                            configIndex++;
                        }

                        // Trojan node
                        if (effectiveMode === "beta" || effectiveMode === "both") {
                            let extTrojan = `security=${sec}&sni=${hName}&alpn=h2,http/1.1&fp=${sysConfig.agent}&type=ws&host=${hName}&path=${reqPath}`;
                            extTrojan += `&allowInsecure=${allowInsecure ? "1" : "0"}`;
                            if (sec === "tls" && fragParam) extTrojan += fragParam;

                            const tName = getConfigName(
                                "beta",
                                p.name,
                                port,
                                hName,
                                ip,
                                selectedProxyIp,
                                configIndex,
                                ipName,
                                sysConfig
                            );
                            lines.push(`trojan://${p.id}@${ip}:${port}?${extTrojan}#${encodeURIComponent(tName)}`);
                            configIndex++;
                        }
                    });
                });
            });
        });
    });

    return lines.join("\n");
}
