import { test } from "node:test";
import assert from "node:assert/strict";
import worker from "../src/index.js";
import { SYSTEM_DEFAULTS } from "../src/config.js";
import { resetStateStore } from "../src/db/d1.js";
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

test("Phase 16 - Scenario 1: Randomized route opens Dashboard successfully (200 HTML with embedded route)", async () => {
    resetStateStore();
    const randomizedRoute = "qrmxvnakzd";
    const masterKey = "admin_sec_999";
    const env = createMockEnv({
        ...SYSTEM_DEFAULTS,
        apiRoute: randomizedRoute,
        masterKey: masterKey,
    });
    env.MASTER_KEY = masterKey;

    const req = new Request(`https://worker.test/${randomizedRoute}/dash`, { method: "GET" });
    const res = await worker.fetch(req, env, mockCtx);
    assert.equal(res.status, 200);
    assert.equal(res.headers.get("content-type"), "text/html;charset=utf-8");
    const html = await res.text();
    assert(html.includes("LuciProxy"));
    // The embedded dashboard script must have initialized state.apiRoute with randomizedRoute
    assert(html.includes(`let r = '${randomizedRoute}';`));
});

test("Phase 16 - Scenario 2: Randomized route serves authentication endpoint", async () => {
    resetStateStore();
    const randomizedRoute = "qrmxvnakzd";
    const masterKey = "admin_sec_999";
    const env = createMockEnv({
        ...SYSTEM_DEFAULTS,
        apiRoute: randomizedRoute,
        masterKey: masterKey,
    });
    env.MASTER_KEY = masterKey;

    const req = new Request(`https://worker.test/${randomizedRoute}/api/auth`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ key: masterKey }),
    });
    const res = await worker.fetch(req, env, mockCtx);
    assert.equal(res.status, 200);
    const json = await res.json();
    assert.equal(json.success, true);
    assert.equal(json.config.apiRoute, randomizedRoute);
});

test("Phase 16 - Scenario 3: Randomized route serves protected endpoints", async () => {
    resetStateStore();
    const randomizedRoute = "qrmxvnakzd";
    const masterKey = "admin_sec_999";
    const env = createMockEnv({
        ...SYSTEM_DEFAULTS,
        apiRoute: randomizedRoute,
        masterKey: masterKey,
        users: [{ id: "u-1", name: "User 1", uuid: "11111111-1111-4111-8111-111111111111", enabled: true }],
    });
    env.MASTER_KEY = masterKey;

    // 1. /<route>/api/users
    const usersRes = await worker.fetch(new Request(`https://worker.test/${randomizedRoute}/api/users`, {
        method: "GET",
        headers: { "Authorization": `Bearer ${masterKey}` },
    }), env, mockCtx);
    assert.equal(usersRes.status, 200);
    const usersJson = await usersRes.json();
    assert.equal(usersJson.success, true);
    assert.equal(usersJson.users.length, 1);

    // 2. /<route>/api/stats
    const statsRes = await worker.fetch(new Request(`https://worker.test/${randomizedRoute}/api/stats`, {
        method: "GET",
        headers: { "Authorization": `Bearer ${masterKey}` },
    }), env, mockCtx);
    assert.equal(statsRes.status, 200);
    const statsJson = await statsRes.json();
    assert.equal(statsJson.success, true);

    // 3. /<route>/api/logs
    const logsRes = await worker.fetch(new Request(`https://worker.test/${randomizedRoute}/api/logs`, {
        method: "GET",
        headers: { "Authorization": `Bearer ${masterKey}` },
    }), env, mockCtx);
    assert.equal(logsRes.status, 200);

    // 4. /<route>/share-settings (returns Base64 encoded payload)
    const shareRes = await worker.fetch(new Request(`https://worker.test/${randomizedRoute}/share-settings`, {
        method: "GET",
    }), env, mockCtx);
    assert.equal(shareRes.status, 200);
    const shareText = await shareRes.text();
    const shareJson = JSON.parse(safeAtob(shareText));
    assert(shareJson.routing !== undefined || shareJson.profiles !== undefined);

    // 5. /<route>/sub-setip
    const ipRes = await worker.fetch(new Request(`https://worker.test/${randomizedRoute}/sub-setip`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ip: "1.1.1.1, 8.8.8.8" }),
    }), env, mockCtx);
    assert.equal(ipRes.status, 200);

    // 6. /<route> (subscription data route with user query)
    const subRes = await worker.fetch(new Request(`https://worker.test/${randomizedRoute}?sub=u-1`, {
        method: "GET",
        headers: { "User-Agent": "v2rayng/1.8" },
    }), env, mockCtx);
    assert.equal(subRes.status, 200);
    const subText = await subRes.text();
    assert(subText.length > 0);
});

test("Phase 16 - Scenario 4: /sync/dash does NOT open Dashboard when apiRoute is randomized", async () => {
    resetStateStore();
    const randomizedRoute = "qrmxvnakzd";
    const env = createMockEnv({
        ...SYSTEM_DEFAULTS,
        apiRoute: randomizedRoute,
        masterKey: "admin_sec_999",
    });

    const req = new Request("https://worker.test/sync/dash", { method: "GET" });
    const res = await worker.fetch(req, env, mockCtx);
    assert.equal(res.status, 404);
    const body = await res.text();
    assert(!body.includes("LuciProxy"));
});

test("Phase 16 - Scenario 5: /sync/api/auth does NOT reach auth handler when apiRoute is randomized", async () => {
    resetStateStore();
    const randomizedRoute = "qrmxvnakzd";
    const masterKey = "admin_sec_999";
    const env = createMockEnv({
        ...SYSTEM_DEFAULTS,
        apiRoute: randomizedRoute,
        masterKey: masterKey,
    });
    env.MASTER_KEY = masterKey;

    const req = new Request("https://worker.test/sync/api/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ key: masterKey }),
    });
    const res = await worker.fetch(req, env, mockCtx);
    // Must return camouflage 404, NOT reach auth handler
    assert.equal(res.status, 404);
});

test("Phase 16 - Scenario 6: /sync/share-settings and other /sync APIs do NOT reach handlers when apiRoute is randomized", async () => {
    resetStateStore();
    const randomizedRoute = "qrmxvnakzd";
    const masterKey = "admin_sec_999";
    const env = createMockEnv({
        ...SYSTEM_DEFAULTS,
        apiRoute: randomizedRoute,
        masterKey: masterKey,
    });
    env.MASTER_KEY = masterKey;

    // /sync/share-settings
    const shareRes = await worker.fetch(new Request("https://worker.test/sync/share-settings", {
        method: "GET",
    }), env, mockCtx);
    assert.equal(shareRes.status, 404);

    // /sync/api/users
    const usersRes = await worker.fetch(new Request("https://worker.test/sync/api/users", {
        method: "GET",
        headers: { "Authorization": `Bearer ${masterKey}` },
    }), env, mockCtx);
    assert.equal(usersRes.status, 404);

    // /sync/api/sync
    const syncRes = await worker.fetch(new Request("https://worker.test/sync/api/sync", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${masterKey}`,
        },
        body: JSON.stringify({ key: masterKey, config: { mode: "dual" } }),
    }), env, mockCtx);
    assert.equal(syncRes.status, 404);

    // /share-settings (bare root)
    const bareShareRes = await worker.fetch(new Request("https://worker.test/share-settings", {
        method: "GET",
    }), env, mockCtx);
    assert.equal(bareShareRes.status, 404);
});

test("Phase 16 - Scenario 7: Legacy Worker with apiRoute = 'sync' continues to work normally", async () => {
    resetStateStore();
    const masterKey = "legacy_admin_123";
    const env = createMockEnv({
        ...SYSTEM_DEFAULTS,
        apiRoute: "sync",
        masterKey: masterKey,
        users: [{ id: "legacy-1", name: "Legacy User", uuid: "22222222-2222-4222-8222-222222222222", enabled: true }],
    });
    env.MASTER_KEY = masterKey;

    // Dashboard
    const dashRes = await worker.fetch(new Request("https://worker.test/sync/dash", { method: "GET" }), env, mockCtx);
    assert.equal(dashRes.status, 200);
    const dashHtml = await dashRes.text();
    assert(dashHtml.includes("LuciProxy"));
    assert(dashHtml.includes("let r = 'sync';"));

    // Auth
    const authRes = await worker.fetch(new Request("https://worker.test/sync/api/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ key: masterKey }),
    }), env, mockCtx);
    assert.equal(authRes.status, 200);

    // Subscription
    const subRes = await worker.fetch(new Request("https://worker.test/sync?sub=legacy-1", {
        headers: { "User-Agent": "v2rayng/1.8" },
    }), env, mockCtx);
    assert.equal(subRes.status, 200);

    // Share settings
    const shareRes = await worker.fetch(new Request("https://worker.test/sync/share-settings", {
        method: "GET",
    }), env, mockCtx);
    assert.equal(shareRes.status, 200);
});

test("Phase 16 - Scenarios 10-12: Changing route activates new route, deactivates old, preserves Master Key", async () => {
    resetStateStore();
    const oldRoute = "initialroute1";
    const newRoute = "newroute2";
    const masterKey = "persistent_master_key_456";

    const env = createMockEnv({
        ...SYSTEM_DEFAULTS,
        apiRoute: oldRoute,
        masterKey: masterKey,
    });
    env.MASTER_KEY = masterKey;

    // Verify initial route works
    const initAuth = await worker.fetch(new Request(`https://worker.test/${oldRoute}/api/auth`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ key: masterKey }),
    }), env, mockCtx);
    assert.equal(initAuth.status, 200);

    // Update route via POST /<oldRoute>/api/sync (without changing masterKey)
    const syncReq = new Request(`https://worker.test/${oldRoute}/api/sync`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${masterKey}`,
        },
        body: JSON.stringify({
            key: masterKey,
            config: {
                apiRoute: newRoute,
            },
        }),
    });
    const syncRes = await worker.fetch(syncReq, env, mockCtx);
    assert.equal(syncRes.status, 200);
    const syncJson = await syncRes.json();
    assert.equal(syncJson.success, true);
    assert.equal(syncJson.config.apiRoute, newRoute);
    // Master key preserved
    assert.equal(syncJson.config.masterKey, masterKey);

    // 1. New route is now ACTIVE
    const newDashRes = await worker.fetch(new Request(`https://worker.test/${newRoute}/dash`, { method: "GET" }), env, mockCtx);
    assert.equal(newDashRes.status, 200);
    const newDashHtml = await newDashRes.text();
    assert(newDashHtml.includes(`let r = '${newRoute}';`));

    const newAuthRes = await worker.fetch(new Request(`https://worker.test/${newRoute}/api/auth`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ key: masterKey }),
    }), env, mockCtx);
    assert.equal(newAuthRes.status, 200);

    // 2. Old route is now DEACTIVATED (camouflage 404)
    const oldDashRes = await worker.fetch(new Request(`https://worker.test/${oldRoute}/dash`, { method: "GET" }), env, mockCtx);
    assert.equal(oldDashRes.status, 404);

    const oldAuthRes = await worker.fetch(new Request(`https://worker.test/${oldRoute}/api/auth`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ key: masterKey }),
    }), env, mockCtx);
    assert.equal(oldAuthRes.status, 404);

    // 3. /sync remains deactivated
    const syncDashRes = await worker.fetch(new Request("https://worker.test/sync/dash", { method: "GET" }), env, mockCtx);
    assert.equal(syncDashRes.status, 404);
});

test("Phase 16 - Scenario 15: No hardcoded alias or prefix collision bypasses canonical routing", async () => {
    resetStateStore();
    const activeRoute = "qrmxvnakzd";
    const masterKey = "key_secure_789";
    const env = createMockEnv({
        ...SYSTEM_DEFAULTS,
        apiRoute: activeRoute,
        masterKey: masterKey,
    });
    env.MASTER_KEY = masterKey;

    // 1. Prefix collision (partial prefix: /qrm/dash)
    const collision1 = await worker.fetch(new Request("https://worker.test/qrm/dash", { method: "GET" }), env, mockCtx);
    assert.equal(collision1.status, 404);

    // 2. Extension collision (/qrmxvnakzdextra/dash)
    const collision2 = await worker.fetch(new Request("https://worker.test/qrmxvnakzdextra/dash", { method: "GET" }), env, mockCtx);
    assert.equal(collision2.status, 404);

    // 3. Path traversal attempts (/qrmxvnakzd/../sync/dash)
    const traversal1 = await worker.fetch(new Request("https://worker.test/qrmxvnakzd/../sync/dash", { method: "GET" }), env, mockCtx);
    assert.equal(traversal1.status, 404);

    // 4. Multiple slashes are collapsed canonically (//qrmxvnakzd//dash -> 200)
    const multiSlash = await worker.fetch(new Request(`https://worker.test//${activeRoute}//dash`, { method: "GET" }), env, mockCtx);
    assert.equal(multiSlash.status, 200);

    // 5. Nested subpath collision (/qrmxvnakzd/dash/settings -> 404)
    const nestedSubpath = await worker.fetch(new Request(`https://worker.test/${activeRoute}/dash/settings`, { method: "GET" }), env, mockCtx);
    assert.equal(nestedSubpath.status, 404);

    // 6. Non-POST to auth endpoint returns 405
    const getAuth = await worker.fetch(new Request(`https://worker.test/${activeRoute}/api/auth`, { method: "GET" }), env, mockCtx);
    assert.equal(getAuth.status, 405);
});
