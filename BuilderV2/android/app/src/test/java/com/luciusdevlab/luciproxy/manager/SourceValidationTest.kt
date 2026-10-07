package com.luciusdevlab.luciproxy.manager

import com.luciusdevlab.luciproxy.manager.data.github.WorkerSourceService
import org.junit.Assert.*
import org.junit.Rule
import org.junit.Test
import org.junit.rules.TemporaryFolder
import java.io.File

class SourceValidationTest {

    @get:Rule
    val tempFolder = TemporaryFolder()

    @Test
    fun testValidateSourceTreeDetectsCompleteAndMissingFiles() {
        val root = tempFolder.newFolder("LuciProxy")
        val service = WorkerSourceService(cacheDir = tempFolder.newFolder("cache"))

        // Initially empty
        val (emptyValid, missingFiles) = service.validateSourceTree(root)
        assertFalse(emptyValid)
        assertEquals(service.requiredFiles.size, missingFiles.size)

        // Populate valid tree
        File(root, "src/db").mkdirs()
        File(root, "src/assets").mkdirs()
        File(root, "src/index.js").writeText("export default {};")
        File(root, "src/config.js").writeText("export const V = '1.2.1';")
        File(root, "src/db/d1.js").writeText("export const db = 1;")
        File(root, "src/assets/loaders.js").writeText("export const l = 1;")
        File(root, "package.json").writeText("{\"name\":\"luciproxy\"}")

        val (valid, missing) = service.validateSourceTree(root)
        assertTrue(valid)
        assertTrue(missing.isEmpty())
    }
}
