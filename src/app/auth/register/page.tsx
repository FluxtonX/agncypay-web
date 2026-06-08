"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Check, ShieldCheck } from "lucide-react";
import { saveRegisteredUser } from "../../../lib/authStorage";
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
  return (
    <label className="flex w-full flex-col gap-2" htmlFor={id}>
      <span className="text-[13px] font-medium text-[#E5E5EA]">{label}</span>
      <input
        id={id}
        type={type}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className={`w-full rounded-lg border bg-[#0B0B0B] px-4 py-3 text-sm text-[#F8FAFC] placeholder-[#5A5A62] transition-colors focus:border-white/30 focus:outline-none ${
          error ? "border-white/40" : "border-[#262626]"
        }`}
        placeholder={placeholder}
      />
      {error ? <span className="text-xs text-white">{error}</span> : null}
    </label>
  );
}

export default function RegisterPage() {
  const router = useRouter();

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [workspaceName, setWorkspaceName] = useState("");
  const [password, setPassword] = useState("");
  const [roleType, setRoleType] = useState<"business" | "individual">("business");
  const accountType: WorkspaceType = roleType === "business" ? "agency" : "talent_independent";
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
    if (!workspaceName.trim()) nextErrors.workspaceName = "Workspace name is required";
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

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    if (!validate()) return;

    const normalizedEmail = email.trim().toLowerCase();
    const normalizedName = fullName.trim();
    const normalizedWorkspaceName = workspaceName.trim();

    setIsLoading(true);
    window.setTimeout(() => {
      saveRegisteredUser({
        email: normalizedEmail,
        password,
        fullName: normalizedName,
        accountType: accountType,
        workspaceType: accountType,
        workspaceName: normalizedWorkspaceName,
      });

      setIsLoading(false);
      router.push("/auth/login");
    }, 900);
  };

  return (
    <div className="grid min-h-screen w-full grid-cols-1 bg-black font-sans text-white lg:grid-cols-[minmax(360px,0.95fr)_minmax(520px,1.05fr)]">
      <style dangerouslySetInnerHTML={{ __html: `
        #fullName, #email, #workspaceName, #password {
          background-color: #0B0B0B !important;
          border-color: #262626 !important;
          color: #F8FAFC !important;
        }
        #fullName:focus, #email:focus, #workspaceName:focus, #password:focus {
          border-color: rgba(255, 255, 255, 0.3) !important;
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

      <div className="fixed right-4 top-4 z-50">
        <button
          type="button"
          onClick={() => setShowDemoHelper(!showDemoHelper)}
          className="rounded-md border border-[#2D2D2D] bg-[#1F1F1F] px-3 py-1.5 text-[11px] text-[#A1A1AA] shadow-lg transition-colors hover:bg-[#2D2D2D]"
        >
          {showDemoHelper ? "Hide Demo Helper" : "Show Demo Credentials"}
        </button>

        {showDemoHelper && (
          <div className="absolute right-0 z-50 mt-2 w-72 rounded-lg border border-[#2D2D2D] bg-[#121212] p-4 text-xs shadow-2xl">
            <h4 className="mb-2 font-semibold text-white">Demo Registration</h4>
            <p className="mb-1 text-[#8E8E93]">Prefills a clean AgncyPay brand workspace.</p>
            <button
              type="button"
              onClick={handlePrefillDemo}
              className="mt-2 w-full rounded bg-white py-2 font-semibold text-black transition-colors hover:bg-neutral-200"
            >
              Prefill Demo Data
            </button>
          </div>
        )}
      </div>

      <aside className="hidden min-h-screen flex-col bg-black px-12 pb-12 pt-[78px] lg:flex xl:px-20">
        <div className="max-w-[650px]">
          <Link href="/" className="mb-5 ml-3 inline-block">
            <img
              src="/agncypayLogo.png"
              alt="AgncyPay"
              style={{ width: "520px", height: "122px", objectFit: "contain", objectPosition: "left" }}
            />
          </Link>

          <h1 className="text-[44px] font-semibold leading-[1.08] text-white">
            One identity for every payment
          </h1>
          <p className="mt-5 max-w-[520px] text-[16px] leading-7 text-[#8E8E93]">
            Create one AgncyPay account and open the payment experience without a separate role wizard.
          </p>

          <div className="mt-10 rounded-[8px] border border-[#272727] bg-[#070707] p-5">
            <div className="flex items-center gap-3">
              <ShieldCheck className="h-5 w-5 text-white" />
              <p className="text-[15px] font-semibold text-white">Clean signup flow</p>
            </div>
            <ul className="mt-5 space-y-3 text-[14px] leading-5 text-[#8E8E93]">
              {[
                "One account setup for the full product",
                "Redirect to sign in after signup",
                "Guest pay and logged-in pay stay separate",
              ].map((bullet) => (
                <li key={bullet} className="flex items-center gap-3">
                  <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-[#8E8E93]" />
                  {bullet}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </aside>

      <main className="flex min-h-screen flex-col bg-[#121212] px-5 py-8 sm:px-8 md:px-12 lg:px-14 xl:px-20">
        <div className="mb-8 lg:hidden">
          <Link href="/" className="inline-flex items-center">
            <img
              src="/agncypayLogo.png"
              alt="AgncyPay"
              style={{ width: "240px", height: "55px", objectFit: "contain", objectPosition: "left" }}
            />
          </Link>
        </div>

        <div className="mx-auto flex w-full max-w-[760px] flex-1 flex-col justify-center">
          <div className="mb-7">
            <h2 className="text-[31px] font-medium leading-tight text-white">Create Account</h2>
            <p className="mt-2 text-sm leading-5 text-[#8E8E93]">
              Sign up once and go straight into the AgncyPay payment experience.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="rounded-[10px] border border-[#262626] bg-black/30 p-4 sm:p-5">
              <div className="mb-6">
                <label className="text-[13px] font-medium text-[#E5E5EA] mb-3 block">Account Type</label>
                <div className="grid grid-cols-2 gap-3">
                  {[
                    { id: "business", label: "Business (Agency / Brand)" },
                    { id: "individual", label: "Individual (Model / Talent)" },
                  ].map((role) => (
                    <label
                      key={role.id}
                      className={`flex cursor-pointer items-center justify-center rounded-lg border px-3 py-2 text-center text-[12px] font-semibold transition-colors ${
                        roleType === role.id
                          ? "border-white bg-white text-black"
                          : "border-[#262626] bg-[#0B0B0B] text-[#8E8E93] hover:border-white/40"
                      }`}
                    >
                      <input
                        type="radio"
                        name="roleType"
                        value={role.id}
                        checked={roleType === role.id}
                        onChange={() => setRoleType(role.id as "business" | "individual")}
                        className="hidden"
                      />
                      {role.label}
                    </label>
                  ))}
                </div>
              </div>

              {roleType === "business" && (
                <div className="mb-6">
                  <label className="text-[13px] font-medium text-[#E5E5EA] mb-3 block">Connect Accounting (Optional)</label>
                  <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                    {["QuickBooks", "Xero", "NetSuite", "Sage"].map((erp) => (
                      <button
                        key={erp}
                        type="button"
                        className="flex h-10 items-center justify-center rounded-lg border border-[#262626] bg-[#0B0B0B] text-[11px] font-semibold text-[#8E8E93] transition-colors hover:border-white/40 hover:text-white"
                      >
                        {erp}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <FormField
                  id="fullName"
                  label="Enter your Name"
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
                <FormField
                  id="workspaceName"
                  label="Company / Workspace Name"
                  value={workspaceName}
                  onChange={(value) => {
                    setWorkspaceName(value);
                    if (errors.workspaceName) setErrors({});
                  }}
                  placeholder="Adidas"
                  error={errors.workspaceName}
                />
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

            <div className="flex items-start gap-2.5 pt-1">
              <input
                type="checkbox"
                id="agree"
                checked={agree}
                onChange={() => setAgree(!agree)}
                className="mt-0.5 h-4 w-4 cursor-pointer rounded border-[#262626] bg-[#0B0B0B] accent-white"
              />
              <label
                htmlFor="agree"
                className="cursor-pointer select-none text-sm leading-tight text-[#8E8E93] hover:text-[#E5E5EA]"
              >
                I agree to the <span className="font-medium text-white">Terms of Service</span> and{" "}
                <span className="font-medium text-white">Privacy Policy</span>
              </label>
            </div>
            {errors.agree ? <span className="block text-xs text-white">{errors.agree}</span> : null}

            <button
              type="submit"
              disabled={isLoading}
              className="flex h-[46px] w-full items-center justify-center gap-2 rounded-lg bg-white text-sm font-semibold text-black transition-colors hover:bg-neutral-200 disabled:cursor-not-allowed disabled:opacity-70"
            >
              {isLoading ? "Creating Account..." : "Create Account"}
            </button>

            <div className="flex items-center justify-center gap-2 rounded-[10px] border border-[#262626] bg-[#0B0B0B] px-4 py-3 text-[13px] text-[#8E8E93]">
              <Check className="h-4 w-4 text-white" />
              Sign in after signup to open your dashboard
            </div>
          </form>

          <div className="mt-6 text-center text-sm text-[#8E8E93]">
            Already have an account?{" "}
            <Link href="/auth/login" className="ml-1 font-medium text-white hover:underline">
              Sign in
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}
