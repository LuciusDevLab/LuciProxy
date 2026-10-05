/**
 * LuciProxy - Public Routing Coordinator & Canonical Facade
 *
 * Exposes canonical policy resolution and compiles deterministic routing rules
 * for Sing-box, Clash / Mihomo, and Xray / V2Ray engines.
 *
 * Independent implementation authored specifically for LuciProxy.
 */

import {
    CORE_AI_DOMAINS,
    CORE_DEV_DOMAINS,
    CORE_THREAT_DOMAINS,
    PRIVATE_IP_CIDRS,
    RULESET_CATALOG
} from "./rules.js";
import { resolveNetworkPolicy } from "./policy.js";

// Re-export constants for backward compatibility
export const AI_DOMAINS = [...CORE_AI_DOMAINS];
export const DEV_DOMAINS = [...CORE_DEV_DOMAINS];
export const THREAT_DOMAINS = [...CORE_THREAT_DOMAINS];

export const RULESET_URLS = {
    malware: RULESET_CATALOG.malware.singbox.geositeUrl,
    phishing: RULESET_CATALOG.phishing.singbox.geositeUrl,
    cryptominers: RULESET_CATALOG.cryptominers.singbox.geositeUrl,
    ads: RULESET_CATALOG.ads.singbox.geositeUrl,
    iran: RULESET_CATALOG.iran.singbox.geositeUrl,
    china: RULESET_CATALOG.china.singbox.geositeUrl,
    russia: RULESET_CATALOG.russia.singbox.geositeUrl,
    openai: RULESET_CATALOG.openai.singbox.geositeUrl
};

/**
 * Builds routing rules for Sing-Box 1.10+ / 1.14+ JSON configuration.
 * Adheres strictly to deterministic precedence:
 *   Sniff/Hijack -> Transport (QUIC/UDP) -> Threats -> Bypasses -> Selector
 */
export function buildSingBoxRules(sysConfig = {}, defaultOutbound = "select") {
    const rules = [
        {
            action: "sniff"
        },
        {
            protocol: "dns",
            action: "hijack-dns"
        },
        {
            ip_is_private: true,
            outbound: "direct"
        }
    ];

    // 1. Anti-DPI Transport: Block UDP/443 (QUIC) to prevent ISP rate limiting
    if (sysConfig.blockUDP443) {
        rules.push({
            network: "udp",
            port: 443,
            action: "reject",
            outbound: "block" // Backward-compatible tag
        });
    }

    // 2. Security Threat Rejection (Precedes destination bypasses and global mode)
    if (sysConfig.blockThreats || sysConfig.blockMalware || sysConfig.blockPhishing) {
        rules.push({
            domain_suffix: THREAT_DOMAINS,
            action: "reject",
            outbound: "block" // Backward-compatible tag
        });
    }

    // 3. Client Core Mode Overrides (Direct / Global)
    rules.push(
        {
            clash_mode: "Direct",
            outbound: "direct"
        },
        {
            clash_mode: "Global",
            outbound: defaultOutbound
        }
    );

    // 4. Domestic Bypasses (Iran, etc.)
    if (sysConfig.bypassIran) {
        rules.push({
            rule_set: ["geosite-ir"],
            outbound: "direct"
        });
    }

    // 4. Sanction Service Steering
    if (sysConfig.bypassAi) {
        rules.push({
            domain_suffix: AI_DOMAINS,
            outbound: "direct"
        });
    }

    if (sysConfig.bypassDev) {
        rules.push({
            domain_suffix: DEV_DOMAINS,
            outbound: "direct"
        });
    }

    return rules;
}

/**
 * Builds routing rules for Clash / Clash.Meta / Mihomo YAML configuration.
 * Adheres strictly to deterministic precedence:
 *   Transport (QUIC/UDP) -> Threats -> LAN -> Domestic -> Sanctions -> MATCH
 */
export function buildClashRules(sysConfig = {}, defaultGroup = "PROXY") {
    const rules = [];

    // 1. Anti-DPI Transport: Block UDP/443 (QUIC)
    if (sysConfig.blockUDP443) {
        rules.push("AND,((NETWORK,udp),(DST-PORT,443)),REJECT");
    }

    // 2. Threat Rejection (Precedes destination bypasses)
    if (sysConfig.blockThreats || sysConfig.blockMalware || sysConfig.blockPhishing) {
        THREAT_DOMAINS.forEach((domain) => {
            rules.push(`DOMAIN-SUFFIX,${domain},REJECT`);
        });
    }

    // 3. Private / LAN Networks
    rules.push("GEOIP,lan,DIRECT,no-resolve");

    // 4. Domestic / Direct Bypasses (Iran, etc.)
    rules.push("GEOIP,IR,DIRECT");
    if (sysConfig.bypassChina) {
        rules.push("GEOIP,CN,DIRECT");
    }
    if (sysConfig.bypassRussia) {
        rules.push("GEOIP,RU,DIRECT");
    }

    // 5. Sanction Service Steering
    if (sysConfig.bypassAi) {
        AI_DOMAINS.forEach((domain) => {
            rules.push(`DOMAIN-SUFFIX,${domain},DIRECT`);
        });
    }

    if (sysConfig.bypassDev) {
        DEV_DOMAINS.forEach((domain) => {
            rules.push(`DOMAIN-SUFFIX,${domain},DIRECT`);
        });
    }

    // 6. Default Egress
    rules.push(`MATCH,${defaultGroup}`);
    return rules;
}

export { resolveNetworkPolicy };
