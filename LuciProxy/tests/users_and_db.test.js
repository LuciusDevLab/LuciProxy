import { test } from "node:test";
import assert from "node:assert/strict";
import {
    d1Get,
    d1Put,
    cachedD1Put,
    loadSysConfig,
    getCachedConfig,
    setCachedConfig,
    getCachedUsage,
    setCachedUsage
} from "../src/db/d1.js";
import {
    getAllProfiles,
    getCleanIps,
    getCleanIpsWithNames,
    calcEffectiveIps,
    trackUsage,
    handleUsersApi
} from "../src/users/manager.js";
import { SYSTEM_DEFAULTS } from "../src/config.js";

test("D1 - in-memory fallback stores and retrieves values", async () => {
    const env = {}; // No D1 binding
    await d1Put(env, "test_key", "hello_luciproxy");
    const val = await d1Get(env, "test_key");
    assert.equal(val, "hello_luciproxy");
});

test("D1 - mock D1 binding handles prepare, bind, run, all", async () => {
    const table = new Map();
    const mockDb = {
        prepare: (query) => {
            return {
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
                run: async () => {} // For CREATE TABLE
            };
        }
    };

    const env = { IOT_DB: mockDb };
    await d1Put(env, "user_key_1", JSON.stringify({ name: "Alice" }));
    const result = await d1Get(env, "user_key_1");
    assert.equal(JSON.parse(result).name, "Alice");
});

test("Config & State Cache - loadSysConfig merges defaults and cached data", async () => {
    const env = {};
    const initialConfig = {
        ...SYSTEM_DEFAULTS,
        apiRoute: "testsync",
        adminPass: "secret123"
    };
    await d1Put(env, "sys_config", JSON.stringify(initialConfig));

    const { sysConfig } = await loadSysConfig(env);
    assert.equal(sysConfig.apiRoute, "testsync");
    assert.equal(sysConfig.adminPass, "secret123");
    assert.equal(sysConfig.mode, SYSTEM_DEFAULTS.mode);
});

test("Profiles - getAllProfiles enforces active, paused, expired and quota states", () => {
    const now = Date.now();
    const testConfig = {
        ...SYSTEM_DEFAULTS,
        deviceId: "admin-uuid-0000",
        users: [
            { id: "user-active", name: "ActiveUser", isPaused: false },
            { id: "user-paused", name: "PausedUser", isPaused: true },
            { id: "user-expired", name: "ExpiredUser", expiryMs: now - 10000 },
            { id: "user-future", name: "FutureUser", expiryMs: now + 100000 },
            { id: "user-capped", name: "CappedUser", limitTotalReq: 100 }
        ]
    };

    // Set usage cache where user-capped has exceeded limit
    setCachedUsage({
        users: {
            "usercapped": { reqs: 0, dReqs: 0, bytes: 100 * 1024 * 1024 + 1 }
        }
    });

    const profiles = getAllProfiles(testConfig);
    const ids = profiles.map((p) => p.id);

    assert(ids.includes("admin-uuid-0000"), "Admin default deviceId should be present");
    assert(ids.includes("user-active"), "Active user should be present");
    assert(ids.includes("user-future"), "Future valid user should be present");
    assert(!ids.includes("user-paused"), "Paused user should be omitted");
    assert(!ids.includes("user-expired"), "Expired user should be omitted");
    assert(!ids.includes("user-capped"), "Capped user should be omitted");

    // Filter by targetSub
    const filtered = getAllProfiles(testConfig, "ActiveUser");
    assert.equal(filtered.length, 1);
    assert.equal(filtered[0].id, "user-active");
});

test("Clean IPs - getCleanIps and calcEffectiveIps behavior", () => {
    const config = {
        ...SYSTEM_DEFAULTS,
        cleanIps: "1.1.1.1#Cloudflare\n2.2.2.2#Fastly\r\n3.3.3.3"
    };

    const cleanIps = getCleanIps("worker.example.com", null, config);
    assert.deepEqual(cleanIps, ["1.1.1.1", "2.2.2.2", "3.3.3.3"]);

    const withNames = getCleanIpsWithNames("worker.example.com", null, config);
    assert.equal(withNames.length, 3);
    assert.equal(withNames[0].ip, "1.1.1.1");
    assert.equal(withNames[0].name, "Cloudflare");
    assert.equal(withNames[2].ip, "3.3.3.3");
    assert.equal(withNames[2].name, "");

    // Pages.dev fallback
    const pagesFallback = getCleanIps("mysite.pages.dev", null, { metricNode: "custom.time.is" });
    assert.deepEqual(pagesFallback, ["custom.time.is"]);

    // calcEffectiveIps limiting
    const allIps = ["ip1", "ip2", "ip3", "ip4", "ip5", "ip6"];
    // maxCfg = 4, mode = both (2), ports = [443, 8443] (2), pips = 1 -> configsPerIp = 4 -> maxIps = 1
    const effective = calcEffectiveIps(allIps, 4, "both", ["443", "8443"], 1);
    assert.equal(effective.length, 1);
    assert.equal(effective[0], "ip1");
});

test("Traffic Accounting - trackUsage accumulates bytes and requests", () => {
    const env = {};
    const testUuid = "11112222-3333-4444-5555-666677778888";
    const cleanUuid = testUuid.replace(/-/g, "").toLowerCase();

    // Reset usage
    setCachedUsage({ users: {} });

    // Track 1 request (bytes = 0)
    trackUsage(testUuid, 0, env, null);
    let u = getCachedUsage().users[cleanUuid];
    assert.equal(u.reqs, 1);
    assert.equal(u.dReqs, 1);

    // Track 5000 bytes
    trackUsage(testUuid, 5000, env, null);
    u = getCachedUsage().users[cleanUuid];
    assert.equal(u.bytes, 5000);
    assert.equal(u.dBytes, 5000);
});

test("Users API - full CRUD lifecycle and actions", async () => {
    const env = {};
    const sysConfig = {
        ...SYSTEM_DEFAULTS,
        masterKey: "supersecret",
        users: []
    };
    setCachedConfig(sysConfig);
    setCachedUsage({ users: {} });

    const authHeaders = {
        "Content-Type": "application/json",
        "Authorization": "Bearer supersecret"
    };

    // 1. Unauthorized request rejected
    const unauthReq = new Request("http://localhost/sync/api/users", {
        method: "GET",
        headers: { "Content-Type": "application/json" }
    });
    const unauthRes = await handleUsersApi(unauthReq, env, null, getCachedConfig());
    assert.equal(unauthRes.status, 401);

    // 2. Create User (POST)
    const createReq = new Request("http://localhost/sync/api/users", {
        method: "POST",
        headers: authHeaders,
        body: JSON.stringify({
            id: "user-test-1",
            name: "Bob",
            limitTotalReq: 50,
            connLimit: 2
        })
    });
    const createRes = await handleUsersApi(createReq, env, null, getCachedConfig());
    assert.equal(createRes.status, 201);
    const createdData = await createRes.json();
    assert.equal(createdData.success, true);
    assert.equal(createdData.user.name, "Bob");

    // 3. List Users (GET)
    const listReq = new Request("http://localhost/sync/api/users", {
        method: "GET",
        headers: authHeaders
    });
    const listRes = await handleUsersApi(listReq, env, null, getCachedConfig());
    assert.equal(listRes.status, 200);
    const listData = await listRes.json();
    assert.equal(listData.total, 1);
    assert.equal(listData.users[0].name, "Bob");
    assert.equal(listData.users[0].status, "active");

    // 4. Update User (PUT)
    const updateReq = new Request("http://localhost/sync/api/users?id=user-test-1", {
        method: "PUT",
        headers: authHeaders,
        body: JSON.stringify({
            name: "Bobby Updated"
        })
    });
    const updateRes = await handleUsersApi(updateReq, env, null, getCachedConfig());
    assert.equal(updateRes.status, 200);
    const updatedData = await updateRes.json();
    assert.equal(updatedData.user.name, "Bobby Updated");

    // 5. Toggle Pause (POST action=toggle)
    const toggleReq = new Request("http://localhost/sync/api/users?id=user-test-1&action=toggle", {
        method: "POST",
        headers: authHeaders
    });
    const toggleRes = await handleUsersApi(toggleReq, env, null, getCachedConfig());
    assert.equal(toggleRes.status, 200);
    const toggleData = await toggleRes.json();
    assert.equal(toggleData.isPaused, true);

    // 6. Delete User (DELETE)
    const delReq = new Request("http://localhost/sync/api/users?id=user-test-1", {
        method: "DELETE",
        headers: authHeaders
    });
    const delRes = await handleUsersApi(delReq, env, null, getCachedConfig());
    assert.equal(delRes.status, 200);
    const delData = await delRes.json();
    assert.equal(delData.success, true);

    // Verify deletion
    const listAfterDel = await handleUsersApi(listReq, env, null, getCachedConfig());
    const listAfterData = await listAfterDel.json();
    assert.equal(listAfterData.total, 0);
});
