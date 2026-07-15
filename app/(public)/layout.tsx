import type { Metadata } from "next";

import { PublicShell } from "@/components/layout";
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
 * Root layout for `app/(public)/*`.
 *
 * Slot contract (plug-in later without changing this file's structure):
 * - header → Navbar
 * - children → Hero, About, Services, Doctors, Testimonials, FAQ, Contact, …
 * - footer → Footer
 */
export default function PublicLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return <PublicShell>{children}</PublicShell>;
}
