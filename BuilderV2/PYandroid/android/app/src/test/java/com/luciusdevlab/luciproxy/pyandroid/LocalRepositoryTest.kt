package com.luciusdevlab.luciproxy.pyandroid

import com.luciusdevlab.luciproxy.pyandroid.data.models.AccountRecord
import com.luciusdevlab.luciproxy.pyandroid.data.models.ConnectionRecord
import com.luciusdevlab.luciproxy.pyandroid.data.models.ManagedWorkerRecord
import com.luciusdevlab.luciproxy.pyandroid.data.storage.LocalRepository
import org.junit.Assert.*
import org.junit.Rule
import org.junit.Test
import org.junit.rules.TemporaryFolder

class LocalRepositoryTest {

    @get:Rule
    val tempFolder = TemporaryFolder()

    @Test
    fun testPersistenceAndRehydration() {
        val folder = tempFolder.newFolder("storage_test")
        val repo1 = LocalRepository(folder)

        val conn = ConnectionRecord("conn_1", "Test Connection", "active", "2026-10-09T00:00:00Z")
        val acc = AccountRecord("acc_1", "conn_1", "Personal Acc")
        val worker = ManagedWorkerRecord(
            workerId = "w_1",
            connectionId = "conn_1",
            accountId = "acc_1",
            workerName = "test-worker",
            workerUrl = "https://test-worker.workers.dev",
            d1DatabaseId = "d1_id_123",
            d1Name = "d1-test"
        )

        repo1.saveConnection(conn)
        repo1.saveAccount(acc)
        repo1.saveWorker(worker)

        assertEquals(1, repo1.connections.value.size)
        assertEquals(1, repo1.accounts.value.size)
        assertEquals(1, repo1.workers.value.size)

        // Simulate app restart by initializing a new repository from same directory
        val repo2 = LocalRepository(folder)
        assertEquals(1, repo2.connections.value.size)
        assertEquals("conn_1", repo2.connections.value[0].connectionId)
        assertEquals(1, repo2.accounts.value.size)
        assertEquals("acc_1", repo2.accounts.value[0].accountId)
        assertEquals(1, repo2.workers.value.size)
        assertEquals("w_1", repo2.workers.value[0].workerId)

        // Remove worker
        repo2.removeWorker("w_1")
        assertEquals(0, repo2.workers.value.size)

        // Reload to verify change persisted
        val repo3 = LocalRepository(folder)
        assertEquals(0, repo3.workers.value.size)

        // Test display name update & persistence
        val initialAcc = repo3.accounts.value[0]
        assertEquals("", initialAcc.displayName)
        assertEquals("Personal Acc", initialAcc.effectiveDisplayName)

        repo3.updateAccountDisplayName(initialAcc.accountId, "My Primary CF")
        assertEquals("My Primary CF", repo3.accounts.value[0].displayName)
        assertEquals("My Primary CF", repo3.accounts.value[0].effectiveDisplayName)

        // Re-read from disk to ensure persistence
        val repo4 = LocalRepository(folder)
        assertEquals("My Primary CF", repo4.accounts.value[0].displayName)
        assertEquals("My Primary CF", repo4.accounts.value[0].effectiveDisplayName)
        assertEquals("Personal Acc", repo4.accounts.value[0].accountName)
    }
}
