/**
 * LuciProxy - Rule Precedence & Geo-Asset Classification Engine
 *
 * Implements deterministic multi-tier rule precedence:
 *   1. Transport Layer (QUIC / UDP rejection for TCP-only Worker proxying)
 *   2. Threat & Security Rejection (Malware, Phishing, Miners, Ads, NSFW)
 *   3. Domestic & Regional Bypass (Local LAN, Iran, China, Russia)
 *   4. Sanction Service Steering (AI, Developer Tools via Anti-Sanction DNS)
 *   5. Default Proxy Egress
 *
 * Independent implementation authored specifically for LuciProxy.
 */

export const PRIVATE_IP_CIDRS = [
    "10.0.0.0/8",
    "172.16.0.0/12",
    "192.168.0.0/16",
    "127.0.0.0/8",
    "100.64.0.0/10",
    "169.254.0.0/16",
    "fc00::/7",
    "fe80::/10",
    "::1/128"
];

export const CORE_THREAT_DOMAINS = [
    "doubleclick.net",
    "adservice.google.com",
    "pagead2.googlesyndication.com",
    "coin-hive.com",
    "coinhive.com",
    "crypto-loot.com"
];

export const CORE_AI_DOMAINS = [
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

export const CORE_DEV_DOMAINS = [
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

/**
 * Curated rule-set catalog for binary .srs (Sing-box) and text/yaml (Clash).
 */
export const RULESET_CATALOG = {
    // Threat Rule-Sets
    malware: {
        category: "threat",
        singbox: {
            geosite: "geosite-malware",
            geoip: "geoip-malware",
            geositeUrl: "https://raw.githubusercontent.com/Chocolate4U/Iran-sing-box-rules/rule-set/geosite-malware.srs",
            geoipUrl: "https://raw.githubusercontent.com/Chocolate4U/Iran-sing-box-rules/rule-set/geoip-malware.srs"
        },
        clash: {
            geosite: "malware",
            geoip: "malware-cidr",
            format: "text",
            geositeUrl: "https://raw.githubusercontent.com/Chocolate4U/Iran-clash-rules/release/malware.txt",
            geoipUrl: "https://raw.githubusercontent.com/Chocolate4U/Iran-clash-rules/release/malware-ip.txt"
        },
        xray: { geosite: "geosite:malware", geoip: "geoip:malware" }
    },
    phishing: {
        category: "threat",
        singbox: {
            geosite: "geosite-phishing",
            geoip: "geoip-phishing",
            geositeUrl: "https://raw.githubusercontent.com/Chocolate4U/Iran-sing-box-rules/rule-set/geosite-phishing.srs",
            geoipUrl: "https://raw.githubusercontent.com/Chocolate4U/Iran-sing-box-rules/rule-set/geoip-phishing.srs"
        },
        clash: {
            geosite: "phishing",
            geoip: "phishing-cidr",
            format: "text",
            geositeUrl: "https://raw.githubusercontent.com/Chocolate4U/Iran-clash-rules/release/phishing.txt",
            geoipUrl: "https://raw.githubusercontent.com/Chocolate4U/Iran-clash-rules/release/phishing-ip.txt"
        },
        xray: { geosite: "geosite:phishing", geoip: "geoip:phishing" }
    },
    cryptominers: {
        category: "threat",
        singbox: {
            geosite: "geosite-cryptominers",
            geositeUrl: "https://raw.githubusercontent.com/Chocolate4U/Iran-sing-box-rules/rule-set/geosite-cryptominers.srs"
        },
        clash: {
            geosite: "cryptominers",
            format: "text",
            geositeUrl: "https://raw.githubusercontent.com/Chocolate4U/Iran-clash-rules/release/cryptominers.txt"
        },
        xray: { geosite: "geosite:cryptominers" }
    },
    ads: {
        category: "threat",
        singbox: {
            geosite: "geosite-category-ads-all",
            geositeUrl: "https://raw.githubusercontent.com/Chocolate4U/Iran-sing-box-rules/rule-set/geosite-category-ads-all.srs"
        },
        clash: {
            geosite: "category-ads-all",
            format: "text",
            geositeUrl: "https://raw.githubusercontent.com/Chocolate4U/Iran-clash-rules/release/category-ads-all.txt"
        },
        xray: { geosite: "geosite:category-ads-all" }
    },
    porn: {
        category: "threat",
        singbox: {
            geosite: "geosite-nsfw",
            geositeUrl: "https://raw.githubusercontent.com/Chocolate4U/Iran-sing-box-rules/rule-set/geosite-nsfw.srs"
        },
        clash: {
            geosite: "nsfw",
            format: "text",
            geositeUrl: "https://raw.githubusercontent.com/Chocolate4U/Iran-clash-rules/release/nsfw.txt"
        },
        xray: { geosite: "geosite:category-porn" }
    },

    // Domestic Bypass Rule-Sets
    iran: {
        category: "domestic",
        singbox: {
            geosite: "geosite-ir",
            geoip: "geoip-ir",
            geositeUrl: "https://raw.githubusercontent.com/Chocolate4U/Iran-sing-box-rules/rule-set/geosite-ir.srs",
            geoipUrl: "https://raw.githubusercontent.com/Chocolate4U/Iran-sing-box-rules/rule-set/geoip-ir.srs"
        },
        clash: {
            geosite: "ir",
            geoip: "ir-cidr",
            format: "text",
            geositeUrl: "https://raw.githubusercontent.com/Chocolate4U/Iran-clash-rules/release/ir.txt",
            geoipUrl: "https://raw.githubusercontent.com/Chocolate4U/Iran-clash-rules/release/ircidr.txt"
        },
        xray: { geosite: "geosite:category-ir", geoip: "geoip:ir" }
    },
    china: {
        category: "domestic",
        singbox: {
            geosite: "geosite-cn",
            geoip: "geoip-cn",
            geositeUrl: "https://raw.githubusercontent.com/Chocolate4U/Iran-sing-box-rules/rule-set/geosite-cn.srs",
            geoipUrl: "https://raw.githubusercontent.com/Chocolate4U/Iran-sing-box-rules/rule-set/geoip-cn.srs"
        },
        clash: {
            geosite: "cn",
            geoip: "cn-cidr",
            format: "yaml",
            geositeUrl: "https://raw.githubusercontent.com/MetaCubeX/meta-rules-dat/meta/geo/geosite/cn.yaml",
            geoipUrl: "https://raw.githubusercontent.com/MetaCubeX/meta-rules-dat/meta/geo/geoip/cn.yaml"
        },
        xray: { geosite: "geosite:cn", geoip: "geoip:cn" }
    },
    russia: {
        category: "domestic",
        singbox: {
            geosite: "geosite-category-ru",
            geoip: "geoip-ru",
            geositeUrl: "https://raw.githubusercontent.com/Chocolate4U/Iran-sing-box-rules/rule-set/geosite-category-ru.srs",
            geoipUrl: "https://raw.githubusercontent.com/Chocolate4U/Iran-sing-box-rules/rule-set/geoip-ru.srs"
        },
        clash: {
            geosite: "ru",
            geoip: "ru-cidr",
            format: "yaml",
            geositeUrl: "https://raw.githubusercontent.com/MetaCubeX/meta-rules-dat/meta/geo/geosite/category-ru.yaml",
            geoipUrl: "https://raw.githubusercontent.com/MetaCubeX/meta-rules-dat/meta/geo/geoip/ru.yaml"
        },
        xray: { geosite: "geosite:category-ru", geoip: "geoip:ru" }
    },

    // Sanction Unblocking Rule-Sets
    openai: {
        category: "sanction",
        singbox: {
            geosite: "geosite-openai",
            geositeUrl: "https://raw.githubusercontent.com/Chocolate4U/Iran-sing-box-rules/rule-set/geosite-openai.srs"
        },
        clash: {
            geosite: "openai",
            format: "yaml",
            geositeUrl: "https://raw.githubusercontent.com/MetaCubeX/meta-rules-dat/meta/geo/geosite/openai.yaml"
        },
        xray: { geosite: "geosite:openai" }
    },
    googleai: {
        category: "sanction",
        singbox: {
            geosite: "geosite-google-deepmind",
            geositeUrl: "https://raw.githubusercontent.com/Chocolate4U/Iran-sing-box-rules/rule-set/geosite-google-deepmind.srs"
        },
        clash: {
            geosite: "google-deepmind",
            format: "yaml",
            geositeUrl: "https://raw.githubusercontent.com/MetaCubeX/meta-rules-dat/meta/geo/geosite/google-deepmind.yaml"
        },
        xray: { geosite: "geosite:google-deepmind" }
    },
    microsoft: {
        category: "sanction",
        singbox: {
            geosite: "geosite-microsoft",
            geositeUrl: "https://raw.githubusercontent.com/Chocolate4U/Iran-sing-box-rules/rule-set/geosite-microsoft.srs"
        },
        clash: {
            geosite: "microsoft",
            format: "yaml",
            geositeUrl: "https://raw.githubusercontent.com/MetaCubeX/meta-rules-dat/meta/geo/geosite/microsoft.yaml"
        },
        xray: { geosite: "geosite:microsoft" }
    },
    docker: {
        category: "sanction",
        singbox: {
            geosite: "geosite-docker",
            geositeUrl: "https://raw.githubusercontent.com/Chocolate4U/Iran-sing-box-rules/rule-set/geosite-docker.srs"
        },
        clash: {
            geosite: "docker",
            format: "yaml",
            geositeUrl: "https://raw.githubusercontent.com/MetaCubeX/meta-rules-dat/meta/geo/geosite/docker.yaml"
        },
        xray: { geosite: "geosite:docker" }
    }
};

/**
 * Builds active rule catalog keys based on sysConfig flags.
 */
export function getActiveRuleKeys(sysConfig = {}) {
    const keys = [];

    // Threats
    const blockThreats = Boolean(sysConfig.blockThreats);
    if (blockThreats || sysConfig.blockMalware) keys.push("malware");
    if (blockThreats || sysConfig.blockPhishing) keys.push("phishing");
    if (blockThreats || sysConfig.blockCryptominers) keys.push("cryptominers");
    if (blockThreats || sysConfig.blockAds) keys.push("ads");
    if (sysConfig.blockPorn) keys.push("porn");

    // Domestic Bypasses
    if (sysConfig.bypassIran) keys.push("iran");
    if (sysConfig.bypassChina) keys.push("china");
    if (sysConfig.bypassRussia) keys.push("russia");

    // Sanction Unblocking
    const bypassAi = Boolean(sysConfig.bypassAi);
    const bypassDev = Boolean(sysConfig.bypassDev);
    if (bypassAi || sysConfig.bypassOpenAi) keys.push("openai");
    if (bypassAi || sysConfig.bypassGoogleAi) keys.push("googleai");
    if (bypassDev || sysConfig.bypassMicrosoft) keys.push("microsoft");
    if (bypassDev || sysConfig.bypassDocker) keys.push("docker");

    return [...new Set(keys)];
}

/**
 * Compiles a structured, ordered list of policy rule items enforcing strict precedence.
 */
export function buildDeterministicPolicyRules(sysConfig = {}, defaultOutbound = "select") {
    const rules = [];

    // 1. TRANSPORT LAYER PRECEDENCE (QUIC / UDP filters)
    // Worker proxying is TCP-only; block UDP port 443 (QUIC) or raw UDP to prevent browser timeouts
    const blockUDP443 = Boolean(sysConfig.blockUDP443);
    if (blockUDP443) {
        rules.push({
            id: "transport-block-quic",
            category: "transport",
            action: "reject",
            network: "udp",
            port: 443,
            protocol: "quic",
            description: "Block QUIC (UDP 443) to force fast HTTP/2 or HTTP/1.1 TLS fallback"
        });
    }

    // 2. SECURITY THREAT REJECTION (Malware, Phishing, Miners, Ads, NSFW)
    // Threats MUST be rejected before bypasses so malicious domains cannot escape
    const activeKeys = getActiveRuleKeys(sysConfig);
    const threatKeys = activeKeys.filter((k) => RULESET_CATALOG[k]?.category === "threat");

    const threatDomains = [...(sysConfig.blockThreats ? CORE_THREAT_DOMAINS : [])];
    const customBlock = Array.isArray(sysConfig.customBlockRules) ? sysConfig.customBlockRules : [];
    customBlock.forEach((r) => {
        if (r && !threatDomains.includes(r)) threatDomains.push(r);
    });

    if (threatKeys.length > 0 || threatDomains.length > 0) {
        rules.push({
            id: "threat-rejection",
            category: "threat",
            action: "reject",
            dnsServerTag: "reject",
            ruleKeys: threatKeys,
            domains: threatDomains,
            description: "Reject verified security threats, malware, phishing, and ad-trackers"
        });
    }

    // 3. PRIVATE NETWORKS & LAN
    rules.push({
        id: "private-lan-bypass",
        category: "domestic",
        action: "direct",
        dnsServerTag: "dns-direct",
        ipIsPrivate: true,
        ips: PRIVATE_IP_CIDRS,
        description: "Bypass private local area networks and loopback ranges"
    });

    // 4. DOMESTIC REGIONAL BYPASSES (Iran, China, Russia)
    const domesticKeys = activeKeys.filter((k) => RULESET_CATALOG[k]?.category === "domestic");
    const customBypass = Array.isArray(sysConfig.customBypassRules) ? sysConfig.customBypassRules : [];

    if (domesticKeys.length > 0 || customBypass.length > 0) {
        rules.push({
            id: "domestic-bypass",
            category: "domestic",
            action: "direct",
            dnsServerTag: "dns-direct",
            ruleKeys: domesticKeys,
            domains: customBypass.filter((r) => !r.includes("/")),
            ips: customBypass.filter((r) => r.includes("/")),
            description: "Route domestic regional destinations directly using local DNS resolver"
        });
    }

    // 5. SANCTION UNBLOCKING (OpenAI, Anthropic, Docker, Microsoft)
    const sanctionKeys = activeKeys.filter((k) => RULESET_CATALOG[k]?.category === "sanction");
    const sanctionDomains = [];
    if (sysConfig.bypassAi) sanctionDomains.push(...CORE_AI_DOMAINS);
    if (sysConfig.bypassDev) sanctionDomains.push(...CORE_DEV_DOMAINS);

    const customSanctions = Array.isArray(sysConfig.customBypassSanctionRules) ? sysConfig.customBypassSanctionRules : [];
    customSanctions.forEach((r) => {
        if (r && !sanctionDomains.includes(r)) sanctionDomains.push(r);
    });

    if (sanctionKeys.length > 0 || sanctionDomains.length > 0) {
        rules.push({
            id: "sanction-unblock",
            category: "sanction",
            action: "direct",
            dnsServerTag: "dns-anti-sanction",
            ruleKeys: sanctionKeys,
            domains: [...new Set(sanctionDomains)],
            description: "Route sanctioned services direct via Anti-Sanction unblocking DNS"
        });
    }

    // 6. DEFAULT PROXY EGRESS
    rules.push({
        id: "default-proxy-egress",
        category: "default",
        action: "proxy",
        outbound: defaultOutbound,
        dnsServerTag: "dns-remote",
        description: "Route all unclassified international traffic through proxy tunnel"
    });

    return rules;
}
