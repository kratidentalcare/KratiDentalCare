import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Typecheck is memory-heavy on this codebase; next build OOMs during
  // "Running TypeScript". Keep types gated via `npm run typecheck` instead.
  typescript: {
    ignoreBuildErrors: true,
  },
};

export default nextConfig;
