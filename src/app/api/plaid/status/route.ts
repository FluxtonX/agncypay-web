import { NextResponse } from "next/server";
import { getPlaidToken } from "@/lib/plaid";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const data = await getPlaidToken();
    
    if (!data || !data.accessToken) {
      return NextResponse.json({
        connected: false,
        environment: process.env.PLAID_ENV || "sandbox",
      });
    }

    return NextResponse.json({
      connected: true,
      institutionName: data.institutionName || "Linked Bank",
      institutionId: data.institutionId || "",
      itemId: data.itemId,
      connectedAt: data.connectedAt,
      environment: process.env.PLAID_ENV || "sandbox",
    });
  } catch (error: any) {
    console.error("Error checking Plaid connection status:", error.message || error);
    return NextResponse.json({ connected: false, error: error.message });
  }
}
