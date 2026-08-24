/**
 * x402 protocol wire types (HTTP transport, "exact" scheme, EVM/EIP-3009).
 *
 * These shapes are pulled directly from the authoritative spec/type source
 * (x402-foundation/x402 on GitHub: `specs/transports-v1/http.md` for the
 * wire format, `typescript/packages/legacy/x402/src/types/verify/x402Specs.ts`
 * for the exact field set and string-vs-number typing), not from memory or
 * a secondary writeup. Field names, casing, and types matter: a facilitator
 * validates the JSON shape strictly, and a client that gets a field name
 * wrong (or sends a number where the spec wants a numeric *string*) will
 * fail verification.
 */

/** One entry in a 402 response's `accepts[]` array — one way to pay for a resource. */
export interface PaymentRequirements {
  scheme: "exact";
  /** e.g. "base", "base-sepolia". Must match a network your facilitator supports. */
  network: string;
  /** Atomic units of the asset, as a decimal string (USDC has 6 decimals: "2000" = $0.002). */
  maxAmountRequired: string;
  /** The resource being purchased/accessed — typically the request URL. */
  resource: string;
  description: string;
  mimeType: string;
  /** Address payment settles to. */
  payTo: string;
  /** How long the client has to submit a valid X-PAYMENT after receiving this 402. */
  maxTimeoutSeconds: number;
  /** ERC-20 contract address of the payment asset. */
  asset: string;
  /**
   * Scheme-specific extras. For EIP-3009 "exact" on EVM, a client needs
   * `name`/`version` here to build the correct EIP-712 signing domain — see
   * buyer/src/sign.ts and GUIDE.md's "EIP-712 domain mismatches" pitfall.
   * This is NOT free-form decoration: get it wrong and every payment from a
   * spec-correct client will fail signature verification.
   */
  extra?: Record<string, unknown>;
}

/** The `authorization` object inside an EIP-3009 `exact` EVM payment payload. */
export interface ExactEvmAuthorization {
  from: string;
  to: string;
  /** Decimal string, atomic units — same units as `maxAmountRequired`. */
  value: string;
  /** Unix timestamp (decimal string) the authorization becomes valid at. */
  validAfter: string;
  /** Unix timestamp (decimal string) the authorization expires at. */
  validBefore: string;
  /** Random 32-byte value, hex-encoded (0x + 64 hex chars), replay-protection nonce. */
  nonce: string;
}

/** The `payload` field of an EVM "exact" scheme PaymentPayload. */
export interface ExactEvmPayload {
  /** EIP-712 signature over the TransferWithAuthorization typed data (hex, 0x-prefixed). */
  signature: string;
  authorization: ExactEvmAuthorization;
}

/** Decoded shape of the client's `X-PAYMENT` header (before base64 encoding). */
export interface PaymentPayload {
  x402Version: 1;
  scheme: "exact";
  network: string;
  payload: ExactEvmPayload;
}

/** JSON body of a 402 response (also used to carry an error alongside `accepts`). */
export interface X402ResponseBody {
  x402Version: 1;
  error?: string;
  accepts?: PaymentRequirements[];
  payer?: string;
}

/** Response shape from a facilitator's POST /verify. */
export interface VerifyResponse {
  isValid: boolean;
  invalidReason?: string;
  payer?: string;
}

/** Response shape from a facilitator's POST /settle — also what the client
 *  gets (base64-encoded) back in the `X-PAYMENT-RESPONSE` header. */
export interface SettleResponse {
  success: boolean;
  errorReason?: string;
  payer?: string;
  transaction: string;
  network: string;
}

export const X402_PROTOCOL_VERSION = 1 as const;
