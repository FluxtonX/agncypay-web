import React from "react";
import { cn } from "../../lib/utils";

interface StatCardProps {
  title: string;
  value: string | number;
  description?: string;
  icon?: React.ReactNode;
  trend?: {
    value: string;
    isPositive: boolean;
  };
  className?: string;
}

export function StatCard({
  title,
  value,
  description,
  icon,
  trend,
  className,
}: StatCardProps) {
  return (
    <div
      className={cn(
        "rounded-xl border border-[#1F1F1F] bg-[#0A0A0A] p-5 flex flex-col justify-between min-h-[120px]",
        className
      )}
    >
      <div className="flex justify-between items-start">
        <span className="text-[11px] font-semibold text-[#6B7280] uppercase tracking-wider">
          {title}
        </span>
        {icon && (
          <div className="p-2 rounded-lg bg-[#111] border border-[#1F1F1F] text-[#6B7280] shrink-0">
            {icon}
          </div>
        )}
      </div>
      <div>
        <h3 className="text-2xl font-bold text-white tracking-tight mt-3">{value}</h3>
        {(description || trend) && (
          <div className="flex items-center gap-1.5 mt-1.5 text-[11px]">
            {trend && (
              <span className={cn("font-semibold", trend.isPositive ? "text-[#22C55E]" : "text-[#EF4444]")}>
                {trend.value}
              </span>
            )}
            {description && (
              <span className="text-[#4B5563] truncate">{description}</span>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
