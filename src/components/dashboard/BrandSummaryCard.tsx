"use client";

import React from "react";
import Link from "next/link";
import { ShieldCheck, ChevronRight, FileText, Lock, Calendar } from "lucide-react";
import { useApp } from "../../context/AppContext";
import { Card } from "../ui/Card";
import { Badge } from "../ui/Badge";
import { formatCurrency } from "../../lib/formatCurrency";

export function BrandSummaryCard() {
  const { state } = useApp();
  const isApproved = state.verificationStatus === "approved";

  // Calculate pending details
  const pendingInvoices = state.invoices.filter((inv) => inv.status === "pending" || inv.status === "overdue");
  const totalPendingAmount = pendingInvoices.reduce((sum, inv) => sum + inv.amount, 0);

  return (
    <Card className="relative overflow-hidden border-white/[0.04] bg-[#070707] p-6">
      <div className="flex flex-col sm:flex-row gap-5 justify-between items-start">
        <div className="flex gap-4 items-center">
          {/* Adidas logo box */}
          <div className="h-16 w-16 rounded-xl bg-black border border-white/10 flex items-center justify-center font-bold text-2xl text-white tracking-widest select-none shrink-0 shadow-lg shadow-black/40">
            三
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-lg font-bold text-[#F8FAFC]">Adidas AG</h3>
              <div title={isApproved ? "Verified Brand" : "Awaiting Compliance Approval"} className="shrink-0 flex items-center">
                {isApproved ? (
                  <ShieldCheck className="h-4.5 w-4.5 text-white" />
                ) : (
                  <Lock className="h-4 w-4 text-[#bdbdbd]" />
                )}
              </div>
            </div>
            <p className="text-xs text-[#94A3B8] mt-0.5">
              Official Adidas Group Corporate Treasury account
            </p>
            <div className="flex gap-2 mt-2">
              <Badge variant={isApproved ? "success" : "warning"}>
                {isApproved ? "Direct Pay Enabled" : "Read-Only Mode"}
              </Badge>
              <Badge variant="neutral">Sportswear / Apparel</Badge>
            </div>
          </div>
        </div>

        {/* Stats segment */}
        <div className="text-left sm:text-right shrink-0">
          <p className="text-[10px] text-[#94A3B8] font-bold uppercase tracking-wider">
            Outstanding Payable
          </p>
          <h2 className="text-2xl font-black text-[#F8FAFC] tracking-tight mt-1">
            {formatCurrency(totalPendingAmount)}
          </h2>
          <p className="text-xs text-[#94A3B8]/60 mt-0.5">
            Across {pendingInvoices.length} pending corporate invoices
          </p>
        </div>
      </div>

      {/* Internal Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-6 pt-5 border-t border-white/[0.04] text-xs text-[#94A3B8]">
        <div className="flex items-center gap-2.5">
          <FileText className="h-4 w-4 text-white" />
          <div>
            <span className="font-semibold text-white">Active Invoices:</span> {state.invoices.length} items logged
          </div>
        </div>
        <div className="flex items-center gap-2.5">
          <Calendar className="h-4 w-4 text-white" />
          <div>
            <span className="font-semibold text-white">Last Invoice Date:</span> May 18, 2026
          </div>
        </div>
      </div>

      {/* CTA Button */}
      <div className="mt-5 flex justify-end">
        {isApproved ? (
          <Link
            href="/dashboard/invoices"
            className="flex items-center gap-1 text-xs font-bold text-white transition-colors hover:text-[#d8d8d8] cursor-pointer group"
          >
            Manage Adidas Invoices
            <ChevronRight className="h-3.5 w-3.5 group-hover:translate-x-0.5 transition-transform" />
          </Link>
        ) : (
          <Link
            href="/dashboard/verification"
            className="flex items-center gap-1 text-xs font-bold text-white transition-colors hover:text-[#d8d8d8] cursor-pointer group"
          >
            Complete Onboarding to Unlock
            <ChevronRight className="h-3.5 w-3.5 group-hover:translate-x-0.5 transition-transform" />
          </Link>
        )}
      </div>
    </Card>
  );
}
