import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

import {
  getStatusVisual,
  type DomainStatus,
} from "./status-badge.config";

export type StatusBadgeProps = {
  status: DomainStatus;
  /** Override the human-readable label from the status map. */
  label?: string;
  className?: string;
};

/**
 * Domain-aware status chip used across appointments, slots, Rx, doctors, patients, CMS.
 * Stays presentational — maps enum → label/tone only.
 */
export function StatusBadge({ status, label, className }: StatusBadgeProps) {
  const visual = getStatusVisual(status);

  return (
    <Badge
      variant={visual.badgeVariant}
      className={cn(visual.className, className)}
      aria-label={`Status: ${label ?? visual.label}`}
    >
      {label ?? visual.label}
    </Badge>
  );
}
