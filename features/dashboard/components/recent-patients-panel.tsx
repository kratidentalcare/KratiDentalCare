import Link from "next/link";

import { buttonVariants } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { DashboardRecentPatient } from "@/features/dashboard/types";
import { ROUTES } from "@/constants/routes";
import { cn } from "@/lib/utils";

type RecentPatientsPanelProps = {
  items: DashboardRecentPatient[];
};

export function RecentPatientsPanel({ items }: RecentPatientsPanelProps) {
  return (
    <Card className="border-0 bg-white shadow-none ring-1 ring-[#E5E7EB]">
      <CardHeader className="flex flex-row items-start justify-between gap-3 border-b border-[#E5E7EB]">
        <div className="space-y-1">
          <CardTitle className="font-montserrat text-base font-semibold text-brand-dark">
            Recent Patients
          </CardTitle>
          <CardDescription>Newest charts in the clinic.</CardDescription>
        </div>
        <Link
          href={ROUTES.DASHBOARD.PATIENTS}
          className={cn(
            buttonVariants({ variant: "outline", size: "sm" }),
            "rounded-lg",
          )}
        >
          View all
        </Link>
      </CardHeader>
      <CardContent className="pt-4">
        {items.length === 0 ? (
          <div className="rounded-xl border border-dashed border-[#E5E7EB] px-6 py-10 text-center text-sm text-muted-foreground">
            No patients yet. Bookings will create patient charts automatically.
          </div>
        ) : (
          <ul className="flex flex-col gap-2">
            {items.map((patient) => (
              <li key={patient.id}>
                <Link
                  href={`${ROUTES.DASHBOARD.PATIENTS}/${patient.id}`}
                  className="flex items-start justify-between gap-3 rounded-xl border border-transparent px-3 py-2.5 transition-colors hover:border-[#E5E7EB] hover:bg-brand-surface/60"
                >
                  <div className="min-w-0">
                    <p className="truncate font-medium text-brand-dark">
                      {patient.fullName}
                    </p>
                    <p className="truncate text-xs text-brand-muted">
                      {patient.phone}
                      {patient.email ? ` · ${patient.email}` : ""}
                    </p>
                  </div>
                  <Badge
                    variant="secondary"
                    className="shrink-0 bg-brand-blue/10 font-medium text-brand-blue hover:bg-brand-blue/10"
                  >
                    {patient.status}
                  </Badge>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}
