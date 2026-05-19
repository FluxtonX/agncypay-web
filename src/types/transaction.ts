export interface Transaction {
  id: string;
  invoiceId: string;
  amount: number;
  currency: "USD";
  timestamp: string;
  paymentMethod: string;
  status: "success" | "failed" | "processing";
}
