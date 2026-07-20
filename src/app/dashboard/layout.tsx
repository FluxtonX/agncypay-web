import React from "react";
import { DashboardShell } from "../../components/layout/DashboardShell";
import { AccountingProvider } from "../../modules/accounting/store/AccountingContext";

interface LayoutProps {
  children: React.ReactNode;
}

export default function AppDashboardLayout({ children }: LayoutProps) {
  return (
    <AccountingProvider>
      <DashboardShell>{children}</DashboardShell>
    </AccountingProvider>
  );
}
