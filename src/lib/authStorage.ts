import { AccountType, WorkspaceType, normalizeWorkspaceType } from "../types/workspace";

/**
 * @deprecated This module is superseded by Firebase Authentication.
 * User registration and login are now handled via `src/context/AuthContext.tsx`
 * and `src/lib/firebaseAuth.ts`. This file is kept for backward compatibility
 * only and will be removed in a future cleanup.
 */

export type RegisteredUser = {
  email: string;
  password: string;
  fullName: string;
  accountType: AccountType;
  workspaceType?: WorkspaceType;
  workspaceName?: string;
  agencyId?: string;
  verificationFlow?: "manual" | "instant";
};

const REGISTERED_USERS_KEY = "agncypay_registered_users";

/**
 * @deprecated Use `useAuth()` from `AuthContext` instead.
 * Retrieves users from localStorage — no longer the primary auth source.
 */

export function getRegisteredUsers(): RegisteredUser[] {
  if (typeof window === "undefined") return [];

  try {
    const storedUsers = localStorage.getItem(REGISTERED_USERS_KEY);
    const parsedUsers = storedUsers ? JSON.parse(storedUsers) : [];

    if (!Array.isArray(parsedUsers)) return [];

    return parsedUsers.filter((user): user is RegisteredUser => (
      typeof user?.email === "string" &&
      typeof user?.password === "string" &&
      typeof user?.fullName === "string" &&
      [
        "individual",
        "agency",
        "brand",
        "talent_independent",
        "talent_agency",
        "mother_agency",
      ].includes(user?.accountType) &&
      (user?.verificationFlow === undefined ||
        ["manual", "instant"].includes(user.verificationFlow))
    )).map((user) => ({
      ...user,
      workspaceType: user.workspaceType ?? normalizeWorkspaceType(user.accountType),
    }));
  } catch (error) {
    console.error("Failed to load registered users:", error);
    return [];
  }
}

/**
 * @deprecated Use `useAuth().signUp()` from `AuthContext` instead.
 * Saves user to localStorage — no longer the primary auth registration method.
 */
export function saveRegisteredUser(user: RegisteredUser) {
  if (typeof window === "undefined") return;

  const normalizedEmail = user.email.trim().toLowerCase();
  const existingUsers = getRegisteredUsers();
  const nextUsers = [
    ...existingUsers.filter((existingUser) => existingUser.email.toLowerCase() !== normalizedEmail),
    { ...user, email: normalizedEmail },
  ];

  localStorage.setItem(REGISTERED_USERS_KEY, JSON.stringify(nextUsers));
}
