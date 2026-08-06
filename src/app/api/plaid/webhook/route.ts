import { NextResponse } from "next/server";
import { getPlaidToken, plaidClient } from "@/lib/plaid";
import fs from "fs";
import path from "path";

export const dynamic = "force-dynamic";

const WEBHOOK_LOG_FILE = path.join(process.cwd(), "plaid-webhooks.json");

// Helper to log webhook payload locally
function logWebhookEvent(payload: any) {
  try {
    let logs: any[] = [];
    if (fs.existsSync(WEBHOOK_LOG_FILE)) {
      const content = fs.readFileSync(WEBHOOK_LOG_FILE, "utf8");
      logs = JSON.parse(content);
    }
    
    // Add current timestamp and new payload to log list
    logs.unshift({
      id: `wh-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      receivedAt: new Date().toISOString(),
      payload,
    });

    // Keep last 50 webhook events
    if (logs.length > 50) {
      logs = logs.slice(0, 50);
    }

    fs.writeFileSync(WEBHOOK_LOG_FILE, JSON.stringify(logs, null, 2), "utf8");
    console.log("Successfully logged Plaid webhook event locally.");
  } catch (err) {
    console.error("Failed to log Plaid webhook event:", err);
  }
}

export async function POST(req: Request) {
  try {
    const payload = await req.json();
    console.log("Plaid Webhook received payload:", JSON.stringify(payload, null, 2));

    // Log the event for visibility and debugging
    logWebhookEvent(payload);

    const { webhook_type, webhook_code, item_id } = payload;

    // Check if we have an active connection matching this item_id
    const activeConnection = await getPlaidToken();
    if (!activeConnection || activeConnection.itemId !== item_id) {
      console.warn(`Webhook received for inactive or non-matching item_id: ${item_id}`);
      // Return 200 anyway so Plaid knows we processed the request, but log the warning
      return NextResponse.json({ success: true, message: "Ignored webhook (item_id mismatch or inactive)" });
    }

    // Handle webhook types
    switch (webhook_type) {
      case "TRANSACTIONS":
        console.log(`Processing TRANSACTIONS webhook of code: ${webhook_code}`);
        
        if (webhook_code === "SYNC_UPDATES_AVAILABLE" || webhook_code === "INITIAL_UPDATE" || webhook_code === "DEFAULT_UPDATE") {
          console.log(`Triggering transaction synchronization for Plaid Item: ${item_id}`);
          
          try {
            // Attempt to trigger a transaction sync call
            // We use a blank cursor initially or try to load a saved cursor.
            // For this sandbox deployment, we log the action.
            const syncResponse = await plaidClient.transactionsSync({
              access_token: activeConnection.accessToken,
              count: 100,
            });
            
            const { added, modified, removed, next_cursor } = syncResponse.data;
            console.log(`Sync complete. Added: ${added.length}, Modified: ${modified.length}, Removed: ${removed.length}. Next cursor: ${next_cursor}`);
            
            // Save the next cursor if needed (normally in database/secure storage)
          } catch (syncErr: any) {
            console.error("Error performing Plaid transaction sync during webhook:", syncErr.response?.data || syncErr.message || syncErr);
          }
        }
        break;

      case "ITEM":
        console.log(`Processing ITEM webhook of code: ${webhook_code}`);
        if (webhook_code === "ERROR" || webhook_code === "PENDING_EXPIRATION") {
          console.warn(`Plaid Item ${item_id} has entered an error or pending expiration state:`, payload.error);
          // In real production, update the DB to flag this connection as disconnected/errored
        }
        break;

      default:
        console.log(`Unhandled webhook type: ${webhook_type}`);
    }

    // Plaid requires a 200 OK response to acknowledge receipt of webhooks.
    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Error processing Plaid webhook:", error.message || error);
    // Return 200 OK so Plaid does not keep retrying, but log the internal error
    return NextResponse.json({ error: "Internal error processing webhook", details: error.message }, { status: 200 });
  }
}

// Add a GET endpoint to view webhook logs easily from the browser/dashboard
export async function GET() {
  try {
    if (!fs.existsSync(WEBHOOK_LOG_FILE)) {
      return NextResponse.json([]);
    }
    const content = fs.readFileSync(WEBHOOK_LOG_FILE, "utf8");
    const logs = JSON.parse(content);
    return NextResponse.json(logs);
  } catch (error: any) {
    return NextResponse.json({ error: "Failed to load webhook logs" }, { status: 500 });
  }
}
