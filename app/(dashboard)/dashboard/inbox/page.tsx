import type { Metadata } from "next";

import { PageHeader } from "@/components/dashboard";
import { InboxWorkspace } from "@/features/contact/components/inbox-workspace";
import { listContactMessages } from "@/features/contact/services/list-contact-messages";
import { PERMISSIONS, requirePermission } from "@/lib/auth";
import { contactMessageListQuerySchema } from "@/validators/contact-message";

export const metadata: Metadata = {
  title: "Inbox",
};

type InboxPageProps = {
  searchParams: Promise<{
    page?: string;
    search?: string;
    status?: string;
    limit?: string;
  }>;
};

/**
 * Admin Contact Inbox — inquiries from the public contact form.
 */
export default async function InboxPage({ searchParams }: InboxPageProps) {
  await requirePermission(PERMISSIONS.CONTACT_INBOX_MANAGE);

  const params = await searchParams;
  const parsed = contactMessageListQuerySchema.safeParse({
    page: params.page,
    limit: params.limit,
    search: params.search,
    status: params.status,
  });

  const data = await listContactMessages(
    parsed.success
      ? parsed.data
      : contactMessageListQuerySchema.parse({ status: "all" }),
  );

  return (
    <div className="flex flex-col gap-6 sm:gap-8">
      <PageHeader
        title="Inbox"
        description="Manage contact form inquiries. Mark as read, archive, or delete after review."
      />
      <InboxWorkspace initialData={data} />
    </div>
  );
}
