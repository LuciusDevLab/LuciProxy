package com.luciusdevlab.luciproxy.pyandroid.ui.screens

import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.automirrored.filled.KeyboardArrowRight
import androidx.compose.material.icons.filled.*
import androidx.compose.material3.*
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.platform.LocalUriHandler
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.luciusdevlab.luciproxy.pyandroid.data.models.AccountRecord
import com.luciusdevlab.luciproxy.pyandroid.data.models.CheckUpdatesResultDto
import com.luciusdevlab.luciproxy.pyandroid.ui.theme.*

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun HomeScreen(
    accounts: List<AccountRecord>,
    updateCheckResult: CheckUpdatesResultDto? = null,
    isCheckingUpdates: Boolean = false,
    onRefreshUpdatesClick: () -> Unit = {},
    onSelectAccount: (AccountRecord) -> Unit,
    onAddAccountClick: () -> Unit,
    onCreateWorkerClick: () -> Unit,
    onRenameAccountClick: (AccountRecord) -> Unit,
    onRemoveAccountClick: (String) -> Unit
) {
    val uriHandler = LocalUriHandler.current

    Scaffold(
        topBar = {
            TopAppBar(
                title = {
                    Column {
                        Text(
                            text = "LuciProxy Manager",
                            fontSize = 20.sp,
                            fontWeight = FontWeight.Bold,
                            color = TextPrimary
                        )
                        Text(
                            text = "Python-Powered Android Subsystem",
                            fontSize = 12.sp,
                            color = Sky400
                        )
                    }
                },
                actions = {
                    IconButton(
                        onClick = onRefreshUpdatesClick,
                        enabled = !isCheckingUpdates
                    ) {
                        if (isCheckingUpdates) {
                            CircularProgressIndicator(
                                modifier = Modifier.size(18.dp),
                                strokeWidth = 2.dp,
                                color = Sky400
                            )
                        } else {
                            Icon(
                                imageVector = Icons.Default.Refresh,
                                contentDescription = "Check for updates",
                                tint = Sky400
                            )
                        }
                    }
                },
                colors = TopAppBarDefaults.topAppBarColors(containerColor = Slate900)
            )
        },
        floatingActionButton = {
            FloatingActionButton(
                onClick = onAddAccountClick,
                containerColor = Sky500,
                contentColor = Color.White
            ) {
                Icon(Icons.Default.Add, contentDescription = "Add Account")
            }
        },
        containerColor = Slate950
    ) { innerPadding ->
        LazyColumn(
            modifier = Modifier
                .fillMaxSize()
                .padding(innerPadding)
                .padding(16.dp),
            verticalArrangement = Arrangement.spacedBy(16.dp)
        ) {
            // Update Notification Banners
            if (updateCheckResult != null) {
                val appEval = updateCheckResult.app_evaluation
                val latestWorker = updateCheckResult.worker_release
                val workersNeedingCount = updateCheckResult.workers_needing_update_count

                // 1. App Update Banner
                if (appEval != null && appEval.has_update) {
                    item {
                        Card(
                            modifier = Modifier.fillMaxWidth(),
                            shape = RoundedCornerShape(14.dp),
                            colors = CardDefaults.cardColors(containerColor = Color(0xFF271C0C)),
                            border = androidx.compose.foundation.BorderStroke(1.dp, Color(0xFFB45309))
                        ) {
                            Column(
                                modifier = Modifier
                                    .fillMaxWidth()
                                    .padding(16.dp)
                            ) {
                                Row(
                                    verticalAlignment = Alignment.CenterVertically,
                                    horizontalArrangement = Arrangement.spacedBy(10.dp)
                                ) {
                                    Icon(
                                        imageVector = Icons.Default.SystemUpdate,
                                        contentDescription = "App Update",
                                        tint = Amber500,
                                        modifier = Modifier.size(22.dp)
                                    )
                                    Column(modifier = Modifier.weight(1f)) {
                                        Text(
                                            text = "LuciProxy App Update Available",
                                            fontSize = 14.sp,
                                            fontWeight = FontWeight.Bold,
                                            color = Color(0xFFFDE68A)
                                        )
                                        Text(
                                            text = "Installed: v${appEval.installed_version} → Available: v${appEval.available_version ?: ""}",
                                            fontSize = 12.sp,
                                            color = TextSecondary
                                        )
                                    }
                                }
                                if (!appEval.changelog.isNullOrBlank()) {
                                    Spacer(modifier = Modifier.height(8.dp))
                                    Text(
                                        text = appEval.changelog,
                                        fontSize = 11.sp,
                                        color = TextSecondary,
                                        maxLines = 2
                                    )
                                }
                                if (!appEval.download_url.isNullOrBlank()) {
                                    Spacer(modifier = Modifier.height(10.dp))
                                    Button(
                                        onClick = { uriHandler.openUri(appEval.download_url) },
                                        colors = ButtonDefaults.buttonColors(containerColor = Color(0xFFD97706)),
                                        contentPadding = PaddingValues(horizontal = 14.dp, vertical = 6.dp),
                                        shape = RoundedCornerShape(8.dp)
                                    ) {
                                        Text("Download Update APK", fontSize = 12.sp, fontWeight = FontWeight.Bold)
                                    }
                                }
                            }
                        }
                    }
                }

                // 2. Worker Update Banner
                if (workersNeedingCount > 0 && latestWorker != null) {
                    item {
                        Card(
                            modifier = Modifier.fillMaxWidth(),
                            shape = RoundedCornerShape(14.dp),
                            colors = CardDefaults.cardColors(containerColor = Color(0xFF0C243B)),
                            border = androidx.compose.foundation.BorderStroke(1.dp, Color(0xFF0369A1))
                        ) {
                            Row(
                                modifier = Modifier
                                    .fillMaxWidth()
                                    .padding(16.dp),
                                verticalAlignment = Alignment.CenterVertically,
                                horizontalArrangement = Arrangement.spacedBy(12.dp)
                            ) {
                                Icon(
                                    imageVector = Icons.Default.RocketLaunch,
                                    contentDescription = "Worker Update",
                                    tint = Sky400,
                                    modifier = Modifier.size(22.dp)
                                )
                                Column(modifier = Modifier.weight(1f)) {
                                    Text(
                                        text = "Worker Script Update Available",
                                        fontSize = 14.sp,
                                        fontWeight = FontWeight.Bold,
                                        color = Sky400
                                    )
                                    Text(
                                        text = "$workersNeedingCount worker(s) can be upgraded to v${latestWorker.version}.",
                                        fontSize = 12.sp,
                                        color = TextSecondary
                                    )
                                }
                            }
                        }
                    }
                }

                // 3. Check Failed Banner (if offline / network error)
                if (!updateCheckResult.success || appEval?.status == "check_failed") {
                    item {
                        Card(
                            modifier = Modifier.fillMaxWidth(),
                            shape = RoundedCornerShape(14.dp),
                            colors = CardDefaults.cardColors(containerColor = Color(0xFF1F1E24)),
                            border = androidx.compose.foundation.BorderStroke(1.dp, Color(0xFF3F3F46))
                        ) {
                            Row(
                                modifier = Modifier
                                    .fillMaxWidth()
                                    .padding(12.dp),
                                verticalAlignment = Alignment.CenterVertically,
                                horizontalArrangement = Arrangement.spacedBy(10.dp)
                            ) {
                                Icon(
                                    imageVector = Icons.Default.WarningAmber,
                                    contentDescription = "Check Failed",
                                    tint = Amber500,
                                    modifier = Modifier.size(20.dp)
                                )
                                Text(
                                    text = "Version check failed (offline or network error).",
                                    fontSize = 12.sp,
                                    color = TextSecondary,
                                    modifier = Modifier.weight(1f)
                                )
                                TextButton(
                                    onClick = onRefreshUpdatesClick,
                                    contentPadding = PaddingValues(horizontal = 8.dp, vertical = 4.dp)
                                ) {
                                    Text("Retry", fontSize = 12.sp, color = Sky400)
                                }
                            }
                        }
                    }
                }
            }

            // Engine Overview Card
            item {
                Card(
                    modifier = Modifier.fillMaxWidth(),
                    shape = RoundedCornerShape(16.dp),
                    colors = CardDefaults.cardColors(containerColor = Slate900)
                ) {
                    Column(
                        modifier = Modifier
                            .fillMaxWidth()
                            .padding(20.dp)
                    ) {
                        Row(
                            verticalAlignment = Alignment.CenterVertically,
                            horizontalArrangement = Arrangement.spacedBy(12.dp)
                        ) {
                            Box(
                                modifier = Modifier
                                    .size(10.dp)
                                    .background(Emerald500, CircleShape)
                            )
                            Text(
                                text = "Embedded Python 3.10 Engine Active",
                                fontSize = 13.sp,
                                fontWeight = FontWeight.SemiBold,
                                color = Emerald500
                            )
                        }
                        Spacer(modifier = Modifier.height(8.dp))
                        Text(
                            text = "Connected Cloudflare Accounts: ${accounts.size}",
                            fontSize = 15.sp,
                            fontWeight = FontWeight.Medium,
                            color = TextPrimary
                        )
                        Spacer(modifier = Modifier.height(4.dp))
                        Text(
                            text = "Hardware-backed Keystore token encryption, source-based deployments, and real GraphQL request analytics.",
                            fontSize = 12.sp,
                            color = TextSecondary
                        )
                    }
                }
            }

            // Primary Actions Bar: [ + Add Account ]  [ + Create Worker ]
            item {
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.spacedBy(12.dp)
                ) {
                    Button(
                        onClick = onAddAccountClick,
                        modifier = Modifier.weight(1f),
                        colors = ButtonDefaults.buttonColors(containerColor = Slate800),
                        shape = RoundedCornerShape(10.dp)
                    ) {
                        Icon(Icons.Default.Add, contentDescription = null, modifier = Modifier.size(16.dp))
                        Spacer(modifier = Modifier.width(6.dp))
                        Text("+ Add Account", fontSize = 13.sp)
                    }

                    Button(
                        onClick = onCreateWorkerClick,
                        modifier = Modifier.weight(1f),
                        colors = ButtonDefaults.buttonColors(containerColor = Sky600),
                        shape = RoundedCornerShape(10.dp)
                    ) {
                        Icon(Icons.Default.RocketLaunch, contentDescription = null, modifier = Modifier.size(16.dp))
                        Spacer(modifier = Modifier.width(6.dp))
                        Text("+ Create Worker", fontSize = 13.sp, fontWeight = FontWeight.Bold)
                    }
                }
            }

            // Accounts List Header
            item {
                Text(
                    text = "ACCOUNTS & CLOUDFLARE ENVIRONMENTS",
                    fontSize = 12.sp,
                    fontWeight = FontWeight.Bold,
                    color = TextSecondary,
                    letterSpacing = 1.sp
                )
            }

            if (accounts.isEmpty()) {
                item {
                    Card(
                        modifier = Modifier.fillMaxWidth(),
                        shape = RoundedCornerShape(16.dp),
                        colors = CardDefaults.cardColors(containerColor = Slate900)
                    ) {
                        Column(
                            modifier = Modifier
                                .fillMaxWidth()
                                .padding(32.dp),
                            horizontalAlignment = Alignment.CenterHorizontally
                        ) {
                            Icon(
                                imageVector = Icons.Default.CloudQueue,
                                contentDescription = "Cloud",
                                tint = Slate600,
                                modifier = Modifier.size(48.dp)
                            )
                            Spacer(modifier = Modifier.height(16.dp))
                            Text(
                                text = "No Cloudflare Accounts Connected",
                                fontSize = 16.sp,
                                fontWeight = FontWeight.SemiBold,
                                color = TextPrimary
                            )
                            Spacer(modifier = Modifier.height(8.dp))
                            Text(
                                text = "Add an API token to manage Workers, provision D1 databases, and monitor live requests.",
                                fontSize = 13.sp,
                                color = TextSecondary,
                                modifier = Modifier.padding(horizontal = 16.dp)
                            )
                            Spacer(modifier = Modifier.height(20.dp))
                            Button(
                                onClick = onAddAccountClick,
                                colors = ButtonDefaults.buttonColors(containerColor = Sky600)
                            ) {
                                Icon(Icons.Default.Add, contentDescription = null, modifier = Modifier.size(16.dp))
                                Spacer(modifier = Modifier.width(8.dp))
                                Text("Connect Account")
                            }
                        }
                    }
                }
            } else {
                items(accounts) { account ->
                    AccountCard(
                        account = account,
                        onSelect = { onSelectAccount(account) },
                        onRename = { onRenameAccountClick(account) },
                        onRemove = { onRemoveAccountClick(account.connectionId) }
                    )
                }
            }
        }
    }
}

@Composable
private fun AccountCard(
    account: AccountRecord,
    onSelect: () -> Unit,
    onRename: () -> Unit,
    onRemove: () -> Unit
) {
    Card(
        modifier = Modifier.fillMaxWidth(),
        shape = RoundedCornerShape(14.dp),
        colors = CardDefaults.cardColors(containerColor = Slate900)
    ) {
        Column(
            modifier = Modifier
                .fillMaxWidth()
                .padding(16.dp)
        ) {
            Row(
                modifier = Modifier.fillMaxWidth(),
                verticalAlignment = Alignment.CenterVertically,
                horizontalArrangement = Arrangement.SpaceBetween
            ) {
                Column(modifier = Modifier.weight(1f)) {
                    Row(
                        verticalAlignment = Alignment.CenterVertically,
                        horizontalArrangement = Arrangement.spacedBy(6.dp)
                    ) {
                        Text(
                            text = account.effectiveDisplayName,
                            fontSize = 16.sp,
                            fontWeight = FontWeight.Bold,
                            color = TextPrimary
                        )
                        IconButton(
                            onClick = onRename,
                            modifier = Modifier.size(24.dp)
                        ) {
                            Icon(
                                imageVector = Icons.Default.Edit,
                                contentDescription = "Rename",
                                tint = Sky400,
                                modifier = Modifier.size(14.dp)
                            )
                        }
                    }
                    Spacer(modifier = Modifier.height(2.dp))
                    Text(
                        text = "Cloudflare: ${account.accountName} • ID: ${account.accountId}",
                        fontSize = 12.sp,
                        color = TextSecondary
                    )
                }

                Box(
                    modifier = Modifier
                        .background(Emerald500.copy(alpha = 0.15f), RoundedCornerShape(6.dp))
                        .padding(horizontal = 8.dp, vertical = 4.dp)
                ) {
                    Text(
                        text = "Active",
                        fontSize = 11.sp,
                        fontWeight = FontWeight.SemiBold,
                        color = Emerald500
                    )
                }
            }

            Spacer(modifier = Modifier.height(16.dp))

            Row(
                modifier = Modifier.fillMaxWidth(),
                verticalAlignment = Alignment.CenterVertically,
                horizontalArrangement = Arrangement.SpaceBetween
            ) {
                Button(
                    onClick = onSelect,
                    colors = ButtonDefaults.buttonColors(containerColor = Sky600),
                    contentPadding = PaddingValues(horizontal = 16.dp, vertical = 8.dp)
                ) {
                    Text("Manage & Workers", fontSize = 13.sp)
                    Spacer(modifier = Modifier.width(4.dp))
                    Icon(
                        imageVector = Icons.AutoMirrored.Filled.KeyboardArrowRight,
                        contentDescription = null,
                        modifier = Modifier.size(16.dp)
                    )
                }

                IconButton(onClick = onRemove) {
                    Icon(
                        imageVector = Icons.Default.Delete,
                        contentDescription = "Remove Account",
                        tint = Slate600
                    )
                }
            }
        }
    }
}
