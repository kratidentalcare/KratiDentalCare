import type { ComponentType, SVGProps } from "react";

import {
  FacebookIcon,
  InstagramIcon,
  XIcon,
  YouTubeIcon,
} from "./social-icons";
import { cn } from "@/lib/utils";

type IconProps = SVGProps<SVGSVGElement>;

export type FooterSocialItem = {
  label: string;
  href: string;
  icon: ComponentType<IconProps>;
};

/** Placeholder socials — used only when Footer receives no `items` prop. */
export const DEFAULT_FOOTER_SOCIAL: readonly FooterSocialItem[] = [
  {
    label: "Facebook",
    href: "https://facebook.com",
    icon: FacebookIcon,
  },
  {
    label: "Instagram",
    href: "https://instagram.com",
    icon: InstagramIcon,
  },
  {
    label: "X",
    href: "https://x.com",
    icon: XIcon,
  },
  {
    label: "YouTube",
    href: "https://youtube.com",
    icon: YouTubeIcon,
  },
] as const;

export type FooterSocialProps = {
  items?: readonly FooterSocialItem[];
  className?: string;
};

/**
 * Social icon row with hover lift and focus rings.
 * Only renders icons for provided items (empty list → nothing).
 */
export function FooterSocial({
  items = DEFAULT_FOOTER_SOCIAL,
  className,
}: FooterSocialProps) {
  if (items.length === 0) {
    return null;
  }

  return (
    <ul
      className={cn(
        "flex items-center justify-center gap-2.5 sm:justify-start sm:gap-3",
        className,
      )}
      role="list"
      aria-label="Social media"
    >
      {items.map((item) => {
        const Icon = item.icon;

        return (
          <li key={item.label}>
            <a
              href={item.href}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={`Visit our ${item.label} page`}
              className={cn(
                "inline-flex size-11 items-center justify-center rounded-full sm:size-10",
                "border border-[#E5E7EB] bg-[#FFFFFF] text-[#6B7280]",
                "transition-all duration-200",
                "hover:-translate-y-0.5 hover:border-[#0A84C6]/40 hover:bg-[#0A84C6]/10 hover:text-[#0A84C6]",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0A84C6]/40 focus-visible:ring-offset-2",
                "active:scale-95",
              )}
            >
              <Icon />
            </a>
          </li>
        );
      })}
    </ul>
  );
}
