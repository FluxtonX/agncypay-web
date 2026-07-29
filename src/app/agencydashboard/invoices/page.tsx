"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Building2,
  ArrowLeft,
  Search,
  ChevronRight,
  LogOut,
  Sun,
  Moon,
  Landmark,
  Lock,
  HelpCircle
} from "lucide-react";
import { useApp } from "../../../context/AppContext";
import { subscribeInvoicesByBrand, subscribeInvoicesByAgency } from "../../../lib/firebaseInvoices";

interface SplitItem {
  name: string;
  role: "Talent" | "Agency";
  percentage: number;
  amount: number;
  walletId: string;
  avatar: string;
}

interface VendorItem {
  name: string;
  role: "Vendor";
  amount: number;
  walletId: string;
  avatar: string;
}

interface InvoiceMock {
  id: string;
  campaignName: string;
  brandName: string;
  createdDate: string;
  dueDate: string;
  amount: number;
  location: string;
  costCenter: string;
  initials: string[];
  vendorFee: VendorItem;
  splitPool: {
    total: number;
    splits: SplitItem[];
  };
  status: "awaiting_approval" | "processing" | "settled" | "rejected" | "talent_disbursed";
  defaultTerm: "Net-30" | "Net-60" | "Net-90";
}

const INITIAL_INVOICES: InvoiceMock[] = [];

export default function InvoicesQueuePage() {
  const router = useRouter();
  const { state, resetState } = useApp();
  const workspaceType = state.user ? state.user.accountType : "brand";

  const [isLightTheme, setIsLightTheme] = useState(false);

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

  const [invoices, setInvoices] = useState<InvoiceMock[]>([]);
  const [activeMainTab, setActiveMainTab] = useState<"receivables" | "payables">("receivables");
  const [activeReceivableFilter, setActiveReceivableFilter] = useState<"all" | "awaiting_approval" | "settled">("awaiting_approval");
  const [activePayableFilter, setActivePayableFilter] = useState<"all" | "pending_payout" | "disbursed">("pending_payout");
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    const userEmail = state.user?.email;
    if (!userEmail) {
      setInvoices([]);
      return;
    }

    const handleInvoicesUpdate = (invoicesList: any[]) => {
      const mappedList: InvoiceMock[] = invoicesList.map((inv) => {
        let uiStatus: "awaiting_approval" | "settled" | "talent_disbursed" = "awaiting_approval";
        if (inv.status === "paid") {
          uiStatus = inv.talentPayoutStatus === "disbursed" ? "talent_disbursed" : "settled";
        }
        
        return {
          id: inv.id,
          campaignName: inv.campaign,
          brandName: inv.brandName || "Adidas Corporate",
          createdDate: inv.createdDate || new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }),
          dueDate: inv.due,
          amount: inv.amount,
          location: "Escrow Wallet Active",
          costCenter: "Marketing (Campaign Pool)",
          initials: [inv.agency?.charAt(0).toUpperCase() || "A"],
          defaultTerm: "Net-30",
          status: uiStatus,
          vendorFee: {
            name: "Processing Fee",
            role: "Vendor",
            amount: inv.amount * 0.1,
            walletId: "@agncypay",
            avatar: "https://images.unsplash.com/photo-1560250097-0b93528c311a?w=80&auto=format&fit=crop&q=80"
          },
          splitPool: {
            total: inv.amount * 0.9,
            splits: [
              { name: inv.talent, role: "Talent", percentage: 85, amount: inv.amount * 0.9 * 0.85, walletId: "@talent", avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=80&auto=format&fit=crop&q=80" },
              { name: inv.agency, role: "Agency", percentage: 15, amount: inv.amount * 0.9 * 0.15, walletId: "@agency", avatar: "https://images.unsplash.com/photo-1542204165-65bf26472b9b?w=80&auto=format&fit=crop&q=80" }
            ]
          }
        };
      });
      setInvoices(mappedList);
    };

    let unsubscribe = () => {};
    if (workspaceType === "brand") {
      unsubscribe = subscribeInvoicesByBrand(userEmail, handleInvoicesUpdate);
    } else {
      unsubscribe = subscribeInvoicesByAgency(userEmail, handleInvoicesUpdate);
    }

    return () => unsubscribe();
  }, [state.user, workspaceType]);

  const handleLogout = () => {
    resetState();
    router.push("/auth/login");
  };

  // Filter logic
  const filteredInvoices = invoices.filter(inv => {
    const isReceivable = activeMainTab === "receivables";
    
    // Determine if it matches the sub-filter
    let matchesFilter = true;
    if (isReceivable) {
      if (activeReceivableFilter !== "all") {
        const uiStatus = (inv.status === "settled" || inv.status === "talent_disbursed") ? "settled" : "awaiting_approval";
        matchesFilter = uiStatus === activeReceivableFilter;
      }
    } else {
      if (activePayableFilter !== "all") {
        const uiStatus = inv.status === "talent_disbursed" ? "disbursed" : "pending_payout";
        matchesFilter = uiStatus === activePayableFilter;
      }
    }

    const matchesSearch = inv.campaignName.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          inv.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          (!isReceivable && inv.splitPool.splits.some(s => s.role === "Talent" && s.name.toLowerCase().includes(searchQuery.toLowerCase())));
                          
    return matchesFilter && matchesSearch;
  });

  return (
    <main className="min-h-screen bg-background text-foreground flex flex-col font-sans antialiased relative transition-colors duration-200">
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
              <Building2 className="h-3 w-3 text-white light:text-[#0F172A]" />
              {workspaceType === "brand" ? "Brand Portal" : "Agency Portal"}
            </div>
          </div>

          <nav className="hidden lg:flex items-center gap-1 bg-white/[0.03] p-1 rounded-full border border-white/20">
            <button 
              onClick={() => router.push("/agencydashboard")}
              className="px-4 py-1.5 rounded-full text-xs font-semibold text-[#8f8f8f] light:text-[#475569] hover:text-white light:hover:text-[#0F172A] transition-all cursor-pointer"
            >
              Home
            </button>
            <button 
              onClick={() => router.push("/agencydashboard/invoices")}
              className="px-4 py-1.5 rounded-full text-xs font-bold bg-white light:bg-[#0F172A] text-black light:text-white shadow-sm border border-white/20 light:border-black/10 transition-all cursor-pointer"
            >
              Payments
            </button>
            <button 
              onClick={() => router.push("/agencydashboard/wallet")}
              className="px-4 py-1.5 rounded-full text-xs font-semibold text-[#8f8f8f] light:text-[#475569] hover:text-white light:hover:text-[#0F172A] transition-all cursor-pointer flex items-center gap-1.5"
            >
              Wallet
            </button>
            <button 
              onClick={() => router.push("/agencydashboard/contacts")}
              className="px-4 py-1.5 rounded-full text-xs font-semibold text-[#8f8f8f] light:text-[#475569] hover:text-white light:hover:text-[#0F172A] transition-all cursor-pointer flex items-center gap-1.5"
            >
              Contacts
            </button>
          </nav>

          <div className="flex items-center gap-3">
            {workspaceType === "agency" && (
              <>
                <div className="flex items-center gap-1.5">
                  <button
                    disabled
                    className="px-3.5 py-1.5 rounded-full text-xs font-bold bg-white/40 light:bg-[#0F172A]/40 text-black/40 light:text-white/40 border border-white/10 light:border-black/5 shadow-sm transition-all flex items-center gap-1.5 cursor-not-allowed blur-[0.6px]"
                  >
                    <Lock className="h-3.5 w-3.5" />
                    Switch to Agency Banking
                  </button>
                  <button 
                    onClick={() => alert("Agency Banking is currently locked. Complete your compliance verification to unlock this feature.")}
                    className="p-1 text-neutral-400 hover:text-white transition-colors"
                    title="Why is this locked?"
                  >
                    <HelpCircle className="h-4 w-4" />
                  </button>
                </div>
                <div className="h-4 w-[1px] bg-white/20" />

              </>
            )}
            <div className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-full bg-white/[0.05] border border-white/20 flex items-center justify-center font-bold text-xs text-white">
                {state.user?.fullName ? state.user.fullName.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2) : "AD"}
              </div>
              <span className={`text-xs font-bold ${isLightTheme ? "text-[#0F172A]" : "text-[#E5E5EA]"} hidden sm:inline`}>
                {state.user?.fullName || "Adidas Corporate"}
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
        
        <div className="flex items-center gap-2">
          <Link 
            href="/agencydashboard"
            className="p-2 rounded-lg border border-white/20 hover:border-white/20 hover:bg-white/[0.02] text-xs font-bold text-[#8f8f8f] hover:text-white transition-all flex items-center gap-1.5 shrink-0"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Dashboard
          </Link>
          <span className="text-xs text-neutral-500">/</span>
          <span className="text-xs text-neutral-300 font-semibold">Approval Queue</span>
        </div>

        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Payments Manager</h1>
            <p className="text-xs text-[#8f8f8f] mt-1">Manage brand receivables and talent payables in one place.</p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => alert("Request Payment from Brand flow initiated.")}
              className={`h-10 px-5 rounded-lg text-xs font-black transition-all flex items-center justify-center gap-2 cursor-pointer shadow-md shrink-0 ${isLightTheme ? "bg-white border border-black/10 text-[#0F172A] hover:bg-neutral-100" : "bg-white/10 hover:bg-white/20 border border-white/20 text-white"}`}
            >
              Request Payment
            </button>
            <button
              onClick={() => alert("Send Payment to Talent flow initiated.")}
              className={`h-10 px-5 rounded-lg text-xs font-black transition-all flex items-center justify-center gap-2 cursor-pointer shadow-md shrink-0 ${isLightTheme ? "bg-[#0F172A] text-white hover:bg-[#1E293B]" : "bg-white text-black hover:bg-neutral-200"}`}
            >
              Send Payment
            </button>
          </div>
        </div>

        {/* Main Tabs */}
        <div className="flex items-center gap-2 border-b border-white/10 pb-4">
          <button
            onClick={() => setActiveMainTab("receivables")}
            className={`px-5 py-2.5 rounded-lg text-sm font-bold transition-all ${
              activeMainTab === "receivables"
                ? "bg-white text-black"
                : "text-[#8f8f8f] hover:text-white hover:bg-white/5"
            }`}
          >
            Receivables (From Brands)
          </button>
          <button
            onClick={() => setActiveMainTab("payables")}
            className={`px-5 py-2.5 rounded-lg text-sm font-bold transition-all ${
              activeMainTab === "payables"
                ? "bg-white text-black"
                : "text-[#8f8f8f] hover:text-white hover:bg-white/5"
            }`}
          >
            Payables (To Talent)
          </button>
        </div>

        {/* Summary Widgets */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {activeMainTab === "receivables" ? (
            <>
              <div className="bg-[#050505] border border-white/10 rounded-xl p-5 shadow-lg">
                <p className="text-[11px] font-bold text-[#8f8f8f] uppercase tracking-wider mb-2">Total Expected</p>
                <p className="text-2xl font-black text-white">
                  ${invoices.reduce((acc, curr) => acc + curr.amount, 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </p>
              </div>
              <div className="bg-[#050505] border border-white/10 rounded-xl p-5 shadow-lg">
                <p className="text-[11px] font-bold text-amber-500 uppercase tracking-wider mb-2">Awaiting Brands</p>
                <p className="text-2xl font-black text-amber-400">
                  ${invoices.filter(i => i.status === "awaiting_approval").reduce((acc, curr) => acc + curr.amount, 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </p>
              </div>
              <div className="bg-[#050505] border border-white/10 rounded-xl p-5 shadow-lg">
                <p className="text-[11px] font-bold text-emerald-500 uppercase tracking-wider mb-2">Total Settled</p>
                <p className="text-2xl font-black text-emerald-400">
                  ${invoices.filter(i => i.status === "settled" || i.status === "talent_disbursed").reduce((acc, curr) => acc + curr.amount, 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </p>
              </div>
            </>
          ) : (
            <>
              <div className="bg-[#050505] border border-white/10 rounded-xl p-5 shadow-lg">
                <p className="text-[11px] font-bold text-[#8f8f8f] uppercase tracking-wider mb-2">Total Owed to Talent</p>
                <p className="text-2xl font-black text-white">
                  ${invoices.reduce((acc, curr) => {
                    const talentSplit = curr.splitPool.splits.find(s => s.role === "Talent");
                    return acc + (talentSplit ? talentSplit.amount : 0);
                  }, 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </p>
              </div>
              <div className="bg-[#050505] border border-white/10 rounded-xl p-5 shadow-lg">
                <p className="text-[11px] font-bold text-amber-500 uppercase tracking-wider mb-2">Pending Payouts</p>
                <p className="text-2xl font-black text-amber-400">
                  ${invoices.filter(i => i.status !== "talent_disbursed").reduce((acc, curr) => {
                    const talentSplit = curr.splitPool.splits.find(s => s.role === "Talent");
                    return acc + (talentSplit ? talentSplit.amount : 0);
                  }, 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </p>
              </div>
              <div className="bg-[#050505] border border-white/10 rounded-xl p-5 shadow-lg">
                <p className="text-[11px] font-bold text-emerald-500 uppercase tracking-wider mb-2">Total Disbursed</p>
                <p className="text-2xl font-black text-emerald-400">
                  ${invoices.filter(i => i.status === "talent_disbursed").reduce((acc, curr) => {
                    const talentSplit = curr.splitPool.splits.find(s => s.role === "Talent");
                    return acc + (talentSplit ? talentSplit.amount : 0);
                  }, 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </p>
              </div>
            </>
          )}
        </div>

        {/* Search & Tabs Controls */}
        <div className="flex flex-col md:flex-row gap-4 justify-between items-stretch md:items-center bg-[#050505] p-3 rounded-xl border border-white/20">
          <div className="flex flex-wrap gap-2">
            {activeMainTab === "receivables" ? (
              [
                { id: "all", label: "All Invoices" },
                { id: "awaiting_approval", label: "Awaiting Brand" },
                { id: "settled", label: "Settled" }
              ].map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveReceivableFilter(tab.id as any)}
                  className={`px-4 py-2 rounded-lg text-xs font-semibold tracking-tight transition-all cursor-pointer ${
                    activeReceivableFilter === tab.id
                      ? "bg-white text-black font-bold"
                      : "text-[#8f8f8f] hover:text-white bg-transparent hover:bg-white/[0.02]"
                  }`}
                >
                  {tab.label}
                  {tab.id === "awaiting_approval" && (
                    <span className="ml-1.5 px-1.5 py-0.5 rounded bg-[#10b981]/10 text-[#10b981] text-[10px] font-bold">
                      {invoices.filter(i => i.status === "awaiting_approval").length}
                    </span>
                  )}
                </button>
              ))
            ) : (
              [
                { id: "all", label: "All Payouts" },
                { id: "pending_payout", label: "Pending Payout" },
                { id: "disbursed", label: "Disbursed" }
              ].map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActivePayableFilter(tab.id as any)}
                  className={`px-4 py-2 rounded-lg text-xs font-semibold tracking-tight transition-all cursor-pointer ${
                    activePayableFilter === tab.id
                      ? "bg-white text-black font-bold"
                      : "text-[#8f8f8f] hover:text-white bg-transparent hover:bg-white/[0.02]"
                  }`}
                >
                  {tab.label}
                  {tab.id === "pending_payout" && (
                    <span className="ml-1.5 px-1.5 py-0.5 rounded bg-amber-500/10 text-amber-500 text-[10px] font-bold">
                      {invoices.filter(i => i.status !== "talent_disbursed").length}
                    </span>
                  )}
                </button>
              ))
            )}
          </div>

          <div className="relative md:w-80">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#8f8f8f]" />
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Search campaign, invoice ID..."
              className="w-full h-9 bg-black border border-white/20 focus:border-white/20 rounded-lg pl-9 pr-4 text-xs outline-none placeholder:text-neutral-600 transition-colors"
            />
          </div>
        </div>

        {/* Invoices List Grid */}
        <div className="bg-[#050505] rounded-2xl border border-white/20 overflow-hidden shadow-xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-white/20 bg-white/[0.01] text-[#8f8f8f] font-bold">
                  <th className="p-4">Invoice ID</th>
                  {activeMainTab === "receivables" ? (
                    <>
                      <th className="p-4">Brand / Campaign</th>
                      <th className="p-4 text-right">Expected Amount</th>
                    </>
                  ) : (
                    <>
                      <th className="p-4">Talent / Campaign</th>
                      <th className="p-4 text-right">Payout Amount</th>
                    </>
                  )}
                  <th className="p-4 text-center">Status</th>
                  <th className="p-4"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/[0.04]">
                {filteredInvoices.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="p-8 text-center text-[#8f8f8f]">
                      No invoices match the selected filter.
                    </td>
                  </tr>
                ) : (
                  filteredInvoices.map((inv) => {
                    const isAwaiting = inv.status === "awaiting_approval";

                    return (
                      <tr
                        key={inv.id}
                        onClick={() => router.push(`/agencydashboard/invoices/${inv.id}`)}
                        className="hover:bg-white/[0.02] cursor-pointer transition-colors group"
                      >
                        <td className="p-4 font-mono font-bold text-neutral-400">{inv.id}</td>
                        {activeMainTab === "receivables" ? (
                          <>
                            <td className="p-4">
                              <p className="text-white font-bold">{inv.brandName}</p>
                              <p className="text-[10px] text-neutral-500 mt-0.5">{inv.campaignName}</p>
                            </td>
                            <td className="p-4 text-right font-black text-white">
                              ${inv.amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                            </td>
                          </>
                        ) : (
                          <>
                            <td className="p-4">
                              <p className="text-white font-bold">{inv.splitPool.splits.find(s => s.role === "Talent")?.name || "Talent"}</p>
                              <p className="text-[10px] text-neutral-500 mt-0.5">{inv.campaignName}</p>
                            </td>
                            <td className="p-4 text-right font-black text-white">
                              ${(inv.splitPool.splits.find(s => s.role === "Talent")?.amount || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                            </td>
                          </>
                        )}
                        <td className="p-4 text-center">
                          {activeMainTab === "receivables" ? (
                            <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                              inv.status === "awaiting_approval" 
                                ? "bg-amber-950/60 text-amber-300 border border-amber-800/30 animate-pulse" 
                                : "bg-emerald-950/60 text-emerald-300 border border-emerald-800/30"
                            }`}>
                              {inv.status === "awaiting_approval" ? "Awaiting Brand" : "Settled"}
                            </span>
                          ) : (
                            <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                              inv.status !== "talent_disbursed"
                                ? "bg-amber-950/60 text-amber-300 border border-amber-800/30 animate-pulse" 
                                : "bg-emerald-950/60 text-emerald-300 border border-emerald-800/30"
                            }`}>
                              {inv.status !== "talent_disbursed" ? "Pending Payout" : "Disbursed"}
                            </span>
                          )}
                        </td>
                        <td className="p-4 text-right pr-6">
                          <ChevronRight className="h-4 w-4 text-neutral-600 group-hover:text-white transition-colors ml-auto" />
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

      {/* Footer */}
      <footer className="border-t border-white/20 bg-black py-8 text-xs text-neutral-400 mt-12">
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
