"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Building2, Globe, Mail, Phone, MapPin } from "lucide-react";
import { useApp } from "../../context/AppContext";
import { Input } from "../ui/Input";
import { Select } from "../ui/Select";
import { Button } from "../ui/Button";
import { Card } from "../ui/Card";

export function BusinessInfoForm() {
  const router = useRouter();
  const { state, updateBusinessSetup } = useApp();
  const [formData, setFormData] = useState({
    legalName: state.businessSetup.legalName || "",
    brandName: state.businessSetup.brandName || "",
    registrationNumber: state.businessSetup.registrationNumber || "",
    taxId: state.businessSetup.taxId || "",
    country: state.businessSetup.country || "Germany",
    businessType: state.businessSetup.businessType || "Public Company",
    website: state.businessSetup.website || "",
    email: state.businessSetup.email || "",
    phone: state.businessSetup.phone || "",
    industry: state.businessSetup.industry || "Sportswear / Apparel",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => {
        const copy = { ...prev };
        delete copy[name];
        return copy;
      });
    }
  };

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.legalName) newErrors.legalName = "Legal Business Name is required";
    if (!formData.brandName) newErrors.brandName = "Trading / Brand Name is required";
    if (!formData.registrationNumber) newErrors.registrationNumber = "Registration number is required";
    if (!formData.website) {
      newErrors.website = "Website is required";
    } else if (!/^https?:\/\/[^\s$.?#].[^\s]*$/i.test(formData.website)) {
      newErrors.website = "Invalid URL format (must start with http:// or https://)";
    }
    if (!formData.email) {
      newErrors.email = "Business email is required";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Invalid email format";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validate()) {
      updateBusinessSetup(formData);
      router.push("/verification/representative");
    }
  };

  const handleSaveDraft = () => {
    updateBusinessSetup(formData);
    // Simple draft save feedback or alert
    alert("Draft saved successfully!");
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-1">
        <h1 className="text-xl font-bold text-white flex items-center gap-2">
          <Building2 className="h-5 w-5 text-[#10B981]" />
          Business Information
        </h1>
        <p className="text-xs text-[#6B7280] leading-relaxed">
          Enter the exact legal business details shown on your official registration documents.
        </p>
      </div>

      <Card className="space-y-5 border-[#1F1F1F] bg-[#0D0D0D]">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input
            id="legalName"
            name="legalName"
            label="Legal Business Name"
            value={formData.legalName}
            onChange={handleChange}
            error={errors.legalName}
            placeholder="e.g. Adidas AG"
          />
          <Input
            id="brandName"
            name="brandName"
            label="Trading / Brand Name"
            value={formData.brandName}
            onChange={handleChange}
            error={errors.brandName}
            placeholder="e.g. Adidas"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input
            id="registrationNumber"
            name="registrationNumber"
            label="Registration Number / CR"
            value={formData.registrationNumber}
            onChange={handleChange}
            error={errors.registrationNumber}
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
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Select
            id="country"
            name="country"
            label="Country of Registration"
            value={formData.country}
            onChange={handleChange}
            options={[
              { value: "Germany", label: "Germany" },
              { value: "United States", label: "United States" },
              { value: "United Kingdom", label: "United Kingdom" },
              { value: "France", label: "France" },
              { value: "Japan", label: "Japan" },
            ]}
          />
          <Select
            id="businessType"
            name="businessType"
            label="Legal Structure"
            value={formData.businessType}
            onChange={handleChange}
            options={[
              { value: "Private Company", label: "Private Limited Company (Ltd / GmbH)" },
              { value: "Public Company", label: "Public Limited Company (PLC / AG)" },
              { value: "Partnership", label: "Partnership" },
              { value: "Agency", label: "Creative / Development Agency" },
              { value: "Sole Proprietor", label: "Sole Proprietorship" },
            ]}
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input
            id="industry"
            name="industry"
            label="Industry Category"
            value={formData.industry}
            onChange={handleChange}
            placeholder="e.g. Sportswear & Fashion"
          />
          <Input
            id="website"
            name="website"
            label="Company Website"
            value={formData.website}
            onChange={handleChange}
            error={errors.website}
            leftIcon={<Globe className="h-4 w-4" />}
            placeholder="https://example.com"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input
            id="email"
            name="email"
            label="Corporate Compliance Email"
            value={formData.email}
            onChange={handleChange}
            error={errors.email}
            leftIcon={<Mail className="h-4 w-4" />}
            placeholder="compliance@brand.com"
          />
          <Input
            id="phone"
            name="phone"
            label="Business Contact Number"
            value={formData.phone}
            onChange={handleChange}
            leftIcon={<Phone className="h-4 w-4" />}
            placeholder="+49 9132 84-0"
          />
        </div>
      </Card>

      {/* Button panel */}
      <div className="flex justify-between items-center pt-2">
        <Button type="button" variant="ghost" onClick={handleSaveDraft}>
          Save Draft
        </Button>
        <div className="flex gap-3">
          <Button type="submit" variant="primary">
            Save & Continue
          </Button>
        </div>
      </div>
    </form>
  );
}
