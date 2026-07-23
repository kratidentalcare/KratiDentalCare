"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useState,
  useTransition,
  type ReactNode,
} from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  CalendarDaysIcon,
  CheckCircle2Icon,
  Clock3Icon,
  Loader2Icon,
  UserRoundIcon,
} from "lucide-react";
import { toast } from "sonner";
import { z } from "zod";

import { FormField } from "@/components/shared/form-field";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { GENDERS } from "@/constants/patient";
import { ROUTES } from "@/constants/routes";
import { DatePickerField } from "@/features/scheduling/components/date-picker-field";
import { formatCivilDateLabel } from "@/features/scheduling/lib/civil-date";
import type {
  BookingAvailabilityResult,
  PublicBookingConfirmation,
} from "@/features/appointments/types";
import { bookingAgeYearsSchema } from "@/validators/appointment-booking";
import {
  phoneSchema,
  emailSchema,
  nonEmptyStringSchema,
} from "@/validators/common";
import { genderSchema } from "@/validators/patient";
import { cn } from "@/lib/utils";

const bookingFormSchema = z.object({
  fullName: nonEmptyStringSchema.max(120),
  phone: phoneSchema,
  email: z.union([emailSchema, z.literal("")]),
  ageYears: bookingAgeYearsSchema,
  gender: genderSchema,
  reason: nonEmptyStringSchema.max(500),
});

type BookingFormValues = z.infer<typeof bookingFormSchema>;

const GENDER_OPTIONS = [
  { value: GENDERS.FEMALE, label: "Female" },
  { value: GENDERS.MALE, label: "Male" },
  { value: GENDERS.OTHER, label: "Other" },
  { value: GENDERS.PREFER_NOT_TO_SAY, label: "Prefer not to say" },
] as const;

type BookingWorkspaceProps = {
  initialDate: string;
};

function Panel({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "rounded-3xl border border-brand-blue/10 bg-white",
        "shadow-[0_12px_40px_color-mix(in_srgb,var(--brand-blue)_6%,transparent)]",
        className,
      )}
    >
      {children}
    </div>
  );
}

function StepLabel({
  step,
  icon: Icon,
  title,
  description,
}: {
  step: number;
  icon: typeof CalendarDaysIcon;
  title: string;
  description?: string;
}) {
  return (
    <div className="flex items-start gap-3">
      <span
        className={cn(
          "mt-0.5 flex size-9 shrink-0 items-center justify-center rounded-full",
          "bg-brand-blue/10 text-brand-blue",
        )}
        aria-hidden
      >
        <Icon className="size-4" strokeWidth={1.75} />
      </span>
      <div className="min-w-0">
        <p className="text-[0.6875rem] font-medium tracking-[0.14em] text-brand-muted uppercase">
          Step {step}
        </p>
        <h2 className="mt-0.5 font-serif text-xl font-medium text-brand-dark">
          {title}
        </h2>
        {description ? (
          <p className="mt-1 text-sm leading-relaxed text-brand-muted">
            {description}
          </p>
        ) : null}
      </div>
    </div>
  );
}

export function BookingWorkspace({ initialDate }: BookingWorkspaceProps) {
  const [selectedDate, setSelectedDate] = useState(initialDate);
  const [availability, setAvailability] =
    useState<BookingAvailabilityResult | null>(null);
  const [selectedSlot, setSelectedSlot] = useState<{
    startAt: string;
    endAt: string;
    label: string;
  } | null>(null);
  const [confirmation, setConfirmation] =
    useState<PublicBookingConfirmation | null>(null);
  const [isLoadingSlots, startLoadSlots] = useTransition();
  const [isSubmitting, startSubmit] = useTransition();

  const form = useForm<BookingFormValues>({
    resolver: zodResolver(bookingFormSchema),
    defaultValues: {
      fullName: "",
      phone: "",
      email: "",
      ageYears: undefined,
      gender: undefined,
      reason: "",
    },
  });

  const loadAvailability = useCallback((date: string) => {
    startLoadSlots(async () => {
      setSelectedSlot(null);
      try {
        const response = await fetch(
          `${ROUTES.API.APPOINTMENTS_AVAILABILITY}?date=${encodeURIComponent(date)}`,
        );
        const result = await response.json();
        if (!result.success) {
          throw new Error(result.error?.message ?? "Failed to load availability");
        }
        setAvailability(result.data);
      } catch (error) {
        setAvailability(null);
        toast.error(
          error instanceof Error ? error.message : "Failed to load availability",
        );
      }
    });
  }, []);

  useEffect(() => {
    loadAvailability(selectedDate);
  }, [selectedDate, loadAvailability]);

  const statusBadge = useMemo(() => {
    if (!availability) return null;
    if (availability.status === "available") {
      return (
        <Badge className="rounded-full bg-emerald-50 font-medium text-emerald-700 hover:bg-emerald-50">
          {availability.availableCount} slots open
        </Badge>
      );
    }
    return (
      <Badge
        variant="secondary"
        className="rounded-full text-brand-muted"
      >
        {availability.reason ?? availability.status}
      </Badge>
    );
  }, [availability]);

  const onSubmit = form.handleSubmit((values) => {
    if (!selectedSlot) {
      toast.error("Please select an available time slot");
      return;
    }

    startSubmit(async () => {
      const bookingReference =
        typeof crypto !== "undefined" && "randomUUID" in crypto
          ? `pub_${crypto.randomUUID().replace(/-/g, "")}`
          : `pub_${Date.now()}`;

      try {
        const response = await fetch(ROUTES.API.APPOINTMENTS, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            ...values,
            date: selectedDate,
            startAt: selectedSlot.startAt,
            endAt: selectedSlot.endAt,
            bookingReference,
          }),
        });
        const result = await response.json();
        if (!result.success) {
          throw new Error(result.error?.message ?? "Booking failed");
        }
        setConfirmation(result.data);
        toast.success("Appointment request submitted");
      } catch (error) {
        toast.error(error instanceof Error ? error.message : "Booking failed");
      }
    });
  });

  if (confirmation) {
    return (
      <Panel className="mx-auto max-w-xl overflow-hidden">
        <div className="bg-gradient-to-br from-brand-blue/8 via-white to-brand-surface px-6 py-10 text-center sm:px-10 sm:py-12">
          <div className="mx-auto mb-4 flex size-14 items-center justify-center rounded-full bg-emerald-50 ring-8 ring-emerald-50/50">
            <CheckCircle2Icon className="size-7 text-emerald-600" />
          </div>
          <h2 className="font-serif text-2xl font-medium text-brand-dark sm:text-3xl">
            Appointment requested
          </h2>
          <p className="mt-2 text-sm leading-relaxed text-brand-muted">
            Pending clinic confirmation. Reference{" "}
            <span className="font-mono text-xs text-brand-dark">
              {confirmation.reference}
            </span>
          </p>

          <div className="mx-auto mt-8 max-w-sm space-y-3 rounded-2xl border border-brand-blue/10 bg-white/80 p-5 text-left text-sm">
            <p>
              <span className="text-brand-muted">Patient</span>
              <span className="mt-0.5 block font-medium text-brand-dark">
                {confirmation.patientName}
              </span>
            </p>
            <p>
              <span className="text-brand-muted">When</span>
              <span className="mt-0.5 block font-medium text-brand-dark">
                {confirmation.label}
              </span>
            </p>
            <p>
              <span className="text-brand-muted">Status</span>
              <span className="mt-0.5 block font-medium capitalize text-brand-dark">
                {confirmation.status}
              </span>
            </p>
          </div>

          <Button
            type="button"
            variant="outline"
            className="mt-8 h-11 w-full rounded-full sm:w-auto sm:min-w-52"
            onClick={() => {
              setConfirmation(null);
              setSelectedSlot(null);
              form.reset();
              loadAvailability(selectedDate);
            }}
          >
            Book another appointment
          </Button>
        </div>
      </Panel>
    );
  }

  return (
    <div className="mx-auto grid max-w-5xl grid-cols-1 gap-5 lg:grid-cols-[minmax(18rem,22rem)_minmax(0,1fr)] lg:gap-6 lg:items-start">
      {/* Schedule first — mobile & desktop flow */}
      <Panel className="overflow-hidden">
        <div className="border-b border-brand-blue/8 bg-gradient-to-br from-brand-blue/[0.06] to-transparent p-5 sm:p-6">
          <StepLabel
            step={1}
            icon={CalendarDaysIcon}
            title="Date & time"
            description={
              availability?.doctorName
                ? `With ${availability.doctorName}`
                : "Choose when you’d like to visit"
            }
          />
        </div>

        <div className="space-y-5 p-5 sm:p-6">
          <div className="space-y-2.5">
            <label className="text-sm font-medium text-brand-dark">
              Select date
            </label>
            <DatePickerField
              value={selectedDate}
              onChange={setSelectedDate}
              disablePast
              className="h-11 rounded-xl border-brand-blue/15 bg-brand-surface"
            />
            <div className="flex min-h-6 items-center justify-between gap-2">
              {statusBadge}
              {isLoadingSlots ? (
                <Loader2Icon className="size-4 animate-spin text-brand-muted" />
              ) : null}
            </div>
          </div>

          <div className="space-y-2.5">
            <div className="flex items-center gap-2">
              <Clock3Icon className="size-4 text-brand-blue" aria-hidden />
              <h3 className="text-sm font-medium text-brand-dark">
                Available times
              </h3>
            </div>

            {!availability || availability.slots.length === 0 ? (
              <p className="rounded-2xl bg-brand-surface px-4 py-5 text-sm leading-relaxed text-brand-muted">
                {availability?.reason ??
                  "No available slots for this date. Try another day."}
              </p>
            ) : (
              <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-2">
                {availability.slots.map((slot) => {
                  const isSelected =
                    selectedSlot?.startAt === slot.startAt &&
                    selectedSlot.endAt === slot.endAt;
                  return (
                    <button
                      key={slot.startAt}
                      type="button"
                      onClick={() =>
                        setSelectedSlot({
                          startAt: slot.startAt,
                          endAt: slot.endAt,
                          label: slot.label,
                        })
                      }
                      className={cn(
                        "h-10 rounded-xl border text-sm font-medium transition-all duration-200",
                        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-blue/40",
                        "active:scale-[0.98]",
                        isSelected
                          ? "border-brand-blue bg-brand-blue text-white shadow-[0_8px_20px_color-mix(in_srgb,var(--brand-blue)_28%,transparent)]"
                          : "border-brand-blue/12 bg-brand-surface text-brand-dark hover:border-brand-blue/35 hover:bg-white",
                      )}
                    >
                      {slot.label}
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {selectedSlot ? (
            <div
              className={cn(
                "flex items-start gap-3 rounded-2xl border border-brand-blue/15",
                "bg-brand-blue/[0.04] px-4 py-3",
              )}
              role="status"
            >
              <CheckCircle2Icon
                className="mt-0.5 size-4 shrink-0 text-brand-blue"
                aria-hidden
              />
              <div className="min-w-0 text-sm">
                <p className="font-medium text-brand-dark">Selected visit</p>
                <p className="mt-0.5 text-brand-muted">
                  {formatCivilDateLabel(selectedDate)} · {selectedSlot.label}
                </p>
              </div>
            </div>
          ) : null}
        </div>
      </Panel>

      {/* Details */}
      <Panel className="overflow-hidden">
        <div className="border-b border-brand-blue/8 bg-gradient-to-br from-brand-surface to-transparent p-5 sm:p-6">
          <StepLabel
            step={2}
            icon={UserRoundIcon}
            title="Your details"
            description="We’ll confirm your appointment by phone or email."
          />
        </div>

        <div className="p-5 sm:p-6">
          <form onSubmit={onSubmit} className="space-y-4" noValidate>
            <FormField
              id="fullName"
              label="Full name"
              required
              error={form.formState.errors.fullName?.message}
            >
              <Input
                {...form.register("fullName")}
                placeholder="Jane Doe"
                autoComplete="name"
                className="h-11 rounded-xl border-brand-blue/15 bg-brand-surface"
              />
            </FormField>

            <div className="grid gap-4 sm:grid-cols-2">
              <FormField
                id="phone"
                label="Phone"
                required
                error={form.formState.errors.phone?.message}
              >
                <Input
                  {...form.register("phone")}
                  placeholder="+91 98765 43210"
                  type="tel"
                  autoComplete="tel"
                  className="h-11 rounded-xl border-brand-blue/15 bg-brand-surface"
                />
              </FormField>
              <FormField
                id="email"
                label="Email"
                error={form.formState.errors.email?.message}
              >
                <Input
                  {...form.register("email")}
                  type="email"
                  autoComplete="email"
                  placeholder="you@example.com"
                  className="h-11 rounded-xl border-brand-blue/15 bg-brand-surface"
                />
              </FormField>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <FormField
                id="ageYears"
                label="Age"
                required
                error={form.formState.errors.ageYears?.message}
              >
                <Input
                  {...form.register("ageYears", { valueAsNumber: true })}
                  type="number"
                  inputMode="numeric"
                  min={0}
                  max={120}
                  placeholder="e.g. 32"
                  className="h-11 rounded-xl border-brand-blue/15 bg-brand-surface"
                />
              </FormField>
              <FormField
                id="gender"
                label="Gender"
                required
                error={form.formState.errors.gender?.message}
              >
                <Select
                  value={form.watch("gender") ?? ""}
                  onValueChange={(value) => {
                    if (value == null || value === "") return;
                    form.setValue("gender", value as BookingFormValues["gender"], {
                      shouldValidate: true,
                      shouldDirty: true,
                    });
                  }}
                >
                  <SelectTrigger className="h-11 w-full rounded-xl border-brand-blue/15 bg-brand-surface">
                    <SelectValue placeholder="Select gender" />
                  </SelectTrigger>
                  <SelectContent>
                    {GENDER_OPTIONS.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </FormField>
            </div>

            <FormField
              id="reason"
              label="Reason for visit"
              required
              error={form.formState.errors.reason?.message}
            >
              <Textarea
                {...form.register("reason")}
                rows={3}
                placeholder="Describe your concern or treatment needed"
                className="rounded-xl border-brand-blue/15 bg-brand-surface"
              />
            </FormField>

            <Button
              type="submit"
              className={cn(
                "mt-2 h-12 w-full rounded-full bg-brand-blue text-base font-semibold text-white",
                "hover:bg-brand-hover",
                "shadow-[0_10px_28px_color-mix(in_srgb,var(--brand-blue)_28%,transparent)]",
                "transition-all duration-200 active:scale-[0.98]",
              )}
              disabled={isSubmitting || !selectedSlot}
            >
              {isSubmitting ? (
                <>
                  <Loader2Icon className="mr-2 size-4 animate-spin" />
                  Submitting…
                </>
              ) : selectedSlot ? (
                "Request appointment"
              ) : (
                "Select a time to continue"
              )}
            </Button>
          </form>
        </div>
      </Panel>
    </div>
  );
}
