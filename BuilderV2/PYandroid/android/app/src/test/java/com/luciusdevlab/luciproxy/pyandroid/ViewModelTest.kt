package com.luciusdevlab.luciproxy.pyandroid

import com.luciusdevlab.luciproxy.pyandroid.bridge.MockPythonBridgeClient
import com.luciusdevlab.luciproxy.pyandroid.data.security.InMemoryCredentialStore
import com.luciusdevlab.luciproxy.pyandroid.data.storage.LocalRepository
import com.luciusdevlab.luciproxy.pyandroid.ui.viewmodel.MainViewModel
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.ExperimentalCoroutinesApi
import kotlinx.coroutines.test.StandardTestDispatcher
import kotlinx.coroutines.test.resetMain
import kotlinx.coroutines.test.runTest
import kotlinx.coroutines.test.setMain
import org.junit.After
import org.junit.Assert.*
import org.junit.Before
import org.junit.Rule
import org.junit.Test
import org.junit.rules.TemporaryFolder

@OptIn(ExperimentalCoroutinesApi::class)
class ViewModelTest {

    @get:Rule
    val tempFolder = TemporaryFolder()

    private val testDispatcher = StandardTestDispatcher()
    private lateinit var repo: LocalRepository
    private lateinit var credStore: InMemoryCredentialStore
    private lateinit var bridge: MockPythonBridgeClient
    private lateinit var viewModel: MainViewModel

    @Before
    fun setUp() {
        Dispatchers.setMain(testDispatcher)
        repo = LocalRepository(tempFolder.newFolder("vm_test"))
        credStore = InMemoryCredentialStore()
        bridge = MockPythonBridgeClient()
        viewModel = MainViewModel(repo, credStore, bridge)
    }

    @After
    fun tearDown() {
        Dispatchers.resetMain()
    }

    @Test
    fun testAddAccountSuccess() = runTest {
        var completed = false
        viewModel.addAccount("valid_test_token") { success ->
            completed = success
        }
        testDispatcher.scheduler.advanceUntilIdle()

        assertTrue(completed)
        assertEquals(1, viewModel.accounts.value.size)
        assertEquals(1, viewModel.connections.value.size)
        assertNotNull(viewModel.selectedAccount.value)

        val connId = viewModel.connections.value[0].connectionId
        assertTrue(credStore.hasToken(connId))
        assertEquals("valid_test_token", credStore.getToken(connId))
    }

    @Test
    fun testDeployWorkerSuccess() = runTest {
        viewModel.addAccount("valid_test_token") { }
        testDispatcher.scheduler.advanceUntilIdle()

        var deploySuccess = false
        viewModel.deployWorker("custom-worker", "custom-d1") { result ->
            deploySuccess = result.success
        }
        testDispatcher.scheduler.advanceUntilIdle()

        assertTrue(deploySuccess)
        assertNotNull(viewModel.lastDeploymentResult.value)
        assertEquals("custom-worker", viewModel.lastDeploymentResult.value?.worker_name)
    }

    @Test
    fun testUpdateWorkerSuccess() = runTest {
        viewModel.addAccount("valid_test_token") { }
        testDispatcher.scheduler.advanceUntilIdle()

        var updateSuccess = false
        viewModel.updateWorker("custom-worker") { success ->
            updateSuccess = success
        }
        testDispatcher.scheduler.advanceUntilIdle()

        assertTrue(updateSuccess)
    }

    @Test
    fun testDeleteWorkerSuccess() = runTest {
        viewModel.addAccount("valid_test_token") { }
        testDispatcher.scheduler.advanceUntilIdle()

        var deleteSuccess = false
        viewModel.deleteWorker("custom-worker") { success ->
            deleteSuccess = success
        }
        testDispatcher.scheduler.advanceUntilIdle()

        assertTrue(deleteSuccess)
    }

    @Test
    fun testRemoveAccountDeletesTokenFromKeystore() = runTest {
        viewModel.addAccount("valid_test_token") { }
        testDispatcher.scheduler.advanceUntilIdle()

        val connId = viewModel.connections.value[0].connectionId
        assertTrue(credStore.hasToken(connId))

        viewModel.removeAccount(connId)
        testDispatcher.scheduler.advanceUntilIdle()

        assertEquals(0, viewModel.accounts.value.size)
        assertEquals(0, viewModel.connections.value.size)
        assertFalse(credStore.hasToken(connId))
    }

    @Test
    fun testAddAccountWithCustomDisplayName() = runTest {
        var completed = false
        viewModel.addAccount("valid_test_token", "My Custom Office Account") { success ->
            completed = success
        }
        testDispatcher.scheduler.advanceUntilIdle()

        assertTrue(completed)
        assertEquals(1, viewModel.accounts.value.size)
        val acc = viewModel.accounts.value[0]
        assertEquals("My Custom Office Account", acc.displayName)
        assertEquals("My Custom Office Account", acc.effectiveDisplayName)
        assertEquals("Test Account", acc.accountName)
    }

    @Test
    fun testRenameAccount() = runTest {
        viewModel.addAccount("valid_test_token") { }
        testDispatcher.scheduler.advanceUntilIdle()

        val acc = viewModel.accounts.value[0]
        assertEquals("Test Account", acc.effectiveDisplayName)

        viewModel.renameAccount(acc.accountId, "Renamed Account")
        testDispatcher.scheduler.advanceUntilIdle()

        val updatedAcc = viewModel.accounts.value[0]
        assertEquals("Renamed Account", updatedAcc.displayName)
        assertEquals("Renamed Account", updatedAcc.effectiveDisplayName)
        assertEquals("Renamed Account", viewModel.selectedAccount.value?.displayName)
    }

    @Test
    fun testDeployWorkerForAccount() = runTest {
        viewModel.addAccount("valid_test_token") { }
        testDispatcher.scheduler.advanceUntilIdle()

        val targetAcc = viewModel.accounts.value[0]
        var deploySuccess = false
        viewModel.deployWorkerForAccount(targetAcc, "dedicated-worker", "dedicated-d1") { result ->
            deploySuccess = result.success
        }
        testDispatcher.scheduler.advanceUntilIdle()

        assertTrue(deploySuccess)
        assertEquals("dedicated-worker", viewModel.lastDeploymentResult.value?.worker_name)
    }

    @Test
    fun testGetTokenCreationUrl() {
        val url = viewModel.getTokenCreationUrl("custom-token-name")
        assertTrue(url.contains("dash.cloudflare.com/profile/api-tokens"))
        assertTrue(url.contains("name=custom-token-name"))
        assertTrue(url.contains("permissionGroupKeys="))
    }

    @Test
    fun testCheckForUpdatesSuccess() = runTest {
        viewModel.checkForUpdates(forceRemote = false)
        testDispatcher.scheduler.advanceUntilIdle()

        val result = viewModel.updateCheckResult.value
        assertNotNull(result)
        assertTrue(result!!.success)
        assertEquals("2.0.0", result.app_evaluation?.installed_version)
        assertEquals("up_to_date", result.app_evaluation?.status)
        assertFalse(viewModel.isCheckingUpdates.value)
    }

    @Test
    fun testDeployWorkerPersistsManagedRecord() = runTest {
        viewModel.addAccount("valid_test_token") { }
        testDispatcher.scheduler.advanceUntilIdle()

        viewModel.deployWorker("persisted-worker", "persisted-d1") { }
        testDispatcher.scheduler.advanceUntilIdle()

        val workers = repo.workers.value
        assertEquals(1, workers.size)
        val record = workers[0]
        assertEquals("persisted-worker", record.workerName)
        assertEquals("v1.2.1", record.installedWorkerVersion)
        assertNotNull(record.bundleSha256)
        assertNotNull(record.lastDeployedAt)
    }

    @Test
    fun testNotificationDeduplicationInRepository() {
        // Worker release deduplication
        assertTrue(repo.shouldNotifyWorker("1.2.2"))
        repo.markWorkerNotified("1.2.2")
        assertFalse(repo.shouldNotifyWorker("1.2.2"))
        assertTrue(repo.shouldNotifyWorker("1.2.3"))

        // App release deduplication
        assertTrue(repo.shouldNotifyApp("2.1.0"))
        repo.markAppNotified("2.1.0")
        assertFalse(repo.shouldNotifyApp("2.1.0"))
        assertTrue(repo.shouldNotifyApp("2.2.0"))
    }
}

