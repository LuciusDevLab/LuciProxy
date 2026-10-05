import { test } from "node:test";
import assert from "node:assert/strict";
import { SYSTEM_DEFAULTS } from "../src/config.js";
import {
    extractDnsHost,
    isIpAddress,
    buildCanonicalDnsPolicy
} from "../src/subscriptions/dns.js";
import {
    buildDeterministicPolicyRules,
    getActiveRuleKeys,
    RULESET_CATALOG,
    PRIVATE_IP_CIDRS,
    CORE_THREAT_DOMAINS,
    CORE_AI_DOMAINS,
    CORE_DEV_DOMAINS
} from "../src/subscriptions/rules.js";
import { resolveNetworkPolicy } from "../src/subscriptions/policy.js";
import {
    buildSingBoxRules,
    buildClashRules
} from "../src/subscriptions/routing.js";
import { buildSingBoxJsonProfile } from "../src/subscriptions/singbox.js";
import { buildYamlProfile } from "../src/subscriptions/clash.js";
import { buildVJsonProfile } from "../src/subscriptions/v2ray.js";

// =========================================================================
// 1. CANONICAL DNS POLICY TESTS
// =========================================================================

test("Canonical DNS - extractDnsHost and isIpAddress utilities", () => {
    assert.equal(extractDnsHost("https://cloudflare-dns.com/dns-query"), "cloudflare-dns.com");
    assert.equal(extractDnsHost("https://dns.google:443/dns-query"), "dns.google");
    assert.equal(extractDnsHost("1.1.1.1:53"), "1.1.1.1");
    assert.equal(extractDnsHost("[2606:4700:4700::1111]:53"), "2606:4700:4700::1111");
    assert.equal(extractDnsHost("178.22.122.100"), "178.22.122.100");
    assert.equal(extractDnsHost(""), "");

    assert.equal(isIpAddress("1.1.1.1"), true);
    assert.equal(isIpAddress("178.22.122.100"), true);
    assert.equal(isIpAddress("2606:4700:4700::1111"), true);
    assert.equal(isIpAddress("cloudflare-dns.com"), false);
    assert.equal(isIpAddress("dns.google"), false);
    assert.equal(isIpAddress(""), false);
});

test("Canonical DNS - Default resolution policy and DoH bootstrap hosts", () => {
    const policy = buildCanonicalDnsPolicy(SYSTEM_DEFAULTS);

    assert.equal(policy.localDns, "8.8.8.8");
    assert.equal(policy.remoteDns, "https://8.8.8.8/dns-query");
    assert.equal(policy.remoteHost, "8.8.8.8");
    assert.equal(policy.isRemoteDomain, false, "8.8.8.8 is an IP literal, not a domain");
    assert.equal(policy.isCloudflare, false, "8.8.8.8 is Google Public DNS, outside Cloudflare Anycast");
    assert.equal(policy.antiSanctionDns, "178.22.122.100");
    assert.equal(policy.isAntiSanctionDomain, false);
    assert.equal(policy.fakeDns, false);
    assert.equal(policy.enableIPv6, false);
    assert.equal(policy.strategy, "ipv4_only");
    assert.equal(policy.queryStrategyXray, "UseIPv4");
    // Default IP-literal DoH requires no chicken-and-egg bootstrap hosts
    assert.deepEqual(policy.bootstrapHosts, {});
});

test("Canonical DNS - Domain DoH bootstrap hosts and IPv6 incorporation", () => {
    const config = {
        ...SYSTEM_DEFAULTS,
        remoteDns: "https://cloudflare-dns.com/dns-query",
        enableIPv6: true
    };
    const policy = buildCanonicalDnsPolicy(config);

    assert.equal(policy.remoteHost, "cloudflare-dns.com");
    assert.equal(policy.isRemoteDomain, true);
    assert.equal(policy.isCloudflare, true, "cloudflare-dns.com must be identified as Cloudflare Anycast");
    assert.equal(policy.enableIPv6, true);
    assert.equal(policy.strategy, "prefer_ipv4");
    assert.equal(policy.queryStrategyXray, "UseIP");
    assert.equal(policy.fakeIpRangeV6, "fc00::/18");

    // Bootstrap hosts should contain both IPv4 and IPv6 addresses when enableIPv6 is true
    const ips = policy.bootstrapHosts["cloudflare-dns.com"];
    assert.ok(ips.includes("1.1.1.1"));
    assert.ok(ips.includes("104.16.248.249"));
    assert.ok(ips.some((ip) => ip.includes("2606:4700:4700::1111")));
});

test("Canonical DNS - Custom DoH and Anti-Sanction configuration", () => {
    const config = {
        ...SYSTEM_DEFAULTS,
        remoteDns: "https://dns.google/dns-query",
        antiSanctionDns: "https://anti-sanction.example.com/dns-query",
        fakeDns: true
    };
    const policy = buildCanonicalDnsPolicy(config);

    assert.equal(policy.remoteHost, "dns.google");
    assert.ok(policy.bootstrapHosts["dns.google"].includes("8.8.8.8"));
    assert.equal(policy.antiSanctionHost, "anti-sanction.example.com");
    assert.equal(policy.isAntiSanctionDomain, true);
    assert.equal(policy.fakeDns, true);
    assert.equal(policy.fakeIpRangeV4, "198.18.0.0/15");
});

// =========================================================================
// 2. DETERMINISTIC RULE PRECEDENCE & ACTIVE RULE SETS TESTS
// =========================================================================

test("Deterministic Rules - Catalog integrity", () => {
    // Verify each catalog item has proper taxonomy
    const categories = ["threat", "domestic", "sanction"];
    Object.entries(RULESET_CATALOG).forEach(([key, item]) => {
        assert.ok(categories.includes(item.category), `Catalog item ${key} must have valid category`);
        assert.ok(item.singbox?.geosite, `Catalog item ${key} must define Singbox geosite`);
        assert.ok(item.clash?.geosite, `Catalog item ${key} must define Clash geosite`);
        assert.ok(item.xray?.geosite, `Catalog item ${key} must define Xray geosite`);
    });
});

test("Deterministic Rules - Active rule keys extraction", () => {
    const baseKeys = getActiveRuleKeys(SYSTEM_DEFAULTS);
    assert.deepEqual(baseKeys, [], "Default config should have no active rule sets");

    const activeConfig = {
        ...SYSTEM_DEFAULTS,
        blockThreats: true,
        bypassIran: true,
        bypassAi: true,
        bypassDev: true
    };
    const keys = getActiveRuleKeys(activeConfig);
    assert.ok(keys.includes("malware"));
    assert.ok(keys.includes("phishing"));
    assert.ok(keys.includes("cryptominers"));
    assert.ok(keys.includes("ads"));
    assert.ok(keys.includes("iran"));
    assert.ok(keys.includes("openai"));
    assert.ok(keys.includes("googleai"));
    assert.ok(keys.includes("microsoft"));
    assert.ok(keys.includes("docker"));
});

test("Deterministic Rules - Strict precedence ordering", () => {
    const fullConfig = {
        ...SYSTEM_DEFAULTS,
        blockUDP443: true,
        blockThreats: true,
        bypassIran: true,
        bypassAi: true
    };
    const rules = buildDeterministicPolicyRules(fullConfig, "select");

    // Expected order:
    // 0: transport (QUIC UDP 443 reject)
    // 1: threat rejection
    // 2: private LAN bypass
    // 3: domestic bypass
    // 4: sanction unblock
    // 5: default proxy egress
    assert.equal(rules.length, 6);

    assert.equal(rules[0].id, "transport-block-quic");
    assert.equal(rules[0].category, "transport");
    assert.equal(rules[0].action, "reject");

    assert.equal(rules[1].id, "threat-rejection");
    assert.equal(rules[1].category, "threat");
    assert.equal(rules[1].action, "reject");

    assert.equal(rules[2].id, "private-lan-bypass");
    assert.equal(rules[2].category, "domestic");
    assert.equal(rules[2].action, "direct");

    assert.equal(rules[3].id, "domestic-bypass");
    assert.equal(rules[3].category, "domestic");
    assert.equal(rules[3].action, "direct");

    assert.equal(rules[4].id, "sanction-unblock");
    assert.equal(rules[4].category, "sanction");
    assert.equal(rules[4].action, "direct");

    assert.equal(rules[5].id, "default-proxy-egress");
    assert.equal(rules[5].category, "default");
    assert.equal(rules[5].action, "proxy");
});

test("Deterministic Rules - Threat rejection strictly precedes bypass rules", () => {
    // When both threats and domestic bypass are enabled, threat rejection MUST appear before bypass
    const config = {
        ...SYSTEM_DEFAULTS,
        blockMalware: true,
        bypassIran: true,
        bypassAi: true
    };
    const rules = buildDeterministicPolicyRules(config, "select");

    const threatIdx = rules.findIndex((r) => r.category === "threat");
    const domesticIdx = rules.findIndex((r) => r.id === "domestic-bypass");
    const sanctionIdx = rules.findIndex((r) => r.id === "sanction-unblock");

    assert.ok(threatIdx !== -1, "Threat rule must exist");
    assert.ok(domesticIdx !== -1, "Domestic bypass rule must exist");
    assert.ok(sanctionIdx !== -1, "Sanction rule must exist");

    assert.ok(threatIdx < domesticIdx, "Threat rejection must strictly precede domestic bypass");
    assert.ok(threatIdx < sanctionIdx, "Threat rejection must strictly precede sanction bypass");
});

test("Deterministic Rules - Custom rules integration", () => {
    const config = {
        ...SYSTEM_DEFAULTS,
        blockThreats: false,
        customBlockRules: ["malicious-domain.com", "phishing-link.net"],
        customBypassRules: ["trusted-iran-service.ir", "10.50.0.0/16"],
        customBypassSanctionRules: ["custom-ai.org"]
    };
    const rules = buildDeterministicPolicyRules(config, "select");

    const threatRule = rules.find((r) => r.id === "threat-rejection");
    assert.ok(threatRule);
    assert.ok(threatRule.domains.includes("malicious-domain.com"));
    assert.ok(threatRule.domains.includes("phishing-link.net"));

    const domesticRule = rules.find((r) => r.id === "domestic-bypass");
    assert.ok(domesticRule);
    assert.ok(domesticRule.domains.includes("trusted-iran-service.ir"));
    assert.ok(domesticRule.ips.includes("10.50.0.0/16"));

    const sanctionRule = rules.find((r) => r.id === "sanction-unblock");
    assert.ok(sanctionRule);
    assert.ok(sanctionRule.domains.includes("custom-ai.org"));
});

// =========================================================================
// 3. CANONICAL NETWORK POLICY RESOLVER TESTS
// =========================================================================

test("Policy Resolver - Intermediate representation contract", () => {
    const config = {
        ...SYSTEM_DEFAULTS,
        blockUDP443: true,
        bypassIran: true,
        enableIPv6: true
    };
    const policy = resolveNetworkPolicy(config, "custom-outbound");

    assert.ok(policy.dns);
    assert.ok(policy.rules);
    assert.ok(policy.ruleSets);
    assert.ok(policy.transport);
    assert.ok(policy.outbound);

    // Transport properties
    assert.equal(policy.transport.blockUDP, true, "Worker WebSockets cannot proxy raw UDP datagrams");
    assert.equal(policy.transport.blockUDP443, true);
    assert.equal(policy.transport.enableIPv6, true);
    assert.equal(policy.transport.strategy, "prefer_ipv4");

    // Outbound properties
    assert.equal(policy.outbound.defaultTag, "custom-outbound");
    assert.equal(policy.outbound.fallbackTag, "direct");

    // Rule sets
    const iranSet = policy.ruleSets.find((r) => r.key === "iran");
    assert.ok(iranSet);
    assert.equal(iranSet.singbox.geosite, "geosite-ir");
    assert.equal(iranSet.clash.geosite, "ir");
});

// =========================================================================
// 4. SING-BOX CLIENT-CORE COMPILER TESTS
// =========================================================================

test("Sing-Box Compiler - Canonical DNS topologies, inbounds, and detours", async () => {
    const config = {
        ...SYSTEM_DEFAULTS,
        deviceId: "c0000000-0000-4000-8000-000000000001",
        apiRoute: "sync",
        cleanIps: "104.16.1.1",
        socketPorts: "443",
        mode: "alpha",
        blockUDP443: true,
        blockThreats: true,
        bypassIran: true,
        bypassAi: true,
        fakeDns: true
    };

    const profile = await buildSingBoxJsonProfile("edge.example.com", null, false, config);

    // 1. DNS section verification
    assert.ok(profile.dns, "Profile must have a dns block");
    const servers = profile.dns.servers;
    const remoteServer = servers.find((s) => s.tag === "dns-remote");
    assert.ok(remoteServer, "Must have dns-remote server");
    assert.equal(remoteServer.detour, "select", "dns-remote must detour through select proxy outbound");
    assert.equal(remoteServer.server, "8.8.8.8", "Default remote DoH must be 8.8.8.8 (Google Public DNS)");
    assert.equal(remoteServer.type, "https", "Google DoH must be https");

    const directServer = servers.find((s) => s.tag === "dns-direct");
    assert.ok(directServer, "Must have dns-direct server");
    assert.equal(directServer.type, "udp", "dns-direct defaults to UDP 8.8.8.8");
    assert.equal(directServer.server, "8.8.8.8");

    const antiSanctionServer = servers.find((s) => s.tag === "dns-anti-sanction");
    assert.ok(antiSanctionServer, "Must have dns-anti-sanction server");
    assert.equal(antiSanctionServer.server, "178.22.122.100");

    const fakeServer = servers.find((s) => s.tag === "dns-fake");
    assert.ok(fakeServer, "Must have dns-fake server when fakeDns is enabled");
    assert.equal(fakeServer.type, "fakeip");
    assert.equal(fakeServer.inet4_range, "198.18.0.0/15");

    // 2. Inbounds verification (TUN + Mixed dual inbounds)
    assert.ok(profile.inbounds.some((i) => i.type === "mixed" && i.listen_port === 2080));
    assert.ok(profile.inbounds.some((i) => i.type === "tun" && i.auto_route === true));

    // 3. Outbounds verification
    const vlessOutbound = profile.outbounds.find((o) => o.type === "vless");
    assert.ok(vlessOutbound);
    assert.equal(vlessOutbound.domain_resolver, "dns-direct", "Worker outbound must resolve via dns-direct");
    assert.equal(vlessOutbound.packet_encoding, "");

    // 4. Remote binary rule sets in route block
    assert.ok(profile.route.rule_set, "Route block must include remote rule_set definitions");
    assert.ok(profile.route.rule_set.some((r) => r.tag === "geosite-ir" && r.format === "binary"));
    assert.ok(profile.route.rule_set.some((r) => r.tag === "geosite-openai" && r.format === "binary"));

    // 5. Precedence in routing rules
    const rules = profile.route.rules;
    const quicRuleIdx = rules.findIndex((r) => r.network === "udp" && r.port === 443);
    const threatRuleIdx = rules.findIndex((r) => r.domain_suffix && r.action === "reject");
    const iranRuleIdx = rules.findIndex((r) => r.rule_set?.includes("geosite-ir"));
    const aiRuleIdx = rules.findIndex((r) => r.domain_suffix?.includes("openai.com"));

    assert.ok(quicRuleIdx !== -1, "QUIC reject rule must exist");
    assert.ok(threatRuleIdx !== -1, "Threat reject rule must exist");
    assert.ok(iranRuleIdx !== -1, "Iran bypass rule must exist");
    assert.ok(aiRuleIdx !== -1, "AI sanction rule must exist");

    assert.ok(quicRuleIdx < threatRuleIdx, "QUIC reject must precede threat rejection");
    assert.ok(threatRuleIdx < iranRuleIdx, "Threat rejection must precede domestic bypass");
    assert.ok(threatRuleIdx < aiRuleIdx, "Threat rejection must precede AI sanction bypass");
});

// =========================================================================
// 5. CLASH / MIHOMO CLIENT-CORE COMPILER TESTS
// =========================================================================

test("Clash / Mihomo Compiler - Unprivileged port 1053, sniffer, tun, and nameserver-policy", async () => {
    const config = {
        ...SYSTEM_DEFAULTS,
        deviceId: "c0000000-0000-4000-8000-000000000002",
        apiRoute: "sync",
        cleanIps: "104.17.1.1",
        socketPorts: "443",
        mode: "alpha",
        blockUDP443: true,
        blockThreats: true,
        bypassIran: true,
        bypassAi: true,
        enableTun: true
    };

    const yaml = await buildYamlProfile("clash.example.com", null, false, config);

    // 1. Unprivileged DNS port 1053 (ensures non-root OS compatibility)
    assert.ok(yaml.includes("listen: 127.0.0.1:1053"), "Clash DNS must bind unprivileged port 1053, NOT 53");

    // 2. Worker outbounds must have udp: false
    assert.ok(yaml.includes("udp: false"), "Worker outbounds must declare udp: false to prevent QUIC stall");

    // 3. Sniffer configuration
    assert.ok(yaml.includes("sniffer:"));
    assert.ok(yaml.includes("force-dns-mapping: true"));
    assert.ok(yaml.includes("override-destination: true"));

    // 4. TUN mode configuration
    assert.ok(yaml.includes("tun:"));
    assert.ok(yaml.includes("stack: mixed"));
    assert.ok(yaml.includes("auto-route: true"));
    assert.ok(yaml.includes("dns-hijack:"));

    // 5. DNS nameservers: remote DoH to Google 8.8.8.8, proxy-server bootstrap to 8.8.8.8#DIRECT
    assert.ok(yaml.includes("- https://8.8.8.8/dns-query#PROXIES"));
    assert.ok(yaml.includes("proxy-server-nameserver:\n    - 8.8.8.8#DIRECT"));
    assert.ok(yaml.includes("direct-nameserver:\n    - 8.8.8.8#DIRECT"));
    assert.ok(yaml.includes("direct-nameserver-follow-policy: true"));

    // 6. nameserver-policy for sanction unblocking
    assert.ok(yaml.includes("nameserver-policy:"));
    assert.ok(yaml.includes('"rule-set:openai": "178.22.122.100#DIRECT"'));
    assert.ok(yaml.includes('"+.openai.com": "178.22.122.100#DIRECT"'));

    // 7. Rule-providers for remote rules
    assert.ok(yaml.includes("rule-providers:"));
    assert.ok(yaml.includes("url: \"https://raw.githubusercontent.com/Chocolate4U/Iran-clash-rules/release/ir.txt\""));

    // 8. Rule precedence in YAML rules
    assert.ok(yaml.includes("AND,((NETWORK,udp),(DST-PORT,443)),REJECT"));
    assert.ok(yaml.includes("DOMAIN-SUFFIX,doubleclick.net,REJECT"));
    assert.ok(yaml.includes("GEOIP,IR,DIRECT"));
    assert.ok(yaml.includes("DOMAIN-SUFFIX,openai.com,DIRECT"));
    assert.ok(yaml.includes("MATCH,PROXIES"));
});

// =========================================================================
// 6. XRAY / V2RAY CLIENT-CORE COMPILER TESTS
// =========================================================================

test("Xray / V2Ray Compiler - Multi-tier DNS block, dokodemo inbound, and IPIfNonMatch", async () => {
    const config = {
        ...SYSTEM_DEFAULTS,
        deviceId: "c0000000-0000-4000-8000-000000000003",
        apiRoute: "sync",
        cleanIps: "104.18.1.1",
        socketPorts: "443",
        mode: "alpha",
        blockUDP443: true,
        blockThreats: true,
        bypassIran: true,
        bypassAi: true
    };

    const vjson = await buildVJsonProfile("xray.example.com", null, false, config);

    // 1. DNS block verification
    assert.ok(vjson.dns, "Xray config must contain explicit dns block");
    assert.equal(vjson.dns.queryStrategy, "UseIPv4");
    assert.equal(vjson.dns.tag, "dns");

    // Remote DoH server (Google 8.8.8.8 DoH)
    assert.ok(vjson.dns.servers.some((s) => s.address === "https://8.8.8.8/dns-query" && s.tag === "remote-dns"));

    // Explicit bootstrap for proxy server domains (full:xray.example.com)
    assert.ok(vjson.dns.servers.some((s) => s.address === "8.8.8.8" && s.domains?.includes("full:xray.example.com")));

    // Anti-sanction DNS server targeting OpenAI
    const antiSanctionServer = vjson.dns.servers.find((s) => s.address === "178.22.122.100");
    assert.ok(antiSanctionServer, "Anti-sanction server must be configured in Xray DNS");
    assert.ok(antiSanctionServer.domains.includes("domain:openai.com"));
    assert.equal(antiSanctionServer.skipFallback, true);

    // 2. Inbounds verification: dokodemo-door on port 10853
    const dokoInbound = vjson.inbounds.find((i) => i.protocol === "dokodemo-door");
    assert.ok(dokoInbound, "Must configure dokodemo-door DNS inbound");
    assert.equal(dokoInbound.port, 10853);
    assert.equal(dokoInbound.tag, "dns-in");

    // 3. Routing domain strategy
    assert.equal(vjson.routing.domainStrategy, "IPIfNonMatch");

    // 4. Deterministic routing rules in Xray
    const rules = vjson.routing.rules;
    const dnsInRule = rules.find((r) => r.inboundTag?.includes("dns-in"));
    assert.ok(dnsInRule);
    assert.equal(dnsInRule.outboundTag, "dns-out");

    const remoteDnsRule = rules.find((r) => r.inboundTag?.includes("remote-dns"));
    assert.ok(remoteDnsRule);

    const quicRule = rules.find((r) => r.network === "udp" && r.port === "443");
    assert.ok(quicRule);
    assert.equal(quicRule.outboundTag, "block");

    const threatRule = rules.find((r) => r.domain?.includes("domain:doubleclick.net"));
    assert.ok(threatRule);
    assert.equal(threatRule.outboundTag, "block");

    const domesticRule = rules.find((r) => r.domain?.includes("geosite:category-ir"));
    assert.ok(domesticRule);
    assert.equal(domesticRule.outboundTag, "direct");
});

// =========================================================================
// 7. SECTION 6: DNS LOOP / DEADLOCK PROTECTION FAILURE CASES (1 - 10)
// =========================================================================

test("DNS Resilience - Case 1: Remote DoH points at Cloudflare Anycast and is proxied", () => {
    // When cloudflare-dns.com or 1.1.1.1 is provided, system identifies Anycast property
    const cfDomainPolicy = buildCanonicalDnsPolicy({ ...SYSTEM_DEFAULTS, remoteDns: "https://cloudflare-dns.com/dns-query" });
    assert.equal(cfDomainPolicy.isCloudflare, true);

    const cfIpPolicy = buildCanonicalDnsPolicy({ ...SYSTEM_DEFAULTS, remoteDns: "https://1.1.1.1/dns-query" });
    assert.equal(cfIpPolicy.isCloudflare, true);

    const cfOnePolicy = buildCanonicalDnsPolicy({ ...SYSTEM_DEFAULTS, remoteDns: "https://one.one.one.one/dns-query" });
    assert.equal(cfOnePolicy.isCloudflare, true);
});

test("DNS Resilience - Case 2: Remote DoH points at Google IP-based DoH and is proxied", () => {
    // Golden path: 8.8.8.8 is non-Cloudflare and IP-based
    const policy = buildCanonicalDnsPolicy({ ...SYSTEM_DEFAULTS, remoteDns: "https://8.8.8.8/dns-query" });
    assert.equal(policy.remoteHost, "8.8.8.8");
    assert.equal(policy.isRemoteDomain, false);
    assert.equal(policy.isCloudflare, false);
    assert.deepEqual(policy.bootstrapHosts, {});
});

test("DNS Resilience - Case 3: Bootstrap resolution itself requires the remote resolver", async () => {
    // Ensure proxy-server-nameserver in Clash and domain_resolver in Sing-box are pinned to DIRECT, never PROXIES
    const yaml = await buildYamlProfile("edge.example.com", null, false, SYSTEM_DEFAULTS);
    assert.ok(yaml.includes("proxy-server-nameserver:\n    - 8.8.8.8#DIRECT"));
    assert.ok(!yaml.includes("proxy-server-nameserver:\n    - https://8.8.8.8/dns-query#PROXIES"));

    const sbox = await buildSingBoxJsonProfile("edge.example.com", null, false, SYSTEM_DEFAULTS);
    const vlessOut = sbox.outbounds.find((o) => o.type === "vless");
    assert.equal(vlessOut.domain_resolver, "dns-direct");
    assert.notEqual(vlessOut.domain_resolver, "dns-remote");
});

test("DNS Resilience - Case 4: Proxy endpoint hostname requires DNS resolution", async () => {
    // Ensure proxy endpoint hostname (edge.example.com) is bootstrap-resolved directly
    const vjson = await buildVJsonProfile("edge.example.com", null, false, SYSTEM_DEFAULTS);
    const bootstrapRule = vjson.dns.servers.find((s) => s.domains?.includes("full:edge.example.com"));
    assert.ok(bootstrapRule, "Xray must explicitly assign proxy endpoint domain to direct bootstrap resolver");
    assert.equal(bootstrapRule.address, "8.8.8.8");
    assert.equal(bootstrapRule.skipFallback, true);
});

test("DNS Resilience - Case 5: DNS request accidentally routes back through the same DNS path", async () => {
    // Sing-box default_domain_resolver must be dns-direct, preventing proxy recursion
    const sbox = await buildSingBoxJsonProfile("edge.example.com", null, false, SYSTEM_DEFAULTS);
    assert.equal(sbox.route.default_domain_resolver, "dns-direct");

    // Xray dns routing rules must separate dns-in (dns-out) and remote-dns (proxy)
    const vjson = await buildVJsonProfile("edge.example.com", null, false, SYSTEM_DEFAULTS);
    const dnsInRule = vjson.routing.rules.find((r) => r.inboundTag?.includes("dns-in"));
    assert.equal(dnsInRule.outboundTag, "dns-out");
});

test("DNS Resilience - Case 6: IPv6 DNS endpoint is unreachable on IPv4-only network", () => {
    // When enableIPv6 is false, IPv6 addresses must be excluded from bootstrap hosts
    const policy = buildCanonicalDnsPolicy({ ...SYSTEM_DEFAULTS, enableIPv6: false, remoteDns: "https://dns.google/dns-query" });
    assert.equal(policy.enableIPv6, false);
    assert.equal(policy.strategy, "ipv4_only");
    assert.equal(policy.queryStrategyXray, "UseIPv4");
    const hosts = policy.bootstrapHosts["dns.google"];
    assert.ok(hosts.includes("8.8.8.8"));
    assert.ok(!hosts.some((ip) => ip.includes(":")));
});

test("DNS Resilience - Case 7: Primary resolver fails, fallback resolver behavior", async () => {
    // Clash Meta: direct-nameserver-follow-policy true allows fallback according to policy
    const yaml = await buildYamlProfile("edge.example.com", null, false, SYSTEM_DEFAULTS);
    assert.ok(yaml.includes("direct-nameserver-follow-policy: true"));
    assert.ok(yaml.includes("nameserver:"));
    assert.ok(yaml.includes("proxy-server-nameserver:"));
});

test("DNS Resilience - Case 8: Fallback resolver availability with system DNS", async () => {
    const customConfig = { ...SYSTEM_DEFAULTS, localDns: "system" };
    const yaml = await buildYamlProfile("edge.example.com", null, false, customConfig);
    assert.ok(yaml.includes("proxy-server-nameserver:\n    - system"));
    assert.ok(yaml.includes("direct-nameserver:\n    - system"));

    const sbox = await buildSingBoxJsonProfile("edge.example.com", null, false, customConfig);
    const directDns = sbox.dns.servers.find((s) => s.tag === "dns-direct");
    assert.equal(directDns.type, "local");
});

test("DNS Resilience - Case 9: FakeDNS disabled generates clean standard DNS", async () => {
    const config = { ...SYSTEM_DEFAULTS, fakeDns: false };
    const sbox = await buildSingBoxJsonProfile("edge.example.com", null, false, config);
    assert.ok(!sbox.dns.servers.some((s) => s.tag === "dns-fake"));
    assert.ok(!sbox.dns.rules.some((r) => r.server === "dns-fake"));

    const yaml = await buildYamlProfile("edge.example.com", null, false, config);
    assert.ok(yaml.includes("enhanced-mode: redir-host"));
    assert.ok(!yaml.includes("fake-ip-range:"));

    const vjson = await buildVJsonProfile("edge.example.com", null, false, config);
    assert.ok(!vjson.dns.servers.includes("fakedns"));
});

test("DNS Resilience - Case 10: FakeDNS enabled generates valid FakeIP pool and blacklist", async () => {
    const config = { ...SYSTEM_DEFAULTS, fakeDns: true };
    const sbox = await buildSingBoxJsonProfile("edge.example.com", null, false, config);
    const fakeServer = sbox.dns.servers.find((s) => s.tag === "dns-fake");
    assert.ok(fakeServer);
    assert.equal(fakeServer.type, "fakeip");
    assert.equal(fakeServer.inet4_range, "198.18.0.0/15");

    const yaml = await buildYamlProfile("edge.example.com", null, false, config);
    assert.ok(yaml.includes("enhanced-mode: fake-ip"));
    assert.ok(yaml.includes("fake-ip-range: 198.18.0.1/16"));
    assert.ok(yaml.includes('"+.lan"'));
    assert.ok(yaml.includes('"+.local"'));

    const vjson = await buildVJsonProfile("edge.example.com", null, false, config);
    assert.ok(vjson.dns.servers.includes("fakedns"));
});
