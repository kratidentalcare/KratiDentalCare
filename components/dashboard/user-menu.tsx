"use client";

import Link from "next/link";
import { useClerk } from "@clerk/nextjs";
import { ChevronsUpDownIcon, LogOutIcon, UserIcon } from "lucide-react";

import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
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

function getDisplayName(user: DashboardUser): string {
  const name = [user.firstName, user.lastName].filter(Boolean).join(" ");
  return name || user.email;
}

function getInitials(user: DashboardUser): string {
  const first = user.firstName?.trim().charAt(0);
  const last = user.lastName?.trim().charAt(0);
  if (first && last) {
    return `${first}${last}`.toUpperCase();
  }
  if (first) {
    return first.toUpperCase();
  }
  return user.email.charAt(0).toUpperCase() || "A";
}

/**
 * Account menu — profile shortcut + Clerk sign-out.
 */
export function UserMenu({ user, className }: UserMenuProps) {
  const { signOut } = useClerk();
  const displayName = getDisplayName(user);
  const initials = getInitials(user);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
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
      </DropdownMenuTrigger>

      <DropdownMenuContent
        align="end"
        sideOffset={8}
        className="w-56 font-montserrat"
      >
        <DropdownMenuGroup>
          <DropdownMenuLabel className="font-normal">
            <span className="block truncate text-sm font-medium text-brand-dark">
              {displayName}
            </span>
            <span className="mt-0.5 block truncate text-xs text-brand-muted">
              {user.email}
            </span>
          </DropdownMenuLabel>
        </DropdownMenuGroup>

        <DropdownMenuSeparator />

        <DropdownMenuItem
          render={<Link href={ROUTES.DASHBOARD.PROFILE} />}
          className="cursor-pointer gap-2"
        >
          <UserIcon className="size-4 text-brand-muted" aria-hidden />
          Profile
        </DropdownMenuItem>

        <DropdownMenuSeparator />

        <DropdownMenuItem
          variant="destructive"
          className="cursor-pointer gap-2"
          onClick={() => {
            void signOut({ redirectUrl: ROUTES.HOME });
          }}
        >
          <LogOutIcon className="size-4" aria-hidden />
          Logout
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
