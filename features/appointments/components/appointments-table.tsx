"use client";

import { useCallback, useState, useTransition } from "react";
import {
  CalendarClockIcon,
  CheckIcon,
  EyeIcon,
  MoreHorizontalIcon,
  XIcon,
} from "lucide-react";
import { toast } from "sonner";

import { AppointmentStatusBadge } from "@/features/appointments/components/appointment-status-badge";
import { AppointmentDetailDialog } from "@/features/appointments/components/appointment-detail-dialog";
import { AppointmentActionDialogs } from "@/features/appointments/components/appointment-action-dialogs";
import type { AppointmentListItem } from "@/features/appointments/types";
import { Button } from "@/components/ui/button";
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

type AppointmentsTableProps = {
  items: AppointmentListItem[];
  onRefresh: () => void;
};

export function AppointmentsTable({ items, onRefresh }: AppointmentsTableProps) {
  const [detailId, setDetailId] = useState<string | null>(null);
  const [actionState, setActionState] = useState<{
    id: string;
    action: "approve" | "cancel" | "complete" | "reschedule";
  } | null>(null);
  const [, startTransition] = useTransition();

  const handleActionComplete = useCallback(() => {
    setActionState(null);
    startTransition(() => onRefresh());
  }, [onRefresh]);

  if (items.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-[#E5E7EB] px-6 py-12 text-center text-sm text-muted-foreground">
        No appointments match your filters.
      </div>
    );
  }

  return (
    <>
      <div className="overflow-x-auto rounded-xl ring-1 ring-[#E5E7EB]">
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent">
              <TableHead>Patient</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Time</TableHead>
              <TableHead className="hidden md:table-cell">Contact</TableHead>
              <TableHead className="hidden lg:table-cell">Reason</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="w-12 text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {items.map((item) => (
              <TableRow key={item.id}>
                <TableCell className="font-medium text-brand-dark">
                  {item.patientName}
                </TableCell>
                <TableCell>{item.date}</TableCell>
                <TableCell>{item.timeLabel}</TableCell>
                <TableCell className="hidden md:table-cell">
                  <div className="text-sm">{item.phone}</div>
                  {item.email ? (
                    <div className="text-xs text-muted-foreground">
                      {item.email}
                    </div>
                  ) : null}
                </TableCell>
                <TableCell className="hidden max-w-[12rem] truncate lg:table-cell">
                  {item.reason ?? "—"}
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
                      <DropdownMenuItem onClick={() => setDetailId(item.id)}>
                        <EyeIcon className="size-4" />
                        View details
                      </DropdownMenuItem>
                      {item.status === APPOINTMENT_STATUSES.PENDING ? (
                        <DropdownMenuItem
                          onClick={() =>
                            setActionState({ id: item.id, action: "approve" })
                          }
                        >
                          <CheckIcon className="size-4" />
                          Approve
                        </DropdownMenuItem>
                      ) : null}
                      {(item.status === APPOINTMENT_STATUSES.PENDING ||
                        item.status === APPOINTMENT_STATUSES.CONFIRMED) && (
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
                            Reschedule
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            variant="destructive"
                            onClick={() =>
                              setActionState({ id: item.id, action: "cancel" })
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
                            setActionState({ id: item.id, action: "complete" })
                          }
                        >
                          <CheckIcon className="size-4" />
                          Mark completed
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
