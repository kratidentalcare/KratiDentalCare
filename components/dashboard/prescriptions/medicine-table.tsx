"use client";

import { PlusIcon } from "lucide-react";
import {
  useFieldArray,
  type Control,
  type FieldErrors,
  type UseFormRegister,
  type UseFormSetValue,
  type UseFormWatch,
} from "react-hook-form";

import { MedicineRow } from "@/components/dashboard/prescriptions/medicine-row";
import { Button } from "@/components/ui/button";
import type { PrescriptionFormInput } from "@/validators/prescription";

type MedicineTableProps = {
  control: Control<PrescriptionFormInput>;
  register: UseFormRegister<PrescriptionFormInput>;
  setValue: UseFormSetValue<PrescriptionFormInput>;
  watch: UseFormWatch<PrescriptionFormInput>;
  errors?: FieldErrors<PrescriptionFormInput>["medications"];
};

const EMPTY_MEDICINE = {
  medicineId: null,
  medicineName: "",
  genericName: null,
  dosage: "",
  frequency: "",
  duration: "",
  instructions: "",
};

export function MedicineTable({
  control,
  register,
  setValue,
  watch,
  errors,
}: MedicineTableProps) {
  const { fields, append, remove } = useFieldArray({
    control,
    name: "medications",
  });

  const rootMessage =
    errors &&
    typeof errors === "object" &&
    "message" in errors &&
    typeof errors.message === "string"
      ? errors.message
      : null;

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between gap-2">
        <div>
          <p className="text-sm font-medium text-brand-dark">Medicines</p>
          <p className="text-xs text-muted-foreground">
            Add each prescribed medicine with dosage and instructions.
          </p>
        </div>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => append({ ...EMPTY_MEDICINE })}
        >
          <PlusIcon className="size-4" />
          Add medicine
        </Button>
      </div>

      {rootMessage ? (
        <p className="text-xs text-destructive">{rootMessage}</p>
      ) : null}

      <div className="space-y-3">
        {fields.map((field, index) => (
          <MedicineRow
            key={field.id}
            index={index}
            field={field}
            register={register}
            setValue={setValue}
            watch={watch}
            canRemove={fields.length > 1}
            onRemove={() => remove(index)}
            errors={Array.isArray(errors) ? errors[index] : undefined}
          />
        ))}
      </div>
    </div>
  );
}
