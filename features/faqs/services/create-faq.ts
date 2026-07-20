import "server-only";

import { Types } from "mongoose";

import { CONTENT_STATUSES } from "@/constants/statuses";
import { connect } from "@/lib/db";
import { ValidationError } from "@/lib/errors";
import { Faq, type LeanFaq } from "@/models/faq";
import { toFaqListItem } from "@/features/faqs/services/mappers";
import type { FaqListItem } from "@/features/faqs/types";
import {
  createFaqActionSchema,
  type CreateFaqActionInput,
} from "@/validators/faq";

export async function createFaq(
  input: CreateFaqActionInput,
  updatedByUserId: string,
): Promise<FaqListItem> {
  await connect();

  const parsed = createFaqActionSchema.safeParse(input);
  if (!parsed.success) {
    throw new ValidationError(
      "Invalid FAQ",
      parsed.error.issues.map((issue) => ({
        field: issue.path.join(".") || "root",
        message: issue.message,
      })),
    );
  }

  if (!Types.ObjectId.isValid(updatedByUserId)) {
    throw new ValidationError("Invalid user id");
  }

  const created = await Faq.create({
    question: parsed.data.question,
    answer: parsed.data.answer,
    displayOrder: parsed.data.displayOrder,
    isActive: parsed.data.isActive,
    status: CONTENT_STATUSES.PUBLISHED,
    updatedByUserId: new Types.ObjectId(updatedByUserId),
  });

  return toFaqListItem(created.toObject() as LeanFaq);
}
