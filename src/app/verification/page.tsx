"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useApp } from "../../context/AppContext";
import { normalizeWorkspaceType } from "../../types/workspace";

export default function VerificationRootPage() {
  const router = useRouter();
  const { state } = useApp();
  const workspaceType = state.user ? normalizeWorkspaceType(state.user.accountType) : "brand";

  useEffect(() => {
    // If already submitted, go to status screen, else step 1
    if (
      state.verificationStatus === "submitted" ||
      state.verificationStatus === "in_review" ||
      state.verificationStatus === "approved"
    ) {
      router.push("/verification/status");
    } else if (workspaceType === "talent_agency" || workspaceType === "talent_independent") {
      router.push("/verification/representative");
    } else {
      router.push("/verification/business-info");
    }
  }, [router, state.verificationStatus, workspaceType]);

  return null;
}
