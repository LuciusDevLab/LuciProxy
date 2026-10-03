import { test } from "node:test";
import assert from "node:assert/strict";
import { getConfigName, getFakeConfigNames, getSubscriptionStats } from "../src/subscriptions/tags.js";
import { buildUriProfile } from "../src/subscriptions/uri.js";
import { buildYamlProfile } from "../src/subscriptions/clash.js";
import { buildSingBoxJsonProfile } from "../src/subscriptions/singbox.js";
import { buildVJsonProfile } from "../src/subscriptions/v2ray.js";
import { generateWireguardConfig } from "../src/subscriptions/wireguard.js";
import { buildSingBoxRules, buildClashRules } from "../src/subscriptions/routing.js";
import { SYSTEM_DEFAULTS } from "../src/config.js";
import { setCachedUsage } from "../src/db/d1.js";

test("Subscription Tags - getConfigName formats with custom template", () => {
    const config = {
        ...SYSTEM_DEFAULTS,
        nameStrategy: "{FLAG} {WORKER}-{USER}-{PROTO}-{PORT}-{IP}"
    };
    const name = getConfigName("alpha", "Alice", 443, "host.com", "1.1.1.1", null, 0, "", config);
    assert.equal(name, "🌐 Luci-Alice-VLESS-443-1.1.1.1");
});

test("Subscription Tags - getFakeConfigNames renders usage and expiry", () => {
    const now = Date.now();
    const expiryDate = now + 7 * 86400 * 1000;
    const config = {
        ...SYSTEM_DEFAULTS,
        users: [
            {
                id: "test-user-uuid",
                name: "TestUser",
                expiryMs: expiryDate,
                limitTotalReq: 200 // ~200MB
            }
        ]
    };

    setCachedUsage({
        users: {
            "testuseruuid": { reqs: 0, dReqs: 0, bytes: 50 * 1024 * 1024 }
        }
    });

    const fakeNames = getFakeConfigNames(config, "TestUser");
    assert.equal(fakeNames.length, 2);
    assert(fakeNames[0].includes("GB"), "Fake config 1 should contain GB traffic info");
    assert(fakeNames[1].includes("Days Left") || fakeNames[1].includes("Expiry"), "Fake config 2 should contain expiry info");
});

test("URI Builder - generates valid vless:// and trojan:// links", async () => {
    const config = {
        ...SYSTEM_DEFAULTS,
        deviceId: "a0000000-0000-4000-8000-000000000001",
        apiRoute: "testroute",
        cleanIps: "104.16.1.1",
        socketPorts: "443",
        mode: "both"
    };

    const uris = await buildUriProfile("edge.example.com", null, false, config);
    const lines = uris.split("\n");

    // Has fake config lines
    assert(lines.some((l) => l.startsWith("trojan://00000000-0000-0000-0000-000000000000@127.0.0.1:1080")));

    // Has VLESS line
    const vlessLine = lines.find((l) => l.startsWith("vless://a0000000-0000-4000-8000-000000000001@104.16.1.1:443"));
    assert(vlessLine, "Should generate VLESS URI");
    assert(vlessLine.includes("type=ws"));
    assert(vlessLine.includes("sni=edge.example.com"));
    assert(vlessLine.includes("path=/testroute"));

    // Has Trojan line
    const trojanLine = lines.find((l) => l.startsWith("trojan://a0000000-0000-4000-8000-000000000001@104.16.1.1:443"));
    assert(trojanLine, "Should generate Trojan URI");
    assert(trojanLine.includes("security=tls"));
    assert(trojanLine.includes("sni=edge.example.com"));
});

test("Clash YAML Builder - produces parseable YAML with required sections", async () => {
    const config = {
        ...SYSTEM_DEFAULTS,
        deviceId: "b0000000-0000-4000-8000-000000000002",
        apiRoute: "sync",
        cleanIps: "104.17.1.1",
        socketPorts: "443",
        mode: "alpha"
    };

    const yaml = await buildYamlProfile("clash.example.com", null, false, config);
    assert(yaml.includes("port: 7890"));
    assert(yaml.includes("proxies:"));
    assert(yaml.includes("type: vless"));
    assert(yaml.includes("server: 104.17.1.1"));
    assert(yaml.includes("uuid: \"b0000000-0000-4000-8000-000000000002\""));
    assert(yaml.includes("proxy-groups:"));
    assert(yaml.includes("name: \"PROXIES\""));
    assert(yaml.includes("name: \"AUTO\""));
    assert(yaml.includes("name: \"FALLBACK\""));
    assert(yaml.includes("rules:"));
    assert(yaml.includes("GEOIP,IR,DIRECT"));
});

test("Sing-Box Builder - produces valid 1.9+ JSON structure", async () => {
    const config = {
        ...SYSTEM_DEFAULTS,
        deviceId: "c0000000-0000-4000-8000-000000000003",
        apiRoute: "sync",
        cleanIps: "104.18.1.1",
        socketPorts: "443",
        mode: "both"
    };

    const sb = await buildSingBoxJsonProfile("singbox.example.com", null, false, config);
    assert.equal(typeof sb, "object");
    assert(sb.dns && sb.inbounds && sb.outbounds && sb.route);

    // Verify inbounds
    assert.equal(sb.inbounds[0].type, "mixed");
    assert.equal(sb.inbounds[0].listen_port, 2080);

    // Verify outbounds
    const selector = sb.outbounds.find((o) => o.tag === "select");
    const autoGroup = sb.outbounds.find((o) => o.tag === "auto");
    assert(selector, "Selector group exists");
    assert(autoGroup, "Auto group exists");

    const vlessOutbound = sb.outbounds.find((o) => o.type === "vless");
    assert(vlessOutbound, "VLESS outbound exists");
    assert.equal(vlessOutbound.uuid, "c0000000-0000-4000-8000-000000000003");
    assert.equal(vlessOutbound.server, "104.18.1.1");
    assert.equal(vlessOutbound.tls.server_name, "singbox.example.com");

    const trojanOutbound = sb.outbounds.find((o) => o.type === "trojan");
    assert(trojanOutbound, "Trojan outbound exists");
    assert.equal(trojanOutbound.password, "c0000000-0000-4000-8000-000000000003");

    // Sing-Box 1.14+ compatibility checks
    assert.equal(sb.route.default_domain_resolver, "dns-direct");
    assert(!sb.outbounds.some((o) => o.type === "dns"), "No deprecated dns outbound");
    assert(
        sb.route.rules.some((r) => r.protocol === "dns" && r.action === "hijack-dns"),
        "hijack-dns action is used for DNS interception"
    );
    assert(
        sb.dns.servers.some((s) => s.tag === "dns-direct" && s.type === "local"),
        "Modern local DNS server present"
    );
});

test("V2Ray / Xray Builder - produces valid Xray config structure", async () => {
    const config = {
        ...SYSTEM_DEFAULTS,
        deviceId: "d0000000-0000-4000-8000-000000000004",
        apiRoute: "sync",
        cleanIps: "104.19.1.1",
        socketPorts: "443",
        mode: "alpha"
    };

    const v2 = await buildVJsonProfile("xray.example.com", null, false, config);
    assert.equal(typeof v2, "object");
    assert(v2.inbounds && v2.outbounds && v2.routing);

    const vless = v2.outbounds.find((o) => o.protocol === "vless");
    assert(vless, "VLESS outbound exists");
    assert.equal(vless.settings.vnext[0].address, "104.19.1.1");
    assert.equal(vless.streamSettings.network, "ws");
    assert(vless.streamSettings.wsSettings.path.startsWith("/sync?ri="));
});

test("Subscriptions - generateWireguardConfig produces standard and Amnezia WireGuard profiles", () => {
    const sysConfig = {
        ...SYSTEM_DEFAULTS,
        warpEndpoints: ["engage.cloudflareclient.com:2408"],
        warpRemoteDNS: "1.1.1.1",
        amneziaNoiseCount: 7,
        amneziaNoiseSizeMin: 40,
        amneziaNoiseSizeMax: 80
    };

    // Standard WireGuard
    const stdConf = generateWireguardConfig(sysConfig, false, "TestWG");
    assert(stdConf.includes("[Interface]"));
    assert(stdConf.includes("[Peer]"));
    assert(stdConf.includes("Endpoint = engage.cloudflareclient.com:2408"));
    assert(stdConf.includes("DNS = 1.1.1.1"));
    assert(!stdConf.includes("Jc ="), "Standard WireGuard must not contain Amnezia noise parameters");

    // Amnezia WireGuard
    const amzConf = generateWireguardConfig(sysConfig, true, "TestAWG");
    assert(amzConf.includes("[Interface]"));
    assert(amzConf.includes("[Peer]"));
    assert(amzConf.includes("Jc = 7"));
    assert(amzConf.includes("Jmin = 40"));
    assert(amzConf.includes("Jmax = 80"));
    assert(amzConf.includes("H1 = 1"));
});

test("Subscriptions - Routing rules inject blockUDP443, bypassAi, and threat blocking", () => {
    const config = {
        ...SYSTEM_DEFAULTS,
        blockUDP443: true,
        bypassAi: true,
        bypassDev: true,
        blockThreats: true
    };

    // Sing-Box rules
    const sbRules = buildSingBoxRules(config, "select");
    assert(sbRules.some((r) => r.network === "udp" && r.port === 443 && r.outbound === "block"));
    assert(sbRules.some((r) => r.domain_suffix && r.domain_suffix.includes("openai.com") && r.outbound === "direct"));
    assert(sbRules.some((r) => r.domain_suffix && r.domain_suffix.includes("github.com") && r.outbound === "direct"));
    assert(sbRules.some((r) => r.domain_suffix && r.domain_suffix.includes("doubleclick.net") && r.outbound === "block"));

    // Clash rules
    const clashRules = buildClashRules(config, "PROXIES");
    assert(clashRules.includes("AND,((NETWORK,udp),(DST-PORT,443)),REJECT"));
    assert(clashRules.includes("DOMAIN-SUFFIX,openai.com,DIRECT"));
    assert(clashRules.includes("DOMAIN-SUFFIX,github.com,DIRECT"));
    assert(clashRules.includes("DOMAIN-SUFFIX,doubleclick.net,REJECT"));
});

test("Subscriptions - Sing-Box profile incorporates early_data_header_name and ECH when enabled", async () => {
    const config = {
        ...SYSTEM_DEFAULTS,
        deviceId: "f0000000-0000-4000-8000-000000000005",
        apiRoute: "sync",
        cleanIps: "104.20.1.1",
        socketPorts: "443",
        mode: "alpha",
        enableECH: true,
        blockUDP443: true
    };

    const sb = await buildSingBoxJsonProfile("ech.example.com", null, false, config);
    const vless = sb.outbounds.find((o) => o.type === "vless");
    assert(vless, "VLESS outbound exists");
    assert.equal(vless.transport.early_data_header_name, "Sec-WebSocket-Protocol");
    assert.equal(vless.transport.max_early_data, 2560);
    assert.equal(vless.tls.ech.enabled, true);
    assert.equal(vless.tls.ech.pq_signature_schemes_enabled, true);

    // Verify blockUDP443 rule present in route.rules
    assert(sb.route.rules.some((r) => r.network === "udp" && r.port === 443 && r.outbound === "block"));
});
