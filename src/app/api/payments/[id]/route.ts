import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

const getBackendUrl = () => {
  let base = process.env.NEXT_PUBLIC_API_BASE_URL || process.env.BACKEND_URL || "http://localhost:3001/api/v1";
  if (!base.endsWith("/api/v1") && !base.includes("/api/v1")) {
    base = `${base.replace(/\/$/, "")}/api/v1`;
  }
  return base;
};
const BACKEND_URL = getBackendUrl();

// GET /api/payments/[id]
export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const authHeader = req.headers.get("Authorization") || "";
    
    console.log(`[Proxy] GET /api/payments/${id}`);
    console.log(`[Proxy] BACKEND_URL: ${BACKEND_URL}`);
    
    const res = await fetch(`${BACKEND_URL}/payments/${id}`, {
      headers: { Authorization: authHeader },
      cache: "no-store",
    });
    
    console.log(`[Proxy] Local backend response status: ${res.status}`);
    
    if (res.ok) {
      const data = await res.json();
      // If the local DB returned data: null, we should fall back.
      if (data.data) {
        return NextResponse.json(data, { status: res.status });
      }
      console.log(`[Proxy] Local payment returned null data. Proceeding to fallback...`);
    }

    // Fallback: Check if it is a QuickBooks invoice
    try {
      console.log(`[Proxy] Local payment not found. Querying QuickBooks invoices as fallback...`);
      const qbRes = await fetch(`${BACKEND_URL}/quickbooks/invoices`, {
        headers: authHeader ? { Authorization: authHeader } : {},
        cache: "no-store",
      });
      
      console.log(`[Proxy] QuickBooks invoices response status: ${qbRes.status}`);
      
      if (qbRes.ok) {
        const qbData = await qbRes.json();
        console.log(`[Proxy] QuickBooks invoices count: ${qbData.invoices?.length}`);
        
        const qbInvoice = qbData.invoices?.find((inv: any) => {
          const invId = inv.id || inv.Id || inv.InvoiceID || "";
          const invDoc = inv.docNumber || inv.DocNumber || inv.InvoiceNumber || "";
          return String(invId).toLowerCase() === String(id).toLowerCase() || 
                 String(invDoc).toLowerCase() === String(id).toLowerCase();
        });
        
        if (qbInvoice) {
          console.log(`[Proxy] Found matching QuickBooks invoice:`, qbInvoice);
          const invId = qbInvoice.id || qbInvoice.Id || qbInvoice.InvoiceID;
          const invDoc = qbInvoice.docNumber || qbInvoice.DocNumber || qbInvoice.InvoiceNumber;
          const invAmount = qbInvoice.amount || qbInvoice.Total || 0;
          const invStatus = qbInvoice.status || qbInvoice.Status || "Pending";
          
          const mappedPayment = {
            id: invId,
            invoiceId: invDoc,
            externalId: `QBO-${invId}`,
            source: "QUICKBOOKS",
            amount: invAmount.toString(),
            currency: "USD",
            status: String(invStatus).toLowerCase() === "paid" ? "SETTLED" : "PENDING",
            settledAmount: String(invStatus).toLowerCase() === "paid" ? invAmount.toString() : null,
            settledAt: null,
            invoiceData: {
              clientName: qbInvoice.name || qbInvoice.ContactName || "Unknown Customer",
              description: qbInvoice.detail || qbInvoice.Reference || "QuickBooks Synced Invoice",
              dueDate: qbInvoice.date || qbInvoice.Date,
            },
            description: qbInvoice.detail || qbInvoice.Reference || "QuickBooks Synced Invoice",
            metadata: null,
            splits: [],
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            walletId: "",
          };
          return NextResponse.json({ success: true, data: mappedPayment }, { status: 200 });
        } else {
          console.log(`[Proxy] QuickBooks invoice not found for ID: ${id}`);
        }
      }
    } catch (fallbackError: any) {
      console.error("[Proxy] QuickBooks fallback lookup failed:", fallbackError.message);
    }

    // Fallback 2: Check if it is a Xero invoice
    try {
      console.log(`[Proxy] Local payment not found. Querying Xero invoices as fallback...`);
      const xeroRes = await fetch(`${BACKEND_URL}/xero/invoices`, {
        headers: authHeader ? { Authorization: authHeader } : {},
        cache: "no-store",
      });
      
      console.log(`[Proxy] Xero invoices response status: ${xeroRes.status}`);
      
      if (xeroRes.ok) {
        const xeroData = await xeroRes.json();
        console.log(`[Proxy] Xero invoices count: ${xeroData.invoices?.length}`);
        
        const xeroInvoice = xeroData.invoices?.find((inv: any) => {
          const invId = inv.InvoiceID || inv.InvoiceId || inv.id || "";
          const invDoc = inv.InvoiceNumber || inv.InvoiceNo || inv.docNumber || "";
          return String(invId).toLowerCase() === String(id).toLowerCase() || 
                 String(invDoc).toLowerCase() === String(id).toLowerCase();
        });
        
        if (xeroInvoice) {
          console.log(`[Proxy] Found matching Xero invoice:`, xeroInvoice);
          const invId = xeroInvoice.InvoiceID || xeroInvoice.InvoiceId || xeroInvoice.id;
          const invDoc = xeroInvoice.InvoiceNumber || xeroInvoice.InvoiceNo || xeroInvoice.docNumber;
          const invAmount = xeroInvoice.Total || xeroInvoice.amount || 0;
          const invStatus = xeroInvoice.Status || xeroInvoice.status || "Pending";
          
          const mappedPayment = {
            id: invId,
            invoiceId: invDoc,
            externalId: `XERO-${invId}`,
            source: "XERO",
            amount: invAmount.toString(),
            currency: "USD",
            status: String(invStatus).toUpperCase() === "PAID" ? "SETTLED" : "PENDING",
            settledAmount: String(invStatus).toUpperCase() === "PAID" ? invAmount.toString() : null,
            settledAt: null,
            invoiceData: {
              clientName: xeroInvoice.ContactName || xeroInvoice.name || "Unknown Contact",
              description: xeroInvoice.Reference || xeroInvoice.detail || "Xero Synced Invoice",
              dueDate: xeroInvoice.Date || xeroInvoice.date,
            },
            description: xeroInvoice.Reference || xeroInvoice.detail || "Xero Synced Invoice",
            metadata: null,
            splits: [],
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            walletId: "",
          };
          return NextResponse.json({ success: true, data: mappedPayment }, { status: 200 });
        } else {
          console.log(`[Proxy] Xero invoice not found for ID: ${id}`);
        }
      }
    } catch (fallbackError: any) {
      console.error("[Proxy] Xero fallback lookup failed:", fallbackError.message);
    }

    const data = await res.json();
    return NextResponse.json(data, { status: res.status });
  } catch (error: any) {
    console.error("[Proxy] Proxy error [payments/id]:", error.message);
    return NextResponse.json({ message: "Failed to reach server." }, { status: 502 });
  }
}
