import { NextRequest, NextResponse } from "next/server";

const CLIENT_ID = process.env.QUICKBOOKS_CLIENT_ID!;
const REDIRECT_URI = `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/api/auth/quickbooks/callback`;

const SCOPES = [
  "com.intuit.quickbooks.accounting",
].join(" ");

export async function GET(request: NextRequest) {
  if (!CLIENT_ID) {
    return NextResponse.json(
      { error: "QUICKBOOKS_CLIENT_ID is not configured in environment." },
      { status: 500 }
    );
  }

  // Debug: print exact values being sent to Intuit
  console.log("[QB Connect] CLIENT_ID:", CLIENT_ID);
  console.log("[QB Connect] REDIRECT_URI:", REDIRECT_URI);

  const state = crypto.randomUUID();

  const params = new URLSearchParams({
    client_id: CLIENT_ID,
    redirect_uri: REDIRECT_URI,
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

  // Store the referer so we know where to redirect back
  // (we read this from the headers since it's a GET request initiated via window.location.href)
  const headersList = request.headers;
  const referer = headersList.get("referer") || "";
  if (referer.includes("/branddashboard")) {
    response.cookies.set("qb_return_to", "/branddashboard", { path: "/" });
  } else {
    response.cookies.set("qb_return_to", "/dashboard/invoices", { path: "/" });
  }

  return response;
}
