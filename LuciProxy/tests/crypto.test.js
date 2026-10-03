/*
 * Automated tests for LuciProxy cryptographic and hashing utilities
 */

import test from "node:test";
import assert from "node:assert/strict";
import {
    sha224Hex,
    getTrojanHash,
    safeBtoa,
    safeAtob,
    generateHardwareId,
    generateConfigUuid,
    decodeConfigUuid,
    generateApiKey,
} from "../src/utils/crypto.js";

test("sha224Hex produces correct 56-character hex hash", () => {
    // Test with empty string
    const emptyHash = sha224Hex("");
    assert.equal(emptyHash.length, 56);
    assert.equal(emptyHash, "d14a028c2a3a2bc9476102bb288234c415a2b01f828ea62ac5b3e42f");

    // Test with known input
    const testHash = sha224Hex("admin");
    assert.equal(testHash.length, 56);
    assert.equal(typeof testHash, "string");
    assert.match(testHash, /^[0-9a-f]{56}$/);

    // Test with UUID
    const uuid = "e10adc39-49ba-42e8-98e7-6a9786a34512";
    const uuidHash = sha224Hex(uuid);
    assert.equal(uuidHash.length, 56);
});

test("getTrojanHash caches hashes for identity", () => {
    const uuid = "3700d89e-9ca0-4cef-8556-059ef08e4d68";
    const h1 = getTrojanHash(uuid);
    const h2 = getTrojanHash(uuid);
    assert.equal(h1, h2);
    assert.equal(h1.length, 56);
});

test("safeBtoa and safeAtob handle UTF-8 and special characters safely", () => {
    const text = "Hello World! سلام دنیا 🚀 123";
    const encoded = safeBtoa(text);
    assert.equal(typeof encoded, "string");
    const decoded = safeAtob(encoded);
    assert.equal(decoded, text);
});

test("generateHardwareId returns valid UUID format", () => {
    const hwid = generateHardwareId("sync");
    assert.match(hwid, /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/);
});

test("generateConfigUuid and decodeConfigUuid round-trip properly", () => {
    const baseUuid = "e10adc39-49ba-42e8-98e7-6a9786a34512";
    const relayIndex = 5;

    const compositeUuid = generateConfigUuid(baseUuid, relayIndex);
    assert.match(compositeUuid, /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/);

    const decoded = decodeConfigUuid(compositeUuid);
    assert.ok(decoded);
    assert.equal(decoded.relayIpIndex, relayIndex);
    assert.equal(baseUuid.replace(/-/g, "").toLowerCase().startsWith(decoded.userFingerprint), true);
});

test("generateApiKey returns properly structured key object", () => {
    const keyObj = generateApiKey("My Key");
    assert.ok(keyObj.id);
    assert.equal(keyObj.name, "My Key");
    assert.ok(keyObj.key.startsWith("luci_"));
    assert.ok(keyObj.createdAt <= Date.now());
});
