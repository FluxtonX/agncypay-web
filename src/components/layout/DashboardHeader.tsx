"use client";

import React, { useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { Bell, RefreshCw, ChevronDown } from "lucide-react";
import { useApp } from "../../context/AppContext";
import { cn } from "../../lib/utils";

const STATUS_CONFIG = {
  draft: { label: "KYB Draft", color: "text-[#6B7280]", dot: "bg-[#6B7280]" },
  submitted: { label: "Submitted", color: "text-[#10B981]", dot: "bg-[#10B981]" },
  in_review: { label: "In Review", color: "text-[#F59E0B]", dot: "bg-[#F59E0B]" },
  requires_action: { label: "Action Required", color: "text-[#EF4444]", dot: "bg-[#EF4444]" },
  approved: { label: "Verified", color: "text-[#22C55E]", dot: "bg-[#22C55E]" },
  rejected: { label: "Rejected", color: "text-[#EF4444]", dot: "bg-[#EF4444]" },
  suspended: { label: "Suspended", color: "text-[#EF4444]", dot: "bg-[#EF4444]" },
} as const;

const ROUTE_TITLES: Record<string, string> = {
  "/dashboard": "Overview",
  "/dashboard/invoices": "Invoices",
  "/dashboard/payments": "Payments",
  "/dashboard/transactions": "Transactions",
  "/dashboard/verification": "Verification",
  "/dashboard/documents": "Document Vault",
  "/dashboard/settings": "Settings",
};

export function DashboardHeader() {
  const pathname = usePathname();
  const router = useRouter();
  const { state, setVerificationStatusDirectly, resetState } = useApp();
  const [showSimMenu, setShowSimMenu] = useState(false);

  const title =
    Object.entries(ROUTE_TITLES).find(([path]) =>
      path === "/dashboard" ? pathname === path : pathname.startsWith(path)
    )?.[1] ?? "Dashboard";

  const statusCfg =
    STATUS_CONFIG[state.verificationStatus as keyof typeof STATUS_CONFIG] ??
    STATUS_CONFIG.draft;

  return (
    <header className="h-24 px-5 bg-[#0A0A0A] border-b border-[#1F1F1F] flex items-center justify-between z-10 relative shrink-0">
      {/* Title */}
      <div>
        <h2 className="text-sm font-bold text-white tracking-tight">{title}</h2>
        <p className="text-[10px] text-[#4B5563] font-medium">
          AgncyPay &bull; Adidas Group
        </p>
      </div>

      {/* Right controls */}
      <div className="flex items-center gap-2">
        {/* Status pill */}
        <button
          onClick={() => router.push("/dashboard/verification")}
          className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-[#1F1F1F] bg-[#111] hover:bg-[#1A1A1A] transition-colors cursor-pointer"
        >
          <span className={cn("h-1.5 w-1.5 rounded-full", statusCfg.dot)} />
          <span className={cn("text-[11px] font-semibold", statusCfg.color)}>
            {statusCfg.label}
          </span>
        </button>

        {/* Simulate status dropdown */}
        <div className="relative">
          <button
            onClick={() => setShowSimMenu(!showSimMenu)}
            className="flex items-center gap-1 px-2.5 py-1.5 text-[11px] font-semibold text-[#6B7280] border border-[#1F1F1F] bg-[#111] rounded-lg hover:bg-[#1A1A1A] hover:text-white transition-colors cursor-pointer"
          >
            Demo
            <ChevronDown className="h-3 w-3" />
          </button>

          {showSimMenu && (
            <>
              <div className="fixed inset-0 z-10" onClick={() => setShowSimMenu(false)} />
              <div className="absolute right-0 top-9 w-52 bg-[#111] border border-[#222] rounded-xl p-2 shadow-2xl z-20 space-y-0.5">
                <p className="text-[10px] text-[#4B5563] font-bold px-2 py-1.5 uppercase tracking-wider">
                  Simulate Status
                </p>
                {[
                  { status: "draft", label: "1. Draft State" },
                  { status: "submitted", label: "2. Submitted" },
                  { status: "in_review", label: "3. In Review" },
                  { status: "requires_action", label: "4. Action Required" },
                  { status: "approved", label: "5. ✓ Approve Account" },
                ].map((item) => (
                  <button
                    key={item.status}
                    onClick={() => {
                      setVerificationStatusDirectly(item.status as any);
                      setShowSimMenu(false);
                    }}
                    className={cn(
                      "w-full text-left px-2 py-1.5 text-xs rounded-lg transition-colors cursor-pointer",
                      item.status === "approved"
                        ? "text-[#22C55E] hover:bg-[#22C55E]/10"
                        : "text-[#9CA3AF] hover:bg-[#1A1A1A] hover:text-white"
                    )}
                  >
                    {item.label}
                  </button>
                ))}
                <div className="border-t border-[#1F1F1F] my-1" />
                <button
                  onClick={() => {
                    resetState();
                    setShowSimMenu(false);
                    router.push("/");
                  }}
                  className="w-full text-left px-2 py-1.5 text-xs text-[#EF4444] hover:bg-[#EF4444]/10 rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer"
                >
                  <RefreshCw className="h-3 w-3" /> Reset Demo
                </button>
              </div>
            </>
          )}
        </div>

        {/* Bell */}
        <button
          className="relative p-2 rounded-lg text-[#4B5563] hover:text-white hover:bg-[#111] border border-[#1F1F1F] transition-colors cursor-pointer"
          title="Notifications"
        >
          <Bell className="h-4 w-4" />
          {state.verificationStatus !== "approved" && (
            <span className="absolute top-1.5 right-1.5 h-1.5 w-1.5 rounded-full bg-[#F59E0B]" />
          )}
        </button>
      </div>
    </header>
  );
}
