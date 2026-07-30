"use client";

import { useCallback, useMemo, useState, useTransition } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Loader2Icon } from "lucide-react";

import { USER_ROLES } from "@/constants/roles";
import { USER_ACCESS_STATUSES } from "@/constants/user-status";
import { UserDetailsSheet } from "@/features/users/components/user-details-sheet";
import { UserRoleDialog } from "@/features/users/components/user-role-dialog";
import { UserStatusDialog } from "@/features/users/components/user-status-dialog";
import { UsersTable } from "@/features/users/components/users-table";
import { formatUserRoleDisplay } from "@/features/users/lib/format";
import type { UserListItem, UserListResult } from "@/features/users/types";
import {
  ListToolbar,
  PaginationControls,
  SearchInput,
} from "@/components/shared";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

type UsersWorkspaceProps = {
  initialData: UserListResult;
  currentUserId: string;
};

export function UsersWorkspace({
  initialData,
  currentUserId,
}: UsersWorkspaceProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isRefreshing, startRefresh] = useTransition();
  const [searchValue, setSearchValue] = useState(
    () => searchParams.get("search") ?? "",
  );
  const [viewingUser, setViewingUser] = useState<UserListItem | null>(null);
  const [roleUser, setRoleUser] = useState<UserListItem | null>(null);
  const [statusUser, setStatusUser] = useState<UserListItem | null>(null);

  const filters = useMemo(
    () => ({
      search: searchParams.get("search") ?? "",
      role: searchParams.get("role") ?? "all",
      status: searchParams.get("status") ?? "all",
      page: Number(searchParams.get("page") ?? "1"),
    }),
    [searchParams],
  );

  const updateParams = useCallback(
    (updates: Record<string, string | null>) => {
      const params = new URLSearchParams(searchParams.toString());
      for (const [key, value] of Object.entries(updates)) {
        if (
          value === null ||
          value === "" ||
          (key !== "page" && value === "all")
        ) {
          params.delete(key);
        } else {
          params.set(key, value);
        }
      }
      router.replace(`${pathname}?${params.toString()}`);
    },
    [pathname, router, searchParams],
  );

  const refresh = useCallback(() => {
    startRefresh(() => {
      router.refresh();
    });
  }, [router]);

  return (
    <div className="flex flex-col gap-4 sm:gap-6">
      <Card className="border-0 shadow-none ring-1 ring-[#E5E7EB]">
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-semibold">Users</CardTitle>
          <CardDescription>
            Search by name, email, or phone. Filter by role and access status.
            Newest registrations appear first.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ListToolbar
            start={
              <div className="grid gap-3 sm:grid-cols-[1fr_10rem_10rem]">
                <SearchInput
                  value={searchValue}
                  placeholder="Search name, email, or phone…"
                  onValueChange={setSearchValue}
                  onKeyDown={(event) => {
                    if (event.key === "Enter") {
                      updateParams({
                        search: searchValue.trim() || null,
                        page: "1",
                      });
                    }
                  }}
                  onClear={() => {
                    setSearchValue("");
                    updateParams({ search: null, page: "1" });
                  }}
                />
                <Select
                  value={filters.role || "all"}
                  onValueChange={(value) =>
                    updateParams({
                      role: value === "all" ? null : value,
                      page: "1",
                    })
                  }
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="All roles" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All roles</SelectItem>
                    {Object.values(USER_ROLES).map((role) => (
                      <SelectItem key={role} value={role}>
                        {formatUserRoleDisplay(role)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Select
                  value={filters.status || "all"}
                  onValueChange={(value) =>
                    updateParams({
                      status: value === "all" ? null : value,
                      page: "1",
                    })
                  }
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="All statuses" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All statuses</SelectItem>
                    <SelectItem value={USER_ACCESS_STATUSES.ACTIVE}>
                      Active
                    </SelectItem>
                    <SelectItem value={USER_ACCESS_STATUSES.DISABLED}>
                      Disabled
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
            }
          />
        </CardContent>
      </Card>

      <div className="relative rounded-xl ring-1 ring-[#E5E7EB]">
        {isRefreshing ? (
          <div className="absolute inset-0 z-10 flex items-center justify-center rounded-xl bg-white/60">
            <Loader2Icon className="size-6 animate-spin text-brand-blue" />
          </div>
        ) : null}
        <div className="p-3 sm:p-4">
          <UsersTable
            items={initialData.items}
            currentUserId={currentUserId}
            onView={setViewingUser}
            onChangeRole={setRoleUser}
            onToggleStatus={setStatusUser}
          />
        </div>
      </div>

      <PaginationControls
        page={initialData.pagination.page}
        pageSize={initialData.pagination.limit}
        totalItems={initialData.pagination.total}
        onPageChange={(page) => updateParams({ page: String(page) })}
      />

      <UserDetailsSheet
        user={viewingUser}
        open={viewingUser !== null}
        onOpenChange={(open) => {
          if (!open) setViewingUser(null);
        }}
      />

      <UserRoleDialog
        user={roleUser}
        currentUserId={currentUserId}
        open={roleUser !== null}
        onOpenChange={(open) => {
          if (!open) setRoleUser(null);
        }}
        onComplete={refresh}
      />

      <UserStatusDialog
        user={statusUser}
        currentUserId={currentUserId}
        open={statusUser !== null}
        onOpenChange={(open) => {
          if (!open) setStatusUser(null);
        }}
        onComplete={refresh}
      />
    </div>
  );
}
