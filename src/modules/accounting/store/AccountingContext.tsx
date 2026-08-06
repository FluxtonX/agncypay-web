"use client";

import React, { createContext, useContext, useState, useEffect, useCallback, startTransition } from "react";
import { ProviderType, NormalizedInvoice, NormalizedPayout, NormalizedVendor, ConnectionStatus } from "../types";
import { accountingService } from "../services/accountingService";

interface AccountingContextType {
  currentProvider: ProviderType;
  setCurrentProvider: (provider: ProviderType) => void;
  invoices: NormalizedInvoice[];
  payouts: NormalizedPayout[];
  vendors: NormalizedVendor[];
  allInvoices: NormalizedInvoice[];
  allPayouts: NormalizedPayout[];
  allVendors: NormalizedVendor[];
  connectionStatuses: Record<ProviderType, ConnectionStatus | null>;
  providerErrors: Record<ProviderType, string | null>;
  loading: boolean;
  syncing: boolean;
  disconnecting: boolean;
  error: string | null;
  fetchData: (provider?: ProviderType) => Promise<void>;
  sync: () => Promise<void>;
  disconnect: () => Promise<void>;
  refreshStatuses: () => Promise<void>;
}

const AccountingContext = createContext<AccountingContextType | undefined>(undefined);

export function AccountingProvider({ children }: { children: React.ReactNode }) {
  const [currentProvider, setCurrentProviderState] = useState<ProviderType>("quickbooks");
  const [invoices, setInvoices] = useState<NormalizedInvoice[]>([]);
  const [payouts, setPayouts] = useState<NormalizedPayout[]>([]);
  const [vendors, setVendors] = useState<NormalizedVendor[]>([]);
  
  const [allInvoices, setAllInvoices] = useState<NormalizedInvoice[]>([]);
  const [allPayouts, setAllPayouts] = useState<NormalizedPayout[]>([]);
  const [allVendors, setAllVendors] = useState<NormalizedVendor[]>([]);

  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [disconnecting, setDisconnecting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [connectionStatuses, setConnectionStatuses] = useState<Record<ProviderType, ConnectionStatus | null>>({
    quickbooks: null,
    xero: null,
    sage: null,
  });

  const [providerErrors, setProviderErrors] = useState<Record<ProviderType, string | null>>({
    quickbooks: null,
    xero: null,
    sage: null,
  });

  const fetchAllConnectedData = useCallback(async () => {
    const providers: ProviderType[] = ["quickbooks", "xero", "sage"];
    try {
      const results = await Promise.all(
        providers.map(async (p) => {
          try {
            const adapter = accountingService.getAdapter(p);
            const status = await adapter.getStatus();
            if (!status?.connected) {
              return { provider: p, status, invoices: [], payouts: [], vendors: [] };
            }
            const [invs, pays, vends] = await Promise.all([
              adapter.getInvoices().catch(() => [] as NormalizedInvoice[]),
              adapter.getPayouts().catch(() => [] as NormalizedPayout[]),
              adapter.getVendors().catch(() => [] as NormalizedVendor[]),
            ]);
            return {
              provider: p,
              status,
              invoices: invs.map(inv => ({ ...inv, provider: p })),
              payouts: pays.map(pay => ({ ...pay, provider: p })),
              vendors: vends.map(vend => ({ ...vend, provider: p })),
            };
          } catch (e) {
            console.error(`Error loading fallback data for ${p}`, e);
            return { provider: p, status: { connected: false, environment: "sandbox" }, invoices: [], payouts: [], vendors: [] };
          }
        })
      );

      // Order: QuickBooks first, then Xero, then Sage
      const order: ProviderType[] = ["quickbooks", "xero", "sage"];
      let combinedInvoices: NormalizedInvoice[] = [];
      let combinedPayouts: NormalizedPayout[] = [];
      let combinedVendors: NormalizedVendor[] = [];

      order.forEach((p) => {
        const res = results.find((r) => r.provider === p);
        if (res) {
          combinedInvoices = [...combinedInvoices, ...res.invoices];
          combinedPayouts = [...combinedPayouts, ...res.payouts];
          combinedVendors = [...combinedVendors, ...res.vendors];
        }
      });

      const nextStatuses = {
        quickbooks: results.find((r) => r.provider === "quickbooks")?.status || null,
        xero: results.find((r) => r.provider === "xero")?.status || null,
        sage: results.find((r) => r.provider === "sage")?.status || null,
      };

      startTransition(() => {
        setConnectionStatuses(nextStatuses);
        setAllInvoices(combinedInvoices);
        setAllPayouts(combinedPayouts);
        setAllVendors(combinedVendors);
      });
    } catch (e) {
      console.error("Failed to aggregate connected data", e);
    }
  }, []);

  const refreshStatuses = useCallback(async () => {
    try {
      await fetchAllConnectedData();
    } catch (e) {
      console.error("Failed to refresh connection statuses", e);
    }
  }, [fetchAllConnectedData]);

  const fetchData = useCallback(async (providerToFetch?: ProviderType) => {
    const targetProvider = providerToFetch || currentProvider;
    setLoading(true);
    setError(null);
    setProviderErrors((prev) => ({ ...prev, [targetProvider]: null }));

    try {
      const adapter = accountingService.getAdapter(targetProvider);
      const status = await adapter.getStatus();
      
      setConnectionStatuses((prev) => ({
        ...prev,
        [targetProvider]: status,
      }));

      if (!status.connected) {
        setInvoices([]);
        setPayouts([]);
        setVendors([]);
        setLoading(false);
        fetchAllConnectedData();
        return;
      }

      const [invs, pays, vends] = await Promise.all([
        adapter.getInvoices().catch((e) => {
          setProviderErrors((prev) => ({ ...prev, [targetProvider]: e?.message || "Failed to fetch invoices" }));
          return [] as NormalizedInvoice[];
        }),
        adapter.getPayouts().catch((e) => {
          setProviderErrors((prev) => ({ ...prev, [targetProvider]: e?.message || "Failed to fetch payouts" }));
          return [] as NormalizedPayout[];
        }),
        adapter.getVendors().catch((e) => {
          setProviderErrors((prev) => ({ ...prev, [targetProvider]: e?.message || "Failed to fetch vendors" }));
          return [] as NormalizedVendor[];
        }),
      ]);

      startTransition(() => {
        setInvoices(invs);
        setPayouts(pays);
        setVendors(vends);
      });

      fetchAllConnectedData();
    } catch (err: any) {
      setError(err?.message || `Failed to fetch data for ${targetProvider}`);
      setProviderErrors((prev) => ({ ...prev, [targetProvider]: err?.message || "Failed to fetch data" }));
    } finally {
      setLoading(false);
    }
  }, [currentProvider, fetchAllConnectedData]);

  // Load connection statuses on mount
  useEffect(() => {
    refreshStatuses();
  }, [refreshStatuses]);

  // Fetch provider data on currentProvider change or when active connection status is refreshed
  useEffect(() => {
    fetchData();
  }, [currentProvider, fetchData]);

  const sync = async () => {
    setSyncing(true);
    try {
      const adapter = accountingService.getAdapter(currentProvider);
      await adapter.sync();
      await fetchData();
    } catch (err: any) {
      setError(err?.message || `Failed to sync ${currentProvider}`);
    } finally {
      setSyncing(false);
    }
  };

  const disconnect = async () => {
    setDisconnecting(true);
    try {
      const adapter = accountingService.getAdapter(currentProvider);
      const success = await adapter.disconnect();
      if (success) {
        const nextStatuses = {
          ...connectionStatuses,
          [currentProvider]: { connected: false, environment: "sandbox" },
        };
        setConnectionStatuses(nextStatuses);
        setInvoices([]);
        setPayouts([]);
        setVendors([]);
        await fetchAllConnectedData();
      }
    } catch (err: any) {
      setError(err?.message || `Failed to disconnect ${currentProvider}`);
    } finally {
      setDisconnecting(false);
    }
  };

  const setCurrentProvider = (provider: ProviderType) => {
    setCurrentProviderState(provider);
  };

  return (
    <AccountingContext.Provider
      value={{
        currentProvider,
        setCurrentProvider,
        invoices,
        payouts,
        vendors,
        allInvoices,
        allPayouts,
        allVendors,
        connectionStatuses,
        providerErrors,
        loading,
        syncing,
        disconnecting,
        error,
        fetchData,
        sync,
        disconnect,
        refreshStatuses,
      }}
    >
      {children}
    </AccountingContext.Provider>
  );
}

export function useAccounting() {
  const context = useContext(AccountingContext);
  if (!context) {
    throw new Error("useAccounting must be used within an AccountingProvider");
  }
  return context;
}
