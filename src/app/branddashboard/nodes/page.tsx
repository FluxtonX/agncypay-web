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
  Briefcase,
  Crown,
  Flame
} from "lucide-react";
import { useApp } from "../../../context/AppContext";
import { subscribeInvoicesByBrand, subscribeInvoicesByAgency, updateInvoiceStatus, FirestoreInvoice } from "../../../lib/firebaseInvoices";

export default function NodesDashboardPage() {
  const router = useRouter();
  const { state, resetState } = useApp();
  const workspaceType = state.user ? state.user.accountType : "brand";

  const [isLightTheme, setIsLightTheme] = useState(true);
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

  // Loyalty Club Timeline Progression Calculations (from 0 points onward)
  const currentPts = totalDisbursed > 0 ? Math.floor(totalDisbursed * 1.5) + 45000 : 325500;
  let trackPct = 0;
  if (currentPts <= 100000) {
    trackPct = (currentPts / 100000) * 33.33;
  } else if (currentPts <= 250000) {
    trackPct = 33.33 + ((currentPts - 100000) / 150000) * 33.33;
  } else if (currentPts < 500000) {
    trackPct = 66.67 + ((currentPts - 250000) / 250000) * 33.33;
  } else {
    trackPct = 100;
  }
  const activeLineWidthPct = trackPct * 0.75;

  return (
    <main className={`min-h-screen flex flex-col font-sans antialiased relative transition-colors duration-200 ${workspaceType === "brand" ? "bg-white text-black h-screen overflow-hidden pb-0" : "bg-background text-foreground pb-12"}`}>
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
              Payments
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
      <div className={`max-w-[1520px] w-full mx-auto px-6 py-6 flex-1 flex flex-col gap-6 ${workspaceType === "brand" ? "overflow-y-auto" : ""}`}>
        
        {/* Navigation Breadcrumb */}
        <div className="flex items-center gap-2 shrink-0">
          <Link 
            href="/branddashboard"
            className={`p-2 rounded-lg border text-xs font-bold transition-all flex items-center gap-1.5 ${workspaceType === "brand" ? "border-neutral-200 text-neutral-600 hover:text-black hover:bg-neutral-100" : "border-white/20 hover:border-white/20 hover:bg-white/[0.02] text-[#8f8f8f] hover:text-white"}`}
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Dashboard
          </Link>
          <span className="text-xs text-neutral-400">/</span>
          <span className={`text-xs font-semibold ${workspaceType === "brand" ? "text-black" : "text-neutral-300"}`}>
            {workspaceType === "brand" ? "Rewards" : "Payout Split Nodes"}
          </span>
        </div>

        {/* Hero title block */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 shrink-0">
          <div>
            <h1 className={`text-2xl font-bold tracking-tight ${workspaceType === "brand" ? "text-black" : "text-white"}`}>
              {workspaceType === "brand" ? "Brand Commercial Rewards Hub" : "Agency Payout Routing Center"}
            </h1>
            <p className={`text-xs mt-1 ${workspaceType === "brand" ? "text-neutral-500" : "text-[#8f8f8f]"}`}>
              {workspaceType === "brand" 
                ? "Earn and manage AgncyPay Points as a creative economy Payor when settling agency retainers, CRM invoices, and campaign milestones."
                : "Manage campaign split disbursements, representing agency commissions, and release talent payouts."}
            </p>
          </div>
        </div>

        {/* Main Content Area - Conditional by Workspace Type */}
        {workspaceType === "brand" ? (
          <div className="flex flex-col gap-8 max-w-[1150px] mx-auto w-full pb-12">
            
            {/* Existing Cards Grid at the top */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 w-full items-stretch">
              {/* Left Column (7 Cols) - Points Balance Card */}
              <div className="lg:col-span-7 bg-white rounded-3xl border border-neutral-200 p-8 sm:p-10 flex flex-col justify-between shadow-sm h-full">
                <div>
                  <div className="flex items-center justify-between border-b border-neutral-100 pb-5">
                    <span className="text-xs font-bold text-black uppercase tracking-wider">
                      Commercial Payor Rewards
                    </span>
                    <span className="text-[10px] font-bold text-black font-mono uppercase px-2.5 py-1 rounded border border-neutral-300 bg-neutral-50">
                      Platinum Tier
                    </span>
                  </div>
                  <div className="mt-8">
                    <h2 className="text-6xl sm:text-7xl font-black text-black tracking-tight font-mono">
                      {(totalDisbursed > 0 ? Math.floor(totalDisbursed * 1.5) + 45000 : 325500).toLocaleString()} <span className="text-2xl font-sans font-normal text-neutral-400">PTS</span>
                    </h2>
                    <p className="text-sm text-neutral-600 font-medium mt-4">
                      Estimated Statement Credit Value: <span className="font-bold text-black font-mono">${((totalDisbursed > 0 ? Math.floor(totalDisbursed * 1.5) + 45000 : 325500) * 0.01).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                    </p>
                  </div>
                </div>

                <div className="mt-8 pt-6 border-t border-neutral-100">
                  <button
                    onClick={() => router.push("/branddashboard/invoices")}
                    className="w-full py-4 px-6 rounded-2xl bg-black text-white font-bold text-sm hover:bg-neutral-800 transition-all shadow-sm cursor-pointer flex items-center justify-center gap-2"
                  >
                    <span>Redeem for Statement Credit</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Right Column (5 Cols) - Simple Rules Card */}
              <div className="lg:col-span-5 bg-white rounded-3xl border border-neutral-200 p-8 sm:p-10 flex flex-col justify-between shadow-sm h-full">
                <div>
                  <h3 className="text-xs font-bold text-black uppercase tracking-wider border-b border-neutral-100 pb-5">
                    Earning & Redemption Rules
                  </h3>
                  <div className="mt-8 space-y-6 text-sm text-neutral-700 font-medium">
                    <div className="flex justify-between items-baseline">
                      <span>Agency Retainer Settlements</span>
                      <span className="font-bold text-black font-mono">1.0X PTS</span>
                    </div>
                    <div className="flex justify-between items-baseline">
                      <span>Accelerated Net-0 Routing</span>
                      <span className="font-bold text-black font-mono">2.0X PTS</span>
                    </div>
                    <div className="flex justify-between items-baseline pt-4 border-t border-neutral-100">
                      <span>Statement Credit Rate</span>
                      <span className="font-bold text-black font-mono">10,000 PTS = $100</span>
                    </div>
                  </div>
                </div>

                <div className="mt-8 pt-6 border-t border-neutral-100">
                  <p className="text-xs text-neutral-500 leading-relaxed">
                    Institutional reward points accrue automatically across all connected treasury settlements and campaign disbursals.
                  </p>
                </div>
              </div>
            </div>

            {/* Driving User Engagement & Loyalty: Point-Based Club Timeline Banner at the bottom */}
            <div className={`p-8 sm:p-10 rounded-3xl border shadow-xl relative overflow-hidden transition-colors ${isLightTheme ? "bg-white border-black/10 text-slate-900" : "bg-[#0A0A0A] border-white/15 text-white"}`}>
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-12 border-b pb-6 border-white/10 light:border-black/10">
                <div>
                  <h2 className={`text-2xl sm:text-3xl font-black tracking-tight ${isLightTheme ? "text-black" : "text-white"}`}>
                    Hi, {state.workspaces.find(w => w.id === state.activeWorkspaceId)?.name || state.user?.fullName || "Adidas Commercial"}
                  </h2>
                  <p className={`text-xs font-semibold mt-1 ${isLightTheme ? "text-slate-500" : "text-neutral-400"}`}>
                    Driving User Engagement and Loyalty • Institutional Point-Based Club
                  </p>
                </div>
                <div className={`px-4 py-2 rounded-full border flex items-center gap-2 text-xs font-black tracking-wider uppercase cursor-pointer shadow-sm transition-transform hover:scale-105 ${isLightTheme ? "bg-black text-white border-black" : "bg-white text-black border-white"}`}>
                  <Award className="w-4 h-4 text-emerald-500" />
                  <span>AGNCYPAY Style Club</span>
                  <ChevronRight className="w-4 h-4" />
                </div>
              </div>

              {/* Horizontal Timeline Progress Bar (Progressing from 0 points onward) */}
              <div className="relative pt-8 pb-4 px-2 sm:px-8">
                
                {/* Background Uncompleted Track Line (From 0 PTS / Left 12.5% to 500K PTS / Right 12.5%) */}
                <div 
                  className={`absolute top-[58px] left-[12.5%] right-[12.5%] h-3.5 rounded-full z-0 transition-all ${isLightTheme ? "bg-slate-200 border border-slate-300 shadow-inner" : "bg-neutral-800 border border-neutral-700 shadow-[inset_0_2px_4px_rgba(0,0,0,0.8)]"}`} 
                />
                
                {/* Active Completed Track Line (Progresses dynamically from 0 points onward!) */}
                <div 
                  className={`absolute top-[58px] left-[12.5%] h-3.5 rounded-full z-0 transition-all duration-1000 ${isLightTheme ? "bg-gradient-to-r from-slate-400 via-slate-700 to-black shadow-md border border-black" : "bg-gradient-to-r from-neutral-600 via-neutral-200 to-white shadow-[0_0_25px_rgba(255,255,255,0.7),0_0_10px_rgba(255,255,255,0.4)] border border-white"}`} 
                  style={{ width: `${activeLineWidthPct}%` }}
                />

                {/* Live Progress Tip Handle (Pulsing Green Node, No fire/flame emoji!) */}
                <div 
                  className={`absolute top-[49px] z-20 w-8 h-8 rounded-full border-2 shadow-[0_0_20px_rgba(16,185,129,0.8)] flex items-center justify-center animate-bounce cursor-pointer transition-all ${isLightTheme ? "bg-black border-white" : "bg-white border-emerald-500"}`}
                  style={{ left: `calc(12.5% + ${activeLineWidthPct}% - 16px)` }}
                  title={`Live Balance: ${currentPts.toLocaleString()} PTS`}
                >
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
                </div>

                {/* 4 Timeline Nodes Grid */}
                <div className="relative z-10 grid grid-cols-4 w-full justify-between items-start text-center">
                  
                  {/* Node 1: PRO (0 PTS Start) */}
                  <div className="flex flex-col items-center">
                    <div className="h-8 mb-2 flex items-center justify-center">
                      <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase bg-black/10 light:bg-slate-200 text-neutral-400">
                        Start
                      </span>
                    </div>
                    <div className={`w-12 h-12 rounded-full flex items-center justify-center border-4 shadow-md transition-transform hover:scale-110 ${isLightTheme ? "bg-black border-white text-white" : "bg-white border-[#111] text-black"}`}>
                      <CheckCircle2 className="w-6 h-6" />
                    </div>
                    <span className={`mt-3 text-sm font-black uppercase tracking-wider ${isLightTheme ? "text-slate-600" : "text-neutral-300"}`}>
                      PRO
                    </span>
                    <span className="text-xs font-mono font-bold text-neutral-400 mt-0.5">0 PTS</span>
                  </div>

                  {/* Node 2: STYLE (100K PTS) */}
                  <div className="flex flex-col items-center">
                    <div className="h-8 mb-2 flex items-center justify-center">
                      <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase bg-black/10 light:bg-slate-200 text-neutral-400">
                        Unlocked
                      </span>
                    </div>
                    <div className={`w-12 h-12 rounded-full flex items-center justify-center border-4 shadow-md transition-transform hover:scale-110 ${isLightTheme ? "bg-black border-white text-white" : "bg-white border-[#111] text-black"}`}>
                      <CheckCircle2 className="w-6 h-6" />
                    </div>
                    <span className={`mt-3 text-sm font-black uppercase tracking-wider ${isLightTheme ? "text-slate-600" : "text-neutral-300"}`}>
                      STYLE
                    </span>
                    <span className="text-xs font-mono font-bold text-neutral-400 mt-0.5">100,000 PTS</span>
                  </div>

                  {/* Node 3: ICON (Current Tier at 250K PTS!) */}
                  <div className="flex flex-col items-center">
                    <div className="h-8 mb-2 flex items-center justify-center">
                      <div className="flex items-center gap-1 px-3 py-1 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-emerald-500 text-xs font-mono font-black shadow-sm animate-pulse whitespace-nowrap">
                        <span>Current Tier</span>
                        <Sparkles className="w-3.5 h-3.5 text-emerald-500" />
                      </div>
                    </div>
                    <div className={`w-12 h-12 rounded-full flex items-center justify-center border-4 shadow-2xl ring-4 ring-emerald-500/40 transition-transform hover:scale-110 ${isLightTheme ? "bg-black border-white text-white" : "bg-white border-[#111] text-black"}`}>
                      <Award className="w-6 h-6 text-emerald-500" />
                    </div>
                    <span className={`mt-3 text-sm font-black uppercase tracking-wider ${isLightTheme ? "text-black" : "text-white"}`}>
                      ICON
                    </span>
                    <span className="text-xs font-mono font-bold text-emerald-500 mt-0.5">250,000 PTS</span>
                  </div>

                  {/* Node 4: ELITE (Goal Tier at 500K PTS!) */}
                  <div className="flex flex-col items-center">
                    <div className="h-8 mb-2 flex items-center justify-center">
                      <span className="px-2.5 py-0.5 rounded text-[10px] font-mono font-bold uppercase bg-emerald-500/10 text-emerald-500 border border-emerald-500/30">
                        Next Milestone
                      </span>
                    </div>
                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center border-2 shadow-lg transition-transform hover:scale-110 ${isLightTheme ? "bg-slate-100 border-slate-300 text-slate-400" : "bg-white/5 border-white/20 text-emerald-500"}`}>
                      <Crown className="w-6 h-6" />
                    </div>
                    <span className={`mt-3 text-sm font-black uppercase tracking-wider ${isLightTheme ? "text-slate-900" : "text-white"}`}>
                      ELITE
                    </span>
                    <div className="mt-0.5 flex flex-col items-center">
                      <span className={`text-xs font-mono font-black ${isLightTheme ? "text-black" : "text-white"}`}>
                        500,000 PTS
                      </span>
                      <span className="text-[11px] font-semibold text-neutral-400 mt-0.5">
                        {Math.max(500000 - currentPts, 2500).toLocaleString()} Pts to go
                      </span>
                    </div>
                  </div>

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
