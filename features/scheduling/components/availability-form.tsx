"use client";

import { useFieldArray, useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { PlusIcon, Trash2Icon } from "lucide-react";
import { toast } from "sonner";
import { z } from "zod";

import { FormField } from "@/components/shared/form-field";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  APPOINTMENT_DURATION_MINUTES,
  DEFAULT_CLINIC_TIMEZONE,
  WEEKDAY_VALUES,
  WEEKDAYS,
  type AppointmentDurationMinutes,
  type Weekday,
} from "@/constants/scheduling";
import { updateClinicAvailabilityAction } from "@/features/scheduling/actions";
import type { ClinicAvailabilityFormValues } from "@/features/scheduling/types";
import {
  appointmentDurationMinutesSchema,
  clinicBreakWindowSchema,
  timeOfDaySchema,
  timezoneSchema,
  workingDaysSchema,
} from "@/validators/clinic-settings";

const WEEKDAY_LABELS: Record<Weekday, string> = {
  [WEEKDAYS.MONDAY]: "Monday",
  [WEEKDAYS.TUESDAY]: "Tuesday",
  [WEEKDAYS.WEDNESDAY]: "Wednesday",
  [WEEKDAYS.THURSDAY]: "Thursday",
  [WEEKDAYS.FRIDAY]: "Friday",
  [WEEKDAYS.SATURDAY]: "Saturday",
  [WEEKDAYS.SUNDAY]: "Sunday",
};

const availabilityFormSchema = z
  .object({
    timezone: timezoneSchema,
    workingDays: workingDaysSchema,
    openingTime: timeOfDaySchema,
    closingTime: timeOfDaySchema,
    appointmentDurationMinutes: appointmentDurationMinutesSchema,
    breaks: z.array(clinicBreakWindowSchema).max(12),
  })
  .superRefine((value, ctx) => {
    const [oh, om] = value.openingTime.split(":").map(Number);
    const [ch, cm] = value.closingTime.split(":").map(Number);
    if (ch * 60 + cm <= oh * 60 + om) {
      ctx.addIssue({
        code: "custom",
        message: "Closing time must be after opening time",
        path: ["closingTime"],
      });
    }
  });

type AvailabilityFormProps = {
  initialValues: ClinicAvailabilityFormValues;
};

export function AvailabilityForm({ initialValues }: AvailabilityFormProps) {
  const form = useForm<ClinicAvailabilityFormValues>({
    resolver: zodResolver(availabilityFormSchema),
    defaultValues: {
      ...initialValues,
      timezone: initialValues.timezone || DEFAULT_CLINIC_TIMEZONE,
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "breaks",
  });

  const workingDays =
    useWatch({
      control: form.control,
      name: "workingDays",
    }) ?? [];

  const durationMinutes = useWatch({
    control: form.control,
    name: "appointmentDurationMinutes",
  });

  async function onSubmit(values: ClinicAvailabilityFormValues) {
    const result = await updateClinicAvailabilityAction(values);
    if (!result.success) {
      toast.error(result.error.message);
      return;
    }
    toast.success("Availability settings saved");
  }

  function toggleWorkingDay(day: Weekday, checked: boolean) {
    const current = new Set(form.getValues("workingDays"));
    if (checked) {
      current.add(day);
    } else {
      current.delete(day);
    }
    const next = WEEKDAY_VALUES.filter((item) => current.has(item));
    form.setValue("workingDays", next, {
      shouldValidate: true,
      shouldDirty: true,
    });
  }

  return (
    <Card className="border-0 bg-white shadow-none ring-1 ring-[#E5E7EB]">
      <CardHeader className="border-b border-[#E5E7EB]">
        <CardTitle className="font-montserrat text-base font-semibold text-brand-dark">
          Clinic Availability
        </CardTitle>
        <CardDescription>
          Configure working days, hours, appointment duration, and recurring
          breaks. Slots are generated dynamically — nothing is stored as slot
          inventory. Existing appointments are never modified when these
          settings change; only future availability uses the updated rules.
        </CardDescription>
      </CardHeader>
      <CardContent className="pt-5">
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="flex flex-col gap-6"
          noValidate
        >
          <FormField
            id="working-days"
            label="Working Days"
            error={form.formState.errors.workingDays?.message}
            required
          >
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-4">
              {WEEKDAY_VALUES.map((day) => {
                const checked = workingDays.includes(day);
                return (
                  <label
                    key={day}
                    className="flex cursor-pointer items-center gap-2 rounded-xl border border-[#E5E7EB] bg-brand-surface/50 px-3 py-2.5 text-sm"
                  >
                    <Checkbox
                      checked={checked}
                      onCheckedChange={(value) =>
                        toggleWorkingDay(day, value === true)
                      }
                    />
                    <span>{WEEKDAY_LABELS[day]}</span>
                  </label>
                );
              })}
            </div>
          </FormField>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <FormField
              id="opening-time"
              label="Opening Time"
              error={form.formState.errors.openingTime?.message}
              required
            >
              <Input
                type="time"
                className="h-10 rounded-xl"
                {...form.register("openingTime")}
              />
            </FormField>

            <FormField
              id="closing-time"
              label="Closing Time"
              error={form.formState.errors.closingTime?.message}
              required
            >
              <Input
                type="time"
                className="h-10 rounded-xl"
                {...form.register("closingTime")}
              />
            </FormField>

            <FormField
              id="duration"
              label="Appointment Duration"
              error={form.formState.errors.appointmentDurationMinutes?.message}
              required
            >
              <Select
                value={String(durationMinutes)}
                onValueChange={(value) => {
                  if (value == null) return;
                  form.setValue(
                    "appointmentDurationMinutes",
                    Number(value) as AppointmentDurationMinutes,
                    { shouldValidate: true, shouldDirty: true },
                  );
                }}
              >
                <SelectTrigger className="h-10 w-full rounded-xl">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {APPOINTMENT_DURATION_MINUTES.map((minutes) => (
                    <SelectItem key={minutes} value={String(minutes)}>
                      {minutes} min
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </FormField>

            <FormField
              id="timezone"
              label="Timezone"
              description="IANA timezone used for all booking math"
              error={form.formState.errors.timezone?.message}
              required
            >
              <Input
                className="h-10 rounded-xl"
                {...form.register("timezone")}
              />
            </FormField>
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-sm font-medium text-brand-dark">
                  Break Timings
                </p>
                <p className="text-xs text-brand-muted">
                  Multiple breaks supported (e.g. lunch, tea).
                </p>
              </div>
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="rounded-xl"
                onClick={() =>
                  append({
                    startTime: "13:00",
                    endTime: "14:00",
                    label: "Break",
                  })
                }
              >
                <PlusIcon className="size-4" />
                Add break
              </Button>
            </div>

            {fields.length === 0 ? (
              <p className="rounded-xl border border-dashed border-[#E5E7EB] px-4 py-6 text-center text-sm text-brand-muted">
                No breaks configured.
              </p>
            ) : (
              <ul className="flex flex-col gap-3">
                {fields.map((field, index) => (
                  <li
                    key={field.id}
                    className="grid grid-cols-1 gap-3 rounded-xl border border-[#E5E7EB] bg-brand-surface/40 p-3 sm:grid-cols-[1fr_1fr_1fr_auto]"
                  >
                    <FormField
                      id={`break-start-${index}`}
                      label="Start"
                      error={
                        form.formState.errors.breaks?.[index]?.startTime?.message
                      }
                    >
                      <Input
                        type="time"
                        className="h-10 rounded-xl"
                        {...form.register(`breaks.${index}.startTime`)}
                      />
                    </FormField>
                    <FormField
                      id={`break-end-${index}`}
                      label="End"
                      error={
                        form.formState.errors.breaks?.[index]?.endTime?.message
                      }
                    >
                      <Input
                        type="time"
                        className="h-10 rounded-xl"
                        {...form.register(`breaks.${index}.endTime`)}
                      />
                    </FormField>
                    <FormField
                      id={`break-label-${index}`}
                      label="Label"
                      error={
                        form.formState.errors.breaks?.[index]?.label?.message
                      }
                    >
                      <Input
                        className="h-10 rounded-xl"
                        placeholder="Lunch"
                        {...form.register(`breaks.${index}.label`)}
                      />
                    </FormField>
                    <div className="flex items-end">
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="text-destructive"
                        onClick={() => remove(index)}
                        aria-label={`Remove break ${index + 1}`}
                      >
                        <Trash2Icon className="size-4" />
                      </Button>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>

          <div className="flex flex-wrap items-center justify-between gap-3 border-t border-[#E5E7EB] pt-4">
            <Badge
              variant="secondary"
              className="bg-brand-teal/10 font-medium text-brand-teal hover:bg-brand-teal/10"
            >
              Dynamic slots · no inventory rows
            </Badge>
            <Button
              type="submit"
              className="rounded-xl bg-brand-blue hover:bg-brand-blue/90"
              disabled={form.formState.isSubmitting}
            >
              {form.formState.isSubmitting ? "Saving…" : "Save availability"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
