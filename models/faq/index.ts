import "server-only";

import { getOrCreateModel } from "@/models/base";

import { FAQ_MODEL_NAME, faqSchema } from "./schema";
import type { FaqDocument, FaqModel } from "./types";

/**
 * FAQ (CMS) model — hot-reload safe via `getOrCreateModel`.
 * Always `await connect()` from `@/lib/db` before querying.
 */
export const Faq = getOrCreateModel<FaqDocument>(
  FAQ_MODEL_NAME,
  faqSchema,
) as FaqModel;

export type { FaqDocument, FaqFields, FaqModel, LeanFaq } from "./types";
export { FAQ_MODEL_NAME, faqSchema } from "./schema";
