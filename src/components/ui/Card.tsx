"use client";

import React from "react";
import { motion } from "framer-motion";
import { cn } from "../../lib/utils";

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  hoverEffect?: boolean;
  animate?: boolean;
  delay?: number;
}

export function Card({
  className,
  hoverEffect = false,
  animate = false,
  delay = 0,
  children,
  ...props
}: CardProps) {
  const baseStyles = "glass-panel rounded-xl p-5 overflow-hidden relative";
  const hoverStyles = hoverEffect ? "glass-panel-hover" : "";

  if (animate) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1], delay }}
        className={cn(baseStyles, hoverStyles, className)}
        {...(props as any)}
      >
        {children}
      </motion.div>
    );
  }

  return (
    <div className={cn(baseStyles, hoverStyles, className)} {...props}>
      {children}
    </div>
  );
}
