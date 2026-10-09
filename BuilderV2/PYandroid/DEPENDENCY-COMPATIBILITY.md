# Dependency Compatibility & Android Execution Feasibility Analysis

**Document Version:** 1.0.0  
**Phase:** 15 Architecture Audit  
**Target:** LuciProxy Python Android Subsystem (`BuilderV2/PYandroid`)

---

## 1. Overview

This document analyzes the execution feasibility and runtime compatibility of all standard library and third-party dependencies utilized by `BuilderV2`, establishing concrete deployment strategies for the Android runtime environment.

---

## 2. Standard Library Modules

The following table summarizes all Python standard library modules required by `BuilderV2` and their verification status on Android (tested against Python 3.10/3.11 runtimes on Android API 26-34):

| Module | Purpose in LuciProxy | Status on Android | Notes / Constraints |
| :--- | :--- | :--- | :--- |
| `sqlite3` | Local database storage for accounts, connections, and worker states | **Available & Verified** | Compiles against Android's native Bionic libc and SQLite C-library. Supports all standard SQLite pragmas. |
| `secrets` | Cryptographically secure token, UUID, and route generation | **Available & Verified** | Backed by Linux kernel `/dev/urandom` / `getrandom(2)` syscall. |
| `uuid` | Generating RFC 4122 v4 identifiers | **Available & Verified** | Pure Python implementation backed by `secrets`. |
| `hashlib` | SHA-256 asset verification, source bundle integrity | **Available & Verified** | Bundled OpenSSL C-bindings provide full hardware crypto acceleration on ARM64 and x86_64. |
| `zipfile` | Canonical release asset decompression, source bundle handling | **Available & Verified** | Pure Python + built-in `zlib`. Memory-safe decompression. |
| `json` | Cloudflare REST and GraphQL payload serialization | **Available & Verified** | Standard C-accelerated implementation. |
| `urllib.parse` | URL formatting and parameter escaping | **Available & Verified** | Pure Python standard module. |
| `dataclasses` | DTO and domain model representation | **Available & Verified** | Standard in Python 3.7+. Zero runtime overhead. |
| `datetime` / `time` | Timestamp auditing and synchronization intervals | **Available & Verified** | Uses Android system clock. |
| `concurrent.futures` / `threading` | Non-blocking background worker execution | **Available & Verified** | Standard POSIX pthreads on Android. |
| `tempfile` / `shutil` | Temporary archive extraction and cleanup | **Available & Verified** | Restricted to app sandbox directory (`context.cacheDir`). |
| `ctypes` | Foreign function interface | **Platform-Specific** | Available, but `ctypes.windll` is Windows-only. Must not be used for Android credentials. |

---

## 3. Third-Party Dependencies

| Package | Classification | Android Feasibility | Resolution Strategy |
| :--- | :--- | :--- | :--- |
| `requests` | HTTP Client | **100% Compatible** | Pure Python. Pip-installable in Chaquopy `build.gradle.kts`. |
| `urllib3` | HTTP Transport | **100% Compatible** | Pure Python dependency of `requests`. |
| `certifi` | CA Root Bundle | **100% Compatible** | Ships pure Python Mozilla CA certificates. |
| `charset-normalizer` | Charset Detection | **100% Compatible** | Pure Python wheels available on PyPI. |
| `idna` | Internationalized Domains | **100% Compatible** | Pure Python dependency of `requests`. |
| `PySide6` / `Qt6` | Desktop UI Toolkit | **Incompatible** | Omit entirely from Android build. Replace presentation layer with Jetpack Compose. |
| `pefile` | PE Binary Inspector | **Incompatible / Not Needed** | Windows-only build script utility. Omit from Android build. |

---

## 4. Special Architecture Considerations

### A. The Worker Bundler (`esbuild`) Problem

**The Challenge:**  
On Windows, `BuilderV2/worker_source/bundler.py` invokes `tools/esbuild.exe` via `subprocess.run` to compile and bundle TypeScript source files into a single JavaScript payload before uploading to Cloudflare.  
On Android:
- Running desktop `esbuild.exe` is impossible (PE x86_64 binary).
- Running an Android ARM64 `esbuild` binary requires bundling native ELF executables into the APK, extracting them to executable app storage, and managing Android 10+ W^X (no-exec on app data) restrictions.

**The Architectural Solution:**  
In production (Phases 6–14), LuciProxy Manager uses **WorkerSourceService** to deploy canonical Worker releases from GitHub (e.g., `worker-v1.2.1.zip`).  
1. The canonical zip archive already contains the fully bundled, production-ready `dist/index.js`.
2. The Android Manager downloads this pre-compiled asset, verifies its SHA-256 against `version.json`, and deploys it directly using multipart MIME upload.
3. **Result:** Zero JavaScript bundling is needed on the mobile device. No Node.js, no `esbuild`, and no compiler overhead are required.

### B. Secure Credential Storage

**The Challenge:**  
On Windows, tokens are persisted in Windows Credential Manager via `advapi32.dll`. Android has no Windows Credential Manager.

**The Architectural Solution:**  
1. Define a platform-abstracted `SecureCredentialStore` interface in Python with methods:
   - `get_token(connection_id: str) -> Optional[str]`
   - `save_token(connection_id: str, token: str) -> None`
   - `delete_token(connection_id: str) -> bool`
   - `has_token(connection_id: str) -> bool`
2. On Android, the Kotlin application implements this interface using **Android Keystore** and **EncryptedSharedPreferences** (AES-256-GCM).
3. Tokens are passed in-memory across the bridge only for the duration of the API call, ensuring zero plaintext leakage to disk.
