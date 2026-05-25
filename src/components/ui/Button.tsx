"use client";

import React from "react";
import { motion } from "framer-motion";
import { cn } from "../../lib/utils";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "outline" | "ghost" | "danger" | "success";
  size?: "sm" | "md" | "lg";
  isLoading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export function Button({
  className,
  variant = "primary",
  size = "md",
  isLoading = false,
  leftIcon,
  rightIcon,
  children,
  disabled,
  ...props
}: ButtonProps) {
  const baseStyles =
    "relative inline-flex items-center justify-center font-medium rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-[#050816] disabled:opacity-50 disabled:pointer-events-none cursor-pointer";
  
  const variants = {
    primary:
      "bg-white text-black hover:bg-[#E5E7EB] focus:ring-white border border-transparent font-bold shadow-[0_0_15px_rgba(255,255,255,0.1)]",
    secondary:
      "bg-white text-black hover:bg-[#E5E7EB] focus:ring-white border border-transparent font-bold shadow-[0_0_15px_rgba(255,255,255,0.1)]",
    outline:
      "bg-white/[0.02] text-[#F8FAFC] border border-white/10 hover:bg-white/[0.08] hover:border-white/20 focus:ring-white/20",
    ghost:
      "bg-transparent text-[#94A3B8] hover:bg-white/[0.04] hover:text-[#F8FAFC] focus:ring-white/10",
    danger:
      "bg-[#171717] text-white hover:bg-[#222] focus:ring-white/20 border border-[#4a4a4a]",
    success:
      "bg-white text-black hover:bg-[#E5E7EB] focus:ring-white border border-transparent font-bold",
  };

  const sizes = {
    sm: "px-3 py-1.5 text-xs",
    md: "px-4 py-2.5 text-sm",
    lg: "px-6 py-3.5 text-base",
  };

  return (
    <motion.button
      whileHover={{ scale: disabled || isLoading ? 1 : 1.015 }}
      whileTap={{ scale: disabled || isLoading ? 1 : 0.985 }}
      disabled={disabled || isLoading}
      className={cn(baseStyles, variants[variant], sizes[size], className)}
      {...(props as any)}
    >
      {isLoading && (
        <svg
          className="animate-spin -ml-1 mr-2.5 h-4 w-4 text-current"
          fill="none"
          viewBox="0 0 24 24"
        >
          <circle
            className="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="4"
          />
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
          />
        </svg>
      )}
      {!isLoading && leftIcon && <span className="mr-2 inline-flex">{leftIcon}</span>}
      <span className={cn(isLoading && "opacity-80")}>{children}</span>
      {!isLoading && rightIcon && <span className="ml-2 inline-flex">{rightIcon}</span>}
    </motion.button>
  );
}
