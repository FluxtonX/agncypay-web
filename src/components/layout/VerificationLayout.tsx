"use client";

import React from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  Building2,
  Check,
  ClipboardCheck,
  CreditCard,
  FileText,
  Settings,
  Shield,
  Upload,
  Users,
  UserRound,
} from "lucide-react";
import { cn } from "../../lib/utils";

interface VerificationLayoutProps {
  children: React.ReactNode;
}

const KYB_STEPS = [
  {
    id: 1,
    label: "Company Information",
    path: "/verification/business-info",
    icon: Building2,
  },
  {
    id: 2,
    label: "Business Details",
    path: "/verification/business-details",
    icon: FileText,
  },
  {
    id: 3,
    label: "Authorized Representative",
    path: "/verification/representative",
    icon: UserRound,
  },
  {
    id: 4,
    label: "KYB Verification",
    path: "/verification/authorization",
    icon: Shield,
  },
  {
    id: 5,
    label: "Document Upload",
    path: "/verification/documents",
    icon: Upload,
  },
  {
    id: 6,
    label: "Bank Account",
    path: "/verification/bank-details",
    icon: CreditCard,
  },
  {
    id: 7,
    label: "Team Setup",
    path: "/verification/brand",
    icon: Users,
  },
  {
    id: 8,
    label: "Payment Preferences",
    path: "/verification/payment-preferences",
    icon: Settings,
  },
  {
    id: 9,
    label: "Review & Submit",
    path: "/verification/review",
    icon: ClipboardCheck,
  },
];

const INSTANT_STEPS = [
  {
    id: 1,
    label: "Simple Signup",
    path: "/verification/instant",
    icon: UserRound,
  },
  {
    id: 2,
    label: "Bank Verification",
    path: "/verification/instant/connect-bank",
    icon: CreditCard,
  },
];

export function VerificationLayout({ children }: VerificationLayoutProps) {
  const pathname = usePathname();
  const router = useRouter();
  const stepperRef = React.useRef<HTMLDivElement | null>(null);
  const activeStepRef = React.useRef<HTMLButtonElement | null>(null);
  const isInstantFlow = pathname.startsWith("/verification/instant");
  const steps = isInstantFlow ? INSTANT_STEPS : KYB_STEPS;
  const currentIndex = Math.max(
    0,
    steps.findIndex((step) => step.path === pathname)
  );
  const currentStep = steps[currentIndex] || steps[0];
  const progressWidth = `${((currentStep.id - 1) / steps.length) * 100 + 100 / steps.length}%`;

  React.useEffect(() => {
    const stepper = stepperRef.current;
    const activeStep = activeStepRef.current;

    if (!stepper || !activeStep) return;

    const targetLeft = Math.max(activeStep.offsetLeft - 28, 0);
    stepper.scrollTo({
      left: targetLeft,
      behavior: "smooth",
    });
  }, [pathname, currentStep.id]);

  return (
    <div className="min-h-screen overflow-hidden bg-black text-white">
      <header className="relative h-[76px] bg-black px-5 sm:px-8 lg:px-10">
        <div className="flex h-[71px] items-center justify-between">
          <Link href="/" className="flex items-center" aria-label="AgncyPay home">
            <span className="relative block h-[34px] w-[37px] overflow-hidden sm:h-[36px] sm:w-[39px]">
              <img
                src="/agncypayLogo.png"
                alt=""
                className="absolute h-[104px] w-[162px] max-w-none object-contain sm:h-[110px] sm:w-[171px]"
                style={{ left: "-8px", top: "-31px" }}
              />
            </span>
            <span className="ml-1 text-[26px] font-bold leading-none tracking-normal text-white sm:text-[28px]">
              pay
            </span>
          </Link>

          <div className="text-[13px] font-medium leading-none text-[#8B8B8B] sm:text-[15px]">
            Step {currentStep.id} of {steps.length}
          </div>
        </div>

        <div className="absolute bottom-0 left-5 right-5 h-1 bg-[#242424] sm:left-8 sm:right-8 lg:left-10 lg:right-10">
          <div
            className="h-full bg-white transition-[width] duration-300"
            style={{ width: progressWidth }}
          />
        </div>
      </header>

      <nav
        ref={stepperRef}
        className="h-[78px] overflow-x-auto overflow-y-hidden border-b border-[#171717] bg-black px-5 sm:h-[86px] sm:px-8 lg:px-10 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      >
        <div className="flex h-full w-max min-w-full items-center gap-2 pr-8 sm:gap-[10px] sm:pr-12">
          {steps.map((step, index) => {
            const Icon = step.icon;
            const isActive = step.id === currentStep.id;
            const isPast = step.id < currentStep.id;
            const StepIcon = isPast ? Check : Icon;

            return (
              <React.Fragment key={`${step.id}-${step.label}`}>
                <button
                  ref={isActive ? activeStepRef : null}
                  type="button"
                  onClick={() => router.push(step.path)}
                  className={cn(
                    "flex shrink-0 items-center gap-2 text-left transition-colors sm:gap-[10px]",
                    isActive ? "text-white" : "text-[#555555] hover:text-[#8C8C8C]"
                  )}
                >
                  <span
                    className={cn(
                      "flex h-[34px] w-[34px] shrink-0 items-center justify-center rounded-full border sm:h-[38px] sm:w-[38px]",
                      isActive
                        ? "border-white text-white"
                        : isPast
                        ? "border-[#7D7D7D] text-[#9A9A9A]"
                        : "border-[#555555] text-[#666666]"
                    )}
                  >
                    <StepIcon className="h-4 w-4 sm:h-[17px] sm:w-[17px]" strokeWidth={1.8} />
                  </span>
                  <span
                    className={cn(
                      "whitespace-nowrap text-[13px] font-semibold leading-none tracking-normal sm:text-[14px]",
                      isActive ? "text-white" : "text-[#555555]"
                    )}
                  >
                    {step.label}
                  </span>
                </button>

                {index < steps.length - 1 && (
                  <span className="block h-px w-5 shrink-0 bg-[#A7A7A7] sm:w-7" />
                )}
              </React.Fragment>
            );
          })}
        </div>
      </nav>

      <main className="h-[calc(100vh-154px)] overflow-y-auto bg-black px-5 sm:h-[calc(100vh-162px)] sm:px-8 lg:px-10">
        <motion.div
          key={pathname}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.2, ease: "easeOut" }}
        >
          {children}
        </motion.div>
      </main>
    </div>
  );
}
