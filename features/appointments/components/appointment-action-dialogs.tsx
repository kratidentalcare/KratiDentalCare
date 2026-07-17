"use client";

import { useEffect, useState, useTransition } from "react";
import { Loader2Icon } from "lucide-react";

import {
  getRescheduleAvailabilityAction,
  performAppointmentActionAction,
} from "@/features/appointments/actions";
import { DatePickerField } from "@/features/scheduling/components/date-picker-field";
import { dateToCivilString } from "@/features/scheduling/lib/civil-date";
import type { BookingAvailabilityResult } from "@/features/appointments/types";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

type ActionState = {
  id: string;
  action: "approve" | "cancel" | "complete" | "reschedule";
} | null;

type AppointmentActionDialogsProps = {
  state: ActionState;
  onOpenChange: (open: boolean) => void;
  onComplete: () => void;
  onError: (message: string) => void;
};

type RescheduleDialogContentProps = {
  appointmentId: string;
  onOpenChange: (open: boolean) => void;
  onComplete: () => void;
  onError: (message: string) => void;
};

function RescheduleDialogContent({
  appointmentId,
  onOpenChange,
  onComplete,
  onError,
}: RescheduleDialogContentProps) {
  const [rescheduleDate, setRescheduleDate] = useState(() =>
    dateToCivilString(new Date()),
  );
  const [availability, setAvailability] =
    useState<BookingAvailabilityResult | null>(null);
  const [selectedSlot, setSelectedSlot] = useState<{
    startAt: string;
    endAt: string;
  } | null>(null);
  const [isPending, startTransition] = useTransition();
  const [isLoadingSlots, startLoadSlots] = useTransition();

  useEffect(() => {
    startLoadSlots(async () => {
      const result = await getRescheduleAvailabilityAction({
        appointmentId,
        date: rescheduleDate,
      });
      if (result.success) {
        setAvailability(result.data);
        setSelectedSlot(null);
      } else {
        setAvailability(null);
        onError(result.error.message);
      }
    });
  }, [appointmentId, rescheduleDate, onError]);

  const runReschedule = () => {
    if (!selectedSlot) return;
    startTransition(async () => {
      const result = await performAppointmentActionAction({
        id: appointmentId,
        action: {
          action: "reschedule",
          date: rescheduleDate,
          startAt: selectedSlot.startAt,
          endAt: selectedSlot.endAt,
        },
      });
      if (result.success) {
        onComplete();
      } else {
        onError(result.error.message);
      }
    });
  };

  return (
    <>
      <DialogHeader>
        <DialogTitle>Reschedule appointment</DialogTitle>
        <DialogDescription>
          Choose a new available date and time.
        </DialogDescription>
      </DialogHeader>
      <div className="space-y-4">
        <DatePickerField
          value={rescheduleDate}
          onChange={setRescheduleDate}
          disablePast
        />
        {isLoadingSlots ? (
          <div className="flex justify-center py-4">
            <Loader2Icon className="size-5 animate-spin text-muted-foreground" />
          </div>
        ) : availability && availability.slots.length > 0 ? (
          <div className="grid grid-cols-3 gap-2">
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
            {availability?.reason ?? "No slots available for this date."}
          </p>
        )}
      </div>
      <DialogFooter>
        <Button variant="outline" onClick={() => onOpenChange(false)}>
          Cancel
        </Button>
        <Button
          disabled={isPending || !selectedSlot}
          onClick={runReschedule}
        >
          {isPending ? (
            <Loader2Icon className="size-4 animate-spin" />
          ) : (
            "Reschedule"
          )}
        </Button>
      </DialogFooter>
    </>
  );
}

export function AppointmentActionDialogs({
  state,
  onOpenChange,
  onComplete,
  onError,
}: AppointmentActionDialogsProps) {
  const [cancellationReason, setCancellationReason] = useState("");
  const [isPending, startTransition] = useTransition();

  const runAction = (payload: Record<string, unknown>) => {
    if (!state) return;
    startTransition(async () => {
      const result = await performAppointmentActionAction({
        id: state.id,
        action: payload,
      });
      if (result.success) {
        onComplete();
      } else {
        onError(result.error.message);
      }
    });
  };

  const open = state !== null;
  const action = state?.action;

  return (
    <>
      <Dialog
        open={open && action === "approve"}
        onOpenChange={onOpenChange}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Approve appointment</DialogTitle>
            <DialogDescription>
              Confirm this appointment and notify the patient.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button
              disabled={isPending}
              onClick={() => runAction({ action: "approve" })}
            >
              {isPending ? (
                <Loader2Icon className="size-4 animate-spin" />
              ) : (
                "Approve"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={open && action === "complete"} onOpenChange={onOpenChange}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Mark as completed</DialogTitle>
            <DialogDescription>
              Record that this visit has been completed.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button
              disabled={isPending}
              onClick={() => runAction({ action: "complete" })}
            >
              {isPending ? (
                <Loader2Icon className="size-4 animate-spin" />
              ) : (
                "Complete"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={open && action === "cancel"} onOpenChange={onOpenChange}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Cancel appointment</DialogTitle>
            <DialogDescription>
              Provide a reason for cancellation. The patient may be notified.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-2">
            <Label htmlFor="cancellationReason">Cancellation reason</Label>
            <Textarea
              id="cancellationReason"
              value={cancellationReason}
              onChange={(event) => setCancellationReason(event.target.value)}
              rows={3}
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Back
            </Button>
            <Button
              variant="destructive"
              disabled={isPending || cancellationReason.trim().length < 3}
              onClick={() =>
                runAction({
                  action: "cancel",
                  cancellationReason: cancellationReason.trim(),
                })
              }
            >
              {isPending ? (
                <Loader2Icon className="size-4 animate-spin" />
              ) : (
                "Cancel appointment"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog
        open={open && action === "reschedule"}
        onOpenChange={onOpenChange}
      >
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-md">
          {state?.action === "reschedule" ? (
            <RescheduleDialogContent
              key={state.id}
              appointmentId={state.id}
              onOpenChange={onOpenChange}
              onComplete={onComplete}
              onError={onError}
            />
          ) : null}
        </DialogContent>
      </Dialog>
    </>
  );
}
