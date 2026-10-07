package com.luciusdevlab.luciproxy.manager

import android.app.Application
import android.app.NotificationChannel
import android.app.NotificationManager
import android.os.Build
import com.luciusdevlab.luciproxy.manager.data.github.WorkerSourceService
import com.luciusdevlab.luciproxy.manager.data.security.AndroidKeystoreCredentialStore
import com.luciusdevlab.luciproxy.manager.data.security.SecureCredentialStore
import com.luciusdevlab.luciproxy.manager.data.storage.LocalRepository
import java.io.File

class LuciProxyApplication : Application() {

    lateinit var credentialStore: SecureCredentialStore
        private set

    lateinit var localRepository: LocalRepository
        private set

    lateinit var sourceService: WorkerSourceService
        private set

    override fun onCreate() {
        super.onCreate()
        credentialStore = AndroidKeystoreCredentialStore(this)
        localRepository = LocalRepository()

        val cacheDir = File(cacheDir, "worker_sources")
        sourceService = WorkerSourceService(cacheDir = cacheDir)

        createNotificationChannels()
    }

    private fun createNotificationChannels() {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            val notificationManager = getSystemService(NotificationManager::class.java)

            // Independent Channel 1: Manager Updates
            val managerChannel = NotificationChannel(
                CHANNEL_MANAGER_UPDATES,
                "Manager App Updates",
                NotificationManager.IMPORTANCE_DEFAULT
            ).apply {
                description = "Notifications regarding new versions of LuciProxy Manager"
            }

            // Independent Channel 2: Worker Updates
            val workerChannel = NotificationChannel(
                CHANNEL_WORKER_UPDATES,
                "Worker Edge Updates",
                NotificationManager.IMPORTANCE_HIGH
            ).apply {
                description = "Notifications regarding new authoritative releases of LuciProxy Worker"
            }

            notificationManager.createNotificationChannel(managerChannel)
            notificationManager.createNotificationChannel(workerChannel)
        }
    }

    companion object {
        const val CHANNEL_MANAGER_UPDATES = "channel_manager_updates"
        const val CHANNEL_WORKER_UPDATES = "channel_worker_updates"
    }
}
