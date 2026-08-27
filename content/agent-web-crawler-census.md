---
title: "60 Bots Crawl the Agent Web. Zero of Them Buy Anything."
seo_title: "The Agent Web Crawler Census: 60 Bots, 6,309 Requests, 0 Payments"
meta_description: "A first-hand census from a live, publicly-listed x402 + MCP endpoint: 60 named crawlers, 6,309 requests in 24 hours, and not one payment. Several bots declare they never pay in their own User-Agent string."
keywords:
  - x402 adoption
  - agent web crawlers
  - MCP server directory
  - AI agent bot traffic
  - machine payable API
  - agent commerce
date: 2026-08-27
---

# 60 bots crawl the agent web. Zero of them buy anything.

> Published at: https://fetchgate.dev/blog/agent-web-crawler-census — this GitHub copy is a mirror; the canonical page has product links, related articles and an RSS feed.

We built a machine-payable API, listed it in about thirty x402 and MCP directories, and waited to see who showed up.

Plenty showed up. In a single 24-hour window, **6,309 requests from 187 distinct user agents**, of which **60 were named, self-identifying agent-web crawlers**. They discovered the endpoint, fetched its catalog, decoded its payment challenges, graded its trustworthiness, health-checked it on a schedule, and recorded its prices.

**Not one of them has ever paid for anything.**

Not "few." Not "conversion is low." Zero. Across the endpoint's entire lifetime, its payment log records exactly two payment attempts — both of them ours, both deliberately-invalid test signatures fired at our own facilitator to verify the wire format.

The full dataset is published free at [fetchgate.dev/tools/agent-census](https://fetchgate.dev/tools/agent-census), machine-readable at [`/v1/agent-census.json`](https://fetchgate.dev/v1/agent-census.json), CC BY 4.0. This article is what we think it means.

## The bots say it themselves

The most striking thing in the data isn't a number. It's that a third of these crawlers **declare their non-payment in the User-Agent string**, unprompted:

| User agent | Self-declaration |
| --- | --- |
| `SentinelOracle/0.1` | *"liveness-only, never invokes tools"* |
| `AgentAlmanac-PriceBot/0.1` | *"reads-402-price-quotes-only-never-pays"* |
| `AIVE-MCP-EndpointProbe/1.0` | *"reachability check only, no auth attempted"* |
| `lastseen-schema-probe/1.0` | *"introspection-only"* |
| `merona-mcp-probe/0.1` | *"read-only research"* |
| `x402-observer/1.0` | *"uptime+trust monitor"* |

`reads-402-price-quotes-only-never-pays` is, as far as we can tell, an honest engineer writing the most useful possible User-Agent string. It is also a perfect one-line summary of the entire agent-payments economy as of August 2026.

## What's actually out there

Every crawler in the census, bucketed by what it did rather than what it called itself:

| Category | Crawlers | Requests/24h | Paid |
| --- | ---: | ---: | ---: |
| Liveness / uptime monitor | 14 | 1,396 | 0 |
| Directory & index crawler | 16 | 718 | 0 |
| Security research | 5 | 50 | 0 |
| Search engine | 3 | 46 | 0 |
| Ecosystem census / research | 9 | 39 | 0 |
| AI training / retrieval | 2 | 20 | 0 |
| Price-quote scraper | 4 | 17 | 0 |
| Contact / domain harvesting | 3 | 11 | 0 |
| Misc utility | 3 | 10 | 0 |
| SEO / backlink | 1 | 8 | 0 |

Two categories — liveness monitors and directory crawlers — are **91% of all named-agent traffic** (2,114 of 2,315 requests). That is the shape of an ecosystem that is entirely infrastructure and entirely no customers. Thirty different services want to tell you whether the endpoint is up. None of them want what it sells.

Roughly 600 of the day's requests hit a `/v1/buy/*` route and got back a valid HTTP 402 with signed payment requirements, a price in USDC, and a Coinbase Bazaar discovery extension. All 600 read the challenge and left.

## This is not a "your product is bad" result

The obvious objection: maybe nobody's buying because the products aren't good, or the price is wrong, or the copy is weak.

That would be a fair reading of a low conversion rate. It doesn't explain this data, for a specific reason: **the crawlers aren't bouncing off the offer, they're not evaluating an offer at all.** A price-scraper that records `$7.00` and moves on has not considered and rejected a purchase. A liveness monitor that checks `/mcp` every four minutes is not a lead. There is no funnel here to optimise, because nothing in the traffic is attempting to transact in the first place.

The endpoint's own instrumentation makes this checkable rather than a matter of opinion. Every x402 verify/settle attempt is recorded at a single choke point, so "an agent tried to pay and something broke" and "no agent ever tried to pay" are distinguishable outcomes. It is unambiguously the second one.

## What we'd tell anyone building a machine-payable API

**Discovery is solved. Demand is not.** Getting listed is genuinely easy and genuinely works — a handful of free submissions reliably produces crawlers, grades, uptime badges, trust scores, and index entries within days. It feels like traction. It converts to nothing. If your plan for reaching paying customers is "list it in the directories," you do not have a plan, you have a to-do list that terminates in bots.

**Instrument the payment path before you need it.** The single most useful thing we built was recording every payment *attempt*, not just every success. Without it we'd have spent days debugging a settlement flow that was never being exercised. Log the attempt, the failure reason, and the resource, from day one — it's what lets you tell a price-scraper from a customer.

**Serve humans too.** Every crawler in this census is a machine, and machines currently do not spend money without a human who decided they should. An x402-only checkout is a bet that autonomous agent purchasing arrives before you run out of patience. Ours runs both rails — x402 for agents, plain card checkout for humans — and that redundancy costs almost nothing.

**Treat "listed in N directories" as a vanity metric.** It measures how discoverable you are to other people's crawlers. It does not measure whether anyone wants the thing.

## What would change this

We're not arguing the agent economy is fake. We're reporting that on 2026-08-27, at one live endpoint, its buy side had not arrived. Three things would visibly move this number, and each would show up in exactly this kind of log:

1. **Agent frameworks shipping payment as a default capability.** Today, an agent that hits a 402 almost always gives up, because it has no wallet and no authority to spend. That's a framework gap, not a protocol gap — x402 works fine, the tests pass, the facilitator settles.
2. **A human-in-the-loop spend approval that isn't painful.** The bottleneck isn't signing a transaction, it's a person deciding an agent may spend $7 without being asked each time.
3. **Something worth buying at agent scale.** Most of what's for sale on the agent web today, ours included, is a dataset or a utility a human buys once. That's not a purchase pattern that needs machine payments. The rail is waiting for a use case shaped like a rail.

## Method, and what this doesn't show

Traffic counts come from Cloudflare zone analytics for `fetchgate.dev` (`httpRequestsAdaptiveGroups`) over the 24 hours ending 2026-08-27T20:30Z. Payment counts come from the endpoint's own Analytics Engine dataset, which records every verify/settle attempt.

Honest limits:

- **This is one endpoint.** A busier or differently-positioned service will see a different mix. It's a real sample, not the population.
- **2,981 of the window's requests were a single-hour vulnerability-scanner burst** — a bare `curl` UA out of France hammering `/admin.pl`, `/_config`, `/SiteServer`. Ordinary web background radiation, nothing to do with agents, excluded from the named-agent census above.
- **Categories are assigned from observed request paths**, cross-checked against each agent's self-description. A well-disguised crawler would be miscategorised.
- **"Never paid" means never paid *this* origin.** It is not a claim that these operators never pay anyone.
- **A snapshot, not a live feed.** It's refreshed by hand rather than by handing a Worker an account-scoped analytics token.

If you operate one of these crawlers and we've got your category wrong, the matcher is too broad, or you'd rather not be listed — tell us and we'll change it.

## Take the data

The census is free, unmetered, and CC BY 4.0. Classify your own access log in about five lines:

```js
const census = await (await fetch("https://fetchgate.dev/v1/agent-census.json")).json();
const rules = census.agents.map(a => [new RegExp(a.matcher, "i"), a.category]);

const classify = (ua) =>
  rules.find(([re]) => re.test(ua))?.[1] ?? "unknown";
```

It's also exposed as an MCP tool — `get_agent_census`, optionally filtered by category — on Fetchgate's [MCP server](https://fetchgate.dev/mcp).

---

*This census is a by-product of running [Fetchgate](https://fetchgate.dev), a real x402 + MCP storefront. The paid datasets come from the same crawling and reconciliation work: the [x402 Services & Facilitator Registry](https://growthchief5.gumroad.com/l/x402-registry) (21 facilitators, 118 services, $15) and the [MCP Server Registry Snapshot](https://growthchief5.gumroad.com/l/mcp-registry) (400 servers cross-referenced across 5 directories, $19).*
