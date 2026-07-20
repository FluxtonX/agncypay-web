"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowUpRight,
  BarChart3,
  ChevronRight,
  CreditCard,
  EllipsisVertical,
  Play,
  Search,
  Send,
  Settings,
  Users,
  X,
  Loader2,
  Sparkles,
  RefreshCw,
  Check,
  Wallet,
  Lock,
  LogOut,
} from "lucide-react";
import { cn } from "../../lib/utils";
import { mainboardInvoices, formatMainboardMoney, type MainboardInvoice } from "../../lib/mainboard";
import { useApp } from "../../context/AppContext";
import { subscribeInvoicesByAgency, subscribeInvoicesByTalent } from "../../lib/firebaseInvoices";
import { ModelIncomeList, ModelPayoutsList, CsvDropzonePanel } from "../../components/dashboard/ModelAgencyDashboard";

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
  { label: "Analytics", icon: BarChart3, href: "/dashboard/reports" },
  { label: "Wallet ID contacts", icon: Users, href: "/dashboard/profile" },
  { label: "More", icon: EllipsisVertical, href: "/dashboard/settings" },
] as const;

/*
const oldBrandShortcuts = [
  { label: "Nike", src: "https://cdn.simpleicons.org/nike/000000", fallback: "Nike", href: "/mainboard" },
  { label: "Zara", src: "https://cdn.simpleicons.org/zara/000000", fallback: "Zara", href: "/mainboard" },
  { label: "Adidas", src: "https://upload.wikimedia.org/wikipedia/commons/2/20/Adidas_Logo.svg", fallback: "Adidas", href: "/mainboard" },
  { label: "Spotify", src: "https://cdn.simpleicons.org/spotify/1DB954", fallback: "Spotify", href: "/mainboard" },
  { label: "Netflix", src: "https://cdn.simpleicons.org/netflix/E50914", fallback: "Netflix", href: "/mainboard" },
] as const;
*/

const brandShortcuts = [
  {
    label: "TikTok",
    src: "/tiktok.png",
    fallback: "TikTok",
    href: "/dashboard/income/tiktok",
    tileClassName: "bg-transparent p-0",
    imageClassName: "scale-[3.2]",
  },
  {
    label: "iHeartRadio",
    src: "/iheart.png",
    fallback: "iHeart",
    href: "/dashboard/income/iheart-radio",
    tileClassName: "bg-transparent p-0",
    imageClassName: "scale-[3.2]",
  },
  {
    label: "Instagram",
    src: "/instagram.png",
    fallback: "Instagram",
    href: "/dashboard/income/instagram",
    tileClassName: "bg-transparent p-0",
    imageClassName: "scale-[3.2]",
  },
  {
    label: "Pandora",
    src: "/pandora.png",
    fallback: "Pandora",
    href: "/dashboard/income/pandora",
    tileClassName: "bg-transparent p-0",
    imageClassName: "scale-[3.2]",
  },
  {
    label: "Tidal",
    src: "/tidal.png",
    fallback: "Tidal",
    href: "/dashboard/income/tidal",
    tileClassName: "bg-transparent p-0",
    imageClassName: "scale-[3.2]",
  },
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

const musicIncomeItems = [
  {
    slug: "soundcloud",
    name: "SoundCloud",
    detail: "Q3 Stream revenue",
    date: "Today, 10:24 AM",
    amount: "$3,040.00",
    src: "https://cdn.simpleicons.org/soundcloud/FFFFFF",
    fallback: "SC",
    className: "bg-[#ff5500]",
    imageClassName: "scale-[0.82]",
  },
  {
    slug: "amazon-music",
    name: "Amazon Music",
    detail: "Q3 Stream revenue",
    date: "Today, 9:42 AM",
    amount: "$9,805.25",
    src: "/logo-tiles/amazonMusic.png",
    fallback: "AM",
    className: "bg-[#2ccfd2]",
    imageClassName: "scale-[1.18] -translate-x-[14%] -translate-y-[14%]",
  },
  {
    slug: "apple-music",
    name: "Apple Music",
    detail: "Q3 Stream revenue",
    date: "Yesterday",
    amount: "$3,500.00",
    src: "/logo-tiles/appleMusic.png",
    fallback: "Apple",
    className: "bg-[linear-gradient(135deg,#fa2d48,#fb1ba5)]",
    imageClassName: "scale-[1.18] -translate-x-[14%] -translate-y-[14%]",
  },
  {
    slug: "spotify",
    name: "Spotify",
    detail: "Q3 Stream revenue",
    date: "May 31",
    amount: "$2,600.00",
    src: "https://cdn.simpleicons.org/spotify/1DB954",
    fallback: "Spotify",
    className: "bg-black",
    imageClassName: "scale-[0.78]",
  },
  {
    slug: "youtube",
    name: "Youtube",
    detail: "Q3 Stream revenue",
    date: "May 24",
    amount: "$1,800.00",
    src: "https://cdn.simpleicons.org/youtube/FFFFFF",
    fallback: "YT",
    className: "bg-[#ff0000]",
    imageClassName: "scale-[0.72]",
  },
] as const;

const yearlyActivity = [
  { month: "Jan", label: "J", height: 44, revenue: "$214K", streams: "4.2M", growth: "+8.4%" },
  { month: "Feb", label: "F", height: 60, revenue: "$286K", streams: "5.7M", growth: "+12.1%" },
  { month: "Mar", label: "M", height: 37, revenue: "$181K", streams: "3.6M", growth: "-3.8%" },
  { month: "Apr", label: "A", height: 66, revenue: "$314K", streams: "6.3M", growth: "+15.4%" },
  { month: "May", label: "M", height: 50, revenue: "$242K", streams: "4.9M", growth: "+6.2%" },
  { month: "Jun", label: "J", height: 56, revenue: "$269K", streams: "5.4M", growth: "+9.1%" },
  { month: "Jul", label: "J", height: 71, revenue: "$337K", streams: "6.9M", growth: "+18.7%" },
  { month: "Aug", label: "A", height: 44, revenue: "$218K", streams: "4.4M", growth: "+4.0%" },
  { month: "Sep", label: "S", height: 62, revenue: "$298K", streams: "6.0M", growth: "+11.8%" },
  { month: "Oct", label: "O", height: 76, revenue: "$361K", streams: "7.2M", growth: "+21.3%" },
  { month: "Nov", label: "N", height: 52, revenue: "$251K", streams: "5.1M", growth: "+7.6%" },
  { month: "Dec", label: "D", height: 86, revenue: "$407K", streams: "8.1M", growth: "+26.9%" },
] as const;

const dashboardInvoices: MainboardInvoice[] = [];

const dashboardPeopleByInvoiceId: Record<string, string> = {};

const payeeLogoByInvoiceId: Record<
  string,
  {
    mark: string;
    label: string;
    detail?: string;
    src?: string;
    className: string;
    markClassName?: string;
  }
> = {};

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
  return <section className={cn("rounded-[13px] border border-white/20 bg-[#050505]", className)}>{children}</section>;
}

function FinanceAppPromoCard({ className }: { className?: string }) {
  return (
    <Panel className={cn("overflow-hidden p-0", className)}>
      <img
        src="/dashboard-app-promo.png"
        alt="For Those Who Create — Get AgncyPay on Google Play and the App Store"
        className="block h-auto w-full rounded-[12px]"
        loading="lazy"
      />
    </Panel>
  );
}

function getInvoiceStatusLabel(status: string): "Request" | "Paid" | "Pay" {
  const normalized = status.toLowerCase();
  if (normalized === "paid") return "Paid";
  if (normalized === "ready" || normalized === "pending") return "Request";
  return "Pay";
}

function InvoiceStatusPill({ invoice }: { invoice: (typeof dashboardInvoices)[number] }) {
  const label = getInvoiceStatusLabel(invoice.status);
  const colorClass =
    label === "Paid"
      ? "border-[#10b95f] bg-[#082315] text-[#70ff9e]"
      : label === "Pay"
        ? "border-[#ff3b30] bg-[#250706] text-[#ff9088]"
        : "border-[#ff8a00] bg-[#261603] text-[#ffb866]";

  return (
    <span className={cn("inline-flex h-7 items-center rounded-[7px] border px-2.5 text-[12px] font-semibold", colorClass)}>
      {label}
    </span>
  );
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
      {config?.src ? (
        <RemoteBrandImage
          src={config.src}
          alt={config.label}
          fallback={config.label}
          className={cn("h-full w-full", size === "sm" ? "p-1.5" : "p-2")}
          imageClassName="object-contain"
        />
      ) : (
        <span className={cn(size === "sm" ? "text-[12px]" : "text-[15px]", "font-black", config?.markClassName)}>
          {mark}
        </span>
      )}
      {!config?.src && config?.detail && size === "md" ? (
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
  tileClassName,
  imageClassName,
  search,
}: {
  label: string;
  href?: string;
  src?: string;
  fallback: string;
  tileClassName?: string;
  imageClassName?: string;
  search?: boolean;
}) {
  const Component = href ? Link : "button";
  return (
    <Component
      href={href as string}
      className="flex min-w-0 flex-col items-center gap-2 text-center"
      aria-label={label}
    >
      <div className="flex h-[72px] w-[72px] items-center justify-center rounded-[12px] border border-[#303030] bg-[#060606] p-[3px] shadow-[0_0_0_1px_rgba(255,255,255,0.02)]">
        {search ? (
          <div className={cn("flex h-full w-full items-center justify-center overflow-hidden rounded-[9px]", tileClassName)}>
            <Search className="h-6 w-6 text-black" />
          </div>
        ) : src ? (
          <div className={cn("h-full w-full overflow-hidden rounded-[9px]", tileClassName)}>
            <RemoteBrandImage
              src={src}
              alt={label}
              fallback={fallback}
              className="h-full w-full"
              imageClassName={cn("object-contain", imageClassName)}
            />
          </div>
        ) : (
          <div className={cn("flex h-full w-full items-center justify-center overflow-hidden rounded-[9px]", tileClassName)}>
            <span className="text-[12px] font-semibold text-black">{fallback}</span>
          </div>
        )}
      </div>
      <span className="max-w-[78px] text-[12px] leading-4 text-[#b8b8b8]">{label}</span>
    </Component>
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

function MusicIncomeLogo({ item }: { item: (typeof musicIncomeItems)[number] }) {
  return (
    <div
      className={cn(
        "flex h-12 w-12 shrink-0 items-center justify-center rounded-[10px] border border-[#303030] bg-[#060606] p-[3px]"
      )}
    >
      <div className={cn("h-full w-full overflow-hidden rounded-[8px]", item.className)}>
        <RemoteBrandImage
          src={item.src}
          alt={item.name}
          fallback={item.fallback}
          className="h-full w-full"
          imageClassName={cn("object-contain", item.imageClassName)}
        />
      </div>
    </div>
  );
}

function CatalogValuationPanel() {
  const [liveTotalIncome] = useState(3657001);

  return (
    <div className="space-y-3">
      <Link
        href="https://catalogcalculator.com/"
        className="flex h-[50px] items-center justify-center rounded-[11px] bg-[#16cf55] px-4 text-center text-[24px] font-black text-[#08240f] transition-colors hover:bg-[#23df65]"
      >
        Catalog Valuation
        <Play className="ml-2 h-6 w-6 fill-current" />
      </Link>

      <Panel className="p-4 sm:p-6">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-[1fr_1fr]">
          <div className="flex min-h-[170px] flex-col items-center justify-center rounded-[14px] border border-[#242424] bg-[#171717] p-5 text-center">
            <p className="text-[24px] leading-8 text-[#a7a7a7]">
              Total Income
              <br />
              2026:
            </p>
            <p className="mt-3 text-[36px] font-black leading-none text-[#13d463]">${liveTotalIncome.toLocaleString()}</p>
          </div>

          <div className="flex min-h-[170px] flex-col justify-between rounded-[14px] border border-[#242424] bg-[#171717] p-5">
            <div>
              <p className="text-[20px] text-[#a7a7a7]">Payment Due</p>
              <p className="mt-3 text-[31px] font-semibold leading-none text-white">1 Apr</p>
            </div>
            <button
              type="button"
              className="h-10 rounded-[8px] border border-[#454545] bg-[#222] text-[18px] font-semibold text-white transition-colors hover:border-[#777]"
            >
              Pay Early
            </button>
          </div>
        </div>

        <div className="mt-4 rounded-[14px] border border-[#242424] bg-[#171717] px-5 py-6">
          <p className="text-[20px] text-[#a7a7a7]">Yearly Activity</p>
          <div className="mt-5 grid h-[128px] grid-cols-12 items-end gap-3 overflow-visible">
            {yearlyActivity.map((month) => (
              <button
                key={month.month}
                type="button"
                className="group relative flex h-full min-w-0 flex-col items-center justify-end gap-2 outline-none"
                aria-label={`${month.month}: ${month.revenue} revenue, ${month.streams} streams, ${month.growth} growth`}
              >
                <span className="pointer-events-none absolute bottom-[calc(100%+10px)] left-1/2 z-10 w-[124px] -translate-x-1/2 translate-y-1 rounded-[7px] border border-[#2f2f2f] bg-[#0b0b0b] px-3 py-2 text-left opacity-0 shadow-2xl transition-all duration-200 group-hover:translate-y-0 group-hover:opacity-100 group-focus-visible:translate-y-0 group-focus-visible:opacity-100">
                  <span className="block text-[11px] font-black text-white">{month.month}</span>
                  <span className="mt-1 block text-[10px] font-semibold text-[#8f8f8f]">Revenue {month.revenue}</span>
                  <span className="block text-[10px] font-semibold text-[#8f8f8f]">Streams {month.streams}</span>
                  <span className={cn("mt-1 block text-[10px] font-black", month.growth.startsWith("-") ? "text-[#ff6b5f]" : "text-[#13d463]")}>
                    {month.growth}
                  </span>
                </span>
                <div
                  className="w-full max-w-[30px] rounded-t-[4px] bg-[#13d463] shadow-[0_0_0_rgba(19,212,99,0)] transition-all duration-300 ease-out group-hover:-translate-y-1 group-hover:bg-[#20f076] group-hover:shadow-[0_0_18px_rgba(19,212,99,0.45)] group-focus-visible:-translate-y-1 group-focus-visible:bg-[#20f076] group-focus-visible:shadow-[0_0_18px_rgba(19,212,99,0.45)]"
                  style={{ height: `${month.height}%` }}
                />
                <span className="text-[14px] font-semibold text-[#676767] transition-colors duration-200 group-hover:text-white group-focus-visible:text-white">
                  {month.label}
                </span>
              </button>
            ))}
          </div>
        </div>
      </Panel>
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

function PendingBalancePanel({
  widgetInvoices,
  userEmail,
}: {
  widgetInvoices: any[];
  userEmail: string;
}) {
  const myInvoices = widgetInvoices.filter(
    (i) => i.talentEmail?.toLowerCase() === userEmail?.toLowerCase()
  );

  // Pending = brand paid but talent hasn't received yet
  const pendingInvoices = myInvoices.filter(
    (i) => i.status === "paid" && i.talentPayoutStatus === "pending"
  );
  const pendingAmount = pendingInvoices.reduce(
    (sum, i) => sum + Number(i.amount) * 0.85,
    0
  );

  // Total ever disbursed to talent
  const disbursedAmount = myInvoices
    .filter((i) => i.talentPayoutStatus === "disbursed")
    .reduce((sum, i) => sum + Number(i.amount) * 0.85, 0);

  const pendingCount = pendingInvoices.length;

  return (
    <Panel className="p-5 relative overflow-hidden border-white/20">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-[20px] font-bold text-white tracking-tight">Pending Balance</h2>
          <p className="text-[12px] text-[#8E8E93] mt-1">Earnings awaiting disbursement to your account.</p>
        </div>
        {pendingCount > 0 && (
          <span className="inline-flex h-6 items-center rounded-full bg-[#1a2614] border border-[#10b95f]/30 px-2.5 text-[11px] font-black text-[#70ff9e]">
            {pendingCount} invoice{pendingCount !== 1 ? "s" : ""}
          </span>
        )}
      </div>

      <div className="mt-5 space-y-3">
        {/* Pending Balance */}
        <div className="p-5 bg-[#050505] border border-white/10 rounded-xl flex items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-[#1a2614] text-[#14C96B] border border-[#10b95f]/20">
              <Wallet className="h-5 w-5" />
            </div>
            <div>
              <span className="text-[12px] font-semibold text-neutral-400">Pending Payout</span>
              <p className="mt-1 text-[26px] font-black text-white tracking-tight leading-none">
                ${pendingAmount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </p>
              <p className="text-[11px] text-[#8E8E93] mt-1.5">
                {pendingCount > 0
                  ? `Across ${pendingCount} paid invoice${pendingCount !== 1 ? "s" : ""} — awaiting disbursement.`
                  : "No pending invoices at this time."}
              </p>
            </div>
          </div>
          <Link
            href="/dashboard/incomes"
            className="h-10 px-4 rounded-xl border border-white/20 hover:border-white/40 bg-black hover:bg-white/[0.02] text-white text-[12px] font-bold transition-all flex items-center gap-1 shrink-0"
          >
            View All
            <ChevronRight className="h-4 w-4" />
          </Link>
        </div>

        {/* Total Earned */}
        <div className="p-5 bg-[#050505] border border-white/10 rounded-xl flex items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-[#1A0B2E] text-[#9b51e0] border border-[#8a2be2]/20">
              <Sparkles className="h-5 w-5" />
            </div>
            <div>
              <span className="text-[12px] font-semibold text-neutral-400">Total Earned (All Time)</span>
              <p className="mt-1 text-[26px] font-black text-white tracking-tight leading-none">
                ${disbursedAmount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </p>
              <p className="text-[11px] text-[#8E8E93] mt-1.5">After 15% platform split — disbursed to your account.</p>
            </div>
          </div>
        </div>
      </div>
    </Panel>
  );
}


function DashboardFooter() {
  return (
    <footer className="mt-8 border-y border-white/20">
      <div className="mx-auto flex max-w-[1040px] flex-wrap items-center justify-center gap-8 px-4 py-8 text-[12px] font-bold text-white">
        <img src="/agncypaybrand.png" alt="AgncyPay" className="h-[48px] w-auto object-contain scale-[1.45]" />
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
  const { state, resetState } = useApp();
  const activeWorkspace = state.workspaces.find((w) => w.id === state.activeWorkspaceId);
  const workspaceType = activeWorkspace?.type || state.user?.accountType || "brand";

  // Redirect agency users to their dashboard - they shouldn't see talent dashboard
  useEffect(() => {
    if (state.user?.accountType === "agency") {
      router.push("/agencydashboard");
    }
  }, [state.user?.accountType, router]);

  const handleLogout = () => {
    resetState();
    router.push("/auth/login");
  };

  const [autosplitInvoiceIds, setAutosplitInvoiceIds] = useState<string[]>([dashboardInvoices[0]?.id || ""]);
  const [autosplitContactIds, setAutosplitContactIds] = useState<string[]>([]);
  const [isAutosplitNoticeOpen, setIsAutosplitNoticeOpen] = useState(false);
  const [isWalletContactsOpen, setIsWalletContactsOpen] = useState(false);
  const [walletContactQuery, setWalletContactQuery] = useState("");
  const [dynamicIncomes, setDynamicIncomes] = useState<any[]>([]);

  const [widgetInvoices, setWidgetInvoices] = useState<any[]>([]);
  const [sessionWithdrawAmount, setSessionWithdrawAmount] = useState(0);
  const [sessionNet0Advanced, setSessionNet0Advanced] = useState(0);

  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    setMounted(true);
    const userEmail = state.user?.email || "";
    const accountType = state.user?.accountType || "agency";

    // Scope subscription by account type
    let unsubscribe: () => void;
    if (accountType === "agency") {
      unsubscribe = subscribeInvoicesByAgency(userEmail, (invoicesList) => {
        setWidgetInvoices(invoicesList);
      });
    } else {
      // Talent accounts
      unsubscribe = subscribeInvoicesByTalent(userEmail, (invoicesList) => {
        setWidgetInvoices(invoicesList);
      });
    }
    return () => unsubscribe();
  }, [state.user]);

  useEffect(() => {
    const userEmail = state.user?.email || "guest";
    const savedWithdraw = localStorage.getItem(`talent_withdraw_adjust_${userEmail}`);
    if (savedWithdraw) setSessionWithdrawAmount(parseFloat(savedWithdraw));

    const savedNet0 = localStorage.getItem(`talent_net0_advanced_${userEmail}`);
    if (savedNet0) setSessionNet0Advanced(parseFloat(savedNet0));
  }, [state.user]);

  const [liveAvailable] = useState(24500.00);
  const [liveSpent] = useState(1200.00);

  const [liquidityBalance, setLiquidityBalance] = useState(0);
  const [crystallisedBalance, setCrystallisedBalance] = useState(0);

  useEffect(() => {
    const userEmail = state.user?.email || "guest";
    const myInvoices = widgetInvoices.filter(i => i.talentEmail === userEmail);

    const dynamicCrystallised = myInvoices
      .filter(i => i.status === "paid" && i.talentPayoutStatus === "pending")
      .reduce((sum, i) => sum + i.amount * 0.85, 0);

    const dynamicLiquidity = myInvoices
      .filter(i => i.talentPayoutStatus === "disbursed")
      .reduce((sum, i) => sum + i.amount * 0.85, 0);

    // Start at $0 — balances build from real Firestore data
    const defaultLiq = 0;
    const defaultCry = 0;

    const finalCry = Math.max(0, (defaultCry + dynamicCrystallised) - sessionNet0Advanced);
    const finalLiq = Math.max(0, (defaultLiq + dynamicLiquidity) + (sessionNet0Advanced * 0.985) - sessionWithdrawAmount);

    setLiquidityBalance(finalLiq);
    setCrystallisedBalance(finalCry);
  }, [widgetInvoices, sessionWithdrawAmount, sessionNet0Advanced, state.user]);

  const [isNet0Open, setIsNet0Open] = useState(false);
  const [isWithdrawOpen, setIsWithdrawOpen] = useState(false);
  const [net0Stage, setNet0Stage] = useState<"idle" | "verifying" | "advancing" | "crediting" | "success">("idle");
  const [withdrawStage, setWithdrawStage] = useState<"idle" | "submitting" | "success">("idle");
  const [withdrawAmount, setWithdrawAmount] = useState("");
  const [withdrawError, setWithdrawError] = useState("");
  const [selectedWithdrawCard, setSelectedWithdrawCard] = useState(0);

  const handleProcessNet0 = () => {
    const userEmail = state.user?.email || "guest";
    const net0Key = `brand_stats_net0_funded_${userEmail}`;
    const incomesKey = `uploadedIncomes_${userEmail}`;

    setNet0Stage("verifying");
    setTimeout(() => {
      setNet0Stage("advancing");
      setTimeout(() => {
        setNet0Stage("crediting");
        setTimeout(() => {
          setNet0Stage("success");

          const advAmt = crystallisedBalance;
          const fee = advAmt * 0.015;
          const netCredit = advAmt - fee;

          setSessionNet0Advanced((prev) => {
            const next = prev + advAmt;
            localStorage.setItem(`talent_net0_advanced_${userEmail}`, next.toString());
            return next;
          });

          // Sync with Brand/Agency Net-0 Funded stats card
          const currentNet0 = localStorage.getItem(net0Key);
          const defaultNet0 = 0;
          const nextNet0 = (currentNet0 ? parseFloat(currentNet0) : defaultNet0) + advAmt;
          localStorage.setItem(net0Key, nextNet0.toString());

          const newIncome = {
            slug: `net0-advance-${Date.now()}`,
            name: "AgncyPay Net-0 Treasury",
            detail: "Instant Campaign Cash Advance",
            date: "Today, Just now",
            amount: `+$${netCredit.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
            src: "/agncypaybrand.png",
            fallback: "AP",
            className: "bg-white/10",
            imageClassName: "scale-[1.1] p-1",
          };

          const stored = localStorage.getItem(incomesKey);
          const existing = stored ? JSON.parse(stored) : [];
          const nextIncomes = [newIncome, ...existing];
          localStorage.setItem(incomesKey, JSON.stringify(nextIncomes));

          window.dispatchEvent(new Event("incomesUpdated"));
          window.dispatchEvent(new Event("syncBrandDashboard"));

          setTimeout(() => {
            setIsNet0Open(false);
            setNet0Stage("idle");
          }, 2000);
        }, 1500);
      }, 1500);
    }, 1200);
  };

  const handleProcessWithdrawal = (e: React.FormEvent) => {
    e.preventDefault();
    const amt = parseFloat(withdrawAmount);
    if (isNaN(amt) || amt <= 0) {
      setWithdrawError("Please enter a valid amount.");
      return;
    }
    if (amt > liquidityBalance) {
      setWithdrawError("Amount exceeds your available liquidity balance.");
      return;
    }

    const userEmail = state.user?.email || "guest";
    const incomesKey = `uploadedIncomes_${userEmail}`;

    setWithdrawError("");
    setWithdrawStage("submitting");

    setTimeout(() => {
      setWithdrawStage("success");
      setSessionWithdrawAmount((prev) => {
        const next = prev + amt;
        localStorage.setItem(`talent_withdraw_adjust_${userEmail}`, next.toString());
        return next;
      });

      const newIncome = {
        slug: `withdrawal-${Date.now()}`,
        name: `Transfer to ${bankCards[selectedWithdrawCard].fallback}`,
        detail: bankCards[selectedWithdrawCard].name,
        date: "Today, Just now",
        amount: `-$${amt.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
        src: bankCards[selectedWithdrawCard].cardImage,
        fallback: bankCards[selectedWithdrawCard].fallback.substring(0, 2),
        className: "bg-[#111]",
        imageClassName: "object-cover",
      };

      const stored = localStorage.getItem(incomesKey);
      const existing = stored ? JSON.parse(stored) : [];
      const nextIncomes = [newIncome, ...existing];
      localStorage.setItem(incomesKey, JSON.stringify(nextIncomes));

      window.dispatchEvent(new Event("incomesUpdated"));

      setTimeout(() => {
        setIsWithdrawOpen(false);
        setWithdrawStage("idle");
        setWithdrawAmount("");
      }, 2000);
    }, 2000);
  };

  useEffect(() => {
    const userEmail = state.user?.email || "guest";
    const incomesKey = `uploadedIncomes_${userEmail}`;

    const loadIncomes = () => {
      try {
        const stored = localStorage.getItem(incomesKey);
        if (stored) {
          setDynamicIncomes(JSON.parse(stored));
        } else {
          setDynamicIncomes([]);
        }
      } catch (e) {
        // ignore
      }
    };
    loadIncomes();
    window.addEventListener("incomesUpdated", loadIncomes);
    return () => window.removeEventListener("incomesUpdated", loadIncomes);
  }, [state.user]);

  const allIncomes = dynamicIncomes;

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

  if (!mounted) return null;

  return (
    <main className="min-h-screen bg-black text-white">
      <div className="mx-auto max-w-[1520px] px-4 py-4 sm:px-6 lg:px-8">
        <div className="flex flex-nowrap items-center justify-between gap-4 pb-4">
          <div className="relative flex items-center">
            <img src="/agncypaybrand.png" alt="AgncyPay" className="h-[52px] w-auto shrink-0 object-contain scale-[1.5] origin-left" />
          </div>
          <div className="flex items-center gap-3">
            <div className="h-8 w-8 rounded-full bg-white/[0.05] border border-white/20 flex items-center justify-center font-bold text-xs text-white">
              {state.user?.fullName ? state.user.fullName.split(" ").map((n: string) => n[0]).join("").toUpperCase().slice(0, 2) : "TL"}
            </div>
            <span className="text-xs font-bold text-[#E5E5EA] hidden sm:inline">
              {state.user?.fullName || "Talent"}
            </span>
            <button
              onClick={handleLogout}
              className="p-2 text-neutral-400 hover:text-white transition-colors"
              title="Log Out"
            >
              <LogOut className="h-4 w-4" />
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-5 xl:grid-cols-[minmax(0,1.15fr)_minmax(360px,0.85fr)]">
          <div className="space-y-5">
            <FinanceAppPromoCard />

            <Panel className="p-4 sm:p-5">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <h2 className="text-[18px] font-semibold text-white">Recent Income</h2>
                  <p className="mt-1 text-[13px] text-[#8f8f8f]">Your latest account activity.</p>
                </div>
                <Link
                  href="/dashboard/incomes"
                  className="inline-flex items-center gap-2 rounded-[7px] border border-[#333] bg-[#0b0b0b] px-3 py-2 text-[12px] font-semibold text-white"
                >
                  View All
                  <ChevronRight className="h-4 w-4" />
                </Link>
              </div>

              <div className="mt-4 space-y-2">
                {allIncomes.slice(0, 5).map((item) => (
                  <Link
                    key={`${item.name}-${item.date}`}
                    href={`/dashboard/income/${item.slug}`}
                    className="flex items-center gap-3 rounded-[8px] border border-[#333] bg-black px-3 py-2 transition-colors hover:border-[#555] hover:bg-white/[0.04]"
                  >
                    <MusicIncomeLogo item={item} />
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

            {workspaceType === "agency" && (
              <ModelPayoutsList invoices={widgetInvoices} />
            )}

            {/* Old invoices table preserved for reuse.
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
                      <th className="px-0">Client</th>
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
            */}

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
                    ["Available", `$${liveAvailable.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`],
                    ["Pending", "$3,200.00"],
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

              <Panel className="flex flex-col overflow-hidden p-4 sm:p-5 gap-4">
                <div className="grid grid-cols-3 gap-2">
                  {[
                    ["Limit", "$10,000.00"],
                    ["Spent", `$${liveSpent.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`],
                    ["Review", "3"],
                  ].map(([label, value]) => (
                    <div key={label} className="rounded-[8px] border border-[#2f2f2f] bg-black px-3 py-3">
                      <p className="text-[11px] font-semibold text-[#777]">{label}</p>
                      <p className="mt-2 truncate text-[15px] font-black text-white">{value}</p>
                    </div>
                  ))}
                </div>
                <div className="flex flex-row gap-5 mt-1 items-center">
                  <div className="relative w-[140px] h-[200px] shrink-0 rounded-[8px] overflow-hidden border border-[#2f2f2f]">
                    <img
                      src="/mobilelook.jpeg"
                      alt="AgncyPay Mobile View"
                      className="absolute inset-0 h-full w-full object-cover object-top"
                      loading="lazy"
                    />
                  </div>
                  <div className="flex flex-1 flex-col justify-center">
                    <h4 className="text-[20px] sm:text-[22px] font-bold text-white leading-[1.35]">
                      Online in Stores,<br />
                      Use AgncyPay Cards
                    </h4>
                  </div>
                </div>
              </Panel>
            </div>

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

            {["individual", "talent_independent", "talent_agency"].includes(workspaceType) && (
              <ModelIncomeList invoices={widgetInvoices} />
            )}

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

            <PendingBalancePanel
              widgetInvoices={widgetInvoices}
              userEmail={state.user?.email || ""}
            />

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

            {/*
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
            */}
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

      {/* Net-0 Early Payout Modal */}
      {isNet0Open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 px-4 backdrop-blur-[2px]">
          <div className="w-full max-w-[460px] rounded-2xl border border-white/20 bg-[#0A0A0A] p-6 text-white shadow-2xl relative overflow-hidden">

            {net0Stage === "idle" && (
              <>
                <div className="flex justify-between items-start mb-6">
                  <div>
                    <h2 className="text-xl font-bold text-white flex items-center gap-1.5">
                      <Sparkles className="h-4.5 w-4.5 text-white" />
                      Net-0 Early Payout
                    </h2>
                    <p className="text-xs text-neutral-400 mt-1 font-semibold">Advance secure campaign earnings instantly.</p>
                  </div>
                  <button type="button" onClick={() => setIsNet0Open(false)} className="text-neutral-400 hover:text-white transition-colors">
                    <X className="h-5 w-5" />
                  </button>
                </div>

                <div className="space-y-4">
                  {/* Campaign List */}
                  <div className="p-4 bg-white/[0.02] border border-white/10 rounded-xl">
                    <span className="text-[9px] font-bold uppercase tracking-wider text-[#A3A3A3]">Locked Campaign Invoice</span>
                    <div className="flex justify-between items-center mt-2">
                      <div>
                        <h4 className="text-xs font-bold text-white">Adidas Originals Summer Campaign</h4>
                        <p className="text-[10px] text-neutral-400 mt-0.5">Payout due date: July 20, 2026</p>
                      </div>
                      <span className="text-sm font-bold text-white">$38,275.80</span>
                    </div>
                  </div>

                  {/* Calculations */}
                  <div className="p-4 bg-white/[0.01] border border-white/10 rounded-xl space-y-3 text-xs">
                    <div className="flex justify-between">
                      <span className="text-neutral-400">Total Crystallised Value</span>
                      <span className="text-white font-semibold">$38,275.80</span>
                    </div>
                    <div className="flex justify-between text-[#ff453a]">
                      <span>Early Routing Fee (1.5%)</span>
                      <span className="font-semibold">-$574.14</span>
                    </div>
                    <div className="flex justify-between border-t border-white/10 pt-3 text-sm font-bold">
                      <span className="text-white">Net Advanced Credit</span>
                      <span className="text-[#13d463] font-black">$37,701.66</span>
                    </div>
                  </div>
                </div>

                <div className="flex flex-col gap-2 mt-6">
                  <button
                    type="button"
                    onClick={handleProcessNet0}
                    className="w-full h-11 rounded-xl bg-white hover:bg-neutral-200 text-black text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-md"
                  >
                    Confirm & Deposit Instantly
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsNet0Open(false)}
                    className="w-full h-11 rounded-xl bg-white/5 border border-white/20 text-white text-xs font-bold transition-all hover:bg-white/10 cursor-pointer"
                  >
                    Cancel
                  </button>
                </div>
              </>
            )}

            {net0Stage !== "idle" && net0Stage !== "success" && (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <RefreshCw className="h-8 w-8 text-white animate-spin mb-4" />
                <h3 className="text-base font-bold text-white">Processing Net-0 Advance</h3>
                <p className="text-xs text-neutral-400 mt-2 max-w-[280px]">
                  {net0Stage === "verifying" && "Verifying campaign contract clearance..."}
                  {net0Stage === "advancing" && "Advancing funds from Net-0 treasury pool..."}
                  {net0Stage === "crediting" && "Crediting active liquidity balance..."}
                </p>
              </div>
            )}

            {net0Stage === "success" && (
              <div className="flex flex-col items-center justify-center py-8 text-center animate-in zoom-in duration-300">
                <div className="flex h-14 w-14 items-center justify-center rounded-full bg-[#13d463]/20 text-[#13d463] mb-4 border border-[#13d463]/30">
                  <Check className="h-6 w-6" />
                </div>
                <h3 className="text-lg font-bold text-white">Advance Complete!</h3>
                <p className="text-xs text-[#13d463] mt-2 max-w-[260px] font-semibold">
                  $37,701.66 has been credited to your Liquidity Balance.
                </p>
                <p className="text-[10px] text-neutral-500 font-semibold mt-3 font-mono">
                  TX-ADV-AP{Date.now().toString().slice(-6)}
                </p>
              </div>
            )}

          </div>
        </div>
      )}

      {/* Withdraw Funds Modal */}
      {isWithdrawOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 px-4 backdrop-blur-[2px]">
          <div className="w-full max-w-[440px] rounded-2xl border border-white/20 bg-[#0A0A0A] p-6 text-white shadow-2xl relative overflow-hidden">

            {withdrawStage === "idle" && (
              <form onSubmit={handleProcessWithdrawal}>
                <div className="flex justify-between items-start mb-6">
                  <div>
                    <h2 className="text-xl font-bold text-white flex items-center gap-1.5">
                      <Wallet className="h-4.5 w-4.5 text-white" />
                      Withdraw Funds
                    </h2>
                    <p className="text-xs text-neutral-400 mt-1 font-semibold">Transfer cleared liquidity to your bank.</p>
                  </div>
                  <button type="button" onClick={() => setIsWithdrawOpen(false)} className="text-neutral-400 hover:text-white transition-colors">
                    <X className="h-5 w-5" />
                  </button>
                </div>

                <div className="space-y-4">
                  {/* Select Card */}
                  <div className="flex flex-col gap-2">
                    <label className="text-[11px] font-bold text-neutral-400 uppercase tracking-wider">Select Destination Card</label>
                    <div className="grid grid-cols-1 gap-2">
                      {bankCards.slice(0, 2).map((card, idx) => (
                        <button
                          key={card.name}
                          type="button"
                          onClick={() => setSelectedWithdrawCard(idx)}
                          className={cn(
                            "flex items-center gap-3 p-3 rounded-xl border text-left transition-all cursor-pointer",
                            selectedWithdrawCard === idx
                              ? "border-white bg-white/[0.05]"
                              : "border-white/10 bg-white/[0.01] hover:border-white/20"
                          )}
                        >
                          <div className="h-8 w-14 shrink-0 rounded bg-black overflow-hidden border border-white/15">
                            <img src={card.cardImage} alt={card.name} className="h-full w-full object-cover" />
                          </div>
                          <div className="min-w-0 flex-1">
                            <h4 className="text-xs font-bold text-white truncate">{card.name}</h4>
                            <p className="text-[10px] text-neutral-400 mt-0.5">{card.detail}</p>
                          </div>
                          {selectedWithdrawCard === idx && (
                            <div className="h-4 w-4 rounded-full bg-white flex items-center justify-center text-black shrink-0">
                              <Check className="h-2.5 w-2.5" />
                            </div>
                          )}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Input Amount */}
                  <div className="flex flex-col gap-2">
                    <div className="flex justify-between items-center">
                      <label htmlFor="withdrawAmount" className="text-[11px] font-bold text-neutral-400 uppercase tracking-wider">Amount to Withdraw</label>
                      <button
                        type="button"
                        onClick={() => {
                          setWithdrawAmount(liquidityBalance.toString());
                          setWithdrawError("");
                        }}
                        className="text-[10px] font-bold text-white hover:underline cursor-pointer"
                      >
                        Use Max (${liquidityBalance.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })})
                      </button>
                    </div>
                    <div className="relative">
                      <span className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-400 text-sm font-semibold">$</span>
                      <input
                        id="withdrawAmount"
                        type="number"
                        step="0.01"
                        min="0.01"
                        max={liquidityBalance}
                        value={withdrawAmount}
                        onChange={(e) => {
                          setWithdrawAmount(e.target.value);
                          if (withdrawError) setWithdrawError("");
                        }}
                        className={cn(
                          "w-full h-11 bg-black border rounded-xl pl-8 pr-4 text-sm text-white focus:outline-none transition-colors focus:border-white/30",
                          withdrawError ? "border-[#ff453a]/50 focus:border-[#ff453a]" : "border-white/15"
                        )}
                        placeholder="0.00"
                        required
                      />
                    </div>
                    {withdrawError && (
                      <span className="text-xs text-[#ff453a] font-semibold mt-0.5">{withdrawError}</span>
                    )}
                  </div>
                </div>

                <div className="flex flex-col gap-2 mt-6">
                  <button
                    type="submit"
                    className="w-full h-11 rounded-xl bg-white hover:bg-neutral-200 text-black text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-md"
                  >
                    Withdraw Funds
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsWithdrawOpen(false)}
                    className="w-full h-11 rounded-xl bg-white/5 border border-white/20 text-white text-xs font-bold transition-all hover:bg-white/10 cursor-pointer"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            )}

            {withdrawStage === "submitting" && (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <RefreshCw className="h-8 w-8 text-white animate-spin mb-4" />
                <h3 className="text-base font-bold text-white">Initiating Bank Transfer</h3>
                <p className="text-xs text-neutral-400 mt-2">Routing instant ACH payment splits...</p>
              </div>
            )}

            {withdrawStage === "success" && (
              <div className="flex flex-col items-center justify-center py-8 text-center animate-in zoom-in duration-300">
                <div className="flex h-14 w-14 items-center justify-center rounded-full bg-[#13d463]/20 text-[#13d463] mb-4 border border-[#13d463]/30">
                  <Check className="h-6 w-6" />
                </div>
                <h3 className="text-lg font-bold text-white">Transfer Successful!</h3>
                <p className="text-xs text-[#13d463] mt-2 max-w-[260px] font-semibold">
                  ${parseFloat(withdrawAmount).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} has been sent to your {bankCards[selectedWithdrawCard].fallback} account.
                </p>
                <p className="text-[10px] text-neutral-500 font-semibold mt-3 font-mono">
                  TX-WIT-AP{Date.now().toString().slice(-6)}
                </p>
              </div>
            )}

          </div>
        </div>
      )}
      <DashboardFooter />
    </main>
  );
}
