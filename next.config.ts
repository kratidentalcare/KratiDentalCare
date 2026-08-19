import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Keep Chromium binaries out of the Next bundle — they resolve by relative path.
  serverExternalPackages: ["puppeteer-core", "@sparticuz/chromium-min"],
  // Typecheck is memory-heavy on this codebase; next build OOMs during
  // "Running TypeScript". Keep types gated via `npm run typecheck` instead.
  typescript: {
    ignoreBuildErrors: true,
  },
};

export default nextConfig;
