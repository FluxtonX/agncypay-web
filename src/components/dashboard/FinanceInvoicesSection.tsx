"use client";

import React from "react";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { cn } from "../../lib/utils";
import { formatMainboardMoney, type MainboardInvoice } from "../../lib/mainboard";
import {
  getInvoiceClientName,
  getInvoiceStatusLabel,
  payeeLogoByInvoiceId,
} from "../../lib/finance-dashboard-invoices";

function RemoteBrandImage({
  src,
  alt,
  fallback,
  className,
  imageClassName,
}: {
  src: string;
  alt: string;
  fallback: string;
  className?: string;
  imageClassName?: string;
}) {
  const [failed, setFailed] = React.useState(false);

  return (
    <div className={cn("relative overflow-hidden", className)}>
      {failed ? (
        <div className="flex h-full w-full items-center justify-center rounded-[inherit] border border-[#3f3f3f] bg-white px-1 text-center text-[10px] font-semibold leading-[1.05] text-black">
          <span className="block max-w-full truncate">{fallback}</span>
        </div>
      ) : (
        <img
          src={src}
          alt={alt}
          onError={() => setFailed(true)}
          className={cn("h-full w-full object-contain", imageClassName)}
          referrerPolicy="no-referrer"
          loading="lazy"
        />
      )}
    </div>
  );
}

function Panel({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <section className={cn("rounded-[13px] border border-[#3a3a3a] bg-[#050505]", className)}>
      {children}
    </section>
  );
}

function AutoSplitToggle({
  active,
  onToggle,
}: {
  active: boolean;
  onToggle: () => void;
}) {
  return (
    <button
      type="button"
      onClick={(event) => {
        event.stopPropagation();
        onToggle();
      }}
      className="inline-flex h-8 items-center gap-2 rounded-full border border-[#444] bg-black px-2.5 text-[11px] font-black text-white hover:border-[#777]"
      aria-pressed={active}
    >
      <span
        className={cn(
          "relative h-5 w-10 overflow-hidden rounded-full border transition-colors",
          active ? "border-[#13e56d] bg-[#13e56d]" : "border-[#555] bg-[#151515]"
        )}
      >
        <span
          className={cn(
            "absolute left-1 top-1/2 h-3.5 w-3.5 -translate-y-1/2 rounded-full bg-white transition-transform",
            active ? "translate-x-5" : "translate-x-0"
          )}
        />
      </span>
      Autosplit
    </button>
  );
}

function InvoiceStatusPill({ invoice }: { invoice: MainboardInvoice }) {
  const label = getInvoiceStatusLabel(invoice.status);
  const colorClass =
    label === "Paid"
      ? "border-[#10b95f] bg-[#082315] text-[#70ff9e]"
      : label === "Pay"
        ? "border-[#ff3b30] bg-[#250706] text-[#ff9088]"
        : "border-[#ff8a00] bg-[#261603] text-[#ffb866]";

  return (
    <span className={cn("inline-flex h-7 items-center rounded-[7px] border px-2.5 text-[12px] font-semibold", colorClass)}>
      {label}
    </span>
  );
}

function PayeeLogoTile({ invoice, size = "sm" }: { invoice: MainboardInvoice; size?: "sm" | "md" }) {
  const config = payeeLogoByInvoiceId[invoice.id];
  const name = getInvoiceClientName(invoice);
  const initials = name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
  const mark = config?.mark || initials;

  return (
    <div
      className={cn(
        "flex shrink-0 flex-col items-center justify-center overflow-hidden rounded-[9px] border border-[#444] leading-none shadow-[inset_0_0_0_1px_rgba(255,255,255,0.08)]",
        size === "sm" ? "h-9 w-9" : "h-12 w-12",
        config?.className || "bg-[#161616] text-white"
      )}
      aria-label={config?.label || name}
      title={config?.label || name}
    >
      {config?.src ? (
        <RemoteBrandImage
          src={config.src}
          alt={config.label}
          fallback={config.label}
          className={cn("h-full w-full", size === "sm" ? "p-1.5" : "p-2")}
          imageClassName="object-contain"
        />
      ) : (
        <span className={cn(size === "sm" ? "text-[12px]" : "text-[15px]", "font-black", config?.markClassName)}>
          {mark}
        </span>
      )}
    </div>
  );
}

type FinanceInvoicesSectionProps = {
  invoices: MainboardInvoice[];
  autosplitInvoiceIds: string[];
  onToggleAutosplit: (invoiceId: string) => void;
  onInvoiceSelect: (invoice: MainboardInvoice) => void;
  subtitle?: string;
  showOpenInvoicesLink?: boolean;
};

export function FinanceInvoicesSection({
  invoices,
  autosplitInvoiceIds,
  onToggleAutosplit,
  onInvoiceSelect,
  subtitle = "Autosplit, status, due, amount, client. Select an invoice to inspect or pay.",
  showOpenInvoicesLink = true,
}: FinanceInvoicesSectionProps) {
  return (
    <Panel className="overflow-hidden">
      <div className="flex items-center justify-between border-b border-[#333] p-4 sm:p-5">
        <div>
          <h2 className="text-[18px] font-semibold text-white">Invoices</h2>
          <p className="mt-1 text-[13px] text-[#8f8f8f]">{subtitle}</p>
        </div>
        {showOpenInvoicesLink && (
          <div className="flex items-center gap-2">
            <Link
              href="/dashboard/invoices"
              className="inline-flex items-center gap-2 rounded-[7px] border border-[#333] bg-[#0b0b0b] px-3 py-2 text-[12px] font-semibold text-white"
            >
              Open invoices
              <ArrowUpRight className="h-4 w-4" />
            </Link>
          </div>
        )}
      </div>

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
            {invoices.map((invoice) => (
              <tr
                key={invoice.id}
                onClick={() => onInvoiceSelect(invoice)}
                onKeyDown={(event) => {
                  if (event.key === "Enter" || event.key === " ") {
                    event.preventDefault();
                    onInvoiceSelect(invoice);
                  }
                }}
                role="button"
                tabIndex={0}
                className="h-[72px] cursor-pointer border-b border-[#2c2c2c] transition-colors hover:bg-white/[0.04] focus:bg-white/[0.05] focus:outline-none"
              >
                <td className="px-4">
                  <span className="font-mono text-[13px] font-semibold text-white">{invoice.id}</span>
                </td>
                <td className="px-0">
                  <AutoSplitToggle
                    active={autosplitInvoiceIds.includes(invoice.id)}
                    onToggle={() => onToggleAutosplit(invoice.id)}
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
                      <p className="truncate text-[13px] font-semibold text-white">{getInvoiceClientName(invoice)}</p>
                      <p className="truncate text-[11px] text-[#7f7f7f]">
                        {invoice.recipient} - {invoice.jobType}
                      </p>
                    </div>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {invoices.length === 0 && (
          <div className="px-4 py-10 text-center text-[13px] font-semibold text-[#8f8f8f]">
            No invoices found for this contact.
          </div>
        )}
      </div>
    </Panel>
  );
}
