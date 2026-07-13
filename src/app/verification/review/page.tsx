"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { ClipboardCheck, ArrowRight, ArrowLeft, CheckCircle2 } from "lucide-react";
import { useApp } from "../../../context/AppContext";

export default function ReviewPage() {
  const router = useRouter();
  const { submitForVerification } = useApp();
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!termsAccepted) return;
    
    setIsSubmitting(true);
    await submitForVerification();
    setIsSubmitting(false);
    
    // In a real app, this might show a success state or redirect to dashboard
    router.push("/dashboard");
  };

  return (
    <div className="mx-auto max-w-3xl py-10 pb-20">
      <div className="mb-10 text-center">
        <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full border border-[#262626] bg-[#0A0A0A]">
          <ClipboardCheck className="h-6 w-6 text-white" />
        </div>
        <h1 className="text-[32px] font-bold tracking-tight text-white">
          Review & Submit
        </h1>
        <p className="mt-3 text-[15px] text-[#A4A4A4]">
          Accept the final terms of service and submit your details for verification.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        <div className="rounded-[12px] border border-[#262626] bg-[#0A0A0A] p-6 shadow-xl sm:p-8">
          <label className="flex items-start gap-3 cursor-pointer group">
            <div className="relative flex items-center justify-center mt-0.5 shrink-0">
              <input 
                type="checkbox" 
                className="peer sr-only"
                checked={termsAccepted}
                onChange={(e) => setTermsAccepted(e.target.checked)}
                required
              />
              <div className="w-5 h-5 border-2 border-[#5E5E5E] rounded-[4px] bg-[#0A0A0A] peer-checked:bg-white peer-checked:border-white transition-colors"></div>
              <CheckCircle2 className="absolute w-3.5 h-3.5 text-black opacity-0 peer-checked:opacity-100 transition-opacity" strokeWidth={3} />
            </div>
            <span className="text-[14px] leading-[1.5] text-[#A4A4A4] group-hover:text-[#C8C8C8] transition-colors">
              By checking this box, I accept the <a href="#" className="text-white hover:underline">Terms of Service</a> and <a href="#" className="text-white hover:underline">Privacy Policy</a>, and I confirm that I am authorized to provide this information. I also agree to the <a href="https://moov.io/legal/platform-agreement/" target="_blank" rel="noopener noreferrer" className="text-white hover:underline">Moov Platform Agreement</a>.
            </span>
          </label>
        </div>

        <div className="flex items-center justify-between pt-4">
          <button
            type="button"
            onClick={() => router.back()}
            className="flex h-12 items-center justify-center gap-2 rounded-[8px] border border-[#262626] bg-black px-6 text-[15px] font-semibold text-[#8C8C8C] transition-colors hover:text-white disabled:opacity-50"
            disabled={isSubmitting}
          >
            <ArrowLeft className="h-5 w-5" />
            Back
          </button>

          <button
            type="submit"
            disabled={!termsAccepted || isSubmitting}
            className="flex h-12 items-center justify-center gap-2 rounded-[8px] bg-white px-8 text-[15px] font-semibold text-black transition-colors hover:bg-neutral-200 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? (
              <span className="flex items-center gap-2">
                <svg className="animate-spin h-5 w-5 text-black" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                Submitting...
              </span>
            ) : (
              <>
                Complete Setup
                <ArrowRight className="h-5 w-5" strokeWidth={2.5} />
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
