"use client";

import React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowUpRight, Loader2, Play } from "lucide-react";
import { useAccounting } from "../../modules/accounting/hooks/useAccounting";
import { useApp } from "../../context/AppContext";
import { cn } from "../../lib/utils";

const masterIntegrations = [
  { label: "QuickBooks", src: "/quickbook.png" },
  { label: "Xero", src: "/xero.png" },
  { label: "Sage", src: "/sage.png" },
  { label: "NetSuite", src: "/netsuite.png" },
  { label: "Mercury", src: "/mercuryLogo.png" },
];

export function SyncedInvoicesTable() {
  const router = useRouter();
  const { currentProvider, connectionStatuses, invoices, loading } = useAccounting();
  const { state } = useApp();

  const workspaceType = state.user?.accountType || "brand";
  const isAgency = workspaceType === "agency";
  const isTalent = ["talent", "individual", "talent_independent", "talent_agency"].includes(workspaceType);

  // Find the logo for the current provider
  const providerConfig = masterIntegrations.find(
    (i) => i.label.toLowerCase() === currentProvider?.toLowerCase()
  );
  const providerLogo = providerConfig?.src || "/quickbook.png";

  const isConnected = connectionStatuses[currentProvider]?.connected;

  return (
    <div className="bg-[#0D0D0D] rounded-[13px] border border-[#3a3a3a] p-4 sm:p-5 shadow-[0_0_0_1px_rgba(255,255,255,0.04),0_4px_24px_-4px_rgba(0,0,0,0.6)] flex flex-col min-h-[280px]">
      <div className="flex items-center justify-between mb-4 pb-3 border-b border-[#222]">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-neutral-900 border border-[#3a3a3a] p-1.5">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={providerLogo} alt={currentProvider || "Provider"} className="h-full w-full object-contain" />
          </div>
          <div className="text-left">
            <h3 className="text-xs font-bold uppercase tracking-wider text-neutral-400">
              Platform Invoices (Synced)
            </h3>
            <p className="text-[10px] text-neutral-500">Synced from {currentProvider || "integration"}</p>
          </div>
        </div>
        <Link href="/dashboard/invoices" className="text-[10px] font-bold text-neutral-500 hover:text-white flex items-center gap-0.5">
          View All <ArrowUpRight className="h-3 w-3" />
        </Link>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center flex-grow py-8">
          <Loader2 className="h-6 w-6 text-neutral-500 animate-spin" />
        </div>
      ) : !isConnected ? (
        <div className="flex flex-col items-center justify-center flex-grow py-8 border border-dashed border-[#3a3a3a] rounded-lg bg-[#060606] text-center text-xs text-neutral-400">
          No platforms connected. Invoices synchronize here once QuickBooks or Xero are linked.
        </div>
      ) : invoices.length === 0 ? (
        <div className="flex flex-col items-center justify-center flex-grow py-8 text-xs text-neutral-500 text-center font-semibold">
          No invoices synced from {currentProvider}.
        </div>
      ) : (
        <div className="overflow-x-auto flex-grow">
          <table className="w-full text-left border-collapse text-xs select-text">
            <thead>
              <tr className="border-b border-[#222] text-neutral-500 font-bold uppercase tracking-wider text-[10px]">
                <th className="pb-2">Invoice #</th>
                <th className="pb-2">{isAgency ? "Brand" : isTalent ? "Agency" : "Recipient"}</th>
                <th className="pb-2">Due Date</th>
                <th className="pb-2">Amount</th>
                <th className="pb-2">Status</th>
                <th className="pb-2 text-right pr-2">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#222]">
              {invoices.slice(0, 5).map((inv) => {
                const isPaid = inv.status?.toUpperCase() === "PAID" || inv.status?.toUpperCase() === "SETTLED";
                const isPending = inv.status?.toUpperCase() === "PENDING" || inv.status?.toUpperCase() === "UNPAID";

                return (
                  <tr key={inv.id} className="hover:bg-white/[0.01] transition-colors group">
                    <td className="py-2.5 font-mono font-bold text-neutral-300">#{inv.docNumber || inv.id.substring(0, 6)}</td>
                    <td className="py-2.5 font-bold text-white max-w-[120px] truncate" title={inv.name}>{inv.name}</td>
                    <td className="py-2.5 text-neutral-400">{inv.date}</td>
                    <td className="py-2.5 font-mono font-bold text-white">
                      {new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(inv.amount)}
                    </td>
                    <td className="py-2.5">
                      <span className={cn(
                        "inline-flex items-center px-2 py-0.5 rounded-full text-[9px] font-bold uppercase",
                        isPaid ? "bg-green-500/10 text-green-500 border border-green-500/25" :
                        inv.daysText === "Overdue" ? "bg-red-500/10 text-red-400 border border-red-500/25" :
                        "bg-amber-500/10 text-amber-500 border border-amber-500/25"
                      )}>
                        {inv.status}
                      </span>
                    </td>
                    <td className="py-2.5 text-right pr-2">
                      {isPaid && isAgency ? (
                        <button
                          type="button"
                          onClick={() => router.push(`/payout/${inv.id}?returnTo=dashboard`)}
                          className="h-6 px-2.5 bg-[#4B6BFB] text-white hover:bg-[#5b7bfb] font-bold rounded text-[9px] transition-all cursor-pointer inline-flex items-center justify-center active:scale-[0.98]"
                        >
                          Payout Talent (85%)
                        </button>
                      ) : isPending ? (
                        <button
                          type="button"
                          onClick={() => router.push(`/dashboard/pay-flow/${inv.id}`)}
                          className="h-6 px-2.5 bg-white text-black hover:bg-neutral-200 font-bold rounded text-[9px] transition-all cursor-pointer inline-flex items-center justify-center active:scale-[0.98]"
                        >
                          Pay Now
                        </button>
                      ) : (
                        <button
                          type="button"
                          onClick={() => router.push(`/dashboard/pay-flow/${inv.id}`)}
                          className="h-6 px-2.5 bg-neutral-900 border border-[#3a3a3a] text-neutral-400 hover:text-white font-bold rounded text-[9px] transition-all cursor-pointer inline-flex items-center justify-center active:scale-[0.98]"
                        >
                          View
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
