package com.luciusdevlab.luciproxy.pyandroid.data.models

import kotlinx.serialization.SerialName
import kotlinx.serialization.Serializable

@Serializable
data class ConnectionRecord(
    val connectionId: String,
    val displayName: String,
    val status: String = "active",
    val createdAt: String
)

@Serializable
data class AccountRecord(
    val accountId: String,
    val connectionId: String,
    val accountName: String,
    val displayName: String = ""
) {
    val effectiveDisplayName: String
        get() = displayName.ifBlank { accountName }
}

@Serializable
data class ManagedWorkerRecord(
    val workerId: String,
    val connectionId: String,
    val accountId: String,
    val workerName: String,
    val workerUrl: String,
    val d1BindingName: String = "IOT_DB",
    val d1DatabaseId: String,
    val d1Name: String,
    val installedWorkerVersion: String = "v1.2.1",
    val installedSourceRevision: String = "3aafad1",
    val bundleSha256: String? = null,
    val lastDeployedAt: String? = null,
    val status: String = "up_to_date",
    val apiRoute: String = "sync",
    val panelUrl: String = ""
)

@Serializable
data class AccountDto(
    val id: String,
    val name: String
)

@Serializable
data class TokenVerificationResult(
    val success: Boolean,
    val valid: Boolean = false,
    val status: String = "",
    val token_id: String? = null,
    val expires_on: String? = null,
    val error: String? = null
)

@Serializable
data class ListAccountsResult(
    val success: Boolean,
    val accounts: List<AccountDto> = emptyList(),
    val error: String? = null
)

@Serializable
data class D1BindingDto(
    val binding_name: String = "",
    val database_id: String = "",
    val database_name: String? = null
)

@Serializable
data class WorkerSummaryDto(
    val id: String = "",
    val name: String = "",
    val d1_bindings: List<D1BindingDto> = emptyList()
)

@Serializable
data class D1DatabaseDto(
    val id: String = "",
    val name: String = "",
    val num_tables: Int = 0
)

@Serializable
data class WorkerAnalyticsDto(
    val available: Boolean = false,
    val requests_num: Long? = null,
    val quota_num: Long? = null,
    val requests: String = "Unavailable",
    val quota: String = "Unavailable",
    val errors: Long = 0
)

@Serializable
data class AccountDetailsDto(
    val success: Boolean,
    val account_id: String = "",
    val analytics: WorkerAnalyticsDto? = null,
    val workers: List<WorkerSummaryDto> = emptyList(),
    val d1_linked: List<D1DatabaseDto> = emptyList(),
    val d1_unassigned: List<D1DatabaseDto> = emptyList(),
    val error: String? = null
)

@Serializable
data class DeploymentResultDto(
    val success: Boolean,
    val worker_name: String = "",
    val worker_url: String = "",
    val panel_url: String = "",
    val api_route: String = "",
    val d1_name: String = "",
    val d1_database_id: String = "",
    val uuid: String = "",
    val version: String = "v1.2.1",
    val error: String? = null
)

@Serializable
data class DeleteWorkerResultDto(
    val success: Boolean,
    val worker_name: String = "",
    val d1_preserved: Boolean = true,
    val error: String? = null
)

@Serializable
data class WorkerReleaseDto(
    val version: String = "",
    val source_revision: String? = null,
    val bundle_sha256: String? = null,
    val release_url: String? = null,
    val changelog: String? = null,
    val checked_at: String? = null
)

@Serializable
data class AppReleaseDto(
    val platform: String = "",
    val version: String = "",
    val version_code: Int? = null,
    val release_tag: String = "",
    val download_url: String? = null,
    val release_url: String? = null,
    val changelog: String? = null,
    val checked_at: String? = null
)

@Serializable
data class AppEvaluationDto(
    val installed_version: String = "",
    val available_version: String? = null,
    val status: String = "up_to_date",
    val status_label: String = "Up to date",
    val has_update: Boolean = false,
    val download_url: String? = null,
    val release_url: String? = null,
    val changelog: String? = null
)

@Serializable
data class WorkerEvaluationDto(
    val worker_name: String = "",
    val worker_id: String = "",
    val installed_version: String? = null,
    val available_version: String? = null,
    val status: String = "up_to_date",
    val status_label: String = "Up to date",
    val has_update: Boolean = false,
    val source_revision: String? = null,
    val details: String? = null
)

@Serializable
data class NotificationPayloadDto(
    val channel: String = "",
    val title: String = "",
    val body: String = "",
    val target_version: String? = null,
    val download_url: String? = null,
    val release_url: String? = null,
    val affected_workers: List<String> = emptyList()
)

@Serializable
data class CheckUpdatesResultDto(
    val success: Boolean = false,
    val error: String? = null,
    val platform: String = "android",
    val worker_release: WorkerReleaseDto? = null,
    val app_release: AppReleaseDto? = null,
    val app_evaluation: AppEvaluationDto? = null,
    val worker_evaluations: List<WorkerEvaluationDto> = emptyList(),
    val workers_needing_update_count: Int = 0,
    val worker_notification: NotificationPayloadDto? = null,
    val app_notification: NotificationPayloadDto? = null
)

fun getPanelUrl(workerDomain: String, apiRoute: String): String {
    val cleanDomain = workerDomain.trim().trimEnd('/')
        .removePrefix("https://")
        .removePrefix("http://")
    val cleanRoute = "/" + apiRoute.trim().trim('/')
    return "https://$cleanDomain$cleanRoute/dash"
}
