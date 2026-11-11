"use client";

import { useState } from "react";
import { Building2, Landmark } from "lucide-react";
import type { BankInput } from "@/lib/actions";
import { Banner, Button, Field, Input, Modal, Select } from "./ui";

interface PlaidHandler {
  open: () => void;
  destroy?: () => void;
}
interface PlaidMetadata {
  institution?: { name?: string; institution_id?: string } | null;
}
declare global {
  interface Window {
    Plaid?: {
      create: (config: {
        token: string;
        onSuccess: (publicToken: string, metadata: PlaidMetadata) => void;
        onExit: (err: unknown) => void;
      }) => PlaidHandler;
    };
  }
}

const PLAID_SRC = "https://cdn.plaid.com/link/v2/stable/link-initialize.js";

function loadPlaid(): Promise<NonNullable<Window["Plaid"]>> {
  if (window.Plaid) return Promise.resolve(window.Plaid);
  return new Promise((resolve, reject) => {
    const existing = document.querySelector<HTMLScriptElement>(`script[src="${PLAID_SRC}"]`);
    const script = existing ?? document.createElement("script");
    script.addEventListener("load", () => (window.Plaid ? resolve(window.Plaid) : reject(new Error("Plaid failed to load."))));
    script.addEventListener("error", () => reject(new Error("Couldn't load Plaid. Check your connection or use manual entry.")));
    if (!existing) {
      script.src = PLAID_SRC;
      script.async = true;
      document.head.appendChild(script);
    }
  });
}

interface PlaidAccount {
  institutionName: string;
  name: string;
  mask: string | null;
  subtype: string | null;
}

/** Runs Plaid Link (sandbox) and resolves with the accounts the person chose, or [] if they closed it. */
async function connectWithPlaid(): Promise<BankInput[]> {
  const res = await fetch("/api/plaid/link-token", { method: "POST" });
  const body = await res.json().catch(() => ({}));
  if (!res.ok || !body.link_token) throw new Error(body.error || "Bank connection isn't available right now.");
  const Plaid = await loadPlaid();
  return new Promise((resolve, reject) => {
    const handler = Plaid.create({
      token: body.link_token,
      onSuccess: async (publicToken, metadata) => {
        try {
          const ex = await fetch("/api/plaid/exchange-token", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ public_token: publicToken, institution: metadata.institution }),
          });
          const data = await ex.json().catch(() => ({}));
          if (!ex.ok || !Array.isArray(data.accounts)) throw new Error(data.error || "Couldn't finish connecting the bank.");
          resolve(
            (data.accounts as PlaidAccount[]).map((a) => ({
              institution: a.institutionName || metadata.institution?.name || "Bank",
              name: a.name || "Account",
              mask: (a.mask || "0000").slice(-4),
              subtype: a.subtype || "checking",
              source: "plaid" as const,
            }))
          );
        } catch (err) {
          reject(err);
        } finally {
          handler.destroy?.();
        }
      },
      onExit: () => {
        handler.destroy?.();
        resolve([]);
      },
    });
    handler.open();
  });
}

/**
 * Connect an external bank account — Plaid first, manual entry as a fallback. Manual entry checks
 * the routing number but only the bank name and last four digits are ever stored.
 */
export function BankConnect({
  onAccounts,
  label = "Connect bank account",
  variant = "primary",
  size = "md",
}: {
  onAccounts: (accounts: BankInput[]) => Promise<void>;
  label?: string;
  variant?: "primary" | "secondary" | "accent";
  size?: "sm" | "md" | "lg";
}) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [manual, setManual] = useState(false);

  const plaid = async () => {
    setError(null);
    setBusy(true);
    try {
      const accounts = await connectWithPlaid();
      if (accounts.length) await onAccounts(accounts);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Bank connection failed.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div>
      <div className="flex flex-wrap items-center gap-2">
        <Button variant={variant} size={size} loading={busy} icon={<Landmark className="h-4 w-4" />} onClick={plaid}>
          {label}
        </Button>
        <Button variant="ghost" size={size} onClick={() => setManual(true)}>
          Enter details manually
        </Button>
      </div>
      {error && (
        <Banner tone="warn" className="mt-3">
          {error}
        </Banner>
      )}
      <ManualBankModal
        open={manual}
        onClose={() => setManual(false)}
        onSave={async (a) => {
          await onAccounts([a]);
          setManual(false);
        }}
      />
    </div>
  );
}

/** ABA routing numbers carry a 3-7-1 weighted checksum. */
function validRouting(value: string) {
  if (!/^\d{9}$/.test(value)) return false;
  const d = value.split("").map(Number);
  return (3 * (d[0] + d[3] + d[6]) + 7 * (d[1] + d[4] + d[7]) + (d[2] + d[5] + d[8])) % 10 === 0;
}

function ManualBankModal({ open, onClose, onSave }: { open: boolean; onClose: () => void; onSave: (a: BankInput) => Promise<void> }) {
  const [bank, setBank] = useState("");
  const [routing, setRouting] = useState("");
  const [account, setAccount] = useState("");
  const [subtype, setSubtype] = useState("checking");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const routingOk = validRouting(routing);
  const accountOk = /^\d{4,17}$/.test(account);
  const valid = bank.trim().length > 1 && routingOk && accountOk;

  const save = async () => {
    setBusy(true);
    setError(null);
    try {
      await onSave({ institution: bank.trim(), name: subtype === "savings" ? "Savings" : "Checking", mask: account.slice(-4), subtype, source: "manual" });
      setBank("");
      setRouting("");
      setAccount("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Couldn't save the account.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Add bank account"
      description="Test mode: we check the details, then keep only the bank name and last four digits."
      footer={
        <>
          <Button variant="ghost" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={save} loading={busy} disabled={!valid} icon={<Building2 className="h-4 w-4" />}>
            Add account
          </Button>
        </>
      }
    >
      <div className="space-y-4">
        {error && <Banner tone="danger">{error}</Banner>}
        <Field label="Bank name">
          <Input value={bank} onChange={(e) => setBank(e.target.value)} placeholder="e.g. First Federal" />
        </Field>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Routing number" error={routing.length === 9 && !routingOk ? "That routing number isn't valid." : null}>
            <Input inputMode="numeric" maxLength={9} value={routing} onChange={(e) => setRouting(e.target.value.replace(/\D/g, ""))} placeholder="9 digits" />
          </Field>
          <Field label="Account number">
            <Input inputMode="numeric" maxLength={17} value={account} onChange={(e) => setAccount(e.target.value.replace(/\D/g, ""))} placeholder="Account number" />
          </Field>
        </div>
        <Field label="Account type">
          <Select value={subtype} onChange={(e) => setSubtype(e.target.value)}>
            <option value="checking">Checking</option>
            <option value="savings">Savings</option>
          </Select>
        </Field>
      </div>
    </Modal>
  );
}
