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

    // Query recent Invoices (max 10)
    const invoicesQuery = `select * from Invoice order by MetaData.LastUpdatedTime desc maxresults 10`;
    
    const invoicesResponse = await oauthClient.makeApiCall({
      url: `${baseUrl}/v3/company/${realmId}/query?query=${encodeURIComponent(invoicesQuery)}`,
      method: "GET",
      headers: { "Content-Type": "application/json", Accept: "application/json" },
    });

    const invoicesData = (invoicesResponse as any).json || ((invoicesResponse as any).getJson ? (invoicesResponse as any).getJson() : invoicesResponse);

    const logs: any[] = [];

    // Map Invoices
    if (invoicesData.QueryResponse?.Invoice) {
      invoicesData.QueryResponse.Invoice.forEach((i: any) => {
        logs.push({
          id: `inv-${i.Id}`,
          date: i.MetaData?.LastUpdatedTime || new Date().toISOString(),
          itemName: `Invoice #${i.DocNumber || i.Id}`, // keeping for backwards compatibility if needed
          docNumber: i.DocNumber || i.Id,
          customerName: i.CustomerRef?.name || "Unknown Customer",
          amount: i.TotalAmt || 0,
          currency: i.CurrencyRef?.value || "USD",
          itemType: "Invoice",
          status: "Success",
        });
      });
    }

    // Sort by date descending
    logs.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    return NextResponse.json(logs);
  } catch (error: any) {
    console.error("Error fetching QuickBooks logs:", error.message || error);
    return NextResponse.json(
      { error: error.message || "Failed to fetch logs" },
      { status: 500 }
    );
  }
}
