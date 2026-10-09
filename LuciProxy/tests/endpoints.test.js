import { test } from "node:test";
import assert from "node:assert/strict";
import worker from "../src/index.js";
import { SYSTEM_DEFAULTS, CURRENT_VERSION } from "../src/config.js";
import { setCachedConfig, setCachedUsage, d1Put, resetStateStore } from "../src/db/d1.js";
import { safeAtob } from "../src/utils/crypto.js";

const mockCtx = {
    waitUntil: (p) => Promise.resolve(p).catch(() => {})
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
                }
            }),
            run: async () => {}
        })
    };
    return {
        IOT_DB: mockDb,
        _table: table
    };
}

test("Endpoints - Dashboard view /sync/dash returns 200 HTML", async () => {
    const env = createMockEnv({
        ...SYSTEM_DEFAULTS,
        apiRoute: "sync",
        masterKey: "admin123"
    });
    setCachedConfig(SYSTEM_DEFAULTS);

    const req = new Request("https://worker.test/sync/dash", {
        method: "GET"
    });
    const res = await worker.fetch(req, env, mockCtx);
    assert.equal(res.status, 200);
    assert(res.headers.get("content-type").includes("text/html"));
    const text = await res.text();
    assert(text.includes("LuciProxy") || text.includes("dashboard"));
});

test("Endpoints - Admin Auth /sync/api/auth handles valid and invalid credentials", async () => {
    const env = createMockEnv({
        ...SYSTEM_DEFAULTS,
        apiRoute: "sync",
        masterKey: "secret_pass"
    });
    setCachedConfig({
        ...SYSTEM_DEFAULTS,
        apiRoute: "sync",
        masterKey: "secret_pass"
    });

    // 1. Wrong password -> 401
    const badReq = new Request("https://worker.test/sync/api/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ key: "wrong" })
    });
    const badRes = await worker.fetch(badReq, env, mockCtx);
    assert.equal(badRes.status, 401);

    // 2. Correct password -> 200 with config & version
    const goodReq = new Request("https://worker.test/sync/api/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ key: "secret_pass" })
    });
    const goodRes = await worker.fetch(goodReq, env, mockCtx);
    assert.equal(goodRes.status, 200);
    const data = await goodRes.json();
    assert.equal(data.success, true);
    assert.equal(data.version, CURRENT_VERSION);
    assert(data.config);
    assert(Array.isArray(data.profiles));
});

test("Endpoints - Config Sync /sync/api/sync updates settings", async () => {
    const env = createMockEnv({
        ...SYSTEM_DEFAULTS,
        apiRoute: "sync",
        masterKey: "secret_pass"
    });
    setCachedConfig({
        ...SYSTEM_DEFAULTS,
        apiRoute: "sync",
        masterKey: "secret_pass"
    });

    // OPTIONS preflight
    const optReq = new Request("https://worker.test/sync/api/sync", {
        method: "OPTIONS"
    });
    const optRes = await worker.fetch(optReq, env, mockCtx);
    assert.equal(optRes.status, 204);

    // POST config update with Authorization Bearer
    const updateReq = new Request("https://worker.test/sync/api/sync", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "Authorization": "Bearer secret_pass"
        },
        body: JSON.stringify({
            mode: "both",
            socketPorts: "443,8443"
        })
    });
    const updateRes = await worker.fetch(updateReq, env, mockCtx);
    assert.equal(updateRes.status, 200);
    const updateData = await updateRes.json();
    assert.equal(updateData.success, true);
    assert.equal(updateData.config.mode, "both");
    assert.equal(updateData.config.socketPorts, "443,8443");
});

test("Endpoints - System Stats /sync/api/stats returns runtime metrics", async () => {
    const env = createMockEnv();
    const req = new Request("https://worker.test/sync/api/stats", {
        method: "GET"
    });
    const res = await worker.fetch(req, env, mockCtx);
    assert.equal(res.status, 200);
    const data = await res.json();
    assert.equal(data.version, CURRENT_VERSION);
    assert(data.metrics);
    assert.equal(typeof data.metrics.totalUsers, "number");
});

test("Endpoints - Activity Logs /sync/api/logs handles log retrieval and clearing", async () => {
    const env = createMockEnv();
    setCachedConfig({
        ...SYSTEM_DEFAULTS,
        apiRoute: "sync",
        masterKey: "secret_pass"
    });

    // Write a test log directly into mock D1
    await env.IOT_DB.prepare("INSERT INTO kv_store (key, value) VALUES (?, ?)")
        .bind("system_logs", JSON.stringify([{ id: "log-1", title: "Test", time: Date.now() }]))
        .run();

    // GET /sync/api/logs with auth
    const req = new Request("https://worker.test/sync/api/logs", {
        method: "GET",
        headers: { "Authorization": "Bearer secret_pass" }
    });
    const res = await worker.fetch(req, env, mockCtx);
    assert.equal(res.status, 200);
    const data = await res.json();
    assert.equal(data.success, true);
    assert.equal(data.logs.length, 1);
    assert.equal(data.logs[0].title, "Test");
});

test("Endpoints - Subscription /sync generates multi-format configs", async () => {
    const env = createMockEnv({
        ...SYSTEM_DEFAULTS,
        apiRoute: "sync",
        deviceId: "e0000000-0000-4000-8000-000000000001",
        cleanIps: "104.16.1.1",
        socketPorts: "443",
        mode: "alpha"
    });
    setCachedConfig({
        ...SYSTEM_DEFAULTS,
        apiRoute: "sync",
        deviceId: "e0000000-0000-4000-8000-000000000001",
        cleanIps: "104.16.1.1",
        socketPorts: "443",
        mode: "alpha"
    });

    // 1. Default Plaintext Base64 URIs
    const reqBase64 = new Request("https://worker.test/sync", {
        method: "GET",
        headers: { "User-Agent": "curl/7.88.1" }
    });
    const resBase64 = await worker.fetch(reqBase64, env, mockCtx);
    assert.equal(resBase64.status, 200);
    const b64Body = await resBase64.text();
    const decodedUris = safeAtob(b64Body);
    assert(decodedUris.includes("vless://"));
    assert(resBase64.headers.get("subscription-userinfo"));

    // 2. Clash YAML (via flag=clash)
    const reqClash = new Request("https://worker.test/sync?flag=clash", {
        method: "GET",
        headers: { "User-Agent": "curl/7.88.1" }
    });
    const resClash = await worker.fetch(reqClash, env, mockCtx);
    assert.equal(resClash.status, 200);
    assert(resClash.headers.get("content-type").includes("yaml"));
    const yamlBody = await resClash.text();
    assert(yamlBody.includes("proxies:"));
    assert(yamlBody.includes("type: vless"));

    // 3. Sing-Box JSON (via flag=sing-box)
    const reqSb = new Request("https://worker.test/sync?flag=sing-box", {
        method: "GET",
        headers: { "User-Agent": "curl/7.88.1" }
    });
    const resSb = await worker.fetch(reqSb, env, mockCtx);
    assert.equal(resSb.status, 200);
    assert(resSb.headers.get("content-type").includes("json"));
    const sbBody = await resSb.json();
    assert(sbBody.outbounds);

    // 4. V2Ray / Xray JSON (via flag=v2ray)
    const reqV2 = new Request("https://worker.test/sync?flag=v2ray", {
        method: "GET",
        headers: { "User-Agent": "curl/7.88.1" }
    });
    const resV2 = await worker.fetch(reqV2, env, mockCtx);
    assert.equal(resV2.status, 200);
    const v2Body = await resV2.json();
    assert(v2Body.inbounds && v2Body.outbounds);

    // 5. WireGuard .conf (via flag=wireguard)
    const reqWg = new Request("https://worker.test/sync?flag=wireguard", {
        method: "GET",
        headers: { "User-Agent": "curl/7.88.1" }
    });
    const resWg = await worker.fetch(reqWg, env, mockCtx);
    assert.equal(resWg.status, 200);
    const wgBody = await resWg.text();
    assert(wgBody.includes("[Interface]") && wgBody.includes("[Peer]"));

    // 6. Amnezia WireGuard .conf (via flag=amnezia)
    const reqAmz = new Request("https://worker.test/sync?flag=amnezia", {
        method: "GET",
        headers: { "User-Agent": "curl/7.88.1" }
    });
    const resAmz = await worker.fetch(reqAmz, env, mockCtx);
    assert.equal(resAmz.status, 200);
    const amzBody = await resAmz.text();
    assert(amzBody.includes("[Interface]") && amzBody.includes("Jc =") && amzBody.includes("H1 ="));
});

test("Endpoints - Subscription multi-user routing & 403 on missing user", async () => {
    const testConfig = {
        ...SYSTEM_DEFAULTS,
        apiRoute: "sync",
        deviceId: "e0000000-0000-4000-8000-000000000001",
        users: [
            { id: "user-alpha", name: "AlphaUser", isPaused: false },
            { id: "user-beta", name: "BetaUser", isPaused: true }
        ]
    };
    const env = createMockEnv(testConfig);
    setCachedConfig(testConfig);

    // Valid user -> 200
    const reqValid = new Request("https://worker.test/sync?sub=AlphaUser", {
        method: "GET",
        headers: { "User-Agent": "curl/7.88.1" }
    });
    const resValid = await worker.fetch(reqValid, env, mockCtx);
    assert.equal(resValid.status, 200);

    // Unknown user with multi-user enabled -> 403
    const reqUnknown = new Request("https://worker.test/sync?sub=GhostUser", {
        method: "GET",
        headers: { "User-Agent": "curl/7.88.1" }
    });
    const resUnknown = await worker.fetch(reqUnknown, env, mockCtx);
    assert.equal(resUnknown.status, 403);
});

test("Endpoints - Maintenance Mode returns 503", async () => {
    const testConfig = {
        ...SYSTEM_DEFAULTS,
        apiRoute: "sync",
        maintenanceMode: true
    };
    const env = createMockEnv(testConfig);
    setCachedConfig(testConfig);

    const req = new Request("https://worker.test/sync", {
        method: "GET",
        headers: { "User-Agent": "curl/7.88.1" }
    });
    const res = await worker.fetch(req, env, mockCtx);
    assert.equal(res.status, 503);
    const body = await res.text();
    assert(body.includes("Maintenance"));
});

test("Endpoints - DoH /dns-query endpoint forwards query", async () => {
    const testConfig = {
        ...SYSTEM_DEFAULTS,
        apiRoute: "sync",
        customDns: "https://mock-dns.test/dns-query"
    };
    const env = createMockEnv(testConfig);
    setCachedConfig(testConfig);

    const originalFetch = globalThis.fetch;
    let fetchedUrl = "";
    globalThis.fetch = async (url, init) => {
        fetchedUrl = String(url);
        return new Response(new Uint8Array([0, 1, 2, 3]), {
            status: 200,
            headers: { "Content-Type": "application/dns-message" }
        });
    };

    try {
        const req = new Request("https://worker.test/dns-query?dns=q80BAAABAAAAAAAAA3d3dwdleGFtcGxlA2NvbQAAAQAB", {
            method: "GET",
            headers: { "Accept": "application/dns-message" }
        });
        const res = await worker.fetch(req, env, mockCtx);
        assert.equal(res.status, 200);
        assert(fetchedUrl.includes("mock-dns.test/dns-query"));
        assert(fetchedUrl.includes("dns=q80BAAAB"));
    } finally {
        globalThis.fetch = originalFetch;
    }
});

test("Endpoints - Share Settings /sync/share-settings & flag=share-settings return base64 encoded settings", async () => {
    const testConfig = {
        ...SYSTEM_DEFAULTS,
        apiRoute: "sync",
        cleanIps: ["1.1.1.1", "1.0.0.1"],
        blockUDP443: true,
        enableECH: true
    };
    const env = createMockEnv(testConfig);
    setCachedConfig(testConfig);

    // 1. Path endpoint: /sync/share-settings
    const req1 = new Request("https://worker.test/sync/share-settings", { method: "GET" });
    const res1 = await worker.fetch(req1, env, mockCtx);
    assert.equal(res1.status, 200);
    assert.equal(res1.headers.get("content-type"), "text/plain; charset=utf-8");
    assert(res1.headers.get("content-disposition").includes("shared-settings.txt"));
    const body1 = await res1.text();
    const json1 = JSON.parse(safeAtob(body1));
    assert.deepEqual(json1.proxyIPs, ["1.1.1.1", "1.0.0.1"]);
    assert.equal(json1.antiDpi.blockUDP443, true);

    // 2. Query param endpoint: /sync?flag=share-settings
    const req2 = new Request("https://worker.test/sync?flag=share-settings", { method: "GET" });
    const res2 = await worker.fetch(req2, env, mockCtx);
    assert.equal(res2.status, 200);
    const body2 = await res2.text();
    const json2 = JSON.parse(safeAtob(body2));
    assert.deepEqual(json2.proxyIPs, ["1.1.1.1", "1.0.0.1"]);
});

test("Endpoints - TCP Probe /sync/proxy-ip/test performs TCP probe with mock socket", async () => {
    const { setSocketConnector } = await import("../src/protocols/proxy.js");

    const testConfig = { ...SYSTEM_DEFAULTS, apiRoute: "sync" };
    const env = createMockEnv(testConfig);
    setCachedConfig(testConfig);

    // Mock socket connector that simulates Cloudflare edge HTTP 400 response
    setSocketConnector(({ hostname, port }) => {
        let closed = false;
        const responseData = new TextEncoder().encode("HTTP/1.1 400 Bad Request\r\nServer: cloudflare\r\ncf-ray: 8812345678-LHR\r\n\r\n");
        return {
            writable: {
                getWriter: () => ({
                    write: async () => {},
                    releaseLock: () => {}
                })
            },
            readable: {
                getReader: () => ({
                    read: async () => {
                        if (closed) return { done: true, value: undefined };
                        closed = true;
                        return { done: false, value: responseData };
                    },
                    releaseLock: () => {}
                })
            },
            close: async () => {}
        };
    });

    try {
        const req = new Request("https://worker.test/sync/proxy-ip/test?target=104.28.155.81&attempts=2", { method: "GET" });
        const res = await worker.fetch(req, env, mockCtx);
        assert.equal(res.status, 200);
        const data = await res.json();
        assert.equal(data.success, true);
        assert.equal(data.data.target, "104.28.155.81");
        assert.equal(data.data.successRate, "2/2");
        assert.equal(data.data.attempts.length, 2);
        assert.equal(data.data.attempts[0].ok, true);
    } finally {
        setSocketConnector(null);
    }
});

test("Stats - Edge Usage getCfWorkerUsage incorporates Cloudflare GraphQL usage metrics", async () => {
    const testConfig = {
        ...SYSTEM_DEFAULTS,
        apiRoute: "sync",
        accID: "test-cf-acc-123",
        apiToken: "test-cf-token-abc"
    };
    const env = {
        ...createMockEnv(testConfig),
        CF_ACCOUNT_ID: "test-cf-acc-123",
        CF_API_TOKEN: "test-cf-token-abc"
    };
    setCachedConfig(testConfig);

    const originalFetch = globalThis.fetch;
    globalThis.fetch = async (url, init) => {
        if (String(url).includes("api.cloudflare.com/client/v4/graphql")) {
            return new Response(JSON.stringify({
                data: {
                    viewer: {
                        accounts: [{
                            total: [{ sum: { requests: 12500 } }],
                            worker: [{ sum: { requests: 4500 } }]
                        }]
                    }
                }
            }), { status: 200, headers: { "Content-Type": "application/json" } });
        }
        return originalFetch(url, init);
    };

    try {
        const req = new Request("https://worker.test/sync/api/stats?cfUsage=1", { method: "GET" });
        const res = await worker.fetch(req, env, mockCtx);
        assert.equal(res.status, 200);
        const json = await res.json();
        assert.equal(json.success, true);
        assert(json.metrics.cfWorkerUsage);
        assert.equal(json.metrics.cfWorkerUsage.totalRequests, 12500);
        assert.equal(json.metrics.cfWorkerUsage.workerRequests, 4500);
        assert.equal(json.metrics.cfWorkerUsage.freeQuotaLimit, 100000);
        assert.equal(json.metrics.cfWorkerUsage.percentUsed, 5); // ceil(4500 / 100000 * 100) = 5%
    } finally {
        globalThis.fetch = originalFetch;
    }
});

test("Endpoints - Master Key Rotation persists and updates authoritative authentication", async () => {
    resetStateStore();
    const initialKey = "init-token-abc123";
    const rotatedKey = "new-rotated-token-xyz789";

    const env = createMockEnv({
        ...SYSTEM_DEFAULTS,
        apiRoute: "sync",
    });
    env.MASTER_KEY = initialKey;

    // 1. Initial key authenticates successfully
    const authReq1 = new Request("https://worker.test/sync/api/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ key: initialKey }),
    });
    const authRes1 = await worker.fetch(authReq1, env, mockCtx);
    assert.equal(authRes1.status, 200);
    const authJson1 = await authRes1.json();
    assert.equal(authJson1.success, true);

    // 2. Invalid key is rejected
    const badReq = new Request("https://worker.test/sync/api/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ key: "wrong-password" }),
    });
    const badRes = await worker.fetch(badReq, env, mockCtx);
    assert.equal(badRes.status, 401);

    // 3. Authenticated rotation request via POST /sync/api/sync
    const rotateReq = new Request("https://worker.test/sync/api/sync", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "Authorization": "Bearer " + initialKey,
        },
        body: JSON.stringify({
            key: initialKey,
            config: {
                apiRoute: "sync",
                masterKey: rotatedKey,
            },
        }),
    });
    const rotateRes = await worker.fetch(rotateReq, env, mockCtx);
    assert.equal(rotateRes.status, 200);
    const rotateJson = await rotateRes.json();
    assert.equal(rotateJson.success, true);
    assert.equal(rotateJson.config.masterKey, rotatedKey);

    // 4. OLD key now fails to authenticate
    const oldAuthReq = new Request("https://worker.test/sync/api/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ key: initialKey }),
    });
    const oldAuthRes = await worker.fetch(oldAuthReq, env, mockCtx);
    assert.equal(oldAuthRes.status, 401);

    // 5. NEW key authenticates successfully
    const newAuthReq = new Request("https://worker.test/sync/api/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ key: rotatedKey }),
    });
    const newAuthRes = await worker.fetch(newAuthReq, env, mockCtx);
    assert.equal(newAuthRes.status, 200);
    const newAuthJson = await newAuthRes.json();
    assert.equal(newAuthJson.success, true);

    // 6. Simulate cold restart / Worker cold start:
    // Reset in-memory state store completely, while env.MASTER_KEY remains the immutable deployment secret.
    resetStateStore();
    // Cold fetch to auth with old key -> MUST FAIL
    const coldOldReq = new Request("https://worker.test/sync/api/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ key: initialKey }),
    });
    const coldOldRes = await worker.fetch(coldOldReq, env, mockCtx);
    assert.equal(coldOldRes.status, 401);

    // Cold fetch to auth with new key -> MUST SUCCEED
    const coldNewReq = new Request("https://worker.test/sync/api/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ key: rotatedKey }),
    });
    const coldNewRes = await worker.fetch(coldNewReq, env, mockCtx);
    assert.equal(coldNewRes.status, 200);
    const coldNewJson = await coldNewRes.json();
    assert.equal(coldNewJson.success, true);
});

test("Endpoints - Subscription Route Update decouples subscription from admin dashboard", async () => {
    resetStateStore();
    const adminKey = "admin-secret-999";
    const env = createMockEnv({
        ...SYSTEM_DEFAULTS,
        apiRoute: "sync",
    });
    env.MASTER_KEY = adminKey;

    // 1. Initial subscription served on /sync
    const initSubReq = new Request("https://worker.test/sync", {
        headers: { "User-Agent": "v2rayng/1.8" },
    });
    const initSubRes = await worker.fetch(initSubReq, env, mockCtx);
    assert.equal(initSubRes.status, 200);
    const initSubText = await initSubRes.text();
    assert(initSubText.length > 0);

    // 2. Change ONLY Subscription Route to 'private-sub-42' (without changing master key)
    const updateRouteReq = new Request("https://worker.test/sync/api/sync", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "Authorization": "Bearer " + adminKey,
        },
        body: JSON.stringify({
            key: adminKey,
            config: {
                apiRoute: "private-sub-42",
            },
        }),
    });
    const updateRouteRes = await worker.fetch(updateRouteReq, env, mockCtx);
    assert.equal(updateRouteRes.status, 200);
    const updateRouteJson = await updateRouteRes.json();
    assert.equal(updateRouteJson.success, true);
    assert.equal(updateRouteJson.config.apiRoute, "private-sub-42");

    // 3. Old route /sync NO LONGER serves subscriptions (serves camouflage)
    const oldSubReq = new Request("https://worker.test/sync", {
        headers: { "User-Agent": "v2rayng/1.8" },
    });
    const oldSubRes = await worker.fetch(oldSubReq, env, mockCtx);
    const oldSubText = await oldSubRes.text();
    assert(!oldSubText.startsWith("dmxlc3M6") && !oldSubText.includes("vless://"));

    // 4. New route /private-sub-42 SERVES subscriptions
    const newSubReq = new Request("https://worker.test/private-sub-42", {
        headers: { "User-Agent": "v2rayng/1.8" },
    });
    const newSubRes = await worker.fetch(newSubReq, env, mockCtx);
    assert.equal(newSubRes.status, 200);
    const newSubText = await newSubRes.text();
    assert(newSubText.length > 0);

    // 5. Old route /sync/dash NO LONGER serves dashboard (serves camouflage)
    const dashReq = new Request("https://worker.test/sync/dash", { method: "GET" });
    const dashRes = await worker.fetch(dashReq, env, mockCtx);
    assert.equal(dashRes.status, 404);

    // 6. Old route /sync/api/users NO LONGER serves API (serves camouflage)
    const usersReq = new Request("https://worker.test/sync/api/users", {
        method: "GET",
        headers: { "Authorization": "Bearer " + adminKey },
    });
    const usersRes = await worker.fetch(usersReq, env, mockCtx);
    assert.equal(usersRes.status, 404);

    // 7. New route /private-sub-42/dash SERVES admin dashboard
    const newDashReq = new Request("https://worker.test/private-sub-42/dash", { method: "GET" });
    const newDashRes = await worker.fetch(newDashReq, env, mockCtx);
    assert.equal(newDashRes.status, 200);
    const dashHtml = await newDashRes.text();
    assert(dashHtml.includes("LuciProxy"));

    // 8. New route /private-sub-42/api/users SERVES users API
    const newUsersReq = new Request("https://worker.test/private-sub-42/api/users", {
        method: "GET",
        headers: { "Authorization": "Bearer " + adminKey },
    });
    const newUsersRes = await worker.fetch(newUsersReq, env, mockCtx);
    assert.equal(newUsersRes.status, 200);
});

test("Endpoints - Simultaneous Master Key rotation and Subscription Route update", async () => {
    resetStateStore();
    const oldKey = "old-key-111";
    const newKey = "new-key-222";
    const env = createMockEnv({
        ...SYSTEM_DEFAULTS,
        apiRoute: "sync",
    });
    env.MASTER_KEY = oldKey;

    // Update BOTH masterKey and apiRoute together
    const saveReq = new Request("https://worker.test/sync/api/sync", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "Authorization": "Bearer " + oldKey,
        },
        body: JSON.stringify({
            key: oldKey,
            config: {
                apiRoute: "dual-update-route",
                masterKey: newKey,
            },
        }),
    });
    const saveRes = await worker.fetch(saveReq, env, mockCtx);
    assert.equal(saveRes.status, 200);
    const saveJson = await saveRes.json();
    assert.equal(saveJson.success, true);
    assert.equal(saveJson.config.apiRoute, "dual-update-route");
    assert.equal(saveJson.config.masterKey, newKey);

    // Old route /sync/api/auth NO LONGER reaches auth handler (serves camouflage)
    const oldSyncAuth = await worker.fetch(new Request("https://worker.test/sync/api/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ key: newKey }),
    }), env, mockCtx);
    assert.equal(oldSyncAuth.status, 404);

    // Old key fails on new active route
    const oldAuth = await worker.fetch(new Request("https://worker.test/dual-update-route/api/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ key: oldKey }),
    }), env, mockCtx);
    assert.equal(oldAuth.status, 401);

    // New key succeeds on new active route
    const newAuth = await worker.fetch(new Request("https://worker.test/dual-update-route/api/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ key: newKey }),
    }), env, mockCtx);
    assert.equal(newAuth.status, 200);

    // New sub route serves subscription
    const subRes = await worker.fetch(new Request("https://worker.test/dual-update-route", {
        headers: { "User-Agent": "v2rayng/1.8" },
    }), env, mockCtx);
    assert.equal(subRes.status, 200);

    // Cold restart preserves both on the active route
    resetStateStore();
    const coldAuth = await worker.fetch(new Request("https://worker.test/dual-update-route/api/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ key: newKey }),
    }), env, mockCtx);
    assert.equal(coldAuth.status, 200);

    // Old route /sync/api/auth still rejected after cold restart
    const coldOldAuth = await worker.fetch(new Request("https://worker.test/sync/api/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ key: newKey }),
    }), env, mockCtx);
    assert.equal(coldOldAuth.status, 404);
});

