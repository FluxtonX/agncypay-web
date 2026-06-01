"use client";

import React from "react";

interface DashboardShellProps {
  children: React.ReactNode;
}

export function DashboardShell({ children }: DashboardShellProps) {
  return <div className="dashboard-action-surface min-h-screen bg-black text-white">{children}</div>;
}
