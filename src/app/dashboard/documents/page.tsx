"use client";

import React from "react";
import { FileText, Download, Lock } from "lucide-react";
import { useApp } from "../../../context/AppContext";
import { Card } from "../../../components/ui/Card";
import { Badge } from "../../../components/ui/Badge";
import { Button } from "../../../components/ui/Button";

export default function DocumentVaultPage() {
  const { state } = useApp();
  const isApproved = state.verificationStatus === "approved";

  // Document status helper
  const badgeVariants = {
    not_uploaded: "neutral" as const,
    uploaded: "primary" as const,
    processing: "secondary" as const,
    approved: "success" as const,
    rejected: "error" as const,
    needs_reupload: "warning" as const,
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-xl font-bold text-white tracking-tight">
            Corporate Document Vault
          </h1>
          <p className="text-xs text-[#94A3B8] mt-0.5">
            Vaulted corporate registry certificates and compliance assets.
          </p>
        </div>

        {isApproved && (
          <Button
            size="sm"
            variant="secondary"
            onClick={() => alert("Simulation: Document batch upload has been initialized.")}
          >
            Upload Document
          </Button>
        )}
      </div>

      {!isApproved && (
        <div className="bg-white/[0.03] border border-white/10 rounded-xl p-4 flex gap-3 text-xs text-[#94A3B8] leading-relaxed">
          <Lock className="h-5 w-5 text-white shrink-0 mt-0.5" />
          <div>
            <span className="font-bold text-white">Vault Access Restricted:</span> Document vault access is restricted in read-only mode until manual compliance audit is approved.
          </div>
        </div>
      )}

      {/* Grid List */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {state.documents.map((doc) => {
          const isUploaded = doc.status === "uploaded" || doc.status === "approved" || doc.status === "processing";
          
          return (
            <Card
              key={doc.id}
              className="border-white/[0.06] p-5 flex flex-col justify-between min-h-[140px] bg-[#070B14]"
            >
              <div className="flex justify-between items-start gap-4">
                <div className="flex gap-3">
                  <div className="p-2.5 rounded-lg bg-white/[0.06] border border-white/10 text-white shrink-0">
                    <FileText className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-white">{doc.title}</h3>
                    <p className="text-xs text-[#94A3B8]/60 mt-1 leading-relaxed">{doc.type}</p>
                  </div>
                </div>

                <Badge variant={badgeVariants[doc.status]}>
                  {doc.status.replace("_", " ")}
                </Badge>
              </div>

              {/* Document footer meta */}
              <div className="flex justify-between items-center border-t border-white/[0.04] pt-4 mt-4 text-xs text-[#94A3B8]">
                <span>
                  {isUploaded ? doc.fileName : "No file attached"}
                </span>
                
                {isUploaded && (
                  <button
                    onClick={() => alert(`Simulation: Downloading file ${doc.fileName}...`)}
                    className="flex items-center gap-1 font-bold text-white hover:underline cursor-pointer"
                  >
                    <Download className="h-3.5 w-3.5" /> Download
                  </button>
                )}
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
