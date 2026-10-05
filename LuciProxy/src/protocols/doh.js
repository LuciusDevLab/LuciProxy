/**
 * LuciProxy - DNS-over-HTTPS (DoH) Edge Proxy Handler
 * RFC 8484 and RFC 8427 compliant DNS message forwarder for in-worker DNS resolution.
 *
 * Independent implementation authored specifically for LuciProxy.
 */

import { encodeDnsQuery, parseDnsResponse, uint8ArrayToBase64Url } from "./dns_resolver.js";

export async function handleDoH(request, sysConfig = {}) {
    let upstreamDoh = sysConfig.customDns || sysConfig.remoteDns || "https://dns.google/dns-query";
    if (upstreamDoh.includes("cloudflare-dns.com")) {
        upstreamDoh = "https://dns.google/dns-query";
    }

    try {
        const reqUrl = new URL(request.url);
        const targetUrl = new URL(upstreamDoh);

        // Normalize IP literal 8.8.8.8 to dns.google for Worker HTTPS subrequest TLS SNI verification
        if (targetUrl.hostname === "8.8.8.8") {
            targetUrl.hostname = "dns.google";
        }

        // 1. Handle JSON DoH queries (e.g. ?name=...&type=...)
        if (request.method === "GET" && reqUrl.searchParams.has("name") && !reqUrl.searchParams.has("dns")) {
            const name = reqUrl.searchParams.get("name");
            const typeStr = (reqUrl.searchParams.get("type") || "A").toUpperCase();
            const qtype = typeStr === "AAAA" ? 28 : 1;

            if (targetUrl.hostname.includes("google") || targetUrl.hostname === "8.8.8.8") {
                const resolveUrl = new URL("https://dns.google/resolve");
                reqUrl.searchParams.forEach((val, key) => resolveUrl.searchParams.set(key, val));

                const jsonRes = await fetch(resolveUrl.toString(), {
                    method: "GET",
                    headers: { "Accept": "application/dns-json" }
                });

                const respHeaders = new Headers(jsonRes.headers);
                respHeaders.set("Access-Control-Allow-Origin", "*");
                respHeaders.set("Cache-Control", "public, max-age=120");
                return new Response(jsonRes.body, {
                    status: jsonRes.status,
                    headers: respHeaders
                });
            } else {
                const wireQuery = encodeDnsQuery(name, qtype);
                const b64 = uint8ArrayToBase64Url(wireQuery);
                const queryUrl = new URL(upstreamDoh);
                queryUrl.searchParams.set("dns", b64);

                const wireRes = await fetch(queryUrl.toString(), {
                    method: "GET",
                    headers: { "Accept": "application/dns-message" }
                });

                if (!wireRes.ok) return new Response("DNS-over-HTTPS Upstream Error", { status: 502 });
                const wireBuf = await wireRes.arrayBuffer();
                const ips = parseDnsResponse(wireBuf, qtype);
                const jsonResp = {
                    Status: ips.length > 0 ? 0 : 3,
                    TC: false,
                    RD: true,
                    RA: true,
                    AD: false,
                    CD: false,
                    Question: [{ name, type: qtype }],
                    Answer: ips.map((ip) => ({ name, type: qtype, TTL: 300, data: ip }))
                };

                return new Response(JSON.stringify(jsonResp), {
                    status: 200,
                    headers: {
                        "Content-Type": "application/dns-json",
                        "Access-Control-Allow-Origin": "*",
                        "Cache-Control": "public, max-age=120"
                    }
                });
            }
        }

        // 2. Handle RFC 8484 POST queries by translating body to GET ?dns= to prevent upstream 411 Length Required
        if (request.method === "POST" && targetUrl.pathname.endsWith("/dns-query")) {
            const bodyBytes = await request.arrayBuffer();
            const b64 = uint8ArrayToBase64Url(bodyBytes);
            targetUrl.searchParams.set("dns", b64);

            const res = await fetch(targetUrl.toString(), {
                method: "GET",
                headers: { "Accept": "application/dns-message" }
            });

            const respHeaders = new Headers(res.headers);
            respHeaders.set("Access-Control-Allow-Origin", "*");
            respHeaders.set("Cache-Control", "public, max-age=120");
            return new Response(res.body, {
                status: res.status,
                headers: respHeaders
            });
        }

        // 3. Standard RFC 8484 GET forwarding (e.g. ?dns=...)
        reqUrl.searchParams.forEach((value, key) => {
            targetUrl.searchParams.set(key, value);
        });

        const headers = new Headers(request.headers);
        headers.set("Host", targetUrl.hostname);
        headers.delete("cf-connecting-ip");
        headers.delete("x-forwarded-for");

        const fetchInit = {
            method: request.method,
            headers,
            redirect: "follow"
        };

        if (request.method === "POST") {
            fetchInit.body = await request.arrayBuffer();
        }

        const res = await fetch(targetUrl.toString(), fetchInit);
        const respHeaders = new Headers(res.headers);
        respHeaders.set("Access-Control-Allow-Origin", "*");
        respHeaders.set("Cache-Control", "public, max-age=120");

        return new Response(res.body, {
            status: res.status,
            headers: respHeaders
        });
    } catch (e) {
        return new Response("DNS-over-HTTPS Resolution Error", { status: 502 });
    }
}
