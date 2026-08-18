"use client";

import { Show, SignInButton, useAuth } from "@clerk/nextjs";
import { UserIcon } from "lucide-react";

import { AUTH_CONFIG } from "@/config/auth";
import { clerkAppearance } from "@/config/clerk-appearance";
import { cn } from "@/lib/utils";

import { AccountMenu } from "./account-menu";

export type AuthControlsProps = {
  /** When true, expose the admin Dashboard link (from `isAdmin()`). */
  isAdmin: boolean;
  className?: string;
  /** Called after a nav action (e.g. close mobile drawer). */
  onNavigate?: () => void;
};

const authIconClassName = cn(
  "inline-flex size-11 shrink-0 items-center justify-center rounded-full",
  "border border-brand-navy/15 bg-white text-brand-dark",
  "transition-all duration-200",
  "hover:border-brand-blue/40 hover:bg-brand-blue/[0.06] hover:text-brand-blue",
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-blue/40 focus-visible:ring-offset-2",
  "active:scale-[0.98]",
);

function AuthControlsSkeleton() {
  return (
    <div
      aria-hidden
      className="size-11 shrink-0 animate-pulse rounded-full bg-brand-navy/10"
    />
  );
}

/**
 * Icon trigger for guests — opens Clerk sign-in / sign-up modal.
 */
function GuestLoginTrigger({
  className,
  onClick,
}: {
  className?: string;
  onClick?: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label="Login or Sign up"
      className={cn(authIconClassName, className)}
    >
      <UserIcon className="size-5" strokeWidth={1.75} aria-hidden />
    </button>
  );
}

/**
 * Navbar auth chrome:
 * - Guests → user icon (opens sign-in)
 * - Sessions → user icon account modal (bottom sheet on mobile)
 */
export function AuthControls({
  isAdmin,
  className,
  onNavigate,
}: AuthControlsProps) {
  const { isLoaded } = useAuth();

  if (!isLoaded) {
    return (
      <div className={cn("flex items-center", className)}>
        <AuthControlsSkeleton />
      </div>
    );
  }

  return (
    <div className={cn("flex items-center", className)}>
      <Show when="signed-out">
        <SignInButton
          mode="modal"
          withSignUp
          oauthFlow="popup"
          appearance={clerkAppearance}
          fallbackRedirectUrl={AUTH_CONFIG.afterSignInUrl}
          signUpFallbackRedirectUrl={AUTH_CONFIG.afterSignUpUrl}
        >
          <GuestLoginTrigger onClick={onNavigate} />
        </SignInButton>
      </Show>

      <Show when="signed-in">
        <AccountMenu
          isAdmin={isAdmin}
          triggerClassName={authIconClassName}
          onNavigate={onNavigate}
        />
      </Show>
    </div>
  );
}
