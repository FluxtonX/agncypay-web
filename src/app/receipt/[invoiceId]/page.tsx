"use client";

import React from "react";
import Link from "next/link";
import { useParams, useSearchParams } from "next/navigation";
import {
  ArrowLeft,
  CheckCircle2,
  Copy,
  Download,
  FileText,
  ShieldCheck,
  Wallet,
} from "lucide-react";
import { downloadTableReportPdf } from "../../../lib/pdfExport";
import { cn } from "../../../lib/utils";
import { AgncyPayLogo } from "../../../components/payment/AgncyPayLogo";
import {
  findMainboardInvoice,
  formatMainboardMoney,
  type MainboardInvoice,
} from "../../../lib/mainboard";

function StatusBadge({ status }: { status: MainboardInvoice["status"] }) {
  return (
    <span
      className={cn(
        "inline-flex h-7 items-center rounded-[6px] border px-3 text-[12px] font-semibold",
        status === "Ready" && "border-white bg-white text-black",
        status === "Pending" && "border-[#444] bg-[#111] text-[#d7d7d7]",
        status === "Processing" && "border-[#444] bg-[#161616] text-white",
        status === "Paid" && "border-[#333] bg-[#0c0c0c] text-[#bdbdbd]"
      )}
    >
      {status}
    </span>
  );
}

export default function ReceiptPage() {
  const params = useParams<{ invoiceId: string }>();
  const searchParams = useSearchParams();
  const rawInvoiceId = Array.isArray(params.invoiceId) ? params.invoiceId[0] : params.invoiceId;
  const invoice = findMainboardInvoice(rawInvoiceId || "");
  const transactionId = searchParams.get("tx") || "TX-AP-000000";
  const mode = searchParams.get("mode") === "logged_in" ? "Logged-in checkout" : "Guest checkout";
  const returnTo = searchParams.get("returnTo") === "dashboard" ? "dashboard" : "mainboard";
  const returnHref = returnTo === "dashboard" ? "/dashboard" : "/mainboard";
  const returnLabel = returnTo === "dashboard" ? "Dashboard" : "Mainboard";

  if (!invoice) {
    return (
      <div className="min-h-screen bg-black text-white">
        <div className="mx-auto flex min-h-screen max-w-[980px] items-center justify-center px-4">
          <div className="w-full rounded-[13px] border border-[#2b2b2b] bg-[#050505] p-6 text-center">
            <p className="text-[12px] font-semibold uppercase tracking-[0.12em] text-[#7a7a7a]">
              Receipt not found
            </p>
            <h1 className="mt-3 text-[28px] font-semibold text-white">Receipt unavailable</h1>
            <p className="mt-2 text-[14px] text-[#8f8f8f]">
              The receipt reference does not match the demo invoice set.
            </p>
            <Link
              href={returnHref}
              className="mt-6 inline-flex h-11 items-center justify-center rounded-[7px] border border-white bg-white px-4 text-[13px] font-semibold text-black hover:bg-[#e8e8e8]"
            >
              Back to {returnLabel}
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const total = invoice.amount + invoice.fee;
  const downloadPdf = () => {
    downloadTableReportPdf({
      title: `Receipt ${invoice.id}`,
      subtitle: "AgncyPay payment receipt and activity log.",
      filename: `agncypay-receipt-${invoice.id}.pdf`,
      summary: [
        { label: "Transaction", value: transactionId },
        { label: "Invoice", value: invoice.id },
        { label: "Total", value: formatMainboardMoney(total) },
      ],
      columns: ["Item", "Qty", "Rate"],
      rows: invoice.items.map((item) => [item.title, item.qty.toString(), formatMainboardMoney(item.rate)]),
      footerNote: "Generated from the AgncyPay receipt screen for archive and reconciliation.",
    });
  };

  const copyReceiptLink = async () => {
    await navigator.clipboard.writeText(
      `${window.location.origin}/receipt/${invoice.id}?tx=${transactionId}&mode=${searchParams.get("mode") || "guest"}&returnTo=${returnTo}`
    );
  };

  return (
    <div className="min-h-screen bg-black text-white">
      <header className="sticky top-0 z-20 border-b border-[#111] bg-black/95 backdrop-blur">
        <div className="mx-auto flex h-[76px] max-w-[1480px] items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
          <Link
            href={returnHref}
            className="inline-flex items-center gap-2 rounded-[7px] border border-[#222] bg-[#050505] px-3 py-2 text-[13px] font-semibold text-white hover:border-[#555]"
          >
            <ArrowLeft className="h-4 w-4" />
            {returnLabel}
          </Link>
          <AgncyPayLogo imageClassName="w-[92px] sm:w-[104px]" />
          <span className="inline-flex h-11 items-center rounded-[7px] border border-white bg-white px-4 text-[13px] font-semibold text-black">
            {formatMainboardMoney(total)}
          </span>
        </div>
      </header>

      <main className="mx-auto max-w-[1480px] px-4 py-5 sm:px-6 lg:px-8">
        <section className="grid grid-cols-1 gap-5 xl:grid-cols-[minmax(0,1.26fr)_minmax(380px,0.74fr)]">
          <div className="space-y-5">
            <section className="rounded-[13px] border border-[#2b2b2b] bg-[#050505] p-5">
              <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                <div className="flex items-start gap-4">
                  <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-[10px] border border-white bg-white text-black">
                    <CheckCircle2 className="h-7 w-7" />
                  </div>
                  <div>
                    <p className="text-[12px] font-semibold uppercase tracking-[0.08em] text-[#7a7a7a]">
                      Receipt reference
                    </p>
                    <h2 className="mt-2 text-[28px] font-semibold text-white">{invoice.recipient}</h2>
                    <p className="mt-2 max-w-[760px] text-[14px] text-[#8f8f8f]">
                      The payment has settled and the receipt is ready for download, copy, or audit.
                    </p>
                  </div>
                </div>
                <StatusBadge status={invoice.status} />
              </div>

              <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-3">
                <div className="rounded-[10px] border border-[#222] bg-black p-3">
                  <p className="text-[12px] text-[#7a7a7a]">Transaction</p>
                  <p className="mt-2 font-mono text-[14px] font-semibold text-white">{transactionId}</p>
                </div>
                <div className="rounded-[10px] border border-[#222] bg-black p-3">
                  <p className="text-[12px] text-[#7a7a7a]">Checkout</p>
                  <p className="mt-2 text-[14px] font-semibold text-white">{mode}</p>
                </div>
                <div className="rounded-[10px] border border-[#222] bg-black p-3">
                  <p className="text-[12px] text-[#7a7a7a]">Invoice</p>
                  <p className="mt-2 text-[14px] font-semibold text-white">{invoice.id}</p>
                </div>
              </div>

              <div className="mt-5 flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  onClick={downloadPdf}
                  className="inline-flex h-10 items-center gap-2 rounded-[7px] border border-[#333] bg-[#111] px-4 text-[13px] font-semibold text-white hover:border-[#666]"
                >
                  <Download className="h-4 w-4" />
                  Download Receipt PDF
                </button>
                <button
                  type="button"
                  onClick={copyReceiptLink}
                  className="inline-flex h-10 items-center gap-2 rounded-[7px] border border-[#333] bg-[#111] px-4 text-[13px] font-semibold text-white hover:border-[#666]"
                >
                  <Copy className="h-4 w-4" />
                  Copy Receipt Link
                </button>
                <Link
                  href={`/request/${invoice.id}?mode=${searchParams.get("mode") || "guest"}&returnTo=${returnTo}`}
                  className="inline-flex h-10 items-center gap-2 rounded-[7px] border border-white bg-white px-4 text-[13px] font-semibold text-black hover:bg-[#e8e8e8]"
                >
                  Back to Request
                </Link>
              </div>
            </section>

            <section className="rounded-[13px] border border-[#2b2b2b] bg-[#050505] p-5">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="text-[12px] font-semibold uppercase tracking-[0.08em] text-[#7a7a7a]">
                    Settlement summary
                  </p>
                  <h3 className="mt-2 text-[22px] font-semibold text-white">Completed payment</h3>
                </div>
                <Wallet className="h-5 w-5 text-white" />
              </div>

              <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-3">
                <div className="rounded-[10px] border border-[#222] bg-black p-3">
                  <p className="text-[12px] text-[#7a7a7a]">Subtotal</p>
                  <p className="mt-2 text-[18px] font-semibold text-white">{formatMainboardMoney(invoice.amount)}</p>
                </div>
                <div className="rounded-[10px] border border-[#222] bg-black p-3">
                  <p className="text-[12px] text-[#7a7a7a]">Fee</p>
                  <p className="mt-2 text-[18px] font-semibold text-white">{formatMainboardMoney(invoice.fee)}</p>
                </div>
                <div className="rounded-[10px] border border-[#222] bg-black p-3">
                  <p className="text-[12px] text-[#7a7a7a]">Total</p>
                  <p className="mt-2 text-[18px] font-semibold text-white">{formatMainboardMoney(total)}</p>
                </div>
              </div>

              <div className="mt-5 rounded-[12px] border border-[#242424] bg-black p-4">
                <div className="flex items-center justify-between gap-4">
                  <p className="text-[14px] font-semibold text-white">Invoice items</p>
                  <span className="text-[12px] text-[#8f8f8f]">{invoice.due}</span>
                </div>
                <div className="mt-4 space-y-2 text-[13px]">
                  {invoice.items.map((item) => (
                    <div
                      key={item.title}
                      className="flex justify-between gap-4 border-b border-[#1d1d1d] pb-2"
                    >
                      <div>
                        <p className="text-[#d7d7d7]">{item.title}</p>
                        <p className="mt-1 text-[#8f8f8f]">Qty {item.qty}</p>
                      </div>
                      <span className="text-white">{formatMainboardMoney(item.rate)}</span>
                    </div>
                  ))}
                </div>
              </div>
            </section>
          </div>

          <aside className="space-y-5">
            <section className="rounded-[13px] border border-[#2b2b2b] bg-[#050505] p-5">
              <div className="flex items-center gap-3">
                <ShieldCheck className="h-4 w-4 text-white" />
                <h3 className="text-[18px] font-semibold text-white">Receipt activity</h3>
              </div>
              <div className="mt-4 space-y-3 rounded-[12px] border border-[#242424] bg-black p-4">
                {[
                  "Payment confirmed",
                  "Settlement written to log",
                  "Receipt generated",
                  "Archive ready for download",
                ].map((step, index) => (
                  <div key={step} className="flex items-center gap-3 py-1 text-[14px] text-white">
                    <span className="flex h-5 w-5 items-center justify-center rounded-full border border-[#444] text-[11px] text-[#d7d7d7]">
                      {index + 1}
                    </span>
                    <span>{step}</span>
                  </div>
                ))}
              </div>
            </section>

            <section className="rounded-[13px] border border-[#2b2b2b] bg-[#050505] p-5">
              <div className="flex items-center gap-3">
                <FileText className="h-4 w-4 text-white" />
                <h3 className="text-[18px] font-semibold text-white">Quick log</h3>
              </div>
              <div className="mt-4 space-y-3 rounded-[12px] border border-[#242424] bg-black p-4">
                <div className="flex justify-between gap-4 text-[13px]">
                  <span className="text-[#8f8f8f]">Recipient</span>
                  <span className="text-white">{invoice.recipient}</span>
                </div>
                <div className="flex justify-between gap-4 text-[13px]">
                  <span className="text-[#8f8f8f]">Wallet</span>
                  <span className="text-white">{invoice.walletId}</span>
                </div>
                <div className="flex justify-between gap-4 text-[13px]">
                  <span className="text-[#8f8f8f]">Source</span>
                  <span className="text-white">AgncyPay receipt</span>
                </div>
                <div className="flex justify-between gap-4 text-[13px]">
                  <span className="text-[#8f8f8f]">Status</span>
                  <span className="text-white">Paid</span>
                </div>
              </div>
            </section>

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-1">
              <Link
                href={`/pay/${invoice.id}?mode=${searchParams.get("mode") || "guest"}&returnTo=${returnTo}`}
                className="inline-flex h-11 items-center justify-center rounded-[7px] border border-white bg-white px-4 text-[13px] font-semibold text-black hover:bg-[#e8e8e8]"
              >
                Open Payment Page
              </Link>
              <Link
                href={returnHref}
                className="inline-flex h-11 items-center justify-center rounded-[7px] border border-[#333] bg-[#111] px-4 text-[13px] font-semibold text-white hover:border-[#666]"
              >
                Back to {returnLabel}
              </Link>
            </div>
          </aside>
        </section>
      </main>
    </div>
  );
}
