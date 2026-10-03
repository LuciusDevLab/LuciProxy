# LuciProxy — Feature & Capability Specification

> **LuciProxy System Capabilities & Technical Feature Specification**

This document provides a comprehensive technical overview of all runtime protocols, routing engines, subscription formats, and resilience features natively supported by LuciProxy.

---

## 1. Protocols & Transports

| Capability | Module Location | Technical Description |
| :--- | :--- | :--- |
| **VLESS over WebSocket** | `src/protocols/vless.js` | Direct VLESS protocol demultiplexing over secure WebSockets on standard Cloudflare HTTP/S ports. |
| **0-RTT Early Data** | `src/protocols/proxy.js` | Zero-round-trip handshake acceleration via `Sec-WebSocket-Protocol` header and early data query parameters (`?ed=2560`). |
| **Trojan over WebSocket** | `src/protocols/trojan.js` | High-performance Trojan authentication using FIPS 180-4 compliant SHA-224 password hashing. |
| **Direct TCP Sockets** | `src/protocols/proxy.js` | High-throughput bi-directional TCP streaming utilizing the native `cloudflare:sockets` API. |
| **RFC 3986 IPv6 Bracketing** | `src/utils/helpers.js` | Standards-compliant bracketed literal formatting for IPv6 endpoints (`[ipv6]:port`). |
| **RFC 6052 Dynamic NAT64** | `src/utils/helpers.js` | Hexadecimal NAT64 IPv6 prefixing and automatic fallback when direct IPv4 egress is restricted. |
| **Port Multiplexing** | `src/config.js` | Native support for all Cloudflare-enabled TLS and non-TLS ports (80, 443, 8080, 8443, 2053, 2083, 2087, 2096). |

---

## 2. Configuration & Subscription Formats

| Capability | Module Location | Technical Description |
| :--- | :--- | :--- |
| **Sing-Box 1.9+ & 1.14+ JSON** | `src/subscriptions/singbox.js` | Schema-validated configurations with modern `route.default_domain_resolver`, outbound multiplexing, and rule-sets. |
| **Clash / Mihomo YAML** | `src/subscriptions/clash.js` | Standard YAML configuration generation featuring proxy-providers, proxy-groups, and rule-providers. |
| **Xray / V2Ray JSON** | `src/subscriptions/v2ray.js` | Standard multi-outbound JSON configurations with granular routing and DNS rules. |
| **Base64 / Plaintext URI Links** | `src/subscriptions/uri.js` | Standard `vless://` and `trojan://` URI scheme collections with metadata badges. |
| **WireGuard (.conf) Profiles** | `src/subscriptions/wireguard.js` | Standard peer configuration with interface keys, MTU, endpoint, and persistent keepalives. |
| **AmneziaWG Obfuscated Profiles** | `src/subscriptions/wireguard.js` | Injects noise headers (`Jc`, `Jmin`, `Jmax`, `S1`, `S2`, `H1..H4`) to resist deep packet inspection. |
| **Shared Settings Export** | `src/subscriptions/export.js` | Base64-encoded JSON export for configuration backup and multi-panel synchronization (`/sync/share-settings`). |

---

## 3. Anti-DPI & Network Defense

| Capability | Module Location | Technical Description |
| :--- | :--- | :--- |
| **Private DoH Resolver** | `src/protocols/doh.js` | RFC 8484 compliant DNS-over-HTTPS endpoint (`/dns-query`) with binary wire format parsing. |
| **QUIC / UDP 443 Blocking** | `src/subscriptions/routing.js` | Client-side routing rules that drop UDP port 443, forcing fallback to censorship-resilient TCP/TLS. |
| **TLS Fragmentation Presets** | `src/subscriptions/uri.js` | Configurable TLS Hello packet fragmentation modes (`balanced`, `gentle`, `aggressive`, `custom`). |
| **Encrypted Client Hello (ECH)** | `src/subscriptions/singbox.js` | Injects uTLS Encrypted Client Hello parameters for compatible Sing-Box clients. |
| **AI / Developer Route Bypasses** | `src/subscriptions/routing.js` | Curated routing rules directing AI platforms and developer tooling through high-availability paths. |

---

## 4. Multi-Carrier Clean IP Routing

| Capability | Module Location | Technical Description |
| :--- | :--- | :--- |
| **Autonomous System Mapping** | `src/subscriptions/isp.js` | Curated ASN detection mapping connecting clients to optimal edge IP pools for major carriers. |
| **Per-User Clean IP Overrides** | `src/users/manager.js` | Allows assigning dedicated clean IP addresses or hostnames per subscriber profile. |
| **TCP Diagnostic Probe** | `src/protocols/proxy.js` | Built-in 5-attempt TCP connectivity probe (`/sync/proxy-ip/test`) to verify proxy endpoint reachability. |

---

## 5. Persistence, Identity & Multi-User Engine

| Capability | Module Location | Technical Description |
| :--- | :--- | :--- |
| **D1 SQLite Persistence** | `src/db/d1.js` | Relational SQLite storage at the edge eliminating KV write quotas. |
| **Granular Traffic Accounting** | `src/users/manager.js` | Byte-accurate tracking of upload and download volumes with periodic debounced persistence. |
| **Volumetric & Expiry Lockout** | `src/users/manager.js` | Automatic lockout when cumulative traffic exceeds limits or expiration timestamp is reached. |
| **Dynamic Cryptographic Bootstrap**| `src/db/d1.js` | High-entropy 24-character hexadecimal administrative key generated on initial boot if unconfigured. |
| **Admin Brute-Force Protection** | `src/auth/auth.js` | Sliding-window IP lockout after consecutive failed authentication attempts. |

---

## 6. Camouflage & Edge Resilience

| Capability | Module Location | Technical Description |
| :--- | :--- | :--- |
| **Origin Mirror Camouflage** | `src/assets/loaders.js` | Transparent reverse-proxying of unauthenticated requests to realistic mirror origins (Ubuntu, Docker, Nginx). |
| **Cloudflare Error 1101 Camouflage**| `src/assets/loaders.js` | Authentic simulation of Cloudflare Error 1101 page with dynamic Ray ID formatting. |
| **VPS Backend Shield Mode** | `src/protocols/proxy.js` | Edge CDN shielding in front of upstream WebSocket backend servers with health checks. |
| **Automated Secret Path Rotation** | `src/auth/auth.js` | Scheduled zero-downtime rotation of administrative endpoints. |
| **GitHub Mirror Failover** | `src/subscriptions/mirror.js` | Automated synchronization of subscription profiles to remote git mirrors for unblocked access. |
