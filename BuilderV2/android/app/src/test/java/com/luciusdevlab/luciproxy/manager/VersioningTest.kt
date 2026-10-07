package com.luciusdevlab.luciproxy.manager

import com.luciusdevlab.luciproxy.manager.data.github.WorkerSourceService
import com.luciusdevlab.luciproxy.manager.data.models.WorkerVersionSignal
import kotlinx.serialization.json.Json
import org.junit.Assert.*
import org.junit.Test
import java.io.File

class VersioningTest {

    private val service = WorkerSourceService(cacheDir = File("build/tmp/test_cache"))

    @Test
    fun testValidateSourceRevisionAccepts40Hex() {
        val validSha = "3aafad12745c59a849610d603fc22b22f656ac36"
        assertTrue(service.validateSourceRevision(validSha))
        assertTrue(service.validateSourceRevision(validSha.uppercase()))
    }

    @Test
    fun testValidateSourceRevisionRejectsInvalidFormats() {
        assertFalse(service.validateSourceRevision(null))
        assertFalse(service.validateSourceRevision(""))
        assertFalse(service.validateSourceRevision("main"))
        assertFalse(service.validateSourceRevision("worker-v1.2.1"))
        assertFalse(service.validateSourceRevision("WORKTREE-UNCOMMITTED"))
        assertFalse(service.validateSourceRevision("3aafad12745c59a849610d603fc22b22f656ac3")) // 39 chars
        assertFalse(service.validateSourceRevision("3aafad12745c59a849610d603fc22b22f656ac366")) // 41 chars
    }

    @Test
    fun testParseWorkerVersionSignal() {
        val jsonStr = """
            {
              "version": "1.2.1",
              "source_revision": "3aafad12745c59a849610d603fc22b22f656ac36",
              "repo_url": "https://github.com/LuciusDevLab/LuciProxy"
            }
        """.trimIndent()

        val json = Json { ignoreUnknownKeys = true }
        val signal = json.decodeFromString<WorkerVersionSignal>(jsonStr)

        assertEquals("1.2.1", signal.version)
        assertEquals("3aafad12745c59a849610d603fc22b22f656ac36", signal.sourceRevision)
        assertTrue(service.validateSourceRevision(signal.sourceRevision))
    }
}
