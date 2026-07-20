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

async function disconnectQuickBooks() {
  try {
    const res = await fetch(`${BACKEND_URL}/quickbooks/disconnect`, { method: "POST" });
    const data = await res.json();
    return NextResponse.json(data, { status: res.status });
  } catch (error: any) {
    console.error("Proxy error [quickbooks/disconnect]:", error.message);
    return NextResponse.json({ error: "Failed to disconnect" }, { status: 500 });
  }
}

export async function POST() {
  return disconnectQuickBooks();
}

export async function DELETE() {
  return disconnectQuickBooks();
}
