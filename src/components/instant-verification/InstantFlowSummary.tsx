"use client";

import { Building2, Check, CreditCard, ShieldCheck, UserRound } from "lucide-react";
import { cn } from "../../lib/utils";

interface InstantFlowSummaryProps {
  activeStep: "signup" | "bank";
}

const FLOW_ITEMS = [
  {
    id: "signup",
    label: "Simple signup",
    detail: "Name, email, and company",
    icon: UserRound,
  },
  {
    id: "bank",
    label: "Plaid bank connection",
    detail: "Ownership and account signals",
    icon: CreditCard,
  },
  {
    id: "kyb",
    label: "Middesk KYB",
    detail: "Business registration data",
    icon: Building2,
  },
  {
    id: "risk",
    label: "Risk screening",
    detail: "Fraud and device checks",
    icon: ShieldCheck,
  },
];

export function InstantFlowSummary({ activeStep }: InstantFlowSummaryProps) {
  const activeIndex = activeStep === "signup" ? 0 : 1;

  return (
    <div className="rounded-[8px] border border-[#343434] bg-[#080808] p-5 shadow-[0_18px_60px_rgba(0,0,0,0.28)]">
      <h2 className="text-[16px] font-semibold leading-none text-white">
        Instant path
      </h2>
      <div className="mt-5 space-y-4">
        {FLOW_ITEMS.map((item, index) => {
          const Icon = item.icon;
          const isActive = index === activeIndex;
          const isDone = index < activeIndex;

          return (
            <div key={item.id} className="flex gap-3">
              <span
                className={cn(
                  "flex h-9 w-9 shrink-0 items-center justify-center rounded-full border",
                  isActive
                    ? "border-white text-white"
                    : isDone
                    ? "border-[#737373] text-[#CFCFCF]"
                    : "border-[#333333] text-[#686868]"
                )}
              >
                {isDone ? (
                  <Check className="h-4 w-4" strokeWidth={2.2} />
                ) : (
                  <Icon className="h-4 w-4" strokeWidth={1.8} />
                )}
              </span>
              <div className="min-w-0 pt-[2px]">
                <p
                  className={cn(
                    "text-[14px] font-semibold leading-tight",
                    isActive || isDone ? "text-white" : "text-[#777777]"
                  )}
                >
                  {item.label}
                </p>
                <p className="mt-1 text-[13px] leading-snug text-[#808080]">
                  {item.detail}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
