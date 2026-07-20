import "server-only";

import { Types } from "mongoose";

import { connect } from "@/lib/db";
import { NotFoundError, ValidationError } from "@/lib/errors";
import { Faq } from "@/models/faq";

export async function deleteFaq(id: string): Promise<void> {
  await connect();

  if (!Types.ObjectId.isValid(id)) {
    throw new ValidationError("Invalid FAQ id");
  }

  const doc = await Faq.findById(id);
  if (!doc) {
    throw new NotFoundError("FAQ not found");
  }

  await doc.softDelete();
}
