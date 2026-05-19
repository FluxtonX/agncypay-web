export interface InvoiceItem {
  name: string;
  quantity: number;
  price: number;
}

export interface Invoice {
  id: string;
  brandName: "Adidas";
  invoiceDate: string;
  dueDate: string;
  amount: number;
  currency: "USD";
  status: "pending" | "paid" | "overdue" | "processing";
  items: InvoiceItem[];
}
