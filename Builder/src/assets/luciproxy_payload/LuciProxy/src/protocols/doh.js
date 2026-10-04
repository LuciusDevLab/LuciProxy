/**
 * LuciProxy - DNS-over-HTTPS (DoH) Edge Proxy Handler
 * RFC 8484 compliant DNS message forwarder for in-worker DNS resolution.
 *
 * Independent implementation authored specifically for LuciProxy.
 */

export async function handleDoH(request, sysConfig = {}) {
    const upstreamDoh = sysConfig.customDns || "https://cloudflare-dns.com/dns-query";

    try {
        const reqUrl = new URL(request.url);
        const targetUrl = new URL(upstreamDoh);

        // Forward DoH query parameters (e.g., ?dns=... or ?name=...&type=...)
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
            redirect: "follow",
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
            headers: respHeaders,
        });
    } catch (e) {
        return new Response("DNS-over-HTTPS Resolution Error", { status: 502 });
    }
}
