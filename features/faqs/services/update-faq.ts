import "server-only";

import { Types } from "mongoose";

import { connect } from "@/lib/db";
import { NotFoundError, ValidationError } from "@/lib/errors";
import { Faq, type LeanFaq } from "@/models/faq";
import { toFaqListItem } from "@/features/faqs/services/mappers";
import type { FaqListItem } from "@/features/faqs/types";
import {
  updateFaqActionSchema,
  type UpdateFaqActionInput,
} from "@/validators/faq";

export async function updateFaq(
  id: string,
  input: UpdateFaqActionInput,
  updatedByUserId: string,
): Promise<FaqListItem> {
  await connect();

  if (!Types.ObjectId.isValid(id)) {
    throw new ValidationError("Invalid FAQ id");
  }
  if (!Types.ObjectId.isValid(updatedByUserId)) {
    throw new ValidationError("Invalid user id");
  }

  const parsed = updateFaqActionSchema.safeParse(input);
  if (!parsed.success) {
    throw new ValidationError(
      "Invalid FAQ update",
      parsed.error.issues.map((issue) => ({
        field: issue.path.join(".") || "root",
        message: issue.message,
      })),
    );
  }

  const $set: Record<string, unknown> = {
    updatedByUserId: new Types.ObjectId(updatedByUserId),
  };

  if (parsed.data.question !== undefined) {
    $set.question = parsed.data.question;
  }
  if (parsed.data.answer !== undefined) {
    $set.answer = parsed.data.answer;
  }
  if (parsed.data.displayOrder !== undefined) {
    $set.displayOrder = parsed.data.displayOrder;
  }
  if (parsed.data.isActive !== undefined) {
    $set.isActive = parsed.data.isActive;
  }

  const updated = await Faq.findByIdAndUpdate(
    id,
    { $set },
    { new: true, runValidators: true },
  ).lean<LeanFaq>();

  if (!updated) {
    throw new NotFoundError("FAQ not found");
  }

  return toFaqListItem(updated);
}
