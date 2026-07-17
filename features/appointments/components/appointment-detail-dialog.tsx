"use client";

import { useEffect, useState, useTransition } from "react";
import { Loader2Icon } from "lucide-react";

import { getAppointmentDetailAction } from "@/features/appointments/actions";
import { AppointmentStatusBadge } from "@/features/appointments/components/appointment-status-badge";
import type { AppointmentDetail } from "@/features/appointments/types";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

type AppointmentDetailDialogProps = {
  appointmentId: string | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

function AppointmentDetailBody({ appointmentId }: { appointmentId: string }) {
  const [detail, setDetail] = useState<AppointmentDetail | null>(null);
  const [isLoading, startLoad] = useTransition();

  useEffect(() => {
    startLoad(async () => {
      const result = await getAppointmentDetailAction({ id: appointmentId });
      setDetail(result.success ? result.data : null);
    });
  }, [appointmentId]);

  if (isLoading && !detail) {
    return (
      <div className="flex justify-center py-8">
        <Loader2Icon className="size-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!detail) {
    return (
      <p className="py-6 text-center text-sm text-muted-foreground">
        Unable to load appointment details.
      </p>
    );
  }

  return (
    <div className="space-y-4 text-sm">
      <div className="flex items-center justify-between gap-2">
        <span className="font-medium text-brand-dark">{detail.patientName}</span>
        <AppointmentStatusBadge status={detail.status} />
      </div>

      <dl className="grid gap-2 rounded-xl bg-[#F8FAFC] p-4">
        <div className="flex justify-between gap-4">
          <dt className="text-muted-foreground">Date</dt>
          <dd>{detail.date}</dd>
        </div>
        <div className="flex justify-between gap-4">
          <dt className="text-muted-foreground">Time</dt>
          <dd>{detail.timeLabel}</dd>
        </div>
        <div className="flex justify-between gap-4">
          <dt className="text-muted-foreground">Doctor</dt>
          <dd>{detail.doctorName}</dd>
        </div>
        <div className="flex justify-between gap-4">
          <dt className="text-muted-foreground">Phone</dt>
          <dd>{detail.phone}</dd>
        </div>
        {detail.email ? (
          <div className="flex justify-between gap-4">
            <dt className="text-muted-foreground">Email</dt>
            <dd>{detail.email}</dd>
          </div>
        ) : null}
        <div className="flex justify-between gap-4">
          <dt className="text-muted-foreground">Reason</dt>
          <dd className="text-right">{detail.reason ?? "—"}</dd>
        </div>
        <div className="flex justify-between gap-4">
          <dt className="text-muted-foreground">Source</dt>
          <dd>{detail.bookingSource}</dd>
        </div>
      </dl>

      {detail.cancellationReason ? (
        <div className="rounded-xl border border-rose-100 bg-rose-50 p-3 text-rose-800">
          <p className="font-medium">Cancellation reason</p>
          <p>{detail.cancellationReason}</p>
        </div>
      ) : null}

      {detail.events.length > 0 ? (
        <div>
          <p className="mb-2 font-medium text-brand-dark">History</p>
          <ul className="space-y-2">
            {detail.events.map((event) => (
              <li
                key={event.id}
                className="rounded-lg border border-[#E5E7EB] px-3 py-2 text-xs"
              >
                <span className="font-medium">{event.eventType}</span>
                <span className="text-muted-foreground">
                  {" "}
                  · {new Date(event.createdAt).toLocaleString()}
                </span>
              </li>
            ))}
          </ul>
        </div>
      ) : null}
    </div>
  );
}

export function AppointmentDetailDialog({
  appointmentId,
  open,
  onOpenChange,
}: AppointmentDetailDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Appointment details</DialogTitle>
          <DialogDescription>
            Full visit information and lifecycle history.
          </DialogDescription>
        </DialogHeader>

        {open && appointmentId ? (
          <AppointmentDetailBody
            key={appointmentId}
            appointmentId={appointmentId}
          />
        ) : null}
      </DialogContent>
    </Dialog>
  );
}
