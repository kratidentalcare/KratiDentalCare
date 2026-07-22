import type { Types } from "mongoose";

import { USER_ROLES } from "@/constants/roles";
import { User } from "@/models/user";

import { SEED_IDS } from "../config";
import type { SeedContext } from "../lib/context";
import { logOk } from "../lib/log";
import { upsertOne } from "../lib/upsert";

export async function seedAdmin(ctx: SeedContext): Promise<void> {
  const { doc } = await upsertOne(User, { clerkId: SEED_IDS.adminClerkId }, {
    clerkId: SEED_IDS.adminClerkId,
    email: SEED_IDS.adminEmail,
    firstName: "Clinic",
    lastName: "Admin",
    phoneNumber: "+91 522 400 1000",
    role: USER_ROLES.ADMIN,
    profileImage: null,
    lastLoginAt: null,
    emailVerified: true,
    phoneVerified: true,
    isActive: true,
  });

  ctx.admin = doc.toObject() as SeedContext["admin"];
  ctx.admin._id = doc._id as Types.ObjectId;

  logOk("Admin Seeded");
}
