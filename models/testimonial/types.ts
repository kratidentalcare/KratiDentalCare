import type { Model, Types } from "mongoose";

import type { ContentStatus } from "@/constants/statuses";
import type {
  LeanSoftActivatableDocument,
  SoftActivatableDocument,
  SoftDeleteQueryHelpers,
} from "@/models/base";

/**
 * Public social-proof testimonial (website CMS).
 * Not linked to Patient records — display copy only.
 *
 * @see docs/04-database-design.md §D.3.3
 */
export type TestimonialFields = {
  authorName: string;
  quote: string;
  /** Optional star rating (1–5). */
  rating: number | null;
  displayOrder: number;
  status: ContentStatus;
  updatedByUserId: Types.ObjectId;
};

export type TestimonialDocument = SoftActivatableDocument & TestimonialFields;

export type LeanTestimonial = LeanSoftActivatableDocument & TestimonialFields;

export type TestimonialModel = Model<
  TestimonialDocument,
  SoftDeleteQueryHelpers
>;
