"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { MenuIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { APP_NAME } from "@/constants";
import { ROUTES } from "@/constants/routes";
import { cn } from "@/lib/utils";

import { AuthControls } from "./auth-controls";
import { Logo } from "./logo";
import { NavLinks } from "./nav-links";

export type MobileMenuProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** When true, expose the admin Dashboard link in the user menu. */
  isAdmin?: boolean;
};

/**
 * Mobile navigation drawer (right slide-in via shadcn Sheet).
 * Links + auth (Login / Sign up or profile) + Book CTA.
 * Closes on link click, overlay click, ESC (Sheet/Dialog defaults), and close button.
 */
export function MobileMenu({
  open,
  onOpenChange,
  isAdmin = false,
}: MobileMenuProps) {
  const pathname = usePathname();
  const close = () => onOpenChange(false);
  const bookActive =
    pathname === ROUTES.PUBLIC.BOOK ||
    pathname.startsWith(`${ROUTES.PUBLIC.BOOK}/`);

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetTrigger
        render={
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="size-11 text-brand-teal hover:bg-transparent hover:text-brand-teal lg:hidden"
            aria-label="Open navigation menu"
          />
        }
      >
        <MenuIcon className="size-7 stroke-[2.25]" aria-hidden />
      </SheetTrigger>

      <SheetContent
        side="right"
        showCloseButton
        className="flex w-full max-w-xs flex-col gap-0 border-border bg-white p-0 font-montserrat sm:max-w-sm"
      >
        <SheetHeader className="border-b border-border px-5 py-4 text-left">
          <SheetTitle className="sr-only">{APP_NAME} navigation</SheetTitle>
          <SheetDescription className="sr-only">
            Navigate the {APP_NAME} website
          </SheetDescription>
          <Logo onClick={close} />
        </SheetHeader>

        <nav
          className="flex-1 overflow-y-auto px-3 py-4"
          aria-label="Mobile"
        >
          <NavLinks orientation="vertical" onNavigate={close} />
        </nav>

        <SheetFooter className="gap-3 border-t border-border p-5">
          <AuthControls
            isAdmin={isAdmin}
            orientation="vertical"
            onNavigate={close}
          />

          <Link
            href={ROUTES.PUBLIC.BOOK}
            onClick={close}
            aria-current={bookActive ? "page" : undefined}
            className={cn(
              "inline-flex h-12 w-full items-center justify-center rounded-full",
              "bg-brand-blue px-6 text-base font-semibold text-white",
              "shadow-[0_8px_22px_color-mix(in_srgb,var(--brand-blue)_22%,transparent)]",
              "transition-all duration-200",
              "hover:bg-brand-hover",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-blue/40 focus-visible:ring-offset-2",
              "active:scale-[0.98]",
              bookActive && "bg-brand-hover"
            )}
          >
            Book and Smile
          </Link>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
