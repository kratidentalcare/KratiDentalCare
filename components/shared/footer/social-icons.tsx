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

export function XIcon(props: IconProps) {
  return (
    <SocialSvg {...props}>
      <path
        d="M17.5 3.5h2.8l-6.1 7 7.2 9.5h-5.6l-4.4-5.7-5 5.7H3.6l6.5-7.4L3.2 3.5h5.8l4 5.2 4.5-5.2Zm-1 15h1.5L7.6 5.1H6L16.5 18.5Z"
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
