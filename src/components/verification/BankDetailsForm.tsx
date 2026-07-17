"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, ArrowRight, CreditCard } from "lucide-react";
import { useApp } from "../../context/AppContext";

const ACCOUNT_TYPES = ["Checking", "Savings", "Business Checking", "Treasury"];

export function BankDetailsForm() {
  const router = useRouter();
  const { state, updateBankDetails } = useApp();
  const hasSavedBank =
    state.bankDetails.accountHolderName &&
    state.bankDetails.accountHolderName !== "Adidas AG";

  const [formData, setFormData] = useState({
    accountHolderName: hasSavedBank ? state.bankDetails.accountHolderName || "" : "",
    bankName: hasSavedBank ? state.bankDetails.bankName || "" : "",
    routingNumber: hasSavedBank ? state.bankDetails.routingNumber || "" : "",
    accountNumber: hasSavedBank ? state.bankDetails.accountNumber || "" : "",
    accountType: "",
  });

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateBankDetails({
      accountHolderName: formData.accountHolderName,
      bankName: formData.bankName,
      routingNumber: formData.routingNumber,
      accountNumber: formData.accountNumber,
      statementUploaded: true,
    });
    router.push("/verification/brand");
  };

  const labelClass =
    "mb-[9px] block text-[16px] font-semibold leading-none tracking-normal text-[#F4F4F4]";
  const inputClass =
    "h-11 w-full rounded-[6px] border border-[#727272] bg-[#0A0A0A] px-[14px] text-[16px] font-normal text-white outline-none transition-colors placeholder:text-[#A8A8A8] focus:border-white sm:text-[18px]";
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
            Bank Account
          </h1>
          <p className="mt-3 text-[17px] font-normal leading-snug text-[#A0A0A0] sm:mt-[15px] sm:text-[20px] lg:text-[21px]">
            Connect your primary bank account for settlements
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
        <div className="rounded-[8px] border border-[#747474] bg-[#0A0A0A] px-5 py-[30px] sm:px-[30px] sm:py-[36px]">
          <div className="flex items-start gap-[22px]">
            <CreditCard
              className="mt-[2px] h-[32px] w-[32px] shrink-0 text-[#B8B8B8]"
              strokeWidth={1.7}
            />
            <div>
              <h2 className="text-[25px] font-bold leading-tight text-white sm:text-[31px]">
                Secure Bank Connection
              </h2>
              <p className="mt-[17px] max-w-[690px] text-[15px] font-normal leading-[1.55] text-[#A4A4A4] sm:text-[17px]">
                Connect your business bank account for payment settlements. All
                connections are encrypted and secure.
              </p>
            </div>
          </div>
        </div>

        <div className="mt-[49px] space-y-[22px]">
          <label className="block">
            <span className={labelClass}>Account Holder Name</span>
            <input
              name="accountHolderName"
              value={formData.accountHolderName}
              onChange={handleChange}
              placeholder="Acme Corporation Inc."
              className={inputClass}
            />
          </label>

          <label className="block">
            <span className={labelClass}>Bank Name</span>
            <input
              name="bankName"
              value={formData.bankName}
              onChange={handleChange}
              placeholder="Chase Bank"
              className={inputClass}
            />
          </label>

          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 sm:gap-[17px]">
            <label className="block">
              <span className={labelClass}>Routing Number</span>
              <input
                name="routingNumber"
                value={formData.routingNumber}
                onChange={handleChange}
                placeholder="XXXXXXXXX"
                className={inputClass}
              />
            </label>

            <label className="block">
              <span className={labelClass}>Account Number</span>
              <input
                name="accountNumber"
                value={formData.accountNumber}
                onChange={handleChange}
                placeholder="XXXXXXXXXXXX"
                className={inputClass}
              />
            </label>
          </div>

          <label className="block">
            <span className={labelClass}>Account Type</span>
            <div className="relative">
              <select
                name="accountType"
                value={formData.accountType}
                onChange={handleChange}
                className={selectClass}
              >
                <option value="">Select account type</option>
                {ACCOUNT_TYPES.map((type) => (
                  <option key={type} value={type} className="bg-black text-white">
                    {type}
                  </option>
                ))}
              </select>
              <SelectChevron />
            </div>
          </label>

          <button
            type="button"
            className="h-11 w-full rounded-[6px] border border-[#727272] bg-black text-[16px] font-semibold text-white transition-colors hover:border-white"
          >
            Or Connect via Plaid
          </button>
        </div>
      </section>

      <div className="mt-8 flex items-center justify-between gap-4 sm:mt-10">
        <button
          type="button"
          onClick={() => router.push("/verification/documents")}
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
