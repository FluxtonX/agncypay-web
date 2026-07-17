"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Building2, ArrowLeft, Plus, Search, LogOut } from "lucide-react";
import { useApp } from "../../../context/AppContext";
import { subscribeInvoicesByAgency, FirestoreInvoice } from "../../../lib/firebaseInvoices";

export default function EarningsPage() {
  const router = useRouter();
  const { state, resetState } = useApp();
  const [invoices, setInvoices] = useState<FirestoreInvoice[]>([]);
  const [search, setSearch] = useState("");

  const handleLogout = () => {
    resetState();
    router.push("/auth/login");
  };

  useEffect(() => {
    if (state.user?.email) {
      const unsubscribe = subscribeInvoicesByAgency(state.user.email, (firestoreInvoices) => {
        setInvoices(firestoreInvoices);
      });
      return unsubscribe;
    }
  }, [state.user?.email]);

  const paidInvoices = invoices.filter(inv => inv.status === "paid");
  const totalEarnings = paidInvoices.reduce((sum, inv) => sum + inv.amount * 0.15, 0); // Agency gets 15%
  const uniqueTalents = new Set(paidInvoices.map(inv => inv.talentEmail)).size;

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white">
      {/* Header - Unified Dark Theme */}
      <header className="border-b border-white/20 bg-black/90 sticky top-0 z-50 shadow-sm backdrop-blur">
        <div className="max-w-[1520px] mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-6">
            <div className="relative flex items-center mr-12">
              <Link href="/" className="flex items-center" aria-label="AgncyPay home">
                <img
                  src="/agncypaybrand.png"
                  alt="AgncyPay"
                  className="h-10 w-auto object-contain scale-[1.3] origin-left"
                />
              </Link>
            </div>
            <span className="h-4 w-[1px] bg-white/20 hidden md:block" />
            <div className="hidden md:flex items-center gap-2 px-3 py-1 rounded-full bg-white/[0.03] border border-white/20 text-[11px] font-bold uppercase tracking-wider text-[#A3A3A3]">
              <Building2 className="h-3 w-3 text-white" />
              Agency Portal
            </div>
          </div>

          {/* Center Navigation Tabs (Bilt Style, Dark Theme) */}
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
              Sent Invoices
            </button>
            <button 
              onClick={() => router.push("/dashboard/payouts")}
              className="px-4 py-1.5 rounded-full text-xs font-semibold text-[#8f8f8f] hover:text-white transition-all cursor-pointer"
            >
              Payout Split Nodes
            </button>
            <button 
              onClick={() => router.push("/dashboard/earnings")}
              className="px-4 py-1.5 rounded-full text-xs font-semibold bg-white text-black shadow-sm transition-all cursor-pointer"
            >
              Agency Earnings
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
              <div className="h-8 w-8 rounded-full bg-white/[0.05] border border-white/20 flex items-center justify-center font-bold text-xs text-white">
                {state.user?.fullName ? state.user.fullName.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2) : "AD"}
              </div>
              <span className="text-xs font-bold text-[#E5E5EA] hidden sm:inline">
                {state.workspaces.find(w => w.id === state.activeWorkspaceId)?.name || state.user?.fullName || "Agency"}
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

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <div className="rounded-xl border border-white/10 bg-black p-6">
            <p className="text-sm font-semibold text-[#8f8f8f]">Active Templates</p>
            <p className="mt-2 text-2xl font-bold">1</p>
            <p className="mt-1 text-xs text-[#8f8f8f]">Standard 85/15 split</p>
          </div>
          <div className="rounded-xl border border-white/10 bg-black p-6">
            <p className="text-sm font-semibold text-[#8f8f8f]">Auto Matched</p>
            <p className="mt-2 text-2xl font-bold">{paidInvoices.length}</p>
            <p className="mt-1 text-xs text-[#8f8f8f]">Invoices with splits</p>
          </div>
          <div className="rounded-xl border border-white/10 bg-black p-6">
            <p className="text-sm font-semibold text-[#8f8f8f]">Exceptions</p>
            <p className="mt-2 text-2xl font-bold">0</p>
            <p className="mt-1 text-xs text-[#8f8f8f]">Manual overrides</p>
          </div>
        </div>

        {/* Search and Actions */}
        <div className="flex items-center justify-between mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#8f8f8f]" />
            <input
              type="text"
              placeholder="Search split structures..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10 pr-4 py-2 rounded-lg border border-white/10 bg-black text-sm text-white placeholder-[#8f8f8f] focus:outline-none focus:border-white/20"
            />
          </div>
          <button className="flex items-center gap-2 px-4 py-2 rounded-lg bg-white text-black text-sm font-semibold hover:bg-white/90 transition-colors">
            <Plus className="h-4 w-4" />
            Create Split Template
          </button>
        </div>

        {/* Split Structures */}
        {invoices.length === 0 ? (
          <div className="rounded-xl border border-white/10 bg-black p-12 text-center">
            <p className="text-lg font-semibold text-white">No split structures yet</p>
            <p className="mt-2 text-sm text-[#8f8f8f]">Create invoices to generate split structures</p>
          </div>
        ) : (
          <div className="rounded-xl border border-white/10 bg-black overflow-hidden">
            <table className="w-full">
              <thead>
                <tr className="border-b border-white/10">
                  <th className="px-6 py-3 text-left text-xs font-semibold text-[#8f8f8f] uppercase tracking-wider">Template</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-[#8f8f8f] uppercase tracking-wider">Split</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-[#8f8f8f] uppercase tracking-wider">Invoices</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-[#8f8f8f] uppercase tracking-wider">Status</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b border-white/5 hover:bg-white/5">
                  <td className="px-6 py-4 text-sm font-medium">Standard Agency Split</td>
                  <td className="px-6 py-4 text-sm">Talent 85% / Agency 15%</td>
                  <td className="px-6 py-4 text-sm font-semibold">{invoices.length}</td>
                  <td className="px-6 py-4">
                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-900/30 text-blue-400 border border-blue-800/30">
                      Active
                    </span>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        )}

        {/* Earnings Summary */}
        {paidInvoices.length > 0 && (
          <div className="mt-8 rounded-xl border border-white/10 bg-black p-6">
            <h3 className="text-lg font-semibold mb-4">Agency Earnings Summary</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-[#8f8f8f]">Total Agency Earnings (15%)</p>
                <p className="mt-1 text-2xl font-bold">${totalEarnings.toLocaleString(undefined, { minimumFractionDigits: 2 })}</p>
              </div>
              <div>
                <p className="text-sm text-[#8f8f8f]">Talent Payouts (85%)</p>
                <p className="mt-1 text-2xl font-bold">${paidInvoices.reduce((sum, inv) => sum + inv.amount * 0.85, 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
