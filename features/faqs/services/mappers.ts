import "server-only";

import type { LeanFaq } from "@/models/faq";
import type { FaqListItem, PublicFaqItem } from "@/features/faqs/types";

export function toFaqListItem(doc: LeanFaq): FaqListItem {
  return {
    id: String(doc._id),
    question: doc.question,
    answer: doc.answer,
    displayOrder: doc.displayOrder,
    isActive: doc.isActive,
    createdAt: new Date(doc.createdAt).toISOString(),
    updatedAt: new Date(doc.updatedAt).toISOString(),
  };
}

export function toPublicFaqItem(doc: LeanFaq): PublicFaqItem {
  return {
    id: String(doc._id),
    question: doc.question,
    answer: doc.answer,
  };
}
