import type { Metadata } from "next";
import { redirect } from "next/navigation";

import { ROUTES } from "@/constants/routes";

export const metadata: Metadata = {
  title: "Profile",
  robots: {
    index: false,
    follow: false,
  },
};

/**
 * Legacy `/profile` entry — redirects into the admin profile module.
 */
export default function ProfileRedirectPage() {
  redirect(ROUTES.DASHBOARD.PROFILE);
}
