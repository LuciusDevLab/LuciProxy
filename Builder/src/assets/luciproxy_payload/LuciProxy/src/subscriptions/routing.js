/**
 * LuciProxy - Curated Routing, Anti-DPI & Rule-Set Engine
 * Rule sets for domain bypass, threat mitigation, and protocol filtering.
 *
 * Independent implementation authored specifically for LuciProxy.
 */

export const AI_DOMAINS = [
    "openai.com",
    "chatgpt.com",
    "ai.com",
    "oaistatic.com",
    "oaiusercontent.com",
    "anthropic.com",
    "claude.ai",
    "deepmind.google",
    "gemini.google.com"
];

export const DEV_DOMAINS = [
    "github.com",
    "githubusercontent.com",
    "gitlab.com",
    "docker.com",
    "oracle.com",
    "intel.com",
    "amd.com",
    "nvidia.com",
    "microsoft.com",
    "adobe.com",
    "epicgames.com"
];

export const THREAT_DOMAINS = [
    "doubleclick.net",
    "adservice.google.com",
    "pagead2.googlesyndication.com",
    "coin-hive.com",
    "coinhive.com",
    "crypto-loot.com"
];

export const RULESET_URLS = {
    malware: "https://raw.githubusercontent.com/Chocolate4U/Iran-sing-box-rules/rule-set/geosite-malware.srs",
    phishing: "https://raw.githubusercontent.com/Chocolate4U/Iran-sing-box-rules/rule-set/geosite-phishing.srs",
    cryptominers: "https://raw.githubusercontent.com/Chocolate4U/Iran-sing-box-rules/rule-set/geosite-cryptominers.srs",
    ads: "https://raw.githubusercontent.com/Chocolate4U/Iran-sing-box-rules/rule-set/geosite-category-ads-all.srs",
    iran: "https://raw.githubusercontent.com/Chocolate4U/Iran-sing-box-rules/rule-set/geosite-ir.srs",
    china: "https://raw.githubusercontent.com/Chocolate4U/Iran-sing-box-rules/rule-set/geosite-cn.srs",
    russia: "https://raw.githubusercontent.com/Chocolate4U/Iran-sing-box-rules/rule-set/geosite-category-ru.srs",
    openai: "https://raw.githubusercontent.com/Chocolate4U/Iran-sing-box-rules/rule-set/geosite-openai.srs"
};

/**
 * Builds routing rules for Sing-Box 1.14+ JSON configuration.
 */
export function buildSingBoxRules(sysConfig = {}, defaultOutbound = "proxy") {
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
        },
        {
            clash_mode: "Direct",
            outbound: "direct"
        },
        {
            clash_mode: "Global",
            outbound: defaultOutbound
        }
    ];

    // Anti-DPI: Block UDP/443 (QUIC) to prevent ISP UDP rate limiting/throttling
    if (sysConfig.blockUDP443) {
        rules.push({
            network: "udp",
            port: 443,
            outbound: "block"
        });
    }

    // Bypass AI services
    if (sysConfig.bypassAi) {
        rules.push({
            domain_suffix: AI_DOMAINS,
            outbound: "direct"
        });
    }

    // Bypass Developer services
    if (sysConfig.bypassDev) {
        rules.push({
            domain_suffix: DEV_DOMAINS,
            outbound: "direct"
        });
    }

    // Block Threats & Ads
    if (sysConfig.blockThreats) {
        rules.push({
            domain_suffix: THREAT_DOMAINS,
            outbound: "block"
        });
    }

    return rules;
}

/**
 * Builds routing rules for Clash / Clash.Meta / Mihomo YAML configuration.
 */
export function buildClashRules(sysConfig = {}, defaultGroup = "PROXY") {
    const rules = [
        "GEOIP,lan,DIRECT,no-resolve",
        "GEOIP,IR,DIRECT"
    ];

    // Anti-DPI: Block UDP/443
    if (sysConfig.blockUDP443) {
        rules.push("AND,((NETWORK,udp),(DST-PORT,443)),REJECT");
    }

    // Bypass AI
    if (sysConfig.bypassAi) {
        AI_DOMAINS.forEach((domain) => {
            rules.push(`DOMAIN-SUFFIX,${domain},DIRECT`);
        });
    }

    // Bypass Dev
    if (sysConfig.bypassDev) {
        DEV_DOMAINS.forEach((domain) => {
            rules.push(`DOMAIN-SUFFIX,${domain},DIRECT`);
        });
    }

    // Block Threats
    if (sysConfig.blockThreats) {
        THREAT_DOMAINS.forEach((domain) => {
            rules.push(`DOMAIN-SUFFIX,${domain},REJECT`);
        });
    }

    rules.push(`MATCH,${defaultGroup}`);
    return rules;
}
