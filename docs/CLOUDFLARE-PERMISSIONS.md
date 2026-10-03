# Cloudflare Permissions Specification

> **Cloudflare API Permissions & Worker Security Specification**

This document defines the exact minimum Cloudflare API permissions required to deploy, configure, and operate **LuciProxy** on Cloudflare Workers and Cloudflare D1.

---

## 1. Executive Summary

LuciProxy runs natively on Cloudflare Workers using Cloudflare D1 SQLite for persistence. Deployment automation (via Wrangler or CI/CD pipelines) requires a scoped Cloudflare API token.

By design, **no Global API Keys or Account-level Super-Admin tokens are required or accepted**. Deployment operates strictly with an **unprivileged, narrowly-scoped Cloudflare API Token**.

---

## 2. API Token Permission Scope Matrix

To create a compliant API Token in the [Cloudflare API Tokens Dashboard](https://dash.cloudflare.com/profile/api-tokens), configure the following permissions:

| # | Resource Group | Resource | Permission Level | Technical Justification |
|---|----------------|----------|------------------|-------------------------|
| 1 | **User** | **API Tokens** | `Read` | Validates token authenticity and expiration status via `/user/tokens/verify`. |
| 2 | **User** | **User Details** | `Read` | Discovers user profile email and identifier via `/user`. |
| 3 | **Account** | **Account Settings** | `Read` | Discovers Cloudflare Account IDs accessible by the token via `/accounts`. |
| 4 | **Account** | **Workers Scripts** | `Edit` | Checks script existence, provisions/updates Worker code, and attaches D1 bindings via `/accounts/{id}/workers/scripts/{name}`. |
| 5 | **Account** | **Workers Routes** | `Edit` | Enables public traffic routing to the `*.workers.dev` subdomain via `/accounts/{id}/workers/scripts/{name}/subdomain`. |
| 6 | **Account** | **D1** | `Edit` | Provisions SQLite database instances, checks existing databases, initializes `kv_store` schema, and performs health pings via `/accounts/{id}/d1/database`. |

> [!NOTE]
> All Account-level permissions can optionally be restricted to a **Specific Account** rather than "All accounts" for enhanced enterprise security.

---

## 3. Deployment Operations & API Endpoints

The table below maps deployment operations to HTTP methods, endpoints, and required Cloudflare scopes:

| Deployment Operation | HTTP Method | Cloudflare API Endpoint | Required Scope | Rationale |
|----------------------|-------------|-------------------------|----------------|-----------|
| **Token Verification** | `GET` | `/client/v4/user/tokens/verify` | `User:API Tokens:Read` | Proves token validity before attempting provisioning. |
| **User Identity** | `GET` | `/client/v4/user` | `User:User Details:Read` | Retrieves email for display during deployment. |
| **Account Discovery** | `GET` | `/client/v4/accounts` | `Account:Account Settings:Read` | Discovers target Account ID if user has multiple accounts. |
| **Worker Subdomain** | `GET` | `/client/v4/accounts/{id}/workers/subdomain` | `Account:Workers Scripts:Read` | Resolves `*.workers.dev` subdomain for subscription links. |
| **Worker Lookup** | `GET` | `/client/v4/accounts/{id}/workers/scripts/{name}` | `Account:Workers Scripts:Read` | Detects existing Worker for idempotency / update planning. |
| **Worker Upload** | `PUT` | `/client/v4/accounts/{id}/workers/scripts/{name}` | `Account:Workers Scripts:Edit` | Direct REST API / Wrangler upload of bundled Worker code. |
| **Subdomain Route** | `POST` | `/client/v4/accounts/{id}/workers/scripts/{name}/subdomain` | `Account:Workers Routes:Edit` | Activates `{worker}.{subdomain}.workers.dev` route. |
| **Worker Deletion** | `DELETE` | `/client/v4/accounts/{id}/workers/scripts/{name}` | `Account:Workers Scripts:Edit` | Enables lifecycle cleanup of temporary test deployments. |
| **D1 Lookup** | `GET` | `/client/v4/accounts/{id}/d1/database` | `Account:D1:Read` | Discovers existing D1 databases to prevent duplicate provisioning. |
| **D1 Creation** | `POST` | `/client/v4/accounts/{id}/d1/database` | `Account:D1:Edit` | Provisions a new SQLite database instance for LuciProxy storage. |
| **D1 Deletion** | `DELETE` | `/client/v4/accounts/{id}/d1/database/{id}` | `Account:D1:Edit` | Enables teardown of temporary D1 instances. |
| **D1 Schema Init** | `POST` | `/client/v4/accounts/{id}/d1/database/{id}/query` | `Account:D1:Edit` | Executes `CREATE TABLE IF NOT EXISTS kv_store` and SQL pings. |

---

## 4. LuciProxy Runtime Cloudflare Edge Permissions

At runtime on Cloudflare Workers:

1. **D1 SQLite Binding (`IOT_DB`)**:
   - Bound natively within the Cloudflare Worker V8 isolate execution environment.
   - **No API tokens or secrets are stored in the Worker environment variables or code**.
   - Read and write access to the SQLite table `kv_store` is mediated directly by Cloudflare's internal IPC binding.

2. **Network Outbound (`fetch` / `connect`)**:
   - `connect()` API for raw TCP outbound proxy tunneling (VLESS, Trojan).
   - Standard HTTP `fetch()` for DoH upstream DNS resolution (`1.1.1.1`, `8.8.8.8`) and clean IP list synchronization.
   - Requires no special API tokens.

3. **Optional Cloudflare GraphQL Analytics**:
   - If the administrator configures real-time quota telemetry via Cloudflare GraphQL in the dashboard settings, a read-only token scoped to `Account:Analytics:Read` can be stored in the admin settings table in D1.

---

## 5. Security Baseline

1. **Zero Secret Storage on Disk**:
   - Wrangler configuration files (`wrangler.json`) committed to version control are completely sanitized and contain zero secrets or authentication material.
2. **Dynamic Key Bootstrap**:
   - Administrative master keys are never hardcoded in plaintext. A cryptographic random hex key is dynamically generated and stored in D1 on first run.
