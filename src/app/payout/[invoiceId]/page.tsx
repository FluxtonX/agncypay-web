"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import {
  ArrowLeft,
  CheckCircle2,
  Lock,
  ShieldCheck,
  Coins,
  Sparkles,
  ArrowRight,
  TrendingUp,
  User,
  Users,
  RefreshCw,
  Calendar
} from "lucide-react";
import { formatMainboardMoney } from "../../../lib/mainboard";
import { AgncyPayLogo } from "../../../components/payment/AgncyPayLogo";
import { useApp } from "../../../context/AppContext";

type PayoutStage = "confirmation" | "processing" | "success";

interface normalizedPayoutInvoice {
  id: string;
  campaignName: string;
  recipient: string;
  talentName: string;
  amount: number;
  talentAmount: number;
  agencyAmount: number;
  isWidget: boolean;
}

export default function PayoutDisbursementPage() {
  const params = useParams<{ invoiceId: string }>();
  const router = useRouter();
  const searchParams = useSearchParams();
  const rawInvoiceId = Array.isArray(params.invoiceId) ? params.invoiceId[0] : params.invoiceId;
  const { state } = useApp();

  const [invoice, setInvoice] = useState<normalizedPayoutInvoice | null>(null);
  const [stage, setStage] = useState<PayoutStage>("confirmation");
  const [payoutMethod, setPayoutMethod] = useState<"wallet" | "ach">("wallet");
  const [transactionId, setTransactionId] = useState("");

  useEffect(() => {
    if (!rawInvoiceId) return;

    // Load and normalize invoice from localStorage
    const loadInvoice = () => {
      // 1. Try finding in widget invoices
      const widgets = localStorage.getItem("brand_widget_invoices");
      if (widgets) {
        const parsed = JSON.parse(widgets);
        const w = parsed.find((item: any) => item.id === rawInvoiceId);
        if (w) {
          setInvoice({
            id: w.id,
            campaignName: w.campaign,
            recipient: w.agency,
            talentName: w.talent,
            amount: w.amount,
            talentAmount: w.amount * 0.85,
            agencyAmount: w.amount * 0.15,
            isWidget: true,
          });
          return;
        }
      }

      // 2. Try finding in queue invoices
      const queue = localStorage.getItem("brand_queue_invoices");
      if (queue) {
        const parsed = JSON.parse(queue);
        const q = parsed.find((item: any) => item.id === rawInvoiceId);
        if (q) {
          const talent = q.splitPool.splits.find((s: any) => s.role === "Talent");
          const agency = q.splitPool.splits.find((s: any) => s.role === "Agency");
          setInvoice({
            id: q.id,
            campaignName: q.campaignName,
            recipient: agency?.name || q.brandName,
            talentName: talent?.name || "Talent",
            amount: q.amount,
            talentAmount: talent?.amount || q.amount * 0.80,
            agencyAmount: agency?.amount || q.amount * 0.20,
            isWidget: false,
          });
          return;
        }
      }

      // Fallback
      setInvoice({
        id: rawInvoiceId,
        campaignName: "Creative Campaign Split",
        recipient: "Elite model agency",
        talentName: "sarah",
        amount: 14999.98,
        talentAmount: 12749.98,
        agencyAmount: 2250.00,
        isWidget: true,
      });
    };

    loadInvoice();
  }, [rawInvoiceId]);

  useEffect(() => {
    if (stage !== "processing") return;
    const timeout = setTimeout(() => {
      setStage("success");

      if (!invoice) return;

      // Update statuses in localStorage
      if (invoice.isWidget) {
        const widgets = localStorage.getItem("brand_widget_invoices");
        if (widgets) {
          const next = JSON.parse(widgets).map((w: any) => 
            w.id === invoice.id ? { ...w, talentPayoutStatus: "disbursed" } : w
          );
          localStorage.setItem("brand_widget_invoices", JSON.stringify(next));
        }
      } else {
        const queue = localStorage.getItem("brand_queue_invoices");
        if (queue) {
          const next = JSON.parse(queue).map((q: any) => 
            q.id === invoice.id ? { ...q, status: "talent_disbursed" } : q
          );
          localStorage.setItem("brand_queue_invoices", JSON.stringify(next));
        }
      }

      // Add payout success notification
      const localNotifs = localStorage.getItem("agency_notifications");
      const notifs = localNotifs ? JSON.parse(localNotifs) : [];
      const newNotif = {
        id: `notif-${Date.now()}`,
        message: `${invoice.recipient} paid talent ${invoice.talentName} ($${invoice.talentAmount.toLocaleString(undefined, { minimumFractionDigits: 2 })}) after deducting 15% agency fee ($${invoice.agencyAmount.toLocaleString(undefined, { minimumFractionDigits: 2 })})`,
        timestamp: "Just now",
        unread: true,
      };
      localStorage.setItem("agency_notifications", JSON.stringify([newNotif, ...notifs]));

      // Sync event
      window.dispatchEvent(new Event("syncBrandDashboard"));
    }, 1800);

    return () => clearTimeout(timeout);
  }, [stage, invoice]);

  const handleConfirmPayout = () => {
    setTransactionId(`TX-DISB-${Math.floor(100000 + Math.random() * 900000)}`);
    setStage("processing");
  };

  if (!invoice) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center font-sans">
        <div className="animate-spin h-6 w-6 border-2 border-white border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white font-sans antialiased selection:bg-white selection:text-black">
      <header className="sticky top-0 z-30 border-b border-white/20 bg-black/95 backdrop-blur">
        <div className="mx-auto flex h-[76px] max-w-[1480px] items-center justify-between gap-4 px-6">
          <button 
            onClick={() => router.push("/branddashboard")} 
            className="inline-flex h-10 items-center gap-2 rounded-xl border border-white/20 bg-[#050505] px-3.5 text-xs font-bold text-white hover:bg-white/5 transition-all cursor-pointer"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Dashboard
          </button>
          <span className="text-[14px] font-semibold text-white">AgncyPay Split Disbursement</span>
          <span className="hidden rounded-lg border border-white/20 bg-[#050505] px-3 py-2 text-[11px] font-bold text-[#d7d7d7] sm:inline-flex">
            Secure payout node
          </span>
        </div>
      </header>

      <main className="mx-auto grid max-w-[1480px] grid-cols-1 gap-8 px-6 py-10 lg:grid-cols-12">
        {/* Left Column - Payout form */}
        <section className="lg:col-span-8 bg-[#050505] rounded-2xl border border-white/20 p-6 md:p-8 space-y-8">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-white bg-white/10 px-2.5 py-0.5 rounded border border-white/20">
              Agency Split Ledger
            </span>
            <h2 className="text-xl font-bold mt-2">Disburse Split for {invoice.campaignName}</h2>
            <p className="text-xs text-neutral-400 mt-1 leading-relaxed">
              Verify split routing paths and release payout funds to talent node. Powered by AgncyPay's auto-routing network.
            </p>
          </div>

          {/* Breakdown cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-5 bg-black border border-white/20 rounded-xl space-y-1">
              <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider">Total Received</span>
              <p className="text-xl font-extrabold text-white">{formatMainboardMoney(invoice.amount)}</p>
              <p className="text-[9px] text-emerald-400 font-semibold flex items-center gap-1">
                <CheckCircle2 className="h-3 w-3" /> Paid by Brand
              </p>
            </div>
            
            <div className="p-5 bg-black border border-white/20 rounded-xl space-y-1">
              <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider">Agency Fee (15%)</span>
              <p className="text-xl font-extrabold text-white">{formatMainboardMoney(invoice.agencyAmount)}</p>
              <p className="text-[9px] text-neutral-500 font-medium">Auto-deducted retainer</p>
            </div>

            <div className="p-5 bg-black border border-white/20 rounded-xl space-y-1">
              <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider">Talent Net Payout (85%)</span>
              <p className="text-xl font-extrabold text-white">{formatMainboardMoney(invoice.talentAmount)}</p>
              <p className="text-[9px] text-neutral-400 font-semibold flex items-center gap-1">
                To talent: <span className="font-bold">@{invoice.talentName}</span>
              </p>
            </div>
          </div>

          {/* Selector for Payout Destination */}
          <div className="space-y-4">
            <h3 className="text-xs font-bold text-white uppercase tracking-wider">Select Payout Destination</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <button
                onClick={() => setPayoutMethod("wallet")}
                className={`p-5 rounded-xl border text-left transition-all flex flex-col justify-between h-32 cursor-pointer ${
                  payoutMethod === "wallet"
                    ? "border-white bg-white/5 shadow-sm"
                    : "border-white/20 bg-black hover:border-white/40"
                }`}
              >
                <div className="flex justify-between items-start w-full">
                  <span className="text-xs font-bold text-white flex items-center gap-1.5">
                    <Coins className="h-4 w-4 text-white" />
                    Talent's AgncyPay Wallet
                  </span>
                  <span className="text-[9px] font-bold text-emerald-400 bg-emerald-950/80 px-2 py-0.5 rounded-full uppercase tracking-wider border border-emerald-900">
                    Instant
                  </span>
                </div>
                <div>
                  <p className="text-[10px] text-neutral-400 font-medium leading-tight">
                    Funds will land in @{invoice.talentName}'s wallet instantly. Backed by automated split contracts.
                  </p>
                  <p className="text-[9px] font-bold text-white mt-2">Fee: $0.00</p>
                </div>
              </button>

              <button
                onClick={() => setPayoutMethod("ach")}
                className={`p-5 rounded-xl border text-left transition-all flex flex-col justify-between h-32 cursor-pointer ${
                  payoutMethod === "ach"
                    ? "border-white bg-white/5 shadow-sm"
                    : "border-white/20 bg-black hover:border-white/40"
                }`}
              >
                <div className="flex justify-between items-start w-full">
                  <span className="text-xs font-bold text-white flex items-center gap-1.5">
                    <Users className="h-4 w-4 text-white" />
                    Direct Bank Transfer (ACH)
                  </span>
                  <span className="text-[9px] font-bold text-[#ff8a00] bg-[#ff8a00]/10 px-2 py-0.5 rounded-full uppercase tracking-wider border border-[#ff8a00]/20">
                    1 Day
                  </span>
                </div>
                <div>
                  <p className="text-[10px] text-neutral-400 font-medium leading-tight">
                    Disburse directly to talent's legal bank account on file. Settles next business day.
                  </p>
                  <p className="text-[9px] font-bold text-white mt-2">Fee: $1.50 ACH fee</p>
                </div>
              </button>
            </div>
          </div>

          {/* Confirm Button */}
          <div className="pt-4 border-t border-white/20 flex flex-col gap-3">
            <button
              onClick={handleConfirmPayout}
              className="w-full h-12 rounded-xl bg-white hover:bg-neutral-200 text-black text-sm font-black transition-colors flex items-center justify-center gap-2 cursor-pointer shadow-md"
            >
              <Sparkles className="h-4.5 w-4.5 text-black" />
              Confirm & Release Payout ({formatMainboardMoney(invoice.talentAmount)})
            </button>
            <p className="text-[10px] text-center text-neutral-400 leading-tight">
              Releasing dispatches splits to wallet addresses instantly. Irreversible under network clearance rules.
            </p>
          </div>
        </section>

        {/* Right Column - Summary */}
        <aside className="lg:col-span-4 space-y-6">
          <div className="bg-[#050505] rounded-2xl border border-white/20 p-5 shadow-sm space-y-5">
            <h3 className="text-xs font-black uppercase tracking-wider text-[#8f8f8f] pb-3 border-b border-white/20">
              Disbursement Details
            </h3>

            <div className="space-y-3.5 text-xs">
              <div className="flex justify-between items-center">
                <span className="text-neutral-400 font-semibold">Invoice ID</span>
                <span className="text-white font-mono font-bold">{invoice.id}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-neutral-400 font-semibold">Total Paid by Brand</span>
                <span className="text-white font-bold">{formatMainboardMoney(invoice.amount)}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-neutral-400 font-semibold">Agency Retainer</span>
                <span className="text-white font-bold">{formatMainboardMoney(invoice.agencyAmount)}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-neutral-400 font-semibold">Talent Share</span>
                <span className="text-white font-bold">{formatMainboardMoney(invoice.talentAmount)}</span>
              </div>
              <div className="flex justify-between items-center border-t border-white/10 pt-3">
                <span className="text-neutral-400 font-semibold">Clearing Node</span>
                <span className="text-white font-bold font-mono">@{invoice.recipient.toLowerCase().replace(/\s/g, "")}.node</span>
              </div>
            </div>
          </div>
        </aside>
      </main>

      {/* Loader Overlay */}
      {(stage === "processing" || stage === "success") && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/65 px-4 backdrop-blur-[2px]">
          <section className="w-full max-w-[320px] rounded-2xl border border-white/20 bg-[#0A0A0A] p-6 text-center shadow-2xl space-y-5">
            {stage === "processing" ? (
              <>
                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full border border-white/20 bg-[#050505]">
                  <Lock className="h-7 w-7 animate-spin text-white" />
                </div>
                <div>
                  <h2 className="text-[20px] font-bold text-white tracking-tight">Routing split payout</h2>
                  <p className="mt-1 text-[10px] leading-relaxed text-[#bdbdbd]">
                    Securing disbursement session and auto-routing splits to Wallet IDs.
                  </p>
                </div>
              </>
            ) : (
              <>
                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-[#16c95f] text-white shadow-[0_0_28px_rgba(22,201,95,0.3)]">
                  <CheckCircle2 className="h-9 w-9" />
                </div>
                <div>
                  <h2 className="text-[20px] font-bold text-[#69f39b] tracking-tight">Disbursement Complete</h2>
                  <p className="mt-1.5 text-[10px] leading-relaxed text-[#c8f5d5]">
                    Transaction {transactionId} processed successfully. Retainer deducted, splits routed.
                  </p>
                </div>
                <button
                  onClick={() => router.push("/branddashboard")}
                  className="w-full inline-flex h-11 items-center justify-center rounded-xl border border-white bg-white text-[12px] font-black text-black hover:bg-neutral-200 transition-colors cursor-pointer"
                >
                  Return to Dashboard
                </button>
              </>
            )}
          </section>
        </div>
      )}
    </div>
  );
}
