import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // The dev-only "N" badge sat on top of the sidebar's account menu.
  devIndicators: { position: "bottom-right" },
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
