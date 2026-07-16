import Link from "next/link";

import { APP_NAME } from "@/constants";
import { cn } from "@/lib/utils";

export type FooterLegalLink = {
  label: string;
  href: string;
};

/** Legal placeholders — replace with CMS / static policy pages later. */
export const DEFAULT_LEGAL_LINKS: readonly FooterLegalLink[] = [
  { label: "Privacy Policy", href: "/privacy" },
  { label: "Terms & Conditions", href: "/terms" },
] as const;

export type FooterBottomProps = {
  copyrightOwner?: string;
  year?: number;
  legalLinks?: readonly FooterLegalLink[];
  credit?: string;
  className?: string;
};

/**
 * Bottom bar: copyright + legal + credit — black strip.
 */
export function FooterBottom({
  copyrightOwner = APP_NAME,
  year = new Date().getFullYear(),
  legalLinks = DEFAULT_LEGAL_LINKS,
  credit = "Designed and developed by Aditya Jain",
  className,
}: FooterBottomProps) {
  return (
    <div className={cn("border-t border-white/10 bg-[#0A0A0A]", className)}>
      <div className="public-container-x mx-auto flex max-w-[var(--container-max-xl)] flex-col items-center gap-4 py-6 text-center sm:gap-3 sm:py-5">
        <div className="flex w-full flex-col items-center gap-4 sm:flex-row sm:justify-between sm:text-left">
          <p className="max-w-xs text-[0.8125rem] leading-relaxed text-white/70 sm:max-w-none sm:text-sm">
            © {year} {copyrightOwner}.
            <span className="mt-0.5 block sm:mt-0 sm:inline">
              {" "}
              All Rights Reserved.
            </span>
          </p>

          <ul
            className="flex w-full max-w-sm flex-col items-stretch gap-1 sm:w-auto sm:max-w-none sm:flex-row sm:items-center sm:gap-x-5"
            role="list"
          >
            {legalLinks.map((link) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  className={cn(
                    "group relative inline-flex min-h-11 w-full items-center justify-center rounded-md text-sm text-white/70 transition-colors duration-200 sm:min-h-0 sm:w-auto sm:justify-start",
                    "hover:text-white",
                    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0A84C6]/50 focus-visible:ring-offset-2 focus-visible:ring-offset-[#0A0A0A]"
                  )}
                >
                  <span className="relative">
                    {link.label}
                    <span
                      aria-hidden
                      className="absolute inset-x-0 -bottom-0.5 hidden h-px origin-left scale-x-0 bg-[#0A84C6] transition-transform duration-200 group-hover:scale-x-100 sm:block"
                    />
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <p className="text-[0.75rem] tracking-wide text-white/50 sm:text-[0.8125rem]">
          {credit}
        </p>
      </div>
    </div>
  );
}
