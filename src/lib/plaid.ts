import { Configuration, PlaidApi, PlaidEnvironments } from "plaid";
import crypto from "crypto";
import fs from "fs";
import path from "path";

const TOKEN_FILE_PATH = path.join(process.cwd(), "plaid-tokens.json");

// Derive a 32-byte key from the configured ENCRYPTION_KEY or PLAID_SECRET
function getEncryptionKey(): Buffer {
  const keySource = process.env.ENCRYPTION_KEY || process.env.PLAID_SECRET || "agncypay-fallback-encryption-secret-key-32";
  return crypto.createHash("sha256").update(keySource).digest();
}

// AES-256-GCM encryption helper
export function encrypt(text: string): string {
  const iv = crypto.randomBytes(12);
  const key = getEncryptionKey();
  const cipher = crypto.createCipheriv("aes-256-gcm", key, iv);
  
  let encrypted = cipher.update(text, "utf8", "hex");
  encrypted += cipher.final("hex");
  
  const authTag = cipher.getAuthTag().toString("hex");
  
  // Format: iv:encrypted_content:auth_tag
  return `${iv.toString("hex")}:${encrypted}:${authTag}`;
}

// AES-256-GCM decryption helper
export function decrypt(encryptedText: string): string {
  const parts = encryptedText.split(":");
  if (parts.length !== 3) {
    throw new Error("Invalid encrypted text format.");
  }
  
  const iv = Buffer.from(parts[0], "hex");
  const encrypted = parts[1];
  const authTag = Buffer.from(parts[2], "hex");
  const key = getEncryptionKey();
  
  const decipher = crypto.createDecipheriv("aes-256-gcm", key, iv);
  decipher.setAuthTag(authTag);
  
  let decrypted = decipher.update(encrypted, "hex", "utf8");
  decrypted += decipher.final("utf8");
  
  return decrypted;
}

export function isPlaidConfigured(): boolean {
  const clientId = process.env.PLAID_CLIENT_ID;
  const secret = process.env.PLAID_SECRET;
  return !!(
    clientId &&
    secret &&
    clientId !== "your_plaid_client_id" &&
    secret !== "your_environment_secret_key" &&
    !clientId.includes("placeholder") &&
    !clientId.startsWith("your_")
  );
}

// Plaid Client Configuration
const plaidEnv = process.env.PLAID_ENV || "sandbox";
// Make sure environment string matches standard Plaid api keys
const basePath = PlaidEnvironments[plaidEnv] || PlaidEnvironments.sandbox;

const configuration = new Configuration({
  basePath,
  baseOptions: {
    headers: {
      "PLAID-CLIENT-ID": process.env.PLAID_CLIENT_ID || "",
      "PLAID-SECRET": process.env.PLAID_SECRET || "",
    },
  },
});

export const plaidClient = new PlaidApi(configuration);

export type PlaidConnectionData = {
  accessToken: string;
  itemId: string;
  institutionName?: string;
  institutionId?: string;
  connectedAt: string;
};

// Save token to plaid-tokens.json
export async function savePlaidToken(data: {
  accessToken: string;
  itemId: string;
  institutionName?: string;
  institutionId?: string;
}) {
  try {
    const encryptedAccessToken = encrypt(data.accessToken);
    const fileData = {
      accessToken: encryptedAccessToken,
      itemId: data.itemId,
      institutionName: data.institutionName || "Unknown Institution",
      institutionId: data.institutionId || "",
      connectedAt: new Date().toISOString(),
    };
    
    fs.writeFileSync(TOKEN_FILE_PATH, JSON.stringify(fileData, null, 2), "utf8");
    console.log("Plaid tokens stored successfully.");
  } catch (error) {
    console.error("Error saving Plaid tokens:", error);
    throw error;
  }
}

// Get and decrypt Plaid token from plaid-tokens.json
export async function getPlaidToken(): Promise<PlaidConnectionData | null> {
  try {
    if (!fs.existsSync(TOKEN_FILE_PATH)) {
      return null;
    }
    
    const fileContent = fs.readFileSync(TOKEN_FILE_PATH, "utf8");
    const parsedData = JSON.parse(fileContent);
    
    if (!parsedData.accessToken) {
      return null;
    }
    
    const decryptedAccessToken = decrypt(parsedData.accessToken);
    
    return {
      accessToken: decryptedAccessToken,
      itemId: parsedData.itemId,
      institutionName: parsedData.institutionName,
      institutionId: parsedData.institutionId,
      connectedAt: parsedData.connectedAt,
    };
  } catch (error) {
    console.error("Error reading Plaid tokens:", error);
    return null;
  }
}

// Delete token (disconnect)
export async function deletePlaidToken() {
  try {
    if (fs.existsSync(TOKEN_FILE_PATH)) {
      fs.unlinkSync(TOKEN_FILE_PATH);
      console.log("Plaid tokens cleared.");
    }
  } catch (error) {
    console.error("Error deleting Plaid tokens:", error);
    throw error;
  }
}
