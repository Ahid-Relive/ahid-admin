import type { NextConfig } from "next";

// Server-only backend URL (no NEXT_PUBLIC_ prefix). It is read at build/run
// time on the server and never shipped to the browser. The browser talks to
// this app's own origin, and Next proxies the requests to the backend.
const API_URL = (process.env.API_URL || "http://localhost:5000/api").replace(/\/+$/, "");
const API_ORIGIN = new URL(API_URL).origin;

const nextConfig: NextConfig = {
  async rewrites() {
    return [
      // Browser calls /api/... -> backend API
      { source: "/api/:path*", destination: `${API_URL}/:path*` },
      // Browser loads /backend-files/... -> backend static files (uploads, etc.)
      { source: "/backend-files/:path*", destination: `${API_ORIGIN}/:path*` },
    ];
  },
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
