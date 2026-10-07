/**
 * LuciProxy - Clash & Mihomo YAML Profile Generator
 * Open specification configuration builder for Clash, Clash Meta, and Mihomo clients.
 *
 * Independent implementation authored specifically for LuciProxy.
 */

import { getFakeConfigNames } from "./tags.js";
import { buildClashRules } from "./routing.js";
import { formatClashFragmentYaml } from "./finalmask.js";
import { resolveNetworkPolicy } from "./policy.js";
import { getResolvedEndpointPopulation } from "./population.js";

export function formatClashServer(ip) {
    if (!ip) return "";
    const str = String(ip).trim();
    if (str.includes(":")) {
        const cleanIp = str.replace(/^\[|\]$/g, "");
        return `"${cleanIp}"`;
    }
    return str;
}

export async function buildYamlProfile(hostName, targetSub = null, allowInsecure = false, sysConfig = {}, runtimeOverrides = {}) {
    const policy = resolveNetworkPolicy(sysConfig, "PROXIES", runtimeOverrides.alpn);
    const dnsPolicy = policy.dns;

    const proxies = [];
    const realProxyNames = [];
    const fakeProxyNames = [];

    // 1. Add fake config informational nodes
    const fakeNames = getFakeConfigNames(sysConfig, targetSub);
    fakeNames.forEach((name) => {
        proxies.push(
`  - name: "${name}"
    type: trojan
    server: 127.0.0.1
    port: 80
    password: "${sysConfig.deviceId || 'luciproxy'}"
    udp: false
    tls: false`
        );
        fakeProxyNames.push(`"${name}"`);
    });

    // 2. Resolve canonical endpoint population
    const population = getResolvedEndpointPopulation(hostName, targetSub, allowInsecure, sysConfig, runtimeOverrides);

    population.forEach((item) => {
        const ipVersion = dnsPolicy.enableIPv6 ? "ipv4-prefer" : "ipv4";
        const clashFragYaml = formatClashFragmentYaml(item.finalMask, item.isTls, "    ");
        const alpnYaml = item.alpn && item.alpn.length > 0
            ? `\n    alpn:\n${item.alpn.map((a) => `      - ${a}`).join("\n")}`
            : "";

        if (item.protocol === "alpha") {
            proxies.push(
`  - name: "${item.tag}"
    type: vless
    server: ${formatClashServer(item.server)}
    port: ${item.port}
    uuid: "${item.uuid}"
    ip-version: ${ipVersion}
    udp: false
    tls: ${item.isTls}
    network: ws
    servername: ${item.host}
    skip-cert-verify: ${item.allowInsecure}
    client-fingerprint: ${item.fingerprint}${alpnYaml}
    ws-opts:
      path: "${item.path}"
      headers:
        Host: ${item.host}
      early-data-header-name: Sec-WebSocket-Protocol
      max-early-data: 2560${clashFragYaml}`
            );
            realProxyNames.push(`"${item.tag}"`);
        } else if (item.protocol === "beta") {
            proxies.push(
`  - name: "${item.tag}"
    type: trojan
    server: ${formatClashServer(item.server)}
    port: ${item.port}
    password: "${item.password}"
    ip-version: ${ipVersion}
    udp: false
    tls: ${item.isTls}
    network: ws
    sni: ${item.host}
    skip-cert-verify: ${item.allowInsecure}
    client-fingerprint: ${item.fingerprint}${alpnYaml}
    ws-opts:
      path: "${item.path}"
      headers:
        Host: ${item.host}
      early-data-header-name: Sec-WebSocket-Protocol
      max-early-data: 2560${clashFragYaml}`
            );
            realProxyNames.push(`"${item.tag}"`);
        }
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
