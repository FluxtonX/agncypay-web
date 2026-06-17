import { getAuthenticatedClient, getToken } from "@/lib/quickbooks";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

const mockPayouts = [
  {
    id: "payout-mock-1",
    name: "Karlos Talent",
    detail: "Campaign split payout",
    date: "Today, 10:24 AM",
    amount: "$10,500.00",
    fallback: "KT",
    method: "Bank Transfer",
    status: "Paid",
  },
  {
    id: "payout-mock-2",
    name: "Gigi Hadid",
    detail: "Paris Fashion Week split",
    date: "Today, 9:42 AM",
    amount: "$9,805.25",
    fallback: "GH",
    method: "Bank Transfer",
    status: "Paid",
  },
  {
    id: "payout-mock-3",
    name: "Bella Hadid",
    detail: "Talent split payout",
    date: "Yesterday",
    amount: "$3,500.00",
    fallback: "BH",
    method: "Check",
    status: "Paid",
  },
];

export async function GET() {
  try {
    const token = await getToken();
    const isConnected = !!(token && token.access_token);

    if (!isConnected) {
      return NextResponse.json({ connected: false, payouts: [] });
    }

    const clientId = process.env.QUICKBOOKS_CLIENT_ID;
    const clientSecret = process.env.QUICKBOOKS_CLIENT_SECRET;
    if (!clientId || !clientSecret) {
      return NextResponse.json({ connected: true, payouts: mockPayouts });
    }

    const oauthClient = await getAuthenticatedClient();
    const realmId = token.realmId;

    if (!realmId) {
      return NextResponse.json({ connected: true, payouts: mockPayouts });
    }

    const environment = process.env.QUICKBOOKS_ENVIRONMENT || "sandbox";
    const baseUrl =
      environment === "sandbox"
        ? "https://sandbox-quickbooks.api.intuit.com"
        : "https://quickbooks.api.intuit.com";

    // Query recent BillPayments (max 10)
    const payoutsQuery = `select * from BillPayment order by MetaData.LastUpdatedTime desc maxresults 10`;
    // Query recent Purchases (max 10)
    const purchasesQuery = `select * from Purchase order by MetaData.LastUpdatedTime desc maxresults 10`;

    const [payoutsResponse, purchasesResponse] = await Promise.all([
      oauthClient.makeApiCall({
        url: `${baseUrl}/v3/company/${realmId}/query?query=${encodeURIComponent(payoutsQuery)}`,
        method: "GET",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
      }).catch(err => {
        console.error("Failed to query BillPayments:", err.message || err);
        return null;
      }),
      oauthClient.makeApiCall({
        url: `${baseUrl}/v3/company/${realmId}/query?query=${encodeURIComponent(purchasesQuery)}`,
        method: "GET",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
      }).catch(err => {
        console.error("Failed to query Purchases:", err.message || err);
        return null;
      })
    ]);

    const payoutsData = payoutsResponse
      ? (payoutsResponse as any).json ||
        ((payoutsResponse as any).getJson ? (payoutsResponse as any).getJson() : payoutsResponse)
      : null;

    const purchasesData = purchasesResponse
      ? (purchasesResponse as any).json ||
        ((purchasesResponse as any).getJson ? (purchasesResponse as any).getJson() : purchasesResponse)
      : null;

    const payoutsList: any[] = [];

    if (payoutsData?.QueryResponse?.BillPayment) {
      payoutsData.QueryResponse.BillPayment.forEach((p: any) => {
        let formattedDate = p.TxnDate || "";
        let rawDate = p.TxnDate || "1970-01-01";
        if (p.TxnDate) {
          try {
            const parts = p.TxnDate.split("-");
            if (parts.length === 3) {
              formattedDate = `${parts[1]}/${parts[2]}/${parts[0]}`;
            }
          } catch (e) {}
        }

        const vendorName = p.VendorRef?.name || "Unknown Talent";
        const initials = vendorName
          .split(" ")
          .map((part: string) => part[0])
          .join("")
          .slice(0, 2)
          .toUpperCase();

        payoutsList.push({
          id: p.Id,
          name: vendorName,
          detail: p.PrivateNote || "QuickBooks Synced Payout",
          date: formattedDate || "06/06/2026",
          rawDate: rawDate,
          amount: new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(p.TotalAmt || 0),
          rawAmount: p.TotalAmt || 0,
          fallback: initials,
          type: "BillPayment",
          method: p.PayType === "BankAccount" ? "Bank Transfer" : (p.PayType || "Bank Transfer"),
          status: "Paid"
        });
      });
    }

    if (purchasesData?.QueryResponse?.Purchase) {
      purchasesData.QueryResponse.Purchase.forEach((p: any) => {
        let formattedDate = p.TxnDate || "";
        let rawDate = p.TxnDate || "1970-01-01";
        if (p.TxnDate) {
          try {
            const parts = p.TxnDate.split("-");
            if (parts.length === 3) {
              formattedDate = `${parts[1]}/${parts[2]}/${parts[0]}`;
            }
          } catch (e) {}
        }

        // EntityRef represents the payee/vendor for standard Purchases/Expenses
        const vendorName = p.EntityRef?.name || "Unknown Vendor";
        const initials = vendorName
          .split(" ")
          .map((part: string) => part[0])
          .join("")
          .slice(0, 2)
          .toUpperCase();

        payoutsList.push({
          id: p.Id,
          name: vendorName,
          detail: p.PrivateNote || `Expense (${p.PaymentType || "Cash"})`,
          date: formattedDate || "06/06/2026",
          rawDate: rawDate,
          amount: new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(p.TotalAmt || 0),
          rawAmount: p.TotalAmt || 0,
          fallback: initials,
          type: "Purchase",
          method: p.PaymentType === "CreditCard" ? "Credit Card" : (p.PaymentType || "Cash"),
          status: "Paid"
        });
      });
    }

    // Sort combined list by rawDate descending
    payoutsList.sort((a, b) => b.rawDate.localeCompare(a.rawDate));

    // Slice to top 10
    const finalPayoutsList = payoutsList.slice(0, 10).map(({ rawDate, rawAmount, type, ...rest }) => rest);

    const finalPayouts = finalPayoutsList.length > 0 ? finalPayoutsList : mockPayouts;

    return NextResponse.json({ connected: true, payouts: finalPayouts });
  } catch (error: any) {
    console.error("Error fetching QuickBooks payouts:", error.message || error);
    const token = await getToken();
    const isConnected = !!(token && token.access_token);
    return NextResponse.json({ connected: isConnected, payouts: isConnected ? mockPayouts : [] });
  }
}
