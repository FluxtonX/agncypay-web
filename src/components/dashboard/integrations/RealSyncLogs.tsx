"use client";

import React, { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { AlertTriangle, CheckCircle2, Loader2, RefreshCw } from "lucide-react";

type SyncLog = {
  id: string;
  date: string;
  itemName: string;
  docNumber?: string;
  customerName?: string;
  amount?: number;
  currency?: string;
  itemType: string;
  status: "Success" | "Failed" | "Paid" | "Pending" | "Overdue";
  error?: string;
};

export function RealSyncLogs({ refreshKey }: { refreshKey: number }) {
  const [logs, setLogs] = useState<SyncLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchLogs = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/quickbooks/logs");
      if (!res.ok) {
        throw new Error("Failed to fetch logs. Are you connected to QuickBooks?");
      }
      const data = await res.json();
      setLogs(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchLogs();
  }, [fetchLogs, refreshKey]);

  const getRowHref = (log: SyncLog) => {
    if (log.status === "Paid" || log.status === "Success") {
      return `/receipt/${log.id}?tx=TX-AP-QBO-${log.id}&mode=logged_in&returnTo=dashboard`;
    }
    return `/dashboard/pay-flow/${log.id}`;
  };

  return (
    <section className="rounded-[13px] border border-[#303030] bg-black p-[28px]">
      <div className="flex items-center justify-between">
        <h2 className="text-[20px] font-semibold text-white">Recent Sync Logs</h2>
        <button
          onClick={fetchLogs}
          disabled={loading}
          className="inline-flex h-[32px] items-center gap-2 rounded-[6px] border border-[#222] bg-[#0c0c0c] px-[12px] text-[13px] font-medium text-[#b8b8b8] transition-colors hover:border-[#444] hover:text-white disabled:opacity-50"
        >
          <RefreshCw className={`h-3.5 w-3.5 ${loading ? "animate-spin" : ""}`} />
          Refresh
        </button>
      </div>

      <div className="mt-[20px] overflow-hidden rounded-[8px] border border-[#222]">
        <table className="w-full text-left text-[14px]">
          <thead className="border-b border-[#222] bg-[#0a0a0a]">
            <tr>
              <th className="px-[16px] py-[12px] font-medium text-[#9b9b9b]">Date</th>
              <th className="px-[16px] py-[12px] font-medium text-[#9b9b9b]">No.</th>
              <th className="px-[16px] py-[12px] font-medium text-[#9b9b9b]">Customer</th>
              <th className="px-[16px] py-[12px] font-medium text-[#9b9b9b]">Amount</th>
              <th className="px-[16px] py-[12px] font-medium text-[#9b9b9b]">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#222]">
            {loading ? (
              <tr>
                <td colSpan={5} className="px-[16px] py-[40px] text-center text-[#888]">
                  <Loader2 className="mx-auto mb-2 h-6 w-6 animate-spin text-[#555]" />
                  Fetching live data from QuickBooks...
                </td>
              </tr>
            ) : error ? (
              <tr>
                <td colSpan={5} className="px-[16px] py-[40px] text-center text-red-500">
                  <AlertTriangle className="mx-auto mb-2 h-6 w-6" />
                  {error}
                </td>
              </tr>
            ) : logs.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-[16px] py-[40px] text-center text-[#888]">
                  No recent activity found in QuickBooks.
                </td>
              </tr>
            ) : (
              logs.map((log) => (
                <tr key={log.id} className="bg-black transition-colors hover:bg-[#0c0c0c]">
                  <td colSpan={5} className="p-0">
                    <Link
                      href={getRowHref(log)}
                      className="flex items-center w-full"
                    >
                      <span className="px-[16px] py-[14px] text-[#b8b8b8] flex-1 min-w-[100px]">
                        {new Date(log.date).toLocaleDateString()}
                      </span>
                      <span className="px-[16px] py-[14px] font-medium text-white flex-1 min-w-[60px]">
                        {log.docNumber || "-"}
                      </span>
                      <span className="px-[16px] py-[14px] text-[#b8b8b8] flex-[2] min-w-[120px]">
                        {log.customerName || "-"}
                      </span>
                      <span className="px-[16px] py-[14px] font-medium text-white flex-1 min-w-[100px]">
                        {new Intl.NumberFormat("en-US", {
                          style: "currency",
                          currency: log.currency || "USD",
                        }).format(log.amount || 0)}
                      </span>
                      <span className="px-[16px] py-[14px] flex-1 min-w-[100px]">
                        {(log.status === "Success" || log.status === "Paid") && (
                          <span className="flex items-center gap-1.5 text-green-500">
                            <CheckCircle2 className="h-4 w-4" />
                            <span className="font-medium">{log.status === "Success" ? "Success" : "Paid"}</span>
                          </span>
                        )}
                        {log.status === "Failed" && (
                          <span className="flex items-center gap-1.5 text-red-500">
                            <AlertTriangle className="h-4 w-4" />
                            <span className="font-medium">Failed</span>
                          </span>
                        )}
                        {log.status === "Overdue" && (
                          <span className="flex items-center gap-1.5 text-red-500">
                            <AlertTriangle className="h-4 w-4" />
                            <span className="font-medium">Overdue</span>
                          </span>
                        )}
                        {log.status === "Pending" && (
                          <span className="flex items-center gap-1.5 text-amber-500">
                            <span className="h-2 w-2 rounded-full bg-amber-500 animate-pulse" />
                            <span className="font-medium">Pending</span>
                          </span>
                        )}
                      </span>
                    </Link>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
}
