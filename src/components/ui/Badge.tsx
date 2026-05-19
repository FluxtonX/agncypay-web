import React from "react";
import { cn } from "../../lib/utils";

interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: "primary" | "secondary" | "success" | "warning" | "error" | "info" | "neutral";
  size?: "sm" | "md";
}

export function Badge({
  className,
  variant = "neutral",
  size = "sm",
  children,
  ...props
}: BadgeProps) {
  const baseStyles =
    "inline-flex items-center gap-1.5 font-medium rounded-full border tracking-wide whitespace-nowrap";
  
  const variants = {
    primary: "bg-[#10B981]/10 text-[#10B981] border-[#10B981]/20 shadow-[0_0_10px_rgba(139,92,246,0.05)]",
    secondary: "bg-[#06B6D4]/10 text-[#06B6D4] border-[#06B6D4]/20 shadow-[0_0_10px_rgba(6,182,212,0.05)]",
    success: "bg-[#22C55E]/10 text-[#22C55E] border-[#22C55E]/20 shadow-[0_0_10px_rgba(34,197,94,0.05)]",
    warning: "bg-[#F59E0B]/10 text-[#F59E0B] border-[#F59E0B]/20 shadow-[0_0_10px_rgba(245,158,11,0.05)]",
    error: "bg-[#EF4444]/10 text-[#EF4444] border-[#EF4444]/20 shadow-[0_0_10px_rgba(239,68,68,0.05)]",
    info: "bg-blue-500/10 text-blue-400 border-blue-500/20",
    neutral: "bg-white/5 text-[#94A3B8] border-white/10",
  };

  const sizes = {
    sm: "px-2 py-0.5 text-[10px]",
    md: "px-2.5 py-1 text-xs",
  };

  return (
    <span className={cn(baseStyles, variants[variant], sizes[size], className)} {...props}>
      {children}
    </span>
  );
}
