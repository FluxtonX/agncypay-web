"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { ChevronLeft, Download, Search, Loader2, FileText, RefreshCw, ChevronDown, ChevronRight, Link2 } from "lucide-react";
import { Badge } from "../../../../components/ui/Badge";
import { useRouter } from "next/navigation";

// Unified accounting hooks & types
import { useAccounting } from "../../hooks/useAccounting";
import { ProviderType } from "../../types";

interface GroupedInvoice {
  name: string;
  totalAmount: number;
  status: "Paid" | "Pending";
  latestDate: string;
  items: any[];
}

function cn(...classes: (string | undefined | false)[]) {
  return classes.filter(Boolean).join(" ");
}

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

export default function IncomePage() {
  const router = useRouter();
  const { currentProvider, allInvoices, loading, connectionStatuses, error, fetchData } = useAccounting();
  
  const [filtered, setFiltered] = useState<any[]>([]);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<"All" | "Paid" | "Pending">("All");
  const [expandedNames, setExpandedNames] = useState<string[]>([]);

  const anyConnected = Object.values(connectionStatuses).some(status => status?.connected);

  const toggleExpand = (name: string) => {
    setExpandedNames((prev) =>
      prev.includes(name) ? prev.filter((n) => n !== name) : [...prev, name]
    );
  };

  const groupedInvoices = React.useMemo(() => {
    const groups: { [key: string]: any } = {};
    filtered.forEach((inv) => {
      const key = `${inv.name}_${inv.provider}`;
      if (!groups[key]) {
        groups[key] = {
          name: inv.name,
          totalAmount: 0,
          status: "Paid",
          latestDate: inv.date,
          items: [],
          provider: inv.provider,
        };
      }
      const g = groups[key];
      g.totalAmount += inv.amount;
      g.items.push(inv);
      if (inv.status === "Pending") {
        g.status = "Pending";
      }
      if (new Date(inv.date) > new Date(g.latestDate)) {
        g.latestDate = inv.date;
      }
    });
    
    // Sort: QuickBooks first, then Xero, then Sage
    const providerOrder: Record<string, number> = { quickbooks: 1, xero: 2, sage: 3 };
    return Object.values(groups).sort((a: any, b: any) => {
      const orderA = providerOrder[a.provider] || 99;
      const orderB = providerOrder[b.provider] || 99;
      if (orderA !== orderB) {
        return orderA - orderB;
      }
      return b.totalAmount - a.totalAmount;
    });
  }, [filtered]);

  useEffect(() => {
    let result = allInvoices;
    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter(
        (inv) =>
          inv.name.toLowerCase().includes(q) ||
          inv.docNumber.toLowerCase().includes(q) ||
          inv.detail.toLowerCase().includes(q)
      );
    }
    if (statusFilter !== "All") {
      result = result.filter((inv) => inv.status === statusFilter);
    }
    setFiltered(result);
  }, [search, statusFilter, allInvoices]);

  const handleExport = () => {
    const rows = [
      ["Doc #", "Client / Name", "Detail", "Date", "Status", "Due", "Amount"],
      ...filtered.map((inv) => [
        inv.docNumber,
        inv.name,
        inv.detail,
        inv.date,
        inv.status,
        inv.daysText,
        inv.amount.toFixed(2),
      ]),
    ];
    const csv = rows.map((r) => r.map((c) => `"${c}"`).join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${currentProvider}_income.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const badgeVariant = (status: string) => {
    if (status === "Paid") return "success" as const;
    if (status === "Pending") return "warning" as const;
    return "neutral" as const;
  };

  return (
    <div className="min-h-screen bg-[#060606] text-white">
      <div className="mx-auto w-full max-w-[1100px] px-4 py-8 sm:px-6">
        {/* Back button */}
        <Link
          href={`/providers/${currentProvider}/dashboard`}
          className="inline-flex items-center gap-2 text-[13px] font-semibold text-neutral-500 transition-colors hover:text-white mb-6"
        >
          <ChevronLeft className="h-4 w-4" />
          Back to Dashboard
        </Link>

        {/* Header */}
        <div className="flex flex-col gap-1 mb-8">
          <h1 className="text-2xl font-bold tracking-tight text-white capitalize">Income &amp; Deposits</h1>
          <p className="text-sm text-neutral-500">Full history of your platform invoices and income.</p>
        </div>

        {/* Toolbar */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-5">
          <div className="flex items-center gap-2">
            {(["All", "Paid", "Pending"] as const).map((s) => (
              <button
                key={s}
                onClick={() => setStatusFilter(s)}
                className={cn(
                  "h-8 px-3 rounded-lg text-xs font-semibold border transition-all",
                  statusFilter === s
                    ? "bg-white text-black border-white"
                    : "bg-transparent text-neutral-400 border-[#3a3a3a] hover:border-neutral-600 hover:text-white"
                )}
              >
                {s}
              </button>
            ))}
          </div>
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <div className="relative flex-1 sm:flex-none">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-neutral-500 pointer-events-none" />
              <input
                type="text"
                placeholder="Search invoices..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="h-9 w-full sm:w-56 rounded-lg border border-[#3a3a3a] bg-[#111] pl-9 pr-3 text-xs text-white placeholder-neutral-600 outline-none focus:border-neutral-500 transition-colors"
              />
            </div>
            <button
              onClick={() => fetchData()}
              className="h-9 w-9 flex items-center justify-center rounded-lg border border-[#3a3a3a] bg-[#111] text-neutral-400 hover:text-white hover:border-neutral-600 transition-colors"
              title="Refresh"
            >
              <RefreshCw className="h-3.5 w-3.5" />
            </button>
            <button
              onClick={handleExport}
              disabled={filtered.length === 0}
              className="h-9 px-3 flex items-center gap-1.5 rounded-lg border border-[#3a3a3a] bg-[#111] text-xs font-semibold text-neutral-400 hover:text-white hover:border-neutral-600 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <Download className="h-3.5 w-3.5" />
              Export
            </button>
          </div>
        </div>

        {/* Table card */}
        <div className="rounded-xl border border-[#222] bg-[#0D0D0D] overflow-hidden">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-24">
              <Loader2 className="h-8 w-8 text-neutral-500 animate-spin mb-3" />
              <p className="text-sm text-neutral-500">Loading income data...</p>
            </div>
          ) : error ? (
            <div className="flex flex-col items-center justify-center py-24 text-center px-6">
              <p className="text-sm text-red-400 mb-3">{error}</p>
              <button onClick={() => fetchData()} className="text-xs font-bold text-white underline">Try again</button>
            </div>
          ) : !anyConnected ? (
            <div className="flex flex-col items-center justify-center py-24 text-center px-6">
              <Link2 className="h-10 w-10 text-neutral-600 mb-3 stroke-[1.5] opacity-40" />
              <p className="text-sm text-neutral-400 mb-3">No accounting platforms are connected.</p>
              <Link href="/dashboard/integrations" className="text-xs font-bold text-white hover:underline">
                Connect a Platform →
              </Link>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[700px] text-left">
                <thead>
                  <tr className="border-b border-[#222]">
                    <th className="px-5 py-3.5 text-[11px] font-bold uppercase tracking-wider text-neutral-500 w-8 pl-2"></th>
                    <th className="px-5 py-3.5 text-[11px] font-bold uppercase tracking-wider text-neutral-500">Platform / Client</th>
                    <th className="px-4 py-3.5 text-[11px] font-bold uppercase tracking-wider text-neutral-500">Invoice Count</th>
                    <th className="px-4 py-3.5 text-[11px] font-bold uppercase tracking-wider text-neutral-500">Latest Date</th>
                    <th className="px-4 py-3.5 text-[11px] font-bold uppercase tracking-wider text-neutral-500">Status</th>
                    <th className="px-5 py-3.5 text-[11px] font-bold uppercase tracking-wider text-neutral-500 text-right pr-6">Total Amount</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#1a1a1a]">
                  {groupedInvoices.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="py-16 text-center">
                        <FileText className="h-8 w-8 text-neutral-700 mx-auto mb-2" />
                        <p className="text-sm text-neutral-500">No invoices match your search.</p>
                      </td>
                    </tr>
                  ) : (
                    groupedInvoices.map((group) => {
                      const isExpanded = expandedNames.includes(group.name);
                      return (
                        <React.Fragment key={group.name}>
                          <tr
                            onClick={() => toggleExpand(group.name)}
                            className="group transition-colors hover:bg-white/[0.02] cursor-pointer select-none"
                          >
                            <td className="py-4 pl-5 text-neutral-600 group-hover:text-white transition-colors">
                              {isExpanded ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                            </td>
                            <td className="px-5 py-4 font-bold text-white">
                              <div className="flex items-center gap-2">
                                <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded bg-neutral-900 border border-[#2a2a2a] p-1">
                                  {/* eslint-disable-next-line @next/next/no-img-element */}
                                  <img src={getProviderDetails(group.provider)?.logo} alt={group.provider} className="h-full w-full object-contain" />
                                </div>
                                {group.name}
                              </div>
                            </td>
                            <td className="px-4 py-4 text-xs font-semibold text-neutral-400">{group.items.length} invoice{group.items.length !== 1 ? "s" : ""}</td>
                            <td className="px-4 py-4 text-xs font-semibold text-neutral-500">{group.latestDate}</td>
                            <td className="px-4 py-4 text-xs font-semibold">
                              <Badge variant={group.status === "Paid" ? "success" : "warning"} className="capitalize">
                                {group.status.toLowerCase()}
                              </Badge>
                            </td>
                            <td className="px-5 py-4 font-mono text-white text-right pr-6 font-bold">
                              ${group.totalAmount.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                            </td>
                          </tr>

                          {isExpanded && (
                            <tr>
                              <td colSpan={6} className="bg-neutral-950/40 p-4 border-t border-[#1c1c1c]">
                                <div className="rounded-lg border border-[#222] bg-[#050505] overflow-hidden">
                                  <table className="w-full text-left text-[11px] text-neutral-400">
                                    <thead>
                                      <tr className="border-b border-[#222] bg-[#0a0a0a] text-neutral-500">
                                        <th className="px-4 py-2.5">Invoice ID</th>
                                        <th className="px-4 py-2.5">Detail</th>
                                        <th className="px-4 py-2.5">Date Created</th>
                                        <th className="px-4 py-2.5">Due Status</th>
                                        <th className="px-4 py-2.5">Amount</th>
                                        <th className="px-4 py-2.5">Status</th>
                                        <th className="px-4 py-2.5 text-right pr-6">Action</th>
                                      </tr>
                                    </thead>
                                    <tbody className="divide-y divide-[#1a1a1a]">
                                      {group.items.map((item: any) => (
                                        <tr key={item.id} className="hover:bg-white/[0.01]">
                                          <td className="px-4 py-2.5 font-mono text-white">#{item.docNumber}</td>
                                          <td className="px-4 py-2.5 max-w-[200px] truncate text-neutral-300">{item.detail}</td>
                                          <td className="px-4 py-2.5 text-neutral-400">{item.date}</td>
                                          <td className="px-4 py-2.5 text-neutral-500">{item.daysText}</td>
                                          <td className="px-4 py-2.5 font-mono text-white font-semibold">
                                            ${item.amount.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                                          </td>
                                          <td className="px-4 py-2.5">
                                            <Badge
                                              variant={badgeVariant(item.status)}
                                              className="text-[9px] px-1.5 py-0 capitalize"
                                            >
                                              {item.status.toLowerCase()}
                                            </Badge>
                                          </td>
                                          <td className="px-4 py-2.5 text-right pr-6">
                                            {item.status === "Pending" ? (
                                              <button
                                                type="button"
                                                onClick={() => router.push(`/dashboard/pay-flow/${item.id}`)}
                                                className="h-5.5 px-2 bg-white text-black hover:bg-neutral-200 font-bold rounded text-[10px] transition-all cursor-pointer inline-flex items-center justify-center hover:scale-[1.02] active:scale-[0.98]"
                                              >
                                                Pay Now
                                              </button>
                                            ) : (
                                              <span className="text-[10px] text-neutral-600 font-medium">No action</span>
                                            )}
                                          </td>
                                        </tr>
                                      ))}
                                    </tbody>
                                  </table>
                                </div>
                              </td>
                            </tr>
                          )}
                        </React.Fragment>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
export { IncomePage };
