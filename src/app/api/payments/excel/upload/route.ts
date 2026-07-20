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
    const formData = await req.formData();
    const file = formData.get("file");
    const walletId = formData.get("walletId");

    if (!file) {
      return NextResponse.json({ success: false, error: "Missing file" }, { status: 400 });
    }
    if (!walletId) {
      return NextResponse.json({ success: false, error: "Missing walletId" }, { status: 400 });
    }

    // Construct FormData to forward to the NestJS backend
    const backendFormData = new FormData();
    backendFormData.append("file", file);
    backendFormData.append("walletId", walletId);

    console.log(`Forwarding manual ingestion request to backend: ${BACKEND_URL}/payments/excel/upload`);

    const res = await fetch(`${BACKEND_URL}/payments/excel/upload`, {
      method: "POST",
      body: backendFormData,
    });

    let data;
    const contentType = res.headers.get("content-type") || "";
    if (contentType.includes("application/json")) {
      data = await res.json();
    } else {
      const text = await res.text();
      data = { success: false, error: text || `HTTP error ${res.status}: Backend returned non-JSON response.` };
    }
    return NextResponse.json(data, { status: res.status });
  } catch (error: any) {
    console.error("Proxy error [payments/excel/upload]:", error.message);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to process excel upload" },
      { status: 500 }
    );
  }
}
