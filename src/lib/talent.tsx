"use client";

import { createContext, useContext, useEffect, useMemo } from "react";
import { C, col, useLive, useLiveDoc, where } from "./db";
import { claimPayoutsForUser, ensureHandle } from "./actions";
import { balanceOf } from "./domain";
import type { Allocation, BankAccount, Payout, Profile, VirtualCard, WalletTx } from "./types";

export interface TalentData {
  profile: Profile;
  allocations: Allocation[];
  payouts: Payout[];
  txs: WalletTx[];
  banks: BankAccount[];
  card: VirtualCard | null;
  balance: number;
  loading: boolean;
}

const TalentContext = createContext<TalentData | null>(null);

export function useTalent(): TalentData {
  const v = useContext(TalentContext);
  if (!v) throw new Error("useTalent must be used inside the AGNCY app.");
  return v;
}

export function useTalentData(profile: Profile): TalentData {
  const { email, uid } = profile;
  const allocations = useLive<Allocation>(`t-alloc:${email}`, () => col(C.allocations, where("recipientEmail", "==", email)));
  const payouts = useLive<Payout>(`t-payouts:${email}`, () => col(C.payouts, where("recipientEmail", "==", email)));
  const txs = useLive<WalletTx>(`t-tx:${uid}`, () => col(C.walletTx, where("uid", "==", uid)));
  const banks = useLive<BankAccount>(`banks:${uid}`, () => col(C.bankAccounts, where("ownerId", "==", uid)));
  const card = useLiveDoc<VirtualCard>(C.cards, uid);

  // First visit: issue a Wallet ID and collect any payouts sent before the account existed.
  useEffect(() => {
    if (!profile.handle) ensureHandle(profile).catch((err) => console.warn("[handle]", err));
    claimPayoutsForUser(profile).catch((err) => console.warn("[claim]", err));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [uid]);

  return useMemo(
    () => ({
      profile,
      allocations: [...allocations.data].sort((a, b) => b.updatedAt - a.updatedAt),
      payouts: [...payouts.data].sort((a, b) => b.createdAt - a.createdAt),
      txs: [...txs.data].sort((a, b) => b.at - a.at),
      banks: banks.data,
      card: card.data,
      balance: balanceOf(txs.data),
      loading: allocations.loading || txs.loading,
    }),
    [profile, allocations, payouts, txs, banks, card]
  );
}

export function TalentProvider({ value, children }: { value: TalentData; children: React.ReactNode }) {
  return <TalentContext.Provider value={value}>{children}</TalentContext.Provider>;
}
