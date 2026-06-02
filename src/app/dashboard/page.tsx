"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowUpRight,
  ChevronRight,
  CreditCard,
  EllipsisVertical,
  Search,
  Send,
  Settings,
  Users,
  X,
} from "lucide-react";
import { AgncyPayLogo } from "../../components/payment/AgncyPayLogo";
import { cn } from "../../lib/utils";
import { mainboardInvoices, formatMainboardMoney } from "../../lib/mainboard";

const BOFA_BUSINESS_DEBIT_VISA_IMAGE =
  "https://business.bankofamerica.com/content/dam/consumer/business/deposits/checking-accounts/debit-cards/bofa_busdbtcm_v.png";
const CHASE_INK_BUSINESS_UNLIMITED_IMAGE = "/chase-ink-business-unlimited.png";
const MERCURY_IO_CARD_IMAGE = "/mercurycard.png";
const LAND_ROVER_LOGO_IMAGE = "/land-rover-logo.svg";

type RemoteBrandImageProps = {
  src: string;
  alt: string;
  fallback: string;
  className?: string;
  imageClassName?: string;
};

function RemoteBrandImage({ src, alt, fallback, className, imageClassName }: RemoteBrandImageProps) {
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

const quickActions = [
  { label: "Send / Request", icon: Send, href: "/dashboard/send-request" },
  { label: "Add card or bank", icon: CreditCard, href: "/dashboard/wallet" },
  { label: "Wallet ID contacts", icon: Users, href: "/dashboard/profile" },
  { label: "More", icon: EllipsisVertical, href: "/dashboard/settings" },
] as const;

const brandShortcuts = [
  { label: "Airbnb", href: "/dashboard/invoices", src: "https://cdn.simpleicons.org/airbnb/FF5A5F", fallback: "Airbnb" },
  { label: "The North Face", href: "/dashboard/invoices", src: "https://cdn.simpleicons.org/thenorthface/E31837", fallback: "The North Face" },
  { label: "Land Rover", href: "/dashboard/invoices", src: LAND_ROVER_LOGO_IMAGE, fallback: "Land Rover" },
  { label: "Adidas", href: "/dashboard/invoices", src: "https://cdn.simpleicons.org/adidas/000000", fallback: "Adidas" },
  { label: "Search", href: "/dashboard/invoices", search: true, fallback: "S" },
] as const;

const bankCards = [
  {
    name: "Chase Ink Business Unlimited Visa",
    detail: "Visa ****86",
    cardImage: CHASE_INK_BUSINESS_UNLIMITED_IMAGE,
    fallback: "Chase",
  },
  {
    name: "Mercury Business IO Mastercard",
    detail: "Mastercard ****57",
    cardImage: MERCURY_IO_CARD_IMAGE,
    fallback: "Mercury",
  },
  {
    name: "Bank of America Business Debit Visa",
    detail: "Debit ****88",
    cardImage: BOFA_BUSINESS_DEBIT_VISA_IMAGE,
    fallback: "Bank of America",
  },
  {
    name: "Mercury Debit Mastercard",
    detail: "Debit ****86",
    cardImage: MERCURY_IO_CARD_IMAGE,
    fallback: "Mercury",
  },
] as const;

const dashboardInvoices = mainboardInvoices.slice(0, 5);

const dashboardPeopleByInvoiceId: Record<string, string> = {
  "MB-6984": "Anthea Smith",
  "MB-7012": "John Adams",
  "MB-7044": "Amy Holland",
  "MB-6890": "Lucy Che",
  "MB-6815": "Jessica Bailey",
};

const payeeLogoByInvoiceId: Record<
  string,
  {
    mark: string;
    label: string;
    detail?: string;
    className: string;
    markClassName?: string;
  }
> = {
  "MB-6984": {
    mark: "M",
    label: "M Models",
    detail: "MODELS",
    className: "bg-white text-[#2476c9]",
    markClassName: "font-black",
  },
  "MB-7012": {
    mark: "NS",
    label: "North Studio Agency",
    detail: "STUDIO",
    className: "bg-[#f4f4f4] text-black",
  },
  "MB-7044": {
    mark: "AT",
    label: "Atlas Talent Group",
    detail: "TALENT",
    className: "bg-[#111827] text-white",
  },
  "MB-6890": {
    mark: "LC",
    label: "Lucy Che",
    className: "bg-[#1f2937] text-white",
  },
  "MB-6815": {
    mark: "JB",
    label: "Jessica Bailey",
    className: "bg-[#27272a] text-white",
  },
};

const activityDates = ["Today, 10:24 AM", "Today, 9:42 AM", "Yesterday", "May 31", "May 24"];

function getInvoicePersonName(invoice: (typeof dashboardInvoices)[number]) {
  return dashboardPeopleByInvoiceId[invoice.id] || invoice.talentRealName || invoice.talentName || invoice.recipient;
}

const payoutItems = dashboardInvoices.map((invoice, index) => ({
  invoice,
  invoiceId: invoice.id,
  name: getInvoicePersonName(invoice),
  detail: `${invoice.recipient} - ${invoice.jobType}`,
  date: activityDates[index] || invoice.invoiceDate,
  amount: formatMainboardMoney(invoice.amount + invoice.fee),
  status: invoice.status,
}));

const walletContacts = [
  { id: "john-adams", name: "John Adams", handle: "@agncy11174" },
  { id: "amy-holland", name: "Amy Holland", handle: "@agncy66122" },
  { id: "lucy-che", name: "Lucy Che", handle: "@agncy88179" },
  { id: "jessica-bailey", name: "Jessica Bailey", handle: "@agncy67171" },
  { id: "lola-durant", name: "Lola Durant", handle: "@agncy72176" },
] as const;

function Panel({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return <section className={cn("rounded-[13px] border border-[#3a3a3a] bg-[#050505]", className)}>{children}</section>;
}

function StatusPill({ status }: { status: string }) {
  const normalized = status.toLowerCase();
  const colorClass =
    normalized === "paid"
      ? "border-[#10b95f] bg-[#082315] text-[#70ff9e]"
      : normalized === "processing"
        ? "border-[#ff8a00] bg-[#261603] text-[#ffb866]"
        : normalized === "needs approval"
          ? "border-[#ff3b30] bg-[#250706] text-[#ff9088]"
          : "border-[#3f3f3f] bg-[#0f0f0f] text-[#d7d7d7]";

  return (
    <span className={cn("inline-flex h-7 items-center rounded-[7px] border px-3 text-[12px] font-semibold", colorClass)}>
      {status}
    </span>
  );
}

function RequestPayPill() {
  return (
    <span className="inline-flex h-9 min-w-[150px] items-center justify-center gap-1.5 rounded-full border-2 border-[#10d874] bg-black px-4 text-[13px] font-black text-white shadow-[0_0_0_1px_rgba(16,216,116,0.12)]">
      <span>Request</span>
      <AgncyPayLogo className="h-[16px] w-[40px]" imageClassName="h-full w-full" />
    </span>
  );
}

function InvoiceStatusPill({ invoice }: { invoice: (typeof dashboardInvoices)[number] }) {
  if (invoice.id === "MB-6984" && invoice.status.toLowerCase() === "ready") {
    return <RequestPayPill />;
  }

  return <StatusPill status={invoice.status} />;
}

function PayeeLogoTile({
  invoice,
  size = "md",
}: {
  invoice: (typeof dashboardInvoices)[number];
  size?: "sm" | "md";
}) {
  const config = payeeLogoByInvoiceId[invoice.id];
  const name = getInvoicePersonName(invoice);
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
      <span className={cn(size === "sm" ? "text-[12px]" : "text-[15px]", "font-black", config?.markClassName)}>
        {mark}
      </span>
      {config?.detail && size === "md" ? (
        <span className="mt-1 max-w-full px-1 text-[6px] font-black tracking-[0.12em] opacity-75">
          {config.detail}
        </span>
      ) : null}
    </div>
  );
}

function BrandTile({
  label,
  href,
  src,
  fallback,
  search,
}: {
  label: string;
  href: string;
  src?: string;
  fallback: string;
  search?: boolean;
}) {
  return (
    <Link
      href={href}
      className="flex min-w-0 flex-col items-center gap-2 text-center"
      aria-label={label}
    >
      <div className="flex h-[68px] w-[68px] items-center justify-center overflow-hidden rounded-[12px] border border-[#5a5a5a] bg-white p-3 shadow-[0_0_0_1px_rgba(255,255,255,0.02)]">
        {search ? (
          <Search className="h-6 w-6 text-black" />
        ) : src ? (
          <RemoteBrandImage
            src={src}
            alt={label}
            fallback={fallback}
            className="h-full w-full"
            imageClassName="object-contain"
          />
        ) : (
          <span className="text-[12px] font-semibold text-black">{fallback}</span>
        )}
      </div>
      <span className="max-w-[78px] text-[12px] leading-4 text-[#b8b8b8]">{label}</span>
    </Link>
  );
}

function BankCardFace({ card }: { card: (typeof bankCards)[number] }) {
  return (
    <div className="relative h-16 w-[104px] shrink-0 overflow-hidden rounded-[8px] bg-black">
      <RemoteBrandImage
        src={card.cardImage}
        alt={card.name}
        fallback={card.fallback}
        className="h-full w-full rounded-[inherit] bg-black"
        imageClassName="h-full w-full object-cover"
      />
    </div>
  );
}

function AutoSplitToggle({
  active,
  onToggle,
  label = "Autosplit",
}: {
  active: boolean;
  onToggle: () => void;
  label?: string;
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
      {label}
    </button>
  );
}

function AutoSplitNotice({
  onClose,
}: {
  onClose: () => void;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/65 px-4 backdrop-blur-[1px]">
      <div className="w-full max-w-[430px] rounded-[9px] border border-[#3a3a3a] bg-[#101010] p-6 text-white shadow-2xl">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 className="text-[22px] font-black">Autosplit enabled</h2>
            <p className="mt-3 text-[14px] font-semibold leading-6 text-[#bdbdbd]">
              AgncyPay will include a $5 autosplit fee when this invoice or contact is paid.
            </p>
          </div>
          <button type="button" onClick={onClose} aria-label="Close autosplit notice">
            <X className="h-5 w-5" />
          </button>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="mt-6 h-10 w-full rounded-[7px] border border-white bg-white text-[13px] font-black text-black hover:bg-[#e8e8e8]"
        >
          Got it
        </button>
      </div>
    </div>
  );
}

function WalletContactsOverlay({
  query,
  autosplitContactIds,
  onQueryChange,
  onClose,
  onToggleContact,
  onEnableAll,
}: {
  query: string;
  autosplitContactIds: string[];
  onQueryChange: (value: string) => void;
  onClose: () => void;
  onToggleContact: (contactId: string) => void;
  onEnableAll: () => void;
}) {
  const normalized = query.trim().toLowerCase();
  const filteredContacts = normalized
    ? walletContacts.filter((contact) =>
        [contact.name, contact.handle].join(" ").toLowerCase().includes(normalized)
      )
    : walletContacts;

  return (
    <div className="fixed inset-0 z-40 bg-black/55 px-4 py-16 backdrop-blur-[1px]">
      <div className="mx-auto w-full max-w-[760px]">
        <div className="relative">
          <Search className="pointer-events-none absolute left-5 top-1/2 h-5 w-5 -translate-y-1/2 text-[#8b8b8b]" />
          <input
            autoFocus
            value={query}
            onChange={(event) => onQueryChange(event.target.value)}
            placeholder="Name, Agncy ID, email, mobile"
            className="h-[58px] w-full rounded-full border border-[#555] bg-[#2b2929] pl-14 pr-14 text-[14px] font-black text-white outline-none placeholder:text-[#a7a7a7]"
          />
          <button
            type="button"
            onClick={onClose}
            className="absolute right-5 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full text-white hover:bg-white/[0.08]"
            aria-label="Close wallet contacts"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="mt-2 rounded-[7px] border border-[#343434] bg-black px-8 py-8">
          <p className="text-[14px] font-black text-white">Recent searches</p>
          <div className="mt-6 space-y-4">
            {filteredContacts.map((contact) => {
              const active = autosplitContactIds.includes(contact.id);
              return (
                <div key={contact.id} className="flex items-center justify-between gap-4">
                  <div className="min-w-0">
                    <p className="truncate text-[20px] font-black text-white">{contact.name}</p>
                    <p className="mt-1 truncate text-[13px] font-semibold text-[#9b9b9b]">{contact.handle}</p>
                  </div>
                  <AutoSplitToggle
                    active={active}
                    label="Autosplit"
                    onToggle={() => onToggleContact(contact.id)}
                  />
                </div>
              );
            })}
          </div>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <button
              type="button"
              onClick={() => onQueryChange("")}
              className="text-[13px] font-black text-[#22e03b] underline"
            >
              Clear all
            </button>
            <button
              type="button"
              onClick={onEnableAll}
              className="h-10 rounded-[7px] border border-[#13e56d] bg-[#0d2b18] px-4 text-[13px] font-black text-white"
            >
              Autosplit all talent invoices
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function DashboardFooter() {
  return (
    <footer className="mt-8 border-y border-[#343434]">
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

export default function DashboardHomePage() {
  const router = useRouter();
  const [autosplitInvoiceIds, setAutosplitInvoiceIds] = useState<string[]>([dashboardInvoices[0]?.id || ""]);
  const [autosplitContactIds, setAutosplitContactIds] = useState<string[]>([]);
  const [isAutosplitNoticeOpen, setIsAutosplitNoticeOpen] = useState(false);
  const [isWalletContactsOpen, setIsWalletContactsOpen] = useState(false);
  const [walletContactQuery, setWalletContactQuery] = useState("");

  const toggleAutosplitInvoice = (invoiceId: string) => {
    const isActive = autosplitInvoiceIds.includes(invoiceId);
    if (!isActive) setIsAutosplitNoticeOpen(true);
    setAutosplitInvoiceIds((current) =>
      isActive ? current.filter((id) => id !== invoiceId) : [...current, invoiceId]
    );
  };

  const toggleAutosplitContact = (contactId: string) => {
    const isActive = autosplitContactIds.includes(contactId);
    if (!isActive) setIsAutosplitNoticeOpen(true);
    setAutosplitContactIds((current) =>
      isActive ? current.filter((id) => id !== contactId) : [...current, contactId]
    );
  };

  const enableAllContactAutosplit = () => {
    setAutosplitContactIds(walletContacts.map((contact) => contact.id));
    setIsAutosplitNoticeOpen(true);
  };

  return (
    <main className="min-h-screen bg-black text-white">
      <div className="mx-auto max-w-[1520px] px-4 py-4 sm:px-6 lg:px-8">
        <div className="flex flex-nowrap items-center justify-between gap-4 pb-4">
          <div className="flex min-w-0 flex-nowrap items-center gap-2 overflow-x-auto">
            <Link
              href="/dashboard/booking"
              className="inline-flex h-9 shrink-0 items-center rounded-[4px] border border-white bg-white px-4 text-[12px] font-semibold uppercase text-[#1a1a1a]"
            >
              Booking Dashboard
            </Link>
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
          <AgncyPayLogo className="h-[28px] w-[72px] shrink-0" imageClassName="h-full w-full" />
        </div>

        <div className="grid grid-cols-1 gap-5 xl:grid-cols-[minmax(0,1.15fr)_minmax(360px,0.85fr)]">
          <div className="space-y-5">
            <Panel className="p-4 sm:p-5">
              <div className="grid grid-cols-1 gap-4 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)]">
                <div className="relative overflow-hidden rounded-[10px] border border-[#3a3a3a] bg-black">
                  <div className="absolute inset-0 bg-[linear-gradient(135deg,rgba(255,255,255,0.05)_0%,rgba(255,255,255,0.02)_42%,rgba(255,255,255,0)_100%)]" />
                  <div className="relative h-[260px] sm:h-[280px]">
                    <Image
                      src="/heroimage.png"
                      alt="AgncyPay payment card visual"
                      fill
                      priority
                      className="object-contain object-left-bottom"
                    />
                  </div>
                </div>

                <div className="flex flex-col justify-between rounded-[10px] border border-[#3a3a3a] bg-[#060606] p-4 sm:p-5">
                  <div>
                    <AgncyPayLogo imageClassName="h-5" />
                    <h1 className="mt-2 max-w-[340px] text-[30px] font-semibold leading-[0.96] text-white sm:text-[38px]">
                      For Those Who Create
                    </h1>
                    <p className="mt-3 max-w-[350px] text-[14px] leading-6 text-[#949494]">
                      A clean post-login home for payouts, invoices, cards, and bank setup.
                    </p>
                  </div>

                  <div className="mt-5 flex flex-wrap gap-2">
                    <button className="inline-flex h-9 items-center gap-2 rounded-[7px] border border-white bg-white px-3 text-[12px] font-semibold text-black">
                      <img
                        src="https://www.google.com/s2/favicons?domain=play.google.com&sz=64"
                        alt="Google Play"
                        className="h-4 w-4 rounded-[3px] object-contain"
                        loading="lazy"
                        referrerPolicy="no-referrer"
                      />
                      Google Play
                    </button>
                    <button className="inline-flex h-9 items-center gap-2 rounded-[7px] border border-[#2f2f2f] bg-[#0b0b0b] px-3 text-[12px] font-semibold text-white">
                      <img
                        src="https://www.google.com/s2/favicons?domain=apple.com&sz=64"
                        alt="App Store"
                        className="h-4 w-4 rounded-[3px] object-contain"
                        loading="lazy"
                        referrerPolicy="no-referrer"
                      />
                      App Store
                    </button>
                  </div>
                </div>
              </div>
            </Panel>

            <Panel className="p-4 sm:p-5">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <h2 className="text-[18px] font-semibold text-white">Recent Payouts</h2>
                  <p className="mt-1 text-[13px] text-[#8f8f8f]">Your latest account activity.</p>
                </div>
                <Link
                  href="/dashboard/payments"
                  className="inline-flex items-center gap-2 rounded-[7px] border border-[#333] bg-[#0b0b0b] px-3 py-2 text-[12px] font-semibold text-white"
                >
                  View All
                  <ChevronRight className="h-4 w-4" />
                </Link>
              </div>

              <div className="mt-4 space-y-2">
                {payoutItems.map((item) => (
                  <Link
                    key={`${item.name}-${item.date}`}
                    href={`/dashboard/pay-flow/${item.invoiceId}`}
                    className="flex items-center gap-3 rounded-[8px] border border-[#333] bg-black px-3 py-2 transition-colors hover:border-[#555] hover:bg-white/[0.04]"
                  >
                    <PayeeLogoTile invoice={item.invoice} />
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-[13px] font-semibold text-white">{item.name}</p>
                      <p className="truncate text-[11px] text-[#7f7f7f]">{item.detail}</p>
                    </div>
                    <div className="hidden text-right text-[11px] text-[#7f7f7f] sm:block">{item.date}</div>
                    <div className="min-w-[92px] text-right text-[13px] font-semibold text-white">
                      {item.amount}
                    </div>
                    <span className="flex h-8 w-8 items-center justify-center rounded-full text-[#7f7f7f]">
                      <EllipsisVertical className="h-4 w-4" />
                    </span>
                  </Link>
                ))}
              </div>
            </Panel>

            <Panel className="overflow-hidden">
              <div className="flex items-center justify-between border-b border-[#333] p-4 sm:p-5">
                <div>
                  <h2 className="text-[18px] font-semibold text-white">Invoices</h2>
                  <p className="mt-1 text-[13px] text-[#8f8f8f]">
                    Autosplit, status, due, amount, client. Select an invoice to inspect or pay.
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <Link
                    href="/dashboard/invoices"
                    className="inline-flex items-center gap-2 rounded-[7px] border border-[#333] bg-[#0b0b0b] px-3 py-2 text-[12px] font-semibold text-white"
                  >
                    Open invoices
                    <ArrowUpRight className="h-4 w-4" />
                  </Link>
                </div>
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
                      <th className="px-0">Talent / Payee</th>
                    </tr>
                  </thead>
                  <tbody>
                    {dashboardInvoices.map((invoice) => (
                      <tr
                        key={invoice.id}
                        onClick={() => router.push(`/dashboard/pay-flow/${invoice.id}`)}
                        onKeyDown={(event) => {
                          if (event.key === "Enter" || event.key === " ") {
                            event.preventDefault();
                            router.push(`/dashboard/pay-flow/${invoice.id}`);
                          }
                        }}
                        role="button"
                        tabIndex={0}
                        className="h-[72px] cursor-pointer border-b border-[#2c2c2c] transition-colors hover:bg-white/[0.04] focus:bg-white/[0.05] focus:outline-none"
                      >
                        <td className="px-4">
                          <span className="font-mono text-[13px] font-semibold text-white">
                            {invoice.id}
                          </span>
                        </td>
                        <td className="px-0">
                          <AutoSplitToggle
                            active={autosplitInvoiceIds.includes(invoice.id)}
                            onToggle={() => toggleAutosplitInvoice(invoice.id)}
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
                              <p className="truncate text-[13px] font-semibold text-white">{getInvoicePersonName(invoice)}</p>
                              <p className="truncate text-[11px] text-[#7f7f7f]">{invoice.recipient} - {invoice.jobType}</p>
                            </div>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Panel>

            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
              <Panel className="flex min-h-[190px] flex-col justify-between p-4 sm:p-5">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-[12px] font-semibold uppercase tracking-[0.12em] text-[#777]">Card program</p>
                    <h3 className="mt-2 text-[24px] font-semibold text-white">AgncyPay Card</h3>
                  </div>
                  <span className="inline-flex h-7 items-center rounded-full border border-[#14c96b] bg-[#082315] px-3 text-[11px] font-black text-[#70ff9e]">
                    Active
                  </span>
                </div>
                <div className="mt-5 grid grid-cols-3 gap-2">
                  {[
                    ["Available", "$24,500"],
                    ["Pending", "$3,200"],
                    ["Cards", "4"],
                  ].map(([label, value]) => (
                    <div key={label} className="rounded-[8px] border border-[#2f2f2f] bg-black px-3 py-3">
                      <p className="text-[11px] font-semibold text-[#777]">{label}</p>
                      <p className="mt-2 truncate text-[15px] font-black text-white">{value}</p>
                    </div>
                  ))}
                </div>
                <div className="mt-5 flex items-center justify-between gap-4">
                  <p className="text-[12px] font-semibold leading-5 text-[#8f8f8f]">
                    Virtual and physical cards for approved workspace spend.
                  </p>
                  <Link
                    href="/dashboard/wallet/link"
                    className="inline-flex h-9 shrink-0 items-center rounded-[7px] border border-[#333] bg-[#111] px-3 text-[12px] font-semibold text-white hover:border-[#666]"
                  >
                    Manage
                  </Link>
                </div>
              </Panel>

              <Panel className="overflow-hidden p-4 sm:p-5">
                <div className="flex min-h-[190px] flex-col justify-between">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="text-[12px] font-semibold uppercase tracking-[0.12em] text-[#777]">Primary card</p>
                      <h3 className="mt-2 text-[22px] font-semibold text-white">Workspace Mastercard</h3>
                      <p className="mt-2 text-[12px] font-semibold text-[#8f8f8f]">•••• 0001 · Monthly controls enabled</p>
                    </div>
                    <div className="h-[118px] w-[188px] shrink-0 overflow-hidden rounded-[11px] border border-[#333] bg-[#101010] p-3 shadow-[0_18px_42px_rgba(0,0,0,0.42)]">
                      <div className="h-full w-full rounded-[9px] bg-[linear-gradient(135deg,#171717_0%,#2a2440_52%,#111_100%)] p-3">
                        <div className="flex items-start justify-between">
                          <AgncyPayLogo imageClassName="w-[48px]" />
                          <img
                            src="https://cdn.simpleicons.org/mastercard/FFFFFF"
                            alt="Mastercard"
                            className="h-4 w-4 object-contain"
                            loading="lazy"
                            referrerPolicy="no-referrer"
                          />
                        </div>
                        <div className="mt-8 space-y-1.5">
                          <div className="h-1.5 w-20 rounded-full bg-white/20" />
                          <div className="h-1.5 w-14 rounded-full bg-white/12" />
                        </div>
                        <div className="mt-6 flex items-end justify-between">
                          <p className="text-[9px] font-black uppercase tracking-[0.14em] text-white/55">Virtual</p>
                          <p className="text-[10px] font-black text-white/75">0001</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="mt-5 grid grid-cols-3 gap-2">
                    {[
                      ["Limit", "$10k"],
                      ["Spent", "$1.2k"],
                      ["Review", "2"],
                    ].map(([label, value]) => (
                      <div key={label} className="rounded-[8px] border border-[#2f2f2f] bg-black px-3 py-2">
                        <p className="text-[10px] font-semibold text-[#777]">{label}</p>
                        <p className="mt-1 text-[14px] font-black text-white">{value}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </Panel>
            </div>
          </div>

          <div className="space-y-5">
            <Panel className="p-4 sm:p-5">
              <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                {quickActions.map((action) => {
                  const Icon = action.icon;
                  const baseClassName =
                    "flex flex-col items-center gap-2 rounded-[10px] border border-[#3a3a3a] bg-[#090909] px-2 py-3 text-center transition-colors hover:border-[#666]";

                  if (action.label === "Wallet ID contacts") {
                    return (
                      <button
                        key={action.label}
                        type="button"
                        onClick={() => setIsWalletContactsOpen(true)}
                        className={baseClassName}
                      >
                        <span className="flex h-10 w-10 items-center justify-center rounded-[9px] border border-[#4a4a4a] bg-black">
                          <Icon className="h-5 w-5 text-white" />
                        </span>
                        <span className="text-[10px] leading-4 text-white">{action.label}</span>
                      </button>
                    );
                  }

                  return (
                    <Link
                      key={action.label}
                      href={action.href}
                      className={baseClassName}
                    >
                      <span className="flex h-10 w-10 items-center justify-center rounded-[9px] border border-[#4a4a4a] bg-black">
                        <Icon className="h-5 w-5 text-white" />
                      </span>
                      <span className="text-[10px] leading-4 text-white">{action.label}</span>
                    </Link>
                  );
                })}
              </div>
            </Panel>

            <Panel className="p-4 sm:p-5">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <h2 className="text-[18px] font-semibold text-white">Shortcuts</h2>
                  <p className="mt-1 text-[13px] text-[#8f8f8f]">Quick brand and search access.</p>
                </div>
              </div>
              <div className="mt-4 grid grid-cols-5 gap-3">
                {brandShortcuts.map((item) => (
                  <BrandTile key={item.label} {...item} />
                ))}
              </div>
            </Panel>

            <Panel className="p-4 sm:p-5">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <h2 className="text-[18px] font-semibold text-white">Banks and Cards</h2>
                </div>
              </div>

              <div className="mt-4 space-y-3">
                {bankCards.map((card) => (
                  <div
                    key={card.name}
                    className="flex items-center gap-3 rounded-[10px] border border-[#3a3a3a] bg-[#090909] p-3"
                  >
                    <BankCardFace card={card} />
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-[14px] font-semibold text-white">{card.name}</p>
                      <p className="mt-1 text-[12px] text-[#8f8f8f]">{card.detail}</p>
                    </div>
                  </div>
                ))}
              </div>

              <Link
                href="/dashboard/wallet/link"
                className="mt-4 inline-flex h-10 items-center gap-2 rounded-[7px] border border-[#333] bg-[#0b0b0b] px-3 text-[12px] font-semibold text-white hover:border-[#666]"
              >
                Link a card or bank
                <ChevronRight className="h-4 w-4" />
              </Link>
            </Panel>

            <Panel className="overflow-hidden p-4 sm:p-5">
              <div className="flex items-start justify-between gap-4">
                <div className="min-w-0">
                  <p className="text-[13px] font-black uppercase tracking-[0.12em] text-[#a9a9a9]">Plaid</p>
                  <h2 className="mt-1 text-[22px] font-semibold text-white">Connect Bank</h2>
                  <p className="mt-2 max-w-[280px] text-[13px] leading-5 text-[#8f8f8f]">
                    Link your payout method to receive monthly royalty distributions automatically.
                  </p>
                </div>
                <span className="inline-flex h-10 shrink-0 items-center rounded-[7px] border border-[#333] bg-white px-3">
                  <img
                    src="/plaid-logo.svg"
                    alt="Plaid"
                    className="h-6 w-[84px] object-contain"
                    loading="lazy"
                  />
                </span>
              </div>

              <div className="mt-5 flex items-center justify-between gap-4">
                <Link
                  href="/dashboard/wallet"
                  className="inline-flex h-9 items-center rounded-[7px] border border-white bg-white px-3 text-[12px] font-semibold text-black"
                >
                  Set Up Payouts
                </Link>
                <span className="text-[11px] text-[#7f7f7f]">Secure bank linking</span>
              </div>
            </Panel>
          </div>
        </div>
      </div>
      {isWalletContactsOpen && (
        <WalletContactsOverlay
          query={walletContactQuery}
          autosplitContactIds={autosplitContactIds}
          onQueryChange={setWalletContactQuery}
          onClose={() => setIsWalletContactsOpen(false)}
          onToggleContact={toggleAutosplitContact}
          onEnableAll={enableAllContactAutosplit}
        />
      )}
      {isAutosplitNoticeOpen && <AutoSplitNotice onClose={() => setIsAutosplitNoticeOpen(false)} />}
      <DashboardFooter />
    </main>
  );
}
