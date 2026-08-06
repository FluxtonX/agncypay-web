"use client";

import React, { useState, useEffect, useMemo, useCallback } from "react";
import { Building2, CreditCard, Plus, CheckCircle2, X, Loader2, ShieldCheck, Wallet } from "lucide-react";

interface PlaidAccount {
  id: string;
  institutionName: string;
  name: string;
  mask: string;
  subtype: string;
  availableBalance: number;
}

interface BanksAndCardsPanelProps {
  onConnectAccount?: () => void;
}

export function BanksAndCardsPanel({ onConnectAccount }: BanksAndCardsPanelProps) {
  const [plaidAccounts, setPlaidAccounts] = useState<PlaidAccount[]>([]);
  const [isPlaidLoading, setIsPlaidLoading] = useState(false);
  const [plaidError, setPlaidError] = useState<string | null>(null);

  // Initialize Plaid Link SDK
  useEffect(() => {
    if (typeof window !== "undefined") {
      if (!document.getElementById("plaid-link-sdk")) {
        const script = document.createElement("script");
        script.id = "plaid-link-sdk";
        script.src = "https://cdn.plaid.com/link/v2/stable/link-initialize.js";
        script.async = true;
        document.body.appendChild(script);
      }

      const saved = localStorage.getItem("agency_plaid_accounts");
      if (saved) {
        try {
          setPlaidAccounts(JSON.parse(saved));
        } catch (e) {
          console.error("Error reading saved Plaid accounts:", e);
        }
      }
    }
  }, []);

  const handleConnectPlaid = useCallback(async () => {
    setIsPlaidLoading(true);
    setPlaidError(null);

    try {
      const res = await fetch("/api/plaid/link-token", { method: "POST" });
      const data = await res.json();

      if (!res.ok || !data.link_token) {
        throw new Error(data.error || "Failed to generate Plaid link token");
      }

      if (typeof (window as any).Plaid === "undefined") {
        throw new Error("Plaid SDK is still loading. Please try again in a moment.");
      }

      const handler = (window as any).Plaid.create({
        token: data.link_token,
        onSuccess: async (public_token: string, metadata: any) => {
          setIsPlaidLoading(true);
          try {
            const exchangeRes = await fetch("/api/plaid/exchange-token", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                public_token,
                institution: metadata?.institution,
              }),
            });

            const exchangeData = await exchangeRes.json();

            if (!exchangeRes.ok || !exchangeData.success) {
              throw new Error(exchangeData.error || "Failed to exchange Plaid public token");
            }

            const newAccounts: PlaidAccount[] = exchangeData.accounts || [];

            setPlaidAccounts((prev) => {
              const existingIds = new Set(prev.map((a) => a.id));
              const filtered = newAccounts.filter((a) => !existingIds.has(a.id));
              const updated = [...prev, ...filtered];
              if (typeof window !== "undefined") {
                localStorage.setItem("agency_plaid_accounts", JSON.stringify(updated));
              }
              return updated;
            });
          } catch (err: any) {
            console.error("Plaid token exchange error:", err);
            setPlaidError(err.message || "Failed to complete Plaid bank connection.");
          } finally {
            setIsPlaidLoading(false);
          }
        },
        onExit: (err: any) => {
          setIsPlaidLoading(false);
          if (err != null) {
            console.warn("Plaid Link exited with error:", err);
          }
        },
      });

      handler.open();
    } catch (err: any) {
      console.error("Error launching Plaid:", err);
      setPlaidError(err.message || "Failed to initiate Plaid link.");
      setIsPlaidLoading(false);
      if (onConnectAccount) {
        onConnectAccount();
      }
    }
  }, [onConnectAccount]);

  const handleDisconnectPlaidAccount = (id: string) => {
    setPlaidAccounts((prev) => {
      const updated = prev.filter((acc) => acc.id !== id);
      if (typeof window !== "undefined") {
        localStorage.setItem("agency_plaid_accounts", JSON.stringify(updated));
      }
      return updated;
    });
  };

  const totalPlaidFloat = useMemo(() => {
    if (plaidAccounts.length === 0) return 48950.00;
    return plaidAccounts.reduce((sum, acc) => sum + (acc.availableBalance || 0), 0);
  }, [plaidAccounts]);

  return (
    <div className="bg-[#0D0D0D] light:bg-white rounded-2xl border border-white/20 light:border-black/10 overflow-hidden shadow-xl flex flex-col space-y-0">
      {/* Header */}
      <div className="p-6 border-b border-white/10 light:border-black/10 bg-white/[0.01] flex items-center justify-between">
        <div>
          <h3 className="text-xs font-extrabold uppercase tracking-wider text-[#8f8f8f] light:text-[#475569] flex items-center gap-2">
            <Building2 className="w-4 h-4 text-white light:text-black" />
            CONNECTED BANKING FEEDS
          </h3>
        </div>
        <button
          type="button"
          onClick={handleConnectPlaid}
          disabled={isPlaidLoading}
          className="px-4 py-2 rounded-xl bg-white light:bg-[#0F172A] text-black light:text-white hover:bg-neutral-200 light:hover:bg-black text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-sm disabled:opacity-50"
        >
          {isPlaidLoading ? (
            <>
              <Loader2 className="h-3.5 w-3.5 animate-spin text-black light:text-white" />
              <span className="light:text-white">Connecting...</span>
            </>
          ) : (
            <>
              <Plus className="h-3.5 w-3.5 text-black light:text-white" />
              <span className="light:text-white">+ Connect Bank (Plaid)</span>
            </>
          )}
        </button>
      </div>

      {plaidError && (
        <div className="p-3 bg-white/10 light:bg-slate-100 border-b border-white/20 light:border-black/20 text-white light:text-black text-xs font-semibold flex items-center justify-between px-6">
          <span>{plaidError}</span>
          <button onClick={() => setPlaidError(null)} className="text-white light:text-black hover:opacity-75 cursor-pointer">
            <X className="h-3.5 w-3.5" />
          </button>
        </div>
      )}

      {/* Main Body */}
      <div className="p-6 flex flex-col gap-4 border-b border-white/10 light:border-black/10 bg-white/[0.02] light:bg-slate-50/50">
        {/* Dynamic Plaid Connected Accounts */}
        {plaidAccounts.length > 0 && plaidAccounts.map((acc) => (
          <div
            key={acc.id}
            className="flex items-center justify-between p-4 rounded-xl border border-white/20 light:border-black/20 bg-white/[0.04] light:bg-slate-100 hover:border-white/40 light:hover:border-black/40 transition-all"
          >
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl border border-white/20 light:border-black/20 bg-white/10 light:bg-white flex items-center justify-center shrink-0">
                <Building2 className="h-6 w-6 text-white light:text-black" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h4 className="text-xs font-bold text-white light:text-[#0F172A]">{acc.institutionName} — {acc.name}</h4>
                  <span className="px-2 py-0.5 rounded text-[9px] font-extrabold uppercase bg-white/10 light:bg-slate-200 text-white light:text-black border border-white/20 light:border-black/20">
                    Plaid Verified
                  </span>
                </div>
                <p className="text-[11px] font-medium text-[#8f8f8f] light:text-[#475569] mt-0.5">
                  {acc.subtype?.toUpperCase()} ••••{acc.mask}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-right">
                <span className="text-xs font-bold text-white light:text-[#0F172A] block">
                  ${acc.availableBalance.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </span>
                <span className="text-[10px] text-neutral-400 light:text-neutral-600 font-semibold">Available Float</span>
              </div>
              <button
                onClick={() => handleDisconnectPlaidAccount(acc.id)}
                title="Disconnect Bank Feed"
                className="p-1.5 rounded-lg border border-white/10 light:border-black/10 bg-black/40 light:bg-white text-[#8f8f8f] light:text-[#475569] hover:text-white light:hover:text-black hover:border-white/30 light:hover:border-black/30 transition-all cursor-pointer"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>
        ))}

        {/* Default Verified Card Feeds */}
        <div className="flex items-center gap-4 p-4 rounded-xl border border-white/10 light:border-black/10 bg-[#0A0A0A] light:bg-white cursor-pointer hover:border-white/20 light:hover:border-black/20 transition-all shadow-xs">
          <div className="w-16 h-11 rounded-lg shrink-0 border border-white/10 light:border-black/10 overflow-hidden bg-black light:bg-[#0F172A] flex items-center justify-center p-1">
            <span className="text-[10px] font-extrabold text-white tracking-wider">CHASE</span>
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <h4 className="text-xs font-bold text-white light:text-[#0F172A] truncate">Chase Ink Business Unlimited Visa</h4>
              <span className="px-1.5 py-0.5 rounded text-[9px] font-extrabold uppercase bg-white/10 light:bg-slate-200 text-white light:text-black border border-white/20 light:border-black/20">
                Verified
              </span>
            </div>
            <p className="text-[11px] font-medium text-[#8f8f8f] light:text-[#475569] mt-0.5">Visa •••• 4892 • Primary Disbursement Account</p>
          </div>
          <div className="text-right">
            <span className="text-xs font-bold text-white light:text-[#0F172A] block">$35,000.00</span>
            <span className="text-[10px] text-neutral-400 light:text-neutral-600 font-semibold">Float Limit</span>
          </div>
        </div>

        <div className="flex items-center gap-4 p-4 rounded-xl border border-white/10 light:border-black/10 bg-[#0A0A0A] light:bg-white cursor-pointer hover:border-white/20 light:hover:border-black/20 transition-all shadow-xs">
          <div className="w-16 h-11 rounded-lg shrink-0 border border-white/10 light:border-black/10 overflow-hidden bg-black light:bg-[#0F172A] flex items-center justify-center p-1">
            <span className="text-[10px] font-extrabold text-white tracking-wider">MERCURY</span>
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <h4 className="text-xs font-bold text-white light:text-[#0F172A] truncate">Mercury Business IO Mastercard</h4>
              <span className="px-1.5 py-0.5 rounded text-[9px] font-extrabold uppercase bg-white/10 light:bg-slate-200 text-white light:text-black border border-white/20 light:border-black/20">
                Active
              </span>
            </div>
            <p className="text-[11px] font-medium text-[#8f8f8f] light:text-[#475569] mt-0.5">Mastercard •••• 1094 • Card Settlement Feed</p>
          </div>
          <div className="text-right">
            <span className="text-xs font-bold text-white light:text-[#0F172A] block">$13,950.00</span>
            <span className="text-[10px] text-neutral-400 light:text-neutral-600 font-semibold">Float Limit</span>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="p-6 bg-white/[0.01] flex justify-between items-center text-xs">
        <span className="font-semibold text-[#8f8f8f] light:text-[#475569] flex items-center gap-1.5">
          <ShieldCheck className="w-4 h-4 text-white light:text-black" />
          Plaid Available Verified Float
        </span>
        <span className="text-sm font-extrabold text-white light:text-[#0F172A]">
          ${totalPlaidFloat.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
        </span>
      </div>
    </div>
  );
}

export default BanksAndCardsPanel;
