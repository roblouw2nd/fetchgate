# x402 Quickstart Kit — Free Sample

This is a **free, complete sample** of Fetchgate's *x402 Quickstart Kit*: the full
**seller-side** package (`seller/` — TypeScript, Cloudflare Workers/Hono), unmodified,
copied verbatim from the paid product. Nothing in it is trimmed or stubbed — every
function, doc comment, and type is exactly what ships in the full kit.

- [**Get the full kit ($7)**](https://fetchgate.dev/) — adds the plain Node/Express port
  of this same seller logic, and — the genuinely new part — buyer-side (client) code in
  both TypeScript (viem) and Python (eth_account/web3.py) that signs a real EIP-3009
  payment and retries a 402 automatically, plus a practical guide covering facilitator
  selection and common integration pitfalls.

## What's in this sample

- `seller/src/types.ts` — x402 protocol wire types (PaymentRequirements, PaymentPayload, etc.)
- `seller/src/requirements.ts` — `buildPaymentRequirements`, USDC asset addresses, and the
  per-network EIP-712 domain table (`name`/`version`) that a correct buyer client needs
- `seller/src/payload.ts` — decode `X-PAYMENT`, encode `X-PAYMENT-RESPONSE`
- `seller/src/facilitator.ts` — the two HTTP calls (`/verify`, `/settle`) that do all the
  actual cryptography, via your chosen facilitator
- `seller/src/middleware.ts` — the framework-agnostic verify-then-settle decision flow,
  plus a Hono-compatible middleware wrapper
- `seller/package.json`, `seller/tsconfig.json`

This is a generalized version of the real, production seller-side payment logic running at
[fetchgate.dev](https://fetchgate.dev) — not a toy rewrite. Drop it into your own
Cloudflare Worker (or any fetch-based runtime) and it works as-is; see the doc comment atop
`middleware.ts` for a usage example.

## What's not in this sample (in the paid version)

- **`seller-express/`** — the same seller logic ported to plain Node/Express, for
  non-Workers deployments.
- **`buyer/`** — TypeScript + viem buyer-side code: constructs and signs an EIP-3009
  `transferWithAuthorization`, base64-encodes the x402 payment payload, retries a 402 with
  `X-PAYMENT`, and decodes the settlement response. Verified directly against the x402
  reference client's source, not guessed.
- **`buyer-python/`** — the same buyer-side flow in Python (eth_account + web3.py).
- **`GUIDE.md`** — facilitator selection, the pitfalls that actually cause silent payment
  failures (atomic-unit math, `maxTimeoutSeconds`, network mismatches, the EIP-712 domain
  trap), and a go-live checklist for both sides.

## License note

This sample is free to use, share, and build against. The full kit carries a single-buyer
license (buildable into your own product; no reselling/republishing the kit's source files
as a competing product) — see the full product's README for details.
