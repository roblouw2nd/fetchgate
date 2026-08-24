import type { PaymentPayload, PaymentRequirements, SettleResponse, VerifyResponse } from "./types.js";

/**
 * All the actual cryptography (verifying the EIP-3009 `transferWithAuthorization`
 * signature, submitting the on-chain transfer) is delegated entirely to a
 * facilitator via its `/verify` and `/settle` HTTP endpoints — this module
 * never touches a private key or a chain RPC. That's the whole point of the
 * facilitator role in x402: sellers don't need chain-client dependencies at
 * all for the "exact" scheme, just two POST calls.
 */

export interface FacilitatorOptions {
  /** Injectable for tests; defaults to global fetch. */
  fetchImpl?: typeof fetch;
}

/** Calls the facilitator's POST /verify endpoint. Throws on network/HTTP failure. */
export async function verifyPayment(
  facilitatorUrl: string,
  paymentPayload: PaymentPayload,
  paymentRequirements: PaymentRequirements,
  options: FacilitatorOptions = {},
): Promise<VerifyResponse> {
  const doFetch = options.fetchImpl ?? fetch;
  const res = await doFetch(`${facilitatorUrl}/verify`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ paymentPayload, paymentRequirements }),
  });
  if (!res.ok) {
    throw new Error(`Facilitator /verify returned HTTP ${res.status}`);
  }
  return (await res.json()) as VerifyResponse;
}

/** Calls the facilitator's POST /settle endpoint. Throws on network/HTTP failure. */
export async function settlePayment(
  facilitatorUrl: string,
  paymentPayload: PaymentPayload,
  paymentRequirements: PaymentRequirements,
  options: FacilitatorOptions = {},
): Promise<SettleResponse> {
  const doFetch = options.fetchImpl ?? fetch;
  const res = await doFetch(`${facilitatorUrl}/settle`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ paymentPayload, paymentRequirements }),
  });
  if (!res.ok) {
    throw new Error(`Facilitator /settle returned HTTP ${res.status}`);
  }
  return (await res.json()) as SettleResponse;
}
