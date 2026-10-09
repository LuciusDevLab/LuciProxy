package com.luciusdevlab.luciproxy.pyandroid.ui

import android.Manifest
import android.content.pm.PackageManager
import android.os.Build
import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.activity.result.contract.ActivityResultContracts
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.padding
import androidx.compose.material3.Scaffold
import androidx.compose.material3.SnackbarHost
import androidx.compose.material3.SnackbarHostState
import androidx.compose.runtime.*
import androidx.compose.ui.Modifier
import androidx.core.content.ContextCompat
import androidx.lifecycle.ViewModel
import androidx.lifecycle.ViewModelProvider
import androidx.lifecycle.compose.collectAsStateWithLifecycle
import com.luciusdevlab.luciproxy.pyandroid.PyAndroidApplication
import com.luciusdevlab.luciproxy.pyandroid.data.models.AccountRecord
import com.luciusdevlab.luciproxy.pyandroid.ui.dialogs.*
import com.luciusdevlab.luciproxy.pyandroid.ui.notifications.NotificationHelper
import com.luciusdevlab.luciproxy.pyandroid.ui.screens.AccountDetailsScreen
import com.luciusdevlab.luciproxy.pyandroid.ui.screens.HomeScreen
import com.luciusdevlab.luciproxy.pyandroid.ui.theme.PyAndroidTheme
import com.luciusdevlab.luciproxy.pyandroid.ui.viewmodel.MainViewModel

class MainActivity : ComponentActivity() {

    private val notificationHelper by lazy { NotificationHelper(applicationContext) }

    private val requestPermissionLauncher = registerForActivityResult(
        ActivityResultContracts.RequestPermission()
    ) { _ ->
        // In-app notifications and checks proceed regardless of permission outcome
    }

    private val viewModel: MainViewModel by lazy {
        val app = application as PyAndroidApplication
        val factory = object : ViewModelProvider.Factory {
            @Suppress("UNCHECKED_CAST")
            override fun <T : ViewModel> create(modelClass: Class<T>): T {
                return MainViewModel(
                    localRepository = app.localRepository,
                    credentialStore = app.credentialStore,
                    bridge = app.pythonBridge,
                    notificationHelper = notificationHelper
                ) as T
            }
        }
        ViewModelProvider(this, factory)[MainViewModel::class.java]
    }

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)

        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.TIRAMISU) {
            if (ContextCompat.checkSelfPermission(this, Manifest.permission.POST_NOTIFICATIONS) != PackageManager.PERMISSION_GRANTED) {
                requestPermissionLauncher.launch(Manifest.permission.POST_NOTIFICATIONS)
            }
        }

        setContent {
            PyAndroidTheme {
                MainAppContent(viewModel = viewModel)
            }
        }
    }

    override fun onResume() {
        super.onResume()
        viewModel.checkForUpdates(forceRemote = false)
    }
}

@Composable
fun MainAppContent(viewModel: MainViewModel) {
    val accounts by viewModel.accounts.collectAsStateWithLifecycle()
    val selectedAccount by viewModel.selectedAccount.collectAsStateWithLifecycle()
    val accountDetails by viewModel.accountDetails.collectAsStateWithLifecycle()
    val isLoading by viewModel.isLoading.collectAsStateWithLifecycle()
    val isRefreshing by viewModel.isRefreshing.collectAsStateWithLifecycle()
    val statusMessage by viewModel.statusMessage.collectAsStateWithLifecycle()
    val errorMessage by viewModel.errorMessage.collectAsStateWithLifecycle()

    val workers by viewModel.workers.collectAsStateWithLifecycle()
    val updateCheckResult by viewModel.updateCheckResult.collectAsStateWithLifecycle()
    val isCheckingUpdates by viewModel.isCheckingUpdates.collectAsStateWithLifecycle()

    val isDeploying by viewModel.isDeploying.collectAsStateWithLifecycle()
    val deployStep by viewModel.deployStep.collectAsStateWithLifecycle()
    val deployStage by viewModel.deployStage.collectAsStateWithLifecycle()
    val deployDetail by viewModel.deployDetail.collectAsStateWithLifecycle()
    val lastDeploymentResult by viewModel.lastDeploymentResult.collectAsStateWithLifecycle()

    var currentScreen by remember { mutableStateOf("home") }

    // Dialog visibility states
    var showAddAccountDialog by remember { mutableStateOf(false) }
    var showCreateWorkerDialog by remember { mutableStateOf(false) }
    var showSelectAccountDialog by remember { mutableStateOf(false) }
    var accountToRename by remember { mutableStateOf<AccountRecord?>(null) }
    var targetAccountForDeploy by remember { mutableStateOf<AccountRecord?>(null) }
    var workerToUpdate by remember { mutableStateOf<String?>(null) }
    var workerToDelete by remember { mutableStateOf<String?>(null) }

    val snackbarHostState = remember { SnackbarHostState() }

    // Handle messages in Snackbar
    LaunchedEffect(statusMessage) {
        statusMessage?.let {
            snackbarHostState.showSnackbar(it)
            viewModel.clearMessages()
        }
    }

    LaunchedEffect(errorMessage) {
        errorMessage?.let {
            snackbarHostState.showSnackbar("Error: $it")
            viewModel.clearMessages()
        }
    }

    Scaffold(
        snackbarHost = { SnackbarHost(snackbarHostState) },
        modifier = Modifier.fillMaxSize()
    ) { innerPadding ->
        Box(
            modifier = Modifier
                .fillMaxSize()
                .padding(innerPadding)
        ) {
            when (currentScreen) {
                "home" -> {
                    HomeScreen(
                        accounts = accounts,
                        updateCheckResult = updateCheckResult,
                        isCheckingUpdates = isCheckingUpdates,
                        onRefreshUpdatesClick = { viewModel.checkForUpdates(forceRemote = true) },
                        onSelectAccount = { account ->
                            viewModel.selectAccount(account)
                            currentScreen = "details"
                        },
                        onAddAccountClick = { showAddAccountDialog = true },
                        onCreateWorkerClick = {
                            when {
                                accounts.isEmpty() -> {
                                    showAddAccountDialog = true
                                }
                                accounts.size == 1 -> {
                                    val onlyAcc = accounts.first()
                                    targetAccountForDeploy = onlyAcc
                                    viewModel.selectAccount(onlyAcc)
                                    showCreateWorkerDialog = true
                                }
                                else -> {
                                    showSelectAccountDialog = true
                                }
                            }
                        },
                        onRenameAccountClick = { acc ->
                            accountToRename = acc
                        },
                        onRemoveAccountClick = { connId ->
                            viewModel.removeAccount(connId)
                        }
                    )
                }

                "details" -> {
                    selectedAccount?.let { acc ->
                        AccountDetailsScreen(
                            account = acc,
                            details = accountDetails,
                            managedWorkers = workers,
                            updateCheckResult = updateCheckResult,
                            isLoading = isLoading,
                            isRefreshing = isRefreshing,
                            onBackClick = { currentScreen = "home" },
                            onRefreshClick = { viewModel.refreshCurrentAccount() },
                            onDeployWorkerClick = {
                                targetAccountForDeploy = acc
                                showCreateWorkerDialog = true
                            },
                            onRenameClick = {
                                accountToRename = acc
                            },
                            onUpdateWorkerClick = { workerName -> workerToUpdate = workerName },
                            onDeleteWorkerClick = { workerName -> workerToDelete = workerName }
                        )
                    } ?: run {
                        currentScreen = "home"
                    }
                }
            }

            // Dialogs
            if (showAddAccountDialog) {
                AddAccountDialog(
                    suggestedTokenName = viewModel.getSuggestedTokenName(),
                    tokenCreationUrl = viewModel.getTokenCreationUrl(),
                    isLoading = isLoading,
                    errorMessage = errorMessage,
                    onDismiss = { showAddAccountDialog = false },
                    onConfirm = { token, customDisplayName ->
                        viewModel.addAccount(token, customDisplayName) { success ->
                            if (success) {
                                showAddAccountDialog = false
                                currentScreen = "details"
                            }
                        }
                    }
                )
            }

            if (showSelectAccountDialog) {
                SelectAccountDialog(
                    accounts = accounts,
                    onDismiss = { showSelectAccountDialog = false },
                    onSelect = { pickedAccount ->
                        targetAccountForDeploy = pickedAccount
                        viewModel.selectAccount(pickedAccount)
                        showSelectAccountDialog = false
                        showCreateWorkerDialog = true
                    }
                )
            }

            accountToRename?.let { acc ->
                RenameAccountDialog(
                    initialDisplayName = acc.effectiveDisplayName,
                    onDismiss = { accountToRename = null },
                    onConfirm = { newName ->
                        viewModel.renameAccount(acc.accountId, newName)
                        accountToRename = null
                    }
                )
            }

            if (showCreateWorkerDialog) {
                CreateWorkerDialog(
                    initialWorkerName = viewModel.getSuggestedWorkerName(),
                    initialD1Name = viewModel.getSuggestedD1Name(),
                    isDeploying = isDeploying,
                    deployStep = deployStep,
                    deployStage = deployStage,
                    deployDetail = deployDetail,
                    deploymentResult = lastDeploymentResult,
                    onDismiss = { showCreateWorkerDialog = false },
                    onDeploy = { workerName, d1Name ->
                        val targetAcc = targetAccountForDeploy ?: selectedAccount
                        if (targetAcc != null) {
                            viewModel.deployWorkerForAccount(targetAcc, workerName, d1Name) { }
                        } else {
                            viewModel.deployWorker(workerName, d1Name) { }
                        }
                    }
                )
            }

            workerToUpdate?.let { workerName ->
                UpdateWorkerDialog(
                    workerName = workerName,
                    isLoading = isLoading,
                    onDismiss = { workerToUpdate = null },
                    onConfirm = {
                        viewModel.updateWorker(workerName) {
                            workerToUpdate = null
                        }
                    }
                )
            }

            workerToDelete?.let { workerName ->
                DeleteWorkerDialog(
                    workerName = workerName,
                    isLoading = isLoading,
                    onDismiss = { workerToDelete = null },
                    onConfirm = {
                        viewModel.deleteWorker(workerName) {
                            workerToDelete = null
                        }
                    }
                )
            }
        }
    }
}
