"use client";

import { useEffect, useMemo, useState } from "react";
import { Search, Users } from "lucide-react";
import { Avatar, Card, EmptyState, Input, LinkButton, Modal, PageHeader, Pill, Row, SkeletonRows, Tabs, cx } from "@/components/ui";
import { InvoicePill, StagePill } from "@/components/status";
import { useAgency } from "@/lib/agency";
import { lookupUsers, providerName } from "@/lib/actions";
import { C, col, useLive, useNow, where } from "@/lib/db";
import { mutualAgencies } from "@/lib/domain";
import { dateShort, money, plural } from "@/lib/format";
import type { Allocation, Contact, Profile } from "@/lib/types";

type Kind = "all" | Contact["kind"];

export default function ContactsPage() {
  const { org, invoices, allocations } = useAgency();
  const contacts = useLive<Contact>(`contacts:${org.id}`, () => col(C.contacts, where("orgId", "==", org.id)));
  const [kind, setKind] = useState<Kind>("all");
  const [q, setQ] = useState("");
  const [users, setUsers] = useState<Map<string, Profile>>(new Map());
  const [openId, setOpenId] = useState<string | null>(null);

  const emailsKey = contacts.data.map((c) => c.email).filter(Boolean).sort().join(",");
  useEffect(() => {
    if (!emailsKey) return;
    let alive = true;
    lookupUsers(emailsKey.split(","))
      .then((m) => alive && setUsers(m))
      .catch(() => {});
    return () => {
      alive = false;
    };
  }, [emailsKey]);

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

  const list = contacts.data
    .filter((c) => (kind === "all" || c.kind === kind) && (!q.trim() || `${c.name} ${c.email}`.toLowerCase().includes(q.trim().toLowerCase())))
    .sort((a, b) => a.name.localeCompare(b.name));
  const count = (k: Contact["kind"]) => contacts.data.filter((c) => c.kind === k).length;
  const opened = contacts.data.find((c) => c.id === openId) ?? null;

  return (
    <div>
      <PageHeader title="Contacts" subtitle={org.crm.provider ? `Talent, partner agencies and brands from ${providerName(org.crm.provider)}, with their AGNCY status and payment activity.` : "Contacts come from your CRM."} />
      {!org.crm.provider && contacts.data.length === 0 ? (
        <Card>
          <EmptyState icon={<Users className="h-5 w-5" />} title="Connect your CRM to see contacts" body="Talent, partner agencies and brands sync automatically." action={<LinkButton href="/agency/settings?tab=crm">Connect CRM</LinkButton>} />
        </Card>
      ) : (
        <Card>
          <div className="flex flex-wrap items-center gap-3 border-b border-line px-4 py-3">
            <Tabs
              value={kind}
              onChange={setKind}
              tabs={[
                { id: "all", label: "All", count: contacts.data.length },
                { id: "talent", label: "Talent", count: count("talent") },
                { id: "agency", label: "Agencies", count: count("agency") },
                { id: "brand", label: "Brands", count: count("brand") },
              ]}
            />
            <div className="relative ml-auto w-full sm:w-64">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink/35" />
              <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search contacts" className="h-9 pl-9" aria-label="Search contacts" />
            </div>
          </div>
          {contacts.loading ? (
            <SkeletonRows rows={6} />
          ) : list.length === 0 ? (
            <EmptyState icon={<Users className="h-5 w-5" />} title="No contacts" body={q ? "Try a different search." : "Nothing in this group yet."} />
          ) : (
            <ul className="divide-y divide-line">
              {list.map((c) => {
                const user = users.get(c.email);
                const act = activity.get(c.email);
                return (
                  <li key={c.id}>
                    <button onClick={() => setOpenId(c.id)} className="flex w-full items-center gap-3 px-5 py-3.5 text-left hover:bg-paper/60">
                      <Avatar name={c.name} size={36} />
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-medium text-ink">{c.name}</p>
                        <p className="truncate text-xs text-muted">{c.email || "No email in CRM"}</p>
                      </div>
                      <Pill className="hidden capitalize sm:inline-flex">{c.kind}</Pill>
                      {user ? <Pill tone="green" dot>On AGNCY</Pill> : <Pill>Not on AGNCY</Pill>}
                      <span className="tabular hidden w-28 text-right text-sm text-ink md:block">{act ? money(act.paid + act.open, act.currency) : "—"}</span>
                    </button>
                  </li>
                );
              })}
            </ul>
          )}
        </Card>
      )}
      <ContactDrawer contact={opened} user={opened ? users.get(opened.email) : undefined} onClose={() => setOpenId(null)} />
    </div>
  );
}

function ContactDrawer({ contact, user, onClose }: { contact: Contact | null; user?: Profile; onClose: () => void }) {
  return (
    <Modal open={!!contact} onClose={onClose} variant="drawer" title={contact?.name ?? ""} description={contact ? `${contact.kind[0].toUpperCase()}${contact.kind.slice(1)} · from your CRM` : undefined}>
      {contact && <ContactBody key={contact.id} contact={contact} user={user} />}
    </Modal>
  );
}

function ContactBody({ contact, user }: { contact: Contact; user?: Profile }) {
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
        <Row label="Email">{contact.email || "—"}</Row>
        <Row label="Phone">{contact.phone || "—"}</Row>
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
