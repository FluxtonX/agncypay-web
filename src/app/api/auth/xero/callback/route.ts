import { NextRequest, NextResponse } from "next/server";

const CLIENT_ID = process.env.XERO_CLIENT_ID!;
const CLIENT_SECRET = process.env.XERO_CLIENT_SECRET!;

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
  const redirectUri = `${appUrl}/api/auth/xero/callback`;

  const { searchParams } = new URL(request.url);
  const returnTo = request.cookies.get("xero_return_to")?.value || "/dashboard/invoices";

  const code = searchParams.get("code");
  const state = searchParams.get("state");
  const error = searchParams.get("error");

  if (error) {
    return NextResponse.redirect(`${appUrl}${returnTo}?xero_error=${encodeURIComponent(error)}`);
  }

  if (!code) {
    return NextResponse.redirect(`${appUrl}${returnTo}?xero_error=missing_params`);
  }

  const savedState = request.cookies.get("xero_oauth_state")?.value;
  if (state && savedState && state !== savedState) {
    return NextResponse.redirect(`${appUrl}${returnTo}?xero_error=state_mismatch`);
  }

  try {
    const credentials = Buffer.from(`${CLIENT_ID}:${CLIENT_SECRET}`).toString("base64");

    const tokenResponse = await fetch("https://identity.xero.com/connect/token", {
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
      console.error("[Xero Callback] Token exchange failed:", errText);
      return NextResponse.redirect(`${appUrl}${returnTo}?xero_error=token_exchange_failed`);
    }

    const tokenData = await tokenResponse.json();
    const { access_token, refresh_token, expires_in } = tokenData;

    // Fetch the tenant ID
    const connectionsResponse = await fetch("https://api.xero.com/connections", {
      headers: {
        "Accept": "application/json",
        "Authorization": `Bearer ${access_token}`,
      },
    });

    if (!connectionsResponse.ok) {
      console.error("[Xero Callback] Failed to fetch connections:", await connectionsResponse.text());
      return NextResponse.redirect(`${appUrl}${returnTo}?xero_error=connections_failed`);
    }

    const connectionsData = await connectionsResponse.json();
    if (!connectionsData || connectionsData.length === 0) {
      return NextResponse.redirect(`${appUrl}${returnTo}?xero_error=no_tenant_found`);
    }

    const tenantId = connectionsData[0].tenantId;

    const redirectResponse = NextResponse.redirect(`${appUrl}${returnTo}?xero_connected=true`);

    const cookieOpts = {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      path: "/",
      sameSite: "lax" as const,
    };

    redirectResponse.cookies.set("xero_access_token", access_token, {
      ...cookieOpts,
      maxAge: expires_in || 1800, // Xero tokens typically expire in 30 mins
    });

    if (refresh_token) {
      redirectResponse.cookies.set("xero_refresh_token", refresh_token, {
        ...cookieOpts,
        maxAge: 60 * 60 * 24 * 60, // 60 days
      });
    }

    redirectResponse.cookies.set("xero_tenant_id", tenantId, {
      ...cookieOpts,
      maxAge: 60 * 60 * 24 * 60, // 60 days
    });

    redirectResponse.cookies.set("xero_oauth_state", "", { maxAge: 0, path: "/" });

    return redirectResponse;
  } catch (err) {
    console.error("[Xero Callback] Unexpected error:", err);
    return NextResponse.redirect(`${appUrl}${returnTo}?xero_error=server_error`);
  }
}
