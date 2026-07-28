"use client";

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
  Info,
  Wallet,
  X,
} from "lucide-react";
import { useApp } from "../../../context/AppContext";
import { subscribeInvoicesByBrand, subscribeInvoicesByAgency } from "../../../lib/firebaseInvoices";
import { BatchPaymentCheckoutModal, BatchInvoiceItem } from "../../../components/payment/BatchPaymentCheckoutModal";

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

const mockRecipients = [
  { id: "western-models", name: "Western Models Agency", handle: "@western_models", email: "payouts@westernmodels.com", type: "agency", avatar: "W" },
  { id: "studio-holland", name: "Studio Holland Talent", handle: "@studio_holland", email: "billing@studioholland.com", type: "agency", avatar: "S" },
  { id: "john-adams", name: "John Adams", handle: "@john_adams", email: "john@johnadams.com", type: "talent", avatar: "J" },
  { id: "lucy-che", name: "Lucy Che", handle: "@lucy_che", email: "lucy@lucyche.com", type: "talent", avatar: "L" },
  { id: "jessica-bailey", name: "Jessica Bailey", handle: "@jessica_bailey", email: "jessica@jessicabailey.com", type: "talent", avatar: "J" },
];

export default function InvoicesQueuePage() {
  const router = useRouter();
  const { state, resetState } = useApp();
  const workspaceType = state.user ? state.user.accountType : "brand";

  const [isLightTheme, setIsLightTheme] = useState(true);
  const [invoices, setInvoices] = useState<InvoiceMock[]>([]);
  const [activeFilter, setActiveFilter] = useState<"all" | "awaiting_approval" | "settled">("awaiting_approval");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedInvoiceId, setSelectedInvoiceId] = useState<string | null>(null);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);

  // Send & Request panel state
  const [isSendRequestActive, setIsSendRequestActive] = useState(false);
  const [sendRequestMode, setSendRequestMode] = useState<"send" | "receive">("send");
  const [sendRequestQuery, setSendRequestQuery] = useState("");
  const [selectedRecipientId, setSelectedRecipientId] = useState<string | null>(null);
  const [paymentAmount, setPaymentAmount] = useState("");
  const [isPaymentSuccess, setIsPaymentSuccess] = useState(false);

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
          createdDate: inv.createdDate || new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }),
          dueDate: inv.due,
          amount: inv.amount,
          location: "Escrow Wallet Active",
          costCenter: "Marketing (Campaign Pool)",
          initials: [inv.agency?.charAt(0).toUpperCase() || "A"],
          defaultTerm: "Net-30",
          status: uiStatus,
          vendorFee: {
            name: inv.agency || "Agency Recipient",
            role: "Vendor",
            amount: inv.amount * 0.1,
            walletId: inv.agencyEmail || "@agncypay",
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

  const recentPendingInvoice = invoices.find(inv => inv.status === (activeFilter === "settled" ? "settled" : "awaiting_approval")) ||
                               invoices[0] ||
                               null;

  const isAggregateView = selectedInvoiceId === null;
  const settledSum = invoices.filter(i => i.status === "settled" || i.status === "talent_disbursed").reduce((acc, i) => acc + i.amount, 0);
  const awaitingSum = invoices.filter(i => i.status === "awaiting_approval").reduce((acc, i) => acc + i.amount, 0);
  const allSum = invoices.reduce((acc, i) => acc + i.amount, 0);
  const selectedSum = invoices.filter(i => selectedIds.includes(i.id)).reduce((acc, i) => acc + i.amount, 0);

  const displayLabel = selectedIds.length > 0
    ? "Selected total"
    : !isAggregateView && activeInvoice
    ? (activeInvoice.status === "settled" || activeInvoice.status === "talent_disbursed" ? "Balance paid" : "Balance due")
    : recentPendingInvoice?.status === "settled" || recentPendingInvoice?.status === "talent_disbursed"
    ? "Balance paid" 
    : "Balance due";

  const displayAmount = selectedIds.length > 0
    ? selectedSum
    : !isAggregateView && activeInvoice
    ? activeInvoice.amount
    : recentPendingInvoice
    ? recentPendingInvoice.amount
    : 0;

  const isAwaitingStatus = selectedIds.length > 0
    ? invoices.some(i => selectedIds.includes(i.id) && i.status === "awaiting_approval")
    : !isAggregateView && activeInvoice
    ? activeInvoice.status === "awaiting_approval"
    : recentPendingInvoice
    ? recentPendingInvoice.status === "awaiting_approval"
    : false;

  const invoicesToApproveList = selectedIds.length > 0
    ? invoices.filter(inv => selectedIds.includes(inv.id) && inv.status === "awaiting_approval")
    : !isAggregateView && activeInvoice
    ? [activeInvoice]
    : recentPendingInvoice && recentPendingInvoice.status === "awaiting_approval"
    ? [recentPendingInvoice]
    : [];

  const batchInvoices: BatchInvoiceItem[] = invoicesToApproveList.map(inv => ({
    id: inv.id,
    agency: inv.campaignName,
    amount: inv.amount,
    status: inv.status,
    brand: inv.brandName,
    dueDate: inv.dueDate,
  }));

  const handleApproveAndPay = () => {
    if (!isAwaitingStatus) return;
    setIsCheckoutOpen(true);
  };

  const handleAuthorizePayment = async () => {
    if (invoicesToApproveList.length === 0) return;
    
    const userEmail = state.user?.email || "guest";
    const queueKey = `brand_queue_invoices_${userEmail}`;
    const notifsKey = `agency_notifications_${userEmail}`;

    await new Promise(resolve => setTimeout(resolve, 1000));

    setInvoices(prev => {
      const approvedIds = new Set(invoicesToApproveList.map(inv => inv.id));
      const next = prev.map(inv => 
        approvedIds.has(inv.id) ? { ...inv, status: "settled" as const } : inv
      );
      localStorage.setItem(queueKey, JSON.stringify(next));
      return next;
    });

    const totalApproved = invoicesToApproveList.reduce((sum, inv) => sum + inv.amount, 0);
    const localNotifs = localStorage.getItem(notifsKey);
    const notifs = localNotifs ? JSON.parse(localNotifs) : [];
    const newNotif = {
      id: `notif-${Date.now()}`,
      message: `Brand approved & paid ${invoicesToApproveList.length > 1 ? `${invoicesToApproveList.length} invoices` : `invoice for ${invoicesToApproveList[0].campaignName}`} ($${totalApproved.toLocaleString(undefined, { minimumFractionDigits: 2 })})`,
      timestamp: "Just now",
      unread: true,
    };
    localStorage.setItem(notifsKey, JSON.stringify([newNotif, ...notifs]));

    setSelectedIds([]);
    window.dispatchEvent(new Event("syncBrandDashboard"));
  };

  return (
    <main className="min-h-screen bg-background text-foreground flex flex-col font-sans antialiased relative transition-colors duration-200">
      <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-white/[0.01] rounded-full blur-[100px] pointer-events-none" />

      {/* Header */}
      <header className={`border-b sticky top-0 z-50 shadow-sm backdrop-blur transition-colors ${isLightTheme ? "border-black/10 bg-white/90" : "border-white/25 bg-background/90"}`}>
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
            <span className={`h-4 w-[1px] hidden md:block ${isLightTheme ? "bg-black/20" : "bg-white/20"}`} />
            <div className={`hidden md:flex items-center gap-2 px-3 py-1 rounded-full border text-[11px] font-bold uppercase tracking-wider ${isLightTheme ? "bg-black/5 border-black/10 text-[#0F172A]" : "bg-white/10 border-white/20 text-white"}`}>
              <Building2 className={`h-3 w-3 ${isLightTheme ? "text-[#0F172A]" : "text-white"}`} />
              Brand Portal
            </div>
          </div>

          <nav className={`hidden lg:flex items-center gap-1 p-1 rounded-full border transition-colors ${isLightTheme ? "bg-black/5 border-black/10" : "bg-white/[0.03] border-white/20"}`}>
            <button 
              onClick={() => router.push("/branddashboard")}
              className={`px-4 py-1.5 rounded-full text-xs font-semibold transition-all cursor-pointer ${isLightTheme ? "text-[#475569] hover:text-[#0F172A] hover:bg-black/5" : "text-[#8f8f8f] hover:text-white hover:bg-white/5"}`}
            >
              Home
            </button>
            <button 
              onClick={() => router.push("/branddashboard/invoices")}
              className={`px-4 py-1.5 rounded-full text-xs font-bold shadow-sm border transition-all cursor-pointer ${isLightTheme ? "bg-[#0F172A] text-white border-black/10 force-white-text" : "bg-white text-black border-white/20"}`}
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
              className={`px-4 py-1.5 rounded-full text-xs font-semibold transition-all cursor-pointer flex items-center gap-1.5 ${isLightTheme ? "text-[#475569] hover:text-[#0F172A] hover:bg-black/5" : "text-[#8f8f8f] hover:text-white hover:bg-white/5"}`}
            >
              <Wallet className="w-3.5 h-3.5" />
              Wallet
            </button>
          </nav>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <div className={`h-8 w-8 rounded-full border flex items-center justify-center font-bold text-xs ${isLightTheme ? "bg-black/5 border-black/10 text-black" : "bg-white/[0.05] border-white/20 text-white"}`}>
                {state.user?.fullName ? state.user.fullName.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2) : "AD"}
              </div>
              <span className={`text-xs font-bold hidden sm:inline ${isLightTheme ? "text-[#0F172A]" : "text-[#E5E5EA]"}`}>
                {state.workspaces.find(w => w.id === state.activeWorkspaceId)?.name || state.user?.fullName || "Adidas Corporate"}
              </span>
            </div>
            <button
              onClick={toggleTheme}
              className={`p-2 transition-colors cursor-pointer mr-1 ${isLightTheme ? "text-[#0F172A] hover:text-black" : "text-neutral-400 hover:text-white"}`}
              title="Toggle Theme"
            >
              {isLightTheme ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />}
            </button>

            <button
              onClick={handleLogout}
              className={`p-2 transition-colors ${isLightTheme ? "text-[#0F172A] hover:text-black" : "text-neutral-400 hover:text-white"}`}
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

            {/* Send and Request Money Widget */}
            <div className="p-6 rounded-2xl border border-neutral-200 bg-white shadow-xl space-y-6">
              {/* Header Row */}
              <div className="flex items-center justify-between gap-4">
                <div>
                  <h2 className="text-[18px] font-bold text-neutral-900 tracking-tight">Send and request money</h2>
                  <p className="text-xs text-neutral-500 mt-1">Send immediate commercial payouts or request billing approval from partners.</p>
                </div>
                {/* Mode Pill Selector */}
                <div className="inline-flex rounded-full border border-neutral-200 bg-neutral-100 p-1">
                  <button
                    onClick={() => {
                      setSendRequestMode("send");
                      setSelectedRecipientId(null);
                      setIsPaymentSuccess(false);
                    }}
                    className={`h-8 rounded-full px-5 text-[11px] font-bold transition-all cursor-pointer ${
                      sendRequestMode === "send" ? "bg-white text-neutral-900 shadow-sm" : "text-neutral-500 hover:text-neutral-900"
                    }`}
                  >
                    Send
                  </button>
                  <button
                    onClick={() => {
                      setSendRequestMode("receive");
                      setSelectedRecipientId(null);
                      setIsPaymentSuccess(false);
                    }}
                    className={`h-8 rounded-full px-5 text-[11px] font-bold transition-all cursor-pointer ${
                      sendRequestMode === "receive" ? "bg-white text-neutral-900 shadow-sm" : "text-neutral-500 hover:text-neutral-900"
                    }`}
                  >
                    Request
                  </button>
                </div>
              </div>

              {/* Form or Search stage */}
              {!selectedRecipientId ? (
                <>
                  {/* Search Input */}
                  <div className="relative">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-500" />
                    <input
                      type="text"
                      value={sendRequestQuery}
                      onChange={(e) => setSendRequestQuery(e.target.value)}
                      placeholder="Name, Agency ID, email, mobile"
                      className="w-full h-12 pl-11 pr-4 rounded-xl border border-neutral-200 bg-neutral-50 text-xs font-semibold text-neutral-900 outline-none focus:border-neutral-400 focus:bg-white transition-all placeholder:text-neutral-400"
                    />
                  </div>

                  {/* Dynamic Area */}
                  {sendRequestQuery.trim() && (
                    <div className="space-y-2">
                      <p className="text-[10px] font-bold uppercase tracking-wider text-neutral-500">Search Results</p>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {mockRecipients
                          .filter(r =>
                            r.name.toLowerCase().includes(sendRequestQuery.toLowerCase()) ||
                            r.handle.toLowerCase().includes(sendRequestQuery.toLowerCase()) ||
                            r.email.toLowerCase().includes(sendRequestQuery.toLowerCase())
                          )
                          .map((recipient) => (
                            <div
                              key={recipient.id}
                              onClick={() => {
                                setSelectedRecipientId(recipient.id);
                                setPaymentAmount("");
                                setIsPaymentSuccess(false);
                              }}
                              className="flex items-center gap-3 p-3 rounded-xl border border-neutral-200 bg-neutral-50 hover:bg-neutral-100 hover:border-neutral-300 transition-all cursor-pointer"
                            >
                              <div className="w-9 h-9 rounded-full bg-neutral-200 flex items-center justify-center font-bold text-neutral-700 text-xs">
                                {recipient.avatar}
                              </div>
                              <div className="min-w-0 flex-1">
                                <h4 className="text-xs font-bold text-neutral-950 truncate">{recipient.name}</h4>
                                <p className="text-[10px] text-neutral-600 mt-0.5 font-mono truncate">{recipient.handle} • {recipient.email}</p>
                              </div>
                              <ChevronRight className="h-4 w-4 text-neutral-500" />
                            </div>
                          ))}
                        {mockRecipients.filter(r =>
                          r.name.toLowerCase().includes(sendRequestQuery.toLowerCase()) ||
                          r.handle.toLowerCase().includes(sendRequestQuery.toLowerCase()) ||
                          r.email.toLowerCase().includes(sendRequestQuery.toLowerCase())
                        ).length === 0 && (
                          <div className="col-span-full py-4 text-center text-xs text-neutral-500">
                            No recipients match &quot;{sendRequestQuery}&quot;
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </>
              ) : (
                /* Payment form for selected recipient */
                (() => {
                  const recipient = mockRecipients.find(r => r.id === selectedRecipientId);
                  if (!recipient) return null;
                  return (
                    <div className="p-5 rounded-2xl border border-neutral-200 bg-neutral-50 space-y-4 max-w-md mx-auto shadow-sm">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-neutral-200 flex items-center justify-center font-bold text-neutral-800 text-sm">
                          {recipient.avatar}
                        </div>
                        <div className="min-w-0 flex-1">
                          <h4 className="text-xs font-bold text-neutral-955 truncate">{recipient.name}</h4>
                          <p className="text-[10px] text-neutral-600 mt-0.5 truncate">{recipient.email}</p>
                        </div>
                        <button
                          onClick={() => setSelectedRecipientId(null)}
                          className="text-[11px] text-neutral-500 hover:text-neutral-800 cursor-pointer font-semibold underline"
                        >
                          Change
                        </button>
                      </div>

                      {isPaymentSuccess ? (
                        <div className="py-6 text-center space-y-2">
                          <div className="w-10 h-10 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto mb-2 font-bold text-lg">
                            ✓
                          </div>
                          <h4 className="text-xs font-bold text-neutral-950">Transaction Success!</h4>
                          <p className="text-[11px] text-neutral-600">
                            {sendRequestMode === "send"
                              ? `$${parseFloat(paymentAmount).toLocaleString(undefined, { minimumFractionDigits: 2 })} has been sent to ${recipient.name}.`
                              : `Billing request of $${parseFloat(paymentAmount).toLocaleString(undefined, { minimumFractionDigits: 2 })} sent to ${recipient.name}.`}
                          </p>
                          <button
                            onClick={() => {
                              setIsPaymentSuccess(false);
                              setSelectedRecipientId(null);
                              setPaymentAmount("");
                              setSendRequestQuery("");
                            }}
                            className="mt-4 px-4 py-1.5 rounded-lg bg-neutral-200 text-neutral-800 hover:bg-neutral-300 text-xs font-bold cursor-pointer"
                          >
                            Done
                          </button>
                        </div>
                      ) : (
                        <div className="space-y-4">
                          <div>
                            <label className="text-[10px] font-bold uppercase tracking-wider text-neutral-600 block mb-1.5">
                              {sendRequestMode === "send" ? "Amount to Send (USD)" : "Amount to Request (USD)"}
                            </label>
                            <input
                              type="number"
                              value={paymentAmount}
                              onChange={(e) => setPaymentAmount(e.target.value)}
                              placeholder="0.00"
                              className="w-full h-11 px-3 rounded-lg border border-neutral-300 bg-white text-xs font-bold text-neutral-950 outline-none focus:border-neutral-500 focus:ring-1 focus:ring-neutral-500"
                            />
                          </div>

                          <button
                            disabled={!paymentAmount || parseFloat(paymentAmount) <= 0}
                            onClick={() => setIsPaymentSuccess(true)}
                            className="w-full h-11 rounded-lg bg-black text-white hover:bg-neutral-800 text-xs font-bold uppercase tracking-wider transition-all disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer shadow-md"
                          >
                            {sendRequestMode === "send" ? `Send $${paymentAmount || "0.00"}` : `Request $${paymentAmount || "0.00"}`}
                          </button>
                        </div>
                      )}
                    </div>
                  );
                })()
              )}

              {/* Clear All Footer Link */}
              <div className="pt-2 flex justify-center">
                <button
                  onClick={() => {
                    setSendRequestQuery("");
                    setSelectedRecipientId(null);
                    setIsPaymentSuccess(false);
                  }}
                  className="text-xs font-bold text-[#10b981] hover:underline cursor-pointer"
                >
                  Clear all
                </button>
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
                    <span className="text-xs font-bold text-[#8f8f8f] uppercase tracking-wider block">{displayLabel}</span>
                    <span className="text-4xl md:text-5xl font-black text-white tracking-tight mt-1.5 block">
                      ${displayAmount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </span>
                    <div className="mt-4 flex items-center gap-2 text-xs text-neutral-400">
                      <Calendar className="h-4 w-4 text-[#8f8f8f]" />
                      <span>{selectedIds.length > 0 ? `Selected: ${selectedIds.length} invoice${selectedIds.length > 1 ? "s" : ""}` : `Due: ${recentPendingInvoice?.dueDate || activeInvoice?.dueDate || "Net-30"}`}</span>
                    </div>
                  </div>

                  {/* Approve & Pay Action Button */}
                  <div className="w-full md:w-auto shrink-0 min-w-[220px]">
                    <button
                      onClick={handleApproveAndPay}
                      disabled={!isAwaitingStatus}
                      className={`w-full h-12 px-6 rounded-xl text-xs font-black shadow-sm flex items-center justify-center gap-2 transition-all cursor-pointer ${
                        isAwaitingStatus
                          ? "bg-white text-black hover:bg-neutral-200 shadow-white/10 shadow-lg"
                          : "bg-white/10 text-neutral-400 cursor-default border border-white/10"
                      }`}
                    >
                      {isAwaitingStatus ? (
                        <>
                          Approve & Pay {selectedIds.length > 1 ? `(${selectedIds.length}) Invoices` : "(1) Invoice"}
                          <ChevronRight className="h-4 w-4" />
                        </>
                      ) : (
                        <>
                          <CheckCircle2 className="h-4.5 w-4.5 text-neutral-400" />
                          Approved & Settled
                        </>
                      )}
                    </button>
                  </div>
                </div>

                {/* Sub-details Rows */}
                <div className="mt-8 pt-6 border-t border-white/20 space-y-4 text-xs">
                  <div className="flex justify-between items-center py-1">
                    <span className="text-[#8f8f8f] font-semibold flex items-center gap-2">
                      <Layers className="h-4 w-4 text-neutral-500" />
                      Automated Payee Routing
                    </span>
                    <span className="font-mono font-semibold text-neutral-300 text-xs">
                      Active
                    </span>
                  </div>

                  <div className="flex justify-between items-center py-1">
                    <span className="text-[#8f8f8f] font-semibold flex items-center gap-2">
                      <Coins className="h-4 w-4 text-neutral-500" />
                      Same-Day Wire & ACH Settlement
                    </span>
                    <span className="font-mono font-semibold text-neutral-300 text-xs">
                      Eligible
                    </span>
                  </div>

                  <div className="flex justify-between items-center py-1">
                    <span className="text-[#8f8f8f] font-semibold flex items-center gap-2">
                      <ShieldCheck className="h-4 w-4 text-neutral-500" />
                      Bank Transaction Fee
                    </span>
                    <span className="font-mono font-semibold text-neutral-300 text-xs">
                      $0.00 (Waived)
                    </span>
                  </div>
                </div>
              </div>

              {/* Recipient Overview Image Card Replacement */}
              <div className="lg:col-span-5 rounded-2xl border border-white/20 overflow-hidden shadow-xl relative bg-[#050505] min-h-[360px] flex flex-col justify-between">
                <img
                  src="/sendpaymenttoprightimage.png"
                  alt="Send Payment Info Card"
                  className="absolute inset-0 w-full h-full object-contain object-center pointer-events-none"
                />
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
                  onClick={() => {
                    setActiveFilter(tab.id as any);
                    setSelectedInvoiceId(null);
                    setSelectedIds([]);
                  }}
                  className={`px-4 py-2 rounded-lg text-xs font-semibold tracking-tight transition-all cursor-pointer ${
                    activeFilter === tab.id
                      ? "bg-white text-black font-bold shadow-sm"
                      : "text-[#8f8f8f] hover:text-white bg-transparent hover:bg-white/[0.02]"
                  }`}
                >
                  {tab.label}
                  {tab.id === "awaiting_approval" && (
                    <span className="ml-1.5 px-1.5 py-0.5 rounded bg-white/10 text-neutral-300 text-[10px] font-bold">
                      {invoices.filter(i => i.status === "awaiting_approval").length}
                    </span>
                  )}
                </button>
              ))}
              {selectedIds.length > 0 && (
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setSelectedIds([])}
                    className="px-3 py-1.5 rounded-lg text-xs font-bold text-white bg-white/10 hover:bg-white/20 border border-white/20 transition-all cursor-pointer flex items-center gap-1.5"
                  >
                    <span>Clear ({selectedIds.length})</span>
                  </button>
                  <button
                    onClick={() => setIsCheckoutOpen(true)}
                    className="px-3 py-1.5 rounded-lg text-xs font-bold text-black bg-white hover:bg-neutral-200 transition-all cursor-pointer flex items-center gap-1.5 shadow-sm"
                  >
                    <ShieldCheck className="w-3.5 h-3.5 text-black" />
                    <span>Batch Pay ({selectedIds.length})</span>
                  </button>
                </div>
              )}
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
                    <th className="p-4 w-10">
                      {workspaceType === "brand" && (
                        <input
                          type="checkbox"
                          className="h-4 w-4 accent-white rounded border-white/20 bg-transparent cursor-pointer"
                          onChange={(e) => {
                            const awaitingInvs = filteredInvoices.filter(i => i.status === "awaiting_approval");
                            setSelectedIds(e.target.checked ? awaitingInvs.map(i => i.id) : []);
                          }}
                          checked={selectedIds.length > 0 && selectedIds.length === filteredInvoices.filter(i => i.status === "awaiting_approval").length && filteredInvoices.filter(i => i.status === "awaiting_approval").length > 0}
                        />
                      )}
                    </th>
                    <th className="p-4">Invoice ID</th>
                    <th className="p-4">Campaign / Project Name</th>
                    <th className="p-4">Payee / Vendor</th>
                    <th className="p-4">Payment Terms</th>
                    <th className="p-4 text-right">Invoice Amount</th>
                    {activeFilter !== "awaiting_approval" && <th className="p-4 text-center">Status</th>}
                    <th className="p-4"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/[0.04]">
                  {filteredInvoices.length === 0 ? (
                    <tr>
                      <td colSpan={(workspaceType === "brand" ? 8 : 7) - (activeFilter === "awaiting_approval" ? 1 : 0)} className="p-8 text-center text-[#8f8f8f]">
                        No invoices match the selected filter.
                      </td>
                    </tr>
                  ) : (
                    filteredInvoices.map((inv) => {
                      const isAwaiting = inv.status === "awaiting_approval";
                      const isSelected = selectedInvoiceId === inv.id;

                      return (
                        <tr
                          key={inv.id}
                          onClick={(e) => {
                            if ((e.target as HTMLElement).tagName.toLowerCase() === "input") return;
                            setSelectedInvoiceId(inv.id);
                          }}
                          className={`cursor-pointer transition-all group ${
                            isSelected || selectedIds.includes(inv.id)
                              ? "bg-white/[0.07] border-l-4 border-l-white"
                              : "hover:bg-white/[0.02]"
                          }`}
                        >
                          <td className="p-4 w-10" onClick={(e) => e.stopPropagation()}>
                            {workspaceType === "brand" && isAwaiting && (
                              <input
                                type="checkbox"
                                className="h-4 w-4 accent-white rounded border-white/20 bg-transparent cursor-pointer"
                                checked={selectedIds.includes(inv.id)}
                                onChange={() => {
                                  setSelectedIds(curr =>
                                    curr.includes(inv.id) ? curr.filter(id => id !== inv.id) : [...curr, inv.id]
                                  );
                                }}
                              />
                            )}
                          </td>
                          <td className="p-4 font-mono font-bold text-neutral-300">
                            {inv.id}
                            {isSelected && <span className="ml-2 text-[10px] text-neutral-400 font-normal">(Selected)</span>}
                          </td>
                          <td className="p-4">
                            <p className="text-white font-bold">{inv.campaignName}</p>
                            <p className="text-[10px] text-neutral-500 mt-0.5">{inv.brandName}</p>
                          </td>
                          <td className="p-4 text-white font-semibold">{inv.vendorFee?.name || "Agency Recipient"}</td>
                          <td className="p-4 text-neutral-400 font-mono">{inv.dueDate || "Net-30"}</td>
                          <td className="p-4 text-right font-black text-white">
                            ${inv.amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                          </td>
                          {activeFilter !== "awaiting_approval" && (
                            <td className="p-4 text-center">
                              <span className="text-xs font-semibold text-neutral-300">
                                {isAwaiting ? "Pending Approval" : "Paid & Settled"}
                              </span>
                            </td>
                          )}
                          <td className="p-4 text-right pr-6">
                            <ChevronRight className={`h-4 w-4 transition-transform ml-auto ${isSelected ? "text-white translate-x-1" : "text-neutral-600 group-hover:text-white"}`} />
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
            {workspaceType === "brand" && selectedIds.length > 0 && (
              <div className="p-4 bg-[#111] light:bg-white border-t border-white/20 light:border-black/10 flex justify-between items-center">
                <div>
                  <p className="text-sm font-bold text-white light:text-[#0F172A]">{selectedIds.length} invoice(s) selected</p>
                  <p className="text-[11px] text-[#8f8f8f] light:text-[#475569]">Ready for batch payment.</p>
                </div>
                <div className="flex gap-3">
                  <button onClick={() => setSelectedIds([])} className="px-4 py-2 text-xs font-bold text-white light:text-[#475569] hover:bg-white/10 light:hover:bg-black/5 rounded-lg transition-colors">Clear</button>
                  <button onClick={() => setIsCheckoutOpen(true)} className="px-4 py-2 text-xs font-bold bg-white light:bg-[#0F172A] text-black light:text-white hover:bg-neutral-200 light:hover:bg-[#1E293B] border border-white/20 light:border-black/10 rounded-lg flex items-center gap-2 transition-all shadow-sm cursor-pointer">
                    <ShieldCheck className="w-4 h-4 text-black light:text-white" /> Batch Pay
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

      </div>

      {/* Bilt-Style High-Contrast Batch Payment Checkout Overlay */}
      <BatchPaymentCheckoutModal
        isOpen={isCheckoutOpen}
        onClose={() => setIsCheckoutOpen(false)}
        selectedInvoices={batchInvoices}
        onAuthorizePayment={handleAuthorizePayment}
      />

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
