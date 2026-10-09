package com.luciusdevlab.luciproxy.pyandroid.bridge

import com.chaquo.python.PyObject
import com.chaquo.python.Python
import com.luciusdevlab.luciproxy.pyandroid.data.models.*
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.withContext
import kotlinx.serialization.json.Json

interface PythonBridge {
    suspend fun verifyToken(token: String): TokenVerificationResult
    suspend fun listAccounts(token: String): List<AccountDto>
    suspend fun getAccountDetails(token: String, accountId: String): AccountDetailsDto
    suspend fun deployWorker(token: String, accountId: String, workerName: String?, d1Name: String?): DeploymentResultDto
    suspend fun updateWorker(token: String, accountId: String, workerName: String): DeploymentResultDto
    suspend fun deleteWorker(token: String, accountId: String, workerName: String): DeleteWorkerResultDto
    fun generateTokenName(): String
    fun generateWorkerName(): String
    fun generateD1Name(): String
    fun generateRandomApiRoute(): String
    fun buildTokenCreationUrl(tokenName: String? = null): String
    suspend fun checkUpdates(
        platform: String = "android",
        installedAppVersion: String = "2.0.0",
        managedWorkersJson: String? = null,
        forceRemote: Boolean = false
    ): CheckUpdatesResultDto
}

class ChaquopyBridgeClient : PythonBridge {
    private val json = Json { ignoreUnknownKeys = true }

    private val bridgeClass: PyObject by lazy {
        val py = Python.getInstance()
        val module = py.getModule("bridge.interface")
        module["LuciproxyBridge"] ?: error("LuciproxyBridge class not found in bridge.interface")
    }

    override suspend fun verifyToken(token: String): TokenVerificationResult = withContext(Dispatchers.IO) {
        val jsonStr = bridgeClass.callAttr("verify_token_json", token).toString()
        json.decodeFromString(jsonStr)
    }

    override suspend fun listAccounts(token: String): List<AccountDto> = withContext(Dispatchers.IO) {
        val jsonStr = bridgeClass.callAttr("list_accounts_json", token).toString()
        val result: ListAccountsResult = json.decodeFromString(jsonStr)
        if (!result.success) {
            throw RuntimeException(result.error ?: "Failed to list accounts from Cloudflare API")
        }
        result.accounts
    }

    override suspend fun getAccountDetails(token: String, accountId: String): AccountDetailsDto = withContext(Dispatchers.IO) {
        val jsonStr = bridgeClass.callAttr("get_account_details_json", token, accountId).toString()
        json.decodeFromString(jsonStr)
    }

    override suspend fun deployWorker(
        token: String,
        accountId: String,
        workerName: String?,
        d1Name: String?
    ): DeploymentResultDto = withContext(Dispatchers.IO) {
        val jsonStr = bridgeClass.callAttr("deploy_worker_json", token, accountId, workerName, d1Name).toString()
        json.decodeFromString(jsonStr)
    }

    override suspend fun updateWorker(
        token: String,
        accountId: String,
        workerName: String
    ): DeploymentResultDto = withContext(Dispatchers.IO) {
        val jsonStr = bridgeClass.callAttr("update_worker_json", token, accountId, workerName).toString()
        json.decodeFromString(jsonStr)
    }

    override suspend fun deleteWorker(
        token: String,
        accountId: String,
        workerName: String
    ): DeleteWorkerResultDto = withContext(Dispatchers.IO) {
        val jsonStr = bridgeClass.callAttr("delete_worker_json", token, accountId, workerName).toString()
        json.decodeFromString(jsonStr)
    }

    override fun generateTokenName(): String {
        return bridgeClass.callAttr("generate_token_name").toString()
    }

    override fun generateWorkerName(): String {
        return bridgeClass.callAttr("generate_worker_name").toString()
    }

    override fun generateD1Name(): String {
        return bridgeClass.callAttr("generate_d1_name").toString()
    }

    override fun generateRandomApiRoute(): String {
        return bridgeClass.callAttr("generate_random_api_route").toString()
    }

    override fun buildTokenCreationUrl(tokenName: String?): String {
        return if (tokenName != null) {
            bridgeClass.callAttr("build_token_creation_url", tokenName).toString()
        } else {
            bridgeClass.callAttr("build_token_creation_url").toString()
        }
    }

    override suspend fun checkUpdates(
        platform: String,
        installedAppVersion: String,
        managedWorkersJson: String?,
        forceRemote: Boolean
    ): CheckUpdatesResultDto = withContext(Dispatchers.IO) {
        val jsonStr = bridgeClass.callAttr(
            "check_updates_json",
            platform,
            installedAppVersion,
            managedWorkersJson,
            forceRemote
        ).toString()
        json.decodeFromString(jsonStr)
    }
}

class MockPythonBridgeClient : PythonBridge {
    override suspend fun verifyToken(token: String): TokenVerificationResult {
        return if (token.isNotBlank()) {
            TokenVerificationResult(success = true, valid = true, status = "active", token_id = "mock_tok_123")
        } else {
            TokenVerificationResult(success = false, valid = false, status = "error", error = "Empty token")
        }
    }

    override suspend fun listAccounts(token: String): List<AccountDto> {
        return listOf(AccountDto(id = "acc_mock_001", name = "Test Account"))
    }

    override suspend fun getAccountDetails(token: String, accountId: String): AccountDetailsDto {
        return AccountDetailsDto(
            success = true,
            account_id = accountId,
            analytics = WorkerAnalyticsDto(available = true, requests_num = 450, requests = "450", quota = "Unavailable"),
            workers = emptyList(),
            d1_linked = emptyList(),
            d1_unassigned = emptyList()
        )
    }

    override suspend fun deployWorker(
        token: String,
        accountId: String,
        workerName: String?,
        d1Name: String?
    ): DeploymentResultDto {
        val name = workerName ?: "amber-cedar-1289"
        val d1 = d1Name ?: "silent-summit-7721"
        return DeploymentResultDto(
            success = true,
            worker_name = name,
            worker_url = "https://$name.sub.workers.dev",
            panel_url = "https://$name.sub.workers.dev/qrmxvnakzd/dash",
            api_route = "qrmxvnakzd",
            d1_name = d1,
            d1_database_id = "mock-d1-id",
            uuid = "mock-uuid-key",
            version = "v1.2.1"
        )
    }

    override suspend fun updateWorker(
        token: String,
        accountId: String,
        workerName: String
    ): DeploymentResultDto {
        return DeploymentResultDto(
            success = true,
            worker_name = workerName,
            worker_url = "https://$workerName.sub.workers.dev",
            panel_url = "https://$workerName.sub.workers.dev/qrmxvnakzd/dash",
            api_route = "qrmxvnakzd",
            d1_name = "preserved-d1",
            d1_database_id = "mock-d1-id",
            uuid = "mock-uuid-key",
            version = "v1.2.1"
        )
    }

    override suspend fun deleteWorker(
        token: String,
        accountId: String,
        workerName: String
    ): DeleteWorkerResultDto {
        return DeleteWorkerResultDto(
            success = true,
            worker_name = workerName,
            d1_preserved = true
        )
    }

    override fun generateTokenName(): String = "pure-wave-5534"
    override fun generateWorkerName(): String = "amber-cedar-1289"
    override fun generateD1Name(): String = "silent-summit-7721"
    override fun generateRandomApiRoute(): String = "qrmxvnakzd"

    override fun buildTokenCreationUrl(tokenName: String?): String {
        val name = tokenName ?: generateTokenName()
        val perms = "%5B%7B%22key%22%3A%22workers_scripts%22%2C%22type%22%3A%22edit%22%7D%2C%7B%22key%22%3A%22d1%22%2C%22type%22%3A%22edit%22%7D%2C%7B%22key%22%3A%22account_settings%22%2C%22type%22%3A%22read%22%7D%5D"
        return "https://dash.cloudflare.com/profile/api-tokens?permissionGroupKeys=$perms&accountId=%2A&zoneId=all&name=$name"
    }

    override suspend fun checkUpdates(
        platform: String,
        installedAppVersion: String,
        managedWorkersJson: String?,
        forceRemote: Boolean
    ): CheckUpdatesResultDto {
        return CheckUpdatesResultDto(
            success = true,
            platform = platform,
            worker_release = WorkerReleaseDto(
                version = "1.2.1",
                source_revision = "3aafad12745c59a849610d603fc22b22f656ac36",
                bundle_sha256 = "06fefda1c8ccac907f690bf549fcfcf1138b827b4ae0abed6e31496a07026cef"
            ),
            app_release = AppReleaseDto(
                platform = platform,
                version = "2.0.0",
                release_tag = "manager-v2.0.0"
            ),
            app_evaluation = AppEvaluationDto(
                installed_version = installedAppVersion,
                available_version = "2.0.0",
                status = "up_to_date",
                status_label = "Up to date",
                has_update = false
            ),
            worker_evaluations = emptyList(),
            workers_needing_update_count = 0
        )
    }
}

