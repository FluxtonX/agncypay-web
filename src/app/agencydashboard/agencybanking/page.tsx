"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  Building2,
  Landmark,
  ArrowLeft,
  DollarSign,
  TrendingUp,
  Clock,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  Plus,
  Building,
  CreditCard,
  Link2,
  ArrowUpRight,
  ArrowDownLeft,
  ShieldCheck,
  Calendar,
  Layers,
  FileText,
  Users,
  Eye,
  X,
  Loader2,
  Sparkles,
  Wallet,
  Send,
  BarChart3,
  Search,
  Check,
  ChevronRight,
  MoreVertical,
  Lock,
  HelpCircle
} from "lucide-react";
import { useApp } from "../../../context/AppContext";
import { useAccounting } from "../../../modules/accounting/hooks/useAccounting";
import {
  subscribeInvoicesByAgency,
  subscribeFirestoreDepositBalance,
  recordFirestoreDeposit,
  createFirestoreInvoice
} from "../../../lib/firebaseInvoices";
import { BanksAndCardsPanel } from "../../../components/dashboard/BanksAndCardsPanel";
import { IntegrationsPanel } from "../../../components/dashboard/IntegrationsPanel";
import { PlaidConnector } from "../../../components/dashboard/PlaidConnector";

interface PayoutItem {
  id: string;
  talentName: string;
  campaign: string;
  amount: number;
  status: "completed" | "scheduled" | "processing" | "pending";
  date: string;
  dueDate?: string;
}

interface FinancialActivity {
  id: string;
  type: "invoice_paid" | "brand_payment" | "commission" | "payout" | "deposit" | "sync";
  title: string;
  subtitle: string;
  amount?: number;
  timestamp: string;
}

interface ContactItem {
  id: string;
  name: string;
  handle: string;
  role: string;
  avatar?: string;
}

const WALLET_CONTACTS: ContactItem[] = [
  { id: "john-adams", name: "John Adams", handle: "@agncy11174", role: "Talent Representative" },
  { id: "sarah-jenkins", name: "Sarah Jenkins", handle: "@sarah_j", role: "Top Model / Creator" },
  { id: "alex-rivera", name: "Alex Rivera", handle: "@alex_r", role: "Creative Director" },
  { id: "elena-rostova", name: "Elena Rostova", handle: "@elena_r", role: "Independent Model" },
  { id: "adidas-corp", name: "Adidas Corporate", handle: "@adidas_brand", role: "Brand Payer" }
];

interface LinkedCard {
  id: string;
  name: string;
  detail: string;
  fallback: string;
}

export default function AgencyBankingDashboardPage() {
  const router = useRouter();
  const { state } = useApp();
  const { connectionStatuses, syncing, sync, loading: accountingLoading } = useAccounting();

  const workspaceType = state.user ? state.user.accountType : "agency";
  const userEmail = state.user?.email || "agency@elite.com";
  const agencyName = state.workspaces.find((w) => w.id === state.activeWorkspaceId)?.name || state.user?.fullName || "Agency Treasury";

  const [isLightTheme, setIsLightTheme] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const savedTheme = localStorage.getItem("agncypay_theme") || localStorage.getItem("theme");
      if (savedTheme === "light" || document.documentElement.classList.contains("light")) {
        setIsLightTheme(true);
        document.documentElement.classList.add("light");
      } else if (savedTheme === "dark") {
        setIsLightTheme(false);
        document.documentElement.classList.remove("light");
      } else {
        setIsLightTheme(document.documentElement.classList.contains("light"));
      }
    }
  }, []);

  const toggleTheme = () => {
    setIsLightTheme((prev) => {
      const next = !prev;
      if (typeof window !== "undefined") {
        if (next) {
          document.documentElement.classList.add("light");
          localStorage.setItem("agncypay_theme", "light");
          localStorage.setItem("theme", "light");
        } else {
          document.documentElement.classList.remove("light");
          localStorage.setItem("agncypay_theme", "dark");
          localStorage.setItem("theme", "dark");
        }
      }
      return next;
    });
  };

  // Firestore Real-Time Balances & Invoices
  const [depositBalance, setDepositBalance] = useState<number>(0);
  const [invoices, setInvoices] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  // Modals
  const [isDepositModalOpen, setIsDepositModalOpen] = useState(false);
  const [isPlaidModalOpen, setIsPlaidModalOpen] = useState(false);
  const [isWalletContactsOpen, setIsWalletContactsOpen] = useState(false);
  const [contactQuery, setContactQuery] = useState("");
  const [autosplitContactIds, setAutosplitContactIds] = useState<string[]>(["john-adams", "sarah-jenkins"]);

  // Brand-Exact Deposit Form State
  const [depositAmount, setDepositAmount] = useState<string>("1000");
  const [depositMethod, setDepositMethod] = useState<"card" | "ach" | "wire" | "rtp">("card");
  const [selectedCardId, setSelectedCardId] = useState<string>("chase-86");
  const [showAddCard, setShowAddCard] = useState<boolean>(false);
  const [newCardHolder, setNewCardHolder] = useState<string>("");
  const [newCardNumber, setNewCardNumber] = useState<string>("");
  const [newCardExpiry, setNewCardExpiry] = useState<string>("");
  const [newCardCVC, setNewCardCVC] = useState<string>("");
  const [newCardZip, setNewCardZip] = useState<string>("");
  const [isProcessingDeposit, setIsProcessingDeposit] = useState<boolean>(false);
  const [depositSuccessMsg, setDepositSuccessMsg] = useState<string | null>(null);

  // Saved Linked Cards (Brand-Exact)
  const [linkedCards, setLinkedCards] = useState<LinkedCard[]>([
    { id: "chase-86", name: "Chase Ink Business Unlimited Visa", detail: "Visa ••••86 • Primary Disbursement", fallback: "CHASE" },
    { id: "mercury-57", name: "Mercury Business IO Mastercard", detail: "Mastercard ••••57 • Instant Settlement", fallback: "MERCURY" }
  ]);

  // Read-only Payout View Modal
  const [selectedPayout, setSelectedPayout] = useState<PayoutItem | null>(null);

  // Subscribe to live Firestore deposit balance & invoices
  useEffect(() => {
    setLoading(true);
    const unsubBalance = subscribeFirestoreDepositBalance(userEmail, (bal) => {
      setDepositBalance(bal);
    });

    const unsubInvoices = subscribeInvoicesByAgency(userEmail, (invs) => {
      setInvoices(invs);
      setLoading(false);
    });

    return () => {
      unsubBalance();
      unsubInvoices();
    };
  }, [userEmail]);

  // Financial Computations from Live Data
  const settledInvoices = invoices.filter((i) => i.status === "settled" || i.status === "paid");
  const totalSettledVolume = settledInvoices.reduce((sum, inv) => sum + (inv.amount || 0), 0);
  const totalCommissionEarned = totalSettledVolume * 0.15; // Standard 15% agency commission
  const totalAgencyLiquidity = depositBalance + totalCommissionEarned;

  // Talent Owed Calculations across all invoices
  let totalTalentPayable = 0;
  let pendingPayoutsCount = 0;
  const recentPayoutList: PayoutItem[] = [];
  const upcomingPayoutList: PayoutItem[] = [];

  invoices.forEach((inv) => {
    const splits = inv.splitPool?.splits || [];
    splits.forEach((split: any, idx: number) => {
      if (split.role === "Talent" || split.role === "Individual") {
        totalTalentPayable += split.amount || 0;
        if (inv.status !== "settled" && inv.status !== "paid") {
          pendingPayoutsCount++;
          upcomingPayoutList.push({
            id: `${inv.id}-split-${idx}`,
            talentName: split.name || "Talent Member",
            campaign: inv.campaignName || "Campaign Settlement",
            amount: split.amount || 0,
            status: "scheduled",
            date: inv.createdDate || "2026-07-20",
            dueDate: inv.dueDate || "Net-30"
          });
        } else {
          recentPayoutList.push({
            id: `${inv.id}-split-${idx}`,
            talentName: split.name || "Talent Member",
            campaign: inv.campaignName || "Campaign Settlement",
            amount: split.amount || 0,
            status: "completed",
            date: inv.createdDate || "2026-07-21"
          });
        }
      }
    });
  });

  // Fallback items if Firestore is fresh/empty
  const displayRecentPayouts: PayoutItem[] = recentPayoutList.length > 0 ? recentPayoutList : [
    { id: "pout-101", talentName: "Sarah Jenkins", campaign: "Vogue Summer Editorial", amount: 12750, status: "completed", date: "Jul 21, 2026" },
    { id: "pout-102", talentName: "Alex Rivera", campaign: "Adidas Winter Drop", amount: 18500, status: "completed", date: "Jul 19, 2026" },
    { id: "pout-103", talentName: "Elena Rostova", campaign: "Paris Fashion Week", amount: 9400, status: "completed", date: "Jul 17, 2026" },
    { id: "pout-104", talentName: "David Chen", campaign: "Nike Commercial Shoot", amount: 15200, status: "completed", date: "Jul 15, 2026" }
  ];

  const displayUpcomingPayouts: PayoutItem[] = upcomingPayoutList.length > 0 ? upcomingPayoutList : [
    { id: "up-201", talentName: "Marcus Vance", campaign: "Calvin Klein Runway", amount: 14500, status: "scheduled", date: "Jul 28, 2026", dueDate: "Net-30" },
    { id: "up-202", talentName: "Sophia Lin", campaign: "Sephora Autumn Launch", amount: 8200, status: "processing", date: "Aug 02, 2026", dueDate: "Net-15" },
    { id: "up-203", talentName: "Jordan Blake", campaign: "Puma Global Campaign", amount: 11900, status: "scheduled", date: "Aug 10, 2026", dueDate: "Net-30" }
  ];

  // Activity Timeline Events
  const activityTimeline: FinancialActivity[] = [
    { id: "act-1", type: "deposit", title: "Agency Treasury Deposit", subtitle: `Added liquidity to ${agencyName}`, amount: depositBalance > 0 ? depositBalance : 25000, timestamp: "Today, 09:30 AM" },
    { id: "act-2", type: "brand_payment", title: "Brand Settlement Received", subtitle: "Adidas Corporate via ACH Wire", amount: 45000, timestamp: "Yesterday, 04:15 PM" },
    { id: "act-3", type: "commission", title: "Agency Commission Deducted", subtitle: "15% Gross Margin Processed", amount: 6750, timestamp: "Yesterday, 04:16 PM" },
    { id: "act-4", type: "payout", title: "Talent Disbursement Completed", subtitle: "Sarah Jenkins & Alex Rivera", amount: 31250, timestamp: "Jul 20, 2026" },
    { id: "act-5", type: "sync", title: "QuickBooks & Plaid Sync", subtitle: "Ledgers & Bank Statements Reconciled", timestamp: "Jul 19, 2026" }
  ];

  // Brand-Exact Deposit Submission Handler
  const handleConfirmDeposit = async (e: React.FormEvent) => {
    e.preventDefault();
    const numericAmt = parseFloat(depositAmount);
    if (isNaN(numericAmt) || numericAmt <= 0) return;

    setIsProcessingDeposit(true);
    try {
      await recordFirestoreDeposit(userEmail, numericAmt, depositMethod);
      setDepositSuccessMsg(
        `Successfully deposited $${numericAmt.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} into AGNCYPAY Treasury!`
      );
      setTimeout(() => {
        setIsDepositModalOpen(false);
        setIsProcessingDeposit(false);
        setDepositSuccessMsg(null);
      }, 1500);
    } catch (err) {
      console.error("Deposit error:", err);
      setIsProcessingDeposit(false);
    }
  };

  const handleAddNewCard = () => {
    if (!newCardNumber.trim() || !newCardHolder.trim()) return;
    const last4 = newCardNumber.replace(/\s+/g, "").slice(-4) || "0000";
    const newCard: LinkedCard = {
      id: `card-${Date.now()}`,
      name: `${newCardHolder}'s Card`,
      detail: `•••• ${last4} • Saved Card`,
      fallback: "Card"
    };
    setLinkedCards((prev) => [...prev, newCard]);
    setSelectedCardId(newCard.id);
    setShowAddCard(false);
    setNewCardHolder("");
    setNewCardNumber("");
    setNewCardExpiry("");
    setNewCardCVC("");
    setNewCardZip("");
  };

  const toggleAutosplitContact = (id: string) => {
    setAutosplitContactIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  // Filtered contacts
  const filteredContacts = contactQuery.trim()
    ? WALLET_CONTACTS.filter((c) =>
        [c.name, c.handle, c.role].join(" ").toLowerCase().includes(contactQuery.trim().toLowerCase())
      )
    : WALLET_CONTACTS;

  return (
    <main className="min-h-screen bg-background text-foreground flex flex-col font-sans antialiased relative transition-colors duration-200">
      {/* Background Emerald Radial Glow */}
      <div className="absolute top-0 left-1/4 w-[600px] h-[600px] bg-emerald-500/[0.04] rounded-full blur-[140px] pointer-events-none" />

      {/* Header Navigation */}
      <header className="border-b border-white/25 light:border-black/15 bg-background/90 sticky top-0 z-50 shadow-sm backdrop-blur">
        <div className="max-w-[1520px] mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-6">
            <div className="relative flex items-center mr-12">
              <Link href="/agencydashboard" className="flex items-center cursor-pointer z-50 hover:opacity-80 transition-opacity" aria-label="AgncyPay home">
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

          {/* Navigation Tabs */}
          <nav className="hidden lg:flex items-center gap-1 bg-white/[0.03] p-1 rounded-full border border-white/20">
            <button 
              onClick={() => router.push("/agencydashboard/agencybanking")}
              className="px-4 py-1.5 rounded-full text-xs font-bold bg-white light:bg-[#0F172A] text-black light:text-white shadow-sm border border-white/20 light:border-black/10 transition-all cursor-pointer"
            >
              Agency Banking
            </button>
            <button 
              onClick={() => router.push("/agencydashboard/nodes")}
              className="px-4 py-1.5 rounded-full text-xs font-semibold text-[#8f8f8f] light:text-[#475569] hover:text-white light:hover:text-[#0F172A] transition-all cursor-pointer"
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
                <div className="flex items-center gap-1.5">
                  <button
                    disabled
                    className="px-3.5 py-1.5 rounded-full text-xs font-bold bg-white/40 light:bg-[#0F172A]/40 text-black/40 light:text-white/40 border border-white/10 light:border-black/5 shadow-sm transition-all flex items-center gap-1.5 cursor-not-allowed blur-[0.6px]"
                  >
                    <Lock className="h-3.5 w-3.5" />
                    Switch to Agency Portal
                  </button>
                  <button 
                    onClick={() => alert("Agency Portal is currently locked. Complete your compliance verification to unlock this feature.")}
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
              <div className="h-8 w-8 rounded-full bg-[#082315] border border-[#10b95f]/30 flex items-center justify-center font-bold text-xs text-[#70ff9e]">
                {state.user?.fullName ? state.user.fullName.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2) : "AB"}
              </div>
              <span className="text-xs font-bold text-[#E5E5EA] light:text-[#0F172A] hidden sm:inline">
                {agencyName}
              </span>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content Body */}
      <div className="max-w-[1520px] mx-auto px-6 py-8 w-full space-y-8">
        
        {/* Executive Page Title & Header Actions */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-[#0D0D0D] light:bg-[#F8FAFC] border border-white/10 light:border-black/10 rounded-2xl p-6 shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-80 h-80 bg-emerald-500/5 rounded-full blur-3xl pointer-events-none" />
          <div className="space-y-1 z-10">
            <div className="flex items-center gap-2">
              <Landmark className="h-6 w-6 text-white light:text-[#0F172A]" />
              <h1 className="text-2xl font-extrabold text-white light:text-[#0F172A] tracking-tight">Agency Banking Dashboard</h1>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-[#082315] text-[#70ff9e] border border-[#10b95f]/30">
                Live Liquidity Active
              </span>
            </div>
            <p className="text-xs text-[#8f8f8f] light:text-[#475569]">
              Executive financial ledger, liquidity reserves, corporate bank accounts, and talent disbursement control for {agencyName}
            </p>
          </div>

          <div className="flex items-center gap-3 z-10">
            <button
              onClick={() => sync()}
              disabled={syncing}
              className="px-4 py-2 rounded-xl text-xs font-semibold bg-white/5 light:bg-black/5 hover:bg-white/10 text-white light:text-[#0F172A] border border-white/15 light:border-black/15 transition-all flex items-center gap-2 disabled:opacity-50 cursor-pointer"
            >
              <RefreshCw className={`h-3.5 w-3.5 text-white light:text-[#0F172A] ${syncing ? "animate-spin" : ""}`} />
              <span>{syncing ? "Syncing ERP..." : "Sync Accounting"}</span>
            </button>

            {/* Brand-Exact "+ Deposit Funds" Button */}
            <button
              onClick={() => setIsDepositModalOpen(true)}
              className="px-5 py-2 rounded-xl text-xs font-bold bg-white light:bg-[#0F172A] text-black light:text-white hover:bg-neutral-200 light:hover:bg-[#1E293B] shadow-lg transition-all flex items-center gap-2 cursor-pointer"
            >
              <Plus className="h-4 w-4 text-black light:text-white" />
              <span>+ Deposit Funds</span>
            </button>
          </div>
        </div>

        {/* HERO TWO-COLUMN SECTION */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Column: Banner Card ("For Those Who Create") (7 cols) */}
          <div className="lg:col-span-7 bg-[#050505] light:bg-white border border-white/20 light:border-black/10 rounded-2xl overflow-hidden shadow-2xl flex items-center justify-center h-full max-h-[400px]">
            <img
              src="/dashboard-app-promo.png"
              alt="For Those Who Create — AgncyPay"
              className="w-full h-full object-cover object-left rounded-2xl"
              loading="lazy"
            />
          </div>

          {/* Right Column: Talent Side Action Bar & Operations (5 cols) */}
          <div className="lg:col-span-5 bg-[#050505] light:bg-white border border-white/20 light:border-black/10 rounded-2xl p-5 shadow-2xl flex flex-col justify-between">
            <div className="space-y-4">
              {/* 4 Square Action Buttons */}
              <div className="grid grid-cols-4 gap-2.5">
                {/* 1. Send / Request */}
                <button
                  type="button"
                  onClick={() => router.push("/dashboard/send-request")}
                  className="flex flex-col items-center gap-2.5 rounded-[10px] border border-[#3a3a3a] light:border-black/15 bg-[#090909] light:bg-[#F8FAFC] px-2 py-3.5 text-center transition-colors hover:border-white/60 light:hover:border-black/40 group cursor-pointer"
                >
                  <span className="flex h-10 w-10 items-center justify-center rounded-[9px] border border-[#4a4a4a] light:border-black/10 bg-black light:bg-[#0F172A] text-white group-hover:scale-105 transition-transform">
                    <Send className="h-5 w-5 text-white" />
                  </span>
                  <span className="text-[10px] font-semibold leading-4 text-white light:text-[#0F172A]">Send / Request</span>
                </button>

                {/* 2. Analytics */}
                <button
                  type="button"
                  onClick={() => router.push("/agencydashboard/analytics")}
                  className="flex flex-col items-center gap-2.5 rounded-[10px] border border-[#3a3a3a] light:border-black/15 bg-[#090909] light:bg-[#F8FAFC] px-2 py-3.5 text-center transition-colors hover:border-white/60 light:hover:border-black/40 group cursor-pointer"
                >
                  <span className="flex h-10 w-10 items-center justify-center rounded-[9px] border border-[#4a4a4a] light:border-black/10 bg-black light:bg-[#0F172A] text-white group-hover:scale-105 transition-transform">
                    <BarChart3 className="h-5 w-5 text-white" />
                  </span>
                  <span className="text-[10px] font-semibold leading-4 text-white light:text-[#0F172A]">Analytics</span>
                </button>

                {/* 3. Wallet ID Contacts */}
                <button
                  type="button"
                  onClick={() => setIsWalletContactsOpen(true)}
                  className="flex flex-col items-center gap-2.5 rounded-[10px] border border-[#3a3a3a] light:border-black/15 bg-[#090909] light:bg-[#F8FAFC] px-2 py-3.5 text-center transition-colors hover:border-white/60 light:hover:border-black/40 group cursor-pointer"
                >
                  <span className="flex h-10 w-10 items-center justify-center rounded-[9px] border border-[#4a4a4a] light:border-black/10 bg-black light:bg-[#0F172A] text-white group-hover:scale-105 transition-transform">
                    <Users className="h-5 w-5 text-white" />
                  </span>
                  <span className="text-[10px] font-semibold leading-4 text-white light:text-[#0F172A]">Wallet ID contacts</span>
                </button>

                {/* 4. More */}
                <button
                  type="button"
                  onClick={() => sync()}
                  disabled={syncing}
                  className="flex flex-col items-center gap-2.5 rounded-[10px] border border-[#3a3a3a] light:border-black/15 bg-[#090909] light:bg-[#F8FAFC] px-2 py-3.5 text-center transition-colors hover:border-white/60 light:hover:border-black/40 group cursor-pointer disabled:opacity-50"
                >
                  <span className="flex h-10 w-10 items-center justify-center rounded-[9px] border border-[#4a4a4a] light:border-black/10 bg-black light:bg-[#0F172A] text-white group-hover:scale-105 transition-transform">
                    <MoreVertical className={`h-5 w-5 text-white ${syncing ? "animate-spin" : ""}`} />
                  </span>
                  <span className="text-[10px] font-semibold leading-4 text-white light:text-[#0F172A]">More</span>
                </button>
              </div>

              {/* Recent Agency Income Summary Tile */}
              <div className="p-4 rounded-[10px] border border-[#3a3a3a] light:border-black/15 bg-[#090909] light:bg-[#F8FAFC] space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-white light:text-[#0F172A]">Recent Income</span>
                  <button
                    onClick={() => router.push("/agencydashboard/invoices")}
                    className="text-[11px] font-semibold text-[#8f8f8f] light:text-[#475569] hover:text-white light:hover:text-[#0F172A] flex items-center gap-1 cursor-pointer"
                  >
                    View All <ChevronRight className="w-3 h-3" />
                  </button>
                </div>
                <p className="text-[11px] text-[#8f8f8f] light:text-[#475569]">Money received from Brands and other agencies.</p>
                <div className="p-3 rounded-lg bg-black light:bg-white border border-white/10 light:border-black/10 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-white/10 light:bg-black/5 flex items-center justify-center font-bold text-xs text-white light:text-[#0F172A]">
                      AD
                    </div>
                    <div>
                      <div className="text-xs font-bold text-white light:text-[#0F172A]">Adidas Corporate HQ</div>
                      <div className="text-[10px] text-[#8f8f8f] light:text-[#475569]">Winter Editorial 2026</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-xs font-extrabold text-white light:text-[#0F172A]">$15,000.00</div>
                    <span className="text-[10px] text-emerald-400 light:text-[#0F172A] font-bold">Recent ✓</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="pt-3 border-t border-white/10 light:border-black/10 flex items-center justify-between text-[11px] text-[#8f8f8f] light:text-[#475569]">
              <span>Role: Agency Director</span>
              <button
                onClick={() => router.push("/dashboard/send-request")}
                className="text-white light:text-[#0F172A] font-bold hover:underline flex items-center gap-1"
              >
                Open Full Send / Request Workspace →
              </button>
            </div>
          </div>
        </div>

        {/* 1. FINANCIAL OVERVIEW STATS */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {/* Card 1: Total Agency Balance */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="p-6 bg-[#0D0D0D] border border-white/20 rounded-2xl shadow-xl relative overflow-hidden group hover:border-emerald-500/50 transition-all"
          >
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-semibold text-[#8f8f8f] tracking-wide uppercase">Total Agency Liquidity</span>
              <div className="p-2.5 bg-emerald-500/10 rounded-xl text-emerald-400 border border-emerald-500/20">
                <Wallet className="w-5 h-5" />
              </div>
            </div>
            <div className="text-2xl font-extrabold text-white tracking-tight">
              ${totalAgencyLiquidity.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </div>
            <div className="mt-3 flex items-center gap-1.5 text-[11px] text-emerald-400">
              <TrendingUp className="w-3.5 h-3.5" />
              <span>${depositBalance.toLocaleString()} Deposit Pool + 15% Net Commission</span>
            </div>
          </motion.div>

          {/* Card 2: Total Talent Payable Balance */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.05 }}
            className="p-6 bg-[#0D0D0D] border border-white/20 rounded-2xl shadow-xl relative overflow-hidden group hover:border-amber-500/50 transition-all"
          >
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-semibold text-[#8f8f8f] tracking-wide uppercase">Talent Payable Balance</span>
              <div className="p-2.5 bg-amber-500/10 rounded-xl text-amber-400 border border-amber-500/20">
                <Users className="w-5 h-5" />
              </div>
            </div>
            <div className="text-2xl font-extrabold text-white tracking-tight">
              ${totalTalentPayable.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </div>
            <div className="mt-3 flex items-center gap-1.5 text-[11px] text-amber-400/90">
              <Clock className="w-3.5 h-3.5" />
              <span>Total Owed Across Active Campaigns</span>
            </div>
          </motion.div>

          {/* Card 3: Pending Payouts (Yellow/Amber Status) */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.1 }}
            className="p-6 bg-[#0D0D0D] border border-white/20 rounded-2xl shadow-xl relative overflow-hidden group hover:border-amber-500/50 transition-all"
          >
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-semibold text-[#8f8f8f] tracking-wide uppercase">Pending Payouts</span>
              <div className="p-2.5 bg-amber-500/10 rounded-xl text-amber-400 border border-amber-500/20">
                <Layers className="w-5 h-5" />
              </div>
            </div>
            <div className="text-2xl font-extrabold text-white tracking-tight">
              {pendingPayoutsCount > 0 ? pendingPayoutsCount : 3} <span className="text-sm font-normal text-[#8f8f8f]">Disbursements</span>
            </div>
            <div className="mt-3 flex items-center gap-1.5 text-[11px] text-amber-400/90">
              <Clock className="w-3.5 h-3.5 text-amber-400" />
              <span>Scheduled Auto-Split Queue</span>
            </div>
          </motion.div>

          {/* Card 4: Monthly Payment Volume */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.15 }}
            className="p-6 bg-[#0D0D0D] border border-white/20 rounded-2xl shadow-xl relative overflow-hidden group hover:border-emerald-500/50 transition-all"
          >
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-semibold text-[#8f8f8f] tracking-wide uppercase">Monthly Payment Volume</span>
              <div className="p-2.5 bg-emerald-500/10 rounded-xl text-emerald-400 border border-emerald-500/20">
                <DollarSign className="w-5 h-5" />
              </div>
            </div>
            <div className="text-2xl font-extrabold text-white tracking-tight">
              ${(totalSettledVolume > 0 ? totalSettledVolume : 124500).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </div>
            <div className="mt-3 flex items-center gap-1.5 text-[11px] text-emerald-400">
              <ArrowUpRight className="w-3.5 h-3.5" />
              <span>+18.4% vs Previous Month</span>
            </div>
          </motion.div>
        </div>

        {/* 2. RECENT PAYOUTS (Read-Only) & UPCOMING PAYOUT SCHEDULE */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Recent Payouts Table (2 cols) */}
          <div className="lg:col-span-2 bg-[#0D0D0D] border border-white/20 rounded-2xl p-6 shadow-xl space-y-4">
            <div className="flex items-center justify-between border-b border-white/10 pb-4">
              <div>
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <Users className="w-4 h-4 text-emerald-400" />
                  Recent Talent Payout Disbursements
                </h3>
                <p className="text-xs text-[#8f8f8f]">Read-only executive ledger of completed talent payouts</p>
              </div>
              <button
                onClick={() => router.push("/agencydashboard/agencybanking/payouts")}
                className="text-xs font-bold text-white bg-white/10 hover:bg-white/20 px-3.5 py-1.5 rounded-xl border border-white/20 transition-all flex items-center gap-1 cursor-pointer shadow-sm"
              >
                <span>View All</span>
                <ChevronRight className="w-3.5 h-3.5 text-emerald-400" />
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="text-[#8f8f8f] border-b border-white/10 uppercase tracking-wider text-[10px]">
                    <th className="py-3 px-3">Talent Name</th>
                    <th className="py-3 px-3">Campaign / Invoice</th>
                    <th className="py-3 px-3">Disbursed Amount</th>
                    <th className="py-3 px-3">Status</th>
                    <th className="py-3 px-3">Date</th>
                    <th className="py-3 px-3 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {displayRecentPayouts.map((item) => (
                    <tr key={item.id} className="hover:bg-white/[0.02] transition-colors">
                      <td className="py-3.5 px-3 font-semibold text-white flex items-center gap-2">
                        <div className="w-7 h-7 rounded-full bg-white/10 flex items-center justify-center text-[10px] font-bold text-white">
                          {item.talentName.split(" ").map((n) => n[0]).join("")}
                        </div>
                        {item.talentName}
                      </td>
                      <td className="py-3.5 px-3 text-[#8f8f8f]">{item.campaign}</td>
                      <td className="py-3.5 px-3 font-bold text-white">
                        ${item.amount.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                      </td>
                      <td className="py-3.5 px-3">
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-emerald-950/60 text-emerald-400 border border-emerald-800/30 flex items-center gap-1 w-fit">
                          <CheckCircle2 className="w-3 h-3" />
                          Completed
                        </span>
                      </td>
                      <td className="py-3.5 px-3 text-[#8f8f8f]">{item.date}</td>
                      <td className="py-3.5 px-3 text-right">
                        <button
                          onClick={() => setSelectedPayout(item)}
                          className="px-2.5 py-1 rounded-lg bg-white/5 hover:bg-white/10 text-white text-[11px] font-medium transition-colors border border-white/10 inline-flex items-center gap-1 cursor-pointer"
                        >
                          <Eye className="w-3.5 h-3.5 text-emerald-400" />
                          <span>View</span>
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Upcoming Payout Schedule (1 col) - Professional Yellow Status */}
          <div className="bg-[#0D0D0D] border border-white/20 rounded-2xl p-6 shadow-xl space-y-4">
            <div className="border-b border-white/10 pb-4">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Calendar className="w-4 h-4 text-amber-400" />
                Upcoming Payout Schedule
              </h3>
              <p className="text-xs text-[#8f8f8f]">Manage liquidity for scheduled talent split releases</p>
            </div>

            <div className="space-y-3">
              {displayUpcomingPayouts.map((item) => (
                <div key={item.id} className="p-3.5 rounded-xl border border-white/10 bg-white/5 space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-white">{item.talentName}</span>
                    <span className="font-bold text-amber-400">${item.amount.toLocaleString()}</span>
                  </div>
                  <div className="flex items-center justify-between text-[11px] text-[#8f8f8f]">
                    <span>{item.campaign}</span>
                    <span className="px-2.5 py-0.5 rounded-full bg-amber-950/60 text-amber-400 border border-amber-800/40 text-[10px] font-bold uppercase tracking-wider flex items-center gap-1">
                      <Clock className="w-3 h-3 text-amber-400" />
                      {item.status === "processing" ? "Processing" : "Scheduled"} ({item.dueDate || "Net-30"})
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* 3. CASH FLOW ANALYTICS & FINANCIAL TIMELINE */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Cash Flow Analytics Chart (2 cols) */}
          <div className="lg:col-span-2 bg-[#0D0D0D] border border-white/20 rounded-2xl p-6 shadow-xl space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-white/10 pb-4">
              <div>
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-emerald-400" />
                  Cash Flow Analytics & Revenue Margins
                </h3>
                <p className="text-xs text-[#8f8f8f]">Monthly incoming brand payments vs outgoing talent payouts & net margin</p>
              </div>
              <div className="flex items-center gap-3 text-xs">
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                  <span className="text-[#8f8f8f]">Brand Receipts</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-white/80" />
                  <span className="text-[#8f8f8f]">Talent Payouts</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
                  <span className="text-[#8f8f8f]">Agency Margin</span>
                </div>
              </div>
            </div>

            {/* Visual Bar Chart */}
            <div className="space-y-5 pt-2">
              {[
                { month: "Apr 2026", incoming: 85000, outgoing: 72250, margin: 12750 },
                { month: "May 2026", incoming: 104000, outgoing: 88400, margin: 15600 },
                { month: "Jun 2026", incoming: 118000, outgoing: 100300, margin: 17700 },
                { month: "Jul 2026 (MTD)", incoming: totalSettledVolume > 0 ? totalSettledVolume : 124500, outgoing: (totalSettledVolume > 0 ? totalSettledVolume : 124500) * 0.85, margin: (totalSettledVolume > 0 ? totalSettledVolume : 124500) * 0.15 }
              ].map((bar) => {
                const maxVal = 140000;
                const incPct = Math.min(100, (bar.incoming / maxVal) * 100);
                const outPct = Math.min(100, (bar.outgoing / maxVal) * 100);
                const marPct = Math.min(100, (bar.margin / maxVal) * 100);

                return (
                  <div key={bar.month} className="space-y-1.5">
                    <div className="flex justify-between text-xs">
                      <span className="font-semibold text-white">{bar.month}</span>
                      <span className="text-[#8f8f8f]">
                        Gross: <strong className="text-white">${bar.incoming.toLocaleString()}</strong> | Net Margin: <strong className="text-emerald-400">${bar.margin.toLocaleString()}</strong>
                      </span>
                    </div>
                    <div className="h-3.5 w-full bg-white/5 rounded-full overflow-hidden flex gap-0.5 p-0.5 border border-white/10">
                      <div style={{ width: `${incPct * 0.7}%` }} className="bg-emerald-500 h-full rounded-l-full" title="Brand Receipts" />
                      <div style={{ width: `${outPct * 0.25}%` }} className="bg-white/70 h-full" title="Talent Payouts" />
                      <div style={{ width: `${marPct * 0.8}%` }} className="bg-emerald-400 h-full rounded-r-full" title="Agency Commission" />
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="pt-4 border-t border-white/10 flex items-center justify-between text-xs text-[#8f8f8f]">
              <span className="flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                Auto-Split Rules Active (85% Talent / 15% Agency Gross Margin)
              </span>
              <span className="font-semibold text-white">Reconciled via Plaid & QuickBooks API</span>
            </div>
          </div>

          {/* Financial Activity Timeline (1 col) */}
          <div className="bg-[#0D0D0D] border border-white/20 rounded-2xl p-6 shadow-xl space-y-5">
            <div className="border-b border-white/10 pb-4">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Clock className="w-4 h-4 text-emerald-400" />
                Financial Activity Timeline
              </h3>
              <p className="text-xs text-[#8f8f8f]">Real-time agency treasury events</p>
            </div>

            <div className="space-y-4">
              {activityTimeline.map((item) => (
                <div key={item.id} className="flex items-start gap-3 text-xs">
                  <div className="mt-0.5 p-1.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
                    {item.type === "deposit" && <Plus className="w-3.5 h-3.5 text-emerald-400" />}
                    {item.type === "brand_payment" && <ArrowDownLeft className="w-3.5 h-3.5 text-white" />}
                    {item.type === "commission" && <Sparkles className="w-3.5 h-3.5 text-emerald-300" />}
                    {item.type === "payout" && <ArrowUpRight className="w-3.5 h-3.5 text-[#8f8f8f]" />}
                    {item.type === "sync" && <RefreshCw className="w-3.5 h-3.5 text-emerald-400" />}
                  </div>
                  <div className="flex-1 space-y-0.5">
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-white">{item.title}</span>
                      {item.amount && (
                        <span className="font-bold text-emerald-400">+${item.amount.toLocaleString()}</span>
                      )}
                    </div>
                    <p className="text-[11px] text-[#8f8f8f]">{item.subtitle}</p>
                    <div className="text-[10px] text-neutral-500">{item.timestamp}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* 4. FINANCIAL INTEGRATIONS & AGENCY BANK ACCOUNTS */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <IntegrationsPanel />
          <BanksAndCardsPanel onConnectAccount={() => setIsPlaidModalOpen(true)} />
        </div>
      </div>

      {/* WALLET CONTACTS OVERLAY MODAL */}
      <AnimatePresence>
        {isWalletContactsOpen && (
          <div className="fixed inset-0 z-50 bg-black/80 px-4 py-16 backdrop-blur-sm flex items-center justify-center">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-2xl bg-[#0D0D0D] light:bg-white border border-white/20 light:border-black/10 rounded-2xl p-6 shadow-2xl space-y-5"
            >
              <div className="flex items-center justify-between border-b border-white/10 light:border-black/10 pb-4">
                <div className="flex items-center gap-2">
                  <Users className="w-5 h-5 text-emerald-500 light:text-emerald-600" />
                  <h3 className="text-base font-bold text-white light:text-[#0F172A]">Wallet ID Contacts & Split Network</h3>
                </div>
                <button
                  onClick={() => setIsWalletContactsOpen(false)}
                  className="p-1 rounded-lg text-[#8f8f8f] light:text-[#475569] hover:text-white light:hover:text-[#0F172A] hover:bg-white/10 light:hover:bg-black/5"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Search Bar */}
              <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#8f8f8f] light:text-[#64748B]" />
                <input
                  type="text"
                  value={contactQuery}
                  onChange={(e) => setContactQuery(e.target.value)}
                  placeholder="Search by name (e.g. John Adams), Agncy ID (@agncy11174), role..."
                  className="w-full pl-11 pr-4 py-3 bg-black light:bg-white border border-white/20 light:border-black/20 rounded-xl text-xs font-semibold text-white light:text-[#0F172A] focus:outline-none focus:border-emerald-500"
                />
              </div>

              {/* Contacts List */}
              <div className="space-y-3 max-h-72 overflow-y-auto pr-1">
                {filteredContacts.map((contact) => {
                  const isAutosplit = autosplitContactIds.includes(contact.id);
                  return (
                    <div key={contact.id} className="p-3.5 rounded-xl border border-white/10 light:border-black/10 bg-white/5 light:bg-slate-50 flex items-center justify-between gap-4">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-emerald-500/10 light:bg-emerald-50 border border-emerald-500/20 light:border-emerald-200 flex items-center justify-center font-bold text-xs text-emerald-400 light:text-emerald-700">
                          {contact.name.split(" ").map((n) => n[0]).join("")}
                        </div>
                        <div>
                          <div className="text-xs font-bold text-white light:text-[#0F172A]">{contact.name}</div>
                          <div className="text-[11px] text-[#8f8f8f] light:text-[#475569]">{contact.handle} • {contact.role}</div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => {
                            setIsWalletContactsOpen(false);
                            router.push("/dashboard/send-request");
                          }}
                          className="px-3 py-1.5 rounded-lg bg-white light:bg-[#0F172A] hover:bg-neutral-200 light:hover:bg-black text-black light:text-white text-xs font-bold transition-all shadow-sm flex items-center gap-1 cursor-pointer"
                        >
                          <Send className="w-3.5 h-3.5 text-black light:text-white" />
                          <span className="light:text-white">Send / Request</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => toggleAutosplitContact(contact.id)}
                          className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all ${
                            isAutosplit
                              ? "bg-emerald-950/60 light:bg-emerald-100 text-emerald-400 light:text-emerald-800 border-emerald-800/40 light:border-emerald-300 font-bold"
                              : "bg-white/5 light:bg-white text-[#8f8f8f] light:text-[#475569] border-white/10 light:border-black/15 hover:text-white light:hover:text-[#0F172A]"
                          }`}
                        >
                          {isAutosplit ? "Autosplit On" : "Autosplit Off"}
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="pt-3 border-t border-white/10 light:border-black/10 flex items-center justify-between text-xs">
                <span className="text-[#8f8f8f] light:text-[#475569]">Direct agency role split configuration</span>
                <button
                  onClick={() => setIsWalletContactsOpen(false)}
                  className="px-4 py-2 rounded-xl bg-white/10 light:bg-slate-200 text-white light:text-[#0F172A] font-semibold hover:bg-white/20 light:hover:bg-slate-300 transition-colors"
                >
                  Close Network
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* READ-ONLY PAYOUT DETAILS MODAL */}
      <AnimatePresence>
        {selectedPayout && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-[#0D0D0D] border border-white/20 rounded-2xl p-6 max-w-md w-full shadow-2xl space-y-5"
            >
              <div className="flex items-center justify-between border-b border-white/10 pb-4">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-5 h-5 text-emerald-400" />
                  <h3 className="text-base font-bold text-white">Talent Payout Record</h3>
                </div>
                <button
                  onClick={() => setSelectedPayout(null)}
                  className="p-1 rounded-lg text-[#8f8f8f] hover:text-white hover:bg-white/10"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-3 text-xs">
                <div className="flex justify-between py-2 border-b border-white/5">
                  <span className="text-[#8f8f8f]">Recipient Talent</span>
                  <span className="font-bold text-white">{selectedPayout.talentName}</span>
                </div>
                <div className="flex justify-between py-2 border-b border-white/5">
                  <span className="text-[#8f8f8f]">Campaign / Project</span>
                  <span className="font-semibold text-white">{selectedPayout.campaign}</span>
                </div>
                <div className="flex justify-between py-2 border-b border-white/5">
                  <span className="text-[#8f8f8f]">Disbursed Amount</span>
                  <span className="font-extrabold text-white text-sm">
                    ${selectedPayout.amount.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                  </span>
                </div>
                <div className="flex justify-between py-2 border-b border-white/5">
                  <span className="text-[#8f8f8f]">Disbursement Date</span>
                  <span className="text-white">{selectedPayout.date}</span>
                </div>
                <div className="flex justify-between py-2 border-b border-white/5">
                  <span className="text-[#8f8f8f]">Audited Status</span>
                  <span className="text-emerald-400 font-bold uppercase tracking-wider text-[10px]">
                    Verified & Settled via ACH
                  </span>
                </div>
              </div>

              <div className="pt-2">
                <button
                  onClick={() => setSelectedPayout(null)}
                  className="w-full py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-semibold text-xs transition-colors"
                >
                  Close Receipt
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* PLAID CONNECTOR MODAL */}
      <AnimatePresence>
        {isPlaidModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
            >
              <PlaidConnector onClose={() => setIsPlaidModalOpen(false)} />
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* EXACT BRAND DEPOSIT MODAL */}
      <AnimatePresence>
        {isDepositModalOpen && (() => {
          const isLight = isLightTheme || (typeof document !== "undefined" && document.documentElement.classList.contains("light"));
          return (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
              <div className="absolute inset-0 bg-black/75 backdrop-blur-md" onClick={() => !isProcessingDeposit && setIsDepositModalOpen(false)} />
              
              <div className={`relative w-full max-w-lg rounded-2xl border shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200 ${
                isLight 
                  ? "bg-white border-black/20 text-[#0F172A]" 
                  : "bg-[#0A0A0A] border-white/20 text-white"
              }`}>
                {/* Modal Header */}
                <div className={`p-6 border-b flex items-center justify-between ${
                  isLight ? "border-black/10 bg-slate-50" : "border-white/10 bg-white/[0.02]"
                }`}>
                  <div className="flex items-center gap-3">
                    <div className={`h-10 w-10 rounded-xl border flex items-center justify-center ${
                      isLight ? "bg-white border-black/20 text-[#0F172A] shadow-xs" : "bg-white/10 border-white/20 text-white"
                    }`}>
                      <Wallet className="h-5 w-5" />
                    </div>
                    <div>
                      <h3 className={`text-lg font-bold leading-tight ${isLight ? "text-[#0F172A]" : "text-white"}`}>Deposit Treasury Balance</h3>
                      <p className={`text-xs font-medium ${isLight ? "text-[#475569]" : "text-neutral-400"}`}>Add funds to instant liquidity balance</p>
                    </div>
                  </div>
                  <button
                    onClick={() => setIsDepositModalOpen(false)}
                    className={`p-2 rounded-lg transition-colors cursor-pointer ${
                      isLight ? "text-[#475569] hover:bg-slate-200 hover:text-[#0F172A]" : "text-neutral-400 hover:bg-white/10 hover:text-white"
                    }`}
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>

                {/* Modal Body */}
                <div className="p-6 space-y-6 max-h-[80vh] overflow-y-auto">
                  {depositSuccessMsg ? (
                    <div className="py-10 text-center space-y-4">
                      <div className="h-16 w-16 rounded-full bg-emerald-500/20 border border-emerald-500 text-emerald-500 flex items-center justify-center mx-auto animate-bounce">
                        <CheckCircle2 className="h-8 w-8" />
                      </div>
                      <h4 className={`text-xl font-bold ${isLight ? "text-[#0F172A]" : "text-white"}`}>Deposit Successful</h4>
                      <p className={`text-sm max-w-[280px] mx-auto font-medium ${isLight ? "text-[#475569]" : "text-neutral-300"}`}>{depositSuccessMsg}</p>
                    </div>
                  ) : isProcessingDeposit ? (
                    <div className="py-14 text-center space-y-4">
                      <Loader2 className={`h-10 w-10 animate-spin mx-auto ${isLight ? "text-[#0F172A]" : "text-white"}`} />
                      <div>
                        <p className={`text-lg font-bold ${isLight ? "text-[#0F172A]" : "text-white"}`}>Processing Deposit...</p>
                        <p className={`text-xs mt-1 font-medium ${isLight ? "text-[#475569]" : "text-neutral-400"}`}>Securing funds via selected payment channel.</p>
                      </div>
                    </div>
                  ) : (
                    <form onSubmit={handleConfirmDeposit} className="space-y-6">
                      {/* Step 1: Amount Selection */}
                      <div>
                        <label className={`block text-xs font-bold uppercase tracking-wider mb-2 ${isLight ? "text-[#0F172A]" : "text-neutral-300"}`}>
                          Deposit Amount ($USD)
                        </label>
                        <div className="relative">
                          <span className={`absolute left-3.5 top-1/2 -translate-y-1/2 text-lg font-extrabold ${isLight ? "text-[#0F172A]" : "text-neutral-400"}`}>$</span>
                          <input
                            type="number"
                            min="1"
                            step="any"
                            value={depositAmount}
                            onChange={(e) => setDepositAmount(e.target.value)}
                            placeholder="1000.00"
                            className={`w-full pl-8 pr-4 py-3 border rounded-xl text-lg font-extrabold focus:outline-none font-mono ${
                              isLight 
                                ? "bg-white border-black/20 text-[#0F172A] focus:border-black shadow-xs" 
                                : "bg-black border-white/20 text-white focus:border-white"
                            }`}
                            required
                          />
                        </div>
                        
                        {/* Quick Pills */}
                        <div className="grid grid-cols-4 gap-2 mt-2.5">
                          {["500", "1000", "2500", "5000"].map((preset) => (
                            <button
                              key={preset}
                              type="button"
                              onClick={() => setDepositAmount(preset)}
                              className={`py-2 text-xs font-bold rounded-lg border transition-all cursor-pointer ${
                                depositAmount === preset
                                  ? isLight
                                    ? "border-black bg-[#0F172A] text-white shadow-md font-extrabold"
                                    : "border-white bg-white text-black shadow-md font-extrabold"
                                  : isLight
                                    ? "border-black/20 bg-slate-50 text-[#0F172A] hover:bg-slate-100 hover:border-black/40 font-bold shadow-xs"
                                    : "border-white/10 bg-white/[0.02] text-neutral-300 hover:border-white/20"
                              }`}
                            >
                              +${parseInt(preset).toLocaleString()}
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Step 2: Method Selection */}
                      <div>
                        <label className={`block text-xs font-bold uppercase tracking-wider mb-2 ${isLight ? "text-[#0F172A]" : "text-neutral-300"}`}>
                          Deposit Method
                        </label>
                        <div className="grid grid-cols-2 gap-2.5">
                          {[
                            { id: "card", label: "Linked Card", sub: "Instant • Standard Fee" },
                            { id: "ach", label: "ACH Bank Transfer", sub: "1-2 Days • 0% Fee" },
                            { id: "wire", label: "Wire Transfer", sub: "Same Day • $15 Fee" },
                            { id: "rtp", label: "RTP Instant", sub: "Instant • $5 Fee" },
                          ].map((m) => {
                            const isSelected = depositMethod === m.id;
                            return (
                              <button
                                key={m.id}
                                type="button"
                                onClick={() => setDepositMethod(m.id as any)}
                                className={`p-3.5 rounded-xl border text-left transition-all cursor-pointer ${
                                  isLight
                                    ? isSelected
                                      ? "border-black bg-[#0F172A] text-white shadow-md font-bold"
                                      : "border-black/20 bg-slate-50 text-[#0F172A] hover:bg-slate-100 hover:border-black/40 font-semibold shadow-xs"
                                    : isSelected
                                      ? "border-white bg-white text-black shadow-md font-bold"
                                      : "border-white/10 bg-white/5 text-white hover:border-white/20 font-semibold"
                                }`}
                              >
                                <div className="flex items-center justify-between">
                                  <span className={`text-xs font-bold ${
                                    isLight
                                      ? isSelected ? "text-white" : "text-[#0F172A]"
                                      : isSelected ? "text-black" : "text-white"
                                  }`}>{m.label}</span>
                                  <div className={`h-4 w-4 rounded-full border flex items-center justify-center ${
                                    isLight
                                      ? isSelected
                                        ? "border-white bg-white text-black"
                                        : "border-black/40 bg-transparent"
                                      : isSelected
                                        ? "border-black bg-black text-white"
                                        : "border-white/30 bg-transparent"
                                  }`}>
                                    {isSelected && (
                                      <div className={`h-2 w-2 rounded-full ${isLight ? "bg-black" : "bg-white"}`} />
                                    )}
                                  </div>
                                </div>
                                <span className={`text-[10px] block mt-1.5 font-medium ${
                                  isLight
                                    ? isSelected ? "text-slate-300" : "text-[#475569]"
                                    : isSelected ? "text-neutral-700" : "text-neutral-400"
                                }`}>{m.sub}</span>
                              </button>
                            );
                          })}
                        </div>
                      </div>

                      {/* Step 3: Card Selection if Linked Card chosen */}
                      {depositMethod === "card" && (
                        <div className="space-y-3">
                          <div className="flex justify-between items-center">
                            <label className={`text-xs font-bold uppercase tracking-wider ${isLight ? "text-[#0F172A]" : "text-neutral-300"}`}>
                              Select Card
                            </label>
                            <button
                              type="button"
                              onClick={() => setShowAddCard(!showAddCard)}
                              className={`text-xs font-bold flex items-center gap-1 cursor-pointer ${
                                isLight ? "text-[#475569] hover:text-[#0F172A]" : "text-neutral-300 hover:text-white"
                              }`}
                            >
                              <Plus className="h-3 w-3" />
                              {showAddCard ? "Use Saved Card" : "Add New Card"}
                            </button>
                          </div>

                          {showAddCard ? (
                            <div className={`p-4 rounded-xl border space-y-3 ${
                              isLight ? "bg-slate-50 border-black/20" : "bg-black border-white/20"
                            }`}>
                              <div>
                                <label className={`text-[10px] uppercase font-bold ${isLight ? "text-[#475569]" : "text-neutral-400"}`}>Cardholder Name</label>
                                <input
                                  type="text"
                                  placeholder="Jane Doe"
                                  value={newCardHolder}
                                  onChange={(e) => setNewCardHolder(e.target.value)}
                                  className={`w-full mt-1 border rounded-lg p-2 text-xs font-semibold focus:outline-none ${
                                    isLight ? "bg-white border-black/20 text-[#0F172A] focus:border-black" : "bg-neutral-900 border-white/20 text-white focus:border-white"
                                  }`}
                                />
                              </div>
                              <div>
                                <label className={`text-[10px] uppercase font-bold ${isLight ? "text-[#475569]" : "text-neutral-400"}`}>Card Number</label>
                                <input
                                  type="text"
                                  placeholder="4000 0000 0000 0000"
                                  value={newCardNumber}
                                  onChange={(e) => setNewCardNumber(e.target.value)}
                                  className={`w-full mt-1 border rounded-lg p-2 text-xs font-semibold focus:outline-none ${
                                    isLight ? "bg-white border-black/20 text-[#0F172A] focus:border-black" : "bg-neutral-900 border-white/20 text-white focus:border-white"
                                  }`}
                                />
                              </div>
                              <div className="grid grid-cols-3 gap-2">
                                <div>
                                  <label className={`text-[10px] uppercase font-bold ${isLight ? "text-[#475569]" : "text-neutral-400"}`}>Expires</label>
                                  <input
                                    type="text"
                                    placeholder="MM/YY"
                                    value={newCardExpiry}
                                    onChange={(e) => setNewCardExpiry(e.target.value)}
                                    className={`w-full mt-1 border rounded-lg p-2 text-xs font-semibold focus:outline-none ${
                                      isLight ? "bg-white border-black/20 text-[#0F172A] focus:border-black" : "bg-neutral-900 border-white/20 text-white focus:border-white"
                                    }`}
                                  />
                                </div>
                                <div>
                                  <label className={`text-[10px] uppercase font-bold ${isLight ? "text-[#475569]" : "text-neutral-400"}`}>CVC</label>
                                  <input
                                    type="text"
                                    placeholder="123"
                                    value={newCardCVC}
                                    onChange={(e) => setNewCardCVC(e.target.value)}
                                    className={`w-full mt-1 border rounded-lg p-2 text-xs font-semibold focus:outline-none ${
                                      isLight ? "bg-white border-black/20 text-[#0F172A] focus:border-black" : "bg-neutral-900 border-white/20 text-white focus:border-white"
                                    }`}
                                  />
                                </div>
                                <div>
                                  <label className={`text-[10px] uppercase font-bold ${isLight ? "text-[#475569]" : "text-neutral-400"}`}>ZIP</label>
                                  <input
                                    type="text"
                                    placeholder="10001"
                                    value={newCardZip}
                                    onChange={(e) => setNewCardZip(e.target.value)}
                                    className={`w-full mt-1 border rounded-lg p-2 text-xs font-semibold focus:outline-none ${
                                      isLight ? "bg-white border-black/20 text-[#0F172A] focus:border-black" : "bg-neutral-900 border-white/20 text-white focus:border-white"
                                    }`}
                                  />
                                </div>
                              </div>
                              <button
                                type="button"
                                onClick={handleAddNewCard}
                                className={`w-full py-2 font-bold text-xs rounded-lg mt-2 cursor-pointer transition-colors shadow-sm ${
                                  isLight ? "bg-[#0F172A] text-white hover:bg-black" : "bg-white/10 hover:bg-white/20 text-white border border-white/20"
                                }`}
                              >
                                Save & Attach Card
                              </button>
                            </div>
                          ) : (
                            <div className="space-y-2.5">
                              {linkedCards.map((card: any) => {
                                const isSelected = card.id === selectedCardId;
                                const isChase = card.id.includes("1") || card.id.includes("chase") || card.name.toLowerCase().includes("chase");
                                const isMercury = card.id.includes("2") || card.id.includes("mercury") || card.name.toLowerCase().includes("mercury");

                                return (
                                  <div
                                    key={card.id}
                                    onClick={() => setSelectedCardId(card.id)}
                                    className={`p-3.5 rounded-xl border transition-all cursor-pointer flex items-center justify-between ${
                                      isLight
                                        ? isSelected
                                          ? "border-black bg-[#0F172A] text-white shadow-md font-bold"
                                          : "border-black/20 bg-white text-[#0F172A] hover:bg-slate-100 hover:border-black/40 font-semibold shadow-xs"
                                        : isSelected
                                          ? "border-white bg-white text-black shadow-md font-bold"
                                          : "border-white/10 bg-white/5 text-white hover:border-white/20 font-semibold"
                                    }`}
                                  >
                                    <div className="flex items-center gap-3">
                                      <div className="h-9 w-14 shrink-0 rounded-lg border border-black/20 bg-white p-0.5 flex items-center justify-center shadow-xs overflow-hidden">
                                        <img
                                          src={
                                            card.image 
                                              || (isChase ? "/chase-ink-business-unlimited.png" : isMercury ? "/mercurycard.png" : "/visa-logo.svg")
                                          }
                                          alt={card.name}
                                          className="h-full w-full object-contain"
                                        />
                                      </div>
                                      <div>
                                        <p className={`text-xs font-bold ${
                                          isLight
                                            ? isSelected ? "text-white" : "text-[#0F172A]"
                                            : isSelected ? "text-black" : "text-white"
                                        }`}>{card.name}</p>
                                        <p className={`text-[10px] font-medium ${
                                          isLight
                                            ? isSelected ? "text-slate-300" : "text-[#475569]"
                                            : isSelected ? "text-neutral-700" : "text-neutral-400"
                                        }`}>{card.detail}</p>
                                      </div>
                                    </div>
                                    <div className={`h-4 w-4 rounded-full border flex items-center justify-center ${
                                      isLight
                                        ? isSelected
                                          ? "border-white bg-white text-black"
                                          : "border-black/40 bg-transparent"
                                        : isSelected
                                          ? "border-black bg-black text-white"
                                          : "border-white/30 bg-transparent"
                                    }`}>
                                      {isSelected && <Check className="h-2.5 w-2.5 stroke-[3]" />}
                                    </div>
                                  </div>
                                );
                              })}
                            </div>
                          )}
                        </div>
                      )}

                      {/* Actions */}
                      <div className="pt-2 flex items-center gap-3">
                        <button
                          type="button"
                          onClick={() => setIsDepositModalOpen(false)}
                          className={`flex-1 py-3 rounded-xl border text-xs font-bold transition-all cursor-pointer shadow-xs ${
                            isLight 
                              ? "bg-white border-black/20 text-[#0F172A] hover:bg-slate-100" 
                              : "border-white/20 text-neutral-300 hover:bg-white/5 hover:text-white"
                          }`}
                        >
                          Cancel
                        </button>
                        <button
                          type="submit"
                          className={`flex-1 py-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 shadow-md cursor-pointer ${
                            isLight 
                              ? "bg-[#0F172A] text-white hover:bg-black" 
                              : "bg-white text-black hover:bg-neutral-200"
                          }`}
                        >
                          <Wallet className="h-4 w-4 text-current" />
                          Confirm Deposit
                        </button>
                      </div>
                    </form>
                  )}
                </div>
              </div>
            </div>
          );
        })()}
      </AnimatePresence>
    </main>
  );
}
