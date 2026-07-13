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
    const { moovAccountId, representative } = body;

    if (!moovAccountId) {
      return NextResponse.json({ error: "Missing moovAccountId" }, { status: 400 });
    }

    if (!representative) {
      return NextResponse.json({ error: "Missing representative payload" }, { status: 400 });
    }

    // Parse DOB (expected format MM/DD/YYYY)
    let birthDateObj: any = undefined;
    if (representative.dob) {
      const parts = representative.dob.split("/");
      if (parts.length === 3) {
        birthDateObj = {
          month: parseInt(parts[0], 10),
          day: parseInt(parts[1], 10),
          year: parseInt(parts[2], 10),
        };
      }
    }

    // Map the payload
    const createRepPayload: any = {
      name: {
        firstName: representative.firstName || "Jane",
        lastName: representative.lastName || "Doe",
      },
      email: representative.email || "rep@agncypay.com",
      phone: representative.phone ? {
        number: representative.phone.replace(/\D/g, ""),
        countryCode: "1",
      } : undefined,
      responsibilities: {
        isController: true,
        isOwner: true,
        ownershipPercentage: representative.ownershipPercentage || 100,
        jobTitle: representative.jobTitle || "Owner",
      },
      address: {
        addressLine1: representative.addressLine1 || "123 Main St",
        addressLine2: representative.addressLine2 || undefined,
        city: representative.city || "San Francisco",
        stateOrProvince: representative.stateOrProvince || "CA",
        postalCode: representative.postalCode || "94105",
        country: representative.country || "US",
      }
    };

    if (birthDateObj) {
      createRepPayload.birthDate = birthDateObj;
    }

    if (representative.ssnLast4) {
      createRepPayload.governmentID = {
        ssn: {
          lastFour: representative.ssnLast4,
        }
      };
    }

    console.log("[Moov.io] Creating representative with payload:", JSON.stringify(createRepPayload, null, 2));

    const moovRep = await moov.representatives.create({
      accountID: moovAccountId,
      createRepresentative: createRepPayload,
    });

    return NextResponse.json({
      success: true,
      representative: moovRep.result,
    });
  } catch (error: any) {
    console.error("[Moov.io] Error creating representative:", error.message || error);
    return NextResponse.json({ 
      error: "Failed to create Moov representative", 
      details: error.message 
    }, { status: 500 });
  }
}
