/**
 * LuciProxy - Cryptographic Primitives & Identifier Management
 * Clean-room implementation of FIPS 180-4 SHA-224, UTF-8 Base64, and composite UUIDs.
 *
 * Independent implementation authored specifically for LuciProxy.
 */

// Round constants defined in FIPS PUB 180-4 Section 4.2.2
const SHA256_K = new Uint32Array([
    0x428a2f98, 0x71374491, 0xb5c0fbcf, 0xe9b5dba5, 0x3956c25b, 0x59f111f1, 0x923f82a4, 0xab1c5ed5,
    0xd807aa98, 0x12835b01, 0x243185be, 0x550c7dc3, 0x72be5d74, 0x80deb1fe, 0x9bdc06a7, 0xc19bf174,
    0xe49b69c1, 0xefbe4786, 0x0fc19dc6, 0x240ca1cc, 0x2de92c6f, 0x4a7484aa, 0x5cb0a9dc, 0x76f988da,
    0x983e5152, 0xa831c66d, 0xb00327c8, 0xbf597fc7, 0xc6e00bf3, 0xd5a79147, 0x06ca6351, 0x14292967,
    0x27b70a85, 0x2e1b2138, 0x4d2c6dfc, 0x53380d13, 0x650a7354, 0x766a0abb, 0x81c2c92e, 0x92722c85,
    0xa2bfe8a1, 0xa81a664b, 0xc24b8b70, 0xc76c51a3, 0xd192e819, 0xd6990624, 0xf40e3585, 0x106aa070,
    0x19a4c116, 0x1e376c08, 0x2748774c, 0x34b0bcb5, 0x391c0cb3, 0x4ed8aa4a, 0x5b9cca4f, 0x682e6ff3,
    0x748f82ee, 0x78a5636f, 0x84c87814, 0x8cc70208, 0x90befffa, 0xa4506ceb, 0xbef9a3f7, 0xc67178f2
]);

/**
 * Computes the 56-character lowercase hexadecimal SHA-224 digest for a string according to FIPS 180-4.
 * @param {string} input Plaintext string
 * @returns {string} 56-character hex digest
 */
export function sha224Hex(input) {
    const rawBytes = new TextEncoder().encode(input || "");
    const bitLen = rawBytes.length * 8;

    // Pad message to 512-bit (64-byte) multiple: append 0x80, zeros, and 64-bit length
    const totalBytes = ((rawBytes.length + 8 + 64) >> 6) << 6;
    const padded = new Uint8Array(totalBytes);
    padded.set(rawBytes);
    padded[rawBytes.length] = 0x80;

    // Big-endian 64-bit length at end
    const view = new DataView(padded.buffer);
    view.setUint32(totalBytes - 4, bitLen >>> 0, false);
    view.setUint32(totalBytes - 8, Math.floor(bitLen / 0x100000000) >>> 0, false);

    // Initial hash values for SHA-224 (FIPS 180-4 Section 5.3.2)
    let h0 = 0xc1059ed8;
    let h1 = 0x367cd507;
    let h2 = 0x3070dd17;
    let h3 = 0xf70e5939;
    let h4 = 0xffc00b31;
    let h5 = 0x68581511;
    let h6 = 0x64f98fa7;
    let h7 = 0xbefa4fa4;

    const w = new Uint32Array(64);

    for (let offset = 0; offset < totalBytes; offset += 64) {
        for (let i = 0; i < 16; i++) {
            w[i] = view.getUint32(offset + i * 4, false);
        }
        for (let i = 16; i < 64; i++) {
            const s0 = ((w[i - 15] >>> 7) | (w[i - 15] << 25)) ^
                       ((w[i - 15] >>> 18) | (w[i - 15] << 14)) ^
                       (w[i - 15] >>> 3);
            const s1 = ((w[i - 2] >>> 17) | (w[i - 2] << 15)) ^
                       ((w[i - 2] >>> 19) | (w[i - 2] << 13)) ^
                       (w[i - 2] >>> 10);
            w[i] = (w[i - 16] + s0 + w[i - 7] + s1) >>> 0;
        }

        let a = h0, b = h1, c = h2, d = h3, e = h4, f = h5, g = h6, h = h7;

        for (let i = 0; i < 64; i++) {
            const sum1 = ((e >>> 6) | (e << 26)) ^ ((e >>> 11) | (e << 21)) ^ ((e >>> 25) | (e << 7));
            const ch = (e & f) ^ (~e & g);
            const temp1 = (h + sum1 + ch + SHA256_K[i] + w[i]) >>> 0;
            const sum0 = ((a >>> 2) | (a << 30)) ^ ((a >>> 13) | (a << 19)) ^ ((a >>> 22) | (a << 10));
            const maj = (a & b) ^ (a & c) ^ (b & c);
            const temp2 = (sum0 + maj) >>> 0;

            h = g;
            g = f;
            f = e;
            e = (d + temp1) >>> 0;
            d = c;
            c = b;
            b = a;
            a = (temp1 + temp2) >>> 0;
        }

        h0 = (h0 + a) >>> 0;
        h1 = (h1 + b) >>> 0;
        h2 = (h2 + c) >>> 0;
        h3 = (h3 + d) >>> 0;
        h4 = (h4 + e) >>> 0;
        h5 = (h5 + f) >>> 0;
        h6 = (h6 + g) >>> 0;
        h7 = (h7 + h) >>> 0;
    }

    // SHA-224 output truncates h0 through h6 (FIPS 180-4 Section 6.3.2)
    const outWords = [h0, h1, h2, h3, h4, h5, h6];
    return outWords.map(val => val.toString(16).padStart(8, "0")).join("");
}

// Memory cache for Trojan profile hashes
const trojanCache = new Map();

/**
 * Returns cached SHA-224 hash for Trojan authentication.
 * @param {string} uuid User or profile UUID
 * @returns {string} 56-character hex hash
 */
export function getTrojanHash(uuid) {
    if (!uuid) return "";
    let hash = trojanCache.get(uuid);
    if (!hash) {
        hash = sha224Hex(uuid);
        trojanCache.set(uuid, hash);
    }
    return hash;
}

/**
 * Encodes string to Base64 safely preserving UTF-8 multi-byte sequences.
 * @param {string} str Plaintext string
 * @returns {string} Base64 encoded string
 */
export function safeBtoa(str) {
    try {
        const bytes = new TextEncoder().encode(str);
        let binStr = "";
        const len = bytes.length;
        for (let i = 0; i < len; i++) {
            binStr += String.fromCharCode(bytes[i]);
        }
        return btoa(binStr);
    } catch {
        return btoa(unescape(encodeURIComponent(str)));
    }
}

/**
 * Decodes Base64 string safely restoring UTF-8 multi-byte characters.
 * @param {string} b64 Base64 encoded string
 * @returns {string} Decoded UTF-8 string
 */
export function safeAtob(b64) {
    try {
        const binStr = atob(b64);
        const bytes = new Uint8Array(binStr.length);
        for (let i = 0; i < binStr.length; i++) {
            bytes[i] = binStr.charCodeAt(i);
        }
        return new TextDecoder().decode(bytes);
    } catch {
        return atob(b64);
    }
}

/**
 * Synthesizes a deterministic pseudo-hardware identifier UUID from a seed string.
 * @param {string} seed Seed phrase
 * @returns {string} UUID formatted identifier
 */
export function generateHardwareId(seed = "sync") {
    const raw = Array.from(new TextEncoder().encode(seed))
        .map(b => b.toString(16).padStart(2, "0"))
        .join("")
        .slice(0, 20)
        .padEnd(20, "0");
    return `${raw.slice(0, 8)}-0000-4000-8000-${raw.slice(-12)}`;
}

/**
 * Encodes an upstream relay index into a 32-character composite UUID.
 * @param {string} baseUuid Base client UUID
 * @param {number} relayIndex Numeric relay index
 * @returns {string} Standard composite UUID
 */
export function generateConfigUuid(baseUuid, relayIndex = 0) {
    const cleanBase = String(baseUuid).replace(/-/g, "").toLowerCase().slice(0, 24).padEnd(24, "0");
    const relayHex = (Number(relayIndex) || 0).toString(16).padStart(8, "0");
    const full = cleanBase + relayHex;
    return `${full.slice(0, 8)}-${full.slice(8, 12)}-${full.slice(12, 16)}-${full.slice(16, 20)}-${full.slice(20, 32)}`;
}

/**
 * Decodes user fingerprint and relay index from a composite configuration UUID.
 * @param {string} compositeUuid 32-character UUID string
 * @returns {{userFingerprint: string, relayIpIndex: number}|null}
 */
export function decodeConfigUuid(compositeUuid) {
    const clean = (compositeUuid || "").replace(/-/g, "").toLowerCase();
    if (clean.length !== 32) return null;
    const userFingerprint = clean.slice(0, 24);
    const relayIpIndex = parseInt(clean.slice(24, 32), 16);
    return {
        userFingerprint,
        relayIpIndex: isNaN(relayIpIndex) ? 0 : relayIpIndex
    };
}

/**
 * Generates an administrative API key with metadata.
 * @param {string} [name] Human-readable identifier
 * @returns {{id: string, name: string, key: string, createdAt: number, lastUsed: null}}
 */
export function generateApiKey(name = "Default API Key") {
    const id = crypto.randomUUID ? crypto.randomUUID() : `key_${Date.now()}`;
    const token = `luci_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 10)}`;
    return {
        id,
        name,
        key: token,
        createdAt: Date.now(),
        lastUsed: null
    };
}
