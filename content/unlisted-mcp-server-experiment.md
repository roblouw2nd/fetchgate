---
title: "We Ran an Unlisted Twin of Our MCP Server for 35 Days. It Got Zero Requests."
seo_title: "Unlisted MCP Server Experiment: 0 Requests in 35 Days vs. ~135,000 on the Listed Twin"
meta_description: "A controlled experiment on agent-web discovery: an exact copy of a directory-listed MCP server, deployed on an unguessable host and never listed anywhere, received not one request in 35 days while the listed original took roughly 135,000. What that says about crawlers, monitors and where MCP traffic really comes from."
keywords:
  - MCP server discovery
  - MCP registry crawlers
  - agent web traffic
  - unlisted MCP server
  - MCP monitoring bots
  - x402 discovery
date: 2026-09-06
updated: 2026-10-03
---

# We ran an unlisted twin of our MCP server for 35 days. It got zero requests.

> Published at: https://fetchgate.dev/blog/unlisted-mcp-server-experiment — this GitHub copy is a mirror; the canonical page has product links, related articles and an RSS feed.

When we published the [crawler census](https://fetchgate.dev/blog/agent-web-crawler-census) — 60 named bots hitting one directory-listed MCP + x402 endpoint, none of them buying anything — two readers on r/mcp asked the obvious follow-up questions. **Is all of that traffic really coming from the directory listings?** And **do the monitors learn from each other** — does a tool name published in one crawler's output end up being probed by another?

Both are answerable with a control. So on 2026-08-29 we deployed one.

## Update, 2026-10-03: still zero at 35 days

We promised a 30-day read-out for 2026-09-28. It is five days late, which makes the window longer, not weaker. The answer has not moved:

| Week | Listed server (requests, sampled) | Unlisted twin |
| --- | ---: | ---: |
| Aug 29 – Sep 4 | ~29,300 | 0 (+ our deploy-day smoke test) |
| Sep 5 – Sep 11 | ~24,800 | 0 |
| Sep 12 – Sep 18 | ~25,800 | 0 |
| Sep 19 – Sep 25 | ~27,500 | 0 |
| Sep 26 – Oct 2 | ~28,000 | 0 |
| **35 days** | **~135,500** | **0** |

- **The twin's request log still holds exactly the same five rows**: our own `curl` at 2026-08-29 20:37Z. No request of any kind in the 35 days since: no `GET /`, no `initialize`, no call to either of its unique tool names.
- **The twin was up the whole time.** Cloudflare shows a single deployment, unchanged since 2026-08-29, and its per-day invocation count agrees with its own log: nothing after deploy day. "Zero" here is a server that was reachable and was not reached, not a server that was down.
- **The hostname never leaked.** Before publishing this update we checked the site, sitemap, `llms.txt`, the RSS feed, the GitHub mirror and GitHub code search for it: no occurrences.
- **The listed side kept growing.** Weekly volume is flat to rising (~25–28k), and the like-for-like `/mcp` slice is up: **1,772 requests from 85 distinct user agents** in the 24 hours ending 2026-10-03 19:53Z, against 1,664 from 60 at the 8-day mark. More crawlers found the listed server this month; none found the twin.

So both conclusions below hold at 35 days, with more weight than at 8. The listings are still the whole discovery layer, and nothing that crawled the listed server went on to find its unlisted copy. Listed-server weekly figures come from Cloudflare's sampled `workersInvocationsAdaptive` dataset and are rounded. The twin's zero is exact: it comes from its own Analytics Engine log of every request.

The original eight-day write-up follows unchanged, except for the limits section.

## The setup

- **The listed server**: `fetchgate.dev/mcp`, the real thing. Published to the official MCP registry and around thirty x402 and MCP directories, linked from the site, the sitemap, `llms.txt`, and several articles and posts.
- **The unlisted twin**: a second Cloudflare Worker with the same MCP wire shape (`initialize`, `tools/list`, `tools/call`, the same headers, the same JSON-RPC error handling), deployed to an unguessable `workers.dev` hostname. It advertises **two tool names that exist nowhere else on the internet** — invented words, chosen so that any call to them by name would have to have been learned from this server's own `tools/list` output. It has never been listed, linked, submitted, posted, or mentioned anywhere, including in this article. Every request to it is logged: path, method, user agent, JSON-RPC method, tool name, country.

Same protocol, same account, same edge network, same eight days. One variable: **listed or not.**

## The result

| | Listed server | Unlisted twin |
| --- | ---: | ---: |
| Requests, 2026-08-29 → 09-05 (8 days) | **36,240** | **0** |
| Requests per day (range) | 3,248 – 7,218 | 0 |
| `/mcp` requests in the last 24h | 1,664 | 0 |
| Distinct user agents on `/mcp`, last 24h | 60 | 0 |
| Calls to the twin's unique tool names | — | 0 |

The twin's log contains exactly five rows: our own `curl` smoke test at deploy time, 2026-08-29 20:37Z, from South Africa. Nothing since. Not a liveness monitor, not a registry crawler, not a security scanner, not a subdomain enumerator, not a random `GET /`.

Zero is a small number, and it makes a clean statement. Per-day, for the record:

| Day | Listed | Unlisted |
| --- | ---: | ---: |
| Aug 29 | 7,218 | 4 (us) |
| Aug 30 | 4,009 | 0 |
| Aug 31 | 3,701 | 0 |
| Sep 1 | 3,700 | 0 |
| Sep 2 | 3,293 | 0 |
| Sep 3 | 3,248 | 0 |
| Sep 4 | 4,931 | 0 |
| Sep 5 | 6,140 | 0 |

## What this answers

**1. Yes, the traffic is the listings.** All of it. Not "mostly". Every one of the ~36,000 requests the listed server took in the window is downstream of a directory entry, a registry record, or a link. Remove those and the crawlers, monitors, graders and price-scrapers do not find you — because none of them is *searching*. They are reading lists.

**2. No, the monitors do not learn from each other — at least not within eight days.** Nobody called `tools/list` on the twin, so nobody could have republished its tool names, so nobody could have probed them. The "monitor-on-monitor" channel that a reader hypothesised is not carrying traffic at a rate this experiment can detect. (It cannot rule out the channel existing; it rules out the channel finding an unlisted server.)

**3. Nobody is enumerating `workers.dev`.** The twin sits on a subdomain of the same `workers.dev` account as the listed server. Wordlist scanning of that namespace, if anyone does it, did not reach a name like this one in eight days. That is expected — the hostname is not guessable — but it is worth having measured rather than assumed.

## What it means if you run an MCP server

**Listing is the whole discovery layer.** This is the same conclusion as the census, from the other direction. The census showed that being listed produces crawlers and nothing else; this shows that *not* being listed produces nothing at all. There is no ambient discovery on the agent web today — no equivalent of a search engine following links, no agent stumbling onto your endpoint because it was useful. If your server is not in a registry, then to every crawler, monitor and researcher measured here, it does not exist.

**Every "state of MCP" number is a number about the registries.** When we probed [15,329 remote servers in the official registry](https://fetchgate.dev/blog/mcp-registry-audit-2026) and found 47 hosts with concealment directives in their tool descriptions, that was a measurement of the listed population. So is every security scanner's finding, every uptime dashboard, every trust score. The unlisted population is unmeasured — by us, and, on this evidence, by everyone else too. That cuts both ways: an unlisted server is invisible to the security-research crawlers, and an unlisted *malicious* server is invisible to them as well.

**The monitors are not a signal of interest.** We had already concluded this from the census's payment log (zero payments from 6,309 requests), but the twin sharpens it. Sixty user agents hit the listed `/mcp` in the last 24 hours. If any of them represented a user choosing a server, you would expect at least some of that choosing to happen off-list — a link shared in a chat, a URL pasted into a client. The twin got none, because nothing on the agent web is currently choosing; it is enumerating.

## Honest limits

- **One twin, 35 days** (eight in the original write-up; see the update above). A longer window could still see a first request; the twin stays up, and if anything ever reaches it, this page will say so.
- **"Unlisted" bundles several things.** A `workers.dev` hostname has no certificate-transparency entry of its own (it sits under a wildcard certificate), no DNS zone to walk, and no root page. A never-listed server on a custom domain would separate "not in a registry" from "not in CT logs". That variant is the natural next experiment.
- **The listed server's request count is the whole Worker**, not just `/mcp`: it includes the site, the API, and the 402 challenges. The last-24h row (`/mcp` only, 1,664 requests, 60 user agents) is the like-for-like comparison, and the twin's zero holds against either.
- **This measures crawlers, not humans.** A person who was sent the twin's URL would obviously reach it. Nobody was.

## Method

Request counts for both Workers come from Cloudflare's account-level `workersInvocationsAdaptive` dataset, per script per day. The `/mcp` user-agent breakdown comes from zone analytics for `fetchgate.dev` over the 24 hours ending 2026-09-06T19:00Z. The twin logs every request to its own Analytics Engine dataset (path, method, user agent, JSON-RPC method, tool name, country, protocol version, `Accept`), which is where the "five rows, all ours" figure is read from.

The twin's hostname is deliberately absent from this article, from the site, from our sitemap and `llms.txt`, and from the GitHub mirror. The experiment is only valid while that stays true. If you run a crawler and would like to demonstrate that it can find unlisted servers: please don't — that is the measurement.

---

*This experiment is a by-product of running [Fetchgate](https://fetchgate.dev), a live x402 + MCP storefront. The measurements it draws on — the registry audit, the Bazaar audit and the crawler census — are written up with every number in [The Agent Web, Measured (2026 Q3)](https://growthchief5.gumroad.com/l/agent-web-report), a 25-page analyst report ($149; [free 5-page sample](https://fetchgate.dev/samples/the-agent-web-measured-2026-q3-sample.pdf)). The raw per-server rows behind the registry numbers are the [MCP Tool Inventory](https://growthchief5.gumroad.com/l/mcp-tool-inventory) dataset.*
