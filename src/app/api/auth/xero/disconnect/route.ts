import { NextResponse } from "next/server";

export async function POST() {
  const response = NextResponse.json({ success: true, message: "Xero disconnected." });

  const cookieOpts = {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    path: "/",
    sameSite: "lax" as const,
    maxAge: 0,
  };

  response.cookies.set("xero_access_token", "", cookieOpts);
  response.cookies.set("xero_refresh_token", "", cookieOpts);
  response.cookies.set("xero_tenant_id", "", cookieOpts);

  return response;
}
