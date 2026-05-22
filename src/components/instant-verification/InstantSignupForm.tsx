"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, ArrowRight, Building2, Mail, UserRound } from "lucide-react";
import { useApp } from "../../context/AppContext";
import { InstantFlowSummary } from "./InstantFlowSummary";
import { InstantStepShell } from "./InstantStepShell";

export function InstantSignupForm() {
  const router = useRouter();
  const { state, updateBusinessSetup } = useApp();
  const [formData, setFormData] = useState({
    name: state.user?.fullName || "",
    email: state.user?.email || state.businessSetup.email || "",
    companyName:
      state.businessSetup.legalName && state.businessSetup.legalName !== "Adidas AG"
        ? state.businessSetup.legalName
        : "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const validate = () => {
    const nextErrors: Record<string, string> = {};
    if (!formData.name.trim()) nextErrors.name = "Name is required";
    if (!formData.email.trim()) {
      nextErrors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      nextErrors.email = "Enter a valid email";
    }
    if (!formData.companyName.trim()) {
      nextErrors.companyName = "Company name is required";
    }

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    if (!validate()) return;

    updateBusinessSetup({
      legalName: formData.companyName.trim(),
      brandName: formData.companyName.trim(),
      email: formData.email.trim(),
    });
    router.push("/verification/instant/connect-bank");
  };

  return (
    <InstantStepShell
      eyebrow="Instant bank-based verification"
      title="Start with basic company details"
      description="Use this faster path when the client wants bank ownership, KYB, and risk checks to run with less manual input."
      aside={<InstantFlowSummary activeStep="signup" />}
    >
      <form
        onSubmit={handleSubmit}
        className="rounded-[8px] border border-[#565656] bg-black px-5 py-6 shadow-[0_18px_60px_rgba(0,0,0,0.28)] sm:px-8 sm:py-8 lg:px-10"
      >
        <div className="space-y-5 sm:space-y-[22px]">
          <InstantInput
            id="instant-name"
            name="name"
            label="Full Name"
            value={formData.name}
            onChange={handleChange}
            placeholder="Martin Safi"
            error={errors.name}
            icon={<UserRound className="h-4 w-4" strokeWidth={1.8} />}
          />

          <InstantInput
            id="instant-email"
            name="email"
            type="email"
            label="Work Email"
            value={formData.email}
            onChange={handleChange}
            placeholder="you@company.com"
            error={errors.email}
            icon={<Mail className="h-4 w-4" strokeWidth={1.8} />}
          />

          <InstantInput
            id="instant-company"
            name="companyName"
            label="Company Name"
            value={formData.companyName}
            onChange={handleChange}
            placeholder="Acme Corporation Inc."
            error={errors.companyName}
            icon={<Building2 className="h-4 w-4" strokeWidth={1.8} />}
          />
        </div>

        <div className="mt-8 flex flex-col-reverse gap-3 sm:mt-10 sm:flex-row sm:items-center sm:justify-between">
          <Link
            href="/verification/business-info"
            className="flex h-11 items-center justify-center gap-2 rounded-[7px] border border-[#5E5E5E] bg-black px-5 text-[15px] font-semibold text-[#8C8C8C] transition-colors hover:border-[#8A8A8A] hover:text-white sm:w-[190px] sm:text-[16px]"
          >
            <ArrowLeft className="h-5 w-5" strokeWidth={2} />
            Manual Flow
          </Link>

          <button
            type="submit"
            className="flex h-11 items-center justify-center gap-3 rounded-[7px] bg-white px-5 text-[15px] font-semibold text-black transition-colors hover:bg-[#EDEDED] sm:w-[240px] sm:gap-[17px] sm:text-[16px]"
          >
            Continue
            <ArrowRight className="h-5 w-5" strokeWidth={2.25} />
          </button>
        </div>
      </form>
    </InstantStepShell>
  );
}

interface InstantInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
  icon: React.ReactNode;
}

function InstantInput({
  label,
  error,
  icon,
  id,
  ...props
}: InstantInputProps) {
  return (
    <label className="block" htmlFor={id}>
      <span className="mb-[9px] block text-[16px] font-semibold leading-none tracking-normal text-[#F4F4F4]">
        {label}
      </span>
      <span className="relative block">
        <span className="pointer-events-none absolute left-[14px] top-1/2 -translate-y-1/2 text-[#8C8C8C]">
          {icon}
        </span>
        <input
          id={id}
          className="h-11 w-full rounded-[6px] border border-[#727272] bg-[#0A0A0A] px-[14px] pl-10 text-[16px] font-normal text-white outline-none transition-colors placeholder:text-[#A8A8A8] focus:border-white sm:text-[18px]"
          {...props}
        />
      </span>
      {error ? <span className="mt-2 block text-xs text-[#EF4444]">{error}</span> : null}
    </label>
  );
}
