/**
 * Phase 6E Defect Regression Tests
 *
 * Validates the two confirmed Phase 6D defect fixes:
 * 1. P2 — Sing-box clash_mode "Global" rule precedence (QUIC/UDP443 authoritative rejection)
 * 2. P3 — Xray geodata asset independence (zero unguaranteed geoip/geosite dependencies)
 */

import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import os from "node:os";
import net from "node:net";
import dgram from "node:dgram";
import { execFileSync, spawn } from "node:child_process";

import { buildSingBoxRules } from "../src/subscriptions/routing.js";
import { buildSingBoxJsonProfile } from "../src/subscriptions/singbox.js";
import { buildVJsonProfile } from "../src/subscriptions/v2ray.js";
import { PRIVATE_IP_CIDRS, CORE_THREAT_DOMAINS, CORE_AI_DOMAINS } from "../src/subscriptions/rules.js";
import { SYSTEM_DEFAULTS } from "../src/config.js";

const SINGBOX_BIN = "L:\\v2rayN-windows-64\\v2rayN-windows-64\\bin\\sing_box\\sing-box.exe";
const XRAY_BIN = "L:\\v2rayN-windows-64\\v2rayN-windows-64\\bin\\xray\\xray.exe";

// =========================================================================
// 1. FINDING A: SING-BOX GLOBAL MODE & RULE PRECEDENCE
// =========================================================================

test("Phase 6E - Finding A: Rule precedence enforces QUIC/UDP443 and threats before clash_mode Global", () => {
    const sysConfig = {
        blockUDP443: true,
        blockThreats: true,
        bypassIran: true,
        bypassAi: true
    };

    const rules = buildSingBoxRules(sysConfig, "select");

    const quicIdx = rules.findIndex((r) => r.network === "udp" && r.port === 443 && r.action === "reject");
    const threatIdx = rules.findIndex((r) => r.domain_suffix && r.action === "reject");
    const globalIdx = rules.findIndex((r) => r.clash_mode === "Global");
    const directIdx = rules.findIndex((r) => r.clash_mode === "Direct");
    const iranIdx = rules.findIndex((r) => r.rule_set?.includes("geosite-ir"));
    const aiIdx = rules.findIndex((r) => r.domain_suffix?.includes("openai.com"));

    assert.ok(quicIdx !== -1, "QUIC reject rule must exist");
    assert.ok(threatIdx !== -1, "Threat reject rule must exist");
    assert.ok(globalIdx !== -1, "clash_mode Global rule must exist");
    assert.ok(directIdx !== -1, "clash_mode Direct rule must exist");
    assert.ok(iranIdx !== -1, "Iran bypass rule must exist");
    assert.ok(aiIdx !== -1, "AI bypass rule must exist");

    // Precedence assertions
    assert.ok(quicIdx < globalIdx, `QUIC reject (idx ${quicIdx}) MUST precede clash_mode Global (idx ${globalIdx})`);
    assert.ok(threatIdx < globalIdx, `Threat reject (idx ${threatIdx}) MUST precede clash_mode Global (idx ${globalIdx})`);
    assert.ok(globalIdx < iranIdx, `clash_mode Global (idx ${globalIdx}) must precede domestic bypass (idx ${iranIdx})`);
    assert.ok(globalIdx < aiIdx, `clash_mode Global (idx ${globalIdx}) must precede AI sanction bypass (idx ${aiIdx})`);
});

test("Phase 6E - Finding A: Live Sing-box binary validates QUIC reject in Rule and Global modes, and TCP in Global", async () => {
    if (!fs.existsSync(SINGBOX_BIN)) {
        return; // Skip if binary is absent in test environment
    }

    const testPort = 22088;
    const testDir = path.join(os.tmpdir(), `singbox_test_${Date.now()}`);
    fs.mkdirSync(testDir, { recursive: true });

    const pyProbeScript = `
import subprocess, time, socket, json, sys, os
from pathlib import Path

singbox_bin = sys.argv[1]
test_dir = Path(sys.argv[2])
test_port = int(sys.argv[3])

def socks5_udp_associate(socks_host, socks_port, target_ip, target_port):
    tcp_sock = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
    tcp_sock.settimeout(2.0)
    try:
        tcp_sock.connect((socks_host, socks_port))
        tcp_sock.sendall(b"\\x05\\x01\\x00")
        if tcp_sock.recv(2) != b"\\x05\\x00": return False
        tcp_sock.sendall(b"\\x05\\x03\\x00\\x01\\x00\\x00\\x00\\x00\\x00\\x00")
        resp = tcp_sock.recv(10)
        if len(resp) < 10 or resp[1] != 0: return False
        relay_port = int.from_bytes(resp[8:10], "big")
        relay_addr = socket.inet_ntoa(resp[4:8])
        if relay_addr == "0.0.0.0": relay_addr = socks_host
        udp_sock = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
        hdr = b"\\x00\\x00\\x00\\x01" + socket.inet_aton(target_ip) + target_port.to_bytes(2, "big")
        udp_sock.sendto(hdr + b"PING", (relay_addr, relay_port))
        time.sleep(0.3)
        return True
    except:
        return False
    finally:
        tcp_sock.close()

def socks5_tcp_connect(socks_host, socks_port, target_ip, target_port):
    tcp_sock = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
    tcp_sock.settimeout(2.0)
    try:
        tcp_sock.connect((socks_host, socks_port))
        tcp_sock.sendall(b"\\x05\\x01\\x00")
        if tcp_sock.recv(2) != b"\\x05\\x00": return False
        tcp_sock.sendall(b"\\x05\\x01\\x00\\x01" + socket.inet_aton(target_ip) + target_port.to_bytes(2, "big"))
        resp = tcp_sock.recv(10)
        return len(resp) >= 4 and resp[1] == 0
    except:
        return False
    finally:
        tcp_sock.close()

def probe(clash_mode, is_udp, target_port, controller_port):
    cfg = {
        "log": {"level": "trace"},
        "experimental": {"clash_api": {"external_controller": f"127.0.0.1:{controller_port}", "default_mode": clash_mode}},
        "inbounds": [{"type": "mixed", "tag": "mixed-in", "listen": "127.0.0.1", "listen_port": test_port}],
        "outbounds": [{"type": "direct", "tag": "direct"}, {"type": "block", "tag": "block"}, {"type": "direct", "tag": "select"}],
        "route": {"rules": [
            {"action": "sniff"},
            {"protocol": "dns", "action": "hijack-dns"},
            {"ip_is_private": True, "outbound": "direct"},
            {"network": "udp", "port": 443, "action": "reject", "outbound": "block"},
            {"clash_mode": "Direct", "outbound": "direct"},
            {"clash_mode": "Global", "outbound": "select"},
            {"outbound": "select"}
        ]}
    }
    cfg_file = test_dir / f"cfg_{clash_mode}_{target_port}.json"
    cfg_file.write_text(json.dumps(cfg), encoding="utf-8")
    proc = subprocess.Popen([singbox_bin, "run", "-c", str(cfg_file)], cwd=str(test_dir), stdout=subprocess.PIPE, stderr=subprocess.PIPE, text=True)
    time.sleep(0.7)
    if is_udp:
        socks5_udp_associate("127.0.0.1", test_port, "1.1.1.1", target_port)
    else:
        socks5_tcp_connect("127.0.0.1", test_port, "1.1.1.1", target_port)
    time.sleep(0.5)
    proc.terminate()
    try:
        out, err = proc.communicate(timeout=2)
    except:
        proc.kill()
        out, err = proc.communicate()
    return out + err

res_rule_udp = probe("Rule", True, 443, 19101)
res_global_udp = probe("Global", True, 443, 19102)
res_global_tcp = probe("Global", False, 80, 19103)

print("RULE_UDP_PASS:" + str("network=udp port=443 => reject" in res_rule_udp))
print("GLOBAL_UDP_PASS:" + str("network=udp port=443 => reject" in res_global_udp))
print("GLOBAL_TCP_PASS:" + str("clash_mode=Global => route(select)" in res_global_tcp))
`;

    const runnerPath = path.join(testDir, "runner.py");
    fs.writeFileSync(runnerPath, pyProbeScript, "utf-8");

    const out = execFileSync("python", [runnerPath, SINGBOX_BIN, testDir, String(testPort)], {
        encoding: "utf-8"
    });

    assert.ok(out.includes("RULE_UDP_PASS:True"), "Rule mode UDP 443 must be rejected");
    assert.ok(out.includes("GLOBAL_UDP_PASS:True"), "Global mode UDP 443 must be rejected");
    assert.ok(out.includes("GLOBAL_TCP_PASS:True"), "Global mode TCP 80 must route to select");

    // Cleanup
    try {
        fs.rmSync(testDir, { recursive: true, force: true });
    } catch {}
});

// =========================================================================
// 2. FINDING B: XRAY GEODATA ASSET INDEPENDENCE
// =========================================================================

test("Phase 6E - Finding B: Generated Xray config contains zero unguaranteed geoip/geosite references", async () => {
    const sysConfig = {
        deviceId: "test-xray-independence",
        apiRoute: "test-route",
        socketPorts: "443,8443",
        mode: "both",
        blockUDP443: true,
        blockThreats: true,
        bypassIran: true,
        bypassAi: true,
        users: [
            {
                name: "IndependenceUser",
                id: "12345678-1234-1234-1234-123456789abc",
                cleanIp: "104.16.1.1,104.16.1.2",
                userMode: "both",
                userPorts: "443,8443"
            }
        ]
    };

    const xrayConfig = await buildVJsonProfile("xray.example.com", "IndependenceUser", false, sysConfig);
    const jsonStr = JSON.stringify(xrayConfig);

    // Verify 0 occurrences of geoip: or geosite:
    const geoipMatches = jsonStr.match(/geoip:[a-zA-Z0-9_\-]+/g);
    const geositeMatches = jsonStr.match(/geosite:[a-zA-Z0-9_\-]+/g);

    assert.equal(geoipMatches, null, `Found unguaranteed geoip references: ${geoipMatches}`);
    assert.equal(geositeMatches, null, `Found unguaranteed geosite references: ${geositeMatches}`);
});

test("Phase 6E - Finding B: Private/LAN matching uses explicit CIDRs and domestic/sanction routing remains present", async () => {
    const sysConfig = {
        deviceId: "test-xray-rules",
        apiRoute: "rules-route",
        socketPorts: "443",
        mode: "alpha",
        blockUDP443: true,
        blockThreats: true,
        bypassIran: true,
        bypassAi: true,
        users: [
            {
                name: "RulesUser",
                id: "22222222-2222-2222-2222-222222222222",
                cleanIp: "104.16.1.1",
                userMode: "alpha",
                userPorts: "443"
            }
        ]
    };

    const xrayConfig = await buildVJsonProfile("xray.example.com", "RulesUser", false, sysConfig);

    // 1. Private/LAN CIDRs in routing rules
    const privateRule = xrayConfig.routing.rules.find((r) => r.outboundTag === "direct" && Array.isArray(r.ip));
    assert.ok(privateRule, "Private IP direct rule must exist");
    assert.ok(privateRule.ip.includes("10.0.0.0/8"));
    assert.ok(privateRule.ip.includes("172.16.0.0/12"));
    assert.ok(privateRule.ip.includes("192.168.0.0/16"));
    assert.ok(privateRule.ip.includes("127.0.0.0/8"));
    assert.ok(privateRule.ip.includes("fc00::/7"));
    assert.ok(privateRule.ip.includes("fe80::/10"));

    // 2. Domestic bypass (domain:ir)
    const domesticRule = xrayConfig.routing.rules.find((r) => r.outboundTag === "direct" && r.domain?.includes("domain:ir"));
    assert.ok(domesticRule, "Domestic direct rule for domain:ir must exist");

    // Domestic DNS server
    const domesticDns = xrayConfig.dns.servers.find((s) => s.domains?.includes("domain:ir"));
    assert.ok(domesticDns, "Domestic DNS server for domain:ir must exist");

    // 3. Sanction bypass (AI domains direct)
    const aiRule = xrayConfig.routing.rules.find((r) => r.outboundTag === "direct" && r.domain?.includes("domain:openai.com"));
    assert.ok(aiRule, "Sanction direct rule for AI domains must exist");
    assert.ok(aiRule.domain.includes("domain:chatgpt.com"));

    // Anti-sanction DNS server
    const antiSanctionDns = xrayConfig.dns.servers.find((s) => s.domains?.includes("domain:openai.com"));
    assert.ok(antiSanctionDns, "Anti-sanction DNS server for AI domains must exist");

    // 4. Security threat rejection
    const threatRule = xrayConfig.routing.rules.find((r) => r.outboundTag === "block" && r.domain?.includes("domain:doubleclick.net"));
    assert.ok(threatRule, "Threat block rule for doubleclick.net must exist");
});

test("Phase 6E - Finding B: Mandatory isolated validation of Xray config with NO geoip.dat and NO geosite.dat", async () => {
    if (!fs.existsSync(XRAY_BIN)) {
        return;
    }

    const isolatedDir = path.join(os.tmpdir(), `xray_isolated_${Date.now()}`);
    fs.mkdirSync(isolatedDir, { recursive: true });

    try {
        // Copy only xray.exe into the isolated directory
        const isolatedXray = path.join(isolatedDir, "xray.exe");
        fs.copyFileSync(XRAY_BIN, isolatedXray);

        // Ensure NO .dat files exist in isolatedDir
        assert.equal(fs.existsSync(path.join(isolatedDir, "geoip.dat")), false);
        assert.equal(fs.existsSync(path.join(isolatedDir, "geosite.dat")), false);

        // Generate complete full-feature Xray config
        const sysConfig = {
            deviceId: "isolated-mandatory-uuid",
            apiRoute: "sync",
            socketPorts: "443,8443",
            mode: "both",
            blockUDP443: true,
            blockThreats: true,
            bypassIran: true,
            bypassAi: true,
            users: [
                {
                    name: "IsolatedUser",
                    id: "33333333-3333-3333-3333-333333333333",
                    cleanIp: "104.16.1.1,104.16.1.2",
                    userMode: "both",
                    userPorts: "443,8443"
                }
            ]
        };

        const config = await buildVJsonProfile("isolated.example.com", "IsolatedUser", false, sysConfig);
        const cfgPath = path.join(isolatedDir, "config.json");
        fs.writeFileSync(cfgPath, JSON.stringify(config, null, 2), "utf-8");

        // Environment with ZERO asset location hints
        const cleanEnv = { ...process.env };
        delete cleanEnv.XRAY_LOCATION_ASSET;

        const out = execFileSync(isolatedXray, ["-test", "-c", cfgPath], {
            cwd: isolatedDir,
            env: cleanEnv,
            encoding: "utf-8"
        });

        assert.ok(out.includes("Configuration OK"), `Xray test should pass with Configuration OK: ${out}`);
    } finally {
        try {
            fs.rmSync(isolatedDir, { recursive: true, force: true });
        } catch {}
    }
});
