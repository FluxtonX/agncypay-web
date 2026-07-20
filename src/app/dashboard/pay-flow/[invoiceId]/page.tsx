"use client";

import React, { use, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  Clipboard,
  Clock,
  FileText,
  Loader2,
  XCircle,
  ChevronDown,
  CheckCircle2,
} from "lucide-react";
import { usePayment } from "@/modules/accounting/hooks/usePayment";
import { Badge } from "@/components/ui/Badge";
import { cn } from "@/lib/utils";
import { useApp } from "@/context/AppContext";

// ─── Currency data ───────────────────────────────────────────────────────────
const CURRENCIES = [
  { code: "USD", label: "US Dollar", flag: "us", rate: 1 },
  { code: "EUR", label: "Euro", flag: "eu", rate: 0.92 },
  { code: "GBP", label: "British Pound", flag: "gb", rate: 0.78 },
  { code: "CAD", label: "Canadian Dollar", flag: "ca", rate: 1.37 },
  { code: "AUD", label: "Australian Dollar", flag: "au", rate: 1.52 },
  { code: "AED", label: "UAE Dirham", flag: "ae", rate: 3.67 },
  { code: "JPY", label: "Japanese Yen", flag: "jp", rate: 156.8 },
  { code: "SGD", label: "Singapore Dollar", flag: "sg", rate: 1.35 },
] as const;
type CurrencyCode = (typeof CURRENCIES)[number]["code"];

function formatMoney(value: number, code: CurrencyCode): string {
  const curr = CURRENCIES.find((c) => c.code === code) ?? CURRENCIES[0];
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: curr.code,
    minimumFractionDigits: 2,
  }).format(value * curr.rate);
}

function statusVariant(status: string): "success" | "warning" | "error" | "neutral" {
  const s = String(status).toUpperCase();
  if (s === "SETTLED" || s === "PAID") return "success";
  if (["FAILED", "REFUNDED", "CHARGEBACKED", "ERROR"].includes(s)) return "error";
  if (s === "PROCESSING" || s === "PENDING") return "warning";
  return "neutral";
}

// ─── Sidebar info block ───────────────────────────────────────────────────────
function SidebarSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div
      className="rounded-xl overflow-hidden"
      style={{
        border: "1px solid #3a3a3a",
        background: "#0D0D0D",
        boxShadow:
          "0 0 0 1px rgba(255,255,255,0.04), 0 4px 24px -4px rgba(0,0,0,0.6), 0 1px 4px rgba(255,255,255,0.03)",
      }}
    >
      <div className="border-b border-[#3a3a3a] px-5 py-3 text-[10px] font-extrabold uppercase tracking-widest text-neutral-500">
        {title}
      </div>
      <div className="px-5 py-4">{children}</div>
    </div>
  );
}

function InfoRow({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-1 py-1">
      <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-600">{label}</span>
      <span className="text-sm font-semibold text-white">{value}</span>
    </div>
  );
}

// ─── FlagImg ─────────────────────────────────────────────────────────────────
function FlagImg({ flag, className }: { flag: string; className?: string }) {
  // eslint-disable-next-line @next/next/no-img-element
  return <img src={`https://flagcdn.com/w40/${flag}.png`} alt={flag} className={cn("rounded-sm object-cover", className)} />;
}

interface PageProps {
  params: Promise<{ invoiceId: string }>;
}

export default function PayFlowPageRoute({ params }: PageProps) {
  const { invoiceId } = use(params);
  const { state } = useApp();
  const { payment, loading, error } = usePayment(invoiceId);
  const router = useRouter();
  const [currencyCode, setCurrencyCode] = useState<CurrencyCode>("USD");
  const [isCurrencyOpen, setIsCurrencyOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  const currency = CURRENCIES.find((c) => c.code === currencyCode) ?? CURRENCIES[0];
  const amount = payment ? parseFloat(payment.amount) : 0;
  const fee = amount * 0.015;
  const total = amount + fee;
  const displayMoney = (v: number) => formatMoney(v, currencyCode);

  const userRole = state.user?.accountType || "brand";
  const isAgency = userRole === "agency";

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch { /* fallback not needed */ }
  };

  // ── Pay Now → go to /pay/[id] page or /payout/[id] page ───────────────────────
  const handleAction = () => {
    if (isAgency && (payment?.status?.toUpperCase() === "SETTLED" || payment?.status?.toUpperCase() === "PAID")) {
      router.push(`/payout/${invoiceId}?returnTo=dashboard`);
    } else {
      router.push(`/pay/${invoiceId}?mode=logged_in&returnTo=dashboard&currency=${currencyCode}`);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <Loader2 className="h-10 w-10 text-neutral-500 animate-spin mx-auto mb-4" />
          <p className="text-sm text-neutral-400">Loading payment details...</p>
        </div>
      </div>
    );
  }

  if (error || !payment) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center max-w-sm">
          <XCircle className="h-12 w-12 text-red-400 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-white mb-2">Payment Not Found</h2>
          <p className="text-sm text-neutral-400 mb-6">{error || "This payment record does not exist."}</p>
          <Link href="/dashboard" className="inline-flex h-10 items-center gap-2 px-5 rounded-lg bg-white text-black text-sm font-bold hover:bg-neutral-200 transition-colors">
            <ArrowLeft className="h-4 w-4" /> Back to Dashboard
          </Link>
        </div>
      </div>
    );
  }

  const isPaidStatus = payment.status?.toUpperCase() === "SETTLED" || payment.status?.toUpperCase() === "PAID";

  return (
    <div className="space-y-5">
      {/* Top bar */}
      <div className="flex items-center justify-between">
        <button
          type="button"
          onClick={() => router.back()}
          className="flex items-center gap-2 text-sm font-bold text-neutral-400 hover:text-white transition-colors cursor-pointer"
        >
          <ArrowLeft className="h-4 w-4" />
          Back
        </button>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleCopyLink}
            className="h-8 px-3 rounded-lg border border-[#3a3a3a] bg-white/[0.04] text-xs font-bold text-neutral-300 hover:bg-white/[0.08] transition-colors flex items-center gap-1.5 cursor-pointer"
          >
            <Clipboard className="h-3.5 w-3.5" />
            {copied ? "Copied!" : "Copy Link"}
          </button>
          <Link href="/dashboard/invoices" className="h-8 px-3 rounded-lg border border-[#3a3a3a] bg-white/[0.04] text-xs font-bold text-neutral-300 hover:bg-white/[0.08] transition-colors flex items-center gap-1.5">
            <FileText className="h-3.5 w-3.5" />
            All Invoices
          </Link>
        </div>
      </div>

      {/* Two-panel grid */}
      <div className="grid gap-5 lg:grid-cols-[360px_minmax(0,1fr)] text-left select-text">

        {/* ── LEFT SIDEBAR ─────────────────────────────────────────────────── */}
        <aside className="space-y-4">
          {/* Invoice heading */}
          <div>
            <p className="text-[10px] font-extrabold uppercase tracking-widest text-neutral-600 mb-1">Payment Record</p>
            <h1 className="text-2xl font-extrabold text-white font-mono leading-tight">
              {payment.invoiceId ? `# ${payment.invoiceId}` : payment.id.substring(0, 14).toUpperCase()}
            </h1>
          </div>

          {/* Amount due card */}
          <div
            className="rounded-xl flex items-center justify-between px-5 py-4"
            style={{
              border: "1px solid #3a3a3a",
              background: "linear-gradient(135deg, #111 0%, #0D0D0D 100%)",
              boxShadow: "0 0 0 1px rgba(255,255,255,0.05), 0 4px 24px -4px rgba(0,0,0,0.8), 0 1px 8px rgba(255,255,255,0.04)",
            }}
          >
            <span className="text-xs font-bold text-neutral-500">Amount Due</span>
            <span className="text-2xl font-black text-white">{displayMoney(total)}</span>
          </div>

          {/* Invoice details */}
          <SidebarSection title="Invoice Details">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-wider text-neutral-600 mb-1">Status</p>
                  <Badge variant={statusVariant(payment.status)} className="capitalize">
                    {payment.status.toLowerCase()}
                  </Badge>
                </div>
                <div className="text-right">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-neutral-600 mb-1">Source</p>
                  <span className="text-xs font-semibold text-neutral-300">{payment.source}</span>
                </div>
              </div>
              <div className="border-t border-[#3a3a3a] pt-3 space-y-3">
                <InfoRow label="Client" value={payment.invoiceData?.clientName || "—"} />
                <InfoRow label="Description" value={payment.description || payment.invoiceData?.description || "—"} />
                <InfoRow
                  label="Created"
                  value={new Date(payment.createdAt).toLocaleDateString("en-US", {
                    month: "long", day: "numeric", year: "numeric",
                  })}
                />
                {isPaidStatus && payment.settledAt && (
                  <InfoRow
                    label="Settled At"
                    value={new Date(payment.settledAt).toLocaleString("en-US", {
                      month: "short", day: "numeric", hour: "numeric", minute: "2-digit",
                    })}
                  />
                )}
              </div>
            </div>
          </SidebarSection>

          {/* Activity */}
          <SidebarSection title="Activity Log">
            <div className="space-y-3">
              <p className="text-[10px] font-black uppercase tracking-wider text-neutral-600">Today</p>
              {[
                {
                  time: new Date(payment.createdAt).toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" }),
                  label: "Invoice ingested to ledger.",
                },
                {
                  time: new Date(payment.updatedAt).toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" }),
                  label: `Status: ${payment.status}.`,
                },
              ].map((item, i) => (
                <div key={i} className="flex gap-3 text-xs">
                  <Clock className="h-3.5 w-3.5 text-emerald-400 mt-0.5 shrink-0" />
                  <div>
                    <p className="font-bold text-white">{item.time}</p>
                    <p className="text-emerald-400">{item.label}</p>
                  </div>
                </div>
              ))}
              <Link href="/dashboard" className="text-[11px] font-bold text-neutral-500 hover:text-white transition-colors">
                ← Back to dashboard
              </Link>
            </div>
          </SidebarSection>

          {/* Splits (if any) */}
          {payment.splits && payment.splits.length > 0 && (
            <SidebarSection title="Split Participants">
              <div className="space-y-2.5">
                {payment.splits.map((split) => (
                  <div key={split.id} className="flex items-center justify-between text-xs">
                    <span className="text-neutral-400 font-mono truncate max-w-[160px]">{split.walletId.substring(0, 16)}…</span>
                    <div className="flex items-center gap-2">
                      <span className="text-neutral-500">{(parseFloat(split.ratio) * 100).toFixed(0)}%</span>
                      <span className="font-bold text-white font-mono">
                        ${parseFloat(split.amount).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </SidebarSection>
          )}
        </aside>

        {/* ── RIGHT CHECKOUT PANEL ──────────────────────────────────────────── */}
        <section
          className="rounded-xl p-6 sm:p-8"
          style={{
            border: "1px solid rgba(255,255,255,0.10)",
            background: "#0D0D0D",
            boxShadow: "0 0 0 1px rgba(255,255,255,0.04), 0 8px 40px -8px rgba(0,0,0,0.8), 0 1px 8px rgba(255,255,255,0.04)",
          }}
        >
          <div className="max-w-[460px] mx-auto">
            {/* Header */}
            <div className="flex items-start justify-between mb-6">
              <h2 className="text-xl font-extrabold text-white">Invoice Details</h2>
              <button
                type="button"
                onClick={handleCopyLink}
                className="flex items-center gap-1.5 text-[10px] font-bold text-neutral-500 hover:text-white transition-colors cursor-pointer"
              >
                <Clipboard className="h-3.5 w-3.5" />
                Copy Link
              </button>
            </div>

            {/* Recipient */}
            <div className="mb-5">
              <p className="text-xs font-bold text-neutral-400 mb-2">Recipient *</p>
              <div
                className="flex items-center gap-3 rounded-lg p-3 min-h-[54px]"
                style={{ border: "1px solid rgba(255,255,255,0.08)", background: "#1A1A1A" }}
              >
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-emerald-500 to-teal-600 text-sm font-black text-white">
                  {(payment.invoiceData?.clientName || "A")[0].toUpperCase()}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-bold text-white truncate">
                    {payment.invoiceData?.clientName || "Manual Client"}
                  </p>
                  <p className="text-xs text-neutral-500">
                    {payment.invoiceId ? `Invoice # ${payment.invoiceId}` : payment.id.substring(0, 12).toUpperCase()}
                  </p>
                </div>
              </div>
            </div>

            {/* Currency picker */}
            <div className="mb-5">
              <p className="text-xs font-bold text-neutral-400 mb-2">Currency *</p>
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setIsCurrencyOpen((o) => !o)}
                  className="w-full flex items-center justify-between h-11 rounded-lg px-3 text-left transition-colors cursor-pointer"
                  style={{ border: "1px solid rgba(58,58,58,1)", background: "#1A1A1A" }}
                >
                  <span className="flex items-center gap-2.5">
                    <FlagImg flag={currency.flag} className="h-4 w-6" />
                    <span className="text-sm font-bold text-white">{currency.code}</span>
                    <span className="text-xs text-neutral-500">{currency.label}</span>
                  </span>
                  <ChevronDown className={cn("h-4 w-4 text-neutral-500 transition-transform", isCurrencyOpen && "rotate-180")} />
                </button>
                {isCurrencyOpen && (
                  <div
                    className="absolute left-0 right-0 top-[48px] z-30 max-h-[220px] overflow-y-auto rounded-lg p-1 shadow-2xl"
                    style={{ border: "1px solid rgba(58,58,58,1)", background: "#111" }}
                  >
                    {CURRENCIES.map((item) => (
                      <button
                        key={item.code}
                        type="button"
                        onClick={() => { setCurrencyCode(item.code); setIsCurrencyOpen(false); }}
                        className={cn("w-full flex items-center gap-3 rounded px-3 py-2.5 text-left hover:bg-white/[0.07] transition-colors cursor-pointer", currencyCode === item.code && "bg-white/[0.10]")}
                      >
                        <FlagImg flag={item.flag} className="h-4 w-6" />
                        <span className="text-xs font-bold text-white">{item.code}</span>
                        <span className="text-xs text-neutral-500 flex-1">{item.label}</span>
                        {currencyCode === item.code && <span className="h-2 w-2 rounded-full bg-emerald-400 shrink-0" />}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div className="border-t border-[#3a3a3a] my-5" />

            {/* Product row */}
            <div className="mb-5">
              <h3 className="text-sm font-extrabold text-white mb-3">Product</h3>
              <div className="grid grid-cols-[1fr_40px_72px_60px] gap-2 text-[10px] font-bold uppercase tracking-wider text-neutral-600 mb-2">
                <span>Item / Job</span><span>Qty</span><span>Rate</span><span>%</span>
              </div>
              <div
                className="grid grid-cols-[1fr_40px_72px_60px] gap-2 items-center rounded-lg px-3 py-3 min-h-[52px]"
                style={{ border: "1px solid rgba(58,58,58,1)", background: "#1D1D1D" }}
              >
                <div className="min-w-0">
                  <p className="text-xs font-bold text-white truncate">{payment.description || "Invoice Payment"}</p>
                  <p className="text-[10px] text-neutral-500">{payment.source}</p>
                </div>
                <span className="text-xs font-bold text-neutral-300 text-center">1</span>
                <span className="text-[11px] font-mono font-bold text-white">{displayMoney(amount)}</span>
                <span className="text-xs font-bold text-neutral-400 text-center">100%</span>
              </div>
            </div>

            {/* Totals */}
            <div
              className="rounded-lg p-4 space-y-2.5 mb-5"
              style={{ background: "#141414", border: "1px solid #3a3a3a" }}
            >
              <div className="flex justify-between text-xs font-semibold text-neutral-400">
                <span>Sub Total:</span>
                <span>{displayMoney(amount)}</span>
              </div>
              <div className="flex justify-between text-xs font-semibold text-neutral-400">
                <span>Fee (1.5%):</span>
                <span>{displayMoney(fee)}</span>
              </div>
              <div className="border-t border-[#3a3a3a] pt-2.5 flex justify-between font-extrabold text-white">
                <span className="text-sm">Total:</span>
                <span className="text-xl font-mono">{displayMoney(total)}</span>
              </div>
            </div>

            {/* CTAs */}
            <div className="flex gap-3 text-center">
              {isPaidStatus ? (
                isAgency ? (
                  <button
                    type="button"
                    onClick={handleAction}
                    className="flex-1 h-12 rounded-lg bg-[#4B6BFB] text-white font-extrabold text-sm hover:bg-[#5b7bfb] transition-colors cursor-pointer flex items-center justify-center gap-2"
                  >
                    Payout Talent (85%) — {displayMoney(amount * 0.85)}
                  </button>
                ) : (
                  <div className="flex-1 flex items-center justify-center gap-2 h-12 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 font-bold text-sm">
                    <CheckCircle2 className="h-5 w-5" />
                    Already Settled
                  </div>
                )
              ) : (
                <button
                  type="button"
                  onClick={handleAction}
                  className="flex-1 h-12 rounded-lg bg-white text-black font-extrabold text-sm hover:bg-neutral-200 transition-colors cursor-pointer flex items-center justify-center gap-2"
                >
                  Pay Now — {displayMoney(total)}
                </button>
              )}
              <Link
                href="/dashboard"
                className="h-12 px-5 rounded-lg border border-red-500/30 bg-red-500/5 text-red-400 font-bold text-sm hover:bg-red-500/10 transition-colors flex items-center justify-center"
              >
                Cancel
              </Link>
            </div>

            <p className="text-center text-[10px] text-neutral-600 mt-4 font-medium">
              Protected by bank-level encryption · AgncyPay Inc.
            </p>
          </div>
        </section>
      </div>
    </div>
  );
}
