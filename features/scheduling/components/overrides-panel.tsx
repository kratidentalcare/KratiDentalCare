"use client";

import { useState } from "react";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { PlusIcon, Trash2Icon } from "lucide-react";
import { toast } from "sonner";

import { FormField } from "@/components/shared/form-field";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { SCHEDULE_OVERRIDE_TYPES } from "@/constants/scheduling";
import {
  createScheduleOverrideAction,
  deleteScheduleOverrideAction,
} from "@/features/scheduling/actions";
import { DatePickerField } from "@/features/scheduling/components/date-picker-field";
import { formatCivilDateLabel } from "@/features/scheduling/lib/civil-date";
import type { OverrideListItem } from "@/features/scheduling/types";
import {
  createScheduleOverrideActionSchema,
  type CreateScheduleOverrideActionInput,
} from "@/validators/schedule-override";

type OverridesPanelProps = {
  initialOverrides: OverrideListItem[];
};

export function OverridesPanel({ initialOverrides }: OverridesPanelProps) {
  const [overrides, setOverrides] = useState(initialOverrides);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  const form = useForm<CreateScheduleOverrideActionInput>({
    resolver: zodResolver(createScheduleOverrideActionSchema),
    defaultValues: {
      date: "",
      type: SCHEDULE_OVERRIDE_TYPES.ALL_DAY,
      startTime: null,
      endTime: null,
      reason: "",
    },
  });

  const overrideType =
    useWatch({ control: form.control, name: "type" }) ??
    SCHEDULE_OVERRIDE_TYPES.ALL_DAY;
  const overrideDate = useWatch({ control: form.control, name: "date" }) ?? "";
  const startTime = useWatch({ control: form.control, name: "startTime" });
  const endTime = useWatch({ control: form.control, name: "endTime" });

  function openCreate() {
    form.reset({
      date: "",
      type: SCHEDULE_OVERRIDE_TYPES.ALL_DAY,
      startTime: null,
      endTime: null,
      reason: "",
    });
    setDialogOpen(true);
  }

  async function onSubmit(values: CreateScheduleOverrideActionInput) {
    setPending(true);
    try {
      const payload: CreateScheduleOverrideActionInput =
        values.type === SCHEDULE_OVERRIDE_TYPES.ALL_DAY
          ? {
              ...values,
              startTime: null,
              endTime: null,
            }
          : values;

      const result = await createScheduleOverrideAction(payload);
      if (!result.success) {
        toast.error(result.error.message);
        return;
      }

      setOverrides((prev) =>
        [
          ...prev,
          {
            id: result.data.id,
            date: payload.date,
            type: payload.type,
            startTime: payload.startTime ?? null,
            endTime: payload.endTime ?? null,
            reason: payload.reason,
            isActive: true,
          },
        ].sort((a, b) => a.date.localeCompare(b.date)),
      );
      toast.success("Date block created");
      setDialogOpen(false);
    } finally {
      setPending(false);
    }
  }

  async function confirmDelete() {
    if (!deleteId) return;
    setPending(true);
    try {
      const result = await deleteScheduleOverrideAction({ id: deleteId });
      if (!result.success) {
        toast.error(result.error.message);
        return;
      }
      setOverrides((prev) => prev.filter((item) => item.id !== deleteId));
      toast.success("Date block removed");
      setDeleteId(null);
    } finally {
      setPending(false);
    }
  }

  return (
    <>
      <Card className="border-0 bg-white shadow-none ring-1 ring-[#E5E7EB]">
        <CardHeader className="flex flex-row items-start justify-between gap-3 border-b border-[#E5E7EB]">
          <div className="space-y-1">
            <CardTitle className="font-montserrat text-base font-semibold text-brand-dark">
              Block Dates & Times
            </CardTitle>
            <CardDescription>
              Block an entire day or a specific time window without creating
              slot documents.
            </CardDescription>
          </div>
          <Button
            type="button"
            size="sm"
            className="rounded-xl bg-brand-blue hover:bg-brand-blue/90"
            onClick={openCreate}
          >
            <PlusIcon className="size-4" />
            Add block
          </Button>
        </CardHeader>
        <CardContent className="pt-4">
          {overrides.length === 0 ? (
            <p className="rounded-xl border border-dashed border-[#E5E7EB] px-4 py-8 text-center text-sm text-brand-muted">
              No blocked dates or times.
            </p>
          ) : (
            <ul className="divide-y divide-[#E5E7EB] rounded-xl border border-[#E5E7EB]">
              {overrides.map((item) => (
                <li
                  key={item.id}
                  className="flex flex-col gap-3 px-4 py-3 sm:flex-row sm:items-center sm:justify-between"
                >
                  <div className="min-w-0 space-y-1">
                    <p className="font-medium text-brand-dark">{item.reason}</p>
                    <p className="text-sm text-brand-muted">
                      {formatCivilDateLabel(item.date)}
                      {item.type === SCHEDULE_OVERRIDE_TYPES.TIME_RANGE &&
                      item.startTime &&
                      item.endTime
                        ? ` · ${item.startTime} – ${item.endTime}`
                        : " · Entire day"}
                    </p>
                    <Badge variant="secondary">
                      {item.type === SCHEDULE_OVERRIDE_TYPES.ALL_DAY
                        ? "Full day"
                        : "Time range"}
                    </Badge>
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="rounded-xl text-destructive"
                    onClick={() => setDeleteId(item.id)}
                  >
                    <Trash2Icon className="size-3.5" />
                    Delete
                  </Button>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Block date or time</DialogTitle>
            <DialogDescription>
              Example: 18 July entire day, or 20 July 2:00 PM – 3:00 PM.
            </DialogDescription>
          </DialogHeader>
          <form
            className="flex flex-col gap-4"
            onSubmit={form.handleSubmit(onSubmit)}
            noValidate
          >
            <FormField
              id="override-date"
              label="Date"
              error={form.formState.errors.date?.message}
              required
            >
              <DatePickerField
                id="override-date"
                value={overrideDate}
                onChange={(value) =>
                  form.setValue("date", value, {
                    shouldValidate: true,
                    shouldDirty: true,
                  })
                }
                disablePast
              />
            </FormField>

            <FormField
              id="override-type"
              label="Block type"
              error={form.formState.errors.type?.message}
              required
            >
              <Select
                value={overrideType}
                onValueChange={(value) => {
                  if (value == null) return;
                  const next = value as CreateScheduleOverrideActionInput["type"];
                  form.setValue("type", next, { shouldValidate: true });
                  if (next === SCHEDULE_OVERRIDE_TYPES.ALL_DAY) {
                    form.setValue("startTime", null);
                    form.setValue("endTime", null);
                  } else {
                    form.setValue("startTime", "14:00");
                    form.setValue("endTime", "15:00");
                  }
                }}
              >
                <SelectTrigger className="h-10 w-full rounded-xl">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={SCHEDULE_OVERRIDE_TYPES.ALL_DAY}>
                    Entire day unavailable
                  </SelectItem>
                  <SelectItem value={SCHEDULE_OVERRIDE_TYPES.TIME_RANGE}>
                    Specific time range
                  </SelectItem>
                </SelectContent>
              </Select>
            </FormField>

            {overrideType === SCHEDULE_OVERRIDE_TYPES.TIME_RANGE ? (
              <div className="grid grid-cols-2 gap-3">
                <FormField
                  id="override-start"
                  label="Start"
                  error={form.formState.errors.startTime?.message}
                  required
                >
                  <Input
                    type="time"
                    className="h-10 rounded-xl"
                    value={startTime ?? ""}
                    onChange={(event) =>
                      form.setValue("startTime", event.target.value, {
                        shouldValidate: true,
                      })
                    }
                  />
                </FormField>
                <FormField
                  id="override-end"
                  label="End"
                  error={form.formState.errors.endTime?.message}
                  required
                >
                  <Input
                    type="time"
                    className="h-10 rounded-xl"
                    value={endTime ?? ""}
                    onChange={(event) =>
                      form.setValue("endTime", event.target.value, {
                        shouldValidate: true,
                      })
                    }
                  />
                </FormField>
              </div>
            ) : null}

            <FormField
              id="override-reason"
              label="Reason"
              error={form.formState.errors.reason?.message}
              required
            >
              <Input
                className="h-10 rounded-xl"
                placeholder="Staff meeting / Equipment maintenance"
                {...form.register("reason")}
              />
            </FormField>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                className="rounded-xl"
                onClick={() => setDialogOpen(false)}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                className="rounded-xl bg-brand-blue hover:bg-brand-blue/90"
                disabled={pending}
              >
                {pending ? "Saving…" : "Create block"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <AlertDialog
        open={deleteId != null}
        onOpenChange={(open) => {
          if (!open) setDeleteId(null);
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remove block?</AlertDialogTitle>
            <AlertDialogDescription>
              Availability will reopen for this date/time (subject to holidays
              and appointments).
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="rounded-xl">Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="rounded-xl"
              onClick={confirmDelete}
              disabled={pending}
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
