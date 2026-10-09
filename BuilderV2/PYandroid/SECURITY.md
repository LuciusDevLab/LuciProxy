# Security Boundary & Credential Architecture: PYandroid

**Document Version:** 1.0.0  
**Phase:** 15 Architecture Audit  
**Target:** LuciProxy Python Android Subsystem (`BuilderV2/PYandroid`)

---

## 1. Threat Model & Security Principles

The LuciProxy Manager handles sensitive Cloudflare API tokens with full administrative permissions over Workers, D1 databases, and DNS zones. The security architecture enforces the following non-negotiable principles:

1. **Zero Plaintext Persistence on Disk**: API tokens must never be written to plaintext files, SQLite tables, shared preferences, or caches.
2. **Platform-Native Cryptographic Boundaries**: Use operating system hardware-backed encryption facilities rather than software-only roll-your-own cryptography.
3. **In-Memory-Only Lifecycle**: Credentials exist only in memory for the exact duration of the network request.
4. **Zero Diagnostic Leakage**: Tokens must never appear in logs, error dialogs, command outputs, or stack traces.

---

## 2. Platform Comparison: Windows vs. Android

| Security Dimension | Windows Implementation (`BuilderV2`) | Android Implementation (`PYandroid`) |
| :--- | :--- | :--- |
| **Storage Mechanism** | Windows Credential Manager (`advapi32.dll` / `CredWriteW`) | Android Keystore + `EncryptedSharedPreferences` |
| **Hardware Backing** | TPM / Windows DPAPI | Android Keystore TEE (TrustZone) or StrongBox Keymaster |
| **Key Derivation** | User logon session SID / Windows DPAPI Master Key | AES-256-GCM master key protected by Android Keystore |
| **Access Control** | Restricted to current Windows user security identifier | Restricted to application UID via Linux sandbox boundaries |
| **SQLite Separation** | SQLite stores connection metadata only (`token=None`) | SQLite stores connection metadata only (`token=None`) |

---

## 3. Kotlin <-> Python Credential Lifecycle

```
[User Input / Import]
        │
        ▼
[Kotlin Native Layer]
  - Encrypts via MasterKey (AES-256-GCM)
  - Persists to EncryptedSharedPreferences
        │
        │ (When Network Action Initiated)
        ▼
[In-Memory Decryption]
  - Decrypts token in RAM only
        │
        ▼
[Bridge Call to Python Core]
  - Passes token string via memory pointer / JNI string
        │
        ▼
[Python Cloudflare Client]
  - Constructs `Authorization: Bearer <token>` in RAM
  - Executes TLS 1.3 HTTPS request
  - Python scope terminates -> reference garbage collected
        │
        ▼
[Result Returned to UI]
  - Structured DTO / JSON contains NO tokens
```

---

## 4. Error Sanitization & Exception Safety

- **URL Sanitization**: If a Cloudflare API call raises an exception, token query parameters or header dumps are stripped prior to raising higher-level exceptions.
- **Log Masking**: Any logging in the Python runtime or Android Logcat filters strings matching Cloudflare token patterns (`Bearer [a-zA-Z0-9_-]{40}`).
- **ZipSlip Protection**: Canonical source extraction in `WorkerSourceService` explicitly verifies that normalized archive paths do not escape the target temporary directory (`Path(dest).resolve().is_relative_to(extract_root)`).
