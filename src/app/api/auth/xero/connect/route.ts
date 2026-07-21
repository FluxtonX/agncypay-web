import { NextRequest, NextResponse } from "next/server";

const CLIENT_ID = process.env.XERO_CLIENT_ID!;
const REDIRECT_URI = `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/api/auth/xero/callback`;

const SCOPES = [
  "openid",
  "profile",
  "email",
  "accounting.transactions",
  "accounting.contacts",
  "offline_access"
].join(" ");

export async function GET(request: NextRequest) {
  if (!CLIENT_ID) {
    return NextResponse.json(
      { error: "XERO_CLIENT_ID is not configured in environment." },
      { status: 500 }
    );
  }

  const state = crypto.randomUUID();

  const params = new URLSearchParams({
    client_id: CLIENT_ID,
    redirect_uri: REDIRECT_URI,
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

  const headersList = request.headers;
  const referer = headersList.get("referer") || "";
  if (referer.includes("/branddashboard")) {
    response.cookies.set("xero_return_to", "/branddashboard", { path: "/" });
  } else {
    response.cookies.set("xero_return_to", "/dashboard/invoices", { path: "/" });
  }

  return response;
}
