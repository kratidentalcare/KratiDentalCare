"use client";

import Link from "next/link";
import { Show, SignInButton, useAuth, useClerk } from "@clerk/nextjs";
import { LayoutDashboardIcon, LogOutIcon, UserIcon } from "lucide-react";

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
 * Signed-in account control — user icon + menu (no avatar photo).
 */
function SignedInAccountMenu({
  isAdmin,
  onNavigate,
}: {
  isAdmin: boolean;
  onNavigate?: () => void;
}) {
  const { signOut, openUserProfile } = useClerk();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        className={authIconClassName}
        aria-label="Account menu"
      >
        <UserIcon className="size-5" strokeWidth={1.75} aria-hidden />
      </DropdownMenuTrigger>

      <DropdownMenuContent
        align="end"
        sideOffset={8}
        className="min-w-48 font-montserrat"
      >
        {isAdmin ? (
          <DropdownMenuItem
            render={
              <Link href={ROUTES.DASHBOARD.ROOT} onClick={onNavigate} />
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
 * - Guests → user icon (opens sign-in)
 * - Sessions → user icon dropdown
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
        <SignedInAccountMenu isAdmin={isAdmin} onNavigate={onNavigate} />
      </Show>
    </div>
  );
}
