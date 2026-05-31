"use client";

import React, { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useParams, useSearchParams } from "next/navigation";
import {
  ArrowLeft,
  CheckCircle2,
  Copy,
  Download,
  FileText,
  Lock,
  Mail,
  ShieldCheck,
  Smartphone,
  X,
} from "lucide-react";
import { downloadTableReportPdf } from "../../../lib/pdfExport";
import { cn } from "../../../lib/utils";
import { AgncyPayLogo } from "../../../components/payment/AgncyPayLogo";
import {
  findMainboardInvoice,
  formatMainboardMoney,
  mainboardInvoices,
  type MainboardInvoice,
} from "../../../lib/mainboard";

type CheckoutMode = "guest" | "logged_in";
type PaymentStage = "review" | "processing" | "success";

function InvoiceStatus({ status }: { status: MainboardInvoice["status"] }) {
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

export default function PayRequestPage() {
  const params = useParams<{ invoiceId: string }>();
  const searchParams = useSearchParams();
  const rawInvoiceId = Array.isArray(params.invoiceId) ? params.invoiceId[0] : params.invoiceId;
  const resolvedInvoiceId = rawInvoiceId || mainboardInvoices[0].id;
  const initialMode = searchParams.get("mode") === "logged_in" ? "logged_in" : "guest";

  const invoice = findMainboardInvoice(resolvedInvoiceId);

  const [mode, setMode] = useState<CheckoutMode>(initialMode);
  const [stage, setStage] = useState<PaymentStage>("review");
  const [transactionId, setTransactionId] = useState("");
  const [activeStep, setActiveStep] = useState(0);
  const [showPdfPreview, setShowPdfPreview] = useState(true);
  const [fundingMethod, setFundingMethod] = useState<"ach" | "card" | "wallet">("ach");
  const [guestName, setGuestName] = useState("Leo Tolstoy");
  const [guestEmail, setGuestEmail] = useState("leo.tolstoy@nike.com");
  const [guestPhone, setGuestPhone] = useState("+1 (555) 555-5555");

  useEffect(() => {
    setMode(initialMode);
  }, [initialMode]);

  useEffect(() => {
    if (stage !== "processing") return;

    const steps = [
      "Validating request",
      "Securing payment rail",
      "Submitting settlement instruction",
      "Writing receipt to invoice log",
    ];

    setActiveStep(0);
    const interval = window.setInterval(() => {
      setActiveStep((current) => Math.min(current + 1, steps.length - 1));
    }, 850);

    const timeout = window.setTimeout(() => {
      window.clearInterval(interval);
      setStage("success");
    }, 3550);

    return () => {
      window.clearInterval(interval);
      window.clearTimeout(timeout);
    };
  }, [stage]);

  const request = invoice || mainboardInvoices[0];

  const paymentItems = useMemo(() => request.items, [request.items]);
  const paymentTotal = request.amount + request.fee;

  const downloadPdf = () => {
    downloadTableReportPdf({
      title: `Invoice ${request.id}`,
      subtitle: "Public AgncyPay request page and payment receipt preview.",
      filename: `agncypay-request-${request.id}.pdf`,
      summary: [
        { label: "Recipient", value: request.recipient },
        { label: "Wallet ID", value: request.walletId },
        { label: "Due", value: request.due },
      ],
      columns: ["Item", "Qty", "Rate"],
      rows: paymentItems.map((item) => [item.title, item.qty.toString(), formatMainboardMoney(item.rate)]),
    });
  };

  const copyLink = async () => {
    await navigator.clipboard.writeText(`${window.location.origin}/pay/${request.id}?mode=${mode}`);
  };

  const confirmPayment = () => {
    setTransactionId(`TX-AP-${Math.floor(100000 + Math.random() * 900000)}`);
    setStage("processing");
  };

  const paymentMethodCards = [
    ["ach", "Instant transfer", "AgncyPay treasury rail"],
    ["card", "Card", "Corporate card fallback"],
    ["wallet", "Wallet", "Stored balance / wallet"],
  ] as const;

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
              The requested invoice id does not exist in the current mock dataset.
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

  if (stage === "success") {
    return (
      <div className="min-h-screen bg-black text-white">
        <header className="sticky top-0 z-20 border-b border-[#111] bg-black/95 backdrop-blur">
        <div className="mx-auto flex h-[76px] max-w-[1480px] items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
          <Link href="/mainboard" className="inline-flex items-center gap-2 rounded-[7px] border border-[#222] bg-[#050505] px-3 py-2 text-[13px] font-semibold text-white hover:border-[#555]">
            <ArrowLeft className="h-4 w-4" />
            Mainboard
          </Link>
          <AgncyPayLogo imageClassName="h-8" />
          <span className="inline-flex h-11 items-center rounded-[7px] border border-white bg-white px-4 text-[13px] font-semibold text-black">
            {formatMainboardMoney(paymentTotal)}
          </span>
        </div>
        </header>

        <main className="mx-auto flex min-h-[calc(100vh-76px)] max-w-[980px] items-center px-4 py-6 sm:px-6 lg:px-8">
          <section className="w-full rounded-[13px] border border-[#2b2b2b] bg-[#050505] p-6 text-center">
            <div className="mx-auto flex h-[84px] w-[84px] items-center justify-center rounded-full border border-white bg-white text-black">
              <CheckCircle2 className="h-10 w-10" />
            </div>
            <h2 className="mt-5 text-[28px] font-semibold text-white">Payment received</h2>
            <p className="mt-2 text-[14px] text-[#8f8f8f]">
              {request.recipient} has been settled and the receipt is now in the payment log.
            </p>

            <div className="mx-auto mt-8 w-full max-w-[520px] rounded-[12px] border border-[#242424] bg-black p-4 text-left">
              <div className="flex flex-col gap-2 border-b border-[#1d1d1d] pb-3 sm:flex-row sm:justify-between">
                <span className="text-[13px] text-[#7a7a7a]">Transaction ID</span>
                <span className="font-mono text-[13px] text-white">{transactionId}</span>
              </div>
              <div className="flex justify-between gap-4 border-b border-[#1d1d1d] py-3">
                <span className="text-[13px] text-[#7a7a7a]">Invoice</span>
                <span className="text-[13px] text-white">{request.id}</span>
              </div>
              <div className="flex justify-between gap-4 pt-3">
                <span className="text-[13px] text-[#7a7a7a]">Final amount</span>
                <span className="text-[13px] font-semibold text-white">{formatMainboardMoney(paymentTotal)}</span>
              </div>
            </div>

            <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
              <button
                type="button"
                onClick={downloadPdf}
                className="inline-flex h-11 items-center justify-center gap-2 rounded-[7px] border border-[#333] bg-[#111] px-4 text-[13px] font-semibold text-white hover:border-[#666]"
              >
                <Download className="h-4 w-4" />
                Download Receipt
              </button>
              <Link
                href={`/receipt/${request.id}?tx=${transactionId}&mode=${mode}`}
                className="inline-flex h-11 items-center justify-center rounded-[7px] border border-white bg-white px-4 text-[13px] font-semibold text-black hover:bg-[#e8e8e8]"
              >
                View Receipt
              </Link>
              <Link
                href={`/request/${request.id}?mode=${mode}`}
                className="inline-flex h-11 items-center justify-center rounded-[7px] border border-[#333] bg-[#111] px-4 text-[13px] font-semibold text-white hover:border-[#666]"
              >
                Open Request Again
              </Link>
              <Link
                href="/mainboard"
                className="inline-flex h-11 items-center justify-center rounded-[7px] border border-[#333] bg-[#111] px-4 text-[13px] font-semibold text-white hover:border-[#666]"
              >
                Back to Mainboard
              </Link>
            </div>
          </section>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white">
      <header className="sticky top-0 z-20 border-b border-[#111] bg-black/95 backdrop-blur">
        <div className="mx-auto flex h-[76px] max-w-[1480px] items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
          <Link href="/mainboard" className="inline-flex items-center gap-2 rounded-[7px] border border-[#222] bg-[#050505] px-3 py-2 text-[13px] font-semibold text-white hover:border-[#555]">
            <ArrowLeft className="h-4 w-4" />
            Mainboard
          </Link>
          <AgncyPayLogo imageClassName="h-8" />
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setMode("guest")}
              className={cn(
                "h-11 rounded-[7px] border px-4 text-[13px] font-semibold",
                mode === "guest"
                  ? "border-white bg-white text-black"
                  : "border-[#333] bg-[#111] text-white"
              )}
            >
              Pay as Guest
            </button>
            <button
              type="button"
              onClick={() => setMode("logged_in")}
              className={cn(
                "h-11 rounded-[7px] border px-4 text-[13px] font-semibold",
                mode === "logged_in"
                  ? "border-white bg-white text-black"
                  : "border-[#333] bg-[#111] text-white"
              )}
            >
              View and Pay
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-[1480px] px-4 py-5 sm:px-6 lg:px-8">
        <section className="rounded-[13px] border border-[#2b2b2b] bg-[#050505] p-5">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex items-start gap-3">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-[8px] border border-[#333] bg-[#111] text-white">
                <Mail className="h-5 w-5" />
              </div>
              <div>
                <p className="text-[12px] font-semibold uppercase tracking-[0.08em] text-[#7a7a7a]">
                  Your invoice is ready
                </p>
                <h2 className="mt-2 text-[24px] font-semibold text-white">{request.recipient}</h2>
                <p className="mt-2 max-w-[760px] text-[14px] text-[#8f8f8f]">
                  Open the PDF, review the balance, and complete payment using AgncyPay.
                </p>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={copyLink}
                className="inline-flex h-10 items-center gap-2 rounded-[7px] border border-[#333] bg-[#111] px-4 text-[13px] font-semibold text-white hover:border-[#666]"
              >
                <Copy className="h-4 w-4" />
                Copy Link
              </button>
              <button
                type="button"
                onClick={downloadPdf}
                className="inline-flex h-10 items-center gap-2 rounded-[7px] border border-[#333] bg-[#111] px-4 text-[13px] font-semibold text-white hover:border-[#666]"
              >
                <Download className="h-4 w-4" />
                Download PDF
              </button>
              <button
                type="button"
                onClick={() => setShowPdfPreview((current) => !current)}
                className="inline-flex h-10 items-center gap-2 rounded-[7px] border border-white bg-white px-4 text-[13px] font-semibold text-black hover:bg-[#e8e8e8]"
              >
                <FileText className="h-4 w-4" />
                {showPdfPreview ? "Hide PDF" : "View PDF"}
              </button>
            </div>
          </div>
        </section>

        <section className="mt-5 grid grid-cols-1 gap-5 xl:grid-cols-[minmax(0,1.25fr)_minmax(380px,0.75fr)]">
          <div className="space-y-5">
            <section className="rounded-[13px] border border-[#2b2b2b] bg-[#050505] p-5">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-[12px] font-semibold uppercase tracking-[0.08em] text-[#7a7a7a]">Invoice</p>
                  <h3 className="mt-2 text-[28px] font-semibold text-white">{request.id}</h3>
                  <p className="mt-2 text-[14px] text-[#8f8f8f]">{request.note}</p>
                </div>
                <InvoiceStatus status={request.status} />
              </div>

              <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-3">
                <div className="rounded-[10px] border border-[#222] bg-black p-3">
                  <p className="text-[12px] text-[#7a7a7a]">Amount</p>
                  <p className="mt-2 text-[18px] font-semibold text-white">{formatMainboardMoney(request.amount)}</p>
                </div>
                <div className="rounded-[10px] border border-[#222] bg-black p-3">
                  <p className="text-[12px] text-[#7a7a7a]">Fee</p>
                  <p className="mt-2 text-[18px] font-semibold text-white">{formatMainboardMoney(request.fee)}</p>
                </div>
                <div className="rounded-[10px] border border-[#222] bg-black p-3">
                  <p className="text-[12px] text-[#7a7a7a]">Total</p>
                  <p className="mt-2 text-[18px] font-semibold text-white">{formatMainboardMoney(paymentTotal)}</p>
                </div>
              </div>

              <div className="mt-5 rounded-[12px] border border-[#242424] bg-black p-4">
                <div className="flex items-center justify-between gap-4">
                  <p className="text-[14px] font-semibold text-white">Invoice details</p>
                  <span className="text-[12px] text-[#8f8f8f]">{request.due}</span>
                </div>
                <div className="mt-4 space-y-2 text-[13px]">
                  {request.items.map((item) => (
                    <div key={item.title} className="flex justify-between gap-4 border-b border-[#1d1d1d] pb-2">
                      <div>
                        <p className="text-[#d7d7d7]">{item.title}</p>
                        <p className="mt-1 text-[#8f8f8f]">Qty {item.qty}</p>
                      </div>
                      <span className="text-white">{formatMainboardMoney(item.rate)}</span>
                    </div>
                  ))}
                </div>
              </div>

              {showPdfPreview && (
                <div className="mt-5 rounded-[12px] border border-[#242424] bg-[#090909] p-4">
                  <div className="flex items-center justify-between gap-4">
                    <div>
                      <p className="text-[12px] uppercase tracking-[0.08em] text-[#7a7a7a]">Invoice PDF preview</p>
                      <p className="mt-2 text-[16px] font-semibold text-white">{request.recipient}</p>
                    </div>
                    <button
                      type="button"
                      onClick={downloadPdf}
                      className="inline-flex items-center gap-2 rounded-[7px] border border-[#333] bg-[#111] px-3 py-2 text-[12px] font-semibold text-white hover:border-[#666]"
                    >
                      <Download className="h-4 w-4" />
                      Download PDF
                    </button>
                  </div>
                  <div className="mt-4 space-y-2 text-[13px]">
                    {request.items.map((item) => (
                      <div key={item.title} className="flex justify-between gap-4 border-b border-[#1d1d1d] pb-2">
                        <span className="text-[#d7d7d7]">{item.title}</span>
                        <span className="text-white">{formatMainboardMoney(item.rate)}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </section>
          </div>

          <aside className="space-y-5">
            <section className="rounded-[13px] border border-[#2b2b2b] bg-[#050505] p-5">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-[12px] font-semibold uppercase tracking-[0.08em] text-[#7a7a7a]">
                    Checkout
                  </p>
                  <h3 className="mt-2 text-[22px] font-semibold text-white">
                    {mode === "guest" ? "Pay as Guest" : "View and Pay"}
                  </h3>
                </div>
                <ShieldCheck className="h-5 w-5 text-white" />
              </div>

              <div className="mt-4 flex gap-2">
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

              {mode === "guest" ? (
                <div className="mt-4 space-y-3">
                  <label className="block">
                    <span className="text-[13px] text-[#8f8f8f]">Name</span>
                    <input
                      value={guestName}
                      onChange={(event) => setGuestName(event.target.value)}
                      className="mt-2 h-11 w-full rounded-[7px] border border-[#333] bg-[#090909] px-3 text-[14px] text-white outline-none focus:border-[#666]"
                    />
                  </label>
                  <label className="block">
                    <span className="text-[13px] text-[#8f8f8f]">Email</span>
                    <input
                      value={guestEmail}
                      onChange={(event) => setGuestEmail(event.target.value)}
                      className="mt-2 h-11 w-full rounded-[7px] border border-[#333] bg-[#090909] px-3 text-[14px] text-white outline-none focus:border-[#666]"
                    />
                  </label>
                  <label className="block">
                    <span className="text-[13px] text-[#8f8f8f]">Phone</span>
                    <input
                      value={guestPhone}
                      onChange={(event) => setGuestPhone(event.target.value)}
                      className="mt-2 h-11 w-full rounded-[7px] border border-[#333] bg-[#090909] px-3 text-[14px] text-white outline-none focus:border-[#666]"
                    />
                  </label>
                </div>
              ) : (
                <div className="mt-4 rounded-[10px] border border-[#242424] bg-[#090909] p-4">
                  <p className="text-[13px] font-semibold text-white">Signed-in profile</p>
                  <p className="mt-2 text-[13px] text-[#8f8f8f]">
                    Saved billing details will be used for this request.
                  </p>
                  <div className="mt-4 space-y-2 text-[13px] text-white">
                    <div className="flex justify-between gap-4">
                      <span className="text-[#8f8f8f]">Profile</span>
                      <span>Brad @ Main Zetler</span>
                    </div>
                    <div className="flex justify-between gap-4">
                      <span className="text-[#8f8f8f]">Billing email</span>
                      <span>brad@mainzetler.com</span>
                    </div>
                  </div>
                </div>
              )}

              <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-3">
                {paymentMethodCards.map(([key, title, detail]) => {
                  const isSelected = fundingMethod === key;
                  return (
                    <button
                      key={key}
                      type="button"
                      onClick={() => setFundingMethod(key)}
                      className={cn(
                        "rounded-[10px] border p-3 text-left transition-colors",
                        isSelected ? "border-white bg-white text-black" : "border-[#333] bg-[#090909] text-white hover:border-[#666]"
                      )}
                    >
                      <p className="text-[14px] font-semibold">{title}</p>
                      <p className={cn("mt-2 text-[12px]", isSelected ? "text-[#333]" : "text-[#8f8f8f]")}>
                        {detail}
                      </p>
                    </button>
                  );
                })}
              </div>

              <div className="mt-4 flex flex-col gap-3 sm:flex-row">
                <Link
                  href={`/request/${request.id}?mode=${mode}`}
                  className="h-11 flex-1 items-center justify-center rounded-[7px] border border-[#333] bg-[#111] px-4 text-[13px] font-semibold text-white hover:border-[#666] inline-flex"
                >
                  Cancel
                </Link>
                <button
                  type="button"
                  onClick={confirmPayment}
                  className="h-11 flex-1 rounded-[7px] border border-white bg-white px-4 text-[13px] font-semibold text-black hover:bg-[#e8e8e8]"
                >
                  <AgncyPayLogo imageClassName="h-4" />
                  Confirm Payment
                </button>
                <button
                  type="button"
                  onClick={() => setShowPdfPreview(true)}
                  className="h-11 rounded-[7px] border border-[#333] bg-[#111] px-4 text-[13px] font-semibold text-white hover:border-[#666]"
                >
                  View Invoice PDF
                </button>
              </div>
            </section>

            <section className="rounded-[13px] border border-[#2b2b2b] bg-[#050505] p-5">
              <div className="flex items-center gap-3">
                <Smartphone className="h-4 w-4 text-white" />
                <h3 className="text-[18px] font-semibold text-white">Request Log</h3>
              </div>
              <div className="mt-4 rounded-[12px] border border-[#242424] bg-black p-4">
                <div className="space-y-3">
                  {[
                    "Invoice request received",
                    "Checkout opened",
                    "Payment method selected",
                    "Receipt generation pending",
                  ].map((step, index) => {
                    const isDone = index < activeStep;
                    const isActive = index === activeStep && stage === "processing";
                    return (
                      <div
                        key={step}
                        className={cn(
                          "flex items-center gap-3 py-1 text-[14px]",
                          isDone || isActive ? "text-white" : "text-[#595959]"
                        )}
                      >
                        {isDone ? (
                          <CheckCircle2 className="h-4 w-4" />
                        ) : isActive ? (
                          <Lock className="h-4 w-4 animate-pulse" />
                        ) : (
                          <span className="h-4 w-4 rounded-full border border-[#444]" />
                        )}
                        <span>{step}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </section>
          </aside>
        </section>
      </main>

      {stage === "processing" && (
        <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-black/80 px-4 py-6 backdrop-blur-sm">
          <section className="w-full max-w-[680px] rounded-[13px] border border-[#2b2b2b] bg-[#050505] shadow-2xl">
            <div className="flex items-center justify-between gap-4 border-b border-[#222] px-5 py-4">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-[8px] border border-[#333] bg-[#111] text-white">
                  <Lock className="h-5 w-5" />
                </div>
                <div>
                  <h2 className="text-[20px] font-semibold text-white">Processing Payment</h2>
                  <p className="mt-1 text-[13px] text-[#8f8f8f]">
                    {request.recipient} - {request.id}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setStage("review")}
                className="flex h-9 w-9 items-center justify-center rounded-[7px] border border-[#333] text-[#bdbdbd] hover:border-[#666] hover:text-white"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="p-5 text-center">
              <div className="mx-auto flex h-[84px] w-[84px] items-center justify-center rounded-full border border-[#333] bg-[#090909]">
                <Lock className="h-9 w-9 text-white" />
              </div>
              <h3 className="mt-5 text-[24px] font-semibold text-white">{formatMainboardMoney(paymentTotal)}</h3>
              <p className="mt-2 text-[14px] text-[#8f8f8f]">
                The request is moving through AgncyPay settlement.
              </p>
              <div className="mx-auto mt-8 max-w-[520px] rounded-[12px] border border-[#242424] bg-black p-4 text-left">
                {[
                  "Validating request",
                  "Securing payment rail",
                  "Submitting settlement instruction",
                  "Writing receipt to invoice log",
                ].map((step, index) => {
                  const isDone = index < activeStep;
                  const isActive = index === activeStep;
                  return (
                    <div
                      key={step}
                      className={cn(
                        "flex items-center gap-3 py-2 text-[14px]",
                        isDone || isActive ? "text-white" : "text-[#595959]"
                      )}
                    >
                      {isDone ? (
                        <CheckCircle2 className="h-4 w-4" />
                      ) : isActive ? (
                        <Smartphone className="h-4 w-4 animate-pulse" />
                      ) : (
                        <span className="h-4 w-4 rounded-full border border-[#444]" />
                      )}
                      <span>{step}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          </section>
        </div>
      )}
    </div>
  );
}
