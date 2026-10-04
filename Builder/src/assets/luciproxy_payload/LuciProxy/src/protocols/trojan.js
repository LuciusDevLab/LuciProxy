/**
 * LuciProxy - Trojan Protocol Parser
 * Open protocol parser adhering strictly to the Trojan-GFW binary packet specification.
 *
 * Independent implementation authored specifically for LuciProxy.
 */

/**
 * Parses a Trojan request packet from the first binary chunk of a WebSocket stream.
 * 
 * Trojan Header format:
 * 56 bytes: Hex-encoded SHA-224 password hash
 * 2 bytes: CRLF (0x0d 0x0a)
 * 1 byte: Command (0x01: CONNECT / TCP, 0x03: UDP ASSOCIATE)
 * 1 byte: Address Type (0x01: IPv4, 0x03: Domain, 0x04: IPv6)
 * Variable: Address
 * 2 bytes: Port (Big Endian)
 * 2 bytes: CRLF (0x0d 0x0a)
 * Remainder: Raw payload data
 */
export function parseTrojanHeader(bufferData) {
    if (!bufferData || bufferData.byteLength < 58) {
        return { hasError: true, message: "Trojan header too short" };
    }

    const view = new Uint8Array(bufferData);
    let ePos = -1;
    for (let i = 0; i < Math.min(view.byteLength - 1, 128); i++) {
        if (view[i] === 0x0d && view[i + 1] === 0x0a) {
            ePos = i;
            break;
        }
    }

    if (ePos === -1) {
        return { hasError: true, message: "Invalid Trojan header (CRLF missing)" };
    }

    const clientHashHex = new TextDecoder().decode(view.slice(0, ePos));
    let hPos = ePos + 2; // skip CRLF
    if (hPos + 3 >= view.byteLength) {
        return { hasError: true, message: "Truncated Trojan command" };
    }

    const command = view[hPos];
    const isUDP = command === 0x03;
    hPos++;

    const aType = view[hPos];
    hPos++;

    let targetAddr = "";
    const dv = new DataView(bufferData);

    if (aType === 1) {
        // IPv4 (4 bytes)
        if (hPos + 4 > view.byteLength) return { hasError: true, message: "Truncated IPv4" };
        targetAddr = Array.from(view.slice(hPos, hPos + 4)).join(".");
        hPos += 4;
    } else if (aType === 3) {
        // Domain name (1 byte length + domain string)
        const domainLen = view[hPos];
        hPos++;
        if (hPos + domainLen > view.byteLength) return { hasError: true, message: "Truncated domain" };
        targetAddr = new TextDecoder().decode(view.slice(hPos, hPos + domainLen));
        hPos += domainLen;
    } else if (aType === 4) {
        // IPv6 (16 bytes)
        if (hPos + 16 > view.byteLength) return { hasError: true, message: "Truncated IPv6" };
        const ipv6Parts = [];
        for (let i = 0; i < 8; i++) {
            ipv6Parts.push(dv.getUint16(hPos + i * 2).toString(16));
        }
        targetAddr = ipv6Parts.join(":");
        hPos += 16;
    } else {
        return { hasError: true, message: `Unsupported Trojan address type: ${aType}` };
    }

    if (hPos + 2 > view.byteLength) {
        return { hasError: true, message: "Truncated Trojan port" };
    }

    const targetPort = dv.getUint16(hPos);
    hPos += 2;

    // Skip trailing CRLF if present
    if (hPos + 2 <= view.byteLength && view[hPos] === 0x0d && view[hPos + 1] === 0x0a) {
        hPos += 2;
    }

    return {
        hasError: false,
        clientHashHex,
        targetPort,
        targetAddr,
        isUDP,
        offset: hPos,
    };
}
