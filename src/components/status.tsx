import { Pill, type Tone } from "./ui";
import { payoutLabel, stageOf, viewInvoice, type AllocationStage, type InvoiceState } from "@/lib/domain";
import type { Allocation, Invoice, Payout } from "@/lib/types";

const INVOICE_TONES: Record<InvoiceState, Tone> = {
  not_sent: "neutral",
  awaiting: "blue",
  overdue: "red",
  declined: "amber",
  paid: "green",
  void: "neutral",
};

export function InvoicePill({ invoice, now }: { invoice: Invoice; now: number }) {
  const view = viewInvoice(invoice, now);
  return (
    <Pill tone={INVOICE_TONES[view.state]} dot>
      {view.label}
    </Pill>
  );
}

export const STAGE_LABEL: Record<AllocationStage, string> = {
  outstanding: "Outstanding",
  ready: "Ready to pay",
  requested: "Payment requested",
  pending: "Pending",
  paid: "Paid",
};

const STAGE_TONES: Record<AllocationStage, Tone> = {
  outstanding: "neutral",
  ready: "blue",
  requested: "violet",
  pending: "amber",
  paid: "green",
};

export function StagePill({ allocation, labels }: { allocation: Pick<Allocation, "status" | "invoicePaid">; labels?: Partial<Record<AllocationStage, string>> }) {
  const stage = stageOf(allocation);
  return (
    <Pill tone={STAGE_TONES[stage]} dot>
      {labels?.[stage] ?? STAGE_LABEL[stage]}
    </Pill>
  );
}

export function PayoutPill({ payout }: { payout: Pick<Payout, "status" | "pendingReason"> }) {
  const tone: Tone = payout.status === "paid" ? "green" : payout.status === "pending_recipient" ? "amber" : "neutral";
  return (
    <Pill tone={tone} dot>
      {payoutLabel(payout)}
    </Pill>
  );
}
