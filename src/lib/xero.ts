import { cookies } from "next/headers";

const COOKIE_NAME = "xero_token_data";

export type XeroToken = {
  access_token?: string;
  refresh_token?: string;
  expires_in?: number;
  token_type?: string;
  scope?: string;
  createdAt?: number;
  tenantId?: string; // Xero tenant/org ID
};

export async function saveXeroToken(token: XeroToken) {
  try {
    const cookieStore = await cookies();
    const essential: XeroToken = {
      access_token: token.access_token,
      refresh_token: token.refresh_token,
      expires_in: token.expires_in,
      token_type: token.token_type || "Bearer",
      scope: token.scope,
      tenantId: token.tenantId,
      createdAt: token.createdAt || Date.now(),
    };
    cookieStore.set(COOKIE_NAME, JSON.stringify(essential), {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24 * 60, // 60 days
    });
    console.log("Xero token saved to cookie.");
  } catch (error) {
    console.error("Error saving Xero token:", error);
  }
}

export async function getXeroToken(): Promise<XeroToken | null> {
  try {
    const cookieStore = await cookies();
    const cookie = cookieStore.get(COOKIE_NAME);
    if (cookie?.value) {
      return JSON.parse(cookie.value) as XeroToken;
    }
  } catch (error) {
    console.error("Error reading Xero token:", error);
  }
  return null;
}

export async function clearXeroToken() {
  try {
    const cookieStore = await cookies();
    cookieStore.delete(COOKIE_NAME);
  } catch (error) {
    console.error("Error clearing Xero token:", error);
  }
}

export function isXeroTokenValid(token: XeroToken): boolean {
  if (!token.access_token || !token.createdAt || !token.expires_in) return false;
  const expiresAt = token.createdAt + token.expires_in * 1000;
  return Date.now() < expiresAt - 60_000; // 1 min buffer
}

export function getXeroConfig(requestUrl?: string) {
  const fallbackOrigin =
    process.env.NEXT_PUBLIC_APP_URL ||
    (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "http://localhost:3000");

  const clientId = process.env.XERO_CLIENT_ID || "";
  const clientSecret = process.env.XERO_CLIENT_SECRET || "";
  const redirectUri =
    process.env.XERO_REDIRECT_URI ||
    new URL("/api/auth/xero/callback", requestUrl || fallbackOrigin).toString();

  return {
    clientId,
    clientSecret,
    redirectUri,
    configured: Boolean(clientId && clientSecret),
  };
}
