"use client";

import { useEffect, useState, useTransition } from "react";
import { Loader2Icon } from "lucide-react";
import { toast } from "sonner";

import {
  createStaffBookingAction,
  getPatientActiveBookingHoldAction,
  listBookableDoctorsAction,
} from "@/features/appointments/actions";
import { listPatientsAction } from "@/features/patients/actions";
import { previewAvailableSlotsAction } from "@/features/scheduling/actions";
import { DatePickerField } from "@/features/scheduling/components/date-picker-field";
import { dateToCivilString } from "@/features/scheduling/lib/civil-date";
import type { DoctorOption } from "@/features/appointments/types";
import type { PatientListItem } from "@/features/patients/types";
import type { AvailabilityResult } from "@/features/scheduling/types";
import { STAFF_ACTIVE_BOOKING_CONFIRMATION_MESSAGE } from "@/constants/appointments";
import { ERROR_CODES } from "@/constants/error-codes";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";

export type StaffBookingPatientOption = Pick<
  PatientListItem,
  "id" | "fullName" | "phone" | "email"
>;

type StaffBookingDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onComplete: () => void;
  initialPatient?: StaffBookingPatientOption | null;
};

export function StaffBookingDialog({
  open,
  onOpenChange,
  onComplete,
  initialPatient = null,
}: StaffBookingDialogProps) {
  const [search, setSearch] = useState("");
  const [selectedPatient, setSelectedPatient] =
    useState<StaffBookingPatientOption | null>(initialPatient);
  const [patients, setPatients] = useState<StaffBookingPatientOption[]>(
    initialPatient ? [initialPatient] : [],
  );
  const [doctors, setDoctors] = useState<DoctorOption[]>([]);
  const [doctorId, setDoctorId] = useState("");
  const [date, setDate] = useState(() => dateToCivilString(new Date()));
  const [availability, setAvailability] = useState<AvailabilityResult | null>(
    null,
  );
  const [selectedSlot, setSelectedSlot] = useState<{
    startAt: string;
    endAt: string;
  } | null>(null);
  const [reason, setReason] = useState("");
  const [notes, setNotes] = useState("");
  const [hasBlockingAppointment, setHasBlockingAppointment] = useState(false);
  const [confirmOverride, setConfirmOverride] = useState(false);
  const [isSearching, startSearch] = useTransition();
  const [isLoadingSlots, startLoadSlots] = useTransition();
  const [isPending, startSubmit] = useTransition();

  useEffect(() => {
    let cancelled = false;
    startSearch(async () => {
      const result = await listBookableDoctorsAction();
      if (cancelled) {
        return;
      }
      if (result.success) {
        setDoctors(result.data);
        setDoctorId((current) => current || result.data[0]?.id || "");
      } else {
        toast.error(result.error.message);
      }
    });
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (!selectedPatient) {
      return;
    }
    let cancelled = false;
    startSearch(async () => {
      const result = await getPatientActiveBookingHoldAction({
        patientId: selectedPatient.id,
      });
      if (cancelled || !result.success) {
        return;
      }
      setHasBlockingAppointment(result.data.hasBlockingAppointment);
      if (!result.data.hasBlockingAppointment) {
        setConfirmOverride(false);
      }
    });
    return () => {
      cancelled = true;
    };
  }, [selectedPatient]);

  useEffect(() => {
    if (!doctorId || !date) {
      return;
    }

    startLoadSlots(async () => {
      const result = await previewAvailableSlotsAction({
        date,
        doctorId,
      });
      if (result.success) {
        setAvailability(result.data);
        setSelectedSlot(null);
      } else {
        setAvailability(null);
        toast.error(result.error.message);
      }
    });
  }, [doctorId, date]);

  const runPatientSearch = () => {
    const term = search.trim();
    if (!term) {
      return;
    }
    startSearch(async () => {
      const result = await listPatientsAction({
        search: term,
        page: 1,
        limit: 8,
      });
      if (result.success) {
        setPatients(result.data.items);
      } else {
        toast.error(result.error.message);
      }
    });
  };

  const submit = (withOverride: boolean) => {
    if (!selectedPatient || !selectedSlot || !doctorId) {
      return;
    }

    startSubmit(async () => {
      const result = await createStaffBookingAction({
        patientId: selectedPatient.id,
        doctorId,
        date,
        startAt: selectedSlot.startAt,
        endAt: selectedSlot.endAt,
        reason: reason.trim(),
        notes: notes.trim() || undefined,
        confirmMultipleActiveAppointments: withOverride,
      });

      if (result.success) {
        toast.success("Appointment created");
        onOpenChange(false);
        onComplete();
        return;
      }

      if (result.error.code === ERROR_CODES.ACTIVE_BOOKING_CONFIRMATION_REQUIRED) {
        setHasBlockingAppointment(true);
        toast.error(result.error.message);
        return;
      }

      toast.error(result.error.message);
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Book for patient</DialogTitle>
          <DialogDescription>
            Create an appointment for an existing patient using live clinic
            availability.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {initialPatient ? (
            <p className="text-sm">
              <span className="text-muted-foreground">Patient</span>
              <span className="mt-0.5 block font-medium">
                {initialPatient.fullName} · {initialPatient.phone}
              </span>
            </p>
          ) : (
            <div className="space-y-2">
              <Label htmlFor="staff-patient-search">Patient</Label>
              <div className="flex gap-2">
                <Input
                  id="staff-patient-search"
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  placeholder="Search name, phone, or email"
                  onKeyDown={(event) => {
                    if (event.key === "Enter") {
                      event.preventDefault();
                      runPatientSearch();
                    }
                  }}
                />
                <Button
                  type="button"
                  variant="outline"
                  onClick={runPatientSearch}
                  disabled={isSearching}
                >
                  Search
                </Button>
              </div>
              {patients.length > 0 ? (
                <div className="max-h-40 space-y-1 overflow-y-auto rounded-lg border p-2">
                  {patients.map((patient) => (
                    <button
                      key={patient.id}
                      type="button"
                      className={cn(
                        "w-full rounded-md px-2 py-1.5 text-left text-sm hover:bg-muted",
                        selectedPatient?.id === patient.id && "bg-muted",
                      )}
                      onClick={() => setSelectedPatient(patient)}
                    >
                      <span className="font-medium">{patient.fullName}</span>
                      <span className="mt-0.5 block text-xs text-muted-foreground">
                        {patient.phone}
                        {patient.email ? ` · ${patient.email}` : ""}
                      </span>
                    </button>
                  ))}
                </div>
              ) : null}
            </div>
          )}

          <div className="space-y-2">
            <Label>Doctor</Label>
            <Select value={doctorId} onValueChange={(value) => {
              if (value) setDoctorId(value);
            }}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select doctor" />
              </SelectTrigger>
              <SelectContent>
                {doctors.map((doctor) => (
                  <SelectItem key={doctor.id} value={doctor.id}>
                    {doctor.fullName}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <DatePickerField value={date} onChange={setDate} disablePast />

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

          <div className="space-y-2">
            <Label htmlFor="staff-booking-reason">Reason</Label>
            <Textarea
              id="staff-booking-reason"
              value={reason}
              onChange={(event) => setReason(event.target.value)}
              rows={2}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="staff-booking-notes">Notes (optional)</Label>
            <Textarea
              id="staff-booking-notes"
              value={notes}
              onChange={(event) => setNotes(event.target.value)}
              rows={2}
            />
          </div>

          {hasBlockingAppointment ? (
            <label className="flex items-start gap-2 rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm">
              <input
                type="checkbox"
                className="mt-1"
                checked={confirmOverride}
                onChange={(event) => setConfirmOverride(event.target.checked)}
              />
              <span>{STAFF_ACTIVE_BOOKING_CONFIRMATION_MESSAGE}</span>
            </label>
          ) : null}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button
            disabled={
              isPending ||
              !selectedPatient ||
              !selectedSlot ||
              reason.trim().length < 1 ||
              (hasBlockingAppointment && !confirmOverride)
            }
            onClick={() => submit(hasBlockingAppointment && confirmOverride)}
          >
            {isPending ? (
              <Loader2Icon className="size-4 animate-spin" />
            ) : (
              "Create appointment"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
