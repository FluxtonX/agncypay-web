import { getToken } from "@/lib/quickbooks";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const token = await getToken();
    const isConnected = !!(token && token.access_token);
    return NextResponse.json({ connected: isConnected });
  } catch (error) {
    console.error("Error checking QuickBooks status:", error);
    return NextResponse.json({ connected: false });
  }
}
