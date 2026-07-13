"use client";

import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { type User } from "firebase/auth";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { getFirebaseDb, isFirebaseConfigured } from "../lib/firebase";
import {
  signUpWithEmail,
  signInWithEmail,
  signOutUser,
  sendPasswordReset,
  sendVerificationEmail as firebaseSendVerification,
  onAuthChange,
  getFirebaseAuthErrorMessage,
} from "../lib/firebaseAuth";
import type { AccountType, WorkspaceType } from "../types/workspace";

// ────────────────────────────────────────────────────────────
// Types
// ────────────────────────────────────────────────────────────

export interface UserProfile {
  uid: string;
  email: string;
  fullName: string;
  accountType: AccountType;
  workspaceType?: WorkspaceType;
  workspaceName?: string;
  moovAccountId?: string;
  onboardingComplete: boolean;
  createdAt: string;
}

interface AuthContextType {
  /** Firebase user object (null when signed out or loading). */
  firebaseUser: User | null;
  /** Persisted user profile from Firestore. */
  userProfile: UserProfile | null;
  /** True while Firebase auth state is resolving on first load. */
  isLoading: boolean;
  /** Convenience flag: user is authenticated. */
  isAuthenticated: boolean;
  /** True if the user has completed onboarding. */
  isOnboardingComplete: boolean;

  // ── Auth Actions ──────────────────────────────────────────
  signUp: (params: {
    email: string;
    password: string;
    fullName: string;
    accountType: AccountType;
    workspaceType?: WorkspaceType;
    workspaceName?: string;
  }) => Promise<{ success: boolean; error?: string }>;

  signIn: (
    email: string,
    password: string
  ) => Promise<{ success: boolean; error?: string }>;

  logout: () => Promise<void>;

  resetPassword: (
    email: string
  ) => Promise<{ success: boolean; error?: string }>;

  sendVerificationEmail: () => Promise<{ success: boolean; error?: string }>;

  /** Reload the Firestore user profile (e.g. after onboarding updates). */
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// ────────────────────────────────────────────────────────────
// Firestore helpers
// ────────────────────────────────────────────────────────────

const USERS_COLLECTION = "users";

async function fetchUserProfile(uid: string): Promise<UserProfile | null> {
  try {
    const db = getFirebaseDb();
    if (!db) return getLocalProfile(uid);

    const snapshot = await getDoc(doc(db, USERS_COLLECTION, uid));
    if (snapshot.exists()) {
      return snapshot.data() as UserProfile;
    }
    return getLocalProfile(uid);
  } catch (error) {
    console.warn("Firestore fetch failed, falling back to localStorage:", error);
    // Fallback: try localStorage if Firestore is not configured yet
    return getLocalProfile(uid);
  }
}

async function saveUserProfile(profile: UserProfile): Promise<void> {
  try {
    const db = getFirebaseDb();
    if (!db) {
      saveLocalProfile(profile);
      return;
    }

    // Wrap in a promise with timeout to prevent hanging if Firestore rules deny access or it's not enabled
    const savePromise = setDoc(doc(db, USERS_COLLECTION, profile.uid), profile, { merge: true });
    const timeoutPromise = new Promise<void>((_, reject) => 
      setTimeout(() => reject(new Error("Firestore timeout")), 5000)
    );
    
    await Promise.race([savePromise, timeoutPromise]);
  } catch (error) {
    console.warn("Firestore save failed or timed out, saving to localStorage fallback:", error);
    // Fallback: save to localStorage if Firestore is not configured yet or permission denied
    saveLocalProfile(profile);
  }
}

// localStorage fallback for when Firestore is not yet configured
function getLocalProfile(uid: string): UserProfile | null {
  if (typeof window === "undefined") return null;
  try {
    const data = localStorage.getItem(`agncypay_profile_${uid}`);
    return data ? JSON.parse(data) : null;
  } catch {
    return null;
  }
}

function saveLocalProfile(profile: UserProfile): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(`agncypay_profile_${profile.uid}`, JSON.stringify(profile));
  } catch (error) {
    console.error("Failed to save profile to localStorage:", error);
  }
}

// ────────────────────────────────────────────────────────────
// Provider
// ────────────────────────────────────────────────────────────

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [firebaseUser, setFirebaseUser] = useState<User | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // ── Auth state listener ───────────────────────────────────
  useEffect(() => {
    const unsubscribe = onAuthChange(async (user) => {
      setFirebaseUser(user);

      if (user) {
        const profile = await fetchUserProfile(user.uid);
        setUserProfile(profile);
      } else {
        setUserProfile(null);
      }

      setIsLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // ── Sign Up ───────────────────────────────────────────────
  const signUp = useCallback(
    async (params: {
      email: string;
      password: string;
      fullName: string;
      accountType: AccountType;
      workspaceType?: WorkspaceType;
      workspaceName?: string;
    }): Promise<{ success: boolean; error?: string }> => {
      try {
        const credential = await signUpWithEmail(
          params.email,
          params.password,
          params.fullName
        );

        // Create user profile in Firestore (or localStorage fallback)
        const profile: UserProfile = {
          uid: credential.user.uid,
          email: params.email.trim().toLowerCase(),
          fullName: params.fullName.trim(),
          accountType: params.accountType,
          workspaceType: params.workspaceType,
          workspaceName: params.workspaceName?.trim(),
          onboardingComplete: false,
          createdAt: new Date().toISOString(),
        };

        // Fire off Moov Account Creation immediately
        try {
          const res = await fetch("/api/moov/account", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              email: profile.email,
              accountType: profile.accountType,
              fullName: profile.fullName,
              foreignID: profile.uid,
            }),
          });
          
          if (res.ok) {
            const data = await res.json();
            if (data.success && data.moovAccountId) {
              profile.moovAccountId = data.moovAccountId;
            }
          } else {
            console.warn("Moov API responded with non-ok status:", await res.text());
          }
        } catch (moovError) {
          console.error("Failed to create Moov account during signup:", moovError);
          // We don't block the user's login if Moov fails right now, we can retry later.
        }

        await saveUserProfile(profile);
        setUserProfile(profile);

        // Send verification email (best-effort, don't block signup)
        try {
          await firebaseSendVerification();
        } catch {
          // Non-critical: verification email may fail silently
        }

        return { success: true };
      } catch (error: unknown) {
        const firebaseError = error as { code?: string; message?: string };
        const message = firebaseError.code
          ? getFirebaseAuthErrorMessage(firebaseError.code)
          : firebaseError.message || "Sign up failed. Please try again.";
        return { success: false, error: message };
      }
    },
    []
  );

  // ── Sign In ───────────────────────────────────────────────
  const signIn = useCallback(
    async (
      email: string,
      password: string
    ): Promise<{ success: boolean; error?: string }> => {
      try {
        await signInWithEmail(email, password);
        // Auth state listener will update firebaseUser & profile automatically
        return { success: true };
      } catch (error: unknown) {
        const firebaseError = error as { code?: string; message?: string };
        const message = firebaseError.code
          ? getFirebaseAuthErrorMessage(firebaseError.code)
          : firebaseError.message || "Sign in failed. Please try again.";
        return { success: false, error: message };
      }
    },
    []
  );

  // ── Logout ────────────────────────────────────────────────
  const logout = useCallback(async () => {
    await signOutUser();
    setFirebaseUser(null);
    setUserProfile(null);
  }, []);

  // ── Password Reset ────────────────────────────────────────
  const resetPassword = useCallback(
    async (email: string): Promise<{ success: boolean; error?: string }> => {
      try {
        await sendPasswordReset(email);
        return { success: true };
      } catch (error: unknown) {
        const firebaseError = error as { code?: string; message?: string };
        const message = firebaseError.code
          ? getFirebaseAuthErrorMessage(firebaseError.code)
          : firebaseError.message || "Password reset failed.";
        return { success: false, error: message };
      }
    },
    []
  );

  // ── Email Verification ────────────────────────────────────
  const sendVerificationEmail = useCallback(async (): Promise<{
    success: boolean;
    error?: string;
  }> => {
    try {
      await firebaseSendVerification();
      return { success: true };
    } catch (error: unknown) {
      const firebaseError = error as { code?: string; message?: string };
      return {
        success: false,
        error: firebaseError.message || "Failed to send verification email.",
      };
    }
  }, []);

  // ── Refresh Profile ───────────────────────────────────────
  const refreshProfile = useCallback(async () => {
    if (firebaseUser) {
      const profile = await fetchUserProfile(firebaseUser.uid);
      setUserProfile(profile);
    }
  }, [firebaseUser]);

  // ── Context Value ─────────────────────────────────────────
  const value: AuthContextType = {
    firebaseUser,
    userProfile,
    isLoading,
    isAuthenticated: !!firebaseUser,
    isOnboardingComplete: userProfile?.onboardingComplete ?? false,
    signUp,
    signIn,
    logout,
    resetPassword,
    sendVerificationEmail,
    refreshProfile,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

// ────────────────────────────────────────────────────────────
// Hook
// ────────────────────────────────────────────────────────────

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an <AuthProvider>");
  }
  return context;
}
