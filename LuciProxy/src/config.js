/**
 * LuciProxy - Core Configuration & System Defaults
 * Central configuration registry and default operating parameters.
 *
 * Independent implementation authored specifically for LuciProxy.
 */

export const CURRENT_VERSION = "1.2.0";

export const DEFAULT_ECH_CONFIGS = [
    "cloudflare-ech.com+udp://1.1.1.1",
    "geedo.com+udp://1.1.1.1",
    "trustedstack.com+udp://1.1.1.1",
    "discordapp.com+udp://1.1.1.1",
    "ay.delivery+udp://1.1.1.1",
    "ifconfig.io+udp://1.1.1.1",
    "mygaru.com+udp://1.1.1.1",
    "mgaru.dev+udp://1.1.1.1",
    "adtarget.com.tr+udp://1.1.1.1",
    "rtbsystem.com+udp://1.1.1.1",
    "prestiti.it+udp://1.1.1.1",
    "all.biz+udp://1.1.1.1",
    "cdnfonts.com+udp://1.1.1.1",
    "xlivrdr.com+udp://1.1.1.1",
    "assicurazionionline.it+udp://1.1.1.1",
    "voipstunt.com+udp://1.1.1.1",
    "rawgit.com+udp://1.1.1.1",
    "loudecho.ai+udp://1.1.1.1",
    "voipbuster.com+udp://1.1.1.1",
    "adster.tech+udp://1.1.1.1",
    "cloudflare-ech.com+udp://8.8.8.8",
    "geedo.com+udp://8.8.8.8",
    "trustedstack.com+udp://8.8.8.8",
    "discordapp.com+udp://8.8.8.8",
    "ay.delivery+udp://8.8.8.8",
    "ifconfig.io+udp://8.8.8.8",
    "mygaru.com+udp://8.8.8.8",
    "mgaru.dev+udp://8.8.8.8",
    "adtarget.com.tr+udp://8.8.8.8",
    "rtbsystem.com+udp://8.8.8.8",
    "prestiti.it+udp://8.8.8.8",
    "all.biz+udp://8.8.8.8",
    "cdnfonts.com+udp://8.8.8.8",
    "xlivrdr.com+udp://8.8.8.8",
    "assicurazionionline.it+udp://8.8.8.8",
    "voipstunt.com+udp://8.8.8.8",
    "rawgit.com+udp://8.8.8.8",
    "loudecho.ai+udp://8.8.8.8",
    "voipbuster.com+udp://8.8.8.8",
    "adster.tech+udp://8.8.8.8",
    "cloudflare-ech.com+udp://8.8.4.4",
    "geedo.com+udp://8.8.4.4",
    "trustedstack.com+udp://8.8.4.4",
    "discordapp.com+udp://8.8.4.4",
    "ay.delivery+udp://8.8.4.4",
    "ifconfig.io+udp://8.8.4.4",
    "mygaru.com+udp://8.8.4.4",
    "mgaru.dev+udp://8.8.4.4",
    "adtarget.com.tr+udp://8.8.4.4",
    "rtbsystem.com+udp://8.8.4.4",
    "prestiti.it+udp://8.8.4.4",
    "all.biz+udp://8.8.4.4",
    "cdnfonts.com+udp://8.8.4.4",
    "xlivrdr.com+udp://8.8.4.4",
    "assicurazionionline.it+udp://8.8.4.4",
    "voipstunt.com+udp://8.8.4.4",
    "rawgit.com+udp://8.8.4.4",
    "loudecho.ai+udp://8.8.4.4",
    "voipbuster.com+udp://8.8.4.4",
    "adster.tech+udp://8.8.4.4",
];

export const SYSTEM_DEFAULTS = {
    name: "LuciProxy",
    apiRoute: "sync",
    maintenanceHost: "https://www.ubuntu.com, https://www.docker.com",
    backupRelay: "",
    customRelay: "",
    masterKey: "",
    metricNode: "time.is",
    cleanIps: "",
    slaveNodes: "",
    deviceId: "",
    mode: "alpha", // "alpha" = vless, "beta" = trojan, "both" = dual protocol
    agent: "chrome",
    socketPorts: "443",
    customDns: "https://8.8.8.8/dns-query",
    resolveIp: "8.8.8.8",
    cascade: "",
    enableOpt1: false, // ECH
    enableOpt2: false,
    echConfigList: [...DEFAULT_ECH_CONFIGS],
    finalMask: "",
    tgToken: "",
    tgChatId: "",
    tgAdminId: "",
    cfAccountId: "",
    cfApiToken: "",
    cfWorkerName: "",
    isPaused: false, // Global kill-switch
    silentAlerts: false,
    nameStrategy: "default",
    namePrefix: "Luci",
    tgBotLang: "fa",
    users: [],
    subUserAgent: "",
    customPanelUrl: "",
    limitTotalReq: 0,
    expiryMs: 0,
    linkedPanels: [],
    hubPanelUrl: "",
    syncApiKey: "",
    panelApiKeys: [],
    nat64Prefix: "",
    enableDirectConfigs: false,
    customRouting: "",
    upstreamUri: "",
    autoUpdate: false,
    autoUpdateFormat: "encoded",
    fakeConfigs: [
        { name: "📊 {usage}", enabled: true },
        { name: "📅 {expiry}", enabled: true },
    ],
    maintenanceMode: false,
    allowRemoteDeploy: true,
    autoPruneRelays: true,
    backendMode: false,
    backendUrl: "",
    camouflageType: "ubuntu", // "ubuntu", "docker", "1101", "nginx"
    fragmentMode: "off", // "off", "balanced", "gentle", "aggressive", "shadowrocket", "happ", "custom"
    fragmentParams: { packets: "1", length: "40-80", interval: "20-40" },
    // Protocol & Network Extensions
    enableECH: false,
    echServerName: "",
    blockUDP443: false,
    bypassAi: false,
    bypassDev: false,
    blockThreats: false,
    // Canonical Network Policy & Routing Defaults
    localDns: "8.8.8.8",
    remoteDns: "https://8.8.8.8/dns-query",
    antiSanctionDns: "178.22.122.100",
    fakeDns: false,
    enableIPv6: false,
    blockMalware: false,
    blockPhishing: false,
    blockCryptominers: false,
    blockAds: false,
    blockPorn: false,
    bypassIran: false,
    bypassChina: false,
    bypassRussia: false,
    bypassOpenAi: false,
    bypassGoogleAi: false,
    bypassMicrosoft: false,
    bypassOracle: false,
    bypassDocker: false,
    bypassAdobe: false,
    bypassEpicGames: false,
    bypassIntel: false,
    bypassAmd: false,
    bypassNvidia: false,
    customBypassRules: [],
    customBlockRules: [],
    customBypassSanctionRules: [],
    warpEndpoints: ["engage.cloudflareclient.com:2408"],
    warpRemoteDNS: "1.1.1.1",
    warpPrivateKey: "",
    warpPublicKey: "bmXOC+F1FxEMF9dyiK2H5/1SUtzH0JuVo51h2wPfgyo=",
    warpIPv6: "2606:4700:110:8735:6b2e:3d6e:8c3a:70a0/128",
    amneziaNoiseCount: 5,
    amneziaNoiseSizeMin: 50,
    amneziaNoiseSizeMax: 100,
    enableTun: false,
    prefixes: ["[2a02:898:146:64::]", "[2602:fc59:b0:64::]", "[2602:fc59:11:64::]"],
};

// Request units conversion factor: 1GB per 6000 connections
export const REQ_BYTES_EST = 1073741824 / 6000;

// Cache TTLs in milliseconds
export const CACHE_TTL_CONFIG = 10000;
export const CACHE_TTL_USAGE = 10000;
export const CACHE_TTL_BACKUP_IP = 30000;

// Socket & stream timeouts (in ms)
export const TCP_OPEN_TIMEOUT_MS = 5000;
export const TCP_WRITE_TIMEOUT_MS = 5000;
export const TCP_FIRST_READ_TIMEOUT_MS = 7000;
export const UPSTREAM_WRITE_TIMEOUT_MS = 15000;
export const DOWNSTREAM_READ_TIMEOUT_MS = 30000;
export const UPSTREAM_QUEUE_MAX_BYTES = 4 * 1024 * 1024;
export const UPSTREAM_QUEUE_MAX_ITEMS = 256;
