import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

import { Spinner } from "./spinner";

export type LoadingStateProps = {
  /** `spinner` for inline waits; `skeleton` for content placeholders. */
  variant?: "spinner" | "skeleton";
  label?: string;
  /** Skeleton row count when variant is `skeleton`. */
  rows?: number;
  className?: string;
};

/**
 * Generic loading affordance for lists, panels, and route transitions.
 */
export function LoadingState({
  variant = "spinner",
  label = "Loading",
  rows = 3,
  className,
}: LoadingStateProps) {
  if (variant === "skeleton") {
    return (
      <div
        role="status"
        aria-busy="true"
        aria-label={label}
        className={cn("flex w-full flex-col gap-3", className)}
      >
        {Array.from({ length: rows }, (_, index) => (
          <Skeleton
            key={index}
            className={cn("h-10 w-full", index === 0 && "h-12", index === rows - 1 && "w-2/3")}
          />
        ))}
        <span className="sr-only">{label}</span>
      </div>
    );
  }

  return (
    <div
      role="status"
      aria-busy="true"
      className={cn(
        "flex min-h-32 flex-col items-center justify-center gap-3 px-4 py-8",
        className
      )}
    >
      <Spinner label={label} size="lg" />
      <p className="text-sm text-muted-foreground">{label}</p>
    </div>
  );
}
