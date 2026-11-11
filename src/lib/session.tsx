"use client";

import { createContext, useContext, useEffect, useMemo, useRef, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { onAuthStateChanged, type User } from "firebase/auth";
import { doc, getDoc, onSnapshot } from "firebase/firestore";
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

  // Safety timeout ref — if loading never clears (e.g. Firestore offline), force ready after 6 s.
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    let stopProfile: (() => void) | null = null;
    let alive = true;

    // 6-second hard deadline: if Firestore never responds, treat as "not signed in"
    timeoutRef.current = setTimeout(() => {
      if (alive) setState((s) => s.ready ? s : { ready: true, user: null, profile: null });
    }, 6000);

    const stopAuth = onAuthStateChanged(auth, async (user) => {
      stopProfile?.();
      stopProfile = null;

      if (!user) {
        if (alive) setState({ ready: true, user: null, profile: null });
        return;
      }

      // Fast path: fetch the profile document once so the UI unblocks immediately.
      try {
        const snap = await getDoc(doc(db, "users", user.uid));
        if (alive) {
          setState({
            ready: true,
            user,
            profile: snap.exists() ? toProfile(user.uid, snap.data()) : null,
          });
        }
      } catch {
        if (alive) setState({ ready: true, user, profile: null });
      }

      // Then keep it live so changes (e.g. a new field written after register) propagate.
      stopProfile = onSnapshot(
        doc(db, "users", user.uid),
        (snap) => {
          if (alive)
            setState((s) => ({
              ...s,
              ready: true,
              user,
              profile: snap.exists() ? toProfile(user.uid, snap.data()) : s.profile,
            }));
        },
        (err) => console.warn("[session] profile listener error:", err.message)
      );
    });

    return () => {
      alive = false;
      stopProfile?.();
      stopAuth();
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
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
      // Authenticated but no Firestore document — send them to register to complete their profile.
      router.replace(`/auth/register?next=${encodeURIComponent(pathname)}`);
    } else if (profile.accountType !== type) {
      router.replace(homeFor(profile.accountType));
    }
  }, [loading, user, profile, type, router, pathname]);

  return !loading && profile && profile.accountType === type ? profile : null;
}
