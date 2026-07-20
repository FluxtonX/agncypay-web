import React from "react";
import { AccountingProvider } from "../../modules/accounting/store/AccountingContext";

interface LayoutProps {
  children: React.ReactNode;
}

export default function BrandDashboardLayout({ children }: LayoutProps) {
  return <AccountingProvider>{children}</AccountingProvider>;
}
