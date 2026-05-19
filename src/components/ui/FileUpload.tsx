"use client";

import React, { useRef, useState } from "react";
import { UploadCloud, File, AlertCircle, CheckCircle2, RefreshCw, Trash2 } from "lucide-react";
import { Badge } from "./Badge";
import { cn } from "../../lib/utils";

interface FileUploadProps {
  title?: string;
  accept?: string;
  maxSizeMB?: number;
  onUploadSuccess: (fileName: string) => void;
  onDelete: () => void;
  status: "not_uploaded" | "uploaded" | "processing" | "approved" | "rejected" | "needs_reupload";
  rejectionReason?: string;
  fileName?: string;
}

export function FileUpload({
  title = "compliance_document",
  accept = ".pdf,.jpg,.jpeg,.png",
  maxSizeMB = 10,
  onUploadSuccess,
  onDelete,
  status,
  rejectionReason,
  fileName: propFileName,
}: FileUploadProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [dragActive, setDragActive] = useState(false);
  const [progress, setProgress] = useState(0);
  const [uploading, setUploading] = useState(false);
  const [localFileName, setLocalFileName] = useState("");

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const startUploadSimulation = (name: string) => {
    setUploading(true);
    setProgress(0);
    setLocalFileName(name);

    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          setUploading(false);
          onUploadSuccess(name);
          return 100;
        }
        return prev + 10;
      });
    }, 150);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      startUploadSimulation(file.name);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      startUploadSimulation(file.name);
    }
  };

  const triggerInputClick = () => {
    fileInputRef.current?.click();
  };

  const displayFileName = propFileName || localFileName || `${title.toLowerCase().replace(/\s+/g, "_")}.pdf`;

  // Status mapping
  const badgeVariants = {
    not_uploaded: "neutral" as const,
    uploaded: "primary" as const,
    processing: "secondary" as const,
    approved: "success" as const,
    rejected: "error" as const,
    needs_reupload: "warning" as const,
  };

  const badgeLabels = {
    not_uploaded: "Not Uploaded",
    uploaded: "Uploaded",
    processing: "Processing",
    approved: "Approved",
    rejected: "Rejected",
    needs_reupload: "Needs Re-upload",
  };

  return (
    <div className="flex flex-col gap-2 w-full">
      <div
        onDragEnter={handleDrag}
        onDragOver={handleDrag}
        onDragLeave={handleDrag}
        onDrop={handleDrop}
        className={cn(
          "relative min-h-[132px] min-w-0 border border-dashed rounded-xl p-5 flex flex-col items-center justify-center text-center transition-all bg-white/[0.01]",
          dragActive
            ? "border-[#10B981] bg-[#10B981]/5 scale-[1.01]"
            : "border-white/10 hover:border-white/20",
          status === "approved" && "border-[#22C55E]/30 bg-[#22C55E]/2",
          status === "rejected" && "border-[#EF4444]/30 bg-[#EF4444]/2",
          (status === "uploaded" || status === "processing") && "border-[#10B981]/30 bg-[#10B981]/2",
          uploading && "pointer-events-none"
        )}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept={accept}
          onChange={handleFileChange}
          className="hidden"
        />

        {/* Top Badge */}
        <div className="absolute top-3.5 right-3.5">
          <Badge variant={badgeVariants[status]}>
            {badgeLabels[status]}
          </Badge>
        </div>

        {/* Main Interface States */}
        {uploading ? (
          <div className="w-full min-w-0 py-4 flex flex-col items-center justify-center">
            <RefreshCw className="h-8 w-8 text-[#10B981] animate-spin mb-3" />
            <p className="w-full max-w-full truncate px-2 text-xs text-[#94A3B8] font-semibold mb-1">
              Uploading {localFileName}...
            </p>
            <div className="w-full max-w-48 bg-white/5 rounded-full h-1.5 overflow-hidden">
              <div
                className="bg-gradient-to-r from-[#10B981] to-[#059669] h-1.5 rounded-full transition-all duration-150"
                style={{ width: `${progress}%` }}
              />
            </div>
            <span className="text-[10px] text-[#94A3B8]/60 mt-1">{progress}%</span>
          </div>
        ) : status === "not_uploaded" || status === "needs_reupload" ? (
          <div className="flex max-w-full flex-col items-center cursor-pointer py-3" onClick={triggerInputClick}>
            <UploadCloud className="h-8 w-8 text-[#94A3B8] mb-2.5 hover:text-[#10B981] transition-colors" />
            <p className="max-w-full text-sm text-[#F8FAFC] font-semibold leading-snug">
              Drag & drop document or <span className="text-[#10B981] hover:underline">browse</span>
            </p>
            <p className="max-w-full text-xs text-[#94A3B8]/60 mt-1 leading-snug">
              Supports PDF, PNG, JPG (Max {maxSizeMB}MB)
            </p>
          </div>
        ) : (
          /* File Preview State */
          <div className="w-full min-w-0 flex items-center justify-between gap-3 pt-8 pb-1 text-left">
            <div className="flex min-w-0 flex-1 items-center gap-3">
              <div className={cn(
                "shrink-0 p-2.5 rounded-lg",
                status === "approved" ? "bg-[#22C55E]/10 text-[#22C55E]" :
                status === "rejected" ? "bg-[#EF4444]/10 text-[#EF4444]" : "bg-[#10B981]/10 text-[#10B981]"
              )}>
                <File className="h-5 w-5" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="max-w-full truncate text-sm font-semibold text-[#F8FAFC]">
                  {displayFileName}
                </p>
                <p className="flex max-w-full min-w-0 items-center gap-1 truncate text-xs text-[#94A3B8]/60">
                  {status === "approved" && (
                    <span className="flex min-w-0 items-center gap-0.5 truncate text-[#22C55E]">
                      <CheckCircle2 className="h-3 w-3" /> Auto-verified
                    </span>
                  )}
                  {status === "processing" && "Verifying signatures..."}
                  {status === "uploaded" && "Ready for submission"}
                  {status === "rejected" && "Verification failed"}
                </p>
              </div>
            </div>

            {/* Actions */}
            <div className="flex shrink-0 items-center gap-1">
              <button
                onClick={triggerInputClick}
                title="Replace File"
                className="text-[#94A3B8] hover:text-[#10B981] p-1.5 rounded-lg hover:bg-white/5 transition-colors cursor-pointer"
              >
                <RefreshCw className="h-4 w-4" />
              </button>
              <button
                onClick={() => {
                  setLocalFileName("");
                  onDelete();
                }}
                title="Delete File"
                className="text-[#94A3B8] hover:text-[#EF4444] p-1.5 rounded-lg hover:bg-white/5 transition-colors cursor-pointer"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Rejection Reason Warning */}
      {status === "rejected" && rejectionReason && (
        <div className="flex items-start gap-2 bg-[#EF4444]/5 border border-[#EF4444]/10 rounded-lg p-3 text-xs text-[#EF4444] leading-relaxed">
          <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
          <div>
            <span className="font-semibold">Reason:</span> {rejectionReason}
          </div>
        </div>
      )}
    </div>
  );
}
