/**
 * LuciProxy - Phase 6B Targeted Regression Test Suite
 *
 * Verifies the confirmed Phase 6A.1 defects:
 * 1. enableTun=false => no Sing-box TUN inbound
 * 2. enableTun=true => TUN inbound present
 * 3. internal DoH 8.8.8.8 => dns.google normalization
 * 4. internal DoH successful response (RFC 8484 and JSON)
 * 5. no raw 8.8.8.8 Worker TLS path remains
 */

import test from "node:test";
import assert from "node:assert/strict";

import { buildSingBoxJsonProfile } from "../src/subscriptions/singbox.js";
import { normalizeDohUrl, resolveDomainDoh, forwardUdpDnsPacket } from "../src/protocols/dns_resolver.js";
import { handleDoH } from "../src/protocols/doh.js";
import { SYSTEM_DEFAULTS } from "../src/config.js";

// =========================================================================
// 1. SING-BOX CONDITIONAL TUN INBOUND TESTS
// =========================================================================

test("Phase 6B - Defect 1: enableTun=false omits Sing-box TUN inbound and preserves mixed proxy", async () => {
    const config = {
        ...SYSTEM_DEFAULTS,
        enableTun: false,
        deviceId: "c0000000-0000-4000-8000-000000000001",
        apiRoute: "sync"
    };

    const profile = await buildSingBoxJsonProfile("edge.example.com", null, false, config);

    // Mixed inbound on 127.0.0.1:2080 must exist
    const mixed = profile.inbounds.find((i) => i.type === "mixed");
    assert.ok(mixed, "Mixed inbound on 127.0.0.1:2080 must be present");
    assert.equal(mixed.listen, "127.0.0.1");
    assert.equal(mixed.listen_port, 2080);

    // TUN inbound must NOT be present
    const tun = profile.inbounds.find((i) => i.type === "tun");
    assert.equal(tun, undefined, "Sing-box profile must not contain TUN inbound when enableTun=false");

    // dnsRules must not reference tun-in
    const tunDnsRule = (profile.dns?.rules || []).find((r) => r.inbound === "tun-in");
    assert.equal(tunDnsRule, undefined, "dnsRules must not reference tun-in when TUN is disabled");
});

test("Phase 6B - Defect 1: enableTun=true generates Sing-box TUN inbound with auto-route and mixed proxy", async () => {
    const config = {
        ...SYSTEM_DEFAULTS,
        enableTun: true,
        fakeDns: true,
        deviceId: "c0000000-0000-4000-8000-000000000001",
        apiRoute: "sync"
    };

    const profile = await buildSingBoxJsonProfile("edge.example.com", null, false, config);

    // Mixed inbound must still exist
    const mixed = profile.inbounds.find((i) => i.type === "mixed");
    assert.ok(mixed, "Mixed inbound must be present");
    assert.equal(mixed.listen_port, 2080);

    // TUN inbound must be present
    const tun = profile.inbounds.find((i) => i.type === "tun");
    assert.ok(tun, "Sing-box profile must contain TUN inbound when enableTun=true");
    assert.equal(tun.tag, "tun-in");
    assert.equal(tun.auto_route, true);
    assert.equal(tun.strict_route, true);
    assert.equal(tun.stack, "mixed");

    // Fake DNS rule for tun-in must be present
    const tunDnsRule = (profile.dns?.rules || []).find((r) => r.inbound === "tun-in");
    assert.ok(tunDnsRule, "dnsRules must route tun-in to dns-fake when fakeDns and enableTun are both true");
    assert.equal(tunDnsRule.server, "dns-fake");
});

// =========================================================================
// 2. WORKER INTERNAL DOH NORMALIZATION TESTS
// =========================================================================

test("Phase 6B - Defect 2: normalizeDohUrl normalizes 8.8.8.8 and 8.8.4.4 to dns.google", () => {
    assert.equal(normalizeDohUrl("https://8.8.8.8/dns-query"), "https://dns.google/dns-query");
    assert.equal(normalizeDohUrl("https://8.8.8.8/resolve"), "https://dns.google/resolve");
    assert.equal(normalizeDohUrl("https://8.8.4.4/dns-query"), "https://dns.google/dns-query");
    assert.equal(normalizeDohUrl("https://8.8.8.8/dns-query?foo=bar"), "https://dns.google/dns-query?foo=bar");
});

test("Phase 6B - Defect 2: normalizeDohUrl guards against Cloudflare Anycast socket stall", () => {
    assert.equal(normalizeDohUrl("https://cloudflare-dns.com/dns-query"), "https://dns.google/dns-query");
    assert.equal(normalizeDohUrl("https://1.1.1.1/dns-query"), "https://dns.google/dns-query");
    assert.equal(normalizeDohUrl("https://1.0.0.1/dns-query"), "https://dns.google/dns-query");
});

test("Phase 6B - Defect 2: normalizeDohUrl preserves valid non-Cloudflare DoH hostnames", () => {
    assert.equal(normalizeDohUrl("https://dns.google/dns-query"), "https://dns.google/dns-query");
    assert.equal(normalizeDohUrl("https://dns.quad9.net/dns-query"), "https://dns.quad9.net/dns-query");
    assert.equal(normalizeDohUrl("https://doh.opendns.com/dns-query"), "https://doh.opendns.com/dns-query");
});

test("Phase 6B - Defect 2: resolveDomainDoh uses dns.google when passed raw 8.8.8.8", async () => {
    const originalFetch = globalThis.fetch;
    let dialedUrl = null;

    globalThis.fetch = async (url, init) => {
        dialedUrl = String(url);
        // Return a mock RFC 8427 JSON response
        const mockJson = {
            Status: 0,
            Answer: [{ name: "example.com", type: 1, data: "93.184.216.34" }]
        };
        return new Response(JSON.stringify(mockJson), {
            status: 200,
            headers: { "Content-Type": "application/dns-json" }
        });
    };

    try {
        const resolved = await resolveDomainDoh("test-norm-example.com", "https://8.8.8.8/resolve", "A", 2000);
        assert.equal(resolved, "93.184.216.34");
        assert.ok(dialedUrl, "Fetch must have been called");
        assert.ok(dialedUrl.startsWith("https://dns.google/resolve"), `Dialed URL must use dns.google, got: ${dialedUrl}`);
        assert.ok(!dialedUrl.includes("8.8.8.8"), "No raw 8.8.8.8 may remain in the outbound fetch URL");
    } finally {
        globalThis.fetch = originalFetch;
    }
});

test("Phase 6B - Defect 2: forwardUdpDnsPacket uses normalized DoH without raw 8.8.8.8", async () => {
    const originalFetch = globalThis.fetch;
    let dialedUrl = null;

    globalThis.fetch = async (url, init) => {
        dialedUrl = String(url);
        // Mock a 12-byte DNS wire response
        const respBuf = new Uint8Array(32);
        respBuf[0] = 0x12; respBuf[1] = 0x34; // ID
        respBuf[2] = 0x81; respBuf[3] = 0x80; // Standard response
        return new Response(respBuf.buffer, {
            status: 200,
            headers: { "Content-Type": "application/dns-message" }
        });
    };

    try {
        // VLESS UDP packet chunk with 2-byte length prefix
        const dnsQuery = new Uint8Array([
            0x00, 0x0c, // Length 12
            0x12, 0x34, 0x01, 0x00, 0x00, 0x01, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00
        ]);

        const result = await forwardUdpDnsPacket(dnsQuery, true, { customDns: "https://8.8.8.8/dns-query" });
        assert.ok(result, "forwardUdpDnsPacket must succeed");
        assert.ok(dialedUrl, "Fetch must have been called");
        assert.ok(dialedUrl.startsWith("https://dns.google/dns-query"), `Dialed URL must use dns.google, got: ${dialedUrl}`);
        assert.ok(!dialedUrl.includes("8.8.8.8"), "Outbound fetch URL must not contain 8.8.8.8");
    } finally {
        globalThis.fetch = originalFetch;
    }
});
