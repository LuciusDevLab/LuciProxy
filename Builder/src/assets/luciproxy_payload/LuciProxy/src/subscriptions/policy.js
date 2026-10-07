/**
 * LuciProxy - Canonical Network Policy Model & Policy Resolver
 *
 * Provides a normalized intermediate representation of network, routing,
 * DNS, and transport policies decoupled from target client core syntaxes.
 *
 * Independent implementation authored specifically for LuciProxy.
 */

import { buildCanonicalDnsPolicy } from "./dns.js";
import {
    buildDeterministicPolicyRules,
    getActiveRuleKeys,
    RULESET_CATALOG
} from "./rules.js";

// RFC 7301 compliant ALPN token validator
const VALID_ALPN_REGEX = /^[a-zA-Z0-9_./-]+$/;

/**
 * Validates and normalizes an input ALPN setting.
 * @param {string|Array<string>|null} val Input ALPN representation
 * @returns {Array<string>|null} Validated array of ALPN tokens, or null if unset/auto
 * @throws {Error} If any token fails character or length validation
 */
export function validateAlpn(val) {
    if (val === null || val === undefined) return null;
    let tokens = [];
    if (Array.isArray(val)) {
        tokens = val.map((x) => String(x || "").trim()).filter(Boolean);
    } else if (typeof val === "string") {
        const cleaned = val.trim().toLowerCase();
        if (!cleaned || cleaned === "auto" || cleaned === "unset" || cleaned === "none" || cleaned === "default") {
            return null;
        }
        tokens = val.split(",").map((x) => x.trim()).filter(Boolean);
    } else {
        return null;
    }

    if (tokens.length === 0) return null;

    const validated = [];
    for (const t of tokens) {
        if (!VALID_ALPN_REGEX.test(t) || t.length > 255) {
            throw new Error(`Invalid ALPN token: "${t}". Must match /^[a-zA-Z0-9_./-]+$/ and be <= 255 chars.`);
        }
        validated.push(t);
    }
    return validated;
}

/**
 * Resolves effective ALPN across the canonical precedence hierarchy:
 * Query Override -> Endpoint/User Override -> Profile Override -> Global sysConfig -> null (auto)
 */
export function resolveAlpn(sysConfig = {}, profile = null, runtimeOverride = null) {
    // 1. Runtime / Query override (highest precedence)
    if (runtimeOverride !== null && runtimeOverride !== undefined && String(runtimeOverride).trim() !== "") {
        return validateAlpn(runtimeOverride);
    }
    // 2. Profile / User override
    if (profile?.alpn !== null && profile?.alpn !== undefined && String(profile?.alpn).trim() !== "") {
        return validateAlpn(profile.alpn);
    }
    // 3. Global sysConfig
    if (sysConfig?.alpn !== null && sysConfig?.alpn !== undefined && String(sysConfig?.alpn).trim() !== "") {
        return validateAlpn(sysConfig.alpn);
    }
    // 4. Default / Auto
    return null;
}

/**
 * Resolves a Canonical Network Policy from system configuration and profile overrides.
 */
export function resolveNetworkPolicy(sysConfig = {}, defaultOutbound = "select", runtimeAlpn = null) {
    const dnsPolicy = buildCanonicalDnsPolicy(sysConfig);
    const rules = buildDeterministicPolicyRules(sysConfig, defaultOutbound);
    const activeKeys = getActiveRuleKeys(sysConfig);
    const resolvedAlpn = resolveAlpn(sysConfig, null, runtimeAlpn);

    // Extract active rule-set descriptors
    const ruleSets = activeKeys.map((key) => {
        const item = RULESET_CATALOG[key];
        return {
            key,
            category: item.category,
            singbox: item.singbox,
            clash: item.clash,
            xray: item.xray
        };
    });

    return {
        dns: dnsPolicy,
        rules,
        ruleSets,
        transport: {
            blockUDP: true, // Standard Worker WebSockets cannot proxy UDP datagrams
            blockUDP443: Boolean(sysConfig.blockUDP443),
            enableIPv6: dnsPolicy.enableIPv6,
            strategy: dnsPolicy.strategy,
            queryStrategyXray: dnsPolicy.queryStrategyXray,
            alpn: resolvedAlpn
        },
        outbound: {
            defaultTag: defaultOutbound,
            fallbackTag: "direct"
        }
    };
}
