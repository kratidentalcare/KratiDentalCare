import { cn } from "@/lib/utils";

import type { WhyChooseUsFeature } from "./features-data";

export type FeatureItemProps = {
  feature: WhyChooseUsFeature;
  index: number;
  visible?: boolean;
  className?: string;
};

/**
 * Icon + text feature row — no card chrome; hover tint via group styles.
 */
export function FeatureItem({
  feature,
  index,
  visible = true,
  className,
}: FeatureItemProps) {
  const Icon = feature.icon;

  return (
    <li
      className={cn(
        "group -mx-2.5 list-none rounded-xl px-2.5 py-2",
        "motion-safe:transition-[opacity,transform,background-color] motion-safe:duration-300 motion-safe:ease-out",
        "hover:bg-brand-blue/[0.06]",
        visible
          ? "opacity-100 translate-y-0"
          : "opacity-0 translate-y-3 motion-reduce:opacity-100 motion-reduce:translate-y-0",
        className
      )}
      style={
        visible
          ? { transitionDelay: `${180 + index * 90}ms` }
          : undefined
      }
    >
      <div className="flex items-start gap-3.5">
        <span
          className={cn(
            "flex size-11 shrink-0 items-center justify-center rounded-2xl",
            "bg-brand-blue/[0.08] ring-1 ring-brand-blue/10",
            "transition-colors duration-300 group-hover:bg-brand-blue/[0.12] group-hover:ring-brand-red/25"
          )}
          aria-hidden
        >
          <Icon className="size-[1.125rem] text-brand-blue transition-colors duration-300 group-hover:text-brand-red" strokeWidth={1.75} />
        </span>

        <div className="min-w-0 pt-0.5">
          <p className="text-sm font-semibold leading-snug text-brand-dark">
            {feature.title}
          </p>
          <p className="mt-0.5 text-[0.78125rem] leading-snug text-brand-muted">
            {feature.description}
          </p>
        </div>
      </div>
    </li>
  );
}
