import { db } from "./firebase";
import { doc, getDoc, updateDoc } from "firebase/firestore";

interface DwollaTokenResponse {
  access_token: string;
  expires_in: number;
}

let cachedToken: string | null = null;
let tokenExpiresAt = 0;

const DWOLLA_ENV = process.env.DWOLLA_ENV || "sandbox";
const DWOLLA_BASE_URL =
  DWOLLA_ENV === "production" ? "https://api.dwolla.com" : "https://api-sandbox.dwolla.com";

const CLIENT_ID = process.env.DWOLLA_CLIENT_ID;
const CLIENT_SECRET = process.env.DWOLLA_CLIENT_SECRET;

/**
 * Fetch a Client Credentials access token from Dwolla
 */
export async function getDwollaAccessToken(): Promise<string> {
  if (cachedToken && Date.now() < tokenExpiresAt) {
    return cachedToken;
  }

  if (!CLIENT_ID || !CLIENT_SECRET) {
    throw new Error("Dwolla environment credentials DWOLLA_CLIENT_ID or DWOLLA_CLIENT_SECRET are not configured.");
  }

  const basicAuth = Buffer.from(`${CLIENT_ID}:${CLIENT_SECRET}`).toString("base64");

  const response = await fetch(`${DWOLLA_BASE_URL}/token`, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      Authorization: `Basic ${basicAuth}`,
    },
    body: "grant_type=client_credentials",
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error("Failed to authenticate with Dwolla:", errorText);
    throw new Error(`Dwolla OAuth error: ${response.statusText} (${response.status})`);
  }

  const data: DwollaTokenResponse = await response.json();
  cachedToken = data.access_token;
  // Expire 60 seconds early to prevent edge cases
  tokenExpiresAt = Date.now() + (data.expires_in - 60) * 1000;

  return cachedToken;
}

/**
 * Make an authorized HTTP request to the Dwolla API
 */
async function requestDwolla(endpoint: string, options: RequestInit = {}) {
  const token = await getDwollaAccessToken();
  const url = endpoint.startsWith("http") ? endpoint : `${DWOLLA_BASE_URL}${endpoint}`;

  const headers = {
    Accept: "application/vnd.dwolla.v1.hal+json",
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`,
    ...(options.headers || {}),
  };

  const res = await fetch(url, {
    ...options,
    headers,
  });

  return res;
}

/**
 * Create a Dwolla customer
 * We support "unverified" (good for send/receive in Sandbox) and "receive-only"
 */
export async function createDwollaCustomer(data: {
  firstName: string;
  lastName: string;
  email: string;
  type?: "unverified" | "receive-only";
}): Promise<string> {
  const payload: Record<string, string> = {
    firstName: data.firstName || "John",
    lastName: data.lastName || "Doe",
    email: data.email.trim().toLowerCase(),
  };

  if (data.type === "receive-only") {
    payload.type = "receive-only";
  } else {
    // Unverified Customer requires ipAddress
    payload.ipAddress = "127.0.0.1";
  }

  const res = await requestDwolla("/customers", {
    method: "POST",
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    const err = await res.json();
    console.error("Dwolla createCustomer error:", err);
    throw new Error(err.message || err._embedded?.errors?.[0]?.message || "Failed to create Dwolla Customer");
  }

  // Dwolla returns customer URL in Location header
  const location = res.headers.get("Location");
  if (!location) {
    throw new Error("Dwolla customer creation did not return a Location header.");
  }

  // Extract ID from the URL (e.g. /customers/3a79d3b3-...)
  const parts = location.split("/");
  return parts[parts.length - 1];
}

/**
 * Links a Plaid processor token to a Dwolla Customer as a funding source
 */
export async function addFundingSourceWithPlaid(
  customerId: string,
  plaidProcessorToken: string,
  bankName: string
): Promise<string> {
  const res = await requestDwolla(`/customers/${customerId}/funding-sources`, {
    method: "POST",
    body: JSON.stringify({
      plaidToken: plaidProcessorToken,
      name: bankName,
    }),
  });

  if (!res.ok) {
    const err = await res.json();
    console.error("Dwolla addFundingSourceWithPlaid error:", err);
    throw new Error(err.message || "Failed to link Plaid bank account to Dwolla.");
  }

  const location = res.headers.get("Location");
  if (!location) {
    throw new Error("Dwolla did not return a funding source URL.");
  }
  return location; // Return the full URL which is used in transfer requests
}

/**
 * Manually link a bank account (useful for Talents)
 */
export async function addFundingSourceManually(
  customerId: string,
  data: {
    routingNumber: string;
    accountNumber: string;
    bankAccountType: "checking" | "savings";
    name: string;
  }
): Promise<string> {
  const res = await requestDwolla(`/customers/${customerId}/funding-sources`, {
    method: "POST",
    body: JSON.stringify({
      routingNumber: data.routingNumber,
      accountNumber: data.accountNumber,
      bankAccountType: data.bankAccountType,
      name: data.name,
    }),
  });

  if (!res.ok) {
    const err = await res.json();
    console.error("Dwolla addFundingSourceManually error:", err);
    throw new Error(err.message || "Failed to manually link bank account to Dwolla.");
  }

  const location = res.headers.get("Location");
  if (!location) {
    throw new Error("Dwolla did not return a funding source URL.");
  }
  return location;
}

/**
 * Initiates an ACH transfer between two funding sources
 */
export async function initiateDwollaTransfer(data: {
  sourceFundingSourceUrl: string;
  destinationFundingSourceUrl: string;
  amount: number;
  correlationId?: string;
}): Promise<string> {
  const res = await requestDwolla("/transfers", {
    method: "POST",
    body: JSON.stringify({
      _links: {
        source: {
          href: data.sourceFundingSourceUrl,
        },
        destination: {
          href: data.destinationFundingSourceUrl,
        },
      },
      amount: {
        currency: "USD",
        value: data.amount.toFixed(2),
      },
      correlationId: data.correlationId,
    }),
  });

  if (!res.ok) {
    const err = await res.json();
    console.error("Dwolla initiateDwollaTransfer error:", err);
    throw new Error(err.message || "Failed to execute bank transfer.");
  }

  const location = res.headers.get("Location");
  if (!location) {
    throw new Error("Dwolla transfer did not return a transfer URL.");
  }

  const parts = location.split("/");
  return parts[parts.length - 1]; // Return Transfer ID
}

/**
 * Gets or creates a Dwolla customer for a user email, and links it in Firestore
 */
export async function getOrCreateDwollaCustomerForUser(uid: string): Promise<string> {
  const userRef = doc(db, "users", uid);
  const userSnap = await getDoc(userRef);

  if (!userSnap.exists()) {
    throw new Error(`User ${uid} not found in Firestore`);
  }

  const userData = userSnap.data();
  if (userData.dwollaCustomerId) {
    return userData.dwollaCustomerId;
  }

  // Create Dwolla customer
  const fullName = userData.fullName || "User";
  const nameParts = fullName.trim().split(" ");
  const firstName = nameParts[0] || "AgncyPay";
  const lastName = nameParts.slice(1).join(" ") || "Member";

  // Determine type
  // Brands and Agencies can send money, so let's make them "unverified"
  // Talent can be receive-only
  const isReceiver = userData.accountType === "individual" || userData.accountType === "talent" || userData.accountType === "talent_independent";
  const type = isReceiver ? "receive-only" : "unverified";

  console.log(`Creating Dwolla customer for user ${userData.email} (${type})...`);
  const dwollaCustomerId = await createCustomer({
    firstName,
    lastName,
    email: userData.email,
    type,
  });

  // Save to Firestore
  await updateDoc(userRef, { dwollaCustomerId });
  return dwollaCustomerId;
}

// Internal alias mapping to createDwollaCustomer
async function createCustomer(data: {
  firstName: string;
  lastName: string;
  email: string;
  type?: "unverified" | "receive-only";
}) {
  return createDwollaCustomer(data);
}
