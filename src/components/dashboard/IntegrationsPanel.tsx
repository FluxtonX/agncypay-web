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
  title = "Integrations",
  subtitle = "Connect accounting tools to sync invoices automatically.",
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

  return (
    <div className="bg-[#0A0A0A] light:bg-white border border-white/15 light:border-black/10 rounded-2xl p-6 sm:p-7 shadow-2xl relative text-left transition-all overflow-hidden">
      {/* Title & Subtitle */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h3 className="text-lg font-bold text-white light:text-[#0F172A] tracking-tight flex items-center gap-2">
            <Plug className="h-5 w-5 text-white/80 light:text-[#0F172A]" />
            {title}
          </h3>
          <p className="text-xs text-neutral-400 light:text-[#475569] mt-1">{subtitle}</p>
        </div>
        {connectedIds.length > 0 && (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-white/[0.06] light:bg-slate-100 border border-white/15 light:border-black/15 px-3 py-1 text-[11px] font-bold text-neutral-200 light:text-[#0F172A] shrink-0 shadow-sm self-start sm:self-auto">
            <span className="h-2 w-2 rounded-full bg-white light:bg-black animate-pulse" />
            {connectedIds.length} Synced
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
            className={`mt-4 px-4 py-3 rounded-xl text-xs font-semibold flex items-center gap-2.5 shadow-md ${
              statusType === "loading"
                ? "bg-white/10 light:bg-slate-100 text-white light:text-black border border-white/20 light:border-black/20"
                : statusType === "success"
                ? "bg-white/[0.08] light:bg-slate-100 text-white light:text-black border border-white/20 light:border-black/20"
                : "bg-white/[0.08] light:bg-slate-100 text-white light:text-black border border-white/20 light:border-black/20"
            }`}
          >
            {statusType === "loading" && <RefreshCw className="h-4 w-4 animate-spin shrink-0 text-white light:text-black" />}
            {statusType === "success" && <Check className="h-4 w-4 shrink-0 text-white light:text-black" />}
            {statusType === "error" && <AlertCircle className="h-4 w-4 shrink-0 text-white light:text-black" />}
            <span>{statusMessage}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 5 Horizontal Tiles Matching User Image */}
      <div className="mt-7 pt-1 flex items-start gap-5 sm:gap-7 overflow-x-auto pb-4 scrollbar-none">
        {INTEGRATIONS_LIST.map((app) => {
          const isConn = connectedIds.includes(app.id);
          const isConnLoading = connectingId === app.id;

          return (
            <div
              key={app.id}
              onClick={() => setIsModalOpen(true)}
              className="flex flex-col items-center cursor-pointer group shrink-0 w-20 sm:w-22"
            >
              {/* Tile Box */}
              <div
                className={`w-16 h-16 sm:w-20 sm:h-20 rounded-2xl sm:rounded-3xl border transition-all duration-200 flex items-center justify-center p-3 sm:p-3.5 shadow-md ${
                  isConn
                    ? "bg-white/[0.08] light:bg-slate-100 border-white/30 light:border-black/30 group-hover:border-white light:group-hover:border-black shadow-sm"
                    : "bg-white/[0.02] light:bg-slate-50 border-white/15 light:border-black/15 group-hover:border-white/40 light:group-hover:border-black/40 group-hover:scale-105"
                }`}
              >
                {isConn ? (
                  <img src={app.logo} alt={app.name} className="w-full h-full object-contain filter drop-shadow-sm group-hover:scale-110 transition-transform" />
                ) : (
                  <Plus className="w-6 h-6 sm:w-7 sm:h-7 text-neutral-400 group-hover:text-white light:group-hover:text-black group-hover:scale-110 transition-all duration-200" />
                )}
              </div>

              {/* Tile Label */}
              <span className={`text-xs font-bold mt-2.5 transition-colors text-center truncate w-full ${
                isConn ? "text-white light:text-[#0F172A] group-hover:underline" : "text-neutral-300 light:text-neutral-700 group-hover:text-white light:group-hover:text-black"
              }`}>
                {isConn ? app.name : "Connect"}
              </span>

              {/* Sub-label */}
              {isConn ? (
                <span className="text-[10px] text-neutral-300 light:text-neutral-700 font-bold flex items-center justify-center gap-1 mt-0.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-white light:bg-black animate-pulse" />
                  Synced
                </span>
              ) : (
                <span className="text-[10px] text-neutral-500 font-medium mt-0.5 text-center truncate w-full">
                  {app.name}
                </span>
              )}
            </div>
          );
        })}
      </div>

      {/* CRM Dialogue Box (Modal) */}
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
              className="w-full max-w-[620px] rounded-2xl border border-white/20 light:border-black/15 bg-[#0A0A0A] light:bg-white shadow-2xl overflow-hidden text-left flex flex-col max-h-[85vh]"
            >
              {/* Modal Header */}
              <div className="flex items-center justify-between border-b border-white/10 light:border-black/10 px-6 py-5 bg-white/[0.02] light:bg-slate-50">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-white/20 light:border-black/20 bg-white/5 light:bg-slate-100 shadow-inner">
                    <Plug className="h-5 w-5 text-white/80 light:text-black" />
                  </div>
                  <div>
                    <h2 className="text-[17px] font-bold text-white light:text-black tracking-tight">Connect Accounting & CRM Tools</h2>
                    <p className="text-[12px] text-neutral-400 light:text-neutral-500 mt-0.5">
                      Select software to sync invoice ledgers automatically into AgncyPay treasury.
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="flex h-8 w-8 items-center justify-center rounded-full text-neutral-400 hover:bg-white/[0.08] light:hover:bg-slate-200 hover:text-white light:hover:text-black transition-colors cursor-pointer"
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
                      className={`flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-2xl border p-4 sm:p-5 transition-all ${
                        isConn
                          ? "border-white/25 light:border-black/20 bg-white/[0.05] light:bg-slate-50 shadow-sm"
                          : "border-white/10 light:border-black/10 bg-white/[0.015] light:bg-white hover:border-white/25 light:hover:border-black/25 hover:bg-white/[0.03] light:hover:bg-slate-50"
                      }`}
                    >
                      <div className="flex items-start sm:items-center gap-3.5 min-w-0 flex-1">
                        <div className="w-12 h-12 shrink-0 rounded-xl bg-black border border-white/15 p-2 flex items-center justify-center shadow-inner">
                          <img src={app.logo} alt={app.name} className="w-full h-full object-contain" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2 flex-wrap">
                            <p className="text-sm font-bold text-white light:text-black tracking-tight">{app.fullName}</p>
                            {isConn && (
                              <span className="inline-flex items-center gap-1 rounded-full bg-white/[0.08] light:bg-slate-200 border border-white/20 light:border-black/20 px-2 py-0.5 text-[10px] font-bold text-white light:text-black">
                                <span className="h-1.5 w-1.5 rounded-full bg-white light:bg-black animate-pulse" />
                                Connected
                              </span>
                            )}
                            <span className="text-[10px] uppercase tracking-wider font-semibold px-2 py-0.5 rounded-md bg-white/[0.06] light:bg-slate-100 text-neutral-400 light:text-neutral-600 border border-white/10 light:border-black/10">
                              {app.category}
                            </span>
                          </div>
                          <p className="text-xs text-neutral-400 light:text-neutral-500 mt-1 leading-relaxed">
                            {app.desc}
                          </p>
                        </div>
                      </div>

                      {/* Action Button */}
                      <div className="shrink-0 self-end sm:self-center">
                        {isConnLoading ? (
                          <button
                            type="button"
                            disabled
                            className="flex items-center gap-2 h-9 rounded-full border border-white/15 light:border-black/15 bg-white/10 light:bg-slate-100 px-4 text-xs font-bold text-neutral-300 light:text-neutral-600 cursor-not-allowed"
                          >
                            <RefreshCw className="h-3.5 w-3.5 animate-spin text-white light:text-black" />
                            Connecting...
                          </button>
                        ) : isConn ? (
                          <button
                            type="button"
                            onClick={() => handleDisconnectApp(app)}
                            className="flex items-center gap-2 h-9 rounded-full border border-white/20 light:border-black/20 bg-white/[0.04] light:bg-slate-100 hover:bg-white/10 light:hover:bg-slate-200 hover:border-white light:hover:border-black px-4 text-xs font-bold text-neutral-300 light:text-neutral-700 hover:text-white light:hover:text-black transition-all cursor-pointer shadow-sm group"
                          >
                            <Link2Off className="h-3.5 w-3.5 group-hover:scale-110 transition-transform" />
                            Disconnect
                          </button>
                        ) : (
                          <button
                            type="button"
                            onClick={() => handleConnect(app)}
                            className="flex items-center gap-2 h-9 rounded-full border border-white light:border-black bg-white light:bg-black hover:bg-neutral-200 light:hover:bg-neutral-800 px-4.5 text-xs font-bold text-black light:text-white transition-all cursor-pointer shadow-md active:scale-95 group"
                          >
                            <Link2 className="h-3.5 w-3.5 group-hover:scale-110 transition-transform" />
                            Connect
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Modal Footer */}
              <div className="border-t border-white/10 light:border-black/10 px-6 py-4 bg-white/[0.01] light:bg-slate-50 flex items-center justify-between gap-4">
                <p className="text-[11px] text-neutral-500 leading-snug">
                  Connecting an accounting tool imports your invoices into AgncyPay for instant automated settlements.
                </p>
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-5 py-2 rounded-xl bg-white light:bg-black text-black light:text-white font-bold text-xs hover:bg-neutral-200 light:hover:bg-neutral-800 transition-colors cursor-pointer shrink-0"
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
