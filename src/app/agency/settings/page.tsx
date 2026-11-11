"use client";

import { Suspense, useEffect, useRef, useState } from "react";
import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";
import { BadgeCheck, FlaskConical, Landmark, Link2, Plug, Trash2, UserPlus, Users } from "lucide-react";
import { Avatar, Banner, Button, Card, CardHeader, EmptyState, Field, Input, PageHeader, Pill, Splash, Tabs, useAction, useToast } from "@/components/ui";
import { BankConnect } from "@/components/BankConnect";
import { Confirm } from "@/components/Confirm";
import { useAgency } from "@/lib/agency";
import {
  addBankAccounts,
  connectCrm,
  disconnectCrm,
  inviteTeamMember,
  lookupUsers,
  providerName,
  removeBankAccount,
  revokeInvite,
  removeTeamMember,
  saveBusiness,
  saveSandboxRecipients,
  setDefaultAccount,
  verifyBusiness,
} from "@/lib/actions";
import { C, col, useLive, useNow, where } from "@/lib/db";
import { hashOf } from "@/lib/domain";
import { bankLabel, dateShort, isEmail, relTime } from "@/lib/format";
import type { BankAccount, CrmProvider, Invite, Profile } from "@/lib/types";

type TabId = "business" | "banks" | "crm" | "team";
const TABS: TabId[] = ["business", "banks", "crm", "team"];

export default function SettingsPage() {
  return (
    <Suspense fallback={<Splash />}>
      <Settings />
    </Suspense>
  );
}

function Settings() {
  const router = useRouter();
  const params = useSearchParams();
  const raw = params.get("tab") as TabId | null;
  const oauth = params.get("qb_connected") || params.get("xero_connected") || params.get("qb_error") || params.get("xero_error");
  const tab: TabId = oauth ? "crm" : raw && TABS.includes(raw) ? raw : "business";
  const { org } = useAgency();
  return (
    <div>
      <PageHeader title="Settings" subtitle="Your business account, bank accounts, CRM connection and team." />
      <Tabs
        className="mb-6"
        value={tab}
        onChange={(id) => router.replace(`/agency/settings?tab=${id}`, { scroll: false })}
        tabs={[
          { id: "business", label: "Business" },
          { id: "banks", label: "Bank accounts" },
          { id: "crm", label: "CRM" },
          { id: "team", label: "Team" },
        ]}
      />
      {tab === "business" && <Business key={hashOf(org.business)} />}
      {tab === "banks" && <Banks />}
      {tab === "crm" && <Crm />}
      {tab === "team" && <Team />}
    </div>
  );
}

/* --------------------------------------------------------------- business */

function Business() {
  const { org, actor } = useAgency();
  const toast = useToast();
  const { busy, run } = useAction();
  const [form, setForm] = useState({ ...org.business });
  const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement>) => setForm((f) => ({ ...f, [k]: e.target.value }));
  const dirty = (["legalName", "taxId", "address", "website", "phone"] as const).some((k) => form[k] !== org.business[k]);
  const verified = org.verification.status === "verified";
  const complete = !!form.legalName.trim() && !!form.address.trim();

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
      <Card>
        <CardHeader
          title="Business details"
          hint={org.business.source === "crm" ? `Prefilled from ${providerName(org.crm.provider)} — edit anything that's out of date.` : "Connect your CRM to prefill these automatically."}
          action={org.business.source === "crm" ? <Pill tone="blue">From CRM</Pill> : undefined}
        />
        <div className="grid gap-4 p-5 sm:grid-cols-2">
          <Field label="Legal business name" className="sm:col-span-2">
            <Input value={form.legalName} onChange={set("legalName")} />
          </Field>
          <Field label="Tax ID (EIN)" hint="We keep only the last four digits.">
            <Input value={form.taxId ? `•••••${form.taxId}` : ""} onChange={(e) => setForm((f) => ({ ...f, taxId: e.target.value.replace(/\D/g, "").slice(-4) }))} placeholder="XX-XXXXXXX" />
          </Field>
          <Field label="Phone">
            <Input value={form.phone} onChange={set("phone")} />
          </Field>
          <Field label="Business address" className="sm:col-span-2">
            <Input value={form.address} onChange={set("address")} />
          </Field>
          <Field label="Website" className="sm:col-span-2">
            <Input value={form.website} onChange={set("website")} placeholder="https://" />
          </Field>
        </div>
        <div className="flex justify-end border-t border-line px-5 py-4">
          <Button
            disabled={!dirty}
            loading={busy === "save"}
            onClick={() =>
              run("save", async () => {
                await saveBusiness(org, form, actor);
                toast("Business details saved");
              })
            }
          >
            Save changes
          </Button>
        </div>
      </Card>

      <Card className="h-fit p-5">
        <div className="flex items-center gap-3">
          <span className={verified ? "flex h-10 w-10 items-center justify-center rounded-full bg-emerald-50 text-emerald-600" : "flex h-10 w-10 items-center justify-center rounded-full bg-amber-50 text-amber-600"}>
            <BadgeCheck className="h-5 w-5" />
          </span>
          <div>
            <p className="text-sm font-semibold text-ink">{verified ? "Business verified" : "Verification needed"}</p>
            <p className="text-xs text-muted">{verified ? `Verified ${dateShort(org.verification.verifiedAt)}` : "Required before sending payouts"}</p>
          </div>
        </div>
        {!verified && (
          <>
            <p className="mt-4 text-sm text-muted">We verify using the details on the left. Our payment partner only asks for more if they need it.</p>
            <Button
              className="mt-4 w-full"
              disabled={!complete || dirty}
              loading={busy === "verify"}
              onClick={() =>
                run("verify", async () => {
                  await verifyBusiness(org, actor);
                  toast("Business verified");
                })
              }
            >
              Verify business
            </Button>
            <p className="mt-2 text-center text-[11px] text-muted">{dirty ? "Save your changes first." : !complete ? "Add a legal name and address first." : "Test mode approves instantly."}</p>
          </>
        )}
      </Card>
    </div>
  );
}

/* ------------------------------------------------------------------ banks */

function Banks() {
  const { org, accounts, actor } = useAgency();
  const toast = useToast();
  const { busy, run } = useAction();
  const [removing, setRemoving] = useState<BankAccount | null>(null);

  return (
    <Card>
      <CardHeader
        title="Bank accounts"
        hint="Brand payments settle to your receiving account; payouts are funded from your funding account. One account can do both — connect it once."
      />
      {accounts.length === 0 ? (
        <EmptyState icon={<Landmark className="h-5 w-5" />} title="No bank accounts yet" body="AGNCY doesn't hold your money — connect the business account you already use." />
      ) : (
        <ul className="divide-y divide-line">
          {accounts.map((a) => (
            <li key={a.id} className="flex flex-wrap items-center gap-3 px-5 py-4">
              <span className="flex h-10 w-10 items-center justify-center rounded-xl border border-line bg-paper text-ink/60">
                <Landmark className="h-4 w-4" />
              </span>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium text-ink">{bankLabel(a)}</p>
                <p className="text-xs capitalize text-muted">
                  {a.name} · {a.subtype} · {a.source === "plaid" ? "Connected with Plaid" : "Entered manually"}
                </p>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                {a.receiving ? (
                  <Pill tone="green">Default receiving</Pill>
                ) : (
                  <Button size="sm" variant="ghost" loading={busy === `r${a.id}`} onClick={() => run(`r${a.id}`, () => setDefaultAccount(accounts, a.id, "receiving"))}>
                    Use for receiving
                  </Button>
                )}
                {a.funding ? (
                  <Pill tone="blue">Default funding</Pill>
                ) : (
                  <Button size="sm" variant="ghost" loading={busy === `f${a.id}`} onClick={() => run(`f${a.id}`, () => setDefaultAccount(accounts, a.id, "funding"))}>
                    Use for funding
                  </Button>
                )}
                <button onClick={() => setRemoving(a)} aria-label={`Remove ${bankLabel(a)}`} className="flex h-8 w-8 items-center justify-center rounded-full text-ink/40 hover:bg-rose-50 hover:text-rose-600">
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
      <div className="border-t border-line px-5 py-4">
        <BankConnect
          label={accounts.length ? "Connect another account" : "Connect bank account"}
          variant={accounts.length ? "secondary" : "primary"}
          onAccounts={async (inputs) => {
            const r = await addBankAccounts({ type: "org", id: org.id }, inputs, accounts, actor);
            if (r.added) toast(`${r.added === 1 ? "Account" : `${r.added} accounts`} connected`);
            if (r.duplicates) toast(`${r.duplicates === 1 ? "That account is" : "Some accounts are"} already connected`, "info");
          }}
        />
      </div>
      <Confirm
        open={!!removing}
        danger
        title="Remove this bank account?"
        confirmLabel="Remove"
        body={removing ? `${bankLabel(removing)} will no longer receive payments or fund payouts.${removing.receiving || removing.funding ? " Its default role moves to your next account." : ""} Requests already sent keep settling to the account chosen when they were sent.` : null}
        onConfirm={async () => {
          if (removing) await removeBankAccount(accounts, removing, actor);
          toast("Bank account removed");
        }}
        onClose={() => setRemoving(null)}
      />
    </Card>
  );
}

/* -------------------------------------------------------------------- crm */

const OAUTH: { id: "quickbooks" | "xero"; name: string; logo: string; blurb: string }[] = [
  { id: "quickbooks", name: "QuickBooks Online", logo: "/quickbook.png", blurb: "Invoices, customers and vendors" },
  { id: "xero", name: "Xero", logo: "/xero.png", blurb: "Invoices, contacts and organisation" },
];
const SOON = [
  { name: "Sage", logo: "/sage.png" },
  { name: "NetSuite", logo: "/netsuite.png" },
];

function Crm() {
  const { org, actor } = useAgency();
  const router = useRouter();
  const params = useSearchParams();
  const toast = useToast();
  const now = useNow(30_000);
  const { busy, run } = useAction();
  const [confirmOff, setConfirmOff] = useState(false);
  const handled = useRef(false);

  // OAuth callbacks land here with ?qb_connected=true / ?xero_connected=true (or an error code).
  const qb = params.get("qb_connected");
  const xero = params.get("xero_connected");
  const err = params.get("qb_error") || params.get("xero_error");
  useEffect(() => {
    if (handled.current || (!qb && !xero && !err)) return;
    handled.current = true;
    const provider: CrmProvider | null = qb ? "quickbooks" : xero ? "xero" : null;
    (async () => {
      if (provider) {
        try {
          await connectCrm(org, provider, actor);
          toast(`${providerName(provider)} connected — syncing now`);
        } catch (e) {
          toast(e instanceof Error ? e.message : "Couldn't save the connection.", "error");
        }
      } else {
        toast(`The CRM connection didn't complete (${err}). Please try again.`, "error");
      }
      router.replace("/agency/settings?tab=crm", { scroll: false });
    })();
  }, [qb, xero, err, org, actor, toast, router]);

  const connected = org.crm.provider;

  return (
    <div className="space-y-6">
      {connected ? (
        <Card className="p-5">
          <div className="flex flex-wrap items-center gap-4">
            <span className="flex h-12 w-12 items-center justify-center overflow-hidden rounded-xl border border-line bg-white">
              {connected === "sandbox" ? <FlaskConical className="h-5 w-5 text-ink/60" /> : <Image src={OAUTH.find((o) => o.id === connected)!.logo} alt="" width={40} height={40} className="h-8 w-8 object-contain" />}
            </span>
            <div className="min-w-0 flex-1">
              <p className="text-[15px] font-semibold text-ink">
                {providerName(connected)} connected{org.crm.companyName ? ` · ${org.crm.companyName}` : ""}
              </p>
              <p className="text-sm text-muted">
                Syncs invoices, allocations and contacts automatically · {org.crm.lastSyncAt ? `last synced ${relTime(org.crm.lastSyncAt, now)}` : "first sync running…"}
              </p>
            </div>
            <Button variant="secondary" onClick={() => setConfirmOff(true)}>
              Disconnect
            </Button>
          </div>
          {org.crm.lastSyncError && (
            <Banner tone="warn" title="Last sync failed" className="mt-4" action={connected !== "sandbox" ? <Button size="sm" onClick={() => window.location.assign(`/api/auth/${connected}/connect?returnTo=/agency/settings`)}>Reconnect</Button> : undefined}>
              {org.crm.lastSyncError}
              {connected !== "sandbox" && " The connection lives in the browser that authorised it — reconnect here to sync from this browser."}
            </Banner>
          )}
        </Card>
      ) : (
        <Banner tone="info" title="Connecting a CRM is optional — but it's how AGNCY works best">
          You need it to send brand payment requests and pay out allocations. Without one you can still receive payments and request payment on allocations other agencies owe you.
        </Banner>
      )}

      {connected === "sandbox" && <SandboxRecipients />}

      <Card>
        <CardHeader title={connected ? "Switch CRM" : "Connect a CRM"} hint="One CRM per agency. Invoices and allocations stay in your CRM — AGNCY never edits them." />
        <ul className="divide-y divide-line">
          {OAUTH.map((o) => (
            <li key={o.id} className="flex items-center gap-4 px-5 py-4">
              <Image src={o.logo} alt="" width={40} height={40} className="h-9 w-9 rounded-lg object-contain" />
              <div className="flex-1">
                <p className="text-sm font-medium text-ink">{o.name}</p>
                <p className="text-xs text-muted">{o.blurb}</p>
              </div>
              {connected === o.id ? (
                <Pill tone="green" dot>
                  Connected
                </Pill>
              ) : (
                <Button size="sm" variant="secondary" icon={<Plug className="h-3.5 w-3.5" />} disabled={!!connected} onClick={() => window.location.assign(`/api/auth/${o.id}/connect?returnTo=/agency/settings`)}>
                  Connect
                </Button>
              )}
            </li>
          ))}
          <li className="flex items-center gap-4 px-5 py-4">
            <span className="flex h-9 w-9 items-center justify-center rounded-lg border border-dashed border-ink/25 text-ink/60">
              <FlaskConical className="h-4 w-4" />
            </span>
            <div className="flex-1">
              <p className="text-sm font-medium text-ink">AGNCY Sandbox CRM</p>
              <p className="text-xs text-muted">Fictional bookings for beta testing the full flow — no QuickBooks or Xero account needed.</p>
            </div>
            {connected === "sandbox" ? (
              <Pill tone="green" dot>
                Connected
              </Pill>
            ) : (
              <Button size="sm" variant="secondary" disabled={!!connected} loading={busy === "sbx"} onClick={() => run("sbx", () => connectCrm(org, "sandbox", actor))}>
                Use sandbox
              </Button>
            )}
          </li>
          {SOON.map((s) => (
            <li key={s.name} className="flex items-center gap-4 px-5 py-4 opacity-60">
              <Image src={s.logo} alt="" width={40} height={40} className="h-9 w-9 rounded-lg object-contain grayscale" />
              <p className="flex-1 text-sm font-medium text-ink">{s.name}</p>
              <Pill>Coming soon</Pill>
            </li>
          ))}
        </ul>
        {connected && <p className="border-t border-line px-5 py-3 text-xs text-muted">Disconnect {providerName(connected)} first to switch.</p>}
      </Card>

      <Confirm
        open={confirmOff}
        title={`Disconnect ${providerName(connected)}?`}
        confirmLabel="Disconnect"
        danger
        body="Synced invoices, allocations and history stay in AGNCY, but nothing new comes in and you can't send new payment requests or payouts until a CRM is connected again."
        onConfirm={async () => {
          if (connected === "quickbooks" || connected === "xero") await fetch(`/api/auth/${connected}/disconnect`, { method: "POST" }).catch(() => {});
          await disconnectCrm(org, actor);
          toast("CRM disconnected");
        }}
        onClose={() => setConfirmOff(false)}
      />
    </div>
  );
}

function SandboxRecipients() {
  const { org } = useAgency();
  const toast = useToast();
  const { busy, run } = useAction();
  const [form, setForm] = useState({ brandEmail: org.sandbox?.brandEmail ?? "", talentEmail: org.sandbox?.talentEmail ?? "", partnerEmail: org.sandbox?.partnerEmail ?? "" });
  const valid = Object.values(form).every((v) => !v.trim() || isEmail(v));
  return (
    <Card>
      <CardHeader title="Sandbox test recipients" hint="Optional. Put your own test accounts into the sandbox bookings so you can play every role end to end. Defaults are fictional example.com addresses." />
      <div className="grid gap-4 p-5 sm:grid-cols-3">
        <Field label="Brand billing email" hint="Receives every sandbox payment request">
          <Input type="email" value={form.brandEmail} onChange={(e) => setForm({ ...form, brandEmail: e.target.value })} placeholder="brand@example.com" />
        </Field>
        <Field label="Talent email" hint="Replaces Amara Okafor">
          <Input type="email" value={form.talentEmail} onChange={(e) => setForm({ ...form, talentEmail: e.target.value })} placeholder="talent@example.com" />
        </Field>
        <Field label="Partner agency email" hint="Replaces Parallel Talent Group">
          <Input type="email" value={form.partnerEmail} onChange={(e) => setForm({ ...form, partnerEmail: e.target.value })} placeholder="agency@example.com" />
        </Field>
      </div>
      <div className="flex justify-end border-t border-line px-5 py-4">
        <Button
          disabled={!valid}
          loading={busy === "save"}
          onClick={() =>
            run("save", async () => {
              await saveSandboxRecipients(org, form);
              toast("Saved — the sandbox CRM is re-syncing");
            })
          }
        >
          Save recipients
        </Button>
      </div>
    </Card>
  );
}

/* ------------------------------------------------------------------- team */

function Team() {
  const { org, actor, isOwner, profile } = useAgency();
  const toast = useToast();
  const { busy, run } = useAction();
  const [members, setMembers] = useState<Profile[]>([]);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [removing, setRemoving] = useState<Profile | null>(null);
  const invites = useLive<Invite>(`invites:${org.id}`, () => col(C.invites, where("orgId", "==", org.id)));
  const pending = invites.data.filter((i) => i.kind === "team" && i.status === "pending").sort((a, b) => b.createdAt - a.createdAt);

  const emailsKey = org.emails.join(",");
  useEffect(() => {
    let alive = true;
    lookupUsers(emailsKey.split(","))
      .then((m) => alive && setMembers([...m.values()].filter((p) => org.memberUids.includes(p.uid))))
      .catch(() => {});
    return () => {
      alive = false;
    };
  }, [emailsKey, org.memberUids]);

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_340px]">
      <Card>
        <CardHeader title="Team" hint="Everyone has the same access, including sending payments. Only the owner can invite or remove people." />
        <ul className="divide-y divide-line">
          {members.map((m) => (
            <li key={m.uid} className="flex items-center gap-3 px-5 py-3.5">
              <Avatar name={m.fullName} />
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium text-ink">
                  {m.fullName}
                  {m.uid === profile.uid && <span className="font-normal text-muted"> (you)</span>}
                </p>
                <p className="truncate text-xs text-muted">{m.email}</p>
              </div>
              {m.uid === org.ownerUid ? (
                <Pill tone="ink">Owner</Pill>
              ) : isOwner ? (
                <Button size="sm" variant="ghost" onClick={() => setRemoving(m)}>
                  Remove
                </Button>
              ) : (
                <Pill>Member</Pill>
              )}
            </li>
          ))}
          {pending.map((i) => (
            <li key={i.id} className="flex items-center gap-3 px-5 py-3.5">
              <span className="flex h-9 w-9 items-center justify-center rounded-full border border-dashed border-ink/25 text-ink/40">
                <Link2 className="h-4 w-4" />
              </span>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium text-ink">{i.name || i.email}</p>
                <p className="truncate text-xs text-muted">
                  {i.email} · invited {dateShort(i.createdAt)}
                </p>
              </div>
              <Pill tone="amber">Invited</Pill>
              {isOwner && (
                <Button size="sm" variant="ghost" loading={busy === i.id} onClick={() => run(i.id, () => revokeInvite(i.id))}>
                  Revoke
                </Button>
              )}
            </li>
          ))}
          {members.length === 0 && (
            <li>
              <EmptyState icon={<Users className="h-5 w-5" />} title="Loading team…" />
            </li>
          )}
        </ul>
      </Card>

      {isOwner ? (
        <Card className="h-fit p-5">
          <p className="text-sm font-semibold text-ink">Invite a teammate</p>
          <p className="mt-1 text-xs text-muted">They&apos;ll get an email link to join {org.name}.</p>
          <div className="mt-4 space-y-3">
            <Field label="Name">
              <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Full name" />
            </Field>
            <Field label="Work email">
              <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="name@agency.com" />
            </Field>
            <Button
              className="w-full"
              icon={<UserPlus className="h-4 w-4" />}
              disabled={!isEmail(email)}
              loading={busy === "invite"}
              onClick={() =>
                run("invite", async () => {
                  await inviteTeamMember(org, email, name, actor);
                  toast(`Invitation sent to ${email.trim()}`);
                  setName("");
                  setEmail("");
                })
              }
            >
              Send invitation
            </Button>
          </div>
        </Card>
      ) : (
        <Card className="h-fit p-5 text-sm text-muted">Ask {org.ownerName} to invite or remove teammates.</Card>
      )}

      <Confirm
        open={!!removing}
        danger
        title={`Remove ${removing?.fullName ?? ""}?`}
        confirmLabel="Remove from team"
        body="They lose access to this agency immediately. Payments and payouts they made stay in the history."
        onConfirm={async () => {
          if (removing) await removeTeamMember(org, { uid: removing.uid, email: removing.email, name: removing.fullName }, actor);
          toast("Teammate removed");
        }}
        onClose={() => setRemoving(null)}
      />
    </div>
  );
}
