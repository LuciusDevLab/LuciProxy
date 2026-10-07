package com.luciusdevlab.luciproxy.manager.ui.screens

import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.material3.*
import androidx.compose.runtime.Composable
import androidx.compose.ui.Modifier
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.luciusdevlab.luciproxy.manager.ui.theme.Slate900
import com.luciusdevlab.luciproxy.manager.ui.theme.Sky400

@Composable
fun HomeScreen(
    onCreateWorkerClick: () -> Unit,
    onUpdateWorkerClick: () -> Unit
) {
    Column(
        modifier = Modifier
            .fillMaxSize()
            .background(Slate900)
            .padding(16.dp)
    ) {
        Text(
            text = "LuciProxy",
            color = MaterialTheme.colorScheme.onBackground,
            fontSize = 24.sp,
            fontWeight = FontWeight.Bold
        )
        Text(
            text = "Manager v2.0.0",
            color = Sky400,
            fontSize = 14.sp,
            fontWeight = FontWeight.SemiBold
        )

        Spacer(modifier = Modifier.height(24.dp))

        Text(
            text = "Quick Actions",
            color = MaterialTheme.colorScheme.onBackground,
            fontSize = 18.sp,
            fontWeight = FontWeight.Medium
        )

        Spacer(modifier = Modifier.height(12.dp))

        Row(
            modifier = Modifier.fillMaxWidth(),
            horizontalArrangement = Arrangement.spacedBy(12.dp)
        ) {
            Button(
                onClick = onCreateWorkerClick,
                modifier = Modifier.weight(1f)
            ) {
                Text("Create Worker")
            }
            Button(
                onClick = onUpdateWorkerClick,
                modifier = Modifier.weight(1f)
            ) {
                Text("Update Worker")
            }
        }

        Spacer(modifier = Modifier.height(24.dp))

        Card(
            modifier = Modifier.fillMaxWidth(),
            colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surface)
        ) {
            Column(modifier = Modifier.padding(16.dp)) {
                Text(
                    text = "Source-Based Deployment Engine",
                    fontWeight = FontWeight.Bold,
                    color = MaterialTheme.colorScheme.onSurface
                )
                Spacer(modifier = Modifier.height(4.dp))
                Text(
                    text = "Worker updates are resolved directly from canonical GitHub releases with immutable commit pinning and D1 binding preservation.",
                    color = MaterialTheme.colorScheme.onSurfaceVariant,
                    fontSize = 13.sp
                )
            }
        }
    }
}
