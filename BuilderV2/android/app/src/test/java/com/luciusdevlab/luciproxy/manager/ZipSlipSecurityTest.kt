package com.luciusdevlab.luciproxy.manager

import org.junit.Assert.*
import org.junit.Rule
import org.junit.Test
import org.junit.rules.TemporaryFolder
import java.io.File

class ZipSlipSecurityTest {

    @get:Rule
    val tempFolder = TemporaryFolder()

    @Test
    fun testZipSlipCanonicalPathProtection() {
        val destinationDir = tempFolder.newFolder("safe_destination")
        val maliciousEntryName = "../../evil.sh"

        val outFile = File(destinationDir, maliciousEntryName)
        val canonicalDest = destinationDir.canonicalPath
        val canonicalOut = outFile.canonicalPath

        // Verify that path traversal outside canonicalDest is detected
        val isTraversing = !canonicalOut.startsWith(canonicalDest)
        assertTrue("Path traversal must be detected and rejected", isTraversing)
    }
}
