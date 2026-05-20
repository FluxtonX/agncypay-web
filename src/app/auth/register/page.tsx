"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { saveRegisteredUser } from "../../../lib/authStorage";

const DEMO_EMAIL = "martin.safi@adidas.com";
const DEMO_PASSWORD = "password123";

export default function RegisterPage() {
  const router = useRouter();

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [password, setPassword] = useState("");
  const [agree, setAgree] = useState(false);
  
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [showDemoHelper, setShowDemoHelper] = useState(false);

  const handlePrefillAdidas = () => {
    setFirstName("Martin");
    setLastName("Safi");
    setEmail(DEMO_EMAIL);
    setCompanyName("Adidas");
    setPassword(DEMO_PASSWORD);
    setAgree(true);
    setErrors({});
    setShowDemoHelper(false);
  };

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!firstName.trim()) newErrors.firstName = "First name is required";
    if (!lastName.trim()) newErrors.lastName = "Last name is required";
    if (!email) {
      newErrors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      newErrors.email = "Invalid email format";
    }
    if (!companyName.trim()) newErrors.companyName = "Company name is required";
    if (!password) {
      newErrors.password = "Password is required";
    } else if (password.length < 8) {
      newErrors.password = "Password must be at least 8 characters";
    }
    if (!agree) {
      newErrors.agree = "You must agree to the Terms of Service and Privacy Policy";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setIsLoading(true);
    setTimeout(() => {
      saveRegisteredUser({
        email,
        password,
        fullName: `${firstName.trim()} ${lastName.trim()}`,
        accountType: "brand",
      });
      setIsLoading(false);
      router.push("/auth/login");
    }, 1500);
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 min-h-screen w-full bg-[#000000] text-white font-sans relative">
      {/* Strict CSS overrides to force input elements to stay dark `#0B0B0B` and handle browser autofills */}
      <style dangerouslySetInnerHTML={{__html: `
        #firstName, #lastName, #email, #companyName, #password {
          background-color: #0B0B0B !important;
          border-color: #262626 !important;
          color: #F8FAFC !important;
        }
        #firstName:focus, #lastName:focus, #email:focus, #companyName:focus, #password:focus {
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
            <h4 className="font-semibold text-white mb-2">Demo Registration</h4>
            <p className="text-[#8E8E93] mb-1">
              Prefills a demo account with Martin Safi & Adidas corporate details.
            </p>
            <button
              type="button"
              onClick={handlePrefillAdidas}
              className="w-full py-2 bg-white text-black font-semibold rounded hover:bg-neutral-200 transition-colors cursor-pointer mt-2"
            >
              Prefill Demo Data
            </button>
          </div>
        )}
      </div>

      {/* Left panel - pure black bg-[#000000] */}
      <div className="hidden md:flex flex-col justify-between p-12 lg:p-20 bg-[#000000]">
        <div /> {/* Spacer to align contents vertically center */}
        
        <div className="max-w-[650px] my-auto flex flex-col items-start">
          {/* Logo - Large size matching the Figma specs: width 650px, height 150px */}
          <Link href="/" className="inline-block ml-3 mb-2">
            <img 
              src="/agncypayLogo.png" 
              alt="AgncyPay" 
              style={{ width: "650px", height: "150px", objectFit: "contain", objectPosition: "left", opacity: 1 }} 
            />
          </Link>
          
          <div className="space-y-6">
            <h1 className="text-[44px] font-semibold leading-[1.08] tracking-tight text-white whitespace-pre-line">
              Join Leading Brands{"\n"}Using AgencyPay
            </h1>
            
            <p className="text-[#8E8E93] text-[15px] sm:text-base leading-relaxed font-normal">
              Start managing your agency payments with enterprise-grade infrastructure in minutes.
            </p>

            {/* Bullet Points */}
            <ul className="space-y-4 pt-4 text-[15px] text-[#8E8E93] font-normal">
              <li className="flex items-center gap-3">
                <span className="w-1.5 h-1.5 rounded-full bg-[#8E8E93] shrink-0" />
                <span>Free 30-day trial, no credit card required</span>
              </li>
              <li className="flex items-center gap-3">
                <span className="w-1.5 h-1.5 rounded-full bg-[#8E8E93] shrink-0" />
                <span>Full platform access during trial</span>
              </li>
              <li className="flex items-center gap-3">
                <span className="w-1.5 h-1.5 rounded-full bg-[#8E8E93] shrink-0" />
                <span>White-glove onboarding support</span>
              </li>
            </ul>
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
              Create Account
            </h2>
            <p className="text-[#8E8E93] text-sm mt-1.5 font-normal">
              Get started with AgencyPay
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* First Name & Last Name */}
            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col gap-2 w-full">
                <label htmlFor="firstName" className="text-[13px] font-medium text-[#E5E5EA]">
                  First Name
                </label>
                <input
                  id="firstName"
                  type="text"
                  value={firstName}
                  onChange={(e) => {
                    setFirstName(e.target.value);
                    if (errors.firstName) setErrors({});
                  }}
                  className={`w-full border !bg-[#0B0B0B] !border-[#262626] ${errors.firstName ? "border-[#EF4444]" : ""} focus:border-white/30 focus:outline-none rounded-lg px-4 py-3 text-sm text-[#F8FAFC] placeholder-[#5A5A62] transition-colors`}
                  placeholder="Abc"
                />
                {errors.firstName && (
                  <span className="text-xs text-[#EF4444] mt-0.5">{errors.firstName}</span>
                )}
              </div>

              <div className="flex flex-col gap-2 w-full">
                <label htmlFor="lastName" className="text-[13px] font-medium text-[#E5E5EA]">
                  Last Name
                </label>
                <input
                  id="lastName"
                  type="text"
                  value={lastName}
                  onChange={(e) => {
                    setLastName(e.target.value);
                    if (errors.lastName) setErrors({});
                  }}
                  className={`w-full border !bg-[#0B0B0B] !border-[#262626] ${errors.lastName ? "border-[#EF4444]" : ""} focus:border-white/30 focus:outline-none rounded-lg px-4 py-3 text-sm text-[#F8FAFC] placeholder-[#5A5A62] transition-colors`}
                  placeholder="Abc"
                />
                {errors.lastName && (
                  <span className="text-xs text-[#EF4444] mt-0.5">{errors.lastName}</span>
                )}
              </div>
            </div>

            {/* Work Email */}
            <div className="flex flex-col gap-2 w-full">
              <label htmlFor="email" className="text-[13px] font-medium text-[#E5E5EA]">
                Work Email
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  if (errors.email) setErrors({});
                }}
                className={`w-full border !bg-[#0B0B0B] !border-[#262626] ${errors.email ? "border-[#EF4444]" : ""} focus:border-white/30 focus:outline-none rounded-lg px-4 py-3 text-sm text-[#F8FAFC] placeholder-[#5A5A62] transition-colors`}
                placeholder="you@company.com"
              />
              {errors.email && (
                <span className="text-xs text-[#EF4444] mt-0.5">{errors.email}</span>
              )}
            </div>

            {/* Company Name */}
            <div className="flex flex-col gap-2 w-full">
              <label htmlFor="companyName" className="text-[13px] font-medium text-[#E5E5EA]">
                Company Name
              </label>
              <input
                id="companyName"
                type="text"
                value={companyName}
                onChange={(e) => {
                  setCompanyName(e.target.value);
                  if (errors.companyName) setErrors({});
                }}
                className={`w-full border !bg-[#0B0B0B] !border-[#262626] ${errors.companyName ? "border-[#EF4444]" : ""} focus:border-white/30 focus:outline-none rounded-lg px-4 py-3 text-sm text-[#F8FAFC] placeholder-[#5A5A62] transition-colors`}
                placeholder="Acme Inc."
              />
              {errors.companyName && (
                <span className="text-xs text-[#EF4444] mt-0.5">{errors.companyName}</span>
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
                className={`w-full border !bg-[#0B0B0B] !border-[#262626] ${errors.password ? "border-[#EF4444]" : ""} focus:border-white/30 focus:outline-none rounded-lg px-4 py-3 text-sm text-[#F8FAFC] placeholder-[#5A5A62] transition-colors`}
                placeholder="••••••••"
              />
              <p className="text-[11px] text-[#8E8E93] mt-1 font-normal leading-normal">
                Minimum 8 characters, including letters and numbers
              </p>
              {errors.password && (
                <span className="text-xs text-[#EF4444] mt-0.5">{errors.password}</span>
              )}
            </div>

            {/* Agree Checkbox */}
            <div className="flex items-start gap-2.5 pt-1">
              <input
                type="checkbox"
                id="agree"
                checked={agree}
                onChange={() => setAgree(!agree)}
                className="w-4 h-4 rounded border-[#262626] bg-[#0B0B0B] checked:bg-white checked:border-white accent-white cursor-pointer mt-0.5"
              />
              <label
                htmlFor="agree"
                className="text-sm text-[#8E8E93] cursor-pointer hover:text-[#E5E5EA] select-none leading-tight"
              >
                I agree to the <span className="text-white font-medium">Terms of Service</span> and <span className="text-white font-medium">Privacy Policy</span>
              </label>
            </div>
            {errors.agree && (
              <span className="text-xs text-[#EF4444] block mt-0.5">{errors.agree}</span>
            )}

            {/* Create Account CTA */}
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
                  Creating Account...
                </span>
              ) : (
                <span className="flex items-center justify-center gap-2 w-full">
                  Create Account
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3"></path>
                  </svg>
                </span>
              )}
            </button>
          </form>

          {/* Footer - "Already have an account? Sign in" linking to login */}
          <div className="text-center text-sm text-[#8E8E93] mt-6">
            Already have an account?{" "}
            <Link href="/auth/login" className="text-white hover:underline font-medium ml-1">
              Sign in
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
