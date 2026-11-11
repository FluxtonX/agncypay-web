/**
 * Pure Phase 1 business rules. No Firebase, no React — everything here is
 * unit-tested in tests/domain.test.ts.
 */
import type { Allocation, Invoice, Payout, PayoutLine, RecipientType, WalletTx } from "./types";

export const DAY = 86_400_000;

/* ------------------------------------------------------------- utilities */

function stable(value: unknown): string {
  if (value === null || typeof value !== "object") return JSON.stringify(value) ?? "null";
  if (Array.isArray(value)) return `[${value.map(stable).join(",")}]`;
  const obj = value as Record<string, unknown>;
  return `{${Object.keys(obj)
    .sort()
    .filter((k) => obj[k] !== undefined)
    .map((k) => `${JSON.stringify(k)}:${stable(obj[k])}`)
    .join(",")}}`;
}

/** Order-independent content fingerprint (not cryptographic). */
export function hashOf(value: unknown): string {
  const text = stable(value);
  let a = 0x811c9dc5;
  let b = 5381;
  for (let i = 0; i < text.length; i++) {
    const c = text.charCodeAt(i);
    a = Math.imul(a ^ c, 0x01000193);
    b = (Math.imul(b, 33) + c) | 0;
  }
  return (a >>> 0).toString(16).padStart(8, "0") + (b >>> 0).toString(16).padStart(8, "0");
}

export function normEmail(email: string | null | undefined): string {
  return (email || "").trim().toLowerCase();
}

/** Firestore document ids cannot contain slashes; CRM ids occasionally do. */
export function safeId(value: string): string {
  return value.replace(/[^A-Za-z0-9_-]/g, "-").slice(0, 120);
}

function startOfDay(ms: number): number {
  const d = new Date(ms);
  d.setHours(0, 0, 0, 0);
  return d.getTime();
}

/* --------------------------------------------------------------- invoices */

export type InvoiceState = "not_sent" | "awaiting" | "overdue" | "declined" | "paid" | "void";

export interface InvoiceView {
  state: InvoiceState;
  label: string;
  /** The brand can pay it right now. */
  payable: boolean;
  /** The CRM record changed after the request was last sent. */
  changedInCrm: boolean;
  daysOutstanding: number;
  daysOverdue: number;
  daysUntilDue: number;
}

export function viewInvoice(inv: Invoice, now: number): InvoiceView {
  const today = startOfDay(now);
  const due = startOfDay(inv.dueDate);
  const live = inv.status === "sent" || inv.status === "viewed";
  const daysUntilDue = Math.round((due - today) / DAY);
  const overdue = live && daysUntilDue < 0;
  const since = inv.sentAt ?? inv.issueDate;
  const open = inv.status !== "paid" && inv.status !== "void";

  let state: InvoiceState;
  let label: string;
  if (inv.status === "paid") {
    state = "paid";
    label = inv.paidVia === "crm" ? "Paid · recorded in CRM" : "Paid";
  } else if (inv.status === "void") {
    state = "void";
    label = "Void";
  } else if (inv.status === "declined") {
    state = "declined";
    label = "Declined";
  } else if (inv.status === "not_sent") {
    state = "not_sent";
    label = "Not sent";
  } else if (overdue) {
    state = "overdue";
    label = `Overdue ${-daysUntilDue}d`;
  } else {
    state = "awaiting";
    label = inv.status === "viewed" ? "Viewed" : "Sent";
  }

  return {
    state,
    label,
    payable: live,
    changedInCrm: inv.status !== "not_sent" && open && !!inv.sentHash && inv.sentHash !== inv.crmHash,
    daysOutstanding: open && inv.sentAt ? Math.max(0, Math.floor((now - since) / DAY)) : 0,
    daysOverdue: overdue ? -daysUntilDue : 0,
    daysUntilDue,
  };
}

/** What the CRM content fingerprint covers: anything the brand sees on the request. */
export function invoiceFingerprint(inv: {
  number: string;
  brandName: string;
  brandEmail: string;
  description: string;
  lines: { description: string; amount: number }[];
  amount: number;
  currency: string;
  dueDate: number;
}): string {
  return hashOf({
    number: inv.number,
    brandName: inv.brandName,
    brandEmail: inv.brandEmail,
    description: inv.description,
    lines: inv.lines.map((l) => [l.description, l.amount]),
    amount: inv.amount,
    currency: inv.currency,
    dueDate: inv.dueDate,
  });
}

/* ------------------------------------------------------------ allocations */

/**
 * outstanding → the brand has not paid the original invoice yet
 * ready       → invoice paid, allocation unpaid, nothing in flight (Request Payment allowed)
 * requested   → the recipient has asked the agency to pay
 * pending     → a payout is authorised and waiting on the recipient
 * paid        → settled
 */
export type AllocationStage = "outstanding" | "ready" | "requested" | "pending" | "paid";

export function stageOf(a: Pick<Allocation, "status" | "invoicePaid">): AllocationStage {
  if (a.status === "paid") return "paid";
  if (a.status === "pending") return "pending";
  if (!a.invoicePaid) return "outstanding";
  return a.status === "requested" ? "requested" : "ready";
}

/** A recipient may request payment once the invoice is paid, the allocation is unpaid and no payout is pending. */
export function canRequestPayment(a: Pick<Allocation, "status" | "invoicePaid">): boolean {
  return stageOf(a) === "ready";
}

/** The agency can pay an allocation once the brand's money has arrived and nothing is already in flight. */
export function canPayOut(a: Pick<Allocation, "status" | "invoicePaid" | "recipientEmail" | "net">): boolean {
  const stage = stageOf(a);
  return (stage === "ready" || stage === "requested") && !!a.recipientEmail && a.net > 0;
}

export interface PayoutDraft {
  recipientEmail: string;
  recipientName: string;
  recipientType: RecipientType;
  currency: string;
  lines: PayoutLine[];
  amount: number;
}

/**
 * One transfer per recipient and currency. Each allocation stays its own line so several jobs
 * paid together remain individually identifiable.
 */
export function buildPayoutDrafts(allocations: Allocation[]): PayoutDraft[] {
  const drafts = new Map<string, PayoutDraft>();
  for (const a of allocations) {
    if (!canPayOut(a)) continue;
    const key = `${a.recipientEmail}|${a.currency}`;
    let draft = drafts.get(key);
    if (!draft) {
      draft = {
        recipientEmail: a.recipientEmail,
        recipientName: a.recipientName,
        recipientType: a.recipientType,
        currency: a.currency,
        lines: [],
        amount: 0,
      };
      drafts.set(key, draft);
    }
    draft.lines.push({
      allocationId: a.id,
      invoiceId: a.invoiceId,
      invoiceNumber: a.invoiceNumber,
      brandName: a.brandName,
      description: a.description,
      gross: a.gross,
      commission: a.commission,
      deductions: a.deductions,
      net: a.net,
    });
    draft.amount += a.net;
  }
  return [...drafts.values()].sort((x, y) => x.recipientName.localeCompare(y.recipientName));
}

/* ---------------------------------------------------------- reconciliation */

export type ReconState = "awaiting_brand" | "payouts_open" | "reconciled" | "void";

export interface ReconRow {
  invoice: Invoice;
  invoiced: number;
  received: number;
  /** Net owed to recipients under the CRM allocations. */
  allocated: number;
  paidOut: number;
  inFlight: number;
  /** Still to pay out: allocated − paid − in flight. */
  remaining: number;
  /** What stays with the agency: invoiced − allocated. */
  retained: number;
  state: ReconState;
}

export function reconcile(invoices: Invoice[], allocations: Allocation[]): ReconRow[] {
  const byInvoice = new Map<string, Allocation[]>();
  for (const a of allocations) {
    const list = byInvoice.get(a.invoiceId);
    if (list) list.push(a);
    else byInvoice.set(a.invoiceId, [a]);
  }
  return invoices
    .filter((inv) => inv.status !== "not_sent")
    .map((invoice) => {
      const allocs = byInvoice.get(invoice.id) ?? [];
      const allocated = allocs.reduce((s, a) => s + a.net, 0);
      const paidOut = allocs.filter((a) => a.status === "paid").reduce((s, a) => s + a.net, 0);
      const inFlight = allocs.filter((a) => a.status === "pending").reduce((s, a) => s + a.net, 0);
      const received = invoice.status === "paid" ? invoice.amount : 0;
      const remaining = allocated - paidOut - inFlight;
      let state: ReconState;
      if (invoice.status === "void") state = "void";
      else if (invoice.status !== "paid") state = "awaiting_brand";
      else if (paidOut === allocated) state = "reconciled";
      else state = "payouts_open";
      return {
        invoice,
        invoiced: invoice.amount,
        received,
        allocated,
        paidOut,
        inFlight,
        remaining,
        retained: invoice.amount - allocated,
        state,
      };
    })
    .sort((a, b) => b.invoice.issueDate - a.invoice.issueDate);
}

/* ---------------------------------------------------------------- payouts */

export function payoutLabel(p: Pick<Payout, "status" | "pendingReason">): string {
  switch (p.status) {
    case "paid":
      return "Paid";
    case "cancelled":
      return "Cancelled";
    case "reversed":
      return "Reversed";
    default:
      return p.pendingReason === "bank_account" ? "Waiting for bank account" : "Invited · waiting to join";
  }
}

/* ----------------------------------------------------------------- wallet */

export function balanceOf(txs: Pick<WalletTx, "amount">[]): number {
  return txs.reduce((sum, t) => sum + t.amount, 0);
}

export function normHandle(input: string): string {
  return input.trim().replace(/^@+/, "").toLowerCase().replace(/[^a-z0-9_]/g, "");
}

/** Wallet IDs look like @beyonce783: first name plus three digits. */
export function makeHandle(fullName: string, salt: number): string {
  const first = (fullName.trim().split(/\s+/)[0] || "creator").toLowerCase().replace(/[^a-z0-9]/g, "");
  const digits = String(100 + (Math.abs(Math.floor(salt)) % 900));
  return `${(first || "creator").slice(0, 14)}${digits}`;
}

/* -------------------------------------------------------------- contacts */

/** Other agencies that share a recipient with `ownOrgId`, derived from that recipient's allocations. */
export function mutualAgencies(
  allocations: Pick<Allocation, "orgId" | "orgName">[],
  ownOrgId: string
): { orgId: string; orgName: string; bookings: number }[] {
  const seen = new Map<string, { orgId: string; orgName: string; bookings: number }>();
  for (const a of allocations) {
    if (a.orgId === ownOrgId) continue;
    const hit = seen.get(a.orgId);
    if (hit) hit.bookings += 1;
    else seen.set(a.orgId, { orgId: a.orgId, orgName: a.orgName, bookings: 1 });
  }
  return [...seen.values()].sort((a, b) => b.bookings - a.bookings);
}
