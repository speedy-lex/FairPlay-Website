import type { NextConfig } from "next";

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  async rewrites() {
    return [
      { source: '/home', destination: '/home.html' }, // sert le fichier de /public
      { source: '/contributors', destination: '/contributors.html' },
      { source: '/roadmap', destination: '/roadmap.html' },
    ];
  },
};
export default nextConfig;

