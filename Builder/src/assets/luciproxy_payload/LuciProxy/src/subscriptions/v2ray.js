/**
 * LuciProxy - V2Ray / Xray JSON Profile Generator
 * Configuration synthesizers for standard Xray and V2Ray clients.
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
import { getConfigName } from "./tags.js";
import { generateConfigUuid, safeBtoa } from "../utils/crypto.js";
import { resolveFinalMask, formatXrayFinalMask } from "./finalmask.js";

export async function buildVJsonProfile(hostName, targetSub = null, allowInsecure = false, sysConfig) {
    const ports = sysConfig.socketPorts
        ? sysConfig.socketPorts
              .split(",")
              .map((s) => s.trim())
              .filter(Boolean)
        : ["443"];

    const outboundsArr = [];
    let configIndex = 0;
    const nameCounts = {};

    const getUniqueName = (baseName) => {
        if (!nameCounts[baseName]) {
            nameCounts[baseName] = 1;
            return baseName;
        }
        let c = nameCounts[baseName];
        nameCounts[baseName] = c + 1;
        return `${baseName}-${c}`;
    };

    const profiles = getAllProfiles(sysConfig, targetSub);
    profiles.forEach((p) => {
        const resolvedFm = resolveFinalMask(p, sysConfig);
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
                const sec = getTransportParams(port) === "tls" ? "tls" : "none";
                const xrayFm = formatXrayFinalMask(resolvedFm, sec === "tls");
                const portNum = parseInt(port, 10);

                ips.forEach((ip) => {
                    const _pips = pips.length > 0 ? pips : [null];
                    _pips.forEach((selectedProxyIp) => {
                        const ipName = ipNameMap[ip] || "";

                        if (effectiveMode === "alpha" || effectiveMode === "both") {
                            const tag = getUniqueName(
                                getConfigName("alpha", p.name, port, hName, ip, selectedProxyIp, configIndex, ipName, sysConfig)
                            );
                            const configUuid = generateConfigUuid(p.id, configIndex);
                            const payload = { protocol: "vl", relayIdx: configIndex };
                            const path = `/${sysConfig.apiRoute}?ri=${configIndex}`;

                            outboundsArr.push({
                                tag,
                                protocol: "vless",
                                settings: {
                                    vnext: [
                                        {
                                            address: ip,
                                            port: portNum,
                                            users: [{ id: configUuid, encryption: "none" }],
                                        },
                                    ],
                                },
                                streamSettings: {
                                    network: "ws",
                                    security: sec,
                                    tlsSettings:
                                        sec === "tls"
                                            ? { serverName: hName, allowInsecure: Boolean(allowInsecure) }
                                            : undefined,
                                    wsSettings: { path, headers: { Host: hName } },
                                    ...(xrayFm ? { finalmask: xrayFm } : {}),
                                },
                            });
                            configIndex++;
                        }

                        if (effectiveMode === "beta" || effectiveMode === "both") {
                            const tag = getUniqueName(
                                getConfigName("beta", p.name, port, hName, ip, selectedProxyIp, configIndex, ipName, sysConfig)
                            );
                            const path = `/${sysConfig.apiRoute}?ri=${configIndex}`;

                            outboundsArr.push({
                                tag,
                                protocol: "trojan",
                                settings: {
                                    servers: [{ address: ip, port: portNum, password: p.id }],
                                },
                                streamSettings: {
                                    network: "ws",
                                    security: sec,
                                    tlsSettings:
                                        sec === "tls"
                                            ? { serverName: hName, allowInsecure: Boolean(allowInsecure) }
                                            : undefined,
                                    wsSettings: { path, headers: { Host: hName } },
                                    ...(xrayFm ? { finalmask: xrayFm } : {}),
                                },
                            });
                            configIndex++;
                        }
                    });
                });
            });
        });
    });

    return {
        log: { loglevel: "warning" },
        inbounds: [
            {
                port: 10808,
                protocol: "socks",
                settings: { auth: "noauth", udp: true },
                sniffing: { enabled: true, destOverride: ["http", "tls"] },
            },
        ],
        outbounds: [
            ...outboundsArr,
            { protocol: "freedom", tag: "direct", settings: {} },
            { protocol: "blackhole", tag: "block", settings: {} },
        ],
        routing: {
            domainStrategy: "IPIfNonMatch",
            rules: [
                { type: "field", outboundTag: "direct", ip: ["geoip:private", "geoip:ir"] },
                { type: "field", outboundTag: "direct", domain: ["geosite:category-ir"] },
            ],
        },
    };
}
