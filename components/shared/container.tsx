import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

export type ContainerProps = {
  children: ReactNode;
  className?: string;
  /** Max width preset for portal/admin content vs. public marketing. */
  size?: "sm" | "md" | "lg" | "xl" | "full";
  as?: "div" | "main" | "section";
};

const sizeClass = {
  sm: "max-w-2xl",
  md: "max-w-4xl",
  lg: "max-w-6xl",
  xl: "max-w-7xl",
  full: "max-w-none",
} as const;

/**
 * Horizontal page padding + max-width. Keeps mobile gutters consistent.
 */
export function Container({
  children,
  className,
  size = "lg",
  as: Comp = "div",
}: ContainerProps) {
  return (
    <Comp
      className={cn(
        "mx-auto w-full px-4 py-4 sm:px-6 sm:py-6 lg:px-8",
        sizeClass[size],
        className
      )}
    >
      {children}
    </Comp>
  );
}
