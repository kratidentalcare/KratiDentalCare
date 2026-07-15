import type { VariantProps } from "class-variance-authority";

import type { badgeVariants } from "@/components/ui/badge";
import type {
  AppointmentStatus,
  ContentStatus,
  DoctorStatus,
  PatientStatus,
  PrescriptionStatus,
  SlotStatus,
} from "@/constants/statuses";

export type StatusTone = "neutral" | "info" | "success" | "warning" | "danger";

export type DomainStatus =
  | AppointmentStatus
  | SlotStatus
  | PrescriptionStatus
  | DoctorStatus
  | PatientStatus
  | ContentStatus;

type BadgeVariant = NonNullable<VariantProps<typeof badgeVariants>["variant"]>;

export type StatusVisual = {
  label: string;
  tone: StatusTone;
  badgeVariant: BadgeVariant;
  className?: string;
};

const successClass =
  "border-emerald-200 bg-emerald-50 text-emerald-900 dark:border-emerald-900/50 dark:bg-emerald-950/40 dark:text-emerald-200";
const warningClass =
  "border-amber-200 bg-amber-50 text-amber-900 dark:border-amber-900/50 dark:bg-amber-950/40 dark:text-amber-200";
const infoClass =
  "border-sky-200 bg-sky-50 text-sky-900 dark:border-sky-900/50 dark:bg-sky-950/40 dark:text-sky-200";

/**
 * Maps unique domain status strings → UI presentation.
 * Overlapping enums (e.g. ACTIVE, ARCHIVED, DRAFT) share one visual by design.
 */
export const STATUS_VISUALS = {
  PENDING: {
    label: "Pending",
    tone: "warning",
    badgeVariant: "secondary",
    className: warningClass,
  },
  CONFIRMED: {
    label: "Confirmed",
    tone: "info",
    badgeVariant: "default",
  },
  CHECKED_IN: {
    label: "Checked in",
    tone: "info",
    badgeVariant: "secondary",
    className: infoClass,
  },
  COMPLETED: {
    label: "Completed",
    tone: "success",
    badgeVariant: "secondary",
    className: successClass,
  },
  CANCELLED: {
    label: "Cancelled",
    tone: "danger",
    badgeVariant: "destructive",
  },
  NO_SHOW: {
    label: "No show",
    tone: "danger",
    badgeVariant: "outline",
    className: "border-destructive/40 text-destructive",
  },
  ARCHIVED: {
    label: "Archived",
    tone: "neutral",
    badgeVariant: "outline",
  },
  AVAILABLE: {
    label: "Available",
    tone: "success",
    badgeVariant: "secondary",
    className: successClass,
  },
  BOOKED: {
    label: "Booked",
    tone: "info",
    badgeVariant: "default",
  },
  BLOCKED: {
    label: "Blocked",
    tone: "warning",
    badgeVariant: "outline",
    className: warningClass,
  },
  HOLIDAY: {
    label: "Holiday",
    tone: "neutral",
    badgeVariant: "outline",
  },
  DRAFT: {
    label: "Draft",
    tone: "neutral",
    badgeVariant: "outline",
  },
  ISSUED: {
    label: "Issued",
    tone: "success",
    badgeVariant: "secondary",
    className: successClass,
  },
  AMENDED: {
    label: "Amended",
    tone: "info",
    badgeVariant: "secondary",
    className: infoClass,
  },
  VOID: {
    label: "Void",
    tone: "danger",
    badgeVariant: "destructive",
  },
  ACTIVE: {
    label: "Active",
    tone: "success",
    badgeVariant: "secondary",
    className: successClass,
  },
  INACTIVE: {
    label: "Inactive",
    tone: "neutral",
    badgeVariant: "outline",
  },
  ON_LEAVE: {
    label: "On leave",
    tone: "warning",
    badgeVariant: "secondary",
    className: warningClass,
  },
  PUBLISHED: {
    label: "Published",
    tone: "success",
    badgeVariant: "secondary",
    className: successClass,
  },
} as const satisfies Record<DomainStatus, StatusVisual>;

export function getStatusVisual(status: DomainStatus): StatusVisual {
  return STATUS_VISUALS[status];
}
