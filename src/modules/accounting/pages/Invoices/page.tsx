"use client";

import React, { useEffect, useState, startTransition, useCallback } from "react";
import { useApp } from "@/context/AppContext";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Modal } from "@/components/ui/Modal";
import {
  FileText,
  Plus,
  AlertCircle,
  CheckCircle2,
  Trash2,
  ChevronDown,
  ChevronRight,
  Loader2,
  ChevronLeft,
  Link2,
} from "lucide-react";
import { useRouter } from "next/navigation";
import Link from "next/link";

// Unified accounting hooks & types
import { useAccounting } from "../../hooks/useAccounting";
import { ProviderType } from "../../types";

const invoiceFormSchema = z.object({
  invoiceId: z.string().trim().min(1, "Invoice number is required"),
  clientName: z.string().trim().min(1, "Client name is required"),
  amount: z
    .string()
    .trim()
    .min(1, "Amount is required")
    .refine((val) => !isNaN(Number(val)) && Number(val) > 0, "Amount must be a positive number"),
  description: z.string().trim().min(1, "Description is required"),
  enableSplits: z.boolean(),
  splits: z
    .array(
      z.object({
        walletId: z.string().trim().min(1, "Wallet ID is required"),
        ratio: z
          .string()
          .trim()
          .min(1, "Ratio is required")
          .refine((val) => !isNaN(Number(val)) && Number(val) > 0 && Number(val) < 1, "Ratio must be between 0 and 1"),
        description: z.string().trim().optional(),
      })
    )
    .optional(),
});

type InvoiceFormInput = z.infer<typeof invoiceFormSchema>;

interface BackendPayment {
  id: string;
  externalId: string;
  source: string;
  amount: string;
  currency: string;
  status: string;
  invoiceId: string;
  invoiceData: {
    clientName?: string;
  } | null;
  description: string;
  createdAt: string;
  isManual?: boolean;
  logo?: string;
}

interface GroupedInvoice {
  name: string;
  totalAmount: number;
  status: "Paid" | "Pending";
  latestDate: string;
  items: any[];
}

const getProviderDetails = (provider: ProviderType) => {
  switch (provider) {
    case "quickbooks":
      return { name: "QuickBooks", logo: "/quickbook.png" };
    case "xero":
      return { name: "Xero", logo: "/xero.png" };
    case "sage":
      return { name: "Sage", logo: "/sage.png" };
  }
};

export function InvoicesPage() {
  const { state } = useApp();
  const role = state.user?.accountType || "brand";
  const router = useRouter();
  const [payments, setPayments] = useState<BackendPayment[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [selectedInvoice, setSelectedInvoice] = useState<any | null>(null);

  // Provider Invoices state from unified store
  const { currentProvider, allInvoices, loading: loadingProvider, connectionStatuses, error: providerError } = useAccounting();
  const [expandedNames, setExpandedNames] = useState<string[]>([]);

  const anyConnected = Object.values(connectionStatuses).some(status => status?.connected);

  const toggleExpand = (name: string) => {
    setExpandedNames((prev) =>
      prev.includes(name) ? prev.filter((n) => n !== name) : [...prev, name]
    );
  };

  const groupedProviderInvoices = React.useMemo(() => {
    const groups: { [key: string]: any } = {};
    allInvoices.forEach((inv) => {
      // Group key includes provider to isolate same-named clients across platforms
      const key = `${inv.name}_${inv.provider}`;
      if (!groups[key]) {
        groups[key] = {
          name: inv.name,
          totalAmount: 0,
          status: "Paid",
          latestDate: inv.date,
          items: [],
          provider: inv.provider,
        };
      }
      const g = groups[key];
      g.totalAmount += inv.amount;
      g.items.push(inv);
      if (inv.status === "Pending") {
        g.status = "Pending";
      }
      if (new Date(inv.date) > new Date(g.latestDate)) {
        g.latestDate = inv.date;
      }
    });
    
    // Sort: QuickBooks first, then Xero, then Sage
    const providerOrder: Record<string, number> = { quickbooks: 1, xero: 2, sage: 3 };
    return Object.values(groups).sort((a: any, b: any) => {
      const orderA = providerOrder[a.provider] || 99;
      const orderB = providerOrder[b.provider] || 99;
      if (orderA !== orderB) {
        return orderA - orderB;
      }
      return b.totalAmount - a.totalAmount;
    });
  }, [allInvoices]);

  const {
    register,
    handleSubmit,
    control,
    watch,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<InvoiceFormInput>({
    resolver: zodResolver(invoiceFormSchema),
    defaultValues: {
      invoiceId: "",
      clientName: "",
      amount: "",
      description: "",
      enableSplits: false,
      splits: [],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: "splits",
  });

  const enableSplits = watch("enableSplits");

  const fetchPayments = useCallback(async () => {
    if (!state.user?.uid) return;
    try {
      const res = await fetch(`/api/payments/wallet/${state.user.uid}`, {
        headers: {
          Authorization: `Bearer dummy-token`,
        },
      });
      const body = await res.json();
      if (res.ok) {
        const rawPayments = body.data || [];
        const nonManual = rawPayments.filter((p: any) => p.source !== "MANUAL");
        
        const groupedManual: { [vendor: string]: any } = {};
        for (const p of rawPayments) {
          if (p.source !== "MANUAL") continue;
          const vendorName = p.metadata?.vendor || "Digital Sales";
          const amount = parseFloat(p.amount);
          const createdAt = new Date(p.createdAt);

          if (groupedManual[vendorName]) {
            groupedManual[vendorName].amount = (parseFloat(groupedManual[vendorName].amount) + amount).toString();
            if (createdAt > new Date(groupedManual[vendorName].createdAt)) {
              groupedManual[vendorName].createdAt = p.createdAt;
              groupedManual[vendorName].status = p.status;
            }
          } else {
            groupedManual[vendorName] = {
              id: p.id,
              invoiceId: p.externalId?.split("-").slice(1).join("-").toUpperCase() || "CSV",
              invoiceData: {
                clientName: vendorName
              },
              description: p.description || "Manual File Ingestion",
              createdAt: p.createdAt,
              amount: p.amount,
              status: p.status,
              source: "MANUAL",
              isManual: true,
              logo: `https://t3.gstatic.com/faviconV2?client=SOCIAL&type=FAVICON&fallback_opts=TYPE,SIZE,URL&url=http://${vendorName.toLowerCase().replace(/[^a-z0-9]/g, '')}.com&size=128`
            };
          }
        }
        
        const combined = [...nonManual, ...Object.values(groupedManual)];
        combined.sort((a, b) => parseFloat(b.amount) - parseFloat(a.amount));

        startTransition(() => {
          setPayments(combined);
        });
      }
    } catch (err) {
      console.error("Failed to fetch payments:", err);
    } finally {
      startTransition(() => {
        setLoading(false);
      });
    }
  }, [state.user?.uid]);

  useEffect(() => {
    fetchPayments();
  }, [fetchPayments]);

  const onSubmit = async (data: InvoiceFormInput) => {
    setSubmitError(null);
    setSuccessMessage(null);

    try {
      let splitConfig = undefined;
      if (data.enableSplits && data.splits && data.splits.length > 0) {
        splitConfig = {
          participants: data.splits.map((s) => ({
            walletId: s.walletId,
            ratio: s.ratio,
            description: s.description,
          })),
        };
      }

      const payload = {
        externalId: `MAN-${Date.now()}-${data.invoiceId}`,
        source: "MANUAL" as const,
        walletId: state.user?.uid,
        amount: data.amount,
        invoiceId: data.invoiceId,
        invoiceData: {
          clientName: data.clientName,
        },
        splitConfig,
        description: data.description,
      };

      const res = await fetch("/api/payments", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer dummy-token`,
        },
        body: JSON.stringify(payload),
      });

      const body = await res.json();
      if (!res.ok) {
        throw new Error(body.message || "Failed to create invoice.");
      }

      setSuccessMessage("Invoice successfully created and ledger updated!");
      reset();
      fetchPayments();
      setTimeout(() => {
        setIsModalOpen(false);
        setSuccessMessage(null);
      }, 1500);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "An unexpected error occurred.";
      setSubmitError(msg);
    }
  };

  const totalAmount = payments.reduce((sum, p) => sum + parseFloat(p.amount), 0);

  return (
    <div className="space-y-6 select-text">
      {/* Back Button */}
      <div>
        <Link 
          href={`/providers/${currentProvider}/dashboard`}
          className="inline-flex items-center gap-1 text-xs font-bold text-neutral-500 hover:text-white transition-colors"
        >
          <ChevronLeft className="h-4 w-4" />
          Back to Dashboard
        </Link>
      </div>

      {/* Upper header action */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-white">Invoices & Deposits</h2>
          <p className="text-xs font-semibold text-neutral-400 mt-1">
            Manage your network ledger invoices and process payments.
          </p>
        </div>
        <Button
          onClick={() => {
            reset();
            setIsModalOpen(true);
          }}
          className="h-9 px-4 text-xs font-bold gap-1.5"
        >
          <Plus className="h-4 w-4" />
          Create Invoice
        </Button>
      </div>

      {/* Main Grid */}
      <Card className="p-6">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-xs font-bold uppercase tracking-wider text-neutral-400">
            Invoice Ledger Log
          </h3>
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-12">
            <span className="h-8 w-8 rounded-full border-2 border-white/20 border-t-white animate-spin mb-3" />
            <p className="text-xs text-neutral-500">Querying ledger records...</p>
          </div>
        ) : payments.length === 0 ? (
          <div className="flex flex-col items-center justify-center text-center py-16 border border-dashed border-[#3a3a3a] rounded-xl bg-white/[0.01]">
            <FileText className="h-10 w-10 text-neutral-600 mb-4 stroke-[1.5]" />
            <h4 className="text-sm font-bold text-white mb-1">No invoices found</h4>
            <p className="text-xs text-neutral-400 max-w-[280px] leading-relaxed mb-6">
              Create your first invoice to initialize transactions on your double-entry ledger.
            </p>
            <Button
              onClick={() => setIsModalOpen(true)}
              className="h-8 px-3.5 text-xs font-bold"
            >
              Get Started
            </Button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-semibold text-neutral-300">
              <thead>
                <tr className="border-b border-[#3a3a3a] pb-3 text-neutral-500">
                  <th className="py-3 w-[120px]">Invoice ID</th>
                  <th className="py-3 w-[140px]">Client</th>
                  <th className="py-3">Description</th>
                  <th className="py-3 w-[120px]">Date Created</th>
                  <th className="py-3 w-[100px]">Amount</th>
                  <th className="py-3 w-[100px]">Status</th>
                  <th className="py-3 text-right pr-4 w-[80px]">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#3a3a3a]">
                {payments.map((p) => {
                  const rawId = p.invoiceId || p.externalId || "CSV";
                  const displayId = rawId.length > 10 ? rawId.substring(0, 7) + "..." : rawId;
                  return (
                    <tr key={p.id} className="hover:bg-white/[0.01] transition-colors group">
                      <td className="py-3.5 font-mono text-white">
                        {displayId}
                      </td>
                      <td className="py-3.5 text-white max-w-[135px]">
                        <div className="flex items-center gap-2 min-w-0">
                          {p.isManual && (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img 
                              src={p.logo} 
                              alt={p.invoiceData?.clientName || "Manual"} 
                              className="h-5 w-5 object-contain rounded shrink-0"
                              onError={(e) => {
                                // Fallback to generic icon if image fails to load
                                (e.target as HTMLImageElement).src = "/music-file.png";
                              }}
                            />
                          )}
                          <span 
                            className="truncate block flex-1 max-w-[100px]" 
                            title={p.invoiceData?.clientName || "Manual Client"}
                          >
                            {p.invoiceData?.clientName || "Manual Client"}
                          </span>
                        </div>
                      </td>
                      <td className="py-3.5 text-neutral-400">
                        <span className="truncate block max-w-[160px]" title={p.description}>
                          {p.description}
                        </span>
                      </td>
                      <td className="py-3.5 text-neutral-500">
                        {new Date(p.createdAt).toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                        })}
                      </td>
                      <td className="py-3.5 text-white font-mono">${parseFloat(p.amount).toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
                      <td className="py-3.5">
                        <Badge
                          variant={p.status === "SETTLED" ? "success" : "warning"}
                          className="capitalize"
                        >
                          {p.status.toLowerCase()}
                        </Badge>
                      </td>
                      <td className="py-3.5 text-right pr-4">
                        <button
                          type="button"
                          onClick={() => setSelectedInvoice({
                            id: p.id,
                            docNumber: rawId,
                            name: p.invoiceData?.clientName || "Manual Client",
                            provider: p.source ? p.source.toLowerCase() : "manual",
                            date: new Date(p.createdAt).toLocaleDateString("en-US", {
                              month: "short",
                              day: "numeric",
                              year: "numeric",
                            }),
                            amount: parseFloat(p.amount),
                            status: p.status === "SETTLED" ? "Paid" : "Pending",
                            description: p.description
                          })}
                          className="h-6 px-2.5 bg-neutral-900 border border-[#3a3a3a] text-white hover:bg-white hover:text-black font-bold rounded text-[10px] transition-all cursor-pointer inline-flex items-center justify-center opacity-0 group-hover:opacity-100"
                        >
                          View
                        </button>
                      </td>
                    </tr>
                  );
                })}

                {/* Summary Total Row */}
                <tr className="bg-white/[0.02] border-t-2 border-[#3a3a3a] font-bold">
                  <td className="py-4 text-white font-bold">Total</td>
                  <td className="py-4"></td>
                  <td className="py-4"></td>
                  <td className="py-4"></td>
                  <td className="py-4 text-white font-mono font-bold">
                    ${totalAmount.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                  </td>
                  <td className="py-4"></td>
                  <td className="py-4"></td>
                </tr>
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {/* Provider Synced Invoices Card */}
      <Card className="p-6">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-neutral-400">
              Synced Invoices
            </h3>
            <p className="text-[10px] text-neutral-500 mt-1">Grouped by platform client. Sorted by QuickBooks first, then Xero.</p>
          </div>
        </div>

        {loadingProvider ? (
          <div className="flex flex-col items-center justify-center py-12">
            <Loader2 className="h-8 w-8 text-neutral-500 animate-spin mb-3" />
            <p className="text-xs text-neutral-500">Querying platform invoices...</p>
          </div>
        ) : providerError ? (
          <div className="text-xs text-red-400 font-medium py-6 text-center">{providerError}</div>
        ) : !anyConnected ? (
          <div className="flex flex-col items-center justify-center text-center py-16 border border-dashed border-[#3a3a3a] rounded-xl bg-white/[0.01]">
            <Link2 className="h-10 w-10 text-neutral-600 mb-4 stroke-[1.5] opacity-40" />
            <h4 className="text-sm font-bold text-white mb-1">No accounting platforms are connected</h4>
            <p className="text-xs text-neutral-400 max-w-[280px] leading-relaxed mb-6">
              Connect a QuickBooks or Xero integration to view and settle your invoices.
            </p>
            <Link href="/dashboard/integrations">
              <Button className="h-9 px-4 text-xs font-bold">Connect a Platform</Button>
            </Link>
          </div>
        ) : groupedProviderInvoices.length === 0 ? (
          <div className="flex flex-col items-center justify-center text-center py-16 border border-dashed border-[#3a3a3a] rounded-xl bg-white/[0.01]">
            <FileText className="h-10 w-10 text-neutral-600 mb-4 stroke-[1.5]" />
            <h4 className="text-sm font-bold text-white mb-1">No synced invoices found</h4>
            <p className="text-xs text-neutral-400 max-w-[280px]">
              No active invoices found in your connected workspaces.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-semibold text-neutral-300">
              <thead>
                <tr className="border-b border-[#3a3a3a] pb-3 text-neutral-500">
                  <th className="py-3 pl-2 w-8"></th>
                  <th className="py-3">Platform / Client</th>
                  <th className="py-3">Invoice Count</th>
                  <th className="py-3">Latest Date</th>
                  <th className="py-3">Total Amount</th>
                  <th className="py-3 text-right pr-2">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#3a3a3a]">
                {groupedProviderInvoices.map((group) => {
                  const isExpanded = expandedNames.includes(group.name);
                  return (
                    <React.Fragment key={group.name}>
                      <tr
                        onClick={() => toggleExpand(group.name)}
                        className="hover:bg-white/[0.01] transition-colors cursor-pointer select-none"
                      >
                        <td className="py-4 pl-2 text-neutral-500">
                          {isExpanded ? (
                            <ChevronDown className="h-4 w-4" />
                          ) : (
                            <ChevronRight className="h-4 w-4" />
                          )}
                        </td>
                        <td className="py-4 font-bold text-white">
                          <div className="flex items-center gap-2">
                            <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded bg-neutral-900 border border-[#2a2a2a] p-1">
                              {/* eslint-disable-next-line @next/next/no-img-element */}
                              <img src={getProviderDetails(group.provider)?.logo} alt={group.provider} className="h-full w-full object-contain" />
                            </div>
                            {group.name}
                          </div>
                        </td>
                        <td className="py-4 text-neutral-400">{group.items.length} invoice{group.items.length !== 1 ? "s" : ""}</td>
                        <td className="py-4 text-neutral-500">{group.latestDate}</td>
                        <td className="py-4 text-white font-mono">
                          ${group.totalAmount.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                        </td>
                        <td className="py-4 text-right pr-2">
                          <Badge
                            variant={group.status === "Paid" ? "success" : "warning"}
                            className="capitalize"
                          >
                            {group.status.toLowerCase()}
                          </Badge>
                        </td>
                      </tr>

                      {isExpanded && (
                        <tr>
                          <td colSpan={6} className="bg-neutral-950/40 p-4 border-t border-[#222]">
                            <div className="rounded-lg border border-[#2a2a2a] bg-black/60 overflow-hidden">
                              <table className="w-full text-left text-[11px] text-neutral-400">
                                <thead>
                                  <tr className="border-b border-[#2a2a2a] bg-neutral-900/50 text-neutral-500">
                                    <th className="px-4 py-2">Invoice ID</th>
                                    <th className="px-4 py-2">Detail</th>
                                    <th className="px-4 py-2">Date Created</th>
                                    <th className="px-4 py-2">Due Status</th>
                                    <th className="px-4 py-2">Amount</th>
                                    <th className="px-4 py-2">Status</th>
                                    <th className="px-4 py-2 text-right pr-4">Action</th>
                                  </tr>
                                </thead>
                                <tbody className="divide-y divide-[#2a2a2a]">
                                  {group.items.map((item: any) => (
                                    <tr key={item.id} className="hover:bg-white/[0.01]">
                                      <td className="px-4 py-2.5 font-mono text-white">#{item.docNumber}</td>
                                      <td className="px-4 py-2.5 max-w-[200px] truncate">{item.detail}</td>
                                      <td className="px-4 py-2.5">{item.date}</td>
                                      <td className="px-4 py-2.5 text-neutral-500">{item.daysText}</td>
                                      <td className="px-4 py-2.5 font-mono text-white">${item.amount.toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
                                      <td className="px-4 py-2.5">
                                        <Badge
                                          variant={item.status === "Paid" ? "success" : "warning"}
                                          className="text-[9px] px-1.5 py-0 capitalize"
                                        >
                                          {item.status.toLowerCase()}
                                        </Badge>
                                      </td>
                                      <td className="px-4 py-2.5 text-right pr-4">
                                        {/* @ts-ignore */}
                                        {["talent", "individual", "talent_independent", "talent_agency"].includes(role) ? (
                                          <button
                                            type="button"
                                            onClick={(e) => {
                                              e.stopPropagation();
                                              setSelectedInvoice(item);
                                            }}
                                            className="h-6 px-2.5 bg-white text-black hover:bg-neutral-200 font-bold rounded text-[10px] transition-all cursor-pointer inline-flex items-center justify-center hover:scale-[1.02] active:scale-[0.98]"
                                          >
                                            View Details
                                          </button>
                                        ) : (item.status === "Pending" || item.status === "pending") ? (
                                          <button
                                            type="button"
                                            onClick={(e) => {
                                              e.stopPropagation();
                                              router.push(`/dashboard/pay-flow/${item.id}`);
                                            }}
                                            className="h-6 px-2.5 bg-white text-black hover:bg-neutral-200 font-bold rounded text-[10px] transition-all cursor-pointer inline-flex items-center justify-center hover:scale-[1.02] active:scale-[0.98]"
                                          >
                                            Pay Now
                                          </button>
                                        ) : role === "agency" && (item.status === "Paid" || item.status === "paid" || item.status === "Settled") ? (
                                          <button
                                            type="button"
                                            onClick={(e) => {
                                              e.stopPropagation();
                                              router.push(`/payout/${item.id}?returnTo=dashboard`);
                                            }}
                                            className="h-6 px-2.5 bg-[#4B6BFB] text-white hover:bg-[#5b7bfb] font-bold rounded text-[10px] transition-all cursor-pointer inline-flex items-center justify-center hover:scale-[1.02] active:scale-[0.98]"
                                          >
                                            Payout Talent (85%)
                                          </button>
                                        ) : (
                                          <span className="text-[10px] text-neutral-600 font-medium">No action</span>
                                        )}
                                      </td>
                                    </tr>
                                  ))}
                                </tbody>
                              </table>
                            </div>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {/* Slide-over/Modal Form for Creating Invoices */}
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Create New Ledger Invoice">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          {submitError && (
            <div className="flex items-start gap-2.5 rounded-lg border border-red-500/20 bg-red-500/5 p-3.5 text-xs text-red-400 leading-relaxed">
              <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
              <span>{submitError}</span>
            </div>
          )}

          {successMessage && (
            <div className="flex items-start gap-2.5 rounded-lg border border-emerald-500/20 bg-emerald-500/5 p-3.5 text-xs text-emerald-400 leading-relaxed">
              <CheckCircle2 className="h-4 w-4 shrink-0 mt-0.5" />
              <span>{successMessage}</span>
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <Input
              {...register("invoiceId")}
              id="invoiceId"
              label="Invoice Number"
              placeholder="e.g. INV-1002"
              error={errors.invoiceId?.message}
            />
            <Input
              {...register("amount")}
              id="amount"
              label="Amount (USD)"
              placeholder="e.g. 5000.00"
              error={errors.amount?.message}
            />
          </div>

          <Input
            {...register("clientName")}
            id="clientName"
            label="Client Name"
            placeholder="e.g. Adidas Group"
            error={errors.clientName?.message}
          />

          <Input
            {...register("description")}
            id="description"
            label="Campaign Description"
            placeholder="e.g. Q3 Creative Content Deliverables"
            error={errors.description?.message}
          />

          {/* Revenue splits orchestration setup */}
          <div className="border-t border-[#3a3a3a] pt-4 mt-2">
            <label className="flex items-center gap-2.5 text-xs font-semibold text-neutral-300 select-none cursor-pointer">
              <input
                type="checkbox"
                {...register("enableSplits")}
                className="h-4 w-4 rounded border-neutral-800 bg-neutral-950 text-white accent-white cursor-pointer"
              />
              <span>Configure Revenue Splits Orchestration</span>
            </label>

            {enableSplits && (
              <div className="mt-4 space-y-4 rounded-lg bg-neutral-950/60 border border-[#3a3a3a] p-4">
                <div className="flex justify-between items-center">
                  <h4 className="text-[11px] font-bold uppercase tracking-wider text-neutral-400">
                    Split Participants
                  </h4>
                  <Button
                    type="button"
                    variant="ghost"
                    onClick={() => append({ walletId: "", ratio: "", description: "" })}
                    className="h-7 px-2 text-[10px] gap-1 hover:text-white border border-[#3a3a3a]"
                  >
                    <Plus className="h-3 w-3" /> Add Participant
                  </Button>
                </div>

                {fields.length === 0 && (
                  <p className="text-[10px] text-neutral-500 italic">No split partners added yet. Click Add to define ratio.</p>
                )}

                {fields.map((field, index) => (
                  <div key={field.id} className="grid grid-cols-[1fr_80px_1fr_40px] gap-3 items-end">
                    <Input
                      {...register(`splits.${index}.walletId` as const)}
                      placeholder="Wallet ID"
                      label={index === 0 ? "Target Wallet ID" : undefined}
                      error={errors.splits?.[index]?.walletId?.message}
                      containerClassName="min-w-0"
                    />
                    <Input
                      {...register(`splits.${index}.ratio` as const)}
                      placeholder="e.g. 0.8"
                      label={index === 0 ? "Ratio" : undefined}
                      error={errors.splits?.[index]?.ratio?.message}
                      containerClassName="min-w-0"
                    />
                    <Input
                      {...register(`splits.${index}.description` as const)}
                      placeholder="Talent Payout"
                      label={index === 0 ? "Description" : undefined}
                      containerClassName="min-w-0"
                    />
                    <button
                      type="button"
                      onClick={() => remove(index)}
                      className="flex h-11 w-full items-center justify-center text-neutral-500 hover:text-red-400 transition-colors cursor-pointer border border-neutral-900 rounded-lg hover:border-red-500/20 bg-neutral-950"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <Button type="submit" isLoading={isSubmitting} className="w-full py-3 mt-4">
            Provision & Submit Invoice
          </Button>
        </form>
      </Modal>

      {/* Modal: View Details (Talent only) */}
      {selectedInvoice && (
        <Modal isOpen={!!selectedInvoice} onClose={() => setSelectedInvoice(null)} title="Invoice Details">
          <div className="space-y-4 text-xs font-semibold text-neutral-300">
            <div className="flex justify-between py-2 border-b border-[#222]">
              <span className="text-neutral-500">Invoice Number</span>
              <span className="text-white font-bold">#{selectedInvoice.docNumber}</span>
            </div>
            <div className="flex justify-between py-2 border-b border-[#222]">
              <span className="text-neutral-500">Brand / Client</span>
              <span className="text-white font-bold">{selectedInvoice.name || "Default Client"}</span>
            </div>
            <div className="flex justify-between py-2 border-b border-[#222]">
              <span className="text-neutral-500">Source Provider</span>
              <span className="text-white capitalize font-bold">
                {selectedInvoice.provider === 'quickbooks' ? 'QuickBooks Online' : selectedInvoice.provider === 'xero' ? 'Xero' : selectedInvoice.provider}
              </span>
            </div>
            <div className="flex justify-between py-2 border-b border-[#222]">
              <span className="text-neutral-500">Invoice Date</span>
              <span className="text-neutral-400">{selectedInvoice.date}</span>
            </div>
            <div className="flex justify-between py-2 border-b border-[#222]">
              <span className="text-neutral-500">Amount</span>
              <span className="text-white font-mono font-bold">
                ${selectedInvoice.amount.toLocaleString(undefined, { minimumFractionDigits: 2 })}
              </span>
            </div>
            <div className="flex justify-between py-2">
              <span className="text-neutral-500">Status</span>
              <Badge variant={selectedInvoice.status === "Paid" ? "success" : "warning"} className="capitalize">
                {selectedInvoice.status.toLowerCase()}
              </Badge>
            </div>
            
            {selectedInvoice.description && (
              <div className="flex justify-between py-2 border-t border-[#222]">
                <span className="text-neutral-500">Description</span>
                <span className="text-white font-medium max-w-[240px] text-right break-words">{selectedInvoice.description}</span>
              </div>
            )}
            
            {/* Future NetXero financing action placeholders */}
            {/* 
            <div className="pt-2 border-t border-[#222] space-y-2">
              <span className="block text-[10px] text-neutral-500 font-bold uppercase tracking-wider">NetXero Financing Options</span>
              <Button disabled className="w-full h-8 text-[10px]">Withdraw Early (Not Eligible)</Button>
              <Button disabled className="w-full h-8 text-[10px]">Request Advance</Button>
            </div>
            */}

            <div className="pt-4 flex gap-3">
              <Button
                variant="secondary"
                onClick={() => setSelectedInvoice(null)}
                className="w-full h-9 font-bold cursor-pointer"
              >
                Close
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}

export default InvoicesPage;
