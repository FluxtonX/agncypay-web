"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  ArrowUpRight,
  ChevronRight,
  CreditCard,
  EllipsisVertical,
  Landmark,
  Search,
  Send,
  Settings,
  Users,
} from "lucide-react";
import { AgncyPayLogo } from "../../components/payment/AgncyPayLogo";
import { cn } from "../../lib/utils";
import { mainboardInvoices, formatMainboardMoney } from "../../lib/mainboard";

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
        <div className="flex h-full w-full items-center justify-center rounded-[inherit] border border-[#3f3f3f] bg-[#f1e0b9] px-1 text-center text-[10px] font-semibold leading-[1.05] text-black">
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
  { label: "Direct to bank", icon: Landmark, href: "/dashboard/wallet" },
  { label: "Add card or bank", icon: CreditCard, href: "/dashboard/wallet" },
  { label: "Wallet ID contacts", icon: Users, href: "/dashboard/profile" },
  { label: "More", icon: EllipsisVertical, href: "/dashboard/settings" },
] as const;

const brandShortcuts = [
  { label: "Airbnb", href: "/dashboard/invoices", src: "https://www.google.com/s2/favicons?domain=airbnb.com&sz=128", fallback: "Airbnb" },
  { label: "The North Face", href: "/dashboard/invoices", src: "https://www.google.com/s2/favicons?domain=thenorthface.com&sz=128", fallback: "The North Face" },
  { label: "Land Rover", href: "/dashboard/invoices", src: "https://www.google.com/s2/favicons?domain=landrover.com&sz=128", fallback: "Land Rover" },
  { label: "Adidas", href: "/dashboard/invoices", src: "https://www.google.com/s2/favicons?domain=adidas.com&sz=128", fallback: "Adidas" },
  { label: "Search", href: "/dashboard/invoices", search: true, fallback: "S" },
] as const;

const payoutItems = [
  {
    name: "Spotify",
    detail: "Ad social campaign",
    date: "Today, 10:24 AM",
    amount: "$5,800.00",
    src: "https://www.google.com/s2/favicons?domain=spotify.com&sz=128",
    fallback: "Spotify",
  },
  {
    name: "Adidas",
    detail: "S/S comms web",
    date: "Yesterday",
    amount: "$3,200.00",
    src: "https://www.google.com/s2/favicons?domain=adidas.com&sz=128",
    fallback: "Adidas",
  },
  {
    name: "Land Rover",
    detail: "Ad domestic socials",
    date: "Oct 12",
    amount: "$1,200.00",
    src: "https://www.google.com/s2/favicons?domain=landrover.com&sz=128",
    fallback: "Land Rover",
  },
  {
    name: "The North Face",
    detail: "S/S global campaign",
    date: "Oct 11",
    amount: "$52,000.00",
    src: "https://www.google.com/s2/favicons?domain=thenorthface.com&sz=128",
    fallback: "The North Face",
  },
  {
    name: "Airbnb",
    detail: "Global socials",
    date: "Oct 10",
    amount: "$12,600.00",
    src: "https://www.google.com/s2/favicons?domain=airbnb.com&sz=128",
    fallback: "Airbnb",
  },
] as const;

const bankCards = [
  { name: "Chase Business Debit", detail: "Debit ****86", tone: "from-[#1f2f59] to-[#0d1226]", src: "https://www.google.com/s2/favicons?domain=chase.com&sz=128", fallback: "Chase" },
  { name: "Mercury Business IO Mastercard", detail: "Debit ****57", tone: "from-[#3b274c] to-[#17111f]", src: "https://www.google.com/s2/favicons?domain=mercury.com&sz=128", fallback: "Mercury" },
  { name: "Bank of America Business Debit Visa", detail: "Debit ****88", tone: "from-[#132c63] to-[#10131b]", src: "https://www.google.com/s2/favicons?domain=bankofamerica.com&sz=128", fallback: "Bank of America" },
  { name: "Mercury Debit Mastercard", detail: "Debit ****86", tone: "from-[#272727] to-[#101010]", src: "https://www.google.com/s2/favicons?domain=mastercard.com&sz=128", fallback: "Mastercard" },
] as const;

const dashboardInvoices = mainboardInvoices.slice(0, 5);

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
  return (
    <span className="inline-flex h-7 items-center rounded-[7px] border border-[#3f3f3f] bg-[#0f0f0f] px-3 text-[12px] font-semibold text-[#d7d7d7]">
      {status}
    </span>
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
      <div className="flex h-[68px] w-[68px] items-center justify-center overflow-hidden rounded-[12px] border border-[#5a5a5a] bg-[#f1e0b9] p-2 shadow-[0_0_0_1px_rgba(255,255,255,0.02)]">
        {search ? (
          <Search className="h-6 w-6 text-black" />
        ) : src ? (
          <RemoteBrandImage
            src={src}
            alt={label}
            fallback={fallback}
            className="h-full w-full"
            imageClassName="object-contain p-0.5"
          />
        ) : (
          <span className="text-[12px] font-semibold text-black">{fallback}</span>
        )}
      </div>
      <span className="max-w-[78px] text-[12px] leading-4 text-[#b8b8b8]">{label}</span>
    </Link>
  );
}

function RequestedBadge({ invoiceId }: { invoiceId: string }) {
  return (
    <div className="inline-flex items-center gap-1 rounded-full border border-[#444] bg-[#090909] px-2 py-1 text-white">
      <span className="flex h-4 w-4 items-center justify-center overflow-hidden rounded-full border border-[#333] bg-black">
        <AgncyPayLogo imageClassName="h-[8px] w-auto" />
      </span>
      <Link
        href={`/dashboard/pay-flow/${invoiceId}`}
        className="inline-flex h-4 items-center rounded-full border border-white bg-white px-1.5 text-[8px] font-semibold leading-none text-black hover:bg-[#e8e8e8]"
      >
        Pay
      </Link>
    </div>
  );
}

function DashboardFooter() {
  return (
    <footer className="mt-8 border-y border-[#343434]">
      <div className="mx-auto flex max-w-[1040px] flex-wrap items-center justify-center gap-8 px-4 py-8 text-[12px] font-bold text-white">
        <AgncyPayLogo imageClassName="h-7" />
        <Link href="/dashboard/support">Help</Link>
        <Link href="/dashboard/support">Contact Us</Link>
        <Link href="/dashboard/verification">Security</Link>
        <Link href="/dashboard/settings">Fees</Link>
      </div>
    </footer>
  );
}

export default function DashboardHomePage() {
  const [selectedInvoiceId, setSelectedInvoiceId] = useState(dashboardInvoices[0]?.id || "");
  const [selectedInvoiceIds, setSelectedInvoiceIds] = useState<string[]>([]);
  const selectedInvoice = dashboardInvoices.find((invoice) => invoice.id === selectedInvoiceId) || dashboardInvoices[0];

  const toggleInvoiceSelection = (invoiceId: string) => {
    setSelectedInvoiceIds((current) =>
      current.includes(invoiceId) ? current.filter((id) => id !== invoiceId) : [...current, invoiceId]
    );
  };

  return (
    <main className="min-h-screen bg-black text-white">
      <div className="mx-auto max-w-[1520px] px-4 py-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between gap-4 pb-4">
          <div className="flex flex-wrap items-center gap-2">
            <Link
              href="/dashboard"
              className="inline-flex h-9 items-center rounded-[4px] border border-white bg-white px-4 text-[12px] font-semibold uppercase text-[#1a1a1a]"
            >
              Booking Dashboard
            </Link>
            <Link
              href="/dashboard"
              className="inline-flex h-9 items-center rounded-[4px] border border-white bg-white px-4 text-[12px] font-semibold uppercase text-[#3971b6]"
            >
              Finance Dashboard
            </Link>
            <Link
              href="/dashboard/settings"
              className="inline-flex h-9 w-11 items-center justify-center rounded-[4px] border border-white bg-white text-[#3971b6]"
              aria-label="Settings"
            >
              <Settings className="h-5 w-5" />
            </Link>
          </div>
          <AgncyPayLogo imageClassName="h-6 sm:h-7" />
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
                    <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-[#777]">
                      AgncyPay home
                    </p>
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
                  <div
                    key={`${item.name}-${item.date}`}
                    className="flex items-center gap-3 rounded-[8px] border border-[#333] bg-black px-3 py-2"
                  >
                    <RemoteBrandImage
                      src={item.src}
                      alt={item.name}
                      fallback={item.fallback}
                      className="h-12 w-12 shrink-0 rounded-[9px]"
                      imageClassName="h-full w-full rounded-[9px] border border-[#444] bg-[#f1e0b9] object-contain p-1"
                    />
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-[13px] font-semibold text-white">{item.name}</p>
                      <p className="truncate text-[11px] text-[#7f7f7f]">{item.detail}</p>
                    </div>
                    <div className="hidden text-right text-[11px] text-[#7f7f7f] sm:block">{item.date}</div>
                    <div className="min-w-[92px] text-right text-[13px] font-semibold text-white">
                      {item.amount}
                    </div>
                    <button className="flex h-8 w-8 items-center justify-center rounded-full text-[#7f7f7f] hover:text-white">
                      <EllipsisVertical className="h-4 w-4" />
                    </button>
                  </div>
                ))}
              </div>
            </Panel>

            <Panel className="overflow-hidden">
              <div className="flex items-center justify-between border-b border-[#333] p-4 sm:p-5">
                <div>
                  <h2 className="text-[18px] font-semibold text-white">Invoices</h2>
                  <p className="mt-1 text-[13px] text-[#8f8f8f]">
                    Requested, status, due, amount, client. Select an invoice to inspect or pay.
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <Link
                    href={selectedInvoice ? `/dashboard/pay-flow/${selectedInvoice.id}` : "/dashboard/invoices"}
                    className="inline-flex items-center gap-2 rounded-[7px] border border-white bg-white px-3 py-2 text-[12px] font-semibold text-black"
                  >
                    Pay Selected
                  </Link>
                  <Link
                    href="/dashboard/invoices"
                    className="inline-flex items-center gap-2 rounded-[7px] border border-[#333] bg-[#0b0b0b] px-3 py-2 text-[12px] font-semibold text-white"
                  >
                    Open
                    <ArrowUpRight className="h-4 w-4" />
                  </Link>
                </div>
              </div>

              {selectedInvoiceIds.length > 0 && (
                <div className="flex items-center justify-between gap-3 border-b border-[#333] bg-white/[0.02] px-4 py-3 text-[13px]">
                  <span className="font-semibold text-white">
                    {selectedInvoiceIds.length} invoice{selectedInvoiceIds.length === 1 ? "" : "s"} selected
                  </span>
                  <button
                    type="button"
                    onClick={() => setSelectedInvoiceIds([])}
                    className="h-8 rounded-[7px] border border-[#333] bg-black px-3 text-[12px] font-semibold text-white hover:border-[#666]"
                  >
                    Clear
                  </button>
                </div>
              )}

              <div className="overflow-x-auto">
                <table className="min-w-[980px] w-full table-fixed text-left">
                  <colgroup>
                    <col className="w-[52px]" />
                    <col className="w-[128px]" />
                    <col className="w-[220px]" />
                    <col className="w-[128px]" />
                    <col className="w-[120px]" />
                    <col className="w-[140px]" />
                    <col className="w-[220px]" />
                  </colgroup>
                  <thead>
                    <tr className="h-12 border-b border-[#333] text-[11px] font-semibold uppercase tracking-[0.12em] text-[#777]">
                      <th className="px-4">
                        <input
                          type="checkbox"
                          aria-label="Select all dashboard invoices"
                          checked={selectedInvoiceIds.length === dashboardInvoices.length && dashboardInvoices.length > 0}
                          onChange={() =>
                            setSelectedInvoiceIds((current) =>
                              current.length === dashboardInvoices.length ? [] : dashboardInvoices.map((invoice) => invoice.id)
                            )
                          }
                          className="h-4 w-4 accent-white"
                        />
                      </th>
                      <th className="px-4">Invoice</th>
                      <th className="px-0">Requested</th>
                      <th className="px-0">Status</th>
                      <th className="px-0">Due</th>
                      <th className="px-0">Amount</th>
                      <th className="px-0">Client</th>
                    </tr>
                  </thead>
                  <tbody>
                    {dashboardInvoices.map((invoice, index) => (
                      <tr
                        key={invoice.id}
                        onClick={() => setSelectedInvoiceId(invoice.id)}
                        className={cn(
                        "h-[72px] cursor-pointer border-b border-[#2c2c2c] transition-colors hover:bg-white/[0.02]",
                          (invoice.id === selectedInvoiceId || index === 0 && !selectedInvoiceId) && "bg-white/[0.04]"
                        )}
                      >
                        <td className="px-4">
                          <input
                            type="checkbox"
                            checked={selectedInvoiceIds.includes(invoice.id)}
                            onChange={(event) => {
                              event.stopPropagation();
                              toggleInvoiceSelection(invoice.id);
                            }}
                            onClick={(event) => event.stopPropagation()}
                            className="h-4 w-4 accent-white"
                          />
                        </td>
                        <td className="px-4">
                          <Link
                            href={`/dashboard/pay-flow/${invoice.id}`}
                            onClick={(event) => event.stopPropagation()}
                            className="font-mono text-[13px] font-semibold text-white hover:underline"
                          >
                            {invoice.id}
                          </Link>
                        </td>
                        <td className="px-0">
                          <RequestedBadge invoiceId={invoice.id} />
                        </td>
                        <td className="px-0">
                          <StatusPill status={invoice.status} />
                        </td>
                        <td className="px-0 text-[13px] text-[#bdbdbd]">{invoice.due}</td>
                        <td className="px-0 text-[13px] font-semibold text-white">
                          {formatMainboardMoney(invoice.amount + invoice.fee)}
                        </td>
                        <td className="px-0">
                          <div className="min-w-0">
                            <p className="truncate text-[13px] font-semibold text-white">{invoice.recipient}</p>
                            <p className="truncate text-[11px] text-[#7f7f7f]">{invoice.note}</p>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Panel>

            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
              <Panel className="flex min-h-[190px] items-center gap-4 p-4 sm:p-5">
                <div className="flex h-20 w-20 shrink-0 items-center justify-center overflow-hidden rounded-full border border-[#3a3a3a] bg-[#0b0b0b]">
                  <img
                    src="https://upload.wikimedia.org/wikipedia/commons/thumb/9/97/The_Earth_seen_from_Apollo_17.jpg/320px-The_Earth_seen_from_Apollo_17.jpg"
                    alt="Earth"
                    className="h-full w-full object-cover"
                    loading="lazy"
                    referrerPolicy="no-referrer"
                  />
                </div>
                <div>
                  <p className="text-[12px] font-semibold uppercase tracking-[0.12em] text-[#777]">
                    AgncyPay
                  </p>
                  <h3 className="mt-2 text-[22px] font-semibold text-white">digital card</h3>
                  <p className="mt-2 text-[13px] leading-5 text-[#8f8f8f]">
                    A branded card surface for fast access and wallet movement.
                  </p>
                </div>
              </Panel>

              <Panel className="relative overflow-hidden p-4 sm:p-5">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.08),transparent_38%)]" />
                <div className="relative flex min-h-[190px] flex-col justify-between">
                  <div className="flex items-start justify-between gap-4">
                    <div className="max-w-[210px]">
                      <p className="text-[12px] font-semibold uppercase tracking-[0.12em] text-[#777]">
                        AgncyPay Card
                      </p>
                      <h3 className="mt-2 text-[24px] font-semibold leading-[1.02] text-white">
                        Online, In Stores, Use AgncyPay Card just about anywhere.
                      </h3>
                    </div>
                    <div className="flex h-[118px] w-[188px] items-center justify-center rounded-[12px] border border-[#3a3a3a] bg-[#080808] p-3">
                      <div className="h-full w-full rounded-[10px] border border-[#4a4a4a] bg-[linear-gradient(135deg,#111_0%,#1b1b1b_46%,#0d0d0d_100%)] p-3">
                        <div className="flex items-start justify-between">
                          <AgncyPayLogo imageClassName="h-4" />
                          <img
                            src="https://www.google.com/s2/favicons?domain=mastercard.com&sz=64"
                            alt="Mastercard"
                            className="h-4 w-4 object-contain"
                            loading="lazy"
                            referrerPolicy="no-referrer"
                          />
                        </div>
                        <div className="mt-7 space-y-2">
                          <div className="h-1.5 w-12 rounded-full bg-white/25" />
                          <div className="h-1.5 w-20 rounded-full bg-white/15" />
                          <div className="h-1.5 w-16 rounded-full bg-white/10" />
                        </div>
                        <div className="mt-7 flex items-end justify-between">
                          <div>
                            <p className="text-[10px] uppercase tracking-[0.12em] text-[#8f8f8f]">Digital card</p>
                            <p className="mt-1 text-[11px] font-semibold text-white">AgncyPay</p>
                          </div>
                          <div className="h-7 w-11 rounded-full border border-[#333] bg-white/5" />
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between gap-4">
                    <button className="inline-flex h-9 items-center rounded-[7px] border border-white bg-white px-3 text-[12px] font-semibold text-black">
                      Apply Now
                    </button>
                    <div className="h-6 w-6 rounded-full border border-[#333] bg-[#111] text-center text-[12px] font-semibold leading-6 text-white">
                      A
                    </div>
                  </div>
                </div>
              </Panel>
            </div>
          </div>

          <div className="space-y-5">
            <Panel className="p-4 sm:p-5">
              <div className="grid grid-cols-5 gap-2">
                {quickActions.map((action) => {
                  const Icon = action.icon;
                  return (
                    <Link
                      key={action.label}
                      href={action.href}
                      className="flex flex-col items-center gap-2 rounded-[10px] border border-[#3a3a3a] bg-[#090909] px-2 py-3 text-center transition-colors hover:border-[#666]"
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
                    <div
                      className={cn(
                        "relative flex h-12 w-[72px] shrink-0 items-center justify-center overflow-hidden rounded-[8px] border border-white/10 bg-gradient-to-br text-[10px] font-semibold tracking-[0.12em] text-white",
                        card.tone
                      )}
                    >
                      <RemoteBrandImage
                        src={card.src}
                        alt={card.name}
                        fallback={card.fallback}
                        className="h-full w-full"
                        imageClassName="h-full w-full rounded-[8px] border border-white/10 bg-[#f1e0b9] object-contain p-1"
                      />
                    </div>
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
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="text-[12px] font-semibold uppercase tracking-[0.12em] text-[#777]">PLAID</p>
                  <h2 className="mt-2 text-[22px] font-semibold text-white">Connect Bank</h2>
                  <p className="mt-2 max-w-[280px] text-[13px] leading-5 text-[#8f8f8f]">
                    Link your payout method to receive monthly royalty distributions automatically.
                  </p>
                </div>
                <div className="flex h-14 w-14 items-center justify-center rounded-full border border-[#3a3a3a] bg-[#0a0a0a]">
                  <Landmark className="h-6 w-6 text-white" />
                </div>
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
      <DashboardFooter />
    </main>
  );
}
