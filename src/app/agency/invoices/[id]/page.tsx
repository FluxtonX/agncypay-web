"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { ArrowLeft, BellRing, FileText, FlaskConical, PenLine, Send } from "lucide-react";
import { Banner, Button, Card, CardHeader, CopyButton, EmptyState, Field, Input, Modal, Row, Textarea, useToast } from "@/components/ui";
import { InvoicePill } from "@/components/status";
import { InvoiceSplit } from "@/components/agency/Split";
import { SendRequestDrawer } from "@/components/agency/SendRequestDrawer";
import { PayoutDrawer } from "@/components/agency/PayoutDrawer";
import { ReminderModal } from "@/components/agency/ReminderModal";
import { useAgency } from "@/lib/agency";
import { providerName, saveSandboxEdit } from "@/lib/actions";
import { C, col, useLive, useNow, where } from "@/lib/db";
import { canPayOut, viewInvoice } from "@/lib/domain";
import { bankLabel, dateLong, dateTime, money, parseMoney } from "@/lib/format";
import type { ActivityEvent, Allocation, Invoice, Org } from "@/lib/types";

export default function InvoiceDetail() {
  const { id } = useParams<{ id: string }>();
  const { org, invoices, allocations, accounts, loading } = useAgency();
  const now = useNow();
  const inv = invoices.find((i) => i.id === id);
  const allocs = useMemo(() => allocations.filter((a) => a.invoiceId === id), [allocations, id]);
  const events = useLive<ActivityEvent>(`activity:inv:${id}`, () => col(C.activity, where("invoiceId", "==", id)));
  const [send, setSend] = useState(false);
  const [remind, setRemind] = useState(false);
  const [payout, setPayout] = useState<Allocation[] | null>(null);
  const [simulate, setSimulate] = useState(false);

  if (!inv) {
    return loading ? null : (
      <Card>
        <EmptyState icon={<FileText className="h-5 w-5" />} title="Invoice not found" body="It may have been removed from your CRM." action={<Link href="/agency/invoices" className="text-sm font-medium underline">Back to invoices</Link>} />
      </Card>
    );
  }

  const view = viewInvoice(inv, now);
  const payable = allocs.filter((a) => canPayOut(a));
  const settleTo = accounts.find((a) => a.id === inv.receivingAccountId);
  const payLink = inv.token && typeof window !== "undefined" ? `${window.location.origin}/pay/${inv.token}` : null;
  const timeline = [...events.data].sort((a, b) => b.at - a.at);

  return (
    <div>
      <Link href="/agency/invoices" className="mb-5 inline-flex items-center gap-1.5 text-sm text-ink/60 hover:text-ink">
        <ArrowLeft className="h-4 w-4" /> Invoices
      </Link>

      <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
        <div>
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="text-[28px] font-semibold tracking-tight text-ink">{inv.number}</h1>
            <InvoicePill invoice={inv} now={now} />
          </div>
          <p className="mt-1 text-sm text-muted">
            {inv.brandName} · {inv.description}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          {payLink && view.payable && <CopyButton value={payLink} label="Copy pay link" size="md" />}
          {view.payable && !view.changedInCrm && (
            <Button variant="secondary" icon={<BellRing className="h-4 w-4" />} onClick={() => setRemind(true)}>
              Send reminder
            </Button>
          )}
          {(view.state === "not_sent" || view.state === "declined" || view.changedInCrm) && (
            <Button icon={<Send className="h-4 w-4" />} onClick={() => setSend(true)}>
              {view.state === "not_sent" ? "Send payment request" : "Reissue"}
            </Button>
          )}
          {payable.length > 0 && (
            <Button variant="accent" icon={<Send className="h-4 w-4" />} onClick={() => setPayout(payable)}>
              Pay out {money(payable.reduce((s, a) => s + a.net, 0), inv.currency)}
            </Button>
          )}
        </div>
      </div>

      {view.state === "declined" && inv.decline && (
        <Banner tone="warn" title={`Declined by ${inv.decline.by} · ${dateTime(inv.decline.at)}`} className="mb-6">
          <p>
            <span className="font-medium text-ink">Reason:</span> {inv.decline.reason || "None given"}
          </p>
          {inv.decline.correction && (
            <p className="mt-1">
              <span className="font-medium text-ink">Proposed correction:</span> {inv.decline.correction}
            </p>
          )}
          <p className="mt-2">
            {view.changedInCrm
              ? "The invoice has been updated in your CRM since — reissue it when you're ready."
              : `Make the correction in ${providerName(inv.provider)}. It syncs here automatically, then reissue the request.`}
          </p>
        </Banner>
      )}
      {view.changedInCrm && view.state !== "declined" && (
        <Banner tone="info" title={`Updated in ${providerName(inv.provider)} after it was sent`} className="mb-6" action={<Button size="sm" onClick={() => setSend(true)}>Reissue</Button>}>
          {inv.brandName} still sees the version sent on {dateLong(inv.sentAt)}.
        </Banner>
      )}

      <div className="grid gap-6 lg:grid-cols-[1fr_340px]">
        <div className="space-y-6">
          <Card>
            <CardHeader title="Invoice" hint={`From ${providerName(inv.provider)} · read-only`} action={org.crm.provider === "sandbox" && inv.provider === "sandbox" && inv.status !== "paid" ? <Button size="sm" variant="ghost" icon={<FlaskConical className="h-3.5 w-3.5" />} onClick={() => setSimulate(true)}>Simulate CRM edit</Button> : undefined} />
            <div className="px-5 py-3">
              {inv.lines.map((l, i) => (
                <Row key={i} label={l.description}>
                  {money(l.amount, inv.currency)}
                </Row>
              ))}
              <div className="mt-1 border-t border-line pt-1.5">
                <Row label="Total" strong>
                  {money(inv.amount, inv.currency)}
                </Row>
              </div>
            </div>
          </Card>

          <Card>
            <CardHeader title="Allocations" hint="Who this booking pays, from your CRM. Payouts open once the brand has paid." />
            <div className="px-5 pb-2 pt-4">
              {allocs.length ? (
                <InvoiceSplit amount={inv.amount} currency={inv.currency} allocations={allocs} />
              ) : (
                <p className="pb-4 text-sm text-muted">No allocations on this invoice — the full amount is retained by the agency.</p>
              )}
            </div>
          </Card>
        </div>

        <div className="space-y-6">
          <Card className="p-5">
            <Row label="Bill to">{inv.brandName}</Row>
            <Row label="Billing email">{inv.brandEmail || "—"}</Row>
            <Row label="Issued">{dateLong(inv.issueDate)}</Row>
            <Row label="Due">{dateLong(inv.dueDate)}</Row>
            {view.payable && <Row label="Days outstanding">{view.daysOutstanding}</Row>}
            {view.daysOverdue > 0 && <Row label="Days overdue">{view.daysOverdue}</Row>}
            {inv.reminders?.length ? <Row label="Reminders sent">{inv.reminders.length}</Row> : null}
            {settleTo && <Row label="Settles to">{bankLabel(settleTo)}</Row>}
            {inv.status === "paid" && <Row label="Paid">{inv.paidVia === "crm" ? `Recorded in ${providerName(inv.provider)}` : dateLong(inv.paidAt)}</Row>}
            {inv.status === "paid" && inv.paidVia === "agncy" && inv.provider === "quickbooks" && (
              <Row label="QuickBooks">
                {inv.crmRecordedAt ? (
                  <span className="text-emerald-700">Marked paid {dateLong(inv.crmRecordedAt)}</span>
                ) : inv.crmRecordError ? (
                  <span className="text-rose-600" title={inv.crmRecordError}>
                    Not updated yet — retrying
                  </span>
                ) : (
                  <span className="text-muted">Updating on next sync…</span>
                )}
              </Row>
            )}
            {inv.paymentId && (
              <Link href={`/receipt/${inv.paymentId}`} className="mt-2 inline-block text-sm font-medium text-ink underline underline-offset-4">
                View receipt
              </Link>
            )}
          </Card>

          <Card>
            <CardHeader title="Timeline" />
            {timeline.length === 0 ? (
              <p className="px-5 py-6 text-sm text-muted">Synced from {providerName(inv.provider)} {dateLong(inv.createdAt)}.</p>
            ) : (
              <ol className="relative px-5 py-4">
                {timeline.map((e) => (
                  <li key={e.id} className="relative border-l border-line pb-4 pl-5 last:pb-0">
                    <span className="absolute -left-[5px] top-1.5 h-2.5 w-2.5 rounded-full border-2 border-white bg-ink/60" />
                    <p className="text-sm text-ink">{e.summary}</p>
                    <p className="text-xs text-muted">
                      {dateTime(e.at)} · {e.actor}
                    </p>
                  </li>
                ))}
              </ol>
            )}
          </Card>
        </div>
      </div>

      <SendRequestDrawer invoice={send ? inv : null} onClose={() => setSend(false)} />
      <ReminderModal invoices={remind ? [inv] : null} onClose={() => setRemind(false)} />
      <PayoutDrawer allocations={payout} onClose={() => setPayout(null)} />
      {simulate && <SimulateEdit org={org} inv={inv} onClose={() => setSimulate(false)} />}
    </div>
  );
}

/** Sandbox CRM only — stands in for someone editing the invoice in QuickBooks or Xero. */
function SimulateEdit({ org, inv, onClose }: { org: Org; inv: Invoice; onClose: () => void }) {
  const toast = useToast();
  const prev = org.sandbox?.edits?.[inv.crmId];
  const [amount, setAmount] = useState(((prev?.amount ?? inv.amount) / 100).toFixed(2));
  const [description, setDescription] = useState(prev?.description ?? inv.description);
  const [due, setDue] = useState(new Date(prev?.dueDate ?? inv.dueDate).toISOString().slice(0, 10));
  const [busy, setBusy] = useState(false);
  const cents = parseMoney(amount);

  const save = async () => {
    if (!cents) return;
    setBusy(true);
    try {
      await saveSandboxEdit(org, inv.crmId, { amount: cents, description: description.trim() || inv.description, dueDate: new Date(`${due}T12:00:00`).getTime() });
      toast("Saved in the sandbox CRM — syncing now");
      onClose();
    } catch (err) {
      toast(err instanceof Error ? err.message : "Couldn't save.", "error");
    } finally {
      setBusy(false);
    }
  };

  return (
    <Modal
      open
      onClose={onClose}
      title="Simulate a CRM edit"
      description="Sandbox only. This edits the invoice inside the sandbox CRM, the way a real edit in QuickBooks or Xero would — AGNCY picks it up through sync."
      footer={
        <>
          <Button variant="ghost" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={save} loading={busy} disabled={!cents} icon={<PenLine className="h-4 w-4" />}>
            Save in CRM
          </Button>
        </>
      }
    >
      <div className="space-y-4">
        <Field label="Invoice total" hint="A different total adds an adjustment line.">
          <Input inputMode="decimal" value={amount} onChange={(e) => setAmount(e.target.value)} />
        </Field>
        <Field label="Description">
          <Textarea value={description} onChange={(e) => setDescription(e.target.value)} className="min-h-[64px]" />
        </Field>
        <Field label="Due date">
          <Input type="date" value={due} onChange={(e) => setDue(e.target.value)} />
        </Field>
      </div>
    </Modal>
  );
}
