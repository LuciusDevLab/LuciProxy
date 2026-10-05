"""
LuciProxy Builder - Security & Credential Isolation Regression Suite
Verifies that:
1. Missing CF_TOKEN halts immediately with AuthenticationError.
2. No transcript files, chat logs, system logs, or historical artifacts are ever accessed.
3. No fallback credential recovery is attempted.
4. Empty or whitespace-only tokens are rejected cleanly.
5. Entire source tree contains zero references to transcript scraping or historical credential extraction.
"""

import builtins
import os
import subprocess
import sys
from pathlib import Path
import pytest

from src.cloudflare.exceptions import AuthenticationError
from src.utils.credentials import get_runtime_token


class TestCredentialIsolationSecurity:
    """Test suite ensuring strict security boundaries around credential handling."""

    def test_missing_token_halts_with_clear_error(self, monkeypatch):
        """When CF_TOKEN is not in environment, get_runtime_token must raise AuthenticationError immediately."""
        monkeypatch.delenv("CF_TOKEN", raising=False)
        monkeypatch.delenv("CLOUDFLARE_API_TOKEN", raising=False)

        with pytest.raises(AuthenticationError) as exc_info:
            get_runtime_token()

        assert "not set in environment" in str(exc_info.value)
        assert exc_info.value.step == "Runtime Credential Resolution"

    def test_whitespace_token_halts_with_clear_error(self, monkeypatch):
        """Whitespace-only or blank token must raise AuthenticationError immediately."""
        monkeypatch.setenv("CF_TOKEN", "   \r\n\t   ")
        monkeypatch.delenv("CLOUDFLARE_API_TOKEN", raising=False)

        with pytest.raises(AuthenticationError) as exc_info:
            get_runtime_token()

        assert "not set in environment" in str(exc_info.value) or "empty" in str(exc_info.value)

    def test_missing_token_never_reads_transcript_or_history(self, monkeypatch):
        """
        Verify that when credentials are missing, no transcript, log, or history file is ever
        opened or probed for fallback credentials.
        """
        monkeypatch.delenv("CF_TOKEN", raising=False)
        monkeypatch.delenv("CLOUDFLARE_API_TOKEN", raising=False)

        opened_paths = []
        original_open = builtins.open

        def spy_open(file, *args, **kwargs):
            opened_paths.append(str(file))
            return original_open(file, *args, **kwargs)

        monkeypatch.setattr(builtins, "open", spy_open)

        with pytest.raises(AuthenticationError):
            get_runtime_token()

        # Verify that absolutely no files related to transcripts or logs were touched
        for path_str in opened_paths:
            lower = path_str.lower()
            assert "transcript" not in lower, f"Security Violation: Accessed transcript file {path_str}"
            assert ".system_generated" not in lower, f"Security Violation: Accessed system_generated {path_str}"
            assert ".jsonl" not in lower, f"Security Violation: Accessed jsonl file {path_str}"

    def test_valid_token_resolves_without_file_io(self, monkeypatch):
        """Valid environment token resolves cleanly with zero file I/O."""
        monkeypatch.setenv("CF_TOKEN", "valid_mock_token_abcdef123456")
        monkeypatch.delenv("CLOUDFLARE_API_TOKEN", raising=False)

        opened_paths = []
        original_open = builtins.open

        def spy_open(file, *args, **kwargs):
            opened_paths.append(str(file))
            return original_open(file, *args, **kwargs)

        monkeypatch.setattr(builtins, "open", spy_open)

        token = get_runtime_token()
        assert token == "valid_mock_token_abcdef123456"
        assert len(opened_paths) == 0, "No file I/O should occur during runtime token retrieval."

    def test_alternative_env_var_fallback(self, monkeypatch):
        """CLOUDFLARE_API_TOKEN is accepted when CF_TOKEN is unset, without file I/O."""
        monkeypatch.delenv("CF_TOKEN", raising=False)
        monkeypatch.setenv("CLOUDFLARE_API_TOKEN", "alt_mock_token_789")

        token = get_runtime_token()
        assert token == "alt_mock_token_789"

    def test_source_code_contains_zero_transcript_scraping(self):
        """
        Static analysis test: Scans Builder and LuciProxy source trees to guarantee
        that no credential recovery or transcript scraping logic exists in code.
        """
        repo_root = Path(__file__).resolve().parent.parent.parent
        search_dirs = [
            repo_root / "Builder" / "src",
            repo_root / "LuciProxy" / "src"
        ]

        forbidden_patterns = [
            "transcript_full.jsonl",
            "transcript.jsonl",
            ".system_generated",
            "cfut_"
        ]

        violations = []
        for sdir in search_dirs:
            if not sdir.exists():
                continue
            for file_path in sdir.rglob("*.py"):
                text = file_path.read_text(encoding="utf-8", errors="ignore")
                for pat in forbidden_patterns:
                    if pat in text:
                        violations.append((file_path, pat))
            for file_path in sdir.rglob("*.js"):
                text = file_path.read_text(encoding="utf-8", errors="ignore")
                for pat in forbidden_patterns:
                    if pat in text:
                        violations.append((file_path, pat))

        assert len(violations) == 0, f"Found forbidden credential scraping patterns in source: {violations}"

    def test_runner_subprocess_halts_when_env_missing(self):
        """
        Verifies that running scratch runner scripts without CF_TOKEN halts immediately
        with exit code != 0 and clear error message on stderr.
        """
        runner_path = Path(r"C:\Users\Lucius\.gemini\antigravity\brain\3700d89e-9ca0-4cef-8556-059ef08e4d68\scratch\run_phase5b_live.py")
        if not runner_path.exists():
            pytest.skip("run_phase5b_live.py not present in scratch directory")

        # Run with an isolated environment where CF_TOKEN and CLOUDFLARE_API_TOKEN are stripped
        clean_env = {k: v for k, v in os.environ.items() if k not in ("CF_TOKEN", "CLOUDFLARE_API_TOKEN")}
        proc = subprocess.run(
            [sys.executable, str(runner_path)],
            env=clean_env,
            capture_output=True,
            text=True,
            timeout=10
        )

        assert proc.returncode != 0, f"Expected non-zero exit code when CF_TOKEN is missing, got {proc.returncode}"
        assert "CF_TOKEN" in proc.stderr or "FATAL" in proc.stderr
        assert "Security Policy" in proc.stderr
