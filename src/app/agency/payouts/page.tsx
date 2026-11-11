"use client";

import { Suspense, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { ChevronDown, Hourglass, Send, Undo2, XCircle } from "lucide-react";
import { Avatar, Banner, Button, Card, Checkbox, EmptyState, PageHeader, Pill, SkeletonRows, Splash, Tabs, cx, useToast } from "@/components/ui";
import { PayoutPill, StagePill } from "@/components/status";
import { Confirm } from "@/components/Confirm";
import { PayoutDrawer } from "@/components/agency/PayoutDrawer";
import { useAgency } from "@/lib/agency";
import { cancelPayout, reversePayout } from "@/lib/actions";
import { canPayOut, stageOf } from "@/lib/domain";
import { dateShort, dateTime, money, plural } from "@/lib/format";
import type { Allocation, Payout } from "@/lib/types";

type TabId = "ready" | "waiting" | "history";

export default function PayoutsPage() {
  return (
    <Suspense fallback={<Splash />}>
      <Payouts />
    </Suspense>
  );
}

function Payouts() {
  const { allocations, payouts, org, loading } = useAgency();
  const router = useRouter();
  const params = useSearchParams();
  const raw = params.get("tab");
  const tab: TabId = raw === "waiting" || raw === "history" ? raw : "ready";

  const ready = useMemo(() => allocations.filter((a) => canPayOut(a)), [allocations]);
  const awaitingBrand = useMemo(() => allocations.filter((a) => stageOf(a) === "outstanding"), [allocations]);
  const waiting = payouts.filter((p) => p.status === "pending_recipient");
  const history = payouts.filter((p) => p.status !== "pending_recipient");

  return (
    <div>
      <PageHeader
        title="Payouts"
        subtitle="Pay talent and partner agencies from your CRM allocations. Review, pick a funding account and send — many recipients at once."
      />
      {org.verification.status !== "verified" && (
        <Banner tone="warn" title="Verify your business to send payouts" className="mb-5" action={<Link href="/agency/settings?tab=business" className="text-sm font-medium underline underline-offset-4">Verify</Link>}>
          We use the details from your CRM — it takes a moment.
        </Banner>
      )}
      <Tabs
        className="mb-5"
        value={tab}
        onChange={(id) => router.replace(id === "ready" ? "/agency/payouts" : `/agency/payouts?tab=${id}`, { scroll: false })}
        tabs={[
          { id: "ready", label: "Ready to pay", count: ready.length },
          { id: "waiting", label: "Waiting on recipient", count: waiting.length },
          { id: "history", label: "History" },
        ]}
      />
      {loading ? (
        <Card>
          <SkeletonRows rows={5} />
        </Card>
      ) : tab === "ready" ? (
        <Ready ready={ready} awaitingBrand={awaitingBrand} />
      ) : tab === "waiting" ? (
        <PayoutList payouts={waiting} empty="No payouts are waiting. Payouts sent with Send & Invite appear here until the recipient joins." />
      ) : (
        <PayoutList payouts={history} empty="Payouts you send will appear here." />
      )}
    </div>
  );
}

function Ready({ ready, awaitingBrand }: { ready: Allocation[]; awaitingBrand: Allocation[] }) {
  const [by, setBy] = useState<"recipient" | "invoice">("recipient");
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [drawer, setDrawer] = useState<Allocation[] | null>(null);

  const groups = useMemo(() => {
    const m = new Map<string, { key: string; title: string; sub: string; items: Allocation[] }>();
    for (const a of ready) {
      const key = by === "recipient" ? a.recipientEmail : a.invoiceId;
      const g = m.get(key) ?? {
        key,
        title: by === "recipient" ? a.recipientName : `${a.invoiceNumber} · ${a.brandName}`,
        sub: by === "recipient" ? `${a.recipientEmail} · ${a.recipientType}` : a.description,
        items: [],
      };
      g.items.push(a);
      m.set(key, g);
    }
    return [...m.values()].sort((x, y) => x.title.localeCompare(y.title));
  }, [ready, by]);

  // Selections can outlive allocations that were paid elsewhere; only count live ones.
  const chosen = ready.filter((a) => selected.has(a.id));
  const allOn = ready.length > 0 && chosen.length === ready.length;
  const set = (ids: string[], on: boolean) =>
    setSelected((prev) => {
      const next = new Set(prev);
      ids.forEach((id) => (on ? next.add(id) : next.delete(id)));
      return next;
    });
  const currency = chosen[0]?.currency ?? "USD";

  if (ready.length === 0) {
    return (
      <Card>
        <EmptyState
          icon={<Send className="h-5 w-5" />}
          title="Nothing to pay out yet"
          body={awaitingBrand.length ? `${plural(awaitingBrand.length, "allocation")} will be ready once brands pay their invoices.` : "Allocations from your CRM become payable once the brand has paid the invoice."}
        />
      </Card>
    );
  }

  return (
    <>
      <Card>
        <div className="flex flex-wrap items-center gap-3 border-b border-line px-5 py-3">
          <Checkbox label="Select everything" checked={allOn} indeterminate={chosen.length > 0 && !allOn} onChange={(on) => set(ready.map((a) => a.id), on)} />
          <span className="text-sm text-muted">{chosen.length ? `${plural(chosen.length, "allocation")} selected` : `${plural(ready.length, "allocation")} ready`}</span>
          <div className="ml-auto flex rounded-full border border-line bg-paper p-0.5 text-[13px]">
            {(["recipient", "invoice"] as const).map((v) => (
              <button key={v} onClick={() => setBy(v)} className={cx("rounded-full px-3 py-1 font-medium transition-colors", by === v ? "bg-white text-ink shadow-sm" : "text-ink/55 hover:text-ink")}>
                By {v}
              </button>
            ))}
          </div>
        </div>
        <ul className="divide-y divide-line">
          {groups.map((g) => {
            const ids = g.items.map((a) => a.id);
            const on = ids.filter((id) => selected.has(id)).length;
            return (
              <li key={g.key}>
                <div className="flex items-center gap-3 bg-paper/50 px-5 py-3">
                  <Checkbox label={`Select ${g.title}`} checked={on === ids.length} indeterminate={on > 0 && on < ids.length} onChange={(v) => set(ids, v)} />
                  {by === "recipient" && <Avatar name={g.title} size={30} />}
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold text-ink">{g.title}</p>
                    <p className="truncate text-xs capitalize text-muted">{g.sub}</p>
                  </div>
                  <p className="tabular text-sm font-semibold text-ink">{money(g.items.reduce((s, a) => s + a.net, 0), g.items[0].currency)}</p>
                </div>
                <ul>
                  {g.items.map((a) => (
                    <li key={a.id} className="flex items-center gap-3 border-t border-line/60 py-2.5 pl-[52px] pr-5 text-sm">
                      <Checkbox label={`Select ${a.description}`} checked={selected.has(a.id)} onChange={(v) => set([a.id], v)} />
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-ink">{by === "recipient" ? `${a.invoiceNumber} · ${a.description}` : `${a.recipientName} · ${a.description}`}</p>
                        <p className="tabular text-xs text-muted">
                          {a.brandName} · {money(a.gross, a.currency)} gross
                          {a.commission ? ` − ${money(a.commission, a.currency)} commission` : ""}
                          {a.deductions ? ` − ${money(a.deductions, a.currency)} deductions` : ""}
                        </p>
                      </div>
                      {a.status === "requested" && <StagePill allocation={a} labels={{ requested: "Requested" }} />}
                      <span className="tabular w-24 text-right font-medium text-ink">{money(a.net, a.currency)}</span>
                    </li>
                  ))}
                </ul>
              </li>
            );
          })}
        </ul>
      </Card>

      {awaitingBrand.length > 0 && <p className="mt-4 text-center text-xs text-muted">{plural(awaitingBrand.length, "more allocation")} will be ready once brands pay.</p>}

      {chosen.length > 0 && (
        <div className="sticky bottom-4 z-20 mx-auto mt-5 flex max-w-xl items-center justify-between gap-4 rounded-full bg-ink py-2 pl-6 pr-2 text-white shadow-2xl">
          <span className="text-sm">
            {plural(new Set(chosen.map((a) => a.recipientEmail)).size, "recipient")} ·{" "}
            <span className="tabular font-semibold">{money(chosen.reduce((s, a) => s + a.net, 0), currency)}</span>
          </span>
          <Button variant="accent" onClick={() => setDrawer(chosen)}>
            Review payouts
          </Button>
        </div>
      )}
      <PayoutDrawer
        allocations={drawer}
        onClose={() => {
          setDrawer(null);
          setSelected(new Set());
        }}
      />
    </>
  );
}

function PayoutList({ payouts, empty }: { payouts: Payout[]; empty: string }) {
  const { actor } = useAgency();
  const toast = useToast();
  const [open, setOpen] = useState<string | null>(null);
  const [confirm, setConfirm] = useState<{ payout: Payout; kind: "cancel" | "reverse" } | null>(null);

  if (payouts.length === 0) {
    return (
      <Card>
        <EmptyState icon={<Hourglass className="h-5 w-5" />} title="Nothing here" body={empty} />
      </Card>
    );
  }

  return (
    <Card>
      <ul className="divide-y divide-line">
        {payouts.map((p) => {
          const expanded = open === p.id;
          return (
            <li key={p.id}>
              <button onClick={() => setOpen(expanded ? null : p.id)} className="flex w-full items-center gap-3 px-5 py-3.5 text-left hover:bg-paper/60" aria-expanded={expanded}>
                <Avatar name={p.recipientName} size={34} />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-ink">{p.recipientName}</p>
                  <p className="truncate text-xs text-muted">
                    {plural(p.lines.length, "job")} · {p.fundingLabel} · {dateShort(p.paidAt ?? p.createdAt)}
                  </p>
                </div>
                <PayoutPill payout={p} />
                <span className="tabular w-24 text-right text-sm font-semibold text-ink">{money(p.amount, p.currency)}</span>
                <ChevronDown className={cx("h-4 w-4 text-ink/40 transition-transform", expanded && "rotate-180")} />
              </button>
              {expanded && (
                <div className="border-t border-line/60 bg-paper/40 px-5 py-4">
                  <ul className="space-y-1.5">
                    {p.lines.map((l) => (
                      <li key={l.allocationId} className="flex justify-between gap-3 text-sm">
                        <span className="text-ink/80">
                          {l.invoiceNumber} · {l.brandName} · {l.description}
                        </span>
                        <span className="tabular text-ink">{money(l.net, p.currency)}</span>
                      </li>
                    ))}
                  </ul>
                  <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-line pt-3 text-xs text-muted">
                    <span>
                      Authorised by {p.createdByName} · {dateTime(p.createdAt)}
                      {p.recipientEmail && ` · ${p.recipientEmail}`}
                    </span>
                    <div className="flex gap-2">
                      {p.status === "pending_recipient" && (
                        <Button size="sm" variant="danger" icon={<XCircle className="h-3.5 w-3.5" />} onClick={() => setConfirm({ payout: p, kind: "cancel" })}>
                          Cancel payout
                        </Button>
                      )}
                      {p.status === "paid" && p.recipientUid && (
                        <Button size="sm" variant="secondary" icon={<Undo2 className="h-3.5 w-3.5" />} onClick={() => setConfirm({ payout: p, kind: "reverse" })}>
                          Reverse
                        </Button>
                      )}
                      {p.status === "paid" && !p.recipientUid && <Pill>Settled to external bank · can&apos;t be reversed</Pill>}
                    </div>
                  </div>
                </div>
              )}
            </li>
          );
        })}
      </ul>
      <Confirm
        open={!!confirm}
        danger
        title={confirm?.kind === "cancel" ? "Cancel this payout?" : "Reverse this payout?"}
        confirmLabel={confirm?.kind === "cancel" ? "Cancel payout" : "Reverse payout"}
        body={
          confirm?.kind === "cancel"
            ? `${confirm.payout.recipientName} won't receive ${money(confirm.payout.amount, confirm.payout.currency)} and the invitation link stops working. The allocations go back to Ready to pay.`
            : confirm
              ? `${money(confirm.payout.amount, confirm.payout.currency)} is pulled back from ${confirm.payout.recipientName}'s AGNCY balance and they're notified. This only works while the money is still in their balance.`
              : null
        }
        onConfirm={async () => {
          if (!confirm) return;
          if (confirm.kind === "cancel") await cancelPayout(confirm.payout.id, actor);
          else await reversePayout(confirm.payout.id, actor);
          toast(confirm.kind === "cancel" ? "Payout cancelled" : "Payout reversed");
        }}
        onClose={() => setConfirm(null)}
      />
    </Card>
  );
}
