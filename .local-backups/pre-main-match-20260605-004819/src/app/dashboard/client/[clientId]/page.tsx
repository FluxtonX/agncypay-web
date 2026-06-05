"use client";

import React, { useState } from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { mainboardInvoices, formatMainboardMoney } from "../../../../lib/mainboard";
import { useParams, useRouter } from "next/navigation";
import { cn } from "../../../../lib/utils";

const dashboardPeopleByInvoiceId: Record<string, string> = {
  "MB-6984": "Nike",
  "MB-7012": "Zara",
  "MB-7044": "Adidas",
  "MB-6890": "Spotify",
  "MB-6815": "Netflix",
};

const payeeLogoByInvoiceId: Record<string, { mark: string; label: string; detail?: string; src?: string; className: string; markClassName?: string; }> = {
  "MB-6984": { mark: "Nike", label: "Nike", src: "https://cdn.simpleicons.org/nike/FFFFFF", className: "bg-black text-white" },
  "MB-7012": { mark: "Zara", label: "Zara", src: "https://cdn.simpleicons.org/zara/000000", className: "bg-white text-black" },
  "MB-7044": { mark: "Adidas", label: "Adidas", src: "https://upload.wikimedia.org/wikipedia/commons/2/20/Adidas_Logo.svg", className: "bg-white" },
  "MB-6890": { mark: "Spotify", label: "Spotify", src: "https://cdn.simpleicons.org/spotify/1DB954", className: "bg-black text-white" },
  "MB-6815": { mark: "Netflix", label: "Netflix", src: "https://cdn.simpleicons.org/netflix/E50914", className: "bg-black text-white" },
};

function getInvoicePersonName(invoice: any) {
  return dashboardPeopleByInvoiceId[invoice.id] || invoice.talentRealName || invoice.talentName || invoice.recipient;
}

function RemoteBrandImage({ src, alt, fallback, className, imageClassName }: any) {
  const [failed, setFailed] = React.useState(false);
  return (
    <div className={cn("relative overflow-hidden", className)}>
      {failed ? (
        <div className="flex h-full w-full items-center justify-center rounded-[inherit] border border-[#3f3f3f] bg-white px-1 text-center text-[10px] font-semibold leading-[1.05] text-black">
          <span className="block max-w-full truncate">{fallback}</span>
        </div>
      ) : (
        <img src={src} alt={alt} onError={() => setFailed(true)} className={cn("h-full w-full object-contain", imageClassName)} referrerPolicy="no-referrer" loading="lazy" />
      )}
    </div>
  );
}

function ALogoIcon({ className }: { className?: string }) {
  return <img src="/AlogoTransparent.png" alt="A" className={cn("inline-block object-contain", className)} />;
}

function StatusPill({ status }: { status: string }) {
  const normalized = status.toLowerCase();
  const colorClass = normalized === "paid" ? "border-[#10b95f] bg-[#082315] text-[#70ff9e]" : normalized === "processing" ? "border-[#ff8a00] bg-[#261603] text-[#ffb866]" : normalized === "needs approval" ? "border-[#ff3b30] bg-[#250706] text-[#ff9088]" : "border-[#3f3f3f] bg-[#0f0f0f] text-[#d7d7d7]";
  return (
    <span className={cn("inline-flex h-7 items-center gap-1.5 rounded-[7px] border px-2.5 text-[12px] font-semibold", colorClass)}>
      {normalized === "paid" ? <span>Paid</span> : status}
    </span>
  );
}

function RequestPayPill() {
  return (
    <span className="inline-flex h-9 min-w-[100px] items-center justify-center gap-1.5 rounded-full border-2 border-[#ff8a00] bg-[#261603] px-3 text-[12px] uppercase text-white shadow-[0_0_0_1px_rgba(255,138,0,0.14)]">
      <span className="font-bold">Request Pay</span>
    </span>
  );
}

function InvoiceStatusPill({ invoice }: { invoice: any }) {
  if (invoice.id === "MB-6984" && invoice.status.toLowerCase() === "ready") return <RequestPayPill />;
  if (invoice.id === "MB-7044") {
    const normalized = invoice.status.toLowerCase();
    const colorClass = normalized === "paid" ? "border-[#10b95f] bg-[#082315] text-[#70ff9e]" : normalized === "processing" ? "border-[#ff8a00] bg-[#261603] text-[#ffb866]" : normalized === "needs approval" ? "border-[#ff3b30] bg-[#250706] text-[#ff9088]" : "border-[#3f3f3f] bg-[#0f0f0f] text-[#d7d7d7]";
    return (
      <span className={cn("inline-flex h-7 items-center gap-1.5 rounded-[7px] border px-2.5 text-[12px] font-semibold", colorClass)}>
        <span>{normalized === "needs approval" ? "Pay" : invoice.status}</span>
      </span>
    );
  }
  return <StatusPill status={invoice.status} />;
}

function PayeeLogoTile({ invoice, size = "md" }: { invoice: any; size?: "sm" | "md" }) {
  const config = payeeLogoByInvoiceId[invoice.id];
  const name = getInvoicePersonName(invoice);
  const initials = name.split(" ").map((part: string) => part[0]).join("").slice(0, 2).toUpperCase();
  const mark = config?.mark || initials;
  return (
    <div className={cn("flex shrink-0 flex-col items-center justify-center overflow-hidden rounded-[9px] border border-[#444] leading-none shadow-[inset_0_0_0_1px_rgba(255,255,255,0.08)]", size === "sm" ? "h-9 w-9" : "h-12 w-12", config?.className || "bg-[#161616] text-white")} aria-label={config?.label || name} title={config?.label || name}>
      {config?.src ? <RemoteBrandImage src={config.src} alt={config.label} fallback={config.label} className={cn("h-full w-full", size === "sm" ? "p-1.5" : "p-2")} imageClassName="object-contain" /> : <span className={cn(size === "sm" ? "text-[12px]" : "text-[15px]", "font-black", config?.markClassName)}>{mark}</span>}
    </div>
  );
}

function AutoSplitToggle({ active, onToggle, label = "Autosplit" }: { active: boolean; onToggle: () => void; label?: string; }) {
  return (
    <button type="button" onClick={(event) => { event.stopPropagation(); onToggle(); }} className="inline-flex h-8 items-center gap-2 rounded-full border border-[#444] bg-black px-2.5 text-[11px] font-black text-white hover:border-[#777]" aria-pressed={active}>
      <span className={cn("relative h-5 w-10 overflow-hidden rounded-full border transition-colors", active ? "border-[#13e56d] bg-[#13e56d]" : "border-[#555] bg-[#151515]")}>
        <span className={cn("absolute left-1 top-1/2 h-3.5 w-3.5 -translate-y-1/2 rounded-full bg-white transition-transform", active ? "translate-x-5" : "translate-x-0")} />
      </span>
      {label}
    </button>
  );
}

export default function ClientInvoicesPage() {
  const params = useParams();
  const router = useRouter();
  const clientId = params.clientId as string;
  const decodedClient = decodeURIComponent(clientId);
  
  const [autosplitInvoiceIds, setAutosplitInvoiceIds] = useState<string[]>(["MB-6984"]);

  const toggleAutosplitInvoice = (invoiceId: string) => {
    setAutosplitInvoiceIds((current) => current.includes(invoiceId) ? current.filter((id) => id !== invoiceId) : [...current, invoiceId]);
  };

  const invoices = mainboardInvoices.slice(0, 6);

  return (
    <main className="min-h-screen bg-black text-white p-8">
      <div className="mx-auto max-w-[1200px]">
        <Link href="/dashboard/send-request" className="inline-flex h-10 items-center gap-2 rounded-[7px] border border-[#252525] bg-[#050505] px-3 text-[13px] font-semibold text-white hover:border-[#555] mb-8">
          <ArrowLeft className="h-4 w-4" />
          Back to Send Request
        </Link>
        <h1 className="text-[28px] font-bold mb-6 capitalize">{decodedClient} Invoices</h1>
        
        <div className="overflow-hidden rounded-[13px] border border-[#3a3a3a] bg-[#050505]">
          <div className="overflow-x-auto">
            <table className="min-w-[920px] w-full table-fixed text-left">
              <colgroup>
                <col className="w-[128px]" />
                <col className="w-[150px]" />
                <col className="w-[170px]" />
                <col className="w-[120px]" />
                <col className="w-[140px]" />
                <col className="w-[260px]" />
              </colgroup>
              <thead>
                <tr className="h-12 border-b border-[#333] text-[11px] font-semibold uppercase tracking-[0.12em] text-[#777]">
                  <th className="px-4">Invoice</th>
                  <th className="px-0">Autosplit</th>
                  <th className="px-0">Status</th>
                  <th className="px-0">Due</th>
                  <th className="px-0">Amount</th>
                  <th className="px-0">Client</th>
                </tr>
              </thead>
              <tbody>
                {invoices.length > 0 ? invoices.map(invoice => (
                  <tr
                    key={invoice.id}
                    onClick={() => router.push(`/dashboard/pay-flow/${invoice.id}`)}
                    className="h-[72px] cursor-pointer border-b border-[#2c2c2c] transition-colors hover:bg-white/[0.04] focus:bg-white/[0.05] focus:outline-none"
                  >
                    <td className="px-4">
                      <span className="font-mono text-[13px] font-semibold text-white">
                        {invoice.id}
                      </span>
                    </td>
                    <td className="px-0">
                      <AutoSplitToggle
                        active={autosplitInvoiceIds.includes(invoice.id)}
                        onToggle={() => toggleAutosplitInvoice(invoice.id)}
                      />
                    </td>
                    <td className="px-0">
                      <InvoiceStatusPill invoice={invoice} />
                    </td>
                    <td className="px-0 text-[13px] text-[#bdbdbd]">{invoice.due}</td>
                    <td className="px-0 text-[13px] font-semibold text-white">
                      {formatMainboardMoney(invoice.amount + invoice.fee)}
                    </td>
                    <td className="px-0">
                      <div className="flex min-w-0 items-center gap-3 pr-3">
                        <PayeeLogoTile invoice={invoice} size="sm" />
                        <div className="min-w-0">
                          <p className="truncate text-[13px] font-semibold text-white">{getInvoicePersonName(invoice)}</p>
                          <p className="truncate text-[11px] text-[#7f7f7f]">{invoice.recipient} - {invoice.jobType}</p>
                        </div>
                      </div>
                    </td>
                  </tr>
                )) : (
                  <tr>
                    <td colSpan={6} className="py-8 text-center text-[14px] text-[#777]">No invoices found.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </main>
  );
}
