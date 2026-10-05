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
import {
    PRIVATE_IP_CIDRS,
    CORE_THREAT_DOMAINS,
    CORE_AI_DOMAINS,
    CORE_DEV_DOMAINS
} from "./rules.js";

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

    // Domestic bypass (Iran, custom ranges)
    const domesticDomains = ["domain:ir"];
    if (Array.isArray(sysConfig.customBypassRules)) {
        sysConfig.customBypassRules.filter((r) => !r.includes("/")).forEach((d) => {
            domesticDomains.push(`domain:${d}`);
        });
    }
    dnsServers.push({
        address: directDnsAddr,
        domains: [...new Set(domesticDomains)],
        skipFallback: true
    });

    const sanctionDomains = [];
    if (sysConfig.bypassAi || sysConfig.bypassOpenAi) {
        CORE_AI_DOMAINS.forEach((d) => sanctionDomains.push(`domain:${d}`));
    }
    if (sysConfig.bypassDev) {
        CORE_DEV_DOMAINS.forEach((d) => sanctionDomains.push(`domain:${d}`));
    }
    if (Array.isArray(sysConfig.customBypassSanctionRules)) {
        sysConfig.customBypassSanctionRules.forEach((d) => {
            if (d) sanctionDomains.push(`domain:${d}`);
        });
    }
    if (sanctionDomains.length > 0) {
        dnsServers.push({
            address: dnsPolicy.antiSanctionDns,
            domains: [...new Set(sanctionDomains)],
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
    if (sysConfig.blockThreats || sysConfig.blockMalware || sysConfig.blockPhishing) {
        CORE_THREAT_DOMAINS.forEach((domain) => {
            dnsHosts[`domain:${domain}`] = "#3";
        });
        if (Array.isArray(sysConfig.customBlockRules)) {
            sysConfig.customBlockRules.forEach((d) => {
                if (d) dnsHosts[`domain:${d}`] = "#3";
            });
        }
    }

    // Routing rules with deterministic precedence
    const routingRules = [
        { type: "field", inboundTag: ["dns-in"], outboundTag: "dns-out" },
        { type: "field", inboundTag: ["remote-dns"], ...proxyTarget },
        { type: "field", inboundTag: ["dns"], outboundTag: "direct" },
        { type: "field", outboundTag: "direct", ip: [...PRIVATE_IP_CIDRS] }
    ];

    if (sysConfig.blockUDP443) {
        routingRules.push({
            type: "field",
            network: "udp",
            port: "443",
            outboundTag: "block"
        });
    }

    if (sysConfig.blockThreats || sysConfig.blockMalware || sysConfig.blockPhishing) {
        const threatDomains = [...CORE_THREAT_DOMAINS];
        if (Array.isArray(sysConfig.customBlockRules)) {
            sysConfig.customBlockRules.forEach((d) => {
                if (d && !threatDomains.includes(d)) threatDomains.push(d);
            });
        }
        routingRules.push({
            type: "field",
            domain: threatDomains.map((d) => `domain:${d}`),
            outboundTag: "block"
        });
    }

    // Domestic bypass
    const customBypassIps = Array.isArray(sysConfig.customBypassRules)
        ? sysConfig.customBypassRules.filter((r) => r.includes("/"))
        : [];
    if (customBypassIps.length > 0) {
        routingRules.push({
            type: "field",
            outboundTag: "direct",
            ip: customBypassIps
        });
    }

    routingRules.push({
        type: "field",
        outboundTag: "direct",
        domain: [...new Set(domesticDomains)]
    });

    // Sanction bypass
    if (sanctionDomains.length > 0) {
        routingRules.push({
            type: "field",
            outboundTag: "direct",
            domain: [...new Set(sanctionDomains)]
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
