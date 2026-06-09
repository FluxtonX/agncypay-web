import { getQuickBooksClient } from "@/lib/quickbooks";
import { NextResponse } from "next/server";
import OAuthClient from "intuit-oauth";

export async function GET() {
  const oauthClient = getQuickBooksClient();

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
