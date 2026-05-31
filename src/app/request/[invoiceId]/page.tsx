"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useParams, useSearchParams } from "next/navigation";
import {
  ArrowLeft,
  CheckCircle2,
  Copy,
  Download,
  FileText,
  Mail,
  ShieldCheck,
} from "lucide-react";
import { downloadTableReportPdf } from "../../../lib/pdfExport";
import { cn } from "../../../lib/utils";
import {
  findMainboardInvoice,
  formatMainboardMoney,
  type MainboardInvoice,
} from "../../../lib/mainboard";
import { AgncyPayLogo } from "../../../components/payment/AgncyPayLogo";

type CheckoutMode = "guest" | "logged_in";

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

export default function RequestPage() {
  const params = useParams<{ invoiceId: string }>();
  const searchParams = useSearchParams();
  const rawInvoiceId = Array.isArray(params.invoiceId) ? params.invoiceId[0] : params.invoiceId;
  const invoiceId = rawInvoiceId?.trim() || "";
  const invoice = findMainboardInvoice(invoiceId);
  const initialMode = searchParams.get("mode") === "logged_in" ? "logged_in" : "guest";

  const [mode, setMode] = useState<CheckoutMode>(initialMode);
  const [copyState, setCopyState] = useState<"idle" | "done">("idle");
  const [requestSubmitted, setRequestSubmitted] = useState(false);

  useEffect(() => {
    setMode(initialMode);
  }, [initialMode]);

  useEffect(() => {
    if (copyState !== "done") return;
    const timeout = window.setTimeout(() => setCopyState("idle"), 1500);
    return () => window.clearTimeout(timeout);
  }, [copyState]);

  if (!invoice) {
    return (
      <div className="min-h-screen bg-black text-white">
        <div className="mx-auto flex min-h-screen max-w-[980px] items-center justify-center px-4">
          <div className="w-full rounded-[13px] border border-[#2b2b2b] bg-[#050505] p-6 text-center">
            <p className="text-[12px] font-semibold uppercase tracking-[0.12em] text-[#7a7a7a]">
              Request not found
            </p>
            <h1 className="mt-3 text-[28px] font-semibold text-white">Invoice unavailable</h1>
            <p className="mt-2 text-[14px] text-[#8f8f8f]">
              The request link does not match any available demo invoice.
            </p>
            <Link
              href="/mainboard"
              className="mt-6 inline-flex h-11 items-center justify-center rounded-[7px] border border-white bg-white px-4 text-[13px] font-semibold text-black hover:bg-[#e8e8e8]"
            >
              Back to Mainboard
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const total = invoice.amount + invoice.fee;
  const guestPayLink = `/guest/${invoice.id}?mode=guest`;
  const previewPayLink = `/pay/${invoice.id}?mode=guest`;
  const loggedInPayLink = `/auth/login?next=${encodeURIComponent(`/pay/${invoice.id}?mode=logged_in`)}`;

  const copyLink = async () => {
    await navigator.clipboard.writeText(`${window.location.origin}/request/${invoice.id}?mode=${mode}`);
    setCopyState("done");
  };

  const submitRequest = () => {
    setRequestSubmitted(true);
  };

  const downloadPdf = () => {
    downloadTableReportPdf({
      title: `Invoice Request ${invoice.id}`,
      subtitle: "AgncyPay email-style request preview and handoff layer.",
      filename: `agncypay-request-${invoice.id}.pdf`,
      summary: [
        { label: "Recipient", value: invoice.recipient },
        { label: "Wallet ID", value: invoice.walletId },
        { label: "Due", value: invoice.due },
      ],
      columns: ["Item", "Qty", "Rate"],
      rows: invoice.items.map((item) => [item.title, item.qty.toString(), formatMainboardMoney(item.rate)]),
    });
  };

  return (
    <div className="min-h-screen bg-black text-white">
      <header className="sticky top-0 z-20 border-b border-[#111] bg-black/95 backdrop-blur">
        <div className="mx-auto flex h-[76px] max-w-[1480px] items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
          <Link
            href="/mainboard"
            className="inline-flex items-center gap-2 rounded-[7px] border border-[#222] bg-[#050505] px-3 py-2 text-[13px] font-semibold text-white hover:border-[#555]"
          >
            <ArrowLeft className="h-4 w-4" />
            Mainboard
          </Link>
          <AgncyPayLogo imageClassName="h-6 sm:h-7" />
          <span className="inline-flex h-11 items-center rounded-[7px] border border-white bg-white px-4 text-[13px] font-semibold text-black">
            {formatMainboardMoney(total)}
          </span>
        </div>
      </header>

      <main className="mx-auto max-w-[1480px] px-4 py-5 sm:px-6 lg:px-8">
        <section className="grid grid-cols-1 gap-5 xl:grid-cols-[minmax(0,1.22fr)_minmax(380px,0.78fr)]">
          <div className="space-y-5">
            <section className="rounded-[13px] border border-[#2b2b2b] bg-[#050505] p-5">
              <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
              <div className="flex items-start gap-4">
                <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-[10px] border border-[#333] bg-[#111]">
                  <Mail className="h-6 w-6 text-white" />
                </div>
                  <div>
                    <p className="text-[12px] font-semibold uppercase tracking-[0.08em] text-[#7a7a7a]">
                      From: AgncyPay Request
                    </p>
                    <h2 className="mt-2 text-[28px] font-semibold text-white">
                      Subject: Your invoice is ready
                    </h2>
                    <p className="mt-2 max-w-[760px] text-[14px] text-[#8f8f8f]">
                      This is the email-style handoff that sits between Mainboard and payment
                      checkout. Use it to mirror the client's request flow before opening the pay
                      page.
                    </p>
                  </div>
                </div>
                <StatusBadge status={invoice.status} />
              </div>

              <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-3">
                <div className="rounded-[10px] border border-[#222] bg-black p-3">
                  <p className="text-[12px] text-[#7a7a7a]">To</p>
                  <p className="mt-2 text-[14px] font-semibold text-white">{invoice.email}</p>
                </div>
                <div className="rounded-[10px] border border-[#222] bg-black p-3">
                  <p className="text-[12px] text-[#7a7a7a]">Invoice ID</p>
                  <p className="mt-2 font-mono text-[14px] font-semibold text-white">{invoice.id}</p>
                </div>
                <div className="rounded-[10px] border border-[#222] bg-black p-3">
                  <p className="text-[12px] text-[#7a7a7a]">Due</p>
                  <p className="mt-2 text-[14px] font-semibold text-white">{invoice.due}</p>
                </div>
              </div>
            </section>

            <section className="rounded-[13px] border border-[#2b2b2b] bg-[#050505] p-5">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="text-[12px] font-semibold uppercase tracking-[0.08em] text-[#7a7a7a]">
                    Email preview
                  </p>
                  <h3 className="mt-2 text-[22px] font-semibold text-white">
                    {invoice.recipient}
                  </h3>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={copyLink}
                    className="inline-flex h-10 items-center gap-2 rounded-[7px] border border-[#333] bg-[#111] px-4 text-[13px] font-semibold text-white hover:border-[#666]"
                  >
                    <Copy className="h-4 w-4" />
                    {copyState === "done" ? "Copied" : "Copy Link"}
                  </button>
                  <button
                    type="button"
                    onClick={downloadPdf}
                    className="inline-flex h-10 items-center gap-2 rounded-[7px] border border-[#333] bg-[#111] px-4 text-[13px] font-semibold text-white hover:border-[#666]"
                  >
                    <Download className="h-4 w-4" />
                    Download PDF
                  </button>
                  <Link
                    href={previewPayLink}
                    className="inline-flex h-10 items-center gap-2 rounded-[7px] border border-white bg-white px-4 text-[13px] font-semibold text-black hover:bg-[#e8e8e8]"
                  >
                    <AgncyPayLogo imageClassName="h-3.5" />
                    Pay
                  </Link>
                  <button
                    type="button"
                    onClick={submitRequest}
                    className="inline-flex h-10 items-center gap-2 rounded-[7px] border border-white bg-white px-4 text-[13px] font-semibold text-black hover:bg-[#e8e8e8]"
                  >
                    <AgncyPayLogo imageClassName="h-3.5" />
                    Request
                  </button>
                </div>
              </div>

              <div className="mt-5 rounded-[12px] border border-[#242424] bg-black p-4">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-[12px] uppercase tracking-[0.08em] text-[#7a7a7a]">AgncyPay</p>
                    <p className="mt-2 text-[18px] font-semibold text-white">{invoice.recipient}</p>
                    <p className="mt-2 max-w-[680px] text-[14px] leading-6 text-[#8f8f8f]">
                      Your invoice is ready. Open the invoice, review the amount, and continue to
                      payment using AgncyPay.
                    </p>
                  </div>
                  <CheckCircle2 className="h-5 w-5 text-white" />
                </div>

                <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-3">
                  <div className="rounded-[10px] border border-[#222] bg-[#090909] p-3">
                    <p className="text-[12px] text-[#7a7a7a]">Amount</p>
                    <p className="mt-2 text-[16px] font-semibold text-white">
                      {formatMainboardMoney(invoice.amount)}
                    </p>
                  </div>
                  <div className="rounded-[10px] border border-[#222] bg-[#090909] p-3">
                    <p className="text-[12px] text-[#7a7a7a]">Fee</p>
                    <p className="mt-2 text-[16px] font-semibold text-white">
                      {formatMainboardMoney(invoice.fee)}
                    </p>
                  </div>
                  <div className="rounded-[10px] border border-[#222] bg-[#090909] p-3">
                    <p className="text-[12px] text-[#7a7a7a]">Total</p>
                    <p className="mt-2 text-[16px] font-semibold text-white">
                      {formatMainboardMoney(total)}
                    </p>
                  </div>
                </div>

                <div className="mt-5 rounded-[10px] border border-[#222] bg-[#090909] p-4">
                  <div className="flex items-center justify-between gap-4">
                    <p className="text-[13px] font-semibold text-white">Invoice details</p>
                    <span className="text-[12px] text-[#8f8f8f]">{invoice.walletId}</span>
                  </div>
                  <div className="mt-4 space-y-2 text-[13px]">
                    {invoice.items.map((item) => (
                      <div
                        key={item.title}
                        className="flex justify-between gap-4 border-b border-[#1d1d1d] pb-2"
                      >
                        <span className="text-[#d7d7d7]">{item.title}</span>
                        <span className="text-white">{formatMainboardMoney(item.rate)}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="mt-5 flex flex-col gap-3 sm:flex-row">
                <Link
                  href={guestPayLink}
                  className="inline-flex h-11 flex-1 items-center justify-center gap-2 rounded-[7px] border border-white bg-white px-4 text-[13px] font-semibold text-black hover:bg-[#e8e8e8]"
                >
                  Pay as Guest
                </Link>
                <Link
                  href={loggedInPayLink}
                  className="inline-flex h-11 flex-1 items-center justify-center gap-2 rounded-[7px] border border-[#333] bg-[#111] px-4 text-[13px] font-semibold text-white hover:border-[#666]"
                >
                  <AgncyPayLogo imageClassName="h-3.5" />
                  <span>View and Pay</span>
                </Link>
              </div>
            </section>
          </div>

          <aside className="space-y-5">
            <section className="rounded-[13px] border border-[#2b2b2b] bg-[#050505] p-5">
              <div className="flex items-center gap-3">
                <ShieldCheck className="h-4 w-4 text-white" />
                <h3 className="text-[18px] font-semibold text-white">Request summary</h3>
              </div>

              <div className="mt-4 rounded-[12px] border border-[#242424] bg-black p-4">
                <div className="space-y-3 text-[13px]">
                  <div className="flex justify-between gap-4">
                    <span className="text-[#8f8f8f]">Mode</span>
                    <span className="text-white">{mode === "guest" ? "Guest checkout" : "Logged-in checkout"}</span>
                  </div>
                  <div className="flex justify-between gap-4">
                    <span className="text-[#8f8f8f]">Source</span>
                    <span className="text-white">{invoice.source}</span>
                  </div>
                  <div className="flex justify-between gap-4">
                    <span className="text-[#8f8f8f]">Status</span>
                    <span className="text-white">{invoice.status}</span>
                  </div>
                  <div className="flex justify-between gap-4">
                    <span className="text-[#8f8f8f]">Pay page</span>
                    <span className="font-mono text-white">{mode === "guest" ? guestPayLink : loggedInPayLink}</span>
                  </div>
                </div>
              </div>

              <div className="mt-4 flex flex-col gap-3 sm:flex-row">
                <button
                  type="button"
                  onClick={() => setMode("guest")}
                  className={cn(
                    "h-10 flex-1 rounded-[7px] border text-[13px] font-semibold",
                    mode === "guest" ? "border-white bg-white text-black" : "border-[#333] bg-[#111] text-white"
                  )}
                >
                  Guest
                </button>
                <button
                  type="button"
                  onClick={() => setMode("logged_in")}
                  className={cn(
                    "h-10 flex-1 rounded-[7px] border text-[13px] font-semibold",
                    mode === "logged_in" ? "border-white bg-white text-black" : "border-[#333] bg-[#111] text-white"
                  )}
                >
                  Logged in
                </button>
              </div>
            </section>

            <section className="rounded-[13px] border border-[#2b2b2b] bg-[#050505] p-5">
              <div className="flex items-center gap-3">
                <FileText className="h-4 w-4 text-white" />
                <h3 className="text-[18px] font-semibold text-white">What happens next</h3>
              </div>
              <div className="mt-4 space-y-3 rounded-[12px] border border-[#242424] bg-black p-4">
                {[
                  "Request is delivered to the recipient",
                  "Recipient opens the invoice handoff",
                  "Pay as Guest or View and Pay",
                  "Payment completes and receipt is issued",
                ].map((step, index) => (
                  <div
                    key={step}
                    className="flex items-center gap-3 py-1 text-[14px] text-white"
                  >
                    <span className="flex h-5 w-5 items-center justify-center rounded-full border border-[#444] text-[11px] text-[#d7d7d7]">
                      {index + 1}
                    </span>
                    <span>{step}</span>
                  </div>
                ))}
              </div>
            </section>

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-1">
              <Link
                href={mode === "guest" ? guestPayLink : loggedInPayLink}
                className="inline-flex h-11 items-center justify-center gap-2 rounded-[7px] border border-white bg-white px-4 text-[13px] font-semibold text-black hover:bg-[#e8e8e8]"
              >
                {mode === "guest" ? "Open Payment Page" : "Continue to Login"}
              </Link>
              <Link
                href="/mainboard"
                className="inline-flex h-11 items-center justify-center gap-2 rounded-[7px] border border-[#333] bg-[#111] px-4 text-[13px] font-semibold text-white hover:border-[#666]"
              >
                Back to Mainboard
              </Link>
            </div>
          </aside>
        </section>
      </main>

      {requestSubmitted && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 px-4 py-6 backdrop-blur-sm">
          <section className="w-full max-w-[360px] rounded-[13px] border border-[#3a3a3a] bg-[#050505] p-5 text-center shadow-2xl">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full border border-[#1f7a43] bg-[#0d140f]">
              <CheckCircle2 className="h-7 w-7 text-[#39d26d]" />
            </div>
            <h3 className="mt-4 text-[22px] font-semibold text-white">Request successful</h3>
            <p className="mt-2 text-[13px] leading-5 text-[#8f8f8f]">
              The AgncyPay request has been delivered and is ready for the next step.
            </p>
            <Link
              href="/dashboard"
              className="mt-5 inline-flex h-10 w-full items-center justify-center rounded-[7px] border border-white bg-white px-4 text-[13px] font-semibold text-black hover:bg-[#e8e8e8]"
            >
              Go to Dashboard
            </Link>
          </section>
        </div>
      )}
    </div>
  );
}
