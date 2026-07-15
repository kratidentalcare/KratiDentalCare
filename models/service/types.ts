import type { Model, Types } from "mongoose";

import type { ContentStatus } from "@/constants/statuses";
import type {
  LeanSoftActivatableDocument,
  SoftActivatableDocument,
  SoftDeleteQueryHelpers,
} from "@/models/base";

/**
 * Public dental service catalog item (website CMS).
 * Not a clinical procedure chart — marketing/content only.
 *
 * @see docs/04-database-design.md §D.3.2
 */
export type ServiceFields = {
  name: string;
  slug: string;
  /** Short card / list blurb. */
  summary: string;
  /** Long-form detail (optional). */
  description: string | null;
  /** Icon key (e.g. lucide name) or image URL. */
  icon: string | null;
  displayOrder: number;
  status: ContentStatus;
  /** Admin who last updated the row. */
  updatedByUserId: Types.ObjectId;
};

export type ServiceDocument = SoftActivatableDocument & ServiceFields;

export type LeanService = LeanSoftActivatableDocument & ServiceFields;

export type ServiceModel = Model<ServiceDocument, SoftDeleteQueryHelpers>;
