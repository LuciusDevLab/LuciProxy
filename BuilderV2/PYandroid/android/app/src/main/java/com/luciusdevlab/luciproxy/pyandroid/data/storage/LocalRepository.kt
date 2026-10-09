package com.luciusdevlab.luciproxy.pyandroid.data.storage

import com.luciusdevlab.luciproxy.pyandroid.data.models.AccountRecord
import com.luciusdevlab.luciproxy.pyandroid.data.models.ConnectionRecord
import com.luciusdevlab.luciproxy.pyandroid.data.models.ManagedWorkerRecord
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.serialization.Serializable
import kotlinx.serialization.encodeToString
import kotlinx.serialization.json.Json
import java.io.File

@Serializable
data class LocalDatabaseState(
    val connections: List<ConnectionRecord> = emptyList(),
    val accounts: List<AccountRecord> = emptyList(),
    val workers: List<ManagedWorkerRecord> = emptyList(),
    val lastNotifiedWorkerVersion: String? = null,
    val lastNotifiedAppVersion: String? = null
)

class LocalRepository(private val storageDir: File? = null) {
    private val json = Json { ignoreUnknownKeys = true; prettyPrint = true }
    private val stateFile: File? = storageDir?.let { File(it, "luciproxy_records.json") }

    private val _connections = MutableStateFlow<List<ConnectionRecord>>(emptyList())
    val connections: StateFlow<List<ConnectionRecord>> = _connections.asStateFlow()

    private val _accounts = MutableStateFlow<List<AccountRecord>>(emptyList())
    val accounts: StateFlow<List<AccountRecord>> = _accounts.asStateFlow()

    private val _workers = MutableStateFlow<List<ManagedWorkerRecord>>(emptyList())
    val workers: StateFlow<List<ManagedWorkerRecord>> = _workers.asStateFlow()

    private val _lastNotifiedWorkerVersion = MutableStateFlow<String?>(null)
    val lastNotifiedWorkerVersion: StateFlow<String?> = _lastNotifiedWorkerVersion.asStateFlow()

    private val _lastNotifiedAppVersion = MutableStateFlow<String?>(null)
    val lastNotifiedAppVersion: StateFlow<String?> = _lastNotifiedAppVersion.asStateFlow()

    init {
        loadFromDisk()
    }

    @Synchronized
    fun reload() {
        loadFromDisk()
    }

    @Synchronized
    private fun loadFromDisk() {
        if (stateFile != null && stateFile.exists()) {
            try {
                val content = stateFile.readText(Charsets.UTF_8)
                if (content.isNotBlank()) {
                    val state = json.decodeFromString<LocalDatabaseState>(content)
                    _connections.value = state.connections
                    _accounts.value = state.accounts
                    _workers.value = state.workers
                    _lastNotifiedWorkerVersion.value = state.lastNotifiedWorkerVersion
                    _lastNotifiedAppVersion.value = state.lastNotifiedAppVersion
                }
            } catch (_: Exception) {
                // Safeguard against malformed JSON or corrupted storage
            }
        }
    }

    @Synchronized
    private fun persistToDisk() {
        if (stateFile != null) {
            try {
                val state = LocalDatabaseState(
                    connections = _connections.value,
                    accounts = _accounts.value,
                    workers = _workers.value,
                    lastNotifiedWorkerVersion = _lastNotifiedWorkerVersion.value,
                    lastNotifiedAppVersion = _lastNotifiedAppVersion.value
                )
                val serialized = json.encodeToString(state)
                val parent = stateFile.parentFile
                if (parent != null && !parent.exists()) {
                    parent.mkdirs()
                }
                val tempFile = File(parent, "${stateFile.name}.tmp")
                tempFile.writeText(serialized, Charsets.UTF_8)
                if (!tempFile.renameTo(stateFile)) {
                    stateFile.writeText(serialized, Charsets.UTF_8)
                    tempFile.delete()
                }
            } catch (_: Exception) {
                // Guard against filesystem errors
            }
        }
    }

    @Synchronized
    fun saveConnection(connection: ConnectionRecord) {
        _connections.value = _connections.value.filter { it.connectionId != connection.connectionId } + connection
        persistToDisk()
    }

    @Synchronized
    fun saveAccount(account: AccountRecord) {
        _accounts.value = _accounts.value.filter { it.accountId != account.accountId } + account
        persistToDisk()
    }

    @Synchronized
    fun updateAccountDisplayName(accountId: String, newDisplayName: String) {
        val clean = newDisplayName.trim()
        _accounts.value = _accounts.value.map {
            if (it.accountId == accountId) {
                it.copy(displayName = clean)
            } else {
                it
            }
        }
        persistToDisk()
    }

    @Synchronized
    fun saveWorker(worker: ManagedWorkerRecord) {
        _workers.value = _workers.value.filter { it.workerId != worker.workerId } + worker
        persistToDisk()
    }

    @Synchronized
    fun removeWorker(workerId: String) {
        _workers.value = _workers.value.filter { it.workerId != workerId }
        persistToDisk()
    }

    @Synchronized
    fun removeConnection(connectionId: String) {
        _connections.value = _connections.value.filter { it.connectionId != connectionId }
        _accounts.value = _accounts.value.filter { it.connectionId != connectionId }
        _workers.value = _workers.value.filter { it.connectionId != connectionId }
        persistToDisk()
    }

    @Synchronized
    fun shouldNotifyWorker(latestVersion: String): Boolean {
        if (latestVersion.isBlank()) return false
        return _lastNotifiedWorkerVersion.value != latestVersion
    }

    @Synchronized
    fun markWorkerNotified(latestVersion: String) {
        _lastNotifiedWorkerVersion.value = latestVersion
        persistToDisk()
    }

    @Synchronized
    fun shouldNotifyApp(latestVersion: String): Boolean {
        if (latestVersion.isBlank()) return false
        return _lastNotifiedAppVersion.value != latestVersion
    }

    @Synchronized
    fun markAppNotified(latestVersion: String) {
        _lastNotifiedAppVersion.value = latestVersion
        persistToDisk()
    }

    @Synchronized
    fun clearAll() {
        _connections.value = emptyList()
        _accounts.value = emptyList()
        _workers.value = emptyList()
        persistToDisk()
    }
}
