"use client";

import { useMemo, useState } from "react";
import { Search, Users } from "lucide-react";
import { Avatar, Card, EmptyState, Input, LinkButton, Modal, PageHeader, Pill, Row, SkeletonRows, Tabs, cx } from "@/components/ui";
import { InvoicePill, StagePill } from "@/components/status";
import { useAgency } from "@/lib/agency";
import { providerName } from "@/lib/actions";
import { toProfile } from "@/lib/profile";
import { C, col, useLive, useNow, useOnce, where } from "@/lib/db";
import { mutualAgencies } from "@/lib/domain";
import { dateShort, money, plural } from "@/lib/format";
import type { Allocation, Contact, Profile } from "@/lib/types";

type Kind = "all" | Contact["kind"];
type View = "agncy" | "invite" | "all";

const KIND_LABEL: Record<Contact["kind"], string> = { talent: "Talent", agency: "Agencies", brand: "Brands" };
const KINDS: Contact["kind"][] = ["talent", "agency", "brand"];
const ACCOUNT_LABEL: Record<Contact["kind"], string> = { talent: "Talent", agency: "Agency", brand: "Brand" };

const kindOfUser = (u: Profile): Contact["kind"] => (u.accountType === "individual" ? "talent" : u.accountType);

/** One row in the list: a CRM contact, an AGNCY account, or both when the emails match. */
interface Entry {
  id: string;
  name: string;
  /** Second line. Email is shown only for people in this agency's own CRM. */
  sub: string;
  email: string;
  kind: Contact["kind"];
  user?: Profile;
  contact?: Contact;
}

export default function ContactsPage() {
  const { org, invoices, allocations } = useAgency();
  const contacts = useLive<Contact>(`contacts:${org.id}`, () => col(C.contacts, where("orgId", "==", org.id)));
  // The AGNCY directory: every account on the platform. Read once per visit — a live listener on
  // every user would re-download the directory on each sign-up anywhere.
  const directory = useOnce<Record<string, unknown> & { id: string }>("users:all", () => col(C.users));
  const [chosenView, setView] = useState<View | null>(null);
  const [kind, setKind] = useState<Kind>("all");
  const [q, setQ] = useState("");
  const [openId, setOpenId] = useState<string | null>(null);
  const loading = contacts.loading || directory.loading;

  const { accounts, byEmail } = useMemo(() => {
    const byEmail = new Map<string, Profile>();
    const accounts: Profile[] = [];
    const orgsSeen = new Set<string>();
    for (const d of directory.data) {
      const u = toProfile(d.id, d);
      if (u.email) byEmail.set(u.email, u);
      // Leave out this agency's own team, and list each other agency once rather than per team member.
      if (org.memberUids.includes(u.uid) || u.orgId === org.id) continue;
      if (u.accountType === "agency") {
        const key = u.orgId || u.uid;
        if (orgsSeen.has(key)) continue;
        orgsSeen.add(key);
      }
      accounts.push(u);
    }
    return { accounts, byEmail };
  }, [directory.data, org.id, org.memberUids]);

  const activity = useMemo(() => {
    const m = new Map<string, { paid: number; open: number; count: number; currency: string }>();
    const add = (email: string, paid: number, open: number, currency: string) => {
      const cur = m.get(email) ?? { paid: 0, open: 0, count: 0, currency };
      m.set(email, { paid: cur.paid + paid, open: cur.open + open, count: cur.count + 1, currency });
    };
    for (const a of allocations) if (a.recipientEmail) add(a.recipientEmail, a.status === "paid" ? a.net : 0, a.status === "paid" ? 0 : a.net, a.currency);
    for (const i of invoices) if (i.brandEmail && i.status !== "void") add(i.brandEmail, i.status === "paid" ? i.amount : 0, i.status === "paid" ? 0 : i.amount, i.currency);
    return m;
  }, [allocations, invoices]);

  const { agncyEntries, crmEntries } = useMemo(() => {
    const contactByEmail = new Map(contacts.data.filter((c) => c.email).map((c) => [c.email, c]));
    const agncyEntries: Entry[] = accounts.map((u) => {
      const contact = contactByEmail.get(u.email);
      const business = u.accountType !== "individual" && u.workspaceName;
      return {
        id: `user:${u.uid}`,
        name: business || u.fullName || contact?.name || "AGNCY member",
        sub: [business ? u.fullName : "", u.handle ? `@${u.handle}` : "", contact ? u.email : ""].filter(Boolean).join(" · "),
        email: u.email,
        kind: kindOfUser(u),
        user: u,
        contact,
      };
    });
    const crmEntries: Entry[] = contacts.data.map((c) => {
      const user = c.email ? byEmail.get(c.email) : undefined;
      return { id: c.id, name: c.name, sub: [c.email || "No email in CRM", user?.handle ? `@${user.handle}` : ""].filter(Boolean).join(" · "), email: c.email, kind: c.kind, user, contact: c };
    });
    return { agncyEntries, crmEntries };
  }, [accounts, byEmail, contacts.data]);

  const notYet = crmEntries.filter((e) => !e.user);
  // Open on the accounts view when there is something in it; otherwise the CRM list.
  const view: View = chosenView ?? (agncyEntries.length > 0 ? "agncy" : "all");
  const inView = view === "agncy" ? agncyEntries : view === "invite" ? notYet : crmEntries;
  const search = q.trim().toLowerCase();
  const list = inView.filter((e) => (kind === "all" || e.kind === kind) && (!search || `${e.name} ${e.sub}`.toLowerCase().includes(search))).sort((a, b) => a.name.localeCompare(b.name));
  const count = (k: Contact["kind"]) => inView.filter((e) => e.kind === k).length;
  const opened = [...agncyEntries, ...crmEntries].find((e) => e.id === openId) ?? null;
  const source = org.crm.provider ? providerName(org.crm.provider) : "your CRM";

  const views: { id: View; label: string; hint: string; n: number }[] = [
    { id: "agncy", label: "On AGNCY", hint: "Every talent, agency and brand with an account", n: agncyEntries.length },
    { id: "invite", label: "Not on AGNCY yet", hint: "CRM contacts paid with Send & Invite", n: notYet.length },
    { id: "all", label: "All CRM contacts", hint: `Everyone synced from ${source}`, n: crmEntries.length },
  ];

  const row = (e: Entry) => {
    const act = e.email ? activity.get(e.email) : undefined;
    return (
      <li key={e.id}>
        <button onClick={() => setOpenId(e.id)} className="flex w-full items-center gap-3 px-5 py-3.5 text-left hover:bg-paper/60">
          <Avatar name={e.name} size={36} />
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium text-ink">{e.name}</p>
            <p className="truncate text-xs text-muted">{e.sub || `${ACCOUNT_LABEL[e.kind]} on AGNCY`}</p>
          </div>
          {view === "agncy" ? (
            <>
              {e.contact && <Pill className="hidden sm:inline-flex">In your CRM</Pill>}
              <Pill tone="green" dot>
                {ACCOUNT_LABEL[e.kind]} account
              </Pill>
            </>
          ) : (
            <>
              <Pill className="hidden capitalize sm:inline-flex">{e.kind}</Pill>
              {e.user ? <Pill tone="green" dot>On AGNCY</Pill> : <Pill>Not on AGNCY</Pill>}
            </>
          )}
          <span className="tabular hidden w-28 text-right text-sm text-ink md:block">{act ? money(act.paid + act.open, act.currency) : "—"}</span>
        </button>
      </li>
    );
  };

  return (
    <div>
      <PageHeader title="Contacts" subtitle={`Everyone on AGNCY, alongside the contacts synced from ${source}.`} />
      <div role="tablist" aria-label="Contact views" className="mb-4 grid gap-3 sm:grid-cols-3">
        {views.map((v) => {
          const active = v.id === view;
          return (
            <button
              key={v.id}
              role="tab"
              aria-selected={active}
              onClick={() => {
                setView(v.id);
                setKind("all");
              }}
              className={cx("rounded-2xl border p-4 text-left transition-colors", active ? "border-ink bg-white ring-1 ring-ink" : "border-line bg-white/60 hover:border-ink/30")}
            >
              <span className="flex items-center justify-between gap-2">
                <span className="text-sm font-medium text-ink">{v.label}</span>
                {v.id === "agncy" && <span className="h-2 w-2 rounded-full bg-emerald-500" />}
              </span>
              <span className="font-display tabular mt-1 block text-2xl font-semibold text-ink">{loading ? "–" : v.n}</span>
              <span className="mt-0.5 block text-xs text-muted">{v.hint}</span>
            </button>
          );
        })}
      </div>
      <Card>
        <div className="flex flex-wrap items-center gap-3 border-b border-line px-4 py-3">
          <Tabs value={kind} onChange={setKind} tabs={[{ id: "all", label: "All", count: inView.length }, ...KINDS.map((k) => ({ id: k, label: KIND_LABEL[k], count: count(k) }))]} />
          <div className="relative ml-auto w-full sm:w-64">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink/35" />
            <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder={view === "agncy" ? "Search by name or Wallet ID" : "Search contacts"} className="h-9 pl-9" aria-label="Search contacts" />
          </div>
        </div>
        {loading ? (
          <SkeletonRows rows={6} />
        ) : list.length === 0 ? (
          search ? (
            <EmptyState icon={<Users className="h-5 w-5" />} title="No matches" body="Try a different search." />
          ) : view === "agncy" ? (
            <EmptyState icon={<Users className="h-5 w-5" />} title="No accounts here yet" body="Talent, agencies and brands appear here as soon as they create an AGNCY account." />
          ) : !org.crm.provider && crmEntries.length === 0 ? (
            <EmptyState icon={<Users className="h-5 w-5" />} title="Connect your CRM to see contacts" body="Talent, partner agencies and brands sync automatically." action={<LinkButton href="/agency/settings?tab=crm">Connect CRM</LinkButton>} />
          ) : (
            <EmptyState icon={<Users className="h-5 w-5" />} title={view === "invite" ? "Everyone here is on AGNCY" : "No contacts"} body="Nothing in this group yet." />
          )
        ) : view === "agncy" && kind === "all" ? (
          // Accounts view: one section per AGNCY account type.
          KINDS.filter((k) => list.some((e) => e.kind === k)).map((k) => {
            const group = list.filter((e) => e.kind === k);
            return (
              <section key={k} className="border-b border-line last:border-b-0">
                <h2 className="flex items-center gap-2 bg-paper/60 px-5 py-2 text-xs font-medium uppercase tracking-wider text-muted">
                  {KIND_LABEL[k]}
                  <span className="tabular rounded-full bg-ink/8 px-1.5 text-[11px] leading-[18px] text-ink/60">{group.length}</span>
                </h2>
                <ul className="divide-y divide-line">{group.map(row)}</ul>
              </section>
            );
          })
        ) : (
          <ul className="divide-y divide-line">{list.map(row)}</ul>
        )}
      </Card>
      <ContactDrawer entry={opened} onClose={() => setOpenId(null)} />
    </div>
  );
}

function ContactDrawer({ entry, onClose }: { entry: Entry | null; onClose: () => void }) {
  // An AGNCY account that isn't in this agency's CRM still gets the same detail view.
  const contact: Contact | null = entry ? entry.contact ?? { id: entry.id, orgId: "", crmId: "", name: entry.name, email: entry.email, phone: "", kind: entry.kind, updatedAt: 0 } : null;
  return (
    <Modal open={!!entry} onClose={onClose} variant="drawer" title={entry?.name ?? ""} description={entry ? `${ACCOUNT_LABEL[entry.kind]} · ${entry.contact ? "from your CRM" : "AGNCY account"}` : undefined}>
      {entry && contact && <ContactBody key={entry.id} contact={contact} user={entry.user} inCrm={!!entry.contact} />}
    </Modal>
  );
}

function ContactBody({ contact, user, inCrm }: { contact: Contact; user?: Profile; inCrm: boolean }) {
  const { org, invoices, allocations } = useAgency();
  const now = useNow();
  const theirs = allocations.filter((a) => a.recipientEmail === contact.email).sort((a, b) => b.updatedAt - a.updatedAt);
  const billed = invoices.filter((i) => i.brandEmail === contact.email && i.status !== "void");
  // Every allocation to this person, across agencies, reveals shared talent relationships.
  const everywhere = useLive<Allocation>(contact.kind !== "brand" && contact.email ? `alloc:to:${contact.email}` : null, () => col(C.allocations, where("recipientEmail", "==", contact.email)));
  const mutual = mutualAgencies(everywhere.data, org.id);

  return (
    <div className="space-y-6">
      <section className="rounded-2xl border border-line px-4 py-2">
        {inCrm ? (
          <>
            <Row label="Email">{contact.email || "—"}</Row>
            <Row label="Phone">{contact.phone || "—"}</Row>
          </>
        ) : (
          <Row label="In your CRM">
            <span className="text-muted">No — add them in your CRM to send requests or payouts</span>
          </Row>
        )}
        <Row label="AGNCY account">
          {user ? (
            <span className="inline-flex items-center gap-2">
              <Pill tone="green" dot>
                {user.accountType === "individual" ? "Talent" : user.accountType === "agency" ? "Agency" : "Brand"}
              </Pill>
              {user.handle && <span className="text-muted">@{user.handle}</span>}
            </span>
          ) : (
            <span className="text-muted">Not on AGNCY — payouts go out with Send & Invite</span>
          )}
        </Row>
        {user && <Row label="Joined">{dateShort(Date.parse(user.createdAt))}</Row>}
      </section>

      {contact.kind === "brand" ? (
        <section>
          <p className="mb-2 text-xs font-medium uppercase tracking-wider text-muted">Payment requests</p>
          {billed.length === 0 ? (
            <p className="text-sm text-muted">No invoices to this billing email.</p>
          ) : (
            <ul className="divide-y divide-line rounded-2xl border border-line">
              {billed.map((i) => (
                <li key={i.id} className="flex items-center gap-3 px-4 py-2.5 text-sm">
                  <span className="min-w-0 flex-1 truncate text-ink">
                    {i.number} · {i.description}
                  </span>
                  <InvoicePill invoice={i} now={now} />
                  <span className="tabular w-20 text-right">{money(i.amount, i.currency)}</span>
                </li>
              ))}
            </ul>
          )}
        </section>
      ) : (
        <>
          <section>
            <p className="mb-2 text-xs font-medium uppercase tracking-wider text-muted">Payment activity with {org.name}</p>
            {theirs.length === 0 ? (
              <p className="text-sm text-muted">No allocations yet.</p>
            ) : (
              <ul className="divide-y divide-line rounded-2xl border border-line">
                {theirs.map((a) => (
                  <li key={a.id} className="flex items-center gap-3 px-4 py-2.5 text-sm">
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-ink">{a.description}</span>
                      <span className="block text-xs text-muted">
                        {a.invoiceNumber} · {a.brandName}
                      </span>
                    </span>
                    <StagePill allocation={a} />
                    <span className="tabular w-20 text-right">{money(a.net, a.currency)}</span>
                  </li>
                ))}
              </ul>
            )}
          </section>
          <section>
            <p className="mb-2 text-xs font-medium uppercase tracking-wider text-muted">Mutual connections</p>
            {mutual.length === 0 ? (
              <p className="text-sm text-muted">{everywhere.loading ? "Looking…" : "No other agencies on AGNCY book this contact yet."}</p>
            ) : (
              <ul className="space-y-2">
                {mutual.map((m) => (
                  <li key={m.orgId} className={cx("flex items-center gap-3 rounded-2xl border border-line px-4 py-2.5")}>
                    <Avatar name={m.orgName} size={30} />
                    <span className="flex-1 text-sm font-medium text-ink">{m.orgName}</span>
                    <span className="text-xs text-muted">{plural(m.bookings, "shared booking")}</span>
                  </li>
                ))}
              </ul>
            )}
          </section>
        </>
      )}
    </div>
  );
}
