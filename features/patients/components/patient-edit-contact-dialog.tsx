"use client";

import { useEffect, useTransition } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2Icon } from "lucide-react";
import { toast } from "sonner";

import { updatePatientContactAction } from "@/features/patients/actions";
import type { PatientListItem, PatientProfile } from "@/features/patients/types";
import { FormField } from "@/components/shared";
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
import { z } from "zod";

import { updatePatientContactSchema } from "@/validators/patient";

type PatientContactFormInput = z.input<typeof updatePatientContactSchema>;
type PatientContactFormOutput = z.output<typeof updatePatientContactSchema>;

type PatientEditContactDialogProps = {
  patient: Pick<
    PatientListItem | PatientProfile,
    "id" | "fullName" | "phone" | "email"
  > | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onComplete: () => void;
};

export function PatientEditContactDialog({
  patient,
  open,
  onOpenChange,
  onComplete,
}: PatientEditContactDialogProps) {
  const [isPending, startTransition] = useTransition();

  const form = useForm<
    PatientContactFormInput,
    unknown,
    PatientContactFormOutput
  >({
    resolver: zodResolver(updatePatientContactSchema),
    defaultValues: {
      fullName: "",
      phone: "",
      email: "",
    },
  });

  useEffect(() => {
    if (patient && open) {
      form.reset({
        fullName: patient.fullName,
        phone: patient.phone,
        email: patient.email ?? "",
      });
    }
  }, [patient, open, form]);

  const onSubmit = form.handleSubmit((values) => {
    if (!patient) return;

    startTransition(async () => {
      const result = await updatePatientContactAction({
        id: patient.id,
        data: values,
      });

      if (!result.success) {
        toast.error(result.error.message);
        return;
      }

      toast.success("Patient contact updated");
      onOpenChange(false);
      onComplete();
    });
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Edit contact information</DialogTitle>
          <DialogDescription>
            Update the patient&apos;s current name, phone, and email. Historical
            appointment snapshots are not changed.
          </DialogDescription>
        </DialogHeader>

        <form className="space-y-4" onSubmit={onSubmit}>
          <FormField
            id="patient-fullName"
            label="Full name"
            required
            error={form.formState.errors.fullName?.message}
          >
            <Input
              {...form.register("fullName")}
              autoComplete="name"
              disabled={isPending}
            />
          </FormField>

          <FormField
            id="patient-phone"
            label="Phone number"
            required
            error={form.formState.errors.phone?.message}
          >
            <Input
              {...form.register("phone")}
              autoComplete="tel"
              inputMode="tel"
              disabled={isPending}
            />
          </FormField>

          <FormField
            id="patient-email"
            label="Email"
            error={form.formState.errors.email?.message}
          >
            <Input
              type="email"
              autoComplete="email"
              disabled={isPending}
              {...form.register("email")}
            />
          </FormField>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              disabled={isPending}
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isPending}>
              {isPending ? (
                <>
                  <Loader2Icon className="size-4 animate-spin" />
                  Saving…
                </>
              ) : (
                "Save changes"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
