"use client";

import React, { useState, use } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, CreditCard, ShieldCheck, CheckCircle2, AlertCircle, ShoppingCart, Calendar } from "lucide-react";
import { useApp } from "../../../../context/AppContext";
import { PaymentModal } from "../../../../components/payment/PaymentModal";
import { InvoiceStatusBadge } from "../../../../components/dashboard/InvoiceStatusBadge";
import { Card } from "../../../../components/ui/Card";
import { Button } from "../../../../components/ui/Button";
import { formatCurrency } from "../../../../lib/formatCurrency";
import { formatDate } from "../../../../lib/formatDate";

interface PageProps {
  params: Promise<{ invoiceId: string }>;
}

export default function InvoiceDetailPage({ params }: PageProps) {
  const router = useRouter();
  const { invoiceId } = use(params);
  const { state } = useApp();

  const [isPayOpen, setIsPayOpen] = useState(false);

  // Find invoice details
  const invoice = state.invoices.find((i) => i.id === invoiceId);

  if (!invoice) {
    return (
      <div className="min-h-[400px] flex flex-col items-center justify-center text-center space-y-4">
        <AlertCircle className="h-10 w-10 text-[#EF4444]" />
        <h3 className="text-base font-bold text-white">Invoice Not Found</h3>
        <p className="text-xs text-[#94A3B8]">The requested invoice ID does not exist in this workspace.</p>
        <Link href="/dashboard/invoices">
          <Button variant="outline">Back to Invoices</Button>
        </Link>
      </div>
    );
  }

  const isApproved = state.verificationStatus === "approved";

  return (
    <div className="space-y-6 max-w-3xl mx-auto">
      {/* Back button link */}
      <div className="flex justify-between items-center">
        <Link
          href="/dashboard/invoices"
          className="flex items-center gap-1.5 text-xs text-[#94A3B8] hover:text-white transition-colors cursor-pointer"
        >
          <ArrowLeft className="h-4 w-4" /> Back to Adidas Invoices
        </Link>

        <InvoiceStatusBadge status={invoice.status} />
      </div>

      {/* Main details card */}
      <Card className="border-white/[0.06] p-6 space-y-6 bg-[#070B14]">
        {/* Header section with brand info */}
        <div className="flex flex-col sm:flex-row justify-between items-start gap-4 pb-5 border-b border-white/[0.06]">
          <div className="flex gap-4 items-center">
            <div className="h-12 w-12 rounded-xl bg-black border border-white/10 flex items-center justify-center font-bold text-xl text-white">
              三
            </div>
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-1.5">
                {invoice.brandName}
                {isApproved && <ShieldCheck className="h-4.5 w-4.5 text-[#22C55E]" />}
              </h3>
              <p className="text-xs text-[#94A3B8]/60 mt-0.5">Commercial Invoice No: {invoice.id}</p>
            </div>
          </div>

          <div className="text-left sm:text-right">
            <span className="text-[10px] text-[#94A3B8] uppercase font-bold tracking-wider">Amount Due</span>
            <h2 className="text-2xl font-black text-[#F8FAFC] tracking-tight mt-1">
              {formatCurrency(invoice.amount)}
            </h2>
          </div>
        </div>

        {/* Dates card grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
          <div className="bg-white/[0.01] border border-white/[0.04] p-3 rounded-lg flex items-center gap-2.5">
            <Calendar className="h-4 w-4 text-[#8B5CF6] shrink-0" />
            <div>
              <p className="text-[#94A3B8]/60 font-semibold uppercase tracking-wider text-[9px]">Invoice Date</p>
              <p className="text-white font-bold mt-0.5">{formatDate(invoice.invoiceDate)}</p>
            </div>
          </div>
          <div className="bg-white/[0.01] border border-white/[0.04] p-3 rounded-lg flex items-center gap-2.5">
            <Calendar className="h-4 w-4 text-[#06B6D4] shrink-0" />
            <div>
              <p className="text-[#94A3B8]/60 font-semibold uppercase tracking-wider text-[9px]">Due Date</p>
              <p className="text-white font-bold mt-0.5">{formatDate(invoice.dueDate)}</p>
            </div>
          </div>
          <div className="bg-white/[0.01] border border-white/[0.04] p-3 rounded-lg flex items-center gap-2.5">
            <ShoppingCart className="h-4 w-4 text-amber-500 shrink-0" />
            <div>
              <p className="text-[#94A3B8]/60 font-semibold uppercase tracking-wider text-[9px]">Purchase Order</p>
              <p className="text-white font-bold mt-0.5">PO-894301</p>
            </div>
          </div>
        </div>

        {/* Line Items Table */}
        <div className="space-y-3 pt-2">
          <h4 className="text-xs font-bold text-white uppercase tracking-wider">Line Items</h4>
          <div className="rounded-lg border border-white/[0.06] overflow-hidden bg-black/20">
            <table className="w-full text-left text-xs text-[#94A3B8]">
              <thead>
                <tr className="bg-white/[0.02] border-b border-white/[0.06] text-white font-semibold">
                  <th className="py-2.5 px-4">Item Description</th>
                  <th className="py-2.5 px-4 text-right">Quantity</th>
                  <th className="py-2.5 px-4 text-right">Unit Price</th>
                  <th className="py-2.5 px-4 text-right">Total</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/[0.04]">
                {invoice.items?.map((item, idx) => (
                  <tr key={idx} className="hover:bg-white/[0.01] transition-colors">
                    <td className="py-3 px-4 font-medium text-white">{item.name}</td>
                    <td className="py-3 px-4 text-right">{item.quantity}</td>
                    <td className="py-3 px-4 text-right">{formatCurrency(item.price)}</td>
                    <td className="py-3 px-4 text-right font-semibold text-white">{formatCurrency(item.quantity * item.price)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Financial calculation totals */}
        <div className="border-t border-white/[0.06] pt-5 space-y-2.5 text-xs text-[#94A3B8]">
          <div className="flex justify-between">
            <span>Subtotal</span>
            <span className="font-semibold text-white">{formatCurrency(invoice.amount)}</span>
          </div>
          <div className="flex justify-between">
            <span>VAT / Taxes (0% reverse charge)</span>
            <span className="font-semibold text-white">{formatCurrency(0)}</span>
          </div>
          <div className="flex justify-between text-base font-bold text-white border-t border-white/[0.04] pt-3">
            <span>Total Payable Amount</span>
            <span className="text-lg font-black text-[#F8FAFC] tracking-tight">
              {formatCurrency(invoice.amount)}
            </span>
          </div>
        </div>

        {/* Pay CTA controls */}
        <div className="flex justify-end gap-3 pt-2 border-t border-white/[0.06]">
          <Link href="/dashboard/invoices">
            <Button variant="ghost">Return</Button>
          </Link>

          {invoice.status === "paid" ? (
            <div className="flex items-center gap-1.5 text-xs text-[#22C55E] font-semibold bg-[#22C55E]/5 border border-[#22C55E]/10 rounded-lg px-4 py-2">
              <CheckCircle2 className="h-4 w-4" />
              <span>Settle Completed</span>
            </div>
          ) : invoice.status === "processing" ? (
            <Button variant="primary" disabled isLoading>
              Settlement in Progress
            </Button>
          ) : isApproved ? (
            <Button
              variant="primary"
              leftIcon={<CreditCard className="h-4 w-4" />}
              onClick={() => setIsPayOpen(true)}
              className="px-6 shadow-[0_0_20px_rgba(139,92,246,0.3)]"
            >
              Pay with AgncyPay
            </Button>
          ) : (
            <div className="flex items-center gap-2 bg-[#F59E0B]/5 border border-[#F59E0B]/10 rounded-lg p-3 text-[11px] text-[#94A3B8] max-w-sm">
              <AlertCircle className="h-4.5 w-4.5 text-[#F59E0B] shrink-0" />
              <span>
                To pay this invoice, please complete your corporate brand verification.{" "}
                <Link href="/dashboard/verification" className="text-[#06B6D4] underline font-semibold">
                  Start verification
                </Link>
              </span>
            </div>
          )}
        </div>
      </Card>

      {/* Payment simulated modal */}
      <PaymentModal
        isOpen={isPayOpen}
        onClose={() => setIsPayOpen(false)}
        invoice={invoice}
      />
    </div>
  );
}
