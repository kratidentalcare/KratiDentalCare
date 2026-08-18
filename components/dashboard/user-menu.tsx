"use client";

import { useState } from "react";
import { usePathname } from "next/navigation";
import { useClerk } from "@clerk/nextjs";
import {
  ChevronsUpDownIcon,
  ExternalLinkIcon,
  LayoutDashboardIcon,
  LogOutIcon,
  SettingsIcon,
  UserIcon,
} from "lucide-react";

import {
  AccountMenuDivider,
  AccountMenuHeader,
  AccountMenuItem,
  AccountMenuPanel,
  getAccountDisplayName,
  getAccountInitials,
} from "@/components/shared/account-menu-panel";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Dialog, DialogTrigger } from "@/components/ui/dialog";
import { ROUTES } from "@/constants/routes";
import { cn } from "@/lib/utils";

export type DashboardUser = {
  firstName: string | null;
  lastName: string | null;
  email: string;
  profileImage: string | null;
};

export type UserMenuProps = {
  user: DashboardUser;
  className?: string;
};

function isActivePath(pathname: string, href: string, exact = false): boolean {
  if (exact) {
    return pathname === href;
  }
  return pathname === href || pathname.startsWith(`${href}/`);
}

/**
 * Account menu — bottom sheet on mobile, centered modal on desktop.
 */
export function UserMenu({ user, className }: UserMenuProps) {
  const pathname = usePathname();
  const { signOut, openUserProfile } = useClerk();
  const [open, setOpen] = useState(false);
  const displayName = getAccountDisplayName(
    user.firstName,
    user.lastName,
    user.email,
  );
  const initials = getAccountInitials(
    user.firstName,
    user.lastName,
    user.email,
  );

  const dashboardActive = isActivePath(pathname, ROUTES.DASHBOARD.ROOT, true);
  const profileActive = isActivePath(pathname, ROUTES.DASHBOARD.PROFILE);
  const close = () => setOpen(false);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger
        render={
          <Button
            type="button"
            variant="outline"
            className={cn(
              "h-10 gap-2 rounded-xl border-[#E5E7EB] bg-white px-2.5",
              "hover:border-brand-blue/30 hover:bg-brand-blue/[0.04]",
              "focus-visible:ring-brand-blue/40",
              className,
            )}
          />
        }
      >
        <Avatar size="sm" className="size-7">
          {user.profileImage ? (
            <AvatarImage src={user.profileImage} alt="" />
          ) : null}
          <AvatarFallback className="bg-brand-blue/10 text-[0.6875rem] font-semibold text-brand-blue">
            {initials}
          </AvatarFallback>
        </Avatar>
        <span className="hidden max-w-[8rem] truncate text-left text-sm font-medium text-brand-dark sm:inline">
          {displayName}
        </span>
        <ChevronsUpDownIcon
          className="hidden size-3.5 text-brand-muted sm:inline"
          aria-hidden
        />
        <span className="sr-only">Open user menu</span>
      </DialogTrigger>

      <AccountMenuPanel>
        <AccountMenuHeader
          displayName={displayName}
          email={user.email}
          imageUrl={user.profileImage}
          initials={initials}
        />

        <AccountMenuDivider />

        <AccountMenuItem
          icon={LayoutDashboardIcon}
          href={ROUTES.DASHBOARD.ROOT}
          active={dashboardActive}
          onClick={close}
        >
          Dashboard
        </AccountMenuItem>

        <AccountMenuDivider />

        <AccountMenuItem
          icon={UserIcon}
          href={ROUTES.DASHBOARD.PROFILE}
          active={profileActive}
          onClick={close}
        >
          My Profile
        </AccountMenuItem>

        <AccountMenuDivider />

        <AccountMenuItem
          icon={SettingsIcon}
          onClick={() => {
            close();
            window.setTimeout(() => {
              openUserProfile();
            }, 160);
          }}
        >
          Manage Account
        </AccountMenuItem>

        <AccountMenuDivider />

        <AccountMenuItem
          icon={ExternalLinkIcon}
          href={ROUTES.PUBLIC.HOME}
          onClick={close}
        >
          View Website
        </AccountMenuItem>

        <AccountMenuDivider />

        <AccountMenuItem
          icon={LogOutIcon}
          destructive
          onClick={() => {
            close();
            void signOut({ redirectUrl: ROUTES.HOME });
          }}
        >
          Sign Out
        </AccountMenuItem>
      </AccountMenuPanel>
    </Dialog>
  );
}
