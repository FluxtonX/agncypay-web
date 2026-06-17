"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { Download, Loader2, ChevronLeft } from "lucide-react";
import { cn } from "../../../lib/utils";

export default function VendorsPage() {
  const [vendors, setVendors] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [qboConnected, setQboConnected] = useState(false);

  useEffect(() => {
    let active = true;
    fetch("/api/quickbooks/vendors", { cache: "no-store" })
      .then((res) => res.json())
      .then((data) => {
        if (!active) return;
        setQboConnected(data.connected);
        setVendors(data.vendors || []);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Failed to fetch vendors page data:", err);
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, []);

  const totalBalance = vendors.reduce((acc, item) => {
    const num = Number(item.balance.replace(/[^0-9.-]+/g, ""));
    return acc + (isNaN(num) ? 0 : num);
  }, 0);

  const formattedTotal = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(totalBalance);

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
          Vendors Registry
        </h1>
        <p className="mt-[18px] text-[20px] leading-6 text-[#9b9b9b]">
          Manage vendor profiles, contact details, account numbers, and outstanding balances.
        </p>
      </div>

      <section className="mt-[29px] rounded-[13px] border border-[#676767] bg-black px-[29px] py-[31px]">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-[29px] font-semibold leading-none text-white">
              Vendor Contacts
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
            <table className="min-w-[900px] table-fixed text-left w-full">
              <colgroup>
                <col className="w-[280px]" />
                <col className="w-[240px]" />
                <col className="w-[140px]" />
                <col className="w-[120px]" />
                <col className="w-[120px]" />
              </colgroup>
              <thead>
                <tr className="h-[48px] border-b border-[#555] text-[17px] font-semibold leading-none text-[#8d8d8d]">
                  <th className="pl-[10px] pr-4">Vendor / Company</th>
                  <th>Contact Info</th>
                  <th>Account #</th>
                  <th className="text-right">Status</th>
                  <th className="text-right pr-4">Owed Balance</th>
                </tr>
              </thead>
              <tbody>
                {vendors.map((item, i) => (
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
                          <p className="font-semibold text-white truncate max-w-[200px]">{item.name}</p>
                          {item.company && <p className="text-[11px] text-[#7f7f7f] truncate max-w-[200px]">{item.company}</p>}
                        </div>
                      </div>
                    </td>
                    <td className="text-[#c8c8c8] truncate max-w-[220px]">
                      <p>{item.email}</p>
                      {item.phone && item.phone !== "No Phone" && <p className="text-[11px] text-[#7f7f7f]">{item.phone}</p>}
                    </td>
                    <td className="text-[#b8b8b8]">{item.acctNum}</td>
                    <td className="text-right">
                      <span className={cn(
                        "inline-flex h-6 items-center rounded-full border px-2.5 text-[10px] font-bold",
                        item.active
                          ? "border-[#10b95f]/30 bg-[#082315] text-[#70ff9e]"
                          : "border-[#3a3a3a] bg-[#1a1a1a] text-[#8f8f8f]"
                      )}>
                        {item.active ? "Active" : "Inactive"}
                      </span>
                    </td>
                    <td className="text-right pr-4 font-semibold text-white">{item.balance}</td>
                  </tr>
                ))}
                {vendors.length === 0 && (
                  <tr>
                    <td colSpan={5} className="h-[120px] text-center text-[17px] text-[#8f8f8f]">
                      No vendors found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          )}
        </div>

        {!loading && vendors.length > 0 && (
          <div className="mt-6 flex justify-end">
            <div className="flex w-full max-w-[320px] items-center justify-between rounded-[9px] border border-[#303030] bg-[#060606] px-5 py-4">
              <span className="text-[17px] font-semibold text-[#8d8d8d]">Total Owed</span>
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
