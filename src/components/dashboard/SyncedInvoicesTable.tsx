"use client";

import React from "react";
import { FileText, CheckCircle } from "lucide-react";

export function SyncedInvoicesTable() {
  return (
    <div className="bg-[#0D0D0D] border border-white/20 rounded-2xl p-6 shadow-xl space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-base font-bold text-white">Synced Accounting Invoices</h3>
        <span className="text-xs text-[#8f8f8f]">Auto-synchronized from ERP</span>
      </div>
      <div className="p-4 rounded-xl border border-white/10 bg-white/5 text-xs text-[#8f8f8f] flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <FileText className="w-4 h-4 text-emerald-400" />
          <span>QuickBooks Sync Status</span>
        </div>
        <span className="flex items-center space-x-1 text-emerald-400 font-medium">
          <CheckCircle className="w-3.5 h-3.5" />
          <span>Up to date</span>
        </span>
      </div>
    </div>
  );
}

export default SyncedInvoicesTable;
