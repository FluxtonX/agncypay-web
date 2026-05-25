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
    primary: "bg-white text-black border-white",
    secondary: "bg-[#111] text-white border-[#555]",
    success: "bg-white text-black border-white",
    warning: "bg-[#111] text-white border-[#555]",
    error: "bg-[#111] text-white border-[#555]",
    info: "bg-[#111] text-white border-[#555]",
    neutral: "bg-white/5 text-[#cfcfcf] border-white/10",
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
