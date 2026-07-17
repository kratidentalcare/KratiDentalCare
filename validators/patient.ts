import { z } from "zod";

import {
  BLOOD_GROUP_VALUES,
  DEFAULT_ADDRESS_COUNTRY,
  EMERGENCY_CONTACT_RELATIONSHIP_VALUES,
  GENDER_VALUES,
} from "@/constants/patient";
import { PATIENT_STATUSES } from "@/constants/statuses";
import {
  emailSchema,
  isActiveSchema,
  nonEmptyStringSchema,
  nullableObjectIdSchema,
  objectIdSchema,
  patientStatusSchema,
  phoneSchema,
} from "@/validators/common";
import { paginationQuerySchema } from "@/validators/pagination";

/**
 * Zod contracts for Patient clinical / demographic fields and dashboard APIs.
 */

export const genderSchema = z.enum(GENDER_VALUES);
export const bloodGroupSchema = z.enum(BLOOD_GROUP_VALUES);
export const emergencyContactRelationshipSchema = z.enum(
  EMERGENCY_CONTACT_RELATIONSHIP_VALUES,
);

export const patientAddressSchema = z.object({
  line1: nonEmptyStringSchema.max(200),
  line2: z.string().trim().max(200).nullable().optional(),
  city: nonEmptyStringSchema.max(100),
  state: nonEmptyStringSchema.max(100),
  postalCode: nonEmptyStringSchema.max(20),
  country: z
    .string()
    .trim()
    .length(2, "country must be a 2-letter ISO code")
    .transform((value) => value.toUpperCase())
    .default(DEFAULT_ADDRESS_COUNTRY),
});

export const allergySchema = nonEmptyStringSchema.max(120);
export const chronicConditionSchema = nonEmptyStringSchema.max(120);

function refineEmergencyContact(
  value: {
    emergencyContactName?: string | null;
    emergencyContactPhone?: string | null;
  },
  ctx: z.RefinementCtx,
) {
  const name = value.emergencyContactName;
  const phone = value.emergencyContactPhone;
  const hasName = name != null && name !== "";
  const hasPhone = phone != null && phone !== "";

  if (hasName !== hasPhone) {
    ctx.addIssue({
      code: "custom",
      message:
        "emergencyContactName and emergencyContactPhone must be provided together",
      path: ["emergencyContactPhone"],
    });
  }
}

export const createPatientSchema = z
  .object({
    userId: nullableObjectIdSchema.optional(),
    fullName: nonEmptyStringSchema.max(120),
    phone: phoneSchema,
    email: emailSchema.nullable().optional(),
    gender: genderSchema.nullable().optional(),
    dateOfBirth: z.coerce
      .date()
      .max(new Date(), "dateOfBirth cannot be in the future")
      .nullable()
      .optional(),
    bloodGroup: bloodGroupSchema.nullable().optional(),
    address: patientAddressSchema.nullable().optional(),
    emergencyContactName: z.string().trim().max(120).nullable().optional(),
    emergencyContactPhone: phoneSchema.nullable().optional(),
    relationship: emergencyContactRelationshipSchema.nullable().optional(),
    allergies: z.array(allergySchema).max(50).optional(),
    chronicConditions: z.array(chronicConditionSchema).max(50).optional(),
    medicalNotes: z.string().trim().max(10_000).nullable().optional(),
    status: patientStatusSchema.default(PATIENT_STATUSES.ACTIVE),
    isActive: isActiveSchema.optional(),
  })
  .superRefine(refineEmergencyContact);

export const updatePatientSchema = z
  .object({
    userId: z.union([objectIdSchema, z.null()]).optional(),
    fullName: nonEmptyStringSchema.max(120).optional(),
    phone: phoneSchema.optional(),
    email: emailSchema.nullable().optional(),
    gender: genderSchema.nullable().optional(),
    dateOfBirth: z.coerce
      .date()
      .max(new Date(), "dateOfBirth cannot be in the future")
      .nullable()
      .optional(),
    bloodGroup: bloodGroupSchema.nullable().optional(),
    address: patientAddressSchema.nullable().optional(),
    emergencyContactName: z.string().trim().max(120).nullable().optional(),
    emergencyContactPhone: phoneSchema.nullable().optional(),
    relationship: emergencyContactRelationshipSchema.nullable().optional(),
    allergies: z.array(allergySchema).max(50).optional(),
    chronicConditions: z.array(chronicConditionSchema).max(50).optional(),
    medicalNotes: z.string().trim().max(10_000).nullable().optional(),
    status: patientStatusSchema.optional(),
    isActive: isActiveSchema.optional(),
  })
  .strict()
  .superRefine(refineEmergencyContact);

export type CreatePatientInput = z.infer<typeof createPatientSchema>;
export type UpdatePatientInput = z.infer<typeof updatePatientSchema>;
export type PatientAddressInput = z.infer<typeof patientAddressSchema>;

/** Active-status filter for dashboard patient lists. */
export const patientActiveFilterSchema = z.enum(["active", "inactive", "all"]);

export const patientIdParamSchema = z.object({
  id: objectIdSchema,
});

export const patientListQuerySchema = paginationQuerySchema.extend({
  /** Filter by Active / Inactive chart status. Defaults to all. */
  status: patientActiveFilterSchema.default("all"),
});

/** Dashboard edit of basic contact information only. */
export const updatePatientContactSchema = z.object({
  fullName: nonEmptyStringSchema.max(120),
  phone: phoneSchema,
  email: z.union([emailSchema, z.literal(""), z.null()]).transform((value) => {
    if (value === "" || value == null) {
      return null;
    }
    return value;
  }),
});

/** Mark patient Active / Inactive (no archive/delete from this surface). */
export const updatePatientActiveStatusSchema = z.object({
  status: z.enum([PATIENT_STATUSES.ACTIVE, PATIENT_STATUSES.INACTIVE]),
});

export const patientAppointmentHistoryQuerySchema = paginationQuerySchema;

export type PatientListQuery = z.infer<typeof patientListQuerySchema>;
export type UpdatePatientContactInput = z.infer<
  typeof updatePatientContactSchema
>;
export type UpdatePatientActiveStatusInput = z.infer<
  typeof updatePatientActiveStatusSchema
>;
export type PatientAppointmentHistoryQuery = z.infer<
  typeof patientAppointmentHistoryQuerySchema
>;

