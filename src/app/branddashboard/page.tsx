"use client";

import React, { useState, useEffect } from "react";
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
  ArrowRight,
  TrendingUp,
  Users,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  FileText,
  DollarSign,
  ChevronRight,
  User,
  LogOut,
  Calendar,
  Lock,
  ArrowUpRight,
  MapPin,
  RefreshCw,
  Search
} from "lucide-react";
import { useApp } from "../../context/AppContext";

// Refactored Data Models
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
  vendorFee: VendorItem;
  splitPool: {
    total: number;
    splits: SplitItem[];
  };
  status: "awaiting_approval" | "processing" | "settled" | "rejected";
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

const RECENT_TRANSACTIONS = [
  { id: "AP-TX-5091", invoiceId: "AP-INV-8854", campaign: "UltraBoost 26 Social Campaign", date: "Today, 2:14 PM", total: "$45,000.00", status: "settled", termSelected: "Net-60", method: "AgncyPay Network" },
  { id: "AP-TX-4902", invoiceId: "AP-INV-8732", campaign: "Adidas Runner Launch Promo", date: "July 8, 2026", total: "$12,000.00", status: "settled", termSelected: "Net-30", method: "ACH Direct" },
  { id: "AP-TX-4881", invoiceId: "AP-INV-8650", campaign: "Originals Creator Batch A", date: "July 2, 2026", total: "$8,500.00", status: "settled", termSelected: "Net-0 (Instant)", method: "AgncyPay Wallet" },
  { id: "AP-TX-4712", invoiceId: "AP-INV-8520", campaign: "Zinedine Zidane Heritage Shoot", date: "June 24, 2026", total: "$150,000.00", status: "settled", termSelected: "Net-90", method: "Wire Transfer" }
];

export default function BrandDashboardPage() {
  const router = useRouter();
  const { state, resetState } = useApp();

  // Invoices state
  const [invoices, setInvoices] = useState<InvoiceMock[]>(INITIAL_INVOICES);
  const [selectedInvoiceId, setSelectedInvoiceId] = useState<string>("AP-INV-9024");
  const [selectedTerm, setSelectedTerm] = useState<"Net-30" | "Net-60" | "Net-90">("Net-30");
  const [instantPayoutEnabled, setInstantPayoutEnabled] = useState<boolean>(true);
  const [transactions, setTransactions] = useState(RECENT_TRANSACTIONS);

  // Active invoice helper
  const activeInvoice = invoices.find(inv => inv.id === selectedInvoiceId) || invoices[0];

  // Set default term when active invoice changes
  useEffect(() => {
    if (activeInvoice) {
      setSelectedTerm(activeInvoice.defaultTerm);
    }
  }, [selectedInvoiceId, activeInvoice]);

  // Handle Approve & Pay Simulation
  const [processingStage, setProcessingStage] = useState<"idle" | "verifying" | "routing" | "success">("idle");

  const handleApproveAndPay = () => {
    if (activeInvoice.status !== "awaiting_approval") return;
    
    setProcessingStage("verifying");
    
    // Stage 1: Verify & Authorize
    setTimeout(() => {
      setProcessingStage("routing");
      
      // Stage 2: Split and Route across nodes
      setTimeout(() => {
        setProcessingStage("success");
        
        // Finalize status update
        setTimeout(() => {
          setInvoices(prev => 
            prev.map(inv => 
              inv.id === activeInvoice.id ? { ...inv, status: "settled" } : inv
            )
          );

          // Add to transaction ledger
          const newTx = {
            id: `AP-TX-${Math.floor(1000 + Math.random() * 9000)}`,
            invoiceId: activeInvoice.id,
            campaign: activeInvoice.campaignName,
            date: "Just now",
            total: `$${activeInvoice.amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
            status: "settled",
            termSelected: instantPayoutEnabled ? "Net-0 (Instant)" : selectedTerm,
            method: "AgncyPay Network"
          };
          setTransactions(prev => [newTx, ...prev]);
          setProcessingStage("idle");
        }, 1200);
      }, 1500);
    }, 1200);
  };

  const handleLogout = () => {
    resetState();
    router.push("/auth/login");
  };

  return (
    <main className="min-h-screen bg-[#000000] text-white flex flex-col font-sans antialiased selection:bg-white selection:text-black relative">
      {/* Background radial gradient decoration */}
      <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-white/[0.01] rounded-full blur-[100px] pointer-events-none" />

      {/* Header - Unified Dark Theme */}
      <header className="border-b border-white/[0.08] bg-black/90 sticky top-0 z-50 shadow-sm backdrop-blur">
        <div className="max-w-[1520px] mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-6">
            <Link href="/" className="flex items-center" aria-label="AgncyPay home">
              <img
                src="/agncypaybrand.png"
                alt="AgncyPay"
                className="h-10 w-auto object-contain scale-[1.3] origin-left"
              />
            </Link>
            <span className="h-4 w-[1px] bg-white/20 hidden md:block" />
            <div className="hidden md:flex items-center gap-2 px-3 py-1 rounded-full bg-white/[0.03] border border-white/[0.08] text-[11px] font-bold uppercase tracking-wider text-[#A3A3A3]">
              <Building2 className="h-3 w-3 text-white" />
              Corporate Portal
            </div>
          </div>

          {/* Center Navigation Tabs (Bilt Style, Dark Theme) */}
          <nav className="hidden lg:flex items-center gap-1 bg-white/[0.03] p-1 rounded-full border border-white/[0.08]">
            <button 
              onClick={() => router.push("/branddashboard")}
              className="px-4 py-1.5 rounded-full text-xs font-semibold bg-white text-black shadow-sm transition-all cursor-pointer"
            >
              Home
            </button>
            <button 
              onClick={() => router.push("/branddashboard/invoices")}
              className="px-4 py-1.5 rounded-full text-xs font-semibold text-[#8f8f8f] hover:text-white transition-all cursor-pointer"
            >
              Invoice Queue
            </button>
            <button className="px-4 py-1.5 rounded-full text-xs font-semibold text-[#8f8f8f] hover:text-white transition-all">
              Settlement Nodes
            </button>
            <button className="px-4 py-1.5 rounded-full text-xs font-semibold text-[#8f8f8f] hover:text-white transition-all">
              Analytics
            </button>
          </nav>

          <div className="flex items-center gap-3">
            <button
              onClick={() => router.push("/dashboard")}
              className="text-xs font-semibold text-[#8f8f8f] hover:text-white transition-colors flex items-center gap-1"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              Talent View
            </button>
            <div className="h-4 w-[1px] bg-white/20" />
            <div className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-full bg-white/[0.05] border border-white/[0.1] flex items-center justify-center font-bold text-xs text-white">
                AD
              </div>
              <span className="text-xs font-bold text-[#E5E5EA] hidden sm:inline">Adidas Corporate</span>
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

      {/* Hero Header Space */}
      <section className="bg-[#000000] border-b border-white/[0.08] py-6 shadow-sm">
        <div className="max-w-[1520px] mx-auto px-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-[#4B6BFB] bg-[#4B6BFB]/10 px-2 py-0.5 rounded">Active Campaign</span>
              <span className="text-xs text-neutral-400 font-mono">ID: ADIDAS-2026-Q3</span>
            </div>
            <h1 className="text-2xl font-bold text-white mt-1 tracking-tight">Adidas Executive Billing</h1>
          </div>
        </div>
      </section>

      {/* Main Workspace */}
      <div className="max-w-[1520px] w-full mx-auto px-6 py-8 flex-1 grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Column - Core Approval and Splits (Wider) */}
        <div className="lg:col-span-8 space-y-6">
          
          {/* Analytics Cards Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { label: "Total Paid Volume", value: "$424,500.00", trend: "+12.4%", icon: TrendingUp },
              { label: "Awaiting Approval", value: `$${invoices.filter(i => i.status === "awaiting_approval").reduce((acc, curr) => acc + curr.amount, 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`, count: `${invoices.filter(i => i.status === "awaiting_approval").length} invoices`, icon: Clock },
              { label: "Instant Net-0 Funded", value: "$186,000.00", detail: "AgncyPay liquidity", icon: Coins },
              { label: "Autosplit Fee Savings", value: "$4,250.00", detail: "Single payment rail", icon: ShieldCheck }
            ].map((stat, idx) => {
              const isAwaitingApproval = stat.label === "Awaiting Approval";
              return (
                <div 
                  key={idx} 
                  onClick={() => {
                    if (isAwaitingApproval) {
                      router.push("/branddashboard/invoices");
                    }
                  }}
                  className={`bg-[#050505] rounded-xl border border-white/[0.08] p-4 shadow-sm transition-all ${
                    isAwaitingApproval 
                      ? "cursor-pointer hover:border-white/20 hover:bg-white/[0.01]" 
                      : ""
                  }`}
                >
                  <div className="flex justify-between items-start">
                    <span className="text-[11px] font-bold text-[#8f8f8f] uppercase tracking-wider flex items-center gap-1">
                      {stat.label}
                      {isAwaitingApproval && <ChevronRight className="h-3 w-3 text-[#4B6BFB]" />}
                    </span>
                    <stat.icon className="h-4 w-4 text-[#8f8f8f]" />
                  </div>
                  <div className="mt-2.5">
                    <p className="text-lg font-bold text-white tracking-tight">{stat.value}</p>
                    <p className="text-[10px] text-neutral-400 mt-1 flex items-center gap-1 font-semibold">
                      {stat.trend && <span className="text-emerald-500 font-bold">{stat.trend}</span>}
                      {stat.count || stat.detail}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Balance Hero Card & Split View */}
          <div className="bg-[#050505] rounded-2xl border border-white/[0.08] shadow-sm overflow-hidden">
            
            {/* Header portion */}
            <div className="p-6 border-b border-white/[0.08] bg-white/[0.01] flex justify-between items-center">
              <div>
                <span className="text-xs font-bold text-[#8f8f8f] uppercase tracking-wider">Awaiting Settlement</span>
                <h3 className="text-base font-bold text-white mt-0.5">{activeInvoice.campaignName}</h3>
              </div>
              <span className="text-xs font-mono bg-white/[0.03] px-2 py-1 rounded text-[#8f8f8f] font-semibold border border-white/[0.08]">
                {activeInvoice.id}
              </span>
            </div>

            {/* Core Balance Card Info */}
            <div className="p-6 md:p-8 grid grid-cols-1 md:grid-cols-2 gap-8 border-b border-white/[0.08]">
              
              {/* Left pane - Amount and Action */}
              <div className="flex flex-col justify-between">
                <div>
                  <span className="text-xs font-bold text-[#8f8f8f] uppercase tracking-wider">Balance due</span>
                  <div className="mt-1 flex items-baseline">
                    <span className="text-[38px] font-black text-white tracking-tight">
                      ${activeInvoice.amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </span>
                  </div>
                  <div className="mt-3 flex items-center gap-4 text-xs text-[#8f8f8f] font-medium">
                    <div className="flex items-center gap-1">
                      <Calendar className="h-3.5 w-3.5 text-neutral-400" />
                      <span>Ingested: {activeInvoice.createdDate}</span>
                    </div>
                  </div>
                </div>

                {/* Approve and Pay Button */}
                <div className="mt-8">
                  <AnimatePresence mode="wait">
                    {processingStage === "idle" && (
                      <button
                        onClick={handleApproveAndPay}
                        disabled={activeInvoice.status !== "awaiting_approval"}
                        className={`w-full h-12 rounded-xl text-sm font-bold shadow-sm flex items-center justify-center gap-2 transition-all cursor-pointer ${
                          activeInvoice.status === "awaiting_approval"
                            ? "bg-white text-black hover:bg-neutral-200"
                            : "bg-emerald-600 text-white cursor-default"
                        }`}
                      >
                        {activeInvoice.status === "awaiting_approval" ? (
                          <>
                            Approve & Pay
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
                      <div className="w-full h-12 rounded-xl border border-white/[0.08] bg-[#0A0A0A] text-xs font-bold text-[#8f8f8f] flex items-center justify-center gap-3 shadow-inner">
                        <RefreshCw className="h-4 w-4 animate-spin text-[#4B6BFB]" />
                        {processingStage === "verifying" && "Verifying corporate treasury clearance..."}
                        {processingStage === "routing" && "Auto-routing splits to Wallet IDs..."}
                        {processingStage === "success" && "Settlement complete!"}
                      </div>
                    )}
                  </AnimatePresence>
                  
                  {activeInvoice.status === "awaiting_approval" && (
                    <p className="text-[10px] text-center text-neutral-400 mt-2">
                      Approving dispatches corporate funds immediately. Backed by AgncyPay's settlement guarantee.
                    </p>
                  )}
                </div>
              </div>

              {/* Right pane - Payout Terms selector */}
              <div className="rounded-xl border border-white/[0.08] bg-white/[0.01] p-5 flex flex-col justify-between">
                <div>
                  <div className="flex justify-between items-center">
                    <span className="text-xs font-bold text-white">Your Corporate Payout Terms</span>
                    <HelpCircle className="h-3.5 w-3.5 text-neutral-400" />
                  </div>
                  <p className="text-[11px] text-[#8f8f8f] mt-1 leading-relaxed">
                    Set your treasury disbursement timeline. Invoices will automatically clear according to this date.
                  </p>

                  {/* Term Buttons */}
                  <div className="mt-4 grid grid-cols-3 gap-2 bg-black p-1 rounded-lg border border-white/[0.08]">
                    {(["Net-30", "Net-60", "Net-90"] as const).map(term => (
                      <button
                        key={term}
                        onClick={() => setSelectedTerm(term)}
                        className={`py-2 rounded-md text-xs font-semibold tracking-tight transition-all cursor-pointer ${
                          selectedTerm === term
                            ? "bg-white text-black shadow-sm font-bold"
                            : "text-[#8f8f8f] hover:text-white"
                        }`}
                      >
                        {term}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Toggle for Instant Payout for recipient */}
                <div className="mt-6 pt-4 border-t border-white/[0.08] flex items-start justify-between gap-4">
                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5">
                      <span className="text-xs font-bold text-white">Allow instant Net-0</span>
                      <span className="text-[9px] font-bold text-emerald-400 bg-emerald-950/80 px-1.5 py-0.2 rounded-full uppercase tracking-wider">AgncyPay Liquidity</span>
                    </div>
                    <p className="text-[10px] text-[#8f8f8f] mt-1 leading-tight">
                      Talent/agencies can claim funds on day 0. AgncyPay funds the advance, keeping your terms unchanged.
                    </p>
                  </div>
                  <button
                    onClick={() => setInstantPayoutEnabled(!instantPayoutEnabled)}
                    className={`relative inline-flex h-5 w-10 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out outline-none ${
                      instantPayoutEnabled ? "bg-[#4B6BFB]" : "bg-white/20"
                    }`}
                  >
                    <span
                      className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                        instantPayoutEnabled ? "translate-x-5" : "translate-x-0"
                      }`}
                    />
                  </button>
                </div>
              </div>
            </div>

            {/* Auto-Split Breakdown Section - Refactored */}
            <div className="p-6 md:p-8 bg-white/[0.01] space-y-6">
              
              {/* Direct Vendor Fee */}
              <div>
                <div className="flex justify-between items-center border-b border-white/[0.08] pb-2">
                  <div className="flex items-center gap-2">
                    <h4 className="text-xs font-bold text-[#8f8f8f] uppercase tracking-wider">Direct Vendor Payment</h4>
                    <span className="text-[10px] text-[#8f8f8f]/75 font-semibold">(Direct invoice flat rate)</span>
                  </div>
                  <span className="text-[10px] text-[#8f8f8f] font-bold">1 Destination</span>
                </div>

                <div className="mt-3 max-w-sm">
                  <div className="p-4 bg-black border border-white/[0.08] rounded-xl shadow-sm hover:border-[#4B6BFB]/30 transition-all relative overflow-hidden">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-3 min-w-0">
                        <img
                          src={activeInvoice.vendorFee.avatar}
                          alt={activeInvoice.vendorFee.name}
                          className="h-10 w-10 rounded-lg object-cover border border-white/[0.1] bg-[#111] shrink-0"
                        />
                        <div className="min-w-0">
                          <p className="text-xs font-bold text-white truncate">{activeInvoice.vendorFee.name}</p>
                          <p className="text-[10px] text-neutral-400 font-semibold">{activeInvoice.vendorFee.walletId}</p>
                        </div>
                      </div>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded shrink-0 uppercase tracking-wider bg-amber-950/60 text-amber-300 border border-amber-800/30">
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

              {/* Agency & Talent Split Pool */}
              <div>
                <div className="flex justify-between items-center border-b border-white/[0.08] pb-2">
                  <div className="flex items-center gap-2">
                    <h4 className="text-xs font-bold text-[#8f8f8f] uppercase tracking-wider">Agency & Talent Payout Split</h4>
                    <span className="text-[10px] text-[#8f8f8f]/75 font-semibold">
                      (Split Pool: ${activeInvoice.splitPool.total.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })})
                    </span>
                  </div>
                  <span className="text-[10px] text-[#8f8f8f] font-bold">2 Destinations</span>
                </div>

                <div className="mt-3 grid grid-cols-1 md:grid-cols-2 gap-4">
                  {activeInvoice.splitPool.splits.map((split) => (
                    <div
                      key={split.name}
                      className="p-4 bg-black border border-white/[0.08] rounded-xl shadow-sm hover:border-[#4B6BFB]/30 hover:shadow-md transition-all relative overflow-hidden group"
                    >
                      {/* Tiny visual progress bar back */}
                      <div className="absolute bottom-0 left-0 h-1 bg-[#4B6BFB]/5 w-full" />
                      {/* Tiny visual progress bar front */}
                      <div 
                        className="absolute bottom-0 left-0 h-1 bg-gradient-to-r from-[#4B6BFB] to-purple-600 transition-all duration-500"
                        style={{ width: activeInvoice.status === "settled" ? `${split.percentage}%` : "0%" }}
                      />

                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-center gap-3 min-w-0">
                          <img
                            src={split.avatar}
                            alt={split.name}
                            className="h-10 w-10 rounded-lg object-cover border border-white/[0.1] bg-[#111] shrink-0"
                          />
                          <div className="min-w-0">
                            <p className="text-xs font-bold text-white truncate">{split.name}</p>
                            <p className="text-[10px] text-neutral-400 font-semibold">{split.walletId}</p>
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
                          {split.percentage}% Pool Share
                        </span>
                        <span className="text-base font-black text-white">
                          ${split.amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </span>
                      </div>

                      {/* Node status indicators */}
                      <div className="mt-2.5 pt-2.5 border-t border-white/[0.08] flex items-center justify-between text-[10px] text-neutral-400">
                        <span>Node Status:</span>
                        <span className="flex items-center gap-1 font-bold text-[#E5E5EA]">
                          {activeInvoice.status === "settled" ? (
                            <>
                              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                              Routed & Disbursed
                            </>
                          ) : (
                            <>
                              <span className="h-1.5 w-1.5 rounded-full bg-amber-400" />
                              Queue Verified
                            </>
                          )}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

            </div>
          </div>

          {/* Payment Status Timeline */}
          <div className="bg-[#050505] rounded-2xl border border-white/[0.08] p-5 shadow-sm">
            <h4 className="text-xs font-bold text-[#8f8f8f] uppercase tracking-wider mb-4">
              Real-Time Settlement Logs
            </h4>

            {/* Timeline Row */}
            <div className="relative flex flex-col md:flex-row justify-between items-start md:items-center gap-6 md:gap-4 md:px-4">
              {/* Connector line behind */}
              <div className="absolute top-4 left-4 bottom-4 md:bottom-auto md:left-0 md:top-1/2 md:h-[2px] w-[2px] md:w-full bg-white/[0.08] -translate-y-1/2 -z-10" />

              {[
                { label: "Invoice Ingested", desc: "Ingested via Brand ERP", date: activeInvoice.createdDate, completed: true },
                { 
                  label: "Brand Approved", 
                  desc: activeInvoice.status === "settled" ? "Authorized successfully" : "Awaiting signature", 
                  date: activeInvoice.status === "settled" ? "Just now" : "Pending", 
                  completed: activeInvoice.status === "settled" 
                },
                { 
                  label: "Funds Clearing", 
                  desc: activeInvoice.status === "settled" ? "Settled on AgncyPay" : "Pending Approval", 
                  date: activeInvoice.status === "settled" ? "Just now" : "Pending", 
                  completed: activeInvoice.status === "settled"
                },
                { 
                  label: "Disbursed to Wallets", 
                  desc: activeInvoice.status === "settled" ? "Split routed immediately" : "Locked", 
                  date: activeInvoice.status === "settled" ? "Instant (Net-0)" : "Pending", 
                  completed: activeInvoice.status === "settled"
                }
              ].map((step, idx) => (
                <div key={idx} className="flex md:flex-col items-start md:items-center text-left md:text-center gap-4 md:gap-2 flex-1 relative bg-[#050505]">
                  {/* Dot */}
                  <div className={`h-8 w-8 rounded-full border-2 flex items-center justify-center shrink-0 shadow-sm ${
                    step.completed 
                      ? "bg-emerald-950/40 border-emerald-500 text-emerald-400" 
                      : "bg-black border-white/[0.08] text-[#8f8f8f]"
                  }`}>
                    {step.completed ? (
                      <CheckCircle2 className="h-4.5 w-4.5" />
                    ) : (
                      <span className="text-xs font-bold">{idx + 1}</span>
                    )}
                  </div>
                  {/* Text details */}
                  <div className="min-w-0">
                    <p className="text-xs font-bold text-white">{step.label}</p>
                    <p className="text-[10px] text-[#8f8f8f] leading-tight mt-0.5">{step.desc}</p>
                    <p className="text-[10px] font-bold text-[#4B6BFB] mt-1">{step.date}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column - Queue and History Ledger (Narrower) */}
        <div className="lg:col-span-4 space-y-6">
          
          {/* Invoice Approval Queue */}
          <div className="bg-[#050505] rounded-2xl border border-white/[0.08] p-5 shadow-sm">
            <div className="flex justify-between items-center pb-3 border-b border-white/[0.08]">
              <h3 className="text-xs font-black uppercase tracking-wider text-[#8f8f8f]">Approval Queue</h3>
              <span className="text-[10px] font-bold text-[#4B6BFB] bg-[#4B6BFB]/10 px-2 py-0.5 rounded-full">
                {invoices.filter(i => i.status === "awaiting_approval").length} Pending
              </span>
            </div>

            <div className="mt-4 space-y-3">
              {invoices.map((inv) => {
                const isSelected = inv.id === selectedInvoiceId;
                const isAwaiting = inv.status === "awaiting_approval";

                return (
                  <button
                    key={inv.id}
                    onClick={() => setSelectedInvoiceId(inv.id)}
                    className={`w-full text-left p-3.5 rounded-xl border transition-all flex justify-between items-center cursor-pointer group ${
                      isSelected
                        ? "border-[#4B6BFB] bg-white/[0.04] shadow-sm"
                        : "border-white/[0.08] hover:border-white/[0.2] hover:bg-white/[0.02]"
                    }`}
                  >
                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5">
                        <span className="text-[10px] font-bold text-neutral-400 uppercase font-mono">{inv.id}</span>
                        <span className={`h-1.5 w-1.5 rounded-full ${
                          isAwaiting ? "bg-amber-400 animate-pulse" : "bg-emerald-500"
                        }`} />
                      </div>
                      <h4 className="text-xs font-bold text-white mt-1 truncate group-hover:text-white">{inv.campaignName}</h4>
                      <p className="text-[10px] text-[#8f8f8f] mt-0.5">Ingested: {inv.createdDate}</p>
                    </div>

                    <div className="text-right shrink-0">
                      <p className="text-xs font-black text-white">
                        ${inv.amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </p>
                      <span className={`text-[9px] font-bold px-1.5 py-0.2 rounded-full uppercase block mt-1 tracking-wider text-center ${
                        isAwaiting ? "bg-amber-950/80 text-amber-300" : "bg-emerald-950/80 text-emerald-300"
                      }`}>
                        {isAwaiting ? "Awaiting" : "Settled"}
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Node Map Panel */}
          <div className="bg-[#050505] rounded-2xl border border-white/[0.08] p-5 shadow-sm">
            <h3 className="text-xs font-black uppercase tracking-wider text-[#8f8f8f] pb-3 border-b border-white/[0.08]">
              Creative Node Network
            </h3>

            {/* Map representation */}
            <div className="mt-4 h-48 rounded-xl border border-white/[0.08] bg-black relative overflow-hidden flex flex-col justify-end p-4 shadow-inner">
              {/* Dot grid back */}
              <div className="absolute inset-0 bg-[radial-gradient(rgba(255,255,255,0.05)_1px,transparent_1px)] [background-size:16px_16px] opacity-70" />

              {/* Glowing active node lines */}
              <svg className="absolute inset-0 h-full w-full pointer-events-none" xmlns="http://www.w3.org/2000/svg">
                <path d="M 50 50 L 150 100 L 250 60" fill="none" stroke="#4B6BFB" strokeWidth="1.5" strokeDasharray="4 4" className="animate-[dash_10s_linear_infinite]" />
                <path d="M 150 100 L 80 150" fill="none" stroke="#a855f7" strokeWidth="1.5" strokeDasharray="4 4" className="animate-[dash_8s_linear_infinite]" />
              </svg>

              {/* Nodes */}
              <div className="absolute top-10 left-12 flex flex-col items-center">
                <div className="h-6 w-6 rounded-full bg-[#4B6BFB] border-2 border-white flex items-center justify-center text-[8px] font-black text-white shadow">
                  NY
                </div>
                <span className="text-[8px] font-bold text-[#8f8f8f] mt-1">Brand Node</span>
              </div>

              <div className="absolute top-20 right-16 flex flex-col items-center">
                <div className="h-6 w-6 rounded-full bg-purple-500 border-2 border-white flex items-center justify-center text-[8px] font-black text-white shadow">
                  LDN
                </div>
                <span className="text-[8px] font-bold text-[#8f8f8f] mt-1">Talent Node</span>
              </div>

              <div className="absolute bottom-10 left-16 flex flex-col items-center">
                <div className="h-6 w-6 rounded-full bg-emerald-500 border-2 border-white flex items-center justify-center text-[8px] font-black text-white shadow">
                  PAR
                </div>
                <span className="text-[8px] font-bold text-[#8f8f8f] mt-1">Agency Node</span>
              </div>

              {/* Map Button indicator */}
              <div className="relative z-10 bg-[#0A0A0A] border border-white/[0.08] rounded-lg p-2.5 shadow-sm text-[11px]">
                <div className="flex justify-between items-center">
                  <span className="font-bold text-white flex items-center gap-1.5">
                    <MapPin className="h-3.5 w-3.5 text-[#4B6BFB]" />
                    3 Active Nodes Connected
                  </span>
                  <ArrowUpRight className="h-3.5 w-3.5 text-neutral-400" />
                </div>
              </div>
            </div>

            {/* General Info list */}
            <div className="mt-4 space-y-2 text-xs">
              <div className="flex justify-between items-center py-2 border-b border-white/[0.08]">
                <span className="text-[#8f8f8f] font-semibold">Active Campaign</span>
                <span className="font-bold text-white">Adidas Originals Q3</span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-white/[0.08]">
                <span className="text-[#8f8f8f] font-semibold">Settlement Period</span>
                <span className="font-bold text-white">Jul 1 - Sep 30, 2026</span>
              </div>
              <div className="flex justify-between items-center py-2">
                <span className="text-[#8f8f8f] font-semibold">Tax Documentation</span>
                <span className="font-bold text-emerald-400 flex items-center gap-1">
                  <CheckCircle2 className="h-3.5 w-3.5" />
                  All Nodes W-9 Active
                </span>
              </div>
            </div>
          </div>

          {/* Recent Transactions Ledger */}
          <div className="bg-[#050505] rounded-2xl border border-white/[0.08] p-5 shadow-sm">
            <h3 className="text-xs font-black uppercase tracking-wider text-[#8f8f8f] pb-3 border-b border-white/[0.08]">
              Recent Transactions
            </h3>

            <div className="mt-4 space-y-4">
              {transactions.map((tx) => (
                <div key={tx.id} className="flex justify-between items-start gap-4 text-xs">
                  <div className="min-w-0">
                    <p className="font-bold text-white truncate leading-tight">{tx.campaign}</p>
                    <div className="mt-1 flex items-center gap-2 text-[10px] text-[#8f8f8f] font-semibold">
                      <span>{tx.date}</span>
                      <span>•</span>
                      <span>{tx.termSelected}</span>
                    </div>
                  </div>

                  <div className="text-right shrink-0">
                    <p className="font-bold text-white">{tx.total}</p>
                    <span className="text-[10px] text-[#4B6BFB] font-bold block mt-0.5">{tx.method}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="border-t border-white/[0.08] bg-black py-8 text-xs text-neutral-400 mt-12">
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
