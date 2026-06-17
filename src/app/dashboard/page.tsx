"use client";

import React, { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { usePlaidLink } from "react-plaid-link";
import {
  AlertTriangle,
  ArrowUpRight,
  BarChart3,
  CheckCircle2,
  ChevronRight,
  CreditCard,
  EllipsisVertical,
  GripVertical,
  Loader2,
  Play,
  Plug,
  Search,
  Send,
  Settings,
  Unplug,
  Users,
  X,
  Lock,
  Building2,
  Check,
} from "lucide-react";
import { cn } from "../../lib/utils";
import { mainboardInvoices, formatMainboardMoney } from "../../lib/mainboard";
import { useApp } from "../../context/AppContext";
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
  { label: "Analytics", icon: BarChart3, href: "/dashboard/analytics" },
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

const dashboardInvoices = mainboardInvoices.slice(0, 5);

const dashboardPeopleByInvoiceId: Record<string, string> = {
  "MB-6984": "Nike",
  "MB-7012": "Zara",
  "MB-7044": "Adidas",
  "MB-6890": "Spotify",
  "MB-6815": "Netflix",
};

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
> = {
  "MB-6984": {
    mark: "Nike",
    label: "Nike",
    src: "https://cdn.simpleicons.org/nike/FFFFFF",
    className: "bg-black text-white",
  },
  "MB-7012": {
    mark: "Zara",
    label: "Zara",
    src: "https://cdn.simpleicons.org/zara/000000",
    className: "bg-white text-black",
  },
  "MB-7044": {
    mark: "Adidas",
    label: "Adidas",
    src: "https://upload.wikimedia.org/wikipedia/commons/2/20/Adidas_Logo.svg",
    className: "bg-white",
  },
  "MB-6890": {
    mark: "Spotify",
    label: "Spotify",
    src: "https://cdn.simpleicons.org/spotify/1DB954",
    className: "bg-black text-white",
  },
  "MB-6815": {
    mark: "Netflix",
    label: "Netflix",
    src: "https://cdn.simpleicons.org/netflix/E50914",
    className: "bg-black text-white",
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

const quickBooksInvoiceRows = [
  {
    id: "QB-inv#29475 - 2918...",
    detailId: "INV-2845",
    requested: "paid",
    status: "Done",
    due: "27",
    amount: "$1,500.00",
    client: "Nike, Inc.",
  },
  {
    id: "QB-inv#38485 - 2299...",
    detailId: "INV-2844",
    requested: "request",
    status: "In Process",
    due: "2",
    amount: "$5,400.00",
    client: "The Gap, Inc.",
  },
  {
    id: "QB-inv#88573 - 8857...",
    detailId: "INV-2843",
    requested: "request",
    status: "In Process",
    due: "20",
    amount: "$12,000.00",
    client: "Levi Strauss & Co.",
  },
  {
    id: "QB-inv#88442 - 1184...",
    detailId: "INV-2842",
    requested: "request",
    status: "In Process",
    due: "19",
    amount: "€2,800.00",
    client: "Adidas AG",
  },
  {
    id: "QB-inv#99781 - 7463...",
    detailId: "INV-2841",
    requested: "paid",
    status: "Done",
    due: "25",
    amount: "£1,200.00",
    client: "Burberry Group plc",
  },
  {
    id: "QB-inv#77362 - 9911...",
    detailId: "INV-2845",
    requested: "paid",
    status: "Done",
    due: "7",
    amount: "£800.65",
    client: "Timberland LLC",
  },
  {
    id: "QB-inv#65622 - 7712...",
    detailId: "INV-2844",
    requested: "paid",
    status: "Done",
    due: "30",
    amount: "$1,100.11",
    client: "Levi Strauss & Co.",
  },
] as const;

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

function RequestedPill({ state }: { state: (typeof quickBooksInvoiceRows)[number]["requested"] }) {
  if (state === "paid") {
    return (
      <span className="inline-flex h-7 min-w-[70px] items-center justify-center rounded-full border border-[#2c2c2c] bg-black px-3 text-[10px] font-bold text-white">
        <span className="mr-1 text-[11px] leading-none">A</span>
        paid
      </span>
    );
  }

  return (
    <span className="inline-flex h-8 min-w-[126px] items-center justify-center rounded-full border border-[#00d779] bg-black px-3 text-[11px] font-bold text-white shadow-[0_0_10px_rgba(0,215,121,0.1)]">
      Request <span className="mx-1 text-[11px] leading-none">A</span> pay
    </span>
  );
}

function InvoiceStatusBadge({ status }: { status: (typeof quickBooksInvoiceRows)[number]["status"] }) {
  if (status === "Done") {
    return (
      <span className="inline-flex h-7 items-center gap-1.5 rounded-full border border-[#242424] bg-[#0b0b0b] px-2.5 text-[12px] font-semibold text-[#bdbdbd]">
        <span className="inline-flex h-3.5 w-3.5 items-center justify-center rounded-full bg-[#00d779] text-black">
          <CheckCircle2 className="h-2.5 w-2.5" />
        </span>
        Done
      </span>
    );
  }

  return (
    <span className="inline-flex h-7 items-center gap-1.5 rounded-full border border-[#242424] bg-[#0b0b0b] px-2.5 text-[12px] font-semibold text-[#8f8f8f]">
      <span className="relative h-3.5 w-3.5 rounded-full border border-[#555]">
        <span className="absolute left-1/2 top-0 h-1.5 w-px -translate-x-1/2 bg-[#777]" />
        <span className="absolute left-1/2 top-1/2 h-px w-1.5 -translate-y-1/2 bg-[#777]" />
      </span>
      In Process
    </span>
  );
}

function QuickBooksInvoicesList() {
  const router = useRouter();
  const [selectedInvoiceIds, setSelectedInvoiceIds] = useState<string[]>([]);
  const allSelected = selectedInvoiceIds.length === quickBooksInvoiceRows.length;

  const toggleInvoiceSelection = (invoiceId: string) => {
    setSelectedInvoiceIds((current) =>
      current.includes(invoiceId)
        ? current.filter((id) => id !== invoiceId)
        : [...current, invoiceId]
    );
  };

  const toggleAllInvoices = () => {
    setSelectedInvoiceIds(allSelected ? [] : quickBooksInvoiceRows.map((row) => row.id));
  };

  const openInvoiceDetail = (invoiceId: string) => {
    router.push(`/dashboard/invoices/${invoiceId}`);
  };

  return (
    <Panel className="overflow-hidden">
      <div className="overflow-x-auto">
        <table className="min-w-[860px] w-full text-left">
          <thead>
            <tr className="h-11 bg-[#232323] text-[12px] font-bold text-[#e6e6e6]">
              <th className="w-[40px] px-2">
                <div className="flex h-8 w-8 items-center justify-center overflow-hidden rounded-full bg-[#2ca01c]">
                  <span className="text-[15px] font-black tracking-[-0.08em] text-white">qb</span>
                </div>
              </th>
              <th className="w-[40px] px-2">
                <button
                  type="button"
                  onClick={toggleAllInvoices}
                  aria-label={allSelected ? "Deselect all invoices" : "Select all invoices"}
                  className={cn(
                    "flex h-5 w-5 items-center justify-center rounded-[5px] border-2 transition-colors",
                    allSelected ? "border-[#00d779] bg-[#00d779]" : "border-[#444] bg-transparent"
                  )}
                >
                  {allSelected ? <CheckCircle2 className="h-3.5 w-3.5 text-black" /> : null}
                </button>
              </th>
              <th className="px-3">Invoice(s)</th>
              <th className="w-[160px] px-3 text-center">Requested</th>
              <th className="w-[140px] px-3 text-center">Status</th>
              <th className="w-[80px] px-3 text-center">Due</th>
              <th className="w-[130px] px-3 text-center">Amount</th>
              <th className="w-[160px] px-3 text-center">Client</th>
              <th className="w-[36px]" />
            </tr>
          </thead>
          <tbody>
            {quickBooksInvoiceRows.map((row) => {
              const isSelected = selectedInvoiceIds.includes(row.id);

              return (
              <tr
                key={row.id}
                role="button"
                tabIndex={0}
                onClick={() => openInvoiceDetail(row.detailId)}
                onKeyDown={(event) => {
                  if (event.key === "Enter" || event.key === " ") {
                    event.preventDefault();
                    openInvoiceDetail(row.detailId);
                  }
                }}
                className={cn(
                  "h-[52px] cursor-pointer border-t border-[#1f1f1f] bg-black text-[#e6e6e6] transition-colors hover:bg-[#080808] focus:bg-[#0b0b0b] focus:outline-none",
                  isSelected && "bg-[#06140d] shadow-[inset_3px_0_0_#00d779]"
                )}
              >
                <td className="px-2 text-center text-[#8a8a8a]">
                  <GripVertical className="mx-auto h-4 w-4" />
                </td>
                <td className="px-2">
                  <button
                    type="button"
                    onClick={(event) => {
                      event.stopPropagation();
                      toggleInvoiceSelection(row.id);
                    }}
                    aria-label={isSelected ? `Deselect ${row.id}` : `Select ${row.id}`}
                    className={cn(
                      "flex h-5 w-5 items-center justify-center rounded-[5px] border-2 transition-colors",
                      isSelected ? "border-[#00d779] bg-[#00d779]" : "border-[#2e2e2e] bg-transparent hover:border-[#777]"
                    )}
                  >
                    {isSelected ? <CheckCircle2 className="h-3.5 w-3.5 text-black" /> : null}
                  </button>
                </td>
                <td className="px-3 text-[13px] font-semibold">{row.id}</td>
                <td className="px-3 text-center">
                  <RequestedPill state={row.requested} />
                </td>
                <td className="px-3 text-center">
                  <InvoiceStatusBadge status={row.status} />
                </td>
                <td className="px-3 text-center text-[13px] font-semibold text-[#d8d8d8]">{row.due}</td>
                <td className="px-3 text-center text-[13px] font-semibold text-white">{row.amount}</td>
                <td className="px-3 text-center text-[13px] font-semibold text-[#e8e8e8]">{row.client}</td>
                <td className="px-2 text-[#8a8a8a]">
                  <button
                    type="button"
                    onClick={(event) => event.stopPropagation()}
                    aria-label={`More actions for ${row.id}`}
                    className="flex h-7 w-7 items-center justify-center rounded-full text-[#8a8a8a] hover:text-white"
                  >
                    <EllipsisVertical className="h-4 w-4" />
                  </button>
                </td>
              </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </Panel>
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
            <span className={cn("text-[12px] font-semibold", fallback === "N/A" ? "text-[#555]" : "text-black")}>{fallback}</span>
          </div>
        )}
      </div>
      <span className={cn("max-w-[78px] text-[12px] leading-4", label === "N/A" ? "text-[#555]" : "text-[#b8b8b8]")}>{label}</span>
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
            <p className="mt-3 text-[36px] font-black leading-none text-[#13d463]">$3,657,001</p>
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

function DashboardFooter() {
  return (
    <footer className="mt-8 border-y border-[#343434]">
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

function IntegrationsShortcutsPanel({
  connectedIntegrations,
  onAddClick,
}: {
  connectedIntegrations: string[];
  onAddClick: () => void;
}) {
  const masterIntegrations = [
    { label: "QuickBooks", src: "/quickbook.png", href: "/dashboard/settings/integrations/quickbooks" },
    { label: "Mercury", src: "/mercuryLogo.png", href: "/dashboard/settings/integrations/mercury", bg: "bg-white" },
    { label: "Xero", src: "/xero.png", href: "/dashboard/settings/integrations/xero" },
    { label: "Sage", src: "/sage.png", href: "/dashboard/settings/integrations/sage" },
    { label: "NetSuite", src: "/netsuite.png", href: "/dashboard/settings/integrations/netsuite" },
  ];

  const connected = masterIntegrations.filter((item) => connectedIntegrations.includes(item.label));
  
  const gridItems: any[] = [];
  
  connected.forEach((item) => {
    gridItems.push({ type: "connected", ...item });
  });

  if (gridItems.length < 5) {
    gridItems.push({ type: "add" });
  }

  while (gridItems.length < 5) {
    gridItems.push({ type: "na" });
  }

  return (
    <Panel className="p-4 sm:p-5">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h2 className="text-[18px] font-semibold text-white">Integrations</h2>
          <p className="mt-1 text-[13px] text-[#8f8f8f]">
            Connect external systems and services to sync data automatically.
          </p>
        </div>
      </div>
      <div className="mt-4 grid grid-cols-5 gap-3">
        {gridItems.map((item, idx) => {
          if (item.type === "na") {
            return (
              <div key={`na-${idx}`} className="flex min-w-0 flex-col items-center gap-2 text-center">
                <div className="flex h-[72px] w-[72px] items-center justify-center rounded-[12px] border border-[#303030] bg-[#060606] p-[3px] shadow-[0_0_0_1px_rgba(255,255,255,0.02)]">
                  <span className="text-[12px] font-semibold text-[#555]">N/A</span>
                </div>
                <span className="max-w-[78px] text-[12px] leading-4 text-[#555]">N/A</span>
              </div>
            );
          }

          if (item.type === "add") {
            return (
              <button
                key="add-btn"
                type="button"
                onClick={onAddClick}
                className="flex min-w-0 flex-col items-center gap-2 text-center group"
                aria-label="Add Integration"
              >
                <div className="flex h-[72px] w-[72px] items-center justify-center rounded-[12px] border border-dashed border-[#3a3a3a] bg-black text-[#555] transition-all group-hover:border-[#888] group-hover:text-white">
                  <span className="text-[28px] font-light leading-none">+</span>
                </div>
                <span className="max-w-[78px] text-[12px] leading-4 text-[#555] group-hover:text-white transition-colors">Connect</span>
              </button>
            );
          }

          return (
            <Link
              key={item.label}
              href={item.href}
              className="flex min-w-0 flex-col items-center gap-2 text-center group"
              aria-label={item.label}
            >
              <div className="flex h-[72px] w-[72px] items-center justify-center rounded-[12px] border border-[#303030] bg-[#060606] p-[3px] shadow-[0_0_0_1px_rgba(255,255,255,0.02)] transition-colors group-hover:border-[#555]">
                <div className={cn("h-full w-full overflow-hidden rounded-[9px] flex items-center justify-center", item.bg || "bg-transparent")}>
                  <img
                    src={item.src}
                    alt={item.label}
                    className="max-h-full max-w-full object-contain"
                  />
                </div>
              </div>
              <span className="max-w-[78px] text-[12px] leading-4 text-[#b8b8b8] group-hover:text-white transition-colors">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </Panel>
  );
}

function QuickBooksOnlinePanel({
  connected,
  invoices,
  loading,
  disconnecting,
  onDisconnect,
}: {
  connected: boolean;
  invoices: any[];
  loading: boolean;
  disconnecting: boolean;
  onDisconnect: () => Promise<void>;
}) {
  const [showConfirm, setShowConfirm] = useState(false);

  useEffect(() => {
    setShowConfirm(false);
  }, [connected]);

  return (
    <Panel className="p-4 sm:p-5">
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <div className="flex h-6 w-6 items-center justify-center rounded-[4px] bg-transparent">
            <img src="/quickbook.png" alt="QuickBooks" className="h-full w-full object-contain" />
          </div>
          <h2 className="text-[18px] font-semibold text-white">QuickBooks Online</h2>
        </div>

        <div className="flex items-center gap-3">
          {loading ? (
            <span className="inline-flex h-[26px] items-center gap-1.5 rounded-full border border-[#333] bg-[#111] px-3 text-[11px] font-semibold text-[#8f8f8f]">
              <Loader2 className="h-3 w-3 animate-spin" />
              Checking
            </span>
          ) : connected ? (
            <span className="inline-flex h-[26px] items-center gap-1.5 rounded-full border border-green-500/30 bg-green-500/10 px-3 text-[11px] font-semibold text-green-500">
              <span className="h-1.5 w-1.5 rounded-full bg-green-500 animate-pulse" />
              Connected
            </span>
          ) : (
            <span className="inline-flex h-[26px] items-center gap-1.5 rounded-full border border-[#444] bg-[#1a1a1a] px-3 text-[11px] font-semibold text-[#777]">
              <span className="h-1.5 w-1.5 rounded-full bg-[#555]" />
              Not Connected
            </span>
          )}
          <Link
            href="/dashboard/settings/integrations/quickbooks"
            className="text-[12px] font-semibold text-[#8f8f8f] hover:text-white"
          >
            Settings
          </Link>
        </div>
      </div>

      <p className="mt-1 text-[13px] text-[#8f8f8f]">
        Sync invoices, payments, and vendors automatically to your QBO account.
      </p>

      <div className="mt-4">
        {loading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-5 w-5 animate-spin text-[#8f8f8f]" />
          </div>
        ) : showConfirm ? (
          /* ── Disconnect Confirmation State ── */
          <div className="flex flex-col items-center rounded-[10px] border border-red-500/20 bg-red-500/5 px-5 py-6 text-center animate-in fade-in duration-300">
            <div className="flex h-12 w-12 items-center justify-center rounded-full border border-red-500/20 bg-red-500/10 text-red-400">
              <AlertTriangle className="h-5 w-5" />
            </div>
            <h3 className="mt-4 text-[15px] font-semibold text-white">Disconnect QuickBooks?</h3>
            <p className="mt-1.5 max-w-[320px] text-[12px] leading-[18px] text-[#9b9b9b]">
              Are you sure you want to disconnect QuickBooks? This will stop syncing invoices and payouts immediately.
            </p>
            <div className="mt-5 flex gap-3">
              <button
                type="button"
                onClick={() => setShowConfirm(false)}
                className="inline-flex h-[32px] items-center rounded-[7px] border border-[#444] bg-[#1a1a1a] px-4 text-[12px] font-semibold text-white transition-colors hover:bg-[#2a2a2a]"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={async () => {
                  await onDisconnect();
                  setShowConfirm(false);
                }}
                disabled={disconnecting}
                className="inline-flex h-[32px] items-center gap-1.5 rounded-[7px] border border-red-500 bg-red-500 px-4 text-[12px] font-semibold text-black transition-colors hover:bg-red-600 disabled:opacity-50"
              >
                {disconnecting ? <Loader2 className="h-3 w-3 animate-spin" /> : <Unplug className="h-3 w-3" />}
                Yes, Disconnect
              </button>
            </div>
          </div>
        ) : !connected ? (
          /* ── Disconnected Empty State ── */
          <div className="flex flex-col items-center rounded-[10px] border border-dashed border-[#333] bg-[#060606] px-5 py-8 text-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-full border border-[#333] bg-[#111]">
              <Plug className="h-5 w-5 text-[#8f8f8f]" />
            </div>
            <h3 className="mt-4 text-[15px] font-semibold text-white">Connect QuickBooks</h3>
            <p className="mt-1.5 max-w-[320px] text-[12px] leading-[18px] text-[#7f7f7f]">
              Link your QuickBooks sandbox account to fetch live invoices, sync payments, and manage vendors directly from your dashboard.
            </p>
            <Link
              href="/api/auth/quickbooks/connect"
              className="mt-5 inline-flex h-[34px] items-center gap-2 rounded-[7px] border border-white bg-white px-4 text-[12px] font-semibold text-black transition-colors hover:bg-[#e8e8e8]"
            >
              <Plug className="h-3.5 w-3.5" />
              Connect Now
            </Link>
          </div>
        ) : invoices.length === 0 ? (
          /* ── Connected but no invoices ── */
          <div className="flex flex-col items-center rounded-[10px] border border-dashed border-[#2a2a2a] bg-[#060606] px-5 py-6 text-center">
            <p className="text-[13px] text-[#7f7f7f]">No invoices found in QuickBooks.</p>
            <button
              type="button"
              onClick={() => setShowConfirm(true)}
              disabled={disconnecting}
              className="mt-3 inline-flex h-[30px] items-center gap-1.5 rounded-[6px] border border-red-500/20 bg-red-500/5 px-3 text-[11px] font-semibold text-red-400 hover:bg-red-500/10 disabled:opacity-50"
            >
              <Unplug className="h-3 w-3" />
              Disconnect
            </button>
          </div>
        ) : (
          /* ── Connected with invoices ── */
          <div className="space-y-2">
            {invoices.slice(0, 5).map((inv) => {
              const isOverdue = inv.daysText === "Overdue";
              const isPaid = inv.status === "Paid";
              const targetHref = isPaid
                ? `/receipt/${inv.id}?tx=TX-AP-QBO-${inv.id}&mode=logged_in&returnTo=dashboard`
                : `/dashboard/pay-flow/${inv.id}`;

              return (
                <Link
                  key={inv.id}
                  href={targetHref}
                  className="flex items-center gap-3 rounded-[8px] border border-[#333] bg-black px-3 py-2 transition-colors hover:border-[#555] hover:bg-white/[0.04] cursor-pointer"
                >
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-[8px] bg-transparent">
                    <img src="/quickbook.png" alt="QuickBooks" className="h-full w-full object-contain" />
                  </div>

                  <div className="min-w-0 flex-1">
                    <p className="truncate text-[13px] font-semibold text-white">{inv.name}</p>
                    <p className="truncate text-[11px] text-[#7f7f7f]">{inv.detail}</p>
                  </div>

                  <div className="flex items-center gap-3">
                    <span
                      className={cn(
                        "inline-flex h-[22px] items-center rounded-full border px-2.5 text-[10px] font-bold",
                        isPaid
                          ? "border-[#10b95f]/30 bg-[#082315] text-[#70ff9e]"
                          : isOverdue
                            ? "border-[#ff3b30]/30 bg-[#250706] text-[#ff9088]"
                            : "border-[#f59e0b]/30 bg-[#261a03] text-[#fbbf24]"
                      )}
                    >
                      {inv.status}
                    </span>

                    <span
                      className={cn(
                        "hidden text-[11px] sm:inline-block w-28 text-left",
                        isOverdue ? "text-[#ff9088]" : isPaid ? "text-[#70ff9e]" : "text-[#7f7f7f]"
                      )}
                    >
                      {inv.daysText}
                    </span>

                    <div className="hidden text-right text-[11px] text-[#7f7f7f] md:block">{inv.date}</div>

                    <div className="min-w-[72px] text-right text-[13px] font-semibold text-white">
                      {new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(inv.amount)}
                    </div>

                    <div className="flex h-8 w-8 items-center justify-center rounded-full text-[#7f7f7f] hover:text-white">
                      <EllipsisVertical className="h-4 w-4" />
                    </div>
                  </div>
                </Link>
              );
            })}

            {/* Disconnect button below invoices */}
            <div className="flex items-center justify-between pt-2">
              <Link
                href="/dashboard/settings/integrations/quickbooks"
                className="text-[11px] font-semibold text-[#8f8f8f] hover:text-white"
              >
                View All Invoices →
              </Link>
              <button
                type="button"
                onClick={() => setShowConfirm(true)}
                disabled={disconnecting}
                className="inline-flex h-[28px] items-center gap-1.5 rounded-[6px] border border-red-500/20 bg-red-500/5 px-2.5 text-[11px] font-semibold text-red-400 hover:bg-red-500/10 disabled:opacity-50"
              >
                <Unplug className="h-3 w-3" />
                Disconnect
              </button>
            </div>
          </div>
        )}
      </div>
    </Panel>
  );
}

export default function DashboardHomePage() {
  const router = useRouter();
  const { state } = useApp();
  const activeWorkspace = state.workspaces.find((w) => w.id === state.activeWorkspaceId);
  const workspaceType = activeWorkspace?.type || state.user?.accountType || "brand";
  const workspaceName = activeWorkspace?.name || "Acme Corp";

  const [autosplitInvoiceIds, setAutosplitInvoiceIds] = useState<string[]>([dashboardInvoices[0]?.id || ""]);
  const [autosplitContactIds, setAutosplitContactIds] = useState<string[]>([]);
  const [isAutosplitNoticeOpen, setIsAutosplitNoticeOpen] = useState(false);
  const [isWalletContactsOpen, setIsWalletContactsOpen] = useState(false);
  const [walletContactQuery, setWalletContactQuery] = useState("");
  const [dynamicIncomes, setDynamicIncomes] = useState<any[]>([]);
  const [isLoadingIncomes, setIsLoadingIncomes] = useState(true);
  const [hasUpload, setHasUpload] = useState(false);

  // Banks & Cards list state
  const [linkedCards, setLinkedCards] = useState<any[]>([
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
  ]);

  // Link Card/Bank Modal States
  const [isLinkModalOpen, setIsLinkModalOpen] = useState(false);
  const [linkModalStep, setLinkModalStep] = useState<
    "select" | "plaid_intro" | "plaid_banks" | "plaid_login" | "plaid_verifying" | "plaid_success" | "card_form" | "card_verifying" | "card_success"
  >("select");
  const [selectedBank, setSelectedBank] = useState("");
  const [plaidUsername, setPlaidUsername] = useState("");
  const [plaidPassword, setPlaidPassword] = useState("");
  const [cardHolder, setCardHolder] = useState("");
  const [cardNumber, setCardNumber] = useState("");
  const [cardExpiry, setCardExpiry] = useState("");
  const [cardCVC, setCardCVC] = useState("");
  const [cardZip, setCardZip] = useState("");
  const [cardErrors, setCardErrors] = useState<Record<string, string>>({});
  const [plaidErrors, setPlaidErrors] = useState<Record<string, string>>({});
  const [modalLoadingText, setModalLoadingText] = useState("");

  // Reset modal values
  const resetLinkModal = () => {
    setLinkModalStep("select");
    setSelectedBank("");
    setPlaidUsername("");
    setPlaidPassword("");
    setCardHolder("");
    setCardNumber("");
    setCardExpiry("");
    setCardCVC("");
    setCardZip("");
    setCardErrors({});
    setPlaidErrors({});
    setModalLoadingText("");
    setDashboardPlaidError(null);
  };

  const handlePlaidLogin = (e: React.FormEvent) => {
    e.preventDefault();
    const errors: Record<string, string> = {};
    if (!plaidUsername.trim()) errors.username = "Username is required";
    if (!plaidPassword.trim()) errors.password = "Password is required";

    if (Object.keys(errors).length > 0) {
      setPlaidErrors(errors);
      return;
    }

    setPlaidErrors({});
    setLinkModalStep("plaid_verifying");
    setModalLoadingText("Connecting to " + selectedBank + "...");

    setTimeout(() => {
      setModalLoadingText("Verifying credentials...");
      setTimeout(() => {
        setModalLoadingText("Importing checking account details...");
        setTimeout(() => {
          const newBank = {
            name: `${selectedBank} Business Account`,
            detail: `Checking ****${Math.floor(1000 + Math.random() * 9000)}`,
            cardImage: selectedBank === "Chase" ? CHASE_INK_BUSINESS_UNLIMITED_IMAGE : (selectedBank === "Mercury" ? MERCURY_IO_CARD_IMAGE : (selectedBank === "Bank of America" ? BOFA_BUSINESS_DEBIT_VISA_IMAGE : "/quickbook.png")),
            fallback: selectedBank,
          };
          setLinkedCards((prev) => [newBank, ...prev]);
          setLinkModalStep("plaid_success");
        }, 1000);
      }, 1000);
    }, 1000);
  };

  const handleCardSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const errors: Record<string, string> = {};
    if (!cardHolder.trim()) errors.holder = "Cardholder name is required";
    
    const cleanNum = cardNumber.replace(/\s+/g, "");
    if (!cleanNum) {
      errors.number = "Card number is required";
    } else if (cleanNum.length < 15 || cleanNum.length > 16 || !/^\d+$/.test(cleanNum)) {
      errors.number = "Invalid card number (15-16 digits)";
    }

    if (!cardExpiry.trim()) {
      errors.expiry = "Expiration is required";
    } else if (!/^(0[1-9]|1[0-2])\/[0-9]{2}$/.test(cardExpiry)) {
      errors.expiry = "MM/YY format required";
    }

    if (!cardCVC.trim()) {
      errors.cvc = "CVC is required";
    } else if (cardCVC.length < 3 || cardCVC.length > 4 || !/^\d+$/.test(cardCVC)) {
      errors.cvc = "Invalid CVC (3-4 digits)";
    }

    if (!cardZip.trim()) {
      errors.zip = "ZIP code is required";
    } else if (cardZip.length < 5 || !/^\d+$/.test(cardZip)) {
      errors.zip = "Invalid ZIP";
    }

    if (Object.keys(errors).length > 0) {
      setCardErrors(errors);
      return;
    }

    setCardErrors({});
    setLinkModalStep("card_verifying");
    setModalLoadingText("Authorizing credit/debit card details...");

    setTimeout(() => {
      setModalLoadingText("Securing tokens with payment gateway...");
      setTimeout(() => {
        const cardBrand = cleanNum.startsWith("4") ? "Visa" : (cleanNum.startsWith("5") ? "Mastercard" : "Amex");
        const newCard = {
          name: `${cardHolder}'s ${cardBrand}`,
          detail: `${cardBrand} ****${cleanNum.slice(-4)}`,
          cardImage: MERCURY_IO_CARD_IMAGE,
          fallback: cardBrand,
        };
        setLinkedCards((prev) => [newCard, ...prev]);
        setLinkModalStep("card_success");
      }, 1000);
    }, 1000);
  };

  // QBO state lifted to page level
  const [qboConnected, setQboConnected] = useState(false);
  const [qboInvoices, setQboInvoices] = useState<any[]>([]);
  const [qboPayouts, setQboPayouts] = useState<any[]>([]);
  const [qboVendors, setQboVendors] = useState<any[]>([]);
  const [qboLoading, setQboLoading] = useState(true);
  const [disconnecting, setDisconnecting] = useState(false);

  // Plaid connection states
  const [plaidConnected, setPlaidConnected] = useState(false);
  const [plaidLinkToken, setPlaidLinkToken] = useState<string | null>(null);
  const [isDashboardMockPlaid, setIsDashboardMockPlaid] = useState(false);
  const [plaidLoading, setPlaidLoading] = useState(true);
  const [plaidDisconnecting, setPlaidDisconnecting] = useState(false);
  const [plaidInstitutionName, setPlaidInstitutionName] = useState("");
  const [dashboardPlaidError, setDashboardPlaidError] = useState<string | null>(null);

  const [connectedIntegrations, setConnectedIntegrations] = useState<string[]>([]);
  const [isAddIntegrationModalOpen, setIsAddIntegrationModalOpen] = useState(false);
  const [addIntegrationModalStep, setAddIntegrationModalStep] = useState<"select" | "connecting" | "success">("select");
  const [selectedIntegration, setSelectedIntegration] = useState<any>(null);
  const [integrationLoadingText, setIntegrationLoadingText] = useState("");

  useEffect(() => {
    if (qboConnected) {
      setConnectedIntegrations((prev) => {
        if (prev.includes("QuickBooks")) return prev;
        return [...prev, "QuickBooks"];
      });
    } else {
      setConnectedIntegrations((prev) => prev.filter((item) => item !== "QuickBooks"));
    }
  }, [qboConnected]);

  const handleConnectIntegration = (integration: any) => {
    setSelectedIntegration(integration);
    
    if (integration.label === "QuickBooks") {
      window.location.href = "/api/auth/quickbooks/connect";
      return;
    }

    setAddIntegrationModalStep("connecting");
    setIntegrationLoadingText("Establishing secure connection with " + integration.label + "...");

    setTimeout(() => {
      setIntegrationLoadingText("Authorizing data scopes & sync intervals...");
      setTimeout(() => {
        setIntegrationLoadingText("Importing integration profiles...");
        setTimeout(() => {
          setConnectedIntegrations((prev) => {
            if (prev.includes(integration.label)) return prev;
            return [...prev, integration.label];
          });
          setAddIntegrationModalStep("success");
        }, 1000);
      }, 1000);
    }, 1000);
  };

  const fetchStatus = async () => {
    try {
      const res = await fetch("/api/quickbooks/status", { cache: "no-store" });
      if (res.ok) {
        const data = await res.json();
        setQboConnected(data.connected);
        if (data.connected) {
          const [invRes, payRes, vendRes] = await Promise.all([
            fetch("/api/quickbooks/invoices", { cache: "no-store" }),
            fetch("/api/quickbooks/payouts", { cache: "no-store" }),
            fetch("/api/quickbooks/vendors", { cache: "no-store" }),
          ]);
          if (invRes.ok) {
            const invData = await invRes.json();
            setQboInvoices(invData.invoices || []);
          }
          if (payRes.ok) {
            const payData = await payRes.json();
            setQboPayouts(payData.payouts || []);
          }
          if (vendRes.ok) {
            const vendData = await vendRes.json();
            setQboVendors(vendData.vendors || []);
          }
        } else {
          setQboInvoices([]);
          setQboPayouts([]);
          setQboVendors([]);
        }
      }
    } catch (err) {
      console.error("Failed to fetch QuickBooks status:", err);
    } finally {
      setQboLoading(false);
    }
  };

  const fetchPlaidStatus = async () => {
    try {
      const res = await fetch("/api/plaid/status", { cache: "no-store" });
      if (res.ok) {
        const data = await res.json();
        setPlaidConnected(data.connected);
        if (data.connected) {
          setPlaidInstitutionName(data.institutionName || "Linked Bank");
          
          // If connected, add a representation of the bank to linkedCards if not already in there
          if (data.institutionName) {
            setLinkedCards((prev) => {
              const exists = prev.some((card) => card.name.includes(data.institutionName));
              if (exists) return prev;
              const newBank = {
                name: `${data.institutionName} Business Account`,
                detail: `Checking ****${data.itemId ? data.itemId.slice(-4) : "8827"}`,
                cardImage: CHASE_INK_BUSINESS_UNLIMITED_IMAGE,
                fallback: data.institutionName,
              };
              return [newBank, ...prev];
            });
          }
        }
      }
    } catch (err) {
      console.error("Failed to fetch Plaid status:", err);
    } finally {
      setPlaidLoading(false);
    }
  };

  // Check if we are resuming from an OAuth redirect
  const [dashboardReceivedRedirectUri, setDashboardReceivedRedirectUri] = useState<string | undefined>(undefined);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const url = window.location.href;
      if (url.includes("oauth_state_id=") || url.includes("link_session_id=")) {
        setDashboardReceivedRedirectUri(url);
      }
    }
  }, []);

  const fetchPlaidLinkToken = async () => {
    try {
      setDashboardPlaidError(null);
      const res = await fetch("/api/plaid/create-link-token", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      });
      if (res.ok) {
        const data = await res.json();
        if (data.link_token) {
          setPlaidLinkToken(data.link_token);
          setIsDashboardMockPlaid(false);
        } else if (data.isMock) {
          setIsDashboardMockPlaid(true);
        }
      } else {
        const errData = await res.json().catch(() => ({}));
        const errMsg = errData.details
          ? (typeof errData.details === "object" ? JSON.stringify(errData.details) : errData.details)
          : errData.error || "Server response error";
        console.error("Plaid Link initialization failed in dashboard API:", errMsg);
        setDashboardPlaidError(errMsg || "Failed to retrieve link token");
      }
    } catch (err: any) {
      console.error("Error fetching Plaid link token on dashboard:", err);
      setDashboardPlaidError(err.message || "Failed to retrieve link token");
    }
  };

  const triggerDashboardMockPlaidFlow = useCallback(async () => {
    setLinkModalStep("plaid_verifying");
    setModalLoadingText("Connecting to simulated Plaid Sandbox environment...");
    
    setTimeout(async () => {
      setModalLoadingText("Exchanging credentials and verifying checking account...");
      
      setTimeout(async () => {
        try {
          const res = await fetch("/api/plaid/exchange-token", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              public_token: "mock-public-token-12345",
              institution: { name: "Plaid Sandbox Bank", institution_id: "ins_sandbox" },
            }),
          });
          if (res.ok) {
            setPlaidConnected(true);
            setPlaidInstitutionName("Plaid Sandbox Bank");
            setSelectedBank("Plaid Sandbox Bank");
            const newBank = {
              name: "Plaid Sandbox Bank Business Account",
              detail: "Checking ****9988",
              cardImage: CHASE_INK_BUSINESS_UNLIMITED_IMAGE,
              fallback: "Plaid Sandbox Bank",
            };
            setLinkedCards((prev) => {
              const exists = prev.some((card) => card.name.includes(newBank.name));
              if (exists) return prev;
              return [newBank, ...prev];
            });
            setLinkModalStep("plaid_success");
          } else {
            const errData = await res.json().catch(() => ({}));
            const errMsg = errData.details || errData.error || "Failed to exchange Plaid token";
            console.error("Mock exchange failed:", errMsg);
            setDashboardPlaidError(`Exchange Error: ${errMsg}`);
            setLinkModalStep("plaid_intro");
          }
        } catch (err: any) {
          console.error("Plaid mock exchange error:", err);
          setDashboardPlaidError(`Exchange Error: ${err.message || err}`);
          setLinkModalStep("plaid_intro");
        }
      }, 1000);
    }, 1000);
  }, []);

  const onPlaidSuccess = useCallback(async (public_token: string, metadata: any) => {
    setLinkModalStep("plaid_verifying");
    setModalLoadingText("Exchanging credentials and verifying checking account...");
    try {
      const res = await fetch("/api/plaid/exchange-token", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          public_token,
          institution: metadata.institution,
        }),
      });
      if (res.ok) {
        setPlaidConnected(true);
        setPlaidInstitutionName(metadata.institution?.name || "Plaid Connected Bank");
        setSelectedBank(metadata.institution?.name || "Plaid Connected Bank");
        const newBank = {
          name: `${metadata.institution?.name || "Plaid Connected Bank"} Business Account`,
          detail: `Checking ****${metadata.accounts?.[0]?.mask || "8827"}`,
          cardImage: CHASE_INK_BUSINESS_UNLIMITED_IMAGE,
          fallback: metadata.institution?.name || "Bank",
        };
        setLinkedCards((prev) => {
          const exists = prev.some((card) => card.name.includes(newBank.name));
          if (exists) return prev;
          return [newBank, ...prev];
        });
        setLinkModalStep("plaid_success");
      } else {
        const errData = await res.json().catch(() => ({}));
        const errMsg = errData.details || errData.error || "Failed to exchange Plaid token";
        console.error("Failed to exchange Plaid token:", errMsg);
        setDashboardPlaidError(`Plaid Token Exchange Error: ${errMsg}`);
        setLinkModalStep("plaid_intro");
      }
    } catch (err: any) {
      console.error("Plaid token exchange error:", err);
      setDashboardPlaidError(`Plaid Token Exchange Error: ${err.message || err}`);
      setLinkModalStep("plaid_intro");
    }
  }, []);

  const { open: openDashboardPlaid, ready: dashboardPlaidReady } = usePlaidLink({
    token: plaidLinkToken,
    onSuccess: onPlaidSuccess,
    receivedRedirectUri: dashboardReceivedRedirectUri,
    onExit: (error, metadata) => {
      if (error) {
        console.error("Dashboard Plaid Link onExit Error:", error);
        setDashboardPlaidError(`Plaid Link Error: ${error.error_message} (${error.error_code})`);
      } else {
        console.log("Dashboard Plaid Link exited. Metadata:", metadata);
      }
      if (linkModalStep === "plaid_verifying") {
        setLinkModalStep("plaid_intro");
      }
    },
    onEvent: (eventName, metadata) => {
      console.log(`Dashboard Plaid Link Event: ${eventName}`, metadata);
      if (eventName === "ERROR" && metadata.error_code) {
        console.error("Dashboard Plaid Link error event:", metadata);
        setDashboardPlaidError(`Plaid Link Error Event: ${metadata.error_message || metadata.error_code}`);
      }
    },
  });

  useEffect(() => {
    fetchStatus();
    fetchPlaidStatus();
    fetchPlaidLinkToken();
  }, []);

  const handleDisconnect = async () => {
    setDisconnecting(true);
    try {
      const res = await fetch("/api/quickbooks/disconnect", { method: "POST" });
      if (res.ok) {
        setQboConnected(false);
        setQboInvoices([]);
        setQboPayouts([]);
        setQboVendors([]);
      }
    } catch (err) {
      console.error("Failed to disconnect QuickBooks:", err);
    } finally {
      setDisconnecting(false);
    }
  };

  const handlePlaidDisconnect = async () => {
    setPlaidDisconnecting(true);
    try {
      const res = await fetch("/api/plaid/disconnect", { method: "POST" });
      if (res.ok) {
        setPlaidConnected(false);
        // Clear bank cards from dynamic UI state
        setLinkedCards((prev) =>
          prev.filter((card) => !card.name.includes("Business Account") && !card.name.includes("Plaid"))
        );
      }
    } catch (err) {
      console.error("Failed to disconnect Plaid bank account:", err);
    } finally {
      setPlaidDisconnecting(false);
    }
  };

  useEffect(() => {
    const fetchRealData = async () => {
      // 1. Synchronously check and load from localStorage first (Stale-While-Revalidate)
      let uploadId = "";
      let cachedVendors = "";
      try {
        uploadId = localStorage.getItem("uploadedUploadId") || "";
        cachedVendors = localStorage.getItem("uploadedVendors") || "";
      } catch {}

      const userHasUpload = !!(uploadId || cachedVendors);
      setHasUpload(userHasUpload);

      // Load cached data immediately so there is zero delay for the user
      let hasRenderedCache = false;
      if (cachedVendors) {
        try {
          const parsed = JSON.parse(cachedVendors);
          if (Array.isArray(parsed) && parsed.length > 0) {
            const mapped = parsed.map((v: any) => {
              const vName = v.vendor || "Unknown Vendor";
              const vRowCount = typeof v.rowCount === "number" ? v.rowCount : 0;
              const vNetIncome = typeof v.totalNetIncome === "number" ? v.totalNetIncome : 0;
              return {
                slug: "uploaded-preview",
                name: vName,
                detail: `${vRowCount.toLocaleString()} transactions parsed`,
                date: "Parsed from Excel",
                amount: `$${vNetIncome.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
                rawAmount: vNetIncome,
                src: `https://t3.gstatic.com/faviconV2?client=SOCIAL&type=FAVICON&fallback_opts=TYPE,SIZE,URL&url=http://${vName.toLowerCase().replace(/[^a-z0-9]/g, "")}.com&size=128`,
                fallback: vName.substring(0, 2).toUpperCase(),
                className: "bg-[#111]",
                imageClassName: "scale-[1]",
              };
            });
            mapped.sort((a: any, b: any) => b.rawAmount - a.rawAmount);
            setDynamicIncomes(mapped);
            setIsLoadingIncomes(false);
            hasRenderedCache = true;
          }
        } catch (e) {
          console.error("Error parsing cached vendors on dashboard load:", e);
        }
      }

      // If there was no cached data to show, show the skeleton loader while we fetch
      if (!hasRenderedCache) {
        setIsLoadingIncomes(true);
      }

      // 2. Fetch live data from API in background
      if (uploadId) {
        try {
          const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || "https://agencypay-website-backend.onrender.com";
          const response = await fetch(`${apiBaseUrl}/api/excel/uploads/${uploadId}/summary`);
          
          if (response.status === 404) {
            // Upload was not found on the backend (e.g. after container restart or expiration)
            try {
              localStorage.removeItem("uploadedUploadId");
              localStorage.removeItem("uploadedFileName");
              localStorage.removeItem("uploadedFileSize");
              localStorage.removeItem("uploadedTotals");
              localStorage.removeItem("uploadedOriginalName");
              localStorage.removeItem("uploadedRowCount");
              localStorage.removeItem("uploadedVendors");
              localStorage.removeItem("uploadedIncomes");
            } catch {}
            setHasUpload(false);
            setDynamicIncomes([]);
            setIsLoadingIncomes(false);
          } else {
            const data = await response.json();

            if (response.ok && data?.success && data?.data?.vendors) {
              const vendors = data.data.vendors || [];
              localStorage.setItem("uploadedVendors", JSON.stringify(vendors));

              const mapped = vendors.map((v: any) => {
                const vName = v.vendor || "Unknown Vendor";
                const vRowCount = typeof v.rowCount === "number" ? v.rowCount : 0;
                const vNetIncome = typeof v.totalNetIncome === "number" ? v.totalNetIncome : 0;
                return {
                  slug: "uploaded-preview",
                  name: vName,
                  detail: `${vRowCount.toLocaleString()} transactions parsed`,
                  date: "Parsed from Excel",
                  amount: `$${vNetIncome.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
                  rawAmount: vNetIncome,
                  src: `https://t3.gstatic.com/faviconV2?client=SOCIAL&type=FAVICON&fallback_opts=TYPE,SIZE,URL&url=http://${vName.toLowerCase().replace(/[^a-z0-9]/g, "")}.com&size=128`,
                  fallback: vName.substring(0, 2).toUpperCase(),
                  className: "bg-[#111]",
                  imageClassName: "scale-[1]",
                };
              });
              mapped.sort((a: any, b: any) => b.rawAmount - a.rawAmount);
              setDynamicIncomes(mapped);
              setIsLoadingIncomes(false);
              return;
            } else if (data?.success === false && data?.error?.code === "NOT_FOUND") {
              try {
                localStorage.removeItem("uploadedUploadId");
                localStorage.removeItem("uploadedFileName");
                localStorage.removeItem("uploadedFileSize");
                localStorage.removeItem("uploadedTotals");
                localStorage.removeItem("uploadedOriginalName");
                localStorage.removeItem("uploadedRowCount");
                localStorage.removeItem("uploadedVendors");
                localStorage.removeItem("uploadedIncomes");
              } catch {}
              setHasUpload(false);
              setDynamicIncomes([]);
              setIsLoadingIncomes(false);
            }
          }
        } catch (err) {
          console.error("Dashboard API fetch failed, falling back to cached state:", err);
          setIsLoadingIncomes(false);
        }
      } else {
        setIsLoadingIncomes(false);
      }
    };

    fetchRealData();
    window.addEventListener("incomesUpdated", fetchRealData);
    return () => window.removeEventListener("incomesUpdated", fetchRealData);
  }, []);

  // Only fall back to static data if user has NEVER uploaded anything
  const allIncomes = (hasUpload || dynamicIncomes.length > 0) ? dynamicIncomes : musicIncomeItems;

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
        <div className="flex flex-nowrap items-center justify-start gap-4 pb-4">
          <img src="/agncypaybrand.png" alt="AgncyPay" className="h-[52px] w-auto shrink-0 object-contain scale-[1.5] origin-left" />
          <div className="h-6 w-[1px] bg-[#333] self-center ml-8"></div>
          <span className="text-[17px] font-semibold text-[#A1A1AA] tracking-wide self-center ml-2">
            {workspaceType === "talent_independent" ? "Talent" : workspaceName}
          </span>
        </div>

        <div className="grid grid-cols-1 gap-5 xl:grid-cols-[minmax(0,1.15fr)_minmax(360px,0.85fr)]">
          <div className="space-y-5">
            <FinanceAppPromoCard />

            {/* 1. Recent Income Panel */}
            <Panel className="p-4 sm:p-5">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <h2 className="text-[18px] font-semibold text-white">Recent Income</h2>
                  <p className="mt-1 text-[13px] text-[#8f8f8f]">
                    {qboConnected ? "Money received from QuickBooks Online synced invoices." : "Your latest account activity."}
                  </p>
                </div>
                {qboConnected && (
                  <Link
                    href="/dashboard/incomes"
                    className="inline-flex items-center gap-2 rounded-[7px] border border-[#333] bg-[#0b0b0b] px-3 py-2 text-[12px] font-semibold text-white"
                  >
                    View All
                    <ChevronRight className="h-4 w-4" />
                  </Link>
                )}
              </div>

              <div className="mt-4">
                {qboLoading ? (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="h-5 w-5 animate-spin text-[#8f8f8f]" />
                  </div>
                ) : !qboConnected ? (
                  /* ERP Connect Cards Grid */
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-4">
                    {[
                      { id: "netsuite", name: "Oracle NetSuite", desc: "Enterprise grade syncing for complex chart of accounts and multi-entity setups.", src: "https://www.google.com/s2/favicons?domain=netsuite.com&sz=128" },
                      { id: "sage", name: "Sage Intacct", desc: "Automate financial reporting and sync payables effortlessly to Sage.", src: "https://www.google.com/s2/favicons?domain=sage.com&sz=128" },
                      { id: "quickbooks", name: "QuickBooks Online", desc: "Sync invoices, payments, and vendors automatically to your QBO account.", src: "/quickbook.png", connectUrl: "/api/auth/quickbooks/connect" },
                      { id: "xero", name: "Xero", desc: "Keep your Xero ledgers up to date in real-time as payments are processed.", src: "https://www.google.com/s2/favicons?domain=xero.com&sz=128" }
                    ].map((erp) => (
                      <div key={erp.id} className="flex flex-col justify-between rounded-[10px] border border-[#2d2d2d] bg-[#080808] p-4 text-center animate-in fade-in duration-300">
                        <div>
                          <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-lg bg-white p-1.5 shadow">
                            <img src={erp.src} alt={erp.name} className="h-full w-full object-contain" />
                          </div>
                          <h4 className="mt-3 text-[14px] font-semibold text-white">{erp.name}</h4>
                          <span className="mt-1 inline-flex items-center rounded-full bg-[#1b1b1b] px-2 py-0.5 text-[9px] font-semibold text-[#8f8f8f]">
                            Not Connected
                          </span>
                        </div>
                        <div className="mt-4">
                          {erp.connectUrl ? (
                            <Link
                              href={erp.connectUrl}
                              className="inline-flex h-8 w-full items-center justify-center rounded-[6px] border border-white bg-white text-[12px] font-semibold text-black hover:bg-[#e8e8e8]"
                            >
                              Connect
                            </Link>
                          ) : (
                            <button
                              type="button"
                              onClick={() => {
                                alert(`${erp.name} integration setup will redirect to its authorization portal in production.`);
                              }}
                              className="h-8 w-full rounded-[6px] border border-[#3a3a3a] bg-[#111] text-[12px] font-semibold text-white hover:border-[#555]"
                            >
                              Connect
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  /* Synced QuickBooks Invoices */
                  <div className="space-y-2 animate-in fade-in duration-300">
                    {qboInvoices.length === 0 ? (
                      <p className="py-4 text-center text-[13px] text-[#7f7f7f]">No invoices found in QuickBooks.</p>
                    ) : (
                      qboInvoices.slice(0, 5).map((inv) => {
                        const isOverdue = inv.daysText === "Overdue";
                        const isPaid = inv.status === "Paid";
                        const targetHref = isPaid
                          ? `/receipt/${inv.id}?tx=TX-AP-QBO-${inv.id}&mode=logged_in&returnTo=dashboard`
                          : `/dashboard/pay-flow/${inv.id}`;

                        return (
                          <Link
                            key={inv.id}
                            href={targetHref}
                            className="flex items-center gap-3 rounded-[8px] border border-[#2a2a2a] bg-black px-3 py-2 transition-colors hover:border-[#555] hover:bg-white/[0.04] cursor-pointer"
                          >
                            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-[8px] bg-transparent">
                              <img src="/quickbook.png" alt="QuickBooks" className="h-full w-full object-contain" />
                            </div>

                            <div className="min-w-0 flex-1">
                              <p className="truncate text-[13px] font-semibold text-white">{inv.name}</p>
                              <p className="truncate text-[11px] text-[#7f7f7f]">{inv.detail}</p>
                            </div>

                            <div className="flex items-center gap-3">
                              <span
                                className={cn(
                                  "inline-flex h-[22px] items-center rounded-full border px-2.5 text-[10px] font-bold",
                                  isPaid
                                    ? "border-[#10b95f]/30 bg-[#082315] text-[#70ff9e]"
                                    : isOverdue
                                      ? "border-[#ff3b30]/30 bg-[#250706] text-[#ff9088]"
                                      : "border-[#f59e0b]/30 bg-[#261a03] text-[#fbbf24]"
                                )}
                              >
                                {inv.status}
                              </span>

                              <span
                                className={cn(
                                  "hidden text-[11px] sm:inline-block w-28 text-left",
                                  isOverdue ? "text-[#ff9088]" : isPaid ? "text-[#70ff9e]" : "text-[#7f7f7f]"
                                )}
                              >
                                {inv.daysText}
                              </span>

                              <div className="hidden text-right text-[11px] text-[#7f7f7f] md:block">{inv.date}</div>

                              <div className="min-w-[72px] text-right text-[13px] font-semibold text-white">
                                {new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(inv.amount)}
                              </div>

                              <div className="flex h-8 w-8 items-center justify-center rounded-full text-[#7f7f7f] hover:text-white">
                                <EllipsisVertical className="h-4 w-4" />
                              </div>
                            </div>
                          </Link>
                        );
                      })
                    )}
                  </div>
                )}
              </div>
            </Panel>

              <div className="mt-4 space-y-2">
                {isLoadingIncomes ? (
                  // Skeleton loader — never shows static data while fetching
                  [1, 2, 3].map((i) => (
                    <div key={i} className="flex items-center gap-3 rounded-[8px] border border-[#222] bg-black px-3 py-2 animate-pulse">
                      <div className="h-12 w-12 shrink-0 rounded-[10px] bg-[#1a1a1a]" />
                      <div className="flex-1 space-y-2">
                        <div className="h-3 w-32 rounded bg-[#1a1a1a]" />
                        <div className="h-2 w-20 rounded bg-[#141414]" />
                      </div>
                      <div className="h-3 w-16 rounded bg-[#1a1a1a]" />
                    </div>
                  ))
                ) : allIncomes.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-8 text-center">
                    <p className="text-[13px] text-[#555]">No income data yet.</p>
                    <p className="mt-1 text-[12px] text-[#444]">Upload a Digital Sales Excel file to see your income here.</p>
                  </div>
                ) : (
                  allIncomes.slice(0, 5).map((item) => (
                    <Link
                      key={`${item.name}-${item.date}`}
                      href={item.slug === "uploaded-preview" ? "/dashboard/incomes/preview" : `/dashboard/income/${item.slug}`}
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
                  ))
                )}
              </div>

              <div className="mt-4">
                {qboLoading ? (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="h-5 w-5 animate-spin text-[#8f8f8f]" />
                  </div>
                ) : !qboConnected ? (
                  /* Disconnected Empty Payouts State */
                  <div className="flex flex-col items-center rounded-[10px] border border-dashed border-[#2d2d2d] bg-[#060606] px-5 py-8 text-center animate-in fade-in duration-300">
                    <h3 className="text-[14px] font-semibold text-[#8f8f8f]">No payouts recorded</h3>
                    <p className="mt-1.5 max-w-[280px] text-[11px] leading-[16px] text-[#555]">
                      Connect QuickBooks to sync talent payment records and configure split payout options.
                    </p>
                    <Link
                      href="/dashboard/wallet"
                      className="mt-4 inline-flex h-[32px] items-center rounded-[6px] border border-white bg-white px-3.5 text-[11px] font-semibold text-black transition-colors hover:bg-[#e8e8e8]"
                    >
                      Set Up Payouts
                    </Link>
                  </div>
                ) : (
                  /* Connected Payouts list (Table structure) */
                  <div className="overflow-x-auto animate-in fade-in duration-300">
                    {qboPayouts.length === 0 ? (
                      <p className="py-4 text-center text-[13px] text-[#7f7f7f]">No payouts found in QuickBooks.</p>
                    ) : (
                      <table className="w-full text-left text-[13px] border-collapse">
                        <thead>
                          <tr className="border-b border-[#2a2a2a] text-[#7f7f7f] font-semibold">
                            <th className="py-2.5 pr-3">Recipient / Company</th>
                            <th className="py-2.5 px-3">Detail</th>
                            <th className="py-2.5 px-3 hidden sm:table-cell">Method</th>
                            <th className="py-2.5 px-3 text-right">Amount</th>
                            <th className="py-2.5 pl-3 text-right">Status</th>
                          </tr>
                        </thead>
                        <tbody>
                          {qboPayouts.slice(0, 5).map((item) => (
                            <tr
                              key={item.id}
                              className="border-b border-[#1a1a1a] last:border-0 hover:bg-white/[0.02] transition-colors"
                            >
                              <td className="py-3 pr-3 flex items-center gap-3">
                                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-[6px] border border-[#303030] bg-[#060606]">
                                  <span className="text-[11px] font-black text-white">{item.fallback}</span>
                                </div>
                                <div className="min-w-0">
                                  <p className="font-semibold text-white truncate">{item.name}</p>
                                  <p className="text-[11px] text-[#7f7f7f] truncate">{item.type || "Payout"}</p>
                                </div>
                              </td>
                              <td className="py-3 px-3 text-[#d1d1d6] max-w-[150px] truncate">{item.detail}</td>
                              <td className="py-3 px-3 text-[#8f8f8f] hidden sm:table-cell">{item.method || "Bank Transfer"}</td>
                              <td className="py-3 px-3 text-right font-semibold text-white">{item.amount}</td>
                              <td className="py-3 pl-3 text-right">
                                <span className="inline-flex h-6 items-center rounded-full border border-[#10b95f]/30 bg-[#082315] text-[#70ff9e] px-2.5 text-[10px] font-bold">
                                  {item.status || "Paid"}
                                </span>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    )}
                  </div>
                )}
              </div>
            </Panel>

            {/* Recent Vendors Panel */}
            <Panel className="p-4 sm:p-5">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <h2 className="text-[18px] font-semibold text-white">Recent Vendors</h2>
                  <p className="mt-1 text-[13px] text-[#8f8f8f]">Vendor contacts and accounts synced from QuickBooks.</p>
                </div>
                {qboConnected && (
                  <Link
                    href="/dashboard/vendors"
                    className="inline-flex items-center gap-2 rounded-[7px] border border-[#333] bg-[#0b0b0b] px-3 py-2 text-[12px] font-semibold text-white hover:border-[#555]"
                  >
                    View All
                    <ChevronRight className="h-4 w-4" />
                  </Link>
                )}
              </div>

              <div className="mt-4">
                {qboLoading ? (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="h-5 w-5 animate-spin text-[#8f8f8f]" />
                  </div>
                ) : !qboConnected ? (
                  /* Disconnected Empty Vendors State */
                  <div className="flex flex-col items-center rounded-[10px] border border-dashed border-[#2d2d2d] bg-[#060606] px-5 py-8 text-center animate-in fade-in duration-300">
                    <h3 className="text-[14px] font-semibold text-[#8f8f8f]">No vendors synced</h3>
                    <p className="mt-1.5 max-w-[290px] text-[11px] leading-[16px] text-[#555]">
                      Connect QuickBooks to sync vendor contacts, track outstanding balances, and configure payout rules.
                    </p>
                    <Link
                      href="/dashboard/settings/integrations/quickbooks"
                      className="mt-4 inline-flex h-[32px] items-center rounded-[6px] border border-white bg-white px-3.5 text-[11px] font-semibold text-black transition-colors hover:bg-[#e8e8e8]"
                    >
                      Import Vendors
                    </Link>
                  </div>
                ) : (
                  /* Connected Vendors list (Table structure) */
                  <div className="overflow-x-auto animate-in fade-in duration-300">
                    {qboVendors.length === 0 ? (
                      <p className="py-4 text-center text-[13px] text-[#7f7f7f]">No vendors found in QuickBooks.</p>
                    ) : (
                      <table className="w-full text-left text-[13px] border-collapse">
                        <thead>
                          <tr className="border-b border-[#2a2a2a] text-[#7f7f7f] font-semibold">
                            <th className="py-2.5 pr-3">Vendor / Company</th>
                            <th className="py-2.5 px-3">Contact</th>
                            <th className="py-2.5 px-3 hidden sm:table-cell">Account #</th>
                            <th className="py-2.5 px-3 text-right">Owed Balance</th>
                            <th className="py-2.5 pl-3 text-right">Status</th>
                          </tr>
                        </thead>
                        <tbody>
                          {qboVendors.slice(0, 5).map((v) => (
                            <tr
                              key={v.id}
                              className="border-b border-[#1a1a1a] last:border-0 hover:bg-white/[0.02] transition-colors"
                            >
                              <td className="py-3 pr-3 flex items-center gap-3">
                                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-[6px] border border-[#303030] bg-[#060606]">
                                  <span className="text-[11px] font-black text-white">{v.fallback}</span>
                                </div>
                                <div className="min-w-0">
                                  <p className="font-semibold text-white truncate">{v.name}</p>
                                  {v.company && <p className="text-[11px] text-[#7f7f7f] truncate">{v.company}</p>}
                                </div>
                              </td>
                              <td className="py-3 px-3 text-[#d1d1d6] max-w-[150px] truncate">
                                <p>{v.email}</p>
                                {v.phone && v.phone !== "No Phone" && <p className="text-[11px] text-[#7f7f7f]">{v.phone}</p>}
                              </td>
                              <td className="py-3 px-3 text-[#8f8f8f] hidden sm:table-cell">{v.acctNum}</td>
                              <td className="py-3 px-3 text-right font-semibold text-white">{v.balance}</td>
                              <td className="py-3 pl-3 text-right">
                                <span className={cn(
                                  "inline-flex h-6 items-center rounded-full border px-2.5 text-[10px] font-bold",
                                  v.active
                                    ? "border-[#10b95f]/30 bg-[#082315] text-[#70ff9e]"
                                    : "border-[#3a3a3a] bg-[#1a1a1a] text-[#8f8f8f]"
                                )}>
                                  {v.active ? "Active" : "Inactive"}
                                </span>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    )}
                  </div>
                )}
              </div>
            </Panel>

            {/* 3. Sync Table when connected */}
            {qboConnected && (
              <QuickBooksInvoicesList />
            )}

            {/* Card Program and Treasury Cards side-by-side */}
            <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
              {/* 7. Card Program Panel */}
              <Panel className="flex min-h-[190px] flex-col justify-between p-4 sm:p-5">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-[12px] font-semibold uppercase tracking-[0.12em] text-[#777]">Card program</p>
                    <h3 className="mt-2 text-[24px] font-semibold text-white">AgncyPay Card</h3>
                  </div>
                  <span className={cn(
                    "inline-flex h-7 items-center rounded-full border px-3 text-[11px] font-black",
                    qboConnected ? "border-[#14c96b] bg-[#082315] text-[#70ff9e]" : "border-[#3a3a3a] bg-[#111] text-[#777]"
                  )}>
                    {qboConnected ? "Active" : "Inactive"}
                  </span>
                </div>
                <div className="mt-5 grid grid-cols-3 gap-2">
                  {[
                    ["Available", qboConnected ? "$24,500" : "N/A"],
                    ["Pending", qboConnected ? "$3,200" : "N/A"],
                    ["Cards", qboConnected ? "4" : "N/A"],
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
                    href="/dashboard/wallet"
                    className="inline-flex h-9 shrink-0 items-center rounded-[7px] border border-[#333] bg-[#111] px-3 text-[12px] font-semibold text-white hover:border-[#666]"
                  >
                    Manage
                  </Link>
                </div>
              </Panel>

              {/* 8. Treasury/AgncyPay Cards Right Section */}
              <Panel className="flex flex-col overflow-hidden p-4 sm:p-5 gap-4">
                <div className="grid grid-cols-3 gap-2">
                  {[
                    ["Limit", qboConnected ? "$10k" : "N/A"],
                    ["Spent", qboConnected ? "$1.2k" : "N/A"],
                    ["Review", qboConnected ? "3" : "N/A"],
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
          </div>

          <div className="space-y-5">
            {/* 1. Send / Request Analytics */}
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

            {/* 2. Shortcuts */}
            <Panel className="p-4 sm:p-5">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <h2 className="text-[18px] font-semibold text-white">Shortcuts</h2>
                  <p className="mt-1 text-[13px] text-[#8f8f8f]">Quick brand and search access.</p>
                </div>
              </div>
              <div className="mt-4 grid grid-cols-5 gap-3">
                {shortcuts.map((item, index) => (
                  <BrandTile key={index} {...item} />
                ))}
              </div>
            </Panel>

            {/* 3. Integrations */}
            <IntegrationsShortcutsPanel
              connectedIntegrations={connectedIntegrations}
              onAddClick={() => {
                setAddIntegrationModalStep("select");
                setSelectedIntegration(null);
                setIsAddIntegrationModalOpen(true);
              }}
            />

            {/* 4. QuickBooks Online Panel (renders only when connected) */}
            {qboConnected && (
              <QuickBooksOnlinePanel
                connected={qboConnected}
                invoices={qboInvoices}
                loading={qboLoading}
                disconnecting={disconnecting}
                onDisconnect={handleDisconnect}
              />
            )}

            {/* 5. Upload File Section */}
            {/* <CsvDropzonePanel /> */}

            {/* 6. Banks and Cards */}
            <Panel className="p-4 sm:p-5">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <h2 className="text-[18px] font-semibold text-white">Banks and Cards</h2>
                </div>
              </div>

              <div className="mt-4 space-y-3">
                {linkedCards.length > 0 ? (
                  linkedCards.map((card, i) => (
                    <div
                      key={i}
                      className="flex items-center gap-3 rounded-[10px] border border-[#3a3a3a] bg-[#090909] p-3 animate-in fade-in duration-300"
                    >
                      <BankCardFace card={card} />
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-[14px] font-semibold text-white">{card.name}</p>
                        <p className="mt-1 text-[12px] text-[#8f8f8f]">{card.detail}</p>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="flex flex-col items-center py-4 text-center">
                    <p className="text-[12px] text-[#555]">No bank accounts or cards linked.</p>
                  </div>
                )}
              </div>

              <button
                type="button"
                onClick={() => {
                  resetLinkModal();
                  setIsLinkModalOpen(true);
                }}
                className="mt-4 inline-flex h-10 items-center gap-2 rounded-[7px] border border-[#333] bg-[#0b0b0b] px-3 text-[12px] font-semibold text-white hover:border-[#666] w-fit"
              >
                Link a card or bank
                <ChevronRight className="h-4 w-4" />
              </button>
            </Panel>

            {/* 7. Plaid Connection */}
            <Panel className="overflow-hidden p-4 sm:p-5">
              <div className="flex items-start justify-between gap-4">
                <div className="min-w-0">
                  <p className="text-[13px] font-black uppercase tracking-[0.12em] text-[#a9a9a9]">Plaid</p>
                  <h2 className="mt-1 text-[22px] font-semibold text-white">
                    {plaidConnected ? plaidInstitutionName : "Connect Bank"}
                  </h2>
                  <p className="mt-2 max-w-[280px] text-[13px] leading-5 text-[#8f8f8f]">
                    {plaidConnected
                      ? "Your bank account is securely linked for monthly royalty distributions."
                      : "Link your payout method to receive monthly royalty distributions automatically."}
                  </p>
                </div>
                <span className={cn(
                  "inline-flex h-10 shrink-0 items-center rounded-[7px] border bg-white px-3",
                  plaidConnected ? "border-green-500/30" : "border-[#333]"
                )}>
                  <img
                    src="/plaid-logo.svg"
                    alt="Plaid"
                    className="h-6 w-[84px] object-contain"
                    loading="lazy"
                  />
                </span>
              </div>
              <div className="mt-5 flex items-center justify-between gap-4">
                {plaidConnected ? (
                  <button
                    type="button"
                    onClick={handlePlaidDisconnect}
                    disabled={plaidDisconnecting}
                    className="inline-flex h-9 items-center justify-center gap-1.5 rounded-[7px] border border-red-500/20 bg-red-500/5 px-3 text-[12px] font-semibold text-red-400 hover:bg-red-500/10 disabled:opacity-50"
                  >
                    {plaidDisconnecting ? (
                      <>
                        <Loader2 className="h-3.5 w-3.5 animate-spin" />
                        Disconnecting...
                      </>
                    ) : (
                      <>
                        <Unplug className="h-3.5 w-3.5" />
                        Disconnect Bank
                      </>
                    )}
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => {
                      resetLinkModal();
                      setLinkModalStep("plaid_intro");
                      setIsLinkModalOpen(true);
                    }}
                    className="inline-flex h-9 items-center rounded-[7px] border border-white bg-white px-3 text-[12px] font-semibold text-black hover:bg-[#e8e8e8]"
                  >
                    Set Up Payouts
                  </button>
                )}
                <span className="text-[11px] text-[#7f7f7f]">
                  {plaidConnected ? "Active Plaid connection" : "Secure bank linking"}
                </span>
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
      
      {isLinkModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="relative w-full max-w-[500px] rounded-[16px] border border-[#2d2d2d] bg-[#0c0c0c] p-6 shadow-2xl text-left overflow-hidden">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-[#1f1f1f] pb-4">
              <div>
                <h3 className="text-[18px] font-bold text-white">Link Account or Card</h3>
                <p className="mt-1 text-[12px] text-[#7f7f7f]">Connect your payouts and payment cards securely.</p>
              </div>
              <button
                type="button"
                onClick={() => setIsLinkModalOpen(false)}
                className="flex h-8 w-8 items-center justify-center rounded-full border border-[#222] bg-[#111] text-[#8f8f8f] transition-colors hover:text-white"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="mt-6">
              {linkModalStep === "select" && (
                <div className="space-y-4">
                  <button
                    type="button"
                    onClick={() => setLinkModalStep("plaid_intro")}
                    className="flex w-full items-center gap-4 rounded-[12px] border border-[#2a2a2a] bg-[#080808] p-4 text-left transition-all hover:border-[#555] hover:bg-white/[0.02]"
                  >
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-[8px] bg-white p-2">
                      <img src="/plaid-logo.svg" alt="Plaid" className="h-full w-full object-contain" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-white">Bank Account via Plaid</h4>
                      <p className="mt-1 text-[12px] text-[#7f7f7f]">Instantly verify checking/savings accounts for royalty payouts.</p>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setLinkModalStep("card_form")}
                    className="flex w-full items-center gap-4 rounded-[12px] border border-[#2a2a2a] bg-[#080808] p-4 text-left transition-all hover:border-[#555] hover:bg-white/[0.02]"
                  >
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-[8px] bg-[#222] text-white">
                      <CreditCard className="h-6 w-6" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-white">Debit or Credit Card</h4>
                      <p className="mt-1 text-[12px] text-[#7f7f7f]">Link Visa, Mastercard or Amex for automated payment splits.</p>
                    </div>
                  </button>
                </div>
              )}

              {/* Plaid Intro */}
              {linkModalStep === "plaid_intro" && (
                <div className="text-center">
                  <div className="mx-auto flex h-12 w-[140px] items-center justify-center rounded-[8px] bg-white p-2.5">
                    <img src="/plaid-logo.svg" alt="Plaid" className="h-6 object-contain" />
                  </div>
                  <h4 className="mt-6 text-[18px] font-bold text-white">AgncyPay connects with Plaid</h4>
                  <p className="mt-2 text-[13px] leading-relaxed text-[#8f8f8f]">
                    Connecting your bank allows you to instantly verify account credentials, balances, and routing numbers securely.
                  </p>
                  
                  {dashboardPlaidError && (
                    <div className="mt-4 rounded-[6px] border border-red-500/20 bg-red-500/5 p-3 text-left text-[12px] text-red-400 font-semibold leading-relaxed">
                      <p className="font-bold mb-1">Plaid Connection Error:</p>
                      <pre className="whitespace-pre-wrap font-mono text-[10px] select-text">{dashboardPlaidError}</pre>
                    </div>
                  )}

                  <div className="mt-4 flex flex-col gap-2 rounded-[8px] border border-[#222] bg-[#070707] p-3 text-left">
                    <div className="flex items-center gap-2 text-[12px] text-[#8f8f8f]">
                      <Lock className="h-3.5 w-3.5 text-green-400 shrink-0" />
                      <span>End-to-end 256-bit encryption.</span>
                    </div>
                  </div>

                  <div className="mt-6 flex gap-3">
                    <button
                      type="button"
                      onClick={() => setLinkModalStep("select")}
                      className="flex-1 h-10 rounded-[7px] border border-[#333] bg-[#0b0b0b] text-[13px] font-semibold text-white hover:border-[#555]"
                    >
                      Back
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        if (isDashboardMockPlaid) {
                          triggerDashboardMockPlaidFlow();
                        } else if (dashboardPlaidReady) {
                          setLinkModalStep("plaid_verifying");
                          setModalLoadingText("Connecting to secure Plaid Link portal...");
                          openDashboardPlaid();
                        } else {
                          alert("Plaid Link is loading, please try again in a moment.");
                        }
                      }}
                      disabled={!dashboardPlaidReady && !isDashboardMockPlaid}
                      className="flex-1 h-10 rounded-[7px] bg-white text-[13px] font-semibold text-black hover:bg-[#e8e8e8] disabled:opacity-50"
                    >
                      Continue
                    </button>
                  </div>
                </div>
              )}

              {/* Plaid Bank Select */}
              {linkModalStep === "plaid_banks" && (
                <div>
                  <h4 className="text-[14px] font-semibold text-white mb-3">Select your bank</h4>
                  <div className="grid grid-cols-2 gap-2">
                    {[
                      { name: "Chase", logo: CHASE_INK_BUSINESS_UNLIMITED_IMAGE },
                      { name: "Bank of America", logo: BOFA_BUSINESS_DEBIT_VISA_IMAGE },
                      { name: "Mercury", logo: MERCURY_IO_CARD_IMAGE },
                      { name: "Wells Fargo", logo: "/quickbook.png" },
                      { name: "Capital One", logo: "/quickbook.png" },
                      { name: "Citi", logo: "/quickbook.png" }
                    ].map((bank) => (
                      <button
                        key={bank.name}
                        type="button"
                        onClick={() => {
                          setSelectedBank(bank.name);
                          setLinkModalStep("plaid_login");
                        }}
                        className="flex items-center gap-3 rounded-[8px] border border-[#222] bg-[#070707] p-3 text-left hover:border-[#555] hover:bg-white/[0.01]"
                      >
                        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-[4px] border border-[#333] bg-black overflow-hidden p-0.5">
                          {bank.logo.endsWith(".png") || bank.logo.endsWith(".svg") ? (
                            <img src={bank.logo} alt={bank.name} className="h-full w-full object-cover" />
                          ) : (
                            <Building2 className="h-4 w-4 text-white" />
                          )}
                        </div>
                        <span className="text-[13px] font-semibold text-white">{bank.name}</span>
                      </button>
                    ))}
                  </div>

                  <div className="mt-6 flex gap-3">
                    <button
                      type="button"
                      onClick={() => setLinkModalStep("plaid_intro")}
                      className="w-full h-10 rounded-[7px] border border-[#333] bg-[#0b0b0b] text-[13px] font-semibold text-white hover:border-[#555]"
                    >
                      Back
                    </button>
                  </div>
                </div>
              )}

              {/* Plaid Login Form */}
              {linkModalStep === "plaid_login" && (
                <form onSubmit={handlePlaidLogin}>
                  <div className="text-center mb-6">
                    <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-full bg-white/[0.04] text-white">
                      <Building2 className="h-5 w-5" />
                    </div>
                    <h4 className="mt-3 text-[16px] font-bold text-white">Log in to {selectedBank}</h4>
                    <p className="mt-1 text-[12px] text-[#7f7f7f]">Enter credentials to link your business account</p>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <label className="block text-[12px] font-semibold text-[#8f8f8f] mb-1.5">Username or User ID</label>
                      <input
                        type="text"
                        value={plaidUsername}
                        onChange={(e) => setPlaidUsername(e.target.value)}
                        placeholder="Online User ID"
                        className="h-10 w-full rounded-[6px] border border-[#333] bg-black px-3 text-[14px] text-white outline-none focus:border-white placeholder:text-[#444]"
                      />
                      {plaidErrors.username && <p className="mt-1 text-[11px] text-red-400">{plaidErrors.username}</p>}
                    </div>

                    <div>
                      <label className="block text-[12px] font-semibold text-[#8f8f8f] mb-1.5">Password</label>
                      <input
                        type="password"
                        value={plaidPassword}
                        onChange={(e) => setPlaidPassword(e.target.value)}
                        placeholder="Banking Password"
                        className="h-10 w-full rounded-[6px] border border-[#333] bg-black px-3 text-[14px] text-white outline-none focus:border-white placeholder:text-[#444]"
                      />
                      {plaidErrors.password && <p className="mt-1 text-[11px] text-red-400">{plaidErrors.password}</p>}
                    </div>
                  </div>

                  <div className="mt-6 flex gap-3">
                    <button
                      type="button"
                      onClick={() => setLinkModalStep("plaid_banks")}
                      className="flex-1 h-10 rounded-[7px] border border-[#333] bg-[#0b0b0b] text-[13px] font-semibold text-white hover:border-[#555]"
                    >
                      Back
                    </button>
                    <button
                      type="submit"
                      className="flex-1 h-10 rounded-[7px] bg-white text-[13px] font-semibold text-black hover:bg-[#e8e8e8]"
                    >
                      Sign In
                    </button>
                  </div>
                </form>
              )}

              {/* Plaid Verifying Spinner */}
              {linkModalStep === "plaid_verifying" && (
                <div className="flex flex-col items-center justify-center py-8 text-center">
                  <Loader2 className="h-10 w-10 animate-spin text-[#8f8f8f]" />
                  <h4 className="mt-5 text-[15px] font-semibold text-white">{modalLoadingText}</h4>
                  <p className="mt-2 text-[12px] text-[#555] max-w-[280px]">Establishing secure channel. Do not close this dialog.</p>
                </div>
              )}

              {/* Plaid Success Screen */}
              {linkModalStep === "plaid_success" && (
                <div className="flex flex-col items-center justify-center py-6 text-center">
                  <div className="flex h-16 w-16 items-center justify-center rounded-full bg-green-500/10 text-green-400">
                    <Check className="h-8 w-8" strokeWidth={3} />
                  </div>
                  <h4 className="mt-5 text-[18px] font-bold text-white">Account Linked Successfully!</h4>
                  <p className="mt-2 text-[13px] text-[#8f8f8f] max-w-[320px]">
                    Your {selectedBank} account is now connected to AgncyPay.
                  </p>

                  <button
                    type="button"
                    onClick={() => setIsLinkModalOpen(false)}
                    className="mt-8 w-full h-10 rounded-[7px] bg-white text-[13px] font-semibold text-black hover:bg-[#e8e8e8]"
                  >
                    Go to Dashboard
                  </button>
                </div>
              )}

              {/* Card Form */}
              {linkModalStep === "card_form" && (
                <form onSubmit={handleCardSubmit} className="space-y-4">
                  <div>
                    <label className="block text-[12px] font-semibold text-[#8f8f8f] mb-1.5">Cardholder Name</label>
                    <input
                      type="text"
                      value={cardHolder}
                      onChange={(e) => setCardHolder(e.target.value)}
                      placeholder="Jane Doe"
                      className="h-10 w-full rounded-[6px] border border-[#333] bg-black px-3 text-[14px] text-white outline-none focus:border-white placeholder:text-[#444]"
                    />
                    {cardErrors.holder && <p className="mt-1 text-[11px] text-red-400">{cardErrors.holder}</p>}
                  </div>

                  <div>
                    <label className="block text-[12px] font-semibold text-[#8f8f8f] mb-1.5">Card Number</label>
                    <input
                      type="text"
                      value={cardNumber}
                      onChange={(e) => {
                        const clean = e.target.value.replace(/\D/g, "").slice(0, 16);
                        const parts = clean.match(/.{1,4}/g) || [];
                        setCardNumber(parts.join(" "));
                      }}
                      placeholder="4111 2222 3333 4444"
                      className="h-10 w-full rounded-[6px] border border-[#333] bg-black px-3 text-[14px] text-white outline-none focus:border-white placeholder:text-[#444]"
                    />
                    {cardErrors.number && <p className="mt-1 text-[11px] text-red-400">{cardErrors.number}</p>}
                  </div>

                  <div className="grid grid-cols-3 gap-3">
                    <div>
                      <label className="block text-[12px] font-semibold text-[#8f8f8f] mb-1.5">Expiry Date</label>
                      <input
                        type="text"
                        value={cardExpiry}
                        onChange={(e) => {
                          const clean = e.target.value.replace(/\D/g, "").slice(0, 4);
                          if (clean.length > 2) {
                            setCardExpiry(clean.slice(0, 2) + "/" + clean.slice(2));
                          } else {
                            setCardExpiry(clean);
                          }
                        }}
                        placeholder="MM/YY"
                        className="h-10 w-full rounded-[6px] border border-[#333] bg-black px-3 text-[14px] text-white outline-none focus:border-white placeholder:text-[#444]"
                      />
                      {cardErrors.expiry && <p className="mt-1 text-[11px] text-red-400">{cardErrors.expiry}</p>}
                    </div>

                    <div>
                      <label className="block text-[12px] font-semibold text-[#8f8f8f] mb-1.5">CVC</label>
                      <input
                        type="text"
                        value={cardCVC}
                        onChange={(e) => setCardCVC(e.target.value.replace(/\D/g, "").slice(0, 4))}
                        placeholder="123"
                        className="h-10 w-full rounded-[6px] border border-[#333] bg-black px-3 text-[14px] text-white outline-none focus:border-white placeholder:text-[#444]"
                      />
                      {cardErrors.cvc && <p className="mt-1 text-[11px] text-red-400">{cardErrors.cvc}</p>}
                    </div>

                    <div>
                      <label className="block text-[12px] font-semibold text-[#8f8f8f] mb-1.5">ZIP Code</label>
                      <input
                        type="text"
                        value={cardZip}
                        onChange={(e) => setCardZip(e.target.value.replace(/\D/g, "").slice(0, 5))}
                        placeholder="90210"
                        className="h-10 w-full rounded-[6px] border border-[#333] bg-black px-3 text-[14px] text-white outline-none focus:border-white placeholder:text-[#444]"
                      />
                      {cardErrors.zip && <p className="mt-1 text-[11px] text-red-400">{cardErrors.zip}</p>}
                    </div>
                  </div>

                  <div className="mt-6 flex gap-3 pt-2">
                    <button
                      type="button"
                      onClick={() => setLinkModalStep("select")}
                      className="flex-1 h-10 rounded-[7px] border border-[#333] bg-[#0b0b0b] text-[13px] font-semibold text-white hover:border-[#555]"
                    >
                      Back
                    </button>
                    <button
                      type="submit"
                      className="flex-1 h-10 rounded-[7px] bg-white text-[13px] font-semibold text-black hover:bg-[#e8e8e8]"
                    >
                      Link Card
                    </button>
                  </div>
                </form>
              )}

              {/* Card Verifying Spinner */}
              {linkModalStep === "card_verifying" && (
                <div className="flex flex-col items-center justify-center py-8 text-center">
                  <Loader2 className="h-10 w-10 animate-spin text-[#8f8f8f]" />
                  <h4 className="mt-5 text-[15px] font-semibold text-white">{modalLoadingText}</h4>
                  <p className="mt-2 text-[12px] text-[#555] max-w-[280px]">Verifying with card network. Do not close this dialog.</p>
                </div>
              )}

              {/* Card Success Screen */}
              {linkModalStep === "card_success" && (
                <div className="flex flex-col items-center justify-center py-6 text-center">
                  <div className="flex h-16 w-16 items-center justify-center rounded-full bg-green-500/10 text-green-400">
                    <Check className="h-8 w-8" strokeWidth={3} />
                  </div>
                  <h4 className="mt-5 text-[18px] font-bold text-white">Card Linked Successfully!</h4>
                  <p className="mt-2 text-[13px] text-[#8f8f8f] max-w-[320px]">
                    Your credit/debit card ending in ****{cardNumber.replace(/\s+/g, "").slice(-4)} is now connected.
                  </p>

                  <button
                    type="button"
                    onClick={() => setIsLinkModalOpen(false)}
                    className="mt-8 w-full h-10 rounded-[7px] bg-white text-[13px] font-semibold text-black hover:bg-[#e8e8e8]"
                  >
                    Go to Dashboard
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {isAddIntegrationModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="relative w-full max-w-[500px] rounded-[16px] border border-[#2d2d2d] bg-[#0c0c0c] p-6 shadow-2xl text-left overflow-hidden">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-[#1f1f1f] pb-4">
              <div>
                <h3 className="text-[18px] font-bold text-white">Connect New Integration</h3>
                <p className="mt-1 text-[12px] text-[#7f7f7f]">Sync external accounting ledgers or bank feeds.</p>
              </div>
              <button
                type="button"
                onClick={() => setIsAddIntegrationModalOpen(false)}
                className="flex h-8 w-8 items-center justify-center rounded-full border border-[#222] bg-[#111] text-[#8f8f8f] transition-colors hover:text-white"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="mt-6">
              {addIntegrationModalStep === "select" && (
                <div>
                  <h4 className="text-[14px] font-semibold text-[#8f8f8f] mb-4">Select an available service to connect:</h4>
                  <div className="space-y-3">
                    {[
                      { label: "QuickBooks", src: "/quickbook.png", desc: "Sync invoices, payments and chart of accounts." },
                      { label: "Mercury", src: "/mercuryLogo.png", desc: "Sync business bank accounts & cards feeds.", bg: "bg-white" },
                      { label: "Xero", src: "/xero.png", desc: "Keep Xero ledger accounts updated in real-time." },
                      { label: "Sage", src: "/sage.png", desc: "Automate reporting and sync payables to Sage." },
                      { label: "NetSuite", src: "/netsuite.png", desc: "Enterprise multi-entity chart of accounts syncing." }
                    ]
                      .filter((item) => !connectedIntegrations.includes(item.label))
                      .map((item) => (
                        <button
                          key={item.label}
                          type="button"
                          onClick={() => handleConnectIntegration(item)}
                          className="flex w-full items-center gap-4 rounded-[12px] border border-[#222] bg-[#070707] p-3 text-left hover:border-[#555] hover:bg-white/[0.01] transition-all"
                        >
                          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-[8px] border border-[#333] bg-black overflow-hidden p-1">
                            <div className={cn("h-full w-full rounded-[6px] flex items-center justify-center overflow-hidden", item.bg || "bg-transparent")}>
                              <img src={item.src} alt={item.label} className="max-h-full max-w-full object-contain" />
                            </div>
                          </div>
                          <div className="min-w-0 flex-1">
                            <h5 className="text-[14px] font-bold text-white leading-none">{item.label}</h5>
                            <p className="mt-1 text-[11px] text-[#7f7f7f] truncate">{item.desc}</p>
                          </div>
                          <ChevronRight className="h-4 w-4 text-[#555]" />
                        </button>
                      ))}

                    {[
                      { label: "QuickBooks", src: "/quickbook.png", desc: "Sync invoices, payments and chart of accounts." },
                      { label: "Mercury", src: "/mercuryLogo.png", desc: "Sync business bank accounts & cards feeds.", bg: "bg-white" },
                      { label: "Xero", src: "/xero.png", desc: "Keep Xero ledger accounts updated in real-time." },
                      { label: "Sage", src: "/sage.png", desc: "Automate reporting and sync payables to Sage." },
                      { label: "NetSuite", src: "/netsuite.png", desc: "Enterprise multi-entity chart of accounts syncing." }
                    ].filter((item) => !connectedIntegrations.includes(item.label)).length === 0 && (
                      <p className="text-center py-6 text-[13px] text-[#555]">All available integrations are connected.</p>
                    )}
                  </div>
                </div>
              )}

              {/* Connecting Loading Spinner */}
              {addIntegrationModalStep === "connecting" && (
                <div className="flex flex-col items-center justify-center py-8 text-center animate-in fade-in duration-200">
                  <Loader2 className="h-10 w-10 animate-spin text-[#8f8f8f]" />
                  <h4 className="mt-5 text-[15px] font-semibold text-white">{integrationLoadingText}</h4>
                  <p className="mt-2 text-[12px] text-[#555] max-w-[280px]">Establishing secure OAuth handshake tunnel. Do not close this dialog.</p>
                </div>
              )}

              {/* Success Screen */}
              {addIntegrationModalStep === "success" && (
                <div className="flex flex-col items-center justify-center py-6 text-center animate-in fade-in duration-200">
                  <div className="flex h-16 w-16 items-center justify-center rounded-full bg-green-500/10 text-green-400">
                    <Check className="h-8 w-8" strokeWidth={3} />
                  </div>
                  <h4 className="mt-5 text-[18px] font-bold text-white">{selectedIntegration?.label} Integrated Successfully!</h4>
                  <p className="mt-2 text-[13px] text-[#8f8f8f] max-w-[320px]">
                    Your {selectedIntegration?.label} account is now connected to AgncyPay and syncing ledger records automatically.
                  </p>

                  <button
                    type="button"
                    onClick={() => setIsAddIntegrationModalOpen(false)}
                    className="mt-8 w-full h-10 rounded-[7px] bg-white text-[13px] font-semibold text-black hover:bg-[#e8e8e8] transition-colors"
                  >
                    Go to Dashboard
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {isAutosplitNoticeOpen && <AutoSplitNotice onClose={() => setIsAutosplitNoticeOpen(false)} />}
      <DashboardFooter />
    </main>
  );
}
