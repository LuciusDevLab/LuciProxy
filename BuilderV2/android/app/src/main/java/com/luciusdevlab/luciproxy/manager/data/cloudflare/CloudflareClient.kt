package com.luciusdevlab.luciproxy.manager.data.cloudflare

import com.luciusdevlab.luciproxy.manager.data.models.AccountRecord
import com.luciusdevlab.luciproxy.manager.data.models.D1DatabaseDto
import com.luciusdevlab.luciproxy.manager.data.models.WorkerSummaryDto
import kotlinx.serialization.json.*
import okhttp3.*
import okhttp3.MediaType.Companion.toMediaType
import okhttp3.RequestBody.Companion.toRequestBody
import java.io.IOException

class CloudflareException(val statusCode: Int, message: String) : RuntimeException(message)

class CloudflareClient(
    private val token: String,
    private val client: OkHttpClient = OkHttpClient()
) {
    private val json = Json { ignoreUnknownKeys = true }
    private val baseUrl = "https://api.cloudflare.com/client/v4"

    private fun newRequestBuilder(endpoint: String): Request.Builder {
        return Request.Builder()
            .url("$baseUrl$endpoint")
            .header("Authorization", "Bearer $token")
            .header("User-Agent", "LuciProxy-Manager-Android/2.0")
            .header("Accept", "application/json")
    }

    suspend fun verifyToken(): Boolean {
        val request = newRequestBuilder("/user/tokens/verify").get().build()
        val response = client.newCall(request).execute()
        return response.isSuccessful
    }

    suspend fun discoverAccounts(): List<AccountRecord> {
        val request = newRequestBuilder("/accounts").get().build()
        val response = client.newCall(request).execute()
        if (!response.isSuccessful) {
            throw CloudflareException(response.code, "Failed to fetch accounts (HTTP ${response.code})")
        }

        val body = response.body?.string() ?: return emptyList()
        val root = json.parseToJsonElement(body).jsonObject
        val result = root["result"]?.jsonArray ?: return emptyList()

        return result.map { elem ->
            val obj = elem.jsonObject
            AccountRecord(
                accountId = obj["id"]?.jsonPrimitive?.content ?: "",
                connectionId = "",
                accountName = obj["name"]?.jsonPrimitive?.content ?: "Cloudflare Account"
            )
        }
    }

    suspend fun listWorkers(accountId: String): List<WorkerSummaryDto> {
        val request = newRequestBuilder("/accounts/$accountId/workers/scripts").get().build()
        val response = client.newCall(request).execute()
        if (!response.isSuccessful) return emptyList()

        val body = response.body?.string() ?: return emptyList()
        val root = json.parseToJsonElement(body).jsonObject
        val result = root["result"]?.jsonArray ?: return emptyList()

        return result.map { elem ->
            val obj = elem.jsonObject
            WorkerSummaryDto(
                id = obj["id"]?.jsonPrimitive?.content ?: "",
                etag = obj["etag"]?.jsonPrimitive?.content,
                modifiedOn = obj["modified_on"]?.jsonPrimitive?.content
            )
        }
    }

    suspend fun createD1Database(accountId: String, name: String): D1DatabaseDto {
        val payload = buildJsonObject { put("name", name) }
        val body = payload.toString().toRequestBody("application/json".toMediaType())
        val request = newRequestBuilder("/accounts/$accountId/d1/database").post(body).build()

        val response = client.newCall(request).execute()
        if (!response.isSuccessful) {
            throw CloudflareException(response.code, "Failed to create D1 database '$name'")
        }

        val respBody = response.body?.string() ?: throw IOException("Empty D1 response")
        val result = json.parseToJsonElement(respBody).jsonObject["result"]?.jsonObject
            ?: throw IOException("Missing result in D1 creation response")

        return D1DatabaseDto(
            uuid = result["uuid"]?.jsonPrimitive?.content ?: "",
            name = result["name"]?.jsonPrimitive?.content ?: name
        )
    }

    suspend fun uploadWorkerMultipart(
        accountId: String,
        workerName: String,
        metadataJson: String,
        bundleCode: String
    ) {
        val multipartBody = MultipartBody.Builder()
            .setType(MultipartBody.FORM)
            .addFormDataPart(
                "metadata",
                null,
                metadataJson.toRequestBody("application/json".toMediaType())
            )
            .addFormDataPart(
                "index.js",
                "index.js",
                bundleCode.toRequestBody("application/javascript+module".toMediaType())
            )
            .build()

        val request = newRequestBuilder("/accounts/$accountId/workers/scripts/$workerName")
            .put(multipartBody)
            .build()

        val response = client.newCall(request).execute()
        if (!response.isSuccessful) {
            throw CloudflareException(response.code, "Worker upload failed with HTTP ${response.code}")
        }
    }

    suspend fun putWorkerSecret(
        accountId: String,
        workerName: String,
        secretName: String,
        secretText: String
    ) {
        val payload = buildJsonObject {
            put("name", secretName)
            put("text", secretText)
            put("type", "secret_text")
        }
        val body = payload.toString().toRequestBody("application/json".toMediaType())
        val request = newRequestBuilder("/accounts/$accountId/workers/scripts/$workerName/secrets")
            .put(body)
            .build()

        val response = client.newCall(request).execute()
        if (!response.isSuccessful) {
            throw CloudflareException(response.code, "Failed to set Worker secret '$secretName'")
        }
    }
}
