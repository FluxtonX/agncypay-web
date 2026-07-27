"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Eye, EyeOff, Loader2, ArrowRight } from "lucide-react";
import { useApp } from "../../../context/AppContext";
import { loginWithFirebase } from "../../../lib/firebaseAuth";

const DEMO_EMAIL = "martin.safi@adidas.com";
const DEMO_PASSWORD = "password123";
const isGmailAddress = (value: string) => value.trim().toLowerCase().endsWith("@gmail.com");

export default function LoginPage() {
  const router = useRouter();
  const { loginUser } = useApp();
  
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [roleType, setRoleType] = useState<"brand" | "agency" | "individual">("brand");
  const [rememberMe, setRememberMe] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [showDemoHelper, setShowDemoHelper] = useState(false);
  const [safeNextPath, setSafeNextPath] = useState<string | null>(null);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const nextPath = params.get("next");
    setSafeNextPath(nextPath && nextPath.startsWith("/") && !nextPath.startsWith("//") ? nextPath : null);
  }, []);

  const handlePrefillAdidas = () => {
    setEmail(DEMO_EMAIL);
    setPassword(DEMO_PASSWORD);
    setErrors({});
    setShowDemoHelper(false);
  };

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!email) {
      newErrors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      newErrors.email = "Invalid email format";
    }
    if (!password && !isGmailAddress(email)) {
      newErrors.password = "Password is required";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    const normalizedEmail = email.trim().toLowerCase();

    setIsLoading(true);
    try {
      const userProfile = await loginWithFirebase(normalizedEmail, password);
      
      if (userProfile) {
        // Role Mismatch Guard
        const selectedRole = roleType === "individual" ? "talent_independent" : roleType;
        const profileRole = userProfile.accountType === "individual" ? "talent_independent" : userProfile.accountType;

        if (profileRole !== selectedRole) {
          const displayRole = userProfile.accountType === "brand" 
            ? "Brand" 
            : userProfile.accountType === "agency" 
            ? "Agency" 
            : "Talent";
          setErrors({ 
            email: `Account type mismatch. Please select the correct login role: ${displayRole}.` 
          });
          
          // Sign out from Firebase Auth to clear session
          const { logoutWithFirebase } = require("../../../lib/firebaseAuth");
          await logoutWithFirebase();
          setIsLoading(false);
          return;
        }

        // Sync context
        loginUser(
          userProfile.email,
          userProfile.fullName,
          userProfile.accountType,
          {
            workspaceName: userProfile.workspaceName,
            workspaceType: userProfile.accountType === "brand" ? "brand" : userProfile.accountType === "agency" ? "agency" : "talent_independent",
            agencyId: userProfile.agencyId,
            uid: userProfile.uid,
            parentAgencyEmail: userProfile.parentAgencyEmail,
            parentAgencyUid: userProfile.parentAgencyUid,
          }
        );

        if (userProfile.accountType === "brand" || userProfile.accountType === "agency") {
          router.push(safeNextPath || "/branddashboard");
        } else {
          router.push(safeNextPath || "/dashboard");
        }
      }
    } catch (error: any) {
      console.error("Firebase login failed:", error);
      setErrors({ email: error.message || "Failed to log in. Please check your credentials." });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full bg-[#000000] text-[#F8FAFC] font-sans relative overflow-hidden flex flex-col items-center justify-start pt-16 sm:pt-24 pb-12 px-4 transition-colors duration-200">
      
      {/* Strict CSS overrides to force input elements to stay dark `#0B0B0B` and handle browser autofills */}
      <style dangerouslySetInnerHTML={{__html: `
        #email, #password {
          background-color: #0B0B0B !important;
          border-color: #262626 !important;
          color: #F8FAFC !important;
        }
        #email:focus, #password:focus {
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
      `}} />

      {/* Abstract Background Effects */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0 pointer-events-none">
        <div className="absolute top-[-20%] left-[25%] w-[50%] h-[50%] rounded-full bg-white/[0.03] blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[10%] w-[40%] h-[40%] rounded-full bg-white/[0.02] blur-[100px]" />
      </div>

      {/* Floating Demo Helper for verification/testing (hidden from mock layout) */}
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
            <h4 className="font-semibold text-white mb-3 text-sm">Demo Access</h4>
            <div className="space-y-2 mb-4">
              <p className="flex justify-between text-[#8E8E93]">
                <span>Email:</span> <span className="text-white font-mono bg-white/5 px-1.5 rounded">{DEMO_EMAIL}</span>
              </p>
              <p className="flex justify-between text-[#8E8E93]">
                <span>Password:</span> <span className="text-white font-mono bg-white/5 px-1.5 rounded">{DEMO_PASSWORD}</span>
              </p>
            </div>
            <button
              type="button"
              onClick={handlePrefillAdidas}
              className="w-full py-2.5 bg-white text-black font-semibold rounded-xl hover:bg-neutral-200 hover:scale-[1.02] active:scale-[0.98] transition-all cursor-pointer"
            >
              Prefill Form
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
      <div className="w-full max-w-[460px] z-10">
        <div className="bg-[#0A0A0A]/90 backdrop-blur-2xl border border-white/10 rounded-[28px] p-8 sm:p-10 shadow-[0_0_80px_rgba(255,255,255,0.03)] relative overflow-hidden">
          
          {/* Glossy top highlight */}
          <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-white/20 to-transparent"></div>

          <div className="mb-8 text-center">
            <h2 className="text-2xl font-bold text-white tracking-tight">
              Welcome Back
            </h2>
            <p className="text-[#8E8E93] text-xs mt-1.5 font-normal">
              Sign in to your AgncyPay account
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Account Type Segmented Control */}
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

            {/* Email Address */}
            <div className="space-y-2">
              <label htmlFor="email" className="text-[12px] font-semibold text-[#A1A1AA]">
                Email Address
              </label>
              <div className="relative group">
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    if (errors.email) setErrors({});
                  }}
                  className={`w-full bg-[#0B0B0B] border ${errors.email ? "border-[#ff453a]/50" : "border-[#262626] group-hover:border-white/20"} focus:border-white/40 focus:ring-4 focus:ring-white/5 rounded-xl px-4 py-3 text-xs text-white placeholder-[#5A5A62] transition-all outline-none`}
                  placeholder="you@company.com"
                />
              </div>
              {errors.email && (
                <span className="text-xs text-[#ff453a] flex items-center gap-1 mt-1">
                  <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
                  {errors.email}
                </span>
              )}
            </div>

            {/* Password */}
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <label htmlFor="password" className="text-[12px] font-semibold text-[#A1A1AA]">
                  Password
                </label>
                <Link
                  href="/auth/forgot-password"
                  className="text-xs font-semibold text-[#8E8E93] hover:text-white transition-colors"
                >
                  Forgot password?
                </Link>
              </div>
              <div className="relative group">
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    if (errors.password) setErrors({});
                  }}
                  className={`w-full bg-[#0B0B0B] border ${errors.password ? "border-[#ff453a]/50" : "border-[#262626] group-hover:border-white/20"} pr-12 focus:border-white/40 focus:ring-4 focus:ring-white/5 rounded-xl px-4 py-3 text-xs text-white placeholder-[#5A5A62] transition-all outline-none`}
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-[#8E8E93] hover:text-white transition-colors"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              {errors.password && (
                <span className="text-xs text-[#ff453a] flex items-center gap-1 mt-1">
                  <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
                  {errors.password}
                </span>
              )}
            </div>

            {/* Remember Me Checkbox with White Border for High Visibility */}
            <div className="flex items-center gap-3 pt-1">
              <div className="relative flex items-center">
                <input
                  type="checkbox"
                  id="remember"
                  checked={rememberMe}
                  onChange={() => setRememberMe(!rememberMe)}
                  className="w-4 h-4 rounded border border-white/30 bg-[#0B0B0B] checked:bg-white checked:border-white appearance-none cursor-pointer transition-colors peer hover:border-white/60 focus:outline-none"
                />
                <svg className="absolute w-3 h-3 text-black pointer-events-none left-0.5 top-0.5 opacity-0 peer-checked:opacity-100" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <label
                htmlFor="remember"
                className="text-xs text-[#8E8E93] cursor-pointer hover:text-white transition-colors select-none font-medium"
              >
                Remember me for 30 days
              </label>
            </div>

            {/* Sign In CTA */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full flex items-center justify-center gap-2 h-12 bg-white hover:bg-neutral-200 active:scale-[0.98] text-black font-extrabold text-xs uppercase tracking-wider rounded-xl transition-all duration-200 cursor-pointer mt-6 disabled:opacity-50 disabled:active:scale-100 shadow-[0_0_20px_rgba(255,255,255,0.05)]"
            >
              {isLoading ? (
                <>
                  <Loader2 className="h-4.5 w-4.5 animate-spin" />
                  <span>Authenticating...</span>
                </>
              ) : (
                <>
                  <span>Sign In</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>
        </div>

        {/* Footer Elements */}
        <div className="mt-8 space-y-6 text-center">
          <div className="text-xs text-[#8E8E93]">
            Don't have an account?{" "}
            <Link href="/auth/register" className="text-white hover:text-neutral-300 font-bold ml-1 transition-colors">
              Sign up
            </Link>
          </div>

          <div className="flex flex-col items-center gap-3 text-[#52525B]">
            <div className="w-12 h-[1px] bg-white/10"></div>
            <div className="flex items-center gap-2 text-[10px] font-bold tracking-wider uppercase">
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
              Bank-Level Security
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
