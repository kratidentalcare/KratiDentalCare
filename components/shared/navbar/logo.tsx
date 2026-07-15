import Link from "next/link";

import { APP_NAME } from "@/constants";
import { ROUTES } from "@/constants/routes";
import { cn } from "@/lib/utils";

export type LogoProps = {
  className?: string;
  /** Compact mark-only layout for tight spaces. */
  showWordmark?: boolean;
  onClick?: () => void;
};

/**
 * Clinic brand mark + stacked wordmark.
 * Style: bold lowercase name + wide-tracked DENTAL (Canary-like hierarchy).
 */
export function Logo({ className, showWordmark = true, onClick }: LogoProps) {
  return (
    <Link
      href={ROUTES.PUBLIC.HOME}
      onClick={onClick}
      className={cn(
        "group inline-flex items-center gap-3 rounded-md outline-none transition-opacity hover:opacity-80 focus-visible:ring-2 focus-visible:ring-[#0A84C6]/35 focus-visible:ring-offset-2",
        className
      )}
      aria-label={`${APP_NAME} home`}
    >
      <span
        className="relative flex size-11 shrink-0 items-center justify-center sm:size-12"
        aria-hidden
      >
        <svg
          viewBox="0 0 40 40"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="size-10 text-[#1A1A1A] transition-colors group-hover:text-[#0A84C6] sm:size-11"
        >
          {/* Soft overlapping arcs — dental / smile mark */}
          <path
            d="M12 14c0-4.4 3.1-7.5 8-7.5s8 3.1 8 7.5c0 2.2-.8 4.1-2.1 5.5 1.8 2.6 2.9 5.4 3.1 8.3.1 1.3-1 2.3-2.2 2.1-1-.2-1.7-1.1-1.8-2.1-.3-2.1-1.2-4.1-2.6-5.8-.7.2-1.5.3-2.4.3s-1.7-.1-2.4-.3c-1.4 1.7-2.3 3.7-2.6 5.8-.1 1-0.8 1.9-1.8 2.1-1.2.2-2.3-.8-2.2-2.1.2-2.9 1.3-5.7 3.1-8.3C12.8 18.1 12 16.2 12 14Z"
            stroke="currentColor"
            strokeWidth="2.25"
            strokeLinejoin="round"
          />
          <path
            d="M16.5 13.5c.8-1.6 2.2-2.6 3.5-2.6M23.5 13.5c-.8-1.6-2.2-2.6-3.5-2.6"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
          />
        </svg>
      </span>

      {showWordmark ? (
        <span className="flex flex-col justify-center leading-none">
          <span className="text-[1.75rem] font-extrabold tracking-[-0.03em] text-[#1A1A1A] lowercase sm:text-[2rem]">
            krati
          </span>
          <span className="mt-1.5 text-[0.6875rem] font-semibold tracking-[0.42em] text-[#1A1A1A] uppercase sm:text-xs sm:tracking-[0.48em]">
            Dental
          </span>
        </span>
      ) : null}
    </Link>
  );
}
