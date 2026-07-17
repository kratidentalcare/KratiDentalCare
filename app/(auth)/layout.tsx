import type { Metadata } from "next";

import { Logo } from "@/components/shared/navbar";
import { APP_NAME } from "@/constants";

export const metadata: Metadata = {
  title: "Account",
  robots: {
    index: false,
    follow: false,
  },
};

/**
 * Auth shell for Clerk Sign In / Sign Up.
 * Matches public marketing brand (Montserrat, clinic blue, soft surface).
 */
export default function AuthLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <main className="relative flex flex-1 flex-col items-center justify-center overflow-hidden bg-[linear-gradient(180deg,#F8FBFD_0%,#FFFFFF_45%,#F0F9F8_100%)] px-4 py-10 font-montserrat sm:py-14">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 h-48 bg-[radial-gradient(ellipse_at_top,rgba(10,132,198,0.12),transparent_65%)]"
      />
      <div className="relative z-10 mb-8 flex flex-col items-center gap-3 text-center">
        <Logo />
        <p className="max-w-sm text-sm text-[#6B7280] sm:text-base">
          Sign in or create an account to manage appointments at {APP_NAME}.
        </p>
      </div>
      <div className="relative z-10 w-full max-w-[420px]">{children}</div>
    </main>
  );
}
