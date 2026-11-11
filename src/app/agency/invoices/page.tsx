"use client";

import { Suspense, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { BellRing, FileText, Search, Send } from "lucide-react";
import { Button, Card, Checkbox, EmptyState, Input, LinkButton, PageHeader, SkeletonRows, Splash, Tabs, cx, useToast } from "@/components/ui";
import { InvoicePill } from "@/components/status";
import { SendRequestDrawer } from "@/components/agency/SendRequestDrawer";
import { ReminderModal } from "@/components/agency/ReminderModal";
import { SyncChip } from "@/components/agency/SyncChip";
import { useAgency } from "@/lib/agency";
import { providerName } from "@/lib/actions";
import { useNow } from "@/lib/db";
import { viewInvoice, type InvoiceState } from "@/lib/domain";
import { dateShort, money, plural } from "@/lib/format";
import type { Invoice } from "@/lib/types";

type TabId = "all" | "to_send" | "awaiting" | "overdue" | "declined" | "paid";
const TAB_STATES: Record<Exclude<TabId, "all">, InvoiceState[]> = {
  to_send: ["not_sent"],
  awaiting: ["awaiting", "overdue"],
  overdue: ["overdue"],
  declined: ["declined"],
  paid: ["paid"],
};

export default function InvoicesPage() {
  return (
    <Suspense fallback={<Splash />}>
      <Invoices />
    </Suspense>
  );
}

function Invoices() {
  const { org, invoices, loading } = useAgency();
  const now = useNow();
  const router = useRouter();
  const params = useSearchParams();
  const toast = useToast();
  const raw = params.get("tab") as TabId | null;
  const tab: TabId = raw && (raw === "all" || raw in TAB_STATES) ? raw : "all";
  const [q, setQ] = useState("");
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [sendId, setSendId] = useState<string | null>(null);
  const [remind, setRemind] = useState<Invoice[] | null>(null);

  const rows = useMemo(() => invoices.map((inv) => ({ inv, view: viewInvoice(inv, now) })), [invoices, now]);
  const counts = useMemo(() => {
    const c = {} as Record<TabId, number>;
    c.all = rows.filter((r) => r.view.state !== "void").length;
    for (const [id, states] of Object.entries(TAB_STATES)) c[id as TabId] = rows.filter((r) => states.includes(r.view.state)).length;
    return c;
  }, [rows]);

  const filtered = rows.filter((r) => {
    if (tab === "all" ? r.view.state === "void" : !TAB_STATES[tab].includes(r.view.state)) return false;
    const term = q.trim().toLowerCase();
    return !term || [r.inv.number, r.inv.brandName, r.inv.description, r.inv.brandEmail].some((f) => f.toLowerCase().includes(term));
  });
  if (tab === "overdue" || tab === "awaiting") filtered.sort((a, b) => a.inv.dueDate - b.inv.dueDate);

  const remindable = filtered.filter((r) => r.view.payable);
  const chosen = remindable.filter((r) => selected.has(r.inv.id)).map((r) => r.inv);
  const allChosen = remindable.length > 0 && chosen.length === remindable.length;

  const setTab = (id: TabId) => {
    setSelected(new Set());
    router.replace(id === "all" ? "/agency/invoices" : `/agency/invoices?tab=${id}`, { scroll: false });
  };
  const toggle = (id: string, on: boolean) =>
    setSelected((prev) => {
      const next = new Set(prev);
      if (on) next.add(id);
      else next.delete(id);
      return next;
    });

  return (
    <div>
      <PageHeader
        title="Invoices"
        subtitle={org.crm.provider ? `Synced automatically from ${providerName(org.crm.provider)}. Create and edit invoices there — changes show up here on their own.` : "Invoices come from your CRM. Connect one to send payment requests to brands."}
        actions={<SyncChip />}
      />

      {!org.crm.provider && invoices.length === 0 ? (
        <Card>
          <EmptyState
            icon={<FileText className="h-5 w-5" />}
            title="Connect your CRM to bring in invoices"
            body="AGNCY sends brand-facing payment requests for invoices that already exist in QuickBooks or Xero, and keeps them in sync — no re-keying."
            action={<LinkButton href="/agency/settings?tab=crm">Connect CRM</LinkButton>}
          />
        </Card>
      ) : (
        <Card>
          <div className="flex flex-wrap items-center gap-3 border-b border-line px-4 py-3">
            <Tabs
              value={tab}
              onChange={setTab}
              tabs={[
                { id: "all", label: "All", count: counts.all },
                { id: "to_send", label: "To send", count: counts.to_send },
                { id: "awaiting", label: "Awaiting", count: counts.awaiting },
                { id: "overdue", label: "Overdue", count: counts.overdue },
                { id: "declined", label: "Declined", count: counts.declined },
                { id: "paid", label: "Paid", count: counts.paid },
              ]}
            />
            <div className="relative ml-auto w-full sm:w-64">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink/35" />
              <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search invoices" className="h-9 pl-9" aria-label="Search invoices" />
            </div>
          </div>

          {chosen.length > 0 && (
            <div className="flex items-center justify-between gap-3 border-b border-line bg-ink px-5 py-2.5 text-sm text-white">
              <span>{plural(chosen.length, "invoice")} selected</span>
              <div className="flex gap-2">
                <button onClick={() => setSelected(new Set())} className="rounded-full px-3 py-1 text-white/70 hover:text-white">
                  Clear
                </button>
                <button onClick={() => setRemind(chosen)} className="inline-flex items-center gap-1.5 rounded-full bg-white px-3 py-1 font-medium text-ink">
                  <BellRing className="h-3.5 w-3.5" /> Send reminders
                </button>
              </div>
            </div>
          )}

          {loading ? (
            <SkeletonRows rows={6} />
          ) : filtered.length === 0 ? (
            <EmptyState icon={<FileText className="h-5 w-5" />} title={q ? "No matching invoices" : "Nothing here"} body={q ? "Try a different search." : "Invoices in this state will appear here."} />
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[760px] text-sm">
                <thead>
                  <tr className="border-b border-line text-left text-xs text-muted">
                    <th className="w-10 py-2.5 pl-5">
                      {remindable.length > 0 && (
                        <Checkbox
                          label="Select all open requests"
                          checked={allChosen}
                          indeterminate={chosen.length > 0 && !allChosen}
                          onChange={(on) => setSelected(on ? new Set(remindable.map((r) => r.inv.id)) : new Set())}
                        />
                      )}
                    </th>
                    <th className="py-2.5 pr-3 font-medium">Invoice</th>
                    <th className="py-2.5 pr-3 font-medium">Brand</th>
                    <th className="py-2.5 pr-3 text-right font-medium">Amount</th>
                    <th className="py-2.5 pr-3 font-medium">Due</th>
                    <th className="py-2.5 pr-3 font-medium">Status</th>
                    <th className="py-2.5 pr-5" />
                  </tr>
                </thead>
                <tbody>
                  {filtered.map(({ inv, view }) => (
                    <tr key={inv.id} onClick={() => router.push(`/agency/invoices/${inv.id}`)} className="group cursor-pointer border-b border-line/70 last:border-0 hover:bg-paper/70">
                      <td className="py-3 pl-5" onClick={(e) => e.stopPropagation()}>
                        {view.payable && <Checkbox label={`Select ${inv.number}`} checked={selected.has(inv.id)} onChange={(on) => toggle(inv.id, on)} />}
                      </td>
                      <td className="py-3 pr-3">
                        <Link href={`/agency/invoices/${inv.id}`} onClick={(e) => e.stopPropagation()} className="font-medium text-ink hover:underline">
                          {inv.number}
                        </Link>
                        <p className="max-w-[260px] truncate text-xs text-muted">{inv.description}</p>
                      </td>
                      <td className="py-3 pr-3">
                        <p className="text-ink">{inv.brandName}</p>
                        <p className={cx("text-xs", inv.brandEmail ? "text-muted" : "text-amber-700")}>{inv.brandEmail || "No billing email in CRM"}</p>
                      </td>
                      <td className="tabular py-3 pr-3 text-right font-medium text-ink">{money(inv.amount, inv.currency)}</td>
                      <td className="py-3 pr-3">
                        <p className="text-ink/80">{dateShort(inv.dueDate)}</p>
                        {view.payable && (
                          <p className={cx("text-xs", view.daysOverdue ? "text-rose-600" : "text-muted")}>
                            {view.daysOverdue ? `${view.daysOverdue}d overdue` : `${view.daysOutstanding}d outstanding`}
                          </p>
                        )}
                      </td>
                      <td className="py-3 pr-3">
                        <div className="flex flex-wrap items-center gap-1.5">
                          <InvoicePill invoice={inv} now={now} />
                          {view.changedInCrm && <span className="text-[11px] font-medium text-sky-700">Changed in CRM</span>}
                        </div>
                      </td>
                      <td className="py-3 pr-5 text-right" onClick={(e) => e.stopPropagation()}>
                        {view.state === "not_sent" ? (
                          <Button size="sm" icon={<Send className="h-3.5 w-3.5" />} onClick={() => setSendId(inv.id)}>
                            Send
                          </Button>
                        ) : view.state === "declined" || view.changedInCrm ? (
                          <Button size="sm" variant="secondary" onClick={() => setSendId(inv.id)}>
                            Reissue
                          </Button>
                        ) : view.payable ? (
                          <Button size="sm" variant="ghost" icon={<BellRing className="h-3.5 w-3.5" />} onClick={() => setRemind([inv])}>
                            Remind
                          </Button>
                        ) : null}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Card>
      )}

      <SendRequestDrawer invoice={invoices.find((i) => i.id === sendId) ?? null} onClose={() => setSendId(null)} />
      <ReminderModal
        invoices={remind}
        onClose={() => setRemind(null)}
        onSent={(n) => {
          setSelected(new Set());
          toast(`${plural(n, "reminder")} sent`);
        }}
      />
    </div>
  );
}
