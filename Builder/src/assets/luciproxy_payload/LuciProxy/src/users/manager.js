/**
 * LuciProxy - Multi-User Profile Engine & Traffic Accounting
 * Independent profile resolution, bandwidth tracking, quota enforcement, and administration API.
 *
 * Independent implementation authored specifically for LuciProxy.
 */

import {
    usageTotalBytes,
    usageDailyBytes,
    limitReqToBytes,
    REQ_BYTES_EST
} from "../utils/helpers.js";
import {
    getCachedConfig,
    setCachedConfig,
    getCachedUsage,
    setCachedUsage,
    cachedD1Put,
    getDbBinding
} from "../db/d1.js";
import { isAuthorized } from "../auth/auth.js";
import { logActivity } from "../api/logs.js";

// Concurrency tracking: active live socket streams per user UUID
export const activeConns = new Map();

// Volumetric usage monitor: connection attempt records per user UUID
export const uuidUsage = new Map();

// Timestamp of last D1 database usage synchronization
let lastPersistenceSyncTime = 0;

/**
 * Normalizes UUID strings into clean lowercase alphanumeric format without dashes.
 */
function normalizeIdentifier(rawId) {
    return String(rawId || "").replace(/[^a-zA-Z0-9]/g, "").toLowerCase();
}

/**
 * Resolves active subscriber profiles matching eligibility criteria (expiry, pause, quota).
 * @param {object} sysConfig System configuration dictionary
 * @param {string} [targetSubscriber] Optional subscriber name or ID filter
 * @returns {Array<object>} Array of eligible profile objects
 */
export function getAllProfiles(sysConfig, targetSubscriber = null) {
    const defaultId = sysConfig.deviceId || "00000000-0000-4000-8000-000000000000";
    const profiles = [{ id: defaultId, name: "Default" }];
    const usageData = getCachedUsage();

    const userList = Array.isArray(sysConfig?.users) ? sysConfig.users : [];
    if (userList.length > 0) {
        const currentTime = Date.now();
        const dateKey = new Date().toISOString().split("T")[0];

        for (const account of userList) {
            if (!account?.id) continue;

            // 1. Lifecycle checks: pause state and expiration date
            if (account.isPaused) continue;
            if (account.expiryMs && currentTime > account.expiryMs) continue;

            const userKey = normalizeIdentifier(account.id);
            const userMetrics = usageData?.users?.[userKey];

            // 2. Volumetric and request limit enforcement
            if (account.limitTotalReq && userMetrics) {
                if (usageTotalBytes(userMetrics) >= limitReqToBytes(account.limitTotalReq)) {
                    continue;
                }
            }

            if (account.limitDailyReq && userMetrics) {
                const dailyUsage = usageDailyBytes(userMetrics, dateKey);
                if (userMetrics.lastDay === dateKey && dailyUsage >= limitReqToBytes(account.limitDailyReq)) {
                    continue;
                }
            }

            if (account.dailyQuotaBytes && userMetrics) {
                const recordedBytes = userMetrics.dBytes || 0;
                if (userMetrics.lastDay === dateKey && recordedBytes >= account.dailyQuotaBytes) {
                    continue;
                }
            }

            // 3. User is eligible; format profile entry
            profiles.push({
                id: account.id,
                name: account.name || "Subscriber",
                proxyIp: account.proxyIp || "",
                cleanIp: account.cleanIp || null,
                userMode: account.userMode || null,
                userPorts: account.userPorts || null,
                maxConfigs: account.maxConfigs || null,
                proxyIpGeo: account.proxyIpGeo || null,
                userNodes: account.userNodes || null,
                nat64: account.nat64 || null,
                connLimit: account.connLimit || null,
                userPanelUrl: account.userPanelUrl || null,
                ipOperator: account.ipOperator || "all",
                ipCount: account.ipCount || null,
                userProxyIata: account.userProxyIata || null,
                userSocks5: account.userSocks5 || null,
                dailyQuotaBytes: account.dailyQuotaBytes || null,
                echConfigList: Array.isArray(account.echConfigList) ? account.echConfigList : null,
                finalMask: typeof account.finalMask === "string"
                    ? account.finalMask
                    : (account.finalMask && typeof account.finalMask === "object" ? account.finalMask : null),
            });
        }
    }

    if (!targetSubscriber) {
        return profiles;
    }

    const targetKey = String(targetSubscriber).toLowerCase().trim();
    return profiles.filter((p) =>
        p.name.toLowerCase() === targetKey || p.id.toLowerCase() === targetKey
    );
}

/**
 * Parses clean CDN IP strings into a normalized array of addresses.
 * @param {string} hostName Current edge hostname
 * @param {string} [customIpList] Per-user override IP string
 * @param {object} sysConfig System configuration
 * @returns {Array<string>} Clean destination IP list
 */
export function getCleanIps(hostName, customIpList = null, sysConfig = null) {
    const rawContent = customIpList || sysConfig?.cleanIps || "";
    const parsed = rawContent
        .split(/[\r\n,;]+/)
        .map((entry) => {
            const trimmed = entry.trim();
            return trimmed ? trimmed.split("#")[0].trim() : "";
        })
        .filter(Boolean);

    if (parsed.length === 0) {
        const fallback = hostName?.endsWith(".pages.dev")
            ? (sysConfig?.metricNode || "time.is")
            : hostName;
        return [fallback || "127.0.0.1"];
    }
    return parsed;
}

/**
 * Parses clean CDN IP strings into objects retaining optional descriptive labels.
 * @param {string} hostName Current edge hostname
 * @param {string} [customIpList] Per-user override IP string
 * @param {object} sysConfig System configuration
 * @returns {Array<{ip: string, name: string}>} Array of IP objects with labels
 */
export function getCleanIpsWithNames(hostName, customIpList = null, sysConfig = null) {
    const rawContent = customIpList || sysConfig?.cleanIps || "";
    const results = rawContent
        .split(/[\r\n,;]+/)
        .map((entry) => {
            const line = entry.trim();
            if (!line) return null;
            const segments = line.split("#");
            const address = segments[0].trim();
            const tag = (segments[1] || "").trim();
            return address ? { ip: address, name: tag } : null;
        })
        .filter(Boolean);

    if (results.length === 0) {
        const fallback = hostName?.endsWith(".pages.dev")
            ? (sysConfig?.metricNode || "time.is")
            : hostName;
        return [{ ip: fallback || "127.0.0.1", name: "" }];
    }
    return results;
}

/**
 * Resolves all eligible hostnames associated with a profile, including user-defined nodes.
 * @param {string} hostName Base edge worker hostname
 * @param {object} profile Profile descriptor
 * @returns {Array<string>} Unique hostname list
 */
export function getProfileHostNames(hostName, profile) {
    const hostList = [hostName];
    if (profile?.userNodes) {
        const extraHosts = profile.userNodes
            .split(/[\r\n,;]+/)
            .map((h) => h.trim())
            .filter(Boolean);
        hostList.push(...extraHosts);
    }
    return [...new Set(hostList)];
}

/**
 * Resolves upstream proxy IP addresses configured for a subscriber or system fallback.
 * @param {object} profile Profile descriptor
 * @param {object} sysConfig System configuration
 * @returns {Array<string>} Upstream proxy IP endpoints
 */
export function getEffectivePips(profile, sysConfig) {
    const rawSource = profile?.proxyIp || sysConfig?.backupRelay || sysConfig?.customRelay || "";
    return rawSource
        .split(/[\r\n,;]+/)
        .map((addr) => addr.trim())
        .filter(Boolean);
}

/**
 * Calculates the balanced slice of clean IPs to prevent client configuration bloating.
 */
export function calcEffectiveIps(ips, maxConfigs, mode, ports, pipsCount = 1) {
    if (!maxConfigs || maxConfigs <= 0) return ips;
    const modeFactor = mode === "both" ? 2 : 1;
    const portsFactor = Array.isArray(ports) ? ports.length : 1;
    const pipFactor = pipsCount > 0 ? pipsCount : 1;
    const multiplier = modeFactor * portsFactor * pipFactor;
    const allowedLimit = Math.max(1, Math.floor(maxConfigs / multiplier));
    return ips.slice(0, allowedLimit);
}

/**
 * Increments volumetric bytes and connection counts for an authenticated profile.
 * Debounces database writes to Cloudflare D1 to optimize edge write frequency.
 * @param {string} uuid User identifier
 * @param {number} bytes Incremental bytes transferred (0 indicates connection event)
 * @param {object} env Worker environment bindings
 * @param {object} [ctx] Execution context for waitUntil persistence
 */
export function trackUsage(uuid, bytes, env, ctx) {
    const store = getCachedUsage();
    if (!store.users) store.users = {};

    const userKey = normalizeIdentifier(uuid);
    if (!userKey) return;

    const dateKey = new Date().toISOString().split("T")[0];

    if (!store.users[userKey]) {
        store.users[userKey] = {
            reqs: 0,
            dReqs: 0,
            bytes: 0,
            dBytes: 0,
            lastDay: dateKey,
        };
    }

    const record = store.users[userKey];

    // Reset daily counters on date boundary
    if (record.lastDay !== dateKey) {
        record.dReqs = 0;
        record.dBytes = 0;
        record.lastDay = dateKey;
    }

    // Initialize numeric values if malformed
    if (typeof record.bytes !== "number" || record.bytes < 0) {
        record.bytes = Math.floor((record.reqs || 0) * REQ_BYTES_EST);
    }
    if (typeof record.dBytes !== "number" || record.dBytes < 0) {
        record.dBytes = record.lastDay === dateKey ? Math.floor((record.dReqs || 0) * REQ_BYTES_EST) : 0;
    }

    if (bytes === 0) {
        record.reqs = (record.reqs || 0) + 1;
        record.dReqs = (record.dReqs || 0) + 1;
    } else if (typeof bytes === "number" && bytes > 0) {
        const added = Math.floor(bytes);
        record.bytes += added;
        record.dBytes += added;
    }

    setCachedUsage(store);

    // Debounced database sync (minimum 30 seconds interval)
    const now = Date.now();
    if (now - lastPersistenceSyncTime > 30000) {
        lastPersistenceSyncTime = now;
        const database = getDbBinding(env);
        if (database) {
            const config = getCachedConfig();
            let configModified = false;

            if (Array.isArray(config.users) && config.users.length > 0) {
                config.users.forEach((u) => {
                    if (u.isPaused) return;

                    const uKey = normalizeIdentifier(u.id);
                    const metrics = store.users[uKey];
                    let lockoutReason = null;

                    if (u.expiryMs && Date.now() > u.expiryMs) {
                        lockoutReason = `Expiration date reached (${new Date(u.expiryMs).toLocaleDateString()})`;
                    } else if (metrics && u.limitTotalReq && usageTotalBytes(metrics) >= limitReqToBytes(u.limitTotalReq)) {
                        const usedGb = (usageTotalBytes(metrics) / 1073741824).toFixed(2);
                        const maxGb = (limitReqToBytes(u.limitTotalReq) / 1073741824).toFixed(2);
                        lockoutReason = `Traffic limit exceeded (${usedGb}GB / ${maxGb}GB)`;
                    }

                    if (lockoutReason) {
                        u.isPaused = true;
                        u.disabledReason = lockoutReason;
                        u.disabledAt = Date.now();
                        configModified = true;

                        if (ctx?.waitUntil) {
                            ctx.waitUntil(
                                logActivity(
                                    env,
                                    "User Auto-Disabled",
                                    `User "${u.name}" (${u.id}) auto-disabled: ${lockoutReason}`
                                ).catch(() => {})
                            );
                        }
                    }
                });
            }

            const writeUsage = cachedD1Put(env, "sys_usage", JSON.stringify(store));
            const writeConfig = configModified
                ? cachedD1Put(env, "sys_config", JSON.stringify(config))
                : Promise.resolve();

            if (ctx?.waitUntil) {
                ctx.waitUntil(Promise.all([writeUsage, writeConfig]).catch(() => {}));
            }
        }
    }
}

/**
 * Administrative API endpoint for full user and profile CRUD lifecycle management.
 * @param {Request} request Incoming HTTP request
 * @param {object} env Worker environment bindings
 * @param {object} ctx Execution context
 * @param {object} sysConfig System configuration
 * @returns {Promise<Response>} JSON response
 */
export async function handleUsersApi(request, env, ctx, sysConfig) {
    try {
        const url = new URL(request.url);
        const httpMethod = request.method;
        const userId = url.searchParams.get("id");
        const action = url.searchParams.get("action");

        let payload = null;
        if (httpMethod === "POST" || httpMethod === "PUT") {
            try { payload = await request.clone().json(); } catch {}
        }

        // Validate administrative authorization token
        if (!isAuthorized(request, sysConfig, payload)) {
            return new Response(JSON.stringify({ success: false, error: "Unauthorized" }), {
                status: 401,
                headers: { "Content-Type": "application/json" },
            });
        }

        const usageStore = getCachedUsage();

        // 1. GET /api/users: Retrieve user catalog with enriched usage metrics
        if (httpMethod === "GET" && !userId) {
            const query = (url.searchParams.get("q") || "").toLowerCase().trim();
            let catalog = sysConfig.users || [];

            if (query) {
                catalog = catalog.filter((user) =>
                    user.name.toLowerCase().includes(query) ||
                    user.id.toLowerCase().includes(query) ||
                    (user.notes && user.notes.toLowerCase().includes(query))
                );
            }

            const enrichedUsers = catalog.map((account) => {
                const uKey = normalizeIdentifier(account.id);
                const metrics = usageStore?.users?.[uKey] || { reqs: 0, dReqs: 0, lastDay: "" };
                const usedVolume = usageTotalBytes(metrics);
                const limitVolume = limitReqToBytes(account.limitTotalReq);
                const isPastExpiry = account.expiryMs && Date.now() > account.expiryMs;

                let accountStatus = "active";
                if (account.isPaused && account.disabledReason) {
                    accountStatus = "auto-disabled";
                } else if (account.isPaused) {
                    accountStatus = "paused";
                } else if (isPastExpiry) {
                    accountStatus = "expired";
                }

                return {
                    ...account,
                    usage: {
                        total: usedVolume,
                        limit: limitVolume,
                        daily: metrics.dReqs || 0,
                        dailyLimit: account.limitDailyReq || 0,
                    },
                    status: accountStatus,
                };
            });

            return new Response(
                JSON.stringify({ success: true, users: enrichedUsers, total: enrichedUsers.length }),
                { headers: { "Content-Type": "application/json" } }
            );
        }

        // 2. GET /api/users?id=...: Retrieve individual user details
        if (httpMethod === "GET" && userId) {
            const targetId = userId.toLowerCase().trim();
            const foundUser = (sysConfig.users || []).find(
                (u) => u.id.toLowerCase() === targetId || u.name.toLowerCase() === targetId
            );
            if (!foundUser) {
                return new Response(JSON.stringify({ success: false, error: "User not found" }), {
                    status: 404,
                    headers: { "Content-Type": "application/json" },
                });
            }
            return new Response(JSON.stringify({ success: true, user: foundUser }), {
                headers: { "Content-Type": "application/json" },
            });
        }

        // 3. POST /api/users: Register a new subscriber profile
        if (httpMethod === "POST" && !action) {
            const generatedId = payload?.id || (crypto.randomUUID ? crypto.randomUUID() : `usr_${Date.now()}`);
            const newSubscriber = {
                id: generatedId,
                name: payload?.name || "Subscriber",
                limitTotalReq: Number(payload?.limitTotalReq) || 0,
                limitDailyReq: Number(payload?.limitDailyReq) || 0,
                dailyQuotaBytes: Number(payload?.dailyQuotaBytes) || 0,
                expiryMs: Number(payload?.expiryMs) || 0,
                proxyIp: payload?.proxyIp || "",
                cleanIp: (payload?.cleanIp !== undefined && payload?.cleanIp !== null && String(payload.cleanIp).trim() !== "")
                    ? String(payload.cleanIp).trim()
                    : "www.speedtest.net",
                echConfigList: Array.isArray(payload?.echConfigList) ? payload.echConfigList : null,
                finalMask: typeof payload?.finalMask === "string"
                    ? payload.finalMask.trim()
                    : (payload?.finalMask && typeof payload.finalMask === "object" ? payload.finalMask : ""),
                userMode: payload?.userMode || null,
                userPorts: payload?.userPorts || null,
                maxConfigs: payload?.maxConfigs ? Number(payload.maxConfigs) : null,
                connLimit: payload?.connLimit ? Number(payload.connLimit) : null,
                userNodes: payload?.userNodes || "",
                nat64: payload?.nat64 || "",
                ipOperator: payload?.ipOperator || "all",
                ipCount: payload?.ipCount ? Number(payload.ipCount) : null,
                userProxyIata: payload?.userProxyIata || "",
                userSocks5: payload?.userSocks5 || "",
                autoResetVolDays: Number(payload?.autoResetVolDays) || 0,
                autoResetReqDays: Number(payload?.autoResetReqDays) || 0,
                notes: payload?.notes || "",
                isPaused: false,
                createdAt: Date.now(),
            };

            if (!sysConfig.users) sysConfig.users = [];
            sysConfig.users.push(newSubscriber);
            setCachedConfig(sysConfig);
            await cachedD1Put(env, "sys_config", JSON.stringify(sysConfig));
            await logActivity(env, "User Created", `Registered subscriber "${newSubscriber.name}" (${newSubscriber.id})`);

            return new Response(JSON.stringify({ success: true, user: newSubscriber }), {
                status: 201,
                headers: { "Content-Type": "application/json" },
            });
        }

        // 4. PUT /api/users?id=...: Update an existing subscriber profile
        if (httpMethod === "PUT" && userId) {
            if (!sysConfig.users) sysConfig.users = [];
            const index = sysConfig.users.findIndex((u) => u.id === userId);
            if (index === -1) {
                return new Response(JSON.stringify({ success: false, error: "User not found" }), {
                    status: 404,
                    headers: { "Content-Type": "application/json" },
                });
            }

            sysConfig.users[index] = {
                ...sysConfig.users[index],
                ...payload,
                id: userId, // ID remains immutable
            };

            setCachedConfig(sysConfig);
            await cachedD1Put(env, "sys_config", JSON.stringify(sysConfig));
            await logActivity(env, "User Updated", `Updated subscriber "${sysConfig.users[index].name}" (${userId})`);

            return new Response(JSON.stringify({ success: true, user: sysConfig.users[index] }), {
                headers: { "Content-Type": "application/json" },
            });
        }

        // 5. DELETE /api/users?id=...: Delete subscriber profile
        if (httpMethod === "DELETE" && userId) {
            if (!sysConfig.users) sysConfig.users = [];
            const index = sysConfig.users.findIndex((u) => u.id === userId);
            if (index === -1) {
                return new Response(JSON.stringify({ success: false, error: "User not found" }), {
                    status: 404,
                    headers: { "Content-Type": "application/json" },
                });
            }

            const removed = sysConfig.users.splice(index, 1)[0];
            setCachedConfig(sysConfig);
            await cachedD1Put(env, "sys_config", JSON.stringify(sysConfig));
            await logActivity(env, "User Deleted", `Removed subscriber "${removed.name}" (${userId})`);

            return new Response(JSON.stringify({ success: true }), {
                headers: { "Content-Type": "application/json" },
            });
        }

        // 6. POST /api/users?id=...&action=reset: Reset subscriber usage metrics
        if (httpMethod === "POST" && userId && action === "reset") {
            const uKey = normalizeIdentifier(userId);
            if (usageStore?.users?.[uKey]) {
                usageStore.users[uKey] = {
                    reqs: 0,
                    dReqs: 0,
                    bytes: 0,
                    dBytes: 0,
                    lastDay: new Date().toISOString().split("T")[0],
                };
                setCachedUsage(usageStore);
                await cachedD1Put(env, "sys_usage", JSON.stringify(usageStore));
            }
            return new Response(JSON.stringify({ success: true, message: "Usage reset" }), {
                headers: { "Content-Type": "application/json" },
            });
        }

        // 7. POST /api/users?id=...&action=toggle: Toggle subscriber pause state
        if (httpMethod === "POST" && userId && action === "toggle") {
            if (!sysConfig.users) sysConfig.users = [];
            const subscriber = sysConfig.users.find((u) => u.id === userId);
            if (!subscriber) {
                return new Response(JSON.stringify({ success: false, error: "User not found" }), {
                    status: 404,
                    headers: { "Content-Type": "application/json" },
                });
            }

            subscriber.isPaused = !subscriber.isPaused;
            if (!subscriber.isPaused) {
                subscriber.disabledReason = null;
                subscriber.disabledAt = null;
            }
            setCachedConfig(sysConfig);
            await cachedD1Put(env, "sys_config", JSON.stringify(sysConfig));
            await logActivity(
                env,
                subscriber.isPaused ? "User Paused" : "User Resumed",
                `Subscriber "${subscriber.name}" (${userId}) set to ${subscriber.isPaused ? "paused" : "active"}`
            );

            return new Response(JSON.stringify({ success: true, isPaused: subscriber.isPaused }), {
                headers: { "Content-Type": "application/json" },
            });
        }

        return new Response(JSON.stringify({ success: false, error: "Method not allowed" }), {
            status: 405,
            headers: { "Content-Type": "application/json" },
        });
    } catch (err) {
        return new Response(JSON.stringify({ success: false, error: err.message }), {
            status: 500,
            headers: { "Content-Type": "application/json" },
        });
    }
}

/**
 * Handles browser-side Radar clean IP pool ingestion (/sub-setip).
 * @param {Request} request Incoming HTTP request
 * @param {object} env Worker environment bindings
 * @param {object} ctx Execution context
 * @param {object} sysConfig System configuration
 * @returns {Promise<Response>} JSON response
 */
export async function handleSubSetIp(request, env, ctx, sysConfig) {
    try {
        if (request.method !== "POST") {
            return new Response(JSON.stringify({ success: false, error: "Method not allowed" }), {
                status: 405,
                headers: { "Content-Type": "application/json" },
            });
        }

        const url = new URL(request.url);
        const subName = url.searchParams.get("sub") || url.searchParams.get("u") || "";
        const bodyContent = await request.text();
        const addressLines = bodyContent
            .split(/[\r\n,;]+/)
            .map((s) => s.trim())
            .filter(Boolean);

        if (addressLines.length === 0) {
            return new Response(JSON.stringify({ success: false, error: "No IPs provided" }), {
                status: 400,
                headers: { "Content-Type": "application/json" },
            });
        }

        const formattedIps = addressLines.join("\n");

        if (subName) {
            if (!sysConfig.users) sysConfig.users = [];
            const targetUser = sysConfig.users.find(
                (u) => u.name.toLowerCase() === subName.toLowerCase() || u.id.toLowerCase() === subName.toLowerCase()
            );
            if (!targetUser) {
                return new Response(JSON.stringify({ success: false, error: "User not found" }), {
                    status: 404,
                    headers: { "Content-Type": "application/json" },
                });
            }
            targetUser.cleanIp = formattedIps;
            await logActivity(env, "Radar Clean IP Applied", `Updated clean IPs for user "${targetUser.name}" (${addressLines.length} IPs)`);
        } else {
            sysConfig.cleanIps = formattedIps;
            await logActivity(env, "Radar Clean IP Applied", `Updated global clean IPs (${addressLines.length} IPs)`);
        }

        setCachedConfig(sysConfig);
        await cachedD1Put(env, "sys_config", JSON.stringify(sysConfig));

        return new Response(JSON.stringify({ success: true, count: addressLines.length, message: "Clean IPs applied" }), {
            status: 200,
            headers: { "Content-Type": "application/json" },
        });
    } catch (err) {
        return new Response(JSON.stringify({ success: false, error: err.message }), {
            status: 500,
            headers: { "Content-Type": "application/json" },
        });
    }
}
