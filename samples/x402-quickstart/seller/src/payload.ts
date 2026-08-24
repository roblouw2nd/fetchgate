import type { PaymentPayload, SettleResponse } from "./types.js";

/**
 * Decodes and shape-checks the `X-PAYMENT` header (base64 JSON per
 * transports-v1/http.md). Returns `undefined` for anything malformed rather
 * than throwing — callers should treat that as "invalid_payload" and return
 * a 402, not crash the request.
 *
 * Uses `atob`/`btoa`, which are available in Cloudflare Workers, browsers,
 * and modern Node (18.5+/20+) without any import. If you're targeting an
 * older Node runtime, swap these for `Buffer.from(x, "base64")` /
 * `Buffer.from(x).toString("base64")` — see seller-express/ for exactly
 * that swap.
 */
export function decodePaymentPayload(header: string): PaymentPayload | undefined {
  try {
    const decoded = atob(header.trim());
    const parsed: unknown = JSON.parse(decoded);
    if (!isPaymentPayload(parsed)) return undefined;
    return parsed;
  } catch {
    return undefined;
  }
}

function isPaymentPayload(value: unknown): value is PaymentPayload {
  if (!value || typeof value !== "object") return false;
  const v = value as Record<string, unknown>;
  if (v["x402Version"] !== 1 || v["scheme"] !== "exact" || typeof v["network"] !== "string") {
    return false;
  }
  const payload = v["payload"];
  if (!payload || typeof payload !== "object") return false;
  const p = payload as Record<string, unknown>;
  if (typeof p["signature"] !== "string") return false;
  const auth = p["authorization"];
  if (!auth || typeof auth !== "object") return false;
  const a = auth as Record<string, unknown>;
  return (
    typeof a["from"] === "string" &&
    typeof a["to"] === "string" &&
    typeof a["value"] === "string" &&
    typeof a["validAfter"] === "string" &&
    typeof a["validBefore"] === "string" &&
    typeof a["nonce"] === "string"
  );
}

/** Base64-encodes the `X-PAYMENT-RESPONSE` header value per the spec. */
export function encodeSettlementHeader(settle: SettleResponse): string {
  return btoa(JSON.stringify(settle));
}
