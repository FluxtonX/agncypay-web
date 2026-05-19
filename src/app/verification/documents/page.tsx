"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { FileText, ArrowLeft, ArrowRight, ShieldCheck } from "lucide-react";
import { useApp } from "../../../context/AppContext";
import { FileUpload } from "../../../components/ui/FileUpload";
import { Button } from "../../../components/ui/Button";
import { Card } from "../../../components/ui/Card";

export default function DocumentsStepPage() {
  const router = useRouter();
  const { state, uploadDocument } = useApp();
  const [error, setError] = useState("");

  const handleUploadSuccess = (docId: string, fileName: string) => {
    uploadDocument(docId, { status: "uploaded", fileName });
    setError("");
  };

  const handleDelete = (docId: string) => {
    uploadDocument(docId, { status: "not_uploaded", fileName: "" });
  };

  const handleContinue = () => {
    // Validate that all 4 documents are uploaded
    const uploadedCount = state.documents.filter(
      (d) => d.status === "uploaded" || d.status === "processing" || d.status === "approved"
    ).length;

    if (uploadedCount < 4) {
      setError("Please upload all 4 required corporate compliance documents before proceeding.");
      return;
    }

    router.push("/verification/brand");
  };

  // Prefill helper to upload all documents instantly (amazing user experience!)
  const handlePrefillAllDocs = () => {
    state.documents.forEach((doc) => {
      const mockName = `${doc.title.toLowerCase().replace(/\s+/g, "_")}_adidas.pdf`;
      uploadDocument(doc.id, { status: "uploaded", fileName: mockName });
    });
    setError("");
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-start">
        <div className="space-y-1">
          <h1 className="text-xl font-bold text-white flex items-center gap-2">
            <FileText className="h-5 w-5 text-[#10B981]" />
            Corporate Documents Vault
          </h1>
          <p className="text-xs text-[#6B7280] leading-relaxed">
            Upload registry filings and official certificates to complete business verification checks.
          </p>
        </div>

        <button
          type="button"
          onClick={handlePrefillAllDocs}
          className="flex items-center gap-1 px-2.5 py-1 text-[11px] font-bold text-[#10B981] bg-[#10B981]/10 border border-[#10B981]/20 rounded-md hover:bg-[#10B981]/20 transition-all cursor-pointer"
        >
          Prefill Docs
        </button>
      </div>

      {error && (
        <div className="flex items-center gap-2 bg-[#EF4444]/5 border border-[#EF4444]/10 rounded-lg p-3 text-xs text-[#EF4444]">
          <span>⚠️ {error}</span>
        </div>
      )}

      <Card className="grid grid-cols-1 md:grid-cols-2 gap-6 border-[#1F1F1F] p-6 bg-[#0D0D0D]">
        {state.documents.map((doc) => (
          <div key={doc.id} className="space-y-2">
            <div className="flex justify-between items-baseline">
              <label className="text-xs font-semibold text-white">
                {doc.title} <span className="text-[#10B981]">*</span>
              </label>
              <span className="text-[10px] text-[#6B7280]/40 uppercase font-mono">ID: {doc.id}</span>
            </div>
            <p className="text-[11px] text-[#6B7280] leading-relaxed mb-1">
              {doc.type}
            </p>
            <FileUpload
              title={doc.title}
              status={doc.status}
              fileName={doc.fileName}
              rejectionReason={doc.rejectionReason}
              onUploadSuccess={(name) => handleUploadSuccess(doc.id, name)}
              onDelete={() => handleDelete(doc.id)}
            />
          </div>
        ))}
      </Card>

      {/* Button panel */}
      <div className="flex justify-between items-center pt-2">
        <Button
          type="button"
          variant="outline"
          leftIcon={<ArrowLeft className="h-4 w-4" />}
          onClick={() => router.push("/verification/authorization")}
        >
          Back
        </Button>
        <Button
          type="button"
          variant="primary"
          rightIcon={<ArrowRight className="h-4 w-4" />}
          onClick={handleContinue}
        >
          Save & Continue
        </Button>
      </div>
    </div>
  );
}
