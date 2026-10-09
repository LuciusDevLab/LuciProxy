package com.luciusdevlab.luciproxy.pyandroid.ui.viewmodel

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.luciusdevlab.luciproxy.pyandroid.bridge.PythonBridge
import com.luciusdevlab.luciproxy.pyandroid.data.models.*
import com.luciusdevlab.luciproxy.pyandroid.data.security.SecureCredentialStore
import com.luciusdevlab.luciproxy.pyandroid.data.storage.LocalRepository
import com.luciusdevlab.luciproxy.pyandroid.ui.notifications.NotificationHelper
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.launch
import kotlinx.serialization.encodeToString
import kotlinx.serialization.json.Json
import java.text.SimpleDateFormat
import java.util.*

class MainViewModel(
    private val localRepository: LocalRepository,
    private val credentialStore: SecureCredentialStore,
    private val bridge: PythonBridge,
    private val notificationHelper: NotificationHelper? = null
) : ViewModel() {

    val connections: StateFlow<List<ConnectionRecord>> = localRepository.connections
    val accounts: StateFlow<List<AccountRecord>> = localRepository.accounts
    val workers: StateFlow<List<ManagedWorkerRecord>> = localRepository.workers

    private val _selectedAccount = MutableStateFlow<AccountRecord?>(null)
    val selectedAccount: StateFlow<AccountRecord?> = _selectedAccount.asStateFlow()

    private val _accountDetails = MutableStateFlow<AccountDetailsDto?>(null)
    val accountDetails: StateFlow<AccountDetailsDto?> = _accountDetails.asStateFlow()

    private val _isLoading = MutableStateFlow(false)
    val isLoading: StateFlow<Boolean> = _isLoading.asStateFlow()

    private val _isRefreshing = MutableStateFlow(false)
    val isRefreshing: StateFlow<Boolean> = _isRefreshing.asStateFlow()

    private val _statusMessage = MutableStateFlow<String?>(null)
    val statusMessage: StateFlow<String?> = _statusMessage.asStateFlow()

    private val _errorMessage = MutableStateFlow<String?>(null)
    val errorMessage: StateFlow<String?> = _errorMessage.asStateFlow()

    // Stepper & deployment state
    private val _isDeploying = MutableStateFlow(false)
    val isDeploying: StateFlow<Boolean> = _isDeploying.asStateFlow()

    private val _deployStep = MutableStateFlow(1)
    val deployStep: StateFlow<Int> = _deployStep.asStateFlow()

    private val _deployStage = MutableStateFlow("")
    val deployStage: StateFlow<String> = _deployStage.asStateFlow()

    private val _deployDetail = MutableStateFlow("")
    val deployDetail: StateFlow<String> = _deployDetail.asStateFlow()

    private val _lastDeploymentResult = MutableStateFlow<DeploymentResultDto?>(null)
    val lastDeploymentResult: StateFlow<DeploymentResultDto?> = _lastDeploymentResult.asStateFlow()

    // Update checking state
    private val _updateCheckResult = MutableStateFlow<CheckUpdatesResultDto?>(null)
    val updateCheckResult: StateFlow<CheckUpdatesResultDto?> = _updateCheckResult.asStateFlow()

    private val _isCheckingUpdates = MutableStateFlow(false)
    val isCheckingUpdates: StateFlow<Boolean> = _isCheckingUpdates.asStateFlow()

    init {
        // Auto-select first account if available
        viewModelScope.launch {
            accounts.collect { accList ->
                if (_selectedAccount.value == null && accList.isNotEmpty()) {
                    selectAccount(accList.first())
                }
            }
        }
        // Check for updates on startup
        checkForUpdates(forceRemote = false)
    }

    fun clearMessages() {
        _errorMessage.value = null
        _statusMessage.value = null
    }

    fun selectAccount(account: AccountRecord) {
        _selectedAccount.value = account
        fetchAccountDetails(account)
    }

    fun refreshCurrentAccount() {
        val current = _selectedAccount.value ?: return
        fetchAccountDetails(current, isRefresh = true)
    }

    private fun fetchAccountDetails(account: AccountRecord, isRefresh: Boolean = false) {
        viewModelScope.launch {
            if (isRefresh) _isRefreshing.value = true else _isLoading.value = true
            try {
                val token = credentialStore.getToken(account.connectionId)
                if (token == null) {
                    _errorMessage.value = "No token available for connection '${account.connectionId}'."
                    _accountDetails.value = null
                    return@launch
                }

                val details = bridge.getAccountDetails(token, account.accountId)
                if (details.success) {
                    _accountDetails.value = details
                } else {
                    _errorMessage.value = details.error ?: "Failed to fetch account details."
                }
            } catch (e: Exception) {
                _errorMessage.value = "Error loading account details: ${e.message}"
            } finally {
                _isLoading.value = false
                _isRefreshing.value = false
            }
        }
    }

    fun renameAccount(accountId: String, newDisplayName: String) {
        viewModelScope.launch {
            val cleanName = newDisplayName.trim()
            if (cleanName.isBlank()) return@launch
            localRepository.updateAccountDisplayName(accountId, cleanName)
            if (_selectedAccount.value?.accountId == accountId) {
                _selectedAccount.value = _selectedAccount.value?.copy(displayName = cleanName)
            }
            _statusMessage.value = "Account display name updated."
        }
    }

    fun addAccount(token: String, customDisplayName: String = "", onComplete: (Boolean) -> Unit) {
        viewModelScope.launch {
            _isLoading.value = true
            try {
                val cleanToken = token.trim()
                val verifyRes = bridge.verifyToken(cleanToken)
                if (!verifyRes.success || !verifyRes.valid) {
                    _errorMessage.value = verifyRes.error ?: "API Token verification failed or token is invalid."
                    onComplete(false)
                    return@launch
                }

                val cfAccounts = bridge.listAccounts(cleanToken)
                if (cfAccounts.isEmpty()) {
                    _errorMessage.value = "No accessible Cloudflare accounts found for this token."
                    onComplete(false)
                    return@launch
                }

                val connId = "conn_" + UUID.randomUUID().toString().replace("-", "").take(12)
                val tokenDisplayName = bridge.generateTokenName()
                val preferredName = customDisplayName.trim()
                val now = SimpleDateFormat("yyyy-MM-dd'T'HH:mm:ss'Z'", Locale.US).apply {
                    timeZone = TimeZone.getTimeZone("UTC")
                }.format(Date())

                // 1. Save token in Keystore
                credentialStore.saveToken(connId, cleanToken)

                // 2. Save connection in local repo
                localRepository.saveConnection(
                    ConnectionRecord(
                        connectionId = connId,
                        displayName = tokenDisplayName,
                        status = "active",
                        createdAt = now
                    )
                )

                // 3. Save accounts in local repo
                cfAccounts.forEachIndexed { index, acc ->
                    val accDisplay = if (preferredName.isNotBlank()) {
                        if (cfAccounts.size == 1) preferredName else "$preferredName (${acc.name})"
                    } else {
                        acc.name
                    }
                    localRepository.saveAccount(
                        AccountRecord(
                            accountId = acc.id,
                            connectionId = connId,
                            accountName = acc.name,
                            displayName = accDisplay
                        )
                    )
                }

                // Select first added account
                val firstAcc = AccountRecord(
                    accountId = cfAccounts.first().id,
                    connectionId = connId,
                    accountName = cfAccounts.first().name,
                    displayName = if (preferredName.isNotBlank()) preferredName else cfAccounts.first().name
                )
                selectAccount(firstAcc)

                _statusMessage.value = "Account connected successfully: ${firstAcc.effectiveDisplayName}"
                onComplete(true)
            } catch (e: Exception) {
                _errorMessage.value = "Failed to connect account: ${e.message}"
                onComplete(false)
            } finally {
                _isLoading.value = false
            }
        }
    }

    fun deployWorker(
        workerName: String? = null,
        d1Name: String? = null,
        onComplete: (DeploymentResultDto) -> Unit
    ) {
        val currentAcc = _selectedAccount.value ?: return
        deployWorkerForAccount(currentAcc, workerName, d1Name, onComplete)
    }

    fun deployWorkerForAccount(
        account: AccountRecord,
        workerName: String? = null,
        d1Name: String? = null,
        onComplete: (DeploymentResultDto) -> Unit
    ) {
        viewModelScope.launch {
            _selectedAccount.value = account
            _lastDeploymentResult.value = null
            _isDeploying.value = true
            _deployStep.value = 1
            _deployStage.value = "Generating Identity"
            _deployDetail.value = "Resolving neutral names and randomized API route..."
            try {
                val token = credentialStore.getToken(account.connectionId)
                if (token == null) {
                    val err = DeploymentResultDto(
                        success = false,
                        error = "No active credentials for connection '${account.connectionId}'."
                    )
                    _deployStage.value = "Failed"
                    _deployDetail.value = err.error ?: "Credential error"
                    _lastDeploymentResult.value = err
                    onComplete(err)
                    return@launch
                }

                _deployStep.value = 3
                _deployStage.value = "Provisioning Resources"
                _deployDetail.value = "Creating dedicated D1 database and configuring bindings..."

                val result = bridge.deployWorker(
                    token = token,
                    accountId = account.accountId,
                    workerName = workerName,
                    d1Name = d1Name
                )

                _lastDeploymentResult.value = result

                if (result.success) {
                    _deployStep.value = 8
                    _deployStage.value = "Completed"
                    _deployDetail.value = "Worker deployed and workers.dev subdomain activated."
                    _statusMessage.value = "Worker '${result.worker_name}' deployed successfully!"

                    val now = SimpleDateFormat("yyyy-MM-dd'T'HH:mm:ss'Z'", Locale.US).apply {
                        timeZone = TimeZone.getTimeZone("UTC")
                    }.format(Date())

                    val workerRecord = ManagedWorkerRecord(
                        workerId = "${account.accountId}:${result.worker_name}",
                        connectionId = account.connectionId,
                        accountId = account.accountId,
                        workerName = result.worker_name,
                        workerUrl = result.worker_url,
                        d1BindingName = "IOT_DB",
                        d1DatabaseId = result.d1_database_id,
                        d1Name = result.d1_name,
                        installedWorkerVersion = result.version.ifBlank { "v1.2.1" },
                        installedSourceRevision = "3aafad12745c59a849610d603fc22b22f656ac36",
                        bundleSha256 = "06fefda1c8ccac907f690bf549fcfcf1138b827b4ae0abed6e31496a07026cef",
                        lastDeployedAt = now,
                        status = "up_to_date",
                        apiRoute = result.api_route,
                        panelUrl = result.panel_url
                    )
                    localRepository.saveWorker(workerRecord)
                    refreshCurrentAccount()
                } else {
                    _deployStage.value = "Deployment Failed"
                    _deployDetail.value = result.error ?: "Unknown error"
                    _errorMessage.value = result.error ?: "Deployment failed."
                }
                onComplete(result)
            } catch (e: Exception) {
                val err = DeploymentResultDto(success = false, error = e.message)
                _deployStage.value = "Deployment Failed"
                _deployDetail.value = e.message ?: "Exception occurred"
                _lastDeploymentResult.value = err
                _errorMessage.value = e.message
                onComplete(err)
            } finally {
                _isDeploying.value = false
            }
        }
    }

    fun updateWorker(workerName: String, onComplete: (Boolean) -> Unit) {
        val currentAcc = _selectedAccount.value ?: return
        viewModelScope.launch {
            _isLoading.value = true
            try {
                val token = credentialStore.getToken(currentAcc.connectionId)
                if (token == null) {
                    _errorMessage.value = "No credentials found for connection."
                    onComplete(false)
                    return@launch
                }

                val result = bridge.updateWorker(
                    token = token,
                    accountId = currentAcc.accountId,
                    workerName = workerName
                )

                if (result.success) {
                    _statusMessage.value = "Worker '${workerName}' updated in-place. D1 database preserved."

                    val now = SimpleDateFormat("yyyy-MM-dd'T'HH:mm:ss'Z'", Locale.US).apply {
                        timeZone = TimeZone.getTimeZone("UTC")
                    }.format(Date())

                    val existing = localRepository.workers.value.find {
                        it.accountId == currentAcc.accountId && it.workerName == workerName
                    }
                    val updatedRecord = ManagedWorkerRecord(
                        workerId = existing?.workerId ?: "${currentAcc.accountId}:$workerName",
                        connectionId = currentAcc.connectionId,
                        accountId = currentAcc.accountId,
                        workerName = workerName,
                        workerUrl = result.worker_url.ifBlank { existing?.workerUrl ?: "" },
                        d1BindingName = existing?.d1BindingName ?: "IOT_DB",
                        d1DatabaseId = result.d1_database_id.ifBlank { existing?.d1DatabaseId ?: "" },
                        d1Name = result.d1_name.ifBlank { existing?.d1Name ?: "" },
                        installedWorkerVersion = result.version.ifBlank { "v1.2.1" },
                        installedSourceRevision = "3aafad12745c59a849610d603fc22b22f656ac36",
                        bundleSha256 = "06fefda1c8ccac907f690bf549fcfcf1138b827b4ae0abed6e31496a07026cef",
                        lastDeployedAt = now,
                        status = "up_to_date",
                        apiRoute = result.api_route.ifBlank { existing?.apiRoute ?: "" },
                        panelUrl = result.panel_url.ifBlank { existing?.panelUrl ?: "" }
                    )
                    localRepository.saveWorker(updatedRecord)

                    refreshCurrentAccount()
                    onComplete(true)
                } else {
                    _errorMessage.value = result.error ?: "Failed to update worker."
                    onComplete(false)
                }
            } catch (e: Exception) {
                _errorMessage.value = "Update error: ${e.message}"
                onComplete(false)
            } finally {
                _isLoading.value = false
            }
        }
    }

    fun deleteWorker(workerName: String, onComplete: (Boolean) -> Unit) {
        val currentAcc = _selectedAccount.value ?: return
        viewModelScope.launch {
            _isLoading.value = true
            try {
                val token = credentialStore.getToken(currentAcc.connectionId)
                if (token == null) {
                    _errorMessage.value = "No credentials found for connection."
                    onComplete(false)
                    return@launch
                }

                val result = bridge.deleteWorker(
                    token = token,
                    accountId = currentAcc.accountId,
                    workerName = workerName
                )

                if (result.success) {
                    _statusMessage.value = "Worker script '${workerName}' deleted. D1 database preserved intact."
                    localRepository.removeWorker("${currentAcc.accountId}:$workerName")
                    refreshCurrentAccount()
                    onComplete(true)
                } else {
                    _errorMessage.value = result.error ?: "Failed to delete worker."
                    onComplete(false)
                }
            } catch (e: Exception) {
                _errorMessage.value = "Delete error: ${e.message}"
                onComplete(false)
            } finally {
                _isLoading.value = false
            }
        }
    }

    fun removeAccount(connectionId: String) {
        viewModelScope.launch {
            credentialStore.deleteToken(connectionId)
            localRepository.removeConnection(connectionId)
            if (_selectedAccount.value?.connectionId == connectionId) {
                val remaining = accounts.value.filter { it.connectionId != connectionId }
                _selectedAccount.value = remaining.firstOrNull()
                _accountDetails.value = null
                if (remaining.isNotEmpty()) {
                    fetchAccountDetails(remaining.first())
                }
            }
            _statusMessage.value = "Account removed and token deleted from Keystore."
        }
    }

    fun getSuggestedWorkerName(): String = bridge.generateWorkerName()
    fun getSuggestedD1Name(): String = bridge.generateD1Name()
    fun getSuggestedTokenName(): String = bridge.generateTokenName()
    fun getTokenCreationUrl(tokenName: String? = null): String = bridge.buildTokenCreationUrl(tokenName)

    fun checkForUpdates(forceRemote: Boolean = false) {
        viewModelScope.launch {
            _isCheckingUpdates.value = true
            try {
                val workersJson = try {
                    val currentWorkers = localRepository.workers.value
                    if (currentWorkers.isNotEmpty()) {
                        Json.encodeToString(currentWorkers)
                    } else null
                } catch (_: Exception) {
                    null
                }

                val res = bridge.checkUpdates(
                    platform = "android",
                    installedAppVersion = "2.0.0",
                    managedWorkersJson = workersJson,
                    forceRemote = forceRemote
                )
                _updateCheckResult.value = res

                // Deduplicate and fire OS notifications
                if (res.success) {
                    val targetWorkerVer = res.worker_release?.version ?: ""
                    if (res.workers_needing_update_count > 0 && targetWorkerVer.isNotBlank()) {
                        if (localRepository.shouldNotifyWorker(targetWorkerVer)) {
                            val firstWrk = res.worker_evaluations.find { it.has_update }?.worker_name
                            val notified = notificationHelper?.notifyWorkerUpdate(
                                latestVersion = targetWorkerVer,
                                affectedCount = res.workers_needing_update_count,
                                workerName = firstWrk
                            ) ?: false
                            if (notified) {
                                localRepository.markWorkerNotified(targetWorkerVer)
                            }
                        }
                    }

                    val appEval = res.app_evaluation
                    val targetAppVer = appEval?.available_version ?: ""
                    if (appEval != null && appEval.has_update && targetAppVer.isNotBlank()) {
                        if (localRepository.shouldNotifyApp(targetAppVer)) {
                            val notified = notificationHelper?.notifyAppUpdate(
                                latestVersion = targetAppVer,
                                changelog = appEval.changelog
                            ) ?: false
                            if (notified) {
                                localRepository.markAppNotified(targetAppVer)
                            }
                        }
                    }
                }
            } catch (e: Exception) {
                _updateCheckResult.value = CheckUpdatesResultDto(
                    success = false,
                    error = e.message ?: "Failed to check updates"
                )
            } finally {
                _isCheckingUpdates.value = false
            }
        }
    }
}
