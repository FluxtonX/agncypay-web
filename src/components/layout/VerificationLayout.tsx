"use client";

import React from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { CheckCircle2, ChevronRight, Lock, ShieldCheck, ArrowLeft } from "lucide-react";
import { useApp } from "../../context/AppContext";
import { VERIFICATION_STEPS } from "../../constants/verificationSteps";
import { Button } from "../ui/Button";
import { cn } from "../../lib/utils";

interface VerificationLayoutProps {
  children: React.ReactNode;
}

export function VerificationLayout({ children }: VerificationLayoutProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { state } = useApp();

  const currentStep = VERIFICATION_STEPS.find((step) => step.path === pathname) || VERIFICATION_STEPS[0];
  const stepIndex = VERIFICATION_STEPS.findIndex((step) => step.path === pathname);

  // Helper to determine step status
  const getStepStatus = (stepPath: string, stepId: number) => {
    const isCurrent = stepPath === pathname;
    
    // Check if approved
    const isApproved = state.verificationStatus === "approved";
    if (isApproved) return "completed";

    // Determine completion based on appState
    let isCompleted = false;

    if (stepId === 1) {
      isCompleted = !!state.businessSetup.legalName && !!state.businessSetup.country;
    } else if (stepId === 2) {
      isCompleted = !!state.representative.fullName && state.representative.idFrontUploaded;
    } else if (stepId === 3) {
      isCompleted = state.authorization.isOwner !== null;
    } else if (stepId === 4) {
      const uploadedCount = state.documents.filter(d => d.status === "uploaded" || d.status === "processing" || d.status === "approved").length;
      isCompleted = uploadedCount >= 4; // at least 4 corporate docs uploaded
    } else if (stepId === 5) {
      isCompleted = state.brand.domainVerified && !!state.brand.officialEmail;
    } else if (stepId === 6) {
      isCompleted = !!state.bankDetails.accountNumber && state.bankDetails.statementUploaded;
    } else if (stepId === 7) {
      isCompleted = state.verificationStatus === "submitted" || state.verificationStatus === "in_review" || state.verificationStatus === "approved";
    }

    if (isCurrent) return "current";
    if (isCompleted) return "completed";
    return "pending";
  };

  const handleStepClick = (path: string, stepId: number) => {
    // Let user navigate freely in draft state, or lock steps if they are submitted/in-review
    if (state.verificationStatus === "submitted" || state.verificationStatus === "in_review") {
      router.push("/verification/status");
      return;
    }
    router.push(path);
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#0A0A0A] text-[#F8FAFC]">
      {/* Header Bar */}
      <header className="h-20 border-b border-[#1F1F1F] bg-[#0A0A0A] px-6 md:px-10 flex items-center justify-between shrink-0">
        <Link href="/" className="flex items-center cursor-pointer">
          <img src="/agncypayLogo.png" alt="AgncyPay" className="h-[4.5rem] w-auto object-contain" />
        </Link>

        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1.5 text-xs text-[#6B7280]">
            <ShieldCheck className="h-3.5 w-3.5 text-[#22C55E]" />
            <span>256-bit Encrypted</span>
          </div>
          <Link href="/dashboard" className="text-xs text-[#6B7280] hover:text-white transition-colors">
            Go to Dashboard
          </Link>
        </div>
      </header>

      {/* Main Stepper Grid */}
      <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
        {/* Left Sidebar Stepper */}
        <aside className="w-full md:w-72 border-b md:border-b-0 md:border-r border-[#1F1F1F] bg-[#0A0A0A] p-5 overflow-y-auto md:max-h-[calc(100vh-3.5rem)]">
          <div className="mb-5">
            <h2 className="text-sm font-bold text-white">Corporate Onboarding</h2>
            <p className="text-xs text-[#6B7280] mt-1">Complete your KYB profile.</p>

            {/* Progress Bar */}
            <div className="mt-4 flex items-center justify-between text-xs mb-1.5">
              <span className="text-[#4B5563]">Progress</span>
              <span className="font-bold text-white">{Math.round(((stepIndex) / 8) * 100)}%</span>
            </div>
            <div className="w-full bg-[#1F1F1F] h-1 rounded-full overflow-hidden">
              <div
                className="h-1 bg-white rounded-full transition-all duration-300"
                style={{ width: `${Math.max(8, ((stepIndex) / 8) * 100)}%` }}
              />
            </div>
          </div>

          {/* Stepper items */}
          <div className="space-y-0.5">
            {VERIFICATION_STEPS.map((step) => {
              const status = getStepStatus(step.path, step.id);
              const isActive = pathname === step.path;
              
              return (
                <button
                  key={step.id}
                  onClick={() => handleStepClick(step.path, step.id)}
                  disabled={state.verificationStatus === "submitted" || state.verificationStatus === "in_review"}
                  className={cn(
                    "w-full text-left px-3 py-2.5 rounded-lg flex items-center justify-between gap-3 transition-all cursor-pointer",
                    isActive
                      ? "bg-white text-black"
                      : "text-[#6B7280] hover:bg-[#111] hover:text-white"
                  )}
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div
                      className={cn(
                        "h-5 w-5 rounded-full flex items-center justify-center font-bold text-[10px] shrink-0 transition-all",
                        status === "completed"
                          ? "bg-[#22C55E] text-black"
                          : isActive
                          ? "bg-black/20 text-black"
                          : "bg-[#1F1F1F] text-[#4B5563]"
                      )}
                    >
                      {status === "completed" ? "✓" : step.id}
                    </div>
                    <div className="min-w-0">
                      <p className={cn("text-[13px] font-semibold truncate leading-tight", isActive ? "text-black" : "")}>
                        {step.label}
                      </p>
                    </div>
                  </div>
                  <ChevronRight className={cn("h-3 w-3 shrink-0", isActive ? "text-black/40" : "text-[#2A2A2A]")} />
                </button>
              );
            })}
          </div>
        </aside>

        {/* Right Form Body */}
        <div className="flex-1 flex flex-col bg-[#0A0A0A] overflow-y-auto max-h-[calc(100vh-3.5rem)] p-6 md:py-8 md:px-10">
          <div className="max-w-2xl mx-auto w-full">
            {/* Step indicator */}
            <div className="mb-5 flex items-center gap-2 text-xs text-[#4B5563] font-semibold tracking-wide">
              <span className="text-[#6B7280]">STEP {currentStep.id} OF 8</span>
              <span className="text-[#2A2A2A]">&bull;</span>
              <span className="text-white font-bold">{currentStep.label}</span>
            </div>

            {/* Bordered Form Box */}
            <div className="rounded-xl border border-[#222] bg-[#0D0D0D] p-6 md:p-8">
              <motion.div
                key={pathname}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.25, ease: "easeOut" }}
              >
                {children}
              </motion.div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
