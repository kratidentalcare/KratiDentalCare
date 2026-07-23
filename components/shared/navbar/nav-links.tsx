"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState, type MouseEvent } from "react";

import { ROUTES } from "@/constants/routes";
import { cn } from "@/lib/utils";

export type NavLinkItem = {
  href: string;
  label: string;
};

export const PUBLIC_NAV_LINKS: readonly NavLinkItem[] = [
  { href: ROUTES.PUBLIC.HOME, label: "Home" },
  { href: ROUTES.PUBLIC.SERVICES, label: "Services" },
  { href: ROUTES.PUBLIC.DOCTORS, label: "Doctors" },
  { href: ROUTES.PUBLIC.CONTACT, label: "Contact" },
] as const;

export type NavLinksProps = {
  className?: string;
  linkClassName?: string;
  /** Called after a link is activated (e.g. close mobile drawer). */
  onNavigate?: () => void;
  orientation?: "horizontal" | "vertical";
};

function getHash(href: string): string | null {
  const hashIndex = href.indexOf("#");
  if (hashIndex === -1) return null;
  return href.slice(hashIndex);
}

function readLocationHash(): string {
  if (typeof window === "undefined") return "";
  return window.location.hash;
}

/**
 * Tracks the URL hash. Next.js App Router often skips `hashchange` on
 * same-page Link clicks, so callers also set the hash optimistically.
 */
function useActiveHash(): [string, (next: string) => void] {
  const [hash, setHash] = useState("");

  useEffect(() => {
    const sync = () => setHash(readLocationHash());
    sync();
    window.addEventListener("hashchange", sync);
    window.addEventListener("popstate", sync);
    return () => {
      window.removeEventListener("hashchange", sync);
      window.removeEventListener("popstate", sync);
    };
  }, []);

  return [hash, setHash];
}

export function isNavLinkActive(
  href: string,
  pathname: string,
  hash: string
): boolean {
  const linkHash = getHash(href);

  if (href === ROUTES.PUBLIC.HOME || href === "/") {
    return pathname === "/" && (hash === "" || hash === "#");
  }

  if (linkHash) {
    return pathname === "/" && hash === linkHash;
  }

  return pathname === href || pathname.startsWith(`${href}/`);
}

/**
 * Public site navigation links with active indicator.
 */
export function NavLinks({
  className,
  linkClassName,
  onNavigate,
  orientation = "horizontal",
}: NavLinksProps) {
  const pathname = usePathname();
  const [hash, setHash] = useActiveHash();

  const handleClick = (item: NavLinkItem) => (
    event: MouseEvent<HTMLAnchorElement>
  ) => {
    const linkHash = getHash(item.href);

    if (!linkHash) {
      // Home — clear hash (Next Link can leave `/#section` in place).
      setHash("");
      if (readLocationHash()) {
        event.preventDefault();
        window.history.pushState(null, "", ROUTES.PUBLIC.HOME);
        window.scrollTo({ top: 0, behavior: "smooth" });
      }
    } else {
      // Optimistic active state — Next often doesn't fire `hashchange`.
      setHash(linkHash);

      if (pathname === "/" && readLocationHash() !== linkHash) {
        event.preventDefault();
        window.history.pushState(null, "", `/${linkHash}`);
        const target = document.getElementById(linkHash.slice(1));
        target?.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    }

    onNavigate?.();
  };

  return (
    <ul
      className={cn(
        orientation === "horizontal"
          ? "flex items-center gap-0.5 lg:gap-1"
          : "flex flex-col gap-1",
        className
      )}
      role="list"
    >
      {PUBLIC_NAV_LINKS.map((item) => {
        const active = isNavLinkActive(item.href, pathname, hash);

        return (
          <li key={item.href}>
            <Link
              href={item.href}
              onClick={handleClick(item)}
              aria-current={active ? "page" : undefined}
              className={cn(
                "relative inline-flex items-center rounded-md px-3 py-2.5 text-base font-medium transition-colors duration-200 outline-none",
                "focus-visible:ring-2 focus-visible:ring-brand-blue/40 focus-visible:ring-offset-2",
                active
                  ? "text-brand-blue"
                  : "text-brand-dark hover:text-brand-blue",
                orientation === "vertical" && "w-full px-3 py-3.5 text-lg",
                linkClassName
              )}
            >
              {item.label}
              <span
                aria-hidden
                className={cn(
                  "absolute inset-x-3 bottom-1 h-0.5 origin-left rounded-full bg-brand-blue transition-transform duration-200",
                  orientation === "vertical" && "inset-x-0 bottom-0",
                  active ? "scale-x-100" : "scale-x-0"
                )}
              />
            </Link>
          </li>
        );
      })}
    </ul>
  );
}
