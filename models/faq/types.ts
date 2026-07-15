import type { Model, Types } from "mongoose";

import type { ContentStatus } from "@/constants/statuses";
import type {
  LeanSoftActivatableDocument,
  SoftActivatableDocument,
  SoftDeleteQueryHelpers,
} from "@/models/base";

/**
 * Public FAQ entry (website CMS / SEO help content).
 *
 * @see docs/04-database-design.md §D.3.4
 */
export type FaqFields = {
  question: string;
  answer: string;
  /** Optional grouping key, e.g. `booking`, `treatment`. */
  category: string | null;
  displayOrder: number;
  status: ContentStatus;
  updatedByUserId: Types.ObjectId;
};

export type FaqDocument = SoftActivatableDocument & FaqFields;

export type LeanFaq = LeanSoftActivatableDocument & FaqFields;

export type FaqModel = Model<FaqDocument, SoftDeleteQueryHelpers>;
