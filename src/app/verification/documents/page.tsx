"use client";

import React, { useRef } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, ArrowRight, Upload } from "lucide-react";
import { useApp } from "../../../context/AppContext";

const DOCUMENTS = [
  {
    id: "doc-01",
    title: "Certificate of Incorporation",
    description: "Official business formation document",
  },
  {
    id: "doc-05",
    title: "Bank Account verification Letter",
    description: "Voided check or bank statement",
  },
  {
    id: "doc-06",
    title: "Authorized Representative ID",
    description: "Government-issued photo ID",
  },
];

export default function DocumentsStepPage() {
  const router = useRouter();
  const { uploadDocument } = useApp();

  const handleContinue = () => {
    DOCUMENTS.forEach((doc) => {
      uploadDocument(doc.id, {
        status: "uploaded",
        fileName: `${doc.title.toLowerCase().replace(/\s+/g, "_")}.pdf`,
      });
    });
    router.push("/verification/bank-details");
  };

  return (
    <form
      onSubmit={(event) => {
        event.preventDefault();
        handleContinue();
      }}
      className="mx-auto w-full max-w-[858px] pb-12 pt-8 sm:pb-14 sm:pt-10 lg:pb-16 lg:pt-12 xl:pt-[52px]"
    >
      <div className="mb-8 flex flex-col items-start justify-between gap-5 sm:mb-10 sm:flex-row sm:gap-8">
        <div>
          <h1 className="text-[28px] font-bold leading-[1.08] tracking-normal text-white sm:text-[32px] lg:text-[34px]">
            Document Upload
          </h1>
          <p className="mt-3 text-[17px] font-normal leading-snug text-[#A0A0A0] sm:mt-[15px] sm:text-[20px] lg:text-[21px]">
            Upload required business documents
          </p>
        </div>

        <button
          type="button"
          onClick={() => router.push("/dashboard")}
          className="h-10 w-[142px] rounded-[7px] bg-white text-[15px] font-semibold text-black transition-colors hover:bg-[#EDEDED] sm:mt-[-5px] sm:h-11 sm:w-[150px] sm:text-[16px]"
        >
          Skip For Now
        </button>
      </div>

      <div className="space-y-10">
        {DOCUMENTS.map((document) => (
          <DocumentUploadCard key={document.id} document={document} />
        ))}
      </div>

      <div className="mt-8 flex items-center justify-between gap-4 sm:mt-10">
        <button
          type="button"
          onClick={() => router.push("/verification/authorization")}
          className="flex h-11 w-[112px] items-center justify-center gap-2 rounded-[7px] border border-[#5E5E5E] bg-black text-[15px] font-semibold text-[#8C8C8C] transition-colors hover:border-[#8A8A8A] hover:text-white sm:w-[120px] sm:gap-[13px] sm:text-[16px]"
        >
          <ArrowLeft className="h-5 w-5" strokeWidth={2} />
          Back
        </button>

        <button
          type="submit"
          className="flex h-11 w-[170px] items-center justify-center gap-3 rounded-[7px] bg-white text-[15px] font-semibold text-black transition-colors hover:bg-[#EDEDED] sm:w-[200px] sm:gap-[17px] sm:text-[16px]"
        >
          Continue
          <ArrowRight className="h-5 w-5" strokeWidth={2.25} />
        </button>
      </div>
    </form>
  );
}

interface DocumentUploadCardProps {
  document: {
    id: string;
    title: string;
    description: string;
  };
}

function DocumentUploadCard({ document }: DocumentUploadCardProps) {
  const inputRef = useRef<HTMLInputElement | null>(null);

  return (
    <section className="rounded-[8px] border border-[#565656] bg-black px-5 py-7 shadow-[0_18px_60px_rgba(0,0,0,0.28)] sm:px-[30px] sm:py-[34px]">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
        <h2 className="text-[25px] font-bold leading-tight text-white sm:text-[30px]">
          {document.title}
        </h2>
        <span className="inline-flex h-6 w-[88px] items-center justify-center rounded-[5px] border border-[#7A7A7A] text-[12px] font-medium text-white sm:ml-2">
          Required
        </span>
      </div>

      <p className="mt-[10px] text-[17px] font-normal leading-none text-[#9E9E9E] sm:text-[18px]">
        {document.description}
      </p>

      <div className="mt-[23px] flex flex-col gap-3 sm:flex-row sm:items-center">
        <input ref={inputRef} type="file" className="hidden" />
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          className="flex h-[38px] w-[155px] items-center justify-center gap-[12px] rounded-[7px] border border-[#565656] bg-black text-[16px] font-semibold text-white transition-colors hover:border-[#8A8A8A]"
        >
          <Upload className="h-[18px] w-[18px]" strokeWidth={2} />
          Upload File
        </button>
        <span className="text-[16px] font-normal leading-none text-[#6B6B6B] sm:text-[17px]">
          PDF, PNG, or JPEG (max 10MB)
        </span>
      </div>
    </section>
  );
}
