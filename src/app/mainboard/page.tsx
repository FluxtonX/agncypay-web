"use client";

import React, { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import {
  ArrowLeft,
  CheckCircle2,
  Copy,
  Download,
  FileText,
  Lock,
  Mail,
  Search,
  ShieldCheck,
  Smartphone,
  X,
  type LucideIcon,
} from "lucide-react";
import { downloadTableReportPdf } from "../../lib/pdfExport";
import { cn } from "../../lib/utils";
import { AgncyPayLogo } from "../../components/payment/AgncyPayLogo";
import {
  formatMainboardMoney,
  mainboardInvoices,
  type MainboardInvoice,
  type MainboardInvoiceStatus,
} from "../../lib/mainboard";

type CheckoutMode = "guest" | "logged_in";
type PaymentStage = "closed" | "review" | "checkout" | "processing" | "success";
type PaymentScope =
  | { type: "single"; invoiceId: string }
  | { type: "batch"; invoiceIds: string[] };

type Metric = {
  label: string;
  value: string;
  detail: string;
  icon: LucideIcon;
};

const metrics: Metric[] = [
  { label: "Available Balance", value: "$7,900", detail: "Instant transfer ready", icon: Smartphone },
  { label: "Open Requests", value: "2", detail: "Guest checkout enabled", icon: Mail },
  { label: "Batch Queue", value: "3", detail: "Select invoices to pay", icon: FileText },
  { label: "Settlement Health", value: "98.4%", detail: "No failed settlements", icon: ShieldCheck },
];

function formatBatchTotal(selected: MainboardInvoice[]) {
  return selected.reduce((total, invoice) => total + invoice.amount + invoice.fee, 0);
}

function buildLoggedInPayHref(invoiceId: string) {
  return `/auth/login?next=${encodeURIComponent(`/pay/${invoiceId}?mode=logged_in`)}`;
}

function stepLabel(stage: PaymentStage, mode: CheckoutMode) {
  if (stage === "review") return mode === "guest" ? "Pay as Guest" : "View and Pay";
  if (stage === "checkout") return mode === "guest" ? "Guest Checkout" : "Logged-in Checkout";
  if (stage === "processing") return "Processing Payment";
  if (stage === "success") return "Payment Successful";
  return "Mainboard";
}

function MainboardInvoiceStatus({ status }: { status: MainboardInvoiceStatus }) {
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

function RequestedViaCell({ invoiceId }: { invoiceId: string }) {
  const payHref = `/pay/${invoiceId}?mode=guest`;

  return (
    <div className="inline-flex items-center gap-1 rounded-full border border-[#444] bg-[#090909] px-2 py-1">
      <span className="flex h-4 w-4 shrink-0 items-center justify-center overflow-hidden rounded-full border border-[#333] bg-black">
        <AgncyPayLogo imageClassName="h-[8px] w-auto" />
      </span>
      <Link
        href={payHref}
        onClick={(event) => event.stopPropagation()}
        className="inline-flex h-4 shrink-0 items-center rounded-full border border-white bg-white px-1.5 text-[8px] font-semibold leading-none text-black hover:bg-[#e8e8e8]"
      >
        Pay
      </Link>
    </div>
  );
}

export default function MainboardPage() {
  const searchParams = useSearchParams();
  const invoiceParam = searchParams.get("invoice");

  const [selectedInvoiceId, setSelectedInvoiceId] = useState<string>(invoiceParam || mainboardInvoices[0].id);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [search, setSearch] = useState("");
  const [stage, setStage] = useState<PaymentStage>("closed");
  const [checkoutMode, setCheckoutMode] = useState<CheckoutMode>("guest");
  const [fundingMethod, setFundingMethod] = useState<"ach" | "card" | "wallet">("ach");
  const [paymentScope, setPaymentScope] = useState<PaymentScope | null>(null);
  const [activeStep, setActiveStep] = useState(0);
  const [guestName, setGuestName] = useState("Leo Tolstoy");
  const [guestEmail, setGuestEmail] = useState("leo.tolstoy@nike.com");
  const [guestPhone, setGuestPhone] = useState("+1 (555) 555-5555");
  const [transactionId, setTransactionId] = useState("");
  const [showPdfPreview, setShowPdfPreview] = useState(false);

  useEffect(() => {
    if (invoiceParam && mainboardInvoices.some((invoice) => invoice.id === invoiceParam)) {
      setSelectedInvoiceId(invoiceParam);
    }
  }, [invoiceParam]);

  useEffect(() => {
    if (stage !== "processing") return;

    const steps = [
      "Validating invoice selection",
      "Securing payment rail",
      "Submitting settlement instruction",
      "Reconciling receipt and log entry",
    ];

    setActiveStep(0);
    const interval = window.setInterval(() => {
      setActiveStep((prev) => Math.min(prev + 1, steps.length - 1));
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

  const filteredInvoices = useMemo(() => {
    const query = search.trim().toLowerCase();
    return mainboardInvoices.filter((invoice) => {
      if (!query) return true;
      return [
        invoice.id,
        invoice.recipient,
        invoice.email,
        invoice.walletId,
        invoice.mobile,
        invoice.brand,
        invoice.status,
      ]
        .join(" ")
        .toLowerCase()
        .includes(query);
    });
  }, [search]);

  const selectedInvoice = mainboardInvoices.find((invoice) => invoice.id === selectedInvoiceId) || mainboardInvoices[0];
  const selectedBatch = mainboardInvoices.filter((invoice) => selectedIds.includes(invoice.id));
  const loggedInPayHref = buildLoggedInPayHref(selectedInvoice.id);
  const batchTotal = formatBatchTotal(selectedBatch);
  const paymentInvoices =
    paymentScope?.type === "batch"
      ? mainboardInvoices.filter((invoice) => paymentScope.invoiceIds.includes(invoice.id))
      : [selectedInvoice];
  const paymentPrimaryInvoice = paymentInvoices[0] || selectedInvoice;
  const paymentTotal = paymentInvoices.reduce((total, invoice) => total + invoice.amount + invoice.fee, 0);
  const paymentAmountTotal = paymentInvoices.reduce((total, invoice) => total + invoice.amount, 0);
  const paymentFeeTotal = paymentInvoices.reduce((total, invoice) => total + invoice.fee, 0);
  const paymentIsBatch = paymentScope?.type === "batch";
  const paymentTitle = paymentIsBatch
    ? `Batch payment (${paymentInvoices.length})`
    : paymentPrimaryInvoice.recipient;
  const paymentSubtitle = paymentIsBatch
    ? `${paymentInvoices.length} invoices selected from Mainboard`
    : `${paymentPrimaryInvoice.recipient} - ${paymentPrimaryInvoice.id}`;

  const openBatchCheckout = (mode: CheckoutMode) => {
    if (selectedBatch.length === 0) return;

    setPaymentScope({ type: "batch", invoiceIds: selectedBatch.map((invoice) => invoice.id) });
    setSelectedInvoiceId(selectedBatch[0].id);
    setCheckoutMode(mode);
    setShowPdfPreview(false);
    setStage("review");
  };

  const confirmPayment = () => {
    setTransactionId(`TX-AP-${Math.floor(100000 + Math.random() * 900000)}`);
    setStage("processing");
  };

  const closeSheet = () => {
    if (stage === "processing") return;
    setStage("closed");
    setShowPdfPreview(false);
    setPaymentScope(null);
  };

  const toggleBatchSelection = (invoiceId: string) => {
    setSelectedIds((current) =>
      current.includes(invoiceId) ? current.filter((id) => id !== invoiceId) : [...current, invoiceId]
    );
  };

  const paySelected = () => {
    if (selectedBatch.length === 0) return;
    openBatchCheckout("guest");
  };

  const exportSelected = () => {
    if (selectedBatch.length === 0) return;

    downloadTableReportPdf({
      title: "Mainboard Selected Batch",
      subtitle: "Mock Mainboard batch export for selected invoices and receipt tracking.",
      filename: "agncypay-mainboard-selected-batch.pdf",
      summary: [
        { label: "Selected", value: selectedBatch.length.toString() },
        { label: "Batch Total", value: formatMainboardMoney(batchTotal) },
        { label: "Reference", value: "Mainboard Demo" },
      ],
      columns: ["Invoice", "Recipient", "Requested", "Amount", "Fee", "Status"],
      rows: selectedBatch.map((invoice) => [
        invoice.id,
        invoice.recipient,
        invoice.source,
        formatMainboardMoney(invoice.amount),
        formatMainboardMoney(invoice.fee),
        invoice.status,
      ]),
    });
  };

  const downloadInvoicePdf = (invoice: MainboardInvoice) => {
    downloadTableReportPdf({
      title: `Invoice ${invoice.id}`,
      subtitle: "Mainboard invoice PDF preview and payment request reference.",
      filename: `agncypay-${invoice.id}.pdf`,
      summary: [
        { label: "Recipient", value: invoice.recipient },
        { label: "Requested via", value: invoice.source },
        { label: "Wallet ID", value: invoice.walletId },
        { label: "Due", value: invoice.due },
      ],
      columns: ["Item", "Qty", "Rate"],
      rows: invoice.items.map((item) => [item.title, item.qty.toString(), formatMainboardMoney(item.rate)]),
    });
  };

  const downloadCurrentPaymentPdf = () => {
    if (paymentIsBatch) {
      exportSelected();
      return;
    }

    downloadInvoicePdf(paymentPrimaryInvoice);
  };

  const copyShareLink = async () => {
    const url = `${window.location.origin}/request/${selectedInvoice.id}?mode=guest`;
    await navigator.clipboard.writeText(url);
  };

  const pageTitle = stepLabel(stage, checkoutMode);

  return (
    <div className="min-h-screen bg-black text-white">
      <header className="sticky top-0 z-20 border-b border-[#111] bg-black/95 backdrop-blur">
        <div className="mx-auto flex h-[76px] max-w-[1480px] items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-4">
            <Link href="/" className="inline-flex items-center gap-2 rounded-[7px] border border-[#222] bg-[#050505] px-3 py-2 text-[13px] font-semibold text-white hover:border-[#555]">
              <ArrowLeft className="h-4 w-4" />
              Home
            </Link>
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-[#7a7a7a]">
                Mainboard Demo
              </p>
              <h1 className="text-[20px] font-semibold leading-none text-white">
                Pay with AgncyPay
              </h1>
            </div>
          </div>

          <div className="hidden w-full max-w-[560px] items-center gap-3 lg:flex">
            <div className="relative w-full">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#777]" />
              <input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search name, wallet ID, email, or mobile number"
                className="h-11 w-full rounded-[7px] border border-[#333] bg-[#050505] pl-10 pr-4 text-[14px] text-white outline-none placeholder:text-[#666] focus:border-[#666]"
              />
            </div>
            <span className="inline-flex h-11 items-center rounded-[7px] border border-[#333] bg-[#050505] px-4 text-[13px] font-semibold text-[#d7d7d7]">
              {pageTitle}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <Link
              href={`/request/${selectedInvoice.id}?mode=guest`}
              className="inline-flex h-11 items-center gap-2 rounded-[7px] border border-white bg-white px-4 text-[13px] font-semibold text-black hover:bg-[#e8e8e8]"
            >
              <ShieldCheck className="h-4 w-4" />
              Pay with AgncyPay
            </Link>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-[1480px] px-4 py-5 sm:px-6 lg:px-8">
        <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {metrics.map((metric) => {
            const Icon = metric.icon;
            return (
              <article key={metric.label} className="rounded-[13px] border border-[#2b2b2b] bg-[#050505] p-5">
                <div className="flex items-center justify-between">
                  <p className="text-[12px] font-semibold uppercase tracking-[0.08em] text-[#7a7a7a]">
                    {metric.label}
                  </p>
                  <Icon className="h-4 w-4 text-white" />
                </div>
                <p className="mt-8 text-[34px] font-semibold leading-none text-white">
                  {metric.value}
                </p>
                <p className="mt-3 text-[14px] text-[#949494]">{metric.detail}</p>
              </article>
            );
          })}
        </section>

        <section className="mt-5 grid grid-cols-1 gap-5 xl:grid-cols-[minmax(0,1.25fr)_minmax(360px,0.75fr)]">
          <div className="rounded-[13px] border border-[#2b2b2b] bg-[#050505]">
            <div className="flex flex-col gap-3 border-b border-[#222] p-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h2 className="text-[18px] font-semibold text-white">Invoice queue</h2>
                <p className="mt-1 text-[14px] text-[#8f8f8f]">
                  Select invoices, inspect details, and send them through AgncyPay.
                </p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={exportSelected}
                  className="h-10 rounded-[7px] border border-[#333] bg-black px-4 text-[13px] font-semibold text-white hover:border-[#666]"
                >
                  Export Selected
                </button>
                <button
                  type="button"
                  onClick={paySelected}
                  className="h-10 rounded-[7px] border border-white bg-white px-4 text-[13px] font-semibold text-black hover:bg-[#e8e8e8]"
                >
                  Process Selected
                </button>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="min-w-[1020px] w-full table-fixed text-left">
                <colgroup>
                  <col className="w-[54px]" />
                  <col className="w-[132px]" />
                  <col className="w-[220px]" />
                  <col className="w-[260px]" />
                  <col className="w-[120px]" />
                  <col className="w-[116px]" />
                  <col className="w-[118px]" />
                </colgroup>
                <thead>
                  <tr className="h-12 border-b border-[#222] text-[12px] font-semibold uppercase tracking-[0.08em] text-[#7a7a7a]">
                    <th className="pl-4 pr-2">
                      <input
                        type="checkbox"
                        aria-label="Select all invoices"
                        checked={selectedIds.length === filteredInvoices.length && filteredInvoices.length > 0}
                        onChange={() =>
                          setSelectedIds((current) =>
                            current.length === filteredInvoices.length
                              ? []
                              : filteredInvoices.map((invoice) => invoice.id)
                          )
                        }
                        className="h-4 w-4 rounded border border-[#666] bg-black accent-white"
                      />
                    </th>
                    <th className="px-0">Invoice ID</th>
                    <th className="px-0">Recipient</th>
                    <th className="px-0">Requested</th>
                    <th className="px-0">Amount</th>
                    <th className="px-0">Due</th>
                    <th className="px-0">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredInvoices.map((invoice) => {
                    const isSelected = selectedIds.includes(invoice.id);
                    const isActive = selectedInvoice.id === invoice.id;

                    return (
                      <tr
                        key={invoice.id}
                        onClick={() => setSelectedInvoiceId(invoice.id)}
                        className={cn(
                          "h-[72px] cursor-pointer border-b border-[#1f1f1f] transition-colors hover:bg-white/[0.02]",
                          isActive && "bg-white/[0.04]"
                        )}
                      >
                        <td className="pl-4 pr-2">
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={(event) => {
                              event.stopPropagation();
                              toggleBatchSelection(invoice.id);
                            }}
                            onClick={(event) => event.stopPropagation()}
                            className="h-4 w-4 rounded border border-[#666] bg-black accent-white"
                          />
                        </td>
                        <td className="font-mono text-[15px] font-semibold text-white">{invoice.id}</td>
                        <td>
                          <div className="min-w-0">
                            <p className="truncate text-[15px] font-semibold text-white">{invoice.recipient}</p>
                            <p className="mt-1 truncate text-[13px] text-[#8f8f8f]">{invoice.note}</p>
                          </div>
                        </td>
                        <td>
                          <RequestedViaCell invoiceId={invoice.id} />
                        </td>
                        <td className="text-[15px] font-semibold text-white">{formatMainboardMoney(invoice.amount + invoice.fee)}</td>
                        <td className="text-[13px] text-[#bdbdbd]">{invoice.due}</td>
                        <td>
                          <MainboardInvoiceStatus status={invoice.status} />
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          <aside className="space-y-5">
            <section className="rounded-[13px] border border-[#2b2b2b] bg-[#050505] p-5">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-[12px] font-semibold uppercase tracking-[0.08em] text-[#7a7a7a]">
                    Selected invoice
                  </p>
                  <h2 className="mt-2 text-[24px] font-semibold text-white">
                    {selectedInvoice.recipient}
                  </h2>
                </div>
                <MainboardInvoiceStatus status={selectedInvoice.status} />
              </div>

              <div className="mt-5 rounded-[12px] border border-[#242424] bg-black p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-[13px] text-[#8f8f8f]">Balance Due</p>
                    <p className="mt-2 text-[34px] font-semibold leading-none text-white">
                      {formatMainboardMoney(selectedInvoice.amount + selectedInvoice.fee)}
                    </p>
                  </div>
                  <div className="text-right text-[12px] text-[#8f8f8f]">
                    <p>Invoice</p>
                    <p className="mt-1 font-mono text-white">{selectedInvoice.id}</p>
                  </div>
                </div>

                <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
                  <Link
                    href={`/request/${selectedInvoice.id}?mode=guest`}
                    className="inline-flex h-11 items-center justify-center gap-2 rounded-[7px] border border-white bg-white px-4 text-[13px] font-semibold text-black hover:bg-[#e8e8e8]"
                  >
                    Pay as Guest
                  </Link>
                <Link
                    href={loggedInPayHref}
                    className="inline-flex h-11 items-center justify-center gap-2 rounded-[7px] border border-[#333] bg-[#111] px-4 text-[13px] font-semibold text-white hover:border-[#666]"
                  >
                  <AgncyPayLogo imageClassName="h-3" />
                  <span>View and Pay</span>
                </Link>
                </div>

                <div className="mt-3 grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => downloadInvoicePdf(selectedInvoice)}
                    className="inline-flex h-10 items-center justify-center gap-2 rounded-[7px] border border-[#333] bg-[#111] px-3 text-[12px] font-semibold text-white hover:border-[#666]"
                  >
                    <Download className="h-4 w-4" />
                    View Invoice PDF
                  </button>
                  <button
                    type="button"
                    onClick={copyShareLink}
                    className="inline-flex h-10 items-center justify-center gap-2 rounded-[7px] border border-[#333] bg-[#111] px-3 text-[12px] font-semibold text-white hover:border-[#666]"
                  >
                    <Copy className="h-4 w-4" />
                    Copy Link
                  </button>
                </div>
              </div>

              <div className="mt-4 space-y-3 rounded-[12px] border border-[#242424] bg-[#090909] p-4">
                <div className="flex justify-between gap-4 text-[13px]">
                  <span className="text-[#8f8f8f]">Recipient email</span>
                  <span className="truncate text-right text-white">{selectedInvoice.email}</span>
                </div>
                <div className="flex justify-between gap-4 text-[13px]">
                  <span className="text-[#8f8f8f]">Wallet ID</span>
                  <span className="text-white">{selectedInvoice.walletId}</span>
                </div>
                <div className="flex justify-between gap-4 text-[13px]">
                  <span className="text-[#8f8f8f]">Requested via</span>
                  <span className="text-white">{selectedInvoice.source}</span>
                </div>
                <div className="flex justify-between gap-4 text-[13px]">
                  <span className="text-[#8f8f8f]">Mobile</span>
                  <span className="text-white">{selectedInvoice.mobile}</span>
                </div>
                <div className="flex justify-between gap-4 text-[13px]">
                  <span className="text-[#8f8f8f]">Due</span>
                  <span className="text-white">{selectedInvoice.due}</span>
                </div>
              </div>
            </section>

            <section className="rounded-[13px] border border-[#2b2b2b] bg-[#050505] p-5">
              <div className="flex items-center justify-between">
                <h3 className="text-[18px] font-semibold text-white">Payment log preview</h3>
                <button
                  type="button"
                  onClick={() => setShowPdfPreview((current) => !current)}
                  className="text-[12px] font-semibold text-[#d7d7d7] hover:text-white"
                >
                  {showPdfPreview ? "Hide PDF preview" : "Show PDF preview"}
                </button>
              </div>

              {showPdfPreview ? (
                <div className="mt-4 rounded-[12px] border border-[#242424] bg-black p-4">
                  <p className="text-[12px] font-semibold uppercase tracking-[0.08em] text-[#7a7a7a]">
                    Invoice PDF
                  </p>
                  <h4 className="mt-3 text-[20px] font-semibold text-white">
                    {selectedInvoice.recipient}
                  </h4>
                  <p className="mt-2 text-[13px] text-[#8f8f8f]">
                    {selectedInvoice.note}
                  </p>
                  <div className="mt-4 space-y-2 text-[13px]">
                    {selectedInvoice.items.map((item) => (
                      <div key={item.title} className="flex justify-between gap-4 border-b border-[#1d1d1d] pb-2">
                        <span className="text-[#d7d7d7]">{item.title}</span>
                        <span className="text-white">{formatMainboardMoney(item.rate)}</span>
                      </div>
                    ))}
                  </div>
                  <div className="mt-4 flex justify-between border-t border-[#1d1d1d] pt-3 text-[14px]">
                    <span className="text-[#8f8f8f]">Total</span>
                    <span className="font-semibold text-white">{formatMainboardMoney(selectedInvoice.amount + selectedInvoice.fee)}</span>
                  </div>
                </div>
              ) : (
                <div className="mt-4 rounded-[12px] border border-[#242424] bg-black p-4 text-[13px] text-[#8f8f8f]">
                  Click `Show PDF preview` to inspect the invoice before payment.
                </div>
              )}
            </section>
          </aside>
        </section>

        {selectedIds.length > 0 && (
          <section className="sticky bottom-4 mt-5 rounded-[13px] border border-[#2b2b2b] bg-black/95 p-4 backdrop-blur">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
              <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
                <div>
                  <p className="text-[12px] text-[#7a7a7a]">Selected</p>
                  <p className="mt-1 text-[18px] font-semibold text-white">{selectedBatch.length}</p>
                </div>
                <div>
                  <p className="text-[12px] text-[#7a7a7a]">Batch total</p>
                  <p className="mt-1 text-[18px] font-semibold text-white">{formatMainboardMoney(batchTotal)}</p>
                </div>
                <div>
                  <p className="text-[12px] text-[#7a7a7a]">Action</p>
                  <p className="mt-1 text-[18px] font-semibold text-white">Review or export</p>
                </div>
              </div>

              <div className="flex flex-col gap-3 sm:flex-row">
                <button
                  type="button"
                  onClick={() => setSelectedIds([])}
                  className="h-11 rounded-[7px] border border-[#333] bg-[#111] px-4 text-[13px] font-semibold text-white hover:border-[#666]"
                >
                  Clear selection
                </button>
                <button
                  type="button"
                  onClick={exportSelected}
                  className="h-11 rounded-[7px] border border-[#333] bg-[#111] px-4 text-[13px] font-semibold text-white hover:border-[#666]"
                >
                  Export Selected
                </button>
                <button
                  type="button"
                  onClick={paySelected}
                  className="h-11 rounded-[7px] border border-white bg-white px-4 text-[13px] font-semibold text-black hover:bg-[#e8e8e8]"
                >
                  Process Selected
                </button>
              </div>
            </div>
          </section>
        )}
      </main>

      {stage !== "closed" && (
        <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-black/80 px-4 py-6 backdrop-blur-sm">
          <section className="flex max-h-[calc(100vh-40px)] w-full max-w-[720px] flex-col overflow-hidden rounded-[13px] border border-[#2b2b2b] bg-[#050505] shadow-2xl">
            <div className="flex shrink-0 items-center justify-between gap-4 border-b border-[#222] px-5 py-4">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-[8px] border border-[#333] bg-[#111] text-white">
                  {stage === "success" ? <CheckCircle2 className="h-5 w-5" /> : <Lock className="h-5 w-5" />}
                </div>
                <div>
                  <h2 className="text-[20px] font-semibold text-white">{stepLabel(stage, checkoutMode)}</h2>
                  <p className="mt-1 text-[13px] text-[#8f8f8f]">
                    {paymentSubtitle}
                  </p>
                </div>
              </div>

              {stage !== "processing" && (
                <button
                  type="button"
                  onClick={closeSheet}
                  className="flex h-9 w-9 items-center justify-center rounded-[7px] border border-[#333] text-[#bdbdbd] hover:border-[#666] hover:text-white"
                >
                  <X className="h-5 w-5" />
                </button>
              )}
            </div>

            <div className="min-h-0 flex-1 overflow-y-auto p-5">
              {stage === "review" && (
                <div className="grid grid-cols-1 gap-5 lg:grid-cols-[minmax(0,1.1fr)_360px]">
                  <div className="space-y-4">
                    <div className="rounded-[12px] border border-[#242424] bg-black p-4">
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <p className="text-[12px] uppercase tracking-[0.08em] text-[#7a7a7a]">Invoice</p>
                          <h3 className="mt-2 text-[24px] font-semibold text-white">{paymentTitle}</h3>
                          <p className="mt-2 text-[14px] text-[#8f8f8f]">
                            {paymentIsBatch
                              ? "AgncyPay will process the selected invoices as one payment batch."
                              : paymentPrimaryInvoice.note}
                          </p>
                        </div>
                        <MainboardInvoiceStatus
                          status={paymentIsBatch ? "Pending" : paymentPrimaryInvoice.status}
                        />
                      </div>
                      {paymentIsBatch ? (
                        <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-3">
                          <div className="rounded-[10px] border border-[#222] bg-[#090909] p-3">
                            <p className="text-[12px] text-[#7a7a7a]">Subtotal</p>
                            <p className="mt-2 text-[18px] font-semibold text-white">{formatMainboardMoney(paymentAmountTotal)}</p>
                          </div>
                          <div className="rounded-[10px] border border-[#222] bg-[#090909] p-3">
                            <p className="text-[12px] text-[#7a7a7a]">Fees</p>
                            <p className="mt-2 text-[18px] font-semibold text-white">{formatMainboardMoney(paymentFeeTotal)}</p>
                          </div>
                          <div className="rounded-[10px] border border-[#222] bg-[#090909] p-3">
                            <p className="text-[12px] text-[#7a7a7a]">Batch total</p>
                            <p className="mt-2 text-[18px] font-semibold text-white">{formatMainboardMoney(paymentTotal)}</p>
                          </div>
                        </div>
                      ) : (
                        <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-3">
                          <div className="rounded-[10px] border border-[#222] bg-[#090909] p-3">
                            <p className="text-[12px] text-[#7a7a7a]">Amount</p>
                            <p className="mt-2 text-[18px] font-semibold text-white">{formatMainboardMoney(paymentPrimaryInvoice.amount)}</p>
                          </div>
                          <div className="rounded-[10px] border border-[#222] bg-[#090909] p-3">
                            <p className="text-[12px] text-[#7a7a7a]">Fee</p>
                            <p className="mt-2 text-[18px] font-semibold text-white">{formatMainboardMoney(paymentPrimaryInvoice.fee)}</p>
                          </div>
                          <div className="rounded-[10px] border border-[#222] bg-[#090909] p-3">
                            <p className="text-[12px] text-[#7a7a7a]">Total</p>
                            <p className="mt-2 text-[18px] font-semibold text-white">{formatMainboardMoney(paymentTotal)}</p>
                          </div>
                        </div>
                      )}
                    </div>

                    <div className="rounded-[12px] border border-[#242424] bg-black p-4">
                      <div className="flex items-center justify-between gap-4">
                        <p className="text-[14px] font-semibold text-white">Payment methods</p>
                        <div className="flex items-center gap-2 text-[12px] text-[#8f8f8f]">
                          <ShieldCheck className="h-4 w-4" />
                          PayPal-style checkout
                        </div>
                      </div>
                      <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-3">
                        {[
                          ["ach", "Instant transfer", "AgncyPay treasury rail"],
                          ["card", "Card", "Corporate card fallback"],
                          ["wallet", "Wallet", "Mainboard wallet balance"],
                        ].map(([key, title, detail]) => {
                          const isSelected = fundingMethod === key;
                          return (
                            <button
                              key={key}
                              type="button"
                              onClick={() => setFundingMethod(key as typeof fundingMethod)}
                              className={cn(
                                "rounded-[10px] border p-3 text-left transition-colors",
                                isSelected
                                  ? "border-white bg-white text-black"
                                  : "border-[#333] bg-[#090909] text-white hover:border-[#666]"
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
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="rounded-[12px] border border-[#242424] bg-black p-4">
                      <div className="flex gap-2">
                        <button
                          type="button"
                          onClick={() => setCheckoutMode("guest")}
                          className={cn(
                            "h-10 flex-1 rounded-[7px] border text-[13px] font-semibold",
                            checkoutMode === "guest"
                              ? "border-white bg-white text-black"
                              : "border-[#333] bg-[#111] text-white"
                          )}
                        >
                          Pay as Guest
                        </button>
                        <button
                          type="button"
                          onClick={() => setCheckoutMode("logged_in")}
                          className={cn(
                            "h-10 flex-1 rounded-[7px] border text-[13px] font-semibold",
                            checkoutMode === "logged_in"
                              ? "border-white bg-white text-black"
                              : "border-[#333] bg-[#111] text-white"
                          )}
                        >
                          Log in and Pay
                        </button>
                      </div>

                      {checkoutMode === "guest" ? (
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
                            Brand treasury contact and saved billing profile will be used for this payment.
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

                      <div className="mt-4 flex flex-col gap-3 sm:flex-row">
                    <button
                      type="button"
                      onClick={confirmPayment}
                      className="inline-flex h-11 flex-1 items-center justify-center gap-2 rounded-[7px] border border-white bg-white px-4 text-[13px] font-semibold text-black hover:bg-[#e8e8e8]"
                    >
                      <AgncyPayLogo imageClassName="h-3" />
                      <span>AgncyPay now</span>
                    </button>
                        <button
                          type="button"
                          onClick={() => setShowPdfPreview(true)}
                          className="h-11 rounded-[7px] border border-[#333] bg-[#111] px-4 text-[13px] font-semibold text-white hover:border-[#666]"
                        >
                          View Invoice PDF
                        </button>
                      </div>

                      {paymentIsBatch && (
                        <div className="mt-4 rounded-[10px] border border-[#242424] bg-[#090909] p-4">
                          <p className="text-[13px] font-semibold text-white">Selected invoices</p>
                          <div className="mt-3 max-h-[176px] space-y-2 overflow-y-auto pr-1">
                            {paymentInvoices.map((invoice) => (
                              <div key={invoice.id} className="flex items-start justify-between gap-4 border-b border-[#1d1d1d] pb-2">
                                <div className="min-w-0">
                                  <p className="truncate text-[13px] text-white">{invoice.recipient}</p>
                                  <p className="mt-1 font-mono text-[12px] text-[#8f8f8f]">{invoice.id}</p>
                                </div>
                                <span className="shrink-0 text-[13px] text-white">
                                  {formatMainboardMoney(invoice.amount + invoice.fee)}
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>

                    <div className="rounded-[12px] border border-[#242424] bg-[#090909] p-4">
                      <p className="text-[13px] font-semibold text-white">Invoice PDF preview</p>
                      <p className="mt-2 text-[13px] text-[#8f8f8f]">
                        A PDF-style summary is available before payment to mirror the reference journey.
                      </p>
                      <div className="mt-4 rounded-[10px] border border-[#222] bg-black p-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-[12px] text-[#7a7a7a]">
                              {paymentIsBatch ? `${paymentInvoices.length} selected invoices` : paymentPrimaryInvoice.id}
                            </p>
                            <p className="mt-2 text-[16px] font-semibold text-white">
                              {paymentIsBatch ? "Batch PDF preview" : paymentPrimaryInvoice.recipient}
                            </p>
                          </div>
                          <button
                            type="button"
                            onClick={downloadCurrentPaymentPdf}
                            className="inline-flex items-center gap-2 rounded-[7px] border border-[#333] bg-[#111] px-3 py-2 text-[12px] font-semibold text-white hover:border-[#666]"
                          >
                            <Download className="h-4 w-4" />
                            {paymentIsBatch ? "Download Batch PDF" : "Download PDF"}
                          </button>
                        </div>
                        <div className="mt-4 space-y-2 text-[13px]">
                          {paymentIsBatch ? (
                            paymentInvoices.map((invoice) => (
                              <div key={invoice.id} className="flex items-start justify-between gap-4 border-b border-[#1d1d1d] pb-2">
                                <div className="min-w-0">
                                  <p className="truncate text-[#d7d7d7]">{invoice.recipient}</p>
                                  <p className="mt-1 font-mono text-[12px] text-[#8f8f8f]">{invoice.id}</p>
                                </div>
                                <span className="shrink-0 text-white">{formatMainboardMoney(invoice.amount + invoice.fee)}</span>
                              </div>
                            ))
                          ) : (
                            paymentPrimaryInvoice.items.map((item) => (
                              <div key={item.title} className="flex justify-between gap-4 border-b border-[#1d1d1d] pb-2">
                                <span className="text-[#d7d7d7]">{item.title}</span>
                                <span className="text-white">{formatMainboardMoney(item.rate)}</span>
                              </div>
                            ))
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {stage === "processing" && (
                <div className="flex min-h-[360px] flex-col items-center justify-center text-center">
                  <div className="relative flex h-[84px] w-[84px] items-center justify-center rounded-full border border-[#333] bg-[#090909]">
                    <Lock className="h-9 w-9 text-white" />
                    <span className="absolute inset-0 rounded-full border border-white/10 animate-pulse" />
                  </div>

                  <h3 className="mt-5 text-[24px] font-semibold text-white">{pageTitle}</h3>
                  <p className="mt-2 max-w-[460px] text-[14px] leading-6 text-[#8f8f8f]">
                    {checkoutMode === "guest"
                      ? "Guest checkout is being secured and the invoice is moving through the payment rail."
                      : "Signed-in payment is being settled and the invoice is moving into the receipt log."}
                  </p>

                  <div className="mt-8 w-full max-w-[520px] rounded-[12px] border border-[#242424] bg-black p-4 text-left">
                    {[
                      "Validating invoice identity",
                      "Securing payment rail",
                      "Submitting settlement",
                      "Writing receipt to log",
                    ].map((label, index) => {
                      const isActive = index === activeStep;
                      const isDone = index < activeStep;
                      return (
                        <div
                          key={label}
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
                          <span>{label}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {stage === "success" && (
                <div className="flex min-h-[360px] flex-col items-center justify-center text-center">
                  <div className="flex h-[84px] w-[84px] items-center justify-center rounded-full border border-white bg-white text-black">
                    <CheckCircle2 className="h-10 w-10" />
                  </div>
                  <h3 className="mt-5 text-[26px] font-semibold text-white">Payment Successful</h3>
                  <p className="mt-2 max-w-[500px] text-[14px] leading-6 text-[#8f8f8f]">
                    {paymentIsBatch
                      ? `Transaction ${transactionId} has been settled for ${paymentInvoices.length} invoices and written to the invoice log.`
                      : `Transaction ${transactionId} has been settled and written to the invoice log.`}
                  </p>

                  <div className="mt-8 w-full max-w-[520px] rounded-[12px] border border-[#242424] bg-black p-4 text-left">
                    <div className="flex flex-col gap-2 border-b border-[#1d1d1d] pb-3 sm:flex-row sm:justify-between">
                      <span className="text-[13px] text-[#7a7a7a]">Transaction ID</span>
                      <span className="font-mono text-[13px] text-white">{transactionId}</span>
                    </div>
                    <div className="flex justify-between gap-4 border-b border-[#1d1d1d] py-3">
                      <span className="text-[13px] text-[#7a7a7a]">{paymentIsBatch ? "Batch scope" : "Invoice"}</span>
                      <span className="text-[13px] text-white">
                        {paymentIsBatch ? `${paymentInvoices.length} invoices` : paymentPrimaryInvoice.id}
                      </span>
                    </div>
                    <div className="flex justify-between gap-4 pt-3">
                      <span className="text-[13px] text-[#7a7a7a]">
                        {paymentIsBatch ? "Batch total" : "Final Amount"}
                      </span>
                      <span className="text-[13px] font-semibold text-white">{formatMainboardMoney(paymentTotal)}</span>
                    </div>
                  </div>

                  <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                    <button
                      type="button"
                      onClick={closeSheet}
                      className="h-11 rounded-[7px] border border-[#333] bg-[#111] px-4 text-[13px] font-semibold text-white hover:border-[#666]"
                    >
                      Back to Mainboard
                    </button>
                    <button
                      type="button"
                      onClick={() =>
                        openBatchCheckout(checkoutMode)
                      }
                      className="h-11 rounded-[7px] border border-white bg-white px-4 text-[13px] font-semibold text-black hover:bg-[#e8e8e8]"
                    >
                      Open Batch Again
                    </button>
                  </div>
                </div>
              )}
            </div>
          </section>
        </div>
      )}
    </div>
  );
}
