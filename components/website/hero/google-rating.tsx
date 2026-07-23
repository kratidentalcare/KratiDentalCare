import { cn } from "@/lib/utils";

export const GOOGLE_REVIEWS = {
  rating: 4.9,
  maxRating: 5,
  href: "https://g.page/r/Cdzf8eVYlr09EBM/review",
  label: "Google reviews",
} as const;

export type GoogleRatingProps = {
  /** Light sits on pale hero copy; dark sits on the mobile photo overlay. */
  variant?: "light" | "dark";
  className?: string;
};

function GoogleMark({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      className={className}
      aria-hidden
      focusable="false"
    >
      <path
        fill="#4285F4"
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
      />
      <path
        fill="#34A853"
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
      />
      <path
        fill="#FBBC05"
        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
      />
      <path
        fill="#EA4335"
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
      />
    </svg>
  );
}

const STAR_PATH =
  "M12 2.5l2.74 5.55 6.13.89-4.43 4.32 1.05 6.1L12 16.7l-5.49 2.89 1.05-6.1L3.13 8.94l6.13-.89L12 2.5z";

function StarIcon({
  fillPercent,
  emptyClassName,
  className,
}: {
  fillPercent: number;
  emptyClassName?: string;
  className?: string;
}) {
  const clamped = Math.min(100, Math.max(0, fillPercent));

  return (
    <span className={cn("relative inline-flex size-3.5 sm:size-4", className)}>
      <svg
        viewBox="0 0 24 24"
        className={cn("absolute inset-0 size-full", emptyClassName)}
        aria-hidden
        focusable="false"
      >
        <path fill="currentColor" d={STAR_PATH} />
      </svg>
      <span
        className="absolute inset-0 overflow-hidden"
        style={{ width: `${clamped}%` }}
      >
        <svg
          viewBox="0 0 24 24"
          className="size-3.5 text-[#FABB05] sm:size-4"
          aria-hidden
          focusable="false"
        >
          <path fill="currentColor" d={STAR_PATH} />
        </svg>
      </span>
    </span>
  );
}

function StarsRow({
  rating,
  maxRating,
  emptyClassName,
  className,
}: {
  rating: number;
  maxRating: number;
  emptyClassName?: string;
  className?: string;
}) {
  return (
    <span className={cn("inline-flex items-center gap-0.5", className)} aria-hidden>
      {Array.from({ length: maxRating }, (_, index) => {
        const fill = Math.min(1, Math.max(0, rating - index)) * 100;
        return (
          <StarIcon
            key={index}
            fillPercent={fill}
            emptyClassName={emptyClassName}
          />
        );
      })}
    </span>
  );
}

/**
 * Attractive Google rating chip linking to clinic reviews.
 */
export function GoogleRating({
  variant = "light",
  className,
}: GoogleRatingProps) {
  const isDark = variant === "dark";
  const { rating, maxRating, href, label } = GOOGLE_REVIEWS;

  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={`${rating} out of ${maxRating} on Google. Read reviews.`}
      className={cn(
        "group inline-flex max-w-full items-center gap-3 rounded-full",
        "transition-all duration-300 ease-out",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2",
        isDark
          ? cn(
              "border border-white/20 bg-white/12 px-3.5 py-2 backdrop-blur-md",
              "shadow-[0_10px_28px_rgba(0,0,0,0.22)]",
              "hover:border-white/35 hover:bg-white/18",
              "focus-visible:ring-white/50 focus-visible:ring-offset-brand-dark/40"
            )
          : cn(
              "border border-brand-navy/10 bg-white/90 px-3.5 py-2",
              "shadow-[0_8px_24px_color-mix(in_srgb,var(--brand-navy)_8%,transparent)]",
              "hover:border-brand-blue/25 hover:shadow-[0_12px_28px_color-mix(in_srgb,var(--brand-blue)_14%,transparent)]",
              "focus-visible:ring-brand-blue/40 focus-visible:ring-offset-2"
            ),
        className
      )}
    >
      <span
        className={cn(
          "flex size-9 shrink-0 items-center justify-center rounded-full sm:size-10",
          isDark ? "bg-white" : "bg-[#F8FAFC] ring-1 ring-black/[0.04]"
        )}
      >
        <GoogleMark className="size-5 sm:size-[1.35rem]" />
      </span>

      <span className="flex min-w-0 flex-col gap-0.5">
        <span className="inline-flex items-center gap-2">
          <span
            className={cn(
              "font-serif text-lg font-semibold leading-none tracking-tight sm:text-xl",
              isDark ? "text-white" : "text-brand-dark"
            )}
          >
            {rating.toFixed(1)}
          </span>
          <StarsRow
            rating={rating}
            maxRating={maxRating}
            emptyClassName={isDark ? "text-white/25" : "text-brand-navy/15"}
          />
        </span>
        <span
          className={cn(
            "text-[0.6875rem] font-medium tracking-wide sm:text-xs",
            isDark ? "text-white/75" : "text-brand-muted"
          )}
        >
          <span className="group-hover:underline group-hover:underline-offset-2">
            {label}
          </span>
          <span aria-hidden> · </span>
          Out of {maxRating}
        </span>
      </span>
    </a>
  );
}
