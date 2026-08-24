"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

import { FormField } from "@/components/shared/form-field";
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
import { Textarea } from "@/components/ui/textarea";
import type { MedicineListItem } from "@/features/medicines/types";
import { createMedicineActionSchema } from "@/validators/medicine";

type MedicineFormValues = z.infer<typeof createMedicineActionSchema>;

type MedicineFormDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  editing: MedicineListItem | null;
  pending: boolean;
  onSubmit: (values: MedicineFormValues) => Promise<void>;
};

const EMPTY_VALUES: MedicineFormValues = {
  name: "",
  genericName: null,
  dosage: "",
  frequency: "",
  duration: "",
  instructions: null,
  notes: null,
};

export function MedicineFormDialog({
  open,
  onOpenChange,
  editing,
  pending,
  onSubmit,
}: MedicineFormDialogProps) {
  const form = useForm<MedicineFormValues>({
    resolver: zodResolver(createMedicineActionSchema),
    defaultValues: EMPTY_VALUES,
  });

  useEffect(() => {
    if (!open) return;
    if (editing) {
      form.reset({
        name: editing.name,
        genericName: editing.genericName,
        dosage: editing.dosage,
        frequency: editing.frequency,
        duration: editing.duration,
        instructions: editing.instructions,
        notes: editing.notes,
      });
    } else {
      form.reset(EMPTY_VALUES);
    }
  }, [open, editing, form]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>
            {editing ? "Edit Medicine" : "Add Medicine"}
          </DialogTitle>
          <DialogDescription>
            {editing
              ? "Update catalog defaults. Existing prescriptions keep their original snapshot."
              : "Add a commonly used medicine and its default prescription instructions."}
          </DialogDescription>
        </DialogHeader>
        <form
          className="flex flex-col gap-4"
          onSubmit={form.handleSubmit(onSubmit)}
          noValidate
        >
          <FormField
            id="medicine-name"
            label="Medicine Name"
            error={form.formState.errors.name?.message}
            required
          >
            <Input
              className="h-10 rounded-xl"
              placeholder="Amoxicillin 500 mg"
              {...form.register("name")}
            />
          </FormField>

          <FormField
            id="medicine-generic"
            label="Generic Name"
            error={form.formState.errors.genericName?.message}
          >
            <Input
              className="h-10 rounded-xl"
              placeholder="Amoxicillin"
              {...form.register("genericName")}
            />
          </FormField>

          <div className="grid gap-4 sm:grid-cols-3">
            <FormField
              id="medicine-dosage"
              label="Dosage"
              error={form.formState.errors.dosage?.message}
              required
            >
              <Input
                className="h-10 rounded-xl"
                placeholder="1 Capsule"
                {...form.register("dosage")}
              />
            </FormField>
            <FormField
              id="medicine-frequency"
              label="Frequency"
              error={form.formState.errors.frequency?.message}
              required
            >
              <Input
                className="h-10 rounded-xl"
                placeholder="1-0-1"
                {...form.register("frequency")}
              />
            </FormField>
            <FormField
              id="medicine-duration"
              label="Duration"
              error={form.formState.errors.duration?.message}
              required
            >
              <Input
                className="h-10 rounded-xl"
                placeholder="5 Days"
                {...form.register("duration")}
              />
            </FormField>
          </div>

          <FormField
            id="medicine-instructions"
            label="Instructions"
            error={form.formState.errors.instructions?.message}
          >
            <Input
              className="h-10 rounded-xl"
              placeholder="After food"
              {...form.register("instructions")}
            />
          </FormField>

          <FormField
            id="medicine-notes"
            label="Notes"
            error={form.formState.errors.notes?.message}
          >
            <Textarea
              className="min-h-20 rounded-xl"
              placeholder="Internal catalog notes (not copied to prescriptions)"
              {...form.register("notes")}
            />
          </FormField>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              className="rounded-xl"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="rounded-xl bg-brand-blue hover:bg-brand-blue/90"
              disabled={pending}
            >
              {pending
                ? "Saving…"
                : editing
                  ? "Update Medicine"
                  : "Add Medicine"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
