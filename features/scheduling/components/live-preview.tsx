"use client";

import { useState, useTransition } from "react";

import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { AVAILABILITY_STATUSES } from "@/constants/scheduling";
import { previewAvailableSlotsAction } from "@/features/scheduling/actions";
import { DatePickerField } from "@/features/scheduling/components/date-picker-field";
import {
  dateToCivilString,
  formatCivilDateLabel,
} from "@/features/scheduling/lib/civil-date";
import type { AvailabilityResult } from "@/features/scheduling/types";

const CLOSED_STATUSES = new Set<string>([
  AVAILABILITY_STATUSES.HOLIDAY,
  AVAILABILITY_STATUSES.BLOCKED,
  AVAILABILITY_STATUSES.NON_WORKING_DAY,
  AVAILABILITY_STATUSES.CLINIC_CLOSED,
]);

type LivePreviewProps = {
  initialDate: string;
  initialResult: AvailabilityResult;
};

export function LivePreview({
  initialDate,
  initialResult,
}: LivePreviewProps) {
  const [date, setDate] = useState(initialDate);
  const [result, setResult] = useState(initialResult);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function loadPreview(nextDate: string) {
    setDate(nextDate);
    setError(null);
    startTransition(async () => {
      const response = await previewAvailableSlotsAction({ date: nextDate });
      if (!response.success) {
        setError(response.error.message);
        return;
      }
      setResult(response.data);
    });
  }

  const isClosed = CLOSED_STATUSES.has(result.status);
  const closedLabel =
    result.status === AVAILABILITY_STATUSES.HOLIDAY ||
    result.status === AVAILABILITY_STATUSES.BLOCKED ||
    result.status === AVAILABILITY_STATUSES.NON_WORKING_DAY ||
    result.status === AVAILABILITY_STATUSES.CLINIC_CLOSED
      ? "Clinic Closed"
      : result.reason;

  return (
    <Card className="border-0 bg-white shadow-none ring-1 ring-[#E5E7EB]">
      <CardHeader className="border-b border-[#E5E7EB]">
        <CardTitle className="font-montserrat text-base font-semibold text-brand-dark">
          Live Preview
        </CardTitle>
        <CardDescription>
          Select a date to generate available slots at runtime — the same engine
          patients will use later.
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-4 pt-5">
        <div className="max-w-sm">
          <DatePickerField
            value={date}
            onChange={loadPreview}
            disablePast={false}
          />
        </div>

        <div className="flex flex-wrap items-center gap-2 text-sm text-brand-muted">
          <span>{formatCivilDateLabel(date)}</span>
          <Badge variant="outline">{result.durationMinutes} min</Badge>
          <Badge variant="secondary">{result.timezone}</Badge>
          {isPending ? (
            <Badge className="bg-brand-blue/10 text-brand-blue hover:bg-brand-blue/10">
              Updating…
            </Badge>
          ) : null}
        </div>

        {error ? (
          <p className="rounded-xl border border-destructive/30 bg-destructive/5 px-4 py-3 text-sm text-destructive">
            {error}
          </p>
        ) : null}

        {isClosed ? (
          <div className="rounded-xl border border-[#E5E7EB] bg-brand-surface/70 px-4 py-8 text-center">
            <p className="font-serif text-xl font-medium text-brand-dark">
              Clinic Closed
            </p>
            {result.reason ? (
              <p className="mt-1 text-sm text-brand-muted">{result.reason}</p>
            ) : null}
          </div>
        ) : result.status === AVAILABILITY_STATUSES.PAST_DATE ? (
          <div className="rounded-xl border border-[#E5E7EB] bg-brand-surface/70 px-4 py-8 text-center text-sm text-brand-muted">
            {result.reason ?? "Selected date is in the past"}
          </div>
        ) : result.status === AVAILABILITY_STATUSES.FULLY_BOOKED ? (
          <div className="rounded-xl border border-[#E5E7EB] bg-brand-surface/70 px-4 py-8 text-center text-sm text-brand-muted">
            {result.reason ?? "No available slots"}
          </div>
        ) : (
          <div className="flex flex-wrap gap-2">
            {result.slots.map((slot) => (
              <Badge
                key={slot.startAt}
                variant="secondary"
                className="rounded-lg bg-brand-blue/10 px-3 py-1.5 text-sm font-medium text-brand-blue hover:bg-brand-blue/10"
              >
                {slot.label}
              </Badge>
            ))}
          </div>
        )}

        {!isClosed &&
        result.status === AVAILABILITY_STATUSES.AVAILABLE &&
        result.slots.length === 0 ? (
          <p className="text-sm text-brand-muted">{closedLabel}</p>
        ) : null}

        <p className="text-xs text-brand-muted">
          Preview uses today&apos;s clinic rules, holidays, blocks, and booked
          appointments. Default date: {dateToCivilString(new Date())}.
        </p>
      </CardContent>
    </Card>
  );
}
