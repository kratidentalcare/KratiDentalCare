"use client";

import { useMemo, useTransition } from "react";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2Icon, SaveIcon } from "lucide-react";
import { useForm, useWatch } from "react-hook-form";
import { toast } from "sonner";

import { MedicineTable } from "@/components/dashboard/prescriptions/medicine-table";
import { PrescriptionPreview } from "@/components/dashboard/prescriptions/prescription-preview";
import { PrintButton } from "@/components/dashboard/prescriptions/print-button";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { ROUTES } from "@/constants/routes";
import { savePrescriptionAction } from "@/features/prescriptions/actions";
import {
  formatAgeSexLabel,
  formatCivilDateLabel,
  shortOpdLabel,
} from "@/features/prescriptions/lib/format";
import { toPreviewData } from "@/features/prescriptions/lib/paginate-sheets";
import type {
  PrescriptionDetail,
  PrescriptionWorkspaceContext,
} from "@/features/prescriptions/types";
import { DatePickerField } from "@/features/scheduling/components/date-picker-field";
import {
  prescriptionFormSchema,
  type PrescriptionFormInput,
} from "@/validators/prescription";

type PrescriptionFormProps = {
  context: PrescriptionWorkspaceContext;
};

function contextDefaults(
  context: PrescriptionWorkspaceContext,
): PrescriptionFormInput {
  if (context.mode === "edit") {
    const rx = context.prescription;
    return {
      appointmentId: rx.appointmentId ?? "",
      chiefComplaint: rx.chiefComplaint ?? "",
      diagnosis: rx.diagnosis ?? "",
      clinicalNotes: rx.clinicalNotes ?? "",
      advice: rx.advice ?? "",
      followUpDate: rx.followUpDate,
      medications:
        rx.medications.length > 0
          ? rx.medications.map((med) => ({
              medicineName: med.medicineName,
              dosage: med.dosage,
              frequency: med.frequency,
              duration: med.duration,
              instructions: med.instructions ?? "",
            }))
          : [
              {
                medicineName: "",
                dosage: "",
                frequency: "",
                duration: "",
                instructions: "",
              },
            ],
    };
  }

  return {
    appointmentId: context.appointmentId,
    chiefComplaint: "",
    diagnosis: "",
    clinicalNotes: "",
    advice: "",
    followUpDate: null,
    medications: [
      {
        medicineName: "",
        dosage: "",
        frequency: "",
        duration: "",
        instructions: "",
      },
    ],
  };
}

function readOnlyMeta(context: PrescriptionWorkspaceContext) {
  if (context.mode === "edit") {
    const rx = context.prescription;
    return {
      patientName: rx.patientName,
      ageSexLabel: formatAgeSexLabel(rx.patientAgeYears, rx.patientGender),
      doctorName: rx.doctorName,
      doctorQualification: rx.doctorQualification,
      dateLabel: rx.issuedDateLabel,
      appointmentLabel: rx.appointmentDate
        ? `${rx.appointmentDate}${rx.appointmentTimeLabel ? ` · ${rx.appointmentTimeLabel}` : ""}`
        : "—",
      opdLabel: shortOpdLabel(rx.appointmentId, rx.prescriptionNumber),
      prescriptionId: rx.id as string | null,
      prescriptionNumber: rx.prescriptionNumber as string | null,
    };
  }

  return {
    patientName: context.patientName,
    ageSexLabel: formatAgeSexLabel(
      context.patientAgeYears,
      context.patientGender,
    ),
    doctorName: context.doctorName,
    doctorQualification: context.doctorQualification,
    dateLabel: context.issuedDateLabel,
    appointmentLabel: `${context.appointmentDate} · ${context.appointmentTimeLabel}`,
    opdLabel: shortOpdLabel(context.appointmentId),
    prescriptionId: null as string | null,
    prescriptionNumber: null as string | null,
  };
}

export function PrescriptionForm({ context }: PrescriptionFormProps) {
  const router = useRouter();
  const [isSaving, startSave] = useTransition();
  const meta = readOnlyMeta(context);

  const form = useForm<PrescriptionFormInput>({
    resolver: zodResolver(prescriptionFormSchema),
    defaultValues: contextDefaults(context),
  });

  const watched = useWatch({ control: form.control });

  const previewData = useMemo(() => {
    const medications = (watched.medications ?? [])
      .filter((med) => med && (med.medicineName || med.dosage))
      .map((med) => ({
        medicineName: med.medicineName ?? "",
        dosage: med.dosage ?? "",
        frequency: med.frequency ?? "",
        duration: med.duration ?? "",
        instructions: med.instructions || null,
      }));

    return toPreviewData({
      patientName: meta.patientName,
      ageSexLabel: meta.ageSexLabel,
      dateLabel: meta.dateLabel,
      opdLabel: meta.opdLabel,
      diagnosis: watched.diagnosis ?? "",
      chiefComplaint: watched.chiefComplaint ?? "",
      clinicalNotes: watched.clinicalNotes ?? "",
      advice: watched.advice ?? "",
      followUpLabel: watched.followUpDate
        ? `Follow-up: ${formatCivilDateLabel(watched.followUpDate)}`
        : "",
      medications,
      doctorName: meta.doctorName,
      doctorQualification: meta.doctorQualification,
    });
  }, [watched, meta]);

  const onSubmit = form.handleSubmit((values) => {
    startSave(async () => {
      const result = await savePrescriptionAction(values);
      if (!result.success) {
        toast.error(result.error.message);
        return;
      }

      toast.success(
        context.mode === "create"
          ? "Prescription saved"
          : "Prescription updated",
      );

      const saved = result.data as PrescriptionDetail;
      router.replace(
        `${ROUTES.DASHBOARD.PRESCRIPTIONS}?appointmentId=${saved.appointmentId}`,
      );
      router.refresh();
    });
  });

  return (
    <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_minmax(320px,420px)]">
      <Card className="border-0 shadow-none ring-1 ring-[#E5E7EB]">
        <CardHeader className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <CardTitle className="text-lg">
              {context.mode === "create"
                ? "Create prescription"
                : "Edit prescription"}
            </CardTitle>
            <CardDescription>
              {context.mode === "edit" && meta.prescriptionNumber
                ? `Rx ${meta.prescriptionNumber}`
                : "Complete clinical details and review the live preview before saving."}
            </CardDescription>
          </div>
          {meta.prescriptionId ? (
            <PrintButton prescriptionId={meta.prescriptionId} />
          ) : null}
        </CardHeader>
        <CardContent>
          <form onSubmit={onSubmit} className="space-y-6">
            <div className="grid gap-3 sm:grid-cols-2">
              <ReadOnlyField label="Patient" value={meta.patientName} />
              <ReadOnlyField label="Age / Gender" value={meta.ageSexLabel} />
              <ReadOnlyField label="Doctor" value={meta.doctorName} />
              <ReadOnlyField label="Date" value={meta.dateLabel} />
              <ReadOnlyField
                label="Appointment"
                value={meta.appointmentLabel}
                className="sm:col-span-2"
              />
            </div>

            <Accordion multiple defaultValue={["clinical", "medicines"]}>
              <AccordionItem value="clinical">
                <AccordionTrigger>Clinical details</AccordionTrigger>
                <AccordionContent className="space-y-4 pt-2">
                  <div className="space-y-1.5">
                    <Label htmlFor="chiefComplaint">Chief complaint</Label>
                    <Textarea
                      id="chiefComplaint"
                      rows={2}
                      placeholder="Primary reason for visit"
                      {...form.register("chiefComplaint")}
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="diagnosis">Diagnosis *</Label>
                    <Textarea
                      id="diagnosis"
                      rows={2}
                      placeholder="Clinical diagnosis"
                      aria-invalid={Boolean(form.formState.errors.diagnosis)}
                      {...form.register("diagnosis")}
                    />
                    {form.formState.errors.diagnosis?.message ? (
                      <p className="text-xs text-destructive">
                        {form.formState.errors.diagnosis.message}
                      </p>
                    ) : null}
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="clinicalNotes">Clinical notes</Label>
                    <Textarea
                      id="clinicalNotes"
                      rows={3}
                      placeholder="Findings, observations"
                      {...form.register("clinicalNotes")}
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="advice">Advice</Label>
                    <Textarea
                      id="advice"
                      rows={3}
                      placeholder="Home care / precautions"
                      {...form.register("advice")}
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="followUpDate">Follow-up date</Label>
                    <DatePickerField
                      id="followUpDate"
                      value={form.watch("followUpDate") ?? ""}
                      onChange={(value) =>
                        form.setValue("followUpDate", value || null, {
                          shouldDirty: true,
                        })
                      }
                      placeholder="Optional follow-up"
                    />
                  </div>
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="medicines">
                <AccordionTrigger>Medicines</AccordionTrigger>
                <AccordionContent className="pt-2">
                  <MedicineTable
                    control={form.control}
                    register={form.register}
                    errors={form.formState.errors.medications}
                  />
                </AccordionContent>
              </AccordionItem>
            </Accordion>

            <input type="hidden" {...form.register("appointmentId")} />

            <div className="flex flex-wrap gap-2">
              <Button type="submit" disabled={isSaving}>
                {isSaving ? (
                  <Loader2Icon className="size-4 animate-spin" />
                ) : (
                  <SaveIcon className="size-4" />
                )}
                Save prescription
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      <Card className="border-0 shadow-none ring-1 ring-[#E5E7EB] xl:sticky xl:top-4 xl:self-start">
        <CardHeader>
          <CardTitle className="text-base">Live preview</CardTitle>
          <CardDescription>
            Exact A4 layout used for print and PDF.
          </CardDescription>
        </CardHeader>
        <CardContent className="overflow-x-auto">
          <PrescriptionPreview data={previewData} scale={0.55} />
        </CardContent>
      </Card>
    </div>
  );
}

function ReadOnlyField({
  label,
  value,
  className,
}: {
  label: string;
  value: string;
  className?: string;
}) {
  return (
    <div className={className}>
      <Label className="text-muted-foreground">{label}</Label>
      <Input value={value} readOnly className="mt-1.5 bg-[#F8FAFC]" />
    </div>
  );
}
