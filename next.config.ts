import type { NextConfig } from "next";

/**
 * Safe for every response. Deliberately not a full Content-Security-Policy:
 * Excalidraw loads fonts and libraries from other origins, so a strict one
 * needs its own careful pass. frame-ancestors alone blocks clickjacking.
 */
const securityHeaders = [
  { key: "Content-Security-Policy", value: "frame-ancestors 'none'" },
  { key: "X-Frame-Options", value: "DENY" }, // for browsers without CSP 2
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
];

const nextConfig: NextConfig = {
  // The dev-only "N" badge sat on top of the sidebar's account menu.
  devIndicators: { position: "bottom-right" },
  async headers() {
    return [{ source: "/(.*)", headers: securityHeaders }];
  },
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
