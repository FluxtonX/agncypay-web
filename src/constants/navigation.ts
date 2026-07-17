export interface NavItem {
  label: string;
  path: string;
  iconName: string;
  locked?: boolean;
}

export const SIDEBAR_NAV_ITEMS: NavItem[] = [
  {
    label: "Overview",
    path: "/dashboard",
    iconName: "LayoutDashboard",
  },
  {
    label: "Adidas Invoices",
    path: "/dashboard/invoices",
    iconName: "FileText",
  },
  {
    label: "Payments",
    path: "/dashboard/payments",
    iconName: "CreditCard",
  },
  {
    label: "Transactions",
    path: "/dashboard/transactions",
    iconName: "History",
  },
  {
    label: "Verification Status",
    path: "/dashboard/verification",
    iconName: "ShieldCheck",
  },
  {
    label: "Document Vault",
    path: "/dashboard/documents",
    iconName: "FolderLock",
  },
  {
    label: "Settings",
    path: "/dashboard/settings",
    iconName: "Settings",
  },
];
