import fs from 'fs';
import { buildSingBoxJsonProfile } from '../src/subscriptions/singbox.js';
import { buildYamlProfile } from '../src/subscriptions/clash.js';
import { buildVJsonProfile } from '../src/subscriptions/v2ray.js';
import { SYSTEM_DEFAULTS } from '../src/config.js';

const config = {
    ...SYSTEM_DEFAULTS,
    deviceId: '11111111-2222-3333-4444-555555555555',
    apiRoute: 'sync',
    cleanIps: '104.16.1.1',
    socketPorts: '443',
    mode: 'alpha',
    blockUDP443: true,
    blockThreats: true,
    bypassIran: true,
    bypassAi: true,
    fakeDns: false,
    enableIPv6: false
};

async function main() {
    const scratchDir = 'C:/Users/Lucius/.gemini/antigravity/brain/3700d89e-9ca0-4cef-8556-059ef08e4d68/scratch';

    // 1. LuciProxy Configs
    const luciSb = await buildSingBoxJsonProfile('edge.example.com', null, false, config);
    // Use userland mixed-in port 2080 and drop tun for non-admin userland live execution
    luciSb.inbounds = [
        { type: 'mixed', tag: 'mixed-in', listen: '127.0.0.1', listen_port: 2080 }
    ];
    fs.writeFileSync(scratchDir + '/luci_singbox.json', JSON.stringify(luciSb, null, 2));

    const luciClash = await buildYamlProfile('edge.example.com', null, false, config);
    fs.writeFileSync(scratchDir + '/luci_clash.yaml', luciClash);

    const luciXray = await buildVJsonProfile('edge.example.com', null, false, config);
    fs.writeFileSync(scratchDir + '/luci_xray.json', JSON.stringify(luciXray, null, 2));

    // 2. Synthesize Reference equivalent configurations
    // Reference Sing-Box equivalent:
    const refSb = {
        log: { level: 'warn', timestamp: true },
        dns: {
            servers: [
                {
                    type: 'https',
                    server: 'cloudflare-dns.com',
                    detour: '✅ Selector',
                    tag: 'dns-remote'
                },
                {
                    type: 'local',
                    tag: 'dns-direct'
                },
                {
                    type: 'udp',
                    server: '178.22.122.100',
                    tag: 'dns-anti-sanction'
                },
                {
                    type: 'hosts',
                    tag: 'hosts',
                    predefined: {
                        'cloudflare-dns.com': ['104.16.248.249', '104.16.249.249', '1.1.1.1', '1.0.0.1']
                    }
                }
            ],
            rules: [
                { ip_accept_any: true, server: 'hosts' },
                { clash_mode: 'Direct', server: 'dns-direct' },
                { clash_mode: 'Global', server: 'dns-remote' },
                { action: 'reject', rule_set: ['geosite-malware', 'geosite-phishing', 'geosite-cryptominers', 'geosite-category-ads-all'] },
                { server: 'dns-direct', rule_set: ['geosite-ir'] },
                { server: 'dns-anti-sanction', rule_set: ['geosite-openai'] }
            ],
            strategy: 'ipv4_only',
            independent_cache: true
        },
        inbounds: [
            {
                type: 'mixed',
                tag: 'mixed-in',
                listen: '127.0.0.1',
                listen_port: 2081
            }
        ],
        outbounds: [
            {
                type: 'vless',
                tag: 'Ref-VLESS-443-104.16.1.1',
                server: '104.16.1.1',
                server_port: 443,
                uuid: '11111111-2222-3333-4444-555555555555',
                packet_encoding: '',
                tls: {
                    enabled: true,
                    server_name: 'edge.example.com',
                    insecure: false,
                    utls: { enabled: true, fingerprint: 'chrome' }
                },
                transport: {
                    type: 'ws',
                    path: '/sync',
                    headers: { Host: 'edge.example.com' },
                    early_data_header_name: 'Sec-WebSocket-Protocol',
                    max_early_data: 2560
                }
            },
            {
                type: 'selector',
                tag: '✅ Selector',
                outbounds: ['auto', 'Ref-VLESS-443-104.16.1.1']
            },
            {
                type: 'urltest',
                tag: 'auto',
                outbounds: ['Ref-VLESS-443-104.16.1.1'],
                url: 'http://www.gstatic.com/generate_204',
                interval: '5m',
                tolerance: 50
            },
            { type: 'direct', tag: 'direct' },
            { type: 'block', tag: 'block' }
        ],
        route: {
            rules: [
                { action: 'sniff' },
                { protocol: 'dns', action: 'hijack-dns' },
                { ip_is_private: true, outbound: 'direct' },
                { clash_mode: 'Direct', outbound: 'direct' },
                { clash_mode: 'Global', outbound: '✅ Selector' },
                { network: 'udp', action: 'reject' },
                { rule_set: ['geosite-malware', 'geosite-phishing', 'geosite-cryptominers', 'geosite-category-ads-all'], action: 'reject' },
                { rule_set: ['geosite-ir'], outbound: 'direct' },
                { rule_set: ['geosite-openai'], outbound: 'direct' },
                { outbound: '✅ Selector' }
            ],
            rule_set: [
                {
                    type: 'remote',
                    tag: 'geosite-malware',
                    format: 'binary',
                    url: 'https://raw.githubusercontent.com/Chocolate4U/Iran-sing-box-rules/rule-set/geosite-malware.srs',
                    download_detour: 'direct'
                },
                {
                    type: 'remote',
                    tag: 'geosite-phishing',
                    format: 'binary',
                    url: 'https://raw.githubusercontent.com/Chocolate4U/Iran-sing-box-rules/rule-set/geosite-phishing.srs',
                    download_detour: 'direct'
                },
                {
                    type: 'remote',
                    tag: 'geosite-cryptominers',
                    format: 'binary',
                    url: 'https://raw.githubusercontent.com/Chocolate4U/Iran-sing-box-rules/rule-set/geosite-cryptominers.srs',
                    download_detour: 'direct'
                },
                {
                    type: 'remote',
                    tag: 'geosite-category-ads-all',
                    format: 'binary',
                    url: 'https://raw.githubusercontent.com/Chocolate4U/Iran-sing-box-rules/rule-set/geosite-category-ads-all.srs',
                    download_detour: 'direct'
                },
                {
                    type: 'remote',
                    tag: 'geosite-ir',
                    format: 'binary',
                    url: 'https://raw.githubusercontent.com/Chocolate4U/Iran-sing-box-rules/rule-set/geosite-ir.srs',
                    download_detour: 'direct'
                },
                {
                    type: 'remote',
                    tag: 'geosite-openai',
                    format: 'binary',
                    url: 'https://raw.githubusercontent.com/Chocolate4U/Iran-sing-box-rules/rule-set/geosite-openai.srs',
                    download_detour: 'direct'
                }
            ],
            auto_detect_interface: true,
            default_domain_resolver: 'dns-direct',
            final: '✅ Selector'
        }
    };
    fs.writeFileSync(scratchDir + '/ref_singbox.json', JSON.stringify(refSb, null, 2));

    // Reference Clash equivalent:
    const refClashYaml = `port: 7892
socks-port: 7893
allow-lan: false
mode: rule
log-level: info
ipv6: false

dns:
  enable: true
  listen: 127.0.0.1:1054
  enhanced-mode: redir-host
  nameserver:
    - https://cloudflare-dns.com/dns-query#✅ Selector
  proxy-server-nameserver:
    - system
  direct-nameserver:
    - system
  nameserver-policy:
    "rule-set:openai": "178.22.122.100#DIRECT"
    "+.openai.com": "178.22.122.100#DIRECT"
    "+.chatgpt.com": "178.22.122.100#DIRECT"
    "rule-set:ir": "system"
    "+.ir": "system"
  hosts:
    "cloudflare-dns.com": ["104.16.248.249", "104.16.249.249", "1.1.1.1", "1.0.0.1"]
    "+.doubleclick.net": "rcode://refused"
    "+.coin-hive.com": "rcode://refused"

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

proxies:
  - name: "Ref-VLESS-443-104.16.1.1"
    type: vless
    server: 104.16.1.1
    port: 443
    uuid: "11111111-2222-3333-4444-555555555555"
    ip-version: ipv4
    udp: false
    tls: true
    network: ws
    servername: edge.example.com
    skip-cert-verify: false
    client-fingerprint: chrome
    ws-opts:
      path: "/sync"
      headers:
        Host: edge.example.com
      early-data-header-name: Sec-WebSocket-Protocol
      max-early-data: 2560

proxy-groups:
  - name: "✅ Selector"
    type: select
    proxies:
      - "AUTO"
      - "Ref-VLESS-443-104.16.1.1"

  - name: "AUTO"
    type: url-test
    url: http://www.gstatic.com/generate_204
    interval: 300
    tolerance: 50
    proxies:
      - "Ref-VLESS-443-104.16.1.1"

rule-providers:
  ir:
    type: http
    behavior: domain
    format: text
    path: ./ruleset/ir.txt
    url: "https://raw.githubusercontent.com/Chocolate4U/Iran-clash-rules/release/ir.txt"
    interval: 86400
    proxy: DIRECT
  openai:
    type: http
    behavior: domain
    format: yaml
    path: ./ruleset/openai.yaml
    url: "https://raw.githubusercontent.com/MetaCubeX/meta-rules-dat/meta/geo/geosite/openai.yaml"
    interval: 86400
    proxy: DIRECT
  malware:
    type: http
    behavior: domain
    format: text
    path: ./ruleset/malware.txt
    url: "https://raw.githubusercontent.com/Chocolate4U/Iran-clash-rules/release/malware.txt"
    interval: 86400
    proxy: DIRECT

rules:
  - GEOIP,lan,DIRECT,no-resolve
  - NETWORK,udp,REJECT
  - RULE-SET,malware,REJECT
  - DOMAIN-SUFFIX,doubleclick.net,REJECT
  - RULE-SET,ir,DIRECT
  - GEOIP,IR,DIRECT
  - RULE-SET,openai,DIRECT
  - DOMAIN-SUFFIX,openai.com,DIRECT
  - MATCH,✅ Selector
`;
    fs.writeFileSync(scratchDir + '/ref_clash.yaml', refClashYaml);

    // Reference Xray equivalent:
    const refXray = {
        log: { loglevel: 'warning' },
        dns: {
            hosts: {
                'cloudflare-dns.com': ['104.16.248.249', '1.1.1.1'],
                'geosite:category-ads-all': '#3',
                'domain:doubleclick.net': '#3'
            },
            servers: [
                {
                    address: 'https://cloudflare-dns.com/dns-query',
                    tag: 'remote-dns'
                },
                {
                    address: '1.1.1.1',
                    domains: ['geosite:category-ir'],
                    skipFallback: true
                },
                {
                    address: '178.22.122.100',
                    domains: ['geosite:openai', 'domain:openai.com', 'domain:chatgpt.com'],
                    skipFallback: true,
                    finalQuery: true
                }
            ],
            queryStrategy: 'UseIPv4',
            tag: 'dns'
        },
        inbounds: [
            {
                port: 10809,
                protocol: 'socks',
                settings: { auth: 'noauth', udp: true },
                sniffing: { enabled: true, destOverride: ['http', 'tls'] }
            },
            {
                port: 10854,
                protocol: 'dokodemo-door',
                settings: { address: '1.1.1.1', network: 'tcp,udp', port: 53 },
                tag: 'dns-in'
            }
        ],
        outbounds: [
            {
                tag: 'Ref-VLESS-443-104.16.1.1',
                protocol: 'vless',
                settings: {
                    vnext: [
                        {
                            address: '104.16.1.1',
                            port: 443,
                            users: [{ id: '11111111-2222-3333-4444-555555555555', encryption: 'none' }]
                        }
                    ]
                },
                streamSettings: {
                    network: 'ws',
                    security: 'tls',
                    tlsSettings: { serverName: 'edge.example.com', allowInsecure: false },
                    wsSettings: { path: '/sync', headers: { Host: 'edge.example.com' } }
                }
            },
            { protocol: 'dns', tag: 'dns-out', settings: { rules: [{ action: 'hijack' }] } },
            { protocol: 'freedom', tag: 'direct', settings: { domainStrategy: 'UseIP' } },
            { protocol: 'blackhole', tag: 'block', settings: { response: { type: 'http' } } }
        ],
        routing: {
            domainStrategy: 'IPIfNonMatch',
            rules: [
                { type: 'field', inboundTag: ['dns-in'], outboundTag: 'dns-out' },
                { type: 'field', inboundTag: ['remote-dns'], outboundTag: 'Ref-VLESS-443-104.16.1.1' },
                { type: 'field', inboundTag: ['dns'], outboundTag: 'direct' },
                { type: 'field', outboundTag: 'direct', ip: ['geoip:private'] },
                { type: 'field', network: 'udp', outboundTag: 'block' },
                { type: 'field', domain: ['geosite:category-ads-all', 'domain:doubleclick.net'], outboundTag: 'block' },
                { type: 'field', outboundTag: 'direct', ip: ['geoip:private', 'geoip:ir'] },
                { type: 'field', outboundTag: 'direct', domain: ['geosite:category-ir'] },
                { type: 'field', outboundTag: 'direct', domain: ['geosite:openai', 'domain:openai.com', 'domain:chatgpt.com'] },
                { type: 'field', network: 'tcp', outboundTag: 'Ref-VLESS-443-104.16.1.1' }
            ]
        }
    };
    fs.writeFileSync(scratchDir + '/ref_xray.json', JSON.stringify(refXray, null, 2));

    console.log('ALL_A_B_CONFIGS_GENERATED_SUCCESSFULLY');
}

main().catch(console.error);
