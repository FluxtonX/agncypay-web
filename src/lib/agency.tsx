"use client";

import { createContext, useContext, useEffect, useMemo, useRef, useState } from "react";
import { C, col, useLive, useLiveDoc, where } from "./db";
import { claimPayoutsForOrg, ensureOrg, type Actor } from "./actions";
import { runSync } from "./crm/sync";
import { hashOf } from "./domain";
import type { Allocation, BankAccount, Invoice, Org, Payout, Profile } from "./types";

export interface AgencyData {
  profile: Profile;
  org: Org;
  actor: Actor;
  isOwner: boolean;
  invoices: Invoice[];
  allocations: Allocation[];
  payouts: Payout[];
  accounts: BankAccount[];
  /** Allocations other agencies owe this agency (it was booked as a co-agency). */
  owed: Allocation[];
  receiving: BankAccount | null;
  funding: BankAccount | null;
  loading: boolean;
}

const AgencyContext = createContext<AgencyData | null>(null);

export function useAgency(): AgencyData {
  const value = useContext(AgencyContext);
  if (!value) throw new Error("useAgency must be used inside the agency portal.");
  return value;
}

const SYNC_EVERY = 2 * 60_000;
const FOCUS_THROTTLE = 45_000;

/** Keeps the CRM mirror fresh with no manual action: on open, every two minutes and when the tab regains focus. */
function useAutoSync(org: Org | null) {
  const orgRef = useRef<Org | null>(org);
  useEffect(() => {
    orgRef.current = org;
  }, [org]);

  const key = org?.crm.provider ? `${org.id}|${org.crm.provider}|${hashOf(org.sandbox ?? null)}` : null;

  useEffect(() => {
    if (!key) return;
    let inFlight = false;
    let last = 0;
    const tick = async (force: boolean) => {
      const current = orgRef.current;
      if (!current?.crm.provider || inFlight) return;
      if (!force && Date.now() - last < FOCUS_THROTTLE) return;
      inFlight = true;
      last = Date.now();
      try {
        await runSync(current);
      } catch (err) {
        console.warn("[crm sync]", err);
      } finally {
        inFlight = false;
      }
    };
    void tick(true);
    const timer = setInterval(() => void tick(true), SYNC_EVERY);
    const onFocus = () => void tick(false);
    window.addEventListener("focus", onFocus);
    return () => {
      clearInterval(timer);
      window.removeEventListener("focus", onFocus);
    };
  }, [key]);
}

export type AgencyGate =
  | { state: "loading" }
  | { state: "error"; message: string }
  | { state: "removed"; orgName: string }
  | { state: "ready"; data: AgencyData };

export function useAgencyGate(profile: Profile): AgencyGate {
  const orgId = profile.orgId || profile.uid;
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    ensureOrg(profile).catch((err) => setError(err instanceof Error ? err.message : "Couldn't open your agency account."));
    // Only needs to run once per login.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [profile.uid, orgId]);

  const orgDoc = useLiveDoc<Org>(C.orgs, orgId);
  const org = orgDoc.data;
  const member = !!org && org.memberUids.includes(profile.uid);
  const live = member ? orgId : null;

  const invoices = useLive<Invoice>(live && `inv:${live}`, () => col(C.invoices, where("orgId", "==", orgId)));
  const allocations = useLive<Allocation>(live && `alloc:${live}`, () => col(C.allocations, where("orgId", "==", orgId)));
  const payouts = useLive<Payout>(live && `payouts:${live}`, () => col(C.payouts, where("orgId", "==", orgId)));
  const accounts = useLive<BankAccount>(live && `banks:${live}`, () => col(C.bankAccounts, where("ownerId", "==", orgId)));
  const emails = useMemo(() => (org?.emails ?? []).slice(0, 30), [org?.emails]);
  const owedKey = live && emails.length ? `owed:${emails.join(",")}` : null;
  const owed = useLive<Allocation>(owedKey, () => col(C.allocations, where("recipientEmail", "in", emails)));

  useAutoSync(member ? org : null);

  // Collect payouts other agencies authorised for us once we can receive them.
  const hasBank = accounts.data.length > 0;
  const claimKey = live && !accounts.loading ? `${live}|${hasBank}|${emails.join(",")}` : null;
  const orgRef = useRef(org);
  useEffect(() => {
    orgRef.current = org;
  }, [org]);
  useEffect(() => {
    if (!claimKey || !orgRef.current) return;
    claimPayoutsForOrg(orgRef.current, hasBank).catch((err) => console.warn("[claim payouts]", err));
  }, [claimKey, hasBank]);

  const data = useMemo<AgencyData | null>(() => {
    if (!org || !member) return null;
    const sortedAccounts = [...accounts.data].sort((a, b) => a.createdAt - b.createdAt);
    return {
      profile,
      org,
      actor: { uid: profile.uid, name: profile.fullName || profile.email },
      isOwner: org.ownerUid === profile.uid,
      invoices: [...invoices.data].sort((a, b) => b.issueDate - a.issueDate),
      allocations: allocations.data,
      payouts: [...payouts.data].sort((a, b) => b.createdAt - a.createdAt),
      accounts: sortedAccounts,
      owed: owed.data.filter((a) => a.orgId !== org.id),
      receiving: sortedAccounts.find((a) => a.receiving) ?? sortedAccounts[0] ?? null,
      funding: sortedAccounts.find((a) => a.funding) ?? sortedAccounts[0] ?? null,
      loading: invoices.loading || allocations.loading || payouts.loading || accounts.loading,
    };
  }, [org, member, profile, invoices, allocations, payouts, accounts, owed]);

  if (error && !org) return { state: "error", message: error };
  if (orgDoc.loading || (!org && !error)) return { state: "loading" };
  if (org && !member) return { state: "removed", orgName: org.name };
  if (!data) return { state: "loading" };
  return { state: "ready", data };
}

export function AgencyProvider({ value, children }: { value: AgencyData; children: React.ReactNode }) {
  return <AgencyContext.Provider value={value}>{children}</AgencyContext.Provider>;
}
