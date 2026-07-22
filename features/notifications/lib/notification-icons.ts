import {
  CalendarCheckIcon,
  CalendarXIcon,
  CalendarPlusIcon,
  FileTextIcon,
  InfoIcon,
  MessageSquareIcon,
  type LucideIcon,
} from "lucide-react";

import {
  NOTIFICATION_EVENTS,
  NOTIFICATION_TYPES,
  type NotificationType,
} from "@/constants/notifications";

const TYPE_ICONS: Record<NotificationType, LucideIcon> = {
  [NOTIFICATION_TYPES.APPOINTMENT]: CalendarPlusIcon,
  [NOTIFICATION_TYPES.INQUIRY]: MessageSquareIcon,
  [NOTIFICATION_TYPES.SYSTEM]: InfoIcon,
  [NOTIFICATION_TYPES.PRESCRIPTION]: FileTextIcon,
};

/**
 * Pick an icon from event when available, otherwise fall back to type.
 */
export function getNotificationIcon(
  type: NotificationType,
  event: string,
): LucideIcon {
  switch (event) {
    case NOTIFICATION_EVENTS.APPOINTMENT_CREATED:
      return CalendarPlusIcon;
    case NOTIFICATION_EVENTS.APPOINTMENT_CANCELLED:
      return CalendarXIcon;
    case NOTIFICATION_EVENTS.APPOINTMENT_COMPLETED:
      return CalendarCheckIcon;
    case NOTIFICATION_EVENTS.CONTACT_INQUIRY_CREATED:
      return MessageSquareIcon;
    default:
      return TYPE_ICONS[type] ?? InfoIcon;
  }
}

export function getNotificationIconClassName(
  type: NotificationType,
  event: string,
): string {
  switch (event) {
    case NOTIFICATION_EVENTS.APPOINTMENT_CANCELLED:
      return "bg-red-50 text-red-600";
    case NOTIFICATION_EVENTS.APPOINTMENT_COMPLETED:
      return "bg-emerald-50 text-emerald-600";
    case NOTIFICATION_EVENTS.CONTACT_INQUIRY_CREATED:
      return "bg-brand-blue/10 text-brand-blue";
    case NOTIFICATION_EVENTS.APPOINTMENT_CREATED:
      return "bg-brand-teal/15 text-brand-teal";
    default:
      if (type === NOTIFICATION_TYPES.PRESCRIPTION) {
        return "bg-violet-50 text-violet-600";
      }
      if (type === NOTIFICATION_TYPES.SYSTEM) {
        return "bg-slate-100 text-slate-600";
      }
      return "bg-brand-blue/10 text-brand-blue";
  }
}
