"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import type { ReactNode } from "react";
import { useMemo, useState } from "react";
import {
  CalendarDays,
  ChevronDown,
  Clipboard,
  FileText,
  Pencil,
  Plus,
  Trash2,
} from "lucide-react";
import { cn } from "../../../../lib/utils";
import { findMainboardInvoice, MainboardInvoice } from "../../../../lib/mainboard";
import { downloadTableReportPdf } from "../../../../lib/pdfExport";
import { AgncyPayLogo } from "../../../../components/payment/AgncyPayLogo";

const supportedCurrencies = [
  { code: "USD", label: "United States Dollars", countryCode: "us", rate: 1 },
  { code: "EUR", label: "Euro", countryCode: "eu", rate: 0.92 },
  { code: "GBP", label: "British Pound", countryCode: "gb", rate: 0.78 },
  { code: "CAD", label: "Canadian Dollar", countryCode: "ca", rate: 1.37 },
  { code: "AUD", label: "Australian Dollar", countryCode: "au", rate: 1.52 },
  { code: "AED", label: "UAE Dirham", countryCode: "ae", rate: 3.67 },
  { code: "JPY", label: "Japanese Yen", countryCode: "jp", rate: 156.8 },
  { code: "CHF", label: "Swiss Franc", countryCode: "ch", rate: 0.9 },
  { code: "CNY", label: "Chinese Yuan", countryCode: "cn", rate: 7.24 },
  { code: "HKD", label: "Hong Kong Dollar", countryCode: "hk", rate: 7.82 },
  { code: "SGD", label: "Singapore Dollar", countryCode: "sg", rate: 1.35 },
  { code: "NZD", label: "New Zealand Dollar", countryCode: "nz", rate: 1.66 },
  { code: "MXN", label: "Mexican Peso", countryCode: "mx", rate: 18.1 },
  { code: "BRL", label: "Brazilian Real", countryCode: "br", rate: 5.3 },
  { code: "INR", label: "Indian Rupee", countryCode: "in", rate: 83.4 },
  { code: "KRW", label: "South Korean Won", countryCode: "kr", rate: 1372 },
  { code: "ZAR", label: "South African Rand", countryCode: "za", rate: 18.4 },
  { code: "SAR", label: "Saudi Riyal", countryCode: "sa", rate: 3.75 },
  { code: "QAR", label: "Qatari Riyal", countryCode: "qa", rate: 3.64 },
  { code: "SEK", label: "Swedish Krona", countryCode: "se", rate: 10.6 },
  { code: "NOK", label: "Norwegian Krone", countryCode: "no", rate: 10.8 },
  { code: "DKK", label: "Danish Krone", countryCode: "dk", rate: 6.86 },
] as const;

type SupportedCurrency = (typeof supportedCurrencies)[number];

function formatCurrencyValue(value: number, currency: SupportedCurrency) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: currency.code,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value * currency.rate);
}

function FlagIcon({ countryCode, className }: { countryCode: string; className?: string }) {
  return (
    <img
      src={`https://flagcdn.com/w40/${countryCode}.png`}
      srcSet={`https://flagcdn.com/w80/${countryCode}.png 2x`}
      alt={`${countryCode.toUpperCase()} flag`}
      className={cn("h-5 w-7 rounded-[3px] object-cover", className)}
      loading="lazy"
    />
  );
}

function PayNowMark({ className }: { className?: string }) {
  return (
    <span className={cn("inline-flex items-center justify-center gap-1.5 whitespace-nowrap", className)}>
      <AgncyPayLogo className="h-[16px] w-[42px]" imageClassName="h-full w-full" />
      <span>Now</span>
    </span>
  );
}

function MModelsAvatar() {
  return (
    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-[9px] bg-white">
      <div className="text-center font-black leading-none text-[#2a73bc]">
        <div className="text-[25px] tracking-[-0.08em]">m</div>
        <div className="text-[7px] tracking-[0.04em]">MODELS</div>
      </div>
    </div>
  );
}

function FieldRow({
  label,
  value,
  icon,
}: {
  label: string;
  value: ReactNode;
  icon?: ReactNode;
}) {
  return (
    <label className="block">
      <span className="text-[14px] font-bold text-white">{label}</span>
      <div className="mt-2 flex min-h-[34px] items-center justify-between gap-3 rounded-[6px] border border-[#3a3a3a] bg-[#1b1b1b] px-3 text-[12px] font-semibold text-[#d5d5d5]">
        <span className="min-w-0 truncate">{value}</span>
        {icon}
      </div>
    </label>
  );
}

function SidebarCard({
  title,
  children,
  className,
}: {
  title?: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <section className={cn("rounded-[6px] bg-[#1b1b1b] text-[#bdbdbd]", className)}>
      {title && (
        <div className="border-b border-[#343434] px-7 py-5 text-[13px] font-bold text-[#a9a9a9]">
          {title}
        </div>
      )}
      {children}
    </section>
  );
}

function InvoiceDocument({
  invoice,
  currency,
}: {
  invoice: MainboardInvoice;
  currency: SupportedCurrency;
}) {
  const total = invoice.amount + invoice.fee;
  const formatAmount = (value: number) => formatCurrencyValue(value, currency);

  return (
    <div className="mx-auto min-h-[760px] w-full max-w-[780px] bg-white px-12 py-8 text-[#151515] shadow-2xl sm:px-16">
      <div className="flex flex-col gap-8 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <div className="text-[#2874bd]">
            <div className="text-[74px] font-black leading-[0.7] tracking-[-0.12em]">m</div>
            <div className="mt-1 text-[20px] font-black leading-none tracking-[0.02em]">MODELS</div>
          </div>
          <div className="mt-7 text-[13px] font-semibold leading-5">
            <p>Invoice To:</p>
            <p>{invoice.payer}</p>
            <br />
            <p>{invoice.payerEmail}</p>
            {invoice.payerAddress.map((line) => (
              <p key={line}>{line}</p>
            ))}
          </div>
        </div>
        <div className="min-w-[260px] text-right">
          <div className="mb-9 text-[12px] font-semibold leading-4">
            {invoice.payeeAddress.map((line) => (
              <p key={line}>{line}</p>
            ))}
          </div>
          <div className="border-t-2 border-[#6d6d6d] pt-8 text-left">
            <p className="text-[26px] font-medium">INVOICE</p>
            <div className="mt-4 grid grid-cols-[1fr_auto] gap-x-8 gap-y-1 text-[14px]">
              <span className="text-[18px] font-bold">Invoice Number</span>
              <span className="text-[18px] font-bold text-[#71306d]">{invoice.invoiceNumber}</span>
              <span className="font-bold">Invoice Date</span>
              <span>{invoice.invoiceDate}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-7 border-t-2 border-[#6d6d6d] pt-4">
        <h2 className="text-[15px] font-bold">Details</h2>
        <div className="mt-3 grid gap-x-12 gap-y-2 text-[13px] sm:grid-cols-2">
          <p><span className="inline-block w-[90px] font-semibold">Product</span>{invoice.note}</p>
          <p><span className="inline-block w-[120px] font-semibold">Job Number</span>{invoice.jobNumber}</p>
          <p><span className="inline-block w-[90px] font-semibold">Job Type</span>{invoice.jobType}</p>
          <p><span className="inline-block w-[120px] font-semibold">PO Number</span>{invoice.poNumber}</p>
          <p><span className="inline-block w-[90px] font-semibold">Dates</span>{invoice.invoiceDate} <span className="mx-7">to</span> {invoice.invoiceDate}</p>
          <p />
          <p><span className="inline-block w-[90px] font-semibold">Talent Name</span>{invoice.talentName}</p>
          <p><span className="inline-block w-[120px] font-semibold">Talent Real Name</span>{invoice.talentRealName}</p>
        </div>
      </div>

      <div className="mt-9 overflow-x-auto">
        <table className="w-full min-w-[620px] text-left text-[13px]">
          <thead>
            <tr className="border-b-2 border-[#6d6d6d]">
              <th className="py-2 font-bold">Date</th>
              <th className="py-2 font-bold">Rate Type</th>
              <th className="py-2 font-bold">Fee Type</th>
              <th className="py-2 font-bold">Note</th>
              <th className="py-2 text-right font-bold">Qty</th>
              <th className="py-2 text-right font-bold">Rate</th>
              <th className="py-2 text-right font-bold">Amount</th>
            </tr>
          </thead>
          <tbody>
            {invoice.items.map((item) => (
              <tr key={`${item.title}-${item.rate}`}>
                <td className="py-2">{item.date || ""}</td>
                <td className="py-2">{item.title}</td>
                <td className="py-2">{item.feeType}</td>
                <td className="py-2">{item.note || ""}</td>
                <td className="py-2 text-right">{item.qty}</td>
                <td className="py-2 text-right">{formatAmount(item.rate)}</td>
                <td className="py-2 text-right">{formatAmount(item.qty * item.rate)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="mt-5 grid gap-8 border-t-2 border-[#6d6d6d] pt-4 sm:grid-cols-[1fr_330px]">
        <div>
          <p className="text-[14px] font-bold">Notes</p>
        </div>
        <div className="space-y-2 text-[14px]">
          <div className="grid grid-cols-[1fr_70px_1fr] gap-3">
            <span className="font-bold">Subtotal:</span>
            <span>{currency.code}</span>
            <span className="text-right">{formatAmount(invoice.amount)}</span>
          </div>
          <div className="grid grid-cols-[1fr_70px_1fr] gap-3">
            <span className="font-bold">Agency Fee:</span>
            <span>{currency.code}</span>
            <span className="text-right">{formatAmount(invoice.fee)}</span>
          </div>
          <div className="grid grid-cols-[1fr_70px_1fr] gap-3 border-t-2 border-[#6d6d6d] pt-3 text-[20px] font-bold">
            <span>Total:</span>
            <span>{currency.code}</span>
            <span className="text-right">{formatAmount(total)}</span>
          </div>
          <div className="flex justify-end pt-4">
            <Link
              href={`/pay/${invoice.id}?mode=logged_in&returnTo=dashboard&currency=${currency.code}`}
              className="inline-flex h-[38px] items-center justify-center overflow-hidden rounded-[12px] bg-black px-4 text-[15px] font-black text-white"
            >
              <PayNowMark />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

function InvoicePreviewModal({
  invoice,
  currency,
  onClose,
}: {
  invoice: MainboardInvoice;
  currency: SupportedCurrency;
  onClose: () => void;
}) {
  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/62 px-4 py-8 backdrop-blur-[1px]">
      <div className="mx-auto flex w-full max-w-[920px] justify-end pb-3">
        <button
          type="button"
          onClick={onClose}
          className="h-9 rounded-[7px] border border-white/20 bg-black px-4 text-[12px] font-bold text-white"
        >
          Cancel
        </button>
      </div>
      <InvoiceDocument invoice={invoice} currency={currency} />
    </div>
  );
}

export default function DashboardPayFlowPage() {
  const params = useParams<{ invoiceId: string }>();
  const [showPreview, setShowPreview] = useState(false);
  const [isActionsOpen, setIsActionsOpen] = useState(false);
  const [actionMessage, setActionMessage] = useState("");
  const [reminderSent, setReminderSent] = useState(false);
  const [batchCreated, setBatchCreated] = useState(false);
  const [isNoteOpen, setIsNoteOpen] = useState(false);
  const [note, setNote] = useState("");
  const [currencyCode, setCurrencyCode] = useState<SupportedCurrency["code"]>("USD");
  const [isCurrencyOpen, setIsCurrencyOpen] = useState(false);
  const invoice = useMemo(() => findMainboardInvoice(params.invoiceId), [params.invoiceId]);

  if (!invoice) {
    return (
      <main className="min-h-screen bg-[#070707] px-5 py-12 text-white">
        <div className="mx-auto max-w-[720px] rounded-[8px] border border-[#333] bg-[#121212] p-8">
          <Link href="/dashboard" className="text-[12px] font-bold underline">
            Back to dashboard
          </Link>
          <h1 className="mt-6 text-[34px] font-black">Invoice not found</h1>
          <p className="mt-3 text-[#9a9a9a]">This dashboard payment link does not match an available invoice.</p>
        </div>
      </main>
    );
  }

  const total = invoice.amount + invoice.fee;
  const product = invoice.items[0];
  const currency = supportedCurrencies.find((item) => item.code === currencyCode) || supportedCurrencies[0];
  const displayMoney = (value: number) => formatCurrencyValue(value, currency);
  const publicInvoiceLink =
    typeof window === "undefined" ? `/dashboard/pay-flow/${invoice.id}` : window.location.href;

  const showActionMessage = (message: string) => {
    setActionMessage(message);
    window.setTimeout(() => setActionMessage(""), 2800);
  };

  const copyInvoiceLink = async () => {
    try {
      await navigator.clipboard.writeText(publicInvoiceLink);
      showActionMessage("Invoice link copied.");
    } catch {
      const copyField = document.createElement("textarea");
      copyField.value = publicInvoiceLink;
      copyField.setAttribute("readonly", "");
      copyField.style.position = "fixed";
      copyField.style.left = "-9999px";
      document.body.appendChild(copyField);
      copyField.select();
      document.execCommand("copy");
      document.body.removeChild(copyField);
      showActionMessage("Invoice link copied.");
    }
    setIsActionsOpen(false);
  };

  const downloadInvoicePdf = () => {
    downloadTableReportPdf({
      title: `Invoice ${invoice.id}`,
      subtitle: `${invoice.recipient} invoice from ${invoice.payer}. Job ${invoice.jobNumber}.`,
      filename: `${invoice.id}-dashboard-invoice.pdf`,
      summary: [
        { label: "Subtotal", value: displayMoney(invoice.amount) },
        { label: "Fee", value: displayMoney(invoice.fee) },
        { label: "Total", value: displayMoney(total) },
      ],
      columns: ["Item", "Type", "Qty", "Rate", "Amount"],
      rows: invoice.items.map((item) => [
        item.title,
        item.feeType,
        item.qty.toString(),
        displayMoney(item.rate),
        displayMoney(item.qty * item.rate),
      ]),
      footerNote: `Due ${invoice.due}. Currency ${currency.code}. Wallet ID ${invoice.walletId}.`,
    });
    showActionMessage("Invoice PDF downloaded.");
    setIsActionsOpen(false);
  };

  const handleReminder = () => {
    setReminderSent(true);
    showActionMessage("Reminder sent to recipient.");
  };

  const handleBatchPayment = () => {
    setBatchCreated(true);
    showActionMessage("Batch payment draft created.");
  };

  const handleApplyNow = () => {
    showActionMessage("Application request submitted.");
  };

  const saveNote = () => {
    showActionMessage(note.trim() ? "Note saved." : "Note cleared.");
    setIsNoteOpen(false);
  };

  return (
    <main className="min-h-screen bg-[#070707] px-5 py-10 text-white sm:px-8 lg:px-12">
      <div className="mx-auto max-w-[1180px]">
        <div className="mb-3 flex justify-end gap-3">
          <div className="relative">
            <button
              type="button"
              onClick={() => setIsActionsOpen((open) => !open)}
              className="h-11 rounded-[7px] border border-white bg-white px-8 text-[14px] font-black text-black"
            >
            More Actions
            </button>
            {isActionsOpen && (
              <div className="absolute right-0 top-[50px] z-30 w-[190px] rounded-[7px] border border-[#444] bg-[#111] p-2 shadow-2xl">
                <button
                  type="button"
                  onClick={copyInvoiceLink}
                  className="flex w-full items-center gap-2 rounded-[5px] px-3 py-2 text-left text-[12px] font-bold text-[#d8d8d8] hover:bg-white/[0.07]"
                >
                  <Clipboard className="h-4 w-4" />
                  Copy invoice link
                </button>
                <button
                  type="button"
                  onClick={downloadInvoicePdf}
                  className="flex w-full items-center gap-2 rounded-[5px] px-3 py-2 text-left text-[12px] font-bold text-[#d8d8d8] hover:bg-white/[0.07]"
                >
                  <FileText className="h-4 w-4" />
                  Download PDF
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowPreview(true);
                    setIsActionsOpen(false);
                  }}
                  className="flex w-full items-center gap-2 rounded-[5px] px-3 py-2 text-left text-[12px] font-bold text-[#d8d8d8] hover:bg-white/[0.07]"
                >
                  <Pencil className="h-4 w-4" />
                  Preview invoice
                </button>
              </div>
            )}
          </div>
          <button
            type="button"
            onClick={handleApplyNow}
            className="h-11 rounded-[7px] border border-[#424242] bg-[#191919] px-8 text-[14px] font-black text-[#bfbfbf]"
          >
            Apply Now
          </button>
        </div>
        {actionMessage && (
          <div className="mb-3 ml-auto w-fit rounded-[7px] border border-[#3f3f3f] bg-[#151515] px-4 py-2 text-[12px] font-bold text-white">
            {actionMessage}
          </div>
        )}

        <div className="grid gap-5 lg:grid-cols-[420px_minmax(0,1fr)]">
          <aside className="space-y-5">
            <Link href="/dashboard" className="text-[11px] font-bold text-[#d4d4d4] underline">
              Back to dashboard
            </Link>
            <h1 className="text-[32px] font-black leading-none text-[#d3d3d3] sm:text-[36px]">
              Invoice # {invoice.id}
            </h1>

            <SidebarCard className="flex h-14 items-center justify-between px-7">
              <span className="text-[13px] font-bold text-[#9f9f9f]">Amount Due</span>
              <span className="text-[25px] font-black text-[#d2d2d2]">{displayMoney(total)}</span>
            </SidebarCard>

            <SidebarCard title="Invoice Details">
              <div className="space-y-8 px-7 py-5">
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <p className="text-[14px] font-black text-white">Status</p>
                    <span className="mt-3 inline-flex h-8 items-center rounded-[6px] bg-[#058912] px-3 text-[12px] font-black text-[#6dff73]">
                      Due
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={handleReminder}
                    className="text-[12px] font-black text-white underline"
                  >
                    {reminderSent ? "Reminder Sent" : "Send Reminder"}
                  </button>
                </div>
                <div>
                  <p className="text-[14px] font-black text-white">Customer</p>
                  <p className="mt-2 text-[13px] font-semibold text-[#a8a8a8]">{invoice.email}</p>
                </div>
                <div>
                  <p className="text-[14px] font-black text-white">Job Date</p>
                  <p className="mt-2 text-[13px] font-semibold text-[#a8a8a8]">{invoice.invoiceDate}</p>
                </div>
                <div>
                  <p className="text-[14px] font-black text-white">Due Date</p>
                  <p className="mt-2 text-[13px] font-semibold text-[#a8a8a8]">{invoice.due}</p>
                </div>
              </div>
            </SidebarCard>

            <SidebarCard title="Invoice activity">
              <div className="px-7 py-6">
                <p className="text-[13px] font-black text-white">TODAY</p>
                {[...(reminderSent ? ["Now"] : []), "3:24 PM", "1:34 PM", "9:34 AM"].map((time) => (
                  <div key={time} className="mt-3 flex gap-2 text-[12px] leading-4">
                    <span className="mt-1 h-2.5 w-2.5 shrink-0 rounded-full bg-[#4b43ff]" />
                    <div>
                      <p className="font-black text-white">{time}</p>
                      <p className="font-semibold text-[#a4a4a4]">
                        {time === "Now"
                          ? `You sent a reminder to ${invoice.email}.`
                          : time === "3:24 PM"
                          ? `You received an invoice for ${displayMoney(total)} from ${invoice.email}.`
                          : `You received a reminder from ${invoice.email}`}
                      </p>
                    </div>
                  </div>
                ))}
                <Link href="/dashboard" className="mt-3 inline-block text-[12px] font-black text-white underline">
                  Back to dashboard
                </Link>
              </div>
            </SidebarCard>

            <button type="button" onClick={handleReminder} className="block w-full text-left">
              <SidebarCard className="flex h-14 items-center justify-between px-7 transition-colors hover:bg-[#222]">
              <span className="text-[14px] font-black text-white">Add Reminder</span>
              <Plus className="h-5 w-5" />
              </SidebarCard>
            </button>
          </aside>

          <section className="rounded-[8px] bg-black px-6 py-8 sm:px-12 sm:py-12">
            <div className="mx-auto max-w-[470px]">
              <div className="flex items-start justify-between gap-5">
                <h2 className="text-[23px] font-black">Invoice Details</h2>
                <div className="flex gap-6 text-center text-[8px] font-bold text-white">
                  <button
                    type="button"
                    onClick={copyInvoiceLink}
                    className="flex flex-col items-center gap-1 hover:text-[#d8d8d8]"
                  >
                    <Clipboard className="h-5 w-5" />
                    Copy Link
                  </button>
                  <button
                    type="button"
                    onClick={downloadInvoicePdf}
                    className="flex flex-col items-center gap-1 hover:text-[#d8d8d8]"
                  >
                    <FileText className="h-5 w-5" />
                    Download PDF
                  </button>
                </div>
              </div>

              <div className="mt-3">
                <p className="text-[14px] font-black">Recipient *</p>
                <div className="mt-2 flex min-h-[54px] items-center gap-3 rounded-[6px] bg-[#1f1f1f] px-3">
                  <MModelsAvatar />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-[15px] font-black text-[#d6d6d6]">{invoice.recipient}</p>
                    <p className="truncate text-[11px] font-semibold text-[#9b9b9b]">{invoice.email}</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => showActionMessage("Recipient details are synced from Mainboard.")}
                    aria-label="Edit recipient"
                  >
                    <Pencil className="h-6 w-6 text-[#d5d5d5]" />
                  </button>
                </div>
              </div>

              <div className="mt-4 space-y-4">
                <FieldRow label="Job Date" value={invoice.invoiceDate} />
                <FieldRow label="Due Date" value={invoice.due} icon={<CalendarDays className="h-4 w-4 text-[#cfcfcf]" />} />
                <label className="block">
                  <span className="text-[14px] font-bold text-white">Currency *</span>
                  <div className="relative mt-2">
                    <button
                      type="button"
                      onClick={() => setIsCurrencyOpen((open) => !open)}
                      className="flex h-[38px] w-full items-center justify-between rounded-[6px] border border-[#3a3a3a] bg-[#1b1b1b] px-3 text-left outline-none hover:border-[#5a5a5a] focus:border-[#6a6a6a]"
                      aria-expanded={isCurrencyOpen}
                    >
                      <span className="flex min-w-0 items-center gap-3">
                        <FlagIcon countryCode={currency.countryCode} className="h-5 w-7" />
                        <span className="min-w-0">
                          <span className="block text-[12px] font-black text-white">{currency.code}</span>
                          <span className="block truncate text-[11px] font-semibold text-[#9f9f9f]">{currency.label}</span>
                        </span>
                      </span>
                      <ChevronDown className={cn("h-4 w-4 shrink-0 text-[#cfcfcf] transition-transform", isCurrencyOpen && "rotate-180")} />
                    </button>
                    {isCurrencyOpen && (
                      <div className="absolute left-0 right-0 top-[44px] z-30 max-h-[260px] overflow-y-auto rounded-[7px] border border-[#3a3a3a] bg-[#111] p-1 shadow-2xl">
                        {supportedCurrencies.map((item) => {
                          const selected = item.code === currencyCode;

                          return (
                            <button
                              key={item.code}
                              type="button"
                              onClick={() => {
                                setCurrencyCode(item.code);
                                setIsCurrencyOpen(false);
                                showActionMessage(`Currency changed to ${item.code}.`);
                              }}
                              className={cn(
                                "flex min-h-[48px] w-full items-center justify-between gap-3 rounded-[5px] px-3 text-left hover:bg-white/[0.07]",
                                selected && "bg-white/[0.1]"
                              )}
                            >
                              <span className="flex min-w-0 items-center gap-3">
                                <FlagIcon countryCode={item.countryCode} className="h-6 w-8" />
                                <span className="min-w-0">
                                  <span className="block text-[12px] font-black text-white">{item.code}</span>
                                  <span className="block truncate text-[11px] font-semibold text-[#a8a8a8]">{item.label}</span>
                                </span>
                              </span>
                              {selected && <span className="h-2.5 w-2.5 shrink-0 rounded-full bg-[#19d36b]" />}
                            </button>
                          );
                        })}
                      </div>
                    )}
                  </div>
                </label>
              </div>

              <div className="my-7 border-t border-[#2e2e2e]" />

              <h3 className="text-[21px] font-black">Product</h3>
              <div className="mt-3 grid grid-cols-[1fr_54px_62px_88px] gap-2 text-[13px] font-black text-white">
                <span>Item/Job</span>
                <span>Qty</span>
                <span>Rate</span>
                <span>%</span>
              </div>
              <div className="mt-1 grid min-h-[51px] grid-cols-[1fr_54px_62px_88px] items-center gap-2 rounded-[6px] border border-[#3a3a3a] bg-[#1d1d1d] px-2 text-[11px]">
                <div className="flex min-w-0 items-center gap-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-black text-[9px] font-black italic">NIKE</div>
                  <div className="min-w-0">
                    <p className="truncate font-black text-white">{product?.title || invoice.jobType}</p>
                    <p className="font-bold text-[#b0b0b0]">{displayMoney(product?.qty && product?.rate ? product.qty * product.rate : invoice.amount)}</p>
                  </div>
                </div>
                <span className="flex h-8 items-center justify-center rounded-[2px] border border-[#444] bg-[#202020] text-white">{product?.qty || 1}</span>
                <span className="text-[10px] font-bold">{displayMoney(product?.rate || invoice.amount)}</span>
                <span className="flex items-center justify-between rounded-[2px] border border-[#444] bg-[#202020] px-2 py-2 font-black">
                  80%
                  <button
                    type="button"
                    onClick={() => showActionMessage("Line item is locked for this synced invoice.")}
                    aria-label="Remove line item"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </span>
              </div>

              <button
                type="button"
                onClick={handleBatchPayment}
                className="mt-4 h-9 w-full rounded-[5px] bg-[#2b2b2b] text-[11px] font-black text-[#d0d0d0] hover:bg-[#343434]"
              >
                {batchCreated ? "Batch Payment Draft Created" : "+ Create Batch Payment"}
              </button>
              <div className="mt-4 flex justify-end">
                <button
                  type="button"
                  onClick={() => setIsNoteOpen((open) => !open)}
                  className="h-8 min-w-[160px] rounded-[5px] border border-[#3a3a3a] bg-[#171717] text-[11px] font-black text-[#d0d0d0] hover:border-[#555]"
                >
                  Add Note
                </button>
              </div>
              {isNoteOpen && (
                <div className="mt-3 rounded-[6px] border border-[#3a3a3a] bg-[#121212] p-3">
                  <textarea
                    value={note}
                    onChange={(event) => setNote(event.target.value)}
                    placeholder="Add internal payment note..."
                    className="min-h-[74px] w-full resize-none rounded-[5px] border border-[#333] bg-black p-3 text-[12px] font-semibold text-white outline-none placeholder:text-[#656565] focus:border-[#666]"
                  />
                  <div className="mt-2 flex justify-end gap-2">
                    <button
                      type="button"
                      onClick={() => setIsNoteOpen(false)}
                      className="h-8 rounded-[5px] border border-[#333] px-3 text-[11px] font-bold text-white"
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      onClick={saveNote}
                      className="h-8 rounded-[5px] border border-white bg-white px-3 text-[11px] font-bold text-black"
                    >
                      Save Note
                    </button>
                  </div>
                </div>
              )}
              {note.trim() && !isNoteOpen && (
                <p className="mt-3 rounded-[5px] border border-[#333] bg-[#141414] px-3 py-2 text-[12px] font-semibold text-[#d0d0d0]">
                  {note}
                </p>
              )}

              <div className="mt-5 rounded-[6px] bg-[#1b1b1b] p-3 text-[#d0d0d0]">
                <div className="flex justify-between text-[14px] font-semibold">
                  <span>Sub Total:</span>
                  <span className="font-black">{displayMoney(invoice.amount)}</span>
                </div>
                <div className="mt-3 flex justify-between text-[14px] font-semibold">
                  <span>Fee:</span>
                  <span className="font-black">{displayMoney(invoice.fee)}</span>
                </div>
                <div className="mt-3 flex justify-between text-[14px] font-semibold">
                  <span>Total:</span>
                  <span className="text-[24px] font-black">{displayMoney(total)}</span>
                </div>
              </div>

              <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <p className="text-[9px] font-black text-[#d2d2d2]">Last Updated: Tuesday at 2:27 PM</p>
                <div className="flex gap-3">
                  <Link
                    href="/dashboard"
                    className="inline-flex h-11 min-w-[104px] items-center justify-center rounded-[6px] bg-[#ff4e2f] text-[14px] font-black text-white hover:bg-[#ff684d]"
                  >
                    Cancel
                  </Link>
                  <button
                    type="button"
                    onClick={() => setShowPreview(true)}
                    className="inline-flex h-11 min-w-[104px] items-center justify-center overflow-hidden rounded-[6px] border border-[#3a3a3a] bg-black px-3 text-[13px] font-black text-white hover:border-[#666] hover:bg-[#111]"
                  >
                    <PayNowMark />
                  </button>
                </div>
              </div>
            </div>
          </section>
        </div>
      </div>

      {showPreview && <InvoicePreviewModal invoice={invoice} currency={currency} onClose={() => setShowPreview(false)} />}
    </main>
  );
}
