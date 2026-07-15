import { Loader2Icon } from "lucide-react";

import { cn } from "@/lib/utils";

export type SpinnerProps = {
  className?: string;
  /** Accessible label announced to screen readers. */
  label?: string;
  size?: "sm" | "default" | "lg";
};

const sizeClass = {
  sm: "size-3.5",
  default: "size-5",
  lg: "size-8",
} as const;

/**
 * Inline loading indicator. Prefer over ad-hoc spinner SVGs in features.
 */
export function Spinner({
  className,
  label = "Loading",
  size = "default",
}: SpinnerProps) {
  return (
    <Loader2Icon
      role="status"
      aria-label={label}
      className={cn("animate-spin text-muted-foreground", sizeClass[size], className)}
    />
  );
}
