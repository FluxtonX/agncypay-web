"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Building2, UserRound, ArrowRight } from "lucide-react";
import { useApp } from "../../../context/AppContext";
import { useAuth } from "../../../context/AuthContext";
import { normalizeWorkspaceType } from "../../../types/workspace";
import { Input } from "../../../components/ui/Input";
import { Select } from "../../../components/ui/Select";

export default function ProfilePage() {
  const router = useRouter();
  const { state, updateBusinessSetup } = useApp();
  const { userProfile } = useAuth();
  
  // Use userProfile first (which is populated immediately on signup/login via AuthContext)
  // Fallback to state.user if needed
  const rawAccountType = userProfile?.accountType || state.user?.accountType || "brand";
  const workspaceType = normalizeWorkspaceType(rawAccountType as any);
  const isIndividual = workspaceType === "talent_agency" || workspaceType === "talent_independent";

  const [formData, setFormData] = useState({
    ...state.businessSetup
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateBusinessSetup(formData);
    
    // If business, go to representatives. If individual, skip to review.
    if (isIndividual) {
      router.push("/verification/review");
    } else {
      router.push("/verification/representatives");
    }
  };

  return (
    <div className="mx-auto max-w-3xl py-10 pb-20">
      <div className="mb-10 text-center">
        <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full border border-[#262626] bg-[#0A0A0A]">
          {isIndividual ? <UserRound className="h-6 w-6 text-white" /> : <Building2 className="h-6 w-6 text-white" />}
        </div>
        <h1 className="text-[32px] font-bold tracking-tight text-white">
          {isIndividual ? "Personal Identity Profile" : "Business Profile"}
        </h1>
        <p className="mt-3 text-[15px] text-[#A4A4A4]">
          {isIndividual 
            ? "Provide your legal identity details for compliance and payment processing." 
            : "Provide your company's legal details for compliance and business verification."}
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        <div className="rounded-[12px] border border-[#262626] bg-[#0A0A0A] p-6 shadow-xl sm:p-8">
          <h2 className="mb-6 text-[18px] font-semibold text-white">
            {isIndividual ? "Personal Information" : "Company Information"}
          </h2>
          
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
            {isIndividual ? (
              <>
                <Input id="firstName" name="firstName" label="Legal First Name" value={formData.firstName} onChange={handleChange} required />
                <Input id="lastName" name="lastName" label="Legal Last Name" value={formData.lastName} onChange={handleChange} required />
                <Input id="dob" name="dob" label="Date of Birth (MM/DD/YYYY)" value={formData.dob} onChange={handleChange} placeholder="MM/DD/YYYY" required />
                <Input id="ssnLast4" name="ssnLast4" label="SSN (Last 4 Digits)" value={formData.ssnLast4} onChange={handleChange} placeholder="XXXX" maxLength={4} required />
              </>
            ) : (
              <>
                <Input id="legalName" name="legalName" label="Legal Business Name" value={formData.legalName} onChange={handleChange} required />
                <Input id="brandName" name="brandName" label="Doing Business As (DBA)" value={formData.brandName} onChange={handleChange} />
                <Select id="businessType" name="businessType" label="Business Type" value={formData.businessType} onChange={handleChange} options={[
                  { value: "llc", label: "LLC" },
                  { value: "privateCorporation", label: "Private Corporation" },
                  { value: "soleProprietorship", label: "Sole Proprietorship" },
                ]} required />
                <Input id="taxId" name="taxId" label="Employer Identification Number (EIN)" value={formData.taxId} onChange={handleChange} required />
              </>
            )}
            <Input id="email" name="email" label="Contact Email" type="email" value={formData.email} onChange={handleChange} required />
            <Input id="phone" name="phone" label="Contact Phone" type="tel" value={formData.phone} onChange={handleChange} required />
            {!isIndividual && (
              <Input id="website" name="website" label="Official Website" value={formData.website} onChange={handleChange} required />
            )}
          </div>
        </div>

        <div className="rounded-[12px] border border-[#262626] bg-[#0A0A0A] p-6 shadow-xl sm:p-8">
          <h2 className="mb-6 text-[18px] font-semibold text-white">
            {isIndividual ? "Home Address" : "Registered Business Address"}
          </h2>
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <Input id="addressLine1" name="addressLine1" label="Address Line 1" value={formData.addressLine1} onChange={handleChange} required />
            </div>
            <div className="sm:col-span-2">
              <Input id="addressLine2" name="addressLine2" label="Address Line 2 (Optional)" value={formData.addressLine2 || ""} onChange={handleChange} />
            </div>
            <Input id="city" name="city" label="City" value={formData.city} onChange={handleChange} required />
            <Input id="stateOrProvince" name="stateOrProvince" label="State / Province" value={formData.stateOrProvince} onChange={handleChange} required />
            <Input id="postalCode" name="postalCode" label="ZIP / Postal Code" value={formData.postalCode} onChange={handleChange} required />
            <Select id="country" name="country" label="Country" value={formData.country} onChange={handleChange} options={[
              { value: "US", label: "United States" }
            ]} required />
          </div>
        </div>

        <div className="flex justify-end pt-4">
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
