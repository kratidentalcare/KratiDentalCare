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

import { Logo } from "./logo";
import { NavLinks } from "./nav-links";

export type MobileMenuProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

/**
 * Mobile navigation drawer (right slide-in via shadcn Sheet).
 * Auth controls live in the sticky header; this sheet focuses on links + Book CTA.
 * Closes on link click, overlay click, ESC (Sheet/Dialog defaults), and close button.
 */
export function MobileMenu({ open, onOpenChange }: MobileMenuProps) {
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
            className="size-11 text-[#1A1A1A] hover:bg-transparent hover:text-[#0A84C6] lg:hidden"
            aria-label="Open navigation menu"
          />
        }
      >
        <MenuIcon className="size-7 stroke-[2.25]" aria-hidden />
      </SheetTrigger>

      <SheetContent
        side="right"
        showCloseButton
        className="flex w-full max-w-xs flex-col gap-0 border-[#E5E7EB] bg-[#FFFFFF] p-0 font-montserrat sm:max-w-sm"
      >
        <SheetHeader className="border-b border-[#E5E7EB] px-5 py-4 text-left">
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

        <SheetFooter className="border-t border-[#E5E7EB] p-5">
          <Link
            href={ROUTES.PUBLIC.BOOK}
            onClick={close}
            aria-current={bookActive ? "page" : undefined}
            className={cn(
              "inline-flex h-12 w-full items-center justify-center rounded-full",
              "border border-[#1F2937]/25 bg-[#0A84C6]/10 px-6 text-base font-semibold text-[#1F2937]",
              "transition-all duration-200",
              "hover:border-[#0A84C6]/40 hover:bg-[#0A84C6]/15 hover:text-[#0870A8]",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0A84C6]/40 focus-visible:ring-offset-2",
              "active:scale-[0.98]",
              bookActive &&
                "border-[#0A84C6]/50 bg-[#0A84C6]/18 text-[#0870A8]"
            )}
          >
            Book Appointment
          </Link>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
