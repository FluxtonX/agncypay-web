/**
 * Every write the product makes, in one place.
 *
 * Phase 1 beta runs these from the browser against Firestore and moves money in TEST MODE: a
 * "payment" or "payout" is a ledger entry, not a bank transfer. Each function is written as the
 * unit a server endpoint (and a payment rail such as Dwolla) takes over for production — callers
 * never touch Firestore directly.
 */
import {
  arrayRemove,
  arrayUnion,
  collection,
  deleteField,
  doc,
  getDoc,
  getDocs,
  limit,
  query,
  runTransaction,
  setDoc,
  updateDoc,
  where,
  writeBatch,
  type DocumentData,
  type DocumentReference,
  type Transaction,
  type WriteBatch,
} from "firebase/firestore";
import { db } from "./firebase";
import { C } from "./db";
import { toProfile } from "./profile";
import { balanceOf, canPayOut, canRequestPayment, makeHandle, normEmail, normHandle, viewInvoice, type PayoutDraft } from "./domain";
import { dateLong, money } from "./format";
import type {
  ActivityEvent,
  Allocation,
  BankAccount,
  Invite,
  InviteKind,
  Invoice,
  NotificationPrefs,
  Org,
  Payment,
  Payout,
  Profile,
  SandboxEdit,
  VirtualCard,
  WalletTx,
  CrmProvider,
} from "./types";

/* ---------------------------------------------------------------- helpers */

export interface Actor {
  uid: string;
  name: string;
}

interface Writer {
  set(ref: DocumentReference, data: DocumentData): void;
  update(ref: DocumentReference, data: DocumentData): void;
}

const batchWriter = (b: WriteBatch): Writer => ({
  set: (ref, data) => void b.set(ref, data),
  update: (ref, data) => void b.update(ref, data),
});

const txWriter = (t: Transaction): Writer => ({
  set: (ref, data) => void t.set(ref, data),
  update: (ref, data) => void t.update(ref, data),
});

export const newId = (): string => doc(collection(db, "_")).id;

/** Unguessable token for payment links and invitations. */
export const newToken = (): string => crypto.randomUUID().replace(/-/g, "");

const ref = (name: string, id: string) => doc(db, name, id);
const origin = () => (typeof window === "undefined" ? "" : window.location.origin);

const escapeHtml = (s: string) =>
  s.replace(/[&<>"']/g, (ch) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[ch]!);

/**
 * Queues an email in the Firebase "Trigger Email" extension format. Nothing is delivered until
 * that extension (or another sender reading the `mail` collection) is installed.
 */
function queueMail(w: Writer, to: string, subject: string, paragraphs: string[], cta?: { label: string; url: string }) {
  if (!to) return;
  const text = [...paragraphs, cta ? `${cta.label}: ${cta.url}` : "", "AGNCY — payments for the creative economy"]
    .filter(Boolean)
    .join("\n\n");
  const html =
    `<div style="font-family:Inter,Arial,sans-serif;max-width:520px;margin:0 auto;color:#101010;line-height:1.55">` +
    paragraphs.map((p) => `<p>${escapeHtml(p)}</p>`).join("") +
    (cta
      ? `<p><a href="${escapeHtml(cta.url)}" style="display:inline-block;background:#101010;color:#fff;padding:12px 22px;border-radius:999px;text-decoration:none;font-weight:600">${escapeHtml(cta.label)}</a></p>`
      : "") +
    `<p style="color:#6b6a66;font-size:12px">AGNCY — payments for the creative economy</p></div>`;
  w.set(ref(C.mail, newId()), { to: [to], message: { subject, text, html }, status: "pending", createdAt: Date.now() });
  scheduleMailFlush();
}

/**
 * Nudges the /api/send-mail route to deliver queued mail. Debounced so an action that queues several
 * emails triggers one flush, and delayed so the Firestore batch that holds the mail docs commits
 * first. Fire-and-forget: if it doesn't run (e.g. the tab closes), the next queued email flushes it.
 */
let mailFlushTimer: ReturnType<typeof setTimeout> | null = null;
function scheduleMailFlush() {
  if (typeof window === "undefined") return;
  if (mailFlushTimer) clearTimeout(mailFlushTimer);
  mailFlushTimer = setTimeout(flushMailQueue, 2500);
}

/** Asks the server to deliver every queued email now. Safe to call often; it never throws. */
export function flushMailQueue() {
  if (typeof window === "undefined") return;
  fetch("/api/send-mail", { method: "POST" }).catch(() => {});
}

function notify(w: Writer, to: string, title: string, body: string, href: string) {
  if (!to) return;
  w.set(ref(C.notices, newId()), { to, title, body, href, at: Date.now(), read: false });
}

function logActivity(w: Writer, event: Omit<ActivityEvent, "id" | "at">) {
  w.set(ref(C.activity, newId()), { amount: null, invoiceId: null, payoutId: null, ...event, at: Date.now() });
}

const accountLabel = (a: Pick<BankAccount, "institution" | "mask">) => `${a.institution} ••${a.mask}`;

/* ------------------------------------------------------------------- orgs */

/** Agencies get their business account lazily, the first time the owner opens the portal. */
export async function ensureOrg(profile: Profile): Promise<string> {
  const orgId = profile.orgId || profile.uid;
  const snap = await getDoc(ref(C.orgs, orgId));
  if (!snap.exists()) {
    if (orgId !== profile.uid) throw new Error("This agency account no longer exists.");
    const name = profile.workspaceName?.trim() || `${profile.fullName}'s agency`;
    const org: Org = {
      id: orgId,
      name,
      ownerUid: profile.uid,
      ownerEmail: profile.email,
      ownerName: profile.fullName,
      memberUids: [profile.uid],
      emails: [profile.email],
      business: { legalName: name, taxId: "", address: "", website: "", phone: "", source: "signup" },
      verification: { status: "unverified" },
      crm: { provider: null },
      createdAt: Date.now(),
    };
    await setDoc(ref(C.orgs, orgId), org);
  }
  if (profile.orgId !== orgId) {
    await updateDoc(ref(C.users, profile.uid), { orgId, orgRole: orgId === profile.uid ? "owner" : "member" });
  }
  return orgId;
}

export async function saveBusiness(org: Org, business: Org["business"], actor: Actor): Promise<void> {
  const batch = writeBatch(db);
  batch.update(ref(C.orgs, org.id), {
    name: business.legalName.trim() || org.name,
    business: { ...business, source: "manual" },
  });
  logActivity(batchWriter(batch), { orgId: org.id, type: "business", summary: "Business details updated", actor: actor.name });
  await batch.commit();
}

/** Test mode approves immediately; in production this is where the payment provider's KYB runs. */
export async function verifyBusiness(org: Org, actor: Actor): Promise<void> {
  const batch = writeBatch(db);
  batch.update(ref(C.orgs, org.id), { verification: { status: "verified", verifiedAt: Date.now() } });
  logActivity(batchWriter(batch), { orgId: org.id, type: "business", summary: "Business verified (test mode)", actor: actor.name });
  await batch.commit();
}

/* ---------------------------------------------------------- bank accounts */

export interface BankInput {
  institution: string;
  name: string;
  mask: string;
  subtype: string;
  source: "plaid" | "manual";
}

/**
 * Adds connected accounts, skipping any the owner has already connected (same institution and
 * last four) so one account is never linked twice. An org's first account becomes its default
 * for both receiving and funding.
 */
export async function addBankAccounts(
  owner: { type: "org" | "user"; id: string },
  inputs: BankInput[],
  existing: BankAccount[],
  actor?: Actor
): Promise<{ added: number; duplicates: number }> {
  const seen = new Set(existing.map((a) => `${a.institution.toLowerCase()}|${a.mask}`));
  const batch = writeBatch(db);
  const w = batchWriter(batch);
  let added = 0;
  let duplicates = 0;
  let hasAny = existing.length > 0;
  for (const input of inputs) {
    const key = `${input.institution.toLowerCase()}|${input.mask}`;
    if (seen.has(key)) {
      duplicates += 1;
      continue;
    }
    seen.add(key);
    const id = newId();
    const first = owner.type === "org" && !hasAny;
    const account: BankAccount = {
      id,
      ownerType: owner.type,
      ownerId: owner.id,
      ...input,
      receiving: first,
      funding: first,
      createdAt: Date.now(),
    };
    w.set(ref(C.bankAccounts, id), account);
    hasAny = true;
    added += 1;
    if (owner.type === "org" && actor) {
      logActivity(w, { orgId: owner.id, type: "bank", summary: `Connected ${accountLabel(account)}`, actor: actor.name });
    }
  }
  if (added > 0) await batch.commit();
  return { added, duplicates };
}

export async function setDefaultAccount(accounts: BankAccount[], accountId: string, role: "receiving" | "funding"): Promise<void> {
  const batch = writeBatch(db);
  for (const a of accounts) {
    const next = a.id === accountId;
    if (a[role] !== next) batch.update(ref(C.bankAccounts, a.id), { [role]: next });
  }
  await batch.commit();
}

export async function removeBankAccount(accounts: BankAccount[], account: BankAccount, actor?: Actor): Promise<void> {
  const batch = writeBatch(db);
  batch.delete(ref(C.bankAccounts, account.id));
  const heir = accounts.find((a) => a.id !== account.id);
  if (heir && account.ownerType === "org" && (account.receiving || account.funding)) {
    batch.update(ref(C.bankAccounts, heir.id), {
      receiving: heir.receiving || account.receiving,
      funding: heir.funding || account.funding,
    });
  }
  if (account.ownerType === "org" && actor) {
    logActivity(batchWriter(batch), {
      orgId: account.ownerId,
      type: "bank",
      summary: `Removed ${accountLabel(account)}`,
      actor: actor.name,
    });
  }
  await batch.commit();
}

/* -------------------------------------------------------------------- CRM */

const PROVIDER_NAMES: Record<CrmProvider, string> = { quickbooks: "QuickBooks", xero: "Xero", sandbox: "AGNCY Sandbox CRM" };
export const providerName = (p: CrmProvider | null | undefined) => (p ? PROVIDER_NAMES[p] : "CRM");

export async function connectCrm(org: Org, provider: CrmProvider, actor: Actor): Promise<void> {
  const batch = writeBatch(db);
  const patch: DocumentData = { crm: { provider, connectedAt: Date.now(), lastSyncAt: 0, lastSyncError: null } };
  if (provider === "sandbox" && !org.sandbox) patch.sandbox = { seededAt: Date.now() };
  batch.update(ref(C.orgs, org.id), patch);
  logActivity(batchWriter(batch), { orgId: org.id, type: "crm", summary: `Connected ${providerName(provider)}`, actor: actor.name });
  await batch.commit();
}

export async function disconnectCrm(org: Org, actor: Actor): Promise<void> {
  const provider = org.crm.provider;
  if (!provider) return;
  const batch = writeBatch(db);
  batch.update(ref(C.orgs, org.id), { crm: { provider: null } });
  logActivity(batchWriter(batch), { orgId: org.id, type: "crm", summary: `Disconnected ${providerName(provider)}`, actor: actor.name });
  await batch.commit();
}

export async function saveSandboxRecipients(
  org: Org,
  emails: { brandEmail: string; talentEmail: string; partnerEmail: string }
): Promise<void> {
  await updateDoc(ref(C.orgs, org.id), {
    "sandbox.brandEmail": normEmail(emails.brandEmail),
    "sandbox.talentEmail": normEmail(emails.talentEmail),
    "sandbox.partnerEmail": normEmail(emails.partnerEmail),
  });
}

/** Sandbox CRM only: stands in for someone editing the invoice inside the CRM. */
export async function saveSandboxEdit(org: Org, crmId: string, edit: SandboxEdit): Promise<void> {
  await updateDoc(ref(C.orgs, org.id), { [`sandbox.edits.${crmId}`]: edit });
}

/* ------------------------------------------------------- payment requests */

export async function sendPaymentRequest(org: Org, inv: Invoice, actor: Actor, receiving: BankAccount): Promise<void> {
  if (!org.crm.provider) throw new Error("Connect your CRM to send payment requests.");
  if (!inv.brandEmail) {
    throw new Error("This invoice has no billing email in your CRM. Add one there and it will sync here automatically.");
  }
  if (inv.status === "paid" || inv.status === "void") throw new Error("This invoice is closed.");
  const resend = inv.status !== "not_sent";
  // Unregistered brands get an invitation framing; registered ones are pointed at their portal.
  const registered = await emailIsRegistered(inv.brandEmail);
  const token = inv.token || newToken();
  const now = Date.now();
  const link = `${origin()}/pay/${token}`;
  const batch = writeBatch(db);
  const w = batchWriter(batch);
  batch.update(ref(C.invoices, inv.id), {
    status: "sent",
    token,
    sentAt: now,
    sentHash: inv.crmHash,
    sentCount: (inv.sentCount ?? 0) + 1,
    decline: null,
    viewedAt: deleteField(),
    receivingAccountId: receiving.id,
    updatedAt: now,
  });
  queueMail(
    w,
    inv.brandEmail,
    `${org.name} ${resend ? "updated" : "sent"} a payment request — ${inv.number}`,
    [
      `Hi ${inv.brandName},`,
      `${org.name} has ${resend ? "reissued" : "sent you"} a payment request for ${inv.number} (${inv.description}): ${money(inv.amount, inv.currency)}.`,
      registered
        ? "Open the request below to review and pay it. You can also sign in to AGNCY to pay it alongside your other invoices."
        : "Open the request to pay securely as a guest — or create a free AGNCY account on the way, and keep every invoice and receipt from all your agencies in one place.",
    ],
    { label: registered ? "Review and pay" : "Review, pay or join", url: link }
  );
  notify(w, inv.brandEmail, `Payment request from ${org.name}`, `${inv.number} · ${money(inv.amount, inv.currency)}`, "/brand");
  logActivity(w, {
    orgId: org.id,
    type: resend ? "request_resent" : "request_sent",
    summary: `${resend ? "Reissued" : "Sent"} ${inv.number} to ${inv.brandName} · settles to ${accountLabel(receiving)}`,
    actor: actor.name,
    amount: inv.amount,
    invoiceId: inv.id,
  });
  await batch.commit();
}

export async function sendReminder(org: Org, inv: Invoice, actor: Actor, note: string): Promise<void> {
  if ((inv.status !== "sent" && inv.status !== "viewed") || !inv.token) throw new Error("Only open payment requests can be reminded.");
  const batch = writeBatch(db);
  const w = batchWriter(batch);
  batch.update(ref(C.invoices, inv.id), { reminders: arrayUnion(Date.now()), updatedAt: Date.now() });
  queueMail(
    w,
    inv.brandEmail,
    `Reminder: ${inv.number} from ${org.name}`,
    [
      `Hi ${inv.brandName},`,
      `A reminder that ${inv.number} (${inv.description}) for ${money(inv.amount, inv.currency)} is due ${dateLong(inv.dueDate)}.`,
      (() => {
        const v = viewInvoice(inv, Date.now());
        return v.daysOverdue > 0
          ? `It is ${v.daysOverdue} ${v.daysOverdue === 1 ? "day" : "days"} overdue (${v.daysOutstanding} days outstanding).`
          : `It has been outstanding for ${v.daysOutstanding} ${v.daysOutstanding === 1 ? "day" : "days"}${v.daysUntilDue > 0 ? ` and is due in ${v.daysUntilDue} ${v.daysUntilDue === 1 ? "day" : "days"}` : " and is due today"}.`;
      })(),
      ...(note.trim() ? [note.trim()] : []),
    ],
    { label: "Review and pay", url: `${origin()}/pay/${inv.token}` }
  );
  notify(w, inv.brandEmail, `Reminder from ${org.name}`, `${inv.number} · ${money(inv.amount, inv.currency)}`, "/brand");
  logActivity(w, {
    orgId: org.id,
    type: "reminder",
    summary: `Reminder sent to ${inv.brandName} for ${inv.number}`,
    actor: actor.name,
    invoiceId: inv.id,
  });
  await batch.commit();
}

/** Called the first time a brand opens a payment request. */
export async function markViewed(inv: Invoice): Promise<void> {
  if (inv.status !== "sent") return;
  const batch = writeBatch(db);
  batch.update(ref(C.invoices, inv.id), { status: "viewed", viewedAt: Date.now() });
  logActivity(batchWriter(batch), {
    orgId: inv.orgId,
    type: "viewed",
    summary: `${inv.brandName} opened ${inv.number}`,
    actor: inv.brandName,
    invoiceId: inv.id,
  });
  await batch.commit();
}

export async function declineInvoice(invoiceId: string, reason: string, correction: string, by: string): Promise<void> {
  await runTransaction(db, async (tx) => {
    const snap = await tx.get(ref(C.invoices, invoiceId));
    if (!snap.exists()) throw new Error("This payment request no longer exists.");
    const inv = { ...snap.data(), id: snap.id } as Invoice;
    if (inv.status !== "sent" && inv.status !== "viewed") throw new Error("This payment request can no longer be declined.");
    const w = txWriter(tx);
    tx.update(ref(C.invoices, invoiceId), {
      status: "declined",
      decline: { reason: reason.trim(), correction: correction.trim(), at: Date.now(), by },
      updatedAt: Date.now(),
    });
    notify(
      w,
      inv.orgId,
      `${inv.brandName} declined ${inv.number}`,
      reason.trim() || correction.trim() || "No reason given.",
      `/agency/invoices/${inv.id}`
    );
    logActivity(w, {
      orgId: inv.orgId,
      type: "declined",
      summary: `${inv.brandName} declined ${inv.number}${reason.trim() ? ` — “${reason.trim()}”` : ""}`,
      actor: by,
      invoiceId: inv.id,
    });
  });
}

/* --------------------------------------------------------- brand payments */

export interface Payer {
  name: string;
  email: string;
  uid: string | null;
}

/**
 * Pays one or more open payment requests in a single checkout — across agencies for registered
 * brands, a single invoice for guests. TEST MODE: no money moves.
 */
export async function payInvoices(invoiceIds: string[], payer: Payer, methodLabel: string): Promise<string> {
  if (invoiceIds.length === 0) throw new Error("Select at least one invoice.");
  const paymentId = newId();
  const allocSnaps = await Promise.all(
    invoiceIds.map((id) => getDocs(query(collection(db, C.allocations), where("invoiceId", "==", id))))
  );
  await runTransaction(db, async (tx) => {
    const invoices: Invoice[] = [];
    for (const id of invoiceIds) {
      const snap = await tx.get(ref(C.invoices, id));
      if (!snap.exists()) throw new Error("One of these invoices no longer exists.");
      const inv = { ...snap.data(), id: snap.id } as Invoice;
      if (inv.status !== "sent" && inv.status !== "viewed") throw new Error(`${inv.number} is no longer awaiting payment.`);
      invoices.push(inv);
    }
    const currency = invoices[0].currency;
    if (invoices.some((i) => i.currency !== currency)) throw new Error("Invoices in different currencies must be paid separately.");

    const now = Date.now();
    const w = txWriter(tx);
    const total = invoices.reduce((s, i) => s + i.amount, 0);
    const payment: Payment = {
      id: paymentId,
      receiptNo: `AG-${now.toString(36).toUpperCase()}`,
      payerName: payer.name.trim(),
      payerEmail: normEmail(payer.email),
      payerUid: payer.uid,
      guest: !payer.uid,
      items: invoices.map((i) => ({
        invoiceId: i.id,
        orgId: i.orgId,
        orgName: i.orgName,
        number: i.number,
        description: i.description,
        amount: i.amount,
      })),
      orgIds: [...new Set(invoices.map((i) => i.orgId))],
      total,
      currency,
      methodLabel,
      status: "succeeded",
      createdAt: now,
    };
    w.set(ref(C.payments, paymentId), payment);

    invoices.forEach((inv, index) => {
      tx.update(ref(C.invoices, inv.id), { status: "paid", paidAt: now, paymentId, paidVia: "agncy", updatedAt: now });
      notify(w, inv.orgId, `${inv.brandName} paid ${inv.number}`, `${money(inv.amount, currency)} received.`, `/agency/invoices/${inv.id}`);
      logActivity(w, {
        orgId: inv.orgId,
        type: "payment_received",
        summary: `${inv.brandName} paid ${inv.number}`,
        actor: payment.payerName || inv.brandName,
        amount: inv.amount,
        invoiceId: inv.id,
      });
      for (const d of allocSnaps[index].docs) {
        const a = d.data() as Allocation;
        tx.update(d.ref, { invoicePaid: true, updatedAt: now });
        if (a.status === "unpaid" && a.recipientEmail) {
          notify(
            w,
            a.recipientEmail,
            `${inv.brandName} paid ${inv.number}`,
            `Your ${money(a.net, a.currency)} from ${inv.orgName} can now be requested.`,
            a.recipientType === "agency" ? "/agency/requests" : "/app/earnings"
          );
        }
      }
    });

    queueMail(
      w,
      payment.payerEmail,
      `Receipt ${payment.receiptNo} — ${money(total, currency)}`,
      [
        `Thanks${payment.payerName ? `, ${payment.payerName}` : ""}. Your payment of ${money(total, currency)} was received.`,
        ...invoices.map((i) => `${i.orgName} · ${i.number} · ${money(i.amount, currency)}`),
      ],
      { label: "View receipt", url: `${origin()}/receipt/${paymentId}` }
    );
  });
  return paymentId;
}

/* ------------------------------------------- allocation payment requests */

/** A recipient (talent or another agency) asks the booking agency to pay an existing allocation. */
export async function requestAllocationPayment(allocationId: string, requester: string): Promise<void> {
  await runTransaction(db, async (tx) => {
    const snap = await tx.get(ref(C.allocations, allocationId));
    if (!snap.exists()) throw new Error("This allocation no longer exists.");
    const a = { ...snap.data(), id: snap.id } as Allocation;
    if (!canRequestPayment(a)) throw new Error("This allocation can't be requested right now.");
    const w = txWriter(tx);
    tx.update(ref(C.allocations, allocationId), {
      status: "requested",
      requestedAt: Date.now(),
      requestedBy: requester,
      updatedAt: Date.now(),
    });
    notify(
      w,
      a.orgId,
      `Payment request from ${requester}`,
      `${money(a.net, a.currency)} · ${a.description} (${a.invoiceNumber})`,
      "/agency/requests"
    );
    logActivity(w, {
      orgId: a.orgId,
      type: "allocation_requested",
      summary: `${requester} requested payment for ${a.description} (${a.invoiceNumber})`,
      actor: requester,
      amount: a.net,
      invoiceId: a.invoiceId,
    });
  });
}

/* ---------------------------------------------------------------- payouts */

export type RecipientStatus =
  | { kind: "user"; uid: string }
  | { kind: "org"; orgId: string; hasBank: boolean }
  | { kind: "unregistered" }
  | { kind: "ineligible"; reason: string };

/** Is this email already on AGNCY, and can it be paid right now? */
export async function resolveRecipient(email: string): Promise<RecipientStatus> {
  const address = normEmail(email);
  if (!address) return { kind: "ineligible", reason: "No email on the CRM record." };
  const orgWithBank = async (orgId: string): Promise<RecipientStatus> => {
    const banks = await getDocs(query(collection(db, C.bankAccounts), where("ownerId", "==", orgId), limit(1)));
    return { kind: "org", orgId, hasBank: !banks.empty };
  };
  const users = await getDocs(query(collection(db, C.users), where("email", "==", address), limit(1)));
  if (!users.empty) {
    const user = toProfile(users.docs[0].id, users.docs[0].data());
    if (user.accountType === "individual") return { kind: "user", uid: user.uid };
    if (user.accountType === "agency") return orgWithBank(user.orgId || user.uid);
    return { kind: "ineligible", reason: "This email belongs to a brand account, which can't receive payouts." };
  }
  const orgs = await getDocs(query(collection(db, C.orgs), where("emails", "array-contains", address), limit(1)));
  if (!orgs.empty) return orgWithBank(orgs.docs[0].id);
  return { kind: "unregistered" };
}

export interface PayoutResult {
  sent: number;
  invited: number;
  failed: { name: string; error: string }[];
}

function settleLines(w: Writer, payout: Payout, now: number, uid: string | null) {
  for (const line of payout.lines) {
    w.update(ref(C.allocations, line.allocationId), { status: "paid", payoutId: payout.id, paidAt: now, updatedAt: now });
  }
  if (uid) {
    const jobs = payout.lines.length;
    const credit: WalletTx = {
      id: `earn_${payout.id}`,
      uid,
      at: now,
      kind: "earning",
      amount: payout.amount,
      title: payout.orgName,
      detail: jobs === 1 ? `${payout.lines[0].brandName} · ${payout.lines[0].description}` : `${jobs} jobs paid together`,
      payoutId: payout.id,
    };
    w.set(ref(C.walletTx, credit.id), credit);
  }
}

/**
 * Authorises one transfer per recipient. Registered recipients are paid straight away; anyone
 * else gets Send & Invite — the payout is recorded as authorised and released automatically when
 * they become eligible, without the agency repeating anything.
 */
export async function createPayouts(org: Org, drafts: PayoutDraft[], funding: BankAccount, actor: Actor): Promise<PayoutResult> {
  const result: PayoutResult = { sent: 0, invited: 0, failed: [] };
  const batchId = newId();
  for (const draft of drafts) {
    try {
      const recipient = await resolveRecipient(draft.recipientEmail);
      if (recipient.kind === "ineligible") throw new Error(recipient.reason);
      const eligible = recipient.kind === "user" || (recipient.kind === "org" && recipient.hasBank);
      const pendingReason = eligible ? null : recipient.kind === "org" ? "bank_account" : "registration";
      const inviteId = pendingReason === "registration" ? newToken() : null;
      const payoutId = newId();

      await runTransaction(db, async (tx) => {
        for (const line of draft.lines) {
          const snap = await tx.get(ref(C.allocations, line.allocationId));
          const a = snap.exists() ? (snap.data() as Allocation) : null;
          if (!a || a.orgId !== org.id || !canPayOut(a)) {
            throw new Error(`${line.invoiceNumber} · ${line.description} is no longer payable.`);
          }
        }
        const now = Date.now();
        const w = txWriter(tx);
        const payout: Payout = {
          id: payoutId,
          orgId: org.id,
          orgName: org.name,
          batchId,
          recipientName: draft.recipientName,
          recipientEmail: draft.recipientEmail,
          recipientType: draft.recipientType,
          recipientUid: recipient.kind === "user" ? recipient.uid : null,
          recipientOrgId: recipient.kind === "org" ? recipient.orgId : null,
          lines: draft.lines,
          amount: draft.amount,
          currency: draft.currency,
          fundingAccountId: funding.id,
          fundingLabel: accountLabel(funding),
          status: eligible ? "paid" : "pending_recipient",
          pendingReason,
          inviteId,
          createdAt: now,
          createdBy: actor.uid,
          createdByName: actor.name,
          paidAt: eligible ? now : null,
          closedAt: null,
        };
        w.set(ref(C.payouts, payoutId), payout);
        const amount = money(draft.amount, draft.currency);

        if (eligible) {
          settleLines(w, payout, now, recipient.kind === "user" ? recipient.uid : null);
          notify(
            w,
            draft.recipientEmail,
            `${org.name} paid you ${amount}`,
            draft.lines.length === 1 ? draft.lines[0].description : `${draft.lines.length} jobs paid together`,
            recipient.kind === "user" ? "/app/activity" : "/agency/requests"
          );
          logActivity(w, {
            orgId: org.id,
            type: "payout_sent",
            summary: `Paid ${draft.recipientName} from ${payout.fundingLabel}`,
            actor: actor.name,
            amount: draft.amount,
            payoutId,
          });
        } else {
          for (const line of draft.lines) {
            w.update(ref(C.allocations, line.allocationId), { status: "pending", payoutId, updatedAt: now });
          }
          if (inviteId) {
            const kind: InviteKind = draft.recipientType === "agency" ? "agency" : "talent";
            const invite: Invite = {
              id: inviteId,
              kind,
              email: draft.recipientEmail,
              name: draft.recipientName,
              orgId: org.id,
              orgName: org.name,
              invitedBy: actor.name,
              payoutId,
              amount: draft.amount,
              status: "pending",
              createdAt: now,
              acceptedAt: null,
            };
            w.set(ref(C.invites, inviteId), invite);
            queueMail(
              w,
              draft.recipientEmail,
              `${org.name} sent you ${amount} on AGNCY`,
              [
                `Hi ${draft.recipientName},`,
                `${org.name} has sent you ${amount} through AGNCY. Join to collect it — the payment is already authorised and lands as soon as your account is ready.`,
              ],
              { label: `Collect ${amount}`, url: `${origin()}/invite/${inviteId}` }
            );
          } else {
            notify(
              w,
              draft.recipientEmail,
              `${org.name} sent you ${amount}`,
              "Add a receiving bank account to collect it.",
              "/agency/settings?tab=banks"
            );
          }
          logActivity(w, {
            orgId: org.id,
            type: "payout_invited",
            summary: inviteId
              ? `Send & Invite: ${draft.recipientName} invited to collect their payout`
              : `Payout to ${draft.recipientName} is waiting for their bank account`,
            actor: actor.name,
            amount: draft.amount,
            payoutId,
          });
        }
      });
      if (eligible) result.sent += 1;
      else result.invited += 1;
    } catch (err) {
      result.failed.push({ name: draft.recipientName, error: err instanceof Error ? err.message : "Unknown error" });
    }
  }
  return result;
}

/** Completes a previously authorised payout once its recipient is eligible. Safe to call repeatedly. */
async function releasePayout(payoutId: string, to: { uid: string } | { orgId: string }): Promise<boolean> {
  return runTransaction(db, async (tx) => {
    const snap = await tx.get(ref(C.payouts, payoutId));
    if (!snap.exists()) return false;
    const payout = { ...snap.data(), id: snap.id } as Payout;
    if (payout.status !== "pending_recipient") return false;
    const now = Date.now();
    const w = txWriter(tx);
    const uid = "uid" in to ? to.uid : null;
    tx.update(ref(C.payouts, payoutId), {
      status: "paid",
      paidAt: now,
      pendingReason: null,
      recipientUid: uid,
      recipientOrgId: "orgId" in to ? to.orgId : null,
    });
    settleLines(w, payout, now, uid);
    if (payout.inviteId) tx.update(ref(C.invites, payout.inviteId), { status: "accepted", acceptedAt: now });
    notify(
      w,
      payout.orgId,
      `${payout.recipientName} joined AGNCY`,
      `Your ${money(payout.amount, payout.currency)} payout was released automatically.`,
      "/agency/payouts?tab=history"
    );
    logActivity(w, {
      orgId: payout.orgId,
      type: "payout_released",
      summary: `${payout.recipientName} became eligible — authorised payout released`,
      actor: "AGNCY",
      amount: payout.amount,
      payoutId,
    });
    return true;
  });
}

/** Individuals: collect every payout that was waiting for this person to join. */
export async function claimPayoutsForUser(profile: Profile): Promise<number> {
  const snap = await getDocs(query(collection(db, C.payouts), where("recipientEmail", "==", profile.email)));
  let released = 0;
  for (const d of snap.docs) {
    if ((d.data() as Payout).status !== "pending_recipient") continue;
    if (await releasePayout(d.id, { uid: profile.uid })) released += 1;
  }
  return released;
}

/** Agencies: collect waiting payouts once a receiving account exists; otherwise tell the payer what's missing. */
export async function claimPayoutsForOrg(org: Org, hasBank: boolean): Promise<number> {
  const emails = org.emails.slice(0, 30);
  if (emails.length === 0) return 0;
  const snap = await getDocs(query(collection(db, C.payouts), where("recipientEmail", "in", emails)));
  let released = 0;
  for (const d of snap.docs) {
    const payout = d.data() as Payout;
    if (payout.status !== "pending_recipient" || payout.orgId === org.id) continue;
    if (hasBank) {
      if (await releasePayout(d.id, { orgId: org.id })) released += 1;
    } else if (payout.pendingReason !== "bank_account") {
      await updateDoc(d.ref, { pendingReason: "bank_account", recipientOrgId: org.id });
    }
  }
  return released;
}

/** Withdraws an authorised payout that has not been released yet. */
export async function cancelPayout(payoutId: string, actor: Actor): Promise<void> {
  await runTransaction(db, async (tx) => {
    const snap = await tx.get(ref(C.payouts, payoutId));
    if (!snap.exists()) throw new Error("Payout not found.");
    const payout = { ...snap.data(), id: snap.id } as Payout;
    if (payout.status !== "pending_recipient") throw new Error("Only payouts that are still waiting can be cancelled.");
    const now = Date.now();
    const w = txWriter(tx);
    tx.update(ref(C.payouts, payoutId), { status: "cancelled", closedAt: now, pendingReason: null });
    for (const line of payout.lines) {
      tx.update(ref(C.allocations, line.allocationId), { status: "unpaid", payoutId: null, paidAt: null, updatedAt: now });
    }
    if (payout.inviteId) tx.update(ref(C.invites, payout.inviteId), { status: "revoked" });
    logActivity(w, {
      orgId: payout.orgId,
      type: "payout_cancelled",
      summary: `Cancelled the pending payout to ${payout.recipientName}`,
      actor: actor.name,
      amount: payout.amount,
      payoutId,
    });
  });
}

/**
 * Reverses a completed payout. Only possible while the money is still in the recipient's AGNCY
 * wallet — payouts that settled to an external bank account are final.
 */
export async function reversePayout(payoutId: string, actor: Actor): Promise<void> {
  const before = await getDoc(ref(C.payouts, payoutId));
  if (!before.exists()) throw new Error("Payout not found.");
  const uid = (before.data() as Payout).recipientUid;
  if (!uid) throw new Error("This payout settled to an external bank account and can't be reversed.");
  const txs = await getDocs(query(collection(db, C.walletTx), where("uid", "==", uid)));
  const balance = balanceOf(txs.docs.map((d) => d.data() as WalletTx));

  await runTransaction(db, async (tx) => {
    const snap = await tx.get(ref(C.payouts, payoutId));
    if (!snap.exists()) throw new Error("Payout not found.");
    const payout = { ...snap.data(), id: snap.id } as Payout;
    if (payout.status !== "paid") throw new Error("Only completed payouts can be reversed.");
    if (balance < payout.amount) {
      throw new Error("The recipient has already moved this money out of their AGNCY wallet, so it can't be reversed.");
    }
    const now = Date.now();
    const w = txWriter(tx);
    tx.update(ref(C.payouts, payoutId), { status: "reversed", closedAt: now });
    for (const line of payout.lines) {
      tx.update(ref(C.allocations, line.allocationId), { status: "unpaid", payoutId: null, paidAt: null, updatedAt: now });
    }
    const debit: WalletTx = {
      id: `rev_${payoutId}`,
      uid,
      at: now,
      kind: "reversal",
      amount: -payout.amount,
      title: payout.orgName,
      detail: "Payment reversed by the agency",
      payoutId,
    };
    w.set(ref(C.walletTx, debit.id), debit);
    notify(
      w,
      payout.recipientEmail,
      `${payout.orgName} reversed a payment`,
      `${money(payout.amount, payout.currency)} was returned to the agency.`,
      "/app/activity"
    );
    logActivity(w, {
      orgId: payout.orgId,
      type: "payout_reversed",
      summary: `Reversed the payout to ${payout.recipientName}`,
      actor: actor.name,
      amount: payout.amount,
      payoutId,
    });
  });
}

/* ------------------------------------------------------------------- team */

async function createInvite(invite: Omit<Invite, "id" | "status" | "createdAt" | "acceptedAt">, mail: { subject: string; body: string[]; cta: string }) {
  const id = newToken();
  const batch = writeBatch(db);
  const w = batchWriter(batch);
  const full: Invite = { ...invite, id, status: "pending", createdAt: Date.now(), acceptedAt: null };
  w.set(ref(C.invites, id), full);
  queueMail(w, invite.email, mail.subject, mail.body, { label: mail.cta, url: `${origin()}/invite/${id}` });
  return { id, batch, w };
}

export async function inviteTeamMember(org: Org, email: string, name: string, actor: Actor): Promise<string> {
  const address = normEmail(email);
  if (org.emails.includes(address)) throw new Error("That person is already on your team.");
  const { id, batch, w } = await createInvite(
    { kind: "team", email: address, name: name.trim(), orgId: org.id, orgName: org.name, invitedBy: actor.name, payoutId: null, amount: null },
    {
      subject: `${actor.name} invited you to ${org.name} on AGNCY`,
      body: [`Hi ${name.trim() || "there"},`, `${actor.name} has invited you to join ${org.name}'s team on AGNCY.`],
      cta: "Join the team",
    }
  );
  logActivity(w, { orgId: org.id, type: "team", summary: `Invited ${address} to the team`, actor: actor.name });
  await batch.commit();
  return id;
}

export async function revokeInvite(inviteId: string): Promise<void> {
  await updateDoc(ref(C.invites, inviteId), { status: "revoked" });
}

export async function removeTeamMember(org: Org, member: { uid: string; email: string; name: string }, actor: Actor): Promise<void> {
  if (member.uid === org.ownerUid) throw new Error("The account owner can't be removed.");
  const batch = writeBatch(db);
  batch.update(ref(C.orgs, org.id), { memberUids: arrayRemove(member.uid), emails: arrayRemove(member.email) });
  logActivity(batchWriter(batch), { orgId: org.id, type: "team", summary: `Removed ${member.name} from the team`, actor: actor.name });
  await batch.commit();
}

/** Joins the invited person to the agency. Their own (empty) agency account, if any, is left behind. */
export async function acceptTeamInvite(invite: Invite, profile: Profile): Promise<void> {
  await runTransaction(db, async (tx) => {
    const snap = await tx.get(ref(C.invites, invite.id));
    if (!snap.exists() || (snap.data() as Invite).status !== "pending") throw new Error("This invitation is no longer valid.");
    tx.update(ref(C.orgs, invite.orgId), { memberUids: arrayUnion(profile.uid), emails: arrayUnion(profile.email) });
    tx.update(ref(C.users, profile.uid), { orgId: invite.orgId, orgRole: "member", workspaceName: invite.orgName });
    tx.update(ref(C.invites, invite.id), { status: "accepted", acceptedAt: Date.now() });
    logActivity(txWriter(tx), { orgId: invite.orgId, type: "team", summary: `${profile.fullName} joined the team`, actor: profile.fullName });
  });
}

/** Individuals can bring their other agencies onto AGNCY. */
export async function inviteAgency(profile: Profile, agencyName: string, email: string): Promise<void> {
  const { batch } = await createInvite(
    {
      kind: "agency",
      email: normEmail(email),
      name: agencyName.trim(),
      orgId: "",
      orgName: profile.fullName,
      invitedBy: profile.fullName,
      payoutId: null,
      amount: null,
    },
    {
      subject: `${profile.fullName} wants to get paid through AGNCY`,
      body: [
        `Hi ${agencyName.trim() || "there"},`,
        `${profile.fullName} uses AGNCY to receive creative income and has invited you to pay them there. Agencies connect their CRM and bank account, then pay talent in a couple of clicks.`,
      ],
      cta: "Set up your agency",
    }
  );
  await batch.commit();
}

/* --------------------------------------------------------------- lookups */

export async function getInvite(id: string): Promise<Invite | null> {
  const snap = await getDoc(ref(C.invites, id));
  return snap.exists() ? ({ ...snap.data(), id: snap.id } as Invite) : null;
}

export async function emailIsRegistered(email: string): Promise<boolean> {
  const snap = await getDocs(query(collection(db, C.users), where("email", "==", normEmail(email)), limit(1)));
  return !snap.empty;
}

/** AGNCY account info for a set of contact emails. */
export async function lookupUsers(emails: string[]): Promise<Map<string, Profile>> {
  const unique = [...new Set(emails.map(normEmail).filter(Boolean))];
  const found = new Map<string, Profile>();
  for (let i = 0; i < unique.length; i += 30) {
    const snap = await getDocs(query(collection(db, C.users), where("email", "in", unique.slice(i, i + 30))));
    for (const d of snap.docs) {
      const p = toProfile(d.id, d.data());
      found.set(p.email, p);
    }
  }
  return found;
}

export async function markNoticesRead(ids: string[]): Promise<void> {
  if (ids.length === 0) return;
  const batch = writeBatch(db);
  ids.slice(0, 400).forEach((id) => batch.update(ref(C.notices, id), { read: true }));
  await batch.commit();
}

/* ------------------------------------------------------------ individuals */

export async function saveProfile(uid: string, patch: Partial<Pick<Profile, "fullName" | "workspaceName" | "phone">>): Promise<void> {
  await updateDoc(ref(C.users, uid), patch);
}

export async function savePrefs(uid: string, prefs: NotificationPrefs): Promise<void> {
  await updateDoc(ref(C.users, uid), { prefs });
}

/** Gives an individual their Wallet ID (e.g. @amara482) the first time they open the app. */
export async function ensureHandle(profile: Profile): Promise<string> {
  if (profile.handle) return profile.handle;
  for (let attempt = 0; attempt < 6; attempt++) {
    const handle = makeHandle(profile.fullName, Math.random() * 900);
    const taken = await getDocs(query(collection(db, C.users), where("handle", "==", handle), limit(1)));
    if (taken.empty) {
      await updateDoc(ref(C.users, profile.uid), { handle });
      return handle;
    }
  }
  const fallback = `${makeHandle(profile.fullName, 0).slice(0, -3)}${Date.now().toString().slice(-6)}`;
  await updateDoc(ref(C.users, profile.uid), { handle: fallback });
  return fallback;
}

async function walletBalance(uid: string): Promise<number> {
  const snap = await getDocs(query(collection(db, C.walletTx), where("uid", "==", uid)));
  return balanceOf(snap.docs.map((d) => d.data() as WalletTx));
}

function assertAmount(amount: number, balance: number) {
  if (!Number.isInteger(amount) || amount <= 0) throw new Error("Enter an amount greater than zero.");
  if (amount > balance) throw new Error(`You have ${money(balance)} available.`);
}

export async function withdrawToBank(profile: Profile, amount: number, bank: BankAccount): Promise<void> {
  assertAmount(amount, await walletBalance(profile.uid));
  const id = newId();
  const tx: WalletTx = {
    id,
    uid: profile.uid,
    at: Date.now(),
    kind: "withdrawal",
    amount: -amount,
    title: `Withdrawal to ${accountLabel(bank)}`,
    detail: "Standard transfer · 1–3 business days",
  };
  await setDoc(ref(C.walletTx, id), tx);
}

/** Wallet-to-wallet transfers are limited to individuals. */
export async function sendToWalletId(profile: Profile, handleInput: string, amount: number, note: string): Promise<Profile> {
  const handle = normHandle(handleInput);
  if (!handle) throw new Error("Enter a Wallet ID, like @amara482.");
  if (handle === profile.handle) throw new Error("That's your own Wallet ID.");
  const snap = await getDocs(query(collection(db, C.users), where("handle", "==", handle), limit(1)));
  const recipient = snap.empty ? null : toProfile(snap.docs[0].id, snap.docs[0].data());
  if (!recipient || recipient.accountType !== "individual") throw new Error(`No one on AGNCY has the Wallet ID @${handle}.`);
  assertAmount(amount, await walletBalance(profile.uid));

  const now = Date.now();
  const batch = writeBatch(db);
  const w = batchWriter(batch);
  const pair = newId();
  const memo = note.trim();
  const out: WalletTx = {
    id: `${pair}_out`,
    uid: profile.uid,
    at: now,
    kind: "transfer_out",
    amount: -amount,
    title: `Sent to @${handle}`,
    detail: memo || recipient.fullName,
  };
  const into: WalletTx = {
    id: `${pair}_in`,
    uid: recipient.uid,
    at: now,
    kind: "transfer_in",
    amount,
    title: `From @${profile.handle ?? profile.fullName}`,
    detail: memo || profile.fullName,
  };
  w.set(ref(C.walletTx, out.id), out);
  w.set(ref(C.walletTx, into.id), into);
  notify(w, recipient.email, `${profile.fullName} sent you ${money(amount)}`, memo || "Wallet transfer", "/app/activity");
  await batch.commit();
  return recipient;
}

/** Records a hand-off to an external app. The payment itself completes there, not on AGNCY. */
export async function logExternalPayment(profile: Profile, app: string, recipient: string, amount: number, note: string): Promise<void> {
  const id = newId();
  const tx: WalletTx = {
    id,
    uid: profile.uid,
    at: Date.now(),
    kind: "external",
    amount: 0,
    externalAmount: amount,
    title: `${app} · ${recipient}`,
    detail: note.trim() || `Opened in ${app} — completes there`,
  };
  await setDoc(ref(C.walletTx, id), tx);
}

/* ------------------------------------------------------------------ cards */

function freshCard(uid: string, replacements: number): VirtualCard {
  const now = new Date();
  return {
    uid,
    status: "active",
    // Test mode issues display details only — no real card number ever exists.
    last4: String(1000 + Math.floor(Math.random() * 9000)),
    expMonth: now.getMonth() + 1,
    expYear: now.getFullYear() + 4,
    issuedAt: now.getTime(),
    replacements,
  };
}

export async function activateCard(uid: string): Promise<void> {
  await setDoc(ref(C.cards, uid), freshCard(uid, 0));
}

export async function replaceCard(card: VirtualCard): Promise<void> {
  await setDoc(ref(C.cards, card.uid), freshCard(card.uid, card.replacements + 1));
}

export async function setCardFrozen(uid: string, frozen: boolean): Promise<void> {
  await updateDoc(ref(C.cards, uid), { status: frozen ? "frozen" : "active" });
}

/** Test mode only: records a small card purchase so card activity can be seen apart from income. */
export async function simulateCardPurchase(profile: Profile, card: VirtualCard): Promise<void> {
  if (card.status !== "active") throw new Error("Unfreeze the card first.");
  const amount = 1240;
  assertAmount(amount, await walletBalance(profile.uid));
  const id = newId();
  const tx: WalletTx = {
    id,
    uid: profile.uid,
    at: Date.now(),
    kind: "card",
    amount: -amount,
    title: "Test merchant",
    detail: `Virtual card ••${card.last4} · test purchase`,
  };
  await setDoc(ref(C.walletTx, id), tx);
}
