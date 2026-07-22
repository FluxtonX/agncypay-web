"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { FileText, Loader2, ArrowUpRight } from "lucide-react";
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

export function RecentInvoicesCard() {
  const router = useRouter();
  const { currentProvider, invoices, loading, connectionStatuses, error } = useAccounting();
  
  const providerInfo = getProviderDetails(currentProvider);
  const isConnected = !!connectionStatuses[currentProvider]?.connected;

  const badgeVariant = (status: string) => {
    if (status === "Paid") return "success" as const;
    if (status === "Pending") return "warning" as const;
    return "neutral" as const;
  };

  return (
    <Card className="p-6 flex flex-col min-h-[280px]">
      <div className="flex items-center justify-between mb-5">
        <h3 className="text-xs font-bold uppercase tracking-wider text-neutral-400 flex items-center gap-2">
          <FileText className="h-4 w-4 text-violet-400" />
          Recent Invoices
        </h3>
        <Link
          href={`/providers/${currentProvider}/income`}
          className="text-[10px] font-bold text-neutral-500 hover:text-white transition-colors flex items-center gap-0.5"
        >
          View All <ArrowUpRight className="h-3 w-3" />
        </Link>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center flex-1 py-8">
          <Loader2 className="h-7 w-7 text-neutral-500 animate-spin mb-2" />
          <p className="text-xs text-neutral-500">Loading invoices...</p>
        </div>
      ) : error ? (
        <div className="text-xs text-red-400 font-medium py-6 text-center">{error}</div>
      ) : !isConnected ? (
        <div className="flex flex-col items-center justify-center flex-1 text-center py-8 border border-dashed border-[#3a3a3a] rounded-lg bg-white/[0.01]">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={providerInfo.logo} alt={providerInfo.name} className="h-8 w-8 object-contain mb-3 opacity-40" />
          <p className="text-xs text-neutral-400">Connect {providerInfo.name} to see invoices.</p>
          <Link href="/dashboard/integrations" className="mt-2 text-xs font-bold text-white hover:underline">
            Connect {providerInfo.name} →
          </Link>
        </div>
      ) : invoices.length === 0 ? (
        <div className="flex flex-col items-center justify-center flex-1 text-center py-8 border border-dashed border-[#3a3a3a] rounded-lg bg-white/[0.01]">
          <FileText className="h-8 w-8 text-neutral-600 mb-3" />
          <p className="text-xs text-neutral-400">No invoices yet.</p>
          <Link href={`/providers/${currentProvider}/invoices`} className="mt-3 text-xs font-bold text-white hover:underline">
            Create first invoice →
          </Link>
        </div>
      ) : (
        <div className="space-y-2">
          {invoices.slice(0, 4).map((inv) => (
            <button
              key={inv.id}
              type="button"
              onClick={() => router.push(`/dashboard/pay-flow/${inv.id}`)}
              className="w-full flex items-center justify-between gap-3 rounded-lg border border-[#3a3a3a] bg-black px-3 py-2.5 transition-colors hover:border-white/30 hover:bg-white/[0.03] cursor-pointer group"
            >
              <div className="flex items-center gap-3 min-w-0 flex-1">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-neutral-900 border border-[#3a3a3a] p-1.5">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={providerInfo.logo} alt={providerInfo.name} className="h-full w-full object-contain" />
                </div>
                <div className="min-w-0 flex-1 text-left">
                  <p className="truncate text-[13px] font-semibold text-white group-hover:text-neutral-200 transition-colors">
                    {inv.name}
                  </p>
                  <p className="truncate text-[11px] text-neutral-500 mt-0.5">
                    #{inv.docNumber} · {inv.daysText}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-4 shrink-0">
                <span className="hidden text-[11px] sm:inline-block text-neutral-400">{inv.date}</span>
                <span className="font-mono text-[13px] font-bold text-white">
                  ${inv.amount.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                </span>
                <Badge
                  variant={badgeVariant(inv.status)}
                  className="capitalize text-[10px] px-2 py-0.5"
                >
                  {inv.status}
                </Badge>
              </div>
            </button>
          ))}
        </div>
      )}
    </Card>
  );
}
export default RecentInvoicesCard;
