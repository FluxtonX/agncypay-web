/**
 * AGNCY Phase 1 data model.
 *
 * Money is always integer cents. Timestamps are epoch milliseconds.
 * Emails are stored lower-cased so they can be matched across collections.
 */

export type AccountType = "brand" | "agency" | "individual";
export type CrmProvider = "quickbooks" | "xero" | "sandbox";

/* ------------------------------------------------------------------ users */

export interface NotificationPrefs {
  payments: boolean;
  requests: boolean;
  product: boolean;
}

export interface Profile {
  uid: string;
  email: string;
  fullName: string;
  accountType: AccountType;
  /** Business name for brands and agencies; display name for individuals. */
  workspaceName: string;
  /** Human-readable account reference (BRND-/AGY-/TAL-######). */
  agencyId: string;
  createdAt: string;
  parentAgencyEmail?: string;
  parentAgencyUid?: string;
  /** Agencies: the org this login belongs to. Owners default to their uid. */
  orgId?: string;
  orgRole?: "owner" | "member";
  /** Individuals: Wallet ID without the leading @. */
  handle?: string;
  phone?: string;
  prefs?: NotificationPrefs;
}

/* ------------------------------------------------------------------- orgs */

export interface SandboxEdit {
  amount?: number;
  description?: string;
  dueDate?: number;
}

export interface Org {
  id: string;
  name: string;
  ownerUid: string;
  ownerEmail: string;
  ownerName: string;
  memberUids: string[];
  /** Lower-cased emails of everyone on the team — used to match incoming allocations. */
  emails: string[];
  business: {
    legalName: string;
    taxId: string;
    address: string;
    website: string;
    phone: string;
    /** Where the details came from. CRM sync keeps prefilling until someone edits them by hand. */
    source: "signup" | "crm" | "manual";
  };
  verification: {
    status: "unverified" | "verified";
    verifiedAt?: number;
  };
  crm: {
    provider: CrmProvider | null;
    companyName?: string;
    connectedAt?: number;
    lastSyncAt?: number;
    lastSyncError?: string | null;
  };
  /** Sandbox CRM only: stable seed plus tester-supplied recipients and simulated CRM edits. */
  sandbox?: {
    seededAt: number;
    brandEmail?: string;
    talentEmail?: string;
    partnerEmail?: string;
    edits?: Record<string, SandboxEdit>;
  };
  createdAt: number;
}

export interface BankAccount {
  id: string;
  ownerType: "org" | "user";
  ownerId: string;
  institution: string;
  name: string;
  mask: string;
  subtype: string;
  source: "plaid" | "manual";
  /** Orgs: default account incoming brand payments settle to. */
  receiving: boolean;
  /** Orgs: default account payouts are funded from. */
  funding: boolean;
  createdAt: number;
}

/* --------------------------------------------------------------- invoices */

export type InvoiceStatus = "not_sent" | "sent" | "viewed" | "declined" | "paid" | "void";

export interface InvoiceLine {
  description: string;
  amount: number;
}

export interface Invoice {
  id: string;
  orgId: string;
  orgName: string;
  provider: CrmProvider;
  crmId: string;
  number: string;
  brandName: string;
  brandEmail: string;
  description: string;
  lines: InvoiceLine[];
  amount: number;
  currency: string;
  issueDate: number;
  dueDate: number;
  /** Fingerprint of the CRM content; compared with `sentHash` to detect CRM edits. */
  crmHash: string;
  status: InvoiceStatus;
  /** Public payment-link token, issued the first time the request is sent. */
  token?: string;
  sentAt?: number;
  sentHash?: string;
  sentCount?: number;
  viewedAt?: number;
  reminders?: number[];
  decline?: { reason: string; correction: string; at: number; by: string } | null;
  paidAt?: number;
  paymentId?: string;
  /** `agncy` = paid through a payment link; `crm` = recorded as paid in the CRM. */
  paidVia?: "agncy" | "crm";
  /** The connected bank account this invoice settles to (defaults to the org's receiving account). */
  receivingAccountId?: string;
  createdAt: number;
  updatedAt: number;
}

/* ------------------------------------------------------------ allocations */

export type RecipientType = "talent" | "agency";
export type AllocationStatus = "unpaid" | "requested" | "pending" | "paid";

export interface Allocation {
  id: string;
  /** The agency that holds the booking and pays this allocation. */
  orgId: string;
  orgName: string;
  invoiceId: string;
  invoiceNumber: string;
  brandName: string;
  description: string;
  recipientName: string;
  recipientEmail: string;
  recipientType: RecipientType;
  gross: number;
  commission: number;
  deductions: number;
  net: number;
  currency: string;
  /** Mirrors the parent invoice so recipients can see when a request is allowed. */
  invoicePaid: boolean;
  status: AllocationStatus;
  payoutId?: string | null;
  requestedAt?: number | null;
  requestedBy?: string | null;
  paidAt?: number | null;
  updatedAt: number;
}

/* ---------------------------------------------------------------- payouts */

export type PayoutStatus = "pending_recipient" | "paid" | "cancelled" | "reversed";

export interface PayoutLine {
  allocationId: string;
  invoiceId: string;
  invoiceNumber: string;
  brandName: string;
  description: string;
  gross: number;
  commission: number;
  deductions: number;
  net: number;
}

export interface Payout {
  id: string;
  orgId: string;
  orgName: string;
  /** Payouts authorised together share a batch. */
  batchId: string;
  recipientName: string;
  recipientEmail: string;
  recipientType: RecipientType;
  recipientUid?: string | null;
  recipientOrgId?: string | null;
  lines: PayoutLine[];
  amount: number;
  currency: string;
  fundingAccountId: string;
  fundingLabel: string;
  status: PayoutStatus;
  /** Why a pending payout is waiting. */
  pendingReason?: "registration" | "bank_account" | null;
  inviteId?: string | null;
  createdAt: number;
  createdBy: string;
  createdByName: string;
  paidAt?: number | null;
  closedAt?: number | null;
}

/* --------------------------------------------------------------- payments */

export interface PaymentItem {
  invoiceId: string;
  orgId: string;
  orgName: string;
  number: string;
  description: string;
  amount: number;
}

export interface Payment {
  id: string;
  receiptNo: string;
  payerName: string;
  payerEmail: string;
  payerUid: string | null;
  guest: boolean;
  items: PaymentItem[];
  orgIds: string[];
  total: number;
  currency: string;
  methodLabel: string;
  status: "succeeded";
  createdAt: number;
}

/* ------------------------------------------------- activity, notices, etc */

export type ActivityType =
  | "crm"
  | "request_sent"
  | "request_resent"
  | "reminder"
  | "viewed"
  | "declined"
  | "payment_received"
  | "payout_sent"
  | "payout_invited"
  | "payout_released"
  | "payout_cancelled"
  | "payout_reversed"
  | "allocation_requested"
  | "bank"
  | "team"
  | "business";

export interface ActivityEvent {
  id: string;
  orgId: string;
  at: number;
  type: ActivityType;
  summary: string;
  actor: string;
  amount?: number | null;
  invoiceId?: string | null;
  payoutId?: string | null;
}

export interface Notice {
  id: string;
  /** An org id (agency teams) or a lower-cased email (brands and individuals). */
  to: string;
  title: string;
  body: string;
  href: string;
  at: number;
  read: boolean;
}

export type InviteKind = "team" | "talent" | "agency";

export interface Invite {
  id: string;
  kind: InviteKind;
  email: string;
  name: string;
  orgId: string;
  orgName: string;
  invitedBy: string;
  /** Send & Invite: the payout waiting for this recipient. */
  payoutId?: string | null;
  amount?: number | null;
  status: "pending" | "accepted" | "revoked";
  createdAt: number;
  acceptedAt?: number | null;
}

export interface Contact {
  id: string;
  orgId: string;
  crmId: string;
  name: string;
  email: string;
  phone: string;
  kind: "talent" | "agency" | "brand";
  updatedAt: number;
}

export type WalletTxKind =
  | "earning"
  | "reversal"
  | "withdrawal"
  | "transfer_in"
  | "transfer_out"
  | "card"
  | "external";

export interface WalletTx {
  id: string;
  uid: string;
  at: number;
  kind: WalletTxKind;
  /** Signed cents: positive credits the wallet, negative debits it. */
  amount: number;
  /** Hand-offs to Venmo, Cash App or Zelle never touch the wallet; this records what was sent there. */
  externalAmount?: number;
  title: string;
  detail: string;
  payoutId?: string | null;
}

export interface VirtualCard {
  uid: string;
  status: "active" | "frozen";
  last4: string;
  expMonth: number;
  expYear: number;
  issuedAt: number;
  replacements: number;
}

/* ------------------------------------------------------- CRM sync payload */

export interface CrmAllocation {
  /** Stable within the invoice. */
  key: string;
  recipientName: string;
  recipientEmail: string;
  recipientType: RecipientType;
  description: string;
  gross: number;
  commission: number;
  deductions: number;
  net: number;
}

export interface CrmInvoice {
  crmId: string;
  number: string;
  brandName: string;
  brandEmail: string;
  description: string;
  lines: InvoiceLine[];
  amount: number;
  currency: string;
  issueDate: number;
  dueDate: number;
  status: "open" | "paid" | "void";
  allocations: CrmAllocation[];
}

export interface CrmContact {
  crmId: string;
  name: string;
  email: string;
  phone: string;
  kind: "talent" | "agency" | "brand";
}

export interface CrmCompany {
  name: string;
  legalName: string;
  taxId: string;
  address: string;
  website: string;
  phone: string;
}

export interface CrmSyncPayload {
  provider: CrmProvider;
  company: CrmCompany | null;
  invoices: CrmInvoice[];
  contacts: CrmContact[];
}
