"use client";

import { useEffect, useState } from "react";
import { useAuth, useClerk, useUser } from "@clerk/nextjs";
import { LayoutDashboardIcon, LogOutIcon, SettingsIcon, UserIcon } from "lucide-react";

import {
  AccountMenuDivider,
  AccountMenuHeader,
  AccountMenuItem,
  AccountMenuPanel,
  getAccountDisplayName,
  getAccountInitials,
} from "@/components/shared/account-menu-panel";
import { Dialog, DialogTrigger } from "@/components/ui/dialog";
import { ROUTES } from "@/constants/routes";
import { resolveNavbarIsAdmin } from "@/lib/auth/resolve-navbar-is-admin";

type AccountMenuProps = {
  showDashboard: boolean;
  triggerClassName: string;
  onNavigate?: () => void;
};

/**
 * Signed-in account control — bottom sheet on mobile, centered modal on desktop.
 */
export function AccountMenu({
  showDashboard: showDashboardFromServer,
  triggerClassName,
  onNavigate,
}: AccountMenuProps) {
  const { signOut, openUserProfile } = useClerk();
  const { isLoaded, isSignedIn } = useAuth();
  const { user } = useUser();
  const [open, setOpen] = useState(false);
  const [showDashboard, setShowDashboard] = useState(showDashboardFromServer);

  const email = user?.primaryEmailAddress?.emailAddress ?? "";
  const displayName = getAccountDisplayName(user?.firstName, user?.lastName, email);
  const initials = getAccountInitials(user?.firstName, user?.lastName, email);

  useEffect(() => {
    setShowDashboard(showDashboardFromServer);
  }, [showDashboardFromServer]);

  useEffect(() => {
    if (!isLoaded) {
      return;
    }

    if (!isSignedIn) {
      setShowDashboard(false);
      return;
    }

    let cancelled = false;

    void resolveNavbarIsAdmin().then((access) => {
      if (!cancelled && access !== null) {
        setShowDashboard(access);
      }
    });

    return () => {
      cancelled = true;
    };
  }, [isLoaded, isSignedIn]);

  const close = () => {
    setOpen(false);
    onNavigate?.();
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger className={triggerClassName} aria-label="Account menu">
        <UserIcon className="size-5" strokeWidth={1.75} aria-hidden />
      </DialogTrigger>

      <AccountMenuPanel>
        <AccountMenuHeader
          displayName={displayName}
          email={email}
          imageUrl={user?.imageUrl}
          initials={initials}
        />

        <AccountMenuDivider />

        {showDashboard ? (
          <>
            <AccountMenuItem
              icon={LayoutDashboardIcon}
              href={ROUTES.DASHBOARD.ROOT}
              onClick={close}
            >
              Dashboard
            </AccountMenuItem>
            <AccountMenuDivider />
          </>
        ) : null}

        <AccountMenuItem
          icon={SettingsIcon}
          onClick={() => {
            close();
            window.setTimeout(() => {
              openUserProfile();
            }, 160);
          }}
        >
          Manage account
        </AccountMenuItem>

        <AccountMenuDivider />

        <AccountMenuItem
          icon={LogOutIcon}
          destructive
          onClick={() => {
            close();
            void signOut({ redirectUrl: ROUTES.PUBLIC.HOME });
          }}
        >
          Sign out
        </AccountMenuItem>
      </AccountMenuPanel>
    </Dialog>
  );
}
