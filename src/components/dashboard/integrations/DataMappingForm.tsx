"use client";

import React, { useState } from "react";
import { CheckCircle2, Loader2 } from "lucide-react";

type ChartAccount = {
  id: string;
  name: string;
};

export function DataMappingForm({ 
  chartOfAccounts,
  onSaved 
}: { 
  chartOfAccounts: ChartAccount[];
  onSaved?: () => void;
}) {
  const [isSaving, setIsSaving] = useState(false);
  const [isSaved, setIsSaved] = useState(false);

  const handleSave = () => {
    setIsSaving(true);
    setIsSaved(false);
    
    // Simulate API save delay
    setTimeout(() => {
      setIsSaving(false);
      setIsSaved(true);
      
      if (onSaved) {
        onSaved();
      }
      
      // Reset success state after 3 seconds
      setTimeout(() => {
        setIsSaved(false);
      }, 3000);
    }, 1500);
  };

  return (
    <div className="mt-[28px] space-y-[20px] border-t border-[#222] pt-[24px]">
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
        <div className="space-y-[8px]">
          <label className="text-[15px] font-medium text-[#e2e2e2]">Sync Contractor Payments To</label>
          <select className="h-[44px] w-full rounded-[8px] border border-[#333] bg-[#0c0c0c] px-[14px] text-[15px] text-white outline-none focus:border-[#777]">
            <option value="">Select an account...</option>
            {chartOfAccounts.map(acc => (
              <option key={acc.id} value={acc.id}>{acc.id} - {acc.name}</option>
            ))}
          </select>
        </div>
        
        <div className="space-y-[8px]">
          <label className="text-[15px] font-medium text-[#e2e2e2]">Sync Platform Fees To</label>
          <select className="h-[44px] w-full rounded-[8px] border border-[#333] bg-[#0c0c0c] px-[14px] text-[15px] text-white outline-none focus:border-[#777]">
            <option value="">Select an account...</option>
            {chartOfAccounts.map(acc => (
              <option key={acc.id} value={acc.id}>{acc.id} - {acc.name}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="pt-[16px] flex items-center gap-4">
        <button 
          onClick={handleSave}
          disabled={isSaving}
          className="flex h-[42px] min-w-[180px] items-center justify-center gap-2 rounded-[7px] bg-white px-[24px] text-[15px] font-semibold text-black transition-colors hover:bg-[#e8e8e8] disabled:opacity-70"
        >
          {isSaving ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Saving...
            </>
          ) : isSaved ? (
            <>
              <CheckCircle2 className="h-4 w-4 text-green-600" />
              Configuration Saved!
            </>
          ) : (
            "Save Configuration"
          )}
        </button>
      </div>
    </div>
  );
}
