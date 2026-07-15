import { z } from "zod";

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
});

export const prescriptionDoctorSnapshotSchema = z.object({
  fullName: nonEmptyStringSchema.max(120),
  qualification: z.string().trim().max(200).nullable().optional(),
});

export const prescriptionNumberSchema = nonEmptyStringSchema
  .max(40)
  .regex(/^[A-Z0-9][A-Z0-9-_]*$/i, "prescriptionNumber must be alphanumeric")
  .transform((value) => value.toUpperCase());

export const createPrescriptionSchema = z
  .object({
    prescriptionNumber: prescriptionNumberSchema,
    patientId: objectIdSchema,
    doctorId: objectIdSchema,
    appointmentId: objectIdSchema.nullable().optional(),
    status: prescriptionStatusSchema.default(PRESCRIPTION_STATUSES.DRAFT),
    diagnosis: z.string().trim().max(1000).nullable().optional(),
    advice: z.string().trim().max(5000).nullable().optional(),
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
      if (value.patientSnapshot.ageYears == null) {
        ctx.addIssue({
          code: "custom",
          message: "patientSnapshot.ageYears is required when ISSUED or AMENDED",
          path: ["patientSnapshot", "ageYears"],
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
    advice: z.string().trim().max(5000).nullable().optional(),
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

export type CreatePrescriptionInput = z.infer<typeof createPrescriptionSchema>;
export type UpdatePrescriptionInput = z.infer<typeof updatePrescriptionSchema>;
export type PrescriptionMedicationInput = z.infer<
  typeof prescriptionMedicationSchema
>;
