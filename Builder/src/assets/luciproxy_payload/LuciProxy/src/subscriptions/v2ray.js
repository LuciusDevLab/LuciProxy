/**
 * LuciProxy - V2Ray / Xray JSON Profile Generator
 * Configuration synthesizers for standard Xray and V2Ray clients.
 *
 * Independent implementation authored specifically for LuciProxy.
 */

import { getResolvedEndpointPopulation } from "./population.js";
import { formatXrayFinalMask } from "./finalmask.js";
import { isIpAddress } from "./dns.js";
import { resolveNetworkPolicy } from "./policy.js";
import {
    PRIVATE_IP_CIDRS,
    CORE_THREAT_DOMAINS,
    CORE_AI_DOMAINS,
    CORE_DEV_DOMAINS
} from "./rules.js";

export async function buildVJsonProfile(hostName, targetSub = null, allowInsecure = false, sysConfig = {}, runtimeOverrides = {}) {
    const policy = resolveNetworkPolicy(sysConfig, "proxy", runtimeOverrides.alpn);
    const dnsPolicy = policy.dns;

    const outboundsArr = [];
    const allOutboundDomains = new Set();
    if (hostName && !isIpAddress(hostName)) {
        allOutboundDomains.add(hostName.trim());
    }

    const population = getResolvedEndpointPopulation(hostName, targetSub, allowInsecure, sysConfig, runtimeOverrides);

    population.forEach((item) => {
        if (item.host && !isIpAddress(item.host)) {
            allOutboundDomains.add(item.host.trim());
        }
        const xrayFm = formatXrayFinalMask(item.finalMask, item.isTls);

        if (item.protocol === "alpha") {
            outboundsArr.push({
                tag: item.tag,
                protocol: "vless",
                settings: {
                    vnext: [
                        {
                            address: item.server,
                            port: item.port,
                            users: [{ id: item.uuid, encryption: "none" }],
                        },
                    ],
                },
                streamSettings: {
                    network: "ws",
                    security: item.sec,
                    tlsSettings:
                        item.isTls
                            ? {
                                  serverName: item.sni,
                                  allowInsecure: item.allowInsecure,
                                  ...(item.alpn ? { alpn: item.alpn } : {})
                              }
                            : undefined,
                    wsSettings: { path: item.path, host: item.host },
                    ...(xrayFm ? { finalmask: xrayFm } : {}),
                },
            });
        } else if (item.protocol === "beta") {
            outboundsArr.push({
                tag: item.tag,
                protocol: "trojan",
                settings: {
                    servers: [{ address: item.server, port: item.port, password: item.password }],
                },
                streamSettings: {
                    network: "ws",
                    security: item.sec,
                    tlsSettings:
                        item.isTls
                            ? {
                                  serverName: item.sni,
                                  allowInsecure: item.allowInsecure,
                                  ...(item.alpn ? { alpn: item.alpn } : {})
                              }
                            : undefined,
                    wsSettings: { path: item.path, host: item.host },
                    ...(xrayFm ? { finalmask: xrayFm } : {}),
                },
            });
        }
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
        },
        {
            address: directDnsAddr,
            tag: "direct-dns"
        }
    ];

    // Explicit Bootstrap for Proxy Endpoints (evades loop and resolves worker domain directly)
    const outboundDomains = Array.from(allOutboundDomains);
    if (outboundDomains.length > 0) {
        dnsServers.push({
            address: directDnsAddr,
            domains: outboundDomains.map((d) => `full:${d}`),
            tag: "direct-dns",
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
        tag: "direct-dns",
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
            tag: "anti-sanction-dns",
            queryStrategy: "UseIPv4",
            skipFallback: true
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
        { type: "field", inboundTag: ["direct-dns", "anti-sanction-dns", "dns"], outboundTag: "direct" },
        { type: "field", network: "udp", port: "53", outboundTag: "direct" },
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
                sniffing: { enabled: true, destOverride: ["http", "tls", ...(dnsPolicy.fakeDns ? ["fakedns"] : [])], routeOnly: true },
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
