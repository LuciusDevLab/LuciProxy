package com.luciusdevlab.luciproxy.manager.ui.screens

import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.material3.*
import androidx.compose.runtime.Composable
import androidx.compose.ui.Modifier
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.luciusdevlab.luciproxy.manager.data.models.ConnectionRecord
import com.luciusdevlab.luciproxy.manager.ui.theme.Slate900

@Composable
fun AccountsScreen(
    connections: List<ConnectionRecord>,
    onAddConnectionClick: () -> Unit
) {
    Column(
        modifier = Modifier
            .fillMaxSize()
            .background(Slate900)
            .padding(16.dp)
    ) {
        Row(
            modifier = Modifier.fillMaxWidth(),
            horizontalArrangement = Arrangement.SpaceBetween
        ) {
            Text(
                text = "Cloudflare Accounts",
                color = MaterialTheme.colorScheme.onBackground,
                fontSize = 20.sp,
                fontWeight = FontWeight.Bold
            )
            Button(onClick = onAddConnectionClick) {
                Text("Add Connection")
            }
        }

        Spacer(modifier = Modifier.height(16.dp))

        Card(
            modifier = Modifier.fillMaxWidth(),
            colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surface)
        ) {
            Column(modifier = Modifier.padding(16.dp)) {
                Text(
                    text = "Hardware Keystore Token Isolation",
                    fontWeight = FontWeight.Bold,
                    color = MaterialTheme.colorScheme.onSurface
                )
                Spacer(modifier = Modifier.height(6.dp))
                Text(
                    text = "Cloudflare API tokens are stored securely in Android Keystore / EncryptedSharedPreferences and are never written to SQLite, logs, or disk.",
                    color = MaterialTheme.colorScheme.onSurfaceVariant,
                    fontSize = 13.sp
                )
            }
        }
    }
}
