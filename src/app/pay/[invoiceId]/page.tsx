"use client";

import React, { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useParams, useSearchParams } from "next/navigation";
import {
  ArrowLeft,
  CheckCircle2,
  Copy,
  FileText,
  Lock,
  ShieldCheck,
} from "lucide-react";
import { downloadTableReportPdf } from "../../../lib/pdfExport";
import { cn } from "../../../lib/utils";
import {
  findMainboardInvoice,
  formatMainboardMoney,
  mainboardInvoices,
  type MainboardInvoice,
} from "../../../lib/mainboard";
import { AgncyPayLogo } from "../../../components/payment/AgncyPayLogo";

type CheckoutStage = "payment" | "processing" | "success";
type CardRail = "agncypay" | "visa" | "mastercard" | "discover" | "amex" | "plaid";

const cardRails: CardRail[] = ["agncypay", "visa", "mastercard", "discover", "amex", "plaid"];

function CardRailLogo({ rail }: { rail: CardRail }) {
  if (rail === "visa") {
    return (
      <Image
        src="/visa-logo.svg"
        alt="Visa"
        width={512}
        height={166}
        className="h-5 w-auto object-contain"
      />
    );
  }

  if (rail === "mastercard") {
    return (
      <Image
        src="/mastercard-logo.svg"
        alt="Mastercard"
        width={152}
        height={118}
        className="h-7 w-auto object-contain"
      />
    );
  }

  if (rail === "discover") {
    return (
      <Image
        src="/discover-logo.svg"
        alt="Discover"
        width={512}
        height={113}
        className="h-6 w-auto object-contain"
      />
    );
  }

  if (rail === "amex") {
    return (
      <Image
        src="/american-express-logo.svg"
        alt="American Express"
        width={512}
        height={512}
        className="h-7 w-auto object-contain"
      />
    );
  }

  if (rail === "plaid") {
    return (
      <span className="flex items-center justify-center">
        <Image
          src="/plaid-logo.svg"
          alt="Plaid"
          width={126}
          height={48}
          className="h-5 w-auto object-contain"
        />
      </span>
    );
  }

  return (
    <span className="flex items-center justify-center">
      <AgncyPayLogo className="h-[18px] w-[48px]" imageClassName="h-full w-full" />
    </span>
  );
}

function cardRailClasses(rail: CardRail, selected: boolean) {
  const base = "relative flex h-11 min-w-[88px] items-center justify-center overflow-hidden rounded-[4px] border px-3 transition focus:outline-none focus-visible:ring-2 focus-visible:ring-white/80";
  const palette: Record<CardRail, string> = {
    agncypay: "bg-black text-white",
    visa: "bg-white",
    mastercard: "bg-white",
    discover: "bg-white",
    amex: "bg-white",
    plaid: "bg-white",
  };

  return cn(
    base,
    palette[rail],
    selected ? "border-white shadow-[0_0_0_2px_rgba(255,255,255,0.22)]" : "border-[#333] opacity-80 hover:opacity-100"
  );
}

function SummaryCard({
  invoice,
  total,
  returnTo,
  onCopy,
  onDownload,
}: {
  invoice: MainboardInvoice;
  total: number;
  returnTo: "dashboard" | "mainboard";
  onCopy: () => void;
  onDownload: () => void;
}) {
  const returnParam = `&returnTo=${returnTo}`;

  return (
    <aside className="space-y-5">
      <section className="rounded-[10px] border border-[#303030] bg-[#161616] p-6">
        <div className="space-y-5 text-[13px]">
          <div className="flex items-center justify-between gap-4">
            <span className="font-semibold text-[#d7d7d7]">Due Date</span>
            <span className="font-semibold text-white">{invoice.due}</span>
          </div>
          <div className="flex items-center justify-between gap-4">
            <span className="font-semibold text-[#d7d7d7]">Invoice Amount</span>
            <span className="text-[26px] font-semibold text-white">{formatMainboardMoney(invoice.amount)}</span>
          </div>
          <div className="flex items-center justify-between gap-4">
            <span className="font-semibold text-[#d7d7d7]">Amount Due</span>
            <span className="text-[26px] font-semibold text-white">{formatMainboardMoney(total)}</span>
          </div>
        </div>

        <div className="mt-8 grid grid-cols-3 items-end gap-4 text-center">
          <Link
            href={`/request/${invoice.id}?mode=guest${returnParam}`}
            className="inline-flex h-9 items-center justify-center rounded-none border border-[#333] bg-black px-3 text-[12px] font-semibold text-white hover:border-[#666]"
          >
            View Invoice PDF
          </Link>
          <button type="button" onClick={onCopy} className="flex flex-col items-center gap-2 text-[12px] font-semibold text-[#d7d7d7] hover:text-white">
            <Copy className="h-6 w-6" />
            Copy Link
          </button>
          <button type="button" onClick={onDownload} className="flex flex-col items-center gap-2 text-[12px] font-semibold text-[#d7d7d7] hover:text-white">
            <FileText className="h-6 w-6" />
            Download PDF
          </button>
        </div>
      </section>

      <p className="text-center text-[12px] font-semibold text-[#8f8f8f]">
        Have an AgncyPay account?{" "}
        <Link href={`/auth/login?next=${encodeURIComponent(`/pay/${invoice.id}?mode=logged_in${returnParam}`)}`} className="text-white hover:underline">
          Sign in
        </Link>
      </p>

      <section className="rounded-[10px] border border-[#303030] bg-[#161616] p-5">
        <h3 className="text-[18px] font-semibold text-white">Business details</h3>
        <div className="mt-4 space-y-3 text-[13px]">
          <p className="font-semibold text-white">Email: {invoice.payerEmail}</p>
          <div className="border-t border-[#2b2b2b] pt-3 text-[#a7a7a7]">
            <p>{invoice.payer}</p>
            <p>{invoice.payerAddress[0]}</p>
          </div>
        </div>
      </section>

      <div className="flex items-center justify-center gap-2 pt-10 text-[12px] font-semibold text-[#777]">
        <ShieldCheck className="h-4 w-4" />
        Protected by bank-level security and encryption
      </div>
    </aside>
  );
}

export default function PayRequestPage() {
  const params = useParams<{ invoiceId: string }>();
  const searchParams = useSearchParams();
  const rawInvoiceId = Array.isArray(params.invoiceId) ? params.invoiceId[0] : params.invoiceId;
  const invoice = findMainboardInvoice(rawInvoiceId || "") || mainboardInvoices[0];
  const isLoggedInMode = searchParams.get("mode") === "logged_in";
  const returnTo = searchParams.get("returnTo") === "dashboard" ? "dashboard" : "mainboard";
  const returnHref = returnTo === "dashboard" ? "/dashboard" : "/mainboard";
  const returnLabel = returnTo === "dashboard" ? "Dashboard" : "Mainboard";
  const total = invoice.amount + invoice.fee;

  const [stage, setStage] = useState<CheckoutStage>("payment");
  const [activeRail, setActiveRail] = useState<CardRail>("agncypay");
  const [cardNumber, setCardNumber] = useState("1234 5678 9000 0000");
  const [expiry, setExpiry] = useState("MM/YY");
  const [cvc, setCvc] = useState("123");
  const [nameOnCard, setNameOnCard] = useState(invoice.payer);
  const [transactionId, setTransactionId] = useState("");

  const paymentLabel = useMemo(
    () => (isLoggedInMode ? "Signed-in AgncyPay payment" : "Pay without AgncyPay account"),
    [isLoggedInMode]
  );

  useEffect(() => {
    if (stage !== "processing") return;
    const timeout = window.setTimeout(() => setStage("success"), 1200);
    return () => window.clearTimeout(timeout);
  }, [stage]);

  const submitPayment = () => {
    setTransactionId(`TX-AP-${Math.floor(100000 + Math.random() * 900000)}`);
    setStage("processing");
  };

  const downloadPdf = () => {
    downloadTableReportPdf({
      title: `Invoice ${invoice.invoiceNumber}`,
      subtitle: `${invoice.recipient} payable through AgncyPay.`,
      filename: `agncypay-${invoice.invoiceNumber}.pdf`,
      summary: [
        { label: "Payer", value: invoice.payer },
        { label: "Payee", value: invoice.recipient },
        { label: "Due", value: invoice.due },
        { label: "Total", value: formatMainboardMoney(total) },
      ],
      columns: ["Rate Type", "Fee Type", "Qty", "Rate", "Amount"],
      rows: invoice.items.map((item) => [
        item.title,
        item.feeType,
        item.qty.toString(),
        formatMainboardMoney(item.rate),
        formatMainboardMoney(item.qty * item.rate),
      ]),
    });
  };

  const copyLink = async () => {
    await navigator.clipboard.writeText(`${window.location.origin}/pay/${invoice.id}?mode=guest&returnTo=${returnTo}`);
  };

  return (
    <div className="min-h-screen bg-black text-white">
      <header className="sticky top-0 z-30 border-b border-[#111] bg-black/95 backdrop-blur">
        <div className="mx-auto flex h-[76px] max-w-[1480px] items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
          <Link href={returnHref} className="inline-flex h-10 items-center gap-2 rounded-[7px] border border-[#252525] bg-[#050505] px-3 text-[13px] font-semibold text-white hover:border-[#555]">
            <ArrowLeft className="h-4 w-4" />
            {returnLabel}
          </Link>
          <span className="text-[14px] font-semibold text-white">AgncyPay checkout</span>
          <span className="hidden rounded-[7px] border border-[#252525] bg-[#050505] px-3 py-2 text-[12px] font-semibold text-[#d7d7d7] sm:inline-flex">
            Secure checkout session
          </span>
        </div>
      </header>

      <main className="mx-auto grid max-w-[1480px] grid-cols-1 gap-7 px-4 py-8 sm:px-6 lg:px-8 xl:grid-cols-[minmax(0,1.35fr)_minmax(390px,0.65fr)]">
        <section className="rounded-[10px] border border-[#151515] bg-black p-5 sm:p-7">
          <p className="text-[13px] font-semibold text-white">Full Invoice Amount</p>
          <div className="mt-6 flex flex-wrap items-end gap-3">
            <h1 className="text-[34px] font-bold tracking-[-0.02em] text-white">{formatMainboardMoney(invoice.amount)}</h1>
            <span className="pb-2 text-[13px] font-semibold text-[#d7d7d7]">Due Date</span>
          </div>

          <div className="mt-16 flex flex-wrap gap-2">
            {cardRails.map((rail) => (
              <button
                key={rail}
                type="button"
                aria-pressed={activeRail === rail}
                onClick={() => setActiveRail(rail)}
                className={cardRailClasses(rail, activeRail === rail)}
              >
                <CardRailLogo rail={rail} />
              </button>
            ))}
          </div>

          <div className="mt-5">
            <h2 className="text-[16px] font-semibold text-white">Your information</h2>
            <div className="mt-5 space-y-4">
              <label className="block">
                <span className="text-[14px] font-semibold text-white">Email</span>
                <input
                  value={invoice.payerEmail}
                  readOnly
                  className="mt-2 h-12 w-full border border-[#1c1c1c] bg-[#1a1a1a] px-4 text-[14px] font-semibold text-[#d7d7d7] outline-none"
                />
              </label>

              <div>
                <span className="text-[14px] font-semibold text-white">Phone Number</span>
                <div className="mt-2 grid grid-cols-[174px_1fr] gap-1">
                  <div className="flex h-12 items-center gap-3 border border-[#1c1c1c] bg-[#1a1a1a] px-4 text-[16px] font-semibold text-white">
                    <span>US</span>
                    <span>+1</span>
                  </div>
                  <input
                    value={invoice.mobile.replace("+1 ", "")}
                    readOnly
                    className="h-12 border border-[#1c1c1c] bg-[#1a1a1a] px-4 text-[14px] font-semibold text-[#d7d7d7] outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 gap-6 md:grid-cols-[1fr_174px_130px]">
                <label className="block">
                  <span className="text-[14px] font-semibold text-white">Card Number</span>
                  <input
                    value={cardNumber}
                    onChange={(event) => setCardNumber(event.target.value)}
                    className="mt-2 h-12 w-full border border-[#1c1c1c] bg-[#1a1a1a] px-4 text-[14px] font-semibold text-[#d7d7d7] outline-none focus:border-[#555]"
                  />
                </label>
                <label className="block">
                  <span className="text-[14px] font-semibold text-white">Exp date</span>
                  <input
                    value={expiry}
                    onChange={(event) => setExpiry(event.target.value)}
                    className="mt-2 h-12 w-full border border-[#1c1c1c] bg-[#1a1a1a] px-4 text-[14px] font-semibold text-[#d7d7d7] outline-none focus:border-[#555]"
                  />
                </label>
                <label className="block">
                  <span className="text-[14px] font-semibold text-white">CVV code</span>
                  <input
                    value={cvc}
                    onChange={(event) => setCvc(event.target.value)}
                    className="mt-2 h-12 w-full border border-[#1c1c1c] bg-[#1a1a1a] px-4 text-[14px] font-semibold text-[#d7d7d7] outline-none focus:border-[#555]"
                  />
                </label>
              </div>

              <label className="block">
                <span className="text-[14px] font-semibold text-white">Name on card</span>
                <input
                  value={nameOnCard}
                  onChange={(event) => setNameOnCard(event.target.value)}
                  className="mt-2 h-12 w-full border border-[#1c1c1c] bg-[#1a1a1a] px-4 text-[14px] font-semibold text-[#d7d7d7] outline-none focus:border-[#555]"
                />
              </label>

              <div className="flex flex-col gap-3 pt-2 sm:flex-row sm:items-center">
                <button
                  type="button"
                  onClick={submitPayment}
                  className="inline-flex h-12 flex-1 items-center justify-center gap-2 overflow-hidden rounded-[7px] border border-[#333] bg-black px-5 text-[14px] font-bold text-white hover:border-[#666] hover:bg-[#111]"
                >
                  <AgncyPayLogo className="h-[18px] w-[50px]" imageClassName="h-full w-full" />
                  <span>Now</span>
                </button>
                <span className="text-[12px] font-semibold text-[#8f8f8f]">{paymentLabel}</span>
              </div>
            </div>
          </div>
        </section>

        <SummaryCard invoice={invoice} total={total} returnTo={returnTo} onCopy={copyLink} onDownload={downloadPdf} />
      </main>

      {(stage === "processing" || stage === "success") && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/65 px-4 backdrop-blur-[2px]">
          <section className="w-full max-w-[300px] rounded-[10px] border border-[#2f2f2f] bg-[#202020] p-6 text-center shadow-2xl">
            {stage === "processing" ? (
              <>
                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full border border-[#555] bg-[#151515]">
                  <Lock className="h-7 w-7 animate-pulse text-white" />
                </div>
                <h2 className="mt-5 text-[23px] font-bold tracking-[-0.03em] text-white">processing payment</h2>
                <p className="mt-2 text-[11px] leading-5 text-[#bdbdbd]">AgncyPay is securing the payment session.</p>
              </>
            ) : (
              <>
                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-[#16c95f] text-white shadow-[0_0_28px_rgba(22,201,95,0.32)]">
                  <CheckCircle2 className="h-9 w-9" />
                </div>
                <h2 className="mt-5 text-[25px] font-bold tracking-[-0.04em] text-[#69f39b]">payment successful</h2>
                <p className="mt-2 text-[11px] leading-5 text-[#c8f5d5]">
                  Transaction {transactionId} was submitted successfully.
                </p>
                <Link
                  href={`/receipt/${invoice.id}?tx=${transactionId}&mode=${isLoggedInMode ? "logged_in" : "guest"}&returnTo=${returnTo}`}
                  className="mt-5 inline-flex h-10 items-center justify-center rounded-[5px] border border-[#16c95f] bg-[#16c95f] px-4 text-[12px] font-bold text-white hover:bg-[#28df73]"
                >
                  View receipt
                </Link>
              </>
            )}
          </section>
        </div>
      )}
    </div>
  );
}
