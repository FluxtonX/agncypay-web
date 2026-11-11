"use client";

import { Suspense, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { ArrowLeftRight, Download, History } from "lucide-react";
import { Button, Card, EmptyState, PageHeader, Pill, SkeletonRows, Splash, Stat, Tabs, type Tone } from "@/components/ui";
import { useAgency } from "@/lib/agency";
import { C, col, useLive, where } from "@/lib/db";
import { reconcile, type ReconState } from "@/lib/domain";
import { dateLong, dateShort, money, toCsv } from "@/lib/format";
import type { ActivityEvent } from "@/lib/types";

const RECON: Record<ReconState, { label: string; tone: Tone }> = {
  awaiting_brand: { label: "Awaiting brand", tone: "blue" },
  payouts_open: { label: "Payouts open", tone: "amber" },
  reconciled: { label: "Reconciled", tone: "green" },
  void: { label: "Void", tone: "neutral" },
};

export default function TrackPage() {
  return (
    <Suspense fallback={<Splash />}>
      <Track />
    </Suspense>
  );
}

function Track() {
  const router = useRouter();
  const tab = useSearchParams().get("tab") === "activity" ? "activity" : "recon";
  return (
    <div>
      <PageHeader title="Track" subtitle="Match every payment to its CRM invoice and allocations, and see who did what, when." />
      <Tabs
        className="mb-5"
        value={tab}
        onChange={(id) => router.replace(id === "recon" ? "/agency/track" : "/agency/track?tab=activity", { scroll: false })}
        tabs={[
          { id: "recon", label: "Reconciliation" },
          { id: "activity", label: "Activity" },
        ]}
      />
      {tab === "recon" ? <Reconciliation /> : <Activity />}
    </div>
  );
}

function Reconciliation() {
  const { org, invoices, allocations, loading } = useAgency();
  const rows = useMemo(() => reconcile(invoices, allocations), [invoices, allocations]);
  const [filter, setFilter] = useState<ReconState | "all">("all");
  const shown = rows.filter((r) => filter === "all" || r.state === filter);
  const currency = rows[0]?.invoice.currency ?? "USD";
  const sum = (k: "received" | "paidOut" | "remaining" | "inFlight") => rows.reduce((s, r) => s + r[k], 0);

  const exportCsv = () => {
    const csv = toCsv([
      ["Invoice", "Brand", "Issued", "Status", "Invoiced", "Received", "Allocated", "Paid out", "In flight", "Remaining", "Retained", "Currency"],
      ...rows.map((r) => [
        r.invoice.number,
        r.invoice.brandName,
        dateLong(r.invoice.issueDate),
        RECON[r.state].label,
        (r.invoiced / 100).toFixed(2),
        (r.received / 100).toFixed(2),
        (r.allocated / 100).toFixed(2),
        (r.paidOut / 100).toFixed(2),
        (r.inFlight / 100).toFixed(2),
        (r.remaining / 100).toFixed(2),
        (r.retained / 100).toFixed(2),
        r.invoice.currency,
      ]),
    ]);
    const url = URL.createObjectURL(new Blob([csv], { type: "text/csv" }));
    const a = document.createElement("a");
    a.href = url;
    a.download = `${org.name.replace(/[^\w]+/g, "-").toLowerCase()}-reconciliation.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <>
      <div className="mb-5 grid grid-cols-2 gap-3 lg:grid-cols-4">
        <Stat label="Received from brands" value={money(sum("received"), currency)} />
        <Stat label="Paid out" value={money(sum("paidOut"), currency)} />
        <Stat label="In flight" value={money(sum("inFlight"), currency)} hint="Waiting on recipients" />
        <Stat label="Still to pay out" value={money(rows.filter((r) => r.state === "payouts_open").reduce((s, r) => s + r.remaining, 0), currency)} hint="On paid invoices" />
      </div>
      <Card>
        <div className="flex flex-wrap items-center gap-3 border-b border-line px-4 py-3">
          <Tabs
            value={filter}
            onChange={setFilter}
            tabs={[
              { id: "all", label: "All" },
              { id: "payouts_open", label: "Payouts open", count: rows.filter((r) => r.state === "payouts_open").length },
              { id: "awaiting_brand", label: "Awaiting brand" },
              { id: "reconciled", label: "Reconciled" },
            ]}
          />
          <Button variant="secondary" size="sm" className="ml-auto" icon={<Download className="h-3.5 w-3.5" />} onClick={exportCsv} disabled={!rows.length}>
            Export CSV
          </Button>
        </div>
        {loading ? (
          <SkeletonRows />
        ) : shown.length === 0 ? (
          <EmptyState icon={<ArrowLeftRight className="h-5 w-5" />} title="Nothing to reconcile yet" body="Invoices appear here once you've sent the payment request." />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[860px] text-sm">
              <thead>
                <tr className="border-b border-line text-left text-xs text-muted">
                  <th className="py-2.5 pl-5 pr-3 font-medium">Invoice</th>
                  <th className="py-2.5 pr-3 text-right font-medium">Invoiced</th>
                  <th className="py-2.5 pr-3 text-right font-medium">Received</th>
                  <th className="py-2.5 pr-3 text-right font-medium">Allocated</th>
                  <th className="py-2.5 pr-3 text-right font-medium">Paid out</th>
                  <th className="py-2.5 pr-3 text-right font-medium">Remaining</th>
                  <th className="py-2.5 pr-3 text-right font-medium">Retained</th>
                  <th className="py-2.5 pr-5 font-medium">Status</th>
                </tr>
              </thead>
              <tbody>
                {shown.map((r) => {
                  const c = r.invoice.currency;
                  return (
                    <tr key={r.invoice.id} className="border-b border-line/70 last:border-0">
                      <td className="py-3 pl-5 pr-3">
                        <Link href={`/agency/invoices/${r.invoice.id}`} className="font-medium text-ink hover:underline">
                          {r.invoice.number}
                        </Link>
                        <p className="text-xs text-muted">
                          {r.invoice.brandName} · {dateShort(r.invoice.issueDate)}
                        </p>
                      </td>
                      <td className="tabular py-3 pr-3 text-right">{money(r.invoiced, c)}</td>
                      <td className="tabular py-3 pr-3 text-right">{r.received ? money(r.received, c) : <span className="text-ink/30">—</span>}</td>
                      <td className="tabular py-3 pr-3 text-right">{money(r.allocated, c)}</td>
                      <td className="tabular py-3 pr-3 text-right">
                        {money(r.paidOut, c)}
                        {r.inFlight > 0 && <span className="block text-[11px] text-amber-700">+{money(r.inFlight, c)} in flight</span>}
                      </td>
                      <td className="tabular py-3 pr-3 text-right font-medium">{r.remaining ? money(r.remaining, c) : <span className="text-ink/30">—</span>}</td>
                      <td className="tabular py-3 pr-3 text-right text-ink/70">{money(r.retained, c)}</td>
                      <td className="py-3 pr-5">
                        <Pill tone={RECON[r.state].tone} dot>
                          {RECON[r.state].label}
                        </Pill>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </>
  );
}

function Activity() {
  const { org } = useAgency();
  const live = useLive<ActivityEvent>(`activity:${org.id}`, () => col(C.activity, where("orgId", "==", org.id)));
  const days = useMemo(() => {
    const sorted = [...live.data].sort((a, b) => b.at - a.at).slice(0, 300);
    const m = new Map<string, ActivityEvent[]>();
    for (const e of sorted) {
      const key = dateLong(e.at);
      m.set(key, [...(m.get(key) ?? []), e]);
    }
    return [...m.entries()];
  }, [live.data]);

  if (live.loading)
    return (
      <Card>
        <SkeletonRows />
      </Card>
    );
  if (days.length === 0)
    return (
      <Card>
        <EmptyState icon={<History className="h-5 w-5" />} title="No activity yet" body="Requests, payments, payouts and team changes are recorded here." />
      </Card>
    );
  return (
    <Card className="px-5 py-2">
      {days.map(([day, events]) => (
        <section key={day} className="py-4">
          <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-muted">{day}</p>
          <ol className="space-y-0">
            {events.map((e) => (
              <li key={e.id} className="relative flex gap-4 border-l border-line pb-4 pl-5 last:pb-1">
                <span className="absolute -left-[5px] top-1.5 h-2.5 w-2.5 rounded-full border-2 border-white bg-ink/50" />
                <span className="tabular w-16 shrink-0 text-xs text-muted">{new Date(e.at).toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" })}</span>
                <span className="min-w-0 flex-1">
                  <span className="block text-sm text-ink">
                    {e.invoiceId ? (
                      <Link href={`/agency/invoices/${e.invoiceId}`} className="hover:underline">
                        {e.summary}
                      </Link>
                    ) : (
                      e.summary
                    )}
                  </span>
                  <span className="block text-xs text-muted">{e.actor}</span>
                </span>
                {e.amount ? <span className="tabular text-sm font-medium text-ink">{money(e.amount)}</span> : null}
              </li>
            ))}
          </ol>
        </section>
      ))}
    </Card>
  );
}
