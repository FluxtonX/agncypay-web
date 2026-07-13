/**
 * Moov.io Service — Placeholder
 *
 * This module prepares the integration surface for Moov.io's payment infrastructure.
 * AgncyPay uses Moov for money movement (transfers, payouts, wallets).
 *
 * Reference: https://docs.moov.io/guides/accounts/create-accounts/
 * API Ref:   https://docs.moov.io/api/moov-accounts/accounts/create-account/
 *
 * When ready to integrate:
 * 1. Obtain Moov API keys (facilitated or direct account)
 * 2. Create a server-side API route at `/api/moov/create-account`
 * 3. Wire the onboarding flow to call this service after user completes KYB/KYC
 */

// ────────────────────────────────────────────────────────────
// Types matching Moov's Account API
// ────────────────────────────────────────────────────────────

export type MoovAccountType = "individual" | "business";

export interface MoovIndividualProfile {
  name: {
    firstName: string;
    lastName: string;
  };
  email: string;
  phone?: {
    number: string;
    countryCode: string;
  };
}

export interface MoovBusinessProfile {
  legalBusinessName: string;
  businessType:
    | "soleProprietorship"
    | "unincorporatedAssociation"
    | "trust"
    | "publicCorporation"
    | "privateCorporation"
    | "llc"
    | "partnership"
    | "unincorporatedNonProfit"
    | "incorporatedNonProfit";
  website?: string;
  email?: string;
  phone?: {
    number: string;
    countryCode: string;
  };
  address?: {
    addressLine1: string;
    addressLine2?: string;
    city: string;
    stateOrProvince: string;
    postalCode: string;
    country: string;
  };
  taxID?: {
    ein: {
      number: string;
    };
  };
}

export interface MoovAccountRequest {
  accountType: MoovAccountType;
  profile: {
    individual?: MoovIndividualProfile;
    business?: MoovBusinessProfile;
  };
  /** Moov capabilities to request: "transfers", "send-funds", "collect-funds", "wallet" */
  capabilities?: string[];
  /** Foreign key — links back to AgncyPay's user/workspace */
  foreignID?: string;
  metadata?: Record<string, string>;
}

export interface MoovAccount {
  accountID: string;
  accountType: MoovAccountType;
  displayName: string;
  createdOn: string;
  updatedOn: string;
}

// ────────────────────────────────────────────────────────────
// Placeholder Service Functions
// ────────────────────────────────────────────────────────────

/**
 * Create a Moov account for an individual or business.
 *
 * TODO: Implement via server-side API route (`/api/moov/create-account`)
 * that calls the Moov API with server-side credentials.
 *
 * @see https://docs.moov.io/api/moov-accounts/accounts/create-account/
 */
export async function createMoovAccount(
  _request: MoovAccountRequest
): Promise<{ success: boolean; account?: MoovAccount; error?: string }> {
  console.log("[Moov.io] createMoovAccount called — not yet implemented", _request);

  // Placeholder: return a mock response for development
  return {
    success: false,
    error: "Moov.io integration is not yet configured. This is a placeholder.",
  };
}

/**
 * Get an existing Moov account by ID.
 *
 * TODO: Implement via server-side API route.
 */
export async function getMoovAccount(
  _accountId: string
): Promise<{ success: boolean; account?: MoovAccount; error?: string }> {
  console.log("[Moov.io] getMoovAccount called — not yet implemented", _accountId);

  return {
    success: false,
    error: "Moov.io integration is not yet configured. This is a placeholder.",
  };
}

/**
 * Request capabilities for a Moov account (e.g., "transfers", "send-funds").
 *
 * TODO: Implement via server-side API route.
 *
 * @see https://docs.moov.io/guides/accounts/capabilities/
 */
export async function requestMoovCapabilities(
  _accountId: string,
  _capabilities: string[]
): Promise<{ success: boolean; error?: string }> {
  console.log("[Moov.io] requestMoovCapabilities called — not yet implemented");

  return {
    success: false,
    error: "Moov.io integration is not yet configured. This is a placeholder.",
  };
}
