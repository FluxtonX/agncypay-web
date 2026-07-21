"use client";

import React, { useState, useEffect } from "react";
import { HelpCircle } from "lucide-react";

export interface CorporatePayoutTermsCardProps {
  invoiceId?: string;
  initialTerm?: "Net-30" | "Net-60" | "Net-90";
  initialAllowNet0?: boolean;
  onChangeTerm?: (term: "Net-30" | "Net-60" | "Net-90") => void;
  onChangeAllowNet0?: (allowed: boolean) => void;
  className?: string;
}

export function CorporatePayoutTermsCard({
  invoiceId,
  initialTerm = "Net-30",
  initialAllowNet0 = true,
  onChangeTerm,
  onChangeAllowNet0,
  className = "",
}: CorporatePayoutTermsCardProps) {
  const [term, setTerm] = useState<"Net-30" | "Net-60" | "Net-90">(initialTerm);
  const [allowNet0, setAllowNet0] = useState<boolean>(initialAllowNet0);
  const [showTooltip, setShowTooltip] = useState(false);

  useEffect(() => {
    if (invoiceId) {
      const savedTerm = localStorage.getItem(`brand_payout_term_${invoiceId}`);
      if (savedTerm && ["Net-30", "Net-60", "Net-90"].includes(savedTerm)) {
        setTerm(savedTerm as any);
      }

      const savedNet0 = localStorage.getItem(`brand_allow_net0_${invoiceId}`);
      if (savedNet0 !== null) {
        setAllowNet0(savedNet0 === "true");
      }
    }
  }, [invoiceId]);

  const handleSelectTerm = (newTerm: "Net-30" | "Net-60" | "Net-90") => {
    setTerm(newTerm);
    if (invoiceId) {
      localStorage.setItem(`brand_payout_term_${invoiceId}`, newTerm);
    }
    if (onChangeTerm) onChangeTerm(newTerm);
  };

  const handleToggleNet0 = () => {
    const nextVal = !allowNet0;
    setAllowNet0(nextVal);
    if (invoiceId) {
      localStorage.setItem(`brand_allow_net0_${invoiceId}`, String(nextVal));
    }
    if (onChangeAllowNet0) onChangeAllowNet0(nextVal);
  };

  return (
    <div className={`bg-[#050505] rounded-2xl border border-white/20 p-5 shadow-sm space-y-4 ${className}`}>
      {/* Header with Title and Help Icon */}
      <div>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <h4 className="text-xs font-black text-white uppercase tracking-wider">
              Your Corporate Payout Terms
            </h4>
            <div className="relative">
              <button
                type="button"
                onMouseEnter={() => setShowTooltip(true)}
                onMouseLeave={() => setShowTooltip(false)}
                onClick={() => setShowTooltip(!showTooltip)}
                className="text-neutral-400 hover:text-white transition-colors cursor-pointer"
                title="Terms help"
              >
                <HelpCircle className="h-3.5 w-3.5" />
              </button>

              {showTooltip && (
                <div className="absolute left-1/2 -translate-x-1/2 bottom-full mb-2 w-64 p-2.5 bg-[#121212] border border-white/20 rounded-xl text-[10px] text-neutral-300 shadow-2xl z-50 pointer-events-none">
                  Set your treasury disbursement timeline. Invoices will automatically clear according to this date unless Net-0 advance liquidity is enabled.
                </div>
              )}
            </div>
          </div>
        </div>
        <p className="text-[10px] text-[#8f8f8f] font-semibold mt-1 leading-snug">
          Set your treasury disbursement timeline. Invoices will automatically clear according to this date.
        </p>
      </div>

      {/* Term Selection Segmented Control */}
      <div className="p-1 bg-[#090909] border border-white/20 rounded-xl grid grid-cols-3 gap-1">
        {(["Net-30", "Net-60", "Net-90"] as const).map((item) => {
          const isSelected = term === item;
          return (
            <button
              key={item}
              type="button"
              onClick={() => handleSelectTerm(item)}
              className={`py-2 text-xs font-bold rounded-lg transition-all cursor-pointer text-center ${
                isSelected
                  ? "bg-white text-black shadow-md"
                  : "text-neutral-400 hover:text-white hover:bg-white/[0.04]"
              }`}
            >
              {item}
            </button>
          );
        })}
      </div>

      {/* Net-0 Advance Toggle Section */}
      <div className="pt-3 border-t border-white/10 flex items-start justify-between gap-4">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-xs font-bold text-white">Allow instant Net-0</span>
            <span className="text-[9px] font-black uppercase tracking-wider px-1.5 py-0.5 rounded bg-emerald-950/80 text-emerald-400 border border-emerald-500/30">
              AGNCYPAY LIQUIDITY
            </span>
          </div>
          <p className="text-[10px] text-[#8f8f8f] font-medium leading-snug mt-1">
            Talent/agencies can claim funds on day 0. AgncyPay funds the advance, keeping your terms unchanged.
          </p>
        </div>

        {/* Custom Switch Control */}
        <button
          type="button"
          onClick={handleToggleNet0}
          className={`w-11 h-6 shrink-0 rounded-full p-1 transition-colors duration-200 ease-in-out cursor-pointer relative flex items-center ${
            allowNet0 ? "bg-[#4B6BFB]" : "bg-neutral-800 border border-white/10"
          }`}
        >
          <span
            className={`w-4 h-4 bg-white rounded-full shadow-md transform transition-transform duration-200 ease-in-out ${
              allowNet0 ? "translate-x-5" : "translate-x-0"
            }`}
          />
        </button>
      </div>
    </div>
  );
}
