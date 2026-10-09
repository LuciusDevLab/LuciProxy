"""
LuciProxy Manager - Dialogs Package.
"""

from .add_account_dialog import AddAccountDialog
from .create_worker_dialog import CreateWorkerDialog
from .update_worker_dialog import UpdateWorkerDialog
from .delete_worker_dialog import DeleteWorkerDialog
from .settings_dialog import SettingsDialog
from .deployment_result_dialog import DeploymentResultDialog

__all__ = [
    "AddAccountDialog",
    "CreateWorkerDialog",
    "UpdateWorkerDialog",
    "DeleteWorkerDialog",
    "SettingsDialog",
    "DeploymentResultDialog",
]
