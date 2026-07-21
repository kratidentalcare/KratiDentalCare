"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useState, useTransition } from "react";
import {
  CalendarClockIcon,
  CheckIcon,
  EyeIcon,
  MoreHorizontalIcon,
  PillIcon,
  XIcon,
} from "lucide-react";
import { toast } from "sonner";

import { AppointmentActionDialogs } from "@/features/appointments/components/appointment-action-dialogs";
import { AppointmentDetailDialog } from "@/features/appointments/components/appointment-detail-dialog";
import { AppointmentStatusBadge } from "@/features/appointments/components/appointment-status-badge";
import type { AppointmentListItem } from "@/features/appointments/types";
import { Button, buttonVariants } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { APPOINTMENT_STATUSES } from "@/constants/statuses";
import { ROUTES } from "@/constants/routes";
import { cn } from "@/lib/utils";

type RecentAppointmentsPanelProps = {
  items: AppointmentListItem[];
};

export function RecentAppointmentsPanel({
  items,
}: RecentAppointmentsPanelProps) {
  const router = useRouter();
  const [detailId, setDetailId] = useState<string | null>(null);
  const [actionState, setActionState] = useState<{
    id: string;
    action: "approve" | "cancel" | "complete" | "reschedule";
  } | null>(null);
  const [, startTransition] = useTransition();

  const handleActionComplete = useCallback(() => {
    setActionState(null);
    startTransition(() => router.refresh());
  }, [router]);

  return (
    <>
      <Card className="border-0 bg-white shadow-none ring-1 ring-[#E5E7EB]">
        <CardHeader className="flex flex-row items-start justify-between gap-3 border-b border-[#E5E7EB]">
          <div className="space-y-1">
            <CardTitle className="font-montserrat text-base font-semibold text-brand-dark">
              Recent Appointments
            </CardTitle>
            <CardDescription>
              Latest bookings across the clinic schedule.
            </CardDescription>
          </div>
          <Link
            href={ROUTES.DASHBOARD.APPOINTMENTS}
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
              No appointments yet. Public bookings will appear here.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="hover:bg-transparent">
                    <TableHead>Patient</TableHead>
                    <TableHead>Time</TableHead>
                    <TableHead className="hidden sm:table-cell">Doctor</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="w-12 text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {items.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell className="font-medium text-brand-dark">
                        <div>{item.patientName}</div>
                        <div className="text-xs text-brand-muted sm:hidden">
                          {item.date}
                        </div>
                      </TableCell>
                      <TableCell className="text-brand-muted">
                        <div className="hidden sm:block">{item.date}</div>
                        <div>{item.timeLabel}</div>
                      </TableCell>
                      <TableCell className="hidden text-brand-muted sm:table-cell">
                        {item.doctorName}
                      </TableCell>
                      <TableCell>
                        <AppointmentStatusBadge status={item.status} />
                      </TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger
                            render={
                              <Button
                                type="button"
                                variant="ghost"
                                size="icon-sm"
                                aria-label="Appointment actions"
                              />
                            }
                          >
                            <MoreHorizontalIcon className="size-4" />
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem
                              onClick={() => setDetailId(item.id)}
                            >
                              <EyeIcon className="size-4" />
                              View
                            </DropdownMenuItem>
                            {item.status === APPOINTMENT_STATUSES.PENDING ? (
                              <DropdownMenuItem
                                onClick={() =>
                                  setActionState({
                                    id: item.id,
                                    action: "approve",
                                  })
                                }
                              >
                                <CheckIcon className="size-4" />
                                Approve
                              </DropdownMenuItem>
                            ) : null}
                            {(item.status === APPOINTMENT_STATUSES.PENDING ||
                              item.status ===
                                APPOINTMENT_STATUSES.CONFIRMED) && (
                              <>
                                <DropdownMenuItem
                                  onClick={() =>
                                    setActionState({
                                      id: item.id,
                                      action: "reschedule",
                                    })
                                  }
                                >
                                  <CalendarClockIcon className="size-4" />
                                  Edit / Reschedule
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem
                                  variant="destructive"
                                  onClick={() =>
                                    setActionState({
                                      id: item.id,
                                      action: "cancel",
                                    })
                                  }
                                >
                                  <XIcon className="size-4" />
                                  Cancel
                                </DropdownMenuItem>
                              </>
                            )}
                            {item.status === APPOINTMENT_STATUSES.CONFIRMED ? (
                              <DropdownMenuItem
                                onClick={() =>
                                  setActionState({
                                    id: item.id,
                                    action: "complete",
                                  })
                                }
                              >
                                <CheckIcon className="size-4" />
                                Complete
                              </DropdownMenuItem>
                            ) : null}
                            {item.status === APPOINTMENT_STATUSES.COMPLETED ? (
                              <DropdownMenuItem
                                onClick={() => {
                                  window.location.assign(
                                    `${ROUTES.DASHBOARD.PRESCRIPTIONS}?appointmentId=${item.id}`,
                                  );
                                }}
                              >
                                <PillIcon className="size-4" />
                                Create prescription
                              </DropdownMenuItem>
                            ) : null}
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      <AppointmentDetailDialog
        appointmentId={detailId}
        open={detailId !== null}
        onOpenChange={(open) => !open && setDetailId(null)}
      />

      <AppointmentActionDialogs
        state={actionState}
        onOpenChange={(open) => !open && setActionState(null)}
        onComplete={handleActionComplete}
        onError={(message) => toast.error(message)}
      />
    </>
  );
}
