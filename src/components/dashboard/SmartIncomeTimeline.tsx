"use client";

import React, { useState, useMemo, useCallback, memo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search,
  ChevronDown,
  ChevronUp,
  TrendingUp,
  TrendingDown,
  Music,
  Mic,
  Tag,
  ShoppingBag,
  FileText,
  PenLine,
  DollarSign,
  Landmark,
  Trophy,
  Disc3,
  Bus,
  Globe,
  Brain,
  Sparkles,
} from "lucide-react";
import { cn } from "../../lib/utils";

// ─────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────

type EventType =
  | "streaming"
  | "live"
  | "brand"
  | "merchandise"
  | "publishing"
  | "invoice"
  | "contract"
  | "expense"
  | "tax"
  | "achievement"
  | "album"
  | "tour";

type EventStatus = "Paid" | "Completed" | "Pending" | "Signed" | "Released" | "Active";

interface EventMetadata {
  streams?: string;
  countries?: { name: string; pct: number }[];
  paymentMethod?: string;
  referenceId?: string;
  paymentDate?: string;
  notes?: string;
  venue?: string;
  brand?: string;
  invoiceNumber?: string;
  label?: string;
  advance?: string;
  category?: string;
}

interface TimelineEvent {
  id: string;
  type: EventType;
  title: string;
  description: string;
  date: string;
  amount?: number;
  currency: string;
  status?: EventStatus;
  platform?: string;
  category: string;
  metadata?: EventMetadata;
}

type FilterKey =
  | "All"
  | "Royalties"
  | "Tours"
  | "Brand Deals"
  | "Merchandise"
  | "Publishing"
  | "Contracts"
  | "Invoices"
  | "Expenses"
  | "Taxes"
  | "Achievements";

type PeriodKey = "Month" | "Quarter" | "Year" | "All Time";

// ─────────────────────────────────────────────
// Static Data
// ─────────────────────────────────────────────

const TIMELINE_EVENTS: TimelineEvent[] = [
  {
    id: "evt-001",
    type: "streaming",
    title: "Spotify Royalty",
    description: "Monthly streaming royalty received for catalog.",
    date: "Jul 25, 2026",
    amount: 18450,
    currency: "USD",
    status: "Paid",
    platform: "Spotify",
    category: "Royalties",
    metadata: {
      streams: "2.4M",
      countries: [
        { name: "USA", pct: 35 },
        { name: "UK", pct: 22 },
        { name: "Canada", pct: 10 },
        { name: "Germany", pct: 8 },
      ],
      paymentMethod: "Royalty Distribution",
      referenceId: "SPT-2026-07-0341",
      paymentDate: "Jul 25, 2026",
      notes: "July royalty cycle payout from Spotify for Distributor Agreement.",
    },
  },
  {
    id: "evt-002",
    type: "contract",
    title: "Contract Signed",
    description: "Universal Music deal — advance received.",
    date: "Jul 20, 2026",
    amount: 250000,
    currency: "USD",
    status: "Signed",
    platform: "Universal Music",
    category: "Contracts",
    metadata: {
      label: "Universal Music Group",
      advance: "$250,000",
      referenceId: "UMG-CONTRACT-2026-07",
      paymentDate: "Jul 20, 2026",
      notes: "2-year recording and distribution agreement. Advance payment released upon signature.",
    },
  },
  {
    id: "evt-003",
    type: "live",
    title: "Live Concert Income",
    description: "Los Angeles Arena headline show revenue.",
    date: "Jul 18, 2026",
    amount: 41000,
    currency: "USD",
    status: "Completed",
    platform: "Los Angeles Arena",
    category: "Tours",
    metadata: {
      venue: "Los Angeles Arena",
      referenceId: "SHOW-LA-2026",
      paymentDate: "Jul 19, 2026",
      notes: "Net revenue after venue split and production costs.",
    },
  },
  {
    id: "evt-004",
    type: "brand",
    title: "Brand Partnership",
    description: "Nike Campaign — digital and social media placement.",
    date: "Jul 15, 2026",
    amount: 12000,
    currency: "USD",
    status: "Paid",
    platform: "Nike",
    category: "Brand Deals",
    metadata: {
      brand: "Nike",
      referenceId: "NIKE-CAMP-2026-07",
      paymentDate: "Jul 15, 2026",
      notes: "Instagram and TikTok campaign. 3 posts over 7 days.",
    },
  },
  {
    id: "evt-005",
    type: "streaming",
    title: "Apple Music Royalty",
    description: "Monthly streaming royalty from Apple Music.",
    date: "Jul 12, 2026",
    amount: 7800,
    currency: "USD",
    status: "Paid",
    platform: "Apple Music",
    category: "Royalties",
    metadata: {
      streams: "1.1M",
      paymentMethod: "Royalty Distribution",
      referenceId: "APL-2026-07-0112",
      paymentDate: "Jul 12, 2026",
    },
  },
  {
    id: "evt-006",
    type: "streaming",
    title: "YouTube Revenue",
    description: "Ad revenue and YouTube Music streaming royalties.",
    date: "Jul 10, 2026",
    amount: 5600,
    currency: "USD",
    status: "Paid",
    platform: "YouTube",
    category: "Royalties",
    metadata: {
      streams: "8.7M",
      paymentMethod: "AdSense + Music Revenue",
      referenceId: "YT-2026-07-0101",
      paymentDate: "Jul 10, 2026",
    },
  },
  {
    id: "evt-007",
    type: "merchandise",
    title: "Merchandise Sales",
    description: "Online store revenue — summer merch drop.",
    date: "Jul 8, 2026",
    amount: 8300,
    currency: "USD",
    status: "Completed",
    platform: "Shopify",
    category: "Merchandise",
    metadata: {
      referenceId: "MERCH-2026-07-SUM",
      paymentDate: "Jul 8, 2026",
      notes: "Summer collection launch: hoodies, tees, and accessories.",
    },
  },
  {
    id: "evt-008",
    type: "publishing",
    title: "Publishing Royalty",
    description: "ASCAP quarterly mechanical and performance royalties.",
    date: "Jul 5, 2026",
    amount: 3500,
    currency: "USD",
    status: "Paid",
    platform: "ASCAP",
    category: "Publishing",
    metadata: {
      paymentMethod: "Publishing Distribution",
      referenceId: "ASCAP-Q2-2026",
      paymentDate: "Jul 5, 2026",
    },
  },
  {
    id: "evt-009",
    type: "invoice",
    title: "Invoice Paid",
    description: "Brand sync license fee — TV commercial.",
    date: "Jul 3, 2026",
    amount: 4800,
    currency: "USD",
    status: "Paid",
    platform: "Sync Agency",
    category: "Invoices",
    metadata: {
      invoiceNumber: "#2034",
      referenceId: "INV-2034",
      paymentDate: "Jul 3, 2026",
      notes: "Sync placement — national TV commercial campaign.",
    },
  },
  {
    id: "evt-010",
    type: "expense",
    title: "Expense — Tour Bus Rental",
    description: "3-day tour bus rental for regional dates.",
    date: "Jul 2, 2026",
    amount: -2400,
    currency: "USD",
    status: "Completed",
    platform: "Bus Co.",
    category: "Expenses",
    metadata: {
      referenceId: "EXP-TOURBUS-2026",
      paymentDate: "Jul 2, 2026",
      notes: "3 nights. Includes driver and fuel.",
    },
  },
  {
    id: "evt-011",
    type: "tax",
    title: "Tax Payment",
    description: "Q2 estimated income tax payment.",
    date: "Jun 30, 2026",
    amount: -6500,
    currency: "USD",
    status: "Completed",
    platform: "IRS",
    category: "Taxes",
    metadata: {
      referenceId: "TAX-Q2-2026",
      paymentDate: "Jun 30, 2026",
      notes: "Quarterly estimated tax — Form 1040-ES.",
    },
  },
  {
    id: "evt-012",
    type: "achievement",
    title: "🏆 First $100K Month",
    description: "Total income crossed $100K for the first time this month.",
    date: "Jun 28, 2026",
    currency: "USD",
    category: "Achievements",
  },
  {
    id: "evt-013",
    type: "album",
    title: "Album Released",
    description: "Debut album dropped across all streaming platforms.",
    date: "Jun 15, 2026",
    currency: "USD",
    category: "Achievements",
  },
  {
    id: "evt-014",
    type: "tour",
    title: "World Tour Started",
    description: "Kick-off date in Los Angeles. 28-city run begins.",
    date: "Jun 1, 2026",
    currency: "USD",
    status: "Active",
    category: "Tours",
  },
];

const AI_SUMMARY = [
  "Revenue increased by 18% this month.",
  "Spotify generated the highest streaming income at $18,450.",
  "Tour & concert revenue contributed 35% of total earnings.",
  "Expenses decreased by 12% compared to last month.",
  "Estimated next Spotify royalty arrives in 8 days.",
];

const FILTER_KEYS: FilterKey[] = [
  "All",
  "Royalties",
  "Tours",
  "Brand Deals",
  "Merchandise",
  "Publishing",
  "Contracts",
  "Invoices",
  "Expenses",
  "Taxes",
  "Achievements",
];

const PERIOD_KEYS: PeriodKey[] = ["Month", "Quarter", "Year", "All Time"];

// ─────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────

function fmtAmount(amount: number, currency = "USD"): string {
  const abs = Math.abs(amount);
  const prefix = amount < 0 ? "-" : "+";
  return `${prefix}$${abs.toLocaleString("en-US", { minimumFractionDigits: 0 })}`;
}

function getEventAccent(type: EventType): {
  ring: string;
  dot: string;
  badge: string;
  badgeText: string;
  icon: string;
  glow: string;
} {
  switch (type) {
    case "streaming":
    case "publishing":
    case "merchandise":
    case "invoice":
      return {
        ring: "border-[#13d463]/30",
        dot: "bg-[#13d463]",
        badge: "bg-[#082315] border-[#14c96b]",
        badgeText: "text-[#70ff9e]",
        icon: "text-[#13d463]",
        glow: "shadow-[0_0_16px_rgba(19,212,99,0.15)]",
      };
    case "expense":
    case "tax":
      return {
        ring: "border-[#ff5f5f]/30",
        dot: "bg-[#ff5f5f]",
        badge: "bg-[#200b0b] border-[#ff5f5f]",
        badgeText: "text-[#ff9e9e]",
        icon: "text-[#ff5f5f]",
        glow: "shadow-[0_0_16px_rgba(255,95,95,0.12)]",
      };
    case "contract":
      return {
        ring: "border-[#5f9fff]/30",
        dot: "bg-[#5f9fff]",
        badge: "bg-[#0a1220] border-[#5f9fff]",
        badgeText: "text-[#9ec8ff]",
        icon: "text-[#5f9fff]",
        glow: "shadow-[0_0_16px_rgba(95,159,255,0.12)]",
      };
    case "live":
    case "tour":
      return {
        ring: "border-[#ff9e3d]/30",
        dot: "bg-[#ff9e3d]",
        badge: "bg-[#1e0f00] border-[#ff9e3d]",
        badgeText: "text-[#ffca85]",
        icon: "text-[#ff9e3d]",
        glow: "shadow-[0_0_16px_rgba(255,158,61,0.12)]",
      };
    case "brand":
      return {
        ring: "border-[#c97bff]/30",
        dot: "bg-[#c97bff]",
        badge: "bg-[#130e1e] border-[#c97bff]",
        badgeText: "text-[#dbb5ff]",
        icon: "text-[#c97bff]",
        glow: "shadow-[0_0_16px_rgba(201,123,255,0.12)]",
      };
    case "achievement":
    case "album":
      return {
        ring: "border-[#ffe066]/30",
        dot: "bg-[#ffe066]",
        badge: "bg-[#1a1600] border-[#ffe066]",
        badgeText: "text-[#ffe898]",
        icon: "text-[#ffe066]",
        glow: "shadow-[0_0_16px_rgba(255,224,102,0.12)]",
      };
    default:
      return {
        ring: "border-[#444]",
        dot: "bg-[#555]",
        badge: "bg-[#111] border-[#444]",
        badgeText: "text-[#aaa]",
        icon: "text-[#aaa]",
        glow: "",
      };
  }
}

function getEventIcon(type: EventType, platform?: string): React.ReactNode {
  const cls = "h-4 w-4";
  if (type === "streaming") {
    if (platform === "Spotify") return <Music className={cls} />;
    if (platform === "Apple Music") return <Music className={cls} />;
    if (platform === "YouTube") return <Music className={cls} />;
    return <Music className={cls} />;
  }
  if (type === "live") return <Mic className={cls} />;
  if (type === "brand") return <Tag className={cls} />;
  if (type === "merchandise") return <ShoppingBag className={cls} />;
  if (type === "publishing") return <FileText className={cls} />;
  if (type === "invoice") return <FileText className={cls} />;
  if (type === "contract") return <PenLine className={cls} />;
  if (type === "expense") return <TrendingDown className={cls} />;
  if (type === "tax") return <Landmark className={cls} />;
  if (type === "achievement") return <Trophy className={cls} />;
  if (type === "album") return <Disc3 className={cls} />;
  if (type === "tour") return <Globe className={cls} />;
  return <DollarSign className={cls} />;
}

// ─────────────────────────────────────────────
// Sub-Components
// ─────────────────────────────────────────────

const AISummaryCard = memo(function AISummaryCard() {
  return (
    <div className="mb-5 rounded-[12px] border border-[#1e2d1e] bg-[#080e08] p-4">
      <div className="flex items-center gap-2 mb-3">
        <span className="flex h-7 w-7 items-center justify-center rounded-[7px] border border-[#1e3d1e] bg-[#0a1a0a]">
          <Brain className="h-4 w-4 text-[#13d463]" />
        </span>
        <span className="text-[13px] font-black text-white">Summary</span>
        <span className="ml-auto flex items-center gap-1 text-[10px] font-semibold text-[#13d463]">
          <Sparkles className="h-3 w-3" />
          Live
        </span>
      </div>
      <ul className="space-y-1.5">
        {AI_SUMMARY.map((insight, i) => (
          <li key={i} className="flex items-start gap-2 text-[12px] text-[#a0a0a0] leading-[1.5]">
            <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-[#13d463]" />
            {insight}
          </li>
        ))}
      </ul>
    </div>
  );
});

interface EventCardProps {
  event: TimelineEvent;
  isLast: boolean;
}

const EventCard = memo(function EventCard({ event, isLast }: EventCardProps) {
  const [expanded, setExpanded] = useState(false);
  const accent = getEventAccent(event.type);
  const isNegative = (event.amount ?? 0) < 0;

  return (
    <div className="relative flex gap-3">
      {/* Timeline line */}
      {!isLast && (
        <div className="absolute left-[15px] top-[32px] bottom-0 w-px bg-gradient-to-b from-[#2a2a2a] to-transparent" />
      )}

      {/* Dot */}
      <div className="relative z-10 flex flex-col items-center shrink-0 mt-[6px]">
        <div className={cn("h-[30px] w-[30px] rounded-full border-2 flex items-center justify-center bg-[#0a0a0a]", `border-[#2a2a2a]`, accent.glow)}>
          <span className={accent.icon}>{getEventIcon(event.type, event.platform)}</span>
        </div>
      </div>

      {/* Card */}
      <motion.div
        className={cn(
          "mb-4 flex-1 min-w-0 rounded-[11px] border bg-[#0a0a0a] overflow-hidden cursor-pointer transition-colors duration-200",
          accent.ring,
          expanded ? accent.glow : "hover:border-[#333]"
        )}
        layout
        onClick={() => setExpanded((v) => !v)}
      >
        {/* Card header */}
        <div className="flex items-start justify-between gap-3 p-3.5">
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-[13px] font-bold text-white leading-tight">{event.title}</span>
              {event.status && (
                <span className={cn("inline-flex h-[18px] items-center rounded-full border px-2 text-[10px] font-black", accent.badge, accent.badgeText)}>
                  {event.status}
                </span>
              )}
            </div>
            <p className="mt-0.5 text-[11px] text-[#6a6a6a]">{event.date}</p>
            <p className="mt-1.5 text-[12px] text-[#8a8a8a] leading-[1.45]">{event.description}</p>
          </div>

          <div className="flex flex-col items-end shrink-0 gap-1.5 ml-2">
            {event.amount !== undefined && (
              <span className={cn("text-[14px] font-black leading-none", isNegative ? "text-[#ff7070]" : "text-[#13d463]")}>
                {fmtAmount(event.amount)}
              </span>
            )}
            <span className={cn("flex items-center gap-0.5 text-[10px] font-semibold text-[#555] mt-auto")}>
              {expanded ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
              {expanded ? "Less" : "Details"}
            </span>
          </div>
        </div>

        {/* Expanded details */}
        <AnimatePresence initial={false}>
          {expanded && event.metadata && (
            <motion.div
              key="details"
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.22, ease: "easeInOut" }}
              className="overflow-hidden"
            >
              <div className="border-t border-[#1e1e1e] px-3.5 py-3 space-y-3">
                {event.metadata.streams && (
                  <Row label="Streams" value={event.metadata.streams} />
                )}
                {event.metadata.countries && event.metadata.countries.length > 0 && (
                  <div>
                    <p className="text-[10px] font-semibold uppercase tracking-wider text-[#555] mb-2">Countries</p>
                    <div className="flex flex-wrap gap-2">
                      {event.metadata.countries.map((c) => (
                        <div key={c.name} className="flex items-center gap-1.5 rounded-[6px] border border-[#2a2a2a] bg-black px-2 py-1">
                          <span className="text-[11px] font-semibold text-[#aaa]">{c.name}</span>
                          <span className="text-[11px] font-black text-[#13d463]">{c.pct}%</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                {event.metadata.venue && <Row label="Venue" value={event.metadata.venue} />}
                {event.metadata.brand && <Row label="Brand" value={event.metadata.brand} />}
                {event.metadata.label && <Row label="Label" value={event.metadata.label} />}
                {event.metadata.advance && <Row label="Advance" value={event.metadata.advance} />}
                {event.metadata.invoiceNumber && <Row label="Invoice #" value={event.metadata.invoiceNumber} />}
                {event.metadata.paymentMethod && <Row label="Payment Method" value={event.metadata.paymentMethod} />}
                {event.metadata.referenceId && <Row label="Reference ID" value={event.metadata.referenceId} mono />}
                {event.metadata.paymentDate && <Row label="Payment Date" value={event.metadata.paymentDate} />}
                {event.metadata.notes && (
                  <div>
                    <p className="text-[10px] font-semibold uppercase tracking-wider text-[#555] mb-1">Notes</p>
                    <p className="text-[12px] text-[#7a7a7a] leading-[1.5]">{event.metadata.notes}</p>
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
});

function Row({ label, value, mono = false }: { label: string; value: string; mono?: boolean }) {
  return (
    <div className="flex items-center justify-between gap-3">
      <span className="text-[11px] font-semibold text-[#555]">{label}</span>
      <span className={cn("text-[11px] font-semibold text-[#c0c0c0] text-right", mono && "font-mono")}>{value}</span>
    </div>
  );
}

// ─────────────────────────────────────────────
// Main Component
// ─────────────────────────────────────────────

export const SmartIncomeTimeline = memo(function SmartIncomeTimeline() {
  const [activePeriod, setActivePeriod] = useState<PeriodKey>("Month");
  const [activeFilter, setActiveFilter] = useState<FilterKey>("All");
  const [searchQuery, setSearchQuery] = useState("");

  const filtered = useMemo(() => {
    let events = TIMELINE_EVENTS;

    if (activeFilter !== "All") {
      events = events.filter((e) => e.category === activeFilter);
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      events = events.filter(
        (e) =>
          e.title.toLowerCase().includes(q) ||
          e.description.toLowerCase().includes(q) ||
          e.platform?.toLowerCase().includes(q) ||
          e.category.toLowerCase().includes(q)
      );
    }

    return events;
  }, [activeFilter, searchQuery]);

  const handleSearchChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  }, []);

  return (
    <div className="rounded-[14px] border border-[#242424] bg-[#0b0b0b] p-4 sm:p-5">
      {/* Header */}
      <div className="flex flex-wrap items-start justify-between gap-3 mb-4">
        <div>
          <h2 className="text-[17px] font-black text-white">🎵 Smart Income Timeline</h2>
          <p className="mt-0.5 text-[12px] text-[#6a6a6a]">
            Track every important financial milestone in your music career.
          </p>
        </div>

        {/* Period tabs */}
        <div className="flex items-center gap-1 rounded-[8px] border border-[#272727] bg-black p-0.5">
          {PERIOD_KEYS.map((p) => (
            <button
              key={p}
              type="button"
              onClick={() => setActivePeriod(p)}
              className={cn(
                "rounded-[6px] px-2.5 py-1 text-[11px] font-bold transition-colors duration-150",
                activePeriod === p
                  ? "bg-[#1a1a1a] text-white border border-[#3a3a3a]"
                  : "text-[#555] hover:text-[#aaa]"
              )}
            >
              {p}
            </button>
          ))}
        </div>
      </div>

      {/* AI Summary */}
      <AISummaryCard />

      {/* Search */}
      <div className="relative mb-3">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-[#444]" />
        <input
          type="text"
          placeholder="Search by platform, event, or keyword…"
          value={searchQuery}
          onChange={handleSearchChange}
          className="h-9 w-full rounded-[8px] border border-[#272727] bg-black pl-8 pr-3 text-[12px] font-semibold text-white placeholder:text-[#3a3a3a] focus:border-[#444] focus:outline-none transition-colors"
        />
      </div>

      {/* Filter pills */}
      <div className="flex flex-wrap gap-1.5 mb-5">
        {FILTER_KEYS.map((key) => (
          <button
            key={key}
            type="button"
            onClick={() => setActiveFilter(key)}
            className={cn(
              "h-[26px] rounded-full border px-3 text-[11px] font-bold transition-colors duration-150",
              activeFilter === key
                ? "border-[#13d463] bg-[#082315] text-[#70ff9e]"
                : "border-[#2a2a2a] bg-transparent text-[#555] hover:text-[#aaa] hover:border-[#3a3a3a]"
            )}
          >
            {key}
          </button>
        ))}
      </div>

      {/* Timeline */}
      {filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-10 text-center">
          <Search className="h-8 w-8 text-[#333] mb-3" />
          <p className="text-[13px] font-semibold text-[#555]">No events found</p>
          <p className="text-[11px] text-[#3a3a3a] mt-1">Try adjusting your search or filters.</p>
        </div>
      ) : (
        <div className="relative pl-1">
          <AnimatePresence mode="popLayout">
            {filtered.map((event, i) => (
              <motion.div
                key={event.id}
                initial={{ opacity: 0, y: 14 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                transition={{ duration: 0.22, delay: i * 0.04, ease: "easeOut" }}
                layout
              >
                <EventCard event={event} isLast={i === filtered.length - 1} />
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
});

export default SmartIncomeTimeline;
