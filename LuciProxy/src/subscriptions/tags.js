/**
 * LuciProxy - Tag Strategies & Config Naming
 * Formatting utilities for node descriptors, metric indicators, and subscription tags.
 *
 * Independent implementation authored specifically for LuciProxy.
 */

import {
    usageTotalBytes,
    limitReqToBytes,
} from "../utils/helpers.js";
import { getCachedUsage } from "../db/d1.js";

export function getSubscriptionStats(sysConfig, targetSub = null) {
    let name = "Default";
    let id = sysConfig.deviceId || "00000000-0000-4000-8000-000000000000";
    let limitTotalReq = 0;
    let expiryMs = 0;

    let hasMultiUser = sysConfig.users && sysConfig.users.length > 0;
    if (hasMultiUser && targetSub) {
        let user = sysConfig.users.find(
            (u) =>
                u.name.toLowerCase() === targetSub.toLowerCase() ||
                u.id.toLowerCase() === targetSub.toLowerCase()
        );
        if (user) {
            name = user.name;
            id = user.id;
            limitTotalReq = user.limitTotalReq || 0;
            expiryMs = user.expiryMs || 0;
        }
    } else if (!hasMultiUser) {
        limitTotalReq = sysConfig.limitTotalReq || 0;
        expiryMs = sysConfig.expiryMs || 0;
    }

    const sysUsageCache = getCachedUsage();
    const idClean = id.replace(/-/g, "").toLowerCase();
    const sysU = sysUsageCache?.users?.[idClean] || { reqs: 0, dReqs: 0 };
    const totalBytesUsed = usageTotalBytes(sysU);

    const totalGb = (totalBytesUsed / 1073741824).toFixed(2);
    const limitTotalGb = limitTotalReq
        ? (limitReqToBytes(limitTotalReq) / 1073741824).toFixed(2)
        : "Unlimited";

    let expiryDateTxt = "Never Expire";
    let remDaysTxt = "Never Expire";
    if (expiryMs) {
        const exp = new Date(expiryMs);
        expiryDateTxt = exp.toISOString().split("T")[0];
        const remDays = Math.ceil((expiryMs - Date.now()) / (1000 * 60 * 60 * 24));
        remDaysTxt = remDays >= 0 ? `${remDays} Days Left` : "Expired";
    }

    return {
        usedStr: `Used: ${totalGb} GB / ${limitTotalGb} GB`,
        expiryStr: `Expiry: ${expiryDateTxt} (${remDaysTxt})`,
    };
}

export function getFakeConfigNames(sysConfig, targetSub = null) {
    const stats = getSubscriptionStats(sysConfig, targetSub);
    const configs = sysConfig.fakeConfigs || [
        { name: "📊 {usage}", enabled: true },
        { name: "📅 {expiry}", enabled: true },
    ];
    return configs
        .filter((f) => f && f.enabled && f.name)
        .map((f) =>
            f.name
                .replace("{usage}", stats.usedStr)
                .replace("{expiry}", stats.expiryStr)
        );
}

export function getConfigName(
    mode,
    userName,
    port,
    hName,
    ip,
    selectedProxyIp,
    configIndex,
    ipName,
    sysConfig
) {
    const protoLabel = mode === "alpha" ? "VLESS" : "Trojan";
    const portLabel = String(port);
    const prefix = sysConfig.namePrefix || "Luci";
    const today = new Date().toISOString().split("T")[0];

    let nameTemplate = sysConfig.nameStrategy || "default";

    if (nameTemplate === "default" || !nameTemplate) {
        const userTag = userName && userName !== "Default" ? `-${userName}` : "";
        const ipTag = ipName ? `-${ipName}` : `-${ip}`;
        return `${prefix}${userTag}-${protoLabel}-${portLabel}${ipTag}`;
    }

    return nameTemplate
        .replace("{FLAG}", "🌐")
        .replace("{COUNTRY}", "Global")
        .replace("{CITY}", "Edge")
        .replace("{ISP}", ipName || "CF")
        .replace("{HOST}", hName)
        .replace("{DATE}", today)
        .replace("{WORKER}", prefix)
        .replace("{USER}", userName || "User")
        .replace("{PROTO}", protoLabel)
        .replace("{PORT}", portLabel)
        .replace("{IP}", ip);
}
