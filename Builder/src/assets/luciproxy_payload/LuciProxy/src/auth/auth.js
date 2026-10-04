/**
 * LuciProxy - Authentication & Access Control
 * Token validation, rate limiting, and administrative session management.
 *
 * Independent implementation authored specifically for LuciProxy.
 */

import { CURRENT_VERSION } from "../config.js";
import { getCachedUsage, d1Get, d1Put, cachedD1Put, setCachedConfig } from "../db/d1.js";
import { logActivity } from "../api/logs.js";
import { getAllProfiles } from "../users/manager.js";

// Brute-force protection: 15 failed logins in 15 minutes triggers a temporary 429
const LOGIN_ATTEMPTS = new Map();
const LOGIN_FAIL_LIMIT = 15;
const LOGIN_WINDOW_MS = 15 * 60 * 1000;

export function authBlocked(ip) {
    try {
        const r = LOGIN_ATTEMPTS.get(ip);
        if (!r) return false;
        if (Date.now() - r.first > LOGIN_WINDOW_MS) {
            LOGIN_ATTEMPTS.delete(ip);
            return false;
        }
        return r.n >= LOGIN_FAIL_LIMIT;
    } catch (e) {
        return false;
    }
}

export function authFail(ip) {
    try {
        const now = Date.now();
        let r = LOGIN_ATTEMPTS.get(ip);
        if (!r || now - r.first > LOGIN_WINDOW_MS) r = { n: 0, first: now };
        r.n++;
        LOGIN_ATTEMPTS.set(ip, r);
        if (LOGIN_ATTEMPTS.size > 10000) LOGIN_ATTEMPTS.clear();
    } catch (e) {}
}

export function authClear(ip) {
    try {
        LOGIN_ATTEMPTS.delete(ip);
    } catch (e) {}
}

export function isPanelApiKey(sysConfig, key) {
    if (!key || !sysConfig.panelApiKeys || !Array.isArray(sysConfig.panelApiKeys)) return false;
    return sysConfig.panelApiKeys.some((k) => k.key === key);
}

export function extractAuthKey(request, data) {
    const authHeader = request?.headers?.get("Authorization") || "";
    const authKey = authHeader.replace(/^Bearer\s+/i, "") || "";
    let bodyKey = "";
    if (data && typeof data === "object") bodyKey = data.key || "";
    return authKey || bodyKey;
}

export function isAuthorized(request, sysConfig, data) {
    try {
        const ip = request?.headers?.get("cf-connecting-ip") || "Unknown";
        if (authBlocked(ip)) return false;
        const key = extractAuthKey(request, data);
        const ok = key === sysConfig.masterKey || isPanelApiKey(sysConfig, key);
        if (!ok) authFail(ip);
        return ok;
    } catch (e) {
        return false;
    }
}

export async function handleAuth(request, hostName, ctx, env, sysConfig) {
    try {
        const data = await request.json();
        const ip = request.headers.get("cf-connecting-ip") || "Unknown";
        if (authBlocked(ip)) {
            return new Response(
                JSON.stringify({
                    success: false,
                    error: "Too many attempts, try later",
                }),
                { status: 429, headers: { "Content-Type": "application/json" } }
            );
        }

        const loginKey = data.key || "";
        const isKeyAuth = loginKey === sysConfig.masterKey || isPanelApiKey(sysConfig, loginKey);

        if (isKeyAuth) {
            authClear(ip);
            if (isPanelApiKey(sysConfig, loginKey)) {
                const apiKeyEntry = (sysConfig.panelApiKeys || []).find((k) => k.key === loginKey);
                if (apiKeyEntry) apiKeyEntry.lastUsed = Date.now();
            }

            const netInfo = {
                ip: ip,
                colo: request.cf?.colo || "Unknown",
                loc: (request.cf?.city || "Unknown") + ", " + (request.cf?.country || "Unknown"),
            };

            let baseHost = hostName;
            let protocol = "https";
            if (sysConfig.customPanelUrl && sysConfig.customPanelUrl.trim()) {
                let customUrlStr = sysConfig.customPanelUrl.trim();
                if (!customUrlStr.startsWith("http://") && !customUrlStr.startsWith("https://")) {
                    customUrlStr = "https://" + customUrlStr;
                }
                try {
                    const customUrl = new URL(customUrlStr);
                    baseHost = customUrl.host;
                    protocol = customUrl.protocol.replace(":", "");
                } catch (e) {}
            }

            const sysUsageCache = getCachedUsage();

            return new Response(
                JSON.stringify({
                    success: true,
                    config: isPanelApiKey(sysConfig, loginKey)
                        ? {
                              ...sysConfig,
                              masterKey: "[PROTECTED]",
                              panelApiKeys: "[PROTECTED]",
                              cfApiToken: "[PROTECTED]",
                              cfAccountId: "[PROTECTED]",
                              cfWorkerName: "[PROTECTED]",
                              tgToken: "[PROTECTED]",
                              tgChatId: "[PROTECTED]",
                              tgAdminId: "[PROTECTED]",
                              syncApiKey: "[PROTECTED]",
                          }
                        : sysConfig,
                    deviceId: sysConfig.deviceId,
                    network: netInfo,
                    usage: {},
                    sysUsage: sysUsageCache?.users || {},
                    version: CURRENT_VERSION,
                    profiles: getAllProfiles(sysConfig).map((p) => {
                        let subSuffix = p.name === "Default" ? "" : "?sub=" + encodeURIComponent(p.name);
                        return {
                            name: p.name,
                            id: p.id,
                            sync: `${protocol}://${baseHost}/${sysConfig.apiRoute}${subSuffix}`,
                        };
                    }),
                }),
                { status: 200, headers: { "Content-Type": "application/json" } }
            );
        }

        authFail(ip);
        return new Response(JSON.stringify({ success: false, error: "Invalid credentials" }), {
            status: 401,
            headers: { "Content-Type": "application/json" },
        });
    } catch (e) {
        return new Response(JSON.stringify({ success: false, error: "Bad Request" }), {
            status: 400,
            headers: { "Content-Type": "application/json" },
        });
    }
}

/**
 * Periodically rotates secret panel and subscription routes.
 */
export async function autoRotateSecretPaths(env, sysConfig, force = false) {
    if (!sysConfig.autoRotatePath && !force) {
        return { skipped: true, reason: "autoRotatePath disabled" };
    }

    const intervalDays = Math.max(1, sysConfig.autoRotatePathDays || 30);
    const intervalMs = intervalDays * 24 * 60 * 60 * 1000;
    const lastRotateStr = await d1Get(env, "last_auto_path_rotate");
    const lastRotate = parseInt(lastRotateStr || "0", 10);

    if (!force && Date.now() - lastRotate < intervalMs) {
        return { skipped: true, reason: "rotation not due" };
    }

    const randomHex = () =>
        Array.from(crypto.getRandomValues(new Uint8Array(6)))
            .map((b) => b.toString(16).padStart(2, "0"))
            .join("");

    const newAdminPath = randomHex();
    const newSubPath = randomHex();

    sysConfig.adminPath = newAdminPath;
    sysConfig.apiRoute = newSubPath;
    setCachedConfig(sysConfig);

    await cachedD1Put(env, "sys_config", JSON.stringify(sysConfig));
    await d1Put(env, "last_auto_path_rotate", String(Date.now()));

    await logActivity(env, "Path Rotation", `Secret paths rotated: admin=/${newAdminPath}, sync=/${newSubPath}`);

    // If Telegram bot configured, notify admin
    if (sysConfig.tgToken && (sysConfig.tgChatId || sysConfig.tgAdminId)) {
        const chatId = sysConfig.tgAdminId || sysConfig.tgChatId;
        const msg = `🔄 <b>LuciProxy Path Rotation</b>\n\nAdministrative routes updated.\nNew Admin: <code>/${newAdminPath}/dash</code>\nNew Subscription: <code>/${newSubPath}</code>`;
        try {
            await fetch(`https://api.telegram.org/bot${sysConfig.tgToken}/sendMessage`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ chat_id: chatId, text: msg, parse_mode: "HTML" }),
            });
        } catch (e) {}
    }

    return {
        rotated: true,
        adminPath: newAdminPath,
        subPath: newSubPath,
        rotatedAt: Date.now(),
    };
}
