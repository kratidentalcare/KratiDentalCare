import Link from "next/link";
import { CalendarPlusIcon } from "lucide-react";

import { DASHBOARD_QUICK_ACTIONS } from "@/components/dashboard";
import { buttonVariants } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { cn } from "@/lib/utils";

export function DashboardQuickActionsCard() {
  return (
    <Card className="border-0 bg-white shadow-none ring-1 ring-[#E5E7EB]">
      <CardHeader className="border-b border-[#E5E7EB]">
        <CardTitle className="font-montserrat text-base font-semibold text-brand-dark">
          Quick Actions
        </CardTitle>
        <CardDescription>Jump to common clinic workflows.</CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-2 pt-4">
        {DASHBOARD_QUICK_ACTIONS.map((action) => {
          const Icon = action.icon;
          return (
            <Link
              key={action.id}
              href={action.href}
              className={cn(
                buttonVariants({ variant: "outline" }),
                "h-11 w-full justify-start gap-3 rounded-xl border-[#E5E7EB] bg-brand-surface/60",
                "font-medium text-brand-dark",
                "hover:border-brand-blue/30 hover:bg-brand-blue/[0.06] hover:text-brand-blue",
              )}
            >
              <span className="flex size-8 items-center justify-center rounded-lg bg-brand-blue/10 text-brand-blue">
                <Icon className="size-4" strokeWidth={1.75} aria-hidden />
              </span>
              {action.label}
            </Link>
          );
        })}

        <p className="mt-2 flex items-start gap-2 text-xs leading-relaxed text-brand-muted">
          <CalendarPlusIcon
            className="mt-0.5 size-3.5 shrink-0 text-brand-teal"
            aria-hidden
          />
          Use Scheduling to adjust hours, holidays, and blocked dates. Live
          availability powers public booking.
        </p>
      </CardContent>
    </Card>
  );
}
