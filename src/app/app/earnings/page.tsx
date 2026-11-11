"use client";

import { Suspense, useMemo } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Avatar, Button, Splash, Tabs, useAction, useToast } from "@/components/ui";
import { StagePill } from "@/components/status";
import { Section } from "@/components/talent";
import { useTalent } from "@/lib/talent";
import { requestAllocationPayment } from "@/lib/actions";
import { canRequestPayment, stageOf, type AllocationStage } from "@/lib/domain";
import { dateShort, money, plural } from "@/lib/format";
import type { Allocation } from "@/lib/types";

const LABELS: Partial<Record<AllocationStage, string>> = {
  outstanding: "Brand hasn't paid yet",
  ready: "Ready to request",
  requested: "Requested",
  pending: "On its way",
};

export default function EarningsPage() {
  return (
    <Suspense fallback={<Splash />}>
      <Earnings />
    </Suspense>
  );
}

function Earnings() {
  const { allocations, payouts } = useTalent();
  const router = useRouter();
  const tab = useSearchParams().get("tab") === "paid" ? "paid" : "outstanding";
  const open = allocations.filter((a) => stageOf(a) !== "paid");
  const paidPayouts = payouts.filter((p) => p.status === "paid");

  const byAgency = useMemo(() => {
    const m = new Map<string, { name: string; paid: number; open: number; jobs: number }>();
    for (const a of allocations) {
      const cur = m.get(a.orgId) ?? { name: a.orgName, paid: 0, open: 0, jobs: 0 };
      if (a.status === "paid") cur.paid += a.net;
      else cur.open += a.net;
      cur.jobs += 1;
      m.set(a.orgId, cur);
    }
    return [...m.values()].sort((x, y) => y.paid + y.open - (x.paid + x.open));
  }, [allocations]);

  return (
    <div>
      <h1 className="mt-2 text-2xl font-semibold tracking-tight text-ink">Earnings</h1>
      <p className="mt-1 text-sm text-muted">Creative income from every agency, job by job.</p>

      {byAgency.length > 0 && (
        <div className="-mx-5 mt-5 flex gap-3 overflow-x-auto px-5 pb-1">
          {byAgency.map((g) => (
            <div key={g.name} className="w-44 shrink-0 rounded-2xl border border-line bg-white p-4">
              <div className="flex items-center gap-2">
                <Avatar name={g.name} size={26} />
                <p className="truncate text-sm font-medium text-ink">{g.name}</p>
              </div>
              <p className="font-display tabular mt-3 text-lg font-semibold text-ink">{money(g.paid)}</p>
              <p className="text-xs text-muted">
                paid · {money(g.open)} outstanding · {plural(g.jobs, "job")}
              </p>
            </div>
          ))}
        </div>
      )}

      <Tabs
        className="mt-6"
        value={tab}
        onChange={(id) => router.replace(id === "paid" ? "/app/earnings?tab=paid" : "/app/earnings", { scroll: false })}
        tabs={[
          { id: "outstanding", label: "Outstanding", count: open.length },
          { id: "paid", label: "Paid", count: paidPayouts.length },
        ]}
      />

      {tab === "outstanding" ? (
        open.length === 0 ? (
          <p className="mt-6 rounded-2xl border border-dashed border-line px-4 py-10 text-center text-sm text-muted">No outstanding jobs. Bookings your agencies invoice appear here — even before the brand pays.</p>
        ) : (
          <>
            <p className="mt-4 text-xs text-muted">Outstanding → once the brand pays, tap Request Payment → your agency pays you.</p>
            <ul className="mt-3 space-y-3">
              {[...open].sort((a, b) => ORDER[stageOf(a)] - ORDER[stageOf(b)]).map((a) => (
                <Job key={a.id} a={a} />
              ))}
            </ul>
          </>
        )
      ) : paidPayouts.length === 0 ? (
        <p className="mt-6 rounded-2xl border border-dashed border-line px-4 py-10 text-center text-sm text-muted">Payouts you receive appear here.</p>
      ) : (
        <div>
          {paidPayouts.map((p) => (
            <Section key={p.id} title={`${p.orgName} · ${dateShort(p.paidAt)}`} action={<span className="tabular text-sm font-semibold text-emerald-700">+{money(p.amount, p.currency)}</span>}>
              <ul className="divide-y divide-line rounded-2xl border border-line bg-white">
                {p.lines.map((l) => (
                  <li key={l.allocationId} className="px-4 py-3">
                    <div className="flex items-start justify-between gap-3">
                      <span className="min-w-0">
                        <span className="block text-sm font-medium text-ink">{l.brandName}</span>
                        <span className="block text-xs text-muted">
                          {l.description} · {l.invoiceNumber}
                        </span>
                      </span>
                      <span className="tabular text-sm font-semibold text-ink">{money(l.net, p.currency)}</span>
                    </div>
                    <Breakdown gross={l.gross} commission={l.commission} deductions={l.deductions} currency={p.currency} />
                  </li>
                ))}
              </ul>
            </Section>
          ))}
        </div>
      )}
    </div>
  );
}

const ORDER: Record<AllocationStage, number> = { ready: 0, requested: 1, pending: 2, outstanding: 3, paid: 4 };

function Job({ a }: { a: Allocation }) {
  const { profile } = useTalent();
  const toast = useToast();
  const { busy, run } = useAction();
  return (
    <li className="rounded-2xl border border-line bg-white p-4">
      <div className="flex items-start justify-between gap-3">
        <span className="min-w-0">
          <span className="block text-sm font-semibold text-ink">{a.brandName}</span>
          <span className="block text-xs text-muted">
            {a.description} · via {a.orgName}
          </span>
        </span>
        <span className="font-display tabular text-lg font-semibold text-ink">{money(a.net, a.currency)}</span>
      </div>
      <Breakdown gross={a.gross} commission={a.commission} deductions={a.deductions} currency={a.currency} />
      <div className="mt-3 flex items-center justify-between gap-3 border-t border-line pt-3">
        <StagePill allocation={a} labels={LABELS} />
        {canRequestPayment(a) && (
          <Button
            size="sm"
            variant="accent"
            loading={busy === a.id}
            onClick={() =>
              run(a.id, async () => {
                await requestAllocationPayment(a.id, profile.fullName);
                toast(`Asked ${a.orgName} to pay ${money(a.net, a.currency)}`);
              })
            }
          >
            Request Payment
          </Button>
        )}
      </div>
    </li>
  );
}

function Breakdown({ gross, commission, deductions, currency }: { gross: number; commission: number; deductions: number; currency: string }) {
  return (
    <dl className="tabular mt-3 grid grid-cols-3 gap-2 rounded-xl bg-paper px-3 py-2 text-xs">
      <div>
        <dt className="text-muted">Gross</dt>
        <dd className="font-medium text-ink">{money(gross, currency)}</dd>
      </div>
      <div>
        <dt className="text-muted">Commission</dt>
        <dd className="font-medium text-ink">{commission ? `−${money(commission, currency)}` : "—"}</dd>
      </div>
      <div>
        <dt className="text-muted">Deductions</dt>
        <dd className="font-medium text-ink">{deductions ? `−${money(deductions, currency)}` : "—"}</dd>
      </div>
    </dl>
  );
}
