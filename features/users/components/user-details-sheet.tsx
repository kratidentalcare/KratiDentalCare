"use client";

import type { ReactNode } from "react";

import { USER_ACCESS_STATUSES } from "@/constants/user-status";
import {
  formatUserDate,
  formatUserDateTime,
  formatUserRoleDisplay,
} from "@/features/users/lib/format";
import type { UserListItem } from "@/features/users/types";
import { StatusBadge, UserAvatar } from "@/components/shared";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";

type UserDetailsSheetProps = {
  user: UserListItem | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

function DetailRow({
  label,
  value,
}: {
  label: string;
  value: ReactNode;
}) {
  return (
    <div>
      <dt className="text-muted-foreground">{label}</dt>
      <dd className="mt-1 break-all font-medium text-brand-dark">{value}</dd>
    </div>
  );
}

export function UserDetailsSheet({
  user,
  open,
  onOpenChange,
}: UserDetailsSheetProps) {
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="right"
        showCloseButton
        className="flex w-full flex-col gap-0 sm:max-w-lg"
      >
        {user ? (
          <>
            <SheetHeader className="border-b border-[#E5E7EB] text-left">
              <div className="flex items-center gap-3">
                <UserAvatar
                  name={user.fullName}
                  src={user.profileImage}
                  size="lg"
                />
                <div className="min-w-0">
                  <SheetTitle className="font-montserrat text-lg text-brand-dark">
                    {user.fullName}
                  </SheetTitle>
                  <SheetDescription className="truncate">
                    {user.email}
                  </SheetDescription>
                </div>
              </div>
              <div className="flex flex-wrap gap-2 pt-2">
                <Badge variant="outline">
                  {formatUserRoleDisplay(user.role)}
                </Badge>
                <StatusBadge
                  status={
                    user.status === USER_ACCESS_STATUSES.ACTIVE
                      ? "ACTIVE"
                      : "INACTIVE"
                  }
                  label={
                    user.status === USER_ACCESS_STATUSES.ACTIVE
                      ? "Active"
                      : "Disabled"
                  }
                />
              </div>
            </SheetHeader>

            <div className="flex flex-1 flex-col gap-5 overflow-y-auto px-4 py-5">
              <dl className="grid gap-4 text-sm">
                <DetailRow label="Name" value={user.fullName} />
                <DetailRow label="Email" value={user.email} />
                <DetailRow
                  label="Phone"
                  value={user.phoneNumber ?? "—"}
                />
                <DetailRow
                  label="Role"
                  value={formatUserRoleDisplay(user.role)}
                />
                <DetailRow
                  label="Status"
                  value={
                    user.status === USER_ACCESS_STATUSES.ACTIVE
                      ? "Active"
                      : "Disabled"
                  }
                />
                <DetailRow
                  label="Joined date"
                  value={formatUserDate(user.createdAt)}
                />
                <DetailRow
                  label="Last login"
                  value={formatUserDateTime(user.lastLoginAt)}
                />
              </dl>

              <Separator />

              <dl className="grid gap-4 text-sm">
                <DetailRow label="Clerk ID" value={user.clerkId} />
                <DetailRow label="Internal User ID" value={user.id} />
              </dl>
            </div>
          </>
        ) : null}
      </SheetContent>
    </Sheet>
  );
}
