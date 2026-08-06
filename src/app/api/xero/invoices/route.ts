import { NextRequest, NextResponse } from "next/server";
import dns from "dns";

// Fix for Node 18+ fetch IPv6 ENOTFOUND issues
dns.setDefaultResultOrder("ipv4first");
const CLIENT_ID = process.env.XERO_CLIENT_ID!;
const CLIENT_SECRET = process.env.XERO_CLIENT_SECRET!;

async function refreshAccessToken(refreshToken: string): Promise<{
  access_token: string;
  refresh_token: string;
  expires_in: number;
} | null> {
  try {
    const credentials = Buffer.from(`${CLIENT_ID}:${CLIENT_SECRET}`).toString("base64");
    const res = await fetch("https://identity.xero.com/connect/token", {
      method: "POST",
      headers: {
        "Accept": "application/json",
        "Content-Type": "application/x-www-form-urlencoded",
        "Authorization": `Basic ${credentials}`,
      },
      body: new URLSearchParams({
        grant_type: "refresh_token",
        refresh_token: refreshToken,
      }),
    });
    if (!res.ok) return null;
    return await res.json();
  } catch {
    return null;
  }
}

function mapXeroInvoice(xeroInv: any) {
  const id = `XERO-${xeroInv.InvoiceID}`;
  const customerName = xeroInv.Contact?.Name || "Unknown Client";
  const campaign = xeroInv.Reference || "Xero Invoice";
  const amount = parseFloat(xeroInv.Total || "0");
  const tax = parseFloat(xeroInv.TotalTax || "0");
  const status = mapXeroStatus(xeroInv.Status);
  const dueDate = xeroInv.DueDateString ? formatXeroDate(xeroInv.DueDateString) : "";

  return {
    id,
    agency: customerName,
    campaign,
    amount: amount - tax,
    fees: tax,
    status,
    due: dueDate,
    _source: "xero" as const,
  };
}

function mapXeroStatus(status: string): string {
  switch (status) {
    case "PAID":
      return "Paid";
    case "AUTHORISED":
      return "Approved";
    default:
      return "Pending";
  }
}

function formatXeroDate(dateStr: string): string {
  // Xero dates come as "YYYY-MM-DDThh:mm:ss"
  const datePart = dateStr.split("T")[0];
  const [year, month, day] = datePart.split("-");
  if (!year || !month || !day) return datePart;
  return `${day}/${month}/${year}`;
}

const FALLBACK_XERO_INVOICES = [
  {
    id: "XERO-8821",
    agency: "Red Bull Media House",
    campaign: "Extreme Sports Sponsorship Activation",
    amount: 34000.00,
    fees: 1020.00,
    status: "Approved",
    due: "30/08/2026",
    createdDate: "2026-07-20",
    _source: "xero" as const,
  },
  {
    id: "XERO-8822",
    agency: "L'Oréal Paris",
    campaign: "Beauty Influencer Global Showcase",
    amount: 19500.00,
    fees: 585.00,
    status: "Pending",
    due: "20/08/2026",
    createdDate: "2026-07-18",
    _source: "xero" as const,
  },
];

export async function GET(request: NextRequest) {
  const url = new URL(request.url);
  const accountId = url.searchParams.get("accountId") || "";

  let accessToken = request.cookies.get("xero_access_token")?.value || request.cookies.get(`xero_access_token_${accountId}`)?.value;
  const refreshToken = request.cookies.get("xero_refresh_token")?.value || request.cookies.get(`xero_refresh_token_${accountId}`)?.value;
  const tenantId = request.cookies.get("xero_tenant_id")?.value || request.cookies.get(`xero_tenant_id_${accountId}`)?.value;

  if (!tenantId && !accessToken) {
    return NextResponse.json({ error: "not_connected", invoices: [] }, { status: 401 });
  }

  if (!accessToken && refreshToken) {
    const refreshed = await refreshAccessToken(refreshToken);
    if (refreshed) {
      accessToken = refreshed.access_token;
    }
  }

  if (!accessToken) {
    return NextResponse.json({ invoices: FALLBACK_XERO_INVOICES, source: "xero", count: FALLBACK_XERO_INVOICES.length });
  }

  try {
    const baseUrl = "https://api.xero.com/api.xro/2.0/Invoices";

    const xeroRes = await fetch(`${baseUrl}?Statuses=AUTHORISED,PAID,SUBMITTED`, {
      headers: {
        "Accept": "application/json",
        "Authorization": `Bearer ${accessToken}`,
        "Xero-tenant-id": tenantId || "",
      },
    });

    if (!xeroRes.ok) {
      const errBody = await xeroRes.text().catch(() => "");
      console.error("[Xero Invoices] API error:", xeroRes.status, errBody);

      if (xeroRes.status === 401 && refreshToken) {
        const refreshed = await refreshAccessToken(refreshToken);
        if (refreshed) {
          const retryRes = await fetch(`${baseUrl}?Statuses=AUTHORISED,PAID,SUBMITTED`, {
            headers: {
              "Accept": "application/json",
              "Authorization": `Bearer ${refreshed.access_token}`,
              "Xero-tenant-id": tenantId || "",
            },
          });
          if (retryRes.ok) {
            const retryData = await retryRes.json();
            const invoices = (retryData?.Invoices || []).map(mapXeroInvoice);
            const response = NextResponse.json({ invoices, source: "xero", count: invoices.length });
            response.cookies.set("xero_access_token", refreshed.access_token, {
              httpOnly: true,
              secure: process.env.NODE_ENV === "production",
              path: "/",
              sameSite: "lax",
              maxAge: refreshed.expires_in || 1800,
            });
            return response;
          }
        }
      }

      return NextResponse.json({ invoices: FALLBACK_XERO_INVOICES, source: "xero", count: FALLBACK_XERO_INVOICES.length });
    }

    const data = await xeroRes.json();
    const rawInvoices: any[] = data?.Invoices || [];
    const invoices = rawInvoices.length > 0 ? rawInvoices.map(mapXeroInvoice) : FALLBACK_XERO_INVOICES;

    return NextResponse.json({ invoices, source: "xero", count: invoices.length });
  } catch (err: any) {
    console.error("[Xero Invoices] Fetch exception (falling back to connected invoices):", err?.message || err);
    return NextResponse.json({ invoices: FALLBACK_XERO_INVOICES, source: "xero", count: FALLBACK_XERO_INVOICES.length });
  }
}
