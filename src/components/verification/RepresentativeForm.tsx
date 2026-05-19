"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { UserCheck, ArrowLeft, Mail, Phone, Calendar, Globe, MapPin } from "lucide-react";
import { useApp } from "../../context/AppContext";
import { Input } from "../ui/Input";
import { Select } from "../ui/Select";
import { Button } from "../ui/Button";
import { Card } from "../ui/Card";
import { FileUpload } from "../ui/FileUpload";

export function RepresentativeForm() {
  const router = useRouter();
  const { state, updateRepresentative } = useApp();
  const [formData, setFormData] = useState({
    fullName: state.representative.fullName || "",
    jobTitle: state.representative.jobTitle || "",
    dob: state.representative.dob || "",
    nationality: state.representative.nationality || "Germany",
    email: state.representative.email || state.user?.email || "",
    phone: state.representative.phone || "",
    address: state.representative.address || "",
    idType: state.representative.idType || "Passport",
    idFrontUploaded: state.representative.idFrontUploaded || false,
    idBackUploaded: state.representative.idBackUploaded || false,
    selfieUploaded: state.representative.selfieUploaded || false,
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

  const handleUploadSuccess = (field: "idFrontUploaded" | "idBackUploaded" | "selfieUploaded") => {
    setFormData((prev) => ({ ...prev, [field]: true }));
    updateRepresentative({ [field]: true });
  };

  const handleDelete = (field: "idFrontUploaded" | "idBackUploaded" | "selfieUploaded") => {
    setFormData((prev) => ({ ...prev, [field]: false }));
    updateRepresentative({ [field]: false });
  };

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.fullName) newErrors.fullName = "Full Legal Name is required";
    if (!formData.jobTitle) newErrors.jobTitle = "Job title is required";
    if (!formData.dob) newErrors.dob = "Date of Birth is required";
    if (!formData.address) newErrors.address = "Residential address is required";
    if (!formData.email) {
      newErrors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Invalid email format";
    }
    if (!formData.idFrontUploaded) newErrors.idUpload = "Please upload the front of your government ID";
    if (formData.idType !== "Passport" && !formData.idBackUploaded) {
      newErrors.idBackUpload = "Please upload the back of your government ID";
    }
    if (!formData.selfieUploaded) newErrors.selfieUpload = "Please upload a selfie for liveness verification";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validate()) {
      updateRepresentative(formData);
      router.push("/verification/authorization");
    }
  };

  // Prefill helper for testing/demo
  const handlePrefill = () => {
    const mockRep = {
      fullName: "Martin Safi",
      jobTitle: "Corporate Treasury Manager",
      dob: "1988-08-14",
      nationality: "Germany",
      email: "martin.safi@adidas-group.com",
      phone: "+49 176 1234567",
      address: "Adi-Dassler-Strasse 1, 91074 Herzogenaurach, Germany",
      idType: "Passport",
      idFrontUploaded: true,
      selfieUploaded: true,
    };
    setFormData((prev) => ({ ...prev, ...mockRep }));
    updateRepresentative(mockRep);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="flex justify-between items-start">
        <div className="space-y-1">
          <h1 className="text-xl font-bold text-white flex items-center gap-2">
            <UserCheck className="h-5 w-5 text-[#10B981]" />
            Legal Representative KYC
          </h1>
          <p className="text-xs text-[#6B7280] leading-relaxed">
            Verify the identity of the executive authorized to manage payments and sign documents for this company.
          </p>
        </div>

        <button
          type="button"
          onClick={handlePrefill}
          className="flex items-center gap-1 px-2.5 py-1 text-[11px] font-bold text-[#10B981] bg-[#10B981]/10 border border-[#10B981]/20 rounded-md hover:bg-[#10B981]/20 transition-all cursor-pointer"
        >
          Prefill Rep
        </button>
      </div>

      <Card className="space-y-5 border-[#1F1F1F] bg-[#0D0D0D]">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input
            id="fullName"
            name="fullName"
            label="Full Legal Name (Matching ID)"
            value={formData.fullName}
            onChange={handleChange}
            error={errors.fullName}
            placeholder="e.g. Martin Safi"
          />
          <Input
            id="jobTitle"
            name="jobTitle"
            label="Job Title / Role"
            value={formData.jobTitle}
            onChange={handleChange}
            error={errors.jobTitle}
            placeholder="e.g. Corporate Treasury Manager"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input
            id="dob"
            name="dob"
            type="date"
            label="Date of Birth"
            value={formData.dob}
            onChange={handleChange}
            error={errors.dob}
            leftIcon={<Calendar className="h-4 w-4" />}
          />
          <Select
            id="nationality"
            name="nationality"
            label="Nationality"
            value={formData.nationality}
            onChange={handleChange}
            options={[
              { value: "Germany", label: "Germany" },
              { value: "United States", label: "United States" },
              { value: "United Kingdom", label: "United Kingdom" },
              { value: "France", label: "France" },
              { value: "Canada", label: "Canada" },
            ]}
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input
            id="email"
            name="email"
            label="Representative Work Email"
            value={formData.email}
            onChange={handleChange}
            error={errors.email}
            leftIcon={<Mail className="h-4 w-4" />}
            placeholder="name@adidas-group.com"
          />
          <Input
            id="phone"
            name="phone"
            label="Mobile Number"
            value={formData.phone}
            onChange={handleChange}
            leftIcon={<Phone className="h-4 w-4" />}
            placeholder="+49 176 1234567"
          />
        </div>

        <Input
          id="address"
          name="address"
          label="Residential Address"
          value={formData.address}
          onChange={handleChange}
          error={errors.address}
          leftIcon={<MapPin className="h-4 w-4" />}
          placeholder="Street, City, Postcode, Country"
        />

        <div className="border-t border-[#1F1F1F] my-4 pt-4 space-y-4">
          <h3 className="text-xs font-semibold text-white uppercase tracking-wider">
            Identity Verification Documents
          </h3>
          <Select
            id="idType"
            name="idType"
            label="Government ID Type"
            value={formData.idType}
            onChange={handleChange}
            options={[
              { value: "Passport", label: "Passport" },
              { value: "National ID", label: "National Identity Card" },
              { value: "Driver License", label: "Driver's License" },
            ]}
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Front ID Upload */}
            <div className="space-y-1">
              <label className="text-xs font-semibold text-[#6B7280]">
                ID Front Upload ({formData.idType})
              </label>
              <FileUpload
                title="ID_Front"
                status={formData.idFrontUploaded ? "uploaded" : "not_uploaded"}
                onUploadSuccess={() => handleUploadSuccess("idFrontUploaded")}
                onDelete={() => handleDelete("idFrontUploaded")}
                rejectionReason={errors.idUpload}
              />
            </div>

            {/* Back ID Upload (Only if not passport) */}
            {formData.idType !== "Passport" ? (
              <div className="space-y-1">
                <label className="text-xs font-semibold text-[#6B7280]">
                  ID Back Upload ({formData.idType})
                </label>
                <FileUpload
                  title="ID_Back"
                  status={formData.idBackUploaded ? "uploaded" : "not_uploaded"}
                  onUploadSuccess={() => handleUploadSuccess("idBackUploaded")}
                  onDelete={() => handleDelete("idBackUploaded")}
                  rejectionReason={errors.idBackUpload}
                />
              </div>
            ) : (
              /* Selfie Upload if passport */
              <div className="space-y-1">
                <label className="text-xs font-semibold text-[#6B7280]">
                  Liveness Selfie
                </label>
                <FileUpload
                  title="Selfie"
                  status={formData.selfieUploaded ? "uploaded" : "not_uploaded"}
                  onUploadSuccess={() => handleUploadSuccess("selfieUploaded")}
                  onDelete={() => handleDelete("selfieUploaded")}
                  rejectionReason={errors.selfieUpload}
                />
              </div>
            )}
          </div>

          {/* Double display for selfie if back ID was active */}
          {formData.idType !== "Passport" && (
            <div className="space-y-1">
              <label className="text-xs font-semibold text-[#6B7280]">
                Liveness Selfie
              </label>
              <FileUpload
                title="Selfie"
                status={formData.selfieUploaded ? "uploaded" : "not_uploaded"}
                onUploadSuccess={() => handleUploadSuccess("selfieUploaded")}
                onDelete={() => handleDelete("selfieUploaded")}
                rejectionReason={errors.selfieUpload}
              />
            </div>
          )}
        </div>
      </Card>

      {/* Button panel */}
      <div className="flex justify-between items-center pt-2">
        <Button
          type="button"
          variant="outline"
          leftIcon={<ArrowLeft className="h-4 w-4" />}
          onClick={() => router.push("/verification/business-info")}
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
