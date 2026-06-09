import { getAuthenticatedClient, getToken } from "@/lib/quickbooks";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const oauthClient = await getAuthenticatedClient();
    
    // To make API calls, we need the realmId (Company ID)
    const token = await getToken();
    const realmId = token?.realmId;

    if (!realmId) {
      throw new Error("No realmId found in token. Please reconnect QuickBooks.");
    }

    // Determine the base URL depending on the environment
    const environment = process.env.QUICKBOOKS_ENVIRONMENT || "sandbox";
    const baseUrl =
      environment === "sandbox"
        ? "https://sandbox-quickbooks.api.intuit.com"
        : "https://quickbooks.api.intuit.com";

    // Make an API request to get CompanyInfo
    const companyInfoUrl = `${baseUrl}/v3/company/${realmId}/companyinfo/${realmId}`;
    
    const response = await oauthClient.makeApiCall({
      url: companyInfoUrl,
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
    });

    const responseData = (response as any).getJson ? (response as any).getJson() : response;
    
    return NextResponse.json(responseData);
  } catch (error: any) {
    console.error("Error fetching QuickBooks company info:", error.message || error);
    return NextResponse.json(
      { error: error.message || "Failed to fetch company info" },
      { status: 500 }
    );
  }
}
