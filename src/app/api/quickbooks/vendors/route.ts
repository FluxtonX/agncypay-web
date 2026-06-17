import { getAuthenticatedClient, getToken } from "@/lib/quickbooks";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

const mockVendors = [
  {
    id: "vendor-mock-1",
    name: "Karlos Talent",
    company: "Victoria Models",
    email: "karlos@victoriamodels.co",
    phone: "+1 (555) 123-4567",
    acctNum: "ACT-QBO-KT01",
    balance: "$0.00",
    active: true,
    fallback: "KT",
  },
  {
    id: "vendor-mock-2",
    name: "Gigi Hadid",
    company: "Victoria Models",
    email: "gigi@victoriamodels.co",
    phone: "+1 (555) 987-6543",
    acctNum: "ACT-QBO-GH02",
    balance: "$12,450.00",
    active: true,
    fallback: "GH",
  },
  {
    id: "vendor-mock-3",
    name: "Bella Hadid",
    company: "Victoria Models",
    email: "bella@victoriamodels.co",
    phone: "+1 (555) 555-0199",
    acctNum: "ACT-QBO-BH03",
    balance: "$3,500.00",
    active: true,
    fallback: "BH",
  },
];

export async function GET() {
  try {
    const token = await getToken();
    const isConnected = !!(token && token.access_token);

    if (!isConnected) {
      return NextResponse.json({ connected: false, vendors: [] });
    }

    const clientId = process.env.QUICKBOOKS_CLIENT_ID;
    const clientSecret = process.env.QUICKBOOKS_CLIENT_SECRET;
    if (!clientId || !clientSecret) {
      return NextResponse.json({ connected: true, vendors: mockVendors });
    }

    const oauthClient = await getAuthenticatedClient();
    const realmId = token.realmId;

    if (!realmId) {
      return NextResponse.json({ connected: true, vendors: mockVendors });
    }

    const environment = process.env.QUICKBOOKS_ENVIRONMENT || "sandbox";
    const baseUrl =
      environment === "sandbox"
        ? "https://sandbox-quickbooks.api.intuit.com"
        : "https://quickbooks.api.intuit.com";

    // Query recent Vendors (max 10)
    const vendorsQuery = `select * from Vendor order by MetaData.LastUpdatedTime desc maxresults 10`;

    const response = await oauthClient.makeApiCall({
      url: `${baseUrl}/v3/company/${realmId}/query?query=${encodeURIComponent(vendorsQuery)}`,
      method: "GET",
      headers: { "Content-Type": "application/json", Accept: "application/json" },
    });

    const data =
      (response as any).json ||
      ((response as any).getJson ? (response as any).getJson() : response);

    const vendors: any[] = [];

    if (data.QueryResponse?.Vendor) {
      data.QueryResponse.Vendor.forEach((v: any) => {
        const displayName = v.DisplayName || "Unknown Vendor";
        const initials = displayName
          .split(" ")
          .map((part: string) => part[0])
          .join("")
          .slice(0, 2)
          .toUpperCase();

        vendors.push({
          id: v.Id,
          name: displayName,
          company: v.CompanyName || "",
          email: v.PrimaryEmailAddr?.Address || "No Email",
          phone: v.PrimaryPhone?.FreeFormNumber || "No Phone",
          acctNum: v.AcctNum || "—",
          balance: new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(v.Balance || 0),
          active: v.Active !== undefined ? v.Active : true,
          fallback: initials,
        });
      });
    }

    const finalVendors = vendors.length > 0 ? vendors : mockVendors;

    return NextResponse.json({ connected: true, vendors: finalVendors });
  } catch (error: any) {
    console.error("Error fetching QuickBooks vendors:", error.message || error);
    const token = await getToken();
    const isConnected = !!(token && token.access_token);
    return NextResponse.json({ connected: isConnected, vendors: isConnected ? mockVendors : [] });
  }
}
