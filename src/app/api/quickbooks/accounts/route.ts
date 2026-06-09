import { getAuthenticatedClient, getToken } from "@/lib/quickbooks";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const oauthClient = await getAuthenticatedClient();
    
    // Read the raw token from our local file to reliably get the realmId
    const rawToken = getToken();
    const realmId = rawToken?.realmId;

    if (!realmId) {
      throw new Error("No realmId found in token. Please reconnect QuickBooks.");
    }

    const environment = process.env.QUICKBOOKS_ENVIRONMENT || "sandbox";
    const baseUrl =
      environment === "sandbox"
        ? "https://sandbox-quickbooks.api.intuit.com"
        : "https://quickbooks.api.intuit.com";

    // Query active accounts from QuickBooks
    const accountsQuery = `select * from Account where Active = true maxresults 100`;
    
    const accountsResponse = await oauthClient.makeApiCall({
      url: `${baseUrl}/v3/company/${realmId}/query?query=${encodeURIComponent(accountsQuery)}`,
      method: "GET",
      headers: { "Content-Type": "application/json", Accept: "application/json" },
    });

    const accountsData = (accountsResponse as any).json || ((accountsResponse as any).getJson ? (accountsResponse as any).getJson() : accountsResponse);

    const mappedAccounts: { id: string; name: string }[] = [];

    if (accountsData.QueryResponse?.Account) {
      accountsData.QueryResponse.Account.forEach((acc: any) => {
        mappedAccounts.push({
          id: acc.Id,
          name: acc.FullyQualifiedName || acc.Name,
        });
      });
    }

    return NextResponse.json(mappedAccounts);
  } catch (error: any) {
    console.error("Error fetching QuickBooks accounts:", error.message || error);
    return NextResponse.json(
      { error: error.message || "Failed to fetch accounts" },
      { status: 500 }
    );
  }
}
