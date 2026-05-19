"use client";

import React, { useState } from "react";
import Link from "next/link";
import { MoreHorizontal, Download, Eye, ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight, Search, SlidersHorizontal } from "lucide-react";
import { useApp } from "../../../context/AppContext";
import { formatCurrency } from "../../../lib/formatCurrency";
import { formatDate } from "../../../lib/formatDate";
import { cn } from "../../../lib/utils";

const STATUS_CONFIG = {
  paid: {
    label: "Done",
    dot: "bg-[#22C55E]",
    text: "text-[#22C55E]",
    bg: "bg-[#22C55E]/10",
  },
  pending: {
    label: "Pending",
    dot: "bg-[#F59E0B]",
    text: "text-[#F59E0B]",
    bg: "bg-[#F59E0B]/10",
  },
  overdue: {
    label: "Overdue",
    dot: "bg-[#EF4444]",
    text: "text-[#EF4444]",
    bg: "bg-[#EF4444]/10",
  },
  processing: {
    label: "In Process",
    dot: "bg-[#06B6D4]",
    text: "text-[#06B6D4]",
    bg: "bg-[#06B6D4]/10",
  },
} as const;

export default function InvoicesPortalPage() {
  const { state } = useApp();
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState<Set<string>>(new Set());

  const filtered = state.invoices.filter(
    (inv) =>
      inv.id.toLowerCase().includes(search.toLowerCase()) ||
      inv.brandName.toLowerCase().includes(search.toLowerCase())
  );

  const allSelected = filtered.length > 0 && filtered.every((i) => selected.has(i.id));

  const toggleAll = () => {
    if (allSelected) {
      setSelected(new Set());
    } else {
      setSelected(new Set(filtered.map((i) => i.id)));
    }
  };

  const toggleOne = (id: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  return (
    <div className="space-y-5">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
        <div>
          <h1 className="text-xl font-bold text-white tracking-tight">Invoice(s)</h1>
          <p className="text-xs text-[#6B7280] mt-0.5">Manage and pay commercial invoices with AgncyPay.</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-[#6B7280]" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search invoices..."
              className="pl-8 pr-3 py-2 text-xs bg-[#111] border border-[#222] rounded-lg text-[#D1D5DB] placeholder-[#4B5563] focus:outline-none focus:border-[#333] w-52 transition-colors"
            />
          </div>
          <button className="flex items-center gap-1.5 px-3 py-2 text-xs border border-[#222] rounded-lg text-[#9CA3AF] bg-[#111] hover:bg-[#1a1a1a] transition-colors cursor-pointer">
            <SlidersHorizontal className="h-3.5 w-3.5" />
            Filter
          </button>
          <button
            onClick={() => alert("Simulation: Invoice import triggered via EDI or file upload.")}
            className="flex items-center gap-1.5 px-3 py-2 text-xs rounded-lg text-black font-bold bg-white hover:bg-[#E5E7EB] transition-colors cursor-pointer"
          >
            + Import Invoice
          </button>
        </div>
      </div>

      {/* Main Table Card */}
      <div className="rounded-xl border border-[#1F1F1F] bg-[#0A0A0A] overflow-hidden">
        {/* Table */}
        <div className="w-full overflow-x-auto">
          <table className="w-full text-left text-xs">
            {/* Head */}
            <thead>
              <tr className="border-b border-[#1F1F1F] text-[#4B5563] uppercase tracking-wider font-semibold text-[10px]">
                <th className="py-3.5 px-4 w-10">
                  <input
                    type="checkbox"
                    checked={allSelected}
                    onChange={toggleAll}
                    className="rounded border-[#333] bg-transparent accent-white cursor-pointer"
                  />
                </th>
                <th className="py-3.5 px-4">Invoice(s)</th>
                <th className="py-3.5 px-4">Requested</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-4">Due</th>
                <th className="py-3.5 px-4">Amount</th>
                <th className="py-3.5 px-4">Client</th>
                <th className="py-3.5 px-4 w-10"></th>
              </tr>
            </thead>

            {/* Body */}
            <tbody className="divide-y divide-[#111]">
              {filtered.map((invoice) => {
                const cfg = STATUS_CONFIG[invoice.status];
                const isSelected = selected.has(invoice.id);
                const daysDue = Math.ceil(
                  (new Date(invoice.dueDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24)
                );
                const dueDays = daysDue < 0 ? Math.abs(daysDue) + "d ago" : daysDue + "";

                return (
                  <tr
                    key={invoice.id}
                    className={cn(
                      "group hover:bg-[#111] transition-colors",
                      isSelected && "bg-[#111]"
                    )}
                  >
                    {/* Checkbox */}
                    <td className="py-3.5 px-4">
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => toggleOne(invoice.id)}
                        className="rounded border-[#333] bg-transparent accent-white cursor-pointer"
                      />
                    </td>

                    {/* Invoice ID */}
                    <td className="py-3.5 px-4">
                      <Link
                        href={`/dashboard/invoices/${invoice.id}`}
                        className="font-mono text-[#D1D5DB] hover:text-white transition-colors text-[11px]"
                      >
                        {invoice.id}
                      </Link>
                    </td>

                    {/* Requested / brand logo */}
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-2">
                        <div className="h-7 w-14 rounded bg-black border border-[#222] flex items-center justify-center font-bold text-[9px] text-white shrink-0 px-1">
                          Adidas
                        </div>
                      </div>
                    </td>

                    {/* Status */}
                    <td className="py-3.5 px-4">
                      {invoice.status === "pending" || invoice.status === "processing" ? (
                        <button
                          onClick={() => window.location.assign(`/dashboard/invoices/${invoice.id}`)}
                          className={cn(
                            "flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-semibold border transition-all cursor-pointer",
                            invoice.status === "processing"
                              ? "border-[#06B6D4]/40 text-[#06B6D4] bg-[#06B6D4]/10 hover:bg-[#06B6D4]/20"
                              : "border-[#22C55E]/40 text-[#22C55E] bg-[#22C55E]/10 hover:bg-[#22C55E]/20"
                          )}
                        >
                          Request Pay
                        </button>
                      ) : (
                        <span className={cn("flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold", cfg.bg, cfg.text)}>
                          <span className={cn("h-1.5 w-1.5 rounded-full", cfg.dot)} />
                          {cfg.label}
                        </span>
                      )}
                    </td>

                    {/* Due */}
                    <td className="py-3.5 px-4 text-[#6B7280] font-mono text-[11px]">
                      {dueDays}
                    </td>

                    {/* Amount */}
                    <td className="py-3.5 px-4 font-bold text-white text-[13px]">
                      {formatCurrency(invoice.amount)}
                    </td>

                    {/* Client */}
                    <td className="py-3.5 px-4 text-[#D1D5DB] font-semibold">
                      Adidas AG
                    </td>

                    {/* Actions */}
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Link
                          href={`/dashboard/invoices/${invoice.id}`}
                          className="p-1.5 rounded-md text-[#6B7280] hover:text-white hover:bg-[#222] transition-all cursor-pointer"
                        >
                          <Eye className="h-3.5 w-3.5" />
                        </Link>
                        <button
                          onClick={() => alert(`Simulation: Downloading ${invoice.id}...`)}
                          className="p-1.5 rounded-md text-[#6B7280] hover:text-white hover:bg-[#222] transition-all cursor-pointer"
                        >
                          <Download className="h-3.5 w-3.5" />
                        </button>
                        <button className="p-1.5 rounded-md text-[#6B7280] hover:text-white hover:bg-[#222] transition-all cursor-pointer">
                          <MoreHorizontal className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}

              {filtered.length === 0 && (
                <tr>
                  <td colSpan={8} className="py-16 text-center text-[#4B5563] text-xs">
                    No invoices found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Footer / Pagination */}
        <div className="flex items-center justify-between px-4 py-3 border-t border-[#1F1F1F] text-xs text-[#4B5563]">
          <span>{selected.size} of {filtered.length} row(s) selected.</span>
          <div className="flex items-center gap-3">
            <span>Rows per page</span>
            <select className="bg-[#111] border border-[#222] rounded px-2 py-1 text-[#9CA3AF] text-xs cursor-pointer focus:outline-none">
              <option>10</option>
              <option>25</option>
              <option>50</option>
            </select>
            <span>Page 1 of 1</span>
            <div className="flex items-center gap-1">
              <button className="p-1 rounded hover:bg-[#1F1F1F] disabled:opacity-30 cursor-pointer"><ChevronsLeft className="h-3.5 w-3.5" /></button>
              <button className="p-1 rounded hover:bg-[#1F1F1F] disabled:opacity-30 cursor-pointer"><ChevronLeft className="h-3.5 w-3.5" /></button>
              <button className="p-1 rounded hover:bg-[#1F1F1F] disabled:opacity-30 cursor-pointer"><ChevronRight className="h-3.5 w-3.5" /></button>
              <button className="p-1 rounded hover:bg-[#1F1F1F] disabled:opacity-30 cursor-pointer"><ChevronsRight className="h-3.5 w-3.5" /></button>
            </div>
          </div>
        </div>
      </div>

      {/* Summary / Action Panel at the bottom of the page */}
      <div className="flex flex-col sm:flex-row justify-between items-center bg-[#0D0D0D] border border-[#1F1F1F] rounded-xl p-4 sm:p-5 mt-4 gap-4">
        <div className="flex flex-wrap items-center gap-6 text-xs text-[#6B7280]">
          <div>
            <span className="block text-[10px] uppercase font-bold text-[#4B5563]">Total Invoices</span>
            <span className="text-white font-bold text-sm mt-0.5 block">{filtered.length} Invoices</span>
          </div>
          <div className="h-8 w-px bg-[#1F1F1F] hidden sm:block" />
          <div>
            <span className="block text-[10px] uppercase font-bold text-[#4B5563]">Total Selected</span>
            <span className="text-[#10B981] font-bold text-sm mt-0.5 block">{selected.size} Selected</span>
          </div>
          <div className="h-8 w-px bg-[#1F1F1F] hidden sm:block" />
          <div>
            <span className="block text-[10px] uppercase font-bold text-[#4B5563]">Total Amount Selected</span>
            <span className="text-white font-black text-base mt-0.5 block">
              {formatCurrency(
                filtered
                  .filter((inv) => selected.has(inv.id))
                  .reduce((sum, inv) => sum + inv.amount, 0)
              )}
            </span>
          </div>
        </div>
        
        <button
          onClick={() => {
            if (selected.size === 0) {
              alert("Please select at least one invoice to pay.");
              return;
            }
            alert(`Simulation: Settle ${selected.size} invoices via AgncyPay ACH route.`);
          }}
          disabled={selected.size === 0}
          className="w-full sm:w-auto px-5 py-2.5 text-xs font-bold bg-[#10B981] hover:bg-[#059669] disabled:bg-[#1A1A1A] disabled:text-[#4B5563] disabled:border-[#1F1F1F] disabled:cursor-not-allowed text-black rounded-lg transition-colors cursor-pointer border border-transparent shadow-[0_0_15px_rgba(16,185,129,0.2)] hover:shadow-[0_0_20px_rgba(16,185,129,0.4)]"
        >
          Pay with AgncyPay
        </button>
      </div>
    </div>
  );
}
