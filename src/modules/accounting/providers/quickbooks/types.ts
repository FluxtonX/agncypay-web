export interface QBInvoice {
  id: string;
  docNumber: string;
  name: string;
  detail: string;
  date: string;
  amount: number;
  status: string;
  daysText: string;
}

export interface QBPayout {
  id: string;
  name: string;
  detail: string;
  date: string;
  amount: string;
  fallback: string;
  method: string;
  status: string;
}

export interface QBVendor {
  id: string;
  name: string;
  email?: string;
  phone?: string;
}

export interface QBStatusResponse {
  connected: boolean;
  realmId?: string;
  environment: string;
  connectedAt?: string;
}
