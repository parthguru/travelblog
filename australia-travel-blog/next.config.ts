import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    domains: ['imagedelivery.net', 'localhost'],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'imagedelivery.net',
        port: '',
        pathname: '/**',
      },
    ],
  },
};

export default nextConfig;
