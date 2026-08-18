"use client";

import { useState } from "react";
import { useClerk } from "@clerk/nextjs";
import { LogInIcon, UserPlusIcon, UserIcon } from "lucide-react";

import {
  AccountMenuDivider,
  AccountMenuHeader,
  AccountMenuItem,
  AccountMenuPanel,
} from "@/components/shared/account-menu-panel";
import { Dialog, DialogTrigger } from "@/components/ui/dialog";
import { AUTH_CONFIG } from "@/config/auth";
import { clerkAppearance } from "@/config/clerk-appearance";

type GuestAccountMenuProps = {
  triggerClassName: string;
  onNavigate?: () => void;
};

/**
 * Guest account control — Sign in and Sign up in the same modal shell.
 */
export function GuestAccountMenu({
  triggerClassName,
  onNavigate,
}: GuestAccountMenuProps) {
  const { openSignIn, openSignUp } = useClerk();
  const [open, setOpen] = useState(false);

  const close = () => {
    setOpen(false);
    onNavigate?.();
  };

  function openClerk(mode: "sign-in" | "sign-up") {
    close();
    window.setTimeout(() => {
      if (mode === "sign-in") {
        openSignIn({
          appearance: clerkAppearance,
          fallbackRedirectUrl: AUTH_CONFIG.afterSignInUrl,
        });
        return;
      }

      openSignUp({
        appearance: clerkAppearance,
        fallbackRedirectUrl: AUTH_CONFIG.afterSignUpUrl,
      });
    }, 160);
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger className={triggerClassName} aria-label="Sign in or Sign up">
        <UserIcon className="size-5" strokeWidth={1.75} aria-hidden />
      </DialogTrigger>

      <AccountMenuPanel description="Sign in to your account or create a new one.">
        <AccountMenuHeader
          displayName="Welcome"
          email="Sign in or create an account"
          initials=""
        />

        <AccountMenuDivider />

        <AccountMenuItem icon={LogInIcon} onClick={() => openClerk("sign-in")}>
          Sign in
        </AccountMenuItem>

        <AccountMenuDivider />

        <AccountMenuItem icon={UserPlusIcon} onClick={() => openClerk("sign-up")}>
          Sign up
        </AccountMenuItem>
      </AccountMenuPanel>
    </Dialog>
  );
}
