package com.luciusdevlab.luciproxy.pyandroid

import android.app.Application
import com.chaquo.python.Python
import com.chaquo.python.android.AndroidPlatform
import com.luciusdevlab.luciproxy.pyandroid.bridge.ChaquopyBridgeClient
import com.luciusdevlab.luciproxy.pyandroid.bridge.PythonBridge
import com.luciusdevlab.luciproxy.pyandroid.data.security.AndroidKeystoreCredentialStore
import com.luciusdevlab.luciproxy.pyandroid.data.security.SecureCredentialStore
import com.luciusdevlab.luciproxy.pyandroid.data.storage.LocalRepository

class PyAndroidApplication : Application() {

    lateinit var localRepository: LocalRepository
        private set

    lateinit var credentialStore: SecureCredentialStore
        private set

    lateinit var pythonBridge: PythonBridge
        private set

    override fun onCreate() {
        super.onCreate()

        // 1. Initialize Chaquopy Python Runtime
        if (!Python.isStarted()) {
            Python.start(AndroidPlatform(this))
        }

        // 2. Initialize Core Subsystems
        localRepository = LocalRepository(filesDir)
        credentialStore = AndroidKeystoreCredentialStore(this)
        pythonBridge = ChaquopyBridgeClient()
    }
}
