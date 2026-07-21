import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const qbRealmId = request.cookies.get("qb_realm_id")?.value;
  const xeroTenantId = request.cookies.get("xero_tenant_id")?.value;

  return NextResponse.json({
    quickbooks: !!qbRealmId,
    xero: !!xeroTenantId,
  });
}
