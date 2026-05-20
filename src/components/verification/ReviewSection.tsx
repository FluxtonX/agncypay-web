"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, ArrowRight, CheckCircle2 } from "lucide-react";
import { useApp } from "../../context/AppContext";

const REVIEW_ITEMS = [
  { label: "Company Information", status: "Complete" },
  { label: "Business Details", status: "Complete" },
  { label: "Authorized Representative", status: "Complete" },
  { label: "KYB Verification", status: "Complete" },
  { label: "Documents Uploaded", status: "4 of 4 files" },
  { label: "Bank Account", status: "Connected" },
  { label: "Team Members", status: "2 invited" },
  { label: "Payment Preferences", status: "Configured" },
];

const NEXT_STEPS = [
  "Our compliance team reviews your application",
  "We'll verify your business and documents",
  "You'll receive approval within 24-48 hours",
  "Your account will be activated and ready to use",
];

export function ReviewSection() {
  const router = useRouter();
  const { submitForVerification } = useApp();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    submitForVerification();
    router.push("/verification/status");
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="mx-auto w-full max-w-[858px] pb-12 pt-8 sm:pb-14 sm:pt-10 lg:pb-16 lg:pt-12 xl:pt-[52px]"
    >
      <div className="mb-8 flex flex-col items-start justify-between gap-5 sm:mb-10 sm:flex-row sm:gap-8">
        <div>
          <h1 className="text-[28px] font-bold leading-[1.08] tracking-normal text-white sm:text-[32px] lg:text-[34px]">
            Review & Submit
          </h1>
          <p className="mt-3 text-[17px] font-normal leading-snug text-[#A0A0A0] sm:mt-[15px] sm:text-[20px] lg:text-[21px]">
            Review your information before submitting
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
          <h2 className="text-[25px] font-bold leading-tight text-white sm:text-[30px]">
            Review Your Information
          </h2>
          <p className="mt-[17px] max-w-[695px] text-[15px] font-normal leading-[1.55] text-[#A4A4A4] sm:text-[17px]">
            Please review all the information you've provided before submitting.
            Our compliance team will review your application within 24-48 hours.
          </p>
        </div>

        <div className="mt-[48px] space-y-5">
          {REVIEW_ITEMS.map((item) => (
            <div
              key={item.label}
              className="flex min-h-[70px] items-center justify-between gap-4 rounded-[7px] border border-[#727272] bg-black px-5 sm:px-[21px]"
            >
              <span className="text-[18px] font-normal leading-tight text-[#C8C8C8] sm:text-[21px]">
                {item.label}
              </span>
              <span className="flex shrink-0 items-center gap-[12px] text-[15px] font-normal text-[#A7A7A7] sm:text-[17px]">
                <CheckCircle2 className="h-[18px] w-[18px]" strokeWidth={2} />
                {item.status}
              </span>
            </div>
          ))}
        </div>

        <div className="my-[49px] border-t border-[#6A6A6A]" />

        <div className="rounded-[8px] border border-[#747474] bg-black px-5 py-[31px] sm:px-[30px] sm:py-[36px]">
          <h2 className="text-[25px] font-bold leading-tight text-white sm:text-[30px]">
            What Happens Next?
          </h2>
          <ol className="mt-[22px] space-y-[16px] text-[15px] font-normal text-[#A4A4A4] sm:text-[17px]">
            {NEXT_STEPS.map((step, index) => (
              <li key={step} className="flex gap-[14px]">
                <span>{index + 1}.</span>
                <span>{step}</span>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <div className="mt-8 flex items-center justify-between gap-4 sm:mt-10">
        <button
          type="button"
          onClick={() => router.push("/verification/payment-preferences")}
          className="flex h-11 w-[112px] items-center justify-center gap-2 rounded-[7px] border border-[#5E5E5E] bg-black text-[15px] font-semibold text-[#8C8C8C] transition-colors hover:border-[#8A8A8A] hover:text-white sm:w-[120px] sm:gap-[13px] sm:text-[16px]"
        >
          <ArrowLeft className="h-5 w-5" strokeWidth={2} />
          Back
        </button>

        <button
          type="submit"
          className="flex h-11 w-[200px] items-center justify-center gap-3 rounded-[7px] bg-white text-[15px] font-semibold text-black transition-colors hover:bg-[#EDEDED] sm:w-[200px] sm:gap-[17px] sm:text-[16px]"
        >
          Complete Setup
          <ArrowRight className="h-5 w-5" strokeWidth={2.25} />
        </button>
      </div>
    </form>
  );
}
