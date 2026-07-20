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

export async function GET() {
  try {
    const res = await fetch(`${BACKEND_URL}/quickbooks/vendors`, { cache: "no-store" });
    if (!res.ok) {
      return NextResponse.json({ connected: false, vendors: [] }, { status: 200 });
    }
    const data = await res.json();
    return NextResponse.json(data, { status: 200 });
  } catch (error: any) {
    console.error("Proxy error [quickbooks/vendors]:", error.message);
    return NextResponse.json({ connected: false, vendors: [] }, { status: 200 });
  }
}
