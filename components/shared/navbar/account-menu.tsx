"use client";

import { useEffect, useState } from "react";
import { useClerk, useUser } from "@clerk/nextjs";
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
  isAdmin: boolean;
  triggerClassName: string;
  onNavigate?: () => void;
};

/**
 * Signed-in account control — bottom sheet on mobile, centered modal on desktop.
 */
export function AccountMenu({
  isAdmin: isAdminFromServer,
  triggerClassName,
  onNavigate,
}: AccountMenuProps) {
  const { signOut, openUserProfile } = useClerk();
  const { user } = useUser();
  const [open, setOpen] = useState(false);
  const [isAdmin, setIsAdmin] = useState(isAdminFromServer);

  const email = user?.primaryEmailAddress?.emailAddress ?? "";
  const displayName = getAccountDisplayName(user?.firstName, user?.lastName, email);
  const initials = getAccountInitials(user?.firstName, user?.lastName, email);

  useEffect(() => {
    setIsAdmin(isAdminFromServer);
  }, [isAdminFromServer]);

  useEffect(() => {
    let cancelled = false;

    void resolveNavbarIsAdmin().then((admin) => {
      if (!cancelled) {
        setIsAdmin(admin);
      }
    });

    return () => {
      cancelled = true;
    };
  }, []);

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

        {isAdmin ? (
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
