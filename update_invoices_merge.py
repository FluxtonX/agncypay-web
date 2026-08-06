import os

invoices_page_path = "src/app/branddashboard/invoices/page.tsx"
detail_page_path = "src/app/branddashboard/invoices/[invoiceId]/page.tsx"

merged_code = '''"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  Building2,
  ArrowLeft,
  Search,
  ChevronRight,
  LogOut,
  Sun,
  Moon,
  Home,
  RefreshCw,
  Calendar,
  CheckCircle2,
  Layers,
  Coins,
  ShieldCheck,
  MapPin,
  AlertTriangle,
  Clock,
  Info
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

export default function InvoicesQueuePage() {
  const router = useRouter();
  const { state, resetState } = useApp();
  const workspaceType = state.user ? state.user.accountType : "brand";

  const [isLightTheme, setIsLightTheme] = useState(false);
  const [invoices, setInvoices] = useState<InvoiceMock[]>([]);
  const [activeFilter, setActiveFilter] = useState<"all" | "awaiting_approval" | "settled">("awaiting_approval");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedInvoiceId, setSelectedInvoiceId] = useState<string | null>(null);
  const [processingStage, setProcessingStage] = useState<"idle" | "verifying" | "routing" | "success">("idle");

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
        document.documentElement.classList.add("light");
        document.documentElement.classList.remove("dark");
        setIsLightTheme(true);
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
          createdDate: new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }),
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
    const matchesFilter = activeFilter === "all" 
      ? true 
      : activeFilter === "settled"
      ? (inv.status === "settled" || inv.status === "talent_disbursed")
      : inv.status === activeFilter;
    const matchesSearch = inv.campaignName.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          inv.id.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  // Determine active invoice for top dashboard view
  const activeInvoice = invoices.find(inv => inv.id === selectedInvoiceId) ||
                        filteredInvoices[0] ||
                        invoices.find(inv => inv.status === "awaiting_approval") ||
                        invoices[0] ||
                        null;

  const handleApproveAndPay = () => {
    if (!activeInvoice || activeInvoice.status !== "awaiting_approval") return;
    
    const userEmail = state.user?.email || "guest";
    const queueKey = `brand_queue_invoices_${userEmail}`;
    const notifsKey = `agency_notifications_${userEmail}`;

    setProcessingStage("verifying");
    
    setTimeout(() => {
      setProcessingStage("routing");
      
      setTimeout(() => {
        setProcessingStage("success");
        
        setTimeout(() => {
          setInvoices(prev => {
            const next = prev.map(inv => 
              inv.id === activeInvoice.id ? { ...inv, status: "settled" as const } : inv
            );
            localStorage.setItem(queueKey, JSON.stringify(next));
            return next;
          });

          // Add notification
          const localNotifs = localStorage.getItem(notifsKey);
          const notifs = localNotifs ? JSON.parse(localNotifs) : [];
          const newNotif = {
            id: `notif-${Date.now()}`,
            message: `Brand approved & paid main invoice for ${activeInvoice.campaignName} ($${activeInvoice.amount.toLocaleString(undefined, { minimumFractionDigits: 2 })})`,
            timestamp: "Just now",
            unread: true,
          };
          localStorage.setItem(notifsKey, JSON.stringify([newNotif, ...notifs]));

          setProcessingStage("idle");
          window.dispatchEvent(new Event("syncBrandDashboard"));
        }, 1200);
      }, 1500);
    }, 1200);
  };

  return (
    <main className="min-h-screen bg-background text-foreground flex flex-col font-sans antialiased relative transition-colors duration-200">
      <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-white/[0.01] rounded-full blur-[100px] pointer-events-none" />

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
              className="px-4 py-1.5 rounded-full text-xs font-bold bg-white light:bg-[#0F172A] text-black light:text-white shadow-sm border border-white/20 light:border-black/10 transition-all cursor-pointer"
            >
              Invoice Queue
            </button>
            <button 
              onClick={() => router.push("/branddashboard/nodes")}
              className="px-4 py-1.5 rounded-full text-xs font-semibold text-[#8f8f8f] light:text-[#475569] hover:text-white light:hover:text-[#0F172A] transition-all cursor-pointer"
            >
              Rewards
            </button>
          </nav>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-full bg-white/[0.05] border border-white/20 flex items-center justify-center font-bold text-xs text-white">
                {state.user?.fullName ? state.user.fullName.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2) : "AD"}
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
      <div className="max-w-[1520px] w-full mx-auto px-6 py-8 flex-1 flex flex-col gap-8">
        
        {/* TOP SECTION: ACTIVE INVOICE BILLING DASHBOARD */}
        {activeInvoice && (
          <div className="space-y-6">
            {/* Address & Campaign Hub Bar */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-[#050505] p-4 rounded-xl border border-white/20 shadow-lg">
              <div className="flex flex-wrap items-baseline gap-2 text-white">
                <h2 className="text-xl font-bold tracking-tight text-white">{activeInvoice.location},</h2>
                <span className="text-xl font-extrabold text-[#4B6BFB]">{activeInvoice.costCenter}</span>
                <span className="text-xs font-bold uppercase tracking-wider text-[#8f8f8f]/60 ml-2">
                  {activeInvoice.brandName} • {activeInvoice.id}
                </span>
              </div>

              <div className="flex items-center gap-1.5 bg-white/[0.03] p-1 rounded-full border border-white/20">
                <div className="px-4 py-1.5 rounded-full text-xs font-bold bg-[#111111] border border-white/20 text-white flex items-center gap-1.5">
                  <Home className="h-3.5 w-3.5 text-[#4B6BFB]" />
                  Campaign Hub
                </div>
              </div>
            </div>

            {/* 2-Column Grid: Left (7 cols) Balance Due, Right (5 cols) Direct Vendor Payment */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              
              {/* Balance Due Card */}
              <div className="lg:col-span-7 bg-[#050505] rounded-2xl border border-white/20 p-6 md:p-8 flex flex-col justify-between shadow-xl relative overflow-hidden">
                <div className="absolute top-0 right-0 p-4 flex gap-2">
                  <button className="p-1.5 rounded-lg bg-white/[0.03] hover:bg-white/[0.08] border border-white/20">
                    <RefreshCw className="h-3.5 w-3.5 text-[#8f8f8f]" />
                  </button>
                </div>

                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                  <div>
                    <span className="text-xs font-bold text-[#8f8f8f] uppercase tracking-wider block">Balance due</span>
                    <span className="text-4xl md:text-5xl font-black text-white tracking-tight mt-1.5 block">
                      ${activeInvoice.amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </span>
                    <div className="mt-4 flex items-center gap-2 text-xs text-neutral-400">
                      <Calendar className="h-4 w-4 text-[#8f8f8f]" />
                      <span>Due: {activeInvoice.dueDate}</span>
                    </div>
                  </div>

                  {/* Approve & Pay Action Button */}
                  <div className="w-full md:w-auto shrink-0 min-w-[220px]">
                    <AnimatePresence mode="wait">
                      {processingStage === "idle" && (
                        <button
                          onClick={handleApproveAndPay}
                          disabled={activeInvoice.status !== "awaiting_approval"}
                          className={`w-full h-12 px-6 rounded-xl text-xs font-black shadow-sm flex items-center justify-center gap-2 transition-all cursor-pointer ${
                            activeInvoice.status === "awaiting_approval"
                              ? "bg-white text-black hover:bg-neutral-200 shadow-white/10 shadow-lg"
                              : "bg-emerald-600 text-white cursor-default"
                          }`}
                        >
                          {activeInvoice.status === "awaiting_approval" ? (
                            <>
                              Approve & Pay Invoice
                              <ChevronRight className="h-4 w-4" />
                            </>
                          ) : (
                            <>
                              <CheckCircle2 className="h-4.5 w-4.5 text-white" />
                              Approved & Settled
                            </>
                          )}
                        </button>
                      )}

                      {processingStage !== "idle" && (
                        <div className="w-full h-12 px-6 rounded-xl border border-white/20 bg-[#0A0A0A] text-[10px] font-bold text-[#8f8f8f] flex items-center justify-center gap-3 shadow-inner">
                          <RefreshCw className="h-4 w-4 animate-spin text-[#4B6BFB]" />
                          {processingStage === "verifying" && "Verifying corporate treasury..."}
                          {processingStage === "routing" && "Auto-routing splits..."}
                          {processingStage === "success" && "Settlement complete!"}
                        </div>
                      )}
                    </AnimatePresence>
                  </div>
                </div>

                {/* Sub-details Rows */}
                <div className="mt-8 pt-6 border-t border-white/20 space-y-4 text-xs">
                  <div className="flex justify-between items-center py-1">
                    <span className="text-[#8f8f8f] font-semibold flex items-center gap-2">
                      <Layers className="h-4 w-4 text-neutral-500" />
                      Auto-split Settlement Routing
                    </span>
                    <span className="font-bold text-emerald-400 bg-emerald-950/40 px-2.5 py-0.5 rounded border border-emerald-800/20 text-[10px] uppercase">
                      Active
                    </span>
                  </div>

                  <div className="flex justify-between items-center py-1">
                    <span className="text-[#8f8f8f] font-semibold flex items-center gap-2">
                      <Coins className="h-4 w-4 text-neutral-500" />
                      Liquidity Guarantee (Net-0 Advance Payout)
                    </span>
                    <span className="font-bold text-[#4B6BFB] bg-[#4B6BFB]/10 px-2.5 py-0.5 rounded border border-[#4B6BFB]/20 text-[10px] uppercase">
                      Eligible
                    </span>
                  </div>

                  <div className="flex justify-between items-center py-1">
                    <span className="text-[#8f8f8f] font-semibold flex items-center gap-2">
                      <ShieldCheck className="h-4 w-4 text-neutral-500" />
                      Consolidated Processing Fee
                    </span>
                    <span className="font-bold text-neutral-300 text-[10px] uppercase">
                      $0 ACH Fee (Consolidated Rail)
                    </span>
                  </div>
                </div>
              </div>

              {/* Direct Vendor Payment Card */}
              <div className="lg:col-span-5 bg-[#050505] rounded-2xl border border-white/20 p-6 md:p-8 shadow-xl flex flex-col justify-between space-y-6">
                <div>
                  <div className="flex justify-between items-center border-b border-white/20 pb-3">
                    <div className="flex items-center gap-2">
                      <h4 className="text-xs font-black text-[#8f8f8f] uppercase tracking-wider">Direct Vendor Payment</h4>
                      <span className="text-[10px] text-neutral-500 font-semibold">(Direct flat rate billing)</span>
                    </div>
                    <span className="text-[10px] text-neutral-500 font-bold">1 Node</span>
                  </div>

                  <div className="mt-4">
                    <div className="p-4 bg-black border border-white/20 rounded-xl relative overflow-hidden">
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-center gap-3 min-w-0">
                          <img
                            src={activeInvoice.vendorFee.avatar}
                            alt={activeInvoice.vendorFee.name}
                            className="h-10 w-10 rounded-lg object-cover border border-white/20 bg-[#111] shrink-0"
                          />
                          <div className="min-w-0">
                            <p className="text-xs font-bold text-white truncate">{activeInvoice.vendorFee.name}</p>
                            <p className="text-[10px] text-neutral-500 font-mono">{activeInvoice.vendorFee.walletId}</p>
                          </div>
                        </div>
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-amber-950/60 text-amber-300 border border-amber-800/30 shrink-0 uppercase tracking-wider">
                          Vendor
                        </span>
                      </div>

                      <div className="mt-4 flex justify-between items-baseline pt-2 border-t border-white/10">
                        <span className="text-xs font-semibold text-neutral-400">Direct Production Fee</span>
                        <span className="text-lg font-black text-white">
                          ${activeInvoice.vendorFee.amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Agency & Talent splits (if applicable) */}
                {workspaceType === "agency" && (
                  <div className="pt-2">
                    <div className="flex justify-between items-center border-b border-white/20 pb-2">
                      <div className="flex items-center gap-2">
                        <h4 className="text-xs font-black text-[#8f8f8f] uppercase tracking-wider">Agency & Talent Split</h4>
                      </div>
                      <span className="text-[10px] text-neutral-500 font-bold">2 Nodes</span>
                    </div>

                    <div className="mt-3 grid grid-cols-1 gap-3">
                      {activeInvoice.splitPool.splits.map((split) => (
                        <div
                          key={split.name}
                          className="p-3 bg-black border border-white/20 rounded-xl relative overflow-hidden flex items-center justify-between"
                        >
                          <div className="flex items-center gap-2.5 min-w-0">
                            <img
                              src={split.avatar}
                              alt={split.name}
                              className="h-8 w-8 rounded-lg object-cover border border-white/20 bg-[#111] shrink-0"
                            />
                            <div className="min-w-0">
                              <p className="text-xs font-bold text-white truncate">{split.name}</p>
                              <p className="text-[10px] text-neutral-500 font-mono">{split.percentage}% Share</p>
                            </div>
                          </div>
                          <span className="text-sm font-black text-white">
                            ${split.amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

            </div>
          </div>
        )}

        {/* BOTTOM SECTION: INVOICE LIST & APPROVAL QUEUE */}
        <div className="space-y-4 pt-4 border-t border-white/10">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h3 className="text-xl font-bold tracking-tight text-white">Invoice Approval Manager</h3>
              <p className="text-xs text-[#8f8f8f] mt-1">Select an invoice below to load its billing dashboard and execute payments above.</p>
            </div>
          </div>

          {/* Search & Tabs Controls */}
          <div className="flex flex-col md:flex-row gap-4 justify-between items-stretch md:items-center bg-[#050505] p-3 rounded-xl border border-white/20 shadow-md">
            <div className="flex flex-wrap gap-2">
              {[
                { id: "all", label: "All Invoices" },
                { id: "awaiting_approval", label: "Awaiting Approval" },
                { id: "settled", label: "Settled" }
              ].map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveFilter(tab.id as any)}
                  className={`px-4 py-2 rounded-lg text-xs font-semibold tracking-tight transition-all cursor-pointer ${
                    activeFilter === tab.id
                      ? "bg-white text-black font-bold shadow-sm"
                      : "text-[#8f8f8f] hover:text-white bg-transparent hover:bg-white/[0.02]"
                  }`}
                >
                  {tab.label}
                  {tab.id === "awaiting_approval" && (
                    <span className="ml-1.5 px-1.5 py-0.5 rounded bg-[#4B6BFB]/10 text-[#4B6BFB] text-[10px] font-bold">
                      {invoices.filter(i => i.status === "awaiting_approval").length}
                    </span>
                  )}
                </button>
              ))}
            </div>

            <div className="relative md:w-80">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#8f8f8f]" />
              <input
                type="text"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="Search campaign, invoice ID..."
                className="w-full h-9 bg-black border border-white/20 focus:border-white/40 rounded-lg pl-9 pr-4 text-xs outline-none placeholder:text-neutral-600 transition-colors text-white"
              />
            </div>
          </div>

          {/* Invoices List Table */}
          <div className="bg-[#050505] rounded-2xl border border-white/20 overflow-hidden shadow-xl">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-white/20 bg-white/[0.01] text-[#8f8f8f] font-bold">
                    <th className="p-4">Invoice ID</th>
                    <th className="p-4">Campaign / Project Name</th>
                    <th className="p-4">Billing Office Location</th>
                    <th className="p-4">Cost Center</th>
                    <th className="p-4 text-right">Invoice Amount</th>
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
                      const isSelected = activeInvoice?.id === inv.id;

                      return (
                        <tr
                          key={inv.id}
                          onClick={() => setSelectedInvoiceId(inv.id)}
                          className={`cursor-pointer transition-all group ${
                            isSelected
                              ? "bg-white/[0.07] border-l-4 border-l-[#4B6BFB]"
                              : "hover:bg-white/[0.02]"
                          }`}
                        >
                          <td className="p-4 font-mono font-bold text-neutral-300">
                            {inv.id}
                            {isSelected && <span className="ml-2 text-[9px] text-[#4B6BFB] font-bold uppercase">(Active)</span>}
                          </td>
                          <td className="p-4">
                            <p className="text-white font-bold">{inv.campaignName}</p>
                            <p className="text-[10px] text-neutral-500 mt-0.5">{inv.brandName}</p>
                          </td>
                          <td className="p-4 text-neutral-300">{inv.location}</td>
                          <td className="p-4 text-neutral-400 font-mono">{inv.costCenter}</td>
                          <td className="p-4 text-right font-black text-white">
                            ${inv.amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                          </td>
                          <td className="p-4 text-center">
                            <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                              isAwaiting 
                                ? "bg-amber-950/60 text-amber-300 border border-amber-800/30 animate-pulse" 
                                : "bg-emerald-950/60 text-emerald-300 border border-emerald-800/30"
                            }`}>
                              {isAwaiting ? "Awaiting Approval" : "Settled"}
                            </span>
                          </td>
                          <td className="p-4 text-right pr-6">
                            <ChevronRight className={`h-4 w-4 transition-transform ml-auto ${isSelected ? "text-[#4B6BFB] translate-x-1" : "text-neutral-600 group-hover:text-white"}`} />
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
'''

with open(invoices_page_path, "w") as f:
    f.write(merged_code)

print("Merged invoices page written successfully!")

# Now redirect detail_page_path to /branddashboard/invoices
detail_redirect_code = '''import { redirect } from "next/navigation";

export default function InvoiceDetailPage() {
  redirect("/branddashboard/invoices");
}
'''

with open(detail_page_path, "w") as f:
    f.write(detail_redirect_code)

print("Detail page redirected successfully!")
