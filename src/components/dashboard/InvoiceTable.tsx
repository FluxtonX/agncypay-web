"use client";

import React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Lock, FileText, ChevronRight, Eye, ShieldAlert } from "lucide-react";
import { Invoice } from "../../types/invoice";
import { InvoiceStatusBadge } from "./InvoiceStatusBadge";
import { formatCurrency } from "../../lib/formatCurrency";
import { formatDate } from "../../lib/formatDate";
import { Button } from "../ui/Button";
import { cn } from "../../lib/utils";

interface InvoiceTableProps {
  invoices: Invoice[];
  isLocked?: boolean;
}

export function InvoiceTable({ invoices, isLocked = false }: InvoiceTableProps) {
  const router = useRouter();

  const handleRowClick = (invoiceId: string) => {
    if (isLocked) return;
    router.push(`/dashboard/invoices/${invoiceId}`);
  };

  return (
    <div className="relative rounded-xl border border-white/[0.06] overflow-hidden bg-[#070B14]">
      {/* Locked Overlay Banner */}
      {isLocked && (
        <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-black/60 backdrop-blur-[3px] p-6 text-center">
          <div className="h-12 w-12 rounded-full bg-white/[0.06] border border-white/15 flex items-center justify-center text-white mb-3">
            <Lock className="h-5 w-5" />
          </div>
          <h4 className="text-sm font-bold text-white">Invoices Locked</h4>
          <p className="text-xs text-[#94A3B8] max-w-sm mt-1 mb-4">
            Complete business and brand authorization verification to view and pay Adidas invoices.
          </p>
          <Button
            size="sm"
            variant="secondary"
            onClick={() => router.push("/dashboard/verification")}
          >
            Start Verification
          </Button>
        </div>
      )}

      {/* Table Element */}
      <div className="w-full overflow-x-auto">
        <table className="w-full border-collapse text-left text-xs text-[#94A3B8]">
          <thead>
            <tr className="border-b border-white/[0.06] bg-white/[0.01] uppercase tracking-wider font-semibold text-[10px] text-white">
              <th className="py-4 px-6">Invoice ID</th>
              <th className="py-4 px-6">Brand</th>
              <th className="py-4 px-6">Issued Date</th>
              <th className="py-4 px-6">Due Date</th>
              <th className="py-4 px-6 text-right">Amount</th>
              <th className="py-4 px-6">Status</th>
              <th className="py-4 px-6 text-right">Action</th>
            </tr>
          </thead>
          <tbody className={cn("divide-y divide-white/[0.04]", isLocked && "blur-[2px] pointer-events-none select-none")}>
            {invoices.map((invoice, idx) => (
              <motion.tr
                key={invoice.id}
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: idx * 0.05 }}
                onClick={() => handleRowClick(invoice.id)}
                className="hover:bg-white/[0.02] transition-colors cursor-pointer group"
              >
                {/* ID */}
                <td className="py-4 px-6 font-semibold text-[#F8FAFC]">
                  {invoice.id}
                </td>
                
                {/* Brand */}
                <td className="py-4 px-6">
                  <div className="flex items-center gap-2">
                    <div className="h-6 w-6 rounded bg-black border border-white/10 flex items-center justify-center font-bold text-[9px] text-white">
                      三
                    </div>
                    <span className="font-semibold text-[#F8FAFC]">{invoice.brandName}</span>
                  </div>
                </td>

                {/* Dates */}
                <td className="py-4 px-6">{formatDate(invoice.invoiceDate)}</td>
                <td className="py-4 px-6">{formatDate(invoice.dueDate)}</td>

                {/* Amount */}
                <td className="py-4 px-6 text-right font-bold text-[#F8FAFC]">
                  {formatCurrency(invoice.amount)}
                </td>

                {/* Status */}
                <td className="py-4 px-6">
                  <InvoiceStatusBadge status={invoice.status} />
                </td>

                {/* Action */}
                <td className="py-4 px-6 text-right">
                  <div className="flex justify-end items-center gap-2">
                    {invoice.status === "paid" ? (
                      <span className="text-[11px] font-bold text-white flex items-center gap-0.5 group-hover:underline">
                        View Receipt <ChevronRight className="h-3 w-3" />
                      </span>
                    ) : invoice.status === "processing" ? (
                      <span className="text-[11px] font-bold text-white">
                        Processing
                      </span>
                    ) : (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleRowClick(invoice.id);
                        }}
                        className="px-2.5 py-1 text-[11px] font-bold bg-white text-black border border-white rounded-md hover:bg-[#e8e8e8] transition-all cursor-pointer"
                      >
                        Pay Invoice
                      </button>
                    )}
                  </div>
                </td>
              </motion.tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
