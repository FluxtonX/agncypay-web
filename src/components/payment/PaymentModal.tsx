"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { ShieldCheck, Lock, CreditCard, ArrowRight, CheckCircle2, XCircle, RefreshCw, X, ChevronRight, HelpCircle } from "lucide-react";
import { Invoice } from "../../types/invoice";
import { formatCurrency } from "../../lib/formatCurrency";
import { formatDate } from "../../lib/formatDate";
import { useApp } from "../../context/AppContext";
import { Button } from "../ui/Button";
import { Card } from "../ui/Card";
import { Badge } from "../ui/Badge";
import { cn } from "../../lib/utils";

interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  invoice: Invoice;
}

type PayState = "summary" | "processing" | "success" | "failed";

export function PaymentModal({ isOpen, onClose, invoice }: PaymentModalProps) {
  const router = useRouter();
  const { payInvoice } = useApp();
  const [payState, setPayState] = useState<PayState>("summary");
  const [activeStep, setActiveStep] = useState(0);
  const [txId, setTxId] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [selectedMethod, setSelectedMethod] = useState("ach");

  const steps = [
    "Validating corporate invoice signatures",
    "Securing ACH treasury channel",
    "Executing Federal Reserve ACH transaction",
    "Reconciling ledger entry & receipt generation",
  ];

  // Process simulation steps
  useEffect(() => {
    if (payState !== "processing") return;
    
    setActiveStep(0);
    const interval = setInterval(() => {
      setActiveStep((prev) => {
        if (prev >= steps.length - 1) {
          clearInterval(interval);
          return steps.length - 1;
        }
        return prev + 1;
      });
    }, 900); // Shift step every 900ms

    return () => clearInterval(interval);
  }, [payState]);

  const handleConfirmPayment = async () => {
    setPayState("processing");
    const result = await payInvoice(invoice.id);
    
    // Total simulation duration is ~3.5 seconds
    setTimeout(() => {
      if (result.success) {
        setTxId(`TX-AD-${Math.floor(100000 + Math.random() * 900000)}`);
        setPayState("success");
      } else {
        setErrorMessage(result.error || "Payment transaction was declined by bank treasury authority.");
        setPayState("failed");
      }
    }, 3600);
  };

  const handleRetry = () => {
    setPayState("summary");
    setActiveStep(0);
    setErrorMessage("");
  };

  const handleReceiptRedirect = () => {
    onClose();
    // Redirect to the success screen or simply close
    router.push("/dashboard/transactions");
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={payState === "summary" ? onClose : undefined}
            className="absolute inset-0 bg-black/85 backdrop-blur-sm cursor-pointer"
          />

          {/* Modal box */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ type: "spring", duration: 0.4 }}
            className="w-full max-w-lg glass-panel rounded-2xl overflow-hidden bg-[#0D0D0D] shadow-2xl z-10 border border-white/[0.08]"
          >
            {/* Header */}
            <div className="flex items-center justify-between border-b border-white/[0.06] px-6 py-4">
              <div className="flex items-center gap-2">
                <ShieldCheck className="h-5 w-5 text-white" />
                <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                  {payState === "summary" && "Confirm Brand Payment"}
                  {payState === "processing" && "Processing Settlement"}
                  {payState === "success" && "Settlement Successful"}
                  {payState === "failed" && "Settlement Failed"}
                </h3>
              </div>
              {payState === "summary" && (
                <button
                  onClick={onClose}
                  className="text-[#6B7280] hover:text-[#F8FAFC] p-1 rounded-lg hover:bg-white/5 transition-colors cursor-pointer"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>

            {/* Modal Body with dynamic page states */}
            <div className="p-6">
              {/* STATE 1: SUMMARY */}
              {payState === "summary" && (
                <div className="space-y-5">
                  {/* Adidas logo & invoice header */}
                  <div className="flex items-center justify-between bg-white/[0.01] border border-white/[0.04] p-4 rounded-xl">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 bg-black border border-white/10 rounded-lg flex items-center justify-center font-bold text-[#F8FAFC]">
                        三
                      </div>
                      <div>
                        <h4 className="text-xs font-bold text-white">Adidas AG</h4>
                      <p className="text-[10px] text-[#8f8f8f] mt-0.5">Invoice {invoice.id}</p>
                      </div>
                    </div>
                    <Badge variant="warning">Payable</Badge>
                  </div>

                  {/* Due Date & Settlement Currency */}
                  <div className="grid grid-cols-2 gap-4 text-xs">
                    <div className="bg-white/[0.01] border border-white/[0.04] p-3 rounded-lg">
                      <p className="text-[#8f8f8f] font-semibold uppercase tracking-wider text-[9px]">Due Date</p>
                      <p className="text-white font-bold mt-1">{formatDate(invoice.dueDate)}</p>
                    </div>
                    <div className="bg-white/[0.01] border border-white/[0.04] p-3 rounded-lg">
                      <p className="text-[#8f8f8f] font-semibold uppercase tracking-wider text-[9px]">Settlement Method</p>
                      <p className="text-white font-bold mt-1">AgncyPay ACH Secure</p>
                    </div>
                  </div>

                  {/* Pricing grid */}
                  <div className="space-y-2 border-b border-white/[0.06] pb-4 text-xs">
                    <div className="flex justify-between text-[#8f8f8f]">
                      <span>Invoice Subtotal</span>
                      <span className="font-semibold text-white">{formatCurrency(invoice.amount)}</span>
                    </div>
                    <div className="flex justify-between text-[#8f8f8f]">
                      <span>Reconciliation Processing Fee</span>
                      <span className="font-semibold text-white">Free (SaaS Plan)</span>
                    </div>
                    <div className="flex justify-between text-[#8f8f8f]">
                      <span>ACH Gateway Discount</span>
                      <span className="font-semibold text-white">- {formatCurrency(0)}</span>
                    </div>
                  </div>

                  <div className="flex justify-between items-center">
                    <span className="text-xs font-bold text-white uppercase tracking-wider">Total Settlement Amount</span>
                    <span className="text-xl font-black text-[#F8FAFC] tracking-tight">{formatCurrency(invoice.amount)}</span>
                  </div>

                  {/* Payment method selector mock */}
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-[#8f8f8f] uppercase tracking-wider">
                      Select Funding Account
                    </label>
                    <div className="grid grid-cols-2 gap-3">
                      <button
                        type="button"
                        onClick={() => setSelectedMethod("ach")}
                        className={cn(
                          "p-3 rounded-xl border text-left cursor-pointer transition-all",
                          selectedMethod === "ach"
                            ? "bg-white border-white text-black"
                            : "border-white/10 text-[#8f8f8f] hover:bg-white/5"
                        )}
                      >
                        <div className="flex items-center gap-1.5 font-bold text-xs">
                          <CreditCard className="h-3.5 w-3.5" /> Corporate ACH
                        </div>
                        <span className={cn("text-[9px] mt-1 block", selectedMethod === "ach" ? "text-[#333]" : "text-[#8f8f8f]")}>Deutsche Bank (...1212)</span>
                      </button>
                      
                      <button
                        type="button"
                        onClick={() => setSelectedMethod("card")}
                        className={cn(
                          "p-3 rounded-xl border text-left cursor-pointer transition-all",
                          selectedMethod === "card"
                            ? "bg-white border-white text-black"
                            : "border-white/10 text-[#8f8f8f] hover:bg-white/5"
                        )}
                      >
                        <div className="flex items-center gap-1.5 font-bold text-xs">
                          <CreditCard className="h-3.5 w-3.5" /> Corporate Card
                        </div>
                        <span className={cn("text-[9px] mt-1 block", selectedMethod === "card" ? "text-[#333]" : "text-[#8f8f8f]")}>Visa Signature (...8930)</span>
                      </button>
                    </div>
                  </div>

                  {/* Security message */}
                  <div className="flex items-start gap-2 bg-black border border-[#444] p-3 rounded-lg text-[10px] text-[#d7d7d7] leading-relaxed">
                    <Lock className="h-3.5 w-3.5 shrink-0 mt-0.5" />
                    <span>
                      Payment is protected by AgncyPay Secure Vaulting. Compliance verification guarantees instant matching and automatic bookkeeping reconciliation on Adidas Group ledgers.
                    </span>
                  </div>

                  {/* Actions */}
                  <div className="flex justify-end gap-3 pt-2">
                    <Button variant="ghost" onClick={onClose}>
                      Cancel
                    </Button>
                    <Button variant="primary" className="px-6" onClick={handleConfirmPayment}>
                      Confirm Payment
                    </Button>
                  </div>
                </div>
              )}

              {/* STATE 2: PROCESSING */}
              {payState === "processing" && (
                <div className="py-8 flex flex-col items-center justify-center text-center space-y-6">
                  {/* Animated Loader Circle */}
                  <div className="relative flex items-center justify-center">
                    <RefreshCw className="h-16 w-16 text-white animate-spin stroke-[1.5px]" />
                    <Lock className="absolute h-6 w-6 text-white animate-pulse" />
                  </div>

                  <div className="space-y-1">
                    <h3 className="text-base font-bold text-white">Settling {formatCurrency(invoice.amount)}</h3>
                    <p className="text-xs text-[#8f8f8f]">Payment rails are active</p>
                  </div>

                  {/* Micro checklist of validation steps */}
                  <div className="w-full max-w-sm bg-white/[0.01] border border-white/[0.04] p-4 rounded-xl text-left space-y-3">
                    {steps.map((step, idx) => {
                      const isDone = idx < activeStep;
                      const isActive = idx === activeStep;
                      
                      return (
                        <div
                          key={idx}
                          className={cn(
                            "flex items-center gap-2.5 text-xs transition-all duration-300",
                            isDone ? "text-white" : isActive ? "text-white" : "text-[#5f5f5f]"
                          )}
                        >
                          {isDone ? (
                            <CheckCircle2 className="h-4 w-4 shrink-0" />
                          ) : isActive ? (
                            <RefreshCw className="h-4 w-4 shrink-0 animate-spin" />
                          ) : (
                            <div className="h-4 w-4 rounded-full border border-white/10 flex items-center justify-center text-[8px] shrink-0" />
                          )}
                          <span className={cn(isDone && "line-through decoration-[#6B7280]/20")}>{step}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* STATE 3: SUCCESS */}
              {payState === "success" && (
                <div className="py-6 flex flex-col items-center justify-center text-center space-y-6">
                  {/* Drawing Checkmark Icon Container */}
                  <div className="h-16 w-16 rounded-full bg-white border border-white flex items-center justify-center text-black">
                    <svg className="h-10 w-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path
                        className="check-draw"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="3"
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                  </div>

                  <div className="space-y-1">
                    <h3 className="text-lg font-black text-white tracking-tight">Payment Settled Successfully</h3>
                    <p className="text-xs text-[#8f8f8f]">Ledger reconciliation completed.</p>
                  </div>

                  {/* Transaction metadata */}
                  <div className="w-full bg-white/[0.01] border border-white/[0.04] p-4 rounded-xl text-left text-xs divide-y divide-white/[0.04] space-y-2">
                    <div className="flex justify-between py-1">
                      <span className="text-[#8f8f8f]">Transaction Reference</span>
                      <span className="font-mono font-bold text-white">{txId}</span>
                    </div>
                    <div className="flex justify-between py-2">
                      <span className="text-[#8f8f8f]">Invoice ID</span>
                      <span className="font-bold text-white">{invoice.id}</span>
                    </div>
                    <div className="flex justify-between py-2">
                      <span className="text-[#8f8f8f]">Settlement Amount</span>
                      <span className="font-extrabold text-white">{formatCurrency(invoice.amount)}</span>
                    </div>
                    <div className="flex justify-between py-2">
                      <span className="text-[#8f8f8f]">Settled At</span>
                      <span className="font-bold text-white">{new Date().toLocaleString()}</span>
                    </div>
                  </div>

                  {/* Action button */}
                  <div className="flex w-full gap-3 pt-2">
                    <Button variant="outline" className="flex-1" onClick={onClose}>
                      Back to Invoices
                    </Button>
                    <Button variant="primary" className="flex-1" onClick={handleReceiptRedirect}>
                      View Audit Log
                    </Button>
                  </div>
                </div>
              )}

              {/* STATE 4: FAILED */}
              {payState === "failed" && (
                <div className="py-6 flex flex-col items-center justify-center text-center space-y-6">
                  <div className="h-16 w-16 rounded-full bg-[#111] border border-[#555] flex items-center justify-center text-white">
                    <XCircle className="h-10 w-10" />
                  </div>

                  <div className="space-y-1">
                    <h3 className="text-lg font-black text-white tracking-tight">Payment Settlement Declined</h3>
                    <p className="text-xs text-[#b8b8b8]">{errorMessage}</p>
                  </div>

                  <div className="w-full bg-white/[0.01] border border-white/[0.04] p-4 rounded-xl text-left text-xs space-y-2">
                    <p className="text-[#8f8f8f] leading-relaxed">
                      Federal Reserve ACH returned code: <span className="font-mono text-white font-semibold">R01 (Insufficient Corporate Treasury Funds)</span>. If you are using delegated bank controls, please verify treasury permissions.
                    </p>
                  </div>

                  <div className="flex w-full gap-3 pt-2">
                    <Button variant="outline" className="flex-1" onClick={onClose}>
                      Dismiss
                    </Button>
                    <Button variant="primary" className="flex-1" onClick={handleRetry}>
                      Retry Transaction
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
