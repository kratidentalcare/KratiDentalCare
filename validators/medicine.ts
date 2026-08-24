import { z } from "zod";

import { MEDICINE_STATUSES, MEDICINE_STATUS_VALUES } from "@/constants/statuses";
import {
  medicineStatusSchema,
  nonEmptyStringSchema,
  objectIdSchema,
} from "@/validators/common";
import { paginationQuerySchema } from "@/validators/pagination";

const optionalText = (max: number) =>
  z
    .string()
    .trim()
    .max(max)
    .nullable()
    .optional()
    .transform((value) => (value == null || value === "" ? null : value));

export const medicineStatusFilterSchema = z.enum([
  "all",
  ...MEDICINE_STATUS_VALUES,
]);

export const createMedicineActionSchema = z.object({
  name: nonEmptyStringSchema.max(200),
  genericName: optionalText(200),
  dosage: nonEmptyStringSchema.max(200),
  frequency: nonEmptyStringSchema.max(200),
  duration: nonEmptyStringSchema.max(200),
  instructions: optionalText(200),
  notes: optionalText(2000),
});

export const updateMedicineActionSchema = createMedicineActionSchema;

export const medicineListQuerySchema = paginationQuerySchema.extend({
  status: medicineStatusFilterSchema.default("all"),
});

export const searchMedicinesQuerySchema = z.object({
  query: z.string().trim().max(200).optional().default(""),
  limit: z.coerce.number().int().min(1).max(20).optional().default(10),
});

export const medicineIdSchema = z.object({
  id: objectIdSchema,
});

export const medicineCatalogItemSchema = z.object({
  id: objectIdSchema,
  name: nonEmptyStringSchema.max(200),
  genericName: z.string().trim().max(200).nullable(),
  dosage: nonEmptyStringSchema.max(200),
  frequency: nonEmptyStringSchema.max(200),
  duration: nonEmptyStringSchema.max(200),
  instructions: z.string().trim().max(200).nullable(),
  status: medicineStatusSchema.default(MEDICINE_STATUSES.ACTIVE),
});

export type CreateMedicineActionInput = z.infer<
  typeof createMedicineActionSchema
>;
export type UpdateMedicineActionInput = z.infer<
  typeof updateMedicineActionSchema
>;
export type MedicineListQuery = z.infer<typeof medicineListQuerySchema>;
export type SearchMedicinesQuery = z.infer<typeof searchMedicinesQuerySchema>;
