import { z } from "zod";

import { GENDER_VALUES } from "@/constants/patient";
import { PRESCRIPTION_STATUSES } from "@/constants/statuses";
import {
  nonEmptyStringSchema,
  objectIdSchema,
  phoneSchema,
  prescriptionStatusSchema,
} from "@/validators/common";

/**
 * Zod contracts for Prescription fields (persistence boundary).
 * Clinical status transitions remain in services later.
 */

export const prescriptionMedicationSchema = z.object({
  name: nonEmptyStringSchema.max(200),
  dosage: nonEmptyStringSchema.max(200),
  frequency: nonEmptyStringSchema.max(200),
  duration: nonEmptyStringSchema.max(200),
  route: z.string().trim().max(200).nullable().optional(),
  instructions: z.string().trim().max(200).nullable().optional(),
  quantity: z.string().trim().max(200).nullable().optional(),
});

export const prescriptionPatientSnapshotSchema = z.object({
  fullName: nonEmptyStringSchema.max(120),
  phone: phoneSchema,
  ageYears: z.number().int().min(0).max(150).nullable().optional(),
  gender: z.enum(GENDER_VALUES).nullable().optional(),
});

export const prescriptionDoctorSnapshotSchema = z.object({
  fullName: nonEmptyStringSchema.max(120),
  qualification: z.string().trim().max(200).nullable().optional(),
});

export const prescriptionNumberSchema = nonEmptyStringSchema
  .max(40)
  .regex(/^[A-Z0-9][A-Z0-9-_]*$/i, "prescriptionNumber must be alphanumeric")
  .transform((value) => value.toUpperCase());

const optionalText = (max: number) =>
  z
    .string()
    .trim()
    .max(max)
    .nullable()
    .optional()
    .transform((value) => (value == null || value === "" ? null : value));

/** Medicine row as edited in the clinical form (maps to medications[].name). */
export const prescriptionFormMedicineSchema = z.object({
  medicineName: nonEmptyStringSchema.max(200),
  dosage: nonEmptyStringSchema.max(200),
  frequency: nonEmptyStringSchema.max(200),
  duration: nonEmptyStringSchema.max(200),
  instructions: z
    .string()
    .trim()
    .max(200)
    .optional()
    .transform((value) => (value == null || value === "" ? null : value)),
});

/**
 * Doctor-facing create/update form payload.
 * Patient/doctor/date fields are auto-filled server-side from the appointment.
 */
export const prescriptionFormSchema = z.object({
  appointmentId: objectIdSchema,
  chiefComplaint: optionalText(1000),
  diagnosis: nonEmptyStringSchema.max(1000),
  clinicalNotes: optionalText(5000),
  advice: optionalText(5000),
  followUpDate: z
    .union([
      z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Invalid follow-up date"),
      z.literal(""),
      z.null(),
    ])
    .optional()
    .transform((value) => (value == null || value === "" ? null : value)),
  medications: z
    .array(prescriptionFormMedicineSchema)
    .min(1, "Add at least one medicine")
    .max(50),
});

export const createPrescriptionSchema = z
  .object({
    prescriptionNumber: prescriptionNumberSchema,
    patientId: objectIdSchema,
    doctorId: objectIdSchema,
    appointmentId: objectIdSchema.nullable().optional(),
    status: prescriptionStatusSchema.default(PRESCRIPTION_STATUSES.DRAFT),
    diagnosis: z.string().trim().max(1000).nullable().optional(),
    chiefComplaint: z.string().trim().max(1000).nullable().optional(),
    clinicalNotes: z.string().trim().max(5000).nullable().optional(),
    advice: z.string().trim().max(5000).nullable().optional(),
    followUpDate: z.coerce.date().nullable().optional(),
    medications: z.array(prescriptionMedicationSchema).max(50).optional(),
    issuedAt: z.coerce.date().nullable().optional(),
    validUntil: z.coerce.date().nullable().optional(),
    pdfUrl: z.string().trim().url().max(2048).nullable().optional(),
    pdfPublicId: z.string().trim().max(512).nullable().optional(),
    patientSnapshot: prescriptionPatientSnapshotSchema,
    doctorSnapshot: prescriptionDoctorSnapshotSchema,
    createdByUserId: objectIdSchema,
    voidReason: z.string().trim().max(1000).nullable().optional(),
    voidedAt: z.coerce.date().nullable().optional(),
    voidedByUserId: objectIdSchema.nullable().optional(),
    supersedesPrescriptionId: objectIdSchema.nullable().optional(),
  })
  .superRefine((value, ctx) => {
    const isPatientVisible =
      value.status === PRESCRIPTION_STATUSES.ISSUED ||
      value.status === PRESCRIPTION_STATUSES.AMENDED;

    if (isPatientVisible) {
      if (value.diagnosis == null || value.diagnosis.trim() === "") {
        ctx.addIssue({
          code: "custom",
          message: "diagnosis is required when ISSUED or AMENDED",
          path: ["diagnosis"],
        });
      }
      if (!value.medications || value.medications.length < 1) {
        ctx.addIssue({
          code: "custom",
          message: "at least one medication is required when ISSUED or AMENDED",
          path: ["medications"],
        });
      }
      if (value.issuedAt == null) {
        ctx.addIssue({
          code: "custom",
          message: "issuedAt is required when ISSUED or AMENDED",
          path: ["issuedAt"],
        });
      }
    }

    if (
      value.issuedAt &&
      value.validUntil &&
      value.validUntil.getTime() < value.issuedAt.getTime()
    ) {
      ctx.addIssue({
        code: "custom",
        message: "validUntil cannot be before issuedAt",
        path: ["validUntil"],
      });
    }

    if (value.status === PRESCRIPTION_STATUSES.VOID) {
      if (value.voidReason == null || value.voidReason.trim() === "") {
        ctx.addIssue({
          code: "custom",
          message: "voidReason is required when VOID",
          path: ["voidReason"],
        });
      }
      if (value.voidedAt == null) {
        ctx.addIssue({
          code: "custom",
          message: "voidedAt is required when VOID",
          path: ["voidedAt"],
        });
      }
      if (value.voidedByUserId == null) {
        ctx.addIssue({
          code: "custom",
          message: "voidedByUserId is required when VOID",
          path: ["voidedByUserId"],
        });
      }
    }

    if (
      value.status === PRESCRIPTION_STATUSES.AMENDED &&
      value.supersedesPrescriptionId == null
    ) {
      ctx.addIssue({
        code: "custom",
        message: "supersedesPrescriptionId is required when AMENDED",
        path: ["supersedesPrescriptionId"],
      });
    }
  });

export const updatePrescriptionSchema = z
  .object({
    status: prescriptionStatusSchema.optional(),
    diagnosis: z.string().trim().max(1000).nullable().optional(),
    chiefComplaint: z.string().trim().max(1000).nullable().optional(),
    clinicalNotes: z.string().trim().max(5000).nullable().optional(),
    advice: z.string().trim().max(5000).nullable().optional(),
    followUpDate: z.coerce.date().nullable().optional(),
    medications: z.array(prescriptionMedicationSchema).max(50).optional(),
    issuedAt: z.coerce.date().nullable().optional(),
    validUntil: z.coerce.date().nullable().optional(),
    pdfUrl: z.string().trim().url().max(2048).nullable().optional(),
    pdfPublicId: z.string().trim().max(512).nullable().optional(),
    patientSnapshot: prescriptionPatientSnapshotSchema.optional(),
    doctorSnapshot: prescriptionDoctorSnapshotSchema.optional(),
    voidReason: z.string().trim().max(1000).nullable().optional(),
    voidedAt: z.coerce.date().nullable().optional(),
    voidedByUserId: objectIdSchema.nullable().optional(),
    supersedesPrescriptionId: objectIdSchema.nullable().optional(),
    appointmentId: objectIdSchema.nullable().optional(),
  })
  .strict();

export const prescriptionListQuerySchema = z.object({
  page: z.coerce.number().int().min(1).optional(),
  limit: z.coerce.number().int().min(1).max(100).optional(),
  search: z.string().trim().max(120).optional(),
  patientId: objectIdSchema.optional(),
  appointmentId: objectIdSchema.optional(),
  status: prescriptionStatusSchema.optional(),
});

export const prescriptionIdParamSchema = z.object({
  id: objectIdSchema,
});

export type CreatePrescriptionInput = z.infer<typeof createPrescriptionSchema>;
export type UpdatePrescriptionInput = z.infer<typeof updatePrescriptionSchema>;
export type PrescriptionMedicationInput = z.infer<
  typeof prescriptionMedicationSchema
>;
export type PrescriptionFormInput = z.infer<typeof prescriptionFormSchema>;
export type PrescriptionFormMedicineInput = z.infer<
  typeof prescriptionFormMedicineSchema
>;
export type PrescriptionListQuery = z.infer<typeof prescriptionListQuerySchema>;
