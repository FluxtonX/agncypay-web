export type ProviderType = "quickbooks" | "xero" | "sage";

export interface NormalizedInvoice {
  id: string;
  docNumber: string;
  name: string;
  detail: string;
  date: string; // formatted date string (e.g. MM/DD/YYYY)
  amount: number;
  status: "Paid" | "Pending";
  daysText: string;
  provider?: ProviderType;
}

export interface NormalizedPayout {
  id: string;
  name: string;
  detail: string;
  date: string;
  amount: string; // pre-formatted currency string (e.g. "$1,234.56")
  fallback: string; // 2-letter initials fallback (e.g. "JD")
  method: string;
  status: "Paid" | "Pending" | "Failed";
  provider?: ProviderType;
}

export interface NormalizedVendor {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  provider?: ProviderType;
}

export interface ConnectionStatus {
  connected: boolean;
  realmId?: string; // QuickBooks
  tenantId?: string; // Xero
  environment: string;
  connectedAt?: string;
}

export interface AccountingProviderAdapter {
  providerType: ProviderType;
  getStatus(): Promise<ConnectionStatus>;
  getInvoices(): Promise<NormalizedInvoice[]>;
  getPayouts(): Promise<NormalizedPayout[]>;
  getVendors(): Promise<NormalizedVendor[]>;
  sync(): Promise<boolean>;
  disconnect(): Promise<boolean>;
}
