"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import {
  ArrowLeft,
  ArrowRight,
  Banknote,
  CheckCircle2,
  Copy,
  CreditCard,
  FileText,
  Landmark,
  Lock,
  Mail,
  Paperclip,
  Plus,
  ReceiptText,
  RefreshCw,
  Search,
  Send,
  ShieldCheck,
  Sparkles,
  Split,
  Users,
  X,
} from "lucide-react";
import { AgncyPayLogo } from "../../../components/payment/AgncyPayLogo";
import { cn } from "../../../lib/utils";

type TransferMode = "send" | "request";
type FlowStage = "start" | "recipient" | "amount" | "review" | "processing" | "success";
type FundingMethod = "balance" | "bank" | "card";
type DeliverySpeed = "instant" | "standard";
type Purpose = "friends" | "services" | "invoice" | "payout";

type Recipient = {
  id: string;
  name: string;
  handle: string;
  email: string;
  mobile: string;
  type: "talent" | "agency" | "brand" | "vendor";
  initials: string;
  color: string;
  suggestedAmount: number;
  note: string;
};

type FundingOption = {
  id: FundingMethod;
  title: string;
  detail: string;
  feeText: string;
  icon: typeof Landmark;
};

type BatchInvoice = {
  id: string;
  recipient: string;
  source: string;
  amount: number;
  due: string;
};

const recipients: Recipient[] = [
  {
    id: "john-adams",
    name: "John Adams",
    handle: "@agncy11174",
    email: "john@westernmodels.com",
    mobile: "+1 (555) 810-1174",
    type: "talent",
    initials: "JA",
    color: "from-[#575757] to-[#111111]",
    suggestedAmount: 7840.25,
    note: "Runway booking payout",
  },
  {
    id: "amy-holland",
    name: "Amy Holland",
    handle: "@agncy65122",
    email: "amy@studioholland.com",
    mobile: "+1 (555) 324-6512",
    type: "talent",
    initials: "AH",
    color: "from-[#6f6f6f] to-[#151515]",
    suggestedAmount: 4200,
    note: "Creator campaign settlement",
  },
  {
    id: "m-models",
    name: "M Models",
    handle: "@mmodels",
    email: "ap@mmodels.com",
    mobile: "+1 (555) 310-4400",
    type: "agency",
    initials: "MM",
    color: "from-[#2f2f2f] to-[#050505]",
    suggestedAmount: 12800,
    note: "Agency batch payout",
  },
  {
    id: "nike",
    name: "Nike",
    handle: "@nike",
    email: "treasury@nike.com",
    mobile: "+1 (503) 671-6453",
    type: "brand",
    initials: "NI",
    color: "from-[#3f3f46] to-[#090909]",
    suggestedAmount: 12500,
    note: "Brand invoice request",
  },
  {
    id: "soundcloud",
    name: "SoundCloud",
    handle: "@soundcloud",
    email: "payments@soundcloud.com",
    mobile: "+1 (555) 407-8100",
    type: "vendor",
    initials: "SC",
    color: "from-[#525252] to-[#111111]",
    suggestedAmount: 3040,
    note: "Streaming revenue transfer",
  },
];

const currencies = [
  { code: "USD", name: "United States Dollar", symbol: "$" },
  { code: "EUR", name: "Euro", symbol: "€" },
  { code: "GBP", name: "British Pound", symbol: "£" },
  { code: "AED", name: "UAE Dirham", symbol: "د.إ" },
] as const;

type CurrencyCode = (typeof currencies)[number]["code"];

const fundingOptions: FundingOption[] = [
  {
    id: "balance",
    title: "AgncyPay Balance",
    detail: "$28,450.72 available",
    feeText: "No fee",
    icon: Banknote,
  },
  {
    id: "bank",
    title: "Chase Business Checking",
    detail: "Bank ****1234",
    feeText: "No fee · 1 business day",
    icon: Landmark,
  },
  {
    id: "card",
    title: "Corporate Visa",
    detail: "Card ****8930",
    feeText: "2.9% demo card fee",
    icon: CreditCard,
  },
];

const purposeOptions: { id: Purpose; title: string; detail: string }[] = [
  { id: "friends", title: "Personal", detail: "Quick transfer without invoice controls." },
  { id: "services", title: "Services", detail: "Best for creator, vendor, or contractor payments." },
  { id: "invoice", title: "Invoice", detail: "Attach invoice memo and reconciliation details." },
  { id: "payout", title: "Payout", detail: "Use for agency, talent, or platform payout runs." },
];

const batchInvoices: BatchInvoice[] = [
  { id: "QB-29475", recipient: "Nike, Inc.", source: "QuickBooks", amount: 1500, due: "27 days" },
  { id: "QB-38485", recipient: "The Gap, Inc.", source: "QuickBooks", amount: 5400, due: "2 days" },
  { id: "MB-6984", recipient: "M Models", source: "Mainboard", amount: 3040, due: "Today" },
  { id: "SC-2044", recipient: "SoundCloud", source: "Music income", amount: 3040, due: "Ready" },
  { id: "QB-88442", recipient: "Adidas AG", source: "QuickBooks", amount: 2800, due: "19 days" },
];

function formatCurrency(value: number, currency: CurrencyCode) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
    maximumFractionDigits: 2,
  }).format(value);
}

function avatarLabel(type: Recipient["type"]) {
  if (type === "brand") return "Brand";
  if (type === "agency") return "Agency";
  if (type === "vendor") return "Vendor";
  return "Talent";
}

function RecipientAvatar({ recipient, size = "md" }: { recipient: Recipient; size?: "sm" | "md" | "lg" }) {
  return (
    <div
      className={cn(
        "flex shrink-0 items-center justify-center rounded-full border border-white/10 bg-gradient-to-br text-center font-black text-white",
        recipient.color,
        size === "sm" && "h-10 w-10 text-[12px]",
        size === "md" && "h-14 w-14 text-[15px]",
        size === "lg" && "h-20 w-20 text-[22px]"
      )}
    >
      {recipient.initials}
    </div>
  );
}

function StepPill({ active, done, label }: { active: boolean; done: boolean; label: string }) {
  return (
    <div className="flex items-center gap-2">
      <span
        className={cn(
          "flex h-6 w-6 items-center justify-center rounded-full border text-[11px] font-black",
          done && "border-white bg-white text-black",
          active && !done && "border-white text-white",
          !active && !done && "border-[#333] text-[#777]"
        )}
      >
        {done ? <CheckCircle2 className="h-3.5 w-3.5" /> : null}
      </span>
      <span className={cn("text-[12px] font-semibold", active || done ? "text-white" : "text-[#777]")}>{label}</span>
    </div>
  );
}

function ProgressHeader({ stage }: { stage: FlowStage }) {
  const order: FlowStage[] = ["recipient", "amount", "review", "success"];
  const currentIndex = stage === "start" ? 0 : order.indexOf(stage) === -1 ? 2 : order.indexOf(stage);

  return (
    <div className="hidden items-center gap-5 rounded-full border border-[#282828] bg-[#080808] px-4 py-2 md:flex">
      {[
        { id: "recipient", label: "Recipient" },
        { id: "amount", label: "Amount" },
        { id: "review", label: "Review" },
        { id: "success", label: "Done" },
      ].map((item, index) => (
        <StepPill
          key={item.id}
          active={index === currentIndex}
          done={stage === "success" || index < currentIndex}
          label={item.label}
        />
      ))}
    </div>
  );
}

function TopBar({ stage }: { stage: FlowStage }) {
  return (
    <header className="flex flex-col gap-4 border-b border-[#171717] pb-5 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex items-center gap-4">
        <Link
          href="/dashboard"
          className="inline-flex h-10 items-center gap-2 rounded-[7px] border border-[#303030] bg-[#060606] px-3 text-[13px] font-semibold text-[#d7d7d7] hover:border-[#666] hover:text-white"
        >
          <ArrowLeft className="h-4 w-4" />
          Dashboard
        </Link>
        <AgncyPayLogo className="h-[24px] w-[70px]" imageClassName="h-full w-full" />
      </div>
      <ProgressHeader stage={stage} />
    </header>
  );
}

function BatchModal({
  selectedIds,
  onToggle,
  onClose,
  onUseBatch,
}: {
  selectedIds: string[];
  onToggle: (id: string) => void;
  onClose: () => void;
  onUseBatch: () => void;
}) {
  const selectedTotal = batchInvoices
    .filter((invoice) => selectedIds.includes(invoice.id))
    .reduce((total, invoice) => total + invoice.amount, 0);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-black/70 px-4 py-8 backdrop-blur-sm">
      <section className="w-full max-w-[920px] overflow-hidden rounded-[12px] border border-[#333] bg-[#080808] shadow-2xl">
        <div className="flex items-center justify-between border-b border-[#222] px-5 py-4">
          <div>
            <h2 className="text-[22px] font-semibold text-white">Create batch payment</h2>
            <p className="mt-1 text-[13px] text-[#8d8d8d]">Select synced invoices and turn them into one payment run.</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="flex h-9 w-9 items-center justify-center rounded-[7px] border border-[#333] text-[#d7d7d7] hover:border-[#666] hover:text-white"
            aria-label="Close batch payment"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="max-h-[460px] overflow-y-auto p-4">
          <div className="grid gap-3">
            {batchInvoices.map((invoice) => {
              const checked = selectedIds.includes(invoice.id);

              return (
                <button
                  key={invoice.id}
                  type="button"
                  onClick={() => onToggle(invoice.id)}
                  className={cn(
                    "grid grid-cols-[24px_1fr_auto] items-center gap-4 rounded-[9px] border px-4 py-4 text-left transition-colors",
                    checked ? "border-white bg-white text-black" : "border-[#303030] bg-black text-white hover:border-[#666]"
                  )}
                >
                  <span
                    className={cn(
                      "flex h-5 w-5 items-center justify-center rounded border",
                      checked ? "border-black bg-black text-white" : "border-[#555]"
                    )}
                  >
                    {checked ? <CheckCircle2 className="h-3.5 w-3.5" /> : null}
                  </span>
                  <span className="min-w-0">
                    <span className="block truncate text-[15px] font-semibold">{invoice.recipient}</span>
                    <span className={cn("mt-1 block text-[12px]", checked ? "text-[#333]" : "text-[#888]")}>
                      {invoice.id} · {invoice.source} · due {invoice.due}
                    </span>
                  </span>
                  <span className="text-[15px] font-semibold">{formatCurrency(invoice.amount, "USD")}</span>
                </button>
              );
            })}
          </div>
        </div>

        <div className="flex flex-col gap-3 border-t border-[#222] px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-[13px] font-semibold text-[#d7d7d7]">
            {selectedIds.length} selected · {formatCurrency(selectedTotal, "USD")}
          </p>
          <div className="flex gap-3">
            <button
              type="button"
              onClick={onClose}
              className="h-10 rounded-[7px] border border-[#444] px-5 text-[13px] font-semibold text-white hover:border-[#666]"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={onUseBatch}
              disabled={selectedIds.length === 0}
              className="h-10 rounded-[7px] border border-white bg-white px-5 text-[13px] font-semibold text-black hover:bg-[#e8e8e8] disabled:cursor-not-allowed disabled:opacity-50"
            >
              Use selected batch
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}

export default function SendRequestPage() {
  const [mode, setMode] = useState<TransferMode>("send");
  const [stage, setStage] = useState<FlowStage>("start");
  const [query, setQuery] = useState("");
  const [selectedRecipientId, setSelectedRecipientId] = useState(recipients[0].id);
  const [amount, setAmount] = useState(recipients[0].suggestedAmount.toFixed(2));
  const [currency, setCurrency] = useState<CurrencyCode>("USD");
  const [note, setNote] = useState(recipients[0].note);
  const [purpose, setPurpose] = useState<Purpose>("services");
  const [fundingMethod, setFundingMethod] = useState<FundingMethod>("balance");
  const [deliverySpeed, setDeliverySpeed] = useState<DeliverySpeed>("instant");
  const [isBatchOpen, setIsBatchOpen] = useState(false);
  const [batchIds, setBatchIds] = useState<string[]>(["QB-38485", "MB-6984"]);
  const [copyState, setCopyState] = useState<"idle" | "copied">("idle");
  const [receiptId, setReceiptId] = useState("AP-DEMO-482901");

  const selectedRecipient = recipients.find((recipient) => recipient.id === selectedRecipientId) || recipients[0];
  const selectedCurrency = currencies.find((item) => item.code === currency) || currencies[0];
  const numericAmount = Number(amount) || 0;
  const selectedFunding = fundingOptions.find((option) => option.id === fundingMethod) || fundingOptions[0];
  const batchTotal = batchInvoices
    .filter((invoice) => batchIds.includes(invoice.id))
    .reduce((total, invoice) => total + invoice.amount, 0);
  const cardFee = fundingMethod === "card" && mode === "send" ? numericAmount * 0.029 : 0;
  const instantFee = deliverySpeed === "instant" && fundingMethod !== "balance" && mode === "send" ? Math.max(1.5, numericAmount * 0.0025) : 0;
  const platformFee = purpose === "invoice" && mode === "request" ? Math.max(2, numericAmount * 0.004) : 0;
  const total = mode === "send" ? numericAmount + cardFee + instantFee : numericAmount;
  const recipientGets = mode === "send" ? numericAmount : numericAmount - platformFee;

  const filteredRecipients = useMemo(() => {
    const normalized = query.trim().toLowerCase();

    if (!normalized) return recipients;

    return recipients.filter((recipient) =>
      [recipient.name, recipient.handle, recipient.email, recipient.mobile, recipient.type]
        .join(" ")
        .toLowerCase()
        .includes(normalized)
    );
  }, [query]);

  const selectRecipient = (recipient: Recipient) => {
    setSelectedRecipientId(recipient.id);
    setAmount(recipient.suggestedAmount.toFixed(2));
    setNote(recipient.note);
    setStage("amount");
  };

  const submitTransfer = () => {
    setReceiptId(`AP-${Math.floor(100000 + Math.random() * 900000)}`);
    setStage("processing");
    window.setTimeout(() => setStage("success"), 1300);
  };

  const copyReceipt = () => {
    setCopyState("copied");
    window.setTimeout(() => setCopyState("idle"), 1600);
  };

  const resetFlow = () => {
    setQuery("");
    setNote(selectedRecipient.note);
    setStage("start");
    setCopyState("idle");
  };

  const startMode = (nextMode: TransferMode) => {
    setMode(nextMode);
    setStage("recipient");
  };

  return (
    <main className="min-h-screen bg-[#050505] text-white">
      <div className="mx-auto flex min-h-screen w-full max-w-[1280px] flex-col px-5 py-5 sm:px-7 lg:px-10">
        <TopBar stage={stage} />

        {stage === "start" && (
          <section className="grid flex-1 place-items-center py-10">
            <div className="w-full max-w-[980px]">
              <div className="mx-auto max-w-[680px] text-center">
                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full border border-[#303030] bg-[#080808]">
                  <Sparkles className="h-6 w-6 text-white" />
                </div>
                <h1 className="mt-6 text-[42px] font-semibold leading-none tracking-[-0.04em] text-white sm:text-[58px]">
                  Send or request money
                </h1>
                <p className="mt-5 text-[16px] leading-7 text-[#9b9b9b]">
                  Move money to talent, agencies, brands, music platforms, and vendors with a guided AgncyPay checkout.
                </p>
              </div>

              <div className="mt-10 grid grid-cols-1 gap-4 md:grid-cols-2">
                <button
                  type="button"
                  onClick={() => startMode("send")}
                  className="rounded-[12px] border border-[#303030] bg-[#080808] p-6 text-left transition-colors hover:border-white"
                >
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-white text-black">
                    <Send className="h-5 w-5" />
                  </div>
                  <h2 className="mt-7 text-[26px] font-semibold text-white">Send payment</h2>
                  <p className="mt-3 text-[14px] leading-6 text-[#8d8d8d]">
                    Pay a person, agency, brand, vendor, or synced invoice recipient.
                  </p>
                  <span className="mt-7 inline-flex items-center gap-2 text-[13px] font-bold text-white">
                    Start sending <ArrowRight className="h-4 w-4" />
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => startMode("request")}
                  className="rounded-[12px] border border-[#303030] bg-[#080808] p-6 text-left transition-colors hover:border-white"
                >
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-white text-black">
                    <ReceiptText className="h-5 w-5" />
                  </div>
                  <h2 className="mt-7 text-[26px] font-semibold text-white">Request money</h2>
                  <p className="mt-3 text-[14px] leading-6 text-[#8d8d8d]">
                    Create a payment request with memo, invoice context, and shareable receipt trail.
                  </p>
                  <span className="mt-7 inline-flex items-center gap-2 text-[13px] font-bold text-white">
                    Start requesting <ArrowRight className="h-4 w-4" />
                  </span>
                </button>
              </div>

              <div className="mt-5 grid grid-cols-1 gap-4 md:grid-cols-3">
                {[
                  { icon: Split, title: "Batch-ready", detail: "Pull synced QuickBooks or Mainboard invoices into one run." },
                  { icon: Lock, title: "Review first", detail: "Every transfer goes through a final confirmation screen." },
                  { icon: ShieldCheck, title: "Demo receipts", detail: "Generate a realistic status and receipt after submit." },
                ].map((item) => {
                  const Icon = item.icon;

                  return (
                    <div key={item.title} className="rounded-[10px] border border-[#242424] bg-black p-4">
                      <Icon className="h-5 w-5 text-white" />
                      <p className="mt-3 text-[14px] font-semibold text-white">{item.title}</p>
                      <p className="mt-1 text-[12px] leading-5 text-[#777]">{item.detail}</p>
                    </div>
                  );
                })}
              </div>
            </div>
          </section>
        )}

        {stage === "recipient" && (
          <section className="mx-auto w-full max-w-[840px] flex-1 py-10">
            <button
              type="button"
              onClick={() => setStage("start")}
              className="mb-6 inline-flex items-center gap-2 text-[13px] font-semibold text-[#bdbdbd] hover:text-white"
            >
              <ArrowLeft className="h-4 w-4" />
              Back
            </button>

            <div className="rounded-[13px] border border-[#303030] bg-[#080808] p-5 sm:p-7">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <h1 className="text-[30px] font-semibold text-white">
                    Who do you want to {mode === "send" ? "pay" : "request from"}?
                  </h1>
                  <p className="mt-2 text-[14px] text-[#8d8d8d]">Search by name, email, phone, wallet ID, or organization.</p>
                </div>
                <div className="inline-flex rounded-full border border-[#303030] bg-black p-1">
                  {(["send", "request"] as TransferMode[]).map((item) => (
                    <button
                      key={item}
                      type="button"
                      onClick={() => setMode(item)}
                      className={cn(
                        "h-9 rounded-full px-5 text-[13px] font-bold capitalize",
                        mode === item ? "bg-white text-black" : "text-[#8d8d8d] hover:text-white"
                      )}
                    >
                      {item}
                    </button>
                  ))}
                </div>
              </div>

              <label className="relative mt-6 block">
                <Search className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-[#777]" />
                <input
                  autoFocus
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                  placeholder="Name, email, phone, @wallet"
                  className="h-14 w-full rounded-full border border-[#333] bg-black pl-12 pr-5 text-[15px] font-semibold text-white outline-none placeholder:text-[#666] focus:border-[#777]"
                />
              </label>

              <div className="mt-6 space-y-3">
                {filteredRecipients.map((recipient) => (
                  <button
                    key={recipient.id}
                    type="button"
                    onClick={() => selectRecipient(recipient)}
                    className="flex w-full items-center justify-between gap-4 rounded-[10px] border border-[#242424] bg-black px-4 py-4 text-left transition-colors hover:border-[#666]"
                  >
                    <span className="flex min-w-0 items-center gap-4">
                      <RecipientAvatar recipient={recipient} size="sm" />
                      <span className="min-w-0">
                        <span className="block truncate text-[15px] font-semibold text-white">{recipient.name}</span>
                        <span className="mt-1 block truncate text-[12px] text-[#888]">
                          {recipient.handle} · {recipient.email}
                        </span>
                      </span>
                    </span>
                    <span className="hidden rounded-full border border-[#333] px-3 py-1 text-[11px] font-bold text-[#bdbdbd] sm:inline-flex">
                      {avatarLabel(recipient.type)}
                    </span>
                  </button>
                ))}
                {filteredRecipients.length === 0 && (
                  <div className="rounded-[10px] border border-[#303030] bg-black px-4 py-8 text-center">
                    <p className="text-[15px] font-semibold text-white">No matching contact</p>
                    <p className="mt-2 text-[13px] text-[#8d8d8d]">Try another name, email, phone, or wallet handle.</p>
                  </div>
                )}
              </div>

              <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-3">
                <button
                  type="button"
                  onClick={() => setIsBatchOpen(true)}
                  className="inline-flex h-11 items-center justify-center gap-2 rounded-[8px] border border-[#333] bg-black text-[13px] font-semibold text-white hover:border-[#666]"
                >
                  <Split className="h-4 w-4" />
                  Batch payment
                </button>
                <Link
                  href="/dashboard/invoices"
                  className="inline-flex h-11 items-center justify-center gap-2 rounded-[8px] border border-[#333] bg-black text-[13px] font-semibold text-white hover:border-[#666]"
                >
                  <FileText className="h-4 w-4" />
                  Open invoices
                </Link>
                <Link
                  href="/dashboard/profile"
                  className="inline-flex h-11 items-center justify-center gap-2 rounded-[8px] border border-[#333] bg-black text-[13px] font-semibold text-white hover:border-[#666]"
                >
                  <Users className="h-4 w-4" />
                  Contacts
                </Link>
              </div>
            </div>
          </section>
        )}

        {stage === "amount" && (
          <section className="mx-auto grid w-full max-w-[1120px] flex-1 grid-cols-1 gap-6 py-10 lg:grid-cols-[minmax(0,1fr)_360px]">
            <div className="rounded-[13px] border border-[#303030] bg-[#080808] p-5 sm:p-7">
              <button
                type="button"
                onClick={() => setStage("recipient")}
                className="mb-6 inline-flex items-center gap-2 text-[13px] font-semibold text-[#bdbdbd] hover:text-white"
              >
                <ArrowLeft className="h-4 w-4" />
                Change recipient
              </button>

              <div className="flex items-center gap-4">
                <RecipientAvatar recipient={selectedRecipient} size="md" />
                <div className="min-w-0">
                  <h1 className="truncate text-[28px] font-semibold text-white">{selectedRecipient.name}</h1>
                  <p className="mt-1 text-[13px] text-[#8d8d8d]">{selectedRecipient.handle} · {selectedRecipient.mobile}</p>
                </div>
              </div>

              <div className="mt-8 rounded-[12px] border border-[#242424] bg-black p-5">
                <p className="text-[13px] font-semibold uppercase tracking-[0.12em] text-[#777]">
                  {mode === "send" ? "You send" : "You request"}
                </p>
                <div className="mt-4 flex flex-col gap-4 sm:flex-row sm:items-end">
                  <div className="flex min-w-0 flex-1 items-baseline gap-3">
                    <span className="text-[38px] font-semibold text-[#777]">{selectedCurrency.symbol}</span>
                    <input
                      value={amount}
                      onChange={(event) => setAmount(event.target.value.replace(/[^\d.]/g, ""))}
                      inputMode="decimal"
                      aria-label="Amount"
                      className="min-w-0 flex-1 bg-transparent text-[52px] font-semibold leading-none text-white outline-none"
                    />
                  </div>
                  <label className="block">
                    <span className="sr-only">Currency</span>
                    <select
                      value={currency}
                      onChange={(event) => setCurrency(event.target.value as CurrencyCode)}
                      className="h-11 rounded-[8px] border border-[#333] bg-[#111] px-3 text-[14px] font-semibold text-white outline-none"
                    >
                      {currencies.map((item) => (
                        <option key={item.code} value={item.code}>
                          {item.code} · {item.name}
                        </option>
                      ))}
                    </select>
                  </label>
                </div>
              </div>

              <div className="mt-5 grid grid-cols-1 gap-4 md:grid-cols-2">
                <label className="block">
                  <span className="text-[13px] font-semibold text-[#d7d7d7]">What is this for?</span>
                  <textarea
                    value={note}
                    onChange={(event) => setNote(event.target.value)}
                    rows={4}
                    placeholder="Add a note"
                    className="mt-2 w-full resize-none rounded-[9px] border border-[#303030] bg-black px-4 py-3 text-[14px] text-white outline-none placeholder:text-[#666] focus:border-[#777]"
                  />
                </label>

                <div>
                  <p className="text-[13px] font-semibold text-[#d7d7d7]">Payment type</p>
                  <div className="mt-2 grid grid-cols-1 gap-2">
                    {purposeOptions.map((item) => (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => setPurpose(item.id)}
                        className={cn(
                          "rounded-[9px] border px-4 py-3 text-left transition-colors",
                          purpose === item.id ? "border-white bg-white text-black" : "border-[#303030] bg-black text-white hover:border-[#666]"
                        )}
                      >
                        <span className="block text-[13px] font-semibold">{item.title}</span>
                        <span className={cn("mt-1 block text-[12px]", purpose === item.id ? "text-[#333]" : "text-[#777]")}>
                          {item.detail}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div className="mt-5 flex flex-wrap gap-3">
                <button
                  type="button"
                  onClick={() => setIsBatchOpen(true)}
                  className="inline-flex h-10 items-center gap-2 rounded-[8px] border border-[#333] bg-black px-4 text-[13px] font-semibold text-white hover:border-[#666]"
                >
                  <Plus className="h-4 w-4" />
                  Add batch invoices
                </button>
                <button
                  type="button"
                  className="inline-flex h-10 items-center gap-2 rounded-[8px] border border-[#333] bg-black px-4 text-[13px] font-semibold text-white hover:border-[#666]"
                >
                  <Paperclip className="h-4 w-4" />
                  Attach file
                </button>
                <button
                  type="button"
                  className="inline-flex h-10 items-center gap-2 rounded-[8px] border border-[#333] bg-black px-4 text-[13px] font-semibold text-white hover:border-[#666]"
                >
                  <Mail className="h-4 w-4" />
                  Email copy
                </button>
              </div>
            </div>

            <aside className="rounded-[13px] border border-[#303030] bg-[#080808] p-5">
              <h2 className="text-[18px] font-semibold text-white">How should this move?</h2>
              <div className="mt-5 space-y-3">
                {fundingOptions.map((option) => {
                  const Icon = option.icon;

                  return (
                    <button
                      key={option.id}
                      type="button"
                      onClick={() => setFundingMethod(option.id)}
                      className={cn(
                        "flex w-full items-start gap-3 rounded-[9px] border px-4 py-4 text-left transition-colors",
                        fundingMethod === option.id ? "border-white bg-white text-black" : "border-[#303030] bg-black text-white hover:border-[#666]"
                      )}
                    >
                      <Icon className="mt-0.5 h-5 w-5 shrink-0" />
                      <span className="min-w-0">
                        <span className="block text-[14px] font-semibold">{option.title}</span>
                        <span className={cn("mt-1 block text-[12px]", fundingMethod === option.id ? "text-[#333]" : "text-[#777]")}>
                          {option.detail}
                        </span>
                        <span className={cn("mt-2 block text-[12px] font-semibold", fundingMethod === option.id ? "text-[#111]" : "text-[#bdbdbd]")}>
                          {option.feeText}
                        </span>
                      </span>
                    </button>
                  );
                })}
              </div>

              <div className="mt-5">
                <p className="text-[13px] font-semibold text-[#d7d7d7]">Delivery</p>
                <div className="mt-2 grid grid-cols-2 gap-2">
                  {(["instant", "standard"] as DeliverySpeed[]).map((speed) => (
                    <button
                      key={speed}
                      type="button"
                      onClick={() => setDeliverySpeed(speed)}
                      className={cn(
                        "rounded-[8px] border px-3 py-3 text-left",
                        deliverySpeed === speed ? "border-white bg-white text-black" : "border-[#303030] bg-black text-white"
                      )}
                    >
                      <span className="block text-[13px] font-semibold capitalize">{speed}</span>
                      <span className={cn("mt-1 block text-[11px]", deliverySpeed === speed ? "text-[#333]" : "text-[#777]")}>
                        {speed === "instant" ? "Seconds" : "1 business day"}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              <div className="mt-5 rounded-[9px] border border-[#303030] bg-black p-4">
                <div className="flex justify-between text-[13px] text-[#bdbdbd]">
                  <span>Amount</span>
                  <span>{formatCurrency(numericAmount, currency)}</span>
                </div>
                {cardFee > 0 && (
                  <div className="mt-2 flex justify-between text-[13px] text-[#bdbdbd]">
                    <span>Card fee</span>
                    <span>{formatCurrency(cardFee, currency)}</span>
                  </div>
                )}
                {instantFee > 0 && (
                  <div className="mt-2 flex justify-between text-[13px] text-[#bdbdbd]">
                    <span>Instant fee</span>
                    <span>{formatCurrency(instantFee, currency)}</span>
                  </div>
                )}
                {platformFee > 0 && (
                  <div className="mt-2 flex justify-between text-[13px] text-[#bdbdbd]">
                    <span>Request fee preview</span>
                    <span>{formatCurrency(platformFee, currency)}</span>
                  </div>
                )}
                {batchIds.length > 0 && (
                  <div className="mt-2 flex justify-between text-[13px] text-[#bdbdbd]">
                    <span>Batch attached</span>
                    <span>{batchIds.length} · {formatCurrency(batchTotal, currency)}</span>
                  </div>
                )}
                <div className="mt-3 border-t border-[#222] pt-3">
                  <div className="flex justify-between text-[15px] font-semibold text-white">
                    <span>{mode === "send" ? "You pay" : "Request total"}</span>
                    <span>{formatCurrency(total, currency)}</span>
                  </div>
                  <div className="mt-2 flex justify-between text-[12px] text-[#8d8d8d]">
                    <span>{selectedRecipient.name} {mode === "send" ? "gets" : "will pay"}</span>
                    <span>{formatCurrency(recipientGets, currency)}</span>
                  </div>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setStage("review")}
                disabled={numericAmount <= 0}
                className="mt-5 inline-flex h-12 w-full items-center justify-center gap-2 rounded-[8px] border border-white bg-white text-[14px] font-semibold text-black hover:bg-[#e8e8e8] disabled:cursor-not-allowed disabled:opacity-50"
              >
                Continue
                <ArrowRight className="h-4 w-4" />
              </button>
            </aside>
          </section>
        )}

        {stage === "review" && (
          <section className="mx-auto grid w-full max-w-[1040px] flex-1 grid-cols-1 gap-6 py-10 lg:grid-cols-[minmax(0,1fr)_360px]">
            <div className="rounded-[13px] border border-[#303030] bg-[#080808] p-5 sm:p-7">
              <button
                type="button"
                onClick={() => setStage("amount")}
                className="mb-6 inline-flex items-center gap-2 text-[13px] font-semibold text-[#bdbdbd] hover:text-white"
              >
                <ArrowLeft className="h-4 w-4" />
                Edit details
              </button>
              <h1 className="text-[34px] font-semibold tracking-[-0.03em] text-white">
                Review {mode === "send" ? "payment" : "request"}
              </h1>
              <p className="mt-2 text-[14px] text-[#8d8d8d]">Confirm everything before AgncyPay creates the demo transaction.</p>

              <div className="mt-7 space-y-4">
                <div className="flex items-center justify-between gap-4 rounded-[10px] border border-[#303030] bg-black p-4">
                  <div className="flex min-w-0 items-center gap-4">
                    <RecipientAvatar recipient={selectedRecipient} size="sm" />
                    <div className="min-w-0">
                      <p className="truncate text-[15px] font-semibold text-white">{selectedRecipient.name}</p>
                      <p className="mt-1 truncate text-[12px] text-[#8d8d8d]">{selectedRecipient.email}</p>
                    </div>
                  </div>
                  <span className="rounded-full border border-[#333] px-3 py-1 text-[11px] font-bold text-[#d7d7d7]">
                    {avatarLabel(selectedRecipient.type)}
                  </span>
                </div>

                <div className="rounded-[10px] border border-[#303030] bg-black p-4">
                  <p className="text-[12px] font-semibold uppercase tracking-[0.12em] text-[#777]">Memo</p>
                  <p className="mt-2 text-[14px] leading-6 text-white">{note || "No note added."}</p>
                </div>

                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  <div className="rounded-[10px] border border-[#303030] bg-black p-4">
                    <p className="text-[12px] font-semibold text-[#777]">Funding</p>
                    <p className="mt-2 text-[15px] font-semibold text-white">{selectedFunding.title}</p>
                    <p className="mt-1 text-[12px] text-[#8d8d8d]">{selectedFunding.detail}</p>
                  </div>
                  <div className="rounded-[10px] border border-[#303030] bg-black p-4">
                    <p className="text-[12px] font-semibold text-[#777]">Delivery</p>
                    <p className="mt-2 text-[15px] font-semibold text-white capitalize">{deliverySpeed}</p>
                    <p className="mt-1 text-[12px] text-[#8d8d8d]">{deliverySpeed === "instant" ? "Usually available in seconds." : "Estimated 1 business day."}</p>
                  </div>
                </div>

                <div className="flex items-start gap-3 rounded-[10px] border border-[#303030] bg-black p-4">
                  <Lock className="mt-0.5 h-4 w-4 shrink-0 text-white" />
                  <p className="text-[13px] leading-5 text-[#8d8d8d]">
                    This demo will not move real money. It simulates the final review, processing, and receipt states for your AgncyPay payment flow.
                  </p>
                </div>
              </div>
            </div>

            <aside className="rounded-[13px] border border-[#303030] bg-[#080808] p-5">
              <h2 className="text-[18px] font-semibold text-white">Summary</h2>
              <div className="mt-5 rounded-[10px] border border-[#303030] bg-black p-4">
                <div className="flex justify-between text-[13px] text-[#bdbdbd]">
                  <span>{mode === "send" ? "Sending" : "Requesting"}</span>
                  <span>{formatCurrency(numericAmount, currency)}</span>
                </div>
                {cardFee > 0 && (
                  <div className="mt-3 flex justify-between text-[13px] text-[#bdbdbd]">
                    <span>Card fee</span>
                    <span>{formatCurrency(cardFee, currency)}</span>
                  </div>
                )}
                {instantFee > 0 && (
                  <div className="mt-3 flex justify-between text-[13px] text-[#bdbdbd]">
                    <span>Instant fee</span>
                    <span>{formatCurrency(instantFee, currency)}</span>
                  </div>
                )}
                <div className="mt-4 border-t border-[#222] pt-4">
                  <div className="flex justify-between text-[18px] font-semibold text-white">
                    <span>Total</span>
                    <span>{formatCurrency(total, currency)}</span>
                  </div>
                </div>
              </div>

              <button
                type="button"
                onClick={submitTransfer}
                className="mt-5 inline-flex h-12 w-full items-center justify-center gap-2 rounded-[8px] border border-white bg-white text-[14px] font-semibold text-black hover:bg-[#e8e8e8]"
              >
                {mode === "send" ? "Send payment" : "Send request"}
                <ArrowRight className="h-4 w-4" />
              </button>
            </aside>
          </section>
        )}

        {stage === "processing" && (
          <section className="grid flex-1 place-items-center py-10">
            <div className="w-full max-w-[380px] rounded-[13px] border border-[#303030] bg-[#080808] p-8 text-center">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full border border-[#333] bg-black">
                <RefreshCw className="h-7 w-7 animate-spin text-white" />
              </div>
              <h1 className="mt-6 text-[28px] font-semibold text-white">Processing</h1>
              <p className="mt-3 text-[14px] leading-6 text-[#8d8d8d]">
                Securing transfer, checking funding source, and creating receipt trail.
              </p>
            </div>
          </section>
        )}

        {stage === "success" && (
          <section className="grid flex-1 place-items-center py-10">
            <div className="w-full max-w-[560px] rounded-[13px] border border-[#303030] bg-[#080808] p-6 text-center sm:p-8">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-white text-black">
                <CheckCircle2 className="h-8 w-8" />
              </div>
              <h1 className="mt-6 text-[32px] font-semibold text-white">
                {mode === "send" ? "Payment sent" : "Request sent"}
              </h1>
              <p className="mt-3 text-[15px] leading-6 text-[#bdbdbd]">
                {formatCurrency(numericAmount, currency)} {mode === "send" ? "was sent to" : "was requested from"} {selectedRecipient.name}.
              </p>

              <div className="mt-7 rounded-[10px] border border-[#303030] bg-black p-4 text-left">
                <div className="flex justify-between gap-4 border-b border-[#222] pb-3">
                  <span className="text-[13px] text-[#777]">Receipt ID</span>
                  <span className="font-mono text-[13px] font-semibold text-white">{receiptId}</span>
                </div>
                <div className="flex justify-between gap-4 border-b border-[#222] py-3">
                  <span className="text-[13px] text-[#777]">Status</span>
                  <span className="inline-flex items-center gap-1 text-[13px] font-semibold text-white">
                    <CheckCircle2 className="h-4 w-4" />
                    Completed
                  </span>
                </div>
                <div className="flex justify-between gap-4 pt-3">
                  <span className="text-[13px] text-[#777]">Delivery</span>
                  <span className="text-[13px] font-semibold text-white capitalize">{deliverySpeed}</span>
                </div>
              </div>

              <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-3">
                <button
                  type="button"
                  onClick={copyReceipt}
                  className="inline-flex h-11 items-center justify-center gap-2 rounded-[7px] border border-[#333] bg-black text-[13px] font-semibold text-white hover:border-[#666]"
                >
                  <Copy className="h-4 w-4" />
                  {copyState === "copied" ? "Copied" : "Copy"}
                </button>
                <button
                  type="button"
                  onClick={resetFlow}
                  className="inline-flex h-11 items-center justify-center rounded-[7px] border border-[#333] bg-black text-[13px] font-semibold text-white hover:border-[#666]"
                >
                  New transfer
                </button>
                <Link
                  href="/dashboard"
                  className="inline-flex h-11 items-center justify-center rounded-[7px] border border-white bg-white text-[13px] font-semibold text-black hover:bg-[#e8e8e8]"
                >
                  Dashboard
                </Link>
              </div>
            </div>
          </section>
        )}
      </div>

      {isBatchOpen && (
        <BatchModal
          selectedIds={batchIds}
          onToggle={(id) =>
            setBatchIds((current) => (current.includes(id) ? current.filter((item) => item !== id) : [...current, id]))
          }
          onClose={() => setIsBatchOpen(false)}
          onUseBatch={() => {
            const nextTotal = batchInvoices
              .filter((invoice) => batchIds.includes(invoice.id))
              .reduce((sum, invoice) => sum + invoice.amount, 0);
            setAmount(nextTotal.toFixed(2));
            setPurpose("invoice");
            setMode("send");
            setIsBatchOpen(false);
            setStage("amount");
          }}
        />
      )}
    </main>
  );
}
