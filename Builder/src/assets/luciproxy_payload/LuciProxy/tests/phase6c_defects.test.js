/**
 * Phase 6C Defect Tests
 *
 * Validates the three confirmed P2 defect fixes:
 * 1. Clash/Mihomo bracketed IPv6 serialization (formatClashServer & YAML scalar)
 * 2. Xray deprecated WebSocket Host syntax (wsSettings.host instead of headers.Host)
 * 3. Xray multi-endpoint failover & observatory (balancers and observatory when >1 outbound)
 */

import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import os from "node:os";
import { execFileSync } from "node:child_process";

import { formatClashServer, buildYamlProfile } from "../src/subscriptions/clash.js";
import { buildVJsonProfile } from "../src/subscriptions/v2ray.js";

const MIHOMO_BIN = "L:\\v2rayN-windows-64\\v2rayN-windows-64\\bin\\mihomo\\mihomo.exe";
const XRAY_BIN = "L:\\v2rayN-windows-64\\v2rayN-windows-64\\bin\\xray\\xray.exe";

test("Phase 6C - Defect 1: formatClashServer correctly handles IPv6, IPv4, and domains", () => {
    // Bracketed IPv6 -> quoted scalar without brackets
    assert.equal(formatClashServer("[2606:4700::1]"), '"2606:4700::1"');
    assert.equal(formatClashServer("[2606:4700:4700::1111]"), '"2606:4700:4700::1111"');

    // Unbracketed IPv6 -> quoted scalar without brackets
    assert.equal(formatClashServer("2606:4700::1"), '"2606:4700::1"');
    assert.equal(formatClashServer("::1"), '"::1"');

    // IPv4 addresses -> unchanged literal
    assert.equal(formatClashServer("104.16.1.1"), "104.16.1.1");
    assert.equal(formatClashServer("127.0.0.1"), "127.0.0.1");

    // Domain names -> unchanged literal
    assert.equal(formatClashServer("speed.cloudflare.com"), "speed.cloudflare.com");
    assert.equal(formatClashServer("test.example.org"), "test.example.org");

    // Empty / null
    assert.equal(formatClashServer(""), "");
    assert.equal(formatClashServer(null), "");
});

test("Phase 6C - Defect 1: Clash YAML profile with IPv6 parses cleanly in Mihomo", async () => {
    const sysConfig = {
        deviceId: "phase6c-uuid-1",
        apiRoute: "test-route",
        socketPorts: "443",
        mode: "alpha",
        users: [
            {
                name: "UserIPv6",
                id: "11111111-1111-4111-8111-111111111111",
                cleanIp: "[2606:4700::1],104.16.1.1",
                userMode: "alpha",
                userPorts: "443"
            }
        ]
    };

    const yaml = await buildYamlProfile("worker.example.com", "UserIPv6", false, sysConfig);

    // Assert YAML does NOT contain bracketed array syntax for server
    assert.ok(!yaml.includes("server: [2606:4700::1]"), "Clash YAML must not contain server: [2606:4700::1]");
    // Assert YAML contains quoted string scalar for IPv6
    assert.ok(yaml.includes('server: "2606:4700::1"'), 'Clash YAML must contain server: "2606:4700::1"');
    // Assert IPv4 remains normal scalar
    assert.ok(yaml.includes("server: 104.16.1.1"), "Clash YAML must contain server: 104.16.1.1");

    // Live validation against Mihomo binary if present
    if (fs.existsSync(MIHOMO_BIN)) {
        const tmpFile = path.join(os.tmpdir(), `clash_test_${Date.now()}.yaml`);
        try {
            fs.writeFileSync(tmpFile, yaml, "utf-8");
            const res = execFileSync(MIHOMO_BIN, ["-t", "-f", tmpFile], { encoding: "utf-8" });
            assert.ok(res.includes("test is successful"), `Mihomo test should succeed: ${res}`);
        } finally {
            if (fs.existsSync(tmpFile)) fs.unlinkSync(tmpFile);
        }
    }
});

test("Phase 6C - Defect 2: Xray WebSocket transport uses host instead of deprecated headers.Host", async () => {
    const sysConfig = {
        deviceId: "phase6c-uuid-2",
        apiRoute: "test-ws-route",
        socketPorts: "443",
        mode: "both",
        users: [
            {
                name: "UserWs",
                id: "22222222-2222-4222-8222-222222222222",
                cleanIp: "104.16.1.1",
                userMode: "both",
                userPorts: "443"
            }
        ]
    };

    const xrayConfig = await buildVJsonProfile("ws-worker.example.com", "UserWs", false, sysConfig);

    // Verify all proxy outbounds
    const proxyOutbounds = xrayConfig.outbounds.filter(o => o.protocol === "vless" || o.protocol === "trojan");
    assert.ok(proxyOutbounds.length >= 2, "Expected at least 2 proxy outbounds (VLESS and Trojan)");

    for (const outbound of proxyOutbounds) {
        const wsSettings = outbound.streamSettings.wsSettings;
        assert.ok(wsSettings, `Outbound ${outbound.tag} must have wsSettings`);
        assert.equal(wsSettings.host, "ws-worker.example.com", `wsSettings.host must equal serverName`);
        assert.equal(wsSettings.headers, undefined, `wsSettings.headers must be undefined`);
    }

    // Verify raw JSON string does not contain 'headers": { "Host"'
    const jsonStr = JSON.stringify(xrayConfig);
    assert.ok(!jsonStr.includes('"headers":{"Host"'), "JSON must not contain deprecated ws headers.Host");
});

test("Phase 6C - Defect 3: Xray single-endpoint profile preserves direct outboundTag without balancers", async () => {
    const sysConfig = {
        deviceId: "phase6c-uuid-single",
        apiRoute: "single-route",
        socketPorts: "443",
        mode: "alpha",
        users: [
            {
                name: "SingleEndpointUser",
                id: "33333333-3333-4333-8333-333333333333",
                cleanIp: "104.16.1.1",
                userMode: "alpha",
                userPorts: "443",
                maxConfigs: 1
            }
        ]
    };

    const xrayConfig = await buildVJsonProfile("single.example.com", "SingleEndpointUser", false, sysConfig);

    const proxyOutbounds = xrayConfig.outbounds.filter(o => o.protocol === "vless" || o.protocol === "trojan");
    assert.equal(proxyOutbounds.length, 1, "Expected exactly 1 proxy outbound");
    const singleTag = proxyOutbounds[0].tag;

    // Balancers and observatory must be undefined
    assert.equal(xrayConfig.routing.balancers, undefined, "routing.balancers must be undefined for single endpoint");
    assert.equal(xrayConfig.observatory, undefined, "observatory must be undefined for single endpoint");

    // Routing rules must direct remote-dns and tcp to singleTag
    const remoteDnsRule = xrayConfig.routing.rules.find(r => r.inboundTag && r.inboundTag.includes("remote-dns"));
    assert.ok(remoteDnsRule, "remote-dns rule must exist");
    assert.equal(remoteDnsRule.outboundTag, singleTag, "remote-dns outboundTag must match single outbound");
    assert.equal(remoteDnsRule.balancerTag, undefined, "balancerTag must be undefined for single endpoint");

    const tcpRule = xrayConfig.routing.rules.find(r => r.network === "tcp");
    assert.ok(tcpRule, "tcp fallback rule must exist");
    assert.equal(tcpRule.outboundTag, singleTag, "tcp fallback outboundTag must match single outbound");
    assert.equal(tcpRule.balancerTag, undefined, "balancerTag must be undefined for single endpoint");

    // Live validation against Xray binary
    if (fs.existsSync(XRAY_BIN)) {
        const tmpFile = path.join(os.tmpdir(), `xray_single_${Date.now()}.json`);
        try {
            fs.writeFileSync(tmpFile, JSON.stringify(xrayConfig, null, 2), "utf-8");
            const res = execFileSync(XRAY_BIN, ["-test", "-c", tmpFile], {
                encoding: "utf-8",
                env: { ...process.env, XRAY_LOCATION_ASSET: "L:\\v2rayN-windows-64\\v2rayN-windows-64\\bin" }
            });
            assert.ok(res.includes("Configuration OK"), `Xray test should succeed: ${res}`);
        } finally {
            if (fs.existsSync(tmpFile)) fs.unlinkSync(tmpFile);
        }
    }
});

test("Phase 6C - Defect 3: Xray multi-endpoint profile generates balancers and observatory", async () => {
    const sysConfig = {
        deviceId: "phase6c-uuid-multi",
        apiRoute: "multi-route",
        socketPorts: "443,8443",
        mode: "both",
        users: [
            {
                name: "MultiEndpointUser",
                id: "44444444-4444-4444-8444-444444444444",
                cleanIp: "104.16.1.1,104.16.1.2",
                userMode: "both",
                userPorts: "443,8443"
            }
        ]
    };

    const xrayConfig = await buildVJsonProfile("multi.example.com", "MultiEndpointUser", false, sysConfig);

    const proxyOutbounds = xrayConfig.outbounds.filter(o => o.protocol === "vless" || o.protocol === "trojan");
    assert.ok(proxyOutbounds.length > 1, `Expected multiple proxy outbounds, got ${proxyOutbounds.length}`);
    const proxyTags = proxyOutbounds.map(o => o.tag);

    // Balancers must be present
    assert.ok(Array.isArray(xrayConfig.routing.balancers), "routing.balancers must be an array");
    assert.equal(xrayConfig.routing.balancers.length, 1);
    const balancer = xrayConfig.routing.balancers[0];
    assert.equal(balancer.tag, "proxy-balancer");
    assert.deepEqual(balancer.selector, proxyTags);
    assert.equal(balancer.strategy.type, "leastPing");
    assert.equal(balancer.fallbackTag, proxyTags[0]);

    // Observatory must be present at top level
    assert.ok(xrayConfig.observatory, "observatory must be present at top-level");
    assert.deepEqual(xrayConfig.observatory.subjectSelector, proxyTags);
    assert.equal(xrayConfig.observatory.probeUrl, "https://www.gstatic.com/generate_204");
    assert.equal(xrayConfig.observatory.probeInterval, "30s");
    assert.equal(xrayConfig.observatory.enableConcurrency, true);

    // Routing rules must direct remote-dns and tcp to balancerTag
    const remoteDnsRule = xrayConfig.routing.rules.find(r => r.inboundTag && r.inboundTag.includes("remote-dns"));
    assert.ok(remoteDnsRule, "remote-dns rule must exist");
    assert.equal(remoteDnsRule.balancerTag, "proxy-balancer", "remote-dns rule must route to proxy-balancer");
    assert.equal(remoteDnsRule.outboundTag, undefined, "outboundTag must be undefined when balancerTag is used");

    const tcpRule = xrayConfig.routing.rules.find(r => r.network === "tcp");
    assert.ok(tcpRule, "tcp fallback rule must exist");
    assert.equal(tcpRule.balancerTag, "proxy-balancer", "tcp fallback rule must route to proxy-balancer");
    assert.equal(tcpRule.outboundTag, undefined, "outboundTag must be undefined when balancerTag is used");

    // Live validation against Xray binary
    if (fs.existsSync(XRAY_BIN)) {
        const tmpFile = path.join(os.tmpdir(), `xray_multi_${Date.now()}.json`);
        try {
            fs.writeFileSync(tmpFile, JSON.stringify(xrayConfig, null, 2), "utf-8");
            const res = execFileSync(XRAY_BIN, ["-test", "-c", tmpFile], {
                encoding: "utf-8",
                env: { ...process.env, XRAY_LOCATION_ASSET: "L:\\v2rayN-windows-64\\v2rayN-windows-64\\bin" }
            });
            assert.ok(res.includes("Configuration OK"), `Xray test should succeed: ${res}`);
        } finally {
            if (fs.existsSync(tmpFile)) fs.unlinkSync(tmpFile);
        }
    }
});
