"""
LuciProxy Builder - Embedded Standalone Worker Bundler
Compiles LuciProxy ES-module Worker bundle using the embedded standalone esbuild binary.
Requires ZERO host runtime dependencies: NO Node.js, NO npm, NO Wrangler, NO Git.
Seamlessly falls back to pre-bundled dist/index.js if binary execution is restricted.
"""

import hashlib
import os
from pathlib import Path
import subprocess
import sys
import tempfile
from typing import Optional, Tuple

BUILDER_ROOT = Path(__file__).resolve().parent.parent.parent
EMBEDDED_ESBUILD_REL_PATH = Path("src") / "assets" / "tools" / "esbuild.exe"


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

        candidate = BUILDER_ROOT / EMBEDDED_ESBUILD_REL_PATH
        if candidate.exists():
            return candidate

        return None

    def bundle_worker(
        self,
        source_dir: Path,
        output_file: Optional[Path] = None
    ) -> Tuple[str, str]:
        """
        Compiles the production Worker bundle from the given LuciProxy source tree.
        Entrypoint: <source_dir>/src/index.js
        Output: ES module string and its SHA-256 hex digest.
        """
        entry_point = source_dir / "src" / "index.js"
        if not entry_point.exists():
            raise FileNotFoundError(f"Worker entry point not found at '{entry_point}'.")

        esbuild_exe = self.get_esbuild_path()
        out_content = ""

        # Attempt build via embedded standalone esbuild
        if esbuild_exe and esbuild_exe.exists():
            cmd = [
                str(esbuild_exe),
                str(entry_point),
                "--bundle",
                "--format=esm",
                "--platform=neutral",
                "--target=es2022"
            ]
            try:
                proc = subprocess.run(
                    cmd,
                    stdout=subprocess.PIPE,
                    stderr=subprocess.PIPE,
                    text=True,
                    encoding="utf-8",
                    check=True,
                    creationflags=subprocess.CREATE_NO_WINDOW if sys.platform == "win32" else 0
                )
                out_content = proc.stdout
            except Exception as e:
                # If binary execution failed, fall back to pre-bundled file
                pass

        # Fallback to pre-bundled dist/index.js from the source tree
        if not out_content:
            dist_index = source_dir / "dist" / "index.js"
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
