# LuciProxy

> **Multi-User Cloudflare Edge Proxy & Subscription Gateway**

LuciProxy is a serverless edge proxy and subscription gateway designed to run natively on the Cloudflare Workers global edge network with Cloudflare D1 SQLite persistence.

[![License: GNU AGPLv3](https://img.shields.io/badge/License-GNU%20AGPLv3-blue.svg)](LICENSE)
[![Runtime: Cloudflare Workers](https://img.shields.io/badge/Runtime-Cloudflare%20Workers-orange.svg)](https://workers.cloudflare.com/)
[![Node.js Tests](https://img.shields.io/badge/Tests-67%2F67%20Passing-brightgreen.svg)](tests/)

---

## 🌟 Key Features

### 1. Robust Multi-User Engine & Persistence
- **Cloudflare D1 Relational Storage**: Durable SQLite persistence at the edge eliminating external database dependencies and write throttling.
- **Granular Traffic Accounting**: Real-time upload and download byte tracking with automated quota lockout upon exhaustion.
- **Expiration Enforcement**: Millisecond-accurate subscriber expiration dates with visual status indicators.
- **In-Memory Circuit Breaker**: State caching layer for graceful handling of temporary edge failures and graceful edge degradation.

### 2. Modern Protocol Multiplexing & 0-RTT
- **Dual-Protocol Gateway**: **VLESS** and **Trojan** protocol handling over secure WebSockets.
- **0-RTT Early Data**: State caching layer for graceful handling of temporary edge failures. via `Sec-WebSocket-Protocol` header and early data query parameters.
- **FIPS 180-4 SHA-224**: Cryptographic identity verification for Trojan authentication.
- **Direct TCP Sockets**: Low-latency outbound streaming utilizing the native `cloudflare:sockets` API.
- **IPv6 Destination Formatting**: Full RFC 3986 bracketed literal formatting for IPv6 destinations (`[ipv6]:port`) and dynamic RFC 6052 NAT64 mapping.

### 3. Edge Camouflage & Network Resilience
- **Multi-Carrier Clean IP Routing**: Dynamic IP routing tailored for regional and international mobile/broadband network providers based on autonomous system numbers (ASNs).
- **Realistic Origin Camouflage**: Transparent reverse-proxying of unauthenticated requests to realistic mirror origins (Ubuntu, Docker, Nginx), plus Cloudflare Error 1101-style response simulation.
- **Anti-DPI & Defense Filters**: Configurable QUIC (UDP port 443) blocking, uTLS Encrypted Client Hello (ECH) parameters, and TLS packet fragmentation presets.
- **Private DoH Resolver**: In-worker RFC 8484 compliant DNS-over-HTTPS gateway (`/dns-query`).
- **VPS Backend Mode**: Cloudflare CDN shielding in front of self-hosted upstream WebSocket backend servers with automated health probes.
- **Scheduled Secret Rotation**: Configurable rotation of administrative endpoints.

### 4. Rich Subscription Generation
- Generates fully compliant, schema-validated configurations for:
  - **Sing-Box 1.9+ & 1.14+** (with rule-sets, route-options, and outbound multiplexing)
  - **Clash / Mihomo** (proxy-providers, proxy-groups, and rule-providers)
  - **Xray / V2Ray** (JSON routing and outbound objects)
  - **WireGuard & AmneziaWG** (standard and noise-obfuscated INI profiles with headers `Jc`, `Jmin`, `Jmax`, `S1`, `S2`, `H1..H4`)
  - **Base64 URI Collections** (`vless://`, `trojan://`)
- Built-in responsive Web Admin Console and Subscriber Portal with live usage metrics and one-click client import.

---

## 📁 Repository Structure

```text
LuciProxy/
├── LuciProxy/                     # Cloudflare Worker Edge Source
│   ├── src/
│   │   ├── index.js               # Edge entrypoint & request router
│   │   ├── config.js              # System defaults, carrier mappings, and presets
│   │   ├── db/                    # D1 SQLite persistence store & state cache
│   │   ├── users/                 # Multi-user lifecycle, quotas, and session auth
│   │   ├── protocols/             # VLESS & Trojan decoders, TCP multiplexer, 0-RTT, DoH
│   │   ├── subscriptions/         # Sing-Box, Clash, Xray, WireGuard/AmneziaWG builders
│   │   ├── api/                   # REST API routes (users, sync, stats, proxy-ip probe)
│   │   ├── assets/                # Web dashboard, subscriber portal, and camouflage pages
│   │   └── utils/                 # Cryptographic routines, NAT64, and network helpers
│   ├── tests/                     # 67 automated Node.js regression test suites
│   ├── package.json               # ESM package definition (v1.0.0)
│   └── wrangler.json              # Canonical Cloudflare Workers configuration template
├── docs/                          # Architecture & Environment Documentation
│   ├── ARCHITECTURE.md            # System architecture & edge data flows
│   ├── CAPABILITIES.md            # Comprehensive capability inventory
│   ├── CLOUDFLARE-PERMISSIONS.md  # Cloudflare API permissions & token setup
│   └── CONNECTIVITY-REPORT.md     # Real-world Sing-Box & live edge verification
├── LICENSE                        # GNU AGPL-3.0 License
├── README.md                      # Project documentation
└── .gitignore                     # Repository exclusion rules
```

---

## 🚀 Quick Start (Deployment via Wrangler)

### Prerequisites
- Node.js 18+ and npm installed (`npm --version`)
- A free or paid Cloudflare account

### 1. Clone the Repository
```bash
git clone https://github.com/LuciusDevLab/LuciProxy.git
cd LuciProxy/LuciProxy
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Provision Cloudflare D1 Database
Create the D1 SQLite database using Wrangler:
```bash
npx wrangler d1 create luciproxy-db
```

Note the `database_id` returned in the terminal output.

### 4. Configure `wrangler.json`
Update `LuciProxy/wrangler.json` with your database name and ID:
```json
{
  "name": "luciproxy",
  "main": "src/index.js",
  "compatibility_date": "2026-10-01",
  "compatibility_flags": ["nodejs_compat"],
  "d1_databases": [
    {
      "binding": "IOT_DB",
      "database_name": "luciproxy-db",
      "database_id": "<your-d1-database-id>"
    }
  ],
  "observability": {
    "enabled": true
  }
}
```

### 5. Deploy to Cloudflare Edge
Deploy your Worker to the global edge:
```bash
npx wrangler deploy
```

Once deployed, visit your Worker URL (`https://luciproxy.<subdomain>.workers.dev/sync/dash`) to access the Admin Console. On first launch, a cryptographically secure administrative key will be generated automatically and saved into your D1 database.

---

## 🧪 Testing & Verification

LuciProxy includes automated regression tests covering its runtime components.

```bash
cd LuciProxy
npm test
```

- **Runtime Test Suite:** **67 passing tests** (0 failed, 0 skipped).
- **Test Categories:**
  - Cryptographic hash verification (FIPS 180-4 SHA-224, UUIDs, Base64)
  - REST endpoints and administration authentication
  - D1 SQLite persistence and quota tracking
  - Edge resilience, clean IP resolution, and carrier mapping
  - VLESS and Trojan protocol decoders & socket pipelines
  - 0-RTT early data and RFC 6052 NAT64 transformations
  - Sing-Box 1.14+, Clash, Xray, and WireGuard/AmneziaWG profile builders

---

## 🔒 Security Baseline

- **Zero Plaintext Credentials on Disk**: Sensitive secrets are never committed or logged.
- **Dynamic Master Key Generation**: If no administrative secret is configured in the environment, LuciProxy generates a high-entropy 24-character hexadecimal key on initial edge deployment and stores it directly in D1.
- **Brute-Force Rate Limiting**: The administrative authentication endpoint enforces a sliding-window lockout after consecutive failed attempts.
- **Strict Input Validation**: Early data buffers and WebSocket frames are bounded to prevent denial-of-service and memory exhaustion attacks.

---

## 📜 License

This project is licensed under the **GNU Affero General Public License v3.0 (GNU AGPL-3.0)** — see the [LICENSE](LICENSE) file for details.

Copyright (C) 2026 LuciusDevLab.
