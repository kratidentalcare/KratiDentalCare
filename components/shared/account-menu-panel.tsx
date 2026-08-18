"use client";

import Link from "next/link";
import type { ReactNode } from "react";
import type { LucideIcon } from "lucide-react";

import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/components/ui/avatar";
import {
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";

const panelClassName = cn(
  "flex w-full flex-col gap-0 overflow-hidden bg-white p-0 font-montserrat text-brand-dark ring-0",
  "top-auto right-0 bottom-0 left-0 max-w-none translate-x-0 translate-y-0",
  "rounded-[1.75rem] max-sm:rounded-b-none",
  "pb-[max(0.5rem,env(safe-area-inset-bottom))]",
  "shadow-[0_-16px_40px_rgb(26_50_102_/_18%)]",
  "duration-200 data-open:slide-in-from-bottom-8 data-closed:slide-out-to-bottom-8",
  "sm:top-1/2 sm:right-auto sm:bottom-auto sm:left-1/2 sm:w-[23.5rem] sm:max-w-[calc(100%-2rem)]",
  "sm:-translate-x-1/2 sm:-translate-y-1/2",
  "sm:pb-2 sm:shadow-[0_28px_64px_rgb(26_50_102_/_22%)]",
  "sm:data-open:slide-in-from-bottom-0 sm:data-closed:slide-out-to-bottom-0",
);

const overlayClassName = cn(
  "bg-brand-navy/25 duration-200",
  "supports-backdrop-filter:bg-brand-navy/15 supports-backdrop-filter:backdrop-blur-sm",
);

const itemClassName = cn(
  "flex w-full cursor-pointer items-center gap-3.5 px-5 py-4 text-left text-[0.9375rem] text-brand-dark",
  "transition-colors duration-150",
  "hover:bg-brand-surface focus-visible:bg-brand-surface",
  "focus-visible:outline-none",
);

export function getAccountDisplayName(
  firstName: string | null | undefined,
  lastName: string | null | undefined,
  email: string,
): string {
  const name = [firstName, lastName].filter(Boolean).join(" ");
  return name || email || "Account";
}

export function getAccountInitials(
  firstName: string | null | undefined,
  lastName: string | null | undefined,
  email: string,
): string {
  const first = firstName?.trim().charAt(0);
  const last = lastName?.trim().charAt(0);
  if (first && last) {
    return `${first}${last}`.toUpperCase();
  }
  if (first) {
    return first.toUpperCase();
  }
  return email.charAt(0).toUpperCase() || "A";
}

export function AccountMenuPanel({ children }: { children: ReactNode }) {
  return (
    <DialogContent
      showCloseButton={false}
      overlayClassName={overlayClassName}
      className={panelClassName}
    >
      <div
        className="mx-auto mt-2.5 h-1.5 w-12 shrink-0 rounded-full bg-brand-navy/15 sm:hidden"
        aria-hidden
      />
      <DialogTitle className="sr-only">Account menu</DialogTitle>
      <DialogDescription className="sr-only">
        View your profile, manage your account, or sign out.
      </DialogDescription>
      {children}
    </DialogContent>
  );
}

export function AccountMenuHeader({
  displayName,
  email,
  imageUrl,
  initials,
}: {
  displayName: string;
  email: string;
  imageUrl?: string | null;
  initials: string;
}) {
  return (
    <div className="flex items-center gap-3.5 px-5 py-5">
      <Avatar className="size-12">
        {imageUrl ? <AvatarImage src={imageUrl} alt="" /> : null}
        <AvatarFallback className="bg-brand-blue/12 font-semibold text-brand-blue">
          {initials}
        </AvatarFallback>
      </Avatar>
      <div className="min-w-0 flex-1">
        <p className="truncate text-[0.9375rem] font-bold tracking-[0.04em] text-brand-dark uppercase">
          {displayName}
        </p>
        {email ? (
          <p className="mt-0.5 truncate text-sm text-brand-muted">{email}</p>
        ) : null}
      </div>
    </div>
  );
}

export function AccountMenuDivider() {
  return <div className="h-px bg-brand-navy/10" />;
}

export function AccountMenuItem({
  icon: Icon,
  children,
  href,
  onClick,
  destructive = false,
  active = false,
}: {
  icon: LucideIcon;
  children: ReactNode;
  href?: string;
  onClick?: () => void;
  destructive?: boolean;
  active?: boolean;
}) {
  const className = cn(
    itemClassName,
    active && "bg-brand-blue/[0.08] text-brand-blue",
    destructive &&
      "text-brand-red hover:bg-brand-red/[0.06] focus-visible:bg-brand-red/[0.06]",
  );
  const iconClassName = cn(
    "size-5 shrink-0",
    destructive ? "text-brand-red" : "text-brand-blue",
  );
  const content = (
    <>
      <Icon className={iconClassName} strokeWidth={1.75} aria-hidden />
      <span>{children}</span>
    </>
  );

  if (href) {
    return (
      <Link href={href} className={className} onClick={onClick}>
        {content}
      </Link>
    );
  }

  return (
    <button type="button" className={className} onClick={onClick}>
      {content}
    </button>
  );
}
