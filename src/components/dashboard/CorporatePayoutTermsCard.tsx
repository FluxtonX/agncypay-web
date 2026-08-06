"use client";

import React, { useState } from "react";
import { Clock, ShieldCheck, CheckCircle2 } from "lucide-react";

interface CorporatePayoutTermsCardProps {
  invoiceId: string;
  initialTerm?: string;
}

export function CorporatePayoutTermsCard({ invoiceId, initialTerm = "Net-30" }: CorporatePayoutTermsCardProps) {
  const [selectedTerm, setSelectedTerm] = useState(initialTerm);
  const [saved, setSaved] = useState(false);

  const terms = [
    { label: "Net-15", desc: "15 days settlement window" },
    { label: "Net-30", desc: "Standard 30 days corporate term" },
    { label: "Net-60", desc: "Extended 60 days enterprise term" },
    { label: "Net-90", desc: "Custom 90 days enterprise term" }
  ];

  const handleSelect = (term: string) => {
    setSelectedTerm(term);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className="bg-[#0D0D0D] border border-white/20 rounded-2xl p-6 shadow-xl space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="p-2.5 bg-emerald-500/10 rounded-xl border border-emerald-500/20 text-emerald-400">
            <Clock className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white uppercase tracking-wider">Corporate Payout Terms</h3>
            <p className="text-xs text-[#8f8f8f]">Configure treasury settlement schedule for invoice #{invoiceId.slice(-6)}</p>
          </div>
        </div>
        {saved && (
          <span className="flex items-center space-x-1 text-xs font-semibold text-emerald-400 bg-emerald-950/40 px-2.5 py-1 rounded-full border border-emerald-800/30">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>Updated</span>
          </span>
        )}
      </div>

      <div className="grid grid-cols-2 gap-3 pt-2">
        {terms.map((t) => {
          const isSelected = selectedTerm === t.label;
          return (
            <button
              key={t.label}
              type="button"
              onClick={() => handleSelect(t.label)}
              className={`p-3 rounded-xl border text-left transition-all ${
                isSelected
                  ? "border-emerald-500 bg-emerald-500/10 text-white shadow-md shadow-emerald-500/10"
                  : "border-white/10 bg-white/5 text-[#8f8f8f] hover:border-white/20 hover:text-white"
              }`}
            >
              <div className="text-xs font-bold">{t.label}</div>
              <div className="text-[10px] text-neutral-400 mt-0.5">{t.desc}</div>
            </button>
          );
        })}
      </div>

      <div className="pt-2 flex items-center justify-between text-[11px] text-[#8f8f8f] border-t border-white/10">
        <span className="flex items-center gap-1.5">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
          Guaranteed Auto-disbursement
        </span>
        <span className="font-semibold text-white">Active Term: {selectedTerm}</span>
      </div>
    </div>
  );
}

export default CorporatePayoutTermsCard;
