"use client";

import React, { useMemo, useState } from "react";
import Link from "next/link";
import { Download, TrendingUp, Search, ArrowLeft } from "lucide-react";
import { cn } from "../../../lib/utils";
import { useDynamicIncomes, modelIncomeItems, RemoteBrandImage } from "../../../components/dashboard/ModelAgencyDashboard";

// ─── helpers ────────────────────────────────────────────────────────────────

const getFavicon = (domain: string) =>
  `https://t3.gstatic.com/faviconV2?client=SOCIAL&type=FAVICON&fallback_opts=TYPE,SIZE,URL&url=http://${domain}&size=128`;

/** Try to derive a favicon URL from the platform/vendor name. */
function resolveLogoSrc(name: string, existingSrc?: string): string {
  if (existingSrc && existingSrc.startsWith("http")) return existingSrc;
  const map: Record<string, string> = {
    spotify: getFavicon("spotify.com"),
    "apple music": getFavicon("apple.com"),
    youtube: getFavicon("youtube.com"),
    amazon: getFavicon("amazon.com"),
    "amazon music": getFavicon("amazon.com"),
    tidal: getFavicon("tidal.com"),
    deezer: getFavicon("deezer.com"),
    pandora: getFavicon("pandora.com"),
    soundcloud: getFavicon("soundcloud.com"),
    napster: getFavicon("napster.com"),
    instagram: getFavicon("instagram.com"),
    facebook: getFavicon("facebook.com"),
    tiktok: getFavicon("tiktok.com"),
    twitter: getFavicon("twitter.com"),
    snapchat: getFavicon("snapchat.com"),
    nike: getFavicon("nike.com"),
    adidas: getFavicon("adidas.com"),
    "louis vuitton": getFavicon("louisvuitton.com"),
    "the north face": getFavicon("thenorthface.com"),
    ascap: getFavicon("ascap.com"),
    bmi: getFavicon("bmi.com"),
    distrokid: getFavicon("distrokid.com"),
    "tune core": getFavicon("tunecore.com"),
    tunecore: getFavicon("tunecore.com"),
    "cd baby": getFavicon("cdbaby.com"),
    cdbaby: getFavicon("cdbaby.com"),
    merch: getFavicon("shopify.com"),
    shopify: getFavicon("shopify.com"),
  };
  const key = name.toLowerCase().trim();
  for (const [k, v] of Object.entries(map)) {
    if (key.includes(k)) return v;
  }
  // derive domain guess from first word
  const firstWord = key.split(/\s|_|-/)[0];
  return getFavicon(`${firstWord}.com`);
}

interface IncomeItem {
  name: string;
  detail?: string;
  date?: string;
  amount: string;
  src?: string;
  fallback?: string;
  className?: string;
  imageClassName?: string;
  [key: string]: any;
}

interface PlatformGroup {
  name: string;
  totalAmount: number;
  count: number;
  src: string;
  fallback: string;
  className?: string;
  imageClassName?: string;
  transactions: IncomeItem[];
}

/** Parse a currency string like "$3,040.00" or "3040.00" → number */
function parseAmount(raw: string | number | undefined): number {
  if (typeof raw === "number") return raw;
  if (!raw) return 0;
  return parseFloat(String(raw).replace(/[$,\s]/g, "")) || 0;
}

/** Normalize a platform name to a consistent key */
function normalizeName(name: string): string {
  return name.trim();
}

/** Group flat income items by platform name, summing amounts. */
function groupByPlatform(items: IncomeItem[]): PlatformGroup[] {
  const map = new Map<string, PlatformGroup>();

  for (const item of items) {
    const key = normalizeName(item.name);
    const existing = map.get(key);
    const amount = parseAmount(item.amount);

    if (existing) {
      existing.totalAmount += amount;
      existing.count += 1;
      existing.transactions.push(item);
    } else {
      map.set(key, {
        name: key,
        totalAmount: amount,
        count: 1,
        src: resolveLogoSrc(key, item.src),
        fallback: item.fallback || key.slice(0, 3).toUpperCase(),
        className: item.className,
        imageClassName: item.imageClassName,
        transactions: [item],
      });
    }
  }

  // Sort by total amount descending
  return Array.from(map.values()).sort((a, b) => b.totalAmount - a.totalAmount);
}

function fmtUSD(n: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(n);
}

// ─── Component ───────────────────────────────────────────────────────────────

export default function IncomesPage() {
  const dynamicIncomes = useDynamicIncomes();
  const rawIncomes: IncomeItem[] = useMemo(() => {
    return (dynamicIncomes.length > 0 ? dynamicIncomes : modelIncomeItems) as IncomeItem[];
  }, [dynamicIncomes]);

  const [search, setSearch] = useState("");
  const [expanded, setExpanded] = useState<Set<string>>(new Set());

  const groups = useMemo(() => groupByPlatform(rawIncomes), [rawIncomes]);

  const filtered = useMemo(() => {
    if (!search.trim()) return groups;
    const q = search.toLowerCase();
    return groups.filter((g) => g.name.toLowerCase().includes(q));
  }, [groups, search]);

  const grandTotal = useMemo(
    () => filtered.reduce((acc, g) => acc + g.totalAmount, 0),
    [filtered]
  );

  const toggleExpand = (name: string) =>
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(name)) next.delete(name);
      else next.add(name);
      return next;
    });

  return (
    <div className="mx-auto w-full max-w-[1048px] px-4 py-8 sm:px-6 lg:px-8">
      {/* Back Button */}
      <button
        onClick={() => router.push("/dashboard")}
        className="group mb-6 inline-flex items-center gap-2 text-[13px] font-medium text-[#8d8d8d] transition-colors hover:text-white"
      >
        <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-1" />
        Back to Dashboard
      </button>

      <div>
        <h1 className="text-[34px] font-semibold leading-none text-white">Recent Incomes</h1>
        <p className="mt-[18px] text-[20px] leading-6 text-[#9b9b9b]">
          Platform-by-platform breakdown, sorted highest to lowest.
        </p>
      </div>

      <section className="mt-[29px] rounded-[13px] border border-[#676767] bg-black px-[29px] py-[31px]">
        {/* Header row */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-[29px] font-semibold leading-none text-white">Income History</h2>
            <p className="mt-1.5 text-[15px] text-[#6a6a6a]">
              {filtered.length} platform{filtered.length !== 1 ? "s" : ""} · {rawIncomes.length} transaction{rawIncomes.length !== 1 ? "s" : ""}
            </p>
          </div>

          <div className="flex items-center gap-3">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#555]" />
              <input
                type="text"
                placeholder="Search platform…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="h-[40px] w-[200px] rounded-[7px] border border-[#3a3a3a] bg-[#0c0c0c] pl-9 pr-3 text-[14px] font-semibold text-white placeholder:text-[#3a3a3a] focus:border-[#555] focus:outline-none transition-colors"
              />
            </div>
            {/* Export */}
            <button
              type="button"
              className="inline-flex h-[40px] items-center justify-center gap-[12px] rounded-[7px] border border-[#5a5a5a] bg-[#0c0c0c] px-[16px] text-[16px] font-semibold text-white transition-colors hover:border-[#777]"
            >
              <Download className="h-4 w-4" />
              Export
            </button>
          </div>
        </div>

        {/* Table */}
        <div className="mt-[32px] overflow-x-auto">
          <table className="min-w-[800px] table-fixed text-left w-full">
            <colgroup>
              <col className="w-[44px]" />
              <col className="w-[280px]" />
              <col className="w-[120px]" />
              <col className="w-[160px]" />
              <col className="w-[160px]" />
            </colgroup>
            <thead>
              <tr className="h-[48px] border-b border-[#555] text-[15px] font-semibold leading-none text-[#8d8d8d]">
                <th className="pl-[10px]">#</th>
                <th className="pl-2 pr-4">Platform</th>
                <th className="text-center">Transactions</th>
                <th className="text-right pr-6">Share</th>
                <th className="text-right pr-4">Total Income</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((group, idx) => {
                const pct = grandTotal > 0 ? (group.totalAmount / grandTotal) * 100 : 0;
                const isOpen = expanded.has(group.name);

                return (
                  <React.Fragment key={group.name}>
                    {/* Platform row */}
                    <tr
                      onClick={() => toggleExpand(group.name)}
                      className={cn(
                        "h-[64px] border-b border-[#303030] text-[17px] leading-none transition-colors cursor-pointer select-none",
                        isOpen ? "bg-white/[0.03]" : "hover:bg-white/[0.02]"
                      )}
                    >
                      {/* Rank */}
                      <td className="pl-[10px]">
                        <span className="text-[13px] font-bold text-[#555]">{idx + 1}</span>
                      </td>

                      {/* Platform name + logo */}
                      <td className="pl-2 pr-4">
                        <div className="flex items-center gap-3">
                          <div
                            className={cn(
                              "flex h-10 w-10 shrink-0 items-center justify-center rounded-[8px] border border-[#303030] bg-[#060606] p-[2px]"
                            )}
                          >
                            <div
                              className={cn(
                                "h-full w-full overflow-hidden rounded-[6px]",
                                group.className
                              )}
                            >
                              <RemoteBrandImage
                                src={group.src}
                                alt={group.name}
                                fallback={group.fallback}
                                className="h-full w-full"
                                imageClassName={cn("object-contain", group.imageClassName)}
                              />
                            </div>
                          </div>
                          <div className="min-w-0">
                            <span className="block font-semibold text-white truncate max-w-[200px]">
                              {group.name}
                            </span>
                            <span className="block text-[12px] text-[#555] mt-0.5">
                              {group.count} payment{group.count !== 1 ? "s" : ""}
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* Transaction count */}
                      <td className="text-center">
                        <span className="inline-flex h-6 min-w-[28px] items-center justify-center rounded-full border border-[#2a2a2a] bg-[#111] px-2 text-[12px] font-bold text-[#aaa]">
                          {group.count}
                        </span>
                      </td>

                      {/* Share bar */}
                      <td className="pr-6">
                        <div className="flex items-center justify-end gap-2">
                          <div className="w-[80px] h-[6px] rounded-full bg-[#1a1a1a] overflow-hidden">
                            <div
                              className="h-full rounded-full bg-[#13d463]"
                              style={{ width: `${Math.min(pct, 100)}%` }}
                            />
                          </div>
                          <span className="text-[13px] font-semibold text-[#666] w-[36px] text-right">
                            {pct.toFixed(1)}%
                          </span>
                        </div>
                      </td>

                      {/* Total */}
                      <td className="text-right pr-4 font-bold text-[#13d463]">
                        {fmtUSD(group.totalAmount)}
                      </td>
                    </tr>

                    {/* Expanded sub-transactions */}
                    {isOpen && group.transactions.map((tx, ti) => (
                      <tr
                        key={`${group.name}-tx-${ti}`}
                        className="h-[52px] border-b border-[#222] bg-[#060606] text-[14px] leading-none"
                      >
                        <td />
                        <td className="pl-6 pr-4">
                          <span className="text-[#555] font-medium truncate block max-w-[220px]">
                            {tx.detail || "—"}
                          </span>
                        </td>
                        <td className="text-center text-[12px] text-[#555]">{tx.date || "—"}</td>
                        <td />
                        <td className="text-right pr-4 font-semibold text-[#aaa]">
                          {typeof tx.amount === "string" ? tx.amount : fmtUSD(parseAmount(tx.amount))}
                        </td>
                      </tr>
                    ))}
                  </React.Fragment>
                );
              })}

              {/* No results */}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={5} className="h-[120px] text-center text-[17px] text-[#8f8f8f]">
                    No platforms found.
                  </td>
                </tr>
              ) : (
                allIncomes.map((item, i) => (
                  <tr
                    key={`${item.name}-${i}`}
                    onClick={() => {
                      if (item.slug === "uploaded-preview") {
                        window.location.href = "/dashboard/incomes/preview";
                      }
                    }}
                    className={cn(
                      "h-[64px] border-b border-[#303030] last:border-b-0 text-[17px] leading-none transition-colors hover:bg-white/[0.02]",
                      item.slug === "uploaded-preview" && "cursor-pointer"
                    )}
                  >
                    <td className="pl-[10px] pr-4">
                      <div className="flex items-center gap-3">
                        <div className={cn("flex h-10 w-10 shrink-0 items-center justify-center rounded-[8px] border border-[#303030] bg-[#060606] p-[2px]")}>
                          <div className={cn("h-full w-full overflow-hidden rounded-[6px]", item.className)}>
                            <RemoteBrandImage src={item.src} alt={item.name} fallback={item.fallback} className="h-full w-full" imageClassName={item.imageClassName} />
                          </div>
                        </div>
                        <span className="font-semibold text-white truncate max-w-[200px]">{item.name}</span>
                      </div>
                    </td>
                    <td className="text-[#c8c8c8]">{item.detail}</td>
                    <td className="text-[#b8b8b8]">{item.date}</td>
                    <td className="text-right pr-4 font-semibold text-[#13d463]">{item.amount}</td>
                  </tr>
                ))
              )}
            </tbody>

            {/* Grand total footer */}
            {filtered.length > 0 && (
              <tfoot>
                <tr className="h-[60px] border-t-2 border-[#555]">
                  <td />
                  <td className="pl-2">
                    <div className="flex items-center gap-2">
                      <TrendingUp className="h-4 w-4 text-[#13d463]" />
                      <span className="text-[16px] font-black text-white">
                        Total · {filtered.length} Platform{filtered.length !== 1 ? "s" : ""}
                      </span>
                    </div>
                  </td>
                  <td className="text-center text-[15px] font-bold text-[#777]">
                    {rawIncomes.length}
                  </td>
                  <td className="text-right pr-6">
                    <span className="text-[13px] font-semibold text-[#555]">100%</span>
                  </td>
                  <td className="text-right pr-4">
                    <span className="text-[20px] font-black text-[#13d463]">{fmtUSD(grandTotal)}</span>
                  </td>
                </tr>
              </tfoot>
            )}
          </table>
        </div>
      </section>
    </div>
  );
}
