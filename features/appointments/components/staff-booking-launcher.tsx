"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { CalendarPlusIcon } from "lucide-react";

import {
  StaffBookingDialog,
  type StaffBookingPatientOption,
} from "@/features/appointments/components/staff-booking-dialog";
import { Button } from "@/components/ui/button";

type StaffBookingLauncherProps = {
  initialPatient?: StaffBookingPatientOption | null;
  variant?: "default" | "outline";
  size?: "default" | "sm";
};

export function StaffBookingLauncher({
  initialPatient = null,
  variant = "default",
  size = "default",
}: StaffBookingLauncherProps) {
  const router = useRouter();
  const [open, setOpen] = useState(false);

  return (
    <>
      <Button
        type="button"
        variant={variant}
        size={size}
        onClick={() => setOpen(true)}
      >
        <CalendarPlusIcon />
        Book for Patient
      </Button>
      {open ? (
        <StaffBookingDialog
          key={initialPatient?.id ?? "search"}
          open={open}
          onOpenChange={setOpen}
          initialPatient={initialPatient}
          onComplete={() => router.refresh()}
        />
      ) : null}
    </>
  );
}
