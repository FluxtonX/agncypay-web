export interface SageInvoice {
  id: string;
  docNo: string;
  customerName: string;
  memo: string;
  dateCreated: string;
  totalAmt: number;
  paymentStatus: string;
  daysText: string;
}

export interface SagePayout {
  id: string;
  vendorName: string;
  description: string;
  dateCreated: string;
  amount: string;
  fallback: string;
  paymentMethod: string;
  status: string;
}

export interface SageVendor {
  id: string;
  name: string;
  email?: string;
  phone?: string;
}

export interface SageStatus {
  connected: boolean;
  companyId?: string;
  environment: string;
  connectedAt?: string;
}
