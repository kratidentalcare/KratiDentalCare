import type { Metadata } from "next";
import Link from "next/link";

import { PageContainer } from "@/components/layout";
import { ROUTES } from "@/constants/routes";
import { requireAppUserPage } from "@/lib/auth";

export const metadata: Metadata = {
  title: "Profile",
  robots: {
    index: false,
    follow: false,
  },
};

/**
 * Authenticated profile placeholder.
 * Requires an active synchronized Mongo app user (any role).
 * Full profile management ships in a later phase.
 */
export default async function ProfilePage() {
  await requireAppUserPage({
    returnPath: ROUTES.PROFILE,
    touchLastLogin: true,
  });

  return (
    <PageContainer size="md" className="py-16 sm:py-20">
      <div className="mx-auto max-w-lg text-center font-montserrat">
        <h1 className="text-3xl font-bold tracking-tight text-[#1F2937] sm:text-4xl">
          Profile
        </h1>
        <p className="mt-3 text-base text-[#6B7280] sm:text-lg">
          Your clinic profile will live here soon. Account security and identity
          settings remain available from the avatar menu.
        </p>
        <Link
          href={ROUTES.PUBLIC.HOME}
          className="mt-8 inline-flex h-11 items-center justify-center rounded-full border border-[#1F2937]/25 bg-[#0A84C6]/10 px-6 text-base font-semibold text-[#1F2937] transition-all duration-200 hover:border-[#0A84C6]/40 hover:bg-[#0A84C6]/15 hover:text-[#0870A8] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0A84C6]/40 focus-visible:ring-offset-2"
        >
          Back to home
        </Link>
      </div>
    </PageContainer>
  );
}
