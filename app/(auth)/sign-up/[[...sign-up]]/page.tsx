import type { Metadata } from "next";
import { redirect } from "next/navigation";

import { ROUTES } from "@/constants/routes";

export const metadata: Metadata = {
  title: "Sign up",
};

/**
 * Legacy `/sign-up` entry — combined auth lives under `/sign-in`.
 * Keeps old links / bookmarks working without a second Clerk host tree.
 */
export default function SignUpPage() {
  redirect(`${ROUTES.SIGN_IN}/create`);
}
