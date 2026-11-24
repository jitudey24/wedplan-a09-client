
import type { NextConfig } from "next";

const AUTH_SERVER_URL = (
  process.env.AUTH_SERVER_URL || ""
).replace(/\/+$/, "");

if (!AUTH_SERVER_URL) {
  throw new Error(
    "AUTH_SERVER_URL is missing from environment variables."
  );
}

const nextConfig: NextConfig = {
  async rewrites() {
    return [
      {
        source: "/api/auth/:path*",
        destination: `${AUTH_SERVER_URL}/api/auth/:path*`,
      },
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
