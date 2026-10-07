import test from "node:test";
import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";

import { SYSTEM_DEFAULTS } from "../src/config.js";
import { validateAlpn, resolveAlpn } from "../src/subscriptions/policy.js";
import { getResolvedEndpointPopulation } from "../src/subscriptions/population.js";
import { buildUriProfile } from "../src/subscriptions/uri.js";
import { buildVJsonProfile } from "../src/subscriptions/v2ray.js";
import { buildSingBoxJsonProfile } from "../src/subscriptions/singbox.js";
import { buildYamlProfile } from "../src/subscriptions/clash.js";

test("ALPN - RFC 7301 Token Validation", () => {
    // Valid tokens
    assert.deepEqual(validateAlpn("http/1.1"), ["http/1.1"]);
    assert.deepEqual(validateAlpn("h2"), ["h2"]);
    assert.deepEqual(validateAlpn("h2, http/1.1"), ["h2", "http/1.1"]);
    assert.deepEqual(validateAlpn(["h2", "http/1.1"]), ["h2", "http/1.1"]);
    assert.deepEqual(validateAlpn(""), null);
    assert.deepEqual(validateAlpn(null), null);
    assert.deepEqual(validateAlpn(undefined), null);

    // Invalid tokens (spaces inside token, special invalid characters)
    assert.throws(() => validateAlpn("invalid token"));
    assert.throws(() => validateAlpn("bad@token"));
    assert.throws(() => validateAlpn("token with spaces"));
});

test("ALPN - Policy Precedence Hierarchy", () => {
    const sysConfig = { alpn: "http/1.1" };
    const profile = { alpn: "h2" };

    // 1. Runtime override takes highest priority
    const r1 = resolveAlpn(sysConfig, profile, "h3");
    assert.deepEqual(r1, ["h3"]);

    // 2. Profile override takes priority over system default
    const r2 = resolveAlpn(sysConfig, profile, null);
    assert.deepEqual(r2, ["h2"]);

    // 3. System default applies when profile is unset
    const r3 = resolveAlpn(sysConfig, {}, null);
    assert.deepEqual(r3, ["http/1.1"]);

    // 4. Default is null when unset everywhere
    const r4 = resolveAlpn({}, {}, null);
    assert.equal(r4, null);
});

test("Population Parity - Exact 1:1 node count across URI, Xray, Sing-box, and Clash", async () => {
    const host = "parity.example.com";
    const cfg = {
        ...SYSTEM_DEFAULTS,
        deviceId: "00000000-0000-0000-0000-000000000001",
        apiRoute: "sync",
        cleanIp: "104.16.1.1, 104.16.1.2",
        socketPorts: "443",
        mode: "alpha"
    };

    // Canonical Population
    const pop = getResolvedEndpointPopulation(host, null, false, cfg);
    assert.ok(pop.length > 0, "Population must be non-empty");

    // 1. Plaintext URI count
    const rawUris = await buildUriProfile(host, null, false, cfg);
    const uriLines = rawUris.trim().split("\n").filter(Boolean);
    const realUris = uriLines.filter(u => u.startsWith("vless://") || (u.startsWith("trojan://") && !u.includes("127.0.0.1:1080")));
    assert.equal(realUris.length, pop.length, "URI renderer proxy count must match canonical population");

    // 2. Xray JSON outbounds count
    const vjson = await buildVJsonProfile(host, null, false, cfg);
    const xrayProxies = vjson.outbounds.filter(o => o.protocol === "vless" || o.protocol === "trojan");
    assert.equal(xrayProxies.length, pop.length, "Xray JSON renderer proxy count must match canonical population");

    // 3. Sing-box JSON outbounds count
    const sb = await buildSingBoxJsonProfile(host, null, false, cfg);
    const sbProxies = sb.outbounds.filter(o => (o.type === "vless" || o.type === "trojan") && o.tag !== "mixed-in" && o.server !== "127.0.0.1");
    assert.equal(sbProxies.length, pop.length, "Sing-box renderer proxy count must match canonical population");

    // Verify Sing-box auto group contains only real proxies
    const sbAuto = sb.outbounds.find(o => o.tag === "auto");
    assert.ok(sbAuto, "Sing-box auto group must exist");
    assert.equal(sbAuto.outbounds.length, pop.length, "Sing-box auto group must contain only real proxies (no fake nodes)");

    // 4. Clash YAML proxies count
    const yaml = await buildYamlProfile(host, null, false, cfg);
    const parts = yaml.split("proxy-groups:");
    const proxiesPart = parts[0].split("proxies:")[1];
    const yamlProxyLines = proxiesPart.split("\n").filter(l => l.startsWith("  - name: "));
    const yamlReal = yamlProxyLines.filter(l => !l.includes("Used") && !l.includes("Expiry"));
    assert.equal(yamlReal.length, pop.length, "Clash YAML renderer proxy count must match canonical population");

    // Verify Clash AUTO group contains only real proxies
    const autoSection = yaml.split('name: "AUTO"')[1].split('name: "FALLBACK"')[0];
    const autoProxies = autoSection.split("\n").filter(l => l.startsWith("      - "));
    assert.equal(autoProxies.length, pop.length, "Clash AUTO group must contain only real proxies");
});

test("ALPN Serialization - Correct formatting across all 4 subscription renderers", async () => {
    const host = "alpn.example.com";
    const cfg = {
        ...SYSTEM_DEFAULTS,
        deviceId: "00000000-0000-0000-0000-000000000002",
        apiRoute: "sync",
        alpn: "http/1.1",
        cleanIp: "104.16.1.1",
        socketPorts: "443",
        mode: "both",
        users: [{ id: "00000000-0000-0000-0000-000000000002", name: "AlpnUser", maxConfigs: 2 }]
    };

    // 1. URI renderer contains &alpn=
    const uris = await buildUriProfile(host, null, false, cfg);
    assert.ok(uris.includes("&alpn=http%2F1.1") || uris.includes("&alpn=http/1.1"), "URI must serialize alpn query param");

    // 2. Xray JSON contains streamSettings.tlsSettings.alpn
    const vjson = await buildVJsonProfile(host, null, false, cfg);
    const vlessOutbound = vjson.outbounds.find(o => o.protocol === "vless");
    assert.ok(vlessOutbound, "VLESS outbound must exist");
    assert.deepEqual(vlessOutbound.streamSettings.tlsSettings.alpn, ["http/1.1"]);

    // 3. Sing-box JSON contains tls.alpn
    const sb = await buildSingBoxJsonProfile(host, null, false, cfg);
    const sbVless = sb.outbounds.find(o => o.type === "vless");
    assert.ok(sbVless, "Sing-box VLESS outbound must exist");
    assert.deepEqual(sbVless.tls.alpn, ["http/1.1"]);

    // 4. Clash YAML contains alpn: - http/1.1
    const yaml = await buildYamlProfile(host, null, false, cfg);
    assert.ok(yaml.includes("alpn:\n      - http/1.1"), "Clash YAML must serialize alpn list");
});

test("Native Binary Validation - All generated profiles parse cleanly in native client cores", async () => {
    const host = "cores.example.com";
    const cfg = {
        ...SYSTEM_DEFAULTS,
        deviceId: "00000000-0000-0000-0000-000000000003",
        apiRoute: "sync",
        alpn: "http/1.1",
        cleanIp: "104.16.1.1, 104.16.1.2",
        socketPorts: "443",
        mode: "both"
    };

    const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), "luciproxy_cores_test_"));

    try {
        // Sing-box
        const singboxExe = "L:\\v2rayN-windows-64\\v2rayN-windows-64\\bin\\sing_box\\sing-box.exe";
        if (fs.existsSync(singboxExe)) {
            const sbJson = await buildSingBoxJsonProfile(host, null, false, cfg);
            const sbPath = path.join(tempDir, "singbox.json");
            fs.writeFileSync(sbPath, JSON.stringify(sbJson, null, 2));
            execFileSync(singboxExe, ["check", "-c", sbPath], { encoding: "utf8", timeout: 10000 });
        }

        // Mihomo
        const mihomoExe = "L:\\v2rayN-windows-64\\v2rayN-windows-64\\bin\\mihomo\\mihomo.exe";
        if (fs.existsSync(mihomoExe)) {
            const yaml = await buildYamlProfile(host, null, false, cfg);
            const yamlPath = path.join(tempDir, "clash.yaml");
            fs.writeFileSync(yamlPath, yaml);
            execFileSync(mihomoExe, ["-t", "-f", yamlPath], { encoding: "utf8", timeout: 10000 });
        }

        // Xray
        const xrayExe = "L:\\v2rayN-windows-64\\v2rayN-windows-64\\bin\\xray\\xray.exe";
        if (fs.existsSync(xrayExe)) {
            const vjson = await buildVJsonProfile(host, null, false, cfg);
            const xrayPath = path.join(tempDir, "xray.json");
            fs.writeFileSync(xrayPath, JSON.stringify(vjson, null, 2));
            execFileSync(xrayExe, ["-test", "-c", xrayPath], { encoding: "utf8", timeout: 10000 });
        }
    } finally {
        fs.rmSync(tempDir, { recursive: true, force: true });
    }
});

test("ALPN - Trojan Unset ALPN must NOT force h2 across all 4 formats", async () => {
    const host = "trojan-unset.example.com";
    const cfg = {
        ...SYSTEM_DEFAULTS,
        deviceId: "00000000-0000-0000-0000-000000000010",
        apiRoute: "sync",
        cleanIp: "104.16.1.1",
        socketPorts: "443",
        mode: "beta", // Trojan only
        alpn: "" // Unset ALPN
    };

    // 1. Canonical Population
    const pop = getResolvedEndpointPopulation(host, null, false, cfg);
    assert.ok(pop.length > 0);
    assert.equal(pop[0].type, "trojan");
    assert.equal(pop[0].alpn, null, "Canonical population MUST have null ALPN when unset");

    // 2. URI profile MUST NOT contain alpn=h2 or &alpn=
    const uris = await buildUriProfile(host, null, false, cfg);
    assert.ok(!uris.includes("&alpn="), "Trojan URI must NOT contain &alpn= query param when unset");
    assert.ok(!uris.includes("h2"), "Trojan URI must NOT force h2 when unset");

    // 3. Xray JSON MUST NOT contain tlsSettings.alpn
    const vjson = await buildVJsonProfile(host, null, false, cfg);
    const trojanOutbound = vjson.outbounds.find(o => o.protocol === "trojan");
    assert.ok(trojanOutbound, "Trojan outbound must exist");
    assert.equal(trojanOutbound.streamSettings.tlsSettings.alpn, undefined, "Xray tlsSettings.alpn must be undefined when unset");

    // 4. Sing-box JSON MUST NOT contain tls.alpn
    const sb = await buildSingBoxJsonProfile(host, null, false, cfg);
    const sbTrojan = sb.outbounds.find(o => o.type === "trojan");
    assert.ok(sbTrojan, "Sing-box Trojan outbound must exist");
    assert.equal(sbTrojan.tls.alpn, undefined, "Sing-box tls.alpn must be undefined when unset");

    // 5. Clash YAML MUST NOT contain alpn list
    const yaml = await buildYamlProfile(host, null, false, cfg);
    const parts = yaml.split("proxy-groups:");
    const trojanSection = parts[0].split('type: trojan')[1] || "";
    assert.ok(!trojanSection.includes("alpn:"), "Clash YAML Trojan block must NOT contain alpn: when unset");
});

test("ALPN - Explicit ALPN preserved identically for Trojan and VLESS", async () => {
    const host = "alpn-explicit.example.com";
    const cfg = {
        ...SYSTEM_DEFAULTS,
        deviceId: "00000000-0000-0000-0000-000000000011",
        apiRoute: "sync",
        cleanIp: "104.16.1.1",
        socketPorts: "443",
        mode: "both",
        alpn: "http/1.1"
    };

    const pop = getResolvedEndpointPopulation(host, null, false, cfg);
    const vlessPop = pop.find(p => p.protocol === "alpha");
    const trojanPop = pop.find(p => p.protocol === "beta");
    assert.deepEqual(vlessPop.alpn, ["http/1.1"]);
    assert.deepEqual(trojanPop.alpn, ["http/1.1"]);

    // URI
    const uris = await buildUriProfile(host, null, false, cfg);
    const uriLines = uris.split("\n").filter(l => l.startsWith("vless://") || (l.startsWith("trojan://") && !l.includes("127.0.0.1")));
    for (const line of uriLines) {
        assert.ok(line.includes("&alpn=http%2F1.1") || line.includes("&alpn=http/1.1"), "Each real URI must serialize explicit ALPN");
    }

    // Xray
    const vjson = await buildVJsonProfile(host, null, false, cfg);
    const xVless = vjson.outbounds.find(o => o.protocol === "vless");
    const xTrojan = vjson.outbounds.find(o => o.protocol === "trojan");
    assert.deepEqual(xVless.streamSettings.tlsSettings.alpn, ["http/1.1"]);
    assert.deepEqual(xTrojan.streamSettings.tlsSettings.alpn, ["http/1.1"]);

    // Sing-box
    const sb = await buildSingBoxJsonProfile(host, null, false, cfg);
    const sbVless = sb.outbounds.find(o => o.type === "vless");
    const sbTrojan = sb.outbounds.find(o => o.type === "trojan");
    assert.deepEqual(sbVless.tls.alpn, ["http/1.1"]);
    assert.deepEqual(sbTrojan.tls.alpn, ["http/1.1"]);
});

test("Cloudflare Egress Protection - isCloudflareIp correctly identifies Cloudflare CDN ranges", async () => {
    const { isCloudflareIp } = await import("../src/utils/helpers.js");

    // Cloudflare IPv4 ranges
    assert.equal(isCloudflareIp("104.19.24.25"), true);
    assert.equal(isCloudflareIp("104.16.1.1"), true);
    assert.equal(isCloudflareIp("172.64.0.1"), true);
    assert.equal(isCloudflareIp("1.1.1.1"), true);
    assert.equal(isCloudflareIp("1.0.0.1"), true);
    assert.equal(isCloudflareIp("162.159.192.1"), true);
    assert.equal(isCloudflareIp("198.41.128.1"), true);

    // Cloudflare IPv6
    assert.equal(isCloudflareIp("2606:4700:4700::1111"), true);
    assert.equal(isCloudflareIp("2400:cb00::1"), true);

    // Non-Cloudflare IPs and domains
    assert.equal(isCloudflareIp("8.8.8.8"), false);
    assert.equal(isCloudflareIp("8.8.4.4"), false);
    assert.equal(isCloudflareIp("88.198.149.98"), false);
    assert.equal(isCloudflareIp("185.233.81.207"), false);
    assert.equal(isCloudflareIp("relay.example.com"), false);
    assert.equal(isCloudflareIp("chatgpt.com"), false);
});

test("Cloudflare Egress Protection - getEffectiveOutboundRelays filters Cloudflare IPs", async () => {
    const { getEffectiveOutboundRelays } = await import("../src/users/manager.js");

    // Profile with Cloudflare IP as proxyIp must be filtered out; returns empty array when no backup relay configured
    const profileWithCfIp = { proxyIp: "104.19.24.25" };
    const relays1 = getEffectiveOutboundRelays(profileWithCfIp, {});
    assert.deepEqual(relays1, [], "Cloudflare IP must be filtered and return empty when no operator relay configured");

    // Profile with Cloudflare IP but operator configured backupRelay falls back to operator backupRelay
    const relaysWithConfigured = getEffectiveOutboundRelays(profileWithCfIp, { backupRelay: "relay.example.com" });
    assert.deepEqual(relaysWithConfigured, ["relay.example.com"], "Cloudflare IP must filter out and preserve operator-configured relay");

    // Profile with valid non-Cloudflare IP must be preserved
    const profileWithNonCf = { proxyIp: "88.198.149.98" };
    const relays2 = getEffectiveOutboundRelays(profileWithNonCf, {});
    assert.deepEqual(relays2, ["88.198.149.98"]);

    // Profile with mixed IPs must filter only Cloudflare IPs
    const profileWithMixed = { proxyIp: "104.19.24.25, 88.198.149.98, 172.64.0.1" };
    const relays3 = getEffectiveOutboundRelays(profileWithMixed, {});
    assert.deepEqual(relays3, ["88.198.149.98"]);
});

test("Outbound Fallback - connectFallbackSocket connects to operator-configured non-Cloudflare relay and replays payload", async () => {
    const { connectFallbackSocket } = await import("../src/protocols/proxy.js");

    const connectedHosts = [];
    const mockConnector = ({ hostname, port }) => {
        connectedHosts.push({ hostname, port });
        const encoder = new TextEncoder();
        const writtenChunks = [];

        return {
            opened: Promise.resolve(),
            writable: {
                getWriter: () => ({
                    write: async (chunk) => { writtenChunks.push(chunk); },
                    releaseLock: () => {}
                })
            },
            readable: {
                getReader: () => ({
                    read: async () => ({ value: encoder.encode("HTTP/1.1 200 OK\r\n\r\n"), done: false }),
                    releaseLock: () => {}
                })
            },
            close: () => Promise.resolve()
        };
    };

    const sysConfig = {
        backupRelay: "relay.example.com"
    };

    const sock = await connectFallbackSocket(mockConnector, "chatgpt.com", 443, {}, sysConfig, "client1");
    assert.ok(sock, "Fallback socket must successfully connect");
    assert.equal(connectedHosts.length, 1);
    assert.equal(connectedHosts[0].hostname, "relay.example.com");
    assert.equal(connectedHosts[0].port, 443);
});

test("Outbound Fallback - connectFallbackSocket falls back to NAT64 IPv6 gateway when no relay configured", async () => {
    const { connectFallbackSocket } = await import("../src/protocols/proxy.js");

    const connectedHosts = [];
    const mockConnector = ({ hostname, port }) => {
        connectedHosts.push({ hostname, port });
        const encoder = new TextEncoder();
        return {
            opened: Promise.resolve(),
            writable: {
                getWriter: () => ({
                    write: async () => {},
                    releaseLock: () => {}
                })
            },
            readable: {
                getReader: () => ({
                    read: async () => ({ value: encoder.encode("HTTP/1.1 200 OK\r\n\r\n"), done: false }),
                    releaseLock: () => {}
                })
            },
            close: () => Promise.resolve()
        };
    };

    // When destination is IPv4 and no custom relay is configured, falls back to NAT64 prefix
    const sock = await connectFallbackSocket(mockConnector, "198.51.100.1", 443, {}, {}, "client1");
    assert.ok(sock, "Fallback socket must connect via NAT64 prefix");
    assert.equal(connectedHosts.length, 1);
    assert.ok(connectedHosts[0].hostname.includes("2a02:898:146:64::"));
    assert.equal(connectedHosts[0].port, 443);
});

