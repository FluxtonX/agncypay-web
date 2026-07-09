import { getAuthenticatedClient, getToken } from "@/lib/quickbooks";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const clientId = process.env.QUICKBOOKS_CLIENT_ID;
    const clientSecret = process.env.QUICKBOOKS_CLIENT_SECRET;
    if (!clientId || !clientSecret) {
      return NextResponse.json([
        {
          id: "mock-log-1",
          date: new Date().toISOString(),
          itemName: "Invoice #1",
          customerName: "Amazon Music Unlimited",
          amount: 10.29,
          currency: "USD",
          itemType: "Invoice",
          status: "Pending",
        },
        {
          id: "mock-log-2",
          date: new Date(Date.now() - 3600 * 1000).toISOString(),
          itemName: "Invoice #2",
          customerName: "Amazon Prime",
          amount: 0.82,
          currency: "USD",
          itemType: "Invoice",
          status: "Pending",
        },
        {
          id: "mock-log-3",
          date: new Date(Date.now() - 2 * 3600 * 1000).toISOString(),
          itemName: "Invoice #3",
          customerName: "Anghami",
          amount: 0.01,
          currency: "USD",
          itemType: "Invoice",
          status: "Pending",
        }
      ]);
    }

    const oauthClient = await getAuthenticatedClient();
    
    // Read the raw token from our cookie to reliably get the realmId
    const rawToken = await getToken();
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
        const balance = i.Balance !== undefined ? i.Balance : i.TotalAmt;
        const isPaid = balance === 0;
        const dueDate = i.DueDate;

        let status = "Pending";
        if (isPaid) {
          status = "Paid";
        } else if (dueDate) {
          const dueTime = new Date(dueDate).getTime();
          const nowTime = new Date().getTime();
          if (dueTime < nowTime) {
            status = "Overdue";
          }
        }

        logs.push({
          id: i.Id,
          date: i.MetaData?.LastUpdatedTime || new Date().toISOString(),
          itemName: `Invoice #${i.DocNumber || i.Id}`, // keeping for backwards compatibility if needed
          docNumber: i.DocNumber || i.Id,
          customerName: i.CustomerRef?.name || "Unknown Customer",
          amount: i.TotalAmt || 0,
          currency: i.CurrencyRef?.value || "USD",
          itemType: "Invoice",
          status: status,
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
