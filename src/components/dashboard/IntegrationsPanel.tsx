"use client";

import React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAccounting } from "../../modules/accounting/hooks/useAccounting";
import { ProviderType } from "../../modules/accounting/types";
import { cn } from "../../lib/utils";

const masterIntegrations = [
  { label: "QuickBooks", src: "/quickbook.png", href: "/dashboard/integrations" },
  { label: "Mercury", src: "/mercuryLogo.png", href: "#", bg: "bg-white" },
  { label: "Xero", src: "/xero.png", href: "/dashboard/integrations" },
  { label: "Sage", src: "/sage.png", href: "/dashboard/integrations" },
  { label: "NetSuite", src: "/netsuite.png", href: "#" },
];

export function IntegrationsPanel() {
  const router = useRouter();
  const { connectionStatuses, currentProvider } = useAccounting();

  const connectedIntegrations = React.useMemo(() => {
    const list: string[] = [];
    if (connectionStatuses.quickbooks?.connected) list.push("QuickBooks");
    if (connectionStatuses.xero?.connected) list.push("Xero");
    if (connectionStatuses.sage?.connected) list.push("Sage");
    return list;
  }, [connectionStatuses]);

  const connected = masterIntegrations.filter((item) => {
    if (item.label === "QuickBooks") return connectedIntegrations.includes("QuickBooks");
    if (item.label === "Xero") return connectedIntegrations.includes("Xero");
    if (item.label === "Sage") return connectedIntegrations.includes("Sage");
    return connectedIntegrations.includes(item.label);
  });

  const gridItems: any[] = [];

  connected.forEach((item) => {
    gridItems.push({ type: "connected", ...item });
  });

  if (gridItems.length < 5) {
    gridItems.push({ type: "add" });
  }

  while (gridItems.length < 5) {
    gridItems.push({ type: "na" });
  }

  const onAddClick = () => {
    router.push("/dashboard/integrations");
  };

  return (
    <div className="bg-[#0D0D0D] rounded-[13px] border border-[#3a3a3a] p-4 sm:p-5 shadow-[0_0_0_1px_rgba(255,255,255,0.04),0_4px_24px_-4px_rgba(0,0,0,0.6)]">
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
          if (item.type === "na") {
            return (
              <div key={`na-${idx}`} className="flex min-w-0 flex-col items-center gap-2 text-center">
                <div className="flex h-[72px] w-[72px] items-center justify-center rounded-[12px] border border-[#3a3a3a] bg-[#060606] p-[3px] shadow-[0_0_0_1px_rgba(255,255,255,0.02)]">
                  <span className="text-[12px] font-semibold text-[#555]">N/A</span>
                </div>
                <span className="max-w-[78px] text-[12px] leading-4 text-[#555]">N/A</span>
              </div>
            );
          }

          if (item.type === "add") {
            return (
              <button
                key="add-btn"
                type="button"
                onClick={onAddClick}
                className="flex min-w-0 flex-col items-center gap-2 text-center group cursor-pointer"
                aria-label="Add Integration"
              >
                <div className="flex h-[72px] w-[72px] items-center justify-center rounded-[12px] border border-dashed border-[#3a3a3a] bg-black text-[#555] transition-all group-hover:border-[#888] group-hover:text-white">
                  <span className="text-[28px] font-light leading-none">+</span>
                </div>
                <span className="max-w-[78px] text-[12px] leading-4 text-[#555] group-hover:text-white transition-colors">Connect</span>
              </button>
            );
          }

          const isActive = (currentProvider === "quickbooks" && item.label === "QuickBooks") ||
                           (currentProvider === "xero" && item.label === "Xero") ||
                           (currentProvider === "sage" && item.label === "Sage");

          return (
            <Link
              key={item.label}
              href={item.href}
              className="flex min-w-0 flex-col items-center gap-2 text-center group"
              aria-label={item.label}
            >
              <div className={cn(
                "flex h-[72px] w-[72px] items-center justify-center rounded-[12px] border bg-[#060606] p-[3px] shadow-[0_0_0_1px_rgba(255,255,255,0.02)] transition-colors",
                isActive ? "border-white" : "border-[#3a3a3a] group-hover:border-[#555]"
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
              <span className={cn("max-w-[78px] text-[12px] leading-4 transition-colors", isActive ? "text-white font-bold" : "text-[#b8b8b8] group-hover:text-white")}>
                {item.label}
              </span>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
