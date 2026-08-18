import { listActiveFaqs } from "@/features/faqs/services/list-active-faqs";

import { Faq } from "./faq";

/**
 * Active FAQs streamed behind Suspense so heroes paint first.
 */
export async function StreamedFaq() {
  const faqs = await listActiveFaqs();
  return <Faq items={faqs} />;
}
