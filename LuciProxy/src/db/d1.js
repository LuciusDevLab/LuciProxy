/**
 * LuciProxy - Database Persistence & Configuration State Cache
 * High-performance Cloudflare D1 SQLite abstraction with structured TTL caching.
 *
 * Independent implementation authored specifically for LuciProxy.
 */

import {
    SYSTEM_DEFAULTS,
    CACHE_TTL_CONFIG,
    CACHE_TTL_USAGE,
    CACHE_TTL_BACKUP_IP
} from "../config.js";

/**
 * In-memory state storage and fallback driver
 */
class StateStore {
    constructor() {
        this.memoryMap = new Map();
        this.activeConfig = { ...SYSTEM_DEFAULTS };
        this.configTimestamp = 0;
        this.configPromise = null;

        this.usageCache = { users: {} };
        this.usageTimestamp = 0;
        this.usagePromise = null;

        this.relayIpCache = null;
        this.relayIpTimestamp = 0;
        this.relayIpPromise = null;
    }

    reset() {
        this.memoryMap.clear();
        this.activeConfig = { ...SYSTEM_DEFAULTS };
        this.configTimestamp = 0;
        this.configPromise = null;
        this.usageCache = { users: {} };
        this.usageTimestamp = 0;
        this.usagePromise = null;
        this.relayIpCache = null;
        this.relayIpTimestamp = 0;
        this.relayIpPromise = null;
    }
}

const store = new StateStore();

/**
 * Resolves the active Cloudflare D1 database binding from the runtime environment.
 * Supports primary IOT_DB and alternative DB bindings.
 * @param {object} env Worker environment bindings
 * @returns {object|null} D1 database handle or null
 */
export function getDbBinding(env) {
    if (!env || typeof env !== "object") return null;
    return env.IOT_DB || env.DB || null;
}

/**
 * Prepares the relational key-value schema in Cloudflare D1 if not already initialized.
 * @param {object} env Worker environment bindings
 */
export async function d1Init(env) {
    const database = getDbBinding(env);
    if (!database || env._D1_INITIALIZED) return;

    try {
        await database.prepare(
            "CREATE TABLE IF NOT EXISTS kv_store (key TEXT PRIMARY KEY, value TEXT)"
        ).run();
        env._D1_INITIALIZED = true;
    } catch {
        // Fallback flag set to prevent repeated DDL overhead
        env._D1_INITIALIZED = true;
    }
}

/**
 * Retrieves a string value associated with the given key from D1 or in-memory fallback.
 * @param {object} env Worker environment bindings
 * @param {string} key Key identifier
 * @returns {Promise<string|null>} Stored value or null
 */
export async function d1Get(env, key) {
    const database = getDbBinding(env);
    if (!database) {
        return store.memoryMap.get(key) || null;
    }

    await d1Init(env);
    try {
        const query = database.prepare("SELECT value FROM kv_store WHERE key = ?");
        const { results } = await query.bind(key).all();
        if (results && results.length > 0 && results[0]?.value !== undefined) {
            return String(results[0].value);
        }
    } catch {
        // Suppress driver read errors, return null
    }
    return null;
}

/**
 * Persists a key-value record into D1 or in-memory fallback using upsert semantics.
 * @param {object} env Worker environment bindings
 * @param {string} key Key identifier
 * @param {string|number|object} value Value to store
 */
export async function d1Put(env, key, value) {
    const stringVal = typeof value === "string" ? value : JSON.stringify(value);
    const database = getDbBinding(env);

    if (!database) {
        store.memoryMap.set(key, stringVal);
        return;
    }

    await d1Init(env);
    try {
        const statement = database.prepare(
            "INSERT INTO kv_store (key, value) VALUES (?, ?) ON CONFLICT(key) DO UPDATE SET value = excluded.value"
        );
        await statement.bind(key, stringVal).run();
    } catch {
        // Suppress driver write errors
    }
}

/**
 * Writes data to D1 and invalidates the corresponding local in-memory cache layer.
 * @param {object} env Worker environment bindings
 * @param {string} key Key identifier
 * @param {string|number|object} value Value to store
 */
export async function cachedD1Put(env, key, value) {
    await d1Put(env, key, value);

    if (key === "sys_config") {
        store.configTimestamp = 0;
    } else if (key === "sys_usage") {
        store.usageTimestamp = 0;
    } else if (key === "backup_ip") {
        store.relayIpTimestamp = 0;
    }
}

/**
 * Generates a secure random 24-character token for initial installations.
 */
function generateSecureToken() {
    try {
        const bytes = new Uint8Array(12);
        crypto.getRandomValues(bytes);
        return Array.from(bytes).map(b => b.toString(16).padStart(2, "0")).join("");
    } catch {
        return (Math.random().toString(36).slice(2) + Math.random().toString(36).slice(2)).slice(0, 24);
    }
}

/**
 * Loads system configuration, usage statistics, and backup IP with TTL-based caching.
 * Performs secure initial parameter bootstrap if running on a fresh deployment.
 * @param {object} env Worker environment bindings
 * @param {object} [ctx] Cloudflare execution context
 * @returns {Promise<{sysConfig: object, sysUsageCache: object}>}
 */
export async function loadSysConfig(env, ctx = null) {
    const currentTime = Date.now();

    // 1. Refresh System Configuration Cache
    if (currentTime - store.configTimestamp > CACHE_TTL_CONFIG) {
        if (!store.configPromise) {
            store.configPromise = (async () => {
                try {
                    const rawData = await d1Get(env, "sys_config");
                    let parsed = null;
                    if (rawData) {
                        try { parsed = JSON.parse(rawData); } catch {}
                    }

                    // Secure auto-initialization on first installation
                    const envKey = env?.MASTER_KEY || env?.INITIAL_ADMIN_KEY || "";
                    let resolvedMasterKey = parsed?.masterKey || envKey;
                    let resolvedDeviceId = parsed?.deviceId || env?.DEVICE_ID || "";

                    let needsSave = false;
                    if (!resolvedMasterKey) {
                        resolvedMasterKey = generateSecureToken();
                        needsSave = true;
                    }
                    if (!resolvedDeviceId) {
                        resolvedDeviceId = crypto.randomUUID ? crypto.randomUUID() : generateSecureToken();
                        needsSave = true;
                    }

                    store.activeConfig = {
                        ...SYSTEM_DEFAULTS,
                        ...(parsed || {}),
                        masterKey: resolvedMasterKey,
                        deviceId: resolvedDeviceId,
                    };

                    if (needsSave && getDbBinding(env)) {
                        await d1Put(env, "sys_config", JSON.stringify(store.activeConfig)).catch(() => {});
                    }
                } catch {
                    store.activeConfig = { ...SYSTEM_DEFAULTS };
                } finally {
                    store.configTimestamp = Date.now();
                    store.configPromise = null;
                }
            })();
        }
        await store.configPromise;
    }

    // 2. Refresh Usage Tracking Cache
    if (currentTime - store.usageTimestamp > CACHE_TTL_USAGE) {
        if (!store.usagePromise) {
            store.usagePromise = (async () => {
                try {
                    const rawUsage = await d1Get(env, "sys_usage");
                    let parsedUsage = null;
                    if (rawUsage) {
                        try { parsedUsage = JSON.parse(rawUsage); } catch {}
                    }
                    store.usageCache = parsedUsage && typeof parsedUsage === "object" ? parsedUsage : { users: {} };
                } catch {
                    store.usageCache = { users: {} };
                } finally {
                    store.usageTimestamp = Date.now();
                    store.usagePromise = null;
                }
            })();
        }
        await store.usagePromise;
    }

    // 3. Refresh Relay IP Cache
    if (currentTime - store.relayIpTimestamp > CACHE_TTL_BACKUP_IP) {
        if (!store.relayIpPromise) {
            store.relayIpPromise = (async () => {
                try {
                    const rawIp = await d1Get(env, "backup_ip");
                    store.relayIpCache = rawIp ? String(rawIp).trim() : null;
                } catch {
                    store.relayIpCache = null;
                } finally {
                    store.relayIpTimestamp = Date.now();
                    store.relayIpPromise = null;
                }
            })();
        }
        await store.relayIpPromise;
    }

    // Apply active relay IP override
    if (store.relayIpCache || env?.RELAY_IP) {
        store.activeConfig.customRelay = store.relayIpCache ?? env.RELAY_IP ?? "";
    }

    return {
        sysConfig: store.activeConfig,
        sysUsageCache: store.usageCache
    };
}

/**
 * Returns the currently active cached configuration object.
 */
export function getCachedConfig() {
    return store.activeConfig;
}

/**
 * Updates the in-memory cached configuration object immediately.
 * @param {object} newConfig Configuration properties to merge
 */
export function setCachedConfig(newConfig) {
    store.activeConfig = { ...SYSTEM_DEFAULTS, ...newConfig };
    store.configTimestamp = Date.now();
}

/**
 * Returns the currently cached usage metrics.
 */
export function getCachedUsage() {
    return store.usageCache;
}

/**
 * Updates the in-memory usage metrics cache immediately.
 * @param {object} newUsage Usage tracking object
 */
export function setCachedUsage(newUsage) {
    store.usageCache = newUsage;
    store.usageTimestamp = Date.now();
}
