---
title: "The x402 Bazaar Nearly Doubled in Five Weeks. 60% of August's Listings Are Already Gone."
seo_title: "x402 Bazaar, October 2026: 27,681 Endpoints, 770k Calls, ~$634/Day"
meta_description: "We re-fetched and re-probed all of Coinbase's x402 Bazaar five weeks after our first audit. Listings are up 87% to 27,681 and settled calls up 2.7x to 770,183, but one new endpoint took 40% of all calls, only 53% of listings still answer with a live 402, and 60% of the August listings no longer exist."
keywords:
  - x402
  - x402 Bazaar
  - agent payments
  - x402 adoption
  - Coinbase x402
  - agentic commerce
  - x402 market size
date: 2026-10-04
---

# The x402 Bazaar nearly doubled in five weeks. 60% of August's listings are already gone.

> Published at: https://fetchgate.dev/blog/x402-bazaar-october-2026 — this GitHub copy is a mirror; the canonical page has product links, related articles and an RSS feed.

On 2026-08-28 we [fetched every resource in Coinbase's x402 Bazaar](https://fetchgate.dev/blog/x402-bazaar-audit-2026), probed each URL once, and summed the index's own 30-day counters. The answer then was 14,820 paid endpoints and a market of at most $314 a day.

Five weeks later we ran the same pipeline again: same API, same one-GET probe, same arithmetic. Here is what changed.

## The headline numbers

| | Aug 28 | Oct 4 | Change |
| --- | ---: | ---: | ---: |
| Resources listed | 14,820 | 27,681 | +87% |
| Domains | 789 | 1,024 | +30% |
| Settled calls, trailing 30 days | 289,401 | 770,183 | 2.7x |
| Revenue ceiling, 30 days | $9,416 | $19,008 | 2.0x |
| Revenue ceiling per day | $314 | $634 | 2.0x |
| Resources answering with a live x402 challenge | 77.5% | 53.3% | |
| Resources with zero calls in 30 days | 60 | 4,082 | |
| Median calls per resource | 1 | 1 | |
| Median listed price | $0.01 | $0.01 | |

The market grew. It also got more lopsided, and most of the new supply is not being bought.

## One endpoint is 40% of the market

The busiest resource in the index did not exist in our August snapshot. `ax1.vc/api/dashboard/q-verdict/resource` takes a Base token contract address and returns an AI-written verdict, at $0.02 a call. The index credits it with **307,996 settled calls from 4,635 distinct payers** in 30 days.

That single URL is 40% of all calls in the Bazaar and 32% of the revenue ceiling ($6,160 of $19,008). Take it out and the rest of the market still grew, from 289,401 calls to 462,187 (+60%), with a ceiling of about $428 a day.

We can't tell from the index whether 4,635 payers are 4,635 customers. It is by far the largest payer count on any resource, and the next-largest belong to a block of endpoints that look farmed (below).

## Who else gained, and who lost

Growth among the established names was real:

- **`blockrun.ai`** went from 6,128 to 65,639 calls. Its pay-per-request chat-completions endpoint alone did 50,856 calls from 226 payers.
- **`oneshotagent.com`** went from 4,601 to 41,787. Its web-page reader did 11,868 calls and its email verifier 9,179.
- **`sniperx.fun`** went from 1,641 to 34,440, almost all of it from nine or fewer payers per endpoint.
- **`chain.link`** is still Chainlink calling Chainlink: 53,968 calls from three payers.

And the August leaders fell hard:

- **`twit.sh`**, second-busiest in August, dropped from 28,150 calls to 3,418.
- **`enrichx402.com`** dropped from 8,325 to 7.
- **`deepnets.ai`** dropped from 8,296 to 741, and **`tavily.com`** from 4,856 to 1,080.

A top-ten position in this market lasted about a month.

## 60% of August's listings no longer exist

Matching the two snapshots by resource URL:

- **5,864** resources are in both.
- **8,955** from August are gone (60.4%).
- **21,812** are new.

Some of that is URLs being renamed, which counts as one removal and one addition. But whole operators vanished too. `m2mcent.com` had 965 listings in August, the second-largest footprint in the index, and has none now. 203 of August's 789 domains are no longer listed at all; 438 new ones appeared.

Among the survivors, 320 changed their minimum price: 190 went up and 130 went down.

## The new supply is mostly farms

In August, ten domains held 38% of all listings. Now ten domains hold **53%**.

One domain, `datapackvibe.com`, listed **6,879 endpoints**, a quarter of the entire index. Together they received 5,579 calls: less than one call each. `rallylive.ca` added 2,084 endpoints, `syntexa.ch` 1,182 and `vextorium.com` 1,004, none of which existed in the August snapshot.

Fourteen domains now have more than 300 listings each, holding 15,955 resources between them. When we probed those 15,955, only 6,071 returned a live x402 challenge.

That is why the live share fell from 77.5% to 53.3%. It is also why "zero calls in 30 days" went from 60 resources to 4,082.

## The payer counts still look farmed in places

In August, 25 resources with more than 50 calls reported almost exactly one unique payer per call. Now there are **46**.

`onesource.io` is the clearest case: 70 endpoints, 16,098 calls, and a unique-payer total of 15,003. Its ERC-20 balance endpoint shows 823 calls from 815 distinct wallets. Either each request comes from a fresh wallet, or the unique-payers column, which directories rank by, is being inflated. Neither is a returning customer.

## What didn't change

- **The median resource still sold once.** 53.6% of resources had at most one call; 90.7% had at most five.
- **The median price is still one cent.** 80% of priced resources charge a cent or less.
- **Demand is more concentrated, not less.** 54 resources with more than 1,000 calls took 80% of all calls (34 took 60% in August).
- **Base is still about half.** 28,655 of 53,845 payment options are on Base, then Solana (7,947), Polygon and Arbitrum.
- **The registry and the server disagree on price for 706 resources.** The listed minimum and the live 402's minimum differ.
- **238 resources still declare a USDC signing domain a standard client can't pay.**

## What this means if you sell through x402

1. **The buyers exist, and they are few and concentrated.** Real growth went to LLM proxies, search, enrichment and token analysis, each bought by tens to hundreds of wallets. If you are not in one of those categories, plan for the median: one call a month.
2. **A listing is not a moat.** Six in ten were gone within five weeks, and the leaderboard turned over almost completely.
3. **Directory rank is being gamed.** Treat `uniquePayers` as a claim, and check it against the call count before you believe it.
4. **This is CDP's view only.** The index counts what Coinbase's facilitator settled. Sellers on PayAI or other facilitators, including our own endpoints, are absent. The real market is larger by an unknown amount.

## Method and limits

- **Index**: every page of `api.cdp.coinbase.com/platform/v2/x402/discovery/resources` (277 pages, 27,681 items) on 2026-10-03 22:54Z. The `quality` counters are Coinbase's.
- **Probe**: one unauthenticated `GET` per unique URL, 10-second timeout, identifying User-Agent, no payment ever sent. Many resources are POST-only, so a 405 is recorded as a 405, not as dead.
- **Revenue ceiling**: calls × minimum listed `exact` price, with listed amounts of $1,000 or more excluded as placeholders. It assumes every call paid the minimum.
- **Churn** is matched on exact resource URL. A renamed path counts as gone plus new.
- **"Farm"** means more than 300 listings on one registrable domain. Two of the fourteen (`workers.dev`, `onrender.com`) are hosting platforms shared by many unrelated sellers.

## The data

- **Free, CC BY 4.0:** one row per resource: [`x402-bazaar-audit-2026-10-04.resources.jsonl`](https://fetchgate.dev/data/x402-bazaar-audit-2026-10-04.resources.jsonl). Summary at [`/v1/x402-bazaar-audit.json`](https://fetchgate.dev/v1/x402-bazaar-audit.json). Lookup for any endpoint at [fetchgate.dev/tools/x402-bazaar-audit](https://fetchgate.dev/tools/x402-bazaar-audit). The August rows are still at [`x402-bazaar-audit-2026-08-28.resources.jsonl`](https://fetchgate.dev/data/x402-bazaar-audit-2026-08-28.resources.jsonl) if you want to diff them yourself.
- **The full registry, $15:** the [x402 Services & Facilitator Registry, 2026-10-04 edition](https://growthchief5.gumroad.com/l/x402-registry). It has every resource with its description, payment options, `payTo` addresses, revenue proxy and full probe detail, plus the month-over-month changes file behind this article. Agents can buy it over x402 at `https://fetchgate.dev/v1/buy/x402-registry-2026-10-04`.
- **Check your own endpoint:** [fetchgate.dev/tools/x402-inspector](https://fetchgate.dev/tools/x402-inspector).

If a number here doesn't match what you compute from the rows, the number is wrong and we want to know: [open an issue](https://github.com/roblouw2nd/fetchgate/issues).
