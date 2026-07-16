"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Users, ArrowRight, ArrowLeft } from "lucide-react";
import { useApp } from "../../../context/AppContext";
import { Input } from "../../../components/ui/Input";
import { Select } from "../../../components/ui/Select";

export default function RepresentativesPage() {
  const router = useRouter();
  const { state, updateRepresentative } = useApp();

  const [formData, setFormData] = useState({
    firstName: state.representative.fullName?.split(" ")[0] || "",
    lastName: state.representative.fullName?.split(" ").slice(1).join(" ") || "",
    jobTitle: state.representative.jobTitle || "Owner",
    dob: state.representative.dob || "",
    email: state.representative.email || "",
    phone: state.representative.phone || "",
    addressLine1: state.representative.address || "",
    addressLine2: "",
    city: "",
    stateOrProvince: "",
    postalCode: "",
    country: "US",
    ssnLast4: "",
    ownershipPercentage: 100
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateRepresentative({
      fullName: `${formData.firstName} ${formData.lastName}`,
      jobTitle: formData.jobTitle,
      dob: formData.dob,
      email: formData.email,
      phone: formData.phone,
      address: `${formData.addressLine1}, ${formData.city}, ${formData.stateOrProvince} ${formData.postalCode}`
    });
    router.push("/verification/review");
  };

  return (
    <div className="mx-auto max-w-3xl py-10 pb-20">
      <div className="mb-10 text-center">
        <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full border border-[#262626] bg-[#0A0A0A]">
          <Users className="h-6 w-6 text-white" />
        </div>
        <h1 className="text-[32px] font-bold tracking-tight text-white">
          Business Representative
        </h1>
        <p className="mt-3 text-[15px] text-[#A4A4A4]">
          Provide details for the primary business owner or controlling officer.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        <div className="rounded-[12px] border border-[#262626] bg-[#0A0A0A] p-6 shadow-xl sm:p-8">
          <h2 className="mb-6 text-[18px] font-semibold text-white">
            Representative Information
          </h2>
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
            <Input id="firstName" name="firstName" label="Legal First Name" value={formData.firstName} onChange={handleChange} required />
            <Input id="lastName" name="lastName" label="Legal Last Name" value={formData.lastName} onChange={handleChange} required />
            <Input id="jobTitle" name="jobTitle" label="Job Title / Role" value={formData.jobTitle} onChange={handleChange} required />
            <Input id="ownershipPercentage" name="ownershipPercentage" label="Ownership Percentage (%)" type="number" min="0" max="100" value={formData.ownershipPercentage.toString()} onChange={handleChange} required />
            <Input id="dob" name="dob" label="Date of Birth (MM/DD/YYYY)" value={formData.dob} onChange={handleChange} placeholder="MM/DD/YYYY" required />
            <Input id="ssnLast4" name="ssnLast4" label="SSN (Last 4 Digits)" value={formData.ssnLast4} onChange={handleChange} placeholder="XXXX" maxLength={4} required />
            <Input id="email" name="email" label="Contact Email" type="email" value={formData.email} onChange={handleChange} required />
            <Input id="phone" name="phone" label="Contact Phone" type="tel" value={formData.phone} onChange={handleChange} required />
          </div>
        </div>

        <div className="rounded-[12px] border border-[#262626] bg-[#0A0A0A] p-6 shadow-xl sm:p-8">
          <h2 className="mb-6 text-[18px] font-semibold text-white">
            Home Address
          </h2>
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <Input id="addressLine1" name="addressLine1" label="Address Line 1" value={formData.addressLine1} onChange={handleChange} required />
            </div>
            <div className="sm:col-span-2">
              <Input id="addressLine2" name="addressLine2" label="Address Line 2 (Optional)" value={formData.addressLine2} onChange={handleChange} />
            </div>
            <Input id="city" name="city" label="City" value={formData.city} onChange={handleChange} required />
            <Input id="stateOrProvince" name="stateOrProvince" label="State / Province" value={formData.stateOrProvince} onChange={handleChange} required />
            <Input id="postalCode" name="postalCode" label="ZIP / Postal Code" value={formData.postalCode} onChange={handleChange} required />
            <Select id="country" name="country" label="Country" value={formData.country} onChange={handleChange} options={[
              { value: "US", label: "United States" }
            ]} required />
          </div>
        </div>

        <div className="flex items-center justify-between pt-4">
          <button
            type="button"
            onClick={() => router.back()}
            className="flex h-12 items-center justify-center gap-2 rounded-[8px] border border-[#262626] bg-black px-6 text-[15px] font-semibold text-[#8C8C8C] transition-colors hover:text-white"
          >
            <ArrowLeft className="h-5 w-5" />
            Back
          </button>
          
          <button
            type="submit"
            className="flex h-12 items-center justify-center gap-2 rounded-[8px] bg-white px-8 text-[15px] font-semibold text-black transition-colors hover:bg-neutral-200"
          >
            Continue to Next Step
            <ArrowRight className="h-5 w-5" strokeWidth={2.5} />
          </button>
        </div>
      </form>
    </div>
  );
}
