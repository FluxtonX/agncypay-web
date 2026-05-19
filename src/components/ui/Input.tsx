import React from "react";
import { cn } from "../../lib/utils";

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export function Input({
  className,
  label,
  error,
  helperText,
  leftIcon,
  rightIcon,
  id,
  type = "text",
  ...props
}: InputProps) {
  return (
    <div className="flex flex-col gap-1.5 w-full">
      {label && (
        <label htmlFor={id} className="text-xs font-semibold text-[#94A3B8] tracking-wider uppercase">
          {label}
        </label>
      )}
      <div className="relative flex items-center">
        {leftIcon && (
          <div className="absolute left-3.5 text-[#94A3B8] pointer-events-none">
            {leftIcon}
          </div>
        )}
        <input
          id={id}
          type={type}
          className={cn(
            "w-full bg-white/[0.02] border border-white/10 rounded-lg px-3.5 py-2.5 text-sm text-[#F8FAFC] placeholder-[#94A3B8]/40 focus:outline-none focus:border-[#10B981] focus:ring-1 focus:ring-[#10B981] focus:bg-white/[0.04] transition-all disabled:opacity-50 disabled:pointer-events-none",
            leftIcon ? "pl-10" : "",
            rightIcon ? "pr-10" : "",
            error ? "border-[#EF4444] focus:border-[#EF4444] focus:ring-[#EF4444]" : "",
            className
          )}
          {...props}
        />
        {rightIcon && (
          <div className="absolute right-3.5 text-[#94A3B8]">
            {rightIcon}
          </div>
        )}
      </div>
      {error ? (
        <span className="text-xs text-[#EF4444] mt-0.5">{error}</span>
      ) : helperText ? (
        <span className="text-xs text-[#94A3B8]/60 mt-0.5">{helperText}</span>
      ) : null}
    </div>
  );
}
