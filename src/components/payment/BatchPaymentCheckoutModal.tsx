"use client";

import React, { useState } from "react";
import {
  X,
  ShieldCheck,
  CreditCard,
  Building2,
  Plus,
  Check,
  Loader2,
  Sparkles,
  CheckCircle2,
  Lock,
  Landmark,
} from "lucide-react";
import { AddPaymentMethodModal, SavedPaymentMethod } from "./AddPaymentMethodModal";

export interface BatchInvoiceItem {
  id: string;
  agency: string;
  amount: number;
  status: string;
  brand?: string;
  dueDate?: string;
}

interface BatchPaymentCheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedInvoices: BatchInvoiceItem[];
  onAuthorizePayment: () => Promise<void>;
}

export function BatchPaymentCheckoutModal({
  isOpen,
  onClose,
  selectedInvoices,
  onAuthorizePayment,
}: BatchPaymentCheckoutModalProps) {
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [isAddMethodOpen, setIsAddMethodOpen] = useState(false);

  // Saved Payment Methods
  const [savedMethods, setSavedMethods] = useState<SavedPaymentMethod[]>([
    {
      id: "card-default",
      type: "card",
      title: "Chase Ink Business Unlimited Visa",
      subtitle: "Visa •••• 4892 • Primary Disbursement Account",
      brand: "Visa",
      last4: "4892",
      isDefault: true,
    },
    {
      id: "bank-plaid",
      type: "bank",
      title: "Chase Corporate Treasury (Plaid)",
      subtitle: "Plaid Verified •••• 1094 • Real-time ACH / Wire",
      brand: "Chase",
      last4: "1094",
    },
  ]);

  const [selectedMethodId, setSelectedMethodId] = useState<string>("card-default");

  // Billing Address State
  const [billingAddress, setBillingAddress] = useState({
    street: "100 Fashion Way, Suite 400",
    unit: "Floor 4",
    city: "New York",
    state: "NY",
    zip: "10001",
  });

  if (!isOpen) return null;

  // Calculations
  const subtotal = selectedInvoices.reduce((sum, inv) => sum + inv.amount, 0);
  const platformFee = subtotal * 0.015; // 1.5% fee
  const grandTotal = subtotal + platformFee;

  const handleAddMethodSuccess = (newMethod: SavedPaymentMethod) => {
    setSavedMethods((prev) => [newMethod, ...prev]);
    setSelectedMethodId(newMethod.id);
  };

  const handleAuthorize = async () => {
    setIsProcessing(true);
    try {
      await onAuthorizePayment();
      setIsProcessing(false);
      setIsSuccess(true);
      setTimeout(() => {
        setIsSuccess(false);
        onClose();
      }, 1500);
    } catch (e) {
      console.error(e);
      setIsProcessing(false);
    }
  };

  return (
    <>
      {/* Outer Single Smooth Scroll Overlay */}
      <div className="fixed inset-0 z-[90] bg-black/90 backdrop-blur-md overflow-y-auto px-4 py-8 md:px-8 md:py-12 lg:px-12 animate-in fade-in duration-200">
        
        {/* Main Modal Container */}
        <div className="relative w-full max-w-[1340px] mx-auto bg-[#0A0A0A] border border-white/20 rounded-3xl shadow-2xl flex flex-col overflow-hidden">
          
          {/* Header Bar */}
          <div className="h-20 border-b border-white/10 px-8 lg:px-12 bg-[#0D0D0D] flex items-center justify-between shrink-0">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center shadow-md">
                <ShieldCheck className="w-6 h-6 text-black" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-lg font-black text-white tracking-tight">Review & Authorize Batch Payment</h1>
                </div>
                <p className="text-xs text-[#8f8f8f]">Verify payment method, billing authorization, and total settlement</p>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-xl border border-white/10 bg-white/5 text-xs text-[#8f8f8f]">
                <Lock className="w-3.5 h-3.5 text-[#70ff9e]" />
                <span>FDIC Insured • 256-Bit Encrypted</span>
              </div>
              <button
                disabled={isProcessing}
                onClick={onClose}
                className="w-9 h-9 rounded-full border border-white/10 bg-white/5 hover:bg-white/10 text-white flex items-center justify-center transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Main Checkout Body - Two Column Layout without Double Scrollbars */}
          <div className="flex flex-col lg:flex-row items-start gap-12 p-8 lg:p-12">
            
            {/* LEFT COLUMN: Payment Selection & Billing Address */}
            <div className="flex-1 w-full space-y-10">
              
              {/* Section 1: Payment Method Section with Official SVG Logos */}
              <div className="space-y-5">
                <h3 className="text-xs font-bold uppercase tracking-wider text-[#8f8f8f] flex items-center gap-2">
                  <CreditCard className="w-4 h-4 text-[#70ff9e]" />
                  Payment Method
                </h3>

                {/* Bilt-style "+ Add Payment Method" Box with Official SVG Logos */}
                <div className="p-8 rounded-2xl border border-white/10 bg-[#0D0D0D] text-center space-y-5">
                  
                  {/* Official Brand Logo Images wrapped in high-contrast tile badges */}
                  <div className="flex items-center justify-center gap-3 py-1 flex-wrap">
                    <div className="h-8 px-3 rounded-lg border border-white/10 bg-black flex items-center justify-center shrink-0 shadow-sm">
                      <img src="/visa-logo.svg" alt="Visa" className="h-3.5 w-auto object-contain brightness-0 invert" />
                    </div>
                    <div className="h-8 px-3 rounded-lg border border-white/10 bg-black flex items-center justify-center shrink-0 shadow-sm">
                      <img src="/mastercard-logo.svg" alt="Mastercard" className="h-4 w-auto object-contain" />
                    </div>
                    <div className="h-8 px-3 rounded-lg border border-white/10 bg-black flex items-center justify-center shrink-0 shadow-sm">
                      <img src="/american-express-logo.svg" alt="Amex" className="h-4 w-auto object-contain" />
                    </div>
                    <div className="h-8 px-3 rounded-lg border border-white/10 bg-black flex items-center justify-center shrink-0 shadow-sm">
                      <img src="/discover-logo.svg" alt="Discover" className="h-3.5 w-auto object-contain" />
                    </div>
                    <span className="h-4 w-[1px] bg-white/20 hidden sm:block" />
                    <div className="h-8 px-3 rounded-lg border border-[#10b95f]/30 bg-black flex items-center justify-center shrink-0 shadow-sm">
                      <img src="/plaid-logo.svg" alt="Plaid" className="h-3.5 w-auto object-contain brightness-0 invert" />
                    </div>
                  </div>

                  <p className="text-xs font-medium text-[#8f8f8f] max-w-md mx-auto leading-relaxed">
                    Add a payment method to authorize invoice settlements securely.
                  </p>

                  <div className="pt-2 max-w-md mx-auto">
                    <button
                      type="button"
                      onClick={() => setIsAddMethodOpen(true)}
                      className="w-full h-13 rounded-xl bg-white text-black hover:bg-neutral-200 font-extrabold text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-2 cursor-pointer shadow-lg active:scale-[0.99]"
                    >
                      <Plus className="w-4 h-4 stroke-[3]" />
                      <span>+ Add payment method</span>
                    </button>
                  </div>
                </div>

                {/* Saved Active Payment Methods Selector Grid */}
                {savedMethods.length > 0 && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2">
                    {savedMethods.map((method) => {
                      const isSelected = selectedMethodId === method.id;
                      return (
                        <div
                          key={method.id}
                          onClick={() => setSelectedMethodId(method.id)}
                          className={`p-4 rounded-2xl border transition-all cursor-pointer flex items-center justify-between ${
                            isSelected
                              ? "border-white bg-white/10 ring-1 ring-white"
                              : "border-white/10 bg-[#0D0D0D] hover:border-white/20 hover:bg-white/5"
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl border border-white/15 bg-black flex items-center justify-center shrink-0">
                              {method.type === "card" ? (
                                <CreditCard className="w-5 h-5 text-white" />
                              ) : (
                                <Building2 className="w-5 h-5 text-white" />
                              )}
                            </div>
                            <div>
                              <p className="text-xs font-bold text-white">{method.title}</p>
                              <p className="text-[11px] text-[#8f8f8f] mt-0.5">{method.subtitle}</p>
                            </div>
                          </div>

                          <div className={`w-5 h-5 rounded-full border flex items-center justify-center shrink-0 ${
                            isSelected ? "border-white bg-white text-black" : "border-white/20"
                          }`}>
                            {isSelected && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Section 2: Billing Address */}
              <div className="space-y-4">
                <h3 className="text-xs font-bold uppercase tracking-wider text-[#8f8f8f]">
                  Billing Address
                </h3>
                
                <div className="p-6 rounded-2xl border border-white/10 bg-[#0D0D0D] space-y-3.5">
                  <div>
                    <label className="block text-[11px] font-bold text-[#8f8f8f] uppercase tracking-wider mb-1">Street Address</label>
                    <input
                      type="text"
                      value={billingAddress.street}
                      onChange={(e) => setBillingAddress({ ...billingAddress, street: e.target.value })}
                      className="w-full h-11 px-3.5 rounded-xl border border-white/15 bg-white/5 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-white transition-all"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div>
                      <label className="block text-[11px] font-bold text-[#8f8f8f] uppercase tracking-wider mb-1">Unit / Floor</label>
                      <input
                        type="text"
                        value={billingAddress.unit}
                        onChange={(e) => setBillingAddress({ ...billingAddress, unit: e.target.value })}
                        className="w-full h-11 px-3.5 rounded-xl border border-white/15 bg-white/5 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-white transition-all"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-[#8f8f8f] uppercase tracking-wider mb-1">City</label>
                      <input
                        type="text"
                        value={billingAddress.city}
                        onChange={(e) => setBillingAddress({ ...billingAddress, city: e.target.value })}
                        className="w-full h-11 px-3.5 rounded-xl border border-white/15 bg-white/5 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-white transition-all"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-[#8f8f8f] uppercase tracking-wider mb-1">ZIP Code</label>
                      <input
                        type="text"
                        value={billingAddress.zip}
                        onChange={(e) => setBillingAddress({ ...billingAddress, zip: e.target.value })}
                        className="w-full h-11 px-3.5 rounded-xl border border-white/15 bg-white/5 text-xs font-mono text-white placeholder-neutral-500 focus:outline-none focus:border-white transition-all"
                      />
                    </div>
                  </div>
                </div>
              </div>

            </div>

            {/* RIGHT COLUMN: Order Summary Sidebar (Sticky positioning) */}
            <div className="w-full lg:w-[420px] shrink-0 space-y-6">
              <div className="sticky top-6 rounded-2xl border border-white/15 bg-[#0D0D0D] p-7 shadow-2xl space-y-6">
                
                <div className="flex items-center justify-between border-b border-white/10 pb-3">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-[#8f8f8f]">
                    Payment Summary
                  </h3>
                  <span className="text-xs font-bold text-white">
                    {selectedInvoices.length} Invoice{selectedInvoices.length === 1 ? "" : "s"}
                  </span>
                </div>

                {/* Selected Invoices List */}
                <div className="max-h-56 overflow-y-auto pr-1 divide-y divide-white/5 space-y-2">
                  {selectedInvoices.map((inv) => (
                    <div key={inv.id} className="pt-2 flex items-center justify-between text-xs">
                      <div>
                        <p className="font-bold text-white">{inv.agency}</p>
                        <p className="text-[10px] text-[#8f8f8f] font-mono">ID: {inv.id.substring(0, 10)}</p>
                      </div>
                      <span className="font-mono font-extrabold text-white">
                        ${inv.amount.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                      </span>
                    </div>
                  ))}
                </div>

                {/* Amount Breakdown */}
                <div className="space-y-3.5 pt-2 border-t border-white/10 text-xs">
                  <div className="flex justify-between text-[#8f8f8f]">
                    <span>Invoices Subtotal</span>
                    <span className="font-mono text-white font-semibold">${subtotal.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                  </div>
                  <div className="flex justify-between text-[#8f8f8f]">
                    <span>Settlement Fee (1.5%)</span>
                    <span className="font-mono text-white font-semibold">${platformFee.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                  </div>

                  <div className="pt-4 border-t border-white/10 flex justify-between items-baseline">
                    <div>
                      <span className="text-sm font-extrabold text-white block">Total to Pay</span>
                      <span className="text-[10px] text-[#8f8f8f]">Including fees & taxes</span>
                    </div>
                    <span className="text-2xl font-black text-white tracking-tight font-mono">
                      ${grandTotal.toLocaleString(undefined, { minimumFractionDigits: 2 })} USD
                    </span>
                  </div>
                </div>



                {/* Primary Authorization Action */}
                <button
                  type="button"
                  disabled={isProcessing || isSuccess}
                  onClick={handleAuthorize}
                  className={`w-full h-14 rounded-xl font-extrabold text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-all shadow-xl cursor-pointer active:scale-[0.99] ${
                    isSuccess
                      ? "bg-white text-black font-bold"
                      : "bg-white text-black hover:bg-neutral-200"
                  }`}
                >
                  {isProcessing ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin text-black" />
                      <span>Authorizing Settlement...</span>
                    </>
                  ) : isSuccess ? (
                    <>
                      <CheckCircle2 className="w-5 h-5 text-black" />
                      <span>Batch Settlement Success!</span>
                    </>
                  ) : (
                    <>
                      <ShieldCheck className="w-5 h-5" />
                      <span>Authorize Payment (${grandTotal.toLocaleString(undefined, { minimumFractionDigits: 2 })})</span>
                    </>
                  )}
                </button>

                <p className="text-[10px] text-[#8f8f8f] text-center leading-normal">
                  By clicking Authorize Payment, you confirm transfer authorization under AgncyPay Terms & Conditions.
                </p>
              </div>
            </div>

          </div>
        </div>
      </div>

      {/* Add Payment Method Modal */}
      <AddPaymentMethodModal
        isOpen={isAddMethodOpen}
        onClose={() => setIsAddMethodOpen(false)}
        onAddMethod={handleAddMethodSuccess}
      />
    </>
  );
}

export default BatchPaymentCheckoutModal;
