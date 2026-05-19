import React from "react";
import { cn } from "../../lib/utils";

interface LoaderProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "spinner" | "dots" | "pulse";
  size?: "sm" | "md" | "lg";
  color?: "primary" | "secondary" | "white";
}

export function Loader({
  className,
  variant = "spinner",
  size = "md",
  color = "primary",
  ...props
}: LoaderProps) {
  const sizeClasses = {
    sm: "h-4 w-4 stroke-[3px]",
    md: "h-8 w-8 stroke-[2px]",
    lg: "h-12 w-12 stroke-[1.5px]",
  };

  const colorClasses = {
    primary: "text-[#10B981]",
    secondary: "text-[#06B6D4]",
    white: "text-white",
  };

  if (variant === "dots") {
    const dotSizes = {
      sm: "h-1.5 w-1.5",
      md: "h-2.5 w-2.5",
      lg: "h-3.5 w-3.5",
    };
    return (
      <div className={cn("flex items-center gap-1.5 justify-center", className)} {...props}>
        <div className={cn("rounded-full animate-bounce delay-100", dotSizes[size], color === "primary" ? "bg-[#10B981]" : color === "secondary" ? "bg-[#06B6D4]" : "bg-white")} />
        <div className={cn("rounded-full animate-bounce delay-200", dotSizes[size], color === "primary" ? "bg-[#10B981]" : color === "secondary" ? "bg-[#06B6D4]" : "bg-white")} />
        <div className={cn("rounded-full animate-bounce delay-300", dotSizes[size], color === "primary" ? "bg-[#10B981]" : color === "secondary" ? "bg-[#06B6D4]" : "bg-white")} />
      </div>
    );
  }

  if (variant === "pulse") {
    return (
      <div
        className={cn(
          "rounded-full animate-ping opacity-75",
          size === "sm" ? "h-3 w-3" : size === "md" ? "h-6 w-6" : "h-10 w-10",
          color === "primary" ? "bg-[#10B981]" : color === "secondary" ? "bg-[#06B6D4]" : "bg-white",
          className
        )}
        {...props}
      />
    );
  }

  return (
    <div className={cn("inline-flex items-center justify-center", className)} {...props}>
      <svg
        className={cn("animate-spin", sizeClasses[size], colorClasses[color])}
        fill="none"
        viewBox="0 0 24 24"
      >
        <circle
          className="opacity-10"
          cx="12"
          cy="12"
          r="10"
          stroke="currentColor"
          strokeWidth="4"
        />
        <path
          className="opacity-90"
          fill="currentColor"
          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
        />
      </svg>
    </div>
  );
}
