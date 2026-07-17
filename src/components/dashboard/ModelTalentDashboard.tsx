import React, { useState } from "react";
import Link from "next/link";
import { ChevronRight, EllipsisVertical, Search, UploadCloud, X, ArrowUpRight } from "lucide-react";
import { cn } from "../../lib/utils";

const modelIncomeItems = [
  {
    slug: "nike",
    name: "Nike",
    detail: "Q3 Campaign revenue",
    date: "Today, 10:24 AM",
    amount: "$3,040.00",
    src: "https://cdn.simpleicons.org/nike/FFFFFF",
    fallback: "Nike",
    className: "bg-black text-white",
    imageClassName: "scale-[0.82] invert",
  },
  {
    slug: "louis-vuitton",
    name: "Louis Vuitton",
    detail: "Paris Fashion Week",
    date: "Today, 9:42 AM",
    amount: "$9,805.25",
    src: "/lv.png",
    fallback: "LV",
    className: "bg-[#3d3229]",
    imageClassName: "scale-[1.1]",
  },
  {
    slug: "caa",
    name: "Creative Artists Agency",
    detail: "Talent split",
    date: "Yesterday",
    amount: "$3,500.00",
    src: "https://upload.wikimedia.org/wikipedia/commons/e/e0/CAA_Logo.svg",
    fallback: "CAA",
    className: "bg-white",
    imageClassName: "scale-[0.9]",
  },
  {
    slug: "photogenics",
    name: "PHOTOGENICS",
    detail: "Q3 Campaign revenue",
    date: "May 31",
    amount: "$2,600.00",
    src: "/photogenics.png",
    fallback: "PH",
    className: "bg-black",
    imageClassName: "scale-[0.8]",
  },
  {
    slug: "the-north-face",
    name: "The North Face",
    detail: "Winter Editorial",
    date: "May 24",
    amount: "$1,800.00",
    src: "https://cdn.simpleicons.org/thenorthface/FFFFFF",
    fallback: "TNF",
    className: "bg-[#e51d26]",
    imageClassName: "scale-[0.7]",
  },
];

const modelPayoutItems = [
  {
    slug: "amy-james",
    name: "Amy James",
    detail: "Q3 Campaign split",
    date: "Today, 10:24 AM",
    amount: "$3,040.00",
    src: "https://i.pravatar.cc/150?u=amy",
    fallback: "AJ",
  },
  {
    slug: "jessica-love",
    name: "Jessica Love",
    detail: "Paris Fashion Week",
    date: "Today, 9:42 AM",
    amount: "$9,805.25",
    src: "https://i.pravatar.cc/150?u=jessica",
    fallback: "JL",
  },
  {
    slug: "lola-apple",
    name: "Lola Apple",
    detail: "Talent split",
    date: "Yesterday",
    amount: "$3,500.00",
    src: "https://i.pravatar.cc/150?u=lola",
    fallback: "LA",
  },
  {
    slug: "img-models",
    name: "IMG Models",
    detail: "Agency cut",
    date: "May 31",
    amount: "$2,600.00",
    src: "https://upload.wikimedia.org/wikipedia/commons/9/91/IMG_Models_logo.svg",
    fallback: "IMG",
    isAgency: true,
  },
  {
    slug: "uta",
    name: "United Talent Agency",
    detail: "Agency cut",
    date: "May 24",
    amount: "$1,800.00",
    src: "https://upload.wikimedia.org/wikipedia/en/2/2d/United_Talent_Agency_logo.png",
    fallback: "UTA",
    isAgency: true,
  },
];

function RemoteBrandImage({ src, alt, fallback, className, imageClassName }: any) {
  const [failed, setFailed] = useState(false);
  return (
    <div className={cn("relative overflow-hidden", className)}>
      {failed || !src ? (
        <div className="flex h-full w-full items-center justify-center rounded-[inherit] border border-[#3f3f3f] bg-white px-1 text-center text-[10px] font-semibold leading-[1.05] text-black">
          <span className="block max-w-full truncate">{fallback}</span>
        </div>
      ) : (
        <img
          src={src}
          alt={alt}
          onError={() => setFailed(true)}
          className={cn("h-full w-full object-contain", imageClassName)}
          referrerPolicy="no-referrer"
          loading="lazy"
        />
      )}
    </div>
  );
}

function Panel({ children, className }: { children: React.ReactNode; className?: string }) {
  return <section className={cn("rounded-[13px] border border-[#3a3a3a] bg-[#050505]", className)}>{children}</section>;
}

export function ModelTalentDashboard() {
  const [isUploading, setIsUploading] = useState(false);
  
  return (
    <div className="w-full max-w-[1520px]">
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-[34px] font-semibold leading-none text-white">Model & Talent Hub</h1>
          <p className="mt-[10px] text-[16px] leading-6 text-[#939393]">
            Track income, manage splits, and ingest your paystubs.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-5 xl:grid-cols-[minmax(0,1.15fr)_minmax(360px,0.85fr)]">
        <div className="space-y-5">
          {/* Recent Income Panel */}
          <Panel className="p-4 sm:p-5">
            <div className="flex items-center justify-between gap-4">
              <div>
                <h2 className="text-[18px] font-semibold text-white">Recent Income</h2>
                <p className="mt-1 text-[13px] text-[#8f8f8f]">Money received from Brands and other agencies.</p>
              </div>
              <Link
                href="/dashboard/payments"
                className="inline-flex items-center gap-2 rounded-[7px] border border-[#333] bg-[#0b0b0b] px-3 py-2 text-[12px] font-semibold text-white hover:border-[#555]"
              >
                View All
                <ChevronRight className="h-4 w-4" />
              </Link>
            </div>
            <div className="mt-4 space-y-2">
              {modelIncomeItems.map((item) => (
                <div
                  key={`${item.name}-${item.date}`}
                  className="flex items-center gap-3 rounded-[8px] border border-[#333] bg-black px-3 py-2 transition-colors hover:border-[#555] hover:bg-white/[0.04]"
                >
                  <div className={cn("flex h-12 w-12 shrink-0 items-center justify-center rounded-[10px] border border-[#303030] bg-[#060606] p-[3px]")}>
                    <div className={cn("h-full w-full overflow-hidden rounded-[8px]", item.className)}>
                      <RemoteBrandImage src={item.src} alt={item.name} fallback={item.fallback} className="h-full w-full" imageClassName={item.imageClassName} />
                    </div>
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-[13px] font-semibold text-white">{item.name}</p>
                    <p className="truncate text-[11px] text-[#7f7f7f]">{item.detail}</p>
                  </div>
                  <div className="hidden text-right text-[11px] text-[#7f7f7f] sm:block">{item.date}</div>
                  <div className="min-w-[92px] text-right text-[13px] font-semibold text-white">{item.amount}</div>
                  <button className="flex h-8 w-8 items-center justify-center rounded-full text-[#7f7f7f] hover:text-white">
                    <EllipsisVertical className="h-4 w-4" />
                  </button>
                </div>
              ))}
            </div>
          </Panel>
        </div>

        <div className="space-y-5">
          {/* CSV Dropzone Panel */}
          <Panel className="p-4 sm:p-5 flex flex-col items-center justify-center border-dashed border-[#555] bg-[#0A0A0A] transition-colors hover:border-[#777]">
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-[#1A1A1A] text-white mb-4">
              <UploadCloud className="h-7 w-7" />
            </div>
            <h3 className="text-[18px] font-semibold text-white">Manual Data Ingestion</h3>
            <p className="mt-2 text-center text-[13px] leading-5 text-[#8f8f8f] max-w-[280px]">
              Drag & Drop your Paystub, CSV, or PDF file here to parse and split income automatically.
            </p>
            <button className="mt-5 h-10 rounded-lg bg-white px-5 text-[13px] font-semibold text-black hover:bg-gray-200">
              Browse Files
            </button>
          </Panel>

          {/* Analytics Overview Snapshot */}
          <Panel className="p-4 sm:p-5">
            <h2 className="text-[18px] font-semibold text-white">Total Income & Splits</h2>
            <div className="mt-5 grid grid-cols-2 gap-3">
              <div className="rounded-[8px] border border-[#2f2f2f] bg-black px-4 py-4">
                <p className="text-[11px] font-semibold text-[#777]">Total Received (2026)</p>
                <p className="mt-2 truncate text-[22px] font-black text-[#13d463]">$1,245,000</p>
              </div>
              <div className="rounded-[8px] border border-[#2f2f2f] bg-black px-4 py-4">
                <p className="text-[11px] font-semibold text-[#777]">Management Cut (10%)</p>
                <p className="mt-2 truncate text-[22px] font-black text-white">$124,500</p>
              </div>
            </div>
          </Panel>
        </div>
      </div>
    </div>
  );
}
