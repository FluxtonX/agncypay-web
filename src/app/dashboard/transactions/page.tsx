"use client";

import React from "react";
import { History, Download, RefreshCw } from "lucide-react";
import { useApp } from "../../../context/AppContext";
import { RecentTransactions } from "../../../components/dashboard/RecentTransactions";
import { Card } from "../../../components/ui/Card";
import { Button } from "../../../components/ui/Button";
import { Badge } from "../../../components/ui/Badge";

export default function TransactionsHistoryPage() {
  const { state } = useApp();

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-xl font-bold text-white tracking-tight">
            Transaction Ledger
          </h1>
          <p className="text-xs text-[#94A3B8] mt-0.5">
            Audit-ready records of settled corporate payments.
          </p>
        </div>

        {state.transactions.length > 0 && (
          <Button
            size="sm"
            variant="secondary"
            leftIcon={<Download className="h-4 w-4" />}
            onClick={() => alert("Simulation: Excel/CSV export has been compiled and downloaded.")}
          >
            Export Ledger
          </Button>
        )}
      </div>

      <div className="space-y-4">
        <div className="flex justify-between items-center text-xs">
          <span className="font-semibold text-white uppercase tracking-wider flex items-center gap-1.5">
            <History className="h-4 w-4 text-[#8B5CF6]" /> History Logs
          </span>
          <Badge variant="neutral">{state.transactions.length} settlements</Badge>
        </div>

        <Card className="border-white/[0.06] p-6 bg-[#070B14]">
          <RecentTransactions transactions={state.transactions} />
        </Card>
      </div>
    </div>
  );
}
