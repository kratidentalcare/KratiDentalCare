import Link from "next/link";
import { ArrowUpRight } from "lucide-react";

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

const CREDIT_HREF = "https://adityajain-os.vercel.app/";
const CREDIT_NAME = "Aditya Jain";

export type FooterBottomProps = {
  copyrightOwner?: string;
  year?: number;
  legalLinks?: readonly FooterLegalLink[];
  creditHref?: string;
  creditName?: string;
  className?: string;
};

/**
 * Bottom bar: copyright + legal + designer credit — black strip.
 */
export function FooterBottom({
  copyrightOwner = APP_NAME,
  year = new Date().getFullYear(),
  legalLinks = DEFAULT_LEGAL_LINKS,
  creditHref = CREDIT_HREF,
  creditName = CREDIT_NAME,
  className,
}: FooterBottomProps) {
  return (
    <div className={cn("border-t border-white/10 bg-[#0A0A0A]", className)}>
      <div
        className={cn(
          "public-container-x mx-auto max-w-[var(--container-max-xl)]",
          "flex flex-col items-center gap-5 py-6",
          "sm:flex-row sm:items-center sm:justify-between sm:gap-6 sm:py-5"
        )}
      >
        <p className="text-center text-[0.8125rem] leading-relaxed text-white/65 sm:text-left sm:text-sm">
          © {year} {copyrightOwner}. All Rights Reserved.
        </p>

        <ul
          className="flex flex-wrap items-center justify-center gap-x-5 gap-y-2"
          role="list"
        >
          {legalLinks.map((link) => (
            <li key={link.href}>
              <Link
                href={link.href}
                className={cn(
                  "group relative inline-flex min-h-10 items-center text-sm text-white/65 transition-colors duration-200",
                  "hover:text-white",
                  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0B8EC8]/50 focus-visible:ring-offset-2 focus-visible:ring-offset-[#0A0A0A]"
                )}
              >
                <span className="relative">
                  {link.label}
                  <span
                    aria-hidden
                    className="absolute inset-x-0 -bottom-0.5 h-px origin-left scale-x-0 bg-[#0B8EC8] transition-transform duration-200 group-hover:scale-x-100"
                  />
                </span>
              </Link>
            </li>
          ))}
        </ul>

        <a
          href={creditHref}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={`Designed and developed by ${creditName}`}
          className={cn(
            "group inline-flex items-center gap-2 rounded-full",
            "border border-white/10 bg-white/[0.04] px-3.5 py-2",
            "text-[0.75rem] text-white/55 transition-all duration-200",
            "hover:border-[#0B8EC8]/40 hover:bg-[#0B8EC8]/10 hover:text-white/90",
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0B8EC8]/50 focus-visible:ring-offset-2 focus-visible:ring-offset-[#0A0A0A]",
            "sm:text-[0.8125rem]"
          )}
        >
          <span>
            Designed &amp; developed by{" "}
            <span className="font-semibold text-[#7ec8e8] transition-colors group-hover:text-white">
              {creditName}
            </span>
          </span>
          <ArrowUpRight
            className="size-3.5 shrink-0 text-[#7ec8e8] transition-transform duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:text-white"
            aria-hidden
          />
        </a>
      </div>
    </div>
  );
}
