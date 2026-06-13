import { getToken } from "@/lib/quickbooks";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const token = await getToken();
    const isConnected = !!(token && token.access_token);

    if (!isConnected) {
      return NextResponse.json({
        connected: false,
        environment: process.env.QUICKBOOKS_ENVIRONMENT || "sandbox",
      });
    }

    const createdAt = typeof token.createdAt === "number" ? token.createdAt : Date.now();
    const accessExpiresAt = token.expires_in ? createdAt + token.expires_in * 1000 : null;
    const refreshExpiresAt = token.x_refresh_token_expires_in
      ? createdAt + token.x_refresh_token_expires_in * 1000
      : null;

    return NextResponse.json({
      connected: true,
      realmId: token.realmId || null,
      environment: process.env.QUICKBOOKS_ENVIRONMENT || "sandbox",
      connectedAt: new Date(createdAt).toISOString(),
      accessExpiresAt: accessExpiresAt ? new Date(accessExpiresAt).toISOString() : null,
      refreshExpiresAt: refreshExpiresAt ? new Date(refreshExpiresAt).toISOString() : null,
      hasRefreshToken: !!token.refresh_token,
    });
  } catch (error) {
    console.error("Error checking QuickBooks status:", error);
    return NextResponse.json({ connected: false });
  }
}
