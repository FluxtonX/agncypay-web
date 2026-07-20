"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useApp } from "../../../../context/AppContext";
import { Card } from "../../../../components/ui/Card";
import { Button } from "../../../../components/ui/Button";
import { Badge } from "../../../../components/ui/Badge";
import {
  AlertTriangle,
  ArrowUpRight,
  ArrowDownLeft,
  BarChart3,
  ChevronRight,
  EllipsisVertical,
  Loader2,
  Play,
  Plug,
  Plus,
  Search,
  Send,
  Settings,
  Unplug,
  Users,
  X,
  Building,
  CheckCircle2,
  Wallet,
  Receipt,
  Briefcase,
  ChevronLeft,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { cn } from "../../../../lib/utils";

// Unified accounting hooks & types
import { useAccounting } from "../../hooks/useAccounting";
import { ProviderType } from "../../types";

const BOFA_BUSINESS_DEBIT_VISA_IMAGE =
  "https://business.bankofamerica.com/content/dam/consumer/business/deposits/checking-accounts/debit-cards/bofa_busdbtcm_v.png";
const CHASE_INK_BUSINESS_UNLIMITED_IMAGE = "/chase-ink-business-unlimited.png";
const MERCURY_IO_CARD_IMAGE = "/mercurycard.png";

type RemoteBrandImageProps = {
  src: string;
  alt: string;
  fallback: string;
  className?: string;
  imageClassName?: string;
};

function RemoteBrandImage({ src, alt, fallback, className, imageClassName }: RemoteBrandImageProps) {
  const [failed, setFailed] = React.useState(false);

  return (
    <div className={cn("relative overflow-hidden w-full h-full", className)}>
      {failed ? (
        <div className="flex h-full w-full items-center justify-center rounded-[inherit] border border-white/10 bg-black px-1 text-center text-[10px] font-bold text-neutral-400">
          <span className="block max-w-full truncate">{fallback}</span>
        </div>
      ) : (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={src}
          alt={alt}
          onError={() => setFailed(true)}
          className={cn("h-full w-full object-contain", imageClassName)}
          referrerPolicy="no-referrer"
          loading="lazy"
        />
      )}
    </div>
  );
}

function Panel({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <section className={cn("rounded-xl border border-[#3a3a3a] bg-[#0D0D0D] shadow-[0_0_0_1px_rgba(255,255,255,0.04),0_4px_24px_-4px_rgba(0,0,0,0.6)]", className)}>
      {children}
    </section>
  );
}

export default function DashboardPage() {
  const { state } = useApp();
  const role = state.user?.accountType || "brand";
  const router = useRouter();

  const {
    currentProvider,
    connectionStatuses,
    invoices,
    loading: loadingAccounting,
    providerErrors,
    sync,
    disconnect,
    disconnecting,
    fetchData,
    setCurrentProvider,
  } = useAccounting();

  const [connectedIntegrations, setConnectedIntegrations] = useState<string[]>([]);
  const [isAddIntegrationModalOpen, setIsAddIntegrationModalOpen] = useState(false);

  useEffect(() => {
    const list: string[] = [];
    if (connectionStatuses.quickbooks?.connected) list.push("QuickBooks");
    if (connectionStatuses.xero?.connected) list.push("Xero");
    if (connectionStatuses.sage?.connected) list.push("Sage");
    setConnectedIntegrations(list);
  }, [connectionStatuses]);

  const handleProviderClick = (provider: ProviderType) => {
    setCurrentProvider(provider);
    router.push(`/providers/${provider}/dashboard`);
  };

  const masterIntegrations = [
    { label: "QuickBooks", src: "/quickbook.png", href: "/providers/quickbooks/dashboard", key: "quickbooks" as ProviderType },
    { label: "Mercury", src: "/mercuryLogo.png", href: "#", bg: "bg-white", key: "mercury" as any },
    { label: "Xero", src: "/xero.png", href: "/providers/xero/dashboard", key: "xero" as ProviderType },
    { label: "Sage", src: "/sage.png", href: "/providers/sage/dashboard", key: "sage" as ProviderType },
    { label: "NetSuite", src: "/netsuite.png", href: "#", key: "netsuite" as any },
  ];

  const gridItems = masterIntegrations.map((item) => {
    const isConnected =
      item.label === "QuickBooks" ? connectionStatuses.quickbooks?.connected :
      item.label === "Xero" ? connectionStatuses.xero?.connected :
      item.label === "Sage" ? connectionStatuses.sage?.connected : false;

    return {
      ...item,
      isConnected,
      isActive: currentProvider === item.key,
    };
  });

  const handleSync = async () => {
    try {
      await sync();
    } catch (e) {
      console.error(e);
    }
  };

  const handleDisconnect = async () => {
    try {
      await disconnect();
    } catch (e) {
      console.error(e);
    }
  };

  const backLink = role === "brand" ? "/branddashboard" : role === "agency" ? "/agencydashboard" : "/dashboard";

  return (
    <div className="space-y-6 max-w-[1400px] mx-auto p-4 sm:p-6 text-white select-text">
      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <Link
              href={backLink}
              className="inline-flex items-center gap-1.5 text-xs font-bold text-neutral-500 hover:text-white transition-colors"
            >
              <ChevronLeft className="h-4 w-4" />
              Back to Dashboard
            </Link>
          </div>
          <h1 className="text-[28px] font-black tracking-tight text-white capitalize">
            {currentProvider} Workspace
          </h1>
          <p className="text-xs text-[#8f8f8f] mt-1 font-semibold">
            Manage synced logs, reconcile ledger balances, and inspect connected payouts.
          </p>
        </div>

        {/* Sync Controls */}
        {connectionStatuses[currentProvider]?.connected && (
          <div className="flex items-center gap-2">
            <Button
              onClick={handleSync}
              variant="outline"
              className="h-9 px-4 text-xs font-bold gap-1.5 border-[#333] hover:bg-white/5 bg-transparent text-white"
            >
              Sync QuickBooks
            </Button>
            <Button
              onClick={handleDisconnect}
              disabled={disconnecting}
              className="h-9 px-4 text-xs font-bold bg-[#e11d48] text-white hover:bg-[#be123c]"
            >
              {disconnecting ? "Disconnecting..." : "Disconnect"}
            </Button>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main section */}
        <div className="lg:col-span-2 space-y-6">
          {/* Synced platform invoices */}
          <Card className="p-5 border-[#3a3a3a] bg-[#0d0d0d] flex flex-col min-h-[280px]">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xs font-bold uppercase tracking-wider text-neutral-400">
                Recent Invoices (Synced)
              </h3>
              <Link href="/dashboard/invoices" className="text-[10px] font-bold text-neutral-500 hover:text-white flex items-center gap-0.5">
                View All <ArrowUpRight className="h-3 w-3" />
              </Link>
            </div>

            {loadingAccounting ? (
              <div className="flex flex-col items-center justify-center flex-1 py-8">
                <Loader2 className="h-6 w-6 text-neutral-500 animate-spin" />
              </div>
            ) : !connectionStatuses[currentProvider]?.connected ? (
              <div className="flex flex-col items-center justify-center flex-1 py-8 border border-dashed border-[#3a3a3a] rounded-lg bg-[#060606] text-center text-xs text-neutral-400">
                No platforms connected. Invoices synchronize here once QuickBooks or Xero are linked.
              </div>
            ) : invoices.length === 0 ? (
              <div className="flex flex-col items-center justify-center flex-1 py-8 text-xs text-neutral-500">
                No invoices synced from {currentProvider}.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="border-b border-[#222] text-neutral-500 font-bold">
                      <th className="pb-2">Invoice #</th>
                      <th className="pb-2">Client / Vendor</th>
                      <th className="pb-2">Provider</th>
                      <th className="pb-2">Due Date</th>
                      <th className="pb-2">Amount</th>
                      <th className="pb-2">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#222]">
                    {invoices.slice(0, 4).map((inv) => (
                      <tr key={inv.id} className="hover:bg-white/[0.01]">
                        <td className="py-2.5 font-mono font-bold text-neutral-300">#{inv.docNumber || "1001"}</td>
                        <td className="py-2.5 font-bold text-white">{inv.name}</td>
                        <td className="py-2.5 capitalize text-neutral-400">{currentProvider}</td>
                        <td className="py-2.5 text-neutral-400">{inv.date}</td>
                        <td className="py-2.5 font-mono font-bold text-white">
                          {new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(inv.amount)}
                        </td>
                        <td className="py-2.5">
                          <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[9px] font-bold ${
                            inv.status === 'Paid' ? 'bg-green-500/10 text-green-500 border border-green-500/25' :
                            'bg-amber-500/10 text-amber-500 border border-amber-500/25'
                          }`}>
                            {inv.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </Card>
        </div>

        {/* Sidebar section */}
        <div className="space-y-6">
          {/* Integrations panel exactly as in agncypay */}
          <Panel className="p-4 sm:p-5">
            <div className="flex items-center justify-between gap-4">
              <div>
                <h2 className="text-[14px] font-semibold text-white">Integrations</h2>
                <p className="mt-1 text-[11px] text-[#8f8f8f]">
                  Connect external systems and services to sync data automatically.
                </p>
              </div>
            </div>
            <div className="mt-4 grid grid-cols-5 gap-3">
              {gridItems.map((item, idx) => {
                if (item.key === "mercury" || item.key === "netsuite") {
                  return (
                    <div key={`na-${idx}`} className="flex min-w-0 flex-col items-center gap-2 text-center opacity-40">
                      <div className={cn(
                        "flex h-[72px] w-[72px] items-center justify-center rounded-[12px] border border-[#3a3a3a] bg-[#060606] p-[3px] shadow-[0_0_0_1px_rgba(255,255,255,0.02)]",
                        item.bg || "bg-transparent"
                      )}>
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={item.src}
                          alt={item.label}
                          className="max-h-full max-w-full object-contain"
                        />
                      </div>
                      <span className="max-w-[78px] text-[12px] leading-4 text-[#555]">{item.label}</span>
                    </div>
                  );
                }

                return (
                  <button
                    key={item.label}
                    onClick={() => handleProviderClick(item.key)}
                    className="flex min-w-0 flex-col items-center gap-2 text-center group cursor-pointer"
                    aria-label={item.label}
                  >
                    <div className={cn(
                      "flex h-[72px] w-[72px] items-center justify-center rounded-[12px] border bg-[#060606] p-[3px] shadow-[0_0_0_1px_rgba(255,255,255,0.02)] transition-colors",
                      item.isActive ? "border-white" : "border-[#3a3a3a] group-hover:border-[#555]"
                    )}>
                      <div className={cn("h-full w-full overflow-hidden rounded-[9px] flex items-center justify-center", item.bg || "bg-transparent")}>
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={item.src}
                          alt={item.label}
                          className="max-h-full max-w-full object-contain"
                        />
                      </div>
                    </div>
                    <span className={cn("max-w-[78px] text-[12px] leading-4 transition-colors", item.isActive ? "text-white font-bold" : "text-[#b8b8b8] group-hover:text-white")}>
                      {item.label}
                    </span>
                  </button>
                );
              })}
            </div>
          </Panel>

          {/* Connected Provider Info */}
          <Panel className="p-4 sm:p-5">
            <h3 className="text-xs font-bold uppercase tracking-wider text-neutral-400 mb-3">
              Platform status
            </h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs text-neutral-400">Current Provider</span>
                <span className="text-xs font-bold capitalize text-white">{currentProvider}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-neutral-400">Status</span>
                <Badge variant={connectionStatuses[currentProvider]?.connected ? "success" : "secondary"} className="text-[10px] capitalize">
                  {connectionStatuses[currentProvider]?.connected ? "Connected" : "Disconnected"}
                </Badge>
              </div>
              {connectionStatuses[currentProvider]?.connected && (
                <>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-neutral-400">Environment</span>
                    <span className="text-xs text-white capitalize font-mono">
                      {connectionStatuses[currentProvider]?.environment || "Sandbox"}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-neutral-400">Total Synced Invoices</span>
                    <span className="text-xs text-white font-bold">{invoices.length}</span>
                  </div>
                </>
              )}
            </div>
          </Panel>
        </div>
      </div>
    </div>
  );
}
