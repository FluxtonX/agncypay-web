import { getQuickBooksClient, getQuickBooksConfig, saveToken } from "@/lib/quickbooks";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const urlWithParams = request.url;

  const config = getQuickBooksConfig(request.url);

  if (!config.configured) {
    return NextResponse.json(
      {
        error:
          "QuickBooks OAuth is not configured. Set QUICKBOOKS_CLIENT_ID and QUICKBOOKS_CLIENT_SECRET. Optional: QUICKBOOKS_REDIRECT_URI.",
      },
      { status: 500 }
    );
  }

  const oauthClient = getQuickBooksClient(undefined, request.url);

  try {
    // Exchange the auth code for access and refresh tokens
    const authResponse = await oauthClient.createToken(urlWithParams);
    
    // Extract the realmId (Company ID) from the callback URL
    const realmId = searchParams.get("realmId");
    
    // Extract the token data and save it along with the realmId
    const tokenData = authResponse.getJson();
    if (realmId) {
      tokenData.realmId = realmId;
    }
    
    await saveToken(tokenData);

    console.log("QuickBooks connection successful!");

    // Redirect the user back to the QuickBooks integration settings page
    return NextResponse.redirect(new URL("/dashboard/settings/integrations/quickbooks", request.url));
  } catch (error) {
    console.error("Error during QuickBooks OAuth callback:", error);
    return NextResponse.json(
      { error: "Failed to authenticate with QuickBooks." },
      { status: 500 }
    );
  }
}
