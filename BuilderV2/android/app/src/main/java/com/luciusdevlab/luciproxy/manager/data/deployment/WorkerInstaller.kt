package com.luciusdevlab.luciproxy.manager.data.deployment

import com.luciusdevlab.luciproxy.manager.data.cloudflare.CloudflareClient
import com.luciusdevlab.luciproxy.manager.data.github.WorkerSourceService
import com.luciusdevlab.luciproxy.manager.data.models.DeploymentResult
import com.luciusdevlab.luciproxy.manager.data.security.SecureCredentialStore
import kotlinx.serialization.json.*
import java.util.UUID

class WorkerInstaller(
    private val credentialStore: SecureCredentialStore,
    private val sourceService: WorkerSourceService,
    private val bundlerStrategy: WorkerBundlerStrategy = WorkerBundlerStrategy()
) {

    suspend fun createWorker(
        connectionId: String,
        accountId: String,
        workerName: String,
        d1Name: String
    ): DeploymentResult {
        val token = credentialStore.getToken(connectionId)
            ?: throw IllegalStateException("No active token found for connection $connectionId")

        val cfClient = CloudflareClient(token)

        // Step 1: Resolve Worker Source
        val signal = sourceService.fetchVersionSignal()
        val snapshot = sourceService.downloadSourceAtRevision(signal.sourceRevision)
        val pkg = bundlerStrategy.createDeploymentPackage(snapshot, signal.version)

        // Step 2: Provision D1 Database
        val d1Dto = cfClient.createD1Database(accountId, d1Name)

        // Step 3: Construct metadata with IOT_DB binding to new D1
        val metadata = buildJsonObject {
            put("main_module", pkg.mainModule)
            put("compatibility_date", pkg.compatibilityDate)
            put("compatibility_flags", buildJsonArray { pkg.compatibilityFlags.forEach { add(it) } })
            put("bindings", buildJsonArray {
                add(buildJsonObject {
                    put("type", "d1")
                    put("name", "IOT_DB")
                    put("id", d1Dto.uuid)
                })
            })
            put("observability", buildJsonObject { put("enabled", true) })
        }

        // Step 4: Upload Worker script
        cfClient.uploadWorkerMultipart(accountId, workerName, metadata.toString(), pkg.bundleCode)

        // Step 5: Seed Admin Master Key Secret
        val masterKey = UUID.randomUUID().toString()
        cfClient.putWorkerSecret(accountId, workerName, "MASTER_KEY", masterKey)

        return DeploymentResult(
            success = true,
            action = "create",
            workerName = workerName,
            workerUrl = "https://$workerName.workers.dev",
            d1DatabaseId = d1Dto.uuid,
            d1BindingName = "IOT_DB",
            workerVersion = signal.version,
            sourceRevision = signal.sourceRevision,
            masterKey = masterKey
        )
    }

    suspend fun updateWorker(
        connectionId: String,
        accountId: String,
        workerName: String,
        existingD1DatabaseId: String,
        existingD1Name: String
    ): DeploymentResult {
        val token = credentialStore.getToken(connectionId)
            ?: throw IllegalStateException("No active token found for connection $connectionId")

        require(existingD1DatabaseId.isNotBlank()) {
            "Cannot update Worker: no existing D1 database ID discovered for $workerName."
        }

        val cfClient = CloudflareClient(token)

        // Step 1: Resolve Worker Source at authoritative release commit
        val signal = sourceService.fetchVersionSignal()
        val snapshot = sourceService.downloadSourceAtRevision(signal.sourceRevision)
        val pkg = bundlerStrategy.createDeploymentPackage(snapshot, signal.version)

        // Step 2: Construct metadata preserving existing D1 database binding
        val metadata = buildJsonObject {
            put("main_module", pkg.mainModule)
            put("compatibility_date", pkg.compatibilityDate)
            put("compatibility_flags", buildJsonArray { pkg.compatibilityFlags.forEach { add(it) } })
            put("bindings", buildJsonArray {
                add(buildJsonObject {
                    put("type", "d1")
                    put("name", "IOT_DB")
                    put("id", existingD1DatabaseId)
                })
            })
            put("observability", buildJsonObject { put("enabled", true) })
        }

        // Step 3: Deploy updated Worker code in-place
        cfClient.uploadWorkerMultipart(accountId, workerName, metadata.toString(), pkg.bundleCode)

        return DeploymentResult(
            success = true,
            action = "update",
            workerName = workerName,
            workerUrl = "https://$workerName.workers.dev",
            d1DatabaseId = existingD1DatabaseId,
            d1BindingName = "IOT_DB",
            workerVersion = signal.version,
            sourceRevision = signal.sourceRevision
        )
    }
}
