import { createHash } from "node:crypto";
import { readdirSync, readFileSync } from "node:fs";
import path from "node:path";
import type { NextConfig } from "next";

/**
 * Fingerprint of the bundled shape libraries (public/libraries). It goes in
 * each library's URL (`?v=`), so browsers fetch the new file whenever one
 * changes, despite the one-year cache set below.
 */
function librariesVersion(): string {
  const dir = path.join(process.cwd(), "public", "libraries");
  const hash = createHash("sha256");
  for (const file of readdirSync(dir).sort()) {
    hash.update(file).update(readFileSync(path.join(dir, file)));
  }
  return hash.digest("hex").slice(0, 12);
}

const nextConfig: NextConfig = {
  // The dev-only "N" badge sat on top of the sidebar's account menu.
  devIndicators: { position: "bottom-right" },
  env: { NEXT_PUBLIC_LIBRARIES_VERSION: librariesVersion() },
  async headers() {
    // Production only: in dev, a library file edited without a restart
    // must not stay cached under the old fingerprint.
    if (process.env.NODE_ENV !== "production") return [];
    return [
      {
        // Versioned by URL (see librariesVersion), so safe to keep a year
        // without the browser re-checking on every Library panel open.
        source: "/libraries/:file*",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=31536000, immutable",
          },
        ],
      },
    ];
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
