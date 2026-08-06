import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const url = new URL(request.url);
  const accountId = url.searchParams.get("accountId") || "";

  const qbRealmId = request.cookies.get("qb_realm_id")?.value || (accountId ? request.cookies.get(`qb_realm_id_${accountId}`)?.value : undefined);
  const xeroTenantId = request.cookies.get("xero_tenant_id")?.value || (accountId ? request.cookies.get(`xero_tenant_id_${accountId}`)?.value : undefined);

  return NextResponse.json({
    quickbooks: !!qbRealmId,
    xero: !!xeroTenantId,
  });
}
