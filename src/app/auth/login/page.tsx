"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Lock, Mail, ChevronRight, Building2 } from "lucide-react";
import { useApp } from "../../../context/AppContext";
import { Input } from "../../../components/ui/Input";
import { Button } from "../../../components/ui/Button";
import { Card } from "../../../components/ui/Card";

export default function LoginPage() {
  const router = useRouter();
  const { loginUser, state } = useApp();
  
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);

  const handlePrefillAdidas = () => {
    setEmail("martin.safi@adidas.com");
    setPassword("password123");
  };

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!email) {
      newErrors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      newErrors.email = "Invalid email format";
    }
    if (!password) {
      newErrors.password = "Password is required";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // if (!validate()) return;

    setIsLoading(true);
    setTimeout(() => {
      // Login inside AppContext
      loginUser(email, "Martin Safi", "brand");
      setIsLoading(false);
      
      // Determine redirect path
      // If verification status is approved, go to dashboard, else onboarding!
      if (state.verificationStatus === "approved") {
        router.push("/dashboard");
      } else {
        router.push("/onboarding/business-setup");
      }
    }, 1500);
  };

  return (
    <div className="min-h-screen bg-[#0A0A0A] text-[#F8FAFC] flex items-center justify-center p-6 relative overflow-hidden">
      <div className="w-full max-w-md space-y-6 z-10">
        {/* Logo Link */}
        <div className="text-center space-y-2">
          <Link href="/" className="inline-flex items-center">
            <img src="/agncypayLogo.png" alt="AgncyPay" className="h-16 w-auto object-contain" />
          </Link>
          <h2 className="text-xl font-bold tracking-tight text-white mt-4">
            Sign In to your workspace
          </h2>
          <p className="text-xs text-[#6B7280]">
            Enter compliance credentials to access invoice settlements.
          </p>
        </div>

        <Card className="border-[#1F1F1F] p-6 space-y-5 bg-[#0D0D0D]">
          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              id="email"
              type="email"
              label="Work Email Address"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                if (errors.email) setErrors({});
              }}
              error={errors.email}
              leftIcon={<Mail className="h-4 w-4" />}
              placeholder="name@adidas.com"
            />

            <Input
              id="password"
              type="password"
              label="Password"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                if (errors.password) setErrors({});
              }}
              error={errors.password}
              leftIcon={<Lock className="h-4 w-4" />}
              placeholder="••••••••"
            />

            <div className="flex items-center justify-between text-xs pt-1">
              <label className="flex items-center gap-2 cursor-pointer text-[#6B7280] hover:text-[#F8FAFC]">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={() => setRememberMe(!rememberMe)}
                  className="rounded border-[#1F1F1F] bg-transparent accent-[#10B981] cursor-pointer"
                />
                Remember me
              </label>
              <Link
                href="/auth/forgot-password"
                className="text-[#10B981] hover:underline font-semibold"
              >
                Forgot password?
              </Link>
            </div>

            <Button
              type="submit"
              variant="primary"
              className="w-full mt-2"
              isLoading={isLoading}
            >
              Sign In
            </Button>
          </form>

          <div className="relative flex py-2 items-center text-xs">
            <div className="flex-grow border-t border-[#1F1F1F]" />
            <span className="flex-shrink mx-4 text-[#4B5563]">DEMO ENVIRONMENT</span>
            <div className="flex-grow border-t border-[#1F1F1F]" />
          </div>

          {/* Prefill button for Adidas demo */}
          <button
            type="button"
            onClick={handlePrefillAdidas}
            className="w-full flex items-center justify-center gap-2 p-2.5 rounded-lg border border-[#10B981]/20 bg-[#10B981]/5 hover:bg-[#10B981]/10 text-xs font-bold text-[#10B981] transition-colors cursor-pointer"
          >
            Sign in as Adidas Representative
          </button>
        </Card>

        {/* Footer Link */}
        <p className="text-center text-xs text-[#6B7280]">
          Don&apos;t have an account?{" "}
          <Link href="/auth/register" className="text-[#10B981] hover:underline font-semibold">
            Create Account
          </Link>
        </p>
      </div>
    </div>
  );
}
