"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { CheckCircle2, MailPlus, Send } from "lucide-react";
import { Avatar, Banner, Button, Field, Modal, Pill, Select } from "@/components/ui";
import { useAgency } from "@/lib/agency";
import { createPayouts, resolveRecipient, type PayoutResult, type RecipientStatus } from "@/lib/actions";
import { buildPayoutDrafts, hashOf } from "@/lib/domain";
import { bankLabel, money, plural } from "@/lib/format";
import type { Allocation } from "@/lib/types";

/**
 * Review-only payout authorisation. Amounts and recipients come from CRM allocations; the agency
 * picks the funding account and confirms. Recipients not yet on AGNCY get Send & Invite: the
 * payout is authorised now and released automatically once they can receive it.
 */
export function PayoutDrawer({ allocations, onClose }: { allocations: Allocation[] | null; onClose: () => void }) {
  const key = allocations ? hashOf(allocations.map((a) => a.id).sort()) : "none";
  return (
    <Modal open={!!allocations && allocations.length > 0} onClose={onClose} variant="drawer" wide title="Review payouts" description="Recipient details and amounts come from your CRM allocations.">
      {allocations && allocations.length > 0 && <Body key={key} allocations={allocations} onClose={onClose} />}
    </Modal>
  );
}

function Body({ allocations, onClose }: { allocations: Allocation[]; onClose: () => void }) {
  const { org, actor, accounts, funding } = useAgency();
  const drafts = useMemo(() => buildPayoutDrafts(allocations), [allocations]);
  const [statuses, setStatuses] = useState<Record<string, RecipientStatus>>({});
  const [fundingId, setFundingId] = useState(funding?.id ?? "");
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState<PayoutResult | null>(null);

  useEffect(() => {
    let alive = true;
    (async () => {
      const entries = await Promise.all(drafts.map(async (d) => [d.recipientEmail, await resolveRecipient(d.recipientEmail).catch(() => ({ kind: "unregistered" }) as RecipientStatus)] as const));
      if (alive) setStatuses(Object.fromEntries(entries));
    })();
    return () => {
      alive = false;
    };
  }, [drafts]);

  const account = accounts.find((a) => a.id === fundingId) ?? null;
  const resolved = drafts.every((d) => statuses[d.recipientEmail]);
  const invites = drafts.filter((d) => statuses[d.recipientEmail]?.kind === "unregistered").length;
  const blocked = drafts.filter((d) => statuses[d.recipientEmail]?.kind === "ineligible");
  const payable = drafts.filter((d) => statuses[d.recipientEmail]?.kind !== "ineligible");
  const totals = payable.reduce<Record<string, number>>((acc, d) => ({ ...acc, [d.currency]: (acc[d.currency] ?? 0) + d.amount }), {});
  const skipped = allocations.length - drafts.reduce((s, d) => s + d.lines.length, 0);

  const blocker =
    org.verification.status !== "verified"
      ? "Verify your business before sending payouts (Settings → Business)."
      : !account
        ? "Connect a funding bank account first (Settings → Bank accounts)."
        : payable.length === 0
          ? "Nothing here can be paid right now."
          : null;

  const submit = async () => {
    if (!account) return;
    setBusy(true);
    try {
      setResult(await createPayouts(org, payable, account, actor));
    } finally {
      setBusy(false);
    }
  };

  if (result) {
    return (
      <div className="py-8">
        <div className="flex flex-col items-center text-center">
          <span className="flex h-14 w-14 items-center justify-center rounded-full bg-emerald-50 text-emerald-600">
            <CheckCircle2 className="h-7 w-7" />
          </span>
          <p className="mt-4 text-lg font-semibold text-ink">
            {result.sent > 0 && `${plural(result.sent, "payout")} sent`}
            {result.sent > 0 && result.invited > 0 && " · "}
            {result.invited > 0 && `${plural(result.invited, "recipient")} invited`}
            {result.sent === 0 && result.invited === 0 && "Nothing was sent"}
          </p>
          {result.invited > 0 && <p className="mt-1 max-w-sm text-sm text-muted">Invited recipients are paid automatically as soon as they join or add a bank account. You can cancel until then.</p>}
        </div>
        {result.failed.length > 0 && (
          <Banner tone="danger" title="Some payouts weren't sent" className="mt-6">
            <ul className="list-disc pl-4">
              {result.failed.map((f) => (
                <li key={f.name}>
                  {f.name}: {f.error}
                </li>
              ))}
            </ul>
          </Banner>
        )}
        <div className="mt-8 flex justify-center gap-2">
          <Link href="/agency/payouts?tab=history" onClick={onClose} className="inline-flex h-10 items-center rounded-full border border-line bg-white px-4 text-sm font-medium text-ink hover:bg-paper">
            View history
          </Link>
          <Button onClick={onClose}>Done</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {skipped > 0 && <Banner tone="info">{plural(skipped, "allocation")} can&apos;t be paid yet (brand hasn&apos;t paid, already in flight, or missing an email in the CRM) and {skipped === 1 ? "was" : "were"} left out.</Banner>}

      <ul className="space-y-3">
        {drafts.map((d) => {
          const status = statuses[d.recipientEmail];
          return (
            <li key={`${d.recipientEmail}|${d.currency}`} className="rounded-2xl border border-line">
              <div className="flex flex-wrap items-center gap-3 border-b border-line px-4 py-3">
                <Avatar name={d.recipientName} size={34} />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold text-ink">{d.recipientName}</p>
                  <p className="truncate text-xs text-muted">{d.recipientEmail}</p>
                </div>
                <RecipientBadge status={status} />
                <p className="font-display tabular text-lg font-semibold text-ink">{money(d.amount, d.currency)}</p>
              </div>
              <table className="w-full text-[13px]">
                <thead>
                  <tr className="text-left text-[11px] uppercase tracking-wider text-muted">
                    <th className="px-4 pb-1 pt-2.5 font-medium">Job</th>
                    <th className="px-2 pb-1 pt-2.5 text-right font-medium">Gross</th>
                    <th className="hidden px-2 pb-1 pt-2.5 text-right font-medium sm:table-cell">Comm.</th>
                    <th className="hidden px-2 pb-1 pt-2.5 text-right font-medium sm:table-cell">Ded.</th>
                    <th className="px-4 pb-1 pt-2.5 text-right font-medium">Net</th>
                  </tr>
                </thead>
                <tbody>
                  {d.lines.map((l) => (
                    <tr key={l.allocationId} className="border-t border-line/60">
                      <td className="px-4 py-2">
                        <span className="text-ink">{l.description}</span>
                        <span className="block text-[11px] text-muted">
                          {l.invoiceNumber} · {l.brandName}
                        </span>
                      </td>
                      <td className="tabular px-2 py-2 text-right text-ink/70">{money(l.gross, d.currency)}</td>
                      <td className="tabular hidden px-2 py-2 text-right text-ink/70 sm:table-cell">{l.commission ? `−${money(l.commission, d.currency)}` : "—"}</td>
                      <td className="tabular hidden px-2 py-2 text-right text-ink/70 sm:table-cell">{l.deductions ? `−${money(l.deductions, d.currency)}` : "—"}</td>
                      <td className="tabular px-4 py-2 text-right font-medium text-ink">{money(l.net, d.currency)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </li>
          );
        })}
      </ul>

      {blocked.length > 0 && (
        <Banner tone="warn" title="Can't be paid through AGNCY">
          {blocked.map((d) => `${d.recipientName}: ${(statuses[d.recipientEmail] as { reason: string }).reason}`).join(" ")}
        </Banner>
      )}

      <Field label="Fund from" hint="Any connected account can fund payouts. Your default funding account is preselected.">
        <Select value={fundingId} onChange={(e) => setFundingId(e.target.value)} disabled={accounts.length === 0}>
          {accounts.length === 0 && <option value="">No bank account connected</option>}
          {accounts.map((a) => (
            <option key={a.id} value={a.id}>
              {bankLabel(a)}
              {a.funding ? " · default" : ""}
            </option>
          ))}
        </Select>
      </Field>

      {invites > 0 && (
        <Banner tone="info" title="Send & Invite">
          {plural(invites, "recipient")} {invites === 1 ? "isn't" : "aren't"} on AGNCY yet. We&apos;ll email an invitation; the payout is authorised now and released automatically the moment they join.
        </Banner>
      )}
      {blocker && <Banner tone="warn">{blocker}</Banner>}

      <div className="sticky bottom-0 -mx-6 -mb-5 flex flex-wrap items-center justify-between gap-3 border-t border-line bg-white px-6 py-4">
        <div>
          <p className="text-xs text-muted">{plural(payable.length, "payout")} · test mode</p>
          <p className="font-display tabular text-xl font-semibold text-ink">
            {Object.entries(totals)
              .map(([c, v]) => money(v, c))
              .join(" + ") || "—"}
          </p>
        </div>
        <Button size="lg" onClick={submit} loading={busy} disabled={!!blocker || !resolved} icon={invites > 0 ? <MailPlus className="h-4 w-4" /> : <Send className="h-4 w-4" />}>
          {!resolved ? "Checking recipients…" : invites > 0 ? "Send & Invite" : `Send ${plural(payable.length, "payout")}`}
        </Button>
      </div>
    </div>
  );
}

function RecipientBadge({ status }: { status: RecipientStatus | undefined }) {
  if (!status) return <Pill>Checking…</Pill>;
  switch (status.kind) {
    case "user":
      return <Pill tone="green">On AGNCY · instant</Pill>;
    case "org":
      return status.hasBank ? <Pill tone="green">On AGNCY · to bank</Pill> : <Pill tone="amber">Waits for bank account</Pill>;
    case "unregistered":
      return <Pill tone="violet">Send & Invite</Pill>;
    default:
      return <Pill tone="red">Can&apos;t receive</Pill>;
  }
}
