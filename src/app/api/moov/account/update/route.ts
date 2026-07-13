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
    const { moovAccountId, businessSetup, accountType, termsOfService } = body;

    if (!moovAccountId) {
      return NextResponse.json({ error: "Missing moovAccountId" }, { status: 400 });
    }

    // Determine the Moov account type
    const moovAccountType = accountType === "agency" || accountType === "brand" || accountType === "mother_agency" 
      ? "business" 
      : "individual";

    const patchAccountPayload: any = {
      termsOfService: {
        manual: {
          acceptedDate: new Date(termsOfService?.acceptedDate || Date.now()),
          acceptedIP: termsOfService?.acceptedIp || "127.0.0.1",
          acceptedDomain: "agncypay.com",
          acceptedUserAgent: req.headers.get("user-agent") || "Mozilla/5.0",
        }
      },
      profile: {}
    };

    if (moovAccountType === "business" && businessSetup) {
      patchAccountPayload.profile.business = {
        legalBusinessName: businessSetup.legalName,
        doingBusinessAs: businessSetup.brandName || undefined,
        businessType: "llc",
        email: businessSetup.email,
        phone: {
          number: businessSetup.phone ? businessSetup.phone.replace(/\D/g, "") : "",
          countryCode: "1",
        },
        address: {
          addressLine1: businessSetup.addressLine1 || "123 Business Rd",
          addressLine2: businessSetup.addressLine2 || undefined,
          city: businessSetup.city || "San Francisco",
          stateOrProvince: businessSetup.stateOrProvince || "CA",
          postalCode: businessSetup.postalCode || "94105",
          country: businessSetup.country || "US",
        },
        website: businessSetup.website || "https://agncypay.com",
        industryCodes: {
          naics: "541810",
          sic: "7311",
        },
        taxID: businessSetup.taxId ? {
          ein: {
            number: businessSetup.taxId.replace(/\D/g, "")
          }
        } : undefined,
      };
    } else if (moovAccountType === "individual" && businessSetup) {
      // Parse DOB for individual
      let birthDateObj: any = undefined;
      if (businessSetup.dob) {
        const parts = businessSetup.dob.split("/");
        if (parts.length === 3) {
          birthDateObj = {
            month: parseInt(parts[0], 10),
            day: parseInt(parts[1], 10),
            year: parseInt(parts[2], 10),
          };
        }
      }

      patchAccountPayload.profile.individual = {
        name: {
          firstName: businessSetup.firstName || "John",
          lastName: businessSetup.lastName || "Doe",
        },
        email: businessSetup.email,
        phone: {
          number: businessSetup.phone ? businessSetup.phone.replace(/\D/g, "") : "",
          countryCode: "1",
        },
        address: {
          addressLine1: businessSetup.addressLine1 || "123 Home Ln",
          addressLine2: businessSetup.addressLine2 || undefined,
          city: businessSetup.city || "San Francisco",
          stateOrProvince: businessSetup.stateOrProvince || "CA",
          postalCode: businessSetup.postalCode || "94105",
          country: businessSetup.country || "US",
        },
        birthDate: birthDateObj,
        governmentID: businessSetup.ssnLast4 ? {
          ssn: {
            lastFour: businessSetup.ssnLast4,
          }
        } : undefined,
      };
    }

    console.log("[Moov.io] Updating account with payload:", JSON.stringify(patchAccountPayload, null, 2));

    const moovAccount = await moov.accounts.update({
      accountID: moovAccountId,
      patchAccount: patchAccountPayload,
    });

    return NextResponse.json({
      success: true,
      account: moovAccount.result,
    });
  } catch (error: any) {
    console.error("[Moov.io] Error updating account:", error.message || error);
    return NextResponse.json({ 
      error: "Failed to update Moov account", 
      details: error.message 
    }, { status: 500 });
  }
}
