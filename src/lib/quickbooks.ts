import OAuthClient from "intuit-oauth";
import { cookies } from "next/headers";

const COOKIE_NAME = "qbo_token_data";

// Helper to save tokens to a secure HttpOnly cookie
export async function saveToken(token: any) {
  try {
    const cookieStore = await cookies();
    
    // Only store essential fields to ensure we don't exceed the 4KB cookie limit
    const essentialToken = {
      access_token: token.access_token,
      refresh_token: token.refresh_token,
      realmId: token.realmId,
      expires_in: token.expires_in,
      x_refresh_token_expires_in: token.x_refresh_token_expires_in,
      createdAt: token.createdAt || Date.now(),
      token_type: token.token_type || "bearer",
    };

    cookieStore.set(COOKIE_NAME, JSON.stringify(essentialToken), {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      // Max age: 100 days (QuickBooks refresh token is valid for 100 days)
      maxAge: 100 * 24 * 60 * 60,
    });
    console.log("QuickBooks token saved to cookie.");
  } catch (error) {
    console.error("Error saving QuickBooks token to cookie:", error);
  }
}

// Helper to retrieve the token from the secure cookie
export async function getToken() {
  try {
    const cookieStore = await cookies();
    const cookie = cookieStore.get(COOKIE_NAME);
    if (cookie?.value) {
      return JSON.parse(cookie.value);
    }
  } catch (error) {
    console.error("Error reading QuickBooks token from cookie:", error);
  }
  return null;
}

// Helper to initialize the OAuthClient with an optional token
export function getQuickBooksClient(token?: any) {
  const clientId = process.env.QUICKBOOKS_CLIENT_ID;
  const clientSecret = process.env.QUICKBOOKS_CLIENT_SECRET;
  const environment = process.env.QUICKBOOKS_ENVIRONMENT || "sandbox";
  const redirectUri = process.env.QUICKBOOKS_REDIRECT_URI;

  if (!clientId || !clientSecret || !redirectUri) {
    console.warn("Missing QuickBooks environment variables.");
  }

  const oauthClient = new OAuthClient({
    clientId: clientId || "",
    clientSecret: clientSecret || "",
    environment: environment as "sandbox" | "production",
    redirectUri: redirectUri || "",
  });

  if (token) {
    oauthClient.setToken(token);
  }

  return oauthClient;
}

// Helper to get a ready-to-use client (refreshing the token if needed)
export async function getAuthenticatedClient() {
  const token = await getToken();

  if (!token) {
    throw new Error("No QuickBooks token found. Please connect to QuickBooks first.");
  }

  const oauthClient = getQuickBooksClient(token);

  if (oauthClient.isAccessTokenValid()) {
    return oauthClient;
  }

  // If the access token is invalid but we have a token object, try refreshing
  console.log("QuickBooks Access Token expired. Refreshing...");
  try {
    const authResponse = await oauthClient.refresh();
    const newToken = authResponse.getJson();
    
    // Preserve the realmId since it is not returned in the refresh token response payload
    if (token.realmId) {
      newToken.realmId = token.realmId;
    }
    
    await saveToken(newToken);
    return oauthClient;
  } catch (error) {
    console.error("Failed to refresh token:", error);
    throw new Error("Failed to refresh QuickBooks token. You may need to reconnect.");
  }
}
