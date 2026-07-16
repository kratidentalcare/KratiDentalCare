import { ShieldCheck, type LucideIcon } from "lucide-react";

import { cn } from "@/lib/utils";

export type FloatingCardProps = {
  label?: string;
  icon?: LucideIcon;
  className?: string;
};

/**
 * Glassmorphism trust chip overlapping the arch image.
 */
export function FloatingCard({
  label = "Painless Dentistry",
  icon: Icon = ShieldCheck,
  className,
}: FloatingCardProps) {
  return (
    <div
      role="status"
      aria-label={label}
      className={cn(
        "hero-animate-scale-in hero-delay-6 hero-float",
        "flex items-center gap-2.5 rounded-2xl border border-white/50",
        "bg-white/70 px-3.5 py-3 shadow-[0_12px_36px_color-mix(in_srgb,var(--brand-blue)_14%,transparent)]",
        "backdrop-blur-md supports-backdrop-filter:bg-white/55",
        "sm:gap-3 sm:px-4 sm:py-3.5",
        className
      )}
    >
      <span
        className="flex size-9 shrink-0 items-center justify-center rounded-full bg-brand-teal/15 text-brand-teal sm:size-10"
        aria-hidden
      >
        <Icon className="size-4 sm:size-5" strokeWidth={2.25} />
      </span>
      <p className="pr-1 text-sm font-semibold tracking-tight text-brand-dark sm:text-[0.9375rem]">
        {label}
      </p>
    </div>
  );
}
