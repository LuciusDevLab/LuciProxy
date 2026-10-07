package com.luciusdevlab.luciproxy.manager.data.security

import android.content.Context
import android.content.SharedPreferences
import androidx.security.crypto.EncryptedSharedPreferences
import androidx.security.crypto.MasterKey

private const val SECURE_PREFS_NAME = "luciproxy_secure_keystore_prefs"
private const val TOKEN_KEY_PREFIX = "cf_token_"

interface SecureCredentialStore {
    fun saveToken(connectionId: String, token: String)
    fun getToken(connectionId: String): String?
    fun deleteToken(connectionId: String): Boolean
    fun deleteAllTokens(): Int
    fun hasToken(connectionId: String): Boolean = getToken(connectionId) != null
}

class AndroidKeystoreCredentialStore(context: Context) : SecureCredentialStore {

    private val prefs: SharedPreferences by lazy {
        try {
            val masterKey = MasterKey.Builder(context)
                .setKeyScheme(MasterKey.KeyScheme.AES256_GCM)
                .build()

            EncryptedSharedPreferences.create(
                context,
                SECURE_PREFS_NAME,
                masterKey,
                EncryptedSharedPreferences.PrefKeyEncryptionScheme.AES256_SIV,
                EncryptedSharedPreferences.PrefValueEncryptionScheme.AES256_GCM
            )
        } catch (e: Exception) {
            // Graceful fallback to private mode preferences if Keystore unavailable in emulator
            context.getSharedPreferences(SECURE_PREFS_NAME, Context.MODE_PRIVATE)
        }
    }

    override fun saveToken(connectionId: String, token: String) {
        val clean = token.trim()
        require(clean.isNotEmpty()) { "Cannot save empty token." }
        prefs.edit().putString(TOKEN_KEY_PREFIX + connectionId, clean).apply()
    }

    override fun getToken(connectionId: String): String? {
        return prefs.getString(TOKEN_KEY_PREFIX + connectionId, null)
    }

    override fun deleteToken(connectionId: String): Boolean {
        val key = TOKEN_KEY_PREFIX + connectionId
        return if (prefs.contains(key)) {
            prefs.edit().remove(key).apply()
            true
        } else {
            false
        }
    }

    override fun deleteAllTokens(): Int {
        val allKeys = prefs.all.keys.filter { it.startsWith(TOKEN_KEY_PREFIX) }
        val editor = prefs.edit()
        allKeys.forEach { editor.remove(it) }
        editor.apply()
        return allKeys.size
    }
}

class InMemoryCredentialStore : SecureCredentialStore {
    private val tokens = mutableMapOf<String, String>()

    override fun saveToken(connectionId: String, token: String) {
        val clean = token.trim()
        require(clean.isNotEmpty()) { "Cannot save empty token." }
        tokens[connectionId] = clean
    }

    override fun getToken(connectionId: String): String? = tokens[connectionId]

    override fun deleteToken(connectionId: String): Boolean = tokens.remove(connectionId) != null

    override fun deleteAllTokens(): Int {
        val count = tokens.size
        tokens.clear()
        return count
    }
}
