import type { NextConfig } from "next";

/** @type {import('next').NextConfig} */
const nextConfig: NextConfig = {
  reactStrictMode: true,

  eslint: {
    ignoreDuringBuilds: true,
  },

  async rewrites() {
    return [
      { source: '/', destination: '/index.html' },
      { source: "/cgu", destination: '/cgu.html' },
      { source: "/contributors", destination: "/contributors.html" },
      { source: "/roadmap", destination: "/roadmap.html" },
    ];
  },
};

export default nextConfig;
