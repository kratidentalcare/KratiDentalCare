"use client";

import { Show, SignInButton, UserButton } from "@clerk/nextjs";
import { LayoutDashboardIcon, UserIcon } from "lucide-react";

import { AUTH_CONFIG } from "@/config/auth";
import { clerkAppearance } from "@/config/clerk-appearance";
import { ROUTES } from "@/constants/routes";
import { cn } from "@/lib/utils";

export type AuthControlsProps = {
  /** When true, expose the admin Dashboard link (from `isAdmin()`). */
  isAdmin: boolean;
  className?: string;
  orientation?: "horizontal" | "vertical";
  /** Called after a nav action (e.g. close mobile drawer). */
  onNavigate?: () => void;
};

/**
 * Circular trigger matching Clerk `UserButton` avatar size.
 * Opens the sign-in modal when the user is signed out.
 */
function GuestUserIconTrigger({
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
      aria-label="Sign in"
      className={cn(
        "inline-flex size-9 shrink-0 items-center justify-center rounded-full sm:size-10",
        "border border-[#E5E7EB] bg-[#F8FBFD] text-[#1F2937]",
        "transition-colors duration-200",
        "hover:border-[#0A84C6]/40 hover:bg-[#0A84C6]/10 hover:text-[#0A84C6]",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0A84C6]/40 focus-visible:ring-offset-2",
        "active:scale-[0.98]",
        className
      )}
    >
      <UserIcon className="size-5 sm:size-[1.35rem]" strokeWidth={1.75} aria-hidden />
    </button>
  );
}

/**
 * Navbar auth chrome:
 * - Guests → user icon opens combined Sign In / Sign Up modal
 * - Sessions → Clerk `UserButton` (avatar + account menu)
 *
 * Uses combined sign-in-or-up (`withSignUp`) so OAuth callbacks stay under
 * `/sign-in` and do not bounce to a separate `/sign-up` host.
 */
export function AuthControls({
  isAdmin,
  className,
  orientation = "horizontal",
  onNavigate,
}: AuthControlsProps) {
  const isVertical = orientation === "vertical";

  return (
    <div
      className={cn(
        isVertical
          ? "flex w-full flex-col items-center gap-3"
          : "flex items-center gap-1 sm:gap-2",
        className
      )}
    >
      <Show when="signed-out">
        <SignInButton
          mode="modal"
          withSignUp
          oauthFlow="popup"
          appearance={clerkAppearance}
          fallbackRedirectUrl={AUTH_CONFIG.afterSignInUrl}
          signUpFallbackRedirectUrl={AUTH_CONFIG.afterSignUpUrl}
        >
          <GuestUserIconTrigger onClick={onNavigate} />
        </SignInButton>
      </Show>

      <Show when="signed-in">
        <div
          className={cn(
            "flex items-center",
            isVertical && "w-full justify-center py-1"
          )}
        >
          <UserButton appearance={clerkAppearance} userProfileMode="modal">
            <UserButton.MenuItems>
              {isAdmin ? (
                <UserButton.Link
                  label="Dashboard"
                  href={ROUTES.ADMIN.ROOT}
                  labelIcon={
                    <LayoutDashboardIcon className="size-4" aria-hidden />
                  }
                />
              ) : null}
              <UserButton.Link
                label="Profile"
                href={ROUTES.PROFILE}
                labelIcon={<UserIcon className="size-4" aria-hidden />}
              />
              <UserButton.Action label="signOut" />
            </UserButton.MenuItems>
          </UserButton>
        </div>
      </Show>
    </div>
  );
}
