"use client";

import { useState } from "react";
import { KeyRound, Landmark, ShieldCheck, Trash2 } from "lucide-react";
import { Button, Card, CardHeader, Field, Input, PageHeader, Row, useAction, useToast } from "@/components/ui";
import { BankConnect } from "@/components/BankConnect";
import { addBankAccounts, removeBankAccount, saveProfile } from "@/lib/actions";
import { C, col, useLive, where } from "@/lib/db";
import { resetPasswordWithFirebase } from "@/lib/firebaseAuth";
import { useSession } from "@/lib/session";
import { bankLabel, dateLong } from "@/lib/format";
import type { BankAccount, Profile } from "@/lib/types";

export default function BrandAccount() {
  const { profile } = useSession();
  if (!profile) return null;
  return <Account profile={profile} />;
}

function Account({ profile }: { profile: Profile }) {
  const toast = useToast();
  const { busy, run } = useAction();
  const [name, setName] = useState(profile.fullName);
  const [company, setCompany] = useState(profile.workspaceName);
  const [phone, setPhone] = useState(profile.phone ?? "");
  const banks = useLive<BankAccount>(`banks:${profile.uid}`, () => col(C.bankAccounts, where("ownerId", "==", profile.uid)));
  const dirty = name !== profile.fullName || company !== profile.workspaceName || phone !== (profile.phone ?? "");

  return (
    <div>
      <PageHeader title="Account" subtitle="One email, one login — you're the billing contact for your company." />
      <div className="grid gap-6 lg:grid-cols-[1fr_340px]">
        <div className="space-y-6">
          <Card>
            <CardHeader title="Billing contact" />
            <div className="grid gap-4 p-5 sm:grid-cols-2">
              <Field label="Your name">
                <Input value={name} onChange={(e) => setName(e.target.value)} />
              </Field>
              <Field label="Company">
                <Input value={company} onChange={(e) => setCompany(e.target.value)} />
              </Field>
              <Field label="Email" hint="Agencies send payment requests to this address.">
                <Input value={profile.email} disabled />
              </Field>
              <Field label="Phone">
                <Input value={phone} onChange={(e) => setPhone(e.target.value)} />
              </Field>
            </div>
            <div className="flex justify-end border-t border-line px-5 py-4">
              <Button
                disabled={!dirty || name.trim().length < 2}
                loading={busy === "save"}
                onClick={() =>
                  run("save", async () => {
                    await saveProfile(profile.uid, { fullName: name.trim(), workspaceName: company.trim(), phone: phone.trim() });
                    toast("Saved");
                  })
                }
              >
                Save
              </Button>
            </div>
          </Card>

          <Card>
            <CardHeader title="Bank accounts" hint="Saved for faster checkout. We store only the bank name and last four digits." />
            <ul className="divide-y divide-line">
              {banks.data.map((a) => (
                <li key={a.id} className="flex items-center gap-3 px-5 py-3.5">
                  <Landmark className="h-4 w-4 text-ink/50" />
                  <span className="flex-1 text-sm font-medium text-ink">{bankLabel(a)}</span>
                  <button
                    aria-label={`Remove ${bankLabel(a)}`}
                    onClick={() => run(a.id, () => removeBankAccount(banks.data, a))}
                    className="flex h-8 w-8 items-center justify-center rounded-full text-ink/40 hover:bg-rose-50 hover:text-rose-600"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </li>
              ))}
            </ul>
            <div className="border-t border-line px-5 py-4">
              <BankConnect
                variant="secondary"
                label="Add bank account"
                onAccounts={async (inputs) => {
                  const r = await addBankAccounts({ type: "user", id: profile.uid }, inputs, banks.data);
                  toast(r.added ? "Bank account added" : "That account is already saved", r.added ? "success" : "info");
                }}
              />
            </div>
          </Card>
        </div>

        <Card className="h-fit p-5">
          <div className="flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-50 text-emerald-600">
              <ShieldCheck className="h-5 w-5" />
            </span>
            <p className="text-sm font-semibold text-ink">Sign-in & security</p>
          </div>
          <p className="mt-3 text-sm text-muted">You stay signed in on this device, so there&apos;s no code to enter every time you pay. Signing in somewhere new asks for your password.</p>
          <div className="mt-4 border-t border-line pt-3">
            <Row label="Member since">{dateLong(Date.parse(profile.createdAt))}</Row>
            <Row label="Account ID">{profile.agencyId}</Row>
          </div>
          <Button
            variant="secondary"
            className="mt-4 w-full"
            icon={<KeyRound className="h-4 w-4" />}
            loading={busy === "reset"}
            onClick={() =>
              run("reset", async () => {
                await resetPasswordWithFirebase(profile.email);
                toast(`Password reset link sent to ${profile.email}`);
              })
            }
          >
            Change password
          </Button>
        </Card>
      </div>
    </div>
  );
}
