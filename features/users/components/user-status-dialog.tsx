"use client";

import { useTransition } from "react";
import { toast } from "sonner";

import { USER_ACCESS_STATUSES } from "@/constants/user-status";
import { updateUserAccessStatusAction } from "@/features/users/actions";
import { assertCanChangeOwnAccessStatus } from "@/features/users/lib/self-protection";
import type { UserListItem } from "@/features/users/types";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type UserStatusDialogProps = {
  user: UserListItem | null;
  currentUserId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onComplete: () => void;
};

export function UserStatusDialog({
  user,
  currentUserId,
  open,
  onOpenChange,
  onComplete,
}: UserStatusDialogProps) {
  const [isPending, startTransition] = useTransition();
  const disabling = user?.status === USER_ACCESS_STATUSES.ACTIVE;
  const nextStatus = disabling
    ? USER_ACCESS_STATUSES.DISABLED
    : USER_ACCESS_STATUSES.ACTIVE;

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent size="default">
        <AlertDialogHeader>
          <AlertDialogTitle>
            {disabling ? "Disable user access?" : "Enable user access?"}
          </AlertDialogTitle>
          <AlertDialogDescription>
            {user
              ? disabling
                ? `Are you sure you want to disable ${user.fullName}'s access? They will no longer be able to use protected dashboard routes.`
                : `Are you sure you want to enable ${user.fullName}'s access again?`
              : "Select a user first."}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isPending}>Cancel</AlertDialogCancel>
          <AlertDialogAction
            disabled={isPending || !user}
            className={cn(
              disabling && buttonVariants({ variant: "destructive" }),
            )}
            onClick={() => {
              if (!user) {
                return;
              }

              startTransition(async () => {
                try {
                  assertCanChangeOwnAccessStatus(
                    currentUserId,
                    user.id,
                    nextStatus,
                  );
                } catch (error) {
                  toast.error(
                    error instanceof Error
                      ? error.message
                      : "This status change is not allowed",
                  );
                  return;
                }

                const result = await updateUserAccessStatusAction({
                  userId: user.id,
                  status: nextStatus,
                });

                if (!result.success) {
                  toast.error(result.error.message);
                  return;
                }

                toast.success(
                  disabling
                    ? "User access disabled"
                    : "User access enabled",
                );
                onOpenChange(false);
                onComplete();
              });
            }}
          >
            {isPending
              ? "Please wait…"
              : disabling
                ? "Disable access"
                : "Enable access"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
