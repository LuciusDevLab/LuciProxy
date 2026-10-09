# LuciProxy PYandroid Subsystem

**Version:** 1.0.0  
**Phase:** 16 Full Implementation & Native Build  
**Root Path:** `BuilderV2/PYandroid/`  
**Target APK:** `BuilderV2/PYandroid/luciproxy-pyandroid-debug.apk`

---

## 1. Overview

`PYandroid` is the official Python-powered Android Manager for LuciProxy. It runs the full, battle-tested Python business core of `BuilderV2` (Cloudflare REST/GraphQL clients, randomized neutral resource naming, random API route generation, D1 database preservation, and source-based deployments) directly inside an embedded Python 3.10 interpreter on Android using Chaquopy.

This architecture completely eliminates logic duplication across platforms while delivering a native, hardware-accelerated Material 3 user experience backed by AES-256-GCM encryption in the Android Keystore.

---

## 2. Architecture & Design

Following the Phase 15 evidence-based audit, `PYandroid` implements **Option B**:
- **Portable Python Business Core (`src/core/`)**: 100% pure Python 3.10+ with zero dependencies on desktop GUI (`PySide6`) or Windows OS APIs (`advapi32.dll`, `esbuild.exe`).
- **Bridge Interface (`src/bridge/`)**: High-level, thread-safe facade providing structured JSON/DTO inputs and outputs for Android Kotlin / Java.
- **Native Platform UI & Vault (`android/`)**: Jetpack Compose Material 3 UI with hardware-backed Android Keystore (`EncryptedSharedPreferences`).
- **Zero JS Bundling Overhead on Device**: Canonical pre-bundled worker assets are deployed directly via Cloudflare multipart MIME endpoints.

---

## 3. Directory Layout

```
BuilderV2/PYandroid/
├── ARCHITECTURE-AUDIT.md          # Comprehensive audit & Option A vs B analysis
├── DEPENDENCY-COMPATIBILITY.md    # Android standard library & 3rd-party audit
├── MIGRATION-PLAN.md              # Phased migration roadmap
├── SECURITY.md                    # Keystore security boundary & threat model
├── README.md                      # Subsystem documentation
├── luciproxy-pyandroid-debug.apk  # Assembled Android Debug APK (Phase 16)
├── src/                           # Canonical Python Business Core
│   ├── __init__.py
│   ├── core/                      # Pure Python portable core
│   │   ├── __init__.py
│   │   ├── client.py              # Cloudflare HTTP client & GraphQL analytics
│   │   ├── credentials.py         # Abstract credential store interface
│   │   ├── deployment.py          # Worker creation, in-place update & delete engine
│   │   ├── models.py              # Pure Python DTOs
│   │   └── naming.py              # Randomized neutral naming & route generator
│   └── bridge/                    # Android facade bridge
│       ├── __init__.py
│       └── interface.py           # Callable entrypoints & JSON helpers for Chaquopy
├── tests/                         # Standalone automated tests (pytest)
│   ├── __init__.py
│   ├── test_core_client.py
│   ├── test_naming_and_routing.py
│   ├── test_deployment_engine.py
│   ├── test_bridge_interface.py
│   └── test_async_and_threading.py
└── android/                       # Native Android Project (Chaquopy + Compose)
    ├── build.gradle.kts           # Root build with Chaquopy 15.0.1
    ├── settings.gradle.kts        # Repository declarations
    ├── gradlew.bat                # Gradle 8.5 wrapper
    └── app/
        ├── build.gradle.kts       # Android app config (Python 3.10, requests)
        ├── src/main/AndroidManifest.xml
        ├── src/main/java/com/luciusdevlab/luciproxy/pyandroid/
        │   ├── PyAndroidApplication.kt  # Chaquopy initialization
        │   ├── bridge/
        │   │   └── PythonBridgeClient.kt # Chaquopy JNI bridge caller
        │   ├── data/
        │   │   ├── models/Models.kt      # Strongly typed DTOs & JSON serialization
        │   │   ├── security/SecureCredentialStore.kt # Keystore EncryptedSharedPreferences
        │   │   └── storage/LocalRepository.kt        # Metadata persistence
        │   └── ui/
        │       ├── MainActivity.kt       # Activity host
        │       ├── theme/Theme.kt        # Material 3 dark theme
        │       ├── viewmodel/MainViewModel.kt # Coroutine-based viewmodel
        │       ├── screens/
        │       │   ├── HomeScreen.kt     # Account cards & overview
        │       │   └── AccountDetailsScreen.kt # Live GraphQL metrics, workers & D1s
        │       └── dialogs/
        │           ├── AddAccountDialog.kt   # Token onboarding & verification
        │           ├── CreateWorkerDialog.kt # 8-step deployment stepper & result
        │           ├── UpdateWorkerDialog.kt # In-place update preserving D1
        │           └── DeleteWorkerDialog.kt # Deletion guaranteeing D1 preservation
        └── src/test/java/com/luciusdevlab/luciproxy/pyandroid/ # Android JVM Unit Tests
            ├── ModelsTest.kt             # JSON serialization tests
            ├── LocalRepositoryTest.kt    # Rehydration and disk storage tests
            └── ViewModelTest.kt          # Lifecycle & mock bridge tests
```

---

## 4. Verification & Testing

### Python Standalone Tests (23/23 Passed)
```powershell
python -m pytest BuilderV2/PYandroid/tests -v
```

### Android JVM Unit Tests (11/11 Passed)
```powershell
cd BuilderV2/PYandroid/android
.\gradlew.bat testDebugUnitTest
```

### Build Android Debug APK
```powershell
cd BuilderV2/PYandroid/android
.\gradlew.bat assembleDebug
```
Output artifact: `BuilderV2/PYandroid/android/app/build/outputs/apk/debug/app-debug.apk` (or root `luciproxy-pyandroid-debug.apk`).
- Package Name: `com.luciusdevlab.luciproxy.pyandroid`
- Target SDK: 34 (Android 14) / Min SDK: 26 (Android 8.0)
- Python Runtime: Python 3.10 with requests 2.31.0, urllib3, certifi, idna, charset-normalizer
- Architectures: `arm64-v8a`, `x86_64`
