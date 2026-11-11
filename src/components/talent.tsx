"use client";

import { ArrowDownLeft, ArrowUpRight, CreditCard, ExternalLink, Landmark, Undo2 } from "lucide-react";
import { cx } from "./ui";
import { dateShort, money } from "@/lib/format";
import type { WalletTx } from "@/lib/types";

const ICONS: Record<WalletTx["kind"], { icon: typeof ArrowDownLeft; tone: string }> = {
  earning: { icon: ArrowDownLeft, tone: "bg-emerald-50 text-emerald-700" },
  transfer_in: { icon: ArrowDownLeft, tone: "bg-emerald-50 text-emerald-700" },
  reversal: { icon: Undo2, tone: "bg-rose-50 text-rose-700" },
  withdrawal: { icon: Landmark, tone: "bg-ink/5 text-ink/70" },
  transfer_out: { icon: ArrowUpRight, tone: "bg-ink/5 text-ink/70" },
  card: { icon: CreditCard, tone: "bg-violet-50 text-violet-700" },
  external: { icon: ExternalLink, tone: "bg-sky-50 text-sky-700" },
};

export function TxRow({ tx }: { tx: WalletTx }) {
  const { icon: Icon, tone } = ICONS[tx.kind];
  const shown = tx.kind === "external" ? tx.externalAmount ?? 0 : tx.amount;
  return (
    <li className="flex items-center gap-3 py-3">
      <span className={cx("flex h-10 w-10 shrink-0 items-center justify-center rounded-full", tone)}>
        <Icon className="h-4 w-4" />
      </span>
      <span className="min-w-0 flex-1">
        <span className="block truncate text-sm font-medium text-ink">{tx.title}</span>
        <span className="block truncate text-xs text-muted">
          {dateShort(tx.at)} · {tx.detail}
        </span>
      </span>
      <span className={cx("tabular text-sm font-semibold", tx.kind === "external" ? "text-ink/50" : shown > 0 ? "text-emerald-700" : "text-ink")}>
        {tx.kind === "external" ? money(shown) : `${shown > 0 ? "+" : "−"}${money(Math.abs(shown))}`}
      </span>
    </li>
  );
}

export function Section({ title, action, children, className }: { title: string; action?: React.ReactNode; children: React.ReactNode; className?: string }) {
  return (
    <section className={cx("mt-7", className)}>
      <div className="mb-2 flex items-center justify-between">
        <h2 className="text-[15px] font-semibold text-ink">{title}</h2>
        {action}
      </div>
      {children}
    </section>
  );
}
