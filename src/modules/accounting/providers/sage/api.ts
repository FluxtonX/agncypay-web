import { AccountingProviderAdapter, ConnectionStatus, NormalizedInvoice, NormalizedPayout, NormalizedVendor } from "../../types";
import { mapSageInvoice, mapSagePayout, mapSageStatus, mapSageVendor } from "./mapper";
import { SageInvoice, SagePayout, SageVendor, SageStatus } from "./types";

const MOCK_SAGE_INVOICES: SageInvoice[] = [
  { id: 'sage-inv-1', docNo: 'S-2001', customerName: 'Universal Music France', memo: 'Ad campaign split feed', dateCreated: '06/05/2026', totalAmt: 8400.00, paymentStatus: 'Paid', daysText: 'Succeed' },
  { id: 'sage-inv-2', docNo: 'S-2002', customerName: 'EMI Music Group', memo: 'Licensing synchronization payout', dateCreated: '06/18/2026', totalAmt: 19500.00, paymentStatus: 'Pending', daysText: '10 days remaining' }
];

const MOCK_SAGE_PAYOUTS: SagePayout[] = [
  { id: 'sage-pay-1', vendorName: 'Karlos Talent', description: 'Sage processed split royalty', dateCreated: 'Today, 2:15 PM', amount: '$8,400.00', fallback: 'KT', paymentMethod: 'ACH', status: 'Paid' }
];

const MOCK_SAGE_VENDORS: SageVendor[] = [
  { id: 'sage-ven-1', name: 'Universal Music France', email: 'billing@universalmusic.fr' }
];

function checkSageConnected(): boolean {
  if (typeof window === "undefined") return false;
  try {
    const raw = window.localStorage.getItem("agncypay_mock_connected_integrations");
    if (!raw) return false;
    const connectedIds = JSON.parse(raw) as string[];
    return connectedIds.includes("sage");
  } catch {
    return false;
  }
}

export class SageAdapter implements AccountingProviderAdapter {
  readonly providerType = "sage";

  async getStatus(): Promise<ConnectionStatus> {
    const isConnected = checkSageConnected();
    return mapSageStatus({
      connected: isConnected,
      companyId: isConnected ? "sage-company-987" : undefined,
      environment: "sandbox",
      connectedAt: isConnected ? new Date().toISOString() : undefined,
    });
  }

  async getInvoices(): Promise<NormalizedInvoice[]> {
    const isConnected = checkSageConnected();
    if (!isConnected) return [];
    return MOCK_SAGE_INVOICES.map(mapSageInvoice);
  }

  async getPayouts(): Promise<NormalizedPayout[]> {
    const isConnected = checkSageConnected();
    if (!isConnected) return [];
    return MOCK_SAGE_PAYOUTS.map(mapSagePayout);
  }

  async getVendors(): Promise<NormalizedVendor[]> {
    const isConnected = checkSageConnected();
    if (!isConnected) return [];
    return MOCK_SAGE_VENDORS.map(mapSageVendor);
  }

  async sync(): Promise<boolean> {
    await new Promise((resolve) => setTimeout(resolve, 800));
    return true;
  }

  async disconnect(): Promise<boolean> {
    if (typeof window !== "undefined") {
      try {
        const raw = window.localStorage.getItem("agncypay_mock_connected_integrations");
        if (raw) {
          const connectedIds = JSON.parse(raw) as string[];
          const filtered = connectedIds.filter((id) => id !== "sage");
          window.localStorage.setItem("agncypay_mock_connected_integrations", JSON.stringify(filtered));
        }
      } catch (e) {
        console.error("Failed to disconnect Sage mock", e);
      }
    }
    return true;
  }
}
