"use client";

import { useEffect, useState, useTransition } from "react";
import { Loader2Icon } from "lucide-react";

import {
  confirmEmailRescheduleAction,
  getEmailRescheduleAvailabilityAction,
} from "@/features/appointments/actions/email-actions";
import type { EmailActionResultView } from "@/features/appointments/services/email-actions";
import type { EmailReschedulePageData } from "@/features/appointments/services/email-actions";
import type { BookingAvailabilityResult } from "@/features/appointments/types";
import { AppointmentActionResult } from "@/app/(public)/appointment-actions/_components/appointment-action-result";
import { DatePickerField } from "@/features/scheduling/components/date-picker-field";
import { dateToCivilString } from "@/features/scheduling/lib/civil-date";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type EmailRescheduleWorkspaceProps = {
  initial: EmailReschedulePageData;
};

export function EmailRescheduleWorkspace({
  initial,
}: EmailRescheduleWorkspaceProps) {
  const [rescheduleDate, setRescheduleDate] = useState(() =>
    dateToCivilString(new Date()),
  );
  const [availability, setAvailability] =
    useState<BookingAvailabilityResult | null>(null);
  const [selectedSlot, setSelectedSlot] = useState<{
    startAt: string;
    endAt: string;
  } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<EmailActionResultView | null>(null);
  const [isPending, startTransition] = useTransition();
  const [isLoadingSlots, startLoadSlots] = useTransition();

  useEffect(() => {
    startLoadSlots(async () => {
      setError(null);
      const response = await getEmailRescheduleAvailabilityAction({
        token: initial.token,
        date: rescheduleDate,
      });
      if (response.success) {
        setAvailability(response.data);
        setSelectedSlot(null);
      } else {
        setAvailability(null);
        setError(response.error.message);
      }
    });
  }, [initial.token, rescheduleDate]);

  if (result) {
    return <AppointmentActionResult result={result} />;
  }

  return (
    <main className="mx-auto flex w-full max-w-xl flex-1 flex-col px-4 py-10 sm:py-14">
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
        <h1 className="text-2xl font-semibold tracking-tight text-slate-900">
          Reschedule appointment
        </h1>
        <p className="mt-2 text-sm text-slate-600">
          Choose a new available date and time using the clinic scheduling
          engine.
        </p>

        <dl className="mt-6 grid gap-3 rounded-xl border border-slate-100 bg-slate-50 p-4 text-sm">
          <div className="flex justify-between gap-4">
            <dt className="text-slate-500">Patient</dt>
            <dd className="font-medium text-slate-900">{initial.patientName}</dd>
          </div>
          <div className="flex justify-between gap-4">
            <dt className="text-slate-500">Doctor</dt>
            <dd className="font-medium text-slate-900">{initial.doctorName}</dd>
          </div>
          <div className="flex justify-between gap-4">
            <dt className="text-slate-500">Current</dt>
            <dd className="font-medium text-slate-900">
              {initial.dateLabel} · {initial.timeLabel}
            </dd>
          </div>
          <div className="flex justify-between gap-4">
            <dt className="text-slate-500">Status</dt>
            <dd className="font-medium text-slate-900">{initial.status}</dd>
          </div>
        </dl>

        <div className="mt-6 space-y-4">
          <DatePickerField
            value={rescheduleDate}
            onChange={setRescheduleDate}
            disablePast
          />

          {isLoadingSlots ? (
            <div className="flex justify-center py-6">
              <Loader2Icon className="size-5 animate-spin text-muted-foreground" />
            </div>
          ) : availability && availability.slots.length > 0 ? (
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
              {availability.slots.map((slot) => {
                const selected =
                  selectedSlot?.startAt === slot.startAt &&
                  selectedSlot.endAt === slot.endAt;
                return (
                  <Button
                    key={slot.startAt}
                    type="button"
                    size="sm"
                    variant={selected ? "default" : "outline"}
                    className={cn(
                      "text-xs",
                      selected && "bg-brand-blue hover:bg-brand-blue/90",
                    )}
                    onClick={() =>
                      setSelectedSlot({
                        startAt: slot.startAt,
                        endAt: slot.endAt,
                      })
                    }
                  >
                    {slot.label}
                  </Button>
                );
              })}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">
              {error ??
                availability?.reason ??
                "No slots available for this date."}
            </p>
          )}
        </div>

        <div className="mt-8">
          <Button
            className="w-full sm:w-auto"
            disabled={isPending || !selectedSlot}
            onClick={() => {
              if (!selectedSlot) return;
              startTransition(async () => {
                const response = await confirmEmailRescheduleAction({
                  token: initial.token,
                  date: rescheduleDate,
                  startAt: selectedSlot.startAt,
                  endAt: selectedSlot.endAt,
                });
                if (response.success) {
                  setResult(response.data);
                } else {
                  setResult({
                    kind: "error",
                    title: "Unable to reschedule",
                    message: response.error.message,
                  });
                }
              });
            }}
          >
            {isPending ? (
              <Loader2Icon className="size-4 animate-spin" />
            ) : (
              "Confirm reschedule"
            )}
          </Button>
        </div>
      </div>
    </main>
  );
}
