"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { Download, Loader2, ChevronLeft } from "lucide-react";
import { cn } from "../../../lib/utils";

export default function PayoutsPage() {
  const [payouts, setPayouts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [qboConnected, setQboConnected] = useState(false);

  useEffect(() => {
    let active = true;
    fetch("/api/quickbooks/payouts", { cache: "no-store" })
      .then((res) => res.json())
      .then((data) => {
        if (!active) return;
        setQboConnected(data.connected);
        setPayouts(data.payouts || []);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Failed to fetch payouts page data:", err);
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, []);

  const totalAmount = payouts.reduce((acc, item) => {
    const num = Number(item.amount.replace(/[^0-9.-]+/g, ""));
    return acc + (isNaN(num) ? 0 : num);
  }, 0);

  const formattedTotal = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(totalAmount);

  return (
    <div className="mx-auto w-full max-w-[1048px] px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-6">
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-2 text-[14px] font-semibold text-[#8f8f8f] transition-colors hover:text-white"
        >
          <ChevronLeft className="h-4 w-4" />
          Back to Dashboard
        </Link>
      </div>

      <div>
        <h1 className="text-[34px] font-semibold leading-none text-white">
          Recent Payouts
        </h1>
        <p className="mt-[18px] text-[20px] leading-6 text-[#9b9b9b]">
          Full history of payouts sent to talent and agencies you owe a cut.
        </p>
      </div>

      <section className="mt-[29px] rounded-[13px] border border-[#676767] bg-black px-[29px] py-[31px]">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-[29px] font-semibold leading-none text-white">
              Payout History
            </h2>
          </div>

          <button
            type="button"
            className="inline-flex h-[40px] items-center justify-center gap-[12px] rounded-[7px] border border-[#5a5a5a] bg-[#0c0c0c] px-[16px] text-[16px] font-semibold text-white transition-colors hover:border-[#777]"
          >
            <Download className="h-4 w-4" />
            Export
          </button>
        </div>

        <div className="mt-[32px] overflow-x-auto">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-6 w-6 animate-spin text-[#8f8f8f]" />
            </div>
          ) : (
            <table className="min-w-[1000px] table-fixed text-left w-full">
              <colgroup>
                <col className="w-[260px]" />
                <col className="w-[200px]" />
                <col className="w-[140px]" />
                <col className="w-[120px]" />
                <col className="w-[140px]" />
                <col className="w-[140px]" />
              </colgroup>
              <thead>
                <tr className="h-[48px] border-b border-[#555] text-[17px] font-semibold leading-none text-[#8d8d8d]">
                  <th className="pl-[10px] pr-4">Recipient / Company</th>
                  <th>Detail</th>
                  <th>Method</th>
                  <th>Status</th>
                  <th>Date</th>
                  <th className="text-right pr-4">Amount</th>
                </tr>
              </thead>
              <tbody>
                {payouts.map((item, i) => (
                  <tr
                    key={`${item.name}-${i}`}
                    className="h-[64px] border-b border-[#303030] last:border-b-0 text-[17px] leading-none transition-colors hover:bg-white/[0.02]"
                  >
                    <td className="pl-[10px] pr-4">
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[8px] border border-[#303030] bg-[#060606]">
                          <span className="text-[14px] font-black text-white">{item.fallback}</span>
                        </div>
                        <div className="min-w-0">
                          <span className="font-semibold text-white truncate max-w-[200px] block">{item.name}</span>
                          <span className="text-[11px] text-[#7f7f7f] truncate max-w-[200px] block mt-0.5">{item.type || "Payout"}</span>
                        </div>
                      </div>
                    </td>
                    <td className="text-[#c8c8c8] truncate max-w-[180px]">{item.detail}</td>
                    <td className="text-[#b8b8b8]">{item.method || "Bank Transfer"}</td>
                    <td>
                      <span className="inline-flex h-6 items-center rounded-full border border-[#10b95f]/30 bg-[#082315] text-[#70ff9e] px-2.5 text-[10px] font-bold">
                        {item.status || "Paid"}
                      </span>
                    </td>
                    <td className="text-[#b8b8b8]">{item.date}</td>
                    <td className="text-right pr-4 font-semibold text-white">{item.amount}</td>
                  </tr>
                ))}
                {payouts.length === 0 && (
                  <tr>
                    <td colSpan={6} className="h-[120px] text-center text-[17px] text-[#8f8f8f]">
                      No payouts found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          )}
        </div>

        {!loading && payouts.length > 0 && (
          <div className="mt-6 flex justify-end">
            <div className="flex w-full max-w-[320px] items-center justify-between rounded-[9px] border border-[#303030] bg-[#060606] px-5 py-4">
              <span className="text-[17px] font-semibold text-[#8d8d8d]">Total Payouts</span>
              <span className="text-[24px] font-black tracking-tight text-white">
                {formattedTotal}
              </span>
            </div>
          </div>
        )}
      </section>
    </div>
  );
}
