---
title: "The MCP Server Registry: 400 Servers, Cross-Referenced Across 5 Directories"
seo_title: "Best MCP Servers 2026: 400 Servers Cross-Checked (Not Reposted)"
meta_description: "We cross-referenced 400 MCP servers across 5 directories (official registry, Smithery, Glama, PulseMCP, mcp.so). Only 4.5% show up in more than one — here's what that means for 'best MCP servers' lists."
keywords:
  - MCP server list
  - best MCP servers
  - Model Context Protocol servers
  - MCP registry
  - MCP directory
date: 2026-08-26
---

# The MCP server registry: 400 servers, sorted by what's actually production-ready

> Published at: https://fetchgate.dev/blog/mcp-server-registry-2026 — this GitHub copy is a mirror; the canonical page has product links, related articles and an RSS feed.

Search "best MCP servers" and you'll find a dozen listicles, most of them one directory's raw feed with a headline on top. That's not a knock on any single directory — the official registry, Smithery, Glama, PulseMCP, and mcp.so are each doing real, useful curation work. It's a knock on treating any *one* of them as the answer. Different directories catch different servers, apply different verification bars, and go stale at different rates. A list built from one source inherits that one source's blind spots.

Fetchgate's [MCP Server Registry Snapshot](https://growthchief5.gumroad.com/l/mcp-registry) exists because of what happens when you don't do that: cross-reference all five, keep the disagreements visible instead of picking a winner, and note per-entry which directory (or directories) actually list a server. The 2026-08-22 edition covers 400 servers this way. Here's what the cross-referencing itself reveals — independent of which servers made the list.

## Only 4.5% of servers show up in more than one directory

Of the 400 servers in this edition, **18 (4.5%) are cross-referenced across two or more directories.** The other **382 (95.5%) are single-source** — found in exactly one of the five.

That's the real finding, and it's not a data-quality complaint about any one directory. It's what you'd expect from five independently-run catalogs with different submission processes, different crawl schedules, and no shared canonical ID. But it means a "best MCP servers" list built from a single directory's export is, almost by construction, missing the ~95% of servers that happen to live in a different one — and has no way to know which of its own listings are stale, since nothing else is checking its work.

Source breakdown for this edition (a server can count toward more than one if cross-listed):

| Directory | Servers found here |
| --- | --- |
| Glama | 202 |
| mcp.so | 128 |
| PulseMCP | 38 |
| Official MCP Registry | 27 |
| Smithery | 21 |
| Community aggregator (awesome-mcp-servers) | 4 |

Glama and mcp.so together account for the large majority of raw listings in this snapshot — which also means a registry built only from the official MCP Registry (27 servers found there) or only from Smithery (21) is working from a small fraction of what's actually out there, however well-curated that fraction is.

## 4.5% already have a caught, documented problem

Cross-referencing doesn't just find more servers — it catches the ones that are quietly broken. **18 of 400 entries (4.5%) carry an explicit honesty note** in this edition: a dead repo URL (404 at verification time), a listing that looks archived or renamed, or a source that couldn't be independently confirmed. Those entries aren't deleted — a server that existed once is still useful provenance — but they're flagged, with the specific problem stated, rather than presented with the same confidence as a server whose repo resolves and whose maintainer is active.

A raw, unverified feed doesn't catch this. If you're building an agent that needs to actually connect to whatever server a list recommends, the gap between "was listed somewhere" and "resolves right now" is exactly the gap that wastes an integration afternoon.

## What's still unknown, honestly

Cross-referencing surfaces gaps as much as it fills them — and this snapshot doesn't paper over what it couldn't determine:

- **Transport is recorded for only 27 of 400 servers (6.75%)** — the rest show `null` because the source directories themselves don't consistently publish this, and confirming it per-server means either finding docs that state it explicitly or running the server, neither of which scales to 400 entries in one edition.
- **Auth requirements are recorded for 27 of 400 (6.75%)** — same limitation, same reason.
- **167 of 400 (41.75%) have a named maintainer** on record; the rest are attributed to an organization or left unattributed where the source didn't surface an individual.

None of this is unique to Fetchgate's dataset — it's the actual state of MCP server metadata across the ecosystem in August 2026, made visible instead of smoothed over. A list that doesn't mention these gaps either did the verification work silently (unlikely, at this scale) or didn't do it at all.

## Category spread

| Category | Servers |
| --- | --- |
| Dev tools | 59 |
| Other / uncategorized | 57 |
| Data & databases | 53 |
| Productivity | 52 |
| DevOps & cloud | 36 |
| Communication | 30 |
| Media | 25 |
| AI / ML | 23 |
| Search & web | 19 |
| Finance | 16 |

Dev tools, data/databases, and productivity dominate — consistent with MCP's current center of gravity being developer- and knowledge-worker-facing integrations rather than, say, consumer or gaming use cases.

## What this means if you're picking an MCP server

Cross-referencing doesn't replace judgment — a server appearing in two directories isn't automatically better than one appearing in a single, well-maintained one. But it's a useful, cheap first filter: a listing with independent corroboration across directories has survived at least two different people's curation bar, and a listing flagged with a dead repo URL is a server you can stop evaluating before you waste time on it. Neither signal exists if you're reading from one source.

If you're building something that calls MCP servers programmatically rather than picking one by hand, the same logic applies at scale: reconciling five directories yourself, by hand, for every server you might want to use, is exactly the work this snapshot exists to skip.

---

This is the 2026-08-22 edition: 400 servers, cross-referenced across the official MCP Registry, Smithery, Glama, PulseMCP, and mcp.so, with per-entry source attribution, verification dates, and honesty notes where something couldn't be confirmed. The **[MCP Server Registry Snapshot](https://growthchief5.gumroad.com/l/mcp-registry)** ($19) has the full dataset — `servers.json`, a JSON Schema, and the same data as sortable Markdown tables grouped by category — [see a free sample of 30 servers first](https://github.com/roblouw2nd/fetchgate/tree/main/samples/mcp-registry). Fetchgate's own [MCP server](https://fetchgate.dev/mcp) is listed in the official registry as `dev.fetchgate/fetchgate`, for what it's worth as a data point on the registry's own coverage.
