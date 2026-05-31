export type MainboardInvoiceStatus = "Ready" | "Pending" | "Processing" | "Paid";

export type MainboardInvoice = {
  id: string;
  recipient: string;
  email: string;
  walletId: string;
  mobile: string;
  brand: string;
  amount: number;
  fee: number;
  due: string;
  status: MainboardInvoiceStatus;
  source: string;
  note: string;
  items: { title: string; qty: number; rate: number }[];
};

export const mainboardInvoices: MainboardInvoice[] = [
  {
    id: "U253340",
    recipient: "Nike, Inc.",
    email: "leo.tolstoy@nike.com",
    walletId: "AGNCY9261",
    mobile: "+1 (555) 555-5555",
    brand: "Nike",
    amount: 9800.25,
    fee: 5,
    due: "10th February, 2025",
    status: "Ready",
    source: "Request",
    note: "New payment request from AgncyPay with view-and-pay and guest checkout enabled.",
    items: [{ title: "Spring / Summer Campaign", qty: 1, rate: 9800.25 }],
  },
  {
    id: "U253341",
    recipient: "M Models",
    email: "nate@mmodels.com",
    walletId: "AGNCY9024",
    mobile: "+1 (555) 222-0902",
    brand: "M Models",
    amount: 9800.25,
    fee: 5,
    due: "19th March, 2025",
    status: "Pending",
    source: "Request",
    note: "Invoice awaiting guest pay or logged-in approval.",
    items: [{ title: "Spring / Summer Campaign", qty: 1, rate: 9800.25 }],
  },
  {
    id: "INV-6702",
    recipient: "Lululemon",
    email: "finance@lululemon.com",
    walletId: "AGNCY1087",
    mobile: "+1 (555) 654-1020",
    brand: "Lululemon",
    amount: 3500,
    fee: 0,
    due: "6/7/25",
    status: "Processing",
    source: "Request",
    note: "Batch payment ready for settlement review.",
    items: [{ title: "Campaign retainer", qty: 1, rate: 3500 }],
  },
  {
    id: "INV-4410",
    recipient: "On",
    email: "payables@on.com",
    walletId: "AGNCY7241",
    mobile: "+1 (555) 456-7770",
    brand: "On",
    amount: 2600,
    fee: 0,
    due: "10/7/25",
    status: "Paid",
    source: "Request",
    note: "Previously settled invoice in the log.",
    items: [{ title: "Product launch support", qty: 1, rate: 2600 }],
  },
  {
    id: "INV-5108",
    recipient: "Stussy",
    email: "billing@stussy.com",
    walletId: "AGNCY7310",
    mobile: "+1 (555) 321-8801",
    brand: "Stussy",
    amount: 1800,
    fee: 0,
    due: "5/12/25",
    status: "Paid",
    source: "Request",
    note: "Settled and visible in invoice log.",
    items: [{ title: "Influencer placement", qty: 1, rate: 1800 }],
  },
  {
    id: "INV-7781",
    recipient: "Gap",
    email: "finance@gap.com",
    walletId: "AGNCY8890",
    mobile: "+1 (555) 764-1134",
    brand: "Gap",
    amount: 2000,
    fee: 0,
    due: "5/17/25",
    status: "Paid",
    source: "Request",
    note: "Monthly invoice log entry.",
    items: [{ title: "Retail campaign support", qty: 1, rate: 2000 }],
  },
];

export function formatMainboardMoney(value: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(value);
}

export function findMainboardInvoice(invoiceId: string) {
  return mainboardInvoices.find((invoice) => invoice.id === invoiceId) ?? null;
}
