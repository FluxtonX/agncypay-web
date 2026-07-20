import React from "react";
import { cn } from "../../lib/utils";

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: "primary" | "secondary" | "success" | "warning" | "error" | "info" | "neutral";
  size?: "sm" | "md";
}

export const Badge = React.forwardRef<HTMLSpanElement, BadgeProps>(
  ({ className, variant = "neutral", size = "sm", ...props }, ref) => {
    return (
      <span
        ref={ref}
        className={cn(
          "inline-flex items-center gap-1.5 font-semibold rounded-md border tracking-wide whitespace-nowrap",
          
          // Variants
          variant === "primary" && "bg-white text-black border-white",
          variant === "secondary" && "bg-neutral-900 text-white border-neutral-700",
          variant === "success" && "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
          variant === "warning" && "bg-amber-500/10 text-amber-400 border-amber-500/20",
          variant === "error" && "bg-red-500/10 text-red-400 border-red-500/20",
          variant === "info" && "bg-blue-500/10 text-blue-400 border-blue-500/20",
          variant === "neutral" && "bg-neutral-800 text-neutral-400 border-neutral-700",

          // Sizes
          size === "sm" ? "px-2 py-0.5 text-[10px]" : "px-2.5 py-1 text-xs",
          
          className
        )}
        {...props}
      />
    );
  }
);

Badge.displayName = "Badge";
export default Badge;
