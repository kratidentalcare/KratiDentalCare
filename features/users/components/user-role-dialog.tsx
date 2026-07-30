"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";

import { USER_ROLES, USER_ROLE_VALUES, type UserRole } from "@/constants/roles";
import { updateUserRoleAction } from "@/features/users/actions";
import { formatUserRoleDisplay } from "@/features/users/lib/format";
import {
  assertCanChangeOwnRole,
  isSelfTarget,
} from "@/features/users/lib/self-protection";
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
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

type UserRoleDialogProps = {
  user: UserListItem | null;
  currentUserId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onComplete: () => void;
};

export function UserRoleDialog({
  user,
  currentUserId,
  open,
  onOpenChange,
  onComplete,
}: UserRoleDialogProps) {
  const [isPending, startTransition] = useTransition();
  const [selectedRole, setSelectedRole] = useState<UserRole | "">("");

  const effectiveRole =
    selectedRole || (user?.role ?? ("" as UserRole | ""));
  const isSelf = user ? isSelfTarget(currentUserId, user.id) : false;
  const roleUnchanged = Boolean(user && effectiveRole === user.role);

  const confirmationMessage =
    user && effectiveRole && effectiveRole !== user.role
      ? `Are you sure you want to change ${user.fullName}'s role from ${formatUserRoleDisplay(user.role)} to ${formatUserRoleDisplay(effectiveRole)}?`
      : "Select a new role to continue.";

  return (
    <AlertDialog
      open={open}
      onOpenChange={(nextOpen) => {
        if (!nextOpen) {
          setSelectedRole("");
        }
        onOpenChange(nextOpen);
      }}
    >
      <AlertDialogContent size="default">
        <AlertDialogHeader>
          <AlertDialogTitle>Change user role</AlertDialogTitle>
          <AlertDialogDescription>
            {user
              ? `Update the clinic role for ${user.fullName}. This takes effect on their next protected request.`
              : "Select a user first."}
          </AlertDialogDescription>
        </AlertDialogHeader>

        {user ? (
          <div className="grid gap-3 py-1">
            <div className="grid gap-2">
              <Label htmlFor="user-role-select">New role</Label>
              <Select
                value={effectiveRole || undefined}
                onValueChange={(value) => setSelectedRole(value as UserRole)}
              >
                <SelectTrigger id="user-role-select" className="w-full">
                  <SelectValue placeholder="Select role" />
                </SelectTrigger>
                <SelectContent>
                  {USER_ROLE_VALUES.map((role) => {
                    const blocked =
                      isSelf &&
                      user.role === USER_ROLES.ADMIN &&
                      role !== USER_ROLES.ADMIN;
                    return (
                      <SelectItem
                        key={role}
                        value={role}
                        disabled={blocked}
                      >
                        {formatUserRoleDisplay(role)}
                        {blocked ? " (self-protection)" : ""}
                      </SelectItem>
                    );
                  })}
                </SelectContent>
              </Select>
            </div>
            <p className="text-sm text-muted-foreground">
              {confirmationMessage}
            </p>
          </div>
        ) : null}

        <AlertDialogFooter>
          <AlertDialogCancel disabled={isPending}>Cancel</AlertDialogCancel>
          <AlertDialogAction
            disabled={
              isPending || !user || !effectiveRole || roleUnchanged
            }
            onClick={() => {
              if (!user || !effectiveRole) {
                return;
              }

              startTransition(async () => {
                try {
                  assertCanChangeOwnRole(
                    currentUserId,
                    user.id,
                    user.role,
                    effectiveRole,
                  );
                } catch (error) {
                  toast.error(
                    error instanceof Error
                      ? error.message
                      : "This role change is not allowed",
                  );
                  return;
                }

                const result = await updateUserRoleAction({
                  userId: user.id,
                  role: effectiveRole,
                });

                if (!result.success) {
                  toast.error(result.error.message);
                  return;
                }

                toast.success(
                  `Role updated to ${formatUserRoleDisplay(result.data.role)}`,
                );
                setSelectedRole("");
                onOpenChange(false);
                onComplete();
              });
            }}
          >
            {isPending ? "Please wait…" : "Confirm role change"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
