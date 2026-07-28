import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  cacheComponents: true,
  allowedDevOrigins: [
    "192.168.0.15",
  ],
  images: {
    domains: [
      'gieokbucket.s3.ap-northeast-2.amazonaws.com',
      'lh3.googleusercontent.com',
    ],
  },
  experimental: {
    serverActions: {
      bodySizeLimit: '10mb',
    },
  },
};

export default nextConfig;
