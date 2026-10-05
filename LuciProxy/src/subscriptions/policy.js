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

/**
 * Resolves a Canonical Network Policy from system configuration and profile overrides.
 */
export function resolveNetworkPolicy(sysConfig = {}, defaultOutbound = "select") {
    const dnsPolicy = buildCanonicalDnsPolicy(sysConfig);
    const rules = buildDeterministicPolicyRules(sysConfig, defaultOutbound);
    const activeKeys = getActiveRuleKeys(sysConfig);

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
            queryStrategyXray: dnsPolicy.queryStrategyXray
        },
        outbound: {
            defaultTag: defaultOutbound,
            fallbackTag: "direct"
        }
    };
}
