"use client";

import React, { useEffect, useState, useCallback } from "react";
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
  status: "Success" | "Failed";
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
                  <td className="px-[16px] py-[14px] text-[#b8b8b8]">
                    {new Date(log.date).toLocaleDateString()}
                  </td>
                  <td className="px-[16px] py-[14px] font-medium text-white">
                    {log.docNumber || "-"}
                  </td>
                  <td className="px-[16px] py-[14px] text-[#b8b8b8]">
                    {log.customerName || "-"}
                  </td>
                  <td className="px-[16px] py-[14px] font-medium text-white">
                    {new Intl.NumberFormat("en-US", {
                      style: "currency",
                      currency: log.currency || "USD",
                    }).format(log.amount || 0)}
                  </td>
                  <td className="px-[16px] py-[14px]">
                    {log.status === "Success" && (
                      <div className="flex items-center gap-1.5 text-green-500">
                        <CheckCircle2 className="h-4 w-4" />
                        <span className="font-medium">Success</span>
                      </div>
                    )}
                    {log.status === "Failed" && (
                      <div className="group relative flex cursor-help items-center gap-1.5 text-red-500">
                        <AlertTriangle className="h-4 w-4" />
                        <span className="border-b border-dashed border-red-500/50 font-medium">Failed</span>
                        <div className="pointer-events-none absolute bottom-full left-0 mb-2 w-[240px] opacity-0 transition-opacity group-hover:opacity-100">
                          <div className="rounded-[6px] bg-[#222] p-[10px] text-[13px] leading-tight text-white shadow-xl">
                            {log.error}
                          </div>
                        </div>
                      </div>
                    )}
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
