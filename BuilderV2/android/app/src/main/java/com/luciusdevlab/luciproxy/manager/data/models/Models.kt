package com.luciusdevlab.luciproxy.manager.data.models

import kotlinx.serialization.SerialName
import kotlinx.serialization.Serializable
import java.io.File

@Serializable
data class WorkerVersionSignal(
    val version: String,
    @SerialName("source_revision") val sourceRevision: String,
    @SerialName("repo_url") val repoUrl: String? = null,
    @SerialName("release_url") val releaseUrl: String? = null,
    val changelog: String? = null,
    @SerialName("released_at") val releasedAt: String? = null
)

data class WorkerSourceSnapshot(
    val revision: String,
    val sourceDir: File,
    val fileCount: Int,
    val isValid: Boolean,
    val validationErrors: List<String> = emptyList()
)

data class DeploymentPackage(
    val version: String,
    val sourceRevision: String,
    val mainModule: String = "index.js",
    val bundleCode: String,
    val bundleSha256: String,
    val compatibilityDate: String = "2026-10-01",
    val compatibilityFlags: List<String> = listOf("nodejs_compat"),
    val d1BindingName: String = "IOT_DB",
    val metadata: Map<String, Any> = emptyMap()
)

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
    val accountName: String
)

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
    val installedWorkerVersion: String,
    val installedSourceRevision: String,
    val status: String = "up_to_date"
)

@Serializable
data class D1DatabaseDto(
    val uuid: String,
    val name: String,
    val version: String? = null,
    @SerialName("num_tables") val numTables: Int = 0
)

@Serializable
data class WorkerSummaryDto(
    val id: String,
    val etag: String? = null,
    @SerialName("modified_on") val modifiedOn: String? = null
)

@Serializable
data class D1BindingDto(
    val name: String,
    @SerialName("database_id") val databaseId: String
)

data class DeploymentResult(
    val success: Boolean,
    val action: String, // "create" or "update"
    val workerName: String,
    val workerUrl: String,
    val d1DatabaseId: String,
    val d1BindingName: String,
    val workerVersion: String,
    val sourceRevision: String,
    val masterKey: String? = null,
    val error: String? = null
)
