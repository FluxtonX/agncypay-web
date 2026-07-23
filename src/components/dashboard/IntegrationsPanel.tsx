"use client";

import React, { useState, useEffect, useCallback } from "react";
import { Plus, RefreshCw, Check, AlertCircle, Plug, X, Link2, Link2Off } from "lucide-react";

const INTEGRATIONS = [
  { id: "quickbooks", name: "QuickBooks Online", desc: "Import & sync invoices from QuickBooks company.", logo: "/quickbook.png", path: "/api/auth/quickbooks/connect", available: true },
  { id: "xero",       name: "Xero Accounting",   desc: "Sync invoices & disbursements from Xero.", logo: "/xero.png", path: "/api/auth/xero/connect",       available: true },
  { id: "sage",       name: "Sage Intacct",      desc: "Pull ledgers from Sage Business Cloud.", logo: "/sage.png", path: "/api/auth/sage/connect",       available: false },
  { id: "netsuite",   name: "Oracle NetSuite",   desc: "Enterprise ERP ledger synchronization.", logo: "/netsuite.png", path: "/api/auth/netsuite/connect", available: false },
];

export function IntegrationsPanel() {
  const [isIntegrationsOpen, setIsIntegrationsOpen] = useState(false);
  const [connectedIntegration, setConnectedIntegration] = useState<string | null>(null);
  const [qbSyncStatus, setQbSyncStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [qbSyncMessage, setQbSyncMessage] = useState<string>("");

  // Check auth status for QuickBooks and Xero
  const checkStatus = useCallback(async () => {
    try {
      const res = await fetch("/api/auth/status");
      if (res.ok) {
        const data = await res.json();
        if (data.quickbooks) {
          setConnectedIntegration("quickbooks");
        } else if (data.xero) {
          setConnectedIntegration("xero");
        }
      }
    } catch (err) {
      console.error("Error checking auth status:", err);
    }
  }, []);

  useEffect(() => {
    checkStatus();
  }, [checkStatus]);

  const handleDisconnect = async (integrationId: string) => {
    try {
      if (integrationId === "quickbooks") {
        await fetch("/api/auth/quickbooks/disconnect", { method: "POST" });
      } else if (integrationId === "xero") {
        await fetch("/api/auth/xero/disconnect", { method: "POST" });
      }
      setConnectedIntegration(null);
      setIsIntegrationsOpen(false);
      setQbSyncStatus("success");
      setQbSyncMessage("Integration disconnected successfully.");
      setTimeout(() => setQbSyncStatus("idle"), 3000);
    } catch (e) {
      console.error("Disconnect error:", e);
    }
  };

  return (
    <>
      <div className="bg-[#0D0D0D] border border-white/20 rounded-2xl p-6 shadow-xl space-y-6">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h3 className="text-base font-bold text-white tracking-tight">Accounting & ERP Integrations</h3>
            <p className="text-xs text-[#8f8f8f] mt-1">Connect accounting tools to sync invoices and ledgers automatically.</p>
          </div>
          {connectedIntegration && (
            <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-950/80 border border-emerald-800/40 px-3 py-1 text-xs font-bold text-emerald-400 shrink-0">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
              Connected
            </span>
          )}
        </div>

        {/* Sync Status Banner */}
        {qbSyncStatus !== "idle" && (
          <div className={`px-3.5 py-2.5 rounded-xl text-xs font-semibold flex items-center gap-2 ${
            qbSyncStatus === "loading" ? "bg-white/10 text-white" :
            qbSyncStatus === "success" ? "bg-emerald-950/60 text-emerald-400 border border-emerald-800/40" :
            "bg-red-950/40 text-red-400 border border-red-900/50"
          }`}>
            {qbSyncStatus === "loading" && <RefreshCw className="h-3.5 w-3.5 animate-spin" />}
            {qbSyncStatus === "success" && <Check className="h-3.5 w-3.5 text-emerald-400" />}
            {qbSyncStatus === "error" && <AlertCircle className="h-3.5 w-3.5 text-red-400" />}
            <span>{qbSyncMessage}</span>
          </div>
        )}

        {(() => {
          const connectedList: { id: string; name: string; logo: string; label: string }[] = [];
          if (connectedIntegration === "quickbooks") {
            connectedList.push({ id: "quickbooks", name: "QuickBooks", logo: "/quickbook.png", label: "QB ✓" });
          }
          if (connectedIntegration === "xero") {
            connectedList.push({ id: "xero", name: "Xero", logo: "/xero.png", label: "Xero ✓" });
          }
          if (connectedIntegration === "sage") {
            connectedList.push({ id: "sage", name: "Sage", logo: "/sage.png", label: "Sage ✓" });
          }

          const connectCount = Math.max(1, 5 - connectedList.length);

          return (
            <div className="grid grid-cols-5 gap-2 pt-2">
              {/* Connected Tiles */}
              {connectedList.map((item) => (
                <div
                  key={item.id}
                  onClick={() => setIsIntegrationsOpen(true)}
                  className="flex flex-col items-center gap-1.5 group cursor-pointer"
                >
                  <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl border border-emerald-500 bg-emerald-950/40 flex items-center justify-center p-2 transition-all shadow-md relative">
                    <img src={item.logo} alt={item.name} className="w-8 h-8 object-contain" />
                    <span className="absolute -top-1 -right-1 h-3 w-3 rounded-full bg-emerald-400 border-2 border-[#0D0D0D] animate-pulse" />
                  </div>
                  <span className="text-[11px] font-bold text-emerald-400 truncate max-w-full">
                    {item.label}
                  </span>
                </div>
              ))}

              {/* + Connect Tiles (Fills remaining slots up to 5 total) */}
              {Array.from({ length: connectCount }).map((_, index) => (
                <div
                  key={`connect-slot-${index}`}
                  className="flex flex-col items-center gap-1.5 cursor-pointer group"
                  onClick={() => setIsIntegrationsOpen(true)}
                >
                  <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl border border-dashed border-white/30 flex items-center justify-center group-hover:bg-white/5 group-hover:border-emerald-500 transition-all shadow-md">
                    <Plus className="w-5 h-5 text-[#8f8f8f] group-hover:text-emerald-400 transition-colors" />
                  </div>
                  <span className="text-[11px] font-bold text-[#8f8f8f] group-hover:text-white truncate max-w-full">
                    Connect
                  </span>
                </div>
              ))}
            </div>
          );
        })()}
      </div>

      {/* Accounting Modal */}
      {isIntegrationsOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 px-4 py-8 backdrop-blur-sm"
          onClick={(e) => { if (e.target === e.currentTarget) setIsIntegrationsOpen(false); }}
        >
          <div className="w-full max-w-[520px] rounded-[16px] border border-white/20 bg-[#0A0A0A] shadow-2xl overflow-hidden">
            <div className="flex items-center justify-between border-b border-white/10 px-6 py-5">
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-[9px] border border-white/20 bg-white/5">
                  <Plug className="h-4 w-4 text-emerald-400" />
                </div>
                <div>
                  <h2 className="text-[17px] font-bold text-white">Connect Accounting & ERP</h2>
                  <p className="text-[12px] text-[#8f8f8f] mt-0.5">Sync invoices automatically with official API integrations</p>
                </div>
              </div>
              <button type="button" onClick={() => setIsIntegrationsOpen(false)} className="flex h-8 w-8 items-center justify-center rounded-full text-[#8f8f8f] hover:bg-white/[0.06] hover:text-white transition-colors cursor-pointer">
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="p-5 space-y-3">
              {INTEGRATIONS.map((ig) => {
                const isConn = connectedIntegration === ig.id;
                const isSoon = !ig.available;
                return (
                  <div
                    key={ig.id}
                    className={`flex items-center gap-4 rounded-[12px] border p-4 transition-all ${
                      isConn ? "border-emerald-500/40 bg-emerald-950/20" :
                      isSoon ? "border-white/10 bg-[#060606] opacity-50" :
                      "border-white/15 bg-white/5 hover:border-white/30"
                    }`}
                  >
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-[10px] bg-white/10 border border-white/10 p-1.5 shadow-sm">
                      <img src={ig.logo} alt={ig.name} className="w-full h-full object-contain" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="text-[14px] font-bold text-white">{ig.name}</p>
                        {isConn && (
                          <span className="inline-flex items-center gap-1 rounded-full bg-emerald-950/80 border border-emerald-800/40 px-2 py-0.5 text-[10px] font-bold text-emerald-400">
                            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
                            Connected
                          </span>
                        )}
                        {isSoon && <span className="rounded-full bg-white/10 border border-white/15 px-2 py-0.5 text-[10px] font-bold text-neutral-500">Soon</span>}
                      </div>
                      <p className="text-[12px] text-[#8f8f8f] mt-0.5 leading-4">{ig.desc}</p>
                    </div>
                    <div className="shrink-0">
                      {isConn ? (
                        <button
                          type="button"
                          onClick={() => handleDisconnect(ig.id)}
                          className="flex items-center gap-1.5 h-8 rounded-[7px] border border-white/20 bg-black px-3 text-[12px] font-semibold text-[#8f8f8f] hover:border-red-900/50 hover:text-red-400 transition-colors cursor-pointer"
                        >
                          <Link2Off className="h-3.5 w-3.5" />
                          Disconnect
                        </button>
                      ) : isSoon ? (
                        <span className="text-[11px] font-semibold text-neutral-600">Coming Soon</span>
                      ) : (
                        <button
                          type="button"
                          onClick={() => { window.location.href = ig.path; }}
                          className="flex items-center gap-1.5 h-8 rounded-[7px] border border-emerald-500/40 bg-emerald-500 hover:bg-emerald-600 px-3 text-[12px] font-bold text-black transition-colors cursor-pointer shadow-sm"
                        >
                          <Link2 className="h-3.5 w-3.5" />
                          Connect
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="border-t border-white/10 px-6 py-4">
              <p className="text-[11px] text-[#8f8f8f] leading-5">
                Connecting an accounting tool imports your invoices into AgncyPay for payment and reconciliation. Only invoice read access is requested.
              </p>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default IntegrationsPanel;
