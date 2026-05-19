import React from "react";
import { cn } from "../../lib/utils";

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  helperText?: string;
  options: { value: string; label: string }[];
}

export function Select({
  className,
  label,
  error,
  helperText,
  options,
  id,
  ...props
}: SelectProps) {
  return (
    <div className="flex flex-col gap-1.5 w-full">
      {label && (
        <label htmlFor={id} className="text-xs font-semibold text-[#94A3B8] tracking-wider uppercase">
          {label}
        </label>
      )}
      <div className="relative flex items-center">
        <select
          id={id}
          className={cn(
            "w-full bg-[#070B14] border border-white/10 rounded-lg px-3.5 py-2.5 text-sm text-[#F8FAFC] placeholder-[#94A3B8]/40 focus:outline-none focus:border-[#10B981] focus:ring-1 focus:ring-[#10B981] transition-all appearance-none disabled:opacity-50 disabled:pointer-events-none cursor-pointer",
            error && "border-[#EF4444] focus:border-[#EF4444] focus:ring-[#EF4444]",
            className
          )}
          {...props}
        >
          {options.map((option) => (
            <option key={option.value} value={option.value} className="bg-[#0B1020] text-[#F8FAFC]">
              {option.label}
            </option>
          ))}
        </select>
        <div className="absolute right-3.5 pointer-events-none text-[#94A3B8]">
          <svg
            className="h-4 w-4"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M19 9l-7 7-7-7"
            />
          </svg>
        </div>
      </div>
      {error ? (
        <span className="text-xs text-[#EF4444] mt-0.5">{error}</span>
      ) : helperText ? (
        <span className="text-xs text-[#94A3B8]/60 mt-0.5">{helperText}</span>
      ) : null}
    </div>
  );
}
