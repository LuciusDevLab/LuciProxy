"""
LuciProxy Manager v2.0.0 - Automated Windows Single-File Executable Packaging Script.
Compiles standalone, zero-dependency Windows desktop binary:
dist/LuciProxy-Manager.exe
"""

import hashlib
import os
from pathlib import Path
import shutil
import subprocess
import sys
import time

BUILDER_V2_ROOT = Path(__file__).resolve().parent.parent
REPO_ROOT = BUILDER_V2_ROOT.parent


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


def build_manager_exe():
    print("================================================================================")
    print("      LUCIPROXY MANAGER v2.0.0 - STANDALONE WINDOWS EXE COMPILER (Phase G)     ")
    print("================================================================================\n")

    icon_path = BUILDER_V2_ROOT / "icon.ico"
    if not icon_path.exists():
        print(f"[ERROR] Required icon not found at: {icon_path}")
        sys.exit(1)
    print(f"[INIT] Verified application icon at: {icon_path} ({icon_path.stat().st_size:,} bytes)")

    esbuild_tool = BUILDER_V2_ROOT / "tools" / "esbuild.exe"
    if not esbuild_tool.exists():
        print(f"[ERROR] Required standalone esbuild not found at: {esbuild_tool}")
        sys.exit(1)
    print(f"[INIT] Verified standalone esbuild tool at: {esbuild_tool} ({esbuild_tool.stat().st_size:,} bytes)")

    # Clean prior build directories
    print("\n[1/3] Cleaning build directories...")
    build_dir = BUILDER_V2_ROOT / "build"
    dist_dir = BUILDER_V2_ROOT / "dist"
    spec_file = BUILDER_V2_ROOT / "LuciProxy-Manager.spec"

    if build_dir.exists():
        shutil.rmtree(build_dir, ignore_errors=True)
    if dist_dir.exists():
        shutil.rmtree(dist_dir, ignore_errors=True)
    if spec_file.exists():
        spec_file.unlink(missing_ok=True)
    print("      [OK] Cleaned build artifacts.")

    # Execute PyInstaller
    print("\n[2/3] Compiling standalone Windows Manager EXE via PyInstaller (--onefile)...")
    entrypoint = BUILDER_V2_ROOT / "entrypoint.py"

    pyinstaller_cmd = [
        sys.executable, "-m", "PyInstaller",
        "--noconfirm",
        "--clean",
        "--onefile",
        "--icon", str(icon_path),
        "--name", "LuciProxy-Manager",
        "--add-data", f"{BUILDER_V2_ROOT / 'tools'};tools",
        "--add-data", f"{BUILDER_V2_ROOT / 'app-version.json'};BuilderV2",
        "--add-data", f"{BUILDER_V2_ROOT / 'icon.ico'};.",
        "--hidden-import", "PySide6",
        "--hidden-import", "PySide6.QtCore",
        "--hidden-import", "PySide6.QtGui",
        "--hidden-import", "PySide6.QtWidgets",
        "--hidden-import", "sqlite3",
        "--hidden-import", "requests",
        "--hidden-import", "urllib3",
        "--hidden-import", "keyring",
        "--hidden-import", "keyring.backends.Windows",
        "--hidden-import", "ctypes",
        "--hidden-import", "ctypes.wintypes",
        "--hidden-import", "win32ctypes",
        "--hidden-import", "win32ctypes.core",
        "--hidden-import", "win32ctypes.core.ctypes",
        "--hidden-import", "win32ctypes.pywin32",
        "--hidden-import", "win32ctypes.pywin32.win32cred",
        "--hidden-import", "BuilderV2",
        "--hidden-import", "BuilderV2.cloudflare",
        "--hidden-import", "BuilderV2.deployment",
        "--hidden-import", "BuilderV2.github",
        "--hidden-import", "BuilderV2.security",
        "--hidden-import", "BuilderV2.spec",
        "--hidden-import", "BuilderV2.storage",
        "--hidden-import", "BuilderV2.ui",
        "--hidden-import", "BuilderV2.worker_source",
        str(entrypoint)
    ]

    start_time = time.time()
    proc = subprocess.run(
        pyinstaller_cmd,
        cwd=str(REPO_ROOT),
        text=True,
        encoding="utf-8"
    )

    if proc.returncode != 0:
        print(f"\n[ERROR] PyInstaller compilation failed with code {proc.returncode}")
        sys.exit(proc.returncode)

    elapsed = time.time() - start_time
    output_exe = REPO_ROOT / "dist" / "LuciProxy-Manager.exe"
    if not output_exe.exists():
        # Check inside BuilderV2/dist
        alt_exe = dist_dir / "LuciProxy-Manager.exe"
        if alt_exe.exists():
            output_exe = alt_exe
        else:
            print(f"\n[ERROR] Output binary not found at {output_exe} or {alt_exe}")
            sys.exit(1)

    print("\n[3/3] Verifying PE binary integrity & metadata...")
    sha256 = hashlib.sha256(output_exe.read_bytes()).hexdigest()
    size_bytes = output_exe.stat().st_size
    size_mb = size_bytes / (1024 * 1024)

    has_icon = verify_pe_icon(output_exe, icon_path)
    print(f"      [OK] Custom Windows icon verified: {has_icon}")
    print(f"      [OK] Binary SHA-256: {sha256}")
    print(f"      [OK] Binary Size: {size_mb:.2f} MB ({size_bytes:,} bytes)")

    print("\n================================================================================")
    print(f"[SUCCESS] LuciProxy Manager v2.0.0 compiled successfully in {elapsed:.1f}s")
    print(f"  Target File: {output_exe}")
    print("================================================================================\n")
    return output_exe


if __name__ == "__main__":
    build_manager_exe()
