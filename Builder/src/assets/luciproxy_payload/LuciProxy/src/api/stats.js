/**
 * LuciProxy - System Statistics & Metrics API
 * Real-time usage aggregation, edge geolocation, and metrics endpoint.
 *
 * Independent implementation authored specifically for LuciProxy.
 */

import { CURRENT_VERSION } from "../config.js";
import { getCachedUsage } from "../db/d1.js";
import { activeConns } from "../users/manager.js";

export async function handleStatsApi(request, env, sysConfig) {
    try {
        const ip = request.headers.get("cf-connecting-ip") || "Unknown";
        const colo = request.cf?.colo || "Local";
        const country = request.cf?.country || "XX";
        const city = request.cf?.city || "Unknown";

        const users = sysConfig.users || [];
        const totalUsers = users.length;
        const activeUsersCount = users.filter((u) => !u.isPaused).length;

        const sysUsageCache = getCachedUsage();
        let totalTrafficBytes = 0;
        if (sysUsageCache?.users) {
            for (const u of Object.values(sysUsageCache.users)) {
                totalTrafficBytes += (u.bytes || 0);
            }
        }


        let liveConnections = 0;
        for (const count of activeConns.values()) {
            liveConnections += count;
        }

        const metrics = {
            totalUsers,
            activeUsers: activeUsersCount,
            liveConnections,
            totalTrafficBytes,
            totalTrafficGb: (totalTrafficBytes / 1073741824).toFixed(2),
        };

        const url = new URL(request.url);
        if (url.searchParams.get("cfUsage") === "1" || env.CF_ACCOUNT_ID || sysConfig.accID) {
            const cfUsage = await getCfWorkerUsage(env, sysConfig, url.hostname);
            if (cfUsage.success) {
                metrics.cfWorkerUsage = {
                    totalRequests: cfUsage.total,
                    workerRequests: cfUsage.worker,
                    freeQuotaLimit: 100000,
                    percentUsed: Math.ceil(((cfUsage.worker || 0) / 100000) * 100)
                };
            }
        }

        return new Response(
            JSON.stringify({
                success: true,
                version: CURRENT_VERSION,
                name: sysConfig.name || "LuciProxy",
                status: sysConfig.isPaused ? "paused" : "running",
                maintenanceMode: Boolean(sysConfig.maintenanceMode),
                edge: {
                    ip,
                    colo,
                    location: `${city}, ${country}`,
                },
                metrics,
            }),
            {
                status: 200,
                headers: {
                    "Content-Type": "application/json",
                    "Cache-Control": "no-store",
                },
            }
        );
    } catch (err) {
        return new Response(JSON.stringify({ success: false, error: err.message }), {
            status: 500,
            headers: { "Content-Type": "application/json" },
        });
    }
}

/**
 * Queries Cloudflare GraphQL Analytics API for 24h Worker invocations.
 */
export async function getCfWorkerUsage(env, sysConfig, hostname) {
    const accID = env.CF_ACCOUNT_ID || sysConfig.accID || "";
    const apiToken = env.CF_API_TOKEN || sysConfig.apiToken || "";
    const scriptName = sysConfig.scriptName || (hostname ? hostname.split(".")[0] : "luciproxy");

    if (!accID || !apiToken) {
        return { success: false, error: "Missing Cloudflare Account ID or API Token" };
    }

    try {
        const now = new Date();
        const datetimeEnd = now.toISOString();
        const datetimeStart = new Date(now.getTime() - 24 * 60 * 60 * 1000).toISOString();

        const gqlQuery = {
            query: `
                query GetUsage($accountTag: String!, $scriptName: String!, $start: String!, $end: String!) {
                    viewer {
                        accounts(filter: { accountTag: $accountTag }) {
                            total: workersInvocationsAdaptive(
                                limit: 100
                                filter: { datetime_geq: $start, datetime_leq: $end }
                            ) {
                                sum { requests }
                            }
                            worker: workersInvocationsAdaptive(
                                limit: 100
                                filter: { scriptName: $scriptName, datetime_geq: $start, datetime_leq: $end }
                            ) {
                                sum { requests }
                            }
                        }
                    }
                }
            `,
            variables: {
                accountTag: accID,
                scriptName,
                start: datetimeStart,
                end: datetimeEnd,
            },
        };

        const gqlRes = await fetch(`https://api.cloudflare.com/client/v4/graphql?nocache=${Date.now()}`, {
            method: "POST",
            headers: {
                Authorization: `Bearer ${apiToken}`,
                "Content-Type": "application/json",
            },
            body: JSON.stringify(gqlQuery),
        });

        const gqlData = await gqlRes.json();
        const account = gqlData?.data?.viewer?.accounts?.[0];

        const totalRequests = (account?.total ?? []).reduce(
            (sum, entry) => sum + (entry?.sum?.requests || 0),
            0
        );
        const workerRequests = (account?.worker ?? []).reduce(
            (sum, entry) => sum + (entry?.sum?.requests || 0),
            0
        );

        return { success: true, total: totalRequests, worker: workerRequests };
    } catch (error) {
        return { success: false, error: error.message || "Failed to fetch CF usage" };
    }
}
