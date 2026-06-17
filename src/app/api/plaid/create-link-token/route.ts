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
    const redirectUriRaw = process.env.PLAID_REDIRECT_URI || `${appUrl}/dashboard`;
    const redirectUri = redirectUriRaw.replace(/^["']|["']$/g, "");

    // Retrieve webhook URL
    const webhookUrlRaw = process.env.PLAID_WEBHOOK_URL || `${appUrl}/api/plaid/webhook`;
    const webhookUrl = webhookUrlRaw.replace(/^["']|["']$/g, "");

    console.log("Creating Plaid link token with parameters:", {
      redirect_uri: redirectUri,
      webhook: webhookUrl,
    });

    const tokenRequest: any = {
      user: {
        client_user_id: "agncypay-user-session-id-123",
      },
      client_name: "AgncyPay",
      products: [Products.Auth, Products.Transactions],
      country_codes: [CountryCode.Us],
      language: "en",
      webhook: webhookUrl,
    };

    // Only add redirect_uri if it is set in environment
    if (redirectUri) {
      tokenRequest.redirect_uri = redirectUri;
    }

    let response;
    try {
      response = await plaidClient.linkTokenCreate(tokenRequest);
    } catch (apiError: any) {
      const errorData = apiError.response?.data;
      if (errorData?.error_code === "INVALID_REDIRECT_URI" || errorData?.error_message?.includes("redirect_uri")) {
        console.warn("Plaid returned redirect_uri error. Retrying link token creation without redirect_uri...");
        delete tokenRequest.redirect_uri;
        response = await plaidClient.linkTokenCreate(tokenRequest);
      } else {
        throw apiError;
      }
    }

    return NextResponse.json({ link_token: response.data.link_token, isMock: false });
  } catch (error: any) {
    const errorDetails = error.response?.data || error.message || error;
    console.error("Error creating Plaid link token:", errorDetails);
    
    if (isPlaidConfigured()) {
      return NextResponse.json(
        { 
          error: "Failed to create Plaid link token", 
          details: errorDetails 
        }, 
        { status: 500 }
      );
    }

    // Fallback to mock mode in case of developer/credential API failures (when Plaid keys are not configured or placeholder)
    return NextResponse.json({
      link_token: null,
      isMock: true,
      errorDetails: errorDetails,
    });
  }
}
