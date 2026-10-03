/**
 * LuciProxy - VLESS Protocol Parser
 * Open protocol parser adhering strictly to the VLESS binary packet specification (Xray / V2Fly).
 *
 * Independent implementation authored specifically for LuciProxy.
 */

/**
 * Parses a VLESS request packet from the first binary chunk of a WebSocket stream.
 * 
 * VLESS Header format:
 * 1 byte: Version (0x00)
 * 16 bytes: User UUID
 * 1 byte: Protobuf Addons Length (M)
 * M bytes: Protobuf Addons
 * 1 byte: Command (0x01: TCP, 0x02: UDP, 0x03: Mux)
 * 2 bytes: Port (Big Endian)
 * 1 byte: Address Type (0x01: IPv4, 0x02: Domain, 0x03: IPv6)
 * Variable: Address
 * Remainder: Raw payload data
 */
export function parseVlessHeader(bufferData) {
    if (!bufferData || bufferData.byteLength < 24) {
        return { hasError: true, message: "VLESS header too short" };
    }

    const view = new Uint8Array(bufferData);
    if (view[0] !== 0x00) {
        return { hasError: true, message: "Invalid VLESS version" };
    }

    // Extract 16-byte UUID in hexadecimal format
    const clientUuidHex = Array.from(view.slice(1, 17))
        .map((b) => b.toString(16).padStart(2, "0"))
        .join("");

    const optLen = view[17];
    const cmdPos = 18 + optLen;
    if (cmdPos >= view.byteLength) {
        return { hasError: true, message: "Truncated VLESS addons" };
    }

    const command = view[cmdPos];
    const isUDP = command === 0x02;

    const pPos = cmdPos + 1;
    if (pPos + 2 >= view.byteLength) {
        return { hasError: true, message: "Truncated VLESS port" };
    }

    const dv = new DataView(bufferData);
    const targetPort = dv.getUint16(pPos);

    const aType = view[pPos + 2];
    let vPos = pPos + 3;
    let targetAddr = "";
    let offset = 0;

    if (aType === 1) {
        // IPv4 (4 bytes)
        if (vPos + 4 > view.byteLength) return { hasError: true, message: "Truncated IPv4" };
        targetAddr = Array.from(view.slice(vPos, vPos + 4)).join(".");
        offset = vPos + 4;
    } else if (aType === 2) {
        // Domain name (1 byte length + domain string)
        const domainLen = view[vPos];
        vPos++;
        if (vPos + domainLen > view.byteLength) return { hasError: true, message: "Truncated domain" };
        targetAddr = new TextDecoder().decode(view.slice(vPos, vPos + domainLen));
        offset = vPos + domainLen;
    } else if (aType === 3) {
        // IPv6 (16 bytes)
        if (vPos + 16 > view.byteLength) return { hasError: true, message: "Truncated IPv6" };
        const ipv6Parts = [];
        for (let i = 0; i < 8; i++) {
            ipv6Parts.push(dv.getUint16(vPos + i * 2).toString(16));
        }
        targetAddr = ipv6Parts.join(":");
        offset = vPos + 16;
    } else {
        return { hasError: true, message: `Unsupported address type: ${aType}` };
    }

    return {
        hasError: false,
        clientUuidHex,
        targetPort,
        targetAddr,
        isUDP,
        offset,
    };
}
