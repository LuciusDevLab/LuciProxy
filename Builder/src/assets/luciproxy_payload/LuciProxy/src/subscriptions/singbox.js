/**
 * LuciProxy - Sing-Box JSON Profile Generator
 * Modern Sing-Box 1.9+ / 1.14+ compliant JSON configuration generator.
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
import { buildSingBoxRules } from "./routing.js";

export async function buildSingBoxJsonProfile(hostName, targetSub = null, allowInsecure = false, sysConfig) {
    const ports = sysConfig.socketPorts
        ? sysConfig.socketPorts
              .split(",")
              .map((s) => s.trim())
              .filter(Boolean)
        : ["443"];
    const reqPath = encodeURI(`/${sysConfig.apiRoute}`);

    const outboundsArr = [];
    const dynamicTags = [];
    const nameCounts = {};

    const getUniqueName = (baseName) => {
        if (!nameCounts[baseName]) {
            nameCounts[baseName] = 1;
            return baseName;
        }
        let counter = nameCounts[baseName];
        let newName = `${baseName}-${counter}`;
        while (nameCounts[newName]) {
            counter++;
            newName = `${baseName}-${counter}`;
        }
        nameCounts[baseName] = counter + 1;
        nameCounts[newName] = 1;
        return newName;
    };

    // 1. Add fake config informational nodes
    const fakeNames = getFakeConfigNames(sysConfig, targetSub);
    fakeNames.forEach((name) => {
        const uName = getUniqueName(name);
        outboundsArr.push({
            type: "direct",
            tag: uName,
        });
        dynamicTags.push(uName);
    });

    // 2. Iterate profiles
    const profiles = getAllProfiles(sysConfig, targetSub);
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

        let configIndex = 0;

        profileHostNames.forEach((hName) => {
            const rawEntries = getCleanIpsWithNames(hName, p.cleanIp, sysConfig);
            const hasPrimary = rawEntries.some((e) => e.ip.toLowerCase() === hName.toLowerCase());
            const ipEntries = hasPrimary ? [...rawEntries] : [...rawEntries, { ip: hName, name: "" }];
            const allIps = ipEntries.map((e) => e.ip);
            const ips = calcEffectiveIps(allIps, maxCfg, effectiveMode, effectivePorts, pips.length);

            const ipNameMap = {};
            ipEntries.forEach((e) => {
                ipNameMap[e.ip] = e.name;
            });

            effectivePorts.forEach((port) => {
                const isTls = getTransportParams(port) === "tls";
                const portNum = parseInt(port, 10);

                ips.forEach((ip) => {
                    const _pips = pips.length > 0 ? pips : [null];
                    _pips.forEach((selectedProxyIp) => {
                        const ipName = ipNameMap[ip] || "";

                        // VLESS Outbound
                        if (effectiveMode === "alpha" || effectiveMode === "both") {
                            const vName = getUniqueName(
                                getConfigName("alpha", p.name, port, hName, ip, selectedProxyIp, configIndex, ipName, sysConfig)
                            );
                            outboundsArr.push({
                                type: "vless",
                                tag: vName,
                                server: ip,
                                server_port: portNum,
                                uuid: p.id,
                                packet_encoding: "xudp",
                                tls: {
                                    enabled: isTls,
                                    server_name: hName,
                                    insecure: allowInsecure,
                                    utls: {
                                        enabled: true,
                                        fingerprint: sysConfig.agent || "chrome",
                                    },
                                    ...(sysConfig.enableECH ? {
                                        ech: {
                                            enabled: true,
                                            pq_signature_schemes_enabled: true,
                                            dynamic_record_sizing_disabled: false,
                                        }
                                    } : {}),
                                },
                                transport: {
                                    type: "ws",
                                    path: reqPath,
                                    headers: { Host: hName },
                                    early_data_header_name: "Sec-WebSocket-Protocol",
                                    max_early_data: 2560,
                                },
                            });
                            dynamicTags.push(vName);
                            configIndex++;
                        }

                        // Trojan Outbound
                        if (effectiveMode === "beta" || effectiveMode === "both") {
                            const tName = getUniqueName(
                                getConfigName("beta", p.name, port, hName, ip, selectedProxyIp, configIndex, ipName, sysConfig)
                            );
                            outboundsArr.push({
                                type: "trojan",
                                tag: tName,
                                server: ip,
                                server_port: portNum,
                                password: p.id,
                                tls: {
                                    enabled: isTls,
                                    server_name: hName,
                                    insecure: allowInsecure,
                                    utls: {
                                        enabled: true,
                                        fingerprint: sysConfig.agent || "chrome",
                                    },
                                    ...(sysConfig.enableECH ? {
                                        ech: {
                                            enabled: true,
                                            pq_signature_schemes_enabled: true,
                                            dynamic_record_sizing_disabled: false,
                                        }
                                    } : {}),
                                },
                                transport: {
                                    type: "ws",
                                    path: reqPath,
                                    headers: { Host: hName },
                                    early_data_header_name: "Sec-WebSocket-Protocol",
                                    max_early_data: 2560,
                                },
                            });
                            dynamicTags.push(tName);
                            configIndex++;
                        }
                    });
                });
            });
        });
    });

    const selectorGroup = {
        type: "selector",
        tag: "select",
        outbounds: ["auto", ...dynamicTags],
        default: "auto",
    };

    const urlTestGroup = {
        type: "urltest",
        tag: "auto",
        outbounds: [...dynamicTags],
        url: "http://www.gstatic.com/generate_204",
        interval: "5m",
        tolerance: 50,
    };

    const customRules = buildSingBoxRules(sysConfig, "select");

    const singboxProfile = {
        dns: {
            servers: [
                { tag: "dns-remote", type: "udp", server: "1.1.1.1" },
                { tag: "dns-direct", type: "local" },
            ],
        },
        inbounds: [
            { type: "mixed", tag: "mixed-in", listen: "127.0.0.1", listen_port: 2080 },
        ],
        outbounds: [
            selectorGroup,
            urlTestGroup,
            ...outboundsArr,
            { type: "direct", tag: "direct" },
            { type: "block", tag: "block" },
        ],
        route: {
            rules: [
                ...customRules,
                { outbound: "select" },
            ],
            auto_detect_interface: true,
            default_domain_resolver: "dns-direct",
        },
    };

    // TLS Fragmentation preset (Sing-Box 1.9+ route-options anti-DPI)
    const fragMode = (sysConfig?.fragmentMode || "").toLowerCase();
    if (fragMode && fragMode !== "off" && fragMode !== "none") {
        applySingBoxFragment(singboxProfile);
    }

    return singboxProfile;
}

/**
 * Prepends Sing-Box 1.9+ route-options anti-DPI TLS fragmentation rule.
 */
export function applySingBoxFragment(configObj) {
    if (!configObj || typeof configObj !== "object") return configObj;
    configObj.route = configObj.route || {};
    if (!Array.isArray(configObj.route.rules)) {
        configObj.route.rules = [];
    }
    if (!configObj.route.rules.some((r) => r && r.action === "route-options" && r.tls_fragment)) {
        configObj.route.rules.unshift({
            action: "route-options",
            tls_fragment: true,
            tls_fragment_fallback_delay: "500ms",
        });
    }
    return configObj;
}

