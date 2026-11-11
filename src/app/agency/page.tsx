"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { AlertTriangle, ArrowRight, BellRing, Check, CircleDollarSign, FileText, HandCoins, Hourglass, Inbox, PenLine, Send, Sparkles } from "lucide-react";
import { Banner, Card, CardHeader, EmptyState, LinkButton, Stat, cx } from "@/components/ui";
import { useNotices } from "@/components/Notifications";
import { PayoutDrawer } from "@/components/agency/PayoutDrawer";
import { SendRequestDrawer } from "@/components/agency/SendRequestDrawer";
import { ReminderModal } from "@/components/agency/ReminderModal";
import { SyncChip } from "@/components/agency/SyncChip";
import { useAgency } from "@/lib/agency";
import { attentionOf } from "@/lib/attention";
import { providerName } from "@/lib/actions";
import { useNow } from "@/lib/db";
import { DAY, viewInvoice } from "@/lib/domain";
import { money, plural, relTime } from "@/lib/format";
import type { Allocation, Invoice } from "@/lib/types";

function greeting(now: number) {
  const h = new Date(now).getHours();
  return h < 12 ? "Good morning" : h < 18 ? "Good afternoon" : "Good evening";
}

export default function AgencyOverview() {
  const data = useAgency();
  const { profile, org, invoices, allocations, payouts, accounts, isOwner, loading } = data;
  const now = useNow();
  const a = useMemo(() => attentionOf({ ...data, now }), [data, now]);
  const { notices } = useNotices(useMemo(() => [org.id, ...org.emails], [org.id, org.emails]));

  const [payFor, setPayFor] = useState<Allocation[] | null>(null);
  const [sendId, setSendId] = useState<string | null>(null);
  const [remind, setRemind] = useState<Invoice[] | null>(null);

  const awaitingTotal = a.awaiting.reduce((s, i) => s + i.amount, 0);
  const overdueTotal = a.overdue.reduce((s, i) => s + i.amount, 0);
  const readyTotal = a.ready.reduce((s, x) => s + x.net, 0);
  const received30 = invoices.filter((i) => i.status === "paid" && (i.paidAt ?? 0) > now - 30 * DAY).reduce((s, i) => s + i.amount, 0);
  const currency = invoices[0]?.currency ?? "USD";

  const steps = [
    { done: org.verification.status === "verified", label: "Verify your business", hint: "Confirm the details we prefilled", href: "/agency/settings?tab=business" },
    { done: accounts.length > 0, label: "Connect a bank account", hint: "Receive brand payments and fund payouts", href: "/agency/settings?tab=banks" },
    { done: !!org.crm.provider, label: "Connect your CRM", hint: "Optional — needed to send requests and pay out", href: "/agency/settings?tab=crm" },
    ...(isOwner ? [{ done: org.memberUids.length > 1, label: "Invite your team", hint: "Optional — everyone gets full access", href: "/agency/settings?tab=team" }] : []),
  ];
  const doneCount = steps.filter((s) => s.done).length;

  // Incoming allocation-based payment requests, grouped by who asked.
  const requestGroups = useMemo(() => {
    const m = new Map<string, Allocation[]>();
    for (const x of a.requested) m.set(x.recipientEmail, [...(m.get(x.recipientEmail) ?? []), x]);
    return [...m.values()];
  }, [a.requested]);

  type Item = { key: string; icon: React.ReactNode; tone: string; title: React.ReactNode; body?: React.ReactNode; action: React.ReactNode; sort: number };
  const items: Item[] = [];
  for (const group of requestGroups) {
    const first = group[0];
    items.push({
      key: `req-${first.recipientEmail}`,
      icon: <HandCoins className="h-4 w-4" />,
      tone: "bg-violet-50 text-violet-700",
      title: `${first.recipientName} requested payment`,
      body: `${group.map((g) => `${g.invoiceNumber} · ${g.description}`).join(", ")} — ${money(group.reduce((s, g) => s + g.net, 0), first.currency)}`,
      action: <ActionButton onClick={() => setPayFor(group)}>Review & pay</ActionButton>,
      sort: 0,
    });
  }
  for (const inv of a.declined) {
    items.push({
      key: `dec-${inv.id}`,
      icon: <AlertTriangle className="h-4 w-4" />,
      tone: "bg-amber-50 text-amber-700",
      title: `${inv.brandName} declined ${inv.number}`,
      body: inv.decline?.reason || "No reason given",
      action: <ActionLink href={`/agency/invoices/${inv.id}`}>Review</ActionLink>,
      sort: 1,
    });
  }
  for (const inv of a.changed) {
    items.push({
      key: `chg-${inv.id}`,
      icon: <PenLine className="h-4 w-4" />,
      tone: "bg-sky-50 text-sky-700",
      title: `${inv.number} changed in ${providerName(org.crm.provider)}`,
      body: `${inv.brandName} still sees the previous version`,
      action: <ActionButton onClick={() => setSendId(inv.id)}>Reissue</ActionButton>,
      sort: 2,
    });
  }
  for (const inv of a.overdue) {
    const v = viewInvoice(inv, now);
    items.push({
      key: `ovd-${inv.id}`,
      icon: <BellRing className="h-4 w-4" />,
      tone: "bg-rose-50 text-rose-700",
      title: `${inv.number} is ${plural(v.daysOverdue, "day")} overdue`,
      body: `${inv.brandName} · ${money(inv.amount, inv.currency)}${inv.reminders?.length ? ` · last reminded ${relTime(Math.max(...inv.reminders), now)}` : ""}`,
      action: <ActionButton onClick={() => setRemind([inv])}>Remind</ActionButton>,
      sort: 3,
    });
  }
  if (a.toSend.length) {
    items.push({
      key: "to-send",
      icon: <FileText className="h-4 w-4" />,
      tone: "bg-ink/5 text-ink/70",
      title: `${plural(a.toSend.length, "invoice")} from your CRM ready to send`,
      body: a.toSend
        .slice(0, 3)
        .map((i) => `${i.number} · ${i.brandName}`)
        .join(", ") + (a.toSend.length > 3 ? "…" : ""),
      action: a.toSend.length === 1 ? <ActionButton onClick={() => setSendId(a.toSend[0].id)}>Review & send</ActionButton> : <ActionLink href="/agency/invoices?tab=to_send">Review</ActionLink>,
      sort: 4,
    });
  }
  const unrequestedReady = a.ready.filter((x) => x.status !== "requested");
  if (unrequestedReady.length) {
    const people = new Set(unrequestedReady.map((x) => x.recipientEmail)).size;
    items.push({
      key: "ready",
      icon: <Send className="h-4 w-4" />,
      tone: "bg-emerald-50 text-emerald-700",
      title: `${money(unrequestedReady.reduce((s, x) => s + x.net, 0), unrequestedReady[0].currency)} ready to pay out`,
      body: `${plural(unrequestedReady.length, "allocation")} to ${plural(people, "recipient")} — brands have paid`,
      action: <ActionLink href="/agency/payouts">Pay out</ActionLink>,
      sort: 5,
    });
  }
  for (const x of a.owedReady) {
    items.push({
      key: `owed-${x.id}`,
      icon: <CircleDollarSign className="h-4 w-4" />,
      tone: "bg-emerald-50 text-emerald-700",
      title: `${x.orgName} owes you ${money(x.net, x.currency)}`,
      body: `${x.invoiceNumber} · ${x.brandName} has paid — you can request it`,
      action: <ActionLink href="/agency/requests?tab=owed">Request</ActionLink>,
      sort: 6,
    });
  }
  if (a.waiting.length) {
    items.push({
      key: "waiting",
      icon: <Hourglass className="h-4 w-4" />,
      tone: "bg-amber-50 text-amber-700",
      title: `${plural(a.waiting.length, "payout")} waiting on recipients`,
      body: "Released automatically once they join or add a bank account",
      action: <ActionLink href="/agency/payouts?tab=waiting">View</ActionLink>,
      sort: 7,
    });
  }
  items.sort((x, y) => x.sort - y.sort);

  const sendInvoice = invoices.find((i) => i.id === sendId) ?? null;

  return (
    <div>
      <div className="mb-7 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-[28px] font-semibold tracking-tight text-ink sm:text-[32px]">
            {greeting(now)}, {profile.fullName.split(" ")[0]}
          </h1>
          <p className="mt-1.5 text-sm text-muted">{items.length ? `${plural(items.length, "thing")} need${items.length === 1 ? "s" : ""} your attention.` : "Nothing needs you right now."}</p>
        </div>
        <SyncChip />
      </div>

      {org.crm.lastSyncError && (
        <Banner tone="warn" title={`${providerName(org.crm.provider)} sync is failing`} className="mb-6" action={<LinkButton href="/agency/settings?tab=crm" variant="secondary" size="sm">Check connection</LinkButton>}>
          {org.crm.lastSyncError}
        </Banner>
      )}

      {doneCount < steps.length && (
        <Card className="mb-6 overflow-hidden">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-line px-5 py-4">
            <div>
              <h2 className="text-[15px] font-semibold text-ink">Finish setting up {org.name}</h2>
              <p className="mt-0.5 text-[13px] text-muted">
                {doneCount} of {steps.length} done · you can receive payments as soon as a bank account is connected.
              </p>
            </div>
            <div className="h-1.5 w-40 overflow-hidden rounded-full bg-ink/10">
              <motion.div className="h-full rounded-full bg-emerald-500" initial={{ width: 0 }} animate={{ width: `${(doneCount / steps.length) * 100}%` }} />
            </div>
          </div>
          <div className="grid divide-y divide-line sm:grid-cols-2 sm:divide-y-0 lg:grid-cols-4 lg:divide-x">
            {steps.map((s) => (
              <Link key={s.label} href={s.href} className={cx("group flex gap-3 px-5 py-4 transition-colors hover:bg-paper", s.done && "pointer-events-none")}>
                <span className={cx("mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border", s.done ? "border-emerald-500 bg-emerald-500 text-white" : "border-ink/25")}>
                  {s.done && <Check className="h-3 w-3" strokeWidth={3} />}
                </span>
                <span>
                  <span className={cx("block text-sm font-medium", s.done ? "text-ink/40 line-through" : "text-ink")}>{s.label}</span>
                  <span className="block text-xs text-muted">{s.hint}</span>
                </span>
              </Link>
            ))}
          </div>
        </Card>
      )}

      <div className="mb-6 grid grid-cols-2 gap-3 lg:grid-cols-4">
        <Stat label="Awaiting payment" value={money(awaitingTotal, currency)} hint={plural(a.awaiting.length, "open request")} />
        <Stat label="Overdue" value={money(overdueTotal, currency)} hint={plural(a.overdue.length, "invoice")} tone={overdueTotal ? "red" : undefined} />
        <Stat label="Ready to pay out" value={money(readyTotal, currency)} hint={plural(a.payoutBadge, "recipient")} />
        <Stat label="Received · 30 days" value={money(received30, currency)} hint="Settled to your bank" tone={received30 ? "green" : undefined} />
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_340px]">
        <Card>
          <CardHeader title="Needs attention" hint="Declines, overdue invoices, payment requests and payouts you can act on." />
          {loading ? (
            <div className="space-y-3 p-5">
              {[0, 1, 2].map((i) => (
                <div key={i} className="skeleton h-14" />
              ))}
            </div>
          ) : items.length === 0 ? (
            <EmptyState
              icon={<Sparkles className="h-5 w-5" />}
              title="You're all caught up"
              body={org.crm.provider ? "New CRM invoices, declines and payment requests will show up here automatically." : "Connect your CRM to bring in invoices and allocations automatically."}
              action={!org.crm.provider ? <LinkButton href="/agency/settings?tab=crm">Connect CRM</LinkButton> : undefined}
            />
          ) : (
            <ul className="divide-y divide-line">
              {items.map((item, i) => (
                <motion.li key={item.key} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: Math.min(i * 0.03, 0.3) }} className="flex items-center gap-4 px-5 py-4">
                  <span className={cx("flex h-9 w-9 shrink-0 items-center justify-center rounded-full", item.tone)}>{item.icon}</span>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-ink">{item.title}</p>
                    {item.body && <p className="mt-0.5 truncate text-[13px] text-muted">{item.body}</p>}
                  </div>
                  {item.action}
                </motion.li>
              ))}
            </ul>
          )}
        </Card>

        <div className="space-y-6">
          <Card>
            <CardHeader title="Notifications" />
            {notices.length === 0 ? (
              <p className="px-5 py-8 text-center text-sm text-muted">No notifications yet.</p>
            ) : (
              <ul className="divide-y divide-line">
                {notices.slice(0, 6).map((n) => (
                  <li key={n.id}>
                    <Link href={n.href || "#"} className="flex gap-3 px-5 py-3 hover:bg-paper">
                      <span className={cx("mt-1.5 h-2 w-2 shrink-0 rounded-full", n.read ? "bg-ink/15" : "bg-emerald-500")} />
                      <span className="min-w-0">
                        <span className="block truncate text-sm font-medium text-ink">{n.title}</span>
                        <span className="block text-xs text-muted">{relTime(n.at, now)}</span>
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </Card>

          <Card className="p-5">
            <div className="flex items-center gap-3">
              <span className="flex h-9 w-9 items-center justify-center rounded-full bg-ink text-white">
                <Inbox className="h-4 w-4" />
              </span>
              <div>
                <p className="text-sm font-semibold text-ink">This month</p>
                <p className="text-xs text-muted">Payouts sent from AGNCY</p>
              </div>
            </div>
            <p className="font-display tabular mt-4 text-2xl font-semibold text-ink">
              {money(
                payouts.filter((p) => p.status === "paid" && new Date(p.paidAt ?? 0).getMonth() === new Date(now).getMonth() && (p.paidAt ?? 0) > now - 32 * DAY).reduce((s, p) => s + p.amount, 0),
                currency
              )}
            </p>
            <p className="mt-1 text-xs text-muted">
              {plural(new Set(allocations.filter((x) => x.status === "paid").map((x) => x.recipientEmail)).size, "recipient")} paid to date
            </p>
          </Card>
        </div>
      </div>

      <PayoutDrawer allocations={payFor} onClose={() => setPayFor(null)} />
      <SendRequestDrawer invoice={sendInvoice} onClose={() => setSendId(null)} />
      <ReminderModal invoices={remind} onClose={() => setRemind(null)} />
    </div>
  );
}

function ActionButton({ onClick, children }: { onClick: () => void; children: React.ReactNode }) {
  return (
    <button onClick={onClick} className="inline-flex h-8 shrink-0 items-center gap-1 rounded-full bg-ink px-3.5 text-[13px] font-medium text-white hover:bg-black/80">
      {children}
    </button>
  );
}

function ActionLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <Link href={href} className="inline-flex h-8 shrink-0 items-center gap-1 rounded-full border border-line bg-white px-3.5 text-[13px] font-medium text-ink hover:border-ink/30">
      {children}
      <ArrowRight className="h-3.5 w-3.5" />
    </Link>
  );
}
