/**
 * Server-side CRM connectors. Each one reads the connected accounting system and returns the
 * same normalised payload. Failures are reported — never papered over with placeholder data.
 */
import dns from "node:dns";
import type { CrmAllocation, CrmCompany, CrmContact, CrmInvoice, CrmSyncPayload, InvoiceLine } from "../types";

// Some networks resolve these APIs to unreachable IPv6 addresses first.
dns.setDefaultResultOrder("ipv4first");

export class CrmError extends Error {
  constructor(
    message: string,
    /** 401 means the connection has expired and the agency needs to reconnect. */
    public status: number
  ) {
    super(message);
  }
}

export interface Tokens {
  accessToken?: string;
  refreshToken?: string;
}

export interface Refreshed {
  accessToken: string;
  refreshToken?: string;
  expiresIn: number;
}

export interface ConnectorResult {
  payload: CrmSyncPayload;
  refreshed: Refreshed | null;
}

type Json = Record<string, any>; // eslint-disable-line @typescript-eslint/no-explicit-any

const cents = (value: unknown) => Math.round((Number(value) || 0) * 100);
const text = (value: unknown) => (typeof value === "string" ? value.trim() : "");

function dateMs(value: unknown, fallback: number): number {
  const raw = text(value);
  if (!raw) return fallback;
  // Date-only strings are pinned to local noon so they never slip a day across time zones.
  const ms = Date.parse(/^\d{4}-\d{2}-\d{2}$/.test(raw) ? `${raw}T12:00:00` : raw);
  return Number.isFinite(ms) ? ms : fallback;
}

async function refreshTokens(url: string, clientId: string, clientSecret: string, refreshToken: string): Promise<Refreshed> {
  const res = await fetch(url, {
    method: "POST",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/x-www-form-urlencoded",
      Authorization: `Basic ${Buffer.from(`${clientId}:${clientSecret}`).toString("base64")}`,
    },
    body: new URLSearchParams({ grant_type: "refresh_token", refresh_token: refreshToken }),
    cache: "no-store",
  });
  if (!res.ok) throw new CrmError("The CRM connection has expired. Reconnect it in Settings.", 401);
  const data = (await res.json()) as Json;
  return { accessToken: data.access_token, refreshToken: data.refresh_token, expiresIn: Number(data.expires_in) || 1800 };
}

/** Wraps fetch with bearer auth and a single transparent token refresh. */
function authedClient(tokens: Tokens, refresh: (refreshToken: string) => Promise<Refreshed>, extraHeaders: Record<string, string> = {}) {
  let access = tokens.accessToken;
  let refreshed: Refreshed | null = null;

  const renew = async () => {
    if (refreshed || !tokens.refreshToken) throw new CrmError("The CRM connection has expired. Reconnect it in Settings.", 401);
    refreshed = await refresh(tokens.refreshToken);
    access = refreshed.accessToken;
  };

  const get = async (url: string): Promise<Json> => {
    if (!access) await renew();
    const call = () =>
      fetch(url, { headers: { Accept: "application/json", Authorization: `Bearer ${access}`, ...extraHeaders }, cache: "no-store" });
    let res = await call();
    if (res.status === 401) {
      await renew();
      res = await call();
    }
    if (res.status === 401 || res.status === 403) throw new CrmError("The CRM connection has expired. Reconnect it in Settings.", 401);
    if (!res.ok) throw new CrmError(`The CRM returned an error (${res.status}).`, 502);
    return (await res.json()) as Json;
  };

  return { get, refreshed: () => refreshed };
}

/* -------------------------------------------------- allocation convention */

interface Payee {
  name: string;
  email: string;
  kind: "talent" | "agency";
}

const COMPANY_WORDS = /\b(agency|management|mgmt|group|talent|partners|studio|studios|collective|llc|inc|ltd|limited|co)\b\.?/i;

/** A hint only — at payout time the recipient's real AGNCY account type decides how they are paid. */
function payeeKind(name: string): "talent" | "agency" {
  return COMPANY_WORDS.test(name) ? "agency" : "talent";
}

/**
 * Accounting systems have no native "allocation". The convention used here: an invoice line whose
 * description (or item name) names one of the CRM's vendors/suppliers is that payee's allocation.
 * An optional "NN% commission" in the line sets the agency commission. Lines that name nobody
 * stay with the agency.
 */
function allocationFor(key: string, lineText: string, amount: number, payees: Payee[]): CrmAllocation | null {
  if (amount <= 0) return null;
  const haystack = lineText.toLowerCase();
  const payee = payees.find((p) => p.name.length >= 3 && haystack.includes(p.name.toLowerCase()));
  if (!payee) return null;
  const pct = /(\d{1,2}(?:\.\d+)?)\s*%\s*(?:agency\s+)?commission/i.exec(lineText);
  const commission = pct ? Math.round((amount * Number(pct[1])) / 100) : 0;
  return {
    key,
    recipientName: payee.name,
    recipientEmail: payee.email,
    recipientType: payee.kind,
    description: lineText.trim(),
    gross: amount,
    commission,
    deductions: 0,
    net: amount - commission,
  };
}

/** Makes the visible lines add up to the amount being requested (tax, discounts, part-payments). */
function balanceLines(lines: InvoiceLine[], amount: number, label: string): InvoiceLine[] {
  const diff = amount - lines.reduce((s, l) => s + l.amount, 0);
  return diff === 0 ? lines : [...lines, { description: label, amount: diff }];
}

/* ------------------------------------------------------------- QuickBooks */

export async function syncQuickBooks(tokens: Tokens, realmId: string): Promise<ConnectorResult> {
  const clientId = process.env.QUICKBOOKS_CLIENT_ID;
  const clientSecret = process.env.QUICKBOOKS_CLIENT_SECRET;
  if (!clientId || !clientSecret) throw new CrmError("QuickBooks is not configured on this server.", 500);
  const production = (process.env.QUICKBOOKS_ENVIRONMENT || "").toLowerCase() === "production";
  const base = `${production ? "https://quickbooks.api.intuit.com" : "https://sandbox-quickbooks.api.intuit.com"}/v3/company/${encodeURIComponent(realmId)}`;
  const client = authedClient(tokens, (rt) =>
    refreshTokens("https://oauth.platform.intuit.com/oauth2/v1/tokens/bearer", clientId, clientSecret, rt)
  );
  const run = async (sql: string, entity: string): Promise<Json[]> => {
    const data = await client.get(`${base}/query?query=${encodeURIComponent(sql)}&minorversion=65`);
    return (data.QueryResponse?.[entity] as Json[]) ?? [];
  };

  // Sequential on purpose: the first call may refresh the token for the rest.
  const rawInvoices = await run("select * from Invoice orderby MetaData.LastUpdatedTime desc maxresults 300", "Invoice");
  const [customers, vendors, info] = await Promise.all([
    run("select * from Customer maxresults 1000", "Customer"),
    run("select * from Vendor maxresults 1000", "Vendor"),
    client.get(`${base}/companyinfo/${encodeURIComponent(realmId)}?minorversion=65`).catch(() => null),
  ]);

  const customerEmail = new Map(customers.map((c) => [String(c.Id), text(c.PrimaryEmailAddr?.Address)]));
  const payees: (Payee & { crmId: string; phone: string })[] = vendors
    .filter((v) => text(v.DisplayName))
    .map((v) => ({
      crmId: `vendor-${v.Id}`,
      name: text(v.DisplayName),
      email: text(v.PrimaryEmailAddr?.Address),
      phone: text(v.PrimaryPhone?.FreeFormNumber),
      kind: payeeKind(text(v.CompanyName) && !text(v.GivenName) ? `${text(v.DisplayName)} co` : text(v.DisplayName)),
    }));

  const now = Date.now();
  const invoices: CrmInvoice[] = rawInvoices.map((inv) => {
    const total = cents(inv.TotalAmt);
    const balance = cents(inv.Balance);
    const status = total === 0 ? "void" : balance === 0 ? "paid" : "open";
    const amount = status === "open" ? balance : total;
    const lines: InvoiceLine[] = [];
    const allocations: CrmAllocation[] = [];
    for (const line of (inv.Line as Json[]) ?? []) {
      if (line.DetailType !== "SalesItemLineDetail") continue;
      const item = text(line.SalesItemLineDetail?.ItemRef?.name);
      const description = text(line.Description) || item || "Services";
      const lineAmount = cents(line.Amount);
      lines.push({ description, amount: lineAmount });
      const allocation = allocationFor(String(line.Id ?? lines.length), `${description}${item && item !== description ? ` (${item})` : ""}`, lineAmount, payees);
      if (allocation) allocations.push({ ...allocation, description });
    }
    const issueDate = dateMs(inv.TxnDate, now);
    return {
      crmId: String(inv.Id),
      number: text(inv.DocNumber) || `QB-${inv.Id}`,
      brandName: text(inv.CustomerRef?.name) || "Customer",
      brandEmail: text(inv.BillEmail?.Address) || customerEmail.get(String(inv.CustomerRef?.value)) || "",
      description: text(inv.CustomerMemo?.value) || lines[0]?.description || "Invoice",
      lines: balanceLines(lines, amount, balance < total && status === "open" ? "Tax, adjustments and payments received" : "Tax and adjustments"),
      amount,
      currency: text(inv.CurrencyRef?.value) || "USD",
      issueDate,
      dueDate: dateMs(inv.DueDate, issueDate),
      status,
      allocations,
    };
  });

  const contacts: CrmContact[] = [
    ...customers
      .filter((c) => text(c.DisplayName))
      .map((c) => ({
        crmId: `customer-${c.Id}`,
        name: text(c.DisplayName),
        email: text(c.PrimaryEmailAddr?.Address),
        phone: text(c.PrimaryPhone?.FreeFormNumber),
        kind: "brand" as const,
      })),
    ...payees.map(({ crmId, name, email, phone, kind }) => ({ crmId, name, email, phone, kind })),
  ];

  const ci = info?.CompanyInfo as Json | undefined;
  const addr = ci?.CompanyAddr as Json | undefined;
  const company: CrmCompany | null = ci
    ? {
        name: text(ci.CompanyName),
        legalName: text(ci.LegalName),
        taxId: text(ci.EmployerId),
        address: [text(addr?.Line1), text(addr?.City), [text(addr?.CountrySubDivisionCode), text(addr?.PostalCode)].filter(Boolean).join(" ")]
          .filter(Boolean)
          .join(", "),
        website: text(ci.WebAddr?.URI),
        phone: text(ci.PrimaryPhone?.FreeFormNumber),
      }
    : null;

  return { payload: { provider: "quickbooks", company, invoices, contacts }, refreshed: client.refreshed() };
}

/* ------------------------------------------------------------------- Xero */

export async function syncXero(tokens: Tokens, tenantId: string): Promise<ConnectorResult> {
  const clientId = process.env.XERO_CLIENT_ID;
  const clientSecret = process.env.XERO_CLIENT_SECRET;
  if (!clientId || !clientSecret) throw new CrmError("Xero is not configured on this server.", 500);
  const base = "https://api.xero.com/api.xro/2.0";
  const client = authedClient(tokens, (rt) => refreshTokens("https://identity.xero.com/connect/token", clientId, clientSecret, rt), {
    "Xero-tenant-id": tenantId,
  });

  const invoiceData = await client.get(
    `${base}/Invoices?where=${encodeURIComponent('Type=="ACCREC"')}&order=${encodeURIComponent("UpdatedDateUTC DESC")}&page=1`
  );
  const [contactData, orgData] = await Promise.all([
    client.get(`${base}/Contacts?page=1`),
    client.get(`${base}/Organisation`).catch(() => null),
  ]);

  const rawContacts = (contactData.Contacts as Json[]) ?? [];
  const phoneOf = (c: Json) => {
    const p = ((c.Phones as Json[]) ?? []).find((x) => text(x.PhoneNumber));
    return p ? [text(p.PhoneCountryCode), text(p.PhoneAreaCode), text(p.PhoneNumber)].filter(Boolean).join(" ") : "";
  };
  const contactEmail = new Map(rawContacts.map((c) => [String(c.ContactID), text(c.EmailAddress)]));
  const payees: (Payee & { crmId: string; phone: string })[] = rawContacts
    .filter((c) => c.IsSupplier && text(c.Name))
    .map((c) => ({
      crmId: String(c.ContactID),
      name: text(c.Name),
      email: text(c.EmailAddress),
      phone: phoneOf(c),
      kind: payeeKind(text(c.Name)),
    }));

  const now = Date.now();
  const invoices: CrmInvoice[] = ((invoiceData.Invoices as Json[]) ?? [])
    .filter((inv) => ["AUTHORISED", "PAID", "VOIDED"].includes(text(inv.Status)))
    .map((inv) => {
      const total = cents(inv.Total);
      const due = cents(inv.AmountDue);
      const status = inv.Status === "VOIDED" ? "void" : inv.Status === "PAID" || due === 0 ? "paid" : "open";
      const amount = status === "open" ? due : total;
      const lines: InvoiceLine[] = [];
      const allocations: CrmAllocation[] = [];
      for (const line of (inv.LineItems as Json[]) ?? []) {
        const description = text(line.Description) || "Services";
        const lineAmount = cents(line.LineAmount);
        lines.push({ description, amount: lineAmount });
        const allocation = allocationFor(String(line.LineItemID ?? lines.length), description, lineAmount, payees);
        if (allocation) allocations.push(allocation);
      }
      const issueDate = dateMs(inv.DateString, now);
      return {
        crmId: String(inv.InvoiceID),
        number: text(inv.InvoiceNumber) || "Invoice",
        brandName: text(inv.Contact?.Name) || "Customer",
        brandEmail: text(inv.Contact?.EmailAddress) || contactEmail.get(String(inv.Contact?.ContactID)) || "",
        description: text(inv.Reference) || lines[0]?.description || "Invoice",
        lines: balanceLines(lines, amount, due < total && status === "open" ? "Tax, adjustments and payments received" : "Tax and adjustments"),
        amount,
        currency: text(inv.CurrencyCode) || "USD",
        issueDate,
        dueDate: dateMs(inv.DueDateString, issueDate),
        status,
        allocations,
      } satisfies CrmInvoice;
    });

  const contacts: CrmContact[] = rawContacts
    .filter((c) => text(c.Name) && text(c.ContactStatus) !== "ARCHIVED")
    .map((c) => {
      const payee = payees.find((p) => p.crmId === String(c.ContactID));
      return {
        crmId: String(c.ContactID),
        name: text(c.Name),
        email: text(c.EmailAddress),
        phone: phoneOf(c),
        kind: payee ? payee.kind : ("brand" as const),
      };
    });

  const org = (orgData?.Organisations as Json[] | undefined)?.[0];
  const address = ((org?.Addresses as Json[]) ?? []).find((a) => text(a.AddressLine1));
  const company: CrmCompany | null = org
    ? {
        name: text(org.Name),
        legalName: text(org.LegalName),
        taxId: text(org.TaxNumber),
        address: address
          ? [text(address.AddressLine1), text(address.City), [text(address.Region), text(address.PostalCode)].filter(Boolean).join(" ")]
              .filter(Boolean)
              .join(", ")
          : "",
        website: "",
        phone: "",
      }
    : null;

  return { payload: { provider: "xero", company, invoices, contacts }, refreshed: client.refreshed() };
}
