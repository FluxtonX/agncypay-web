import React from "react";
import { DashboardShell } from "../../components/layout/DashboardShell";

interface LayoutProps {
  children: React.ReactNode;
}

export default function AppDashboardLayout({ children }: LayoutProps) {
  return <DashboardShell>{children}</DashboardShell>;
}
