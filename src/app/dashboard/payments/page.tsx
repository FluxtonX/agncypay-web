"use client";

import React, { useState } from "react";
import { CreditCard, Landmark, Plus, ShieldCheck, AlertCircle } from "lucide-react";
import { useApp } from "../../../context/AppContext";
import { Card } from "../../../components/ui/Card";
import { Button } from "../../../components/ui/Button";
import { Badge } from "../../../components/ui/Badge";
import { Input } from "../../../components/ui/Input";

export default function PaymentsPage() {
  const { state } = useApp();
  const isApproved = state.verificationStatus === "approved";

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-xl font-bold text-white tracking-tight">
            Payout & Funding Accounts
          </h1>
          <p className="text-xs text-[#94A3B8] mt-0.5">
            Configure settlement pathways and bank authorization tokens.
          </p>
        </div>

        {isApproved && (
          <Button
            size="sm"
            variant="secondary"
            leftIcon={<Plus className="h-4 w-4" />}
            onClick={() => alert("Simulation: Bank account linking is initiated via secure Plaid portals.")}
          >
            Add Funding Account
          </Button>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Bank Details */}
        <div className="lg:col-span-2 space-y-6">
          <Card className="border-white/[0.06] p-6 space-y-5 bg-[#070B14]">
            <div className="flex justify-between items-start pb-4 border-b border-white/[0.06]">
              <div className="flex gap-3 items-center">
                <div className="h-10 w-10 bg-[#8B5CF6]/15 border border-[#8B5CF6]/20 rounded-lg flex items-center justify-center text-[#8B5CF6]">
                  <Landmark className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white">Primary Settlement Bank</h3>
                  <p className="text-xs text-[#94A3B8]/60 mt-0.5">Used for active invoice disbursements</p>
                </div>
              </div>
              
              <Badge variant={isApproved ? "success" : "warning"}>
                {isApproved ? "Direct Pay Enabled" : "Verification Pending"}
              </Badge>
            </div>

            {/* Display bank credentials */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div className="bg-white/[0.01] border border-white/[0.04] p-3 rounded-lg">
                <span className="text-[#94A3B8]/60 uppercase tracking-wider text-[9px] font-bold">Account Holder</span>
                <p className="font-bold text-white mt-1">{state.bankDetails.accountHolderName || "Adidas AG (Draft)"}</p>
              </div>
              
              <div className="bg-white/[0.01] border border-white/[0.04] p-3 rounded-lg">
                <span className="text-[#94A3B8]/60 uppercase tracking-wider text-[9px] font-bold">Bank Name</span>
                <p className="font-bold text-white mt-1">{state.bankDetails.bankName || "Deutsche Bank AG"}</p>
              </div>

              <div className="bg-white/[0.01] border border-white/[0.04] p-3 rounded-lg">
                <span className="text-[#94A3B8]/60 uppercase tracking-wider text-[9px] font-bold">IBAN / Account Number</span>
                <p className="font-mono font-bold text-white mt-1">{state.bankDetails.accountNumber || "DE89 3704 0044..."}</p>
              </div>

              <div className="bg-white/[0.01] border border-white/[0.04] p-3 rounded-lg">
                <span className="text-[#94A3B8]/60 uppercase tracking-wider text-[9px] font-bold">SWIFT / Routing Code</span>
                <p className="font-mono font-bold text-white mt-1">{state.bankDetails.routingNumber || "DEUTDEDDFXX"}</p>
              </div>
            </div>

            {/* Security Note */}
            <div className="flex items-start gap-2 bg-[#22C55E]/5 border border-[#22C55E]/10 p-3 rounded-lg text-xs text-[#22C55E] leading-relaxed">
              <ShieldCheck className="h-4.5 w-4.5 shrink-0 mt-0.5" />
              <span>
                Bank accounts linked in onboarding setup are vaulted. Modifying payout structures requires executive signature consent.
              </span>
            </div>
          </Card>
        </div>

        {/* Payment Methods Info Side panel */}
        <div className="space-y-4">
          <h4 className="text-xs font-bold text-white uppercase tracking-wider">Disbursement Settings</h4>
          <Card className="border-white/[0.04] p-4 bg-[#070B14] space-y-4 text-xs">
            <div className="space-y-1">
              <span className="text-[#94A3B8]/60">Settlement Currency</span>
              <p className="font-bold text-white">USD - United States Dollar</p>
            </div>
            <div className="space-y-1">
              <span className="text-[#94A3B8]/60">Default Settle Velocity</span>
              <p className="font-bold text-[#06B6D4]">Instant ACH Settlement</p>
            </div>
            <div className="space-y-1">
              <span className="text-[#94A3B8]/60">Fees Structure</span>
              <p className="font-bold text-[#22C55E]">0.00% (Corporate SaaS Waiver)</p>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
