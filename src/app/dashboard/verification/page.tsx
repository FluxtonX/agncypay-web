"use client";

import React from "react";
import { ShieldCheck, CheckCircle2, AlertTriangle, ArrowRight, Lock } from "lucide-react";
import { useApp } from "../../../context/AppContext";
import { VerificationGate } from "../../../components/dashboard/VerificationGate";
import { Card } from "../../../components/ui/Card";
import { Badge } from "../../../components/ui/Badge";
import { Button } from "../../../components/ui/Button";

export default function VerificationPage() {
  const { state } = useApp();
  const isApproved = state.verificationStatus === "approved";

  const badgeProps = {
    draft: { variant: "neutral" as const, label: "Draft" },
    submitted: { variant: "secondary" as const, label: "Submitted" },
    in_review: { variant: "warning" as const, label: "In Review" },
    requires_action: { variant: "error" as const, label: "Action Required" },
    approved: { variant: "success" as const, label: "Approved" },
    rejected: { variant: "error" as const, label: "Rejected" },
    suspended: { variant: "error" as const, label: "Suspended" },
  }[state.verificationStatus] || { variant: "neutral" as const, label: "Unknown" };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-xl font-bold text-white tracking-tight">
            Corporate KYB Verification
          </h1>
          <p className="text-xs text-[#94A3B8] mt-0.5">
            Audit logs and manual review checkmarks.
          </p>
        </div>

        <Badge variant={badgeProps.variant} size="md">
          {badgeProps.label}
        </Badge>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left main status widget */}
        <div className="lg:col-span-2 space-y-6">
          <VerificationGate />

          {isApproved && (
            <Card className="border-[#22C55E]/20 bg-[#22C55E]/5 p-5 text-xs text-[#94A3B8] leading-relaxed flex items-start gap-3">
              <CheckCircle2 className="h-5 w-5 text-[#22C55E] shrink-0 mt-0.5" />
              <div>
                <span className="font-bold text-white">Verification Seal Active:</span> Your brand domain <span className="underline font-semibold text-white">adidas.com</span> and business registry licenses are verified. Settle vendor billing limits up to $1,000,000.
              </div>
            </Card>
          )}
        </div>

        {/* Right review logs */}
        <div className="space-y-4">
          <h4 className="text-xs font-bold text-white uppercase tracking-wider">Compliance Details</h4>
          <Card className="border-white/[0.04] p-4 bg-[#070B14] space-y-3.5 text-xs">
            <div className="space-y-1">
              <span className="text-[#94A3B8]/60">Authorized Signatory</span>
              <p className="font-bold text-white">{state.representative.fullName || "Martin Safi (Treasury)"}</p>
            </div>
            <div className="space-y-1">
              <span className="text-[#94A3B8]/60">Registered Entity</span>
              <p className="font-bold text-white">{state.businessSetup.legalName || "Adidas AG"}</p>
            </div>
            <div className="space-y-1">
              <span className="text-[#94A3B8]/60">VAT Number</span>
              <p className="font-bold text-white">{state.businessSetup.taxId || "DE 132492835"}</p>
            </div>
            <div className="space-y-1">
              <span className="text-[#94A3B8]/60">Security Encrypted Hash</span>
              <p className="font-mono text-[#06B6D4] truncate">ap_984021_compliance_audit</p>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
