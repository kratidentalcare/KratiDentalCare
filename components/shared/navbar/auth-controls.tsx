"use client";

import Link from "next/link";
import { Show, SignInButton, useClerk } from "@clerk/nextjs";
import {
  ChevronDownIcon,
  LayoutDashboardIcon,
  LogOutIcon,
  UserIcon,
} from "lucide-react";

import { AUTH_CONFIG } from "@/config/auth";
import { clerkAppearance } from "@/config/clerk-appearance";
import { ROUTES } from "@/constants/routes";
import { cn } from "@/lib/utils";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export type AuthControlsProps = {
  /** When true, expose the admin Dashboard link (from `isAdmin()`). */
  isAdmin: boolean;
  className?: string;
  orientation?: "horizontal" | "vertical";
  /** Called after a nav action (e.g. close mobile drawer). */
  onNavigate?: () => void;
};

const authTriggerClassName = (
  fullWidth: boolean,
  className?: string
) =>
  cn(
    "inline-flex items-center justify-center gap-1.5 rounded-full font-semibold",
    "border border-brand-navy/15 bg-white text-brand-dark",
    "transition-all duration-200",
    "hover:border-brand-blue/40 hover:bg-brand-blue/[0.06] hover:text-brand-blue",
    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-blue/40 focus-visible:ring-offset-2",
    "active:scale-[0.98]",
    fullWidth
      ? "h-12 w-full px-6 text-base"
      : "h-10 px-4 text-sm sm:h-11 sm:px-5 sm:text-base",
    className
  );

/**
 * Text trigger for guests — opens Clerk sign-in / sign-up modal.
 */
function GuestLoginTrigger({
  className,
  onClick,
  fullWidth = false,
}: {
  className?: string;
  onClick?: () => void;
  fullWidth?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label="Login or Sign up"
      className={authTriggerClassName(fullWidth, className)}
    >
      Login / Sign up
    </button>
  );
}

/**
 * Signed-in account control — text button + menu (no avatar photo).
 * Matches Login / Sign up styling so it sits cleanly beside nav links.
 */
function SignedInAccountMenu({
  isAdmin,
  fullWidth = false,
  onNavigate,
}: {
  isAdmin: boolean;
  fullWidth?: boolean;
  onNavigate?: () => void;
}) {
  const { signOut, openUserProfile } = useClerk();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        className={authTriggerClassName(fullWidth)}
        aria-label="Account menu"
      >
        Account
        <ChevronDownIcon className="size-4 opacity-70" aria-hidden />
      </DropdownMenuTrigger>

      <DropdownMenuContent
        align={fullWidth ? "center" : "end"}
        sideOffset={8}
        className="min-w-48 font-montserrat"
      >
        {isAdmin ? (
          <DropdownMenuItem
            render={
              <Link
                href={ROUTES.DASHBOARD.ROOT}
                onClick={onNavigate}
              />
            }
          >
            <LayoutDashboardIcon className="size-4" aria-hidden />
            Dashboard
          </DropdownMenuItem>
        ) : null}

        <DropdownMenuItem
          onClick={() => {
            onNavigate?.();
            openUserProfile();
          }}
        >
          <UserIcon className="size-4" aria-hidden />
          Manage account
        </DropdownMenuItem>

        <DropdownMenuSeparator />

        <DropdownMenuItem
          variant="destructive"
          onClick={() => {
            onNavigate?.();
            void signOut({ redirectUrl: ROUTES.PUBLIC.HOME });
          }}
        >
          <LogOutIcon className="size-4" aria-hidden />
          Sign out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

/**
 * Navbar auth chrome:
 * - Guests → “Login / Sign up”
 * - Sessions → “Account” dropdown (no profile photo)
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
          ? "flex w-full flex-col items-stretch gap-3"
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
          <GuestLoginTrigger fullWidth={isVertical} onClick={onNavigate} />
        </SignInButton>
      </Show>

      <Show when="signed-in">
        <SignedInAccountMenu
          isAdmin={isAdmin}
          fullWidth={isVertical}
          onNavigate={onNavigate}
        />
      </Show>
    </div>
  );
}
