import "server-only";

import { CONTENT_STATUSES } from "@/constants/statuses";
import { connect } from "@/lib/db";
import { Faq, type LeanFaq } from "@/models/faq";
import { ensureDefaultFaqs } from "@/features/faqs/services/ensure-default-faqs";
import { toPublicFaqItem } from "@/features/faqs/services/mappers";
import type { PublicFaqItem } from "@/features/faqs/types";

/**
 * Public homepage — Active + Published FAQs only.
 * Soft-deleted rows are excluded by the model plugin.
 * Seeds former hardcoded FAQs once if the collection is empty.
 */
export async function listActiveFaqs(): Promise<PublicFaqItem[]> {
  await connect();
  await ensureDefaultFaqs();

  const rows = await Faq.find({
    isActive: true,
    status: CONTENT_STATUSES.PUBLISHED,
  })
    .sort({ displayOrder: 1, createdAt: 1 })
    .select({ question: 1, answer: 1 })
    .lean<LeanFaq[]>();
  return rows.map(toPublicFaqItem);
}
