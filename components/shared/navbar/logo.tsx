import Image from "next/image";
import Link from "next/link";

import { APP_NAME } from "@/constants";
import { ROUTES } from "@/constants/routes";
import { cn } from "@/lib/utils";

export type LogoProps = {
  className?: string;
  /** Kept for API compatibility; image logo includes the wordmark. */
  showWordmark?: boolean;
  onClick?: () => void;
};

/**
 * Clinic brand logo linking home.
 */
export function Logo({ className, onClick }: LogoProps) {
  return (
    <Link
      href={ROUTES.PUBLIC.HOME}
      onClick={onClick}
      className={cn(
        "group inline-flex items-center rounded-md outline-none transition-opacity hover:opacity-80 focus-visible:ring-2 focus-visible:ring-brand-blue/35 focus-visible:ring-offset-2",
        className
      )}
      aria-label={`${APP_NAME} home`}
    >
      <Image
        src="/images/logonavbar.png"
        alt={APP_NAME}
        width={968}
        height={377}
        priority
        className="h-12 w-auto object-contain sm:h-14 lg:h-16"
      />
    </Link>
  );
}
