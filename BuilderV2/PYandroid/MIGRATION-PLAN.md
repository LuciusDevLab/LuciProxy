# Step-by-Step Migration Plan: BuilderV2 to PYandroid

**Document Version:** 1.0.0  
**Phase:** 15 Architecture Audit  
**Target:** LuciProxy Python Android Subsystem (`BuilderV2/PYandroid`)

---

## 1. Executive Summary

This document outlines the systematic, phased roadmap for establishing the new Python-powered Android Manager (`BuilderV2/PYandroid`). The migration leverages the battle-tested Python business core of `BuilderV2` while decoupling it completely from desktop PySide6 UI and Windows OS APIs.

---

## 2. Phased Roadmap

```
Phase 1: Core Logic Isolation (Pure Python)
   │
   ▼
Phase 2: Platform Abstraction & Bridge Architecture
   │
   ▼
Phase 3: Automated Testing & Python Runtime Validation
   │
   ▼
Phase 4: Android Toolchain & Chaquopy Gradle Integration
   │
   ▼
Phase 5: Native UI & Keystore Integration (Jetpack Compose)
   │
   ▼
Phase 6: End-to-End Validation & Parity Verification
```

---

## 3. Detailed Phase Breakdown

### Phase 1: Core Logic Extraction & Modularization
- **Objective:** Extract portable business logic into `BuilderV2/PYandroid/src/core/`.
- **Tasks:**
  1. Extract Cloudflare REST & GraphQL API clients (`client.py`, `account_service.py`, `worker_service.py`, `d1_service.py`, `analytics_service.py`).
  2. Extract randomized neutral resource and route generation (`naming.py`).
  3. Extract worker installation, in-place update, and script deletion engine (`deployment.py`).
  4. Decouple local SQLite storage schema from desktop filesystem paths, accepting app sandbox directory at initialization.
  5. Remove all imports of `PySide6`, `pefile`, and Windows `ctypes.windll`.

### Phase 2: Platform Abstraction & Bridge Architecture
- **Objective:** Establish the contract between native Android and the Python engine.
- **Tasks:**
  1. Define `SecureCredentialStore` abstract interface in `src/core/credentials.py`.
  2. Implement `BridgeInterface` in `src/bridge/interface.py` offering a synchronous/asynchronous Python facade.
  3. Design structured DTO request/response payloads (JSON-serializable dictionaries) for all operations:
     - `add_connection(name, token)`
     - `list_accounts(connection_id)`
     - `get_account_details(connection_id, account_id)`
     - `deploy_worker(connection_id, account_id, options)`
     - `update_worker(connection_id, account_id, worker_name)`
     - `delete_worker(connection_id, account_id, worker_name)`

### Phase 3: Automated Testing & Validation
- **Objective:** Prove standalone execution of the Python core without external dependencies.
- **Tasks:**
  1. Write unit tests under `BuilderV2/PYandroid/tests/` covering:
     - Cloudflare API client mocking
     - Randomized route and neutral naming collision resistance
     - Worker deployment state machine
     - In-place update preserving D1 databases
     - Script deletion without deleting D1 databases
     - Async and multithreaded worker execution
  2. Verify 100% test pass rate on standard Python 3.10/3.11.

### Phase 4: Android Toolchain & Chaquopy Gradle Integration
- **Objective:** Configure the Android project to embed the Python runtime.
- **Tasks:**
  1. In `BuilderV2/PYandroid/android/` (or designated Android module), configure `build.gradle.kts` with Chaquopy Gradle plugin:
     ```kotlin
     plugins {
         id("com.chaquo.python") version "15.0.1"
     }
     ```
  2. Declare Python requirements:
     ```kotlin
     python {
         version = "3.10"
         pip {
             install("requests==2.31.0")
         }
         srcDir("../src")
     }
     ```
  3. Verify clean APK compilation via `./gradlew assembleDebug` on Windows developer workstation.

### Phase 5: Native UI & Keystore Integration (Jetpack Compose)
- **Objective:** Connect the native Material 3 interface to the Python core.
- **Tasks:**
  1. Implement `AndroidKeystoreCredentialStore` in Kotlin backed by `EncryptedSharedPreferences`.
  2. Provide a Kotlin `LuciProxyRepository` that calls `Python.getInstance().getModule("bridge.interface").callAttr(...)`.
  3. Build Compose screens:
     - Home Screen (Account summary cards, daily request metrics)
     - Account Details Screen (Worker list, linked D1 tables, unassigned D1 tables)
     - Create Worker Dialog / Screen (Progress bar, step indicators)
     - Update Worker Dialog (In-place update preserving D1)
     - Delete Worker Dialog (Explicit D1 preservation guarantee)

### Phase 6: Parity Validation & Final Approval
- **Objective:** Verify absolute feature parity between Windows Manager and Python-Android Manager.
- **Tasks:**
  1. Verify zero Cloudflare 1011 errors by asserting automatic `enable_subdomain` execution.
  2. Verify real request analytics display with graceful handling of unavailable quotas.
  3. Verify connection rehydration across application exit and relaunch.
  4. Perform manual QA on physical Android devices.
