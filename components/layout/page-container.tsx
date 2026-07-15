import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

export type PageContainerSize = "sm" | "md" | "lg" | "xl" | "full";

export type PageContainerProps = {
  children: ReactNode;
  className?: string;
  /**
   * Max-width preset for public content.
   * Prefer `lg` for standard sections; `full` for edge-to-edge heroes that
   * nest their own inner containers.
   */
  size?: PageContainerSize;
  as?: "div" | "main" | "section" | "article";
};

const sizeClass: Record<PageContainerSize, string> = {
  sm: "max-w-[var(--container-max-sm)]",
  md: "max-w-[var(--container-max-md)]",
  lg: "max-w-[var(--container-max-lg)]",
  xl: "max-w-[var(--container-max-xl)]",
  full: "max-w-none",
};

/**
 * Responsive horizontal page container for the public website.
 * Uses global spacing tokens (`--container-padding-x`, `--container-max-*`).
 * Does not apply vertical section padding — sections own their own rhythm
 * via `.public-section-y` so full-bleed layouts stay flexible.
 */
export function PageContainer({
  children,
  className,
  size = "lg",
  as: Comp = "div",
}: PageContainerProps) {
  return (
    <Comp
      className={cn(
        "mx-auto w-full public-container-x",
        sizeClass[size],
        className
      )}
    >
      {children}
    </Comp>
  );
}
