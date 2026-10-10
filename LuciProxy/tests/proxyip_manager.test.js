import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";

import { SYSTEM_DEFAULTS } from "../src/config.js";
import {
    DEFAULT_PROXY_IP_POOL,
    isValidIPv6,
    parseProxyIpEntry,
    validateProxyIpEntry,
    normalizeProxyIp,
    parseProxyIpList,
    isUserProxyIpOverrideActive,
    isProxyIpEnabled,
    resolveProxyIpPolicy,
    getEffectiveProxyIpPool,
    selectDeterministicProxyIp
} from "../src/subscriptions/proxyip.js";
import { getResolvedEndpointPopulation } from "../src/subscriptions/population.js";
import { buildUriProfile } from "../src/subscriptions/uri.js";
import { buildVJsonProfile } from "../src/subscriptions/v2ray.js";
import { buildSingBoxJsonProfile } from "../src/subscriptions/singbox.js";
import { buildYamlProfile } from "../src/subscriptions/clash.js";

// Helper dummy config for subscription tests
const createBaseConfig = (overrides = {}) => ({
    ...SYSTEM_DEFAULTS,
    deviceId: "00000000-0000-0000-0000-000000000001",
    apiRoute: "sync",
    cleanIp: "104.16.1.1",
    socketPorts: "443",
    cleanIpVless: "104.16.1.1",
    cleanIpTrojan: "104.16.1.1",
    cleanIpVlessEch: "",
    cleanIpTrojanEch: "",
    ...overrides
});

// 1. Default pool resolution
test("ProxyIP 1 - Default pool resolution (30-entry pool)", () => {
    assert.equal(Array.isArray(DEFAULT_PROXY_IP_POOL), true);
    assert.equal(DEFAULT_PROXY_IP_POOL.length, 30);
    assert.deepEqual(DEFAULT_PROXY_IP_POOL, [
        "proxy.zjcloud.us.ci",
        "pyip.ygkkk.dpdns.org",
        "proxy.farel.is-a.dev",
        "proxyip.oracle.fxxk.dedyn.io",
        "di.nscl.ir",
        "nima.nscl.ir",
        "tr.diam4.ggff.net",
        "kz.proxyip.etoj.run.place",
        "proxyip.jp.fxxk.dedyn.io",
        "proxyip.us.fxxk.dedyn.io",
        "proxyip.cmliussss.net",
        "proxyip.hk.cmliussss.net",
        "proxyip.sg.cmliussss.net",
        "proxyip.jp.cmliussss.net",
        "proxyip.kr.cmliussss.net",
        "proxyip.in.cmliussss.net",
        "proxyip.gb.cmliussss.net",
        "proxyip.fr.cmliussss.net",
        "proxyip.de.cmliussss.net",
        "proxyip.nl.cmliussss.net",
        "proxyip.se.cmliussss.net",
        "proxyip.fi.cmliussss.net",
        "proxyip.pl.cmliussss.net",
        "proxyip.ru.cmliussss.net",
        "proxyip.ch.cmliussss.net",
        "proxyip.lv.cmliussss.net",
        "proxyip.us.cmliussss.net",
        "proxyip.ca.cmliussss.net",
        "kr.william.us.ci",
        "tw.william.us.ci"
    ]);

    const pool = getEffectiveProxyIpPool(null, {});
    assert.deepEqual(pool, DEFAULT_PROXY_IP_POOL);
});

// 2. Custom global pool
test("ProxyIP 2 - Custom global pool configuration", () => {
    const sysConfig = {
        proxyIpMode: "custom",
        proxyIpPool: ["custom1.example.com", "custom2.example.com:8443"]
    };
    const pool = getEffectiveProxyIpPool(null, sysConfig);
    assert.deepEqual(pool, ["custom1.example.com", "custom2.example.com:8443"]);
});

// 3. User override
test("ProxyIP 3 - User override resolution", () => {
    const profile = { proxyIp: "user-proxy.example.com:8443" };
    const pool = getEffectiveProxyIpPool(profile, {});
    assert.deepEqual(pool, ["user-proxy.example.com:8443"]);
    assert.equal(isUserProxyIpOverrideActive(profile), true);
});

// 4. User override replaces default (never merged)
test("ProxyIP 4 - User override strictly replaces default pool (no merging)", () => {
    const sysConfig = {
        proxyIpMode: "builtin",
        proxyIpPool: [...DEFAULT_PROXY_IP_POOL]
    };
    const profile = { proxyIp: "isolated-user.example.com" };

    const pool = getEffectiveProxyIpPool(profile, sysConfig);
    assert.equal(pool.length, 1);
    assert.equal(pool[0], "isolated-user.example.com");

    // Must not contain any default pool members
    for (const def of DEFAULT_PROXY_IP_POOL) {
        assert.equal(pool.includes(def), false, `Should not include default entry: ${def}`);
    }
});

// 5. Clear user override restores default
test("ProxyIP 5 - Clear user override restores default pool", () => {
    const profileCleared1 = { proxyIp: "" };
    const profileCleared2 = { proxyIp: null };
    const profileCleared3 = { proxyIp: "   " };
    const profileCleared4 = {};

    assert.equal(isUserProxyIpOverrideActive(profileCleared1), false);
    assert.equal(isUserProxyIpOverrideActive(profileCleared2), false);
    assert.equal(isUserProxyIpOverrideActive(profileCleared3), false);
    assert.equal(isUserProxyIpOverrideActive(profileCleared4), false);

    assert.deepEqual(getEffectiveProxyIpPool(profileCleared1, {}), DEFAULT_PROXY_IP_POOL);
    assert.deepEqual(getEffectiveProxyIpPool(profileCleared2, {}), DEFAULT_PROXY_IP_POOL);
    assert.deepEqual(getEffectiveProxyIpPool(profileCleared3, {}), DEFAULT_PROXY_IP_POOL);
    assert.deepEqual(getEffectiveProxyIpPool(profileCleared4, {}), DEFAULT_PROXY_IP_POOL);
});

// 6. Single Proxy IP parsing
test("ProxyIP 6 - Single Proxy IP parsing", () => {
    const parsed = parseProxyIpEntry("single.example.com");
    assert.equal(parsed.host, "single.example.com");
    assert.equal(parsed.port, 443);
    assert.equal(parsed.cleanHost, "single.example.com");
});

// 7. Multiple Proxy IPs parsing
test("ProxyIP 7 - Multiple Proxy IPs parsing from list or multiline", () => {
    const rawInput = "proxy1.example.com, proxy2.example.com:8443\nproxy3.example.com";
    const list = parseProxyIpList(rawInput);
    assert.equal(list.length, 3);
    assert.equal(list[0].formatted, "proxy1.example.com");
    assert.equal(list[1].formatted, "proxy2.example.com:8443");
    assert.equal(list[2].formatted, "proxy3.example.com");
});

// 8. Hostname format validation
test("ProxyIP 8 - Hostname format validation", () => {
    assert.equal(validateProxyIpEntry("proxy.example.com").valid, true);
    assert.equal(validateProxyIpEntry("my-sub.domain.co.uk:443").valid, true);
    assert.equal(validateProxyIpEntry("invalid..domain.com").valid, false);
});

// 9. IPv4 format validation
test("ProxyIP 9 - IPv4 format validation", () => {
    assert.equal(validateProxyIpEntry("198.51.100.1").valid, true);
    assert.equal(validateProxyIpEntry("1.1.1.1:443").valid, true);
    assert.equal(validateProxyIpEntry("999.999.999.999").valid, false);
});

// 10. IPv6 format validation
test("ProxyIP 10 - IPv6 format validation", () => {
    assert.equal(isValidIPv6("2001:db8::1"), true);
    assert.equal(validateProxyIpEntry("2001:db8::1").valid, true);
    assert.equal(validateProxyIpEntry("[2001:db8::1]:8443").valid, true);
    assert.equal(validateProxyIpEntry("[2001:db8::1]").valid, true);
    assert.equal(validateProxyIpEntry("2001:db8:::1").valid, false);
});

// 11. Optional port parsing
test("ProxyIP 11 - Optional port parsing and formatting", () => {
    const p1 = parseProxyIpEntry("proxy.com:8080");
    assert.equal(p1.host, "proxy.com");
    assert.equal(p1.port, 8080);
    assert.equal(p1.formatted, "proxy.com:8080");

    const p2 = parseProxyIpEntry("1.2.3.4:2087");
    assert.equal(p2.host, "1.2.3.4");
    assert.equal(p2.port, 2087);
    assert.equal(p2.formatted, "1.2.3.4:2087");

    const p3 = parseProxyIpEntry("[2606:4700::1]:8443");
    assert.equal(p3.host, "2606:4700::1");
    assert.equal(p3.port, 8443);
    assert.equal(p3.formatted, "[2606:4700::1]:8443");

    assert.equal(normalizeProxyIp("proxy.com:443"), "proxy.com");
    assert.equal(normalizeProxyIp("proxy.com:8443"), "proxy.com:8443");
});

// 12. Duplicate removal
test("ProxyIP 12 - Duplicate removal during parsing", () => {
    const raw = "proxy.example.com, proxy.example.com:443, proxy.example.com, other.org";
    const parsed = parseProxyIpList(raw);
    assert.equal(parsed.length, 2);
    assert.equal(parsed[0].cleanHost, "proxy.example.com");
    assert.equal(parsed[1].cleanHost, "other.org");
});

// 13. Malformed input handling
test("ProxyIP 13 - Malformed input handling and error rejection", () => {
    assert.equal(validateProxyIpEntry("").valid, false);
    assert.equal(validateProxyIpEntry("   ").valid, false);
    assert.equal(validateProxyIpEntry("has space.com").valid, false);
    assert.equal(validateProxyIpEntry("proxy.com:99999").valid, false); // port > 65535
    assert.equal(validateProxyIpEntry("proxy.com:0").valid, false); // port 0
    assert.equal(validateProxyIpEntry("proxy.com:abc").valid, false);
    assert.equal(validateProxyIpEntry("[bad-ipv6]:443").valid, false);

    assert.equal(parseProxyIpEntry("bad host:name"), null);
});

// 14. Deterministic selection behavior
test("ProxyIP 14 - Deterministic selection behavior per edge and client", () => {
    const pool = ["ip1.test", "ip2.test", "ip3.test", "ip4.test"];
    const ctxA = { colo: "FRA", clientId: "user-alpha", index: 0 };
    const ctxB = { colo: "NRT", clientId: "user-beta", index: 0 };

    // Same context yields identical deterministic selection
    const pickA1 = selectDeterministicProxyIp(pool, ctxA);
    const pickA2 = selectDeterministicProxyIp(pool, ctxA);
    assert.equal(pickA1, pickA2);

    // Different contexts distribute across pool
    const pickB1 = selectDeterministicProxyIp(pool, ctxB);
    assert.equal(typeof pickB1, "string");
    assert.equal(pool.includes(pickB1), true);
});

// 15. Fallback between candidates
test("ProxyIP 15 - Fallback rotation between candidates", () => {
    const pool = ["cand0", "cand1", "cand2", "cand3"];
    const ctx = { colo: "LHR", clientId: "user-gamma", index: 0 };

    const first = selectDeterministicProxyIp(pool, { ...ctx, attempt: 0 });
    const second = selectDeterministicProxyIp(pool, { ...ctx, attempt: 1 });
    const third = selectDeterministicProxyIp(pool, { ...ctx, attempt: 2 });
    const fourth = selectDeterministicProxyIp(pool, { ...ctx, attempt: 3 });
    const wrapped = selectDeterministicProxyIp(pool, { ...ctx, attempt: 4 });

    assert.notEqual(first, second);
    assert.notEqual(second, third);
    assert.notEqual(third, fourth);
    assert.equal(first, wrapped); // Wraps around modulo pool length
});

// 16. Subscription serialization includes proxyip parameter
test("ProxyIP 16 - Subscription population includes proxyip query param", () => {
    const cfg = createBaseConfig({
        proxyIpMode: "custom",
        proxyIpPool: ["custom-pip.domain.com:8443"]
    });
    const pop = getResolvedEndpointPopulation("example.com", null, false, cfg);
    assert.ok(pop.length > 0);

    for (const node of pop) {
        assert.ok(node.path.includes("proxyip="), `Node path must include proxyip param: ${node.path}`);
        assert.ok(node.path.includes("custom-pip.domain.com%3A8443") || node.path.includes("custom-pip.domain.com:8443"));
    }
});

// 17. Xray outbounds receive path with proxyip
test("ProxyIP 17 - Xray configuration preserves proxyip in outbound streamSettings", async () => {
    const cfg = createBaseConfig({
        proxyIpMode: "custom",
        proxyIpPool: ["xray-pip.test:443"]
    });
    const vjson = await buildVJsonProfile("example.com", null, false, cfg);

    const proxyOutbounds = vjson.outbounds.filter(o => o.protocol === "vless" || o.protocol === "trojan");
    assert.ok(proxyOutbounds.length > 0);

    for (const ob of proxyOutbounds) {
        const stream = ob.streamSettings;
        const transportPath = stream.wsSettings?.path || stream.httpupgradeSettings?.path;
        assert.ok(transportPath, "Must have WebSocket or HTTPUpgrade transport path");
        assert.ok(transportPath.includes("proxyip=xray-pip.test"), `Path missing proxyip: ${transportPath}`);
    }
});

// 18. Sing-box outbounds receive path with proxyip
test("ProxyIP 18 - Sing-box configuration preserves proxyip in outbound transport", async () => {
    const cfg = createBaseConfig({
        proxyIpMode: "custom",
        proxyIpPool: ["singbox-pip.test"]
    });
    const sb = await buildSingBoxJsonProfile("example.com", null, false, cfg);

    const proxyOutbounds = sb.outbounds.filter(o => (o.type === "vless" || o.type === "trojan") && o.server !== "127.0.0.1");
    assert.ok(proxyOutbounds.length > 0);

    for (const ob of proxyOutbounds) {
        const path = ob.transport?.path;
        assert.ok(path, "Singbox outbound must have transport path");
        assert.ok(path.includes("proxyip=singbox-pip.test"), `Path missing proxyip: ${path}`);
    }
});

// 19. Mihomo / Clash receive path with proxyip
test("ProxyIP 19 - Mihomo / Clash configuration preserves proxyip in proxy transport", async () => {
    const cfg = createBaseConfig({
        proxyIpMode: "custom",
        proxyIpPool: ["clash-pip.test:8443"]
    });
    const clashYaml = await buildYamlProfile("example.com", null, false, cfg);

    assert.ok(clashYaml.includes("proxyip=clash-pip.test%3A8443") || clashYaml.includes("proxyip=clash-pip.test:8443"),
        "Clash YAML must serialize proxyip in proxy definitions");
});

// 20. Raw URI receives path with proxyip
test("ProxyIP 20 - Raw URI export preserves proxyip in path query param", async () => {
    const cfg = createBaseConfig({
        proxyIpMode: "custom",
        proxyIpPool: ["raw-pip.test"]
    });
    const rawUris = await buildUriProfile("example.com", null, false, cfg);

    const lines = rawUris.split("\n").filter(l => l.trim().length > 0 && (l.startsWith("vless://") || (l.startsWith("trojan://") && !l.includes("127.0.0.1:1080"))));
    assert.ok(lines.length > 0);

    for (const line of lines) {
        assert.ok(line.includes("proxyip%3Draw-pip.test") || line.includes("proxyip=raw-pip.test"),
            `Raw URI missing proxyip query parameter: ${line}`);
    }
});

// 21. Builder synchronization verification
test("ProxyIP 21 - LuciProxy and Builder payload files are synchronized", () => {
    const filesToCompare = [
        "src/config.js",
        "src/subscriptions/proxyip.js",
        "src/subscriptions/population.js",
        "src/users/manager.js",
        "src/protocols/proxy.js",
        "src/assets/dashboard.html",
        "src/assets/templates.js"
    ];

    const repoRoot = path.resolve(import.meta.dirname, "../..");
    const srcDir = path.join(repoRoot, "LuciProxy");
    const builderPayloadDir = path.join(repoRoot, "Builder/src/assets/luciproxy_payload/LuciProxy");

    for (const rel of filesToCompare) {
        const srcPath = path.join(srcDir, rel);
        const payloadPath = path.join(builderPayloadDir, rel);

        if (fs.existsSync(payloadPath)) {
            const srcContent = fs.readFileSync(srcPath, "utf-8");
            const payloadContent = fs.readFileSync(payloadPath, "utf-8");
            assert.equal(srcContent, payloadContent, `Mismatch between LuciProxy and Builder payload: ${rel}`);
        }
    }
});

// 22. Clean-room independence scan
test("ProxyIP 22 - Clean-room independence scan (zero references to Nova/EdgeTunnel)", () => {
    const repoRoot = path.resolve(import.meta.dirname, "../..");
    const srcDir = path.join(repoRoot, "LuciProxy/src");

    const forbiddenPatterns = [
        /IRNova/i,
        /all\.json/i,
        /nova old/i,
        /edgetunnel/i
    ];

    function scanDir(dir) {
        const entries = fs.readdirSync(dir, { withFileTypes: true });
        for (const entry of entries) {
            const fullPath = path.join(dir, entry.name);
            if (entry.isDirectory()) {
                scanDir(fullPath);
            } else if (entry.isFile() && (entry.name.endsWith(".js") || entry.name.endsWith(".html"))) {
                const content = fs.readFileSync(fullPath, "utf-8");
                for (const pattern of forbiddenPatterns) {
                    assert.equal(pattern.test(content), false,
                        `Forbidden pattern ${pattern} found in clean-room file: ${fullPath}`);
                }
            }
        }
    }

    scanDir(srcDir);
});

// 23. State 1 — Proxy IP OFF verification
test("ProxyIP 23 - State 1 (OFF): No Proxy IP used, pool empty, paths omit proxyip", () => {
    // A: System-level disable
    const sysDisabled = { enableProxyIp: false };
    assert.equal(isProxyIpEnabled(null, sysDisabled), false);
    const policySys = resolveProxyIpPolicy(null, sysDisabled);
    assert.equal(policySys.enabled, false);
    assert.equal(policySys.mode, "off");
    assert.deepEqual(policySys.pool, []);
    assert.equal(policySys.selected, null);
    assert.deepEqual(getEffectiveProxyIpPool(null, sysDisabled), []);

    // B: Profile-level disable overrides populated field
    const profileDisabled = { enableProxyIp: false, proxyIp: "user-proxy.example.com" };
    assert.equal(isProxyIpEnabled(profileDisabled, {}), false);
    const policyProf = resolveProxyIpPolicy(profileDisabled, {});
    assert.equal(policyProf.enabled, false);
    assert.equal(policyProf.mode, "off");
    assert.deepEqual(policyProf.pool, []);
    assert.equal(policyProf.selected, null);
    assert.deepEqual(getEffectiveProxyIpPool(profileDisabled, {}), []);

    // C: Population paths omit &proxyip= when OFF
    const cfgDisabled = createBaseConfig({
        enableProxyIp: false,
        cleanIp: "104.16.1.1, 104.16.1.2"
    });
    const nodes = getResolvedEndpointPopulation("test.example.com", null, false, cfgDisabled);
    assert.ok(nodes.length > 0);
    for (const node of nodes) {
        assert.equal(node.selectedProxyIp, null);
        assert.equal(node.path.includes("proxyip="), false, `Path must not contain proxyip when OFF: ${node.path}`);
    }
});

// 24. State 2 — Automatic mode (ON + empty / whitespace)
test("ProxyIP 24 - State 2 (Automatic): Whitespace treated as empty, Operator > Built-in precedence", () => {
    // A: Empty string
    const policyEmpty = resolveProxyIpPolicy({ proxyIp: "" }, {});
    assert.equal(policyEmpty.enabled, true);
    assert.equal(policyEmpty.mode, "auto");
    assert.equal(policyEmpty.source, "builtin");
    assert.deepEqual(policyEmpty.pool, DEFAULT_PROXY_IP_POOL);

    // B: Whitespace only
    const policyWs = resolveProxyIpPolicy({ proxyIp: "   \t\n   " }, {});
    assert.equal(policyWs.enabled, true);
    assert.equal(policyWs.mode, "auto");
    assert.equal(policyWs.source, "builtin");
    assert.deepEqual(policyWs.pool, DEFAULT_PROXY_IP_POOL);

    // C: Operator custom pool precedence
    const sysCustom = {
        proxyIpMode: "custom",
        proxyIpPool: ["op-pip1.example.com", "op-pip2.example.com"]
    };
    const policyOp = resolveProxyIpPolicy({ proxyIp: "  " }, sysCustom);
    assert.equal(policyOp.enabled, true);
    assert.equal(policyOp.mode, "auto");
    assert.equal(policyOp.source, "operator");
    assert.deepEqual(policyOp.pool, ["op-pip1.example.com", "op-pip2.example.com"]);
});

// 25. State 3 — User override (ON + populated)
test("ProxyIP 25 - State 3 (User Override): Strictly user list, never merged", () => {
    const sysCustom = {
        proxyIpMode: "custom",
        proxyIpPool: ["op-pip1.example.com"]
    };
    const userProfile = {
        proxyIp: "user-only1.example.com, user-only2.example.com:8443"
    };

    const policy = resolveProxyIpPolicy(userProfile, sysCustom);
    assert.equal(policy.enabled, true);
    assert.equal(policy.mode, "user");
    assert.equal(policy.source, "user");
    assert.deepEqual(policy.pool, ["user-only1.example.com", "user-only2.example.com:8443"]);
    assert.equal(policy.pool.includes("op-pip1.example.com"), false);
    for (const def of DEFAULT_PROXY_IP_POOL) {
        assert.equal(policy.pool.includes(def), false);
    }
});

// 26. Subscription population exact counts: 183 nodes in dual mode, 180 in alpha mode
test("ProxyIP 26 - Dual mode produces exact 183 nodes (180 VLESS + 3 Trojan), alpha produces 180", () => {
    // 2 clean IPs + 1 primary host = 3 base IPs
    // 60 default ECH configs
    // mode: "both" -> 3 base IPs * 60 ECH = 180 VLESS; 3 base IPs * 1 = 3 Trojan -> 183 TOTAL
    const cfgBoth = createBaseConfig({
        cleanIp: "104.16.1.1, 104.16.1.2",
        mode: "both",
        enableProxyIp: true
    });
    const nodesBoth = getResolvedEndpointPopulation("primary.example.com", null, false, cfgBoth);
    const vlessCount = nodesBoth.filter(n => n.type === "vless").length;
    const trojanCount = nodesBoth.filter(n => n.type === "trojan").length;

    assert.equal(vlessCount, 180, "Must have exactly 180 VLESS nodes");
    assert.equal(trojanCount, 3, "Must have exactly 3 Trojan nodes");
    assert.equal(nodesBoth.length, 183, "Must have exactly 183 total nodes in dual mode");

    // mode: "alpha" -> 3 base IPs * 60 ECH = 180 VLESS; 0 Trojan -> 180 TOTAL
    const cfgAlpha = createBaseConfig({
        cleanIp: "104.16.1.1, 104.16.1.2",
        mode: "alpha",
        enableProxyIp: true
    });
    const nodesAlpha = getResolvedEndpointPopulation("primary.example.com", null, false, cfgAlpha);
    assert.equal(nodesAlpha.length, 180, "Must have exactly 180 total nodes in alpha mode");
});

// 27. Population node count invariant between Proxy IP ON and OFF
test("ProxyIP 27 - Population node count is identical whether Proxy IP is ON or OFF (Zero Cartesian explosion)", () => {
    const cfgOn = createBaseConfig({
        cleanIp: "104.16.1.1, 104.16.1.2",
        mode: "both",
        enableProxyIp: true
    });
    const cfgOff = createBaseConfig({
        cleanIp: "104.16.1.1, 104.16.1.2",
        mode: "both",
        enableProxyIp: false
    });

    const nodesOn = getResolvedEndpointPopulation("primary.example.com", null, false, cfgOn);
    const nodesOff = getResolvedEndpointPopulation("primary.example.com", null, false, cfgOff);

    assert.equal(nodesOn.length, 183);
    assert.equal(nodesOff.length, 183);
    assert.equal(nodesOn.length, nodesOff.length, "Proxy IP state must not alter total node count");

    // ON nodes have proxyip in path; OFF nodes do not
    assert.ok(nodesOn[0].path.includes("proxyip="));
    assert.ok(!nodesOff[0].path.includes("proxyip="));
});

// 28. 30-entry pool validation and zero case-insensitive duplicates
test("ProxyIP 28 - Exact 30-entry built-in list order, validity, and zero case-insensitive duplicates", () => {
    const rawExpectedOrder = [
        "proxy.zjcloud.us.ci",
        "pyip.ygkkk.dpdns.org",
        "proxy.farel.is-a.dev",
        "proxyip.oracle.fxxk.dedyn.io",
        "di.nscl.ir",
        "nima.nscl.ir",
        "tr.diam4.ggff.net",
        "kz.proxyip.etoj.run.place",
        "proxyip.jp.fxxk.dedyn.io",
        "proxyip.us.fxxk.dedyn.io",
        "ProxyIP.CMLiussss.net",
        "ProxyIP.HK.CMLiussss.net",
        "ProxyIP.SG.CMLiussss.net",
        "ProxyIP.JP.CMLiussss.net",
        "ProxyIP.KR.CMLiussss.net",
        "ProxyIP.IN.CMLiussss.net",
        "ProxyIP.GB.CMLiussss.net",
        "ProxyIP.FR.CMLiussss.net",
        "ProxyIP.DE.CMLiussss.net",
        "ProxyIP.NL.CMLiussss.net",
        "ProxyIP.SE.CMLiussss.net",
        "ProxyIP.FI.CMLiussss.net",
        "ProxyIP.PL.CMLiussss.net",
        "ProxyIP.RU.CMLiussss.net",
        "ProxyIP.CH.CMLiussss.net",
        "ProxyIP.LV.CMLiussss.net",
        "ProxyIP.US.CMLiussss.net",
        "ProxyIP.CA.CMLiussss.net",
        "kr.william.us.ci",
        "tw.william.us.ci"
    ];

    assert.equal(DEFAULT_PROXY_IP_POOL.length, 30);
    assert.equal(rawExpectedOrder.length, 30);

    // Verify order and case-insensitive equality
    for (let i = 0; i < 30; i++) {
        const item = DEFAULT_PROXY_IP_POOL[i];
        assert.equal(item.toLowerCase(), rawExpectedOrder[i].toLowerCase(), `Order or identity mismatch at index ${i}`);
        const validated = validateProxyIpEntry(item);
        assert.equal(validated.valid, true, `Entry at index ${i} must be valid: ${item}`);
    }

    // Zero case-insensitive duplicates
    const lowerSet = new Set(DEFAULT_PROXY_IP_POOL.map(s => s.toLowerCase()));
    assert.equal(lowerSet.size, 30, "Pool must contain exactly 30 distinct hostnames");
});

// 29. Dashboard HTML consistency with 30-entry default pool and label
test("ProxyIP 29 - Dashboard HTML consistency with 30-entry pool and UI count label", () => {
    const repoRoot = path.resolve(import.meta.dirname, "../..");
    const dashPath = path.join(repoRoot, "LuciProxy/src/assets/dashboard.html");
    const content = fs.readFileSync(dashPath, "utf-8");

    // Must contain 30 Built-in Endpoints label in HTML and JS
    assert.ok(content.includes("Active Proxy IP Pool (30 Built-in Endpoints)"), "Must display 30 Built-in Endpoints");
    assert.ok(!content.includes("Active Proxy IP Pool (4 Built-in Endpoints)"), "Must not display legacy 4 Built-in Endpoints");

    // Verify all 30 pool items are present in dashboard.html
    for (const item of DEFAULT_PROXY_IP_POOL) {
        assert.ok(content.includes(item), `Dashboard must include pool item: ${item}`);
    }
});

// 30. Deterministic selection behavior with 30-entry pool
test("ProxyIP 30 - Deterministic selection behavior and rotation failover with 30 entries", () => {
    const ctx = { colo: "FRA", clientId: "sub-test-client", index: 0 };
    const initialPick = selectDeterministicProxyIp(DEFAULT_PROXY_IP_POOL, { ...ctx, attempt: 0 });
    assert.ok(initialPick, "Initial pick must not be null");
    assert.ok(DEFAULT_PROXY_IP_POOL.includes(initialPick), "Initial pick must exist in pool");

    // Consecutive failover attempts should cycle through candidates
    const distinctPicks = new Set();
    for (let attempt = 0; attempt < 30; attempt++) {
        const pick = selectDeterministicProxyIp(DEFAULT_PROXY_IP_POOL, { ...ctx, attempt });
        distinctPicks.add(pick);
    }
    assert.equal(distinctPicks.size, 30, "Advancing attempt from 0 to 29 must cover all 30 candidates");

    // Attempt 30 wraps around modulo 30
    const wrappedPick = selectDeterministicProxyIp(DEFAULT_PROXY_IP_POOL, { ...ctx, attempt: 30 });
    assert.equal(wrappedPick, initialPick, "Attempt 30 must wrap around to attempt 0 pick");
});

// 31. Persistence safety: 30-entry defaults do not override custom or user settings
test("ProxyIP 31 - Persistence safety: 30-entry defaults never clobber existing custom configurations", () => {
    // 1. User override takes strict priority
    const userProfile = { proxyIp: "user-custom.domain.com:8443" };
    const userEffective = getEffectiveProxyIpPool(userProfile, {});
    assert.deepEqual(userEffective, ["user-custom.domain.com:8443"]);
    for (const def of DEFAULT_PROXY_IP_POOL) {
        assert.equal(userEffective.includes(def), false, "User override must not include default entries");
    }

    // 2. Operator custom pool takes strict priority
    const customSysConfig = {
        proxyIpMode: "custom",
        proxyIpPool: ["operator-relay.internal.net", "backup-relay.internal.net:8443"]
    };
    const operatorEffective = getEffectiveProxyIpPool(null, customSysConfig);
    assert.deepEqual(operatorEffective, ["operator-relay.internal.net", "backup-relay.internal.net:8443"]);

    // 3. Disabled ProxyIP remains strictly disabled
    const disabledConfig = { enableProxyIp: false };
    assert.deepEqual(getEffectiveProxyIpPool(null, disabledConfig), []);

    // 4. Policy source tagging
    const policyUser = resolveProxyIpPolicy(userProfile, customSysConfig);
    assert.equal(policyUser.source, "user");
    const policyCustom = resolveProxyIpPolicy(null, customSysConfig);
    assert.equal(policyCustom.source, "operator");
    const policyBuiltin = resolveProxyIpPolicy(null, { proxyIpMode: "builtin" });
    assert.equal(policyBuiltin.source, "builtin");
    assert.equal(policyBuiltin.pool.length, 30);
});
