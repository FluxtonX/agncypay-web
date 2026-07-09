import { NextResponse } from "next/server";
import { getPlaidToken, deletePlaidToken, plaidClient } from "@/lib/plaid";

export const dynamic = "force-dynamic";

export async function POST() {
  try {
    const data = await getPlaidToken();

    if (data && data.accessToken) {
      console.log("Revoking Plaid access token on Plaid API...");
      try {
        await plaidClient.itemRemove({
          access_token: data.accessToken,
        });
        console.log("Plaid access token revoked successfully.");
      } catch (plaidErr: any) {
        // If the token is already invalid, we still want to clean up locally.
        console.warn("Plaid API could not revoke token, cleaning up locally anyway:", plaidErr.message || plaidErr);
      }
    }

    // Delete token files locally
    await deletePlaidToken();

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Error disconnecting Plaid integration:", error.message || error);
    return NextResponse.json({ error: "Failed to disconnect integration", details: error.message }, { status: 500 });
  }
}
