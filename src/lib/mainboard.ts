export type MainboardInvoiceStatus = "Ready" | "Pending" | "Needs approval" | "Processing" | "Paid";

export type MainboardInvoiceItem = {
  title: string;
  qty: number;
  rate: number;
  feeType: "Fee" | "Expense";
  note?: string;
  date?: string;
};

export type MainboardInvoice = {
  id: string;
  invoiceNumber: string;
  recipient: string;
  email: string;
  walletId: string;
  mobile: string;
  brand: string;
  payer: string;
  payerEmail: string;
  payerAddress: string[];
  payeeAddress: string[];
  amount: number;
  fee: number;
  due: string;
  invoiceDate: string;
  settlementEta: string;
  status: MainboardInvoiceStatus;
  source: string;
  note: string;
  jobType: string;
  jobNumber: string;
  poNumber: string;
  talentName: string;
  talentRealName: string;
  items: MainboardInvoiceItem[];
};

export const mainboardInvoices: MainboardInvoice[] = [
  {
    id: "MB-6984",
    invoiceNumber: "6984",
    recipient: "M Models",
    email: "AgncyID4235",
    walletId: "AGNCY-9024",
    mobile: "+1 (555) 222-0902",
    brand: "Mainboard",
    payer: "Mainboard LLC",
    payerEmail: "billing@mainboard.com",
    payerAddress: ["1177 6th Avenue", "5th Floor", "New York, NY 10036", "United States"],
    payeeAddress: ["New York, NY 10036", "USA"],
    amount: 3005,
    fee: 35,
    due: "May 12, 2026",
    invoiceDate: "May 6, 2026",
    settlementEta: "Same day after approval",
    status: "Ready",
    source: "Mainboard Payables",
    note: "Fashion show booking for Anthea Smith. Ready to pay through AgncyPay.",
    jobType: "Fashion Show",
    jobNumber: "JOB-5206",
    poNumber: "PO-1042",
    talentName: "Anthea Smith",
    talentRealName: "Anthea Smith",
    items: [
      { title: "Day Fee", feeType: "Fee", qty: 2, rate: 1000 },
      { title: "Overtime", feeType: "Fee", qty: 3, rate: 150, note: "overtime" },
      { title: "Flights", feeType: "Expense", qty: 1, rate: 500, note: "Delta to Miami" },
      { title: "Taxi", feeType: "Expense", qty: 1, rate: 55, note: "Uber" },
    ],
  },
  {
    id: "MB-7012",
    invoiceNumber: "7012",
    recipient: "North Studio Agency",
    email: "ap@northstudio.agency",
    walletId: "AGNCY-9261",
    mobile: "+1 (555) 555-5555",
    brand: "Mainboard",
    payer: "Mainboard LLC",
    payerEmail: "billing@mainboard.com",
    payerAddress: ["1177 6th Avenue", "5th Floor", "New York, NY 10036", "United States"],
    payeeAddress: ["Los Angeles, CA 90028", "USA"],
    amount: 9800.25,
    fee: 5,
    due: "June 8, 2026",
    invoiceDate: "May 29, 2026",
    settlementEta: "1 business day",
    status: "Paid",
    source: "Mainboard Payables",
    note: "Spring / Summer campaign production retainer.",
    jobType: "Campaign Production",
    jobNumber: "JOB-6119",
    poNumber: "PO-2208",
    talentName: "Campaign Team",
    talentRealName: "North Studio Agency",
    items: [{ title: "Production Retainer", feeType: "Fee", qty: 1, rate: 9800.25 }],
  },
  {
    id: "MB-7044",
    invoiceNumber: "7044",
    recipient: "Adidas",
    email: "accounts@adidas.com",
    walletId: "AGNCY-1087",
    mobile: "+1 (555) 654-1020",
    brand: "Mainboard",
    payer: "Mainboard LLC",
    payerEmail: "billing@mainboard.com",
    payerAddress: ["1177 6th Avenue", "5th Floor", "New York, NY 10036", "United States"],
    payeeAddress: ["Chicago, IL 60607", "USA"],
    amount: 3500,
    fee: 0,
    due: "June 14, 2026",
    invoiceDate: "May 30, 2026",
    settlementEta: "1 business day",
    status: "Needs approval",
    source: "Mainboard Payables",
    note: "Brand retainer awaiting finance approval.",
    jobType: "Retainer",
    jobNumber: "JOB-6150",
    poNumber: "PO-2240",
    talentName: "Editorial Talent",
    talentRealName: "Adidas",
    items: [{ title: "Campaign retainer", feeType: "Fee", qty: 1, rate: 3500 }],
  },
  {
    id: "MB-6890",
    invoiceNumber: "6890",
    recipient: "Spotify",
    email: "payables@spotify.com",
    walletId: "AGNCY-7241",
    mobile: "+1 (555) 456-7770",
    brand: "Mainboard",
    payer: "Mainboard LLC",
    payerEmail: "billing@mainboard.com",
    payerAddress: ["1177 6th Avenue", "5th Floor", "New York, NY 10036", "United States"],
    payeeAddress: ["Austin, TX 78701", "USA"],
    amount: 2600,
    fee: 0,
    due: "May 31, 2026",
    invoiceDate: "May 18, 2026",
    settlementEta: "Submitted",
    status: "Processing",
    source: "Mainboard Payables",
    note: "Production support payment in flight.",
    jobType: "Production Support",
    jobNumber: "JOB-5982",
    poNumber: "PO-2141",
    talentName: "Production Crew",
    talentRealName: "Spotify",
    items: [{ title: "Product launch support", feeType: "Expense", qty: 1, rate: 2600 }],
  },
  {
    id: "MB-6815",
    invoiceNumber: "6815",
    recipient: "Studio V Casting",
    email: "billing@studiovcasting.com",
    walletId: "AGNCY-7310",
    mobile: "+1 (555) 321-8801",
    brand: "Mainboard",
    payer: "Mainboard LLC",
    payerEmail: "billing@mainboard.com",
    payerAddress: ["1177 6th Avenue", "5th Floor", "New York, NY 10036", "United States"],
    payeeAddress: ["Miami, FL 33131", "USA"],
    amount: 1800,
    fee: 0,
    due: "May 24, 2026",
    invoiceDate: "May 10, 2026",
    settlementEta: "Settled",
    status: "Paid",
    source: "Mainboard Payables",
    note: "Casting support invoice settled through AgncyPay.",
    jobType: "Casting",
    jobNumber: "JOB-5901",
    poNumber: "PO-2076",
    talentName: "Casting Services",
    talentRealName: "Studio V Casting",
    items: [{ title: "Influencer placement", feeType: "Fee", qty: 1, rate: 1800 }],
  },
];

export function formatMainboardMoney(value: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
}

export function findMainboardInvoice(invoiceId: string) {
  return mainboardInvoices.find((invoice) => invoice.id === invoiceId || invoice.invoiceNumber === invoiceId) ?? null;
}
