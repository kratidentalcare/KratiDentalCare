import type { Metadata } from "next";

import { PageHeader } from "@/components/dashboard";
import { UsersWorkspace } from "@/features/users/components/users-workspace";
import { listUsers } from "@/features/users/services/list-users";
import { PERMISSIONS, requirePermission } from "@/lib/auth";
import { userListQuerySchema } from "@/validators/user-management";

export const metadata: Metadata = {
  title: "Users",
};

type UsersPageProps = {
  searchParams: Promise<{
    page?: string;
    search?: string;
    role?: string;
    status?: string;
    limit?: string;
  }>;
};

/**
 * Admin user & role management — identity layer only (Clerk + Mongo users).
 */
export default async function UsersPage({ searchParams }: UsersPageProps) {
  const actor = await requirePermission(PERMISSIONS.USERS_READ);
  const params = await searchParams;

  const parsed = userListQuerySchema.safeParse({
    page: params.page,
    limit: params.limit,
    search: params.search,
    role: params.role,
    status: params.status,
  });

  const data = await listUsers(
    parsed.success
      ? parsed.data
      : userListQuerySchema.parse({ role: "all", status: "all" }),
  );

  return (
    <div className="flex flex-col gap-6 sm:gap-8">
      <PageHeader
        title="Users"
        description="View registered users, change roles, and enable or disable dashboard access. Users are never deleted from this screen."
      />
      <UsersWorkspace
        initialData={data}
        currentUserId={String(actor._id)}
      />
    </div>
  );
}
