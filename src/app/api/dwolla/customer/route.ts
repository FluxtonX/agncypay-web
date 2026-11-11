import { NextResponse } from "next/server";
import { getOrCreateDwollaCustomerForUser } from "../../../../lib/dwollaService";

export async function POST(req: Request) {
  try {
    const { uid } = await req.json();

    if (!uid) {
      return NextResponse.json(
        { error: "Missing uid in request body" },
        { status: 400 }
      );
    }

    const dwollaCustomerId = await getOrCreateDwollaCustomerForUser(uid);

    return NextResponse.json({
      success: true,
      dwollaCustomerId,
    });
  } catch (err) {
    console.error("Error in /api/dwolla/customer:", err);
    return NextResponse.json(
      { error: (err instanceof Error ? err.message : "") || "Internal server error creating Dwolla Customer" },
      { status: 500 }
    );
  }
}
