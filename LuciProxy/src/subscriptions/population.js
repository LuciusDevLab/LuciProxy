/**
 * LuciProxy - Canonical Endpoint Population Resolver
 * Single authoritative synthesizer for proxy nodes across all subscription renderers
 * (Xray URI, Xray JSON, Sing-Box JSON, and Clash YAML).
 *
 * Independent implementation authored specifically for LuciProxy.
 */

import {
    getAllProfiles,
    getProfileHostNames,
    getEffectivePips,
    getCleanIpsWithNames,
    calcEffectiveIps
} from "../users/manager.js";
import { getTransportParams } from "../utils/helpers.js";
import { getConfigName } from "./tags.js";
import { DEFAULT_ECH_CONFIGS } from "../config.js";
import { resolveFinalMask } from "./finalmask.js";
import { resolveAlpn } from "./policy.js";
import { generateConfigUuid } from "../utils/crypto.js";
import { selectDeterministicProxyIp } from "./proxyip.js";

/**
 * Resolves the complete, canonical list of proxy endpoints.
 * Guarantees that Xray, Sing-box, and Clash renderers receive the exact same node population.
 */
export function getResolvedEndpointPopulation(hostName, targetSub = null, allowInsecure = false, sysConfig = {}, runtimeOverrides = {}) {
    const ports = sysConfig.socketPorts
        ? sysConfig.socketPorts
              .split(",")
              .map((s) => s.trim())
              .filter(Boolean)
        : ["443"];

    const profiles = getAllProfiles(sysConfig, targetSub);
    const population = [];
    const nameCounts = {};

    const getUniqueName = (baseName) => {
        if (!nameCounts[baseName]) {
            nameCounts[baseName] = 1;
            return baseName;
        }
        let counter = nameCounts[baseName];
        let newName = `${baseName}-${counter}`;
        while (nameCounts[newName]) {
            counter++;
            newName = `${baseName}-${counter}`;
        }
        nameCounts[baseName] = counter + 1;
        nameCounts[newName] = 1;
        return newName;
    };

    let globalConfigIndex = 0;

    profiles.forEach((p) => {
        const resolvedFm = resolveFinalMask(p, sysConfig);
        const resolvedAlpn = resolveAlpn(sysConfig, p, runtimeOverrides.alpn);
        const pips = getEffectivePips(p, sysConfig);
        const effectiveMode = p.userMode || sysConfig.mode || "alpha";
        const effectivePorts = p.userPorts
            ? p.userPorts
                  .split(",")
                  .map((s) => s.trim())
                  .filter(Boolean)
            : ports;
        const maxCfg = p.maxConfigs || null;
        const profileHostNames = getProfileHostNames(hostName, p);
        let profileNodesCount = 0;

        // Precedence: per-subscription > global default
        const effectiveEchList = Array.isArray(p.echConfigList)
            ? p.echConfigList
            : (Array.isArray(sysConfig?.echConfigList) ? sysConfig.echConfigList : DEFAULT_ECH_CONFIGS);

        const validEchList = (effectiveEchList || [])
            .map((s) => String(s || "").trim())
            .filter(Boolean);

        profileHostNames.forEach((hName) => {
            if (maxCfg && profileNodesCount >= maxCfg) return;
            const rawEntries = getCleanIpsWithNames(hName, p.cleanIp, sysConfig);
            const hasPrimary = rawEntries.some((e) => e.ip.toLowerCase() === hName.toLowerCase());
            const ipEntries = hasPrimary ? [...rawEntries] : [...rawEntries, { ip: hName, name: "" }];
            const allIps = ipEntries.map((e) => e.ip);
            const ips = calcEffectiveIps(allIps, maxCfg, effectiveMode, effectivePorts, 1);

            const ipNameMap = {};
            ipEntries.forEach((e) => {
                ipNameMap[e.ip] = e.name;
            });

            effectivePorts.forEach((port) => {
                if (maxCfg && profileNodesCount >= maxCfg) return;
                const sec = getTransportParams(port);
                const isTls = sec === "tls";
                const portNum = parseInt(port, 10);

                ips.forEach((ip) => {
                    if (maxCfg && profileNodesCount >= maxCfg) return;
                    const ipName = ipNameMap[ip] || "";

                    // VLESS node(s)
                    if (effectiveMode === "alpha" || effectiveMode === "both") {
                        const addVlessEntry = (echVal = null) => {
                            if (maxCfg && profileNodesCount >= maxCfg) return;
                            const selectedProxyIp = pips.length > 0
                                ? selectDeterministicProxyIp(pips, { colo: sysConfig?.cfColo || "", clientId: p.id, index: profileNodesCount })
                                : null;
                            const baseTagName = getConfigName(
                                "alpha",
                                p.name,
                                port,
                                hName,
                                ip,
                                selectedProxyIp,
                                globalConfigIndex,
                                ipName,
                                sysConfig
                            );
                            const tag = getUniqueName(baseTagName);
                            const pipParam = selectedProxyIp ? `&proxyip=${encodeURIComponent(selectedProxyIp)}` : "";
                            const path = `/${sysConfig.apiRoute || "sync"}?ri=${globalConfigIndex}${pipParam}`;

                            population.push({
                                type: "vless",
                                protocol: "alpha",
                                profileId: p.id,
                                profileName: p.name,
                                uuid: p.id,
                                tag,
                                server: ip,
                                port: portNum,
                                host: hName,
                                sni: hName,
                                path,
                                sec,
                                isTls,
                                allowInsecure: Boolean(allowInsecure),
                                fingerprint: sysConfig.agent || "chrome",
                                alpn: resolvedAlpn,
                                finalMask: resolvedFm,
                                echVal: echVal,
                                selectedProxyIp,
                                ipName,
                                configIndex: globalConfigIndex
                            });
                            profileNodesCount++;
                            globalConfigIndex++;
                        };

                        if (validEchList.length > 0) {
                            validEchList.forEach((echVal) => {
                                addVlessEntry(echVal);
                            });
                        } else {
                            addVlessEntry(null);
                        }
                    }

                    // Trojan node
                    if (effectiveMode === "beta" || effectiveMode === "both") {
                        if (maxCfg && profileNodesCount >= maxCfg) return;
                        const selectedProxyIp = pips.length > 0
                            ? selectDeterministicProxyIp(pips, { colo: sysConfig?.cfColo || "", clientId: p.id, index: profileNodesCount })
                            : null;
                        const baseTagName = getConfigName(
                            "beta",
                            p.name,
                            port,
                            hName,
                            ip,
                            selectedProxyIp,
                            globalConfigIndex,
                            ipName,
                            sysConfig
                        );
                        const tag = getUniqueName(baseTagName);
                        const pipParam = selectedProxyIp ? `&proxyip=${encodeURIComponent(selectedProxyIp)}` : "";
                        const path = `/${sysConfig.apiRoute || "sync"}?ri=${globalConfigIndex}${pipParam}`;

                        population.push({
                            type: "trojan",
                            protocol: "beta",
                            profileId: p.id,
                            profileName: p.name,
                            password: p.id,
                            tag,
                            server: ip,
                            port: portNum,
                            host: hName,
                            sni: hName,
                            path,
                            sec,
                            isTls,
                            allowInsecure: Boolean(allowInsecure),
                            fingerprint: sysConfig.agent || "chrome",
                            alpn: resolvedAlpn,
                            finalMask: resolvedFm,
                            echVal: null,
                            selectedProxyIp,
                            ipName,
                            configIndex: globalConfigIndex
                        });
                        profileNodesCount++;
                        globalConfigIndex++;
                    }
                });
            });
        });
    });

    return population;
}
