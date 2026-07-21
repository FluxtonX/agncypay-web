"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Check, ShieldCheck, Eye, EyeOff, Loader2, ArrowRight, AlertCircle } from "lucide-react";
import { registerWithFirebase, parseAuthError } from "../../../lib/firebaseAuth";
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
}: {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
  error?: string;
  type?: string;
}) {
  const [showPassword, setShowPassword] = useState(false);
  const isPasswordType = type === "password";
  const inputType = isPasswordType ? (showPassword ? "text" : "password") : type;

  return (
    <div className="space-y-3">
      <label className="text-[13px] font-medium text-[#A1A1AA]" htmlFor={id}>{label}</label>
      <div className="relative group w-full">
        <input
          id={id}
          type={inputType}
          value={value}
          onChange={(event) => onChange(event.target.value)}
          className={`w-full bg-[#0B0B0B] border ${error ? "border-[#ff453a]/50" : "border-[#262626] group-hover:border-white/20"} ${isPasswordType ? "pr-12" : ""} focus:border-white/40 focus:ring-4 focus:ring-white/5 rounded-xl px-4 py-3.5 text-sm text-white placeholder-[#5A5A62] transition-all outline-none`}
          placeholder={placeholder}
        />
        {isPasswordType && (
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-4 top-1/2 -translate-y-1/2 text-[#8E8E93] hover:text-white transition-colors"
          >
            {showPassword ? <EyeOff className="h-4.5 w-4.5" /> : <Eye className="h-4.5 w-4.5" />}
          </button>
        )}
      </div>
      {error && (
        <span className="text-xs text-[#ff453a] flex items-center gap-1 mt-1.5">
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
      const parsed = parseAuthError(error);
      if (parsed.field === "email") {
        setErrors({ email: parsed.message });
      } else if (parsed.field === "password") {
        setErrors({ password: parsed.message });
      } else {
        setErrors({ general: parsed.message });
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-[minmax(360px,0.95fr)_minmax(520px,1.05fr)] min-h-screen w-full bg-[#000000] text-white font-sans relative overflow-hidden">
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
          border-color: #262626 !important;
          transition: background-color 5000s ease-in-out 0s;
        }
      ` }} />

      {/* Abstract Background Effects */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0 pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-white/[0.03] blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] rounded-full bg-white/[0.02] blur-[100px]" />
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

      {/* Left panel - Branding & Value Prop */}
      <aside className="hidden lg:flex min-h-screen flex-col bg-[#000000] px-12 xl:px-20 py-20 relative z-10 border-r border-white/5">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px] [mask-image:radial-gradient(ellipse_80%_50%_at_50%_50%,#000_70%,transparent_100%)] opacity-50 pointer-events-none"></div>

        <div className="max-w-[560px] relative z-10 flex flex-col justify-between h-full">
          <div>
            <Link href="/" className="mb-12 ml-3 inline-block transition-transform hover:scale-105 duration-300">
              <img
                src="/agncypayLogo.png"
                alt="AgncyPay"
                style={{ width: "260px", height: "auto", objectFit: "contain", objectPosition: "left" }}
              />
            </Link>

            <h1 className="text-5xl font-semibold leading-[1.1] text-transparent bg-clip-text bg-gradient-to-br from-white to-white/60">
              One identity for<br />every payment
            </h1>
            <p className="mt-5 text-[17px] leading-relaxed text-[#8E8E93] font-light max-w-md">
              Create one AgncyPay account and open the payment experience without a separate role wizard.
            </p>
          </div>

          <div className="mt-12 rounded-[20px] border border-white/10 bg-white/[0.02] backdrop-blur-md p-6 shadow-2xl">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center">
                <ShieldCheck className="h-5 w-5 text-white" />
              </div>
              <h3 className="text-base font-medium text-white">Clean signup flow</h3>
            </div>
            <ul className="space-y-4 text-sm text-[#A1A1AA]">
              {[
                "One account setup for the full product",
                "Redirect to sign in securely after signup",
                "Guest pay and logged-in pay stay separate",
              ].map((bullet) => (
                <li key={bullet} className="flex items-start gap-3">
                  <div className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-white/50" />
                  <span className="leading-snug">{bullet}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </aside>

      {/* Right panel - Auth Form */}
      <main className="flex min-h-screen flex-col bg-transparent px-5 py-8 sm:px-8 md:px-12 lg:px-14 xl:px-20 relative z-10 justify-center">
        <div className="mb-10 lg:hidden flex justify-center">
          <Link href="/">
            <img
              src="/agncypayLogo.png"
              alt="AgncyPay"
              style={{ width: "200px", height: "auto", objectFit: "contain" }}
            />
          </Link>
        </div>

        <div className="mx-auto flex w-full max-w-[560px] flex-col">
          <div className="bg-[#0A0A0A]/80 backdrop-blur-2xl border border-white/10 rounded-[24px] p-8 sm:p-10 shadow-[0_0_80px_rgba(255,255,255,0.03)] relative overflow-hidden">
            
            {/* Glossy top highlight */}
            <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-white/20 to-transparent"></div>

            <div className="mb-10 text-center md:text-left">
              <h2 className="text-3xl font-semibold leading-tight text-white tracking-tight">Create Account</h2>
              <p className="mt-2 text-sm leading-5 text-[#8E8E93]">
                Sign up once and go straight into the AgncyPay payment experience.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              {errors.general && (
                <div className="p-3.5 rounded-xl border border-red-500/30 bg-red-950/40 text-red-300 text-xs font-semibold flex items-start gap-2 animate-fade-in">
                  <AlertCircle className="h-4 w-4 text-red-400 shrink-0 mt-0.5" />
                  <span className="leading-relaxed">{errors.general}</span>
                </div>
              )}
              
              <div className="space-y-3">
                <label className="text-[13px] font-medium text-[#A1A1AA]">Account Type</label>
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

              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 pt-2">
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
                    onChange={(value) => {
                      setPassword(value);
                      if (errors.password) setErrors({});
                    }}
                    placeholder="Minimum 8 characters"
                    error={errors.password}
                  />
                </div>
              </div>

              <div className="flex items-start gap-3 pt-4">
                <div className="relative flex items-center mt-0.5">
                  <input
                    type="checkbox"
                    id="agree"
                    checked={agree}
                    onChange={() => setAgree(!agree)}
                    className="w-4 h-4 rounded border-[#3A3A3C] bg-[#0B0B0B] checked:bg-white checked:border-white appearance-none cursor-pointer transition-colors peer"
                  />
                  <svg className="absolute w-3 h-3 text-black pointer-events-none left-0.5 top-0.5 opacity-0 peer-checked:opacity-100" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <label
                  htmlFor="agree"
                  className="cursor-pointer select-none text-sm leading-snug text-[#8E8E93] hover:text-[#E5E5EA] transition-colors"
                >
                  I agree to the <span className="font-medium text-white">Terms of Service</span> and{" "}
                  <span className="font-medium text-white">Privacy Policy</span>
                </label>
              </div>
              {errors.agree && (
                <span className="block text-xs text-[#ff453a] flex items-center gap-1 mt-1">
                  <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
                  {errors.agree}
                </span>
              )}

              <button
                type="submit"
                disabled={isLoading}
                className="w-full flex items-center justify-center gap-2 h-12 bg-white hover:bg-neutral-200 active:scale-[0.98] text-black font-semibold text-sm rounded-xl transition-all duration-200 cursor-pointer mt-8 disabled:opacity-50 disabled:active:scale-100 shadow-[0_0_20px_rgba(255,255,255,0.1)]"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="h-4.5 w-4.5 animate-spin text-black" />
                    Creating Account...
                  </>
                ) : (
                  <>
                    Create Account
                    <ArrowRight className="w-4.5 h-4.5" />
                  </>
                )}
              </button>

              <div className="flex items-center justify-center gap-2 rounded-xl border border-white/5 bg-white/[0.02] px-4 py-3.5 text-xs font-medium text-[#A1A1AA]">
                <Check className="h-4 w-4 text-emerald-500" />
                Sign in after signup to open your dashboard
              </div>
            </form>
          </div>

          <div className="mt-8 text-center text-sm text-[#8E8E93]">
            Already have an account?{" "}
            <Link href="/auth/login" className="ml-1 font-medium text-white hover:text-neutral-300 transition-colors">
              Sign in
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}
