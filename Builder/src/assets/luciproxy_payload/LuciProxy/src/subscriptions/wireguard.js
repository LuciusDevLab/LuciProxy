/**
 * LuciProxy - WARP & WireGuard / AmneziaWG Configuration Generator
 * Open specification configuration generator for WireGuard and AmneziaWG profiles.
 *
 * Independent implementation authored specifically for LuciProxy.
 */

export function generateWireguardConfig(sysConfig = {}, isAmnezia = false, title = "LuciProxy-WARP") {
    const privateKey = sysConfig.warpPrivateKey || "4NyxMUme2zGv5r3QWI0hJBlNglm1J/thoCE55PK29G8=";
    const publicKey = sysConfig.warpPublicKey || "bmXOC+F1FxEMF9dyiK2H5/1SUtzH0JuVo51h2wPfgyo=";
    const warpIPv6 = sysConfig.warpIPv6 || "2606:4700:110:8735:6b2e:3d6e:8c3a:70a0/128";
    const dns = sysConfig.warpRemoteDNS || "1.1.1.1";

    let endpoints = sysConfig.warpEndpoints;
    if (typeof endpoints === "string") {
        endpoints = endpoints.split(/[\r\n,;]+/).map((s) => s.trim()).filter(Boolean);
    }
    if (!endpoints || !Array.isArray(endpoints) || endpoints.length === 0) {
        endpoints = ["engage.cloudflareclient.com:2408"];
    }

    const jc = sysConfig.amneziaNoiseCount || 5;
    const jmin = sysConfig.amneziaNoiseSizeMin || 50;
    const jmax = sysConfig.amneziaNoiseSizeMax || 100;

    const configs = endpoints.map((endpoint, idx) => {
        const lines = [
            `# ${title} ${isAmnezia ? "AmneziaWG" : "WireGuard"} [${idx + 1}]`,
            "[Interface]",
            `PrivateKey = ${privateKey}`,
            `Address = 172.16.0.2/32, ${warpIPv6}`,
            `DNS = ${dns}`,
            "MTU = 1280",
        ];

        if (isAmnezia) {
            lines.push(
                `Jc = ${jc}`,
                `Jmin = ${jmin}`,
                `Jmax = ${jmax}`,
                "S1 = 0",
                "S2 = 0",
                "H1 = 1",
                "H2 = 2",
                "H3 = 3",
                "H4 = 4"
            );
        }

        lines.push(
            "",
            "[Peer]",
            `PublicKey = ${publicKey}`,
            "AllowedIPs = 0.0.0.0/0, ::/0",
            `Endpoint = ${endpoint}`,
            "PersistentKeepalive = 25"
        );

        return lines.join("\n");
    });

    return configs.join("\n\n---\n\n");
}
