import { cn } from "@/lib/utils";

export type SliderHandleProps = {
  className?: string;
};

/**
 * Circular drag affordance for the before/after comparison divider.
 */
export function SliderHandle({ className }: SliderHandleProps) {
  return (
    <span
      className={cn(
        "pointer-events-none flex size-11 items-center justify-center rounded-full",
        "border-[3px] border-white bg-brand-blue text-white",
        "shadow-[0_8px_24px_color-mix(in_srgb,var(--brand-blue)_35%,transparent)]",
        "sm:size-12",
        className
      )}
      aria-hidden
    >
      <svg
        viewBox="0 0 24 24"
        fill="none"
        className="size-5"
        aria-hidden
      >
        <path
          d="M8 7L4 12L8 17"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M16 7L20 12L16 17"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </span>
  );
}
