import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

const BACKEND_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:3001/api/v1";

// GET /api/payments/wallet/[walletId]
export async function GET(
  req: Request,
  { params }: { params: Promise<{ walletId: string }> }
) {
  try {
    const { walletId } = await params;
    const authHeader = req.headers.get("Authorization") || "";
    const res = await fetch(`${BACKEND_URL}/payments/wallet/${walletId}`, {
      headers: { Authorization: authHeader },
    });
    const data = await res.json();
    return NextResponse.json(data, { status: res.status });
  } catch (error: any) {
    console.error("Proxy error [payments/wallet]:", error.message);
    return NextResponse.json({ message: "Failed to reach server." }, { status: 502 });
  }
}
