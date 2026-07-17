import type { Metadata } from "next";
import { SignIn } from "@clerk/nextjs";

import { AUTH_CONFIG } from "@/config/auth";
import { clerkAppearance } from "@/config/clerk-appearance";
import { ROUTES } from "@/constants/routes";

export const metadata: Metadata = {
  title: "Sign in",
};

/**
 * Combined sign-in-or-up host (Clerk path routing).
 * Do not pass `signUpUrl` — a separate sign-up URL breaks modal/SSO callbacks
 * (`/sign-in/create/sso-callback` must stay under this tree).
 */
export default function SignInPage() {
  return (
    <SignIn
      path={ROUTES.SIGN_IN}
      routing="path"
      withSignUp
      fallbackRedirectUrl={AUTH_CONFIG.afterSignInUrl}
      signUpFallbackRedirectUrl={AUTH_CONFIG.afterSignUpUrl}
      appearance={clerkAppearance}
    />
  );
}
