import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Bookmarks from the pre-Phase 1 prototype land on the new portals. Temporary (307) during the beta.
  async redirects() {
    return [
      { source: "/dashboard/:path*", destination: "/agency", permanent: false },
      { source: "/agencydashboard/:path*", destination: "/agency", permanent: false },
      { source: "/branddashboard/:path*", destination: "/brand", permanent: false },
      { source: "/mainboard/:path*", destination: "/auth/login", permanent: false },
      { source: "/onboarding/:path*", destination: "/auth/register", permanent: false },
      { source: "/auth/routing", destination: "/auth/login", permanent: false },
      { source: "/auth/verify-email", destination: "/auth/login", permanent: false },
    ];
  },
};

export default nextConfig;
