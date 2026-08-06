import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const clientId = process.env.PLAID_CLIENT_ID;
    const secret = process.env.PLAID_SECRET;
    const env = process.env.PLAID_ENV || "sandbox";

    if (!clientId || !secret) {
      return NextResponse.json(
        { error: "Plaid credentials not configured." },
        { status: 500 }
      );
    }

    const { public_token, institution } = await req.json();

    if (!public_token) {
      return NextResponse.json(
        { error: "Missing public_token in request body." },
        { status: 400 }
      );
    }

    // Step 1: Exchange public_token for access_token
    const exchangeRes = await fetch(`https://${env}.plaid.com/item/public_token/exchange`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        client_id: clientId,
        secret: secret,
        public_token: public_token,
      }),
    });

    const exchangeData = await exchangeRes.json();

    if (!exchangeRes.ok) {
      console.error("Plaid exchange error:", exchangeData);
      return NextResponse.json(
        { error: exchangeData.error_message || "Failed to exchange Plaid public token" },
        { status: exchangeRes.status }
      );
    }

    const accessToken = exchangeData.access_token;
    const itemId = exchangeData.item_id;

    // Step 2: Fetch account balance & details using access_token
    const balanceRes = await fetch(`https://${env}.plaid.com/accounts/balance/get`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        client_id: clientId,
        secret: secret,
        access_token: accessToken,
      }),
    });

    const balanceData = await balanceRes.json();

    if (!balanceRes.ok) {
      console.error("Plaid balance error:", balanceData);
      return NextResponse.json(
        { error: balanceData.error_message || "Failed to fetch account balances" },
        { status: balanceRes.status }
      );
    }

    const instName = institution?.name || "Connected Bank Feed";

    const formattedAccounts = (balanceData.accounts || []).map((acc: any) => ({
      id: acc.account_id,
      itemId: itemId,
      institutionName: instName,
      name: acc.name || acc.official_name || "Plaid Account",
      officialName: acc.official_name || acc.name,
      mask: acc.mask || "0000",
      type: acc.type,
      subtype: acc.subtype || acc.type,
      availableBalance: acc.balances?.available ?? acc.balances?.current ?? 0,
      currentBalance: acc.balances?.current ?? 0,
      currency: acc.balances?.iso_currency_code || "USD",
      connectedAt: new Date().toISOString(),
    }));

    return NextResponse.json({
      success: true,
      accounts: formattedAccounts,
    });
  } catch (err: any) {
    console.error("Error in /api/plaid/exchange-token:", err);
    return NextResponse.json(
      { error: err?.message || "Internal server error during token exchange" },
      { status: 500 }
    );
  }
}
