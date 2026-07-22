"use client";

import React from "react";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { ArrowUpRight, Landmark, Loader2, ArrowUpRight as ArrowIcon } from "lucide-react";
import Link from "next/link";
import { useAccounting } from "../../hooks/useAccounting";
import { ProviderType } from "../../types";

const getProviderDetails = (provider: ProviderType) => {
  switch (provider) {
    case "quickbooks":
      return { name: "QuickBooks", logo: "/quickbook.png" };
    case "xero":
      return { name: "Xero", logo: "/xero.png" };
    case "sage":
      return { name: "Sage", logo: "/sage.png" };
  }
};

export function RecentPayoutsCard() {
  const { currentProvider, payouts, loading, connectionStatuses, error } = useAccounting();

  const providerInfo = getProviderDetails(currentProvider);
  const isConnected = !!connectionStatuses[currentProvider]?.connected;

  const badgeVariant = (status: string) => {
    if (status === "Paid") return "success" as const;
    if (status === "Failed") return "error" as const;
    return "warning" as const;
  };

  return (
    <Card className="p-6 relative overflow-hidden flex flex-col justify-between min-h-[300px]">
      <div>
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-xs font-bold uppercase tracking-wider text-neutral-400 flex items-center gap-2">
            <ArrowUpRight className="h-4 w-4 text-violet-400" />
            Recent Outgoing Payouts
          </h3>
          <Link
            href={`/providers/${currentProvider}/payouts`}
            className="text-[10px] font-bold text-neutral-500 hover:text-white transition-colors flex items-center gap-0.5"
          >
            View All <ArrowIcon className="h-3 w-3" />
          </Link>
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-12">
            <Loader2 className="h-8 w-8 text-neutral-500 animate-spin mb-3" />
            <p className="text-xs text-neutral-500">Querying payouts log...</p>
          </div>
        ) : error ? (
          <div className="text-xs text-red-400 font-medium py-8 text-center">{error}</div>
        ) : !isConnected ? (
          <div className="flex flex-col items-center justify-center text-center py-10 border border-dashed border-[#3a3a3a] rounded-lg bg-white/[0.01]">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={providerInfo.logo} alt={providerInfo.name} className="h-8 w-8 object-contain mb-3 opacity-40" />
            <p className="text-xs text-neutral-400">Connect {providerInfo.name} to see payouts.</p>
            <Link href="/dashboard/integrations" className="mt-2 text-xs font-bold text-white hover:underline">
              Connect {providerInfo.name} →
            </Link>
          </div>
        ) : payouts.length === 0 ? (
          <div className="flex flex-col items-center justify-center text-center py-10 border border-dashed border-[#3a3a3a] rounded-lg bg-white/[0.01]">
            <Landmark className="h-8 w-8 text-neutral-600 mb-3" />
            <p className="text-xs text-neutral-400">No outgoing payouts synced.</p>
          </div>
        ) : (
          <div className="space-y-2">
            {payouts.slice(0, 3).map((payout) => (
              <div
                key={payout.id}
                className="w-full flex items-center justify-between gap-3 rounded-lg border border-[#3a3a3a] bg-black px-3 py-2.5 transition-colors hover:border-white/30 hover:bg-white/[0.03]"
              >
                <div className="flex items-center gap-3 min-w-0 flex-1">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-white/10 text-white font-bold text-xs border border-white/5">
                    {payout.fallback}
                  </div>
                  <div className="min-w-0 flex-1 text-left">
                    <p className="truncate text-[13px] font-semibold text-white">
                      {payout.name}
                    </p>
                    <p className="truncate text-[11px] text-neutral-500 mt-0.5">
                      {payout.detail} · {payout.method}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-4 shrink-0">
                  <span className="hidden text-[11px] sm:inline-block text-neutral-500">{payout.date}</span>
                  <span className="font-mono text-[13px] font-bold text-white">
                    -{payout.amount}
                  </span>
                  <Badge
                    variant={badgeVariant(payout.status)}
                    className="capitalize text-[10px] px-2 py-0.5"
                  >
                    {payout.status}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </Card>
  );
}
export default RecentPayoutsCard;
