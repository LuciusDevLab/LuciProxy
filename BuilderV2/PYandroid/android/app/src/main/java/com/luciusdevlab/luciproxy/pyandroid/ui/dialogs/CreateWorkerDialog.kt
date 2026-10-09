package com.luciusdevlab.luciproxy.pyandroid.ui.dialogs

import android.content.ClipData
import android.content.ClipboardManager
import android.content.Context
import android.widget.Toast
import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.verticalScroll
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.CheckCircle
import androidx.compose.material.icons.filled.ContentCopy
import androidx.compose.material.icons.filled.ErrorOutline
import androidx.compose.material.icons.filled.RocketLaunch
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.compose.ui.window.Dialog
import com.luciusdevlab.luciproxy.pyandroid.data.models.DeploymentResultDto
import com.luciusdevlab.luciproxy.pyandroid.ui.theme.*

@Composable
fun CreateWorkerDialog(
    initialWorkerName: String,
    initialD1Name: String,
    isDeploying: Boolean,
    deployStep: Int,
    deployStage: String,
    deployDetail: String,
    deploymentResult: DeploymentResultDto?,
    onDismiss: () -> Unit,
    onDeploy: (workerName: String, d1Name: String) -> Unit
) {
    var workerName by remember { mutableStateOf(initialWorkerName) }
    var d1Name by remember { mutableStateOf(initialD1Name) }
    val context = LocalContext.current

    Dialog(onDismissRequest = { if (!isDeploying) onDismiss() }) {
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
                        imageVector = Icons.Default.RocketLaunch,
                        contentDescription = "Deploy",
                        tint = Sky400
                    )
                    Text(
                        text = if (deploymentResult?.success == true) "✓ ساخت Worker با موفقیت انجام شد" else "ساخت Worker جدید (Create Worker)",
                        fontSize = 18.sp,
                        fontWeight = FontWeight.Bold,
                        color = TextPrimary
                    )
                }

                Spacer(modifier = Modifier.height(16.dp))

                if (deploymentResult?.success == true) {
                    // Deployment Success View
                    Box(
                        modifier = Modifier
                            .fillMaxWidth()
                            .background(Slate800, RoundedCornerShape(12.dp))
                            .padding(16.dp)
                    ) {
                        Column(verticalArrangement = Arrangement.spacedBy(12.dp)) {
                            Row(
                                verticalAlignment = Alignment.CenterVertically,
                                horizontalArrangement = Arrangement.spacedBy(8.dp)
                            ) {
                                Icon(
                                    imageVector = Icons.Default.CheckCircle,
                                    contentDescription = "Success",
                                    tint = Emerald500
                                )
                                Text(
                                    text = "Worker Live at Cloudflare Edge",
                                    fontSize = 14.sp,
                                    fontWeight = FontWeight.SemiBold,
                                    color = Emerald500
                                )
                            }

                            ResultField(
                                label = "Worker Name",
                                value = deploymentResult.worker_name,
                                onCopy = { copyToClipboard(context, "Worker Name", deploymentResult.worker_name) }
                            )

                            ResultField(
                                label = "Panel URL (تنها مسیر فعال پنل)",
                                value = deploymentResult.panel_url,
                                onCopy = { copyToClipboard(context, "Panel URL", deploymentResult.panel_url) }
                            )

                            ResultField(
                                label = "Admin / API Path",
                                value = deploymentResult.api_route,
                                onCopy = { copyToClipboard(context, "API Route", deploymentResult.api_route) }
                            )

                            ResultField(
                                label = "Worker Base URL",
                                value = deploymentResult.worker_url,
                                onCopy = { copyToClipboard(context, "Worker URL", deploymentResult.worker_url) }
                            )

                            ResultField(
                                label = "D1 Database",
                                value = deploymentResult.d1_name,
                                onCopy = { copyToClipboard(context, "D1 Name", deploymentResult.d1_name) }
                            )

                            ResultField(
                                label = "D1 Database ID",
                                value = deploymentResult.d1_database_id,
                                onCopy = { copyToClipboard(context, "D1 ID", deploymentResult.d1_database_id) }
                            )

                            // Master Key Box with Security Warning
                            Box(
                                modifier = Modifier
                                    .fillMaxWidth()
                                    .background(Color(0xFF1C1917), RoundedCornerShape(8.dp))
                                    .padding(12.dp)
                            ) {
                                Column(verticalArrangement = Arrangement.spacedBy(6.dp)) {
                                    Text(
                                        text = "🔑 Admin Master Key:",
                                        fontSize = 12.sp,
                                        fontWeight = FontWeight.Bold,
                                        color = Amber500
                                    )
                                    Row(
                                        modifier = Modifier.fillMaxWidth(),
                                        verticalAlignment = Alignment.CenterVertically,
                                        horizontalArrangement = Arrangement.SpaceBetween
                                    ) {
                                        Text(
                                            text = deploymentResult.uuid,
                                            fontSize = 12.sp,
                                            fontWeight = FontWeight.Bold,
                                            color = Sky400,
                                            modifier = Modifier.weight(1f)
                                        )
                                        IconButton(
                                            onClick = { copyToClipboard(context, "Master Key", deploymentResult.uuid) },
                                            modifier = Modifier.size(24.dp)
                                        ) {
                                            Icon(
                                                imageVector = Icons.Default.ContentCopy,
                                                contentDescription = "Copy",
                                                tint = Amber500,
                                                modifier = Modifier.size(16.dp)
                                            )
                                        }
                                    }
                                    Text(
                                        text = "⚠️ این کلید ادمین را همین حالا کپی و ذخیره کنید. دسترسی کامل پنل به این کلید وابسته است و دوباره نمایش داده نخواهد شد.",
                                        fontSize = 11.sp,
                                        color = TextSecondary
                                    )
                                }
                            }
                        }
                    }

                    Spacer(modifier = Modifier.height(20.dp))

                    Button(
                        onClick = onDismiss,
                        modifier = Modifier.fillMaxWidth(),
                        colors = ButtonDefaults.buttonColors(containerColor = Emerald600)
                    ) {
                        Text("بستن و اتمام (Done)")
                    }
                } else if (isDeploying) {
                    // Deployment Progress Stepper View
                    Column(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalAlignment = Alignment.CenterHorizontally
                    ) {
                        CircularProgressIndicator(
                            color = Sky400,
                            modifier = Modifier.size(48.dp),
                            strokeWidth = 3.dp
                        )
                        Spacer(modifier = Modifier.height(16.dp))
                        Text(
                            text = "مرحله $deployStep از 8: $deployStage",
                            fontSize = 15.sp,
                            fontWeight = FontWeight.SemiBold,
                            color = TextPrimary
                        )
                        Spacer(modifier = Modifier.height(8.dp))
                        Text(
                            text = deployDetail,
                            fontSize = 13.sp,
                            color = TextSecondary
                        )
                        Spacer(modifier = Modifier.height(16.dp))
                        LinearProgressIndicator(
                            progress = { deployStep / 8f },
                            modifier = Modifier.fillMaxWidth(),
                            color = Sky400,
                            trackColor = Slate800
                        )
                    }
                } else {
                    // Form View or Failure View
                    if (deploymentResult?.success == false) {
                        Box(
                            modifier = Modifier
                                .fillMaxWidth()
                                .background(Rose500.copy(alpha = 0.15f), RoundedCornerShape(8.dp))
                                .padding(12.dp)
                        ) {
                            Row(
                                verticalAlignment = Alignment.Top,
                                horizontalArrangement = Arrangement.spacedBy(8.dp)
                            ) {
                                Icon(
                                    imageVector = Icons.Default.ErrorOutline,
                                    contentDescription = "Error",
                                    tint = Rose500,
                                    modifier = Modifier.size(20.dp)
                                )
                                Column {
                                    Text(
                                        text = "عملیات دیپلوی با خطا متوقف شد ($deployStage):",
                                        fontSize = 12.sp,
                                        fontWeight = FontWeight.Bold,
                                        color = Rose500
                                    )
                                    Text(
                                        text = deploymentResult.error ?: "خطای ناشناخته",
                                        fontSize = 12.sp,
                                        color = TextPrimary
                                    )
                                }
                            }
                        }
                        Spacer(modifier = Modifier.height(14.dp))
                    }

                    Text(
                        text = "یک Worker جدید به همراه دیتابیس اختصاصی D1 و مسیر تصادفی پنل روی Cloudflare مستقر می‌شود.",
                        fontSize = 13.sp,
                        color = TextSecondary
                    )

                    Spacer(modifier = Modifier.height(16.dp))

                    OutlinedTextField(
                        value = workerName,
                        onValueChange = { workerName = it },
                        label = { Text("نام Worker (Worker Name)") },
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

                    OutlinedTextField(
                        value = d1Name,
                        onValueChange = { d1Name = it },
                        label = { Text("نام دیتابیس D1 (D1 Database Name)") },
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

                    Box(
                        modifier = Modifier
                            .fillMaxWidth()
                            .background(Slate800, RoundedCornerShape(8.dp))
                            .padding(12.dp)
                    ) {
                        Text(
                            text = "مسیر تصادفی پنل و کلید Master Key به شکل خودکار و امن توسط موتور پایتون تولید و متصل می‌شوند.",
                            fontSize = 12.sp,
                            color = Sky400
                        )
                    }

                    Spacer(modifier = Modifier.height(20.dp))

                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.End
                    ) {
                        TextButton(onClick = onDismiss) {
                            Text("Cancel", color = TextSecondary)
                        }
                        Spacer(modifier = Modifier.width(8.dp))
                        Button(
                            onClick = { onDeploy(workerName, d1Name) },
                            enabled = workerName.isNotBlank() && d1Name.isNotBlank(),
                            colors = ButtonDefaults.buttonColors(containerColor = Sky600)
                        ) {
                            Text(if (deploymentResult?.success == false) "تلاش مجدد (Retry)" else "شروع دیپلوی (Deploy)")
                        }
                    }
                }
            }
        }
    }
}

@Composable
private fun ResultField(
    label: String,
    value: String,
    onCopy: () -> Unit
) {
    Column {
        Text(text = label, fontSize = 11.sp, color = TextSecondary)
        Row(
            modifier = Modifier.fillMaxWidth(),
            verticalAlignment = Alignment.CenterVertically,
            horizontalArrangement = Arrangement.SpaceBetween
        ) {
            Text(
                text = value,
                fontSize = 12.sp,
                fontWeight = FontWeight.Medium,
                color = TextPrimary,
                modifier = Modifier.weight(1f)
            )
            IconButton(onClick = onCopy, modifier = Modifier.size(24.dp)) {
                Icon(
                    imageVector = Icons.Default.ContentCopy,
                    contentDescription = "Copy",
                    tint = Sky400,
                    modifier = Modifier.size(16.dp)
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
