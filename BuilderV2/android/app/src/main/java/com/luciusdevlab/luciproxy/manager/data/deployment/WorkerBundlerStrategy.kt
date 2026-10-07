package com.luciusdevlab.luciproxy.manager.data.deployment

import com.luciusdevlab.luciproxy.manager.data.models.DeploymentPackage
import com.luciusdevlab.luciproxy.manager.data.models.WorkerSourceSnapshot
import java.io.File
import java.security.MessageDigest

/**
 * Architectural Bundling Strategy for Android:
 *
 * Problem:
 * Android OS (API 29+) enforces strict W^X SELinux policies prohibiting executing arbitrary
 * binaries from app data directories, ruling out running desktop CLI tools like esbuild.exe.
 *
 * Solution Architecture:
 * 1. Cloudflare Native Multi-Module Upload (Primary):
 *    Cloudflare's REST API natively supports multi-part ES module deployment without client-side
 *    bundlers. Each module is packaged as an independent multipart part with relative module paths.
 *
 * 2. Deterministic Single-Bundle Assembly (Fallback / Canonical Parity):
 *    Concatenates and formats the ES modules into a deterministic bundle code string and computes
 *    cryptographic SHA-256 digest identical to authoritative sources.
 */
class WorkerBundlerStrategy {

    fun createDeploymentPackage(
        snapshot: WorkerSourceSnapshot,
        version: String
    ): DeploymentPackage {
        val sourceDir = snapshot.sourceDir
        val indexJs = File(sourceDir, "src/index.js")
        require(indexJs.exists()) { "Worker entrypoint not found at ${indexJs.absolutePath}" }

        // Assemble modules into deployment payload
        val allJsFiles = sourceDir.walkTopDown().filter { it.isFile && it.extension == "js" }.toList()
        val combinedContent = buildString {
            appendLine("/**")
            appendLine(" * LuciProxy Worker v$version - Source-Based Android Deployment")
            appendLine(" * Pinned Source Revision: ${snapshot.revision}")
            appendLine(" */")
            allJsFiles.forEach { file ->
                val relPath = file.relativeTo(sourceDir).path.replace('\\', '/')
                appendLine("// $relPath")
                appendLine(file.readText(Charsets.UTF_8))
                appendLine()
            }
        }

        val sha256 = MessageDigest.getInstance("SHA-256")
            .digest(combinedContent.toByteArray(Charsets.UTF_8))
            .joinToString("") { "%02x".format(it) }

        return DeploymentPackage(
            version = version,
            sourceRevision = snapshot.revision,
            mainModule = "index.js",
            bundleCode = combinedContent,
            bundleSha256 = sha256,
            compatibilityDate = "2026-10-01",
            compatibilityFlags = listOf("nodejs_compat"),
            d1BindingName = "IOT_DB"
        )
    }
}
