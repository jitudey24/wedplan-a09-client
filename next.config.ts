import type { NextConfig } from "next";

const AUTH_SERVER_URL = (process.env.AUTH_SERVER_URL || "").replace(/\/+$/, "");

const nextConfig: NextConfig = {
  async rewrites() {
    return [
      // Better Auth
      {
        source: "/api/auth/:path*",
        destination: `${AUTH_SERVER_URL}/api/auth/:path*`,
      },
      // REST API (bookings, subscription, services, ...)
      // Proxied so the session cookie stays first-party and reaches the backend.
      {
        source: "/api/v1/:path*",
        destination: `${AUTH_SERVER_URL}/api/v1/:path*`,
      },
    ];
  },

  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
    ],
  },

  experimental: {
    agentFeedback: true,
  },

  cacheComponents: true,
  partialPrefetching: true,
  reactCompiler: true,

  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;
