import React from "react";
import { DashboardSidebar } from "./DashboardSidebar";
import { DashboardHeader } from "./DashboardHeader";

interface DashboardShellProps {
  children: React.ReactNode;
}

export function DashboardShell({ children }: DashboardShellProps) {
  return (
    <div className="flex h-screen w-screen overflow-hidden bg-black">
      <DashboardSidebar />

      <div className="relative flex min-w-0 flex-1 flex-col overflow-hidden">
        <DashboardHeader />

        <main className="flex-1 overflow-y-auto bg-black px-5 pb-10 pt-10 md:px-10 md:pt-[44px]">
          {children}
        </main>
      </div>
    </div>
  );
}
