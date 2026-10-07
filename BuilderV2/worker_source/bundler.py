"""
LuciProxy Manager - Embedded Standalone Worker Bundler.
Compiles LuciProxy ES-module Worker bundle from source using embedded standalone tooling.
Requires ZERO host runtime dependencies: NO Node.js, NO npm, NO Wrangler, NO Git.
Seamlessly falls back to pre-bundled dist/index.js if standalone binary execution is unavailable.
"""

import hashlib
import os
from pathlib import Path
import subprocess
import sys
from typing import Optional, Tuple

BUILDER_V2_ROOT = Path(__file__).resolve().parent.parent
REPO_ROOT = BUILDER_V2_ROOT.parent


class WorkerBundler:
    """Manages compilation of the LuciProxy Worker bundle using embedded tooling."""

    def __init__(self, custom_esbuild_path: Optional[Path] = None):
        self._custom_esbuild = Path(custom_esbuild_path).resolve() if custom_esbuild_path else None

    @property
    def is_packaged(self) -> bool:
        return bool(getattr(sys, "frozen", False) and hasattr(sys, "_MEIPASS"))

    def get_esbuild_path(self) -> Optional[Path]:
        """Resolves the standalone esbuild executable."""
        if self._custom_esbuild and self._custom_esbuild.exists():
            return self._custom_esbuild

        if self.is_packaged:
            meipass = Path(sys._MEIPASS)
            candidates = [
                meipass / "assets" / "tools" / "esbuild.exe",
                meipass / "tools" / "esbuild.exe",
                meipass / "src" / "assets" / "tools" / "esbuild.exe",
            ]
            for c in candidates:
                if c.exists():
                    return c

        candidates = [
            BUILDER_V2_ROOT / "tools" / "esbuild.exe",
            REPO_ROOT / "Builder" / "src" / "assets" / "tools" / "esbuild.exe",
        ]
        for c in candidates:
            if c.exists():
                return c

        return None

    def bundle_worker(
        self,
        source_dir: Path,
        output_file: Optional[Path] = None
    ) -> Tuple[str, str]:
        """
        Compiles the production Worker bundle from the given LuciProxy source tree.
        Entrypoint: <source_dir>/src/index.js
        Output: ES module code string and its SHA-256 hex digest.
        """
        source_path = Path(source_dir)
        entry_point = source_path / "src" / "index.js"
        if not entry_point.exists():
            raise FileNotFoundError(f"Worker entry point not found at '{entry_point}'.")

        esbuild_exe = self.get_esbuild_path()
        out_content = ""

        # Attempt build via embedded standalone esbuild
        if esbuild_exe and esbuild_exe.exists():
            # Run esbuild relative to source_path.parent (e.g. LuciProxy/src/index.js)
            # This guarantees deterministic module header comments across all hosts and directory paths.
            cwd_path = source_path.parent
            rel_entry = f"{source_path.name}/src/index.js"
            cmd = [
                str(esbuild_exe),
                rel_entry,
                "--bundle",
                "--format=esm",
                "--platform=neutral",
                "--target=es2022"
            ]
            try:
                proc = subprocess.run(
                    cmd,
                    cwd=str(cwd_path),
                    stdout=subprocess.PIPE,
                    stderr=subprocess.PIPE,
                    text=True,
                    encoding="utf-8",
                    check=True,
                    creationflags=subprocess.CREATE_NO_WINDOW if sys.platform == "win32" else 0
                )
                out_content = proc.stdout
            except Exception:
                # If binary execution failed, fall back to pre-bundled file
                out_content = ""

        # Fallback to pre-bundled dist/index.js from the source tree if available
        if not out_content:
            dist_index = source_path / "dist" / "index.js"
            if dist_index.exists():
                out_content = dist_index.read_text(encoding="utf-8")
            else:
                raise RuntimeError(
                    f"Failed to compile Worker: esbuild tool failed and pre-bundled dist/index.js not found in {source_dir}"
                )

        if output_file:
            out_path = Path(output_file)
            out_path.parent.mkdir(parents=True, exist_ok=True)
            out_path.write_text(out_content, encoding="utf-8")

        sha256 = hashlib.sha256(out_content.encode("utf-8")).hexdigest().lower()
        return out_content, sha256
