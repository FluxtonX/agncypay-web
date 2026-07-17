"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, ArrowRight } from "lucide-react";

const ROLES = ["Admin", "Approver", "Finance", "Viewer"];

interface TeamMember {
  email: string;
  fullName: string;
  role: string;
}

export function BrandVerificationForm() {
  const router = useRouter();
  const [members, setMembers] = useState<TeamMember[]>([
    { email: "", fullName: "", role: "" },
    { email: "", fullName: "", role: "" },
  ]);

  const updateMember = (index: number, field: keyof TeamMember, value: string) => {
    setMembers((prev) =>
      prev.map((member, memberIndex) =>
        memberIndex === index ? { ...member, [field]: value } : member
      )
    );
  };

  const addMember = () => {
    setMembers((prev) => [...prev, { email: "", fullName: "", role: "" }]);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    router.push("/verification/payment-preferences");
  };

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
            Team Setup
          </h1>
          <p className="mt-3 text-[17px] font-normal leading-snug text-[#A0A0A0] sm:mt-[15px] sm:text-[20px] lg:text-[21px]">
            Invite team members and set permissions
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

      <section className="rounded-[8px] border border-[#565656] bg-black px-5 py-7 shadow-[0_18px_60px_rgba(0,0,0,0.28)] sm:px-8 sm:py-[48px] lg:px-10">
        <h2 className="text-[25px] font-bold leading-tight text-white sm:text-[30px]">
          Invite Team Members
        </h2>
        <p className="mt-[28px] text-[15px] font-normal leading-snug text-[#A0A0A0] sm:text-[17px]">
          Add colleagues who will help manage payments and approvals
        </p>

        <div className="mt-[29px] space-y-5">
          {members.map((member, index) => (
            <div
              key={index}
              className="grid grid-cols-1 gap-5 md:grid-cols-[1fr_1fr_1fr] md:gap-[19px]"
            >
              <input
                value={member.email}
                onChange={(e) => updateMember(index, "email", e.target.value)}
                placeholder="Email address"
                className={inputClass}
              />
              <input
                value={member.fullName}
                onChange={(e) => updateMember(index, "fullName", e.target.value)}
                placeholder="Full name"
                className={inputClass}
              />
              <div className="relative">
                <select
                  value={member.role}
                  onChange={(e) => updateMember(index, "role", e.target.value)}
                  className={selectClass}
                >
                  <option value="">Role</option>
                  {ROLES.map((role) => (
                    <option key={role} value={role} className="bg-black text-white">
                      {role}
                    </option>
                  ))}
                </select>
                <SelectChevron />
              </div>
            </div>
          ))}
        </div>

        <button
          type="button"
          onClick={addMember}
          className="mt-[30px] text-[17px] font-semibold text-[#9A9A9A] transition-colors hover:text-white"
        >
          + Add Another Member
        </button>

        <div className="mt-[35px] border-t border-[#6A6A6A]" />

        <p className="mt-[31px] text-[14px] font-normal text-[#737373]">
          You can always add more team members later from Settings
        </p>
      </section>

      <div className="mt-8 flex items-center justify-between gap-4 sm:mt-10">
        <button
          type="button"
          onClick={() => router.push("/verification/bank-details")}
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
