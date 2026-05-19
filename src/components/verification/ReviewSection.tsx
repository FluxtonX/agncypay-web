"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { ShieldCheck, Edit, ArrowLeft, Check, AlertCircle } from "lucide-react";
import { useApp } from "../../context/AppContext";
import { Card } from "../ui/Card";
import { Button } from "../ui/Button";
import { Badge } from "../ui/Badge";

export function ReviewSection() {
  const router = useRouter();
  const { state, submitForVerification } = useApp();

  const [consents, setConsents] = useState({
    accurate: false,
    authorized: false,
    verifyConsent: false,
    suspensionWarning: false,
  });

  const handleCheckboxChange = (field: keyof typeof consents) => {
    setConsents((prev) => ({ ...prev, [field]: !prev[field] }));
  };

  const allChecked = Object.values(consents).every(Boolean);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (allChecked) {
      submitForVerification();
      router.push("/verification/status");
    }
  };

  // Check section completeness helper
  const checkStatus = (stepId: number) => {
    if (stepId === 1) {
      const { legalName, country, website, email } = state.businessSetup;
      return legalName && country && website && email ? "complete" : "incomplete";
    }
    if (stepId === 2) {
      const { fullName, email, idFrontUploaded, selfieUploaded } = state.representative;
      return fullName && email && idFrontUploaded && selfieUploaded ? "complete" : "incomplete";
    }
    if (stepId === 3) {
      return state.authorization.isOwner !== null ? "complete" : "incomplete";
    }
    if (stepId === 4) {
      const uploaded = state.documents.filter(d => d.status === "uploaded" || d.status === "processing" || d.status === "approved").length;
      return uploaded >= 4 ? "complete" : "incomplete";
    }
    if (stepId === 5) {
      return state.brand.domainVerified && state.brand.trademarkCertUploaded ? "complete" : "incomplete";
    }
    if (stepId === 6) {
      return state.bankDetails.accountNumber && state.bankDetails.statementUploaded ? "complete" : "incomplete";
    }
    return "incomplete";
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-1">
        <h1 className="text-xl font-bold text-white flex items-center gap-2">
          <ShieldCheck className="h-5 w-5 text-[#10B981]" />
          Review & Submit KYB Profile
        </h1>
        <p className="text-xs text-[#6B7280] leading-relaxed">
          Verify all information before sending details to our compliance auditing department.
        </p>
      </div>

      <Card className="space-y-5 border-white/[0.06] divide-y divide-white/[0.04]">
        {/* Section 1 */}
        <div className="pt-0 pb-4 flex justify-between items-start gap-4">
          <div className="space-y-1 text-xs">
            <h4 className="font-bold text-white uppercase tracking-wider">
              1. Business Profile
            </h4>
            <div className="text-[#6B7280]/80 space-y-0.5 mt-2">
              <p><span className="font-semibold text-white">Legal Name:</span> {state.businessSetup.legalName || "Not set"}</p>
              <p><span className="font-semibold text-white">Trading Name:</span> {state.businessSetup.brandName || "Not set"}</p>
              <p><span className="font-semibold text-white">Tax ID:</span> {state.businessSetup.taxId || "Not set"}</p>
              <p><span className="font-semibold text-white">Website:</span> {state.businessSetup.website || "Not set"}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant={checkStatus(1) === "complete" ? "success" : "error"}>
              {checkStatus(1) === "complete" ? "Ready" : "Incomplete"}
            </Badge>
            <button
              type="button"
              onClick={() => router.push("/verification/business-info")}
              className="text-[#6B7280] hover:text-[#10B981] p-1 rounded-lg hover:bg-white/5 transition-colors cursor-pointer"
            >
              <Edit className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Section 2 */}
        <div className="pt-4 pb-4 flex justify-between items-start gap-4">
          <div className="space-y-1 text-xs">
            <h4 className="font-bold text-white uppercase tracking-wider">
              2. Representative KYC
            </h4>
            <div className="text-[#6B7280]/80 space-y-0.5 mt-2">
              <p><span className="font-semibold text-white">Representative:</span> {state.representative.fullName || "Not set"}</p>
              <p><span className="font-semibold text-white">Job Title:</span> {state.representative.jobTitle || "Not set"}</p>
              <p><span className="font-semibold text-white">ID Verification:</span> {state.representative.idFrontUploaded ? "Uploaded Front" : "ID Missing"}</p>
              <p><span className="font-semibold text-white">Liveness Selfie:</span> {state.representative.selfieUploaded ? "Selfie Uploaded" : "Selfie Missing"}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant={checkStatus(2) === "complete" ? "success" : "error"}>
              {checkStatus(2) === "complete" ? "Ready" : "Incomplete"}
            </Badge>
            <button
              type="button"
              onClick={() => router.push("/verification/representative")}
              className="text-[#6B7280] hover:text-[#10B981] p-1 rounded-lg hover:bg-white/5 transition-colors cursor-pointer"
            >
              <Edit className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Section 3 */}
        <div className="pt-4 pb-4 flex justify-between items-start gap-4">
          <div className="space-y-1 text-xs">
            <h4 className="font-bold text-white uppercase tracking-wider">
              3. Payment Ownership & Authorization
            </h4>
            <div className="text-[#6B7280]/80 space-y-0.5 mt-2">
              <p><span className="font-semibold text-white">Direct Owner:</span> {state.authorization.isOwner === null ? "Not set" : state.authorization.isOwner ? "Yes" : "No (Corporate Representative)"}</p>
              {state.authorization.isOwner === false && (
                <>
                  <p><span className="font-semibold text-white">Signatory Approver:</span> {state.authorization.signatoryName || "Not set"}</p>
                  <p><span className="font-semibold text-white">Auth Documents:</span> {state.authorization.authLetterUploaded ? "Letter Attached" : "None"}</p>
                </>
              )}
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant={checkStatus(3) === "complete" ? "success" : "error"}>
              {checkStatus(3) === "complete" ? "Ready" : "Incomplete"}
            </Badge>
            <button
              type="button"
              onClick={() => router.push("/verification/authorization")}
              className="text-[#6B7280] hover:text-[#10B981] p-1 rounded-lg hover:bg-white/5 transition-colors cursor-pointer"
            >
              <Edit className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Section 4 */}
        <div className="pt-4 pb-4 flex justify-between items-start gap-4">
          <div className="space-y-1 text-xs">
            <h4 className="font-bold text-white uppercase tracking-wider">
              4. Company Registry Certificates
            </h4>
            <div className="text-[#6B7280]/80 space-y-0.5 mt-2">
              {state.documents.map((doc) => (
                <p key={doc.id} className="flex items-center gap-1.5">
                  <span className={doc.status === "uploaded" || doc.status === "approved" || doc.status === "processing" ? "text-[#22C55E]" : "text-[#EF4444]"}>
                    &bull;
                  </span>
                  <span>{doc.title}:</span>
                  <span className="font-semibold text-white">{doc.status === "uploaded" || doc.status === "approved" || doc.status === "processing" ? "Uploaded" : "Missing"}</span>
                </p>
              ))}
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant={checkStatus(4) === "complete" ? "success" : "error"}>
              {checkStatus(4) === "complete" ? "Ready" : "Incomplete"}
            </Badge>
            <button
              type="button"
              onClick={() => router.push("/verification/documents")}
              className="text-[#6B7280] hover:text-[#10B981] p-1 rounded-lg hover:bg-white/5 transition-colors cursor-pointer"
            >
              <Edit className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Section 5 */}
        <div className="pt-4 pb-4 flex justify-between items-start gap-4">
          <div className="space-y-1 text-xs">
            <h4 className="font-bold text-white uppercase tracking-wider">
              5. Brand Domain & Trademark
            </h4>
            <div className="text-[#6B7280]/80 space-y-0.5 mt-2">
              <p><span className="font-semibold text-white">Brand Name:</span> {state.brand.brandName || "Not set"}</p>
              <p><span className="font-semibold text-white">Trademark:</span> {state.brand.trademarkNumber || "Not set"}</p>
              <p><span className="font-semibold text-white">Domain Code Check:</span> {state.brand.domainVerified ? "Verified (adidas.com)" : "Pending"}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant={checkStatus(5) === "complete" ? "success" : "error"}>
              {checkStatus(5) === "complete" ? "Ready" : "Incomplete"}
            </Badge>
            <button
              type="button"
              onClick={() => router.push("/verification/brand")}
              className="text-[#6B7280] hover:text-[#10B981] p-1 rounded-lg hover:bg-white/5 transition-colors cursor-pointer"
            >
              <Edit className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Section 6 */}
        <div className="pt-4 pb-0 flex justify-between items-start gap-4">
          <div className="space-y-1 text-xs">
            <h4 className="font-bold text-white uppercase tracking-wider">
              6. Bank & Payout Details
            </h4>
            <div className="text-[#6B7280]/80 space-y-0.5 mt-2">
              <p><span className="font-semibold text-white">Bank Name:</span> {state.bankDetails.bankName || "Not set"}</p>
              <p><span className="font-semibold text-white">IBAN:</span> {state.bankDetails.accountNumber || "Not set"}</p>
              <p><span className="font-semibold text-white">Statement Proof:</span> {state.bankDetails.statementUploaded ? "Uploaded" : "Missing"}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant={checkStatus(6) === "complete" ? "success" : "error"}>
              {checkStatus(6) === "complete" ? "Ready" : "Incomplete"}
            </Badge>
            <button
              type="button"
              onClick={() => router.push("/verification/bank-details")}
              className="text-[#6B7280] hover:text-[#10B981] p-1 rounded-lg hover:bg-white/5 transition-colors cursor-pointer"
            >
              <Edit className="h-4 w-4" />
            </button>
          </div>
        </div>
      </Card>

      {/* Disclaimers / Checkbox Panel */}
      <Card className="space-y-3.5 border-white/[0.06] bg-[#0D0D0D]/40">
        <h4 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
          <AlertCircle className="h-4 w-4 text-[#F59E0B]" />
          Consent Declarations
        </h4>

        <div className="space-y-3">
          {/* Box 1 */}
          <label className="flex items-start gap-3 text-xs text-[#6B7280] cursor-pointer hover:text-white transition-colors">
            <input
              type="checkbox"
              checked={consents.accurate}
              onChange={() => handleCheckboxChange("accurate")}
              className="mt-0.5 h-3.5 w-3.5 border-white/10 rounded accent-[#10B981] focus:ring-0 focus:outline-none cursor-pointer"
            />
            <span>I confirm that all registration, TAX, and entity details provided are accurate and match official registers.</span>
          </label>

          {/* Box 2 */}
          <label className="flex items-start gap-3 text-xs text-[#6B7280] cursor-pointer hover:text-white transition-colors">
            <input
              type="checkbox"
              checked={consents.authorized}
              onChange={() => handleCheckboxChange("authorized")}
              className="mt-0.5 h-3.5 w-3.5 border-white/10 rounded accent-[#10B981] focus:ring-0 focus:outline-none cursor-pointer"
            />
            <span>I am legally authorized to act on behalf of this business and manage payouts.</span>
          </label>

          {/* Box 3 */}
          <label className="flex items-start gap-3 text-xs text-[#6B7280] cursor-pointer hover:text-white transition-colors">
            <input
              type="checkbox"
              checked={consents.verifyConsent}
              onChange={() => handleCheckboxChange("verifyConsent")}
              className="mt-0.5 h-3.5 w-3.5 border-white/10 rounded accent-[#10B981] focus:ring-0 focus:outline-none cursor-pointer"
            />
            <span>I agree that AgncyPay may verify this information through public databases or external compliance entities.</span>
          </label>

          {/* Box 4 */}
          <label className="flex items-start gap-3 text-xs text-[#6B7280] cursor-pointer hover:text-white transition-colors">
            <input
              type="checkbox"
              checked={consents.suspensionWarning}
              onChange={() => handleCheckboxChange("suspensionWarning")}
              className="mt-0.5 h-3.5 w-3.5 border-white/10 rounded accent-[#10B981] focus:ring-0 focus:outline-none cursor-pointer"
            />
            <span>I understand that false brand claims (specifically relating to brand representations like Adidas) will result in immediate account suspension and notification of authorities.</span>
          </label>
        </div>
      </Card>

      {/* Button panel */}
      <div className="flex justify-between items-center pt-2">
        <Button
          type="button"
          variant="outline"
          leftIcon={<ArrowLeft className="h-4 w-4" />}
          onClick={() => router.push("/verification/bank-details")}
        >
          Back
        </Button>
        <Button type="submit" variant="primary" disabled={!allChecked} className="w-48 shadow-[0_0_20px_rgba(139,92,246,0.3)]">
          Submit Profile
        </Button>
      </div>
    </form>
  );
}
