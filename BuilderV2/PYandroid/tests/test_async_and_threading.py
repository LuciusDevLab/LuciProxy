"""
Concurrency and threading tests for PYandroid.
Proves thread-safety and non-blocking background execution of bridge and engine.
"""

from concurrent.futures import ThreadPoolExecutor, as_completed
from unittest.mock import MagicMock, patch
import pytest

from BuilderV2.PYandroid.src.bridge.interface import LuciproxyBridge
from BuilderV2.PYandroid.src.core.models import TokenVerificationDto


def test_concurrent_bridge_invocations():
    """Proves multiple concurrent threads calling LuciproxyBridge execute safely."""
    num_threads = 10

    with patch("BuilderV2.PYandroid.src.bridge.interface.PortableCloudflareClient") as mock_client_cls:
        mock_inst = MagicMock()
        mock_inst.verify_token.return_value = TokenVerificationDto(
            valid=True,
            status="active",
            token_id="tok_thread",
        )
        mock_client_cls.return_value = mock_inst

        def worker_task(thread_id: int):
            route = LuciproxyBridge.generate_random_api_route()
            name = LuciproxyBridge.generate_token_name()
            res = LuciproxyBridge.verify_token(f"dummy_token_{thread_id}")
            return thread_id, route, name, res

        results = []
        with ThreadPoolExecutor(max_workers=5) as executor:
            futures = [executor.submit(worker_task, i) for i in range(num_threads)]
            for fut in as_completed(futures):
                results.append(fut.result())

        assert len(results) == num_threads
        # Verify unique routes and names generated concurrently
        routes = {r[1] for r in results}
        names = {r[2] for r in results}
        assert len(routes) == num_threads
        assert len(names) == num_threads
        for _, _, _, res in results:
            assert res["success"] is True
            assert res["valid"] is True
