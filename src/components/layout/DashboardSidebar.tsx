"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Activity,
  BarChart3,
  ChevronDown,
  CreditCard,
  FileText,
  HelpCircle,
  LayoutGrid,
  Settings,
  Users,
  WalletCards,
} from "lucide-react";
import { cn } from "../../lib/utils";

const primaryNav = [
  { label: "Dashboard", path: "/dashboard", activePath: "/dashboard", icon: LayoutGrid },
  { label: "Invoices", path: "/dashboard/invoices", activePath: "/dashboard/invoices", icon: FileText },
  { label: "Payments", path: "/dashboard/payments", activePath: "/dashboard/payments", icon: CreditCard },
  { label: "Agencies", path: "/dashboard/agencies", activePath: "/dashboard/agencies", icon: Users },
  { label: "Wallet", path: "/dashboard/wallet", activePath: "/dashboard/wallet", icon: WalletCards },
  { label: "Activity", path: "/dashboard/activity", activePath: "/dashboard/activity", icon: Activity },
  { label: "Reports", path: "/dashboard/reports", activePath: "/dashboard/reports", icon: BarChart3 },
];

const secondaryNav = [
  { label: "Settings", path: "/dashboard/settings", activePath: "/dashboard/settings", icon: Settings },
  { label: "Help & Support", path: "/dashboard/support", activePath: "/dashboard/support", icon: HelpCircle },
];

export function DashboardSidebar() {
  const pathname = usePathname();

  const renderItem = (item: (typeof primaryNav)[number]) => {
    const Icon = item.icon;
    const isActive = item.activePath
      ? item.activePath === "/dashboard"
        ? pathname === item.activePath
        : pathname === item.activePath || pathname.startsWith(`${item.activePath}/`)
      : false;

    return (
      <Link
        key={item.label}
        href={item.path}
        className={cn(
          "flex h-12 items-center gap-4 rounded-[7px] px-4 text-[17px] font-semibold transition-colors",
          isActive
            ? "bg-white text-black"
            : "text-[#9c9c9c] hover:bg-[#0d0d0d] hover:text-white"
        )}
      >
        <Icon
          className={cn(
            "h-[22px] w-[22px] shrink-0 stroke-[2]",
            isActive ? "text-black" : "text-[#9c9c9c]"
          )}
        />
        {item.label}
      </Link>
    );
  };

  return (
    <aside className="hidden h-screen w-[312px] shrink-0 overflow-y-auto border-r border-[#171717] bg-black lg:flex lg:flex-col">
      <div className="flex h-[78px] shrink-0 items-center border-b border-[#111] px-[26px]">
        <Link href="/dashboard" aria-label="AgncyPay dashboard" className="flex items-center">
          <Image
            src="/agncypayLogo.png"
            alt="AgncyPay"
            width={260}
            height={66}
            priority
            className="h-[58px] w-[230px] object-contain object-left sm:h-[66px] sm:w-[260px]"
          />
        </Link>
      </div>

      <nav className="shrink-0 px-[15px] pt-[30px]">
        <div className="space-y-[1px]">{primaryNav.map(renderItem)}</div>

        <div className="mt-[58px] space-y-[1px]">
          {secondaryNav.map((item) => {
            const Icon = item.icon;
            const isActive =
              pathname === item.activePath || pathname.startsWith(`${item.activePath}/`);

            return (
              <Link
                key={item.label}
                href={item.path}
                className={cn(
                  "flex h-12 items-center gap-4 rounded-[7px] px-4 text-[17px] font-semibold transition-colors",
                  isActive
                    ? "bg-white text-black"
                    : "text-[#9c9c9c] hover:bg-[#0d0d0d] hover:text-white"
                )}
              >
                <Icon
                  className={cn(
                    "h-[22px] w-[22px] shrink-0 stroke-[2]",
                    isActive ? "text-black" : "text-[#9c9c9c]"
                  )}
                />
                {item.label}
              </Link>
            );
          })}
        </div>
      </nav>

      <div className="shrink-0 border-t border-[#171717] px-8 py-[32px]">
        <div className="flex items-center justify-between gap-3">
          <div className="flex min-w-0 items-center gap-[15px]">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-[#4a4a4a] bg-[#2d2d2f] text-[15px] font-medium text-white">
              AC
            </div>
            <div className="min-w-0">
              <p className="truncate text-[17px] font-semibold leading-5 text-white">
                Acme Corp
              </p>
              <p className="mt-1 truncate text-[15px] leading-4 text-[#888]">
                john@acme.com
              </p>
            </div>
          </div>
          <ChevronDown className="h-5 w-5 shrink-0 text-[#8a8a8a]" />
        </div>
      </div>
    </aside>
  );
}
