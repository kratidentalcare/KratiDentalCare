import Link from "next/link";

import { ROUTES } from "@/constants/routes";
import { cn } from "@/lib/utils";

export type FooterLinkItem = {
  label: string;
  href: string;
};

/** Quick links — align with public marketing anchors; ClinicSettings can override. */
export const DEFAULT_QUICK_LINKS: readonly FooterLinkItem[] = [
  { label: "Home", href: ROUTES.PUBLIC.HOME },
  { label: "Services", href: ROUTES.PUBLIC.SERVICES },
  { label: "Doctors", href: ROUTES.PUBLIC.DOCTORS },
  { label: "Book Appointment", href: ROUTES.PUBLIC.BOOK },
  { label: "Contact", href: ROUTES.PUBLIC.CONTACT },
] as const;

function isExternalHref(href: string): boolean {
  return /^https?:\/\//i.test(href);
}

export type FooterLinkListProps = {
  title: string;
  links: readonly FooterLinkItem[];
  className?: string;
};

/**
 * Titled link list — 2-col grid on mobile for shorter scroll, stacked on sm+.
 */
export function FooterLinkList({
  title,
  links,
  className,
}: FooterLinkListProps) {
  if (links.length === 0) {
    return null;
  }

  return (
    <div
      className={cn(
        "flex flex-col items-stretch text-center sm:items-start sm:text-left",
        className,
      )}
    >
      <h3 className="text-xs font-semibold tracking-[0.16em] text-[#1F2937] uppercase sm:text-sm sm:tracking-wide">
        {title}
      </h3>
      <ul
        className="mt-4 grid grid-cols-2 gap-x-3 gap-y-1 sm:flex sm:flex-col sm:items-start sm:gap-1"
        role="list"
      >
        {links.map((link) => {
          const classNameLink = cn(
            "group relative inline-flex min-h-11 w-full items-center justify-center rounded-md px-2 text-[0.9375rem] text-[#6B7280] transition-colors duration-200 sm:w-auto sm:justify-start sm:px-0 sm:text-sm",
            "hover:text-[#0A84C6]",
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0A84C6]/40 focus-visible:ring-offset-2",
          );

          const label = (
            <span className="relative">
              {link.label}
              <span
                aria-hidden
                className="absolute inset-x-0 -bottom-0.5 hidden h-px origin-left scale-x-0 bg-[#0A84C6] transition-transform duration-200 group-hover:scale-x-100 sm:block"
              />
            </span>
          );

          return (
            <li key={`${link.label}-${link.href}`} className="min-w-0">
              {isExternalHref(link.href) ? (
                <a
                  href={link.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={classNameLink}
                >
                  {label}
                </a>
              ) : (
                <Link href={link.href} className={classNameLink}>
                  {label}
                </Link>
              )}
            </li>
          );
        })}
      </ul>
    </div>
  );
}
