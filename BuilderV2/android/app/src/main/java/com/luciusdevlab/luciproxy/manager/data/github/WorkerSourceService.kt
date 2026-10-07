package com.luciusdevlab.luciproxy.manager.data.github

import com.luciusdevlab.luciproxy.manager.data.models.WorkerSourceSnapshot
import com.luciusdevlab.luciproxy.manager.data.models.WorkerVersionSignal
import kotlinx.serialization.json.Json
import okhttp3.OkHttpClient
import okhttp3.Request
import java.io.File
import java.io.FileOutputStream
import java.io.IOException
import java.util.zip.ZipInputStream

class SecurityException(message: String) : RuntimeException(message)

class WorkerSourceService(
    private val repoOwner: String = "LuciusDevLab",
    private val repoName: String = "LuciProxy",
    private val cacheDir: File,
    private val client: OkHttpClient = OkHttpClient()
) {
    private val json = Json { ignoreUnknownKeys = true }
    private val sha40Pattern = Regex("^[0-9a-fA-F]{40}$")

    val requiredFiles = listOf(
        "src/index.js",
        "src/config.js",
        "src/db/d1.js",
        "src/assets/loaders.js",
        "package.json"
    )

    fun validateSourceRevision(revision: String?): Boolean {
        if (revision.isNullOrBlank()) return false
        return sha40Pattern.matches(revision.trim())
    }

    suspend fun fetchVersionSignal(ref: String = "main"): WorkerVersionSignal {
        val url = "https://raw.githubusercontent.com/$repoOwner/$repoName/$ref/version.json"
        val request = Request.Builder()
            .url(url)
            .header("User-Agent", "LuciProxy-Manager-Android/2.0")
            .build()

        val response = client.newCall(request).execute()
        if (!response.isSuccessful) {
            throw IOException("Failed to fetch Worker version signal from $url (HTTP ${response.code})")
        }

        val body = response.body?.string() ?: throw IOException("Empty version.json response")
        val signal = json.decodeFromString<WorkerVersionSignal>(body)

        if (!validateSourceRevision(signal.sourceRevision)) {
            throw IllegalArgumentException(
                "Authoritative Worker version signal declares invalid source_revision: '${signal.sourceRevision}'. Must be a 40-character hexadecimal Git commit SHA."
            )
        }

        return signal
    }

    fun validateSourceTree(sourceDir: File): Pair<Boolean, List<String>> {
        val missing = mutableListOf<String>()
        for (req in requiredFiles) {
            val file = File(sourceDir, req)
            if (!file.exists()) {
                missing.add(req)
            }
        }
        return Pair(missing.isEmpty(), missing)
    }

    suspend fun downloadSourceAtRevision(
        sourceRevision: String,
        forceRedownload: Boolean = false
    ): WorkerSourceSnapshot {
        val cleanRev = sourceRevision.trim().lowercase()
        if (!validateSourceRevision(cleanRev)) {
            throw IllegalArgumentException("Invalid Worker source revision: '$sourceRevision'. Must be a 40-character hex commit SHA.")
        }

        val targetDir = File(cacheDir, "$cleanRev/LuciProxy")
        if (!forceRedownload && targetDir.exists()) {
            val (isValid, _) = validateSourceTree(targetDir)
            if (isValid) {
                val fileCount = targetDir.walkTopDown().filter { it.isFile }.count()
                return WorkerSourceSnapshot(
                    revision = cleanRev,
                    sourceDir = targetDir,
                    fileCount = fileCount,
                    isValid = true
                )
            }
        }

        val url = "https://api.github.com/repos/$repoOwner/$repoName/zipball/$cleanRev"
        val request = Request.Builder()
            .url(url)
            .header("User-Agent", "LuciProxy-Manager-Android/2.0")
            .header("Accept", "application/vnd.github+json")
            .build()

        val response = client.newCall(request).execute()
        if (!response.isSuccessful) {
            throw IOException("Failed to download Worker source archive for $cleanRev (HTTP ${response.code})")
        }

        targetDir.mkdirs()

        val bodyStream = response.body?.byteStream() ?: throw IOException("Empty archive stream")
        var extractedCount = 0

        ZipInputStream(bodyStream).use { zis ->
            var entry = zis.nextEntry
            var targetPrefix = ""

            while (entry != null) {
                if (targetPrefix.isEmpty() && entry.name.contains("/LuciProxy/")) {
                    val rootDir = entry.name.substringBefore('/')
                    targetPrefix = "$rootDir/LuciProxy/"
                }

                if (targetPrefix.isNotEmpty() && entry.name.startsWith(targetPrefix) && !entry.isDirectory) {
                    val relPath = entry.name.removePrefix(targetPrefix)
                    val outFile = File(targetDir, relPath)

                    // Strict Zip-Slip Protection
                    val canonicalDest = targetDir.canonicalPath
                    val canonicalOut = outFile.canonicalPath
                    if (!canonicalOut.startsWith(canonicalDest)) {
                        throw SecurityException("Zip-Slip directory traversal detected in member: ${entry.name}")
                    }

                    outFile.parentFile?.mkdirs()
                    FileOutputStream(outFile).use { fos ->
                        zis.copyTo(fos)
                    }
                    extractedCount++
                }
                zis.closeEntry()
                entry = zis.nextEntry
            }
        }

        val (isValid, missing) = validateSourceTree(targetDir)
        if (!isValid) {
            throw IllegalStateException("Extracted Worker source tree failed validation. Missing: $missing")
        }

        return WorkerSourceSnapshot(
            revision = cleanRev,
            sourceDir = targetDir,
            fileCount = extractedCount,
            isValid = true
        )
    }
}
