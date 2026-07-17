"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { useApp } from "../../context/AppContext";

const COUNTRIES = ["United States", "Canada", "United Kingdom", "Germany", "France"];
const INDUSTRIES = [
  "Advertising & Marketing",
  "Technology",
  "Retail",
  "Financial Services",
  "Professional Services",
];

export function BusinessDetailsForm() {
  const router = useRouter();
  const { state, updateBusinessSetup } = useApp();
  const hasSavedDetails = Boolean(
    state.businessSetup.address ||
      state.businessSetup.city ||
      state.businessSetup.businessState ||
      state.businessSetup.zipCode ||
      state.businessSetup.companyDescription
  );

  const [formData, setFormData] = useState({
    address: hasSavedDetails ? state.businessSetup.address || "" : "",
    city: hasSavedDetails ? state.businessSetup.city || "" : "",
    businessState: hasSavedDetails ? state.businessSetup.businessState || "" : "",
    zipCode: hasSavedDetails ? state.businessSetup.zipCode || "" : "",
    country: hasSavedDetails ? state.businessSetup.country || "" : "",
    industry: hasSavedDetails ? state.businessSetup.industry || "" : "",
    companyDescription: hasSavedDetails
      ? state.businessSetup.companyDescription || ""
      : "",
  });

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateBusinessSetup(formData);
    router.push("/verification/representative");
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="mx-auto w-full max-w-[858px] pb-12 pt-8 sm:pb-14 sm:pt-10 lg:pb-16 lg:pt-12 xl:pt-[52px]"
    >
      <div className="mb-8 flex flex-col items-start justify-between gap-5 sm:mb-10 sm:flex-row sm:gap-8">
        <div>
          <h1 className="text-[28px] font-bold leading-[1.08] tracking-normal text-white sm:text-[32px] lg:text-[34px]">
            Business Details
          </h1>
          <p className="mt-3 text-[17px] font-normal leading-snug text-[#A0A0A0] sm:mt-[15px] sm:text-[20px] lg:text-[21px]">
            Tell us more about your business operations
          </p>
        </div>

        <button
          type="button"
          onClick={() => router.push("/dashboard")}
          className="h-10 w-[142px] rounded-[7px] bg-white text-[15px] font-semibold text-black transition-colors hover:bg-[#EDEDED] sm:mt-[-5px] sm:h-11 sm:w-[150px] sm:text-[16px]"
        >
          Skip For Now
        </button>
      </div>

      <div className="rounded-[8px] border border-[#565656] bg-black px-5 py-6 shadow-[0_18px_60px_rgba(0,0,0,0.28)] sm:px-8 sm:py-8 lg:px-10">
        <div className="space-y-5 sm:space-y-[22px]">
          <label className="block">
            <span className="mb-[9px] block text-[16px] font-semibold leading-none tracking-normal text-[#F4F4F4]">
              Business Address
            </span>
            <input
              name="address"
              value={formData.address}
              onChange={handleChange}
              placeholder="123 Main Street"
              className="h-11 w-full rounded-[6px] border border-[#727272] bg-[#0A0A0A] px-[14px] text-[16px] font-normal text-white outline-none transition-colors placeholder:text-[#A8A8A8] focus:border-white sm:text-[18px]"
            />
          </label>

          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 sm:gap-[17px]">
            <label className="block">
              <span className="mb-[9px] block text-[16px] font-semibold leading-none tracking-normal text-[#F4F4F4]">
                City
              </span>
              <input
                name="city"
                value={formData.city}
                onChange={handleChange}
                placeholder="San Francisco"
                className="h-11 w-full rounded-[6px] border border-[#727272] bg-[#0A0A0A] px-[14px] text-[16px] font-normal text-white outline-none transition-colors placeholder:text-[#A8A8A8] focus:border-white sm:text-[18px]"
              />
            </label>

            <label className="block">
              <span className="mb-[9px] block text-[16px] font-semibold leading-none tracking-normal text-[#F4F4F4]">
                State
              </span>
              <input
                name="businessState"
                value={formData.businessState}
                onChange={handleChange}
                placeholder="CA"
                className="h-11 w-full rounded-[6px] border border-[#727272] bg-[#0A0A0A] px-[14px] text-[16px] font-normal text-white outline-none transition-colors placeholder:text-[#A8A8A8] focus:border-white sm:text-[18px]"
              />
            </label>
          </div>

          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 sm:gap-[17px]">
            <label className="block">
              <span className="mb-[9px] block text-[16px] font-semibold leading-none tracking-normal text-[#F4F4F4]">
                ZIP Code
              </span>
              <input
                name="zipCode"
                value={formData.zipCode}
                onChange={handleChange}
                placeholder="94105"
                className="h-11 w-full rounded-[6px] border border-[#727272] bg-[#0A0A0A] px-[14px] text-[16px] font-normal text-white outline-none transition-colors placeholder:text-[#A8A8A8] focus:border-white sm:text-[18px]"
              />
            </label>

            <label className="block">
              <span className="mb-[9px] block text-[16px] font-semibold leading-none tracking-normal text-[#F4F4F4]">
                Country
              </span>
              <div className="relative">
                <select
                  name="country"
                  value={formData.country}
                  onChange={handleChange}
                  className="h-11 w-full appearance-none rounded-[6px] border border-[#727272] bg-[#0A0A0A] px-[14px] pr-11 text-[16px] font-normal text-[#A8A8A8] outline-none transition-colors focus:border-white sm:text-[18px]"
                >
                  <option value="">Select country</option>
                  {COUNTRIES.map((country) => (
                    <option key={country} value={country} className="bg-black text-white">
                      {country}
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
              Industry
            </span>
            <div className="relative">
              <select
                name="industry"
                value={formData.industry}
                onChange={handleChange}
                className="h-11 w-full appearance-none rounded-[6px] border border-[#727272] bg-[#0A0A0A] px-[14px] pr-11 text-[16px] font-normal text-[#A8A8A8] outline-none transition-colors focus:border-white sm:text-[18px]"
              >
                <option value="">Select industry</option>
                {INDUSTRIES.map((industry) => (
                  <option key={industry} value={industry} className="bg-black text-white">
                    {industry}
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

          <label className="block">
            <span className="mb-[9px] block text-[16px] font-semibold leading-none tracking-normal text-[#F4F4F4]">
              Company Description
            </span>
            <textarea
              name="companyDescription"
              value={formData.companyDescription}
              onChange={handleChange}
              placeholder="Brief description of your business..."
              className="h-[88px] w-full resize-none rounded-[6px] border border-[#727272] bg-[#0A0A0A] px-[14px] py-[12px] text-[16px] font-normal text-white outline-none transition-colors placeholder:text-[#A8A8A8] focus:border-white sm:text-[18px]"
            />
          </label>
        </div>
      </div>

      <div className="mt-8 flex items-center justify-between gap-4 sm:mt-10">
        <button
          type="button"
          onClick={() => router.push("/verification/business-info")}
          className="flex h-11 w-[112px] items-center justify-center gap-2 rounded-[7px] border border-[#5E5E5E] bg-black text-[15px] font-semibold text-[#8C8C8C] transition-colors hover:border-[#8A8A8A] hover:text-white sm:w-[120px] sm:gap-[13px] sm:text-[16px]"
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
