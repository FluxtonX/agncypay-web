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
  Moon
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
    id: "card-agncy",
    type: "card",
    title: "AgncyPay Obsidian Black Card",
    subtitle: "Real Time, Everytime • 2.5% Cashback",
    last4: "APPLY",
    brand: "agncypay",
    gradient: "from-[#1E293B] via-[#0F172A] to-[#0B1120] border-[#38BDF8]/40 text-white force-white-text",
    image: "/cards/agncy-card-black.jpg"
  },
  {
    id: "card-treasury",
    type: "card",
    title: "AgncyPay Brushed Silver Card",
    subtitle: "Real Time, Everytime • Treasury Pool",
    last4: "POOL",
    brand: "treasury",
    gradient: "from-[#334155] via-[#1e293b] to-[#0f172a] border-[#cbd5e1]/40 text-slate-100 force-white-text",
    image: "/cards/agncy-card-silver.jpg"
  },
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

  const [isLightTheme, setIsLightTheme] = useState(false);
  const [activeTab, setActiveTab] = useState<"cards" | "accounts">("cards");
  const [cards, setCards] = useState<WalletItem[]>(INITIAL_CARDS);
  const [accounts, setAccounts] = useState<WalletItem[]>(INITIAL_ACCOUNTS);
  const [selectedItemId, setSelectedItemId] = useState<string | null>("add");
  const [isModalOpen, setIsModalOpen] = useState(false);

  // New Card/Account Form State
  const [newTitle, setNewTitle] = useState("");
  const [newLast4, setNewLast4] = useState("");
  const [newType, setNewType] = useState<"mastercard" | "visa" | "amex" | "bank">("mastercard");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");

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
        setIsModalOpen(false);
        setSuccessMsg("");
        setNewTitle("");
        setNewLast4("");
      }, 1200);
    }, 1000);
  };

  return (
    <main className={`min-h-screen flex flex-col font-sans antialiased relative transition-colors duration-200 ${isLightTheme ? "bg-[#F8FAFC] text-[#0F172A]" : "bg-black text-white"}`}>
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
            <button 
              onClick={() => router.push("/branddashboard/nodes")}
              className={`px-4 py-1.5 rounded-full text-xs font-semibold transition-all cursor-pointer ${isLightTheme ? "text-[#475569] hover:text-[#0F172A] hover:bg-black/5" : "text-[#8f8f8f] hover:text-white hover:bg-white/5"}`}
            >
              Rewards
            </button>
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
              setSelectedItemId("add");
            }}
            className={`shrink-0 w-48 h-24 rounded-2xl border transition-all flex flex-col items-center justify-center gap-2 cursor-pointer ${
              selectedItemId === "add"
                ? isLightTheme
                  ? "bg-slate-100 border-black/40 shadow-md scale-[1.02]"
                  : "bg-white/[0.08] border-white shadow-lg scale-[1.02]"
                : isLightTheme
                  ? "bg-slate-100/80 border-dashed border-slate-300 hover:border-slate-400 text-slate-600 hover:text-black"
                  : "bg-white/[0.02] border-dashed border-white/20 hover:border-white/40 text-neutral-400 hover:text-white"
            }`}
          >
            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${isLightTheme ? "bg-black/5" : "bg-white/10"}`}>
              <Plus className={`w-4 h-4 ${isLightTheme ? "text-[#0F172A]" : "text-white"}`} />
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
          
          {/* Left Container - Interactive Preview & Action */}
          <div className={`lg:col-span-7 rounded-3xl border p-8 shadow-xl flex flex-col justify-between min-h-[380px] relative overflow-hidden transition-colors ${isLightTheme ? "bg-white border-black/10" : "bg-[#090909] border-white/10"}`}>
            <div className={`absolute -right-20 -bottom-20 w-80 h-80 rounded-full blur-3xl pointer-events-none ${isLightTheme ? "bg-black/[0.02]" : "bg-white/[0.02]"}`} />
            
            <div>
              <div className={`flex items-center justify-between border-b pb-4 mb-6 ${isLightTheme ? "border-slate-200" : "border-white/10"}`}>
                <h2 className={`text-lg font-black flex items-center gap-2 ${isLightTheme ? "text-[#0F172A]" : "text-white"}`}>
                  {selectedItemId === "add" ? (
                    activeTab === "cards" ? "Add a commercial card" : "Link a settlement bank account"
                  ) : (
                    selectedItem?.title || "Payment Source Details"
                  )}
                </h2>
                {selectedItem?.isDefault && (
                  <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">
                    Active Settlement Hub
                  </span>
                )}
              </div>

              {selectedItemId === "add" ? (
                <div className={`rounded-2xl border border-dashed p-8 flex flex-col items-center justify-center text-center my-4 ${isLightTheme ? "bg-slate-50 border-slate-300" : "bg-white/[0.02] border-white/15"}`}>
                  <div className={`w-16 h-16 rounded-2xl border flex items-center justify-center mb-4 shadow-inner ${isLightTheme ? "bg-slate-100 border-slate-300" : "bg-white/5 border-white/10"}`}>
                    <Plus className={`w-8 h-8 ${isLightTheme ? "text-[#0F172A]" : "text-white"}`} />
                  </div>
                  <h3 className={`text-base font-bold max-w-sm ${isLightTheme ? "text-[#0F172A]" : "text-white"}`}>
                    {activeTab === "cards"
                      ? "Earn points on payments with any linked commercial card"
                      : "Link checking or escrow accounts for zero-fee ACH disbursals"}
                  </h3>
                  <p className={`text-xs mt-1 max-w-md ${isLightTheme ? "text-slate-600" : "text-neutral-400"}`}>
                    {activeTab === "cards"
                      ? "Link your Visa, Mastercard, or American Express commercial card to automatically earn 1X-2X AgncyPay Rewards when paying invoices."
                      : "Connect your primary business operating account or dedicated campaign escrow repository for seamless automated payouts."}
                  </p>
                  <button
                    onClick={() => setIsModalOpen(true)}
                    className={`mt-6 px-6 py-3 rounded-xl font-extrabold text-xs transition-all shadow-lg flex items-center gap-2 cursor-pointer ${isLightTheme ? "bg-[#0F172A] text-white hover:bg-slate-800 force-white-text" : "bg-white text-black hover:bg-neutral-200"}`}
                  >
                    <Plus className="w-4 h-4" />
                    <span>{activeTab === "cards" ? "Add a card" : "Link an account"}</span>
                  </button>
                </div>
              ) : (
                <div className="my-2">
                  {selectedItem?.image ? (
                    <div className="rounded-2xl border border-white/15 shadow-2xl max-w-lg mx-auto sm:mx-0 relative overflow-hidden mb-6 group bg-black aspect-[1.6/1] flex items-center justify-center">
                      <img
                        src={selectedItem.image}
                        alt={selectedItem.title}
                        className="w-full h-full object-cover scale-[1.26] transition-transform duration-700 group-hover:scale-[1.32]"
                      />
                    </div>
                  ) : (
                    <div className={`p-6 rounded-2xl bg-gradient-to-br ${selectedItem?.gradient} border shadow-lg max-w-md mx-auto sm:mx-0 text-left relative overflow-hidden mb-6`}>
                      <div className="flex justify-between items-start mb-10">
                        <span className="text-xs font-mono tracking-widest uppercase opacity-75">AGNCYPAY COMMERCIAL WALLET</span>
                        {selectedItem?.brand === "mastercard" && (
                          <div className="flex -space-x-1.5">
                            <div className="w-6 h-6 rounded-full bg-red-500/80" />
                            <div className="w-6 h-6 rounded-full bg-amber-500/80" />
                          </div>
                        )}
                      </div>
                      <p className="text-lg font-mono font-black tracking-widest mb-1">
                        {selectedItem?.last4 === "APPLY" || selectedItem?.last4 === "POOL" ? selectedItem?.last4 : `•••• •••• •••• ${selectedItem?.last4}`}
                      </p>
                      <div className="flex justify-between items-end mt-4">
                        <div>
                          <p className="text-[9px] uppercase opacity-60">ACCOUNT HOLDER</p>
                          <p className="text-xs font-bold uppercase truncate max-w-[200px]">ADIDAS COMMERCIAL TREASURY</p>
                        </div>
                        <span className="text-xs font-black uppercase tracking-wider">{selectedItem?.brand}</span>
                      </div>
                    </div>
                  )}

                  <div className={`space-y-3 p-4 rounded-xl border text-xs ${isLightTheme ? "bg-slate-50 border-slate-200" : "bg-white/[0.02] border-white/5"}`}>
                    <div className={`flex justify-between items-center py-1 border-b ${isLightTheme ? "border-slate-200" : "border-white/5"}`}>
                      <span className={isLightTheme ? "text-slate-500" : "text-neutral-400"}>Status</span>
                      <span className="font-bold text-emerald-500 flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5" /> Verified & Active
                      </span>
                    </div>
                    <div className={`flex justify-between items-center py-1 border-b ${isLightTheme ? "border-slate-200" : "border-white/5"}`}>
                      <span className={isLightTheme ? "text-slate-500" : "text-neutral-400"}>Billing Address</span>
                      <span className={`font-medium ${isLightTheme ? "text-[#0F172A]" : "text-white"}`}>Herzogenaurach HQ • Germany</span>
                    </div>
                    <div className="flex justify-between items-center py-1">
                      <span className={isLightTheme ? "text-slate-500" : "text-neutral-400"}>Rewards Multiplier</span>
                      <span className="font-bold text-amber-500">2X AgncyPay Points on Invoices</span>
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div className={`flex items-center justify-between pt-6 border-t text-xs ${isLightTheme ? "border-slate-200" : "border-white/10"}`}>
              <div className={`flex items-center gap-2 ${isLightTheme ? "text-slate-500" : "text-neutral-400"}`}>
                <Lock className="w-3.5 h-3.5 text-emerald-500" />
                <span>256-Bit Bank-Grade Encryption</span>
              </div>
              {selectedItemId !== "add" && (
                <div className="flex gap-2">
                  <button className={`px-3 py-1.5 rounded-lg font-bold text-xs transition-colors cursor-pointer ${isLightTheme ? "bg-slate-100 hover:bg-slate-200 text-slate-800" : "bg-white/[0.05] hover:bg-white/[0.1] text-white"}`}>
                    Manage Rules
                  </button>
                  <button className="px-3 py-1.5 rounded-lg bg-red-500/10 text-red-500 hover:bg-red-500/20 font-bold text-xs transition-colors cursor-pointer">
                    Remove
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Right Container - Exclusive Benefits on Linked Cards (Bilt Style) */}
          <div className={`lg:col-span-5 rounded-3xl border p-8 shadow-xl flex flex-col justify-between transition-colors ${isLightTheme ? "bg-white border-black/10" : "bg-[#090909] border-white/10"}`}>
            <div>
              <h2 className={`text-lg font-black mb-6 flex items-center gap-2 ${isLightTheme ? "text-[#0F172A]" : "text-white"}`}>
                <Award className="w-5 h-5 text-amber-500" />
                <span>Exclusive benefits on linked {activeTab === "cards" ? "cards" : "accounts"}</span>
              </h2>

              <div className="space-y-6">
                
                {/* Benefit 1 */}
                <div className="flex items-start gap-4">
                  <div className={`w-10 h-10 rounded-xl border flex items-center justify-center shrink-0 mt-0.5 ${isLightTheme ? "bg-blue-50 border-blue-200" : "bg-blue-500/10 border-blue-500/20"}`}>
                    <Coins className="w-5 h-5 text-blue-500" />
                  </div>
                  <div>
                    <h3 className={`text-sm font-bold ${isLightTheme ? "text-[#0F172A]" : "text-white"}`}>
                      Double dip rewards
                    </h3>
                    <p className={`text-xs mt-1 leading-relaxed ${isLightTheme ? "text-slate-600" : "text-neutral-400"}`}>
                      Earn AgncyPay Points on top of your usual corporate card rewards program or bank relationship bonuses.
                    </p>
                  </div>
                </div>

                {/* Benefit 2 */}
                <div className="flex items-start gap-4">
                  <div className={`w-10 h-10 rounded-xl border flex items-center justify-center shrink-0 mt-0.5 ${isLightTheme ? "bg-emerald-50 border-emerald-200" : "bg-emerald-500/10 border-emerald-500/20"}`}>
                    <Zap className="w-5 h-5 text-emerald-500" />
                  </div>
                  <div>
                    <h3 className={`text-sm font-bold ${isLightTheme ? "text-[#0F172A]" : "text-white"}`}>
                      2X+ Points on agency settlements
                    </h3>
                    <p className={`text-xs mt-1 leading-relaxed ${isLightTheme ? "text-slate-600" : "text-neutral-400"}`}>
                      With eligible linked commercial cards and treasury accounts when paying talent invoices and production retainers.
                    </p>
                  </div>
                </div>

                {/* Benefit 3 */}
                <div className="flex items-start gap-4">
                  <div className={`w-10 h-10 rounded-xl border flex items-center justify-center shrink-0 mt-0.5 ${isLightTheme ? "bg-purple-50 border-purple-200" : "bg-purple-500/10 border-purple-500/20"}`}>
                    <Building2 className="w-5 h-5 text-purple-500" />
                  </div>
                  <div>
                    <h3 className={`text-sm font-bold ${isLightTheme ? "text-[#0F172A]" : "text-white"}`}>
                      Up to 2X Points on media & software spend
                    </h3>
                    <p className={`text-xs mt-1 leading-relaxed ${isLightTheme ? "text-slate-600" : "text-neutral-400"}`}>
                      2X on verified advertising platforms (Google, Meta, TikTok Ads) and 1X on all other commercial operating spend.
                    </p>
                  </div>
                </div>

              </div>
            </div>

            <div className={`mt-8 pt-6 border-t p-4 rounded-2xl flex items-center justify-between ${isLightTheme ? "border-slate-200 bg-slate-50" : "border-white/10 bg-white/[0.02]"}`}>
              <div>
                <p className={`text-xs font-bold ${isLightTheme ? "text-[#0F172A]" : "text-white"}`}>Need help linking treasury or automating payments?</p>
                <p className={`text-[11px] ${isLightTheme ? "text-slate-500" : "text-neutral-400"}`}>Speak with AgncyPay AI Assistant.</p>
              </div>
              <button className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${isLightTheme ? "bg-slate-200 hover:bg-slate-300 text-[#0F172A]" : "bg-white/[0.08] hover:bg-white/[0.15] text-white"}`}>
                <span>Ask AI</span>
                <ExternalLink className="w-3 h-3" />
              </button>
            </div>
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

      {/* Add Card / Account Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => !isSubmitting && setIsModalOpen(false)}
              className="absolute inset-0 bg-black/80 backdrop-blur-sm"
            />

            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className={`relative w-full max-w-md rounded-3xl border p-6 shadow-2xl overflow-hidden transition-colors ${isLightTheme ? "bg-white border-black/10 text-slate-800" : "bg-[#0D0D0D] border-white/20 text-white"}`}
            >
              <div className={`flex justify-between items-center pb-4 border-b mb-6 ${isLightTheme ? "border-slate-200" : "border-white/10"}`}>
                <h3 className={`text-base font-black flex items-center gap-2 ${isLightTheme ? "text-[#0F172A]" : "text-white"}`}>
                  <WalletIcon className="w-4 h-4 text-sky-500" />
                  <span>{activeTab === "cards" ? "Link Commercial Card" : "Link Bank Account"}</span>
                </h3>
                <button
                  onClick={() => !isSubmitting && setIsModalOpen(false)}
                  className={`w-8 h-8 rounded-full flex items-center justify-center transition-colors ${isLightTheme ? "bg-slate-100 hover:bg-slate-200 text-slate-600" : "bg-white/5 hover:bg-white/10 text-neutral-400 hover:text-white"}`}
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {successMsg ? (
                <div className="py-8 flex flex-col items-center justify-center text-center">
                  <div className="w-12 h-12 rounded-full bg-emerald-500/20 text-emerald-500 flex items-center justify-center mb-3">
                    <Check className="w-6 h-6" />
                  </div>
                  <h4 className={`text-base font-bold ${isLightTheme ? "text-black" : "text-white"}`}>{successMsg}</h4>
                  <p className={`text-xs mt-1 ${isLightTheme ? "text-slate-500" : "text-neutral-400"}`}>Updating your wallet items...</p>
                </div>
              ) : (
                <form onSubmit={handleAddItem} className="space-y-4">
                  <div>
                    <label className={`block text-xs font-bold mb-1.5 uppercase ${isLightTheme ? "text-slate-600" : "text-neutral-400"}`}>
                      {activeTab === "cards" ? "Card Name / Label" : "Bank / Institution Name"}
                    </label>
                    <input
                      type="text"
                      required
                      placeholder={activeTab === "cards" ? "e.g. Adidas Corporate Visa" : "e.g. Citibank Operating Account"}
                      value={newTitle}
                      onChange={e => setNewTitle(e.target.value)}
                      className={`w-full h-11 px-4 rounded-xl border text-xs font-medium outline-none transition-colors ${isLightTheme ? "bg-slate-100 border-slate-300 text-black focus:border-black" : "bg-black/50 border-white/20 text-white focus:border-white"}`}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className={`block text-xs font-bold mb-1.5 uppercase ${isLightTheme ? "text-slate-600" : "text-neutral-400"}`}>
                        {activeTab === "cards" ? "Last 4 Digits" : "Account Last 4"}
                      </label>
                      <input
                        type="text"
                        required
                        maxLength={4}
                        placeholder="e.g. 4829"
                        value={newLast4}
                        onChange={e => setNewLast4(e.target.value.replace(/\D/g, ""))}
                        className={`w-full h-11 px-4 rounded-xl border text-xs font-mono font-bold outline-none transition-colors ${isLightTheme ? "bg-slate-100 border-slate-300 text-black focus:border-black" : "bg-black/50 border-white/20 text-white focus:border-white"}`}
                      />
                    </div>

                    {activeTab === "cards" && (
                      <div>
                        <label className={`block text-xs font-bold mb-1.5 uppercase ${isLightTheme ? "text-slate-600" : "text-neutral-400"}`}>
                          Network Brand
                        </label>
                        <select
                          value={newType}
                          onChange={e => setNewType(e.target.value as any)}
                          className={`w-full h-11 px-3 rounded-xl border text-xs font-medium outline-none transition-colors ${isLightTheme ? "bg-slate-100 border-slate-300 text-black focus:border-black" : "bg-black/50 border-white/20 text-white focus:border-white"}`}
                        >
                          <option value="mastercard">Mastercard</option>
                          <option value="visa">Visa Commercial</option>
                          <option value="amex">American Express</option>
                        </select>
                      </div>
                    )}
                  </div>

                  <div className={`p-3 rounded-xl border flex items-center gap-2.5 text-[11px] mt-2 ${isLightTheme ? "bg-blue-50 border-blue-200 text-slate-700" : "bg-white/5 border-white/10 text-neutral-300"}`}>
                    <ShieldCheck className="w-4 h-4 text-emerald-500 shrink-0" />
                    <span>Your account credentials are verified instantly via Plaid / Stripe Commercial.</span>
                  </div>

                  <div className="pt-4 flex justify-end gap-3">
                    <button
                      type="button"
                      onClick={() => setIsModalOpen(false)}
                      className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-colors ${isLightTheme ? "text-slate-600 hover:text-black" : "text-neutral-400 hover:text-white"}`}
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={isSubmitting || !newTitle || newLast4.length !== 4}
                      className={`px-6 py-2.5 rounded-xl font-black text-xs disabled:opacity-50 transition-all shadow-md flex items-center gap-2 cursor-pointer ${isLightTheme ? "bg-[#0F172A] text-white hover:bg-slate-800 force-white-text" : "bg-white text-black hover:bg-neutral-200"}`}
                    >
                      {isSubmitting ? (
                        <>
                          <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                          <span>Verifying...</span>
                        </>
                      ) : (
                        <span>Link to Wallet</span>
                      )}
                    </button>
                  </div>
                </form>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </main>
  );
}
