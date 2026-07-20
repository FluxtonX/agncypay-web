import { AccountingProviderAdapter, ConnectionStatus, NormalizedInvoice, NormalizedPayout, NormalizedVendor } from "../../types";
import { mapXeroInvoice, mapXeroPayout, mapXeroStatus, mapXeroContact } from "./mapper";

export class XeroAdapter implements AccountingProviderAdapter {
  readonly providerType = "xero";

  async getStatus(): Promise<ConnectionStatus> {
    const res = await fetch("/api/xero/status", { cache: "no-store" });
    if (!res.ok) throw new Error("Failed to fetch Xero status");
    const data = await res.json();
    return mapXeroStatus(data);
  }

  async getInvoices(): Promise<NormalizedInvoice[]> {
    const res = await fetch("/api/xero/invoices", { cache: "no-store" });
    if (!res.ok) throw new Error("Failed to fetch Xero invoices");
    const data = await res.json();
    if (!data.connected) return [];
    return (data.invoices || []).map(mapXeroInvoice);
  }

  async getPayouts(): Promise<NormalizedPayout[]> {
    const res = await fetch("/api/xero/payouts", { cache: "no-store" });
    if (!res.ok) throw new Error("Failed to fetch Xero payouts");
    const data = await res.json();
    if (!data.connected) return [];
    return (data.payouts || []).map(mapXeroPayout);
  }

  async getVendors(): Promise<NormalizedVendor[]> {
    const res = await fetch("/api/xero/vendors", { cache: "no-store" });
    if (!res.ok) throw new Error("Failed to fetch Xero vendors");
    const data = await res.json();
    if (!data.connected) return [];
    return (data.vendors || []).map(mapXeroContact);
  }

  async sync(): Promise<boolean> {
    await Promise.all([
      fetch("/api/xero/invoices", { cache: "no-store" }),
      fetch("/api/xero/status", { cache: "no-store" }),
    ]);
    return true;
  }

  async disconnect(): Promise<boolean> {
    const res = await fetch("/api/xero/disconnect", { method: "POST" });
    return res.ok;
  }
}
export default XeroAdapter;
