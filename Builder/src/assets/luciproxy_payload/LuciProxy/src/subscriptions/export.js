/**
 * LuciProxy - Shared Settings Export & Remote Sync
 * JSON settings encoder and configuration exporter.
 *
 * Independent implementation authored specifically for LuciProxy.
 */

import { CURRENT_VERSION } from "../config.js";
import { safeBtoa, safeAtob } from "../utils/crypto.js";

/**
 * Extracts and packages exportable panel settings for cross-panel synchronization
 * or external client sharing.
 */
export function getSharedSettings(sysConfig) {
    const rawCleanIps = sysConfig.cleanIps || sysConfig.proxyIPs || [];
    const proxyIPs = Array.isArray(rawCleanIps)
        ? rawCleanIps
        : String(rawCleanIps).split(/[\r\n,]+/).map((s) => s.trim()).filter(Boolean);

    const ports = sysConfig.ports || [443, 8443, 2053, 2083, 2087, 2096];
    const prefixes = sysConfig.nat64Prefixes || [
        "[2a02:898:146:64::]",
        "[2602:fc59:b0:64::]",
        "[2602:fc59:11:64::]"
    ];

    const settings = {
        panelVersion: CURRENT_VERSION,
        proxyIpMode: sysConfig.proxyIpMode || "clean_ips",
        proxyIPs,
        prefixes,
        ports,
        fallback: sysConfig.maintenanceHost || "https://www.ubuntu.com",
        dohUrl: sysConfig.dohUrl || "/dns-query",
        antiDpi: {
            blockUDP443: sysConfig.blockUDP443 ?? true,
            enableECH: sysConfig.enableECH ?? true,
            tlsFragment: sysConfig.tlsFragment || {
                length: "100-200",
                interval: "10-20",
                packets: "tlshello"
            }
        },
        routing: {
            iranBypass: sysConfig.iranBypass ?? true,
            chinaBypass: sysConfig.chinaBypass ?? false,
            blockThreats: sysConfig.blockThreats ?? true,
            blockPorn: sysConfig.blockPorn ?? false
        },
        chainProxy: sysConfig.chainProxy || null,
        warpEndpoints: sysConfig.warpEndpoints || [
            "162.159.192.1:2408",
            "162.159.193.1:2408",
            "162.159.195.1:2408"
        ]
    };

    return settings;
}

/**
 * Encodes shared settings as base64 string for subscription sharing.
 */
export function buildSharedSettingsResponse(sysConfig) {
    const data = getSharedSettings(sysConfig);
    const jsonStr = JSON.stringify(data, null, 2);
    const base64Data = safeBtoa(jsonStr);

    return new Response(base64Data, {
        status: 200,
        headers: {
            "Content-Type": "text/plain; charset=utf-8",
            "Content-Disposition": 'inline; filename="shared-settings.txt"',
            "Cache-Control": "no-store",
            "Access-Control-Allow-Origin": "*"
        }
    });
}
