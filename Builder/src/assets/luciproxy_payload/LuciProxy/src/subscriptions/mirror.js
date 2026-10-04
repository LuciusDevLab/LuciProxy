/**
 * LuciProxy - GitHub Subscription Mirror & Failover Synchronization
 * Automated synchronization of subscription profiles to GitHub repositories via REST API.
 *
 * Independent implementation authored specifically for LuciProxy.
 */

import { safeBtoa } from "../utils/crypto.js";
import { buildUriProfile } from "./uri.js";
import { buildYamlProfile } from "./clash.js";
import { buildSingBoxJsonProfile } from "./singbox.js";

/**
 * Commits subscription files to a GitHub repository so subscribers can access
 * fallback configurations via GitHub Raw when the Worker edge domain is filtered.
 */
export async function syncGitHubMirror(hostName, sysConfig, force = false) {
    const mirror = sysConfig.githubMirror;
    if (!mirror || typeof mirror !== "object") {
        return { skipped: true, reason: "GitHub mirror not configured" };
    }

    if (!force && !mirror.enabled) {
        return { skipped: true, reason: "GitHub mirror disabled" };
    }

    const token = String(mirror.token || "").trim();
    const rawRepo = String(mirror.repo || "").replace(/^https?:\/\/github\.com\//i, "").replace(/\.git$/i, "").trim();
    const branch = String(mirror.branch || "").trim() || "main";
    const pathPrefix = String(mirror.pathPrefix || "subs").replace(/^\/+|\/+$/g, "");

    if (!token || !rawRepo) {
        return { skipped: true, reason: "GitHub token or repository missing" };
    }

    const results = [];
    const filesToSync = [
        {
            filename: "base64.txt",
            getContent: async () => safeBtoa(await buildUriProfile(hostName, null, false, sysConfig)),
        },
        {
            filename: "mihomo.yaml",
            getContent: async () => await buildYamlProfile(hostName, null, false, sysConfig),
        },
        {
            filename: "singbox.json",
            getContent: async () => JSON.stringify(await buildSingBoxJsonProfile(hostName, null, false, sysConfig), null, 2),
        },
    ];

    for (const item of filesToSync) {
        const filePath = pathPrefix ? `${pathPrefix}/${item.filename}` : item.filename;
        const apiUrl = `https://api.github.com/repos/${rawRepo}/contents/${filePath}?ref=${branch}`;

        try {
            // Check existing file SHA
            let existingSha = null;
            const getRes = await fetch(apiUrl, {
                headers: {
                    "User-Agent": "LuciProxy-Mirror/1.0",
                    Authorization: `Bearer ${token}`,
                    Accept: "application/vnd.github.v3+json",
                },
            });

            if (getRes.ok) {
                const getData = await getRes.json();
                existingSha = getData.sha;
            }

            const rawContent = await item.getContent();
            const b64Payload = safeBtoa(rawContent);

            const putRes = await fetch(`https://api.github.com/repos/${rawRepo}/contents/${filePath}`, {
                method: "PUT",
                headers: {
                    "User-Agent": "LuciProxy-Mirror/1.0",
                    Authorization: `Bearer ${token}`,
                    Accept: "application/vnd.github.v3+json",
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    message: `Update ${item.filename} [LuciProxy Sync]`,
                    content: b64Payload,
                    branch,
                    sha: existingSha || undefined,
                }),
            });

            results.push({
                file: item.filename,
                ok: putRes.ok,
                status: putRes.status,
            });
        } catch (err) {
            results.push({
                file: item.filename,
                ok: false,
                error: err.message,
            });
        }
    }

    return {
        success: results.every((r) => r.ok),
        repo: rawRepo,
        branch,
        files: results,
    };
}
