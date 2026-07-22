import { z } from "zod";

import {
  APPOINTMENT_STATUS_VALUES,
  CONTACT_MESSAGE_STATUS_VALUES,
  CONTENT_STATUS_VALUES,
  DOCTOR_STATUS_VALUES,
  OBJECT_ID_HEX_PATTERN,
  PATIENT_STATUS_VALUES,
  PRESCRIPTION_STATUS_VALUES,
  SLOT_STATUS_VALUES,
  USER_ROLE_VALUES,
} from "@/constants";

/** MongoDB ObjectId hex string (API / Server Action boundary). */
export const objectIdSchema = z
  .string()
  .regex(OBJECT_ID_HEX_PATTERN, "Invalid ObjectId");

/** Optional ObjectId that also accepts `null` / empty → `null`. */
export const nullableObjectIdSchema = z
  .union([objectIdSchema, z.literal(""), z.null()])
  .transform((value) => (value === "" || value === null ? null : value));

/** Non-empty list of ObjectIds (dedupe left to callers if needed). */
export const objectIdArraySchema = z.array(objectIdSchema).min(1);

export const emailSchema = z
  .email("Invalid email address")
  .max(320)
  .transform((value) => value.trim().toLowerCase());

/** Lightweight phone check — refine per locale in feature validators later. */
export const phoneSchema = z
  .string()
  .trim()
  .min(7, "Phone number is too short")
  .max(20, "Phone number is too long")
  .regex(/^[+]?[\d\s()-]+$/, "Invalid phone number");

export const nonEmptyStringSchema = z.string().trim().min(1, "Required");

export const isoDateStringSchema = z.iso.datetime({
  message: "Invalid ISO date-time",
});

/** Soft-delete timestamp from persistence (ISO or Date coerced by callers). */
export const deletedAtSchema = z.union([
  z.iso.datetime(),
  z.null(),
]);

export const isActiveSchema = z.boolean();

export const userRoleSchema = z.enum(USER_ROLE_VALUES);
export const appointmentStatusSchema = z.enum(APPOINTMENT_STATUS_VALUES);
export const slotStatusSchema = z.enum(SLOT_STATUS_VALUES);
export const prescriptionStatusSchema = z.enum(PRESCRIPTION_STATUS_VALUES);
export const doctorStatusSchema = z.enum(DOCTOR_STATUS_VALUES);
export const patientStatusSchema = z.enum(PATIENT_STATUS_VALUES);
export const contentStatusSchema = z.enum(CONTENT_STATUS_VALUES);
export const contactMessageStatusSchema = z.enum(CONTACT_MESSAGE_STATUS_VALUES);
