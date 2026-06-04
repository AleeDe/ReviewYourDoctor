import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Allow loading the dev server (incl. HMR websocket) from these LAN hosts,
  // e.g. when testing on a phone. Dev-only; ignored in production builds.
  allowedDevOrigins: ["192.168.1.7"],
};

export default nextConfig;
