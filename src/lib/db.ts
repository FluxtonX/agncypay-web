"use client";

import { useEffect, useState } from "react";
import {
  collection,
  doc,
  getDocs,
  onSnapshot,
  query,
  where,
  type DocumentData,
  type Query,
  type QueryConstraint,
} from "firebase/firestore";
import { db } from "./firebase";

export const C = {
  users: "users",
  orgs: "orgs",
  bankAccounts: "bank_accounts",
  invoices: "crm_invoices",
  allocations: "allocations",
  payouts: "payouts",
  payments: "payments",
  activity: "activity",
  notices: "notifications",
  invites: "invites",
  contacts: "contacts",
  walletTx: "wallet_tx",
  cards: "cards",
  mail: "mail",
} as const;

export function col(name: string, ...constraints: QueryConstraint[]): Query<DocumentData> {
  return query(collection(db, name), ...constraints);
}

export { where };

export interface Live<T> {
  data: T[];
  loading: boolean;
  error: string | null;
}

/**
 * Live Firestore query. `key` identifies the query — pass null to stay idle.
 * Queries use a single filter and are sorted on the client, so no composite indexes are needed.
 */
export function useLive<T>(key: string | null, build: () => Query<DocumentData>): Live<T> {
  const [state, setState] = useState<{ key: string | null; data: T[]; error: string | null }>({
    key: null,
    data: [],
    error: null,
  });

  useEffect(() => {
    if (key === null) return;
    return onSnapshot(
      build(),
      (snap) => setState({ key, data: snap.docs.map((d) => ({ ...d.data(), id: d.id }) as T), error: null }),
      (err) => {
        console.error(`[live:${key}]`, err);
        setState({ key, data: [], error: err.message });
      }
    );
    // `key` fully describes the query.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);

  if (key === null) return { data: [], loading: false, error: null };
  if (state.key !== key) return { data: [], loading: true, error: null };
  return { data: state.data, loading: false, error: state.error };
}

/**
 * One-time Firestore query, for large lists that don't need to update live (e.g. the AGNCY
 * directory). Same shape as useLive; `key` identifies the query, null stays idle.
 */
export function useOnce<T>(key: string | null, build: () => Query<DocumentData>): Live<T> {
  const [state, setState] = useState<{ key: string | null; data: T[]; error: string | null }>({ key: null, data: [], error: null });

  useEffect(() => {
    if (key === null) return;
    let alive = true;
    getDocs(build())
      .then((snap) => alive && setState({ key, data: snap.docs.map((d) => ({ ...d.data(), id: d.id }) as T), error: null }))
      .catch((err: Error) => {
        console.error(`[once:${key}]`, err);
        if (alive) setState({ key, data: [], error: err.message });
      });
    return () => {
      alive = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);

  if (key === null) return { data: [], loading: false, error: null };
  if (state.key !== key) return { data: [], loading: true, error: null };
  return { data: state.data, loading: false, error: state.error };
}

export interface LiveDoc<T> {
  data: T | null;
  loading: boolean;
  /** The document was read and does not exist. */
  missing: boolean;
}

export function useLiveDoc<T>(name: string, id: string | null | undefined): LiveDoc<T> {
  const key = id ? `${name}/${id}` : null;
  const [state, setState] = useState<{ key: string | null; data: T | null }>({ key: null, data: null });

  useEffect(() => {
    if (!key || !id) return;
    return onSnapshot(
      doc(db, name, id),
      (snap) => setState({ key, data: snap.exists() ? ({ ...snap.data(), id: snap.id } as T) : null }),
      (err) => {
        console.error(`[doc:${key}]`, err);
        setState({ key, data: null });
      }
    );
  }, [key, name, id]);

  if (!key) return { data: null, loading: false, missing: false };
  if (state.key !== key) return { data: null, loading: true, missing: false };
  return { data: state.data, loading: false, missing: state.data === null };
}

/** Re-renders on an interval so "3 days overdue" style labels stay fresh on long-lived tabs. */
export function useNow(intervalMs = 60_000): number {
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    const timer = setInterval(() => setNow(Date.now()), intervalMs);
    return () => clearInterval(timer);
  }, [intervalMs]);
  return now;
}
