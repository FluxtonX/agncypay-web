import React from "react";
import { DashboardSidebar } from "./DashboardSidebar";
import { DashboardHeader } from "./DashboardHeader";

interface DashboardShellProps {
  children: React.ReactNode;
}

export function DashboardShell({ children }: DashboardShellProps) {
  return (
    <div className="flex h-screen w-screen overflow-hidden bg-[#0A0A0A]">
      {/* Sidebar Navigation */}
      <DashboardSidebar />

      {/* Main Panel Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden relative">
        {/* Dynamic header */}
        <DashboardHeader />

        {/* Inner Content scroll body */}
        <main className="flex-1 overflow-y-auto p-6 md:p-8 bg-[#0A0A0A]">
          {children}
        </main>
      </div>
    </div>
  );
}
