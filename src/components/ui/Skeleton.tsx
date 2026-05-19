import React from "react";
import { cn } from "../../lib/utils";

interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "text" | "rectangular" | "circular" | "card" | "table-row";
}

export function Skeleton({
  className,
  variant = "rectangular",
  ...props
}: SkeletonProps) {
  const baseClass = "animate-shimmer bg-white/[0.02] rounded-md";

  const styles = {
    text: "h-4 w-3/4 my-1",
    rectangular: "h-12 w-full",
    circular: "h-12 w-12 rounded-full",
    card: "h-36 w-full rounded-xl border border-white/[0.04]",
    "table-row": "h-14 w-full rounded-none border-b border-white/[0.04]",
  };

  return (
    <div
      className={cn(baseClass, styles[variant], className)}
      {...props}
    />
  );
}

export function CardSkeleton() {
  return (
    <Skeleton variant="card" className="p-5 flex flex-col justify-between">
      <div className="space-y-3">
        <Skeleton variant="text" className="w-1/3 h-5" />
        <Skeleton variant="text" className="w-2/3 h-4" />
      </div>
      <div className="flex justify-between items-center mt-4">
        <Skeleton variant="text" className="w-1/4 h-6" />
        <Skeleton variant="circular" className="h-7 w-7" />
      </div>
    </Skeleton>
  );
}

export function TableRowSkeleton() {
  return (
    <div className="flex items-center justify-between border-b border-white/[0.04] py-4 px-6 animate-pulse">
      <div className="flex items-center gap-3 w-1/4">
        <div className="h-8 w-8 rounded-full bg-white/[0.04]" />
        <div className="h-4 w-24 bg-white/[0.04] rounded" />
      </div>
      <div className="h-4 w-20 bg-white/[0.04] rounded w-1/6" />
      <div className="h-4 w-20 bg-white/[0.04] rounded w-1/6" />
      <div className="h-6 w-16 bg-white/[0.04] rounded-full w-1/8" />
      <div className="h-8 w-20 bg-white/[0.04] rounded w-1/8" />
    </div>
  );
}
