"use client";

import React, { useCallback, useState, useEffect } from "react";
import Link from "next/link";
import { CheckCircle2, ArrowRight, Loader2, Unplug, X, Plug, ChevronLeft } from "lucide-react";
import { cn } from "../../../lib/utils";
import { Button } from "../../../components/ui/Button";

export type IntegrationStatus = "Connected" | "Not Connected" | "Connecting";

export type ERPProvider = {
  id: string;
  name: string;
  description: string;
  logoUrl: string;
  status: IntegrationStatus;
  primaryColor: string;
};

const defaultProviders: ERPProvider[] = [
  {
    id: "quickbooks",
    name: "QuickBooks Online",
    description: "Sync invoices, payments, and vendors automatically to your QBO account.",
    logoUrl: "https://www.google.com/s2/favicons?domain=quickbooks.intuit.com&sz=128",
    status: "Not Connected",
    primaryColor: "#2CA01C", // QuickBooks Green
  },
  {
    id: "xero",
    name: "Xero",
    description: "Keep your Xero ledgers up to date in real-time as payments are processed.",
    logoUrl: "https://www.google.com/s2/favicons?domain=xero.com&sz=128",
    status: "Not Connected",
    primaryColor: "#13B5EA", // Xero Blue
  },
  {
    id: "plaid",
    name: "Plaid",
    description: "Link bank feeds to check available cash balances, transaction logs, and treasury operations.",
    logoUrl: "https://www.google.com/s2/favicons?domain=plaid.com&sz=128",
    status: "Not Connected",
    primaryColor: "#0A5CFF", // Plaid Blue
  }
];

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

function OAuthModal({
  provider,
  onClose,
  onSuccess,
}: {
  provider: ERPProvider;
  onClose: () => void;
  onSuccess: () => void;
}) {
  const [step, setStep] = useState<"auth" | "connecting" | "success">("auth");

  const handleConnect = () => {
    setStep("connecting");
    setTimeout(() => {
      setStep("success");
      setTimeout(() => {
        onSuccess();
      }, 1200);
    }, 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 px-4 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-[440px] overflow-hidden rounded-[16px] border border-[#3a3a3a] bg-[#0c0c0c] shadow-2xl">
        <div 
          className="flex h-[60px] items-center px-6" 
          style={{ backgroundColor: provider.primaryColor || "#111" }}
        >
          <div className="flex items-center gap-3 bg-white/10 px-3 py-1 rounded-md backdrop-blur-md">
            <span className="text-[15px] font-bold text-white tracking-wide">{provider.name} Auth</span>
          </div>
        </div>

        <div className="p-8">
          {step === "auth" && (
            <div className="flex flex-col items-center text-center">
              <div className="flex h-[72px] w-[72px] items-center justify-center rounded-2xl bg-white p-3.5 shadow-lg ring-1 ring-white/10">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={provider.logoUrl} alt={provider.name} className="max-h-full max-w-full object-contain" />
              </div>
              <h3 className="mt-5 text-[18px] font-bold text-white">Connect AgncyPay to {provider.name}</h3>
              <p className="mt-2.5 text-[12px] leading-relaxed text-[#9b9b9b]">
                AgncyPay would like to access your {provider.name} workspace data to automatically sync payments, invoices, and mapping rules.
              </p>
              
              <div className="mt-6 flex w-full flex-col gap-2">
                <button
                  onClick={handleConnect}
                  style={{ backgroundColor: provider.primaryColor }}
                  className="flex h-10 w-full items-center justify-center rounded-[8px] text-[13px] font-bold text-white transition-opacity hover:opacity-90 cursor-pointer"
                >
                  Allow Access
                </button>
                <button
                  onClick={onClose}
                  className="flex h-10 w-full items-center justify-center rounded-[8px] border border-[#3a3a3a] bg-transparent text-[13px] font-bold text-[#b8b8b8] transition-colors hover:bg-[#1a1a1a] hover:text-white cursor-pointer"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}

          {step === "connecting" && (
            <div className="flex flex-col items-center py-6 text-center">
              <Loader2 className="h-10 w-10 animate-spin" style={{ color: provider.primaryColor }} />
              <h3 className="mt-5 text-[16px] font-bold text-white">Securing Connection...</h3>
              <p className="mt-2 text-[12px] text-[#9b9b9b]">Exchanging credentials &amp; setup details with {provider.name}</p>
            </div>
          )}

          {step === "success" && (
            <div className="flex flex-col items-center py-6 text-center">
              <div className="flex h-14 w-14 items-center justify-center rounded-full bg-green-500/20">
                <CheckCircle2 className="h-7 w-7 text-green-500" />
              </div>
              <h3 className="mt-5 text-[16px] font-bold text-white">Successfully Connected!</h3>
              <p className="mt-2 text-[12px] text-[#9b9b9b]">Updating connection profile status...</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function IntegrationsPage() {
  const [providers, setProviders] = useState<ERPProvider[]>(defaultProviders);
  const [activeOAuth, setActiveOAuth] = useState<ERPProvider | null>(null);
  const [checkingQuickBooks, setCheckingQuickBooks] = useState(true);
  const [checkingXero, setCheckingXero] = useState(true);
  const [checkingPlaid, setCheckingPlaid] = useState(true);
  const [disconnectingId, setDisconnectingId] = useState<string | null>(null);

  const connectQuickBooks = () => {
    window.location.assign("/api/auth/quickbooks/connect");
  };

  const connectXero = () => {
    window.location.assign("/api/auth/xero/connect");
  };

  const refreshStatuses = useCallback(async () => {
    setCheckingQuickBooks(true);
    setCheckingXero(true);
    setCheckingPlaid(true);
    const mockConnectedIds = readMockConnectedProviderIds();

    // Check QuickBooks Status
    let qbConnected = false;
    try {
      const res = await fetch("/api/quickbooks/status", { cache: "no-store" });
      if (res.ok) {
        const data = await res.json();
        qbConnected = !!data.connected;
      }
    } catch (err) {
      console.error("Failed to fetch QuickBooks status:", err);
    } finally {
      setCheckingQuickBooks(false);
    }

    // Check Xero Status
    let xeroConnected = false;
    try {
      const res = await fetch("/api/xero/status", { cache: "no-store" });
      if (res.ok) {
        const data = await res.json();
        xeroConnected = !!data.connected;
      }
    } catch (err) {
      console.error("Failed to fetch Xero status:", err);
    } finally {
      setCheckingXero(false);
    }

    // Check Plaid Status
    let plaidConnected = false;
    try {
      const res = await fetch("/api/plaid/status", { cache: "no-store" });
      if (res.ok) {
        const data = await res.json();
        plaidConnected = !!data.connected;
      }
    } catch (err) {
      console.error("Failed to fetch Plaid status:", err);
    } finally {
      setCheckingPlaid(false);
    }

    setProviders(current =>
      current.map(p => {
        const isLocalOverride = mockConnectedIds.has(p.id);
        if (p.id === "quickbooks") {
          return { ...p, status: (qbConnected || isLocalOverride) ? "Connected" : "Not Connected" };
        }
        if (p.id === "xero") {
          return { ...p, status: (xeroConnected || isLocalOverride) ? "Connected" : "Not Connected" };
        }
        if (p.id === "plaid") {
          return { ...p, status: (plaidConnected || isLocalOverride) ? "Connected" : "Not Connected" };
        }
        return { ...p, status: isLocalOverride ? "Connected" : "Not Connected" };
      })
    );
  }, []);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      const connected = params.get("connected");
      if (connected) {
        writeMockConnectedProviderId(connected, true);
      }
    }
    refreshStatuses();
  }, [refreshStatuses]);

  const handleConnectSuccess = async (providerId: string) => {
    if (providerId === "plaid") {
      try {
        await fetch("/api/plaid/exchange-token", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            public_token: "mock-public-token-12345",
            institution: { name: "Plaid Sandbox Bank", institution_id: "ins_sandbox" },
          }),
        });
      } catch (err) {
        console.error("Failed to exchange mock Plaid token:", err);
      }
    }
    writeMockConnectedProviderId(providerId, true);
    await refreshStatuses();
    setActiveOAuth(null);
  };

  const handleDisconnect = async (provider: ERPProvider) => {
    const confirmed = window.confirm(`Disconnect ${provider.name}? This will stop automated record syncing.`);
    if (!confirmed) return;

    setDisconnectingId(provider.id);
    try {
      writeMockConnectedProviderId(provider.id, false);
      if (provider.id === "quickbooks") {
        const res = await fetch("/api/quickbooks/disconnect", { method: "POST" });
        if (!res.ok) throw new Error("Failed to disconnect QuickBooks.");
        await refreshStatuses();
      } else if (provider.id === "xero") {
        const res = await fetch("/api/xero/disconnect", { method: "POST" });
        if (!res.ok) throw new Error("Failed to disconnect Xero.");
        await refreshStatuses();
      } else if (provider.id === "plaid") {
        const res = await fetch("/api/plaid/disconnect", { method: "POST" });
        if (!res.ok) throw new Error("Failed to disconnect Plaid.");
        await refreshStatuses();
      } else {
        setProviders(current =>
          current.map(p => p.id === provider.id ? { ...p, status: "Not Connected" } : p)
        );
      }
    } catch (error) {
      console.error("Failed to disconnect integration:", error);
    } finally {
      setDisconnectingId(null);
    }
  };

  return (
    <div className="space-y-6 select-text">
      <div>
        <Link 
          href="/dashboard"
          className="inline-flex items-center gap-1 text-xs font-bold text-neutral-500 hover:text-white transition-colors mb-4"
        >
          <ChevronLeft className="h-4 w-4" />
          Back to Dashboard
        </Link>
      </div>
      <div>
        <h2 className="text-xl font-bold tracking-tight text-white">Integrations Marketplace</h2>
        <p className="text-xs font-semibold text-neutral-400 mt-1">
          Link financial platforms, bank feeds, or accounting ledgers to coordinate operations automatically.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-[20px] md:grid-cols-2">
        {providers.map((provider) => (
          <div
            key={provider.id}
            className="group relative flex flex-col justify-between overflow-hidden rounded-[14px] border border-[#3a3a3a] bg-[#0d0d0d] p-[24px] transition-all hover:border-white/20 hover:shadow-[0_0_24px_-4px_rgba(255,255,255,0.02)]"
          >
            <div>
              <div className="flex items-start justify-between">
                <div className="flex h-[52px] w-[52px] items-center justify-center rounded-[10px] bg-white p-[10px]">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={provider.logoUrl} alt={provider.name} className="max-h-full max-w-full object-contain" />
                </div>
                {provider.status === "Connected" ? (
                  <div className="flex items-center gap-[6px] rounded-full border border-green-500/30 bg-green-500/10 px-[10px] py-[4px]">
                    <CheckCircle2 className="h-[14px] w-[14px] text-green-500" />
                    <span className="text-[12px] font-bold text-green-500">Connected</span>
                  </div>
                ) : (checkingQuickBooks && provider.id === "quickbooks") || (checkingXero && provider.id === "xero") || (checkingPlaid && provider.id === "plaid") ? (
                  <div className="flex items-center gap-[6px] rounded-full border border-[#3a3a3a] bg-[#222] px-[10px] py-[4px]">
                    <Loader2 className="h-[14px] w-[14px] animate-spin text-[#9b9b9b]" />
                    <span className="text-[12px] font-bold text-[#9b9b9b]">Checking</span>
                  </div>
                ) : (
                  <div className="flex items-center gap-[6px] rounded-full border border-[#3a3a3a] bg-[#222] px-[10px] py-[4px]">
                    <span className="text-[12px] font-bold text-[#9b9b9b]">Not Connected</span>
                  </div>
                )}
              </div>
              
              <h3 className="mt-[20px] text-[18px] font-bold text-white">
                {provider.name}
              </h3>
              <p className="mt-[8px] text-[12px] leading-[18px] text-[#8d8d8d]">
                {provider.description}
              </p>

              {provider.status === "Connected" && (
                <div className="mt-4 pt-3 border-t border-[#222] grid grid-cols-2 gap-2 text-[10px] text-[#8d8d8d]">
                  <div>
                    <span className="block text-neutral-500 font-bold uppercase tracking-wider text-[8px]">Last Sync</span>
                    <span className="text-neutral-300 font-medium">Just now</span>
                  </div>
                  <div>
                    <span className="block text-neutral-500 font-bold uppercase tracking-wider text-[8px]">Sync Health</span>
                    <span className="text-green-400 font-bold">Healthy</span>
                  </div>
                </div>
              )}
            </div>

            <div className="mt-[28px] flex items-center gap-3">
              {provider.status === "Connected" ? (
                <>
                  <Link
                    href={provider.id === "quickbooks" ? "/dashboard/quickbooks" : provider.id === "xero" ? "/providers/xero/dashboard" : provider.id === "plaid" ? "/dashboard/wallet" : "#"}
                    className="flex h-[38px] flex-1 items-center justify-center gap-[8px] rounded-[7px] border border-[#3a3a3a] bg-[#1a1a1a] text-[13px] font-bold text-white transition-colors hover:bg-[#2a2a2a] hover:border-white/20"
                  >
                    Configure Sync
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                  <Button
                    variant="outline"
                    onClick={() => handleDisconnect(provider)}
                    isLoading={disconnectingId === provider.id}
                    className="h-[38px] border-red-500/30 bg-red-500/10 hover:bg-red-500/20 text-red-400 px-3 hover:text-red-300 gap-0"
                    aria-label={`Disconnect ${provider.name}`}
                  >
                    <Unplug className="h-4 w-4" />
                  </Button>
                </>
              ) : provider.id === "quickbooks" ? (
                <Button
                  onClick={connectQuickBooks}
                  isLoading={checkingQuickBooks}
                  className="flex-1 h-[38px] text-[13px] font-bold gap-2"
                >
                  <Plug className="h-4 w-4 text-black" />
                  Connect QuickBooks
                </Button>
              ) : provider.id === "xero" ? (
                <Button
                  onClick={connectXero}
                  isLoading={checkingXero}
                  className="flex-1 h-[38px] text-[13px] font-bold gap-2"
                >
                  <Plug className="h-4 w-4 text-black" />
                  Connect Xero
                </Button>
              ) : (
                <Button
                  onClick={() => setActiveOAuth(provider)}
                  className="flex-1 h-[38px] text-[13px] font-bold gap-2"
                >
                  <Plug className="h-4 w-4 text-black" />
                  Connect {provider.name}
                </Button>
              )}
            </div>
          </div>
        ))}
      </div>

      {activeOAuth && (
        <OAuthModal
          provider={activeOAuth}
          onClose={() => setActiveOAuth(null)}
          onSuccess={() => handleConnectSuccess(activeOAuth.id)}
        />
      )}
    </div>
  );
}
