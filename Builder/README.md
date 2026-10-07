# LuciProxy Builder

**LuciProxy Builder** is a native, cross-platform Python CLI deployment and management wizard for **LuciProxy**.

The LuciProxy Builder is completely implemented in pure Python 3 with hardened secret management (via Windows Credential Manager / OS keyring), native Cloudflare D1 Relational SQLite provisioning, multi-account handling, and automated post-deployment health validation.

---

## Key Capabilities

- **Zero-Secret Storage on Disk**: API tokens are stored in the OS-backed secure credential store (Windows Vault via `keyring`). No plaintext tokens on disk and zero token injection into Worker JavaScript bundles.
- **D1 Relational SQLite Automation**: Automatically provisions Cloudflare D1 databases (`IOT_DB`), manages schemas, and configures bindings.
- **Multi-Account Manager**: Seamlessly switch between multiple Cloudflare accounts without re-authenticating.
- **Idempotent Deployment & Update**: Intelligently detects existing resources, reuses D1 instances, and avoids name collisions.
- **Simulation Mode (`--dry-run`)**: Preview planned Cloudflare actions and resource allocations without making changes.
- **Automated Health Verification**: Tests Worker reachability, dashboard access, subscription generation, and D1 database query health post-deployment.

---

## Minimum Cloudflare Token Permissions

To deploy and manage LuciProxy, create an API Token with the following minimum permissions:

| Permission Group | Scope | Access Level | Purpose |
| :--- | :--- | :--- | :--- |
| `Account.Workers Scripts` | Account | Edit | Deploy and update Worker script |
| `Account.D1` | Account | Edit | Create database and run migrations |
| `User.User Details` | User | Read | Verify token and read account email |
| `Account.Workers KV Storage`| Account | Edit | Optional (if KV compatibility adapter enabled) |
| `Zone.DNS` | Zone (All) | Edit | Optional (if custom CNAME is provisioned) |

---

## Installation & Requirements

- **Python Version**: Python 3.9+ (Python 3.10+ recommended)
- **Node.js**: Node 18+ (for `npx wrangler`)

```powershell
cd "L:\My projects\Luci-Proxy\Builder"
pip install -r requirements.txt
```

---

## Usage

### 1. Interactive Wizard
Launch the interactive CLI menu:
```powershell
python -m src.main
```

### 2. Dry-Run Simulation
Preview planned actions against the active Cloudflare account without modifying any resources:
```powershell
python -m src.main --dry-run
```

### 3. Non-Interactive Deployment
Deploy automatically using the active account:
```powershell
python -m src.main --deploy -y
```

### 4. Non-Interactive Update
Redeploy and update an existing installation:
```powershell
python -m src.main --update -y
```

### 5. Custom Worker and Database Names
```powershell
python -m src.main --deploy --name my-proxy --d1 my-proxy-db -y
```

---

## Testing

Run the automated test suite (17 tests, 100% mockable, zero network dependency):
```powershell
python -m pytest
```


---

## Security Model

1. **Token In-Memory Isolation**: Tokens are retrieved on-demand from OS Credential Manager and passed only to isolated subprocesses (`os.environ`) during deployment.
2. **Sanitized Logs**: All console messages and exceptions pass through regex sanitizers to mask Authorization headers and tokens.
3. **No Bundle Injection**: LuciProxy runtime configurations remain separated from deployment credentials.

---

## License

GNU General Public License v3.0 (GPL-3.0). See [LICENSE-NOTES.md](../docs/LICENSE-NOTES.md).
