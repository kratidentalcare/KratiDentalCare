"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

import { PageContainer } from "@/components/layout";
import { ROUTES } from "@/constants/routes";
import { cn } from "@/lib/utils";

import { AuthControls } from "./auth-controls";
import { Logo } from "./logo";
import { MobileMenu } from "./mobile-menu";
import { NavLinks } from "./nav-links";

export type NavbarProps = {
  className?: string;
  /**
   * Whether the signed-in app user is an admin (from `isAdmin()`).
   * Controls Dashboard visibility in the user dropdown.
   */
  isAdmin?: boolean;
};

const bookCtaClassName = cn(
  "inline-flex h-11 items-center justify-center rounded-full",
  "border border-[#1F2937]/25 bg-[#0A84C6]/10 px-6 text-base font-semibold text-[#1F2937]",
  "transition-all duration-200",
  "hover:border-[#0A84C6]/40 hover:bg-[#0A84C6]/15 hover:text-[#0870A8]",
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0A84C6]/40 focus-visible:ring-offset-2",
  "active:scale-[0.98]"
);

/**
 * Sticky public-site navbar: logo left, links + auth + CTA grouped right.
 */
export function Navbar({ className, isAdmin = false }: NavbarProps) {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => {
      setScrolled(window.scrollY > 8);
    };

    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={cn(
        "sticky top-0 z-40 w-full border-b bg-[#FFFFFF] font-montserrat transition-shadow duration-300",
        scrolled
          ? "border-transparent shadow-[0_4px_20px_rgba(31,41,55,0.08)]"
          : "border-[#E5E7EB]/80 shadow-none",
        className
      )}
    >
      <PageContainer size="xl" className="h-[5.25rem] sm:h-24 lg:h-[5.75rem]">
        <div className="flex h-full items-center justify-between gap-4">
          <div className="flex min-w-0 shrink-0 items-center">
            <Logo />
          </div>

          <div className="flex items-center gap-2 sm:gap-3 lg:gap-5">
            <nav className="hidden lg:block" aria-label="Primary">
              <NavLinks />
            </nav>

            <AuthControls isAdmin={isAdmin} />

            <Link
              href={ROUTES.PUBLIC.BOOK}
              className={cn(bookCtaClassName, "hidden lg:inline-flex")}
            >
              Book & Smile
            </Link>

            <MobileMenu open={mobileOpen} onOpenChange={setMobileOpen} />
          </div>
        </div>
      </PageContainer>
    </header>
  );
}
