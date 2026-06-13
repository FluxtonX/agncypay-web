import { getQuickBooksClient, getQuickBooksConfig } from "@/lib/quickbooks";
import { NextResponse } from "next/server";
import OAuthClient from "intuit-oauth";

export async function GET(request: Request) {
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

  // The scopes to request access for
  const authUri = oauthClient.authorizeUri({
    scope: [
      OAuthClient.scopes.Accounting,
      OAuthClient.scopes.OpenId,
      OAuthClient.scopes.Profile,
      OAuthClient.scopes.Email,
    ],
    state: "testState", // In production, generate a secure random state and verify it in the callback
  });

  // Redirect the user to the QuickBooks authorization page
  return NextResponse.redirect(authUri);
}
