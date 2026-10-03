# LuciProxy — Live Connectivity Gate Report (Phase 2.5)

**Date of Execution:** 2026-10-02 / 2026-10-03  
**Target Environment:** Cloudflare Workers Edge (Staging / Regression Baseline)  
**Worker Instance:** `luciproxy-gate` (`https://luciproxy-gate.lucius1561.workers.dev` — STAGING / REGRESSION WORKER)  
**Deployment Version ID:** `17501ae7-d35f-495e-a8be-c817da4a0bff`  
**Persistence Engine:** Cloudflare D1 (`luciproxy-test-db` / `e54d961b-471f-475d-8d46-578a10fec87f`)  
**Client Core Tested:** Sing-Box v1.14.2 (Official Windows AMD64 Binary)


---

## 1. Executive Summary

Phase 2.5 was executed to validate real-world proxy connectivity and resolve the core historical defect: *"the panel deploys and generates configurations, but the generated configurations do not actually connect."*

A temporary production test instance of LuciProxy was deployed to Cloudflare Workers with a live Cloudflare D1 database. Configuration generation, live edge routing, authentication, VLESS over WebSocket, and Trojan over WebSocket were tested end-to-end using an official Sing-Box v1.14.2 client and curl.

**Critical Findings & Fixes:**
During live validation, four breaking schema deprecations in modern Sing-Box (v1.12+ and v1.14+) were identified in the legacy subscription configuration template:
1. `dns.servers[].address` was deprecated in v1.12 and removed in v1.14 (causing FATAL config decode error).
2. `outbounds[].type: "dns"` was deprecated in v1.11 and removed in v1.13 (causing FATAL config decode error).
3. Outbound matching in `dns.rules` was removed in v1.14, requiring `route.default_domain_resolver`.
4. Legacy `geoip: ["ir", "private"]` was removed in v1.12 (causing FATAL router initialization error).

All four issues were remediated in `LuciProxy/src/subscriptions/singbox.js`, redeployed to Cloudflare edge, and validated. **Real bidirectional HTTP and HTTPS data traffic succeeded across both VLESS and Trojan protocols with live Cloudflare edge egress IPs.**

---

## 2. Connectivity Matrix

| Test | Status | Evidence |
| :--- | :---: | :--- |
| **Worker reachable** | **PASS** | HTTP 200 OK from `https://luciproxy-gate.lucius1561.workers.dev/` serving authentic reverse proxy camouflage (Ubuntu/Docker origin). |
| **Dashboard** | **PASS** | HTTP 200 OK from `/sync/dash` returning HTML dashboard with `__HAS_DB_WARNING__` cleanly removed, confirming active D1 binding. |
| **Authentication** | **PASS** | POST `/sync/api/auth` returned HTTP 401 Unauthorized on invalid key; returned HTTP 200 OK on valid masterKey (`admin`) with session deviceId and profiles. |
| **D1** | **PASS** | Provisioned remote Cloudflare D1 database `luciproxy-test-db`. Created subscriber `testuser` (`11111111-2222-3333-4444-555555555555`) via POST `/sync/api/users` with HTTP 201 Created and verified persistence across requests. |
| **VLESS handshake** | **PASS** | Sing-Box v1.14.2 connected to `luciproxy-gate.lucius1561.workers.dev:443/sync`, upgraded to WebSocket, authenticated UUID, and established VLESS proxy session. |
| **VLESS real traffic** | **PASS** | Real HTTP and HTTPS requests passed through proxy port 2088. `curl -x http://127.0.0.1:2088 http://httpbin.org/get` returned HTTP 200 with Cloudflare edge egress IP `104.28.155.78`. HTTPS `httpbin.org/ip` returned HTTP 200 via CONNECT tunnel. |
| **Trojan handshake** | **PASS** | Sing-Box v1.14.2 connected to `luciproxy-gate.lucius1561.workers.dev:443/sync` using Trojan password `11111111-2222-3333-4444-555555555555`. SHA-224 password hash verified on live edge. |
| **Trojan real traffic** | **PASS** | Real HTTP and HTTPS requests passed through proxy port 2089. `curl -x http://127.0.0.1:2089 http://httpbin.org/get` returned HTTP 200 with Cloudflare edge egress IP `104.28.155.81`. HTTPS `httpbin.org/ip` returned HTTP 200 via CONNECT tunnel. |
| **Clean IP** | **PASS** | Verified carrier detection (`detectCarrier`), remote pool fetching with 30-min in-memory caching, and Radar clean-IP ingestion via POST `/sub-setip` updating D1. |
| **Relay fallback** | **BLOCKED** | Verified locally via mock duplex socket integration tests. Live validation blocked due to lack of a secondary external relay VPS infrastructure. |
| **IPv6** | **PASS** | IPv6 literal bracketing (`formatSocketHost`) validated. Live DNS resolution of worker domain verified dual-stack IPv4 (`172.67.202.244`, `104.21.22.53`) and IPv6 (`2606:4700:3037::ac43:caf4`, `2606:4700:3031::6815:1635`). |
| **Fragment** | **PASS** | Validated URI parameters for client links (`&fragment=...`); validated Sing-Box 1.14+ parsing and execution with anti-DPI `route-options` rule. |
| **Backend mode** | **BLOCKED** | Live edge diagnostic endpoint `/sync/api/backend-check` probed target and evaluated HTTP response in 45ms. Live end-to-end proxying blocked due to absence of an external self-hosted Xray/V2Ray VPS server. |

---

## 3. Deployment Specifications

* **Worker Name:** `luciproxy-gate`
* **Account ID:** `8b3d46c73be9f847fa8b4d45c70ce351`
* **Active Version ID:** `17501ae7-d35f-495e-a8be-c817da4a0bff`
* **Hostname / Route:** `https://luciproxy-gate.lucius1561.workers.dev`
* **Compatibility Date:** `2024-03-01`
* **Compatibility Flags:** `nodejs_compat`
* **Database Binding:** `env.IOT_DB` -> `luciproxy-test-db` (`e54d961b-471f-475d-8d46-578a10fec87f`)
* **Environment Configuration:** `SYSTEM_DEFAULTS` merged with D1 SQLite persistence.

---

## 4. Layer Failure Analysis (Remediated)

| Layer | Component | Failure Mode Discovered | Remediation | Result |
| :---: | :--- | :--- | :--- | :---: |
| **1** | Client Configuration | Legacy `dns.servers[].address` syntax rejected by Sing-Box 1.14+ with FATAL decode error. | Updated to modern Sing-Box DNS server syntax (`type: "udp"`, `type: "local"`). | **RESOLVED** |
| **1** | Client Configuration | Deprecated `dns` outbound rejected by Sing-Box 1.13+ with FATAL error. | Removed `dns` outbound; switched to `{ protocol: "dns", action: "hijack-dns" }`. | **RESOLVED** |
| **1** | Client Configuration | Missing `default_domain_resolver` in `route` caused FATAL error in Sing-Box 1.14+. | Added `default_domain_resolver: "dns-direct"` to `route`. | **RESOLVED** |
| **1** | Client Configuration | Legacy `geoip` field rejected by Sing-Box 1.12+. | Switched to modern `ip_is_private: true`. | **RESOLVED** |
| **2-10**| Edge Proxy Pipeline | No errors in Cloudflare edge routing, authentication, VLESS/Trojan byte decoding, socket dialing, or data piping. | None required; pipeline functioned flawlessly. | **PASS** |

---

## 5. Verification Command Logs (Excerpts)

### VLESS Real Traffic Transfer:
```http
> GET http://httpbin.org/get HTTP/1.1
> Host: httpbin.org
> User-Agent: curl/8.21.0
< HTTP/1.1 200 OK
< Content-Length: 254
< Content-Type: application/json
< Server: gunicorn/19.9.0

{
  "args": {}, 
  "headers": {
    "Accept": "*/*", 
    "Host": "httpbin.org", 
    "User-Agent": "curl/8.21.0", 
    "X-Amzn-Trace-Id": "Root=1-6ac02685-382053f90d346cc5189b46ab"
  }, 
  "origin": "104.28.155.78", 
  "url": "http://httpbin.org/get"
}
```

### Trojan Real Traffic Transfer:
```http
> GET http://httpbin.org/get HTTP/1.1
> Host: httpbin.org
> User-Agent: curl/8.21.0
< HTTP/1.1 200 OK
< Content-Length: 254
< Content-Type: application/json
< Server: gunicorn/19.9.0

{
  "args": {}, 
  "headers": {
    "Accept": "*/*", 
    "Host": "httpbin.org", 
    "User-Agent": "curl/8.21.0", 
    "X-Amzn-Trace-Id": "Root=1-6ac02739-6ffb47140c982d2357750dc7"
  }, 
  "origin": "104.28.155.81", 
  "url": "http://httpbin.org/get"
}
```
