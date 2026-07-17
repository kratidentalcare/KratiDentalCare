import { APPOINTMENT_STATUSES } from "@/constants/statuses";
import type { AppointmentStatus } from "@/constants/statuses";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

const STATUS_STYLES: Record<
  AppointmentStatus,
  { label: string; className: string }
> = {
  [APPOINTMENT_STATUSES.PENDING]: {
    label: "Pending",
    className: "bg-amber-50 text-amber-700",
  },
  [APPOINTMENT_STATUSES.CONFIRMED]: {
    label: "Confirmed",
    className: "bg-sky-50 text-sky-700",
  },
  [APPOINTMENT_STATUSES.CHECKED_IN]: {
    label: "Checked in",
    className: "bg-indigo-50 text-indigo-700",
  },
  [APPOINTMENT_STATUSES.COMPLETED]: {
    label: "Completed",
    className: "bg-emerald-50 text-emerald-700",
  },
  [APPOINTMENT_STATUSES.CANCELLED]: {
    label: "Cancelled",
    className: "bg-rose-50 text-rose-700",
  },
  [APPOINTMENT_STATUSES.NO_SHOW]: {
    label: "No show",
    className: "bg-zinc-100 text-zinc-600",
  },
  [APPOINTMENT_STATUSES.ARCHIVED]: {
    label: "Archived",
    className: "bg-zinc-100 text-zinc-600",
  },
};

type AppointmentStatusBadgeProps = {
  status: AppointmentStatus;
  className?: string;
};

export function AppointmentStatusBadge({
  status,
  className,
}: AppointmentStatusBadgeProps) {
  const config = STATUS_STYLES[status];
  return (
    <Badge className={cn(config.className, className)}>{config.label}</Badge>
  );
}
