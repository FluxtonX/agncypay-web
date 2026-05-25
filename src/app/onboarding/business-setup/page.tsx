"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Building2, ArrowRight, ShieldCheck } from "lucide-react";
import { useApp } from "../../../context/AppContext";
import { Card } from "../../../components/ui/Card";
import { Button } from "../../../components/ui/Button";
import { Input } from "../../../components/ui/Input";
import { Select } from "../../../components/ui/Select";
import { WorkspaceType, normalizeWorkspaceType } from "../../../types/workspace";

const onboardingCopy: Record<WorkspaceType, {
  eyebrow: string;
  title: string;
  description: string;
  alertTitle: string;
  alertBody: string;
  legalNameLabel: string;
  brandNameLabel: string;
  startRoute: string;
  checklist: string[];
}> = {
  brand: {
    eyebrow: "Brand Workspace Setup",
    title: "Welcome to AgncyPay Brand Setup",
    description: "Verify legal credentials to approve and settle agency invoices.",
    alertTitle: "Brand KYB Draft",
    alertBody: "Review your brand entity details before starting the step-by-step compliance checklist.",
    legalNameLabel: "Legal Entity Name",
    brandNameLabel: "Trading / Brand Name",
    startRoute: "/verification/business-info",
    checklist: [
      "KYB verification",
      "Connect bank account",
      "Add finance/team users",
      "Configure approval permissions",
      "Connect Mainboard/ERP if needed",
    ],
  },
  agency: {
    eyebrow: "Agency Workspace Setup",
    title: "Welcome to Agency Setup",
    description: "Verify your agency, connect payout banking, and prepare talent payout operations.",
    alertTitle: "Agency KYB Draft",
    alertBody: "Confirm agency registry details before configuring team access, talent, and split workflows.",
    legalNameLabel: "Legal Agency Name",
    brandNameLabel: "Agency Display Name",
    startRoute: "/verification/business-info",
    checklist: [
      "KYB verification",
      "Connect payout bank",
      "Invite team",
      "Add/manage talent",
      "Configure split structures",
      "Connect CRM/Mainboard if needed",
    ],
  },
  talent_independent: {
    eyebrow: "Talent Workspace Setup",
    title: "Welcome to Talent Setup",
    description: "Verify your identity and connect payout details for direct payments.",
    alertTitle: "Talent KYC Draft",
    alertBody: "Confirm your profile details before identity verification and payout setup.",
    legalNameLabel: "Legal Name",
    brandNameLabel: "Public / Professional Name",
    startRoute: "/verification/representative",
    checklist: [
      "Identity verification",
      "Payout/bank connection",
      "Tax/payment info",
      "Optional invoice setup",
    ],
  },
  talent_agency: {
    eyebrow: "Agency Talent Setup",
    title: "Welcome to Agency Talent Setup",
    description: "Verify your identity and connect to your agency payout relationship.",
    alertTitle: "Agency Talent KYC Draft",
    alertBody: "Confirm your profile details before KYC, tax/payment info, and agency relationship confirmation.",
    legalNameLabel: "Legal Name",
    brandNameLabel: "Talent Profile Name",
    startRoute: "/verification/representative",
    checklist: [
      "Identity verification",
      "Payout/bank connection",
      "Tax/payment info",
      "Agency relationship confirmation",
    ],
  },
  mother_agency: {
    eyebrow: "Mother Agency Setup",
    title: "Welcome to Enterprise Setup",
    description: "Verify the parent organization and prepare hierarchy-level treasury operations.",
    alertTitle: "Enterprise KYB Draft",
    alertBody: "Confirm enterprise details before child agency hierarchy, treasury, and permissions setup.",
    legalNameLabel: "Legal Organization Name",
    brandNameLabel: "Operating Name",
    startRoute: "/verification/business-info",
    checklist: [
      "Enterprise KYB",
      "Advanced permissions",
      "Treasury setup",
      "Multi-team access",
      "Child agency hierarchy",
    ],
  },
};

export default function BusinessSetupPage() {
  const router = useRouter();
  const { state, updateBusinessSetup } = useApp();
  const workspaceType = state.user ? normalizeWorkspaceType(state.user.accountType) : "brand";
  const activeWorkspace = state.workspaces.find(
    (workspace) => workspace.id === state.activeWorkspaceId
  );
  const copy = onboardingCopy[workspaceType];
  
  // Set up local state prefilled with Adidas AG details
  const [formData, setFormData] = useState({
    legalName: state.businessSetup.legalName || activeWorkspace?.name || "Adidas AG",
    brandName: state.businessSetup.brandName || activeWorkspace?.name || "Adidas",
    registrationNumber: state.businessSetup.registrationNumber || "HRB 3838",
    taxId: state.businessSetup.taxId || "DE 132492835",
    country: state.businessSetup.country || "Germany",
    businessType: state.businessSetup.businessType || "Public Company",
    website: state.businessSetup.website || "https://www.adidas.com",
    email: state.businessSetup.email || "compliance@adidas.com",
    phone: state.businessSetup.phone || "+49 9132 84-0",
    industry: state.businessSetup.industry || "Sportswear & Footwear",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleStartOnboarding = () => {
    updateBusinessSetup(formData);
    router.push(copy.startRoute);
  };

  return (
    <div className="min-h-screen bg-[#0A0A0A] text-[#F8FAFC] flex items-center justify-center p-6 md:p-12 relative overflow-hidden">
      <div className="w-full max-w-3xl space-y-6 z-10">
        {/* Header Title */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <div className="flex items-center gap-2">
              <img src="/agncypayLogo.png" alt="AgncyPay" className="h-14 w-auto object-contain" />
              <span className="ml-1 text-[10px] font-bold uppercase tracking-wider text-[#9b9b9b]">{copy.eyebrow}</span>
            </div>
            <h1 className="text-2xl font-black text-white tracking-tight mt-2">
              {copy.title}
            </h1>
            <p className="mt-1 text-xs text-[#8f8f8f]">
              {copy.description}
            </p>
          </div>
          
          <div className="flex shrink-0 items-center gap-1.5 rounded-lg border border-[#555] bg-black px-3 py-1.5 text-xs font-semibold text-white">
            <ShieldCheck className="h-4 w-4" />
            <span>Secure Verification Draft</span>
          </div>
        </div>

        {/* Setup card */}
        <Card className="border-[#1F1F1F] p-6 space-y-6 bg-[#0D0D0D]">
          <div className="flex items-start gap-3 rounded-xl border border-[#555] bg-black p-4">
            <Building2 className="mt-0.5 h-5 w-5 shrink-0 text-white" />
            <div className="text-xs space-y-1">
              <h4 className="font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
                <span>{copy.alertTitle}: {formData.brandName || activeWorkspace?.name || "Workspace"}</span>
                <span className="rounded border border-[#555] bg-[#111] px-1.5 py-0.2 text-[10px] font-bold text-white">
                  Target Entity
                </span>
              </h4>
              <p className="leading-relaxed text-[#8f8f8f]">
                {copy.alertBody} Press <span className="font-semibold text-white">Start Verification</span> to launch the role-specific compliance checklist.
              </p>
            </div>
          </div>

          {/* Form details preview */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-left">
            <Input
              id="legalName"
              name="legalName"
              label={copy.legalNameLabel}
              value={formData.legalName}
              onChange={handleChange}
              placeholder="e.g. Adidas AG"
            />
            <Input
              id="brandName"
              name="brandName"
              label={copy.brandNameLabel}
              value={formData.brandName}
              onChange={handleChange}
              placeholder="e.g. Adidas"
            />
            <Input
              id="registrationNumber"
              name="registrationNumber"
              label="Commercial Registry ID"
              value={formData.registrationNumber}
              onChange={handleChange}
              placeholder="e.g. HRB 3838"
            />
            <Input
              id="taxId"
              name="taxId"
              label="Tax ID / VAT / EIN"
              value={formData.taxId}
              onChange={handleChange}
              placeholder="e.g. DE 132492835"
            />
            <Select
              id="country"
              name="country"
              label="Country"
              value={formData.country}
              onChange={handleChange}
              options={[
                { value: "Germany", label: "Germany" },
                { value: "United States", label: "United States" },
                { value: "United Kingdom", label: "United Kingdom" },
              ]}
            />
            <Input
              id="website"
              name="website"
              label="Official Domain Website"
              value={formData.website}
              onChange={handleChange}
              placeholder="https://www.adidas.com"
            />
          </div>

          <div className="rounded-[8px] border border-[#555] bg-black px-5 py-5">
            <h2 className="text-[18px] font-semibold text-white">
              Onboarding Checklist
            </h2>
            <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
              {copy.checklist.map((item, index) => (
                <div key={item} className="flex items-center gap-3 rounded-[7px] border border-[#303030] bg-[#050505] px-4 py-3">
                  <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full border border-[#555] text-[12px] font-semibold text-white">
                    {index + 1}
                  </span>
                  <span className="text-[14px] font-semibold leading-5 text-[#d7d7d7]">
                    {item}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-between items-center border-t border-[#1F1F1F] pt-5">
            <Link
              href="/auth/login"
              className="cursor-pointer text-xs text-[#8f8f8f] transition-colors hover:text-white"
            >
              Sign out of session
            </Link>
            
            <Button
              variant="primary"
              className="w-48"
              rightIcon={<ArrowRight className="h-4 w-4" />}
              onClick={handleStartOnboarding}
            >
              Start Verification
            </Button>
          </div>
        </Card>
      </div>
    </div>
  );
}
