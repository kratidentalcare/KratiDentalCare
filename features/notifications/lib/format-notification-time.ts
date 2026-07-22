import { formatDistanceToNow } from "date-fns";

/**
 * Compact relative timestamp for notification rows.
 */
export function formatNotificationTime(iso: string): string {
  try {
    return formatDistanceToNow(new Date(iso), { addSuffix: true });
  } catch {
    return "";
  }
}
