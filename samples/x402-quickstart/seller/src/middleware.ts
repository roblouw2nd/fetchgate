import { buildPaymentRequirements, buildX402ResponseBody, type X402Config } from "./requirements.js";
import { decodePaymentPayload, encodeSettlementHeader } from "./payload.js";
import { verifyPayment, settlePayment } from "./facilitator.js";
import type { PaymentRequirements } from "./types.js";

/**
 * Result of {@link checkX402Payment}: either the caller may proceed
 * (`allowed: true`), optionally carrying response headers to surface
 * (`X-PAYMENT-RESPONSE` on a successful settlement), or must be turned away
 * with a 402 and the given JSON body.
 */
export type X402Decision =
  | { allowed: true; headers: Record<string, string> }
  | { allowed: false; status: 402; body: unknown; headers: Record<string, string> };

export interface PriceSpec {
  /** Atomic units of the asset (see requirements.ts `usdToAtomicUsdc`). */
  atomicAmount: string;
  description: string;
  mimeType?: string;
  maxTimeoutSeconds?: number;
}

/**
 * The core x402 decision: does this request carry a valid `X-PAYMENT`
 * header for `price`? If not, return the 402 challenge; if so, verify and
 * settle it via the facilitator. Framework-agnostic — takes a standard
 * `Request` and returns a plain decision object, so it plugs into Hono,
 * plain Workers `fetch`, or (via a small adapter — see seller-express/)
 * Express.
 *
 * This is deliberately *only* the x402 mechanics. It does not do rate
 * limiting, API-key auth, or product catalogs — bolt those on in your own
 * app around this function, the way a real seller would (see the doc
 * comment in README.md for how Fetchgate itself layers a free tier and a
 * catalog on top of this exact flow).
 */
export async function checkX402Payment(
  request: Request,
  config: X402Config,
  price: PriceSpec,
  resourceUrl: string = request.url,
): Promise<X402Decision> {
  const paymentHeader = request.headers.get("x-payment");
  const requirements = buildPaymentRequirements(config, resourceUrl, price);
  const accepts = [requirements];

  if (!paymentHeader) {
    return {
      allowed: false,
      status: 402,
      body: buildX402ResponseBody(accepts, "payment_required"),
      headers: {},
    };
  }

  return settleX402Payment(config, requirements, paymentHeader);
}

/**
 * Runs the verify -> settle flow for one request carrying an `X-PAYMENT`
 * header, given already-built `requirements`. Split out from
 * {@link checkX402Payment} so callers with per-request pricing that isn't a
 * static `PriceSpec` (e.g. a per-product price looked up from a catalog)
 * can build their own `PaymentRequirements` and reuse just this half. This
 * is the one place that calls the facilitator's `/verify` then `/settle` —
 * don't duplicate this logic elsewhere in your app.
 */
export async function settleX402Payment(
  config: X402Config,
  requirements: PaymentRequirements,
  paymentHeader: string,
): Promise<X402Decision> {
  const accepts = [requirements];

  const paymentPayload = decodePaymentPayload(paymentHeader);
  if (!paymentPayload) {
    return {
      allowed: false,
      status: 402,
      body: buildX402ResponseBody(accepts, "invalid_payload"),
      headers: {},
    };
  }

  try {
    const verifyResult = await verifyPayment(config.facilitatorUrl, paymentPayload, requirements);
    if (!verifyResult.isValid) {
      return {
        allowed: false,
        status: 402,
        body: buildX402ResponseBody(
          accepts,
          verifyResult.invalidReason ?? "invalid_payment",
          verifyResult.payer,
        ),
        headers: {},
      };
    }
  } catch (err) {
    return {
      allowed: false,
      status: 402,
      body: buildX402ResponseBody(
        accepts,
        `unexpected_verify_error: ${err instanceof Error ? err.message : String(err)}`,
      ),
      headers: {},
    };
  }

  try {
    const settleResult = await settlePayment(config.facilitatorUrl, paymentPayload, requirements);
    const settlementHeader = encodeSettlementHeader(settleResult);
    if (!settleResult.success) {
      return {
        allowed: false,
        status: 402,
        body: buildX402ResponseBody(
          accepts,
          settleResult.errorReason ?? "unexpected_settle_error",
          settleResult.payer,
        ),
        headers: { "X-PAYMENT-RESPONSE": settlementHeader },
      };
    }
    return {
      allowed: true,
      headers: { "X-PAYMENT-RESPONSE": settlementHeader },
    };
  } catch (err) {
    return {
      allowed: false,
      status: 402,
      body: buildX402ResponseBody(
        accepts,
        `unexpected_settle_error: ${err instanceof Error ? err.message : String(err)}`,
      ),
      headers: {},
    };
  }
}

/**
 * Hono middleware factory. Framework glue around {@link checkX402Payment} —
 * a Hono-compatible `MiddlewareHandler` you can drop onto any route that
 * should require x402 payment. Requires Hono only as a peer/type dependency
 * (see package.json) — the mechanics above have zero framework dependency.
 *
 * Usage:
 * ```ts
 * import { Hono } from "hono";
 * import { x402Middleware } from "x402-quickstart-seller";
 *
 * const app = new Hono();
 * app.get(
 *   "/paid-thing",
 *   x402Middleware({
 *     config: { payTo: "0x...", network: "base", facilitatorUrl: "https://x402.org/facilitator" },
 *     price: { atomicAmount: "10000", description: "One paid thing" }, // $0.01 USDC
 *   }),
 *   (c) => c.json({ ok: true }),
 * );
 * ```
 */
export function x402Middleware(opts: { config: X402Config; price: PriceSpec }) {
  return async (
    c: { req: { raw: Request }; header: (k: string, v: string) => void; json: (b: unknown, s: number) => unknown },
    next: () => Promise<void>,
  ) => {
    const decision = await checkX402Payment(c.req.raw, opts.config, opts.price);
    for (const [key, value] of Object.entries(decision.headers)) {
      c.header(key, value);
    }
    if (!decision.allowed) {
      return c.json(decision.body, decision.status);
    }
    await next();
  };
}
