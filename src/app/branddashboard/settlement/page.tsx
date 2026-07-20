"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Building2,
  ArrowLeft,
  Coins,
  ShieldCheck,
  CheckCircle2,
  LogOut,
  Sun,
  Moon,
  Loader2,
  Layers,
  ArrowRight,
  Lock,
  Clock
} from "lucide-react";
import { useApp } from "../../../context/AppContext";
import { subscribeInvoicesByBrand, subscribeInvoicesByAgency, updateInvoiceStatus, FirestoreInvoice } from "../../../lib/firebaseInvoices";

export default function NodesDashboardPage() {
  const router = useRouter();
  const { state, resetState } = useApp();
  const workspaceType = state.user ? state.user.accountType : "brand";

  const [isLightTheme, setIsLightTheme] = useState(false);
  const [invoices, setInvoices] = useState<FirestoreInvoice[]>([]);
  const [processingId, setProcessingId] = useState<string | null>(null);

  useEffect(() => {
    if (typeof window !== "undefined") {
      setIsLightTheme(document.documentElement.classList.contains("light"));
    }
  }, []);

  const toggleTheme = () => {
    if (typeof window !== "undefined") {
      const isLight = document.documentElement.classList.toggle("light");
      setIsLightTheme(isLight);
      localStorage.setItem("agncypay_theme", isLight ? "light" : "dark");
    }
  };

  useEffect(() => {
    const userEmail = state.user?.email;
    if (!userEmail) return;

    let unsubscribe = () => { };
    if (workspaceType === "brand") {
      unsubscribe = subscribeInvoicesByBrand(userEmail, (list) => {
        setInvoices(list);
      });
    } else {
      unsubscribe = subscribeInvoicesByAgency(userEmail, (list) => {
        setInvoices(list);
      });
    }

    return () => unsubscribe();
  }, [state.user, workspaceType]);

  const handleLogout = () => {
    resetState();
    router.push("/auth/login");
  };

  const handleDisburse = async (invoiceId: string) => {
    setProcessingId(invoiceId);
    try {
      await updateInvoiceStatus(invoiceId, "paid", "disbursed");
    } catch (err) {
      console.error("Disbursement failed:", err);
    } finally {
      setProcessingId(null);
    }
  };

  // ---- Derived data (all real Firestore data, no mock values) ----
  const paidInvoices = invoices.filter((inv) => inv.status === "paid");
  const pendingInvoices = invoices.filter((inv) => inv.status === "pending");

  const escrowBalance = paidInvoices
    .filter((inv) => inv.talentPayoutStatus !== "disbursed")
    .reduce((acc, curr) => acc + curr.amount, 0);

  const totalDisbursed = paidInvoices
    .filter((inv) => inv.talentPayoutStatus === "disbursed")
    .reduce((acc, curr) => acc + curr.amount, 0);

  const pendingVolume = pendingInvoices.reduce((acc, curr) => acc + curr.amount, 0);

  const disbursedCount = paidInvoices.filter((inv) => inv.talentPayoutStatus === "disbursed").length;
  const escrowCount = paidInvoices.filter((inv) => inv.talentPayoutStatus !== "disbursed").length;

  return (
    <main className="min-h-screen bg-background text-foreground flex flex-col font-sans antialiased relative transition-colors duration-200 pb-12">
      <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-white/[0.01] rounded-full blur-[100px] pointer-events-none" />

      {/* Header */}
      <header className="border-b border-border-custom bg-background/90 sticky top-0 z-50 shadow-sm backdrop-blur">
        <div className="max-w-[1520px] mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-6">
            <div className="relative flex items-center mr-12">
              <Link href="/branddashboard" className="flex items-center cursor-pointer z-50 hover:opacity-80 transition-opacity">
                <img
                  src="/agncypaybrand.png"
                  alt="AgncyPay"
                  className="h-10 w-auto object-contain scale-[1.3] origin-left"
                />
              </Link>
              {(workspaceType === "brand" || workspaceType === "agency") && (
                <span className="absolute -top-1.5 -right-4 translate-x-full rounded-full bg-white/[0.08] border border-white/[0.15] px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider text-[#A3A3A3]">
                  {workspaceType === "brand" ? "Brand" : "Agency"}
                </span>
              )}
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
              className="px-4 py-1.5 rounded-full text-xs font-semibold bg-white text-black shadow-sm transition-all cursor-pointer"
            >
              {workspaceType === "brand" ? "Settlement Nodes" : "Payout Split Nodes"}
            </button>
            <button
              onClick={() => router.push("/branddashboard/analytics")}
              className="px-4 py-1.5 rounded-full text-xs font-semibold text-[#8f8f8f] hover:text-white transition-all cursor-pointer"
            >
              {workspaceType === "brand" ? "Analytics" : "Agency Earnings"}
            </button>
          </nav>

          <div className="flex items-center gap-3">
            {workspaceType === "agency" && (
              <>
                <button
                  onClick={() => router.push("/dashboard")}
                  className="text-xs font-semibold text-[#8f8f8f] hover:text-white transition-colors flex items-center gap-1"
                >
                  <ArrowLeft className="h-3.5 w-3.5" />
                  Talent View
                </button>
                <div className="h-4 w-[1px] bg-white/20" />
              </>
            )}
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
              onClick={toggleTheme}
              className="p-2 text-neutral-400 hover:text-white transition-colors cursor-pointer mr-1"
              title="Toggle Theme"
            >
              {isLightTheme ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />}
            </button>
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

      {/* Main Container */}
      <div className="max-w-[1520px] w-full mx-auto px-6 py-8 flex-1 flex flex-col gap-6">
        {/* Navigation Breadcrumb */}
        <div className="flex items-center gap-2">
          <Link
            href="/branddashboard"
            className="p-2 rounded-lg border border-white/20 hover:border-white/20 hover:bg-white/[0.02] text-xs font-bold text-[#8f8f8f] hover:text-white transition-all flex items-center gap-1.5 shrink-0"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Dashboard
          </Link>
          <span className="text-xs text-neutral-500">/</span>
          <span className="text-xs text-neutral-300 font-semibold">
            {workspaceType === "brand" ? "Settlement Nodes" : "Payout Split Nodes"}
          </span>
        </div>

        {/* Hero title block */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">
              {workspaceType === "brand" ? "Brand Settlement Ledger" : "Agency Payout Routing Center"}
            </h1>
            <p className="text-xs text-[#8f8f8f] mt-1">
              {workspaceType === "brand"
                ? "Monitor active escrow reserves, immediate Net-0 auto-split savings, and settlement node networks."
                : "Manage campaign split disbursements, representing agency commissions, and release talent payouts."}
            </p>
          </div>
        </div>

        {/* Cards Grid — monochrome */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          <div className="bg-[#050505] rounded-2xl border border-white/20 p-6 flex flex-col justify-between shadow-sm">
            <div>
              <div className="flex justify-between items-center text-[#8f8f8f]">
                <span className="text-xs font-bold uppercase tracking-wider">
                  {workspaceType === "brand" ? "Escrow Reserves" : "Awaiting Payout"}
                </span>
                <Coins className="h-4 w-4" />
              </div>
              <h2 className="text-[32px] font-black text-white mt-4">
                ${escrowBalance.toLocaleString("en-US", { minimumFractionDigits: 2 })}
              </h2>
            </div>
            <p className="text-[11px] text-[#8f8f8f] mt-4">
              {workspaceType === "brand"
                ? "Funds settled by payer held securely awaiting split release."
                : "Aggregated represented talent balances awaiting agency disbursement."}
            </p>
          </div>

          <div className="bg-[#050505] rounded-2xl border border-white/20 p-6 flex flex-col justify-between shadow-sm">
            <div>
              <div className="flex justify-between items-center text-[#8f8f8f]">
                <span className="text-xs font-bold uppercase tracking-wider">
                  {workspaceType === "brand" ? "Pending Invoices" : "Agency Commission Cut"}
                </span>
                <Layers className="h-4 w-4" />
              </div>
              <h2 className="text-[32px] font-black text-white mt-4">
                {workspaceType === "brand"
                  ? `$${pendingVolume.toLocaleString("en-US", { minimumFractionDigits: 2 })}`
                  : `$${(totalDisbursed * 0.15).toLocaleString("en-US", { minimumFractionDigits: 2 })}`}
              </h2>
            </div>
            <p className="text-[11px] text-[#8f8f8f] mt-4">
              {workspaceType === "brand"
                ? "Revenues waiting for brand approval and settlement."
                : "Accrued 15% agency cut from successfully settled campaign nodes."}
            </p>
          </div>

          <div className="bg-[#050505] rounded-2xl border border-white/20 p-6 flex flex-col justify-between shadow-sm">
            <div>
              <div className="flex justify-between items-center text-[#8f8f8f]">
                <span className="text-xs font-bold uppercase tracking-wider">Disbursed Volume</span>
                <CheckCircle2 className="h-4 w-4 text-white" />
              </div>
              <h2 className="text-[32px] font-black text-white mt-4">
                ${totalDisbursed.toLocaleString("en-US", { minimumFractionDigits: 2 })}
              </h2>
            </div>
            <p className="text-[11px] text-[#8f8f8f] mt-4">Released and routed instantly to creative wallets.</p>
          </div>
        </div>

        {/* Main Content Layout: table + summary panel (replaces decorative map) */}
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-6 items-start">
          {/* Table Container */}
          <div className="bg-[#050505] rounded-2xl border border-white/10 overflow-hidden shadow-sm">
            <div className="p-5 border-b border-white/10 flex justify-between items-center">
              <h3 className="text-xs font-black uppercase tracking-wider text-white">
                {workspaceType === "brand" ? "Settled Campaigns & Auto-Splits" : "Represented Talent Splits Queue"}
              </h3>
              <span className="text-[10px] text-neutral-500 font-semibold">{paidInvoices.length} records</span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-white/10 text-neutral-400 font-bold bg-white/[0.01]">
                    <th className="p-4">Invoice / Campaign</th>
                    <th className="p-4">Payer</th>
                    <th className="p-4">Split Pool</th>
                    <th className="p-4 text-right">Net Payout</th>
                    <th className="p-4 text-right">Action / Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/10">
                  {paidInvoices.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="p-8 text-center text-neutral-500 font-medium">
                        No settled campaign nodes found in the database.
                      </td>
                    </tr>
                  ) : (
                    paidInvoices.map((inv) => {
                      const netTalentShare = inv.amount * 0.9 * 0.85;
                      const agencyCut = inv.amount * 0.9 * 0.15;
                      const isDisbursed = inv.talentPayoutStatus === "disbursed";

                      return (
                        <tr key={inv.id} className="hover:bg-white/[0.01] transition-all">
                          <td className="p-4">
                            <div className="font-bold text-white">{inv.campaign}</div>
                            <div className="text-[10px] text-neutral-500 font-semibold mt-0.5">{inv.id}</div>
                          </td>
                          <td className="p-4">
                            <div className="font-semibold text-white">{inv.brandName}</div>
                            <div className="text-[10px] text-neutral-500 mt-0.5">{inv.brandEmail}</div>
                          </td>
                          <td className="p-4">
                            <div className="text-white">
                              Agency Cut (15%): <span className="font-bold">${agencyCut.toLocaleString()}</span>
                            </div>
                            <div className="text-[10px] text-neutral-500 mt-0.5">
                              Talent Cut (85%): ${netTalentShare.toLocaleString()}
                            </div>
                          </td>
                          <td className="p-4 text-right font-black text-white">
                            ${inv.amount.toLocaleString("en-US", { minimumFractionDigits: 2 })}
                          </td>
                          <td className="p-4 text-right">
                            {workspaceType === "agency" ? (
                              isDisbursed ? (
                                <span className="inline-flex items-center gap-1 text-[10px] font-bold text-white bg-white/10 border border-white/25 px-2 py-1 rounded-md">
                                  <CheckCircle2 className="h-3 w-3" />
                                  Disbursed
                                </span>
                              ) : (
                                <button
                                  onClick={() => handleDisburse(inv.id)}
                                  disabled={processingId === inv.id}
                                  className="bg-white text-black font-semibold text-[11px] px-3 py-1.5 rounded-lg shadow cursor-pointer hover:bg-neutral-200 transition-all inline-flex items-center gap-1.5 disabled:opacity-50"
                                >
                                  {processingId === inv.id ? (
                                    <>
                                      <Loader2 className="h-3 w-3 animate-spin" />
                                      Routing...
                                    </>
                                  ) : (
                                    <>
                                      Disburse splits
                                      <ArrowRight className="h-3 w-3" />
                                    </>
                                  )}
                                </button>
                              )
                            ) : (
                              <span
                                className={`inline-flex items-center gap-1 text-[10px] font-bold px-2 py-1 rounded-md border ${isDisbursed
                                  ? "text-white bg-white/10 border-white/25"
                                  : "text-neutral-400 bg-white/[0.02] border-white/10"
                                  }`}
                              >
                                {isDisbursed ? "Fully Routed" : "Escrow Lock"}
                              </span>
                            )}
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Summary panel — replaces decorative map with real status breakdown */}
          <div className="bg-[#050505] rounded-2xl border border-white/20 p-5 shadow-sm">
            <h3 className="text-xs font-black uppercase tracking-wider text-[#8f8f8f] pb-3 border-b border-white/20">
              Settlement Status
            </h3>

            <div className="mt-4 space-y-3">
              <div className="flex items-center justify-between p-3 rounded-xl bg-white/[0.02] border border-white/10">
                <div className="flex items-center gap-2">
                  <div className="h-8 w-8 rounded-lg bg-white/10 border border-white/20 flex items-center justify-center">
                    <Lock className="h-3.5 w-3.5 text-white" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-white">In Escrow</p>
                    <p className="text-[10px] text-neutral-500">{escrowCount} campaign{escrowCount !== 1 ? "s" : ""}</p>
                  </div>
                </div>
                <span className="text-xs font-black text-white">
                  ${escrowBalance.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                </span>
              </div>

              <div className="flex items-center justify-between p-3 rounded-xl bg-white/[0.02] border border-white/10">
                <div className="flex items-center gap-2">
                  <div className="h-8 w-8 rounded-lg bg-white/10 border border-white/20 flex items-center justify-center">
                    <CheckCircle2 className="h-3.5 w-3.5 text-white" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-white">Fully Disbursed</p>
                    <p className="text-[10px] text-neutral-500">{disbursedCount} campaign{disbursedCount !== 1 ? "s" : ""}</p>
                  </div>
                </div>
                <span className="text-xs font-black text-white">
                  ${totalDisbursed.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                </span>
              </div>

              <div className="flex items-center justify-between p-3 rounded-xl bg-white/[0.02] border border-white/10">
                <div className="flex items-center gap-2">
                  <div className="h-8 w-8 rounded-lg bg-white/10 border border-white/20 flex items-center justify-center">
                    <Clock className="h-3.5 w-3.5 text-white" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-white">Awaiting Approval</p>
                    <p className="text-[10px] text-neutral-500">
                      {pendingInvoices.length} invoice{pendingInvoices.length !== 1 ? "s" : ""}
                    </p>
                  </div>
                </div>
                <span className="text-xs font-black text-white">
                  ${pendingVolume.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                </span>
              </div>
            </div>

            <div className="mt-5 pt-4 border-t border-white/20 space-y-2 text-xs">
              <div className="flex justify-between items-center text-[#8f8f8f]">
                <span>Routing Status</span>
                <span className="font-bold text-white flex items-center gap-1">
                  <ShieldCheck className="h-3.5 w-3.5" />
                  Secure (TLS)
                </span>
              </div>
              <div className="flex justify-between items-center text-[#8f8f8f]">
                <span>Total Records</span>
                <span className="font-mono text-[10px] bg-white/[0.03] px-2 py-0.5 rounded border border-white/10 text-neutral-300">
                  {invoices.length}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}