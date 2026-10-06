import Link from "next/link";
import { ArrowUpRight } from "lucide-react";

import { APP_NAME } from "@/constants";
import { ROUTES } from "@/constants/routes";
import { cn } from "@/lib/utils";

export type FooterLegalLink = {
  label: string;
  href: string;
};

/** Public legal pages linked from the footer bar. */
export const DEFAULT_LEGAL_LINKS: readonly FooterLegalLink[] = [
  { label: "Privacy Policy", href: ROUTES.PUBLIC.PRIVACY },
  { label: "Terms & Conditions", href: ROUTES.PUBLIC.TERMS },
] as const;

const DESIGNER_HREF = "https://www.linkedin.com/in/unnati-singhal-b636b2327/";
const DESIGNER_NAME = "Unnati Singhal";
const DEVELOPER_HREF = "https://adityajain-os.vercel.app/";
const DEVELOPER_NAME = "Aditya Jain";

function CreditLink({
  href,
  name,
  label,
}: {
  href: string;
  name: string;
  label: string;
}) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={`${label} ${name}`}
      className={cn(
        "group/credit inline-flex items-center gap-0.5 font-semibold text-white",
        "transition-colors duration-200 hover:text-white/85",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-blue/50 focus-visible:ring-offset-2 focus-visible:ring-offset-brand-navy",
      )}
    >
      {name}
      <ArrowUpRight
        className="size-3 shrink-0 text-white/70 transition-transform duration-200 group-hover/credit:translate-x-px group-hover/credit:-translate-y-px group-hover/credit:text-white"
        aria-hidden
      />
    </a>
  );
}

export type FooterBottomProps = {
  copyrightOwner?: string;
  year?: number;
  legalLinks?: readonly FooterLegalLink[];
  designerHref?: string;
  designerName?: string;
  developerHref?: string;
  developerName?: string;
  className?: string;
};

/**
 * Bottom bar: copyright + legal + designer/developer credit — brand navy strip.
 */
export function FooterBottom({
  copyrightOwner = APP_NAME,
  year = new Date().getFullYear(),
  legalLinks = DEFAULT_LEGAL_LINKS,
  designerHref = DESIGNER_HREF,
  designerName = DESIGNER_NAME,
  developerHref = DEVELOPER_HREF,
  developerName = DEVELOPER_NAME,
  className,
}: FooterBottomProps) {
  return (
    <div
      className={cn(
        "border-t border-white/10",
        "bg-[linear-gradient(160deg,#12244a_0%,#1a3266_55%,#2957a4_100%)]",
        className,
      )}
    >
      <div
        className={cn(
          "public-container-x mx-auto max-w-[var(--container-max-xl)]",
          "flex flex-col items-center gap-4 py-5",
          "sm:flex-row sm:flex-wrap sm:items-center sm:justify-between sm:gap-x-6 sm:gap-y-3 sm:py-4",
        )}
      >
        <p className="text-center text-[0.8125rem] leading-relaxed text-white/70 sm:text-left sm:text-sm">
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
                  "group relative inline-flex min-h-10 items-center text-sm text-white/70 transition-colors duration-200",
                  "hover:text-white",
                  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-blue/50 focus-visible:ring-offset-2 focus-visible:ring-offset-brand-navy",
                )}
              >
                <span className="relative">
                  {link.label}
                  <span
                    aria-hidden
                    className="absolute inset-x-0 -bottom-0.5 h-px origin-left scale-x-0 bg-white transition-transform duration-200 group-hover:scale-x-100"
                  />
                </span>
              </Link>
            </li>
          ))}
        </ul>

        <p
          className={cn(
            "flex flex-wrap items-center justify-center gap-x-2 gap-y-1",
            "text-[0.75rem] leading-snug text-white/60",
            "sm:justify-end sm:text-[0.8125rem]",
          )}
        >
          <span className="inline-flex items-center gap-1.5 whitespace-nowrap">
            Designed by
            <CreditLink
              href={designerHref}
              name={designerName}
              label="Designed by"
            />
          </span>
          <span className="text-white/30" aria-hidden>
            ·
          </span>
          <span className="inline-flex items-center gap-1.5 whitespace-nowrap">
            Developed by
            <CreditLink
              href={developerHref}
              name={developerName}
              label="Developed by"
            />
          </span>
        </p>
      </div>
    </div>
  );
}
