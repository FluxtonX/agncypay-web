"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { Lock, ShieldAlert, ArrowRight, CheckCircle2 } from "lucide-react";
import { useApp } from "../../context/AppContext";
import { Card } from "../ui/Card";
import { Button } from "../ui/Button";

interface VerificationGateProps {
  children?: React.ReactNode;
}

export function VerificationGate({ children }: VerificationGateProps) {
  const router = useRouter();
  const { state } = useApp();
  const isApproved = state.verificationStatus === "approved";

  if (isApproved) {
    return <>{children}</>;
  }

  // Pending checklist items
  const checklist = [
    { label: "Business information submitted", done: !!state.businessSetup.legalName },
    { label: "Representative identity uploaded", done: state.representative.idFrontUploaded },
    { label: "Company documents uploaded", done: state.documents.filter(d => d.status === "uploaded" || d.status === "approved" || d.status === "processing").length >= 4 },
    { label: "Adidas brand authorization uploaded", done: state.brand.domainVerified && state.brand.trademarkCertUploaded },
    { label: "Manual compliance review", done: state.verificationStatus === "approved", pending: state.verificationStatus === "submitted" || state.verificationStatus === "in_review" },
    { label: "Bank account verification", done: state.bankDetails.status === "approved", pending: state.bankDetails.status === "processing" },
  ];

  return (
    <div className="space-y-6">
      {/* Locked Alert Box */}
      <Card className="border-[#F59E0B]/20 bg-[#F59E0B]/5 p-5 relative overflow-hidden flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        {/* Glow */}
        <div className="absolute top-0 right-0 h-24 w-24 bg-[#F59E0B]/5 blur-2xl" />

        <div className="flex items-start gap-3">
          <div className="p-2.5 rounded-lg bg-[#F59E0B]/10 text-[#F59E0B] shrink-0">
            <Lock className="h-5 w-5" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white">Verification Status: Locked</h3>
            <p className="text-xs text-[#94A3B8] max-w-xl mt-1 leading-relaxed">
              Your Adidas corporate account is in <span className="font-semibold text-[#F59E0B] uppercase">{state.verificationStatus.replace("_", " ")}</span>. Pay With AgncyPay features are locked until company details are approved.
            </p>
          </div>
        </div>
        
        <Button
          size="sm"
          variant="secondary"
          rightIcon={<ArrowRight className="h-3.5 w-3.5" />}
          onClick={() => router.push("/dashboard/verification")}
          className="shrink-0"
        >
          Check Onboarding
        </Button>
      </Card>

      {/* Progress checklist card */}
      <Card className="border-white/[0.04] p-5 space-y-4">
        <h4 className="text-xs font-bold text-white uppercase tracking-wider">
          Adidas Verification Checklist
        </h4>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
          {checklist.map((item, idx) => (
            <div
              key={idx}
              className="flex items-center gap-2.5 bg-white/[0.01] border border-white/[0.04] rounded-lg p-2.5"
            >
              {item.done ? (
                <CheckCircle2 className="h-4.5 w-4.5 text-[#22C55E] shrink-0" />
              ) : item.pending ? (
                <span className="flex h-4.5 w-4.5 relative shrink-0">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#F59E0B] opacity-75" />
                  <span className="relative inline-flex rounded-full h-4.5 w-4.5 bg-[#F59E0B]/20 border border-[#F59E0B] flex items-center justify-center text-[10px] font-bold text-[#F59E0B]">⏳</span>
                </span>
              ) : (
                <div className="h-4.5 w-4.5 rounded-full border border-white/10 flex items-center justify-center text-[8px] text-[#94A3B8]/40 shrink-0">
                  ⏳
                </div>
              )}
              <span className={item.done ? "text-white font-medium line-through decoration-[#94A3B8]/30" : "text-[#94A3B8] font-medium"}>
                {item.label}
              </span>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
