"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import {
  ArrowLeft,
  CheckCircle2,
  Copy,
  Download,
  FileText,
  Lock,
  ShieldCheck,
  Smartphone,
  Wallet,
} from "lucide-react";
import { downloadTableReportPdf } from "../../../lib/pdfExport";
import { cn } from "../../../lib/utils";
import {
  findMainboardInvoice,
  formatMainboardMoney,
  type MainboardInvoice,
} from "../../../lib/mainboard";
import { AgncyPayLogo } from "../../../components/payment/AgncyPayLogo";

type GuestStage = "review" | "processing" | "success";
type GuestRail = "visa" | "mastercard" | "agncypay";

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

function PaymentRailCard({
  title,
  rail,
  selected,
  onSelect,
}: {
  title: string;
  rail: GuestRail;
  selected: boolean;
  onSelect: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onSelect}
      className={cn(
        "relative overflow-hidden rounded-[12px] border p-4 text-left transition-colors",
        selected ? "border-white bg-white text-black" : "border-[#2a2a2a] bg-[#090909] text-white hover:border-[#666]"
      )}
    >
      <div className="absolute inset-0 opacity-[0.12]">
        <div className="h-full w-full bg-[linear-gradient(135deg,rgba(255,255,255,0.22)_0%,rgba(255,255,255,0.08)_42%,rgba(255,255,255,0.02)_100%)]" />
      </div>
      <div className="relative flex h-[176px] flex-col justify-between">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className={cn("text-[11px] font-semibold uppercase tracking-[0.12em]", selected ? "text-black/55" : "text-[#858585]")}>
              {title}
            </p>
            <p className={cn("mt-2 text-[20px] font-semibold", selected ? "text-black" : "text-white")}>{rail === "agncypay" ? "AgncyPay" : title}</p>
          </div>
          {rail === "visa" && <span className={cn("text-[22px] font-black tracking-[0.12em]", selected ? "text-black" : "text-white")}>VISA</span>}
          {rail === "mastercard" && (
            <div className="flex items-center">
              <span className={cn("h-8 w-8 rounded-full", selected ? "bg-black" : "bg-white/90")} />
              <span className={cn("-ml-3 h-8 w-8 rounded-full", selected ? "bg-[#9c9c9c]" : "bg-white/45")} />
            </div>
          )}
          {rail === "agncypay" && (
            <div className={cn("rounded-[8px] border px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.12em]", selected ? "border-black/10 text-black" : "border-white/10 text-[#d7d7d7]")}>
              AgncyPay Card
            </div>
          )}
        </div>

        <div className="space-y-2">
          <div className={cn("h-1.5 w-16 rounded-full", selected ? "bg-black/25" : "bg-white/20")} />
          <div className="h-1.5 w-24 rounded-full bg-white/16" />
          <div className="h-1.5 w-20 rounded-full bg-white/12" />
        </div>

        <div className="flex items-end justify-between gap-4">
          <div>
            <p className={cn("text-[11px] uppercase tracking-[0.1em]", selected ? "text-black/55" : "text-[#858585]")}>Network</p>
            <p className={cn("mt-1 text-[13px] font-semibold", selected ? "text-black" : "text-white")}>
              {rail === "visa" ? "Visa Debit/Credit" : rail === "mastercard" ? "Mastercard" : "AgncyPay Wallet Card"}
            </p>
          </div>
          {rail === "agncypay" && <AgncyPayLogo imageClassName={cn("h-7", selected ? "opacity-100" : "opacity-95")} />}
        </div>
      </div>
    </button>
  );
}

export default function GuestCheckoutPage() {
  const params = useParams<{ invoiceId: string }>();
  const rawInvoiceId = Array.isArray(params.invoiceId) ? params.invoiceId[0] : params.invoiceId;
  const invoice = findMainboardInvoice(rawInvoiceId || "");

  const [stage, setStage] = useState<GuestStage>("review");
  const [activeStep, setActiveStep] = useState(0);
  const [selectedRail, setSelectedRail] = useState<GuestRail>("agncypay");
  const [copyState, setCopyState] = useState<"idle" | "done">("idle");
  const [transactionId, setTransactionId] = useState("");
  const [cardholderName, setCardholderName] = useState("Leo Tolstoy");
  const [cardNumber, setCardNumber] = useState("4242 4242 4242 4242");
  const [expiry, setExpiry] = useState("11/28");
  const [cvc, setCvc] = useState("123");
  const [postal, setPostal] = useState("10001");
  const [showPdfPreview, setShowPdfPreview] = useState(true);

  useEffect(() => {
    if (stage !== "processing") return;

    const steps = [
      "Validating guest details",
      "Securing selected rail",
      "Submitting payment",
      "Writing receipt to log",
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

  useEffect(() => {
    if (copyState !== "done") return;
    const timeout = window.setTimeout(() => setCopyState("idle"), 1500);
    return () => window.clearTimeout(timeout);
  }, [copyState]);

  const resolvedInvoice = invoice || null;
  const paymentTotal = resolvedInvoice ? resolvedInvoice.amount + resolvedInvoice.fee : 0;

  const receiptLink = resolvedInvoice
    ? `/receipt/${resolvedInvoice.id}?tx=${transactionId}&mode=guest`
    : "/mainboard";

  const downloadPdf = () => {
    if (!resolvedInvoice) return;
    downloadTableReportPdf({
      title: `Guest Checkout ${resolvedInvoice.id}`,
      subtitle: "AgncyPay guest checkout card flow and invoice preview.",
      filename: `agncypay-guest-${resolvedInvoice.id}.pdf`,
      summary: [
        { label: "Recipient", value: resolvedInvoice.recipient },
        { label: "Wallet ID", value: resolvedInvoice.walletId },
        { label: "Due", value: resolvedInvoice.due },
      ],
      columns: ["Item", "Qty", "Rate"],
      rows: resolvedInvoice.items.map((item) => [item.title, item.qty.toString(), formatMainboardMoney(item.rate)]),
    });
  };

  const copyLink = async () => {
    if (!resolvedInvoice) return;
    await navigator.clipboard.writeText(`${window.location.origin}/guest/${resolvedInvoice.id}?mode=guest`);
    setCopyState("done");
  };

  const confirmPayment = () => {
    setTransactionId(`TX-AP-${Math.floor(100000 + Math.random() * 900000)}`);
    setStage("processing");
  };

  if (!resolvedInvoice) {
    return (
      <div className="min-h-screen bg-black text-white">
        <div className="mx-auto flex min-h-screen max-w-[980px] items-center justify-center px-4">
          <div className="w-full rounded-[13px] border border-[#2b2b2b] bg-[#050505] p-6 text-center">
            <p className="text-[12px] font-semibold uppercase tracking-[0.12em] text-[#7a7a7a]">Guest checkout not found</p>
            <h1 className="mt-3 text-[28px] font-semibold text-white">Invoice unavailable</h1>
            <p className="mt-2 text-[14px] text-[#8f8f8f]">
              The guest checkout request does not match the demo data.
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
            <h2 className="mt-5 text-[28px] font-semibold text-white">Payment successful</h2>
            <p className="mt-2 text-[14px] text-[#8f8f8f]">
              Guest payment for {resolvedInvoice.recipient} has been settled.
            </p>

            <div className="mx-auto mt-8 w-full max-w-[520px] rounded-[12px] border border-[#242424] bg-black p-4 text-left">
              <div className="flex flex-col gap-2 border-b border-[#1d1d1d] pb-3 sm:flex-row sm:justify-between">
                <span className="text-[13px] text-[#7a7a7a]">Transaction ID</span>
                <span className="font-mono text-[13px] text-white">{transactionId}</span>
              </div>
              <div className="flex justify-between gap-4 border-b border-[#1d1d1d] py-3">
                <span className="text-[13px] text-[#7a7a7a]">Invoice</span>
                <span className="text-[13px] text-white">{resolvedInvoice.id}</span>
              </div>
              <div className="flex justify-between gap-4 pt-3">
                <span className="text-[13px] text-[#7a7a7a]">Final amount</span>
                <span className="text-[13px] font-semibold text-white">{formatMainboardMoney(paymentTotal)}</span>
              </div>
            </div>

            <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
              <Link
                href={receiptLink}
                className="inline-flex h-11 items-center justify-center rounded-[7px] border border-white bg-white px-4 text-[13px] font-semibold text-black hover:bg-[#e8e8e8]"
              >
                View Receipt
              </Link>
              <button
                type="button"
                onClick={downloadPdf}
                className="inline-flex h-11 items-center justify-center gap-2 rounded-[7px] border border-[#333] bg-[#111] px-4 text-[13px] font-semibold text-white hover:border-[#666]"
              >
                <Download className="h-4 w-4" />
                Download Receipt
              </button>
              <Link
                href={`/request/${resolvedInvoice.id}?mode=guest`}
                className="inline-flex h-11 items-center justify-center rounded-[7px] border border-[#333] bg-[#111] px-4 text-[13px] font-semibold text-white hover:border-[#666]"
              >
                Open Request Again
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
          <Link href={`/request/${resolvedInvoice.id}?mode=guest`} className="inline-flex items-center gap-2 rounded-[7px] border border-[#222] bg-[#050505] px-3 py-2 text-[13px] font-semibold text-white hover:border-[#555]">
            <ArrowLeft className="h-4 w-4" />
            Request
          </Link>
          <AgncyPayLogo imageClassName="h-8" />
          <span className="inline-flex h-11 items-center rounded-[7px] border border-white bg-white px-4 text-[13px] font-semibold text-black">
            {formatMainboardMoney(paymentTotal)}
          </span>
        </div>
      </header>

      <main className="mx-auto max-w-[1480px] px-4 py-5 sm:px-6 lg:px-8">
        <section className="grid grid-cols-1 gap-5 xl:grid-cols-[minmax(0,1.25fr)_minmax(380px,0.75fr)]">
          <div className="space-y-5">
            <section className="rounded-[13px] border border-[#2b2b2b] bg-[#050505] p-5">
              <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                <div>
                  <p className="text-[12px] font-semibold uppercase tracking-[0.08em] text-[#7a7a7a]">
                    Guest checkout
                  </p>
                  <h1 className="mt-2 text-[30px] font-semibold text-white">Pay as Guest</h1>
                  <p className="mt-2 max-w-[760px] text-[14px] text-[#8f8f8f]">
                    No sign-in required. Choose a card rail, confirm the details, and settle the invoice.
                  </p>
                </div>
                <StatusBadge status={resolvedInvoice.status} />
              </div>

              <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-3">
                <div className="rounded-[10px] border border-[#222] bg-black p-3">
                  <p className="text-[12px] text-[#7a7a7a]">Recipient</p>
                  <p className="mt-2 text-[14px] font-semibold text-white">{resolvedInvoice.recipient}</p>
                </div>
                <div className="rounded-[10px] border border-[#222] bg-black p-3">
                  <p className="text-[12px] text-[#7a7a7a]">Invoice ID</p>
                  <p className="mt-2 font-mono text-[14px] font-semibold text-white">{resolvedInvoice.id}</p>
                </div>
                <div className="rounded-[10px] border border-[#222] bg-black p-3">
                  <p className="text-[12px] text-[#7a7a7a]">Due</p>
                  <p className="mt-2 text-[14px] font-semibold text-white">{resolvedInvoice.due}</p>
                </div>
              </div>
            </section>

            <section className="rounded-[13px] border border-[#2b2b2b] bg-[#050505] p-5">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="text-[12px] font-semibold uppercase tracking-[0.08em] text-[#7a7a7a]">
                    Select payment card
                  </p>
                  <h2 className="mt-2 text-[22px] font-semibold text-white">Card rail</h2>
                </div>
                <div className="flex items-center gap-2 text-[12px] text-[#8f8f8f]">
                  <ShieldCheck className="h-4 w-4" />
                  Secure guest checkout
                </div>
              </div>

              <div className="mt-5 grid grid-cols-1 gap-4 md:grid-cols-3">
                <PaymentRailCard title="Visa" rail="visa" selected={selectedRail === "visa"} onSelect={() => setSelectedRail("visa")} />
                <PaymentRailCard title="Mastercard" rail="mastercard" selected={selectedRail === "mastercard"} onSelect={() => setSelectedRail("mastercard")} />
                <PaymentRailCard title="AgncyPay" rail="agncypay" selected={selectedRail === "agncypay"} onSelect={() => setSelectedRail("agncypay")} />
              </div>
            </section>

            <section className="rounded-[13px] border border-[#2b2b2b] bg-[#050505] p-5">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="text-[12px] font-semibold uppercase tracking-[0.08em] text-[#7a7a7a]">
                    Payment details
                  </p>
                  <h2 className="mt-2 text-[22px] font-semibold text-white">Enter card details</h2>
                </div>
                <Lock className="h-5 w-5 text-white" />
              </div>

              <div className="mt-5 grid grid-cols-1 gap-4 lg:grid-cols-2">
                <label className="block lg:col-span-2">
                  <span className="text-[13px] text-[#8f8f8f]">Cardholder name</span>
                  <input
                    value={cardholderName}
                    onChange={(event) => setCardholderName(event.target.value)}
                    className="mt-2 h-11 w-full rounded-[7px] border border-[#333] bg-[#090909] px-3 text-[14px] text-white outline-none focus:border-[#666]"
                  />
                </label>
                <label className="block lg:col-span-2">
                  <span className="text-[13px] text-[#8f8f8f]">Card number</span>
                  <input
                    value={cardNumber}
                    onChange={(event) => setCardNumber(event.target.value)}
                    className="mt-2 h-11 w-full rounded-[7px] border border-[#333] bg-[#090909] px-3 text-[14px] text-white outline-none focus:border-[#666]"
                  />
                </label>
                <label className="block">
                  <span className="text-[13px] text-[#8f8f8f]">Expiry</span>
                  <input
                    value={expiry}
                    onChange={(event) => setExpiry(event.target.value)}
                    className="mt-2 h-11 w-full rounded-[7px] border border-[#333] bg-[#090909] px-3 text-[14px] text-white outline-none focus:border-[#666]"
                  />
                </label>
                <label className="block">
                  <span className="text-[13px] text-[#8f8f8f]">CVC</span>
                  <input
                    value={cvc}
                    onChange={(event) => setCvc(event.target.value)}
                    className="mt-2 h-11 w-full rounded-[7px] border border-[#333] bg-[#090909] px-3 text-[14px] text-white outline-none focus:border-[#666]"
                  />
                </label>
                <label className="block lg:col-span-2">
                  <span className="text-[13px] text-[#8f8f8f]">Postal code</span>
                  <input
                    value={postal}
                    onChange={(event) => setPostal(event.target.value)}
                    className="mt-2 h-11 w-full rounded-[7px] border border-[#333] bg-[#090909] px-3 text-[14px] text-white outline-none focus:border-[#666]"
                  />
                </label>
              </div>

              <div className="mt-5 flex flex-col gap-3 sm:flex-row">
                <button
                  type="button"
                  onClick={confirmPayment}
                  className="inline-flex h-11 flex-1 items-center justify-center gap-2 rounded-[7px] border border-white bg-white px-4 text-[13px] font-semibold text-black hover:bg-[#e8e8e8]"
                >
                  <AgncyPayLogo imageClassName="h-4" />
                  Pay with AgncyPay
                </button>
                <button
                  type="button"
                  onClick={() => setShowPdfPreview(true)}
                  className="inline-flex h-11 items-center justify-center gap-2 rounded-[7px] border border-[#333] bg-[#111] px-4 text-[13px] font-semibold text-white hover:border-[#666]"
                >
                  <FileText className="h-4 w-4" />
                  Review Invoice
                </button>
              </div>
            </section>
          </div>

          <aside className="space-y-5" id="invoice-preview">
            <section className="rounded-[13px] border border-[#2b2b2b] bg-[#050505] p-5">
              <div className="flex items-center gap-3">
                <Wallet className="h-4 w-4 text-white" />
                <h3 className="text-[18px] font-semibold text-white">Invoice summary</h3>
              </div>

              <div className="mt-4 rounded-[12px] border border-[#242424] bg-black p-4">
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <p className="text-[12px] text-[#7a7a7a]">Total due</p>
                    <p className="mt-1 text-[28px] font-semibold text-white">{formatMainboardMoney(paymentTotal)}</p>
                  </div>
                  <StatusBadge status={resolvedInvoice.status} />
                </div>

                <div className="mt-4 space-y-2 text-[13px]">
                  {resolvedInvoice.items.map((item) => (
                    <div key={item.title} className="flex justify-between gap-4 border-b border-[#1d1d1d] pb-2">
                      <span className="text-[#d7d7d7]">{item.title}</span>
                      <span className="text-white">{formatMainboardMoney(item.rate)}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="mt-4 rounded-[12px] border border-[#242424] bg-[#090909] p-4">
                <div className="space-y-3 text-[13px]">
                  <div className="flex justify-between gap-4">
                    <span className="text-[#8f8f8f]">Selected rail</span>
                    <span className="text-white">
                      {selectedRail === "visa" ? "Visa" : selectedRail === "mastercard" ? "Mastercard" : "AgncyPay Card"}
                    </span>
                  </div>
                  <div className="flex justify-between gap-4">
                    <span className="text-[#8f8f8f]">Mode</span>
                    <span className="text-white">Guest checkout</span>
                  </div>
                  <div className="flex justify-between gap-4">
                    <span className="text-[#8f8f8f]">Request source</span>
                    <span className="text-white">{resolvedInvoice.source}</span>
                  </div>
                </div>
              </div>

              <div className="mt-4 flex flex-wrap items-center gap-2">
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
                <button
                  type="button"
                  onClick={() => setShowPdfPreview((current) => !current)}
                  className="inline-flex h-10 items-center gap-2 rounded-[7px] border border-white bg-white px-4 text-[13px] font-semibold text-black hover:bg-[#e8e8e8]"
                >
                  <FileText className="h-4 w-4" />
                  {showPdfPreview ? "Hide PDF" : "View PDF"}
                </button>
              </div>
            </section>

            {showPdfPreview && (
              <section className="rounded-[13px] border border-[#2b2b2b] bg-[#050505] p-5">
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <p className="text-[12px] font-semibold uppercase tracking-[0.08em] text-[#7a7a7a]">
                      Invoice PDF preview
                    </p>
                    <h3 className="mt-2 text-[22px] font-semibold text-white">{resolvedInvoice.recipient}</h3>
                  </div>
                  <AgncyPayLogo imageClassName="h-7 opacity-90" />
                </div>
                <div className="mt-4 space-y-2 rounded-[12px] border border-[#242424] bg-black p-4 text-[13px]">
                  {resolvedInvoice.items.map((item) => (
                    <div key={item.title} className="flex justify-between gap-4 border-b border-[#1d1d1d] pb-2">
                      <span className="text-[#d7d7d7]">{item.title}</span>
                      <span className="text-white">{formatMainboardMoney(item.rate)}</span>
                    </div>
                  ))}
                  <div className="flex justify-between gap-4 pt-2">
                    <span className="text-[#8f8f8f]">Total</span>
                    <span className="font-semibold text-white">{formatMainboardMoney(paymentTotal)}</span>
                  </div>
                </div>
              </section>
            )}
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
                  <h2 className="text-[20px] font-semibold text-white">Processing Guest Payment</h2>
                  <p className="mt-1 text-[13px] text-[#8f8f8f]">
                    {resolvedInvoice.recipient} - {resolvedInvoice.id}
                  </p>
                </div>
              </div>
            </div>
            <div className="p-5 text-center">
              <AgncyPayLogo className="justify-center" imageClassName="h-8 opacity-95" />
              <h3 className="mt-5 text-[24px] font-semibold text-white">{formatMainboardMoney(paymentTotal)}</h3>
              <p className="mt-2 text-[14px] text-[#8f8f8f]">
                Guest payment is moving through the selected card rail.
              </p>
              <div className="mx-auto mt-8 max-w-[520px] rounded-[12px] border border-[#242424] bg-black p-4 text-left">
                {[
                  "Validating guest details",
                  "Securing selected rail",
                  "Submitting payment",
                  "Writing receipt to log",
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
