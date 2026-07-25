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
  ArrowRight,
  RefreshCw,
  Sparkles,
  Landmark
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
      const savedTheme = localStorage.getItem("agncypay_theme_agency");
      if (savedTheme) {
        if (savedTheme === "light") {
          document.documentElement.classList.add("light");
          document.documentElement.classList.remove("dark");
          setIsLightTheme(true);
        } else {
          document.documentElement.classList.add("dark");
          document.documentElement.classList.remove("light");
          setIsLightTheme(false);
        }
      } else {
        if (true) {
          document.documentElement.classList.add("light");
          document.documentElement.classList.remove("dark");
          setIsLightTheme(true);
        } else {
          document.documentElement.classList.add("dark");
          document.documentElement.classList.remove("light");
          setIsLightTheme(false);
        }
      }
    }
  }, []);

  const toggleTheme = () => {
    if (typeof window !== "undefined") {
      const isLight = document.documentElement.classList.toggle("light");
      if (isLight) {
        document.documentElement.classList.remove("dark");
      } else {
        document.documentElement.classList.add("dark");
      }
      setIsLightTheme(isLight);
      localStorage.setItem("agncypay_theme_agency", isLight ? "light" : "dark");
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
              <Link href="/agencydashboard" className="flex items-center cursor-pointer z-50 hover:opacity-80 transition-opacity">
                <img
                  src="/agncypaybrand.png"
                  alt="AgncyPay"
                  className="h-12 w-auto object-contain scale-[1.56] origin-left transition-transform"
                />
              </Link>
            </div>
            <span className="h-4 w-[1px] bg-white/20 hidden md:block" />
            <div className="hidden md:flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 light:bg-black/5 border border-white/20 light:border-black/10 text-[11px] font-bold uppercase tracking-wider text-white light:text-[#0F172A]">
              <Landmark className="h-3 w-3 text-white light:text-[#0F172A]" />
              {workspaceType === "brand" ? "Brand Banking" : "Agency Banking"}
            </div>
          </div>

          <nav className="hidden lg:flex items-center gap-1 bg-white/[0.03] p-1 rounded-full border border-white/20">
            <button 
              onClick={() => router.push("/agencydashboard/agencybanking")}
              className="px-4 py-1.5 rounded-full text-xs font-semibold text-[#8f8f8f] light:text-[#475569] hover:text-white light:hover:text-[#0F172A] transition-all cursor-pointer"
            >
              Agency Banking
            </button>
            <button 
              onClick={() => router.push("/agencydashboard/nodes")}
              className="px-4 py-1.5 rounded-full text-xs font-bold bg-white light:bg-[#0F172A] text-black light:text-white shadow-sm border border-white/20 light:border-black/10 transition-all cursor-pointer"
            >
              {workspaceType === "brand" ? "Settlement Nodes" : "Payout Split Nodes"}
            </button>
            <button 
              onClick={() => router.push("/agencydashboard/analytics")}
              className="px-4 py-1.5 rounded-full text-xs font-semibold text-[#8f8f8f] light:text-[#475569] hover:text-white light:hover:text-[#0F172A] transition-all cursor-pointer"
            >
              {workspaceType === "brand" ? "Analytics" : "Agency Earnings"}
            </button>
          </nav>

          <div className="flex items-center gap-3">
            {workspaceType === "agency" && (
              <>
                <button
                  onClick={() => router.push("/agencydashboard")}
                  className="px-3.5 py-1.5 rounded-full text-xs font-bold bg-white light:bg-[#0F172A] text-black light:text-white hover:bg-neutral-200 light:hover:bg-[#1E293B] border border-white/20 light:border-black/10 shadow-sm transition-all flex items-center gap-1.5 cursor-pointer"
                >
                  <Building2 className="h-3.5 w-3.5" />
                  Switch to Agency Portal
                </button>
                <div className="h-4 w-[1px] bg-white/20" />
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
              <span className={`text-xs font-bold ${isLightTheme ? "text-[#0F172A]" : "text-[#E5E5EA]"} hidden sm:inline`}>
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
            href="/agencydashboard"
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

        {/* Main Content Layout */}
        <div className="w-full">
          
          {/* Table Container */}
          <div className="glass-panel rounded-2xl border border-white/10 overflow-hidden">
            <div className="p-5 border-b border-white/10 flex justify-between items-center">
              <h3 className="text-xs font-black uppercase tracking-wider text-white light:text-[#0F172A]">
                {workspaceType === "brand" ? "Settled Campaigns & Auto-Splits" : "Represented Talent Splits Queue"}
              </h3>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-white/10 text-neutral-400 light:text-[#475569] font-bold bg-white/[0.01]">
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
                      <td colSpan={5} className="p-8 text-center text-neutral-500 light:text-[#475569] font-medium">
                        No settled campaign nodes found in the database.
                      </td>
                    </tr>
                  ) : (
                    paidInvoices.map((inv) => {
                      const netTalentShare = inv.amount * 0.9 * 0.85;
                      const agencyCut = inv.amount * 0.9 * 0.15;
                      const isDisbursed = inv.talentPayoutStatus === "disbursed";

                      return (
                        <tr key={inv.id} className="hover:bg-white/[0.01] light:hover:bg-black/[0.02] transition-all">
                          <td className="p-4">
                            <div className="font-bold text-white light:text-[#0F172A]">{inv.campaign}</div>
                            <div className="text-[10px] text-neutral-500 light:text-[#475569] font-semibold mt-0.5">{inv.id}</div>
                          </td>
                          <td className="p-4">
                            <div className="font-semibold text-white light:text-[#0F172A]">{inv.brandName}</div>
                            <div className="text-[10px] text-neutral-500 light:text-[#475569] mt-0.5">{inv.brandEmail}</div>
                          </td>
                          <td className="p-4">
                            <div className="text-white light:text-[#0F172A]">Agency Cut (15%): <span className="font-bold">${agencyCut.toLocaleString()}</span></div>
                            <div className="text-[10px] text-neutral-500 light:text-[#475569] mt-0.5">Talent Cut (85%): ${netTalentShare.toLocaleString()}</div>
                          </td>
                          <td className="p-4 text-right font-black text-white light:text-[#0F172A]">
                            ${inv.amount.toLocaleString("en-US", { minimumFractionDigits: 2 })}
                          </td>
                          <td className="p-4 text-right">
                            {workspaceType === "agency" ? (
                              isDisbursed ? (
                                <span className="inline-flex items-center gap-1 text-[10px] font-bold text-[#70ff9e] bg-[#082315] border border-[#10b95f]/30 px-2.5 py-1 rounded-full shadow-sm">
                                  <CheckCircle2 className="h-3 w-3 text-[#70ff9e]" />
                                  Disbursed
                                </span>
                              ) : (
                                <button
                                  onClick={() => handleDisburse(inv.id)}
                                  disabled={processingId === inv.id}
                                  className="bg-white light:bg-[#0F172A] text-black light:text-white font-semibold text-[11px] px-3 py-1.5 rounded-lg shadow cursor-pointer hover:bg-neutral-200 light:hover:bg-[#1E293B] transition-all inline-flex items-center gap-1.5 disabled:opacity-50"
                                >
                                  {processingId === inv.id ? (
                                    <>
                                      <RefreshCw className="h-3 w-3 animate-spin" />
                                      Routing...
                                    </>
                                  ) : (
                                    <>
                                      <Sparkles className="h-3 w-3" />
                                      Disburse Talent
                                    </>
                                  )}
                                </button>
                              )
                            ) : (
                              <span className={`inline-flex items-center gap-1 text-[10px] font-bold px-2.5 py-1 rounded-full border ${
                                isDisbursed 
                                  ? "text-[#70ff9e] bg-[#082315] border-[#10b95f]/30" 
                                  : "text-amber-400 bg-amber-950/40 border-amber-900"
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
        </div>

      </div>
    </main>
  );
}
