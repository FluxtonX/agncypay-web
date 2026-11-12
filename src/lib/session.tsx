"use client";

import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { onAuthStateChanged, type User } from "firebase/auth";
import { doc, onSnapshot } from "firebase/firestore";
import { auth, db } from "./firebase";
import { toProfile } from "./profile";
import type { AccountType, Profile } from "./types";

interface Session {
  user: User | null;
  profile: Profile | null;
  /** True until Firebase has resolved auth AND the Firestore profile has been fetched at least once. */
  loading: boolean;
}

const SessionContext = createContext<Session>({ user: null, profile: null, loading: true });

export function SessionProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<{
    ready: boolean;
    user: User | null;
    profile: Profile | null;
  }>({ ready: false, user: null, profile: null });

  useEffect(() => {
    let stopProfile: (() => void) | null = null;
    // Each auth change bumps the generation, so a late snapshot for a previous user is ignored.
    let generation = 0;

    const stopAuth = onAuthStateChanged(auth, (user) => {
      stopProfile?.();
      stopProfile = null;
      const mine = ++generation;
      if (!user) {
        setState({ ready: true, user: null, profile: null });
        return;
      }
      // One live read: the first snapshot unblocks the UI, later ones keep the profile current
      // (e.g. right after sign-up, when the profile document lands a moment after the auth user).
      stopProfile = onSnapshot(
        doc(db, "users", user.uid),
        (snap) => {
          if (mine !== generation) return;
          setState({ ready: true, user, profile: snap.exists() ? toProfile(user.uid, snap.data()) : null });
        },
        (err) => {
          if (mine !== generation) return;
          console.warn("[session] profile read failed:", err.message);
          setState({ ready: true, user, profile: null });
        }
      );
    });

    return () => {
      generation += 1;
      stopProfile?.();
      stopAuth();
    };
  }, []);

  const value = useMemo<Session>(
    () => ({ user: state.user, profile: state.profile, loading: !state.ready }),
    [state]
  );
  return <SessionContext.Provider value={value}>{children}</SessionContext.Provider>;
}

export function useSession(): Session {
  return useContext(SessionContext);
}

export function homeFor(type: AccountType): string {
  return type === "agency" ? "/agency" : type === "brand" ? "/brand" : "/app";
}

/** Only same-site paths are accepted as post-login destinations. */
export function safeNext(next: string | null | undefined): string | null {
  return next && next.startsWith("/") && !next.startsWith("//") && !next.startsWith("/\\") ? next : null;
}

/**
 * Route guard for the three signed-in surfaces. Returns the profile once it is confirmed to be the
 * right account type; otherwise redirects (to sign-in, or to the visitor's own home) and returns null.
 */
export function useRequire(type: AccountType): Profile | null {
  const { user, profile, loading } = useSession();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (loading) return;
    if (!user) {
      router.replace(`/auth/login?next=${encodeURIComponent(pathname)}`);
    } else if (!profile) {
      // Authenticated but no profile document: finish it on the register page.
      const q = new URLSearchParams({ email: user.email ?? "", lock: "1", next: pathname });
      router.replace(`/auth/register?${q}`);
    } else if (profile.accountType !== type) {
      router.replace(homeFor(profile.accountType));
    }
  }, [loading, user, profile, type, router, pathname]);

  return !loading && profile && profile.accountType === type ? profile : null;
}
