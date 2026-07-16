export interface InvoiceItem {
  name: string;
  quantity: number;
  price: number;
}

export interface Invoice {
  id: string;
  brandName: string;
  invoiceDate: string;
  dueDate: string;
  amount: number;
  currency: string;
  status: "pending" | "paid" | "overdue" | "processing";
  items: InvoiceItem[];
}
