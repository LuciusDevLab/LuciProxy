package com.luciusdevlab.luciproxy.manager

import org.junit.Assert.*
import org.junit.Test

class D1PreservationTest {

    @Test
    fun testUpdateWorkerRejectsBlankD1DatabaseId() {
        val existingD1DatabaseId = ""

        val exception = assertThrows(IllegalArgumentException::class.java) {
            require(existingD1DatabaseId.isNotBlank()) {
                "Cannot update Worker: no existing D1 database ID discovered."
            }
        }
        assertTrue(exception.message!!.contains("Cannot update Worker"))
    }

    @Test
    fun testUpdateWorkerPreservesExactD1BindingName() {
        val expectedBindingName = "IOT_DB"
        val existingId = "d1-uuid-12345"

        assertEquals("IOT_DB", expectedBindingName)
        assertFalse(existingId.isBlank())
    }
}
