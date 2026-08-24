"use client";

import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { FileUpIcon, Loader2Icon, SaveIcon } from "lucide-react";
import { useForm, useWatch } from "react-hook-form";
import { toast } from "sonner";

import { MedicineTable } from "@/components/dashboard/prescriptions/medicine-table";
import { PrescriptionPreview } from "@/components/dashboard/prescriptions/prescription-preview";
import { PrintButton } from "@/components/dashboard/prescriptions/print-button";
import { PatientDocumentUploadDialog } from "@/features/patient-documents/components/patient-document-upload-dialog";
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
import { GENDERS } from "@/constants/patient";
import { ROUTES } from "@/constants/routes";
import { savePrescriptionAction } from "@/features/prescriptions/actions";
import {
  formatAgeSexLabel,
  formatCivilDateLabel,
  formatPhoneLabel,
  shortOpdLabel,
} from "@/features/prescriptions/lib/format";
import { EMPTY_MEDICAL_HISTORY } from "@/features/prescriptions/lib/medical-history";
import { toPreviewData } from "@/features/prescriptions/lib/paginate-sheets";
import type {
  PrescriptionDetail,
  PrescriptionMedicalHistoryDto,
  PrescriptionWorkspaceContext,
} from "@/features/prescriptions/types";
import { DatePickerField } from "@/features/scheduling/components/date-picker-field";
import { cn } from "@/lib/utils";
import {
  prescriptionFormSchema,
  type PrescriptionFormInput,
} from "@/validators/prescription";

type PrescriptionFormProps = {
  context: PrescriptionWorkspaceContext;
};

function medicalHistoryDefaults(
  history: PrescriptionMedicalHistoryDto | undefined,
): NonNullable<PrescriptionFormInput["medicalHistory"]> {
  if (!history) {
    return { ...EMPTY_MEDICAL_HISTORY };
  }
  return {
    takingMedication: history.takingMedication,
    currentMedication: history.currentMedication,
    pregnant: history.pregnant,
    dueDate: history.dueDate,
    nursing: history.nursing,
    panMasala: history.panMasala,
    tobacco: history.tobacco,
    smoking: history.smoking,
    cigarettesPerDay: history.cigarettesPerDay,
    hasAllergy: history.hasAllergy,
    allergyName: history.allergyName,
  };
}

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
      medicalHistory: medicalHistoryDefaults(rx.medicalHistory),
      followUpDate: rx.followUpDate,
      medications:
        rx.medications.length > 0
          ? rx.medications.map((med) => ({
              medicineId: med.medicineId ?? null,
              medicineName: med.medicineName,
              genericName: med.genericName ?? null,
              dosage: med.dosage,
              frequency: med.frequency,
              duration: med.duration,
              instructions: med.instructions ?? "",
            }))
          : [
              {
                medicineId: null,
                medicineName: "",
                genericName: null,
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
    medicalHistory: { ...EMPTY_MEDICAL_HISTORY },
    followUpDate: null,
    medications: [
      {
        medicineId: null,
        medicineName: "",
        genericName: null,
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
      patientId: rx.patientId,
      patientName: rx.patientName,
      patientGender: rx.patientGender,
      mobileLabel: formatPhoneLabel(rx.patientPhone),
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
    patientId: context.patientId,
    patientName: context.patientName,
    patientGender: context.patientGender,
    mobileLabel: formatPhoneLabel(context.patientPhone),
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
  const [documentUploadOpen, setDocumentUploadOpen] = useState(false);
  const meta = readOnlyMeta(context);
  const isFemale = meta.patientGender === GENDERS.FEMALE;

  const form = useForm<PrescriptionFormInput>({
    resolver: zodResolver(prescriptionFormSchema),
    defaultValues: contextDefaults(context),
  });

  const watched = useWatch({ control: form.control });
  const history = watched.medicalHistory;

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

    const medicalHistory: PrescriptionMedicalHistoryDto = {
      takingMedication: Boolean(history?.takingMedication),
      currentMedication: history?.currentMedication || null,
      pregnant: isFemale && Boolean(history?.pregnant),
      dueDate: history?.dueDate || null,
      nursing: isFemale && Boolean(history?.nursing),
      panMasala: Boolean(history?.panMasala),
      tobacco: Boolean(history?.tobacco),
      smoking: Boolean(history?.smoking),
      cigarettesPerDay: history?.cigarettesPerDay ?? null,
      hasAllergy: Boolean(history?.hasAllergy),
      allergyName: history?.allergyName || null,
    };

    return toPreviewData({
      patientName: meta.patientName,
      ageSexLabel: meta.ageSexLabel,
      dateLabel: meta.dateLabel,
      mobileLabel: meta.mobileLabel,
      opdLabel: meta.opdLabel,
      medicalHistory,
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
  }, [watched, meta, history, isFemale]);

  const setHistoryFlag = (
    field:
      | "takingMedication"
      | "pregnant"
      | "nursing"
      | "panMasala"
      | "tobacco"
      | "smoking"
      | "hasAllergy",
    value: boolean,
  ) => {
    form.setValue(`medicalHistory.${field}`, value, {
      shouldDirty: true,
      shouldValidate: true,
    });

    if (field === "takingMedication" && !value) {
      form.setValue("medicalHistory.currentMedication", null, {
        shouldDirty: true,
      });
    }
    if (field === "pregnant" && !value) {
      form.setValue("medicalHistory.dueDate", null, { shouldDirty: true });
    }
    if (field === "smoking" && !value) {
      form.setValue("medicalHistory.cigarettesPerDay", null, {
        shouldDirty: true,
      });
    }
    if (field === "hasAllergy" && !value) {
      form.setValue("medicalHistory.allergyName", null, { shouldDirty: true });
    }
  };

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

  const historyErrors = form.formState.errors.medicalHistory;

  return (
    <>
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
          <div className="flex flex-wrap gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setDocumentUploadOpen(true)}
            >
              <FileUpIcon className="size-4" />
              Add Patient Document
            </Button>
            {meta.prescriptionId ? (
              <PrintButton prescriptionId={meta.prescriptionId} />
            ) : null}
          </div>
        </CardHeader>
        <CardContent>
          <form onSubmit={onSubmit} className="space-y-6">
            <div className="grid gap-3 sm:grid-cols-2">
              <ReadOnlyField label="Patient" value={meta.patientName} />
              <ReadOnlyField label="Age / Gender" value={meta.ageSexLabel} />
              <ReadOnlyField label="Mobile no" value={meta.mobileLabel} />
              <ReadOnlyField label="Doctor" value={meta.doctorName} />
              <ReadOnlyField label="Date" value={meta.dateLabel} />
              <ReadOnlyField
                label="Appointment"
                value={meta.appointmentLabel}
                className="sm:col-span-2"
              />
            </div>

            <Accordion
              multiple
              defaultValue={["medical-history", "clinical", "medicines"]}
            >
              <AccordionItem value="medical-history">
                <AccordionTrigger>Medical history</AccordionTrigger>
                <AccordionContent className="space-y-4 pt-2">
                  <YesNoField
                    label="Have you taken / undergoing any medications?"
                    value={Boolean(history?.takingMedication)}
                    onChange={(value) =>
                      setHistoryFlag("takingMedication", value)
                    }
                  />
                  {history?.takingMedication ? (
                    <div className="space-y-1.5">
                      <Label htmlFor="currentMedication">
                        Current medication *
                      </Label>
                      <Textarea
                        id="currentMedication"
                        rows={2}
                        placeholder="e.g. Metformin 500 mg"
                        aria-invalid={Boolean(
                          historyErrors?.currentMedication,
                        )}
                        {...form.register("medicalHistory.currentMedication")}
                      />
                      {historyErrors?.currentMedication?.message ? (
                        <p className="text-xs text-destructive">
                          {historyErrors.currentMedication.message}
                        </p>
                      ) : null}
                    </div>
                  ) : null}

                  {isFemale ? (
                    <div className="space-y-4 rounded-lg border border-[#E5E7EB] p-3">
                      <p className="text-sm font-medium">For women</p>
                      <YesNoField
                        label="Pregnant?"
                        value={Boolean(history?.pregnant)}
                        onChange={(value) => setHistoryFlag("pregnant", value)}
                      />
                      {history?.pregnant ? (
                        <div className="space-y-1.5">
                          <Label htmlFor="dueDate">Due date *</Label>
                          <DatePickerField
                            id="dueDate"
                            value={history?.dueDate ?? ""}
                            onChange={(value) =>
                              form.setValue(
                                "medicalHistory.dueDate",
                                value || null,
                                { shouldDirty: true, shouldValidate: true },
                              )
                            }
                            placeholder="Select due date"
                          />
                          {historyErrors?.dueDate?.message ? (
                            <p className="text-xs text-destructive">
                              {historyErrors.dueDate.message}
                            </p>
                          ) : null}
                        </div>
                      ) : null}
                      <YesNoField
                        label="Nursing a child?"
                        value={Boolean(history?.nursing)}
                        onChange={(value) => setHistoryFlag("nursing", value)}
                      />
                    </div>
                  ) : null}

                  <div className="space-y-3">
                    <p className="text-sm font-medium">Habits</p>
                    <YesNoField
                      label="Pan Masala chewing"
                      value={Boolean(history?.panMasala)}
                      onChange={(value) => setHistoryFlag("panMasala", value)}
                    />
                    <YesNoField
                      label="Tobacco chewing"
                      value={Boolean(history?.tobacco)}
                      onChange={(value) => setHistoryFlag("tobacco", value)}
                    />
                    <YesNoField
                      label="Smoking"
                      value={Boolean(history?.smoking)}
                      onChange={(value) => setHistoryFlag("smoking", value)}
                    />
                    {history?.smoking ? (
                      <div className="space-y-1.5">
                        <Label htmlFor="cigarettesPerDay">
                          Cigarettes per day *
                        </Label>
                        <Input
                          id="cigarettesPerDay"
                          type="number"
                          min={1}
                          max={100}
                          inputMode="numeric"
                          placeholder="e.g. 5"
                          aria-invalid={Boolean(
                            historyErrors?.cigarettesPerDay,
                          )}
                          {...form.register(
                            "medicalHistory.cigarettesPerDay",
                            {
                              setValueAs: (value) =>
                                value === "" || value == null
                                  ? null
                                  : Number(value),
                            },
                          )}
                        />
                        {historyErrors?.cigarettesPerDay?.message ? (
                          <p className="text-xs text-destructive">
                            {historyErrors.cigarettesPerDay.message}
                          </p>
                        ) : null}
                      </div>
                    ) : null}
                  </div>

                  <YesNoField
                    label="Any allergy?"
                    value={Boolean(history?.hasAllergy)}
                    onChange={(value) => setHistoryFlag("hasAllergy", value)}
                  />
                  {history?.hasAllergy ? (
                    <div className="space-y-1.5">
                      <Label htmlFor="allergyName">Allergy name *</Label>
                      <Input
                        id="allergyName"
                        placeholder="e.g. Penicillin"
                        aria-invalid={Boolean(historyErrors?.allergyName)}
                        {...form.register("medicalHistory.allergyName")}
                      />
                      {historyErrors?.allergyName?.message ? (
                        <p className="text-xs text-destructive">
                          {historyErrors.allergyName.message}
                        </p>
                      ) : null}
                    </div>
                  ) : null}
                </AccordionContent>
              </AccordionItem>

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
                    setValue={form.setValue}
                    watch={form.watch}
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

      <PatientDocumentUploadDialog
        patientId={meta.patientId}
        open={documentUploadOpen}
        onOpenChange={setDocumentUploadOpen}
        successMessage="Document uploaded to patient's records."
      />
    </>
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

function YesNoField({
  label,
  value,
  onChange,
}: {
  label: string;
  value: boolean;
  onChange: (value: boolean) => void;
}) {
  return (
    <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
      <Label className="text-sm font-normal">{label}</Label>
      <div className="inline-flex rounded-lg border border-[#E5E7EB] p-0.5">
        <Button
          type="button"
          size="sm"
          variant={value ? "default" : "ghost"}
          className={cn("min-w-14", !value && "text-muted-foreground")}
          onClick={() => onChange(true)}
        >
          Yes
        </Button>
        <Button
          type="button"
          size="sm"
          variant={!value ? "default" : "ghost"}
          className={cn("min-w-14", value && "text-muted-foreground")}
          onClick={() => onChange(false)}
        >
          No
        </Button>
      </div>
    </div>
  );
}
