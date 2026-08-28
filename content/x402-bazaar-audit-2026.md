---
title: "Coinbase's x402 Bazaar Lists 14,820 Paid APIs. Its Own Counters Say the Whole Market Is About $314 a Day."
seo_title: "x402 Bazaar Audit 2026: 14,820 Endpoints, 289k Calls, ~$314/Day"
meta_description: "We pulled every resource in Coinbase's x402 Bazaar index, probed each URL, and summed the index's own 30-day counters. 289,401 settled calls, a revenue ceiling of ~$9.5k/month for the entire index, 51% of resources sold at most once, and ten domains holding 38% of listings."
keywords:
  - x402
  - x402 Bazaar
  - agent payments
  - machine payable API
  - x402 adoption
  - Coinbase x402
  - agentic commerce
date: 2026-08-28
---

# Coinbase's x402 Bazaar lists 14,820 paid APIs. Its own counters say the whole market is about $314 a day.

> Published at: https://fetchgate.dev/blog/x402-bazaar-audit-2026 — this GitHub copy is a mirror; the canonical page has product links, related articles and an RSS feed.

Last week we published a [crawler census](https://fetchgate.dev/blog/agent-web-crawler-census) from one x402 endpoint's logs: sixty named bots discovered, graded and price-scraped it, and none of them ever paid. The obvious objection was that one endpoint is one endpoint. Fair. So we went and measured the whole market.

Coinbase runs the x402 Bazaar — a public discovery index of every resource its CDP facilitator has settled at least one payment for. It has a JSON API, no auth, and every entry carries a `quality` block: settled calls in the last 30 days, unique payers, and when it was last called. That block is the closest thing the agent-payments world has to a ledger, and nobody had added it up.

We fetched all 149 pages (14,820 resources), sent every resource URL one `GET` with no payment header, checked every USDC-on-Base payment option's EIP-712 signing domain, and summed. Everything is on the free page at [fetchgate.dev/tools/x402-bazaar-audit](https://fetchgate.dev/tools/x402-bazaar-audit), with a lookup box for any endpoint and the per-resource rows under CC BY 4.0.

## The number

**289,401 settled calls in 30 days, across 14,820 resources.**

Multiply each resource's calls by its minimum listed `exact`-scheme price (treating `upto`-style ceilings and the 1,051 resources that list an amount of $1,000 or more as placeholders, not prices) and the entire CDP-facilitated x402 market is **at most $9,416 for the 30-day window — about $314 a day.** That is an upper bound: it assumes every settled call paid the listed minimum. It's also only what the CDP facilitator sees; resources settling through PayAI, x402.rs, Daydreams or the rest are undercounted or absent (Fetchgate's own endpoints aren't in the index at all). The real market is bigger. Nobody publishes by how much, and CDP is the dominant facilitator by a wide margin.

The distribution is the more important part:

| | Resources | Share |
| --- | ---: | ---: |
| Zero calls in 30 days | 60 | 0.4% |
| At most 1 call | 7,612 | 51.4% |
| At most 5 calls | 12,786 | 86.3% |
| More than 100 calls | 252 | 1.7% |
| More than 1,000 calls | 34 | 0.2% |

The median resource sold **once**. The 34 resources with more than 1,000 calls took 59.5% of all calls. Ten domains took 59% of calls; 36 of the 789 domains cleared 1,000 calls in the month.

## Who the calls are

The single busiest resource is `agents.chain.link/v1/operations/:workflowName` — 36,335 calls, **one** unique payer, at $0.01. That's 12.6% of the entire market from a single wallet, which is almost certainly Chainlink calling Chainlink. Second is a Twitter search proxy (27,745 calls, 27 payers). Third is `stableenrich.dev`'s Exa search wrapper (21,022 calls, 243 payers).

By revenue proxy, the leaders are a people-enrichment API (~$552 in the window), that Chainlink workflow (~$363), a single $350 purchase, and `laso.finance`'s bank-transfer and gift-card endpoints (~$322 + $270). Only 14 resources clear $100 in the month. 109 clear $10. The top ten domains take 54% of the total.

Then there are the 25 resources with more than 50 calls where **unique payers ≈ calls** — `api.onesource.io/api/chain/erc20-balance` shows 1,045 calls from 1,042 distinct wallets. Either every request comes from a fresh wallet-per-task agent, or someone is farming the "unique payers" column that directories rank by. Both are plausible; neither is a customer base.

## Who the listings are

Supply is as concentrated as demand. Ten domains hold **5,702 of the 14,820 listings (38%)** — `delx.ai` (996), `m2mcent.com` (965), `theaslangroupllc.com` (875), `forgemesh.io` (461), `orthogonal.com` (431), `magentlab.com` (424) and so on: one resource per topic from a template, each with a handful of calls. Six receiving addresses are `payTo` on **5,561 resources — 38% of the index**; 1,323 addresses receive for all 14,820.

This is the same shape as the [MCP registry](https://fetchgate.dev/blog/mcp-registry-audit-2026), where two operators are 29% of live servers. When a listing is free and being indexed makes you look like an ecosystem, you get a lot of listings.

## What's for sale, and for how much

Median listed price: **$0.01 a call**. 13% of resources charge a tenth of a cent or less; 57% charge a cent or less; 87% charge ten cents or less; 28 charge more than $10 (payouts, gift cards, a single $350 purchase). 35,263 payment options across the index: 48% on Base, 15% on Solana, then Polygon, XRPL and Arbitrum. `exact` is 99% of schemes.

## The signing-domain mistake

An `exact`-scheme option on USDC-on-Base is paid with an EIP-3009 `transferWithAuthorization` signed over the token's EIP-712 domain, which for Base USDC is `name: "USD Coin", version: "2"`. Get that wrong and every signature a standard client produces is invalid. **898 resources — 1 in 16 of those with a USDC-on-Base `exact` option — declare a different domain**, 891 of them `GatewayWalletBatched` v1, and 845 of them on one template-farm domain (`theaslangroupllc.com`). Whatever settlement path those sellers intend, a stock x402 client cannot pay them, and they show up in the index as "listed, never paid". The [inspector](https://fetchgate.dev/tools/x402-inspector) flags this in one request; it's the same check described in the [EIP-3009 article](https://fetchgate.dev/blog/eip-3009-transfer-with-authorization).

## What answered

One `GET` per URL, no payment header, 10-second timeout. **11,488 URLs (77.5%) answered with a 402 carrying a parseable x402 challenge** — 11,317 of them v2 (challenge in the `PAYMENT-REQUIRED` header), 171 v1. Where both were readable, the live minimum price matched the listed one on 11,224 resources and differed on 282. Of the rest: 1,063 answered 405, 1,031 answered 404, 431 served content to a bare GET with no challenge, 302 timed out, 195 rate-limited us, 112 wanted auth, 6 hostnames no longer resolve. Many listed resources are `POST`-only or need parameters, so a 405 or 400 means "alive, wants a different request", not dead. Among the 252 resources with more than 100 calls, 193 returned a live challenge, 30 returned 404 and 17 returned 405 — so a fifth of the *busy* listings don't answer a bare GET the way the index describes them.

## Facilitators

We also asked all 21 facilitators from our registry `GET /supported`. **10 answered** with a `kinds[]` list — PayAI (32 network/scheme kinds), Dexter (44), x402.rs (31), Daydreams (16), Heurist, Polygon, Mogami, 402104, xpay, and the x402.org community facilitator (testnets only). Coinbase's own `facilitator.cdp.coinbase.com` no longer resolves in DNS (its API moved under `api.cdp.coinbase.com`); CodeNut timed out; OpenX402 fails TLS; Corbits doesn't resolve; Thirdweb and Virtuals 404 on every `/supported` path; KAMIYO returns 503. Three are listed by on-chain address only.

## So what?

The crawler census said "discovery is solved, demand is not" from one endpoint. The Bazaar says the same thing from the index side: being listed is automatic (one settled payment and you're in), 14,820 things are listed, and the money flowing through the dominant facilitator rounds to a few hundred dollars a day, most of it to a handful of sellers and a couple of very busy wallets.

If you're building for agents, price against that. If you're pitching it, the number to have in the deck is $314/day with an asterisk, not 14,820 endpoints. And before you list, run your 402 through the inspector — one in sixteen USDC-on-Base sellers in the index can't be paid by the client the protocol ships.

## Method, and what this does not show

- **Source:** `GET api.cdp.coinbase.com/platform/v2/x402/discovery/resources`, all 149 pages, 2026-08-28 21:31–21:35 UTC. The `quality` counters are Coinbase's; we did not recompute them.
- **CDP only.** The index sees what the CDP facilitator settles. Other facilitators are invisible here. This is a floor on the market and a ceiling on CDP's share of it.
- **Calls ≠ revenue.** The proxy uses each resource's minimum listed `exact`-scheme price and assumes every call paid it; `upto` ceilings and amounts of $1,000+ are excluded as placeholders (101 resources have no usable price at all).
- **The probe is one unauthenticated GET.** Not a payment, not a POST, no parameters. `2xx-no-paywall` means a bare GET got content without a challenge; it says nothing about the resource's real entry point.
- **"Wrong-domain"** is measured against the standard USDC domain. Bespoke settlement paths may work; stock clients will not.
- **"Farms"** means more than 300 listings on one domain. A threshold, not an accusation.
- **A snapshot.** Counters are trailing 30-day windows at fetch time.

## The data

- **Free, CC BY 4.0:** one row per resource — URL, domain, index counters, networks, schemes, minimum price, EIP-712 check, probe outcome: [`x402-bazaar-audit-2026-08-28.resources.jsonl`](https://fetchgate.dev/data/x402-bazaar-audit-2026-08-28.resources.jsonl), summary at [`/v1/x402-bazaar-audit.json`](https://fetchgate.dev/v1/x402-bazaar-audit.json).
- **The full registry, $15:** the x402 Services & Facilitator Registry, 2026-08-28 edition — every resource with its description, every payment option's networks/schemes/prices/payTo, the per-resource revenue proxy, full probe detail, the 21 facilitators with live `/supported` results, the curated 118-service table, schema and README. [Card checkout](https://growthchief5.gumroad.com/l/x402-registry) or x402 at `/v1/buy/x402-registry-2026-08-28`.
- **Check your own endpoint:** [fetchgate.dev/tools/x402-inspector](https://fetchgate.dev/tools/x402-inspector).

If a number here doesn't match what you compute from the rows, the number is wrong and we want to know: [open an issue](https://github.com/roblouw2nd/fetchgate/issues).
