import Link from "next/link";
import {
  BanIcon,
  ShieldAlertIcon,
  UserXIcon,
  type LucideIcon,
} from "lucide-react";

import {
  AUTH_STATUS_REASONS,
  type AuthStatusReason,
} from "@/constants/auth-status";
import { ROUTES } from "@/constants/routes";
import { cn } from "@/lib/utils";

type AuthStatusCopy = {
  title: string;
  description: string;
  icon: LucideIcon;
};

const STATUS_COPY: Record<AuthStatusReason, AuthStatusCopy> = {
  [AUTH_STATUS_REASONS.FORBIDDEN]: {
    title: "Access denied",
    description:
      "You do not have permission to view this area. If you believe this is a mistake, contact the clinic administrator.",
    icon: ShieldAlertIcon,
  },
  [AUTH_STATUS_REASONS.ACCOUNT_DISABLED]: {
    title: "Account disabled",
    description:
      "This account has been deactivated and cannot access clinic portals. Please contact the clinic for help.",
    icon: BanIcon,
  },
  [AUTH_STATUS_REASONS.USER_NOT_SYNCED]: {
    title: "Account unavailable",
    description:
      "We could not load your clinic profile for this session. Sign out and try again, or contact the clinic if the issue continues.",
    icon: UserXIcon,
  },
};

export type AuthStatusViewProps = {
  reason: AuthStatusReason;
  className?: string;
};

/**
 * Shared fallback UI for authorization / account-state failures.
 * Presentational only — page guards decide when to redirect here.
 */
export function AuthStatusView({ reason, className }: AuthStatusViewProps) {
  const copy = STATUS_COPY[reason];
  const Icon = copy.icon;

  return (
    <div
      role="alert"
      className={cn(
        "mx-auto flex w-full max-w-md flex-col items-center gap-5 text-center font-montserrat",
        className
      )}
    >
      <div
        className="flex size-14 items-center justify-center rounded-full bg-[#0A84C6]/10 text-[#0A84C6]"
        aria-hidden
      >
        <Icon className="size-7" strokeWidth={1.75} />
      </div>
      <div className="flex flex-col gap-2">
        <h1 className="text-2xl font-bold tracking-tight text-[#1F2937] sm:text-3xl">
          {copy.title}
        </h1>
        <p className="text-base text-[#6B7280] sm:text-lg">{copy.description}</p>
      </div>
      <Link
        href={ROUTES.PUBLIC.HOME}
        className={cn(
          "inline-flex h-11 items-center justify-center rounded-full px-6",
          "border border-[#1F2937]/25 bg-[#0A84C6]/10 text-base font-semibold text-[#1F2937]",
          "transition-all duration-200",
          "hover:border-[#0A84C6]/40 hover:bg-[#0A84C6]/15 hover:text-[#0870A8]",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0A84C6]/40 focus-visible:ring-offset-2",
          "active:scale-[0.98]"
        )}
      >
        Back to home
      </Link>
    </div>
  );
}
