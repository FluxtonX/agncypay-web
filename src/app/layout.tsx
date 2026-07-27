import type { Metadata } from "next";
import { Inter, Outfit } from "next/font/google";
import "./globals.css";
import { AppProvider } from "@/context/AppContext";
import ThemeEnforcer from "@/components/ThemeEnforcer";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800", "900"],
});

const outfit = Outfit({
  variable: "--font-outfit",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800", "900"],
});

export const metadata: Metadata = {
  title: "AgncyPay | Secure Brand Invoice Payments & KYB Verification",
  description: "A verified brand payment platform for invoice management, business verification, and fast payment reconciliation. Secure Adidas invoices with AgncyPay.",
  icons: {
    icon: "/Alogo.jpg",
  }
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${inter.variable} ${outfit.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              try {
                const path = window.location.pathname;
                let storageKey = 'agncypay_theme';
                let defaultTheme = 'dark'; // fallback
                
                if (path === '/' || path.startsWith('/auth') || path.startsWith('/onboarding')) {
                  document.documentElement.classList.add('dark');
                  document.documentElement.classList.remove('light');
                  return;
                }

                if (path.includes('/branddashboard')) {
                  storageKey = 'agncypay_theme_brand';
                  defaultTheme = 'light';
                } else if (path.includes('/agencydashboard/agencybanking')) {
                  storageKey = 'agncypay_theme_agencybanking';
                  defaultTheme = 'dark';
                } else if (path.includes('/agencydashboard')) {
                  storageKey = 'agncypay_theme_agency';
                  defaultTheme = 'light';
                } else if (path.includes('/dashboard')) {
                  storageKey = 'agncypay_theme_talent';
                  defaultTheme = 'dark';
                }

                const savedTheme = localStorage.getItem(storageKey);
                
                if (savedTheme) {
                  if (savedTheme === 'light') {
                    document.documentElement.classList.add('light');
                    document.documentElement.classList.remove('dark');
                  } else {
                    document.documentElement.classList.add('dark');
                    document.documentElement.classList.remove('light');
                  }
                } else {
                  if (defaultTheme === 'light') {
                    document.documentElement.classList.add('light');
                    document.documentElement.classList.remove('dark');
                  } else {
                    document.documentElement.classList.add('dark');
                    document.documentElement.classList.remove('light');
                  }
                }
              } catch (_) {}
            `,
          }}
        />
      </head>
      <body className="min-h-full flex flex-col bg-background text-foreground transition-colors duration-200">
        <ThemeEnforcer />
        <AppProvider>{children}</AppProvider>
      </body>
    </html>
  );
}
