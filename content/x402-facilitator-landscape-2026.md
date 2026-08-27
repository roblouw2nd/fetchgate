---
title: "The x402 Facilitator Landscape in 2026: 21 Options Compared"
seo_title: "x402 Facilitators Compared (2026): Fees, Chains, Status"
meta_description: "21 real x402 facilitators compared on chain support, fee model, and access status — which are open and unauthenticated, which are gated, and which now charge per settlement."
keywords:
  - x402 facilitator
  - x402.org facilitator alternatives
  - x402 facilitator comparison
  - Coinbase CDP facilitator fees
  - PayAI facilitator
date: 2026-08-24
---

# The x402 facilitator landscape in 2026: 21 options compared

> Published at: https://fetchgate.dev/blog/x402-facilitator-landscape-2026 — this GitHub copy is a mirror; the canonical page has product links, related articles and an RSS feed.

Every x402 seller needs a facilitator — the third party that runs `/verify` and `/settle` against a buyer's signed payment so the seller never has to hold a private key or run an RPC client. The spec doesn't mandate one, which means "just use the facilitator" glosses over a real decision: 21 of them exist right now, with meaningfully different chain support, fee models, and — this is the part most guides skip — whether you can actually reach them without a signup step.

This is a snapshot from Fetchgate's own [x402 Services & Facilitator Registry](https://growthchief5.gumroad.com/l/x402-registry) dataset, collected 2026-08-21 and reconciled against `facilitators.x402.watch`, the x402 GitHub org, and each facilitator's own docs where available. Full source list per entry is in the dataset; here's the shape of it.

## The headline split: 16 open, 4 gated or paid, 1 testnet-only

Of the 21:

- **16 are `active`** — reachable with no signup, no API key, no waitlist. This is most of them, and it's the main reason x402 is usable at all for an indie seller: you can point a Worker at a facilitator URL today and get a working `/verify` + `/settle` pair.
- **2 are `gated`** (KAMIYO, AurraCloud) — access requirements aren't publicly documented; you'd need to reach out directly.
- **1 is `gated+paid`** (Thirdweb) — part of a broader paid developer platform, not a standalone free facilitator.
- **1 is `testnet-only`** (the x402.org community facilitator) — free, but scoped to `base-sepolia` for development, not production settlement.
- **1 is `unverified`** (xpay) — advertised zero-fee with gas-sponsored settlement per its own blog post, but absent from the main aggregator directory at verification time; treat as unconfirmed until you've tested it yourself.

If you're choosing a default today, start from the 16 `active` ones — they're the ones you can actually wire up this afternoon.

## Chain coverage

| Chain | Facilitators supporting it |
| --- | --- |
| Base | 16 |
| Solana | 10 |
| Polygon | 4 |
| Base Sepolia (testnet) | 1 (dev-only) |

Base dominates — unsurprising, since it's Coinbase's own chain and the one most x402 tooling and docs default to. If you need Solana specifically, your real options narrow to a handful: PayAI, Coinbase CDP, Codenut, OpenX402, Daydreams, UltravioletaDAO, Corbits, Dexter, KAMIYO (gated), and AurraCloud (gated) — check the dataset for current status before picking one, since "listed" and "gated" both count toward that total.

## The fee model that actually matters: Coinbase CDP isn't free anymore

The most consequential entry on this list is also the one most tutorials still point to by default. **Coinbase CDP's facilitator** — `facilitator.cdp.coinbase.com` — now charges **$0.001 per settled payment after the first 1,000 free settlements per month**, effective 2026-01-01, with first bills going out 2026-02-01. `facilitators.x402.watch` lists it as "0% fee," which is technically about markup/percentage, not this flat per-settlement charge — worth reading past the headline number if you're comparing on that aggregator alone.

Coinbase CDP also runs **KYT/OFAC screening** on every transaction it processes. It's non-custodial — settled USDC lands directly in your own wallet, not a Coinbase-controlled account — but the screening step is a real integration and compliance consideration most "just use CDP" defaults don't mention.

Every other `active` facilitator in this dataset is listed at **0% fee** per the aggregator (worth independently verifying before you commit real volume to one — fee pages change). None of the other 15 open facilitators disclose a KYC/KYT step in the sources checked for this edition.

## Facilitators worth knowing by name

**PayAI** (`facilitator.payai.network`) — Base + Solana, no signup, no auth. This is what Fetchgate's own live seller uses in production. No published fee, no documented KYC step, and it's been reliable enough to run a real storefront against.

**X402rs** (`facilitator.x402.rs`) — Base + Polygon, 0% fee, and notably ships **an open-source Rust reference implementation** (`x402-rs` on GitHub) that other facilitators and sellers build on. If you ever want to self-host rather than depend on a third party, this is the code most likely to be your starting point.

**Heurist**, **Questflow**, **Daydreams**, **UltravioletaDAO**, **Codenut**, **OpenX402**, **Mogami**, **402104**, **Xecho**, **Virtuals Protocol**, **Corbits**, **Dexter**, **Polygon's own facilitator** — all `active`, all listed at 0%, all worth a look depending on which chain you need. None has enough independent documentation in this dataset to say much more than "reachable and free" — which, for picking a facilitator to integration-test against, is often exactly what you need to know first.

**The x402.org community facilitator** (`x402.org/facilitator`) — free, `base-sepolia` only, documented directly in Cloudflare's own Workers x402 example. This is the right facilitator to point at while you're integrating and don't want real money moving yet — see the [x402 integration guide](./x402-integration-guide.md) for why testing against a testnet facilitator first catches the EIP-712 domain-name mismatch and network-string bugs before they cost you a debugging afternoon on mainnet.

## What "0% fee" doesn't tell you

Every facilitator on this list except Coinbase CDP and Thirdweb is listed at a flat 0% fee — but a fee-model field only captures one axis. Before you route production volume through any of them, this dataset's own honesty notes apply to your own diligence too:

- **Uptime and response time aren't in this dataset.** A free facilitator that's slow or flaky costs you more in failed settlements than CDP's $0.001/tx would.
- **"0% fee" on the aggregator isn't independently re-verified per entry here** — fee pages change, and a facilitator can start charging (as CDP did) without every downstream directory catching up immediately.
- **Security posture varies more than fee model does.** Independent research (USENIX 2026) found every major x402 facilitator tested — Coinbase's included — had at least one security flaw under adversarial testing. A facilitator being free and unauthenticated doesn't mean it's been hardened; it means the friction to start using it is low. Keep your seller's `payTo` receive-only wherever possible, since that's the one property that limits a compromised facilitator's blast radius regardless of which one you pick.

## Picking one

If you're integrating today and don't already have a reason to pick otherwise: start on the **x402.org community facilitator** against `base-sepolia` while you're still finding integration bugs, then move to **PayAI** or **Coinbase CDP** for mainnet depending on whether you want zero published fees (PayAI, unaudited beyond this dataset) or Coinbase's brand recognition and KYT screening at $0.001/settlement past 1,000/month (CDP). If Solana is a hard requirement, PayAI covers both chains from one facilitator, which simplifies a seller that needs to support both.

---

This is a 2026-08-21 snapshot of 21 facilitators — chains, on-chain addresses where public, fee models, KYC/custody notes, and every source URL used to verify each entry. The **[x402 Services & Facilitator Registry](https://growthchief5.gumroad.com/l/x402-registry)** ($15) has the full machine-readable dataset (`facilitators.json` + `services.json`, 118 payable services alongside the facilitators), a JSON Schema, and the same data as sortable Markdown tables — [see a free sample of 5 facilitators + 10 services first](https://github.com/roblouw2nd/fetchgate/tree/main/samples/x402-registry). If you're building the buyer or seller side yourself rather than picking a service to integrate against, the **[x402 Quickstart Kit](https://growthchief5.gumroad.com/l/x402-quickstart)** ($7) has working reference code for both, in TypeScript and Python.
