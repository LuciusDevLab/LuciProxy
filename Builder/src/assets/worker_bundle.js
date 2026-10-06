// LuciProxy/src/config.js
var CURRENT_VERSION = "1.2.0";
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
  masterKey: "",
  metricNode: "time.is",
  cleanIps: "",
  slaveNodes: "",
  deviceId: "",
  mode: "alpha",
  // "alpha" = vless, "beta" = trojan, "both" = dual protocol
  agent: "chrome",
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

// LuciProxy/src/users/manager.js
var activeConns = /* @__PURE__ */ new Map();
var uuidUsage = /* @__PURE__ */ new Map();
var lastPersistenceSyncTime = 0;
function normalizeIdentifier(rawId) {
  return String(rawId || "").replace(/[^a-zA-Z0-9]/g, "").toLowerCase();
}
function getAllProfiles(sysConfig, targetSubscriber = null) {
  const defaultId = sysConfig.deviceId || "00000000-0000-4000-8000-000000000000";
  const profiles = [{ id: defaultId, name: "Default" }];
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
  const rawContent = customIpList || sysConfig?.cleanIps || "";
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
  const rawSource = profile?.proxyIp || sysConfig?.backupRelay || sysConfig?.customRelay || "";
  return rawSource.split(/[\r\n,;]+/).map((addr) => addr.trim()).filter(Boolean);
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
function generateConfigUuid(baseUuid, relayIndex = 0) {
  const cleanBase = String(baseUuid).replace(/-/g, "").toLowerCase().slice(0, 24).padEnd(24, "0");
  const relayHex = (Number(relayIndex) || 0).toString(16).padStart(8, "0");
  const full = cleanBase + relayHex;
  return `${full.slice(0, 8)}-${full.slice(8, 12)}-${full.slice(12, 16)}-${full.slice(16, 20)}-${full.slice(20, 32)}`;
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
  startDataPipe(edgeSocket, env, ctx, relayIndex, sysConfig, earlyDataPayload);
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
async function startDataPipe(webSocket, env, ctx, relayIndex, sysConfig, earlyDataPayload = "") {
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
      const session = await parseAndConnect(chunkBuffer, relayIndex, sysConfig, env, ctx);
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
      pumpDownstream(remoteSocket, webSocket, (chunkSize) => {
        downloadedBytes += chunkSize;
      });
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
async function pumpDownstream(remoteSocket, clientWebSocket, onBytesTransferred, readTimeoutMs = DOWNSTREAM_READ_TIMEOUT_MS) {
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
    try {
      clientWebSocket.close();
    } catch {
    }
  }
}
async function parseAndConnect(rawBuffer, relayIndex, sysConfig, env, ctx) {
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
    let fallbackEstablished = false;
    const natPrefix = matchingProfile.nat64 || sysConfig.nat64Prefix || sysConfig.proxyIpMode === "prefix" && sysConfig.prefixes?.[0];
    if (natPrefix && /^(\d{1,3}\.){3}\d{1,3}$/.test(resolvedDestination)) {
      const nat64Literal = convertToNAT64IPv6(resolvedDestination, natPrefix);
      if (nat64Literal) {
        try {
          remoteSocket = connectProvider({
            hostname: formatSocketHost(nat64Literal),
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
            "nat64-connect"
          );
          fallbackEstablished = true;
        } catch {
        }
      }
    }
    if (!fallbackEstablished) {
      const relayEndpoints = getEffectivePips(matchingProfile, sysConfig);
      if (relayEndpoints.length === 0) {
        return { hasError: true, message: "Direct connect and fallback relays unavailable" };
      }
      let userHash = 0;
      for (let i = 0; i < clientKey.length; i++) {
        userHash = clientKey.charCodeAt(i) + ((userHash << 5) - userHash);
      }
      const startIndex = Math.abs(userHash) % relayEndpoints.length;
      for (let attempt = 0; attempt < Math.min(relayEndpoints.length, 3); attempt++) {
        const targetRelay = relayEndpoints[(startIndex + attempt) % relayEndpoints.length];
        try {
          const [relayHost, relayPortRaw] = targetRelay.split(":");
          const relayPort = relayPortRaw ? parseInt(relayPortRaw.split("#")[0], 10) : destinationPort;
          remoteSocket = connectProvider({
            hostname: formatSocketHost(relayHost),
            port: relayPort
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
            "relay-connect"
          );
          fallbackEstablished = true;
          break;
        } catch {
          continue;
        }
      }
    }
    if (!fallbackEstablished) {
      return { hasError: true, message: "Outbound socket connection failed across all attempts" };
    }
  }
  const firstChunk = payloadOffset < rawBuffer.byteLength ? rawBuffer.slice(payloadOffset) : null;
  return {
    hasError: false,
    isVless,
    activeClientHash: clientKey,
    remoteSocket,
    firstChunk
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
async function buildUriProfile(hostName, targetSub = null, allowInsecure = false, sysConfig) {
  const ports = sysConfig.socketPorts ? sysConfig.socketPorts.split(",").map((s) => s.trim()).filter(Boolean) : ["443"];
  const reqPath = encodeURI(`/${sysConfig.apiRoute}`);
  const lines = [];
  const profiles = getAllProfiles(sysConfig, targetSub);
  const fakeNames = getFakeConfigNames(sysConfig, targetSub);
  fakeNames.forEach((name) => {
    lines.push(
      `trojan://00000000-0000-0000-0000-000000000000@127.0.0.1:1080?security=none#${encodeURIComponent(name)}`
    );
  });
  profiles.forEach((p) => {
    const pips = getEffectivePips(p, sysConfig);
    const effectiveMode = p.userMode || sysConfig.mode;
    const effectivePorts = p.userPorts ? p.userPorts.split(",").map((s) => s.trim()).filter(Boolean) : ports;
    const maxCfg = p.maxConfigs || null;
    const profileHostNames = getProfileHostNames(hostName, p);
    const resolvedFm = resolveFinalMask(p, sysConfig);
    const fmParam = formatVlessFinalMaskParam(resolvedFm, true) || getFragmentQueryParam(sysConfig, p);
    const effectiveEchList = Array.isArray(p.echConfigList) ? p.echConfigList : Array.isArray(sysConfig?.echConfigList) ? sysConfig.echConfigList : DEFAULT_ECH_CONFIGS;
    const validEchList = (effectiveEchList || []).map((s) => String(s || "").trim()).filter(Boolean);
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
        const sec = getTransportParams(port);
        const isTls = sec === "tls";
        let extBase = `encryption=none&security=${sec}&sni=${hName}&fp=${sysConfig.agent}&type=ws&host=${hName}&path=${reqPath}`;
        if (sysConfig.enableOpt2) extBase += `&pbk=enabled`;
        extBase += `&allowInsecure=${allowInsecure ? "1" : "0"}`;
        if (isTls && fmParam) extBase += fmParam;
        ips.forEach((ip) => {
          const _pips = pips.length > 0 ? pips : [null];
          _pips.forEach((selectedProxyIp) => {
            const ipName = ipNameMap[ip] || "";
            if (effectiveMode === "alpha" || effectiveMode === "both") {
              const vName = getConfigName(
                "alpha",
                p.name,
                port,
                hName,
                ip,
                selectedProxyIp,
                configIndex,
                ipName,
                sysConfig
              );
              const nodeTag = encodeURIComponent(vName);
              if (validEchList.length > 0) {
                validEchList.forEach((echVal) => {
                  lines.push(`vless://${p.id}@${ip}:${port}?${extBase}&ech=${encodeURIComponent(echVal)}#${nodeTag}`);
                  configIndex++;
                });
              } else {
                lines.push(`vless://${p.id}@${ip}:${port}?${extBase}#${nodeTag}`);
                configIndex++;
              }
            }
            if (effectiveMode === "beta" || effectiveMode === "both") {
              let extTrojan = `security=${sec}&sni=${hName}&alpn=h2,http/1.1&fp=${sysConfig.agent}&type=ws&host=${hName}&path=${reqPath}`;
              extTrojan += `&allowInsecure=${allowInsecure ? "1" : "0"}`;
              if (isTls && fmParam) extTrojan += fmParam;
              const tName = getConfigName(
                "beta",
                p.name,
                port,
                hName,
                ip,
                selectedProxyIp,
                configIndex,
                ipName,
                sysConfig
              );
              const tNodeTag = encodeURIComponent(tName);
              lines.push(`trojan://${p.id}@${ip}:${port}?${extTrojan}#${tNodeTag}`);
              configIndex++;
            }
          });
        });
      });
    });
  });
  return lines.join("\n");
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

// LuciProxy/src/subscriptions/policy.js
function resolveNetworkPolicy(sysConfig = {}, defaultOutbound = "select") {
  const dnsPolicy = buildCanonicalDnsPolicy(sysConfig);
  const rules = buildDeterministicPolicyRules(sysConfig, defaultOutbound);
  const activeKeys = getActiveRuleKeys(sysConfig);
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
      queryStrategyXray: dnsPolicy.queryStrategyXray
    },
    outbound: {
      defaultTag: defaultOutbound,
      fallbackTag: "direct"
    }
  };
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
async function buildYamlProfile(hostName, targetSub = null, allowInsecure = false, sysConfig) {
  const ports = sysConfig.socketPorts ? sysConfig.socketPorts.split(",").map((s) => s.trim()).filter(Boolean) : ["443"];
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
  const fakeNames = getFakeConfigNames(sysConfig, targetSub);
  fakeNames.forEach((name) => {
    const uName = getUniqueName(name);
    proxies.push(
      `  - name: "${uName}"
    type: trojan
    server: 127.0.0.1
    port: 80
    password: "${sysConfig.deviceId || "luciproxy"}"
    udp: false
    tls: false`
    );
    fakeProxyNames.push(`"${uName}"`);
  });
  const profiles = getAllProfiles(sysConfig, targetSub);
  profiles.forEach((p) => {
    const resolvedFm = resolveFinalMask(p, sysConfig);
    const pips = getEffectivePips(p, sysConfig);
    const effectiveMode = p.userMode || sysConfig.mode;
    const effectivePorts = p.userPorts ? p.userPorts.split(",").map((s) => s.trim()).filter(Boolean) : ports;
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
            if (effectiveMode === "alpha" || effectiveMode === "both") {
              const vName = getUniqueName(
                getConfigName("alpha", p.name, port, hName, ip, selectedProxyIp, configIndex, ipName, sysConfig)
              );
              proxies.push(
                `  - name: "${vName}"
    type: vless
    server: ${formatClashServer(ip)}
    port: ${port}
    uuid: "${p.id}"
    ip-version: ${ipVersion}
    udp: false
    tls: ${sec}
    network: ws
    servername: ${hName}
    skip-cert-verify: ${allowInsecure}
    client-fingerprint: ${sysConfig.agent || "chrome"}
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
            if (effectiveMode === "beta" || effectiveMode === "both") {
              const tName = getUniqueName(
                getConfigName("beta", p.name, port, hName, ip, selectedProxyIp, configIndex, ipName, sysConfig)
              );
              proxies.push(
                `  - name: "${tName}"
    type: trojan
    server: ${formatClashServer(ip)}
    port: ${port}
    password: "${p.id}"
    ip-version: ${ipVersion}
    udp: false
    tls: ${sec}
    network: ws
    sni: ${hName}
    skip-cert-verify: ${allowInsecure}
    client-fingerprint: ${sysConfig.agent || "chrome"}
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
async function buildSingBoxJsonProfile(hostName, targetSub = null, allowInsecure = false, sysConfig) {
  const ports = sysConfig.socketPorts ? sysConfig.socketPorts.split(",").map((s) => s.trim()).filter(Boolean) : ["443"];
  const reqPath = encodeURI(`/${sysConfig.apiRoute}`);
  const policy = resolveNetworkPolicy(sysConfig, "select");
  const dnsPolicy = policy.dns;
  const outboundsArr = [];
  const proxyTags = [];
  const fakeTags = [];
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
  const fakeNames = getFakeConfigNames(sysConfig, targetSub);
  fakeNames.forEach((name) => {
    const uName = getUniqueName(name);
    outboundsArr.push({
      type: "direct",
      tag: uName
    });
    fakeTags.push(uName);
  });
  const profiles = getAllProfiles(sysConfig, targetSub);
  profiles.forEach((p) => {
    const pips = getEffectivePips(p, sysConfig);
    const effectiveMode = p.userMode || sysConfig.mode;
    const effectivePorts = p.userPorts ? p.userPorts.split(",").map((s) => s.trim()).filter(Boolean) : ports;
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
        const isTls = getTransportParams(port) === "tls";
        const portNum = parseInt(port, 10);
        ips.forEach((ip) => {
          const _pips = pips.length > 0 ? pips : [null];
          _pips.forEach((selectedProxyIp) => {
            const ipName = ipNameMap[ip] || "";
            if (effectiveMode === "alpha" || effectiveMode === "both") {
              const vName = getUniqueName(
                getConfigName("alpha", p.name, port, hName, ip, selectedProxyIp, configIndex, ipName, sysConfig)
              );
              outboundsArr.push({
                type: "vless",
                tag: vName,
                server: ip,
                server_port: portNum,
                uuid: p.id,
                packet_encoding: "",
                domain_resolver: "dns-direct",
                tls: {
                  enabled: isTls,
                  server_name: hName,
                  insecure: allowInsecure,
                  utls: {
                    enabled: true,
                    fingerprint: sysConfig.agent || "chrome"
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
                  path: reqPath,
                  headers: { Host: hName },
                  early_data_header_name: "Sec-WebSocket-Protocol",
                  max_early_data: 2560
                }
              });
              proxyTags.push(vName);
              configIndex++;
            }
            if (effectiveMode === "beta" || effectiveMode === "both") {
              const tName = getUniqueName(
                getConfigName("beta", p.name, port, hName, ip, selectedProxyIp, configIndex, ipName, sysConfig)
              );
              outboundsArr.push({
                type: "trojan",
                tag: tName,
                server: ip,
                server_port: portNum,
                password: p.id,
                domain_resolver: "dns-direct",
                tls: {
                  enabled: isTls,
                  server_name: hName,
                  insecure: allowInsecure,
                  utls: {
                    enabled: true,
                    fingerprint: sysConfig.agent || "chrome"
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
                  path: reqPath,
                  headers: { Host: hName },
                  early_data_header_name: "Sec-WebSocket-Protocol",
                  max_early_data: 2560
                }
              });
              proxyTags.push(tName);
              configIndex++;
            }
          });
        });
      });
    });
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
async function buildVJsonProfile(hostName, targetSub = null, allowInsecure = false, sysConfig) {
  const ports = sysConfig.socketPorts ? sysConfig.socketPorts.split(",").map((s) => s.trim()).filter(Boolean) : ["443"];
  const policy = resolveNetworkPolicy(sysConfig, "proxy");
  const dnsPolicy = policy.dns;
  const outboundsArr = [];
  let configIndex = 0;
  const nameCounts = {};
  const getUniqueName = (baseName) => {
    if (!nameCounts[baseName]) {
      nameCounts[baseName] = 1;
      return baseName;
    }
    let c = nameCounts[baseName];
    nameCounts[baseName] = c + 1;
    return `${baseName}-${c}`;
  };
  const profiles = getAllProfiles(sysConfig, targetSub);
  const allOutboundDomains = /* @__PURE__ */ new Set();
  if (hostName && !isIpAddress(hostName)) {
    allOutboundDomains.add(hostName.trim());
  }
  profiles.forEach((p) => {
    const resolvedFm = resolveFinalMask(p, sysConfig);
    const pips = getEffectivePips(p, sysConfig);
    const effectiveMode = p.userMode || sysConfig.mode;
    const effectivePorts = p.userPorts ? p.userPorts.split(",").map((s) => s.trim()).filter(Boolean) : ports;
    const maxCfg = p.maxConfigs || null;
    const profileHostNames = getProfileHostNames(hostName, p);
    profileHostNames.forEach((hName) => {
      if (hName && !isIpAddress(hName)) {
        allOutboundDomains.add(hName.trim());
      }
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
        const sec = getTransportParams(port) === "tls" ? "tls" : "none";
        const xrayFm = formatXrayFinalMask(resolvedFm, sec === "tls");
        const portNum = parseInt(port, 10);
        ips.forEach((ip) => {
          const _pips = pips.length > 0 ? pips : [null];
          _pips.forEach((selectedProxyIp) => {
            const ipName = ipNameMap[ip] || "";
            if (effectiveMode === "alpha" || effectiveMode === "both") {
              const tag = getUniqueName(
                getConfigName("alpha", p.name, port, hName, ip, selectedProxyIp, configIndex, ipName, sysConfig)
              );
              const configUuid = generateConfigUuid(p.id, configIndex);
              const payload = { protocol: "vl", relayIdx: configIndex };
              const path = `/${sysConfig.apiRoute}?ri=${configIndex}`;
              outboundsArr.push({
                tag,
                protocol: "vless",
                settings: {
                  vnext: [
                    {
                      address: ip,
                      port: portNum,
                      users: [{ id: configUuid, encryption: "none" }]
                    }
                  ]
                },
                streamSettings: {
                  network: "ws",
                  security: sec,
                  tlsSettings: sec === "tls" ? { serverName: hName, allowInsecure: Boolean(allowInsecure) } : void 0,
                  wsSettings: { path, host: hName },
                  ...xrayFm ? { finalmask: xrayFm } : {}
                }
              });
              configIndex++;
            }
            if (effectiveMode === "beta" || effectiveMode === "both") {
              const tag = getUniqueName(
                getConfigName("beta", p.name, port, hName, ip, selectedProxyIp, configIndex, ipName, sysConfig)
              );
              const path = `/${sysConfig.apiRoute}?ri=${configIndex}`;
              outboundsArr.push({
                tag,
                protocol: "trojan",
                settings: {
                  servers: [{ address: ip, port: portNum, password: p.id }]
                },
                streamSettings: {
                  network: "ws",
                  security: sec,
                  tlsSettings: sec === "tls" ? { serverName: hName, allowInsecure: Boolean(allowInsecure) } : void 0,
                  wsSettings: { path, host: hName },
                  ...xrayFm ? { finalmask: xrayFm } : {}
                }
              });
              configIndex++;
            }
          });
        });
      });
    });
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
    }
  ];
  const outboundDomains = Array.from(allOutboundDomains);
  if (outboundDomains.length > 0) {
    dnsServers.push({
      address: directDnsAddr,
      domains: outboundDomains.map((d) => `full:${d}`),
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
      skipFallback: true,
      finalQuery: true
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
    { type: "field", inboundTag: ["dns"], outboundTag: "direct" },
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
        sniffing: { enabled: true, destOverride: ["http", "tls", ...dnsPolicy.fakeDns ? ["fakedns"] : []] }
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
var DASHBOARD_B64 = "PCFET0NUWVBFIGh0bWw+CjxodG1sIGxhbmc9ImVuIj4KPGhlYWQ+CiAgICA8bWV0YSBjaGFyc2V0PSJVVEYtOCI+CiAgICA8bWV0YSBuYW1lPSJ2aWV3cG9ydCIgY29udGVudD0id2lkdGg9ZGV2aWNlLXdpZHRoLCBpbml0aWFsLXNjYWxlPTEuMCwgbWF4aW11bS1zY2FsZT0xLjAiPgogICAgPHRpdGxlPkx1Y2lQcm94eSDigJQgRWRnZSBDb250cm9sIENvbnNvbGU8L3RpdGxlPgogICAgPHN0eWxlPgogICAgICAgIDpyb290IHsKICAgICAgICAgICAgLS1iZy1ib2R5OiAjMDkwZDE2OwogICAgICAgICAgICAtLWJnLWNhcmQ6ICMxMTE4Mjc7CiAgICAgICAgICAgIC0tYmctY2FyZC1zdWJ0bGU6ICMxNjFmMzM7CiAgICAgICAgICAgIC0tYmctaW5wdXQ6ICMwZjE3MmE7CiAgICAgICAgICAgIC0tYm9yZGVyLWNvbG9yOiAjMWYyOTNkOwogICAgICAgICAgICAtLWJvcmRlci1mb2N1czogIzYzNjZmMTsKICAgICAgICAgICAgLS10ZXh0LW1haW46ICNmOGZhZmM7CiAgICAgICAgICAgIC0tdGV4dC1tdXRlZDogIzk0YTNiODsKICAgICAgICAgICAgLS1hY2NlbnQ6ICM2MzY2ZjE7CiAgICAgICAgICAgIC0tYWNjZW50LWhvdmVyOiAjNGY0NmU1OwogICAgICAgICAgICAtLWN5YW46ICMwNmI2ZDQ7CiAgICAgICAgICAgIC0tZ3JlZW46ICMxMGI5ODE7CiAgICAgICAgICAgIC0tYW1iZXI6ICNmNTllMGI7CiAgICAgICAgICAgIC0tcmVkOiAjZWY0NDQ0OwogICAgICAgICAgICAtLXJhZGl1cy1tZDogMTBweDsKICAgICAgICAgICAgLS1yYWRpdXMtbGc6IDE2cHg7CiAgICAgICAgICAgIC0tZm9udC1mYW1pbHk6IC1hcHBsZS1zeXN0ZW0sIEJsaW5rTWFjU3lzdGVtRm9udCwgIlNlZ29lIFVJIiwgUm9ib3RvLCBPeHlnZW4sIFVidW50dSwgQ2FudGFyZWxsLCAiSGVsdmV0aWNhIE5ldWUiLCBzYW5zLXNlcmlmOwogICAgICAgIH0KCiAgICAgICAgKiB7IGJveC1zaXppbmc6IGJvcmRlci1ib3g7IG1hcmdpbjogMDsgcGFkZGluZzogMDsgfQogICAgICAgIGJvZHkgewogICAgICAgICAgICBmb250LWZhbWlseTogdmFyKC0tZm9udC1mYW1pbHkpOwogICAgICAgICAgICBiYWNrZ3JvdW5kOiB2YXIoLS1iZy1ib2R5KTsKICAgICAgICAgICAgY29sb3I6IHZhcigtLXRleHQtbWFpbik7CiAgICAgICAgICAgIG1pbi1oZWlnaHQ6IDEwMHZoOwogICAgICAgICAgICBkaXNwbGF5OiBmbGV4OwogICAgICAgICAgICBmbGV4LWRpcmVjdGlvbjogY29sdW1uOwogICAgICAgICAgICBsaW5lLWhlaWdodDogMS41OwogICAgICAgIH0KCiAgICAgICAgLyogVG9wIE5hdmlnYXRpb24gSGVhZGVyICovCiAgICAgICAgaGVhZGVyIHsKICAgICAgICAgICAgYmFja2dyb3VuZDogdmFyKC0tYmctY2FyZCk7CiAgICAgICAgICAgIGJvcmRlci1ib3R0b206IDFweCBzb2xpZCB2YXIoLS1ib3JkZXItY29sb3IpOwogICAgICAgICAgICBwYWRkaW5nOiAxNHB4IDI0cHg7CiAgICAgICAgICAgIGRpc3BsYXk6IGZsZXg7CiAgICAgICAgICAgIGFsaWduLWl0ZW1zOiBjZW50ZXI7CiAgICAgICAgICAgIGp1c3RpZnktY29udGVudDogc3BhY2UtYmV0d2VlbjsKICAgICAgICAgICAgcG9zaXRpb246IHN0aWNreTsKICAgICAgICAgICAgdG9wOiAwOwogICAgICAgICAgICB6LWluZGV4OiA0MDsKICAgICAgICB9CiAgICAgICAgLmJyYW5kIHsKICAgICAgICAgICAgZGlzcGxheTogZmxleDsKICAgICAgICAgICAgYWxpZ24taXRlbXM6IGNlbnRlcjsKICAgICAgICAgICAgZ2FwOiAxMnB4OwogICAgICAgICAgICBmb250LXdlaWdodDogNzAwOwogICAgICAgICAgICBmb250LXNpemU6IDEuMTVyZW07CiAgICAgICAgICAgIGxldHRlci1zcGFjaW5nOiAtMC4wMmVtOwogICAgICAgIH0KICAgICAgICAuYnJhbmQtYmFkZ2UgewogICAgICAgICAgICBiYWNrZ3JvdW5kOiBsaW5lYXItZ3JhZGllbnQoMTM1ZGVnLCB2YXIoLS1hY2NlbnQpLCB2YXIoLS1jeWFuKSk7CiAgICAgICAgICAgIGNvbG9yOiB3aGl0ZTsKICAgICAgICAgICAgd2lkdGg6IDMycHg7CiAgICAgICAgICAgIGhlaWdodDogMzJweDsKICAgICAgICAgICAgYm9yZGVyLXJhZGl1czogOHB4OwogICAgICAgICAgICBkaXNwbGF5OiBmbGV4OwogICAgICAgICAgICBhbGlnbi1pdGVtczogY2VudGVyOwogICAgICAgICAgICBqdXN0aWZ5LWNvbnRlbnQ6IGNlbnRlcjsKICAgICAgICAgICAgZm9udC13ZWlnaHQ6IDgwMDsKICAgICAgICAgICAgZm9udC1zaXplOiAxLjFyZW07CiAgICAgICAgfQogICAgICAgIC5oZWFkZXItbWV0YSB7CiAgICAgICAgICAgIGRpc3BsYXk6IGZsZXg7CiAgICAgICAgICAgIGFsaWduLWl0ZW1zOiBjZW50ZXI7CiAgICAgICAgICAgIGdhcDogMTZweDsKICAgICAgICAgICAgZm9udC1zaXplOiAwLjg1cmVtOwogICAgICAgICAgICBjb2xvcjogdmFyKC0tdGV4dC1tdXRlZCk7CiAgICAgICAgfQogICAgICAgIC5zdGF0dXMtcGlsbCB7CiAgICAgICAgICAgIGRpc3BsYXk6IGlubGluZS1mbGV4OwogICAgICAgICAgICBhbGlnbi1pdGVtczogY2VudGVyOwogICAgICAgICAgICBnYXA6IDZweDsKICAgICAgICAgICAgcGFkZGluZzogNHB4IDEwcHg7CiAgICAgICAgICAgIGJvcmRlci1yYWRpdXM6IDIwcHg7CiAgICAgICAgICAgIGZvbnQtc2l6ZTogMC43NXJlbTsKICAgICAgICAgICAgZm9udC13ZWlnaHQ6IDYwMDsKICAgICAgICAgICAgYmFja2dyb3VuZDogcmdiYSgxNiwgMTg1LCAxMjksIDAuMSk7CiAgICAgICAgICAgIGNvbG9yOiB2YXIoLS1ncmVlbik7CiAgICAgICAgICAgIGJvcmRlcjogMXB4IHNvbGlkIHJnYmEoMTYsIDE4NSwgMTI5LCAwLjIpOwogICAgICAgIH0KICAgICAgICAuc3RhdHVzLXBpbGwud2FybmluZyB7CiAgICAgICAgICAgIGJhY2tncm91bmQ6IHJnYmEoMjQ1LCAxNTgsIDExLCAwLjEpOwogICAgICAgICAgICBjb2xvcjogdmFyKC0tYW1iZXIpOwogICAgICAgICAgICBib3JkZXItY29sb3I6IHJnYmEoMjQ1LCAxNTgsIDExLCAwLjIpOwogICAgICAgIH0KICAgICAgICAuYnRuLWdob3N0IHsKICAgICAgICAgICAgYmFja2dyb3VuZDogdHJhbnNwYXJlbnQ7CiAgICAgICAgICAgIGJvcmRlcjogMXB4IHNvbGlkIHZhcigtLWJvcmRlci1jb2xvcik7CiAgICAgICAgICAgIGNvbG9yOiB2YXIoLS10ZXh0LW1haW4pOwogICAgICAgICAgICBwYWRkaW5nOiA2cHggMTRweDsKICAgICAgICAgICAgYm9yZGVyLXJhZGl1czogdmFyKC0tcmFkaXVzLW1kKTsKICAgICAgICAgICAgY3Vyc29yOiBwb2ludGVyOwogICAgICAgICAgICBmb250LXNpemU6IDAuODJyZW07CiAgICAgICAgICAgIGZvbnQtd2VpZ2h0OiA1MDA7CiAgICAgICAgICAgIHRyYW5zaXRpb246IGFsbCAwLjE1cyBlYXNlOwogICAgICAgIH0KICAgICAgICAuYnRuLWdob3N0OmhvdmVyIHsKICAgICAgICAgICAgYmFja2dyb3VuZDogdmFyKC0tYmctY2FyZC1zdWJ0bGUpOwogICAgICAgICAgICBib3JkZXItY29sb3I6IHZhcigtLXRleHQtbXV0ZWQpOwogICAgICAgIH0KCiAgICAgICAgLyogVGFiIE5hdmlnYXRpb24gQmFyICovCiAgICAgICAgbmF2IHsKICAgICAgICAgICAgYmFja2dyb3VuZDogdmFyKC0tYmctY2FyZCk7CiAgICAgICAgICAgIGJvcmRlci1ib3R0b206IDFweCBzb2xpZCB2YXIoLS1ib3JkZXItY29sb3IpOwogICAgICAgICAgICBwYWRkaW5nOiAwIDI0cHg7CiAgICAgICAgICAgIGRpc3BsYXk6IGZsZXg7CiAgICAgICAgICAgIGdhcDogMjRweDsKICAgICAgICAgICAgb3ZlcmZsb3cteDogYXV0bzsKICAgICAgICB9CiAgICAgICAgLm5hdi1pdGVtIHsKICAgICAgICAgICAgcGFkZGluZzogMTJweCA0cHg7CiAgICAgICAgICAgIGNvbG9yOiB2YXIoLS10ZXh0LW11dGVkKTsKICAgICAgICAgICAgY3Vyc29yOiBwb2ludGVyOwogICAgICAgICAgICBmb250LXNpemU6IDAuOXJlbTsKICAgICAgICAgICAgZm9udC13ZWlnaHQ6IDUwMDsKICAgICAgICAgICAgYm9yZGVyLWJvdHRvbTogMnB4IHNvbGlkIHRyYW5zcGFyZW50OwogICAgICAgICAgICB3aGl0ZS1zcGFjZTogbm93cmFwOwogICAgICAgICAgICB0cmFuc2l0aW9uOiBhbGwgMC4xNXMgZWFzZTsKICAgICAgICB9CiAgICAgICAgLm5hdi1pdGVtOmhvdmVyIHsgY29sb3I6IHZhcigtLXRleHQtbWFpbik7IH0KICAgICAgICAubmF2LWl0ZW0uYWN0aXZlIHsKICAgICAgICAgICAgY29sb3I6IHZhcigtLWFjY2VudCk7CiAgICAgICAgICAgIGJvcmRlci1ib3R0b20tY29sb3I6IHZhcigtLWFjY2VudCk7CiAgICAgICAgfQoKICAgICAgICAvKiBNYWluIENvbnRhaW5lciAqLwogICAgICAgIG1haW4gewogICAgICAgICAgICBmbGV4OiAxOwogICAgICAgICAgICBtYXgtd2lkdGg6IDEyMDBweDsKICAgICAgICAgICAgd2lkdGg6IDEwMCU7CiAgICAgICAgICAgIG1hcmdpbjogMCBhdXRvOwogICAgICAgICAgICBwYWRkaW5nOiAyNHB4OwogICAgICAgIH0KCiAgICAgICAgLyogQ2FyZCBTZWN0aW9ucyAqLwogICAgICAgIC5jYXJkIHsKICAgICAgICAgICAgYmFja2dyb3VuZDogdmFyKC0tYmctY2FyZCk7CiAgICAgICAgICAgIGJvcmRlcjogMXB4IHNvbGlkIHZhcigtLWJvcmRlci1jb2xvcik7CiAgICAgICAgICAgIGJvcmRlci1yYWRpdXM6IHZhcigtLXJhZGl1cy1sZyk7CiAgICAgICAgICAgIHBhZGRpbmc6IDIwcHg7CiAgICAgICAgICAgIG1hcmdpbi1ib3R0b206IDIwcHg7CiAgICAgICAgfQogICAgICAgIC5jYXJkLXRpdGxlIHsKICAgICAgICAgICAgZm9udC1zaXplOiAxLjA1cmVtOwogICAgICAgICAgICBmb250LXdlaWdodDogNjAwOwogICAgICAgICAgICBtYXJnaW4tYm90dG9tOiAxNHB4OwogICAgICAgICAgICBkaXNwbGF5OiBmbGV4OwogICAgICAgICAgICBhbGlnbi1pdGVtczogY2VudGVyOwogICAgICAgICAgICBqdXN0aWZ5LWNvbnRlbnQ6IHNwYWNlLWJldHdlZW47CiAgICAgICAgfQoKICAgICAgICAvKiBNZXRyaWMgR3JpZCAqLwogICAgICAgIC5tZXRyaWNzLWdyaWQgewogICAgICAgICAgICBkaXNwbGF5OiBncmlkOwogICAgICAgICAgICBncmlkLXRlbXBsYXRlLWNvbHVtbnM6IHJlcGVhdChhdXRvLWZpdCwgbWlubWF4KDIyMHB4LCAxZnIpKTsKICAgICAgICAgICAgZ2FwOiAxNnB4OwogICAgICAgICAgICBtYXJnaW4tYm90dG9tOiAyMHB4OwogICAgICAgIH0KICAgICAgICAubWV0cmljLWNhcmQgewogICAgICAgICAgICBiYWNrZ3JvdW5kOiB2YXIoLS1iZy1jYXJkKTsKICAgICAgICAgICAgYm9yZGVyOiAxcHggc29saWQgdmFyKC0tYm9yZGVyLWNvbG9yKTsKICAgICAgICAgICAgYm9yZGVyLXJhZGl1czogdmFyKC0tcmFkaXVzLW1kKTsKICAgICAgICAgICAgcGFkZGluZzogMTZweDsKICAgICAgICAgICAgZGlzcGxheTogZmxleDsKICAgICAgICAgICAgZmxleC1kaXJlY3Rpb246IGNvbHVtbjsKICAgICAgICAgICAgZ2FwOiA2cHg7CiAgICAgICAgfQogICAgICAgIC5tZXRyaWMtbGFiZWwgewogICAgICAgICAgICBmb250LXNpemU6IDAuOHJlbTsKICAgICAgICAgICAgY29sb3I6IHZhcigtLXRleHQtbXV0ZWQpOwogICAgICAgICAgICB0ZXh0LXRyYW5zZm9ybTogdXBwZXJjYXNlOwogICAgICAgICAgICBsZXR0ZXItc3BhY2luZzogMC4wNWVtOwogICAgICAgIH0KICAgICAgICAubWV0cmljLXZhbHVlIHsKICAgICAgICAgICAgZm9udC1zaXplOiAxLjZyZW07CiAgICAgICAgICAgIGZvbnQtd2VpZ2h0OiA3MDA7CiAgICAgICAgICAgIGNvbG9yOiB2YXIoLS10ZXh0LW1haW4pOwogICAgICAgIH0KCiAgICAgICAgLyogVGFibGVzICovCiAgICAgICAgLnRhYmxlLXJlc3BvbnNpdmUgewogICAgICAgICAgICBvdmVyZmxvdy14OiBhdXRvOwogICAgICAgIH0KICAgICAgICB0YWJsZSB7CiAgICAgICAgICAgIHdpZHRoOiAxMDAlOwogICAgICAgICAgICBib3JkZXItY29sbGFwc2U6IGNvbGxhcHNlOwogICAgICAgICAgICB0ZXh0LWFsaWduOiBsZWZ0OwogICAgICAgICAgICBmb250LXNpemU6IDAuODhyZW07CiAgICAgICAgfQogICAgICAgIHRoIHsKICAgICAgICAgICAgY29sb3I6IHZhcigtLXRleHQtbXV0ZWQpOwogICAgICAgICAgICBwYWRkaW5nOiAxMHB4IDEycHg7CiAgICAgICAgICAgIGJvcmRlci1ib3R0b206IDFweCBzb2xpZCB2YXIoLS1ib3JkZXItY29sb3IpOwogICAgICAgICAgICBmb250LXdlaWdodDogNjAwOwogICAgICAgICAgICBmb250LXNpemU6IDAuNzhyZW07CiAgICAgICAgICAgIHRleHQtdHJhbnNmb3JtOiB1cHBlcmNhc2U7CiAgICAgICAgfQogICAgICAgIHRkIHsKICAgICAgICAgICAgcGFkZGluZzogMTJweDsKICAgICAgICAgICAgYm9yZGVyLWJvdHRvbTogMXB4IHNvbGlkIHZhcigtLWJvcmRlci1jb2xvcik7CiAgICAgICAgfQogICAgICAgIHRyOmhvdmVyIHRkIHsKICAgICAgICAgICAgYmFja2dyb3VuZDogcmdiYSgyNTUsIDI1NSwgMjU1LCAwLjAyKTsKICAgICAgICB9CgogICAgICAgIC8qIEJhZGdlcyAqLwogICAgICAgIC5iYWRnZSB7CiAgICAgICAgICAgIGRpc3BsYXk6IGlubGluZS1ibG9jazsKICAgICAgICAgICAgcGFkZGluZzogM3B4IDhweDsKICAgICAgICAgICAgYm9yZGVyLXJhZGl1czogNnB4OwogICAgICAgICAgICBmb250LXNpemU6IDAuNzVyZW07CiAgICAgICAgICAgIGZvbnQtd2VpZ2h0OiA2MDA7CiAgICAgICAgfQogICAgICAgIC5iYWRnZS1hY3RpdmUgeyBiYWNrZ3JvdW5kOiByZ2JhKDE2LCAxODUsIDEyOSwgMC4xNSk7IGNvbG9yOiB2YXIoLS1ncmVlbik7IH0KICAgICAgICAuYmFkZ2UtcGF1c2VkIHsgYmFja2dyb3VuZDogcmdiYSgyNDUsIDE1OCwgMTEsIDAuMTUpOyBjb2xvcjogdmFyKC0tYW1iZXIpOyB9CiAgICAgICAgLmJhZGdlLWV4cGlyZWQgeyBiYWNrZ3JvdW5kOiByZ2JhKDIzOSwgNjgsIDY4LCAwLjE1KTsgY29sb3I6IHZhcigtLXJlZCk7IH0KICAgICAgICAuYmFkZ2UtbGltaXQgeyBiYWNrZ3JvdW5kOiByZ2JhKDIzOSwgNjgsIDY4LCAwLjE1KTsgY29sb3I6IHZhcigtLXJlZCk7IH0KCiAgICAgICAgLyogQnV0dG9ucyAmIElucHV0cyAqLwogICAgICAgIC5idG4gewogICAgICAgICAgICBiYWNrZ3JvdW5kOiB2YXIoLS1hY2NlbnQpOwogICAgICAgICAgICBjb2xvcjogd2hpdGU7CiAgICAgICAgICAgIGJvcmRlcjogbm9uZTsKICAgICAgICAgICAgcGFkZGluZzogOHB4IDE2cHg7CiAgICAgICAgICAgIGJvcmRlci1yYWRpdXM6IHZhcigtLXJhZGl1cy1tZCk7CiAgICAgICAgICAgIGZvbnQtc2l6ZTogMC44NXJlbTsKICAgICAgICAgICAgZm9udC13ZWlnaHQ6IDYwMDsKICAgICAgICAgICAgY3Vyc29yOiBwb2ludGVyOwogICAgICAgICAgICB0cmFuc2l0aW9uOiBhbGwgMC4xNXMgZWFzZTsKICAgICAgICAgICAgZGlzcGxheTogaW5saW5lLWZsZXg7CiAgICAgICAgICAgIGFsaWduLWl0ZW1zOiBjZW50ZXI7CiAgICAgICAgICAgIGdhcDogNnB4OwogICAgICAgIH0KICAgICAgICAuYnRuOmhvdmVyIHsgYmFja2dyb3VuZDogdmFyKC0tYWNjZW50LWhvdmVyKTsgfQogICAgICAgIC5idG4tc20geyBwYWRkaW5nOiA1cHggMTBweDsgZm9udC1zaXplOiAwLjc4cmVtOyBib3JkZXItcmFkaXVzOiA2cHg7IH0KICAgICAgICAuYnRuLXNlY29uZGFyeSB7IGJhY2tncm91bmQ6IHZhcigtLWJnLWNhcmQtc3VidGxlKTsgY29sb3I6IHZhcigtLXRleHQtbWFpbik7IGJvcmRlcjogMXB4IHNvbGlkIHZhcigtLWJvcmRlci1jb2xvcik7IH0KICAgICAgICAuYnRuLXNlY29uZGFyeTpob3ZlciB7IGJhY2tncm91bmQ6ICMxZTI5M2I7IGJvcmRlci1jb2xvcjogdmFyKC0tdGV4dC1tdXRlZCk7IH0KICAgICAgICAuYnRuLWRhbmdlciB7IGJhY2tncm91bmQ6IHJnYmEoMjM5LCA2OCwgNjgsIDAuMik7IGNvbG9yOiB2YXIoLS1yZWQpOyBib3JkZXI6IDFweCBzb2xpZCByZ2JhKDIzOSwgNjgsIDY4LCAwLjMpOyB9CiAgICAgICAgLmJ0bi1kYW5nZXI6aG92ZXIgeyBiYWNrZ3JvdW5kOiB2YXIoLS1yZWQpOyBjb2xvcjogd2hpdGU7IH0KCiAgICAgICAgLmlucHV0LCAuc2VsZWN0LCAudGV4dGFyZWEgewogICAgICAgICAgICB3aWR0aDogMTAwJTsKICAgICAgICAgICAgYmFja2dyb3VuZDogdmFyKC0tYmctaW5wdXQpOwogICAgICAgICAgICBib3JkZXI6IDFweCBzb2xpZCB2YXIoLS1ib3JkZXItY29sb3IpOwogICAgICAgICAgICBjb2xvcjogdmFyKC0tdGV4dC1tYWluKTsKICAgICAgICAgICAgcGFkZGluZzogOXB4IDEycHg7CiAgICAgICAgICAgIGJvcmRlci1yYWRpdXM6IHZhcigtLXJhZGl1cy1tZCk7CiAgICAgICAgICAgIGZvbnQtc2l6ZTogMC44OHJlbTsKICAgICAgICAgICAgb3V0bGluZTogbm9uZTsKICAgICAgICAgICAgdHJhbnNpdGlvbjogYm9yZGVyLWNvbG9yIDAuMTVzIGVhc2U7CiAgICAgICAgfQogICAgICAgIC5pbnB1dDpmb2N1cywgLnNlbGVjdDpmb2N1cywgLnRleHRhcmVhOmZvY3VzIHsKICAgICAgICAgICAgYm9yZGVyLWNvbG9yOiB2YXIoLS1ib3JkZXItZm9jdXMpOwogICAgICAgIH0KICAgICAgICAuZm9ybS1ncm91cCB7CiAgICAgICAgICAgIG1hcmdpbi1ib3R0b206IDE0cHg7CiAgICAgICAgfQogICAgICAgIC5mb3JtLWxhYmVsIHsKICAgICAgICAgICAgZGlzcGxheTogYmxvY2s7CiAgICAgICAgICAgIGZvbnQtc2l6ZTogMC44cmVtOwogICAgICAgICAgICBjb2xvcjogdmFyKC0tdGV4dC1tdXRlZCk7CiAgICAgICAgICAgIG1hcmdpbi1ib3R0b206IDVweDsKICAgICAgICAgICAgZm9udC13ZWlnaHQ6IDUwMDsKICAgICAgICB9CgogICAgICAgIC8qIE1vZGFscyAqLwogICAgICAgIC5tb2RhbC1vdmVybGF5IHsKICAgICAgICAgICAgcG9zaXRpb246IGZpeGVkOwogICAgICAgICAgICB0b3A6IDA7IGxlZnQ6IDA7IHJpZ2h0OiAwOyBib3R0b206IDA7CiAgICAgICAgICAgIGJhY2tncm91bmQ6IHJnYmEoMCwgMCwgMCwgMC43NSk7CiAgICAgICAgICAgIGRpc3BsYXk6IG5vbmU7CiAgICAgICAgICAgIGFsaWduLWl0ZW1zOiBjZW50ZXI7CiAgICAgICAgICAgIGp1c3RpZnktY29udGVudDogY2VudGVyOwogICAgICAgICAgICB6LWluZGV4OiA1MDsKICAgICAgICAgICAgcGFkZGluZzogMTZweDsKICAgICAgICB9CiAgICAgICAgLm1vZGFsLW92ZXJsYXkub3BlbiB7IGRpc3BsYXk6IGZsZXg7IH0KICAgICAgICAubW9kYWwgewogICAgICAgICAgICBiYWNrZ3JvdW5kOiB2YXIoLS1iZy1jYXJkKTsKICAgICAgICAgICAgYm9yZGVyOiAxcHggc29saWQgdmFyKC0tYm9yZGVyLWNvbG9yKTsKICAgICAgICAgICAgYm9yZGVyLXJhZGl1czogdmFyKC0tcmFkaXVzLWxnKTsKICAgICAgICAgICAgbWF4LXdpZHRoOiA1NDBweDsKICAgICAgICAgICAgd2lkdGg6IDEwMCU7CiAgICAgICAgICAgIHBhZGRpbmc6IDI0cHg7CiAgICAgICAgICAgIG1heC1oZWlnaHQ6IDkwdmg7CiAgICAgICAgICAgIG92ZXJmbG93LXk6IGF1dG87CiAgICAgICAgfQoKICAgICAgICAvKiBMb2dpbiBTY3JlZW4gT3ZlcmxheSAqLwogICAgICAgICNsb2dpbi1zY3JlZW4gewogICAgICAgICAgICBwb3NpdGlvbjogZml4ZWQ7CiAgICAgICAgICAgIHRvcDogMDsgbGVmdDogMDsgcmlnaHQ6IDA7IGJvdHRvbTogMDsKICAgICAgICAgICAgYmFja2dyb3VuZDogdmFyKC0tYmctYm9keSk7CiAgICAgICAgICAgIGRpc3BsYXk6IGZsZXg7CiAgICAgICAgICAgIGFsaWduLWl0ZW1zOiBjZW50ZXI7CiAgICAgICAgICAgIGp1c3RpZnktY29udGVudDogY2VudGVyOwogICAgICAgICAgICB6LWluZGV4OiAxMDA7CiAgICAgICAgICAgIHBhZGRpbmc6IDE2cHg7CiAgICAgICAgfQogICAgICAgIC5sb2dpbi1jYXJkIHsKICAgICAgICAgICAgYmFja2dyb3VuZDogdmFyKC0tYmctY2FyZCk7CiAgICAgICAgICAgIGJvcmRlcjogMXB4IHNvbGlkIHZhcigtLWJvcmRlci1jb2xvcik7CiAgICAgICAgICAgIGJvcmRlci1yYWRpdXM6IHZhcigtLXJhZGl1cy1sZyk7CiAgICAgICAgICAgIG1heC13aWR0aDogMzgwcHg7CiAgICAgICAgICAgIHdpZHRoOiAxMDAlOwogICAgICAgICAgICBwYWRkaW5nOiAzMnB4IDI4cHg7CiAgICAgICAgICAgIHRleHQtYWxpZ246IGNlbnRlcjsKICAgICAgICAgICAgYm94LXNoYWRvdzogMCAyMHB4IDI1cHggLTVweCByZ2JhKDAsIDAsIDAsIDAuNSk7CiAgICAgICAgfQogICAgICAgIC5sb2dpbi1sb2dvIHsKICAgICAgICAgICAgd2lkdGg6IDQ4cHg7CiAgICAgICAgICAgIGhlaWdodDogNDhweDsKICAgICAgICAgICAgYmFja2dyb3VuZDogbGluZWFyLWdyYWRpZW50KDEzNWRlZywgdmFyKC0tYWNjZW50KSwgdmFyKC0tY3lhbikpOwogICAgICAgICAgICBib3JkZXItcmFkaXVzOiAxMnB4OwogICAgICAgICAgICBtYXJnaW46IDAgYXV0byAxNnB4OwogICAgICAgICAgICBkaXNwbGF5OiBmbGV4OwogICAgICAgICAgICBhbGlnbi1pdGVtczogY2VudGVyOwogICAgICAgICAgICBqdXN0aWZ5LWNvbnRlbnQ6IGNlbnRlcjsKICAgICAgICAgICAgZm9udC1zaXplOiAxLjVyZW07CiAgICAgICAgICAgIGZvbnQtd2VpZ2h0OiA4MDA7CiAgICAgICAgICAgIGNvbG9yOiB3aGl0ZTsKICAgICAgICB9CgogICAgICAgIC8qIExvZ3MgQ29uc29sZSAqLwogICAgICAgIC5jb25zb2xlLWxvZ3MgewogICAgICAgICAgICBiYWNrZ3JvdW5kOiB2YXIoLS1iZy1pbnB1dCk7CiAgICAgICAgICAgIGJvcmRlcjogMXB4IHNvbGlkIHZhcigtLWJvcmRlci1jb2xvcik7CiAgICAgICAgICAgIGJvcmRlci1yYWRpdXM6IHZhcigtLXJhZGl1cy1tZCk7CiAgICAgICAgICAgIHBhZGRpbmc6IDEycHg7CiAgICAgICAgICAgIGZvbnQtZmFtaWx5OiBtb25vc3BhY2U7CiAgICAgICAgICAgIGZvbnQtc2l6ZTogMC44cmVtOwogICAgICAgICAgICBtYXgtaGVpZ2h0OiAzODBweDsKICAgICAgICAgICAgb3ZlcmZsb3cteTogYXV0bzsKICAgICAgICAgICAgY29sb3I6ICNjYmQ1ZTE7CiAgICAgICAgICAgIHdoaXRlLXNwYWNlOiBwcmUtd3JhcDsKICAgICAgICB9CgogICAgICAgIC5oaWRkZW4geyBkaXNwbGF5OiBub25lICFpbXBvcnRhbnQ7IH0KICAgIDwvc3R5bGU+CjwvaGVhZD4KPGJvZHk+CgogICAgPCEtLSBMb2dpbiBBdXRoZW50aWNhdGlvbiBWaWV3IC0tPgogICAgPGRpdiBpZD0ibG9naW4tc2NyZWVuIj4KICAgICAgICA8ZGl2IGNsYXNzPSJsb2dpbi1jYXJkIj4KICAgICAgICAgICAgPGRpdiBjbGFzcz0ibG9naW4tbG9nbyI+TDwvZGl2PgogICAgICAgICAgICA8aDIgc3R5bGU9ImZvbnQtc2l6ZTogMS4zcmVtOyBtYXJnaW4tYm90dG9tOiA2cHg7Ij5MdWNpUHJveHk8L2gyPgogICAgICAgICAgICA8cCBzdHlsZT0iZm9udC1zaXplOiAwLjg1cmVtOyBjb2xvcjogdmFyKC0tdGV4dC1tdXRlZCk7IG1hcmdpbi1ib3R0b206IDI0cHg7Ij5FbnRlciBhZG1pbmlzdHJhdGl2ZSBrZXkgdG8gbWFuYWdlIGVkZ2UgZ2F0ZXdheTwvcD4KICAgICAgICAgICAgPGZvcm0gaWQ9ImxvZ2luLWZvcm0iPgogICAgICAgICAgICAgICAgPGRpdiBjbGFzcz0iZm9ybS1ncm91cCIgc3R5bGU9InRleHQtYWxpZ246IGxlZnQ7Ij4KICAgICAgICAgICAgICAgICAgICA8bGFiZWwgY2xhc3M9ImZvcm0tbGFiZWwiIGZvcj0ibG9naW4ta2V5Ij5NYXN0ZXIgS2V5PC9sYWJlbD4KICAgICAgICAgICAgICAgICAgICA8aW5wdXQgdHlwZT0icGFzc3dvcmQiIGlkPSJsb2dpbi1rZXkiIGNsYXNzPSJpbnB1dCIgcGxhY2Vob2xkZXI9IuKAouKAouKAouKAouKAouKAouKAouKAoiIgYXV0b2ZvY3VzIHJlcXVpcmVkPgogICAgICAgICAgICAgICAgPC9kaXY+CiAgICAgICAgICAgICAgICA8ZGl2IGlkPSJsb2dpbi1lcnJvciIgc3R5bGU9ImNvbG9yOiB2YXIoLS1yZWQpOyBmb250LXNpemU6IDAuOHJlbTsgbWFyZ2luLWJvdHRvbTogMTJweDsgbWluLWhlaWdodDogMThweDsiPjwvZGl2PgogICAgICAgICAgICAgICAgPGJ1dHRvbiB0eXBlPSJzdWJtaXQiIGNsYXNzPSJidG4iIHN0eWxlPSJ3aWR0aDogMTAwJTsganVzdGlmeS1jb250ZW50OiBjZW50ZXI7Ij5TaWduIEluPC9idXR0b24+CiAgICAgICAgICAgIDwvZm9ybT4KICAgICAgICA8L2Rpdj4KICAgIDwvZGl2PgoKICAgIDwhLS0gVG9wIEhlYWRlciAtLT4KICAgIDxoZWFkZXI+CiAgICAgICAgPGRpdiBjbGFzcz0iYnJhbmQiPgogICAgICAgICAgICA8ZGl2IGNsYXNzPSJicmFuZC1iYWRnZSI+TDwvZGl2PgogICAgICAgICAgICA8c3Bhbj5MdWNpUHJveHk8L3NwYW4+CiAgICAgICAgPC9kaXY+CiAgICAgICAgPGRpdiBjbGFzcz0iaGVhZGVyLW1ldGEiPgogICAgICAgICAgICA8c3BhbiBpZD0iaGVhZGVyLWVkZ2UtY29sbyIgY2xhc3M9InN0YXR1cy1waWxsIj5FZGdlIE9ubGluZTwvc3Bhbj4KICAgICAgICAgICAgPHNwYW4gaWQ9ImhlYWRlci1kYi1waWxsIiBjbGFzcz0ic3RhdHVzLXBpbGwiPkQxIEFjdGl2ZTwvc3Bhbj4KICAgICAgICAgICAgPGJ1dHRvbiBjbGFzcz0iYnRuLWdob3N0IiBpZD0iYnRuLWxvZ291dCI+TG9nb3V0PC9idXR0b24+CiAgICAgICAgPC9kaXY+CiAgICA8L2hlYWRlcj4KCiAgICA8IS0tIE5hdmlnYXRpb24gVGFicyAtLT4KICAgIDxuYXY+CiAgICAgICAgPGRpdiBjbGFzcz0ibmF2LWl0ZW0gYWN0aXZlIiBkYXRhLXRhYj0idGFiLW92ZXJ2aWV3Ij5PdmVydmlldzwvZGl2PgogICAgICAgIDxkaXYgY2xhc3M9Im5hdi1pdGVtIiBkYXRhLXRhYj0idGFiLXN1YnNjcmliZXJzIj5TdWJzY3JpYmVyczwvZGl2PgogICAgICAgIDxkaXYgY2xhc3M9Im5hdi1pdGVtIiBkYXRhLXRhYj0idGFiLXNldHRpbmdzIj5TeXN0ZW0gQ29uZmlndXJhdGlvbjwvZGl2PgogICAgICAgIDxkaXYgY2xhc3M9Im5hdi1pdGVtIiBkYXRhLXRhYj0idGFiLWRpYWdub3N0aWNzIj5EaWFnbm9zdGljczwvZGl2PgogICAgICAgIDxkaXYgY2xhc3M9Im5hdi1pdGVtIiBkYXRhLXRhYj0idGFiLWxvZ3MiPkF1ZGl0IExvZ3M8L2Rpdj4KICAgIDwvbmF2PgoKICAgIDwhLS0gRHluYW1pYyBXYXJuaW5nIFBsYWNlaG9sZGVyIC0tPgogICAgPGRpdiBzdHlsZT0ibWF4LXdpZHRoOiAxMjAwcHg7IHdpZHRoOiAxMDAlOyBtYXJnaW46IDE2cHggYXV0byAwOyBwYWRkaW5nOiAwIDI0cHg7Ij4KICAgICAgICBfX0hBU19EQl9XQVJOSU5HX18KICAgIDwvZGl2PgoKICAgIDwhLS0gTWFpbiBXb3Jrc3BhY2UgLS0+CiAgICA8bWFpbj4KCiAgICAgICAgPCEtLSBUQUIgMTogT1ZFUlZJRVcgLS0+CiAgICAgICAgPHNlY3Rpb24gaWQ9InRhYi1vdmVydmlldyIgY2xhc3M9InRhYi1jb250ZW50Ij4KICAgICAgICAgICAgPGRpdiBjbGFzcz0ibWV0cmljcy1ncmlkIj4KICAgICAgICAgICAgICAgIDxkaXYgY2xhc3M9Im1ldHJpYy1jYXJkIj4KICAgICAgICAgICAgICAgICAgICA8c3BhbiBjbGFzcz0ibWV0cmljLWxhYmVsIj5BY3RpdmUgU3Vic2NyaWJlcnM8L3NwYW4+CiAgICAgICAgICAgICAgICAgICAgPHNwYW4gY2xhc3M9Im1ldHJpYy12YWx1ZSIgaWQ9InN0YXQtc3Vic2NyaWJlcnMiPjA8L3NwYW4+CiAgICAgICAgICAgICAgICA8L2Rpdj4KICAgICAgICAgICAgICAgIDxkaXYgY2xhc3M9Im1ldHJpYy1jYXJkIj4KICAgICAgICAgICAgICAgICAgICA8c3BhbiBjbGFzcz0ibWV0cmljLWxhYmVsIj5Ub3RhbCBCYW5kd2lkdGg8L3NwYW4+CiAgICAgICAgICAgICAgICAgICAgPHNwYW4gY2xhc3M9Im1ldHJpYy12YWx1ZSIgaWQ9InN0YXQtYmFuZHdpZHRoIj4wLjAwIEdCPC9zcGFuPgogICAgICAgICAgICAgICAgPC9kaXY+CiAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzPSJtZXRyaWMtY2FyZCI+CiAgICAgICAgICAgICAgICAgICAgPHNwYW4gY2xhc3M9Im1ldHJpYy1sYWJlbCI+Q2xvdWRmbGFyZSBDb2xvPC9zcGFuPgogICAgICAgICAgICAgICAgICAgIDxzcGFuIGNsYXNzPSJtZXRyaWMtdmFsdWUiIGlkPSJzdGF0LWNvbG8iPkVER0U8L3NwYW4+CiAgICAgICAgICAgICAgICA8L2Rpdj4KICAgICAgICAgICAgICAgIDxkaXYgY2xhc3M9Im1ldHJpYy1jYXJkIj4KICAgICAgICAgICAgICAgICAgICA8c3BhbiBjbGFzcz0ibWV0cmljLWxhYmVsIj5WZXJzaW9uPC9zcGFuPgogICAgICAgICAgICAgICAgICAgIDxzcGFuIGNsYXNzPSJtZXRyaWMtdmFsdWUiIHN0eWxlPSJmb250LXNpemU6IDEuM3JlbTsiPnZfX0NVUlJFTlRfVkVSU0lPTl9fPC9zcGFuPgogICAgICAgICAgICAgICAgPC9kaXY+CiAgICAgICAgICAgIDwvZGl2PgoKICAgICAgICAgICAgPGRpdiBjbGFzcz0iY2FyZCI+CiAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzPSJjYXJkLXRpdGxlIj4KICAgICAgICAgICAgICAgICAgICA8c3Bhbj5FZGdlIE5vZGUgSW5mb3JtYXRpb248L3NwYW4+CiAgICAgICAgICAgICAgICAgICAgPGJ1dHRvbiBjbGFzcz0iYnRuIGJ0bi1zbSBidG4tc2Vjb25kYXJ5IiBvbmNsaWNrPSJyZWZyZXNoT3ZlcnZpZXcoKSI+UmVmcmVzaCBNZXRyaWNzPC9idXR0b24+CiAgICAgICAgICAgICAgICA8L2Rpdj4KICAgICAgICAgICAgICAgIDxkaXYgc3R5bGU9ImRpc3BsYXk6IGdyaWQ7IGdyaWQtdGVtcGxhdGUtY29sdW1uczogcmVwZWF0KGF1dG8tZml0LCBtaW5tYXgoMjgwcHgsIDFmcikpOyBnYXA6IDE0cHg7IGZvbnQtc2l6ZTogMC44OHJlbTsiPgogICAgICAgICAgICAgICAgICAgIDxkaXY+PHNwYW4gc3R5bGU9ImNvbG9yOnZhcigtLXRleHQtbXV0ZWQpOyI+Q2xpZW50IEVncmVzcyBJUDo8L3NwYW4+IDxzdHJvbmcgaWQ9Im5vZGUtaXAiPuKAlDwvc3Ryb25nPjwvZGl2PgogICAgICAgICAgICAgICAgICAgIDxkaXY+PHNwYW4gc3R5bGU9ImNvbG9yOnZhcigtLXRleHQtbXV0ZWQpOyI+TG9jYXRpb246PC9zcGFuPiA8c3Ryb25nIGlkPSJub2RlLWxvYyI+4oCUPC9zdHJvbmc+PC9kaXY+CiAgICAgICAgICAgICAgICAgICAgPGRpdj48c3BhbiBzdHlsZT0iY29sb3I6dmFyKC0tdGV4dC1tdXRlZCk7Ij5Qcm90b2NvbCBNb2RlOjwvc3Bhbj4gPHN0cm9uZyBpZD0ibm9kZS1tb2RlIj5BbHBoYSAoVkxFU1MpPC9zdHJvbmc+PC9kaXY+CiAgICAgICAgICAgICAgICAgICAgPGRpdj48c3BhbiBzdHlsZT0iY29sb3I6dmFyKC0tdGV4dC1tdXRlZCk7Ij5TdWJzY3JpcHRpb24gUm91dGU6PC9zcGFuPiA8c3Ryb25nIGlkPSJub2RlLXN1Yi1yb3V0ZSI+L3N5bmM8L3N0cm9uZz48L2Rpdj4KICAgICAgICAgICAgICAgIDwvZGl2PgogICAgICAgICAgICA8L2Rpdj4KICAgICAgICA8L3NlY3Rpb24+CgogICAgICAgIDwhLS0gVEFCIDI6IFNVQlNDUklCRVJTIC0tPgogICAgICAgIDxzZWN0aW9uIGlkPSJ0YWItc3Vic2NyaWJlcnMiIGNsYXNzPSJ0YWItY29udGVudCBoaWRkZW4iPgogICAgICAgICAgICA8ZGl2IGNsYXNzPSJjYXJkIj4KICAgICAgICAgICAgICAgIDxkaXYgY2xhc3M9ImNhcmQtdGl0bGUiPgogICAgICAgICAgICAgICAgICAgIDxzcGFuPlN1YnNjcmliZXJzIE1hbmFnZW1lbnQ8L3NwYW4+CiAgICAgICAgICAgICAgICAgICAgPGRpdiBzdHlsZT0iZGlzcGxheTogZmxleDsgZ2FwOiA4cHg7Ij4KICAgICAgICAgICAgICAgICAgICAgICAgPGlucHV0IHR5cGU9InRleHQiIGlkPSJ1c2VyLXNlYXJjaCIgY2xhc3M9ImlucHV0IiBwbGFjZWhvbGRlcj0iU2VhcmNoIHN1YnNjcmliZXJzLi4uIiBzdHlsZT0id2lkdGg6IDIyMHB4OyBwYWRkaW5nOiA2cHggMTBweDsgZm9udC1zaXplOiAwLjgycmVtOyI+CiAgICAgICAgICAgICAgICAgICAgICAgIDxidXR0b24gY2xhc3M9ImJ0biBidG4tc20iIG9uY2xpY2s9Im9wZW5BZGRVc2VyTW9kYWwoKSI+KyBBZGQgU3Vic2NyaWJlcjwvYnV0dG9uPgogICAgICAgICAgICAgICAgICAgIDwvZGl2PgogICAgICAgICAgICAgICAgPC9kaXY+CiAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzPSJ0YWJsZS1yZXNwb25zaXZlIj4KICAgICAgICAgICAgICAgICAgICA8dGFibGU+CiAgICAgICAgICAgICAgICAgICAgICAgIDx0aGVhZD4KICAgICAgICAgICAgICAgICAgICAgICAgICAgIDx0cj4KICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA8dGg+TmFtZSAvIFVVSUQ8L3RoPgogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDx0aD5TdGF0dXM8L3RoPgogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDx0aD5UcmFmZmljIFVzZWQ8L3RoPgogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDx0aD5FeHBpcmF0aW9uPC90aD4KICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA8dGg+QWN0aW9uczwvdGg+CiAgICAgICAgICAgICAgICAgICAgICAgICAgICA8L3RyPgogICAgICAgICAgICAgICAgICAgICAgICA8L3RoZWFkPgogICAgICAgICAgICAgICAgICAgICAgICA8dGJvZHkgaWQ9InN1YnNjcmliZXJzLXRib2R5Ij4KICAgICAgICAgICAgICAgICAgICAgICAgICAgIDx0cj48dGQgY29sc3Bhbj0iNSIgc3R5bGU9InRleHQtYWxpZ246IGNlbnRlcjsgY29sb3I6IHZhcigtLXRleHQtbXV0ZWQpOyI+TG9hZGluZyBzdWJzY3JpYmVycy4uLjwvdGQ+PC90cj4KICAgICAgICAgICAgICAgICAgICAgICAgPC90Ym9keT4KICAgICAgICAgICAgICAgICAgICA8L3RhYmxlPgogICAgICAgICAgICAgICAgPC9kaXY+CiAgICAgICAgICAgIDwvZGl2PgogICAgICAgIDwvc2VjdGlvbj4KCiAgICAgICAgPCEtLSBUQUIgMzogU1lTVEVNIENPTkZJR1VSQVRJT04gLS0+CiAgICAgICAgPHNlY3Rpb24gaWQ9InRhYi1zZXR0aW5ncyIgY2xhc3M9InRhYi1jb250ZW50IGhpZGRlbiI+CiAgICAgICAgICAgIDxkaXYgY2xhc3M9ImNhcmQiPgogICAgICAgICAgICAgICAgPGRpdiBjbGFzcz0iY2FyZC10aXRsZSI+R2F0ZXdheSBTZXR0aW5nczwvZGl2PgogICAgICAgICAgICAgICAgPGZvcm0gaWQ9InNldHRpbmdzLWZvcm0iPgogICAgICAgICAgICAgICAgICAgIDxkaXYgc3R5bGU9ImRpc3BsYXk6IGdyaWQ7IGdyaWQtdGVtcGxhdGUtY29sdW1uczogcmVwZWF0KGF1dG8tZml0LCBtaW5tYXgoMjgwcHgsIDFmcikpOyBnYXA6IDE2cHg7Ij4KICAgICAgICAgICAgICAgICAgICAgICAgPGRpdiBjbGFzcz0iZm9ybS1ncm91cCI+CiAgICAgICAgICAgICAgICAgICAgICAgICAgICA8bGFiZWwgY2xhc3M9ImZvcm0tbGFiZWwiPlN1YnNjcmlwdGlvbiBSb3V0ZSAoU2VjcmV0IFBhdGgpPC9sYWJlbD4KICAgICAgICAgICAgICAgICAgICAgICAgICAgIDxpbnB1dCB0eXBlPSJ0ZXh0IiBpZD0iY2ZnLWFwaS1yb3V0ZSIgY2xhc3M9ImlucHV0IiB2YWx1ZT0ic3luYyIgcmVxdWlyZWQ+CiAgICAgICAgICAgICAgICAgICAgICAgIDwvZGl2PgogICAgICAgICAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzPSJmb3JtLWdyb3VwIj4KICAgICAgICAgICAgICAgICAgICAgICAgICAgIDxsYWJlbCBjbGFzcz0iZm9ybS1sYWJlbCI+UHJvdG9jb2wgTW9kZTwvbGFiZWw+CiAgICAgICAgICAgICAgICAgICAgICAgICAgICA8c2VsZWN0IGlkPSJjZmctbW9kZSIgY2xhc3M9InNlbGVjdCI+CiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgPG9wdGlvbiB2YWx1ZT0iYWxwaGEiPkFscGhhIOKAlCBWTEVTUyBvdmVyIFdlYlNvY2tldCAoUmVjb21tZW5kZWQpPC9vcHRpb24+CiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgPG9wdGlvbiB2YWx1ZT0iYmV0YSI+QmV0YSDigJQgVHJvamFuIG92ZXIgV2ViU29ja2V0PC9vcHRpb24+CiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgPG9wdGlvbiB2YWx1ZT0iYm90aCI+Qm90aCDigJQgRHVhbCBWTEVTUyAmIFRyb2phbiBPdXRib3VuZHM8L29wdGlvbj4KICAgICAgICAgICAgICAgICAgICAgICAgICAgIDwvc2VsZWN0PgogICAgICAgICAgICAgICAgICAgICAgICA8L2Rpdj4KICAgICAgICAgICAgICAgICAgICAgICAgPGRpdiBjbGFzcz0iZm9ybS1ncm91cCI+CiAgICAgICAgICAgICAgICAgICAgICAgICAgICA8bGFiZWwgY2xhc3M9ImZvcm0tbGFiZWwiPlVwZGF0ZSBNYXN0ZXIgUGFzc3dvcmQgKGxlYXZlIGJsYW5rIHRvIGtlZXApPC9sYWJlbD4KICAgICAgICAgICAgICAgICAgICAgICAgICAgIDxpbnB1dCB0eXBlPSJwYXNzd29yZCIgaWQ9ImNmZy1tYXN0ZXIta2V5IiBjbGFzcz0iaW5wdXQiIHBsYWNlaG9sZGVyPSJOZXcgbWFzdGVyIGtleSIgYXV0b2NvbXBsZXRlPSJuZXctcGFzc3dvcmQiPgogICAgICAgICAgICAgICAgICAgICAgICA8L2Rpdj4KICAgICAgICAgICAgICAgICAgICAgICAgPGRpdiBjbGFzcz0iZm9ybS1ncm91cCI+CiAgICAgICAgICAgICAgICAgICAgICAgICAgICA8bGFiZWwgY2xhc3M9ImZvcm0tbGFiZWwiPkRlZmF1bHQgRmluYWwgTWFzayAoI2ZpbmFsTWFzayBmcmFnbWVudCwgb3B0aW9uYWwpPC9sYWJlbD4KICAgICAgICAgICAgICAgICAgICAgICAgICAgIDxpbnB1dCB0eXBlPSJ0ZXh0IiBpZD0iY2ZnLWZpbmFsLW1hc2siIGNsYXNzPSJpbnB1dCIgcGxhY2Vob2xkZXI9ImUuZy4gTHVjaS1GYXN0IChlbXB0eSBmb3IgZGVmYXVsdCB0YWcgI3ZOYW1lKSI+CiAgICAgICAgICAgICAgICAgICAgICAgIDwvZGl2PgogICAgICAgICAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzPSJmb3JtLWdyb3VwIj4KICAgICAgICAgICAgICAgICAgICAgICAgICAgIDxsYWJlbCBjbGFzcz0iZm9ybS1sYWJlbCI+Q3VzdG9tIERvSCBSZXNvbHZlcjwvbGFiZWw+CiAgICAgICAgICAgICAgICAgICAgICAgICAgICA8aW5wdXQgdHlwZT0idGV4dCIgaWQ9ImNmZy1jdXN0b20tZG5zIiBjbGFzcz0iaW5wdXQiIHZhbHVlPSJodHRwczovL2Nsb3VkZmxhcmUtZG5zLmNvbS9kbnMtcXVlcnkiPgogICAgICAgICAgICAgICAgICAgICAgICA8L2Rpdj4KICAgICAgICAgICAgICAgICAgICA8L2Rpdj4KCiAgICAgICAgICAgICAgICAgICAgPGRpdiBjbGFzcz0iZm9ybS1ncm91cCI+CiAgICAgICAgICAgICAgICAgICAgICAgIDxsYWJlbCBjbGFzcz0iZm9ybS1sYWJlbCI+Q2xlYW4gQ0ROIElQIEFkZHJlc3NlcyAob25lIHBlciBsaW5lLCBlLmcuIDEwNC4xNi4xLjEjQ2xvdWRmbGFyZSk8L2xhYmVsPgogICAgICAgICAgICAgICAgICAgICAgICA8dGV4dGFyZWEgaWQ9ImNmZy1jbGVhbi1pcHMiIGNsYXNzPSJ0ZXh0YXJlYSIgcm93cz0iNCIgcGxhY2Vob2xkZXI9IjEwNC4xNi4xLjEjQ0YxJiMxMDsxNzIuNjQuMC4xI0NGMiI+PC90ZXh0YXJlYT4KICAgICAgICAgICAgICAgICAgICA8L2Rpdj4KCiAgICAgICAgICAgICAgICAgICAgPGRpdiBjbGFzcz0iZm9ybS1ncm91cCI+CiAgICAgICAgICAgICAgICAgICAgICAgIDxsYWJlbCBjbGFzcz0iZm9ybS1sYWJlbCI+VXBzdHJlYW0gUHJveHkgLyBCYWNrdXAgUmVsYXlzIChvbmUgcGVyIGxpbmUsIGUuZy4gMS4yLjMuNDo0NDMpPC9sYWJlbD4KICAgICAgICAgICAgICAgICAgICAgICAgPHRleHRhcmVhIGlkPSJjZmctYmFja3VwLXJlbGF5IiBjbGFzcz0idGV4dGFyZWEiIHJvd3M9IjMiIHBsYWNlaG9sZGVyPSIxLjIuMy40OjQ0MyI+PC90ZXh0YXJlYT4KICAgICAgICAgICAgICAgICAgICA8L2Rpdj4KCiAgICAgICAgICAgICAgICAgICAgPGRpdiBjbGFzcz0iZm9ybS1ncm91cCI+CiAgICAgICAgICAgICAgICAgICAgICAgIDxkaXYgc3R5bGU9ImRpc3BsYXk6IGZsZXg7IGp1c3RpZnktY29udGVudDogc3BhY2UtYmV0d2VlbjsgYWxpZ24taXRlbXM6IGNlbnRlcjsgbWFyZ2luLWJvdHRvbTogNnB4OyI+CiAgICAgICAgICAgICAgICAgICAgICAgICAgICA8bGFiZWwgY2xhc3M9ImZvcm0tbGFiZWwiIHN0eWxlPSJtYXJnaW4tYm90dG9tOjA7Ij5HbG9iYWwgRUNIIENvbmZpZ3VyYXRpb25zICg8c3BhbiBpZD0iY2ZnLWVjaC1jb3VudCI+NjA8L3NwYW4+IGFjdGl2ZSk8L2xhYmVsPgogICAgICAgICAgICAgICAgICAgICAgICAgICAgPGRpdiBzdHlsZT0iZGlzcGxheTpmbGV4OyBnYXA6NnB4OyI+CiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgPGJ1dHRvbiB0eXBlPSJidXR0b24iIGNsYXNzPSJidG4gYnRuLXNtIGJ0bi1zZWNvbmRhcnkiIG9uY2xpY2s9InJlc2V0R2xvYmFsRWNoRGVmYXVsdHMoKSI+UmVzZXQgNjAgRGVmYXVsdHM8L2J1dHRvbj4KICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA8YnV0dG9uIHR5cGU9ImJ1dHRvbiIgY2xhc3M9ImJ0biBidG4tc20gYnRuLXNlY29uZGFyeSIgb25jbGljaz0iY2xlYXJHbG9iYWxFY2goKSI+Q2xlYXIgQWxsPC9idXR0b24+CiAgICAgICAgICAgICAgICAgICAgICAgICAgICA8L2Rpdj4KICAgICAgICAgICAgICAgICAgICAgICAgPC9kaXY+CiAgICAgICAgICAgICAgICAgICAgICAgIDx0ZXh0YXJlYSBpZD0iY2ZnLWVjaC1saXN0IiBjbGFzcz0idGV4dGFyZWEiIHJvd3M9IjYiIHBsYWNlaG9sZGVyPSJkb21haW4rdWRwOi8vaXAgKG9uZSBwZXIgbGluZSkiIG9uaW5wdXQ9InVwZGF0ZUdsb2JhbEVjaENvdW50KCkiPjwvdGV4dGFyZWE+CiAgICAgICAgICAgICAgICAgICAgICAgIDxzbWFsbCBzdHlsZT0iY29sb3I6dmFyKC0tdGV4dC1tdXRlZCk7IGZvbnQtc2l6ZTowLjc1cmVtOyI+Q29uZmlndXJhYmxlIGVjaENvbmZpZ0xpc3QuIEVhY2ggYmFzZSBzdWJzY3JpcHRpb24gbXVsdGlwbGllcyBhY3Jvc3MgZWFjaCBhY3RpdmUgRUNIIGVudHJ5ICgmYW1wO2VjaD0uLi4pLjwvc21hbGw+CiAgICAgICAgICAgICAgICAgICAgPC9kaXY+CgogICAgICAgICAgICAgICAgICAgIDxkaXYgc3R5bGU9ImRpc3BsYXk6IGZsZXg7IGdhcDogMTJweDsgbWFyZ2luLXRvcDogMjBweDsiPgogICAgICAgICAgICAgICAgICAgICAgICA8YnV0dG9uIHR5cGU9InN1Ym1pdCIgY2xhc3M9ImJ0biI+U2F2ZSBDb25maWd1cmF0aW9uPC9idXR0b24+CiAgICAgICAgICAgICAgICAgICAgICAgIDxidXR0b24gdHlwZT0iYnV0dG9uIiBjbGFzcz0iYnRuIGJ0bi1zZWNvbmRhcnkiIG9uY2xpY2s9ImV4cG9ydFNoYXJlZFNldHRpbmdzKCkiPkV4cG9ydCBTZXR0aW5nczwvYnV0dG9uPgogICAgICAgICAgICAgICAgICAgIDwvZGl2PgogICAgICAgICAgICAgICAgPC9mb3JtPgogICAgICAgICAgICA8L2Rpdj4KICAgICAgICA8L3NlY3Rpb24+CgogICAgICAgIDwhLS0gVEFCIDQ6IERJQUdOT1NUSUNTIC0tPgogICAgICAgIDxzZWN0aW9uIGlkPSJ0YWItZGlhZ25vc3RpY3MiIGNsYXNzPSJ0YWItY29udGVudCBoaWRkZW4iPgogICAgICAgICAgICA8ZGl2IGNsYXNzPSJjYXJkIj4KICAgICAgICAgICAgICAgIDxkaXYgY2xhc3M9ImNhcmQtdGl0bGUiPlRDUCBQcm94eS1JUCBIZWFsdGggJiBMYXRlbmN5IFByb2JlPC9kaXY+CiAgICAgICAgICAgICAgICA8ZGl2IHN0eWxlPSJkaXNwbGF5OiBmbGV4OyBnYXA6IDhweDsgbWFyZ2luLWJvdHRvbTogMTZweDsiPgogICAgICAgICAgICAgICAgICAgIDxpbnB1dCB0eXBlPSJ0ZXh0IiBpZD0iZGlhZy10YXJnZXQtaXAiIGNsYXNzPSJpbnB1dCIgcGxhY2Vob2xkZXI9IlRhcmdldCBQcm94eSBJUCBvciBEb21haW4gKGUuZy4gMTA0LjE2LjEuMSkiIHN0eWxlPSJmbGV4OjE7Ij4KICAgICAgICAgICAgICAgICAgICA8YnV0dG9uIGNsYXNzPSJidG4iIG9uY2xpY2s9InJ1blByb3h5SXBQcm9iZSgpIj5UZXN0IEVuZHBvaW50PC9idXR0b24+CiAgICAgICAgICAgICAgICA8L2Rpdj4KICAgICAgICAgICAgICAgIDxkaXYgaWQ9ImRpYWctcmVzdWx0cyIgY2xhc3M9ImNvbnNvbGUtbG9ncyI+QXdhaXRpbmcgdGVzdCBleGVjdXRpb24uLi48L2Rpdj4KICAgICAgICAgICAgPC9kaXY+CiAgICAgICAgPC9zZWN0aW9uPgoKICAgICAgICA8IS0tIFRBQiA1OiBBVURJVCBMT0dTIC0tPgogICAgICAgIDxzZWN0aW9uIGlkPSJ0YWItbG9ncyIgY2xhc3M9InRhYi1jb250ZW50IGhpZGRlbiI+CiAgICAgICAgICAgIDxkaXYgY2xhc3M9ImNhcmQiPgogICAgICAgICAgICAgICAgPGRpdiBjbGFzcz0iY2FyZC10aXRsZSI+CiAgICAgICAgICAgICAgICAgICAgPHNwYW4+UmVjZW50IEFjdGl2aXR5IExvZ3M8L3NwYW4+CiAgICAgICAgICAgICAgICAgICAgPGJ1dHRvbiBjbGFzcz0iYnRuIGJ0bi1zbSBidG4tZGFuZ2VyIiBvbmNsaWNrPSJjbGVhckF1ZGl0TG9ncygpIj5DbGVhciBMb2dzPC9idXR0b24+CiAgICAgICAgICAgICAgICA8L2Rpdj4KICAgICAgICAgICAgICAgIDxkaXYgaWQ9ImF1ZGl0LWxvZ3MtY29uc29sZSIgY2xhc3M9ImNvbnNvbGUtbG9ncyI+TG9hZGluZyBhdWRpdCByZWNvcmRzLi4uPC9kaXY+CiAgICAgICAgICAgIDwvZGl2PgogICAgICAgIDwvc2VjdGlvbj4KCiAgICA8L21haW4+CgogICAgPCEtLSBNb2RhbDogQWRkIC8gRWRpdCBTdWJzY3JpYmVyIC0tPgogICAgPGRpdiBpZD0ibW9kYWwtdXNlciIgY2xhc3M9Im1vZGFsLW92ZXJsYXkiPgogICAgICAgIDxkaXYgY2xhc3M9Im1vZGFsIj4KICAgICAgICAgICAgPGgzIGlkPSJtb2RhbC11c2VyLXRpdGxlIiBzdHlsZT0ibWFyZ2luLWJvdHRvbTogMTZweDsiPkFkZCBOZXcgU3Vic2NyaWJlcjwvaDM+CiAgICAgICAgICAgIDxmb3JtIGlkPSJmb3JtLXVzZXIiPgogICAgICAgICAgICAgICAgPGlucHV0IHR5cGU9ImhpZGRlbiIgaWQ9InVzZXItZWRpdC1pZCI+CiAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzPSJmb3JtLWdyb3VwIj4KICAgICAgICAgICAgICAgICAgICA8bGFiZWwgY2xhc3M9ImZvcm0tbGFiZWwiPlN1YnNjcmliZXIgTmFtZTwvbGFiZWw+CiAgICAgICAgICAgICAgICAgICAgPGlucHV0IHR5cGU9InRleHQiIGlkPSJmb3JtLXVzZXItbmFtZSIgY2xhc3M9ImlucHV0IiBwbGFjZWhvbGRlcj0iZS5nLiBBbGljZSIgcmVxdWlyZWQ+CiAgICAgICAgICAgICAgICA8L2Rpdj4KICAgICAgICAgICAgICAgIDxkaXYgY2xhc3M9ImZvcm0tZ3JvdXAiPgogICAgICAgICAgICAgICAgICAgIDxsYWJlbCBjbGFzcz0iZm9ybS1sYWJlbCI+VG90YWwgQmFuZHdpZHRoIExpbWl0IChHQiwgMCA9IFVubGltaXRlZCk8L2xhYmVsPgogICAgICAgICAgICAgICAgICAgIDxpbnB1dCB0eXBlPSJudW1iZXIiIGlkPSJmb3JtLXVzZXItbGltaXQtZ2IiIGNsYXNzPSJpbnB1dCIgdmFsdWU9IjAiIG1pbj0iMCIgc3RlcD0iMC41Ij4KICAgICAgICAgICAgICAgIDwvZGl2PgogICAgICAgICAgICAgICAgPGRpdiBjbGFzcz0iZm9ybS1ncm91cCI+CiAgICAgICAgICAgICAgICAgICAgPGxhYmVsIGNsYXNzPSJmb3JtLWxhYmVsIj5FeHBpcmF0aW9uIERhdGUgKFlZWVktTU0tREQsIGJsYW5rID0gTm8gRXhwaXJ5KTwvbGFiZWw+CiAgICAgICAgICAgICAgICAgICAgPGlucHV0IHR5cGU9ImRhdGUiIGlkPSJmb3JtLXVzZXItZXhwaXJ5IiBjbGFzcz0iaW5wdXQiPgogICAgICAgICAgICAgICAgPC9kaXY+CiAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzPSJmb3JtLWdyb3VwIj4KICAgICAgICAgICAgICAgICAgICA8bGFiZWwgY2xhc3M9ImZvcm0tbGFiZWwiPkNsZWFuIENETiBJUHMgKG9uZSBwZXIgbGluZSwgZGVmYXVsdDogd3d3LnNwZWVkdGVzdC5uZXQpPC9sYWJlbD4KICAgICAgICAgICAgICAgICAgICA8dGV4dGFyZWEgaWQ9ImZvcm0tdXNlci1jbGVhbi1pcCIgY2xhc3M9InRleHRhcmVhIiByb3dzPSIyIiBwbGFjZWhvbGRlcj0id3d3LnNwZWVkdGVzdC5uZXQiIG9uaW5wdXQ9InVwZGF0ZVN1YnNjcmliZXJDb25maWdQcmV2aWV3KCkiPjwvdGV4dGFyZWE+CiAgICAgICAgICAgICAgICA8L2Rpdj4KICAgICAgICAgICAgICAgIDxkaXYgY2xhc3M9ImZvcm0tZ3JvdXAiPgogICAgICAgICAgICAgICAgICAgIDxsYWJlbCBjbGFzcz0iZm9ybS1sYWJlbCI+U3Vic2NyaXB0aW9uIEZpbmFsIE1hc2sgKCNmaW5hbE1hc2sgZnJhZ21lbnQsIG9wdGlvbmFsKTwvbGFiZWw+CiAgICAgICAgICAgICAgICAgICAgPGlucHV0IHR5cGU9InRleHQiIGlkPSJmb3JtLXVzZXItZmluYWwtbWFzayIgY2xhc3M9ImlucHV0IiBwbGFjZWhvbGRlcj0iTGVhdmUgZW1wdHkgdG8gaW5oZXJpdCBnbG9iYWwgc2V0dGluZyI+CiAgICAgICAgICAgICAgICA8L2Rpdj4KICAgICAgICAgICAgICAgIDxkaXYgY2xhc3M9ImZvcm0tZ3JvdXAiPgogICAgICAgICAgICAgICAgICAgIDxsYWJlbCBjbGFzcz0iZm9ybS1sYWJlbCI+RUNIIENvbmZpZ3VyYXRpb248L2xhYmVsPgogICAgICAgICAgICAgICAgICAgIDxkaXYgc3R5bGU9ImRpc3BsYXk6ZmxleDsgZ2FwOjE2cHg7IG1hcmdpbi1ib3R0b206OHB4OyBmb250LXNpemU6MC44NXJlbTsiPgogICAgICAgICAgICAgICAgICAgICAgICA8bGFiZWwgc3R5bGU9ImRpc3BsYXk6ZmxleDsgYWxpZ24taXRlbXM6Y2VudGVyOyBnYXA6NnB4OyBjdXJzb3I6cG9pbnRlcjsiPgogICAgICAgICAgICAgICAgICAgICAgICAgICAgPGlucHV0IHR5cGU9InJhZGlvIiBuYW1lPSJmb3JtLXVzZXItZWNoLW1vZGUiIGlkPSJlY2gtbW9kZS1pbmhlcml0IiB2YWx1ZT0iaW5oZXJpdCIgY2hlY2tlZCBvbmNoYW5nZT0idG9nZ2xlVXNlckVjaE1vZGUoKSI+CiAgICAgICAgICAgICAgICAgICAgICAgICAgICBJbmhlcml0IEdsb2JhbCBFQ0ggKDxzcGFuIGlkPSJ1c2VyLWVjaC1pbmhlcml0LWNvdW50Ij42MDwvc3Bhbj4pCiAgICAgICAgICAgICAgICAgICAgICAgIDwvbGFiZWw+CiAgICAgICAgICAgICAgICAgICAgICAgIDxsYWJlbCBzdHlsZT0iZGlzcGxheTpmbGV4OyBhbGlnbi1pdGVtczpjZW50ZXI7IGdhcDo2cHg7IGN1cnNvcjpwb2ludGVyOyI+CiAgICAgICAgICAgICAgICAgICAgICAgICAgICA8aW5wdXQgdHlwZT0icmFkaW8iIG5hbWU9ImZvcm0tdXNlci1lY2gtbW9kZSIgaWQ9ImVjaC1tb2RlLWN1c3RvbSIgdmFsdWU9ImN1c3RvbSIgb25jaGFuZ2U9InRvZ2dsZVVzZXJFY2hNb2RlKCkiPgogICAgICAgICAgICAgICAgICAgICAgICAgICAgQ3VzdG9tIEVDSCBMaXN0CiAgICAgICAgICAgICAgICAgICAgICAgIDwvbGFiZWw+CiAgICAgICAgICAgICAgICAgICAgPC9kaXY+CiAgICAgICAgICAgICAgICAgICAgPGRpdiBpZD0iZm9ybS11c2VyLWVjaC1jdXN0b20td3JhcCIgY2xhc3M9ImhpZGRlbiI+CiAgICAgICAgICAgICAgICAgICAgICAgIDxkaXYgc3R5bGU9ImRpc3BsYXk6IGZsZXg7IGp1c3RpZnktY29udGVudDogc3BhY2UtYmV0d2VlbjsgYWxpZ24taXRlbXM6IGNlbnRlcjsgbWFyZ2luLWJvdHRvbTogNHB4OyI+CiAgICAgICAgICAgICAgICAgICAgICAgICAgICA8c3BhbiBzdHlsZT0iZm9udC1zaXplOjAuNzVyZW07IGNvbG9yOnZhcigtLXRleHQtbXV0ZWQpOyI+T25lIEVDSCBjb25maWcgcGVyIGxpbmU6PC9zcGFuPgogICAgICAgICAgICAgICAgICAgICAgICAgICAgPGRpdiBzdHlsZT0iZGlzcGxheTpmbGV4OyBnYXA6NHB4OyI+CiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgPGJ1dHRvbiB0eXBlPSJidXR0b24iIGNsYXNzPSJidG4gYnRuLXNtIGJ0bi1zZWNvbmRhcnkiIHN0eWxlPSJwYWRkaW5nOjJweCA4cHg7IGZvbnQtc2l6ZTowLjc1cmVtOyIgb25jbGljaz0iY29weUdsb2JhbEVjaFRvVXNlcigpIj5Db3B5IEdsb2JhbDwvYnV0dG9uPgogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDxidXR0b24gdHlwZT0iYnV0dG9uIiBjbGFzcz0iYnRuIGJ0bi1zbSBidG4tc2Vjb25kYXJ5IiBzdHlsZT0icGFkZGluZzoycHggOHB4OyBmb250LXNpemU6MC43NXJlbTsiIG9uY2xpY2s9InJlc2V0VXNlckVjaERlZmF1bHRzKCkiPlJlc2V0IERlZmF1bHRzPC9idXR0b24+CiAgICAgICAgICAgICAgICAgICAgICAgICAgICA8L2Rpdj4KICAgICAgICAgICAgICAgICAgICAgICAgPC9kaXY+CiAgICAgICAgICAgICAgICAgICAgICAgIDx0ZXh0YXJlYSBpZD0iZm9ybS11c2VyLWVjaC1saXN0IiBjbGFzcz0idGV4dGFyZWEiIHJvd3M9IjQiIHBsYWNlaG9sZGVyPSJkb21haW4rdWRwOi8vaXAgKG9uZSBwZXIgbGluZSkiIG9uaW5wdXQ9InVwZGF0ZVN1YnNjcmliZXJDb25maWdQcmV2aWV3KCkiPjwvdGV4dGFyZWE+CiAgICAgICAgICAgICAgICAgICAgPC9kaXY+CiAgICAgICAgICAgICAgICA8L2Rpdj4KICAgICAgICAgICAgICAgIDxkaXYgaWQ9ImZvcm0tdXNlci1jYWxjLXByZXZpZXciIHN0eWxlPSJiYWNrZ3JvdW5kOnZhcigtLWJnLWlucHV0KTsgcGFkZGluZzoxMHB4OyBib3JkZXItcmFkaXVzOnZhcigtLXJhZGl1cy1tZCk7IGJvcmRlcjoxcHggc29saWQgdmFyKC0tYm9yZGVyLWNvbG9yKTsgbWFyZ2luLXRvcDoxMnB4OyBmb250LXNpemU6MC44MnJlbTsgY29sb3I6dmFyKC0tdGV4dC1tYWluKTsiPgogICAgICAgICAgICAgICAgICAgIDxzcGFuIHN0eWxlPSJmb250LXdlaWdodDo2MDA7IGNvbG9yOnZhcigtLWFjY2VudCk7Ij5Db25maWcgTXVsdGlwbGllcjo8L3NwYW4+CiAgICAgICAgICAgICAgICAgICAgPHNwYW4gaWQ9ImZvcm0tdXNlci1jYWxjLXRleHQiPjIgYmFzZSBlbmRwb2ludHMgw5cgNjAgRUNIIGNvbmZpZ3MgPSAxMjAgdG90YWwgY29uZmlnczwvc3Bhbj4KICAgICAgICAgICAgICAgIDwvZGl2PgogICAgICAgICAgICAgICAgPGRpdiBzdHlsZT0iZGlzcGxheTogZmxleDsganVzdGlmeS1jb250ZW50OiBmbGV4LWVuZDsgZ2FwOiA4cHg7IG1hcmdpbi10b3A6IDIwcHg7Ij4KICAgICAgICAgICAgICAgICAgICA8YnV0dG9uIHR5cGU9ImJ1dHRvbiIgY2xhc3M9ImJ0biBidG4tc2Vjb25kYXJ5IiBvbmNsaWNrPSJjbG9zZVVzZXJNb2RhbCgpIj5DYW5jZWw8L2J1dHRvbj4KICAgICAgICAgICAgICAgICAgICA8YnV0dG9uIHR5cGU9InN1Ym1pdCIgY2xhc3M9ImJ0biI+U2F2ZSBTdWJzY3JpYmVyPC9idXR0b24+CiAgICAgICAgICAgICAgICA8L2Rpdj4KICAgICAgICAgICAgPC9mb3JtPgogICAgICAgIDwvZGl2PgogICAgPC9kaXY+CgogICAgPCEtLSBNb2RhbDogU3Vic2NyaXB0aW9uIExpbmtzIEV4cG9ydCAtLT4KICAgIDxkaXYgaWQ9Im1vZGFsLWxpbmtzIiBjbGFzcz0ibW9kYWwtb3ZlcmxheSI+CiAgICAgICAgPGRpdiBjbGFzcz0ibW9kYWwiPgogICAgICAgICAgICA8aDMgc3R5bGU9Im1hcmdpbi1ib3R0b206IDE0cHg7Ij5TdWJzY3JpYmVyIFN1YnNjcmlwdGlvbiBMaW5rczwvaDM+CiAgICAgICAgICAgIDxkaXYgaWQ9Im1vZGFsLWxpbmtzLWNvbnRlbnQiIHN0eWxlPSJkaXNwbGF5OiBmbGV4OyBmbGV4LWRpcmVjdGlvbjogY29sdW1uOyBnYXA6IDEycHg7IGZvbnQtc2l6ZTogMC44NXJlbTsiPjwvZGl2PgogICAgICAgICAgICA8ZGl2IHN0eWxlPSJkaXNwbGF5OiBmbGV4OyBqdXN0aWZ5LWNvbnRlbnQ6IGZsZXgtZW5kOyBtYXJnaW4tdG9wOiAyMHB4OyI+CiAgICAgICAgICAgICAgICA8YnV0dG9uIHR5cGU9ImJ1dHRvbiIgY2xhc3M9ImJ0biBidG4tc2Vjb25kYXJ5IiBvbmNsaWNrPSJjbG9zZUxpbmtzTW9kYWwoKSI+Q2xvc2U8L2J1dHRvbj4KICAgICAgICAgICAgPC9kaXY+CiAgICAgICAgPC9kaXY+CiAgICA8L2Rpdj4KCiAgICA8IS0tIENsaWVudC1TaWRlIEFwcGxpY2F0aW9uIERyaXZlciAtLT4KICAgIDxzY3JpcHQ+CiAgICAgICAgY29uc3Qgc3RhdGUgPSB7CiAgICAgICAgICAgIG1hc3RlcktleTogJycsCiAgICAgICAgICAgIGNvbmZpZzoge30sCiAgICAgICAgICAgIHVzZXJzOiBbXSwKICAgICAgICAgICAgYXBpUm91dGU6IChmdW5jdGlvbigpIHsKICAgICAgICAgICAgICAgIGxldCByID0gJ19fQVBJX1JPVVRFX18nOwogICAgICAgICAgICAgICAgaWYgKCFyIHx8IHIuaW5jbHVkZXMoJ0FQSV9ST1VURScpKSB7CiAgICAgICAgICAgICAgICAgICAgY29uc3QgcGFydHMgPSB3aW5kb3cubG9jYXRpb24ucGF0aG5hbWUuc3BsaXQoJy8nKS5maWx0ZXIoQm9vbGVhbik7CiAgICAgICAgICAgICAgICAgICAgciA9IHBhcnRzWzBdIHx8ICdzeW5jJzsKICAgICAgICAgICAgICAgIH0KICAgICAgICAgICAgICAgIHJldHVybiByLnJlcGxhY2UoL1teYS16QS1aMC05Xy1dL2csICcnKSB8fCAnc3luYyc7CiAgICAgICAgICAgIH0pKCksCiAgICAgICAgICAgIHN5c1VzYWdlOiB7fSwKICAgICAgICB9OwoKICAgICAgICBjb25zdCBERUZBVUxUX0VDSF9DT05GSUdTID0gWwogICAgICAgICAgICAiY2xvdWRmbGFyZS1lY2guY29tK3VkcDovLzEuMS4xLjEiLAogICAgICAgICAgICAiZ2VlZG8uY29tK3VkcDovLzEuMS4xLjEiLAogICAgICAgICAgICAidHJ1c3RlZHN0YWNrLmNvbSt1ZHA6Ly8xLjEuMS4xIiwKICAgICAgICAgICAgImRpc2NvcmRhcHAuY29tK3VkcDovLzEuMS4xLjEiLAogICAgICAgICAgICAiYXkuZGVsaXZlcnkrdWRwOi8vMS4xLjEuMSIsCiAgICAgICAgICAgICJpZmNvbmZpZy5pbyt1ZHA6Ly8xLjEuMS4xIiwKICAgICAgICAgICAgIm15Z2FydS5jb20rdWRwOi8vMS4xLjEuMSIsCiAgICAgICAgICAgICJtZ2FydS5kZXYrdWRwOi8vMS4xLjEuMSIsCiAgICAgICAgICAgICJhZHRhcmdldC5jb20udHIrdWRwOi8vMS4xLjEuMSIsCiAgICAgICAgICAgICJydGJzeXN0ZW0uY29tK3VkcDovLzEuMS4xLjEiLAogICAgICAgICAgICAicHJlc3RpdGkuaXQrdWRwOi8vMS4xLjEuMSIsCiAgICAgICAgICAgICJhbGwuYml6K3VkcDovLzEuMS4xLjEiLAogICAgICAgICAgICAiY2RuZm9udHMuY29tK3VkcDovLzEuMS4xLjEiLAogICAgICAgICAgICAieGxpdnJkci5jb20rdWRwOi8vMS4xLjEuMSIsCiAgICAgICAgICAgICJhc3NpY3VyYXppb25pb25saW5lLml0K3VkcDovLzEuMS4xLjEiLAogICAgICAgICAgICAidm9pcHN0dW50LmNvbSt1ZHA6Ly8xLjEuMS4xIiwKICAgICAgICAgICAgInJhd2dpdC5jb20rdWRwOi8vMS4xLjEuMSIsCiAgICAgICAgICAgICJsb3VkZWNoby5haSt1ZHA6Ly8xLjEuMS4xIiwKICAgICAgICAgICAgInZvaXBidXN0ZXIuY29tK3VkcDovLzEuMS4xLjEiLAogICAgICAgICAgICAiYWRzdGVyLnRlY2grdWRwOi8vMS4xLjEuMSIsCiAgICAgICAgICAgICJjbG91ZGZsYXJlLWVjaC5jb20rdWRwOi8vOC44LjguOCIsCiAgICAgICAgICAgICJnZWVkby5jb20rdWRwOi8vOC44LjguOCIsCiAgICAgICAgICAgICJ0cnVzdGVkc3RhY2suY29tK3VkcDovLzguOC44LjgiLAogICAgICAgICAgICAiZGlzY29yZGFwcC5jb20rdWRwOi8vOC44LjguOCIsCiAgICAgICAgICAgICJheS5kZWxpdmVyeSt1ZHA6Ly84LjguOC44IiwKICAgICAgICAgICAgImlmY29uZmlnLmlvK3VkcDovLzguOC44LjgiLAogICAgICAgICAgICAibXlnYXJ1LmNvbSt1ZHA6Ly84LjguOC44IiwKICAgICAgICAgICAgIm1nYXJ1LmRldit1ZHA6Ly84LjguOC44IiwKICAgICAgICAgICAgImFkdGFyZ2V0LmNvbS50cit1ZHA6Ly84LjguOC44IiwKICAgICAgICAgICAgInJ0YnN5c3RlbS5jb20rdWRwOi8vOC44LjguOCIsCiAgICAgICAgICAgICJwcmVzdGl0aS5pdCt1ZHA6Ly84LjguOC44IiwKICAgICAgICAgICAgImFsbC5iaXordWRwOi8vOC44LjguOCIsCiAgICAgICAgICAgICJjZG5mb250cy5jb20rdWRwOi8vOC44LjguOCIsCiAgICAgICAgICAgICJ4bGl2cmRyLmNvbSt1ZHA6Ly84LjguOC44IiwKICAgICAgICAgICAgImFzc2ljdXJhemlvbmlvbmxpbmUuaXQrdWRwOi8vOC44LjguOCIsCiAgICAgICAgICAgICJ2b2lwc3R1bnQuY29tK3VkcDovLzguOC44LjgiLAogICAgICAgICAgICAicmF3Z2l0LmNvbSt1ZHA6Ly84LjguOC44IiwKICAgICAgICAgICAgImxvdWRlY2hvLmFpK3VkcDovLzguOC44LjgiLAogICAgICAgICAgICAidm9pcGJ1c3Rlci5jb20rdWRwOi8vOC44LjguOCIsCiAgICAgICAgICAgICJhZHN0ZXIudGVjaCt1ZHA6Ly84LjguOC44IiwKICAgICAgICAgICAgImNsb3VkZmxhcmUtZWNoLmNvbSt1ZHA6Ly84LjguNC40IiwKICAgICAgICAgICAgImdlZWRvLmNvbSt1ZHA6Ly84LjguNC40IiwKICAgICAgICAgICAgInRydXN0ZWRzdGFjay5jb20rdWRwOi8vOC44LjQuNCIsCiAgICAgICAgICAgICJkaXNjb3JkYXBwLmNvbSt1ZHA6Ly84LjguNC40IiwKICAgICAgICAgICAgImF5LmRlbGl2ZXJ5K3VkcDovLzguOC40LjQiLAogICAgICAgICAgICAiaWZjb25maWcuaW8rdWRwOi8vOC44LjQuNCIsCiAgICAgICAgICAgICJteWdhcnUuY29tK3VkcDovLzguOC40LjQiLAogICAgICAgICAgICAibWdhcnUuZGV2K3VkcDovLzguOC40LjQiLAogICAgICAgICAgICAiYWR0YXJnZXQuY29tLnRyK3VkcDovLzguOC40LjQiLAogICAgICAgICAgICAicnRic3lzdGVtLmNvbSt1ZHA6Ly84LjguNC40IiwKICAgICAgICAgICAgInByZXN0aXRpLml0K3VkcDovLzguOC40LjQiLAogICAgICAgICAgICAiYWxsLmJpeit1ZHA6Ly84LjguNC40IiwKICAgICAgICAgICAgImNkbmZvbnRzLmNvbSt1ZHA6Ly84LjguNC40IiwKICAgICAgICAgICAgInhsaXZyZHIuY29tK3VkcDovLzguOC40LjQiLAogICAgICAgICAgICAiYXNzaWN1cmF6aW9uaW9ubGluZS5pdCt1ZHA6Ly84LjguNC40IiwKICAgICAgICAgICAgInZvaXBzdHVudC5jb20rdWRwOi8vOC44LjQuNCIsCiAgICAgICAgICAgICJyYXdnaXQuY29tK3VkcDovLzguOC40LjQiLAogICAgICAgICAgICAibG91ZGVjaG8uYWkrdWRwOi8vOC44LjQuNCIsCiAgICAgICAgICAgICJ2b2lwYnVzdGVyLmNvbSt1ZHA6Ly84LjguNC40IiwKICAgICAgICAgICAgImFkc3Rlci50ZWNoK3VkcDovLzguOC40LjQiCiAgICAgICAgXTsKCiAgICAgICAgZnVuY3Rpb24gdXBkYXRlR2xvYmFsRWNoQ291bnQoKSB7CiAgICAgICAgICAgIGNvbnN0IGxpbmVzID0gKGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdjZmctZWNoLWxpc3QnKT8udmFsdWUgfHwgJycpLnNwbGl0KCdcbicpLm1hcChzID0+IHMudHJpbSgpKS5maWx0ZXIoQm9vbGVhbik7CiAgICAgICAgICAgIGNvbnN0IGJhZGdlID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ2NmZy1lY2gtY291bnQnKTsKICAgICAgICAgICAgaWYgKGJhZGdlKSBiYWRnZS50ZXh0Q29udGVudCA9IGxpbmVzLmxlbmd0aDsKICAgICAgICAgICAgY29uc3QgaW5oZXJpdENvdW50ID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ3VzZXItZWNoLWluaGVyaXQtY291bnQnKTsKICAgICAgICAgICAgaWYgKGluaGVyaXRDb3VudCkgaW5oZXJpdENvdW50LnRleHRDb250ZW50ID0gbGluZXMubGVuZ3RoOwogICAgICAgIH0KCiAgICAgICAgZnVuY3Rpb24gcmVzZXRHbG9iYWxFY2hEZWZhdWx0cygpIHsKICAgICAgICAgICAgY29uc3QgbGlzdEVsID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ2NmZy1lY2gtbGlzdCcpOwogICAgICAgICAgICBpZiAobGlzdEVsKSBsaXN0RWwudmFsdWUgPSBERUZBVUxUX0VDSF9DT05GSUdTLmpvaW4oJ1xuJyk7CiAgICAgICAgICAgIHVwZGF0ZUdsb2JhbEVjaENvdW50KCk7CiAgICAgICAgICAgIHVwZGF0ZVN1YnNjcmliZXJDb25maWdQcmV2aWV3KCk7CiAgICAgICAgfQoKICAgICAgICBmdW5jdGlvbiBjbGVhckdsb2JhbEVjaCgpIHsKICAgICAgICAgICAgY29uc3QgbGlzdEVsID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ2NmZy1lY2gtbGlzdCcpOwogICAgICAgICAgICBpZiAobGlzdEVsKSBsaXN0RWwudmFsdWUgPSAnJzsKICAgICAgICAgICAgdXBkYXRlR2xvYmFsRWNoQ291bnQoKTsKICAgICAgICAgICAgdXBkYXRlU3Vic2NyaWJlckNvbmZpZ1ByZXZpZXcoKTsKICAgICAgICB9CgogICAgICAgIGZ1bmN0aW9uIHRvZ2dsZVVzZXJFY2hNb2RlKCkgewogICAgICAgICAgICBjb25zdCBpc0N1c3RvbSA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdlY2gtbW9kZS1jdXN0b20nKT8uY2hlY2tlZDsKICAgICAgICAgICAgY29uc3Qgd3JhcCA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdmb3JtLXVzZXItZWNoLWN1c3RvbS13cmFwJyk7CiAgICAgICAgICAgIGlmICh3cmFwKSB7CiAgICAgICAgICAgICAgICBpZiAoaXNDdXN0b20pIHdyYXAuY2xhc3NMaXN0LnJlbW92ZSgnaGlkZGVuJyk7CiAgICAgICAgICAgICAgICBlbHNlIHdyYXAuY2xhc3NMaXN0LmFkZCgnaGlkZGVuJyk7CiAgICAgICAgICAgIH0KICAgICAgICAgICAgdXBkYXRlU3Vic2NyaWJlckNvbmZpZ1ByZXZpZXcoKTsKICAgICAgICB9CgogICAgICAgIGZ1bmN0aW9uIGNvcHlHbG9iYWxFY2hUb1VzZXIoKSB7CiAgICAgICAgICAgIGNvbnN0IGdsb2JhbFRleHQgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnY2ZnLWVjaC1saXN0Jyk/LnZhbHVlIHx8IERFRkFVTFRfRUNIX0NPTkZJR1Muam9pbignXG4nKTsKICAgICAgICAgICAgY29uc3QgdGFyZ2V0RWwgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnZm9ybS11c2VyLWVjaC1saXN0Jyk7CiAgICAgICAgICAgIGlmICh0YXJnZXRFbCkgdGFyZ2V0RWwudmFsdWUgPSBnbG9iYWxUZXh0OwogICAgICAgICAgICB1cGRhdGVTdWJzY3JpYmVyQ29uZmlnUHJldmlldygpOwogICAgICAgIH0KCiAgICAgICAgZnVuY3Rpb24gcmVzZXRVc2VyRWNoRGVmYXVsdHMoKSB7CiAgICAgICAgICAgIGNvbnN0IHRhcmdldEVsID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ2Zvcm0tdXNlci1lY2gtbGlzdCcpOwogICAgICAgICAgICBpZiAodGFyZ2V0RWwpIHRhcmdldEVsLnZhbHVlID0gREVGQVVMVF9FQ0hfQ09ORklHUy5qb2luKCdcbicpOwogICAgICAgICAgICB1cGRhdGVTdWJzY3JpYmVyQ29uZmlnUHJldmlldygpOwogICAgICAgIH0KCiAgICAgICAgZnVuY3Rpb24gdXBkYXRlU3Vic2NyaWJlckNvbmZpZ1ByZXZpZXcoKSB7CiAgICAgICAgICAgIGNvbnN0IGNsZWFuSXBUZXh0ID0gKGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdmb3JtLXVzZXItY2xlYW4taXAnKT8udmFsdWUgfHwgJycpLnRyaW0oKTsKICAgICAgICAgICAgY29uc3QgY2xlYW5JcHMgPSBjbGVhbklwVGV4dCA/IGNsZWFuSXBUZXh0LnNwbGl0KC9bXHJcbiw7XSsvKS5tYXAocyA9PiBzLnRyaW0oKSkuZmlsdGVyKEJvb2xlYW4pIDogWyd3d3cuc3BlZWR0ZXN0Lm5ldCddOwogICAgICAgICAgICAvLyAxIENsZWFuIElQICsgMSBwcmltYXJ5IGVuZHBvaW50ID0gMiBiYXNlIGNvbmZpZ3M7IDMgQ2xlYW4gSVBzICsgMSBwcmltYXJ5ID0gNCBiYXNlIGNvbmZpZ3MKICAgICAgICAgICAgY29uc3QgYmFzZUNvdW50ID0gY2xlYW5JcHMubGVuZ3RoICsgMTsKCiAgICAgICAgICAgIGNvbnN0IGlzQ3VzdG9tID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ2VjaC1tb2RlLWN1c3RvbScpPy5jaGVja2VkOwogICAgICAgICAgICBsZXQgZWNoQ291bnQgPSAwOwogICAgICAgICAgICBpZiAoaXNDdXN0b20pIHsKICAgICAgICAgICAgICAgIGNvbnN0IGVjaExpbmVzID0gKGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdmb3JtLXVzZXItZWNoLWxpc3QnKT8udmFsdWUgfHwgJycpLnNwbGl0KCdcbicpLm1hcChzID0+IHMudHJpbSgpKS5maWx0ZXIoQm9vbGVhbik7CiAgICAgICAgICAgICAgICBlY2hDb3VudCA9IGVjaExpbmVzLmxlbmd0aDsKICAgICAgICAgICAgfSBlbHNlIHsKICAgICAgICAgICAgICAgIGNvbnN0IGdsb2JhbExpbmVzID0gKGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdjZmctZWNoLWxpc3QnKT8udmFsdWUgfHwgJycpLnNwbGl0KCdcbicpLm1hcChzID0+IHMudHJpbSgpKS5maWx0ZXIoQm9vbGVhbik7CiAgICAgICAgICAgICAgICBlY2hDb3VudCA9IGdsb2JhbExpbmVzLmxlbmd0aCA+IDAgPyBnbG9iYWxMaW5lcy5sZW5ndGggOiAoQXJyYXkuaXNBcnJheShzdGF0ZS5jb25maWc/LmVjaENvbmZpZ0xpc3QpID8gc3RhdGUuY29uZmlnLmVjaENvbmZpZ0xpc3QubGVuZ3RoIDogREVGQVVMVF9FQ0hfQ09ORklHUy5sZW5ndGgpOwogICAgICAgICAgICB9CgogICAgICAgICAgICBjb25zdCB0b3RhbCA9IGVjaENvdW50ID4gMCA/IGJhc2VDb3VudCAqIGVjaENvdW50IDogYmFzZUNvdW50OwogICAgICAgICAgICBjb25zdCBjYWxjVGV4dCA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdmb3JtLXVzZXItY2FsYy10ZXh0Jyk7CiAgICAgICAgICAgIGlmIChjYWxjVGV4dCkgewogICAgICAgICAgICAgICAgaWYgKGVjaENvdW50ID4gMCkgewogICAgICAgICAgICAgICAgICAgIGNhbGNUZXh0LnRleHRDb250ZW50ID0gYCR7YmFzZUNvdW50fSBiYXNlIGVuZHBvaW50JHtiYXNlQ291bnQgPiAxID8gJ3MnIDogJyd9ICgke2NsZWFuSXBzLmxlbmd0aH0gY2xlYW4gSVAke2NsZWFuSXBzLmxlbmd0aCA+IDEgPyAncycgOiAnJ30gKyBwcmltYXJ5KSDDlyAke2VjaENvdW50fSBFQ0ggY29uZmlncyA9ICR7dG90YWx9IHRvdGFsIGNvbmZpZ3NgOwogICAgICAgICAgICAgICAgfSBlbHNlIHsKICAgICAgICAgICAgICAgICAgICBjYWxjVGV4dC50ZXh0Q29udGVudCA9IGAke2Jhc2VDb3VudH0gYmFzZSBlbmRwb2ludCR7YmFzZUNvdW50ID4gMSA/ICdzJyA6ICcnfSAoMCBFQ0ggY29uZmlncyBzZWxlY3RlZDogZ2VuZXJhdGVkIHdpdGhvdXQgZWNoPS4uLikgPSAke3RvdGFsfSBjb25maWdzYDsKICAgICAgICAgICAgICAgIH0KICAgICAgICAgICAgfQogICAgICAgIH0KCiAgICAgICAgLy8gSW5pdGlhbGl6ZSBzZXNzaW9uIG9uIGxvYWQKICAgICAgICB3aW5kb3cuYWRkRXZlbnRMaXN0ZW5lcignRE9NQ29udGVudExvYWRlZCcsICgpID0+IHsKICAgICAgICAgICAgc2V0dXBOYXZpZ2F0aW9uKCk7CiAgICAgICAgICAgIGNvbnN0IHNhdmVkU2Vzc2lvbiA9IGxvY2FsU3RvcmFnZS5nZXRJdGVtKCdsdWNpX3Nlc3Npb24nKTsKICAgICAgICAgICAgaWYgKHNhdmVkU2Vzc2lvbikgewogICAgICAgICAgICAgICAgdHJ5IHsKICAgICAgICAgICAgICAgICAgICBjb25zdCBwYXJzZWQgPSBKU09OLnBhcnNlKHNhdmVkU2Vzc2lvbik7CiAgICAgICAgICAgICAgICAgICAgaWYgKHBhcnNlZD8ua2V5KSB7CiAgICAgICAgICAgICAgICAgICAgICAgIHN0YXRlLm1hc3RlcktleSA9IHBhcnNlZC5rZXk7CiAgICAgICAgICAgICAgICAgICAgICAgIGF1dGhlbnRpY2F0ZShwYXJzZWQua2V5LCB0cnVlKTsKICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuOwogICAgICAgICAgICAgICAgICAgIH0KICAgICAgICAgICAgICAgIH0gY2F0Y2gge30KICAgICAgICAgICAgfQogICAgICAgICAgICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnbG9naW4tc2NyZWVuJykuY2xhc3NMaXN0LnJlbW92ZSgnaGlkZGVuJyk7CiAgICAgICAgfSk7CgogICAgICAgIC8vIE5hdmlnYXRpb24gdGFiIHN3aXRjaGluZwogICAgICAgIGZ1bmN0aW9uIHNldHVwTmF2aWdhdGlvbigpIHsKICAgICAgICAgICAgZG9jdW1lbnQucXVlcnlTZWxlY3RvckFsbCgnLm5hdi1pdGVtJykuZm9yRWFjaChpdGVtID0+IHsKICAgICAgICAgICAgICAgIGl0ZW0uYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCAoKSA9PiB7CiAgICAgICAgICAgICAgICAgICAgZG9jdW1lbnQucXVlcnlTZWxlY3RvckFsbCgnLm5hdi1pdGVtJykuZm9yRWFjaChuID0+IG4uY2xhc3NMaXN0LnJlbW92ZSgnYWN0aXZlJykpOwogICAgICAgICAgICAgICAgICAgIGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3JBbGwoJy50YWItY29udGVudCcpLmZvckVhY2godCA9PiB0LmNsYXNzTGlzdC5hZGQoJ2hpZGRlbicpKTsKICAgICAgICAgICAgICAgICAgICBpdGVtLmNsYXNzTGlzdC5hZGQoJ2FjdGl2ZScpOwogICAgICAgICAgICAgICAgICAgIGNvbnN0IHRhcmdldCA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKGl0ZW0uZGF0YXNldC50YWIpOwogICAgICAgICAgICAgICAgICAgIGlmICh0YXJnZXQpIHRhcmdldC5jbGFzc0xpc3QucmVtb3ZlKCdoaWRkZW4nKTsKCiAgICAgICAgICAgICAgICAgICAgaWYgKGl0ZW0uZGF0YXNldC50YWIgPT09ICd0YWItc3Vic2NyaWJlcnMnKSBsb2FkU3Vic2NyaWJlcnMoKTsKICAgICAgICAgICAgICAgICAgICBpZiAoaXRlbS5kYXRhc2V0LnRhYiA9PT0gJ3RhYi1sb2dzJykgbG9hZEF1ZGl0TG9ncygpOwogICAgICAgICAgICAgICAgfSk7CiAgICAgICAgICAgIH0pOwogICAgICAgIH0KCiAgICAgICAgLy8gTG9naW4gSGFuZGxlcgogICAgICAgIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdsb2dpbi1mb3JtJykuYWRkRXZlbnRMaXN0ZW5lcignc3VibWl0JywgYXN5bmMgKGUpID0+IHsKICAgICAgICAgICAgZS5wcmV2ZW50RGVmYXVsdCgpOwogICAgICAgICAgICBjb25zdCBrZXkgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnbG9naW4ta2V5JykudmFsdWUudHJpbSgpOwogICAgICAgICAgICBpZiAoIWtleSkgcmV0dXJuOwogICAgICAgICAgICBhd2FpdCBhdXRoZW50aWNhdGUoa2V5LCBmYWxzZSk7CiAgICAgICAgfSk7CgogICAgICAgIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdidG4tbG9nb3V0JykuYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCAoKSA9PiB7CiAgICAgICAgICAgIGxvY2FsU3RvcmFnZS5yZW1vdmVJdGVtKCdsdWNpX3Nlc3Npb24nKTsKICAgICAgICAgICAgc3RhdGUubWFzdGVyS2V5ID0gJyc7CiAgICAgICAgICAgIGxvY2F0aW9uLnJlbG9hZCgpOwogICAgICAgIH0pOwoKICAgICAgICBhc3luYyBmdW5jdGlvbiBhdXRoZW50aWNhdGUoa2V5LCBpc0F1dG8gPSBmYWxzZSkgewogICAgICAgICAgICBjb25zdCBlcnJEaXYgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnbG9naW4tZXJyb3InKTsKICAgICAgICAgICAgZXJyRGl2LnRleHRDb250ZW50ID0gJ0F1dGhlbnRpY2F0aW5nLi4uJzsKICAgICAgICAgICAgdHJ5IHsKICAgICAgICAgICAgICAgIGNvbnN0IHJlcyA9IGF3YWl0IGZldGNoKGAvJHtzdGF0ZS5hcGlSb3V0ZX0vYXBpL2F1dGhgLCB7CiAgICAgICAgICAgICAgICAgICAgbWV0aG9kOiAnUE9TVCcsCiAgICAgICAgICAgICAgICAgICAgaGVhZGVyczogeyAnQ29udGVudC1UeXBlJzogJ2FwcGxpY2F0aW9uL2pzb24nIH0sCiAgICAgICAgICAgICAgICAgICAgYm9keTogSlNPTi5zdHJpbmdpZnkoeyBrZXkgfSkKICAgICAgICAgICAgICAgIH0pOwoKICAgICAgICAgICAgICAgIGlmICghcmVzLm9rKSB7CiAgICAgICAgICAgICAgICAgICAgaWYgKGlzQXV0bykgewogICAgICAgICAgICAgICAgICAgICAgICBsb2NhbFN0b3JhZ2UucmVtb3ZlSXRlbSgnbHVjaV9zZXNzaW9uJyk7CiAgICAgICAgICAgICAgICAgICAgICAgIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdsb2dpbi1zY3JlZW4nKS5jbGFzc0xpc3QucmVtb3ZlKCdoaWRkZW4nKTsKICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuOwogICAgICAgICAgICAgICAgICAgIH0KICAgICAgICAgICAgICAgICAgICBpZiAocmVzLnN0YXR1cyA9PT0gNDAxKSB7CiAgICAgICAgICAgICAgICAgICAgICAgIGVyckRpdi50ZXh0Q29udGVudCA9ICdJbnZhbGlkIGNyZWRlbnRpYWxzLiBBY2Nlc3MgZGVuaWVkLic7CiAgICAgICAgICAgICAgICAgICAgfSBlbHNlIGlmIChyZXMuc3RhdHVzID09PSA0MDQpIHsKICAgICAgICAgICAgICAgICAgICAgICAgZXJyRGl2LnRleHRDb250ZW50ID0gYEFQSSByb3V0ZSBub3QgZm91bmQgKEhUVFAgNDA0IG9uIC8ke3N0YXRlLmFwaVJvdXRlfS9hcGkvYXV0aCkuYDsKICAgICAgICAgICAgICAgICAgICB9IGVsc2UgewogICAgICAgICAgICAgICAgICAgICAgICBlcnJEaXYudGV4dENvbnRlbnQgPSBgQXV0aGVudGljYXRpb24gZmFpbGVkIChIVFRQICR7cmVzLnN0YXR1c30pLmA7CiAgICAgICAgICAgICAgICAgICAgfQogICAgICAgICAgICAgICAgICAgIHJldHVybjsKICAgICAgICAgICAgICAgIH0KCiAgICAgICAgICAgICAgICBjb25zdCBkYXRhID0gYXdhaXQgcmVzLmpzb24oKTsKICAgICAgICAgICAgICAgIGlmIChkYXRhLnN1Y2Nlc3MpIHsKICAgICAgICAgICAgICAgICAgICBzdGF0ZS5tYXN0ZXJLZXkgPSBrZXk7CiAgICAgICAgICAgICAgICAgICAgc3RhdGUuY29uZmlnID0gZGF0YS5jb25maWcgfHwge307CiAgICAgICAgICAgICAgICAgICAgc3RhdGUuc3lzVXNhZ2UgPSBkYXRhLnN5c1VzYWdlIHx8IHt9OwogICAgICAgICAgICAgICAgICAgIGxvY2FsU3RvcmFnZS5zZXRJdGVtKCdsdWNpX3Nlc3Npb24nLCBKU09OLnN0cmluZ2lmeSh7IGtleSwgdHM6IERhdGUubm93KCkgfSkpOwogICAgICAgICAgICAgICAgICAgIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdsb2dpbi1zY3JlZW4nKS5jbGFzc0xpc3QuYWRkKCdoaWRkZW4nKTsKICAgICAgICAgICAgICAgICAgICB1cGRhdGVPdmVydmlld1VJKGRhdGEpOwogICAgICAgICAgICAgICAgICAgIHBvcHVsYXRlU2V0dGluZ3MoZGF0YS5jb25maWcpOwogICAgICAgICAgICAgICAgfSBlbHNlIHsKICAgICAgICAgICAgICAgICAgICBlcnJEaXYudGV4dENvbnRlbnQgPSBkYXRhLmVycm9yIHx8ICdBdXRoZW50aWNhdGlvbiBmYWlsZWQnOwogICAgICAgICAgICAgICAgfQogICAgICAgICAgICB9IGNhdGNoIChlcnIpIHsKICAgICAgICAgICAgICAgIGVyckRpdi50ZXh0Q29udGVudCA9ICdDb25uZWN0aW9uIGVycm9yOiAnICsgZXJyLm1lc3NhZ2U7CiAgICAgICAgICAgIH0KICAgICAgICB9CgogICAgICAgIGZ1bmN0aW9uIHVwZGF0ZU92ZXJ2aWV3VUkoZGF0YSkgewogICAgICAgICAgICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnbm9kZS1pcCcpLnRleHRDb250ZW50ID0gZGF0YS5uZXR3b3JrPy5pcCB8fCAnRWRnZSBJUCc7CiAgICAgICAgICAgIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdub2RlLWxvYycpLnRleHRDb250ZW50ID0gZGF0YS5uZXR3b3JrPy5sb2MgfHwgJ0dsb2JhbCBDbG91ZGZsYXJlJzsKICAgICAgICAgICAgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ3N0YXQtY29sbycpLnRleHRDb250ZW50ID0gZGF0YS5uZXR3b3JrPy5jb2xvIHx8ICdFREdFJzsKICAgICAgICAgICAgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ25vZGUtbW9kZScpLnRleHRDb250ZW50ID0gKHN0YXRlLmNvbmZpZy5tb2RlIHx8ICdhbHBoYScpLnRvVXBwZXJDYXNlKCk7CiAgICAgICAgICAgIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdub2RlLXN1Yi1yb3V0ZScpLnRleHRDb250ZW50ID0gJy8nICsgKHN0YXRlLmNvbmZpZy5hcGlSb3V0ZSB8fCBzdGF0ZS5hcGlSb3V0ZSk7CgogICAgICAgICAgICBjb25zdCB1c2VycyA9IHN0YXRlLmNvbmZpZy51c2VycyB8fCBbXTsKICAgICAgICAgICAgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ3N0YXQtc3Vic2NyaWJlcnMnKS50ZXh0Q29udGVudCA9IHVzZXJzLmxlbmd0aDsKCiAgICAgICAgICAgIGxldCB0b3RhbEJ5dGVzID0gMDsKICAgICAgICAgICAgaWYgKHN0YXRlLnN5c1VzYWdlKSB7CiAgICAgICAgICAgICAgICBmb3IgKGNvbnN0IHUgb2YgT2JqZWN0LnZhbHVlcyhzdGF0ZS5zeXNVc2FnZSkpIHsKICAgICAgICAgICAgICAgICAgICB0b3RhbEJ5dGVzICs9ICh1LmJ5dGVzIHx8IDApOwogICAgICAgICAgICAgICAgfQogICAgICAgICAgICB9CiAgICAgICAgICAgIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdzdGF0LWJhbmR3aWR0aCcpLnRleHRDb250ZW50ID0gKHRvdGFsQnl0ZXMgLyAxMDczNzQxODI0KS50b0ZpeGVkKDIpICsgJyBHQic7CiAgICAgICAgfQoKICAgICAgICBhc3luYyBmdW5jdGlvbiByZWZyZXNoT3ZlcnZpZXcoKSB7CiAgICAgICAgICAgIGF1dGhlbnRpY2F0ZShzdGF0ZS5tYXN0ZXJLZXksIHRydWUpOwogICAgICAgIH0KCiAgICAgICAgLy8gU3Vic2NyaWJlcnMgVmlldwogICAgICAgIGFzeW5jIGZ1bmN0aW9uIGxvYWRTdWJzY3JpYmVycygpIHsKICAgICAgICAgICAgY29uc3QgdGJvZHkgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnc3Vic2NyaWJlcnMtdGJvZHknKTsKICAgICAgICAgICAgdGJvZHkuaW5uZXJIVE1MID0gJzx0cj48dGQgY29sc3Bhbj0iNSIgc3R5bGU9InRleHQtYWxpZ246IGNlbnRlcjsgY29sb3I6IHZhcigtLXRleHQtbXV0ZWQpOyI+RmV0Y2hpbmcgc3Vic2NyaWJlcnMuLi48L3RkPjwvdHI+JzsKICAgICAgICAgICAgdHJ5IHsKICAgICAgICAgICAgICAgIGNvbnN0IHJlcyA9IGF3YWl0IGZldGNoKGAvJHtzdGF0ZS5hcGlSb3V0ZX0vYXBpL3VzZXJzYCwgewogICAgICAgICAgICAgICAgICAgIGhlYWRlcnM6IHsgJ0F1dGhvcml6YXRpb24nOiAnQmVhcmVyICcgKyBzdGF0ZS5tYXN0ZXJLZXkgfQogICAgICAgICAgICAgICAgfSk7CiAgICAgICAgICAgICAgICBjb25zdCBkYXRhID0gYXdhaXQgcmVzLmpzb24oKTsKICAgICAgICAgICAgICAgIGlmICghZGF0YS5zdWNjZXNzKSB7CiAgICAgICAgICAgICAgICAgICAgdGJvZHkuaW5uZXJIVE1MID0gYDx0cj48dGQgY29sc3Bhbj0iNSIgc3R5bGU9ImNvbG9yOnZhcigtLXJlZCk7Ij5FcnJvcjogJHtkYXRhLmVycm9yfTwvdGQ+PC90cj5gOwogICAgICAgICAgICAgICAgICAgIHJldHVybjsKICAgICAgICAgICAgICAgIH0KICAgICAgICAgICAgICAgIHN0YXRlLnVzZXJzID0gZGF0YS51c2VycyB8fCBbXTsKICAgICAgICAgICAgICAgIHJlbmRlclN1YnNjcmliZXJzVGFibGUoc3RhdGUudXNlcnMpOwogICAgICAgICAgICB9IGNhdGNoIChlcnIpIHsKICAgICAgICAgICAgICAgIHRib2R5LmlubmVySFRNTCA9IGA8dHI+PHRkIGNvbHNwYW49IjUiIHN0eWxlPSJjb2xvcjp2YXIoLS1yZWQpOyI+TmV0d29yayBlcnJvcjogJHtlcnIubWVzc2FnZX08L3RkPjwvdHI+YDsKICAgICAgICAgICAgfQogICAgICAgIH0KCiAgICAgICAgZnVuY3Rpb24gcmVuZGVyU3Vic2NyaWJlcnNUYWJsZSh1c2VycykgewogICAgICAgICAgICBjb25zdCB0Ym9keSA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdzdWJzY3JpYmVycy10Ym9keScpOwogICAgICAgICAgICBpZiAodXNlcnMubGVuZ3RoID09PSAwKSB7CiAgICAgICAgICAgICAgICB0Ym9keS5pbm5lckhUTUwgPSAnPHRyPjx0ZCBjb2xzcGFuPSI1IiBzdHlsZT0idGV4dC1hbGlnbjogY2VudGVyOyBjb2xvcjogdmFyKC0tdGV4dC1tdXRlZCk7IHBhZGRpbmc6IDI0cHg7Ij5ObyBzdWJzY3JpYmVyIHByb2ZpbGVzIGZvdW5kLiBDbGljayAiKyBBZGQgU3Vic2NyaWJlciIgdG8gY3JlYXRlIG9uZS48L3RkPjwvdHI+JzsKICAgICAgICAgICAgICAgIHJldHVybjsKICAgICAgICAgICAgfQoKICAgICAgICAgICAgdGJvZHkuaW5uZXJIVE1MID0gdXNlcnMubWFwKHUgPT4gewogICAgICAgICAgICAgICAgY29uc3QgdXNlZEdiID0gKHUudXNhZ2U/LnRvdGFsIC8gMTA3Mzc0MTgyNCkudG9GaXhlZCgyKTsKICAgICAgICAgICAgICAgIGNvbnN0IGxpbWl0R2IgPSB1LmxpbWl0VG90YWxSZXEgPyAodS51c2FnZT8ubGltaXQgLyAxMDczNzQxODI0KS50b0ZpeGVkKDIpICsgJyBHQicgOiAnVW5saW1pdGVkJzsKICAgICAgICAgICAgICAgIGNvbnN0IHN0YXR1c0JhZGdlID0gYDxzcGFuIGNsYXNzPSJiYWRnZSBiYWRnZS0ke3Uuc3RhdHVzfSI+JHt1LnN0YXR1cy50b1VwcGVyQ2FzZSgpfTwvc3Bhbj5gOwogICAgICAgICAgICAgICAgY29uc3QgZXhwaXJ5VHh0ID0gdS5leHBpcnlNcyA/IG5ldyBEYXRlKHUuZXhwaXJ5TXMpLnRvSVNPU3RyaW5nKCkuc3BsaXQoJ1QnKVswXSA6ICdOZXZlcic7CgogICAgICAgICAgICAgICAgcmV0dXJuIGA8dHI+CiAgICAgICAgICAgICAgICAgICAgPHRkPjxzdHJvbmc+JHtlc2NhcGVIdG1sKHUubmFtZSl9PC9zdHJvbmc+PGJyPjxzcGFuIHN0eWxlPSJmb250LXNpemU6MC43NXJlbTsgY29sb3I6dmFyKC0tdGV4dC1tdXRlZCk7IGZvbnQtZmFtaWx5Om1vbm9zcGFjZTsiPiR7dS5pZH08L3NwYW4+PC90ZD4KICAgICAgICAgICAgICAgICAgICA8dGQ+JHtzdGF0dXNCYWRnZX08L3RkPgogICAgICAgICAgICAgICAgICAgIDx0ZD4ke3VzZWRHYn0gR0IgLyAke2xpbWl0R2J9PC90ZD4KICAgICAgICAgICAgICAgICAgICA8dGQ+JHtleHBpcnlUeHR9PC90ZD4KICAgICAgICAgICAgICAgICAgICA8dGQgc3R5bGU9IndoaXRlLXNwYWNlOiBub3dyYXA7Ij4KICAgICAgICAgICAgICAgICAgICAgICAgPGJ1dHRvbiBjbGFzcz0iYnRuIGJ0bi1zbSBidG4tc2Vjb25kYXJ5IiBvbmNsaWNrPSJvcGVuRWRpdFVzZXJNb2RhbCgnJHt1LmlkfScpIj5FZGl0PC9idXR0b24+CiAgICAgICAgICAgICAgICAgICAgICAgIDxidXR0b24gY2xhc3M9ImJ0biBidG4tc20gYnRuLXNlY29uZGFyeSIgb25jbGljaz0ic2hvd0xpbmtzTW9kYWwoJyR7dS5pZH0nLCAnJHtlc2NhcGVIdG1sKHUubmFtZSl9JykiPkxpbmtzPC9idXR0b24+CiAgICAgICAgICAgICAgICAgICAgICAgIDxidXR0b24gY2xhc3M9ImJ0biBidG4tc20gYnRuLXNlY29uZGFyeSIgb25jbGljaz0idG9nZ2xlVXNlclBhdXNlKCcke3UuaWR9JykiPiR7dS5pc1BhdXNlZCA/ICdSZXN1bWUnIDogJ1BhdXNlJ308L2J1dHRvbj4KICAgICAgICAgICAgICAgICAgICAgICAgPGJ1dHRvbiBjbGFzcz0iYnRuIGJ0bi1zbSBidG4tc2Vjb25kYXJ5IiBvbmNsaWNrPSJyZXNldFVzZXJVc2FnZSgnJHt1LmlkfScpIj5SZXNldDwvYnV0dG9uPgogICAgICAgICAgICAgICAgICAgICAgICA8YnV0dG9uIGNsYXNzPSJidG4gYnRuLXNtIGJ0bi1kYW5nZXIiIG9uY2xpY2s9ImRlbGV0ZVVzZXIoJyR7dS5pZH0nKSI+RGVsPC9idXR0b24+CiAgICAgICAgICAgICAgICAgICAgPC90ZD4KICAgICAgICAgICAgICAgIDwvdHI+YDsKICAgICAgICAgICAgfSkuam9pbignJyk7CiAgICAgICAgfQoKICAgICAgICAvLyBBZGQgLyBFZGl0IFN1YnNjcmliZXIgTW9kYWxzCiAgICAgICAgZnVuY3Rpb24gb3BlbkFkZFVzZXJNb2RhbCgpIHsKICAgICAgICAgICAgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ21vZGFsLXVzZXItdGl0bGUnKS50ZXh0Q29udGVudCA9ICdBZGQgTmV3IFN1YnNjcmliZXInOwogICAgICAgICAgICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnZm9ybS11c2VyJykucmVzZXQoKTsKICAgICAgICAgICAgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ3VzZXItZWRpdC1pZCcpLnZhbHVlID0gJyc7CiAgICAgICAgICAgIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdmb3JtLXVzZXItY2xlYW4taXAnKS52YWx1ZSA9ICd3d3cuc3BlZWR0ZXN0Lm5ldCc7CiAgICAgICAgICAgIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdmb3JtLXVzZXItZmluYWwtbWFzaycpLnZhbHVlID0gJyc7CiAgICAgICAgICAgIGNvbnN0IGluaGVyaXRSYWRpbyA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdlY2gtbW9kZS1pbmhlcml0Jyk7CiAgICAgICAgICAgIGlmIChpbmhlcml0UmFkaW8pIGluaGVyaXRSYWRpby5jaGVja2VkID0gdHJ1ZTsKICAgICAgICAgICAgY29uc3QgY3VzdG9tV3JhcCA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdmb3JtLXVzZXItZWNoLWN1c3RvbS13cmFwJyk7CiAgICAgICAgICAgIGlmIChjdXN0b21XcmFwKSBjdXN0b21XcmFwLmNsYXNzTGlzdC5hZGQoJ2hpZGRlbicpOwogICAgICAgICAgICBjb25zdCBlY2hMaXN0RWwgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnZm9ybS11c2VyLWVjaC1saXN0Jyk7CiAgICAgICAgICAgIGlmIChlY2hMaXN0RWwpIGVjaExpc3RFbC52YWx1ZSA9ICcnOwogICAgICAgICAgICB1cGRhdGVTdWJzY3JpYmVyQ29uZmlnUHJldmlldygpOwogICAgICAgICAgICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnbW9kYWwtdXNlcicpLmNsYXNzTGlzdC5hZGQoJ29wZW4nKTsKICAgICAgICB9CgogICAgICAgIGZ1bmN0aW9uIG9wZW5FZGl0VXNlck1vZGFsKGlkKSB7CiAgICAgICAgICAgIGNvbnN0IHVzZXIgPSAoc3RhdGUudXNlcnMgfHwgW10pLmZpbmQodSA9PiB1LmlkID09PSBpZCk7CiAgICAgICAgICAgIGlmICghdXNlcikgcmV0dXJuOwogICAgICAgICAgICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnbW9kYWwtdXNlci10aXRsZScpLnRleHRDb250ZW50ID0gJ0VkaXQgU3Vic2NyaWJlcjogJyArIHVzZXIubmFtZTsKICAgICAgICAgICAgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ3VzZXItZWRpdC1pZCcpLnZhbHVlID0gdXNlci5pZDsKICAgICAgICAgICAgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ2Zvcm0tdXNlci1uYW1lJykudmFsdWUgPSB1c2VyLm5hbWUgfHwgJyc7CiAgICAgICAgICAgIGNvbnN0IGxpbWl0R2IgPSB1c2VyLmxpbWl0VG90YWxSZXEgPyAoKHVzZXIubGltaXRUb3RhbFJlcSAqIDYwMDApIC8gMTA3Mzc0MTgyNCkudG9GaXhlZCgxKSA6IDA7CiAgICAgICAgICAgIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdmb3JtLXVzZXItbGltaXQtZ2InKS52YWx1ZSA9IGxpbWl0R2I7CiAgICAgICAgICAgIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdmb3JtLXVzZXItZXhwaXJ5JykudmFsdWUgPSB1c2VyLmV4cGlyeU1zID8gbmV3IERhdGUodXNlci5leHBpcnlNcykudG9JU09TdHJpbmcoKS5zcGxpdCgnVCcpWzBdIDogJyc7CiAgICAgICAgICAgIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdmb3JtLXVzZXItY2xlYW4taXAnKS52YWx1ZSA9IHVzZXIuY2xlYW5JcCB8fCAnd3d3LnNwZWVkdGVzdC5uZXQnOwogICAgICAgICAgICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnZm9ybS11c2VyLWZpbmFsLW1hc2snKS52YWx1ZSA9IHVzZXIuZmluYWxNYXNrIHx8ICcnOwoKICAgICAgICAgICAgY29uc3QgY3VzdG9tUmFkaW8gPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnZWNoLW1vZGUtY3VzdG9tJyk7CiAgICAgICAgICAgIGNvbnN0IGluaGVyaXRSYWRpbyA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdlY2gtbW9kZS1pbmhlcml0Jyk7CiAgICAgICAgICAgIGNvbnN0IGN1c3RvbVdyYXAgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnZm9ybS11c2VyLWVjaC1jdXN0b20td3JhcCcpOwogICAgICAgICAgICBjb25zdCBlY2hMaXN0RWwgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnZm9ybS11c2VyLWVjaC1saXN0Jyk7CgogICAgICAgICAgICBpZiAoQXJyYXkuaXNBcnJheSh1c2VyLmVjaENvbmZpZ0xpc3QpKSB7CiAgICAgICAgICAgICAgICBpZiAoY3VzdG9tUmFkaW8pIGN1c3RvbVJhZGlvLmNoZWNrZWQgPSB0cnVlOwogICAgICAgICAgICAgICAgaWYgKGN1c3RvbVdyYXApIGN1c3RvbVdyYXAuY2xhc3NMaXN0LnJlbW92ZSgnaGlkZGVuJyk7CiAgICAgICAgICAgICAgICBpZiAoZWNoTGlzdEVsKSBlY2hMaXN0RWwudmFsdWUgPSB1c2VyLmVjaENvbmZpZ0xpc3Quam9pbignXG4nKTsKICAgICAgICAgICAgfSBlbHNlIHsKICAgICAgICAgICAgICAgIGlmIChpbmhlcml0UmFkaW8pIGluaGVyaXRSYWRpby5jaGVja2VkID0gdHJ1ZTsKICAgICAgICAgICAgICAgIGlmIChjdXN0b21XcmFwKSBjdXN0b21XcmFwLmNsYXNzTGlzdC5hZGQoJ2hpZGRlbicpOwogICAgICAgICAgICAgICAgaWYgKGVjaExpc3RFbCkgZWNoTGlzdEVsLnZhbHVlID0gJyc7CiAgICAgICAgICAgIH0KCiAgICAgICAgICAgIHVwZGF0ZVN1YnNjcmliZXJDb25maWdQcmV2aWV3KCk7CiAgICAgICAgICAgIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdtb2RhbC11c2VyJykuY2xhc3NMaXN0LmFkZCgnb3BlbicpOwogICAgICAgIH0KCiAgICAgICAgZnVuY3Rpb24gY2xvc2VVc2VyTW9kYWwoKSB7CiAgICAgICAgICAgIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdtb2RhbC11c2VyJykuY2xhc3NMaXN0LnJlbW92ZSgnb3BlbicpOwogICAgICAgIH0KCiAgICAgICAgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ2Zvcm0tdXNlcicpLmFkZEV2ZW50TGlzdGVuZXIoJ3N1Ym1pdCcsIGFzeW5jIChlKSA9PiB7CiAgICAgICAgICAgIGUucHJldmVudERlZmF1bHQoKTsKICAgICAgICAgICAgY29uc3QgZWRpdElkID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ3VzZXItZWRpdC1pZCcpLnZhbHVlOwogICAgICAgICAgICBjb25zdCBuYW1lID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ2Zvcm0tdXNlci1uYW1lJykudmFsdWUudHJpbSgpOwogICAgICAgICAgICBjb25zdCBsaW1pdEdiID0gcGFyc2VGbG9hdChkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnZm9ybS11c2VyLWxpbWl0LWdiJykudmFsdWUpIHx8IDA7CiAgICAgICAgICAgIGNvbnN0IGV4cGlyeVN0ciA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdmb3JtLXVzZXItZXhwaXJ5JykudmFsdWU7CiAgICAgICAgICAgIGNvbnN0IGNsZWFuSXAgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnZm9ybS11c2VyLWNsZWFuLWlwJykudmFsdWUudHJpbSgpIHx8ICd3d3cuc3BlZWR0ZXN0Lm5ldCc7CiAgICAgICAgICAgIGNvbnN0IGZpbmFsTWFzayA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdmb3JtLXVzZXItZmluYWwtbWFzaycpLnZhbHVlLnRyaW0oKTsKCiAgICAgICAgICAgIGNvbnN0IGlzQ3VzdG9tRWNoID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ2VjaC1tb2RlLWN1c3RvbScpPy5jaGVja2VkOwogICAgICAgICAgICBjb25zdCBlY2hDb25maWdMaXN0ID0gaXNDdXN0b21FY2gKICAgICAgICAgICAgICAgID8gKGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdmb3JtLXVzZXItZWNoLWxpc3QnKS52YWx1ZSB8fCAnJykuc3BsaXQoJ1xuJykubWFwKHMgPT4gcy50cmltKCkpLmZpbHRlcihCb29sZWFuKQogICAgICAgICAgICAgICAgOiBudWxsOwoKICAgICAgICAgICAgY29uc3QgbGltaXRUb3RhbFJlcSA9IGxpbWl0R2IgPiAwID8gTWF0aC5yb3VuZCgobGltaXRHYiAqIDEwNzM3NDE4MjQpIC8gNjAwMCkgOiAwOwogICAgICAgICAgICBjb25zdCBleHBpcnlNcyA9IGV4cGlyeVN0ciA/IG5ldyBEYXRlKGV4cGlyeVN0cikuZ2V0VGltZSgpIDogMDsKCiAgICAgICAgICAgIGNvbnN0IHBheWxvYWQgPSB7CiAgICAgICAgICAgICAgICBuYW1lLAogICAgICAgICAgICAgICAgbGltaXRUb3RhbFJlcSwKICAgICAgICAgICAgICAgIGV4cGlyeU1zLAogICAgICAgICAgICAgICAgY2xlYW5JcCwKICAgICAgICAgICAgICAgIGZpbmFsTWFzaywKICAgICAgICAgICAgICAgIGVjaENvbmZpZ0xpc3QsCiAgICAgICAgICAgIH07CgogICAgICAgICAgICBjb25zdCBtZXRob2QgPSBlZGl0SWQgPyAnUFVUJyA6ICdQT1NUJzsKICAgICAgICAgICAgY29uc3QgZW5kcG9pbnQgPSBlZGl0SWQgPyBgLyR7c3RhdGUuYXBpUm91dGV9L2FwaS91c2Vycz9pZD0ke2VkaXRJZH1gIDogYC8ke3N0YXRlLmFwaVJvdXRlfS9hcGkvdXNlcnNgOwoKICAgICAgICAgICAgdHJ5IHsKICAgICAgICAgICAgICAgIGNvbnN0IHJlcyA9IGF3YWl0IGZldGNoKGVuZHBvaW50LCB7CiAgICAgICAgICAgICAgICAgICAgbWV0aG9kLAogICAgICAgICAgICAgICAgICAgIGhlYWRlcnM6IHsKICAgICAgICAgICAgICAgICAgICAgICAgJ0NvbnRlbnQtVHlwZSc6ICdhcHBsaWNhdGlvbi9qc29uJywKICAgICAgICAgICAgICAgICAgICAgICAgJ0F1dGhvcml6YXRpb24nOiAnQmVhcmVyICcgKyBzdGF0ZS5tYXN0ZXJLZXkKICAgICAgICAgICAgICAgICAgICB9LAogICAgICAgICAgICAgICAgICAgIGJvZHk6IEpTT04uc3RyaW5naWZ5KHBheWxvYWQpCiAgICAgICAgICAgICAgICB9KTsKICAgICAgICAgICAgICAgIGNvbnN0IGRhdGEgPSBhd2FpdCByZXMuanNvbigpOwogICAgICAgICAgICAgICAgaWYgKGRhdGEuc3VjY2VzcykgewogICAgICAgICAgICAgICAgICAgIGNsb3NlVXNlck1vZGFsKCk7CiAgICAgICAgICAgICAgICAgICAgbG9hZFN1YnNjcmliZXJzKCk7CiAgICAgICAgICAgICAgICB9IGVsc2UgewogICAgICAgICAgICAgICAgICAgIGFsZXJ0KCdFcnJvcjogJyArIGRhdGEuZXJyb3IpOwogICAgICAgICAgICAgICAgfQogICAgICAgICAgICB9IGNhdGNoIChlcnIpIHsKICAgICAgICAgICAgICAgIGFsZXJ0KCdSZXF1ZXN0IGZhaWxlZDogJyArIGVyci5tZXNzYWdlKTsKICAgICAgICAgICAgfQogICAgICAgIH0pOwoKICAgICAgICBhc3luYyBmdW5jdGlvbiB0b2dnbGVVc2VyUGF1c2UoaWQpIHsKICAgICAgICAgICAgYXdhaXQgZmV0Y2goYC8ke3N0YXRlLmFwaVJvdXRlfS9hcGkvdXNlcnM/aWQ9JHtpZH0mYWN0aW9uPXRvZ2dsZWAsIHsKICAgICAgICAgICAgICAgIG1ldGhvZDogJ1BPU1QnLAogICAgICAgICAgICAgICAgaGVhZGVyczogeyAnQXV0aG9yaXphdGlvbic6ICdCZWFyZXIgJyArIHN0YXRlLm1hc3RlcktleSB9CiAgICAgICAgICAgIH0pOwogICAgICAgICAgICBsb2FkU3Vic2NyaWJlcnMoKTsKICAgICAgICB9CgogICAgICAgIGFzeW5jIGZ1bmN0aW9uIHJlc2V0VXNlclVzYWdlKGlkKSB7CiAgICAgICAgICAgIGlmICghY29uZmlybSgnUmVzZXQgYmFuZHdpZHRoIHVzYWdlIGNvdW50ZXJzIGZvciB0aGlzIHN1YnNjcmliZXI/JykpIHJldHVybjsKICAgICAgICAgICAgYXdhaXQgZmV0Y2goYC8ke3N0YXRlLmFwaVJvdXRlfS9hcGkvdXNlcnM/aWQ9JHtpZH0mYWN0aW9uPXJlc2V0YCwgewogICAgICAgICAgICAgICAgbWV0aG9kOiAnUE9TVCcsCiAgICAgICAgICAgICAgICBoZWFkZXJzOiB7ICdBdXRob3JpemF0aW9uJzogJ0JlYXJlciAnICsgc3RhdGUubWFzdGVyS2V5IH0KICAgICAgICAgICAgfSk7CiAgICAgICAgICAgIGxvYWRTdWJzY3JpYmVycygpOwogICAgICAgIH0KCiAgICAgICAgYXN5bmMgZnVuY3Rpb24gZGVsZXRlVXNlcihpZCkgewogICAgICAgICAgICBpZiAoIWNvbmZpcm0oJ1Blcm1hbmVudGx5IGRlbGV0ZSB0aGlzIHN1YnNjcmliZXI/JykpIHJldHVybjsKICAgICAgICAgICAgYXdhaXQgZmV0Y2goYC8ke3N0YXRlLmFwaVJvdXRlfS9hcGkvdXNlcnM/aWQ9JHtpZH1gLCB7CiAgICAgICAgICAgICAgICBtZXRob2Q6ICdERUxFVEUnLAogICAgICAgICAgICAgICAgaGVhZGVyczogeyAnQXV0aG9yaXphdGlvbic6ICdCZWFyZXIgJyArIHN0YXRlLm1hc3RlcktleSB9CiAgICAgICAgICAgIH0pOwogICAgICAgICAgICBsb2FkU3Vic2NyaWJlcnMoKTsKICAgICAgICB9CgogICAgICAgIC8vIExpbmtzIEV4cG9ydCBNb2RhbAogICAgICAgIGZ1bmN0aW9uIHNob3dMaW5rc01vZGFsKGlkLCBuYW1lKSB7CiAgICAgICAgICAgIGNvbnN0IGJhc2UgPSBsb2NhdGlvbi5vcmlnaW47CiAgICAgICAgICAgIGNvbnN0IHJvdXRlID0gc3RhdGUuY29uZmlnLmFwaVJvdXRlIHx8IHN0YXRlLmFwaVJvdXRlOwogICAgICAgICAgICBjb25zdCBzdWJQYXJhbSA9IGBzdWI9JHtlbmNvZGVVUklDb21wb25lbnQobmFtZSl9YDsKICAgICAgICAgICAgY29uc3QgcG9ydGFsUGFyYW0gPSBgdT0ke2VuY29kZVVSSUNvbXBvbmVudChuYW1lKX1gOwoKICAgICAgICAgICAgY29uc3QgbGlua3MgPSBbCiAgICAgICAgICAgICAgICB7IGxhYmVsOiAnU2luZy1Cb3ggMS45KyBKU09OJywgdXJsOiBgJHtiYXNlfS8ke3JvdXRlfT9mbGFnPXNpbmdib3gmJHtzdWJQYXJhbX1gIH0sCiAgICAgICAgICAgICAgICB7IGxhYmVsOiAnQ2xhc2ggLyBNaWhvbW8gWUFNTCcsIHVybDogYCR7YmFzZX0vJHtyb3V0ZX0/ZmxhZz1jbGFzaCYke3N1YlBhcmFtfWAgfSwKICAgICAgICAgICAgICAgIHsgbGFiZWw6ICdYcmF5IC8gVjJSYXkgSlNPTicsIHVybDogYCR7YmFzZX0vJHtyb3V0ZX0/ZmxhZz12MnJheSYke3N1YlBhcmFtfWAgfSwKICAgICAgICAgICAgICAgIHsgbGFiZWw6ICdXaXJlR3VhcmQgLyBBV0cgQ09ORicsIHVybDogYCR7YmFzZX0vJHtyb3V0ZX0/ZmxhZz13aXJlZ3VhcmQmJHtzdWJQYXJhbX1gIH0sCiAgICAgICAgICAgICAgICB7IGxhYmVsOiAnUmF3IFBsYWludGV4dCBVUkknLCB1cmw6IGAke2Jhc2V9LyR7cm91dGV9P2ZsYWc9cmF3JiR7c3ViUGFyYW19YCB9LAogICAgICAgICAgICAgICAgeyBsYWJlbDogJ1N1YnNjcmliZXIgV2ViIFBvcnRhbCcsIHVybDogYCR7YmFzZX0vJHtyb3V0ZX0/JHtwb3J0YWxQYXJhbX1gIH0sCiAgICAgICAgICAgIF07CgogICAgICAgICAgICBjb25zdCBodG1sID0gbGlua3MubWFwKGwgPT4gYAogICAgICAgICAgICAgICAgPGRpdiBzdHlsZT0iYmFja2dyb3VuZDp2YXIoLS1iZy1pbnB1dCk7IHBhZGRpbmc6IDEwcHg7IGJvcmRlci1yYWRpdXM6IHZhcigtLXJhZGl1cy1tZCk7IGJvcmRlcjogMXB4IHNvbGlkIHZhcigtLWJvcmRlci1jb2xvcik7Ij4KICAgICAgICAgICAgICAgICAgICA8ZGl2IHN0eWxlPSJmb250LXdlaWdodDo2MDA7IGZvbnQtc2l6ZTowLjhyZW07IGNvbG9yOnZhcigtLXRleHQtbXV0ZWQpOyBtYXJnaW4tYm90dG9tOiA0cHg7Ij4ke2wubGFiZWx9PC9kaXY+CiAgICAgICAgICAgICAgICAgICAgPGRpdiBzdHlsZT0iZGlzcGxheTpmbGV4OyBnYXA6IDhweDsiPgogICAgICAgICAgICAgICAgICAgICAgICA8aW5wdXQgdHlwZT0idGV4dCIgcmVhZG9ubHkgdmFsdWU9IiR7bC51cmx9IiBjbGFzcz0iaW5wdXQiIHN0eWxlPSJmb250LXNpemU6MC43OHJlbTsgcGFkZGluZzogNXB4IDhweDsiPgogICAgICAgICAgICAgICAgICAgICAgICA8YnV0dG9uIGNsYXNzPSJidG4gYnRuLXNtIGJ0bi1zZWNvbmRhcnkiIG9uY2xpY2s9ImNvcHlUZXh0KCcke2wudXJsfScsIHRoaXMpIj5Db3B5PC9idXR0b24+CiAgICAgICAgICAgICAgICAgICAgPC9kaXY+CiAgICAgICAgICAgICAgICA8L2Rpdj4KICAgICAgICAgICAgYCkuam9pbignJyk7CgogICAgICAgICAgICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnbW9kYWwtbGlua3MtY29udGVudCcpLmlubmVySFRNTCA9IGh0bWw7CiAgICAgICAgICAgIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdtb2RhbC1saW5rcycpLmNsYXNzTGlzdC5hZGQoJ29wZW4nKTsKICAgICAgICB9CiAgICAgICAgZnVuY3Rpb24gY2xvc2VMaW5rc01vZGFsKCkgewogICAgICAgICAgICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnbW9kYWwtbGlua3MnKS5jbGFzc0xpc3QucmVtb3ZlKCdvcGVuJyk7CiAgICAgICAgfQoKICAgICAgICBmdW5jdGlvbiBjb3B5VGV4dCh0ZXh0LCBidG4pIHsKICAgICAgICAgICAgbmF2aWdhdG9yLmNsaXBib2FyZC53cml0ZVRleHQodGV4dCkudGhlbigoKSA9PiB7CiAgICAgICAgICAgICAgICBjb25zdCBwcmV2ID0gYnRuLnRleHRDb250ZW50OwogICAgICAgICAgICAgICAgYnRuLnRleHRDb250ZW50ID0gJ0NvcGllZCEnOwogICAgICAgICAgICAgICAgc2V0VGltZW91dCgoKSA9PiBidG4udGV4dENvbnRlbnQgPSBwcmV2LCAxNTAwKTsKICAgICAgICAgICAgfSk7CiAgICAgICAgfQoKICAgICAgICAvLyBTeXN0ZW0gQ29uZmlndXJhdGlvbiBWaWV3CiAgICAgICAgZnVuY3Rpb24gcG9wdWxhdGVTZXR0aW5ncyhjZmcpIHsKICAgICAgICAgICAgaWYgKCFjZmcpIHJldHVybjsKICAgICAgICAgICAgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ2NmZy1hcGktcm91dGUnKS52YWx1ZSA9IGNmZy5hcGlSb3V0ZSB8fCAnc3luYyc7CiAgICAgICAgICAgIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdjZmctbW9kZScpLnZhbHVlID0gY2ZnLm1vZGUgfHwgJ2FscGhhJzsKICAgICAgICAgICAgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ2NmZy1jdXN0b20tZG5zJykudmFsdWUgPSBjZmcuY3VzdG9tRG5zIHx8ICdodHRwczovL2Nsb3VkZmxhcmUtZG5zLmNvbS9kbnMtcXVlcnknOwogICAgICAgICAgICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnY2ZnLWNsZWFuLWlwcycpLnZhbHVlID0gY2ZnLmNsZWFuSXBzIHx8ICcnOwogICAgICAgICAgICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnY2ZnLWJhY2t1cC1yZWxheScpLnZhbHVlID0gY2ZnLmJhY2t1cFJlbGF5IHx8IGNmZy5jdXN0b21SZWxheSB8fCAnJzsKICAgICAgICAgICAgY29uc3QgZmluYWxNYXNrRWwgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnY2ZnLWZpbmFsLW1hc2snKTsKICAgICAgICAgICAgaWYgKGZpbmFsTWFza0VsKSBmaW5hbE1hc2tFbC52YWx1ZSA9IGNmZy5maW5hbE1hc2sgfHwgJyc7CiAgICAgICAgICAgIGNvbnN0IGVjaExpc3RFbCA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdjZmctZWNoLWxpc3QnKTsKICAgICAgICAgICAgaWYgKGVjaExpc3RFbCkgewogICAgICAgICAgICAgICAgY29uc3QgZWNoTGlzdCA9IEFycmF5LmlzQXJyYXkoY2ZnLmVjaENvbmZpZ0xpc3QpID8gY2ZnLmVjaENvbmZpZ0xpc3QgOiBERUZBVUxUX0VDSF9DT05GSUdTOwogICAgICAgICAgICAgICAgZWNoTGlzdEVsLnZhbHVlID0gZWNoTGlzdC5qb2luKCdcbicpOwogICAgICAgICAgICAgICAgdXBkYXRlR2xvYmFsRWNoQ291bnQoKTsKICAgICAgICAgICAgfQogICAgICAgIH0KCiAgICAgICAgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ3NldHRpbmdzLWZvcm0nKS5hZGRFdmVudExpc3RlbmVyKCdzdWJtaXQnLCBhc3luYyAoZSkgPT4gewogICAgICAgICAgICBlLnByZXZlbnREZWZhdWx0KCk7CiAgICAgICAgICAgIGNvbnN0IGtleUlucHV0ID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ2NmZy1tYXN0ZXIta2V5Jyk7CiAgICAgICAgICAgIGNvbnN0IHJhd05ld0tleSA9IGtleUlucHV0ID8ga2V5SW5wdXQudmFsdWUudHJpbSgpIDogJyc7CiAgICAgICAgICAgIGNvbnN0IGlzS2V5Um90YXRpb24gPSBCb29sZWFuKHJhd05ld0tleSAmJiByYXdOZXdLZXkgIT09IHN0YXRlLm1hc3RlcktleSk7CgogICAgICAgICAgICBjb25zdCBwYXlsb2FkID0gewogICAgICAgICAgICAgICAgLi4uc3RhdGUuY29uZmlnLAogICAgICAgICAgICAgICAgYXBpUm91dGU6IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdjZmctYXBpLXJvdXRlJykudmFsdWUudHJpbSgpIHx8ICdzeW5jJywKICAgICAgICAgICAgICAgIG1vZGU6IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdjZmctbW9kZScpLnZhbHVlLAogICAgICAgICAgICAgICAgY3VzdG9tRG5zOiBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnY2ZnLWN1c3RvbS1kbnMnKS52YWx1ZS50cmltKCksCiAgICAgICAgICAgICAgICBjbGVhbklwczogZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ2NmZy1jbGVhbi1pcHMnKS52YWx1ZS50cmltKCksCiAgICAgICAgICAgICAgICBiYWNrdXBSZWxheTogZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ2NmZy1iYWNrdXAtcmVsYXknKS52YWx1ZS50cmltKCksCiAgICAgICAgICAgICAgICBmaW5hbE1hc2s6IChkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnY2ZnLWZpbmFsLW1hc2snKT8udmFsdWUgfHwgJycpLnRyaW0oKSwKICAgICAgICAgICAgICAgIGVjaENvbmZpZ0xpc3Q6IChkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnY2ZnLWVjaC1saXN0Jyk/LnZhbHVlIHx8ICcnKQogICAgICAgICAgICAgICAgICAgIC5zcGxpdCgnXG4nKQogICAgICAgICAgICAgICAgICAgIC5tYXAocyA9PiBzLnRyaW0oKSkKICAgICAgICAgICAgICAgICAgICAuZmlsdGVyKEJvb2xlYW4pLAogICAgICAgICAgICB9OwoKICAgICAgICAgICAgaWYgKGlzS2V5Um90YXRpb24pIHsKICAgICAgICAgICAgICAgIHBheWxvYWQubWFzdGVyS2V5ID0gcmF3TmV3S2V5OwogICAgICAgICAgICB9IGVsc2UgewogICAgICAgICAgICAgICAgZGVsZXRlIHBheWxvYWQubWFzdGVyS2V5OwogICAgICAgICAgICB9CgogICAgICAgICAgICB0cnkgewogICAgICAgICAgICAgICAgY29uc3QgcmVzID0gYXdhaXQgZmV0Y2goYC8ke3N0YXRlLmFwaVJvdXRlfS9hcGkvc3luY2AsIHsKICAgICAgICAgICAgICAgICAgICBtZXRob2Q6ICdQT1NUJywKICAgICAgICAgICAgICAgICAgICBoZWFkZXJzOiB7CiAgICAgICAgICAgICAgICAgICAgICAgICdDb250ZW50LVR5cGUnOiAnYXBwbGljYXRpb24vanNvbicsCiAgICAgICAgICAgICAgICAgICAgICAgICdBdXRob3JpemF0aW9uJzogJ0JlYXJlciAnICsgc3RhdGUubWFzdGVyS2V5CiAgICAgICAgICAgICAgICAgICAgfSwKICAgICAgICAgICAgICAgICAgICBib2R5OiBKU09OLnN0cmluZ2lmeSh7IGtleTogc3RhdGUubWFzdGVyS2V5LCBjb25maWc6IHBheWxvYWQgfSkKICAgICAgICAgICAgICAgIH0pOwogICAgICAgICAgICAgICAgY29uc3QgZGF0YSA9IGF3YWl0IHJlcy5qc29uKCk7CiAgICAgICAgICAgICAgICBpZiAoZGF0YS5zdWNjZXNzKSB7CiAgICAgICAgICAgICAgICAgICAgYWxlcnQoJ1N5c3RlbSBjb25maWd1cmF0aW9uIHVwZGF0ZWQgc3VjY2Vzc2Z1bGx5LicpOwogICAgICAgICAgICAgICAgICAgIGlmIChpc0tleVJvdGF0aW9uKSB7CiAgICAgICAgICAgICAgICAgICAgICAgIHN0YXRlLm1hc3RlcktleSA9IHJhd05ld0tleTsKICAgICAgICAgICAgICAgICAgICAgICAgbG9jYWxTdG9yYWdlLnNldEl0ZW0oJ2x1Y2lfc2Vzc2lvbicsIEpTT04uc3RyaW5naWZ5KHsga2V5OiByYXdOZXdLZXksIHRzOiBEYXRlLm5vdygpIH0pKTsKICAgICAgICAgICAgICAgICAgICB9CiAgICAgICAgICAgICAgICAgICAgaWYgKGtleUlucHV0KSBrZXlJbnB1dC52YWx1ZSA9ICcnOwogICAgICAgICAgICAgICAgICAgIHN0YXRlLmNvbmZpZyA9IGRhdGEuY29uZmlnIHx8IHBheWxvYWQ7CgogICAgICAgICAgICAgICAgICAgIGNvbnN0IHN1YlJvdXRlRGlzcGxheSA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdub2RlLXN1Yi1yb3V0ZScpOwogICAgICAgICAgICAgICAgICAgIGlmIChzdWJSb3V0ZURpc3BsYXkpIHsKICAgICAgICAgICAgICAgICAgICAgICAgc3ViUm91dGVEaXNwbGF5LnRleHRDb250ZW50ID0gJy8nICsgKHN0YXRlLmNvbmZpZy5hcGlSb3V0ZSB8fCBzdGF0ZS5hcGlSb3V0ZSk7CiAgICAgICAgICAgICAgICAgICAgfQogICAgICAgICAgICAgICAgICAgIHVwZGF0ZUdsb2JhbEVjaENvdW50KCk7CiAgICAgICAgICAgICAgICAgICAgdXBkYXRlU3Vic2NyaWJlckNvbmZpZ1ByZXZpZXcoKTsKICAgICAgICAgICAgICAgIH0gZWxzZSB7CiAgICAgICAgICAgICAgICAgICAgYWxlcnQoJ1NhdmUgZmFpbGVkOiAnICsgZGF0YS5lcnJvcik7CiAgICAgICAgICAgICAgICB9CiAgICAgICAgICAgIH0gY2F0Y2ggKGVycikgewogICAgICAgICAgICAgICAgYWxlcnQoJ1NhdmUgZmFpbGVkOiAnICsgZXJyLm1lc3NhZ2UpOwogICAgICAgICAgICB9CiAgICAgICAgfSk7CgogICAgICAgIGZ1bmN0aW9uIGV4cG9ydFNoYXJlZFNldHRpbmdzKCkgewogICAgICAgICAgICB3aW5kb3cub3BlbihgLyR7c3RhdGUuYXBpUm91dGV9L3NoYXJlLXNldHRpbmdzYCwgJ19ibGFuaycpOwogICAgICAgIH0KCiAgICAgICAgLy8gRGlhZ25vc3RpY3MgVmlldwogICAgICAgIGFzeW5jIGZ1bmN0aW9uIHJ1blByb3h5SXBQcm9iZSgpIHsKICAgICAgICAgICAgY29uc3QgdGFyZ2V0SW5wdXQgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnZGlhZy10YXJnZXQtaXAnKTsKICAgICAgICAgICAgY29uc3QgdGFyZ2V0ID0gKHRhcmdldElucHV0Py52YWx1ZSB8fCAnJykudHJpbSgpOwogICAgICAgICAgICBjb25zdCByZXNDb25zb2xlID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ2RpYWctcmVzdWx0cycpOwogICAgICAgICAgICBpZiAoIXRhcmdldCkgewogICAgICAgICAgICAgICAgcmVzQ29uc29sZS50ZXh0Q29udGVudCA9ICdQbGVhc2UgZW50ZXIgYW4gSVAgb3IgaG9zdG5hbWUuJzsKICAgICAgICAgICAgICAgIHJldHVybjsKICAgICAgICAgICAgfQogICAgICAgICAgICByZXNDb25zb2xlLnRleHRDb250ZW50ID0gYFByb2JpbmcgJHt0YXJnZXR9OjQ0MyBhY3Jvc3MgNSBUQ1AgY29ubmVjdGlvbnMuLi5cblBsZWFzZSB3YWl0Li4uYDsKCiAgICAgICAgICAgIGNvbnN0IGNvbnRyb2xsZXIgPSBuZXcgQWJvcnRDb250cm9sbGVyKCk7CiAgICAgICAgICAgIGNvbnN0IHRpbWVvdXRJZCA9IHNldFRpbWVvdXQoKCkgPT4gY29udHJvbGxlci5hYm9ydCgpLCAyMDAwMCk7CgogICAgICAgICAgICB0cnkgewogICAgICAgICAgICAgICAgY29uc3QgcmVzID0gYXdhaXQgZmV0Y2goYC8ke3N0YXRlLmFwaVJvdXRlfS9hcGkvcHJveHktaXAvdGVzdD90YXJnZXQ9JHtlbmNvZGVVUklDb21wb25lbnQodGFyZ2V0KX0mYXR0ZW1wdHM9NWAsIHsKICAgICAgICAgICAgICAgICAgICBoZWFkZXJzOiB7ICdBdXRob3JpemF0aW9uJzogJ0JlYXJlciAnICsgc3RhdGUubWFzdGVyS2V5IH0sCiAgICAgICAgICAgICAgICAgICAgc2lnbmFsOiBjb250cm9sbGVyLnNpZ25hbAogICAgICAgICAgICAgICAgfSk7CiAgICAgICAgICAgICAgICBjbGVhclRpbWVvdXQodGltZW91dElkKTsKCiAgICAgICAgICAgICAgICBjb25zdCByYXdUZXh0ID0gYXdhaXQgcmVzLnRleHQoKTsKICAgICAgICAgICAgICAgIGxldCBkYXRhID0gbnVsbDsKICAgICAgICAgICAgICAgIHRyeSB7CiAgICAgICAgICAgICAgICAgICAgZGF0YSA9IEpTT04ucGFyc2UocmF3VGV4dCk7CiAgICAgICAgICAgICAgICB9IGNhdGNoIChwYXJzZUVycikgewogICAgICAgICAgICAgICAgICAgIHJlc0NvbnNvbGUudGV4dENvbnRlbnQgPSBgSFRUUCAke3Jlcy5zdGF0dXN9ICR7cmVzLnN0YXR1c1RleHR9XG5Db250ZW50LVR5cGU6ICR7cmVzLmhlYWRlcnMuZ2V0KCdjb250ZW50LXR5cGUnKSB8fCAndW5rbm93bid9XG5cblNlcnZlciByZXR1cm5lZCBub24tSlNPTiByZXNwb25zZTpcbiR7cmF3VGV4dC5zbGljZSgwLCAxNTAwKX1gOwogICAgICAgICAgICAgICAgICAgIHJldHVybjsKICAgICAgICAgICAgICAgIH0KCiAgICAgICAgICAgICAgICBpZiAoIXJlcy5vayAmJiAhZGF0YS5kYXRhICYmICFkYXRhLmF0dGVtcHRzKSB7CiAgICAgICAgICAgICAgICAgICAgcmVzQ29uc29sZS50ZXh0Q29udGVudCA9IGBbSFRUUCAke3Jlcy5zdGF0dXN9XSBQcm9iZSBmYWlsZWQ6XG4ke2RhdGEuZXJyb3IgfHwgZGF0YS5tZXNzYWdlIHx8IEpTT04uc3RyaW5naWZ5KGRhdGEsIG51bGwsIDIpfWA7CiAgICAgICAgICAgICAgICAgICAgcmV0dXJuOwogICAgICAgICAgICAgICAgfQoKICAgICAgICAgICAgICAgIGNvbnN0IGlzUmVhY2hhYmxlID0gQm9vbGVhbihkYXRhLm9rIHx8IGRhdGEuc3VjY2Vzcyk7CiAgICAgICAgICAgICAgICBjb25zdCBzdGF0dXNTeW1ib2wgPSBpc1JlYWNoYWJsZSA/ICfinIUgUkVBQ0hBQkxFJyA6ICfinYwgVU5SRUFDSEFCTEUnOwogICAgICAgICAgICAgICAgY29uc3QgYXZnTGF0ZW5jeSA9IGRhdGEubGF0ZW5jeV9tcyAhPT0gbnVsbCAmJiBkYXRhLmxhdGVuY3lfbXMgIT09IHVuZGVmaW5lZAogICAgICAgICAgICAgICAgICAgID8gYCR7ZGF0YS5sYXRlbmN5X21zfW1zYAogICAgICAgICAgICAgICAgICAgIDogKGRhdGEuZGF0YT8uYXZnTGF0ZW5jeU1zID8gYCR7ZGF0YS5kYXRhLmF2Z0xhdGVuY3lNc31tc2AgOiAnTi9BJyk7CiAgICAgICAgICAgICAgICBjb25zdCBzdWNjZXNzUmF0ZSA9IGRhdGEuZGF0YT8uc3VjY2Vzc1JhdGUgfHwgKGRhdGEuc3RhdHVzID8gZGF0YS5zdGF0dXMgOiAnTi9BJyk7CgogICAgICAgICAgICAgICAgbGV0IG91dHB1dCA9IGA9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PVxuYDsKICAgICAgICAgICAgICAgIG91dHB1dCArPSBgICBUQ1AgUFJPWFktSVAgUFJPQkUgUkVTVUxUU1xuYDsKICAgICAgICAgICAgICAgIG91dHB1dCArPSBgPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT1cbmA7CiAgICAgICAgICAgICAgICBvdXRwdXQgKz0gYFRhcmdldCBEZXN0aW5hdGlvbiA6ICR7ZGF0YS5pcCB8fCB0YXJnZXR9OjQ0M1xuYDsKICAgICAgICAgICAgICAgIG91dHB1dCArPSBgT3ZlcmFsbCBTdGF0dXMgICAgIDogJHtzdGF0dXNTeW1ib2x9XG5gOwogICAgICAgICAgICAgICAgb3V0cHV0ICs9IGBBdmVyYWdlIExhdGVuY3kgICAgOiAke2F2Z0xhdGVuY3l9XG5gOwogICAgICAgICAgICAgICAgb3V0cHV0ICs9IGBTdWNjZXNzIFJhdGUgICAgICAgOiAke3N1Y2Nlc3NSYXRlfVxuYDsKICAgICAgICAgICAgICAgIG91dHB1dCArPSBgTWVzc2FnZSAgICAgICAgICAgIDogJHtkYXRhLm1lc3NhZ2UgfHwgKGlzUmVhY2hhYmxlID8gJ09LJyA6ICdGYWlsZWQnKX1cblxuYDsKCiAgICAgICAgICAgICAgICBjb25zdCBhdHRlbXB0cyA9IGRhdGEuZGF0YT8uYXR0ZW1wdHMgfHwgW107CiAgICAgICAgICAgICAgICBpZiAoQXJyYXkuaXNBcnJheShhdHRlbXB0cykgJiYgYXR0ZW1wdHMubGVuZ3RoID4gMCkgewogICAgICAgICAgICAgICAgICAgIG91dHB1dCArPSBgSW5kaXZpZHVhbCBDb25uZWN0aW9uIEF0dGVtcHRzOlxuYDsKICAgICAgICAgICAgICAgICAgICBhdHRlbXB0cy5mb3JFYWNoKGEgPT4gewogICAgICAgICAgICAgICAgICAgICAgICBjb25zdCBtYXJrID0gYS5vayA/ICfinJMgT0sgICcgOiAn4pyXIEZBSUwnOwogICAgICAgICAgICAgICAgICAgICAgICBvdXRwdXQgKz0gYCAgW0F0dGVtcHQgJHthLmF0dGVtcHR9XSAke21hcmt9ICAoJHthLmVsYXBzZWRNc31tcylcbmA7CiAgICAgICAgICAgICAgICAgICAgfSk7CiAgICAgICAgICAgICAgICAgICAgb3V0cHV0ICs9ICdcbic7CiAgICAgICAgICAgICAgICB9CgogICAgICAgICAgICAgICAgb3V0cHV0ICs9IGBSYXcgUmVzcG9uc2UgRGF0YTpcbiR7SlNPTi5zdHJpbmdpZnkoZGF0YSwgbnVsbCwgMil9YDsKICAgICAgICAgICAgICAgIHJlc0NvbnNvbGUudGV4dENvbnRlbnQgPSBvdXRwdXQ7CiAgICAgICAgICAgIH0gY2F0Y2ggKGVycikgewogICAgICAgICAgICAgICAgY2xlYXJUaW1lb3V0KHRpbWVvdXRJZCk7CiAgICAgICAgICAgICAgICBpZiAoZXJyLm5hbWUgPT09ICdBYm9ydEVycm9yJykgewogICAgICAgICAgICAgICAgICAgIHJlc0NvbnNvbGUudGV4dENvbnRlbnQgPSBgUHJvYmUgdGltZWQgb3V0IGFmdGVyIDIwIHNlY29uZHMuIFRoZSB0YXJnZXQgZW5kcG9pbnQgKCR7dGFyZ2V0fTo0NDMpIGRpZCBub3QgcmVzcG9uZC5gOwogICAgICAgICAgICAgICAgfSBlbHNlIHsKICAgICAgICAgICAgICAgICAgICByZXNDb25zb2xlLnRleHRDb250ZW50ID0gYE5ldHdvcmsgLyBQcm9iZSBFcnJvcjogJHtlcnIubWVzc2FnZX1gOwogICAgICAgICAgICAgICAgfQogICAgICAgICAgICB9CiAgICAgICAgfQoKICAgICAgICAvLyBMb2dzIFZpZXcKICAgICAgICBhc3luYyBmdW5jdGlvbiBsb2FkQXVkaXRMb2dzKCkgewogICAgICAgICAgICBjb25zdCBjb25zb2xlRWxlbSA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdhdWRpdC1sb2dzLWNvbnNvbGUnKTsKICAgICAgICAgICAgY29uc29sZUVsZW0udGV4dENvbnRlbnQgPSAnTG9hZGluZyBhY3Rpdml0eSByZWNvcmRzLi4uJzsKICAgICAgICAgICAgdHJ5IHsKICAgICAgICAgICAgICAgIGNvbnN0IHJlcyA9IGF3YWl0IGZldGNoKGAvJHtzdGF0ZS5hcGlSb3V0ZX0vYXBpL2xvZ3NgLCB7CiAgICAgICAgICAgICAgICAgICAgaGVhZGVyczogeyAnQXV0aG9yaXphdGlvbic6ICdCZWFyZXIgJyArIHN0YXRlLm1hc3RlcktleSB9CiAgICAgICAgICAgICAgICB9KTsKICAgICAgICAgICAgICAgIGNvbnN0IGRhdGEgPSBhd2FpdCByZXMuanNvbigpOwogICAgICAgICAgICAgICAgaWYgKEFycmF5LmlzQXJyYXkoZGF0YS5sb2dzKSAmJiBkYXRhLmxvZ3MubGVuZ3RoID4gMCkgewogICAgICAgICAgICAgICAgICAgIGNvbnNvbGVFbGVtLnRleHRDb250ZW50ID0gZGF0YS5sb2dzLm1hcChsID0+CiAgICAgICAgICAgICAgICAgICAgICAgIGBbJHtuZXcgRGF0ZShsLnRzKS50b0xvY2FsZVRpbWVTdHJpbmcoKX1dICR7bC50eXBlLnRvVXBwZXJDYXNlKCl9OiAke2wuZGV0YWlsfWAKICAgICAgICAgICAgICAgICAgICApLmpvaW4oJ1xuJyk7CiAgICAgICAgICAgICAgICB9IGVsc2UgewogICAgICAgICAgICAgICAgICAgIGNvbnNvbGVFbGVtLnRleHRDb250ZW50ID0gJ05vIGF1ZGl0IHJlY29yZHMgbG9nZ2VkIHlldC4nOwogICAgICAgICAgICAgICAgfQogICAgICAgICAgICB9IGNhdGNoIChlcnIpIHsKICAgICAgICAgICAgICAgIGNvbnNvbGVFbGVtLnRleHRDb250ZW50ID0gJ0ZhaWxlZCB0byBsb2FkIGxvZ3M6ICcgKyBlcnIubWVzc2FnZTsKICAgICAgICAgICAgfQogICAgICAgIH0KCiAgICAgICAgYXN5bmMgZnVuY3Rpb24gY2xlYXJBdWRpdExvZ3MoKSB7CiAgICAgICAgICAgIGlmICghY29uZmlybSgnQ2xlYXIgYWxsIGF1ZGl0IGFjdGl2aXR5IHJlY29yZHM/JykpIHJldHVybjsKICAgICAgICAgICAgYXdhaXQgZmV0Y2goYC8ke3N0YXRlLmFwaVJvdXRlfS9hcGkvbG9nc2AsIHsKICAgICAgICAgICAgICAgIG1ldGhvZDogJ0RFTEVURScsCiAgICAgICAgICAgICAgICBoZWFkZXJzOiB7ICdBdXRob3JpemF0aW9uJzogJ0JlYXJlciAnICsgc3RhdGUubWFzdGVyS2V5IH0KICAgICAgICAgICAgfSk7CiAgICAgICAgICAgIGxvYWRBdWRpdExvZ3MoKTsKICAgICAgICB9CgogICAgICAgIGZ1bmN0aW9uIGVzY2FwZUh0bWwoc3RyKSB7CiAgICAgICAgICAgIHJldHVybiBTdHJpbmcoc3RyIHx8ICcnKS5yZXBsYWNlKC8mL2csICcmYW1wOycpLnJlcGxhY2UoLzwvZywgJyZsdDsnKS5yZXBsYWNlKC8+L2csICcmZ3Q7JykucmVwbGFjZSgvIi9nLCAnJnF1b3Q7Jyk7CiAgICAgICAgfQogICAgPC9zY3JpcHQ+CjwvYm9keT4KPC9odG1sPgo=";
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
        if (isClashYaml) {
          resHeaders.set("Content-Type", "text/yaml; charset=utf-8");
          const yamlProfile = await buildYamlProfile(clientHost, targetSub, allowInsecure, sysConfig);
          return new Response(yamlProfile, { headers: resHeaders });
        }
        if (isSingboxJson) {
          resHeaders.set("Content-Type", "application/json; charset=utf-8");
          const sbProfile = await buildSingBoxJsonProfile(clientHost, targetSub, allowInsecure, sysConfig);
          return new Response(JSON.stringify(sbProfile, null, 2), { headers: resHeaders });
        }
        if (isV2rayJson) {
          resHeaders.set("Content-Type", "application/json; charset=utf-8");
          const vProfile = await buildVJsonProfile(clientHost, targetSub, allowInsecure, sysConfig);
          return new Response(JSON.stringify(vProfile, null, 2), { headers: resHeaders });
        }
        resHeaders.set("Content-Type", "text/plain; charset=utf-8");
        const rawProfile = await buildUriProfile(clientHost, targetSub, allowInsecure, sysConfig);
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
