export interface Transaction {
  id: string;
  invoiceId: string;
  amount: number;
  currency: string;
  timestamp: string;
  paymentMethod: string;
  status: "success" | "failed" | "processing";
}
