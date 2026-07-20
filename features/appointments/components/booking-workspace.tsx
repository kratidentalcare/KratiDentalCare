"use client";

import { useCallback, useEffect, useMemo, useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { CheckCircle2Icon, Loader2Icon } from "lucide-react";
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
        <Badge className="bg-emerald-50 text-emerald-700">
          {availability.availableCount} slots available
        </Badge>
      );
    }
    return (
      <Badge variant="secondary" className="text-muted-foreground">
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
      <Card className="mx-auto max-w-2xl border-0 shadow-none ring-1 ring-[#E5E7EB]">
        <CardHeader className="text-center">
          <div className="mx-auto mb-2 flex size-12 items-center justify-center rounded-full bg-emerald-50">
            <CheckCircle2Icon className="size-6 text-emerald-600" />
          </div>
          <CardTitle className="font-serif text-2xl text-brand-dark">
            Appointment Requested
          </CardTitle>
          <CardDescription>
            Your booking is pending clinic confirmation. Reference:{" "}
            <span className="font-mono text-xs">{confirmation.reference}</span>
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3 text-sm">
          <div className="rounded-xl bg-[#F8FAFC] p-4">
            <p>
              <span className="text-muted-foreground">Patient:</span>{" "}
              {confirmation.patientName}
            </p>
            <p>
              <span className="text-muted-foreground">When:</span>{" "}
              {confirmation.label}
            </p>
            <p>
              <span className="text-muted-foreground">Status:</span>{" "}
              {confirmation.status}
            </p>
          </div>
          <Button
            type="button"
            variant="outline"
            className="w-full"
            onClick={() => {
              setConfirmation(null);
              setSelectedSlot(null);
              form.reset();
              loadAvailability(selectedDate);
            }}
          >
            Book another appointment
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="mx-auto grid max-w-5xl grid-cols-1 gap-6 lg:grid-cols-[minmax(0,1fr)_20rem]">
      <Card className="border-0 shadow-none ring-1 ring-[#E5E7EB]">
        <CardHeader>
          <CardTitle className="font-serif text-xl text-brand-dark">
            Your details
          </CardTitle>
          <CardDescription>
            We will confirm your appointment by phone or email.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={onSubmit} className="space-y-4">
            <FormField
              id="fullName"
              label="Full name"
              required
              error={form.formState.errors.fullName?.message}
            >
              <Input {...form.register("fullName")} placeholder="Jane Doe" />
            </FormField>
            <div className="grid gap-4 sm:grid-cols-2">
              <FormField
                id="phone"
                label="Phone"
                required
                error={form.formState.errors.phone?.message}
              >
                <Input {...form.register("phone")} placeholder="+91 98765 43210" />
              </FormField>
              <FormField
                id="email"
                label="Email"
                error={form.formState.errors.email?.message}
              >
                <Input
                  {...form.register("email")}
                  type="email"
                  placeholder="you@example.com"
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
                />
              </FormField>
              <FormField
                id="gender"
                label="Gender"
                required
                error={form.formState.errors.gender?.message}
              >
                <Select
                  value={form.watch("gender")}
                  onValueChange={(value) => {
                    if (value == null) return;
                    form.setValue("gender", value as BookingFormValues["gender"], {
                      shouldValidate: true,
                      shouldDirty: true,
                    });
                  }}
                >
                  <SelectTrigger className="w-full">
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
              />
            </FormField>
            <Button
              type="submit"
              className="w-full bg-brand-blue hover:bg-brand-blue/90"
              disabled={isSubmitting || !selectedSlot}
            >
              {isSubmitting ? (
                <>
                  <Loader2Icon className="mr-2 size-4 animate-spin" />
                  Submitting…
                </>
              ) : (
                "Request appointment"
              )}
            </Button>
          </form>
        </CardContent>
      </Card>

      <div className="space-y-4">
        <Card className="border-0 shadow-none ring-1 ring-[#E5E7EB]">
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-semibold">Select date</CardTitle>
            {availability?.doctorName ? (
              <CardDescription>With {availability.doctorName}</CardDescription>
            ) : null}
          </CardHeader>
          <CardContent className="space-y-3">
            <DatePickerField
              value={selectedDate}
              onChange={setSelectedDate}
              disablePast
            />
            <div className="flex items-center justify-between gap-2">
              {statusBadge}
              {isLoadingSlots ? (
                <Loader2Icon className="size-4 animate-spin text-muted-foreground" />
              ) : null}
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-none ring-1 ring-[#E5E7EB]">
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-semibold">
              Available times
            </CardTitle>
          </CardHeader>
          <CardContent>
            {!availability || availability.slots.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                {availability?.reason ??
                  "No available slots for this date. Try another day."}
              </p>
            ) : (
              <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                {availability.slots.map((slot) => {
                  const isSelected =
                    selectedSlot?.startAt === slot.startAt &&
                    selectedSlot.endAt === slot.endAt;
                  return (
                    <Button
                      key={slot.startAt}
                      type="button"
                      size="sm"
                      variant={isSelected ? "default" : "outline"}
                      className={cn(
                        "h-9 text-xs",
                        isSelected && "bg-brand-blue hover:bg-brand-blue/90",
                      )}
                      onClick={() =>
                        setSelectedSlot({
                          startAt: slot.startAt,
                          endAt: slot.endAt,
                          label: slot.label,
                        })
                      }
                    >
                      {slot.label}
                    </Button>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
