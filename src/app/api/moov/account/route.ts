import { NextRequest, NextResponse } from "next/server";
import { Moov } from "@moovio/sdk";

// Initialize Moov SDK
const moov = new Moov({
  security: {
    username: process.env.MOOV_PUBLIC_KEY,
    password: process.env.MOOV_SECRET_KEY,
  },
});

export async function POST(req: NextRequest) {
  try {
    if (!process.env.MOOV_PUBLIC_KEY || !process.env.MOOV_SECRET_KEY) {
      console.warn("[Moov.io] Missing MOOV_PUBLIC_KEY or MOOV_SECRET_KEY in environment.");
      return NextResponse.json({ error: "Moov configuration missing" }, { status: 500 });
    }

    const body = await req.json();
    const { email, accountType, fullName, foreignID } = body;

    if (!email || !accountType) {
      return NextResponse.json({ error: "Missing required fields (email, accountType)" }, { status: 400 });
    }

    // Determine the Moov account type
    const moovAccountType = accountType === "agency" ? "business" : "individual";
    
    // Attempt to split fullName into first and last name for Moov Profile
    const nameParts = (fullName || "").trim().split(" ");
    const firstName = nameParts[0] || "AgncyPay";
    const lastName = nameParts.length > 1 ? nameParts.slice(1).join(" ") : "User";

    // Prepare the payload for Moov API
    const moovPayload: any = {
      accountType: moovAccountType,
      foreignID: foreignID || email, // Bind to Firebase UID if provided
      profile: {
        email: email,
      },
      // When creating accounts via API directly, capabilities can be requested here,
      // but usually we just start with basic profile and request later.
      // We will request basic transfers right now to start underwriting.
      capabilities: ["transfers", "wallet"],
    };

    if (moovAccountType === "individual") {
      moovPayload.profile.individual = {
        name: {
          firstName,
          lastName,
        },
        email,
      };
    } else {
      moovPayload.profile.business = {
        legalBusinessName: fullName || "AgncyPay Business",
        businessType: "llc", // Defaulting to LLC for now
      };
    }

    console.log("[Moov.io] Creating account with payload:", JSON.stringify(moovPayload, null, 2));

    // Call Moov API
    const moovAccount = await moov.accounts.create(moovPayload);

    return NextResponse.json({
      success: true,
      moovAccountId: moovAccount.result.accountID,
      account: moovAccount.result,
    });
  } catch (error: any) {
    console.error("[Moov.io] Error creating account:", error.message || error);
    return NextResponse.json({ 
      error: "Failed to create Moov account", 
      details: error.message 
    }, { status: 500 });
  }
}
