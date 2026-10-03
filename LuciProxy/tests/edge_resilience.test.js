/*
 * LuciProxy - Edge Resilience & Camouflage Tests
 * Validates Per-ISP Clean IP resolution, Backend VPS Relay, Camouflage (1101 & Nginx),
 * Radar clean-IP endpoint (/sub-setip), TLS fragmentation, Auto-rotating secret paths,
 * and GitHub mirror synchronization.
 */

import { test } from "node:test";
import assert from "node:assert/strict";
import worker from "../src/index.js";
import { SYSTEM_DEFAULTS } from "../src/config.js";
import { setCachedConfig, d1Get } from "../src/db/d1.js";
import { detectCarrier, fetchCleanIpList, resolveIspCleanIps } from "../src/subscriptions/isp.js";
import { mapBackendUrl, checkBackendHealth } from "../src/protocols/proxy.js";
import { renderError1101Html, renderNginxHtml } from "../src/assets/loaders.js";
import { getFragmentQueryParam, buildUriProfile } from "../src/subscriptions/uri.js";
import { buildSingBoxJsonProfile, applySingBoxFragment } from "../src/subscriptions/singbox.js";
import { autoRotateSecretPaths } from "../src/auth/auth.js";
import { syncGitHubMirror } from "../src/subscriptions/mirror.js";

const mockCtx = {
    waitUntil: (p) => Promise.resolve(p).catch(() => {}),
};

if (typeof globalThis.WebSocketPair === "undefined") {
    class MockWebSocket {
        constructor() {
            this.listeners = {};
            this.accepted = false;
            this.closed = false;
        }
        accept() { this.accepted = true; }
        addEventListener(type, fn) {
            if (!this.listeners[type]) this.listeners[type] = [];
            this.listeners[type].push(fn);
        }
        send(data) {}
        close() { this.closed = true; }
    }
    globalThis.WebSocketPair = class {
        constructor() {
            return [new MockWebSocket(), new MockWebSocket()];
        }
    };
}

const OrigResponse = globalThis.Response;
globalThis.Response = class MockCFResponse extends OrigResponse {
    constructor(body, init) {
        if (init && init.status === 101) {
            super(body, { ...init, status: 200 });
            Object.defineProperty(this, "status", { value: 101, writable: false });
            if (init.webSocket) this.webSocket = init.webSocket;
            return;
        }
        super(body, init);
    }
};

function createMockEnv(initialConfig = null) {
    const table = new Map();
    if (initialConfig) {
        table.set("sys_config", JSON.stringify(initialConfig));
    }
    const mockDb = {
        prepare: (query) => ({
            bind: (...args) => ({
                run: async () => {
                    if (query.includes("INSERT")) {
                        table.set(args[0], args[1]);
                    }
                },
                all: async () => {
                    if (query.includes("SELECT")) {
                        const val = table.get(args[0]);
                        return { results: val ? [{ value: val }] : [] };
                    }
                    return { results: [] };
                },
            }),
            run: async () => {},
        }),
    };
    return {
        IOT_DB: mockDb,
        _table: table,
    };
}

// --------------------------------------------------------------------------
// 1. Per-ISP Carrier Detection & Clean IP Resolution
// --------------------------------------------------------------------------
test("Edge Resilience - detectCarrier maps Iranian ASNs and international traffic accurately", () => {
    // Non-IR country
    assert.equal(detectCarrier({ country: "US", asn: 15169 }), "all");
    assert.equal(detectCarrier({ country: "DE", asn: 24940 }), "all");

    // MTN / Irancell
    assert.equal(detectCarrier({ country: "IR", asn: 44244, asOrganization: "MTN Irancell" }), "mtn");
    assert.equal(detectCarrier({ country: "IR", asn: 12345, asOrganization: "Irancell Telecommunication" }), "mtn");

    // MCI / Hamrah Aval
    assert.equal(detectCarrier({ country: "IR", asn: 197207, asOrganization: "MCCI" }), "mci");
    assert.equal(detectCarrier({ country: "IR", asn: 99999, asOrganization: "Hamrah-e Aval (MCI)" }), "mci");

    // Rightel
    assert.equal(detectCarrier({ country: "IR", asn: 57218, asOrganization: "Rightel" }), "rightel");

    // Shatel
    assert.equal(detectCarrier({ country: "IR", asn: 31549, asOrganization: "Shatel" }), "shatel");

    // Other Iranian ISP
    assert.equal(detectCarrier({ country: "IR", asn: 58224, asOrganization: "TIC" }), "ir");
});

test("Edge Resilience - fetchCleanIpList filters comments and caches results", async () => {
    const originalFetch = globalThis.fetch;
    let fetchCount = 0;

    globalThis.fetch = async (url) => {
        fetchCount++;
        return {
            ok: true,
            text: async () => "1.1.1.1\n# Comment line\n2.2.2.2\n  \n3.3.3.3#Tag\n",
        };
    };

    try {
        const testUrl = "https://raw.githubusercontent.com/test-clean-ips/mci.txt";
        const list1 = await fetchCleanIpList(testUrl);
        assert.deepEqual(list1, ["1.1.1.1", "2.2.2.2", "3.3.3.3#Tag"]);
        assert.equal(fetchCount, 1);

        // Second call within TTL must hit cache without refetching
        const list2 = await fetchCleanIpList(testUrl);
        assert.deepEqual(list2, ["1.1.1.1", "2.2.2.2", "3.3.3.3#Tag"]);
        assert.equal(fetchCount, 1, "Expected second call to use in-memory cache");
    } finally {
        globalThis.fetch = originalFetch;
    }
});

test("Edge Resilience - resolveIspCleanIps appends carrier tags", async () => {
    const originalFetch = globalThis.fetch;
    globalThis.fetch = async (url) => {
        if (url.includes("mci.txt")) {
            return { ok: true, text: async () => "104.16.1.1\n104.16.1.2\n" };
        }
        return { ok: false };
    };

    try {
        const cf = { country: "IR", asn: 197207, asOrganization: "MCCI" };
        const ips = await resolveIspCleanIps(cf, "https://example.com/pools", 5);
        assert.equal(ips.length, 2);
        assert(ips[0].includes("#Luci-MCI"));
        assert(ips[1].includes("#Luci-MCI"));
    } finally {
        globalThis.fetch = originalFetch;
    }
});

// --------------------------------------------------------------------------
// 2. Backend VPS Relay Mode & Diagnostics
// --------------------------------------------------------------------------
test("Edge Resilience - mapBackendUrl transforms backend VPS endpoints correctly", () => {
    const backend = "https://vps.example.com:8443";
    const reqUrl = new URL("https://luci.worker.dev/vless-ws?ed=2048");
    const mapped = mapBackendUrl(backend, reqUrl);
    assert.equal(mapped, "https://vps.example.com:8443/vless-ws?ed=2048");

    // Invalid backend URL returns null
    assert.equal(mapBackendUrl("not-a-valid-url", reqUrl), null);
});

test("Edge Resilience - checkBackendHealth handles valid upgrade and network errors", async () => {
    // 1. Invalid or empty URL
    const repEmpty = await checkBackendHealth("");
    assert.equal(repEmpty.ok, false);
    assert(repEmpty.steps[0].includes("OFF or URL is invalid"));

    const originalFetch = globalThis.fetch;

    // 2. Mock 101 WebSocket Upgrade success
    const mockWs = { accept: () => {}, close: () => {} };
    globalThis.fetch = async () => ({
        status: 101,
        webSocket: mockWs,
    });

    try {
        const repSuccess = await checkBackendHealth("https://vps.example.com:8443");
        assert.equal(repSuccess.ok, true);
        assert.equal(repSuccess.gotWebSocket, true);
        assert.equal(repSuccess.upstreamStatus, 101);

        // 3. Mock 502 Bad Gateway
        globalThis.fetch = async () => ({
            status: 502,
            webSocket: null,
        });
        const repFail = await checkBackendHealth("https://vps.example.com:8443");
        assert.equal(repFail.ok, false);
        assert.equal(repFail.upstreamStatus, 502);
    } finally {
        globalThis.fetch = originalFetch;
    }
});

// --------------------------------------------------------------------------
// 3. Radar Clean-IP Application (/sub-setip)
// --------------------------------------------------------------------------
test("Edge Resilience - handleSubSetIp updates global and user-specific clean IPs", async () => {
    const env = createMockEnv({
        ...SYSTEM_DEFAULTS,
        apiRoute: "sync",
        cleanIps: "1.1.1.1",
        users: [{ id: "u-1", name: "UserOne", cleanIp: "2.2.2.2" }],
    });
    setCachedConfig({
        ...SYSTEM_DEFAULTS,
        apiRoute: "sync",
        cleanIps: "1.1.1.1",
        users: [{ id: "u-1", name: "UserOne", cleanIp: "2.2.2.2" }],
    });

    // 1. Update Global clean IPs
    const postGlobalReq = new Request("https://worker.test/sub-setip", {
        method: "POST",
        body: "104.16.1.1\n104.16.1.2",
    });
    const resGlobal = await worker.fetch(postGlobalReq, env, mockCtx);
    assert.equal(resGlobal.status, 200);
    const dataGlobal = await resGlobal.json();
    assert.equal(dataGlobal.success, true);
    assert.equal(dataGlobal.count, 2);

    const savedConfigStr = await d1Get(env, "sys_config");
    const savedConfig = JSON.parse(savedConfigStr);
    assert.equal(savedConfig.cleanIps, "104.16.1.1\n104.16.1.2");

    // 2. Update User-specific clean IPs (/sync/sub-setip?sub=UserOne)
    const postUserReq = new Request("https://worker.test/sync/sub-setip?sub=UserOne", {
        method: "POST",
        body: "172.64.1.1\n172.64.1.2",
    });
    const resUser = await worker.fetch(postUserReq, env, mockCtx);
    assert.equal(resUser.status, 200);
    const dataUser = await resUser.json();
    assert.equal(dataUser.success, true);
    assert.equal(dataUser.count, 2);

    const savedConfigUser = JSON.parse(await d1Get(env, "sys_config"));
    assert.equal(savedConfigUser.users[0].cleanIp, "172.64.1.1\n172.64.1.2");

    // 3. Rejects invalid method
    const getReq = new Request("https://worker.test/sub-setip", { method: "GET" });
    const resGet = await worker.fetch(getReq, env, mockCtx);
    assert.equal(resGet.status, 405);
});

// --------------------------------------------------------------------------
// 4. Camouflage Presets (Error 1101 & Nginx)
// --------------------------------------------------------------------------
test("Edge Resilience - renderError1101Html and renderNginxHtml produce expected markup", () => {
    const errorHtml = renderError1101Html("edge.example.com", "203.0.113.1", "ray12345");
    assert(errorHtml.includes("Error"));
    assert(errorHtml.includes("1101"));
    assert(errorHtml.includes("Worker threw exception"));
    assert(errorHtml.includes("ray12345"));
    assert(errorHtml.includes("203.0.113.1"));

    const nginxHtml = renderNginxHtml();
    assert(nginxHtml.includes("Welcome to nginx!"));
    assert(nginxHtml.includes("Thank you for using nginx."));
});

test("Edge Resilience - worker.fetch routes unrecognized requests to configured camouflage", async () => {
    // 1. Error 1101 Camouflage
    const env1101 = createMockEnv({
        ...SYSTEM_DEFAULTS,
        apiRoute: "secret-route",
        camouflageType: "1101",
    });
    setCachedConfig({
        ...SYSTEM_DEFAULTS,
        apiRoute: "secret-route",
        camouflageType: "1101",
    });

    const probeReq = new Request("https://worker.test/random-probe", {
        headers: { "cf-connecting-ip": "198.51.100.42", "cf-ray": "ray-test-999" },
    });
    const res1101 = await worker.fetch(probeReq, env1101, mockCtx);
    assert.equal(res1101.status, 500);
    const body1101 = await res1101.text();
    assert(body1101.includes("1101"));
    assert(body1101.includes("ray-test-999"));

    // 2. Nginx Camouflage
    const envNginx = createMockEnv({
        ...SYSTEM_DEFAULTS,
        apiRoute: "secret-route",
        camouflageType: "nginx",
    });
    setCachedConfig({
        ...SYSTEM_DEFAULTS,
        apiRoute: "secret-route",
        camouflageType: "nginx",
    });

    const resNginx = await worker.fetch(probeReq, envNginx, mockCtx);
    assert.equal(resNginx.status, 200);
    const bodyNginx = await resNginx.text();
    assert(bodyNginx.includes("Welcome to nginx!"));
});

// --------------------------------------------------------------------------
// 5. TLS Fragmentation Presets (URI & Sing-Box)
// --------------------------------------------------------------------------
test("Edge Resilience - getFragmentQueryParam produces valid presets", () => {
    assert.equal(getFragmentQueryParam({ fragmentMode: "off" }), "");
    assert.equal(getFragmentQueryParam({ fragmentMode: "none" }), "");

    const balanced = getFragmentQueryParam({ fragmentMode: "balanced" });
    assert(balanced.includes("&fragment="));
    assert(decodeURIComponent(balanced).includes("1,40-80,20-40,tlshello"));

    const shadowrocket = getFragmentQueryParam({ fragmentMode: "shadowrocket" });
    assert(decodeURIComponent(shadowrocket).includes("1,40-60,30-50,tlshello"));

    const happ = getFragmentQueryParam({ fragmentMode: "happ" });
    assert(decodeURIComponent(happ).includes("3,1,tlshello"));

    const custom = getFragmentQueryParam({
        fragmentMode: "custom",
        fragmentParams: { packets: "2", length: "10-50", interval: "5-15" },
    });
    assert(decodeURIComponent(custom).includes("2,10-50,5-15,tlshello"));
});

test("Edge Resilience - buildUriProfile injects fragment parameter into TLS configs", async () => {
    const sysCfg = {
        ...SYSTEM_DEFAULTS,
        apiRoute: "sync",
        socketPorts: "443",
        cleanIps: "1.1.1.1",
        fragmentMode: "balanced",
    };
    const uriProfile = await buildUriProfile("worker.test", null, false, sysCfg);
    assert(uriProfile.includes("&fragment="));
    assert(uriProfile.includes("tlshello"));
});

test("Edge Resilience - buildSingBoxJsonProfile and applySingBoxFragment inject route-options rule", async () => {
    const sysCfg = {
        ...SYSTEM_DEFAULTS,
        apiRoute: "sync",
        socketPorts: "443",
        cleanIps: "1.1.1.1",
        fragmentMode: "balanced",
    };

    const sb = await buildSingBoxJsonProfile("worker.test", null, false, sysCfg);
    assert(Array.isArray(sb.route?.rules));
    const firstRule = sb.route.rules[0];
    assert.equal(firstRule.action, "route-options");
    assert.equal(firstRule.tls_fragment, true);
    assert.equal(firstRule.tls_fragment_fallback_delay, "500ms");

    // applySingBoxFragment is idempotent
    applySingBoxFragment(sb);
    const fragmentRules = sb.route.rules.filter((r) => r.action === "route-options" && r.tls_fragment);
    assert.equal(fragmentRules.length, 1);
});

// --------------------------------------------------------------------------
// 6. Auto-Rotating Secret Paths & Scheduled Cron
// --------------------------------------------------------------------------
test("Edge Resilience - autoRotateSecretPaths rotates admin and sync paths", async () => {
    const env = createMockEnv({
        ...SYSTEM_DEFAULTS,
        apiRoute: "initial-route",
        adminPath: "initial-admin",
        autoRotatePath: true,
        autoRotatePathDays: 30,
    });
    const sysCfg = {
        ...SYSTEM_DEFAULTS,
        apiRoute: "initial-route",
        adminPath: "initial-admin",
        autoRotatePath: true,
        autoRotatePathDays: 30,
    };

    // Force rotation
    const result = await autoRotateSecretPaths(env, sysCfg, true);
    assert.equal(result.rotated, true);
    assert.notEqual(result.adminPath, "initial-admin");
    assert.notEqual(result.subPath, "initial-route");

    // Check D1 persistence
    const savedConfig = JSON.parse(await d1Get(env, "sys_config"));
    assert.equal(savedConfig.adminPath, result.adminPath);
    assert.equal(savedConfig.apiRoute, result.subPath);
});

test("Edge Resilience - worker.scheduled executes background maintenance without crashing", async () => {
    const env = createMockEnv({
        ...SYSTEM_DEFAULTS,
        apiRoute: "sync",
        autoRotatePath: false,
    });
    setCachedConfig(SYSTEM_DEFAULTS);

    const schedRes = await worker.scheduled({}, env, mockCtx);
    assert.equal(typeof schedRes, "object");
    assert.equal(schedRes.rotated.skipped, true);
    assert.equal(schedRes.mirror.skipped, true);
});

// --------------------------------------------------------------------------
// 7. GitHub Mirror Synchronization
// --------------------------------------------------------------------------
test("Edge Resilience - syncGitHubMirror handles disabled and enabled states", async () => {
    // 1. Not configured
    const resNone = await syncGitHubMirror("worker.test", SYSTEM_DEFAULTS);
    assert.equal(resNone.skipped, true);

    // 2. Enabled with mock GitHub API
    const mirrorConfig = {
        ...SYSTEM_DEFAULTS,
        githubMirror: {
            enabled: true,
            token: "ghp_mock_token_12345",
            repo: "user/luci-mirror",
            branch: "main",
            pathPrefix: "subs",
        },
    };

    const originalFetch = globalThis.fetch;
    const syncedFiles = [];

    globalThis.fetch = async (url, options) => {
        if (options?.method === "PUT") {
            const body = JSON.parse(options.body);
            syncedFiles.push(url);
            return { ok: true, status: 201 };
        }
        // GET returns 404 (file doesn't exist yet)
        return { ok: false, status: 404 };
    };

    try {
        const mirrorRes = await syncGitHubMirror("worker.test", mirrorConfig);
        assert.equal(mirrorRes.success, true);
        assert.equal(syncedFiles.length, 3);
        assert(syncedFiles.some((u) => u.includes("base64.txt")));
        assert(syncedFiles.some((u) => u.includes("mihomo.yaml")));
        assert(syncedFiles.some((u) => u.includes("singbox.json")));
    } finally {
        globalThis.fetch = originalFetch;
    }
});

// --------------------------------------------------------------------------
// 8. Backend Mode in WebSocket Proxy Stream
// --------------------------------------------------------------------------
test("Edge Resilience - worker.fetch routes WebSocket to backend VPS when backendMode is enabled", async () => {
    const env = createMockEnv({
        ...SYSTEM_DEFAULTS,
        apiRoute: "sync",
        backendMode: true,
        backendUrl: "https://vps.example.com:8443",
    });
    setCachedConfig({
        ...SYSTEM_DEFAULTS,
        apiRoute: "sync",
        backendMode: true,
        backendUrl: "https://vps.example.com:8443",
    });

    const wsReq = new Request("https://worker.test/sync", {
        headers: {
            Upgrade: "websocket",
            Connection: "Upgrade",
            "Sec-WebSocket-Key": "dGhlIHNhbXBsZSBub25jZQ==",
            "Sec-WebSocket-Version": "13",
        },
    });

    const res = await worker.fetch(wsReq, env, mockCtx);
    assert.equal(res.status, 101);
    assert(res.webSocket);
});
