"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Building2,
  ArrowLeft,
  Coins,
  MapPin,
  ArrowUpRight,
  ShieldCheck,
  CheckCircle2,
  HelpCircle,
  LogOut,
  Sun,
  Moon,
  Loader2,
  Layers,
  ArrowRight
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

    let unsubscribe = () => {};
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
      // Release payout splits (status remains paid, talent payout status becomes disbursed)
      await updateInvoiceStatus(invoiceId, "paid", "disbursed");
    } catch (err) {
      console.error("Disbursement failed:", err);
    } finally {
      setProcessingId(null);
    }
  };

  // Calculations derived from database invoices
  const paidInvoices = invoices.filter(inv => inv.status === "paid");
  const pendingInvoices = invoices.filter(inv => inv.status === "pending");

  // Escrow Balance = Sum of net splits for PAID invoices which are NOT YET disbursed
  const escrowBalance = paidInvoices
    .filter(inv => inv.talentPayoutStatus !== "disbursed")
    .reduce((acc, curr) => acc + curr.amount, 0);

  // Total Disbursed Volume = Sum of paid invoices where payouts are completed
  const totalDisbursed = paidInvoices
    .filter(inv => inv.talentPayoutStatus === "disbursed")
    .reduce((acc, curr) => acc + curr.amount, 0);

  // Pending approval volume = Sum of pending invoices
  const pendingVolume = pendingInvoices.reduce((acc, curr) => acc + curr.amount, 0);

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
              onClick={() => router.push("/branddashboard/nodes")}
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
                {state.user?.fullName ? state.user.fullName.split(" ").map((n: string) => n[0]).join("").toUpperCase().slice(0, 2) : "AD"}
              </div>
              <span className="text-xs font-bold text-[#E5E5EA] hidden sm:inline">
                {state.workspaces.find(w => w.id === state.activeWorkspaceId)?.name || state.user?.fullName || "Adidas Corporate"}
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

        {/* Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          <div className="glass-panel rounded-2xl p-6 flex flex-col justify-between">
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

          <div className="glass-panel rounded-2xl p-6 flex flex-col justify-between">
            <div>
              <div className="flex justify-between items-center text-[#8f8f8f]">
                <span className="text-xs font-bold uppercase tracking-wider">
                  {workspaceType === "brand" ? "Pending Invoices" : "Agency Commission cut"}
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

          <div className="glass-panel rounded-2xl p-6 flex flex-col justify-between">
            <div>
              <div className="flex justify-between items-center text-[#8f8f8f]">
                <span className="text-xs font-bold uppercase tracking-wider">Disbursed Volume</span>
                <CheckCircle2 className="h-4 w-4 text-emerald-500" />
              </div>
              <h2 className="text-[32px] font-black text-white mt-4">
                ${totalDisbursed.toLocaleString("en-US", { minimumFractionDigits: 2 })}
              </h2>
            </div>
            <p className="text-[11px] text-[#8f8f8f] mt-4">
              Released and routed instantly to creative wallets.
            </p>
          </div>
        </div>

        {/* Main Content Layout with Interactive Map */}
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_360px] gap-6 items-start">
          
          {/* Table Container */}
          <div className="glass-panel rounded-2xl border border-white/10 overflow-hidden">
            <div className="p-5 border-b border-white/10 flex justify-between items-center">
              <h3 className="text-xs font-black uppercase tracking-wider text-white">
                {workspaceType === "brand" ? "Settled Campaigns & Auto-Splits" : " represented Talent Splits Queue"}
              </h3>
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
                            <div className="text-white">Agency Cut (15%): <span className="font-bold">${agencyCut.toLocaleString()}</span></div>
                            <div className="text-[10px] text-neutral-500 mt-0.5">Talent Cut (85%): ${netTalentShare.toLocaleString()}</div>
                          </td>
                          <td className="p-4 text-right font-black text-white">
                            ${inv.amount.toLocaleString("en-US", { minimumFractionDigits: 2 })}
                          </td>
                          <td className="p-4 text-right">
                            {workspaceType === "agency" ? (
                              isDisbursed ? (
                                <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-400 bg-emerald-950/40 border border-emerald-900 px-2 py-1 rounded-md">
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
                                      <Loader2 className="h-3 w-3 animate-spin animate-infinite" />
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
                              <span className={`inline-flex items-center gap-1 text-[10px] font-bold px-2 py-1 rounded-md ${
                                isDisbursed 
                                  ? "text-emerald-400 bg-emerald-950/40 border border-emerald-900" 
                                  : "text-amber-400 bg-amber-950/40 border border-amber-900"
                              }`}>
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

          {/* Map Section */}
          <div className="bg-[#050505] rounded-2xl border border-white/20 p-5 shadow-sm">
            <h3 className="text-xs font-black uppercase tracking-wider text-[#8f8f8f] pb-3 border-b border-white/20">
              Creative Node Network
            </h3>

            {/* Map representation */}
            <div className="mt-4 h-48 rounded-xl border border-white/20 bg-black relative overflow-hidden flex flex-col justify-end p-4 shadow-inner">
              {/* Dot grid back */}
              <div className="absolute inset-0 bg-[radial-gradient(rgba(255,255,255,0.05)_1px,transparent_1px)] [background-size:16px_16px] opacity-70" />

              {/* Glowing active node lines */}
              <svg className="absolute inset-0 h-full w-full pointer-events-none" xmlns="http://www.w3.org/2000/svg">
                <path d="M 50 50 L 150 100 L 250 60" fill="none" stroke="#ffffff" strokeWidth="1.5" strokeDasharray="4 4" className="animate-[dash_10s_linear_infinite]" />
                <path d="M 150 100 L 80 150" fill="none" stroke="#ffffff" strokeWidth="1.5" strokeDasharray="4 4" className="animate-[dash_8s_linear_infinite]" />
              </svg>

              {/* Nodes */}
              <div className="absolute top-10 left-12 flex flex-col items-center">
                <div className="h-6 w-6 rounded-full bg-neutral-800 border-2 border-white flex items-center justify-center text-[8px] font-black text-white shadow">
                  NY
                </div>
                <span className="text-[8px] font-bold text-[#8f8f8f] mt-1">Brand Node</span>
              </div>

              <div className="absolute top-20 right-16 flex flex-col items-center">
                <div className="h-6 w-6 rounded-full bg-neutral-800 border-2 border-white flex items-center justify-center text-[8px] font-black text-white shadow">
                  LDN
                </div>
                <span className="text-[8px] font-bold text-[#8f8f8f] mt-1">Talent Node</span>
              </div>

              <div className="absolute bottom-10 left-16 flex flex-col items-center">
                <div className="h-6 w-6 rounded-full bg-neutral-800 border-2 border-white flex items-center justify-center text-[8px] font-black text-white shadow">
                  PAR
                </div>
                <span className="text-[8px] font-bold text-[#8f8f8f] mt-1">Agency Node</span>
              </div>

              {/* Map Button indicator */}
              <div className="relative z-10 bg-[#0A0A0A] border border-white/20 rounded-lg p-2.5 shadow-sm text-[11px]">
                <div className="flex justify-between items-center">
                  <span className="font-bold text-white flex items-center gap-1.5">
                    <MapPin className="h-3.5 w-3.5 text-white" />
                    3 Active Nodes Connected
                  </span>
                  <ArrowUpRight className="h-3.5 w-3.5 text-neutral-400" />
                </div>
              </div>
            </div>

            {/* General Info list */}
            <div className="mt-4 space-y-2 text-xs">
              <div className="flex justify-between items-center text-[#8f8f8f]">
                <span>Routing Status</span>
                <span className="font-bold text-emerald-400 flex items-center gap-1">
                  <ShieldCheck className="h-3.5 w-3.5" />
                  Secure (TLS)
                </span>
              </div>
              <div className="flex justify-between items-center text-[#8f8f8f]">
                <span>Escrow Address</span>
                <span className="font-mono text-[9px] bg-white/[0.03] px-2 py-0.5 rounded border border-white/10 text-neutral-300">
                  0x978F...4BA2
                </span>
              </div>
            </div>
          </div>

        </div>

      </div>
    </main>
  );
}
