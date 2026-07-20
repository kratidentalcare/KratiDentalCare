import type { SVGProps } from "react";

import { cn } from "@/lib/utils";

type IconProps = SVGProps<SVGSVGElement>;

function SocialSvg({ className, children, ...props }: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={cn("size-4", className)}
      aria-hidden
      {...props}
    >
      {children}
    </svg>
  );
}

/** Lucide dropped brand glyphs — local SVGs keep stroke weight consistent. */
export function FacebookIcon(props: IconProps) {
  return (
    <SocialSvg {...props}>
      <path
        d="M14 9h3V6h-3c-1.7 0-3 1.3-3 3v2H8v3h3v7h3v-7h2.5l.5-3H14V9c0-.6.4-1 1-1Z"
        fill="currentColor"
      />
    </SocialSvg>
  );
}

export function InstagramIcon(props: IconProps) {
  return (
    <SocialSvg {...props}>
      <rect
        x="3"
        y="3"
        width="18"
        height="18"
        rx="5"
        stroke="currentColor"
        strokeWidth="2"
      />
      <circle cx="12" cy="12" r="4" stroke="currentColor" strokeWidth="2" />
      <circle cx="17.5" cy="6.5" r="1.2" fill="currentColor" />
    </SocialSvg>
  );
}

export function LinkedInIcon(props: IconProps) {
  return (
    <SocialSvg {...props}>
      <path
        d="M6.5 9.5v9M6.5 6.2v.2M10.5 18.5v-5.2c0-1.4.9-2.3 2.1-2.3 1.1 0 1.9.8 1.9 2.3v5.2M16.5 18.5v-5.8c0-2.4 1.4-3.7 3.5-3.7 1.5 0 2.5.8 2.5 2.8v6.7"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M6.5 6.2a1.2 1.2 0 1 0 0-2.4 1.2 1.2 0 0 0 0 2.4Z"
        fill="currentColor"
      />
    </SocialSvg>
  );
}

export function YouTubeIcon(props: IconProps) {
  return (
    <SocialSvg {...props}>
      <rect
        x="2.5"
        y="6"
        width="19"
        height="12"
        rx="3.5"
        stroke="currentColor"
        strokeWidth="2"
      />
      <path d="M11 10.2v3.6l3.2-1.8L11 10.2Z" fill="currentColor" />
    </SocialSvg>
  );
}
