import "server-only";

import { Types } from "mongoose";

import { connect } from "@/lib/db";
import { NotFoundError, ValidationError } from "@/lib/errors";
import { Faq, type LeanFaq } from "@/models/faq";
import { toFaqListItem } from "@/features/faqs/services/mappers";
import type { FaqListItem } from "@/features/faqs/types";

export async function toggleFaqVisibility(
  id: string,
  isActive: boolean,
  updatedByUserId: string,
): Promise<FaqListItem> {
  await connect();

  if (!Types.ObjectId.isValid(id)) {
    throw new ValidationError("Invalid FAQ id");
  }
  if (!Types.ObjectId.isValid(updatedByUserId)) {
    throw new ValidationError("Invalid user id");
  }

  const updated = await Faq.findByIdAndUpdate(
    id,
    {
      $set: {
        isActive,
        updatedByUserId: new Types.ObjectId(updatedByUserId),
      },
    },
    { new: true, runValidators: true },
  ).lean<LeanFaq>();

  if (!updated) {
    throw new NotFoundError("FAQ not found");
  }

  return toFaqListItem(updated);
}
