import { clerkMiddleware } from "@clerk/nextjs/server";

import { isProtectedPath } from "@/config/auth";

/**
 * Next.js 16 network boundary (formerly `middleware.ts`).
 * Establishes Clerk session context and redirects unauthenticated
 * visitors away from `/patient`, `/admin`, and `/profile` trees.
 *
 * Role / Mongo authorization is intentionally not performed here.
 */
export default clerkMiddleware(async (auth, request) => {
  if (isProtectedPath(request.nextUrl.pathname)) {
    await auth.protect();
  }
});

export const config = {
  matcher: [
    // Skip Next.js internals and static files unless in search params
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    // Always run for API routes
    "/(api|trpc)(.*)",
    // Clerk Frontend API proxy path (when enabled)
    "/__clerk/(.*)",
  ],
};
