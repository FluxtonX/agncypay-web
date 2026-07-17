"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { useApp } from "../../context/AppContext";

export function RepresentativeForm() {
  const router = useRouter();
  const { state, updateRepresentative } = useApp();
  const [firstName, lastName] = (state.representative.fullName || "")
    .split(" ")
    .filter(Boolean);
  const hasSavedRepresentative = Boolean(state.representative.fullName);

  const [formData, setFormData] = useState({
    firstName: hasSavedRepresentative ? firstName || "" : "",
    lastName: hasSavedRepresentative ? lastName || "" : "",
    jobTitle: hasSavedRepresentative ? state.representative.jobTitle || "" : "",
    email: hasSavedRepresentative ? state.representative.email || "" : "",
    phone: hasSavedRepresentative ? state.representative.phone || "" : "",
    dob: hasSavedRepresentative ? state.representative.dob || "" : "",
    ssnLast4: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const fullName = [formData.firstName, formData.lastName].filter(Boolean).join(" ");
    updateRepresentative({
      fullName,
      jobTitle: formData.jobTitle,
      email: formData.email,
      phone: formData.phone,
      dob: formData.dob,
    });
    router.push("/verification/authorization");
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="mx-auto w-full max-w-[858px] pb-12 pt-8 sm:pb-14 sm:pt-10 lg:pb-16 lg:pt-12 xl:pt-[52px]"
    >
      <div className="mb-8 flex flex-col items-start justify-between gap-5 sm:mb-10 sm:flex-row sm:gap-8">
        <div>
          <h1 className="text-[28px] font-bold leading-[1.08] tracking-normal text-white sm:text-[32px] lg:text-[34px]">
            Authorized Representative
          </h1>
          <p className="mt-3 text-[17px] font-normal leading-snug text-[#A0A0A0] sm:mt-[15px] sm:text-[20px] lg:text-[21px]">
            Designate an authorized representative for your account
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
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 sm:gap-[17px]">
            <label className="block">
              <span className="mb-[9px] block text-[16px] font-semibold leading-none tracking-normal text-[#F4F4F4]">
                First Name
              </span>
              <input
                name="firstName"
                value={formData.firstName}
                onChange={handleChange}
                placeholder="Abc"
                className="h-11 w-full rounded-[6px] border border-[#727272] bg-[#0A0A0A] px-[14px] text-[16px] font-normal text-white outline-none transition-colors placeholder:text-[#A8A8A8] focus:border-white sm:text-[18px]"
              />
            </label>

            <label className="block">
              <span className="mb-[9px] block text-[16px] font-semibold leading-none tracking-normal text-[#F4F4F4]">
                Last Name
              </span>
              <input
                name="lastName"
                value={formData.lastName}
                onChange={handleChange}
                placeholder="Xyz"
                className="h-11 w-full rounded-[6px] border border-[#727272] bg-[#0A0A0A] px-[14px] text-[16px] font-normal text-white outline-none transition-colors placeholder:text-[#A8A8A8] focus:border-white sm:text-[18px]"
              />
            </label>
          </div>

          <label className="block">
            <span className="mb-[9px] block text-[16px] font-semibold leading-none tracking-normal text-[#F4F4F4]">
              Job Title
            </span>
            <input
              name="jobTitle"
              value={formData.jobTitle}
              onChange={handleChange}
              placeholder="Chief Financial Officer"
              className="h-11 w-full rounded-[6px] border border-[#727272] bg-[#0A0A0A] px-[14px] text-[16px] font-normal text-white outline-none transition-colors placeholder:text-[#A8A8A8] focus:border-white sm:text-[18px]"
            />
          </label>

          <label className="block">
            <span className="mb-[9px] block text-[16px] font-semibold leading-none tracking-normal text-[#F4F4F4]">
              Email Address
            </span>
            <input
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="abc.xyz@acme.com"
              className="h-11 w-full rounded-[6px] border border-[#727272] bg-[#0A0A0A] px-[14px] text-[16px] font-normal text-white outline-none transition-colors placeholder:text-[#A8A8A8] focus:border-white sm:text-[18px]"
            />
          </label>

          <label className="block">
            <span className="mb-[9px] block text-[16px] font-semibold leading-none tracking-normal text-[#F4F4F4]">
              Phone Number
            </span>
            <input
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              placeholder="+1 (555) 123-4567"
              className="h-11 w-full rounded-[6px] border border-[#727272] bg-[#0A0A0A] px-[14px] text-[16px] font-normal text-white outline-none transition-colors placeholder:text-[#A8A8A8] focus:border-white sm:text-[18px]"
            />
          </label>

          <label className="block">
            <span className="mb-[9px] block text-[16px] font-semibold leading-none tracking-normal text-[#F4F4F4]">
              Date of Birth
            </span>
            <input
              name="dob"
              value={formData.dob}
              onChange={handleChange}
              placeholder="06/12/1984"
              className="h-11 w-full rounded-[6px] border border-[#727272] bg-[#0A0A0A] px-[14px] text-[16px] font-normal text-white outline-none transition-colors placeholder:text-[#A8A8A8] focus:border-white sm:text-[18px]"
            />
          </label>

          <label className="block">
            <span className="mb-[9px] block text-[16px] font-semibold leading-none tracking-normal text-[#F4F4F4]">
              SSN (Last 4 digits)
            </span>
            <input
              name="ssnLast4"
              value={formData.ssnLast4}
              onChange={handleChange}
              placeholder="XXXX"
              className="h-11 w-full rounded-[6px] border border-[#727272] bg-[#0A0A0A] px-[14px] text-[16px] font-normal text-white outline-none transition-colors placeholder:text-[#A8A8A8] focus:border-white sm:text-[18px]"
            />
          </label>
        </div>
      </div>

      <div className="mt-8 flex items-center justify-between gap-4 sm:mt-10">
        <button
          type="button"
          onClick={() => router.push("/verification/business-details")}
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
