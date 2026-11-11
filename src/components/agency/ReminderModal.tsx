"use client";

import { useState } from "react";
import { BellRing } from "lucide-react";
import { Banner, Button, Field, Modal, Textarea } from "@/components/ui";
import { useAgency } from "@/lib/agency";
import { sendReminder } from "@/lib/actions";
import { viewInvoice } from "@/lib/domain";
import { useNow } from "@/lib/db";
import { money, plural } from "@/lib/format";
import type { Invoice } from "@/lib/types";

export function ReminderModal({ invoices, onClose, onSent }: { invoices: Invoice[] | null; onClose: () => void; onSent?: (count: number) => void }) {
  const { org, actor } = useAgency();
  const [note, setNote] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const list = invoices ?? [];
  const now = useNow();

  const send = async () => {
    setBusy(true);
    setError(null);
    let sent = 0;
    try {
      for (const inv of list) {
        await sendReminder(org, inv, actor, note);
        sent += 1;
      }
      setNote("");
      onSent?.(sent);
      onClose();
    } catch (err) {
      setError(`${sent ? `${plural(sent, "reminder")} sent, then: ` : ""}${err instanceof Error ? err.message : "Reminder failed."}`);
    } finally {
      setBusy(false);
    }
  };

  return (
    <Modal
      open={!!invoices && invoices.length > 0}
      onClose={onClose}
      title={list.length === 1 ? `Remind ${list[0].brandName}` : `Send ${list.length} reminders`}
      description="Each brand gets an email with the due date, days outstanding and their pay link."
      footer={
        <>
          <Button variant="ghost" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={send} loading={busy} icon={<BellRing className="h-4 w-4" />}>
            Send {list.length === 1 ? "reminder" : plural(list.length, "reminder")}
          </Button>
        </>
      }
    >
      <ul className="mb-4 divide-y divide-line rounded-2xl border border-line">
        {list.map((inv) => {
          const v = viewInvoice(inv, now);
          return (
            <li key={inv.id} className="flex items-center justify-between gap-3 px-4 py-2.5 text-sm">
              <span className="min-w-0">
                <span className="block truncate font-medium text-ink">
                  {inv.number} · {inv.brandName}
                </span>
                <span className={v.daysOverdue ? "text-xs text-rose-600" : "text-xs text-muted"}>
                  {v.daysOverdue ? `${v.daysOverdue} days overdue` : v.daysUntilDue === 0 ? "Due today" : `Due in ${v.daysUntilDue} days`} · {v.daysOutstanding} days outstanding
                  {inv.reminders?.length ? ` · ${plural(inv.reminders.length, "reminder")} sent` : ""}
                </span>
              </span>
              <span className="tabular font-medium text-ink">{money(inv.amount, inv.currency)}</span>
            </li>
          );
        })}
      </ul>
      <Field label="Add a note (optional)">
        <Textarea value={note} onChange={(e) => setNote(e.target.value)} placeholder="e.g. Let us know if you need anything from us to process this." maxLength={500} />
      </Field>
      {error && (
        <Banner tone="danger" className="mt-4">
          {error}
        </Banner>
      )}
    </Modal>
  );
}
