"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Building2, ArrowRight, ShieldCheck, HelpCircle } from "lucide-react";
import { useApp } from "../../../context/AppContext";
import { Card } from "../../../components/ui/Card";
import { Button } from "../../../components/ui/Button";
import { Input } from "../../../components/ui/Input";
import { Select } from "../../../components/ui/Select";

export default function BusinessSetupPage() {
  const router = useRouter();
  const { state, updateBusinessSetup } = useApp();
  
  // Set up local state prefilled with Adidas AG details
  const [formData, setFormData] = useState({
    legalName: state.businessSetup.legalName || "Adidas AG",
    brandName: state.businessSetup.brandName || "Adidas",
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
    // Route to first official stepper step
    router.push("/verification/business-info");
  };

  return (
    <div className="min-h-screen bg-[#0A0A0A] text-[#F8FAFC] flex items-center justify-center p-6 md:p-12 relative overflow-hidden">
      <div className="w-full max-w-3xl space-y-6 z-10">
        {/* Header Title */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <div className="flex items-center gap-2">
              <img src="/agncypayLogo.png" alt="AgncyPay" className="h-14 w-auto object-contain" />
              <span className="text-[10px] font-bold text-[#10B981] uppercase tracking-wider ml-1">Workspace Setup</span>
            </div>
            <h1 className="text-2xl font-black text-white tracking-tight mt-2">
              Welcome to AgncyPay Corporate Setup
            </h1>
            <p className="text-xs text-[#6B7280] mt-1">
              Verify legal credentials to settle invoices with AgncyPay.
            </p>
          </div>
          
          <div className="flex items-center gap-1.5 text-xs text-[#10B981] font-semibold bg-[#10B981]/5 border border-[#10B981]/15 rounded-lg px-3 py-1.5 shrink-0">
            <ShieldCheck className="h-4 w-4" />
            <span>Secure Verification Draft</span>
          </div>
        </div>

        {/* Setup card */}
        <Card className="border-[#1F1F1F] p-6 space-y-6 bg-[#0D0D0D]">
          <div className="flex items-start gap-3 bg-[#10B981]/5 border border-[#10B981]/15 rounded-xl p-4">
            <Building2 className="h-5 w-5 text-[#10B981] shrink-0 mt-0.5" />
            <div className="text-xs space-y-1">
              <h4 className="font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
                <span>Active Brand: Adidas AG</span>
                <span className="text-[10px] bg-[#10B981]/10 border border-[#10B981]/25 px-1.5 py-0.2 rounded text-[#10B981] font-bold">
                  Target Entity
                </span>
              </h4>
              <p className="text-[#6B7280] leading-relaxed">
                For convenience, we prefilled standard Adidas compliance registry values. You can review them below or modify details. Press <span className="font-semibold text-white">Start Verification</span> to launch the step-by-step compliance checklist.
              </p>
            </div>
          </div>

          {/* Form details preview */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-left">
            <Input
              id="legalName"
              name="legalName"
              label="Legal Entity Name"
              value={formData.legalName}
              onChange={handleChange}
              placeholder="e.g. Adidas AG"
            />
            <Input
              id="brandName"
              name="brandName"
              label="Trading / Brand Name"
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

          {/* Actions */}
          <div className="flex justify-between items-center border-t border-[#1F1F1F] pt-5">
            <Link
              href="/auth/login"
              className="text-xs text-[#6B7280] hover:text-white transition-colors cursor-pointer"
            >
              Sign out of session
            </Link>
            
            <Button
              variant="primary"
              className="w-48 shadow-[0_0_20px_rgba(16,185,129,0.15)]"
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
