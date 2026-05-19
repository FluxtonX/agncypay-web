"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ShieldCheck, CheckCircle2, AlertTriangle, RefreshCw, Lock, ArrowRight, ArrowLeft } from "lucide-react";
import { useApp } from "../../../context/AppContext";
import { Card } from "../../../components/ui/Card";
import { Button } from "../../../components/ui/Button";
import { Badge } from "../../../components/ui/Badge";
import { cn } from "../../../lib/utils";

export default function VerificationStatusPage() {
  const router = useRouter();
  const { state, setVerificationStatusDirectly } = useApp();
  const [secondsRemaining, setSecondsRemaining] = useState(7);

  // Micro stages of the compliance check
  const reviewStages = [
    { label: "Querying corporate registers (Bundesanzeiger)", time: 5.5 },
    { label: "Validating representative identification certificates", time: 4.5 },
    { label: "Checking official Adidas brand trademarks", time: 3 },
    { label: "Activating secure payout pathways", time: 1.5 },
  ];

  useEffect(() => {
    if (state.verificationStatus !== "submitted" && state.verificationStatus !== "in_review") return;

    setSecondsRemaining(7);
    const interval = setInterval(() => {
      setSecondsRemaining((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [state.verificationStatus]);

  const handleReturnToDashboard = () => {
    router.push("/dashboard");
  };

  const handleFixIssues = () => {
    // Redirect to brand check step
    router.push("/verification/brand");
  };

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
        <div className="space-y-1">
          <h1 className="text-xl font-bold text-white flex items-center gap-2">
            <ShieldCheck className="h-5 w-5 text-[#10B981]" />
            KYB Compliance Desk
          </h1>
          <p className="text-xs text-[#6B7280] leading-relaxed">
            Real-time status tracking of your corporate verification check.
          </p>
        </div>
        <Badge variant={badgeProps.variant} size="md">
          {badgeProps.label}
        </Badge>
      </div>

      {/* STATE 1: PROCESSING / UNDER REVIEW */}
      {(state.verificationStatus === "submitted" || state.verificationStatus === "in_review") && (
        <Card className="border-[#1F1F1F] p-6 space-y-6 bg-[#0D0D0D] text-center flex flex-col items-center justify-center min-h-[350px]">
          <div className="relative flex items-center justify-center">
            <RefreshCw className="h-14 w-14 text-[#10B981] animate-spin stroke-[1.5px]" />
            <Lock className="absolute h-5 w-5 text-white animate-pulse" />
          </div>

          <div className="space-y-1.5 max-w-sm">
            <h3 className="text-base font-bold text-white">Compliance Audit in Progress</h3>
            <p className="text-xs text-[#6B7280] leading-relaxed">
              Our automated system is verifying signatures against trademark certificates. (Simulated review completion in <span className="font-bold text-[#10B981]">{secondsRemaining}s</span>)
            </p>
          </div>

          {/* Micro review steps */}
          <div className="w-full max-w-md bg-[#0A0A0A] p-4 rounded-xl border border-[#1F1F1F] text-left space-y-3 text-xs">
            {reviewStages.map((stage, idx) => {
              const completed = secondsRemaining < stage.time;
              return (
                <div
                  key={idx}
                  className={cn(
                    "flex items-center gap-2.5 transition-all duration-300",
                    completed ? "text-[#22C55E]" : "text-[#6B7280]/30"
                  )}
                >
                  {completed ? (
                    <CheckCircle2 className="h-4 w-4 shrink-0" />
                  ) : (
                    <RefreshCw className="h-4 w-4 shrink-0 animate-spin text-[#10B981]" />
                  )}
                  <span>{stage.label}</span>
                </div>
              );
            })}
          </div>

          <Button variant="ghost" onClick={handleReturnToDashboard}>
            Go to read-only Dashboard
          </Button>
        </Card>
      )}

      {/* STATE 2: APPROVED */}
      {state.verificationStatus === "approved" && (
        <Card className="border-[#22C55E]/20 p-6 space-y-6 bg-[#0D0D0D] text-center flex flex-col items-center justify-center min-h-[350px]">
          <div className="h-14 w-14 rounded-full bg-[#22C55E]/10 border border-[#22C55E]/20 flex items-center justify-center text-[#22C55E] shadow-[0_0_25px_rgba(34,197,94,0.2)]">
            <CheckCircle2 className="h-8 w-8" />
          </div>

          <div className="space-y-1.5 max-w-md">
            <h3 className="text-lg font-black text-white tracking-tight">Corporate Verification Approved</h3>
            <p className="text-xs text-[#6B7280] leading-relaxed">
              Your registered entity (<span className="font-semibold text-white">Adidas AG</span>) has been authenticated. Full treasury payments are now active.
            </p>
          </div>

          {/* Verification stamp log */}
          <div className="w-full max-w-sm bg-black/40 border border-[#1F1F1F] p-3 rounded-lg text-left text-[11px] text-[#6B7280] space-y-1">
            <p><span className="font-semibold text-white">Compliance Seal:</span> AP-DE-984021</p>
            <p><span className="font-semibold text-white">Verification Date:</span> {new Date().toLocaleDateString()}</p>
            <p><span className="font-semibold text-white">Official Domain:</span> adidas.com (Verified)</p>
          </div>

          <div className="flex gap-4">
            <Button
              variant="primary"
              rightIcon={<ArrowRight className="h-4 w-4" />}
              onClick={handleReturnToDashboard}
            >
              Enter Dashboard Portal
            </Button>
          </div>
        </Card>
      )}

      {/* STATE 3: ACTION REQUIRED (DOMAIN MISMATCH) */}
      {state.verificationStatus === "requires_action" && (
        <Card className="border-[#EF4444]/20 p-6 space-y-6 bg-[#0D0D0D] text-center flex flex-col items-center justify-center min-h-[350px]">
          <div className="h-14 w-14 rounded-full bg-[#EF4444]/10 border border-[#EF4444]/20 flex items-center justify-center text-[#EF4444] shadow-[0_0_20px_rgba(239,68,68,0.15)]">
            <AlertTriangle className="h-7 w-7" />
          </div>

          <div className="space-y-1.5 max-w-md">
            <h3 className="text-lg font-black text-white tracking-tight">Verification Action Required</h3>
            <p className="text-xs text-[#EF4444] leading-relaxed">
              The compliance checker flagged a public domain mismatch in your brand setup.
            </p>
          </div>

          <div className="w-full max-w-md bg-[#EF4444]/5 border border-[#EF4444]/10 p-4 rounded-xl text-left text-xs space-y-2 text-[#6B7280]">
            <p className="font-semibold text-white flex items-center gap-1.5">
              <AlertTriangle className="h-4 w-4 text-[#F59E0B]" />
              Reason for Action Required:
            </p>
            <p className="leading-relaxed">
              For branded enterprise workspaces like <span className="font-semibold text-white">Adidas AG</span>, you must verify ownership via a corporate email domain check (e.g. name@adidas.com or name@adidas-group.com). Generic emails like Gmail / Yahoo are blocked from direct auto-approval to prevent brand-jacking.
            </p>
          </div>

          <div className="flex gap-3">
            <Button variant="outline" onClick={handleReturnToDashboard}>
              Read-Only Dashboard
            </Button>
            <Button variant="primary" onClick={handleFixIssues}>
              Change Brand Email
            </Button>
          </div>
        </Card>
      )}
    </div>
  );
}
