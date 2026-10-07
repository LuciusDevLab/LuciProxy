// LuciProxy/src/config.js
var CURRENT_VERSION = "1.2.1";
var DEFAULT_NAT64_PREFIXES = [
  "[2a02:898:146:64::]",
  "[2602:fc59:b0:64::]",
  "[2602:fc59:11:64::]"
];
var DEFAULT_BACKUP_RELAYS = [];
var DEFAULT_PROXY_IP_POOL = [
  "proxyip.fxxk.dedyn.io",
  "workers.cloudflare.cyou",
  "proxyip.jp.fxxk.dedyn.io",
  "proxyip.sg.fxxk.dedyn.io"
];
var DEFAULT_ECH_CONFIGS = [
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
  "adster.tech+udp://8.8.4.4"
];
var SYSTEM_DEFAULTS = {
  name: "LuciProxy",
  apiRoute: "sync",
  maintenanceHost: "https://www.ubuntu.com, https://www.docker.com",
  backupRelay: "",
  customRelay: "",
  enableProxyIp: true,
  proxyIpMode: "builtin",
  // "builtin" | "custom"
  proxyIpPool: [...DEFAULT_PROXY_IP_POOL],
  masterKey: "",
  metricNode: "time.is",
  cleanIps: "",
  slaveNodes: "",
  deviceId: "",
  mode: "alpha",
  // "alpha" = vless, "beta" = trojan, "both" = dual protocol
  agent: "chrome",
  alpn: "",
  // Canonical ALPN policy (unset/auto = "", or explicit e.g. "http/1.1", "h2")
  socketPorts: "443",
  customDns: "https://8.8.8.8/dns-query",
  resolveIp: "8.8.8.8",
  cascade: "",
  enableOpt1: false,
  // ECH
  enableOpt2: false,
  echConfigList: [...DEFAULT_ECH_CONFIGS],
  finalMask: "",
  tgToken: "",
  tgChatId: "",
  tgAdminId: "",
  cfAccountId: "",
  cfApiToken: "",
  cfWorkerName: "",
  isPaused: false,
  // Global kill-switch
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
    { name: "\u{1F4CA} {usage}", enabled: true },
    { name: "\u{1F4C5} {expiry}", enabled: true }
  ],
  maintenanceMode: false,
  allowRemoteDeploy: true,
  autoPruneRelays: true,
  backendMode: false,
  backendUrl: "",
  camouflageType: "ubuntu",
  // "ubuntu", "docker", "1101", "nginx"
  fragmentMode: "off",
  // "off", "balanced", "gentle", "aggressive", "shadowrocket", "happ", "custom"
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
  prefixes: ["[2a02:898:146:64::]", "[2602:fc59:b0:64::]", "[2602:fc59:11:64::]"]
};
var REQ_BYTES_EST2 = 1073741824 / 6e3;
var CACHE_TTL_CONFIG = 1e4;
var CACHE_TTL_USAGE = 1e4;
var CACHE_TTL_BACKUP_IP = 3e4;
var TCP_OPEN_TIMEOUT_MS = 5e3;
var UPSTREAM_WRITE_TIMEOUT_MS = 15e3;
var DOWNSTREAM_READ_TIMEOUT_MS = 3e4;
var UPSTREAM_QUEUE_MAX_BYTES = 4 * 1024 * 1024;
var UPSTREAM_QUEUE_MAX_ITEMS = 256;

// LuciProxy/src/db/d1.js
var StateStore = class {
  constructor() {
    this.memoryMap = /* @__PURE__ */ new Map();
    this.activeConfig = { ...SYSTEM_DEFAULTS };
    this.configTimestamp = 0;
    this.configPromise = null;
    this.usageCache = { users: {} };
    this.usageTimestamp = 0;
    this.usagePromise = null;
    this.relayIpCache = null;
    this.relayIpTimestamp = 0;
    this.relayIpPromise = null;
  }
  reset() {
    this.memoryMap.clear();
    this.activeConfig = { ...SYSTEM_DEFAULTS };
    this.configTimestamp = 0;
    this.configPromise = null;
    this.usageCache = { users: {} };
    this.usageTimestamp = 0;
    this.usagePromise = null;
    this.relayIpCache = null;
    this.relayIpTimestamp = 0;
    this.relayIpPromise = null;
  }
};
var store = new StateStore();
function getDbBinding(env) {
  if (!env || typeof env !== "object") return null;
  return env.IOT_DB || env.DB || null;
}
async function d1Init(env) {
  const database = getDbBinding(env);
  if (!database || env._D1_INITIALIZED) return;
  try {
    await database.prepare(
      "CREATE TABLE IF NOT EXISTS kv_store (key TEXT PRIMARY KEY, value TEXT)"
    ).run();
    env._D1_INITIALIZED = true;
  } catch {
    env._D1_INITIALIZED = true;
  }
}
async function d1Get(env, key) {
  const database = getDbBinding(env);
  if (!database) {
    return store.memoryMap.get(key) || null;
  }
  await d1Init(env);
  try {
    const query = database.prepare("SELECT value FROM kv_store WHERE key = ?");
    const { results } = await query.bind(key).all();
    if (results && results.length > 0 && results[0]?.value !== void 0) {
      return String(results[0].value);
    }
  } catch {
  }
  return null;
}
async function d1Put(env, key, value) {
  const stringVal = typeof value === "string" ? value : JSON.stringify(value);
  const database = getDbBinding(env);
  if (!database) {
    store.memoryMap.set(key, stringVal);
    return;
  }
  await d1Init(env);
  try {
    const statement = database.prepare(
      "INSERT INTO kv_store (key, value) VALUES (?, ?) ON CONFLICT(key) DO UPDATE SET value = excluded.value"
    );
    await statement.bind(key, stringVal).run();
  } catch {
  }
}
async function cachedD1Put(env, key, value) {
  await d1Put(env, key, value);
  if (key === "sys_config") {
    store.configTimestamp = 0;
  } else if (key === "sys_usage") {
    store.usageTimestamp = 0;
  } else if (key === "backup_ip") {
    store.relayIpTimestamp = 0;
  }
}
function generateSecureToken() {
  try {
    const bytes = new Uint8Array(12);
    crypto.getRandomValues(bytes);
    return Array.from(bytes).map((b) => b.toString(16).padStart(2, "0")).join("");
  } catch {
    return (Math.random().toString(36).slice(2) + Math.random().toString(36).slice(2)).slice(0, 24);
  }
}
async function loadSysConfig(env, ctx = null) {
  const currentTime = Date.now();
  if (currentTime - store.configTimestamp > CACHE_TTL_CONFIG) {
    if (!store.configPromise) {
      store.configPromise = (async () => {
        try {
          const rawData = await d1Get(env, "sys_config");
          let parsed = null;
          if (rawData) {
            try {
              parsed = JSON.parse(rawData);
            } catch {
            }
          }
          const envKey = env?.MASTER_KEY || env?.INITIAL_ADMIN_KEY || "";
          const rotatedKey = parsed?.masterKey && String(parsed.masterKey).trim() || "";
          let resolvedMasterKey = rotatedKey || envKey || "";
          let resolvedDeviceId = parsed?.deviceId || env?.DEVICE_ID || "";
          let needsSave = false;
          if (!resolvedMasterKey) {
            resolvedMasterKey = generateSecureToken();
            needsSave = true;
          }
          if (!resolvedDeviceId) {
            resolvedDeviceId = crypto.randomUUID ? crypto.randomUUID() : generateSecureToken();
            needsSave = true;
          }
          store.activeConfig = {
            ...SYSTEM_DEFAULTS,
            ...parsed || {},
            masterKey: resolvedMasterKey,
            deviceId: resolvedDeviceId
          };
          if (needsSave && getDbBinding(env)) {
            await d1Put(env, "sys_config", JSON.stringify(store.activeConfig)).catch(() => {
            });
          }
        } catch {
          store.activeConfig = { ...SYSTEM_DEFAULTS };
        } finally {
          store.configTimestamp = Date.now();
          store.configPromise = null;
        }
      })();
    }
    await store.configPromise;
  }
  if (currentTime - store.usageTimestamp > CACHE_TTL_USAGE) {
    if (!store.usagePromise) {
      store.usagePromise = (async () => {
        try {
          const rawUsage = await d1Get(env, "sys_usage");
          let parsedUsage = null;
          if (rawUsage) {
            try {
              parsedUsage = JSON.parse(rawUsage);
            } catch {
            }
          }
          store.usageCache = parsedUsage && typeof parsedUsage === "object" ? parsedUsage : { users: {} };
        } catch {
          store.usageCache = { users: {} };
        } finally {
          store.usageTimestamp = Date.now();
          store.usagePromise = null;
        }
      })();
    }
    await store.usagePromise;
  }
  if (currentTime - store.relayIpTimestamp > CACHE_TTL_BACKUP_IP) {
    if (!store.relayIpPromise) {
      store.relayIpPromise = (async () => {
        try {
          const rawIp = await d1Get(env, "backup_ip");
          store.relayIpCache = rawIp ? String(rawIp).trim() : null;
        } catch {
          store.relayIpCache = null;
        } finally {
          store.relayIpTimestamp = Date.now();
          store.relayIpPromise = null;
        }
      })();
    }
    await store.relayIpPromise;
  }
  if (store.relayIpCache || env?.RELAY_IP) {
    store.activeConfig.customRelay = store.relayIpCache ?? env.RELAY_IP ?? "";
  }
  return {
    sysConfig: store.activeConfig,
    sysUsageCache: store.usageCache
  };
}
function getCachedConfig() {
  return store.activeConfig;
}
function setCachedConfig(newConfig) {
  store.activeConfig = { ...SYSTEM_DEFAULTS, ...newConfig };
  store.configTimestamp = Date.now();
}
function getCachedUsage() {
  return store.usageCache;
}
function setCachedUsage(newUsage) {
  store.usageCache = newUsage;
  store.usageTimestamp = Date.now();
}

// LuciProxy/src/api/logs.js
var inMemoryLogs = [];
async function logActivity(env, type, detail) {
  const entry = {
    ts: Date.now(),
    type,
    detail
  };
  inMemoryLogs.unshift(entry);
  if (inMemoryLogs.length > 200) inMemoryLogs.pop();
  const db = getDbBinding(env);
  if (db) {
    try {
      const raw = await d1Get(env, "system_logs");
      let logs = raw ? JSON.parse(raw) : [];
      if (!Array.isArray(logs)) logs = [];
      logs.unshift(entry);
      if (logs.length > 200) logs = logs.slice(0, 200);
      await cachedD1Put(env, "system_logs", JSON.stringify(logs));
    } catch (e) {
    }
  }
}
async function handleLogs(request, env) {
  const db = getDbBinding(env);
  let logs = inMemoryLogs;
  if (db) {
    try {
      const raw = await d1Get(env, "system_logs");
      if (raw) logs = JSON.parse(raw);
    } catch (e) {
    }
  }
  return new Response(JSON.stringify({ success: true, logs: logs.slice(0, 100) }), {
    headers: { "Content-Type": "application/json" }
  });
}

// LuciProxy/src/utils/helpers.js
var INFLIGHT_HTTP = 0;
var OPEN_WS = 0;
function incrementInflightHttp() {
  INFLIGHT_HTTP++;
}
function decrementInflightHttp() {
  INFLIGHT_HTTP = Math.max(0, INFLIGHT_HTTP - 1);
}
function incrementOpenWs() {
  OPEN_WS++;
}
function decrementOpenWs() {
  OPEN_WS = Math.max(0, OPEN_WS - 1);
}
function breakerLevel() {
  if (OPEN_WS > 80 || INFLIGHT_HTTP > 40) return 2;
  if (OPEN_WS > 40 || INFLIGHT_HTTP > 20) return 1;
  return 0;
}
async function withDeadline(promise, timeoutMs, onTimeout, label = "operation") {
  let timer = null;
  const timeoutPromise = new Promise((_, reject) => {
    timer = setTimeout(() => {
      try {
        if (typeof onTimeout === "function") onTimeout();
      } catch (e) {
      }
      reject(new Error(`${label} timed out after ${timeoutMs}ms`));
    }, timeoutMs);
  });
  try {
    return await Promise.race([promise, timeoutPromise]);
  } finally {
    if (timer) clearTimeout(timer);
  }
}
async function fetchT(url, init = {}, timeoutMs = 1e4) {
  const timeout = Math.max(1, Number(timeoutMs) || 1e4);
  let controller = null;
  let timer = null;
  let callerSignal = null;
  let onCallerAbort = null;
  try {
    if (typeof AbortController !== "undefined") {
      controller = new AbortController();
      callerSignal = init && init.signal ? init.signal : null;
      if (callerSignal) {
        if (callerSignal.aborted) {
          controller.abort(callerSignal.reason);
        } else {
          onCallerAbort = () => {
            try {
              controller.abort(callerSignal.reason);
            } catch (e) {
            }
          };
          try {
            callerSignal.addEventListener("abort", onCallerAbort, { once: true });
          } catch (e) {
          }
        }
      }
      timer = setTimeout(() => {
        try {
          controller.abort();
        } catch (e) {
        }
      }, timeout);
      return await fetch(url, { ...init, signal: controller.signal });
    }
    return await fetch(url, { ...init });
  } finally {
    if (timer) {
      try {
        clearTimeout(timer);
      } catch (e) {
      }
    }
    if (callerSignal && onCallerAbort) {
      try {
        callerSignal.removeEventListener("abort", onCallerAbort);
      } catch (e) {
      }
    }
  }
}
function usageTotalBytes(u) {
  try {
    if (!u) return 0;
    if (typeof u.bytes === "number" && u.bytes >= 0) return Math.floor(u.bytes);
    return Math.floor((u.reqs || 0) * REQ_BYTES_EST);
  } catch (e) {
    return 0;
  }
}
function usageDailyBytes(u, today) {
  try {
    if (!u) return 0;
    const day = today || (/* @__PURE__ */ new Date()).toISOString().split("T")[0];
    if ((u.lastDay || "") !== day) return 0;
    if (typeof u.dBytes === "number" && u.dBytes >= 0) return Math.floor(u.dBytes);
    return Math.floor((u.dReqs || 0) * REQ_BYTES_EST);
  } catch (e) {
    return 0;
  }
}
function limitReqToBytes(limitReq) {
  try {
    return limitReq ? Math.floor(limitReq * REQ_BYTES_EST) : 0;
  } catch (e) {
    return 0;
  }
}
function getTransportParams(port) {
  const portStr = String(port);
  return ["80", "8080", "8880", "2052", "2082", "2086", "2095"].includes(portStr) ? "none" : "tls";
}
function formatSocketHost(host = "") {
  if (!host) return "";
  const clean = String(host).replace(/^\[|\]$/g, "").trim();
  return clean.includes(":") ? `[${clean}]` : clean;
}
function base64ToArrayBuffer(base64Str) {
  if (!base64Str || typeof base64Str !== "string") return null;
  try {
    let str = base64Str.trim().replace(/-/g, "+").replace(/_/g, "/");
    while (str.length % 4 !== 0) {
      str += "=";
    }
    const binary = atob(str);
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) {
      bytes[i] = binary.charCodeAt(i);
    }
    return bytes.buffer;
  } catch (e) {
    return null;
  }
}
function convertToNAT64IPv6(ipv4Address, prefix) {
  if (!ipv4Address || !prefix) return null;
  const parts = ipv4Address.split(".");
  if (parts.length !== 4) return null;
  const hex = parts.map((part) => {
    const num = parseInt(part, 10);
    if (isNaN(num) || num < 0 || num > 255) return null;
    return num.toString(16).padStart(2, "0");
  });
  if (hex.includes(null)) return null;
  let cleanPrefix = prefix.trim();
  if (cleanPrefix.startsWith("[") && cleanPrefix.endsWith("]")) {
    cleanPrefix = cleanPrefix.slice(1, -1);
  }
  if (cleanPrefix.endsWith("::")) {
    return `[${cleanPrefix}${hex[0]}${hex[1]}:${hex[2]}${hex[3]}]`;
  } else if (cleanPrefix.endsWith(":")) {
    return `[${cleanPrefix}${hex[0]}${hex[1]}:${hex[2]}${hex[3]}]`;
  } else {
    return `[${cleanPrefix}:${hex[0]}${hex[1]}:${hex[2]}${hex[3]}]`;
  }
}
var CF_IPV4_CIDRS = [
  [1729491968, 22],
  // 103.21.244.0/22
  [1729546240, 22],
  // 103.22.200.0/22
  [1730085888, 22],
  // 103.31.4.0/22
  [1745879040, 13],
  // 104.16.0.0/13
  [1746403328, 14],
  // 104.24.0.0/14
  [1822605312, 18],
  // 108.162.192.0/18
  [2197833728, 22],
  // 131.0.72.0/22
  [2372222976, 18],
  // 141.101.64.0/18
  [2728263680, 15],
  // 162.158.0.0/15
  [2889875456, 13],
  // 172.64.0.0/13
  [2918526976, 20],
  // 173.245.48.0/20
  [3161612288, 20],
  // 188.114.96.0/20
  [3193827328, 20],
  // 190.93.240.0/20
  [3320508416, 22],
  // 197.234.240.0/22
  [3324608512, 17],
  // 198.41.128.0/17
  [16843008, 24],
  // 1.1.1.0/24
  [16777216, 24]
  // 1.0.0.0/24
];
function isCloudflareIp(ipStr) {
  if (!ipStr || typeof ipStr !== "string") return false;
  const clean = ipStr.replace(/^\[|\]$/g, "").trim().split(":")[0];
  const parts = clean.split(".");
  if (parts.length === 4) {
    let num = 0;
    for (let i = 0; i < 4; i++) {
      const p = parseInt(parts[i], 10);
      if (isNaN(p) || p < 0 || p > 255) return false;
      num = num << 8 | p;
    }
    num = num >>> 0;
    for (const [net, maskLen] of CF_IPV4_CIDRS) {
      const mask = maskLen === 0 ? 0 : 4294967295 << 32 - maskLen >>> 0;
      if ((num & mask) === (net & mask)) {
        return true;
      }
    }
    return false;
  }
  const cleanV6 = ipStr.replace(/^\[|\]$/g, "").trim().toLowerCase();
  if (cleanV6.includes(":")) {
    return cleanV6.startsWith("2606:4700") || cleanV6.startsWith("2400:cb00") || cleanV6.startsWith("2803:f800") || cleanV6.startsWith("2405:b500") || cleanV6.startsWith("2405:8100") || cleanV6.startsWith("2a06:98c0") || cleanV6.startsWith("2c0f:f248");
  }
  return false;
}

// LuciProxy/src/subscriptions/proxyip.js
var DEFAULT_PROXY_IP_POOL2 = [
  "proxyip.fxxk.dedyn.io",
  "workers.cloudflare.cyou",
  "proxyip.jp.fxxk.dedyn.io",
  "proxyip.sg.fxxk.dedyn.io"
];
var HOSTNAME_REGEX = /^(?:[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?\.)+[a-zA-Z]{2,}$/;
var IPV4_REGEX = /^(?:(?:25[0-5]|2[0-4][0-9]|1[0-9]{2}|[1-9]?[0-9])\.){3}(?:25[0-5]|2[0-4][0-9]|1[0-9]{2}|[1-9]?[0-9])$/;
function isValidIPv6(ip) {
  if (!ip || typeof ip !== "string") return false;
  const clean = ip.trim();
  if (!/^[a-fA-F0-9:]+$/.test(clean)) return false;
  if (clean.includes(":::")) return false;
  const doubleColonCount = (clean.match(/::/g) || []).length;
  if (doubleColonCount > 1) return false;
  const parts = clean.split(":");
  if (doubleColonCount === 0 && parts.length !== 8) return false;
  if (doubleColonCount === 1 && parts.length > 8) return false;
  for (const part of parts) {
    if (part.length > 4) return false;
  }
  return true;
}
function parseProxyIpEntry(rawEntry, defaultPort = 443) {
  if (!rawEntry || typeof rawEntry !== "string") return null;
  let entry = rawEntry.split("#")[0].trim();
  if (!entry) return null;
  if (/[\s<>"'\\/;,?&]/.test(entry)) return null;
  let host = "";
  let port = defaultPort;
  let isIpv6 = false;
  if (entry.startsWith("[")) {
    const closeIdx = entry.indexOf("]");
    if (closeIdx === -1) return null;
    host = entry.slice(1, closeIdx);
    if (!isValidIPv6(host)) return null;
    isIpv6 = true;
    const remainder = entry.slice(closeIdx + 1);
    if (remainder) {
      if (!remainder.startsWith(":")) return null;
      const parsedPort = parseInt(remainder.slice(1), 10);
      if (isNaN(parsedPort) || parsedPort < 1 || parsedPort > 65535) return null;
      port = parsedPort;
    }
  } else {
    const colonCount = (entry.match(/:/g) || []).length;
    if (colonCount > 1) {
      if (!isValidIPv6(entry)) return null;
      host = entry;
      isIpv6 = true;
      port = defaultPort;
    } else if (colonCount === 1) {
      const [h, p] = entry.split(":");
      const parsedPort = parseInt(p, 10);
      if (isNaN(parsedPort) || parsedPort < 1 || parsedPort > 65535) return null;
      host = h;
      port = parsedPort;
    } else {
      host = entry;
      port = defaultPort;
    }
  }
  if (!isIpv6) {
    const isIpv4 = IPV4_REGEX.test(host);
    const isHostname = HOSTNAME_REGEX.test(host);
    if (!isIpv4 && !isHostname) {
      return null;
    }
  }
  const cleanHost = isIpv6 ? `[${host}]` : host;
  const formatted = port === 443 ? cleanHost : isIpv6 ? `[${host}]:${port}` : `${host}:${port}`;
  return {
    host,
    port,
    isIpv6,
    formatted,
    cleanHost,
    raw: entry
  };
}
function normalizeProxyIp(entry) {
  const parsed = parseProxyIpEntry(entry);
  return parsed ? parsed.formatted : null;
}
function parseProxyIpList(input) {
  if (!input) return [];
  let rawList = [];
  if (Array.isArray(input)) {
    rawList = input;
  } else if (typeof input === "string") {
    rawList = input.split(/[\r\n,;]+/);
  } else {
    return [];
  }
  const seen = /* @__PURE__ */ new Set();
  const result = [];
  for (const item of rawList) {
    const parsed = parseProxyIpEntry(item);
    if (parsed) {
      const key = parsed.formatted.toLowerCase();
      if (!seen.has(key)) {
        seen.add(key);
        result.push(parsed);
      }
    }
  }
  return result;
}
function isUserProxyIpOverrideActive(profile) {
  if (!profile?.proxyIp || typeof profile.proxyIp !== "string") return false;
  const clean = profile.proxyIp.trim();
  if (!clean) return false;
  const parsed = parseProxyIpList(clean);
  return parsed.length > 0;
}
function isProxyIpEnabled(profile = null, sysConfig = {}) {
  if (profile) {
    if (profile.enableProxyIp === false) return false;
    if (profile.proxyIpMode === "off" || profile.proxyIpMode === false) return false;
  }
  if (sysConfig) {
    if (sysConfig.enableProxyIp === false) return false;
    if (sysConfig.proxyIpMode === "off") return false;
  }
  return true;
}
function resolveProxyIpPolicy(profile = null, sysConfig = {}, context = {}) {
  if (!isProxyIpEnabled(profile, sysConfig)) {
    return {
      enabled: false,
      mode: "off",
      source: "off",
      pool: [],
      selected: null
    };
  }
  if (isUserProxyIpOverrideActive(profile)) {
    const userEntries = parseProxyIpList(profile.proxyIp);
    const pool2 = userEntries.map((e) => e.formatted);
    const selected2 = pool2.length > 0 ? selectDeterministicProxyIp(pool2, context) : null;
    return {
      enabled: true,
      mode: "user",
      source: "user",
      pool: pool2,
      selected: selected2
    };
  }
  const opMode = sysConfig?.proxyIpMode || "builtin";
  if (opMode === "custom") {
    const customSource = sysConfig?.proxyIpPool || sysConfig?.customRelay || sysConfig?.backupRelay || "";
    const operatorEntries = parseProxyIpList(customSource);
    if (operatorEntries.length > 0) {
      const pool2 = operatorEntries.map((e) => e.formatted);
      const selected2 = pool2.length > 0 ? selectDeterministicProxyIp(pool2, context) : null;
      return {
        enabled: true,
        mode: "auto",
        source: "operator",
        pool: pool2,
        selected: selected2
      };
    }
  }
  const pool = [...DEFAULT_PROXY_IP_POOL2];
  const selected = pool.length > 0 ? selectDeterministicProxyIp(pool, context) : null;
  return {
    enabled: true,
    mode: "auto",
    source: "builtin",
    pool,
    selected
  };
}
function getEffectiveProxyIpPool(profile = null, sysConfig = {}) {
  const policy = resolveProxyIpPolicy(profile, sysConfig);
  return policy.pool;
}
function selectDeterministicProxyIp(pool, context = {}) {
  if (!Array.isArray(pool) || pool.length === 0) return null;
  const colo = String(context.colo || "DEFAULT").toUpperCase().trim();
  const clientId = String(context.clientId || "").trim();
  const index = Number(context.index) || 0;
  const attempt = Number(context.attempt) || 0;
  let hash = 2166136261;
  const key = `${colo}:${clientId}:${index}`;
  for (let i = 0; i < key.length; i++) {
    hash ^= key.charCodeAt(i);
    hash = Math.imul(hash, 16777619);
  }
  const baseIndex = Math.abs(hash >>> 0) % pool.length;
  const targetIndex = (baseIndex + attempt) % pool.length;
  const item = pool[targetIndex];
  return typeof item === "object" && item !== null ? item.formatted : String(item);
}

// LuciProxy/src/users/manager.js
var activeConns = /* @__PURE__ */ new Map();
var uuidUsage = /* @__PURE__ */ new Map();
var lastPersistenceSyncTime = 0;
function normalizeIdentifier(rawId) {
  return String(rawId || "").replace(/[^a-zA-Z0-9]/g, "").toLowerCase();
}
function getAllProfiles(sysConfig, targetSubscriber = null) {
  const defaultId = sysConfig.deviceId || "00000000-0000-4000-8000-000000000000";
  const profiles = [{
    id: defaultId,
    name: "Default",
    enableProxyIp: sysConfig.enableProxyIp !== false,
    proxyIpMode: sysConfig.proxyIpMode || "builtin"
  }];
  const usageData = getCachedUsage();
  const userList = Array.isArray(sysConfig?.users) ? sysConfig.users : [];
  if (userList.length > 0) {
    const currentTime = Date.now();
    const dateKey = (/* @__PURE__ */ new Date()).toISOString().split("T")[0];
    for (const account of userList) {
      if (!account?.id) continue;
      if (account.isPaused) continue;
      if (account.expiryMs && currentTime > account.expiryMs) continue;
      const userKey = normalizeIdentifier(account.id);
      const userMetrics = usageData?.users?.[userKey];
      if (account.limitTotalReq && userMetrics) {
        if (usageTotalBytes(userMetrics) >= limitReqToBytes(account.limitTotalReq)) {
          continue;
        }
      }
      if (account.limitDailyReq && userMetrics) {
        const dailyUsage = usageDailyBytes(userMetrics, dateKey);
        if (userMetrics.lastDay === dateKey && dailyUsage >= limitReqToBytes(account.limitDailyReq)) {
          continue;
        }
      }
      if (account.dailyQuotaBytes && userMetrics) {
        const recordedBytes = userMetrics.dBytes || 0;
        if (userMetrics.lastDay === dateKey && recordedBytes >= account.dailyQuotaBytes) {
          continue;
        }
      }
      profiles.push({
        id: account.id,
        name: account.name || "Subscriber",
        enableProxyIp: account.enableProxyIp !== false,
        proxyIpMode: account.proxyIpMode || (account.enableProxyIp === false ? "off" : void 0),
        proxyIp: account.proxyIp || "",
        cleanIp: account.cleanIp || null,
        userMode: account.userMode || null,
        userPorts: account.userPorts || null,
        maxConfigs: account.maxConfigs || null,
        proxyIpGeo: account.proxyIpGeo || null,
        userNodes: account.userNodes || null,
        nat64: account.nat64 || null,
        connLimit: account.connLimit || null,
        userPanelUrl: account.userPanelUrl || null,
        ipOperator: account.ipOperator || "all",
        ipCount: account.ipCount || null,
        userProxyIata: account.userProxyIata || null,
        userSocks5: account.userSocks5 || null,
        dailyQuotaBytes: account.dailyQuotaBytes || null,
        echConfigList: Array.isArray(account.echConfigList) ? account.echConfigList : null,
        alpn: account.alpn || null,
        finalMask: typeof account.finalMask === "string" ? account.finalMask : account.finalMask && typeof account.finalMask === "object" ? account.finalMask : null
      });
    }
  }
  if (!targetSubscriber) {
    return profiles;
  }
  const targetKey = String(targetSubscriber).toLowerCase().trim();
  return profiles.filter(
    (p) => p.name.toLowerCase() === targetKey || p.id.toLowerCase() === targetKey
  );
}
function getCleanIpsWithNames(hostName, customIpList = null, sysConfig = null) {
  const rawContent = customIpList || sysConfig?.cleanIps || sysConfig?.cleanIp || "";
  const results = rawContent.split(/[\r\n,;]+/).map((entry) => {
    const line = entry.trim();
    if (!line) return null;
    const segments = line.split("#");
    const address = segments[0].trim();
    const tag = (segments[1] || "").trim();
    return address ? { ip: address, name: tag } : null;
  }).filter(Boolean);
  if (results.length === 0) {
    const fallback = hostName?.endsWith(".pages.dev") ? sysConfig?.metricNode || "time.is" : hostName;
    return [{ ip: fallback || "127.0.0.1", name: "" }];
  }
  return results;
}
function getProfileHostNames(hostName, profile) {
  const hostList = [hostName];
  if (profile?.userNodes) {
    const extraHosts = profile.userNodes.split(/[\r\n,;]+/).map((h) => h.trim()).filter(Boolean);
    hostList.push(...extraHosts);
  }
  return [...new Set(hostList)];
}
function getEffectivePips(profile, sysConfig) {
  return getEffectiveProxyIpPool(profile, sysConfig);
}
function getEffectiveOutboundRelays(profile, sysConfig) {
  let rawSource = profile?.proxyIp || "";
  let parsed = rawSource.split(/[\r\n,;]+/).map((addr) => addr.trim()).filter(Boolean).filter((addr) => !isCloudflareIp(addr));
  if (parsed.length === 0 && (sysConfig?.backupRelay || sysConfig?.customRelay)) {
    const sysRaw = sysConfig.backupRelay || sysConfig.customRelay || "";
    parsed = sysRaw.split(/[\r\n,;]+/).map((addr) => addr.trim()).filter(Boolean).filter((addr) => !isCloudflareIp(addr));
  }
  if (parsed.length === 0 && Array.isArray(DEFAULT_BACKUP_RELAYS) && DEFAULT_BACKUP_RELAYS.length > 0) {
    return [...DEFAULT_BACKUP_RELAYS];
  }
  return parsed;
}
function calcEffectiveIps(ips, maxConfigs, mode, ports, pipsCount = 1) {
  if (!maxConfigs || maxConfigs <= 0) return ips;
  const modeFactor = mode === "both" ? 2 : 1;
  const portsFactor = Array.isArray(ports) ? ports.length : 1;
  const pipFactor = pipsCount > 0 ? pipsCount : 1;
  const multiplier = modeFactor * portsFactor * pipFactor;
  const allowedLimit = Math.max(1, Math.floor(maxConfigs / multiplier));
  return ips.slice(0, allowedLimit);
}
function trackUsage(uuid, bytes, env, ctx) {
  const store2 = getCachedUsage();
  if (!store2.users) store2.users = {};
  const userKey = normalizeIdentifier(uuid);
  if (!userKey) return;
  const dateKey = (/* @__PURE__ */ new Date()).toISOString().split("T")[0];
  if (!store2.users[userKey]) {
    store2.users[userKey] = {
      reqs: 0,
      dReqs: 0,
      bytes: 0,
      dBytes: 0,
      lastDay: dateKey
    };
  }
  const record = store2.users[userKey];
  if (record.lastDay !== dateKey) {
    record.dReqs = 0;
    record.dBytes = 0;
    record.lastDay = dateKey;
  }
  if (typeof record.bytes !== "number" || record.bytes < 0) {
    record.bytes = Math.floor((record.reqs || 0) * REQ_BYTES_EST2);
  }
  if (typeof record.dBytes !== "number" || record.dBytes < 0) {
    record.dBytes = record.lastDay === dateKey ? Math.floor((record.dReqs || 0) * REQ_BYTES_EST2) : 0;
  }
  if (bytes === 0) {
    record.reqs = (record.reqs || 0) + 1;
    record.dReqs = (record.dReqs || 0) + 1;
  } else if (typeof bytes === "number" && bytes > 0) {
    const added = Math.floor(bytes);
    record.bytes += added;
    record.dBytes += added;
  }
  setCachedUsage(store2);
  const now = Date.now();
  if (now - lastPersistenceSyncTime > 3e4) {
    lastPersistenceSyncTime = now;
    const database = getDbBinding(env);
    if (database) {
      const config = getCachedConfig();
      let configModified = false;
      if (Array.isArray(config.users) && config.users.length > 0) {
        config.users.forEach((u) => {
          if (u.isPaused) return;
          const uKey = normalizeIdentifier(u.id);
          const metrics = store2.users[uKey];
          let lockoutReason = null;
          if (u.expiryMs && Date.now() > u.expiryMs) {
            lockoutReason = `Expiration date reached (${new Date(u.expiryMs).toLocaleDateString()})`;
          } else if (metrics && u.limitTotalReq && usageTotalBytes(metrics) >= limitReqToBytes(u.limitTotalReq)) {
            const usedGb = (usageTotalBytes(metrics) / 1073741824).toFixed(2);
            const maxGb = (limitReqToBytes(u.limitTotalReq) / 1073741824).toFixed(2);
            lockoutReason = `Traffic limit exceeded (${usedGb}GB / ${maxGb}GB)`;
          }
          if (lockoutReason) {
            u.isPaused = true;
            u.disabledReason = lockoutReason;
            u.disabledAt = Date.now();
            configModified = true;
            if (ctx?.waitUntil) {
              ctx.waitUntil(
                logActivity(
                  env,
                  "User Auto-Disabled",
                  `User "${u.name}" (${u.id}) auto-disabled: ${lockoutReason}`
                ).catch(() => {
                })
              );
            }
          }
        });
      }
      const writeUsage = cachedD1Put(env, "sys_usage", JSON.stringify(store2));
      const writeConfig = configModified ? cachedD1Put(env, "sys_config", JSON.stringify(config)) : Promise.resolve();
      if (ctx?.waitUntil) {
        ctx.waitUntil(Promise.all([writeUsage, writeConfig]).catch(() => {
        }));
      }
    }
  }
}
async function handleUsersApi(request, env, ctx, sysConfig) {
  try {
    const url = new URL(request.url);
    const httpMethod = request.method;
    const userId = url.searchParams.get("id");
    const action = url.searchParams.get("action");
    let payload = null;
    if (httpMethod === "POST" || httpMethod === "PUT") {
      try {
        payload = await request.clone().json();
      } catch {
      }
    }
    if (!isAuthorized(request, sysConfig, payload)) {
      return new Response(JSON.stringify({ success: false, error: "Unauthorized" }), {
        status: 401,
        headers: { "Content-Type": "application/json" }
      });
    }
    const usageStore = getCachedUsage();
    if (httpMethod === "GET" && !userId) {
      const query = (url.searchParams.get("q") || "").toLowerCase().trim();
      let catalog = sysConfig.users || [];
      if (query) {
        catalog = catalog.filter(
          (user) => user.name.toLowerCase().includes(query) || user.id.toLowerCase().includes(query) || user.notes && user.notes.toLowerCase().includes(query)
        );
      }
      const enrichedUsers = catalog.map((account) => {
        const uKey = normalizeIdentifier(account.id);
        const metrics = usageStore?.users?.[uKey] || { reqs: 0, dReqs: 0, lastDay: "" };
        const usedVolume = usageTotalBytes(metrics);
        const limitVolume = limitReqToBytes(account.limitTotalReq);
        const isPastExpiry = account.expiryMs && Date.now() > account.expiryMs;
        let accountStatus = "active";
        if (account.isPaused && account.disabledReason) {
          accountStatus = "auto-disabled";
        } else if (account.isPaused) {
          accountStatus = "paused";
        } else if (isPastExpiry) {
          accountStatus = "expired";
        }
        return {
          ...account,
          usage: {
            total: usedVolume,
            limit: limitVolume,
            daily: metrics.dReqs || 0,
            dailyLimit: account.limitDailyReq || 0
          },
          status: accountStatus
        };
      });
      return new Response(
        JSON.stringify({ success: true, users: enrichedUsers, total: enrichedUsers.length }),
        { headers: { "Content-Type": "application/json" } }
      );
    }
    if (httpMethod === "GET" && userId) {
      const targetId = userId.toLowerCase().trim();
      const foundUser = (sysConfig.users || []).find(
        (u) => u.id.toLowerCase() === targetId || u.name.toLowerCase() === targetId
      );
      if (!foundUser) {
        return new Response(JSON.stringify({ success: false, error: "User not found" }), {
          status: 404,
          headers: { "Content-Type": "application/json" }
        });
      }
      return new Response(JSON.stringify({ success: true, user: foundUser }), {
        headers: { "Content-Type": "application/json" }
      });
    }
    if (httpMethod === "POST" && !action) {
      const generatedId = payload?.id || (crypto.randomUUID ? crypto.randomUUID() : `usr_${Date.now()}`);
      const newSubscriber = {
        id: generatedId,
        name: payload?.name || "Subscriber",
        limitTotalReq: Number(payload?.limitTotalReq) || 0,
        limitDailyReq: Number(payload?.limitDailyReq) || 0,
        dailyQuotaBytes: Number(payload?.dailyQuotaBytes) || 0,
        expiryMs: Number(payload?.expiryMs) || 0,
        enableProxyIp: payload?.enableProxyIp !== false,
        proxyIp: payload?.proxyIp || "",
        cleanIp: payload?.cleanIp !== void 0 && payload?.cleanIp !== null && String(payload.cleanIp).trim() !== "" ? String(payload.cleanIp).trim() : "www.speedtest.net",
        echConfigList: Array.isArray(payload?.echConfigList) ? payload.echConfigList : null,
        finalMask: typeof payload?.finalMask === "string" ? payload.finalMask.trim() : payload?.finalMask && typeof payload.finalMask === "object" ? payload.finalMask : "",
        userMode: payload?.userMode || null,
        userPorts: payload?.userPorts || null,
        maxConfigs: payload?.maxConfigs ? Number(payload.maxConfigs) : null,
        connLimit: payload?.connLimit ? Number(payload.connLimit) : null,
        userNodes: payload?.userNodes || "",
        nat64: payload?.nat64 || "",
        ipOperator: payload?.ipOperator || "all",
        ipCount: payload?.ipCount ? Number(payload.ipCount) : null,
        userProxyIata: payload?.userProxyIata || "",
        userSocks5: payload?.userSocks5 || "",
        autoResetVolDays: Number(payload?.autoResetVolDays) || 0,
        autoResetReqDays: Number(payload?.autoResetReqDays) || 0,
        notes: payload?.notes || "",
        isPaused: false,
        createdAt: Date.now()
      };
      if (!sysConfig.users) sysConfig.users = [];
      sysConfig.users.push(newSubscriber);
      setCachedConfig(sysConfig);
      await cachedD1Put(env, "sys_config", JSON.stringify(sysConfig));
      await logActivity(env, "User Created", `Registered subscriber "${newSubscriber.name}" (${newSubscriber.id})`);
      return new Response(JSON.stringify({ success: true, user: newSubscriber }), {
        status: 201,
        headers: { "Content-Type": "application/json" }
      });
    }
    if (httpMethod === "PUT" && userId) {
      if (!sysConfig.users) sysConfig.users = [];
      const index = sysConfig.users.findIndex((u) => u.id === userId);
      if (index === -1) {
        return new Response(JSON.stringify({ success: false, error: "User not found" }), {
          status: 404,
          headers: { "Content-Type": "application/json" }
        });
      }
      sysConfig.users[index] = {
        ...sysConfig.users[index],
        ...payload,
        id: userId
        // ID remains immutable
      };
      setCachedConfig(sysConfig);
      await cachedD1Put(env, "sys_config", JSON.stringify(sysConfig));
      await logActivity(env, "User Updated", `Updated subscriber "${sysConfig.users[index].name}" (${userId})`);
      return new Response(JSON.stringify({ success: true, user: sysConfig.users[index] }), {
        headers: { "Content-Type": "application/json" }
      });
    }
    if (httpMethod === "DELETE" && userId) {
      if (!sysConfig.users) sysConfig.users = [];
      const index = sysConfig.users.findIndex((u) => u.id === userId);
      if (index === -1) {
        return new Response(JSON.stringify({ success: false, error: "User not found" }), {
          status: 404,
          headers: { "Content-Type": "application/json" }
        });
      }
      const removed = sysConfig.users.splice(index, 1)[0];
      setCachedConfig(sysConfig);
      await cachedD1Put(env, "sys_config", JSON.stringify(sysConfig));
      await logActivity(env, "User Deleted", `Removed subscriber "${removed.name}" (${userId})`);
      return new Response(JSON.stringify({ success: true }), {
        headers: { "Content-Type": "application/json" }
      });
    }
    if (httpMethod === "POST" && userId && action === "reset") {
      const uKey = normalizeIdentifier(userId);
      if (usageStore?.users?.[uKey]) {
        usageStore.users[uKey] = {
          reqs: 0,
          dReqs: 0,
          bytes: 0,
          dBytes: 0,
          lastDay: (/* @__PURE__ */ new Date()).toISOString().split("T")[0]
        };
        setCachedUsage(usageStore);
        await cachedD1Put(env, "sys_usage", JSON.stringify(usageStore));
      }
      return new Response(JSON.stringify({ success: true, message: "Usage reset" }), {
        headers: { "Content-Type": "application/json" }
      });
    }
    if (httpMethod === "POST" && userId && action === "toggle") {
      if (!sysConfig.users) sysConfig.users = [];
      const subscriber = sysConfig.users.find((u) => u.id === userId);
      if (!subscriber) {
        return new Response(JSON.stringify({ success: false, error: "User not found" }), {
          status: 404,
          headers: { "Content-Type": "application/json" }
        });
      }
      subscriber.isPaused = !subscriber.isPaused;
      if (!subscriber.isPaused) {
        subscriber.disabledReason = null;
        subscriber.disabledAt = null;
      }
      setCachedConfig(sysConfig);
      await cachedD1Put(env, "sys_config", JSON.stringify(sysConfig));
      await logActivity(
        env,
        subscriber.isPaused ? "User Paused" : "User Resumed",
        `Subscriber "${subscriber.name}" (${userId}) set to ${subscriber.isPaused ? "paused" : "active"}`
      );
      return new Response(JSON.stringify({ success: true, isPaused: subscriber.isPaused }), {
        headers: { "Content-Type": "application/json" }
      });
    }
    return new Response(JSON.stringify({ success: false, error: "Method not allowed" }), {
      status: 405,
      headers: { "Content-Type": "application/json" }
    });
  } catch (err) {
    return new Response(JSON.stringify({ success: false, error: err.message }), {
      status: 500,
      headers: { "Content-Type": "application/json" }
    });
  }
}
async function handleSubSetIp(request, env, ctx, sysConfig) {
  try {
    if (request.method !== "POST") {
      return new Response(JSON.stringify({ success: false, error: "Method not allowed" }), {
        status: 405,
        headers: { "Content-Type": "application/json" }
      });
    }
    const url = new URL(request.url);
    const subName = url.searchParams.get("sub") || url.searchParams.get("u") || "";
    const bodyContent = await request.text();
    const addressLines = bodyContent.split(/[\r\n,;]+/).map((s) => s.trim()).filter(Boolean);
    if (addressLines.length === 0) {
      return new Response(JSON.stringify({ success: false, error: "No IPs provided" }), {
        status: 400,
        headers: { "Content-Type": "application/json" }
      });
    }
    const formattedIps = addressLines.join("\n");
    if (subName) {
      if (!sysConfig.users) sysConfig.users = [];
      const targetUser = sysConfig.users.find(
        (u) => u.name.toLowerCase() === subName.toLowerCase() || u.id.toLowerCase() === subName.toLowerCase()
      );
      if (!targetUser) {
        return new Response(JSON.stringify({ success: false, error: "User not found" }), {
          status: 404,
          headers: { "Content-Type": "application/json" }
        });
      }
      targetUser.cleanIp = formattedIps;
      await logActivity(env, "Radar Clean IP Applied", `Updated clean IPs for user "${targetUser.name}" (${addressLines.length} IPs)`);
    } else {
      sysConfig.cleanIps = formattedIps;
      await logActivity(env, "Radar Clean IP Applied", `Updated global clean IPs (${addressLines.length} IPs)`);
    }
    setCachedConfig(sysConfig);
    await cachedD1Put(env, "sys_config", JSON.stringify(sysConfig));
    return new Response(JSON.stringify({ success: true, count: addressLines.length, message: "Clean IPs applied" }), {
      status: 200,
      headers: { "Content-Type": "application/json" }
    });
  } catch (err) {
    return new Response(JSON.stringify({ success: false, error: err.message }), {
      status: 500,
      headers: { "Content-Type": "application/json" }
    });
  }
}

// LuciProxy/src/auth/auth.js
var LOGIN_ATTEMPTS = /* @__PURE__ */ new Map();
var LOGIN_FAIL_LIMIT = 15;
var LOGIN_WINDOW_MS = 15 * 60 * 1e3;
function authBlocked(ip) {
  try {
    const r = LOGIN_ATTEMPTS.get(ip);
    if (!r) return false;
    if (Date.now() - r.first > LOGIN_WINDOW_MS) {
      LOGIN_ATTEMPTS.delete(ip);
      return false;
    }
    return r.n >= LOGIN_FAIL_LIMIT;
  } catch (e) {
    return false;
  }
}
function authFail(ip) {
  try {
    const now = Date.now();
    let r = LOGIN_ATTEMPTS.get(ip);
    if (!r || now - r.first > LOGIN_WINDOW_MS) r = { n: 0, first: now };
    r.n++;
    LOGIN_ATTEMPTS.set(ip, r);
    if (LOGIN_ATTEMPTS.size > 1e4) LOGIN_ATTEMPTS.clear();
  } catch (e) {
  }
}
function authClear(ip) {
  try {
    LOGIN_ATTEMPTS.delete(ip);
  } catch (e) {
  }
}
function isPanelApiKey(sysConfig, key) {
  if (!key || !sysConfig.panelApiKeys || !Array.isArray(sysConfig.panelApiKeys)) return false;
  return sysConfig.panelApiKeys.some((k) => k.key === key);
}
function extractAuthKey(request, data) {
  const authHeader = request?.headers?.get("Authorization") || "";
  const authKey = authHeader.replace(/^Bearer\s+/i, "") || "";
  let bodyKey = "";
  if (data && typeof data === "object") bodyKey = data.key || "";
  return authKey || bodyKey;
}
function isAuthorized(request, sysConfig, data) {
  try {
    const ip = request?.headers?.get("cf-connecting-ip") || "Unknown";
    if (authBlocked(ip)) return false;
    const key = extractAuthKey(request, data);
    const ok = key === sysConfig.masterKey || isPanelApiKey(sysConfig, key);
    if (!ok) authFail(ip);
    return ok;
  } catch (e) {
    return false;
  }
}
async function handleAuth(request, hostName, ctx, env, sysConfig) {
  try {
    const data = await request.json();
    const ip = request.headers.get("cf-connecting-ip") || "Unknown";
    if (authBlocked(ip)) {
      return new Response(
        JSON.stringify({
          success: false,
          error: "Too many attempts, try later"
        }),
        { status: 429, headers: { "Content-Type": "application/json" } }
      );
    }
    const loginKey = data.key || "";
    const isKeyAuth = loginKey === sysConfig.masterKey || isPanelApiKey(sysConfig, loginKey);
    if (isKeyAuth) {
      authClear(ip);
      if (isPanelApiKey(sysConfig, loginKey)) {
        const apiKeyEntry = (sysConfig.panelApiKeys || []).find((k) => k.key === loginKey);
        if (apiKeyEntry) apiKeyEntry.lastUsed = Date.now();
      }
      const netInfo = {
        ip,
        colo: request.cf?.colo || "Unknown",
        loc: (request.cf?.city || "Unknown") + ", " + (request.cf?.country || "Unknown")
      };
      let baseHost = hostName;
      let protocol = "https";
      if (sysConfig.customPanelUrl && sysConfig.customPanelUrl.trim()) {
        let customUrlStr = sysConfig.customPanelUrl.trim();
        if (!customUrlStr.startsWith("http://") && !customUrlStr.startsWith("https://")) {
          customUrlStr = "https://" + customUrlStr;
        }
        try {
          const customUrl = new URL(customUrlStr);
          baseHost = customUrl.host;
          protocol = customUrl.protocol.replace(":", "");
        } catch (e) {
        }
      }
      const sysUsageCache = getCachedUsage();
      return new Response(
        JSON.stringify({
          success: true,
          config: isPanelApiKey(sysConfig, loginKey) ? {
            ...sysConfig,
            masterKey: "[PROTECTED]",
            panelApiKeys: "[PROTECTED]",
            cfApiToken: "[PROTECTED]",
            cfAccountId: "[PROTECTED]",
            cfWorkerName: "[PROTECTED]",
            tgToken: "[PROTECTED]",
            tgChatId: "[PROTECTED]",
            tgAdminId: "[PROTECTED]",
            syncApiKey: "[PROTECTED]"
          } : sysConfig,
          deviceId: sysConfig.deviceId,
          network: netInfo,
          usage: {},
          sysUsage: sysUsageCache?.users || {},
          version: CURRENT_VERSION,
          profiles: getAllProfiles(sysConfig).map((p) => {
            let subSuffix = p.name === "Default" ? "" : "?sub=" + encodeURIComponent(p.name);
            return {
              name: p.name,
              id: p.id,
              sync: `${protocol}://${baseHost}/${sysConfig.apiRoute}${subSuffix}`
            };
          })
        }),
        { status: 200, headers: { "Content-Type": "application/json" } }
      );
    }
    authFail(ip);
    return new Response(JSON.stringify({ success: false, error: "Invalid credentials" }), {
      status: 401,
      headers: { "Content-Type": "application/json" }
    });
  } catch (e) {
    return new Response(JSON.stringify({ success: false, error: "Bad Request" }), {
      status: 400,
      headers: { "Content-Type": "application/json" }
    });
  }
}
async function autoRotateSecretPaths(env, sysConfig, force = false) {
  if (!sysConfig.autoRotatePath && !force) {
    return { skipped: true, reason: "autoRotatePath disabled" };
  }
  const intervalDays = Math.max(1, sysConfig.autoRotatePathDays || 30);
  const intervalMs = intervalDays * 24 * 60 * 60 * 1e3;
  const lastRotateStr = await d1Get(env, "last_auto_path_rotate");
  const lastRotate = parseInt(lastRotateStr || "0", 10);
  if (!force && Date.now() - lastRotate < intervalMs) {
    return { skipped: true, reason: "rotation not due" };
  }
  const randomHex = () => Array.from(crypto.getRandomValues(new Uint8Array(6))).map((b) => b.toString(16).padStart(2, "0")).join("");
  const newAdminPath = randomHex();
  const newSubPath = randomHex();
  sysConfig.adminPath = newAdminPath;
  sysConfig.apiRoute = newSubPath;
  setCachedConfig(sysConfig);
  await cachedD1Put(env, "sys_config", JSON.stringify(sysConfig));
  await d1Put(env, "last_auto_path_rotate", String(Date.now()));
  await logActivity(env, "Path Rotation", `Secret paths rotated: admin=/${newAdminPath}, sync=/${newSubPath}`);
  if (sysConfig.tgToken && (sysConfig.tgChatId || sysConfig.tgAdminId)) {
    const chatId = sysConfig.tgAdminId || sysConfig.tgChatId;
    const msg = `\u{1F504} <b>LuciProxy Path Rotation</b>

Administrative routes updated.
New Admin: <code>/${newAdminPath}/dash</code>
New Subscription: <code>/${newSubPath}</code>`;
    try {
      await fetch(`https://api.telegram.org/bot${sysConfig.tgToken}/sendMessage`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ chat_id: chatId, text: msg, parse_mode: "HTML" })
      });
    } catch (e) {
    }
  }
  return {
    rotated: true,
    adminPath: newAdminPath,
    subPath: newSubPath,
    rotatedAt: Date.now()
  };
}

// LuciProxy/src/api/sync.js
async function handleConfigSync(request, env, ctx, sysConfig) {
  try {
    const data = await request.json();
    if (!isAuthorized(request, sysConfig, data)) {
      return new Response(
        JSON.stringify({ success: false, error: "Unauthorized" }),
        { status: 401, headers: { "Content-Type": "application/json" } }
      );
    }
    const incomingConfig = data.config || data;
    const nextConfig = {
      ...sysConfig,
      ...incomingConfig || {}
    };
    delete nextConfig.key;
    if (Array.isArray(incomingConfig?.users)) {
      nextConfig.users = incomingConfig.users;
    }
    const requestedKey = incomingConfig?.masterKey ? String(incomingConfig.masterKey).trim() : "";
    const isKeyRotation = Boolean(requestedKey && requestedKey !== sysConfig.masterKey);
    if (isKeyRotation) {
      nextConfig.masterKey = requestedKey;
    } else {
      nextConfig.masterKey = sysConfig.masterKey;
    }
    setCachedConfig(nextConfig);
    Object.assign(sysConfig, nextConfig);
    const db = getDbBinding(env);
    if (db) {
      const configToStore = { ...nextConfig };
      const envKey = env?.MASTER_KEY || env?.INITIAL_ADMIN_KEY || "";
      if (envKey && nextConfig.masterKey === envKey) {
        delete configToStore.masterKey;
      } else {
        configToStore.masterKey = nextConfig.masterKey;
      }
      await cachedD1Put(env, "sys_config", JSON.stringify(configToStore));
    }
    if (ctx?.waitUntil) {
      ctx.waitUntil(logActivity(env, "Config Sync", "System settings updated via API"));
    } else {
      await logActivity(env, "Config Sync", "System settings updated via API");
    }
    return new Response(JSON.stringify({ success: true, config: nextConfig }), {
      status: 200,
      headers: { "Content-Type": "application/json" }
    });
  } catch (err) {
    return new Response(JSON.stringify({ success: false, error: err.message }), {
      status: 400,
      headers: { "Content-Type": "application/json" }
    });
  }
}

// LuciProxy/src/api/stats.js
async function handleStatsApi(request, env, sysConfig) {
  try {
    const ip = request.headers.get("cf-connecting-ip") || "Unknown";
    const colo = request.cf?.colo || "Local";
    const country = request.cf?.country || "XX";
    const city = request.cf?.city || "Unknown";
    const users = sysConfig.users || [];
    const totalUsers = users.length;
    const activeUsersCount = users.filter((u) => !u.isPaused).length;
    const sysUsageCache = getCachedUsage();
    let totalTrafficBytes = 0;
    if (sysUsageCache?.users) {
      for (const u of Object.values(sysUsageCache.users)) {
        totalTrafficBytes += u.bytes || 0;
      }
    }
    let liveConnections = 0;
    for (const count of activeConns.values()) {
      liveConnections += count;
    }
    const metrics = {
      totalUsers,
      activeUsers: activeUsersCount,
      liveConnections,
      totalTrafficBytes,
      totalTrafficGb: (totalTrafficBytes / 1073741824).toFixed(2)
    };
    const url = new URL(request.url);
    if (url.searchParams.get("cfUsage") === "1" || env.CF_ACCOUNT_ID || sysConfig.accID) {
      const cfUsage = await getCfWorkerUsage(env, sysConfig, url.hostname);
      if (cfUsage.success) {
        metrics.cfWorkerUsage = {
          totalRequests: cfUsage.total,
          workerRequests: cfUsage.worker,
          freeQuotaLimit: 1e5,
          percentUsed: Math.ceil((cfUsage.worker || 0) / 1e5 * 100)
        };
      }
    }
    return new Response(
      JSON.stringify({
        success: true,
        version: CURRENT_VERSION,
        name: sysConfig.name || "LuciProxy",
        status: sysConfig.isPaused ? "paused" : "running",
        maintenanceMode: Boolean(sysConfig.maintenanceMode),
        edge: {
          ip,
          colo,
          location: `${city}, ${country}`
        },
        metrics
      }),
      {
        status: 200,
        headers: {
          "Content-Type": "application/json",
          "Cache-Control": "no-store"
        }
      }
    );
  } catch (err) {
    return new Response(JSON.stringify({ success: false, error: err.message }), {
      status: 500,
      headers: { "Content-Type": "application/json" }
    });
  }
}
async function getCfWorkerUsage(env, sysConfig, hostname) {
  const accID = env.CF_ACCOUNT_ID || sysConfig.accID || "";
  const apiToken = env.CF_API_TOKEN || sysConfig.apiToken || "";
  const scriptName = sysConfig.scriptName || (hostname ? hostname.split(".")[0] : "luciproxy");
  if (!accID || !apiToken) {
    return { success: false, error: "Missing Cloudflare Account ID or API Token" };
  }
  try {
    const now = /* @__PURE__ */ new Date();
    const datetimeEnd = now.toISOString();
    const datetimeStart = new Date(now.getTime() - 24 * 60 * 60 * 1e3).toISOString();
    const gqlQuery = {
      query: `
                query GetUsage($accountTag: String!, $scriptName: String!, $start: String!, $end: String!) {
                    viewer {
                        accounts(filter: { accountTag: $accountTag }) {
                            total: workersInvocationsAdaptive(
                                limit: 100
                                filter: { datetime_geq: $start, datetime_leq: $end }
                            ) {
                                sum { requests }
                            }
                            worker: workersInvocationsAdaptive(
                                limit: 100
                                filter: { scriptName: $scriptName, datetime_geq: $start, datetime_leq: $end }
                            ) {
                                sum { requests }
                            }
                        }
                    }
                }
            `,
      variables: {
        accountTag: accID,
        scriptName,
        start: datetimeStart,
        end: datetimeEnd
      }
    };
    const gqlRes = await fetch(`https://api.cloudflare.com/client/v4/graphql?nocache=${Date.now()}`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiToken}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify(gqlQuery)
    });
    const gqlData = await gqlRes.json();
    const account = gqlData?.data?.viewer?.accounts?.[0];
    const totalRequests = (account?.total ?? []).reduce(
      (sum, entry) => sum + (entry?.sum?.requests || 0),
      0
    );
    const workerRequests = (account?.worker ?? []).reduce(
      (sum, entry) => sum + (entry?.sum?.requests || 0),
      0
    );
    return { success: true, total: totalRequests, worker: workerRequests };
  } catch (error) {
    return { success: false, error: error.message || "Failed to fetch CF usage" };
  }
}

// LuciProxy/src/protocols/vless.js
function parseVlessHeader(bufferData) {
  if (!bufferData || bufferData.byteLength < 24) {
    return { hasError: true, message: "VLESS header too short" };
  }
  const view = new Uint8Array(bufferData);
  if (view[0] !== 0) {
    return { hasError: true, message: "Invalid VLESS version" };
  }
  const clientUuidHex = Array.from(view.slice(1, 17)).map((b) => b.toString(16).padStart(2, "0")).join("");
  const optLen = view[17];
  const cmdPos = 18 + optLen;
  if (cmdPos >= view.byteLength) {
    return { hasError: true, message: "Truncated VLESS addons" };
  }
  const command = view[cmdPos];
  const isUDP = command === 2;
  const pPos = cmdPos + 1;
  if (pPos + 2 >= view.byteLength) {
    return { hasError: true, message: "Truncated VLESS port" };
  }
  const dv = new DataView(bufferData);
  const targetPort = dv.getUint16(pPos);
  const aType = view[pPos + 2];
  let vPos = pPos + 3;
  let targetAddr = "";
  let offset = 0;
  if (aType === 1) {
    if (vPos + 4 > view.byteLength) return { hasError: true, message: "Truncated IPv4" };
    targetAddr = Array.from(view.slice(vPos, vPos + 4)).join(".");
    offset = vPos + 4;
  } else if (aType === 2) {
    const domainLen = view[vPos];
    vPos++;
    if (vPos + domainLen > view.byteLength) return { hasError: true, message: "Truncated domain" };
    targetAddr = new TextDecoder().decode(view.slice(vPos, vPos + domainLen));
    offset = vPos + domainLen;
  } else if (aType === 3) {
    if (vPos + 16 > view.byteLength) return { hasError: true, message: "Truncated IPv6" };
    const ipv6Parts = [];
    for (let i = 0; i < 8; i++) {
      ipv6Parts.push(dv.getUint16(vPos + i * 2).toString(16));
    }
    targetAddr = ipv6Parts.join(":");
    offset = vPos + 16;
  } else {
    return { hasError: true, message: `Unsupported address type: ${aType}` };
  }
  return {
    hasError: false,
    clientUuidHex,
    targetPort,
    targetAddr,
    isUDP,
    offset
  };
}

// LuciProxy/src/protocols/trojan.js
function parseTrojanHeader(bufferData) {
  if (!bufferData || bufferData.byteLength < 58) {
    return { hasError: true, message: "Trojan header too short" };
  }
  const view = new Uint8Array(bufferData);
  let ePos = -1;
  for (let i = 0; i < Math.min(view.byteLength - 1, 128); i++) {
    if (view[i] === 13 && view[i + 1] === 10) {
      ePos = i;
      break;
    }
  }
  if (ePos === -1) {
    return { hasError: true, message: "Invalid Trojan header (CRLF missing)" };
  }
  const clientHashHex = new TextDecoder().decode(view.slice(0, ePos));
  let hPos = ePos + 2;
  if (hPos + 3 >= view.byteLength) {
    return { hasError: true, message: "Truncated Trojan command" };
  }
  const command = view[hPos];
  const isUDP = command === 3;
  hPos++;
  const aType = view[hPos];
  hPos++;
  let targetAddr = "";
  const dv = new DataView(bufferData);
  if (aType === 1) {
    if (hPos + 4 > view.byteLength) return { hasError: true, message: "Truncated IPv4" };
    targetAddr = Array.from(view.slice(hPos, hPos + 4)).join(".");
    hPos += 4;
  } else if (aType === 3) {
    const domainLen = view[hPos];
    hPos++;
    if (hPos + domainLen > view.byteLength) return { hasError: true, message: "Truncated domain" };
    targetAddr = new TextDecoder().decode(view.slice(hPos, hPos + domainLen));
    hPos += domainLen;
  } else if (aType === 4) {
    if (hPos + 16 > view.byteLength) return { hasError: true, message: "Truncated IPv6" };
    const ipv6Parts = [];
    for (let i = 0; i < 8; i++) {
      ipv6Parts.push(dv.getUint16(hPos + i * 2).toString(16));
    }
    targetAddr = ipv6Parts.join(":");
    hPos += 16;
  } else {
    return { hasError: true, message: `Unsupported Trojan address type: ${aType}` };
  }
  if (hPos + 2 > view.byteLength) {
    return { hasError: true, message: "Truncated Trojan port" };
  }
  const targetPort = dv.getUint16(hPos);
  hPos += 2;
  if (hPos + 2 <= view.byteLength && view[hPos] === 13 && view[hPos + 1] === 10) {
    hPos += 2;
  }
  return {
    hasError: false,
    clientHashHex,
    targetPort,
    targetAddr,
    isUDP,
    offset: hPos
  };
}

// LuciProxy/src/utils/crypto.js
var SHA256_K = new Uint32Array([
  1116352408,
  1899447441,
  3049323471,
  3921009573,
  961987163,
  1508970993,
  2453635748,
  2870763221,
  3624381080,
  310598401,
  607225278,
  1426881987,
  1925078388,
  2162078206,
  2614888103,
  3248222580,
  3835390401,
  4022224774,
  264347078,
  604807628,
  770255983,
  1249150122,
  1555081692,
  1996064986,
  2554220882,
  2821834349,
  2952996808,
  3210313671,
  3336571891,
  3584528711,
  113926993,
  338241895,
  666307205,
  773529912,
  1294757372,
  1396182291,
  1695183700,
  1986661051,
  2177026350,
  2456956037,
  2730485921,
  2820302411,
  3259730800,
  3345764771,
  3516065817,
  3600352804,
  4094571909,
  275423344,
  430227734,
  506948616,
  659060556,
  883997877,
  958139571,
  1322822218,
  1537002063,
  1747873779,
  1955562222,
  2024104815,
  2227730452,
  2361852424,
  2428436474,
  2756734187,
  3204031479,
  3329325298
]);
function sha224Hex(input) {
  const rawBytes = new TextEncoder().encode(input || "");
  const bitLen = rawBytes.length * 8;
  const totalBytes = rawBytes.length + 8 + 64 >> 6 << 6;
  const padded = new Uint8Array(totalBytes);
  padded.set(rawBytes);
  padded[rawBytes.length] = 128;
  const view = new DataView(padded.buffer);
  view.setUint32(totalBytes - 4, bitLen >>> 0, false);
  view.setUint32(totalBytes - 8, Math.floor(bitLen / 4294967296) >>> 0, false);
  let h0 = 3238371032;
  let h1 = 914150663;
  let h2 = 812702999;
  let h3 = 4144912697;
  let h4 = 4290775857;
  let h5 = 1750603025;
  let h6 = 1694076839;
  let h7 = 3204075428;
  const w = new Uint32Array(64);
  for (let offset = 0; offset < totalBytes; offset += 64) {
    for (let i = 0; i < 16; i++) {
      w[i] = view.getUint32(offset + i * 4, false);
    }
    for (let i = 16; i < 64; i++) {
      const s0 = (w[i - 15] >>> 7 | w[i - 15] << 25) ^ (w[i - 15] >>> 18 | w[i - 15] << 14) ^ w[i - 15] >>> 3;
      const s1 = (w[i - 2] >>> 17 | w[i - 2] << 15) ^ (w[i - 2] >>> 19 | w[i - 2] << 13) ^ w[i - 2] >>> 10;
      w[i] = w[i - 16] + s0 + w[i - 7] + s1 >>> 0;
    }
    let a = h0, b = h1, c = h2, d = h3, e = h4, f = h5, g = h6, h = h7;
    for (let i = 0; i < 64; i++) {
      const sum1 = (e >>> 6 | e << 26) ^ (e >>> 11 | e << 21) ^ (e >>> 25 | e << 7);
      const ch = e & f ^ ~e & g;
      const temp1 = h + sum1 + ch + SHA256_K[i] + w[i] >>> 0;
      const sum0 = (a >>> 2 | a << 30) ^ (a >>> 13 | a << 19) ^ (a >>> 22 | a << 10);
      const maj = a & b ^ a & c ^ b & c;
      const temp2 = sum0 + maj >>> 0;
      h = g;
      g = f;
      f = e;
      e = d + temp1 >>> 0;
      d = c;
      c = b;
      b = a;
      a = temp1 + temp2 >>> 0;
    }
    h0 = h0 + a >>> 0;
    h1 = h1 + b >>> 0;
    h2 = h2 + c >>> 0;
    h3 = h3 + d >>> 0;
    h4 = h4 + e >>> 0;
    h5 = h5 + f >>> 0;
    h6 = h6 + g >>> 0;
    h7 = h7 + h >>> 0;
  }
  const outWords = [h0, h1, h2, h3, h4, h5, h6];
  return outWords.map((val) => val.toString(16).padStart(8, "0")).join("");
}
var trojanCache = /* @__PURE__ */ new Map();
function getTrojanHash(uuid) {
  if (!uuid) return "";
  let hash = trojanCache.get(uuid);
  if (!hash) {
    hash = sha224Hex(uuid);
    trojanCache.set(uuid, hash);
  }
  return hash;
}
function safeBtoa(str) {
  try {
    const bytes = new TextEncoder().encode(str);
    let binStr = "";
    const len = bytes.length;
    for (let i = 0; i < len; i++) {
      binStr += String.fromCharCode(bytes[i]);
    }
    return btoa(binStr);
  } catch {
    return btoa(unescape(encodeURIComponent(str)));
  }
}
function generateHardwareId(seed = "sync") {
  const raw = Array.from(new TextEncoder().encode(seed)).map((b) => b.toString(16).padStart(2, "0")).join("").slice(0, 20).padEnd(20, "0");
  return `${raw.slice(0, 8)}-0000-4000-8000-${raw.slice(-12)}`;
}
function decodeConfigUuid(compositeUuid) {
  const clean = (compositeUuid || "").replace(/-/g, "").toLowerCase();
  if (clean.length !== 32) return null;
  const userFingerprint = clean.slice(0, 24);
  const relayIpIndex = parseInt(clean.slice(24, 32), 16);
  return {
    userFingerprint,
    relayIpIndex: isNaN(relayIpIndex) ? 0 : relayIpIndex
  };
}

// LuciProxy/src/protocols/dns_resolver.js
var dnsCache = /* @__PURE__ */ new Map();
var CACHE_TTL_MS = 6e4;
function encodeDnsQuery(hostname, qtype = 1) {
  const cleanHost = String(hostname || "").trim().toLowerCase();
  const labels = cleanHost.split(".").filter(Boolean);
  let qnameLen = 1;
  for (const label of labels) {
    qnameLen += 1 + label.length;
  }
  const buffer = new Uint8Array(12 + qnameLen + 4);
  const view = new DataView(buffer.buffer);
  view.setUint16(0, 4660);
  view.setUint16(2, 256);
  view.setUint16(4, 1);
  view.setUint16(6, 0);
  view.setUint16(8, 0);
  view.setUint16(10, 0);
  let offset = 12;
  for (const label of labels) {
    buffer[offset++] = label.length;
    for (let i = 0; i < label.length; i++) {
      buffer[offset++] = label.charCodeAt(i);
    }
  }
  buffer[offset++] = 0;
  view.setUint16(offset, qtype);
  offset += 2;
  view.setUint16(offset, 1);
  return buffer;
}
function parseDnsResponse(responseBuffer, expectedType = 1) {
  if (!responseBuffer) return [];
  const buffer = responseBuffer instanceof Uint8Array ? responseBuffer : new Uint8Array(responseBuffer);
  if (buffer.byteLength < 12) return [];
  const view = new DataView(buffer.buffer, buffer.byteOffset, buffer.byteLength);
  const flags = view.getUint16(2);
  const rcode = flags & 15;
  if (rcode !== 0) return [];
  const qdcount = view.getUint16(4);
  const ancount = view.getUint16(6);
  if (ancount === 0) return [];
  let offset = 12;
  function skipName(pos) {
    while (pos < buffer.byteLength) {
      const len = buffer[pos];
      if (len === 0) return pos + 1;
      if ((len & 192) === 192) {
        return pos + 2;
      }
      pos += 1 + len;
    }
    return pos;
  }
  for (let q = 0; q < qdcount; q++) {
    offset = skipName(offset);
    offset += 4;
    if (offset > buffer.byteLength) return [];
  }
  const ips = [];
  for (let a = 0; a < ancount && offset < buffer.byteLength; a++) {
    offset = skipName(offset);
    if (offset + 10 > buffer.byteLength) break;
    const type = view.getUint16(offset);
    const rdLength = view.getUint16(offset + 8);
    offset += 10;
    if (offset + rdLength > buffer.byteLength) break;
    if (type === 1 && expectedType === 1 && rdLength === 4) {
      const ip = `${buffer[offset]}.${buffer[offset + 1]}.${buffer[offset + 2]}.${buffer[offset + 3]}`;
      ips.push(ip);
    } else if (type === 28 && expectedType === 28 && rdLength === 16) {
      const parts = [];
      for (let i = 0; i < 8; i++) {
        parts.push(view.getUint16(offset + i * 2).toString(16));
      }
      ips.push(parts.join(":"));
    }
    offset += rdLength;
  }
  return ips;
}
function uint8ArrayToBase64Url(u8) {
  if (!u8) return "";
  const arr = u8 instanceof Uint8Array ? u8 : new Uint8Array(u8);
  let binary = "";
  for (let i = 0; i < arr.byteLength; i++) {
    binary += String.fromCharCode(arr[i]);
  }
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}
function normalizeDohUrl(rawUrl) {
  if (!rawUrl || typeof rawUrl !== "string") {
    return "https://dns.google/dns-query";
  }
  let trimmed = rawUrl.trim();
  if (!trimmed) {
    return "https://dns.google/dns-query";
  }
  if (trimmed.includes("cloudflare-dns.com") || trimmed.includes("://1.1.1.1/") || trimmed.includes("://1.0.0.1/")) {
    trimmed = "https://dns.google/dns-query";
  }
  try {
    const parsed = new URL(trimmed);
    if (parsed.hostname === "8.8.8.8" || parsed.hostname === "8.8.4.4") {
      parsed.hostname = "dns.google";
      return parsed.toString();
    }
    if (parsed.hostname === "1.1.1.1" || parsed.hostname === "1.0.0.1") {
      return "https://dns.google/dns-query";
    }
    return parsed.toString();
  } catch {
    return "https://dns.google/dns-query";
  }
}
async function resolveDomainDoh(domain, dohUrl, recordType = "A", timeoutMs = 5e3, fallbackDohUrl = "https://dns.google/dns-query") {
  if (!domain) return null;
  const cleanDomain = domain.trim().toLowerCase();
  const activeDohUrl = normalizeDohUrl(dohUrl || fallbackDohUrl);
  const activeFallback = fallbackDohUrl ? normalizeDohUrl(fallbackDohUrl) : null;
  const cacheKey = `${cleanDomain}:${recordType}:${activeDohUrl}`;
  const cached = dnsCache.get(cacheKey);
  if (cached && Date.now() - cached.timestamp < CACHE_TTL_MS) {
    return cached.ip;
  }
  const isV6 = recordType === "AAAA";
  const qtype = isV6 ? 28 : 1;
  let parsedUrl;
  try {
    parsedUrl = new URL(activeDohUrl);
  } catch {
    if (activeFallback && activeFallback !== activeDohUrl) {
      return resolveDomainDoh(cleanDomain, activeFallback, recordType, timeoutMs, null);
    }
    return null;
  }
  const tryFallback = async () => {
    if (activeFallback && activeFallback !== activeDohUrl) {
      return await resolveDomainDoh(cleanDomain, activeFallback, recordType, timeoutMs, null);
    }
    return null;
  };
  const isJsonEndpoint = parsedUrl.pathname.endsWith("/resolve") || parsedUrl.searchParams.get("format") === "json";
  try {
    if (isJsonEndpoint) {
      const targetUrl = new URL(activeDohUrl);
      targetUrl.searchParams.set("name", cleanDomain);
      targetUrl.searchParams.set("type", recordType);
      const res = await fetchT(targetUrl.toString(), {
        method: "GET",
        headers: { "Accept": "application/dns-json" }
      }, timeoutMs);
      if (!res.ok) return await tryFallback();
      const data = await res.json();
      if (data && data.Answer && data.Answer.length > 0) {
        const match = data.Answer.find((ans) => ans.type === qtype);
        const resolvedIp = match ? match.data : data.Answer[0].data;
        if (resolvedIp) {
          dnsCache.set(cacheKey, { ip: resolvedIp, timestamp: Date.now() });
          return resolvedIp;
        }
      }
      return await tryFallback();
    } else {
      const wireQuery = encodeDnsQuery(cleanDomain, qtype);
      const b64 = uint8ArrayToBase64Url(wireQuery);
      const queryUrl = new URL(activeDohUrl);
      queryUrl.searchParams.set("dns", b64);
      const res = await fetchT(queryUrl.toString(), {
        method: "GET",
        headers: {
          "Accept": "application/dns-message"
        }
      }, timeoutMs);
      if (!res.ok) return await tryFallback();
      const bodyBuf = await res.arrayBuffer();
      const ips = parseDnsResponse(bodyBuf, qtype);
      if (ips.length > 0) {
        const resolvedIp = ips[0];
        dnsCache.set(cacheKey, { ip: resolvedIp, timestamp: Date.now() });
        return resolvedIp;
      }
      return await tryFallback();
    }
  } catch {
    return await tryFallback();
  }
}
async function forwardUdpDnsPacket(rawPayload, isVless, sysConfig = {}) {
  if (!rawPayload) return null;
  const view = rawPayload instanceof Uint8Array ? rawPayload : new Uint8Array(rawPayload);
  if (view.byteLength < 2) return null;
  let dnsQueryBytes = null;
  if (isVless) {
    const pktLen = view[0] << 8 | view[1];
    if (view.byteLength >= 2 + pktLen && pktLen > 0) {
      dnsQueryBytes = view.slice(2, 2 + pktLen);
    } else if (view.byteLength > 2) {
      dnsQueryBytes = view.slice(2);
    }
  } else {
    if (view.byteLength >= 12) {
      dnsQueryBytes = view;
    }
  }
  if (!dnsQueryBytes || dnsQueryBytes.byteLength < 12) return null;
  const rawDoh = sysConfig.customDns || sysConfig.remoteDns || "https://dns.google/dns-query";
  const dohUrl = normalizeDohUrl(rawDoh);
  try {
    const b64 = uint8ArrayToBase64Url(dnsQueryBytes);
    const queryUrl = new URL(dohUrl);
    queryUrl.searchParams.set("dns", b64);
    const res = await fetchT(queryUrl.toString(), {
      method: "GET",
      headers: {
        "Accept": "application/dns-message"
      }
    }, 5e3);
    if (!res.ok) return null;
    const answerBuffer = await res.arrayBuffer();
    const answerBytes = new Uint8Array(answerBuffer);
    if (isVless) {
      const resp = new Uint8Array(2 + answerBytes.byteLength);
      resp[0] = answerBytes.byteLength >> 8 & 255;
      resp[1] = answerBytes.byteLength & 255;
      resp.set(answerBytes, 2);
      return resp;
    } else {
      return answerBytes;
    }
  } catch {
    return null;
  }
}

// LuciProxy/src/protocols/proxy.js
var customSocketConnector = null;
async function resolveConnectFunction() {
  if (customSocketConnector) return customSocketConnector;
  try {
    const socketsModule = await import("cloudflare:sockets");
    return socketsModule.connect;
  } catch {
    return null;
  }
}
async function processTelemetryStream(reqOrEnv, envOrCtx, ctxOrIdx, wsRelayIdxOrSys, maybeSys) {
  let request = null;
  let env, ctx, relayIndex, sysConfig;
  if (reqOrEnv && typeof reqOrEnv.headers?.get === "function") {
    request = reqOrEnv;
    env = envOrCtx;
    ctx = ctxOrIdx;
    relayIndex = wsRelayIdxOrSys;
    sysConfig = maybeSys;
  } else {
    env = reqOrEnv;
    ctx = envOrCtx;
    relayIndex = ctxOrIdx;
    sysConfig = wsRelayIdxOrSys;
  }
  if (sysConfig?.isPaused) {
    return new Response("Service Paused", { status: 503 });
  }
  let earlyDataPayload = "";
  if (request) {
    earlyDataPayload = request.headers.get("sec-websocket-protocol") || request.headers.get("early-data") || "";
    if (!earlyDataPayload) {
      try {
        const reqUrl = new URL(request.url);
        const edParam = reqUrl.searchParams.get("ed");
        if (edParam && edParam.length > 20) {
          earlyDataPayload = edParam;
        }
      } catch {
      }
    }
  }
  const [clientSocket, edgeSocket] = Object.values(new WebSocketPair());
  edgeSocket.accept();
  edgeSocket.binaryType = "arraybuffer";
  startDataPipe(edgeSocket, env, ctx, relayIndex, sysConfig, earlyDataPayload, request);
  const upgradeHeaders = new Headers();
  if (earlyDataPayload && request?.headers?.has("sec-websocket-protocol")) {
    upgradeHeaders.set("Sec-WebSocket-Protocol", earlyDataPayload);
  }
  return new Response(null, {
    status: 101,
    webSocket: clientSocket,
    headers: upgradeHeaders
  });
}
async function startDataPipe(webSocket, env, ctx, relayIndex, sysConfig, earlyDataPayload = "", request = null) {
  incrementOpenWs();
  let uploadedBytes = 0;
  let downloadedBytes = 0;
  let authenticatedUserKey = null;
  let remoteSocket = null;
  let socketWriter = null;
  let isInitialPacket = true;
  let processingChain = Promise.resolve();
  let pendingBytes = 0;
  let pendingItems = 0;
  const teardown = () => {
    decrementOpenWs();
    if (authenticatedUserKey) {
      const openStreams = activeConns.get(authenticatedUserKey) || 0;
      if (openStreams > 0) {
        activeConns.set(authenticatedUserKey, openStreams - 1);
      }
    }
    try {
      const totalVolumetricBytes = uploadedBytes + downloadedBytes;
      if (authenticatedUserKey && totalVolumetricBytes > 0) {
        trackUsage(authenticatedUserKey, totalVolumetricBytes, env, ctx);
      }
    } catch {
    }
  };
  webSocket.addEventListener("close", teardown);
  webSocket.addEventListener("error", () => {
  });
  let isUdpDns = false;
  let isVlessSession = false;
  async function dispatchChunk(chunkBuffer) {
    if (isInitialPacket) {
      isInitialPacket = false;
      const session = await parseAndConnect(chunkBuffer, relayIndex, sysConfig, env, ctx, request);
      if (!session || session.hasError) {
        try {
          webSocket.close();
        } catch {
        }
        return;
      }
      authenticatedUserKey = session.activeClientHash;
      isVlessSession = Boolean(session.isVless);
      if (session.isUdpDns) {
        isUdpDns = true;
        if (session.isVless) {
          webSocket.send(new Uint8Array([0, 0]));
        }
        if (session.firstChunk) {
          const dnsAns = await forwardUdpDnsPacket(session.firstChunk, session.isVless, sysConfig);
          if (dnsAns) {
            webSocket.send(dnsAns);
            uploadedBytes += session.firstChunk.byteLength || 0;
            downloadedBytes += dnsAns.byteLength || 0;
          }
        }
        return;
      }
      remoteSocket = session.remoteSocket;
      socketWriter = remoteSocket?.writable?.getWriter();
      if (session.isVless) {
        webSocket.send(new Uint8Array([0, 0]));
      }
      if (session.firstChunk && socketWriter) {
        await socketWriter.write(session.firstChunk);
        uploadedBytes += session.firstChunk.byteLength || 0;
      }
      const runPump = async (sock, canRetry = true) => {
        let hasIncomingData = false;
        try {
          await pumpDownstream(
            sock,
            webSocket,
            (chunkSize) => {
              hasIncomingData = true;
              downloadedBytes += chunkSize;
            },
            DOWNSTREAM_READ_TIMEOUT_MS,
            false
          );
        } catch {
        }
        if (!hasIncomingData && canRetry && webSocket.readyState === 1) {
          const fallbackSock = await connectFallbackSocket(
            session.connectProvider,
            session.resolvedDestination,
            session.destinationPort,
            session.matchingProfile,
            sysConfig,
            session.activeClientHash,
            request
          );
          if (fallbackSock) {
            try {
              sock?.close();
            } catch {
            }
            remoteSocket = fallbackSock;
            socketWriter = remoteSocket?.writable?.getWriter();
            if (session.firstChunk && socketWriter) {
              await socketWriter.write(session.firstChunk);
            }
            return await runPump(remoteSocket, false);
          }
        }
        try {
          webSocket.close();
        } catch {
        }
      };
      runPump(remoteSocket, true);
    } else if (isUdpDns) {
      const dnsAns = await forwardUdpDnsPacket(chunkBuffer, isVlessSession, sysConfig);
      if (dnsAns) {
        webSocket.send(dnsAns);
        uploadedBytes += chunkBuffer.byteLength || 0;
        downloadedBytes += dnsAns.byteLength || 0;
      }
    } else if (socketWriter) {
      await withDeadline(
        socketWriter.write(chunkBuffer),
        UPSTREAM_WRITE_TIMEOUT_MS,
        () => {
          try {
            remoteSocket?.close();
          } catch {
          }
        },
        "upstream-write"
      );
      uploadedBytes += chunkBuffer.byteLength || 0;
    }
  }
  const earlyBytes = base64ToArrayBuffer(earlyDataPayload);
  if (earlyBytes && earlyBytes.byteLength > 0) {
    processingChain = processingChain.then(() => dispatchChunk(earlyBytes)).catch(() => {
      try {
        webSocket.close();
      } catch {
      }
    });
  }
  webSocket.addEventListener("message", (event) => {
    const chunkSize = event.data?.byteLength || 0;
    pendingBytes += chunkSize;
    pendingItems++;
    if (pendingBytes > UPSTREAM_QUEUE_MAX_BYTES || pendingItems > UPSTREAM_QUEUE_MAX_ITEMS) {
      try {
        webSocket.close();
      } catch {
      }
      return;
    }
    processingChain = processingChain.then(async () => {
      pendingBytes = Math.max(0, pendingBytes - chunkSize);
      pendingItems = Math.max(0, pendingItems - 1);
      await dispatchChunk(event.data);
    }).catch(() => {
      try {
        webSocket.close();
      } catch {
      }
    });
  });
}
async function pumpDownstream(remoteSocket, clientWebSocket, onBytesTransferred, readTimeoutMs = DOWNSTREAM_READ_TIMEOUT_MS, closeWebSocketOnEnd = true) {
  if (!remoteSocket?.readable) return;
  try {
    const socketReader = remoteSocket.readable.getReader();
    while (true) {
      let timer = null;
      const timeoutPromise = new Promise((_, reject) => {
        timer = setTimeout(() => {
          const err = new Error(`Downstream socket read timed out after ${readTimeoutMs}ms of inactivity`);
          err.name = "InactivityTimeoutError";
          reject(err);
        }, readTimeoutMs);
      });
      try {
        const { value, done } = await Promise.race([
          socketReader.read(),
          timeoutPromise
        ]);
        if (timer) clearTimeout(timer);
        if (done) break;
        if (value) {
          clientWebSocket.send(value);
          if (typeof onBytesTransferred === "function") {
            onBytesTransferred(value.byteLength || 0);
          }
        }
      } catch (err) {
        if (timer) clearTimeout(timer);
        throw err;
      }
    }
  } catch {
  } finally {
    if (closeWebSocketOnEnd) {
      try {
        clientWebSocket.close();
      } catch {
      }
    }
  }
}
async function connectFallbackSocket(connectProvider, destinationHost, destinationPort, matchingProfile, sysConfig, clientKey, request = null) {
  if (!connectProvider) return null;
  if (!isProxyIpEnabled(matchingProfile, sysConfig)) return null;
  const isExplicitPrefixMode = sysConfig?.proxyIpMode === "prefix";
  const isUserOverride = isUserProxyIpOverrideActive(matchingProfile);
  let reqProxyIp = null;
  if (request) {
    try {
      const reqUrl = new URL(request.url);
      reqProxyIp = reqUrl.searchParams.get("proxyip");
      if (!reqProxyIp) {
        const m = reqUrl.pathname.match(/(?:proxyip=|\/proxyip\/)([^/&?]+)/i);
        if (m) reqProxyIp = decodeURIComponent(m[1]);
      }
    } catch {
    }
  }
  const tryNat64 = async () => {
    let targetIpv4 = null;
    if (/^(\d{1,3}\.){3}\d{1,3}$/.test(destinationHost)) {
      targetIpv4 = destinationHost;
    } else if (/^([a-zA-Z0-9-]+\.)+[a-zA-Z]{2,}$/.test(destinationHost)) {
      try {
        const dohUrl = sysConfig?.customDns || "https://1.1.1.1/dns-query";
        targetIpv4 = await resolveDomainDoh(destinationHost, dohUrl, "A");
      } catch {
      }
      if (!targetIpv4) {
        try {
          targetIpv4 = await resolveDomainDoh(destinationHost, "https://8.8.8.8/dns-query", "A");
        } catch {
        }
      }
    }
    if (!targetIpv4) return null;
    const candidatePrefixes = matchingProfile?.nat64 ? [matchingProfile.nat64] : sysConfig?.prefixes?.length ? sysConfig.prefixes : DEFAULT_NAT64_PREFIXES;
    for (const prefix of candidatePrefixes) {
      const nat64Literal = convertToNAT64IPv6(targetIpv4, prefix);
      if (!nat64Literal) continue;
      try {
        const sock = connectProvider({
          hostname: formatSocketHost(nat64Literal),
          port: destinationPort || 443
        });
        await withDeadline(
          sock.opened,
          TCP_OPEN_TIMEOUT_MS,
          () => {
            try {
              sock?.close();
            } catch {
            }
          },
          "nat64-connect"
        );
        return sock;
      } catch {
      }
    }
    return null;
  };
  const tryCandidatePool = async (candidateList) => {
    if (!candidateList || candidateList.length === 0) return null;
    const colo = request?.cf?.colo || "";
    let startIndex = 0;
    if (colo || clientKey) {
      const selected = selectDeterministicProxyIp(candidateList, { colo, clientId: clientKey, attempt: 0 });
      const foundIdx = candidateList.findIndex((c) => {
        const candStr = typeof c === "string" ? c : c.formatted || "";
        return candStr.toLowerCase() === (selected || "").toLowerCase();
      });
      if (foundIdx !== -1) startIndex = foundIdx;
    }
    for (let attempt = 0; attempt < candidateList.length; attempt++) {
      const rawCand = candidateList[(startIndex + attempt) % candidateList.length];
      const parsed = typeof rawCand === "object" && rawCand !== null ? rawCand : parseProxyIpEntry(String(rawCand));
      if (!parsed) continue;
      if (isCloudflareIp(parsed.host)) continue;
      const targetPort = parsed.port || destinationPort || 443;
      try {
        const sock = connectProvider({
          hostname: formatSocketHost(parsed.host),
          port: targetPort
        });
        await withDeadline(
          sock.opened,
          TCP_OPEN_TIMEOUT_MS,
          () => {
            try {
              sock?.close();
            } catch {
            }
          },
          "proxyip-connect"
        );
        return sock;
      } catch {
        continue;
      }
    }
    return null;
  };
  if (isUserOverride) {
    let userPool = getEffectiveProxyIpPool(matchingProfile, sysConfig);
    if (reqProxyIp) {
      const norm = normalizeProxyIp(reqProxyIp);
      if (norm && userPool.some((e) => e.toLowerCase() === norm.toLowerCase())) {
        userPool = [norm, ...userPool.filter((e) => e.toLowerCase() !== norm.toLowerCase())];
      }
    }
    return await tryCandidatePool(userPool);
  }
  const opRelays = getEffectiveOutboundRelays(matchingProfile, sysConfig);
  if (opRelays.length > 0) {
    const sock = await tryCandidatePool(opRelays);
    if (sock) return sock;
  }
  if (reqProxyIp) {
    let pool = getEffectiveProxyIpPool(matchingProfile, sysConfig);
    const norm = normalizeProxyIp(reqProxyIp);
    if (norm) {
      pool = [norm, ...pool.filter((e) => e.toLowerCase() !== norm.toLowerCase())];
    }
    const sock = await tryCandidatePool(pool);
    if (sock) return sock;
  }
  if (isExplicitPrefixMode) {
    const natSock = await tryNat64();
    if (natSock) return natSock;
    return await tryCandidatePool(getEffectiveProxyIpPool(matchingProfile, sysConfig));
  } else {
    const isIpv4Target = /^(\d{1,3}\.){3}\d{1,3}$/.test(destinationHost);
    if (isIpv4Target) {
      const natSock = await tryNat64();
      if (natSock) return natSock;
    }
    const proxyPool = getEffectiveProxyIpPool(matchingProfile, sysConfig);
    const sock = await tryCandidatePool(proxyPool);
    if (sock) return sock;
    return await tryNat64();
  }
}
async function parseAndConnect(rawBuffer, relayIndex, sysConfig, env, ctx, request = null) {
  const rawView = new Uint8Array(rawBuffer);
  let isVless = false;
  let destinationHost = "";
  let destinationPort = 0;
  let payloadOffset = 0;
  let subscriberToken = "";
  let isUDP = false;
  if (rawView[0] === 0) {
    isVless = true;
    const vlessHeader = parseVlessHeader(rawBuffer);
    if (vlessHeader.hasError) return { hasError: true };
    destinationHost = vlessHeader.targetAddr;
    destinationPort = vlessHeader.targetPort;
    payloadOffset = vlessHeader.offset;
    subscriberToken = vlessHeader.clientUuidHex;
    isUDP = Boolean(vlessHeader.isUDP);
  } else {
    const trojanHeader = parseTrojanHeader(rawBuffer);
    if (trojanHeader.hasError) return { hasError: true };
    destinationHost = trojanHeader.targetAddr;
    destinationPort = trojanHeader.targetPort;
    payloadOffset = trojanHeader.offset;
    subscriberToken = trojanHeader.clientHashHex;
    isUDP = Boolean(trojanHeader.isUDP);
  }
  const activeProfiles = getAllProfiles(sysConfig);
  let matchingProfile = null;
  if (isVless) {
    matchingProfile = activeProfiles.find(
      (profile) => profile.id.replace(/[^a-zA-Z0-9]/g, "").toLowerCase() === subscriberToken.toLowerCase()
    );
    if (!matchingProfile) {
      const composite = decodeConfigUuid(subscriberToken);
      if (composite) {
        matchingProfile = activeProfiles.find(
          (profile) => profile.id.replace(/[^a-zA-Z0-9]/g, "").toLowerCase().startsWith(composite.userFingerprint)
        );
      }
    }
  } else {
    matchingProfile = activeProfiles.find(
      (profile) => getTrojanHash(profile.id).toLowerCase() === subscriberToken.toLowerCase()
    );
  }
  if (!matchingProfile) {
    return { hasError: true, message: "Unauthorized subscriber credentials" };
  }
  const clientKey = matchingProfile.id.replace(/[^a-zA-Z0-9]/g, "").toLowerCase();
  const currentStreams = activeConns.get(clientKey) || 0;
  if (matchingProfile.connLimit && currentStreams >= matchingProfile.connLimit) {
    return { hasError: true, message: "Connection concurrency limit exceeded" };
  }
  activeConns.set(clientKey, currentStreams + 1);
  trackUsage(clientKey, 0, env, ctx);
  const trackingMetrics = uuidUsage.get(clientKey) || { connects: 0, last: 0 };
  trackingMetrics.connects++;
  trackingMetrics.last = Date.now();
  uuidUsage.set(clientKey, trackingMetrics);
  if (isUDP) {
    if (destinationPort === 53) {
      const firstChunk2 = payloadOffset < rawBuffer.byteLength ? rawBuffer.slice(payloadOffset) : null;
      return {
        hasError: false,
        isVless,
        isUdpDns: true,
        activeClientHash: clientKey,
        firstChunk: firstChunk2
      };
    } else {
      return {
        hasError: true,
        isUdpRejected: true,
        message: "UDP proxying only supported for DNS (port 53)"
      };
    }
  }
  const connectProvider = await resolveConnectFunction();
  if (!connectProvider) {
    return { hasError: true, message: "Edge sockets capability unavailable" };
  }
  let remoteSocket = null;
  let resolvedDestination = destinationHost;
  if (sysConfig.customDns && /^([a-zA-Z0-9-]+\.)+[a-zA-Z]{2,}$/.test(destinationHost)) {
    try {
      const resolvedIp = await resolveDomainDoh(destinationHost, sysConfig.customDns, "A");
      if (resolvedIp) {
        resolvedDestination = resolvedIp;
      }
    } catch {
    }
  }
  const proxyIpEnabled = isProxyIpEnabled(matchingProfile, sysConfig);
  let reqProxyIp = null;
  if (proxyIpEnabled && request) {
    try {
      const reqUrl = new URL(request.url);
      reqProxyIp = reqUrl.searchParams.get("proxyip");
      if (!reqProxyIp) {
        const m = reqUrl.pathname.match(/(?:proxyip=|\/proxyip\/)([^/&?]+)/i);
        if (m) reqProxyIp = decodeURIComponent(m[1]);
      }
    } catch {
    }
  }
  const isCfTarget = isCloudflareIp(resolvedDestination);
  const needsProxyRouting = proxyIpEnabled && isCfTarget;
  if (needsProxyRouting) {
    remoteSocket = await connectFallbackSocket(connectProvider, resolvedDestination, destinationPort, matchingProfile, sysConfig, clientKey, request);
    if (!remoteSocket) {
      return { hasError: true, message: "Outbound proxy IP connection failed across all candidates" };
    }
  } else {
    try {
      remoteSocket = connectProvider({
        hostname: formatSocketHost(resolvedDestination),
        port: destinationPort
      });
      await withDeadline(
        remoteSocket.opened,
        TCP_OPEN_TIMEOUT_MS,
        () => {
          try {
            remoteSocket?.close();
          } catch {
          }
        },
        "direct-connect"
      );
    } catch {
      if (proxyIpEnabled) {
        remoteSocket = await connectFallbackSocket(connectProvider, resolvedDestination, destinationPort, matchingProfile, sysConfig, clientKey, request);
        if (!remoteSocket) {
          return { hasError: true, message: "Outbound socket connection failed across all attempts" };
        }
      } else {
        return { hasError: true, message: "Direct outbound socket connection failed (Proxy IP is disabled)" };
      }
    }
  }
  const firstChunk = payloadOffset < rawBuffer.byteLength ? rawBuffer.slice(payloadOffset) : null;
  return {
    hasError: false,
    isVless,
    activeClientHash: clientKey,
    remoteSocket,
    firstChunk,
    resolvedDestination,
    destinationPort,
    matchingProfile,
    connectProvider
  };
}
function mapBackendUrl(backendUrl, requestUrl) {
  let target;
  try {
    target = new URL(backendUrl);
  } catch {
    return null;
  }
  const incomingPath = requestUrl?.pathname || "";
  if (incomingPath && incomingPath !== "/") {
    target.pathname = incomingPath;
  }
  target.search = requestUrl?.search || "";
  return target.toString();
}
async function processBackendStream(request, clientWebSocket, backendUrl, env, ctx, sysConfig) {
  incrementOpenWs();
  let upstreamSocket = null;
  let upBytes = 0;
  let downBytes = 0;
  let isTerminated = false;
  const cleanup = () => {
    if (!isTerminated) {
      isTerminated = true;
      decrementOpenWs();
      try {
        clientWebSocket.close();
      } catch {
      }
      try {
        upstreamSocket?.close();
      } catch {
      }
      const total = upBytes + downBytes;
      if (total > 0 && sysConfig.deviceId) {
        try {
          trackUsage(sysConfig.deviceId, total, env, ctx);
        } catch {
        }
      }
    }
  };
  clientWebSocket.addEventListener("close", cleanup);
  clientWebSocket.addEventListener("error", cleanup);
  const upstreamTarget = mapBackendUrl(backendUrl, new URL(request.url));
  if (!upstreamTarget) {
    cleanup();
    return;
  }
  const proxyHeaders = new Headers(request.headers);
  proxyHeaders.delete("Host");
  proxyHeaders.delete("Sec-WebSocket-Extensions");
  proxyHeaders.set("Connection", "Upgrade");
  proxyHeaders.set("Upgrade", "websocket");
  let upstreamResponse;
  try {
    upstreamResponse = await fetch(upstreamTarget, {
      method: "GET",
      headers: proxyHeaders,
      redirect: "manual"
    });
  } catch {
    cleanup();
    return;
  }
  if (upstreamResponse.status !== 101 || !upstreamResponse.webSocket) {
    cleanup();
    return;
  }
  upstreamSocket = upstreamResponse.webSocket;
  try {
    upstreamSocket.accept();
  } catch {
  }
  clientWebSocket.addEventListener("message", (event) => {
    try {
      if (upstreamSocket && !isTerminated) {
        upstreamSocket.send(event.data);
        upBytes += event.data?.byteLength || event.data?.length || 0;
      }
    } catch {
      cleanup();
    }
  });
  upstreamSocket.addEventListener("message", (event) => {
    try {
      if (clientWebSocket && !isTerminated) {
        clientWebSocket.send(event.data);
        downBytes += event.data?.byteLength || event.data?.length || 0;
      }
    } catch {
      cleanup();
    }
  });
  upstreamSocket.addEventListener("close", cleanup);
  upstreamSocket.addEventListener("error", cleanup);
}
async function checkBackendHealth(backendUrl) {
  const report = {
    ok: false,
    backendMode: Boolean(backendUrl),
    backendUrl: backendUrl || "(none)",
    steps: []
  };
  if (!backendUrl || !/^https?:\/\//i.test(backendUrl.trim())) {
    report.steps.push("Backend mode is OFF or URL is invalid. Set backendUrl in settings.");
    return report;
  }
  let resolvedProbeUrl = "";
  try {
    const parsed = new URL(backendUrl.trim());
    if (parsed.pathname === "/" || !parsed.pathname) {
      parsed.pathname = "/proxy";
    }
    resolvedProbeUrl = parsed.toString();
  } catch (e) {
    report.steps.push(`URL parsing failed: ${e.message}`);
    return report;
  }
  report.targetTried = resolvedProbeUrl;
  const startTimestamp = Date.now();
  try {
    const probeHeaders = new Headers();
    probeHeaders.set("Upgrade", "websocket");
    probeHeaders.set("Connection", "Upgrade");
    probeHeaders.set("Sec-WebSocket-Version", "13");
    probeHeaders.set("Sec-WebSocket-Key", "dGhlIHNhbXBsZSBub25jZQ==");
    const probeResponse = await fetch(resolvedProbeUrl, {
      method: "GET",
      headers: probeHeaders,
      redirect: "manual"
    });
    report.elapsedMs = Date.now() - startTimestamp;
    report.upstreamStatus = probeResponse.status;
    report.gotWebSocket = Boolean(probeResponse.webSocket);
    if (probeResponse.status === 101 && probeResponse.webSocket) {
      try {
        probeResponse.webSocket.accept();
      } catch {
      }
      try {
        probeResponse.webSocket.close();
      } catch {
      }
      report.ok = true;
      report.steps.push(`Connected in ${report.elapsedMs}ms (HTTP 101 WebSocket Upgrade).`);
    } else {
      report.steps.push(`Upstream responded with HTTP ${probeResponse.status} (expected 101).`);
    }
  } catch (err) {
    report.elapsedMs = Date.now() - startTimestamp;
    report.steps.push(`Upstream probe failed: ${err.message}`);
  }
  return report;
}
async function testProxyIp(targetAddress, attemptsCount = 5) {
  const connectProvider = await resolveConnectFunction();
  if (!connectProvider) {
    return {
      ok: false,
      success: false,
      ip: targetAddress,
      port: 443,
      latency_ms: null,
      status: "unreachable",
      error: "Sockets capability not available in this environment",
      message: "Sockets capability not available in this environment",
      data: {
        target: targetAddress,
        successRate: `0/${attemptsCount}`,
        avgLatencyMs: null,
        attempts: []
      }
    };
  }
  const PROBE_PATH = "/__down?bytes=5000";
  const PROBE_TIMEOUT_MS = 5e3;
  const attempts = [];
  for (let i = 1; i <= attemptsCount; i++) {
    const startTime = Date.now();
    let success = false;
    let socketHandle = null;
    try {
      const timeoutPromise = new Promise(
        (_, reject) => setTimeout(() => reject(new Error("timeout")), PROBE_TIMEOUT_MS)
      );
      const connectionPromise = Promise.resolve(connectProvider({ hostname: targetAddress, port: 443 }));
      socketHandle = await Promise.race([connectionPromise, timeoutPromise]);
      const writer = socketHandle.writable.getWriter();
      const probeRequest = `GET ${PROBE_PATH} HTTP/1.1\r
Host: speed.cloudflare.com\r
Connection: close\r
\r
`;
      await writer.write(new TextEncoder().encode(probeRequest));
      writer.releaseLock();
      const reader = socketHandle.readable.getReader();
      const readPromise = reader.read();
      const { value, done } = await Promise.race([readPromise, timeoutPromise]);
      reader.releaseLock();
      await socketHandle.close().catch(() => {
      });
      if (!done && value) {
        const responseText = new TextDecoder().decode(value);
        const hasHttpStatus = /^HTTP\/1\.[01] 400/.test(responseText);
        const hasRayId = /cf-ray:/i.test(responseText);
        success = hasHttpStatus && hasRayId;
      }
    } catch {
      success = false;
      if (socketHandle) await socketHandle.close().catch(() => {
      });
    }
    const elapsedMs = Date.now() - startTime;
    attempts.push({ attempt: i, ok: success, elapsedMs });
  }
  const passedAttempts = attempts.filter((a) => a.ok);
  const avgLatencyMs = passedAttempts.length ? Math.round(passedAttempts.reduce((sum, a) => sum + a.elapsedMs, 0) / passedAttempts.length) : null;
  const isReachable = passedAttempts.length > 0;
  return {
    ok: isReachable,
    success: isReachable,
    ip: targetAddress,
    port: 443,
    latency_ms: avgLatencyMs,
    status: isReachable ? "reachable" : "unreachable",
    message: isReachable ? `Successfully connected to ${targetAddress}:443 (${passedAttempts.length}/${attemptsCount} attempts passed, avg latency ${avgLatencyMs}ms)` : `All ${attemptsCount} connection attempts failed to ${targetAddress}:443`,
    data: {
      target: targetAddress,
      successRate: `${passedAttempts.length}/${attemptsCount}`,
      avgLatencyMs,
      attempts
    }
  };
}

// LuciProxy/src/subscriptions/tags.js
function getSubscriptionStats(sysConfig, targetSub = null) {
  let name = "Default";
  let id = sysConfig.deviceId || "00000000-0000-4000-8000-000000000000";
  let limitTotalReq = 0;
  let expiryMs = 0;
  let hasMultiUser = sysConfig.users && sysConfig.users.length > 0;
  if (hasMultiUser && targetSub) {
    let user = sysConfig.users.find(
      (u) => u.name.toLowerCase() === targetSub.toLowerCase() || u.id.toLowerCase() === targetSub.toLowerCase()
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
  const limitTotalGb = limitTotalReq ? (limitReqToBytes(limitTotalReq) / 1073741824).toFixed(2) : "Unlimited";
  let expiryDateTxt = "Never Expire";
  let remDaysTxt = "Never Expire";
  if (expiryMs) {
    const exp = new Date(expiryMs);
    expiryDateTxt = exp.toISOString().split("T")[0];
    const remDays = Math.ceil((expiryMs - Date.now()) / (1e3 * 60 * 60 * 24));
    remDaysTxt = remDays >= 0 ? `${remDays} Days Left` : "Expired";
  }
  return {
    usedStr: `Used: ${totalGb} GB / ${limitTotalGb} GB`,
    expiryStr: `Expiry: ${expiryDateTxt} (${remDaysTxt})`
  };
}
function getFakeConfigNames(sysConfig, targetSub = null) {
  const stats = getSubscriptionStats(sysConfig, targetSub);
  const configs = sysConfig.fakeConfigs || [
    { name: "\u{1F4CA} {usage}", enabled: true },
    { name: "\u{1F4C5} {expiry}", enabled: true }
  ];
  return configs.filter((f) => f && f.enabled && f.name).map(
    (f) => f.name.replace("{usage}", stats.usedStr).replace("{expiry}", stats.expiryStr)
  );
}
function getConfigName(mode, userName, port, hName, ip, selectedProxyIp, configIndex, ipName, sysConfig) {
  const protoLabel = mode === "alpha" ? "VLESS" : "Trojan";
  const portLabel = String(port);
  const prefix = sysConfig.namePrefix || "Luci";
  const today = (/* @__PURE__ */ new Date()).toISOString().split("T")[0];
  let nameTemplate = sysConfig.nameStrategy || "default";
  if (nameTemplate === "default" || !nameTemplate) {
    const userTag = userName && userName !== "Default" ? `-${userName}` : "";
    const ipTag = ipName ? `-${ipName}` : `-${ip}`;
    return `${prefix}${userTag}-${protoLabel}-${portLabel}${ipTag}`;
  }
  return nameTemplate.replace("{FLAG}", "\u{1F310}").replace("{COUNTRY}", "Global").replace("{CITY}", "Edge").replace("{ISP}", ipName || "CF").replace("{HOST}", hName).replace("{DATE}", today).replace("{WORKER}", prefix).replace("{USER}", userName || "User").replace("{PROTO}", protoLabel).replace("{PORT}", portLabel).replace("{IP}", ip);
}

// LuciProxy/src/subscriptions/finalmask.js
function parseFinalMask(input) {
  if (!input) return null;
  if (typeof input === "object" && input !== null) {
    if (input.enabled === false) {
      return null;
    }
    if (Array.isArray(input.tcp) && input.tcp.length > 0) {
      const tcpEntries = input.tcp.map((item) => {
        const s = item.settings || item;
        const packets2 = String(s.packets || "tlshello").trim();
        let lengths2 = s.lengths || s.length;
        if (typeof lengths2 === "string") {
          lengths2 = lengths2.split(",").map((x) => x.trim()).filter(Boolean);
        } else if (Array.isArray(lengths2)) {
          lengths2 = lengths2.map((x) => String(x).trim()).filter(Boolean);
        }
        if (!lengths2 || lengths2.length === 0) lengths2 = ["100-200"];
        let delays2 = s.delays || s.delay || s.interval;
        if (typeof delays2 === "string") {
          delays2 = delays2.split(",").map((x) => x.trim()).filter(Boolean);
        } else if (Array.isArray(delays2)) {
          delays2 = delays2.map((x) => String(x).trim()).filter(Boolean);
        }
        if (!delays2 || delays2.length === 0) delays2 = ["10-20"];
        let maxSplit2;
        if (s.maxSplit !== void 0 && s.maxSplit !== null && String(s.maxSplit).trim() !== "") {
          const num = Number(s.maxSplit);
          if (!isNaN(num)) maxSplit2 = String(s.maxSplit);
        }
        return {
          type: "fragment",
          settings: {
            packets: packets2,
            lengths: lengths2,
            delays: delays2,
            ...maxSplit2 !== void 0 ? { maxSplit: maxSplit2 } : {}
          }
        };
      });
      const primary = tcpEntries[0].settings;
      return {
        enabled: true,
        packets: primary.packets,
        lengths: primary.lengths,
        delays: primary.delays,
        ...primary.maxSplit !== void 0 ? { maxSplit: Number(primary.maxSplit) } : {},
        tcp: tcpEntries
      };
    }
    const packets = String(input.packets || "tlshello").trim();
    let lengths = input.lengths;
    if (!lengths && input.length) {
      lengths = Array.isArray(input.length) ? input.length : [String(input.length)];
    } else if (typeof lengths === "string") {
      lengths = lengths.split(",").map((s) => s.trim()).filter(Boolean);
    } else if (Array.isArray(lengths)) {
      lengths = lengths.map((s) => String(s).trim()).filter(Boolean);
    }
    if (!lengths || lengths.length === 0) {
      lengths = ["100-200"];
    }
    let delays = input.delays;
    const fallbackDelay = input.interval || input.delay;
    if (!delays && fallbackDelay) {
      delays = Array.isArray(fallbackDelay) ? fallbackDelay : [String(fallbackDelay)];
    } else if (typeof delays === "string") {
      delays = delays.split(",").map((s) => s.trim()).filter(Boolean);
    } else if (Array.isArray(delays)) {
      delays = delays.map((s) => String(s).trim()).filter(Boolean);
    }
    if (!delays || delays.length === 0) {
      delays = ["10-20"];
    }
    let maxSplit;
    if (input.maxSplit !== void 0 && input.maxSplit !== null && input.maxSplit !== "") {
      const num = Number(input.maxSplit);
      if (!isNaN(num)) {
        maxSplit = num;
      }
    }
    return {
      enabled: true,
      packets,
      lengths,
      delays,
      ...maxSplit !== void 0 ? { maxSplit } : {},
      tcp: [
        {
          type: "fragment",
          settings: {
            packets,
            lengths,
            delays,
            ...maxSplit !== void 0 ? { maxSplit: String(maxSplit) } : {}
          }
        }
      ]
    };
  }
  if (typeof input === "string") {
    const trimmed = input.trim();
    if (!trimmed || trimmed === "off" || trimmed === "none") return null;
    if (trimmed.startsWith("{") && trimmed.endsWith("}")) {
      try {
        const parsed = JSON.parse(trimmed);
        return parseFinalMask(parsed);
      } catch {
      }
    }
    const parts = trimmed.split(",").map((s) => s.trim()).filter(Boolean);
    if (parts.length >= 3) {
      let lengths, delays, packets, maxSplit;
      if (parts.length === 4 && (parts[3].toLowerCase() === "tlshello" || isNaN(Number(parts[3])))) {
        maxSplit = !isNaN(Number(parts[0])) ? Number(parts[0]) : void 0;
        lengths = [parts[1]];
        delays = [parts[2]];
        packets = parts[3];
      } else {
        lengths = [parts[0]];
        delays = [parts[1]];
        packets = parts[2];
        if (parts.length >= 4 && !isNaN(Number(parts[3]))) {
          maxSplit = Number(parts[3]);
        }
      }
      return {
        enabled: true,
        packets,
        lengths,
        delays,
        ...maxSplit !== void 0 ? { maxSplit } : {},
        tcp: [
          {
            type: "fragment",
            settings: {
              packets,
              lengths,
              delays,
              ...maxSplit !== void 0 ? { maxSplit: String(maxSplit) } : {}
            }
          }
        ]
      };
    }
    const lower = trimmed.toLowerCase();
    if (lower === "shadowrocket") {
      return {
        enabled: true,
        packets: "tlshello",
        lengths: ["40-60"],
        delays: ["30-50"],
        maxSplit: 1,
        tcp: [{ type: "fragment", settings: { packets: "tlshello", lengths: ["40-60"], delays: ["30-50"], maxSplit: "1" } }]
      };
    }
    if (lower === "happ") {
      return {
        enabled: true,
        packets: "tlshello",
        lengths: ["1"],
        delays: ["1"],
        maxSplit: 3,
        tcp: [{ type: "fragment", settings: { packets: "tlshello", lengths: ["1"], delays: ["1"], maxSplit: "3" } }]
      };
    }
    if (lower === "gentle") {
      return {
        enabled: true,
        packets: "tlshello",
        lengths: ["100-200"],
        delays: ["10-20"],
        maxSplit: 1,
        tcp: [{ type: "fragment", settings: { packets: "tlshello", lengths: ["100-200"], delays: ["10-20"], maxSplit: "1" } }]
      };
    }
    if (lower === "balanced") {
      return {
        enabled: true,
        packets: "tlshello",
        lengths: ["40-80"],
        delays: ["20-40"],
        maxSplit: 1,
        tcp: [{ type: "fragment", settings: { packets: "tlshello", lengths: ["40-80"], delays: ["20-40"], maxSplit: "1" } }]
      };
    }
    if (lower === "aggressive") {
      return {
        enabled: true,
        packets: "tlshello",
        lengths: ["20-40"],
        delays: ["10-30"],
        maxSplit: 2,
        tcp: [{ type: "fragment", settings: { packets: "tlshello", lengths: ["20-40"], delays: ["10-30"], maxSplit: "2" } }]
      };
    }
    if (lower === "tlshello" || lower === "finalmask" || lower === "true" || lower === "1" || lower === "on" || lower === "enabled") {
      return {
        enabled: true,
        packets: "tlshello",
        lengths: ["100-200"],
        delays: ["10-20"],
        tcp: [{ type: "fragment", settings: { packets: "tlshello", lengths: ["100-200"], delays: ["10-20"] } }]
      };
    }
  }
  return null;
}
function resolveFinalMask(profile, sysConfig) {
  if (profile && profile.finalMask !== void 0 && profile.finalMask !== null) {
    const parsed = parseFinalMask(profile.finalMask);
    if (parsed) return parsed;
  }
  if (sysConfig && sysConfig.finalMask !== void 0 && sysConfig.finalMask !== null) {
    const parsed = parseFinalMask(sysConfig.finalMask);
    if (parsed) return parsed;
  }
  const fragMode = (profile?.fragmentMode || sysConfig?.fragmentMode || "").toLowerCase();
  if (fragMode && fragMode !== "off" && fragMode !== "none") {
    if (fragMode === "custom" && sysConfig?.fragmentParams) {
      return parseFinalMask({
        packets: sysConfig.fragmentParams.packets || "tlshello",
        lengths: [sysConfig.fragmentParams.length || "40-80"],
        delays: [sysConfig.fragmentParams.interval || "20-40"]
      });
    }
    return parseFinalMask(fragMode);
  }
  return null;
}
function formatVlessFinalMaskParam(finalMaskObj, isTls = true) {
  if (!isTls || !finalMaskObj || finalMaskObj.enabled === false) {
    return "";
  }
  const canonicalTcp = Array.isArray(finalMaskObj.tcp) && finalMaskObj.tcp.length > 0 ? { tcp: finalMaskObj.tcp } : {
    tcp: [
      {
        type: "fragment",
        settings: {
          packets: String(finalMaskObj.packets || "tlshello"),
          lengths: Array.isArray(finalMaskObj.lengths) ? finalMaskObj.lengths.map(String) : [String(finalMaskObj.lengths || "100-200")],
          delays: Array.isArray(finalMaskObj.delays) ? finalMaskObj.delays.map(String) : [String(finalMaskObj.delays || "10-20")],
          ...finalMaskObj.maxSplit !== void 0 && finalMaskObj.maxSplit !== null && String(finalMaskObj.maxSplit).trim() !== "" ? { maxSplit: String(finalMaskObj.maxSplit) } : {}
        }
      }
    ]
  };
  return `&fm=${encodeURIComponent(JSON.stringify(canonicalTcp))}`;
}
function formatXrayFinalMask(finalMaskObj, isTls = true) {
  if (!isTls || !finalMaskObj || finalMaskObj.enabled === false) {
    return void 0;
  }
  const lengths = Array.isArray(finalMaskObj.lengths) ? finalMaskObj.lengths.map(String) : [String(finalMaskObj.lengths || "100-200")];
  const delays = Array.isArray(finalMaskObj.delays) ? finalMaskObj.delays.map(String) : [String(finalMaskObj.delays || "10-20")];
  const packets = String(finalMaskObj.packets || "tlshello");
  const result = {
    enabled: true,
    packets,
    lengths,
    delays
  };
  if (finalMaskObj.maxSplit !== void 0 && !isNaN(finalMaskObj.maxSplit)) {
    result.maxSplit = Number(finalMaskObj.maxSplit);
  }
  return result;
}
function formatClashFragmentYaml(finalMaskObj, isTls = true, indent = "    ") {
  if (!isTls || !finalMaskObj || finalMaskObj.enabled === false) {
    return "";
  }
  const packets = String(finalMaskObj.packets || "tlshello");
  const length = Array.isArray(finalMaskObj.lengths) ? finalMaskObj.lengths.join(",") : String(finalMaskObj.lengths || "100-200");
  const interval = Array.isArray(finalMaskObj.delays) ? finalMaskObj.delays.join(",") : String(finalMaskObj.delays || "10-20");
  return `
${indent}fragment:
${indent}  packets: "${packets}"
${indent}  length: "${length}"
${indent}  interval: "${interval}"`;
}

// LuciProxy/src/subscriptions/dns.js
var KNOWN_DOH_BOOTSTRAP = {
  "dns.google": {
    ipv4: ["8.8.8.8", "8.8.4.4"],
    ipv6: ["2001:4860:4860::8888", "2001:4860:4860::8844"]
  },
  "cloudflare-dns.com": {
    ipv4: ["104.16.248.249", "104.16.249.249", "1.1.1.1", "1.0.0.1"],
    ipv6: ["2606:4700:4700::1111", "2606:4700:4700::1001"]
  },
  "dns.quad9.net": {
    ipv4: ["9.9.9.9", "149.112.112.112"],
    ipv6: ["2620:fe::fe", "2620:fe::9"]
  }
};
function isCloudflareAnycast(hostOrIp = "") {
  if (!hostOrIp) return false;
  const clean = hostOrIp.toLowerCase().trim();
  if (clean === "cloudflare-dns.com" || clean === "one.one.one.one") return true;
  if (clean === "1.1.1.1" || clean === "1.0.0.1") return true;
  if (clean.startsWith("2606:4700:")) return true;
  if (/^104\.(1[6-9]|2[0-8])\./.test(clean)) return true;
  if (/^172\.(6[4-7])\./.test(clean)) return true;
  return false;
}
function extractDnsHost(dnsAddress = "") {
  if (!dnsAddress) return "";
  try {
    if (dnsAddress.includes("://")) {
      const parsed = new URL(dnsAddress);
      return parsed.hostname;
    }
    const bracketMatch = dnsAddress.match(/^\[([^\]]+)\](?::\d+)?$/);
    if (bracketMatch) {
      return bracketMatch[1];
    }
    if ((dnsAddress.match(/:/g) || []).length > 1) {
      return dnsAddress;
    }
    const clean = dnsAddress.split(":")[0];
    return clean;
  } catch {
    return dnsAddress;
  }
}
function isIpAddress(address = "") {
  if (!address) return false;
  const clean = address.replace(/\[|\]/g, "").split("/")[0];
  const isV4 = /^(?:25[0-5]|2[0-4]\d|[01]?\d\d?)\.(?:25[0-5]|2[0-4]\d|[01]?\d\d?)\.(?:25[0-5]|2[0-4]\d|[01]?\d\d?)\.(?:25[0-5]|2[0-4]\d|[01]?\d\d?)$/.test(clean);
  const isV6 = clean.includes(":");
  return isV4 || isV6;
}
function buildCanonicalDnsPolicy(sysConfig = {}) {
  const enableIPv6 = Boolean(sysConfig.enableIPv6);
  const localDns = sysConfig.localDns || "8.8.8.8";
  const remoteDns = sysConfig.remoteDns || sysConfig.customDns || "https://8.8.8.8/dns-query";
  const antiSanctionDns = sysConfig.antiSanctionDns || "178.22.122.100";
  const fakeDns = Boolean(sysConfig.fakeDns);
  const remoteHost = extractDnsHost(remoteDns);
  const isRemoteDomain = !isIpAddress(remoteHost);
  const isCloudflare = isCloudflareAnycast(remoteHost);
  const bootstrapHosts = {};
  if (isRemoteDomain) {
    const known = KNOWN_DOH_BOOTSTRAP[remoteHost];
    if (known) {
      bootstrapHosts[remoteHost] = enableIPv6 ? [...known.ipv4, ...known.ipv6] : [...known.ipv4];
    }
  }
  const antiSanctionHost = extractDnsHost(antiSanctionDns);
  const isAntiSanctionDomain = !isIpAddress(antiSanctionHost);
  const isLocalSystem = localDns === "local" || localDns === "localhost" || localDns === "system";
  return {
    localDns,
    isLocalSystem,
    remoteDns,
    remoteHost,
    isRemoteDomain,
    isCloudflare,
    antiSanctionDns,
    antiSanctionHost,
    isAntiSanctionDomain,
    fakeDns,
    enableIPv6,
    strategy: enableIPv6 ? "prefer_ipv4" : "ipv4_only",
    queryStrategyXray: enableIPv6 ? "UseIP" : "UseIPv4",
    fakeIpRangeV4: "198.18.0.0/15",
    fakeIpRangeV6: enableIPv6 ? "fc00::/18" : null,
    fakeIpFilter: ["+.lan", "+.local"],
    bootstrapHosts
  };
}

// LuciProxy/src/subscriptions/rules.js
var PRIVATE_IP_CIDRS = [
  "10.0.0.0/8",
  "172.16.0.0/12",
  "192.168.0.0/16",
  "127.0.0.0/8",
  "100.64.0.0/10",
  "169.254.0.0/16",
  "fc00::/7",
  "fe80::/10",
  "::1/128"
];
var CORE_THREAT_DOMAINS = [
  "doubleclick.net",
  "adservice.google.com",
  "pagead2.googlesyndication.com",
  "coin-hive.com",
  "coinhive.com",
  "crypto-loot.com"
];
var CORE_AI_DOMAINS = [
  "openai.com",
  "chatgpt.com",
  "ai.com",
  "oaistatic.com",
  "oaiusercontent.com",
  "anthropic.com",
  "claude.ai",
  "deepmind.google",
  "gemini.google.com"
];
var CORE_DEV_DOMAINS = [
  "github.com",
  "githubusercontent.com",
  "gitlab.com",
  "docker.com",
  "oracle.com",
  "intel.com",
  "amd.com",
  "nvidia.com",
  "microsoft.com",
  "adobe.com",
  "epicgames.com"
];
var RULESET_CATALOG = {
  // Threat Rule-Sets
  malware: {
    category: "threat",
    singbox: {
      geosite: "geosite-malware",
      geoip: "geoip-malware",
      geositeUrl: "https://raw.githubusercontent.com/Chocolate4U/Iran-sing-box-rules/rule-set/geosite-malware.srs",
      geoipUrl: "https://raw.githubusercontent.com/Chocolate4U/Iran-sing-box-rules/rule-set/geoip-malware.srs"
    },
    clash: {
      geosite: "malware",
      geoip: "malware-cidr",
      format: "text",
      geositeUrl: "https://raw.githubusercontent.com/Chocolate4U/Iran-clash-rules/release/malware.txt",
      geoipUrl: "https://raw.githubusercontent.com/Chocolate4U/Iran-clash-rules/release/malware-ip.txt"
    },
    xray: { geosite: "geosite:malware", geoip: "geoip:malware" }
  },
  phishing: {
    category: "threat",
    singbox: {
      geosite: "geosite-phishing",
      geoip: "geoip-phishing",
      geositeUrl: "https://raw.githubusercontent.com/Chocolate4U/Iran-sing-box-rules/rule-set/geosite-phishing.srs",
      geoipUrl: "https://raw.githubusercontent.com/Chocolate4U/Iran-sing-box-rules/rule-set/geoip-phishing.srs"
    },
    clash: {
      geosite: "phishing",
      geoip: "phishing-cidr",
      format: "text",
      geositeUrl: "https://raw.githubusercontent.com/Chocolate4U/Iran-clash-rules/release/phishing.txt",
      geoipUrl: "https://raw.githubusercontent.com/Chocolate4U/Iran-clash-rules/release/phishing-ip.txt"
    },
    xray: { geosite: "geosite:phishing", geoip: "geoip:phishing" }
  },
  cryptominers: {
    category: "threat",
    singbox: {
      geosite: "geosite-cryptominers",
      geositeUrl: "https://raw.githubusercontent.com/Chocolate4U/Iran-sing-box-rules/rule-set/geosite-cryptominers.srs"
    },
    clash: {
      geosite: "cryptominers",
      format: "text",
      geositeUrl: "https://raw.githubusercontent.com/Chocolate4U/Iran-clash-rules/release/cryptominers.txt"
    },
    xray: { geosite: "geosite:cryptominers" }
  },
  ads: {
    category: "threat",
    singbox: {
      geosite: "geosite-category-ads-all",
      geositeUrl: "https://raw.githubusercontent.com/Chocolate4U/Iran-sing-box-rules/rule-set/geosite-category-ads-all.srs"
    },
    clash: {
      geosite: "category-ads-all",
      format: "text",
      geositeUrl: "https://raw.githubusercontent.com/Chocolate4U/Iran-clash-rules/release/category-ads-all.txt"
    },
    xray: { geosite: "geosite:category-ads-all" }
  },
  porn: {
    category: "threat",
    singbox: {
      geosite: "geosite-nsfw",
      geositeUrl: "https://raw.githubusercontent.com/Chocolate4U/Iran-sing-box-rules/rule-set/geosite-nsfw.srs"
    },
    clash: {
      geosite: "nsfw",
      format: "text",
      geositeUrl: "https://raw.githubusercontent.com/Chocolate4U/Iran-clash-rules/release/nsfw.txt"
    },
    xray: { geosite: "geosite:category-porn" }
  },
  // Domestic Bypass Rule-Sets
  iran: {
    category: "domestic",
    singbox: {
      geosite: "geosite-ir",
      geoip: "geoip-ir",
      geositeUrl: "https://raw.githubusercontent.com/Chocolate4U/Iran-sing-box-rules/rule-set/geosite-ir.srs",
      geoipUrl: "https://raw.githubusercontent.com/Chocolate4U/Iran-sing-box-rules/rule-set/geoip-ir.srs"
    },
    clash: {
      geosite: "ir",
      geoip: "ir-cidr",
      format: "text",
      geositeUrl: "https://raw.githubusercontent.com/Chocolate4U/Iran-clash-rules/release/ir.txt",
      geoipUrl: "https://raw.githubusercontent.com/Chocolate4U/Iran-clash-rules/release/ircidr.txt"
    },
    xray: { geosite: "geosite:category-ir", geoip: "geoip:ir" }
  },
  china: {
    category: "domestic",
    singbox: {
      geosite: "geosite-cn",
      geoip: "geoip-cn",
      geositeUrl: "https://raw.githubusercontent.com/Chocolate4U/Iran-sing-box-rules/rule-set/geosite-cn.srs",
      geoipUrl: "https://raw.githubusercontent.com/Chocolate4U/Iran-sing-box-rules/rule-set/geoip-cn.srs"
    },
    clash: {
      geosite: "cn",
      geoip: "cn-cidr",
      format: "yaml",
      geositeUrl: "https://raw.githubusercontent.com/MetaCubeX/meta-rules-dat/meta/geo/geosite/cn.yaml",
      geoipUrl: "https://raw.githubusercontent.com/MetaCubeX/meta-rules-dat/meta/geo/geoip/cn.yaml"
    },
    xray: { geosite: "geosite:cn", geoip: "geoip:cn" }
  },
  russia: {
    category: "domestic",
    singbox: {
      geosite: "geosite-category-ru",
      geoip: "geoip-ru",
      geositeUrl: "https://raw.githubusercontent.com/Chocolate4U/Iran-sing-box-rules/rule-set/geosite-category-ru.srs",
      geoipUrl: "https://raw.githubusercontent.com/Chocolate4U/Iran-sing-box-rules/rule-set/geoip-ru.srs"
    },
    clash: {
      geosite: "ru",
      geoip: "ru-cidr",
      format: "yaml",
      geositeUrl: "https://raw.githubusercontent.com/MetaCubeX/meta-rules-dat/meta/geo/geosite/category-ru.yaml",
      geoipUrl: "https://raw.githubusercontent.com/MetaCubeX/meta-rules-dat/meta/geo/geoip/ru.yaml"
    },
    xray: { geosite: "geosite:category-ru", geoip: "geoip:ru" }
  },
  // Sanction Unblocking Rule-Sets
  openai: {
    category: "sanction",
    singbox: {
      geosite: "geosite-openai",
      geositeUrl: "https://raw.githubusercontent.com/Chocolate4U/Iran-sing-box-rules/rule-set/geosite-openai.srs"
    },
    clash: {
      geosite: "openai",
      format: "yaml",
      geositeUrl: "https://raw.githubusercontent.com/MetaCubeX/meta-rules-dat/meta/geo/geosite/openai.yaml"
    },
    xray: { geosite: "geosite:openai" }
  },
  googleai: {
    category: "sanction",
    singbox: {
      geosite: "geosite-google-deepmind",
      geositeUrl: "https://raw.githubusercontent.com/Chocolate4U/Iran-sing-box-rules/rule-set/geosite-google-deepmind.srs"
    },
    clash: {
      geosite: "google-deepmind",
      format: "yaml",
      geositeUrl: "https://raw.githubusercontent.com/MetaCubeX/meta-rules-dat/meta/geo/geosite/google-deepmind.yaml"
    },
    xray: { geosite: "geosite:google-deepmind" }
  },
  microsoft: {
    category: "sanction",
    singbox: {
      geosite: "geosite-microsoft",
      geositeUrl: "https://raw.githubusercontent.com/Chocolate4U/Iran-sing-box-rules/rule-set/geosite-microsoft.srs"
    },
    clash: {
      geosite: "microsoft",
      format: "yaml",
      geositeUrl: "https://raw.githubusercontent.com/MetaCubeX/meta-rules-dat/meta/geo/geosite/microsoft.yaml"
    },
    xray: { geosite: "geosite:microsoft" }
  },
  docker: {
    category: "sanction",
    singbox: {
      geosite: "geosite-docker",
      geositeUrl: "https://raw.githubusercontent.com/Chocolate4U/Iran-sing-box-rules/rule-set/geosite-docker.srs"
    },
    clash: {
      geosite: "docker",
      format: "yaml",
      geositeUrl: "https://raw.githubusercontent.com/MetaCubeX/meta-rules-dat/meta/geo/geosite/docker.yaml"
    },
    xray: { geosite: "geosite:docker" }
  }
};
function getActiveRuleKeys(sysConfig = {}) {
  const keys = [];
  const blockThreats = Boolean(sysConfig.blockThreats);
  if (blockThreats || sysConfig.blockMalware) keys.push("malware");
  if (blockThreats || sysConfig.blockPhishing) keys.push("phishing");
  if (blockThreats || sysConfig.blockCryptominers) keys.push("cryptominers");
  if (blockThreats || sysConfig.blockAds) keys.push("ads");
  if (sysConfig.blockPorn) keys.push("porn");
  if (sysConfig.bypassIran) keys.push("iran");
  if (sysConfig.bypassChina) keys.push("china");
  if (sysConfig.bypassRussia) keys.push("russia");
  const bypassAi = Boolean(sysConfig.bypassAi);
  const bypassDev = Boolean(sysConfig.bypassDev);
  if (bypassAi || sysConfig.bypassOpenAi) keys.push("openai");
  if (bypassAi || sysConfig.bypassGoogleAi) keys.push("googleai");
  if (bypassDev || sysConfig.bypassMicrosoft) keys.push("microsoft");
  if (bypassDev || sysConfig.bypassDocker) keys.push("docker");
  return [...new Set(keys)];
}
function buildDeterministicPolicyRules(sysConfig = {}, defaultOutbound = "select") {
  const rules = [];
  const blockUDP443 = Boolean(sysConfig.blockUDP443);
  if (blockUDP443) {
    rules.push({
      id: "transport-block-quic",
      category: "transport",
      action: "reject",
      network: "udp",
      port: 443,
      protocol: "quic",
      description: "Block QUIC (UDP 443) to force fast HTTP/2 or HTTP/1.1 TLS fallback"
    });
  }
  const activeKeys = getActiveRuleKeys(sysConfig);
  const threatKeys = activeKeys.filter((k) => RULESET_CATALOG[k]?.category === "threat");
  const threatDomains = [...sysConfig.blockThreats ? CORE_THREAT_DOMAINS : []];
  const customBlock = Array.isArray(sysConfig.customBlockRules) ? sysConfig.customBlockRules : [];
  customBlock.forEach((r) => {
    if (r && !threatDomains.includes(r)) threatDomains.push(r);
  });
  if (threatKeys.length > 0 || threatDomains.length > 0) {
    rules.push({
      id: "threat-rejection",
      category: "threat",
      action: "reject",
      dnsServerTag: "reject",
      ruleKeys: threatKeys,
      domains: threatDomains,
      description: "Reject verified security threats, malware, phishing, and ad-trackers"
    });
  }
  rules.push({
    id: "private-lan-bypass",
    category: "domestic",
    action: "direct",
    dnsServerTag: "dns-direct",
    ipIsPrivate: true,
    ips: PRIVATE_IP_CIDRS,
    description: "Bypass private local area networks and loopback ranges"
  });
  const domesticKeys = activeKeys.filter((k) => RULESET_CATALOG[k]?.category === "domestic");
  const customBypass = Array.isArray(sysConfig.customBypassRules) ? sysConfig.customBypassRules : [];
  if (domesticKeys.length > 0 || customBypass.length > 0) {
    rules.push({
      id: "domestic-bypass",
      category: "domestic",
      action: "direct",
      dnsServerTag: "dns-direct",
      ruleKeys: domesticKeys,
      domains: customBypass.filter((r) => !r.includes("/")),
      ips: customBypass.filter((r) => r.includes("/")),
      description: "Route domestic regional destinations directly using local DNS resolver"
    });
  }
  const sanctionKeys = activeKeys.filter((k) => RULESET_CATALOG[k]?.category === "sanction");
  const sanctionDomains = [];
  if (sysConfig.bypassAi) sanctionDomains.push(...CORE_AI_DOMAINS);
  if (sysConfig.bypassDev) sanctionDomains.push(...CORE_DEV_DOMAINS);
  const customSanctions = Array.isArray(sysConfig.customBypassSanctionRules) ? sysConfig.customBypassSanctionRules : [];
  customSanctions.forEach((r) => {
    if (r && !sanctionDomains.includes(r)) sanctionDomains.push(r);
  });
  if (sanctionKeys.length > 0 || sanctionDomains.length > 0) {
    rules.push({
      id: "sanction-unblock",
      category: "sanction",
      action: "direct",
      dnsServerTag: "dns-anti-sanction",
      ruleKeys: sanctionKeys,
      domains: [...new Set(sanctionDomains)],
      description: "Route sanctioned services direct via Anti-Sanction unblocking DNS"
    });
  }
  rules.push({
    id: "default-proxy-egress",
    category: "default",
    action: "proxy",
    outbound: defaultOutbound,
    dnsServerTag: "dns-remote",
    description: "Route all unclassified international traffic through proxy tunnel"
  });
  return rules;
}

// LuciProxy/src/subscriptions/policy.js
var VALID_ALPN_REGEX = /^[a-zA-Z0-9_./-]+$/;
function validateAlpn(val) {
  if (val === null || val === void 0) return null;
  let tokens = [];
  if (Array.isArray(val)) {
    tokens = val.map((x) => String(x || "").trim()).filter(Boolean);
  } else if (typeof val === "string") {
    const cleaned = val.trim().toLowerCase();
    if (!cleaned || cleaned === "auto" || cleaned === "unset" || cleaned === "none" || cleaned === "default") {
      return null;
    }
    tokens = val.split(",").map((x) => x.trim()).filter(Boolean);
  } else {
    return null;
  }
  if (tokens.length === 0) return null;
  const validated = [];
  for (const t of tokens) {
    if (!VALID_ALPN_REGEX.test(t) || t.length > 255) {
      throw new Error(`Invalid ALPN token: "${t}". Must match /^[a-zA-Z0-9_./-]+$/ and be <= 255 chars.`);
    }
    validated.push(t);
  }
  return validated;
}
function resolveAlpn(sysConfig = {}, profile = null, runtimeOverride = null) {
  if (runtimeOverride !== null && runtimeOverride !== void 0 && String(runtimeOverride).trim() !== "") {
    return validateAlpn(runtimeOverride);
  }
  if (profile?.alpn !== null && profile?.alpn !== void 0 && String(profile?.alpn).trim() !== "") {
    return validateAlpn(profile.alpn);
  }
  if (sysConfig?.alpn !== null && sysConfig?.alpn !== void 0 && String(sysConfig?.alpn).trim() !== "") {
    return validateAlpn(sysConfig.alpn);
  }
  return null;
}
function resolveNetworkPolicy(sysConfig = {}, defaultOutbound = "select", runtimeAlpn = null) {
  const dnsPolicy = buildCanonicalDnsPolicy(sysConfig);
  const rules = buildDeterministicPolicyRules(sysConfig, defaultOutbound);
  const activeKeys = getActiveRuleKeys(sysConfig);
  const resolvedAlpn = resolveAlpn(sysConfig, null, runtimeAlpn);
  const ruleSets = activeKeys.map((key) => {
    const item = RULESET_CATALOG[key];
    return {
      key,
      category: item.category,
      singbox: item.singbox,
      clash: item.clash,
      xray: item.xray
    };
  });
  return {
    dns: dnsPolicy,
    rules,
    ruleSets,
    transport: {
      blockUDP: true,
      // Standard Worker WebSockets cannot proxy UDP datagrams
      blockUDP443: Boolean(sysConfig.blockUDP443),
      enableIPv6: dnsPolicy.enableIPv6,
      strategy: dnsPolicy.strategy,
      queryStrategyXray: dnsPolicy.queryStrategyXray,
      alpn: resolvedAlpn
    },
    outbound: {
      defaultTag: defaultOutbound,
      fallbackTag: "direct"
    }
  };
}

// LuciProxy/src/subscriptions/population.js
function getResolvedEndpointPopulation(hostName, targetSub = null, allowInsecure = false, sysConfig = {}, runtimeOverrides = {}) {
  const ports = sysConfig.socketPorts ? sysConfig.socketPorts.split(",").map((s) => s.trim()).filter(Boolean) : ["443"];
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
    const effectivePorts = p.userPorts ? p.userPorts.split(",").map((s) => s.trim()).filter(Boolean) : ports;
    const maxCfg = p.maxConfigs || null;
    const profileHostNames = getProfileHostNames(hostName, p);
    let profileNodesCount = 0;
    const effectiveEchList = Array.isArray(p.echConfigList) ? p.echConfigList : Array.isArray(sysConfig?.echConfigList) ? sysConfig.echConfigList : DEFAULT_ECH_CONFIGS;
    const validEchList = (effectiveEchList || []).map((s) => String(s || "").trim()).filter(Boolean);
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
          if (effectiveMode === "alpha" || effectiveMode === "both") {
            const addVlessEntry = (echVal = null) => {
              if (maxCfg && profileNodesCount >= maxCfg) return;
              const selectedProxyIp = pips.length > 0 ? selectDeterministicProxyIp(pips, { colo: sysConfig?.cfColo || "", clientId: p.id, index: profileNodesCount }) : null;
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
                echVal,
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
          if (effectiveMode === "beta" || effectiveMode === "both") {
            if (maxCfg && profileNodesCount >= maxCfg) return;
            const selectedProxyIp = pips.length > 0 ? selectDeterministicProxyIp(pips, { colo: sysConfig?.cfColo || "", clientId: p.id, index: profileNodesCount }) : null;
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

// LuciProxy/src/subscriptions/uri.js
function getFragmentQueryParam(sysConfig, profile = null) {
  const mode = (profile?.fragmentMode || sysConfig?.fragmentMode || "").toLowerCase();
  if (!mode || mode === "off" || mode === "none") return "";
  if (mode === "shadowrocket") return `&fragment=${encodeURIComponent("1,40-60,30-50,tlshello")}`;
  if (mode === "happ") return `&fragment=${encodeURIComponent("3,1,tlshello")}`;
  if (mode === "gentle") return `&fragment=${encodeURIComponent("1,100-200,10-20,tlshello")}`;
  if (mode === "balanced") return `&fragment=${encodeURIComponent("1,40-80,20-40,tlshello")}`;
  if (mode === "aggressive") return `&fragment=${encodeURIComponent("2,20-40,10-30,tlshello")}`;
  if (mode === "custom" && sysConfig?.fragmentParams) {
    const packets = sysConfig.fragmentParams.packets || "1";
    const length = sysConfig.fragmentParams.length || "40-80";
    const interval = sysConfig.fragmentParams.interval || "20-40";
    return `&fragment=${encodeURIComponent(`${packets},${length},${interval},tlshello`)}`;
  }
  return "";
}
async function buildUriProfile(hostName, targetSub = null, allowInsecure = false, sysConfig = {}, runtimeOverrides = {}) {
  const lines = [];
  const fakeNames = getFakeConfigNames(sysConfig, targetSub);
  fakeNames.forEach((name) => {
    lines.push(
      `trojan://00000000-0000-0000-0000-000000000000@127.0.0.1:1080?security=none#${encodeURIComponent(name)}`
    );
  });
  const population = getResolvedEndpointPopulation(hostName, targetSub, allowInsecure, sysConfig, runtimeOverrides);
  for (const item of population) {
    const fmParam = formatVlessFinalMaskParam(item.finalMask, true) || getFragmentQueryParam(sysConfig, item);
    const nodeTag = encodeURIComponent(item.tag);
    if (item.protocol === "alpha") {
      let extBase = `encryption=none&security=${item.sec}&sni=${item.sni}&fp=${item.fingerprint}&type=ws&host=${item.host}&path=${item.path}`;
      if (sysConfig.enableOpt2) extBase += `&pbk=enabled`;
      extBase += `&allowInsecure=${item.allowInsecure ? "1" : "0"}`;
      if (item.alpn && item.alpn.length > 0) {
        extBase += `&alpn=${encodeURIComponent(item.alpn.join(","))}`;
      }
      if (item.isTls && fmParam) extBase += fmParam;
      if (item.echVal) {
        extBase += `&ech=${encodeURIComponent(item.echVal)}`;
      }
      lines.push(`vless://${item.profileId}@${item.server}:${item.port}?${extBase}#${nodeTag}`);
    } else if (item.protocol === "beta") {
      let extTrojan = `security=${item.sec}&sni=${item.sni}&fp=${item.fingerprint}&type=ws&host=${item.host}&path=${item.path}`;
      extTrojan += `&allowInsecure=${item.allowInsecure ? "1" : "0"}`;
      if (item.alpn && item.alpn.length > 0) {
        extTrojan += `&alpn=${encodeURIComponent(item.alpn.join(","))}`;
      }
      if (item.isTls && fmParam) extTrojan += fmParam;
      lines.push(`trojan://${item.profileId}@${item.server}:${item.port}?${extTrojan}#${nodeTag}`);
    }
  }
  return lines.join("\n");
}

// LuciProxy/src/subscriptions/routing.js
var AI_DOMAINS = [...CORE_AI_DOMAINS];
var DEV_DOMAINS = [...CORE_DEV_DOMAINS];
var THREAT_DOMAINS = [...CORE_THREAT_DOMAINS];
var RULESET_URLS = {
  malware: RULESET_CATALOG.malware.singbox.geositeUrl,
  phishing: RULESET_CATALOG.phishing.singbox.geositeUrl,
  cryptominers: RULESET_CATALOG.cryptominers.singbox.geositeUrl,
  ads: RULESET_CATALOG.ads.singbox.geositeUrl,
  iran: RULESET_CATALOG.iran.singbox.geositeUrl,
  china: RULESET_CATALOG.china.singbox.geositeUrl,
  russia: RULESET_CATALOG.russia.singbox.geositeUrl,
  openai: RULESET_CATALOG.openai.singbox.geositeUrl
};
function buildSingBoxRules(sysConfig = {}, defaultOutbound = "select") {
  const rules = [
    {
      action: "sniff"
    },
    {
      protocol: "dns",
      action: "hijack-dns"
    },
    {
      ip_is_private: true,
      outbound: "direct"
    }
  ];
  if (sysConfig.blockUDP443) {
    rules.push({
      network: "udp",
      port: 443,
      action: "reject",
      outbound: "block"
      // Backward-compatible tag
    });
  }
  if (sysConfig.blockThreats || sysConfig.blockMalware || sysConfig.blockPhishing) {
    rules.push({
      domain_suffix: THREAT_DOMAINS,
      action: "reject",
      outbound: "block"
      // Backward-compatible tag
    });
  }
  rules.push(
    {
      clash_mode: "Direct",
      outbound: "direct"
    },
    {
      clash_mode: "Global",
      outbound: defaultOutbound
    }
  );
  if (sysConfig.bypassIran) {
    rules.push({
      rule_set: ["geosite-ir"],
      outbound: "direct"
    });
  }
  if (sysConfig.bypassAi) {
    rules.push({
      domain_suffix: AI_DOMAINS,
      outbound: "direct"
    });
  }
  if (sysConfig.bypassDev) {
    rules.push({
      domain_suffix: DEV_DOMAINS,
      outbound: "direct"
    });
  }
  return rules;
}
function buildClashRules(sysConfig = {}, defaultGroup = "PROXY") {
  const rules = [];
  if (sysConfig.blockUDP443) {
    rules.push("AND,((NETWORK,udp),(DST-PORT,443)),REJECT");
  }
  if (sysConfig.blockThreats || sysConfig.blockMalware || sysConfig.blockPhishing) {
    THREAT_DOMAINS.forEach((domain) => {
      rules.push(`DOMAIN-SUFFIX,${domain},REJECT`);
    });
  }
  rules.push("GEOIP,lan,DIRECT,no-resolve");
  rules.push("GEOIP,IR,DIRECT");
  if (sysConfig.bypassChina) {
    rules.push("GEOIP,CN,DIRECT");
  }
  if (sysConfig.bypassRussia) {
    rules.push("GEOIP,RU,DIRECT");
  }
  if (sysConfig.bypassAi) {
    AI_DOMAINS.forEach((domain) => {
      rules.push(`DOMAIN-SUFFIX,${domain},DIRECT`);
    });
  }
  if (sysConfig.bypassDev) {
    DEV_DOMAINS.forEach((domain) => {
      rules.push(`DOMAIN-SUFFIX,${domain},DIRECT`);
    });
  }
  rules.push(`MATCH,${defaultGroup}`);
  return rules;
}

// LuciProxy/src/subscriptions/clash.js
function formatClashServer(ip) {
  if (!ip) return "";
  const str = String(ip).trim();
  if (str.includes(":")) {
    const cleanIp = str.replace(/^\[|\]$/g, "");
    return `"${cleanIp}"`;
  }
  return str;
}
async function buildYamlProfile(hostName, targetSub = null, allowInsecure = false, sysConfig = {}, runtimeOverrides = {}) {
  const policy = resolveNetworkPolicy(sysConfig, "PROXIES", runtimeOverrides.alpn);
  const dnsPolicy = policy.dns;
  const proxies = [];
  const realProxyNames = [];
  const fakeProxyNames = [];
  const fakeNames = getFakeConfigNames(sysConfig, targetSub);
  fakeNames.forEach((name) => {
    proxies.push(
      `  - name: "${name}"
    type: trojan
    server: 127.0.0.1
    port: 80
    password: "${sysConfig.deviceId || "luciproxy"}"
    udp: false
    tls: false`
    );
    fakeProxyNames.push(`"${name}"`);
  });
  const population = getResolvedEndpointPopulation(hostName, targetSub, allowInsecure, sysConfig, runtimeOverrides);
  population.forEach((item) => {
    const ipVersion = dnsPolicy.enableIPv6 ? "ipv4-prefer" : "ipv4";
    const clashFragYaml = formatClashFragmentYaml(item.finalMask, item.isTls, "    ");
    const alpnYaml = item.alpn && item.alpn.length > 0 ? `
    alpn:
${item.alpn.map((a) => `      - ${a}`).join("\n")}` : "";
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
  const clashRuleSets = policy.ruleSets.filter((r) => r.clash && r.clash.geositeUrl);
  const ruleProviderBlocks = [];
  clashRuleSets.forEach((r) => {
    ruleProviderBlocks.push(
      `  ${r.clash.geosite}:
    type: http
    behavior: domain
    format: ${r.clash.format || "text"}
    path: ./ruleset/${r.clash.geosite}.${r.clash.format === "yaml" ? "yaml" : "txt"}
    url: "${r.clash.geositeUrl}"
    interval: 86400
    proxy: DIRECT`
    );
  });
  const allProxyNames = [...realProxyNames, ...fakeProxyNames];
  const allProxyListYaml = allProxyNames.map((n) => `      - ${n}`).join("\n");
  const realProxyListYaml = realProxyNames.map((n) => `      - ${n}`).join("\n");
  return `# LuciProxy Mihomo / Clash Configuration
# Generated on: ${(/* @__PURE__ */ new Date()).toISOString()}

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
${nameserverPolicyLines.length > 0 ? `  nameserver-policy:
${nameserverPolicyLines.join("\n")}` : ""}
${hostLines.length > 0 ? `  hosts:
${hostLines.join("\n")}` : ""}

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

${ruleProviderBlocks.length > 0 ? `rule-providers:
${ruleProviderBlocks.join("\n")}
` : ""}rules:
${clashRules.map((r) => `  - ${r}`).join("\n")}
`;
}

// LuciProxy/src/subscriptions/singbox.js
async function buildSingBoxJsonProfile(hostName, targetSub = null, allowInsecure = false, sysConfig = {}, runtimeOverrides = {}) {
  const policy = resolveNetworkPolicy(sysConfig, "select", runtimeOverrides.alpn);
  const dnsPolicy = policy.dns;
  const outboundsArr = [];
  const proxyTags = [];
  const fakeTags = [];
  const fakeNames = getFakeConfigNames(sysConfig, targetSub);
  fakeNames.forEach((name) => {
    outboundsArr.push({
      type: "direct",
      tag: name
    });
    fakeTags.push(name);
  });
  const population = getResolvedEndpointPopulation(hostName, targetSub, allowInsecure, sysConfig, runtimeOverrides);
  population.forEach((item) => {
    if (item.protocol === "alpha") {
      outboundsArr.push({
        type: "vless",
        tag: item.tag,
        server: item.server,
        server_port: item.port,
        uuid: item.uuid,
        packet_encoding: "",
        domain_resolver: "dns-direct",
        tls: {
          enabled: item.isTls,
          server_name: item.sni,
          insecure: item.allowInsecure,
          ...item.alpn ? { alpn: item.alpn } : {},
          utls: {
            enabled: true,
            fingerprint: item.fingerprint
          },
          ...sysConfig.enableECH ? {
            ech: {
              enabled: true,
              pq_signature_schemes_enabled: true,
              dynamic_record_sizing_disabled: false
            }
          } : {}
        },
        transport: {
          type: "ws",
          path: item.path,
          headers: { Host: item.host },
          early_data_header_name: "Sec-WebSocket-Protocol",
          max_early_data: 2560
        }
      });
      proxyTags.push(item.tag);
    } else if (item.protocol === "beta") {
      outboundsArr.push({
        type: "trojan",
        tag: item.tag,
        server: item.server,
        server_port: item.port,
        password: item.password,
        domain_resolver: "dns-direct",
        tls: {
          enabled: item.isTls,
          server_name: item.sni,
          insecure: item.allowInsecure,
          ...item.alpn ? { alpn: item.alpn } : {},
          utls: {
            enabled: true,
            fingerprint: item.fingerprint
          },
          ...sysConfig.enableECH ? {
            ech: {
              enabled: true
            }
          } : {}
        },
        transport: {
          type: "ws",
          path: item.path,
          headers: { Host: item.host },
          early_data_header_name: "Sec-WebSocket-Protocol",
          max_early_data: 2560
        }
      });
      proxyTags.push(item.tag);
    }
  });
  const selectorGroup = {
    type: "selector",
    tag: "select",
    outbounds: ["auto", ...proxyTags, ...fakeTags],
    default: "auto"
  };
  const urlTestGroup = {
    type: "urltest",
    tag: "auto",
    outbounds: [...proxyTags],
    url: "http://www.gstatic.com/generate_204",
    interval: "5m",
    tolerance: 50
  };
  const customRules = buildSingBoxRules(sysConfig, "select");
  const dnsServers = [
    {
      tag: "dns-remote",
      type: dnsPolicy.remoteDns.startsWith("https://") ? "https" : "udp",
      server: dnsPolicy.remoteHost,
      detour: "select"
    },
    dnsPolicy.isLocalSystem ? { tag: "dns-direct", type: "local" } : { tag: "dns-direct", type: "udp", server: dnsPolicy.localDns }
  ];
  if (dnsPolicy.antiSanctionDns) {
    dnsServers.push({
      tag: "dns-anti-sanction",
      type: dnsPolicy.isAntiSanctionDomain ? "https" : "udp",
      server: dnsPolicy.antiSanctionHost,
      ...dnsPolicy.isAntiSanctionDomain ? { domain_resolver: "dns-direct" } : {}
    });
  }
  if (dnsPolicy.fakeDns) {
    dnsServers.push({
      tag: "dns-fake",
      type: "fakeip",
      inet4_range: dnsPolicy.fakeIpRangeV4,
      ...dnsPolicy.fakeIpRangeV6 ? { inet6_range: dnsPolicy.fakeIpRangeV6 } : {}
    });
  }
  if (dnsPolicy.bootstrapHosts && Object.keys(dnsPolicy.bootstrapHosts).length > 0) {
    dnsServers.push({
      tag: "hosts",
      type: "hosts",
      predefined: dnsPolicy.bootstrapHosts
    });
  }
  const dnsRules = [
    { clash_mode: "Direct", server: "dns-direct" },
    { clash_mode: "Global", server: "dns-remote" }
  ];
  if (dnsPolicy.bootstrapHosts && Object.keys(dnsPolicy.bootstrapHosts).length > 0) {
    dnsRules.unshift({ ip_accept_any: true, server: "hosts" });
  }
  const threatRuleSets = policy.ruleSets.filter((r) => r.category === "threat").map((r) => r.singbox.geosite);
  if (threatRuleSets.length > 0) {
    dnsRules.push({ action: "reject", rule_set: threatRuleSets });
  }
  const domesticRuleSets = policy.ruleSets.filter((r) => r.category === "domestic").map((r) => r.singbox.geosite);
  if (domesticRuleSets.length > 0) {
    dnsRules.push({ server: "dns-direct", rule_set: domesticRuleSets });
  }
  const sanctionRuleSets = policy.ruleSets.filter((r) => r.category === "sanction").map((r) => r.singbox.geosite);
  if (sanctionRuleSets.length > 0) {
    dnsRules.push({ server: "dns-anti-sanction", rule_set: sanctionRuleSets });
  }
  if (dnsPolicy.fakeDns && sysConfig?.enableTun) {
    dnsRules.push({ inbound: "tun-in", query_type: ["A", "AAAA"], server: "dns-fake" });
  }
  const ruleSets = policy.ruleSets.filter((r) => r.singbox && r.singbox.geositeUrl).map((r) => ({
    type: "remote",
    tag: r.singbox.geosite,
    format: "binary",
    url: r.singbox.geositeUrl,
    download_detour: "direct"
  }));
  const singboxProfile = {
    dns: {
      servers: dnsServers,
      rules: dnsRules,
      strategy: dnsPolicy.strategy,
      independent_cache: true
    },
    inbounds: [
      { type: "mixed", tag: "mixed-in", listen: "127.0.0.1", listen_port: 2080 },
      ...sysConfig?.enableTun ? [{
        type: "tun",
        tag: "tun-in",
        address: ["172.19.0.1/28"],
        mtu: 9e3,
        auto_route: true,
        strict_route: true,
        stack: "mixed"
      }] : []
    ],
    outbounds: [
      selectorGroup,
      urlTestGroup,
      ...outboundsArr,
      { type: "direct", tag: "direct" },
      { type: "block", tag: "block" }
    ],
    route: {
      rules: [
        ...customRules,
        { outbound: "select" }
      ],
      ...ruleSets.length > 0 ? { rule_set: ruleSets } : {},
      auto_detect_interface: true,
      default_domain_resolver: "dns-direct"
    }
  };
  const fragMode = (sysConfig?.fragmentMode || "").toLowerCase();
  if (fragMode && fragMode !== "off" && fragMode !== "none") {
    applySingBoxFragment(singboxProfile);
  }
  return singboxProfile;
}
function applySingBoxFragment(configObj) {
  if (!configObj || typeof configObj !== "object") return configObj;
  configObj.route = configObj.route || {};
  if (!Array.isArray(configObj.route.rules)) {
    configObj.route.rules = [];
  }
  if (!configObj.route.rules.some((r) => r && r.action === "route-options" && r.tls_fragment)) {
    configObj.route.rules.unshift({
      action: "route-options",
      tls_fragment: true,
      tls_fragment_fallback_delay: "500ms"
    });
  }
  return configObj;
}

// LuciProxy/src/subscriptions/v2ray.js
async function buildVJsonProfile(hostName, targetSub = null, allowInsecure = false, sysConfig = {}, runtimeOverrides = {}) {
  const policy = resolveNetworkPolicy(sysConfig, "proxy", runtimeOverrides.alpn);
  const dnsPolicy = policy.dns;
  const outboundsArr = [];
  const allOutboundDomains = /* @__PURE__ */ new Set();
  if (hostName && !isIpAddress(hostName)) {
    allOutboundDomains.add(hostName.trim());
  }
  const population = getResolvedEndpointPopulation(hostName, targetSub, allowInsecure, sysConfig, runtimeOverrides);
  population.forEach((item) => {
    if (item.host && !isIpAddress(item.host)) {
      allOutboundDomains.add(item.host.trim());
    }
    const xrayFm = formatXrayFinalMask(item.finalMask, item.isTls);
    if (item.protocol === "alpha") {
      outboundsArr.push({
        tag: item.tag,
        protocol: "vless",
        settings: {
          vnext: [
            {
              address: item.server,
              port: item.port,
              users: [{ id: item.uuid, encryption: "none" }]
            }
          ]
        },
        streamSettings: {
          network: "ws",
          security: item.sec,
          tlsSettings: item.isTls ? {
            serverName: item.sni,
            allowInsecure: item.allowInsecure,
            ...item.alpn ? { alpn: item.alpn } : {}
          } : void 0,
          wsSettings: { path: item.path, host: item.host },
          ...xrayFm ? { finalmask: xrayFm } : {}
        }
      });
    } else if (item.protocol === "beta") {
      outboundsArr.push({
        tag: item.tag,
        protocol: "trojan",
        settings: {
          servers: [{ address: item.server, port: item.port, password: item.password }]
        },
        streamSettings: {
          network: "ws",
          security: item.sec,
          tlsSettings: item.isTls ? {
            serverName: item.sni,
            allowInsecure: item.allowInsecure,
            ...item.alpn ? { alpn: item.alpn } : {}
          } : void 0,
          wsSettings: { path: item.path, host: item.host },
          ...xrayFm ? { finalmask: xrayFm } : {}
        }
      });
    }
  });
  const firstOutboundTag = outboundsArr[0]?.tag || "proxy";
  const isMultiEndpoint = outboundsArr.length > 1;
  const proxyTags = outboundsArr.map((o) => o.tag);
  const proxyTarget = isMultiEndpoint ? { balancerTag: "proxy-balancer" } : { outboundTag: firstOutboundTag };
  const directDnsAddr = dnsPolicy.isLocalSystem ? "8.8.8.8" : dnsPolicy.localDns;
  const dnsServers = [
    {
      address: dnsPolicy.remoteDns,
      tag: "remote-dns"
    },
    {
      address: directDnsAddr,
      tag: "direct-dns"
    }
  ];
  const outboundDomains = Array.from(allOutboundDomains);
  if (outboundDomains.length > 0) {
    dnsServers.push({
      address: directDnsAddr,
      domains: outboundDomains.map((d) => `full:${d}`),
      tag: "direct-dns",
      skipFallback: true
    });
  }
  const domesticDomains = ["domain:ir"];
  if (Array.isArray(sysConfig.customBypassRules)) {
    sysConfig.customBypassRules.filter((r) => !r.includes("/")).forEach((d) => {
      domesticDomains.push(`domain:${d}`);
    });
  }
  dnsServers.push({
    address: directDnsAddr,
    domains: [...new Set(domesticDomains)],
    tag: "direct-dns",
    skipFallback: true
  });
  const sanctionDomains = [];
  if (sysConfig.bypassAi || sysConfig.bypassOpenAi) {
    CORE_AI_DOMAINS.forEach((d) => sanctionDomains.push(`domain:${d}`));
  }
  if (sysConfig.bypassDev) {
    CORE_DEV_DOMAINS.forEach((d) => sanctionDomains.push(`domain:${d}`));
  }
  if (Array.isArray(sysConfig.customBypassSanctionRules)) {
    sysConfig.customBypassSanctionRules.forEach((d) => {
      if (d) sanctionDomains.push(`domain:${d}`);
    });
  }
  if (sanctionDomains.length > 0) {
    dnsServers.push({
      address: dnsPolicy.antiSanctionDns,
      domains: [...new Set(sanctionDomains)],
      tag: "anti-sanction-dns",
      queryStrategy: "UseIPv4",
      skipFallback: true
    });
  }
  if (dnsPolicy.fakeDns) {
    dnsServers.unshift("fakedns");
  }
  const dnsHosts = {};
  if (dnsPolicy.bootstrapHosts && Object.keys(dnsPolicy.bootstrapHosts).length > 0) {
    Object.entries(dnsPolicy.bootstrapHosts).forEach(([domain, ips]) => {
      dnsHosts[domain] = ips;
    });
  }
  if (sysConfig.blockThreats || sysConfig.blockMalware || sysConfig.blockPhishing) {
    CORE_THREAT_DOMAINS.forEach((domain) => {
      dnsHosts[`domain:${domain}`] = "#3";
    });
    if (Array.isArray(sysConfig.customBlockRules)) {
      sysConfig.customBlockRules.forEach((d) => {
        if (d) dnsHosts[`domain:${d}`] = "#3";
      });
    }
  }
  const routingRules = [
    { type: "field", inboundTag: ["dns-in"], outboundTag: "dns-out" },
    { type: "field", inboundTag: ["remote-dns"], ...proxyTarget },
    { type: "field", inboundTag: ["direct-dns", "anti-sanction-dns", "dns"], outboundTag: "direct" },
    { type: "field", network: "udp", port: "53", outboundTag: "direct" },
    { type: "field", outboundTag: "direct", ip: [...PRIVATE_IP_CIDRS] }
  ];
  if (sysConfig.blockUDP443) {
    routingRules.push({
      type: "field",
      network: "udp",
      port: "443",
      outboundTag: "block"
    });
  }
  if (sysConfig.blockThreats || sysConfig.blockMalware || sysConfig.blockPhishing) {
    const threatDomains = [...CORE_THREAT_DOMAINS];
    if (Array.isArray(sysConfig.customBlockRules)) {
      sysConfig.customBlockRules.forEach((d) => {
        if (d && !threatDomains.includes(d)) threatDomains.push(d);
      });
    }
    routingRules.push({
      type: "field",
      domain: threatDomains.map((d) => `domain:${d}`),
      outboundTag: "block"
    });
  }
  const customBypassIps = Array.isArray(sysConfig.customBypassRules) ? sysConfig.customBypassRules.filter((r) => r.includes("/")) : [];
  if (customBypassIps.length > 0) {
    routingRules.push({
      type: "field",
      outboundTag: "direct",
      ip: customBypassIps
    });
  }
  routingRules.push({
    type: "field",
    outboundTag: "direct",
    domain: [...new Set(domesticDomains)]
  });
  if (sanctionDomains.length > 0) {
    routingRules.push({
      type: "field",
      outboundTag: "direct",
      domain: [...new Set(sanctionDomains)]
    });
  }
  routingRules.push({
    type: "field",
    network: "tcp",
    ...proxyTarget
  });
  return {
    log: { loglevel: "warning" },
    dns: {
      hosts: dnsHosts,
      servers: dnsServers,
      queryStrategy: dnsPolicy.queryStrategyXray,
      tag: "dns"
    },
    inbounds: [
      {
        port: 10808,
        protocol: "socks",
        settings: { auth: "noauth", udp: true },
        sniffing: { enabled: true, destOverride: ["http", "tls", ...dnsPolicy.fakeDns ? ["fakedns"] : []], routeOnly: true }
      },
      {
        port: 10853,
        protocol: "dokodemo-door",
        settings: { address: "1.1.1.1", network: "tcp,udp", port: 53 },
        tag: "dns-in"
      }
    ],
    outbounds: [
      ...outboundsArr,
      { protocol: "dns", tag: "dns-out", settings: { rules: [{ action: "hijack" }] } },
      { protocol: "freedom", tag: "direct", settings: { domainStrategy: "UseIP" } },
      { protocol: "blackhole", tag: "block", settings: { response: { type: "http" } } }
    ],
    routing: {
      domainStrategy: "IPIfNonMatch",
      rules: routingRules,
      ...isMultiEndpoint ? {
        balancers: [
          {
            tag: "proxy-balancer",
            selector: proxyTags,
            strategy: { type: "leastPing" },
            fallbackTag: firstOutboundTag
          }
        ]
      } : {}
    },
    ...isMultiEndpoint ? {
      observatory: {
        subjectSelector: proxyTags,
        probeUrl: "https://www.gstatic.com/generate_204",
        probeInterval: "30s",
        enableConcurrency: true
      }
    } : {}
  };
}

// LuciProxy/src/subscriptions/mirror.js
async function syncGitHubMirror(hostName, sysConfig, force = false) {
  const mirror = sysConfig.githubMirror;
  if (!mirror || typeof mirror !== "object") {
    return { skipped: true, reason: "GitHub mirror not configured" };
  }
  if (!force && !mirror.enabled) {
    return { skipped: true, reason: "GitHub mirror disabled" };
  }
  const token = String(mirror.token || "").trim();
  const rawRepo = String(mirror.repo || "").replace(/^https?:\/\/github\.com\//i, "").replace(/\.git$/i, "").trim();
  const branch = String(mirror.branch || "").trim() || "main";
  const pathPrefix = String(mirror.pathPrefix || "subs").replace(/^\/+|\/+$/g, "");
  if (!token || !rawRepo) {
    return { skipped: true, reason: "GitHub token or repository missing" };
  }
  const results = [];
  const filesToSync = [
    {
      filename: "base64.txt",
      getContent: async () => safeBtoa(await buildUriProfile(hostName, null, false, sysConfig))
    },
    {
      filename: "mihomo.yaml",
      getContent: async () => await buildYamlProfile(hostName, null, false, sysConfig)
    },
    {
      filename: "singbox.json",
      getContent: async () => JSON.stringify(await buildSingBoxJsonProfile(hostName, null, false, sysConfig), null, 2)
    }
  ];
  for (const item of filesToSync) {
    const filePath = pathPrefix ? `${pathPrefix}/${item.filename}` : item.filename;
    const apiUrl = `https://api.github.com/repos/${rawRepo}/contents/${filePath}?ref=${branch}`;
    try {
      let existingSha = null;
      const getRes = await fetch(apiUrl, {
        headers: {
          "User-Agent": "LuciProxy-Mirror/1.0",
          Authorization: `Bearer ${token}`,
          Accept: "application/vnd.github.v3+json"
        }
      });
      if (getRes.ok) {
        const getData = await getRes.json();
        existingSha = getData.sha;
      }
      const rawContent = await item.getContent();
      const b64Payload = safeBtoa(rawContent);
      const putRes = await fetch(`https://api.github.com/repos/${rawRepo}/contents/${filePath}`, {
        method: "PUT",
        headers: {
          "User-Agent": "LuciProxy-Mirror/1.0",
          Authorization: `Bearer ${token}`,
          Accept: "application/vnd.github.v3+json",
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          message: `Update ${item.filename} [LuciProxy Sync]`,
          content: b64Payload,
          branch,
          sha: existingSha || void 0
        })
      });
      results.push({
        file: item.filename,
        ok: putRes.ok,
        status: putRes.status
      });
    } catch (err) {
      results.push({
        file: item.filename,
        ok: false,
        error: err.message
      });
    }
  }
  return {
    success: results.every((r) => r.ok),
    repo: rawRepo,
    branch,
    files: results
  };
}

// LuciProxy/src/protocols/doh.js
async function handleDoH(request, sysConfig = {}) {
  const rawUpstream = sysConfig.customDns || sysConfig.remoteDns || "https://dns.google/dns-query";
  const upstreamDoh = normalizeDohUrl(rawUpstream);
  try {
    const reqUrl = new URL(request.url);
    const targetUrl = new URL(upstreamDoh);
    if (request.method === "GET" && reqUrl.searchParams.has("name") && !reqUrl.searchParams.has("dns")) {
      const name = reqUrl.searchParams.get("name");
      const typeStr = (reqUrl.searchParams.get("type") || "A").toUpperCase();
      const qtype = typeStr === "AAAA" ? 28 : 1;
      if (targetUrl.hostname.includes("google")) {
        const resolveUrl = new URL("https://dns.google/resolve");
        reqUrl.searchParams.forEach((val, key) => resolveUrl.searchParams.set(key, val));
        const jsonRes = await fetch(resolveUrl.toString(), {
          method: "GET",
          headers: { "Accept": "application/dns-json" }
        });
        const respHeaders2 = new Headers(jsonRes.headers);
        respHeaders2.set("Access-Control-Allow-Origin", "*");
        respHeaders2.set("Cache-Control", "public, max-age=120");
        return new Response(jsonRes.body, {
          status: jsonRes.status,
          headers: respHeaders2
        });
      } else {
        const wireQuery = encodeDnsQuery(name, qtype);
        const b64 = uint8ArrayToBase64Url(wireQuery);
        const queryUrl = new URL(upstreamDoh);
        queryUrl.searchParams.set("dns", b64);
        const wireRes = await fetch(queryUrl.toString(), {
          method: "GET",
          headers: { "Accept": "application/dns-message" }
        });
        if (!wireRes.ok) return new Response("DNS-over-HTTPS Upstream Error", { status: 502 });
        const wireBuf = await wireRes.arrayBuffer();
        const ips = parseDnsResponse(wireBuf, qtype);
        const jsonResp = {
          Status: ips.length > 0 ? 0 : 3,
          TC: false,
          RD: true,
          RA: true,
          AD: false,
          CD: false,
          Question: [{ name, type: qtype }],
          Answer: ips.map((ip) => ({ name, type: qtype, TTL: 300, data: ip }))
        };
        return new Response(JSON.stringify(jsonResp), {
          status: 200,
          headers: {
            "Content-Type": "application/dns-json",
            "Access-Control-Allow-Origin": "*",
            "Cache-Control": "public, max-age=120"
          }
        });
      }
    }
    if (request.method === "POST" && targetUrl.pathname.endsWith("/dns-query")) {
      const bodyBytes = await request.arrayBuffer();
      const b64 = uint8ArrayToBase64Url(bodyBytes);
      targetUrl.searchParams.set("dns", b64);
      const res2 = await fetch(targetUrl.toString(), {
        method: "GET",
        headers: { "Accept": "application/dns-message" }
      });
      const respHeaders2 = new Headers(res2.headers);
      respHeaders2.set("Access-Control-Allow-Origin", "*");
      respHeaders2.set("Cache-Control", "public, max-age=120");
      return new Response(res2.body, {
        status: res2.status,
        headers: respHeaders2
      });
    }
    reqUrl.searchParams.forEach((value, key) => {
      targetUrl.searchParams.set(key, value);
    });
    const headers = new Headers(request.headers);
    headers.set("Host", targetUrl.hostname);
    headers.delete("cf-connecting-ip");
    headers.delete("x-forwarded-for");
    const fetchInit = {
      method: request.method,
      headers,
      redirect: "follow"
    };
    if (request.method === "POST") {
      fetchInit.body = await request.arrayBuffer();
    }
    const res = await fetch(targetUrl.toString(), fetchInit);
    const respHeaders = new Headers(res.headers);
    respHeaders.set("Access-Control-Allow-Origin", "*");
    respHeaders.set("Cache-Control", "public, max-age=120");
    return new Response(res.body, {
      status: res.status,
      headers: respHeaders
    });
  } catch (e) {
    return new Response("DNS-over-HTTPS Resolution Error", { status: 502 });
  }
}

// LuciProxy/src/subscriptions/wireguard.js
function generateWireguardConfig(sysConfig = {}, isAmnezia = false, title = "LuciProxy-WARP") {
  const privateKey = sysConfig.warpPrivateKey || "4NyxMUme2zGv5r3QWI0hJBlNglm1J/thoCE55PK29G8=";
  const publicKey = sysConfig.warpPublicKey || "bmXOC+F1FxEMF9dyiK2H5/1SUtzH0JuVo51h2wPfgyo=";
  const warpIPv6 = sysConfig.warpIPv6 || "2606:4700:110:8735:6b2e:3d6e:8c3a:70a0/128";
  const dns = sysConfig.warpRemoteDNS || "1.1.1.1";
  let endpoints = sysConfig.warpEndpoints;
  if (typeof endpoints === "string") {
    endpoints = endpoints.split(/[\r\n,;]+/).map((s) => s.trim()).filter(Boolean);
  }
  if (!endpoints || !Array.isArray(endpoints) || endpoints.length === 0) {
    endpoints = ["engage.cloudflareclient.com:2408"];
  }
  const jc = sysConfig.amneziaNoiseCount || 5;
  const jmin = sysConfig.amneziaNoiseSizeMin || 50;
  const jmax = sysConfig.amneziaNoiseSizeMax || 100;
  const configs = endpoints.map((endpoint, idx) => {
    const lines = [
      `# ${title} ${isAmnezia ? "AmneziaWG" : "WireGuard"} [${idx + 1}]`,
      "[Interface]",
      `PrivateKey = ${privateKey}`,
      `Address = 172.16.0.2/32, ${warpIPv6}`,
      `DNS = ${dns}`,
      "MTU = 1280"
    ];
    if (isAmnezia) {
      lines.push(
        `Jc = ${jc}`,
        `Jmin = ${jmin}`,
        `Jmax = ${jmax}`,
        "S1 = 0",
        "S2 = 0",
        "H1 = 1",
        "H2 = 2",
        "H3 = 3",
        "H4 = 4"
      );
    }
    lines.push(
      "",
      "[Peer]",
      `PublicKey = ${publicKey}`,
      "AllowedIPs = 0.0.0.0/0, ::/0",
      `Endpoint = ${endpoint}`,
      "PersistentKeepalive = 25"
    );
    return lines.join("\n");
  });
  return configs.join("\n\n---\n\n");
}

// LuciProxy/src/subscriptions/export.js
function getSharedSettings(sysConfig) {
  const rawCleanIps = sysConfig.cleanIps || sysConfig.proxyIPs || [];
  const proxyIPs = Array.isArray(rawCleanIps) ? rawCleanIps : String(rawCleanIps).split(/[\r\n,]+/).map((s) => s.trim()).filter(Boolean);
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
function buildSharedSettingsResponse(sysConfig) {
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

// LuciProxy/src/assets/templates.js
function decodeBase64Utf8(b64) {
  try {
    if (typeof atob === "function") {
      const bin = atob(b64);
      const bytes = new Uint8Array(bin.length);
      for (let i = 0; i < bin.length; i++) {
        bytes[i] = bin.charCodeAt(i);
      }
      return new TextDecoder().decode(bytes);
    }
  } catch {
  }
  try {
    if (typeof Buffer !== "undefined") {
      return Buffer.from(b64, "base64").toString("utf-8");
    }
  } catch {
  }
  return "";
}
var DASHBOARD_B64 = "PCFET0NUWVBFIGh0bWw+CjxodG1sIGxhbmc9ImVuIj4KPGhlYWQ+CiAgICA8bWV0YSBjaGFyc2V0PSJVVEYtOCI+CiAgICA8bWV0YSBuYW1lPSJ2aWV3cG9ydCIgY29udGVudD0id2lkdGg9ZGV2aWNlLXdpZHRoLCBpbml0aWFsLXNjYWxlPTEuMCwgbWF4aW11bS1zY2FsZT0xLjAiPgogICAgPHRpdGxlPkx1Y2lQcm94eSDigJQgRWRnZSBDb250cm9sIENvbnNvbGU8L3RpdGxlPgogICAgPHN0eWxlPgogICAgICAgIDpyb290IHsKICAgICAgICAgICAgLS1iZy1ib2R5OiAjMDkwZDE2OwogICAgICAgICAgICAtLWJnLWNhcmQ6ICMxMTE4Mjc7CiAgICAgICAgICAgIC0tYmctY2FyZC1zdWJ0bGU6ICMxNjFmMzM7CiAgICAgICAgICAgIC0tYmctaW5wdXQ6ICMwZjE3MmE7CiAgICAgICAgICAgIC0tYm9yZGVyLWNvbG9yOiAjMWYyOTNkOwogICAgICAgICAgICAtLWJvcmRlci1mb2N1czogIzYzNjZmMTsKICAgICAgICAgICAgLS10ZXh0LW1haW46ICNmOGZhZmM7CiAgICAgICAgICAgIC0tdGV4dC1tdXRlZDogIzk0YTNiODsKICAgICAgICAgICAgLS1hY2NlbnQ6ICM2MzY2ZjE7CiAgICAgICAgICAgIC0tYWNjZW50LWhvdmVyOiAjNGY0NmU1OwogICAgICAgICAgICAtLWN5YW46ICMwNmI2ZDQ7CiAgICAgICAgICAgIC0tZ3JlZW46ICMxMGI5ODE7CiAgICAgICAgICAgIC0tYW1iZXI6ICNmNTllMGI7CiAgICAgICAgICAgIC0tcmVkOiAjZWY0NDQ0OwogICAgICAgICAgICAtLXJhZGl1cy1tZDogMTBweDsKICAgICAgICAgICAgLS1yYWRpdXMtbGc6IDE2cHg7CiAgICAgICAgICAgIC0tZm9udC1mYW1pbHk6IC1hcHBsZS1zeXN0ZW0sIEJsaW5rTWFjU3lzdGVtRm9udCwgIlNlZ29lIFVJIiwgUm9ib3RvLCBPeHlnZW4sIFVidW50dSwgQ2FudGFyZWxsLCAiSGVsdmV0aWNhIE5ldWUiLCBzYW5zLXNlcmlmOwogICAgICAgIH0KCiAgICAgICAgKiB7IGJveC1zaXppbmc6IGJvcmRlci1ib3g7IG1hcmdpbjogMDsgcGFkZGluZzogMDsgfQogICAgICAgIGJvZHkgewogICAgICAgICAgICBmb250LWZhbWlseTogdmFyKC0tZm9udC1mYW1pbHkpOwogICAgICAgICAgICBiYWNrZ3JvdW5kOiB2YXIoLS1iZy1ib2R5KTsKICAgICAgICAgICAgY29sb3I6IHZhcigtLXRleHQtbWFpbik7CiAgICAgICAgICAgIG1pbi1oZWlnaHQ6IDEwMHZoOwogICAgICAgICAgICBkaXNwbGF5OiBmbGV4OwogICAgICAgICAgICBmbGV4LWRpcmVjdGlvbjogY29sdW1uOwogICAgICAgICAgICBsaW5lLWhlaWdodDogMS41OwogICAgICAgIH0KCiAgICAgICAgLyogVG9wIE5hdmlnYXRpb24gSGVhZGVyICovCiAgICAgICAgaGVhZGVyIHsKICAgICAgICAgICAgYmFja2dyb3VuZDogdmFyKC0tYmctY2FyZCk7CiAgICAgICAgICAgIGJvcmRlci1ib3R0b206IDFweCBzb2xpZCB2YXIoLS1ib3JkZXItY29sb3IpOwogICAgICAgICAgICBwYWRkaW5nOiAxNHB4IDI0cHg7CiAgICAgICAgICAgIGRpc3BsYXk6IGZsZXg7CiAgICAgICAgICAgIGFsaWduLWl0ZW1zOiBjZW50ZXI7CiAgICAgICAgICAgIGp1c3RpZnktY29udGVudDogc3BhY2UtYmV0d2VlbjsKICAgICAgICAgICAgcG9zaXRpb246IHN0aWNreTsKICAgICAgICAgICAgdG9wOiAwOwogICAgICAgICAgICB6LWluZGV4OiA0MDsKICAgICAgICB9CiAgICAgICAgLmJyYW5kIHsKICAgICAgICAgICAgZGlzcGxheTogZmxleDsKICAgICAgICAgICAgYWxpZ24taXRlbXM6IGNlbnRlcjsKICAgICAgICAgICAgZ2FwOiAxMnB4OwogICAgICAgICAgICBmb250LXdlaWdodDogNzAwOwogICAgICAgICAgICBmb250LXNpemU6IDEuMTVyZW07CiAgICAgICAgICAgIGxldHRlci1zcGFjaW5nOiAtMC4wMmVtOwogICAgICAgIH0KICAgICAgICAuYnJhbmQtYmFkZ2UgewogICAgICAgICAgICBiYWNrZ3JvdW5kOiBsaW5lYXItZ3JhZGllbnQoMTM1ZGVnLCB2YXIoLS1hY2NlbnQpLCB2YXIoLS1jeWFuKSk7CiAgICAgICAgICAgIGNvbG9yOiB3aGl0ZTsKICAgICAgICAgICAgd2lkdGg6IDMycHg7CiAgICAgICAgICAgIGhlaWdodDogMzJweDsKICAgICAgICAgICAgYm9yZGVyLXJhZGl1czogOHB4OwogICAgICAgICAgICBkaXNwbGF5OiBmbGV4OwogICAgICAgICAgICBhbGlnbi1pdGVtczogY2VudGVyOwogICAgICAgICAgICBqdXN0aWZ5LWNvbnRlbnQ6IGNlbnRlcjsKICAgICAgICAgICAgZm9udC13ZWlnaHQ6IDgwMDsKICAgICAgICAgICAgZm9udC1zaXplOiAxLjFyZW07CiAgICAgICAgfQogICAgICAgIC5oZWFkZXItbWV0YSB7CiAgICAgICAgICAgIGRpc3BsYXk6IGZsZXg7CiAgICAgICAgICAgIGFsaWduLWl0ZW1zOiBjZW50ZXI7CiAgICAgICAgICAgIGdhcDogMTZweDsKICAgICAgICAgICAgZm9udC1zaXplOiAwLjg1cmVtOwogICAgICAgICAgICBjb2xvcjogdmFyKC0tdGV4dC1tdXRlZCk7CiAgICAgICAgfQogICAgICAgIC5zdGF0dXMtcGlsbCB7CiAgICAgICAgICAgIGRpc3BsYXk6IGlubGluZS1mbGV4OwogICAgICAgICAgICBhbGlnbi1pdGVtczogY2VudGVyOwogICAgICAgICAgICBnYXA6IDZweDsKICAgICAgICAgICAgcGFkZGluZzogNHB4IDEwcHg7CiAgICAgICAgICAgIGJvcmRlci1yYWRpdXM6IDIwcHg7CiAgICAgICAgICAgIGZvbnQtc2l6ZTogMC43NXJlbTsKICAgICAgICAgICAgZm9udC13ZWlnaHQ6IDYwMDsKICAgICAgICAgICAgYmFja2dyb3VuZDogcmdiYSgxNiwgMTg1LCAxMjksIDAuMSk7CiAgICAgICAgICAgIGNvbG9yOiB2YXIoLS1ncmVlbik7CiAgICAgICAgICAgIGJvcmRlcjogMXB4IHNvbGlkIHJnYmEoMTYsIDE4NSwgMTI5LCAwLjIpOwogICAgICAgIH0KICAgICAgICAuc3RhdHVzLXBpbGwud2FybmluZyB7CiAgICAgICAgICAgIGJhY2tncm91bmQ6IHJnYmEoMjQ1LCAxNTgsIDExLCAwLjEpOwogICAgICAgICAgICBjb2xvcjogdmFyKC0tYW1iZXIpOwogICAgICAgICAgICBib3JkZXItY29sb3I6IHJnYmEoMjQ1LCAxNTgsIDExLCAwLjIpOwogICAgICAgIH0KICAgICAgICAuYnRuLWdob3N0IHsKICAgICAgICAgICAgYmFja2dyb3VuZDogdHJhbnNwYXJlbnQ7CiAgICAgICAgICAgIGJvcmRlcjogMXB4IHNvbGlkIHZhcigtLWJvcmRlci1jb2xvcik7CiAgICAgICAgICAgIGNvbG9yOiB2YXIoLS10ZXh0LW1haW4pOwogICAgICAgICAgICBwYWRkaW5nOiA2cHggMTRweDsKICAgICAgICAgICAgYm9yZGVyLXJhZGl1czogdmFyKC0tcmFkaXVzLW1kKTsKICAgICAgICAgICAgY3Vyc29yOiBwb2ludGVyOwogICAgICAgICAgICBmb250LXNpemU6IDAuODJyZW07CiAgICAgICAgICAgIGZvbnQtd2VpZ2h0OiA1MDA7CiAgICAgICAgICAgIHRyYW5zaXRpb246IGFsbCAwLjE1cyBlYXNlOwogICAgICAgIH0KICAgICAgICAuYnRuLWdob3N0OmhvdmVyIHsKICAgICAgICAgICAgYmFja2dyb3VuZDogdmFyKC0tYmctY2FyZC1zdWJ0bGUpOwogICAgICAgICAgICBib3JkZXItY29sb3I6IHZhcigtLXRleHQtbXV0ZWQpOwogICAgICAgIH0KCiAgICAgICAgLyogVGFiIE5hdmlnYXRpb24gQmFyICovCiAgICAgICAgbmF2IHsKICAgICAgICAgICAgYmFja2dyb3VuZDogdmFyKC0tYmctY2FyZCk7CiAgICAgICAgICAgIGJvcmRlci1ib3R0b206IDFweCBzb2xpZCB2YXIoLS1ib3JkZXItY29sb3IpOwogICAgICAgICAgICBwYWRkaW5nOiAwIDI0cHg7CiAgICAgICAgICAgIGRpc3BsYXk6IGZsZXg7CiAgICAgICAgICAgIGdhcDogMjRweDsKICAgICAgICAgICAgb3ZlcmZsb3cteDogYXV0bzsKICAgICAgICB9CiAgICAgICAgLm5hdi1pdGVtIHsKICAgICAgICAgICAgcGFkZGluZzogMTJweCA0cHg7CiAgICAgICAgICAgIGNvbG9yOiB2YXIoLS10ZXh0LW11dGVkKTsKICAgICAgICAgICAgY3Vyc29yOiBwb2ludGVyOwogICAgICAgICAgICBmb250LXNpemU6IDAuOXJlbTsKICAgICAgICAgICAgZm9udC13ZWlnaHQ6IDUwMDsKICAgICAgICAgICAgYm9yZGVyLWJvdHRvbTogMnB4IHNvbGlkIHRyYW5zcGFyZW50OwogICAgICAgICAgICB3aGl0ZS1zcGFjZTogbm93cmFwOwogICAgICAgICAgICB0cmFuc2l0aW9uOiBhbGwgMC4xNXMgZWFzZTsKICAgICAgICB9CiAgICAgICAgLm5hdi1pdGVtOmhvdmVyIHsgY29sb3I6IHZhcigtLXRleHQtbWFpbik7IH0KICAgICAgICAubmF2LWl0ZW0uYWN0aXZlIHsKICAgICAgICAgICAgY29sb3I6IHZhcigtLWFjY2VudCk7CiAgICAgICAgICAgIGJvcmRlci1ib3R0b20tY29sb3I6IHZhcigtLWFjY2VudCk7CiAgICAgICAgfQoKICAgICAgICAvKiBNYWluIENvbnRhaW5lciAqLwogICAgICAgIG1haW4gewogICAgICAgICAgICBmbGV4OiAxOwogICAgICAgICAgICBtYXgtd2lkdGg6IDEyMDBweDsKICAgICAgICAgICAgd2lkdGg6IDEwMCU7CiAgICAgICAgICAgIG1hcmdpbjogMCBhdXRvOwogICAgICAgICAgICBwYWRkaW5nOiAyNHB4OwogICAgICAgIH0KCiAgICAgICAgLyogQ2FyZCBTZWN0aW9ucyAqLwogICAgICAgIC5jYXJkIHsKICAgICAgICAgICAgYmFja2dyb3VuZDogdmFyKC0tYmctY2FyZCk7CiAgICAgICAgICAgIGJvcmRlcjogMXB4IHNvbGlkIHZhcigtLWJvcmRlci1jb2xvcik7CiAgICAgICAgICAgIGJvcmRlci1yYWRpdXM6IHZhcigtLXJhZGl1cy1sZyk7CiAgICAgICAgICAgIHBhZGRpbmc6IDIwcHg7CiAgICAgICAgICAgIG1hcmdpbi1ib3R0b206IDIwcHg7CiAgICAgICAgfQogICAgICAgIC5jYXJkLXRpdGxlIHsKICAgICAgICAgICAgZm9udC1zaXplOiAxLjA1cmVtOwogICAgICAgICAgICBmb250LXdlaWdodDogNjAwOwogICAgICAgICAgICBtYXJnaW4tYm90dG9tOiAxNHB4OwogICAgICAgICAgICBkaXNwbGF5OiBmbGV4OwogICAgICAgICAgICBhbGlnbi1pdGVtczogY2VudGVyOwogICAgICAgICAgICBqdXN0aWZ5LWNvbnRlbnQ6IHNwYWNlLWJldHdlZW47CiAgICAgICAgfQoKICAgICAgICAvKiBNZXRyaWMgR3JpZCAqLwogICAgICAgIC5tZXRyaWNzLWdyaWQgewogICAgICAgICAgICBkaXNwbGF5OiBncmlkOwogICAgICAgICAgICBncmlkLXRlbXBsYXRlLWNvbHVtbnM6IHJlcGVhdChhdXRvLWZpdCwgbWlubWF4KDIyMHB4LCAxZnIpKTsKICAgICAgICAgICAgZ2FwOiAxNnB4OwogICAgICAgICAgICBtYXJnaW4tYm90dG9tOiAyMHB4OwogICAgICAgIH0KICAgICAgICAubWV0cmljLWNhcmQgewogICAgICAgICAgICBiYWNrZ3JvdW5kOiB2YXIoLS1iZy1jYXJkKTsKICAgICAgICAgICAgYm9yZGVyOiAxcHggc29saWQgdmFyKC0tYm9yZGVyLWNvbG9yKTsKICAgICAgICAgICAgYm9yZGVyLXJhZGl1czogdmFyKC0tcmFkaXVzLW1kKTsKICAgICAgICAgICAgcGFkZGluZzogMTZweDsKICAgICAgICAgICAgZGlzcGxheTogZmxleDsKICAgICAgICAgICAgZmxleC1kaXJlY3Rpb246IGNvbHVtbjsKICAgICAgICAgICAgZ2FwOiA2cHg7CiAgICAgICAgfQogICAgICAgIC5tZXRyaWMtbGFiZWwgewogICAgICAgICAgICBmb250LXNpemU6IDAuOHJlbTsKICAgICAgICAgICAgY29sb3I6IHZhcigtLXRleHQtbXV0ZWQpOwogICAgICAgICAgICB0ZXh0LXRyYW5zZm9ybTogdXBwZXJjYXNlOwogICAgICAgICAgICBsZXR0ZXItc3BhY2luZzogMC4wNWVtOwogICAgICAgIH0KICAgICAgICAubWV0cmljLXZhbHVlIHsKICAgICAgICAgICAgZm9udC1zaXplOiAxLjZyZW07CiAgICAgICAgICAgIGZvbnQtd2VpZ2h0OiA3MDA7CiAgICAgICAgICAgIGNvbG9yOiB2YXIoLS10ZXh0LW1haW4pOwogICAgICAgIH0KCiAgICAgICAgLyogVGFibGVzICovCiAgICAgICAgLnRhYmxlLXJlc3BvbnNpdmUgewogICAgICAgICAgICBvdmVyZmxvdy14OiBhdXRvOwogICAgICAgIH0KICAgICAgICB0YWJsZSB7CiAgICAgICAgICAgIHdpZHRoOiAxMDAlOwogICAgICAgICAgICBib3JkZXItY29sbGFwc2U6IGNvbGxhcHNlOwogICAgICAgICAgICB0ZXh0LWFsaWduOiBsZWZ0OwogICAgICAgICAgICBmb250LXNpemU6IDAuODhyZW07CiAgICAgICAgfQogICAgICAgIHRoIHsKICAgICAgICAgICAgY29sb3I6IHZhcigtLXRleHQtbXV0ZWQpOwogICAgICAgICAgICBwYWRkaW5nOiAxMHB4IDEycHg7CiAgICAgICAgICAgIGJvcmRlci1ib3R0b206IDFweCBzb2xpZCB2YXIoLS1ib3JkZXItY29sb3IpOwogICAgICAgICAgICBmb250LXdlaWdodDogNjAwOwogICAgICAgICAgICBmb250LXNpemU6IDAuNzhyZW07CiAgICAgICAgICAgIHRleHQtdHJhbnNmb3JtOiB1cHBlcmNhc2U7CiAgICAgICAgfQogICAgICAgIHRkIHsKICAgICAgICAgICAgcGFkZGluZzogMTJweDsKICAgICAgICAgICAgYm9yZGVyLWJvdHRvbTogMXB4IHNvbGlkIHZhcigtLWJvcmRlci1jb2xvcik7CiAgICAgICAgfQogICAgICAgIHRyOmhvdmVyIHRkIHsKICAgICAgICAgICAgYmFja2dyb3VuZDogcmdiYSgyNTUsIDI1NSwgMjU1LCAwLjAyKTsKICAgICAgICB9CgogICAgICAgIC8qIEJhZGdlcyAqLwogICAgICAgIC5iYWRnZSB7CiAgICAgICAgICAgIGRpc3BsYXk6IGlubGluZS1ibG9jazsKICAgICAgICAgICAgcGFkZGluZzogM3B4IDhweDsKICAgICAgICAgICAgYm9yZGVyLXJhZGl1czogNnB4OwogICAgICAgICAgICBmb250LXNpemU6IDAuNzVyZW07CiAgICAgICAgICAgIGZvbnQtd2VpZ2h0OiA2MDA7CiAgICAgICAgfQogICAgICAgIC5iYWRnZS1hY3RpdmUgeyBiYWNrZ3JvdW5kOiByZ2JhKDE2LCAxODUsIDEyOSwgMC4xNSk7IGNvbG9yOiB2YXIoLS1ncmVlbik7IH0KICAgICAgICAuYmFkZ2UtcGF1c2VkIHsgYmFja2dyb3VuZDogcmdiYSgyNDUsIDE1OCwgMTEsIDAuMTUpOyBjb2xvcjogdmFyKC0tYW1iZXIpOyB9CiAgICAgICAgLmJhZGdlLWV4cGlyZWQgeyBiYWNrZ3JvdW5kOiByZ2JhKDIzOSwgNjgsIDY4LCAwLjE1KTsgY29sb3I6IHZhcigtLXJlZCk7IH0KICAgICAgICAuYmFkZ2UtbGltaXQgeyBiYWNrZ3JvdW5kOiByZ2JhKDIzOSwgNjgsIDY4LCAwLjE1KTsgY29sb3I6IHZhcigtLXJlZCk7IH0KCiAgICAgICAgLyogQnV0dG9ucyAmIElucHV0cyAqLwogICAgICAgIC5idG4gewogICAgICAgICAgICBiYWNrZ3JvdW5kOiB2YXIoLS1hY2NlbnQpOwogICAgICAgICAgICBjb2xvcjogd2hpdGU7CiAgICAgICAgICAgIGJvcmRlcjogbm9uZTsKICAgICAgICAgICAgcGFkZGluZzogOHB4IDE2cHg7CiAgICAgICAgICAgIGJvcmRlci1yYWRpdXM6IHZhcigtLXJhZGl1cy1tZCk7CiAgICAgICAgICAgIGZvbnQtc2l6ZTogMC44NXJlbTsKICAgICAgICAgICAgZm9udC13ZWlnaHQ6IDYwMDsKICAgICAgICAgICAgY3Vyc29yOiBwb2ludGVyOwogICAgICAgICAgICB0cmFuc2l0aW9uOiBhbGwgMC4xNXMgZWFzZTsKICAgICAgICAgICAgZGlzcGxheTogaW5saW5lLWZsZXg7CiAgICAgICAgICAgIGFsaWduLWl0ZW1zOiBjZW50ZXI7CiAgICAgICAgICAgIGdhcDogNnB4OwogICAgICAgIH0KICAgICAgICAuYnRuOmhvdmVyIHsgYmFja2dyb3VuZDogdmFyKC0tYWNjZW50LWhvdmVyKTsgfQogICAgICAgIC5idG4tc20geyBwYWRkaW5nOiA1cHggMTBweDsgZm9udC1zaXplOiAwLjc4cmVtOyBib3JkZXItcmFkaXVzOiA2cHg7IH0KICAgICAgICAuYnRuLXNlY29uZGFyeSB7IGJhY2tncm91bmQ6IHZhcigtLWJnLWNhcmQtc3VidGxlKTsgY29sb3I6IHZhcigtLXRleHQtbWFpbik7IGJvcmRlcjogMXB4IHNvbGlkIHZhcigtLWJvcmRlci1jb2xvcik7IH0KICAgICAgICAuYnRuLXNlY29uZGFyeTpob3ZlciB7IGJhY2tncm91bmQ6ICMxZTI5M2I7IGJvcmRlci1jb2xvcjogdmFyKC0tdGV4dC1tdXRlZCk7IH0KICAgICAgICAuYnRuLWRhbmdlciB7IGJhY2tncm91bmQ6IHJnYmEoMjM5LCA2OCwgNjgsIDAuMik7IGNvbG9yOiB2YXIoLS1yZWQpOyBib3JkZXI6IDFweCBzb2xpZCByZ2JhKDIzOSwgNjgsIDY4LCAwLjMpOyB9CiAgICAgICAgLmJ0bi1kYW5nZXI6aG92ZXIgeyBiYWNrZ3JvdW5kOiB2YXIoLS1yZWQpOyBjb2xvcjogd2hpdGU7IH0KCiAgICAgICAgLmlucHV0LCAuc2VsZWN0LCAudGV4dGFyZWEgewogICAgICAgICAgICB3aWR0aDogMTAwJTsKICAgICAgICAgICAgYmFja2dyb3VuZDogdmFyKC0tYmctaW5wdXQpOwogICAgICAgICAgICBib3JkZXI6IDFweCBzb2xpZCB2YXIoLS1ib3JkZXItY29sb3IpOwogICAgICAgICAgICBjb2xvcjogdmFyKC0tdGV4dC1tYWluKTsKICAgICAgICAgICAgcGFkZGluZzogOXB4IDEycHg7CiAgICAgICAgICAgIGJvcmRlci1yYWRpdXM6IHZhcigtLXJhZGl1cy1tZCk7CiAgICAgICAgICAgIGZvbnQtc2l6ZTogMC44OHJlbTsKICAgICAgICAgICAgb3V0bGluZTogbm9uZTsKICAgICAgICAgICAgdHJhbnNpdGlvbjogYm9yZGVyLWNvbG9yIDAuMTVzIGVhc2U7CiAgICAgICAgfQogICAgICAgIC5pbnB1dDpmb2N1cywgLnNlbGVjdDpmb2N1cywgLnRleHRhcmVhOmZvY3VzIHsKICAgICAgICAgICAgYm9yZGVyLWNvbG9yOiB2YXIoLS1ib3JkZXItZm9jdXMpOwogICAgICAgIH0KICAgICAgICAuZm9ybS1ncm91cCB7CiAgICAgICAgICAgIG1hcmdpbi1ib3R0b206IDE0cHg7CiAgICAgICAgfQogICAgICAgIC5mb3JtLWxhYmVsIHsKICAgICAgICAgICAgZGlzcGxheTogYmxvY2s7CiAgICAgICAgICAgIGZvbnQtc2l6ZTogMC44cmVtOwogICAgICAgICAgICBjb2xvcjogdmFyKC0tdGV4dC1tdXRlZCk7CiAgICAgICAgICAgIG1hcmdpbi1ib3R0b206IDVweDsKICAgICAgICAgICAgZm9udC13ZWlnaHQ6IDUwMDsKICAgICAgICB9CgogICAgICAgIC8qIE1vZGFscyAqLwogICAgICAgIC5tb2RhbC1vdmVybGF5IHsKICAgICAgICAgICAgcG9zaXRpb246IGZpeGVkOwogICAgICAgICAgICB0b3A6IDA7IGxlZnQ6IDA7IHJpZ2h0OiAwOyBib3R0b206IDA7CiAgICAgICAgICAgIGJhY2tncm91bmQ6IHJnYmEoMCwgMCwgMCwgMC43NSk7CiAgICAgICAgICAgIGRpc3BsYXk6IG5vbmU7CiAgICAgICAgICAgIGFsaWduLWl0ZW1zOiBjZW50ZXI7CiAgICAgICAgICAgIGp1c3RpZnktY29udGVudDogY2VudGVyOwogICAgICAgICAgICB6LWluZGV4OiA1MDsKICAgICAgICAgICAgcGFkZGluZzogMTZweDsKICAgICAgICB9CiAgICAgICAgLm1vZGFsLW92ZXJsYXkub3BlbiB7IGRpc3BsYXk6IGZsZXg7IH0KICAgICAgICAubW9kYWwgewogICAgICAgICAgICBiYWNrZ3JvdW5kOiB2YXIoLS1iZy1jYXJkKTsKICAgICAgICAgICAgYm9yZGVyOiAxcHggc29saWQgdmFyKC0tYm9yZGVyLWNvbG9yKTsKICAgICAgICAgICAgYm9yZGVyLXJhZGl1czogdmFyKC0tcmFkaXVzLWxnKTsKICAgICAgICAgICAgbWF4LXdpZHRoOiA1NDBweDsKICAgICAgICAgICAgd2lkdGg6IDEwMCU7CiAgICAgICAgICAgIHBhZGRpbmc6IDI0cHg7CiAgICAgICAgICAgIG1heC1oZWlnaHQ6IDkwdmg7CiAgICAgICAgICAgIG92ZXJmbG93LXk6IGF1dG87CiAgICAgICAgfQoKICAgICAgICAvKiBMb2dpbiBTY3JlZW4gT3ZlcmxheSAqLwogICAgICAgICNsb2dpbi1zY3JlZW4gewogICAgICAgICAgICBwb3NpdGlvbjogZml4ZWQ7CiAgICAgICAgICAgIHRvcDogMDsgbGVmdDogMDsgcmlnaHQ6IDA7IGJvdHRvbTogMDsKICAgICAgICAgICAgYmFja2dyb3VuZDogdmFyKC0tYmctYm9keSk7CiAgICAgICAgICAgIGRpc3BsYXk6IGZsZXg7CiAgICAgICAgICAgIGFsaWduLWl0ZW1zOiBjZW50ZXI7CiAgICAgICAgICAgIGp1c3RpZnktY29udGVudDogY2VudGVyOwogICAgICAgICAgICB6LWluZGV4OiAxMDA7CiAgICAgICAgICAgIHBhZGRpbmc6IDE2cHg7CiAgICAgICAgfQogICAgICAgIC5sb2dpbi1jYXJkIHsKICAgICAgICAgICAgYmFja2dyb3VuZDogdmFyKC0tYmctY2FyZCk7CiAgICAgICAgICAgIGJvcmRlcjogMXB4IHNvbGlkIHZhcigtLWJvcmRlci1jb2xvcik7CiAgICAgICAgICAgIGJvcmRlci1yYWRpdXM6IHZhcigtLXJhZGl1cy1sZyk7CiAgICAgICAgICAgIG1heC13aWR0aDogMzgwcHg7CiAgICAgICAgICAgIHdpZHRoOiAxMDAlOwogICAgICAgICAgICBwYWRkaW5nOiAzMnB4IDI4cHg7CiAgICAgICAgICAgIHRleHQtYWxpZ246IGNlbnRlcjsKICAgICAgICAgICAgYm94LXNoYWRvdzogMCAyMHB4IDI1cHggLTVweCByZ2JhKDAsIDAsIDAsIDAuNSk7CiAgICAgICAgfQogICAgICAgIC5sb2dpbi1sb2dvIHsKICAgICAgICAgICAgd2lkdGg6IDQ4cHg7CiAgICAgICAgICAgIGhlaWdodDogNDhweDsKICAgICAgICAgICAgYmFja2dyb3VuZDogbGluZWFyLWdyYWRpZW50KDEzNWRlZywgdmFyKC0tYWNjZW50KSwgdmFyKC0tY3lhbikpOwogICAgICAgICAgICBib3JkZXItcmFkaXVzOiAxMnB4OwogICAgICAgICAgICBtYXJnaW46IDAgYXV0byAxNnB4OwogICAgICAgICAgICBkaXNwbGF5OiBmbGV4OwogICAgICAgICAgICBhbGlnbi1pdGVtczogY2VudGVyOwogICAgICAgICAgICBqdXN0aWZ5LWNvbnRlbnQ6IGNlbnRlcjsKICAgICAgICAgICAgZm9udC1zaXplOiAxLjVyZW07CiAgICAgICAgICAgIGZvbnQtd2VpZ2h0OiA4MDA7CiAgICAgICAgICAgIGNvbG9yOiB3aGl0ZTsKICAgICAgICB9CgogICAgICAgIC8qIExvZ3MgQ29uc29sZSAqLwogICAgICAgIC5jb25zb2xlLWxvZ3MgewogICAgICAgICAgICBiYWNrZ3JvdW5kOiB2YXIoLS1iZy1pbnB1dCk7CiAgICAgICAgICAgIGJvcmRlcjogMXB4IHNvbGlkIHZhcigtLWJvcmRlci1jb2xvcik7CiAgICAgICAgICAgIGJvcmRlci1yYWRpdXM6IHZhcigtLXJhZGl1cy1tZCk7CiAgICAgICAgICAgIHBhZGRpbmc6IDEycHg7CiAgICAgICAgICAgIGZvbnQtZmFtaWx5OiBtb25vc3BhY2U7CiAgICAgICAgICAgIGZvbnQtc2l6ZTogMC44cmVtOwogICAgICAgICAgICBtYXgtaGVpZ2h0OiAzODBweDsKICAgICAgICAgICAgb3ZlcmZsb3cteTogYXV0bzsKICAgICAgICAgICAgY29sb3I6ICNjYmQ1ZTE7CiAgICAgICAgICAgIHdoaXRlLXNwYWNlOiBwcmUtd3JhcDsKICAgICAgICB9CgogICAgICAgIC5oaWRkZW4geyBkaXNwbGF5OiBub25lICFpbXBvcnRhbnQ7IH0KICAgIDwvc3R5bGU+CjwvaGVhZD4KPGJvZHk+CgogICAgPCEtLSBMb2dpbiBBdXRoZW50aWNhdGlvbiBWaWV3IC0tPgogICAgPGRpdiBpZD0ibG9naW4tc2NyZWVuIj4KICAgICAgICA8ZGl2IGNsYXNzPSJsb2dpbi1jYXJkIj4KICAgICAgICAgICAgPGRpdiBjbGFzcz0ibG9naW4tbG9nbyI+TDwvZGl2PgogICAgICAgICAgICA8aDIgc3R5bGU9ImZvbnQtc2l6ZTogMS4zcmVtOyBtYXJnaW4tYm90dG9tOiA2cHg7Ij5MdWNpUHJveHk8L2gyPgogICAgICAgICAgICA8cCBzdHlsZT0iZm9udC1zaXplOiAwLjg1cmVtOyBjb2xvcjogdmFyKC0tdGV4dC1tdXRlZCk7IG1hcmdpbi1ib3R0b206IDI0cHg7Ij5FbnRlciBhZG1pbmlzdHJhdGl2ZSBrZXkgdG8gbWFuYWdlIGVkZ2UgZ2F0ZXdheTwvcD4KICAgICAgICAgICAgPGZvcm0gaWQ9ImxvZ2luLWZvcm0iPgogICAgICAgICAgICAgICAgPGRpdiBjbGFzcz0iZm9ybS1ncm91cCIgc3R5bGU9InRleHQtYWxpZ246IGxlZnQ7Ij4KICAgICAgICAgICAgICAgICAgICA8bGFiZWwgY2xhc3M9ImZvcm0tbGFiZWwiIGZvcj0ibG9naW4ta2V5Ij5NYXN0ZXIgS2V5PC9sYWJlbD4KICAgICAgICAgICAgICAgICAgICA8aW5wdXQgdHlwZT0icGFzc3dvcmQiIGlkPSJsb2dpbi1rZXkiIGNsYXNzPSJpbnB1dCIgcGxhY2Vob2xkZXI9IuKAouKAouKAouKAouKAouKAouKAouKAoiIgYXV0b2ZvY3VzIHJlcXVpcmVkPgogICAgICAgICAgICAgICAgPC9kaXY+CiAgICAgICAgICAgICAgICA8ZGl2IGlkPSJsb2dpbi1lcnJvciIgc3R5bGU9ImNvbG9yOiB2YXIoLS1yZWQpOyBmb250LXNpemU6IDAuOHJlbTsgbWFyZ2luLWJvdHRvbTogMTJweDsgbWluLWhlaWdodDogMThweDsiPjwvZGl2PgogICAgICAgICAgICAgICAgPGJ1dHRvbiB0eXBlPSJzdWJtaXQiIGNsYXNzPSJidG4iIHN0eWxlPSJ3aWR0aDogMTAwJTsganVzdGlmeS1jb250ZW50OiBjZW50ZXI7Ij5TaWduIEluPC9idXR0b24+CiAgICAgICAgICAgIDwvZm9ybT4KICAgICAgICA8L2Rpdj4KICAgIDwvZGl2PgoKICAgIDwhLS0gVG9wIEhlYWRlciAtLT4KICAgIDxoZWFkZXI+CiAgICAgICAgPGRpdiBjbGFzcz0iYnJhbmQiPgogICAgICAgICAgICA8ZGl2IGNsYXNzPSJicmFuZC1iYWRnZSI+TDwvZGl2PgogICAgICAgICAgICA8c3Bhbj5MdWNpUHJveHk8L3NwYW4+CiAgICAgICAgPC9kaXY+CiAgICAgICAgPGRpdiBjbGFzcz0iaGVhZGVyLW1ldGEiPgogICAgICAgICAgICA8c3BhbiBpZD0iaGVhZGVyLWVkZ2UtY29sbyIgY2xhc3M9InN0YXR1cy1waWxsIj5FZGdlIE9ubGluZTwvc3Bhbj4KICAgICAgICAgICAgPHNwYW4gaWQ9ImhlYWRlci1kYi1waWxsIiBjbGFzcz0ic3RhdHVzLXBpbGwiPkQxIEFjdGl2ZTwvc3Bhbj4KICAgICAgICAgICAgPGJ1dHRvbiBjbGFzcz0iYnRuLWdob3N0IiBpZD0iYnRuLWxvZ291dCI+TG9nb3V0PC9idXR0b24+CiAgICAgICAgPC9kaXY+CiAgICA8L2hlYWRlcj4KCiAgICA8IS0tIE5hdmlnYXRpb24gVGFicyAtLT4KICAgIDxuYXY+CiAgICAgICAgPGRpdiBjbGFzcz0ibmF2LWl0ZW0gYWN0aXZlIiBkYXRhLXRhYj0idGFiLW92ZXJ2aWV3Ij5PdmVydmlldzwvZGl2PgogICAgICAgIDxkaXYgY2xhc3M9Im5hdi1pdGVtIiBkYXRhLXRhYj0idGFiLXN1YnNjcmliZXJzIj5TdWJzY3JpYmVyczwvZGl2PgogICAgICAgIDxkaXYgY2xhc3M9Im5hdi1pdGVtIiBkYXRhLXRhYj0idGFiLXNldHRpbmdzIj5TeXN0ZW0gQ29uZmlndXJhdGlvbjwvZGl2PgogICAgICAgIDxkaXYgY2xhc3M9Im5hdi1pdGVtIiBkYXRhLXRhYj0idGFiLWRpYWdub3N0aWNzIj5EaWFnbm9zdGljczwvZGl2PgogICAgICAgIDxkaXYgY2xhc3M9Im5hdi1pdGVtIiBkYXRhLXRhYj0idGFiLWxvZ3MiPkF1ZGl0IExvZ3M8L2Rpdj4KICAgIDwvbmF2PgoKICAgIDwhLS0gRHluYW1pYyBXYXJuaW5nIFBsYWNlaG9sZGVyIC0tPgogICAgPGRpdiBzdHlsZT0ibWF4LXdpZHRoOiAxMjAwcHg7IHdpZHRoOiAxMDAlOyBtYXJnaW46IDE2cHggYXV0byAwOyBwYWRkaW5nOiAwIDI0cHg7Ij4KICAgICAgICBfX0hBU19EQl9XQVJOSU5HX18KICAgIDwvZGl2PgoKICAgIDwhLS0gTWFpbiBXb3Jrc3BhY2UgLS0+CiAgICA8bWFpbj4KCiAgICAgICAgPCEtLSBUQUIgMTogT1ZFUlZJRVcgLS0+CiAgICAgICAgPHNlY3Rpb24gaWQ9InRhYi1vdmVydmlldyIgY2xhc3M9InRhYi1jb250ZW50Ij4KICAgICAgICAgICAgPGRpdiBjbGFzcz0ibWV0cmljcy1ncmlkIj4KICAgICAgICAgICAgICAgIDxkaXYgY2xhc3M9Im1ldHJpYy1jYXJkIj4KICAgICAgICAgICAgICAgICAgICA8c3BhbiBjbGFzcz0ibWV0cmljLWxhYmVsIj5BY3RpdmUgU3Vic2NyaWJlcnM8L3NwYW4+CiAgICAgICAgICAgICAgICAgICAgPHNwYW4gY2xhc3M9Im1ldHJpYy12YWx1ZSIgaWQ9InN0YXQtc3Vic2NyaWJlcnMiPjA8L3NwYW4+CiAgICAgICAgICAgICAgICA8L2Rpdj4KICAgICAgICAgICAgICAgIDxkaXYgY2xhc3M9Im1ldHJpYy1jYXJkIj4KICAgICAgICAgICAgICAgICAgICA8c3BhbiBjbGFzcz0ibWV0cmljLWxhYmVsIj5Ub3RhbCBCYW5kd2lkdGg8L3NwYW4+CiAgICAgICAgICAgICAgICAgICAgPHNwYW4gY2xhc3M9Im1ldHJpYy12YWx1ZSIgaWQ9InN0YXQtYmFuZHdpZHRoIj4wLjAwIEdCPC9zcGFuPgogICAgICAgICAgICAgICAgPC9kaXY+CiAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzPSJtZXRyaWMtY2FyZCI+CiAgICAgICAgICAgICAgICAgICAgPHNwYW4gY2xhc3M9Im1ldHJpYy1sYWJlbCI+Q2xvdWRmbGFyZSBDb2xvPC9zcGFuPgogICAgICAgICAgICAgICAgICAgIDxzcGFuIGNsYXNzPSJtZXRyaWMtdmFsdWUiIGlkPSJzdGF0LWNvbG8iPkVER0U8L3NwYW4+CiAgICAgICAgICAgICAgICA8L2Rpdj4KICAgICAgICAgICAgICAgIDxkaXYgY2xhc3M9Im1ldHJpYy1jYXJkIj4KICAgICAgICAgICAgICAgICAgICA8c3BhbiBjbGFzcz0ibWV0cmljLWxhYmVsIj5WZXJzaW9uPC9zcGFuPgogICAgICAgICAgICAgICAgICAgIDxzcGFuIGNsYXNzPSJtZXRyaWMtdmFsdWUiIHN0eWxlPSJmb250LXNpemU6IDEuM3JlbTsiPnZfX0NVUlJFTlRfVkVSU0lPTl9fPC9zcGFuPgogICAgICAgICAgICAgICAgPC9kaXY+CiAgICAgICAgICAgIDwvZGl2PgoKICAgICAgICAgICAgPGRpdiBjbGFzcz0iY2FyZCI+CiAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzPSJjYXJkLXRpdGxlIj4KICAgICAgICAgICAgICAgICAgICA8c3Bhbj5FZGdlIE5vZGUgSW5mb3JtYXRpb248L3NwYW4+CiAgICAgICAgICAgICAgICAgICAgPGJ1dHRvbiBjbGFzcz0iYnRuIGJ0bi1zbSBidG4tc2Vjb25kYXJ5IiBvbmNsaWNrPSJyZWZyZXNoT3ZlcnZpZXcoKSI+UmVmcmVzaCBNZXRyaWNzPC9idXR0b24+CiAgICAgICAgICAgICAgICA8L2Rpdj4KICAgICAgICAgICAgICAgIDxkaXYgc3R5bGU9ImRpc3BsYXk6IGdyaWQ7IGdyaWQtdGVtcGxhdGUtY29sdW1uczogcmVwZWF0KGF1dG8tZml0LCBtaW5tYXgoMjgwcHgsIDFmcikpOyBnYXA6IDE0cHg7IGZvbnQtc2l6ZTogMC44OHJlbTsiPgogICAgICAgICAgICAgICAgICAgIDxkaXY+PHNwYW4gc3R5bGU9ImNvbG9yOnZhcigtLXRleHQtbXV0ZWQpOyI+Q2xpZW50IEVncmVzcyBJUDo8L3NwYW4+IDxzdHJvbmcgaWQ9Im5vZGUtaXAiPuKAlDwvc3Ryb25nPjwvZGl2PgogICAgICAgICAgICAgICAgICAgIDxkaXY+PHNwYW4gc3R5bGU9ImNvbG9yOnZhcigtLXRleHQtbXV0ZWQpOyI+TG9jYXRpb246PC9zcGFuPiA8c3Ryb25nIGlkPSJub2RlLWxvYyI+4oCUPC9zdHJvbmc+PC9kaXY+CiAgICAgICAgICAgICAgICAgICAgPGRpdj48c3BhbiBzdHlsZT0iY29sb3I6dmFyKC0tdGV4dC1tdXRlZCk7Ij5Qcm90b2NvbCBNb2RlOjwvc3Bhbj4gPHN0cm9uZyBpZD0ibm9kZS1tb2RlIj5BbHBoYSAoVkxFU1MpPC9zdHJvbmc+PC9kaXY+CiAgICAgICAgICAgICAgICAgICAgPGRpdj48c3BhbiBzdHlsZT0iY29sb3I6dmFyKC0tdGV4dC1tdXRlZCk7Ij5TdWJzY3JpcHRpb24gUm91dGU6PC9zcGFuPiA8c3Ryb25nIGlkPSJub2RlLXN1Yi1yb3V0ZSI+L3N5bmM8L3N0cm9uZz48L2Rpdj4KICAgICAgICAgICAgICAgIDwvZGl2PgogICAgICAgICAgICA8L2Rpdj4KICAgICAgICA8L3NlY3Rpb24+CgogICAgICAgIDwhLS0gVEFCIDI6IFNVQlNDUklCRVJTIC0tPgogICAgICAgIDxzZWN0aW9uIGlkPSJ0YWItc3Vic2NyaWJlcnMiIGNsYXNzPSJ0YWItY29udGVudCBoaWRkZW4iPgogICAgICAgICAgICA8ZGl2IGNsYXNzPSJjYXJkIj4KICAgICAgICAgICAgICAgIDxkaXYgY2xhc3M9ImNhcmQtdGl0bGUiPgogICAgICAgICAgICAgICAgICAgIDxzcGFuPlN1YnNjcmliZXJzIE1hbmFnZW1lbnQ8L3NwYW4+CiAgICAgICAgICAgICAgICAgICAgPGRpdiBzdHlsZT0iZGlzcGxheTogZmxleDsgZ2FwOiA4cHg7Ij4KICAgICAgICAgICAgICAgICAgICAgICAgPGlucHV0IHR5cGU9InRleHQiIGlkPSJ1c2VyLXNlYXJjaCIgY2xhc3M9ImlucHV0IiBwbGFjZWhvbGRlcj0iU2VhcmNoIHN1YnNjcmliZXJzLi4uIiBzdHlsZT0id2lkdGg6IDIyMHB4OyBwYWRkaW5nOiA2cHggMTBweDsgZm9udC1zaXplOiAwLjgycmVtOyI+CiAgICAgICAgICAgICAgICAgICAgICAgIDxidXR0b24gY2xhc3M9ImJ0biBidG4tc20iIG9uY2xpY2s9Im9wZW5BZGRVc2VyTW9kYWwoKSI+KyBBZGQgU3Vic2NyaWJlcjwvYnV0dG9uPgogICAgICAgICAgICAgICAgICAgIDwvZGl2PgogICAgICAgICAgICAgICAgPC9kaXY+CiAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzPSJ0YWJsZS1yZXNwb25zaXZlIj4KICAgICAgICAgICAgICAgICAgICA8dGFibGU+CiAgICAgICAgICAgICAgICAgICAgICAgIDx0aGVhZD4KICAgICAgICAgICAgICAgICAgICAgICAgICAgIDx0cj4KICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA8dGg+TmFtZSAvIFVVSUQ8L3RoPgogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDx0aD5TdGF0dXM8L3RoPgogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDx0aD5UcmFmZmljIFVzZWQ8L3RoPgogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDx0aD5FeHBpcmF0aW9uPC90aD4KICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA8dGg+QWN0aW9uczwvdGg+CiAgICAgICAgICAgICAgICAgICAgICAgICAgICA8L3RyPgogICAgICAgICAgICAgICAgICAgICAgICA8L3RoZWFkPgogICAgICAgICAgICAgICAgICAgICAgICA8dGJvZHkgaWQ9InN1YnNjcmliZXJzLXRib2R5Ij4KICAgICAgICAgICAgICAgICAgICAgICAgICAgIDx0cj48dGQgY29sc3Bhbj0iNSIgc3R5bGU9InRleHQtYWxpZ246IGNlbnRlcjsgY29sb3I6IHZhcigtLXRleHQtbXV0ZWQpOyI+TG9hZGluZyBzdWJzY3JpYmVycy4uLjwvdGQ+PC90cj4KICAgICAgICAgICAgICAgICAgICAgICAgPC90Ym9keT4KICAgICAgICAgICAgICAgICAgICA8L3RhYmxlPgogICAgICAgICAgICAgICAgPC9kaXY+CiAgICAgICAgICAgIDwvZGl2PgogICAgICAgIDwvc2VjdGlvbj4KCiAgICAgICAgPCEtLSBUQUIgMzogU1lTVEVNIENPTkZJR1VSQVRJT04gLS0+CiAgICAgICAgPHNlY3Rpb24gaWQ9InRhYi1zZXR0aW5ncyIgY2xhc3M9InRhYi1jb250ZW50IGhpZGRlbiI+CiAgICAgICAgICAgIDxkaXYgY2xhc3M9ImNhcmQiPgogICAgICAgICAgICAgICAgPGRpdiBjbGFzcz0iY2FyZC10aXRsZSI+R2F0ZXdheSBTZXR0aW5nczwvZGl2PgogICAgICAgICAgICAgICAgPGZvcm0gaWQ9InNldHRpbmdzLWZvcm0iPgogICAgICAgICAgICAgICAgICAgIDxkaXYgc3R5bGU9ImRpc3BsYXk6IGdyaWQ7IGdyaWQtdGVtcGxhdGUtY29sdW1uczogcmVwZWF0KGF1dG8tZml0LCBtaW5tYXgoMjgwcHgsIDFmcikpOyBnYXA6IDE2cHg7Ij4KICAgICAgICAgICAgICAgICAgICAgICAgPGRpdiBjbGFzcz0iZm9ybS1ncm91cCI+CiAgICAgICAgICAgICAgICAgICAgICAgICAgICA8bGFiZWwgY2xhc3M9ImZvcm0tbGFiZWwiPlN1YnNjcmlwdGlvbiBSb3V0ZSAoU2VjcmV0IFBhdGgpPC9sYWJlbD4KICAgICAgICAgICAgICAgICAgICAgICAgICAgIDxpbnB1dCB0eXBlPSJ0ZXh0IiBpZD0iY2ZnLWFwaS1yb3V0ZSIgY2xhc3M9ImlucHV0IiB2YWx1ZT0ic3luYyIgcmVxdWlyZWQ+CiAgICAgICAgICAgICAgICAgICAgICAgIDwvZGl2PgogICAgICAgICAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzPSJmb3JtLWdyb3VwIj4KICAgICAgICAgICAgICAgICAgICAgICAgICAgIDxsYWJlbCBjbGFzcz0iZm9ybS1sYWJlbCI+UHJvdG9jb2wgTW9kZTwvbGFiZWw+CiAgICAgICAgICAgICAgICAgICAgICAgICAgICA8c2VsZWN0IGlkPSJjZmctbW9kZSIgY2xhc3M9InNlbGVjdCI+CiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgPG9wdGlvbiB2YWx1ZT0iYWxwaGEiPkFscGhhIOKAlCBWTEVTUyBvdmVyIFdlYlNvY2tldCAoUmVjb21tZW5kZWQpPC9vcHRpb24+CiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgPG9wdGlvbiB2YWx1ZT0iYmV0YSI+QmV0YSDigJQgVHJvamFuIG92ZXIgV2ViU29ja2V0PC9vcHRpb24+CiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgPG9wdGlvbiB2YWx1ZT0iYm90aCI+Qm90aCDigJQgRHVhbCBWTEVTUyAmIFRyb2phbiBPdXRib3VuZHM8L29wdGlvbj4KICAgICAgICAgICAgICAgICAgICAgICAgICAgIDwvc2VsZWN0PgogICAgICAgICAgICAgICAgICAgICAgICA8L2Rpdj4KICAgICAgICAgICAgICAgICAgICAgICAgPGRpdiBjbGFzcz0iZm9ybS1ncm91cCI+CiAgICAgICAgICAgICAgICAgICAgICAgICAgICA8bGFiZWwgY2xhc3M9ImZvcm0tbGFiZWwiPlVwZGF0ZSBNYXN0ZXIgUGFzc3dvcmQgKGxlYXZlIGJsYW5rIHRvIGtlZXApPC9sYWJlbD4KICAgICAgICAgICAgICAgICAgICAgICAgICAgIDxpbnB1dCB0eXBlPSJwYXNzd29yZCIgaWQ9ImNmZy1tYXN0ZXIta2V5IiBjbGFzcz0iaW5wdXQiIHBsYWNlaG9sZGVyPSJOZXcgbWFzdGVyIGtleSIgYXV0b2NvbXBsZXRlPSJuZXctcGFzc3dvcmQiPgogICAgICAgICAgICAgICAgICAgICAgICA8L2Rpdj4KICAgICAgICAgICAgICAgICAgICAgICAgPGRpdiBjbGFzcz0iZm9ybS1ncm91cCI+CiAgICAgICAgICAgICAgICAgICAgICAgICAgICA8bGFiZWwgY2xhc3M9ImZvcm0tbGFiZWwiPkRlZmF1bHQgRmluYWwgTWFzayAoI2ZpbmFsTWFzayBmcmFnbWVudCwgb3B0aW9uYWwpPC9sYWJlbD4KICAgICAgICAgICAgICAgICAgICAgICAgICAgIDxpbnB1dCB0eXBlPSJ0ZXh0IiBpZD0iY2ZnLWZpbmFsLW1hc2siIGNsYXNzPSJpbnB1dCIgcGxhY2Vob2xkZXI9ImUuZy4gTHVjaS1GYXN0IChlbXB0eSBmb3IgZGVmYXVsdCB0YWcgI3ZOYW1lKSI+CiAgICAgICAgICAgICAgICAgICAgICAgIDwvZGl2PgogICAgICAgICAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzPSJmb3JtLWdyb3VwIj4KICAgICAgICAgICAgICAgICAgICAgICAgICAgIDxsYWJlbCBjbGFzcz0iZm9ybS1sYWJlbCI+Q3VzdG9tIERvSCBSZXNvbHZlcjwvbGFiZWw+CiAgICAgICAgICAgICAgICAgICAgICAgICAgICA8aW5wdXQgdHlwZT0idGV4dCIgaWQ9ImNmZy1jdXN0b20tZG5zIiBjbGFzcz0iaW5wdXQiIHZhbHVlPSJodHRwczovL2Nsb3VkZmxhcmUtZG5zLmNvbS9kbnMtcXVlcnkiPgogICAgICAgICAgICAgICAgICAgICAgICA8L2Rpdj4KICAgICAgICAgICAgICAgICAgICA8L2Rpdj4KCiAgICAgICAgICAgICAgICAgICAgPGRpdiBjbGFzcz0iZm9ybS1ncm91cCI+CiAgICAgICAgICAgICAgICAgICAgICAgIDxsYWJlbCBjbGFzcz0iZm9ybS1sYWJlbCI+Q2xlYW4gQ0ROIElQIEFkZHJlc3NlcyAob25lIHBlciBsaW5lLCBlLmcuIDEwNC4xNi4xLjEjQ2xvdWRmbGFyZSk8L2xhYmVsPgogICAgICAgICAgICAgICAgICAgICAgICA8dGV4dGFyZWEgaWQ9ImNmZy1jbGVhbi1pcHMiIGNsYXNzPSJ0ZXh0YXJlYSIgcm93cz0iNCIgcGxhY2Vob2xkZXI9IjEwNC4xNi4xLjEjQ0YxJiMxMDsxNzIuNjQuMC4xI0NGMiI+PC90ZXh0YXJlYT4KICAgICAgICAgICAgICAgICAgICA8L2Rpdj4KCiAgICAgICAgICAgICAgICAgICAgPGRpdiBjbGFzcz0iZm9ybS1ncm91cCI+CiAgICAgICAgICAgICAgICAgICAgICAgIDxsYWJlbCBjbGFzcz0iZm9ybS1sYWJlbCI+VXBzdHJlYW0gUHJveHkgLyBCYWNrdXAgUmVsYXlzIChvbmUgcGVyIGxpbmUsIGUuZy4gMS4yLjMuNDo0NDMpPC9sYWJlbD4KICAgICAgICAgICAgICAgICAgICAgICAgPHRleHRhcmVhIGlkPSJjZmctYmFja3VwLXJlbGF5IiBjbGFzcz0idGV4dGFyZWEiIHJvd3M9IjMiIHBsYWNlaG9sZGVyPSIxLjIuMy40OjQ0MyI+PC90ZXh0YXJlYT4KICAgICAgICAgICAgICAgICAgICA8L2Rpdj4KCiAgICAgICAgICAgICAgICAgICAgPGRpdiBjbGFzcz0iZm9ybS1ncm91cCI+CiAgICAgICAgICAgICAgICAgICAgICAgIDxsYWJlbCBjbGFzcz0iZm9ybS1sYWJlbCI+QXBwbGljYXRpb24tTGF5ZXIgUHJvdG9jb2wgTmVnb3RpYXRpb24gKEFMUE4pPC9sYWJlbD4KICAgICAgICAgICAgICAgICAgICAgICAgPGlucHV0IHR5cGU9InRleHQiIGlkPSJjZmctYWxwbiIgY2xhc3M9ImlucHV0IiBwbGFjZWhvbGRlcj0iZS5nLiBodHRwLzEuMSBvciBoMixodHRwLzEuMSAobGVhdmUgZW1wdHkgZm9yIGF1dG8vZGVmYXVsdCkiPgogICAgICAgICAgICAgICAgICAgICAgICA8c3BhbiBzdHlsZT0iY29sb3I6dmFyKC0tdGV4dC1tdXRlZCk7IGZvbnQtc2l6ZTowLjc1cmVtOyI+VExTIEFMUE4gbGlzdCBmb3IgcHJveHkgZW5kcG9pbnRzLiBMZWF2ZSBibGFuayBmb3IgY2xpZW50IGRlZmF1bHQsIG9yIHNwZWNpZnkgY29tbWEtc2VwYXJhdGVkIHRva2VucyBsaWtlIDxjb2RlPmh0dHAvMS4xPC9jb2RlPiBvciA8Y29kZT5oMixodHRwLzEuMTwvY29kZT4uPC9zcGFuPgogICAgICAgICAgICAgICAgICAgIDwvZGl2PgoKICAgICAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzPSJmb3JtLWdyb3VwIj4KICAgICAgICAgICAgICAgICAgICAgICAgPGRpdiBzdHlsZT0iZGlzcGxheTogZmxleDsganVzdGlmeS1jb250ZW50OiBzcGFjZS1iZXR3ZWVuOyBhbGlnbi1pdGVtczogY2VudGVyOyBtYXJnaW4tYm90dG9tOiA2cHg7Ij4KICAgICAgICAgICAgICAgICAgICAgICAgICAgIDxsYWJlbCBjbGFzcz0iZm9ybS1sYWJlbCIgc3R5bGU9Im1hcmdpbi1ib3R0b206MDsiPkdsb2JhbCBFQ0ggQ29uZmlndXJhdGlvbnMgKDxzcGFuIGlkPSJjZmctZWNoLWNvdW50Ij42MDwvc3Bhbj4gYWN0aXZlKTwvbGFiZWw+CiAgICAgICAgICAgICAgICAgICAgICAgICAgICA8ZGl2IHN0eWxlPSJkaXNwbGF5OmZsZXg7IGdhcDo2cHg7Ij4KICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA8YnV0dG9uIHR5cGU9ImJ1dHRvbiIgY2xhc3M9ImJ0biBidG4tc20gYnRuLXNlY29uZGFyeSIgb25jbGljaz0icmVzZXRHbG9iYWxFY2hEZWZhdWx0cygpIj5SZXNldCA2MCBEZWZhdWx0czwvYnV0dG9uPgogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDxidXR0b24gdHlwZT0iYnV0dG9uIiBjbGFzcz0iYnRuIGJ0bi1zbSBidG4tc2Vjb25kYXJ5IiBvbmNsaWNrPSJjbGVhckdsb2JhbEVjaCgpIj5DbGVhciBBbGw8L2J1dHRvbj4KICAgICAgICAgICAgICAgICAgICAgICAgICAgIDwvZGl2PgogICAgICAgICAgICAgICAgICAgICAgICA8L2Rpdj4KICAgICAgICAgICAgICAgICAgICAgICAgPHRleHRhcmVhIGlkPSJjZmctZWNoLWxpc3QiIGNsYXNzPSJ0ZXh0YXJlYSIgcm93cz0iNiIgcGxhY2Vob2xkZXI9ImRvbWFpbit1ZHA6Ly9pcCAob25lIHBlciBsaW5lKSIgb25pbnB1dD0idXBkYXRlR2xvYmFsRWNoQ291bnQoKSI+PC90ZXh0YXJlYT4KICAgICAgICAgICAgICAgICAgICAgICAgPHNtYWxsIHN0eWxlPSJjb2xvcjp2YXIoLS10ZXh0LW11dGVkKTsgZm9udC1zaXplOjAuNzVyZW07Ij5Db25maWd1cmFibGUgZWNoQ29uZmlnTGlzdC4gRWFjaCBiYXNlIHN1YnNjcmlwdGlvbiBtdWx0aXBsaWVzIGFjcm9zcyBlYWNoIGFjdGl2ZSBFQ0ggZW50cnkgKCZhbXA7ZWNoPS4uLikuPC9zbWFsbD4KICAgICAgICAgICAgICAgICAgICA8L2Rpdj4KCiAgICAgICAgICAgICAgICAgICAgPGRpdiBjbGFzcz0iY2FyZCIgc3R5bGU9Im1hcmdpbi10b3A6IDIwcHg7IGJvcmRlci1jb2xvcjogdmFyKC0tYWNjZW50KTsgYmFja2dyb3VuZDogcmdiYSg1NiwgMTg5LCAyNDgsIDAuMDMpOyI+CiAgICAgICAgICAgICAgICAgICAgICAgIDxkaXYgY2xhc3M9ImNhcmQtdGl0bGUiIHN0eWxlPSJkaXNwbGF5OmZsZXg7IGp1c3RpZnktY29udGVudDpzcGFjZS1iZXR3ZWVuOyBhbGlnbi1pdGVtczpjZW50ZXI7Ij4KICAgICAgICAgICAgICAgICAgICAgICAgICAgIDxzcGFuPlByb3h5IElQIE1hbmFnZXI8L3NwYW4+CiAgICAgICAgICAgICAgICAgICAgICAgICAgICA8ZGl2IHN0eWxlPSJkaXNwbGF5OmZsZXg7IGFsaWduLWl0ZW1zOmNlbnRlcjsgZ2FwOjhweDsiPgogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDxsYWJlbCBzdHlsZT0iZGlzcGxheTpmbGV4OyBhbGlnbi1pdGVtczpjZW50ZXI7IGdhcDo2cHg7IGZvbnQtc2l6ZTowLjg1cmVtOyBmb250LXdlaWdodDpub3JtYWw7IGN1cnNvcjpwb2ludGVyOyI+CiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDxpbnB1dCB0eXBlPSJjaGVja2JveCIgaWQ9ImNmZy1lbmFibGUtcHJveHlpcCIgY2hlY2tlZCBvbmNoYW5nZT0idG9nZ2xlUHJveHlJcEVuYWJsZWQoKSI+CiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIEVuYWJsZSBQcm94eSBJUCBSb3V0aW5nCiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgPC9sYWJlbD4KICAgICAgICAgICAgICAgICAgICAgICAgICAgIDwvZGl2PgogICAgICAgICAgICAgICAgICAgICAgICA8L2Rpdj4KCiAgICAgICAgICAgICAgICAgICAgICAgIDxkaXYgc3R5bGU9Im1hcmdpbi1ib3R0b206IDEycHg7Ij4KICAgICAgICAgICAgICAgICAgICAgICAgICAgIDxsYWJlbCBjbGFzcz0iZm9ybS1sYWJlbCI+T3BlcmF0aW5nIE1vZGU8L2xhYmVsPgogICAgICAgICAgICAgICAgICAgICAgICAgICAgPGRpdiBzdHlsZT0iZGlzcGxheTpmbGV4OyBnYXA6MjBweDsgZm9udC1zaXplOjAuODhyZW07Ij4KICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA8bGFiZWwgc3R5bGU9ImRpc3BsYXk6ZmxleDsgYWxpZ24taXRlbXM6Y2VudGVyOyBnYXA6NnB4OyBjdXJzb3I6cG9pbnRlcjsiPgogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA8aW5wdXQgdHlwZT0icmFkaW8iIG5hbWU9ImNmZy1wcm94eWlwLW1vZGUiIGlkPSJwcm94eWlwLW1vZGUtYnVpbHRpbiIgdmFsdWU9ImJ1aWx0aW4iIGNoZWNrZWQgb25jaGFuZ2U9Im9uUHJveHlJcE1vZGVDaGFuZ2UoKSI+CiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIEF1dG9tYXRpYyAoQnVpbHQtaW4gUG9vbCkKICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA8L2xhYmVsPgogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDxsYWJlbCBzdHlsZT0iZGlzcGxheTpmbGV4OyBhbGlnbi1pdGVtczpjZW50ZXI7IGdhcDo2cHg7IGN1cnNvcjpwb2ludGVyOyI+CiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDxpbnB1dCB0eXBlPSJyYWRpbyIgbmFtZT0iY2ZnLXByb3h5aXAtbW9kZSIgaWQ9InByb3h5aXAtbW9kZS1jdXN0b20iIHZhbHVlPSJjdXN0b20iIG9uY2hhbmdlPSJvblByb3h5SXBNb2RlQ2hhbmdlKCkiPgogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBDdXN0b20gT3BlcmF0b3IgUG9vbAogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDwvbGFiZWw+CiAgICAgICAgICAgICAgICAgICAgICAgICAgICA8L2Rpdj4KICAgICAgICAgICAgICAgICAgICAgICAgPC9kaXY+CgogICAgICAgICAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzPSJmb3JtLWdyb3VwIj4KICAgICAgICAgICAgICAgICAgICAgICAgICAgIDxkaXYgc3R5bGU9ImRpc3BsYXk6IGZsZXg7IGp1c3RpZnktY29udGVudDogc3BhY2UtYmV0d2VlbjsgYWxpZ24taXRlbXM6IGNlbnRlcjsgbWFyZ2luLWJvdHRvbTogNnB4OyI+CiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgPGxhYmVsIGNsYXNzPSJmb3JtLWxhYmVsIiBzdHlsZT0ibWFyZ2luLWJvdHRvbTowOyIgaWQ9ImNmZy1wcm94eWlwLXBvb2wtbGFiZWwiPkFjdGl2ZSBQcm94eSBJUCBQb29sICg0IEJ1aWx0LWluIEVuZHBvaW50cyk8L2xhYmVsPgogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDxkaXYgc3R5bGU9ImRpc3BsYXk6ZmxleDsgZ2FwOjZweDsiPgogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA8YnV0dG9uIHR5cGU9ImJ1dHRvbiIgY2xhc3M9ImJ0biBidG4tc20iIG9uY2xpY2s9InByb2JlRW50aXJlUHJveHlQb29sKCkiPkNoZWNrIExhdGVuY3k8L2J1dHRvbj4KICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgPGJ1dHRvbiB0eXBlPSJidXR0b24iIGNsYXNzPSJidG4gYnRuLXNtIGJ0bi1zZWNvbmRhcnkiIGlkPSJidG4tYWRkLXByb3h5aXAiIHN0eWxlPSJkaXNwbGF5Om5vbmU7IiBvbmNsaWNrPSJhZGRQcm94eUlwUHJvbXB0KCkiPisgQWRkIEVudHJ5PC9idXR0b24+CiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDxidXR0b24gdHlwZT0iYnV0dG9uIiBjbGFzcz0iYnRuIGJ0bi1zbSBidG4tc2Vjb25kYXJ5IiBvbmNsaWNrPSJyZXN0b3JlRGVmYXVsdFByb3h5SXBQb29sKCkiPlJlc3RvcmUgRGVmYXVsdHM8L2J1dHRvbj4KICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA8L2Rpdj4KICAgICAgICAgICAgICAgICAgICAgICAgICAgIDwvZGl2PgogICAgICAgICAgICAgICAgICAgICAgICAgICAgPHRleHRhcmVhIGlkPSJjZmctcHJveHlpcC1wb29sIiBjbGFzcz0idGV4dGFyZWEiIHJvd3M9IjQiIHBsYWNlaG9sZGVyPSJ3b3JrZXJzLmNsb3VkZmxhcmUuY3lvdSYjMTA7cHJveHlpcC5meHhrLmRlZHluLmlvIiBzdHlsZT0iZm9udC1mYW1pbHk6bW9ub3NwYWNlOyBmb250LXNpemU6MC44MnJlbTsiPjwvdGV4dGFyZWE+CiAgICAgICAgICAgICAgICAgICAgICAgICAgICA8ZGl2IGlkPSJwcm94eWlwLXBvb2wtc3RhdHVzIiBzdHlsZT0ibWFyZ2luLXRvcDo2cHg7IGZvbnQtc2l6ZTowLjc4cmVtOyBjb2xvcjp2YXIoLS10ZXh0LW11dGVkKTsiPgogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFN0YXR1czogQXV0b21hdGljIG1vZGUgYWN0aXZlLiBVc2luZyBhcHByb3ZlZCBjbGVhbi1yb29tIGRlZmF1bHQgcG9vbC4KICAgICAgICAgICAgICAgICAgICAgICAgICAgIDwvZGl2PgogICAgICAgICAgICAgICAgICAgICAgICA8L2Rpdj4KCiAgICAgICAgICAgICAgICAgICAgICAgIDxkaXYgaWQ9InByb3h5aXAtcHJvYmUtcmVzdWx0cyIgc3R5bGU9ImRpc3BsYXk6bm9uZTsgbWFyZ2luLXRvcDoxMnB4OyBiYWNrZ3JvdW5kOnZhcigtLWJnLWlucHV0KTsgcGFkZGluZzoxMHB4OyBib3JkZXItcmFkaXVzOnZhcigtLXJhZGl1cy1tZCk7IGJvcmRlcjoxcHggc29saWQgdmFyKC0tYm9yZGVyLWNvbG9yKTsgZm9udC1zaXplOjAuODJyZW07Ij4KICAgICAgICAgICAgICAgICAgICAgICAgICAgIDxkaXYgc3R5bGU9ImZvbnQtd2VpZ2h0OjYwMDsgbWFyZ2luLWJvdHRvbTo2cHg7IGNvbG9yOnZhcigtLXRleHQtbWFpbik7Ij5Qb29sIENvbm5lY3Rpdml0eSAmYW1wOyBMYXRlbmN5IFJlc3VsdHM6PC9kaXY+CiAgICAgICAgICAgICAgICAgICAgICAgICAgICA8ZGl2IGlkPSJwcm94eWlwLXByb2JlLWxpc3QiIHN0eWxlPSJkaXNwbGF5OmZsZXg7IGZsZXgtZGlyZWN0aW9uOmNvbHVtbjsgZ2FwOjRweDsiPjwvZGl2PgogICAgICAgICAgICAgICAgICAgICAgICA8L2Rpdj4KICAgICAgICAgICAgICAgICAgICA8L2Rpdj4KCiAgICAgICAgICAgICAgICAgICAgPGRpdiBzdHlsZT0iZGlzcGxheTogZmxleDsgZ2FwOiAxMnB4OyBtYXJnaW4tdG9wOiAyMHB4OyI+CiAgICAgICAgICAgICAgICAgICAgICAgIDxidXR0b24gdHlwZT0ic3VibWl0IiBjbGFzcz0iYnRuIj5TYXZlIENvbmZpZ3VyYXRpb248L2J1dHRvbj4KICAgICAgICAgICAgICAgICAgICAgICAgPGJ1dHRvbiB0eXBlPSJidXR0b24iIGNsYXNzPSJidG4gYnRuLXNlY29uZGFyeSIgb25jbGljaz0iZXhwb3J0U2hhcmVkU2V0dGluZ3MoKSI+RXhwb3J0IFNldHRpbmdzPC9idXR0b24+CiAgICAgICAgICAgICAgICAgICAgPC9kaXY+CiAgICAgICAgICAgICAgICA8L2Zvcm0+CiAgICAgICAgICAgIDwvZGl2PgogICAgICAgIDwvc2VjdGlvbj4KCiAgICAgICAgPCEtLSBUQUIgNDogRElBR05PU1RJQ1MgLS0+CiAgICAgICAgPHNlY3Rpb24gaWQ9InRhYi1kaWFnbm9zdGljcyIgY2xhc3M9InRhYi1jb250ZW50IGhpZGRlbiI+CiAgICAgICAgICAgIDxkaXYgY2xhc3M9ImNhcmQiPgogICAgICAgICAgICAgICAgPGRpdiBjbGFzcz0iY2FyZC10aXRsZSI+VENQIFByb3h5LUlQIEhlYWx0aCAmIExhdGVuY3kgUHJvYmU8L2Rpdj4KICAgICAgICAgICAgICAgIDxkaXYgc3R5bGU9ImRpc3BsYXk6IGZsZXg7IGdhcDogOHB4OyBtYXJnaW4tYm90dG9tOiAxNnB4OyI+CiAgICAgICAgICAgICAgICAgICAgPGlucHV0IHR5cGU9InRleHQiIGlkPSJkaWFnLXRhcmdldC1pcCIgY2xhc3M9ImlucHV0IiBwbGFjZWhvbGRlcj0iVGFyZ2V0IFByb3h5IElQIG9yIERvbWFpbiAoZS5nLiAxMDQuMTYuMS4xKSIgc3R5bGU9ImZsZXg6MTsiPgogICAgICAgICAgICAgICAgICAgIDxidXR0b24gY2xhc3M9ImJ0biIgb25jbGljaz0icnVuUHJveHlJcFByb2JlKCkiPlRlc3QgRW5kcG9pbnQ8L2J1dHRvbj4KICAgICAgICAgICAgICAgIDwvZGl2PgogICAgICAgICAgICAgICAgPGRpdiBpZD0iZGlhZy1yZXN1bHRzIiBjbGFzcz0iY29uc29sZS1sb2dzIj5Bd2FpdGluZyB0ZXN0IGV4ZWN1dGlvbi4uLjwvZGl2PgogICAgICAgICAgICA8L2Rpdj4KICAgICAgICA8L3NlY3Rpb24+CgogICAgICAgIDwhLS0gVEFCIDU6IEFVRElUIExPR1MgLS0+CiAgICAgICAgPHNlY3Rpb24gaWQ9InRhYi1sb2dzIiBjbGFzcz0idGFiLWNvbnRlbnQgaGlkZGVuIj4KICAgICAgICAgICAgPGRpdiBjbGFzcz0iY2FyZCI+CiAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzPSJjYXJkLXRpdGxlIj4KICAgICAgICAgICAgICAgICAgICA8c3Bhbj5SZWNlbnQgQWN0aXZpdHkgTG9nczwvc3Bhbj4KICAgICAgICAgICAgICAgICAgICA8YnV0dG9uIGNsYXNzPSJidG4gYnRuLXNtIGJ0bi1kYW5nZXIiIG9uY2xpY2s9ImNsZWFyQXVkaXRMb2dzKCkiPkNsZWFyIExvZ3M8L2J1dHRvbj4KICAgICAgICAgICAgICAgIDwvZGl2PgogICAgICAgICAgICAgICAgPGRpdiBpZD0iYXVkaXQtbG9ncy1jb25zb2xlIiBjbGFzcz0iY29uc29sZS1sb2dzIj5Mb2FkaW5nIGF1ZGl0IHJlY29yZHMuLi48L2Rpdj4KICAgICAgICAgICAgPC9kaXY+CiAgICAgICAgPC9zZWN0aW9uPgoKICAgIDwvbWFpbj4KCiAgICA8IS0tIE1vZGFsOiBBZGQgLyBFZGl0IFN1YnNjcmliZXIgLS0+CiAgICA8ZGl2IGlkPSJtb2RhbC11c2VyIiBjbGFzcz0ibW9kYWwtb3ZlcmxheSI+CiAgICAgICAgPGRpdiBjbGFzcz0ibW9kYWwiPgogICAgICAgICAgICA8aDMgaWQ9Im1vZGFsLXVzZXItdGl0bGUiIHN0eWxlPSJtYXJnaW4tYm90dG9tOiAxNnB4OyI+QWRkIE5ldyBTdWJzY3JpYmVyPC9oMz4KICAgICAgICAgICAgPGZvcm0gaWQ9ImZvcm0tdXNlciI+CiAgICAgICAgICAgICAgICA8aW5wdXQgdHlwZT0iaGlkZGVuIiBpZD0idXNlci1lZGl0LWlkIj4KICAgICAgICAgICAgICAgIDxkaXYgY2xhc3M9ImZvcm0tZ3JvdXAiPgogICAgICAgICAgICAgICAgICAgIDxsYWJlbCBjbGFzcz0iZm9ybS1sYWJlbCI+U3Vic2NyaWJlciBOYW1lPC9sYWJlbD4KICAgICAgICAgICAgICAgICAgICA8aW5wdXQgdHlwZT0idGV4dCIgaWQ9ImZvcm0tdXNlci1uYW1lIiBjbGFzcz0iaW5wdXQiIHBsYWNlaG9sZGVyPSJlLmcuIEFsaWNlIiByZXF1aXJlZD4KICAgICAgICAgICAgICAgIDwvZGl2PgogICAgICAgICAgICAgICAgPGRpdiBjbGFzcz0iZm9ybS1ncm91cCI+CiAgICAgICAgICAgICAgICAgICAgPGxhYmVsIGNsYXNzPSJmb3JtLWxhYmVsIj5Ub3RhbCBCYW5kd2lkdGggTGltaXQgKEdCLCAwID0gVW5saW1pdGVkKTwvbGFiZWw+CiAgICAgICAgICAgICAgICAgICAgPGlucHV0IHR5cGU9Im51bWJlciIgaWQ9ImZvcm0tdXNlci1saW1pdC1nYiIgY2xhc3M9ImlucHV0IiB2YWx1ZT0iMCIgbWluPSIwIiBzdGVwPSIwLjUiPgogICAgICAgICAgICAgICAgPC9kaXY+CiAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzPSJmb3JtLWdyb3VwIj4KICAgICAgICAgICAgICAgICAgICA8bGFiZWwgY2xhc3M9ImZvcm0tbGFiZWwiPkV4cGlyYXRpb24gRGF0ZSAoWVlZWS1NTS1ERCwgYmxhbmsgPSBObyBFeHBpcnkpPC9sYWJlbD4KICAgICAgICAgICAgICAgICAgICA8aW5wdXQgdHlwZT0iZGF0ZSIgaWQ9ImZvcm0tdXNlci1leHBpcnkiIGNsYXNzPSJpbnB1dCI+CiAgICAgICAgICAgICAgICA8L2Rpdj4KICAgICAgICAgICAgICAgIDxkaXYgY2xhc3M9ImZvcm0tZ3JvdXAiPgogICAgICAgICAgICAgICAgICAgIDxsYWJlbCBjbGFzcz0iZm9ybS1sYWJlbCI+Q2xlYW4gQ0ROIElQcyAob25lIHBlciBsaW5lLCBkZWZhdWx0OiB3d3cuc3BlZWR0ZXN0Lm5ldCk8L2xhYmVsPgogICAgICAgICAgICAgICAgICAgIDx0ZXh0YXJlYSBpZD0iZm9ybS11c2VyLWNsZWFuLWlwIiBjbGFzcz0idGV4dGFyZWEiIHJvd3M9IjIiIHBsYWNlaG9sZGVyPSJ3d3cuc3BlZWR0ZXN0Lm5ldCIgb25pbnB1dD0idXBkYXRlU3Vic2NyaWJlckNvbmZpZ1ByZXZpZXcoKSI+PC90ZXh0YXJlYT4KICAgICAgICAgICAgICAgIDwvZGl2PgogICAgICAgICAgICAgICAgPGRpdiBjbGFzcz0iZm9ybS1ncm91cCI+CiAgICAgICAgICAgICAgICAgICAgPGxhYmVsIGNsYXNzPSJmb3JtLWxhYmVsIj5TdWJzY3JpcHRpb24gRmluYWwgTWFzayAoI2ZpbmFsTWFzayBmcmFnbWVudCwgb3B0aW9uYWwpPC9sYWJlbD4KICAgICAgICAgICAgICAgICAgICA8aW5wdXQgdHlwZT0idGV4dCIgaWQ9ImZvcm0tdXNlci1maW5hbC1tYXNrIiBjbGFzcz0iaW5wdXQiIHBsYWNlaG9sZGVyPSJMZWF2ZSBlbXB0eSB0byBpbmhlcml0IGdsb2JhbCBzZXR0aW5nIj4KICAgICAgICAgICAgICAgIDwvZGl2PgogICAgICAgICAgICAgICAgPGRpdiBjbGFzcz0iZm9ybS1ncm91cCI+CiAgICAgICAgICAgICAgICAgICAgPGxhYmVsIGNsYXNzPSJmb3JtLWxhYmVsIj5BTFBOIE92ZXJyaWRlIChlLmcuIGh0dHAvMS4xIG9yIGgyLGh0dHAvMS4xLCBvcHRpb25hbCk8L2xhYmVsPgogICAgICAgICAgICAgICAgICAgIDxpbnB1dCB0eXBlPSJ0ZXh0IiBpZD0iZm9ybS11c2VyLWFscG4iIGNsYXNzPSJpbnB1dCIgcGxhY2Vob2xkZXI9IkxlYXZlIGVtcHR5IHRvIGluaGVyaXQgZ2xvYmFsIHNldHRpbmciPgogICAgICAgICAgICAgICAgPC9kaXY+CiAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzPSJmb3JtLWdyb3VwIj4KICAgICAgICAgICAgICAgICAgICA8bGFiZWwgY2xhc3M9ImZvcm0tbGFiZWwiPkVDSCBDb25maWd1cmF0aW9uPC9sYWJlbD4KICAgICAgICAgICAgICAgICAgICA8ZGl2IHN0eWxlPSJkaXNwbGF5OmZsZXg7IGdhcDoxNnB4OyBtYXJnaW4tYm90dG9tOjhweDsgZm9udC1zaXplOjAuODVyZW07Ij4KICAgICAgICAgICAgICAgICAgICAgICAgPGxhYmVsIHN0eWxlPSJkaXNwbGF5OmZsZXg7IGFsaWduLWl0ZW1zOmNlbnRlcjsgZ2FwOjZweDsgY3Vyc29yOnBvaW50ZXI7Ij4KICAgICAgICAgICAgICAgICAgICAgICAgICAgIDxpbnB1dCB0eXBlPSJyYWRpbyIgbmFtZT0iZm9ybS11c2VyLWVjaC1tb2RlIiBpZD0iZWNoLW1vZGUtaW5oZXJpdCIgdmFsdWU9ImluaGVyaXQiIGNoZWNrZWQgb25jaGFuZ2U9InRvZ2dsZVVzZXJFY2hNb2RlKCkiPgogICAgICAgICAgICAgICAgICAgICAgICAgICAgSW5oZXJpdCBHbG9iYWwgRUNIICg8c3BhbiBpZD0idXNlci1lY2gtaW5oZXJpdC1jb3VudCI+NjA8L3NwYW4+KQogICAgICAgICAgICAgICAgICAgICAgICA8L2xhYmVsPgogICAgICAgICAgICAgICAgICAgICAgICA8bGFiZWwgc3R5bGU9ImRpc3BsYXk6ZmxleDsgYWxpZ24taXRlbXM6Y2VudGVyOyBnYXA6NnB4OyBjdXJzb3I6cG9pbnRlcjsiPgogICAgICAgICAgICAgICAgICAgICAgICAgICAgPGlucHV0IHR5cGU9InJhZGlvIiBuYW1lPSJmb3JtLXVzZXItZWNoLW1vZGUiIGlkPSJlY2gtbW9kZS1jdXN0b20iIHZhbHVlPSJjdXN0b20iIG9uY2hhbmdlPSJ0b2dnbGVVc2VyRWNoTW9kZSgpIj4KICAgICAgICAgICAgICAgICAgICAgICAgICAgIEN1c3RvbSBFQ0ggTGlzdAogICAgICAgICAgICAgICAgICAgICAgICA8L2xhYmVsPgogICAgICAgICAgICAgICAgICAgIDwvZGl2PgogICAgICAgICAgICAgICAgICAgIDxkaXYgaWQ9ImZvcm0tdXNlci1lY2gtY3VzdG9tLXdyYXAiIGNsYXNzPSJoaWRkZW4iPgogICAgICAgICAgICAgICAgICAgICAgICA8ZGl2IHN0eWxlPSJkaXNwbGF5OiBmbGV4OyBqdXN0aWZ5LWNvbnRlbnQ6IHNwYWNlLWJldHdlZW47IGFsaWduLWl0ZW1zOiBjZW50ZXI7IG1hcmdpbi1ib3R0b206IDRweDsiPgogICAgICAgICAgICAgICAgICAgICAgICAgICAgPHNwYW4gc3R5bGU9ImZvbnQtc2l6ZTowLjc1cmVtOyBjb2xvcjp2YXIoLS10ZXh0LW11dGVkKTsiPk9uZSBFQ0ggY29uZmlnIHBlciBsaW5lOjwvc3Bhbj4KICAgICAgICAgICAgICAgICAgICAgICAgICAgIDxkaXYgc3R5bGU9ImRpc3BsYXk6ZmxleDsgZ2FwOjRweDsiPgogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDxidXR0b24gdHlwZT0iYnV0dG9uIiBjbGFzcz0iYnRuIGJ0bi1zbSBidG4tc2Vjb25kYXJ5IiBzdHlsZT0icGFkZGluZzoycHggOHB4OyBmb250LXNpemU6MC43NXJlbTsiIG9uY2xpY2s9ImNvcHlHbG9iYWxFY2hUb1VzZXIoKSI+Q29weSBHbG9iYWw8L2J1dHRvbj4KICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA8YnV0dG9uIHR5cGU9ImJ1dHRvbiIgY2xhc3M9ImJ0biBidG4tc20gYnRuLXNlY29uZGFyeSIgc3R5bGU9InBhZGRpbmc6MnB4IDhweDsgZm9udC1zaXplOjAuNzVyZW07IiBvbmNsaWNrPSJyZXNldFVzZXJFY2hEZWZhdWx0cygpIj5SZXNldCBEZWZhdWx0czwvYnV0dG9uPgogICAgICAgICAgICAgICAgICAgICAgICAgICAgPC9kaXY+CiAgICAgICAgICAgICAgICAgICAgICAgIDwvZGl2PgogICAgICAgICAgICAgICAgICAgICAgICA8dGV4dGFyZWEgaWQ9ImZvcm0tdXNlci1lY2gtbGlzdCIgY2xhc3M9InRleHRhcmVhIiByb3dzPSI0IiBwbGFjZWhvbGRlcj0iZG9tYWluK3VkcDovL2lwIChvbmUgcGVyIGxpbmUpIiBvbmlucHV0PSJ1cGRhdGVTdWJzY3JpYmVyQ29uZmlnUHJldmlldygpIj48L3RleHRhcmVhPgogICAgICAgICAgICAgICAgICAgIDwvZGl2PgogICAgICAgICAgICAgICAgPC9kaXY+CiAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzPSJmb3JtLWdyb3VwIiBzdHlsZT0ibWFyZ2luLXRvcDoxNHB4OyI+CiAgICAgICAgICAgICAgICAgICAgPGRpdiBzdHlsZT0iZGlzcGxheTogZmxleDsganVzdGlmeS1jb250ZW50OiBzcGFjZS1iZXR3ZWVuOyBhbGlnbi1pdGVtczogY2VudGVyOyBtYXJnaW4tYm90dG9tOiA2cHg7Ij4KICAgICAgICAgICAgICAgICAgICAgICAgPGxhYmVsIGNsYXNzPSJmb3JtLWxhYmVsIiBzdHlsZT0ibWFyZ2luLWJvdHRvbTowOyI+UHJveHkgSVAgQ29uZmlndXJhdGlvbjwvbGFiZWw+CiAgICAgICAgICAgICAgICAgICAgICAgIDxkaXYgc3R5bGU9ImRpc3BsYXk6ZmxleDsgYWxpZ24taXRlbXM6Y2VudGVyOyBnYXA6OHB4OyI+CiAgICAgICAgICAgICAgICAgICAgICAgICAgICA8bGFiZWwgc3R5bGU9ImRpc3BsYXk6ZmxleDsgYWxpZ24taXRlbXM6Y2VudGVyOyBnYXA6NXB4OyBmb250LXNpemU6MC44cmVtOyBmb250LXdlaWdodDpub3JtYWw7IGN1cnNvcjpwb2ludGVyOyI+CiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgPGlucHV0IHR5cGU9ImNoZWNrYm94IiBpZD0iZm9ybS11c2VyLWVuYWJsZS1wcm94eWlwIiBjaGVja2VkIG9uY2hhbmdlPSJ1cGRhdGVVc2VyUHJveHlJcE5vdGljZSgpIj4KICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA8c3Bhbj5FbmFibGUgUHJveHkgSVA8L3NwYW4+CiAgICAgICAgICAgICAgICAgICAgICAgICAgICA8L2xhYmVsPgogICAgICAgICAgICAgICAgICAgICAgICAgICAgPGJ1dHRvbiB0eXBlPSJidXR0b24iIGNsYXNzPSJidG4gYnRuLXNtIGJ0bi1zZWNvbmRhcnkiIHN0eWxlPSJwYWRkaW5nOjJweCA4cHg7IGZvbnQtc2l6ZTowLjc1cmVtOyIgb25jbGljaz0iY2xlYXJVc2VyUHJveHlJcE92ZXJyaWRlKCkiPkNsZWFyIChSZXN0b3JlIERlZmF1bHQpPC9idXR0b24+CiAgICAgICAgICAgICAgICAgICAgICAgIDwvZGl2PgogICAgICAgICAgICAgICAgICAgIDwvZGl2PgogICAgICAgICAgICAgICAgICAgIDx0ZXh0YXJlYSBpZD0iZm9ybS11c2VyLXByb3h5LWlwIiBjbGFzcz0idGV4dGFyZWEiIHJvd3M9IjIiIHBsYWNlaG9sZGVyPSJlLmcuIDEuMi4zLjQ6NDQzJiMxMDtleGFtcGxlLmNvbTo0NDMmIzEwO1syNjA2OjQ3MDA6OjFdOjQ0MyIgb25pbnB1dD0idXBkYXRlVXNlclByb3h5SXBOb3RpY2UoKSI+PC90ZXh0YXJlYT4KICAgICAgICAgICAgICAgICAgICA8ZGl2IGlkPSJmb3JtLXVzZXItcHJveHktaXAtbm90aWNlIiBzdHlsZT0ibWFyZ2luLXRvcDo2cHg7IGZvbnQtc2l6ZTowLjc4cmVtOyBjb2xvcjp2YXIoLS10ZXh0LW11dGVkKTsgZGlzcGxheTpmbGV4OyBhbGlnbi1pdGVtczpjZW50ZXI7IGdhcDo2cHg7Ij4KICAgICAgICAgICAgICAgICAgICAgICAgPHNwYW4gaWQ9InVzZXItcGlwLW5vdGljZS1pY29uIj7ihLnvuI88L3NwYW4+CiAgICAgICAgICAgICAgICAgICAgICAgIDxzcGFuIGlkPSJ1c2VyLXBpcC1ub3RpY2UtdGV4dCI+SW5oZXJpdGluZyBhY3RpdmUgUHJveHkgSVAgcG9vbCAoQXV0b21hdGljL0N1c3RvbSkuPC9zcGFuPgogICAgICAgICAgICAgICAgICAgIDwvZGl2PgogICAgICAgICAgICAgICAgICAgIDxzbWFsbCBzdHlsZT0iY29sb3I6dmFyKC0tdGV4dC1tdXRlZCk7IGZvbnQtc2l6ZTowLjcycmVtOyBkaXNwbGF5OmJsb2NrOyBtYXJnaW4tdG9wOjRweDsiPgogICAgICAgICAgICAgICAgICAgICAgICBFeGFtcGxlczogPGNvZGU+MS4yLjMuNDo0NDM8L2NvZGU+LCA8Y29kZT5leGFtcGxlLmNvbTo0NDM8L2NvZGU+LCA8Y29kZT5bMjYwNjo0NzAwOjoxXTo0NDM8L2NvZGU+LiBNdWx0aWxpbmUgb3IgY29tbWEtc2VwYXJhdGVkLgogICAgICAgICAgICAgICAgICAgIDwvc21hbGw+CiAgICAgICAgICAgICAgICA8L2Rpdj4KICAgICAgICAgICAgICAgIDxkaXYgaWQ9ImZvcm0tdXNlci1jYWxjLXByZXZpZXciIHN0eWxlPSJiYWNrZ3JvdW5kOnZhcigtLWJnLWlucHV0KTsgcGFkZGluZzoxMHB4OyBib3JkZXItcmFkaXVzOnZhcigtLXJhZGl1cy1tZCk7IGJvcmRlcjoxcHggc29saWQgdmFyKC0tYm9yZGVyLWNvbG9yKTsgbWFyZ2luLXRvcDoxMnB4OyBmb250LXNpemU6MC44MnJlbTsgY29sb3I6dmFyKC0tdGV4dC1tYWluKTsiPgogICAgICAgICAgICAgICAgICAgIDxzcGFuIHN0eWxlPSJmb250LXdlaWdodDo2MDA7IGNvbG9yOnZhcigtLWFjY2VudCk7Ij5Db25maWcgTXVsdGlwbGllcjo8L3NwYW4+CiAgICAgICAgICAgICAgICAgICAgPHNwYW4gaWQ9ImZvcm0tdXNlci1jYWxjLXRleHQiPjIgYmFzZSBlbmRwb2ludHMgw5cgNjAgRUNIIGNvbmZpZ3MgPSAxMjAgdG90YWwgY29uZmlnczwvc3Bhbj4KICAgICAgICAgICAgICAgIDwvZGl2PgogICAgICAgICAgICAgICAgPGRpdiBzdHlsZT0iZGlzcGxheTogZmxleDsganVzdGlmeS1jb250ZW50OiBmbGV4LWVuZDsgZ2FwOiA4cHg7IG1hcmdpbi10b3A6IDIwcHg7Ij4KICAgICAgICAgICAgICAgICAgICA8YnV0dG9uIHR5cGU9ImJ1dHRvbiIgY2xhc3M9ImJ0biBidG4tc2Vjb25kYXJ5IiBvbmNsaWNrPSJjbG9zZVVzZXJNb2RhbCgpIj5DYW5jZWw8L2J1dHRvbj4KICAgICAgICAgICAgICAgICAgICA8YnV0dG9uIHR5cGU9InN1Ym1pdCIgY2xhc3M9ImJ0biI+U2F2ZSBTdWJzY3JpYmVyPC9idXR0b24+CiAgICAgICAgICAgICAgICA8L2Rpdj4KICAgICAgICAgICAgPC9mb3JtPgogICAgICAgIDwvZGl2PgogICAgPC9kaXY+CgogICAgPCEtLSBNb2RhbDogU3Vic2NyaXB0aW9uIExpbmtzIEV4cG9ydCAtLT4KICAgIDxkaXYgaWQ9Im1vZGFsLWxpbmtzIiBjbGFzcz0ibW9kYWwtb3ZlcmxheSI+CiAgICAgICAgPGRpdiBjbGFzcz0ibW9kYWwiPgogICAgICAgICAgICA8aDMgc3R5bGU9Im1hcmdpbi1ib3R0b206IDE0cHg7Ij5TdWJzY3JpYmVyIFN1YnNjcmlwdGlvbiBMaW5rczwvaDM+CiAgICAgICAgICAgIDxkaXYgaWQ9Im1vZGFsLWxpbmtzLWNvbnRlbnQiIHN0eWxlPSJkaXNwbGF5OiBmbGV4OyBmbGV4LWRpcmVjdGlvbjogY29sdW1uOyBnYXA6IDEycHg7IGZvbnQtc2l6ZTogMC44NXJlbTsiPjwvZGl2PgogICAgICAgICAgICA8ZGl2IHN0eWxlPSJkaXNwbGF5OiBmbGV4OyBqdXN0aWZ5LWNvbnRlbnQ6IGZsZXgtZW5kOyBtYXJnaW4tdG9wOiAyMHB4OyI+CiAgICAgICAgICAgICAgICA8YnV0dG9uIHR5cGU9ImJ1dHRvbiIgY2xhc3M9ImJ0biBidG4tc2Vjb25kYXJ5IiBvbmNsaWNrPSJjbG9zZUxpbmtzTW9kYWwoKSI+Q2xvc2U8L2J1dHRvbj4KICAgICAgICAgICAgPC9kaXY+CiAgICAgICAgPC9kaXY+CiAgICA8L2Rpdj4KCiAgICA8IS0tIENsaWVudC1TaWRlIEFwcGxpY2F0aW9uIERyaXZlciAtLT4KICAgIDxzY3JpcHQ+CiAgICAgICAgY29uc3Qgc3RhdGUgPSB7CiAgICAgICAgICAgIG1hc3RlcktleTogJycsCiAgICAgICAgICAgIGNvbmZpZzoge30sCiAgICAgICAgICAgIHVzZXJzOiBbXSwKICAgICAgICAgICAgYXBpUm91dGU6IChmdW5jdGlvbigpIHsKICAgICAgICAgICAgICAgIGxldCByID0gJ19fQVBJX1JPVVRFX18nOwogICAgICAgICAgICAgICAgaWYgKCFyIHx8IHIuaW5jbHVkZXMoJ0FQSV9ST1VURScpKSB7CiAgICAgICAgICAgICAgICAgICAgY29uc3QgcGFydHMgPSB3aW5kb3cubG9jYXRpb24ucGF0aG5hbWUuc3BsaXQoJy8nKS5maWx0ZXIoQm9vbGVhbik7CiAgICAgICAgICAgICAgICAgICAgciA9IHBhcnRzWzBdIHx8ICdzeW5jJzsKICAgICAgICAgICAgICAgIH0KICAgICAgICAgICAgICAgIHJldHVybiByLnJlcGxhY2UoL1teYS16QS1aMC05Xy1dL2csICcnKSB8fCAnc3luYyc7CiAgICAgICAgICAgIH0pKCksCiAgICAgICAgICAgIHN5c1VzYWdlOiB7fSwKICAgICAgICB9OwoKICAgICAgICBjb25zdCBERUZBVUxUX0VDSF9DT05GSUdTID0gWwogICAgICAgICAgICAiY2xvdWRmbGFyZS1lY2guY29tK3VkcDovLzEuMS4xLjEiLAogICAgICAgICAgICAiZ2VlZG8uY29tK3VkcDovLzEuMS4xLjEiLAogICAgICAgICAgICAidHJ1c3RlZHN0YWNrLmNvbSt1ZHA6Ly8xLjEuMS4xIiwKICAgICAgICAgICAgImRpc2NvcmRhcHAuY29tK3VkcDovLzEuMS4xLjEiLAogICAgICAgICAgICAiYXkuZGVsaXZlcnkrdWRwOi8vMS4xLjEuMSIsCiAgICAgICAgICAgICJpZmNvbmZpZy5pbyt1ZHA6Ly8xLjEuMS4xIiwKICAgICAgICAgICAgIm15Z2FydS5jb20rdWRwOi8vMS4xLjEuMSIsCiAgICAgICAgICAgICJtZ2FydS5kZXYrdWRwOi8vMS4xLjEuMSIsCiAgICAgICAgICAgICJhZHRhcmdldC5jb20udHIrdWRwOi8vMS4xLjEuMSIsCiAgICAgICAgICAgICJydGJzeXN0ZW0uY29tK3VkcDovLzEuMS4xLjEiLAogICAgICAgICAgICAicHJlc3RpdGkuaXQrdWRwOi8vMS4xLjEuMSIsCiAgICAgICAgICAgICJhbGwuYml6K3VkcDovLzEuMS4xLjEiLAogICAgICAgICAgICAiY2RuZm9udHMuY29tK3VkcDovLzEuMS4xLjEiLAogICAgICAgICAgICAieGxpdnJkci5jb20rdWRwOi8vMS4xLjEuMSIsCiAgICAgICAgICAgICJhc3NpY3VyYXppb25pb25saW5lLml0K3VkcDovLzEuMS4xLjEiLAogICAgICAgICAgICAidm9pcHN0dW50LmNvbSt1ZHA6Ly8xLjEuMS4xIiwKICAgICAgICAgICAgInJhd2dpdC5jb20rdWRwOi8vMS4xLjEuMSIsCiAgICAgICAgICAgICJsb3VkZWNoby5haSt1ZHA6Ly8xLjEuMS4xIiwKICAgICAgICAgICAgInZvaXBidXN0ZXIuY29tK3VkcDovLzEuMS4xLjEiLAogICAgICAgICAgICAiYWRzdGVyLnRlY2grdWRwOi8vMS4xLjEuMSIsCiAgICAgICAgICAgICJjbG91ZGZsYXJlLWVjaC5jb20rdWRwOi8vOC44LjguOCIsCiAgICAgICAgICAgICJnZWVkby5jb20rdWRwOi8vOC44LjguOCIsCiAgICAgICAgICAgICJ0cnVzdGVkc3RhY2suY29tK3VkcDovLzguOC44LjgiLAogICAgICAgICAgICAiZGlzY29yZGFwcC5jb20rdWRwOi8vOC44LjguOCIsCiAgICAgICAgICAgICJheS5kZWxpdmVyeSt1ZHA6Ly84LjguOC44IiwKICAgICAgICAgICAgImlmY29uZmlnLmlvK3VkcDovLzguOC44LjgiLAogICAgICAgICAgICAibXlnYXJ1LmNvbSt1ZHA6Ly84LjguOC44IiwKICAgICAgICAgICAgIm1nYXJ1LmRldit1ZHA6Ly84LjguOC44IiwKICAgICAgICAgICAgImFkdGFyZ2V0LmNvbS50cit1ZHA6Ly84LjguOC44IiwKICAgICAgICAgICAgInJ0YnN5c3RlbS5jb20rdWRwOi8vOC44LjguOCIsCiAgICAgICAgICAgICJwcmVzdGl0aS5pdCt1ZHA6Ly84LjguOC44IiwKICAgICAgICAgICAgImFsbC5iaXordWRwOi8vOC44LjguOCIsCiAgICAgICAgICAgICJjZG5mb250cy5jb20rdWRwOi8vOC44LjguOCIsCiAgICAgICAgICAgICJ4bGl2cmRyLmNvbSt1ZHA6Ly84LjguOC44IiwKICAgICAgICAgICAgImFzc2ljdXJhemlvbmlvbmxpbmUuaXQrdWRwOi8vOC44LjguOCIsCiAgICAgICAgICAgICJ2b2lwc3R1bnQuY29tK3VkcDovLzguOC44LjgiLAogICAgICAgICAgICAicmF3Z2l0LmNvbSt1ZHA6Ly84LjguOC44IiwKICAgICAgICAgICAgImxvdWRlY2hvLmFpK3VkcDovLzguOC44LjgiLAogICAgICAgICAgICAidm9pcGJ1c3Rlci5jb20rdWRwOi8vOC44LjguOCIsCiAgICAgICAgICAgICJhZHN0ZXIudGVjaCt1ZHA6Ly84LjguOC44IiwKICAgICAgICAgICAgImNsb3VkZmxhcmUtZWNoLmNvbSt1ZHA6Ly84LjguNC40IiwKICAgICAgICAgICAgImdlZWRvLmNvbSt1ZHA6Ly84LjguNC40IiwKICAgICAgICAgICAgInRydXN0ZWRzdGFjay5jb20rdWRwOi8vOC44LjQuNCIsCiAgICAgICAgICAgICJkaXNjb3JkYXBwLmNvbSt1ZHA6Ly84LjguNC40IiwKICAgICAgICAgICAgImF5LmRlbGl2ZXJ5K3VkcDovLzguOC40LjQiLAogICAgICAgICAgICAiaWZjb25maWcuaW8rdWRwOi8vOC44LjQuNCIsCiAgICAgICAgICAgICJteWdhcnUuY29tK3VkcDovLzguOC40LjQiLAogICAgICAgICAgICAibWdhcnUuZGV2K3VkcDovLzguOC40LjQiLAogICAgICAgICAgICAiYWR0YXJnZXQuY29tLnRyK3VkcDovLzguOC40LjQiLAogICAgICAgICAgICAicnRic3lzdGVtLmNvbSt1ZHA6Ly84LjguNC40IiwKICAgICAgICAgICAgInByZXN0aXRpLml0K3VkcDovLzguOC40LjQiLAogICAgICAgICAgICAiYWxsLmJpeit1ZHA6Ly84LjguNC40IiwKICAgICAgICAgICAgImNkbmZvbnRzLmNvbSt1ZHA6Ly84LjguNC40IiwKICAgICAgICAgICAgInhsaXZyZHIuY29tK3VkcDovLzguOC40LjQiLAogICAgICAgICAgICAiYXNzaWN1cmF6aW9uaW9ubGluZS5pdCt1ZHA6Ly84LjguNC40IiwKICAgICAgICAgICAgInZvaXBzdHVudC5jb20rdWRwOi8vOC44LjQuNCIsCiAgICAgICAgICAgICJyYXdnaXQuY29tK3VkcDovLzguOC40LjQiLAogICAgICAgICAgICAibG91ZGVjaG8uYWkrdWRwOi8vOC44LjQuNCIsCiAgICAgICAgICAgICJ2b2lwYnVzdGVyLmNvbSt1ZHA6Ly84LjguNC40IiwKICAgICAgICAgICAgImFkc3Rlci50ZWNoK3VkcDovLzguOC40LjQiCiAgICAgICAgXTsKCiAgICAgICAgZnVuY3Rpb24gdXBkYXRlR2xvYmFsRWNoQ291bnQoKSB7CiAgICAgICAgICAgIGNvbnN0IGxpbmVzID0gKGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdjZmctZWNoLWxpc3QnKT8udmFsdWUgfHwgJycpLnNwbGl0KCdcbicpLm1hcChzID0+IHMudHJpbSgpKS5maWx0ZXIoQm9vbGVhbik7CiAgICAgICAgICAgIGNvbnN0IGJhZGdlID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ2NmZy1lY2gtY291bnQnKTsKICAgICAgICAgICAgaWYgKGJhZGdlKSBiYWRnZS50ZXh0Q29udGVudCA9IGxpbmVzLmxlbmd0aDsKICAgICAgICAgICAgY29uc3QgaW5oZXJpdENvdW50ID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ3VzZXItZWNoLWluaGVyaXQtY291bnQnKTsKICAgICAgICAgICAgaWYgKGluaGVyaXRDb3VudCkgaW5oZXJpdENvdW50LnRleHRDb250ZW50ID0gbGluZXMubGVuZ3RoOwogICAgICAgIH0KCiAgICAgICAgZnVuY3Rpb24gcmVzZXRHbG9iYWxFY2hEZWZhdWx0cygpIHsKICAgICAgICAgICAgY29uc3QgbGlzdEVsID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ2NmZy1lY2gtbGlzdCcpOwogICAgICAgICAgICBpZiAobGlzdEVsKSBsaXN0RWwudmFsdWUgPSBERUZBVUxUX0VDSF9DT05GSUdTLmpvaW4oJ1xuJyk7CiAgICAgICAgICAgIHVwZGF0ZUdsb2JhbEVjaENvdW50KCk7CiAgICAgICAgICAgIHVwZGF0ZVN1YnNjcmliZXJDb25maWdQcmV2aWV3KCk7CiAgICAgICAgfQoKICAgICAgICBmdW5jdGlvbiBjbGVhckdsb2JhbEVjaCgpIHsKICAgICAgICAgICAgY29uc3QgbGlzdEVsID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ2NmZy1lY2gtbGlzdCcpOwogICAgICAgICAgICBpZiAobGlzdEVsKSBsaXN0RWwudmFsdWUgPSAnJzsKICAgICAgICAgICAgdXBkYXRlR2xvYmFsRWNoQ291bnQoKTsKICAgICAgICAgICAgdXBkYXRlU3Vic2NyaWJlckNvbmZpZ1ByZXZpZXcoKTsKICAgICAgICB9CgogICAgICAgIGZ1bmN0aW9uIHRvZ2dsZVVzZXJFY2hNb2RlKCkgewogICAgICAgICAgICBjb25zdCBpc0N1c3RvbSA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdlY2gtbW9kZS1jdXN0b20nKT8uY2hlY2tlZDsKICAgICAgICAgICAgY29uc3Qgd3JhcCA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdmb3JtLXVzZXItZWNoLWN1c3RvbS13cmFwJyk7CiAgICAgICAgICAgIGlmICh3cmFwKSB7CiAgICAgICAgICAgICAgICBpZiAoaXNDdXN0b20pIHdyYXAuY2xhc3NMaXN0LnJlbW92ZSgnaGlkZGVuJyk7CiAgICAgICAgICAgICAgICBlbHNlIHdyYXAuY2xhc3NMaXN0LmFkZCgnaGlkZGVuJyk7CiAgICAgICAgICAgIH0KICAgICAgICAgICAgdXBkYXRlU3Vic2NyaWJlckNvbmZpZ1ByZXZpZXcoKTsKICAgICAgICB9CgogICAgICAgIGZ1bmN0aW9uIGNvcHlHbG9iYWxFY2hUb1VzZXIoKSB7CiAgICAgICAgICAgIGNvbnN0IGdsb2JhbFRleHQgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnY2ZnLWVjaC1saXN0Jyk/LnZhbHVlIHx8IERFRkFVTFRfRUNIX0NPTkZJR1Muam9pbignXG4nKTsKICAgICAgICAgICAgY29uc3QgdGFyZ2V0RWwgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnZm9ybS11c2VyLWVjaC1saXN0Jyk7CiAgICAgICAgICAgIGlmICh0YXJnZXRFbCkgdGFyZ2V0RWwudmFsdWUgPSBnbG9iYWxUZXh0OwogICAgICAgICAgICB1cGRhdGVTdWJzY3JpYmVyQ29uZmlnUHJldmlldygpOwogICAgICAgIH0KCiAgICAgICAgZnVuY3Rpb24gcmVzZXRVc2VyRWNoRGVmYXVsdHMoKSB7CiAgICAgICAgICAgIGNvbnN0IHRhcmdldEVsID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ2Zvcm0tdXNlci1lY2gtbGlzdCcpOwogICAgICAgICAgICBpZiAodGFyZ2V0RWwpIHRhcmdldEVsLnZhbHVlID0gREVGQVVMVF9FQ0hfQ09ORklHUy5qb2luKCdcbicpOwogICAgICAgICAgICB1cGRhdGVTdWJzY3JpYmVyQ29uZmlnUHJldmlldygpOwogICAgICAgIH0KCiAgICAgICAgY29uc3QgREVGQVVMVF9CVUlMVElOX1BST1hZX0lQUyA9IFsKICAgICAgICAgICAgInByb3h5aXAuZnh4ay5kZWR5bi5pbyIsCiAgICAgICAgICAgICJ3b3JrZXJzLmNsb3VkZmxhcmUuY3lvdSIsCiAgICAgICAgICAgICJwcm94eWlwLmpwLmZ4eGsuZGVkeW4uaW8iLAogICAgICAgICAgICAicHJveHlpcC5zZy5meHhrLmRlZHluLmlvIgogICAgICAgIF07CgogICAgICAgIGZ1bmN0aW9uIG9uUHJveHlJcE1vZGVDaGFuZ2UoKSB7CiAgICAgICAgICAgIGNvbnN0IGlzQ3VzdG9tID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ3Byb3h5aXAtbW9kZS1jdXN0b20nKT8uY2hlY2tlZDsKICAgICAgICAgICAgY29uc3QgcG9vbFRleHRhcmVhID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ2NmZy1wcm94eWlwLXBvb2wnKTsKICAgICAgICAgICAgY29uc3Qgc3RhdHVzRWwgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgncHJveHlpcC1wb29sLXN0YXR1cycpOwogICAgICAgICAgICBjb25zdCBsYWJlbEVsID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ2NmZy1wcm94eWlwLXBvb2wtbGFiZWwnKTsKICAgICAgICAgICAgY29uc3QgYWRkQnRuID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ2J0bi1hZGQtcHJveHlpcCcpOwoKICAgICAgICAgICAgaWYgKGlzQ3VzdG9tKSB7CiAgICAgICAgICAgICAgICBpZiAobGFiZWxFbCkgbGFiZWxFbC50ZXh0Q29udGVudCA9ICdBY3RpdmUgUHJveHkgSVAgUG9vbCAoQ3VzdG9tIE9wZXJhdG9yIExpc3QpJzsKICAgICAgICAgICAgICAgIGlmIChzdGF0dXNFbCkgc3RhdHVzRWwuaW5uZXJIVE1MID0gJzxzcGFuIHN0eWxlPSJjb2xvcjp2YXIoLS1hY2NlbnQpOyBmb250LXdlaWdodDo2MDA7Ij5DdXN0b20gTW9kZSBBY3RpdmU6PC9zcGFuPiBCdWlsdC1pbiBwb29sIGVudHJpZXMgYXJlIE5PVCB1c2VkLiBTdWJzY3JpYmVycyB3aWxsIHJvdXRlIGV4Y2x1c2l2ZWx5IHRocm91Z2ggdGhpcyBjdXN0b20gbGlzdC4nOwogICAgICAgICAgICAgICAgaWYgKGFkZEJ0bikgYWRkQnRuLnN0eWxlLmRpc3BsYXkgPSAnaW5saW5lLWJsb2NrJzsKICAgICAgICAgICAgfSBlbHNlIHsKICAgICAgICAgICAgICAgIGlmIChsYWJlbEVsKSBsYWJlbEVsLnRleHRDb250ZW50ID0gJ0FjdGl2ZSBQcm94eSBJUCBQb29sICg0IEJ1aWx0LWluIEVuZHBvaW50cyknOwogICAgICAgICAgICAgICAgaWYgKHN0YXR1c0VsKSBzdGF0dXNFbC5pbm5lckhUTUwgPSAnU3RhdHVzOiA8c3BhbiBzdHlsZT0iY29sb3I6dmFyKC0tdGV4dC1tYWluKTsgZm9udC13ZWlnaHQ6NjAwOyI+QXV0b21hdGljIE1vZGUgQWN0aXZlLjwvc3Bhbj4gVXNpbmcgYXBwcm92ZWQgY2xlYW4tcm9vbSBkZWZhdWx0IHBvb2wuJzsKICAgICAgICAgICAgICAgIGlmIChhZGRCdG4pIGFkZEJ0bi5zdHlsZS5kaXNwbGF5ID0gJ25vbmUnOwogICAgICAgICAgICAgICAgaWYgKHBvb2xUZXh0YXJlYSAmJiAhcG9vbFRleHRhcmVhLnZhbHVlLnRyaW0oKSkgewogICAgICAgICAgICAgICAgICAgIHBvb2xUZXh0YXJlYS52YWx1ZSA9IERFRkFVTFRfQlVJTFRJTl9QUk9YWV9JUFMuam9pbignXG4nKTsKICAgICAgICAgICAgICAgIH0KICAgICAgICAgICAgfQogICAgICAgIH0KCiAgICAgICAgZnVuY3Rpb24gdG9nZ2xlUHJveHlJcEVuYWJsZWQoKSB7CiAgICAgICAgICAgIGNvbnN0IGlzRW5hYmxlZCA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdjZmctZW5hYmxlLXByb3h5aXAnKT8uY2hlY2tlZDsKICAgICAgICAgICAgY29uc3Qgc3RhdHVzRWwgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgncHJveHlpcC1wb29sLXN0YXR1cycpOwogICAgICAgICAgICBpZiAoIWlzRW5hYmxlZCAmJiBzdGF0dXNFbCkgewogICAgICAgICAgICAgICAgc3RhdHVzRWwuaW5uZXJIVE1MID0gJzxzcGFuIHN0eWxlPSJjb2xvcjojZWY0NDQ0OyBmb250LXdlaWdodDo2MDA7Ij5Qcm94eSBJUCBSb3V0aW5nIGlzIERJU0FCTEVEIGdsb2JhbGx5Ljwvc3Bhbj4gRGlyZWN0L05BVDY0IGVncmVzcyBhY3RpdmUuJzsKICAgICAgICAgICAgfSBlbHNlIHsKICAgICAgICAgICAgICAgIG9uUHJveHlJcE1vZGVDaGFuZ2UoKTsKICAgICAgICAgICAgfQogICAgICAgIH0KCiAgICAgICAgZnVuY3Rpb24gcmVzdG9yZURlZmF1bHRQcm94eUlwUG9vbCgpIHsKICAgICAgICAgICAgY29uc3QgYnVpbHRpblJhZGlvID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ3Byb3h5aXAtbW9kZS1idWlsdGluJyk7CiAgICAgICAgICAgIGlmIChidWlsdGluUmFkaW8pIGJ1aWx0aW5SYWRpby5jaGVja2VkID0gdHJ1ZTsKICAgICAgICAgICAgY29uc3QgcG9vbFRleHRhcmVhID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ2NmZy1wcm94eWlwLXBvb2wnKTsKICAgICAgICAgICAgaWYgKHBvb2xUZXh0YXJlYSkgcG9vbFRleHRhcmVhLnZhbHVlID0gREVGQVVMVF9CVUlMVElOX1BST1hZX0lQUy5qb2luKCdcbicpOwogICAgICAgICAgICBvblByb3h5SXBNb2RlQ2hhbmdlKCk7CiAgICAgICAgfQoKICAgICAgICBmdW5jdGlvbiBhZGRQcm94eUlwUHJvbXB0KCkgewogICAgICAgICAgICBjb25zdCBlbnRyeSA9IHByb21wdCgnRW50ZXIgbmV3IFByb3h5IElQIGVuZHBvaW50IChlLmcuIDEuMi4zLjQ6NDQzLCBwcm94eS5leGFtcGxlLmNvbSwgb3IgWzI2MDY6NDcwMDo6MV06NDQzKTonKTsKICAgICAgICAgICAgaWYgKCFlbnRyeSB8fCAhZW50cnkudHJpbSgpKSByZXR1cm47CiAgICAgICAgICAgIGNvbnN0IGN1c3RvbVJhZGlvID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ3Byb3h5aXAtbW9kZS1jdXN0b20nKTsKICAgICAgICAgICAgaWYgKGN1c3RvbVJhZGlvKSBjdXN0b21SYWRpby5jaGVja2VkID0gdHJ1ZTsKICAgICAgICAgICAgb25Qcm94eUlwTW9kZUNoYW5nZSgpOwogICAgICAgICAgICBjb25zdCBwb29sVGV4dGFyZWEgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnY2ZnLXByb3h5aXAtcG9vbCcpOwogICAgICAgICAgICBpZiAocG9vbFRleHRhcmVhKSB7CiAgICAgICAgICAgICAgICBjb25zdCBjdXJyZW50ID0gcG9vbFRleHRhcmVhLnZhbHVlLnRyaW0oKTsKICAgICAgICAgICAgICAgIHBvb2xUZXh0YXJlYS52YWx1ZSA9IGN1cnJlbnQgPyBjdXJyZW50ICsgJ1xuJyArIGVudHJ5LnRyaW0oKSA6IGVudHJ5LnRyaW0oKTsKICAgICAgICAgICAgfQogICAgICAgIH0KCiAgICAgICAgYXN5bmMgZnVuY3Rpb24gcHJvYmVFbnRpcmVQcm94eVBvb2woKSB7CiAgICAgICAgICAgIGNvbnN0IHJlc3VsdHNCb3ggPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgncHJveHlpcC1wcm9iZS1yZXN1bHRzJyk7CiAgICAgICAgICAgIGNvbnN0IGxpc3RFbCA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdwcm94eWlwLXByb2JlLWxpc3QnKTsKICAgICAgICAgICAgY29uc3QgcG9vbFRleHQgPSAoZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ2NmZy1wcm94eWlwLXBvb2wnKT8udmFsdWUgfHwgJycpLnRyaW0oKTsKICAgICAgICAgICAgY29uc3QgZW50cmllcyA9IHBvb2xUZXh0LnNwbGl0KC9bXHJcbiw7XSsvKS5tYXAocyA9PiBzLnRyaW0oKSkuZmlsdGVyKEJvb2xlYW4pOwoKICAgICAgICAgICAgaWYgKGVudHJpZXMubGVuZ3RoID09PSAwKSB7CiAgICAgICAgICAgICAgICBhbGVydCgnTm8gUHJveHkgSVAgZW50cmllcyBpbiB0aGUgYWN0aXZlIHBvb2wgdG8gdGVzdC4nKTsKICAgICAgICAgICAgICAgIHJldHVybjsKICAgICAgICAgICAgfQoKICAgICAgICAgICAgaWYgKHJlc3VsdHNCb3gpIHJlc3VsdHNCb3guc3R5bGUuZGlzcGxheSA9ICdibG9jayc7CiAgICAgICAgICAgIGlmIChsaXN0RWwpIGxpc3RFbC5pbm5lckhUTUwgPSAnPGRpdiBzdHlsZT0iY29sb3I6dmFyKC0tdGV4dC1tdXRlZCk7Ij5UZXN0aW5nIHBvb2wgZW5kcG9pbnRzLi4uPC9kaXY+JzsKCiAgICAgICAgICAgIGNvbnN0IG91dHB1dEl0ZW1zID0gW107CiAgICAgICAgICAgIGZvciAoY29uc3QgaXRlbSBvZiBlbnRyaWVzKSB7CiAgICAgICAgICAgICAgICB0cnkgewogICAgICAgICAgICAgICAgICAgIGNvbnN0IHJlcyA9IGF3YWl0IGZldGNoKGAvJHtzdGF0ZS5hcGlSb3V0ZX0vcHJveHktaXAvdGVzdD90YXJnZXQ9JHtlbmNvZGVVUklDb21wb25lbnQoaXRlbSl9JmF0dGVtcHRzPTNgLCB7CiAgICAgICAgICAgICAgICAgICAgICAgIGhlYWRlcnM6IHsgJ0F1dGhvcml6YXRpb24nOiAnQmVhcmVyICcgKyBzdGF0ZS5tYXN0ZXJLZXkgfQogICAgICAgICAgICAgICAgICAgIH0pOwogICAgICAgICAgICAgICAgICAgIGNvbnN0IGRhdGEgPSBhd2FpdCByZXMuanNvbigpOwogICAgICAgICAgICAgICAgICAgIGNvbnN0IGlzT2sgPSBkYXRhLm9rIHx8IGRhdGEuc3VjY2VzczsKICAgICAgICAgICAgICAgICAgICBjb25zdCBsYXRlbmN5ID0gZGF0YS5sYXRlbmN5X21zID8gYCR7ZGF0YS5sYXRlbmN5X21zfW1zYCA6ICd0aW1lb3V0JzsKICAgICAgICAgICAgICAgICAgICBjb25zdCBiYWRnZSA9IGlzT2sgPyAnPHNwYW4gc3R5bGU9ImNvbG9yOiMyMmM1NWU7Ij7il48gUmVhY2hhYmxlPC9zcGFuPicgOiAnPHNwYW4gc3R5bGU9ImNvbG9yOiNlZjQ0NDQ7Ij7il48gT2ZmbGluZTwvc3Bhbj4nOwogICAgICAgICAgICAgICAgICAgIG91dHB1dEl0ZW1zLnB1c2goYAogICAgICAgICAgICAgICAgICAgICAgICA8ZGl2IHN0eWxlPSJkaXNwbGF5OmZsZXg7IGp1c3RpZnktY29udGVudDpzcGFjZS1iZXR3ZWVuOyBhbGlnbi1pdGVtczpjZW50ZXI7IHBhZGRpbmc6NHB4IDhweDsgYmFja2dyb3VuZDp2YXIoLS1iZy1jYXJkKTsgYm9yZGVyLXJhZGl1czo0cHg7IGZvbnQtZmFtaWx5Om1vbm9zcGFjZTsiPgogICAgICAgICAgICAgICAgICAgICAgICAgICAgPHNwYW4+JHtpdGVtfTwvc3Bhbj4KICAgICAgICAgICAgICAgICAgICAgICAgICAgIDxkaXYgc3R5bGU9ImRpc3BsYXk6ZmxleDsgZ2FwOjEycHg7IGFsaWduLWl0ZW1zOmNlbnRlcjsiPgogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDxzcGFuIHN0eWxlPSJjb2xvcjp2YXIoLS10ZXh0LW11dGVkKTsiPiR7bGF0ZW5jeX08L3NwYW4+CiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgJHtiYWRnZX0KICAgICAgICAgICAgICAgICAgICAgICAgICAgIDwvZGl2PgogICAgICAgICAgICAgICAgICAgICAgICA8L2Rpdj4KICAgICAgICAgICAgICAgICAgICBgKTsKICAgICAgICAgICAgICAgIH0gY2F0Y2ggKGUpIHsKICAgICAgICAgICAgICAgICAgICBvdXRwdXRJdGVtcy5wdXNoKGAKICAgICAgICAgICAgICAgICAgICAgICAgPGRpdiBzdHlsZT0iZGlzcGxheTpmbGV4OyBqdXN0aWZ5LWNvbnRlbnQ6c3BhY2UtYmV0d2VlbjsgYWxpZ24taXRlbXM6Y2VudGVyOyBwYWRkaW5nOjRweCA4cHg7IGJhY2tncm91bmQ6dmFyKC0tYmctY2FyZCk7IGJvcmRlci1yYWRpdXM6NHB4OyBmb250LWZhbWlseTptb25vc3BhY2U7Ij4KICAgICAgICAgICAgICAgICAgICAgICAgICAgIDxzcGFuPiR7aXRlbX08L3NwYW4+CiAgICAgICAgICAgICAgICAgICAgICAgICAgICA8c3BhbiBzdHlsZT0iY29sb3I6I2VmNDQ0NDsiPuKXjyBFcnJvciAoJHtlLm1lc3NhZ2V9KTwvc3Bhbj4KICAgICAgICAgICAgICAgICAgICAgICAgPC9kaXY+CiAgICAgICAgICAgICAgICAgICAgYCk7CiAgICAgICAgICAgICAgICB9CiAgICAgICAgICAgIH0KICAgICAgICAgICAgaWYgKGxpc3RFbCkgbGlzdEVsLmlubmVySFRNTCA9IG91dHB1dEl0ZW1zLmpvaW4oJycpOwogICAgICAgIH0KCiAgICAgICAgZnVuY3Rpb24gdXBkYXRlVXNlclByb3h5SXBOb3RpY2UoKSB7CiAgICAgICAgICAgIGNvbnN0IGlzRW5hYmxlZCA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdmb3JtLXVzZXItZW5hYmxlLXByb3h5aXAnKT8uY2hlY2tlZCA/PyB0cnVlOwogICAgICAgICAgICBjb25zdCB0ZXh0YXJlYUVsID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ2Zvcm0tdXNlci1wcm94eS1pcCcpOwogICAgICAgICAgICBjb25zdCB2YWwgPSAodGV4dGFyZWFFbD8udmFsdWUgfHwgJycpLnRyaW0oKTsKICAgICAgICAgICAgY29uc3Qgbm90aWNlRWwgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnZm9ybS11c2VyLXByb3h5LWlwLW5vdGljZScpOwogICAgICAgICAgICBjb25zdCBpY29uRWwgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgndXNlci1waXAtbm90aWNlLWljb24nKTsKICAgICAgICAgICAgY29uc3QgdGV4dEVsID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ3VzZXItcGlwLW5vdGljZS10ZXh0Jyk7CgogICAgICAgICAgICBpZiAoIWlzRW5hYmxlZCkgewogICAgICAgICAgICAgICAgaWYgKHRleHRhcmVhRWwpIHsKICAgICAgICAgICAgICAgICAgICB0ZXh0YXJlYUVsLmRpc2FibGVkID0gdHJ1ZTsKICAgICAgICAgICAgICAgICAgICB0ZXh0YXJlYUVsLnN0eWxlLm9wYWNpdHkgPSAnMC41JzsKICAgICAgICAgICAgICAgIH0KICAgICAgICAgICAgICAgIGlmIChpY29uRWwpIGljb25FbC50ZXh0Q29udGVudCA9ICfwn5qrJzsKICAgICAgICAgICAgICAgIGlmICh0ZXh0RWwpIHRleHRFbC5pbm5lckhUTUwgPSAnPHN0cm9uZyBzdHlsZT0iY29sb3I6I2VmNDQ0NDsiPlByb3h5IElQIGlzIERJU0FCTEVEIGZvciB0aGlzIHN1YnNjcmliZXIgKFN0YXRlIDEpLjwvc3Ryb25nPiBOb2RlIHBhdGhzIHdpbGwgb21pdCAmcHJveHlpcD0gYW5kIGNvbm5lY3Rpb25zIHdpbGwgcm91dGUgcHVyZWx5IGRpcmVjdC4nOwogICAgICAgICAgICAgICAgaWYgKG5vdGljZUVsKSBub3RpY2VFbC5zdHlsZS5jb2xvciA9ICcjZWY0NDQ0JzsKICAgICAgICAgICAgICAgIHJldHVybjsKICAgICAgICAgICAgfQoKICAgICAgICAgICAgaWYgKHRleHRhcmVhRWwpIHsKICAgICAgICAgICAgICAgIHRleHRhcmVhRWwuZGlzYWJsZWQgPSBmYWxzZTsKICAgICAgICAgICAgICAgIHRleHRhcmVhRWwuc3R5bGUub3BhY2l0eSA9ICcxJzsKICAgICAgICAgICAgfQoKICAgICAgICAgICAgaWYgKHZhbCkgewogICAgICAgICAgICAgICAgaWYgKGljb25FbCkgaWNvbkVsLnRleHRDb250ZW50ID0gJ+KaoO+4jyc7CiAgICAgICAgICAgICAgICBpZiAodGV4dEVsKSB0ZXh0RWwuaW5uZXJIVE1MID0gJzxzdHJvbmcgc3R5bGU9ImNvbG9yOnZhcigtLWFjY2VudCk7Ij5DdXN0b20gUHJveHkgSVAgYWN0aXZlIChTdGF0ZSAzKS48L3N0cm9uZz4gVGhpcyBzdWJzY3JpYmVyIHJvdXRlcyBPTkxZIHRocm91Z2ggdGhlc2UgZW50cmllcyAobmV2ZXIgbWVyZ2VkIHdpdGggYnVpbHQtaW4vb3BlcmF0b3IgcG9vbCkuJzsKICAgICAgICAgICAgICAgIGlmIChub3RpY2VFbCkgbm90aWNlRWwuc3R5bGUuY29sb3IgPSAndmFyKC0tdGV4dC1tYWluKSc7CiAgICAgICAgICAgIH0gZWxzZSB7CiAgICAgICAgICAgICAgICBpZiAoaWNvbkVsKSBpY29uRWwudGV4dENvbnRlbnQgPSAn4oS577iPJzsKICAgICAgICAgICAgICAgIGlmICh0ZXh0RWwpIHRleHRFbC5pbm5lckhUTUwgPSAnPHN0cm9uZyBzdHlsZT0iY29sb3I6dmFyKC0tdGV4dC1tYWluKTsiPkF1dG9tYXRpYyBtb2RlIGFjdGl2ZSAoU3RhdGUgMikuPC9zdHJvbmc+IFJlc29sdmluZyBwb29sIHZpYSBjYW5vbmljYWwgcHJlY2VkZW5jZSAoT3BlcmF0b3IgUG9vbCAmZ3Q7IEJ1aWx0LWluIFBvb2wpLic7CiAgICAgICAgICAgICAgICBpZiAobm90aWNlRWwpIG5vdGljZUVsLnN0eWxlLmNvbG9yID0gJ3ZhcigtLXRleHQtbXV0ZWQpJzsKICAgICAgICAgICAgfQogICAgICAgIH0KCiAgICAgICAgZnVuY3Rpb24gY2xlYXJVc2VyUHJveHlJcE92ZXJyaWRlKCkgewogICAgICAgICAgICBjb25zdCBlbCA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdmb3JtLXVzZXItcHJveHktaXAnKTsKICAgICAgICAgICAgaWYgKGVsKSBlbC52YWx1ZSA9ICcnOwogICAgICAgICAgICBjb25zdCBlbmFibGVFbCA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdmb3JtLXVzZXItZW5hYmxlLXByb3h5aXAnKTsKICAgICAgICAgICAgaWYgKGVuYWJsZUVsKSBlbmFibGVFbC5jaGVja2VkID0gdHJ1ZTsKICAgICAgICAgICAgdXBkYXRlVXNlclByb3h5SXBOb3RpY2UoKTsKICAgICAgICB9CgogICAgICAgIGZ1bmN0aW9uIHVwZGF0ZVN1YnNjcmliZXJDb25maWdQcmV2aWV3KCkgewogICAgICAgICAgICBjb25zdCBjbGVhbklwVGV4dCA9IChkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnZm9ybS11c2VyLWNsZWFuLWlwJyk/LnZhbHVlIHx8ICcnKS50cmltKCk7CiAgICAgICAgICAgIGNvbnN0IGNsZWFuSXBzID0gY2xlYW5JcFRleHQgPyBjbGVhbklwVGV4dC5zcGxpdCgvW1xyXG4sO10rLykubWFwKHMgPT4gcy50cmltKCkpLmZpbHRlcihCb29sZWFuKSA6IFsnd3d3LnNwZWVkdGVzdC5uZXQnXTsKICAgICAgICAgICAgLy8gMSBDbGVhbiBJUCArIDEgcHJpbWFyeSBlbmRwb2ludCA9IDIgYmFzZSBjb25maWdzOyAzIENsZWFuIElQcyArIDEgcHJpbWFyeSA9IDQgYmFzZSBjb25maWdzCiAgICAgICAgICAgIGNvbnN0IGJhc2VDb3VudCA9IGNsZWFuSXBzLmxlbmd0aCArIDE7CgogICAgICAgICAgICBjb25zdCBpc0N1c3RvbSA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdlY2gtbW9kZS1jdXN0b20nKT8uY2hlY2tlZDsKICAgICAgICAgICAgbGV0IGVjaENvdW50ID0gMDsKICAgICAgICAgICAgaWYgKGlzQ3VzdG9tKSB7CiAgICAgICAgICAgICAgICBjb25zdCBlY2hMaW5lcyA9IChkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnZm9ybS11c2VyLWVjaC1saXN0Jyk/LnZhbHVlIHx8ICcnKS5zcGxpdCgnXG4nKS5tYXAocyA9PiBzLnRyaW0oKSkuZmlsdGVyKEJvb2xlYW4pOwogICAgICAgICAgICAgICAgZWNoQ291bnQgPSBlY2hMaW5lcy5sZW5ndGg7CiAgICAgICAgICAgIH0gZWxzZSB7CiAgICAgICAgICAgICAgICBjb25zdCBnbG9iYWxMaW5lcyA9IChkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnY2ZnLWVjaC1saXN0Jyk/LnZhbHVlIHx8ICcnKS5zcGxpdCgnXG4nKS5tYXAocyA9PiBzLnRyaW0oKSkuZmlsdGVyKEJvb2xlYW4pOwogICAgICAgICAgICAgICAgZWNoQ291bnQgPSBnbG9iYWxMaW5lcy5sZW5ndGggPiAwID8gZ2xvYmFsTGluZXMubGVuZ3RoIDogKEFycmF5LmlzQXJyYXkoc3RhdGUuY29uZmlnPy5lY2hDb25maWdMaXN0KSA/IHN0YXRlLmNvbmZpZy5lY2hDb25maWdMaXN0Lmxlbmd0aCA6IERFRkFVTFRfRUNIX0NPTkZJR1MubGVuZ3RoKTsKICAgICAgICAgICAgfQoKICAgICAgICAgICAgY29uc3QgdG90YWwgPSBlY2hDb3VudCA+IDAgPyBiYXNlQ291bnQgKiBlY2hDb3VudCA6IGJhc2VDb3VudDsKICAgICAgICAgICAgY29uc3QgY2FsY1RleHQgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnZm9ybS11c2VyLWNhbGMtdGV4dCcpOwogICAgICAgICAgICBpZiAoY2FsY1RleHQpIHsKICAgICAgICAgICAgICAgIGlmIChlY2hDb3VudCA+IDApIHsKICAgICAgICAgICAgICAgICAgICBjYWxjVGV4dC50ZXh0Q29udGVudCA9IGAke2Jhc2VDb3VudH0gYmFzZSBlbmRwb2ludCR7YmFzZUNvdW50ID4gMSA/ICdzJyA6ICcnfSAoJHtjbGVhbklwcy5sZW5ndGh9IGNsZWFuIElQJHtjbGVhbklwcy5sZW5ndGggPiAxID8gJ3MnIDogJyd9ICsgcHJpbWFyeSkgw5cgJHtlY2hDb3VudH0gRUNIIGNvbmZpZ3MgPSAke3RvdGFsfSB0b3RhbCBjb25maWdzYDsKICAgICAgICAgICAgICAgIH0gZWxzZSB7CiAgICAgICAgICAgICAgICAgICAgY2FsY1RleHQudGV4dENvbnRlbnQgPSBgJHtiYXNlQ291bnR9IGJhc2UgZW5kcG9pbnQke2Jhc2VDb3VudCA+IDEgPyAncycgOiAnJ30gKDAgRUNIIGNvbmZpZ3Mgc2VsZWN0ZWQ6IGdlbmVyYXRlZCB3aXRob3V0IGVjaD0uLi4pID0gJHt0b3RhbH0gY29uZmlnc2A7CiAgICAgICAgICAgICAgICB9CiAgICAgICAgICAgIH0KICAgICAgICB9CgogICAgICAgIC8vIEluaXRpYWxpemUgc2Vzc2lvbiBvbiBsb2FkCiAgICAgICAgd2luZG93LmFkZEV2ZW50TGlzdGVuZXIoJ0RPTUNvbnRlbnRMb2FkZWQnLCAoKSA9PiB7CiAgICAgICAgICAgIHNldHVwTmF2aWdhdGlvbigpOwogICAgICAgICAgICBjb25zdCBzYXZlZFNlc3Npb24gPSBsb2NhbFN0b3JhZ2UuZ2V0SXRlbSgnbHVjaV9zZXNzaW9uJyk7CiAgICAgICAgICAgIGlmIChzYXZlZFNlc3Npb24pIHsKICAgICAgICAgICAgICAgIHRyeSB7CiAgICAgICAgICAgICAgICAgICAgY29uc3QgcGFyc2VkID0gSlNPTi5wYXJzZShzYXZlZFNlc3Npb24pOwogICAgICAgICAgICAgICAgICAgIGlmIChwYXJzZWQ/LmtleSkgewogICAgICAgICAgICAgICAgICAgICAgICBzdGF0ZS5tYXN0ZXJLZXkgPSBwYXJzZWQua2V5OwogICAgICAgICAgICAgICAgICAgICAgICBhdXRoZW50aWNhdGUocGFyc2VkLmtleSwgdHJ1ZSk7CiAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybjsKICAgICAgICAgICAgICAgICAgICB9CiAgICAgICAgICAgICAgICB9IGNhdGNoIHt9CiAgICAgICAgICAgIH0KICAgICAgICAgICAgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ2xvZ2luLXNjcmVlbicpLmNsYXNzTGlzdC5yZW1vdmUoJ2hpZGRlbicpOwogICAgICAgIH0pOwoKICAgICAgICAvLyBOYXZpZ2F0aW9uIHRhYiBzd2l0Y2hpbmcKICAgICAgICBmdW5jdGlvbiBzZXR1cE5hdmlnYXRpb24oKSB7CiAgICAgICAgICAgIGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3JBbGwoJy5uYXYtaXRlbScpLmZvckVhY2goaXRlbSA9PiB7CiAgICAgICAgICAgICAgICBpdGVtLmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgKCkgPT4gewogICAgICAgICAgICAgICAgICAgIGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3JBbGwoJy5uYXYtaXRlbScpLmZvckVhY2gobiA9PiBuLmNsYXNzTGlzdC5yZW1vdmUoJ2FjdGl2ZScpKTsKICAgICAgICAgICAgICAgICAgICBkb2N1bWVudC5xdWVyeVNlbGVjdG9yQWxsKCcudGFiLWNvbnRlbnQnKS5mb3JFYWNoKHQgPT4gdC5jbGFzc0xpc3QuYWRkKCdoaWRkZW4nKSk7CiAgICAgICAgICAgICAgICAgICAgaXRlbS5jbGFzc0xpc3QuYWRkKCdhY3RpdmUnKTsKICAgICAgICAgICAgICAgICAgICBjb25zdCB0YXJnZXQgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChpdGVtLmRhdGFzZXQudGFiKTsKICAgICAgICAgICAgICAgICAgICBpZiAodGFyZ2V0KSB0YXJnZXQuY2xhc3NMaXN0LnJlbW92ZSgnaGlkZGVuJyk7CgogICAgICAgICAgICAgICAgICAgIGlmIChpdGVtLmRhdGFzZXQudGFiID09PSAndGFiLXN1YnNjcmliZXJzJykgbG9hZFN1YnNjcmliZXJzKCk7CiAgICAgICAgICAgICAgICAgICAgaWYgKGl0ZW0uZGF0YXNldC50YWIgPT09ICd0YWItbG9ncycpIGxvYWRBdWRpdExvZ3MoKTsKICAgICAgICAgICAgICAgIH0pOwogICAgICAgICAgICB9KTsKICAgICAgICB9CgogICAgICAgIC8vIExvZ2luIEhhbmRsZXIKICAgICAgICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnbG9naW4tZm9ybScpLmFkZEV2ZW50TGlzdGVuZXIoJ3N1Ym1pdCcsIGFzeW5jIChlKSA9PiB7CiAgICAgICAgICAgIGUucHJldmVudERlZmF1bHQoKTsKICAgICAgICAgICAgY29uc3Qga2V5ID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ2xvZ2luLWtleScpLnZhbHVlLnRyaW0oKTsKICAgICAgICAgICAgaWYgKCFrZXkpIHJldHVybjsKICAgICAgICAgICAgYXdhaXQgYXV0aGVudGljYXRlKGtleSwgZmFsc2UpOwogICAgICAgIH0pOwoKICAgICAgICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnYnRuLWxvZ291dCcpLmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgKCkgPT4gewogICAgICAgICAgICBsb2NhbFN0b3JhZ2UucmVtb3ZlSXRlbSgnbHVjaV9zZXNzaW9uJyk7CiAgICAgICAgICAgIHN0YXRlLm1hc3RlcktleSA9ICcnOwogICAgICAgICAgICBsb2NhdGlvbi5yZWxvYWQoKTsKICAgICAgICB9KTsKCiAgICAgICAgYXN5bmMgZnVuY3Rpb24gYXV0aGVudGljYXRlKGtleSwgaXNBdXRvID0gZmFsc2UpIHsKICAgICAgICAgICAgY29uc3QgZXJyRGl2ID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ2xvZ2luLWVycm9yJyk7CiAgICAgICAgICAgIGVyckRpdi50ZXh0Q29udGVudCA9ICdBdXRoZW50aWNhdGluZy4uLic7CiAgICAgICAgICAgIHRyeSB7CiAgICAgICAgICAgICAgICBjb25zdCByZXMgPSBhd2FpdCBmZXRjaChgLyR7c3RhdGUuYXBpUm91dGV9L2FwaS9hdXRoYCwgewogICAgICAgICAgICAgICAgICAgIG1ldGhvZDogJ1BPU1QnLAogICAgICAgICAgICAgICAgICAgIGhlYWRlcnM6IHsgJ0NvbnRlbnQtVHlwZSc6ICdhcHBsaWNhdGlvbi9qc29uJyB9LAogICAgICAgICAgICAgICAgICAgIGJvZHk6IEpTT04uc3RyaW5naWZ5KHsga2V5IH0pCiAgICAgICAgICAgICAgICB9KTsKCiAgICAgICAgICAgICAgICBpZiAoIXJlcy5vaykgewogICAgICAgICAgICAgICAgICAgIGlmIChpc0F1dG8pIHsKICAgICAgICAgICAgICAgICAgICAgICAgbG9jYWxTdG9yYWdlLnJlbW92ZUl0ZW0oJ2x1Y2lfc2Vzc2lvbicpOwogICAgICAgICAgICAgICAgICAgICAgICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnbG9naW4tc2NyZWVuJykuY2xhc3NMaXN0LnJlbW92ZSgnaGlkZGVuJyk7CiAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybjsKICAgICAgICAgICAgICAgICAgICB9CiAgICAgICAgICAgICAgICAgICAgaWYgKHJlcy5zdGF0dXMgPT09IDQwMSkgewogICAgICAgICAgICAgICAgICAgICAgICBlcnJEaXYudGV4dENvbnRlbnQgPSAnSW52YWxpZCBjcmVkZW50aWFscy4gQWNjZXNzIGRlbmllZC4nOwogICAgICAgICAgICAgICAgICAgIH0gZWxzZSBpZiAocmVzLnN0YXR1cyA9PT0gNDA0KSB7CiAgICAgICAgICAgICAgICAgICAgICAgIGVyckRpdi50ZXh0Q29udGVudCA9IGBBUEkgcm91dGUgbm90IGZvdW5kIChIVFRQIDQwNCBvbiAvJHtzdGF0ZS5hcGlSb3V0ZX0vYXBpL2F1dGgpLmA7CiAgICAgICAgICAgICAgICAgICAgfSBlbHNlIHsKICAgICAgICAgICAgICAgICAgICAgICAgZXJyRGl2LnRleHRDb250ZW50ID0gYEF1dGhlbnRpY2F0aW9uIGZhaWxlZCAoSFRUUCAke3Jlcy5zdGF0dXN9KS5gOwogICAgICAgICAgICAgICAgICAgIH0KICAgICAgICAgICAgICAgICAgICByZXR1cm47CiAgICAgICAgICAgICAgICB9CgogICAgICAgICAgICAgICAgY29uc3QgZGF0YSA9IGF3YWl0IHJlcy5qc29uKCk7CiAgICAgICAgICAgICAgICBpZiAoZGF0YS5zdWNjZXNzKSB7CiAgICAgICAgICAgICAgICAgICAgc3RhdGUubWFzdGVyS2V5ID0ga2V5OwogICAgICAgICAgICAgICAgICAgIHN0YXRlLmNvbmZpZyA9IGRhdGEuY29uZmlnIHx8IHt9OwogICAgICAgICAgICAgICAgICAgIHN0YXRlLnN5c1VzYWdlID0gZGF0YS5zeXNVc2FnZSB8fCB7fTsKICAgICAgICAgICAgICAgICAgICBsb2NhbFN0b3JhZ2Uuc2V0SXRlbSgnbHVjaV9zZXNzaW9uJywgSlNPTi5zdHJpbmdpZnkoeyBrZXksIHRzOiBEYXRlLm5vdygpIH0pKTsKICAgICAgICAgICAgICAgICAgICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnbG9naW4tc2NyZWVuJykuY2xhc3NMaXN0LmFkZCgnaGlkZGVuJyk7CiAgICAgICAgICAgICAgICAgICAgdXBkYXRlT3ZlcnZpZXdVSShkYXRhKTsKICAgICAgICAgICAgICAgICAgICBwb3B1bGF0ZVNldHRpbmdzKGRhdGEuY29uZmlnKTsKICAgICAgICAgICAgICAgIH0gZWxzZSB7CiAgICAgICAgICAgICAgICAgICAgZXJyRGl2LnRleHRDb250ZW50ID0gZGF0YS5lcnJvciB8fCAnQXV0aGVudGljYXRpb24gZmFpbGVkJzsKICAgICAgICAgICAgICAgIH0KICAgICAgICAgICAgfSBjYXRjaCAoZXJyKSB7CiAgICAgICAgICAgICAgICBlcnJEaXYudGV4dENvbnRlbnQgPSAnQ29ubmVjdGlvbiBlcnJvcjogJyArIGVyci5tZXNzYWdlOwogICAgICAgICAgICB9CiAgICAgICAgfQoKICAgICAgICBmdW5jdGlvbiB1cGRhdGVPdmVydmlld1VJKGRhdGEpIHsKICAgICAgICAgICAgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ25vZGUtaXAnKS50ZXh0Q29udGVudCA9IGRhdGEubmV0d29yaz8uaXAgfHwgJ0VkZ2UgSVAnOwogICAgICAgICAgICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnbm9kZS1sb2MnKS50ZXh0Q29udGVudCA9IGRhdGEubmV0d29yaz8ubG9jIHx8ICdHbG9iYWwgQ2xvdWRmbGFyZSc7CiAgICAgICAgICAgIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdzdGF0LWNvbG8nKS50ZXh0Q29udGVudCA9IGRhdGEubmV0d29yaz8uY29sbyB8fCAnRURHRSc7CiAgICAgICAgICAgIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdub2RlLW1vZGUnKS50ZXh0Q29udGVudCA9IChzdGF0ZS5jb25maWcubW9kZSB8fCAnYWxwaGEnKS50b1VwcGVyQ2FzZSgpOwogICAgICAgICAgICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnbm9kZS1zdWItcm91dGUnKS50ZXh0Q29udGVudCA9ICcvJyArIChzdGF0ZS5jb25maWcuYXBpUm91dGUgfHwgc3RhdGUuYXBpUm91dGUpOwoKICAgICAgICAgICAgY29uc3QgdXNlcnMgPSBzdGF0ZS5jb25maWcudXNlcnMgfHwgW107CiAgICAgICAgICAgIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdzdGF0LXN1YnNjcmliZXJzJykudGV4dENvbnRlbnQgPSB1c2Vycy5sZW5ndGg7CgogICAgICAgICAgICBsZXQgdG90YWxCeXRlcyA9IDA7CiAgICAgICAgICAgIGlmIChzdGF0ZS5zeXNVc2FnZSkgewogICAgICAgICAgICAgICAgZm9yIChjb25zdCB1IG9mIE9iamVjdC52YWx1ZXMoc3RhdGUuc3lzVXNhZ2UpKSB7CiAgICAgICAgICAgICAgICAgICAgdG90YWxCeXRlcyArPSAodS5ieXRlcyB8fCAwKTsKICAgICAgICAgICAgICAgIH0KICAgICAgICAgICAgfQogICAgICAgICAgICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnc3RhdC1iYW5kd2lkdGgnKS50ZXh0Q29udGVudCA9ICh0b3RhbEJ5dGVzIC8gMTA3Mzc0MTgyNCkudG9GaXhlZCgyKSArICcgR0InOwogICAgICAgIH0KCiAgICAgICAgYXN5bmMgZnVuY3Rpb24gcmVmcmVzaE92ZXJ2aWV3KCkgewogICAgICAgICAgICBhdXRoZW50aWNhdGUoc3RhdGUubWFzdGVyS2V5LCB0cnVlKTsKICAgICAgICB9CgogICAgICAgIC8vIFN1YnNjcmliZXJzIFZpZXcKICAgICAgICBhc3luYyBmdW5jdGlvbiBsb2FkU3Vic2NyaWJlcnMoKSB7CiAgICAgICAgICAgIGNvbnN0IHRib2R5ID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ3N1YnNjcmliZXJzLXRib2R5Jyk7CiAgICAgICAgICAgIHRib2R5LmlubmVySFRNTCA9ICc8dHI+PHRkIGNvbHNwYW49IjUiIHN0eWxlPSJ0ZXh0LWFsaWduOiBjZW50ZXI7IGNvbG9yOiB2YXIoLS10ZXh0LW11dGVkKTsiPkZldGNoaW5nIHN1YnNjcmliZXJzLi4uPC90ZD48L3RyPic7CiAgICAgICAgICAgIHRyeSB7CiAgICAgICAgICAgICAgICBjb25zdCByZXMgPSBhd2FpdCBmZXRjaChgLyR7c3RhdGUuYXBpUm91dGV9L2FwaS91c2Vyc2AsIHsKICAgICAgICAgICAgICAgICAgICBoZWFkZXJzOiB7ICdBdXRob3JpemF0aW9uJzogJ0JlYXJlciAnICsgc3RhdGUubWFzdGVyS2V5IH0KICAgICAgICAgICAgICAgIH0pOwogICAgICAgICAgICAgICAgY29uc3QgZGF0YSA9IGF3YWl0IHJlcy5qc29uKCk7CiAgICAgICAgICAgICAgICBpZiAoIWRhdGEuc3VjY2VzcykgewogICAgICAgICAgICAgICAgICAgIHRib2R5LmlubmVySFRNTCA9IGA8dHI+PHRkIGNvbHNwYW49IjUiIHN0eWxlPSJjb2xvcjp2YXIoLS1yZWQpOyI+RXJyb3I6ICR7ZGF0YS5lcnJvcn08L3RkPjwvdHI+YDsKICAgICAgICAgICAgICAgICAgICByZXR1cm47CiAgICAgICAgICAgICAgICB9CiAgICAgICAgICAgICAgICBzdGF0ZS51c2VycyA9IGRhdGEudXNlcnMgfHwgW107CiAgICAgICAgICAgICAgICByZW5kZXJTdWJzY3JpYmVyc1RhYmxlKHN0YXRlLnVzZXJzKTsKICAgICAgICAgICAgfSBjYXRjaCAoZXJyKSB7CiAgICAgICAgICAgICAgICB0Ym9keS5pbm5lckhUTUwgPSBgPHRyPjx0ZCBjb2xzcGFuPSI1IiBzdHlsZT0iY29sb3I6dmFyKC0tcmVkKTsiPk5ldHdvcmsgZXJyb3I6ICR7ZXJyLm1lc3NhZ2V9PC90ZD48L3RyPmA7CiAgICAgICAgICAgIH0KICAgICAgICB9CgogICAgICAgIGZ1bmN0aW9uIHJlbmRlclN1YnNjcmliZXJzVGFibGUodXNlcnMpIHsKICAgICAgICAgICAgY29uc3QgdGJvZHkgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnc3Vic2NyaWJlcnMtdGJvZHknKTsKICAgICAgICAgICAgaWYgKHVzZXJzLmxlbmd0aCA9PT0gMCkgewogICAgICAgICAgICAgICAgdGJvZHkuaW5uZXJIVE1MID0gJzx0cj48dGQgY29sc3Bhbj0iNSIgc3R5bGU9InRleHQtYWxpZ246IGNlbnRlcjsgY29sb3I6IHZhcigtLXRleHQtbXV0ZWQpOyBwYWRkaW5nOiAyNHB4OyI+Tm8gc3Vic2NyaWJlciBwcm9maWxlcyBmb3VuZC4gQ2xpY2sgIisgQWRkIFN1YnNjcmliZXIiIHRvIGNyZWF0ZSBvbmUuPC90ZD48L3RyPic7CiAgICAgICAgICAgICAgICByZXR1cm47CiAgICAgICAgICAgIH0KCiAgICAgICAgICAgIHRib2R5LmlubmVySFRNTCA9IHVzZXJzLm1hcCh1ID0+IHsKICAgICAgICAgICAgICAgIGNvbnN0IHVzZWRHYiA9ICh1LnVzYWdlPy50b3RhbCAvIDEwNzM3NDE4MjQpLnRvRml4ZWQoMik7CiAgICAgICAgICAgICAgICBjb25zdCBsaW1pdEdiID0gdS5saW1pdFRvdGFsUmVxID8gKHUudXNhZ2U/LmxpbWl0IC8gMTA3Mzc0MTgyNCkudG9GaXhlZCgyKSArICcgR0InIDogJ1VubGltaXRlZCc7CiAgICAgICAgICAgICAgICBjb25zdCBzdGF0dXNCYWRnZSA9IGA8c3BhbiBjbGFzcz0iYmFkZ2UgYmFkZ2UtJHt1LnN0YXR1c30iPiR7dS5zdGF0dXMudG9VcHBlckNhc2UoKX08L3NwYW4+YDsKICAgICAgICAgICAgICAgIGNvbnN0IGV4cGlyeVR4dCA9IHUuZXhwaXJ5TXMgPyBuZXcgRGF0ZSh1LmV4cGlyeU1zKS50b0lTT1N0cmluZygpLnNwbGl0KCdUJylbMF0gOiAnTmV2ZXInOwoKICAgICAgICAgICAgICAgIHJldHVybiBgPHRyPgogICAgICAgICAgICAgICAgICAgIDx0ZD48c3Ryb25nPiR7ZXNjYXBlSHRtbCh1Lm5hbWUpfTwvc3Ryb25nPjxicj48c3BhbiBzdHlsZT0iZm9udC1zaXplOjAuNzVyZW07IGNvbG9yOnZhcigtLXRleHQtbXV0ZWQpOyBmb250LWZhbWlseTptb25vc3BhY2U7Ij4ke3UuaWR9PC9zcGFuPjwvdGQ+CiAgICAgICAgICAgICAgICAgICAgPHRkPiR7c3RhdHVzQmFkZ2V9PC90ZD4KICAgICAgICAgICAgICAgICAgICA8dGQ+JHt1c2VkR2J9IEdCIC8gJHtsaW1pdEdifTwvdGQ+CiAgICAgICAgICAgICAgICAgICAgPHRkPiR7ZXhwaXJ5VHh0fTwvdGQ+CiAgICAgICAgICAgICAgICAgICAgPHRkIHN0eWxlPSJ3aGl0ZS1zcGFjZTogbm93cmFwOyI+CiAgICAgICAgICAgICAgICAgICAgICAgIDxidXR0b24gY2xhc3M9ImJ0biBidG4tc20gYnRuLXNlY29uZGFyeSIgb25jbGljaz0ib3BlbkVkaXRVc2VyTW9kYWwoJyR7dS5pZH0nKSI+RWRpdDwvYnV0dG9uPgogICAgICAgICAgICAgICAgICAgICAgICA8YnV0dG9uIGNsYXNzPSJidG4gYnRuLXNtIGJ0bi1zZWNvbmRhcnkiIG9uY2xpY2s9InNob3dMaW5rc01vZGFsKCcke3UuaWR9JywgJyR7ZXNjYXBlSHRtbCh1Lm5hbWUpfScpIj5MaW5rczwvYnV0dG9uPgogICAgICAgICAgICAgICAgICAgICAgICA8YnV0dG9uIGNsYXNzPSJidG4gYnRuLXNtIGJ0bi1zZWNvbmRhcnkiIG9uY2xpY2s9InRvZ2dsZVVzZXJQYXVzZSgnJHt1LmlkfScpIj4ke3UuaXNQYXVzZWQgPyAnUmVzdW1lJyA6ICdQYXVzZSd9PC9idXR0b24+CiAgICAgICAgICAgICAgICAgICAgICAgIDxidXR0b24gY2xhc3M9ImJ0biBidG4tc20gYnRuLXNlY29uZGFyeSIgb25jbGljaz0icmVzZXRVc2VyVXNhZ2UoJyR7dS5pZH0nKSI+UmVzZXQ8L2J1dHRvbj4KICAgICAgICAgICAgICAgICAgICAgICAgPGJ1dHRvbiBjbGFzcz0iYnRuIGJ0bi1zbSBidG4tZGFuZ2VyIiBvbmNsaWNrPSJkZWxldGVVc2VyKCcke3UuaWR9JykiPkRlbDwvYnV0dG9uPgogICAgICAgICAgICAgICAgICAgIDwvdGQ+CiAgICAgICAgICAgICAgICA8L3RyPmA7CiAgICAgICAgICAgIH0pLmpvaW4oJycpOwogICAgICAgIH0KCiAgICAgICAgLy8gQWRkIC8gRWRpdCBTdWJzY3JpYmVyIE1vZGFscwogICAgICAgIGZ1bmN0aW9uIG9wZW5BZGRVc2VyTW9kYWwoKSB7CiAgICAgICAgICAgIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdtb2RhbC11c2VyLXRpdGxlJykudGV4dENvbnRlbnQgPSAnQWRkIE5ldyBTdWJzY3JpYmVyJzsKICAgICAgICAgICAgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ2Zvcm0tdXNlcicpLnJlc2V0KCk7CiAgICAgICAgICAgIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCd1c2VyLWVkaXQtaWQnKS52YWx1ZSA9ICcnOwogICAgICAgICAgICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnZm9ybS11c2VyLWNsZWFuLWlwJykudmFsdWUgPSAnd3d3LnNwZWVkdGVzdC5uZXQnOwogICAgICAgICAgICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnZm9ybS11c2VyLWZpbmFsLW1hc2snKS52YWx1ZSA9ICcnOwogICAgICAgICAgICBjb25zdCBhbHBuRWwgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnZm9ybS11c2VyLWFscG4nKTsKICAgICAgICAgICAgaWYgKGFscG5FbCkgYWxwbkVsLnZhbHVlID0gJyc7CiAgICAgICAgICAgIGNvbnN0IGluaGVyaXRSYWRpbyA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdlY2gtbW9kZS1pbmhlcml0Jyk7CiAgICAgICAgICAgIGlmIChpbmhlcml0UmFkaW8pIGluaGVyaXRSYWRpby5jaGVja2VkID0gdHJ1ZTsKICAgICAgICAgICAgY29uc3QgY3VzdG9tV3JhcCA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdmb3JtLXVzZXItZWNoLWN1c3RvbS13cmFwJyk7CiAgICAgICAgICAgIGlmIChjdXN0b21XcmFwKSBjdXN0b21XcmFwLmNsYXNzTGlzdC5hZGQoJ2hpZGRlbicpOwogICAgICAgICAgICBjb25zdCBlY2hMaXN0RWwgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnZm9ybS11c2VyLWVjaC1saXN0Jyk7CiAgICAgICAgICAgIGlmIChlY2hMaXN0RWwpIGVjaExpc3RFbC52YWx1ZSA9ICcnOwogICAgICAgICAgICBjb25zdCBwaXBFbCA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdmb3JtLXVzZXItcHJveHktaXAnKTsKICAgICAgICAgICAgaWYgKHBpcEVsKSBwaXBFbC52YWx1ZSA9ICcnOwogICAgICAgICAgICBjb25zdCBlblBpcEVsID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ2Zvcm0tdXNlci1lbmFibGUtcHJveHlpcCcpOwogICAgICAgICAgICBpZiAoZW5QaXBFbCkgZW5QaXBFbC5jaGVja2VkID0gdHJ1ZTsKICAgICAgICAgICAgdXBkYXRlVXNlclByb3h5SXBOb3RpY2UoKTsKICAgICAgICAgICAgdXBkYXRlU3Vic2NyaWJlckNvbmZpZ1ByZXZpZXcoKTsKICAgICAgICAgICAgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ21vZGFsLXVzZXInKS5jbGFzc0xpc3QuYWRkKCdvcGVuJyk7CiAgICAgICAgfQoKICAgICAgICBmdW5jdGlvbiBvcGVuRWRpdFVzZXJNb2RhbChpZCkgewogICAgICAgICAgICBjb25zdCB1c2VyID0gKHN0YXRlLnVzZXJzIHx8IFtdKS5maW5kKHUgPT4gdS5pZCA9PT0gaWQpOwogICAgICAgICAgICBpZiAoIXVzZXIpIHJldHVybjsKICAgICAgICAgICAgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ21vZGFsLXVzZXItdGl0bGUnKS50ZXh0Q29udGVudCA9ICdFZGl0IFN1YnNjcmliZXI6ICcgKyB1c2VyLm5hbWU7CiAgICAgICAgICAgIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCd1c2VyLWVkaXQtaWQnKS52YWx1ZSA9IHVzZXIuaWQ7CiAgICAgICAgICAgIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdmb3JtLXVzZXItbmFtZScpLnZhbHVlID0gdXNlci5uYW1lIHx8ICcnOwogICAgICAgICAgICBjb25zdCBsaW1pdEdiID0gdXNlci5saW1pdFRvdGFsUmVxID8gKCh1c2VyLmxpbWl0VG90YWxSZXEgKiA2MDAwKSAvIDEwNzM3NDE4MjQpLnRvRml4ZWQoMSkgOiAwOwogICAgICAgICAgICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnZm9ybS11c2VyLWxpbWl0LWdiJykudmFsdWUgPSBsaW1pdEdiOwogICAgICAgICAgICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnZm9ybS11c2VyLWV4cGlyeScpLnZhbHVlID0gdXNlci5leHBpcnlNcyA/IG5ldyBEYXRlKHVzZXIuZXhwaXJ5TXMpLnRvSVNPU3RyaW5nKCkuc3BsaXQoJ1QnKVswXSA6ICcnOwogICAgICAgICAgICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnZm9ybS11c2VyLWNsZWFuLWlwJykudmFsdWUgPSB1c2VyLmNsZWFuSXAgfHwgJ3d3dy5zcGVlZHRlc3QubmV0JzsKICAgICAgICAgICAgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ2Zvcm0tdXNlci1maW5hbC1tYXNrJykudmFsdWUgPSB1c2VyLmZpbmFsTWFzayB8fCAnJzsKICAgICAgICAgICAgY29uc3QgYWxwbkVsID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ2Zvcm0tdXNlci1hbHBuJyk7CiAgICAgICAgICAgIGlmIChhbHBuRWwpIGFscG5FbC52YWx1ZSA9IHVzZXIuYWxwbiB8fCAnJzsKCiAgICAgICAgICAgIGNvbnN0IGN1c3RvbVJhZGlvID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ2VjaC1tb2RlLWN1c3RvbScpOwogICAgICAgICAgICBjb25zdCBpbmhlcml0UmFkaW8gPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnZWNoLW1vZGUtaW5oZXJpdCcpOwogICAgICAgICAgICBjb25zdCBjdXN0b21XcmFwID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ2Zvcm0tdXNlci1lY2gtY3VzdG9tLXdyYXAnKTsKICAgICAgICAgICAgY29uc3QgZWNoTGlzdEVsID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ2Zvcm0tdXNlci1lY2gtbGlzdCcpOwoKICAgICAgICAgICAgaWYgKEFycmF5LmlzQXJyYXkodXNlci5lY2hDb25maWdMaXN0KSkgewogICAgICAgICAgICAgICAgaWYgKGN1c3RvbVJhZGlvKSBjdXN0b21SYWRpby5jaGVja2VkID0gdHJ1ZTsKICAgICAgICAgICAgICAgIGlmIChjdXN0b21XcmFwKSBjdXN0b21XcmFwLmNsYXNzTGlzdC5yZW1vdmUoJ2hpZGRlbicpOwogICAgICAgICAgICAgICAgaWYgKGVjaExpc3RFbCkgZWNoTGlzdEVsLnZhbHVlID0gdXNlci5lY2hDb25maWdMaXN0LmpvaW4oJ1xuJyk7CiAgICAgICAgICAgIH0gZWxzZSB7CiAgICAgICAgICAgICAgICBpZiAoaW5oZXJpdFJhZGlvKSBpbmhlcml0UmFkaW8uY2hlY2tlZCA9IHRydWU7CiAgICAgICAgICAgICAgICBpZiAoY3VzdG9tV3JhcCkgY3VzdG9tV3JhcC5jbGFzc0xpc3QuYWRkKCdoaWRkZW4nKTsKICAgICAgICAgICAgICAgIGlmIChlY2hMaXN0RWwpIGVjaExpc3RFbC52YWx1ZSA9ICcnOwogICAgICAgICAgICB9CgogICAgICAgICAgICBjb25zdCBlblBpcEVsID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ2Zvcm0tdXNlci1lbmFibGUtcHJveHlpcCcpOwogICAgICAgICAgICBpZiAoZW5QaXBFbCkgZW5QaXBFbC5jaGVja2VkID0gdXNlci5lbmFibGVQcm94eUlwICE9PSBmYWxzZTsKICAgICAgICAgICAgY29uc3QgcGlwRWwgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnZm9ybS11c2VyLXByb3h5LWlwJyk7CiAgICAgICAgICAgIGlmIChwaXBFbCkgcGlwRWwudmFsdWUgPSB1c2VyLnByb3h5SXAgfHwgJyc7CiAgICAgICAgICAgIHVwZGF0ZVVzZXJQcm94eUlwTm90aWNlKCk7CgogICAgICAgICAgICB1cGRhdGVTdWJzY3JpYmVyQ29uZmlnUHJldmlldygpOwogICAgICAgICAgICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnbW9kYWwtdXNlcicpLmNsYXNzTGlzdC5hZGQoJ29wZW4nKTsKICAgICAgICB9CgogICAgICAgIGZ1bmN0aW9uIGNsb3NlVXNlck1vZGFsKCkgewogICAgICAgICAgICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnbW9kYWwtdXNlcicpLmNsYXNzTGlzdC5yZW1vdmUoJ29wZW4nKTsKICAgICAgICB9CgogICAgICAgIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdmb3JtLXVzZXInKS5hZGRFdmVudExpc3RlbmVyKCdzdWJtaXQnLCBhc3luYyAoZSkgPT4gewogICAgICAgICAgICBlLnByZXZlbnREZWZhdWx0KCk7CiAgICAgICAgICAgIGNvbnN0IGVkaXRJZCA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCd1c2VyLWVkaXQtaWQnKS52YWx1ZTsKICAgICAgICAgICAgY29uc3QgbmFtZSA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdmb3JtLXVzZXItbmFtZScpLnZhbHVlLnRyaW0oKTsKICAgICAgICAgICAgY29uc3QgbGltaXRHYiA9IHBhcnNlRmxvYXQoZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ2Zvcm0tdXNlci1saW1pdC1nYicpLnZhbHVlKSB8fCAwOwogICAgICAgICAgICBjb25zdCBleHBpcnlTdHIgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnZm9ybS11c2VyLWV4cGlyeScpLnZhbHVlOwogICAgICAgICAgICBjb25zdCBjbGVhbklwID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ2Zvcm0tdXNlci1jbGVhbi1pcCcpLnZhbHVlLnRyaW0oKSB8fCAnd3d3LnNwZWVkdGVzdC5uZXQnOwogICAgICAgICAgICBjb25zdCBmaW5hbE1hc2sgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnZm9ybS11c2VyLWZpbmFsLW1hc2snKS52YWx1ZS50cmltKCk7CiAgICAgICAgICAgIGNvbnN0IGFscG4gPSAoZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ2Zvcm0tdXNlci1hbHBuJyk/LnZhbHVlIHx8ICcnKS50cmltKCk7CiAgICAgICAgICAgIGNvbnN0IGVuYWJsZVByb3h5SXAgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnZm9ybS11c2VyLWVuYWJsZS1wcm94eWlwJyk/LmNoZWNrZWQgPz8gdHJ1ZTsKICAgICAgICAgICAgY29uc3QgcHJveHlJcCA9IChkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnZm9ybS11c2VyLXByb3h5LWlwJyk/LnZhbHVlIHx8ICcnKS50cmltKCk7CgogICAgICAgICAgICBjb25zdCBpc0N1c3RvbUVjaCA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdlY2gtbW9kZS1jdXN0b20nKT8uY2hlY2tlZDsKICAgICAgICAgICAgY29uc3QgZWNoQ29uZmlnTGlzdCA9IGlzQ3VzdG9tRWNoCiAgICAgICAgICAgICAgICA/IChkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnZm9ybS11c2VyLWVjaC1saXN0JykudmFsdWUgfHwgJycpLnNwbGl0KCdcbicpLm1hcChzID0+IHMudHJpbSgpKS5maWx0ZXIoQm9vbGVhbikKICAgICAgICAgICAgICAgIDogbnVsbDsKCiAgICAgICAgICAgIGNvbnN0IGxpbWl0VG90YWxSZXEgPSBsaW1pdEdiID4gMCA/IE1hdGgucm91bmQoKGxpbWl0R2IgKiAxMDczNzQxODI0KSAvIDYwMDApIDogMDsKICAgICAgICAgICAgY29uc3QgZXhwaXJ5TXMgPSBleHBpcnlTdHIgPyBuZXcgRGF0ZShleHBpcnlTdHIpLmdldFRpbWUoKSA6IDA7CgogICAgICAgICAgICBjb25zdCBwYXlsb2FkID0gewogICAgICAgICAgICAgICAgbmFtZSwKICAgICAgICAgICAgICAgIGxpbWl0VG90YWxSZXEsCiAgICAgICAgICAgICAgICBleHBpcnlNcywKICAgICAgICAgICAgICAgIGNsZWFuSXAsCiAgICAgICAgICAgICAgICBmaW5hbE1hc2ssCiAgICAgICAgICAgICAgICBhbHBuOiBhbHBuIHx8IHVuZGVmaW5lZCwKICAgICAgICAgICAgICAgIGVjaENvbmZpZ0xpc3QsCiAgICAgICAgICAgICAgICBlbmFibGVQcm94eUlwLAogICAgICAgICAgICAgICAgcHJveHlJcCwKICAgICAgICAgICAgfTsKCiAgICAgICAgICAgIGNvbnN0IG1ldGhvZCA9IGVkaXRJZCA/ICdQVVQnIDogJ1BPU1QnOwogICAgICAgICAgICBjb25zdCBlbmRwb2ludCA9IGVkaXRJZCA/IGAvJHtzdGF0ZS5hcGlSb3V0ZX0vYXBpL3VzZXJzP2lkPSR7ZWRpdElkfWAgOiBgLyR7c3RhdGUuYXBpUm91dGV9L2FwaS91c2Vyc2A7CgogICAgICAgICAgICB0cnkgewogICAgICAgICAgICAgICAgY29uc3QgcmVzID0gYXdhaXQgZmV0Y2goZW5kcG9pbnQsIHsKICAgICAgICAgICAgICAgICAgICBtZXRob2QsCiAgICAgICAgICAgICAgICAgICAgaGVhZGVyczogewogICAgICAgICAgICAgICAgICAgICAgICAnQ29udGVudC1UeXBlJzogJ2FwcGxpY2F0aW9uL2pzb24nLAogICAgICAgICAgICAgICAgICAgICAgICAnQXV0aG9yaXphdGlvbic6ICdCZWFyZXIgJyArIHN0YXRlLm1hc3RlcktleQogICAgICAgICAgICAgICAgICAgIH0sCiAgICAgICAgICAgICAgICAgICAgYm9keTogSlNPTi5zdHJpbmdpZnkocGF5bG9hZCkKICAgICAgICAgICAgICAgIH0pOwogICAgICAgICAgICAgICAgY29uc3QgZGF0YSA9IGF3YWl0IHJlcy5qc29uKCk7CiAgICAgICAgICAgICAgICBpZiAoZGF0YS5zdWNjZXNzKSB7CiAgICAgICAgICAgICAgICAgICAgY2xvc2VVc2VyTW9kYWwoKTsKICAgICAgICAgICAgICAgICAgICBsb2FkU3Vic2NyaWJlcnMoKTsKICAgICAgICAgICAgICAgIH0gZWxzZSB7CiAgICAgICAgICAgICAgICAgICAgYWxlcnQoJ0Vycm9yOiAnICsgZGF0YS5lcnJvcik7CiAgICAgICAgICAgICAgICB9CiAgICAgICAgICAgIH0gY2F0Y2ggKGVycikgewogICAgICAgICAgICAgICAgYWxlcnQoJ1JlcXVlc3QgZmFpbGVkOiAnICsgZXJyLm1lc3NhZ2UpOwogICAgICAgICAgICB9CiAgICAgICAgfSk7CgogICAgICAgIGFzeW5jIGZ1bmN0aW9uIHRvZ2dsZVVzZXJQYXVzZShpZCkgewogICAgICAgICAgICBhd2FpdCBmZXRjaChgLyR7c3RhdGUuYXBpUm91dGV9L2FwaS91c2Vycz9pZD0ke2lkfSZhY3Rpb249dG9nZ2xlYCwgewogICAgICAgICAgICAgICAgbWV0aG9kOiAnUE9TVCcsCiAgICAgICAgICAgICAgICBoZWFkZXJzOiB7ICdBdXRob3JpemF0aW9uJzogJ0JlYXJlciAnICsgc3RhdGUubWFzdGVyS2V5IH0KICAgICAgICAgICAgfSk7CiAgICAgICAgICAgIGxvYWRTdWJzY3JpYmVycygpOwogICAgICAgIH0KCiAgICAgICAgYXN5bmMgZnVuY3Rpb24gcmVzZXRVc2VyVXNhZ2UoaWQpIHsKICAgICAgICAgICAgaWYgKCFjb25maXJtKCdSZXNldCBiYW5kd2lkdGggdXNhZ2UgY291bnRlcnMgZm9yIHRoaXMgc3Vic2NyaWJlcj8nKSkgcmV0dXJuOwogICAgICAgICAgICBhd2FpdCBmZXRjaChgLyR7c3RhdGUuYXBpUm91dGV9L2FwaS91c2Vycz9pZD0ke2lkfSZhY3Rpb249cmVzZXRgLCB7CiAgICAgICAgICAgICAgICBtZXRob2Q6ICdQT1NUJywKICAgICAgICAgICAgICAgIGhlYWRlcnM6IHsgJ0F1dGhvcml6YXRpb24nOiAnQmVhcmVyICcgKyBzdGF0ZS5tYXN0ZXJLZXkgfQogICAgICAgICAgICB9KTsKICAgICAgICAgICAgbG9hZFN1YnNjcmliZXJzKCk7CiAgICAgICAgfQoKICAgICAgICBhc3luYyBmdW5jdGlvbiBkZWxldGVVc2VyKGlkKSB7CiAgICAgICAgICAgIGlmICghY29uZmlybSgnUGVybWFuZW50bHkgZGVsZXRlIHRoaXMgc3Vic2NyaWJlcj8nKSkgcmV0dXJuOwogICAgICAgICAgICBhd2FpdCBmZXRjaChgLyR7c3RhdGUuYXBpUm91dGV9L2FwaS91c2Vycz9pZD0ke2lkfWAsIHsKICAgICAgICAgICAgICAgIG1ldGhvZDogJ0RFTEVURScsCiAgICAgICAgICAgICAgICBoZWFkZXJzOiB7ICdBdXRob3JpemF0aW9uJzogJ0JlYXJlciAnICsgc3RhdGUubWFzdGVyS2V5IH0KICAgICAgICAgICAgfSk7CiAgICAgICAgICAgIGxvYWRTdWJzY3JpYmVycygpOwogICAgICAgIH0KCiAgICAgICAgLy8gTGlua3MgRXhwb3J0IE1vZGFsCiAgICAgICAgZnVuY3Rpb24gc2hvd0xpbmtzTW9kYWwoaWQsIG5hbWUpIHsKICAgICAgICAgICAgY29uc3QgYmFzZSA9IGxvY2F0aW9uLm9yaWdpbjsKICAgICAgICAgICAgY29uc3Qgcm91dGUgPSBzdGF0ZS5jb25maWcuYXBpUm91dGUgfHwgc3RhdGUuYXBpUm91dGU7CiAgICAgICAgICAgIGNvbnN0IHN1YlBhcmFtID0gYHN1Yj0ke2VuY29kZVVSSUNvbXBvbmVudChuYW1lKX1gOwogICAgICAgICAgICBjb25zdCBwb3J0YWxQYXJhbSA9IGB1PSR7ZW5jb2RlVVJJQ29tcG9uZW50KG5hbWUpfWA7CgogICAgICAgICAgICBjb25zdCBsaW5rcyA9IFsKICAgICAgICAgICAgICAgIHsgbGFiZWw6ICdTaW5nLUJveCAxLjkrIEpTT04nLCB1cmw6IGAke2Jhc2V9LyR7cm91dGV9P2ZsYWc9c2luZ2JveCYke3N1YlBhcmFtfWAgfSwKICAgICAgICAgICAgICAgIHsgbGFiZWw6ICdDbGFzaCAvIE1paG9tbyBZQU1MJywgdXJsOiBgJHtiYXNlfS8ke3JvdXRlfT9mbGFnPWNsYXNoJiR7c3ViUGFyYW19YCB9LAogICAgICAgICAgICAgICAgeyBsYWJlbDogJ1hyYXkgLyBWMlJheSBKU09OJywgdXJsOiBgJHtiYXNlfS8ke3JvdXRlfT9mbGFnPXYycmF5JiR7c3ViUGFyYW19YCB9LAogICAgICAgICAgICAgICAgeyBsYWJlbDogJ1dpcmVHdWFyZCAvIEFXRyBDT05GJywgdXJsOiBgJHtiYXNlfS8ke3JvdXRlfT9mbGFnPXdpcmVndWFyZCYke3N1YlBhcmFtfWAgfSwKICAgICAgICAgICAgICAgIHsgbGFiZWw6ICdSYXcgUGxhaW50ZXh0IFVSSScsIHVybDogYCR7YmFzZX0vJHtyb3V0ZX0/ZmxhZz1yYXcmJHtzdWJQYXJhbX1gIH0sCiAgICAgICAgICAgICAgICB7IGxhYmVsOiAnU3Vic2NyaWJlciBXZWIgUG9ydGFsJywgdXJsOiBgJHtiYXNlfS8ke3JvdXRlfT8ke3BvcnRhbFBhcmFtfWAgfSwKICAgICAgICAgICAgXTsKCiAgICAgICAgICAgIGNvbnN0IGh0bWwgPSBsaW5rcy5tYXAobCA9PiBgCiAgICAgICAgICAgICAgICA8ZGl2IHN0eWxlPSJiYWNrZ3JvdW5kOnZhcigtLWJnLWlucHV0KTsgcGFkZGluZzogMTBweDsgYm9yZGVyLXJhZGl1czogdmFyKC0tcmFkaXVzLW1kKTsgYm9yZGVyOiAxcHggc29saWQgdmFyKC0tYm9yZGVyLWNvbG9yKTsiPgogICAgICAgICAgICAgICAgICAgIDxkaXYgc3R5bGU9ImZvbnQtd2VpZ2h0OjYwMDsgZm9udC1zaXplOjAuOHJlbTsgY29sb3I6dmFyKC0tdGV4dC1tdXRlZCk7IG1hcmdpbi1ib3R0b206IDRweDsiPiR7bC5sYWJlbH08L2Rpdj4KICAgICAgICAgICAgICAgICAgICA8ZGl2IHN0eWxlPSJkaXNwbGF5OmZsZXg7IGdhcDogOHB4OyI+CiAgICAgICAgICAgICAgICAgICAgICAgIDxpbnB1dCB0eXBlPSJ0ZXh0IiByZWFkb25seSB2YWx1ZT0iJHtsLnVybH0iIGNsYXNzPSJpbnB1dCIgc3R5bGU9ImZvbnQtc2l6ZTowLjc4cmVtOyBwYWRkaW5nOiA1cHggOHB4OyI+CiAgICAgICAgICAgICAgICAgICAgICAgIDxidXR0b24gY2xhc3M9ImJ0biBidG4tc20gYnRuLXNlY29uZGFyeSIgb25jbGljaz0iY29weVRleHQoJyR7bC51cmx9JywgdGhpcykiPkNvcHk8L2J1dHRvbj4KICAgICAgICAgICAgICAgICAgICA8L2Rpdj4KICAgICAgICAgICAgICAgIDwvZGl2PgogICAgICAgICAgICBgKS5qb2luKCcnKTsKCiAgICAgICAgICAgIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdtb2RhbC1saW5rcy1jb250ZW50JykuaW5uZXJIVE1MID0gaHRtbDsKICAgICAgICAgICAgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ21vZGFsLWxpbmtzJykuY2xhc3NMaXN0LmFkZCgnb3BlbicpOwogICAgICAgIH0KICAgICAgICBmdW5jdGlvbiBjbG9zZUxpbmtzTW9kYWwoKSB7CiAgICAgICAgICAgIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdtb2RhbC1saW5rcycpLmNsYXNzTGlzdC5yZW1vdmUoJ29wZW4nKTsKICAgICAgICB9CgogICAgICAgIGZ1bmN0aW9uIGNvcHlUZXh0KHRleHQsIGJ0bikgewogICAgICAgICAgICBuYXZpZ2F0b3IuY2xpcGJvYXJkLndyaXRlVGV4dCh0ZXh0KS50aGVuKCgpID0+IHsKICAgICAgICAgICAgICAgIGNvbnN0IHByZXYgPSBidG4udGV4dENvbnRlbnQ7CiAgICAgICAgICAgICAgICBidG4udGV4dENvbnRlbnQgPSAnQ29waWVkISc7CiAgICAgICAgICAgICAgICBzZXRUaW1lb3V0KCgpID0+IGJ0bi50ZXh0Q29udGVudCA9IHByZXYsIDE1MDApOwogICAgICAgICAgICB9KTsKICAgICAgICB9CgogICAgICAgIC8vIFN5c3RlbSBDb25maWd1cmF0aW9uIFZpZXcKICAgICAgICBmdW5jdGlvbiBwb3B1bGF0ZVNldHRpbmdzKGNmZykgewogICAgICAgICAgICBpZiAoIWNmZykgcmV0dXJuOwogICAgICAgICAgICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnY2ZnLWFwaS1yb3V0ZScpLnZhbHVlID0gY2ZnLmFwaVJvdXRlIHx8ICdzeW5jJzsKICAgICAgICAgICAgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ2NmZy1tb2RlJykudmFsdWUgPSBjZmcubW9kZSB8fCAnYWxwaGEnOwogICAgICAgICAgICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnY2ZnLWN1c3RvbS1kbnMnKS52YWx1ZSA9IGNmZy5jdXN0b21EbnMgfHwgJ2h0dHBzOi8vY2xvdWRmbGFyZS1kbnMuY29tL2Rucy1xdWVyeSc7CiAgICAgICAgICAgIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdjZmctY2xlYW4taXBzJykudmFsdWUgPSBjZmcuY2xlYW5JcHMgfHwgJyc7CiAgICAgICAgICAgIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdjZmctYmFja3VwLXJlbGF5JykudmFsdWUgPSBjZmcuYmFja3VwUmVsYXkgfHwgY2ZnLmN1c3RvbVJlbGF5IHx8ICcnOwogICAgICAgICAgICBjb25zdCBhbHBuRWwgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnY2ZnLWFscG4nKTsKICAgICAgICAgICAgaWYgKGFscG5FbCkgYWxwbkVsLnZhbHVlID0gY2ZnLmFscG4gfHwgJyc7CiAgICAgICAgICAgIGNvbnN0IGZpbmFsTWFza0VsID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ2NmZy1maW5hbC1tYXNrJyk7CiAgICAgICAgICAgIGlmIChmaW5hbE1hc2tFbCkgZmluYWxNYXNrRWwudmFsdWUgPSBjZmcuZmluYWxNYXNrIHx8ICcnOwogICAgICAgICAgICBjb25zdCBlY2hMaXN0RWwgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnY2ZnLWVjaC1saXN0Jyk7CiAgICAgICAgICAgIGlmIChlY2hMaXN0RWwpIHsKICAgICAgICAgICAgICAgIGNvbnN0IGVjaExpc3QgPSBBcnJheS5pc0FycmF5KGNmZy5lY2hDb25maWdMaXN0KSA/IGNmZy5lY2hDb25maWdMaXN0IDogREVGQVVMVF9FQ0hfQ09ORklHUzsKICAgICAgICAgICAgICAgIGVjaExpc3RFbC52YWx1ZSA9IGVjaExpc3Quam9pbignXG4nKTsKICAgICAgICAgICAgICAgIHVwZGF0ZUdsb2JhbEVjaENvdW50KCk7CiAgICAgICAgICAgIH0KCiAgICAgICAgICAgIGlmIChjZmcuZW5hYmxlUHJveHlJcCAhPT0gdW5kZWZpbmVkKSB7CiAgICAgICAgICAgICAgICBjb25zdCBlbkVsID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ2NmZy1lbmFibGUtcHJveHlpcCcpOwogICAgICAgICAgICAgICAgaWYgKGVuRWwpIGVuRWwuY2hlY2tlZCA9IEJvb2xlYW4oY2ZnLmVuYWJsZVByb3h5SXApOwogICAgICAgICAgICB9CiAgICAgICAgICAgIGNvbnN0IG1vZGUgPSBjZmcucHJveHlJcE1vZGUgfHwgJ2J1aWx0aW4nOwogICAgICAgICAgICBpZiAobW9kZSA9PT0gJ2N1c3RvbScpIHsKICAgICAgICAgICAgICAgIGNvbnN0IGN1c3RvbVIgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgncHJveHlpcC1tb2RlLWN1c3RvbScpOwogICAgICAgICAgICAgICAgaWYgKGN1c3RvbVIpIGN1c3RvbVIuY2hlY2tlZCA9IHRydWU7CiAgICAgICAgICAgIH0gZWxzZSB7CiAgICAgICAgICAgICAgICBjb25zdCBidWlsdGluUiA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdwcm94eWlwLW1vZGUtYnVpbHRpbicpOwogICAgICAgICAgICAgICAgaWYgKGJ1aWx0aW5SKSBidWlsdGluUi5jaGVja2VkID0gdHJ1ZTsKICAgICAgICAgICAgfQogICAgICAgICAgICBjb25zdCBwb29sRWwgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnY2ZnLXByb3h5aXAtcG9vbCcpOwogICAgICAgICAgICBpZiAocG9vbEVsKSB7CiAgICAgICAgICAgICAgICBpZiAoQXJyYXkuaXNBcnJheShjZmcucHJveHlJcFBvb2wpICYmIGNmZy5wcm94eUlwUG9vbC5sZW5ndGggPiAwKSB7CiAgICAgICAgICAgICAgICAgICAgcG9vbEVsLnZhbHVlID0gY2ZnLnByb3h5SXBQb29sLmpvaW4oJ1xuJyk7CiAgICAgICAgICAgICAgICB9IGVsc2UgaWYgKHR5cGVvZiBjZmcucHJveHlJcFBvb2wgPT09ICdzdHJpbmcnICYmIGNmZy5wcm94eUlwUG9vbC50cmltKCkpIHsKICAgICAgICAgICAgICAgICAgICBwb29sRWwudmFsdWUgPSBjZmcucHJveHlJcFBvb2wudHJpbSgpOwogICAgICAgICAgICAgICAgfSBlbHNlIHsKICAgICAgICAgICAgICAgICAgICBwb29sRWwudmFsdWUgPSBERUZBVUxUX0JVSUxUSU5fUFJPWFlfSVBTLmpvaW4oJ1xuJyk7CiAgICAgICAgICAgICAgICB9CiAgICAgICAgICAgIH0KICAgICAgICAgICAgb25Qcm94eUlwTW9kZUNoYW5nZSgpOwogICAgICAgIH0KCiAgICAgICAgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ3NldHRpbmdzLWZvcm0nKS5hZGRFdmVudExpc3RlbmVyKCdzdWJtaXQnLCBhc3luYyAoZSkgPT4gewogICAgICAgICAgICBlLnByZXZlbnREZWZhdWx0KCk7CiAgICAgICAgICAgIGNvbnN0IGtleUlucHV0ID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ2NmZy1tYXN0ZXIta2V5Jyk7CiAgICAgICAgICAgIGNvbnN0IHJhd05ld0tleSA9IGtleUlucHV0ID8ga2V5SW5wdXQudmFsdWUudHJpbSgpIDogJyc7CiAgICAgICAgICAgIGNvbnN0IGlzS2V5Um90YXRpb24gPSBCb29sZWFuKHJhd05ld0tleSAmJiByYXdOZXdLZXkgIT09IHN0YXRlLm1hc3RlcktleSk7CgogICAgICAgICAgICBjb25zdCBwYXlsb2FkID0gewogICAgICAgICAgICAgICAgLi4uc3RhdGUuY29uZmlnLAogICAgICAgICAgICAgICAgYXBpUm91dGU6IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdjZmctYXBpLXJvdXRlJykudmFsdWUudHJpbSgpIHx8ICdzeW5jJywKICAgICAgICAgICAgICAgIG1vZGU6IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdjZmctbW9kZScpLnZhbHVlLAogICAgICAgICAgICAgICAgY3VzdG9tRG5zOiBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnY2ZnLWN1c3RvbS1kbnMnKS52YWx1ZS50cmltKCksCiAgICAgICAgICAgICAgICBjbGVhbklwczogZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ2NmZy1jbGVhbi1pcHMnKS52YWx1ZS50cmltKCksCiAgICAgICAgICAgICAgICBiYWNrdXBSZWxheTogZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ2NmZy1iYWNrdXAtcmVsYXknKS52YWx1ZS50cmltKCksCiAgICAgICAgICAgICAgICBhbHBuOiAoZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ2NmZy1hbHBuJyk/LnZhbHVlIHx8ICcnKS50cmltKCksCiAgICAgICAgICAgICAgICBmaW5hbE1hc2s6IChkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnY2ZnLWZpbmFsLW1hc2snKT8udmFsdWUgfHwgJycpLnRyaW0oKSwKICAgICAgICAgICAgICAgIGVuYWJsZVByb3h5SXA6IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdjZmctZW5hYmxlLXByb3h5aXAnKT8uY2hlY2tlZCA/PyB0cnVlLAogICAgICAgICAgICAgICAgcHJveHlJcE1vZGU6IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdwcm94eWlwLW1vZGUtY3VzdG9tJyk/LmNoZWNrZWQgPyAnY3VzdG9tJyA6ICdidWlsdGluJywKICAgICAgICAgICAgICAgIHByb3h5SXBQb29sOiAoZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ2NmZy1wcm94eWlwLXBvb2wnKT8udmFsdWUgfHwgJycpCiAgICAgICAgICAgICAgICAgICAgLnNwbGl0KC9bXHJcbiw7XSsvKQogICAgICAgICAgICAgICAgICAgIC5tYXAocyA9PiBzLnRyaW0oKSkKICAgICAgICAgICAgICAgICAgICAuZmlsdGVyKEJvb2xlYW4pLAogICAgICAgICAgICAgICAgZWNoQ29uZmlnTGlzdDogKGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdjZmctZWNoLWxpc3QnKT8udmFsdWUgfHwgJycpCiAgICAgICAgICAgICAgICAgICAgLnNwbGl0KCdcbicpCiAgICAgICAgICAgICAgICAgICAgLm1hcChzID0+IHMudHJpbSgpKQogICAgICAgICAgICAgICAgICAgIC5maWx0ZXIoQm9vbGVhbiksCiAgICAgICAgICAgIH07CgogICAgICAgICAgICBpZiAoaXNLZXlSb3RhdGlvbikgewogICAgICAgICAgICAgICAgcGF5bG9hZC5tYXN0ZXJLZXkgPSByYXdOZXdLZXk7CiAgICAgICAgICAgIH0gZWxzZSB7CiAgICAgICAgICAgICAgICBkZWxldGUgcGF5bG9hZC5tYXN0ZXJLZXk7CiAgICAgICAgICAgIH0KCiAgICAgICAgICAgIHRyeSB7CiAgICAgICAgICAgICAgICBjb25zdCByZXMgPSBhd2FpdCBmZXRjaChgLyR7c3RhdGUuYXBpUm91dGV9L2FwaS9zeW5jYCwgewogICAgICAgICAgICAgICAgICAgIG1ldGhvZDogJ1BPU1QnLAogICAgICAgICAgICAgICAgICAgIGhlYWRlcnM6IHsKICAgICAgICAgICAgICAgICAgICAgICAgJ0NvbnRlbnQtVHlwZSc6ICdhcHBsaWNhdGlvbi9qc29uJywKICAgICAgICAgICAgICAgICAgICAgICAgJ0F1dGhvcml6YXRpb24nOiAnQmVhcmVyICcgKyBzdGF0ZS5tYXN0ZXJLZXkKICAgICAgICAgICAgICAgICAgICB9LAogICAgICAgICAgICAgICAgICAgIGJvZHk6IEpTT04uc3RyaW5naWZ5KHsga2V5OiBzdGF0ZS5tYXN0ZXJLZXksIGNvbmZpZzogcGF5bG9hZCB9KQogICAgICAgICAgICAgICAgfSk7CiAgICAgICAgICAgICAgICBjb25zdCBkYXRhID0gYXdhaXQgcmVzLmpzb24oKTsKICAgICAgICAgICAgICAgIGlmIChkYXRhLnN1Y2Nlc3MpIHsKICAgICAgICAgICAgICAgICAgICBhbGVydCgnU3lzdGVtIGNvbmZpZ3VyYXRpb24gdXBkYXRlZCBzdWNjZXNzZnVsbHkuJyk7CiAgICAgICAgICAgICAgICAgICAgaWYgKGlzS2V5Um90YXRpb24pIHsKICAgICAgICAgICAgICAgICAgICAgICAgc3RhdGUubWFzdGVyS2V5ID0gcmF3TmV3S2V5OwogICAgICAgICAgICAgICAgICAgICAgICBsb2NhbFN0b3JhZ2Uuc2V0SXRlbSgnbHVjaV9zZXNzaW9uJywgSlNPTi5zdHJpbmdpZnkoeyBrZXk6IHJhd05ld0tleSwgdHM6IERhdGUubm93KCkgfSkpOwogICAgICAgICAgICAgICAgICAgIH0KICAgICAgICAgICAgICAgICAgICBpZiAoa2V5SW5wdXQpIGtleUlucHV0LnZhbHVlID0gJyc7CiAgICAgICAgICAgICAgICAgICAgc3RhdGUuY29uZmlnID0gZGF0YS5jb25maWcgfHwgcGF5bG9hZDsKCiAgICAgICAgICAgICAgICAgICAgY29uc3Qgc3ViUm91dGVEaXNwbGF5ID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ25vZGUtc3ViLXJvdXRlJyk7CiAgICAgICAgICAgICAgICAgICAgaWYgKHN1YlJvdXRlRGlzcGxheSkgewogICAgICAgICAgICAgICAgICAgICAgICBzdWJSb3V0ZURpc3BsYXkudGV4dENvbnRlbnQgPSAnLycgKyAoc3RhdGUuY29uZmlnLmFwaVJvdXRlIHx8IHN0YXRlLmFwaVJvdXRlKTsKICAgICAgICAgICAgICAgICAgICB9CiAgICAgICAgICAgICAgICAgICAgdXBkYXRlR2xvYmFsRWNoQ291bnQoKTsKICAgICAgICAgICAgICAgICAgICB1cGRhdGVTdWJzY3JpYmVyQ29uZmlnUHJldmlldygpOwogICAgICAgICAgICAgICAgfSBlbHNlIHsKICAgICAgICAgICAgICAgICAgICBhbGVydCgnU2F2ZSBmYWlsZWQ6ICcgKyBkYXRhLmVycm9yKTsKICAgICAgICAgICAgICAgIH0KICAgICAgICAgICAgfSBjYXRjaCAoZXJyKSB7CiAgICAgICAgICAgICAgICBhbGVydCgnU2F2ZSBmYWlsZWQ6ICcgKyBlcnIubWVzc2FnZSk7CiAgICAgICAgICAgIH0KICAgICAgICB9KTsKCiAgICAgICAgZnVuY3Rpb24gZXhwb3J0U2hhcmVkU2V0dGluZ3MoKSB7CiAgICAgICAgICAgIHdpbmRvdy5vcGVuKGAvJHtzdGF0ZS5hcGlSb3V0ZX0vc2hhcmUtc2V0dGluZ3NgLCAnX2JsYW5rJyk7CiAgICAgICAgfQoKICAgICAgICAvLyBEaWFnbm9zdGljcyBWaWV3CiAgICAgICAgYXN5bmMgZnVuY3Rpb24gcnVuUHJveHlJcFByb2JlKCkgewogICAgICAgICAgICBjb25zdCB0YXJnZXRJbnB1dCA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdkaWFnLXRhcmdldC1pcCcpOwogICAgICAgICAgICBjb25zdCB0YXJnZXQgPSAodGFyZ2V0SW5wdXQ/LnZhbHVlIHx8ICcnKS50cmltKCk7CiAgICAgICAgICAgIGNvbnN0IHJlc0NvbnNvbGUgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnZGlhZy1yZXN1bHRzJyk7CiAgICAgICAgICAgIGlmICghdGFyZ2V0KSB7CiAgICAgICAgICAgICAgICByZXNDb25zb2xlLnRleHRDb250ZW50ID0gJ1BsZWFzZSBlbnRlciBhbiBJUCBvciBob3N0bmFtZS4nOwogICAgICAgICAgICAgICAgcmV0dXJuOwogICAgICAgICAgICB9CiAgICAgICAgICAgIHJlc0NvbnNvbGUudGV4dENvbnRlbnQgPSBgUHJvYmluZyAke3RhcmdldH06NDQzIGFjcm9zcyA1IFRDUCBjb25uZWN0aW9ucy4uLlxuUGxlYXNlIHdhaXQuLi5gOwoKICAgICAgICAgICAgY29uc3QgY29udHJvbGxlciA9IG5ldyBBYm9ydENvbnRyb2xsZXIoKTsKICAgICAgICAgICAgY29uc3QgdGltZW91dElkID0gc2V0VGltZW91dCgoKSA9PiBjb250cm9sbGVyLmFib3J0KCksIDIwMDAwKTsKCiAgICAgICAgICAgIHRyeSB7CiAgICAgICAgICAgICAgICBjb25zdCByZXMgPSBhd2FpdCBmZXRjaChgLyR7c3RhdGUuYXBpUm91dGV9L2FwaS9wcm94eS1pcC90ZXN0P3RhcmdldD0ke2VuY29kZVVSSUNvbXBvbmVudCh0YXJnZXQpfSZhdHRlbXB0cz01YCwgewogICAgICAgICAgICAgICAgICAgIGhlYWRlcnM6IHsgJ0F1dGhvcml6YXRpb24nOiAnQmVhcmVyICcgKyBzdGF0ZS5tYXN0ZXJLZXkgfSwKICAgICAgICAgICAgICAgICAgICBzaWduYWw6IGNvbnRyb2xsZXIuc2lnbmFsCiAgICAgICAgICAgICAgICB9KTsKICAgICAgICAgICAgICAgIGNsZWFyVGltZW91dCh0aW1lb3V0SWQpOwoKICAgICAgICAgICAgICAgIGNvbnN0IHJhd1RleHQgPSBhd2FpdCByZXMudGV4dCgpOwogICAgICAgICAgICAgICAgbGV0IGRhdGEgPSBudWxsOwogICAgICAgICAgICAgICAgdHJ5IHsKICAgICAgICAgICAgICAgICAgICBkYXRhID0gSlNPTi5wYXJzZShyYXdUZXh0KTsKICAgICAgICAgICAgICAgIH0gY2F0Y2ggKHBhcnNlRXJyKSB7CiAgICAgICAgICAgICAgICAgICAgcmVzQ29uc29sZS50ZXh0Q29udGVudCA9IGBIVFRQICR7cmVzLnN0YXR1c30gJHtyZXMuc3RhdHVzVGV4dH1cbkNvbnRlbnQtVHlwZTogJHtyZXMuaGVhZGVycy5nZXQoJ2NvbnRlbnQtdHlwZScpIHx8ICd1bmtub3duJ31cblxuU2VydmVyIHJldHVybmVkIG5vbi1KU09OIHJlc3BvbnNlOlxuJHtyYXdUZXh0LnNsaWNlKDAsIDE1MDApfWA7CiAgICAgICAgICAgICAgICAgICAgcmV0dXJuOwogICAgICAgICAgICAgICAgfQoKICAgICAgICAgICAgICAgIGlmICghcmVzLm9rICYmICFkYXRhLmRhdGEgJiYgIWRhdGEuYXR0ZW1wdHMpIHsKICAgICAgICAgICAgICAgICAgICByZXNDb25zb2xlLnRleHRDb250ZW50ID0gYFtIVFRQICR7cmVzLnN0YXR1c31dIFByb2JlIGZhaWxlZDpcbiR7ZGF0YS5lcnJvciB8fCBkYXRhLm1lc3NhZ2UgfHwgSlNPTi5zdHJpbmdpZnkoZGF0YSwgbnVsbCwgMil9YDsKICAgICAgICAgICAgICAgICAgICByZXR1cm47CiAgICAgICAgICAgICAgICB9CgogICAgICAgICAgICAgICAgY29uc3QgaXNSZWFjaGFibGUgPSBCb29sZWFuKGRhdGEub2sgfHwgZGF0YS5zdWNjZXNzKTsKICAgICAgICAgICAgICAgIGNvbnN0IHN0YXR1c1N5bWJvbCA9IGlzUmVhY2hhYmxlID8gJ+KchSBSRUFDSEFCTEUnIDogJ+KdjCBVTlJFQUNIQUJMRSc7CiAgICAgICAgICAgICAgICBjb25zdCBhdmdMYXRlbmN5ID0gZGF0YS5sYXRlbmN5X21zICE9PSBudWxsICYmIGRhdGEubGF0ZW5jeV9tcyAhPT0gdW5kZWZpbmVkCiAgICAgICAgICAgICAgICAgICAgPyBgJHtkYXRhLmxhdGVuY3lfbXN9bXNgCiAgICAgICAgICAgICAgICAgICAgOiAoZGF0YS5kYXRhPy5hdmdMYXRlbmN5TXMgPyBgJHtkYXRhLmRhdGEuYXZnTGF0ZW5jeU1zfW1zYCA6ICdOL0EnKTsKICAgICAgICAgICAgICAgIGNvbnN0IHN1Y2Nlc3NSYXRlID0gZGF0YS5kYXRhPy5zdWNjZXNzUmF0ZSB8fCAoZGF0YS5zdGF0dXMgPyBkYXRhLnN0YXR1cyA6ICdOL0EnKTsKCiAgICAgICAgICAgICAgICBsZXQgb3V0cHV0ID0gYD09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09XG5gOwogICAgICAgICAgICAgICAgb3V0cHV0ICs9IGAgIFRDUCBQUk9YWS1JUCBQUk9CRSBSRVNVTFRTXG5gOwogICAgICAgICAgICAgICAgb3V0cHV0ICs9IGA9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PVxuYDsKICAgICAgICAgICAgICAgIG91dHB1dCArPSBgVGFyZ2V0IERlc3RpbmF0aW9uIDogJHtkYXRhLmlwIHx8IHRhcmdldH06NDQzXG5gOwogICAgICAgICAgICAgICAgb3V0cHV0ICs9IGBPdmVyYWxsIFN0YXR1cyAgICAgOiAke3N0YXR1c1N5bWJvbH1cbmA7CiAgICAgICAgICAgICAgICBvdXRwdXQgKz0gYEF2ZXJhZ2UgTGF0ZW5jeSAgICA6ICR7YXZnTGF0ZW5jeX1cbmA7CiAgICAgICAgICAgICAgICBvdXRwdXQgKz0gYFN1Y2Nlc3MgUmF0ZSAgICAgICA6ICR7c3VjY2Vzc1JhdGV9XG5gOwogICAgICAgICAgICAgICAgb3V0cHV0ICs9IGBNZXNzYWdlICAgICAgICAgICAgOiAke2RhdGEubWVzc2FnZSB8fCAoaXNSZWFjaGFibGUgPyAnT0snIDogJ0ZhaWxlZCcpfVxuXG5gOwoKICAgICAgICAgICAgICAgIGNvbnN0IGF0dGVtcHRzID0gZGF0YS5kYXRhPy5hdHRlbXB0cyB8fCBbXTsKICAgICAgICAgICAgICAgIGlmIChBcnJheS5pc0FycmF5KGF0dGVtcHRzKSAmJiBhdHRlbXB0cy5sZW5ndGggPiAwKSB7CiAgICAgICAgICAgICAgICAgICAgb3V0cHV0ICs9IGBJbmRpdmlkdWFsIENvbm5lY3Rpb24gQXR0ZW1wdHM6XG5gOwogICAgICAgICAgICAgICAgICAgIGF0dGVtcHRzLmZvckVhY2goYSA9PiB7CiAgICAgICAgICAgICAgICAgICAgICAgIGNvbnN0IG1hcmsgPSBhLm9rID8gJ+KckyBPSyAgJyA6ICfinJcgRkFJTCc7CiAgICAgICAgICAgICAgICAgICAgICAgIG91dHB1dCArPSBgICBbQXR0ZW1wdCAke2EuYXR0ZW1wdH1dICR7bWFya30gICgke2EuZWxhcHNlZE1zfW1zKVxuYDsKICAgICAgICAgICAgICAgICAgICB9KTsKICAgICAgICAgICAgICAgICAgICBvdXRwdXQgKz0gJ1xuJzsKICAgICAgICAgICAgICAgIH0KCiAgICAgICAgICAgICAgICBvdXRwdXQgKz0gYFJhdyBSZXNwb25zZSBEYXRhOlxuJHtKU09OLnN0cmluZ2lmeShkYXRhLCBudWxsLCAyKX1gOwogICAgICAgICAgICAgICAgcmVzQ29uc29sZS50ZXh0Q29udGVudCA9IG91dHB1dDsKICAgICAgICAgICAgfSBjYXRjaCAoZXJyKSB7CiAgICAgICAgICAgICAgICBjbGVhclRpbWVvdXQodGltZW91dElkKTsKICAgICAgICAgICAgICAgIGlmIChlcnIubmFtZSA9PT0gJ0Fib3J0RXJyb3InKSB7CiAgICAgICAgICAgICAgICAgICAgcmVzQ29uc29sZS50ZXh0Q29udGVudCA9IGBQcm9iZSB0aW1lZCBvdXQgYWZ0ZXIgMjAgc2Vjb25kcy4gVGhlIHRhcmdldCBlbmRwb2ludCAoJHt0YXJnZXR9OjQ0MykgZGlkIG5vdCByZXNwb25kLmA7CiAgICAgICAgICAgICAgICB9IGVsc2UgewogICAgICAgICAgICAgICAgICAgIHJlc0NvbnNvbGUudGV4dENvbnRlbnQgPSBgTmV0d29yayAvIFByb2JlIEVycm9yOiAke2Vyci5tZXNzYWdlfWA7CiAgICAgICAgICAgICAgICB9CiAgICAgICAgICAgIH0KICAgICAgICB9CgogICAgICAgIC8vIExvZ3MgVmlldwogICAgICAgIGFzeW5jIGZ1bmN0aW9uIGxvYWRBdWRpdExvZ3MoKSB7CiAgICAgICAgICAgIGNvbnN0IGNvbnNvbGVFbGVtID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ2F1ZGl0LWxvZ3MtY29uc29sZScpOwogICAgICAgICAgICBjb25zb2xlRWxlbS50ZXh0Q29udGVudCA9ICdMb2FkaW5nIGFjdGl2aXR5IHJlY29yZHMuLi4nOwogICAgICAgICAgICB0cnkgewogICAgICAgICAgICAgICAgY29uc3QgcmVzID0gYXdhaXQgZmV0Y2goYC8ke3N0YXRlLmFwaVJvdXRlfS9hcGkvbG9nc2AsIHsKICAgICAgICAgICAgICAgICAgICBoZWFkZXJzOiB7ICdBdXRob3JpemF0aW9uJzogJ0JlYXJlciAnICsgc3RhdGUubWFzdGVyS2V5IH0KICAgICAgICAgICAgICAgIH0pOwogICAgICAgICAgICAgICAgY29uc3QgZGF0YSA9IGF3YWl0IHJlcy5qc29uKCk7CiAgICAgICAgICAgICAgICBpZiAoQXJyYXkuaXNBcnJheShkYXRhLmxvZ3MpICYmIGRhdGEubG9ncy5sZW5ndGggPiAwKSB7CiAgICAgICAgICAgICAgICAgICAgY29uc29sZUVsZW0udGV4dENvbnRlbnQgPSBkYXRhLmxvZ3MubWFwKGwgPT4KICAgICAgICAgICAgICAgICAgICAgICAgYFske25ldyBEYXRlKGwudHMpLnRvTG9jYWxlVGltZVN0cmluZygpfV0gJHtsLnR5cGUudG9VcHBlckNhc2UoKX06ICR7bC5kZXRhaWx9YAogICAgICAgICAgICAgICAgICAgICkuam9pbignXG4nKTsKICAgICAgICAgICAgICAgIH0gZWxzZSB7CiAgICAgICAgICAgICAgICAgICAgY29uc29sZUVsZW0udGV4dENvbnRlbnQgPSAnTm8gYXVkaXQgcmVjb3JkcyBsb2dnZWQgeWV0Lic7CiAgICAgICAgICAgICAgICB9CiAgICAgICAgICAgIH0gY2F0Y2ggKGVycikgewogICAgICAgICAgICAgICAgY29uc29sZUVsZW0udGV4dENvbnRlbnQgPSAnRmFpbGVkIHRvIGxvYWQgbG9nczogJyArIGVyci5tZXNzYWdlOwogICAgICAgICAgICB9CiAgICAgICAgfQoKICAgICAgICBhc3luYyBmdW5jdGlvbiBjbGVhckF1ZGl0TG9ncygpIHsKICAgICAgICAgICAgaWYgKCFjb25maXJtKCdDbGVhciBhbGwgYXVkaXQgYWN0aXZpdHkgcmVjb3Jkcz8nKSkgcmV0dXJuOwogICAgICAgICAgICBhd2FpdCBmZXRjaChgLyR7c3RhdGUuYXBpUm91dGV9L2FwaS9sb2dzYCwgewogICAgICAgICAgICAgICAgbWV0aG9kOiAnREVMRVRFJywKICAgICAgICAgICAgICAgIGhlYWRlcnM6IHsgJ0F1dGhvcml6YXRpb24nOiAnQmVhcmVyICcgKyBzdGF0ZS5tYXN0ZXJLZXkgfQogICAgICAgICAgICB9KTsKICAgICAgICAgICAgbG9hZEF1ZGl0TG9ncygpOwogICAgICAgIH0KCiAgICAgICAgZnVuY3Rpb24gZXNjYXBlSHRtbChzdHIpIHsKICAgICAgICAgICAgcmV0dXJuIFN0cmluZyhzdHIgfHwgJycpLnJlcGxhY2UoLyYvZywgJyZhbXA7JykucmVwbGFjZSgvPC9nLCAnJmx0OycpLnJlcGxhY2UoLz4vZywgJyZndDsnKS5yZXBsYWNlKC8iL2csICcmcXVvdDsnKTsKICAgICAgICB9CiAgICA8L3NjcmlwdD4KPC9ib2R5Pgo8L2h0bWw+Cg==";
var SUBSCRIPTION_B64 = "PCFET0NUWVBFIGh0bWw+CjxodG1sIGxhbmc9ImVuIj4KPGhlYWQ+CiAgICA8bWV0YSBjaGFyc2V0PSJVVEYtOCI+CiAgICA8bWV0YSBuYW1lPSJ2aWV3cG9ydCIgY29udGVudD0id2lkdGg9ZGV2aWNlLXdpZHRoLCBpbml0aWFsLXNjYWxlPTEuMCwgbWF4aW11bS1zY2FsZT0xLjAiPgogICAgPHRpdGxlPl9fVVNFUl9OQU1FX18g4oCUIEx1Y2lQcm94eSBTdWJzY3JpYmVyIFBvcnRhbDwvdGl0bGU+CiAgICA8c3R5bGU+CiAgICAgICAgOnJvb3QgewogICAgICAgICAgICAtLWJnLWJvZHk6ICMwOTBkMTY7CiAgICAgICAgICAgIC0tYmctY2FyZDogIzExMTgyNzsKICAgICAgICAgICAgLS1iZy1zdWJ0bGU6ICMxNjFmMzM7CiAgICAgICAgICAgIC0tYmctaW5wdXQ6ICMwZjE3MmE7CiAgICAgICAgICAgIC0tYm9yZGVyLWNvbG9yOiAjMWYyOTNkOwogICAgICAgICAgICAtLXRleHQtbWFpbjogI2Y4ZmFmYzsKICAgICAgICAgICAgLS10ZXh0LW11dGVkOiAjOTRhM2I4OwogICAgICAgICAgICAtLWFjY2VudDogIzYzNjZmMTsKICAgICAgICAgICAgLS1hY2NlbnQtaG92ZXI6ICM0ZjQ2ZTU7CiAgICAgICAgICAgIC0tY3lhbjogIzA2YjZkNDsKICAgICAgICAgICAgLS1ncmVlbjogIzEwYjk4MTsKICAgICAgICAgICAgLS1hbWJlcjogI2Y1OWUwYjsKICAgICAgICAgICAgLS1yZWQ6ICNlZjQ0NDQ7CiAgICAgICAgICAgIC0tcmFkaXVzLW1kOiAxMHB4OwogICAgICAgICAgICAtLXJhZGl1cy1sZzogMTZweDsKICAgICAgICAgICAgLS1mb250LWZhbWlseTogLWFwcGxlLXN5c3RlbSwgQmxpbmtNYWNTeXN0ZW1Gb250LCAiU2Vnb2UgVUkiLCBSb2JvdG8sIE94eWdlbiwgVWJ1bnR1LCBDYW50YXJlbGwsICJIZWx2ZXRpY2EgTmV1ZSIsIHNhbnMtc2VyaWY7CiAgICAgICAgfQoKICAgICAgICAqIHsgYm94LXNpemluZzogYm9yZGVyLWJveDsgbWFyZ2luOiAwOyBwYWRkaW5nOiAwOyB9CiAgICAgICAgYm9keSB7CiAgICAgICAgICAgIGZvbnQtZmFtaWx5OiB2YXIoLS1mb250LWZhbWlseSk7CiAgICAgICAgICAgIGJhY2tncm91bmQ6IHZhcigtLWJnLWJvZHkpOwogICAgICAgICAgICBjb2xvcjogdmFyKC0tdGV4dC1tYWluKTsKICAgICAgICAgICAgbWluLWhlaWdodDogMTAwdmg7CiAgICAgICAgICAgIGRpc3BsYXk6IGZsZXg7CiAgICAgICAgICAgIGFsaWduLWl0ZW1zOiBjZW50ZXI7CiAgICAgICAgICAgIGp1c3RpZnktY29udGVudDogY2VudGVyOwogICAgICAgICAgICBwYWRkaW5nOiAyMHB4OwogICAgICAgICAgICBsaW5lLWhlaWdodDogMS41OwogICAgICAgIH0KCiAgICAgICAgLnBvcnRhbC13cmFwcGVyIHsKICAgICAgICAgICAgbWF4LXdpZHRoOiA0ODBweDsKICAgICAgICAgICAgd2lkdGg6IDEwMCU7CiAgICAgICAgICAgIGRpc3BsYXk6IGZsZXg7CiAgICAgICAgICAgIGZsZXgtZGlyZWN0aW9uOiBjb2x1bW47CiAgICAgICAgICAgIGdhcDogMTZweDsKICAgICAgICB9CgogICAgICAgIC8qIFByb2ZpbGUgSGVhZGVyIENhcmQgKi8KICAgICAgICAucHJvZmlsZS1jYXJkIHsKICAgICAgICAgICAgYmFja2dyb3VuZDogdmFyKC0tYmctY2FyZCk7CiAgICAgICAgICAgIGJvcmRlcjogMXB4IHNvbGlkIHZhcigtLWJvcmRlci1jb2xvcik7CiAgICAgICAgICAgIGJvcmRlci1yYWRpdXM6IHZhcigtLXJhZGl1cy1sZyk7CiAgICAgICAgICAgIHBhZGRpbmc6IDI0cHg7CiAgICAgICAgICAgIHRleHQtYWxpZ246IGNlbnRlcjsKICAgICAgICAgICAgYm94LXNoYWRvdzogMCAxMHB4IDI1cHggLTVweCByZ2JhKDAsIDAsIDAsIDAuNCk7CiAgICAgICAgfQogICAgICAgIC5wb3J0YWwtYXZhdGFyIHsKICAgICAgICAgICAgd2lkdGg6IDU2cHg7CiAgICAgICAgICAgIGhlaWdodDogNTZweDsKICAgICAgICAgICAgYmFja2dyb3VuZDogbGluZWFyLWdyYWRpZW50KDEzNWRlZywgdmFyKC0tYWNjZW50KSwgdmFyKC0tY3lhbikpOwogICAgICAgICAgICBib3JkZXItcmFkaXVzOiAxNnB4OwogICAgICAgICAgICBtYXJnaW46IDAgYXV0byAxMnB4OwogICAgICAgICAgICBkaXNwbGF5OiBmbGV4OwogICAgICAgICAgICBhbGlnbi1pdGVtczogY2VudGVyOwogICAgICAgICAgICBqdXN0aWZ5LWNvbnRlbnQ6IGNlbnRlcjsKICAgICAgICAgICAgZm9udC1zaXplOiAxLjZyZW07CiAgICAgICAgICAgIGZvbnQtd2VpZ2h0OiA4MDA7CiAgICAgICAgICAgIGNvbG9yOiB3aGl0ZTsKICAgICAgICB9CiAgICAgICAgLnVzZXItbmFtZSB7CiAgICAgICAgICAgIGZvbnQtc2l6ZTogMS4zcmVtOwogICAgICAgICAgICBmb250LXdlaWdodDogNzAwOwogICAgICAgICAgICBtYXJnaW4tYm90dG9tOiA0cHg7CiAgICAgICAgfQogICAgICAgIC51c2VyLWlkIHsKICAgICAgICAgICAgZm9udC1zaXplOiAwLjc1cmVtOwogICAgICAgICAgICBmb250LWZhbWlseTogbW9ub3NwYWNlOwogICAgICAgICAgICBjb2xvcjogdmFyKC0tdGV4dC1tdXRlZCk7CiAgICAgICAgICAgIG1hcmdpbi1ib3R0b206IDEycHg7CiAgICAgICAgICAgIHdvcmQtYnJlYWs6IGJyZWFrLWFsbDsKICAgICAgICB9CiAgICAgICAgLnN0YXR1cy1iYWRnZSB7CiAgICAgICAgICAgIGRpc3BsYXk6IGlubGluZS1ibG9jazsKICAgICAgICAgICAgcGFkZGluZzogNHB4IDEycHg7CiAgICAgICAgICAgIGJvcmRlci1yYWRpdXM6IDIwcHg7CiAgICAgICAgICAgIGZvbnQtc2l6ZTogMC43NXJlbTsKICAgICAgICAgICAgZm9udC13ZWlnaHQ6IDcwMDsKICAgICAgICAgICAgdGV4dC10cmFuc2Zvcm06IHVwcGVyY2FzZTsKICAgICAgICAgICAgbGV0dGVyLXNwYWNpbmc6IDAuMDVlbTsKICAgICAgICB9CiAgICAgICAgLnN0YXR1cy1hY3RpdmUgeyBiYWNrZ3JvdW5kOiByZ2JhKDE2LCAxODUsIDEyOSwgMC4xNSk7IGNvbG9yOiB2YXIoLS1ncmVlbik7IGJvcmRlcjogMXB4IHNvbGlkIHJnYmEoMTYsIDE4NSwgMTI5LCAwLjMpOyB9CiAgICAgICAgLnN0YXR1cy1wYXVzZWQgeyBiYWNrZ3JvdW5kOiByZ2JhKDI0NSwgMTU4LCAxMSwgMC4xNSk7IGNvbG9yOiB2YXIoLS1hbWJlcik7IGJvcmRlcjogMXB4IHNvbGlkIHJnYmEoMjQ1LCAxNTgsIDExLCAwLjMpOyB9CiAgICAgICAgLnN0YXR1cy1leHBpcmVkIHsgYmFja2dyb3VuZDogcmdiYSgyMzksIDY4LCA2OCwgMC4xNSk7IGNvbG9yOiB2YXIoLS1yZWQpOyBib3JkZXI6IDFweCBzb2xpZCByZ2JhKDIzOSwgNjgsIDY4LCAwLjMpOyB9CiAgICAgICAgLnN0YXR1cy1saW1pdCB7IGJhY2tncm91bmQ6IHJnYmEoMjM5LCA2OCwgNjgsIDAuMTUpOyBjb2xvcjogdmFyKC0tcmVkKTsgYm9yZGVyOiAxcHggc29saWQgcmdiYSgyMzksIDY4LCA2OCwgMC4zKTsgfQoKICAgICAgICAvKiBTZWN0aW9uIENhcmQgKi8KICAgICAgICAuY2FyZCB7CiAgICAgICAgICAgIGJhY2tncm91bmQ6IHZhcigtLWJnLWNhcmQpOwogICAgICAgICAgICBib3JkZXI6IDFweCBzb2xpZCB2YXIoLS1ib3JkZXItY29sb3IpOwogICAgICAgICAgICBib3JkZXItcmFkaXVzOiB2YXIoLS1yYWRpdXMtbGcpOwogICAgICAgICAgICBwYWRkaW5nOiAyMHB4OwogICAgICAgIH0KICAgICAgICAuY2FyZC1oZWFkaW5nIHsKICAgICAgICAgICAgZm9udC1zaXplOiAwLjg1cmVtOwogICAgICAgICAgICB0ZXh0LXRyYW5zZm9ybTogdXBwZXJjYXNlOwogICAgICAgICAgICBsZXR0ZXItc3BhY2luZzogMC4wNWVtOwogICAgICAgICAgICBjb2xvcjogdmFyKC0tdGV4dC1tdXRlZCk7CiAgICAgICAgICAgIGZvbnQtd2VpZ2h0OiA2MDA7CiAgICAgICAgICAgIG1hcmdpbi1ib3R0b206IDEycHg7CiAgICAgICAgICAgIGRpc3BsYXk6IGZsZXg7CiAgICAgICAgICAgIGp1c3RpZnktY29udGVudDogc3BhY2UtYmV0d2VlbjsKICAgICAgICB9CgogICAgICAgIC8qIFByb2dyZXNzIEJhciAqLwogICAgICAgIC5wcm9ncmVzcy1iYXItYmcgewogICAgICAgICAgICBiYWNrZ3JvdW5kOiAjMWUyOTNiOwogICAgICAgIH0KCiAgICAgICAgLm1ldHJpYy1yb3cgewogICAgICAgICAgICBkaXNwbGF5OiBmbGV4OwogICAgICAgICAgICBqdXN0aWZ5LWNvbnRlbnQ6IHNwYWNlLWJldHdlZW47CiAgICAgICAgICAgIGFsaWduLWl0ZW1zOiBiYXNlbGluZTsKICAgICAgICAgICAgbWFyZ2luLWJvdHRvbTogNHB4OwogICAgICAgIH0KICAgICAgICAubWV0cmljLWJpZyB7CiAgICAgICAgICAgIGZvbnQtc2l6ZTogMS40cmVtOwogICAgICAgICAgICBmb250LXdlaWdodDogNzAwOwogICAgICAgIH0KICAgICAgICAubWV0cmljLXN1YiB7CiAgICAgICAgICAgIGZvbnQtc2l6ZTogMC44NXJlbTsKICAgICAgICAgICAgY29sb3I6IHZhcigtLXRleHQtbXV0ZWQpOwogICAgICAgIH0KCiAgICAgICAgLyogU3Vic2NyaXB0aW9uIExpbmtzICovCiAgICAgICAgLnN1Yi1saW5rLWJveCB7CiAgICAgICAgICAgIGJhY2tncm91bmQ6IHZhcigtLWJnLWlucHV0KTsKICAgICAgICAgICAgYm9yZGVyOiAxcHggc29saWQgdmFyKC0tYm9yZGVyLWNvbG9yKTsKICAgICAgICAgICAgYm9yZGVyLXJhZGl1czogdmFyKC0tcmFkaXVzLW1kKTsKICAgICAgICAgICAgcGFkZGluZzogMTBweDsKICAgICAgICAgICAgZGlzcGxheTogZmxleDsKICAgICAgICAgICAgYWxpZ24taXRlbXM6IGNlbnRlcjsKICAgICAgICAgICAgZ2FwOiA4cHg7CiAgICAgICAgICAgIG1hcmdpbi1ib3R0b206IDEycHg7CiAgICAgICAgfQogICAgICAgIC5zdWItbGluay1pbnB1dCB7CiAgICAgICAgICAgIGZsZXg6IDE7CiAgICAgICAgICAgIGJhY2tncm91bmQ6IHRyYW5zcGFyZW50OwogICAgICAgICAgICBib3JkZXI6IG5vbmU7CiAgICAgICAgICAgIGNvbG9yOiB2YXIoLS10ZXh0LW1haW4pOwogICAgICAgICAgICBmb250LXNpemU6IDAuOHJlbTsKICAgICAgICAgICAgb3V0bGluZTogbm9uZTsKICAgICAgICAgICAgZm9udC1mYW1pbHk6IG1vbm9zcGFjZTsKICAgICAgICB9CiAgICAgICAgLmJ0biB7CiAgICAgICAgICAgIGJhY2tncm91bmQ6IHZhcigtLWFjY2VudCk7CiAgICAgICAgICAgIGNvbG9yOiB3aGl0ZTsKICAgICAgICAgICAgYm9yZGVyOiBub25lOwogICAgICAgICAgICBwYWRkaW5nOiA4cHggMTRweDsKICAgICAgICAgICAgYm9yZGVyLXJhZGl1czogdmFyKC0tcmFkaXVzLW1kKTsKICAgICAgICAgICAgZm9udC1zaXplOiAwLjgycmVtOwogICAgICAgICAgICBmb250LXdlaWdodDogNjAwOwogICAgICAgICAgICBjdXJzb3I6IHBvaW50ZXI7CiAgICAgICAgICAgIHRyYW5zaXRpb246IGFsbCAwLjE1cyBlYXNlOwogICAgICAgICAgICBkaXNwbGF5OiBpbmxpbmUtZmxleDsKICAgICAgICAgICAgYWxpZ24taXRlbXM6IGNlbnRlcjsKICAgICAgICAgICAganVzdGlmeS1jb250ZW50OiBjZW50ZXI7CiAgICAgICAgICAgIHRleHQtZGVjb3JhdGlvbjogbm9uZTsKICAgICAgICAgICAgZ2FwOiA2cHg7CiAgICAgICAgfQogICAgICAgIC5idG46aG92ZXIgeyBiYWNrZ3JvdW5kOiB2YXIoLS1hY2NlbnQtaG92ZXIpOyB9CiAgICAgICAgLmJ0bi1zbSB7IHBhZGRpbmc6IDVweCAxMHB4OyBmb250LXNpemU6IDAuNzhyZW07IGJvcmRlci1yYWRpdXM6IDZweDsgfQogICAgICAgIC5idG4tc2Vjb25kYXJ5IHsgYmFja2dyb3VuZDogdmFyKC0tYmctc3VidGxlKTsgY29sb3I6IHZhcigtLXRleHQtbWFpbik7IGJvcmRlcjogMXB4IHNvbGlkIHZhcigtLWJvcmRlci1jb2xvcik7IH0KICAgICAgICAuYnRuLXNlY29uZGFyeTpob3ZlciB7IGJhY2tncm91bmQ6ICMxZTI5M2I7IGJvcmRlci1jb2xvcjogdmFyKC0tdGV4dC1tdXRlZCk7IH0KCiAgICAgICAgLmNsaWVudC1idXR0b25zIHsKICAgICAgICAgICAgZGlzcGxheTogZ3JpZDsKICAgICAgICAgICAgZ3JpZC10ZW1wbGF0ZS1jb2x1bW5zOiByZXBlYXQoMiwgMWZyKTsKICAgICAgICAgICAgZ2FwOiA4cHg7CiAgICAgICAgICAgIG1hcmdpbi10b3A6IDEwcHg7CiAgICAgICAgfQogICAgPC9zdHlsZT4KPC9oZWFkPgo8Ym9keT4KCiAgICA8ZGl2IGNsYXNzPSJwb3J0YWwtd3JhcHBlciI+CgogICAgICAgIDwhLS0gVXNlciBJZGVudGl0eSBIZWFkZXIgLS0+CiAgICAgICAgPGRpdiBjbGFzcz0icHJvZmlsZS1jYXJkIj4KICAgICAgICAgICAgPGRpdiBjbGFzcz0icG9ydGFsLWF2YXRhciI+TDwvZGl2PgogICAgICAgICAgICA8ZGl2IGNsYXNzPSJ1c2VyLW5hbWUiPl9fVVNFUl9OQU1FX188L2Rpdj4KICAgICAgICAgICAgPGRpdiBjbGFzcz0idXNlci1pZCI+X19VU0VSX0lEX188L2Rpdj4KICAgICAgICAgICAgPHNwYW4gY2xhc3M9InN0YXR1cy1iYWRnZSBzdGF0dXMtX19TVEFUVVNfQ09ERV9fIj5fX1NUQVRVU19DT0RFX188L3NwYW4+CiAgICAgICAgPC9kaXY+CgogICAgICAgIDwhLS0gQmFuZHdpZHRoIFVzYWdlIENhcmQgLS0+CiAgICAgICAgPGRpdiBjbGFzcz0iY2FyZCI+CiAgICAgICAgICAgIDxkaXYgY2xhc3M9ImNhcmQtaGVhZGluZyI+CiAgICAgICAgICAgICAgICA8c3Bhbj5Ub3RhbCBCYW5kd2lkdGg8L3NwYW4+CiAgICAgICAgICAgICAgICA8c3Bhbj5fX1RPVEFMX1BFUkNFTlRfXyU8L3NwYW4+CiAgICAgICAgICAgIDwvZGl2PgogICAgICAgICAgICA8ZGl2IGNsYXNzPSJtZXRyaWMtcm93Ij4KICAgICAgICAgICAgICAgIDxzcGFuIGNsYXNzPSJtZXRyaWMtYmlnIj5fX1RPVEFMX0dCX18gPHNwYW4gc3R5bGU9ImZvbnQtc2l6ZTowLjlyZW07IGZvbnQtd2VpZ2h0Om5vcm1hbDsgY29sb3I6dmFyKC0tdGV4dC1tdXRlZCk7Ij5HQjwvc3Bhbj48L3NwYW4+CiAgICAgICAgICAgICAgICA8c3BhbiBjbGFzcz0ibWV0cmljLXN1YiI+TGltaXQ6IF9fTElNSVRfVE9UQUxfR0JfXyBHQjwvc3Bhbj4KICAgICAgICAgICAgPC9kaXY+CiAgICAgICAgICAgIF9fVE9UQUxfUFJPR1JFU1NfXwoKICAgICAgICAgICAgPGRpdiBzdHlsZT0iYm9yZGVyLXRvcDogMXB4IHNvbGlkIHZhcigtLWJvcmRlci1jb2xvcik7IG1hcmdpbjogMTZweCAwOyBwYWRkaW5nLXRvcDogMTRweDsiPgogICAgICAgICAgICAgICAgPGRpdiBjbGFzcz0iY2FyZC1oZWFkaW5nIj4KICAgICAgICAgICAgICAgICAgICA8c3Bhbj5EYWlseSBVc2FnZTwvc3Bhbj4KICAgICAgICAgICAgICAgICAgICA8c3Bhbj5fX0RBSUxZX1BFUkNFTlRfXyU8L3NwYW4+CiAgICAgICAgICAgICAgICA8L2Rpdj4KICAgICAgICAgICAgICAgIDxkaXYgY2xhc3M9Im1ldHJpYy1yb3ciPgogICAgICAgICAgICAgICAgICAgIDxzcGFuIGNsYXNzPSJtZXRyaWMtYmlnIiBzdHlsZT0iZm9udC1zaXplOiAxLjE1cmVtOyI+X19EQUlMWV9HQl9fIDxzcGFuIHN0eWxlPSJmb250LXNpemU6MC44cmVtOyBmb250LXdlaWdodDpub3JtYWw7IGNvbG9yOnZhcigtLXRleHQtbXV0ZWQpOyI+R0I8L3NwYW4+PC9zcGFuPgogICAgICAgICAgICAgICAgICAgIDxzcGFuIGNsYXNzPSJtZXRyaWMtc3ViIj5EYWlseSBDYXA6IF9fTElNSVRfREFJTFlfR0JfXyBHQjwvc3Bhbj4KICAgICAgICAgICAgICAgIDwvZGl2PgogICAgICAgICAgICAgICAgX19EQUlMWV9QUk9HUkVTU19fCiAgICAgICAgICAgIDwvZGl2PgoKICAgICAgICAgICAgPGRpdiBzdHlsZT0iYm9yZGVyLXRvcDogMXB4IHNvbGlkIHZhcigtLWJvcmRlci1jb2xvcik7IG1hcmdpbi10b3A6IDE0cHg7IHBhZGRpbmctdG9wOiAxMnB4OyBkaXNwbGF5OiBmbGV4OyBqdXN0aWZ5LWNvbnRlbnQ6IHNwYWNlLWJldHdlZW47IGZvbnQtc2l6ZTogMC44NXJlbTsiPgogICAgICAgICAgICAgICAgPHNwYW4gc3R5bGU9ImNvbG9yOnZhcigtLXRleHQtbXV0ZWQpOyI+RXhwaXJhdGlvbiBEYXRlOjwvc3Bhbj4KICAgICAgICAgICAgICAgIDxzdHJvbmc+X19FWFBJUllfREFURV9fPC9zdHJvbmc+CiAgICAgICAgICAgIDwvZGl2PgogICAgICAgIDwvZGl2PgoKICAgICAgICA8IS0tIFN1YnNjcmlwdGlvbiBDb25maWd1cmF0aW9ucyAtLT4KICAgICAgICA8ZGl2IGNsYXNzPSJjYXJkIj4KICAgICAgICAgICAgPGRpdiBjbGFzcz0iY2FyZC1oZWFkaW5nIj5TdWJzY3JpcHRpb24gTGluazwvZGl2PgogICAgICAgICAgICA8ZGl2IGNsYXNzPSJzdWItbGluay1ib3giPgogICAgICAgICAgICAgICAgPGlucHV0IHR5cGU9InRleHQiIGlkPSJzdWItdXJsLWlucHV0IiBjbGFzcz0ic3ViLWxpbmstaW5wdXQiIHJlYWRvbmx5IHZhbHVlPSJfX1NZTkNfTk9STUFMX18iPgogICAgICAgICAgICAgICAgPGJ1dHRvbiBjbGFzcz0iYnRuIGJ0bi1zbSBidG4tc2Vjb25kYXJ5IiBvbmNsaWNrPSJjb3B5SW5wdXQoJ3N1Yi11cmwtaW5wdXQnLCB0aGlzKSI+Q29weTwvYnV0dG9uPgogICAgICAgICAgICA8L2Rpdj4KCiAgICAgICAgICAgIDxkaXYgY2xhc3M9ImNhcmQtaGVhZGluZyIgc3R5bGU9Im1hcmdpbi10b3A6IDE2cHg7Ij5PbmUtQ2xpY2sgQ2xpZW50IEltcG9ydDwvZGl2PgogICAgICAgICAgICA8ZGl2IGNsYXNzPSJjbGllbnQtYnV0dG9ucyI+CiAgICAgICAgICAgICAgICA8YSBpZD0iYnRuLWltcG9ydC1zaW5nYm94IiBocmVmPSIjIiBjbGFzcz0iYnRuIGJ0bi1zZWNvbmRhcnkiPlNpbmctQm94PC9hPgogICAgICAgICAgICAgICAgPGEgaWQ9ImJ0bi1pbXBvcnQtY2xhc2giIGhyZWY9IiMiIGNsYXNzPSJidG4gYnRuLXNlY29uZGFyeSI+Q2xhc2g8L2E+CiAgICAgICAgICAgICAgICA8YSBpZD0iYnRuLWltcG9ydC12MnJheSIgaHJlZj0iIyIgY2xhc3M9ImJ0biBidG4tc2Vjb25kYXJ5Ij52MnJheU5HPC9hPgogICAgICAgICAgICAgICAgPGEgaWQ9ImJ0bi1pbXBvcnQtc3RyZWlzYW5kIiBocmVmPSIjIiBjbGFzcz0iYnRuIGJ0bi1zZWNvbmRhcnkiPlN0cmVpc2FuZDwvYT4KICAgICAgICAgICAgPC9kaXY+CgogICAgICAgICAgICA8ZGl2IGNsYXNzPSJjYXJkLWhlYWRpbmciIHN0eWxlPSJtYXJnaW4tdG9wOiAxNnB4OyI+RG93bmxvYWQgRm9ybWF0czwvZGl2PgogICAgICAgICAgICA8ZGl2IHN0eWxlPSJkaXNwbGF5OiBmbGV4OyBmbGV4LXdyYXA6IHdyYXA7IGdhcDogNnB4OyI+CiAgICAgICAgICAgICAgICA8YnV0dG9uIGNsYXNzPSJidG4gYnRuLXNtIGJ0bi1zZWNvbmRhcnkiIG9uY2xpY2s9ImNvcHlGb3JtYXQoJ3Npbmdib3gnLCB0aGlzKSI+U2luZy1Cb3ggSlNPTjwvYnV0dG9uPgogICAgICAgICAgICAgICAgPGJ1dHRvbiBjbGFzcz0iYnRuIGJ0bi1zbSBidG4tc2Vjb25kYXJ5IiBvbmNsaWNrPSJjb3B5Rm9ybWF0KCdjbGFzaCcsIHRoaXMpIj5DbGFzaCBZQU1MPC9idXR0b24+CiAgICAgICAgICAgICAgICA8YnV0dG9uIGNsYXNzPSJidG4gYnRuLXNtIGJ0bi1zZWNvbmRhcnkiIG9uY2xpY2s9ImNvcHlGb3JtYXQoJ3YycmF5JywgdGhpcykiPlYyUmF5IEpTT048L2J1dHRvbj4KICAgICAgICAgICAgICAgIDxidXR0b24gY2xhc3M9ImJ0biBidG4tc20gYnRuLXNlY29uZGFyeSIgb25jbGljaz0iY29weUZvcm1hdCgnd2lyZWd1YXJkJywgdGhpcykiPldpcmVHdWFyZDwvYnV0dG9uPgogICAgICAgICAgICAgICAgPGJ1dHRvbiBjbGFzcz0iYnRuIGJ0bi1zbSBidG4tc2Vjb25kYXJ5IiBvbmNsaWNrPSJjb3B5Rm9ybWF0KCdyYXcnLCB0aGlzKSI+UmF3IFVSSXM8L2J1dHRvbj4KICAgICAgICAgICAgPC9kaXY+CiAgICAgICAgPC9kaXY+CgogICAgICAgIDwhLS0gRm9vdGVyIC0tPgogICAgICAgIDxkaXYgc3R5bGU9InRleHQtYWxpZ246IGNlbnRlcjsgZm9udC1zaXplOiAwLjc1cmVtOyBjb2xvcjogdmFyKC0tdGV4dC1tdXRlZCk7IHBhZGRpbmc6IDhweDsiPgogICAgICAgICAgICBQb3dlcmVkIGJ5IDxzdHJvbmc+THVjaVByb3h5IEdhdGV3YXk8L3N0cm9uZz4KICAgICAgICA8L2Rpdj4KCiAgICA8L2Rpdj4KCiAgICA8c2NyaXB0PgogICAgICAgIGNvbnN0IHN1YkJhc2UgPSAnX19TWU5DX05PUk1BTF9fJzsKCiAgICAgICAgd2luZG93LmFkZEV2ZW50TGlzdGVuZXIoJ0RPTUNvbnRlbnRMb2FkZWQnLCAoKSA9PiB7CiAgICAgICAgICAgIGNvbnN0IGVuY29kZWRVcmwgPSBlbmNvZGVVUklDb21wb25lbnQoc3ViQmFzZSk7CiAgICAgICAgICAgIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdidG4taW1wb3J0LXNpbmdib3gnKS5ocmVmID0gYHNpbmctYm94Oi8vaW1wb3J0LXJlbW90ZS1wcm9maWxlP3VybD0ke2VuY29kZWRVcmx9I0x1Y2lQcm94eWA7CiAgICAgICAgICAgIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdidG4taW1wb3J0LWNsYXNoJykuaHJlZiA9IGBjbGFzaDovL2luc3RhbGwtY29uZmlnP3VybD0ke2VuY29kZWRVcmx9Jm5hbWU9THVjaVByb3h5YDsKICAgICAgICAgICAgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ2J0bi1pbXBvcnQtdjJyYXknKS5ocmVmID0gYHYycmF5bmc6Ly9pbnN0YWxsLWNvbmZpZz91cmw9JHtlbmNvZGVkVXJsfSNMdWNpUHJveHlgOwogICAgICAgICAgICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnYnRuLWltcG9ydC1zdHJlaXNhbmQnKS5ocmVmID0gYHN0cmVpc2FuZDovL2ltcG9ydC8ke3N1YkJhc2V9YDsKICAgICAgICB9KTsKCiAgICAgICAgZnVuY3Rpb24gY29weUlucHV0KGlkLCBidG4pIHsKICAgICAgICAgICAgY29uc3QgaW5wdXQgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChpZCk7CiAgICAgICAgICAgIG5hdmlnYXRvci5jbGlwYm9hcmQud3JpdGVUZXh0KGlucHV0LnZhbHVlKS50aGVuKCgpID0+IHsKICAgICAgICAgICAgICAgIGNvbnN0IHByZXYgPSBidG4udGV4dENvbnRlbnQ7CiAgICAgICAgICAgICAgICBidG4udGV4dENvbnRlbnQgPSAnQ29waWVkISc7CiAgICAgICAgICAgICAgICBzZXRUaW1lb3V0KCgpID0+IGJ0bi50ZXh0Q29udGVudCA9IHByZXYsIDE1MDApOwogICAgICAgICAgICB9KTsKICAgICAgICB9CgogICAgICAgIGZ1bmN0aW9uIGNvcHlGb3JtYXQoZmxhZywgYnRuKSB7CiAgICAgICAgICAgIGNvbnN0IGZsYWdVcmwgPSBzdWJCYXNlLmluY2x1ZGVzKCc/JykgPyBgJHtzdWJCYXNlfSZmbGFnPSR7ZmxhZ31gIDogYCR7c3ViQmFzZX0/ZmxhZz0ke2ZsYWd9YDsKICAgICAgICAgICAgbmF2aWdhdG9yLmNsaXBib2FyZC53cml0ZVRleHQoZmxhZ1VybCkudGhlbigoKSA9PiB7CiAgICAgICAgICAgICAgICBjb25zdCBwcmV2ID0gYnRuLnRleHRDb250ZW50OwogICAgICAgICAgICAgICAgYnRuLnRleHRDb250ZW50ID0gJ0NvcGllZCEnOwogICAgICAgICAgICAgICAgc2V0VGltZW91dCgoKSA9PiBidG4udGV4dENvbnRlbnQgPSBwcmV2LCAxNTAwKTsKICAgICAgICAgICAgfSk7CiAgICAgICAgfQogICAgPC9zY3JpcHQ+CjwvYm9keT4KPC9odG1sPgo=";
var cachedDashboard = null;
var cachedSubscription = null;
function getDashboardHtml() {
  if (!cachedDashboard) {
    cachedDashboard = decodeBase64Utf8(DASHBOARD_B64);
  }
  return cachedDashboard;
}
function getSubscriptionHtml() {
  if (!cachedSubscription) {
    cachedSubscription = decodeBase64Utf8(SUBSCRIPTION_B64);
  }
  return cachedSubscription;
}

// LuciProxy/src/assets/loaders.js
async function renderDashboardHtml(env, currentVersion, apiRoute = "sync") {
  let html = null;
  const dashboardUrl = env?.DASHBOARD_URL;
  if (dashboardUrl) {
    try {
      const resp = await fetchT(dashboardUrl, {}, 5e3);
      if (resp.ok) html = await resp.text();
    } catch (e) {
    }
  }
  if (!html) {
    html = getDashboardHtml();
  }
  html = html.replace(/__CURRENT_VERSION__/g, currentVersion);
  html = html.replace(/__API_ROUTE__/g, apiRoute || "sync");
  const hasDb = Boolean(getDbBinding(env));
  if (hasDb) {
    html = html.replace("__HAS_DB_WARNING__", "");
  } else {
    html = html.replace(
      "__HAS_DB_WARNING__",
      `<div class="mb-5 p-4 rounded-2xl flex items-start gap-3" style="background:rgba(239,68,68,0.08);border:1px solid rgba(239,68,68,0.2);"><span style="color:#f87171;">\u26A0\uFE0F</span><span class="text-sm" style="color:#fca5a5;" data-i18n="missing_db">Database not connected. Settings won't be saved.</span></div>`
    );
  }
  return html;
}
async function renderSubscriptionHtml(env, user, sysUsage, sysConfig, requestUrl) {
  let html = null;
  const subscriptionUrl = env?.SUBSCRIPTION_URL;
  if (subscriptionUrl) {
    try {
      const resp = await fetchT(subscriptionUrl, {}, 5e3);
      if (resp.ok) html = await resp.text();
    } catch (e) {
    }
  }
  if (!html) {
    html = getSubscriptionHtml();
  }
  const todayDate = (/* @__PURE__ */ new Date()).toISOString().split("T")[0];
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
  const totalPercent = limitTotal ? Math.min(100, totalBytesUsed / limitTotalBytes * 100).toFixed(1) : "0";
  const dailyPercent = limitDaily ? Math.min(100, dailyBytesUsed / limitDailyBytes * 100).toFixed(1) : "0";
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
    } catch (e) {
    }
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
function renderError1101Html(hostName = "localhost", clientIp = "127.0.0.1", rayId = null) {
  const d = /* @__PURE__ */ new Date();
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
function renderNginxHtml() {
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

// LuciProxy/src/index.js
async function serveMaintenancePage(request, url, sysConfig) {
  if (breakerLevel() >= 1) {
    return new Response("Not Found", { status: 404 });
  }
  const camoType = (sysConfig?.camouflageType || "ubuntu").toLowerCase();
  const clientIP = request.headers.get("cf-connecting-ip") || "127.0.0.1";
  const rayId = request.headers.get("cf-ray") || null;
  if (camoType === "1101") {
    const html = renderError1101Html(url.hostname, clientIP, rayId);
    return new Response(html, {
      status: 500,
      headers: { "Content-Type": "text/html; charset=UTF-8" }
    });
  }
  if (camoType === "nginx") {
    const html = renderNginxHtml();
    return new Response(html, {
      status: 200,
      headers: { "Content-Type": "text/html; charset=UTF-8" }
    });
  }
  const fakeList = sysConfig?.maintenanceHost ? sysConfig.maintenanceHost.split(",").map((s) => s.trim()).filter(Boolean) : ["https://www.ubuntu.com"];
  const ipHash = Array.from(clientIP).reduce((acc, char) => acc + char.charCodeAt(0), 0);
  const targetStr = fakeList[ipHash % fakeList.length].startsWith("http") ? fakeList[ipHash % fakeList.length] : `https://${fakeList[ipHash % fakeList.length]}`;
  try {
    const targetUrl = new URL(targetStr);
    if (url.pathname !== "/") targetUrl.pathname = url.pathname;
    targetUrl.search = url.search;
    const cleanHeaders = new Headers(request.headers);
    cleanHeaders.set("Host", targetUrl.hostname);
    cleanHeaders.delete("cf-connecting-ip");
    cleanHeaders.delete("x-forwarded-for");
    const fetchInit = {
      method: request.method,
      headers: cleanHeaders,
      redirect: "follow"
    };
    if (request.method !== "GET" && request.method !== "HEAD") {
      fetchInit.body = request.body;
    }
    return await fetchT(new Request(targetUrl.toString(), fetchInit), {}, 5e3);
  } catch (e) {
    return new Response("Not Found", { status: 404 });
  }
}
var index_default = {
  async fetch(request, env, ctx) {
    incrementInflightHttp();
    try {
      await loadSysConfig(env, ctx);
      const sysConfig = getCachedConfig();
      if (!sysConfig.deviceId) {
        sysConfig.deviceId = generateHardwareId(sysConfig.apiRoute);
      }
      const url = new URL(request.url);
      const upgradeHeader = request.headers.get("Upgrade");
      const isTelemetryStream = upgradeHeader && upgradeHeader.toLowerCase() === "websocket";
      let reqPath = url.pathname;
      if (reqPath.endsWith("/") && reqPath.length > 1) {
        reqPath = reqPath.slice(0, -1);
      }
      const subRoute = `/${encodeURI(sysConfig.apiRoute || "sync")}`;
      const adminPrefixes = Array.from(
        new Set(
          ["/sync", subRoute, sysConfig.adminPath ? `/${encodeURI(sysConfig.adminPath)}` : null].filter(Boolean)
        )
      );
      const isDataRoute = reqPath === subRoute;
      const isDashRoute = adminPrefixes.some((p) => reqPath === `${p}/dash`);
      const isAuthRoute = adminPrefixes.some((p) => reqPath === `${p}/api/auth`);
      const isSyncRoute = adminPrefixes.some((p) => reqPath === `${p}/api/sync`);
      const isUsersRoute = adminPrefixes.some((p) => reqPath === `${p}/api/users`);
      const isStatsRoute = adminPrefixes.some((p) => reqPath === `${p}/api/stats`);
      const isLogsRoute = adminPrefixes.some((p) => reqPath === `${p}/api/logs`);
      const isSubSetIpRoute = reqPath === "/sub-setip" || adminPrefixes.some((p) => reqPath === `${p}/sub-setip`);
      const isBackendCheckRoute = adminPrefixes.some((p) => reqPath === `${p}/api/backend-check`);
      const isDohRoute = reqPath === "/dns-query" || adminPrefixes.some((p) => reqPath === `${p}/dns-query`);
      const isProxyIpTestRoute = reqPath === "/proxy-ip/test" || reqPath === "/api/proxy-ip/test" || adminPrefixes.some((p) => reqPath === `${p}/proxy-ip/test` || reqPath === `${p}/api/proxy-ip/test`);
      const isShareSettingsRoute = reqPath === "/share-settings" || adminPrefixes.some((p) => reqPath === `${p}/share-settings`);
      const isAuthorizedRoute = isDataRoute || isDashRoute || isAuthRoute || isSyncRoute || isUsersRoute || isStatsRoute || isLogsRoute || isSubSetIpRoute || isBackendCheckRoute || isDohRoute || isProxyIpTestRoute || isShareSettingsRoute;
      if (!isTelemetryStream && !isAuthorizedRoute) {
        return await serveMaintenancePage(request, url, sysConfig);
      }
      if (sysConfig.maintenanceMode && (isTelemetryStream || isDataRoute)) {
        if (isTelemetryStream) return new Response(null, { status: 503 });
        return new Response("Maintenance in progress, retry later", {
          status: 503,
          headers: { "Retry-After": "120" }
        });
      }
      if (isTelemetryStream) {
        if (sysConfig.backendMode && sysConfig.backendUrl) {
          const pair = new WebSocketPair();
          const client = pair[0];
          const server = pair[1];
          server.accept();
          processBackendStream(request, server, sysConfig.backendUrl, env, ctx, sysConfig);
          return new Response(null, {
            status: 101,
            webSocket: client
          });
        }
        let wsRelayIdx = -1;
        const riParam = url.searchParams.get("ri");
        if (riParam !== null) wsRelayIdx = parseInt(riParam, 10);
        return await processTelemetryStream(request, env, ctx, wsRelayIdx, sysConfig);
      }
      if (isDashRoute) {
        const visitedPrefix = reqPath.split("/")[1] || sysConfig.apiRoute || "sync";
        const html = await renderDashboardHtml(env, CURRENT_VERSION, visitedPrefix);
        return new Response(html, {
          headers: { "Content-Type": "text/html;charset=utf-8" }
        });
      }
      if (isAuthRoute) {
        if (request.method !== "POST") return new Response("Method Not Allowed", { status: 405 });
        return await handleAuth(request, url.hostname, ctx, env, sysConfig);
      }
      if (isSyncRoute) {
        if (request.method === "OPTIONS") {
          return new Response(null, {
            status: 204,
            headers: {
              "Access-Control-Allow-Origin": "*",
              "Access-Control-Allow-Methods": "POST, OPTIONS",
              "Access-Control-Allow-Headers": "Content-Type, Authorization"
            }
          });
        }
        if (request.method !== "POST") return new Response("Method Not Allowed", { status: 405 });
        return await handleConfigSync(request, env, ctx, sysConfig);
      }
      if (isUsersRoute) {
        return await handleUsersApi(request, env, ctx, sysConfig);
      }
      if (isStatsRoute) {
        return await handleStatsApi(request, env, sysConfig);
      }
      if (isLogsRoute) {
        return await handleLogs(request, env);
      }
      if (isSubSetIpRoute) {
        return await handleSubSetIp(request, env, ctx, sysConfig);
      }
      if (isBackendCheckRoute) {
        if (!isAuthorized(request, sysConfig)) {
          return new Response(JSON.stringify({ success: false, error: "Unauthorized" }), {
            status: 401,
            headers: { "Content-Type": "application/json" }
          });
        }
        const targetBackendUrl = url.searchParams.get("url") || sysConfig.backendUrl || "";
        const report = await checkBackendHealth(targetBackendUrl);
        return new Response(JSON.stringify(report, null, 2), {
          status: 200,
          headers: { "Content-Type": "application/json" }
        });
      }
      if (isDohRoute) {
        return await handleDoH(request, sysConfig);
      }
      if (isProxyIpTestRoute) {
        if (request.method === "OPTIONS") {
          return new Response(null, {
            status: 204,
            headers: {
              "Access-Control-Allow-Origin": "*",
              "Access-Control-Allow-Methods": "GET, OPTIONS",
              "Access-Control-Allow-Headers": "Authorization, Content-Type"
            }
          });
        }
        if (sysConfig.masterKey && !isAuthorized(request, sysConfig)) {
          return new Response(
            JSON.stringify({
              ok: false,
              success: false,
              status: "unauthorized",
              error: "Unauthorized",
              message: "Invalid or missing credentials."
            }, null, 2),
            {
              status: 401,
              headers: {
                "Content-Type": "application/json;charset=utf-8",
                "Access-Control-Allow-Origin": "*"
              }
            }
          );
        }
        try {
          const target = url.searchParams.get("target") || url.searchParams.get("ip") || "1.1.1.1";
          const attempts = parseInt(url.searchParams.get("attempts") || "5", 10);
          const testResult = await testProxyIp(target, Math.min(Math.max(attempts, 1), 10));
          return new Response(JSON.stringify(testResult, null, 2), {
            status: 200,
            headers: {
              "Content-Type": "application/json;charset=utf-8",
              "Access-Control-Allow-Origin": "*"
            }
          });
        } catch (err) {
          return new Response(
            JSON.stringify({
              ok: false,
              success: false,
              status: "error",
              error: err.message || "Internal probe error",
              message: `Probe execution failed: ${err.message}`
            }, null, 2),
            {
              status: 500,
              headers: {
                "Content-Type": "application/json;charset=utf-8",
                "Access-Control-Allow-Origin": "*"
              }
            }
          );
        }
      }
      if (isShareSettingsRoute) {
        return buildSharedSettingsResponse(sysConfig);
      }
      if (isDataRoute) {
        const ua = (request.headers.get("User-Agent") || "").toLowerCase();
        const acceptHeader = (request.headers.get("Accept") || "").toLowerCase();
        const secFetchDest = (request.headers.get("Sec-Fetch-Dest") || "").toLowerCase();
        const clientHost = request.headers.get("Host") || url.hostname;
        const targetSub = url.searchParams.get("sub");
        const hasMultiUser = sysConfig.users && sysConfig.users.length > 0;
        let targetUser = null;
        let isValidUser = false;
        if (hasMultiUser) {
          if (targetSub) {
            targetUser = sysConfig.users.find(
              (u) => u.name.toLowerCase() === targetSub.toLowerCase() || u.id.toLowerCase() === targetSub.toLowerCase()
            );
            if (targetUser) isValidUser = true;
          }
        } else {
          isValidUser = true;
          targetUser = { id: sysConfig.deviceId, name: "Default" };
        }
        const isRealBrowser = (secFetchDest === "document" || acceptHeader.includes("text/html")) && (ua.includes("mozilla") || ua.includes("chrome") || ua.includes("safari") || ua.includes("edge")) && !ua.includes("clash") && !ua.includes("sing-box") && !ua.includes("v2ray") && !ua.includes("shadowrocket");
        if (isRealBrowser) {
          if (isValidUser && targetUser) {
            const sysUsageCache = getCachedUsage();
            const html = await renderSubscriptionHtml(env, targetUser, sysUsageCache, sysConfig, request.url);
            return new Response(html, {
              headers: { "Content-Type": "text/html; charset=utf-8" }
            });
          }
          return await serveMaintenancePage(request, url, sysConfig);
        }
        if (hasMultiUser && !isValidUser) {
          return new Response("Subscription profile not found or disabled", { status: 403 });
        }
        const allowInsecure = url.searchParams.get("insecure") === "true" || url.searchParams.get("allowInsecure") === "true" || url.searchParams.get("allow_insecure") === "1";
        const flag = (url.searchParams.get("flag") || url.searchParams.get("format") || url.searchParams.get("type") || "").toLowerCase();
        const resHeaders = new Headers();
        resHeaders.set("Cache-Control", "no-store");
        resHeaders.set("Access-Control-Allow-Origin", "*");
        if (isValidUser && targetUser) {
          const idClean = targetUser.id.replace(/-/g, "").toLowerCase();
          const sysUsageCache = getCachedUsage();
          const sysU = sysUsageCache?.users?.[idClean] || { reqs: 0, dReqs: 0 };
          const usedBytes = usageTotalBytes(sysU);
          const limitTotal = targetUser.limitTotalReq || sysConfig.limitTotalReq || 0;
          const limitBytes = limitReqToBytes(limitTotal);
          const expiryMs = targetUser.expiryMs || sysConfig.expiryMs || 0;
          const expireSec = expiryMs ? Math.floor(expiryMs / 1e3) : 0;
          const subUserInfo = `upload=0; download=${usedBytes}; total=${limitBytes}; expire=${expireSec}`;
          resHeaders.set("Subscription-UserInfo", subUserInfo);
          resHeaders.set("Profile-Update-Interval", "12");
          const cleanName = encodeURIComponent(targetUser.name || "LuciProxy");
          resHeaders.set(
            "Content-Disposition",
            `attachment; filename="${cleanName}"; filename*=UTF-8''${cleanName}`
          );
        }
        if (flag === "share-settings" || flag === "settings") {
          return buildSharedSettingsResponse(sysConfig);
        }
        let isClashYaml = false;
        let isSingboxJson = false;
        let isV2rayJson = false;
        let isWireguard = false;
        let isAmnezia = false;
        if (["clash", "yaml", "meta", "stash", "clash-meta", "y"].includes(flag)) {
          isClashYaml = true;
        } else if (["sing", "singbox", "sing-box", "sb", "s"].includes(flag)) {
          isSingboxJson = true;
        } else if (["vjson", "v", "v2ray", "xray"].includes(flag)) {
          isV2rayJson = true;
        } else if (["wireguard", "wg"].includes(flag)) {
          isWireguard = true;
        } else if (["amnezia", "amneziawg", "awg"].includes(flag)) {
          isAmnezia = true;
        } else if (flag === "base64" || flag === "raw") {
        } else {
          if (ua.includes("clash") || ua.includes("meta") || ua.includes("stash") || ua.includes("mihomo")) {
            isClashYaml = true;
          } else if (ua.includes("sing-box") || ua.includes("singbox") || ua.includes("hiddify") || ua.includes("nekobox") || ua.includes("karing")) {
            isSingboxJson = true;
          } else if (ua.includes("amnezia")) {
            isAmnezia = true;
          } else if (ua.includes("wireguard")) {
            isWireguard = true;
          }
        }
        if (isWireguard || isAmnezia) {
          resHeaders.set("Content-Type", "text/plain; charset=utf-8");
          const wgProfile = generateWireguardConfig(sysConfig, isAmnezia, targetUser?.name || "LuciProxy");
          return new Response(wgProfile, { headers: resHeaders });
        }
        const runtimeAlpn = url.searchParams.get("alpn") || void 0;
        const runtimeOverrides = { alpn: runtimeAlpn };
        if (isClashYaml) {
          resHeaders.set("Content-Type", "text/yaml; charset=utf-8");
          const yamlProfile = await buildYamlProfile(clientHost, targetSub, allowInsecure, sysConfig, runtimeOverrides);
          return new Response(yamlProfile, { headers: resHeaders });
        }
        if (isSingboxJson) {
          resHeaders.set("Content-Type", "application/json; charset=utf-8");
          const sbProfile = await buildSingBoxJsonProfile(clientHost, targetSub, allowInsecure, sysConfig, runtimeOverrides);
          return new Response(JSON.stringify(sbProfile, null, 2), { headers: resHeaders });
        }
        if (isV2rayJson) {
          resHeaders.set("Content-Type", "application/json; charset=utf-8");
          const vProfile = await buildVJsonProfile(clientHost, targetSub, allowInsecure, sysConfig, runtimeOverrides);
          return new Response(JSON.stringify(vProfile, null, 2), { headers: resHeaders });
        }
        resHeaders.set("Content-Type", "text/plain; charset=utf-8");
        const rawProfile = await buildUriProfile(clientHost, targetSub, allowInsecure, sysConfig, runtimeOverrides);
        return new Response(safeBtoa(rawProfile), { headers: resHeaders });
      }
      return new Response("Not Found", { status: 404 });
    } catch (err) {
      console.error("Worker fetch error:", err);
      return new Response("Internal Server Error", { status: 500 });
    } finally {
      decrementInflightHttp();
    }
  },
  async scheduled(event, env, ctx) {
    await loadSysConfig(env, ctx);
    const sysConfig = getCachedConfig();
    const host = sysConfig.hubPanelUrl || sysConfig.name || "localhost";
    const results = {};
    try {
      results.rotated = await autoRotateSecretPaths(env, sysConfig);
    } catch (e) {
      results.rotated = { error: e.message };
    }
    try {
      results.mirror = await syncGitHubMirror(host, sysConfig);
    } catch (e) {
      results.mirror = { error: e.message };
    }
    return results;
  }
};
export {
  index_default as default
};
