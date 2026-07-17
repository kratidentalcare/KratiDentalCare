import type { Metadata } from "next";
import { redirect } from "next/navigation";

import { PageContainer } from "@/components/layout";
import { AuthStatusView } from "@/components/shared/auth-status-view";
import { isAuthStatusReason } from "@/constants/auth-status";
import { ROUTES } from "@/constants/routes";

export const metadata: Metadata = {
  title: "Account status",
  robots: {
    index: false,
    follow: false,
  },
};

type AuthStatusPageProps = {
  searchParams: Promise<{ reason?: string | string[] }>;
};

/**
 * Stable UX landing for page-guard redirects (forbidden / disabled / unsynced).
 * Public so disabled accounts can still read the message after denial.
 */
export default async function AuthStatusPage({
  searchParams,
}: AuthStatusPageProps) {
  const params = await searchParams;
  const raw = Array.isArray(params.reason) ? params.reason[0] : params.reason;

  if (!isAuthStatusReason(raw)) {
    redirect(ROUTES.HOME);
  }

  return (
    <PageContainer size="md" className="py-16 sm:py-20">
      <AuthStatusView reason={raw} />
    </PageContainer>
  );
}
