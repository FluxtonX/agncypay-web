"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { ArrowRight, CheckCircle2, Clock3, Lock } from "lucide-react";
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

  const checklist = [
    { label: "Business information submitted", done: !!state.businessSetup.legalName },
    { label: "Representative identity uploaded", done: state.representative.idFrontUploaded },
    {
      label: "Company documents uploaded",
      done:
        state.documents.filter((doc) =>
          ["uploaded", "approved", "processing"].includes(doc.status)
        ).length >= 4,
    },
    {
      label: "Adidas brand authorization uploaded",
      done: state.brand.domainVerified && state.brand.trademarkCertUploaded,
    },
    {
      label: "Manual compliance review",
      done: state.verificationStatus === "approved",
      pending: state.verificationStatus === "submitted" || state.verificationStatus === "in_review",
    },
    {
      label: "Bank account verification",
      done: state.bankDetails.status === "approved",
      pending: state.bankDetails.status === "processing",
    },
  ];

  return (
    <div className="space-y-6">
      <Card className="relative flex flex-col justify-between gap-4 overflow-hidden border-[#333] bg-[#050505] p-5 sm:flex-row sm:items-center">
        <div className="flex items-start gap-3">
          <div className="shrink-0 rounded-lg border border-[#333] bg-[#111] p-2.5 text-white">
            <Lock className="h-5 w-5" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white">Verification Status: Locked</h3>
            <p className="mt-1 max-w-xl text-xs leading-relaxed text-[#94A3B8]">
              Your Adidas corporate account is in{" "}
              <span className="font-semibold uppercase text-white">
                {state.verificationStatus.replace("_", " ")}
              </span>
              . Pay With AgncyPay features are locked until company details are approved.
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

      <Card className="space-y-4 border-white/[0.04] p-5">
        <h4 className="text-xs font-bold uppercase tracking-wider text-white">
          Adidas Verification Checklist
        </h4>
        <div className="grid grid-cols-1 gap-3 text-xs sm:grid-cols-2">
          {checklist.map((item) => (
            <div
              key={item.label}
              className="flex items-center gap-2.5 rounded-lg border border-white/[0.04] bg-white/[0.01] p-2.5"
            >
              {item.done ? (
                <CheckCircle2 className="h-4.5 w-4.5 shrink-0 text-white" />
              ) : item.pending ? (
                <span className="relative flex h-4.5 w-4.5 shrink-0">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-white/20 opacity-75" />
                  <span className="relative inline-flex h-4.5 w-4.5 items-center justify-center rounded-full border border-white/40 bg-white/10 text-white">
                    <Clock3 className="h-3 w-3" />
                  </span>
                </span>
              ) : (
                <div className="flex h-4.5 w-4.5 shrink-0 items-center justify-center rounded-full border border-white/10 text-[#94A3B8]/40">
                  <Clock3 className="h-3 w-3" />
                </div>
              )}
              <span
                className={
                  item.done
                    ? "font-medium text-white line-through decoration-[#94A3B8]/30"
                    : "font-medium text-[#94A3B8]"
                }
              >
                {item.label}
              </span>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
