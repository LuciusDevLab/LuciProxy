"""
LuciProxy Manager - Cryptographic Integrity Verification Engine.
Computes and verifies SHA-256 hashes against official manifest declarations
and GitHub asset digests. Aborts immediately on any mismatch.
"""

import hashlib
import re
from typing import Optional

from .exceptions import IntegrityVerificationError
from .models import IntegrityResultDto


class IntegrityVerifier:
    """
    Cryptographic SHA-256 integrity verifier.
    Ensures zero tampered or corrupted bundles are deployed or installed.
    """

    @staticmethod
    def compute_sha256(content: bytes) -> str:
        """Computes lowercase hex SHA-256 digest of binary content."""
        if not isinstance(content, (bytes, bytearray)):
            raise TypeError("Content must be bytes or bytearray")
        return hashlib.sha256(content).hexdigest().lower()

    @staticmethod
    def normalize_hash(raw_hash: str) -> str:
        """Extracts standard 64-character hex string from sha256:... prefixes or dirty inputs."""
        cleaned = str(raw_hash or "").strip().lower()
        if cleaned.startswith("sha256:"):
            cleaned = cleaned[7:].strip()
        m = re.search(r"[a-f0-9]{64}", cleaned)
        if m:
            return m.group(0)
        return cleaned

    @classmethod
    def check(
        cls,
        content: bytes,
        expected_sha256: str,
        artifact_name: str = "artifact",
        github_digest: Optional[str] = None
    ) -> IntegrityResultDto:
        """
        Non-raising integrity check.
        Returns IntegrityResultDto with valid flag and hash comparisons.
        """
        actual_hash = cls.compute_sha256(content)
        expected_norm = cls.normalize_hash(expected_sha256)

        if not expected_norm:
            return IntegrityResultDto(
                is_valid=False,
                expected_sha256="",
                actual_sha256=actual_hash,
                artifact_name=artifact_name,
                error_message="Expected SHA-256 is missing or empty"
            )

        if actual_hash != expected_norm:
            return IntegrityResultDto(
                is_valid=False,
                expected_sha256=expected_norm,
                actual_sha256=actual_hash,
                artifact_name=artifact_name,
                error_message=f"SHA-256 mismatch: expected {expected_norm}, computed {actual_hash}"
            )

        # Optional GitHub asset digest validation
        if github_digest:
            gh_norm = cls.normalize_hash(github_digest)
            if gh_norm and gh_norm != actual_hash:
                return IntegrityResultDto(
                    is_valid=False,
                    expected_sha256=expected_norm,
                    actual_sha256=actual_hash,
                    artifact_name=artifact_name,
                    error_message=f"GitHub asset digest mismatch: expected {gh_norm}, computed {actual_hash}"
                )

        return IntegrityResultDto(
            is_valid=True,
            expected_sha256=expected_norm,
            actual_sha256=actual_hash,
            artifact_name=artifact_name,
            error_message=None
        )

    @classmethod
    def verify(
        cls,
        content: bytes,
        expected_sha256: str,
        artifact_name: str = "artifact",
        github_digest: Optional[str] = None,
        step: str = "Integrity Verification"
    ) -> IntegrityResultDto:
        """
        Enforcing verification method.
        Raises IntegrityVerificationError and aborts if hashes do not match.
        """
        result = cls.check(
            content=content,
            expected_sha256=expected_sha256,
            artifact_name=artifact_name,
            github_digest=github_digest
        )
        if not result.is_valid:
            raise IntegrityVerificationError(
                message=f"Security Abort: {result.error_message}",
                expected_sha256=result.expected_sha256,
                actual_sha256=result.actual_sha256,
                artifact_name=artifact_name,
                step=step
            )
        return result
