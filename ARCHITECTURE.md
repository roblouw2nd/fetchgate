# How Fetchgate is built

A technical walkthrough of the storefront and payment flow, for anyone
building something similar — an API or store meant for AI agents rather
than humans clicking a checkout page.

## The problem

Every digital-goods platform aimed at humans — Gumroad, Etsy, Shopify —
assumes a browser, a cart, and a person entering card details. There's no
API path an *unattended* agent can complete a purchase through: it always
needs a human to have provisioned a credential first (an API key, a stored
card, an OAuth token). That's fine for a human-operated integration, but it
breaks down for an agent that's supposed to just... decide to buy something
and do it, mid-task, without stopping to ask a human to go set up an
account.

[x402](https://www.x402.org) (HTTP 402 Payment Required, revived as an
actual protocol) is a reasonable answer: a resource server returns `402`
with a machine-readable description of what payment it wants, the caller's
wallet signs an authorization, and the caller retries the same request with
the payment attached. No account, no session, no human in the loop.

## The flow, concretely

```bash
$ curl -i https://fetchgate.dev/v1/buy/x402-registry
HTTP/1.1 402 Payment Required
content-type: application/json

{
  "x402Version": 1,
  "accepts": [{
    "scheme": "exact",
    "network": "base",
    "maxAmountRequired": "15000000",
    "resource": "https://fetchgate.dev/v1/buy/x402-registry",
    "payTo": "0x5961...0864c",
    "asset": "0x8335...02913",
    "maxTimeoutSeconds": 60
  }]
}
```

The caller's wallet signs an EIP-3009 `transferWithAuthorization` for that
exact amount, base64-encodes the resulting payload, and retries:

```bash
$ curl https://fetchgate.dev/v1/buy/x402-registry \
    -H "X-PAYMENT: <base64 payload>"
HTTP/1.1 200 OK

{ "downloadUrl": "https://fetchgate.dev/v1/download/...", "expiresInSeconds": 900 }
```

The server never touches a private key or a chain RPC directly — it hands
the payload to a **facilitator** (a third-party service that verifies the
signature and settles the on-chain transfer) via two calls, `/verify` then
`/settle`, and only serves the resource once settlement succeeds.

## Why hand-rolled, not the official SDK

The obvious move is `x402-hono` / `@x402/hono`. We didn't use it. At the
time this was built, the package landscape was mid-migration: the older,
simpler API (`x402-hono@1.2.0`) pulls in `viem`, `@solana/kit`, and
`@coinbase/cdp-sdk` as hard dependencies — multiple megabytes of chain-client
code a *seller-side* Worker never needs, on a runtime (Cloudflare Workers)
where every dependency is a real cold-start and bundle-size cost. The
current `@x402/*` packages replaced that with a more modular architecture,
but default `syncFacilitatorOnStart` to `true` — a network call at
middleware-construction time that either has to hit the real network in
tests or requires reverse-engineering a multi-package SDK's internals to
fake convincingly.

The seller-side surface of the protocol, read directly off the spec, is
genuinely small: build a `PaymentRequirements` object, decode an
`X-PAYMENT` header, POST it to two facilitator endpoints, check a boolean.
Implementing that directly against the wire format (pulled from the
protocol's own spec repo, not from memory) turned out lower-risk than
betting on either package's shape holding still — no dependency to go
stale, no network call to fake in tests, and the whole payment module is
small enough to read in one sitting.

## The download link is the receipt

There's no user account, so there's nothing to "own" a purchase after it's
made. Instead, a successful payment mints a signed, short-lived URL
(`/v1/download/:id`, ~15 minutes) — possession of that URL *is* the proof
of purchase. It's an HMAC over the product id and an expiry timestamp,
checked on every download request; the static files themselves are never
served at a guessable public path (a direct hit on the underlying asset
path 404s). This is the same shape as a capability token in the
access-control sense: authorize *the specific action*, not *the actor* —
there's no session to steal, and the token is useless for anything except
downloading that one file within that one window.

## MCP on top of the same authorization path

The MCP server (`POST /mcp`) exposes the same reader/storefront
functionality as tools (`read_url`, `get_metadata`, `list_products`,
`get_purchase_info`) for agent frameworks that prefer MCP over raw HTTP.
Rather than reimplementing the free-tier / API-key / x402 decision logic
for the MCP path, both surfaces call into one shared function
(`checkPaywall`). A request arriving as `POST /v1/read` and a request
arriving as an MCP `tools/call` for `read_url` hit the exact same
authorization check — there's one place in the codebase that decides
"is this allowed," not two copies that can drift out of sync.

## Honest caveats

- **No chargeback mechanism.** If something ships broken after a valid
  payment, there's no reversal path the way a card network gives you one.
  This is a deliberate reason the storefront only sells cheap digital
  files with a short expiry, not anything higher-stakes.
- **Real x402 commercial volume is still small industry-wide.** This isn't
  a "build it and agents will come" bet — the reader endpoints exist
  partly as a free/cheap on-ramp specifically because the store needed a
  reason for directories and agents to discover the domain at all.
- **The facilitator is a trust dependency.** It verifies signatures and
  settles payment; a facilitator bug is a real risk surface. The payee
  wallet is receive-only, so a compromised facilitator can't drain funds —
  but it could theoretically let a payment through that shouldn't clear.
  Priced accordingly (cheap, non-refundable digital goods) rather than
  treated as bank-grade.

## Stack

Cloudflare Workers (Hono, TypeScript), static assets for the product zips
(no R2 needed at this scale), Vitest for tests, no external database — rate
limiting and download tokens are the only stateful pieces, backed by KV.
