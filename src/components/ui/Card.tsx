import React from "react";
import { cn } from "../../lib/utils";

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  hoverable?: boolean;
}

export const Card = React.forwardRef<HTMLDivElement, CardProps>(
  ({ className, hoverable = false, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          // Visible border with subtle light-ray shadow underneath
          "rounded-xl border border-[#3a3a3a] bg-[#0D0D0D]",
          "shadow-[0_0_0_1px_rgba(255,255,255,0.04),0_4px_24px_-4px_rgba(0,0,0,0.6),0_1px_4px_rgba(255,255,255,0.03)]",
          hoverable &&
            "transition-all duration-300 cursor-pointer hover:border-white/[0.25] hover:bg-[#111] hover:shadow-[0_0_0_1px_rgba(255,255,255,0.06),0_8px_32px_-4px_rgba(0,0,0,0.7),0_0_16px_rgba(255,255,255,0.03)] hover:-translate-y-0.5",
          className
        )}
        {...props}
      />
    );
  }
);

Card.displayName = "Card";
export default Card;
