"""
LuciProxy Manager - PySide6 Async Worker & Threading Infrastructure.
Enforces non-blocking UI execution for Cloudflare API and GitHub network operations
using QThreadPool and Qt signals/slots.
"""

from typing import Any, Callable, Optional, Tuple, Dict
from PySide6.QtCore import QObject, QRunnable, QThreadPool, Signal, Slot

from ..cloudflare.exceptions import sanitize_message


class WorkerSignals(QObject):
    """Signals emitted by an AsyncWorker executing in a background thread."""
    started = Signal()
    result = Signal(object)
    error = Signal(str, object)  # (sanitized_error_message, exception_instance)
    finished = Signal()


_active_workers = set()


class AsyncWorker(QRunnable):
    """
    QRunnable task wrapper that executes a callable in QThreadPool
    and safely routes progress, results, and sanitized exceptions to the UI thread.
    """

    def __init__(self, fn: Callable, *args, **kwargs):
        super().__init__()
        self.fn = fn
        self.args = args
        self.kwargs = kwargs
        self.signals = WorkerSignals()
        self.setAutoDelete(True)

    def _safe_emit(self, signal, *args) -> None:
        try:
            signal.emit(*args)
        except RuntimeError:
            pass

    @Slot()
    def run(self) -> None:
        """Executes task off the UI thread and emits signals."""
        self._safe_emit(self.signals.started)
        try:
            res = self.fn(*self.args, **self.kwargs)
            self._safe_emit(self.signals.result, res)
        except Exception as e:
            sanitized_msg = sanitize_message(str(e))
            self._safe_emit(self.signals.error, sanitized_msg, e)
        finally:
            self._safe_emit(self.signals.finished)
            _active_workers.discard(self)


def run_in_background(
    fn: Callable,
    on_result: Optional[Callable[[Any], None]] = None,
    on_error: Optional[Callable[[str, Exception], None]] = None,
    on_finished: Optional[Callable[[], None]] = None,
    on_started: Optional[Callable[[], None]] = None,
    thread_pool: Optional[QThreadPool] = None,
    *args,
    **kwargs
) -> AsyncWorker:
    """
    Convenience helper to dispatch a function to QThreadPool with signal callbacks.
    Guarantees that network latency never freezes the PySide6 UI event loop.
    """
    worker = AsyncWorker(fn, *args, **kwargs)
    _active_workers.add(worker)
    if on_started:
        worker.signals.started.connect(on_started)
    if on_result:
        worker.signals.result.connect(on_result)
    if on_error:
        worker.signals.error.connect(on_error)
    if on_finished:
        worker.signals.finished.connect(on_finished)

    pool = thread_pool or QThreadPool.globalInstance()
    pool.start(worker)
    return worker
