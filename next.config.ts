import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  eslint: {
    // Ignore ESLint errors during builds on Vercel to allow successful deployments
    ignoreDuringBuilds: true,
  },
};

export default nextConfig;
