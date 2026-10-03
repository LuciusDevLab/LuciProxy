/**
 * LuciProxy - HTML Asset Loaders & Template Rendering
 * High-performance template caching, dynamic placeholder injection, and camouflage loaders.
 *
 * Independent implementation authored specifically for LuciProxy.
 */

import { fetchT, usageTotalBytes, usageDailyBytes, limitReqToBytes } from "../utils/helpers.js";
import { safeBtoa } from "../utils/crypto.js";
import { getDbBinding } from "../db/d1.js";
import { getDashboardHtml, getSubscriptionHtml } from "./templates.js";

export async function renderDashboardHtml(env, currentVersion) {
    let html = null;
    const dashboardUrl = env?.DASHBOARD_URL;

    if (dashboardUrl) {
        try {
            const resp = await fetchT(dashboardUrl, {}, 5000);
            if (resp.ok) html = await resp.text();
        } catch (e) {}
    }

    if (!html) {
        html = getDashboardHtml();
    }

    html = html.replace(/__CURRENT_VERSION__/g, currentVersion);

    const hasDb = Boolean(getDbBinding(env));
    if (hasDb) {
        html = html.replace("__HAS_DB_WARNING__", "");
    } else {
        html = html.replace(
            "__HAS_DB_WARNING__",
            '<div class="mb-5 p-4 rounded-2xl flex items-start gap-3" style="background:rgba(239,68,68,0.08);border:1px solid rgba(239,68,68,0.2);"><span style="color:#f87171;">⚠️</span><span class="text-sm" style="color:#fca5a5;" data-i18n="missing_db">Database not connected. Settings won\'t be saved.</span></div>'
        );
    }

    return html;
}

export async function renderSubscriptionHtml(env, user, sysUsage, sysConfig, requestUrl) {
    let html = null;
    const subscriptionUrl = env?.SUBSCRIPTION_URL;

    if (subscriptionUrl) {
        try {
            const resp = await fetchT(subscriptionUrl, {}, 5000);
            if (resp.ok) html = await resp.text();
        } catch (e) {}
    }

    if (!html) {
        html = getSubscriptionHtml();
    }

    const todayDate = new Date().toISOString().split("T")[0];
    const userCleanId = user.id.replace(/-/g, "").toLowerCase();
    const sysU = sysUsage?.users?.[userCleanId] || { reqs: 0, dReqs: 0, lastDay: "" };

    const totalBytesUsed = usageTotalBytes(sysU);
    const dailyBytesUsed = usageDailyBytes(sysU, todayDate);

    const limitTotal = user.limitTotalReq || 0;
    const limitDaily = user.limitDailyReq || 0;
    const limitTotalBytes = limitReqToBytes(limitTotal);
    const limitDailyBytes = limitReqToBytes(limitDaily);

    const totalGb = (totalBytesUsed / 1073741824).toFixed(2);
    const limitTotalGb = limitTotal ? (limitTotalBytes / 1073741824).toFixed(2) : "Unlimited";
    const dailyGb = (dailyBytesUsed / 1073741824).toFixed(2);
    const limitDailyGb = limitDaily ? (limitDailyBytes / 1073741824).toFixed(2) : "Unlimited";

    const totalPercent = limitTotal ? Math.min(100, (totalBytesUsed / limitTotalBytes) * 100).toFixed(1) : "0";
    const dailyPercent = limitDaily ? Math.min(100, (dailyBytesUsed / limitDailyBytes) * 100).toFixed(1) : "0";

    let isExpired = false;
    let expiryDateTxt = "2099-01-01";
    if (user.expiryMs) {
        expiryDateTxt = new Date(user.expiryMs).toISOString().split("T")[0];
        if (Date.now() > user.expiryMs) isExpired = true;
    }

    let statusCode = "active";
    if (user.isPaused) statusCode = "paused";
    else if (isExpired) statusCode = "expired";
    else if (limitTotal && totalBytesUsed >= limitTotalBytes) statusCode = "limit";
    else if (limitDaily && dailyBytesUsed >= limitDailyBytes) statusCode = "dailyLimit";

    const cleanUrl = new URL(requestUrl);
    let panelUrlToUse = sysConfig.customPanelUrl;
    if (user.userPanelUrl && user.userPanelUrl.trim()) panelUrlToUse = user.userPanelUrl.trim();
    if (panelUrlToUse) {
        let customUrlStr = panelUrlToUse;
        if (!customUrlStr.startsWith("http://") && !customUrlStr.startsWith("https://")) {
            customUrlStr = "https://" + customUrlStr;
        }
        try {
            const customUrl = new URL(customUrlStr);
            cleanUrl.protocol = customUrl.protocol;
            cleanUrl.host = customUrl.host;
        } catch (e) {}
    }

    cleanUrl.searchParams.delete("flag");
    cleanUrl.searchParams.delete("format");
    cleanUrl.searchParams.delete("type");
    cleanUrl.searchParams.delete("output");
    cleanUrl.searchParams.delete("raw");

    const syncNormal = cleanUrl.href;
    const syncRaw = cleanUrl.href + (cleanUrl.href.includes("?") ? "&flag=a" : "?flag=a");
    const syncNormalBase64 = safeBtoa(syncNormal);

    let totalProgress = "";
    if (limitTotal) {
        totalProgress = `<div class="w-full rounded-full h-1.5 mt-3 overflow-hidden progress-bar-bg"><div class="h-1.5 rounded-full" style="background: var(--accent); width: ${totalPercent}%;"></div></div><p class="text-[10px] text-muted text-right mt-1.5" data-i18n="used">${totalPercent}% Used</p>`;
    } else {
        totalProgress = '<p class="text-[10px] text-muted mt-2" data-i18n="unlimitedPlan">Unlimited Plan</p>';
    }

    let dailyProgress = "";
    if (limitDaily) {
        dailyProgress = `<div class="w-full rounded-full h-1.5 mt-3 overflow-hidden progress-bar-bg"><div class="h-1.5 rounded-full" style="background: var(--amber-text); width: ${dailyPercent}%;"></div></div><p class="text-[10px] text-muted text-right mt-1.5" data-i18n="used">${dailyPercent}% Used</p>`;
    } else {
        dailyProgress = '<p class="text-[10px] text-muted mt-2" data-i18n="noDailyLimit">No Daily Limit</p>';
    }

    html = html.replace(/__USER_NAME__/g, user.name || "User");
    html = html.replace(/__USER_ID__/g, user.id);
    html = html.replace(/__STATUS_CODE__/g, statusCode);
    html = html.replace(/__TOTAL_GB__/g, totalGb);
    html = html.replace(/__LIMIT_TOTAL_GB__/g, limitTotalGb);
    html = html.replace(/__TOTAL_PERCENT__/g, totalPercent);
    html = html.replace(/__DAILY_GB__/g, dailyGb);
    html = html.replace(/__LIMIT_DAILY_GB__/g, limitDailyGb);
    html = html.replace(/__DAILY_PERCENT__/g, dailyPercent);
    html = html.replace(/__EXPIRY_DATE__/g, expiryDateTxt);
    html = html.replace(/__SYNC_NORMAL__/g, syncNormal);
    html = html.replace(/__SYNC_NORMAL_BASE64__/g, syncNormalBase64);
    html = html.replace(/__SYNC_RAW__/g, syncRaw);
    html = html.replace(/__TOTAL_PROGRESS__/g, totalProgress);
    html = html.replace(/__DAILY_PROGRESS__/g, dailyProgress);

    return html;
}

/**
 * Renders an authentic replica of Cloudflare Error 1101 (Worker threw exception) for camouflage.
 */
export function renderError1101Html(hostName = "localhost", clientIp = "127.0.0.1", rayId = null) {
    const d = new Date();
    const utcDateStr = `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, "0")}-${String(d.getUTCDate()).padStart(2, "0")} ${String(d.getUTCHours()).padStart(2, "0")}:${String(d.getUTCMinutes()).padStart(2, "0")}:${String(d.getUTCSeconds()).padStart(2, "0")} UTC`;
    const finalRayId = rayId || Array.from(crypto.getRandomValues(new Uint8Array(8))).map((b) => b.toString(16).padStart(2, "0")).join("");

    return `<!DOCTYPE html>
<!--[if lt IE 7]> <html class="no-js ie6 oldie" lang="en-US"> <![endif]-->
<!--[if IE 7]>    <html class="no-js ie7 oldie" lang="en-US"> <![endif]-->
<!--[if IE 8]>    <html class="no-js ie8 oldie" lang="en-US"> <![endif]-->
<!--[if gt IE 8]><!--> <html class="no-js" lang="en-US"> <!--<![endif]-->
<head>
<title>Worker threw exception | ${hostName} | Cloudflare</title>
<meta charset="UTF-8" />
<meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />
<meta http-equiv="X-UA-Compatible" content="IE=Edge" />
<meta name="robots" content="noindex, nofollow" />
<meta name="viewport" content="width=device-width,initial-scale=1" />
<style>
  body { margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Oxygen, Ubuntu, Cantarell, "Fira Sans", "Droid Sans", "Helvetica Neue", sans-serif; background: #f6f7f8; color: #36393d; }
  .cf-error-details-wrapper { max-width: 960px; margin: 40px auto; padding: 0 20px; }
  .cf-error-overview h1 { font-size: 4em; font-weight: 300; margin: 0; line-height: 1; }
  .cf-error-overview .cf-error-code { font-weight: 600; color: #c0392b; }
  .cf-error-overview .heading-ray-id { font-size: 0.35em; color: #999; display: block; margin-top: 10px; }
  .cf-error-overview h2 { font-size: 1.5em; font-weight: 400; color: #7f8c8d; margin-top: 10px; }
  .cf-columns { display: flex; gap: 40px; margin-top: 40px; border-top: 1px solid #e1e4e8; padding-top: 30px; }
  .cf-column { flex: 1; }
  .cf-column h2 { font-size: 1.25em; font-weight: 500; }
  .cf-column p { line-height: 1.6; color: #555; }
  .cf-error-footer { margin-top: 50px; padding-top: 20px; border-top: 1px solid #e1e4e8; font-size: 0.85em; color: #999; }
</style>
</head>
<body>
<div class="cf-error-details-wrapper">
  <div class="cf-error-overview">
    <h1>
      <span>Error</span>
      <span class="cf-error-code">1101</span>
      <small class="heading-ray-id">Ray ID: ${finalRayId} &bull; ${utcDateStr}</small>
    </h1>
    <h2>Worker threw exception</h2>
  </div>
  <div class="cf-columns">
    <div class="cf-column">
      <h2>What happened?</h2>
      <p>The script will not execute because a runtime error was thrown on the edge.</p>
    </div>
    <div class="cf-column">
      <h2>What can I do?</h2>
      <p>If you are the website owner, review the Workers runtime logs for details about this exception.</p>
    </div>
  </div>
  <div class="cf-error-footer">
    <p>Cloudflare Ray ID: <strong>${finalRayId}</strong> &bull; Your IP: <span>${clientIp}</span> &bull; Performance &amp; security by Cloudflare</p>
  </div>
</div>
</body>
</html>`;
}

/**
 * Renders standard Nginx welcome page camouflage.
 */
export function renderNginxHtml() {
    return `<!DOCTYPE html>
<html>
<head>
<title>Welcome to nginx!</title>
<style>
html { color-scheme: light dark; }
body { width: 35em; margin: 0 auto;
font-family: Tahoma, Verdana, Arial, sans-serif; }
</style>
</head>
<body>
<h1>Welcome to nginx!</h1>
<p>If you see this page, the nginx web server is successfully installed and
working. Further configuration is required.</p>
<p><em>Thank you for using nginx.</em></p>
</body>
</html>`;
}
