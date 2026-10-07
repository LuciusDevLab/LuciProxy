package com.luciusdevlab.luciproxy.manager.data.storage

import com.luciusdevlab.luciproxy.manager.data.models.AccountRecord
import com.luciusdevlab.luciproxy.manager.data.models.ConnectionRecord
import com.luciusdevlab.luciproxy.manager.data.models.ManagedWorkerRecord
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow

class LocalRepository {
    private val _connections = MutableStateFlow<List<ConnectionRecord>>(emptyList())
    val connections: StateFlow<List<ConnectionRecord>> = _connections.asStateFlow()

    private val _accounts = MutableStateFlow<List<AccountRecord>>(emptyList())
    val accounts: StateFlow<List<AccountRecord>> = _accounts.asStateFlow()

    private val _workers = MutableStateFlow<List<ManagedWorkerRecord>>(emptyList())
    val workers: StateFlow<List<ManagedWorkerRecord>> = _workers.asStateFlow()

    fun saveConnection(connection: ConnectionRecord) {
        _connections.value = _connections.value.filter { it.connectionId != connection.connectionId } + connection
    }

    fun saveAccount(account: AccountRecord) {
        _accounts.value = _accounts.value.filter { it.accountId != account.accountId } + account
    }

    fun saveWorker(worker: ManagedWorkerRecord) {
        _workers.value = _workers.value.filter { it.workerId != worker.workerId } + worker
    }

    fun removeConnection(connectionId: String) {
        _connections.value = _connections.value.filter { it.connectionId != connectionId }
        _accounts.value = _accounts.value.filter { it.connectionId != connectionId }
        _workers.value = _workers.value.filter { it.connectionId != connectionId }
    }

    fun clearAll() {
        _connections.value = emptyList()
        _accounts.value = emptyList()
        _workers.value = emptyList()
    }
}
