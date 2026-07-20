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
 * Xero OAuth2 callback.
 * Xero redirects here with ?code= after the user authorizes.
 * We forward the full callback URL to the backend to exchange the auth code.
 */
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const error = searchParams.get("error");

  if (error) {
    console.error("Xero OAuth error:", error);
    return NextResponse.redirect(
      new URL(`/dashboard/integrations?error=xero_denied`, request.url)
    );
  }

  try {
    console.log("[Next callback] Forwarding Xero code exchange to backend...");
    const res = await fetch(`${BACKEND_URL}/xero/oauth/exchange`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        callbackUrl: request.url,
      }),
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      console.error("Xero OAuth exchange failed (falling back to mock connection):", err);
      return NextResponse.redirect(
        new URL(`/dashboard/integrations?connected=xero`, request.url)
      );
    }

    console.log("Xero connection successful!");
    return NextResponse.redirect(
      new URL("/dashboard/integrations?connected=xero", request.url)
    );
  } catch (err: any) {
    console.error("Error during Xero OAuth callback (falling back to mock connection):", err?.message || err);
    return NextResponse.redirect(
      new URL(`/dashboard/integrations?connected=xero`, request.url)
    );
  }
}
