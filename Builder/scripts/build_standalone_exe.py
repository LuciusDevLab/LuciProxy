"""
LuciProxy Builder - Automated Single-File PyInstaller Packaging Script
Performs pre-build snapshotting, embeds the complete recursive LuciProxy source tree,
embeds the standalone Worker build tooling, and compiles the single-file executable:
dist/LuciProxy-Builder.exe
"""

import json
from pathlib import Path
import shutil
import subprocess
import sys
import time

BUILDER_ROOT = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(BUILDER_ROOT))

from src.deployment.source_tree import SourceTreeManager
from src.deployment.worker_bundler import WorkerBundler


def verify_pe_icon(exe_path: Path, expected_icon_path: Path) -> bool:
    """Verifies that the compiled PE executable contains the custom Windows icon."""
    try:
        import struct
        with open(expected_icon_path, "rb") as f:
            ico_header = f.read(6)
        if len(ico_header) < 6:
            return False
        _, _, expected_count = struct.unpack("<HHH", ico_header)

        import pefile
        pe = pefile.PE(str(exe_path), fast_load=False)
        has_icon = False
        has_group = False
        embedded_count = None

        if hasattr(pe, "DIRECTORY_ENTRY_RESOURCE"):
            for entry in pe.DIRECTORY_ENTRY_RESOURCE.entries:
                if entry.id == 3:  # RT_ICON
                    has_icon = True
                elif entry.id == 14:  # RT_GROUP_ICON
                    has_group = True
                    for name_entry in entry.directory.entries:
                        for lang_entry in name_entry.directory.entries:
                            res_data = pe.get_data(
                                lang_entry.data.struct.OffsetToData,
                                lang_entry.data.struct.Size
                            )
                            if len(res_data) >= 6:
                                _, _, embedded_count = struct.unpack("<HHH", res_data[:6])
        pe.close()
        return has_group and has_icon and (embedded_count == expected_count)
    except Exception as e:
        print(f"      [WARNING] PE icon verification warning: {e}")
        return False


def build_exe():
    print("================================================================================")
    print("        LUCIPROXY BUILDER - STANDALONE SINGLE-FILE EXE COMPILER (Phase 4)       ")
    print("================================================================================\n")

    # Verify custom Windows icon
    icon_path = BUILDER_ROOT / "icon.ico"
    if not icon_path.exists() or not icon_path.is_file():
        print(f"[ERROR] Required application icon not found at: {icon_path}")
        sys.exit(1)
    print(f"[INIT] Verified custom application icon at: {icon_path} ({icon_path.stat().st_size:,} bytes)")

    # 0. Pre-build: Compile authoritative Worker bundle & update manifest
    print("[0/4] Compiling authoritative Worker bundle & updating manifest...")
    wb = WorkerBundler()
    luciproxy_dir = BUILDER_ROOT.parent / "LuciProxy"
    dist_worker = luciproxy_dir / "dist" / "index.js"
    builder_worker = BUILDER_ROOT / "src" / "assets" / "worker_bundle.js"
    manifest_file = BUILDER_ROOT / "src" / "assets" / "manifest.json"

    code, sha256 = wb.bundle_worker(luciproxy_dir, output_file=dist_worker)
    builder_worker.write_text(code, encoding="utf-8")
    manifest_data = json.loads(manifest_file.read_text(encoding="utf-8"))
    manifest_data["luciproxy_version"] = "1.2.0"
    manifest_data["builder_version"] = "1.2.0"
    manifest_data["artifact_sha256"] = sha256
    manifest_file.write_text(json.dumps(manifest_data, indent=2) + "\n", encoding="utf-8")
    print(f"      [OK] Worker bundle compiled ({len(code):,} chars, SHA-256: {sha256[:16]}...).")

    # 1. Source Snapshot from authoritative sibling ../LuciProxy
    print("\n[1/4] Snapshotting authoritative sibling repository '../LuciProxy'...")
    stm = SourceTreeManager()
    dev_dir = stm.get_development_source_dir()

    if not dev_dir or not dev_dir.exists():
        print(f"[ERROR] Development source directory not found at: {dev_dir}")
        sys.exit(1)

    manifest = stm.create_snapshot()
    print(f"      [OK] Snapshotted {manifest.total_files} files ({manifest.total_bytes:,} bytes).")
    print(f"      [OK] Composite Tree SHA-256: {manifest.tree_sha256}")

    # Verify snapshot
    valid, errors = stm.verify_snapshot_integrity(
        tree_dir=stm.get_embedded_payload_dir(),
        manifest=manifest
    )
    if not valid:
        print(f"[ERROR] Snapshot integrity verification failed: {errors}")
        sys.exit(1)
    print("      [OK] Embedded snapshot verified authentic against manifest.")

    # 2. Verify Standalone Worker Bundler Tool
    print("\n[2/4] Verifying embedded Worker build tooling (esbuild)...")
    wb = WorkerBundler()
    esbuild_path = wb.get_esbuild_path()
    if not esbuild_path or not esbuild_path.exists():
        print("[ERROR] Embedded esbuild executable not found in src/assets/tools/esbuild.exe.")
        sys.exit(1)
    print(f"      [OK] Found standalone bundler ({esbuild_path.stat().st_size:,} bytes).")

    # 3. Clean prior build artifacts
    print("\n[3/4] Cleaning previous PyInstaller build cache...")
    build_dir = BUILDER_ROOT / "build"
    dist_dir = BUILDER_ROOT / "dist"
    spec_file = BUILDER_ROOT / "LuciProxy-Builder.spec"

    if build_dir.exists():
        shutil.rmtree(build_dir, ignore_errors=True)
    if dist_dir.exists():
        shutil.rmtree(dist_dir, ignore_errors=True)
    if spec_file.exists():
        spec_file.unlink(missing_ok=True)
    print("      [OK] Cleaned build directories.")

    # 4. Execute PyInstaller --onefile
    print("\n[4/4] Executing PyInstaller compilation (--onefile)...")
    entrypoint = BUILDER_ROOT / "entrypoint.py"

    pyinstaller_cmd = [
        sys.executable, "-m", "PyInstaller",
        "--noconfirm",
        "--clean",
        "--onefile",
        "--icon", str(icon_path),
        "--name", "LuciProxy-Builder",
        "--add-data", f"{BUILDER_ROOT / 'src' / 'assets'};src/assets",
        "--add-data", f"{BUILDER_ROOT / 'src' / 'assets'};assets",
        "--hidden-import", "PySide6",
        "--hidden-import", "PySide6.QtCore",
        "--hidden-import", "PySide6.QtGui",
        "--hidden-import", "PySide6.QtWidgets",
        "--hidden-import", "keyring.backends.Windows",
        "--hidden-import", "requests",
        "--hidden-import", "urllib3",
        str(entrypoint)
    ]

    print("      Command:", " ".join(pyinstaller_cmd[:8]), "... [add-data flags]")
    start_time = time.time()

    proc = subprocess.run(
        pyinstaller_cmd,
        cwd=str(BUILDER_ROOT),
        text=True,
        encoding="utf-8"
    )

    if proc.returncode != 0:
        print(f"\n[ERROR] PyInstaller compilation failed with code {proc.returncode}")
        sys.exit(proc.returncode)

    elapsed = time.time() - start_time
    output_exe = dist_dir / "LuciProxy-Builder.exe"

    if not output_exe.exists():
        print(f"\n[ERROR] Output executable not found at: {output_exe}")
        sys.exit(1)

    print("      Verifying embedded PE icon resource table...")
    if verify_pe_icon(output_exe, icon_path):
        print("      [OK] Verified custom Windows icon embedded in PE resource table (RT_GROUP_ICON).")
    else:
        print("      [ERROR] Custom icon verification failed in compiled binary.")
        sys.exit(1)

    exe_size_mb = output_exe.stat().st_size / (1024 * 1024)
    print("\n================================================================================")
    print(f"[OK] COMPILATION SUCCESSFUL in {elapsed:.1f}s")
    print(f"  Target Binary: {output_exe}")
    print(f"  Binary Size:   {exe_size_mb:.2f} MB ({output_exe.stat().st_size:,} bytes)")
    print("================================================================================\n")
    return output_exe


if __name__ == "__main__":
    build_exe()
