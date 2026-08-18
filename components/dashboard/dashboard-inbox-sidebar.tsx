import { cache } from "react";

import { countUnreadContactMessages } from "@/features/contact/services/list-contact-messages";

import { MobileSidebar } from "./mobile-sidebar";
import { Sidebar } from "./sidebar";

const getInboxUnreadCount = cache(async (): Promise<number> => {
  try {
    return await countUnreadContactMessages();
  } catch {
    return 0;
  }
});

/**
 * Desktop rail with live Inbox unread count (streamed via Suspense).
 */
export async function DashboardInboxSidebar() {
  const inboxUnreadCount = await getInboxUnreadCount();
  return <Sidebar inboxUnreadCount={inboxUnreadCount} />;
}

/**
 * Mobile drawer with live Inbox unread count (streamed via Suspense).
 */
export async function DashboardMobileInboxSidebar() {
  const inboxUnreadCount = await getInboxUnreadCount();
  return <MobileSidebar inboxUnreadCount={inboxUnreadCount} />;
}
