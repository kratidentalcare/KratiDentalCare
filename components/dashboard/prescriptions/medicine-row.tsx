"use client";

import { Trash2Icon } from "lucide-react";
import type {
  FieldArrayWithId,
  UseFormRegister,
  UseFormSetValue,
  UseFormWatch,
} from "react-hook-form";

import { MedicineSearchCombobox } from "@/components/dashboard/prescriptions/medicine-search-combobox";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { MedicineSearchHit } from "@/features/medicines/types";
import type { PrescriptionFormInput } from "@/validators/prescription";

type MedicineRowProps = {
  index: number;
  field: FieldArrayWithId<PrescriptionFormInput, "medications", "id">;
  register: UseFormRegister<PrescriptionFormInput>;
  setValue: UseFormSetValue<PrescriptionFormInput>;
  watch: UseFormWatch<PrescriptionFormInput>;
  onRemove: () => void;
  canRemove: boolean;
  errors?: {
    medicineName?: { message?: string };
    dosage?: { message?: string };
    frequency?: { message?: string };
    duration?: { message?: string };
    instructions?: { message?: string };
  };
};

export function MedicineRow({
  index,
  field,
  register,
  setValue,
  watch,
  onRemove,
  canRemove,
  errors,
}: MedicineRowProps) {
  const medicineName =
    watch(`medications.${index}.medicineName`) ?? "";

  function applyCatalog(hit: MedicineSearchHit) {
    setValue(`medications.${index}.medicineId`, hit.id, {
      shouldDirty: true,
      shouldValidate: true,
    });
    setValue(`medications.${index}.medicineName`, hit.name, {
      shouldDirty: true,
      shouldValidate: true,
    });
    setValue(`medications.${index}.genericName`, hit.genericName, {
      shouldDirty: true,
    });
    setValue(`medications.${index}.dosage`, hit.dosage, {
      shouldDirty: true,
      shouldValidate: true,
    });
    setValue(`medications.${index}.frequency`, hit.frequency, {
      shouldDirty: true,
      shouldValidate: true,
    });
    setValue(`medications.${index}.duration`, hit.duration, {
      shouldDirty: true,
      shouldValidate: true,
    });
    setValue(`medications.${index}.instructions`, hit.instructions ?? "", {
      shouldDirty: true,
    });
  }

  function useCustom() {
    setValue(`medications.${index}.medicineId`, null, { shouldDirty: true });
    setValue(`medications.${index}.genericName`, null, { shouldDirty: true });
  }

  return (
    <div
      key={field.id}
      className="grid gap-3 rounded-xl bg-[#F8FAFC] p-3 ring-1 ring-[#E5E7EB] sm:grid-cols-2 lg:grid-cols-6"
    >
      <div className="space-y-1.5 lg:col-span-2">
        <Label htmlFor={`med-name-${index}`}>Medicine</Label>
        <MedicineSearchCombobox
          id={`med-name-${index}`}
          value={medicineName}
          invalid={Boolean(errors?.medicineName)}
          onNameChange={(name) => {
            setValue(`medications.${index}.medicineName`, name, {
              shouldDirty: true,
              shouldValidate: true,
            });
            setValue(`medications.${index}.medicineId`, null, {
              shouldDirty: true,
            });
            setValue(`medications.${index}.genericName`, null, {
              shouldDirty: true,
            });
          }}
          onSelectCatalog={applyCatalog}
          onUseCustom={useCustom}
        />
        {errors?.medicineName?.message ? (
          <p className="text-xs text-destructive">{errors.medicineName.message}</p>
        ) : null}
      </div>
      <div className="space-y-1.5">
        <Label htmlFor={`med-dosage-${index}`}>Dosage</Label>
        <Input
          id={`med-dosage-${index}`}
          placeholder="500mg"
          aria-invalid={Boolean(errors?.dosage)}
          {...register(`medications.${index}.dosage`)}
        />
        {errors?.dosage?.message ? (
          <p className="text-xs text-destructive">{errors.dosage.message}</p>
        ) : null}
      </div>
      <div className="space-y-1.5">
        <Label htmlFor={`med-freq-${index}`}>Frequency</Label>
        <Input
          id={`med-freq-${index}`}
          placeholder="1-0-1"
          aria-invalid={Boolean(errors?.frequency)}
          {...register(`medications.${index}.frequency`)}
        />
        {errors?.frequency?.message ? (
          <p className="text-xs text-destructive">{errors.frequency.message}</p>
        ) : null}
      </div>
      <div className="space-y-1.5">
        <Label htmlFor={`med-duration-${index}`}>Duration</Label>
        <Input
          id={`med-duration-${index}`}
          placeholder="5 days"
          aria-invalid={Boolean(errors?.duration)}
          {...register(`medications.${index}.duration`)}
        />
        {errors?.duration?.message ? (
          <p className="text-xs text-destructive">{errors.duration.message}</p>
        ) : null}
      </div>
      <div className="flex items-end gap-2 sm:col-span-2 lg:col-span-1">
        <div className="min-w-0 flex-1 space-y-1.5">
          <Label htmlFor={`med-instructions-${index}`}>Instructions</Label>
          <Input
            id={`med-instructions-${index}`}
            placeholder="After food"
            {...register(`medications.${index}.instructions`)}
          />
        </div>
        <Button
          type="button"
          variant="ghost"
          size="icon-sm"
          disabled={!canRemove}
          onClick={onRemove}
          aria-label={`Remove medicine ${index + 1}`}
        >
          <Trash2Icon className="size-4" />
        </Button>
      </div>
    </div>
  );
}
