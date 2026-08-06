import { AccountingProviderAdapter, ConnectionStatus, NormalizedInvoice, NormalizedPayout, NormalizedVendor } from "../../types";
import { mapQBInvoice, mapQBPayout, mapQBStatus, mapQBVendor } from "./mapper";

export class QuickBooksAdapter implements AccountingProviderAdapter {
  readonly providerType = "quickbooks";

  async getStatus(): Promise<ConnectionStatus> {
    const res = await fetch("/api/quickbooks/status", { cache: "no-store" });
    if (!res.ok) throw new Error("Failed to fetch QuickBooks status");
    const data = await res.json();
    return mapQBStatus(data);
  }

  async getInvoices(): Promise<NormalizedInvoice[]> {
    const res = await fetch("/api/quickbooks/invoices", { cache: "no-store" });
    if (!res.ok) throw new Error("Failed to fetch QuickBooks invoices");
    const data = await res.json();
    if (!data.connected) return [];
    return (data.invoices || []).map(mapQBInvoice);
  }

  async getPayouts(): Promise<NormalizedPayout[]> {
    const res = await fetch("/api/quickbooks/payouts", { cache: "no-store" });
    if (!res.ok) throw new Error("Failed to fetch QuickBooks payouts");
    const data = await res.json();
    if (!data.connected) return [];
    return (data.payouts || []).map(mapQBPayout);
  }

  async getVendors(): Promise<NormalizedVendor[]> {
    const res = await fetch("/api/quickbooks/vendors", { cache: "no-store" });
    if (!res.ok) throw new Error("Failed to fetch QuickBooks vendors");
    const data = await res.json();
    if (!data.connected) return [];
    return (data.vendors || []).map(mapQBVendor);
  }

  async sync(): Promise<boolean> {
    // Sync triggers refetches of invoices & status
    await Promise.all([
      fetch("/api/quickbooks/invoices", { cache: "no-store" }),
      fetch("/api/quickbooks/status", { cache: "no-store" }),
    ]);
    return true;
  }

  async disconnect(): Promise<boolean> {
    const res = await fetch("/api/quickbooks/disconnect", { method: "POST" });
    return res.ok;
  }
}
