import { NextRequest, NextResponse } from "next/server";

const CLIENT_ID = process.env.XERO_CLIENT_ID!;

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

const SCOPES = [
  "openid",
  "profile",
  "email",
  "accounting.transactions",
  "accounting.contacts",
  "offline_access"
].join(" ");

function getReturnToPath(request: NextRequest): string {
  const queryReturnTo = request.nextUrl.searchParams.get("returnTo");
  if (queryReturnTo && queryReturnTo.startsWith("/")) {
    return queryReturnTo;
  }

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
      { error: "XERO_CLIENT_ID is not configured in environment." },
      { status: 500 }
    );
  }

  const appUrl = getAppUrl(request);
  const redirectUri = `${appUrl}/api/auth/xero/callback`;
  const returnToPath = getReturnToPath(request);

  const state = crypto.randomUUID();

  const params = new URLSearchParams({
    client_id: CLIENT_ID,
    redirect_uri: redirectUri,
    scope: SCOPES,
    response_type: "code",
    state,
  });

  const authUrl = `https://login.xero.com/identity/connect/authorize?${params.toString()}`;

  const response = NextResponse.redirect(authUrl);
  
  response.cookies.set("xero_oauth_state", state, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    maxAge: 600, // 10 minutes
    path: "/",
    sameSite: "lax",
  });

  response.cookies.set("xero_return_to", returnToPath, { path: "/" });

  return response;
}
