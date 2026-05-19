"use client";

import React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  FileText,
  CheckCircle2,
  Wallet,
  ShieldCheck,
  ArrowRight,
  Clock,
} from "lucide-react";
import { useApp } from "../../context/AppContext";
import { StatCard } from "../../components/dashboard/StatCard";
import { formatCurrency } from "../../lib/formatCurrency";
import { formatDate } from "../../lib/formatDate";
import { cn } from "../../lib/utils";

const INV_STATUS_CFG = {
  paid: { label: "Done", dot: "bg-[#22C55E]", text: "text-[#22C55E]" },
  pending: { label: "Pending", dot: "bg-[#F59E0B]", text: "text-[#F59E0B]" },
  overdue: { label: "Overdue", dot: "bg-[#EF4444]", text: "text-[#EF4444]" },
  processing: { label: "In Process", dot: "bg-[#06B6D4]", text: "text-[#06B6D4]" },
} as const;

export default function DashboardOverviewPage() {
  const router = useRouter();
  const { state } = useApp();

  const pendingInvoices = state.invoices.filter(
    (i) => i.status === "pending" || i.status === "overdue"
  );
  const totalPending = pendingInvoices.reduce((s, i) => s + i.amount, 0);
  const paidInvoices = state.invoices.filter((i) => i.status === "paid");
  const totalPaid = paidInvoices.reduce((s, i) => s + i.amount, 0);
  const mockReserves = 145000.0;
  const isApproved = state.verificationStatus === "approved";

  return (
    <div className="space-y-6">
      {/* Welcome */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-white tracking-tight">
            Good day, {state.user?.fullName?.split(" ")[0] || "Representative"} 👋
          </h1>
          <p className="text-xs text-[#6B7280] mt-0.5">
            Adidas AG &bull; Corporate Treasury Dashboard
          </p>
        </div>
        {!isApproved && (
          <button
            onClick={() => router.push("/dashboard/verification")}
            className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-lg border border-[#F59E0B]/30 bg-[#F59E0B]/10 text-[#F59E0B] hover:bg-[#F59E0B]/20 transition-colors cursor-pointer"
          >
            <ShieldCheck className="h-3.5 w-3.5" /> Complete Verification
          </button>
        )}
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Outstanding Payable"
          value={formatCurrency(totalPending)}
          description={`${pendingInvoices.length} invoices`}
          icon={<FileText className="h-4 w-4" />}
        />
        <StatCard
          title="Total Paid"
          value={formatCurrency(totalPaid)}
          description={`${paidInvoices.length} settled`}
          icon={<CheckCircle2 className="h-4 w-4 text-[#22C55E]" />}
        />
        <StatCard
          title="Treasury Reserves"
          value={formatCurrency(mockReserves - totalPaid)}
          description="Available balance"
          icon={<Wallet className="h-4 w-4 text-[#06B6D4]" />}
        />
        <StatCard
          title="Compliance"
          value={isApproved ? "Verified" : "Pending"}
          description={isApproved ? "KYB passed" : "Action needed"}
          icon={
            <ShieldCheck
              className={cn(
                "h-4 w-4",
                isApproved ? "text-[#22C55E]" : "text-[#F59E0B]"
              )}
            />
          }
        />
      </div>

      {/* Recent Invoices Table */}
      <div className="rounded-xl border border-[#1F1F1F] bg-[#0A0A0A] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-[#1F1F1F]">
          <div>
            <p className="text-sm font-bold text-white">Recent Invoices</p>
            <p className="text-[11px] text-[#4B5563] mt-0.5">Latest activity from Adidas AG</p>
          </div>
          <Link
            href="/dashboard/invoices"
            className="flex items-center gap-1 text-xs text-[#6B7280] hover:text-white transition-colors cursor-pointer"
          >
            View all <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>

        {/* Table */}
        <table className="w-full text-left text-xs">
          <thead>
            <tr className="border-b border-[#111] text-[#4B5563] uppercase tracking-wider text-[10px] font-semibold">
              <th className="py-3 px-5">Invoice</th>
              <th className="py-3 px-5">Due</th>
              <th className="py-3 px-5">Amount</th>
              <th className="py-3 px-5">Status</th>
              <th className="py-3 px-5"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#111]">
            {state.invoices.slice(0, 5).map((invoice) => {
              const cfg = INV_STATUS_CFG[invoice.status];
              return (
                <tr
                  key={invoice.id}
                  onClick={() => router.push(`/dashboard/invoices/${invoice.id}`)}
                  className="hover:bg-[#111] transition-colors cursor-pointer group"
                >
                  <td className="py-3.5 px-5 font-mono text-[#D1D5DB] text-[11px]">
                    {invoice.id}
                  </td>
                  <td className="py-3.5 px-5 text-[#6B7280] flex items-center gap-1.5">
                    <Clock className="h-3 w-3" />
                    {formatDate(invoice.dueDate)}
                  </td>
                  <td className="py-3.5 px-5 font-bold text-white">
                    {formatCurrency(invoice.amount)}
                  </td>
                  <td className="py-3.5 px-5">
                    <span
                      className={cn(
                        "flex items-center gap-1.5 w-fit px-2.5 py-1 rounded-full text-[11px] font-semibold",
                        `bg-${cfg.dot.replace("bg-", "")}/10`,
                        cfg.text
                      )}
                    >
                      <span className={cn("h-1.5 w-1.5 rounded-full", cfg.dot)} />
                      {cfg.label}
                    </span>
                  </td>
                  <td className="py-3.5 px-5">
                    <ArrowRight className="h-3.5 w-3.5 text-[#2A2A2A] group-hover:text-[#6B7280] transition-colors" />
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Recent Payouts (from reference image) */}
      <div className="rounded-xl border border-[#1F1F1F] bg-[#0A0A0A] overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b border-[#1F1F1F]">
          <div>
            <p className="text-sm font-bold text-white">Recent Payouts</p>
            <p className="text-[11px] text-[#4B5563] mt-0.5">Your latest account activity.</p>
          </div>
          <button className="text-xs text-[#6B7280] hover:text-white border border-[#1F1F1F] px-3 py-1.5 rounded-lg bg-[#111] hover:bg-[#1A1A1A] transition-colors cursor-pointer">
            View All
          </button>
        </div>
        <div className="divide-y divide-[#111]">
          {[
            { brand: "Adidas AG", campaign: "Q2 Ecomm Web", date: "Today, 10:24 AM", amount: "$2,450.00" },
            { brand: "Adidas AG", campaign: "S/S Global Campaign", date: "Yesterday", amount: "$1,850.00" },
            { brand: "Adidas AG", campaign: "Ad Domestic Socials", date: "May 17", amount: "$4,720.00" },
            { brand: "Adidas AG", campaign: "Brand Review Q1", date: "May 14", amount: "$980.00" },
          ].map((payout, idx) => (
            <div
              key={idx}
              className="flex items-center justify-between px-5 py-3.5 hover:bg-[#111] transition-colors group"
            >
              <div className="flex items-center gap-3">
                <div className="h-8 w-8 rounded bg-[#111] border border-[#1F1F1F] flex items-center justify-center font-bold text-[9px] text-white shrink-0">
                  三
                </div>
                <div>
                  <p className="text-xs font-semibold text-white">{payout.brand}</p>
                  <p className="text-[11px] text-[#4B5563]">{payout.campaign}</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-xs font-bold text-white">{payout.amount}</p>
                <p className="text-[10px] text-[#4B5563]">{payout.date}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
