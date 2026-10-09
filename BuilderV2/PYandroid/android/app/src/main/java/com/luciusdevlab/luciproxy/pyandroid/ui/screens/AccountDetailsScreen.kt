package com.luciusdevlab.luciproxy.pyandroid.ui.screens

import android.content.ClipData
import android.content.ClipboardManager
import android.content.Context
import android.widget.Toast
import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.automirrored.filled.ArrowBack
import androidx.compose.material.icons.filled.*
import androidx.compose.material3.*
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.luciusdevlab.luciproxy.pyandroid.data.models.*
import com.luciusdevlab.luciproxy.pyandroid.ui.theme.*

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun AccountDetailsScreen(
    account: AccountRecord,
    details: AccountDetailsDto?,
    managedWorkers: List<ManagedWorkerRecord> = emptyList(),
    updateCheckResult: CheckUpdatesResultDto? = null,
    isLoading: Boolean,
    isRefreshing: Boolean,
    onBackClick: () -> Unit,
    onRefreshClick: () -> Unit,
    onDeployWorkerClick: () -> Unit,
    onRenameClick: () -> Unit,
    onUpdateWorkerClick: (String) -> Unit,
    onDeleteWorkerClick: (String) -> Unit
) {
    val context = LocalContext.current

    Scaffold(
        topBar = {
            TopAppBar(
                title = {
                    Row(
                        verticalAlignment = Alignment.CenterVertically,
                        modifier = Modifier.fillMaxWidth()
                    ) {
                        Column(modifier = Modifier.weight(1f)) {
                            Text(
                                text = account.effectiveDisplayName,
                                fontSize = 17.sp,
                                fontWeight = FontWeight.Bold,
                                color = TextPrimary,
                                maxLines = 1
                            )
                            val subText = if (account.displayName.isNotBlank() && account.displayName != account.accountName) {
                                "${account.accountName} • ${account.accountId}"
                            } else {
                                "Account: ${account.accountId}"
                            }
                            Text(
                                text = subText,
                                fontSize = 11.sp,
                                color = TextSecondary,
                                maxLines = 1
                            )
                        }
                        IconButton(
                            onClick = onRenameClick,
                            modifier = Modifier.size(32.dp)
                        ) {
                            Icon(
                                imageVector = Icons.Default.Edit,
                                contentDescription = "Rename Account",
                                tint = Sky400,
                                modifier = Modifier.size(16.dp)
                            )
                        }
                    }
                },
                navigationIcon = {
                    IconButton(onClick = onBackClick) {
                        Icon(
                            imageVector = Icons.AutoMirrored.Filled.ArrowBack,
                            contentDescription = "Back",
                            tint = TextPrimary
                        )
                    }
                },
                actions = {
                    IconButton(onClick = onDeployWorkerClick) {
                        Icon(
                            imageVector = Icons.Default.Add,
                            contentDescription = "Deploy Worker",
                            tint = Sky400
                        )
                    }
                    IconButton(onClick = onRefreshClick, enabled = !isRefreshing) {
                        if (isRefreshing) {
                            CircularProgressIndicator(
                                modifier = Modifier.size(20.dp),
                                color = Sky400,
                                strokeWidth = 2.dp
                            )
                        } else {
                            Icon(
                                imageVector = Icons.Default.Refresh,
                                contentDescription = "Refresh",
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
                onClick = onDeployWorkerClick,
                containerColor = Sky500,
                contentColor = Color.White
            ) {
                Icon(Icons.Default.Add, contentDescription = "Deploy Worker")
            }
        },
        containerColor = Slate950
    ) { innerPadding ->
        if (isLoading && details == null) {
            Box(
                modifier = Modifier
                    .fillMaxSize()
                    .padding(innerPadding),
                contentAlignment = Alignment.Center
            ) {
                CircularProgressIndicator(color = Sky400)
            }
        } else {
            LazyColumn(
                modifier = Modifier
                    .fillMaxSize()
                    .padding(innerPadding)
                    .padding(16.dp),
                verticalArrangement = Arrangement.spacedBy(16.dp)
            ) {
                // Analytics Card: Real GraphQL Usage
                item {
                    val analytics = details?.analytics
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
                                modifier = Modifier.fillMaxWidth(),
                                verticalAlignment = Alignment.CenterVertically,
                                horizontalArrangement = Arrangement.SpaceBetween
                            ) {
                                Row(
                                    verticalAlignment = Alignment.CenterVertically,
                                    horizontalArrangement = Arrangement.spacedBy(8.dp)
                                ) {
                                    Icon(
                                        imageVector = Icons.Default.Analytics,
                                        contentDescription = "Analytics",
                                        tint = Sky400,
                                        modifier = Modifier.size(20.dp)
                                    )
                                    Text(
                                        text = "Cloudflare Edge Invocations",
                                        fontSize = 14.sp,
                                        fontWeight = FontWeight.SemiBold,
                                        color = TextPrimary
                                    )
                                }
                                Box(
                                    modifier = Modifier
                                        .background(Sky400.copy(alpha = 0.15f), RoundedCornerShape(6.dp))
                                        .padding(horizontal = 8.dp, vertical = 4.dp)
                                    ) {
                                    Text(
                                        text = "Live Metrics",
                                        fontSize = 11.sp,
                                        color = Sky400
                                    )
                                }
                            }

                            Spacer(modifier = Modifier.height(16.dp))

                            Row(
                                modifier = Modifier.fillMaxWidth(),
                                horizontalArrangement = Arrangement.SpaceAround
                            ) {
                                MetricColumn(
                                    label = "Real Usage (24h)",
                                    value = analytics?.requests ?: "Unavailable",
                                    color = Emerald500
                                )
                                MetricColumn(
                                    label = "Daily Quota",
                                    value = analytics?.quota ?: "Unavailable",
                                    color = TextSecondary
                                )
                            }
                        }
                    }
                }

                // Managed Workers Section
                item {
                    Text(
                        text = "MANAGED WORKERS (${details?.workers?.size ?: 0})",
                        fontSize = 12.sp,
                        fontWeight = FontWeight.Bold,
                        color = TextSecondary,
                        letterSpacing = 1.sp
                    )
                }

                val workers = details?.workers ?: emptyList()
                if (workers.isEmpty()) {
                    item {
                        Card(
                            modifier = Modifier.fillMaxWidth(),
                            shape = RoundedCornerShape(14.dp),
                            colors = CardDefaults.cardColors(containerColor = Slate900)
                        ) {
                            Column(
                                modifier = Modifier
                                    .fillMaxWidth()
                                    .padding(24.dp),
                                horizontalAlignment = Alignment.CenterHorizontally
                            ) {
                                Icon(
                                    imageVector = Icons.Default.LayersClear,
                                    contentDescription = "No workers",
                                    tint = Slate600,
                                    modifier = Modifier.size(36.dp)
                                )
                                Spacer(modifier = Modifier.height(8.dp))
                                Text(
                                    text = "No Workers Deployed",
                                    fontSize = 14.sp,
                                    fontWeight = FontWeight.Medium,
                                    color = TextPrimary
                                )
                                Spacer(modifier = Modifier.height(4.dp))
                                Text(
                                    text = "Deploy a canonical Worker with randomized API routing to get started.",
                                    fontSize = 12.sp,
                                    color = TextSecondary
                                )
                            }
                        }
                    }
                } else {
                    items(workers) { worker ->
                        val workerName = worker.name.ifEmpty { worker.id }
                        val record = managedWorkers.find { it.accountId == account.accountId && it.workerName == workerName }
                        val eval = updateCheckResult?.worker_evaluations?.find { it.worker_name == workerName }
                        WorkerCard(
                            worker = worker,
                            record = record,
                            evaluation = eval,
                            latestWorkerVersion = updateCheckResult?.worker_release?.version,
                            onUpdate = { onUpdateWorkerClick(workerName) },
                            onDelete = { onDeleteWorkerClick(workerName) },
                            onCopyUrl = { label, url -> copyToClipboard(context, label, url) }
                        )
                    }
                }

                // D1 Databases Section
                item {
                    Spacer(modifier = Modifier.height(8.dp))
                    Text(
                        text = "D1 DATABASE INVENTORY",
                        fontSize = 12.sp,
                        fontWeight = FontWeight.Bold,
                        color = TextSecondary,
                        letterSpacing = 1.sp
                    )
                }

                val linkedDbs = details?.d1_linked ?: emptyList()
                val unassignedDbs = details?.d1_unassigned ?: emptyList()

                if (linkedDbs.isEmpty() && unassignedDbs.isEmpty()) {
                    item {
                        Card(
                            modifier = Modifier.fillMaxWidth(),
                            shape = RoundedCornerShape(14.dp),
                            colors = CardDefaults.cardColors(containerColor = Slate900)
                        ) {
                            Box(
                                modifier = Modifier
                                    .fillMaxWidth()
                                    .padding(16.dp),
                                contentAlignment = Alignment.Center
                            ) {
                                Text(
                                    text = "No D1 databases found in this account.",
                                    fontSize = 12.sp,
                                    color = TextSecondary
                                )
                            }
                        }
                    }
                } else {
                    if (linkedDbs.isNotEmpty()) {
                        item {
                            Text(
                                text = "Linked Databases (${linkedDbs.size})",
                                fontSize = 12.sp,
                                fontWeight = FontWeight.SemiBold,
                                color = Sky400
                            )
                        }
                        items(linkedDbs) { db ->
                            D1DatabaseCard(db = db, isLinked = true)
                        }
                    }

                    if (unassignedDbs.isNotEmpty()) {
                        item {
                            Spacer(modifier = Modifier.height(8.dp))
                            Text(
                                text = "Unassigned Databases (${unassignedDbs.size})",
                                fontSize = 12.sp,
                                fontWeight = FontWeight.SemiBold,
                                color = TextSecondary
                            )
                        }
                        items(unassignedDbs) { db ->
                            D1DatabaseCard(db = db, isLinked = false)
                        }
                    }
                }
            }
        }
    }
}

@Composable
private fun MetricColumn(label: String, value: String, color: Color) {
    Column(horizontalAlignment = Alignment.CenterHorizontally) {
        Text(text = label, fontSize = 12.sp, color = TextSecondary)
        Spacer(modifier = Modifier.height(4.dp))
        Text(
            text = value,
            fontSize = 20.sp,
            fontWeight = FontWeight.Bold,
            color = color
        )
    }
}

@Composable
private fun WorkerCard(
    worker: WorkerSummaryDto,
    record: ManagedWorkerRecord?,
    evaluation: WorkerEvaluationDto?,
    latestWorkerVersion: String?,
    onUpdate: () -> Unit,
    onDelete: () -> Unit,
    onCopyUrl: (String, String) -> Unit
) {
    val workerName = worker.name.ifEmpty { worker.id }
    val d1Binding = worker.d1_bindings.firstOrNull()

    val installedVer = record?.installedWorkerVersion ?: "Unknown"
    val latestVer = evaluation?.available_version ?: latestWorkerVersion
    val hasUpdate = evaluation?.has_update == true
    val status = evaluation?.status ?: if (record == null) "unknown" else ""

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
                Row(
                    verticalAlignment = Alignment.CenterVertically,
                    horizontalArrangement = Arrangement.spacedBy(4.dp)
                ) {
                    Text(
                        text = workerName,
                        fontSize = 15.sp,
                        fontWeight = FontWeight.Bold,
                        color = TextPrimary
                    )
                    IconButton(
                        onClick = { onCopyUrl("Worker Name", workerName) },
                        modifier = Modifier.size(24.dp)
                    ) {
                        Icon(
                            imageVector = Icons.Default.ContentCopy,
                            contentDescription = "Copy Worker Name",
                            tint = Sky400,
                            modifier = Modifier.size(14.dp)
                        )
                    }
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

            Spacer(modifier = Modifier.height(6.dp))

            // Badges row: Installed, Latest, Status
            Row(
                modifier = Modifier.fillMaxWidth(),
                verticalAlignment = Alignment.CenterVertically,
                horizontalArrangement = Arrangement.spacedBy(6.dp)
            ) {
                // Installed Version
                val instLabel = if (installedVer != "Unknown" && !installedVer.startsWith("v")) "Installed: v$installedVer" else "Installed: $installedVer"
                Box(
                    modifier = Modifier
                        .background(Sky500.copy(alpha = 0.15f), RoundedCornerShape(4.dp))
                        .padding(horizontal = 6.dp, vertical = 2.dp)
                ) {
                    Text(
                        text = instLabel,
                        fontSize = 11.sp,
                        fontWeight = FontWeight.Medium,
                        color = Sky400
                    )
                }

                // Latest Version
                if (!latestVer.isNullOrBlank() && latestVer != "unknown") {
                    val latestLabel = if (!latestVer.startsWith("v")) "Latest: v$latestVer" else "Latest: $latestVer"
                    Box(
                        modifier = Modifier
                            .background(Slate800, RoundedCornerShape(4.dp))
                            .padding(horizontal = 6.dp, vertical = 2.dp)
                    ) {
                        Text(
                            text = latestLabel,
                            fontSize = 11.sp,
                            fontWeight = FontWeight.Medium,
                            color = TextSecondary
                        )
                    }
                }

                // Status Badge
                when {
                    hasUpdate -> {
                        Box(
                            modifier = Modifier
                                .background(Color(0xFF451A03), RoundedCornerShape(4.dp))
                                .padding(horizontal = 6.dp, vertical = 2.dp)
                        ) {
                            Text(
                                text = "● Update Available",
                                fontSize = 11.sp,
                                fontWeight = FontWeight.Bold,
                                color = Amber500
                            )
                        }
                    }
                    status == "up_to_date" -> {
                        Box(
                            modifier = Modifier
                                .background(Emerald500.copy(alpha = 0.15f), RoundedCornerShape(4.dp))
                                .padding(horizontal = 6.dp, vertical = 2.dp)
                        ) {
                            Text(
                                text = "● Up to date",
                                fontSize = 11.sp,
                                fontWeight = FontWeight.SemiBold,
                                color = Emerald500
                            )
                        }
                    }
                    status == "dev_build" -> {
                        Box(
                            modifier = Modifier
                                .background(Color(0xFF3B0764), RoundedCornerShape(4.dp))
                                .padding(horizontal = 6.dp, vertical = 2.dp)
                        ) {
                            Text(
                                text = "● Dev Build",
                                fontSize = 11.sp,
                                fontWeight = FontWeight.SemiBold,
                                color = Color(0xFFC084FC)
                            )
                        }
                    }
                    else -> {
                        Box(
                            modifier = Modifier
                                .background(Slate800, RoundedCornerShape(4.dp))
                                .padding(horizontal = 6.dp, vertical = 2.dp)
                        ) {
                            Text(
                                text = "● Unknown",
                                fontSize = 11.sp,
                                fontWeight = FontWeight.Medium,
                                color = TextSecondary
                            )
                        }
                    }
                }
            }

            Spacer(modifier = Modifier.height(8.dp))

            if (d1Binding != null) {
                Text(
                    text = "D1 Binding: ${d1Binding.binding_name} (${d1Binding.database_id.take(8)}...)",
                    fontSize = 12.sp,
                    color = TextSecondary
                )
            } else {
                Text(
                    text = "No linked D1 database bindings",
                    fontSize = 12.sp,
                    color = Amber500
                )
            }

            Spacer(modifier = Modifier.height(14.dp))

            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.End,
                verticalAlignment = Alignment.CenterVertically
            ) {
                if (hasUpdate) {
                    Button(
                        onClick = onUpdate,
                        colors = ButtonDefaults.buttonColors(containerColor = Sky600),
                        contentPadding = PaddingValues(horizontal = 12.dp, vertical = 6.dp)
                    ) {
                        Icon(Icons.Default.Upgrade, contentDescription = null, modifier = Modifier.size(14.dp))
                        Spacer(modifier = Modifier.width(4.dp))
                        Text("Update Script", fontSize = 12.sp, fontWeight = FontWeight.Bold)
                    }
                } else {
                    OutlinedButton(
                        onClick = onUpdate,
                        colors = ButtonDefaults.outlinedButtonColors(contentColor = Sky400),
                        contentPadding = PaddingValues(horizontal = 12.dp, vertical = 6.dp)
                    ) {
                        Icon(Icons.Default.Upgrade, contentDescription = null, modifier = Modifier.size(14.dp))
                        Spacer(modifier = Modifier.width(4.dp))
                        Text("Update", fontSize = 12.sp)
                    }
                }

                Spacer(modifier = Modifier.width(8.dp))

                OutlinedButton(
                    onClick = onDelete,
                    colors = ButtonDefaults.outlinedButtonColors(contentColor = Rose500),
                    contentPadding = PaddingValues(horizontal = 12.dp, vertical = 6.dp)
                ) {
                    Icon(Icons.Default.Delete, contentDescription = null, modifier = Modifier.size(14.dp))
                    Spacer(modifier = Modifier.width(4.dp))
                    Text("Delete", fontSize = 12.sp)
                }
            }
        }
    }
}

@Composable
private fun D1DatabaseCard(db: D1DatabaseDto, isLinked: Boolean) {
    Card(
        modifier = Modifier.fillMaxWidth(),
        shape = RoundedCornerShape(10.dp),
        colors = CardDefaults.cardColors(containerColor = Slate900)
    ) {
        Row(
            modifier = Modifier
                .fillMaxWidth()
                .padding(12.dp),
            verticalAlignment = Alignment.CenterVertically,
            horizontalArrangement = Arrangement.SpaceBetween
        ) {
            Column {
                Text(
                    text = db.name,
                    fontSize = 13.sp,
                    fontWeight = FontWeight.Medium,
                    color = TextPrimary
                )
                Text(
                    text = "UUID: ${db.id}",
                    fontSize = 11.sp,
                    color = TextSecondary
                )
            }
            Box(
                modifier = Modifier
                    .background(
                        if (isLinked) Sky500.copy(alpha = 0.15f) else Slate800,
                        RoundedCornerShape(6.dp)
                    )
                    .padding(horizontal = 8.dp, vertical = 4.dp)
            ) {
                Text(
                    text = if (isLinked) "Linked" else "Unassigned",
                    fontSize = 11.sp,
                    color = if (isLinked) Sky400 else TextSecondary
                )
            }
        }
    }
}

private fun copyToClipboard(context: Context, label: String, text: String) {
    val clipboard = context.getSystemService(Context.CLIPBOARD_SERVICE) as ClipboardManager
    val clip = ClipData.newPlainText(label, text)
    clipboard.setPrimaryClip(clip)
    Toast.makeText(context, "$label copied to clipboard", Toast.LENGTH_SHORT).show()
}
