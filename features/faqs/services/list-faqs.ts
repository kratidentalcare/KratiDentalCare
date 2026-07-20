import "server-only";

import { connect } from "@/lib/db";
import { Faq, type LeanFaq } from "@/models/faq";
import { ensureDefaultFaqs } from "@/features/faqs/services/ensure-default-faqs";
import { toFaqListItem } from "@/features/faqs/services/mappers";
import type { FaqListItem } from "@/features/faqs/types";

/**
 * Admin list — all non-deleted FAQs, ordered by displayOrder then createdAt.
 * Seeds former hardcoded FAQs once if the collection is empty.
 */
export async function listFaqs(
  updatedByUserId?: string,
): Promise<FaqListItem[]> {
  await connect();
  await ensureDefaultFaqs(updatedByUserId);

  const rows = await Faq.find({})
    .sort({ displayOrder: 1, createdAt: 1 })
    .lean<LeanFaq[]>();
  return rows.map(toFaqListItem);
}
