import { z } from "zod";

import {
  APPOINTMENT_STATUS_VALUES,
  CONTENT_STATUS_VALUES,
  DOCTOR_STATUS_VALUES,
  PATIENT_STATUS_VALUES,
  PRESCRIPTION_STATUS_VALUES,
  SLOT_STATUS_VALUES,
  USER_ROLE_VALUES,
} from "@/constants";

/** MongoDB ObjectId hex string. */
export const objectIdSchema = z
  .string()
  .regex(/^[a-f\d]{24}$/i, "Invalid ObjectId");

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

export const userRoleSchema = z.enum(USER_ROLE_VALUES);
export const appointmentStatusSchema = z.enum(APPOINTMENT_STATUS_VALUES);
export const slotStatusSchema = z.enum(SLOT_STATUS_VALUES);
export const prescriptionStatusSchema = z.enum(PRESCRIPTION_STATUS_VALUES);
export const doctorStatusSchema = z.enum(DOCTOR_STATUS_VALUES);
export const patientStatusSchema = z.enum(PATIENT_STATUS_VALUES);
export const contentStatusSchema = z.enum(CONTENT_STATUS_VALUES);
