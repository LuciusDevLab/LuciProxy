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
import { resolveFinalMask, formatClashFragmentYaml } from "./finalmask.js";

import { resolveNetworkPolicy } from "./policy.js";

export async function buildYamlProfile(hostName, targetSub = null, allowInsecure = false, sysConfig) {
    const ports = sysConfig.socketPorts
        ? sysConfig.socketPorts
              .split(",")
              .map((s) => s.trim())
              .filter(Boolean)
        : ["443"];
    const reqPath = encodeURI(`/${sysConfig.apiRoute}`);

    const policy = resolveNetworkPolicy(sysConfig, "PROXIES");
    const dnsPolicy = policy.dns;

    const proxies = [];
    const realProxyNames = [];
    const fakeProxyNames = [];
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
    udp: false
    tls: false`
        );
        fakeProxyNames.push(`"${uName}"`);
    });

    // 2. Iterate profiles
    const profiles = getAllProfiles(sysConfig, targetSub);
    profiles.forEach((p) => {
        const resolvedFm = resolveFinalMask(p, sysConfig);
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
            const rawEntries = getCleanIpsWithNames(hName, p.cleanIp, sysConfig);
            const hasPrimary = rawEntries.some((e) => e.ip.toLowerCase() === hName.toLowerCase());
            const ipEntries = hasPrimary ? [...rawEntries] : [...rawEntries, { ip: hName, name: "" }];
            const allIps = ipEntries.map((e) => e.ip);
            const ips = calcEffectiveIps(allIps, maxCfg, effectiveMode, effectivePorts, pips.length);

            const ipNameMap = {};
            ipEntries.forEach((e) => {
                ipNameMap[e.ip] = e.name;
            });

            effectivePorts.forEach((port) => {
                const sec = getTransportParams(port) === "tls" ? "true" : "false";
                const clashFragYaml = formatClashFragmentYaml(resolvedFm, sec === "true", "    ");
                const ipVersion = dnsPolicy.enableIPv6 ? "ipv4-prefer" : "ipv4";

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
    ip-version: ${ipVersion}
    udp: false
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
      max-early-data: 2560${clashFragYaml}`
                            );
                            realProxyNames.push(`"${vName}"`);
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
    ip-version: ${ipVersion}
    udp: false
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
      max-early-data: 2560${clashFragYaml}`
                            );
                            realProxyNames.push(`"${tName}"`);
                            configIndex++;
                        }
                    });
                });
            });
        });
    });

    const clashRules = buildClashRules(sysConfig, "PROXIES");
    const localDnsTarget = dnsPolicy.isLocalSystem ? "system" : `${dnsPolicy.localDns}#DIRECT`;
    const remoteDnsTarget = `${dnsPolicy.remoteDns}#PROXIES`;

    // Build nameserver-policy for sanction and domestic domains
    const nameserverPolicyLines = [];
    if (sysConfig.bypassAi || sysConfig.bypassOpenAi) {
        nameserverPolicyLines.push(`    "rule-set:openai": "${dnsPolicy.antiSanctionDns}#DIRECT"`);
        nameserverPolicyLines.push(`    "+.openai.com": "${dnsPolicy.antiSanctionDns}#DIRECT"`);
        nameserverPolicyLines.push(`    "+.chatgpt.com": "${dnsPolicy.antiSanctionDns}#DIRECT"`);
    }
    if (sysConfig.bypassIran) {
        nameserverPolicyLines.push(`    "rule-set:ir": "${localDnsTarget}"`);
        nameserverPolicyLines.push(`    "+.ir": "${localDnsTarget}"`);
    }

    // Build static host bootstrap lines
    const hostLines = [];
    if (dnsPolicy.bootstrapHosts && Object.keys(dnsPolicy.bootstrapHosts).length > 0) {
        Object.entries(dnsPolicy.bootstrapHosts).forEach(([domain, ips]) => {
            hostLines.push(`    "${domain}": [${ips.map((ip) => `"${ip}"`).join(", ")}]`);
        });
    }
    if (sysConfig.blockThreats) {
        hostLines.push(`    "+.doubleclick.net": "rcode://refused"`);
        hostLines.push(`    "+.coin-hive.com": "rcode://refused"`);
    }

    // Build rule providers
    const clashRuleSets = policy.ruleSets.filter((r) => r.clash && r.clash.geositeUrl);
    const ruleProviderBlocks = [];
    clashRuleSets.forEach((r) => {
        ruleProviderBlocks.push(
`  ${r.clash.geosite}:
    type: http
    behavior: domain
    format: ${r.clash.format || 'text'}
    path: ./ruleset/${r.clash.geosite}.${r.clash.format === 'yaml' ? 'yaml' : 'txt'}
    url: "${r.clash.geositeUrl}"
    interval: 86400
    proxy: DIRECT`
        );
    });

    const allProxyNames = [...realProxyNames, ...fakeProxyNames];
    const allProxyListYaml = allProxyNames.map((n) => `      - ${n}`).join("\n");
    const realProxyListYaml = realProxyNames.map((n) => `      - ${n}`).join("\n");

    return `# LuciProxy Mihomo / Clash Configuration
# Generated on: ${new Date().toISOString()}

port: 7890
socks-port: 7891
allow-lan: true
mode: rule
log-level: info
ipv6: ${dnsPolicy.enableIPv6}

dns:
  enable: true
  respect-rules: true
  use-system-hosts: false
  listen: 127.0.0.1:1053
  enhanced-mode: ${dnsPolicy.fakeDns ? "fake-ip" : "redir-host"}${dnsPolicy.fakeDns ? `
  fake-ip-range: 198.18.0.1/16
  fake-ip-filter:
    - "+.lan"
    - "+.local"` : ""}
  nameserver:
    - ${remoteDnsTarget}
  proxy-server-nameserver:
    - ${localDnsTarget}
  direct-nameserver:
    - ${localDnsTarget}
  direct-nameserver-follow-policy: true
${nameserverPolicyLines.length > 0 ? `  nameserver-policy:\n${nameserverPolicyLines.join("\n")}` : ""}
${hostLines.length > 0 ? `  hosts:\n${hostLines.join("\n")}` : ""}

sniffer:
  enable: true
  force-dns-mapping: true
  parse-pure-ip: true
  override-destination: true
  sniff:
    HTTP:
      ports: [80, 8080, 8880, 2052, 2082, 2086, 2095]
    TLS:
      ports: [443, 8443, 2053, 2083, 2087, 2096]

${sysConfig.enableTun ? `tun:
  enable: true
  stack: mixed
  auto-route: true
  strict-route: true
  auto-detect-interface: true
  dns-hijack:
    - "any:53"
    - "tcp://any:53"
  mtu: 9000` : `tun:
  enable: false`}

proxies:
${proxies.join("\n")}

proxy-groups:
  - name: "PROXIES"
    type: select
    proxies:
      - "AUTO"
      - "FALLBACK"${allProxyListYaml ? "\n" + allProxyListYaml : ""}

  - name: "AUTO"
    type: url-test
    url: http://www.gstatic.com/generate_204
    interval: 300
    tolerance: 50
    proxies:${realProxyListYaml ? "\n" + realProxyListYaml : ""}

  - name: "FALLBACK"
    type: fallback
    url: http://www.gstatic.com/generate_204
    interval: 300
    proxies:${realProxyListYaml ? "\n" + realProxyListYaml : ""}

${ruleProviderBlocks.length > 0 ? `rule-providers:\n${ruleProviderBlocks.join("\n")}\n` : ""}rules:
${clashRules.map((r) => `  - ${r}`).join("\n")}
`;
}
