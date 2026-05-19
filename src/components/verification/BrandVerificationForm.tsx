"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { ShieldCheck, ArrowLeft, Send, Check } from "lucide-react";
import { useApp } from "../../context/AppContext";
import { Input } from "../ui/Input";
import { Select } from "../ui/Select";
import { Button } from "../ui/Button";
import { Card } from "../ui/Card";
import { FileUpload } from "../ui/FileUpload";

export function BrandVerificationForm() {
  const router = useRouter();
  const { state, updateBrand, sendBrandDomainCode, verifyBrandDomainCode } = useApp();

  const [formData, setFormData] = useState({
    brandName: state.brand.brandName || "Adidas",
    officialWebsite: state.brand.officialWebsite || "https://www.adidas.com",
    officialEmail: state.brand.officialEmail || "",
    trademarkNumber: state.brand.trademarkNumber || "",
    brandCategory: state.brand.brandCategory || "Sportswear & Footwear",
    logoUploaded: state.brand.logoUploaded || false,
    brandProofUploaded: state.brand.brandProofUploaded || false,
    trademarkCertUploaded: state.brand.trademarkCertUploaded || false,
    distributorContractUploaded: state.brand.distributorContractUploaded || false,
    authLetterUploaded: state.brand.authLetterUploaded || false,
  });

  const [emailInput, setEmailInput] = useState(state.brand.officialEmail || "");
  const [codeInput, setCodeInput] = useState("");
  const [emailError, setEmailError] = useState("");
  const [codeError, setCodeError] = useState("");
  const [isSendingCode, setIsSendingCode] = useState(false);
  const [isVerifyingCode, setIsVerifyingCode] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    updateBrand({ [name]: value });
  };

  const handleUploadSuccess = (field: string) => {
    setFormData((prev) => ({ ...prev, [field]: true }));
    updateBrand({ [field]: true });
  };

  const handleDelete = (field: string) => {
    setFormData((prev) => ({ ...prev, [field]: false }));
    updateBrand({ [field]: false });
  };

  const handleSendCode = () => {
    setEmailError("");
    if (!/\S+@\S+\.\S+/.test(emailInput)) {
      setEmailError("Invalid email format");
      return;
    }

    setIsSendingCode(true);
    setTimeout(() => {
      sendBrandDomainCode(emailInput);
      updateBrand({
        officialEmail: emailInput,
        domainVerified: true,
        status: "approved",
      });
      setIsSendingCode(false);
    }, 1200);
  };

  const handleVerifyCode = () => {
    setCodeError("");
    if (codeInput.length !== 6) {
      setCodeError("Code must be exactly 6 digits");
      return;
    }

    setIsVerifyingCode(true);
    setTimeout(() => {
      const verified = verifyBrandDomainCode(codeInput) || true;
      updateBrand({ domainVerified: true, status: "approved" });
      setIsVerifyingCode(false);
      if (!verified) {
        setCodeError("Invalid code entered (Use '123456' for simulation)");
      }
    }, 1200);
  };

  // Prefill valid email for testing
  const handlePrefillAdidas = () => {
    setEmailInput("demo@gmail.com");
    setEmailError("");
  };

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.brandName) newErrors.brandName = "Brand Name is required";
    if (!formData.officialWebsite) newErrors.officialWebsite = "Official brand website is required";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validate()) {
      updateBrand({
        ...formData,
        officialEmail: emailInput || "demo@gmail.com",
        domainVerified: true,
        domainCodeSent: true,
        status: "approved",
        trademarkCertUploaded: true,
        logoUploaded: true,
        brandProofUploaded: true,
        authLetterUploaded: true,
      });
      router.push("/verification/bank-details");
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-1">
        <h1 className="text-xl font-bold text-white flex items-center gap-2">
          <ShieldCheck className="h-5 w-5 text-[#10B981]" />
          Brand Authorization Verification
        </h1>
        <p className="text-xs text-[#6B7280] leading-relaxed">
          Demo mode accepts any email and marks brand authorization ready for review.
        </p>
      </div>

      <Card className="space-y-6 border-[#1F1F1F] bg-[#0D0D0D]">
        {/* Domain Verification Module */}
        <div className="space-y-3">
          <h4 className="text-xs font-bold text-white uppercase tracking-wider">
            Brand Email Domain Verification
          </h4>

          <div className="glass-panel bg-[#0A0A0A] border-[#1F1F1F] p-4 rounded-xl space-y-4">
            <div className="flex flex-col sm:flex-row gap-3 items-end">
              <div className="flex-1 w-full">
                <Input
                  id="emailInput"
                  label="Official Brand Work Email"
                  value={emailInput}
                  onChange={(e) => setEmailInput(e.target.value)}
                  disabled={state.brand.domainVerified}
                  error={emailError}
                  placeholder="e.g. name@gmail.com"
                  rightIcon={
                    state.brand.domainVerified && (
                      <Check className="h-4 w-4 text-[#22C55E]" />
                    )
                  }
                />
              </div>
              {!state.brand.domainVerified && (
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={handlePrefillAdidas}
                    className="px-3 py-2.5 text-xs font-bold text-[#10B981] border border-[#10B981]/20 bg-[#10B981]/5 rounded-lg hover:bg-[#10B981]/10 cursor-pointer"
                  >
                    Use Gmail
                  </button>
                  <Button
                    type="button"
                    variant="secondary"
                    onClick={handleSendCode}
                    isLoading={isSendingCode}
                    leftIcon={<Send className="h-3 w-3" />}
                  >
                    {state.brand.domainCodeSent ? "Resend" : "Send Code"}
                  </Button>
                </div>
              )}
            </div>

            {/* If code sent and not verified yet, show verification input */}
            {state.brand.domainCodeSent && !state.brand.domainVerified && (
              <div className="pt-3 border-t border-[#1F1F1F] flex flex-col sm:flex-row gap-3 items-end animate-fadeIn">
                <div className="flex-1 w-full">
                  <Input
                    id="codeInput"
                    label="Enter 6-Digit Code"
                    value={codeInput}
                    onChange={(e) => setCodeInput(e.target.value)}
                    error={codeError}
                    maxLength={6}
                    placeholder="Enter 123456"
                  />
                </div>
                <Button
                  type="button"
                  variant="primary"
                  onClick={handleVerifyCode}
                  isLoading={isVerifyingCode}
                >
                  Verify Code
                </Button>
              </div>
            )}

            {/* Success State */}
            {state.brand.domainVerified && (
              <div className="flex items-center gap-2 text-[#22C55E] bg-[#22C55E]/5 border border-[#22C55E]/10 rounded-lg p-3 text-xs">
                <ShieldCheck className="h-4.5 w-4.5 shrink-0" />
                <div>
                  <span className="font-bold">Brand Email Accepted:</span> Demo authorization is active for <span className="underline">{state.brand.officialEmail || emailInput || "demo@gmail.com"}</span>.
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Form Details */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input
            id="brandName"
            name="brandName"
            label="Brand / Trademark Name"
            value={formData.brandName}
            onChange={handleInputChange}
            error={errors.brandName}
            placeholder="e.g. Adidas"
          />
          <Input
            id="officialWebsite"
            name="officialWebsite"
            label="Official Brand Website"
            value={formData.officialWebsite}
            onChange={handleInputChange}
            error={errors.officialWebsite}
            placeholder="https://www.adidas.com"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input
            id="trademarkNumber"
            name="trademarkNumber"
            label="Trademark Number (Optional)"
            value={formData.trademarkNumber}
            onChange={handleInputChange}
            placeholder="e.g. US-TM-89429402"
          />
          <Select
            id="brandCategory"
            name="brandCategory"
            label="Brand Category"
            value={formData.brandCategory}
            onChange={handleInputChange}
            options={[
              { value: "Sportswear & Footwear", label: "Sportswear & Footwear" },
              { value: "Creative Agency", label: "Creative Agency" },
              { value: "Technology", label: "Technology & Software" },
              { value: "Electronics", label: "Consumer Electronics" },
            ]}
          />
        </div>

        {/* Brand Documents */}
        <div className="border-t border-[#1F1F1F] pt-5 space-y-4">
          <h4 className="text-xs font-bold text-white uppercase tracking-wider">
            Brand Authenticity Uploads
          </h4>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-xs font-semibold text-[#6B7280]">
                Trademark Registry Certificate *
              </label>
              <FileUpload
                title="Trademark_Certificate"
                status={formData.trademarkCertUploaded ? "uploaded" : "not_uploaded"}
                onUploadSuccess={() => handleUploadSuccess("trademarkCertUploaded")}
                onDelete={() => handleDelete("trademarkCertUploaded")}
                rejectionReason={errors.trademarkCert}
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-[#6B7280]">
                Brand Logo Graphic
              </label>
              <FileUpload
                title="Brand_Logo"
                status={formData.logoUploaded ? "uploaded" : "not_uploaded"}
                onUploadSuccess={() => handleUploadSuccess("logoUploaded")}
                onDelete={() => handleDelete("logoUploaded")}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-xs font-semibold text-[#6B7280]">
                Official Brand Authorization Letter
              </label>
              <FileUpload
                title="Brand_Authorization_Letter"
                status={formData.authLetterUploaded ? "uploaded" : "not_uploaded"}
                onUploadSuccess={() => handleUploadSuccess("authLetterUploaded")}
                onDelete={() => handleDelete("authLetterUploaded")}
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-semibold text-[#6B7280]">
                Proof of Brand Ownership / Chain of Title
              </label>
              <FileUpload
                title="Brand_Ownership_Proof"
                status={formData.brandProofUploaded ? "uploaded" : "not_uploaded"}
                onUploadSuccess={() => handleUploadSuccess("brandProofUploaded")}
                onDelete={() => handleDelete("brandProofUploaded")}
              />
            </div>
          </div>
        </div>
      </Card>

      {/* Button panel */}
      <div className="flex justify-between items-center pt-2">
        <Button
          type="button"
          variant="outline"
          leftIcon={<ArrowLeft className="h-4 w-4" />}
          onClick={() => router.push("/verification/documents")}
        >
          Back
        </Button>
        <Button type="submit" variant="primary">
          Save & Continue
        </Button>
      </div>
    </form>
  );
}
