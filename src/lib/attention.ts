import { canPayOut, canRequestPayment, viewInvoice } from "./domain";
import type { Allocation, Invoice, Payout } from "./types";

/** Everything on the agency's plate, derived from live data. Shared by the overview and the nav badges. */
export function attentionOf(input: { invoices: Invoice[]; allocations: Allocation[]; payouts: Payout[]; owed: Allocation[]; now: number }) {
  const views = input.invoices.map((inv) => ({ inv, view: viewInvoice(inv, input.now) }));
  const declined = views.filter((x) => x.view.state === "declined").map((x) => x.inv);
  const changed = views.filter((x) => x.view.changedInCrm && x.view.state !== "declined").map((x) => x.inv);
  const overdue = views.filter((x) => x.view.state === "overdue").map((x) => x.inv);
  const toSend = views.filter((x) => x.view.state === "not_sent").map((x) => x.inv);
  const awaiting = views.filter((x) => x.view.state === "awaiting" || x.view.state === "overdue").map((x) => x.inv);
  const requested = input.allocations.filter((a) => a.status === "requested" && canPayOut(a));
  const ready = input.allocations.filter((a) => canPayOut(a));
  const waiting = input.payouts.filter((p) => p.status === "pending_recipient");
  const owedReady = input.owed.filter((a) => canRequestPayment(a));
  return {
    declined,
    changed,
    overdue,
    toSend,
    awaiting,
    requested,
    ready,
    waiting,
    owedReady,
    invoiceBadge: declined.length + changed.length + overdue.length,
    payoutBadge: new Set(ready.map((a) => a.recipientEmail)).size,
    requestBadge: requested.length + owedReady.length,
  };
}
