package com.luciusdevlab.luciproxy.manager.ui.screens

import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.material3.*
import androidx.compose.runtime.Composable
import androidx.compose.ui.Modifier
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.luciusdevlab.luciproxy.manager.ui.theme.Rose500
import com.luciusdevlab.luciproxy.manager.ui.theme.Slate900
import com.luciusdevlab.luciproxy.manager.ui.theme.Sky400

@Composable
fun SettingsScreen(
    onPurgeDataClick: () -> Unit
) {
    Column(
        modifier = Modifier
            .fillMaxSize()
            .background(Slate900)
            .padding(16.dp)
    ) {
        Text(
            text = "Settings",
            color = MaterialTheme.colorScheme.onBackground,
            fontSize = 20.sp,
            fontWeight = FontWeight.Bold
        )

        Spacer(modifier = Modifier.height(16.dp))

        Card(
            modifier = Modifier.fillMaxWidth(),
            colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surface)
        ) {
            Column(modifier = Modifier.padding(16.dp)) {
                Text("Application Info", fontWeight = FontWeight.Bold, color = MaterialTheme.colorScheme.onSurface)
                Spacer(modifier = Modifier.height(4.dp))
                Text("Version: Manager v2.0.0 (Code 200)", color = Sky400, fontSize = 13.sp)
                Text("Manager Channel: manager-v2.0.0", color = MaterialTheme.colorScheme.onSurfaceVariant, fontSize = 13.sp)
                Text("Worker Signal: version.json (v1.2.1)", color = MaterialTheme.colorScheme.onSurfaceVariant, fontSize = 13.sp)
            }
        }

        Spacer(modifier = Modifier.height(16.dp))

        Card(
            modifier = Modifier.fillMaxWidth(),
            colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surface)
        ) {
            Column(modifier = Modifier.padding(16.dp)) {
                Text("Privacy & Security", fontWeight = FontWeight.Bold, color = MaterialTheme.colorScheme.onSurface)
                Spacer(modifier = Modifier.height(4.dp))
                Text(
                    "Purging local data irreversibly deletes all Cloudflare API tokens from Android Keystore and resets local caches.",
                    color = MaterialTheme.colorScheme.onSurfaceVariant,
                    fontSize = 13.sp
                )
                Spacer(modifier = Modifier.height(12.dp))
                Button(
                    onClick = onPurgeDataClick,
                    colors = ButtonDefaults.buttonColors(containerColor = Rose500)
                ) {
                    Text("Delete All Local Data")
                }
            }
        }
    }
}
