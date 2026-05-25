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

  useEffect(() => {
    if (state.verificationStatus !== "approved") return;

    const redirectTimer = setTimeout(() => {
      router.push("/dashboard");
    }, 1800);

    return () => clearTimeout(redirectTimer);
  }, [router, state.verificationStatus]);

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
            <ShieldCheck className="h-5 w-5 text-white" />
            Verification Desk
          </h1>
          <p className="text-xs text-[#8f8f8f] leading-relaxed">
            Real-time status tracking for the active workspace verification check.
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
            <RefreshCw className="h-14 w-14 text-white animate-spin stroke-[1.5px]" />
            <Lock className="absolute h-5 w-5 text-white animate-pulse" />
          </div>

          <div className="space-y-1.5 max-w-sm">
            <h3 className="text-base font-bold text-white">Compliance Audit in Progress</h3>
            <p className="text-xs text-[#8f8f8f] leading-relaxed">
              Our simulator is checking the submitted workspace identity and payout readiness. Review completes in <span className="font-bold text-white">{secondsRemaining}s</span>.
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
                    completed ? "text-white" : "text-[#6b6b6b]"
                  )}
                >
                  {completed ? (
                    <CheckCircle2 className="h-4 w-4 shrink-0" />
                  ) : (
                    <RefreshCw className="h-4 w-4 shrink-0 animate-spin text-white" />
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
        <Card className="border-[#555] p-6 space-y-6 bg-[#0D0D0D] text-center flex flex-col items-center justify-center min-h-[350px]">
          <div className="h-14 w-14 rounded-full bg-white border border-white flex items-center justify-center text-black">
            <CheckCircle2 className="h-8 w-8" />
          </div>

          <div className="space-y-1.5 max-w-md">
            <h3 className="text-lg font-black text-white tracking-tight">Workspace Verification Approved</h3>
            <p className="text-xs text-[#8f8f8f] leading-relaxed">
              Your demo verification is complete. Permissioned dashboard actions are now active.
            </p>
          </div>

          {/* Verification stamp log */}
          <div className="w-full max-w-sm bg-black/40 border border-[#1F1F1F] p-3 rounded-lg text-left text-[11px] text-[#8f8f8f] space-y-1">
            <p><span className="font-semibold text-white">Compliance Seal:</span> AP-DE-984021</p>
            <p><span className="font-semibold text-white">Verification Date:</span> {new Date().toLocaleDateString()}</p>
            <p><span className="font-semibold text-white">Brand Email:</span> Accepted</p>
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

      {/* STATE 3: ACTION REQUIRED */}
      {state.verificationStatus === "requires_action" && (
        <Card className="border-[#555] p-6 space-y-6 bg-[#0D0D0D] text-center flex flex-col items-center justify-center min-h-[350px]">
          <div className="h-14 w-14 rounded-full bg-[#111] border border-[#555] flex items-center justify-center text-white">
            <AlertTriangle className="h-7 w-7" />
          </div>

          <div className="space-y-1.5 max-w-md">
            <h3 className="text-lg font-black text-white tracking-tight">Verification Action Required</h3>
            <p className="text-xs text-[#b8b8b8] leading-relaxed">
              The demo checker needs one more review before approval.
            </p>
          </div>

          <div className="w-full max-w-md bg-black border border-[#555] p-4 rounded-xl text-left text-xs space-y-2 text-[#8f8f8f]">
            <p className="font-semibold text-white flex items-center gap-1.5">
              <AlertTriangle className="h-4 w-4 text-white" />
              Reason for Action Required:
            </p>
            <p className="leading-relaxed">
              Continue back to the relevant verification step and save again. Demo mode accepts submitted workspace details and will approve on final submit.
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
