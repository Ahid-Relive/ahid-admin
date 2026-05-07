import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'http',
        hostname: 'localhost',
        port: '5000',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'localhost',
        port: '5000',
        pathname: '/**',
      },
      // Add your production API domain here when deploying
      // {
      //   protocol: 'https',
      //   hostname: 'your-api-domain.com',
      //   pathname: '/**',
      // },
    ],
  },
};

export default nextConfig;
