"use client";

import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { ArrowUpRight, AtSign, Landmark, Smartphone } from "lucide-react";
import { Banner, Button, Field, Input, Select, Splash, Tabs, cx, useToast } from "@/components/ui";
import { BankConnect } from "@/components/BankConnect";
import { useTalent } from "@/lib/talent";
import { addBankAccounts, logExternalPayment, sendToWalletId, withdrawToBank } from "@/lib/actions";
import { bankLabel, money, parseMoney } from "@/lib/format";

type Mode = "withdraw" | "send" | "pay";

export default function MovePage() {
  return (
    <Suspense fallback={<Splash />}>
      <Move />
    </Suspense>
  );
}

function Move() {
  const router = useRouter();
  const raw = useSearchParams().get("do");
  const mode: Mode = raw === "send" || raw === "pay" ? raw : "withdraw";
  const { balance } = useTalent();
  return (
    <div>
      <h1 className="mt-2 text-2xl font-semibold tracking-tight text-ink">Move money</h1>
      <p className="mt-1 text-sm text-muted">
        <span className="tabular font-medium text-ink">{money(balance)}</span> available
      </p>
      <Tabs
        className="mt-5"
        value={mode}
        onChange={(id) => router.replace(`/app/move?do=${id}`, { scroll: false })}
        tabs={[
          { id: "withdraw", label: "Withdraw" },
          { id: "send", label: "Send" },
          { id: "pay", label: "Pay a contact" },
        ]}
      />
      <div className="mt-5">
        {mode === "withdraw" && <Withdraw />}
        {mode === "send" && <Send />}
        {mode === "pay" && <PayContact />}
      </div>
    </div>
  );
}

function AmountField({ value, onChange, max }: { value: string; onChange: (v: string) => void; max?: number }) {
  return (
    <Field label="Amount">
      <div className="relative">
        <span className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-ink/45">$</span>
        <Input inputMode="decimal" value={value} onChange={(e) => onChange(e.target.value)} placeholder="0.00" className="font-display tabular h-14 pl-8 text-2xl font-semibold" />
        {max !== undefined && max > 0 && (
          <button type="button" onClick={() => onChange((max / 100).toFixed(2))} className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full bg-paper px-2.5 py-1 text-xs font-medium text-ink/70 hover:text-ink">
            Max
          </button>
        )}
      </div>
    </Field>
  );
}

function Withdraw() {
  const { profile, banks, balance } = useTalent();
  const toast = useToast();
  const [amount, setAmount] = useState("");
  const [bankId, setBankId] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const cents = parseMoney(amount);
  const bank = banks.find((b) => b.id === bankId) ?? banks[0] ?? null;

  const submit = async () => {
    if (!cents || !bank) return;
    setBusy(true);
    setError(null);
    try {
      await withdrawToBank(profile, cents, bank);
      toast(`${money(cents)} on its way to ${bankLabel(bank)}`);
      setAmount("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Withdrawal failed.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="space-y-4">
      {banks.length === 0 ? (
        <div className="rounded-2xl border border-line bg-white p-5">
          <Landmark className="h-5 w-5 text-ink/50" />
          <p className="mt-3 text-sm font-semibold text-ink">Link a bank account</p>
          <p className="mt-1 text-sm text-muted">Withdraw settled earnings to any bank you own.</p>
          <div className="mt-4">
            <BankConnect
              size="sm"
              onAccounts={async (inputs) => {
                await addBankAccounts({ type: "user", id: profile.uid }, inputs, banks);
                toast("Bank linked");
              }}
            />
          </div>
        </div>
      ) : (
        <>
          <AmountField value={amount} onChange={setAmount} max={balance} />
          <Field label="To">
            <Select value={bank?.id ?? ""} onChange={(e) => setBankId(e.target.value)}>
              {banks.map((b) => (
                <option key={b.id} value={b.id}>
                  {bankLabel(b)}
                </option>
              ))}
            </Select>
          </Field>
          {error && <Banner tone="danger">{error}</Banner>}
          <Button size="lg" className="w-full" disabled={!cents} loading={busy} onClick={submit}>
            Withdraw {cents ? money(cents) : ""}
          </Button>
          <p className="text-center text-xs text-muted">Standard transfer, 1–3 business days · test mode</p>
        </>
      )}
    </div>
  );
}

function Send() {
  const { profile, balance } = useTalent();
  const toast = useToast();
  const [handle, setHandle] = useState("");
  const [amount, setAmount] = useState("");
  const [note, setNote] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const cents = parseMoney(amount);

  const submit = async () => {
    if (!cents) return;
    setBusy(true);
    setError(null);
    try {
      const to = await sendToWalletId(profile, handle, cents, note);
      toast(`Sent ${money(cents)} to ${to.fullName}`);
      setHandle("");
      setAmount("");
      setNote("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Transfer failed.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="space-y-4">
      <Field label="Wallet ID" hint="Other creatives on AGNCY — instant and free.">
        <div className="relative">
          <AtSign className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-ink/40" />
          <Input value={handle.replace(/^@+/, "")} onChange={(e) => setHandle(e.target.value)} placeholder="beyonce783" className="pl-9" autoCapitalize="none" autoCorrect="off" />
        </div>
      </Field>
      <AmountField value={amount} onChange={setAmount} max={balance} />
      <Field label="Note (optional)">
        <Input value={note} onChange={(e) => setNote(e.target.value)} maxLength={140} placeholder="What's it for?" />
      </Field>
      {error && <Banner tone="danger">{error}</Banner>}
      <Button size="lg" className="w-full" disabled={!cents || !handle.trim()} loading={busy} onClick={submit}>
        Send {cents ? money(cents) : ""}
      </Button>
    </div>
  );
}

const APPS = {
  Venmo: { label: "Venmo username", placeholder: "username", link: (to: string, cents: number, note: string) => `https://venmo.com/${encodeURIComponent(to.replace(/^@/, ""))}?txn=pay&amount=${(cents / 100).toFixed(2)}&note=${encodeURIComponent(note || "Sent from AGNCY")}` },
  "Cash App": { label: "$Cashtag", placeholder: "$cashtag", link: (to: string, cents: number) => `https://cash.app/$${encodeURIComponent(to.replace(/^\$/, ""))}/${(cents / 100).toFixed(2)}` },
  Zelle: { label: "Email or mobile number", placeholder: "name@example.com", link: null },
} as const;
type AppName = keyof typeof APPS;

function PayContact() {
  const { profile } = useTalent();
  const toast = useToast();
  const [app, setApp] = useState<AppName>("Venmo");
  const [to, setTo] = useState("");
  const [amount, setAmount] = useState("");
  const [note, setNote] = useState("");
  const [busy, setBusy] = useState(false);
  const cents = parseMoney(amount);
  const spec = APPS[app];

  const submit = async () => {
    if (!cents || !to.trim()) return;
    setBusy(true);
    try {
      await logExternalPayment(profile, app, to.trim(), cents, note);
      if (spec.link) window.open(spec.link(to.trim(), cents, note), "_blank", "noopener,noreferrer");
      toast(spec.link ? `Opening ${app} — finish the payment there` : `Open your banking app and send ${money(cents)} with Zelle`, "info");
      setTo("");
      setAmount("");
      setNote("");
    } catch (err) {
      toast(err instanceof Error ? err.message : "Couldn't start the payment.", "error");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-3 gap-2">
        {(Object.keys(APPS) as AppName[]).map((name) => (
          <button
            key={name}
            onClick={() => setApp(name)}
            className={cx("rounded-2xl border px-3 py-3 text-sm font-medium transition-colors", app === name ? "border-ink bg-white ring-1 ring-ink" : "border-line bg-white text-ink/60 hover:border-ink/30")}
          >
            {name}
          </button>
        ))}
      </div>
      <Field label={spec.label}>
        <Input value={to} onChange={(e) => setTo(e.target.value)} placeholder={spec.placeholder} autoCapitalize="none" autoCorrect="off" />
      </Field>
      <AmountField value={amount} onChange={setAmount} />
      <Field label="Note (optional)">
        <Input value={note} onChange={(e) => setNote(e.target.value)} maxLength={140} />
      </Field>
      <Banner tone="info">
        The payment completes in {app}, using your {app} balance or linked account — it doesn&apos;t come out of your AGNCY balance. We keep a note of it in your activity.
      </Banner>
      <Button size="lg" className="w-full" disabled={!cents || !to.trim()} loading={busy} onClick={submit} icon={spec.link ? <ArrowUpRight className="h-4 w-4" /> : <Smartphone className="h-4 w-4" />}>
        {spec.link ? `Continue in ${app}` : "Record & open my bank app"}
      </Button>
    </div>
  );
}
