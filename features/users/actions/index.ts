"use server";

import { revalidatePath } from "next/cache";

import { ROUTES } from "@/constants/routes";
import { getUserDetail } from "@/features/users/services/get-user";
import { listUsers } from "@/features/users/services/list-users";
import { updateUserRole } from "@/features/users/services/update-user-role";
import { updateUserAccessStatus } from "@/features/users/services/update-user-status";
import {
  fromUnknownError,
  successResponse,
  toActionResult,
  validationErrorResponse,
} from "@/lib/api-response";
import { PERMISSIONS, requirePermission } from "@/lib/auth";
import type { ActionResult } from "@/types/api";
import { objectIdSchema } from "@/validators/common";
import {
  updateUserAccessStatusSchema,
  updateUserRoleSchema,
  userListQuerySchema,
} from "@/validators/user-management";
import { z } from "zod";

function revalidateUsers() {
  revalidatePath(ROUTES.DASHBOARD.ROOT);
  revalidatePath(ROUTES.DASHBOARD.USERS);
}

export async function listUsersAction(
  input: unknown,
): Promise<ActionResult<Awaited<ReturnType<typeof listUsers>>>> {
  try {
    await requirePermission(PERMISSIONS.USERS_READ);

    const parsed = userListQuerySchema.safeParse(input);
    if (!parsed.success) {
      return toActionResult(validationErrorResponse(parsed.error));
    }

    const data = await listUsers(parsed.data);
    return toActionResult(successResponse(data));
  } catch (error) {
    return toActionResult(fromUnknownError(error));
  }
}

export async function getUserDetailAction(
  input: unknown,
): Promise<ActionResult<Awaited<ReturnType<typeof getUserDetail>>>> {
  try {
    await requirePermission(PERMISSIONS.USERS_READ);

    const parsed = z.object({ id: objectIdSchema }).safeParse(input);
    if (!parsed.success) {
      return toActionResult(validationErrorResponse(parsed.error));
    }

    const data = await getUserDetail(parsed.data.id);
    return toActionResult(successResponse(data));
  } catch (error) {
    return toActionResult(fromUnknownError(error));
  }
}

export async function updateUserRoleAction(
  input: unknown,
): Promise<ActionResult<Awaited<ReturnType<typeof updateUserRole>>>> {
  try {
    const actor = await requirePermission(PERMISSIONS.USERS_MANAGE);

    const parsed = updateUserRoleSchema.safeParse(input);
    if (!parsed.success) {
      return toActionResult(validationErrorResponse(parsed.error));
    }

    const data = await updateUserRole(String(actor._id), parsed.data);
    revalidateUsers();
    return toActionResult(successResponse(data));
  } catch (error) {
    return toActionResult(fromUnknownError(error));
  }
}

export async function updateUserAccessStatusAction(
  input: unknown,
): Promise<
  ActionResult<Awaited<ReturnType<typeof updateUserAccessStatus>>>
> {
  try {
    const actor = await requirePermission(PERMISSIONS.USERS_MANAGE);

    const parsed = updateUserAccessStatusSchema.safeParse(input);
    if (!parsed.success) {
      return toActionResult(validationErrorResponse(parsed.error));
    }

    const data = await updateUserAccessStatus(String(actor._id), parsed.data);
    revalidateUsers();
    return toActionResult(successResponse(data));
  } catch (error) {
    return toActionResult(fromUnknownError(error));
  }
}
