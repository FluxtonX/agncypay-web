"use client";

import React, { useState } from "react";
import { Download } from "lucide-react";
import { cn } from "../../../lib/utils";
import { useDynamicIncomes, modelIncomeItems, RemoteBrandImage } from "../../../components/dashboard/ModelAgencyDashboard";

export default function IncomesPage() {
  const dynamicIncomes = useDynamicIncomes();
  const allIncomes = dynamicIncomes.length > 0 ? dynamicIncomes : modelIncomeItems;

  const totalAmount = allIncomes.reduce((acc, item) => {
    const num = Number(item.amount.replace(/[^0-9.-]+/g, ""));
    return acc + (isNaN(num) ? 0 : num);
  }, 0);

  const formattedTotal = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(totalAmount);

  return (
    <div className="mx-auto w-full max-w-[1048px] px-4 py-8 sm:px-6 lg:px-8">
      <div>
        <h1 className="text-[34px] font-semibold leading-none text-white">
          Recent Incomes
        </h1>
        <p className="mt-[18px] text-[20px] leading-6 text-[#9b9b9b]">
          Full history of your income and parsed vendor payouts.
        </p>
      </div>

      <section className="mt-[29px] rounded-[13px] border border-[#676767] bg-black px-[29px] py-[31px]">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-[29px] font-semibold leading-none text-white">
              Income History
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
          <table className="min-w-[900px] table-fixed text-left w-full">
            <colgroup>
              <col className="w-[280px]" />
              <col className="w-[220px]" />
              <col className="w-[180px]" />
              <col className="w-[180px]" />
            </colgroup>
            <thead>
              <tr className="h-[48px] border-b border-[#555] text-[17px] font-semibold leading-none text-[#8d8d8d]">
                <th className="pl-[10px] pr-4">Source / Vendor</th>
                <th>Detail</th>
                <th>Date</th>
                <th className="text-right pr-4">Amount</th>
              </tr>
            </thead>
            <tbody>
              {allIncomes.map((item, i) => (
                <tr
                  key={`${item.name}-${i}`}
                  className="h-[64px] border-b border-[#303030] last:border-b-0 text-[17px] leading-none transition-colors hover:bg-white/[0.02]"
                >
                  <td className="pl-[10px] pr-4">
                    <div className="flex items-center gap-3">
                      <div className={cn("flex h-10 w-10 shrink-0 items-center justify-center rounded-[8px] border border-[#303030] bg-[#060606] p-[2px]")}>
                        <div className={cn("h-full w-full overflow-hidden rounded-[6px]", item.className)}>
                          <RemoteBrandImage src={item.src} alt={item.name} fallback={item.fallback} className="h-full w-full" imageClassName={item.imageClassName} />
                        </div>
                      </div>
                      <span className="font-semibold text-white truncate max-w-[200px]">{item.name}</span>
                    </div>
                  </td>
                  <td className="text-[#c8c8c8]">{item.detail}</td>
                  <td className="text-[#b8b8b8]">{item.date}</td>
                  <td className="text-right pr-4 font-semibold text-[#13d463]">{item.amount}</td>
                </tr>
              ))}
              {allIncomes.length === 0 && (
                <tr>
                  <td colSpan={4} className="h-[120px] text-center text-[17px] text-[#8f8f8f]">
                    No incomes found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {allIncomes.length > 0 && (
          <div className="mt-6 flex justify-end">
            <div className="flex w-full max-w-[320px] items-center justify-between rounded-[9px] border border-[#303030] bg-[#060606] px-5 py-4">
              <span className="text-[17px] font-semibold text-[#8d8d8d]">Total Income</span>
              <span className="text-[24px] font-black tracking-tight text-[#13d463]">
                {formattedTotal}
              </span>
            </div>
          </div>
        )}
      </section>
    </div>
  );
}
