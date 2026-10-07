/**
 * LuciProxy - Sing-Box JSON Profile Generator
 * Modern Sing-Box 1.9+ / 1.14+ compliant JSON configuration generator.
 *
 * Independent implementation authored specifically for LuciProxy.
 */

import { getFakeConfigNames } from "./tags.js";
import { resolveNetworkPolicy } from "./policy.js";
import { buildSingBoxRules } from "./routing.js";
import { getResolvedEndpointPopulation } from "./population.js";

export async function buildSingBoxJsonProfile(hostName, targetSub = null, allowInsecure = false, sysConfig = {}, runtimeOverrides = {}) {
    const policy = resolveNetworkPolicy(sysConfig, "select", runtimeOverrides.alpn);
    const dnsPolicy = policy.dns;

    const outboundsArr = [];
    const proxyTags = [];
    const fakeTags = [];

    // 1. Add fake config informational nodes
    const fakeNames = getFakeConfigNames(sysConfig, targetSub);
    fakeNames.forEach((name) => {
        outboundsArr.push({
            type: "direct",
            tag: name,
        });
        fakeTags.push(name);
    });

    // 2. Resolve canonical endpoint population
    const population = getResolvedEndpointPopulation(hostName, targetSub, allowInsecure, sysConfig, runtimeOverrides);

    population.forEach((item) => {
        if (item.protocol === "alpha") {
            outboundsArr.push({
                type: "vless",
                tag: item.tag,
                server: item.server,
                server_port: item.port,
                uuid: item.uuid,
                packet_encoding: "",
                domain_resolver: "dns-direct",
                tls: {
                    enabled: item.isTls,
                    server_name: item.sni,
                    insecure: item.allowInsecure,
                    ...(item.alpn ? { alpn: item.alpn } : {}),
                    utls: {
                        enabled: true,
                        fingerprint: item.fingerprint,
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
                    path: item.path,
                    headers: { Host: item.host },
                    early_data_header_name: "Sec-WebSocket-Protocol",
                    max_early_data: 2560,
                },
            });
            proxyTags.push(item.tag);
        } else if (item.protocol === "beta") {
            outboundsArr.push({
                type: "trojan",
                tag: item.tag,
                server: item.server,
                server_port: item.port,
                password: item.password,
                domain_resolver: "dns-direct",
                tls: {
                    enabled: item.isTls,
                    server_name: item.sni,
                    insecure: item.allowInsecure,
                    ...(item.alpn ? { alpn: item.alpn } : {}),
                    utls: {
                        enabled: true,
                        fingerprint: item.fingerprint,
                    },
                    ...(sysConfig.enableECH ? {
                        ech: {
                            enabled: true,
                        }
                    } : {}),
                },
                transport: {
                    type: "ws",
                    path: item.path,
                    headers: { Host: item.host },
                    early_data_header_name: "Sec-WebSocket-Protocol",
                    max_early_data: 2560,
                },
            });
            proxyTags.push(item.tag);
        }
    });

    const selectorGroup = {
        type: "selector",
        tag: "select",
        outbounds: ["auto", ...proxyTags, ...fakeTags],
        default: "auto",
    };

    const urlTestGroup = {
        type: "urltest",
        tag: "auto",
        outbounds: [...proxyTags],
        url: "http://www.gstatic.com/generate_204",
        interval: "5m",
        tolerance: 50,
    };

    const customRules = buildSingBoxRules(sysConfig, "select");

    // Canonical DNS Server Assembly
    const dnsServers = [
        {
            tag: "dns-remote",
            type: dnsPolicy.remoteDns.startsWith("https://") ? "https" : "udp",
            server: dnsPolicy.remoteHost,
            detour: "select"
        },
        dnsPolicy.isLocalSystem
            ? { tag: "dns-direct", type: "local" }
            : { tag: "dns-direct", type: "udp", server: dnsPolicy.localDns }
    ];

    if (dnsPolicy.antiSanctionDns) {
        dnsServers.push({
            tag: "dns-anti-sanction",
            type: dnsPolicy.isAntiSanctionDomain ? "https" : "udp",
            server: dnsPolicy.antiSanctionHost,
            ...(dnsPolicy.isAntiSanctionDomain ? { domain_resolver: "dns-direct" } : {})
        });
    }

    if (dnsPolicy.fakeDns) {
        dnsServers.push({
            tag: "dns-fake",
            type: "fakeip",
            inet4_range: dnsPolicy.fakeIpRangeV4,
            ...(dnsPolicy.fakeIpRangeV6 ? { inet6_range: dnsPolicy.fakeIpRangeV6 } : {})
        });
    }

    if (dnsPolicy.bootstrapHosts && Object.keys(dnsPolicy.bootstrapHosts).length > 0) {
        dnsServers.push({
            tag: "hosts",
            type: "hosts",
            predefined: dnsPolicy.bootstrapHosts
        });
    }

    // Canonical DNS Rules Assembly
    const dnsRules = [
        { clash_mode: "Direct", server: "dns-direct" },
        { clash_mode: "Global", server: "dns-remote" }
    ];

    if (dnsPolicy.bootstrapHosts && Object.keys(dnsPolicy.bootstrapHosts).length > 0) {
        dnsRules.unshift({ ip_accept_any: true, server: "hosts" });
    }

    const threatRuleSets = policy.ruleSets.filter((r) => r.category === "threat").map((r) => r.singbox.geosite);
    if (threatRuleSets.length > 0) {
        dnsRules.push({ action: "reject", rule_set: threatRuleSets });
    }

    const domesticRuleSets = policy.ruleSets.filter((r) => r.category === "domestic").map((r) => r.singbox.geosite);
    if (domesticRuleSets.length > 0) {
        dnsRules.push({ server: "dns-direct", rule_set: domesticRuleSets });
    }

    const sanctionRuleSets = policy.ruleSets.filter((r) => r.category === "sanction").map((r) => r.singbox.geosite);
    if (sanctionRuleSets.length > 0) {
        dnsRules.push({ server: "dns-anti-sanction", rule_set: sanctionRuleSets });
    }

    if (dnsPolicy.fakeDns && sysConfig?.enableTun) {
        dnsRules.push({ inbound: "tun-in", query_type: ["A", "AAAA"], server: "dns-fake" });
    }

    // Remote Rule-Set Assembly
    const ruleSets = policy.ruleSets
        .filter((r) => r.singbox && r.singbox.geositeUrl)
        .map((r) => ({
            type: "remote",
            tag: r.singbox.geosite,
            format: "binary",
            url: r.singbox.geositeUrl,
            download_detour: "direct"
        }));

    const singboxProfile = {
        dns: {
            servers: dnsServers,
            rules: dnsRules,
            strategy: dnsPolicy.strategy,
            independent_cache: true
        },
        inbounds: [
            { type: "mixed", tag: "mixed-in", listen: "127.0.0.1", listen_port: 2080 },
            ...(sysConfig?.enableTun ? [{
                type: "tun",
                tag: "tun-in",
                address: ["172.19.0.1/28"],
                mtu: 9000,
                auto_route: true,
                strict_route: true,
                stack: "mixed"
            }] : [])
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
            ...(ruleSets.length > 0 ? { rule_set: ruleSets } : {}),
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
