"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Building2,
  ArrowLeft,
  Search,
  ChevronRight,
  LogOut
} from "lucide-react";
import { useApp } from "../../../context/AppContext";

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

export default function InvoicesQueuePage() {
  const router = useRouter();
  const { state, resetState } = useApp();
  const workspaceType = state.user ? state.user.accountType : "brand";

  const [invoices, setInvoices] = useState<InvoiceMock[]>([]);
  const [activeFilter, setActiveFilter] = useState<"all" | "awaiting_approval" | "settled">("awaiting_approval");
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    const userEmail = state.user?.email || "guest";
    const isDemoUser = userEmail === "martin.safi@adidas.com";
    const queueKey = `brand_queue_invoices_${userEmail}`;

    const localQueue = localStorage.getItem(queueKey);
    const defaultQueue = isDemoUser ? INITIAL_INVOICES : [];
    if (localQueue) {
      setInvoices(JSON.parse(localQueue));
    } else {
      setInvoices(defaultQueue);
      localStorage.setItem(queueKey, JSON.stringify(defaultQueue));
    }

    const syncStates = () => {
      const localQueue = localStorage.getItem(queueKey);
      if (localQueue) {
        setInvoices(JSON.parse(localQueue));
      } else {
        setInvoices(defaultQueue);
      }
    };

    window.addEventListener("storage", syncStates);
    window.addEventListener("syncBrandDashboard", syncStates);

    return () => {
      window.removeEventListener("storage", syncStates);
      window.removeEventListener("syncBrandDashboard", syncStates);
    };
  }, [state.user]);

  const handleLogout = () => {
    resetState();
    router.push("/auth/login");
  };

  // Filter logic
  const filteredInvoices = invoices.filter(inv => {
    const matchesFilter = activeFilter === "all" ? true : inv.status === activeFilter;
    const matchesSearch = inv.campaignName.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          inv.id.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  return (
    <main className="min-h-screen bg-[#000000] text-white flex flex-col font-sans antialiased selection:bg-white selection:text-black relative">
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

      {/* Main Container */}
      <div className="max-w-[1520px] w-full mx-auto px-6 py-8 flex-1 flex flex-col gap-6">
        
        <div className="flex items-center gap-2">
          <Link 
            href="/branddashboard"
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
            <h1 className="text-2xl font-bold tracking-tight">Invoice Approval Manager</h1>
            <p className="text-xs text-[#8f8f8f] mt-1">Select an invoice from the list below to open its dedicated property-style billing dashboard.</p>
          </div>
        </div>

        {/* Search & Tabs Controls */}
        <div className="flex flex-col md:flex-row gap-4 justify-between items-stretch md:items-center bg-[#050505] p-3 rounded-xl border border-white/20">
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
                    ? "bg-white text-black font-bold"
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

                    return (
                      <tr
                        key={inv.id}
                        onClick={() => router.push(`/branddashboard/invoices/${inv.id}`)}
                        className="hover:bg-white/[0.02] cursor-pointer transition-colors group"
                      >
                        <td className="p-4 font-mono font-bold text-neutral-400">{inv.id}</td>
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
