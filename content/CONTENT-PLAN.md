# Fetchgate content pipeline — next article ideas

Ranked by estimated (search volume × conversion fit) for the linked product. All ideas grounded in real product content already in `products/` — no article should be commissioned here without the underlying data/code existing first.

## 1. "x402 vs. Stripe/API keys: when machine-payable APIs actually make sense"
- **Target keyword:** "x402 vs stripe", "agent payments api"
- **Funnels to:** x402 Quickstart Kit ($7) + x402 Registry ($15)
- **Why it ranks/converts:** Comparison-intent searches convert well and are underserved — most x402 content is protocol explainer, not "should I use this." Natural bridge into both products since it needs the registry's real service data to make the case concretely (118 live services, real price points).

## 2. "The x402 facilitator landscape in 2026: 21 options compared"
- **Target keyword:** "x402 facilitator", "x402.org facilitator alternatives"
- **Funnels to:** x402 Registry ($15)
- **Why it ranks/converts:** Direct repurposing of `products/x402-registry/data/facilitators.json` — near-zero marginal content cost, and "facilitator comparison" is a distinct, lower-competition query from "x402 tutorial." High conversion fit since the registry *is* the answer to the query.

## 3. "MCP tool poisoning: how a tool description becomes an attack, and how to stop it"
- **Target keyword:** "MCP tool poisoning", "MCP server security"
- **Funnels to:** Defenses Playbook ($39) + injection-corpus tool-hijack cases
- **Why it ranks/converts:** MCP adoption is climbing fast in 2026 and MCP-specific security content is thin compared to general prompt-injection content. OWASP's MCP Top 10 citation (84% tool-poisoning success with auto-approval) is a strong, quotable hook. Directly showcases the playbook's §2.3 tool-and-permission-design layer.

## 4. "How to build an LLM eval harness that catches regressions before your users do"
- **Target keyword:** "LLM eval harness", "agent evaluation framework"
- **Funnels to:** Agent Eval Harness Templates ($39)
- **Why it ranks/converts:** "Eval" is one of the highest-intent terms in the current agent-building wave — teams actively googling this are pre-sold on needing a harness, just not which one. Currently the only major product without a dedicated article.

## 5. "MCP server registry: 400 servers, sorted by what's actually production-ready"
- **Target keyword:** "MCP server list", "best MCP servers"
- **Funnels to:** MCP Registry Snapshot ($19)
- **Why it ranks/converts:** High-volume, list-intent keyword with a genuinely differentiated answer (cross-referenced across 5 source directories, verification dates per entry) — "best MCP servers" listicles currently ranking are mostly unmaintained or single-source.

## 6. "ASCII smuggling and invisible Unicode: the prompt-injection technique your filters can't see"
- **Target keyword:** "unicode prompt injection", "invisible character LLM attack"
- **Funnels to:** Test Corpus ($29) + Defenses Playbook ($39)
- **Why it ranks/converts:** Narrow but high-intent technical query (security researchers, red-teamers) with strong shareability — this is exactly the kind of specific, surprising finding (Rehberger's ASCII-smuggling research) that gets picked up on Hacker News / security Twitter and links back organically.

## 7. "What EIP-3009 actually is, and why x402 uses it instead of ERC-20 approve()"
- **Target keyword:** "EIP-3009 explained", "transferWithAuthorization"
- **Funnels to:** x402 Quickstart Kit ($7)
- **Why it ranks/converts:** Lower volume but very high buyer-intent — anyone searching this is mid-implementation, one step from needing working sign.ts/sign.py code. Cheap to produce from existing sign.ts/sign.py doc comments; strong internal link target from Article 1.

## 8. "Jailbreak taxonomy 2026: DAN, roleplay, and what's changed since GPT-4"
- **Target keyword:** "LLM jailbreak techniques", "DAN prompt"
- **Funnels to:** Test Corpus ($29)
- **Why it ranks/converts:** Highest raw search volume on this list (broad, evergreen curiosity term) but weaker conversion fit than #3/#6 — mostly non-buyer researchers/hobbyists. Good top-of-funnel/backlink piece; keep the CTA light and route hard-core readers toward #3 and #6 instead of expecting direct conversion here.

---

**Suggested cadence:** one article every 1–2 weeks, alternating x402 and injection-defense tracks so both product lines stay warm in search. Prioritize #1–#3 first — highest combined score and cheapest to produce from data already on hand.
