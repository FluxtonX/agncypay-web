"use client";

import React, { useState, useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { Menu, X, LogOut } from "lucide-react";
import { useApp } from "../../context/AppContext";
import { useAccounting } from "../../modules/accounting/store/AccountingContext";
import { DashboardSidebar } from "../../components/layout/DashboardSidebar";
import { Button } from "../../components/ui/Button";
import Link from "next/link";

interface LayoutProps {
  children: React.ReactNode;
}

export default function AppDashboardLayout({ children }: LayoutProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { state, resetState } = useApp();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { refreshStatuses } = useAccounting();

  // Load connection statuses on focus or mount
  useEffect(() => {
    refreshStatuses();
  }, [refreshStatuses]);

  // Client-side redirect if not talent and on /dashboard
  const workspaceType = state.user?.accountType || "brand";
  const isTalent = ["individual", "talent_independent", "talent_agency", "talent", "creator", "model"].includes(workspaceType.toLowerCase());

  useEffect(() => {
    if (pathname === "/dashboard" && !isTalent) {
      router.replace("/branddashboard");
    }
  }, [pathname, isTalent, router]);

  const handleLogout = () => {
    resetState();
    localStorage.removeItem("agncypay_state");
    router.push("/auth/login");
  };

  const isIntegrationsPage = pathname === "/dashboard/integrations";
  const isTalentPortal = pathname === "/dashboard" && isTalent;
  const hideSidebar = isIntegrationsPage || isTalentPortal;

  return (
    <div className="flex h-screen w-full bg-black text-white overflow-hidden font-sans select-none font-medium">
      {/* Desktop Sidebar */}
      {!hideSidebar && <DashboardSidebar />}

      {/* Main Content Pane */}
      <div className="flex flex-1 flex-col overflow-hidden bg-black select-text">
        {/* Mobile Header */}
        {!hideSidebar && (
          <header className="flex h-16 w-full items-center justify-between border-b border-[#171717] bg-black px-6 lg:hidden shrink-0">
            <div className="flex items-center gap-4">
              <button
                onClick={() => setMobileMenuOpen(true)}
                className="text-neutral-400 hover:text-white cursor-pointer"
                aria-label="Open Menu"
              >
                <Menu className="h-6 w-6" />
              </button>
              <h1 className="text-sm font-bold tracking-tight text-white capitalize">
                {pathname.split("/").pop() || "Overview"}
              </h1>
            </div>
            <div>
              <img
                src="/agncypaybrand.png"
                alt="AgncyPay"
                className="h-8 w-auto object-contain"
              />
            </div>
          </header>
        )}

        {/* Content Body with Padding Gaps */}
        <main className="flex-1 overflow-y-auto p-6 lg:p-8 relative">
          {children}
        </main>
      </div>

      {/* Mobile Drawer */}
      {!isIntegrationsPage && mobileMenuOpen && (
        <div className="fixed inset-0 z-50 flex lg:hidden animate-in fade-in duration-200">
          {/* Backdrop */}
          <div
            onClick={() => setMobileMenuOpen(false)}
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
          />

          {/* Drawer content wrapper */}
          <div className="relative flex w-[300px] max-w-sm flex-col bg-black border-r border-[#171717] p-6 text-white z-10 animate-in slide-in-from-left duration-300">
            <div className="flex items-center justify-between mb-8">
              <img
                src="/agncypaybrand.png"
                alt="AgncyPay"
                className="h-8 w-auto object-contain"
              />
              <button
                onClick={() => setMobileMenuOpen(false)}
                className="text-neutral-400 hover:text-white cursor-pointer"
                aria-label="Close Menu"
              >
                <X className="h-6 w-6" />
              </button>
            </div>

            {/* Render a custom responsive link set for drawer */}
            <div className="flex-1 overflow-y-auto space-y-4">
              <div className="space-y-1">
                {isTalent ? (
                  <>
                    <Link href="/dashboard" onClick={() => setMobileMenuOpen(false)} className="block py-2 text-base text-neutral-300 hover:text-white font-semibold">Dashboard</Link>
                    <Link href="/dashboard/wallet" onClick={() => setMobileMenuOpen(false)} className="block py-2 text-base text-neutral-300 hover:text-white font-semibold">Wallet</Link>
                    <Link href="/dashboard/invoices" onClick={() => setMobileMenuOpen(false)} className="block py-2 text-base text-neutral-300 hover:text-white font-semibold">My Invoices</Link>
                    <Link href="/dashboard/payouts" onClick={() => setMobileMenuOpen(false)} className="block py-2 text-base text-neutral-300 hover:text-white font-semibold">Payouts</Link>
                    <Link href="/dashboard/payments" onClick={() => setMobileMenuOpen(false)} className="block py-2 text-base text-neutral-300 hover:text-white font-semibold">Payment History</Link>
                  </>
                ) : (
                  <>
                    <Link href="/branddashboard" onClick={() => setMobileMenuOpen(false)} className="block py-2 text-base text-neutral-300 hover:text-white font-semibold">Dashboard</Link>
                    <Link href="/dashboard/wallet" onClick={() => setMobileMenuOpen(false)} className="block py-2 text-base text-neutral-300 hover:text-white font-semibold">Wallet</Link>
                    <Link href="/dashboard/invoices" onClick={() => setMobileMenuOpen(false)} className="block py-2 text-base text-neutral-300 hover:text-white font-semibold">Invoices</Link>
                    <Link href="/dashboard/payments" onClick={() => setMobileMenuOpen(false)} className="block py-2 text-base text-neutral-300 hover:text-white font-semibold">Payments</Link>
                    <Link href="/dashboard/agencies" onClick={() => setMobileMenuOpen(false)} className="block py-2 text-base text-neutral-300 hover:text-white font-semibold">Agencies</Link>
                  </>
                )}
                <Link href="/dashboard/integrations" onClick={() => setMobileMenuOpen(false)} className="block py-2 text-base text-neutral-300 hover:text-white font-semibold">Integrations</Link>
                <Link href="/dashboard/settings" onClick={() => setMobileMenuOpen(false)} className="block py-2 text-base text-neutral-300 hover:text-white font-semibold">Settings</Link>
              </div>
            </div>

            <div className="mt-auto border-t border-[#171717] pt-4">
              <Button
                variant="ghost"
                onClick={handleLogout}
                className="w-full justify-start py-2.5 hover:text-white"
              >
                <LogOut className="h-4 w-4 shrink-0 mr-2 text-neutral-400" />
                <span className="text-sm font-bold">Log Out</span>
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
