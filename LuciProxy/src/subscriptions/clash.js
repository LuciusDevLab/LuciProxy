/**
 * LuciProxy - Clash & Mihomo YAML Profile Generator
 * Open specification configuration builder for Clash, Clash Meta, and Mihomo clients.
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
import { getConfigName, getFakeConfigNames } from "./tags.js";
import { buildClashRules } from "./routing.js";

export async function buildYamlProfile(hostName, targetSub = null, allowInsecure = false, sysConfig) {
    const ports = sysConfig.socketPorts
        ? sysConfig.socketPorts
              .split(",")
              .map((s) => s.trim())
              .filter(Boolean)
        : ["443"];
    const reqPath = encodeURI(`/${sysConfig.apiRoute}`);

    const proxies = [];
    const proxyNames = [];
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

    // 1. Add fake configs
    const fakeNames = getFakeConfigNames(sysConfig, targetSub);
    fakeNames.forEach((name) => {
        const uName = getUniqueName(name);
        proxies.push(
`  - name: "${uName}"
    type: trojan
    server: 127.0.0.1
    port: 80
    password: "${sysConfig.deviceId || 'luciproxy'}"
    udp: true
    tls: false`
        );
        proxyNames.push(`"${uName}"`);
    });

    // 2. Iterate profiles
    const profiles = getAllProfiles(sysConfig, targetSub);
    profiles.forEach((p) => {
        const pips = getEffectivePips(p, sysConfig);
        const effectiveMode = p.userMode || sysConfig.mode;
        const effectivePorts = p.userPorts
            ? p.userPorts
                  .split(",")
                  .map((s) => s.trim())
                  .filter(Boolean)
            : ports;
        const maxCfg = p.maxConfigs || null;
        const profileHostNames = getProfileHostNames(hostName, p);

        let configIndex = 0;

        profileHostNames.forEach((hName) => {
            const ipEntries = getCleanIpsWithNames(hName, p.cleanIp, sysConfig);
            const allIps = ipEntries.map((e) => e.ip);
            const ips = calcEffectiveIps(allIps, maxCfg, effectiveMode, effectivePorts, pips.length);

            const ipNameMap = {};
            ipEntries.forEach((e) => {
                ipNameMap[e.ip] = e.name;
            });

            effectivePorts.forEach((port) => {
                const sec = getTransportParams(port) === "tls" ? "true" : "false";

                ips.forEach((ip) => {
                    const _pips = pips.length > 0 ? pips : [null];
                    _pips.forEach((selectedProxyIp) => {
                        const ipName = ipNameMap[ip] || "";

                        // VLESS Outbound
                        if (effectiveMode === "alpha" || effectiveMode === "both") {
                            const vName = getUniqueName(
                                getConfigName("alpha", p.name, port, hName, ip, selectedProxyIp, configIndex, ipName, sysConfig)
                            );
                            proxies.push(
`  - name: "${vName}"
    type: vless
    server: ${ip}
    port: ${port}
    uuid: "${p.id}"
    udp: true
    tls: ${sec}
    network: ws
    servername: ${hName}
    skip-cert-verify: ${allowInsecure}
    client-fingerprint: ${sysConfig.agent || 'chrome'}
    ws-opts:
      path: "${reqPath}"
      headers:
        Host: ${hName}
      early-data-header-name: Sec-WebSocket-Protocol
      max-early-data: 2560`
                            );
                            proxyNames.push(`"${vName}"`);
                            configIndex++;
                        }

                        // Trojan Outbound
                        if (effectiveMode === "beta" || effectiveMode === "both") {
                            const tName = getUniqueName(
                                getConfigName("beta", p.name, port, hName, ip, selectedProxyIp, configIndex, ipName, sysConfig)
                            );
                            proxies.push(
`  - name: "${tName}"
    type: trojan
    server: ${ip}
    port: ${port}
    password: "${p.id}"
    udp: true
    tls: ${sec}
    network: ws
    sni: ${hName}
    skip-cert-verify: ${allowInsecure}
    client-fingerprint: ${sysConfig.agent || 'chrome'}
    ws-opts:
      path: "${reqPath}"
      headers:
        Host: ${hName}
      early-data-header-name: Sec-WebSocket-Protocol
      max-early-data: 2560`
                            );
                            proxyNames.push(`"${tName}"`);
                            configIndex++;
                        }
                    });
                });
            });
        });
    });

    const proxyList = proxyNames.join(", ");
    const clashRules = buildClashRules(sysConfig, "PROXIES");

    return `# LuciProxy Mihomo / Clash Configuration
# Generated on: ${new Date().toISOString()}

port: 7890
socks-port: 7891
allow-lan: true
mode: rule
log-level: info
ipv6: true

dns:
  enable: true
  listen: 0.0.0.0:53
  enhanced-mode: fake-ip
  fake-ip-range: 198.18.0.1/16
  nameserver:
    - 1.1.1.1
    - 8.8.8.8
    - https://cloudflare-dns.com/dns-query

proxies:
${proxies.join("\n")}

proxy-groups:
  - name: "PROXIES"
    type: select
    proxies:
      - "AUTO"
      - "FALLBACK"
      ${proxyNames.map((n) => `    - ${n}`).join("\n")}

  - name: "AUTO"
    type: url-test
    url: http://www.gstatic.com/generate_204
    interval: 300
    tolerance: 50
    proxies:
      ${proxyNames.map((n) => `    - ${n}`).join("\n")}

  - name: "FALLBACK"
    type: fallback
    url: http://www.gstatic.com/generate_204
    interval: 300
    proxies:
      ${proxyNames.map((n) => `    - ${n}`).join("\n")}

rules:
${clashRules.map((r) => `  - ${r}`).join("\n")}
`;
}
