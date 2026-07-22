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
};

/**
 * Home → Contact trail for the contact page hero.
 */
export function ContactPageBreadcrumb({
  className,
}: ContactPageBreadcrumbProps) {
  return (
    <Breadcrumb className={cn(className)}>
      <BreadcrumbList className="text-[0.8125rem] text-brand-muted sm:text-sm">
        <BreadcrumbItem>
          <BreadcrumbLink
            render={<Link href={ROUTES.PUBLIC.HOME} />}
            className={cn(
              "font-medium text-brand-muted transition-colors",
              "hover:text-brand-blue",
              "focus-visible:rounded-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-blue/40 focus-visible:ring-offset-2"
            )}
          >
            Home
          </BreadcrumbLink>
        </BreadcrumbItem>
        <BreadcrumbSeparator className="text-brand-muted/50" />
        <BreadcrumbItem>
          <BreadcrumbPage className="font-medium text-brand-dark">
            Contact
          </BreadcrumbPage>
        </BreadcrumbItem>
      </BreadcrumbList>
    </Breadcrumb>
  );
}
