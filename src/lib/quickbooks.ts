import OAuthClient from "intuit-oauth";
import fs from "fs";
import path from "path";

// Define the path for our local token storage
const TOKEN_STORAGE_PATH = path.join(process.cwd(), "qbo-tokens.json");

// Helper to save tokens to a local file (simulating a database)
export function saveToken(token: any) {
  try {
    fs.writeFileSync(TOKEN_STORAGE_PATH, JSON.stringify(token, null, 2));
    console.log("QuickBooks token saved locally.");
  } catch (error) {
    console.error("Error saving QuickBooks token:", error);
  }
}

// Helper to retrieve the token from the local file
export function getToken() {
  try {
    if (fs.existsSync(TOKEN_STORAGE_PATH)) {
      const tokenStr = fs.readFileSync(TOKEN_STORAGE_PATH, "utf8");
      return JSON.parse(tokenStr);
    }
  } catch (error) {
    console.error("Error reading QuickBooks token:", error);
  }
  return null;
}

// Helper to initialize the OAuthClient
export function getQuickBooksClient() {
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

  // If we have an existing token, load it into the client
  const existingToken = getToken();
  if (existingToken) {
    oauthClient.setToken(existingToken);
  }

  return oauthClient;
}

// Helper to get a ready-to-use client (refreshing the token if needed)
export async function getAuthenticatedClient() {
  const oauthClient = getQuickBooksClient();
  const token = getToken();

  if (!token) {
    throw new Error("No QuickBooks token found. Please connect to QuickBooks first.");
  }

  if (oauthClient.isAccessTokenValid()) {
    return oauthClient;
  }

  // If the access token is invalid but we have a token object, try refreshing
  console.log("QuickBooks Access Token expired. Refreshing...");
  try {
    const authResponse = await oauthClient.refresh();
    saveToken(authResponse.getJson());
    return oauthClient;
  } catch (error) {
    console.error("Failed to refresh token:", error);
    throw new Error("Failed to refresh QuickBooks token. You may need to reconnect.");
  }
}
