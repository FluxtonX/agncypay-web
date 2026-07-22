import { NextResponse } from "next/server";

export async function POST() {
  try {
    const clientId = process.env.PLAID_CLIENT_ID;
    const secret = process.env.PLAID_SECRET;
    const env = process.env.PLAID_ENV || "sandbox";

    if (!clientId || !secret) {
      return NextResponse.json(
        { error: "Plaid client credentials are not configured in environment variables." },
        { status: 500 }
      );
    }

    const response = await fetch(`https://${env}.plaid.com/link/token/create`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        client_id: clientId,
        secret: secret,
        client_name: "AgncyPay",
        user: {
          client_user_id: "brand_user_" + Date.now(),
        },
        products: ["auth", "transactions"],
        country_codes: ["US"],
        language: "en",
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      console.error("Plaid link/token/create error:", data);
      return NextResponse.json(
        { error: data.error_message || "Failed to create Plaid link token" },
        { status: response.status }
      );
    }

    return NextResponse.json({ link_token: data.link_token });
  } catch (err: any) {
    console.error("Error in /api/plaid/link-token:", err);
    return NextResponse.json(
      { error: err?.message || "Internal server error creating Plaid link token" },
      { status: 500 }
    );
  }
}
