"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import {
  ArrowLeft,
  BriefcaseBusiness,
  CheckCircle2,
  ChevronDown,
  CreditCard,
  FileText,
  GripVertical,
  Landmark,
  MoreVertical,
  Search,
  Send,
  Settings,
  Split,
  Trash2,
  Users,
  Wand2,
  X,
} from "lucide-react";
import { FinanceInvoicesSection } from "../../../components/dashboard/FinanceInvoicesSection";
import { AgncyPayLogo } from "../../../components/payment/AgncyPayLogo";
import { getInvoicesForRecipient } from "../../../lib/finance-dashboard-invoices";
import { type MainboardInvoice } from "../../../lib/mainboard";
import { cn } from "../../../lib/utils";

type TransferMode = "send" | "request";
type TransferStage = "search" | "invoices" | "amount" | "success";

const BOFA_BUSINESS_DEBIT_VISA_IMAGE =
  "https://business.bankofamerica.com/content/dam/consumer/business/deposits/checking-accounts/debit-cards/bofa_busdbtcm_v.png";

type Recipient = {
  id: string;
  name: string;
  handle: string;
  email: string;
  mobile: string;
  type: "user" | "brand";
  color: string;
  amount: number;
  rate: string;
};

const recipients: Recipient[] = [
  {
    id: "john-adams",
    name: "John Adams",
    handle: "@agncy11174",
    email: "john@westernmodels.com",
    mobile: "+1 (555) 810-1174",
    type: "user",
    color: "from-[#5a382c] to-[#1a1513]",
    amount: 7840.25,
    rate: "$250/hr",
  },
  {
    id: "amy-holland",
    name: "Amy Holland",
    handle: "@agncy65122",
    email: "amy@studioholland.com",
    mobile: "+1 (555) 324-6512",
    type: "user",
    color: "from-[#7d5c44] to-[#1d1410]",
    amount: 4200,
    rate: "$175/hr",
  },
  {
    id: "lucy-che",
    name: "Lucy Che",
    handle: "@agncy88179",
    email: "lucy@chetalent.com",
    mobile: "+1 (555) 881-7900",
    type: "user",
    color: "from-[#7b3d4e] to-[#1e1116]",
    amount: 3250.5,
    rate: "$200/hr",
  },
  {
    id: "jessica-bailey",
    name: "Jessica Bailey",
    handle: "@agncy67171",
    email: "jessica@baileycreative.com",
    mobile: "+1 (555) 671-7100",
    type: "user",
    color: "from-[#9d6556] to-[#25110e]",
    amount: 1800,
    rate: "$150/hr",
  },
  {
    id: "lola-durant",
    name: "Lola Durant",
    handle: "@agncy72176",
    email: "lola@duranttalent.com",
    mobile: "+1 (555) 721-7600",
    type: "user",
    color: "from-[#8f6c3e] to-[#1c1710]",
    amount: 9600,
    rate: "$300/hr",
  },
  {
    id: "nike",
    name: "Nike",
    handle: "@nike",
    email: "treasury@nike.com",
    mobile: "+1 (503) 671-6453",
    type: "brand",
    color: "from-[#2b2b2b] to-[#050505]",
    amount: 12500,
    rate: "Campaign",
  },
  {
    id: "bank-of-america",
    name: "Bank of America",
    handle: "@bankofamerica",
    email: "business@bofa.com",
    mobile: "+1 (800) 432-1000",
    type: "brand",
    color: "from-[#1f4c98] to-[#11213f]",
    amount: 2840.25,
    rate: "Bank transfer",
  },
];

const moreOptions = [
  { label: "Split Payout", icon: Users, href: "/dashboard/splits" },
  { label: "Multi Payout", icon: Wand2, href: "/dashboard/payouts" },
  { label: "Send an invoice", icon: FileText, href: "/dashboard/invoices" },
  { label: "Apply for AgncyPay card", icon: CreditCard, href: "/dashboard/wallet/link" },
] as const;

const currencies = [
  { code: "GBP", name: "British Pound", countryCode: "gb", rate: 0.78 },
  { code: "AED", name: "United Arab Emirates Dirham", countryCode: "ae", rate: 3.67 },
  { code: "EUR", name: "Euro", countryCode: "eu", rate: 0.92 },
  { code: "USD", name: "United States Dollar", countryCode: "us", rate: 1 },
  { code: "AUD", name: "Australian Dollar", countryCode: "au", rate: 1.52 },
  { code: "BAM", name: "Bosnia-Herzegovina Convertible Mark", countryCode: "ba", rate: 1.8 },
  { code: "BGN", name: "Bulgarian Lev", countryCode: "bg", rate: 1.8 },
  { code: "BHD", name: "Bahraini Dinar", countryCode: "bh", rate: 0.38 },
  { code: "BIF", name: "Burundian Franc", countryCode: "bi", rate: 2870 },
  { code: "BOB", name: "Bolivian Boliviano", countryCode: "bo", rate: 6.91 },
  { code: "BRL", name: "Brazilian Real", countryCode: "br", rate: 5.3 },
  { code: "ARS", name: "Argentine Peso", countryCode: "ar", rate: 894 },
] as const;

type Currency = (typeof currencies)[number];
type CurrencyCode = Currency["code"];

const batchInvoices = [
  { id: "QB-inv#29475 - 2918...", requested: "paid", status: "Done", due: 27, amount: 1500, currency: "USD" as CurrencyCode, client: "Nike, Inc." },
  { id: "QB-inv#38485 - 2299...", requested: "request", status: "In Process", due: 2, amount: 5400, currency: "USD" as CurrencyCode, client: "The Gap, Inc." },
  { id: "QB-inv#88573 - 8857...", requested: "request", status: "In Process", due: 20, amount: 12000, currency: "USD" as CurrencyCode, client: "Levi Strauss & Co." },
  { id: "QB-inv#88442 - 1184...", requested: "request", status: "In Process", due: 19, amount: 2800, currency: "EUR" as CurrencyCode, client: "Adidas AG" },
  { id: "QB-inv#99781 - 7463...", requested: "paid", status: "Done", due: 25, amount: 1200, currency: "GBP" as CurrencyCode, client: "Burberry Group plc" },
  { id: "QB-inv#77362 - 9911...", requested: "paid", status: "Done", due: 7, amount: 800.65, currency: "GBP" as CurrencyCode, client: "Timberland LLC" },
  { id: "QB-inv#65622 - 7712...", requested: "paid", status: "Done", due: 30, amount: 1100.11, currency: "USD" as CurrencyCode, client: "Levi Strauss & Co." },
];

function formatAmount(value: number, currency: CurrencyCode) {
  const selectedCurrency = currencies.find((item) => item.code === currency) || currencies[0];

  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
    maximumFractionDigits: 2,
  }).format(value * selectedCurrency.rate);
}

function FlagIcon({ countryCode, className }: { countryCode: string; className?: string }) {
  return (
    <img
      src={`https://flagcdn.com/w40/${countryCode}.png`}
      srcSet={`https://flagcdn.com/w80/${countryCode}.png 2x`}
      alt={`${countryCode.toUpperCase()} flag`}
      className={cn("h-6 w-8 rounded-[3px] object-cover", className)}
      loading="lazy"
    />
  );
}

function RecipientAvatar({ recipient, size = "md" }: { recipient: Recipient; size?: "sm" | "md" | "lg" }) {
  const initials = recipient.name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2);

  return (
    <div
      className={cn(
        "flex shrink-0 items-center justify-center overflow-hidden rounded-[6px] border border-white/10 bg-gradient-to-br text-center font-black text-white",
        recipient.color,
        size === "sm" && "h-10 w-10 text-[11px]",
        size === "md" && "h-14 w-14 text-[14px]",
        size === "lg" && "h-[74px] w-[74px] text-[18px]"
      )}
    >
      {recipient.type === "brand" ? (
        <BriefcaseBusiness className="h-6 w-6" />
      ) : (
        <span>{initials}</span>
      )}
    </div>
  );
}

function TopBar() {
  return (
    <header className="flex flex-nowrap items-center justify-between gap-4 pb-4">
      <div className="flex min-w-0 flex-nowrap items-center gap-2 overflow-x-auto">
        {/*
        <Link
          href="/dashboard/booking"
          className="inline-flex h-9 shrink-0 items-center rounded-[4px] border border-white bg-white px-4 text-[12px] font-semibold uppercase text-[#1a1a1a]"
        >
          Booking Dashboard
        </Link>
        */}
        <Link
          href="/dashboard"
          className="inline-flex h-9 shrink-0 items-center rounded-[4px] border border-white bg-white px-4 text-[12px] font-semibold uppercase text-[#3971b6]"
        >
          Finance Dashboard
        </Link>
        <Link
          href="/dashboard/settings"
          className="inline-flex h-9 w-11 shrink-0 items-center justify-center rounded-[4px] border border-white bg-white text-[#3971b6]"
          aria-label="Settings"
        >
          <Settings className="h-5 w-5" />
        </Link>
      </div>
      <img src="/agncypaybrand.png" alt="AgncyPay" className="h-[52px] w-auto shrink-0 object-contain scale-[1.5] origin-right" />
    </header>
  );
}

function FooterBar() {
  return (
    <footer className="mt-16 border-y border-[#343434]">
      <div className="mx-auto flex max-w-[1040px] flex-wrap items-center justify-center gap-8 px-4 py-8 text-[12px] font-bold text-white">
        <AgncyPayLogo className="h-[20px] w-[50px]" imageClassName="h-full w-full" />
        <Link href="/dashboard/support">Help</Link>
        <Link href="/dashboard/support">Contact Us</Link>
        <Link href="/dashboard/verification">Security</Link>
        <Link href="/dashboard/settings">Fees</Link>
      </div>
    </footer>
  );
}

function CurrencyPickerModal({
  selectedCurrency,
  search,
  onSearchChange,
  onSelect,
  onClose,
}: {
  selectedCurrency: Currency;
  search: string;
  onSearchChange: (value: string) => void;
  onSelect: (currency: Currency) => void;
  onClose: () => void;
}) {
  const filteredCurrencies = currencies.filter((currency) =>
    [currency.code, currency.name].join(" ").toLowerCase().includes(search.trim().toLowerCase())
  );

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/62 px-4 py-10 backdrop-blur-[1px]">
      <div className="mx-auto w-full max-w-[840px]">
        <div className="relative">
          <Search className="pointer-events-none absolute left-6 top-1/2 h-5 w-5 -translate-y-1/2 text-[#858585]" />
          <input
            autoFocus
            value={search}
            onChange={(event) => onSearchChange(event.target.value)}
            placeholder="Search currency by name or code"
            className="h-[58px] w-full rounded-full border border-[#323232] bg-[#1f1f1f] pl-16 pr-14 text-[22px] font-black text-white outline-none placeholder:text-[#777] focus:border-[#6a6a6a]"
          />
          <button
            type="button"
            onClick={onClose}
            className="absolute right-5 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full text-[#cfcfcf] hover:bg-white/[0.08]"
            aria-label="Close currency selector"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="mt-3 min-h-[680px] rounded-[3px] bg-[#252322] px-8 py-7 sm:px-28">
          <p className="mb-8 text-[10px] font-black text-white">Recent searches</p>
          <div className="space-y-3">
            {filteredCurrencies.map((currency) => {
              const isSelected = currency.code === selectedCurrency.code;

              return (
                <button
                  key={currency.code}
                  type="button"
                  onClick={() => onSelect(currency)}
                  className={cn(
                    "flex min-h-[60px] w-full items-center justify-between gap-4 rounded-[7px] px-4 text-left",
                    isSelected ? "bg-black" : "hover:bg-black/35"
                  )}
                >
                  <span className="flex min-w-0 items-center gap-4">
                    <FlagIcon countryCode={currency.countryCode} className="h-8 w-11" />
                    <span className="min-w-0">
                      <span className="block truncate text-[14px] font-black text-white">{currency.name}</span>
                      <span className="block text-[13px] font-black text-white">{currency.code}</span>
                    </span>
                  </span>
                  {isSelected && (
                    <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[#00ef27] text-black">
                      <CheckCircle2 className="h-4 w-4" />
                    </span>
                  )}
                </button>
              );
            })}
            {filteredCurrencies.length === 0 && (
              <div className="rounded-[7px] border border-[#454545] bg-black/25 px-4 py-5 text-[13px] font-bold text-[#bdbdbd]">
                No currency found.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function BatchPaymentModal({
  selectedIds,
  onToggle,
  onToggleAll,
  onClose,
  onCreate,
}: {
  selectedIds: string[];
  onToggle: (id: string) => void;
  onToggleAll: () => void;
  onClose: () => void;
  onCreate: () => void;
}) {
  const allSelected = selectedIds.length === batchInvoices.length;
  const selectedTotal = batchInvoices
    .filter((invoice) => selectedIds.includes(invoice.id))
    .reduce((total, invoice) => total + invoice.amount, 0);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-black/62 px-4 py-8 backdrop-blur-[1px]">
      <div className="w-full max-w-[1180px] overflow-hidden rounded-[9px] border border-[#343434] bg-[#080808] shadow-2xl">
        <div className="grid h-14 grid-cols-[42px_44px_minmax(220px,1.35fr)_160px_150px_90px_150px_minmax(150px,1fr)_34px] items-center border-b border-[#272727] bg-[#222] text-[15px] font-black text-white">
          <div className="flex h-full items-center justify-center bg-[#22a92d] text-white">
            <span className="rounded-full bg-[#1a8f25] px-1.5 py-1 text-[16px] leading-none">qb</span>
          </div>
          <label className="flex justify-center">
            <input
              type="checkbox"
              checked={allSelected}
              onChange={onToggleAll}
              aria-label="Select all batch invoices"
              className="h-5 w-5 rounded border-[#444] bg-black accent-white"
            />
          </label>
          <span>Invoice(s)</span>
          <span>Requested</span>
          <span>Status</span>
          <span>Due</span>
          <span>Amount</span>
          <span>Client</span>
          <button type="button" onClick={onClose} aria-label="Close batch payment">
            <X className="h-5 w-5 text-[#cfcfcf]" />
          </button>
        </div>

        <div className="max-h-[520px] overflow-y-auto">
          {batchInvoices.map((invoice) => {
            const checked = selectedIds.includes(invoice.id);

            return (
              <div
                key={invoice.id}
                className={cn(
                  "grid min-h-[66px] grid-cols-[42px_44px_minmax(220px,1.35fr)_160px_150px_90px_150px_minmax(150px,1fr)_34px] items-center border-b border-[#202020] text-[15px] font-black",
                  checked ? "bg-white/[0.04]" : "bg-[#090909]"
                )}
              >
                <div className="flex justify-center text-[#8b8b8b]">
                  <GripVertical className="h-4 w-4" />
                </div>
                <label className="flex justify-center">
                  <input
                    type="checkbox"
                    checked={checked}
                    onChange={() => onToggle(invoice.id)}
                    aria-label={`Select ${invoice.id}`}
                    className="h-5 w-5 rounded border-[#444] bg-black accent-white"
                  />
                </label>
                <span className="truncate pr-4">{invoice.id}</span>
                <span>
                  {invoice.requested === "paid" ? (
                    <span className="inline-flex h-9 min-w-[76px] items-center justify-center rounded-full border border-[#10b95f] bg-[#082315] px-3 text-[#70ff9e]">
                      <img src="/AlogoTransparent.png" alt="A" className="h-[26px] w-[26px] rounded-[3px] object-contain" />
                      <span className="ml-1 text-[13px] font-black uppercase tracking-wide">Paid</span>
                    </span>
                  ) : (
                    <button
                      type="button"
                      onClick={() => onToggle(invoice.id)}
                      className="inline-flex h-7 w-full max-w-[152px] items-center justify-center gap-1 rounded-full border border-[#ff8a00] bg-[#261603] px-2 text-[10px] uppercase text-white hover:bg-[#3a200a]"
                    >
                      <span className="font-bold leading-none">Request Pay</span>
                      <img src="/AlogoTransparent.png" alt="A" className="h-[18px] w-[18px] shrink-0 rounded-[3px] object-contain" />
                      <span className="font-bold leading-none">Pay</span>
                    </button>
                  )}
                </span>
                <span>
                  <span className="inline-flex h-8 items-center gap-2 rounded-full border border-[#242424] bg-black px-3 text-[#9d9d9d]">
                    {invoice.status === "Done" ? (
                      <CheckCircle2 className="h-4 w-4 text-[#08d66c]" />
                    ) : (
                      <span className="h-4 w-4 rounded-full border border-[#777]" />
                    )}
                    {invoice.status}
                  </span>
                </span>
                <span>{invoice.due}</span>
                <span>{formatAmount(invoice.amount, invoice.currency)}</span>
                <span className="truncate pr-3">{invoice.client}</span>
                <button type="button" aria-label={`More actions for ${invoice.id}`}>
                  <MoreVertical className="h-5 w-5 text-[#8f8f8f]" />
                </button>
              </div>
            );
          })}
        </div>

        <div className="flex flex-col gap-3 border-t border-[#252525] bg-[#0b0b0b] px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="text-[13px] font-bold text-[#cfcfcf]">
            {selectedIds.length} invoice{selectedIds.length === 1 ? "" : "s"} selected - Approx. total {formatAmount(selectedTotal, "USD")}
          </div>
          <div className="flex gap-3">
            <button
              type="button"
              onClick={onClose}
              className="h-9 rounded-[6px] border border-[#ff4e2f] bg-[#ff4e2f] px-4 text-[12px] font-black text-white hover:bg-[#ff684d]"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={onCreate}
              disabled={selectedIds.length === 0}
              className="h-9 rounded-[6px] border border-white bg-white px-4 text-[12px] font-black text-black hover:bg-[#e5e5e5] disabled:cursor-not-allowed disabled:opacity-50"
            >
              Create Batch Payment
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function SendRequestPage() {
  const [mode, setMode] = useState<TransferMode>("send");
  const [stage, setStage] = useState<TransferStage>("search");
  const [query, setQuery] = useState("");
  const [selectedId, setSelectedId] = useState(recipients[0].id);
  const [currency, setCurrency] = useState<CurrencyCode>("USD");
  const [amount, setAmount] = useState(recipients[0].amount.toFixed(2));
  const [message, setMessage] = useState("");
  const [splitEnabled, setSplitEnabled] = useState(false);
  const [batchCreated, setBatchCreated] = useState(false);
  const [multiPayout, setMultiPayout] = useState(false);
  const [isCurrencyOpen, setIsCurrencyOpen] = useState(false);
  const [currencySearch, setCurrencySearch] = useState("");
  const [isBatchOpen, setIsBatchOpen] = useState(false);
  const [batchSelectedIds, setBatchSelectedIds] = useState<string[]>(() =>
    batchInvoices.filter((invoice) => invoice.requested === "request").map((invoice) => invoice.id)
  );
  const [selectedInvoiceId, setSelectedInvoiceId] = useState<string | null>(null);
  const [autosplitInvoiceIds, setAutosplitInvoiceIds] = useState<string[]>([]);

  const selectedRecipient = recipients.find((recipient) => recipient.id === selectedId) || recipients[0];
  const recipientInvoices = getInvoicesForRecipient(selectedRecipient.id, selectedRecipient.name);
  const selectedCurrency = currencies.find((item) => item.code === currency) || currencies[0];
  const amountValue = Number(amount) || 0;
  const splitPercent = 80;
  const talentAmount = amountValue * (splitPercent / 100);
  const fee = Math.max(3.25, amountValue * 0.00042);
  const total = amountValue;
  const recipientGets = mode === "send" ? Math.max(0, talentAmount - fee) : talentAmount;

  const filteredRecipients = useMemo(() => {
    const normalized = query.trim().toLowerCase();

    if (!normalized) return recipients.slice(0, 5);

    return recipients.filter((recipient) =>
      [recipient.name, recipient.handle, recipient.email, recipient.mobile, recipient.type]
        .join(" ")
        .toLowerCase()
        .includes(normalized)
    );
  }, [query]);

  const selectRecipient = (recipient: Recipient) => {
    setSelectedId(recipient.id);
    setAmount(recipient.amount.toFixed(2));
    setSelectedInvoiceId(null);
    setAutosplitInvoiceIds([]);
    setStage("invoices");
    setMessage("");
  };

  const selectInvoice = (invoice: MainboardInvoice) => {
    setSelectedInvoiceId(invoice.id);
    setAmount((invoice.amount + invoice.fee).toFixed(2));
    setStage("amount");
    setMessage("");
  };

  const toggleAutosplitInvoice = (invoiceId: string) => {
    setAutosplitInvoiceIds((current) =>
      current.includes(invoiceId) ? current.filter((id) => id !== invoiceId) : [...current, invoiceId]
    );
  };

  const showMessage = (value: string) => {
    setMessage(value);
    window.setTimeout(() => setMessage(""), 2600);
  };

  const toggleBatchInvoice = (invoiceId: string) => {
    setBatchSelectedIds((current) =>
      current.includes(invoiceId) ? current.filter((id) => id !== invoiceId) : [...current, invoiceId]
    );
  };

  const toggleAllBatchInvoices = () => {
    setBatchSelectedIds((current) =>
      current.length === batchInvoices.length ? [] : batchInvoices.map((invoice) => invoice.id)
    );
  };

  return (
    <main className="min-h-screen bg-[#080808] text-white">
      <div className="mx-auto flex min-h-screen w-full max-w-[1480px] flex-col px-5 py-4 sm:px-7 lg:px-10">
        <TopBar />

        {stage === "search" && (
          <section className="mx-auto grid w-full max-w-[720px] flex-1 grid-cols-1 content-start gap-12 pb-8 pt-20 lg:max-w-[760px] xl:max-w-[920px] xl:grid-cols-[1fr_280px] xl:pt-24">
            <div>
              <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
                <h1 className="text-[20px] font-black tracking-[-0.01em]">Send and request money</h1>
                <div className="inline-flex rounded-full border border-[#343434] bg-[#111] p-1">
                  {(["send", "request"] as const).map((item) => (
                    <button
                      key={item}
                      type="button"
                      onClick={() => setMode(item)}
                      className={cn(
                        "h-8 rounded-full px-4 text-[12px] font-black capitalize",
                        mode === item ? "bg-white text-black" : "text-[#bdbdbd]"
                      )}
                    >
                      {item}
                    </button>
                  ))}
                </div>
              </div>

              <div className="rounded-[7px] bg-[#2b2929] pb-5">
                <label className="relative block">
                  <Search className="pointer-events-none absolute left-5 top-1/2 h-5 w-5 -translate-y-1/2 text-[#898989]" />
                  <input
                    autoFocus
                    value={query}
                    onChange={(event) => setQuery(event.target.value)}
                    placeholder="Name, Agency ID, email, mobile"
                    className="h-[56px] w-full rounded-full border border-[#5b5959] bg-[#302e2e] pl-14 pr-5 text-[13px] font-bold text-white outline-none placeholder:text-[#8d8b8b] focus:border-[#9a9a9a]"
                  />
                </label>

                <div className="px-4 pt-5">
                  <p className="mb-3 text-[11px] font-black text-white">
                    {query.trim() ? "Search results" : "Recent searches"}
                  </p>
                  <div className="space-y-3">
                    {filteredRecipients.map((recipient) => (
                      <button
                        key={recipient.id}
                        type="button"
                        onClick={() => selectRecipient(recipient)}
                        className="flex w-full items-center gap-4 rounded-[7px] px-2 py-1.5 text-left transition-colors hover:bg-white/[0.06]"
                      >
                        <RecipientAvatar recipient={recipient} size="sm" />
                        <span className="min-w-0">
                          <span className="block truncate text-[14px] font-black text-white">{recipient.name}</span>
                          <span className="block truncate text-[10px] font-bold text-[#c4c4c4]">{recipient.handle}</span>
                        </span>
                      </button>
                    ))}
                    {filteredRecipients.length === 0 && (
                      <div className="rounded-[7px] border border-[#454545] bg-black/25 px-4 py-5 text-[13px] font-bold text-[#bdbdbd]">
                        No recipient found. Try a name, agency ID, email, or mobile number.
                      </div>
                    )}
                  </div>
                  <div className="mt-4 flex justify-center">
                    <button
                      type="button"
                      onClick={() => setQuery("")}
                      className="text-[12px] font-black text-[#22e03b] underline"
                    >
                      Clear all
                    </button>
                  </div>
                </div>
              </div>
            </div>

            <aside className="pt-1">
              <h2 className="mb-7 text-[20px] font-black">More options</h2>
              <div className="space-y-6">
                {moreOptions.map((option) => {
                  const Icon = option.icon;
                  return (
                    <Link
                      key={option.label}
                      href={option.href}
                      className="flex items-center gap-5 text-[14px] font-black text-white hover:text-[#d7d7d7]"
                    >
                      <span className="flex h-9 w-9 items-center justify-center">
                        <Icon className="h-8 w-8" />
                      </span>
                      {option.label}
                    </Link>
                  );
                })}
              </div>
            </aside>
          </section>
        )}

        {stage === "invoices" && (
          <section className="mx-auto w-full max-w-[1180px] flex-1 pb-8 pt-8 sm:pt-12">
            <button
              type="button"
              onClick={() => setStage("search")}
              className="mb-6 inline-flex items-center gap-2 text-[13px] font-black text-[#bdbdbd] transition-colors hover:text-white"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to search
            </button>

            <div className="mb-6 flex items-center gap-4">
              <RecipientAvatar recipient={selectedRecipient} size="md" />
              <div className="min-w-0">
                <h1 className="truncate text-[24px] font-black text-white sm:text-[28px]">{selectedRecipient.name}</h1>
                <p className="mt-1 text-[13px] font-bold text-[#8f8f8f]">{selectedRecipient.handle}</p>
                <p className="mt-1 text-[12px] font-semibold text-[#6f6f6f]">
                  {recipientInvoices.length} invoice{recipientInvoices.length === 1 ? "" : "s"} — select one to{" "}
                  {mode === "send" ? "send" : "request"} payment
                </p>
              </div>
            </div>

            <FinanceInvoicesSection
              invoices={recipientInvoices}
              autosplitInvoiceIds={autosplitInvoiceIds}
              onToggleAutosplit={toggleAutosplitInvoice}
              onInvoiceSelect={selectInvoice}
              subtitle={`Invoices for ${selectedRecipient.name}. Select an invoice to continue.`}
              showOpenInvoicesLink={false}
            />
          </section>
        )}

        {stage === "amount" && (
          <section className="mx-auto flex w-full max-w-[540px] flex-1 flex-col justify-start pb-8 pt-12 sm:pt-16">
            {message && (
              <div className="mb-4 rounded-[7px] border border-[#3c3c3c] bg-[#151515] px-4 py-2 text-[12px] font-bold">
                {message}
              </div>
            )}

            <button
              type="button"
              onClick={() => setStage("invoices")}
              className="mb-4 inline-flex items-center gap-2 text-[13px] font-black text-[#bdbdbd] transition-colors hover:text-white"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to invoices
            </button>

            <div className="rounded-[9px] border border-[#444] bg-[#1a1a1a] px-9 py-10">
              <div className="flex items-center justify-center gap-4">
                <RecipientAvatar recipient={selectedRecipient} size="lg" />
                <div className="min-w-0">
                  <h1 className="truncate text-[28px] font-black leading-none">{selectedRecipient.name}</h1>
                  <p className="mt-2 text-[14px] font-black text-white">{selectedRecipient.handle}</p>
                  {selectedInvoiceId && (
                    <p className="mt-1 font-mono text-[12px] font-bold text-[#8f8f8f]">{selectedInvoiceId}</p>
                  )}
                </div>
              </div>

              <div className="mt-8 flex items-end justify-between gap-4">
                <input
                  value={amount}
                  onChange={(event) => setAmount(event.target.value.replace(/[^\d.]/g, ""))}
                  inputMode="decimal"
                  aria-label="Transfer amount"
                  className="min-w-0 flex-1 bg-transparent text-[40px] font-black leading-none text-[#c9c9c9] outline-none"
                />
                <button
                  type="button"
                  onClick={() => {
                    setCurrencySearch("");
                    setIsCurrencyOpen(true);
                  }}
                  className="inline-flex h-10 shrink-0 items-center gap-2 rounded-[7px] border border-[#484848] bg-[#181818] px-4 text-[14px] font-black text-white hover:border-[#777]"
                  aria-label="Select currency"
                >
                  <FlagIcon countryCode={selectedCurrency.countryCode} className="h-5 w-7" />
                  {selectedCurrency.code}
                  <ChevronDown className="h-4 w-4 text-white" />
                </button>
              </div>
            </div>

            <div className="mt-5 rounded-[8px] border border-[#3c3c3c] bg-black px-8 py-7">
              <div className="grid grid-cols-[1fr_48px_54px_78px_28px] items-center gap-2 text-[12px] font-black">
                <span className="text-center">Name/Total</span>
                <span>Qty</span>
                <span>Rate</span>
                <span>%</span>
                <span />
              </div>

              <div className="mt-2 grid min-h-[48px] grid-cols-[1fr_48px_54px_78px_28px] items-center gap-2 rounded-[5px] bg-[#242424] px-3">
                <div className="flex min-w-0 items-center gap-3">
                  <RecipientAvatar recipient={selectedRecipient} size="sm" />
                  <div className="min-w-0">
                    <p className="truncate text-[11px] font-black">{selectedRecipient.name}</p>
                    <p className="text-[9px] font-bold text-[#c7c7c7]">{formatAmount(amountValue, currency)}</p>
                  </div>
                </div>
                <span className="flex h-7 items-center justify-center rounded-[2px] border border-[#444] text-[11px]">1</span>
                <span className="rounded-[2px] border border-[#444] px-1 py-2 text-[8px] font-black">{selectedRecipient.rate}</span>
                <span className="flex h-7 items-center justify-center rounded-[2px] border border-[#444] text-[11px]">{splitPercent}%</span>
                <button
                  type="button"
                  onClick={() => showMessage("This synced recipient cannot be removed from the draft.")}
                  aria-label="Remove recipient"
                >
                  <Trash2 className="h-4 w-4 text-[#d7d7d7]" />
                </button>
              </div>

              <button
                type="button"
                onClick={() => showMessage("Funding account selected.")}
                className="mt-4 flex h-12 w-full items-center justify-between rounded-[5px] bg-[#2d2d2d] px-4 text-left"
              >
                <span className="flex min-w-0 items-center gap-3">
                  <span className="flex h-8 w-12 shrink-0 items-center justify-center overflow-hidden rounded-[4px] bg-white">
                    <img
                      src={BOFA_BUSINESS_DEBIT_VISA_IMAGE}
                      alt="Bank of America Business Debit Visa"
                      className="h-full w-full object-cover"
                      loading="lazy"
                      referrerPolicy="no-referrer"
                    />
                  </span>
                  <span className="min-w-0">
                    <span className="block truncate text-[15px] font-black">Bank of America Business Debit Visa</span>
                    <span className="block text-[10px] font-black">Debit ****88</span>
                  </span>
                </span>
                <ChevronDown className="h-5 w-5 shrink-0" />
              </button>

              <div className="mt-4 grid gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setSplitEnabled((value) => !value);
                    showMessage(splitEnabled ? "Split payout disabled." : "Split payout enabled.");
                  }}
                  className={cn(
                    "h-8 rounded-[5px] text-[11px] font-black",
                    splitEnabled ? "bg-white text-black" : "bg-[#2d2d2d] text-[#d9d9d9]"
                  )}
                >
                  <Users className="mr-2 inline h-4 w-4" />
                  Split Payout (%)
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setIsBatchOpen(true);
                  }}
                  className={cn(
                    "h-8 rounded-[5px] text-[11px] font-black",
                    batchCreated ? "bg-white text-black" : "bg-[#2d2d2d] text-[#d9d9d9]"
                  )}
                >
                  <Split className="mr-2 inline h-4 w-4" />
                  {batchCreated ? "Batch Payment Created" : "+ Create Batch Payment"}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setMultiPayout((value) => !value);
                    showMessage(multiPayout ? "Multi payout disabled." : "Multi payout enabled.");
                  }}
                  className={cn(
                    "h-8 rounded-[5px] text-[11px] font-black",
                    multiPayout ? "bg-white text-black" : "bg-[#2d2d2d] text-[#d9d9d9]"
                  )}
                >
                  <Landmark className="mr-2 inline h-4 w-4" />
                  Multi Payout
                </button>
              </div>

              <div className="mt-4 space-y-3 text-[12px] font-bold">
                <div className="flex justify-between">
                  <span>You&apos;ll {mode === "send" ? "send" : "request"}:</span>
                  <span>{formatAmount(amountValue, currency)}</span>
                </div>
                <div className="flex justify-between">
                  <span>AgncyPay fee:</span>
                  <span>{formatAmount(fee, currency)}</span>
                </div>
                <div className="flex justify-between text-[13px]">
                  <span>Total:</span>
                  <span>{formatAmount(total, currency)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Talent split:</span>
                  <span>{splitPercent}% - {formatAmount(talentAmount, currency)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Estimated delivery:</span>
                  <span>In seconds</span>
                </div>
                <div className="flex justify-between">
                  <span>{selectedRecipient.name} will get:</span>
                  <span>{formatAmount(recipientGets, currency)}</span>
                </div>
              </div>

              {currency !== "USD" && (
                <p className="mt-4 text-[12px] font-bold leading-5 text-white">
                  1 USD = {selectedCurrency.rate.toFixed(2)} {currency}
                  <br />
                  This rate includes a currency conversion spread.
                </p>
              )}

              <div className="mt-6 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setStage("invoices")}
                  className="h-9 w-[94px] rounded-[6px] bg-[#ff4e2f] text-[13px] font-black text-white hover:bg-[#ff684d]"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={() => setStage("success")}
                  aria-label={mode === "send" ? "Pay Now" : "Request Now"}
                  className={cn(
                    "inline-flex h-9 w-[94px] items-center justify-center gap-1 overflow-hidden rounded-[6px] border text-[13px] font-black",
                    mode === "send"
                      ? "border-[#333] bg-black text-white hover:border-[#666] hover:bg-[#111]"
                      : "border-[#ff3b30] bg-[#ff3b30] text-white hover:bg-[#ff5a4f]"
                  )}
                >
                  <AgncyPayLogo imageClassName="h-3.5 w-auto" />
                  Now
                </button>
              </div>
            </div>
          </section>
        )}

        {stage === "success" && (
          <section className="mx-auto flex w-full max-w-[520px] flex-1 items-center pb-12 pt-12">
            <div className="w-full rounded-[8px] border border-[#3c3c3c] bg-[#151515] px-8 py-9 text-center">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-[#1ea94b]">
                <Send className="h-7 w-7 text-white" />
              </div>
              <h1 className="mt-5 text-[28px] font-black">{mode === "send" ? "Payment sent" : "Request sent"}</h1>
              <p className="mt-3 text-[14px] font-bold leading-6 text-[#bdbdbd]">
                {formatAmount(amountValue, currency)} {mode === "send" ? "was sent to" : "was requested from"}{" "}
                {selectedRecipient.name}.
              </p>
              <div className="mt-7 flex flex-col gap-3 sm:flex-row">
                <Link
                  href="/dashboard"
                  className="inline-flex h-11 flex-1 items-center justify-center rounded-[6px] border border-white bg-white text-[13px] font-black text-black"
                >
                  Go to Dashboard
                </Link>
                <button
                  type="button"
                  onClick={() => {
                    setQuery("");
                    setStage("search");
                  }}
                  className="h-11 rounded-[6px] border border-[#444] px-5 text-[13px] font-black text-white"
                >
                  Send another
                </button>
              </div>
            </div>
          </section>
        )}

        {isCurrencyOpen && (
          <CurrencyPickerModal
            selectedCurrency={selectedCurrency}
            search={currencySearch}
            onSearchChange={setCurrencySearch}
            onSelect={(nextCurrency) => {
              setCurrency(nextCurrency.code);
              setCurrencySearch("");
              setIsCurrencyOpen(false);
              showMessage(`Currency changed to ${nextCurrency.code}.`);
            }}
            onClose={() => setIsCurrencyOpen(false)}
          />
        )}

        {isBatchOpen && (
          <BatchPaymentModal
            selectedIds={batchSelectedIds}
            onToggle={toggleBatchInvoice}
            onToggleAll={toggleAllBatchInvoices}
            onClose={() => setIsBatchOpen(false)}
            onCreate={() => {
              setBatchCreated(true);
              setIsBatchOpen(false);
              showMessage(`${batchSelectedIds.length} invoice batch payment created.`);
            }}
          />
        )}

        <FooterBar />
      </div>
    </main>
  );
}
