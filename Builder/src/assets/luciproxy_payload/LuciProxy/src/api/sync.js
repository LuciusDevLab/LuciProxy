/**
 * LuciProxy - Configuration Synchronization API
 * Administrative settings synchronization and persistent state storage.
 *
 * Independent implementation authored specifically for LuciProxy.
 */

import { isAuthorized } from "../auth/auth.js";
import { cachedD1Put, setCachedConfig, getDbBinding } from "../db/d1.js";
import { logActivity } from "./logs.js";

export async function handleConfigSync(request, env, ctx, sysConfig) {
    try {
        const data = await request.json();

        if (!isAuthorized(request, sysConfig, data)) {
            return new Response(
                JSON.stringify({ success: false, error: "Unauthorized" }),
                { status: 401, headers: { "Content-Type": "application/json" } }
            );
        }

        const incomingConfig = data.config || data;
        const nextConfig = {
            ...sysConfig,
            ...(incomingConfig || {}),
        };
        delete nextConfig.key;

        // Preserve existing users array if not explicitly overridden
        if (Array.isArray(incomingConfig?.users)) {
            nextConfig.users = incomingConfig.users;
        }

        const requestedKey = incomingConfig?.masterKey ? String(incomingConfig.masterKey).trim() : "";
        const isKeyRotation = Boolean(requestedKey && requestedKey !== sysConfig.masterKey);

        if (isKeyRotation) {
            nextConfig.masterKey = requestedKey;
        } else {
            nextConfig.masterKey = sysConfig.masterKey;
        }

        setCachedConfig(nextConfig);
        Object.assign(sysConfig, nextConfig);

        const db = getDbBinding(env);
        if (db) {
            const configToStore = { ...nextConfig };
            const envKey = env?.MASTER_KEY || env?.INITIAL_ADMIN_KEY || "";
            // If the key has not been rotated and still matches the deployment Worker Secret,
            // avoid redundant plaintext secret storage in D1.
            if (envKey && nextConfig.masterKey === envKey) {
                delete configToStore.masterKey;
            } else {
                // Rotated key is authoritative and MUST be persisted in D1.
                configToStore.masterKey = nextConfig.masterKey;
            }
            await cachedD1Put(env, "sys_config", JSON.stringify(configToStore));
        }

        if (ctx?.waitUntil) {
            ctx.waitUntil(logActivity(env, "Config Sync", "System settings updated via API"));
        } else {
            await logActivity(env, "Config Sync", "System settings updated via API");
        }

        return new Response(JSON.stringify({ success: true, config: nextConfig }), {
            status: 200,
            headers: { "Content-Type": "application/json" },
        });
    } catch (err) {
        return new Response(JSON.stringify({ success: false, error: err.message }), {
            status: 400,
            headers: { "Content-Type": "application/json" },
        });
    }
}
