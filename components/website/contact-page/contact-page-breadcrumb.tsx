"use client";

import Link from "next/link";

import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { ROUTES } from "@/constants/routes";
import { cn } from "@/lib/utils";

export type ContactPageBreadcrumbProps = {
  className?: string;
  /** Light type for photo heroes. */
  tone?: "default" | "onMedia";
};

/**
 * Home → Contact trail for the contact page hero.
 */
export function ContactPageBreadcrumb({
  className,
  tone = "default",
}: ContactPageBreadcrumbProps) {
  const onMedia = tone === "onMedia";

  return (
    <Breadcrumb className={cn(className)}>
      <BreadcrumbList
        className={cn(
          "text-[0.8125rem] sm:text-sm",
          onMedia ? "text-white/70" : "text-brand-muted"
        )}
      >
        <BreadcrumbItem>
          <BreadcrumbLink
            render={<Link href={ROUTES.PUBLIC.HOME} />}
            className={cn(
              "font-medium transition-colors",
              onMedia
                ? "text-white/70 hover:text-white"
                : "text-brand-muted hover:text-brand-blue",
              "focus-visible:rounded-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2",
              onMedia
                ? "focus-visible:ring-white/50 focus-visible:ring-offset-brand-dark/40"
                : "focus-visible:ring-brand-blue/40"
            )}
          >
            Home
          </BreadcrumbLink>
        </BreadcrumbItem>
        <BreadcrumbSeparator
          className={onMedia ? "text-white/40" : "text-brand-muted/50"}
        />
        <BreadcrumbItem>
          <BreadcrumbPage
            className={cn(
              "font-medium",
              onMedia ? "text-white" : "text-brand-dark"
            )}
          >
            Contact
          </BreadcrumbPage>
        </BreadcrumbItem>
      </BreadcrumbList>
    </Breadcrumb>
  );
}
