"use client";

import React, { useCallback, useState, useEffect } from "react";
import Link from "next/link";
import { CheckCircle2, ArrowRight, Loader2, Unplug } from "lucide-react";
import { erpProviders, ERPProvider } from "@/data/mock-integrations";

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
    // Simulate API delay
    setTimeout(() => {
      setStep("success");
      setTimeout(() => {
        onSuccess();
      }, 1500);
    }, 2500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 px-4 backdrop-blur-sm">
      <div className="relative w-full max-w-[480px] overflow-hidden rounded-[16px] border border-[#333] bg-[#0c0c0c] shadow-2xl">
        {/* Mock 3rd Party Header */}
        <div 
          className="flex h-[60px] items-center px-6" 
          style={{ backgroundColor: provider.primaryColor }}
        >
          {/* We use a white filter trick or just rely on the logo image if it has a transparent background. 
              Since they are wiki logos, we'll just show the text for branding if logo is tricky, 
              but let's show the logo nicely if possible. */}
          <div className="flex items-center gap-3 bg-white/10 px-3 py-1 rounded-md backdrop-blur-md">
            <span className="text-[18px] font-bold text-white tracking-wide">{provider.name} Auth</span>
          </div>
        </div>

        <div className="p-[32px]">
          {step === "auth" && (
            <div className="flex flex-col items-center text-center">
              <div className="flex h-[80px] w-[80px] items-center justify-center rounded-2xl bg-white p-4 shadow-lg ring-1 ring-white/10">
                <img src={provider.logoUrl} alt={provider.name} className="max-h-full max-w-full object-contain" />
              </div>
              <h3 className="mt-6 text-[22px] font-semibold text-white">Connect AgncyPay to {provider.name}</h3>
              <p className="mt-3 text-[15px] leading-relaxed text-[#9b9b9b]">
                AgncyPay would like to access your {provider.name} data to automatically sync invoices, vendors, and payments.
              </p>
              
              <div className="mt-8 flex w-full flex-col gap-3">
                <button
                  onClick={handleConnect}
                  style={{ backgroundColor: provider.primaryColor }}
                  className="flex h-[44px] w-full items-center justify-center rounded-[8px] text-[16px] font-semibold text-white transition-opacity hover:opacity-90"
                >
                  Allow Access
                </button>
                <button
                  onClick={onClose}
                  className="flex h-[44px] w-full items-center justify-center rounded-[8px] border border-[#333] bg-transparent text-[16px] font-semibold text-[#b8b8b8] transition-colors hover:bg-[#1a1a1a] hover:text-white"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}

          {step === "connecting" && (
            <div className="flex flex-col items-center py-8 text-center">
              <Loader2 className="h-12 w-12 animate-spin" style={{ color: provider.primaryColor }} />
              <h3 className="mt-6 text-[20px] font-semibold text-white">Securing Connection...</h3>
              <p className="mt-2 text-[15px] text-[#9b9b9b]">Exchanging secure tokens with {provider.name}</p>
            </div>
          )}

          {step === "success" && (
            <div className="flex flex-col items-center py-8 text-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-green-500/20">
                <CheckCircle2 className="h-8 w-8 text-green-500" />
              </div>
              <h3 className="mt-6 text-[20px] font-semibold text-white">Successfully Connected!</h3>
              <p className="mt-2 text-[15px] text-[#9b9b9b]">Redirecting you back to settings...</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export function IntegrationsMarketplace() {
  const [providers, setProviders] = useState(erpProviders);
  const [activeOAuth, setActiveOAuth] = useState<ERPProvider | null>(null);
  const [checkingQuickBooks, setCheckingQuickBooks] = useState(true);
  const [disconnectingId, setDisconnectingId] = useState<string | null>(null);

  const connectQuickBooks = () => {
    window.location.assign("/api/auth/quickbooks/connect");
  };

  const refreshQuickBooksStatus = useCallback(async () => {
    setCheckingQuickBooks(true);
    const mockConnectedIds = readMockConnectedProviderIds();

    try {
      const res = await fetch("/api/quickbooks/status", { cache: "no-store" });
      if (res.ok) {
        const data = await res.json();
        setProviders(current =>
          current.map(p => 
            p.id === "quickbooks" 
              ? { ...p, status: data.connected ? "Connected" : "Not Connected" } 
              : { ...p, status: mockConnectedIds.has(p.id) ? "Connected" : "Not Connected" }
          )
        );
      }
    } catch (err) {
      console.error("Failed to fetch QuickBooks status:", err);
      setProviders(current =>
        current.map(p =>
          p.id === "quickbooks"
            ? p
            : { ...p, status: mockConnectedIds.has(p.id) ? "Connected" : "Not Connected" }
        )
      );
    } finally {
      setCheckingQuickBooks(false);
    }
  }, []);

  useEffect(() => {
    const timeout = window.setTimeout(() => {
      refreshQuickBooksStatus();
    }, 0);

    return () => window.clearTimeout(timeout);
  }, [refreshQuickBooksStatus]);

  const handleConnectSuccess = (providerId: string) => {
    if (providerId !== "quickbooks") {
      writeMockConnectedProviderId(providerId, true);
    }

    setProviders(current =>
      current.map(p => p.id === providerId ? { ...p, status: "Connected" } : p)
    );
    setActiveOAuth(null);
  };

  const handleDisconnect = async (provider: ERPProvider) => {
    setDisconnectingId(provider.id);
    try {
      if (provider.id === "quickbooks") {
        const res = await fetch("/api/quickbooks/disconnect", { method: "POST" });
        if (!res.ok) throw new Error("Failed to disconnect QuickBooks.");
        await refreshQuickBooksStatus();
      } else {
        writeMockConnectedProviderId(provider.id, false);
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
    <div className="space-y-[24px]">
      <div className="grid grid-cols-1 gap-[20px] md:grid-cols-2">
        {providers.map((provider) => (
          <div
            key={provider.id}
            className="group relative flex flex-col justify-between overflow-hidden rounded-[14px] border border-[#303030] bg-[#0c0c0c] p-[24px] transition-all hover:border-[#555] hover:shadow-[0_0_30px_rgba(255,255,255,0.03)]"
          >
            <div>
              <div className="flex items-start justify-between">
                <div className="flex h-[52px] w-[52px] items-center justify-center rounded-[10px] bg-white p-[10px]">
                  <img src={provider.logoUrl} alt={provider.name} className="max-h-full max-w-full object-contain" />
                </div>
                {provider.status === "Connected" ? (
                  <div className="flex items-center gap-[6px] rounded-full border border-green-500/30 bg-green-500/10 px-[10px] py-[4px]">
                    <CheckCircle2 className="h-[14px] w-[14px] text-green-500" />
                    <span className="text-[12px] font-medium text-green-500">Connected</span>
                  </div>
                ) : checkingQuickBooks && provider.id === "quickbooks" ? (
                  <div className="flex items-center gap-[6px] rounded-full border border-[#444] bg-[#222] px-[10px] py-[4px]">
                    <Loader2 className="h-[14px] w-[14px] animate-spin text-[#9b9b9b]" />
                    <span className="text-[12px] font-medium text-[#9b9b9b]">Checking</span>
                  </div>
                ) : (
                  <div className="flex items-center gap-[6px] rounded-full border border-[#444] bg-[#222] px-[10px] py-[4px]">
                    <span className="text-[12px] font-medium text-[#9b9b9b]">Not Connected</span>
                  </div>
                )}
              </div>
              
              <h3 className="mt-[20px] text-[19px] font-semibold text-white">
                {provider.name}
              </h3>
              <p className="mt-[8px] text-[14px] leading-[22px] text-[#8d8d8d]">
                {provider.description}
              </p>
            </div>

            <div className="mt-[28px] flex items-center gap-3">
              {provider.status === "Connected" ? (
                <>
                  <Link
                    href={`/dashboard/settings/integrations/${provider.id}`}
                    className="flex h-[38px] flex-1 items-center justify-center gap-[8px] rounded-[7px] border border-[#444] bg-[#1a1a1a] text-[15px] font-semibold text-white transition-colors hover:bg-[#2a2a2a]"
                  >
                    Configure Sync
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                  <button
                    type="button"
                    onClick={() => handleDisconnect(provider)}
                    disabled={disconnectingId === provider.id}
                    className="flex h-[38px] items-center justify-center gap-[8px] rounded-[7px] border border-red-500/30 bg-red-500/10 px-3 text-[14px] font-semibold text-red-400 transition-colors hover:bg-red-500/20 disabled:opacity-60"
                    aria-label={`Disconnect ${provider.name}`}
                  >
                    {disconnectingId === provider.id ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Unplug className="h-4 w-4" />
                    )}
                  </button>
                </>
              ) : provider.id === "quickbooks" ? (
                <button
                  type="button"
                  onClick={connectQuickBooks}
                  className="flex h-[38px] flex-1 items-center justify-center gap-[8px] rounded-[7px] bg-white text-[15px] font-semibold text-black transition-colors hover:bg-[#e8e8e8]"
                >
                  {checkingQuickBooks ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : null}
                  Connect
                </button>
              ) : (
                <button
                  onClick={() => setActiveOAuth(provider)}
                  className="flex h-[38px] flex-1 items-center justify-center gap-[8px] rounded-[7px] bg-white text-[15px] font-semibold text-black transition-colors hover:bg-[#e8e8e8]"
                >
                  Connect
                </button>
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
