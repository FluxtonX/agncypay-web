"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  Building2,
  Sparkles,
  ArrowLeft,
  Coins,
  Layers,
  ShieldCheck,
  Clock,
  CheckCircle2,
  HelpCircle,
  ChevronRight,
  LogOut,
  Calendar,
  X,
  RefreshCw,
  Info,
  Home,
  Search,
  MapPin,
  ArrowUpRight,
  Flame,
  CreditCard,
  Percent,
  TrendingUp,
  AlertTriangle,
  FileText,
  Users
} from "lucide-react";
import { useApp } from "../../../../context/AppContext";

// Types
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

const INITIAL_INVOICES: InvoiceMock[] = [
  {
    id: "AP-INV-9024",
    campaignName: "Adidas Originals TikTok Launch",
    brandName: "Adidas AG",
    createdDate: "July 12, 2026",
    dueDate: "August 11, 2026",
    amount: 18500.00,
    defaultTerm: "Net-30",
    status: "awaiting_approval",
    location: "5th Ave Flagship Plaza, NYC",
    costCenter: "#TikTok-2026",
    initials: ["MC", "IM", "LS"],
    vendorFee: {
      name: "Lumina Production Studios",
      role: "Vendor",
      amount: 1850.00,
      walletId: "@lumina.studios",
      avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=80&auto=format&fit=crop&q=80"
    },
    splitPool: {
      total: 16650.00,
      splits: [
        { name: "Maya Chen", role: "Talent", percentage: 80, amount: 13320.00, walletId: "@maya.chen.wallet", avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=80&auto=format&fit=crop&q=80" },
        { name: "IMG Models Worldwide", role: "Agency", percentage: 20, amount: 3330.00, walletId: "@img.models.agency", avatar: "https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?w=80&auto=format&fit=crop&q=80" }
      ]
    }
  },
  {
    id: "AP-INV-8911",
    campaignName: "Fall/Winter Editorial Shoots",
    brandName: "Adidas AG",
    createdDate: "July 10, 2026",
    dueDate: "September 8, 2026",
    amount: 32000.00,
    defaultTerm: "Net-60",
    status: "awaiting_approval",
    location: "World Headquarters, Portland",
    costCenter: "#FW-Editorial",
    initials: ["NR", "UM", "FR"],
    vendorFee: {
      name: "Frame Rental Co",
      role: "Vendor",
      amount: 3200.00,
      walletId: "@framerent",
      avatar: "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=80&auto=format&fit=crop&q=80"
    },
    splitPool: {
      total: 28800.00,
      splits: [
        { name: "Noah Rivera", role: "Talent", percentage: 85, amount: 24480.00, walletId: "@noah.rivera.wallet", avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=80&auto=format&fit=crop&q=80" },
        { name: "UTA Models", role: "Agency", percentage: 15, amount: 4320.00, walletId: "@uta.talent.agency", avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=80&auto=format&fit=crop&q=80" }
      ]
    }
  },
  {
    id: "AP-INV-8854",
    campaignName: "UltraBoost 26 Social Campaign",
    brandName: "Adidas AG",
    createdDate: "June 28, 2026",
    dueDate: "August 27, 2026",
    amount: 45000.00,
    defaultTerm: "Net-60",
    status: "settled",
    location: "Santa Monica Office, CA",
    costCenter: "#UB-Social",
    initials: ["JL", "CA", "SS"],
    vendorFee: {
      name: "SoundStage NY",
      role: "Vendor",
      amount: 2250.00,
      walletId: "@soundstage",
      avatar: "https://images.unsplash.com/photo-1537368910025-700350fe46c7?w=80&auto=format&fit=crop&q=80"
    },
    splitPool: {
      total: 42750.00,
      splits: [
        { name: "Jordan Lee", role: "Talent", percentage: 85, amount: 36337.50, walletId: "@jordan.lee", avatar: "https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?w=80&auto=format&fit=crop&q=80" },
        { name: "Creative Artists Agency (CAA)", role: "Agency", percentage: 15, amount: 6412.50, walletId: "@caa", avatar: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=80&auto=format&fit=crop&q=80" }
      ]
    }
  }
];

interface PageProps {
  params: Promise<{ invoiceId: string }>;
}

export default function InvoiceDetailPage({ params }: PageProps) {
  const router = useRouter();
  const { invoiceId } = React.use(params);
  const { state, resetState } = useApp();
  const workspaceType = state.user ? state.user.accountType : "brand";

  const [invoices, setInvoices] = useState<InvoiceMock[]>([]);
  const [selectedTerm, setSelectedTerm] = useState<"Net-30" | "Net-60" | "Net-90">("Net-30");
  const [instantPayoutEnabled, setInstantPayoutEnabled] = useState<boolean>(true);

  // Simulation processing state
  const [processingStage, setProcessingStage] = useState<"idle" | "verifying" | "routing" | "success">("idle");

  const activeInvoice = invoices.find(inv => inv.id === invoiceId) || invoices[0] || INITIAL_INVOICES[0];

  React.useEffect(() => {
    const localQueue = localStorage.getItem("brand_queue_invoices");
    if (localQueue) {
      setInvoices(JSON.parse(localQueue));
    } else {
      setInvoices(INITIAL_INVOICES);
      localStorage.setItem("brand_queue_invoices", JSON.stringify(INITIAL_INVOICES));
    }

    const syncStates = () => {
      const localQueue = localStorage.getItem("brand_queue_invoices");
      if (localQueue) setInvoices(JSON.parse(localQueue));
    };

    window.addEventListener("storage", syncStates);
    window.addEventListener("syncBrandDashboard", syncStates);

    return () => {
      window.removeEventListener("storage", syncStates);
      window.removeEventListener("syncBrandDashboard", syncStates);
    };
  }, []);

  React.useEffect(() => {
    if (activeInvoice) {
      setSelectedTerm(activeInvoice.defaultTerm);
    }
  }, [activeInvoice]);

  const handleApproveAndPay = () => {
    if (activeInvoice.status !== "awaiting_approval") return;
    
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
            localStorage.setItem("brand_queue_invoices", JSON.stringify(next));
            return next;
          });

          // Add to paid stats
          const amt = activeInvoice.amount;
          const savedVolume = localStorage.getItem("brand_stats_paid_volume");
          const v = savedVolume ? parseFloat(savedVolume) : 424500.00;
          localStorage.setItem("brand_stats_paid_volume", (v + amt).toString());

          const savedSavings = localStorage.getItem("brand_stats_autosplit_savings");
          const s = savedSavings ? parseFloat(savedSavings) : 4250.00;
          localStorage.setItem("brand_stats_autosplit_savings", (s + amt * 0.015).toString());

          // Add notification
          const localNotifs = localStorage.getItem("agency_notifications");
          const notifs = localNotifs ? JSON.parse(localNotifs) : [];
          const newNotif = {
            id: `notif-${Date.now()}`,
            message: `Brand approved & paid main invoice for ${activeInvoice.campaignName} ($${activeInvoice.amount.toLocaleString(undefined, { minimumFractionDigits: 2 })})`,
            timestamp: "Just now",
            unread: true,
          };
          localStorage.setItem("agency_notifications", JSON.stringify([newNotif, ...notifs]));

          setProcessingStage("idle");
          window.dispatchEvent(new Event("syncBrandDashboard"));
        }, 1200);
      }, 1500);
    }, 1200);
  };

  const handleLogout = () => {
    resetState();
    router.push("/auth/login");
  };

  return (
    <main className="min-h-screen bg-[#000000] text-white flex flex-col font-sans antialiased selection:bg-white selection:text-black relative pb-12">
      <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-white/[0.01] rounded-full blur-[100px] pointer-events-none" />

      {/* Header */}
      <header className="border-b border-white/20 bg-black/90 sticky top-0 z-50 shadow-sm backdrop-blur">
        <div className="max-w-[1520px] mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-6">
            <div className="relative flex items-center mr-12">
              <Link href="/branddashboard" className="flex items-center">
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
              Corporate Portal
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
              className="px-4 py-1.5 rounded-full text-xs font-semibold bg-white text-black shadow-sm transition-all cursor-pointer"
            >
              {workspaceType === "brand" ? "Invoice Queue" : "Sent Invoices"}
            </button>
            <button className="px-4 py-1.5 rounded-full text-xs font-semibold text-[#8f8f8f] hover:text-white transition-all">
              {workspaceType === "brand" ? "Settlement Nodes" : "Payout Split Nodes"}
            </button>
            <button className="px-4 py-1.5 rounded-full text-xs font-semibold text-[#8f8f8f] hover:text-white transition-all">
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
                {state.user?.fullName ? state.user.fullName.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2) : "AD"}
              </div>
              <span className="text-xs font-bold text-[#E5E5EA] hidden sm:inline">
                {state.workspaces.find(w => w.id === state.activeWorkspaceId)?.name || state.user?.fullName || "Adidas Corporate"}
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

      {/* Main Workspace (Strictly Styled after the Bilt layout) */}
      <div className="max-w-[1520px] w-full mx-auto px-6 mt-8 flex-1 flex flex-col gap-6">
        
        {/* Dynamic Navigation Row (Like Bilt Address & Home Selector) */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          
          {/* Top Address & Cost Center (e.g. 829 Baker Street, #4B) */}
          <div className="flex flex-wrap items-baseline gap-2 text-white">
            <Link href="/branddashboard/invoices" className="hover:opacity-80 transition-opacity">
              <ArrowLeft className="h-5 w-5 inline-block mr-2 -mt-1 text-[#8f8f8f]" />
            </Link>
            <h2 className="text-xl font-bold tracking-tight text-white">{activeInvoice.location},</h2>
            <span className="text-xl font-extrabold text-[#4B6BFB]">{activeInvoice.costCenter}</span>
            <span className="text-xs font-bold uppercase tracking-wider text-[#8f8f8f]/60 ml-2">
              {activeInvoice.brandName}
            </span>
          </div>

          {/* Right Selector Pills (Mirroring "My Home" and "Find a Home") */}
          <div className="flex items-center gap-1.5 bg-white/[0.03] p-1 rounded-full border border-white/20">
            <button className="px-4 py-1.5 rounded-full text-xs font-bold bg-[#111111] border border-white/20 text-white flex items-center gap-1.5">
              <Home className="h-3.5 w-3.5 text-[#4B6BFB]" />
              Campaign Hub
            </button>
            <button 
              onClick={() => router.push("/branddashboard/invoices")}
              className="px-4 py-1.5 rounded-full text-xs font-bold text-[#8f8f8f] hover:text-white flex items-center gap-1.5 cursor-pointer transition-colors"
            >
              <Search className="h-3.5 w-3.5" />
              All Invoices
            </button>
          </div>
        </div>

        {/* Core Layout Grid (Left: 8 columns, Right: 4 columns) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mt-4">
          
          {/* Left Column: Balance Due & Auto-Splits */}
          <div className="lg:col-span-8 space-y-6">
            
            {/* Balance Due Card (Mirroring Bilt Card) */}
            <div className="bg-[#050505] rounded-2xl border border-white/20 p-6 md:p-8 flex flex-col justify-between shadow-xl relative overflow-hidden">
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

                {/* Main Action Button ("Approve & Pay" / "Make a payment") */}
                <div className="w-full md:w-auto shrink-0 min-w-[200px]">
                  <AnimatePresence mode="wait">
                    {processingStage === "idle" && (
                      <button
                        onClick={handleApproveAndPay}
                        disabled={activeInvoice.status !== "awaiting_approval"}
                        className={`w-full h-12 px-6 rounded-xl text-xs font-black shadow-sm flex items-center justify-center gap-2 transition-all cursor-pointer ${
                          activeInvoice.status === "awaiting_approval"
                            ? "bg-white text-black hover:bg-neutral-200"
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

              {/* Bilt-Style Sub-details Rows (Translated to corporate finance details) */}
              <div className="mt-8 pt-6 border-t border-white/20 space-y-4 text-xs">
                
                {/* Row 1: Autopay / Auto-split Settlement */}
                <div className="flex justify-between items-center py-1">
                  <span className="text-[#8f8f8f] font-semibold flex items-center gap-2">
                    <Layers className="h-4 w-4 text-neutral-500" />
                    Auto-split Settlement Routing
                  </span>
                  <span className="font-bold text-emerald-400 bg-emerald-950/40 px-2 py-0.5 rounded border border-emerald-800/20 text-[10px] uppercase">
                    Active
                  </span>
                </div>

                {/* Row 2: Credit Boost / Liquidity Guarantee */}
                <div className="flex justify-between items-center py-1">
                  <span className="text-[#8f8f8f] font-semibold flex items-center gap-2">
                    <Coins className="h-4 w-4 text-neutral-500" />
                    Liquidity Guarantee (Net-0 Advance Payout)
                  </span>
                  <span className="font-bold text-[#4B6BFB] bg-[#4B6BFB]/10 px-2 py-0.5 rounded border border-[#4B6BFB]/20 text-[10px] uppercase">
                    Eligible
                  </span>
                </div>

                {/* Row 3: Pay with Points / Fee Consolidation Savings */}
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

            {/* Auto-Split details section (Below balance card) */}
            <div className="bg-[#050505] rounded-2xl border border-white/20 p-6 shadow-xl space-y-6">
              
              {/* Direct Vendor Payment */}
              <div>
                <div className="flex justify-between items-center border-b border-white/20 pb-2">
                  <div className="flex items-center gap-2">
                    <h4 className="text-xs font-black text-[#8f8f8f] uppercase tracking-wider">Direct Vendor Payment</h4>
                    <span className="text-[10px] text-neutral-500 font-semibold">(Direct flat rate billing)</span>
                  </div>
                  <span className="text-[10px] text-neutral-500 font-bold">1 Node</span>
                </div>

                <div className="mt-3 max-w-sm">
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

                    <div className="mt-4 flex justify-between items-baseline">
                      <span className="text-xs font-semibold text-neutral-400">Direct Production Fee</span>
                      <span className="text-base font-black text-white">
                        ${activeInvoice.vendorFee.amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Agency & Talent splits */}
              {workspaceType === "agency" && (
                <div>
                  <div className="flex justify-between items-center border-b border-white/20 pb-2">
                    <div className="flex items-center gap-2">
                      <h4 className="text-xs font-black text-[#8f8f8f] uppercase tracking-wider">Agency & Talent Split</h4>
                      <span className="text-[10px] text-neutral-500 font-semibold">
                        (Remaining Pool: ${activeInvoice.splitPool.total.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })})
                      </span>
                    </div>
                    <span className="text-[10px] text-neutral-500 font-bold">2 Nodes</span>
                  </div>

                  <div className="mt-3 grid grid-cols-1 md:grid-cols-2 gap-4">
                    {activeInvoice.splitPool.splits.map((split) => (
                      <div
                        key={split.name}
                        className="p-4 bg-black border border-white/20 rounded-xl relative overflow-hidden group"
                      >
                        <div 
                          className="absolute bottom-0 left-0 h-1 bg-gradient-to-r from-[#4B6BFB] to-purple-600 transition-all duration-500"
                          style={{ width: activeInvoice.status === "settled" ? `${split.percentage}%` : "0%" }}
                        />

                        <div className="flex items-start justify-between gap-3">
                          <div className="flex items-center gap-3 min-w-0">
                            <img
                              src={split.avatar}
                              alt={split.name}
                              className="h-10 w-10 rounded-lg object-cover border border-white/20 bg-[#111] shrink-0"
                            />
                            <div className="min-w-0">
                              <p className="text-xs font-bold text-white truncate">{split.name}</p>
                              <p className="text-[10px] text-neutral-500 font-mono">{split.walletId}</p>
                            </div>
                          </div>
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded shrink-0 uppercase tracking-wider ${
                            split.role === "Talent" 
                              ? "bg-purple-950/60 text-purple-300 border border-purple-800/30" 
                              : "bg-blue-950/60 text-blue-300 border border-blue-800/30"
                          }`}>
                            {split.role}
                          </span>
                        </div>

                        <div className="mt-4 flex justify-between items-baseline">
                          <span className="text-xs font-semibold text-neutral-400">
                            {split.percentage}% Share
                          </span>
                          <span className="text-base font-black text-white">
                            ${split.amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

            </div>
          </div>

          {/* Right Column: Routing Map Card & Campaign Detail Card (Strictly Matching Bilt Style) */}
          <div className="lg:col-span-4 space-y-6">
            
            {/* Neighborhood / Node Map Card */}
            <div className="bg-[#050505] rounded-2xl border border-white/20 p-5 shadow-xl">
              <h3 className="text-xs font-black uppercase tracking-wider text-[#8f8f8f] pb-3 border-b border-white/20">
                Settlement Node Network Map
              </h3>

              <div className="mt-4 h-48 rounded-xl border border-white/20 bg-black relative overflow-hidden flex flex-col justify-end p-4 shadow-inner">
                {/* Dot grid */}
                <div className="absolute inset-0 bg-[radial-gradient(rgba(255,255,255,0.05)_1px,transparent_1px)] [background-size:16px_16px] opacity-70" />

                {/* Network routes */}
                <svg className="absolute inset-0 h-full w-full pointer-events-none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M 50 50 L 150 100 L 250 60" fill="none" stroke="#4B6BFB" strokeWidth="1.5" strokeDasharray="4 4" className="animate-[dash_10s_linear_infinite]" />
                  <path d="M 150 100 L 80 150" fill="none" stroke="#a855f7" strokeWidth="1.5" strokeDasharray="4 4" className="animate-[dash_8s_linear_infinite]" />
                </svg>

                {/* Nodes */}
                <div className="absolute top-10 left-12 flex flex-col items-center">
                  <div className="h-6 w-6 rounded-full bg-[#4B6BFB] border-2 border-white flex items-center justify-center text-[8px] font-black text-white shadow">
                    NY
                  </div>
                  <span className="text-[8px] font-bold text-[#8f8f8f] mt-1">Brand</span>
                </div>

                <div className="absolute top-20 right-16 flex flex-col items-center">
                  <div className="h-6 w-6 rounded-full bg-purple-500 border-2 border-white flex items-center justify-center text-[8px] font-black text-white shadow">
                    LDN
                  </div>
                  <span className="text-[8px] font-bold text-[#8f8f8f] mt-1">Talent</span>
                </div>

                <div className="absolute bottom-10 left-16 flex flex-col items-center">
                  <div className="h-6 w-6 rounded-full bg-emerald-500 border-2 border-white flex items-center justify-center text-[8px] font-black text-white shadow">
                    PAR
                  </div>
                  <span className="text-[8px] font-bold text-[#8f8f8f] mt-1">Agency</span>
                </div>

                <div className="relative z-10 bg-[#0A0A0A] border border-white/20 rounded-lg p-2.5 shadow-sm text-[11px] text-center">
                  <span className="font-bold text-white flex items-center justify-center gap-1.5">
                    <MapPin className="h-3.5 w-3.5 text-[#4B6BFB]" />
                    Explore Settlement Routes
                  </span>
                </div>
              </div>
            </div>

            {/* Campaign/Apartment detail card (Mirroring Bilt Apartment #4B card) */}
            <div className="bg-[#050505] rounded-2xl border border-white/20 p-6 shadow-xl flex flex-col items-center text-center">
              <span className="text-xs font-bold text-[#8f8f8f] uppercase tracking-wider">Campaign Cost Center</span>
              <span className="text-3xl font-extrabold text-white mt-1.5 tracking-tight">{activeInvoice.costCenter}</span>

              {/* occupancy Initials List (Mirroring Bilt initials "AD AJ JM") */}
              <div className="flex gap-2.5 mt-4">
                {activeInvoice.initials.map((init, idx) => (
                  <div 
                    key={idx}
                    className="h-9 w-9 rounded-full bg-white/[0.05] border border-white/20 flex items-center justify-center text-xs font-black text-white shadow-sm"
                    title={`Payee Node Initials: ${init}`}
                  >
                    {init}
                  </div>
                ))}
              </div>

              {/* Billing Period (Mirroring lease dates Dec 4, 2025 - Dec 6, 2026) */}
              <div className="flex items-center gap-1.5 text-xs text-neutral-400 mt-5 font-semibold">
                <Calendar className="h-3.5 w-3.5 text-[#8f8f8f]" />
                <span>{activeInvoice.createdDate} - {activeInvoice.dueDate}</span>
              </div>

              {/* Three Stacked Buttons (Mirroring maintenance request, book amenity, lease details) */}
              <div className="w-full mt-6 space-y-2.5">
                {workspaceType === "brand" ? (
                  <>
                    {/* Button 1: Dispute Invoice */}
                    <button className="w-full py-2.5 rounded-xl bg-white/[0.03] hover:bg-white/[0.06] border border-white/20 hover:border-white/20 text-xs font-bold text-neutral-200 transition-all flex items-center justify-center gap-2">
                      <AlertTriangle className="h-3.5 w-3.5 text-[#8f8f8f]" />
                      Dispute Invoice
                    </button>

                    {/* Button 2: Schedule Audit */}
                    <button className="w-full py-2.5 rounded-xl bg-white/[0.03] hover:bg-white/[0.06] border border-white/20 hover:border-white/20 text-xs font-bold text-neutral-200 transition-all flex items-center justify-center gap-2">
                      <Clock className="h-3.5 w-3.5 text-[#8f8f8f]" />
                      Schedule Compliance Audit
                    </button>

                    {/* Button 3: View Contract */}
                    <button className="w-full py-2.5 rounded-xl bg-white/[0.03] hover:bg-white/[0.06] border border-white/20 hover:border-white/20 text-xs font-bold text-neutral-200 transition-all flex items-center justify-center gap-2">
                      <FileText className="h-3.5 w-3.5 text-[#8f8f8f]" />
                      View Campaign Contract
                    </button>
                  </>
                ) : (
                  <>
                    {/* Button 1: Export Payout Ledger */}
                    <button className="w-full py-2.5 rounded-xl bg-white/[0.03] hover:bg-white/[0.06] border border-white/20 hover:border-white/20 text-xs font-bold text-neutral-200 transition-all flex items-center justify-center gap-2">
                      <FileText className="h-3.5 w-3.5 text-[#8f8f8f]" />
                      Export Payout Ledger
                    </button>

                    {/* Button 2: Message Client Account */}
                    <button className="w-full py-2.5 rounded-xl bg-white/[0.03] hover:bg-white/[0.06] border border-white/20 hover:border-white/20 text-xs font-bold text-neutral-200 transition-all flex items-center justify-center gap-2">
                      <Users className="h-3.5 w-3.5 text-[#8f8f8f]" />
                      Message Client Account
                    </button>

                    {/* Button 3: Dispute Resolution Center */}
                    <button className="w-full py-2.5 rounded-xl bg-white/[0.03] hover:bg-white/[0.06] border border-white/20 hover:border-white/20 text-xs font-bold text-neutral-200 transition-all flex items-center justify-center gap-2">
                      <AlertTriangle className="h-3.5 w-3.5 text-[#8f8f8f]" />
                      Dispute Resolution Center
                    </button>
                  </>
                )}
              </div>
            </div>

          </div>
        </div>

      </div>
    </main>
  );
}
