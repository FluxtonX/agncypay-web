"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { ShieldAlert, ArrowLeft, Plus, Trash2, Mail, User } from "lucide-react";
import { useApp } from "../../context/AppContext";
import { Button } from "../ui/Button";
import { Card } from "../ui/Card";
import { Input } from "../ui/Input";
import { FileUpload } from "../ui/FileUpload";
import { cn } from "../../lib/utils";

export function AuthorizationForm() {
  const router = useRouter();
  const { state, updateAuthorization } = useApp();
  const [formData, setFormData] = useState({
    isOwner: state.authorization.isOwner,
    owns25Percent: state.authorization.owns25Percent,
    isAuthorizedForPayments: state.authorization.isAuthorizedForPayments,
    authLetterUploaded: state.authorization.authLetterUploaded,
    powerOfAttorneyUploaded: state.authorization.powerOfAttorneyUploaded,
    signatoryName: state.authorization.signatoryName || "",
    signatoryEmail: state.authorization.signatoryEmail || "",
    roleInCompany: state.authorization.roleInCompany || "",
    owners: state.authorization.owners || [],
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleSelection = (field: "isOwner" | "owns25Percent" | "isAuthorizedForPayments", value: boolean) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    updateAuthorization({ [field]: value });
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    updateAuthorization({ [name]: value });
  };

  const handleUploadSuccess = (field: "authLetterUploaded" | "powerOfAttorneyUploaded") => {
    setFormData((prev) => ({ ...prev, [field]: true }));
    updateAuthorization({ [field]: true });
  };

  const handleDelete = (field: "authLetterUploaded" | "powerOfAttorneyUploaded") => {
    setFormData((prev) => ({ ...prev, [field]: false }));
    updateAuthorization({ [field]: false });
  };

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (formData.isOwner === null) newErrors.isOwner = "Please select whether you are the business owner";
    if (formData.owns25Percent === null) newErrors.owns25Percent = "Please select your ownership statement";
    if (formData.isAuthorizedForPayments === null) newErrors.isAuthorizedForPayments = "Please select payment authorization statement";
    
    // If not owner, they MUST upload authorization letters or power of attorney
    if (formData.isOwner === false) {
      if (!formData.authLetterUploaded && !formData.powerOfAttorneyUploaded) {
        newErrors.documents = "Please upload an Authorization Letter or Power of Attorney document";
      }
      if (!formData.signatoryName) newErrors.signatoryName = "Authorized Signatory Name is required";
      if (!formData.signatoryEmail) {
        newErrors.signatoryEmail = "Authorized Signatory Email is required";
      } else if (!/\S+@\S+\.\S+/.test(formData.signatoryEmail)) {
        newErrors.signatoryEmail = "Invalid email format";
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateAuthorization({
      ...formData,
      isOwner: formData.isOwner ?? true,
      owns25Percent: formData.owns25Percent ?? false,
      isAuthorizedForPayments: formData.isAuthorizedForPayments ?? true,
      signatoryName: formData.signatoryName || "Demo Approver",
      signatoryEmail: formData.signatoryEmail || "demo@gmail.com",
      roleInCompany: formData.roleInCompany || "Authorized Representative",
    });
    setErrors({});
    router.push("/verification/documents");
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-1">
        <h1 className="text-xl font-bold text-white flex items-center gap-2">
          <ShieldAlert className="h-5 w-5 text-[#10B981]" />
          Ownership & Authorization
        </h1>
        <p className="text-xs text-[#6B7280] leading-relaxed">
          For global brands like Adidas, we verify your corporate permission structure to process compliance audits.
        </p>
      </div>

      <Card className="space-y-6 border-[#1F1F1F] bg-[#0D0D0D]">
        {/* Questionnaire */}
        <div className="space-y-4">
          {/* Q1 */}
          <div className="flex flex-col gap-2">
            <label className="text-xs font-semibold text-white uppercase tracking-wider">
              Are you the direct business owner / major shareholder?
            </label>
            <div className="flex gap-4">
              <button
                type="button"
                onClick={() => handleSelection("isOwner", true)}
                className={cn(
                  "flex-1 py-3 px-4 rounded-lg border text-sm font-semibold text-center cursor-pointer transition-all",
                  formData.isOwner === true
                    ? "bg-[#10B981]/15 border-[#10B981] text-white"
                    : "border-[#1F1F1F] text-[#6B7280] hover:bg-white/5"
                )}
              >
                Yes, I am
              </button>
              <button
                type="button"
                onClick={() => handleSelection("isOwner", false)}
                className={cn(
                  "flex-1 py-3 px-4 rounded-lg border text-sm font-semibold text-center cursor-pointer transition-all",
                  formData.isOwner === false
                    ? "bg-[#10B981]/15 border-[#10B981] text-white"
                    : "border-[#1F1F1F] text-[#6B7280] hover:bg-white/5"
                )}
              >
                No, I am an authorized employee
              </button>
            </div>
            {errors.isOwner && <span className="text-xs text-[#EF4444]">{errors.isOwner}</span>}
          </div>

          {/* Q2 */}
          <div className="flex flex-col gap-2">
            <label className="text-xs font-semibold text-white uppercase tracking-wider">
              Do you own 25% or more of this company?
            </label>
            <div className="flex gap-4">
              <button
                type="button"
                onClick={() => handleSelection("owns25Percent", true)}
                className={cn(
                  "flex-1 py-3 px-4 rounded-lg border text-sm font-semibold text-center cursor-pointer transition-all",
                  formData.owns25Percent === true
                    ? "bg-[#10B981]/15 border-[#10B981] text-white"
                    : "border-[#1F1F1F] text-[#6B7280] hover:bg-white/5"
                )}
              >
                Yes (25%+ owner)
              </button>
              <button
                type="button"
                onClick={() => handleSelection("owns25Percent", false)}
                className={cn(
                  "flex-1 py-3 px-4 rounded-lg border text-sm font-semibold text-center cursor-pointer transition-all",
                  formData.owns25Percent === false
                    ? "bg-[#10B981]/15 border-[#10B981] text-white"
                    : "border-[#1F1F1F] text-[#6B7280] hover:bg-white/5"
                )}
              >
                No (Under 25% ownership)
              </button>
            </div>
            {errors.owns25Percent && <span className="text-xs text-[#EF4444]">{errors.owns25Percent}</span>}
          </div>

          {/* Q3 */}
          <div className="flex flex-col gap-2">
            <label className="text-xs font-semibold text-white uppercase tracking-wider">
              Are you legally authorized to manage payments on behalf of this brand?
            </label>
            <div className="flex gap-4">
              <button
                type="button"
                onClick={() => handleSelection("isAuthorizedForPayments", true)}
                className={cn(
                  "flex-1 py-3 px-4 rounded-lg border text-sm font-semibold text-center cursor-pointer transition-all",
                  formData.isAuthorizedForPayments === true
                    ? "bg-[#10B981]/15 border-[#10B981] text-white"
                    : "border-[#1F1F1F] text-[#6B7280] hover:bg-white/5"
                )}
              >
                Yes, authorized
              </button>
              <button
                type="button"
                onClick={() => handleSelection("isAuthorizedForPayments", false)}
                className={cn(
                  "flex-1 py-3 px-4 rounded-lg border text-sm font-semibold text-center cursor-pointer transition-all",
                  formData.isAuthorizedForPayments === false
                    ? "bg-[#10B981]/15 border-[#10B981] text-white"
                    : "border-[#1F1F1F] text-[#6B7280] hover:bg-white/5"
                )}
              >
                No / Pending delegation
              </button>
            </div>
            {errors.isAuthorizedForPayments && (
              <span className="text-xs text-[#EF4444]">{errors.isAuthorizedForPayments}</span>
            )}
          </div>
        </div>

        {/* If employee: Show authorization document uploads and signatory details */}
        {formData.isOwner === false && (
          <div className="border-t border-[#1F1F1F] pt-5 space-y-5 animate-fadeIn">
            <div className="bg-[#10B981]/5 border border-[#10B981]/15 rounded-xl p-4 space-y-1">
              <h4 className="text-xs font-bold text-white uppercase tracking-wider">
                Corporate representative requirement
              </h4>
              <p className="text-xs text-[#6B7280] leading-relaxed">
                As a corporate representative, please upload a signed board authorization letter or Power of Attorney (POA) stating you are authorized to manage payments.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-[#6B7280]">
                  Signed Brand Authorization Letter
                </label>
                <FileUpload
                  title="Authorization_Letter"
                  status={formData.authLetterUploaded ? "uploaded" : "not_uploaded"}
                  onUploadSuccess={() => handleUploadSuccess("authLetterUploaded")}
                  onDelete={() => handleDelete("authLetterUploaded")}
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-semibold text-[#6B7280]">
                  Power of Attorney / Resolution
                </label>
                <FileUpload
                  title="Power_of_Attorney"
                  status={formData.powerOfAttorneyUploaded ? "uploaded" : "not_uploaded"}
                  onUploadSuccess={() => handleUploadSuccess("powerOfAttorneyUploaded")}
                  onDelete={() => handleDelete("powerOfAttorneyUploaded")}
                />
              </div>
            </div>
            {errors.documents && <span className="text-xs text-[#EF4444] block">{errors.documents}</span>}

            <div className="space-y-4 pt-2">
              <h4 className="text-xs font-bold text-white uppercase tracking-wider">
                Authorized Signatory Approver Details
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input
                  id="signatoryName"
                  name="signatoryName"
                  label="Signatory Approver Name"
                  value={formData.signatoryName}
                  onChange={handleInputChange}
                  error={errors.signatoryName}
                  leftIcon={<User className="h-4 w-4" />}
                  placeholder="e.g. Bjørn Gulden"
                />
                <Input
                  id="signatoryEmail"
                  name="signatoryEmail"
                  label="Signatory Corporate Email"
                  value={formData.signatoryEmail}
                  onChange={handleInputChange}
                  error={errors.signatoryEmail}
                  leftIcon={<Mail className="h-4 w-4" />}
                  placeholder="e.g. CEO@adidas-group.com"
                />
              </div>
              <Input
                id="roleInCompany"
                name="roleInCompany"
                label="Signatory Job Title"
                value={formData.roleInCompany}
                onChange={handleInputChange}
                placeholder="e.g. Chief Executive Officer (CEO)"
              />
            </div>
          </div>
        )}

        {/* UBO list preview */}
        <div className="border-t border-[#1F1F1F] pt-5 space-y-3">
          <h4 className="text-xs font-bold text-white uppercase tracking-wider flex items-center justify-between">
            <span>Ultimate Beneficial Owners (UBOs)</span>
            <span className="text-[10px] text-[#10B981] font-semibold">1 Owner Registered</span>
          </h4>

          <div className="space-y-2">
            {formData.owners.map((owner: any, idx: number) => (
              <div key={idx} className="glass-panel border-[#1F1F1F] bg-[#0A0A0A] p-3 rounded-lg flex items-center justify-between text-xs">
                <div className="space-y-1">
                  <p className="font-semibold text-white">{owner.fullName}</p>
                  <p className="text-[#6B7280]">{owner.role} &bull; {owner.ownership}% shares &bull; {owner.country}</p>
                </div>
                <div className="text-right">
                  <span className="text-[10px] bg-[#10B981]/10 border border-[#10B981]/25 px-2 py-0.5 rounded text-[#10B981] font-bold">
                    ID Verified
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </Card>

      {/* Button panel */}
      <div className="flex justify-between items-center pt-2">
        <Button
          type="button"
          variant="outline"
          leftIcon={<ArrowLeft className="h-4 w-4" />}
          onClick={() => router.push("/verification/representative")}
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
