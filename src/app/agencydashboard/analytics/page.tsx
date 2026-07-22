"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Building2,
  ArrowLeft,
  TrendingUp,
  DollarSign,
  BarChart3,
  Calendar,
  Percent,
  LogOut,
  Sun,
  Moon,
  HelpCircle,
  FileText
} from "lucide-react";
import { useApp } from "../../../context/AppContext";
import { subscribeInvoicesByBrand, subscribeInvoicesByAgency, FirestoreInvoice } from "../../../lib/firebaseInvoices";

export default function AnalyticsDashboardPage() {
  const router = useRouter();
  const { state, resetState } = useApp();
  const workspaceType = state.user ? state.user.accountType : "brand";

  const [isLightTheme, setIsLightTheme] = useState(false);
  const [invoices, setInvoices] = useState<FirestoreInvoice[]>([]);

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

  // Calculations derived from database invoices
  const paidInvoices = invoices.filter(inv => inv.status === "paid");
  
  // Total Billed Volume (including unpaid and paid)
  const totalBilled = invoices.reduce((acc, curr) => acc + curr.amount, 0);

  // Total Settled/Paid Volume
  const totalPaid = paidInvoices.reduce((acc, curr) => acc + curr.amount, 0);

  // Agency cut: 15% of settled splits pool (which is 90% of total paid)
  const totalAgencyCut = totalPaid * 0.9 * 0.15;

  // Auto-split savings (Brand: e.g. 15% savings compared to standard payout routes)
  const brandSavings = totalPaid * 0.15;

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
              onClick={() => router.push("/agencydashboard")}
              className="px-4 py-1.5 rounded-full text-xs font-semibold text-[#8f8f8f] hover:text-white transition-all cursor-pointer"
            >
              Home
            </button>
            <button 
              onClick={() => router.push("/agencydashboard/invoices")}
              className="px-4 py-1.5 rounded-full text-xs font-semibold text-[#8f8f8f] hover:text-white transition-all cursor-pointer"
            >
              {workspaceType === "brand" ? "Invoice Queue" : "Sent Invoices"}
            </button>
            <button 
              onClick={() => router.push("/agencydashboard/nodes")}
              className="px-4 py-1.5 rounded-full text-xs font-semibold text-[#8f8f8f] hover:text-white transition-all cursor-pointer"
            >
              {workspaceType === "brand" ? "Settlement Nodes" : "Payout Split Nodes"}
            </button>
            <button 
              onClick={() => router.push("/agencydashboard/analytics")}
              className="px-4 py-1.5 rounded-full text-xs font-semibold bg-white text-black shadow-sm transition-all cursor-pointer"
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
            href="/agencydashboard"
            className="p-2 rounded-lg border border-white/20 hover:border-white/20 hover:bg-white/[0.02] text-xs font-bold text-[#8f8f8f] hover:text-white transition-all flex items-center gap-1.5 shrink-0"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Dashboard
          </Link>
          <span className="text-xs text-neutral-500">/</span>
          <span className="text-xs text-neutral-300 font-semibold">
            {workspaceType === "brand" ? "Analytics" : "Agency Earnings"}
          </span>
        </div>

        {/* Hero Title Block */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">
              {workspaceType === "brand" ? "Brand Campaign Analytics" : "Agency Earnings & Revenue Analytics"}
            </h1>
            <p className="text-xs text-[#8f8f8f] mt-1">
              {workspaceType === "brand"
                ? "Gain deep insights into advertising billing nodes, split efficiencies, and Net-0 instant advances."
                : "Analyze agency commission pipelines, payout histories, and represented talent performance."}
            </p>
          </div>
        </div>

        {/* Analytics Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-5">
          <div className="glass-panel rounded-2xl p-5 flex flex-col justify-between">
            <div className="flex justify-between items-center text-[#8f8f8f]">
              <span className="text-[10px] font-bold uppercase tracking-wider">Total Volume Billed</span>
              <DollarSign className="h-4 w-4" />
            </div>
            <h2 className="text-2xl font-black text-white mt-3">
              ${totalBilled.toLocaleString("en-US", { minimumFractionDigits: 2 })}
            </h2>
            <p className="text-[10px] text-neutral-500 mt-2">Aggregated campaigns value</p>
          </div>

          <div className="glass-panel rounded-2xl p-5 flex flex-col justify-between">
            <div className="flex justify-between items-center text-[#8f8f8f]">
              <span className="text-[10px] font-bold uppercase tracking-wider">Settled Volume</span>
              <TrendingUp className="h-4 w-4 text-emerald-400" />
            </div>
            <h2 className="text-2xl font-black text-white mt-3">
              ${totalPaid.toLocaleString("en-US", { minimumFractionDigits: 2 })}
            </h2>
            <p className="text-[10px] text-neutral-500 mt-2">Disbursed or locked in escrow</p>
          </div>

          <div className="glass-panel rounded-2xl p-5 flex flex-col justify-between">
            <div className="flex justify-between items-center text-[#8f8f8f]">
              <span className="text-[10px] font-bold uppercase tracking-wider">
                {workspaceType === "brand" ? "Auto-Split Savings" : "Agency Cut (15%)"}
              </span>
              <Percent className="h-4 w-4" />
            </div>
            <h2 className="text-2xl font-black text-white mt-3">
              ${(workspaceType === "brand" ? brandSavings : totalAgencyCut).toLocaleString("en-US", { minimumFractionDigits: 2 })}
            </h2>
            <p className="text-[10px] text-neutral-500 mt-2">
              {workspaceType === "brand" ? "Saved via direct escrow split routes" : "Accrued representation fees"}
            </p>
          </div>

          <div className="glass-panel rounded-2xl p-5 flex flex-col justify-between">
            <div className="flex justify-between items-center text-[#8f8f8f]">
              <span className="text-[10px] font-bold uppercase tracking-wider">Active campaigns</span>
              <BarChart3 className="h-4 w-4" />
            </div>
            <h2 className="text-2xl font-black text-white mt-3">{invoices.length}</h2>
            <p className="text-[10px] text-neutral-500 mt-2">Total tracked nodes in DB</p>
          </div>
        </div>

        {/* Charts & Visual Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          
          {/* Chart 1: Campaigns volume breakdown */}
          <div className="glass-panel rounded-2xl p-6 flex flex-col justify-between">
            <div>
              <h3 className="text-xs font-black uppercase tracking-wider text-white mb-4">
                Volume by Campaign
              </h3>
              
              <div className="space-y-4 mt-6">
                {invoices.length === 0 ? (
                  <p className="text-xs text-neutral-500 text-center py-8">No invoice nodes found in database.</p>
                ) : (
                  invoices.slice(0, 4).map((inv) => {
                    const pct = Math.max(10, Math.min(100, (inv.amount / (totalBilled || 1)) * 100));
                    return (
                      <div key={inv.id} className="space-y-1">
                        <div className="flex justify-between text-xs font-semibold">
                          <span className="text-neutral-300 truncate max-w-[200px]">{inv.campaign}</span>
                          <span className="text-white font-bold">${inv.amount.toLocaleString()}</span>
                        </div>
                        <div className="h-2 w-full bg-white/[0.03] rounded-full overflow-hidden border border-white/5">
                          <div 
                            style={{ width: `${pct}%` }}
                            className="h-full bg-white rounded-full" 
                          />
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          </div>

          {/* Chart 2: Payout distribution pie */}
          <div className="glass-panel rounded-2xl p-6 flex flex-col justify-between">
            <div>
              <h3 className="text-xs font-black uppercase tracking-wider text-white mb-4">
                Disbursement Pool Splits
              </h3>

              <div className="flex flex-col sm:flex-row items-center gap-6 mt-6">
                {/* SVG circular representation */}
                <div className="relative h-28 w-28 flex items-center justify-center shrink-0">
                  <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                    <circle cx="18" cy="18" r="15.915" fill="none" stroke="rgba(255,255,255,0.02)" strokeWidth="3" />
                    {/* 85% Talent Split */}
                    <circle cx="18" cy="18" r="15.915" fill="none" stroke="#ffffff" strokeWidth="3.2" strokeDasharray="76.5 23.5" strokeDashoffset="0" />
                    {/* 15% Agency Split */}
                    <circle cx="18" cy="18" r="15.915" fill="none" stroke="#888888" strokeWidth="3.2" strokeDasharray="13.5 86.5" strokeDashoffset="-76.5" />
                    {/* 10% Processing Fee */}
                    <circle cx="18" cy="18" r="15.915" fill="none" stroke="#444444" strokeWidth="3.2" strokeDasharray="10 90" strokeDashoffset="-90" />
                  </svg>
                  <div className="absolute text-center">
                    <span className="text-[10px] font-bold text-[#8f8f8f] block uppercase">Splits</span>
                    <span className="text-xs font-black text-white">85/15</span>
                  </div>
                </div>

                <div className="space-y-2.5 w-full">
                  <div className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2 text-neutral-300">
                      <span className="h-2 w-2 rounded-full bg-white" />
                      <span>Net Talent Split (85%)</span>
                    </div>
                    <span className="text-white font-bold">${(totalPaid * 0.9 * 0.85).toLocaleString(undefined, { maximumFractionDigits: 0 })}</span>
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2 text-neutral-300">
                      <span className="h-2 w-2 rounded-full bg-[#888888]" />
                      <span>Agency Commission (15%)</span>
                    </div>
                    <span className="text-white font-bold">${(totalPaid * 0.9 * 0.15).toLocaleString(undefined, { maximumFractionDigits: 0 })}</span>
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2 text-neutral-300">
                      <span className="h-2 w-2 rounded-full bg-[#444444]" />
                      <span>Processing fee (10% of gross)</span>
                    </div>
                    <span className="text-white font-bold">${(totalPaid * 0.1).toLocaleString(undefined, { maximumFractionDigits: 0 })}</span>
                  </div>
                </div>
              </div>
            </div>
            <p className="text-[10px] text-[#8f8f8f] mt-4">
              Visual split breakdown of campaign disbursements settled from brand node down to agency and talent creative wallets.
            </p>
          </div>

        </div>

      </div>
    </main>
  );
}
