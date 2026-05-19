"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { MailOpen, ShieldAlert, ArrowRight } from "lucide-react";
import { useApp } from "../../../context/AppContext";
import { Input } from "../../../components/ui/Input";
import { Button } from "../../../components/ui/Button";
import { Card } from "../../../components/ui/Card";

export default function VerifyEmailPage() {
  const router = useRouter();
  const { state, verifyEmail } = useApp();
  
  const [code, setCode] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

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
      
      // Bypass validation check and always navigate
      router.push("/onboarding/business-setup");
      
      // if (verified) {
      //   router.push("/onboarding/business-setup");
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
          <p className="text-xs text-[#6B7280]">
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
            <div className="flex items-start gap-2 bg-[#10B981]/5 border border-[#10B981]/15 rounded-lg p-3 text-[11px] text-[#6B7280] leading-relaxed">
              <ShieldAlert className="h-4 w-4 text-[#10B981] shrink-0 mt-0.5" />
              <div>
                <span className="font-semibold text-white">Security Tip:</span> For branded corporate business profiles, email domain check (e.g. @adidas.com) must be verified to complete the manual compliance review.
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
          <div className="flex items-center justify-between text-xs pt-1 text-[#6B7280]">
            <span>Didn&apos;t receive code?</span>
            <button
              onClick={handleResend}
              className="text-[#10B981] hover:underline font-semibold cursor-pointer"
            >
              Resend Code
            </button>
          </div>

          <div className="relative flex py-1 items-center text-xs">
            <div className="flex-grow border-t border-[#1F1F1F]" />
            <span className="flex-shrink mx-4 text-[#4B5563]">SIMULATOR HINT</span>
            <div className="flex-grow border-t border-[#1F1F1F]" />
          </div>

          <button
            type="button"
            onClick={() => setCode("123456")}
            className="w-full flex items-center justify-center gap-1.5 p-2 rounded-lg border border-dashed border-[#1F1F1F] hover:border-[#2A2A2A] text-xs font-semibold text-[#6B7280] transition-colors cursor-pointer"
          >
            Auto-fill mock code: <span className="font-bold text-white">123456</span>
          </button>
        </Card>
      </div>
    </div>
  );
}
