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

export async function GET(request: NextRequest) {
  let accessToken = request.cookies.get("xero_access_token")?.value;
  const refreshToken = request.cookies.get("xero_refresh_token")?.value;
  const tenantId = request.cookies.get("xero_tenant_id")?.value;

  if (!tenantId) {
    return NextResponse.json({ error: "not_connected", invoices: [] }, { status: 401 });
  }

  if (!accessToken && refreshToken) {
    const refreshed = await refreshAccessToken(refreshToken);
    if (refreshed) {
      accessToken = refreshed.access_token;
    }
  }

  if (!accessToken) {
    return NextResponse.json({ error: "token_expired", invoices: [] }, { status: 401 });
  }

  try {
    const baseUrl = "https://api.xero.com/api.xro/2.0/Invoices";

    const xeroRes = await fetch(`${baseUrl}?Statuses=AUTHORISED,PAID,SUBMITTED`, {
      headers: {
        "Accept": "application/json",
        "Authorization": `Bearer ${accessToken}`,
        "Xero-tenant-id": tenantId,
      },
    });

    if (!xeroRes.ok) {
      const errBody = await xeroRes.text();
      console.error("[Xero Invoices] API error:", xeroRes.status, errBody);

      if (xeroRes.status === 401) {
        if (refreshToken) {
          const refreshed = await refreshAccessToken(refreshToken);
          if (refreshed) {
            const retryRes = await fetch(`${baseUrl}?Statuses=AUTHORISED,PAID,SUBMITTED`, {
              headers: {
                "Accept": "application/json",
                "Authorization": `Bearer ${refreshed.access_token}`,
                "Xero-tenant-id": tenantId,
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
              if (refreshed.refresh_token) {
                response.cookies.set("xero_refresh_token", refreshed.refresh_token, {
                  httpOnly: true,
                  secure: process.env.NODE_ENV === "production",
                  path: "/",
                  sameSite: "lax",
                  maxAge: 60 * 60 * 24 * 60,
                });
              }
              return response;
            }
          }
        }
        return NextResponse.json({ error: "unauthorized", invoices: [] }, { status: 401 });
      }

      return NextResponse.json({ error: "xero_api_error", invoices: [] }, { status: xeroRes.status });
    }

    const data = await xeroRes.json();
    const rawInvoices: any[] = data?.Invoices || [];
    const invoices = rawInvoices.map(mapXeroInvoice);

    return NextResponse.json({ invoices, source: "xero", count: invoices.length });
  } catch (err: any) {
    console.error("[Xero Invoices] Unexpected error:", err);
    return NextResponse.json({ error: "server_error", invoices: [] }, { status: 500 });
  }
}
