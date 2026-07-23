import { NextRequest, NextResponse } from "next/server";

const CLIENT_ID = process.env.QUICKBOOKS_CLIENT_ID!;

const SCOPES = [
  "com.intuit.quickbooks.accounting",
].join(" ");

function getAppUrl(request: NextRequest): string {
  if (process.env.NEXT_PUBLIC_APP_URL && !process.env.NEXT_PUBLIC_APP_URL.includes("localhost")) {
    return process.env.NEXT_PUBLIC_APP_URL.replace(/\/$/, "");
  }
  if (request.nextUrl?.origin && !request.nextUrl.origin.includes("localhost")) {
    return request.nextUrl.origin;
  }
  if (process.env.VERCEL_URL) {
    return `https://${process.env.VERCEL_URL}`;
  }
  return (process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000").replace(/\/$/, "");
}

function getReturnToPath(request: NextRequest): string {
  // 1. Explicit query param
  const queryReturnTo = request.nextUrl.searchParams.get("returnTo");
  if (queryReturnTo && queryReturnTo.startsWith("/")) {
    return queryReturnTo;
  }

  // 2. HTTP referer header
  const referer = request.headers.get("referer") || "";
  if (referer) {
    try {
      const refererUrl = new URL(referer);
      const pathname = refererUrl.pathname;
      if (pathname && pathname.startsWith("/") && !pathname.includes("/api/auth")) {
        return pathname + refererUrl.search;
      }
    } catch {
      // ignore
    }
    if (referer.includes("/agencydashboard/agencybanking")) return "/agencydashboard/agencybanking";
    if (referer.includes("/agencydashboard")) return "/agencydashboard";
    if (referer.includes("/branddashboard")) return "/branddashboard";
    if (referer.includes("/dashboard/invoices")) return "/dashboard/invoices";
  }

  return "/branddashboard";
}

export async function GET(request: NextRequest) {
  if (!CLIENT_ID) {
    return NextResponse.json(
      { error: "QUICKBOOKS_CLIENT_ID is not configured in environment." },
      { status: 500 }
    );
  }

  const appUrl = getAppUrl(request);
  const redirectUri = `${appUrl}/api/auth/quickbooks/callback`;
  const returnToPath = getReturnToPath(request);

  // Debug: print exact values being sent to Intuit
  console.log("[QB Connect] CLIENT_ID:", CLIENT_ID);
  console.log("[QB Connect] REDIRECT_URI:", redirectUri);
  console.log("[QB Connect] RETURN_TO:", returnToPath);

  const state = crypto.randomUUID();

  const params = new URLSearchParams({
    client_id: CLIENT_ID,
    redirect_uri: redirectUri,
    scope: SCOPES,
    response_type: "code",
    access_type: "offline",
    state,
  });

  const authUrl = `https://appcenter.intuit.com/connect/oauth2?${params.toString()}`;
  console.log("[QB Connect] Full auth URL:", authUrl);

  const response = NextResponse.redirect(authUrl);
  // Store state in cookie to verify on callback (CSRF protection)
  response.cookies.set("qb_oauth_state", state, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    maxAge: 600, // 10 minutes
    path: "/",
    sameSite: "lax",
  });

  // Store the return_to path dynamically based on referer / query param
  response.cookies.set("qb_return_to", returnToPath, { path: "/" });

  return response;
}
