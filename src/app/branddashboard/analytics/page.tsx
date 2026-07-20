"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Building2,
  TrendingUp,
  DollarSign,
  Activity,
  Percent,
  LogOut,
  Sparkles,
  ArrowUpRight,
  Clock,
  Wallet,
  PieChart,
  ChevronRight
} from "lucide-react";
import { useApp } from "../../../context/AppContext";
import { subscribeInvoicesByBrand, subscribeInvoicesByAgency, FirestoreInvoice } from "../../../lib/firebaseInvoices";

export default function AnalyticsDashboardPage() {
  const router = useRouter();
  const { state, resetState } = useApp();
  const workspaceType = state.user ? state.user.accountType : "brand";

  const [invoices, setInvoices] = useState<FirestoreInvoice[]>([]);

  useEffect(() => {
    const userEmail = state.user?.email;
    if (!userEmail) return;

    let unsubscribe = () => { };
    if (workspaceType === "brand") {
      unsubscribe = subscribeInvoicesByBrand(userEmail, (list) => setInvoices(list));
    } else {
      unsubscribe = subscribeInvoicesByAgency(userEmail, (list) => setInvoices(list));
    }

    return () => unsubscribe();
  }, [state.user, workspaceType]);

  const handleLogout = () => {
    resetState();
    router.push("/auth/login");
  };

  // ---- Derived data (all real, no mock fallback) ----
  const paidInvoices = invoices.filter((inv) => inv.status === "paid");
  const pendingInvoices = invoices.filter((inv) => inv.status === "pending");

  const totalBilled = invoices.reduce((acc, curr) => acc + curr.amount, 0);
  const totalPaid = paidInvoices.reduce((acc, curr) => acc + curr.amount, 0);
  const totalPending = pendingInvoices.reduce((acc, curr) => acc + curr.amount, 0);

  const talentShare = totalPaid * 0.9 * 0.85;
  const agencyShare = totalPaid * 0.9 * 0.15;
  const platformFee = totalPaid * 0.1;

  const collectionRate = totalBilled > 0 ? (totalPaid / totalBilled) * 100 : 0;

  // Top campaigns by amount, real data only
  const topCampaigns = [...invoices].sort((a, b) => b.amount - a.amount).slice(0, 5);
  const maxCampaignAmount = topCampaigns.length > 0 ? topCampaigns[0].amount : 1;

  // Recent activity feed (real invoices)
  const recentActivity = [...invoices].sort((a, b) => (b.id > a.id ? 1 : -1)).slice(0, 6);

  // Donut segments — grayscale shades only (white, light gray, mid gray)
  const donutSegments = [
    { label: "Talent", value: talentShare, shade: "#FFFFFF" },
    { label: "Agency", value: agencyShare, shade: "#9A9A9A" },
    { label: "Platform Fee", value: platformFee, shade: "#4A4A4A" }
  ];
  const donutTotal = donutSegments.reduce((a, s) => a + s.value, 0) || 1;

  let cumulativeOffset = 0;
  const donutArcs = donutSegments.map((seg) => {
    const pct = (seg.value / donutTotal) * 100;
    const arc = { ...seg, pct, offset: cumulativeOffset };
    cumulativeOffset += pct;
    return arc;
  });

  return (
    <main className="min-h-screen bg-[#000000] text-white flex flex-col font-sans antialiased selection:bg-white selection:text-black relative">
      <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-white/[0.01] rounded-full blur-[100px] pointer-events-none" />

      {/* Header - same shared style as the rest of the app */}
      <header className="border-b border-white/20 bg-black/90 sticky top-0 z-50 shadow-sm backdrop-blur">
        <div className="max-w-[1520px] mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-6">
            <div className="relative flex items-center mr-12">
              <Link href="/branddashboard" className="flex items-center" aria-label="AgncyPay home">
                <img
                  src="/agncypaybrand.png"
                  alt="AgncyPay"
                  className="h-10 w-auto object-contain scale-[1.3] origin-left"
                />
              </Link>
            </div>
            <span className="h-4 w-[1px] bg-white/20 hidden md:block" />
            <div className="hidden md:flex items-center gap-2 px-3 py-1 rounded-full bg-white/[0.03] border border-white/20 text-[11px] font-bold uppercase tracking-wider text-[#A3A3A3]">
              <Building2 className="h-3 w-3 text-white" />
              {workspaceType === "brand" ? "Brand Portal" : "Agency Portal"}
            </div>
          </div>

          <nav className="hidden lg:flex items-center gap-1 bg-white/[0.03] p-1 rounded-full border border-white/20">
            <button
              onClick={() => router.push("/branddashboard")}
              className="px-4 py-1.5 rounded-full text-xs font-semibold text-[#8f8f8f] hover:text-white transition-all cursor-pointer"
            >
              Home
            </button>
            <button
              onClick={() => router.push("/branddashboard/invoices")}
              className="px-4 py-1.5 rounded-full text-xs font-semibold text-[#8f8f8f] hover:text-white transition-all cursor-pointer"
            >
              {workspaceType === "brand" ? "Invoice Queue" : "Sent Invoices"}
            </button>
            <button
              onClick={() => router.push("/branddashboard/settlement")}
              className="px-4 py-1.5 rounded-full text-xs font-semibold text-[#8f8f8f] hover:text-white transition-all cursor-pointer"
            >
              {workspaceType === "brand" ? "Settlement Nodes" : "Payout Split Nodes"}
            </button>
            <button
              onClick={() => router.push("/branddashboard/analytics")}
              className="px-4 py-1.5 rounded-full text-xs font-semibold bg-white text-black shadow-sm transition-all cursor-pointer"
            >
              {workspaceType === "brand" ? "Analytics" : "Agency Earnings"}
            </button>
          </nav>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-full bg-white/[0.05] border border-white/20 flex items-center justify-center font-bold text-xs text-white">
                {state.user?.fullName
                  ? state.user.fullName.split(" ").map((n: string) => n[0]).join("").toUpperCase().slice(0, 2)
                  : "AD"}
              </div>
              <span className="text-xs font-bold text-[#E5E5EA] hidden sm:inline">
                {state.workspaces.find((w) => w.id === state.activeWorkspaceId)?.name ||
                  state.user?.fullName ||
                  "Adidas Corporate"}
              </span>
            </div>
            <button
              onClick={handleLogout}
              className="p-2 text-neutral-400 hover:text-white transition-colors"
              title="Log Out"
            >
              <LogOut className="h-4 w-4" />
            </button>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="bg-[#000000] border-b border-white/20 py-6 shadow-sm">
        <div className="max-w-[1520px] mx-auto px-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-white bg-white/10 border border-white/20 px-2 py-0.5 rounded flex items-center gap-1">
                <Sparkles className="h-3 w-3" />
                Live Insights
              </span>
              <span className="text-xs text-neutral-400 font-mono">{invoices.length} tracked invoices</span>
            </div>
            <h1 className="text-2xl font-bold text-white mt-1 tracking-tight">
              {workspaceType === "brand" ? "Brand Performance Analytics" : "Agency Revenue Analytics"}
            </h1>
            <p className="text-xs text-neutral-400 mt-1 max-w-xl">
              {workspaceType === "brand"
                ? "Real-time visibility into campaign spend, settlement velocity, and payout distribution."
                : "Track commission performance, campaign throughput, and represented-talent payout distribution."}
            </p>
          </div>
        </div>
      </section>

      <div className="max-w-[1520px] w-full mx-auto px-6 py-8 flex-1 flex flex-col gap-6">
        {/* KPI Row */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <KpiCard
            icon={<DollarSign className="h-4 w-4 text-neutral-400" />}
            label="Total Billed"
            value={`$${totalBilled.toLocaleString(undefined, { minimumFractionDigits: 2 })}`}
            sub={`${invoices.length} campaigns tracked`}
          />
          <KpiCard
            icon={<TrendingUp className="h-4 w-4 text-neutral-400" />}
            label="Total Settled"
            value={`$${totalPaid.toLocaleString(undefined, { minimumFractionDigits: 2 })}`}
            sub={`${paidInvoices.length} invoices paid`}
          />
          <KpiCard
            icon={<Clock className="h-4 w-4 text-neutral-400" />}
            label="Outstanding"
            value={`$${totalPending.toLocaleString(undefined, { minimumFractionDigits: 2 })}`}
            sub={`${pendingInvoices.length} awaiting settlement`}
          />
          <KpiCard
            icon={<Percent className="h-4 w-4 text-neutral-400" />}
            label="Collection Rate"
            value={`${collectionRate.toFixed(1)}%`}
            sub="Paid vs total billed"
          />
        </div>

        {/* Main grid: campaigns + distribution */}
        <div className="grid grid-cols-1 lg:grid-cols-[1.4fr_1fr] gap-6">
          {/* Top campaigns bar list */}
          <div className="bg-[#050505] rounded-2xl border border-white/20 shadow-sm p-6">
            <div className="flex items-center justify-between pb-4 border-b border-white/10">
              <h3 className="text-xs font-black uppercase tracking-wider text-white flex items-center gap-2">
                <Activity className="h-3.5 w-3.5 text-neutral-400" />
                Top Campaigns by Value
              </h3>
              <span className="text-[10px] text-neutral-500 font-semibold">Top {topCampaigns.length}</span>
            </div>

            <div className="mt-5 space-y-4">
              {topCampaigns.length === 0 ? (
                <EmptyState text="No campaigns yet — create an invoice to see it here." />
              ) : (
                topCampaigns.map((inv, idx) => {
                  const pct = Math.max(6, (inv.amount / maxCampaignAmount) * 100);
                  const isPaid = inv.status === "paid";
                  return (
                    <div key={inv.id} className="group">
                      <div className="flex items-center justify-between mb-1.5">
                        <div className="flex items-center gap-2 min-w-0">
                          <span className="text-[10px] font-black text-neutral-600 w-4 shrink-0">{idx + 1}</span>
                          <span className="text-xs font-bold text-white truncate">{inv.campaign}</span>
                          <span
                            className={`text-[9px] font-bold px-1.5 py-0.5 rounded-full uppercase shrink-0 border ${isPaid
                              ? "bg-white/10 text-white border-white/25"
                              : "bg-white/[0.03] text-neutral-400 border-white/10"
                              }`}
                          >
                            {isPaid ? "Settled" : "Pending"}
                          </span>
                        </div>
                        <span className="text-xs font-black text-white shrink-0 ml-3">
                          ${inv.amount.toLocaleString()}
                        </span>
                      </div>
                      <div className="h-2 w-full bg-white/[0.04] rounded-full overflow-hidden">
                        <div
                          style={{ width: `${pct}%` }}
                          className={`h-full rounded-full transition-all duration-700 ${isPaid ? "bg-white" : "bg-neutral-600"
                            }`}
                        />
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* Payout distribution donut */}
          <div className="bg-[#050505] rounded-2xl border border-white/20 shadow-sm p-6 flex flex-col">
            <h3 className="text-xs font-black uppercase tracking-wider text-white flex items-center gap-2 pb-4 border-b border-white/10">
              <PieChart className="h-3.5 w-3.5 text-neutral-400" />
              Payout Distribution
            </h3>

            <div className="flex-1 flex flex-col items-center justify-center py-6">
              {totalPaid === 0 ? (
                <EmptyState text="No settled volume yet." />
              ) : (
                <>
                  <div className="relative h-40 w-40">
                    <svg viewBox="0 0 36 36" className="w-full h-full -rotate-90">
                      <circle cx="18" cy="18" r="15.5" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="3.4" />
                      {donutArcs.map((arc) => (
                        <circle
                          key={arc.label}
                          cx="18"
                          cy="18"
                          r="15.5"
                          fill="none"
                          stroke={arc.shade}
                          strokeWidth="3.4"
                          strokeDasharray={`${arc.pct} ${100 - arc.pct}`}
                          strokeDashoffset={-arc.offset}
                          strokeLinecap="round"
                        />
                      ))}
                    </svg>
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                      <span className="text-[10px] font-bold text-neutral-500 uppercase">Settled</span>
                      <span className="text-sm font-black text-white">
                        ${totalPaid.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                      </span>
                    </div>
                  </div>

                  <div className="mt-6 w-full space-y-2.5">
                    {donutArcs.map((arc) => (
                      <div key={arc.label} className="flex items-center justify-between text-xs">
                        <div className="flex items-center gap-2">
                          <span
                            className="h-2.5 w-2.5 rounded-full border border-white/20"
                            style={{ backgroundColor: arc.shade }}
                          />
                          <span className="text-neutral-300 font-semibold">{arc.label}</span>
                        </div>
                        <span className="text-white font-bold">
                          ${arc.value.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                        </span>
                      </div>
                    ))}
                  </div>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Recent activity feed */}
        <div className="bg-[#050505] rounded-2xl border border-white/20 shadow-sm p-6">
          <div className="flex items-center justify-between pb-4 border-b border-white/10">
            <h3 className="text-xs font-black uppercase tracking-wider text-white flex items-center gap-2">
              <Wallet className="h-3.5 w-3.5 text-neutral-400" />
              Recent Invoice Activity
            </h3>
            <button
              onClick={() => router.push("/branddashboard/invoices")}
              className="text-[10px] font-bold text-neutral-400 hover:text-white transition-colors flex items-center gap-1"
            >
              View all
              <ChevronRight className="h-3 w-3" />
            </button>
          </div>

          <div className="mt-2 divide-y divide-white/5">
            {recentActivity.length === 0 ? (
              <div className="py-8">
                <EmptyState text="No invoice activity yet." />
              </div>
            ) : (
              recentActivity.map((inv) => {
                const isPaid = inv.status === "paid";
                return (
                  <div key={inv.id} className="flex items-center justify-between py-3.5 gap-4">
                    <div className="flex items-center gap-3 min-w-0">
                      <div
                        className={`h-8 w-8 rounded-lg flex items-center justify-center shrink-0 border ${isPaid ? "bg-white/10 border-white/25 text-white" : "bg-white/[0.02] border-white/10 text-neutral-400"
                          }`}
                      >
                        {isPaid ? <ArrowUpRight className="h-3.5 w-3.5" /> : <Clock className="h-3.5 w-3.5" />}
                      </div>
                      <div className="min-w-0">
                        <p className="text-xs font-bold text-white truncate">{inv.campaign}</p>
                        <p className="text-[10px] text-neutral-500 font-mono mt-0.5">{inv.id}</p>
                      </div>
                    </div>
                    <div className="text-right shrink-0">
                      <p className="text-xs font-black text-white">
                        ${inv.amount.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                      </p>
                      <span className={`text-[9px] font-bold uppercase ${isPaid ? "text-white" : "text-neutral-500"}`}>
                        {isPaid ? "Settled" : "Pending"}
                      </span>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="border-t border-white/20 bg-black py-8 text-xs text-neutral-400 mt-4">
        <div className="max-w-[1520px] mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-3">
            <img src="/agncypaybrand.png" alt="AgncyPay" className="h-8 w-auto filter contrast-125" />
            <p>© 2026 AgncyPay. All rights reserved.</p>
          </div>
          <div className="flex gap-6 font-semibold">
            <a href="#" className="hover:text-white transition-colors">Integration Help</a>
            <a href="#" className="hover:text-white transition-colors">ERP Integration API</a>
            <a href="#" className="hover:text-white transition-colors">Security Rules</a>
          </div>
        </div>
      </footer>
    </main>
  );
}

// --- Small reusable pieces kept in the same file for a single, drop-in replacement ---

function KpiCard({
  icon,
  label,
  value,
  sub
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  sub: string;
}) {
  return (
    <div className="bg-[#050505] rounded-2xl border border-white/20 p-5 shadow-sm">
      <div className="flex justify-between items-start">
        <span className="text-[10px] font-bold text-[#8f8f8f] uppercase tracking-wider">{label}</span>
        {icon}
      </div>
      <p className="text-xl font-black text-white mt-3 tracking-tight">{value}</p>
      <p className="text-[10px] mt-1.5 font-semibold text-neutral-500">{sub}</p>
    </div>
  );
}

function EmptyState({ text }: { text: string }) {
  return (
    <div className="text-center py-4">
      <p className="text-xs text-neutral-500 font-medium">{text}</p>
    </div>
  );
}