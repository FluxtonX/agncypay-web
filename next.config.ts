import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Allow the local network host to access Next.js dev resources (webpack HMR) in development
  // Add additional hosts here if you access the dev server from other devices on your LAN.
  allowedDevOrigins: ["192.168.1.6", "127.0.0.1", "localhost"],
};

export default nextConfig;
