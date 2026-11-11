import type { AccountType, Profile } from "./types";

/**
 * Accounts created in the pre-Phase 1 prototype stored other account types ("talent_independent",
 * "talent_agency", "mother_agency"). Map them onto the three Phase 1 types so those accounts land
 * in the right portal instead of bouncing between route guards.
 */
export function normalizeAccountType(raw: unknown): AccountType {
  if (raw === "brand") return "brand";
  if (raw === "agency" || raw === "talent_agency" || raw === "mother_agency") return "agency";
  return "individual";
}

/** Read a `users/{uid}` document as a Phase 1 profile. Always use this instead of casting. */
export function toProfile(uid: string, data: Record<string, unknown>): Profile {
  return { ...data, uid, accountType: normalizeAccountType(data.accountType) } as Profile;
}
