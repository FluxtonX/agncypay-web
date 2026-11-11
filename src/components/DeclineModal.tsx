"use client";

import { useState } from "react";
import { Banner, Button, Field, Modal, Textarea } from "./ui";
import { declineInvoice } from "@/lib/actions";
import { money } from "@/lib/format";
import type { Invoice } from "@/lib/types";

/** Decline with an optional reason or proposed correction. The agency fixes it in their CRM and reissues. */
export function DeclineModal({ invoice, by, onClose, onDone }: { invoice: Invoice | null; by: string; onClose: () => void; onDone?: () => void }) {
  const [reason, setReason] = useState("");
  const [correction, setCorrection] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const submit = async () => {
    if (!invoice) return;
    setBusy(true);
    setError(null);
    try {
      await declineInvoice(invoice.id, reason, correction, by);
      setReason("");
      setCorrection("");
      onDone?.();
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Couldn't decline.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <Modal
      open={!!invoice}
      onClose={onClose}
      title={invoice ? `Decline ${invoice.number}?` : ""}
      description={invoice ? `${invoice.orgName} will be notified and can send a corrected request for ${money(invoice.amount, invoice.currency)}.` : undefined}
      footer={
        <>
          <Button variant="ghost" onClick={onClose}>
            Cancel
          </Button>
          <Button variant="danger" onClick={submit} loading={busy}>
            Decline request
          </Button>
        </>
      }
    >
      <div className="space-y-4">
        <Field label="Reason (optional)">
          <Textarea value={reason} onChange={(e) => setReason(e.target.value)} maxLength={600} placeholder="e.g. The usage term doesn't match our contract." />
        </Field>
        <Field label="Proposed correction (optional)">
          <Textarea value={correction} onChange={(e) => setCorrection(e.target.value)} maxLength={600} placeholder="e.g. Should be 6 months of paid social, total $42,000." className="min-h-[64px]" />
        </Field>
        {error && <Banner tone="danger">{error}</Banner>}
      </div>
    </Modal>
  );
}
