---
title: "What EIP-3009 Actually Is, and Why x402 Uses It Instead of approve()"
seo_title: "EIP-3009 Explained: transferWithAuthorization and Why x402 Uses It"
meta_description: "EIP-3009 lets a wallet sign a one-off USDC transfer that someone else submits and pays gas for. Here's what the signature contains, why x402 chose it over approve()/transferFrom and EIP-2612 permit, and the four fields that silently break it."
keywords:
  - EIP-3009 explained
  - transferWithAuthorization
  - x402 EIP-3009
  - USDC gasless transfer
  - EIP-712 USDC domain
  - x402 exact scheme
date: 2026-08-28
---

# What EIP-3009 actually is, and why x402 uses it instead of approve()

> Published at: https://fetchgate.dev/blog/eip-3009-transfer-with-authorization — this GitHub copy is a mirror; the canonical page has product links, related articles and an RSS feed.

Every x402 payment on an EVM chain is, underneath, one EIP-3009 signature. If you have read an x402 tutorial and still can't say what the buyer is actually signing, or why the buyer's wallet never needs ETH, this is the missing piece. It is short, because EIP-3009 is short — it is one function signature and a set of rules about a nonce.

## The one-sentence version

**EIP-3009 lets a token holder sign a message that says "move exactly N of my tokens to address X, valid between time A and time B, identified by nonce Z" — and lets *anyone* submit that signed message on-chain.** The submitter pays the gas. The holder's tokens move. The holder never sends a transaction.

The function is `transferWithAuthorization`, and it lives inside the token contract. USDC implements it (Circle's `FiatTokenV2` and later), which is the whole reason x402 works with USDC and not with an arbitrary ERC-20.

```solidity
function transferWithAuthorization(
    address from,
    address to,
    uint256 value,
    uint256 validAfter,
    uint256 validBefore,
    bytes32 nonce,
    uint8 v, bytes32 r, bytes32 s
) external;
```

The six data fields are what the holder signs, as EIP-712 typed data. The `v, r, s` triple is the signature. That is the entire protocol.

## What the buyer signs, field by field

The struct is fixed by the EIP and the field order matters, because EIP-712 hashes the struct definition. This is copied from the x402 reference client's `authorizationTypes` constant, not reconstructed:

```ts
TransferWithAuthorization: [
  { name: "from",        type: "address" },
  { name: "to",          type: "address" },
  { name: "value",       type: "uint256" },
  { name: "validAfter",  type: "uint256" },
  { name: "validBefore", type: "uint256" },
  { name: "nonce",       type: "bytes32" },
]
```

In an x402 payment each of these is filled directly from the server's `PaymentRequirements`:

| Field | Comes from | Notes |
| --- | --- | --- |
| `from` | the buyer's wallet address | must be the signer |
| `to` | `payTo` in the 402 response | the seller's receive address |
| `value` | `maxAmountRequired` | **atomic units** — `10000` is $0.01 of USDC, not $10,000 |
| `validAfter` | now minus a skew window | reference client uses 600s, so a fast clock doesn't make the auth "not yet valid" |
| `validBefore` | now plus `maxTimeoutSeconds` | the window the seller gave you to settle |
| `nonce` | 32 random bytes | **not** sequential — see below |

The signed message is wrapped with an EIP-712 domain: `{ name, version, chainId, verifyingContract }`. `verifyingContract` is the USDC contract address; `chainId` is the network (8453 for Base mainnet); and `name`/`version` must be the token contract's *own* on-chain values. On Base mainnet USDC that is `name: "USD Coin", version: "2"`; on Base Sepolia it is `name: "USDC", version: "2"`. Different strings, same asset. More on why that matters in the pitfalls section.

## Why not just approve() and transferFrom()?

The ERC-20 way to let a third party move your tokens is `approve(spender, amount)` followed by the spender calling `transferFrom`. For a machine-to-machine payment that is wrong in four separate ways:

1. **The payer has to send a transaction.** `approve` is an on-chain call, so the payer's wallet needs the chain's gas token — ETH on Base — *in addition to* the USDC it is spending. An AI agent holding $5 of USDC and no ETH cannot pay anyone. With EIP-3009 the agent needs USDC only; the facilitator submits the transaction and pays the gas.
2. **An allowance is a standing permission, not a payment.** Approving a spender for $0.01 to buy one API call means either approving exactly that amount every time (two transactions per payment) or approving a large amount once and trusting the spender indefinitely. Neither is what "pay $0.01 for this request" means. An EIP-3009 authorization is for one exact `value` to one exact `to`, inside one time window, once.
3. **The approve race.** Changing a non-zero allowance to another non-zero allowance has a well-known front-running problem, which is why `increaseAllowance` exists at all. Irrelevant for a one-off signed transfer.
4. **Two round trips.** `approve` must confirm before `transferFrom` can succeed. A 402 flow wants a single retry with a single header.

**What about EIP-2612 `permit`?** `permit` fixes problem 1 — it is a signature-based `approve`, so the payer no longer needs gas. But it produces an *allowance*, so problems 2 and 4 remain: someone still has to call `transferFrom`, and the permission is an amount for a spender, not a transfer to a recipient. EIP-3009 is the version where the signature *is* the payment. That is the property x402's `exact` scheme is built on: the server states a price, the client signs a transfer of exactly that price, and settlement is one contract call by whoever is willing to pay gas.

## The nonce is random, and that is a feature

ERC-20 `permit` and account transactions use *sequential* nonces: 0, 1, 2. EIP-3009 uses a **random 32-byte nonce** and the contract simply records "this (from, nonce) pair has been used." Two consequences worth understanding:

- **Concurrency.** An agent can sign ten authorizations for ten different API calls in parallel without coordinating an order. Sequential nonces would force the calls to settle in sequence, and a single stuck settlement would block every later one.
- **Replay protection is per-nonce, not per-signature.** If your nonce generator is weak — say, a timestamp, or `Math.random()` — two authorizations can collide, and the second one reverts on-chain as already used. The reference client uses `crypto.getRandomValues(new Uint8Array(32))`. Do the same.

There is also `cancelAuthorization(authorizer, nonce, v, r, s)`, so a holder can burn an unused nonce before its `validBefore` — the escape hatch if you signed something you regret. And `receiveWithAuthorization` is the sibling function where only the `to` address may submit the transaction, which prevents a third party from front-running a payment into a contract that expects to be the caller. x402's exact scheme uses `transferWithAuthorization`, since the facilitator, not the recipient, is the submitter.

## How this becomes an x402 payment

1. Client requests a paid resource. Server returns **402** with `PaymentRequirements`: `scheme: "exact"`, `network`, `payTo`, `maxAmountRequired`, `maxTimeoutSeconds`, `asset` (the USDC contract), and `extra: { name, version }` (the EIP-712 domain strings).
2. Client builds the six-field authorization from those values, signs it as EIP-712 typed data against the domain `{ name, version, chainId, verifyingContract: asset }`.
3. Client base64-encodes `{ authorization, signature }` into the payment header and retries the identical request. (Protocol v2 calls the header `PAYMENT-SIGNATURE`; v1 used `X-PAYMENT`. Servers that accept both exist, including ours.)
4. Server forwards the payload and its own requirements to a **facilitator** `/verify` endpoint, which checks the signature recovers to `from`, `value`/`to` match, the time window is open, the nonce is unused, and `from` has the balance.
5. Server serves the resource, then (or first, depending on the implementation) calls `/settle`. The facilitator submits `transferWithAuthorization` on-chain, paying gas, and USDC lands at `payTo`.

Nothing in that flow requires the buyer to hold ETH, create an account, or wait for a confirmation before getting the response.

## The four fields that silently break it

These are the failures where the signature is well-formed, nothing throws, and verification just says "invalid". Each one is documented from a real mistake, not a hypothetical.

**1. The EIP-712 domain `name`/`version`.** If you hardcode `"USDC"` and the contract's on-chain `name()` is `"USD Coin"`, every signature you produce is valid for a contract that does not exist. Read `name` and `version` from the server's `extra` and refuse to sign if they are missing. Our own kit throws here on purpose rather than guessing.

**2. `value` in decimal dollars.** USDC has 6 decimals. `maxAmountRequired: "10000"` means $0.01. Sending `"0.01"` fails schema validation if you are lucky, and signs a transfer for zero if you are not.

**3. `chainId`.** A wrong chain ID produces a validly-shaped signature for the wrong chain. Base mainnet is 8453, Base Sepolia is 84532. Under x402 v2 the `network` field is a CAIP-2 id (`eip155:8453`), which at least makes the chain explicit; under v1 it was a name (`base`) you had to map yourself.

**4. The time window.** `validBefore` is `now + maxTimeoutSeconds`. If the seller sets `maxTimeoutSeconds` to 10 and the facilitator takes 12 seconds to settle, the transfer reverts on-chain as expired and the buyer has already received the resource. Sellers: leave real headroom (the reference implementations default to minutes, not seconds). Buyers: don't cache a signed authorization and retry it later.

## Where this leaves you

EIP-3009 is why "an AI agent pays $0.002 for an API call from a wallet holding only USDC" is a one-signature, one-header operation instead of a two-transaction, gas-funded dance. It is also why every x402 EVM implementation shares the same handful of failure modes: they are all the same six fields and the same domain, and every one of them can be wrong without an error.

If you are implementing the buyer side, the field table above plus a hard "refuse to sign without `extra.name`/`extra.version`" check will save you the afternoon we lost. If you are implementing the seller side, publish `extra` correctly and set `maxTimeoutSeconds` generously; you cannot fix a buyer's expired authorization after the fact.

*Confidence note: the struct definition, field sources and skew default above are read directly from the x402 reference client's `sign.ts` and `eip3009.ts`; the USDC domain strings were checked against the token contracts on Base mainnet and Base Sepolia. The `receiveWithAuthorization`/`cancelAuthorization` descriptions follow the EIP-3009 text. If you target another network or asset, verify its chain ID and its contract's `name()`/`version()` yourself before trusting a signature against it.*
