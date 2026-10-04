/**
 * LuciProxy - Audit Logs API & Activity Logger
 * In-memory and D1-backed activity auditing and operational logging.
 *
 * Independent implementation authored specifically for LuciProxy.
 */

import { d1Get, cachedD1Put, getDbBinding } from "../db/d1.js";

const inMemoryLogs = [];

export async function logActivity(env, type, detail) {
    const entry = {
        ts: Date.now(),
        type,
        detail,
    };

    inMemoryLogs.unshift(entry);
    if (inMemoryLogs.length > 200) inMemoryLogs.pop();

    const db = getDbBinding(env);
    if (db) {
        try {
            const raw = await d1Get(env, "system_logs");
            let logs = raw ? JSON.parse(raw) : [];
            if (!Array.isArray(logs)) logs = [];
            logs.unshift(entry);
            if (logs.length > 200) logs = logs.slice(0, 200);
            await cachedD1Put(env, "system_logs", JSON.stringify(logs));
        } catch (e) {}
    }
}

export async function handleLogs(request, env) {
    const db = getDbBinding(env);
    let logs = inMemoryLogs;
    if (db) {
        try {
            const raw = await d1Get(env, "system_logs");
            if (raw) logs = JSON.parse(raw);
        } catch (e) {}
    }

    return new Response(JSON.stringify({ success: true, logs: logs.slice(0, 100) }), {
        headers: { "Content-Type": "application/json" },
    });
}
