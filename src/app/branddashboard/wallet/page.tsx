"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useApp } from "@/context/AppContext";
import Link from "next/link";
import { 
  CreditCard, 
  Landmark, 
  Plus, 
  ShieldCheck, 
  Sparkles, 
  Zap, 
  Coins, 
  Building2, 
  CheckCircle2, 
  ChevronRight, 
  ArrowLeft, 
  RefreshCw, 
  Lock, 
  ExternalLink, 
  Award,
  Wallet as WalletIcon,
  HelpCircle,
  MapPin,
  Home as HomeIcon,
  Gift,
  Check,
  X,
  Sun,
  Moon,
  Loader2,
  Link2
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface WalletItem {
  id: string;
  type: "card" | "account";
  title: string;
  subtitle: string;
  last4: string;
  brand: "mastercard" | "visa" | "amex" | "bank" | "treasury" | "agncypay";
  gradient: string;
  isDefault?: boolean;
  image?: string;
}

const INITIAL_CARDS: WalletItem[] = [
  {
    id: "card-mc",
    type: "card",
    title: "Mastercard Commercial",
    subtitle: "Primary Corporate Card",
    last4: "8597",
    brand: "mastercard",
    gradient: "from-[#F8FAFC] via-[#E2E8F0] to-[#CBD5E1] border-neutral-300 text-slate-900 font-bold",
    isDefault: true
  },
  {
    id: "card-escrow",
    type: "card",
    title: "Escrow Campaign Card",
    subtitle: "Dedicated Campaign Reserve",
    last4: "4210",
    brand: "visa",
    gradient: "from-[#1e1b4b] via-[#312e81] to-[#17153B] border-[#818cf8]/40 text-indigo-100 force-white-text"
  }
];

const INITIAL_ACCOUNTS: WalletItem[] = [
  {
    id: "acc-jpm",
    type: "account",
    title: "JPMorgan Chase Commercial",
    subtitle: "Operating Account • Verified",
    last4: "4419",
    brand: "bank",
    gradient: "from-[#0284c7] via-[#0369a1] to-[#075985] border-sky-400/40 text-white force-white-text",
    isDefault: true
  },
  {
    id: "acc-svb",
    type: "account",
    title: "Silicon Valley Bank",
    subtitle: "Payroll & Talent Disbursal Hub",
    last4: "8821",
    brand: "bank",
    gradient: "from-[#0f766e] via-[#115e59] to-[#134e4a] border-teal-400/40 text-white force-white-text"
  },
  {
    id: "acc-scotia",
    type: "account",
    title: "Scotiabank Escrow Settlement",
    subtitle: "Canadian Dollar Reserve • Verified",
    last4: "1092",
    brand: "bank",
    gradient: "from-[#991b1b] via-[#7f1d1d] to-[#450a0a] border-red-500/40 text-white force-white-text"
  }
];

export default function WalletDashboardPage() {
  const router = useRouter();
  const { state } = useApp();
  const workspaceType = state.user ? state.user.accountType : "brand";

  const [isLightTheme, setIsLightTheme] = useState(true);
  const [activeTab, setActiveTab] = useState<"cards" | "accounts">("cards");
  const [cards, setCards] = useState<WalletItem[]>(INITIAL_CARDS);
  const [accounts, setAccounts] = useState<WalletItem[]>(INITIAL_ACCOUNTS);
  const [selectedItemId, setSelectedItemId] = useState<string | null>("card-mc");
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  // New Card/Account Form State
  const [newTitle, setNewTitle] = useState("");
  const [newLast4, setNewLast4] = useState("");
  const [newType, setNewType] = useState<"mastercard" | "visa" | "amex" | "bank">("mastercard");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");

  // Deposit state for Treasury Pool Card
  const [depositedBalance, setDepositedBalance] = useState(25000);
  const [depositAmount, setDepositAmount] = useState("1000");
  const [depositMethod, setDepositMethod] = useState<"card" | "ach" | "wire" | "rtp">("card");
  const [isProcessingDeposit, setIsProcessingDeposit] = useState(false);
  const [depositSuccessMsg, setDepositSuccessMsg] = useState<string | null>(null);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const userEmail = state.user?.email || "guest";
      const savedBalance = localStorage.getItem(`brand_deposited_balance_${userEmail}`);
      if (savedBalance) {
        setDepositedBalance(parseFloat(savedBalance));
      }
    }
  }, [state.user]);

  const handleConfirmDeposit = (e: React.FormEvent) => {
    e.preventDefault();
    const numericAmt = parseFloat(depositAmount);
    if (isNaN(numericAmt) || numericAmt <= 0) return;

    setIsProcessingDeposit(true);
    setTimeout(() => {
      const userEmail = state.user?.email || "guest";
      const updated = depositedBalance + numericAmt;
      setDepositedBalance(updated);
      localStorage.setItem(`brand_deposited_balance_${userEmail}`, updated.toString());
      setIsProcessingDeposit(false);
      setDepositSuccessMsg(`Successfully deposited $${numericAmt.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} into AGNCYPAY Treasury!`);
      setTimeout(() => {
        setDepositSuccessMsg(null);
        setDepositAmount("1000");
      }, 3000);
    }, 1000);
  };

  useEffect(() => {
    if (typeof window !== "undefined") {
      const savedTheme = localStorage.getItem("agncypay_theme_brand");
      if (savedTheme === "light") {
        document.documentElement.classList.add("light");
        document.documentElement.classList.remove("dark");
        setIsLightTheme(true);
      } else if (savedTheme === "dark") {
        document.documentElement.classList.add("dark");
        document.documentElement.classList.remove("light");
        setIsLightTheme(false);
      } else {
        const isLight = document.documentElement.classList.contains("light");
        setIsLightTheme(isLight);
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

  const items = activeTab === "cards" ? cards : accounts;
  const selectedItem = items.find(i => i.id === selectedItemId);

  const handleAddItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle || !newLast4) return;

    setIsSubmitting(true);
    setTimeout(() => {
      const newItem: WalletItem = {
        id: `item-${Date.now()}`,
        type: activeTab === "cards" ? "card" : "account",
        title: newTitle,
        subtitle: activeTab === "cards" ? "Linked Corporate Card • Verified" : "Linked Bank Account • Verified",
        last4: newLast4.slice(-4),
        brand: activeTab === "cards" ? (newType as any) : "bank",
        gradient: activeTab === "cards" 
          ? "from-[#334155] via-[#1E293B] to-[#0F172A] border-white/30 text-white force-white-text"
          : "from-[#0369a1] via-[#075985] to-[#0c4a6e] border-sky-400/40 text-white force-white-text"
      };

      if (activeTab === "cards") {
        setCards(prev => [...prev, newItem]);
      } else {
        setAccounts(prev => [...prev, newItem]);
      }

      setIsSubmitting(false);
      setSuccessMsg("Successfully linked to your AgncyPay Wallet!");
      setSelectedItemId(newItem.id);

      setTimeout(() => {
        setSuccessMsg("");
        setNewTitle("");
        setNewLast4("");
      }, 1200);
    }, 1000);
  };

  return (
    <main className={`min-h-screen flex flex-col font-sans antialiased relative transition-colors duration-200 ${isLightTheme ? "bg-white text-[#0F172A]" : "bg-black text-white"}`}>
      <div className={`absolute top-0 left-1/4 w-[600px] h-[600px] rounded-full blur-[120px] pointer-events-none ${isLightTheme ? "bg-blue-500/[0.05]" : "bg-white/[0.02]"}`} />
      <div className={`absolute bottom-10 right-10 w-[400px] h-[400px] rounded-full blur-[100px] pointer-events-none ${isLightTheme ? "bg-[#4B6BFB]/[0.06]" : "bg-[#4B6BFB]/[0.03]"}`} />

      {/* Top Header Bar */}
      <header className={`border-b sticky top-0 z-40 px-6 py-4 backdrop-blur-md transition-colors ${isLightTheme ? "border-black/10 bg-white/80" : "border-white/10 bg-black/60"}`}>
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-3">
              <Link href="/" className="flex items-center gap-2 cursor-pointer">
                <img
                  src="/agncypaybrand.png"
                  alt="AgncyPay"
                  className="h-10 w-auto object-contain scale-[1.3] origin-left transition-transform"
                />
              </Link>
            </div>
            <span className={`h-4 w-[1px] hidden md:block ${isLightTheme ? "bg-black/20" : "bg-white/20"}`} />
            <div className={`hidden md:flex items-center gap-2 px-3 py-1 rounded-full border text-[11px] font-bold uppercase tracking-wider ${isLightTheme ? "bg-black/5 border-black/10 text-[#0F172A]" : "bg-white/10 border-white/20 text-white"}`}>
              <Building2 className={`h-3 w-3 ${isLightTheme ? "text-[#0F172A]" : "text-white"}`} />
              Brand Portal
            </div>
          </div>

          {/* Bilt-Style Navigation Bar */}
          <nav className={`hidden lg:flex items-center gap-1 p-1 rounded-full border ${isLightTheme ? "bg-black/[0.05] border-black/10" : "bg-white/[0.05] border-white/20"}`}>
            <button 
              onClick={() => router.push("/branddashboard")}
              className={`px-4 py-1.5 rounded-full text-xs font-semibold transition-all cursor-pointer ${isLightTheme ? "text-[#475569] hover:text-[#0F172A] hover:bg-black/5" : "text-[#8f8f8f] hover:text-white hover:bg-white/5"}`}
            >
              Home
            </button>
            <button 
              onClick={() => router.push("/branddashboard/invoices")}
              className={`px-4 py-1.5 rounded-full text-xs font-semibold transition-all cursor-pointer ${isLightTheme ? "text-[#475569] hover:text-[#0F172A] hover:bg-black/5" : "text-[#8f8f8f] hover:text-white hover:bg-white/5"}`}
            >
              Payments
            </button>
            {workspaceType !== "brand" && (
              <button 
                onClick={() => router.push("/branddashboard/nodes")}
                className={`px-4 py-1.5 rounded-full text-xs font-semibold transition-all cursor-pointer ${isLightTheme ? "text-[#475569] hover:text-[#0F172A] hover:bg-black/5" : "text-[#8f8f8f] hover:text-white hover:bg-white/5"}`}
              >
                Payout Split Nodes
              </button>
            )}
            <button 
              onClick={() => router.push("/branddashboard/wallet")}
              className={`px-4 py-1.5 rounded-full text-xs font-bold shadow-sm border transition-all cursor-pointer flex items-center gap-1.5 ${isLightTheme ? "bg-[#0F172A] text-white border-black/10 force-white-text" : "bg-white text-black border-white/20"}`}
            >
              <WalletIcon className="w-3.5 h-3.5" />
              Wallet
            </button>
          </nav>

          {/* Right Controls */}
          <div className="flex items-center gap-3">
            <button
              onClick={toggleTheme}
              className={`p-2 rounded-full transition-colors cursor-pointer ${isLightTheme ? "text-[#0F172A] hover:bg-black/5" : "text-neutral-400 hover:text-white hover:bg-white/5"}`}
              title="Toggle Theme"
            >
              {isLightTheme ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />}
            </button>
            <div className="flex items-center gap-2">
              <div className={`h-8 w-8 rounded-full border flex items-center justify-center font-bold text-xs ${isLightTheme ? "bg-black/5 border-black/10 text-black" : "bg-white/[0.05] border-white/20 text-white"}`}>
                {state.user?.fullName ? state.user.fullName.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2) : "AD"}
              </div>
              <span className={`text-xs font-bold hidden sm:inline ${isLightTheme ? "text-black" : "text-white"}`}>
                {state.workspaces.find(w => w.id === state.activeWorkspaceId)?.name || state.user?.fullName || "Adidas Corporate"}
              </span>
            </div>
          </div>
        </div>
      </header>

      {/* Main Body Content - Bilt Wallet Replica */}
      <div className="max-w-7xl mx-auto px-6 py-10 flex-1 w-full">
        
        {/* Title & Toggle Bar */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
          <div>
            <h1 className={`text-2xl md:text-3xl font-black tracking-tight flex items-center gap-2.5 ${isLightTheme ? "text-[#0F172A]" : "text-white"}`}>
              Your Wallet
            </h1>
            <p className={`text-xs font-medium mt-1 ${isLightTheme ? "text-[#475569]" : "text-neutral-400"}`}>
              Manage commercial cards, treasury balances, and settlement bank accounts.
            </p>
          </div>

          {/* Bilt Pill Toggle for Cards | Accounts */}
          <div className={`p-1.5 rounded-full flex items-center gap-1 shadow-md border ${isLightTheme ? "bg-slate-200 border-slate-300" : "bg-[#111111] border-white/10"}`}>
            <button
              onClick={() => {
                setActiveTab("cards");
                setSelectedItemId("add");
              }}
              className={`px-4 py-1.5 rounded-full text-xs font-extrabold flex items-center gap-2 transition-all cursor-pointer ${
                activeTab === "cards"
                  ? "bg-white text-black shadow-md scale-[1.02]"
                  : isLightTheme
                    ? "text-slate-600 hover:text-black bg-transparent"
                    : "text-neutral-400 hover:text-white bg-transparent"
              }`}
            >
              <CreditCard className="w-3.5 h-3.5" />
              <span>Cards</span>
            </button>
            <button
              onClick={() => {
                setActiveTab("accounts");
                setSelectedItemId("add");
              }}
              className={`px-4 py-1.5 rounded-full text-xs font-extrabold flex items-center gap-2 transition-all cursor-pointer ${
                activeTab === "accounts"
                  ? "bg-white text-black shadow-md scale-[1.02]"
                  : isLightTheme
                    ? "text-slate-600 hover:text-black bg-transparent"
                    : "text-neutral-400 hover:text-white bg-transparent"
              }`}
            >
              <Landmark className="w-3.5 h-3.5" />
              <span>Accounts</span>
            </button>
          </div>
        </div>



        {/* Carousel / Card Selector Row */}
        <div className="flex items-center gap-4 overflow-x-auto pb-4 pt-1 scrollbar-none">
          
          {/* Add Card / Account Button Tile */}
          <button
            onClick={() => {
              setIsAddModalOpen(true);
            }}
            className={`shrink-0 w-64 h-40 rounded-2xl border transition-all flex flex-col items-center justify-center gap-2 cursor-pointer ${
              isLightTheme
                ? "bg-slate-100/80 border-dashed border-slate-300 hover:border-slate-400 text-slate-600 hover:text-black hover:bg-slate-100"
                : "bg-white/[0.02] border-dashed border-white/20 hover:border-white/40 text-neutral-400 hover:text-white hover:bg-white/[0.05]"
            }`}
          >
            <div className={`w-10 h-10 rounded-full flex items-center justify-center ${isLightTheme ? "bg-black/5" : "bg-white/10"}`}>
              <Plus className={`w-5 h-5 ${isLightTheme ? "text-[#0F172A]" : "text-white"}`} />
            </div>
            <span className={`text-xs font-bold ${isLightTheme ? "text-[#0F172A]" : "text-white"}`}>
              {activeTab === "cards" ? "Add card" : "Link account"}
            </span>
          </button>

          {/* Item Tiles */}
          {items.map((item) => {
            const isSelected = selectedItemId === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setSelectedItemId(item.id)}
                className={`shrink-0 w-64 h-40 rounded-2xl ${item.image ? "p-0" : "p-5"} bg-gradient-to-br ${item.gradient} border transition-all flex flex-col justify-between text-left cursor-pointer relative overflow-hidden shadow-md ${
                  isSelected
                    ? isLightTheme
                      ? "ring-2 ring-black ring-offset-2 ring-offset-[#F8FAFC] scale-[1.03] shadow-xl"
                      : "ring-2 ring-white ring-offset-2 ring-offset-black scale-[1.03] shadow-xl"
                    : "opacity-85 hover:opacity-100 hover:scale-[1.01]"
                }`}
              >
                {item.image ? (
                  <>
                    <img src={item.image} alt={item.title} className="w-full h-full object-cover scale-[1.26] transition-transform duration-500 hover:scale-[1.32]" />
                    {item.isDefault && (
                      <span className="absolute bottom-2.5 right-2.5 px-2 py-0.5 rounded text-[9px] font-black uppercase bg-black/80 text-white backdrop-blur-sm border border-white/20 z-10 shadow-md">
                        Default
                      </span>
                    )}
                  </>
                ) : (
                  <>
                    <div className="flex justify-between items-start w-full">
                      <span className="text-[11px] font-extrabold truncate w-40">{item.title}</span>
                      {item.brand === "mastercard" && (
                        <div className="flex -space-x-1">
                          <div className="w-4 h-4 rounded-full bg-red-500/80" />
                          <div className="w-4 h-4 rounded-full bg-amber-500/80" />
                        </div>
                      )}
                      {item.brand === "visa" && <span className="text-[10px] font-black italic tracking-widest">VISA</span>}
                      {item.brand === "agncypay" && <Sparkles className="w-3.5 h-3.5 text-sky-400" />}
                      {item.brand === "bank" && <Landmark className="w-3.5 h-3.5 opacity-80" />}
                      {item.brand === "treasury" && <Coins className="w-3.5 h-3.5 text-amber-300" />}
                    </div>

                    <div>
                      <p className="text-[10px] opacity-75 font-medium truncate">{item.subtitle}</p>
                      <p className="text-xs font-mono font-bold tracking-wider mt-0.5">
                        {item.last4 === "APPLY" || item.last4 === "POOL" ? item.last4 : `•••• ${item.last4}`}
                      </p>
                    </div>

                    {item.isDefault && (
                      <span className="absolute bottom-2 right-2 px-1.5 py-0.5 rounded text-[8px] font-black uppercase bg-white/20 backdrop-blur-sm force-white-text">
                        Default
                      </span>
                    )}
                  </>
                )}
              </button>
            );
          })}
        </div>

        {/* Main Content Showcase (Below Cards) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mt-8">
          
          {/* Left Container - Card Details & Controls */}
          <div className={`lg:col-span-7 rounded-3xl border p-8 shadow-xl flex flex-col justify-between min-h-[380px] relative overflow-hidden transition-colors ${isLightTheme ? "bg-white border-black/10" : "bg-[#090909] border-white/10"}`}>
            <div className={`absolute -right-20 -bottom-20 w-80 h-80 rounded-full blur-3xl pointer-events-none ${isLightTheme ? "bg-black/[0.02]" : "bg-white/[0.02]"}`} />
            
            <div>
              <div className={`flex items-center justify-between border-b pb-4 mb-6 ${isLightTheme ? "border-slate-200" : "border-white/10"}`}>
                <h2 className={`text-lg font-black flex items-center gap-2 ${isLightTheme ? "text-[#0F172A]" : "text-white"}`}>
                  Card Details & Settings
                </h2>
                <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">
                  Active Card
                </span>
              </div>

              <div className={`p-6 rounded-2xl border ${isLightTheme ? "bg-slate-50 border-slate-200" : "bg-white/[0.02] border-white/10"} mb-4`}>
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h4 className={`text-sm font-black ${isLightTheme ? "text-[#0F172A]" : "text-white"}`}>{selectedItem?.title}</h4>
                    <p className={`text-[11px] ${isLightTheme ? "text-slate-500" : "text-neutral-400"}`}>{selectedItem?.subtitle}</p>
                  </div>
                  <div className="text-right">
                    <span className={`text-xs block ${isLightTheme ? "text-slate-500" : "text-neutral-400"}`}>Card Number</span>
                    <span className={`text-sm font-mono font-bold ${isLightTheme ? "text-[#0F172A]" : "text-white"}`}>{selectedItem?.last4 === "APPLY" ? "APPLY" : `•••• •••• •••• ${selectedItem?.last4}`}</span>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4 pt-4 border-t border-white/10 light:border-black/10 text-xs">
                  <div>
                    <span className="text-neutral-400 block">Status</span>
                    <span className="font-bold text-emerald-500">Connected & Verified</span>
                  </div>
                  <div>
                    <span className="text-neutral-400 block">Type</span>
                    <span className="font-bold uppercase">{selectedItem?.brand || "Visa"}</span>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <button className={`py-3 rounded-xl border text-xs font-bold transition-all cursor-pointer ${isLightTheme ? "bg-white border-black/20 text-[#0F172A] hover:bg-slate-100" : "border-white/20 text-neutral-300 hover:bg-white/5 hover:text-white"}`}>
                  Freeze Card
                </button>
                <button className={`py-3 rounded-xl border text-xs font-bold transition-all cursor-pointer ${isLightTheme ? "bg-white border-black/20 text-[#0F172A] hover:bg-slate-100" : "border-white/20 text-neutral-300 hover:bg-white/5 hover:text-white"}`}>
                  Change Spending Limit
                </button>
              </div>
            </div>
          </div>

          {/* Right Container - Replaced with walletleftbottomimage.png */}
          <div className={`lg:col-span-5 rounded-3xl overflow-hidden border flex transition-colors ${isLightTheme ? "border-black/10 bg-slate-50" : "border-white/10 bg-[#090909]"}`}>
            <img 
              src="/walletleftbottomimage.png" 
              alt="Global Money Benefits" 
              className="w-full h-full object-contain"
            />
          </div>

        </div>

      </div>

      {/* Footer Replica (Bilt Style) */}
      <footer className={`border-t py-12 px-6 mt-16 text-xs transition-colors ${isLightTheme ? "border-black/10 bg-white text-slate-600" : "border-white/10 bg-black text-neutral-500"}`}>
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div className="space-y-2">
            <div className={`flex items-center gap-2 font-black tracking-widest text-base ${isLightTheme ? "text-black" : "text-white"}`}>
              <span>AGNCYPAY</span>
              <span className={`text-xs border px-1 rounded ${isLightTheme ? "border-black/30" : "border-white/30"}`}>⊞</span>
            </div>
            <p className="text-[11px]">
              © 2026 AgncyPay Technologies, Inc. All rights reserved.<br />
              AgncyPay Payments LLC (NMLS ID 2627740) • AgncyPay Treasury LLC (NMLS ID 2675904)
            </p>
          </div>

          <div className={`flex flex-wrap gap-6 text-xs font-semibold ${isLightTheme ? "text-slate-600" : "text-neutral-400"}`}>
            <a href="#" className={`transition-colors ${isLightTheme ? "hover:text-black" : "hover:text-white"}`}>Legal & Privacy</a>
            <a href="#" className={`transition-colors ${isLightTheme ? "hover:text-black" : "hover:text-white"}`}>Support & Help</a>
            <a href="#" className={`transition-colors ${isLightTheme ? "hover:text-black" : "hover:text-white"}`}>Company & Partners</a>
            <a href="#" className={`transition-colors ${isLightTheme ? "hover:text-black" : "hover:text-white"}`}>Commercial Portal</a>
            <a href="#" className={`transition-colors ${isLightTheme ? "hover:text-black" : "hover:text-white"}`}>Security Hub</a>
          </div>
        </div>
      </footer>

      {/* Plaid Link Connection Dialogue Modal Popup */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className={`w-full max-w-md rounded-3xl border p-8 shadow-2xl relative transition-all ${isLightTheme ? "bg-white border-slate-200 text-black" : "bg-[#0A0A0A] border-white/10 text-white"}`}>
            
            {/* Close Button */}
            <button 
              onClick={() => {
                if (!isSubmitting) {
                  setIsAddModalOpen(false);
                  setSuccessMsg("");
                }
              }}
              className={`absolute top-4 right-4 p-1.5 rounded-lg border hover:opacity-75 transition-all cursor-pointer ${isLightTheme ? "border-slate-200 text-slate-500" : "border-white/10 text-neutral-400"}`}
            >
              <X className="w-4 h-4" />
            </button>

            {successMsg ? (
              <div className="py-12 flex flex-col items-center justify-center text-center">
                <div className={`w-12 h-12 rounded-full flex items-center justify-center mb-3 ${isLightTheme ? "bg-black text-white" : "bg-white text-black"}`}>
                  <Check className="w-6 h-6" />
                </div>
                <h4 className={`text-base font-bold ${isLightTheme ? "text-black" : "text-white"}`}>{successMsg}</h4>
                <p className={`text-xs mt-1 ${isLightTheme ? "text-slate-500" : "text-neutral-400"}`}>Updating your wallet items...</p>
              </div>
            ) : (
              <div className="py-4 text-center flex flex-col items-center justify-center">
                <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-4 border ${isLightTheme ? "bg-slate-50 border-slate-200 text-slate-900" : "bg-white/5 border-white/10 text-white"}`}>
                  <Link2 className="w-7 h-7 text-neutral-400" />
                </div>
                <h3 className={`text-base font-black ${isLightTheme ? "text-[#0F172A]" : "text-white"}`}>
                  {activeTab === "cards" ? "Link Commercial Card via Plaid" : "Link Settlement Bank Account via Plaid"}
                </h3>
                <p className={`text-xs mt-2 max-w-sm leading-relaxed mb-6 ${isLightTheme ? "text-slate-500" : "text-neutral-400"}`}>
                  Securely authenticate and link your commercial accounts using 256-bit bank-grade encryption.
                </p>
                <button
                  onClick={() => {
                    setIsSubmitting(true);
                    setTimeout(() => {
                      setIsSubmitting(false);
                      setSuccessMsg(activeTab === "cards" ? "Corporate Mastercard connected successfully!" : "Chase checking connected successfully!");
                      const newId = `item-${Date.now()}`;
                      if (activeTab === "cards") {
                        setCards(prev => [
                          ...prev,
                          {
                            id: newId,
                            type: "card",
                            title: "Plaid Corporate Card",
                            subtitle: "Linked Corporate Card • Verified",
                            last4: "4920",
                            brand: "mastercard",
                            gradient: "from-[#334155] via-[#1E293B] to-[#0F172A] border-white/30 text-white force-white-text"
                          }
                        ]);
                      } else {
                        setAccounts(prev => [
                          ...prev,
                          {
                            id: newId,
                            type: "account",
                            title: "Plaid Operating Checking",
                            subtitle: "Linked Bank Account • Verified",
                            last4: "8829",
                            brand: "bank",
                            gradient: "from-[#0369a1] via-[#075985] to-[#0c4a6e] border-sky-400/40 text-white force-white-text"
                          }
                        ]);
                      }
                      setTimeout(() => {
                        setSelectedItemId(newId);
                        setIsAddModalOpen(false);
                        setSuccessMsg("");
                      }, 1500);
                    }, 1200);
                  }}
                  className={`w-full py-3.5 rounded-2xl font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg transition-all cursor-pointer ${isLightTheme ? "bg-[#0F172A] text-white hover:bg-slate-800 force-white-text" : "bg-white text-black hover:bg-neutral-200"}`}
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Connecting Bank Feeds...</span>
                    </>
                  ) : (
                    <>
                      <Link2 className="w-4 h-4" />
                      <span>Link via Plaid Sandbox</span>
                    </>
                  )}
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </main>
  );
}
