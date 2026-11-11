"use client";

import { useMemo, useState } from "react";
import { Landmark, Lock } from "lucide-react";
import { Banner, Button, Field, Input, Row, cx } from "./ui";
import { BankConnect } from "./BankConnect";
import { addBankAccounts, payInvoices, type BankInput } from "@/lib/actions";
import { C, col, useLive, where } from "@/lib/db";
import { bankLabel, isEmail, money, plural } from "@/lib/format";
import type { BankAccount, Invoice } from "@/lib/types";

/**
 * Bank-only checkout (test mode). Guests pay one invoice and nothing is saved; registered brands
 * can pay several invoices from different agencies at once and keep their bank account on file.
 */
export function Checkout({
  invoices,
  payer,
  onPaid,
}: {
  invoices: Invoice[];
  payer: { name: string; email: string; uid: string | null };
  onPaid: (paymentId: string) => void;
}) {
  const guest = !payer.uid;
  const [name, setName] = useState(payer.name);
  const [email, setEmail] = useState(payer.email);
  const [guestBank, setGuestBank] = useState<BankInput | null>(null);
  const saved = useLive<BankAccount>(payer.uid ? `banks:${payer.uid}` : null, () => col(C.bankAccounts, where("ownerId", "==", payer.uid)));
  const [chosen, setChosen] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const currency = invoices[0]?.currency ?? "USD";
  const mixed = invoices.some((i) => i.currency !== currency);
  const total = invoices.reduce((s, i) => s + i.amount, 0);
  const byAgency = useMemo(() => {
    const m = new Map<string, Invoice[]>();
    for (const i of invoices) m.set(i.orgName, [...(m.get(i.orgName) ?? []), i]);
    return [...m.entries()];
  }, [invoices]);

  const savedAccount = saved.data.find((a) => a.id === chosen) ?? saved.data[0] ?? null;
  const method = guest ? guestBank : savedAccount;
  const valid = !mixed && !!method && name.trim().length > 1 && isEmail(email);

  const pay = async () => {
    if (!method) return;
    setBusy(true);
    setError(null);
    try {
      const id = await payInvoices(
        invoices.map((i) => i.id),
        { name, email, uid: payer.uid },
        `Bank transfer · ${bankLabel(method)}`
      );
      onPaid(id);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Payment failed.");
      setBusy(false);
    }
  };

  return (
    <div className="space-y-6">
      <section className="rounded-2xl border border-line">
        {byAgency.map(([agency, list]) => (
          <div key={agency} className="border-b border-line px-4 py-3 last:border-0">
            <p className="text-xs font-medium uppercase tracking-wider text-muted">{agency}</p>
            {list.map((i) => (
              <Row key={i.id} label={`${i.number} · ${i.description}`}>
                {money(i.amount, i.currency)}
              </Row>
            ))}
          </div>
        ))}
        <div className="flex items-baseline justify-between bg-paper/70 px-4 py-3">
          <span className="text-sm font-medium text-ink">Total · {plural(invoices.length, "invoice")}</span>
          <span className="font-display tabular text-2xl font-semibold text-ink">{money(total, currency)}</span>
        </div>
      </section>

      {mixed && <Banner tone="warn">Invoices in different currencies need to be paid separately.</Banner>}

      {guest && (
        <section className="grid gap-4 sm:grid-cols-2">
          <Field label="Your name">
            <Input value={name} onChange={(e) => setName(e.target.value)} autoComplete="name" />
          </Field>
          <Field label="Email for the receipt">
            <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} autoComplete="email" />
          </Field>
        </section>
      )}

      <section>
        <p className="mb-2 text-[13px] font-medium text-ink">Pay by bank</p>
        {guest ? (
          guestBank ? (
            <div className="flex items-center gap-3 rounded-2xl border border-ink bg-white px-4 py-3">
              <Landmark className="h-4 w-4 text-ink/60" />
              <span className="flex-1 text-sm font-medium text-ink">{bankLabel(guestBank)}</span>
              <button onClick={() => setGuestBank(null)} className="text-xs font-medium text-ink/60 hover:text-ink">
                Change
              </button>
            </div>
          ) : (
            <BankConnect variant="secondary" label="Connect your bank" onAccounts={async (a) => setGuestBank(a[0])} />
          )
        ) : (
          <div className="space-y-2">
            {saved.data.map((a) => (
              <button
                key={a.id}
                onClick={() => setChosen(a.id)}
                className={cx("flex w-full items-center gap-3 rounded-2xl border px-4 py-3 text-left transition-colors", savedAccount?.id === a.id ? "border-ink bg-white ring-1 ring-ink" : "border-line bg-white hover:border-ink/30")}
              >
                <Landmark className="h-4 w-4 text-ink/60" />
                <span className="flex-1 text-sm font-medium text-ink">{bankLabel(a)}</span>
                <span className="text-xs capitalize text-muted">{a.subtype}</span>
              </button>
            ))}
            <BankConnect
              variant="secondary"
              size="sm"
              label={saved.data.length ? "Add another bank" : "Connect your bank"}
              onAccounts={async (a) => {
                await addBankAccounts({ type: "user", id: payer.uid! }, a, saved.data);
              }}
            />
          </div>
        )}
      </section>

      {error && <Banner tone="danger">{error}</Banner>}

      <Button size="lg" className="w-full" disabled={!valid} loading={busy} onClick={pay} icon={<Lock className="h-4 w-4" />}>
        Pay {money(total, currency)}
      </Button>
      <p className="text-center text-xs text-muted">Test mode — this records the payment but no money moves. A receipt is emailed to {email || "you"}.</p>
    </div>
  );
}
