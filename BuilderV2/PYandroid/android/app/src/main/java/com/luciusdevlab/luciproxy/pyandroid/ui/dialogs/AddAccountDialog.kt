package com.luciusdevlab.luciproxy.pyandroid.ui.dialogs

import android.content.Intent
import android.net.Uri
import android.widget.Toast
import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.verticalScroll
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Key
import androidx.compose.material.icons.filled.OpenInNew
import androidx.compose.material.icons.filled.Visibility
import androidx.compose.material.icons.filled.VisibilityOff
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.input.PasswordVisualTransformation
import androidx.compose.ui.text.input.VisualTransformation
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.compose.ui.window.Dialog
import com.luciusdevlab.luciproxy.pyandroid.ui.theme.*

@Composable
fun AddAccountDialog(
    suggestedTokenName: String,
    tokenCreationUrl: String = "",
    isLoading: Boolean,
    errorMessage: String?,
    onDismiss: () -> Unit,
    onConfirm: (token: String, customDisplayName: String) -> Unit
) {
    var tokenText by remember { mutableStateOf("") }
    var customDisplayName by remember { mutableStateOf("") }
    var passwordVisible by remember { mutableStateOf(false) }
    var browserError by remember { mutableStateOf<String?>(null) }
    val context = LocalContext.current

    Dialog(onDismissRequest = { if (!isLoading) onDismiss() }) {
        Card(
            modifier = Modifier
                .fillMaxWidth()
                .padding(16.dp),
            shape = RoundedCornerShape(16.dp),
            colors = CardDefaults.cardColors(containerColor = Slate900)
        ) {
            Column(
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(24.dp)
                    .verticalScroll(rememberScrollState())
            ) {
                Row(
                    verticalAlignment = Alignment.CenterVertically,
                    horizontalArrangement = Arrangement.spacedBy(8.dp)
                ) {
                    Icon(
                        imageVector = Icons.Default.Key,
                        contentDescription = "Key",
                        tint = Sky400
                    )
                    Text(
                        text = "Add Cloudflare Account",
                        fontSize = 18.sp,
                        fontWeight = FontWeight.Bold,
                        color = TextPrimary
                    )
                }

                Spacer(modifier = Modifier.height(8.dp))

                Text(
                    text = "Connect with a Cloudflare API Token having permissions for Workers, D1, and Account Analytics.",
                    fontSize = 13.sp,
                    color = TextSecondary
                )

                Spacer(modifier = Modifier.height(16.dp))

                // Direct Button to Cloudflare API Token Creator
                OutlinedButton(
                    onClick = {
                        try {
                            browserError = null
                            val targetUrl = tokenCreationUrl.ifBlank { "https://dash.cloudflare.com/profile/api-tokens" }
                            val intent = Intent(Intent.ACTION_VIEW, Uri.parse(targetUrl)).apply {
                                addFlags(Intent.FLAG_ACTIVITY_NEW_TASK)
                            }
                            context.startActivity(intent)
                        } catch (e: Exception) {
                            browserError = "Could not open browser: ${e.message}"
                        }
                    },
                    modifier = Modifier.fillMaxWidth(),
                    shape = RoundedCornerShape(8.dp),
                    colors = ButtonDefaults.outlinedButtonColors(contentColor = Sky400)
                ) {
                    Icon(
                        imageVector = Icons.Default.OpenInNew,
                        contentDescription = "Open Browser",
                        modifier = Modifier.size(16.dp)
                    )
                    Spacer(modifier = Modifier.width(8.dp))
                    Text(
                        text = "دریافت API Token از Cloudflare",
                        fontSize = 13.sp,
                        fontWeight = FontWeight.SemiBold
                    )
                }

                if (browserError != null) {
                    Spacer(modifier = Modifier.height(6.dp))
                    Text(
                        text = browserError!!,
                        fontSize = 11.sp,
                        color = Rose500
                    )
                }

                Spacer(modifier = Modifier.height(16.dp))

                // Custom Account Display Name Field
                OutlinedTextField(
                    value = customDisplayName,
                    onValueChange = { customDisplayName = it },
                    label = { Text("نام دلخواه حساب (Display Name)") },
                    placeholder = { Text("مثلاً: Personal Cloudflare") },
                    singleLine = true,
                    modifier = Modifier.fillMaxWidth(),
                    colors = OutlinedTextFieldDefaults.colors(
                        focusedBorderColor = Sky400,
                        unfocusedBorderColor = Slate700,
                        focusedTextColor = TextPrimary,
                        unfocusedTextColor = TextPrimary
                    )
                )

                Spacer(modifier = Modifier.height(12.dp))

                // API Token Input Field
                OutlinedTextField(
                    value = tokenText,
                    onValueChange = { tokenText = it },
                    label = { Text("Cloudflare API Token") },
                    placeholder = { Text("cfut_... یا Custom Token") },
                    singleLine = true,
                    modifier = Modifier.fillMaxWidth(),
                    visualTransformation = if (passwordVisible) VisualTransformation.None else PasswordVisualTransformation(),
                    trailingIcon = {
                        IconButton(onClick = { passwordVisible = !passwordVisible }) {
                            Icon(
                                imageVector = if (passwordVisible) Icons.Default.Visibility else Icons.Default.VisibilityOff,
                                contentDescription = if (passwordVisible) "Hide token" else "Show token",
                                tint = TextSecondary
                            )
                        }
                    },
                    colors = OutlinedTextFieldDefaults.colors(
                        focusedBorderColor = Sky400,
                        unfocusedBorderColor = Slate700,
                        focusedTextColor = TextPrimary,
                        unfocusedTextColor = TextPrimary
                    )
                )

                Spacer(modifier = Modifier.height(12.dp))

                Box(
                    modifier = Modifier
                        .fillMaxWidth()
                        .background(Slate800, RoundedCornerShape(8.dp))
                        .padding(12.dp)
                ) {
                    Text(
                        text = "Suggested Connection Label: $suggestedTokenName",
                        fontSize = 12.sp,
                        color = Sky400
                    )
                }

                if (errorMessage != null) {
                    Spacer(modifier = Modifier.height(12.dp))
                    Text(
                        text = errorMessage,
                        fontSize = 12.sp,
                        color = Rose500
                    )
                }

                Spacer(modifier = Modifier.height(20.dp))

                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.End,
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    TextButton(
                        onClick = onDismiss,
                        enabled = !isLoading
                    ) {
                        Text("Cancel", color = TextSecondary)
                    }

                    Spacer(modifier = Modifier.width(8.dp))

                    Button(
                        onClick = { onConfirm(tokenText, customDisplayName) },
                        enabled = tokenText.isNotBlank() && !isLoading,
                        colors = ButtonDefaults.buttonColors(containerColor = Sky600)
                    ) {
                        if (isLoading) {
                            CircularProgressIndicator(
                                modifier = Modifier.size(16.dp),
                                color = Color.White,
                                strokeWidth = 2.dp
                            )
                            Spacer(modifier = Modifier.width(8.dp))
                            Text("Verifying...")
                        } else {
                            Text("Connect")
                        }
                    }
                }
            }
        }
    }
}
