"""
LuciProxy Builder - Icon Configuration and PE Resource Tests
Verifies that icon.ico exists, is valid ICO format, and is properly validated by the build script.
"""

from pathlib import Path
import struct
import sys
import tempfile
import pytest

BUILDER_ROOT = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(BUILDER_ROOT))

from scripts.build_standalone_exe import verify_pe_icon


def test_icon_file_exists_and_is_valid():
    """Verify that icon.ico exists in Builder root and has valid ICO binary header."""
    icon_path = BUILDER_ROOT / "icon.ico"
    assert icon_path.exists(), f"icon.ico must exist at {icon_path}"
    assert icon_path.is_file()
    assert icon_path.stat().st_size > 0

    with open(icon_path, "rb") as f:
        header = f.read(6)

    assert len(header) == 6
    reserved, ico_type, count = struct.unpack("<HHH", header)
    assert reserved == 0, "ICO reserved field must be 0"
    assert ico_type == 1, "ICO type field must be 1 (icon)"
    assert count == 6, f"Expected 6 icon images in icon.ico, got {count}"


def test_verify_pe_icon_helper_on_invalid_files():
    """Verify that verify_pe_icon handles invalid or missing files gracefully."""
    with tempfile.TemporaryDirectory() as tmpdir:
        dummy_exe = Path(tmpdir) / "dummy.exe"
        dummy_ico = Path(tmpdir) / "dummy.ico"
        dummy_exe.write_bytes(b"not a pe file")
        dummy_ico.write_bytes(b"\x00\x00\x01\x00\x01\x00")

        # Invalid PE file should return False without crashing
        assert verify_pe_icon(dummy_exe, dummy_ico) is False

        # Non-existent files should return False
        assert verify_pe_icon(Path(tmpdir) / "nonexistent.exe", dummy_ico) is False


def test_build_script_resolves_icon_from_builder_root(monkeypatch):
    """Verify that BUILDER_ROOT / 'icon.ico' does not rely on current working directory."""
    import scripts.build_standalone_exe as bse
    assert bse.BUILDER_ROOT == BUILDER_ROOT
    assert (bse.BUILDER_ROOT / "icon.ico").resolve() == (BUILDER_ROOT / "icon.ico").resolve()
