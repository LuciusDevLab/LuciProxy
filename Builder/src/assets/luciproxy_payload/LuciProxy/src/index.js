/**
 * LuciProxy - Main Cloudflare Worker Entry Point & Router
 * Central request router, WebSocket protocol upgrader, and scheduled event dispatcher.
 *
 * Independent implementation authored specifically for LuciProxy.
 */

import { CURRENT_VERSION } from "./config.js";
import { loadSysConfig, getCachedConfig, getCachedUsage, getDbBinding } from "./db/d1.js";
import { handleAuth, autoRotateSecretPaths, isAuthorized } from "./auth/auth.js";
import { handleConfigSync } from "./api/sync.js";
import { handleUsersApi, handleSubSetIp } from "./users/manager.js";
import { handleStatsApi } from "./api/stats.js";
import { handleLogs } from "./api/logs.js";
import { processTelemetryStream, processBackendStream, checkBackendHealth, testProxyIp } from "./protocols/proxy.js";
import { buildUriProfile } from "./subscriptions/uri.js";
import { buildYamlProfile } from "./subscriptions/clash.js";
import { buildSingBoxJsonProfile } from "./subscriptions/singbox.js";
import { buildVJsonProfile } from "./subscriptions/v2ray.js";
import { syncGitHubMirror } from "./subscriptions/mirror.js";
import { handleDoH } from "./protocols/doh.js";
import { generateWireguardConfig } from "./subscriptions/wireguard.js";
import { buildSharedSettingsResponse } from "./subscriptions/export.js";
import {
    renderDashboardHtml,
    renderSubscriptionHtml,
    renderError1101Html,
    renderNginxHtml
} from "./assets/loaders.js";
import { generateHardwareId, safeBtoa } from "./utils/crypto.js";
import {
    fetchT,
    usageTotalBytes,
    limitReqToBytes,
    incrementInflightHttp,
    decrementInflightHttp,
    breakerLevel
} from "./utils/helpers.js";

async function serveMaintenancePage(request, url, sysConfig) {
    if (breakerLevel() >= 1) {
        return new Response("Not Found", { status: 404 });
    }

    const camoType = (sysConfig?.camouflageType || "ubuntu").toLowerCase();
    const clientIP = request.headers.get("cf-connecting-ip") || "127.0.0.1";
    const rayId = request.headers.get("cf-ray") || null;

    if (camoType === "1101") {
        const html = renderError1101Html(url.hostname, clientIP, rayId);
        return new Response(html, {
            status: 500,
            headers: { "Content-Type": "text/html; charset=UTF-8" },
        });
    }

    if (camoType === "nginx") {
        const html = renderNginxHtml();
        return new Response(html, {
            status: 200,
            headers: { "Content-Type": "text/html; charset=UTF-8" },
        });
    }

    const fakeList = sysConfig?.maintenanceHost
        ? sysConfig.maintenanceHost
              .split(",")
              .map((s) => s.trim())
              .filter(Boolean)
        : ["https://www.ubuntu.com"];

    const ipHash = Array.from(clientIP).reduce((acc, char) => acc + char.charCodeAt(0), 0);
    const targetStr = fakeList[ipHash % fakeList.length].startsWith("http")
        ? fakeList[ipHash % fakeList.length]
        : `https://${fakeList[ipHash % fakeList.length]}`;

    try {
        const targetUrl = new URL(targetStr);
        if (url.pathname !== "/") targetUrl.pathname = url.pathname;
        targetUrl.search = url.search;

        const cleanHeaders = new Headers(request.headers);
        cleanHeaders.set("Host", targetUrl.hostname);
        cleanHeaders.delete("cf-connecting-ip");
        cleanHeaders.delete("x-forwarded-for");

        const fetchInit = {
            method: request.method,
            headers: cleanHeaders,
            redirect: "follow",
        };
        if (request.method !== "GET" && request.method !== "HEAD") {
            fetchInit.body = request.body;
        }
        return await fetchT(new Request(targetUrl.toString(), fetchInit), {}, 5000);
    } catch (e) {
        return new Response("Not Found", { status: 404 });
    }
}

export default {
    async fetch(request, env, ctx) {
        incrementInflightHttp();
        try {
            await loadSysConfig(env, ctx);
            const sysConfig = getCachedConfig();

            if (!sysConfig.deviceId) {
                sysConfig.deviceId = generateHardwareId(sysConfig.apiRoute);
            }

            const url = new URL(request.url);
            const upgradeHeader = request.headers.get("Upgrade");
            const isTelemetryStream = upgradeHeader && upgradeHeader.toLowerCase() === "websocket";

            let reqPath = url.pathname;
            if (reqPath.endsWith("/") && reqPath.length > 1) {
                reqPath = reqPath.slice(0, -1);
            }

            const subRoute = `/${encodeURI(sysConfig.apiRoute || "sync")}`;
            const adminPrefixes = Array.from(
                new Set(
                    ["/sync", subRoute, sysConfig.adminPath ? `/${encodeURI(sysConfig.adminPath)}` : null].filter(Boolean)
                )
            );

            const isDataRoute = reqPath === subRoute;
            const isDashRoute = adminPrefixes.some((p) => reqPath === `${p}/dash`);
            const isAuthRoute = adminPrefixes.some((p) => reqPath === `${p}/api/auth`);
            const isSyncRoute = adminPrefixes.some((p) => reqPath === `${p}/api/sync`);
            const isUsersRoute = adminPrefixes.some((p) => reqPath === `${p}/api/users`);
            const isStatsRoute = adminPrefixes.some((p) => reqPath === `${p}/api/stats`);
            const isLogsRoute = adminPrefixes.some((p) => reqPath === `${p}/api/logs`);
            const isSubSetIpRoute = reqPath === "/sub-setip" || adminPrefixes.some((p) => reqPath === `${p}/sub-setip`);
            const isBackendCheckRoute = adminPrefixes.some((p) => reqPath === `${p}/api/backend-check`);
            const isDohRoute = reqPath === "/dns-query" || adminPrefixes.some((p) => reqPath === `${p}/dns-query`);
            const isProxyIpTestRoute =
                reqPath === "/proxy-ip/test" ||
                reqPath === "/api/proxy-ip/test" ||
                adminPrefixes.some((p) => reqPath === `${p}/proxy-ip/test` || reqPath === `${p}/api/proxy-ip/test`);
            const isShareSettingsRoute =
                reqPath === "/share-settings" || adminPrefixes.some((p) => reqPath === `${p}/share-settings`);

            const isAuthorizedRoute =
                isDataRoute ||
                isDashRoute ||
                isAuthRoute ||
                isSyncRoute ||
                isUsersRoute ||
                isStatsRoute ||
                isLogsRoute ||
                isSubSetIpRoute ||
                isBackendCheckRoute ||
                isDohRoute ||
                isProxyIpTestRoute ||
                isShareSettingsRoute;

            // Camouflage non-authorized and non-websocket requests
            if (!isTelemetryStream && !isAuthorizedRoute) {
                return await serveMaintenancePage(request, url, sysConfig);
            }

            // Maintenance mode check
            if (sysConfig.maintenanceMode && (isTelemetryStream || isDataRoute)) {
                if (isTelemetryStream) return new Response(null, { status: 503 });
                return new Response("Maintenance in progress, retry later", {
                    status: 503,
                    headers: { "Retry-After": "120" },
                });
            }

            // 1. WebSocket Proxy Streams
            if (isTelemetryStream) {
                if (sysConfig.backendMode && sysConfig.backendUrl) {
                    const pair = new WebSocketPair();
                    const client = pair[0];
                    const server = pair[1];
                    server.accept();
                    processBackendStream(request, server, sysConfig.backendUrl, env, ctx, sysConfig);
                    return new Response(null, {
                        status: 101,
                        webSocket: client,
                    });
                }
                let wsRelayIdx = -1;
                const riParam = url.searchParams.get("ri");
                if (riParam !== null) wsRelayIdx = parseInt(riParam, 10);
                return await processTelemetryStream(request, env, ctx, wsRelayIdx, sysConfig);
            }

            // 2. Dashboard View
            if (isDashRoute) {
                const visitedPrefix = reqPath.split("/")[1] || sysConfig.apiRoute || "sync";
                const html = await renderDashboardHtml(env, CURRENT_VERSION, visitedPrefix);
                return new Response(html, {
                    headers: { "Content-Type": "text/html;charset=utf-8" },
                });
            }

            // 3. Admin Authentication Endpoint
            if (isAuthRoute) {
                if (request.method !== "POST") return new Response("Method Not Allowed", { status: 405 });
                return await handleAuth(request, url.hostname, ctx, env, sysConfig);
            }

            // 4. Config Sync Endpoint
            if (isSyncRoute) {
                if (request.method === "OPTIONS") {
                    return new Response(null, {
                        status: 204,
                        headers: {
                            "Access-Control-Allow-Origin": "*",
                            "Access-Control-Allow-Methods": "POST, OPTIONS",
                            "Access-Control-Allow-Headers": "Content-Type, Authorization",
                        },
                    });
                }
                if (request.method !== "POST") return new Response("Method Not Allowed", { status: 405 });
                return await handleConfigSync(request, env, ctx, sysConfig);
            }

            // 5. Users CRUD API
            if (isUsersRoute) {
                return await handleUsersApi(request, env, ctx, sysConfig);
            }

            // 6. System Stats API
            if (isStatsRoute) {
                return await handleStatsApi(request, env, sysConfig);
            }

            // 7. Activity Logs API
            if (isLogsRoute) {
                return await handleLogs(request, env);
            }

            // 8. Radar Clean IP Update (/sub-setip)
            if (isSubSetIpRoute) {
                return await handleSubSetIp(request, env, ctx, sysConfig);
            }

            // 9. Backend VPS Health Diagnostic API
            if (isBackendCheckRoute) {
                if (!isAuthorized(request, sysConfig)) {
                    return new Response(JSON.stringify({ success: false, error: "Unauthorized" }), {
                        status: 401,
                        headers: { "Content-Type": "application/json" },
                    });
                }
                const targetBackendUrl = url.searchParams.get("url") || sysConfig.backendUrl || "";
                const report = await checkBackendHealth(targetBackendUrl);
                return new Response(JSON.stringify(report, null, 2), {
                    status: 200,
                    headers: { "Content-Type": "application/json" },
                });
            }

            // 9.5. DNS-over-HTTPS (DoH) Endpoint
            if (isDohRoute) {
                return await handleDoH(request, sysConfig);
            }

            // 9.6. TCP Proxy-IP Health Diagnostic API
            if (isProxyIpTestRoute) {
                if (request.method === "OPTIONS") {
                    return new Response(null, {
                        status: 204,
                        headers: {
                            "Access-Control-Allow-Origin": "*",
                            "Access-Control-Allow-Methods": "GET, OPTIONS",
                            "Access-Control-Allow-Headers": "Authorization, Content-Type",
                        },
                    });
                }
                if (sysConfig.masterKey && !isAuthorized(request, sysConfig)) {
                    return new Response(
                        JSON.stringify({
                            ok: false,
                            success: false,
                            status: "unauthorized",
                            error: "Unauthorized",
                            message: "Invalid or missing credentials.",
                        }, null, 2),
                        {
                            status: 401,
                            headers: {
                                "Content-Type": "application/json;charset=utf-8",
                                "Access-Control-Allow-Origin": "*",
                            },
                        }
                    );
                }
                try {
                    const target = url.searchParams.get("target") || url.searchParams.get("ip") || "1.1.1.1";
                    const attempts = parseInt(url.searchParams.get("attempts") || "5", 10);
                    const testResult = await testProxyIp(target, Math.min(Math.max(attempts, 1), 10));
                    return new Response(JSON.stringify(testResult, null, 2), {
                        status: 200,
                        headers: {
                            "Content-Type": "application/json;charset=utf-8",
                            "Access-Control-Allow-Origin": "*",
                        },
                    });
                } catch (err) {
                    return new Response(
                        JSON.stringify({
                            ok: false,
                            success: false,
                            status: "error",
                            error: err.message || "Internal probe error",
                            message: `Probe execution failed: ${err.message}`,
                        }, null, 2),
                        {
                            status: 500,
                            headers: {
                                "Content-Type": "application/json;charset=utf-8",
                                "Access-Control-Allow-Origin": "*",
                            },
                        }
                    );
                }
            }

            // 9.7. Shared Settings Export
            if (isShareSettingsRoute) {
                return buildSharedSettingsResponse(sysConfig);
            }

            // 10. Subscription Endpoint (routes.data)
            if (isDataRoute) {
                const ua = (request.headers.get("User-Agent") || "").toLowerCase();
                const acceptHeader = (request.headers.get("Accept") || "").toLowerCase();
                const secFetchDest = (request.headers.get("Sec-Fetch-Dest") || "").toLowerCase();
                const clientHost = request.headers.get("Host") || url.hostname;

                const targetSub = url.searchParams.get("sub");
                const hasMultiUser = sysConfig.users && sysConfig.users.length > 0;

                let targetUser = null;
                let isValidUser = false;

                if (hasMultiUser) {
                    if (targetSub) {
                        targetUser = sysConfig.users.find(
                            (u) =>
                                u.name.toLowerCase() === targetSub.toLowerCase() ||
                                u.id.toLowerCase() === targetSub.toLowerCase()
                        );
                        if (targetUser) isValidUser = true;
                    }
                } else {
                    isValidUser = true;
                    targetUser = { id: sysConfig.deviceId, name: "Default" };
                }

                // Browser vs proxy client check
                const isRealBrowser =
                    (secFetchDest === "document" || acceptHeader.includes("text/html")) &&
                    (ua.includes("mozilla") || ua.includes("chrome") || ua.includes("safari") || ua.includes("edge")) &&
                    !ua.includes("clash") &&
                    !ua.includes("sing-box") &&
                    !ua.includes("v2ray") &&
                    !ua.includes("shadowrocket");

                if (isRealBrowser) {
                    if (isValidUser && targetUser) {
                        const sysUsageCache = getCachedUsage();
                        const html = await renderSubscriptionHtml(env, targetUser, sysUsageCache, sysConfig, request.url);
                        return new Response(html, {
                            headers: { "Content-Type": "text/html; charset=utf-8" },
                        });
                    }
                    return await serveMaintenancePage(request, url, sysConfig);
                }

                if (hasMultiUser && !isValidUser) {
                    return new Response("Subscription profile not found or disabled", { status: 403 });
                }

                const allowInsecure =
                    url.searchParams.get("insecure") === "true" ||
                    url.searchParams.get("allowInsecure") === "true" ||
                    url.searchParams.get("allow_insecure") === "1";

                const flag = (
                    url.searchParams.get("flag") ||
                    url.searchParams.get("format") ||
                    url.searchParams.get("type") ||
                    ""
                ).toLowerCase();

                const resHeaders = new Headers();
                resHeaders.set("Cache-Control", "no-store");
                resHeaders.set("Access-Control-Allow-Origin", "*");

                if (isValidUser && targetUser) {
                    const idClean = targetUser.id.replace(/-/g, "").toLowerCase();
                    const sysUsageCache = getCachedUsage();
                    const sysU = sysUsageCache?.users?.[idClean] || { reqs: 0, dReqs: 0 };
                    const usedBytes = usageTotalBytes(sysU);
                    const limitTotal = targetUser.limitTotalReq || sysConfig.limitTotalReq || 0;
                    const limitBytes = limitReqToBytes(limitTotal);
                    const expiryMs = targetUser.expiryMs || sysConfig.expiryMs || 0;
                    const expireSec = expiryMs ? Math.floor(expiryMs / 1000) : 0;

                    const subUserInfo = `upload=0; download=${usedBytes}; total=${limitBytes}; expire=${expireSec}`;
                    resHeaders.set("Subscription-UserInfo", subUserInfo);
                    resHeaders.set("Profile-Update-Interval", "12");

                    const cleanName = encodeURIComponent(targetUser.name || "LuciProxy");
                    resHeaders.set(
                        "Content-Disposition",
                        `attachment; filename="${cleanName}"; filename*=UTF-8''${cleanName}`
                    );
                }

                // Format selection
                if (flag === "share-settings" || flag === "settings") {
                    return buildSharedSettingsResponse(sysConfig);
                }

                let isClashYaml = false;
                let isSingboxJson = false;
                let isV2rayJson = false;
                let isWireguard = false;
                let isAmnezia = false;

                if (["clash", "yaml", "meta", "stash", "clash-meta", "y"].includes(flag)) {
                    isClashYaml = true;
                } else if (["sing", "singbox", "sing-box", "sb", "s"].includes(flag)) {
                    isSingboxJson = true;
                } else if (["vjson", "v", "v2ray", "xray"].includes(flag)) {
                    isV2rayJson = true;
                } else if (["wireguard", "wg"].includes(flag)) {
                    isWireguard = true;
                } else if (["amnezia", "amneziawg", "awg"].includes(flag)) {
                    isAmnezia = true;
                } else if (flag === "base64" || flag === "raw") {
                    // Plain text Base64
                } else {
                    // Auto-detect based on User-Agent
                    if (ua.includes("clash") || ua.includes("meta") || ua.includes("stash") || ua.includes("mihomo")) {
                        isClashYaml = true;
                    } else if (ua.includes("sing-box") || ua.includes("singbox") || ua.includes("hiddify") || ua.includes("nekobox") || ua.includes("karing")) {
                        isSingboxJson = true;
                    } else if (ua.includes("amnezia")) {
                        isAmnezia = true;
                    } else if (ua.includes("wireguard")) {
                        isWireguard = true;
                    }
                }

                if (isWireguard || isAmnezia) {
                    resHeaders.set("Content-Type", "text/plain; charset=utf-8");
                    const wgProfile = generateWireguardConfig(sysConfig, isAmnezia, targetUser?.name || "LuciProxy");
                    return new Response(wgProfile, { headers: resHeaders });
                }

                const runtimeAlpn = url.searchParams.get("alpn") || undefined;
                const runtimeOverrides = { alpn: runtimeAlpn };

                if (isClashYaml) {
                    resHeaders.set("Content-Type", "text/yaml; charset=utf-8");
                    const yamlProfile = await buildYamlProfile(clientHost, targetSub, allowInsecure, sysConfig, runtimeOverrides);
                    return new Response(yamlProfile, { headers: resHeaders });
                }

                if (isSingboxJson) {
                    resHeaders.set("Content-Type", "application/json; charset=utf-8");
                    const sbProfile = await buildSingBoxJsonProfile(clientHost, targetSub, allowInsecure, sysConfig, runtimeOverrides);
                    return new Response(JSON.stringify(sbProfile, null, 2), { headers: resHeaders });
                }

                if (isV2rayJson) {
                    resHeaders.set("Content-Type", "application/json; charset=utf-8");
                    const vProfile = await buildVJsonProfile(clientHost, targetSub, allowInsecure, sysConfig, runtimeOverrides);
                    return new Response(JSON.stringify(vProfile, null, 2), { headers: resHeaders });
                }

                // Default: Plaintext Base64 URIs
                resHeaders.set("Content-Type", "text/plain; charset=utf-8");
                const rawProfile = await buildUriProfile(clientHost, targetSub, allowInsecure, sysConfig, runtimeOverrides);
                return new Response(safeBtoa(rawProfile), { headers: resHeaders });
            }

            return new Response("Not Found", { status: 404 });
        } catch (err) {
            console.error("Worker fetch error:", err);
            return new Response("Internal Server Error", { status: 500 });
        } finally {
            decrementInflightHttp();
        }
    },

    async scheduled(event, env, ctx) {
        await loadSysConfig(env, ctx);
        const sysConfig = getCachedConfig();
        const host = sysConfig.hubPanelUrl || sysConfig.name || "localhost";
        const results = {};

        try {
            results.rotated = await autoRotateSecretPaths(env, sysConfig);
        } catch (e) {
            results.rotated = { error: e.message };
        }

        try {
            results.mirror = await syncGitHubMirror(host, sysConfig);
        } catch (e) {
            results.mirror = { error: e.message };
        }

        return results;
    },
};
