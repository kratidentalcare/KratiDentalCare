import { Suspense } from "react";
import type { Metadata } from "next";

import { PublicShell } from "@/components/layout";
import { PublicFooter } from "@/components/layout/public-footer";
import { PublicNavbar } from "@/components/layout/public-navbar";
import { Footer } from "@/components/shared/footer";
import { Navbar } from "@/components/shared/navbar";
import { APP_DESCRIPTION, APP_NAME } from "@/constants";

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
    card: "summary_large_image",
    title: APP_NAME,
    description: APP_DESCRIPTION,
  },
  robots: {
    index: true,
    follow: true,
  },
};

/**
 * Root layout for `app/(public)/*`.
 *
 * Sync shell so `loading.tsx` can paint immediately. Navbar admin check and
 * footer clinic data stream behind Suspense (same pattern as dashboard chrome).
 *
 * Slot contract:
 * - header → Navbar (auth-aware, streamed)
 * - children → Hero, About, Services, Doctors, Testimonials, FAQ, Contact, …
 * - footer → Footer (clinic data from ClinicSettings, streamed)
 */
export default function PublicLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <PublicShell
      header={
        <Suspense fallback={<Navbar />}>
          <PublicNavbar />
        </Suspense>
      }
      footer={
        <Suspense fallback={<Footer />}>
          <PublicFooter />
        </Suspense>
      }
    >
      {children}
    </PublicShell>
  );
}
