import "server-only";

import { Types } from "mongoose";

import { USER_ROLES } from "@/constants/roles";
import { CONTENT_STATUSES } from "@/constants/statuses";
import { DEFAULT_FAQS } from "@/features/faqs/data/default-faqs";
import { connect } from "@/lib/db";
import { Faq } from "@/models/faq";
import { User } from "@/models/user";

/**
 * One-time seed: insert the former homepage FAQs when the collection is empty.
 * Idempotent — never re-seeds if any non-deleted FAQ already exists.
 */
export async function ensureDefaultFaqs(
  updatedByUserId?: string,
): Promise<boolean> {
  await connect();

  const existingCount = await Faq.countDocuments({});
  if (existingCount > 0) {
    return false;
  }

  let actorId = updatedByUserId;
  if (!actorId || !Types.ObjectId.isValid(actorId)) {
    const admin = await User.findOne({
      role: USER_ROLES.ADMIN,
      isActive: true,
    })
      .select({ _id: 1 })
      .lean<{ _id: Types.ObjectId }>();

    if (!admin) {
      return false;
    }
    actorId = String(admin._id);
  }

  const updatedBy = new Types.ObjectId(actorId);

  try {
    await Faq.insertMany(
      DEFAULT_FAQS.map((faq) => ({
        question: faq.question,
        answer: faq.answer,
        displayOrder: faq.displayOrder,
        isActive: true,
        status: CONTENT_STATUSES.PUBLISHED,
        updatedByUserId: updatedBy,
        category: null,
      })),
      { ordered: true },
    );
    return true;
  } catch {
    // Concurrent first-write race — another request may have seeded already.
    const racedCount = await Faq.countDocuments({});
    return racedCount > 0;
  }
}
