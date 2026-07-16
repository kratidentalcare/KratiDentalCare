import {
  Award,
  BadgeCheck,
  Users,
  type LucideIcon,
} from "lucide-react";

import { cn } from "@/lib/utils";

export type TrustBadgeItem = {
  id: string;
  label: string;
  icon: LucideIcon;
};

const DEFAULT_TRUST_ITEMS: readonly TrustBadgeItem[] = [
  {
    id: "patients",
    label: "1000+ Happy Patients",
    icon: Users,
  },
  {
    id: "experience",
    label: "10+ Years Experience",
    icon: Award,
  },
  {
    id: "iso",
    label: "ISO Certified Clinic",
    icon: BadgeCheck,
  },
] as const;

export type TrustBadgesProps = {
  items?: readonly TrustBadgeItem[];
  className?: string;
};

/**
 * Slim inline trust row — icon + label pairs separated by dividers.
 */
export function TrustBadges({
  items = DEFAULT_TRUST_ITEMS,
  className,
}: TrustBadgesProps) {
  return (
    <ul
      className={cn(
        "flex flex-wrap items-center gap-x-0 gap-y-3",
        "max-sm:grid max-sm:grid-cols-2 max-sm:gap-4",
        className
      )}
      aria-label="Clinic trust indicators"
    >
      {items.map((item, index) => {
        const Icon = item.icon;
        const isLast = index === items.length - 1;

        return (
          <li
            key={item.id}
            className={cn(
              "flex min-w-0 items-center gap-2",
              !isLast && "sm:pr-4 sm:after:ml-4 sm:after:h-4 sm:after:w-px sm:after:bg-brand-dark/15 sm:after:content-['']"
            )}
          >
            <span
              className="flex size-7 shrink-0 items-center justify-center text-brand-teal"
              aria-hidden
            >
              <Icon className="size-3.5 sm:size-4" strokeWidth={2} />
            </span>
            <span className="text-xs font-medium leading-snug text-brand-dark sm:text-sm">
              {item.label}
            </span>
          </li>
        );
      })}
    </ul>
  );
}
