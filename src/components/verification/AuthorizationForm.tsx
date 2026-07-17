"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, ArrowRight, Shield } from "lucide-react";
import { useApp } from "../../context/AppContext";

const STATES = ["California", "Delaware", "Florida", "New York", "Texas"];
const EMPLOYEE_RANGES = ["1-10", "11-50", "51-200", "201-500", "500+"];
const PAYMENT_RANGES = [
  "$0 - $10,000",
  "$10,000 - $50,000",
  "$50,000 - $250,000",
  "$250,000 - $1,000,000",
  "$1,000,000+",
];

export function AuthorizationForm() {
  const router = useRouter();
  const { state, updateAuthorization } = useApp();
  const hasSavedKyb = Boolean(
    state.authorization.formationDate ||
      state.authorization.incorporationState ||
      state.authorization.employeeRange ||
      state.authorization.monthlyPaymentVolume
  );

  const [formData, setFormData] = useState({
    formationDate: hasSavedKyb ? state.authorization.formationDate || "" : "",
    incorporationState: hasSavedKyb
      ? state.authorization.incorporationState || ""
      : "",
    employeeRange: hasSavedKyb ? state.authorization.employeeRange || "" : "",
    monthlyPaymentVolume: hasSavedKyb
      ? state.authorization.monthlyPaymentVolume || ""
      : "",
  });

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateAuthorization({
      ...formData,
      isOwner: state.authorization.isOwner ?? true,
      owns25Percent: state.authorization.owns25Percent ?? false,
      isAuthorizedForPayments:
        state.authorization.isAuthorizedForPayments ?? true,
    });
    router.push("/verification/documents");
  };

  const selectClass =
    "h-11 w-full appearance-none rounded-[6px] border border-[#727272] bg-[#0A0A0A] px-[14px] pr-11 text-[16px] font-normal text-[#A8A8A8] outline-none transition-colors focus:border-white sm:text-[18px]";
  const labelClass =
    "mb-[9px] block text-[16px] font-semibold leading-none tracking-normal text-[#F4F4F4]";
  const inputClass =
    "h-11 w-full rounded-[6px] border border-[#727272] bg-[#0A0A0A] px-[14px] text-[16px] font-normal text-white outline-none transition-colors placeholder:text-[#A8A8A8] focus:border-white sm:text-[18px]";

  return (
    <form
      onSubmit={handleSubmit}
      className="mx-auto w-full max-w-[858px] pb-12 pt-8 sm:pb-14 sm:pt-10 lg:pb-16 lg:pt-12 xl:pt-[52px]"
    >
      <div className="mb-8 flex flex-col items-start justify-between gap-5 sm:mb-10 sm:flex-row sm:gap-8">
        <div>
          <h1 className="text-[28px] font-bold leading-[1.08] tracking-normal text-white sm:text-[32px] lg:text-[34px]">
            KYB Verification
          </h1>
          <p className="mt-3 text-[17px] font-normal leading-snug text-[#A0A0A0] sm:mt-[15px] sm:text-[20px] lg:text-[21px]">
            Verify your business identity for compliance
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

      <section className="rounded-[8px] border border-[#565656] bg-black px-5 py-6 shadow-[0_18px_60px_rgba(0,0,0,0.28)] sm:px-8 sm:py-[31px]">
        <div className="flex items-start gap-[22px]">
          <Shield
            className="mt-[1px] h-[32px] w-[32px] shrink-0 text-[#B8B8B8] sm:h-[34px] sm:w-[34px]"
            strokeWidth={1.7}
          />
          <div>
            <h2 className="text-[24px] font-bold leading-tight text-white sm:text-[31px]">
              Why We Need This Information
            </h2>
            <p className="mt-[14px] max-w-[760px] text-[15px] font-normal leading-[1.55] text-[#9B9B9B] sm:text-[17px]">
              Federal regulations require us to verify your business identity.
              This helps prevent fraud and ensures a secure payment ecosystem
              for all users.
            </p>
          </div>
        </div>
      </section>

      <section className="mt-10 rounded-[8px] border border-[#565656] bg-black px-5 py-6 shadow-[0_18px_60px_rgba(0,0,0,0.28)] sm:px-8 sm:py-[38px] lg:px-10">
        <div className="space-y-[22px]">
          <label className="block">
            <span className={labelClass}>Business Formation Date</span>
            <input
              name="formationDate"
              value={formData.formationDate}
              onChange={handleChange}
              placeholder="12/06/2002"
              className={inputClass}
            />
          </label>

          <label className="block">
            <span className={labelClass}>State of Incorporation</span>
            <div className="relative">
              <select
                name="incorporationState"
                value={formData.incorporationState}
                onChange={handleChange}
                className={selectClass}
              >
                <option value="">Select state</option>
                {STATES.map((stateName) => (
                  <option key={stateName} value={stateName} className="bg-black text-white">
                    {stateName}
                  </option>
                ))}
              </select>
              <SelectChevron />
            </div>
          </label>

          <label className="block">
            <span className={labelClass}>Number of Employees</span>
            <div className="relative">
              <select
                name="employeeRange"
                value={formData.employeeRange}
                onChange={handleChange}
                className={selectClass}
              >
                <option value="">Select range</option>
                {EMPLOYEE_RANGES.map((range) => (
                  <option key={range} value={range} className="bg-black text-white">
                    {range}
                  </option>
                ))}
              </select>
              <SelectChevron />
            </div>
          </label>

          <label className="block">
            <span className={labelClass}>Expected Monthly Payment Volume</span>
            <div className="relative">
              <select
                name="monthlyPaymentVolume"
                value={formData.monthlyPaymentVolume}
                onChange={handleChange}
                className={selectClass}
              >
                <option value="">Select range</option>
                {PAYMENT_RANGES.map((range) => (
                  <option key={range} value={range} className="bg-black text-white">
                    {range}
                  </option>
                ))}
              </select>
              <SelectChevron />
            </div>
          </label>
        </div>
      </section>

      <div className="mt-8 flex items-center justify-between gap-4 sm:mt-10">
        <button
          type="button"
          onClick={() => router.push("/verification/representative")}
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

function SelectChevron() {
  return (
    <svg
      className="pointer-events-none absolute right-[15px] top-1/2 h-4 w-4 -translate-y-1/2 text-[#7A7A7A]"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth="2"
    >
      <path strokeLinecap="round" strokeLinejoin="round" d="m6 9 6 6 6-6" />
    </svg>
  );
}
