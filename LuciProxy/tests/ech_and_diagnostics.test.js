import { test } from "node:test";
import assert from "node:assert/strict";
import { DEFAULT_ECH_CONFIGS, SYSTEM_DEFAULTS } from "../src/config.js";
import { buildUriProfile } from "../src/subscriptions/uri.js";
import { handleUsersApi, getAllProfiles } from "../src/users/manager.js";
import { testProxyIp, setSocketConnector } from "../src/protocols/proxy.js";
import worker from "../src/index.js";
import { setCachedConfig, setCachedUsage } from "../src/db/d1.js";

const mockCtx = {
    waitUntil: () => {},
    passThroughOnException: () => {}
};

function createMockEnv(sysConfig = {}) {
    const memDb = new Map();
    memDb.set("sys_config", JSON.stringify(sysConfig));
    memDb.set("sys_usage", JSON.stringify({ users: {} }));

    return {
        DB: {
            prepare: (query) => ({
                bind: (...args) => ({
                    first: async (col) => {
                        const row = memDb.get(args[0]);
                        if (!row) return null;
                        return col === "val" ? row : { val: row };
                    },
                    run: async () => {
                        memDb.set(args[0], args[1]);
                        return { success: true };
                    },
                    all: async () => ({ results: [] })
                })
            })
        }
    };
}

test("DEFAULT_ECH_CONFIGS - Exactly 60 default strings defined", () => {
    assert.equal(Array.isArray(DEFAULT_ECH_CONFIGS), true);
    assert.equal(DEFAULT_ECH_CONFIGS.length, 60);

    // Verify presence of sample expected configs
    assert(DEFAULT_ECH_CONFIGS.includes("cloudflare-ech.com+udp://1.1.1.1"));
    assert(DEFAULT_ECH_CONFIGS.includes("cloudflare-ech.com+udp://8.8.8.8"));
    assert(DEFAULT_ECH_CONFIGS.includes("cloudflare-ech.com+udp://8.8.4.4"));
    assert(DEFAULT_ECH_CONFIGS.includes("adster.tech+udp://8.8.4.4"));
});

test("Subscription ECH & FinalMask - Cartesian product expansion with 60 defaults", async () => {
    const config = {
        ...SYSTEM_DEFAULTS,
        deviceId: "d0000000-0000-4000-8000-000000000001",
        apiRoute: "sync",
        cleanIps: "www.speedtest.net", // 1 Clean IP + 1 Primary = 2 base configs
        socketPorts: "443",
        mode: "alpha", // VLESS
        finalMask: {
            packets: "tlshello",
            lengths: ["101-123"],
            delays: ["7-9"],
            maxSplit: 17
        },
    };

    const uris = await buildUriProfile("edge.worker.dev", null, false, config);
    const lines = uris.split("\n").filter((l) => l.startsWith("vless://"));

    // 2 base configs (www.speedtest.net, edge.worker.dev) × 60 ECH configs = 120 VLESS configs
    assert.equal(lines.length, 120);

    // All lines should have &ech= and &fm= query parameters, and display name #Luci-VLESS-...
    for (const line of lines) {
        assert(line.includes("&ech="), "Should contain &ech= query parameter");
        assert(line.includes("&fm="), "Should contain &fm= query parameter");
        assert(line.includes("#Luci-VLESS-443-"), "Should contain node display name in #hash");
        assert(!line.includes("#GlobalMask"), "Must NOT put FinalMask into #hash");
    }

    // Verify first ECH entry
    const firstEchEncoded = encodeURIComponent(DEFAULT_ECH_CONFIGS[0]);
    assert(lines.some((l) => l.includes(`&ech=${firstEchEncoded}`)));
});

test("Subscription ECH & FinalMask - Custom ECH list and base config counts", async () => {
    // 3 Clean IPs + 1 Primary = 4 base configs
    // 2 custom ECH configs -> 4 × 2 = 8 total configs
    const customEch = [
        "custom-ech-1.org+udp://1.1.1.1",
        "custom-ech-2.org+udp://8.8.8.8"
    ];

    const config = {
        ...SYSTEM_DEFAULTS,
        deviceId: "d0000000-0000-4000-8000-000000000002",
        apiRoute: "sync",
        cleanIps: "104.16.1.1\n104.16.1.2\n104.16.1.3", // 3 Clean IPs
        socketPorts: "443",
        mode: "alpha",
        echConfigList: customEch,
        finalMask: "", // Empty: falls back to #<vName>
    };

    const uris = await buildUriProfile("my-host.com", null, false, config);
    const lines = uris.split("\n").filter((l) => l.startsWith("vless://"));

    // 4 base endpoints × 2 ECH configs = 8 configs
    assert.equal(lines.length, 8);

    // Verify custom ECH params present
    assert(lines.every((l) => l.includes("&ech=")));
    // When finalMask is empty, fragment is tag name (e.g. #Luci-VLESS-443-...)
    assert(lines.every((l) => l.includes("#Luci-VLESS-443-")));

    // Test with 3 ECH configs -> 4 base × 3 ECH = 12 configs
    const config3 = {
        ...config,
        echConfigList: [...customEch, "custom-ech-3.org+udp://9.9.9.9"]
    };
    const uris3 = await buildUriProfile("my-host.com", null, false, config3);
    const lines3 = uris3.split("\n").filter((l) => l.startsWith("vless://"));
    assert.equal(lines3.length, 12);
});

test("Subscription ECH - Empty ECH list produces base configs without &ech=", async () => {
    const config = {
        ...SYSTEM_DEFAULTS,
        deviceId: "d0000000-0000-4000-8000-000000000003",
        apiRoute: "sync",
        cleanIps: "www.speedtest.net", // 1 clean IP + 1 primary = 2 base configs
        socketPorts: "443",
        mode: "alpha",
        echConfigList: [], // Explicitly empty
    };

    const uris = await buildUriProfile("edge.example.com", null, false, config);
    const lines = uris.split("\n").filter((l) => l.startsWith("vless://"));

    // 2 base configs × 1 = 2 configs without &ech=
    assert.equal(lines.length, 2);
    assert(!lines[0].includes("&ech="));
    assert(!lines[1].includes("&ech="));
    assert(lines[0].includes("#Luci-VLESS-443-"));
    assert(lines[1].includes("#Luci-VLESS-443-"));
});

test("Subscription ECH & FinalMask - Per-subscription override takes precedence over global", async () => {
    const globalEch = ["global.com+udp://1.1.1.1"];
    const userEch = ["user-override.com+udp://8.8.8.8", "user-override-2.com+udp://8.8.4.4"];

    const config = {
        ...SYSTEM_DEFAULTS,
        apiRoute: "sync",
        cleanIps: "1.2.3.4",
        echConfigList: globalEch,
        finalMask: {
            packets: "tlshello",
            lengths: ["40-80"],
            delays: ["20-40"]
        },
        users: [
            {
                id: "u-1111-2222-3333-4444",
                name: "Bob",
                cleanIp: "www.speedtest.net", // 1 clean + 1 primary = 2 base
                echConfigList: userEch, // Per-user override
                finalMask: {
                    packets: "tlshello",
                    lengths: ["101-123"],
                    delays: ["7-9"],
                    maxSplit: 17
                },
            }
        ]
    };

    const uris = await buildUriProfile("panel.domain.com", "Bob", false, config);
    const lines = uris.split("\n").filter((l) => l.startsWith("vless://"));

    // 2 base configs × 2 user ECH configs = 4 configs
    assert.equal(lines.length, 4);

    // Each line should contain userEch and user FinalMask (101-123,7-9,tlshello,17), NOT globalEch or global FinalMask
    for (const line of lines) {
        assert(!line.includes("global.com"), "Should not contain global ECH");
        assert(line.includes("user-override.com") || line.includes("user-override-2.com"), "Should contain user ECH");
        assert(line.includes("101-123"), "Should contain per-user FinalMask lengths");
        assert(line.includes("7-9"), "Should contain per-user FinalMask delays");
        assert(!line.includes("40-80"), "Should not contain global FinalMask lengths");
        assert(line.includes("#Luci-Bob-VLESS-443-"), "Should contain per-user node name in #hash");
    }
});

test("Users API - Newly created subscriber defaults cleanIp to www.speedtest.net", async () => {
    const sysConfig = { ...SYSTEM_DEFAULTS, masterKey: "secret-key", users: [] };
    const env = createMockEnv(sysConfig);
    setCachedConfig(sysConfig);

    // POST without cleanIp
    const req1 = new Request("https://worker.test/sync/api/users", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "Authorization": "Bearer secret-key"
        },
        body: JSON.stringify({ name: "UserWithoutCleanIp" })
    });

    const res1 = await handleUsersApi(req1, env, mockCtx, sysConfig);
    assert.equal(res1.status, 201);
    const data1 = await res1.json();
    assert.equal(data1.success, true);
    assert.equal(data1.user.cleanIp, "www.speedtest.net");

    // POST with empty string cleanIp
    const req2 = new Request("https://worker.test/sync/api/users", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "Authorization": "Bearer secret-key"
        },
        body: JSON.stringify({ name: "UserWithBlankCleanIp", cleanIp: "   " })
    });

    const res2 = await handleUsersApi(req2, env, mockCtx, sysConfig);
    assert.equal(res2.status, 201);
    const data2 = await res2.json();
    assert.equal(data2.user.cleanIp, "www.speedtest.net");

    // POST with custom cleanIp
    const req3 = new Request("https://worker.test/sync/api/users", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "Authorization": "Bearer secret-key"
        },
        body: JSON.stringify({ name: "UserWithCustomCleanIp", cleanIp: "104.16.1.1" })
    });

    const res3 = await handleUsersApi(req3, env, mockCtx, sysConfig);
    assert.equal(res3.status, 201);
    const data3 = await res3.json();
    assert.equal(data3.user.cleanIp, "104.16.1.1");
});

test("Diagnostics - /sync/api/proxy-ip/test route returns structured JSON", async () => {
    const testConfig = { ...SYSTEM_DEFAULTS, masterKey: "master-pass", apiRoute: "sync" };
    const env = createMockEnv(testConfig);
    setCachedConfig(testConfig);

    // Mock socket connector
    setSocketConnector(({ hostname, port }) => {
        let closed = false;
        const responseData = new TextEncoder().encode("HTTP/1.1 400 Bad Request\r\nServer: cloudflare\r\ncf-ray: 9912345678-AMS\r\n\r\n");
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
        // 1. Authorized GET /sync/api/proxy-ip/test
        const req = new Request("https://worker.test/sync/api/proxy-ip/test?target=104.28.155.81&attempts=2", {
            method: "GET",
            headers: { "Authorization": "Bearer master-pass" }
        });
        const res = await worker.fetch(req, env, mockCtx);
        assert.equal(res.status, 200);
        assert.equal(res.headers.get("Content-Type"), "application/json;charset=utf-8");

        const data = await res.json();
        assert.equal(data.ok, true);
        assert.equal(data.status, "reachable");
        assert.equal(typeof data.latency_ms, "number");
        assert.equal(data.ip, "104.28.155.81");
        assert.equal(data.port, 443);
        assert.equal(data.data.successRate, "2/2");

        // 2. Unauthorized GET returns 401 JSON (never HTML)
        const unauthReq = new Request("https://worker.test/sync/api/proxy-ip/test?target=104.28.155.81", {
            method: "GET",
            headers: { "Authorization": "Bearer wrong-key" }
        });
        const unauthRes = await worker.fetch(unauthReq, env, mockCtx);
        assert.equal(unauthRes.status, 401);
        const unauthData = await unauthRes.json();
        assert.equal(unauthData.ok, false);
        assert.equal(unauthData.error, "Unauthorized");

        // 3. OPTIONS preflight returns 204
        const optReq = new Request("https://worker.test/sync/api/proxy-ip/test", { method: "OPTIONS" });
        const optRes = await worker.fetch(optReq, env, mockCtx);
        assert.equal(optRes.status, 204);
    } finally {
        setSocketConnector(null);
    }
});
