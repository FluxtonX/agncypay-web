"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useApp } from "../../context/AppContext";

export default function VerificationRootPage() {
  const router = useRouter();
  const { state } = useApp();

  useEffect(() => {
    // If already submitted, go to status screen, else step 1
    if (
      state.verificationStatus === "submitted" ||
      state.verificationStatus === "in_review" ||
      state.verificationStatus === "approved"
    ) {
      router.push("/verification/status");
    } else {
      router.push("/verification/business-info");
    }
  }, [router, state.verificationStatus]);

  return null;
}
