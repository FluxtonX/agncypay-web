"use client";

import React, { useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  BadgeDollarSign,
  BriefcaseBusiness,
  ChartNoAxesColumnIncreasing,
  ChevronDown,
  CreditCard,
  FileText,
  HelpCircle,
  Landmark,
  LayoutGrid,
  LogOut,
  Network,
  Settings,
  ShieldCheck,
  UserRound,
  Users,
  UsersRound,
  WalletCards,
  type LucideIcon,
} from "lucide-react";
import { cn } from "../../lib/utils";
import { useApp } from "../../context/AppContext";
import { Permission, WorkspaceType, normalizeWorkspaceType } from "../../types/workspace";

type DashboardNavItem = {
  label: string;
  path: string;
  activePath: string;
  icon: LucideIcon;
  permission?: Permission;
};

const secondaryNav = [
  { label: "Settings", path: "/dashboard/settings", activePath: "/dashboard/settings", icon: Settings },
  { label: "Help & Support", path: "/dashboard/support", activePath: "/dashboard/support", icon: HelpCircle },
];

const navByWorkspace: Record<WorkspaceType, DashboardNavItem[]> = {
  brand: [
    { label: "Dashboard", path: "/dashboard", activePath: "/dashboard", icon: LayoutGrid },
    { label: "Wallet", path: "/dashboard/wallet", activePath: "/dashboard/wallet", icon: WalletCards },
    { label: "Invoices", path: "/dashboard/invoices", activePath: "/dashboard/invoices", icon: FileText },
    { label: "Payments", path: "/dashboard/payments", activePath: "/dashboard/payments", icon: CreditCard, permission: "initiate_payments" },
    { label: "Agencies", path: "/dashboard/agencies", activePath: "/dashboard/agencies", icon: Users },
  ],
  agency: [
    { label: "Dashboard", path: "/dashboard", activePath: "/dashboard", icon: LayoutGrid },
    { label: "Wallet", path: "/dashboard/wallet", activePath: "/dashboard/wallet", icon: WalletCards },
    { label: "Invoices", path: "/dashboard/invoices", activePath: "/dashboard/invoices", icon: FileText },
    { label: "Talent", path: "/dashboard/talent", activePath: "/dashboard/talent", icon: UsersRound, permission: "manage_talent" },
    { label: "Splits", path: "/dashboard/splits", activePath: "/dashboard/splits", icon: Network, permission: "view_splits" },
    { label: "Payouts", path: "/dashboard/payouts", activePath: "/dashboard/payouts", icon: BadgeDollarSign, permission: "approve_payouts" },
    { label: "Clients", path: "/dashboard/clients", activePath: "/dashboard/clients", icon: BriefcaseBusiness },
  ],
  talent_independent: [
    { label: "Dashboard", path: "/dashboard", activePath: "/dashboard", icon: LayoutGrid },
    { label: "Wallet", path: "/dashboard/wallet", activePath: "/dashboard/wallet", icon: WalletCards },
    { label: "My Invoices", path: "/dashboard/invoices", activePath: "/dashboard/invoices", icon: FileText },
    { label: "Payouts", path: "/dashboard/payouts", activePath: "/dashboard/payouts", icon: BadgeDollarSign },
    { label: "Payment History", path: "/dashboard/payments", activePath: "/dashboard/payments", icon: CreditCard },
    { label: "Profile", path: "/dashboard/profile", activePath: "/dashboard/profile", icon: UserRound },
  ],
  talent_agency: [
    { label: "Dashboard", path: "/dashboard", activePath: "/dashboard", icon: LayoutGrid },
    { label: "Payouts", path: "/dashboard/payouts", activePath: "/dashboard/payouts", icon: BadgeDollarSign },
    { label: "Assigned Invoices", path: "/dashboard/invoices", activePath: "/dashboard/invoices", icon: FileText },
    { label: "Payment History", path: "/dashboard/payments", activePath: "/dashboard/payments", icon: CreditCard },
    { label: "Payout Settings", path: "/dashboard/wallet", activePath: "/dashboard/wallet", icon: WalletCards },
    { label: "Profile", path: "/dashboard/profile", activePath: "/dashboard/profile", icon: UserRound },
  ],
  mother_agency: [
    { label: "Dashboard", path: "/dashboard", activePath: "/dashboard", icon: LayoutGrid },
    { label: "Child Agencies", path: "/dashboard/agencies", activePath: "/dashboard/agencies", icon: Users },
    { label: "Talent Network", path: "/dashboard/talent", activePath: "/dashboard/talent", icon: UsersRound },
    { label: "Vendors", path: "/dashboard/vendors", activePath: "/dashboard/vendors", icon: BriefcaseBusiness },
    { label: "Treasury", path: "/dashboard/treasury", activePath: "/dashboard/treasury", icon: Landmark, permission: "view_treasury" },
    { label: "Payouts", path: "/dashboard/payouts", activePath: "/dashboard/payouts", icon: BadgeDollarSign, permission: "approve_payouts" },
    { label: "Reports", path: "/dashboard/reports", activePath: "/dashboard/reports", icon: ChartNoAxesColumnIncreasing, permission: "view_reports" },
    { label: "Team", path: "/dashboard/team", activePath: "/dashboard/team", icon: UsersRound, permission: "manage_team" },
  ],
};

function getWorkspaceNav(workspaceType: WorkspaceType, permissions: Permission[]) {
  return (navByWorkspace[workspaceType] ?? navByWorkspace.brand).filter(
    (item) => !item.permission || permissions.includes(item.permission)
  );
}

function getInitials(name: string) {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part.charAt(0).toUpperCase())
    .join("") || "AC";
}

function isNavActive(pathname: string, item: DashboardNavItem) {
  return item.activePath === "/dashboard"
    ? pathname === item.activePath
    : pathname === item.activePath || pathname.startsWith(`${item.activePath}/`);
}

export function DashboardSidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { state, resetState, switchWorkspace } = useApp();
  const [isAccountOpen, setIsAccountOpen] = useState(false);
  const accountMenuRef = useRef<HTMLDivElement>(null);
  const workspaceType = state.user ? normalizeWorkspaceType(state.user.accountType) : "brand";
  const activeWorkspace = state.workspaces.find((workspace) => workspace.id === state.activeWorkspaceId);
  const activeMembership = state.memberships.find(
    (membership) => membership.workspaceId === state.activeWorkspaceId
  );
  const primaryNav = getWorkspaceNav(workspaceType, activeMembership?.permissions ?? []);
  const workspaceName = activeWorkspace?.name || "Acme Corp";
  const userEmail = state.user?.email || "john@acme.com";
  const initials = getInitials(workspaceName);

  useEffect(() => {
    const closeAccountMenu = (event: MouseEvent) => {
      if (!accountMenuRef.current?.contains(event.target as Node)) {
        setIsAccountOpen(false);
      }
    };

    document.addEventListener("mousedown", closeAccountMenu);

    return () => document.removeEventListener("mousedown", closeAccountMenu);
  }, []);

  const handleLogout = () => {
    resetState();
    localStorage.removeItem("agncypay_state");
    setIsAccountOpen(false);
    router.push("/auth/login");
  };

  const handleWorkspaceSwitch = (workspaceId: string) => {
    switchWorkspace(workspaceId);
    setIsAccountOpen(false);
    router.push("/dashboard");
  };

  const renderItem = (item: DashboardNavItem) => {
    const Icon = item.icon;
    const isActive = isNavActive(pathname, item);

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
          <img
            src="/agncypaybrand.png"
            alt="AgncyPay"
            className="h-[36px] w-auto object-contain object-left sm:h-[42px]"
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

      <div ref={accountMenuRef} className="relative shrink-0 border-t border-[#171717] px-8 py-[32px]">
        {isAccountOpen && (
          <div className="absolute bottom-[106px] left-5 right-5 z-40 rounded-[8px] border border-[#4f4f4f] bg-[#070707] p-2 shadow-2xl">
            <div className="border-b border-[#222] px-3 py-3">
              <p className="truncate text-[15px] font-semibold leading-5 text-white">
                {workspaceName}
              </p>
              <p className="mt-1 truncate text-[13px] leading-4 text-[#888]">
                {userEmail}
              </p>
            </div>

            {state.workspaces.length > 0 && (
              <div className="border-b border-[#222] px-2 py-2">
                <p className="px-1 pb-2 text-[11px] font-semibold uppercase tracking-[0.08em] text-[#686868]">
                  Workspaces
                </p>
                <div className="max-h-[174px] space-y-1 overflow-y-auto pr-1">
                  {state.workspaces.map((workspace) => {
                    const isActive = workspace.id === state.activeWorkspaceId;

                    return (
                      <button
                        key={workspace.id}
                        type="button"
                        onClick={() => handleWorkspaceSwitch(workspace.id)}
                        className={cn(
                          "flex w-full flex-col rounded-[6px] border px-3 py-2 text-left transition-colors",
                          isActive
                            ? "border-white bg-white text-black"
                            : "border-transparent text-[#cfcfcf] hover:border-[#333] hover:bg-white/[0.06] hover:text-white"
                        )}
                      >
                        <span className="truncate text-[13px] font-semibold leading-4">
                          {workspace.name}
                        </span>
                        <span
                          className={cn(
                            "mt-1 truncate text-[11px] leading-3",
                            isActive ? "text-[#3b3b3b]" : "text-[#777]"
                          )}
                        >
                          {workspace.agncyId}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            <Link
              href="/dashboard/settings"
              onClick={() => setIsAccountOpen(false)}
              className="mt-2 flex h-10 items-center gap-3 rounded-[6px] px-3 text-[14px] font-semibold text-[#cfcfcf] transition-colors hover:bg-white/[0.06] hover:text-white"
            >
              <UserRound className="h-[17px] w-[17px]" />
              Account Settings
            </Link>
            <Link
              href="/dashboard/verification"
              onClick={() => setIsAccountOpen(false)}
              className="flex h-10 items-center gap-3 rounded-[6px] px-3 text-[14px] font-semibold text-[#cfcfcf] transition-colors hover:bg-white/[0.06] hover:text-white"
            >
              <ShieldCheck className="h-[17px] w-[17px]" />
              Security & Verification
            </Link>
            <button
              type="button"
              onClick={handleLogout}
              className="mt-2 flex h-10 w-full items-center gap-3 rounded-[6px] border-t border-[#181818] px-3 text-left text-[14px] font-semibold text-[#d8d8d8] transition-colors hover:bg-white/[0.06] hover:text-white"
            >
              <LogOut className="h-[17px] w-[17px]" />
              Logout
            </button>
          </div>
        )}

        <button
          type="button"
          onClick={() => setIsAccountOpen((open) => !open)}
          aria-expanded={isAccountOpen}
          aria-label="Open account menu"
          className="flex w-full items-center justify-between gap-3 rounded-[8px] text-left transition-colors hover:bg-[#0d0d0d]"
        >
          <div className="flex min-w-0 items-center gap-[15px] px-0 py-1">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-[#4a4a4a] bg-[#2d2d2f] text-[15px] font-medium text-white">
              {initials}
            </div>
            <div className="min-w-0">
              <p className="truncate text-[17px] font-semibold leading-5 text-white">
                {workspaceName}
              </p>
              <p className="mt-1 truncate text-[15px] leading-4 text-[#888]">
                {userEmail}
              </p>
            </div>
          </div>
          <ChevronDown
            className={cn(
              "h-5 w-5 shrink-0 text-[#8a8a8a] transition-transform",
              isAccountOpen && "rotate-180"
            )}
          />
        </button>
      </div>
    </aside>
  );
}

export function MobileDashboardNav() {
  const pathname = usePathname();
  const router = useRouter();
  const { state, resetState, switchWorkspace } = useApp();
  const [isWorkspaceOpen, setIsWorkspaceOpen] = useState(false);
  const workspaceType = state.user ? normalizeWorkspaceType(state.user.accountType) : "brand";
  const activeWorkspace = state.workspaces.find((workspace) => workspace.id === state.activeWorkspaceId);
  const activeMembership = state.memberships.find(
    (membership) => membership.workspaceId === state.activeWorkspaceId
  );
  const primaryNav = getWorkspaceNav(workspaceType, activeMembership?.permissions ?? []);
  const workspaceName = activeWorkspace?.name || "Acme Corp";
  const userEmail = state.user?.email || "john@acme.com";
  const initials = getInitials(workspaceName);

  const handleMobileWorkspaceSwitch = (workspaceId: string) => {
    switchWorkspace(workspaceId);
    setIsWorkspaceOpen(false);
    router.push("/dashboard");
  };

  const handleMobileLogout = () => {
    resetState();
    localStorage.removeItem("agncypay_state");
    setIsWorkspaceOpen(false);
    router.push("/auth/login");
  };

  return (
    <div className="border-b border-[#111] bg-black lg:hidden">
      <div className="relative px-4 py-3">
        <button
          type="button"
          onClick={() => setIsWorkspaceOpen((open) => !open)}
          className="flex w-full items-center justify-between gap-3 rounded-[8px] border border-[#222] bg-[#050505] px-3 py-2 text-left"
          aria-expanded={isWorkspaceOpen}
        >
          <div className="flex min-w-0 items-center gap-3">
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-[#4a4a4a] bg-[#1d1d1d] text-[13px] font-semibold text-white">
              {initials}
            </span>
            <span className="min-w-0">
              <span className="block truncate text-[14px] font-semibold leading-4 text-white">
                {workspaceName}
              </span>
              <span className="mt-1 block truncate text-[12px] leading-3 text-[#888]">
                {userEmail}
              </span>
            </span>
          </div>
          <ChevronDown
            className={cn(
              "h-5 w-5 shrink-0 text-[#8a8a8a] transition-transform",
              isWorkspaceOpen && "rotate-180"
            )}
          />
        </button>

        {isWorkspaceOpen && (
          <div className="absolute left-4 right-4 top-[66px] z-40 rounded-[8px] border border-[#3f3f3f] bg-[#070707] p-2 shadow-2xl">
            {state.workspaces.length > 0 && (
              <div className="max-h-[210px] space-y-1 overflow-y-auto pr-1">
                {state.workspaces.map((workspace) => {
                  const isActive = workspace.id === state.activeWorkspaceId;

                  return (
                    <button
                      key={workspace.id}
                      type="button"
                      onClick={() => handleMobileWorkspaceSwitch(workspace.id)}
                      className={cn(
                        "flex w-full flex-col rounded-[6px] border px-3 py-2 text-left transition-colors",
                        isActive
                          ? "border-white bg-white text-black"
                          : "border-transparent text-[#cfcfcf] hover:border-[#333] hover:bg-white/[0.06] hover:text-white"
                      )}
                    >
                      <span className="truncate text-[13px] font-semibold leading-4">
                        {workspace.name}
                      </span>
                      <span
                        className={cn(
                          "mt-1 truncate text-[11px] leading-3",
                          isActive ? "text-[#3b3b3b]" : "text-[#777]"
                        )}
                      >
                        {workspace.agncyId}
                      </span>
                    </button>
                  );
                })}
              </div>
            )}

            <div className="mt-2 grid grid-cols-2 gap-2 border-t border-[#222] pt-2">
              <Link
                href="/dashboard/settings"
                onClick={() => setIsWorkspaceOpen(false)}
                className="flex h-9 items-center justify-center rounded-[6px] border border-[#333] text-[13px] font-semibold text-white"
              >
                Settings
              </Link>
              <button
                type="button"
                onClick={handleMobileLogout}
                className="flex h-9 items-center justify-center rounded-[6px] border border-[#333] text-[13px] font-semibold text-white"
              >
                Logout
              </button>
            </div>
          </div>
        )}
      </div>

      <nav className="px-4 pb-3">
        <div className="flex gap-2 overflow-x-auto">
          {primaryNav.map((item) => {
            const Icon = item.icon;
            const isActive = isNavActive(pathname, item);

            return (
              <Link
                key={item.label}
                href={item.path}
                className={cn(
                  "flex h-10 shrink-0 items-center gap-2 rounded-[7px] border px-3 text-[14px] font-semibold transition-colors",
                  isActive
                    ? "border-white bg-white text-black"
                    : "border-[#262626] bg-[#050505] text-[#9c9c9c]"
                )}
              >
                <Icon className="h-4 w-4" />
                {item.label}
              </Link>
            );
          })}
        </div>
      </nav>
    </div>
  );
}
