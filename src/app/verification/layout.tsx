import React from "react";
import { VerificationLayout } from "../../components/layout/VerificationLayout";

interface LayoutProps {
  children: React.ReactNode;
}

export default function OnboardingVerificationLayout({ children }: LayoutProps) {
  return <VerificationLayout>{children}</VerificationLayout>;
}
