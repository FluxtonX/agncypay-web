"use client";

import { Suspense, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { HandCoins, Inbox } from "lucide-react";
import { Avatar, Banner, Button, Card, CardHeader, EmptyState, PageHeader, Splash, Tabs, useAction, useToast } from "@/components/ui";
import { StagePill } from "@/components/status";
import { PayoutDrawer } from "@/components/agency/PayoutDrawer";
import { useAgency } from "@/lib/agency";
import { requestAllocationPayment } from "@/lib/actions";
import { canPayOut, canRequestPayment, stageOf, type AllocationStage } from "@/lib/domain";
import { dateShort, money, plural } from "@/lib/format";
import type { Allocation } from "@/lib/types";

export default function RequestsPage() {
  return (
    <Suspense fallback={<Splash />}>
      <Requests />
    </Suspense>
  );
}

function Requests() {
  const { allocations, owed } = useAgency();
  const router = useRouter();
  const params = useSearchParams();
  const tab = params.get("tab") === "owed" ? "owed" : "incoming";
  const incoming = useMemo(() => allocations.filter((a) => a.status === "requested").sort((a, b) => (b.requestedAt ?? 0) - (a.requestedAt ?? 0)), [allocations]);

  return (
    <div>
      <PageHeader title="Requests" subtitle="Allocation-based payment requests — from the people you pay, and to the agencies that owe you." />
      <Tabs
        className="mb-5"
        value={tab}
        onChange={(id) => router.replace(id === "incoming" ? "/agency/requests" : "/agency/requests?tab=owed", { scroll: false })}
        tabs={[
          { id: "incoming", label: "Incoming", count: incoming.length },
          { id: "owed", label: "Owed to you", count: owed.filter((a) => canRequestPayment(a)).length },
        ]}
      />
      {tab === "incoming" ? <Incoming items={incoming} /> : <Owed items={owed} />}
    </div>
  );
}

function Incoming({ items }: { items: Allocation[] }) {
  const [drawer, setDrawer] = useState<Allocation[] | null>(null);
  const groups = useMemo(() => {
    const m = new Map<string, Allocation[]>();
    for (const a of items) m.set(a.recipientEmail, [...(m.get(a.recipientEmail) ?? []), a]);
    return [...m.values()];
  }, [items]);

  if (items.length === 0) {
    return (
      <Card>
        <EmptyState icon={<Inbox className="h-5 w-5" />} title="No open requests" body="When talent or a partner agency requests a paid-in allocation, it lands here. You can authorise and pay straight from the request." />
      </Card>
    );
  }
  return (
    <div className="space-y-4">
      {groups.map((group) => {
        const first = group[0];
        const payable = group.filter((a) => canPayOut(a));
        return (
          <Card key={first.recipientEmail}>
            <div className="flex flex-wrap items-center gap-3 border-b border-line px-5 py-4">
              <Avatar name={first.recipientName} />
              <div className="min-w-0 flex-1">
                <p className="text-[15px] font-semibold text-ink">{first.recipientName} requested payment</p>
                <p className="text-xs capitalize text-muted">
                  {first.recipientType} · {first.recipientEmail} · {dateShort(first.requestedAt)}
                </p>
              </div>
              <Button variant="accent" disabled={!payable.length} onClick={() => setDrawer(payable)}>
                Review & pay {money(payable.reduce((s, a) => s + a.net, 0), first.currency)}
              </Button>
            </div>
            <ul className="divide-y divide-line/70">
              {group.map((a) => (
                <li key={a.id} className="flex items-center gap-3 px-5 py-3 text-sm">
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-ink">
                      {a.invoiceNumber} · {a.description}
                    </p>
                    <p className="tabular text-xs text-muted">
                      {a.brandName} paid · booking {money(a.gross, a.currency)} gross, {money(a.commission, a.currency)} commission
                      {a.deductions ? `, ${money(a.deductions, a.currency)} deductions` : ""}
                    </p>
                  </div>
                  <span className="tabular font-medium text-ink">{money(a.net, a.currency)}</span>
                </li>
              ))}
            </ul>
          </Card>
        );
      })}
      <PayoutDrawer allocations={drawer} onClose={() => setDrawer(null)} />
    </div>
  );
}

const OWED_LABELS: Partial<Record<AllocationStage, string>> = {
  outstanding: "Brand hasn't paid",
  ready: "Ready to request",
  requested: "Requested",
  pending: "On its way",
};

function Owed({ items }: { items: Allocation[] }) {
  const { profile, accounts } = useAgency();
  const toast = useToast();
  const { busy, run } = useAction();
  const sorted = [...items].sort((a, b) => order(a) - order(b) || b.updatedAt - a.updatedAt);
  const ready = items.filter((a) => canRequestPayment(a));

  if (items.length === 0) {
    return (
      <Card>
        <EmptyState
          icon={<HandCoins className="h-5 w-5" />}
          title="No one owes you yet"
          body="When another agency on AGNCY books your talent and allocates part of an invoice to you, it shows up here — no CRM needed. Request payment once their brand has paid."
        />
      </Card>
    );
  }
  return (
    <>
      {accounts.length === 0 && (
        <Banner tone="warn" title="Add a receiving bank account" className="mb-4">
          Payments other agencies send you wait until you connect one.
        </Banner>
      )}
      <Card>
        <CardHeader title="Owed to you" hint={ready.length ? `${plural(ready.length, "allocation")} ready to request` : "Allocations from other agencies, tracked from booking to payment."} />
        <ul className="divide-y divide-line">
          {sorted.map((a) => (
            <li key={a.id} className="flex flex-wrap items-center gap-3 px-5 py-3.5">
              <Avatar name={a.orgName} size={34} />
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium text-ink">
                  {a.orgName} · {a.description}
                </p>
                <p className="tabular truncate text-xs text-muted">
                  {a.invoiceNumber} · {a.brandName} · {money(a.gross, a.currency)} gross
                  {a.commission ? ` − ${money(a.commission, a.currency)} commission` : ""}
                </p>
              </div>
              <StagePill allocation={a} labels={OWED_LABELS} />
              <span className="tabular w-24 text-right text-sm font-semibold text-ink">{money(a.net, a.currency)}</span>
              {canRequestPayment(a) && (
                <Button
                  size="sm"
                  loading={busy === a.id}
                  onClick={() =>
                    run(a.id, async () => {
                      await requestAllocationPayment(a.id, profile.fullName);
                      toast(`Requested ${money(a.net, a.currency)} from ${a.orgName}`);
                    })
                  }
                >
                  Request payment
                </Button>
              )}
            </li>
          ))}
        </ul>
      </Card>
    </>
  );
}

const ORDER: Record<AllocationStage, number> = { ready: 0, requested: 1, pending: 2, outstanding: 3, paid: 4 };
const order = (a: Allocation) => ORDER[stageOf(a)];
