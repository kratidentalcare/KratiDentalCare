"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";

import { updateClinicAvailabilityAction } from "@/features/scheduling/actions";
import type { DoctorOption } from "@/features/appointments/services/list-doctors";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

type DefaultDoctorSettingsProps = {
  doctors: DoctorOption[];
  currentDoctorId: string | null;
};

export function DefaultDoctorSettings({
  doctors,
  currentDoctorId,
}: DefaultDoctorSettingsProps) {
  const [selectedId, setSelectedId] = useState(currentDoctorId ?? "");
  const [isPending, startTransition] = useTransition();

  const onSave = () => {
    startTransition(async () => {
      const result = await updateClinicAvailabilityAction({
        defaultDoctorId: selectedId || null,
      });
      if (result.success) {
        toast.success("Default doctor updated");
      } else {
        toast.error(result.error.message);
      }
    });
  };

  return (
    <Card className="border-0 shadow-none ring-1 ring-[#E5E7EB]">
      <CardHeader>
        <CardTitle className="text-base font-semibold">Public booking</CardTitle>
        <CardDescription>
          Patients booking online are assigned to this doctor automatically.
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-3 sm:flex-row sm:items-end">
        <div className="min-w-0 flex-1">
          <Select value={selectedId || "none"} onValueChange={(value) => setSelectedId(value === "none" ? "" : value)}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select default doctor" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="none">Not configured</SelectItem>
              {doctors.map((doctor) => (
                <SelectItem key={doctor.id} value={doctor.id}>
                  {doctor.fullName}
                  {doctor.specialties[0] ? ` · ${doctor.specialties[0]}` : ""}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <Button
          type="button"
          disabled={isPending || selectedId === (currentDoctorId ?? "")}
          onClick={onSave}
        >
          Save
        </Button>
      </CardContent>
    </Card>
  );
}
