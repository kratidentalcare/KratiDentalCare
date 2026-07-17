import Link from "next/link";
import {
  CalendarDaysIcon,
  CalendarPlusIcon,
  ClipboardListIcon,
  ClockIcon,
  UsersIcon,
} from "lucide-react";

import {
  DASHBOARD_QUICK_ACTIONS,
  PageHeader,
} from "@/components/dashboard";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { cn } from "@/lib/utils";

const STAT_CARDS = [
  {
    id: "today-appointments",
    label: "Today's Appointments",
    value: "—",
    hint: "Placeholder · live count later",
    icon: CalendarDaysIcon,
    accent: "blue" as const,
  },
  {
    id: "total-patients",
    label: "Total Patients",
    value: "—",
    hint: "Placeholder · live count later",
    icon: UsersIcon,
    accent: "teal" as const,
  },
  {
    id: "available-slots",
    label: "Available Slots Today",
    value: "—",
    hint: "Placeholder · live count later",
    icon: ClockIcon,
    accent: "blue" as const,
  },
  {
    id: "pending-prescriptions",
    label: "Pending Prescriptions",
    value: "—",
    hint: "Placeholder · live count later",
    icon: ClipboardListIcon,
    accent: "teal" as const,
  },
] as const;

const RECENT_APPOINTMENT_ROWS = [
  {
    id: "1",
    patient: "—",
    time: "—",
    doctor: "—",
    status: "Pending",
  },
  {
    id: "2",
    patient: "—",
    time: "—",
    doctor: "—",
    status: "Confirmed",
  },
  {
    id: "3",
    patient: "—",
    time: "—",
    doctor: "—",
    status: "Completed",
  },
] as const;

const accentIconClass: Record<"blue" | "teal", string> = {
  blue: "bg-brand-blue/10 text-brand-blue",
  teal: "bg-brand-teal/10 text-brand-teal",
};

/**
 * Dashboard overview — UI placeholders only (no database queries).
 */
export default function DashboardHomePage() {
  return (
    <div className="flex flex-col gap-6 sm:gap-8">
      <PageHeader
        title="Overview"
        description="Clinic activity at a glance. Metrics and tables will connect to live data in later phases."
      />

      <section
        aria-label="Key metrics"
        className="grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4 xl:grid-cols-4"
      >
        {STAT_CARDS.map((stat) => {
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
                    {stat.value}
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

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3 lg:gap-6">
        <Card className="border-0 bg-white shadow-none ring-1 ring-[#E5E7EB] lg:col-span-2">
          <CardHeader className="border-b border-[#E5E7EB]">
            <CardTitle className="font-montserrat text-base font-semibold text-brand-dark">
              Recent Appointments
            </CardTitle>
            <CardDescription>
              Placeholder table — appointment data will load here later.
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-4">
            <Table>
              <TableHeader>
                <TableRow className="hover:bg-transparent">
                  <TableHead>Patient</TableHead>
                  <TableHead>Time</TableHead>
                  <TableHead className="hidden sm:table-cell">Doctor</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {RECENT_APPOINTMENT_ROWS.map((row) => (
                  <TableRow key={row.id}>
                    <TableCell className="font-medium text-brand-dark">
                      {row.patient}
                    </TableCell>
                    <TableCell className="text-brand-muted">{row.time}</TableCell>
                    <TableCell className="hidden text-brand-muted sm:table-cell">
                      {row.doctor}
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant="secondary"
                        className="bg-brand-blue/10 font-medium text-brand-blue hover:bg-brand-blue/10"
                      >
                        {row.status}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        <Card className="border-0 bg-white shadow-none ring-1 ring-[#E5E7EB]">
          <CardHeader className="border-b border-[#E5E7EB]">
            <CardTitle className="font-montserrat text-base font-semibold text-brand-dark">
              Quick Actions
            </CardTitle>
            <CardDescription>
              Shortcuts for upcoming modules (UI only).
            </CardDescription>
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
              Actions link to reserved routes. Module pages ship in later phases.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
