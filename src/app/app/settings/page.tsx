"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Building2, KeyRound, Landmark, Lock, LogOut, Trash2 } from "lucide-react";
import { Button, CopyButton, Field, Input, Toggle, useAction, useToast } from "@/components/ui";
import { BankConnect } from "@/components/BankConnect";
import { Section } from "@/components/talent";
import { useTalent } from "@/lib/talent";
import { addBankAccounts, inviteAgency, removeBankAccount, savePrefs, saveProfile } from "@/lib/actions";
import { logoutWithFirebase, resetPasswordWithFirebase } from "@/lib/firebaseAuth";
import { bankLabel, isEmail } from "@/lib/format";
import type { NotificationPrefs } from "@/lib/types";

const DEFAULT_PREFS: NotificationPrefs = { payments: true, requests: true, product: false };

export default function TalentSettings() {
  const { profile, banks } = useTalent();
  const router = useRouter();
  const toast = useToast();
  const { busy, run } = useAction();
  const [name, setName] = useState(profile.fullName);
  const [phone, setPhone] = useState(profile.phone ?? "");
  const [agency, setAgency] = useState("");
  const [agencyEmail, setAgencyEmail] = useState("");
  const prefs = { ...DEFAULT_PREFS, ...profile.prefs };
  const dirty = name !== profile.fullName || phone !== (profile.phone ?? "");

  const setPref = (key: keyof NotificationPrefs) => (on: boolean) => run(`pref-${key}`, () => savePrefs(profile.uid, { ...prefs, [key]: on }));

  return (
    <div>
      <h1 className="mt-2 text-2xl font-semibold tracking-tight text-ink">Settings</h1>

      <Section title="Profile">
        <div className="space-y-3 rounded-2xl border border-line bg-white p-4">
          <Field label="Name">
            <Input value={name} onChange={(e) => setName(e.target.value)} />
          </Field>
          <Field label="Mobile" hint="For payment invitations by SMS.">
            <Input type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} />
          </Field>
          <Field label="Email" hint="Agencies pay you at this address.">
            <Input value={profile.email} disabled />
          </Field>
          <Button
            className="w-full"
            disabled={!dirty || name.trim().length < 2}
            loading={busy === "profile"}
            onClick={() =>
              run("profile", async () => {
                await saveProfile(profile.uid, { fullName: name.trim(), workspaceName: name.trim(), phone: phone.trim() });
                toast("Profile saved");
              })
            }
          >
            Save
          </Button>
        </div>
      </Section>

      <Section title="Wallet ID">
        <div className="flex items-center gap-3 rounded-2xl border border-line bg-white p-4">
          <span className="flex-1">
            <span className="font-display block text-lg font-semibold text-ink">{profile.handle ? `@${profile.handle}` : "—"}</span>
            <span className="block text-xs text-muted">Share it so other creatives on AGNCY can send you money.</span>
          </span>
          {profile.handle && <CopyButton value={`@${profile.handle}`} label="Copy" />}
        </div>
      </Section>

      <Section title="Linked banks">
        <div className="rounded-2xl border border-line bg-white">
          {banks.length > 0 && (
            <ul className="divide-y divide-line">
              {banks.map((b) => (
                <li key={b.id} className="flex items-center gap-3 px-4 py-3">
                  <Landmark className="h-4 w-4 text-ink/50" />
                  <span className="flex-1 text-sm font-medium text-ink">{bankLabel(b)}</span>
                  <button aria-label={`Remove ${bankLabel(b)}`} onClick={() => run(b.id, () => removeBankAccount(banks, b))} className="flex h-8 w-8 items-center justify-center rounded-full text-ink/40 hover:bg-rose-50 hover:text-rose-600">
                    <Trash2 className="h-4 w-4" />
                  </button>
                </li>
              ))}
            </ul>
          )}
          <div className={banks.length ? "border-t border-line p-4" : "p-4"}>
            <BankConnect
              size="sm"
              variant="secondary"
              label={banks.length ? "Link another bank" : "Link a bank"}
              onAccounts={async (inputs) => {
                const r = await addBankAccounts({ type: "user", id: profile.uid }, inputs, banks);
                toast(r.added ? "Bank linked" : "That bank is already linked", r.added ? "success" : "info");
              }}
            />
          </div>
        </div>
      </Section>

      <Section title="Notifications">
        <ul className="divide-y divide-line rounded-2xl border border-line bg-white">
          {(
            [
              ["payments", "Payments", "When you're paid, or money moves"],
              ["requests", "Jobs & requests", "New bookings and when you can request payment"],
              ["product", "News from AGNCY", "Product updates, occasionally"],
            ] as const
          ).map(([key, label, hint]) => (
            <li key={key} className="flex items-center gap-3 px-4 py-3.5">
              <span className="flex-1">
                <span className="block text-sm font-medium text-ink">{label}</span>
                <span className="block text-xs text-muted">{hint}</span>
              </span>
              <Toggle label={label} checked={prefs[key]} disabled={busy === `pref-${key}`} onChange={setPref(key)} />
            </li>
          ))}
          <li className="flex items-center gap-3 px-4 py-3.5">
            <span className="flex-1">
              <span className="block text-sm font-medium text-ink">Security & account notices</span>
              <span className="block text-xs text-muted">Sign-ins, card changes and required regulatory notices are always sent.</span>
            </span>
            <Lock className="h-4 w-4 text-ink/40" aria-label="Always on" />
          </li>
        </ul>
      </Section>

      <Section title="Invite an agency">
        <div className="space-y-3 rounded-2xl border border-line bg-white p-4">
          <p className="text-sm text-muted">Work with an agency that isn&apos;t on AGNCY yet? Invite them so all your income lands in one place.</p>
          <Field label="Agency name">
            <Input value={agency} onChange={(e) => setAgency(e.target.value)} />
          </Field>
          <Field label="Their email">
            <Input type="email" value={agencyEmail} onChange={(e) => setAgencyEmail(e.target.value)} placeholder="payments@agency.com" />
          </Field>
          <Button
            className="w-full"
            variant="secondary"
            icon={<Building2 className="h-4 w-4" />}
            disabled={!isEmail(agencyEmail) || !agency.trim()}
            loading={busy === "invite"}
            onClick={() =>
              run("invite", async () => {
                await inviteAgency(profile, agency, agencyEmail);
                toast(`Invitation sent to ${agency.trim()}`);
                setAgency("");
                setAgencyEmail("");
              })
            }
          >
            Send invitation
          </Button>
        </div>
      </Section>

      <Section title="Account">
        <div className="grid grid-cols-2 gap-2">
          <Button
            variant="secondary"
            icon={<KeyRound className="h-4 w-4" />}
            loading={busy === "reset"}
            onClick={() =>
              run("reset", async () => {
                await resetPasswordWithFirebase(profile.email);
                toast(`Reset link sent to ${profile.email}`);
              })
            }
          >
            Change password
          </Button>
          <Button
            variant="secondary"
            icon={<LogOut className="h-4 w-4" />}
            onClick={async () => {
              await logoutWithFirebase().catch(() => {});
              router.replace("/auth/login");
            }}
          >
            Sign out
          </Button>
        </div>
      </Section>
    </div>
  );
}
