import type { Metadata } from "next";

import { PublicShell } from "@/components/layout";
import { Footer } from "@/components/shared/footer";
import { Navbar } from "@/components/shared/navbar";
import { getEnv } from "@/config/env";
import { APP_DESCRIPTION, APP_NAME } from "@/constants";
import { isAdmin } from "@/lib/auth";

/**
 * Public marketing site metadata defaults.
 * Nested public routes override `title` via the root template: `%s | APP_NAME`.
 */
export const metadata: Metadata = {
  title: {
    default: APP_NAME,
    template: `%s | ${APP_NAME}`,
  },
  description: APP_DESCRIPTION,
  applicationName: APP_NAME,
  openGraph: {
    type: "website",
    siteName: APP_NAME,
    title: APP_NAME,
    description: APP_DESCRIPTION,
  },
  twitter: {
    card: "summary",
    title: APP_NAME,
    description: APP_DESCRIPTION,
  },
  robots: {
    index: true,
    follow: true,
  },
};

/**
 * Soft admin check for navbar chrome only.
 * Never throws — missing Clerk / sync failures hide the Dashboard link.
 */
async function resolveNavbarIsAdmin(): Promise<boolean> {
  if (!getEnv().hasClerkKeys) {
    return false;
  }

  try {
    return await isAdmin({ touchLastLogin: false });
  } catch {
    return false;
  }
}

/**
 * Root layout for `app/(public)/*`.
 *
 * Slot contract:
 * - header → Navbar (auth-aware)
 * - children → Hero, About, Services, Doctors, Testimonials, FAQ, Contact, …
 * - footer → Footer
 */
export default async function PublicLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const admin = await resolveNavbarIsAdmin();

  return (
    <PublicShell header={<Navbar isAdmin={admin} />} footer={<Footer />}>
      {children}
    </PublicShell>
  );
}
