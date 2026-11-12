"use client";

import { useState } from "react";
import { CheckCircle2, Send } from "lucide-react";
import { Banner, Button, CopyButton, Field, Modal, Row, Select } from "@/components/ui";
import { InvoiceSplit } from "./Split";
import { useAgency } from "@/lib/agency";
import { sendPaymentRequest } from "@/lib/actions";
import { viewInvoice } from "@/lib/domain";
import { useNow } from "@/lib/db";
import { bankLabel, dateLong, money } from "@/lib/format";
import { publicUrl } from "@/lib/links";
import type { Invoice } from "@/lib/types";

/** Select → review → confirm. Content comes from the CRM and is never edited here. */
export function SendRequestDrawer({ invoice, onClose }: { invoice: Invoice | null; onClose: () => void }) {
  return (
    <Modal
      open={!!invoice}
      onClose={onClose}
      variant="drawer"
      title={invoice ? `${invoice.status === "not_sent" ? "Send" : "Reissue"} ${invoice.number}` : ""}
      description="Review what the brand will see. To change anything, edit the invoice in your CRM — it updates here automatically."
    >
      {invoice && <Body key={invoice.id} invoice={invoice} onClose={onClose} />}
    </Modal>
  );
}

function Body({ invoice, onClose }: { invoice: Invoice; onClose: () => void }) {
  const { org, actor, accounts, receiving, allocations } = useAgency();
  const [accountId, setAccountId] = useState(invoice.receivingAccountId && accounts.some((a) => a.id === invoice.receivingAccountId) ? invoice.receivingAccountId : receiving?.id ?? "");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);
  const view = viewInvoice(invoice, useNow());
  // Captured once: after sending, the live invoice flips to "sent".
  const [resend] = useState(invoice.status !== "not_sent");
  const allocs = allocations.filter((a) => a.invoiceId === invoice.id);
  const account = accounts.find((a) => a.id === accountId) ?? null;

  const blocker = !org.crm.provider
    ? "Connect your CRM to send payment requests."
    : !invoice.brandEmail
      ? "This invoice has no billing email in your CRM. Add one there and it will sync here automatically."
      : !account
        ? "Connect a receiving bank account first (Settings → Bank accounts)."
        : null;

  const send = async () => {
    if (!account) return;
    setBusy(true);
    setError(null);
    try {
      await sendPaymentRequest(org, invoice, actor, account);
      setDone(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Couldn't send the request.");
    } finally {
      setBusy(false);
    }
  };

  if (done) {
    // The token is issued on first send; read it from the live invoice once it arrives.
    const live = invoice.token ? publicUrl(`/pay/${invoice.token}`) : null;
    return (
      <div className="flex flex-col items-center py-10 text-center">
        <span className="flex h-14 w-14 items-center justify-center rounded-full bg-emerald-50 text-emerald-600">
          <CheckCircle2 className="h-7 w-7" />
        </span>
        <p className="mt-4 text-lg font-semibold text-ink">{resend ? "Request reissued" : "Request sent"}</p>
        <p className="mt-1 max-w-sm text-sm text-muted">
          {invoice.brandName} ({invoice.brandEmail}) can pay {money(invoice.amount, invoice.currency)} by bank — no account needed. It settles to {bankLabel(account)}.
        </p>
        <div className="mt-6 flex gap-2">
          {live && <CopyButton value={live} label="Copy pay link" size="md" />}
          <Button onClick={onClose}>Done</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {invoice.status === "declined" && invoice.decline && (
        <Banner tone="warn" title={`Declined by ${invoice.decline.by}`}>
          {invoice.decline.reason || "No reason given."}
          {invoice.decline.correction && <span className="mt-1 block">Proposed correction: {invoice.decline.correction}</span>}
          {!view.changedInCrm && <span className="mt-1 block font-medium text-ink">This invoice hasn&apos;t changed in your CRM since it was declined.</span>}
        </Banner>
      )}
      {view.changedInCrm && invoice.status !== "declined" && (
        <Banner tone="info" title="Updated in your CRM">
          The brand currently sees the previous version. Reissuing sends the updated invoice on the same pay link.
        </Banner>
      )}

      <section>
        <p className="text-xs font-medium uppercase tracking-wider text-muted">Bill to</p>
        <p className="mt-1 text-[15px] font-semibold text-ink">{invoice.brandName}</p>
        <p className="text-sm text-muted">{invoice.brandEmail || "No billing email in CRM"}</p>
      </section>

      <section className="rounded-2xl border border-line">
        <div className="border-b border-line px-4 py-3">
          <p className="text-sm font-medium text-ink">{invoice.description}</p>
          <p className="text-xs text-muted">Due {dateLong(invoice.dueDate)}</p>
        </div>
        <div className="px-4 py-2">
          {invoice.lines.map((l, i) => (
            <Row key={i} label={l.description}>
              {money(l.amount, invoice.currency)}
            </Row>
          ))}
          <div className="mt-1 border-t border-line pt-1.5">
            <Row label="Total" strong>
              {money(invoice.amount, invoice.currency)}
            </Row>
          </div>
        </div>
      </section>

      {allocs.length > 0 && (
        <section>
          <p className="mb-2 text-xs font-medium uppercase tracking-wider text-muted">Allocations from CRM</p>
          <InvoiceSplit amount={invoice.amount} currency={invoice.currency} allocations={allocs} showStatus={false} />
        </section>
      )}

      {accounts.length > 0 && (
        <Field label="Settles to" hint="Where the brand's payment lands. Your default receiving account is preselected.">
          <Select value={accountId} onChange={(e) => setAccountId(e.target.value)}>
            {accounts.map((a) => (
              <option key={a.id} value={a.id}>
                {bankLabel(a)}
                {a.receiving ? " · default" : ""}
              </option>
            ))}
          </Select>
        </Field>
      )}

      {(blocker || error) && <Banner tone={error ? "danger" : "warn"}>{error ?? blocker}</Banner>}

      <div className="flex justify-end gap-2 border-t border-line pt-5">
        <Button variant="ghost" onClick={onClose}>
          Cancel
        </Button>
        <Button onClick={send} loading={busy} disabled={!!blocker} icon={<Send className="h-4 w-4" />}>
          {resend ? "Reissue request" : "Send payment request"}
        </Button>
      </div>
    </div>
  );
}
