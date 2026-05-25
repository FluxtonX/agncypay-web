"use client";

import React from "react";
import { ArrowUpRight, CheckCircle2, XCircle, RefreshCw } from "lucide-react";
import { Transaction } from "../../types/transaction";
import { formatCurrency } from "../../lib/formatCurrency";
import { formatDate } from "../../lib/formatDate";
import { cn } from "../../lib/utils";

interface RecentTransactionsProps {
  transactions: Transaction[];
}

export function RecentTransactions({ transactions }: RecentTransactionsProps) {
  if (transactions.length === 0) {
    return (
      <div className="text-center py-8 text-xs text-[#94A3B8]/60">
        No transaction records found.
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {transactions.map((tx) => (
        <div
          key={tx.id}
          className="glass-panel border-white/[0.04] p-4 rounded-xl flex items-center justify-between gap-4 bg-white/[0.01]"
        >
          <div className="flex items-center gap-3">
            {/* Status Icon */}
            <div
              className={cn(
                "p-2 rounded-lg shrink-0 border",
                tx.status === "success"
                  ? "border-white/15 bg-white/[0.06] text-white"
                  : tx.status === "failed"
                  ? "border-white/10 bg-white/[0.03] text-[#bdbdbd]"
                  : "border-white/10 bg-white/[0.03] text-white"
              )}
            >
              {tx.status === "success" ? (
                <CheckCircle2 className="h-4.5 w-4.5" />
              ) : tx.status === "failed" ? (
                <XCircle className="h-4.5 w-4.5" />
              ) : (
                <RefreshCw className="h-4.5 w-4.5 animate-spin" />
              )}
            </div>
            
            {/* Tx Details */}
            <div className="text-xs">
              <div className="flex items-center gap-1.5 font-bold text-white">
                <span>Payment Settlement ({tx.invoiceId})</span>
                <span className="text-[10px] text-[#94A3B8]/40 font-mono">#{tx.id}</span>
              </div>
              <p className="text-[10px] text-[#94A3B8]/60 mt-1">
                Settled via {tx.paymentMethod} &bull; {new Date(tx.timestamp).toLocaleString()}
              </p>
            </div>
          </div>

          {/* Amount */}
          <div className="text-right shrink-0">
            <h4 className="text-sm font-bold text-[#F8FAFC]">
              {formatCurrency(tx.amount)}
            </h4>
            <span
              className={cn(
                "text-[9px] font-bold uppercase tracking-wider block mt-0.5",
                tx.status === "success"
                  ? "text-white"
                  : tx.status === "failed"
                  ? "text-[#bdbdbd]"
                  : "text-white"
              )}
            >
              {tx.status === "success" ? "Success" : tx.status === "failed" ? "Failed" : "Processing"}
            </span>
          </div>
        </div>
      ))}
    </div>
  );
}
