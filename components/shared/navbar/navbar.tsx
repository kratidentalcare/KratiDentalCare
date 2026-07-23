"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
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
  "bg-brand-blue px-6 text-base font-semibold text-white",
  "shadow-[0_6px_18px_color-mix(in_srgb,var(--brand-blue)_22%,transparent)]",
  "transition-all duration-200",
  "hover:bg-brand-hover",
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-blue/40 focus-visible:ring-offset-2",
  "active:scale-[0.98]"
);

/**
 * Sticky public-site navbar: logo left, links + auth + Book CTA grouped right.
 * Text links: Home / Services / Doctors / Contact. Book and Smile is the CTA.
 */
export function Navbar({ className, isAdmin = false }: NavbarProps) {
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const bookActive =
    pathname === ROUTES.PUBLIC.BOOK ||
    pathname.startsWith(`${ROUTES.PUBLIC.BOOK}/`);

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
        "sticky top-0 z-40 w-full border-b font-montserrat transition-[background-color,box-shadow,border-color] duration-300",
        scrolled
          ? "border-brand-navy/8 bg-white/90 shadow-[0_8px_28px_rgba(26,50,102,0.08)] backdrop-blur-md"
          : "border-transparent bg-white/95 shadow-none backdrop-blur-sm",
        className
      )}
    >
      <PageContainer size="xl" className="h-[4.75rem] sm:h-[5.25rem] lg:h-24">
        <div className="flex h-full items-center justify-between gap-4">
          <div className="flex min-w-0 shrink-0 items-center">
            <Logo />
          </div>

          <div className="flex items-center gap-2 sm:gap-3 lg:gap-5">
            <nav className="hidden lg:block" aria-label="Primary">
              <NavLinks />
            </nav>

            <AuthControls isAdmin={isAdmin} className="hidden lg:flex" />

            <Link
              href={ROUTES.PUBLIC.BOOK}
              aria-current={bookActive ? "page" : undefined}
              className={cn(
                bookCtaClassName,
                "hidden lg:inline-flex",
                bookActive && "bg-brand-hover"
              )}
            >
              Book and Smile
            </Link>

            <MobileMenu
              open={mobileOpen}
              onOpenChange={setMobileOpen}
              isAdmin={isAdmin}
            />
          </div>
        </div>
      </PageContainer>
    </header>
  );
}
