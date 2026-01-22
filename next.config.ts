import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Turbopack configuration for Next.js 16
  turbopack: {},
  // Fallback to webpack if needed
  webpack: (config) => {
    config.resolve.fallback = {
      ...config.resolve.fallback,
      '@solana-program/system': false,
      '@solana-program/token': false,
      '@solana/kit': false,
    };
    return config;
  },
};

export default nextConfig;
