import { test } from "node:test";
import assert from "node:assert/strict";
import { parseVlessHeader } from "../src/protocols/vless.js";
import { parseTrojanHeader } from "../src/protocols/trojan.js";

/**
 * Helper to construct a VLESS request packet buffer.
 */
function buildVlessBuffer({
    version = 0x00,
    uuidHex = "00112233445566778899aabbccddeeff",
    addons = new Uint8Array(0),
    command = 0x01, // TCP
    port = 443,
    addressType = 0x01, // 1: IPv4, 2: Domain, 3: IPv6
    address = "1.2.3.4",
    payload = new Uint8Array([0xde, 0xad, 0xbe, 0xef])
} = {}) {
    const parts = [];

    // Version (1 byte)
    parts.push(new Uint8Array([version]));

    // UUID (16 bytes)
    const uuidBytes = new Uint8Array(16);
    for (let i = 0; i < 16; i++) {
        uuidBytes[i] = parseInt(uuidHex.substr(i * 2, 2), 16);
    }
    parts.push(uuidBytes);

    // Addons length (1 byte) + addons
    parts.push(new Uint8Array([addons.length]));
    if (addons.length > 0) parts.push(addons);

    // Command (1 byte)
    parts.push(new Uint8Array([command]));

    // Port (2 bytes, big endian)
    const portBuf = new Uint8Array(2);
    new DataView(portBuf.buffer).setUint16(0, port);
    parts.push(portBuf);

    // Address Type + Address
    parts.push(new Uint8Array([addressType]));
    if (addressType === 0x01) {
        // IPv4 (4 bytes)
        const ipParts = address.split(".").map(Number);
        parts.push(new Uint8Array(ipParts));
    } else if (addressType === 0x02) {
        // Domain (1 byte length + ASCII bytes)
        const enc = new TextEncoder().encode(address);
        parts.push(new Uint8Array([enc.length]));
        parts.push(enc);
    } else if (addressType === 0x03) {
        // IPv6 (16 bytes)
        const hexSegments = address.split(":");
        const dv = new DataView(new ArrayBuffer(16));
        for (let i = 0; i < 8; i++) {
            dv.setUint16(i * 2, parseInt(hexSegments[i] || "0", 16));
        }
        parts.push(new Uint8Array(dv.buffer));
    }

    // Payload
    if (payload.length > 0) parts.push(payload);

    // Total length
    const totalLen = parts.reduce((acc, p) => acc + p.byteLength, 0);
    const combined = new Uint8Array(totalLen);
    let offset = 0;
    for (const p of parts) {
        combined.set(p, offset);
        offset += p.byteLength;
    }

    return combined.buffer;
}

/**
 * Helper to construct a Trojan request packet buffer.
 */
function buildTrojanBuffer({
    hashHex = "a".repeat(56),
    command = 0x01, // 0x01: TCP, 0x03: UDP
    addressType = 0x01, // 1: IPv4, 3: Domain, 4: IPv6
    address = "8.8.8.8",
    port = 80,
    hasTrailingCrlf = true,
    payload = new Uint8Array([0x01, 0x02, 0x03])
} = {}) {
    const parts = [];

    // SHA-224 hash (56 bytes string) + CRLF
    parts.push(new TextEncoder().encode(hashHex + "\r\n"));

    // Command (1 byte)
    parts.push(new Uint8Array([command]));

    // Address Type (1 byte)
    parts.push(new Uint8Array([addressType]));

    // Address
    if (addressType === 0x01) {
        const ipParts = address.split(".").map(Number);
        parts.push(new Uint8Array(ipParts));
    } else if (addressType === 0x03) {
        const enc = new TextEncoder().encode(address);
        parts.push(new Uint8Array([enc.length]));
        parts.push(enc);
    } else if (addressType === 0x04) {
        const hexSegments = address.split(":");
        const dv = new DataView(new ArrayBuffer(16));
        for (let i = 0; i < 8; i++) {
            dv.setUint16(i * 2, parseInt(hexSegments[i] || "0", 16));
        }
        parts.push(new Uint8Array(dv.buffer));
    }

    // Port (2 bytes, big endian)
    const portBuf = new Uint8Array(2);
    new DataView(portBuf.buffer).setUint16(0, port);
    parts.push(portBuf);

    // Trailing CRLF
    if (hasTrailingCrlf) {
        parts.push(new Uint8Array([0x0d, 0x0a]));
    }

    // Payload
    if (payload.length > 0) parts.push(payload);

    const totalLen = parts.reduce((acc, p) => acc + p.byteLength, 0);
    const combined = new Uint8Array(totalLen);
    let offset = 0;
    for (const p of parts) {
        combined.set(p, offset);
        offset += p.byteLength;
    }

    return combined.buffer;
}

test("VLESS - parse valid IPv4 packet", () => {
    const uuidHex = "00112233445566778899aabbccddeeff";
    const buf = buildVlessBuffer({
        uuidHex,
        port: 443,
        addressType: 0x01,
        address: "192.168.1.100",
        command: 0x01
    });

    const parsed = parseVlessHeader(buf);
    assert.equal(parsed.hasError, false);
    assert.equal(parsed.clientUuidHex, uuidHex);
    assert.equal(parsed.targetPort, 443);
    assert.equal(parsed.targetAddr, "192.168.1.100");
    assert.equal(parsed.isUDP, false);
    assert(parsed.offset > 0);
    // Payload verify
    const remainder = new Uint8Array(buf.slice(parsed.offset));
    assert.deepEqual(remainder, new Uint8Array([0xde, 0xad, 0xbe, 0xef]));
});

test("VLESS - parse valid Domain packet with UDP command", () => {
    const uuidHex = "abcdef0123456789abcdef0123456789";
    const buf = buildVlessBuffer({
        uuidHex,
        port: 53,
        addressType: 0x02,
        address: "dns.google",
        command: 0x02
    });

    const parsed = parseVlessHeader(buf);
    assert.equal(parsed.hasError, false);
    assert.equal(parsed.clientUuidHex, uuidHex);
    assert.equal(parsed.targetPort, 53);
    assert.equal(parsed.targetAddr, "dns.google");
    assert.equal(parsed.isUDP, true);
});

test("VLESS - parse valid IPv6 packet", () => {
    const buf = buildVlessBuffer({
        port: 8080,
        addressType: 0x03,
        address: "2001:db8:0:0:0:ff00:42:8329"
    });

    const parsed = parseVlessHeader(buf);
    assert.equal(parsed.hasError, false);
    assert.equal(parsed.targetPort, 8080);
    assert.equal(parsed.targetAddr, "2001:db8:0:0:0:ff00:42:8329");
});

test("VLESS - error on buffer too short or invalid version", () => {
    const shortBuf = new Uint8Array(20).buffer;
    assert.equal(parseVlessHeader(shortBuf).hasError, true);

    const badVersionBuf = buildVlessBuffer({ version: 0x01 });
    const parsedBadVer = parseVlessHeader(badVersionBuf);
    assert.equal(parsedBadVer.hasError, true);
    assert.match(parsedBadVer.message, /Invalid VLESS version/);
});

test("VLESS - error on truncated address", () => {
    const validBuf = buildVlessBuffer({ addressType: 0x02, address: "superlongdomainname.example.com" });
    // Truncate domain by slicing 5 bytes before the end of the header
    const truncatedBuf = validBuf.slice(0, 26);
    const parsed = parseVlessHeader(truncatedBuf);
    assert.equal(parsed.hasError, true);
});

test("Trojan - parse valid IPv4 packet", () => {
    const hash = "1234567890abcdef1234567890abcdef1234567890abcdef12345678";
    const buf = buildTrojanBuffer({
        hashHex: hash,
        command: 0x01,
        addressType: 0x01,
        address: "10.0.0.1",
        port: 443
    });

    const parsed = parseTrojanHeader(buf);
    assert.equal(parsed.hasError, false);
    assert.equal(parsed.clientHashHex, hash);
    assert.equal(parsed.targetPort, 443);
    assert.equal(parsed.targetAddr, "10.0.0.1");
    assert.equal(parsed.isUDP, false);
    const remainder = new Uint8Array(buf.slice(parsed.offset));
    assert.deepEqual(remainder, new Uint8Array([0x01, 0x02, 0x03]));
});

test("Trojan - parse valid Domain packet with UDP command", () => {
    const buf = buildTrojanBuffer({
        command: 0x03,
        addressType: 0x03,
        address: "one.one.one.one",
        port: 53
    });

    const parsed = parseTrojanHeader(buf);
    assert.equal(parsed.hasError, false);
    assert.equal(parsed.targetPort, 53);
    assert.equal(parsed.targetAddr, "one.one.one.one");
    assert.equal(parsed.isUDP, true);
});

test("Trojan - parse valid IPv6 packet", () => {
    const buf = buildTrojanBuffer({
        addressType: 0x04,
        address: "2606:4700:4700:0:0:0:0:1111",
        port: 8443
    });

    const parsed = parseTrojanHeader(buf);
    assert.equal(parsed.hasError, false);
    assert.equal(parsed.targetPort, 8443);
    assert.equal(parsed.targetAddr, "2606:4700:4700:0:0:0:0:1111");
});

test("Trojan - error on missing CRLF or buffer too short", () => {
    const shortBuf = new Uint8Array(50).buffer;
    assert.equal(parseTrojanHeader(shortBuf).hasError, true);

    const noCrlf = new Uint8Array(60).fill(0x61).buffer;
    const parsedNoCrlf = parseTrojanHeader(noCrlf);
    assert.equal(parsedNoCrlf.hasError, true);
    assert.match(parsedNoCrlf.message, /CRLF missing/);
});

// --- Stream Data Piping & Socket Connector Tests ---
import { startDataPipe, setSocketConnector } from "../src/protocols/proxy.js";
import { SYSTEM_DEFAULTS } from "../src/config.js";
import { getTrojanHash } from "../src/utils/crypto.js";
import { base64ToArrayBuffer, convertToNAT64IPv6 } from "../src/utils/helpers.js";

class MockClientWebSocket {
    constructor() {
        this.listeners = {};
        this.sent = [];
        this.closed = false;
    }
    addEventListener(type, fn) {
        if (!this.listeners[type]) this.listeners[type] = [];
        this.listeners[type].push(fn);
    }
    send(data) {
        this.sent.push(data);
    }
    close() {
        this.closed = true;
        (this.listeners["close"] || []).forEach((fn) => fn());
    }
    emitMessage(buffer) {
        (this.listeners["message"] || []).forEach((fn) => fn({ data: buffer }));
    }
}

test("Proxy Pipe - VLESS stream forwards upstream and downstream data", async () => {
    const writtenUpstream = [];
    const connectedTargets = [];

    setSocketConnector(({ hostname, port }) => {
        connectedTargets.push({ hostname, port });
        return {
            opened: Promise.resolve(),
            writable: new WritableStream({
                write(chunk) {
                    writtenUpstream.push(chunk);
                }
            }),
            readable: new ReadableStream({
                start(controller) {
                    controller.enqueue(new TextEncoder().encode("HTTP/1.1 200 OK\r\n\r\nHello Client"));
                    controller.close();
                }
            }),
            close: () => {}
        };
    });

    const userUuid = "00112233-4455-6677-8899-aabbccddeeff";
    const userUuidHex = userUuid.replace(/-/g, "");
    const sysConfig = {
        ...SYSTEM_DEFAULTS,
        deviceId: userUuid,
        users: [{ id: userUuid, name: "VlessUser" }]
    };

    const ws = new MockClientWebSocket();
    startDataPipe(ws, {}, null, -1, sysConfig);

    const vlessBuf = buildVlessBuffer({
        uuidHex: userUuidHex,
        port: 80,
        addressType: 0x01,
        address: "93.184.216.34",
        payload: new TextEncoder().encode("GET / HTTP/1.1\r\nHost: example.com\r\n\r\n")
    });

    ws.emitMessage(vlessBuf);

    // Allow queue microtasks to complete
    await new Promise((resolve) => setTimeout(resolve, 80));

    // Verify upstream connection target
    assert.equal(connectedTargets.length, 1);
    assert.equal(connectedTargets[0].hostname, "93.184.216.34");
    assert.equal(connectedTargets[0].port, 80);

    // Verify upstream data received
    assert(writtenUpstream.length > 0);
    const upStr = new TextDecoder().decode(writtenUpstream[0]);
    assert(upStr.includes("GET / HTTP/1.1"));

    // Verify downstream VLESS header [0, 0] sent to client
    assert.deepEqual(ws.sent[0], new Uint8Array([0, 0]));

    // Verify downstream data sent to client
    const downStr = new TextDecoder().decode(ws.sent[1]);
    assert(downStr.includes("Hello Client"));
});

test("Proxy Pipe - Trojan stream forwards upstream and downstream data", async () => {
    const writtenUpstream = [];
    const connectedTargets = [];

    setSocketConnector(({ hostname, port }) => {
        connectedTargets.push({ hostname, port });
        return {
            opened: Promise.resolve(),
            writable: new WritableStream({
                write(chunk) {
                    writtenUpstream.push(chunk);
                }
            }),
            readable: new ReadableStream({
                start(controller) {
                    controller.enqueue(new TextEncoder().encode("Trojan Downstream Response"));
                    controller.close();
                }
            }),
            close: () => {}
        };
    });

    const userUuid = "a1b2c3d4-e5f6-4000-8000-112233445566";
    const hash = getTrojanHash(userUuid);
    const sysConfig = {
        ...SYSTEM_DEFAULTS,
        deviceId: userUuid,
        customDns: "",
        users: [{ id: userUuid, name: "TrojanUser" }]
    };

    const ws = new MockClientWebSocket();
    startDataPipe(ws, {}, null, -1, sysConfig);

    const trojanBuf = buildTrojanBuffer({
        hashHex: hash,
        command: 0x01,
        addressType: 0x03, // SOCKS5/Trojan Domain
        address: "api.example.com",
        port: 443,
        payload: new TextEncoder().encode("Trojan Initial Payload")
    });

    ws.emitMessage(trojanBuf);

    await new Promise((resolve) => setTimeout(resolve, 80));

    assert.equal(connectedTargets.length, 1);
    assert.equal(connectedTargets[0].hostname, "api.example.com");
    assert.equal(connectedTargets[0].port, 443);

    // Upstream data received
    assert(writtenUpstream.length > 0);
    const upStr = new TextDecoder().decode(writtenUpstream[0]);
    assert.equal(upStr, "Trojan Initial Payload");

    // Downstream response received
    assert(ws.sent.length > 0);
    const downStr = new TextDecoder().decode(ws.sent[0]);
    assert.equal(downStr, "Trojan Downstream Response");
});

test("Proxy Pipe - Relay failover occurs when direct connect fails", async () => {
    const attempts = [];

    setSocketConnector(({ hostname, port }) => {
        attempts.push({ hostname, port });
        if (hostname === "198.51.100.1") {
            return {
                opened: Promise.reject(new Error("Connection refused")),
                close: () => {}
            };
        }
        // Relay succeeds
        return {
            opened: Promise.resolve(),
            writable: new WritableStream({ write() {} }),
            readable: new ReadableStream({
                start(controller) {
                    controller.enqueue(new TextEncoder().encode("Relayed response"));
                    controller.close();
                }
            }),
            close: () => {}
        };
    });

    const userUuid = "00112233-4455-6677-8899-aabbccddeeff";
    const userUuidHex = userUuid.replace(/-/g, "");
    const sysConfig = {
        ...SYSTEM_DEFAULTS,
        deviceId: userUuid,
        customDns: "",
        customRelay: "relay.failover.org:8443",
        users: [{ id: userUuid, name: "VlessUser" }]
    };

    const ws = new MockClientWebSocket();
    startDataPipe(ws, {}, null, -1, sysConfig);

    const vlessBuf = buildVlessBuffer({
        uuidHex: userUuidHex,
        port: 443,
        addressType: 0x01,
        address: "198.51.100.1",
        payload: new Uint8Array([1, 2, 3])
    });

    ws.emitMessage(vlessBuf);
    await new Promise((resolve) => setTimeout(resolve, 80));

    // First attempt: direct to 198.51.100.1
    assert.equal(attempts[0].hostname, "198.51.100.1");
    // Second attempt: failover relay
    assert.equal(attempts[1].hostname, "relay.failover.org");
    assert.equal(attempts[1].port, 8443);
});

import { formatSocketHost } from "../src/utils/helpers.js";

test("IPv6 Bracketing - formatSocketHost wraps IPv6 literals but leaves IPv4 and domains intact", () => {
    assert.equal(formatSocketHost("1.1.1.1"), "1.1.1.1");
    assert.equal(formatSocketHost("example.com"), "example.com");
    assert.equal(formatSocketHost("2001:db8::1"), "[2001:db8::1]");
    assert.equal(formatSocketHost("[2001:db8::1]"), "[2001:db8::1]");
    assert.equal(formatSocketHost(""), "");
});

test("Proxy Pipe - IPv6 literal destination is bracketed in socket connect call", async () => {
    const attempts = [];
    setSocketConnector(({ hostname, port }) => {
        attempts.push({ hostname, port });
        return {
            opened: Promise.resolve(),
            writable: new WritableStream({ write() {} }),
            readable: new ReadableStream({
                start(controller) {
                    controller.close();
                }
            }),
            close: () => {}
        };
    });

    const userUuid = "00112233-4455-6677-8899-aabbccddeeff";
    const userUuidHex = userUuid.replace(/-/g, "");
    const sysConfig = {
        ...SYSTEM_DEFAULTS,
        deviceId: userUuid,
        customDns: "",
        users: [{ id: userUuid, name: "VlessUser" }]
    };

    const ws = new MockClientWebSocket();
    startDataPipe(ws, {}, null, -1, sysConfig);

    const vlessBuf = buildVlessBuffer({
        uuidHex: userUuidHex,
        port: 443,
        addressType: 0x03, // IPv6
        address: "2001:db8:0:0:0:ff00:42:8329",
        payload: new Uint8Array([0x01])
    });

    ws.emitMessage(vlessBuf);
    await new Promise((resolve) => setTimeout(resolve, 80));

    assert.equal(attempts.length, 1);
    assert.equal(attempts[0].hostname, "[2001:db8:0:0:0:ff00:42:8329]");
    assert.equal(attempts[0].port, 443);
});

test("Protocols - base64ToArrayBuffer parses URL-safe and padded Base64 payloads", () => {
    assert.equal(base64ToArrayBuffer(null), null);
    assert.equal(base64ToArrayBuffer(""), null);

    // Standard base64 "Hello" -> "SGVsbG8="
    const buf1 = base64ToArrayBuffer("SGVsbG8=");
    assert.equal(new TextDecoder().decode(buf1), "Hello");

    // URL-safe unpadded base64 with - and _
    // Bytes: [251, 239] -> Standard base64: ++8=, URL-safe: --8
    const rawBytes = new Uint8Array([0xfb, 0xef]);
    const b64 = Buffer.from(rawBytes).toString("base64url");
    const buf2 = base64ToArrayBuffer(b64);
    assert.deepEqual(new Uint8Array(buf2), rawBytes);
});

test("Protocols - convertToNAT64IPv6 converts IPv4 to hexadecimal NAT64 IPv6 format", () => {
    assert.equal(convertToNAT64IPv6(null, "[2602:fc59:b0:64::]"), null);
    assert.equal(convertToNAT64IPv6("invalid", "[2602:fc59:b0:64::]"), null);

    // 1.2.3.4 -> 01, 02, 03, 04 -> 0102:0304
    const nat1 = convertToNAT64IPv6("1.2.3.4", "[2602:fc59:b0:64::]");
    assert.equal(nat1, "[2602:fc59:b0:64::0102:0304]");

    // 192.168.1.1 -> c0, a8, 01, 01 -> c0a8:0101
    const nat2 = convertToNAT64IPv6("192.168.1.1", "2a02:898:146:64::");
    assert.equal(nat2, "[2a02:898:146:64::c0a8:0101]");
});

test("Proxy Pipe - 0-RTT early data initiates connection before first WebSocket message", async () => {
    const writtenUpstream = [];
    const connectedTargets = [];

    setSocketConnector(({ hostname, port }) => {
        connectedTargets.push({ hostname, port });
        return {
            opened: Promise.resolve(),
            writable: new WritableStream({
                write(chunk) {
                    writtenUpstream.push(chunk);
                }
            }),
            readable: new ReadableStream({
                start(controller) {
                    controller.enqueue(new TextEncoder().encode("Early Downstream"));
                    controller.close();
                }
            }),
            close: () => {}
        };
    });

    const userUuid = "12345678-1234-1234-1234-123456789abc";
    const userUuidHex = userUuid.replace(/-/g, "");
    const sysConfig = {
        ...SYSTEM_DEFAULTS,
        deviceId: userUuid,
        customDns: "",
        users: [{ id: userUuid, name: "EarlyUser" }]
    };

    const vlessBuf = buildVlessBuffer({
        uuidHex: userUuidHex,
        port: 443,
        addressType: 0x02,
        address: "early.example.com",
        payload: new TextEncoder().encode("Early Data Payload")
    });

    // Encode initial VLESS packet as URL-safe Base64
    const b64Early = Buffer.from(vlessBuf).toString("base64url");

    const ws = new MockClientWebSocket();
    // Pass early data header directly to startDataPipe
    startDataPipe(ws, {}, null, -1, sysConfig, b64Early);

    // Wait for async initialization without emitting any WebSocket messages!
    await new Promise((resolve) => setTimeout(resolve, 80));

    // Remote socket must be connected in 0-RTT!
    assert.equal(connectedTargets.length, 1);
    assert.equal(connectedTargets[0].hostname, "early.example.com");
    assert.equal(connectedTargets[0].port, 443);

    // First payload forwarded upstream
    assert(writtenUpstream.length > 0);
    const upStr = new TextDecoder().decode(writtenUpstream[0]);
    assert.equal(upStr, "Early Data Payload");

    // VLESS response header [0, 0] and downstream response received
    assert.deepEqual(ws.sent[0], new Uint8Array([0, 0]));
    const downStr = new TextDecoder().decode(ws.sent[1]);
    assert.equal(downStr, "Early Downstream");

    // Now send subsequent WebSocket message -> written to dataWriter
    ws.emitMessage(new TextEncoder().encode("Second Packet"));
    await new Promise((resolve) => setTimeout(resolve, 50));
    assert.equal(writtenUpstream.length, 2);
    assert.equal(new TextDecoder().decode(writtenUpstream[1]), "Second Packet");
});

test("Proxy Pipe - NAT64 fallback connects when direct IPv4 fails and NAT64 prefix configured", async () => {
    const attempts = [];

    setSocketConnector(({ hostname, port }) => {
        attempts.push({ hostname, port });
        if (hostname === "198.51.100.25") {
            // Direct connect fails
            return {
                opened: Promise.reject(new Error("Direct connect blocked")),
                close: () => {}
            };
        }
        // NAT64 connection succeeds
        return {
            opened: Promise.resolve(),
            writable: new WritableStream({ write() {} }),
            readable: new ReadableStream({
                start(controller) {
                    controller.close();
                }
            }),
            close: () => {}
        };
    });

    const userUuid = "22334455-6677-8899-0011-223344556677";
    const userUuidHex = userUuid.replace(/-/g, "");
    const sysConfig = {
        ...SYSTEM_DEFAULTS,
        deviceId: userUuid,
        proxyIpMode: "prefix",
        prefixes: ["[2602:fc59:b0:64::]"],
        users: [{ id: userUuid, name: "NatUser" }]
    };

    const ws = new MockClientWebSocket();
    startDataPipe(ws, {}, null, -1, sysConfig);

    const vlessBuf = buildVlessBuffer({
        uuidHex: userUuidHex,
        port: 80,
        addressType: 0x01, // IPv4
        address: "198.51.100.25",
        payload: new Uint8Array([0x01])
    });

    ws.emitMessage(vlessBuf);
    await new Promise((resolve) => setTimeout(resolve, 80));

    // Two attempts: 1st direct IPv4, 2nd converted NAT64 IPv6
    assert.equal(attempts.length, 2);
    assert.equal(attempts[0].hostname, "198.51.100.25");
    assert.equal(attempts[1].hostname, "[2602:fc59:b0:64::c633:6419]");
    assert.equal(attempts[1].port, 80);
});
