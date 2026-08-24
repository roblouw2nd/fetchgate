import type { PaymentRequirements } from "./types.js";

/**
 * USDC contract addresses per network, per the x402 spec's own reference
 * examples and Circle's published deployments. Extend this map for other
 * assets/networks you accept — it's just a lookup table, not protocol logic.
 *
 * IMPORTANT — the EIP-712 domain `name` differs per deployment (see
 * `extra` below and GUIDE.md): Base mainnet USDC's on-chain name is
 * "USD Coin"; Base Sepolia's testnet USDC contract is named "USDC". Do not
 * assume they're interchangeable — verify against the deployed contract's
 * own `name()`/`version()` if you add a network not listed here.
 */
export const USDC_ASSET_ADDRESS: Record<string, string> = {
  base: "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913",
  "base-sepolia": "0x036CbD53842c5426634e7929541eC2318f3dCF7e",
};

/**
 * EIP-712 signing-domain `name`/`version` per network, for the `extra`
 * field of PaymentRequirements. A buyer's client MUST use these exact
 * values (not a guess, not "USDC" for every network) when constructing the
 * EIP-712 typed-data domain to sign — see buyer/src/sign.ts. Verified
 * against the deployed USDC contracts' own `name()`/`version()` (Base
 * mainnet: "USD Coin"/"2"; Base Sepolia: "USDC"/"2").
 */
export const USDC_EIP712_DOMAIN: Record<string, { name: string; version: string }> = {
  base: { name: "USD Coin", version: "2" },
  "base-sepolia": { name: "USDC", version: "2" },
};

export interface X402Config {
  /** Address payments settle to. */
  payTo: string;
  network: string;
  /** Base URL of your facilitator, no trailing slash (e.g. "https://x402.org/facilitator"). */
  facilitatorUrl: string;
}

/** Converts a USD amount to USDC's atomic units (6 decimals), e.g. 0.05 -> "50000". */
export function usdToAtomicUsdc(usd: number): string {
  return String(Math.round(usd * 1_000_000));
}

/**
 * Builds one `PaymentRequirements` entry for a priced resource. Call this
 * once per accepted payment method/network and put the results in a 402
 * response's `accepts[]` array (a resource can accept payment several
 * ways — different networks, different assets — by listing more than one).
 */
export function buildPaymentRequirements(
  config: X402Config,
  resourceUrl: string,
  opts: {
    /** Atomic units of the asset (see `usdToAtomicUsdc`). */
    atomicAmount: string;
    description: string;
    mimeType?: string;
    /** Seconds the client has to pay after seeing this 402. Default 60. */
    maxTimeoutSeconds?: number;
  },
): PaymentRequirements {
  const domain = USDC_EIP712_DOMAIN[config.network];
  if (!domain) {
    throw new Error(
      `No EIP-712 domain configured for network "${config.network}" — add it to ` +
        `USDC_EIP712_DOMAIN (or your own asset's domain table) before pricing a ` +
        `resource on this network, or client signatures will fail verification.`,
    );
  }
  return {
    scheme: "exact",
    network: config.network,
    maxAmountRequired: opts.atomicAmount,
    resource: resourceUrl,
    description: opts.description,
    mimeType: opts.mimeType ?? "application/json",
    payTo: config.payTo,
    maxTimeoutSeconds: opts.maxTimeoutSeconds ?? 60,
    asset: USDC_ASSET_ADDRESS[config.network] ?? USDC_ASSET_ADDRESS.base!,
    extra: { name: domain.name, version: domain.version },
  };
}

export function buildX402ResponseBody(
  accepts: PaymentRequirements[],
  error?: string,
  payer?: string,
): { x402Version: 1; error?: string; accepts?: PaymentRequirements[]; payer?: string } {
  const body: { x402Version: 1; error?: string; accepts?: PaymentRequirements[]; payer?: string } = {
    x402Version: 1,
    accepts,
  };
  if (error) body.error = error;
  if (payer) body.payer = payer;
  return body;
}
