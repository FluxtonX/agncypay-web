"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { useApp } from "../../context/AppContext";

const ENTITY_TYPES = [
  "Corporation",
  "Limited Liability Company",
  "Partnership",
  "Sole Proprietorship",
  "Nonprofit",
];

export function BusinessInfoForm() {
  const router = useRouter();
  const { state, updateBusinessSetup } = useApp();
  const hasSavedCompany =
    state.businessSetup.legalName &&
    state.businessSetup.legalName !== "Adidas AG";

  const [formData, setFormData] = useState({
    legalName: hasSavedCompany ? state.businessSetup.legalName || "" : "",
    brandName: hasSavedCompany ? state.businessSetup.brandName || "" : "",
    taxId: hasSavedCompany ? state.businessSetup.taxId || "" : "",
    businessType: hasSavedCompany ? state.businessSetup.businessType || "" : "",
    website: hasSavedCompany ? state.businessSetup.website || "" : "",
  });

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateBusinessSetup({
      legalName: formData.legalName,
      brandName: formData.brandName,
      taxId: formData.taxId,
      businessType: formData.businessType,
      website: formData.website,
    });
    router.push("/verification/business-details");
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="mx-auto w-full max-w-[858px] pb-12 pt-8 sm:pb-14 sm:pt-10 lg:pb-16 lg:pt-12 xl:pt-[52px]"
    >
      <div className="mb-8 flex flex-col items-start justify-between gap-5 sm:mb-10 sm:flex-row sm:gap-8">
        <div>
          <h1 className="text-[28px] font-bold leading-[1.08] tracking-normal text-white sm:text-[32px] lg:text-[34px]">
            Company Information
          </h1>
          <p className="mt-3 text-[17px] font-normal leading-snug text-[#A0A0A0] sm:mt-[15px] sm:text-[20px] lg:text-[21px]">
            Provide basic information about your organization
          </p>
        </div>

      </div>

      <div className="rounded-[8px] border border-[#565656] bg-black px-5 py-6 shadow-[0_18px_60px_rgba(0,0,0,0.28)] sm:px-8 sm:py-8 lg:px-10">
        <div className="space-y-5 sm:space-y-[22px]">
          <label className="block">
            <span className="mb-[9px] block text-[16px] font-semibold leading-none tracking-normal text-[#F4F4F4]">
              Legal Company Name
            </span>
            <input
              name="legalName"
              value={formData.legalName}
              onChange={handleChange}
              required
              placeholder="Acme Corporation Inc."
              className="h-11 w-full rounded-[6px] border border-[#727272] bg-[#0A0A0A] px-[14px] text-[16px] font-normal text-white outline-none transition-colors placeholder:text-[#A8A8A8] focus:border-white sm:text-[18px]"
            />
          </label>

          <label className="block">
            <span className="mb-[9px] block text-[16px] font-semibold leading-none tracking-normal text-[#F4F4F4]">
              Doing Business As (DBA)
            </span>
            <input
              name="brandName"
              value={formData.brandName}
              onChange={handleChange}
              placeholder="Acme (optional)"
              className="h-11 w-full rounded-[6px] border border-[#727272] bg-[#0A0A0A] px-[14px] text-[16px] font-normal text-white outline-none transition-colors placeholder:text-[#A8A8A8] focus:border-white sm:text-[18px]"
            />
          </label>

          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 sm:gap-[17px]">
            <label className="block">
              <span className="mb-[9px] block text-[16px] font-semibold leading-none tracking-normal text-[#F4F4F4]">
                Tax ID / EIN
              </span>
              <input
                name="taxId"
                value={formData.taxId}
                onChange={handleChange}
                required
                placeholder="XX-XXXXXXX"
                className="h-11 w-full rounded-[6px] border border-[#727272] bg-[#0A0A0A] px-[14px] text-[16px] font-normal text-white outline-none transition-colors placeholder:text-[#A8A8A8] focus:border-white sm:text-[18px]"
              />
            </label>

            <label className="block">
              <span className="mb-[9px] block text-[16px] font-semibold leading-none tracking-normal text-[#F4F4F4]">
                Entity Type
              </span>
              <div className="relative">
                <select
                  name="businessType"
                  value={formData.businessType}
                  onChange={handleChange}
                  required
                  className="h-11 w-full appearance-none rounded-[6px] border border-[#727272] bg-[#0A0A0A] px-[14px] pr-11 text-[16px] font-normal text-[#A8A8A8] outline-none transition-colors focus:border-white sm:text-[18px]"
                >
                  <option value="">Select type</option>
                  {ENTITY_TYPES.map((type) => (
                    <option key={type} value={type} className="bg-black text-white">
                      {type}
                    </option>
                  ))}
                </select>
                <svg
                  className="pointer-events-none absolute right-[15px] top-1/2 h-4 w-4 -translate-y-1/2 text-[#7A7A7A]"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="m6 9 6 6 6-6"
                  />
                </svg>
              </div>
            </label>
          </div>

          <label className="block">
            <span className="mb-[9px] block text-[16px] font-semibold leading-none tracking-normal text-[#F4F4F4]">
              Business Website
            </span>
            <input
              name="website"
              value={formData.website}
              onChange={handleChange}
              required
              placeholder="https://acme.com"
              className="h-11 w-full rounded-[6px] border border-[#727272] bg-[#0A0A0A] px-[14px] text-[16px] font-normal text-white outline-none transition-colors placeholder:text-[#A8A8A8] focus:border-white sm:text-[18px]"
            />
          </label>
        </div>
      </div>

      <div className="mt-8 flex items-center justify-between gap-4 sm:mt-10">
        <button
          type="button"
          disabled
          className="flex h-11 w-[112px] items-center justify-center gap-2 rounded-[7px] border border-[#5E5E5E] bg-black text-[15px] font-semibold text-[#8C8C8C] sm:w-[120px] sm:gap-[13px] sm:text-[16px]"
        >
          <ArrowLeft className="h-5 w-5" strokeWidth={2} />
          Back
        </button>

        <button
          type="submit"
          className="flex h-11 w-[170px] items-center justify-center gap-3 rounded-[7px] bg-white text-[15px] font-semibold text-black transition-colors hover:bg-[#EDEDED] sm:w-[200px] sm:gap-[17px] sm:text-[16px]"
        >
          Continue
          <ArrowRight className="h-5 w-5" strokeWidth={2.25} />
        </button>
      </div>
    </form>
  );
}
