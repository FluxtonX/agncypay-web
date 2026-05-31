"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useApp } from "../../../context/AppContext";
import { getRegisteredUsers } from "../../../lib/authStorage";

const DEMO_EMAIL = "martin.safi@adidas.com";
const DEMO_PASSWORD = "password123";
const isGmailAddress = (value: string) => value.trim().toLowerCase().endsWith("@gmail.com");

export default function LoginPage() {
  const router = useRouter();
  const { loginUser } = useApp();
  
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    const normalizedEmail = email.trim().toLowerCase();
    const registeredUser = getRegisteredUsers().find(
      (user) => user.email.toLowerCase() === normalizedEmail
    );
    const isDemoLogin = normalizedEmail === DEMO_EMAIL && password === DEMO_PASSWORD;
    const isGmailLogin = isGmailAddress(normalizedEmail);

    if (!registeredUser && !isDemoLogin && !isGmailLogin) {
      setErrors({ email: "Use a Gmail address, demo account, or create an account first." });
      return;
    }

    if (registeredUser && !isGmailLogin && registeredUser.password !== password) {
      setErrors({ password: "Incorrect password for this account." });
      return;
    }

    setIsLoading(true);
    setTimeout(() => {
      // Login inside AppContext
      const fallbackName = normalizedEmail
        .split("@")[0]
        .split(/[._-]/)
        .filter(Boolean)
        .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
        .join(" ");
      loginUser(
        normalizedEmail,
        registeredUser?.fullName || fallbackName || "AgncyPay User",
        registeredUser?.accountType || "brand",
        {
          workspaceName: registeredUser?.workspaceName,
          workspaceType: registeredUser?.workspaceType,
          agencyId: registeredUser?.agencyId,
        }
      );
      setIsLoading(false);

      router.push(safeNextPath || "/dashboard");
    }, 1500);
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 min-h-screen w-full bg-[#000000] text-white font-sans relative">
      {/* Strict CSS overrides to force input elements to stay dark `#0B0B0B` and handle browser autofills */}
      <style dangerouslySetInnerHTML={{__html: `
        #email, #password {
          background-color: #0B0B0B !important;
          border-color: #262626 !important;
          color: #F8FAFC !important;
        }
        #email:focus, #password:focus {
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
      `}} />

      {/* Floating Demo Helper for verification/testing (hidden from mock layout) */}
      <div className="fixed top-4 right-4 z-50">
        <button
          type="button"
          onClick={() => setShowDemoHelper(!showDemoHelper)}
          className="px-3 py-1.5 bg-[#1F1F1F] border border-[#2D2D2D] hover:bg-[#2D2D2D] text-[11px] text-[#A1A1AA] rounded-md transition-colors shadow-lg cursor-pointer"
        >
          {showDemoHelper ? "Hide Demo Helper" : "Show Demo Credentials"}
        </button>

        {showDemoHelper && (
          <div className="absolute right-0 mt-2 w-72 bg-[#121212] border border-[#2D2D2D] rounded-lg p-4 shadow-2xl z-50 text-xs">
            <h4 className="font-semibold text-white mb-2">Demo Credentials</h4>
            <p className="text-[#8E8E93] mb-1">
              Email: <span className="text-white font-mono">{DEMO_EMAIL}</span>
            </p>
            <p className="text-[#8E8E93] mb-3">
              Password: <span className="text-white font-mono">{DEMO_PASSWORD}</span>
            </p>
            <button
              type="button"
              onClick={handlePrefillAdidas}
              className="w-full py-2 bg-white text-black font-semibold rounded hover:bg-neutral-200 transition-colors cursor-pointer"
            >
              Prefill & Auto-populate
            </button>
          </div>
        )}
      </div>

      {/* Left panel - pure black bg-[#000000] */}
      <div className="hidden md:flex flex-col justify-between p-12 lg:p-20 bg-[#000000]">
        <div /> {/* Spacer to align contents vertically center */}
        
        <div className="max-w-[650px] my-auto flex flex-col items-start">
          {/* Logo - Enlarged to 650px and shifted slightly to the right */}
          <Link href="/" className="inline-block ml-3 mb-2">
            <img 
              src="/agncypayLogo.png" 
              alt="AgncyPay" 
              style={{ width: "650px", height: "150px", objectFit: "contain", objectPosition: "left", opacity: 1 }} 
            />
          </Link>
          
          <div className="space-y-4">
            <h1 className="text-[44px] font-semibold leading-[1.08] tracking-tight text-white whitespace-pre-line">
              Enterprise Payment{"\n"}Infrastructure
            </h1>
            <p className="text-[#8E8E93] text-[15px] sm:text-base leading-relaxed font-normal">
              Secure, scalable payment orchestration for brands managing agency workflows.
            </p>
          </div>
        </div>
        
        <div className="text-xs text-[#52525B]">
          {/* Bottom left spacer */}
        </div>
      </div>

      {/* Right panel - dark charcoal bg-[#121212] */}
      <div className="flex flex-col justify-between p-8 sm:p-12 md:p-16 lg:p-20 bg-[#121212] min-h-screen">
        <div className="flex-1 flex flex-col justify-center max-w-[400px] w-full mx-auto">
          {/* Mobile logo header - hidden on desktop */}
          <div className="md:hidden mb-10">
            <Link href="/" className="inline-flex items-center">
              <img 
                src="/agncypayLogo.png" 
                alt="AgncyPay" 
                style={{ width: "240px", height: "55px", objectFit: "contain", objectPosition: "left" }} 
              />
            </Link>
          </div>

          <div className="mb-8">
            <h2 className="text-[32px] font-medium text-white tracking-tight leading-tight">
              Welcome Back
            </h2>
            <p className="text-[#8E8E93] text-sm mt-1.5 font-normal">
              Sign in to your AgncyPay account
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Email Address */}
            <div className="flex flex-col gap-2 w-full">
              <label htmlFor="email" className="text-[13px] font-medium text-[#E5E5EA]">
                Email Address
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  if (errors.email) setErrors({});
                }}
                className={`w-full border !bg-[#0B0B0B] !border-[#262626] ${errors.email ? "border-white/40" : ""} focus:border-white/30 focus:outline-none rounded-lg px-4 py-3 text-sm text-[#F8FAFC] placeholder-[#5A5A62] transition-colors`}
                placeholder="you@company.com"
              />
              {errors.email && (
                <span className="text-xs text-white mt-0.5">{errors.email}</span>
              )}
            </div>

            {/* Password */}
            <div className="flex flex-col gap-2 w-full">
              <div className="flex justify-between items-center">
                <label htmlFor="password" className="text-[13px] font-medium text-[#E5E5EA]">
                  Password
                </label>
                <Link
                  href="/auth/forgot-password"
                  className="text-xs text-[#8E8E93] hover:text-white transition-colors"
                >
                  Forgot?
                </Link>
              </div>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  if (errors.password) setErrors({});
                }}
                className={`w-full border !bg-[#0B0B0B] !border-[#262626] ${errors.password ? "border-white/40" : ""} focus:border-white/30 focus:outline-none rounded-lg px-4 py-3 text-sm text-[#F8FAFC] placeholder-[#5A5A62] transition-colors`}
                placeholder="••••••••"
              />
              {errors.password && (
                <span className="text-xs text-white mt-0.5">{errors.password}</span>
              )}
            </div>

            {/* Remember Me */}
            <div className="flex items-center gap-2.5 pt-1">
              <input
                type="checkbox"
                id="remember"
                checked={rememberMe}
                onChange={() => setRememberMe(!rememberMe)}
                className="w-4 h-4 rounded border-[#262626] bg-[#0B0B0B] checked:bg-white checked:border-white accent-white cursor-pointer"
              />
              <label
                htmlFor="remember"
                className="text-sm text-[#8E8E93] cursor-pointer hover:text-[#E5E5EA] select-none"
              >
                Remember me for 30 days
              </label>
            </div>

            {/* Sign In CTA */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full flex items-center justify-center gap-2 h-[46px] bg-white hover:bg-neutral-200 text-black font-semibold text-sm rounded-lg transition-colors cursor-pointer mt-6"
            >
              {isLoading ? (
                <span className="flex items-center gap-2">
                  <svg className="animate-spin h-4 w-4 text-black" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  Signing In...
                </span>
              ) : (
                <span className="flex items-center justify-center gap-2 w-full">
                  Sign In
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3"></path>
                  </svg>
                </span>
              )}
            </button>
          </form>

          {/* Don't have an account */}
          <div className="text-center text-sm text-[#8E8E93] mt-6">
            Don't have an account?{" "}
            <Link href="/auth/register" className="text-white hover:underline font-medium ml-1">
              Sign up
            </Link>
          </div>

          {/* Divider and Encryption footer matching the screenshot exactly */}
          <div className="border-t border-[#262626] my-6"></div>
        </div>

        {/* Bank security disclaimer */}
        <div className="text-center text-xs text-[#52525B] font-medium tracking-wide pt-8 mt-auto">
          Protected by bank-level security and encryption
        </div>
      </div>
    </div>
  );
}
