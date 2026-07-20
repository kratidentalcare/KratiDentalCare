import type { Metadata } from "next";

import { PageHeader } from "@/components/dashboard";
import { FaqsWorkspace } from "@/features/faqs/components/faqs-workspace";
import { listFaqs } from "@/features/faqs/services/list-faqs";
import { PERMISSIONS, requirePermission } from "@/lib/auth";

export const metadata: Metadata = {
  title: "FAQs",
};

/**
 * Admin FAQ CMS — create, edit, hide, and order public homepage FAQs.
 */
export default async function FaqsPage() {
  const user = await requirePermission(PERMISSIONS.WEBSITE_MANAGE);
  const faqs = await listFaqs(String(user._id));

  return (
    <div className="flex flex-col gap-6 sm:gap-8">
      <PageHeader
        title="FAQs"
        description="Manage frequently asked questions shown on the public homepage."
      />
      <FaqsWorkspace initialFaqs={faqs} />
    </div>
  );
}
