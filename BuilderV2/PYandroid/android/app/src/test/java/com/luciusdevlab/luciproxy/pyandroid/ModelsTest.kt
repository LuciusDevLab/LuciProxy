package com.luciusdevlab.luciproxy.pyandroid

import com.luciusdevlab.luciproxy.pyandroid.data.models.*
import kotlinx.serialization.decodeFromString
import kotlinx.serialization.encodeToString
import kotlinx.serialization.json.Json
import org.junit.Assert.*
import org.junit.Test

class ModelsTest {

    private val json = Json { ignoreUnknownKeys = true }

    @Test
    fun testTokenVerificationResultSerialization() {
        val jsonStr = """{"success": true, "valid": true, "status": "active", "token_id": "tok_123"}"""
        val result = json.decodeFromString<TokenVerificationResult>(jsonStr)
        assertTrue(result.success)
        assertTrue(result.valid)
        assertEquals("active", result.status)
        assertEquals("tok_123", result.token_id)
    }

    @Test
    fun testAccountDetailsDtoSerialization() {
        val jsonStr = """
            {
                "success": true,
                "account_id": "acc_001",
                "analytics": {
                    "available": true,
                    "requests_num": 1500,
                    "quota_num": null,
                    "requests": "1,500",
                    "quota": "Unavailable"
                },
                "workers": [
                    {
                        "id": "worker_alpha",
                        "name": "worker_alpha",
                        "d1_bindings": [{"binding_name": "IOT_DB", "database_id": "d1_id_1"}]
                    }
                ],
                "d1_linked": [{"id": "d1_id_1", "name": "db_one", "num_tables": 4}],
                "d1_unassigned": []
            }
        """.trimIndent()

        val dto = json.decodeFromString<AccountDetailsDto>(jsonStr)
        assertTrue(dto.success)
        assertEquals("acc_001", dto.account_id)
        assertNotNull(dto.analytics)
        assertEquals("1,500", dto.analytics?.requests)
        assertEquals("Unavailable", dto.analytics?.quota)
        assertEquals(1, dto.workers.size)
        assertEquals("worker_alpha", dto.workers[0].name)
        assertEquals(1, dto.d1_linked.size)
    }

    @Test
    fun testDeploymentResultDtoSerialization() {
        val jsonStr = """
            {
                "success": true,
                "worker_name": "edge-worker-123",
                "worker_url": "https://edge-worker-123.sub.workers.dev",
                "panel_url": "https://edge-worker-123.sub.workers.dev/route-abc123/dash",
                "api_route": "/route-abc123",
                "d1_name": "d1-vault-456",
                "d1_database_id": "uuid-d1-456",
                "uuid": "master-uuid-789",
                "version": "v1.2.1"
            }
        """.trimIndent()

        val result = json.decodeFromString<DeploymentResultDto>(jsonStr)
        assertTrue(result.success)
        assertEquals("edge-worker-123", result.worker_name)
        assertEquals("https://edge-worker-123.sub.workers.dev/route-abc123/dash", result.panel_url)
        assertEquals("/route-abc123", result.api_route)
        assertEquals("uuid-d1-456", result.d1_database_id)
    }

    @Test
    fun testDeleteWorkerResultDtoSerialization() {
        val jsonStr = """{"success": true, "worker_name": "w_test", "d1_preserved": true}"""
        val result = json.decodeFromString<DeleteWorkerResultDto>(jsonStr)
        assertTrue(result.success)
        assertEquals("w_test", result.worker_name)
        assertTrue(result.d1_preserved)
    }

    @Test
    fun testGetPanelUrlHelper() {
        val url = getPanelUrl("https://my-worker.workers.dev", "/route-xyz123")
        assertEquals("https://my-worker.workers.dev/route-xyz123/dash", url)

        val urlNoHttps = getPanelUrl("my-worker.workers.dev/", "route-xyz123")
        assertEquals("https://my-worker.workers.dev/route-xyz123/dash", urlNoHttps)
    }

    @Test
    fun testAccountRecordEffectiveDisplayName() {
        val accWithoutCustom = AccountRecord(
            accountId = "acc_123",
            connectionId = "conn_123",
            accountName = "Real Cloudflare Name",
            displayName = ""
        )
        assertEquals("Real Cloudflare Name", accWithoutCustom.effectiveDisplayName)

        val accWithCustom = AccountRecord(
            accountId = "acc_123",
            connectionId = "conn_123",
            accountName = "Real Cloudflare Name",
            displayName = "My Work Account"
        )
        assertEquals("My Work Account", accWithCustom.effectiveDisplayName)
        assertEquals("Real Cloudflare Name", accWithCustom.accountName)
    }
}

