import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  allowedDevOrigins: [
    "192.168.0.15",
  ],
  images: {
    domains: ['gieokbucket.s3.ap-northeast-2.amazonaws.com'],
  },
};

export default nextConfig;
