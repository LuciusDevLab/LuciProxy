import { test } from "node:test";
import assert from "node:assert/strict";
import { SYSTEM_DEFAULTS } from "../src/config.js";
import { buildUriProfile } from "../src/subscriptions/uri.js";
import { buildVJsonProfile } from "../src/subscriptions/v2ray.js";
import { buildYamlProfile } from "../src/subscriptions/clash.js";
import { safeBtoa, safeAtob } from "../src/utils/crypto.js";
import { setCachedConfig, resetStateStore } from "../src/db/d1.js";
import worker from "../src/index.js";
import {
    parseFinalMask,
    resolveFinalMask,
    formatVlessFinalMaskParam,
    formatVlessFragmentParam,
    formatXrayFinalMask,
    formatClashFragmentYaml,
    importVlessUri,
} from "../src/subscriptions/finalmask.js";

// Deterministic regression fixture with distinctive values
const REGRESSION_FIXTURE = {
    packets: "tlshello",
    lengths: ["101-123"],
    delays: ["7-9"],
    maxSplit: 17,
};

test("FinalMask Part 1 & 5 - Real failure mode reproduction and semantic round-trip verification", async () => {
    // 1. REPRODUCE FAILURE MODE:
    // In the old buggy generator, FinalMask was placed after # as the hash tag:
    // vless://uuid@host:443?security=tls#101-123%2C7-9%2Ctlshello
    // When imported by a real client, query parameter 'fragment' was missing,
    // so finalmask was lost/null and the node treated fragmentation as OFF.
    const buggyOldUri = "vless://a0000000-0000-4000-8000-000000000001@104.16.1.1:443?encryption=none&security=tls&sni=myhost.com&fp=chrome&type=ws&host=myhost.com&path=/sync#101-123%2C7-9%2Ctlshello";
    const buggyImported = importVlessUri(buggyOldUri);
    assert.equal(buggyImported.finalmask, null, "Bug reproduced: old URI loses FinalMask upon client import");
    assert.equal(buggyImported.name, "101-123,7-9,tlshello", "Bug reproduced: old URI incorrectly used FinalMask as node display name");

    // 2. VERIFY FIXED GENERATOR:
    const config = {
        ...SYSTEM_DEFAULTS,
        deviceId: "a0000000-0000-4000-8000-000000000001",
        apiRoute: "sync",
        cleanIps: "104.16.1.1",
        socketPorts: "443",
        mode: "alpha",
        echConfigList: [], // Clean test without ECH expansion
        finalMask: REGRESSION_FIXTURE,
    };

    const uris = await buildUriProfile("myhost.com", null, false, config);
    const lines = uris.split("\n").filter((l) => l.startsWith("vless://"));
    assert.equal(lines.length, 2); // 1 Clean IP + 1 Primary

    const rawUri = lines[0];

    // Assert URI format
    assert(rawUri.includes("&fm="), "URI must contain &fm= query parameter");
    assert(rawUri.includes(encodeURIComponent("101-123")), "URI must contain encoded FinalMask values");
    assert(!rawUri.includes("#101-123"), "URI must NOT place FinalMask in #hash");
    assert(rawUri.includes("#Luci-"), "URI #hash must be the node display name");

    // Assert real client importer semantic reconstruction
    const imported = importVlessUri(rawUri);
    assert.equal(imported.protocol, "vless");
    assert.equal(imported.address, "104.16.1.1");
    assert.equal(imported.port, 443);
    assert.equal(imported.security, "tls");
    assert.equal(imported.sni, "myhost.com");
    assert(imported.name.startsWith("Luci-"), "Node name preserved in client model");

    // CRITICAL: Prove semantic round-trip preservation of exact distinctive values
    assert.notEqual(imported.finalmask, null, "Imported node must have FinalMask enabled");
    assert.equal(imported.finalmask.enabled, true);
    assert.equal(imported.finalmask.packets, "tlshello");
    assert.deepEqual(imported.finalmask.lengths, ["101-123"]);
    assert.deepEqual(imported.finalmask.delays, ["7-9"]);
    assert.equal(imported.finalmask.maxSplit, 17);
});

test("FinalMask Part 4 A - Raw VLESS URI semantic preservation with JSON and string formats", async () => {
    // Test JSON string input
    const configJsonStr = {
        ...SYSTEM_DEFAULTS,
        deviceId: "b0000000-0000-4000-8000-000000000002",
        apiRoute: "sync",
        cleanIps: "1.1.1.1",
        socketPorts: "443",
        mode: "alpha",
        echConfigList: [],
        finalMask: JSON.stringify({
            packets: "tlshello",
            lengths: ["105-130"],
            delays: ["12-25"],
            maxSplit: 9,
        }),
    };

    const uris = await buildUriProfile("edge.domain.com", null, false, configJsonStr);
    const line = uris.split("\n").find((l) => l.startsWith("vless://"));
    assert(line);

    const imported = importVlessUri(line);
    assert.equal(imported.finalmask.enabled, true);
    assert.equal(imported.finalmask.packets, "tlshello");
    assert.deepEqual(imported.finalmask.lengths, ["105-130"]);
    assert.deepEqual(imported.finalmask.delays, ["12-25"]);
    assert.equal(imported.finalmask.maxSplit, 9);
});

test("FinalMask Part 4 B - Base64 subscription containing VLESS URIs survives decoding & import", async () => {
    const config = {
        ...SYSTEM_DEFAULTS,
        deviceId: "c0000000-0000-4000-8000-000000000003",
        apiRoute: "sync",
        cleanIps: "104.18.1.1",
        socketPorts: "443",
        mode: "alpha",
        echConfigList: [],
        finalMask: REGRESSION_FIXTURE,
    };

    const rawPayload = await buildUriProfile("sub.worker.dev", null, false, config);
    // Base64 encode as worker subscription endpoint does
    const b64Sub = safeBtoa(rawPayload);

    // Client decodes subscription
    const decodedPayload = safeAtob(b64Sub);
    const vlessLines = decodedPayload.split("\n").filter((l) => l.startsWith("vless://"));
    assert(vlessLines.length >= 2);

    for (const line of vlessLines) {
        const imported = importVlessUri(line);
        assert.equal(imported.finalmask.enabled, true);
        assert.equal(imported.finalmask.packets, "tlshello");
        assert.deepEqual(imported.finalmask.lengths, ["101-123"]);
        assert.deepEqual(imported.finalmask.delays, ["7-9"]);
        assert.equal(imported.finalmask.maxSplit, 17);
    }
});

test("FinalMask Part 4 C - Xray JSON retains streamSettings.finalmask", async () => {
    const config = {
        ...SYSTEM_DEFAULTS,
        deviceId: "d0000000-0000-4000-8000-000000000004",
        apiRoute: "sync",
        cleanIps: "104.19.1.1",
        socketPorts: "443",
        mode: "alpha",
        finalMask: REGRESSION_FIXTURE,
    };

    const xrayConfig = await buildVJsonProfile("xray.target.com", null, false, config);
    const vlessOutbound = xrayConfig.outbounds.find((o) => o.protocol === "vless");
    assert(vlessOutbound, "VLESS outbound must exist");

    const streamSettings = vlessOutbound.streamSettings;
    assert.equal(streamSettings.security, "tls");
    assert(streamSettings.finalmask, "streamSettings.finalmask must be present for TLS outbound");
    assert.equal(streamSettings.finalmask.enabled, true);
    assert.equal(streamSettings.finalmask.packets, "tlshello");
    assert.deepEqual(streamSettings.finalmask.lengths, ["101-123"]);
    assert.deepEqual(streamSettings.finalmask.delays, ["7-9"]);
    assert.equal(streamSettings.finalmask.maxSplit, 17);
});

test("FinalMask Part 4 D - Mihomo / Clash Meta YAML retains native fragment block", async () => {
    const config = {
        ...SYSTEM_DEFAULTS,
        deviceId: "e0000000-0000-4000-8000-000000000005",
        apiRoute: "sync",
        cleanIps: "104.20.1.1",
        socketPorts: "443",
        mode: "alpha",
        finalMask: REGRESSION_FIXTURE,
    };

    const yaml = await buildYamlProfile("clash.target.com", null, false, config);
    assert(yaml.includes("fragment:"), "Clash YAML must contain fragment: block");
    assert(yaml.includes('packets: "tlshello"'), 'Clash YAML must contain packets: "tlshello"');
    assert(yaml.includes('length: "101-123"'), 'Clash YAML must contain length: "101-123"');
    assert(yaml.includes('interval: "7-9"'), 'Clash YAML must contain interval: "7-9"');
});

test("FinalMask Part 4 E & Cleartext Invariant - Port 80 / TLS-off nodes MUST NOT receive FinalMask", async () => {
    const config = {
        ...SYSTEM_DEFAULTS,
        deviceId: "f0000000-0000-4000-8000-000000000006",
        apiRoute: "sync",
        cleanIps: "104.21.1.1",
        socketPorts: "80", // Cleartext Port 80
        mode: "alpha",
        echConfigList: [],
        finalMask: REGRESSION_FIXTURE,
    };

    // 1. Raw URI
    const uris = await buildUriProfile("cleartext.domain.com", null, false, config);
    const line = uris.split("\n").find((l) => l.startsWith("vless://"));
    assert(line);
    assert(!line.includes("fragment="), "Port 80 URI must NOT contain fragment=");
    assert(line.includes("security=none"), "Port 80 URI must have security=none");

    const imported = importVlessUri(line);
    assert.equal(imported.finalmask, null, "Imported Port 80 node must have finalmask = null");

    // 2. Xray JSON
    const xrayConfig = await buildVJsonProfile("cleartext.domain.com", null, false, config);
    const vlessOutbound = xrayConfig.outbounds.find((o) => o.protocol === "vless");
    assert(vlessOutbound);
    assert.equal(vlessOutbound.streamSettings.security, "none");
    assert.equal(vlessOutbound.streamSettings.finalmask, undefined, "Port 80 Xray outbound must NOT have finalmask");

    // 3. Clash YAML
    const yaml = await buildYamlProfile("cleartext.domain.com", null, false, config);
    assert(!yaml.includes("fragment:"), "Port 80 Clash YAML must NOT have fragment: block");
});

test("FinalMask Precedence - Per-user override strictly takes precedence over global", async () => {
    const config = {
        ...SYSTEM_DEFAULTS,
        deviceId: "g0000000-0000-4000-8000-000000000007",
        apiRoute: "sync",
        cleanIps: "104.22.1.1",
        socketPorts: "443",
        mode: "alpha",
        echConfigList: [],
        finalMask: {
            packets: "tlshello",
            lengths: ["50-70"],
            delays: ["30-40"],
            maxSplit: 3,
        },
        users: [
            {
                id: "u-9999-8888-7777-6666",
                name: "CustomUser",
                cleanIp: "104.22.1.1",
                finalMask: REGRESSION_FIXTURE, // Overrides global
            }
        ]
    };

    const uris = await buildUriProfile("prec.domain.com", "CustomUser", false, config);
    const line = uris.split("\n").find((l) => l.startsWith("vless://"));
    assert(line);

    const imported = importVlessUri(line);
    assert.equal(imported.finalmask.enabled, true);
    assert.deepEqual(imported.finalmask.lengths, ["101-123"], "User override lengths must be used");
    assert.deepEqual(imported.finalmask.delays, ["7-9"], "User override delays must be used");
    assert.equal(imported.finalmask.maxSplit, 17, "User override maxSplit must be used");
});

test("Task 5 - State 1: ECH OFF + FinalMask OFF -> existing behavior unchanged", async () => {
    const config = {
        ...SYSTEM_DEFAULTS,
        deviceId: "state1-0000-4000-8000-000000000001",
        apiRoute: "sync",
        cleanIps: "www.speedtest.net",
        socketPorts: "443",
        mode: "alpha",
        echConfigList: [],
        finalMask: null,
    };

    const uris = await buildUriProfile("state1.host.com", null, false, config);
    const lines = uris.split("\n").filter((l) => l.startsWith("vless://"));
    assert.equal(lines.length, 2); // 1 clean IP + 1 primary = 2 base configs

    for (const l of lines) {
        assert(!l.includes("&ech="), "State 1 must NOT contain &ech=");
        assert(!l.includes("&fm="), "State 1 must NOT contain &fm=");
        assert(!l.includes("&fragment="), "State 1 must NOT contain &fragment=");
        assert(l.includes("#Luci-"), "Must contain node display name in #hash");
    }
});

test("Task 5 - State 2: ECH ON + FinalMask OFF -> existing ECH behavior unchanged", async () => {
    const config = {
        ...SYSTEM_DEFAULTS,
        deviceId: "state2-0000-4000-8000-000000000002",
        apiRoute: "sync",
        cleanIps: "www.speedtest.net",
        socketPorts: "443",
        mode: "alpha",
        echConfigList: [
            "ech-1.test.com+udp://1.1.1.1",
            "ech-2.test.com+udp://8.8.8.8",
            "ech-3.test.com+udp://9.9.9.9",
        ],
        finalMask: null,
    };

    const uris = await buildUriProfile("state2.host.com", null, false, config);
    const lines = uris.split("\n").filter((l) => l.startsWith("vless://"));
    // 2 base endpoints × 3 ECH = 6 configs
    assert.equal(lines.length, 6);

    for (const l of lines) {
        assert(l.includes("&ech="), "State 2 must contain &ech=");
        assert(!l.includes("&fm="), "State 2 must NOT contain &fm=");
        assert(!l.includes("&fragment="), "State 2 must NOT contain &fragment=");
        assert(l.includes("#Luci-"), "Must contain node display name in #hash");
    }
});

test("Task 5 - State 3: ECH OFF + FinalMask ON -> VLESS URI contains valid fm JSON", async () => {
    const config = {
        ...SYSTEM_DEFAULTS,
        deviceId: "state3-0000-4000-8000-000000000003",
        apiRoute: "sync",
        cleanIps: "www.speedtest.net",
        socketPorts: "443",
        mode: "alpha",
        echConfigList: [],
        finalMask: REGRESSION_FIXTURE,
    };

    const uris = await buildUriProfile("state3.host.com", null, false, config);
    const lines = uris.split("\n").filter((l) => l.startsWith("vless://"));
    assert.equal(lines.length, 2);

    for (const l of lines) {
        assert(!l.includes("&ech="), "State 3 must NOT contain &ech=");
        assert(l.includes("&fm="), "State 3 must contain &fm=");
        assert(l.includes("#Luci-"), "Must contain node display name in #hash");
        assert(!l.includes("#finalMask"), "Must NOT put FinalMask in #hash");

        const imported = importVlessUri(l);
        assert.equal(imported.finalmask.enabled, true);
        assert.equal(imported.finalmask.packets, "tlshello");
        assert.deepEqual(imported.finalmask.lengths, ["101-123"]);
        assert.deepEqual(imported.finalmask.delays, ["7-9"]);
        assert.equal(imported.finalmask.maxSplit, 17);
    }
});

test("Task 5 - State 4: ECH ON + FinalMask ON -> subscription response non-empty, contains both ech & fm, semantic reconstruction", async () => {
    const echEntries = [
        "geedo.com+udp://1.1.1.1",
        "cloudflare-ech.com+udp://1.1.1.1",
        "adster.tech+udp://8.8.8.8",
    ];

    const sysConfig = {
        ...SYSTEM_DEFAULTS,
        masterKey: "master-key-state4",
        deviceId: "state4-0000-4000-8000-000000000004",
        apiRoute: "sync",
        cleanIps: "www.speedtest.net",
        socketPorts: "443",
        proxyIp: "",
        mode: "alpha",
        enableECH: true,
        users: [
            {
                id: "u-state4-user-id-0001",
                name: "f",
                cleanIp: "www.speedtest.net",
                userPorts: "443",
                proxyIp: "",
                echConfigList: echEntries,
                finalMask: REGRESSION_FIXTURE,
            }
        ]
    };

    resetStateStore();
    setCachedConfig(sysConfig);

    const mockEnv = {
        DB: {
            prepare(q) {
                let queriedKey = null;
                return {
                    bind(...args) { queriedKey = args[0]; return this; },
                    async first() { return queriedKey === "sys_config" ? { value: JSON.stringify(sysConfig) } : null; },
                    async all() { return queriedKey === "sys_config" ? { results: [{ key: "sys_config", value: JSON.stringify(sysConfig) }] } : { results: [] }; },
                    async run() { return { success: true }; }
                };
            }
        }
    };

    // Test real subscription endpoint
    const req = new Request("https://state4.host.com/sync?sub=f", {
        headers: { "User-Agent": "v2rayNG/1.8.5" }
    });
    const res = await worker.fetch(req, mockEnv, {});

    // 1. HTTP status 200
    assert.equal(res.status, 200);

    // 2. Response body is non-empty
    const rawBody = await res.text();
    assert.ok(rawBody.length > 0, "Subscription response body must be non-empty");

    // 3. Decoded Base64 body
    const decoded = safeAtob(rawBody.trim());
    const vlessConfigs = decoded.split("\n").filter((l) => l.startsWith("vless://"));

    // 4. Number of generated nodes: 2 base endpoints × 3 ECH entries = 6 configs
    assert.equal(vlessConfigs.length, 6, "Expected exactly 6 configs");

    // 5. Semantic verification of every config
    for (const line of vlessConfigs) {
        assert(line.includes("&ech="), "Each config must contain &ech=");
        assert(line.includes("&fm="), "Each config must contain &fm=");
        assert(!line.includes("#finalMask"), "Hash must NOT contain FinalMask");

        const imported = importVlessUri(line);
        assert.equal(imported.protocol, "vless");
        assert.equal(imported.security, "tls");
        assert.ok(["www.speedtest.net", "state4.host.com"].includes(imported.address));
        assert.ok(echEntries.includes(imported.ech));
        assert.equal(imported.finalmask.enabled, true);
        assert.equal(imported.finalmask.packets, "tlshello");
        assert.deepEqual(imported.finalmask.lengths, ["101-123"]);
        assert.deepEqual(imported.finalmask.delays, ["7-9"]);
        assert.equal(imported.finalmask.maxSplit, 17);
    }
});

test("Task 5 - 2 base endpoints x 3 ECH entries x FinalMask = exactly 6 generated configs with semantic validation", async () => {
    const echEntries = [
        "geedo.com+udp://1.1.1.1",
        "discordapp.com+udp://1.1.1.1",
        "ifconfig.io+udp://1.1.1.1",
    ];

    const config = {
        ...SYSTEM_DEFAULTS,
        deviceId: "d0000000-0000-4000-8000-000000000006",
        apiRoute: "sync",
        cleanIps: "www.speedtest.net", // 1 clean IP + 1 primary = 2 base endpoints
        socketPorts: "443",
        mode: "alpha",
        echConfigList: echEntries,
        finalMask: {
            tcp: [
                {
                    type: "fragment",
                    settings: {
                        packets: "tlshello",
                        lengths: ["101-123"],
                        delays: ["7-9"],
                        maxSplit: "17"
                    }
                }
            ]
        },
    };

    const uris = await buildUriProfile("primary.domain.com", null, false, config);
    const lines = uris.split("\n").filter((l) => l.startsWith("vless://"));

    // Exactly 6 configs
    assert.equal(lines.length, 6, "2 base endpoints × 3 ECH configs must produce exactly 6 VLESS configs");

    // Semantic parsing of all 6 configs
    const parsedNodes = lines.map((l) => importVlessUri(l));

    const ips = parsedNodes.map((n) => n.address);
    assert.equal(ips.filter((ip) => ip === "www.speedtest.net").length, 3);
    assert.equal(ips.filter((ip) => ip === "primary.domain.com").length, 3);

    for (const node of parsedNodes) {
        assert.equal(node.protocol, "vless");
        assert.equal(node.port, 443);
        assert.equal(node.security, "tls");
        assert.ok(echEntries.includes(node.ech), `ECH ${node.ech} must be in configured ECH list`);
        assert.notEqual(node.finalmask, null);
        assert.equal(node.finalmask.enabled, true);
        assert.equal(node.finalmask.packets, "tlshello");
        assert.deepEqual(node.finalmask.lengths, ["101-123"]);
        assert.deepEqual(node.finalmask.delays, ["7-9"]);
        assert.equal(node.finalmask.maxSplit, 17);
        assert.ok(node.name.startsWith("Luci-"));
    }
});
