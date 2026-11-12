import { NextResponse } from "next/server";
import { collection, doc, getDocs, limit, query, updateDoc, where } from "firebase/firestore";
import { db } from "@/lib/firebase";

// Runs on the Node runtime so the Brevo API key (server-only env) is available and never shipped to the browser.
export const runtime = "nodejs";

const BREVO_URL = "https://api.brevo.com/v3/smtp/email";

interface MailMessage {
  subject?: string;
  html?: string;
  text?: string;
}

/** Sends one email through Brevo's transactional API. Returns the provider message id. */
async function sendViaBrevo(to: string, message: MailMessage): Promise<string> {
  const key = process.env.BREVO_API_KEY;
  const fromEmail = process.env.MAIL_FROM_EMAIL;
  if (!key) throw new Error("BREVO_API_KEY is not set");
  if (!fromEmail) throw new Error("MAIL_FROM_EMAIL is not set");

  const res = await fetch(BREVO_URL, {
    method: "POST",
    headers: { "api-key": key, "content-type": "application/json", accept: "application/json" },
    body: JSON.stringify({
      sender: { email: fromEmail, name: process.env.MAIL_FROM_NAME || "AGNCY" },
      to: [{ email: to }],
      subject: message.subject || "(no subject)",
      htmlContent: message.html || message.text || "",
      textContent: message.text || "",
    }),
  });

  const body = await res.text();
  if (!res.ok) throw new Error(`Brevo ${res.status}: ${body}`);
  try {
    return (JSON.parse(body).messageId as string) || "sent";
  } catch {
    return "sent";
  }
}

/**
 * Flushes the `mail` outbox: picks up pending documents (the ones every queueMail write creates) and
 * delivers them through Brevo, stamping a delivery status back onto each — same shape the Firebase
 * email extension used, so the rest of the app is unchanged.
 *
 * Idempotent: a document is claimed (status → "processing") before sending, so overlapping flushes
 * don't double-send. Pending documents left by one call are picked up by the next.
 */
const MAX_ATTEMPTS = 3;
/** A send that has been "processing" this long crashed part-way; it is picked up again. */
const STUCK_AFTER_MS = 10 * 60 * 1000;

type MailDoc = { to?: string | string[]; message?: MailMessage; status?: string; attempts?: number; delivery?: { startTime?: number } };

export async function POST() {
  let docs;
  try {
    const [pending, processing] = await Promise.all([
      getDocs(query(collection(db, "mail"), where("status", "==", "pending"), limit(25))),
      getDocs(query(collection(db, "mail"), where("status", "==", "processing"), limit(25))),
    ]);
    const now = Date.now();
    docs = [
      ...pending.docs,
      ...processing.docs.filter((d) => now - ((d.data() as MailDoc).delivery?.startTime ?? 0) > STUCK_AFTER_MS),
    ];
  } catch (err) {
    return NextResponse.json({ error: err instanceof Error ? err.message : "query failed" }, { status: 500 });
  }

  const results: { id: string; state: string; error?: string }[] = [];
  for (const d of docs) {
    const data = d.data() as MailDoc;
    const ref = doc(db, "mail", d.id);
    const to = Array.isArray(data.to) ? data.to[0] : data.to;
    if (!to) {
      await updateDoc(ref, { status: "error", delivery: { state: "ERROR", error: "No recipient", endTime: Date.now() } });
      results.push({ id: d.id, state: "ERROR", error: "No recipient" });
      continue;
    }
    const attempts = (data.attempts ?? 0) + 1;
    // Claim before sending so a concurrent flush skips it.
    await updateDoc(ref, { status: "processing", attempts, delivery: { state: "PROCESSING", startTime: Date.now() } });
    try {
      const messageId = await sendViaBrevo(to, data.message || {});
      await updateDoc(ref, { status: "sent", delivery: { state: "SUCCESS", messageId, endTime: Date.now() } });
      results.push({ id: d.id, state: "SUCCESS" });
    } catch (err) {
      const message = err instanceof Error ? err.message : "send failed";
      // Transient failures go back in the queue; after MAX_ATTEMPTS the email is marked failed.
      const retry = attempts < MAX_ATTEMPTS;
      await updateDoc(ref, { status: retry ? "pending" : "error", delivery: { state: retry ? "RETRY" : "ERROR", error: message, endTime: Date.now() } });
      results.push({ id: d.id, state: retry ? "RETRY" : "ERROR", error: message });
    }
  }

  return NextResponse.json({ processed: results.length, results });
}
