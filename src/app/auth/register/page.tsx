"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Check, ShieldCheck, Eye, EyeOff, Loader2, ArrowRight } from "lucide-react";
import { registerWithFirebase } from "../../../lib/firebaseAuth";
import { WorkspaceType } from "../../../types/workspace";

const DEMO_EMAIL = "martin.safi@adidas.com";
const DEMO_PASSWORD = "password123";

function FormField({
  id,
  label,
  value,
  onChange,
  placeholder,
  error,
  type = "text",
  autoComplete,
}: {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
  error?: string;
  type?: string;
  autoComplete?: string;
}) {
  const [showPassword, setShowPassword] = useState(false);
  const isPasswordType = type === "password";
  const inputType = isPasswordType ? (showPassword ? "text" : "password") : type;

  return (
    <div className="space-y-2">
      <label className="text-[12px] font-semibold text-[#A1A1AA]" htmlFor={id}>{label}</label>
      <div className="relative group w-full">
        <input
          id={id}
          type={inputType}
          value={value}
          onChange={(event) => onChange(event.target.value)}
          className={`w-full bg-[#0B0B0B] border ${error ? "border-[#ff453a]/50" : "border-[#262626] group-hover:border-white/20"} ${isPasswordType ? "pr-12" : ""} focus:border-white/40 focus:ring-4 focus:ring-white/5 rounded-xl px-4 py-3 text-xs text-white placeholder-[#5A5A62] transition-all outline-none`}
          placeholder={placeholder}
        />
        {isPasswordType && (
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-4 top-1/2 -translate-y-1/2 text-[#8E8E93] hover:text-white transition-colors"
          >
            {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </button>
        )}
      </div>
      {error && (
        <span className="text-xs text-[#ff453a] flex items-center gap-1 mt-1">
          <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
          {error}
        </span>
      )}
    </div>
  );
}

export default function RegisterPage() {
  const router = useRouter();

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [workspaceName, setWorkspaceName] = useState("");
  const [password, setPassword] = useState("");
  const [roleType, setRoleType] = useState<"brand" | "agency" | "individual">("brand");
  const accountType: WorkspaceType =
    roleType === "brand"
      ? "brand"
      : roleType === "agency"
      ? "agency"
      : "talent_independent";
  const [agree, setAgree] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [showDemoHelper, setShowDemoHelper] = useState(false);

  const handlePrefillDemo = () => {
    setFullName("Martin Safi");
    setEmail(DEMO_EMAIL);
    setWorkspaceName("Adidas");
    setPassword(DEMO_PASSWORD);
    setConfirmPassword(DEMO_PASSWORD);
    setRoleType("brand");
    setAgree(true);
    setErrors({});
    setShowDemoHelper(false);
  };

  const validate = () => {
    const nextErrors: Record<string, string> = {};

    if (!fullName.trim()) nextErrors.fullName = "Name is required";
    if (!email) {
      nextErrors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      nextErrors.email = "Invalid email format";
    }
    if (roleType !== "individual" && !workspaceName.trim()) {
      nextErrors.workspaceName = "Workspace name is required";
    }
    if (!password) {
      nextErrors.password = "Password is required";
    } else if (password.length < 8) {
      nextErrors.password = "Password must be at least 8 characters";
    }
    if (password && password !== confirmPassword) {
      nextErrors.confirmPassword = "Passwords do not match";
    }
    if (!agree) {
      nextErrors.agree = "You must agree to the Terms of Service and Privacy Policy";
    }

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!validate()) return;

    const normalizedEmail = email.trim().toLowerCase();
    const normalizedName = fullName.trim();
    const normalizedWorkspaceName = roleType === "individual" ? `${normalizedName} Workspace` : workspaceName.trim();

    setIsLoading(true);
    try {
      await registerWithFirebase(
        normalizedEmail,
        password,
        normalizedName,
        accountType,
        normalizedWorkspaceName
      );
      router.push("/auth/login");
    } catch (error: any) {
      console.error("Firebase registration failed:", error);
      setErrors({ email: error.message || "Failed to create account. Please try again." });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full bg-[#000000] text-[#F8FAFC] font-sans relative overflow-hidden flex flex-col items-center justify-start pt-16 sm:pt-24 pb-12 px-4 transition-colors duration-200">
      <style dangerouslySetInnerHTML={{ __html: `
        #fullName, #email, #workspaceName, #password {
          background-color: #0B0B0B !important;
          border-color: #262626 !important;
          color: #F8FAFC !important;
        }
        #fullName:focus, #email:focus, #workspaceName:focus, #password:focus {
          border-color: rgba(255, 255, 255, 0.4) !important;
        }
        input:-webkit-autofill,
        input:-webkit-autofill:hover,
        input:-webkit-autofill:focus,
        input:-webkit-autofill:active {
          -webkit-box-shadow: 0 0 0 1000px #0B0B0B inset !important;
          -webkit-text-fill-color: #F8FAFC !important;
          border-color: #3A3A3A !important;
          transition: background-color 5000s ease-in-out 0s;
        }
      ` }} />

      {/* Abstract Background Effects */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0 pointer-events-none">
        <div className="absolute top-[-20%] left-[25%] w-[50%] h-[50%] rounded-full bg-white/[0.03] blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[10%] w-[40%] h-[40%] rounded-full bg-white/[0.02] blur-[100px]" />
      </div>

      {/* Demo Helper */}
      <div className="fixed top-6 right-6 z-50">
        <button
          type="button"
          onClick={() => setShowDemoHelper(!showDemoHelper)}
          className="px-4 py-2 bg-[#121212]/80 backdrop-blur-md border border-white/10 hover:bg-white/10 text-xs font-medium text-[#A1A1AA] hover:text-white rounded-full transition-all shadow-2xl cursor-pointer"
        >
          {showDemoHelper ? "Hide Demo" : "Demo Credentials"}
        </button>

        {showDemoHelper && (
          <div className="absolute right-0 mt-3 w-72 bg-[#121212]/95 backdrop-blur-xl border border-white/10 rounded-2xl p-5 shadow-2xl z-50 text-xs">
            <h4 className="font-semibold text-white mb-2 text-sm">Demo Registration</h4>
            <p className="mb-4 text-[#8E8E93]">Prefills a clean AgncyPay brand workspace with test data.</p>
            <button
              type="button"
              onClick={handlePrefillDemo}
              className="w-full py-2.5 bg-white text-black font-semibold rounded-xl hover:bg-neutral-200 hover:scale-[1.02] active:scale-[0.98] transition-all cursor-pointer"
            >
              Prefill Demo Data
            </button>
          </div>
        )}
      </div>

      {/* Logo Header */}
      <div className="mb-10 text-center z-10">
        <Link href="/" className="inline-block transition-transform hover:scale-105 duration-300">
          <img
            src="/agncypayLogo.png"
            alt="AgncyPay"
            style={{ width: "240px", height: "auto", objectFit: "contain" }}
          />
        </Link>
      </div>

      {/* Auth Form Card - Placed in Center Top */}
      <div className="w-full max-w-[500px] z-10">
        <div className="bg-[#0A0A0A]/90 backdrop-blur-2xl border border-white/10 rounded-[28px] p-8 sm:p-10 shadow-[0_0_80px_rgba(255,255,255,0.03)] relative overflow-hidden">
          
          {/* Glossy top highlight */}
          <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-white/20 to-transparent"></div>

          <div className="mb-8 text-center">
            <h2 className="text-2xl font-bold text-white tracking-tight">Create Account</h2>
            <p className="mt-1.5 text-xs text-[#8E8E93]">
              Sign up once and go straight into the AgncyPay payment experience.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            
            <div className="space-y-2">
              <label className="text-[12px] font-semibold text-[#A1A1AA]">Account Type</label>
              <div className="p-1.5 bg-[#050505] border border-white/10 rounded-2xl flex items-center justify-between gap-1">
                {[
                  { id: "brand", label: "Brand" },
                  { id: "agency", label: "Agency" },
                  { id: "individual", label: "Talent" },
                ].map((role) => (
                  <label
                    key={role.id}
                    className={`flex-1 flex justify-center py-2.5 text-xs font-semibold rounded-xl transition-all duration-300 cursor-pointer select-none ${
                      roleType === role.id
                        ? "bg-white text-black shadow-lg scale-[1.02]"
                        : "text-[#8E8E93] hover:text-white hover:bg-white/5"
                    }`}
                  >
                    <input
                      type="radio"
                      name="roleType"
                      value={role.id}
                      checked={roleType === role.id}
                      onChange={() => setRoleType(role.id as "brand" | "agency" | "individual")}
                      className="hidden"
                    />
                    {role.label}
                  </label>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 pt-2">
              <FormField
                id="fullName"
                label="Full Name"
                value={fullName}
                onChange={(value) => {
                  setFullName(value);
                  if (errors.fullName) setErrors({});
                }}
                placeholder="Martin Safi"
                error={errors.fullName}
              />
              <FormField
                id="email"
                label="Email Address"
                value={email}
                onChange={(value) => {
                  setEmail(value);
                  if (errors.email) setErrors({});
                }}
                placeholder="you@company.com"
                error={errors.email}
              />
              {roleType !== "individual" && (
                <div className="sm:col-span-2">
                  <FormField
                    id="workspaceName"
                    label="Company / Workspace Name"
                    value={workspaceName}
                    onChange={(value) => {
                      setWorkspaceName(value);
                      if (errors.workspaceName) setErrors({});
                    }}
                    placeholder="e.g. Adidas"
                    error={errors.workspaceName}
                  />
                </div>
              )}
              <div className="sm:col-span-2">
                <FormField
                  id="password"
                  type="password"
                  label="Password"
                  value={password}
                  autoComplete="new-password"
                  onChange={(value) => {
                    setPassword(value);
                    if (errors.password) setErrors({});
                  }}
                  placeholder="Minimum 8 characters"
                  error={errors.password}
                />
                <FormField
                  id="confirmPassword"
                  type="password"
                  label="Confirm Password"
                  value={confirmPassword}
                  autoComplete="new-password"
                  onChange={(value) => {
                    setConfirmPassword(value);
                    if (errors.confirmPassword) setErrors({});
                  }}
                  placeholder="Confirm your password"
                  error={errors.confirmPassword}
                />
              </div>
            </div>

            {/* Terms of Service Checkbox with White Border for High Visibility */}
            <div className="flex items-start gap-3 pt-2">
              <div className="relative flex items-center mt-0.5">
                <input
                  type="checkbox"
                  id="agree"
                  checked={agree}
                  onChange={() => setAgree(!agree)}
                  className="w-4 h-4 rounded border border-white/30 bg-[#0B0B0B] checked:bg-white checked:border-white appearance-none cursor-pointer transition-colors peer hover:border-white/60 focus:outline-none"
                />
                <svg className="absolute w-3 h-3 text-black pointer-events-none left-0.5 top-0.5 opacity-0 peer-checked:opacity-100" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <label
                htmlFor="agree"
                className="cursor-pointer select-none text-xs leading-snug text-[#8E8E93] hover:text-[#E5E5EA] transition-colors font-medium"
              >
                I agree to the <span className="font-bold text-white">Terms of Service</span> and{" "}
                <span className="font-bold text-white">Privacy Policy</span>
              </label>
            </div>
            {errors.agree && (
              <span className="block text-xs text-[#ff453a] flex items-center gap-1 mt-1">
                <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
                {errors.agree}
              </span>
            )}

            {errors.submit ? (
              <div className="rounded-lg border border-red-950 bg-red-950/30 p-3 text-xs text-red-200">
                {errors.submit}
              </div>
            ) : null}

            <button
              type="submit"
              disabled={isLoading}
              className="w-full flex items-center justify-center gap-2 h-12 bg-white hover:bg-neutral-200 active:scale-[0.98] text-black font-extrabold text-xs uppercase tracking-wider rounded-xl transition-all duration-200 cursor-pointer mt-6 disabled:opacity-50 disabled:active:scale-100 shadow-[0_0_20px_rgba(255,255,255,0.05)]"
            >
              {isLoading ? (
                <>
                  <Loader2 className="h-4.5 w-4.5 animate-spin text-black" />
                  <span>Creating Account...</span>
                </>
              ) : (
                <>
                  <span>Create Account</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>

            <div className="flex items-center justify-center gap-2 rounded-xl border border-white/5 bg-white/[0.02] px-4 py-3 text-xs font-semibold text-[#A1A1AA]">
              <Check className="h-4 w-4 text-emerald-500" />
              Sign in after signup to open your dashboard
            </div>
          </form>
        </div>

        <div className="mt-8 text-center text-xs text-[#8E8E93]">
          Already have an account?{" "}
          <Link href="/auth/login" className="ml-1 font-bold text-white hover:text-neutral-300 transition-colors">
            Sign in
          </Link>
        </div>
      </div>
    </div>
  );
}
