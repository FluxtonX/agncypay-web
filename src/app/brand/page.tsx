"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { ChevronDown, Inbox } from "lucide-react";
import { Avatar, Button, Card, CardHeader, Checkbox, EmptyState, Modal, PageHeader, Row, SkeletonRows, Stat, cx } from "@/components/ui";
import { InvoicePill } from "@/components/status";
import { Checkout } from "@/components/Checkout";
import { DeclineModal } from "@/components/DeclineModal";
import { C, col, useLive, useNow, where } from "@/lib/db";
import { useSession } from "@/lib/session";
import { viewInvoice } from "@/lib/domain";
import { dateLong, dateShort, money, plural } from "@/lib/format";
import type { Invoice } from "@/lib/types";

export default function BrandHome() {
  const { profile } = useSession();
  const email = profile?.email ?? "";
  const router = useRouter();
  const now = useNow();
  const live = useLive<Invoice>(email ? `brand-inv:${email}` : null, () => col(C.invoices, where("brandEmail", "==", email)));
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [open, setOpen] = useState<string | null>(null);
  const [checkout, setCheckout] = useState(false);
  const [declining, setDeclining] = useState<Invoice | null>(null);

  const { payable, declined } = useMemo(() => {
    const sent = live.data.filter((i) => i.status === "sent" || i.status === "viewed").sort((a, b) => a.dueDate - b.dueDate);
    return { payable: sent, declined: live.data.filter((i) => i.status === "declined").sort((a, b) => (b.decline?.at ?? 0) - (a.decline?.at ?? 0)) };
  }, [live.data]);

  const chosen = payable.filter((i) => selected.has(i.id));
  const currency = payable[0]?.currency ?? "USD";
  const overdue = payable.filter((i) => viewInvoice(i, now).daysOverdue > 0);
  const agencies = new Set(payable.map((i) => i.orgId)).size;
  const mixed = chosen.some((i) => i.currency !== chosen[0]?.currency);
  const toggle = (id: string, on: boolean) =>
    setSelected((prev) => {
      const next = new Set(prev);
      if (on) next.add(id);
      else next.delete(id);
      return next;
    });

  if (!profile) return null;

  return (
    <div>
      <PageHeader title="To pay" subtitle="Payment requests from your agencies. Select any combination and pay them in one checkout." />
      <div className="mb-6 grid grid-cols-2 gap-3 lg:grid-cols-3">
        <Stat label="Outstanding" value={money(payable.reduce((s, i) => s + i.amount, 0), currency)} hint={`${plural(payable.length, "invoice")} · ${plural(agencies, "agency", "agencies")}`} />
        <Stat label="Overdue" value={money(overdue.reduce((s, i) => s + i.amount, 0), currency)} hint={plural(overdue.length, "invoice")} tone={overdue.length ? "red" : undefined} />
        <div className="col-span-2 lg:col-span-1">
          <Stat label="Next due" value={payable[0] ? dateShort(payable[0].dueDate) : "—"} hint={payable[0] ? `${payable[0].orgName} · ${payable[0].number}` : "Nothing due"} />
        </div>
      </div>

      <Card>
        <div className="flex items-center gap-3 border-b border-line px-5 py-3">
          {payable.length > 0 && (
            <Checkbox
              label="Select all"
              checked={chosen.length === payable.length}
              indeterminate={chosen.length > 0 && chosen.length < payable.length}
              onChange={(on) => setSelected(on ? new Set(payable.map((i) => i.id)) : new Set())}
            />
          )}
          <p className="text-sm font-medium text-ink">Outstanding</p>
          <span className="text-sm text-muted">{chosen.length ? `${chosen.length} selected` : ""}</span>
        </div>
        {live.loading ? (
          <SkeletonRows />
        ) : payable.length === 0 ? (
          <EmptyState icon={<Inbox className="h-5 w-5" />} title="Nothing to pay" body={`Payment requests sent to ${profile.email} appear here.`} />
        ) : (
          <ul className="divide-y divide-line">
            {payable.map((inv) => {
              const v = viewInvoice(inv, now);
              const expanded = open === inv.id;
              return (
                <li key={inv.id}>
                  <div className="flex items-center gap-3 px-5 py-3.5">
                    <Checkbox label={`Select ${inv.number}`} checked={selected.has(inv.id)} onChange={(on) => toggle(inv.id, on)} />
                    <button className="flex min-w-0 flex-1 items-center gap-3 text-left" onClick={() => setOpen(expanded ? null : inv.id)} aria-expanded={expanded}>
                      <Avatar name={inv.orgName} size={34} />
                      <span className="min-w-0 flex-1">
                        <span className="block truncate text-sm font-medium text-ink">
                          {inv.orgName} · {inv.number}
                        </span>
                        <span className="block truncate text-xs text-muted">{inv.description}</span>
                      </span>
                      <span className="hidden text-right sm:block">
                        <span className={cx("block text-xs", v.daysOverdue ? "text-rose-600" : "text-muted")}>{v.daysOverdue ? `${v.daysOverdue}d overdue` : `Due ${dateShort(inv.dueDate)}`}</span>
                      </span>
                      <span className="tabular w-24 text-right text-sm font-semibold text-ink">{money(inv.amount, inv.currency)}</span>
                      <ChevronDown className={cx("h-4 w-4 text-ink/40 transition-transform", expanded && "rotate-180")} />
                    </button>
                  </div>
                  {expanded && (
                    <div className="border-t border-line/60 bg-paper/40 px-5 py-4 sm:pl-[68px]">
                      {inv.lines.map((l, i) => (
                        <Row key={i} label={l.description}>
                          {money(l.amount, inv.currency)}
                        </Row>
                      ))}
                      <div className="mt-3 flex flex-wrap items-center justify-between gap-3 border-t border-line pt-3">
                        <span className="text-xs text-muted">
                          Issued {dateLong(inv.issueDate)} · due {dateLong(inv.dueDate)}
                        </span>
                        <div className="flex gap-2">
                          <Button size="sm" variant="ghost" onClick={() => setDeclining(inv)}>
                            Decline
                          </Button>
                          <Button
                            size="sm"
                            onClick={() => {
                              setSelected(new Set([inv.id]));
                              setCheckout(true);
                            }}
                          >
                            Pay this invoice
                          </Button>
                        </div>
                      </div>
                    </div>
                  )}
                </li>
              );
            })}
          </ul>
        )}
      </Card>

      {declined.length > 0 && (
        <Card className="mt-6">
          <CardHeader title="Declined" hint="The agency corrects these in their system and sends a new request." />
          <ul className="divide-y divide-line">
            {declined.map((inv) => (
              <li key={inv.id} className="flex items-center gap-3 px-5 py-3.5 text-sm">
                <Avatar name={inv.orgName} size={30} />
                <span className="min-w-0 flex-1">
                  <span className="block truncate font-medium text-ink">
                    {inv.orgName} · {inv.number}
                  </span>
                  <span className="block truncate text-xs text-muted">{inv.decline?.reason || "No reason given"}</span>
                </span>
                <InvoicePill invoice={inv} now={now} />
              </li>
            ))}
          </ul>
        </Card>
      )}

      {chosen.length > 0 && !checkout && (
        <div className="sticky bottom-4 z-20 mx-auto mt-5 flex max-w-xl items-center justify-between gap-4 rounded-full bg-ink py-2 pl-6 pr-2 text-white shadow-2xl">
          <span className="text-sm">
            {plural(chosen.length, "invoice")} · <span className="tabular font-semibold">{mixed ? "mixed currencies" : money(chosen.reduce((s, i) => s + i.amount, 0), chosen[0].currency)}</span>
          </span>
          <Button variant="accent" disabled={mixed} onClick={() => setCheckout(true)}>
            Review & pay
          </Button>
        </div>
      )}

      <Modal open={checkout && chosen.length > 0} onClose={() => setCheckout(false)} variant="drawer" title="Checkout" description="One payment, split to each agency automatically.">
        {checkout && chosen.length > 0 && (
          <Checkout
            invoices={chosen}
            payer={{ name: profile.fullName, email: profile.email, uid: profile.uid }}
            onPaid={(id) => {
              setCheckout(false);
              setSelected(new Set());
              router.push(`/receipt/${id}`);
            }}
          />
        )}
      </Modal>
      <DeclineModal invoice={declining} by={profile.workspaceName || profile.fullName} onClose={() => setDeclining(null)} />
    </div>
  );
}
