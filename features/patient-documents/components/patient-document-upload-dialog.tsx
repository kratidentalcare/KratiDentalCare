"use client";

import { useEffect, useTransition } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2Icon } from "lucide-react";
import { toast } from "sonner";
import { z } from "zod";

import {
  PATIENT_DOCUMENT_TYPE_LABELS,
  PATIENT_DOCUMENT_TYPE_VALUES,
  PATIENT_DOCUMENT_TYPES,
} from "@/constants/patient-documents";
import { uploadPatientDocumentAction } from "@/features/patient-documents/actions";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { patientDocumentUploadFormSchema } from "@/validators/patient-document";

type FormInput = z.input<typeof patientDocumentUploadFormSchema>;
type FormOutput = z.output<typeof patientDocumentUploadFormSchema>;

type PatientDocumentUploadDialogProps = {
  patientId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onComplete?: () => void;
  /** Override success toast (e.g. prescription shortcut). */
  successMessage?: string;
};

export function PatientDocumentUploadDialog({
  patientId,
  open,
  onOpenChange,
  onComplete,
  successMessage = "Document uploaded successfully",
}: PatientDocumentUploadDialogProps) {
  const [isPending, startTransition] = useTransition();

  const form = useForm<FormInput, unknown, FormOutput>({
    resolver: zodResolver(patientDocumentUploadFormSchema),
    defaultValues: {
      name: "",
      type: PATIENT_DOCUMENT_TYPES.X_RAY,
      description: "",
      file: undefined,
    },
  });

  useEffect(() => {
    if (open) {
      form.reset({
        name: "",
        type: PATIENT_DOCUMENT_TYPES.X_RAY,
        description: "",
        file: undefined,
      });
    }
  }, [open, form]);

  const onSubmit = form.handleSubmit((values) => {
    startTransition(async () => {
      const formData = new FormData();
      formData.set("patientId", patientId);
      formData.set("name", values.name);
      formData.set("type", values.type);
      if (values.description) {
        formData.set("description", values.description);
      }
      formData.set("file", values.file);

      const result = await uploadPatientDocumentAction(formData);
      if (!result.success) {
        toast.error(result.error.message);
        return;
      }

      toast.success(successMessage);
      onOpenChange(false);
      onComplete?.();
    });
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Upload Document</DialogTitle>
          <DialogDescription>
            Add an X-ray, scan, lab report, or other medical file to this
            patient&apos;s permanent records.
          </DialogDescription>
        </DialogHeader>

        <form className="space-y-4" onSubmit={onSubmit}>
          <FormField
            id="doc-name"
            label="Document name"
            required
            error={form.formState.errors.name?.message}
          >
            <Input
              {...form.register("name")}
              placeholder="e.g. OPG X-Ray"
              disabled={isPending}
            />
          </FormField>

          <FormField
            id="doc-type"
            label="Document type"
            required
            error={form.formState.errors.type?.message}
          >
            <Controller
              control={form.control}
              name="type"
              render={({ field }) => (
                <Select
                  value={field.value}
                  onValueChange={(value) => {
                    if (value) {
                      field.onChange(value);
                    }
                  }}
                  disabled={isPending}
                >
                  <SelectTrigger id="doc-type" className="w-full">
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    {PATIENT_DOCUMENT_TYPE_VALUES.map((value) => (
                      <SelectItem key={value} value={value}>
                        {PATIENT_DOCUMENT_TYPE_LABELS[value]}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
          </FormField>

          <FormField
            id="doc-description"
            label="Description"
            error={form.formState.errors.description?.message}
          >
            <Textarea
              {...form.register("description")}
              placeholder="Optional notes"
              rows={3}
              disabled={isPending}
            />
          </FormField>

          <FormField
            id="doc-file"
            label="File"
            required
            error={form.formState.errors.file?.message as string | undefined}
          >
            <Input
              id="doc-file"
              type="file"
              accept=".jpg,.jpeg,.png,.webp,.pdf,image/jpeg,image/png,image/webp,application/pdf"
              disabled={isPending}
              onChange={(event) => {
                const file = event.target.files?.[0];
                form.setValue("file", file as File, {
                  shouldValidate: true,
                });
              }}
            />
            <p className="mt-1 text-xs text-muted-foreground">
              JPG, PNG, WEBP, or PDF — up to 15 MB
            </p>
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
                  Uploading…
                </>
              ) : (
                "Upload"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
