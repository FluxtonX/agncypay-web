"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { User, Mail, Lock, AlertTriangle, Building2 } from "lucide-react";
import { useApp } from "../../../context/AppContext";
import { Input } from "../../../components/ui/Input";
import { Select } from "../../../components/ui/Select";
import { Button } from "../../../components/ui/Button";
import { Card } from "../../../components/ui/Card";

export default function RegisterPage() {
  const router = useRouter();
  const { loginUser } = useApp();

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [accountType, setAccountType] = useState<"individual" | "agency" | "brand">("brand");
  const [agree, setAgree] = useState(false);
  
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);

  const isPublicDomain = 
    email && 
    (email.includes("@gmail.") || 
     email.includes("@yahoo.") || 
     email.includes("@outlook.") || 
     email.includes("@hotmail."));

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!fullName) newErrors.fullName = "Full name is required";
    if (!email) {
      newErrors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      newErrors.email = "Invalid email format";
    }
    if (!password) {
      newErrors.password = "Password is required";
    } else if (password.length < 8) {
      newErrors.password = "Password must be at least 8 characters";
    }
    if (password !== confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match";
    }
    if (!agree) {
      newErrors.agree = "You must agree to the Terms and Verification Policy";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // if (!validate()) return;

    setIsLoading(true);
    setTimeout(() => {
      // Register (internally login user in draft)
      loginUser(email, fullName, accountType);
      setIsLoading(false);
      router.push("/auth/verify-email");
    }, 1500);
  };

  const handlePrefillAdidas = () => {
    setFullName("Martin Safi");
    setEmail("martin.safi@adidas.com");
    setPassword("password123");
    setConfirmPassword("password123");
    setAccountType("brand");
    setAgree(true);
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
            Create compliance account
          </h2>
          <p className="text-xs text-[#6B7280]">
            Submit credentials to initialize corporate KYB verification.
          </p>
        </div>

        <Card className="border-[#1F1F1F] p-6 space-y-5 bg-[#0D0D0D]">
          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              id="fullName"
              label="Full Legal Name"
              value={fullName}
              onChange={(e) => {
                setFullName(e.target.value);
                if (errors.fullName) setErrors({});
              }}
              error={errors.fullName}
              leftIcon={<User className="h-4 w-4" />}
              placeholder="e.g. Martin Safi"
            />

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
              placeholder="representative@adidas.com"
            />

            {/* Email domain warnings */}
            {isPublicDomain && (
              <div className="flex items-start gap-2 bg-[#F59E0B]/5 border border-[#F59E0B]/10 rounded-lg p-3 text-xs text-[#F59E0B] leading-relaxed">
                <AlertTriangle className="h-4 w-4 shrink-0 mt-0.5" />
                <div>
                  <span className="font-semibold">Notice:</span> Use an official company email address such as <span className="font-semibold text-white">name@adidas.com</span> for faster brand verification. Public domains (Gmail/Outlook) require extended manual audits.
                </div>
              </div>
            )}

            <Select
              id="accountType"
              label="Account Entity Type"
              value={accountType}
              onChange={(e) => setAccountType(e.target.value as any)}
              options={[
                { value: "brand", label: "Brand / Enterprise Company" },
                { value: "agency", label: "Creative / Development Agency" },
                { value: "individual", label: "Individual Contractor" },
              ]}
            />

            <div className="grid grid-cols-2 gap-3">
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
                placeholder="Min 8 chars"
              />
              <Input
                id="confirmPassword"
                type="password"
                label="Confirm Password"
                value={confirmPassword}
                onChange={(e) => {
                  setConfirmPassword(e.target.value);
                  if (errors.confirmPassword) setErrors({});
                }}
                error={errors.confirmPassword}
                leftIcon={<Lock className="h-4 w-4" />}
                placeholder="Retype password"
              />
            </div>

            {/* Agree Checkbox */}
            <div className="space-y-1 pt-1">
              <label className="flex items-start gap-2.5 text-xs text-[#6B7280] cursor-pointer hover:text-white transition-colors">
                <input
                  type="checkbox"
                  checked={agree}
                  onChange={() => setAgree(!agree)}
                  className="mt-0.5 rounded border-[#1F1F1F] bg-transparent accent-[#10B981] cursor-pointer"
                />
                <span>
                  I agree to the Terms of Service, Privacy Policy, and Corporate Brand Verification protocols.
                </span>
              </label>
              {errors.agree && <p className="text-xs text-[#EF4444] mt-1">{errors.agree}</p>}
            </div>

            <Button
              type="submit"
              variant="primary"
              className="w-full mt-2"
              isLoading={isLoading}
            >
              Create Account
            </Button>
          </form>

          <div className="relative flex py-2 items-center text-xs">
            <div className="flex-grow border-t border-[#1F1F1F]" />
            <span className="flex-shrink mx-4 text-[#4B5563]">DEMO HELP</span>
            <div className="flex-grow border-t border-[#1F1F1F]" />
          </div>

          {/* Prefill button for Adidas demo */}
          <button
            type="button"
            onClick={handlePrefillAdidas}
            className="w-full flex items-center justify-center gap-2 p-2.5 rounded-lg border border-[#10B981]/20 bg-[#10B981]/5 hover:bg-[#10B981]/10 text-xs font-bold text-[#10B981] transition-colors cursor-pointer"
          >
            Quick Signup: Adidas Representative
          </button>
        </Card>

        {/* Footer Link */}
        <p className="text-center text-xs text-[#6B7280]">
          Already have an account?{" "}
          <Link href="/auth/login" className="text-[#10B981] hover:underline font-semibold">
            Sign In
          </Link>
        </p>
      </div>
    </div>
  );
}
