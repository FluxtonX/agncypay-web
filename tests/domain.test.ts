/**
 * Unit tests for the pure Phase 1 rules. Run with `npm test` (Node 22 strips the TypeScript types).
 * Only `src/lib/domain.ts` and `src/lib/crm/sandbox.ts` are imported — no Firebase, no React.
 */
import { test } from "node:test";
import assert from "node:assert/strict";
import {
  DAY,
  buildPayoutDrafts,
  canPayOut,
  canRequestPayment,
  invoiceFingerprint,
  makeHandle,
  mutualAgencies,
  normHandle,
  reconcile,
  stageOf,
  viewInvoice,
} from "../src/lib/domain.ts";
import { generateSandbox } from "../src/lib/crm/sandbox.ts";
import type { Allocation, Invoice } from "../src/lib/types.ts";

const NOW = new Date("2026-06-15T12:00:00").getTime();

function invoice(over: Partial<Invoice> = {}): Invoice {
  const base = {
    id: "inv1",
    orgId: "org1",
    orgName: "Studio North",
    provider: "sandbox" as const,
    crmId: "c1",
    number: "INV-1",
    brandName: "Brand",
    brandEmail: "ap@brand.example.com",
    description: "Campaign",
    lines: [{ description: "Fee", amount: 100_00 }],
    amount: 100_00,
    currency: "USD",
    issueDate: NOW - 10 * DAY,
    dueDate: NOW + 5 * DAY,
    crmHash: "h1",
    status: "not_sent" as const,
    createdAt: NOW - 10 * DAY,
    updatedAt: NOW - 10 * DAY,
  };
  return { ...base, ...over };
}

function allocation(over: Partial<Allocation> = {}): Allocation {
  return {
    id: "a1",
    orgId: "org1",
    orgName: "Studio North",
    invoiceId: "inv1",
    invoiceNumber: "INV-1",
    brandName: "Brand",
    description: "Talent fee",
    recipientName: "Amara",
    recipientEmail: "amara@talent.example.com",
    recipientType: "talent",
    gross: 80_00,
    commission: 16_00,
    deductions: 0,
    net: 64_00,
    currency: "USD",
    invoicePaid: false,
    status: "unpaid",
    updatedAt: NOW,
    ...over,
  };
}

test("invoice states: not sent, awaiting, overdue, declined, paid", () => {
  assert.equal(viewInvoice(invoice(), NOW).state, "not_sent");
  const sent = viewInvoice(invoice({ status: "sent", sentAt: NOW - 3 * DAY, sentHash: "h1" }), NOW);
  assert.equal(sent.state, "awaiting");
  assert.equal(sent.payable, true);
  assert.equal(sent.daysOutstanding, 3);
  assert.equal(sent.daysUntilDue, 5);

  const late = viewInvoice(invoice({ status: "viewed", sentAt: NOW - 20 * DAY, dueDate: NOW - 4 * DAY }), NOW);
  assert.equal(late.state, "overdue");
  assert.equal(late.daysOverdue, 4);
  assert.equal(late.payable, true);

  assert.equal(viewInvoice(invoice({ status: "declined" }), NOW).payable, false);
  assert.equal(viewInvoice(invoice({ status: "paid", paidVia: "crm" }), NOW).label, "Paid · recorded in CRM");
});

test("a CRM edit after sending is detected", () => {
  assert.equal(viewInvoice(invoice({ status: "sent", sentHash: "h1", crmHash: "h1" }), NOW).changedInCrm, false);
  assert.equal(viewInvoice(invoice({ status: "sent", sentHash: "h1", crmHash: "h2" }), NOW).changedInCrm, true);
  // Closed invoices never ask to be reissued.
  assert.equal(viewInvoice(invoice({ status: "paid", sentHash: "h1", crmHash: "h2" }), NOW).changedInCrm, false);
});

test("fingerprint changes with content and ignores key order", () => {
  const a = { number: "1", brandName: "B", brandEmail: "e", description: "d", lines: [{ description: "x", amount: 1 }], amount: 1, currency: "USD", dueDate: 5 };
  const reordered = { dueDate: 5, currency: "USD", amount: 1, lines: [{ amount: 1, description: "x" }], description: "d", brandEmail: "e", brandName: "B", number: "1" };
  assert.equal(invoiceFingerprint(a), invoiceFingerprint(reordered));
  assert.notEqual(invoiceFingerprint(a), invoiceFingerprint({ ...a, amount: 2 }));
});

test("allocation lifecycle: outstanding → request → paid", () => {
  const a = allocation();
  assert.equal(stageOf(a), "outstanding");
  assert.equal(canRequestPayment(a), false);
  assert.equal(canPayOut(a), false);

  const ready = allocation({ invoicePaid: true });
  assert.equal(stageOf(ready), "ready");
  assert.equal(canRequestPayment(ready), true);
  assert.equal(canPayOut(ready), true);

  const requested = allocation({ invoicePaid: true, status: "requested" });
  assert.equal(canRequestPayment(requested), false, "can't request twice");
  assert.equal(canPayOut(requested), true);

  assert.equal(canRequestPayment(allocation({ invoicePaid: true, status: "pending" })), false, "no request while a payout is pending");
  assert.equal(canPayOut(allocation({ invoicePaid: true, status: "paid" })), false);
  assert.equal(canPayOut(allocation({ invoicePaid: true, recipientEmail: "" })), false, "needs an email to pay");
});

test("payout drafts: one transfer per recipient, each job a separate line", () => {
  const drafts = buildPayoutDrafts([
    allocation({ id: "a1", invoicePaid: true }),
    allocation({ id: "a2", invoicePaid: true, invoiceId: "inv2", invoiceNumber: "INV-2", net: 10_00 }),
    allocation({ id: "a3", invoicePaid: true, recipientEmail: "mei@talent.example.com", recipientName: "Mei", net: 5_00 }),
    allocation({ id: "a4", invoicePaid: false }), // brand hasn't paid — excluded
  ]);
  assert.equal(drafts.length, 2);
  const amara = drafts.find((d) => d.recipientName === "Amara")!;
  assert.equal(amara.lines.length, 2);
  assert.equal(amara.amount, 74_00);
  assert.deepEqual(
    amara.lines.map((l) => l.invoiceNumber),
    ["INV-1", "INV-2"]
  );
});

test("reconciliation tracks received, paid out, in flight and retained", () => {
  const paid = invoice({ status: "paid" });
  const rows = reconcile(
    [paid, invoice({ id: "inv-x" })], // the unsent invoice is left out
    [allocation({ invoicePaid: true, status: "paid", net: 60_00 }), allocation({ id: "a2", invoicePaid: true, status: "pending", net: 20_00 })]
  );
  assert.equal(rows.length, 1);
  const r = rows[0];
  assert.equal(r.received, 100_00);
  assert.equal(r.paidOut, 60_00);
  assert.equal(r.inFlight, 20_00);
  assert.equal(r.remaining, 0);
  assert.equal(r.retained, 20_00);
  assert.equal(r.state, "payouts_open");
});

test("wallet ids and mutual agencies", () => {
  assert.match(makeHandle("Beyoncé Knowles", 683), /^beyonc\d{3}$/);
  assert.equal(normHandle("  @@Amara_482 "), "amara_482");
  const mutual = mutualAgencies(
    [
      { orgId: "me", orgName: "Me" },
      { orgId: "x", orgName: "X Talent" },
      { orgId: "x", orgName: "X Talent" },
      { orgId: "y", orgName: "Y Mgmt" },
    ],
    "me"
  );
  assert.deepEqual(mutual, [
    { orgId: "x", orgName: "X Talent", bookings: 2 },
    { orgId: "y", orgName: "Y Mgmt", bookings: 1 },
  ]);
});

test("sandbox CRM: allocations add up, tester emails and edits apply", () => {
  const base = generateSandbox({ seededAt: NOW });
  assert.equal(base.provider, "sandbox");
  for (const inv of base.invoices) {
    assert.equal(inv.amount, inv.lines.reduce((s, l) => s + l.amount, 0), `${inv.number} lines sum to total`);
    const allocated = inv.allocations.reduce((s, a) => s + a.gross, 0);
    assert.ok(allocated <= inv.amount, `${inv.number} allocates no more than invoiced`);
    for (const a of inv.allocations) assert.equal(a.net, a.gross - a.commission - a.deductions);
    assert.ok(inv.brandEmail.endsWith("example.com"));
  }
  assert.equal(base.invoices.find((i) => i.crmId === "sbx-2039")?.status, "paid");

  const custom = generateSandbox({
    seededAt: NOW,
    brandEmail: "Me@Brand.Example.com",
    talentEmail: "me@talent.example.com",
    edits: { "sbx-2043": { amount: 20_000_00 } },
  });
  assert.ok(custom.invoices.every((i) => i.brandEmail === "me@brand.example.com"));
  assert.ok(custom.invoices.some((i) => i.allocations.some((a) => a.recipientEmail === "me@talent.example.com")));
  const edited = custom.invoices.find((i) => i.crmId === "sbx-2043")!;
  assert.equal(edited.amount, 20_000_00);
  assert.equal(edited.lines.reduce((s, l) => s + l.amount, 0), 20_000_00);
});
