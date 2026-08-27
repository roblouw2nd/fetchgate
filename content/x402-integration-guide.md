---
title: "x402 Integration Guide: The Mistakes That Silently Break It"
seo_title: "x402 Integration Guide (Copy-Pasteable, With Gotchas)"
meta_description: "A correct, working x402 integration walkthrough — seller and buyer sides — plus the EIP-712 domain, decimals, and facilitator mistakes that fail silently."
keywords:
  - x402 integration
  - x402 tutorial
  - x402 EIP-3009 signature
  - x402 payment protocol
  - USDC micropayments API
date: 2026-08-23
---

# Integrating x402 payments: a correct, copy-pasteable guide (with the mistakes that silently break it)

> Published at: https://fetchgate.dev/blog/x402-integration-guide — this GitHub copy is a mirror; the canonical page has product links, related articles and an RSS feed.

x402 revives the long-dormant HTTP `402 Payment Required` status code as a real payment handshake: a server responds `402` with machine-readable payment terms, a client signs an authorization and retries the same request with an `X-PAYMENT` header, and a third-party facilitator verifies and settles the transfer on-chain. No API keys, no account creation, no card processor — just a request, a signature, and a retry.

The protocol itself is small. What trips people up is a handful of details that don't show up as errors — they show up as a signature that looks perfectly valid and gets silently rejected. This guide walks through a correct integration on both sides, then spends most of its time on those failure modes.

## The flow, end to end

1. **Client requests a resource with no payment.** Server responds `402` with a JSON body: `{ x402Version: 1, accepts: [PaymentRequirements] }`.
2. **Client picks an `accepts[]` entry**, builds an EIP-3009 `transferWithAuthorization` authorization (from, to, value, validAfter, validBefore, nonce), and signs it as EIP-712 typed data with its wallet.
3. **Client base64-encodes the signed payload** and retries the *identical* request with header `X-PAYMENT: <base64>`.
4. **Server verifies the payload** against a facilitator's `POST /verify`, then calls `POST /settle` to submit the on-chain transfer. Facilitators exist specifically so a seller never needs a private key or an RPC client — verification and settlement are two HTTP calls.
5. **Server returns the real response**, with an `X-PAYMENT-RESPONSE` header carrying the settlement result (`success`, `transaction` hash, `network`, `payer`).

EIP-3009 matters because it's a *signature-only* authorization — no ERC-20 `approve()` step, no gas held by the buyer. That's most of why x402 works for agent-to-agent micropayments at all.

## Seller side (minimal, Hono/Workers)

```ts
import { Hono } from "hono";
import { x402Middleware } from "x402-quickstart-seller";

const app = new Hono();

app.get(
  "/paid-thing",
  x402Middleware({
    config: {
      payTo: "0xYourWalletAddress",
      network: "base",
      facilitatorUrl: "https://x402.org/facilitator", // testnet while integrating
    },
    price: { atomicAmount: "10000", description: "One paid thing" }, // $0.01 USDC
  }),
  (c) => c.json({ ok: true }),
);
```

That middleware does three things per request: check for `X-PAYMENT` and return a 402 built from `PaymentRequirements` if absent; if present, call the facilitator's `/verify` then `/settle`; on success, attach `X-PAYMENT-RESPONSE` and let the request through. Building `PaymentRequirements` correctly is where the first real gotcha lives.

## Buyer side (minimal, TypeScript/viem)

```ts
import { privateKeyToAccount } from "viem/accounts";
import { fetchWithPayment } from "x402-quickstart-buyer";

const account = privateKeyToAccount(process.env.PRIVATE_KEY as `0x${string}`);

const { response, settlement, paid } = await fetchWithPayment(
  "https://example.com/paid-thing",
  {},
  { account },
);

if (!response.ok) throw new Error(`HTTP ${response.status}`);
console.log("paid:", paid, "settlement:", settlement);
```

`fetchWithPayment` does exactly one thing: request, check for 402, sign and retry once if present. It doesn't loop, doesn't retry a rejected payment, and doesn't manage on-chain USDC balance for you — wrap it in your own retry policy for production.

Now, the parts that actually cost debugging time.

## The mistakes that silently break it

### 1. The EIP-712 domain `name` is not the same on every network

This is the one most likely to eat an afternoon, because it doesn't throw — it produces a **validly-shaped signature that just doesn't verify**, and most facilitators can only tell you `invalid_payment`, not *why*.

The EIP-712 signing domain (`name`, `version`, `chainId`, `verifyingContract`) has to match the deployed token contract's own on-chain values exactly. Real USDC on **Base mainnet** has an EIP-712 domain `name` of `"USD Coin"` — not `"USDC"`. Base **Sepolia's** testnet USDC contract, confusingly, actually is named `"USDC"`. Same token symbol, different EIP-712 domain string, verified directly against both deployed contracts. `version` happens to be `"2"` for both, but don't assume that generalizes to other networks or assets.

The fix is structural, not a lookup you memorize: the **seller** builds `extra: { name, version }` from a small per-network table and puts it in the 402 response; the **buyer** *reads* `name`/`version` from that `extra` field and refuses to sign if it's missing, rather than hardcoding a guess.

```ts
// seller: per-network domain table, not a guessed constant
export const USDC_EIP712_DOMAIN: Record<string, { name: string; version: string }> = {
  base: { name: "USD Coin", version: "2" },
  "base-sepolia": { name: "USDC", version: "2" },
};
```

```ts
// buyer: never hardcode — read from the server's own requirements
const { name, version } = requirements.extra ?? {};
if (!name || !version) {
  throw new Error("Missing EIP-712 domain in requirements.extra — refusing to guess.");
}
```

If you add a network this doesn't cover, look up that network's deployed token contract's real `name()`/`version()` yourself (an RPC call or the contract's verified source) — don't assume "USDC" is the domain name just because it's the ticker symbol.

### 2. Atomic units, not decimal dollars

`maxAmountRequired` and the authorization's `value` are a **decimal string of atomic units**, not a float and not a dollar amount. USDC has 6 decimals, so $0.05 is `"50000"`, not `"0.05"`. Hand-rolling this with `usd * 1_000_000` as a JS float is fine right up until a floating-point rounding edge case makes your price off by one atomic unit and the facilitator rejects the mismatch. Use a helper (`Math.round(usd * 1_000_000)` at minimum) and never coerce `value`/`validAfter`/`validBefore` through a JS `number` on the signing path — keep them as strings (or `bigint`/Python `int` only at the point your signing library needs them) all the way to the wire.

### 3. The network string doesn't match

A 402's `accepts[]` entry says `"network": "base"`. If your buyer signs for `"base-sepolia"` — wrong testnet/mainnet — the payment fails, usually with a generic `invalid_payment` that gives no hint it was a network mismatch. When a payment "should" work and doesn't, check the network string on both sides *before* looking anywhere else.

### 4. Picking a facilitator without checking what it actually requires

A facilitator verifies your signed authorization and submits the on-chain transfer — as a seller you never touch a private key. But facilitators differ more than the spec implies: some are open and unauthenticated (`x402.org/facilitator` for `base-sepolia` testing, PayAI, Heurist), some gate access behind an account, and Coinbase's CDP facilitator — the most commonly defaulted-to option — runs KYT/OFAC screening on every transaction and now bills $0.001/settlement past the first 1,000/month. That's a real cost and integration-friction input, not a rounding error, worth checking *before* you wire your seller to one. Start on a public testnet facilitator against `base-sepolia` while integrating — no real money moves, and wiring bugs (header casing, malformed JSON, the network mismatch above) are free to find there.

### 5. Weak or reused nonces

The `nonce` in an EIP-3009 authorization is what prevents replaying the same signed authorization twice. Use a cryptographically secure random source (`crypto.getRandomValues`, Python's `os.urandom`) — not `Math.random()`, not a counter. A predictable nonce is a real replay risk, not a style nit.

### 6. `maxTimeoutSeconds` tuned wrong

This is the window between "buyer sees the 402" and "signed payment must finish verifying." Too short (5 seconds) fails legitimate buyers whose wallet needs a click or whose facilitator round-trip is slow. Too long holds a live payment authorization far past the resource's actual pricing intent. 60 seconds is a reasonable default for a synchronous API call; widen it for human-in-the-loop wallets, not autonomous agents.

### 7. The `resource` URL doesn't match what the buyer actually requests

`resource` in `PaymentRequirements` should be the exact URL being paid for — it's echoed into what the facilitator verifies. A trailing slash, `http` vs `https`, or a different host behind a reverse proxy between what the server built the 402 against and what the buyer resolves will fail verification for a reason that has nothing to do with the payment itself.

## Go-live checklist (short version)

- `payTo` is a wallet you actually control.
- Prices built with an atomic-unit helper, never hand-rolled float math.
- `extra.name`/`extra.version` come from a real per-network table, verified against the deployed contract — not copied from another network's row.
- Tested end-to-end against `base-sepolia` before pointing `network` at mainnet.
- `/settle` called exactly once per accepted payment — no speculative retries on timeout.
- Buyer checks the network/facilitator the *server* asked for, not whatever was tested last.
- Buyer handles a 402 on the retried request too (insufficient funds, expired timeout, facilitator error all happen).

None of this is exotic — it's the difference between a demo that works once against a testnet and an integration that survives contact with a second network, a second facilitator, or a real buyer's wallet.

---

If you'd rather start from working code than rebuild this from the spec, the **[x402 Quickstart Kit](https://growthchief5.gumroad.com/l/x402-quickstart)** ($7) is exactly what's excerpted above, in full: seller middleware for both Hono/Workers and plain Express, buyer clients in TypeScript (viem) and Python (eth_account/web3.py), the per-network EIP-712 domain tables already wired the "read, don't hardcode" way, and a longer practical guide with a full go-live checklist for both sides. And if you're choosing which facilitator or which existing x402 services to build against rather than build from scratch, the **[x402 Services & Facilitator Registry](https://growthchief5.gumroad.com/l/x402-registry)** ($15) is a machine-readable snapshot of 21 real facilitators and 118 live x402-payable services — chains, fee models, and status — so you're picking from what actually exists instead of re-crawling directories yourself.
