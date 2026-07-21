import {
  CalendarCheckIcon,
  CalendarClockIcon,
  CalendarDaysIcon,
  CalendarXIcon,
  ClipboardListIcon,
  ClockIcon,
  UsersIcon,
  type LucideIcon,
} from "lucide-react";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import type { DashboardMetrics } from "@/features/dashboard/types";
import { cn } from "@/lib/utils";

type StatDefinition = {
  id: keyof DashboardMetrics;
  label: string;
  hint: string;
  icon: LucideIcon;
  accent: "blue" | "teal";
};

const STAT_DEFINITIONS: readonly StatDefinition[] = [
  {
    id: "todayAppointments",
    label: "Today's Appointments",
    hint: "Scheduled for today",
    icon: CalendarDaysIcon,
    accent: "blue",
  },
  {
    id: "upcomingAppointments",
    label: "Upcoming Appointments",
    hint: "Future pending / confirmed",
    icon: CalendarClockIcon,
    accent: "teal",
  },
  {
    id: "pendingAppointments",
    label: "Pending Appointments",
    hint: "Awaiting approval",
    icon: ClockIcon,
    accent: "blue",
  },
  {
    id: "completedAppointments",
    label: "Completed Appointments",
    hint: "All completed visits",
    icon: CalendarCheckIcon,
    accent: "teal",
  },
  {
    id: "cancelledAppointments",
    label: "Cancelled Appointments",
    hint: "All cancelled visits",
    icon: CalendarXIcon,
    accent: "blue",
  },
  {
    id: "totalPatients",
    label: "Total Patients",
    hint: "Active patient charts",
    icon: UsersIcon,
    accent: "teal",
  },
  {
    id: "todayPrescriptions",
    label: "Today's Prescriptions",
    hint: "Issued or created today",
    icon: ClipboardListIcon,
    accent: "blue",
  },
] as const;

const accentIconClass: Record<"blue" | "teal", string> = {
  blue: "bg-brand-blue/10 text-brand-blue",
  teal: "bg-brand-teal/10 text-brand-teal",
};

type DashboardStatCardsProps = {
  metrics: DashboardMetrics;
};

export function DashboardStatCards({ metrics }: DashboardStatCardsProps) {
  return (
    <section
      aria-label="Key metrics"
      className="grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4 xl:grid-cols-4"
    >
      {STAT_DEFINITIONS.map((stat) => {
        const Icon = stat.icon;
        return (
          <Card
            key={stat.id}
            className="border-0 bg-white shadow-none ring-1 ring-[#E5E7EB]"
          >
            <CardHeader className="flex flex-row items-start justify-between gap-3">
              <div className="min-w-0 space-y-1">
                <CardDescription className="text-xs font-medium tracking-wide text-brand-muted uppercase sm:text-[0.6875rem]">
                  {stat.label}
                </CardDescription>
                <CardTitle className="font-serif text-3xl font-medium tracking-tight text-brand-dark">
                  {metrics[stat.id].toLocaleString("en-IN")}
                </CardTitle>
              </div>
              <span
                className={cn(
                  "flex size-10 shrink-0 items-center justify-center rounded-xl",
                  accentIconClass[stat.accent],
                )}
                aria-hidden
              >
                <Icon className="size-5" strokeWidth={1.75} />
              </span>
            </CardHeader>
            <CardContent>
              <p className="text-xs text-brand-muted">{stat.hint}</p>
            </CardContent>
          </Card>
        );
      })}
    </section>
  );
}
