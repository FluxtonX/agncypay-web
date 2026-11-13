import { NextRequest, NextResponse } from "next/server";
import { CrmError, syncQuickBooks, syncXero, type ConnectorResult } from "@/lib/crm/server";

/**
 * GET /api/crm/sync?provider=quickbooks|xero
 *
 * Reads the connected CRM using the OAuth cookies set by /api/auth/{provider}/callback and returns
 * normalised invoices, allocations and contacts. Tokens never leave the server.
 */
export async function GET(request: NextRequest) {
  const provider = request.nextUrl.searchParams.get("provider");
  const cookie = (name: string) => request.cookies.get(name)?.value;
  // The CRM login lives in the browser that authorised it. A browser without it is "not connected
  // here", which the app shows as a prompt for this device rather than an org-wide sync failure.
  const notHere = (name: string) =>
    NextResponse.json({ error: `${name} isn't connected in this browser yet.`, code: "not_connected_here" }, { status: 401 });

  try {
    let result: ConnectorResult;
    let prefix: "qb" | "xero";
    let refreshMaxAge: number;

    if (provider === "quickbooks") {
      const realmId = cookie("qb_realm_id");
      if (!realmId) return notHere("QuickBooks");
      prefix = "qb";
      refreshMaxAge = 60 * 60 * 24 * 100;
      result = await syncQuickBooks({ accessToken: cookie("qb_access_token"), refreshToken: cookie("qb_refresh_token") }, realmId);
    } else if (provider === "xero") {
      const tenantId = cookie("xero_tenant_id");
      if (!tenantId) return notHere("Xero");
      prefix = "xero";
      refreshMaxAge = 60 * 60 * 24 * 60;
      result = await syncXero({ accessToken: cookie("xero_access_token"), refreshToken: cookie("xero_refresh_token") }, tenantId);
    } else {
      return NextResponse.json({ error: "Unknown CRM provider." }, { status: 400 });
    }

    const response = NextResponse.json(result.payload, { headers: { "Cache-Control": "no-store" } });
    if (result.refreshed) {
      const opts = { httpOnly: true, secure: process.env.NODE_ENV === "production", path: "/", sameSite: "lax" as const };
      response.cookies.set(`${prefix}_access_token`, result.refreshed.accessToken, { ...opts, maxAge: result.refreshed.expiresIn });
      if (result.refreshed.refreshToken) {
        response.cookies.set(`${prefix}_refresh_token`, result.refreshed.refreshToken, { ...opts, maxAge: refreshMaxAge });
      }
    }
    return response;
  } catch (err) {
    if (err instanceof CrmError) return NextResponse.json({ error: err.message }, { status: err.status });
    console.error("[crm/sync]", err);
    return NextResponse.json({ error: "Could not reach the CRM. We'll keep trying automatically." }, { status: 502 });
  }
}
