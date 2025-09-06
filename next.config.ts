import type { NextConfig } from "next";

/** @type {import('next').NextConfig} */
const nextConfig: NextConfig = {
  reactStrictMode: true,

  eslint: {
    ignoreDuringBuilds: true,
  },

  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "tilbgoymzrpnhzlqsvgj.supabase.co",
        pathname: "/storage/v1/object/public/avatars/**",
      },
      {
        protocol: "https",
        hostname: "tilbgoymzrpnhzlqsvgj.supabase.co",
        pathname: "/storage/v1/object/public/banners/banners/**",
      },
    ],
  },

  async rewrites() {
    return [
      { source: "/home", destination: "/index.html" },
      { source: "/", destination: "/index.html" },
      { source: "/cgu", destination: "/cgu.html" },
      { source: "/contributors", destination: "/contributors.html" },
      { source: "/roadmap", destination: "/roadmap.html" },
    ];
  },

  webpack: (config, {}) => {
    // avoid wasm errors
    config.module.rules.push({
      test: /\.wasm$/,
      type: 'webassembly/async',
    });

    return config;
  },
};

export default nextConfig;
