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
  Wallet,
  Award,
  Gift,
  Zap,
  TrendingUp,
  DollarSign,
  Sparkles,
  ChevronRight,
  Briefcase
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
      const savedTheme = localStorage.getItem("agncypay_theme_brand");
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
      localStorage.setItem("agncypay_theme_brand", isLight ? "light" : "dark");
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
      {/* Header */}
      <header className="border-b border-white/25 light:border-black/15 bg-background/90 sticky top-0 z-50 shadow-sm backdrop-blur">
        <div className="max-w-[1520px] mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-6">
            <div className="relative flex items-center mr-12">
              <Link href="/branddashboard" className="flex items-center cursor-pointer z-50 hover:opacity-80 transition-opacity">
                <img
                  src="/agncypaybrand.png"
                  alt="AgncyPay"
                  className="h-12 w-auto object-contain scale-[1.56] origin-left transition-transform"
                />
              </Link>
            </div>
            <span className="h-4 w-[1px] bg-white/20 hidden md:block" />
            <div className="hidden md:flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 light:bg-black/5 border border-white/20 light:border-black/10 text-[11px] font-bold uppercase tracking-wider text-white light:text-[#0F172A]">
              <Building2 className="h-3 w-3 text-white light:text-[#0F172A]" />
              Brand Portal
            </div>
          </div>

          <nav className="hidden lg:flex items-center gap-1 bg-white/[0.03] p-1 rounded-full border border-white/20">
            <button 
              onClick={() => router.push("/branddashboard")}
              className="px-4 py-1.5 rounded-full text-xs font-semibold text-[#8f8f8f] light:text-[#475569] hover:text-white light:hover:text-[#0F172A] transition-all cursor-pointer"
            >
              Home
            </button>
            <button 
              onClick={() => router.push("/branddashboard/invoices")}
              className="px-4 py-1.5 rounded-full text-xs font-semibold text-[#8f8f8f] light:text-[#475569] hover:text-white light:hover:text-[#0F172A] transition-all cursor-pointer"
            >
              Invoice Queue
            </button>
            <button 
              onClick={() => router.push("/branddashboard/nodes")}
              className="px-4 py-1.5 rounded-full text-xs font-bold bg-white light:bg-[#0F172A] text-black light:text-white shadow-sm border border-white/20 light:border-black/10 transition-all cursor-pointer"
            >
              Rewards
            </button>
            <button 
              onClick={() => router.push("/branddashboard/wallet")}
              className="px-4 py-1.5 rounded-full text-xs font-semibold text-[#8f8f8f] light:text-[#475569] hover:text-white light:hover:text-[#0F172A] transition-all cursor-pointer flex items-center gap-1.5"
            >
              <Wallet className="w-3.5 h-3.5" />
              Wallet
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
            {workspaceType === "brand" ? "Rewards" : "Payout Split Nodes"}
          </span>
        </div>

        {/* Hero title block */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">
              {workspaceType === "brand" ? "Brand Commercial Rewards Hub" : "Agency Payout Routing Center"}
            </h1>
            <p className="text-xs text-[#8f8f8f] mt-1">
              {workspaceType === "brand" 
                ? "Earn and manage AgncyPay Points as a creative economy Payor when settling agency retainers, CRM invoices, and campaign milestones."
                : "Manage campaign split disbursements, representing agency commissions, and release talent payouts."}
            </p>
          </div>
        </div>

        {/* Main Content Area - Conditional by Workspace Type */}
        {workspaceType === "brand" ? (
          <div className="space-y-8">
            {/* Section 1: Executive Points Balance & Platinum Tier Card */}
            <div className={`rounded-3xl border p-8 shadow-2xl transition-all relative overflow-hidden ${isLightTheme ? "bg-white border-slate-200" : "bg-[#0A0A0C] border-white/10"}`}>
              <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6 relative z-10">
                <div className="space-y-3">
                  <div className="flex items-center gap-2.5">
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-mono font-bold uppercase tracking-widest bg-neutral-900 text-neutral-200 border border-neutral-700">
                      PLATINUM COMMERCIAL PAYOR • INSTITUTIONAL TIER
                    </span>
                  </div>
                  <div>
                    <h2 className="text-4xl sm:text-5xl font-black tracking-tight font-mono text-white">
                      {(totalDisbursed > 0 ? Math.floor(totalDisbursed * 1.5) + 45000 : 142500).toLocaleString()} <span className="text-lg font-sans font-normal text-neutral-400">PTS</span>
                    </h2>
                    <p className={`text-xs mt-2 font-medium ${isLightTheme ? "text-slate-600" : "text-neutral-400"}`}>
                      Estimated Treasury Offset Value: <span className="font-bold text-white font-mono">${((totalDisbursed > 0 ? Math.floor(totalDisbursed * 1.5) + 45000 : 142500) * 0.01).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span> in direct statement credits or escrow expedite passes.
                    </p>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-3 w-full lg:w-auto">
                  <button
                    onClick={() => router.push("/branddashboard/invoices")}
                    className={`px-5 py-3 rounded-xl font-extrabold text-xs transition-all shadow-lg flex items-center justify-center gap-2 cursor-pointer ${isLightTheme ? "bg-[#0F172A] text-white hover:bg-slate-800 force-white-text" : "bg-white text-black hover:bg-neutral-200"}`}
                  >
                    <DollarSign className="w-4 h-4" />
                    <span>Redeem for Statement Credit</span>
                  </button>
                  <button
                    onClick={() => {
                      const el = document.getElementById("rewards-activity-log");
                      if (el) el.scrollIntoView({ behavior: "smooth" });
                    }}
                    className={`px-5 py-3 rounded-xl font-bold text-xs transition-all border flex items-center justify-center gap-2 cursor-pointer ${isLightTheme ? "bg-slate-100 hover:bg-slate-200 text-[#0F172A] border-slate-300" : "bg-neutral-900 hover:bg-neutral-800 text-neutral-200 border-neutral-800"}`}
                  >
                    <span>View Accrual Log</span>
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>

            {/* Section 2: Institutional Settlement Multipliers Grid (Simple, Limited, No Playful Colors) */}
            <div className="space-y-4">
              <div>
                <h3 className={`text-lg font-black ${isLightTheme ? "text-[#0F172A]" : "text-white"}`}>
                  Institutional Settlement Multipliers
                </h3>
                <p className={`text-xs ${isLightTheme ? "text-slate-500" : "text-neutral-400"}`}>
                  Stacking commercial points structure designed for enterprise treasury scale and creative economy root payors.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {/* Multiplier Card 1 */}
                <div className={`rounded-2xl border p-6 flex flex-col justify-between shadow-sm transition-all ${isLightTheme ? "bg-white border-slate-200" : "bg-[#0A0A0A] border-neutral-800/80 hover:border-neutral-700"}`}>
                  <div>
                    <div className="flex items-center justify-between">
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${isLightTheme ? "bg-slate-100 text-slate-800" : "bg-neutral-900 text-neutral-300 border border-neutral-800"}`}>
                        <Coins className="w-5 h-5" />
                      </div>
                      <span className="text-[10px] font-mono font-bold px-2.5 py-1 rounded bg-neutral-900 text-neutral-300 border border-neutral-800 uppercase tracking-wider">
                        1.0X Base Tier
                      </span>
                    </div>
                    <h4 className={`text-base font-bold mt-4 ${isLightTheme ? "text-[#0F172A]" : "text-white"}`}>
                      Agency Retainer & Studio Settlements
                    </h4>
                    <p className={`text-xs mt-2 leading-relaxed ${isLightTheme ? "text-slate-600" : "text-neutral-400"}`}>
                      All commercial card and treasury ACH payments settled to advertising agencies and creative studios automatically earn 1:1 institutional points across your global payment pool.
                    </p>
                  </div>
                  <div className={`mt-6 pt-4 border-t flex items-center justify-between text-[11px] font-bold ${isLightTheme ? "border-slate-100 text-slate-500" : "border-neutral-800/60 text-neutral-500"}`}>
                    <span>Status: Always Active</span>
                    <span className="text-white font-mono">100% Eligible</span>
                  </div>
                </div>

                {/* Multiplier Card 2 */}
                <div className={`rounded-2xl border p-6 flex flex-col justify-between shadow-sm transition-all ${isLightTheme ? "bg-white border-slate-200" : "bg-gradient-to-b from-[#141418] to-[#0A0A0E] border-neutral-700/60 hover:border-neutral-600"}`}>
                  <div>
                    <div className="flex items-center justify-between">
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${isLightTheme ? "bg-slate-900 text-white" : "bg-white text-black font-bold"}`}>
                        <Award className="w-5 h-5" />
                      </div>
                      <span className="text-[10px] font-mono font-bold px-2.5 py-1 rounded bg-white text-black font-extrabold uppercase tracking-wider">
                        2.0X Enterprise Boost
                      </span>
                    </div>
                    <h4 className={`text-base font-bold mt-4 ${isLightTheme ? "text-[#0F172A]" : "text-white"}`}>
                      Accelerated Net-0 & Batch CRM Routing
                    </h4>
                    <p className={`text-xs mt-2 leading-relaxed ${isLightTheme ? "text-slate-600" : "text-neutral-400"}`}>
                      Earn double points when settling batch CRM invoices within 5 business days or when your recipient agency utilizes AgncyPay's Net-0 automated talent disbursal routing.
                    </p>
                  </div>
                  <div className={`mt-6 pt-4 border-t flex items-center justify-between text-[11px] font-bold ${isLightTheme ? "border-slate-100 text-slate-500" : "border-neutral-800/60 text-neutral-400"}`}>
                    <span>Status: Auto-Split Verified</span>
                    <span className="text-white font-mono">2X Maximum Multiplier</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Section 3: Streamlined Enterprise Redemption Perks (Simple, Limited, Institutional) */}
            <div className="space-y-4">
              <div>
                <h3 className={`text-lg font-black ${isLightTheme ? "text-[#0F172A]" : "text-white"}`}>
                  Enterprise Redemption Catalog
                </h3>
                <p className={`text-xs ${isLightTheme ? "text-slate-500" : "text-neutral-400"}`}>
                  Redeem accumulated points to optimize treasury cash flow and waive institutional escrow fees.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {/* Perk 1 */}
                <div className={`rounded-2xl border p-6 flex flex-col justify-between shadow-sm transition-all ${isLightTheme ? "bg-white border-slate-200 hover:border-slate-300" : "bg-[#0A0A0A] border-neutral-800/80 hover:border-neutral-700"}`}>
                  <div className="flex items-start justify-between gap-4">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-neutral-900 text-neutral-300 border border-neutral-800 uppercase">
                          INSTANT OFFSET
                        </span>
                        <span className={`text-xs font-mono font-bold ${isLightTheme ? "text-slate-500" : "text-neutral-400"}`}>
                          10,000 PTS = $100
                        </span>
                      </div>
                      <h4 className={`text-base font-bold mt-2 ${isLightTheme ? "text-[#0F172A]" : "text-white"}`}>
                        Retainer & Invoice Statement Credit
                      </h4>
                      <p className={`text-xs leading-relaxed mt-1.5 ${isLightTheme ? "text-slate-600" : "text-neutral-400"}`}>
                        Apply your reward balance as a direct dollar offset against pending invoice settlements in your approval queue.
                      </p>
                    </div>
                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 ${isLightTheme ? "bg-slate-100 text-slate-800" : "bg-neutral-900 text-neutral-300 border border-neutral-800"}`}>
                      <DollarSign className="w-6 h-6" />
                    </div>
                  </div>
                  <div className="mt-6 pt-4 border-t border-neutral-800/60 flex items-center justify-between">
                    <span className="text-xs font-bold text-neutral-500 font-mono">Min. Offset: 5,000 PTS</span>
                    <button
                      onClick={() => router.push("/branddashboard/invoices")}
                      className={`px-4 py-2 rounded-xl text-xs font-bold transition-all shadow cursor-pointer ${isLightTheme ? "bg-[#0F172A] text-white hover:bg-slate-800 force-white-text" : "bg-white text-black hover:bg-neutral-200"}`}
                    >
                      Redeem Credit
                    </button>
                  </div>
                </div>

                {/* Perk 2 */}
                <div className={`rounded-2xl border p-6 flex flex-col justify-between shadow-sm transition-all ${isLightTheme ? "bg-white border-slate-200 hover:border-slate-300" : "bg-[#0A0A0A] border-neutral-800/80 hover:border-neutral-700"}`}>
                  <div className="flex items-start justify-between gap-4">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-neutral-900 text-neutral-300 border border-neutral-800 uppercase">
                          TREASURY EXPEDITE
                        </span>
                        <span className={`text-xs font-mono font-bold ${isLightTheme ? "text-slate-500" : "text-neutral-400"}`}>
                          2,500 PTS = 1 PASS
                        </span>
                      </div>
                      <h4 className={`text-base font-bold mt-2 ${isLightTheme ? "text-[#0F172A]" : "text-white"}`}>
                        Zero-Fee Escrow Expedite Passes
                      </h4>
                      <p className={`text-xs leading-relaxed mt-1.5 ${isLightTheme ? "text-slate-600" : "text-neutral-400"}`}>
                        Waive instant same-day ACH wire transfer fees and escrow release locks on high-volume campaign disbursals.
                      </p>
                    </div>
                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 ${isLightTheme ? "bg-slate-100 text-slate-800" : "bg-neutral-900 text-neutral-300 border border-neutral-800"}`}>
                      <Zap className="w-6 h-6" />
                    </div>
                  </div>
                  <div className="mt-6 pt-4 border-t border-neutral-800/60 flex items-center justify-between">
                    <span className="text-xs font-bold text-neutral-400">3 Passes Available</span>
                    <button
                      onClick={() => alert("You have 3 free expedite passes available in your treasury hub.")}
                      className={`px-4 py-2 rounded-xl text-xs font-bold transition-all border cursor-pointer ${isLightTheme ? "bg-slate-100 hover:bg-slate-200 text-[#0F172A] border-slate-300" : "bg-neutral-900 hover:bg-neutral-800 text-neutral-200 border-neutral-800"}`}
                    >
                      Claim Pass
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Section 4: Institutional Accrual Activity Ledger */}
            <div id="rewards-activity-log" className="space-y-4 pt-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className={`text-lg font-black ${isLightTheme ? "text-[#0F172A]" : "text-white"}`}>
                    Recent Points Accrual Ledger
                  </h3>
                  <p className={`text-xs ${isLightTheme ? "text-slate-500" : "text-neutral-400"}`}>
                    Real-time audit trail of institutional reward points earned from settled agency retainers and talent disbursals.
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-white animate-pulse" />
                  <span className="text-xs font-bold font-mono text-neutral-300">ACCRUAL ENGINE LIVE</span>
                </div>
              </div>

              <div className={`rounded-2xl border overflow-hidden shadow-sm ${isLightTheme ? "bg-white border-slate-200" : "bg-[#0A0A0A] border-neutral-800"}`}>
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className={`border-b font-bold font-mono ${isLightTheme ? "border-slate-200 bg-slate-50 text-slate-500" : "border-neutral-800/80 bg-neutral-950 text-neutral-400"}`}>
                        <th className="p-4">Campaign / Settlement Node</th>
                        <th className="p-4">Payment Source</th>
                        <th className="p-4">Settlement Volume</th>
                        <th className="p-4">Multiplier Applied</th>
                        <th className="p-4 text-right">Points Earned</th>
                      </tr>
                    </thead>
                    <tbody className={`divide-y ${isLightTheme ? "divide-slate-200" : "divide-neutral-800/60"}`}>
                      {paidInvoices.length === 0 ? (
                        <>
                          <tr className={`hover:bg-black/[0.01] transition-colors ${isLightTheme ? "hover:bg-slate-50" : "hover:bg-white/[0.01]"}`}>
                            <td className="p-4">
                              <div className={`font-bold ${isLightTheme ? "text-[#0F172A]" : "text-white"}`}>Summer Media Retainer (W-INV-012)</div>
                              <div className="text-[10px] text-neutral-500 mt-0.5 font-mono">Ogilvy & Mather Worldwide</div>
                            </td>
                            <td className="p-4">
                              <span className={`font-semibold ${isLightTheme ? "text-slate-700" : "text-neutral-300"}`}>Chase Commercial Card •••• 4092</span>
                            </td>
                            <td className={`p-4 font-black font-mono ${isLightTheme ? "text-[#0F172A]" : "text-white"}`}>
                              $5,000.00
                            </td>
                            <td className="p-4">
                              <span className="px-2.5 py-1 rounded text-[10px] font-mono font-bold bg-neutral-900 text-neutral-300 border border-neutral-800">
                                1.5X Accelerated Settle
                              </span>
                            </td>
                            <td className="p-4 text-right">
                              <span className="font-mono font-bold text-sm text-white inline-flex items-center gap-1.5">
                                +7,500 PTS
                              </span>
                            </td>
                          </tr>
                          <tr className={`hover:bg-black/[0.01] transition-colors ${isLightTheme ? "hover:bg-slate-50" : "hover:bg-white/[0.01]"}`}>
                            <td className="p-4">
                              <div className={`font-bold ${isLightTheme ? "text-[#0F172A]" : "text-white"}`}>Fall Campaign Milestone (W-INV-015)</div>
                              <div className="text-[10px] text-neutral-500 mt-0.5 font-mono">Wieden+Kennedy</div>
                            </td>
                            <td className="p-4">
                              <span className={`font-semibold ${isLightTheme ? "text-slate-700" : "text-neutral-300"}`}>AgncyPay Escrow Reserve ACH</span>
                            </td>
                            <td className={`p-4 font-black font-mono ${isLightTheme ? "text-[#0F172A]" : "text-white"}`}>
                              $7,000.00
                            </td>
                            <td className="p-4">
                              <span className="px-2.5 py-1 rounded text-[10px] font-mono font-bold bg-white text-black">
                                2.0X Net-0 Auto-Split Boost
                              </span>
                            </td>
                            <td className="p-4 text-right">
                              <span className="font-mono font-bold text-sm text-white inline-flex items-center gap-1.5">
                                +14,000 PTS
                              </span>
                            </td>
                          </tr>
                        </>
                      ) : (
                        paidInvoices.map((inv, idx) => {
                          const multiplier = idx % 2 === 0 ? 1.5 : 2.0;
                          const earned = Math.floor(inv.amount * multiplier);
                          return (
                            <tr key={inv.id} className={`hover:bg-black/[0.01] transition-colors ${isLightTheme ? "hover:bg-slate-50" : "hover:bg-white/[0.01]"}`}>
                              <td className="p-4">
                                <div className={`font-bold ${isLightTheme ? "text-[#0F172A]" : "text-white"}`}>{inv.campaign}</div>
                                <div className="text-[10px] text-neutral-500 mt-0.5 font-mono">{inv.id} • {inv.agency || "Creative Agency"}</div>
                              </td>
                              <td className="p-4">
                                <span className={`font-semibold ${isLightTheme ? "text-slate-700" : "text-neutral-300"}`}>Connected Commercial Treasury</span>
                              </td>
                              <td className={`p-4 font-black font-mono ${isLightTheme ? "text-[#0F172A]" : "text-white"}`}>
                                ${inv.amount.toLocaleString("en-US", { minimumFractionDigits: 2 })}
                              </td>
                              <td className="p-4">
                                <span className={`px-2.5 py-1 rounded text-[10px] font-mono font-bold ${multiplier === 2.0 ? "bg-white text-black" : "bg-neutral-900 text-neutral-300 border border-neutral-800"}`}>
                                  {multiplier === 2.0 ? "2.0X Net-0 Auto-Split Boost" : "1.5X Accelerated Settle"}
                                </span>
                              </td>
                              <td className="p-4 text-right">
                                <span className="font-mono font-bold text-sm text-white inline-flex items-center gap-1.5">
                                  +{earned.toLocaleString()} PTS
                                </span>
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
        ) : (
          <div className="space-y-6">
            {/* Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              <div className="glass-panel rounded-2xl p-6 flex flex-col justify-between">
                <div>
                  <div className="flex justify-between items-center text-[#8f8f8f]">
                    <span className="text-xs font-bold uppercase tracking-wider">Awaiting Payout</span>
                    <Coins className="h-4 w-4" />
                  </div>
                  <h2 className="text-[32px] font-black text-white mt-4">
                    ${escrowBalance.toLocaleString("en-US", { minimumFractionDigits: 2 })}
                  </h2>
                </div>
                <p className="text-[11px] text-[#8f8f8f] mt-4">
                  Aggregated represented talent balances awaiting agency disbursement.
                </p>
              </div>

              <div className="glass-panel rounded-2xl p-6 flex flex-col justify-between">
                <div>
                  <div className="flex justify-between items-center text-[#8f8f8f]">
                    <span className="text-xs font-bold uppercase tracking-wider">Agency Commission cut</span>
                    <Layers className="h-4 w-4" />
                  </div>
                  <h2 className="text-[32px] font-black text-white mt-4">
                    ${(totalDisbursed * 0.15).toLocaleString("en-US", { minimumFractionDigits: 2 })}
                  </h2>
                </div>
                <p className="text-[11px] text-[#8f8f8f] mt-4">
                  Accrued 15% agency cut from successfully settled campaign nodes.
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

            {/* Table Container */}
            <div className="glass-panel rounded-2xl border border-white/10 overflow-hidden">
              <div className="p-5 border-b border-white/10 flex justify-between items-center">
                <h3 className="text-xs font-black uppercase tracking-wider text-white">
                  Represented Talent Splits Queue
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
                              {isDisbursed ? (
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
        )}

      </div>
    </main>
  );
}
