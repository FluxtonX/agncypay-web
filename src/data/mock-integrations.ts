export type IntegrationStatus = "Connected" | "Not Connected" | "Connecting";

export type SyncLog = {
  id: string;
  date: string;
  itemType: "Payment" | "Invoice";
  itemName: string;
  status: "Success" | "Failed" | "Pending";
  error?: string;
};

export type ERPProvider = {
  id: string;
  name: string;
  description: string;
  logoUrl: string;
  status: IntegrationStatus;
  primaryColor: string;
};

export const erpProviders: ERPProvider[] = [
  {
    id: "quickbooks",
    name: "QuickBooks Online",
    description: "Sync invoices, payments, and vendors automatically to your QBO account.",
    logoUrl: "https://www.google.com/s2/favicons?domain=quickbooks.intuit.com&sz=128",
    status: "Not Connected",
    primaryColor: "#2CA01C", // QuickBooks Green
  },
  {
    id: "xero",
    name: "Xero",
    description: "Keep your Xero ledgers up to date in real-time as payments are processed.",
    logoUrl: "https://www.google.com/s2/favicons?domain=xero.com&sz=128",
    status: "Not Connected",
    primaryColor: "#13B5EA", // Xero Blue
  },
  {
    id: "mercury",
    name: "Mercury",
    description: "Sync banking activity, card spend, transfers, and treasury movements from Mercury.",
    logoUrl: "/mercuryLogo.png",
    status: "Not Connected",
    primaryColor: "#5A5F66",
  },
  {
    id: "netsuite",
    name: "Oracle NetSuite",
    description: "Enterprise grade syncing for complex chart of accounts and multi-entity setups.",
    logoUrl: "https://www.google.com/s2/favicons?domain=netsuite.com&sz=128",
    status: "Not Connected",
    primaryColor: "#000000",
  },
  {
    id: "sage",
    name: "Sage Intacct",
    description: "Automate financial reporting and sync payables effortlessly to Sage.",
    logoUrl: "https://www.google.com/s2/favicons?domain=sage.com&sz=128",
    status: "Not Connected",
    primaryColor: "#000000",
  }
];

export const mockChartOfAccounts = [
  { id: "100", name: "Checking Account" },
  { id: "101", name: "Savings Account" },
  { id: "200", name: "Accounts Payable (A/P)" },
  { id: "300", name: "Contractor Expense" },
  { id: "301", name: "Software Subscriptions" },
  { id: "400", name: "Platform Fees" },
];

export const mockSyncLogs: SyncLog[] = [
  {
    id: "log_1",
    date: "2026-06-09T10:30:00Z",
    itemType: "Payment",
    itemName: "Payment to John Doe ($1,500.00)",
    status: "Success",
  },
  {
    id: "log_2",
    date: "2026-06-08T14:20:00Z",
    itemType: "Invoice",
    itemName: "INV-0042",
    status: "Failed",
    error: "Vendor 'Acme Design' not found in ERP. Please create the vendor first or map correctly.",
  },
  {
    id: "log_3",
    date: "2026-06-08T09:15:00Z",
    itemType: "Payment",
    itemName: "Payment to Sarah Smith ($3,200.00)",
    status: "Success",
  },
  {
    id: "log_4",
    date: "2026-06-07T16:45:00Z",
    itemType: "Invoice",
    itemName: "INV-0041",
    status: "Success",
  }
];
