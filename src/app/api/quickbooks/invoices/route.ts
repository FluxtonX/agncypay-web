import { NextRequest, NextResponse } from "next/server";
import dns from "dns";

// Fix for Node 18+ fetch IPv6 ENOTFOUND issues
dns.setDefaultResultOrder("ipv4first");
const CLIENT_ID = process.env.QUICKBOOKS_CLIENT_ID!;
const CLIENT_SECRET = process.env.QUICKBOOKS_CLIENT_SECRET!;

/** QuickBooks API base URL — sandbox vs production */
function getQbBaseUrl(realmId: string) {
  const useSandbox = process.env.QUICKBOOKS_SANDBOX === "true";
  const base = useSandbox
    ? "https://sandbox-quickbooks.api.intuit.com"
    : "https://quickbooks.api.intuit.com";
  return `${base}/v3/company/${realmId}`;
}

async function refreshAccessToken(refreshToken: string): Promise<{
  access_token: string;
  expires_in: number;
} | null> {
  try {
    const credentials = Buffer.from(`${CLIENT_ID}:${CLIENT_SECRET}`).toString("base64");
    const res = await fetch("https://oauth.platform.intuit.com/oauth2/v1/tokens/bearer", {
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

/** Map a QuickBooks invoice line item to a readable description */
function getQbLineDescription(line: any): string {
  if (line.Description) return line.Description;
  if (line.SalesItemLineDetail?.ItemRef?.name) {
    return line.SalesItemLineDetail.ItemRef.name;
  }
  return "Service";
}

/** Map a QuickBooks Invoice object to our InvoiceRow format */
function mapQbInvoice(qbInv: any) {
  const id = `QB-${qbInv.Id}`;
  const customerName =
    qbInv.CustomerRef?.name || "Unknown Client";
  const campaign =
    qbInv.Line?.find((l: any) => l.DetailType === "SalesItemLineDetail")
      ? getQbLineDescription(
          qbInv.Line.find((l: any) => l.DetailType === "SalesItemLineDetail")
        )
      : "QuickBooks Invoice";
  const amount = parseFloat(qbInv.TotalAmt || "0");
  const tax = parseFloat(qbInv.TxnTaxDetail?.TotalTax || "0");
  const status = mapQbStatus(qbInv.Balance, qbInv.EmailStatus);
  const dueDate = qbInv.DueDate
    ? formatDueDate(qbInv.DueDate)
    : formatDueDate(qbInv.TxnDate);

  return {
    id,
    agency: customerName,
    campaign,
    amount: amount - tax,
    fees: tax,
    status,
    due: dueDate,
    _source: "quickbooks" as const,
  };
}

function mapQbStatus(balance: number, emailStatus: string): string {
  if (balance === 0) return "Paid";
  if (emailStatus === "EmailSent") return "Approved";
  return "Pending";
}

function formatDueDate(dateStr: string): string {
  // QB dates come as YYYY-MM-DD, we store as DD/MM/YYYY
  const [year, month, day] = (dateStr || "").split("-");
  if (!year || !month || !day) return dateStr || "";
  return `${day}/${month}/${year}`;
}

function formatUSD(value: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(value);
}

export async function GET(request: NextRequest) {
  let accessToken = request.cookies.get("qb_access_token")?.value;
  const refreshToken = request.cookies.get("qb_refresh_token")?.value;
  const realmId = request.cookies.get("qb_realm_id")?.value;

  if (!realmId) {
    return NextResponse.json({ error: "not_connected", invoices: [] }, { status: 401 });
  }

  // Try to refresh token if access token is missing
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
    const baseUrl = getQbBaseUrl(realmId);
    const query = encodeURIComponent(
      "SELECT * FROM Invoice ORDERBY MetaData.LastUpdatedTime DESC MAXRESULTS 100"
    );

    const qbRes = await fetch(`${baseUrl}/query?query=${query}&minorversion=65`, {
      headers: {
        "Accept": "application/json",
        "Authorization": `Bearer ${accessToken}`,
      },
    });

    if (!qbRes.ok) {
      const errBody = await qbRes.text();
      console.error("[QB Invoices] API error:", qbRes.status, errBody);
      require("fs").writeFileSync("/tmp/qb_error.log", `Status: ${qbRes.status}\nBody: ${errBody}`);

      if (qbRes.status === 401) {
        // Try refresh
        if (refreshToken) {
          const refreshed = await refreshAccessToken(refreshToken);
          if (refreshed) {
            // Retry with new token
            const retryRes = await fetch(`${baseUrl}/query?query=${query}&minorversion=65`, {
              headers: {
                "Accept": "application/json",
                "Authorization": `Bearer ${refreshed.access_token}`,
              },
            });
            if (retryRes.ok) {
              const retryData = await retryRes.json();
              const invoices = (retryData?.QueryResponse?.Invoice || []).map(mapQbInvoice);
              const response = NextResponse.json({ invoices, source: "quickbooks" });
              response.cookies.set("qb_access_token", refreshed.access_token, {
                httpOnly: true,
                secure: process.env.NODE_ENV === "production",
                path: "/",
                sameSite: "lax",
                maxAge: refreshed.expires_in || 3600,
              });
              return response;
            }
          }
        }
        return NextResponse.json({ error: "unauthorized", invoices: [] }, { status: 401 });
      }

      return NextResponse.json(
        { error: "quickbooks_api_error", invoices: [] },
        { status: qbRes.status }
      );
    }

    const data = await qbRes.json();
    const rawInvoices: any[] = data?.QueryResponse?.Invoice || [];
    const invoices = rawInvoices.map(mapQbInvoice);

    return NextResponse.json({ invoices, source: "quickbooks", count: invoices.length });
  } catch (err: any) {
    console.error("[QB Invoices] Unexpected error:", err);
    require("fs").writeFileSync("/tmp/qb_error.log", `Unexpected Error: ${err.message || String(err)}`);
    return NextResponse.json({ error: "server_error", invoices: [] }, { status: 500 });
  }
}
