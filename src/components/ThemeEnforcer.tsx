"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

export default function ThemeEnforcer() {
  const pathname = usePathname();

  useEffect(() => {
    if (typeof document === "undefined") return;

    const isAuthOrLanding = pathname === "/" || pathname.startsWith("/auth") || pathname.startsWith("/onboarding");

    if (isAuthOrLanding) {
      document.documentElement.classList.remove("light");
      document.documentElement.classList.add("dark");
    }
  }, [pathname]);

  return null;
}
