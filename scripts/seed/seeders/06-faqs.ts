import { CONTENT_STATUSES } from "@/constants/statuses";
import { Faq } from "@/models/faq";

import { SEED_COUNTS, SEED_IDS } from "../config";
import { SEED_FAQS } from "../data/faqs";
import type { SeedContext } from "../lib/context";
import { logOk } from "../lib/log";
import { upsertOne } from "../lib/upsert";

export async function seedFaqs(ctx: SeedContext): Promise<void> {
  const faqs = SEED_FAQS.slice(0, SEED_COUNTS.faqs);

  for (const faq of faqs) {
    await upsertOne(
      Faq,
      {
        question: faq.question,
        category: SEED_IDS.faqCategory,
        deletedAt: null,
      },
      {
        question: faq.question,
        answer: faq.answer,
        category: SEED_IDS.faqCategory,
        displayOrder: faq.displayOrder,
        status: CONTENT_STATUSES.PUBLISHED,
        updatedByUserId: ctx.admin._id,
        isActive: true,
      },
    );
  }

  logOk(`FAQs Seeded (${faqs.length})`);
}
