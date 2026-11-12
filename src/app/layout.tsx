import type { Metadata } from "next";
// Fonts are self-hosted from npm packages rather than next/font/google, which downloads them from
// Google during the build and was failing on Vercel. Variable fonts cover weights 100–900.
import "@fontsource-variable/inter/wght.css";
import "@fontsource-variable/outfit/wght.css";
import "./globals.css";
import { SessionProvider } from "@/lib/session";
import { ToastProvider } from "@/components/ui";

export const metadata: Metadata = {
  title: "AGNCY — Payments for the creative economy",
  description:
    "AGNCY connects brands, agencies and talent: brands pay agency invoices, agencies pay out every allocation, and talent see creative income the moment it lands.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className="h-full">
      <body className="flex min-h-full flex-col">
        <SessionProvider>
          <ToastProvider>{children}</ToastProvider>
        </SessionProvider>
      </body>
    </html>
  );
}
