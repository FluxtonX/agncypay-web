"use client";

import React, { useEffect, useState, startTransition, useCallback } from "react";
import { useApp } from "@/context/AppContext";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Users, Loader2, Building } from "lucide-react";

interface WalletItem {
  id: string;
  name: string;
  type: string;
  email: string | null;
  status: string;
}

export function RecentVendorsCard() {
  const { state } = useApp();
  const [wallets, setWallets] = useState<WalletItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchWallets = useCallback(async () => {
    try {
      const res = await fetch("/api/wallets", {
        headers: {
          Authorization: `Bearer ${(state as any).token || ""}`,
        },
      });
      const body = await res.json();
      if (!res.ok) {
        throw new Error(body.message || "Failed to fetch vendor network.");
      }
      
      // Filter out user's own wallet
      const filtered = (body.data || []).filter((w: WalletItem) => w.id !== (state.user as any)?.walletId);
      startTransition(() => {
        setWallets(filtered);
      });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "An unexpected error occurred.";
      startTransition(() => {
        setError(msg);
      });
    } finally {
      startTransition(() => {
        setLoading(false);
      });
    }
  }, [(state.user as any)?.walletId, (state as any).token]);

  useEffect(() => {
    fetchWallets();
  }, [fetchWallets]);

  return (
    <Card className="p-6 relative overflow-hidden flex flex-col justify-between min-h-[300px]">
      <div>
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-xs font-bold uppercase tracking-wider text-neutral-400 flex items-center gap-2">
            <Users className="h-4 w-4 text-neutral-400" />
            Connected Network Partners
          </h3>
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-12">
            <Loader2 className="h-8 w-8 text-neutral-500 animate-spin mb-3" />
            <p className="text-xs text-neutral-500">Retrieving partner directories...</p>
          </div>
        ) : error ? (
          <div className="text-xs text-red-400 font-medium py-8 text-center">{error}</div>
        ) : wallets.length === 0 ? (
          <div className="flex flex-col items-center justify-center text-center py-10 border border-dashed border-[#3a3a3a] rounded-lg bg-white/[0.01]">
            <Building className="h-8 w-8 text-neutral-600 mb-3" />
            <p className="text-xs text-neutral-400">No other partners registered yet.</p>
          </div>
        ) : (
          <div className="space-y-2">
            {wallets.map((wallet) => (
              <div
                key={wallet.id}
                className="w-full flex items-center justify-between gap-3 rounded-lg border border-[#3a3a3a] bg-black px-3 py-2.5 transition-colors hover:border-white/30 hover:bg-white/[0.03] group"
              >
                <div className="flex items-center gap-3 min-w-0 flex-1">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-neutral-900 border border-[#3a3a3a] font-bold text-xs text-[#A87019] bg-[#A87019]/5">
                    {wallet.name.charAt(0).toUpperCase()}
                  </div>
                  <div className="min-w-0 flex-1 text-left">
                    <p className="truncate text-[13px] font-semibold text-white">{wallet.name}</p>
                    <p className="truncate text-[11px] text-neutral-500 mt-0.5 font-mono">
                      {wallet.email || "No email"}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3 shrink-0">
                  <Badge variant="neutral" className="capitalize text-[10px] py-0.5 px-2">
                    {wallet.type.toLowerCase()}
                  </Badge>
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 shrink-0" />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </Card>
  );
}
export default RecentVendorsCard;
