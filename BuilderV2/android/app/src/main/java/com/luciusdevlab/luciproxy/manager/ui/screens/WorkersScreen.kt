package com.luciusdevlab.luciproxy.manager.ui.screens

import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.material3.*
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.luciusdevlab.luciproxy.manager.data.models.ManagedWorkerRecord
import com.luciusdevlab.luciproxy.manager.ui.theme.Emerald500
import com.luciusdevlab.luciproxy.manager.ui.theme.Slate900

@Composable
fun WorkersScreen(
    workers: List<ManagedWorkerRecord>,
    onUpdateWorker: (ManagedWorkerRecord) -> Unit
) {
    Column(
        modifier = Modifier
            .fillMaxSize()
            .background(Slate900)
            .padding(16.dp)
    ) {
        Text(
            text = "Managed Workers",
            color = MaterialTheme.colorScheme.onBackground,
            fontSize = 20.sp,
            fontWeight = FontWeight.Bold
        )

        Spacer(modifier = Modifier.height(16.dp))

        if (workers.isEmpty()) {
            Box(modifier = Modifier.fillMaxSize(), contentAlignment = Alignment.Center) {
                Text(
                    text = "No Workers configured yet.",
                    color = MaterialTheme.colorScheme.onSurfaceVariant
                )
            }
        } else {
            LazyColumn(verticalArrangement = Arrangement.spacedBy(12.dp)) {
                items(workers) { worker ->
                    WorkerCard(worker = worker, onUpdate = { onUpdateWorker(worker) })
                }
            }
        }
    }
}

@Composable
fun WorkerCard(
    worker: ManagedWorkerRecord,
    onUpdate: () -> Unit
) {
    Card(
        modifier = Modifier.fillMaxWidth(),
        colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surface)
    ) {
        Column(modifier = Modifier.padding(16.dp)) {
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically
            ) {
                Text(
                    text = worker.workerName,
                    fontSize = 18.sp,
                    fontWeight = FontWeight.Bold,
                    color = MaterialTheme.colorScheme.onSurface
                )
                Text(
                    text = "v${worker.installedWorkerVersion}",
                    color = Emerald500,
                    fontWeight = FontWeight.SemiBold,
                    fontSize = 14.sp
                )
            }

            Spacer(modifier = Modifier.height(8.dp))

            Text("Account ID: ${worker.accountId}", fontSize = 12.sp, color = MaterialTheme.colorScheme.onSurfaceVariant)
            Text("Source Revision: ${worker.installedSourceRevision.take(12)}...", fontSize = 12.sp, color = MaterialTheme.colorScheme.onSurfaceVariant)
            Text("D1 Binding: ${worker.d1BindingName} → ${worker.d1Name}", fontSize = 12.sp, color = MaterialTheme.colorScheme.onSurfaceVariant)
            Text("D1 Database ID: ${worker.d1DatabaseId}", fontSize = 12.sp, color = MaterialTheme.colorScheme.onSurfaceVariant)

            Spacer(modifier = Modifier.height(12.dp))

            Button(
                onClick = onUpdate,
                modifier = Modifier.align(Alignment.End)
            ) {
                Text("Update Worker")
            }
        }
    }
}
