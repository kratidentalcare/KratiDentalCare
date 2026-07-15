import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

export type PublicShellProps = {
  children: ReactNode;
  /** Future Navbar (and related chrome) mounts here — do not hardcode nav. */
  header?: ReactNode;
  /** Future Footer mounts here — do not hardcode footer. */
  footer?: ReactNode;
  className?: string;
};

const MAIN_CONTENT_ID = "main-content";

/**
 * Public marketing shell. Structural only: header / main / footer slots so
 * Navbar, page sections, and Footer can plug in without changing this layout.
 */
export function PublicShell({
  children,
  header,
  footer,
  className,
}: PublicShellProps) {
  return (
    <div
      className={cn(
        "flex min-h-full flex-1 flex-col bg-background text-foreground",
        className
      )}
    >
      <a
        href={`#${MAIN_CONTENT_ID}`}
        className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:rounded-lg focus:bg-background focus:px-4 focus:py-2 focus:text-sm focus:font-medium focus:text-foreground focus:shadow-md focus:ring-2 focus:ring-ring"
      >
        Skip to main content
      </a>

      {header ? (
        <header className="sticky top-0 z-40 w-full">{header}</header>
      ) : null}

      <main
        id={MAIN_CONTENT_ID}
        tabIndex={-1}
        className="flex flex-1 flex-col outline-none"
      >
        {children}
      </main>

      {footer ? <footer className="mt-auto w-full">{footer}</footer> : null}
    </div>
  );
}
