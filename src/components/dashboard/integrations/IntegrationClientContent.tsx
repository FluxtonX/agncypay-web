"use client";

import React, { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import {
  AlertTriangle,
  ArrowRight,
  CheckCircle2,
  Loader2,
  Plug,
  RefreshCw,
  Unplug,
} from "lucide-react";
import { DataMappingForm } from "./DataMappingForm";
import { RealSyncLogs } from "./RealSyncLogs";
import { ERPProvider, mockChartOfAccounts } from "@/data/mock-integrations";

type IntegrationConnectionStatus = {
  connected: boolean;
  realmId?: string | null;
  environment?: string;
  connectedAt?: string | null;
  accessExpiresAt?: string | null;
  refreshExpiresAt?: string | null;
  hasRefreshToken?: boolean;
};

type ChartAccount = {
  id: string;
  name: string;
};

const mockConnectionStorageKey = "agncypay_mock_connected_integrations";

function readMockConnectedProviderIds() {
  if (typeof window === "undefined") return new Set<string>();

  try {
    return new Set(JSON.parse(window.localStorage.getItem(mockConnectionStorageKey) || "[]") as string[]);
  } catch {
    return new Set<string>();
  }
}

function writeMockConnectedProviderId(providerId: string, connected: boolean) {
  const connectedIds = readMockConnectedProviderIds();

  if (connected) {
    connectedIds.add(providerId);
  } else {
    connectedIds.delete(providerId);
  }

  window.localStorage.setItem(mockConnectionStorageKey, JSON.stringify([...connectedIds]));
}

function formatDate(value?: string | null) {
  if (!value) return "Not available";

  return new Intl.DateTimeFormat("en-US", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

export function IntegrationClientContent({ provider }: { provider: ERPProvider }) {
  const isQuickBooks = provider.id === "quickbooks";
  const [status, setStatus] = useState<IntegrationConnectionStatus>({
    connected: provider.status === "Connected",
    environment: "sandbox",
  });
  const [accounts, setAccounts] = useState<ChartAccount[]>(mockChartOfAccounts);
  const [companyName, setCompanyName] = useState("");
  const [refreshKey, setRefreshKey] = useState(0);
  const [loadingStatus, setLoadingStatus] = useState(isQuickBooks);
  const [syncing, setSyncing] = useState(false);
  const [disconnecting, setDisconnecting] = useState(false);
  const [message, setMessage] = useState("");

  const refreshIntegration = useCallback(async () => {
    if (!isQuickBooks) {
      const isConnected = readMockConnectedProviderIds().has(provider.id) || provider.status === "Connected";

      setStatus({
        connected: isConnected,
        environment: "demo",
        connectedAt: isConnected ? new Date().toISOString() : null,
        accessExpiresAt: isConnected ? new Date(Date.now() + 60 * 60 * 1000).toISOString() : null,
        refreshExpiresAt: isConnected ? new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString() : null,
        hasRefreshToken: isConnected,
      });
      setCompanyName(isConnected ? `${provider.name} demo workspace` : "");
      setLoadingStatus(false);
      return;
    }

    setLoadingStatus(true);
    try {
      const statusResponse = await fetch("/api/quickbooks/status", { cache: "no-store" });
      const nextStatus = statusResponse.ok
        ? await statusResponse.json()
        : { connected: false, environment: "sandbox" };
      setStatus(nextStatus);

      if (!nextStatus.connected) {
        setAccounts(mockChartOfAccounts);
        setCompanyName("");
        return;
      }

      const [companyResponse, accountsResponse] = await Promise.all([
        fetch("/api/quickbooks/company", { cache: "no-store" }),
        fetch("/api/quickbooks/accounts", { cache: "no-store" }),
      ]);

      if (companyResponse.ok) {
        const companyData = await companyResponse.json();
        setCompanyName(companyData?.CompanyInfo?.CompanyName || companyData?.CompanyName || "");
      }

      if (accountsResponse.ok) {
        const accountData = await accountsResponse.json();
        if (Array.isArray(accountData) && accountData.length > 0) {
          setAccounts(accountData);
        }
      }
    } catch (error) {
      console.error(`Failed to refresh ${provider.name} integration:`, error);
      setMessage(`Could not refresh ${provider.name} status. Try reconnecting.`);
    } finally {
      setLoadingStatus(false);
    }
  }, [isQuickBooks, provider.id, provider.name, provider.status]);

  useEffect(() => {
    const timeout = window.setTimeout(() => {
      refreshIntegration();
    }, 0);

    return () => window.clearTimeout(timeout);
  }, [refreshIntegration]);

  const forceSync = async () => {
    setSyncing(true);
    setMessage("");
    await refreshIntegration();
    setRefreshKey((key) => key + 1);
    setMessage(`${provider.name} sync refreshed. Recent invoices and accounts are up to date.`);
    window.setTimeout(() => setMessage(""), 2400);
    setSyncing(false);
  };

  const disconnect = async () => {
    const confirmed = window.confirm(
      `Disconnect ${provider.name}? Existing records in ${provider.name} will stay untouched, but AgncyPay will stop syncing.`
    );

    if (!confirmed) return;

    setDisconnecting(true);
    setMessage("");
    try {
      if (isQuickBooks) {
        const response = await fetch("/api/quickbooks/disconnect", { method: "POST" });
        if (!response.ok) throw new Error("Disconnect failed");
      } else {
        writeMockConnectedProviderId(provider.id, false);
      }

      setStatus({ connected: false, environment: status.environment || "sandbox" });
      setCompanyName("");
      setRefreshKey((key) => key + 1);
      setMessage(`${provider.name} disconnected.`);
    } catch (error) {
      console.error(`Failed to disconnect ${provider.name}:`, error);
      setMessage(`Could not disconnect ${provider.name}. Please try again.`);
    } finally {
      setDisconnecting(false);
    }
  };

  const connect = () => {
    if (isQuickBooks) {
      window.location.href = "/api/auth/quickbooks/connect";
      return;
    }

    writeMockConnectedProviderId(provider.id, true);
    setStatus({
      connected: true,
      environment: "demo",
      connectedAt: new Date().toISOString(),
      accessExpiresAt: new Date(Date.now() + 60 * 60 * 1000).toISOString(),
      refreshExpiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
      hasRefreshToken: true,
    });
    setCompanyName(`${provider.name} demo workspace`);
    setMessage(`${provider.name} connected in demo mode.`);
  };

  const connected = status.connected;

  return (
    <div className="grid grid-cols-1 gap-[24px] lg:grid-cols-[1fr_400px]">
      <div className="space-y-[24px]">
        <section className="rounded-[13px] border border-[#303030] bg-black p-[28px]">
          <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <div className="flex items-center gap-3">
                <div className="flex h-[48px] w-[48px] items-center justify-center rounded-[10px] bg-white p-[8px]">
                  <img src={provider.logoUrl} alt={provider.name} className="max-h-full max-w-full object-contain" />
                </div>
                <div>
                  <h2 className="text-[22px] font-semibold text-white">{provider.name}</h2>
                  <p className="mt-1 text-[13px] text-[#8d8d8d]">
                    {status.environment ? `Environment: ${status.environment}` : provider.description}
                  </p>
                </div>
              </div>

              <div className="mt-5 flex flex-wrap gap-2">
                {loadingStatus ? (
                  <span className="inline-flex items-center gap-2 rounded-full border border-[#333] bg-[#111] px-3 py-1.5 text-[12px] font-semibold text-[#bdbdbd]">
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    Checking status
                  </span>
                ) : connected ? (
                  <span className="inline-flex items-center gap-2 rounded-full border border-green-500/30 bg-green-500/10 px-3 py-1.5 text-[12px] font-semibold text-green-400">
                    <CheckCircle2 className="h-3.5 w-3.5" />
                    Connected
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-2 rounded-full border border-[#444] bg-[#151515] px-3 py-1.5 text-[12px] font-semibold text-[#bdbdbd]">
                    <AlertTriangle className="h-3.5 w-3.5" />
                    Not connected
                  </span>
                )}
                {companyName && (
                  <span className="rounded-full border border-[#333] bg-[#111] px-3 py-1.5 text-[12px] font-semibold text-[#d7d7d7]">
                    {companyName}
                  </span>
                )}
                {status.realmId && (
                  <span className="rounded-full border border-[#333] bg-[#111] px-3 py-1.5 text-[12px] font-semibold text-[#d7d7d7]">
                    Realm {status.realmId}
                  </span>
                )}
              </div>
            </div>

            <div className="flex flex-col gap-3 sm:min-w-[180px]">
              {connected ? (
                <button
                  type="button"
                  onClick={forceSync}
                  disabled={syncing || loadingStatus}
                  className="inline-flex h-[38px] items-center justify-center gap-2 rounded-[7px] border border-[#303030] bg-[#0c0c0c] px-[16px] text-[15px] font-semibold text-white transition-colors hover:border-[#555] disabled:opacity-60"
                >
                  <RefreshCw className={`h-4 w-4 text-[#b8b8b8] ${syncing ? "animate-spin" : ""}`} />
                  Force Sync Now
                </button>
              ) : (
                <button
                  type="button"
                  onClick={connect}
                  className="inline-flex h-[38px] items-center justify-center gap-2 rounded-[7px] border border-white bg-white px-[16px] text-[15px] font-semibold text-black transition-colors hover:bg-[#e8e8e8]"
                >
                  <Plug className="h-4 w-4" />
                  Connect
                </button>
              )}
              <Link
                href="/dashboard/settings"
                className="inline-flex h-[38px] items-center justify-center gap-2 rounded-[7px] border border-[#303030] bg-black px-[16px] text-[15px] font-semibold text-white transition-colors hover:border-[#555]"
              >
                Back to Settings
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>

          {message && (
            <div className="mt-5 rounded-[8px] border border-[#303030] bg-[#0c0c0c] px-4 py-3 text-[13px] font-semibold text-[#d7d7d7]">
              {message}
            </div>
          )}

          {connected && (
            <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-3">
              <div className="rounded-[8px] border border-[#303030] bg-[#050505] p-4">
                <p className="text-[12px] font-semibold text-[#777]">Connected</p>
                <p className="mt-2 text-[14px] font-semibold text-white">{formatDate(status.connectedAt)}</p>
              </div>
              <div className="rounded-[8px] border border-[#303030] bg-[#050505] p-4">
                <p className="text-[12px] font-semibold text-[#777]">Access token</p>
                <p className="mt-2 text-[14px] font-semibold text-white">{formatDate(status.accessExpiresAt)}</p>
              </div>
              <div className="rounded-[8px] border border-[#303030] bg-[#050505] p-4">
                <p className="text-[12px] font-semibold text-[#777]">Refresh token</p>
                <p className="mt-2 text-[14px] font-semibold text-white">{formatDate(status.refreshExpiresAt)}</p>
              </div>
            </div>
          )}
        </section>

        {connected ? (
          <>
            <RealSyncLogs refreshKey={refreshKey} providerId={provider.id} providerName={provider.name} />
            <section className="rounded-[13px] border border-[#303030] bg-black p-[28px]">
              <h2 className="text-[20px] font-semibold text-white">Data Mapping</h2>
              <p className="mt-2 text-[14px] leading-6 text-[#8d8d8d]">
                Map AgncyPay payment categories into your {provider.name} chart of accounts.
              </p>
              <DataMappingForm chartOfAccounts={accounts} />
            </section>
          </>
        ) : (
          <section className="rounded-[13px] border border-[#303030] bg-black p-[28px] text-center">
            <AlertTriangle className="mx-auto h-8 w-8 text-[#d7d7d7]" />
            <h2 className="mt-4 text-[22px] font-semibold text-white">{provider.name} is disconnected</h2>
            <p className="mx-auto mt-2 max-w-[520px] text-[14px] leading-6 text-[#8d8d8d]">
              Connect {provider.name} to review invoices, map accounts, manage sync rules, and monitor integration health.
            </p>
            <button
              type="button"
              onClick={connect}
              className="mt-5 inline-flex h-[40px] items-center justify-center gap-2 rounded-[7px] border border-white bg-white px-5 text-[14px] font-semibold text-black hover:bg-[#e8e8e8]"
            >
              <Plug className="h-4 w-4" />
              Connect {provider.name}
            </button>
          </section>
        )}
      </div>

      <aside className="space-y-[24px]">
        <section className="rounded-[13px] border border-[#303030] bg-black p-[28px]">
          <h3 className="text-[17px] font-semibold text-white">Automation Rules</h3>
          <div className="mt-[20px] space-y-[16px]">
            <label className="flex cursor-pointer items-start gap-4">
              <input type="checkbox" defaultChecked disabled={!connected} className="mt-1 h-[18px] w-[18px] accent-white disabled:opacity-40" />
              <div>
                <div className="text-[15px] font-medium text-white">Auto-sync Payments</div>
                <div className="mt-1 text-[13px] text-[#8d8d8d]">Push AgncyPay payment records to {provider.name} when marked as paid.</div>
              </div>
            </label>
            <label className="flex cursor-pointer items-start gap-4">
              <input type="checkbox" defaultChecked disabled={!connected} className="mt-1 h-[18px] w-[18px] accent-white disabled:opacity-40" />
              <div>
                <div className="text-[15px] font-medium text-white">Auto-create Vendors</div>
                <div className="mt-1 text-[13px] text-[#8d8d8d]">Create missing vendors automatically from invoice recipients.</div>
              </div>
            </label>
            <label className="flex cursor-pointer items-start gap-4">
              <input type="checkbox" disabled={!connected} className="mt-1 h-[18px] w-[18px] accent-white disabled:opacity-40" />
              <div>
                <div className="text-[15px] font-medium text-white">Sync every 15 minutes</div>
                <div className="mt-1 text-[13px] text-[#8d8d8d]">Keep invoice status fresh without waiting for manual refresh.</div>
              </div>
            </label>
          </div>
        </section>

        <section className="rounded-[13px] border border-[#303030] bg-black p-[28px]">
          <h3 className="text-[17px] font-semibold text-white">Connection Health</h3>
          <div className="mt-4 space-y-3 text-[13px]">
            <div className="flex justify-between gap-4 border-b border-[#222] pb-3">
              <span className="text-[#8d8d8d]">Status</span>
              <span className="font-semibold text-white">{connected ? "Active" : "Disconnected"}</span>
            </div>
            <div className="flex justify-between gap-4 border-b border-[#222] pb-3">
              <span className="text-[#8d8d8d]">Accounts loaded</span>
              <span className="font-semibold text-white">{connected ? accounts.length : 0}</span>
            </div>
            <div className="flex justify-between gap-4">
              <span className="text-[#8d8d8d]">Refresh token</span>
              <span className="font-semibold text-white">{status.hasRefreshToken ? "Present" : "Unavailable"}</span>
            </div>
          </div>
        </section>

        <section className="rounded-[13px] border border-[#303030] bg-black p-[28px]">
          <h3 className="text-[17px] font-semibold text-white">Danger Zone</h3>
          <p className="mt-[12px] text-[14px] leading-relaxed text-[#9b9b9b]">
            Disconnecting stops automated syncing and clears the local {provider.name} connection. Your {provider.name} records are not deleted.
          </p>
          <button
            type="button"
            onClick={connected ? disconnect : connect}
            disabled={disconnecting || loadingStatus}
            className="mt-[16px] inline-flex h-[38px] w-full items-center justify-center gap-2 rounded-[7px] border border-red-500/30 bg-red-500/10 text-[15px] font-semibold text-red-400 transition-colors hover:bg-red-500/20 disabled:opacity-60"
          >
            {disconnecting ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : connected ? (
              <Unplug className="h-4 w-4" />
            ) : (
              <Plug className="h-4 w-4" />
            )}
            {connected ? "Disconnect Integration" : "Reconnect Integration"}
          </button>
        </section>
      </aside>
    </div>
  );
}
