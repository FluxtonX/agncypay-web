"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Mail, ArrowLeft, Send } from "lucide-react";
import { Input } from "../../../components/ui/Input";
import { Button } from "../../../components/ui/Button";
import { Card } from "../../../components/ui/Card";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    // if (!email) {
    //   setError("Email is required");
    //   return;
    // }

    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      setIsSubmitted(true);
    }, 1200);
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
            Reset account password
          </h2>
          <p className="text-xs text-[#6B7280]">
            Submit your registered email address to receive password reset details.
          </p>
        </div>

        <Card className="border-[#1F1F1F] p-6 bg-[#0D0D0D]">
          {isSubmitted ? (
            <div className="space-y-4 text-center">
              <div className="h-12 w-12 rounded-full bg-[#10B981]/10 border border-[#10B981]/25 flex items-center justify-center text-[#10B981] mx-auto">
                <Send className="h-5 w-5" />
              </div>
              <h3 className="text-sm font-bold text-white">Reset Link Dispatched</h3>
              <p className="text-xs text-[#6B7280] leading-relaxed">
                If the email matches a registered profile, a secure password modification link will arrive shortly.
              </p>
              <Link href="/auth/login" className="block pt-2">
                <Button variant="outline" className="w-full">
                  Return to Sign In
                </Button>
              </Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <Input
                id="email"
                type="email"
                label="Work Email Address"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  if (error) setError("");
                }}
                error={error}
                leftIcon={<Mail className="h-4 w-4" />}
                placeholder="name@adidas.com"
              />

              <Button
                type="submit"
                variant="primary"
                className="w-full mt-2"
                isLoading={isLoading}
              >
                Send Reset Instructions
              </Button>

              <Link
                href="/auth/login"
                className="flex items-center justify-center gap-1.5 text-xs text-[#6B7280] hover:text-white transition-colors pt-2"
              >
                <ArrowLeft className="h-3.5 w-3.5" /> Return to Sign In
              </Link>
            </form>
          )}
        </Card>
      </div>
    </div>
  );
}
