"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Fragment } from "react";

import {
  Breadcrumb as UiBreadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { ROUTES } from "@/constants/routes";
import { cn } from "@/lib/utils";

import {
  getDashboardNavItemByPath,
  getDashboardPageTitle,
} from "./nav-config";

export type DashboardBreadcrumbProps = {
  className?: string;
};

type Crumb = {
  label: string;
  href?: string;
};

function buildCrumbs(pathname: string): Crumb[] {
  const crumbs: Crumb[] = [
    { label: "Dashboard", href: ROUTES.DASHBOARD.ROOT },
  ];

  if (pathname === ROUTES.DASHBOARD.ROOT) {
    return [{ label: "Dashboard" }];
  }

  const match = getDashboardNavItemByPath(pathname);
  if (match && match.href !== ROUTES.DASHBOARD.ROOT) {
    crumbs.push({ label: match.label });
    return crumbs;
  }

  crumbs.push({ label: getDashboardPageTitle(pathname) });
  return crumbs;
}

/**
 * Route-aware breadcrumb for the dashboard header.
 * Future nested modules inherit this without shell changes.
 */
export function DashboardBreadcrumb({ className }: DashboardBreadcrumbProps) {
  const pathname = usePathname();
  const crumbs = buildCrumbs(pathname);

  return (
    <UiBreadcrumb className={cn(className)}>
      <BreadcrumbList className="text-xs sm:text-sm">
        {crumbs.map((crumb, index) => {
          const isLast = index === crumbs.length - 1;

          return (
            <Fragment key={`${crumb.label}-${index}`}>
              {index > 0 ? <BreadcrumbSeparator /> : null}
              <BreadcrumbItem>
                {isLast || !crumb.href ? (
                  <BreadcrumbPage className="font-medium text-brand-dark">
                    {crumb.label}
                  </BreadcrumbPage>
                ) : (
                  <BreadcrumbLink
                    render={<Link href={crumb.href} />}
                    className="text-brand-muted transition-colors hover:text-brand-blue"
                  >
                    {crumb.label}
                  </BreadcrumbLink>
                )}
              </BreadcrumbItem>
            </Fragment>
          );
        })}
      </BreadcrumbList>
    </UiBreadcrumb>
  );
}
