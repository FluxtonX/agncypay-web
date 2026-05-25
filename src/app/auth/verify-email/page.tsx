"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { MailOpen, ShieldAlert, ArrowRight } from "lucide-react";
import { useApp } from "../../../context/AppContext";
import { Input } from "../../../components/ui/Input";
import { Button } from "../../../components/ui/Button";
import { Card } from "../../../components/ui/Card";
import { normalizeWorkspaceType } from "../../../types/workspace";

export default function VerifyEmailPage() {
  const router = useRouter();
  const { state, verifyEmail } = useApp();
  
  const [code, setCode] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const workspaceType = state.user ? normalizeWorkspaceType(state.user.accountType) : "brand";
  const verificationRoute =
    workspaceType === "talent_agency" || workspaceType === "talent_independent"
      ? "/verification/representative"
      : "/verification/business-info";

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    // if (code.length !== 6) {
    //   setError("Please enter a valid 6-digit confirmation code.");
    //   return;
    // }

    setIsLoading(true);
    setTimeout(() => {
      // Simulate checking code
      const verified = verifyEmail(code);
      setIsLoading(false);
      
      // Bypass validation check and always navigate in the simulator.
      router.push(verificationRoute);
      
      // if (verified) {
      //   router.push(verificationRoute);
      // } else {
      //   setError("Invalid confirmation code. (Use code '123456' for simulation)");
      // }
    }, 1500);
  };

  const handleResend = () => {
    alert("Simulation: A new 6-digit verification code has been dispatched.");
  };

  return (
    <div className="min-h-screen bg-[#0A0A0A] text-[#F8FAFC] flex items-center justify-center p-6 relative overflow-hidden">
      <div className="w-full max-w-md space-y-6 z-10">
        {/* Logo */}
        <div className="text-center space-y-2">
          <Link href="/" className="inline-flex items-center">
            <img src="/agncypayLogo.png" alt="AgncyPay" className="h-16 w-auto object-contain" />
          </Link>
          <h2 className="text-xl font-bold tracking-tight text-white mt-4">
            Verify your email address
          </h2>
          <p className="text-xs text-[#8f8f8f]">
            Enter the 6-digit verification code dispatched to <span className="font-semibold text-white">{state.user?.email || "your email"}</span>.
          </p>
        </div>

        <Card className="border-[#1F1F1F] p-6 space-y-5 bg-[#0D0D0D]">
          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              id="code"
              type="text"
              label="6-Digit Confirmation Code"
              value={code}
              onChange={(e) => {
                setCode(e.target.value);
                if (error) setError("");
              }}
              error={error}
              maxLength={6}
              leftIcon={<MailOpen className="h-4 w-4" />}
              placeholder="e.g. 123456"
            />

            {/* Warning block about enterprise email verification */}
            <div className="flex items-start gap-2 rounded-lg border border-[#444] bg-black p-3 text-[11px] leading-relaxed text-[#8f8f8f]">
              <ShieldAlert className="mt-0.5 h-4 w-4 shrink-0 text-white" />
              <div>
                <span className="font-semibold text-white">Security Tip:</span> Email verification protects your Agncy identity before {workspaceType === "talent_agency" || workspaceType === "talent_independent" ? "KYC" : "KYB"} starts.
              </div>
            </div>

            <Button
              type="submit"
              variant="primary"
              className="w-full mt-2"
              isLoading={isLoading}
            >
              Verify & Complete Registration
            </Button>
          </form>

          {/* Resend actions */}
          <div className="flex items-center justify-between pt-1 text-xs text-[#8f8f8f]">
            <span>Didn&apos;t receive code?</span>
            <button
              onClick={handleResend}
              className="cursor-pointer font-semibold text-white hover:underline"
            >
              Resend Code
            </button>
          </div>

          <div className="relative flex py-1 items-center text-xs">
            <div className="flex-grow border-t border-[#1F1F1F]" />
            <span className="mx-4 flex-shrink text-[#777]">SIMULATOR HINT</span>
            <div className="flex-grow border-t border-[#1F1F1F]" />
          </div>

          <button
            type="button"
            onClick={() => setCode("123456")}
            className="flex w-full cursor-pointer items-center justify-center gap-1.5 rounded-lg border border-dashed border-[#444] p-2 text-xs font-semibold text-[#8f8f8f] transition-colors hover:border-[#777] hover:text-white"
          >
            Auto-fill mock code: <span className="font-bold text-white">123456</span>
          </button>
        </Card>
      </div>
    </div>
  );
}
