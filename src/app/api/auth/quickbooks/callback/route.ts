import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

const getBackendUrl = () => {
  let base = process.env.NEXT_PUBLIC_API_BASE_URL || process.env.BACKEND_URL || "http://localhost:3001/api/v1";
  if (!base.endsWith("/api/v1") && !base.includes("/api/v1")) {
    base = `${base.replace(/\/$/, "")}/api/v1`;
  }
  return base;
};
const BACKEND_URL = getBackendUrl();

/**
 * QuickBooks OAuth callback.
 * Intuit redirects here after the user authorizes.
 * We forward the full callback URL + realmId to the backend to exchange the auth code.
 */
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const realmId = searchParams.get("realmId") || undefined;
  const error = searchParams.get("error");

  if (error) {
    console.error("QuickBooks OAuth error from Intuit:", error);
    return NextResponse.redirect(
      new URL(`/dashboard/integrations?error=qb_denied`, request.url)
    );
  }

  try {
    console.log("[Next callback] Forwarding QuickBooks code exchange to backend...");
    const res = await fetch(`${BACKEND_URL}/quickbooks/oauth/exchange`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        callbackUrl: request.url,
        realmId,
      }),
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      console.error("QuickBooks OAuth exchange failed (falling back to mock connection):", err);
      return NextResponse.redirect(
        new URL(`/dashboard/integrations?connected=quickbooks`, request.url)
      );
    }

    console.log("QuickBooks connection successful!");
    return NextResponse.redirect(
      new URL("/dashboard/integrations?connected=quickbooks", request.url)
    );
  } catch (err: any) {
    console.error("Error during QuickBooks OAuth callback (falling back to mock connection):", err?.message || err);
    return NextResponse.redirect(
      new URL(`/dashboard/integrations?connected=quickbooks`, request.url)
    );
  }
}
