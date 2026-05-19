"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { CreditCard, ArrowLeft, AlertTriangle, Building } from "lucide-react";
import { useApp } from "../../context/AppContext";
import { Input } from "../ui/Input";
import { Select } from "../ui/Select";
import { Button } from "../ui/Button";
import { Card } from "../ui/Card";
import { FileUpload } from "../ui/FileUpload";

export function BankDetailsForm() {
  const router = useRouter();
  const { state, updateBankDetails } = useApp();

  const [formData, setFormData] = useState({
    accountHolderName: state.bankDetails.accountHolderName || "",
    bankName: state.bankDetails.bankName || "",
    country: state.bankDetails.country || "Germany",
    currency: state.bankDetails.currency || "USD",
    accountNumber: state.bankDetails.accountNumber || "",
    routingNumber: state.bankDetails.routingNumber || "",
    bankAddress: state.bankDetails.bankAddress || "",
    statementUploaded: state.bankDetails.statementUploaded || false,
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    updateBankDetails({ [name]: value });
  };

  const handleUploadSuccess = () => {
    setFormData((prev) => ({ ...prev, statementUploaded: true }));
    updateBankDetails({ statementUploaded: true });
  };

  const handleDelete = () => {
    setFormData((prev) => ({ ...prev, statementUploaded: false }));
    updateBankDetails({ statementUploaded: false });
  };

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.accountHolderName) newErrors.accountHolderName = "Account holder name is required";
    if (!formData.bankName) newErrors.bankName = "Bank name is required";
    if (!formData.accountNumber) newErrors.accountNumber = "Account number / IBAN is required";
    if (!formData.routingNumber) newErrors.routingNumber = "Routing number / SWIFT code is required";
    if (!formData.statementUploaded) newErrors.statement = "Bank statement upload is required for verification";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validate()) {
      updateBankDetails(formData);
      router.push("/verification/review");
    }
  };

  const handlePrefill = () => {
    const mockBank = {
      accountHolderName: "Adidas AG",
      bankName: "Deutsche Bank AG",
      country: "Germany",
      currency: "USD",
      accountNumber: "DE89 3704 0044 0532 9400 12",
      routingNumber: "DEUTDEDDFXX",
      bankAddress: "Taunusanlage 12, 60325 Frankfurt am Main, Germany",
      statementUploaded: true,
    };
    setFormData(mockBank);
    updateBankDetails(mockBank);
  };

  // Warning check if Account Holder Name != Business Legal Name
  const legalName = state.businessSetup.legalName || "Adidas AG";
  const holderMismatch = 
    formData.accountHolderName.trim().toLowerCase() !== legalName.trim().toLowerCase() &&
    formData.accountHolderName.trim() !== "";

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="flex justify-between items-start">
        <div className="space-y-1">
          <h1 className="text-xl font-bold text-white flex items-center gap-2">
            <CreditCard className="h-5 w-5 text-[#10B981]" />
            Bank & Payout Setup
          </h1>
          <p className="text-xs text-[#6B7280] leading-relaxed">
            Link the corporate bank account for payment settlements. Account holder must match your legal business name.
          </p>
        </div>

        <button
          type="button"
          onClick={handlePrefill}
          className="flex items-center gap-1 px-2.5 py-1 text-[11px] font-bold text-[#10B981] bg-[#10B981]/10 border border-[#10B981]/20 rounded-md hover:bg-[#10B981]/20 transition-all cursor-pointer"
        >
          Prefill Bank
        </button>
      </div>

      <Card className="space-y-5 border-[#1F1F1F] bg-[#0D0D0D]">
        <div className="space-y-4">
          <Input
            id="accountHolderName"
            name="accountHolderName"
            label="Bank Account Holder Name"
            value={formData.accountHolderName}
            onChange={handleChange}
            error={errors.accountHolderName}
            leftIcon={<Building className="h-4 w-4" />}
            placeholder="Must match Legal Entity name exactly"
          />

          {/* Account holder warning */}
          {holderMismatch && (
            <div className="flex items-start gap-2 bg-[#F59E0B]/5 border border-[#F59E0B]/10 rounded-lg p-3 text-xs text-[#F59E0B] leading-relaxed">
              <AlertTriangle className="h-4 w-4 shrink-0 mt-0.5" />
              <div>
                <span className="font-semibold">Holder Name Mismatch:</span> Your registered account holder name (<span className="underline">{formData.accountHolderName}</span>) does not match the registered legal business name (<span className="underline">{legalName}</span>). Mismatches will require manual compliance officer review.
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              id="bankName"
              name="bankName"
              label="Bank Name"
              value={formData.bankName}
              onChange={handleChange}
              error={errors.bankName}
              placeholder="e.g. Deutsche Bank AG"
            />
            <Select
              id="country"
              name="country"
              label="Bank Account Country"
              value={formData.country}
              onChange={handleChange}
              options={[
                { value: "Germany", label: "Germany" },
                { value: "United States", label: "United States" },
                { value: "United Kingdom", label: "United Kingdom" },
                { value: "France", label: "France" },
              ]}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              id="accountNumber"
              name="accountNumber"
              label="IBAN / Account Number"
              value={formData.accountNumber}
              onChange={handleChange}
              error={errors.accountNumber}
              placeholder="DE89 3704..."
            />
            <Input
              id="routingNumber"
              name="routingNumber"
              label="SWIFT / BIC / Routing"
              value={formData.routingNumber}
              onChange={handleChange}
              error={errors.routingNumber}
              placeholder="e.g. DEUTDEDDFXX"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Select
              id="currency"
              name="currency"
              label="Settlement Currency"
              value={formData.currency}
              onChange={handleChange}
              options={[
                { value: "USD", label: "USD - US Dollar" },
                { value: "EUR", label: "EUR - Euro" },
                { value: "GBP", label: "GBP - British Pound" },
              ]}
            />
            <Input
              id="bankAddress"
              name="bankAddress"
              label="Bank Branch Address"
              value={formData.bankAddress}
              onChange={handleChange}
              placeholder="e.g. Taunusanlage 12, Frankfurt, Germany"
            />
          </div>
        </div>

        {/* Bank statement upload */}
        <div className="border-t border-[#1F1F1F] pt-4 space-y-2">
          <label className="text-xs font-semibold text-white uppercase tracking-wider block">
            Proof of Account (Bank Statement) *
          </label>
          <p className="text-[11px] text-[#6B7280] leading-relaxed mb-2">
            Upload a corporate bank statement or account certificate showing the holder name and account details. Must be dated within the last 3 months.
          </p>
          <FileUpload
            title="Bank_Statement"
            status={formData.statementUploaded ? "uploaded" : "not_uploaded"}
            onUploadSuccess={handleUploadSuccess}
            onDelete={handleDelete}
            rejectionReason={errors.statement}
          />
        </div>
      </Card>

      {/* Button panel */}
      <div className="flex justify-between items-center pt-2">
        <Button
          type="button"
          variant="outline"
          leftIcon={<ArrowLeft className="h-4 w-4" />}
          onClick={() => router.push("/verification/brand")}
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
