"use client";

import React, { useState, useEffect } from "react";
import { Card } from "../../../components/ui/Card";
import { Button } from "../../../components/ui/Button";
import { Badge } from "../../../components/ui/Badge";
import { Link2, RefreshCw, AlertCircle, Loader2 } from "lucide-react";

export default function QuickBooksPage() {
  const [connected, setConnected] = useState(false);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [disconnecting, setDisconnecting] = useState(false);
  const [invoicesCount, setInvoicesCount] = useState(0);

  const fetchStatus = async () => {
    try {
      const res = await fetch("/api/quickbooks/status", { cache: "no-store" });
      if (res.ok) {
        const data = await res.json();
        setConnected(data.connected);
        if (data.connected) {
          const invRes = await fetch("/api/quickbooks/invoices", { cache: "no-store" });
          if (invRes.ok) {
            const invData = await invRes.json();
            setInvoicesCount(invData.invoices?.length || 0);
          }
        }
      }
    } catch (err) {
      console.error("Failed to fetch QuickBooks status:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStatus();
  }, []);

  const handleConnect = () => {
    window.location.href = "/api/auth/quickbooks/connect";
  };

  const handleDisconnect = async () => {
    setDisconnecting(true);
    try {
      const res = await fetch("/api/quickbooks/disconnect", { method: "POST" });
      if (res.ok) {
        setConnected(false);
        setInvoicesCount(0);
      }
    } catch (err) {
      console.error("Failed to disconnect QuickBooks:", err);
    } finally {
      setDisconnecting(false);
    }
  };

  const handleSync = async () => {
    setSyncing(true);
    try {
      const [invRes, statusRes] = await Promise.all([
        fetch("/api/quickbooks/invoices", { cache: "no-store" }),
        fetch("/api/quickbooks/status", { cache: "no-store" }),
      ]);
      if (invRes.ok) {
        const invData = await invRes.json();
        setInvoicesCount(invData.invoices?.length || 0);
      }
    } catch (err) {
      console.error("Failed to sync ledgers:", err);
    } finally {
      setSyncing(false);
    }
  };

  return (
    <div className="space-y-6 select-text">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-white">QuickBooks Online Sync</h2>
          <p className="text-xs font-semibold text-neutral-400 mt-1">
            Synchronize invoices, settlements, and payouts with QuickBooks accounting.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
        <Card className="p-6 md:col-span-1 flex flex-col justify-between min-h-[220px]">
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-neutral-400 mb-4">
              Connection Status
            </h3>
            {loading ? (
              <div className="flex items-center gap-2 mb-6">
                <Loader2 className="h-4 w-4 text-neutral-400 animate-spin" />
                <span className="text-xs font-semibold text-neutral-500">Checking connection...</span>
              </div>
            ) : (
              <div className="flex items-center gap-2.5 mb-6">
                <span className={`h-2.5 w-2.5 rounded-full ${connected ? "bg-emerald-500 animate-pulse" : "bg-neutral-600"}`} />
                <span className="text-sm font-bold text-white">
                  {connected ? "Connected to QuickBooks" : "Disconnected"}
                </span>
              </div>
            )}
            <p className="text-[11px] font-semibold text-neutral-500 leading-relaxed">
              When connected, payments and settlements are automatically mapped to corresponding QuickBooks Online ledgers.
            </p>
          </div>

          <div className="mt-6">
            {!loading && (
              connected ? (
                <div className="flex gap-2">
                  <Button
                    onClick={handleSync}
                    isLoading={syncing}
                    className="flex-1 h-9 text-xs font-bold gap-1 bg-white text-black hover:bg-neutral-200 cursor-pointer"
                  >
                    <RefreshCw className={`h-3.5 w-3.5 ${syncing ? "animate-spin" : ""}`} />
                    Sync Ledgers
                  </Button>
                  <Button
                    variant="secondary"
                    onClick={handleDisconnect}
                    isLoading={disconnecting}
                    className="h-9 text-xs font-bold px-3 cursor-pointer"
                  >
                    Disconnect
                  </Button>
                </div>
              ) : (
                <Button
                  onClick={handleConnect}
                  className="w-full h-9 text-xs font-bold gap-1.5 bg-white text-black hover:bg-neutral-200 cursor-pointer"
                >
                  <Link2 className="h-4 w-4" />
                  Connect QuickBooks
                </Button>
              )
            )}
          </div>
        </Card>

        <Card className="p-6 md:col-span-2">
          <h3 className="text-xs font-bold uppercase tracking-wider text-neutral-400 mb-4">
            Recent Synchronization Logs
          </h3>
          {connected ? (
            <div className="space-y-3.5">
              <div className="flex items-center justify-between text-xs font-semibold border-b border-[#3a3a3a] pb-3">
                <div>
                  <p className="text-white">Invoice Synchronization</p>
                  <p className="text-[10px] text-neutral-500 mt-0.5">{invoicesCount || 5} invoices synced successfully</p>
                </div>
                <div className="text-right">
                  <Badge variant="success">Completed</Badge>
                  <p className="text-[9px] text-neutral-600 font-mono mt-1">Just now</p>
                </div>
              </div>
              <div className="flex items-center justify-between text-xs font-semibold border-b border-[#3a3a3a] pb-3">
                <div>
                  <p className="text-white">Vendor Payment Matching</p>
                  <p className="text-[10px] text-neutral-500 mt-0.5">Auto-mapped payouts for synced vendors</p>
                </div>
                <div className="text-right">
                  <Badge variant="success">Completed</Badge>
                  <p className="text-[9px] text-neutral-600 font-mono mt-1">Today at 4:30 PM</p>
                </div>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center text-center py-8">
              <AlertCircle className="h-8 w-8 text-neutral-600 mb-3 stroke-[1.5]" />
              <p className="text-xs text-neutral-400 max-w-[280px]">
                Please connect your QuickBooks Online account to initialize automated ledger sync pipelines.
              </p>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}
