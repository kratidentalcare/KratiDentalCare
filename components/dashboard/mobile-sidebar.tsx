"use client";

import Link from "next/link";

import { APP_NAME } from "@/constants";
import { ROUTES } from "@/constants/routes";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";

import { useDashboardChrome } from "./dashboard-chrome-context";
import { DASHBOARD_NAV_ITEMS } from "./nav-config";
import { SidebarItem } from "./sidebar-item";

export type MobileSidebarProps = {
  className?: string;
};

/**
 * Drawer navigation for viewports below `md`.
 * Controlled by {@link useDashboardChrome}.
 */
export function MobileSidebar({ className }: MobileSidebarProps) {
  const { mobileOpen, setMobileOpen, closeMobile } = useDashboardChrome();

  const primaryItems = DASHBOARD_NAV_ITEMS.filter(
    (item) => item.id !== "logout" && item.id !== "profile",
  );
  const accountItems = DASHBOARD_NAV_ITEMS.filter(
    (item) => item.id === "profile" || item.id === "logout",
  );

  return (
    <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
      <SheetContent
        side="left"
        showCloseButton
        className={cn(
          "w-[min(100%,18rem)] gap-0 border-[#E5E7EB] bg-white p-0 font-montserrat md:hidden",
          className,
        )}
      >
        <SheetHeader className="border-b border-[#E5E7EB] px-4 py-4 text-left">
          <SheetTitle className="sr-only">Dashboard menu</SheetTitle>
          <SheetDescription className="sr-only">
            Navigate clinic management sections
          </SheetDescription>
          <Link
            href={ROUTES.DASHBOARD.ROOT}
            onClick={closeMobile}
            className={cn(
              "flex items-center gap-2.5 rounded-lg outline-none",
              "focus-visible:ring-2 focus-visible:ring-brand-blue/40 focus-visible:ring-offset-2",
            )}
            aria-label={`${APP_NAME} dashboard`}
          >
            <span
              className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-brand-blue/10 text-brand-blue"
              aria-hidden
            >
              <span className="font-serif text-lg font-semibold leading-none">
                K
              </span>
            </span>
            <span className="flex min-w-0 flex-col">
              <span className="truncate text-sm font-semibold tracking-tight text-brand-dark">
                Krati Dental
              </span>
              <span className="truncate text-[0.6875rem] font-medium tracking-wide text-brand-muted uppercase">
                Admin
              </span>
            </span>
          </Link>
        </SheetHeader>

        <div className="flex flex-1 flex-col gap-1 overflow-y-auto px-3 py-4">
          <nav aria-label="Primary" className="flex flex-col gap-1">
            {primaryItems.map((item) => (
              <SidebarItem
                key={item.id}
                item={item}
                onNavigate={closeMobile}
              />
            ))}
          </nav>

          <Separator className="my-3 bg-[#E5E7EB]" />

          <nav aria-label="Account" className="flex flex-col gap-1">
            {accountItems.map((item) => (
              <SidebarItem
                key={item.id}
                item={item}
                onNavigate={closeMobile}
              />
            ))}
          </nav>
        </div>
      </SheetContent>
    </Sheet>
  );
}
