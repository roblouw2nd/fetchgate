# Fetchgate

[![MCP tool-description scan](https://fetchgate.dev/v1/scan-badge?url=https%3A%2F%2Ffetchgate.dev%2Fmcp)](https://fetchgate.dev/tools/mcp-scanner?url=https%3A%2F%2Ffetchgate.dev%2Fmcp)

**A web-content API and machine-payable storefront for AI agents.** Fetch any
URL as clean Markdown or structured metadata, and buy digital goods — all over
plain HTTP or MCP, with a free tier or pay-per-call via [x402](https://www.x402.org)
(USDC on Base), no account required.

Live: **https://fetchgate.dev** · MCP endpoint: `https://fetchgate.dev/mcp` ·
[`llms.txt`](https://fetchgate.dev/llms.txt) ·
[`openapi.json`](https://fetchgate.dev/openapi.json)

This repository is the public home and documentation for the hosted service
(the service runs on Cloudflare Workers). The machine-readable descriptors it
serves are mirrored here: [`llms.txt`](./llms.txt), [`openapi.json`](./openapi.json),
[`server.json`](./server.json).

## Products — datasets & tools for agent builders

Curated, honestly-sourced digital products for people building AI agents. Buy by
card on Gumroad, or machine-to-machine via x402 at `GET /v1/buy/:id`. **Free
samples** of each are in [`samples/`](./samples) — try before you buy.

> 💎 **Best value: [Fetchgate Complete Bundle](https://growthchief5.gumroad.com/l/agent-builder-bundle) — all 6 for $109** (save $39 vs. $148 separately).

| Product | What it is | Price | Sample |
| --- | --- | --- | --- |
| [x402 Quickstart Kit](https://growthchief5.gumroad.com/l/x402-quickstart) | Seller + buyer x402 reference code, TS + Python | $7 | [samples/x402-quickstart](./samples/x402-quickstart) |
| [x402 Services & Facilitator Registry](https://growthchief5.gumroad.com/l/x402-registry) | 21 facilitators + 118 x402-payable services | $15 | [samples/x402-registry](./samples/x402-registry) |
| [MCP Server Registry Snapshot](https://growthchief5.gumroad.com/l/mcp-registry) | 400 MCP servers, cross-referenced across 5 directories | $19 | [samples/mcp-registry](./samples/mcp-registry) |
| [Prompt-Injection & Tool-Hijack Test Corpus](https://growthchief5.gumroad.com/l/injection-corpus) | 156 labeled adversarial test cases + Python harness | $29 | [samples/injection-corpus](./samples/injection-corpus) |
| [Prompt-Injection Defenses Playbook](https://growthchief5.gumroad.com/l/injection-defenses) | 6-layer playbook + 84 detection rules + scanner | $39 | [samples/injection-defenses](./samples/injection-defenses) |
| [Agent Eval Harness Templates](https://growthchief5.gumroad.com/l/eval-harness) | 40-case eval kit, LLM-as-judge scorer, CLI runner | $39 | [samples/eval-harness](./samples/eval-harness) |

## What it does

### Reader API
Turn a URL into agent-ready content, server-side:

```bash
# URL -> clean Markdown (scripts/nav/ads/boilerplate stripped)
curl "https://fetchgate.dev/v1/read?url=https://example.com"

# URL -> structured metadata (title, description, canonical, OpenGraph, ...)
curl "https://fetchgate.dev/v1/meta?url=https://example.com"
```

Free tier: 30 requests/day per IP. Beyond that, pay per call via x402
(`/v1/read` $0.002, `/v1/meta` $0.001).

### MCP server
The same tools are exposed over the [Model Context Protocol](https://modelcontextprotocol.io)
(Streamable HTTP) at `https://fetchgate.dev/mcp`, so MCP-native agents can call
`read_url`, `get_metadata`, `list_products`, and `get_purchase_info` directly.
Listed in the official MCP registry as `dev.fetchgate/fetchgate`.

### Storefront (buy digital goods over HTTP)
`GET /v1/products` returns a catalog; `GET /v1/buy/:id` is a standard x402
402-then-pay flow that ends in a signed, time-limited download URL — an agent
can complete a purchase with no cart, checkout page, or human step. Current
inventory is agent-builder tooling (curated datasets, test corpora, harnesses).

```bash
curl "https://fetchgate.dev/v1/products"
curl "https://fetchgate.dev/v1/buy/x402-registry-2026-08-21"   # -> 402 x402 challenge
```

## How x402 payment works

A request with no payment gets HTTP `402` with the payment requirements (amount,
`payTo`, asset = USDC on Base). An x402-capable client re-sends the request with
a signed `X-PAYMENT` header; a facilitator verifies and settles the USDC
transfer, and the request succeeds. No signup, no API key, no stored card.

## Examples

See [`examples/`](./examples): [curl](./examples/curl.sh), [Python client](./examples/python_client.py), and [MCP client](./examples/mcp-client.md).

## Free tools

- **[MCP Tool Description Scanner](https://fetchgate.dev/tools/mcp-scanner)** — paste a remote MCP server URL; it fetches `tools/list` (never `tools/call`) and flags tool-poisoning patterns in every tool name, description, parameter description and the server's `initialize` instructions. JSON: `GET https://fetchgate.dev/v1/mcp-scan?url=<server>`. Also an MCP tool: `scan_mcp_server`.
- **[Agent Web Crawler Census](https://fetchgate.dev/tools/agent-census)** — every named bot observed crawling a live x402 + MCP endpoint, with matchers and categories. CC BY 4.0 JSON at `/v1/agent-census.json`.
- **[x402 Endpoint Inspector](https://fetchgate.dev/tools/x402-inspector)** — decode any URL's x402 payment challenge and see the mistakes that silently break signatures.

## Articles

All articles live at [fetchgate.dev/blog](https://fetchgate.dev/blog) (RSS: [/blog/feed.xml](https://fetchgate.dev/blog/feed.xml)); the copies in [`content/`](./content) are mirrors.

- [60 Bots Crawl the Agent Web. Zero of Them Buy Anything.](https://fetchgate.dev/blog/agent-web-crawler-census) — a first-hand census of every named crawler hitting a live x402 + MCP endpoint. Free dataset: [/tools/agent-census](https://fetchgate.dev/tools/agent-census)
- [What EIP-3009 Actually Is, and Why x402 Uses It Instead of approve()](https://fetchgate.dev/blog/eip-3009-transfer-with-authorization)
- [x402 vs. Stripe: When Machine-Payable APIs Actually Make Sense](https://fetchgate.dev/blog/x402-vs-stripe)
- [x402 Integration Guide: The Mistakes That Silently Break It](https://fetchgate.dev/blog/x402-integration-guide)
- [The x402 Facilitator Landscape in 2026: 21 Options Compared](https://fetchgate.dev/blog/x402-facilitator-landscape-2026)
- [MCP Tool Poisoning: How a Tool Description Becomes an Attack](https://fetchgate.dev/blog/mcp-tool-poisoning)
- [How to Build an LLM Eval Harness That Catches Regressions Before Your Users Do](https://fetchgate.dev/blog/llm-eval-harness-guide)
- [The MCP Server Registry: 400 Servers, Cross-Referenced Across 5 Directories](https://fetchgate.dev/blog/mcp-server-registry-2026)
- [Prompt-Injection Defense Checklist](https://fetchgate.dev/blog/prompt-injection-defense-checklist)
- [Jailbreak Taxonomy 2026: 24 Framings, 5 Families, and What a Scorer Should Actually Check](https://fetchgate.dev/blog/jailbreak-taxonomy-2026)
- [ASCII Smuggling and Invisible Unicode: The Prompt-Injection Technique Your Filters Can't See](https://fetchgate.dev/blog/ascii-smuggling-invisible-unicode)

## How it's built

[`ARCHITECTURE.md`](./ARCHITECTURE.md) — the x402 flow in detail, why the
payment layer is hand-rolled instead of using the official SDK, the
signed-download-URL-as-receipt pattern, how MCP shares one authorization
path with the plain HTTP routes, and the honest caveats (no chargebacks,
facilitator trust, thin real x402 volume industry-wide).

## Endpoints

| Endpoint | Purpose |
| --- | --- |
| `GET /v1/read?url=` | URL → clean Markdown |
| `GET /v1/meta?url=` | URL → structured metadata JSON |
| `GET /v1/products` | Digital-goods catalog |
| `GET /v1/buy/:id` | x402 402-then-pay → signed download URL |
| `POST /mcp` | MCP server (Streamable HTTP) |
| `GET /llms.txt`, `GET /openapi.json` | Machine-readable descriptors |

## Privacy & reliability

Fetched page content is not stored after a response is returned. Payments are
in beta (settlement runs through a third-party x402 facilitator on Base);
digital delivery only. This is an independent project — see `llms.txt` for the
current terms.
