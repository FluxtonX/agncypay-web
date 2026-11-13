import { NextRequest, NextResponse } from "next/server";
import { CrmError, recordQuickBooksPayments, type PaymentToRecord } from "@/lib/crm/server";

/**
 * POST /api/crm/record-payment  { provider: "quickbooks", items: PaymentToRecord[] }
 *
 * Marks invoices that brands paid through AGNCY as paid in the agency's QuickBooks. Uses the OAuth
 * cookies of the agency's own browser (the agency app calls this during its automatic sync), so
 * tokens never leave the server and are never stored anywhere else.
 */
export async function POST(request: NextRequest) {
  const body = (await request.json().catch(() => null)) as { provider?: string; items?: PaymentToRecord[] } | null;
  if (body?.provider !== "quickbooks") {
    return NextResponse.json({ error: "Only QuickBooks supports payment write-back for now." }, { status: 400 });
  }
  const items = (body.items ?? [])
    .filter((i) => i && typeof i.crmId === "string" && Number.isInteger(i.amount) && i.amount > 0 && Number.isFinite(i.paidAt))
    .slice(0, 25)
    .map((i) => ({ crmId: i.crmId, amount: i.amount, paidAt: i.paidAt, reference: String(i.reference ?? "").slice(0, 60) }));
  if (items.length === 0) return NextResponse.json({ results: [] });

  const cookie = (name: string) => request.cookies.get(name)?.value;
  try {
    const realmId = cookie("qb_realm_id");
    if (!realmId) {
      return NextResponse.json({ error: "QuickBooks isn't connected in this browser yet.", code: "not_connected_here" }, { status: 401 });
    }
    const { results, refreshed } = await recordQuickBooksPayments(
      { accessToken: cookie("qb_access_token"), refreshToken: cookie("qb_refresh_token") },
      realmId,
      items
    );
    const response = NextResponse.json({ results }, { headers: { "Cache-Control": "no-store" } });
    if (refreshed) {
      const opts = { httpOnly: true, secure: process.env.NODE_ENV === "production", path: "/", sameSite: "lax" as const };
      response.cookies.set("qb_access_token", refreshed.accessToken, { ...opts, maxAge: refreshed.expiresIn });
      if (refreshed.refreshToken) response.cookies.set("qb_refresh_token", refreshed.refreshToken, { ...opts, maxAge: 60 * 60 * 24 * 100 });
    }
    return response;
  } catch (err) {
    if (err instanceof CrmError) return NextResponse.json({ error: err.message }, { status: err.status });
    console.error("[crm/record-payment]", err);
    return NextResponse.json({ error: "Could not reach QuickBooks. We'll keep trying automatically." }, { status: 502 });
  }
}
