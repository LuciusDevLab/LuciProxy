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
import { isIpAddress } from "./dns.js";
import { resolveNetworkPolicy } from "./policy.js";

export async function buildVJsonProfile(hostName, targetSub = null, allowInsecure = false, sysConfig) {
    const ports = sysConfig.socketPorts
        ? sysConfig.socketPorts
              .split(",")
              .map((s) => s.trim())
              .filter(Boolean)
        : ["443"];

    const policy = resolveNetworkPolicy(sysConfig, "proxy");
    const dnsPolicy = policy.dns;

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
    const allOutboundDomains = new Set();
    if (hostName && !isIpAddress(hostName)) {
        allOutboundDomains.add(hostName.trim());
    }

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
            if (hName && !isIpAddress(hName)) {
                allOutboundDomains.add(hName.trim());
            }
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
                                    wsSettings: { path, host: hName },
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
                                    wsSettings: { path, host: hName },
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

    const firstOutboundTag = outboundsArr[0]?.tag || "proxy";
    const isMultiEndpoint = outboundsArr.length > 1;
    const proxyTags = outboundsArr.map((o) => o.tag);
    const proxyTarget = isMultiEndpoint
        ? { balancerTag: "proxy-balancer" }
        : { outboundTag: firstOutboundTag };

    // Canonical DNS block for Xray
    const directDnsAddr = dnsPolicy.isLocalSystem ? "8.8.8.8" : dnsPolicy.localDns;
    const dnsServers = [
        {
            address: dnsPolicy.remoteDns,
            tag: "remote-dns"
        }
    ];

    // Explicit Bootstrap for Proxy Endpoints (evades loop and resolves worker domain directly)
    const outboundDomains = Array.from(allOutboundDomains);
    if (outboundDomains.length > 0) {
        dnsServers.push({
            address: directDnsAddr,
            domains: outboundDomains.map((d) => `full:${d}`),
            skipFallback: true
        });
    }

    // Domestic bypass
    dnsServers.push({
        address: directDnsAddr,
        domains: ["geosite:category-ir", "domain:ir"],
        skipFallback: true
    });

    if (sysConfig.bypassAi || sysConfig.bypassOpenAi) {
        dnsServers.push({
            address: dnsPolicy.antiSanctionDns,
            domains: ["geosite:openai", "domain:openai.com", "domain:chatgpt.com"],
            skipFallback: true,
            finalQuery: true
        });
    }

    if (dnsPolicy.fakeDns) {
        dnsServers.unshift("fakedns");
    }

    const dnsHosts = {};
    if (dnsPolicy.bootstrapHosts && Object.keys(dnsPolicy.bootstrapHosts).length > 0) {
        Object.entries(dnsPolicy.bootstrapHosts).forEach(([domain, ips]) => {
            dnsHosts[domain] = ips;
        });
    }
    if (sysConfig.blockThreats) {
        dnsHosts["geosite:category-ads-all"] = "#3";
        dnsHosts["domain:doubleclick.net"] = "#3";
    }

    // Routing rules with deterministic precedence
    const routingRules = [
        { type: "field", inboundTag: ["dns-in"], outboundTag: "dns-out" },
        { type: "field", inboundTag: ["remote-dns"], ...proxyTarget },
        { type: "field", inboundTag: ["dns"], outboundTag: "direct" },
        { type: "field", outboundTag: "direct", ip: ["geoip:private"] }
    ];

    if (sysConfig.blockUDP443) {
        routingRules.push({
            type: "field",
            network: "udp",
            port: "443",
            outboundTag: "block"
        });
    }

    if (sysConfig.blockThreats) {
        routingRules.push({
            type: "field",
            domain: ["geosite:category-ads-all", "domain:doubleclick.net"],
            outboundTag: "block"
        });
    }

    // Domestic bypass
    routingRules.push(
        { type: "field", outboundTag: "direct", ip: ["geoip:private", "geoip:ir"] },
        { type: "field", outboundTag: "direct", domain: ["geosite:category-ir"] }
    );

    // Sanction bypass
    if (sysConfig.bypassAi || sysConfig.bypassOpenAi) {
        routingRules.push({
            type: "field",
            outboundTag: "direct",
            domain: ["geosite:openai", "domain:openai.com", "domain:chatgpt.com"]
        });
    }

    // Remaining traffic to proxy
    routingRules.push({
        type: "field",
        network: "tcp",
        ...proxyTarget
    });

    return {
        log: { loglevel: "warning" },
        dns: {
            hosts: dnsHosts,
            servers: dnsServers,
            queryStrategy: dnsPolicy.queryStrategyXray,
            tag: "dns"
        },
        inbounds: [
            {
                port: 10808,
                protocol: "socks",
                settings: { auth: "noauth", udp: true },
                sniffing: { enabled: true, destOverride: ["http", "tls", ...(dnsPolicy.fakeDns ? ["fakedns"] : [])] },
            },
            {
                port: 10853,
                protocol: "dokodemo-door",
                settings: { address: "1.1.1.1", network: "tcp,udp", port: 53 },
                tag: "dns-in"
            }
        ],
        outbounds: [
            ...outboundsArr,
            { protocol: "dns", tag: "dns-out", settings: { rules: [{ action: "hijack" }] } },
            { protocol: "freedom", tag: "direct", settings: { domainStrategy: "UseIP" } },
            { protocol: "blackhole", tag: "block", settings: { response: { type: "http" } } },
        ],
        routing: {
            domainStrategy: "IPIfNonMatch",
            rules: routingRules,
            ...(isMultiEndpoint
                ? {
                      balancers: [
                          {
                              tag: "proxy-balancer",
                              selector: proxyTags,
                              strategy: { type: "leastPing" },
                              fallbackTag: firstOutboundTag,
                          },
                      ],
                  }
                : {}),
        },
        ...(isMultiEndpoint
            ? {
                  observatory: {
                      subjectSelector: proxyTags,
                      probeUrl: "https://www.gstatic.com/generate_204",
                      probeInterval: "30s",
                      enableConcurrency: true,
                  },
              }
            : {}),
    };
}
