import hashlib
import json
from pathlib import Path
import sys

BUILDER_ROOT = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(BUILDER_ROOT))

from src.deployment.worker_bundler import WorkerBundler

def update_bundle():
    wb = WorkerBundler()
    luciproxy_dir = BUILDER_ROOT.parent / "LuciProxy"
    dist_worker = luciproxy_dir / "dist" / "index.js"
    builder_worker = BUILDER_ROOT / "src" / "assets" / "worker_bundle.js"
    manifest_file = BUILDER_ROOT / "src" / "assets" / "manifest.json"

    print("Bundling Worker with standalone esbuild...")
    code, sha256 = wb.bundle_worker(luciproxy_dir, output_file=dist_worker)

    # Also write to builder assets
    builder_worker.write_text(code, encoding="utf-8")
    print(f"Bundled successfully. Output size: {len(code):,} chars, SHA-256: {sha256}")

    # Update manifest.json
    manifest_data = json.loads(manifest_file.read_text(encoding="utf-8"))
    manifest_data["artifact_sha256"] = sha256
    manifest_file.write_text(json.dumps(manifest_data, indent=2) + "\n", encoding="utf-8")
    print(f"Updated manifest.json with SHA-256: {sha256}")

if __name__ == "__main__":
    update_bundle()
