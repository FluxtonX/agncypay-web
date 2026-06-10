import { getAuthenticatedClient, getToken } from "@/lib/quickbooks";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

const mockInvoices = [
  {
    id: "mock-1",
    docNumber: "1",
    name: "Amazon Music Unlimited",
    detail: "Digital Sales CSV Upload",
    date: "06/06/2026",
    amount: 10.29,
    status: "Pending",
    daysText: "Overdue",
  },
  {
    id: "mock-2",
    docNumber: "2",
    name: "Amazon Prime",
    detail: "Digital Sales CSV Upload",
    date: "06/06/2026",
    amount: 0.82,
    status: "Pending",
    daysText: "12 days remaining",
  },
  {
    id: "mock-3",
    docNumber: "3",
    name: "Anghami",
    detail: "Digital Sales CSV Upload",
    date: "06/06/2026",
    amount: 0.01,
    status: "Pending",
    daysText: "47 days remaining",
  },
  {
    id: "mock-4",
    docNumber: "4",
    name: "Apple Music",
    detail: "Digital Sales CSV Upload",
    date: "06/06/2026",
    amount: 153.76,
    status: "Pending",
    daysText: "78 days remaining",
  },
  {
    id: "mock-5",
    docNumber: "5",
    name: "Audible Magic",
    detail: "Digital Sales CSV Upload",
    date: "06/06/2026",
    amount: 1.30,
    status: "Pending",
    daysText: "90 days remaining",
  },
];

export async function GET() {
  try {
    const token = await getToken();
    const isConnected = !!(token && token.access_token);

    if (!isConnected) {
      return NextResponse.json({ connected: false, invoices: mockInvoices });
    }

    const oauthClient = await getAuthenticatedClient();
    const realmId = token.realmId;

    if (!realmId) {
      return NextResponse.json({ connected: false, invoices: mockInvoices });
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

    const invoicesData =
      (invoicesResponse as any).json ||
      ((invoicesResponse as any).getJson ? (invoicesResponse as any).getJson() : invoicesResponse);

    const invoices: any[] = [];

    if (invoicesData.QueryResponse?.Invoice) {
      invoicesData.QueryResponse.Invoice.forEach((i: any) => {
        const balance = i.Balance !== undefined ? i.Balance : i.TotalAmt;
        const isPaid = balance === 0;
        const dueDate = i.DueDate;

        let status = "Pending";
        let daysText = "";

        if (isPaid) {
          status = "Paid";
          daysText = "Succeed";
        } else if (dueDate) {
          const dueTime = new Date(dueDate).getTime();
          // Normalize today's date
          const today = new Date();
          today.setHours(0, 0, 0, 0);
          const due = new Date(dueDate);
          due.setHours(0, 0, 0, 0);

          const diffTime = due.getTime() - today.getTime();
          const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

          if (diffDays < 0) {
            status = "Pending";
            daysText = "Overdue";
          } else if (diffDays === 0) {
            status = "Pending";
            daysText = "Due today";
          } else {
            status = "Pending";
            daysText = `${diffDays} days remaining`;
          }
        }

        // Format TxnDate to MM/DD/YYYY
        let formattedDate = i.TxnDate || "06/06/2026";
        if (i.TxnDate) {
          try {
            const parts = i.TxnDate.split("-");
            if (parts.length === 3) {
              formattedDate = `${parts[1]}/${parts[2]}/${parts[0]}`;
            }
          } catch (e) {
            // fallback
          }
        }

        invoices.push({
          id: i.Id,
          docNumber: i.DocNumber || i.Id,
          name: i.CustomerRef?.name || "Unknown Customer",
          detail: i.PrivateNote || "QuickBooks Synced Invoice",
          date: formattedDate,
          amount: i.TotalAmt || 0,
          status: status,
          daysText: daysText,
        });
      });
    }

    const finalInvoices = invoices.length > 0 ? invoices : mockInvoices;

    return NextResponse.json({ connected: true, invoices: finalInvoices });
  } catch (error: any) {
    console.error("Error fetching QuickBooks invoices:", error.message || error);
    // On error, gracefully fall back to mock data but state connected is false or true depending on token
    const token = await getToken();
    const isConnected = !!(token && token.access_token);
    return NextResponse.json({ connected: isConnected, invoices: mockInvoices });
  }
}
