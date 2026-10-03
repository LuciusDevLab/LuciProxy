/**
 * LuciProxy - Core Configuration & System Defaults
 * Central configuration registry and default operating parameters.
 *
 * Independent implementation authored specifically for LuciProxy.
 */

export const CURRENT_VERSION = "1.0.0";

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
    customDns: "https://cloudflare-dns.com/dns-query",
    resolveIp: "1.1.1.1",
    cascade: "",
    enableOpt1: false, // ECH
    enableOpt2: false,
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
    warpEndpoints: ["engage.cloudflareclient.com:2408"],
    warpRemoteDNS: "1.1.1.1",
    warpPrivateKey: "",
    warpPublicKey: "bmXOC+F1FxEMF9dyiK2H5/1SUtzH0JuVo51h2wPfgyo=",
    warpIPv6: "2606:4700:110:8735:6b2e:3d6e:8c3a:70a0/128",
    amneziaNoiseCount: 5,
    amneziaNoiseSizeMin: 50,
    amneziaNoiseSizeMax: 100,
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
export const UPSTREAM_QUEUE_MAX_BYTES = 4 * 1024 * 1024;
export const UPSTREAM_QUEUE_MAX_ITEMS = 256;
