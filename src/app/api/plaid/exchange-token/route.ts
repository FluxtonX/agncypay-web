import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

const getBackendUrl = () => {
  let base = process.env.NEXT_PUBLIC_API_BASE_URL || process.env.BACKEND_URL || "http://localhost:3001/api/v1";
  if (!base.endsWith("/api/v1") && !base.includes("/api/v1")) {
    base = `${base.replace(/\/$/, "")}/api/v1`;
  }
  return base;
};
const BACKEND_URL = getBackendUrl();

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}));
    const res = await fetch(`${BACKEND_URL}/plaid/exchange-token`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    const data = await res.json();
    return NextResponse.json(data, { status: res.status });
  } catch (error: any) {
    console.error("Proxy error [plaid/exchange-token]:", error.message);
    return NextResponse.json({ error: "Failed to exchange token" }, { status: 500 });
  }
}
