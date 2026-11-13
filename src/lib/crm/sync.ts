/**
 * Brings the connected CRM's invoices, allocations and contacts into AGNCY.
 *
 * Sync is automatic (see AgencyProvider) and one-directional: CRM content always wins, AGNCY state
 * (sent / viewed / declined / paid, payouts) is never overwritten, and money that has already moved
 * freezes the record it moved against.
 */
import { collection, doc, getDocs, query, updateDoc, where, writeBatch, type DocumentData, type WriteBatch } from "firebase/firestore";
import { db } from "../firebase";
import { C } from "../db";
import { invoiceFingerprint, normEmail, safeId } from "../domain";
import { newId, providerName } from "../actions";
import { generateSandbox } from "./sandbox";
import type { Allocation, Contact, CrmProvider, CrmSyncPayload, Invoice, InvoiceStatus, Org } from "../types";

/**
 * The CRM login lives in the browser that authorised it; this browser doesn't have it. It is not an
 * org-wide failure (another browser may be syncing fine), so it is never written to the org.
 */
export class CrmNotConnectedHere extends Error {
  constructor(provider: CrmProvider) {
    super(`${providerName(provider)} isn't connected in this browser yet.`);
    this.name = "CrmNotConnectedHere";
  }
}

export interface SyncResult {
  created: number;
  updated: number;
}

async function fetchPayload(org: Org): Promise<CrmSyncPayload> {
  const provider = org.crm.provider!;
  if (provider === "sandbox") {
    return generateSandbox(org.sandbox ?? { seededAt: org.crm.connectedAt ?? org.createdAt });
  }
  const res = await fetch(`/api/crm/sync?provider=${provider}`, { cache: "no-store" });
  const body = await res.json().catch(() => null);
  if (body?.code === "not_connected_here") throw new CrmNotConnectedHere(provider);
  if (!res.ok || !body) throw new Error(body?.error || `${providerName(provider)} sync failed (${res.status}).`);
  return body as CrmSyncPayload;
}

/**
 * Marks invoices that brands paid through AGNCY as paid in QuickBooks. Runs inside the agency's own
 * sync because the QuickBooks tokens live in the agency's browser. Failures are kept on the invoice
 * and retried on the next sync; they never block the sync itself.
 */
export async function pushPaymentsToCrm(org: Org, invoices: Invoice[]): Promise<number> {
  if (org.crm.provider !== "quickbooks") return 0;
  // Uses the invoices the dashboard already holds live, so this costs no extra reads.
  const pending = invoices
    .filter((i) => i.provider === "quickbooks" && i.status === "paid" && i.paidVia === "agncy" && !i.crmRecordedAt)
    .slice(0, 25);
  if (pending.length === 0) return 0;

  const res = await fetch("/api/crm/record-payment", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    cache: "no-store",
    body: JSON.stringify({
      provider: "quickbooks",
      items: pending.map((i) => ({ crmId: i.crmId, amount: i.amount, paidAt: i.paidAt ?? Date.now(), reference: i.paymentId ?? i.id })),
    }),
  });
  const body = (await res.json().catch(() => null)) as { results?: { crmId: string; state: string; qbPaymentId?: string; error?: string }[]; error?: string; code?: string } | null;
  // Not connected in this browser: another browser of the agency will write it back.
  if (body?.code === "not_connected_here") return 0;
  if (!res.ok || !body?.results) throw new Error(body?.error || `Could not update QuickBooks (${res.status}).`);

  const now = Date.now();
  const batch = writeBatch(db);
  let recorded = 0;
  for (const r of body.results) {
    const inv = pending.find((i) => i.crmId === r.crmId);
    if (!inv) continue;
    if (r.state === "recorded" || r.state === "already_paid") {
      recorded += 1;
      batch.update(doc(db, C.invoices, inv.id), { crmRecordedAt: now, crmPaymentId: r.qbPaymentId || null, crmRecordError: null });
      batch.set(doc(db, C.activity, newId()), {
        orgId: org.id,
        at: now,
        type: "crm",
        summary: r.state === "recorded" ? `Marked ${inv.number} paid in QuickBooks` : `${inv.number} was already paid in QuickBooks`,
        actor: "AGNCY",
        amount: inv.amount,
        invoiceId: inv.id,
        payoutId: null,
      });
    } else if (inv.crmRecordError !== (r.error ?? "Could not record the payment.")) {
      batch.update(doc(db, C.invoices, inv.id), { crmRecordError: r.error ?? "Could not record the payment." });
    }
  }
  await batch.commit();
  return recorded;
}

export async function runSync(org: Org, invoices: Invoice[] = []): Promise<SyncResult> {
  if (!org.crm.provider) return { created: 0, updated: 0 };
  // Write AGNCY payments back first, so the read that follows already sees them as paid.
  await pushPaymentsToCrm(org, invoices).catch((err) => console.warn("[crm] payment write-back:", err instanceof Error ? err.message : err));
  let payload: CrmSyncPayload;
  try {
    payload = await fetchPayload(org);
  } catch (err) {
    if (err instanceof CrmNotConnectedHere) throw err;
    const message = err instanceof Error ? err.message : "Sync failed.";
    await updateDoc(doc(db, C.orgs, org.id), { "crm.lastSyncAt": Date.now(), "crm.lastSyncError": message });
    throw err;
  }
  return applySync(org, payload);
}

const ALLOCATION_FIELDS = [
  "orgName",
  "invoiceNumber",
  "brandName",
  "description",
  "recipientName",
  "recipientEmail",
  "recipientType",
  "gross",
  "commission",
  "deductions",
  "net",
  "currency",
] as const;

export async function applySync(org: Org, payload: CrmSyncPayload): Promise<SyncResult> {
  const provider = payload.provider;
  const now = Date.now();
  const byOrg = (name: string) => getDocs(query(collection(db, name), where("orgId", "==", org.id)));
  const [invSnap, allocSnap, contactSnap] = await Promise.all([byOrg(C.invoices), byOrg(C.allocations), byOrg(C.contacts)]);

  const invoices = new Map(invSnap.docs.map((d) => [d.id, d.data() as Invoice]));
  const allocations = new Map(allocSnap.docs.map((d) => [d.id, d.data() as Allocation]));
  const contacts = new Map(contactSnap.docs.map((d) => [d.id, d.data() as Contact]));
  const allocationsByInvoice = new Map<string, string[]>();
  for (const [id, a] of allocations) {
    allocationsByInvoice.set(a.invoiceId, [...(allocationsByInvoice.get(a.invoiceId) ?? []), id]);
  }

  const ops: ((b: WriteBatch) => void)[] = [];
  const set = (name: string, id: string, data: DocumentData) => ops.push((b) => b.set(doc(db, name, id), data));
  const update = (name: string, id: string, data: DocumentData) => ops.push((b) => b.update(doc(db, name, id), data));
  const remove = (name: string, id: string) => ops.push((b) => b.delete(doc(db, name, id)));
  let created = 0;
  let updated = 0;

  for (const ci of payload.invoices) {
    const id = `${org.id}_${provider}_${safeId(ci.crmId)}`;
    const content = {
      number: ci.number,
      brandName: ci.brandName,
      brandEmail: normEmail(ci.brandEmail),
      description: ci.description,
      lines: ci.lines,
      amount: ci.amount,
      currency: ci.currency,
      issueDate: ci.issueDate,
      dueDate: ci.dueDate,
    };
    const crmHash = invoiceFingerprint(content);
    const prev = invoices.get(id);
    let status: InvoiceStatus;

    if (!prev) {
      status = ci.status === "paid" ? "paid" : ci.status === "void" ? "void" : "not_sent";
      set(C.invoices, id, {
        id,
        orgId: org.id,
        orgName: org.name,
        provider,
        crmId: ci.crmId,
        ...content,
        crmHash,
        status,
        ...(status === "paid" ? { paidAt: now, paidVia: "crm" } : {}),
        createdAt: now,
        updatedAt: now,
      });
      created += 1;
    } else {
      status = prev.status;
      const patch: DocumentData = {};
      // An invoice paid through AGNCY is a settled record; later CRM edits no longer apply to it.
      const settled = prev.status === "paid" && prev.paidVia === "agncy";
      if (!settled) {
        if (prev.crmHash !== crmHash || prev.issueDate !== ci.issueDate) Object.assign(patch, content, { crmHash });
        if (ci.status === "paid" && prev.status !== "paid") {
          status = "paid";
          Object.assign(patch, { status, paidAt: now, paidVia: "crm" });
        } else if (ci.status === "void" && prev.status !== "void") {
          status = "void";
          patch.status = status;
        } else if (ci.status === "open" && (prev.status === "void" || prev.status === "paid")) {
          // Reopened in the CRM.
          status = prev.sentAt ? "sent" : "not_sent";
          patch.status = status;
        }
      }
      if (prev.orgName !== org.name) patch.orgName = org.name;
      if (Object.keys(patch).length > 0) {
        update(C.invoices, id, { ...patch, updatedAt: now });
        updated += 1;
      }
    }

    const paid = status === "paid";
    const kept = new Set<string>();
    for (const ca of status === "void" ? [] : ci.allocations) {
      const allocationId = `${id}_${safeId(ca.key)}`;
      kept.add(allocationId);
      const fields: Record<(typeof ALLOCATION_FIELDS)[number], string | number> = {
        orgName: org.name,
        invoiceNumber: ci.number,
        brandName: ci.brandName,
        description: ca.description,
        recipientName: ca.recipientName,
        recipientEmail: normEmail(ca.recipientEmail),
        recipientType: ca.recipientType,
        gross: ca.gross,
        commission: ca.commission,
        deductions: ca.deductions,
        net: ca.net,
        currency: ci.currency,
      };
      const prevAlloc = allocations.get(allocationId);
      if (!prevAlloc) {
        set(C.allocations, allocationId, {
          id: allocationId,
          orgId: org.id,
          invoiceId: id,
          ...fields,
          invoicePaid: paid,
          status: "unpaid",
          payoutId: null,
          requestedAt: null,
          requestedBy: null,
          paidAt: null,
          updatedAt: now,
        });
        continue;
      }
      const patch: DocumentData = {};
      // Once a payout is authorised or complete the allocation is frozen at what was paid.
      const locked = prevAlloc.status === "paid" || prevAlloc.status === "pending";
      if (!locked && ALLOCATION_FIELDS.some((f) => prevAlloc[f] !== fields[f])) Object.assign(patch, fields);
      if (prevAlloc.invoicePaid !== paid) patch.invoicePaid = paid;
      if (Object.keys(patch).length > 0) update(C.allocations, allocationId, { ...patch, updatedAt: now });
    }
    // Allocations removed in the CRM disappear here too, unless money is already attached.
    for (const allocationId of allocationsByInvoice.get(id) ?? []) {
      const a = allocations.get(allocationId)!;
      if (!kept.has(allocationId) && (a.status === "unpaid" || a.status === "requested")) remove(C.allocations, allocationId);
    }
  }

  for (const cc of payload.contacts) {
    const id = `${org.id}_${provider}_${safeId(cc.crmId)}`;
    const next = { name: cc.name, email: normEmail(cc.email), phone: cc.phone, kind: cc.kind };
    const prev = contacts.get(id);
    if (!prev) set(C.contacts, id, { id, orgId: org.id, crmId: cc.crmId, ...next, updatedAt: now });
    else if (prev.name !== next.name || prev.email !== next.email || prev.phone !== next.phone || prev.kind !== next.kind) {
      update(C.contacts, id, { ...next, updatedAt: now });
    }
  }

  const orgPatch: DocumentData = { "crm.lastSyncAt": now, "crm.lastSyncError": null };
  if (payload.company) {
    const company = payload.company;
    if (company.name) orgPatch["crm.companyName"] = company.name;
    // Prefill the business profile from the CRM until someone edits it by hand.
    if (org.business.source !== "manual") {
      const next = {
        legalName: company.legalName || company.name || org.business.legalName,
        taxId: company.taxId ? company.taxId.replace(/\D/g, "").slice(-4) : org.business.taxId,
        address: company.address || org.business.address,
        website: company.website || org.business.website,
        phone: company.phone || org.business.phone,
        source: "crm" as const,
      };
      if (JSON.stringify(next) !== JSON.stringify({ ...org.business })) orgPatch.business = next;
    }
  }
  ops.push((b) => b.update(doc(db, C.orgs, org.id), orgPatch));

  if (created > 0) {
    set(C.activity, newId(), {
      orgId: org.id,
      at: now,
      type: "crm",
      summary: `Synced ${created} new ${created === 1 ? "invoice" : "invoices"} from ${providerName(provider)}`,
      actor: "AGNCY",
      amount: null,
      invoiceId: null,
      payoutId: null,
    });
  }

  for (let i = 0; i < ops.length; i += 400) {
    const batch = writeBatch(db);
    ops.slice(i, i + 400).forEach((op) => op(batch));
    await batch.commit();
  }
  return { created, updated };
}
