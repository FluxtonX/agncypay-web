import { NextResponse } from "next/server";
import { plaidClient, isPlaidConfigured } from "@/lib/plaid";
import { Products, CountryCode } from "plaid";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  try {
    // Check if Plaid is configured
    if (!isPlaidConfigured()) {
      console.warn("Plaid environment keys are not configured. Falling back to mock mode.");
      return NextResponse.json({ link_token: null, isMock: true });
    }

    // Determine the host to dynamically set redirect URI if needed
    const host = req.headers.get("host") || "localhost:3000";
    const protocol = host.includes("localhost") ? "http" : "https";
    const appUrl = `${protocol}://${host}`;
    
    // In production/sandbox Plaid requires a redirect URI registered in the Plaid dashboard
    const redirectUri = process.env.PLAID_REDIRECT_URI || `${appUrl}/dashboard`;

    // Retrieve webhook URL
    const webhookUrl = process.env.PLAID_WEBHOOK_URL || `${appUrl}/api/plaid/webhook`;

    console.log("Creating Plaid link token with parameters:", {
      redirect_uri: redirectUri,
      webhook: webhookUrl,
    });

    const response = await plaidClient.linkTokenCreate({
      user: {
        client_user_id: "agncypay-user-session-id-123",
      },
      client_name: "AgncyPay",
      products: [Products.Auth, Products.Transactions],
      country_codes: [CountryCode.Us],
      language: "en",
      redirect_uri: redirectUri,
      webhook: webhookUrl,
    });

    return NextResponse.json({ link_token: response.data.link_token, isMock: false });
  } catch (error: any) {
    console.error("Error creating Plaid link token (falling back to mock mode):", error.response?.data || error.message || error);
    // Fallback to mock mode in case of developer/credential API failures
    return NextResponse.json({
      link_token: null,
      isMock: true,
      errorDetails: error.response?.data || error.message,
    });
  }
}
