import { NextResponse } from "next/server";

export async function POST() {
  const response = NextResponse.json({ success: true, message: "QuickBooks disconnected." });

  const cookieOpts = {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    path: "/",
    sameSite: "lax" as const,
    maxAge: 0,
  };

  response.cookies.set("qb_access_token", "", cookieOpts);
  response.cookies.set("qb_refresh_token", "", cookieOpts);
  response.cookies.set("qb_realm_id", "", cookieOpts);

  return response;
}
