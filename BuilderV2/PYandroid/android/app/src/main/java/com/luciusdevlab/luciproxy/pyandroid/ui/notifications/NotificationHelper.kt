package com.luciusdevlab.luciproxy.pyandroid.ui.notifications

import android.Manifest
import android.app.NotificationChannel
import android.app.NotificationManager
import android.app.PendingIntent
import android.content.Context
import android.content.Intent
import android.content.pm.PackageManager
import android.os.Build
import androidx.core.app.NotificationCompat
import androidx.core.app.NotificationManagerCompat
import androidx.core.content.ContextCompat
import com.luciusdevlab.luciproxy.pyandroid.R
import com.luciusdevlab.luciproxy.pyandroid.ui.MainActivity

class NotificationHelper(private val context: Context) {

    companion object {
        const val CHANNEL_WORKER_UPDATES = "luciproxy_worker_updates"
        const val CHANNEL_APP_UPDATES = "luciproxy_app_updates"
        const val NOTIFICATION_ID_WORKER = 1001
        const val NOTIFICATION_ID_APP = 1002
    }

    init {
        createNotificationChannels()
    }

    private fun createNotificationChannels() {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            val nm = context.getSystemService(Context.NOTIFICATION_SERVICE) as? NotificationManager
                ?: return

            val workerChannel = NotificationChannel(
                CHANNEL_WORKER_UPDATES,
                "LuciProxy Worker Updates",
                NotificationManager.IMPORTANCE_DEFAULT
            ).apply {
                description = "Notifications for newly available LuciProxy Worker script updates."
            }

            val appChannel = NotificationChannel(
                CHANNEL_APP_UPDATES,
                "LuciProxy App Updates",
                NotificationManager.IMPORTANCE_DEFAULT
            ).apply {
                description = "Notifications for newly published LuciProxy Android Manager releases."
            }

            nm.createNotificationChannel(workerChannel)
            nm.createNotificationChannel(appChannel)
        }
    }

    fun canPostNotifications(): Boolean {
        if (!NotificationManagerCompat.from(context).areNotificationsEnabled()) {
            return false
        }
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.TIRAMISU) {
            val status = ContextCompat.checkSelfPermission(
                context,
                Manifest.permission.POST_NOTIFICATIONS
            )
            return status == PackageManager.PERMISSION_GRANTED
        }
        return true
    }

    fun notifyWorkerUpdate(latestVersion: String, affectedCount: Int = 1, workerName: String? = null): Boolean {
        if (!canPostNotifications()) return false

        try {
            val intent = Intent(context, MainActivity::class.java).apply {
                flags = Intent.FLAG_ACTIVITY_NEW_TASK or Intent.FLAG_ACTIVITY_CLEAR_TOP
            }
            val pendingIntent = PendingIntent.getActivity(
                context,
                0,
                intent,
                PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE
            )

            val vText = if (latestVersion.startsWith("v")) latestVersion else "v$latestVersion"
            val body = if (affectedCount == 1 && !workerName.isNullOrBlank()) {
                "Worker update $vText is available for '$workerName'."
            } else {
                "Worker update $vText is available for $affectedCount Worker(s)."
            }

            val notification = NotificationCompat.Builder(context, CHANNEL_WORKER_UPDATES)
                .setSmallIcon(R.mipmap.ic_launcher)
                .setContentTitle("🛡️ Worker Update Available")
                .setContentText(body)
                .setPriority(NotificationCompat.PRIORITY_DEFAULT)
                .setContentIntent(pendingIntent)
                .setAutoCancel(true)
                .build()

            NotificationManagerCompat.from(context).notify(NOTIFICATION_ID_WORKER, notification)
            return true
        } catch (_: Exception) {
            return false
        }
    }

    fun notifyAppUpdate(latestVersion: String, changelog: String? = null): Boolean {
        if (!canPostNotifications()) return false

        try {
            val intent = Intent(context, MainActivity::class.java).apply {
                flags = Intent.FLAG_ACTIVITY_NEW_TASK or Intent.FLAG_ACTIVITY_CLEAR_TOP
            }
            val pendingIntent = PendingIntent.getActivity(
                context,
                0,
                intent,
                PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE
            )

            val vText = if (latestVersion.startsWith("v")) latestVersion else "v$latestVersion"
            val body = if (!changelog.isNullOrBlank()) {
                "LuciProxy Manager $vText is available: ${changelog.lines().firstOrNull()?.take(80) ?: ""}"
            } else {
                "LuciProxy Manager $vText is available for download."
            }

            val notification = NotificationCompat.Builder(context, CHANNEL_APP_UPDATES)
                .setSmallIcon(R.mipmap.ic_launcher)
                .setContentTitle("⚡ LuciProxy Manager Update")
                .setContentText(body)
                .setPriority(NotificationCompat.PRIORITY_DEFAULT)
                .setContentIntent(pendingIntent)
                .setAutoCancel(true)
                .build()

            NotificationManagerCompat.from(context).notify(NOTIFICATION_ID_APP, notification)
            return true
        } catch (_: Exception) {
            return false
        }
    }
}
