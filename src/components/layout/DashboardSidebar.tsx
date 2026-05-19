"use client";

import React from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard,
  FileText,
  CreditCard,
  History,
  ShieldCheck,
  FolderLock,
  Settings,
  LogOut,
  ChevronRight,
} from "lucide-react";
import { useApp } from "../../context/AppContext";
import { cn } from "../../lib/utils";

const NAV_ITEMS = [
  { label: "Overview", path: "/dashboard", icon: LayoutDashboard },
  { label: "Invoices", path: "/dashboard/invoices", icon: FileText },
  { label: "Payments", path: "/dashboard/payments", icon: CreditCard },
  { label: "Transactions", path: "/dashboard/transactions", icon: History },
  { label: "Verification", path: "/dashboard/verification", icon: ShieldCheck },
  { label: "Document Vault", path: "/dashboard/documents", icon: FolderLock },
  { label: "Settings", path: "/dashboard/settings", icon: Settings },
];

export function DashboardSidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { state, resetState } = useApp();

  const handleLogout = () => {
    resetState();
    router.push("/");
  };

  return (
    <aside className="w-60 bg-[#0A0A0A] border-r border-[#1F1F1F] flex flex-col h-full z-20 shrink-0">
      {/* Brand */}
      <div className="h-24 px-6 border-b border-[#1F1F1F] flex items-center justify-center">
        <Link href="/" className="flex items-center justify-center cursor-pointer w-full">
          <img src="/agncypayLogo.png" alt="AgncyPay" className="h-20 w-auto object-contain" />
        </Link>
      </div>

      {/* Active Workspace */}
      <div className="px-3 py-3 border-b border-[#1F1F1F]">
        <div className="flex items-center gap-2.5 px-2 py-2 rounded-lg bg-[#111] border border-[#1F1F1F]">
          <div className="h-7 w-7 rounded bg-[#1A1A1A] border border-[#2A2A2A] flex items-center justify-center font-bold text-[10px] text-white shrink-0">
            三
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-[10px] text-[#6B7280] font-medium uppercase tracking-wider">Workspace</p>
            <p className="text-xs font-bold text-white truncate">Adidas AG</p>
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-3 space-y-0.5 overflow-y-auto">
        {NAV_ITEMS.map((item) => {
          const Icon = item.icon;
          const isActive =
            pathname === item.path ||
            (item.path !== "/dashboard" && pathname.startsWith(item.path));

          return (
            <Link
              key={item.path}
              href={item.path}
              className={cn(
                "group flex items-center justify-between px-2.5 py-2 rounded-lg text-sm transition-all cursor-pointer",
                isActive
                  ? "bg-white text-black font-semibold"
                  : "text-[#6B7280] hover:text-white hover:bg-[#111]"
              )}
            >
              <div className="flex items-center gap-2.5">
                <Icon
                  className={cn(
                    "h-4 w-4 shrink-0",
                    isActive ? "text-black" : "text-[#4B5563] group-hover:text-white"
                  )}
                />
                <span className="text-[13px]">{item.label}</span>
              </div>
              {isActive && <ChevronRight className="h-3 w-3 text-black/50" />}
            </Link>
          );
        })}
      </nav>

      {/* Footer user */}
      <div className="p-3 border-t border-[#1F1F1F]">
        <div className="flex items-center justify-between px-2 py-2">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="h-7 w-7 rounded-full bg-[#1F1F1F] border border-[#2A2A2A] flex items-center justify-center text-white font-bold text-[10px] uppercase shrink-0">
              {state.user?.fullName ? state.user.fullName.substring(0, 2) : "AD"}
            </div>
            <div className="min-w-0">
              <p className="text-xs font-semibold text-white truncate">
                {state.user?.fullName || "Adidas Rep"}
              </p>
              <p className="text-[10px] text-[#4B5563] truncate">
                {state.user?.email || "m@example.com"}
              </p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            title="Log Out"
            className="text-[#4B5563] hover:text-[#EF4444] p-1.5 rounded-lg hover:bg-[#111] transition-colors cursor-pointer shrink-0"
          >
            <LogOut className="h-4 w-4" />
          </button>
        </div>
      </div>
    </aside>
  );
}
