"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, ArrowRight } from "lucide-react";

const PAYMENT_METHODS = ["ACH Transfer", "Wire Transfer", "Card", "Same-day ACH"];
const APPROVAL_THRESHOLDS = [
  "No approval required",
  "Over $1,000",
  "Over $5,000",
  "Over $10,000",
  "All payments",
];
const SETTLEMENT_FREQUENCIES = ["Daily", "Weekly", "Bi-weekly", "Monthly"];
const TIME_ZONES = [
  "Pacific Time (PT)",
  "Mountain Time (MT)",
  "Central Time (CT)",
  "Eastern Time (ET)",
  "UTC",
];

export default function PaymentPreferencesPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    defaultPaymentMethod: "",
    approvalThreshold: "",
    settlementFrequency: "",
    timeZone: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    router.push("/verification/review");
  };

  const labelClass =
    "mb-[9px] block text-[16px] font-semibold leading-none tracking-normal text-[#F4F4F4]";
  const selectClass =
    "h-11 w-full appearance-none rounded-[6px] border border-[#727272] bg-[#0A0A0A] px-[14px] pr-11 text-[16px] font-normal text-[#A8A8A8] outline-none transition-colors focus:border-white sm:text-[18px]";

  return (
    <form
      onSubmit={handleSubmit}
      className="mx-auto w-full max-w-[858px] pb-12 pt-8 sm:pb-14 sm:pt-10 lg:pb-16 lg:pt-12 xl:pt-[52px]"
    >
      <div className="mb-8 flex flex-col items-start justify-between gap-5 sm:mb-10 sm:flex-row sm:gap-8">
        <div>
          <h1 className="text-[28px] font-bold leading-[1.08] tracking-normal text-white sm:text-[32px] lg:text-[34px]">
            Payment Preferences
          </h1>
          <p className="mt-3 text-[17px] font-normal leading-snug text-[#A0A0A0] sm:mt-[15px] sm:text-[20px] lg:text-[21px]">
            Configure your payment workflow preferences
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

      <section className="rounded-[8px] border border-[#565656] bg-black px-5 py-6 shadow-[0_18px_60px_rgba(0,0,0,0.28)] sm:px-8 sm:py-[39px] lg:px-10">
        <div className="space-y-[22px]">
          <PreferenceSelect
            label="Default Payment Method"
            name="defaultPaymentMethod"
            value={formData.defaultPaymentMethod}
            placeholder="Select default"
            options={PAYMENT_METHODS}
            labelClass={labelClass}
            selectClass={selectClass}
            onChange={handleChange}
          />
          <PreferenceSelect
            label="Approval Threshold"
            name="approvalThreshold"
            value={formData.approvalThreshold}
            placeholder="Select threshold"
            options={APPROVAL_THRESHOLDS}
            labelClass={labelClass}
            selectClass={selectClass}
            onChange={handleChange}
          />
          <PreferenceSelect
            label="Settlement Frequency"
            name="settlementFrequency"
            value={formData.settlementFrequency}
            placeholder="Select frequency"
            options={SETTLEMENT_FREQUENCIES}
            labelClass={labelClass}
            selectClass={selectClass}
            onChange={handleChange}
          />
          <PreferenceSelect
            label="Time Zone"
            name="timeZone"
            value={formData.timeZone}
            placeholder="Select time zone"
            options={TIME_ZONES}
            labelClass={labelClass}
            selectClass={selectClass}
            onChange={handleChange}
          />
        </div>
      </section>

      <div className="mt-8 flex items-center justify-between gap-4 sm:mt-10">
        <button
          type="button"
          onClick={() => router.push("/verification/brand")}
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

interface PreferenceSelectProps {
  label: string;
  name: string;
  value: string;
  placeholder: string;
  options: string[];
  labelClass: string;
  selectClass: string;
  onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
}

function PreferenceSelect({
  label,
  name,
  value,
  placeholder,
  options,
  labelClass,
  selectClass,
  onChange,
}: PreferenceSelectProps) {
  return (
    <label className="block">
      <span className={labelClass}>{label}</span>
      <div className="relative">
        <select name={name} value={value} onChange={onChange} className={selectClass}>
          <option value="">{placeholder}</option>
          {options.map((option) => (
            <option key={option} value={option} className="bg-black text-white">
              {option}
            </option>
          ))}
        </select>
        <SelectChevron />
      </div>
    </label>
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
