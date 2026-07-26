"use client";

import React, { useState, useEffect, useCallback } from "react";
import { Plus, RefreshCw, Check, AlertCircle, Plug, X, Link2, Link2Off } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export interface IntegrationsPanelProps {
  onSync?: (providerId: string) => void;
  onDisconnect?: (providerId: string) => void;
  title?: string;
  subtitle?: string;
}

interface IntegrationApp {
  id: string;
  name: string;
  fullName: string;
  desc: string;
  logo: string;
  path: string;
  category: string;
}

const INTEGRATIONS_LIST: IntegrationApp[] = [
  {
    id: "quickbooks",
    name: "QuickBooks",
    fullName: "QuickBooks Online & Desktop",
    desc: "Import & sync invoices, bills, and vendor ledgers directly from QuickBooks company.",
    logo: "/quickbook.png",
    path: "/api/auth/quickbooks/connect",
    category: "Accounting & ERP",
  },
  {
    id: "xero",
    name: "Xero",
    fullName: "Xero Accounting & Invoicing",
    desc: "Sync invoices, disbursements, and reconciliation feeds from Xero organisation.",
    logo: "/xero.png",
    path: "/api/auth/xero/connect",
    category: "Accounting & ERP",
  },
  {
    id: "sage",
    name: "Sage Intacct",
    fullName: "Sage Business Cloud & Intacct",
    desc: "Pull enterprise ledgers, vendor bills, and real-time cash flow from Sage.",
    logo: "/sage.png",
    path: "/api/auth/sage/connect",
    category: "Accounting & ERP",
  },
  {
    id: "netsuite",
    name: "NetSuite",
    fullName: "Oracle NetSuite ERP & CRM",
    desc: "Enterprise financial synchronization, vendor bills, and multi-currency ledgers.",
    logo: "/netsuite.png",
    path: "/api/auth/netsuite/connect",
    category: "Enterprise ERP & CRM",
  },
  {
    id: "oracle",
    name: "Oracle Cloud",
    fullName: "Oracle Cloud Financials & CRM",
    desc: "Direct integration with Oracle Cloud ERP treasury and vendor approval queues.",
    logo: "/oracle.png",
    path: "/api/auth/oracle/connect",
    category: "Enterprise ERP & CRM",
  },
];

export function IntegrationsPanel({
  onSync,
  onDisconnect,
  title = "Connected apps",
  subtitle = "Add the accounting tools and CRMs you use to sync invoices automatically.",
}: IntegrationsPanelProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [connectedIds, setConnectedIds] = useState<string[]>(["quickbooks", "xero", "sage"]);
  const [connectingId, setConnectingId] = useState<string | null>(null);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [statusType, setStatusType] = useState<"loading" | "success" | "error" | null>(null);

  // 1. Restore real backend OAuth status checking and URL callback handling
  useEffect(() => {
    if (typeof window !== "undefined") {
      const searchParams = new URLSearchParams(window.location.search);
      const qbConnected = searchParams.get("qb_connected");
      const qbError = searchParams.get("qb_error");
      const xeroConnected = searchParams.get("xero_connected");
      const xeroError = searchParams.get("xero_error");

      if (qbConnected === "true") {
        setConnectedIds((prev) => {
          const updated = Array.from(new Set([...prev, "quickbooks"]));
          localStorage.setItem("agncypay_connected_apps", JSON.stringify(updated));
          return updated;
        });
        setStatusType("success");
        setStatusMessage("QuickBooks connected successfully! Syncing invoice ledger...");
        if (onSync) onSync("quickbooks");
        window.history.replaceState({}, document.title, window.location.pathname);
      } else if (qbError) {
        setStatusType("error");
        setStatusMessage(`QuickBooks connection error: ${qbError.replace(/_/g, " ")}`);
        window.history.replaceState({}, document.title, window.location.pathname);
      } else if (xeroConnected === "true") {
        setConnectedIds((prev) => {
          const updated = Array.from(new Set([...prev, "xero"]));
          localStorage.setItem("agncypay_connected_apps", JSON.stringify(updated));
          return updated;
        });
        setStatusType("success");
        setStatusMessage("Xero connected successfully! Syncing invoice ledger...");
        if (onSync) onSync("xero");
        window.history.replaceState({}, document.title, window.location.pathname);
      } else if (xeroError) {
        setStatusType("error");
        setStatusMessage(`Xero connection error: ${xeroError.replace(/_/g, " ")}`);
        window.history.replaceState({}, document.title, window.location.pathname);
      }
    }

    // Check backend status
    fetch("/api/auth/status")
      .then((res) => res.json())
      .then((data) => {
        setConnectedIds((prev) => {
          const backendList = [...prev];
          let changed = false;
          if (data.quickbooks && !backendList.includes("quickbooks")) {
            backendList.push("quickbooks");
            changed = true;
            if (onSync) onSync("quickbooks");
          }
          if (data.xero && !backendList.includes("xero")) {
            backendList.push("xero");
            changed = true;
            if (onSync) onSync("xero");
          }
          if (changed) {
            localStorage.setItem("agncypay_connected_apps", JSON.stringify(backendList));
          }
          return backendList;
        });
      })
      .catch(() => {
        // Fallback to local storage if API check is unavailable
      });

    // Load saved preferences from localStorage
    const saved = localStorage.getItem("agncypay_connected_apps");
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setConnectedIds((prev) => Array.from(new Set([...prev, ...parsed])));
        }
      } catch (e) {
        console.error("Error parsing saved connected apps", e);
      }
    }
  }, [onSync]);

  const saveConnectedApps = (ids: string[]) => {
    setConnectedIds(ids);
    localStorage.setItem("agncypay_connected_apps", JSON.stringify(ids));
  };

  // 2. Real browser redirect for OAuth connection & API invoice fetching
  const handleConnect = useCallback(
    (app: IntegrationApp) => {
      // Execute real browser navigation to backend OAuth endpoints (QuickBooks sandbox, Xero, etc.)
      if (app.id === "quickbooks" || app.id === "xero" || app.path.startsWith("/api/auth/")) {
        setConnectingId(app.id);
        setStatusType("loading");
        setStatusMessage(`Redirecting to ${app.fullName} authentication portal...`);
        window.location.href = app.path;
        return;
      }

      // Fallback for tools without live OAuth keys in current dev environment
      setConnectingId(app.id);
      setTimeout(() => {
        const updated = Array.from(new Set([...connectedIds, app.id]));
        saveConnectedApps(updated);
        setConnectingId(null);
        setStatusType("success");
        setStatusMessage(`Connected ${app.name} ledger.`);
        if (onSync) onSync(app.id);
      }, 600);
    },
    [connectedIds, onSync]
  );

  // 3. Real backend disconnect call
  const handleDisconnectApp = useCallback(
    async (app: IntegrationApp) => {
      if (app.id === "quickbooks") {
        try {
          await fetch("/api/auth/quickbooks/disconnect", { method: "POST" });
        } catch (e) {
          console.error("QB disconnect error", e);
        }
      } else if (app.id === "xero") {
        try {
          await fetch("/api/auth/xero/disconnect", { method: "POST" });
        } catch (e) {
          console.error("Xero disconnect error", e);
        }
      }

      const updated = connectedIds.filter((id) => id !== app.id);
      saveConnectedApps(updated);
      setStatusType("success");
      setStatusMessage(`${app.name} integration disconnected.`);
      if (onDisconnect) onDisconnect(app.id);

      setTimeout(() => {
        setStatusType(null);
        setStatusMessage(null);
      }, 3000);
    },
    [connectedIds, onDisconnect]
  );

  const connectedApps = INTEGRATIONS_LIST.filter((app) => connectedIds.includes(app.id));

  return (
    <div className="bg-[#0A0A0A] border border-white/15 rounded-2xl p-6 shadow-2xl relative text-left transition-all overflow-hidden">
      {/* Title & Subtitle */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h3 className="text-lg font-bold text-white tracking-tight flex items-center gap-2">
            <Plug className="h-5 w-5 text-white/80" />
            {title}
          </h3>
          <p className="text-xs text-neutral-400 mt-1">{subtitle}</p>
        </div>
        {connectedApps.length > 0 && (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-white/[0.06] border border-white/15 px-3 py-1 text-[11px] font-bold text-neutral-200 shrink-0 shadow-sm">
            <span className="h-2 w-2 rounded-full bg-neutral-300 animate-pulse" />
            {connectedApps.length} Synced
          </span>
        )}
      </div>

      {/* Status Alert Banner */}
      <AnimatePresence>
        {statusMessage && statusType && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            className={`mt-4 px-4 py-2.5 rounded-xl text-xs font-semibold flex items-center gap-2.5 shadow-md ${
              statusType === "loading"
                ? "bg-white/10 text-white border border-white/20"
                : statusType === "success"
                ? "bg-white/[0.08] text-white border border-white/25"
                : "bg-red-950/80 text-red-300 border border-red-500/40"
            }`}
          >
            {statusType === "loading" && <RefreshCw className="h-4 w-4 animate-spin shrink-0 text-white" />}
            {statusType === "success" && <Check className="h-4 w-4 shrink-0 text-neutral-300" />}
            {statusType === "error" && <AlertCircle className="h-4 w-4 shrink-0 text-red-400" />}
            <span>{statusMessage}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Connected App Cards (LinkedIn Horizontal Flow with Edge Blur) */}
      <div className="relative mt-5">
        {/* Right Edge Gradient Fade for Horizontal Blur Effect */}
        <div className="pointer-events-none absolute right-0 top-0 bottom-0 w-24 bg-gradient-to-l from-[#0A0A0A] via-[#0A0A0A]/80 to-transparent backdrop-blur-[1px] z-10" />

        <div className="flex items-center gap-3.5 overflow-x-auto pb-2 scrollbar-none pr-16">
          {connectedApps.length > 0 ? (
            connectedApps.map((app) => (
              <div
                key={app.id}
                onClick={() => setIsModalOpen(true)}
                className="flex items-center gap-3.5 bg-white/[0.03] hover:bg-white/[0.07] border border-white/15 hover:border-white/30 rounded-2xl px-4 py-3 sm:px-5 sm:py-3.5 transition-all shadow-md cursor-pointer shrink-0 group"
              >
                <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl bg-black border border-white/10 p-2 flex items-center justify-center shrink-0 shadow-inner group-hover:scale-105 transition-transform">
                  <img src={app.logo} alt={app.name} className="w-full h-full object-contain" />
                </div>
                <div className="flex flex-col text-left">
                  <span className="text-sm font-bold text-white group-hover:text-neutral-200 transition-colors flex items-center gap-2">
                    {app.name}
                    <span className="inline-flex items-center justify-center rounded-full bg-white/10 border border-white/20 px-2 py-0.5 text-[9px] font-bold text-neutral-300">
                      Synced
                    </span>
                  </span>
                  <span className="text-[11px] text-neutral-400 mt-0.5 truncate max-w-[170px]">
                    {app.category}
                  </span>
                </div>
              </div>
            ))
          ) : (
            <div className="w-full py-6 px-4 rounded-xl border border-dashed border-white/15 bg-white/[0.01] text-center">
              <p className="text-xs text-neutral-400 italic">No tools connected yet.</p>
              <p className="text-[11px] text-neutral-500 mt-0.5">Click below to connect QuickBooks, Xero, Sage, NetSuite, or Oracle.</p>
            </div>
          )}
        </div>
      </div>

      {/* Add Connected Apps Pill Button (LinkedIn Style - Clean Monochrome) */}
      <div className="mt-5 pt-1">
        <button
          type="button"
          onClick={() => setIsModalOpen(true)}
          className="px-5 py-2.5 rounded-full border border-white/20 bg-white/[0.04] text-white hover:bg-white/[0.09] hover:border-white/35 font-bold text-xs flex items-center gap-2 transition-all cursor-pointer shadow-sm group"
        >
          <Plus className="h-4 w-4 group-hover:rotate-90 transition-transform duration-200" />
          Add connected apps
        </button>
      </div>

      {/* LinkedIn-Style Interactive Modal (Elevated Monochrome & Functional) */}
      <AnimatePresence>
        {isModalOpen && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 px-4 py-8 backdrop-blur-md"
            onClick={(e) => {
              if (e.target === e.currentTarget) setIsModalOpen(false);
            }}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.15 }}
              className="w-full max-w-[580px] rounded-2xl border border-white/20 bg-[#0A0A0A] shadow-2xl overflow-hidden text-left flex flex-col max-h-[85vh]"
            >
              {/* Modal Header */}
              <div className="flex items-center justify-between border-b border-white/10 px-6 py-5 bg-white/[0.02]">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-white/20 bg-white/5 shadow-inner">
                    <Plug className="h-5 w-5 text-white/80" />
                  </div>
                  <div>
                    <h2 className="text-[17px] font-bold text-white tracking-tight">Add connected apps</h2>
                    <p className="text-[12px] text-neutral-400 mt-0.5">
                      Select accounting and CRM software to sync invoice ledgers automatically.
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="flex h-8 w-8 items-center justify-center rounded-full text-neutral-400 hover:bg-white/[0.08] hover:text-white transition-colors cursor-pointer"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              {/* Modal App List */}
              <div className="p-6 space-y-3.5 overflow-y-auto flex-1">
                {INTEGRATIONS_LIST.map((app) => {
                  const isConn = connectedIds.includes(app.id);
                  const isConnLoading = connectingId === app.id;

                  return (
                    <div
                      key={app.id}
                      className={`flex items-center justify-between gap-4 rounded-2xl border p-4 transition-all ${
                        isConn
                          ? "border-white/25 bg-white/[0.05] shadow-sm"
                          : "border-white/10 bg-white/[0.01] hover:border-white/20 hover:bg-white/[0.03]"
                      }`}
                    >
                      <div className="flex items-center gap-3.5 min-w-0 flex-1">
                        <div className="w-12 h-12 shrink-0 rounded-xl bg-black border border-white/15 p-2 flex items-center justify-center shadow-inner">
                          <img src={app.logo} alt={app.name} className="w-full h-full object-contain" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2">
                            <p className="text-sm font-bold text-white truncate">{app.fullName}</p>
                            {isConn && (
                              <span className="inline-flex items-center gap-1 rounded-full bg-white/10 border border-white/20 px-2 py-0.5 text-[10px] font-bold text-neutral-300">
                                <span className="h-1.5 w-1.5 rounded-full bg-neutral-300 animate-pulse" />
                                Connected
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-neutral-400 mt-0.5 leading-relaxed line-clamp-2">
                            {app.desc}
                          </p>
                        </div>
                      </div>

                      {/* Action Button */}
                      <div className="shrink-0">
                        {isConnLoading ? (
                          <button
                            type="button"
                            disabled
                            className="flex items-center gap-1.5 h-8 rounded-full border border-white/15 bg-white/10 px-4 text-xs font-bold text-neutral-300 cursor-not-allowed"
                          >
                            <RefreshCw className="h-3.5 w-3.5 animate-spin text-white" />
                            Connecting...
                          </button>
                        ) : isConn ? (
                          <button
                            type="button"
                            onClick={() => handleDisconnectApp(app)}
                            className="flex items-center gap-1.5 h-8 rounded-full border border-white/20 bg-transparent px-3.5 text-xs font-semibold text-neutral-400 hover:border-white/40 hover:text-white transition-colors cursor-pointer shadow-sm"
                          >
                            <Link2Off className="h-3.5 w-3.5" />
                            Disconnect
                          </button>
                        ) : (
                          <button
                            type="button"
                            onClick={() => handleConnect(app)}
                            className="flex items-center gap-1.5 h-8 rounded-full border border-white bg-white hover:bg-neutral-200 px-4 text-xs font-bold text-black transition-all cursor-pointer shadow-md"
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

              {/* Modal Footer */}
              <div className="border-t border-white/10 px-6 py-4 bg-white/[0.01] flex items-center justify-between gap-4">
                <p className="text-[11px] text-neutral-500 leading-snug">
                  Connecting an accounting tool or CRM imports your invoices into AgncyPay for instant automated settlements.
                </p>
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-5 py-2 rounded-xl bg-white text-black font-bold text-xs hover:bg-neutral-200 transition-colors cursor-pointer shrink-0"
                >
                  Done
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default IntegrationsPanel;
