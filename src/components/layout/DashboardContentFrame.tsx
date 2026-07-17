"use client";

import React, { useEffect, useState } from "react";
import { usePathname } from "next/navigation";

interface DashboardContentFrameProps {
  children: React.ReactNode;
}

function SkeletonBlock({ className }: { className: string }) {
  return <div className={`animate-shimmer rounded-[8px] bg-[#111] ${className}`} />;
}

export function DashboardDataSkeleton() {
  return (
    <div className="w-full max-w-[1048px]">
      <SkeletonBlock className="h-[38px] w-[220px]" />
      <SkeletonBlock className="mt-[18px] h-[22px] w-[420px] max-w-full" />

      <div className="mt-[31px] grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4 xl:gap-[29px]">
        {[0, 1, 2, 3].map((item) => (
          <div
            key={item}
            className="h-[135px] rounded-[13px] border border-[#242424] bg-black p-4"
          >
            <SkeletonBlock className="h-[20px] w-[68%]" />
            <SkeletonBlock className="mt-[24px] h-[35px] w-[45%]" />
            <SkeletonBlock className="mt-[24px] h-[17px] w-[58%]" />
          </div>
        ))}
      </div>

      <div className="mt-[29px] rounded-[13px] border border-[#242424] bg-black p-[29px]">
        <div className="flex items-center justify-between gap-4">
          <SkeletonBlock className="h-[30px] w-[210px]" />
          <SkeletonBlock className="h-[38px] w-[118px]" />
        </div>
        <div className="mt-[32px] space-y-[14px]">
          {[0, 1, 2, 3, 4, 5].map((row) => (
            <SkeletonBlock key={row} className="h-[44px] w-full" />
          ))}
        </div>
      </div>
    </div>
  );
}

export function DashboardContentFrame({ children }: DashboardContentFrameProps) {
  const pathname = usePathname();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setIsLoading(true);
    const timeout = window.setTimeout(() => {
      setIsLoading(false);
    }, 360);

    return () => window.clearTimeout(timeout);
  }, [pathname]);

  return (
    <div className="relative min-h-full">
      {isLoading && (
        <div className="pointer-events-none absolute inset-x-0 top-[-44px] z-20 h-[2px] overflow-hidden bg-[#111]">
          <div className="h-full w-1/3 animate-[dashboard-progress_0.9s_ease-in-out_infinite] bg-white" />
        </div>
      )}
      {isLoading ? <DashboardDataSkeleton /> : children}
    </div>
  );
}
