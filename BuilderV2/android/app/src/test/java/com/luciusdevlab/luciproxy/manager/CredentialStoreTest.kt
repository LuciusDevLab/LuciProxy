package com.luciusdevlab.luciproxy.manager

import com.luciusdevlab.luciproxy.manager.data.security.InMemoryCredentialStore
import org.junit.Assert.*
import org.junit.Test

class CredentialStoreTest {

    @Test
    fun testSaveAndRetrieveToken() {
        val store = InMemoryCredentialStore()
        store.saveToken("conn-1", "test-token-secret")

        assertTrue(store.hasToken("conn-1"))
        assertEquals("test-token-secret", store.getToken("conn-1"))
    }

    @Test
    fun testRejectsEmptyToken() {
        val store = InMemoryCredentialStore()
        assertThrows(IllegalArgumentException::class.java) {
            store.saveToken("conn-1", "   ")
        }
    }

    @Test
    fun testDeleteAndPurgeTokens() {
        val store = InMemoryCredentialStore()
        store.saveToken("conn-1", "token-1")
        store.saveToken("conn-2", "token-2")

        assertTrue(store.deleteToken("conn-1"))
        assertFalse(store.hasToken("conn-1"))
        assertTrue(store.hasToken("conn-2"))

        val purged = store.deleteAllTokens()
        assertEquals(1, purged)
        assertFalse(store.hasToken("conn-2"))
    }
}
