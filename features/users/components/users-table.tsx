"use client";

import {
  EyeIcon,
  MoreHorizontalIcon,
  ShieldIcon,
  UserRoundMinusIcon,
  UserRoundPlusIcon,
} from "lucide-react";

import { USER_ROLES, type UserRole } from "@/constants/roles";
import { USER_ACCESS_STATUSES } from "@/constants/user-status";
import {
  formatUserDate,
  formatUserDateTime,
  formatUserRoleDisplay,
} from "@/features/users/lib/format";
import {
  canDisableInUi,
  isSelfTarget,
} from "@/features/users/lib/self-protection";
import type { UserListItem } from "@/features/users/types";
import {
  DataTable,
  type DataTableColumn,
  StatusBadge,
  UserAvatar,
} from "@/components/shared";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const ROLE_BADGE_CLASS: Record<UserRole, string> = {
  [USER_ROLES.ADMIN]:
    "border-violet-200 bg-violet-50 text-violet-900 dark:border-violet-900/50 dark:bg-violet-950/40 dark:text-violet-200",
  [USER_ROLES.DOCTOR]:
    "border-sky-200 bg-sky-50 text-sky-900 dark:border-sky-900/50 dark:bg-sky-950/40 dark:text-sky-200",
  [USER_ROLES.STAFF]:
    "border-amber-200 bg-amber-50 text-amber-900 dark:border-amber-900/50 dark:bg-amber-950/40 dark:text-amber-200",
  [USER_ROLES.PATIENT]:
    "border-emerald-200 bg-emerald-50 text-emerald-900 dark:border-emerald-900/50 dark:bg-emerald-950/40 dark:text-emerald-200",
};

type UsersTableProps = {
  items: UserListItem[];
  currentUserId: string;
  onView: (user: UserListItem) => void;
  onChangeRole: (user: UserListItem) => void;
  onToggleStatus: (user: UserListItem) => void;
};

export function UsersTable({
  items,
  currentUserId,
  onView,
  onChangeRole,
  onToggleStatus,
}: UsersTableProps) {
  const columns: DataTableColumn<UserListItem>[] = [
    {
      id: "user",
      header: "Name",
      cell: (row) => (
        <div className="flex items-center gap-3">
          <UserAvatar name={row.fullName} src={row.profileImage} size="sm" />
          <div className="min-w-0">
            <button
              type="button"
              className="truncate text-left font-medium text-brand-dark hover:underline"
              onClick={() => onView(row)}
            >
              {row.fullName}
            </button>
            {isSelfTarget(currentUserId, row.id) ? (
              <p className="text-xs text-muted-foreground">You</p>
            ) : null}
          </div>
        </div>
      ),
    },
    {
      id: "email",
      header: "Email",
      className: "hidden md:table-cell",
      cell: (row) => (
        <span className="text-muted-foreground">{row.email}</span>
      ),
    },
    {
      id: "phone",
      header: "Phone",
      className: "hidden lg:table-cell",
      cell: (row) => row.phoneNumber ?? "—",
    },
    {
      id: "role",
      header: "Role",
      cell: (row) => (
        <Badge variant="outline" className={ROLE_BADGE_CLASS[row.role]}>
          {formatUserRoleDisplay(row.role)}
        </Badge>
      ),
    },
    {
      id: "status",
      header: "Status",
      cell: (row) => (
        <StatusBadge
          status={
            row.status === USER_ACCESS_STATUSES.ACTIVE ? "ACTIVE" : "INACTIVE"
          }
          label={
            row.status === USER_ACCESS_STATUSES.ACTIVE ? "Active" : "Disabled"
          }
        />
      ),
    },
    {
      id: "joined",
      header: "Joined",
      className: "hidden xl:table-cell",
      cell: (row) => formatUserDate(row.createdAt),
    },
    {
      id: "lastLogin",
      header: "Last login",
      className: "hidden xl:table-cell",
      cell: (row) => formatUserDateTime(row.lastLoginAt),
    },
    {
      id: "actions",
      header: <span className="sr-only">Actions</span>,
      className: "w-12 text-right",
      cell: (row) => {
        const isSelf = isSelfTarget(currentUserId, row.id);
        const canDisable = canDisableInUi(currentUserId, row.id);
        const isActive = row.status === USER_ACCESS_STATUSES.ACTIVE;

        return (
          <DropdownMenu>
            <DropdownMenuTrigger
              render={
                <Button
                  type="button"
                  variant="ghost"
                  size="icon-sm"
                  aria-label={`Actions for ${row.fullName}`}
                />
              }
            >
              <MoreHorizontalIcon className="size-4" />
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem
                className="cursor-pointer gap-2"
                onClick={() => onView(row)}
              >
                <EyeIcon className="size-4" />
                View details
              </DropdownMenuItem>
              <DropdownMenuItem
                className="cursor-pointer gap-2"
                onClick={() => onChangeRole(row)}
                disabled={isSelf && row.role === USER_ROLES.ADMIN}
              >
                <ShieldIcon className="size-4" />
                Change role
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                className="cursor-pointer gap-2"
                onClick={() => onToggleStatus(row)}
                disabled={!canDisable && isActive}
              >
                {isActive ? (
                  <>
                    <UserRoundMinusIcon className="size-4" />
                    Disable access
                  </>
                ) : (
                  <>
                    <UserRoundPlusIcon className="size-4" />
                    Enable access
                  </>
                )}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        );
      },
    },
  ];

  return (
    <DataTable
      columns={columns}
      rows={items}
      getRowId={(row) => row.id}
      caption="Users"
      emptyTitle="No users found"
      emptyDescription="Try adjusting search or filters. Users appear here after they sign in with Clerk."
      renderMobileRow={(row) => {
        const isSelf = isSelfTarget(currentUserId, row.id);
        const canDisable = canDisableInUi(currentUserId, row.id);
        const isActive = row.status === USER_ACCESS_STATUSES.ACTIVE;

        return (
          <div className="flex flex-col gap-3">
            <div className="flex items-start justify-between gap-3">
              <div className="flex min-w-0 items-center gap-3">
                <UserAvatar
                  name={row.fullName}
                  src={row.profileImage}
                  size="sm"
                />
                <div className="min-w-0">
                  <button
                    type="button"
                    className="truncate text-left font-medium text-brand-dark hover:underline"
                    onClick={() => onView(row)}
                  >
                    {row.fullName}
                  </button>
                  <p className="truncate text-sm text-muted-foreground">
                    {row.email}
                  </p>
                </div>
              </div>
              <StatusBadge
                status={isActive ? "ACTIVE" : "INACTIVE"}
                label={isActive ? "Active" : "Disabled"}
              />
            </div>
            <dl className="grid grid-cols-2 gap-2 text-sm">
              <div>
                <dt className="text-muted-foreground">Role</dt>
                <dd className="font-medium">
                  {formatUserRoleDisplay(row.role)}
                </dd>
              </div>
              <div>
                <dt className="text-muted-foreground">Phone</dt>
                <dd className="font-medium">{row.phoneNumber ?? "—"}</dd>
              </div>
              <div>
                <dt className="text-muted-foreground">Joined</dt>
                <dd className="font-medium">{formatUserDate(row.createdAt)}</dd>
              </div>
              <div>
                <dt className="text-muted-foreground">Last login</dt>
                <dd className="font-medium">
                  {formatUserDateTime(row.lastLoginAt)}
                </dd>
              </div>
            </dl>
            <div className="flex flex-wrap gap-2">
              <Button
                type="button"
                size="sm"
                variant="outline"
                onClick={() => onView(row)}
              >
                View
              </Button>
              <Button
                type="button"
                size="sm"
                variant="outline"
                onClick={() => onChangeRole(row)}
                disabled={isSelf && row.role === USER_ROLES.ADMIN}
              >
                Role
              </Button>
              <Button
                type="button"
                size="sm"
                variant="ghost"
                onClick={() => onToggleStatus(row)}
                disabled={!canDisable && isActive}
              >
                {isActive ? "Disable" : "Enable"}
              </Button>
            </div>
          </div>
        );
      }}
    />
  );
}
