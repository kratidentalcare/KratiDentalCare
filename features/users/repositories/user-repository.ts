import "server-only";

import type { ClientSession } from "mongoose";
import { Types as MongooseTypes } from "mongoose";

import type { UserRole } from "@/constants/roles";
import { NotFoundError } from "@/lib/errors";
import { User, type LeanUser } from "@/models/user";

export {
  buildUserListFilter,
  buildUserSearchFilter,
} from "@/features/users/lib/list-filter";

export async function findUserById(
  id: string,
  session?: ClientSession,
): Promise<LeanUser | null> {
  const query = User.findOne({
    _id: new MongooseTypes.ObjectId(id),
    deletedAt: null,
  });
  if (session) {
    query.session(session);
  }
  return query.lean<LeanUser>();
}

export async function findUserByIdOrThrow(
  id: string,
  session?: ClientSession,
): Promise<LeanUser> {
  const user = await findUserById(id, session);
  if (!user) {
    throw new NotFoundError("User not found");
  }
  return user;
}

export async function listUserDocuments(
  filter: Record<string, unknown>,
  page: number,
  limit: number,
): Promise<{ items: LeanUser[]; total: number }> {
  const skip = (page - 1) * limit;

  const [items, total] = await Promise.all([
    User.find(filter)
      .sort({ createdAt: -1, _id: -1 })
      .skip(skip)
      .limit(limit)
      .lean<LeanUser[]>(),
    User.countDocuments(filter),
  ]);

  return { items, total };
}

export async function updateUserRoleRecord(
  id: string,
  role: UserRole,
  session?: ClientSession,
): Promise<LeanUser> {
  const query = User.findOneAndUpdate(
    { _id: new MongooseTypes.ObjectId(id), deletedAt: null },
    { $set: { role } },
    { new: true, runValidators: true },
  );
  if (session) {
    query.session(session);
  }

  const updated = await query.lean<LeanUser>();
  if (!updated) {
    throw new NotFoundError("User not found");
  }
  return updated;
}

export async function updateUserAccessRecord(
  id: string,
  isActive: boolean,
  session?: ClientSession,
): Promise<LeanUser> {
  const query = User.findOneAndUpdate(
    { _id: new MongooseTypes.ObjectId(id), deletedAt: null },
    { $set: { isActive } },
    { new: true, runValidators: true },
  );
  if (session) {
    query.session(session);
  }

  const updated = await query.lean<LeanUser>();
  if (!updated) {
    throw new NotFoundError("User not found");
  }
  return updated;
}
