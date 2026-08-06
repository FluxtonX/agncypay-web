import { NextRequest, NextResponse } from "next/server";

const CLIENT_ID = process.env.QUICKBOOKS_CLIENT_ID!;
const CLIENT_SECRET = process.env.QUICKBOOKS_CLIENT_SECRET!;

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

export async function GET(request: NextRequest) {
  const appUrl = getAppUrl(request);
  const redirectUri = `${appUrl}/api/auth/quickbooks/callback`;

  const { searchParams } = new URL(request.url);
  const returnTo = request.cookies.get("qb_return_to")?.value || "/dashboard/invoices";

  const code = searchParams.get("code");
  const realmId = searchParams.get("realmId");
  const state = searchParams.get("state");
  const error = searchParams.get("error");

  // Handle user denying access
  if (error) {
    return NextResponse.redirect(
      `${appUrl}${returnTo}?qb_error=${encodeURIComponent(error)}`
    );
  }

  if (!code || !realmId) {
    return NextResponse.redirect(
      `${appUrl}${returnTo}?qb_error=missing_params`
    );
  }

  // Verify state cookie (CSRF protection)
  const savedState = request.cookies.get("qb_oauth_state")?.value;
  if (state && savedState && state !== savedState) {
    return NextResponse.redirect(
      `${appUrl}${returnTo}?qb_error=state_mismatch`
    );
  }

  try {
    // Exchange auth code for tokens
    const credentials = Buffer.from(`${CLIENT_ID}:${CLIENT_SECRET}`).toString("base64");

    const tokenResponse = await fetch("https://oauth.platform.intuit.com/oauth2/v1/tokens/bearer", {
      method: "POST",
      headers: {
        "Accept": "application/json",
        "Content-Type": "application/x-www-form-urlencoded",
        "Authorization": `Basic ${credentials}`,
      },
      body: new URLSearchParams({
        grant_type: "authorization_code",
        code,
        redirect_uri: redirectUri,
      }),
    });

    if (!tokenResponse.ok) {
      const errText = await tokenResponse.text();
      console.error("[QB Callback] Token exchange failed:", errText);
      return NextResponse.redirect(
        `${appUrl}${returnTo}?qb_error=token_exchange_failed`
      );
    }

    const tokenData = await tokenResponse.json();
    const { access_token, refresh_token, expires_in } = tokenData;

    // Build redirect response and store tokens in secure cookies
    const redirectResponse = NextResponse.redirect(
      `${appUrl}${returnTo}?qb_connected=true&realm_id=${realmId}`
    );

    const cookieOpts = {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      path: "/",
      sameSite: "lax" as const,
    };

    redirectResponse.cookies.set("qb_access_token", access_token, {
      ...cookieOpts,
      maxAge: expires_in || 3600,
    });

    if (refresh_token) {
      redirectResponse.cookies.set("qb_refresh_token", refresh_token, {
        ...cookieOpts,
        maxAge: 60 * 60 * 24 * 100, // 100 days
      });
    }

    redirectResponse.cookies.set("qb_realm_id", realmId, {
      ...cookieOpts,
      maxAge: 60 * 60 * 24 * 100, // 100 days
    });

    // Clear the CSRF state cookie
    redirectResponse.cookies.set("qb_oauth_state", "", { maxAge: 0, path: "/" });

    return redirectResponse;
  } catch (err) {
    console.error("[QB Callback] Unexpected error:", err);
    return NextResponse.redirect(
      `${appUrl}${returnTo}?qb_error=server_error`
    );
  }
}
