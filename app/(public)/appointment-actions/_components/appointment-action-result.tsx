import Link from "next/link";

import { ROUTES } from "@/constants/routes";
import type { EmailActionResultView } from "@/features/appointments/services/email-actions";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type AppointmentActionResultProps = {
  result: EmailActionResultView;
};

export function AppointmentActionResult({
  result,
}: AppointmentActionResultProps) {
  const tone =
    result.kind === "success"
      ? "border-emerald-200 bg-emerald-50 text-emerald-950"
      : result.kind === "already_processed"
        ? "border-amber-200 bg-amber-50 text-amber-950"
        : "border-slate-200 bg-slate-50 text-slate-900";

  return (
    <main className="mx-auto flex w-full max-w-lg flex-1 flex-col justify-center px-4 py-12">
      <div className={cn("rounded-2xl border p-6 shadow-sm sm:p-8", tone)}>
        <p className="text-xs font-semibold tracking-wide uppercase opacity-70">
          Appointment action
        </p>
        <h1 className="mt-2 text-2xl font-semibold tracking-tight">
          {result.title}
        </h1>
        <p className="mt-3 text-sm leading-relaxed opacity-90">
          {result.message}
        </p>
        <div className="mt-6 flex flex-wrap gap-3">
          <Link
            href={ROUTES.DASHBOARD.APPOINTMENTS}
            className={cn(buttonVariants({ variant: "default" }))}
          >
            Open dashboard
          </Link>
          <Link
            href={ROUTES.PUBLIC.CONTACT}
            className={cn(buttonVariants({ variant: "outline" }))}
          >
            Contact clinic
          </Link>
        </div>
      </div>
    </main>
  );
}
