import type { NextConfig } from "next";

const clerkPublishableKey =
  process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY ||
  process.env.CLERK_PUBLISHABLE_KEY;

const nextConfig: NextConfig = {
  // Clerk's Next.js SDK reads NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY.
  // Alias the server-only name so existing .env.local files still work.
  ...(clerkPublishableKey
    ? { env: { NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY: clerkPublishableKey } }
    : {}),
  // Keep Chromium binaries out of the Next bundle — they resolve by relative path.
  serverExternalPackages: ["puppeteer-core", "@sparticuz/chromium-min"],
  // Typecheck is memory-heavy on this codebase; next build OOMs during
  // "Running TypeScript". Keep types gated via `npm run typecheck` instead.
  typescript: {
    ignoreBuildErrors: true,
  },
};

export default nextConfig;
