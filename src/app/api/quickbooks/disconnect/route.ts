import { clearToken, getQuickBooksClient, getToken } from "@/lib/quickbooks";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

async function disconnectQuickBooks() {
  const token = await getToken();

  if (token?.access_token || token?.refresh_token) {
    try {
      const oauthClient = getQuickBooksClient(token);
      if (typeof (oauthClient as { revoke?: () => Promise<unknown> }).revoke === "function") {
        await (oauthClient as { revoke: () => Promise<unknown> }).revoke();
      }
    } catch (error) {
      console.warn("QuickBooks token revoke failed; clearing local cookie anyway.", error);
    }
  }

  await clearToken();

  return NextResponse.json({
    connected: false,
    disconnected: true,
  });
}

export async function POST() {
  return disconnectQuickBooks();
}

export async function DELETE() {
  return disconnectQuickBooks();
}
